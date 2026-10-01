(() => {
'use strict';
const $=id=>document.getElementById(id),pw=window.PW,endpoint='https://bqoraxewpcnmidvjlpuy.supabase.co/functions/v1/daily-puzzle';
const language=()=>{try{return localStorage.getItem('pw.language')||'ru'}catch{return'ru'}};
const words={
 ru:{title:'Загадка дня',desc:'Новое задание каждый день',rules:'4 эмодзи · 3 попытки · 25 монет за правильный ответ. Новая загадка каждый день.',play:'ОТГАДАТЬ',submit:'ОТВЕТИТЬ',clear:'ОЧИСТИТЬ',shuffle:'ПЕРЕМЕШАТЬ',retry:'ПОВТОРИТЬ ЗАПРОС',loading:'Загружаю загадку…',attempts:n=>'Осталось попыток: '+n+' / 3',won:'Загадка решена!',wonText:'25 монет начислены. До завтра!',lost:'Попытки закончились',lostText:'Сегодня загадка закрыта. Завтра — новые эмодзи и три попытки.',wrong:'Неверно. Попробуй другой ответ.',next:'Новая загадка через ',network:'Не удалось получить ответ сервера. Повтори запрос — дополнительная попытка не спишется.',bot:'Открой игру через Telegram-бота.',home:'НА ГЛАВНУЮ',changed:'Начался новый день. Загадка обновлена.'},
 en:{title:'Daily puzzle',desc:'A new puzzle every day',rules:'4 emoji · 3 attempts · 25 coins for a correct answer. A new puzzle every day.',play:'SOLVE',submit:'SUBMIT',clear:'CLEAR',shuffle:'SHUFFLE',retry:'RETRY REQUEST',loading:'Loading the puzzle…',attempts:n=>'Attempts left: '+n+' / 3',won:'Puzzle solved!',wonText:'25 coins credited. See you tomorrow!',lost:'No attempts left',lostText:'Today’s puzzle is closed. New emoji and three attempts tomorrow.',wrong:'Incorrect. Try another answer.',next:'Next puzzle in ',network:'Could not confirm the server response. Retry the request — it will not cost another attempt.',bot:'Open the game through the Telegram bot.',home:'HOME',changed:'A new day has started. The puzzle has changed.'},
 az:{title:'Günün tapmacası',desc:'Hər gün yeni tapmaca',rules:'4 emoji · 3 cəhd · düzgün cavaba 25 sikkə. Hər gün yeni tapmaca.',play:'TAP',submit:'CAVAB VER',clear:'TƏMİZLƏ',shuffle:'QARIŞDIR',retry:'SORĞUNU TƏKRARLA',loading:'Tapmaca yüklənir…',attempts:n=>'Qalan cəhd: '+n+' / 3',won:'Tapmaca həll edildi!',wonText:'25 sikkə əlavə edildi. Sabah görüşərik!',lost:'Cəhdlər bitdi',lostText:'Bugünkü tapmaca bağlandı. Sabah yeni emojilər və üç cəhd olacaq.',wrong:'Yanlışdır. Başqa cavab yoxla.',next:'Yeni tapmacaya ',network:'Serverin cavabını təsdiqləmək olmadı. Sorğunu təkrarla — əlavə cəhd sərf edilməyəcək.',bot:'Oyunu Telegram botu vasitəsilə aç.',home:'ANA SƏHİFƏ',changed:'Yeni gün başladı. Tapmaca yeniləndi.'}
};
const t=()=>words[language()]||words.ru;
let memoryPending=null;
let daily=null,letters=[],chosen=[],busy=false,syncing=false,epoch=0,serverAt=0,perfAt=0,puzzleKey='';
const active=()=>$('dailyPuzzleScreen').classList.contains('active');
const pendingKey=()=> 'pw.daily.pending.'+(pw?.player?.photoword_id||'local');
function pending(){const key=pendingKey();if(memoryPending?.key===key)return memoryPending.payload;try{const p=JSON.parse(localStorage.getItem(key)||'null');if(p&&typeof p.answer==='string'&&['ru','en','az'].includes(p.language)&&/^\d{4}-\d{2}-\d{2}$/.test(p.day)&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(p.requestId))return p;return null}catch{return null}}
function removePending(key){if(memoryPending?.key===key)memoryPending=null;try{localStorage.removeItem(key)}catch{}}
function initData(){return window.Telegram?.WebApp?.initData||pw?.store?.get('pw.init','')||new URLSearchParams(location.hash.slice(1)).get('tgWebAppData')||new URLSearchParams(location.search).get('tgWebAppData')||''}
async function api(action,extra={}){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
 try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({initData:initData(),action,language:language(),...extra}),signal:controller.signal});const j=await r.json();if(!r.ok)throw Object.assign(new Error(j.error||'server_error'),{data:j});return j}finally{clearTimeout(timeout)}
}
function labels(){const x=t();$('dailyPuzzleCardTitle').textContent=x.title;$('dailyPuzzleCardDesc').textContent=x.desc;$('dailyPuzzleCardBadge').textContent='25 🪙 · 3';$('dailyPuzzleTitle').textContent=x.title;$('dailyPuzzleRules').textContent=x.rules;$('dailyPuzzleSubmit').textContent=x.submit;$('dailyPuzzleClear').textContent=x.clear;$('dailyPuzzleShuffle').textContent=x.shuffle;$('dailyPuzzleRetry').textContent=x.retry;$('dailyPuzzleHome').textContent=x.home;$('dailyPuzzleBack').setAttribute('aria-label',x.home);if(daily)paint()}
function paint(){
 const blocked=busy||Boolean(pending())||!daily||daily.closed;
 const slots=$('dailyPuzzleSlots');if(slots.children.length!==(daily?.length||0))slots.replaceChildren();slots.style.gridTemplateColumns='repeat('+Math.min(daily?.length||1,8)+',minmax(0,1fr))';
 for(let i=0;i<(daily?.length||0);i++){const b=slots.children[i]||document.createElement('button');b.type='button';b.className='slot';b.textContent=chosen[i]===undefined?'':letters[chosen[i]];b.disabled=blocked||chosen[i]===undefined;b.onclick=()=>{if(blocked)return;chosen.splice(i,1);paint()};if(!slots.children[i])slots.append(b)}
 const pool=$('dailyPuzzleLetters');if(pool.children.length!==letters.length)pool.replaceChildren();letters.forEach((ch,i)=>{const b=pool.children[i]||document.createElement('button');b.type='button';b.className='letter'+(chosen.includes(i)?' used':'');b.textContent=ch;b.disabled=blocked||chosen.includes(i)||chosen.length>=(daily?.length||0);b.onclick=()=>{if(blocked||chosen.includes(i)||chosen.length>=daily.length)return;chosen.push(i);paint();pw?.sfx?.('tap')};if(!pool.children[i])pool.append(b)});
 $('dailyPuzzleSubmit').disabled=blocked||chosen.length!==daily?.length;$('dailyPuzzleClear').disabled=blocked||!chosen.length;$('dailyPuzzleShuffle').disabled=blocked;
 $('dailyPuzzleAttempts').textContent=daily?t().attempts(daily.attempts_left):'';
 $('dailyPuzzleBoard').hidden=!daily||daily.closed;$('dailyPuzzleOutcome').hidden=!daily||!daily.closed;
 if(daily?.closed){$('dailyPuzzleOutcomeIcon').textContent=daily.solved?'🏆':'🌙';$('dailyPuzzleOutcomeTitle').textContent=daily.solved?t().won:t().lost;$('dailyPuzzleOutcomeText').textContent=daily.solved?t().wonText:t().lostText}
}
function apply(d){
 const key=d.day+':'+d.language;if(key!==puzzleKey){puzzleKey=key;chosen=[];letters=d.letters;$('dailyPuzzlePhotos').replaceChildren();for(const emoji of d.photos){const e=document.createElement('div');e.className='photo';e.textContent=emoji;$('dailyPuzzlePhotos').append(e)}}
 daily=d;serverAt=Date.parse(d.server_now);perfAt=performance.now();paint();clock();
}
function applyCoins(j){if(Number.isFinite(j.coins))document.querySelectorAll('[data-coins]').forEach(e=>e.textContent=String(j.coins))}
async function deliver(payload,key){
 try{const j=await api('answer',payload);removePending(key);applyCoins(j);return j}
 catch(e){if(['daily_changed','daily_closed'].includes(e.message)){removePending(key);return e.data}throw e}
}
async function load(background=false){
 if(syncing)return;syncing=true;if(!background){busy=true;paint()}const token=epoch;
 try{
  if(!initData())throw new Error('open_bot');await pw.login();
  const payload=pending(),recovered=payload?await deliver(payload,pendingKey()):null;const j=recovered?.daily?.language===language()?recovered:await api('state');
  if(token!==epoch||!active())return;if(payload)chosen=[];if(!background||['day','language','attempts','closed','solved'].some(k=>j.daily[k]!==daily?.[k])){apply(j.daily)}else{serverAt=Date.parse(j.daily.server_now);perfAt=performance.now()}$('dailyPuzzleStatus').textContent=recovered?.result&&!recovered.result.correct?t().wrong:'';$('dailyPuzzleRetry').hidden=true;
 }catch(e){if(token===epoch&&active()){$('dailyPuzzleStatus').textContent=e.message==='open_bot'?t().bot:t().network;$('dailyPuzzleRetry').hidden=false}}
 finally{syncing=false;if(token===epoch&&!background){busy=false;paint()}else if(token!==epoch&&active())load()}
}
async function submit(){
 if(busy||!daily||daily.closed||pending()||chosen.length!==daily.length)return;
 const token=epoch,key=pendingKey(),payload={day:daily.day,language:daily.language,answer:chosen.map(i=>letters[i]).join(''),requestId:crypto.randomUUID()};
 memoryPending={key,payload};try{localStorage.setItem(key,JSON.stringify(payload))}catch{}
 busy=true;paint();
 try{const j=await deliver(payload,key);if(token!==epoch||!active())return;chosen=[];apply(j.daily);$('dailyPuzzleStatus').textContent=j.result?(j.result.correct?'':t().wrong):j.error==='daily_changed'?t().changed:'';$('dailyPuzzleRetry').hidden=true;if(j.result?.correct){pw?.sfx?.('coin');pw?.haptic?.('success');pw.login(true).catch(()=>{})}else pw?.haptic?.('error')}
 catch{if(token===epoch&&active()){$('dailyPuzzleStatus').textContent=t().network;$('dailyPuzzleRetry').hidden=false}}
 finally{if(token===epoch){busy=false;paint()}}
}
function clock(){
 if(!daily)return;const remain=Math.max(0,Date.parse(daily.reset_at)-(serverAt+performance.now()-perfAt)),seconds=Math.ceil(remain/1000),h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=seconds%60;
 $('dailyPuzzleCountdown').textContent=t().next+[h,m,s].map(n=>String(n).padStart(2,'0')).join(':');
 if(remain===0&&active()&&!busy&&!syncing)load();
}
function open(){epoch++;document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('active',e.id==='dailyPuzzleScreen'));window.scrollTo(0,0);labels();$('dailyPuzzleStatus').textContent=t().loading;load()}
function close(){epoch++;busy=false;document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('active',e.id==='home'));window.scrollTo(0,0)}
$('dailyPuzzleCard').onclick=open;$('dailyPuzzleSubmit').onclick=submit;$('dailyPuzzleRetry').onclick=()=>load();$('dailyPuzzleBack').onclick=close;$('dailyPuzzleHome').onclick=close;
$('dailyPuzzleClear').onclick=()=>{if(busy||pending()||daily?.closed)return;chosen=[];paint()};
$('dailyPuzzleShuffle').onclick=()=>{if(busy||pending()||daily?.closed)return;const order=letters.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}const next=order.map(i=>letters[i]);chosen=chosen.map(i=>order.indexOf(i));letters=next;paint()};
setInterval(()=>{if(active())clock()},1000);
setInterval(()=>{if(active()&&!document.hidden&&!busy&&!syncing&&!pending())load(true)},5000);
window.addEventListener('storage',e=>{if(e.key==='pw.language'){labels();if(active())load()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&active())load()});
window.PWDaily={open,close,labels};labels();
})();
