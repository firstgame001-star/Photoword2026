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
if(release.release!=='20260927-r39')throw Error('Unexpected release: '+release.release);
if(!Array.isArray(release.levels)||!release.levels.includes(60))throw Error('Main levels are not published through 60');
if(release.thematic_mode?.categories?.length!==12)throw Error('Thematic catalog must contain 12 categories');
const sport=release.thematic_mode.categories.find(x=>x.id==='sport');
if(!sport||sport.available_through!==20)throw Error('Sport theme must be playable through level 20');

const index=readFileSync(resolve(base,'index.html'),'utf8');
const themeGame=readFileSync(resolve(base,'theme-game.html'),'utf8');
if(index.includes('id="tasksBtn"')||index.includes('id="tasksModal"'))throw Error('Daily tasks must stay removed');
if(!index.includes('themes-entry-featured'))throw Error('Featured thematic mode card is missing');
if(!index.includes('12 тем · 1200 уровней'))throw Error('Thematic mode headline is missing');
if(!themeGame.includes('data-coins'))throw Error('Thematic game coin balance is missing');
if(themeGame.includes('id="themeSettingsBtn"')||themeGame.includes('id="themeProgress"'))throw Error('Thematic header must contain coins only');
console.log('PASS: clean entrypoints, r39 manifest, thematic mode, reward balance and JavaScript syntax.');
