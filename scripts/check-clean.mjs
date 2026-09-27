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

for(const file of ['core.js','home.js','game.js','theme-game.js','challenge.js']){
 execFileSync(process.execPath,['--check',resolve(base,file)]);
}

const release=JSON.parse(readFileSync(resolve(base,'release.json'),'utf8'));
if(release.release!=='20260927-r49')throw Error('Unexpected release: '+release.release);
if(!Array.isArray(release.levels)||!release.levels.includes(100))throw Error('Main levels are not published through 100');
if(release.chapters?.length!==10)throw Error('Main chapter navigation must contain 10 chapters');
if(release.chapters.find(x=>x.id===3)?.status!=='live')throw Error('Chapter 3 must be complete');
if(release.chapters.find(x=>x.id===4)?.available_through!==100)throw Error('Chapter 4 preview must be available through 100');
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
for(let n=1;n<=10;n++){
 const hasHome=uiCss.includes('#homeChapter'+n)||uiCss.includes('[data-home-chapter="'+n+'"]');
 const listNeed='#chapter'+n+'Select';
 if(!hasHome||!uiCss.includes(listNeed))throw Error('Missing chapter background '+n);
}
if(release.ui?.chapter_progress_mode!=='absolute_level')throw Error('Release must declare absolute chapter progress');
if(release.ui?.chapter_titles!==true)throw Error('Release must declare chapter title system');
if(!index.includes('id="challengeModes"')||!index.includes('data-challenge="limited"')||!index.includes('data-challenge="nohint"')||!index.includes('data-challenge="blitz"'))throw Error('Challenge mode cards are missing');
if(!index.includes('id="challengeScreen"'))throw Error('Playable challenge screen is missing');
if(!index.includes('./challenge.js'))throw Error('Challenge game module is missing');
if(!homeJs.includes('const CHALLENGE_MODE='))throw Error('Challenge localization is missing');
if(release.challenge_modes?.status!=='playable_test'||release.challenge_modes?.modes?.length!==3)throw Error('Challenge mode manifest is incomplete');
const challengeJs=readFileSync(resolve(base,'challenge.js'),'utf8');
if(!challengeJs.includes("correct_seconds_bonus")&&!challengeJs.includes("deadline+=3000"))throw Error('Blitz +3 second bonus is missing');
if(!challengeJs.includes("deadline-=3000"))throw Error('Blitz wrong-word penalty is missing');
if(!challengeJs.includes("hearts=3"))throw Error('Challenge mistake limit is missing');
if(!challengeJs.includes("ENERGY_MAX=5")||!challengeJs.includes("ENERGY_MS=30*60*1000"))throw Error('Limited-attempt energy model is missing');
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
console.log('PASS: r49 entrypoints, Chapters 1-10, backgrounds, absolute progress, chapter titles and JavaScript syntax.');
