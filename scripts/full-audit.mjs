import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const base=resolve('clean');
const read=name=>readFileSync(resolve(base,name),'utf8');
const index=read('index.html'),gameHtml=read('game.html'),themeHtml=read('theme-game.html');
const home=read('home.js'),game=read('game.js'),theme=read('theme-game.js'),challenge=read('challenge.js'),challengeExtra=read('challenge-bank-extra.js'),core=read('core.js');
const release=JSON.parse(read('release.json'));

function ids(html){return [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1])}
function duplicates(list){const seen=new Set(),dup=[];for(const x of list){if(seen.has(x)&&!dup.includes(x))dup.push(x);seen.add(x)}return dup}
for(const [name,html] of [['index',index],['game',gameHtml],['theme-game',themeHtml]]){
 const d=duplicates(ids(html));if(d.length)throw Error('Duplicate HTML ids in '+name+': '+d.join(', '));
}

function domRefs(js){
 const out=new Set();
 for(const re of [/\$\('([^']+)'\)/g,/\$\("([^"]+)"\)/g,/getElementById\('([^']+)'\)/g,/getElementById\("([^"]+)"\)/g]){
  for(const m of js.matchAll(re))out.add(m[1]);
 }
 return [...out];
}
function assertRefs(js,html,label){
 const available=new Set(ids(html));
 const missing=domRefs(js).filter(x=>!available.has(x));
 if(missing.length)throw Error(label+' references missing DOM ids: '+missing.join(', '));
}
assertRefs(home,index,'home.js');
assertRefs(game,gameHtml,'game.js');
assertRefs(theme,themeHtml,'theme-game.js');
assertRefs(challenge,index,'challenge.js');

function extractConstExpr(src,name){
 const token='const '+name+'=',idx=src.indexOf(token);if(idx<0)throw Error('Missing const '+name);
 let i=idx+token.length;while(/\s/.test(src[i]))i++;
 const open=src[i],close=open==='{'?'}':open==='['?']':null;if(!close)throw Error('Unsupported const '+name);
 let depth=0,quote=null,escape=false;
 for(let j=i;j<src.length;j++){
  const ch=src[j];
  if(quote){if(escape){escape=false;continue}if(ch==='\\'){escape=true;continue}if(ch===quote)quote=null;continue}
  if(ch==="'"||ch==='"'||ch==='\`'){quote=ch;continue}
  if(ch===open)depth++;else if(ch===close){depth--;if(depth===0)return src.slice(i,j+1)}
 }
 throw Error('Unclosed const '+name);
}
const evalConst=(src,name)=>Function('"use strict";return ('+extractConstExpr(src,name)+');')();

function assertLanguageKeys(obj,label){
 const langs=['ru','en','az'],sets=Object.fromEntries(langs.map(l=>[l,new Set(Object.keys(obj[l]||{}))]));
 const all=new Set(langs.flatMap(l=>[...sets[l]]));
 for(const l of langs){const miss=[...all].filter(k=>!sets[l].has(k));if(miss.length)throw Error(label+' missing '+l+' keys: '+miss.join(', '))}
}
assertLanguageKeys(evalConst(home,'T'),'Home translations');
assertLanguageKeys(evalConst(game,'GAME_UI'),'Game translations');
assertLanguageKeys(evalConst(theme,'UI'),'Theme translations');
assertLanguageKeys(evalConst(theme,'SETTINGS_UI'),'Theme settings translations');
assertLanguageKeys(evalConst(challenge,'I'),'Challenge translations');
const coreErrors=evalConst(core,'ERR');
assertLanguageKeys(coreErrors,'Core error translations');
for(const lang of ['ru','en','az'])if(!coreErrors[lang]?.energy_full)throw Error('Missing '+lang+' energy_full localization');

// Main content audit: 280 levels, three languages, valid pools and four clues.
const mainLevels=evalConst(game,'LEVELS'),mainTr=evalConst(game,'TRANSLATED');
for(const [lang,obj] of [['ru',mainLevels],['en',mainTr.en],['az',mainTr.az]]){
 if(Object.keys(obj||{}).length!==280)throw Error('Main '+lang+' must contain 280 levels');
 const words=Object.values(obj).map(x=>x.answer);
 if(words.some(x=>!x))throw Error('Main '+lang+' has empty answer');
 if(new Set(words).size!==280)throw Error('Main '+lang+' contains duplicate answers');
 for(let n=1;n<=280;n++){
  const x=obj[n];if(!x?.answer||!x?.pool||!x?.hint)throw Error('Main '+lang+' incomplete level '+n);
  if(lang==='ru'&&(!x.photos||x.photos.length!==4))throw Error('Main RU level '+n+' must have 4 clues');
  const need={};for(const ch of [...x.answer])need[ch]=(need[ch]||0)+1;
  const have={};for(const ch of [...x.pool])have[ch]=(have[ch]||0)+1;
  for(const ch in need)if((have[ch]||0)<need[ch])throw Error('Main '+lang+' pool missing '+ch+' at level '+n);
 }
}

