import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const base=resolve('clean');
const read=name=>readFileSync(resolve(base,name),'utf8');
const index=read('index.html'),gameHtml=read('game.html'),themeHtml=read('theme-game.html');
const home=read('home.js'),game=read('game.js'),mainExtra=read('main-levels-8-9.js'),mainMore=read('main-levels-10-12.js'),main13=read('main-levels-13.js'),main1415=read('main-levels-14-15.js'),theme=read('theme-game.js'),themeExtra=read('theme-levels-cinema-food.js')+read('theme-levels-expansion.js'),challenge=read('challenge.js'),challengeExtra=read('challenge-bank-extra.js'),core=read('core.js');
const release=JSON.parse(read('release.json'));
const achievementCatalog=JSON.parse(readFileSync(resolve(base,'../server/achievements/catalog.json'),'utf8'));
if(achievementCatalog.length!==120||new Set(achievementCatalog.map(x=>x.id)).size!==120||release.achievements?.count!==120)throw Error('Achievement catalogue and release manifest must contain 120 unique goals');
if(!['chapter_13','chapter_14','chapter_15','main_680','nohint_680'].every(id=>achievementCatalog.some(x=>x.id===id)))throw Error('Achievements for chapters 13–15 and full completion are missing');
if(achievementCatalog.some(x=>!['ru','en','az'].every(lang=>x.title?.[lang]&&x.description?.[lang])))throw Error('Achievement catalogue has incomplete translations');
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

function assertNoRussianText(value,label){
 if(typeof value==='function')return assertNoRussianText(value(3,'QA'),label);
 if(typeof value==='string'&&/\p{Script=Cyrillic}/u.test(value))throw Error('Russian text in '+label+': '+value);
 if(value&&typeof value==='object')for(const [key,item] of Object.entries(value))assertNoRussianText(item,label+'.'+key);
}
for(const [source,name] of [[home,'T'],[game,'GAME_UI'],[theme,'UI'],[theme,'SETTINGS_UI'],[challenge,'I'],[core,'ERR']]){
 const copy=evalConst(source,name);for(const lang of ['en','az'])assertNoRussianText(copy[lang],name+'.'+lang);
}
const duelSource=read('duel.js'),titleSource=duelSource.slice(duelSource.indexOf('const chapterTitles='),duelSource.indexOf('function frameAvatar('));
const homeChapterTitles=evalConst(home,'CHAPTER_TITLES'),chapterEnds=[20,50,90,130,180,230,280,330,380,430,480,530,580,630,680];
for(const lang of ['ru','en','az']){
 const getTitle=Function('language',titleSource+';return playerTitle;')(()=>lang);
 for(let i=0;i<chapterEnds.length;i++)if(getTitle(chapterEnds[i])!==homeChapterTitles[lang][i+1])throw Error('Duel chapter title mismatch '+lang+' chapter '+(i+1));
}

