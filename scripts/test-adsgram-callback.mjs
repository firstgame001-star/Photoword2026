import assert from 'node:assert/strict';
// The only externally reachable AdsGram verification route must reject forged
// callbacks. All requests below omit any valid secret, target no real account,
// and cannot confirm or claim a reward.
const endpoint='https://bqoraxewpcnmidvjlpuy.supabase.co/functions/v1/adsgram-reward';
async function probe(query, method='GET'){
 const response=await fetch(endpoint+query,{method,signal:AbortSignal.timeout(20000),
   headers:{'Accept':'text/plain','Cache-Control':'no-cache'}});
 return {status:response.status,body:await response.text()};
}
const cases=[
  {query:'',expect:400,label:'missing Telegram user and secret'},
  {query:'?userid=0&s=invalid',expect:400,label:'invalid Telegram user'},
  {query:'?userid=999999999',expect:400,label:'missing callback secret'},
  {query:'?userid=999999999&s=definitely-invalid-reward-secret',expect:403,label:'forged callback'},
];
for(const c of cases){
 const r=await probe(c.query);
 assert.equal(r.status,c.expect,`AdsGram callback accepted ${c.label}: ${r.status} ${r.body.slice(0,180)}`);
 console.log('PASS: AdsGram callback rejects '+c.label+' ('+r.status+')');
}
const wrongMethod=await probe('?userid=999999999&s=invalid','POST');
assert.equal(wrongMethod.status,405,'AdsGram callback accepted unexpected HTTP method');
console.log('PASS: AdsGram reward callback rejects non-GET requests; no real reward or provider completion was simulated.');
