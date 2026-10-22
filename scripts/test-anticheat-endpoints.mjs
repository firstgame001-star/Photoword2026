import assert from 'node:assert/strict';
const endpoint='https://bqoraxewpcnmidvjlpuy.supabase.co';
const forged= new URLSearchParams({auth_date:String(Math.floor(Date.now()/1000)),user:JSON.stringify({id:999999999,first_name:'CI'}),hash:'0'.repeat(64)}).toString();
for(const fn of ['telegram-login','duel-game','challenge-game']){
  const response=await fetch(endpoint+'/functions/v1/'+fn,{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({action:'state',initData:forged}),
    signal:AbortSignal.timeout(15000)
  });
  assert.equal(response.status,401,fn+' accepted forged Telegram credentials: '+response.status);
  console.log('PASS:',fn,'rejects forged Telegram authentication');
}
for(const fn of ['duel-game','challenge-game']){
 const r=await fetch(endpoint+'/functions/v1/'+fn,{
   method:'POST',headers:{'content-type':'application/json','Origin':'https://attacker.invalid'},
   body:JSON.stringify({action:'state',initData:forged}),
   signal:AbortSignal.timeout(15000)
 });
 assert.equal(r.status,403,fn+' allowed hostile browser origin');
}
const core=(await import('node:fs')).readFileSync('clean/core.js','utf8');
const match=core.match(/const KEY\s*=\s*'([^']+)'/);
assert(match,'Public publishable API key not found in client configuration');
for(const rpc of ['complete_level_server','duel_submit','finish_challenge_run_server']){
 const r=await fetch(endpoint+'/rest/v1/rpc/'+rpc,{
    method:'POST',headers:{'apikey':match[1],'Authorization':'Bearer '+match[1],'Content-Type':'application/json'},
    body:JSON.stringify({}),signal:AbortSignal.timeout(15000)
 });
 assert.notEqual(r.status,200,rpc+' is exposed to public DB callers');
 console.log('PASS:',rpc,'cannot be used from public Supabase role ('+r.status+')');
}
console.log('PASS: unauthorized access and forged identity live API regression tests.');
