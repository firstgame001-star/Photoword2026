import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// These are two isolated browser-like clients sharing a single authoritative mock
// server. They never send requests to real users or change production coins.
const raw = readFileSync('clean/duel.js','utf8');
assert(raw.includes('window.PWDuel'), 'Could not find duel entrypoint');
const source=raw.replace(/\}\)\(\);\s*$/, [
  "window.duelTest={",
  "set(d){duel=d;code=d.code;questionId=null;chosen=[];disabled=false;answering=false;render()},",
  "snapshot:()=>duel, state, submit, clearLetters, render, syncReactions,",
  "type(indexes){for(const i of indexes){const e=$('duelLetters').children[i];if(!e||!e.onclick)throw Error('Missing interactive letter');e.onclick()}},",
  "chosen:()=>[...chosen],",
  "};})();"
].join(''));

const words=[
  {ru:'КОТ',en:'CAT',ruLetters:['К','О','Т','Л'],enLetters:['C','A','T','Z']},
  {ru:'ДОМ',en:'HOME',ruLetters:['Д','О','М','Н'],enLetters:['H','O','M','E','X']},
  {ru:'ЛЕС',en:'WOOD',ruLetters:['Л','Е','С','Р'],enLetters:['W','O','O','D','Y']}
];
const room={code:'ABCDEF1234567890',stake:25,status:'waiting',index:{A:0,B:0},score:{A:0,B:0},
  coins:{A:200,B:200},reaction:{A:null,B:null},reactionAt:{A:null,B:null},
  started:false,settled:false,payouts:0,answerCalls:{A:0,B:0},skipCalls:0,skips:{A:0,B:0}};
