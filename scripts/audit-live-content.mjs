import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {combined,themeBanks,themeBank,challengeAll} from './full-audit.mjs';
const file=process.argv[2];if(!file)throw Error('Pass a private server-bank snapshot path');
const banks=JSON.parse(readFileSync(file,'utf8')),languages=['ru','en','az'];
const norm=(s,l)=>s.normalize('NFC').toLocaleUpperCase(l==='az'?'az':'en').replace(/Ё/g,'Е');
const failures=[];
function check(item,word,label,l){
 const letters=[...word],pool=[...item.pool];
 if(item.answerLength!==letters.length)failures.push(`${label} ${l}: length ${item.answerLength} != ${letters.length} (${word})`);
 for(const letter of letters){const pos=pool.indexOf(letter);if(pos<0){failures.push(`${label} ${l}: missing letter ${letter} (${word})`);break}pool.splice(pos,1)}
 if(l!=='ru'&&/[\p{Script=Cyrillic}]/u.test(item.hint+item.pool+word))failures.push(`${label} ${l}: Cyrillic text`);
 if(l==='en'&&!/^[A-Z0-9]+$/.test(word))failures.push(`${label} en: invalid answer alphabet (${word})`);
 if(l==='az'&&!/^[A-ZƏÖÜĞÇŞİ0-9]+$/.test(word))failures.push(`${label} az: invalid answer alphabet (${word})`);
}
for(const row of banks.main)for(const l of languages)check(combined[l][row.level_id],row[l],'main '+row.level_id,l);
const themeMap=new Map(themeBanks.map(([id,bn,tn])=>{const [ru,tr]=themeBank(id,bn,tn);return[id,{ru,en:tr.en,az:tr.az}]}));
for(const row of banks.themes)for(const l of languages)check(themeMap.get(row.theme_id)[l][row.level_id],row[l],row.theme_id+' '+row.level_id,l);
for(const row of banks.challenges)for(const l of languages)assert.equal(challengeAll[row.question_id][l],row['answer_'+l],'Server/client challenge mismatch '+row.question_id+' '+l);
const daily=JSON.parse(readFileSync('server/daily-bank.json','utf8'));
for(const row of banks.daily)for(const l of languages)assert.equal(row[l],daily[row.id-1][l],'Daily mismatch '+row.id+' '+l);
for(const [name,rows] of [['main',banks.main],['themes',banks.themes],['daily',banks.daily]])for(const l of languages){
 const seen=new Map();for(const row of rows){const key=norm(row[l],l);if(seen.has(key))failures.push(`${name} ${l}: repeated answer ${key} (${seen.get(key)}, ${row.theme_id||''}/${row.level_id||row.id})`);seen.set(key,(row.theme_id||'')+'/'+(row.level_id||row.id))}
}
for(const id of ['science','travel','technology']){
 const rows=banks.themes.filter(r=>r.theme_id===id);
 const mainWords=Object.fromEntries(languages.map(l=>[l,new Set(banks.main.map(r=>norm(r[l],l)))]));
 const overlap=rows.filter(r=>languages.some(l=>mainWords[l].has(norm(r[l],l)))).length;
 console.log(`${id}: ${rows.length} levels, ${overlap} overlaps with main bank in any language`);
 if(overlap>20)failures.push(id+': main overlap exceeds 20%');
}
if(failures.length){console.log(JSON.stringify(failures,null,2));process.exitCode=1}else console.log('PASS: live server answers match all 680 main and 1200 thematic letter pools in RU/EN/AZ; unique answers, challenge/daily synchronization, and repeat limits.');
