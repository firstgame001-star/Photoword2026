import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const window={};
Function('window',readFileSync('clean/challenge-repeat-policy.js','utf8'))(window);
Function('window',readFileSync('clean/challenge-repeat-index.js','utf8'))(window);
const choose=window.PW_CHALLENGE_REPEAT_POLICY;
assert.equal(window.PW_CHALLENGE_REPEAT_INDEX.length,400);
const completedSailLevel=new Set(window.PW_CHALLENGE_REPEAT_INDEX.flatMap((row,i)=>row.main.some(n=>n<=538)?[i]:[]));
assert(completedSailLevel.has(166),'Completing main level 538 must exclude challenge question 167 for the Azerbaijani YELKƏN answer');
const afterSailLevel=choose({deck:[],count:400,seen:new Set(),excluded:completedSailLevel,last:null});
assert.notEqual(afterSailLevel.index,166,'A completed translated answer reappeared in challenge mode');
let seen=new Set(),last=null;const decks=[[],[],[]],shown=[];
for(let n=0;n<400;n++){
 const mode=n%3,r=choose({deck:decks[mode],count:400,seen,excluded:new Set(),last,random:()=>.5});
 assert(!shown.includes(r.index),'A question repeated after changing mode');
 shown.push(r.index);decks[mode]=r.deck;seen=new Set(r.seen);last=r.index;
}
const recycled=choose({deck:[],count:400,seen,excluded:new Set(),last});assert.notEqual(recycled.index,last);
const index=window.PW_CHALLENGE_REPEAT_INDEX;
const excluded=new Set(index.flatMap((r,i)=>r.main.some(n=>n<=100)||r.themes.animals?.includes(1)?[i]:[]));
assert(excluded.size>0&&excluded.size<400);
seen=new Set();last=null;
for(let n=0;n<400-excluded.size;n++){
 const r=choose({deck:[],count:400,seen,excluded,last});assert(!excluded.has(r.index));assert(!seen.has(r.index));seen=new Set(r.seen);last=r.index;
}
assert.equal(seen.size,400-excluded.size);
const allExcluded=new Set(Array.from({length:400},(_,i)=>i));
assert(Number.isInteger(choose({deck:[],count:400,seen,excluded:allExcluded,last}).index));
const corrupt=choose({deck:[-1,999,1,1,'2'],count:400,seen:new Set(),excluded:new Set([1]),last:2});assert(corrupt.index>=0&&corrupt.index<400&&corrupt.index!==1);
console.log('PASS: 400 questions across three modes without repeats; completed-word exclusion; exhaustion fallback; corrupt-cache recovery.');