const clients={};
const lang={A:'ru',B:'en'};
const iso=()=>new Date().toISOString();
const starts=()=>new Date(Date.now()-2000).toISOString();
const ends=()=>new Date(Date.now()+60000).toISOString();
let startsAt=starts(),endsAt=ends();
function snapshot(id){
  const other=id==='A'?'B':'A', i=room.index[id], w=words[i] || words[words.length-1];
  const l=lang[id], letters=l==='ru'?w.ruLetters:w.enLetters;
  const question=room.status==='active'&&i<words.length?
    {photos:['🐈','🐾','🧶','🥛'],length:Array.from(w[l]).length,letters:[...letters]}:null;
  return {code:room.code,stake:room.stake,status:room.status,language:l,
    creator:id==='A',my_name:id==='A'?'Игрок A':'Player B',
    their_name:id==='A'?'Player B':'Игрок A',
    my_completed_levels:50,their_completed_levels:50,
    question_id:question?i+1:null,question,starts_at:startsAt,ends_at:endsAt,
    my_score:room.score[id],their_score:room.score[other],skips_left:3-room.skips[id],
    my_reaction:room.reaction[id],my_reaction_at:room.reactionAt[id],
    their_reaction:room.reaction[other],their_reaction_at:room.reactionAt[other],
    won:room.status==='finished'&&room.score[id]>room.score[other],
    draw:room.status==='finished'&&room.score[id]===room.score[other],
    payout:room.status==='finished'&&room.score[id]>room.score[other]?45:0};
}
async function rpc(id,action,data={}){
  if(action==='create'){
    assert.equal(id,'A');assert.equal(data.stake,25);assert.equal(data.language,'ru');
    room.coins.A-=25;return {duel:snapshot(id),server_now:iso()};
  }
  if(action==='join'){
    assert.equal(id,'B');assert.equal(data.code,room.code);assert.equal(data.language,'en');
    assert.equal(room.status,'waiting');
    room.coins.B-=25;room.status='active';room.started=true;return {duel:snapshot(id),server_now:iso()};
  }
  if(action==='state')return {duel:snapshot(id),server_now:iso()};
  if(action==='reactions')return {reactions:{
    my_reaction:room.reaction[id],my_reaction_at:room.reactionAt[id],
    their_reaction:room.reaction[id==='A'?'B':'A'],their_reaction_at:room.reactionAt[id==='A'?'B':'A']},server_now:iso()};
  if(action==='react'){
    assert(room.status==='active');
    room.reaction[id]=data.emoji;room.reactionAt[id]=iso();
    return {ok:true,server_now:iso()};
  }
  if(action==='answer'){
    room.answerCalls[id]++;
    assert.equal(room.status,'active');
    const i=room.index[id], correct=words[i]&&words[i][lang[id]]===data.answer;
    if(correct){room.index[id]++;room.score[id]++}
    return {correct:Boolean(correct),duel:snapshot(id),server_now:iso()};
  }
  if(action==='skip'){
    room.skipCalls++;room.skips[id]++;room.index[id]++;
    return {duel:snapshot(id),server_now:iso()};
  }
  if(action==='offer')return {offer:null};
  if(action==='friend_list')return {friends:[]};
  if(action==='public_rooms')return {rooms:[]};
  throw Error('Unexpected duel RPC: '+action);
}
function settle(){
  if(room.settled)return;
  room.status='finished';room.settled=true;
  const winner=room.score.A>room.score.B?'A':room.score.B>room.score.A?'B':null;
  if(winner){room.coins[winner]+=45;room.payouts++}
  else{room.coins.A+=25;room.coins.B+=25;room.payouts+=2}
}
class Element {
  constructor(){
    this.children=[];this.hidden=true;this.disabled=false;this.style={};this.dataset={};
    this.textContent='';this.value='25';this.parentElement=this;this.offsetWidth=1;
    const flags=new Set();
    this.classList={
      add:x=>flags.add(x),remove:x=>flags.delete(x),contains:x=>flags.has(x),
      toggle:(x,v)=>{const yes=v===undefined?!flags.has(x):Boolean(v);if(yes)flags.add(x);else flags.delete(x);return yes}
    };
  }
  append(v){this.children.push(v)}
  prepend(v){this.children.unshift(v)}
  replaceChildren(){this.children=[]}
  setAttribute(){}
  getAttribute(){return null}
  addEventListener(){}
  querySelector(){return new Element()}
}
function makeClient(id){
  const nodes=new Map();const get=n=>{if(!nodes.has(n)){const el=new Element();el.id=n;nodes.set(n,el)}return nodes.get(n)};
  const storage=new Map([['pw.language',lang[id]]]);
  let n=0;const timers=new Map();
  const win={addEventListener(){},scrollTo(){},PW:{login:async()=>({}),status(){},haptic(){},sfx(){},
    player:{},duelRequest:(action,body)=>rpc(id,action,body)}};
  const context={window:win,document:{getElementById:get,createElement:()=>new Element(),querySelectorAll:selector=>selector==='.screen'?[get('home'),get('duelScreen')]:[],addEventListener(){},hidden:false},
    location:{search:'',hash:'',href:'https://test.invalid/'},URL,URLSearchParams,Date,Math,console,navigator:{},
    setTimeout:(fn)=>{timers.set(++n,fn);return n},clearTimeout:x=>timers.delete(x),
    setInterval:()=>++n,clearInterval:()=>{},
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},
  };
  win.document=context.document;
  vm.createContext(context);vm.runInContext(source,context);
  clients[id]={test:win.duelTest,get,storage,context};
  return clients[id];
}
const A=makeClient('A'),B=makeClient('B');
const q=a=>a.test.snapshot().question;
let created=await rpc('A','create',{stake:25,language:'ru'});
A.test.set(created.duel);
assert.equal(A.get('duelInvite').hidden,false);
let joined=await rpc('B','join',{code:room.code,language:'en'});
B.test.set(joined.duel);
await A.test.state();
assert.equal(room.coins.A,175);
assert.equal(room.coins.B,175);
assert.equal(A.test.snapshot().language,'ru');
assert.equal(B.test.snapshot().language,'en');
assert.equal(A.get('duelClear').textContent,'СБРОСИТЬ БУКВЫ');
assert.equal(B.get('duelClear').textContent,'CLEAR LETTERS');
assert.equal(A.get('duelSlots').children.length,3);
assert.equal(B.get('duelSlots').children.length,3);
const seconds=Number(A.get('duelTimer').textContent);
assert(Number.isInteger(seconds)&&seconds>0&&seconds<=60,'Duel countdown must be within 60 seconds');
// A clears a partial answer. B retains independent input and a separate language.
A.test.type([0,1]);B.test.type([0,1]);
assert.equal(A.test.chosen().length,2);
A.get('duelClear').onclick();
assert.equal(A.test.chosen().length,0);
assert.equal(B.test.chosen().length,2);
B.get('duelClear').onclick();
assert.equal(B.test.chosen().length,0);
// A sends reaction to B; B sees it after polling server reaction state.
await A.get('duelReactionPicker').children[2].onclick();
await B.test.syncReactions();
assert.equal(B.get('duelFriendReaction').textContent,'🔥');
// A solves RU word, B solves EN word, server stores each score separately.
A.test.type([0,1,2]);
await A.test.submit(q(A));
B.test.type([0,1,2]);
await B.test.submit(q(B));
assert.equal(room.score.A,1);
assert.equal(room.score.B,1);
await A.test.state();await B.test.state();
assert.equal(A.get('duelYouScore').textContent,1);
assert.equal(B.get('duelYouScore').textContent,1);
assert.equal(A.test.snapshot().language,'ru');
assert.equal(B.test.snapshot().language,'en');
// A gets a second point using the Cyrillic answer.
A.test.type([0,1,2]);
await A.test.submit(q(A));
assert.equal(room.score.A,2);
assert.equal(room.score.B,1);
assert.equal(room.answerCalls.A,2);
assert.equal(room.answerCalls.B,1);
await B.get('duelSkip').onclick();
assert.equal(room.skipCalls,1);
assert.equal(room.skips.B,1);
assert.equal(room.score.B,1);
assert.equal(B.get('duelSkip').textContent,'SKIP · 2');
// Game settles only once even if multiple devices poll for final state.
settle();settle();
assert.equal(room.coins.A,220);
assert.equal(room.coins.B,175);
assert.equal(room.payouts,1);
assert.equal(snapshot('A').won,true);
assert.equal(snapshot('B').won,false);
console.log('PASS: dual independent clients RU/EN, reset letters, reaction sync, scoring, winner, and single payout.');
