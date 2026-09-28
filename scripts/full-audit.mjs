import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const base=resolve('clean');
const read=name=>readFileSync(resolve(base,name),'utf8');
const index=read('index.html'),gameHtml=read('game.html'),themeHtml=read('theme-game.html');
const home=read('home.js'),game=read('game.js'),mainExtra=read('main-levels-8-9.js'),theme=read('theme-game.js'),challenge=read('challenge.js'),challengeExtra=read('challenge-bank-extra.js'),core=read('core.js');
const release=JSON.parse(read('release.json'));
if(release.thematic_mode?.economy?.first_completion?.coins!==15||release.thematic_mode?.economy?.first_completion?.xp!==10)throw Error('Thematic completion reward must be 15 coins and 10 XP');
if(release.thematic_mode?.economy?.hints?.letter!==50||release.thematic_mode?.economy?.hints?.remove!==100||release.thematic_mode?.economy?.hints?.text!==150)throw Error('Thematic hint costs changed unexpectedly');
if(!theme.includes('THEME_REWARD_COINS=15,THEME_REWARD_XP=10'))throw Error('Thematic client reward constants are incorrect');

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
 const re=new RegExp('const\\s+'+name+'\\s*=\\s*'),m=re.exec(src);if(!m)throw Error('Missing const '+name);
 let i=m.index+m[0].length;while(/\s/.test(src[i]))i++;
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

