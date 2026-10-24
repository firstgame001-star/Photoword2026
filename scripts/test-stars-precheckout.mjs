// Offline Telegram Stars pre-checkout regressions. No real bot requests or charges.
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';

const sent=[];
const state={energy:3,refAt:new Date().toISOString(),reused:false,dbError:false,creditError:false,creditCalls:0,refundStatus:'applied',refundRpcError:false,refunded:false,lastRefundArgs:null};
function result(data){return {data,error:state.dbError?{message:'db_unavailable'}:null};}
function query(table){
  const q={
    select(){return q},
    eq(){return q},
    limit(){return Promise.resolve(result(table==='challenge_energy_purchases'&&state.reused?[{id:'already-paid'}]:[]))},
    maybeSingle(){
      if(table==='players')return Promise.resolve(result({id:'test-player'}));
      if(table==='challenge_profiles')return Promise.resolve(result({limited_energy:state.energy,energy_ref_at:state.refAt}));
      if(table==='star_refunds')return Promise.resolve(result(state.refunded?{status:'pending'}:null));
      return Promise.resolve(result(null));
    }
  };
  return q;
}
let handler;
const ctx={
  Deno:{env:{get:key=>({TELEGRAM_BOT_TOKEN:'offline-only',SUPABASE_URL:'https://invalid.local',SUPABASE_SERVICE_ROLE_KEY:'fake'})[key]},serve:fn=>handler=fn},
  createClient:()=>({from:query,rpc:async(name,args)=>{
    state.creditCalls++;
    if(name==='register_star_refund_server'){
      state.lastRefundArgs=args;
      return {data:{status:state.refundStatus,kind:'coins'},error:state.refundRpcError?{message:'refund unavailable'}:null};
    }
    return {data:{},error:state.creditError?{message:"offline"}:null};
  }}),
  fetch:async(url,options)=>{const method=url.split('/').at(-1);sent.push({method,...JSON.parse(options.body)});return {json:async()=>({ok:true})}},
  crypto:webcrypto,TextEncoder,Date,Math,Number,Response,Request,console
};
let source=readFileSync('server/telegram-webhook/index.ts','utf8');
source=source.replace(/^import .*;\n/gm,'');
vm.runInNewContext(stripTypeScriptTypes(source),ctx);
const digest=await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode('offline-only'));
const secret='pw_'+Buffer.from(digest).toString('hex').slice(0,48);
let serial=0,lastDenial='';
async function checkout(invoice_payload,total_amount=15,currency='XTR',buyer=42){
  sent.length=0;
  const request=new Request('https://invalid.local',{method:'POST',headers:{'x-telegram-bot-api-secret-token':secret},body:JSON.stringify({
    pre_checkout_query:{id:'offline-'+(++serial),currency,total_amount,invoice_payload,from:{id:buyer}}
  })});
  const response=await handler(request);
  assert.equal(response.status,200);
  const answers=sent.filter(x=>x.method==='answerPreCheckoutQuery');
  assert.equal(answers.length,1,'Every pre-checkout must receive one answer');
  lastDenial=answers[0].error_message||'';
  return answers[0].ok;
}
const energy='pwenergy:e1:42:az:6d5b1c7c-abcd-4321-a234-123456789abc';
assert.equal(await checkout(energy),true,'Energy with remaining capacity must be purchasable');
state.reused=true;
assert.equal(await checkout(energy),false,'Already paid energy invoice must be rejected');
assert(lastDenial.includes('artıq ödənilib'),'Already-used invoice error must use chosen Azerbaijani locale');
state.reused=false;
state.energy=5;
assert.equal(await checkout(energy),false,'Cannot charge for already full energy');
assert(lastDenial.includes('Enerji artıq doludur'),'Full energy error must use chosen Azerbaijani locale');
state.energy=3;state.refAt=new Date(Date.now()-65*60_000).toISOString();
assert.equal(await checkout(energy),false,'Regenerated full energy must reject checkout');
state.refAt=new Date().toISOString();
state.dbError=true;
assert.equal(await checkout(energy),false,'Database outage must fail closed');
state.dbError=false;
assert.equal(await checkout(energy,14),false,'Wrong price must fail');
assert.equal(await checkout(energy,15,'USD'),false,'Wrong currency must fail');
assert.equal(await checkout(energy,15,'XTR',43),false,'Different Telegram buyer must fail');
const coins='pwcoins:c10:42:ru:6d5b1c7c-abcd-4321-a234-123456789abc';
assert.equal(await checkout(coins),true,'Valid coin checkout must remain available');
assert.equal(await checkout(coins,1),false,'Forged cheaper coin pack must fail');

