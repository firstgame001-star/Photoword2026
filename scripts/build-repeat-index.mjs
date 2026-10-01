import {writeFileSync} from 'node:fs';
import {combined,themeBanks,themeBank,challengeAll} from './full-audit.mjs';
const languages=['ru','en','az'];
const normalize=word=>word.normalize('NFC').toLocaleUpperCase('az').replace(/Ё/g,'Е');
const index=challengeAll.map(question=>{
 const main=[],themes={};
 for(const n of Object.keys(combined.ru))if(languages.some(l=>normalize(question[l])===normalize(combined[l][n].answer)))main.push(Number(n));
 for(const[id,bn,tn]of themeBanks){const[b,t]=themeBank(id,bn,tn);const levels=Object.keys(b).filter(n=>languages.some(l=>normalize(question[l])===normalize((l==='ru'?b:t[l])[n].answer))).map(Number);if(levels.length)themes[id]=levels}
 return {main,themes};
});
writeFileSync('clean/challenge-repeat-index.js','window.PW_CHALLENGE_REPEAT_INDEX='+JSON.stringify(index)+';\n');
console.log('Built progress overlap index for '+index.length+' questions.');
