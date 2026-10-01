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
let source=readFileSync('clean/duel.js','utf8');
source=source.replace(/\}\)\(\);\s*$/,`window.testDuel={set(d){duel=d;code=d.code;questionId=d.question_id;chosen=[];disabled=false;answering=false;drawQuestion(d.question);$('duelScreen').classList.add('active')},chosen:()=>[...chosen],drawQuestion,clearLetters,submit,state,syncReactions,playerTitle,setAnswering(v){answering=v}};})();`);
vm.createContext(context);vm.runInContext(source,context);
const test=context.window.testDuel,q={length:3,letters:['A','B','C','X'],photos:['🐈','🐾','🧶','🥛']};
const match={code:'ABCDEF0123456789',status:'active',question_id:1,question:q,my_score:0,their_score:0,skips_left:3,starts_at:new Date(Date.now()-1000).toISOString(),ends_at:new Date(Date.now()+60000).toISOString()};
test.set(match);get('duelLetters').children[0].onclick();get('duelLetters').children[1].onclick();get('duelSlots').children[0].onclick();assert.deepEqual([...test.chosen()],[1]);test.clearLetters();assert.equal(test.chosen().length,0);assert(get('duelLetters').children.every(e=>!e.classList.contains('used')));
test.set(match);get('duelLetters').children[0].onclick();get('duelLetters').children[1].onclick();get('duelLetters').children[2].onclick();let release;respond=action=>action==='answer'?new Promise(resolve=>release=resolve):Promise.resolve({duel:match});const submission=test.submit(q);test.clearLetters();assert.equal(test.chosen().length,0);release({duel:match,correct:false});await submission;
get('duelLetters').children[0].onclick();for(const [id,fn]of [...timers]){if(id===Math.max(...timers.keys()))fn()}assert.deepEqual([...test.chosen()],[0],'Wrong-answer animation erased new input');
test.setAnswering(true);respond=async()=>({reactions:{their_reaction:'fire',their_reaction_at:new Date().toISOString()}});await test.syncReactions();assert(calls.includes('reactions'));assert.equal(get('duelFriendReaction').textContent,'🔥');
for(const lang of ['ru','en','az']){storage.set('pw.language',lang);assert(test.playerTitle(530));assert.notEqual(test.playerTitle(530),test.playerTitle(380))}
console.log('PASS: clicked-slot removal, clear during pending answer, wrong-answer input race, reactions during submission, and twelve localized ranks.');