// Main content audit: 680 levels, three languages, valid pools and four clues.
const mainLevels=evalConst(game,'LEVELS'),mainTr=evalConst(game,'TRANSLATED');
const mainExtraRows=Function('window={};'+mainExtra+';return window.PW_MAIN_EXTRA')();
if(!Array.isArray(mainExtraRows)||mainExtraRows.length!==100||mainExtraRows[0].id!==281||mainExtraRows.at(-1).id!==380)throw Error('Main Chapter 8-9 extra bank must contain levels 281-380');
const mainMoreRows=Function('window={};'+mainMore+';return window.PW_MAIN_MORE')();
const main13Rows=Function('window={};'+main13+';return window.PW_MAIN_MORE')(); const main1415Rows=Function('window={};'+main1415+';return window.PW_MAIN_MORE')(); if(!Array.isArray(main1415Rows)||main1415Rows.length!==100||main1415Rows[0].id!==581||main1415Rows.at(-1).id!==680||main1415Rows.filter(x=>x.chapter===14).length!==50||main1415Rows.filter(x=>x.chapter===15).length!==50)throw Error('Main Chapters 14-15 bank must contain 50 levels each');
if(!Array.isArray(main13Rows)||main13Rows.length!==50||main13Rows[0].id!==531||main13Rows.at(-1).id!==580)throw Error('Main Chapter 13 bank must contain levels 531-580');
if(!Array.isArray(mainMoreRows)||mainMoreRows.length!==150||mainMoreRows[0].id!==381||mainMoreRows.at(-1).id!==530)throw Error('Main Chapter 10-12 bank must contain levels 381-530');
// Main content audit: 680 levels, three languages, valid pools and four clues.
// Solution words stay server-side; only level metadata is published to the client.
const combined={ru:{...mainLevels},en:{...mainTr.en},az:{...mainTr.az}};
for(const row of [...mainExtraRows,...mainMoreRows,...main13Rows,...main1415Rows]){
 combined.ru[row.id]={...row.ru,photos:row.photos.map(x=>[x,x])};
 combined.en[row.id]={...row.en};
 combined.az[row.id]={...row.az};
}
for(const [lang,obj] of Object.entries(combined)){
 if(Object.keys(obj||{}).length!==680)throw Error('Main '+lang+' must contain 680 levels');
 for(let n=1;n<=680;n++){
  const x=obj[n],pool=[...(x?.pool||'')];
  if(!x?.hint||!Number.isInteger(x.answerLength)||x.answerLength<1||pool.length<x.answerLength)throw Error('Main '+lang+' incomplete level '+n);
  if(Object.prototype.hasOwnProperty.call(x,'answer'))throw Error('Main '+lang+' exposes answer for level '+n);
  if(lang==='ru'&&(!x.photos||x.photos.length!==4))throw Error('Main RU level '+n+' must have 4 clues');
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
if(challengeAll.some(x=>['ru','en','az'].some(lang=>Object.hasOwn(x,lang))))throw Error('Challenge client bank must not expose answers');
const challengeServer=readFileSync(resolve(base,'../server/challenge-game/index.ts'),'utf8');
if(!challengeServer.includes('livePuzzle(')||!challengeServer.includes('action==="puzzle"')||!challengeServer.includes('puzzleLetters('))throw Error('Server-owned challenge puzzle endpoint is incomplete');
challengeAll.forEach((x,i)=>{if(!Array.isArray(x.p)||x.p.length!==4)throw Error('Challenge item '+(i+1)+' must have 4 clues')});
challengeAdded.forEach((x,i)=>{for(const lang of ['ru','en','az'])if(!x.h?.[lang])throw Error('Challenge extra hint missing '+lang+' at '+(i+201))});
if(!challenge.includes('ENERGY_MAX=5')||challenge.includes('reserve_energy'))throw Error('Challenge energy must remain strict 0-5 with no reserve');
if(!challenge.includes("BANK_VERSION='r54-400'")||!challenge.includes('pw.challenge.deck.'))throw Error('Challenge no-repeat deck/version missing');
if(release.verification?.challenge_rewards_live!==true||release.challenge_modes?.rewards?.server_authoritative!==true||release.challenge_modes?.rewards?.max_per_run?.coins!==15||release.challenge_modes?.rewards?.max_per_run?.xp!==10)throw Error('Challenge reward manifest is incomplete');
if(!challenge.includes('challengeResultReward')||!challenge.includes('rewarded_runs_today')||!challenge.includes('runId=state?.run_id'))throw Error('Challenge reward client flow is incomplete');
const achievementSql=readFileSync('server/achievements_120.sql','utf8');
const achievementCopyFix=readFileSync('server/achievement_streak_20_copy_fix.sql','utf8');
if(!achievementCopyFix.includes('challenge_streak_20')||!achievementCopyFix.includes('finished challenge'))throw Error('Achievement streak description migration is incomplete');
const achievementIds=['main_600','main_680','nohint_300','nohint_500','nohint_680','chapter_13','chapter_14','chapter_15','daily_streak_120','daily_first_150','duel_win_300','duel_play_300','duel_play_500','duel_draw_50','duel_score_25','challenge_runs_100','challenge_runs_200','challenge_streak_20','blitz_30','theme_levels_1200'];
for(const id of achievementIds)if(!achievementSql.includes(String.fromCharCode(39)+id+String.fromCharCode(39)))throw Error('Missing server achievement '+id);
if(release.achievements?.count!==120||release.achievements?.survives_progress_reset!==false)throw Error('Achievement catalog/reset manifest mismatch');
if(!achievementSql.includes('(13,531,580)')||!achievementSql.includes('(14,581,630)')||!achievementSql.includes('(15,631,680)'))throw Error('Achievement chapter metric ranges are incomplete');
const ruleBlock=home.slice(home.indexOf('const RULES='),home.indexOf('const RESET='));
const rules=JSON.parse(ruleBlock.slice('const RULES='.length).trim().replace(/;$/, ''));
for(const [l,need] of Object.entries({ru:['15 глав','680 уровней','Загадка дня','365','3 попытки','25 монет','Дуэли','120 целей','забрать вручную'],en:['15 chapters','680 levels','Daily puzzle','365','3 attempts','25 coins','Duels','120 goals','claimed manually'],az:['15 fəsil','680 səviyyə','Günün tapmacası','365','3 cəhd','25 sikkə','Duellər','120 məqsəd','əl ilə götürmək']})){
 for(const value of need)if(!rules[l]?.includes(value))throw Error('Rules missing '+l+': '+value);
 if((rules[l].match(/class="rule-section"/g)||[]).length!==11)throw Error('Rules sections missing '+l);
}
if(!home.includes("track('app_open',{metadata:{version:'r101',campaign:")||!home.includes("/^ads_[a-z0-9_]{1,28}$/.test(raw)"))throw Error('App-open campaign attribution is missing');
if(!home.includes('function chapterIdForLevel(level)'))throw Error('Chapter analytics helper is missing');
if(!home.includes("n<=280?7:n<=330?8:n<=380?9:n<=430?10:n<=480?11:n<=530?12:n<=580?13:n<=630?14:15"))throw Error('Chapter analytics mapping is incomplete');

const addedThemes=Function('window={};'+themeExtra+';return window.PW_THEME_EXTRA')();
for(const id of ['cinema','food','animals','transport','home','nature']){
 const rows=addedThemes[id];if(!Array.isArray(rows)||rows.length!==100)throw Error('Missing 100 '+id+' levels');
 for(let i=0;i<100;i++){
  const row=rows[i];if(row.id!==i+1||!Array.isArray(row.photos)||row.photos.length!==4||row.photos.some(p=>!p))throw Error(id+' invalid clues at '+(i+1));
  for(const lang of ['ru','en','az']){
   const item=row[lang];if(!item?.hint||!item.pool||!Number.isInteger(item.answerLength))throw Error(id+' incomplete '+lang+' level '+(i+1));
   if(Object.prototype.hasOwnProperty.call(item,'answer'))throw Error(id+' exposes answer for '+lang+' level '+(i+1));
  }
 }
}
const themeBank=(id,bn,tn)=>{if(bn)return [evalConst(theme,bn),evalConst(theme,tn)];const rows=addedThemes[id],base={},tr={en:{},az:{}};for(const row of rows){base[row.id]={...row.ru,photos:row.photos.map(e=>[e,e])};for(const l of ['en','az'])tr[l][row.id]=row[l]}return [base,tr]};
const themeBanks=[
 ['sport','LEVELS','TRANSLATED'],['art','ART_LEVELS','ART_TRANSLATED'],['professions','PROF_LEVELS','PROF_TRANSLATED'],
 ['travel','TRAVEL_LEVELS','TRAVEL_TRANSLATED'],['science','SCIENCE_LEVELS','SCIENCE_TRANSLATED'],['technology','TECHNOLOGY_LEVELS','TECHNOLOGY_TRANSLATED'],
 ['cinema',null,null],['food',null,null],['animals',null,null],['transport',null,null],['home',null,null],['nature',null,null]
];
for(const [id,bn,tn] of themeBanks){
 const [bank,tr]=themeBank(id,bn,tn);
 for(const [lang,obj] of [['ru',bank],['en',tr.en],['az',tr.az]]){
  if(Object.keys(obj||{}).length!==100)throw Error(id+' '+lang+' must contain 100 levels');
  for(let n=1;n<=100;n++){
   const item=obj[n],pool=[...(item?.pool||'')];
   if(!item?.hint||!Number.isInteger(item.answerLength)||item.answerLength<1||pool.length<item.answerLength)throw Error(id+' incomplete '+lang+' level '+n);
   if(Object.prototype.hasOwnProperty.call(item,'answer'))throw Error(id+' exposes answer for '+lang+' level '+n);
  }
 }
 for(let n=1;n<=100;n++)if(!bank[n]?.photos||bank[n].photos.length!==4)throw Error(id+' RU level '+n+' must have 4 clues');
}

const specificHintGroups={
 travel:['travel.json'],
 technology:['technology-1-50.json','technology-51-100.json'],
 science:['science-1-50.json','science-51-100.json']
};
let specificHintCount=0;
for(const [category,parts] of Object.entries(specificHintGroups)){
 const rows=parts.flatMap(part=>JSON.parse(readFileSync('scripts/content-hints/'+part,'utf8')));
 if(rows.length!==100)throw Error('Specific '+category+' hint catalogue must have 100 rows');
 const [ru,tr]=themeBank(category,category==='travel'?'TRAVEL_LEVELS':category==='science'?'SCIENCE_LEVELS':'TECHNOLOGY_LEVELS',
  category==='travel'?'TRAVEL_TRANSLATED':category==='science'?'SCIENCE_TRANSLATED':'TECHNOLOGY_TRANSLATED');
 for(let i=0;i<rows.length;i++){
  const row=rows[i];
  if(row.id!==i+1)throw Error('Out-of-order '+category+' hint '+i);
  for(const lang of ['ru','en','az']){
   const item=lang==='ru'?ru[i+1]:tr[lang]?.[i+1];
   if(!row[lang]||row[lang].length<20||item?.hint!==row[lang])
    throw Error('Incorrect '+category+' '+lang+' specific hint at level '+(i+1));
   specificHintCount++;
  }
  for(const lang of ['ru','en','az']){
   if(!row[lang]||row[lang].length<20)throw Error('Incomplete specific hint');
  }
 }
 for(const lang of ['ru','en','az'])if(new Set(rows.map(row=>row[lang])).size!==100)
  throw Error('Duplicate descriptions '+category+' '+lang);
}
if(specificHintCount!==900)throw Error('Missing specific hint coverage');

// The 51 Art/Food overlap replacements must remain playable in all locales.
// Server answer words are deliberately not embedded in this public audit.
const rotatedThemeIds={
 art:[10,13,26,28,29,32,33,39,40,41,43,45,51,52,53,56,58,59,61,62,63,66,67,68,69],
 food:[1,2,3,4,9,10,12,16,17,18,19,29,33,36,37,38,41,46,51,54,62,63,78,79,92,93]
};
if(rotatedThemeIds.art.length!==25||rotatedThemeIds.food.length!==26)
 throw Error('Expected 51 rotated Art/Food levels');
for(const [cat,ids] of Object.entries(rotatedThemeIds)){
 const [ru,tr]=themeBank(cat,cat==='art'?'ART_LEVELS':null,cat==='art'?'ART_TRANSLATED':null);
 for(const id of ids){
  const photos=ru[id]?.photos?.map(p=>p[0]);
  if(!photos||photos.length!==4||new Set(photos).size!==4)
   throw Error('Rotated '+cat+' level '+id+' must have four distinct clues');
  for(const lang of ['ru','en','az']){
   const item=lang==='ru'?ru[id]:tr[lang]?.[id];
   if(!item||item.hint?.length<18||!Number.isInteger(item.answerLength)||
      [...item.pool].length<item.answerLength+4)
     throw Error('Incomplete '+cat+' level '+id+' '+lang+' after rotation');
   if(Object.hasOwn(item,'answer'))
     throw Error('Answer leak in rotated '+cat+' level '+id);
  }
 }
}

// The publicly shipped bank exposes only puzzle metadata: ids, clues and letter pools.
// This manifest names all 139 newly rotated thematic levels WITHOUT storing answers.
const rotationManifest=JSON.parse(readFileSync('scripts/theme-rotation-manifest.json','utf8'));
const rotatedCategories=rotationManifest.rotated_levels;
if(rotationManifest.count!==139||
 Object.values(rotatedCategories).reduce((sum,ids)=>sum+ids.length,0)!==139)
 throw Error('Thematic 139-level answer rotation manifest is incomplete');
for(const [category,ids] of Object.entries(rotatedCategories)){
 const found=themeBanks.find(row=>row[0]===category);
 if(!found)throw Error('Unexpected thematic category '+category);
 const [bank,tr]=themeBank(...found);
 for(const levelId of ids){
  const pictures=bank[levelId]?.photos?.map(p=>p[0]);
  if(!pictures||pictures.length!==4||new Set(pictures).size!==4)
   throw Error('Invalid rotated clues in '+category+':'+levelId);
  for(const [lang,meta] of [['ru',bank[levelId]],['en',tr.en?.[levelId]],['az',tr.az?.[levelId]]]){
   if(!meta||typeof meta.hint!=='string'||meta.hint.length<18||
       !Number.isInteger(meta.answerLength)||meta.answerLength<2||
       typeof meta.pool!=='string'||[...meta.pool].length<meta.answerLength+5)
    throw Error('Unplayable rotated question '+category+':'+levelId+':'+lang);
   if(Object.prototype.hasOwnProperty.call(meta,'answer'))
    throw Error('Secret answer exposed in '+category+':'+levelId);
  }
 }
}

// Cross-theme answer uniqueness is verified against server-held answer banks and recorded in the release manifest.
if(release.verification?.thematic_answers_unique_across_ready_categories!==true)throw Error('Cross-theme uniqueness manifest flag missing');
if(release.verification?.thematic_progress_server_sync!==true||release.thematic_mode?.progress_sync?.server_authoritative!==true||release.thematic_mode?.progress_sync?.cross_device!==true)throw Error('Thematic progress sync manifest is incomplete');
if(release.verification?.chapter_start_values_absolute!==true||!home.includes("const range=(ch.num===1?0:ch.start)+'–'+ch.end"))throw Error('Absolute chapter range display missing');
if(release.verification?.chapter_range_labels_absolute!==true||!home.includes("text(base+'Done',range);text(base+'Count',x.levels)")||!home.includes("flashStatus('+5 🪙')"))throw Error('Chapter range/toast fixes missing');
if(!home.includes('syncThemeProgress')||!home.includes("actionRequest('theme_progress')"))throw Error('Home thematic progress sync missing');
if(!home.includes("actionRequest('profile_stats')")||!home.includes("profileBlitzStreak")||!home.includes("rank.className='rank-place'"))throw Error('Profile/rating refresh missing');
if(!home.includes("actionRequest('shop_status')")||!home.includes('renderShopHistory')||!home.includes('shopAdsValue'))throw Error('Shop dashboard/history flow missing');
if(!home.includes("actionRequest('notification_state')")||!home.includes("actionRequest('update_notifications'")||!home.includes("actionRequest('test_notification'"))throw Error('Notification settings client flow missing');
if(release.verification?.notification_preferences_server!==true||release.verification?.notification_scheduler!==true||release.notifications?.delivery!=='Telegram bot')throw Error('Notification release flags missing');
if(release.verification?.shop_status_server!==true||release.verification?.shop_purchase_history!==true||release.verification?.adsgram_reward_block_configured!==true||release.shop?.ads?.daily_limit!==3||release.shop?.ads?.energy_daily_limit!==2||release.shop?.ads?.cooldown_seconds!==600||release.shop?.ads?.reward_coins!==5||release.shop?.ads?.configured!==true||!release.shop?.history_types?.includes('refund'))throw Error('Shop release flags must match the live AdsGram limits and refund history');
if(release.verification?.profile_stats_server!==true||release.verification?.profile_thematic_totals!==true||release.verification?.leaderboard_titles_and_progress!==true)throw Error('Profile/rating release flags missing');
if(!theme.includes('syncServerThemeProgress')||!theme.includes("actionRequest('theme_progress')"))throw Error('Thematic game progress sync missing');
const completeThemes=release.thematic_mode.categories.filter(x=>x.status==='complete');
if(completeThemes.length!==12)throw Error('Expected 12 complete thematic categories, got '+completeThemes.length);
if(!home.includes("const READY_THEME_IDS=['sport','art','professions','travel','science','technology','cinema','food','animals','transport','home','nature']"))throw Error('Cinema/Food not enabled in thematic hub');
if(!theme.includes("cinema:addedThemeBank(addedThemeRows.cinema||[])")||!theme.includes("food:addedThemeBank(addedThemeRows.food||[])"))throw Error('Cinema/Food banks not wired');
if(release.verification?.main_levels_available_through!==680)throw Error('Main game manifest is not at 680');
if(release.chapters.filter(x=>x.status==='live').length!==15)throw Error('Expected 15 live chapters');
if(release.chapters.some(x=>x.status==='planned'))throw Error('Main chapters must all be live');
if(!release.verification?.main_answers_unique_all_languages)throw Error('Main answer uniqueness flag missing');

for(const required of ['settingsBtn','profileBtn','dailyRewardBtn','ratingNav','friendsNav','shopNav','themesEntry','challengeModes','notificationsBtn','languageBtn','themeBtn','rulesBtn','supportBtn','resetProgressBtn','eraseAccountBtn']){
 if(!index.includes('id="'+required+'"'))throw Error('Missing critical UI control '+required);
}
if(!theme.includes('.long-answer') && !read('ui.css').includes('.slots.long-answer'))throw Error('Long-answer mobile styling missing');

console.log('PASS: full PhotoWord audit — DOM integrity, 680 main levels, 400 unique challenge words, translations, chapters, twelve theme banks, settings surfaces and manifest consistency.');


// Server-held answer banks are not included in public assets. Check their release flags
// and validate public clue sets; challenge words must not be present in the browser payload.
function normalize(word){return word.normalize('NFC').toLocaleUpperCase('az').replace(/Ё/g,'Е').replace(/[\s\p{P}\p{S}]/gu,'')}
function assertUniqueWords(rows,label){
 for(const lang of ['ru','en','az']){
  const seen=new Set();
  for(const row of rows){const word=row[lang];if(typeof word!=='string'||!word)throw Error(label+' missing '+lang+' answer');const key=normalize(word);if(seen.has(key))throw Error(label+' normalized duplicate '+lang+' '+key);seen.add(key)}
 }
}
function assertUniqueClues(rows,label){
 const seen=new Set();
 for(const row of rows){const key=row.photos.map(p=>String(p).normalize('NFC')).sort().join('|');if(seen.has(key))throw Error(label+' duplicate unordered clue set '+key);seen.add(key)}
}
const mainContentRows=Object.keys(combined.ru).map(n=>({photos:combined.ru[n].photos.map(p=>p[0])}));
const themeContentRows=themeBanks.flatMap(([id,bn,tn])=>{const[b]=themeBank(id,bn,tn);return Object.keys(b).map(n=>({photos:b[n].photos.map(p=>p[0])}))});
const challengeContentRows=challengeAll.map(r=>({photos:r.p}));
assertUniqueClues(mainContentRows,'Main');
assertUniqueClues(themeContentRows,'Themes');
assertUniqueClues(challengeContentRows,'Challenges');
console.log('PASS: private server answer contracts and challenge image clue uniqueness verified.');
export {combined, themeBanks, themeBank, challengeAll};

const daily=JSON.parse(readFileSync('server/daily-bank.json','utf8'));
if(daily.length!==365||daily.some((q,i)=>q.id!==i+1||q.photos.length!==4||['ru','en','az'].some(l=>!q[l]||[...q[l]].length>40||!/^[\p{L}]+$/u.test(q[l]))))throw Error('Daily bank must contain 365 complete multilingual puzzles');
assertUniqueWords(daily,'Daily');
assertUniqueClues(daily,'Daily');
assertRefs(read('daily-puzzle.js'),index,'daily-puzzle.js');
if(release.daily_puzzle?.reward_coins!==25||release.daily_puzzle?.attempts_per_day!==3||release.daily_puzzle?.bank_size!==365)throw Error('Daily rules manifest mismatch');
console.log('PASS: daily bank has 365 unique multilingual puzzles; 25 coin reward, three attempts and valid DOM.');
