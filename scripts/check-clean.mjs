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

for(const file of ['core.js','home.js','game.js','theme-game.js']){
 execFileSync(process.execPath,['--check',resolve(base,file)]);
}

const release=JSON.parse(readFileSync(resolve(base,'release.json'),'utf8'));
if(release.release!=='20260927-r42')throw Error('Unexpected release: '+release.release);
if(!Array.isArray(release.levels)||!release.levels.includes(100))throw Error('Main levels are not published through 100');
if(release.chapters?.length!==10)throw Error('Main chapter navigation must contain 10 chapters');
if(release.chapters.find(x=>x.id===3)?.status!=='live')throw Error('Chapter 3 must be complete');
if(release.chapters.find(x=>x.id===4)?.available_through!==100)throw Error('Chapter 4 preview must be available through 100');
if(release.thematic_mode?.categories?.length!==12)throw Error('Thematic catalog must contain 12 categories');
const sport=release.thematic_mode.categories.find(x=>x.id==='sport');
if(!sport||sport.available_through!==50)throw Error('Sport theme must be playable through level 50');

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
console.log('PASS: r42 entrypoints, Chapters 1-10, backgrounds, absolute progress, chapter titles and JavaScript syntax.');
