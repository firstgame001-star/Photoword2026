import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
class Element {
 constructor(){this.children=[];this.hidden=true;this.disabled=false;this.style={};this.dataset={};this.textContent='';const classes=new Set();this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle:(x,on)=>on===undefined?classes.has(x)?classes.delete(x):classes.add(x):on?classes.add(x):classes.delete(x)}}
 append(e){this.children.push(e)} replaceChildren(){this.children=[]} setAttribute(){} addEventListener(){} querySelector(){return new Element()}
}
const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id)};
const storage=new Map();let timerId=0;const timers=new Map(),calls=[];let respond=async()=>({});
const context={document:{getElementById:get,createElement:()=>new Element(),querySelectorAll:q=>q==='.screen'?[get('dailyPuzzleScreen'),get('home')]:q==='[data-coins]'?[get('wallet')]:[],addEventListener(){},hidden:false},location:{search:'',href:'https://test.invalid/'},URL,URLSearchParams,Date,Math,console,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},setTimeout:fn=>{timers.set(++timerId,fn);return timerId},clearTimeout:id=>timers.delete(id),setInterval:()=>++timerId,clearInterval(){},navigator:{},window:{addEventListener(){},scrollTo(){},PW:{status(){},haptic(){},sfx(){},player:{},login:async()=>({}),duelRequest:async(action,body)=>{calls.push(action);return respond(action,body)}}}};
context.window.document=context.document;


let perf=0,sequence=0;context.performance={now:()=>perf};context.AbortController=AbortController;context.crypto={randomUUID:()=>('00000000-0000-0000-0000-'+String(++sequence).padStart(12,'0'))};
context.window.Telegram={WebApp:{initData:'signed-test'}};context.window.PW.player.photoword_id='PLAYER_A';get('dailyPuzzleScreen').classList.add('active');
const initial={day:'2026-10-02',question_id:1,language:'ru',photos:['🐈','🐾','🧶','🥛'],letters:['А','Б','В','Г','Д','Е'],length:3,attempts:0,attempts_left:3,solved:false,closed:false,reward_coins:25,server_now:'2026-10-01T20:00:00Z',reset_at:'2026-10-02T20:00:00Z'};
let server={...initial},accepted=new Map(),lose=true,correct=false,coins=1000,requestIds=[];
context.fetch=async(url,opts)=>{
 const b=JSON.parse(opts.body);
 if(b.action==='state')return {ok:true,json:async()=>({daily:server})};
 requestIds.push(b.requestId);
 let result=accepted.get(b.requestId);
 if(!result){server={...server,attempts:server.attempts+1,attempts_left:server.attempts_left-1,solved:correct,closed:correct||server.attempts_left===1};result={correct,reward_coins:correct?25:0};accepted.set(b.requestId,result);if(correct)coins+=25}
 if(lose){lose=false;throw new Error('accepted response lost')}
 return {ok:true,json:async()=>({daily:server,result,coins})};
};
let source=readFileSync('clean/daily-puzzle.js','utf8');source=source.replace(/\}\)\(\);\s*$/,`window.testDaily={apply,submit,load,pending,clock,close,current:()=>daily};})();`);
vm.createContext(context);vm.runInContext(source,context);let test=context.window.testDaily;test.apply(initial);
const fill=()=>{for(const i of [0,1,2])get('dailyPuzzleLetters').children[i].onclick()};
fill();await test.submit();assert(test.pending());assert.equal(server.attempts,1);assert(get('dailyPuzzleLetters').children.every(e=>e.disabled));
vm.runInContext(source,context);test=context.window.testDaily;await test.load();
assert.equal(requestIds.length,2);assert.equal(requestIds[0],requestIds[1]);assert.equal(server.attempts,1);assert.equal(test.current().attempts_left,2);assert.equal(test.pending(),null);
correct=true;fill();await test.submit();assert.equal(coins,1025);assert(get('dailyPuzzleBoard').hidden);assert(!get('dailyPuzzleOutcome').hidden);assert(test.current().solved);
context.window.PW.player.photoword_id='PLAYER_B';server={...initial,attempts:2,attempts_left:1};correct=false;accepted=new Map();test.apply(server);fill();await test.submit();assert.equal(test.current().attempts_left,0);assert(test.current().closed);assert(get('dailyPuzzleSubmit').disabled);
server={...initial,day:'2026-10-03',question_id:2,server_now:'2026-10-02T20:00:00Z',reset_at:'2026-10-03T20:00:00Z'};
perf=86400001;test.clock();await new Promise(resolve=>setImmediate(resolve));assert.equal(test.current().day,'2026-10-03');assert.equal(test.current().attempts_left,3);assert(!test.current().closed);
console.log('PASS: lost-response retry after reload, same request ID, win closure, third-failure closure, and server midnight refresh.');