// Challenge content audit: exact 200+200 bank, three-language uniqueness and four clues.
const challengeBase=evalConst(challenge,'Q');
const extraToken='window.PW_CHALLENGE_EXTRA=',extraStart=challengeExtra.indexOf(extraToken);
if(extraStart<0)throw Error('Missing PW_CHALLENGE_EXTRA');
const extraArrayStart=challengeExtra.indexOf('[',extraStart);
const extraArrayEnd=challengeExtra.lastIndexOf(']');
const challengeAdded=JSON.parse(challengeExtra.slice(extraArrayStart,extraArrayEnd+1));
const challengeAll=[...challengeBase,...challengeAdded];
if(challengeBase.length!==200||challengeAdded.length!==200||challengeAll.length!==400)throw Error('Challenge bank must be 200+200=400');
for(const lang of ['ru','en','az']){
 const words=challengeAll.map(x=>x[lang]);
 if(words.some(x=>!x))throw Error('Challenge '+lang+' has empty answer');
 if(new Set(words).size!==400)throw Error('Challenge '+lang+' contains duplicate answers');
}
challengeAll.forEach((x,i)=>{if(!Array.isArray(x.p)||x.p.length!==4)throw Error('Challenge item '+(i+1)+' must have 4 clues')});
challengeAdded.forEach((x,i)=>{for(const lang of ['ru','en','az'])if(!x.h?.[lang])throw Error('Challenge extra hint missing '+lang+' at '+(i+201))});
if(!challenge.includes('ENERGY_MAX=5')||challenge.includes('reserve_energy'))throw Error('Challenge energy must remain strict 0-5 with no reserve');
if(!challenge.includes("BANK_VERSION='r54-400'")||!challenge.includes('pw.challenge.deck.'))throw Error('Challenge no-repeat deck/version missing');
const ruleBlock=home.slice(home.indexOf('const RULES='),home.indexOf('const RESET='));
if(!ruleBlock.includes('Глава 7 «Цивилизация» — уровни 231–280'))throw Error('RU Chapter 7 rules are stale');
if(!ruleBlock.includes('Chapter 7 “Civilization” contains levels 231–280'))throw Error('EN Chapter 7 rules are stale');
if(!ruleBlock.includes('7-ci fəsil “Sivilizasiya” — 231–280-ci səviyyələr'))throw Error('AZ Chapter 7 rules are stale');
if(ruleBlock.includes('5–12-ci fəsillər artıq naviqasiyaya əlavə edilib'))throw Error('Stale Azerbaijani chapter rules remain');

const themeBanks=[
 ['sport','LEVELS','TRANSLATED'],['art','ART_LEVELS','ART_TRANSLATED'],['professions','PROF_LEVELS','PROF_TRANSLATED'],
 ['travel','TRAVEL_LEVELS','TRAVEL_TRANSLATED'],['science','SCIENCE_LEVELS','SCIENCE_TRANSLATED'],['technology','TECHNOLOGY_LEVELS','TECHNOLOGY_TRANSLATED']
];
for(const [id,bn,tn] of themeBanks){
 const bank=evalConst(theme,bn),tr=evalConst(theme,tn);
 for(const [lang,obj] of [['ru',bank],['en',tr.en],['az',tr.az]]){
  if(Object.keys(obj||{}).length!==100)throw Error(id+' '+lang+' must contain 100 levels');
  const words=Object.values(obj).map(x=>x.answer);
  if(words.some(x=>!x))throw Error(id+' '+lang+' has empty answer');
  if(new Set(words).size!==100)throw Error(id+' '+lang+' contains duplicate answers');
 }
 for(let n=1;n<=100;n++){
  if(!bank[n]?.photos||bank[n].photos.length!==4)throw Error(id+' RU level '+n+' must have 4 clues');
  if(!tr.en?.[n]||!tr.az?.[n])throw Error(id+' translations missing level '+n);
 }
}

const completeThemes=release.thematic_mode.categories.filter(x=>x.status==='complete');
if(completeThemes.length!==6)throw Error('Expected 6 complete thematic categories, got '+completeThemes.length);
if(release.verification?.main_levels_available_through!==280)throw Error('Main game manifest is not at 280');
if(release.chapters.filter(x=>x.status==='live').length!==7)throw Error('Expected 7 live chapters');
if(release.chapters.filter(x=>x.status==='planned').length!==5)throw Error('Expected Chapters 8-12 to remain planned');
if(!release.verification?.main_answers_unique_all_languages)throw Error('Main answer uniqueness flag missing');

for(const required of ['settingsBtn','profileBtn','dailyRewardBtn','ratingNav','friendsNav','shopNav','themesEntry','challengeModes','notificationsBtn','languageBtn','themeBtn','rulesBtn','supportBtn','resetProgressBtn','eraseAccountBtn']){
 if(!index.includes('id="'+required+'"'))throw Error('Missing critical UI control '+required);
}
if(!theme.includes('.long-answer') && !read('ui.css').includes('.slots.long-answer'))throw Error('Long-answer mobile styling missing');

console.log('PASS: full PhotoWord audit — DOM integrity, 280 main levels, 400 unique challenge words, translations, chapters, six theme banks, settings surfaces and manifest consistency.');
