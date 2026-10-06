const {webkit}=require('playwright'),{expect}=require('playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const banks=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const ranges=[[1,20],[21,50],[51,90],[91,130],[131,180],[181,230],[231,280],[281,330],[331,380],[381,430],[431,480],[481,530],[531,580],[581,630],[631,680]];
const themes=[...new Set(banks.themes.map(r=>r.theme_id))];
const noRussian=async(p,l)=>{if(l==='ru')return;const text=await p.locator('body').innerText();assert(!/[\p{Script=Cyrillic}]/u.test(text),'Mixed language '+l+': '+text)};
(async()=>{const browser=await webkit.launch();for(const l of ['ru','en','az']){
 const errors=[],ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await ctx.addInitScript(l=>{localStorage.setItem('pw.language',l);window.Telegram={WebApp:{initData:'test-fixture',ready(){},expand(){},setHeaderColor(){},setBackgroundColor(){},HapticFeedback:{}}}},l);
 const player={photoword_id:'QA-CONTENT',first_name:'QA',coins:10000,xp:10000,current_level:681,current_chapter:15,completed_levels:680,progress_generation:0};
 await ctx.route('https://telegram.org/**',r=>r.fulfill({body:''}));
 await ctx.route('https://bqoraxewpcnmidvjlpuy.supabase.co/**',async r=>{
  if(r.request().method()==='OPTIONS')return r.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type,apikey'}});
  const q=JSON.parse(r.request().postData()||'{}');let body={player};
  if(q.action==='theme_progress')body={theme_progress:Object.fromEntries(themes.map(t=>[t,Array.from({length:100},(_,i)=>i+1)]))};
  if(q.action==='public_config')body={config:{}};
  if(q.action==='state')body={items:[],challenge:{energy:5},duel:null};
  if(q.action==='offer')body={offer:null};
  if(q.action==='profile_stats')body={stats:{main_levels:680,chapters_completed:15,thematic_levels:1200,themes_completed:12,challenges:{}}};
  if(q.action==='theme_complete'){assert.equal(q.answer,banks.themes.find(x=>x.theme_id===q.themeId&&x.level_id===q.levelId)[l]);body={player,theme_rewarded:false}}
  if(q.action==='complete_level')assert.equal(q.answer,banks.main.find(x=>x.level_id===q.levelId)[l]);
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body),headers:{'Access-Control-Allow-Origin':'*'}});
 });
 await ctx.route('https://content.qa/**',r=>{const u=new URL(r.request().url()),rel=u.pathname==='/clean/'?'clean/index.html':u.pathname.slice(1),f=path.resolve(rel);assert(f.startsWith(process.cwd()+'/clean/'));return r.fulfill({body:fs.readFileSync(f),contentType:rel.endsWith('.js')?'application/javascript':rel.endsWith('.css')?'text/css':'text/html'})});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto('https://content.qa/clean/');await expect(p.locator('#name')).toHaveText('QA');
 for(let i=0;i<ranges.length;i++){const [a,b]=ranges[i];assert((await p.locator('#chapter'+(i+1)+'Label').textContent()).endsWith((i? a:0)+'–'+b));assert((await p.locator('#chapter'+(i+1)+'Play').getAttribute('href')).endsWith('level='+a));}
 await noRussian(p,l);
 await p.locator('#settingsBtn').click();await noRussian(p,l);await p.locator('[data-close="settingsModal"]').click();
 for(const [a,b] of ranges){for(const n of [a,b]){
  await p.goto('https://content.qa/clean/game.html?level='+n);await expect(p.locator('#slots .slot')).toHaveCount([...banks.main[n-1][l]].length);await expect(p.locator('#photos .photo')).toHaveCount(4);assert.equal(await p.evaluate(()=>document.documentElement.lang),l);await noRussian(p,l);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Main overflow '+n+' '+l);
  if(n===b){await p.evaluate(word=>{for(const c of word){const btn=[...document.querySelectorAll('#letters button')].find(x=>x.textContent===c&&!x.disabled);if(!btn)throw Error('Missing '+c);btn.click()}},banks.main[n-1][l]);await expect(p.locator('#successPanel')).toBeVisible();assert((await p.locator('#nextLevel').getAttribute('href')).endsWith(n===680?'index.html':'level='+(n+1)));await noRussian(p,l)}
 }}
 for(const theme of themes)for(const n of [1,100]){
  await p.goto('https://content.qa/clean/theme-game.html?theme='+theme+'&level='+n);const word=banks.themes.find(x=>x.theme_id===theme&&x.level_id===n)[l];await expect(p.locator('#slots .slot')).toHaveCount([...word].length);await expect(p.locator('#photos .photo')).toHaveCount(4);await noRussian(p,l);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Theme overflow '+theme+' '+n+' '+l);
  if(n===100){await expect(p.locator('#letters button').first()).toBeEnabled();await p.evaluate(word=>{for(const c of word){const btn=[...document.querySelectorAll('#letters button')].find(x=>x.textContent===c&&!x.disabled);if(!btn)throw Error('Missing '+c);btn.click()}},word);await expect(p.locator('#successPanel')).toBeVisible();assert((await p.locator('#nextLevel').getAttribute('href')).endsWith('index.html'));await noRussian(p,l)}
 }
 assert.deepEqual(errors,[]);console.log('PASS mobile '+l+': all 15 chapter boundaries, 12 theme boundaries, answer entry, completion navigation, translated screens and horizontal layout.');await ctx.close();
}await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
