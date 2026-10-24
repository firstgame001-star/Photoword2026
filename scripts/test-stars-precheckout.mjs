// Offline Telegram Stars pre-checkout regressions. No real bot requests or charges.
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';

const sent=[];
const state={energy:3,refAt:new Date().toISOString(),reused:false,dbError:false};
function result(data){return {data,error:state.dbError?{message:'db_unavailable'}:null};}
function query(table){
  const q={
    select(){return q},
    eq(){return q},
    limit(){return Promise.resolve(result(table==='challenge_energy_purchases'&&state.reused?[{id:'already-paid'}]:[]))},
    maybeSingle(){
      if(table==='players')return Promise.resolve(result({id:'test-player'}));
      if(table==='challenge_profiles')return Promise.resolve(result({limited_energy:state.energy,energy_ref_at:state.refAt}));
      return Promise.resolve(result(null));
    }
  };
  return q;
}
let handler;
const ctx={
  Deno:{env:{get:key=>({TELEGRAM_BOT_TOKEN:'offline-only',SUPABASE_URL:'https://invalid.local',SUPABASE_SERVICE_ROLE_KEY:'fake'})[key]},serve:fn=>handler=fn},
  createClient:()=>({from:query}),
  fetch:async(url,options)=>{const method=url.split('/').at(-1);sent.push({method,...JSON.parse(options.body)});return {json:async()=>({ok:true})}},
  crypto:webcrypto,TextEncoder,Date,Math,Number,Response,Request,console
};
let source=readFileSync('server/telegram-webhook/index.ts','utf8');
source=source.replace(/^import .*;\n/gm,'');
vm.runInNewContext(stripTypeScriptTypes(source),ctx);
const digest=await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode('offline-only'));
const secret='pw_'+Buffer.from(digest).toString('hex').slice(0,48);
let serial=0;
async function checkout(invoice_payload,total_amount=15,currency='XTR',buyer=42){
  sent.length=0;
  const request=new Request('https://invalid.local',{method:'POST',headers:{'x-telegram-bot-api-secret-token':secret},body:JSON.stringify({
    pre_checkout_query:{id:'offline-'+(++serial),currency,total_amount,invoice_payload,from:{id:buyer}}
  })});
  const response=await handler(request);
  assert.equal(response.status,200);
  const answers=sent.filter(x=>x.method==='answerPreCheckoutQuery');
  assert.equal(answers.length,1,'Every pre-checkout must receive one answer');
  return answers[0].ok;
}
const energy='pwenergy:e1:42:az:6d5b1c7c-abcd-4321-a234-123456789abc';
assert.equal(await checkout(energy),true,'Energy with remaining capacity must be purchasable');
state.reused=true;
assert.equal(await checkout(energy),false,'Already paid energy invoice must be rejected');
state.reused=false;
state.energy=5;
assert.equal(await checkout(energy),false,'Cannot charge for already full energy');
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
console.log('PASS: energy invoice reuse, full/regenerated energy, database outage, amount/currency/buyer validation and coin checkout (fully mocked).');
