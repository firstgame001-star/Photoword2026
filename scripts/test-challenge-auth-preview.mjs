import assert from 'node:assert/strict';
const url='https://bqoraxewpcnmidvjlpuy.supabase.co/functions/v1/challenge-game-secure-preview';
const send=async(headers,body='{"action":"puzzle","initData":"invalid","mode":"blitz","runId":"00000000-0000-0000-0000-000000000000","questionId":0}')=>{
 const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...headers},body});
 return {status:r.status,body:await r.text()};
};
let r=await send({});
assert.equal(r.status,401,'Forged Telegram initData must be refused: '+r.body);
r=await send({'Origin':'https://attacker.invalid'});
assert.equal(r.status,403,'Untrusted Origin must be refused: '+r.body);
r=await send({},'x'.repeat(33000));
assert.equal(r.status,413,'Oversized request must be refused: '+r.body);
r=await fetch(url,{method:'GET'});
assert.equal(r.status,405,'Non-POST method must be refused');
console.log('PASS: deployed challenge preview refuses unsigned, cross-origin, oversized and wrong-method requests.');
