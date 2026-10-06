import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
const sessions=new Map(),tickets=[],sent=[];let failInsert=false,failSession=false,failSend=false,admins=[];
function query(table){let op='select',values,eqKey,eqValue;const q={select(){return q},eq(k,v){eqKey=k;eqValue=v;return q},neq(){return q},order(){return q},limit(){return q},upsert(v){op='upsert';values=v;return q},insert(v){op='insert';values=v;return q},update(v){op='update';values=v;return q},single(){return q},maybeSingle(){return q},then(resolve){let data=null,error=null;
if(table==='players')data={id:'qa-player',notification_language:'en'};
if(table==='app_config')data={value:JSON.stringify(admins)};
if(table==='bot_support_sessions'){if(failSession&&op==='upsert')error={message:'offline'};else if(op==='upsert')sessions.set(values.telegram_id,values);else if(op==='update')sessions.set(eqValue,{...sessions.get(eqValue),...values});else data=sessions.get(eqValue)||null;}
if(table==='support_tickets'){if(op==='insert'){if(failInsert)error={message:'offline'};else {data={...values,id:tickets.length+1,status:'open'};tickets.push(data)}}else if(op==='update'){const t=tickets.find(t=>t.id===eqValue);if(t)Object.assign(t,values)}else data=eqKey==='id'?tickets.find(t=>t.id===eqValue):tickets;}
resolve({data,error});}};return q;}
let handler;const ctx={Deno:{env:{get:k=>({TELEGRAM_BOT_TOKEN:'test-only',SUPABASE_URL:'https://test.invalid',SUPABASE_SERVICE_ROLE_KEY:'fake'})[k]},serve:fn=>handler=fn},createClient:()=>({from:query}),fetch:async(url,options)=>{sent.push({method:url.split('/').at(-1),...JSON.parse(options.body)});return {json:async()=>({ok:!failSend})}},crypto:webcrypto,TextEncoder,Response,Request,console};
const source=readFileSync('server/telegram-webhook/index.ts','utf8').replace(/^import .*;\n/gm,'');vm.runInNewContext(stripTypeScriptTypes(source),ctx);
const hash=await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode('test-only'));const secret='pw_'+Buffer.from(hash).toString('hex').slice(0,48);
async function message(text,extra={}){return handler(new Request('https://test.invalid',{method:'POST',headers:{'x-telegram-bot-api-secret-token':secret},body:JSON.stringify({message:{message_id:1,from:{id:42,language_code:'en'},chat:{id:42,type:'private'},text,...extra}})}));}
const denied=await handler(new Request('https://test.invalid',{method:'POST',body:'{}'}));assert.equal(denied.status,403);
await message('/support');assert(sessions.get(42).active);assert(sent.at(-1).text.includes('Describe'));
failInsert=true;await message('Payment missing');assert.equal(tickets.length,0);assert(sessions.get(42).active);assert(sent.at(-1).text.includes('not been accepted'));
failInsert=false;await message('Payment missing',{photo:[{file_id:'test-photo'}]});assert.equal(tickets.length,1);assert(tickets[0].message.includes('test-photo'));assert(!sessions.get(42).active);assert(sent.at(-1).text.includes('#1'));
await message('/paysupport');assert(sessions.get(42).active);await message('/cancel');assert(!sessions.get(42).active);
await message('/privacy');assert(sent.at(-1).text.endsWith('privacy.html?lang=en'));await message('/terms');assert(sent.at(-1).text.endsWith('terms.html?lang=en'));
await message('/support');await message('/start');assert(!sessions.get(42).active);
await message('/reply 1 Hello');assert(sent.at(-1).text.includes('denied'));assert.equal(tickets[0].status,'open');
admins=[42];failSend=true;await message('/reply 1 Hello');assert.equal(tickets[0].status,'open');failSend=false;await message('/reply 1 Hello');assert.equal(tickets[0].status,'answered');assert(sent.some(s=>s.text==='PhotoWord · #1\nHello'));
failSession=true;await message('/support');assert(sent.at(-1).text.includes('not been accepted'));
failSession=false;await message('/start support_ru');assert(sent.at(-1).text.includes('Опиши'));await message('/start paysupport_az');assert(sent.at(-1).text.includes('Problemi'));
console.log('PASS: webhook authentication, localized support, screenshots, save failures, cancel, legal links, private staff authorization, failed delivery and reply status. No real messages sent.');
