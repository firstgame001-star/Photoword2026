import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const window={};
Function('window',readFileSync('clean/challenge-repeat-policy.js','utf8'))(window);
Function('window',readFileSync('clean/challenge-repeat-index.js','utf8'))(window);
const choose=window.PW_CHALLENGE_REPEAT_POLICY;
const index=window.PW_CHALLENGE_REPEAT_INDEX;
assert.equal(index.length,400);
const legacy=new Set(index.flatMap((row,i)=>row.main.length>0||Object.keys(row.themes).length>0?[i]:[]));
assert.equal(legacy.size,10,'Expected only ten reserved legacy overlaps');
for(const i of legacy){assert(index[i].main.length||Object.keys(index[i].themes).length)}
let seen=new Set(),last=null;
const decks=[[],[],[]],shown=[];
for(let n=0;n<400-legacy.size;n++){
 const mode=n%3,r=choose({deck:decks[mode],count:400,seen,excluded:legacy,last,random:()=>0.5});
 assert(!legacy.has(r.index),'Legacy overlapping question appeared in a new run');
 assert(!shown.includes(r.index),'A question repeated after changing mode');
 shown.push(r.index);decks[mode]=r.deck;seen=new Set(r.seen);last=r.index;
}
assert.equal(seen.size,390);
const recycled=choose({deck:[],count:400,seen,excluded:legacy,last});assert(!legacy.has(recycled.index));assert.notEqual(recycled.index,last);
const allExcluded=new Set(Array.from({length:400},(_,i)=>i));
assert(Number.isInteger(choose({deck:[],count:400,seen,excluded:allExcluded,last}).index));
const corrupt=choose({deck:[-1,999,1,1,'2'],count:400,seen:new Set(),excluded:new Set([1]),last:2});
assert(corrupt.index>=0&&corrupt.index<400&&corrupt.index!==1);
console.log('PASS: 390 independent questions, ten legacy overlaps excluded, modes share history, exhaustion recovery.');
