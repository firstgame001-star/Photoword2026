import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const base=resolve('clean');
const pages={
  'index.html':'./home.js',
  'game.html':'./game.js',
  'theme-game.html':'./theme-game.js'
};

for(const [page,module] of Object.entries(pages)){
 const path=resolve(base,page), html=readFileSync(path,'utf8');
 const scripts=[...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m=>m[1]);
 if(scripts[0]!=='https://telegram.org/js/telegram-web-app.js')throw Error('Incorrect Telegram SDK: '+page);
 if(!scripts.some(s=>s.startsWith('./core.js')))throw Error('Missing shared core: '+page);
 if(!scripts.some(s=>s.startsWith(module)))throw Error('Missing page module '+module+': '+page);
 for(const [,ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  if(ref.startsWith('https://'))continue;
  const target=resolve(dirname(path),ref.split('?')[0]);
  if(!target.startsWith(base+'/')||!existsSync(target))throw Error('Missing or invalid local file: '+ref);
 }
}

for(const file of ['core.js','home.js','game.js','main-levels-8-9.js','main-levels-10-12.js','theme-game.js','theme-levels-cinema-food.js','theme-levels-expansion.js','challenge.js','challenge-repeat-index.js','challenge-repeat-policy.js','challenge-bank-extra.js','duel.js']){
 execFileSync(process.execPath,['--check',resolve(base,file)]);
}

const release=JSON.parse(readFileSync(resolve(base,'release.json'),'utf8'));
if(release.release!=='20261002-r118')throw Error('Unexpected release: '+release.release);
if(release.duel_mode?.entry_min_coins!==25||release.duel_mode?.entry_max_coins!==500||release.duel_mode?.winner_payout_percent_of_pot!==90)throw Error('Duel configuration mismatch');
if(release.duel_mode?.question_pool!==150||release.duel_mode?.recent_matches_excluded_per_player!==2||release.duel_mode?.rematch!==true)throw Error('Rematch and question pool manifest mismatch');
const duelHtml=readFileSync(resolve(base,'index.html'),'utf8');
for(const id of ['duelRematch','duelRematchSetup','duelRematchStake','duelRematchConfirm','duelAcceptRematch']){
 if(!duelHtml.includes('id="'+id+'"'))throw Error('Missing duel control: '+id);
}
if(!Array.isArray(release.levels)||!release.levels.includes(530))throw Error('Main levels are not published through 530');
if(release.chapters?.length!==12)throw Error('Main chapter navigation must contain 12 chapters');
if(release.chapters.find(x=>x.id===3)?.status!=='live')throw Error('Chapter 3 must be complete');
if(release.chapters.find(x=>x.id===4)?.available_through!==130||release.chapters.find(x=>x.id===4)?.status!=='live')throw Error('Chapter 4 must be complete through 130');
if(release.chapters.find(x=>x.id===5)?.available_through!==180||release.chapters.find(x=>x.id===5)?.status!=='live')throw Error('Chapter 5 must be complete through 180');
if(release.chapters.find(x=>x.id===6)?.available_through!==230||release.chapters.find(x=>x.id===6)?.status!=='live')throw Error('Chapter 6 must be complete through 230');
if(release.chapters.find(x=>x.id===7)?.available_through!==280||release.chapters.find(x=>x.id===7)?.status!=='live')throw Error('Chapter 7 must be complete through 280');
if(release.chapters.find(x=>x.id===8)?.available_through!==330||release.chapters.find(x=>x.id===8)?.status!=='live')throw Error('Chapter 8 must be complete through 330');
if(release.chapters.find(x=>x.id===9)?.available_through!==380||release.chapters.find(x=>x.id===9)?.status!=='live')throw Error('Chapter 9 must be complete through 380');
if(release.thematic_mode?.categories?.length!==12)throw Error('Thematic catalog must contain 12 categories');
if(release.verification?.thematic_answers_unique_across_ready_categories!==true)throw Error('Cross-theme answer uniqueness flag is missing');
if(release.thematic_mode?.economy?.first_completion?.coins!==15||release.thematic_mode?.economy?.first_completion?.xp!==10||release.thematic_mode?.economy?.replay_reward!==false)throw Error('Thematic completion reward manifest is incorrect');
if(release.thematic_mode?.economy?.hints?.letter!==50||release.thematic_mode?.economy?.hints?.remove!==100||release.thematic_mode?.economy?.hints?.text!==150||release.thematic_mode?.economy?.hints?.shuffle!==0)throw Error('Thematic hint prices are incorrect');
if(release.thematic_mode?.economy?.server_authoritative!==true||release.verification?.thematic_economy_server_authoritative!==true)throw Error('Thematic economy must be server-authoritative');
if(release.verification?.thematic_win_reward_coins!==15)throw Error('Thematic win reward verification is incorrect');
if(release.verification?.thematic_progress_server_sync!==true||release.thematic_mode?.progress_sync?.server_authoritative!==true||release.thematic_mode?.progress_sync?.cross_device!==true)throw Error('Thematic progress sync manifest is incomplete');
const sport=release.thematic_mode.categories.find(x=>x.id==='sport');
if(!sport||sport.available_through!==100||sport.status!=='complete')throw Error('Sport theme must be playable through level 100');
const art=release.thematic_mode.categories.find(x=>x.id==='art');
if(!art||art.available_through!==100||art.status!=='complete')throw Error('Art theme must be playable through level 100');
const professions=release.thematic_mode.categories.find(x=>x.id==='professions');
if(!professions||professions.available_through!==100||professions.status!=='complete')throw Error('Professions theme must be playable through level 100');
const travel=release.thematic_mode.categories.find(x=>x.id==='travel');
if(!travel||travel.available_through!==100||travel.status!=='complete')throw Error('Travel theme must be playable through level 100');
const science=release.thematic_mode.categories.find(x=>x.id==='science');
if(!science||science.available_through!==100||science.status!=='complete')throw Error('Science theme must be playable through level 100');
for(const id of ['cinema','food','animals','transport','home','nature']){const category=release.thematic_mode.categories.find(x=>x.id===id);if(category?.available_through!==100||category.status!=='complete')throw Error(id+' theme must have 100 completed levels');}
const technology=release.thematic_mode.categories.find(x=>x.id==='technology');
if(!technology||technology.available_through!==100||technology.status!=='complete')throw Error('Technology theme must be playable through level 100');

const index=readFileSync(resolve(base,'index.html'),'utf8');
const themeGame=readFileSync(resolve(base,'theme-game.html'),'utf8');
const themeGameJs=readFileSync(resolve(base,'theme-game.js'),'utf8');
const addedThemes=Function('window={};'+(readFileSync(resolve(base,'theme-levels-cinema-food.js'),'utf8')+readFileSync(resolve(base,'theme-levels-expansion.js'),'utf8'))+';return window.PW_THEME_EXTRA')();
for(const id of ['cinema','food','animals','transport','home','nature'])if(!Array.isArray(addedThemes[id])||addedThemes[id].length!==100)throw Error(id+' must have 100 levels');
if(index.includes('id="tasksBtn"')||index.includes('id="tasksModal"'))throw Error('Daily tasks must stay removed');
if(!index.includes('themes-entry-featured'))throw Error('Featured thematic mode card is missing');
if(!index.includes('12 тем · 1200 уровней'))throw Error('Thematic mode headline is missing');
if(!themeGame.includes('data-coins'))throw Error('Thematic game coin balance is missing');
if(themeGame.includes('id="themeSettingsBtn"')||themeGame.includes('id="themeProgress"'))throw Error('Thematic header must contain coins only');
if(!themeGameJs.includes("pw.actionRequest('theme_complete'")||!themeGameJs.includes("pw.actionRequest('theme_hint'")||!themeGameJs.includes("HINT_COSTS={letter:50,remove:100,text:150}")||!themeGameJs.includes("THEME_REWARD_COINS=15,THEME_REWARD_XP=10"))throw Error('Thematic reward/hint economy client wiring is missing');
if(!themeGame.includes('💡 50')||!themeGame.includes('🪄 100')||!themeGame.includes('150 🪙'))throw Error('Thematic hint prices must be visible in the UI');
if(!themeGameJs.includes('const ART_LEVELS={')||!themeGameJs.includes('const ART_TRANSLATED={'))throw Error('Art theme bank is missing');
if(!themeGameJs.includes('const PROF_LEVELS=')||!themeGameJs.includes('const PROF_TRANSLATED='))throw Error('Professions theme bank is missing');
if(!themeGameJs.includes('const TRAVEL_LEVELS=')||!themeGameJs.includes('const TRAVEL_TRANSLATED='))throw Error('Travel theme bank is missing');
if(!themeGameJs.includes('const SCIENCE_LEVELS=')||!themeGameJs.includes('const SCIENCE_TRANSLATED='))throw Error('Science theme bank is missing');
if(!themeGameJs.includes('const TECHNOLOGY_LEVELS=')||!themeGameJs.includes('const TECHNOLOGY_TRANSLATED='))throw Error('Technology theme bank is missing');
if(!themeGameJs.includes("['sport','art','professions','travel','science','technology','cinema','food','animals','transport','home','nature'].includes(themeParam)")||!themeGameJs.includes("return 'pw.themeProgress.'+themeId")||!themeGameJs.includes("theme='+themeId+'&level="))throw Error('Thematic routing/progress is not category-specific');
const artBank=themeGameJs.match(/const ART_LEVELS=\{\n([\s\S]*?)\n\};\nconst ART_TRANSLATED=/);
if(!artBank||(artBank[1].match(/^\s*\d+:\{/gm)||[]).length!==100)throw Error('Art theme must contain 100 levels');
const profBank=themeGameJs.match(/const PROF_LEVELS=\{\n([\s\S]*?)\n\};\nconst PROF_TRANSLATED=/);
if(!profBank||(profBank[1].match(/^\s*"?(?:\d+)"?:\s*\{/gm)||[]).length!==100)throw Error('Professions theme must contain 100 levels');
const travelBank=themeGameJs.match(/const TRAVEL_LEVELS=\{\n([\s\S]*?)\n\};\nconst TRAVEL_TRANSLATED=/);
if(!travelBank||(travelBank[1].match(/^\s*"?(?:\d+)"?:\s*\{/gm)||[]).length!==100)throw Error('Travel theme must contain 100 levels');
const scienceBank=themeGameJs.match(/const SCIENCE_LEVELS=\{\n([\s\S]*?)\n\};\nconst SCIENCE_TRANSLATED=/);
if(!scienceBank||(scienceBank[1].match(/^\s*"?(?:\d+)"?:\s*\{/gm)||[]).length!==100)throw Error('Science theme must contain 100 levels');
const technologyBank=themeGameJs.match(/const TECHNOLOGY_LEVELS=\{\n([\s\S]*?)\n\};\nconst TECHNOLOGY_TRANSLATED=/);
if(!technologyBank||(technologyBank[1].match(/^\s*"?(?:\d+)"?:\s*\{/gm)||[]).length!==100)throw Error('Technology theme must contain 100 levels');
const homeJs=readFileSync(resolve(base,'home.js'),'utf8');
if(!homeJs.includes("const READY_THEME_IDS=['sport','art','professions','travel','science','technology','cinema','food','animals','transport','home','nature']")||!homeJs.includes("READY_THEME_IDS.includes(id)"))throw Error('Cinema/Food themes must be enabled in the category hub');
const uiCss=readFileSync(resolve(base,'ui.css'),'utf8');
if(!index.includes('id="profileTitle"'))throw Error('Chapter-earned profile title surface is missing');
if(!index.includes('id="profileThemeDone"')||!index.includes('id="profileLimitedBest"')||!index.includes('id="profileBlitzStreak"'))throw Error('Detailed profile statistics UI is missing');
if(!homeJs.includes("actionRequest('profile_stats')")||!homeJs.includes("rank.className='rank-place'"))throw Error('Profile stats or enriched leaderboard client is missing');
if(release.verification?.profile_stats_server!==true||release.verification?.profile_challenge_records!==true||release.verification?.leaderboard_titles_and_progress!==true)throw Error('Profile/leaderboard manifest is incomplete');
if(release.verification?.shop_status_server!==true||release.verification?.shop_purchase_history!==true||release.verification?.shop_energy_status!==true||release.verification?.shop_ad_daily_status!==true)throw Error('Shop manifest is incomplete');
if(release.verification?.chapter_range_labels_absolute!==true||release.verification?.reward_toasts_auto_hide!==true||release.verification?.ad_unavailable_state_clear!==true)throw Error('r85 UX fixes missing');
if(release.verification?.notification_preferences_server!==true||release.verification?.notification_scheduler!==true||release.verification?.notification_daily_reward!==true||release.verification?.notification_energy_full!==true||release.verification?.notification_chapter_unlock!==true)throw Error('Notification manifest is incomplete');
if(!index.includes('id="notificationsModal"')||!index.includes('id="notificationsMaster"')||!index.includes('id="notificationDaily"')||!index.includes('id="notificationEnergy"')||!index.includes('id="notificationChapter"'))throw Error('Notification preferences UI is incomplete');
if(!homeJs.includes("actionRequest('notification_state')")||!homeJs.includes("actionRequest('update_notifications'")||!homeJs.includes("actionRequest('test_notification'"))throw Error('Notification client actions are missing');
if(!index.includes('id="shopBalance"')||!index.includes('id="shopEnergyValue"')||!index.includes('id="shopAdsValue"')||!index.includes('id="shopHistory"'))throw Error('Shop dashboard UI is incomplete');
if(!homeJs.includes("actionRequest('shop_status')")||!homeJs.includes('renderShopHistory')||!homeJs.includes('waitForEnergyCredit'))throw Error('Shop client synchronization is incomplete');
if(homeJs.includes('requestAnimationFrame(()=>showHomeChapter'))throw Error('Initial carousel must not auto-scroll after profile sync');
for(let n=1;n<=12;n++){
 const hasHome=uiCss.includes('#homeChapter'+n)||uiCss.includes('[data-home-chapter="'+n+'"]');
 const listNeed='#chapter'+n+'Select';
 if(!hasHome||!uiCss.includes(listNeed))throw Error('Missing chapter background '+n);
}
if(release.ui?.chapter_progress_mode!=='absolute_range')throw Error('Release must declare absolute chapter ranges');
if(release.ui?.global_statistics!==true||release.duel_mode?.statistics?.server_authoritative!==true)throw Error('Global and duel statistics must be declared');
if(release.verification?.chapter_start_values_absolute!==true)throw Error('Absolute chapter start values are not declared');
if(release.ui?.chapter_titles!==true)throw Error('Release must declare chapter title system');
const gameJs=readFileSync(resolve(base,'game.js'),'utf8');
const mainExtraJs=readFileSync(resolve(base,'main-levels-8-9.js'),'utf8');
const mainMoreJs=readFileSync(resolve(base,'main-levels-10-12.js'),'utf8');
if(!gameJs.includes('for(let n=1;n<=530;n++){')||!gameJs.includes('levelId===280')||!gameJs.includes('levelId===330')||!gameJs.includes('levelId===380')||!mainExtraJs.includes('"id": 281')||!mainExtraJs.includes('"id": 380'))throw Error('Main levels through Chapter 9 are incomplete');

const mainBase=gameJs.slice(gameJs.indexOf('const LEVELS'),gameJs.indexOf('const TRANSLATED='));
const mainTranslated=gameJs.slice(gameJs.indexOf('const TRANSLATED='));
const mainEnStart=mainTranslated.indexOf('en:{'),mainAzStart=mainTranslated.indexOf('az:{');
const mainEn=mainTranslated.slice(mainEnStart,mainAzStart);
const mainAz=mainTranslated.slice(mainAzStart,mainTranslated.indexOf('\n  };',mainAzStart));
function extractMainAnswers(section){
 return [...section.matchAll(/\b\d+:\{[^}]*["']?answer["']?\s*:\s*["']([^"']+)["']/g)].map(m=>m[1]);
}
const extraRows=[...Function('window={};'+mainExtraJs+';return window.PW_MAIN_EXTRA')(),...Function('window={};'+mainMoreJs+';return window.PW_MAIN_MORE')()];
for(const [langCode,section] of [['ru',mainBase],['en',mainEn],['az',mainAz]]){
 const answers=extractMainAnswers(section).concat(extraRows.map(row=>row[langCode].answer));
 if(answers.length!==530)throw Error('Expected 530 main answers for '+langCode+', got '+answers.length);
 const seen=new Set();
 for(const answer of answers){if(seen.has(answer))throw Error('Duplicate main answer in '+langCode+': '+answer);seen.add(answer);}
}
if(release.verification?.main_answers_unique_all_languages!==true)throw Error('Main answer uniqueness flag is missing');
if(!index.includes('data-home-chapter="12"')||!index.includes('id="chapter12Select"')||index.match(/data-dot="/g)?.length!==12)throw Error('Chapter 12 navigation is incomplete');
if(!index.includes('id="chapter4Progress"')||!index.includes('id="homeChapter4Progress"')||!index.includes('91–130'))throw Error('Chapter 4 UI is incomplete');
if(!index.includes('id="chapter5Progress"')||!index.includes('id="homeChapter5Progress"')||!index.includes('131–180'))throw Error('Chapter 5 UI is incomplete');
if(!index.includes('id="chapter6Progress"')||!index.includes('id="homeChapter6Progress"')||!index.includes('181–230'))throw Error('Chapter 6 UI is incomplete');
if(!index.includes('id="chapter7Progress"')||!index.includes('id="homeChapter7Progress"')||!index.includes('231–280'))throw Error('Chapter 7 UI is incomplete');
if(!index.includes('id="chapter8Progress"')||!index.includes('id="homeChapter8Progress"')||!index.includes('281–330'))throw Error('Chapter 8 UI is incomplete');
if(!index.includes('id="chapter9Progress"')||!index.includes('id="homeChapter9Progress"')||!index.includes('331–380'))throw Error('Chapter 9 UI is incomplete');
for(const [n,range] of [[10,'381–430'],[11,'431–480'],[12,'481–530']])if(!index.includes('id="chapter'+n+'Progress"')||!index.includes('id="homeChapter'+n+'Progress"')||!index.includes(range))throw Error('Chapter '+n+' UI is incomplete');
if(!index.includes('id="challengeModes"')||!index.includes('data-challenge="limited"')||!index.includes('data-challenge="nohint"')||!index.includes('data-challenge="blitz"'))throw Error('Challenge mode cards are missing');
if(!index.includes('id="challengeScreen"'))throw Error('Playable challenge screen is missing');
if(!index.includes('./challenge.js'))throw Error('Challenge game module is missing');
if(!homeJs.includes('syncThemeProgress')||!homeJs.includes("actionRequest('theme_progress')"))throw Error('Home thematic server sync is missing');
if(!themeGameJs.includes('syncServerThemeProgress')||!themeGameJs.includes("actionRequest('theme_progress')"))throw Error('Thematic game server sync is missing');
if(!homeJs.includes('const CHALLENGE_MODE='))throw Error('Challenge localization is missing');
if(release.challenge_modes?.status!=='playable_test'||release.challenge_modes?.modes?.length!==3)throw Error('Challenge mode manifest is incomplete');
if(release.verification?.challenge_rewards_live!==true||release.challenge_modes?.rewards?.server_authoritative!==true||release.challenge_modes?.rewards?.rewarded_runs_per_mode_per_day!==3)throw Error('Challenge reward economy is incomplete');
const challengeJs=readFileSync(resolve(base,'challenge.js'),'utf8');
if(!challengeJs.includes("correct_seconds_bonus")&&!challengeJs.includes("deadline+=3000"))throw Error('Blitz +3 second bonus is missing');
if(!challengeJs.includes("deadline-=3000"))throw Error('Blitz wrong-word penalty is missing');
if(!challengeJs.includes("hearts=3"))throw Error('Challenge mistake limit is missing');
if(!challengeJs.includes("ENERGY_MAX=5")||!challengeJs.includes("ENERGY_MS=30*60*1000"))throw Error('Limited-attempt energy model is missing');
if(challengeJs.includes("reserve_energy"))throw Error('Energy reserve must not exist');
if(release.challenge_modes?.energy_stars?.base_energy_max!==5)throw Error('Energy maximum must be 5');
if(Object.keys(release.challenge_modes?.energy_stars?.packs||{}).join(',')!=='e1,e5')throw Error('Energy shop must contain only e1 and e5');
if(!index.includes('data-energy-store-pack="e1"')||!index.includes('data-energy-store-pack="e5"'))throw Error('Main shop energy buttons are missing');
if(index.includes('data-energy-pack="e10"')||index.includes('data-energy-pack="e20"'))throw Error('Oversized energy packs must be removed');
if(!challengeJs.includes('syncTrustedClock')||!challengeJs.includes('trustedNow'))throw Error('Trusted server clock sync is missing');
if(!challengeJs.includes('performance.now()+60000')||!challengeJs.includes('deadline-performance.now()'))throw Error('Blitz must use a monotonic clock');
if(release.challenge_modes?.anti_clock_cheat?.enabled!==true)throw Error('Anti clock-cheat manifest flag is missing');
if(!challengeJs.includes("'🛡️'.repeat")||!challengeJs.includes("'💥'.repeat"))throw Error('Shield mistake indicator is missing');
if(release.challenge_modes?.mistake_indicator?.active!=='🛡️'||release.challenge_modes?.mistake_indicator?.lost!=='💥')throw Error('Mistake indicator manifest is incorrect');
if(!index.includes('id="blitzLetterHint"')||!index.includes('id="blitzRemoveHint"')||!index.includes('id="blitzTextHint"'))throw Error('Blitz hint controls are missing');
if(!challengeJs.includes("hintLetter:'Буква открыта. −75")||!challengeJs.includes("hintRemove:'Лишние буквы убраны. −125")||!challengeJs.includes("hintText:'Текстовая подсказка открыта. −200"))throw Error('Blitz hint pricing/copy is missing');
const blitz=release.challenge_modes?.modes?.find(x=>x.id==='blitz');
if(blitz?.hints?.letter?.cost_coins!==75||blitz?.hints?.remove?.cost_coins!==125||blitz?.hints?.text?.cost_coins!==200)throw Error('Blitz hint manifest pricing is incorrect');
if(!index.includes('id="challengeCorrectPanel"')||!index.includes('id="challengeCorrectNext"'))throw Error('Challenge correct-answer step is missing');
if(!challengeJs.includes("correctWord:'Верно!'")||!challengeJs.includes("nextWord:'ДАЛЬШЕ'"))throw Error('Challenge correct-answer localization is missing');
if(release.challenge_modes?.correct_answer_step?.limited_attempts!=='manual_next'||release.challenge_modes?.correct_answer_step?.no_hints!=='manual_next'||release.challenge_modes?.correct_answer_step?.blitz!=='fast_auto_next')throw Error('Challenge next-step manifest is incorrect');
const qMatch=challengeJs.match(/const Q=(\[[\s\S]*?\]);\nif\(Array\.isArray\(window\.PW_CHALLENGE_EXTRA\)\)/);
if(!qMatch)throw Error('Challenge base question bank is missing');
const qBank=JSON.parse(qMatch[1]);
const extraJs=readFileSync(resolve(base,'challenge-bank-extra.js'),'utf8');
const eMatch=extraJs.match(/window\.PW_CHALLENGE_EXTRA=(\[[\s\S]*\]);\}\)\(\);/);
if(!eMatch)throw Error('Challenge extra question bank is missing');
const extraBank=JSON.parse(eMatch[1]);
const fullBank=[...qBank,...extraBank];
if(fullBank.length!==400)throw Error('Challenge question bank must contain 400 words');
if(fullBank.some(x=>!x.ru||!x.en||!x.az||!Array.isArray(x.p)||x.p.length!==4))throw Error('Challenge question bank contains incomplete entries');
if(new Set(fullBank.map(x=>x.ru)).size!==400)throw Error('Challenge question bank contains duplicate RU answers');
if(new Set(fullBank.map(x=>x.en)).size!==400)throw Error('Challenge question bank contains duplicate EN answers');
if(new Set(fullBank.map(x=>x.az)).size!==400)throw Error('Challenge question bank contains duplicate AZ answers');
if(release.challenge_modes?.question_bank?.total!==400||release.challenge_modes?.question_bank?.no_repeat_until_exhausted!==true)throw Error('Challenge question-bank manifest is incorrect');
if(release.challenge_modes?.question_bank?.unique_in_each_language!==true)throw Error('Challenge bank uniqueness manifest is missing');
if(!challengeJs.includes("BANK_VERSION='r54-400'")||!challengeJs.includes('pw.challenge.deck.')||!challengeJs.includes('pw.challenge.last.'))throw Error('Non-repeating challenge deck is missing');
if(!homeJs.includes('function showRequiredLanguagePicker(){if(getLang())return;'))throw Error('Language picker re-open guard is missing');
if(release.ui?.language_gate_fix!=='first_launch_unset_then_persist_choice')throw Error('Language gate fix manifest is missing');
if(!homeJs.includes("sessionStorage.getItem('pw.profileSyncedShown')")||!homeJs.includes("setTimeout(()=>{const e=$('status')"))throw Error('One-time profile sync notice is missing');
if(release.ui?.profile_synced_notice?.show!=='once_per_session'||release.ui?.profile_synced_notice?.auto_hide_ms!==1800)throw Error('Profile sync notice manifest is incorrect');
if(!homeJs.includes("applyLanguage('ru',false)")||!homeJs.includes("function applyLanguage(l,persist=true)"))throw Error('First-launch language selection flow is incorrect');
console.log('PASS: r118 entrypoints, Chapters 1-12, backgrounds, absolute progress, chapter titles and JavaScript syntax.');
