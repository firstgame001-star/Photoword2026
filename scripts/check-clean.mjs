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

for(const file of ['core.js','home.js','game.js','theme-game.js','challenge.js','challenge-bank-extra.js']){
 execFileSync(process.execPath,['--check',resolve(base,file)]);
}

const release=JSON.parse(readFileSync(resolve(base,'release.json'),'utf8'));
if(release.release!=='20260927-r57')throw Error('Unexpected release: '+release.release);
if(!Array.isArray(release.levels)||!release.levels.includes(131))throw Error('Main levels are not published through 131');
if(release.chapters?.length!==12)throw Error('Main chapter navigation must contain 12 chapters');
if(release.chapters.find(x=>x.id===3)?.status!=='live')throw Error('Chapter 3 must be complete');
if(release.chapters.find(x=>x.id===4)?.available_through!==131||release.chapters.find(x=>x.id===4)?.status!=='live')throw Error('Chapter 4 must be complete through 131');
if(release.thematic_mode?.categories?.length!==12)throw Error('Thematic catalog must contain 12 categories');
const sport=release.thematic_mode.categories.find(x=>x.id==='sport');
if(!sport||sport.available_through!==100)throw Error('Sport theme must be playable through level 100');

const index=readFileSync(resolve(base,'index.html'),'utf8');
const themeGame=readFileSync(resolve(base,'theme-game.html'),'utf8');
if(index.includes('id="tasksBtn"')||index.includes('id="tasksModal"'))throw Error('Daily tasks must stay removed');
if(!index.includes('themes-entry-featured'))throw Error('Featured thematic mode card is missing');
if(!index.includes('12 тем · 1200 уровней'))throw Error('Thematic mode headline is missing');
if(!themeGame.includes('data-coins'))throw Error('Thematic game coin balance is missing');
if(themeGame.includes('id="themeSettingsBtn"')||themeGame.includes('id="themeProgress"'))throw Error('Thematic header must contain coins only');
const homeJs=readFileSync(resolve(base,'home.js'),'utf8');
const uiCss=readFileSync(resolve(base,'ui.css'),'utf8');
if(!index.includes('id="profileTitle"'))throw Error('Chapter-earned profile title surface is missing');
if(!homeJs.includes("chapter_progress_mode") && !homeJs.includes('shownChapterLevel'))throw Error('Absolute chapter progress helper is missing');
if(homeJs.includes('requestAnimationFrame(()=>showHomeChapter'))throw Error('Initial carousel must not auto-scroll after profile sync');
for(let n=1;n<=12;n++){
 const hasHome=uiCss.includes('#homeChapter'+n)||uiCss.includes('[data-home-chapter="'+n+'"]');
 const listNeed='#chapter'+n+'Select';
 if(!hasHome||!uiCss.includes(listNeed))throw Error('Missing chapter background '+n);
}
if(release.ui?.chapter_progress_mode!=='absolute_level')throw Error('Release must declare absolute chapter progress');
if(release.ui?.chapter_titles!==true)throw Error('Release must declare chapter title system');
const gameJs=readFileSync(resolve(base,'game.js'),'utf8');
if(!gameJs.includes('for(let n=1;n<=131;n++){')||!gameJs.includes('131:{')||!gameJs.includes('levelId===131'))throw Error('Chapter 4 levels 101-131 are incomplete');
if(!index.includes('data-home-chapter="12"')||!index.includes('id="chapter12Select"')||index.match(/data-dot="/g)?.length!==12)throw Error('Chapter 12 navigation is incomplete');
if(!index.includes('id="challengeModes"')||!index.includes('data-challenge="limited"')||!index.includes('data-challenge="nohint"')||!index.includes('data-challenge="blitz"'))throw Error('Challenge mode cards are missing');
if(!index.includes('id="challengeScreen"'))throw Error('Playable challenge screen is missing');
if(!index.includes('./challenge.js'))throw Error('Challenge game module is missing');
if(!homeJs.includes('const CHALLENGE_MODE='))throw Error('Challenge localization is missing');
if(release.challenge_modes?.status!=='playable_test'||release.challenge_modes?.modes?.length!==3)throw Error('Challenge mode manifest is incomplete');
const challengeJs=readFileSync(resolve(base,'challenge.js'),'utf8');
if(!challengeJs.includes("correct_seconds_bonus")&&!challengeJs.includes("deadline+=3000"))throw Error('Blitz +3 second bonus is missing');
if(!challengeJs.includes("deadline-=3000"))throw Error('Blitz wrong-word penalty is missing');
if(!challengeJs.includes("hearts=3"))throw Error('Challenge mistake limit is missing');
if(!challengeJs.includes("ENERGY_MAX=25")||!challengeJs.includes("ENERGY_MS=30*60*1000"))throw Error('Limited-attempt energy model is missing');
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
console.log('PASS: r57 entrypoints, Chapters 1-12, backgrounds, absolute progress, chapter titles and JavaScript syntax.');
