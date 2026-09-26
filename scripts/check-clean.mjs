import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
const base=resolve('clean');
for(const page of ['index.html','game.html']){
 const path=resolve(base,page), html=readFileSync(path,'utf8');
 const scripts=[...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m=>m[1]);
 if(scripts[0]!=='https://telegram.org/js/telegram-web-app.js')throw Error('Incorrect Telegram SDK: '+page);
 if(!scripts.some(s=>s.startsWith('./core.js')))throw Error('Missing shared core: '+page);
 if(!scripts.some(s=>s.startsWith(page==='index.html'?'./home.js':'./game.js')))throw Error('Missing page module: '+page);
 for(const [,ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  if(ref.startsWith('https://'))continue;
  const target=resolve(dirname(path),ref.split('?')[0]);
  if(!target.startsWith(base+'/')||!existsSync(target))throw Error('Missing or invalid local file: '+ref);
 }
}
for(const file of ['core.js','home.js','game.js'])execFileSync(process.execPath,['--check',resolve(base,file)]);
console.log('PASS: clean entrypoints, script sources, local files and JavaScript syntax.');
