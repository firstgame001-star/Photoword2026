import {writeFileSync} from 'node:fs';
import {combined,themeBanks,themeBank,challengeAll} from './full-audit.mjs';
const langs=['ru','en','az'],norm=x=>x.normalize('NFC').toLocaleUpperCase('az').replaceAll('Ё','Е');
const forbidden=Object.fromEntries(langs.map(l=>[l,new Set([...Object.values(combined[l]).map(q=>norm(q.answer)),...challengeAll.map(q=>norm(q[l]))])]));
let seed=20261002;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const groups=themeBanks.map(([id,bn,tn])=>{
 const [base,tr]=themeBank(id,bn,tn);
 const rows=Object.entries(base).map(([n,q])=>({source:`${id}:${n}`,ru:q.answer,en:tr.en[n].answer,az:tr.az[n].answer,photos:q.photos.map(x=>Array.isArray(x)?x[0]:x)})).filter(q=>langs.every(l=>!forbidden[l].has(norm(q[l]))));
 for(let i=rows.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]]}return rows;
});
const bank=[],words=Object.fromEntries(langs.map(l=>[l,new Set()])),clues=new Set();
while(bank.length<365){let added=false;for(const rows of groups){while(rows.length){const q=rows.pop(),key=JSON.stringify([...q.photos].sort());if(clues.has(key)||langs.some(l=>words[l].has(norm(q[l]))))continue;bank.push({...q,id:bank.length+1});clues.add(key);for(const l of langs)words[l].add(norm(q[l]));added=true;break}if(bank.length===365)break}if(!added)throw Error('Not enough eligible daily questions')}
writeFileSync('server/daily-bank.json',JSON.stringify(bank,null,2)+'\n');
console.log('Built 365 daily puzzles; no repeated answers or clue sets; no main/challenge answer overlaps. Themes are curated source material.');