// A paid Telegram receipt must NOT be acknowledged when credit RPC fails.
// A non-2xx response allows Telegram to retry the same idempotent receipt.
async function paid(kind){
  sent.length=0;
  const isCoin=kind==='coins';
  const invoice_payload=isCoin?coins:energy;
  const successful_payment={
    currency:'XTR',total_amount:isCoin?15:15,invoice_payload,telegram_payment_charge_id:'OFFLINE-'+kind
  };
  const response=await handler(new Request('https://invalid.local',{method:'POST',headers:{'x-telegram-bot-api-secret-token':secret},body:JSON.stringify({
    message:{message_id:1,chat:{id:42,type:'private'},from:{id:42},successful_payment}
  })}));
  return response.status;
}
state.creditError=true;
assert.equal(await paid('coins'),503,'Failed coin fulfillment must request retry');
assert(!sent.some(x=>x.method==='sendMessage'),'Failed credit must not announce success');
assert.equal(await paid('energy'),503,'Failed energy fulfillment must request retry');
state.creditError=false;
assert.equal(await paid('coins'),200,'Successful coin fulfillment must acknowledge receipt');
assert(sent.some(x=>x.method==='sendMessage'&&x.text.includes('Начислено')),'Coin confirmation must be localized');
assert.equal(await paid('energy'),200,'Successful energy fulfillment must acknowledge receipt');
assert(sent.some(x=>x.method==='sendMessage'&&x.text.includes('Enerji')),'Energy confirmation must be localized in AZ');


// Telegram's refunded_payment is a service message, not a bot command.
async function refunded(invoice_payload=coins,charge='OFFLINE-refund',stars=15){
  sent.length=0;
  const response=await handler(new Request('https://invalid.local',{method:'POST',
    headers:{'x-telegram-bot-api-secret-token':secret},
    body:JSON.stringify({message:{message_id:9,chat:{id:42,type:'private'},from:{id:42},
      refunded_payment:{currency:'XTR',invoice_payload,telegram_payment_charge_id:charge,total_amount:stars}}})}));
  return response.status;
}
assert.equal(await refunded(),200,'Valid refund update must be accepted');
assert.equal(state.lastRefundArgs.p_charge_id,'OFFLINE-refund');
assert.equal(state.lastRefundArgs.p_stars,15);
assert(sent.some(x=>x.method==='sendMessage'&&x.text.includes('возвращены')),'Localized refund confirmation must be sent');
assert.equal(await refunded(energy,'OFFLINE-energy-refund',15),200,'Energy refund update must be accepted');
assert(sent.some(x=>x.method==='sendMessage'&&x.text.includes('geri qaytarıldı')),'Energy refund notice must inherit Azerbaijani checkout locale');
state.refundStatus='duplicate';
assert.equal(await refunded(),200,'Duplicate refund should acknowledge');
assert(!sent.some(x=>x.method==='sendMessage'),'Duplicate refund must not notify twice');
state.refundStatus='applied';state.refundRpcError=true;
assert.equal(await refunded(),503,'Failed refund reconciliation must request webhook retry');
state.refundRpcError=false;
state.refunded=true;
const before=state.creditCalls;
assert.equal(await paid('coins'),200,'Out-of-order refunded receipt should be safely acknowledged');
assert.equal(state.creditCalls,before,'Already refunded charge must not be credited again');
assert(!sent.some(x=>x.method==='sendMessage'),'Refunded receipt must not trigger payment success notification');
state.refunded=false;
console.log('PASS: energy checkout limits, duplicate refunds, failed refund retries, out-of-order updates and coin/energy payment handling (mocked).');
