import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const moduleSource=readFileSync('server/telegram-webhook/review.ts','utf8');
const executable=stripTypeScriptTypes(moduleSource.replace(/^export /gm,''));
const admin=41101111,visitor=49901111;
const signals=new Map([[17,{id:17,player_id:'mock-player',event_kind:'regular_cadence_high_accuracy',
 review_status:'pending',evidence:{sample:30,accuracy_percent:96.7,mean_interval_seconds:4.2,interval_cv:.03,sessions:3},
 observations:2,first_seen:'2026-10-24T18:00:00Z',last_seen:'2026-10-24T18:10:00Z'}]]);
const audits=[],messages=[],calls=[];
const db={
 from(table){
  const where=new Map();
  const q={
   select(){return q},eq(k,v){where.set(k,v);return q},in(k,v){where.set(k,v);return q},
   order(){return q},
   async maybeSingle(){
    if(table==='app_config')return {data:{value:JSON.stringify([admin])},error:null};
    if(table==='bot_behavior_signals')return {data:signals.get(where.get('id'))||null,error:null};
    if(table==='players')return {data:{photoword_id:'QA-PLAYER'},error:null};
    throw Error('Unknown single '+table);
   },
   async limit(){
    if(table==='bot_behavior_review_history')return {data:audits.slice(-5).reverse(),error:null};
    if(table==='bot_behavior_signals')return {data:[...signals.values()].filter(s=>where.get('review_status').includes(s.review_status)),error:null};
    throw Error('Unknown limit '+table);
   },
   then(resolve){
    if(table==='players'&&where.has('id'))resolve({data:[{id:'mock-player',photoword_id:'QA-PLAYER'}],error:null});
    else throw Error('Unexpected query '+table);
   }
  };
  return q;
 },
 async rpc(name,args){
  calls.push(name);
  assert.equal(name,'review_bot_behavior_signal_server','UI must never call game/payout RPC');
  if(args.p_reviewer_telegram_id!==admin)return {data:{ok:false,reason:'forbidden'},error:null};
  const s=signals.get(args.p_signal_id);
  if(!s)return {data:{ok:false,reason:'not_found'},error:null};
  if(s.review_status!==args.p_expected_status)return {data:{ok:false,reason:'stale'},error:null};
  const expected=s.review_status;
  if(expected===args.p_new_status)return {data:{ok:false,reason:'unchanged'},error:null};
  s.review_status=args.p_new_status;
  audits.push({previous_status:expected,new_status:s.review_status,note:args.p_note,created_at:new Date().toISOString()});
  return {data:{ok:true,current_status:s.review_status},error:null};
 }
};
const telegram=async(_token,method,body)=>{
 messages.push({method,body});
 return {ok:true};
};
const ctx={Map,Set,Number,String,JSON,Date,Array,Math,Promise,console};
vm.createContext(ctx);
vm.runInContext(executable+'\nglobalThis.reviewQA={handleReviewCommand,handleReviewCallback};',ctx);
const {handleReviewCommand,handleReviewCallback}=ctx.reviewQA;
const run=(person,cmd,text)=>handleReviewCommand(db,'bot-token',telegram,person,person,cmd,text);
let ok=await run(visitor,'/anticheat','/anticheat');
assert.equal(ok,true);
assert(messages.at(-1).body.text.includes('закрыт'));
assert.equal(calls.length,0,'Non-admin must not access decision RPC');
await run(admin,'/anticheat','/anticheat');
assert(messages.at(-1).body.text.includes('QA-PLAYER'));
assert(messages.at(-1).body.reply_markup.inline_keyboard.length===1);
await run(admin,'/case','/case 17');
assert(messages.at(-1).body.text.includes('96.7%'));
assert(messages.at(-1).body.text.includes('НЕ является доказательством'));
const card=messages.at(-1).body;
assert(card.reply_markup.inline_keyboard.some(row=>row[0].callback_data==='ac:i:17:p'));
async function click(person,data){
 return handleReviewCallback(db,'bot-token',telegram,{
  id:'offline-click',data,from:{id:person},
  message:{message_id:100,chat:{id:person,type:'private'}}
 });
}
await click(visitor,'ac:d:17:p');
assert.equal(signals.get(17).review_status,'pending');
await click(admin,'ac:i:17:p');
assert.equal(signals.get(17).review_status,'in_review');
assert.equal(audits.length,1);
await click(admin,'ac:d:17:p');
assert.equal(signals.get(17).review_status,'in_review','Stale card cannot dismiss');
await run(admin,'/case_decide','/case_decide 17 dismissed Играл честно');
assert.equal(signals.get(17).review_status,'dismissed');
assert.equal(audits.at(-1).note,'Играл честно');
await click(admin,'ac:p:17:d');
assert.equal(signals.get(17).review_status,'pending','Admin can correct mistaken decisions');
await click(admin,'ac:r:17:p');
assert.equal(signals.get(17).review_status,'reviewed');
assert.equal(audits.length,4);
assert(messages.some(m=>m.method==='answerCallbackQuery'&&m.body.show_alert===true),'Stale action should show a warning');
assert(messages.some(m=>m.method==='editMessageReplyMarkup'),'Successful change should clear stale action buttons');
assert(!calls.some(x=>x!=='review_bot_behavior_signal_server'),'Moderation cannot invoke punishment actions');
console.log('PASS: admin-only list, evidence detail, inline review, stale-button rejection, notes, safe dismissal and reversible no-sanction decisions.');
