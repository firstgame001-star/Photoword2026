import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const bankSource=readFileSync('clean/challenge-bank-extra.js','utf8');
const repeatSource=readFileSync('clean/challenge-repeat-index.js','utf8');
const bankMatch=bankSource.match(/window\.PW_CHALLENGE_EXTRA=(\[[\s\S]*\]);\}\)\(\);\s*$/);
const repeatMatch=repeatSource.match(/window\.PW_CHALLENGE_REPEAT_INDEX=(\[[\s\S]*\]);\s*$/);
assert(bankMatch&&repeatMatch,'Missing public challenge metadata');
const bank=JSON.parse(bankMatch[1]),index=JSON.parse(repeatMatch[1]);
assert.equal(bank.length,200);
assert.equal(index.length,400);
const ids=[...Array.from({length:20},(_,i)=>i+350),...Array.from({length:20},(_,i)=>i+380)];
const signatures=new Set();
for(const id of ids){
 const q=bank[id-200],matches=index[id];
 assert(q&&matches,'Missing independent question '+id);
 assert(Array.isArray(q.p)&&q.p.length===4,'Expected four clues for '+id);
 assert.equal(new Set(q.p).size,4,'Repeated visual clue within question '+id);
 assert.equal(matches.main.length,0,'Independent question points to a main level '+id);
 assert.equal(Object.keys(matches.themes).length,0,'Independent question points to a theme level '+id);
 assert(!Object.hasOwn(q,'ru')&&!Object.hasOwn(q,'en')&&!Object.hasOwn(q,'az')&&!Object.hasOwn(q,'answer'),
    'Private correct answers exposed in public question '+id);
 for(const lang of ['ru','en','az']){
   assert(typeof q.h?.[lang]==='string'&&q.h[lang].length>=22,
      'Incomplete localized hint '+id+' '+lang);
   if(lang!=='ru')assert(!/\p{Script=Cyrillic}/u.test(q.h[lang]),
      'Untranslated hint '+id+' '+lang);
 }
 const s=q.p.slice().sort().join('|');
 assert(!signatures.has(s),'Repeated quartet within 40 curated questions '+id);
 signatures.add(s);
}
console.log('PASS: 40 distinct challenge puzzles, all three hints localized, no solutions published, no stale main/theme links.');

const patchSource=readFileSync('clean/challenge-unique-patches.js','utf8');
const baseSource=readFileSync('clean/challenge.js','utf8');
const overrides=JSON.parse(patchSource.split('window.PW_CHALLENGE_PATCHES=',2)[1].split(';})();',1)[0]);
const core=JSON.parse(baseSource.split('const Q=',2)[1].split('];',1)[0]+']');
const resolved=[...core,...bank];
for(const [id,puzzle] of Object.entries(overrides)) resolved[Number(id)]=puzzle;
assert.equal(resolved.length,400);
assert.equal(Object.keys(overrides).length,349);
const usedClues=new Set();
for(const [id,puzzle] of resolved.entries()){
 assert(Array.isArray(puzzle.p)&&puzzle.p.length===4,'Missing four photos: '+id);
 assert.equal(new Set(puzzle.p).size,4,'Duplicate clues inside puzzle '+id);
 const sig=puzzle.p.join('|');
 assert(!usedClues.has(sig),'Two puzzles have identical images: '+id);
 usedClues.add(sig);
 for(const lang of ['ru','en','az']) assert(typeof puzzle.h?.[lang]==='string'||id<200,'Missing localized patch hint: '+id+' '+lang);
}
const legacy=index.filter(r=>r.main.length>0||Object.keys(r.themes).length>0);
assert.equal(legacy.length,10,'Only ten legacy overlapping puzzles should be excluded from new runs');
console.log('PASS: all 400 visible photo groups unique, 349 replacements and 10 excluded legacy puzzles.');