// Main content audit: 380 levels, three languages, valid pools and four clues.
const mainLevels=evalConst(game,'LEVELS'),mainTr=evalConst(game,'TRANSLATED');
const mainExtraRows=Function('window={};'+mainExtra+';return window.PW_MAIN_EXTRA')();
if(!Array.isArray(mainExtraRows)||mainExtraRows.length!==100||mainExtraRows[0].id!==281||mainExtraRows.at(-1).id!==380)throw Error('Main Chapter 8-9 extra bank must contain levels 281-380');
const extraAlphabet={ru:'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЭЮЯ',en:'ABCDEFGHJKLMNPQRSTUVWXYZ',az:'ABCÇDEƏFGĞHXIİJKLMNOÖPQRSŞTUÜVYZ'};
function buildExtraPool(word,lang){const chars=[...word],used=new Set(chars),extras=[],want=Math.max(12,chars.length+5);for(const ch of extraAlphabet[lang]){if(!used.has(ch)){extras.push(ch);if(chars.length+extras.length>=want)break}}return chars.concat(extras).join('')}
const combined={ru:{...mainLevels},en:{...mainTr.en},az:{...mainTr.az}};
for(const row of mainExtraRows){
 combined.ru[row.id]={...row.ru,pool:buildExtraPool(row.ru.answer,'ru'),photos:row.photos.map(x=>[x,x])};
 combined.en[row.id]={...row.en,pool:buildExtraPool(row.en.answer,'en')};
 combined.az[row.id]={...row.az,pool:buildExtraPool(row.az.answer,'az')};
}
for(const [lang,obj] of Object.entries(combined)){
 if(Object.keys(obj||{}).length!==380)throw Error('Main '+lang+' must contain 380 levels');
 const words=Object.values(obj).map(x=>x.answer);
 if(words.some(x=>!x))throw Error('Main '+lang+' has empty answer');
 if(new Set(words).size!==380)throw Error('Main '+lang+' contains duplicate answers');
 for(let n=1;n<=380;n++){
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
if(release.verification?.challenge_rewards_live!==true||release.challenge_modes?.rewards?.server_authoritative!==true||release.challenge_modes?.rewards?.max_per_run?.coins!==15||release.challenge_modes?.rewards?.max_per_run?.xp!==10)throw Error('Challenge reward manifest is incomplete');
if(!challenge.includes('challengeResultReward')||!challenge.includes('rewarded_runs_today')||!challenge.includes('runId=state?.run_id'))throw Error('Challenge reward client flow is incomplete');
const ruleBlock=home.slice(home.indexOf('const RULES='),home.indexOf('const RESET='));
if(!ruleBlock.includes('Глава 8 «Человек» — уровни 281–330')||!ruleBlock.includes('Глава 9 «Вселенная» — уровни 331–380'))throw Error('RU Chapters 8-9 rules are stale');
if(!ruleBlock.includes('Chapter 8 “Human” contains levels 281–330')||!ruleBlock.includes('Chapter 9 “Universe” contains levels 331–380'))throw Error('EN Chapters 8-9 rules are stale');
if(!ruleBlock.includes('8-ci fəsil “İnsan” — 281–330-cu səviyyələr')||!ruleBlock.includes('9-cu fəsil “Kainat” — 331–380-ci səviyyələr'))throw Error('AZ Chapters 8-9 rules are stale');
if(ruleBlock.includes('5–12-ci fəsillər artıq naviqasiyaya əlavə edilib'))throw Error('Stale Azerbaijani chapter rules remain');
if(!home.includes("track('app_open',{metadata:{version:'r91'}})"))throw Error('App-open analytics version is stale');
if(!home.includes('function chapterIdForLevel(level)'))throw Error('Chapter analytics helper is missing');
if(!home.includes("n<=280?7:n<=330?8:n<=380?9:10"))throw Error('Chapter analytics mapping is incomplete');

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

// Cross-theme answer uniqueness: ready thematic categories must not repeat each other's answers.
for(const lang of ['ru','en','az']){
 const seen=new Map();
 for(const [id,bn,tn] of themeBanks){
  const bank=evalConst(theme,bn),tr=evalConst(theme,tn),obj=lang==='ru'?bank:tr[lang];
  for(const [level,item] of Object.entries(obj)){
   if(seen.has(item.answer)){const prev=seen.get(item.answer);throw Error('Cross-theme duplicate '+lang+' '+item.answer+' at '+prev.id+' '+prev.level+' and '+id+' '+level)}
   seen.set(item.answer,{id,level});
  }
 }
}
if(release.verification?.thematic_answers_unique_across_ready_categories!==true)throw Error('Cross-theme uniqueness manifest flag missing');
if(release.verification?.thematic_progress_server_sync!==true||release.thematic_mode?.progress_sync?.server_authoritative!==true||release.thematic_mode?.progress_sync?.cross_device!==true)throw Error('Thematic progress sync manifest is incomplete');
if(release.verification?.chapter_start_values_absolute!==true||!home.includes("const range=(ch.num===1?0:ch.start)+'–'+ch.end"))throw Error('Absolute chapter range display missing');
if(release.verification?.chapter_range_labels_absolute!==true||!home.includes("text(base+'Done',range);text(base+'Count',x.levels)")||!home.includes("flashStatus('+5 🪙')"))throw Error('Chapter range/toast fixes missing');
if(!home.includes('syncThemeProgress')||!home.includes("actionRequest('theme_progress')"))throw Error('Home thematic progress sync missing');
if(!home.includes("actionRequest('profile_stats')")||!home.includes("profileBlitzStreak")||!home.includes("rank.className='rank-place'"))throw Error('Profile/rating refresh missing');
if(!home.includes("actionRequest('shop_status')")||!home.includes('renderShopHistory')||!home.includes('shopAdsValue'))throw Error('Shop dashboard/history flow missing');
if(!home.includes("actionRequest('notification_state')")||!home.includes("actionRequest('update_notifications'")||!home.includes("actionRequest('test_notification'"))throw Error('Notification settings client flow missing');
if(release.verification?.notification_preferences_server!==true||release.verification?.notification_scheduler!==true||release.notifications?.delivery!=='Telegram bot')throw Error('Notification release flags missing');
if(release.verification?.shop_status_server!==true||release.verification?.shop_purchase_history!==true||release.shop?.ads?.daily_limit!==10||release.shop?.ads?.reward_coins!==5)throw Error('Shop release flags missing');
if(release.verification?.profile_stats_server!==true||release.verification?.profile_thematic_totals!==true||release.verification?.leaderboard_titles_and_progress!==true)throw Error('Profile/rating release flags missing');
if(!theme.includes('syncServerThemeProgress')||!theme.includes("actionRequest('theme_progress')"))throw Error('Thematic game progress sync missing');
const completeThemes=release.thematic_mode.categories.filter(x=>x.status==='complete');
if(completeThemes.length!==6)throw Error('Expected 6 complete thematic categories, got '+completeThemes.length);
if(release.verification?.main_levels_available_through!==380)throw Error('Main game manifest is not at 380');
if(release.chapters.filter(x=>x.status==='live').length!==9)throw Error('Expected 9 live chapters');
if(release.chapters.filter(x=>x.status==='planned').length!==3)throw Error('Expected Chapters 10-12 to remain planned');
if(!release.verification?.main_answers_unique_all_languages)throw Error('Main answer uniqueness flag missing');

for(const required of ['settingsBtn','profileBtn','dailyRewardBtn','ratingNav','friendsNav','shopNav','themesEntry','challengeModes','notificationsBtn','languageBtn','themeBtn','rulesBtn','supportBtn','resetProgressBtn','eraseAccountBtn']){
 if(!index.includes('id="'+required+'"'))throw Error('Missing critical UI control '+required);
}
if(!theme.includes('.long-answer') && !read('ui.css').includes('.slots.long-answer'))throw Error('Long-answer mobile styling missing');

console.log('PASS: full PhotoWord audit — DOM integrity, 380 main levels, 400 unique challenge words, translations, chapters, six theme banks, settings surfaces and manifest consistency.');
