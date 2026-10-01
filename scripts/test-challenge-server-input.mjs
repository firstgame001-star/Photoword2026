import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
class Element {
 constructor(){this.children=[];this.hidden=true;this.disabled=false;this.style={};this.dataset={};this.textContent='';const classes=new Set();this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle:(x,on)=>on===undefined?classes.has(x)?classes.delete(x):classes.add(x):on?classes.add(x):classes.delete(x)}}
 append(e){this.children.push(e)} replaceChildren(){this.children=[]} setAttribute(){} addEventListener(){} querySelector(){return new Element()}
}
const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id)};
const storage=new Map();let timerId=0;const timers=new Map(),calls=[];let respond=async()=>({});
const context={document:{getElementById:get,createElement:()=>new Element(),querySelectorAll:()=>[],addEventListener(){},hidden:false},location:{search:'',href:'https://test.invalid/'},URL,URLSearchParams,Date,Math,console,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},setTimeout:fn=>{timers.set(++timerId,fn);return timerId},clearTimeout:id=>timers.delete(id),setInterval:()=>++timerId,clearInterval(){},navigator:{},window:{addEventListener(){},scrollTo(){},PW:{status(){},haptic(){},sfx(){},player:{},login:async()=>({}),duelRequest:async(action,body)=>{calls.push(action);return respond(action,body)}}}};
context.window.document=context.document;

context.performance={now:()=>0};context.window.Telegram={WebApp:{initData:'signed-test'}};
let release,callsCount=0;
context.fetch=async()=>{callsCount++;return await new Promise(resolve=>release=()=>resolve({ok:true,json:async()=>({challenge:{question_ids:[20,21,22,23,24,25,26,27,28,29]}})}))};
let source=readFileSync('clean/challenge.js','utf8');
source=source.replace(/\}\)\(\);\s*$/,`window.testChallenge={nextQ,cancelPending,choose,set(ids){running=true;serverMode=true;mode='nohint';state={run_id:'test-run'};serverQuestions=ids;questionFetch=null;questionLoading=false},answer:()=>answer,loading:()=>questionLoading,buffer:()=>[...serverQuestions]};})();`);
vm.createContext(context);vm.runInContext(source,context);
const test=context.window.testChallenge;
test.set([0,1,2,3,4,5,6,7,8,9]);
await test.nextQ();assert.equal(test.answer(),'СОБАКА');await test.nextQ();assert.equal(test.answer(),'КОШКА');assert.equal(callsCount,0);
test.set([]);const pending=test.nextQ();assert(test.loading());assert(get('challengeLetters').children.every(e=>e.disabled));release();await pending;assert.equal(test.answer(),'МОСТ');assert.equal(test.buffer().length,9);
test.set([]);const stale=test.nextQ();test.cancelPending();release();await stale;assert.equal(test.buffer().length,0,'stale run populated buffer');
console.log('PASS: server question order, input locked during network wait, buffer refill, and stale run cancellation.');
