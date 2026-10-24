// Offline tests: no Telegram messages, real admin identities or database writes.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';

const original=readFileSync('server/bot-alert-dispatch/index.ts','utf8');
assert(original.includes('x-pw-notification-secret'),'Private notification secret must be checked');
assert(original.includes('claim_bot_alert_delivery_server'),'Outbox lease missing');
assert(original.includes('finish_bot_alert_delivery_server'),'Delivery acknowledgement missing');
assert(!original.includes('Deno.env.get("TELEGRAM_ADMIN_ID")'),'Admin list must come from server configuration');
let handler;
const adminIds=[700100001,700100002],sent=[],outbox=new Map();
let forceTelegramError=false;
let signals=[{
 id:41,player_id:'test-player',event_kind:'regular_cadence_high_accuracy',
 first_seen:'2026-10-24T18:00:00Z',review_status:'pending',
 evidence:{sample:30,accuracy_percent:100,mean_interval_seconds:4,sessions:2}
}];
const response=(data)=>({data,error:null});
function query(table){
 const q={
  select(){return q},eq(){return q},gte(){return q},order(){return q},
  in(field){
   return Promise.resolve(response(table==='app_config'?[
    {key:'notification_dispatch_secret',value:'offline-only'},
    {key:'support_admin_telegram_ids',value:JSON.stringify(adminIds)}
   ]:table==='players'?[{id:'test-player',photoword_id:'PW-QA-EXAMPLE'}]:[]));
  },
  limit(){return Promise.resolve(response(signals))}
 };
 return q;
}
const fakeDb={
 from:query,
 async rpc(name,args){
  const key=args.p_signal_id+':'+args.p_admin_id;
  if(name==='claim_bot_alert_delivery_server'){
   if(outbox.has(key)||!signals.some(s=>s.id===args.p_signal_id&&s.review_status==='pending'))
    return response(null);
   const token='00000000-0000-4000-8000-'+String(args.p_admin_id).padStart(12,'0');
   outbox.set(key,{token,status:'processing'});
   return response(token);
  }
  if(name==='finish_bot_alert_delivery_server'){
   const row=outbox.get(key);
   if(!row||row.token!==args.p_claim_token||row.status!=='processing')return response(false);
   row.status=args.p_sent?'sent':'retry';
   return response(true);
  }
  throw Error('Unknown RPC '+name);
 }
};
const context={
 Deno:{env:{get:k=>({SUPABASE_URL:'https://example.invalid',SUPABASE_SERVICE_ROLE_KEY:'offline',TELEGRAM_BOT_TOKEN:'offline-token'})[k]},
  serve:fn=>handler=fn},
 createClient:()=>fakeDb,
 fetch:async(url,opts)=>{
  assert(url.includes('/sendMessage'),'Only Telegram sendMessage may be called');
  const body=JSON.parse(opts.body);
  sent.push(body);
  return {ok:!forceTelegramError,status:forceTelegramError?503:200,
   json:async()=>({ok:!forceTelegramError})};
 },
 Request,Response,AbortSignal,Map,Set,Date,Number,String,JSON,Math,Array,console
};
const source=stripTypeScriptTypes(original.replace(/^import .*;\n/gm,''));
vm.runInNewContext(source,context);
assert.equal(typeof handler,'function');
async function call(method='POST',secret='offline-only'){
 const headers={'content-type':'application/json'};
 if(secret!==null)headers['x-pw-notification-secret']=secret;
 const req=new Request('https://example.invalid/functions/v1/bot-alert-dispatch',
  {method,headers,...(method==='POST'?{body:'{}'}:{})});
 const result=await handler(req);
 return {status:result.status,body:await result.json()};
}
assert.equal((await call('GET')).status,405);
assert.equal((await call('POST',null)).status,403);
assert.equal((await call('POST','forged')).status,403);
assert.equal(sent.length,0,'Unauthorized callers must not cause a Telegram send');
let result=await call();
assert.equal(result.status,200);
assert.equal(result.body.sent,2,'Every configured admin should receive an alert');
assert.equal(sent.length,2);
assert(sent.every(x=>x.text.includes('PW-QA-EXAMPLE')&&x.text.includes('НЕ доказательство читерства')),'Notice must distinguish a signal from guilt');
assert(sent.every(x=>!x.text.includes('test-player')),'Internal player UUID should not leak');
result=await call();
assert.equal(result.body.sent,0,'Re-running dispatch must not notify twice');
assert.equal(sent.length,2,'Duplicate Telegram messages sent');
signals=[{...signals[0],id:42,event_kind:'sustained_unusual_accuracy'}];
forceTelegramError=true;
result=await call();
assert.equal(result.body.failed,2,'A Telegram failure must be recorded for retry');
assert.equal([...outbox.values()].filter(x=>x.status==='retry').length,2);
signals=[];
result=await call();
assert.equal(result.body.sent,0,'Empty scans must never send notifications');
console.log('PASS: private admin authentication, harmless security notices, multi-admin dispatch, deduplication, failed-send retry records, no real Telegram calls.');
