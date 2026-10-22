// Public asset quality gate. Does not expose any server-side answer keys.
import {readFileSync} from 'node:fs';
import {combined,themeBanks,themeBank,challengeAll} from './full-audit.mjs';
const rows=[];
const add=(bank,id,raw)=>{
  const clues=Array.isArray(raw)?raw.map(v=>Array.isArray(v)?v[0]:v):null;
  rows.push({bank,id,clues});
};
for(let i=1;i<=680;i++)add('main',i,combined.ru[i]?.photos);
for(const [category,baseName,translationName] of themeBanks){
  const [bank]=themeBank(category,baseName,translationName);
  for(let i=1;i<=100;i++)add(category,i,bank[i]?.photos);
}
challengeAll.forEach((q,i)=>add('challenge',i,q.p));
const daily=JSON.parse(readFileSync('server/daily-bank.json','utf8'));
daily.forEach(q=>add('daily',q.id,q.photos));
if(rows.length!==2645)throw Error('Expected 2,645 puzzles (680+1,200+400+365), got '+rows.length);
const bad=[],sets=new Map(),reuse=new Map();
for(const row of rows){
 const loc=row.bank+':'+row.id,clues=row.clues;
 if(!clues||clues.length!==4||clues.some(x=>typeof x!=='string'||!x.trim())){
  bad.push({loc,issue:'missing_or_wrong_count'});continue;
 }
 if(new Set(clues).size!==4)bad.push({loc,issue:'duplicate_within_level',clues});
 const sig=clues.slice().sort().join('\u001f');
 const earlier=sets.get(sig);
 if(earlier){
  const relation=earlier.bank+'->'+row.bank;
  reuse.set(relation,(reuse.get(relation)||0)+1);
 } else sets.set(sig,row);
}
console.log('PhotoWord content:',rows.length,'puzzles; repeated quartets across modes:',
  rows.length-sets.size,'(known cross-mode reuse, inspect editorially).');
console.log('Repeated clue quartets by source and destination:',Object.fromEntries(reuse));
if(bad.length)throw Error('Unusable/repeated clues inside puzzle: '+JSON.stringify(bad));
console.log('PASS: every level across main, 12 themes, challenges and daily has four distinct, non-empty clues.');
