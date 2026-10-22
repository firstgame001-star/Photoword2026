// Regression: earlier audit found these 26 cross-mode quartets linked to
// different answers, synonyms, or inconsistent localized word forms.
// Never embed correct server answers in publicly shipped audit fixtures.
import {readFileSync} from 'node:fs';
import {combined,themeBank,themeBanks,challengeAll} from './full-audit.mjs';
const categories=new Map(themeBanks.map(([id,bn,tn])=>[id,themeBank(id,bn,tn)[0]]));
const daily=JSON.parse(readFileSync('server/daily-bank.json','utf8'));
const cases=[
 ['main:526','theme:art:71'],
 ['main:518','theme:professions:1'],
 ['main:48','theme:professions:24'],
 ['main:241','theme:professions:62'],
 ['main:203','theme:professions:65'],
 ['main:209','theme:professions:68'],
 ['main:512','theme:professions:83'],
 ['main:621','theme:science:87'],
 ['main:637','theme:technology:8'],
 ['main:492','theme:technology:15'],
 ['main:192','theme:technology:20'],
 ['main:197','theme:technology:25'],
 ['main:514','theme:cinema:1'],
 ['main:426','theme:food:9'],
 ['main:479','theme:animals:69'],
 ['main:563','theme:transport:22'],
 ['main:182','theme:transport:56'],
 ['main:598','theme:nature:81'],
 ['theme:sport:14','challenge:113'],
 ['main:614','challenge:371'],
 ['main:609','challenge:372'],
 ['main:209','challenge:376'],
 ['main:563','daily:31'],
 ['main:492','daily:115'],
 ['main:209','daily:222'],
 ['main:657','daily:291']
];
if(cases.length!==26)throw Error('Expected all 26 historically ambiguous pairs');
function clues(ref){
 const [mode,a,b]=ref.split(':');
 let item;
 if(mode==='main') item=combined.ru[Number(a)];
 else if(mode==='theme') item=categories.get(a)?.[Number(b)];
 else if(mode==='challenge') item=challengeAll[Number(a)];
 else if(mode==='daily') item=daily[Number(a)-1];
 else throw Error('Invalid content bank: '+mode);
 if(!item)throw Error('Missing '+ref);
 const values=(item.p||item.photos||[]).map(x=>Array.isArray(x)?x[0]:x);
 if(values.length!==4||new Set(values).size!==4)throw Error(ref+' does not have four distinct clues');
 return values.slice().sort().join('|');
}
for(const [from,to] of cases)if(clues(from)===clues(to))throw Error('Old ambiguous clue quartet repeated: '+from+' / '+to);
console.log('PASS: 26 historically ambiguous cross-mode clue pairs are now distinct in the public game data.');
