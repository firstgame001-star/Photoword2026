(() => {
'use strict';
const $=id=>document.getElementById(id),pw=window.PW;
const modeParam=new URLSearchParams(location.search).get('challenge');
const lang=()=>{try{return localStorage.getItem('pw.language')||'ru'}catch{return'ru'}};
const ENDPOINT='https://bqoraxewpcnmidvjlpuy.supabase.co/functions/v1/challenge-game';
const ENERGY_MAX=5,ENERGY_MS=30*60*1000;
const Q=[
 {ru:'СОБАКА',en:'DOG',az:'İT',p:['🐕','🥣','🦴','🐾']},{ru:'КОШКА',en:'CAT',az:'PİŞİK',p:['🐈','🧶','🥛','😺']},
 {ru:'МОРЕ',en:'SEA',az:'DƏNİZ',p:['🌊','🐚','⛵','🏖️']},{ru:'ДОЖДЬ',en:'RAIN',az:'YAĞIŞ',p:['☔','🌧️','💧','🌈']},
 {ru:'ВРЕМЯ',en:'TIME',az:'ZAMAN',p:['⌚','⏳','📅','🕰️']},{ru:'ТЕПЛО',en:'WARMTH',az:'İSTİ',p:['🔥','☀️','🧣','🌡️']},
 {ru:'ПАМЯТЬ',en:'MEMORY',az:'YADDAŞ',p:['🧠','📸','💾','🕰️']},{ru:'СВЕТ',en:'LIGHT',az:'İŞIQ',p:['💡','🔦','🌅','🕯️']},
 {ru:'ПУТЬ',en:'PATH',az:'YOL',p:['🛣️','🧭','🥾','📍']},{ru:'ТАЙНА',en:'SECRET',az:'SİRR',p:['🔐','🤫','🕵️','❓']},
 {ru:'ТЕНЬ',en:'SHADOW',az:'KÖLGƏ',p:['👤','☀️','🌳','💡']},{ru:'СЛЕД',en:'TRACE',az:'İZ',p:['👣','🐾','🚗','🕵️']},
 {ru:'ВОЛНА',en:'WAVE',az:'DALĞA',p:['🌊','📻','🔊','〰️']},{ru:'КЛЮЧ',en:'KEY',az:'AÇAR',p:['🔑','🔒','🎼','⌨️']},
 {ru:'КОРЕНЬ',en:'ROOT',az:'KÖK',p:['🌳','🦷','√','🥕']},{ru:'СЕТЬ',en:'NET',az:'ŞƏBƏKƏ',p:['🕸️','🎣','🌐','📡']},
 {ru:'КАДР',en:'FRAME',az:'KADR',p:['🎞️','📸','🖼️','🎬']},{ru:'ИСТОЧНИК',en:'SOURCE',az:'MƏNBƏ',p:['⛲','💡','📚','🔋']},
 {ru:'ГОЛ',en:'GOAL',az:'QOL',p:['⚽','🥅','🎉','📣']},{ru:'МАТЧ',en:'MATCH',az:'MATÇ',p:['⏱️','👥','🏟️','📺']},
 {ru:'ТРЕНЕР',en:'COACH',az:'MƏŞQÇİ',p:['📋','🗣️','🏃','👥']},{ru:'СТАДИОН',en:'STADIUM',az:'STADİON',p:['🎟️','👥','💡','🏟️']},
 {ru:'МЕДАЛЬ',en:'MEDAL',az:'MEDAL',p:['🏁','🏆','🎖️','🥇']},{ru:'ЧЕМПИОН',en:'CHAMPION',az:'ÇEMPİON',p:['🏆','👑','🥇','🎉']}
];
const I={
 ru:{limited:['❤️','Ограниченные попытки','10 слов · 3 ошибки на попытку · один запуск тратит 1 энергию. Энергия восстанавливается по 1 каждые 30 минут.'],nohint:['🚫','Без подсказок','Подсказок нет. Есть 3 ошибки. Проходи сколько сможешь, серия сбрасывается после неверного слова.'],blitz:['⚡','Блиц','60 секунд. Верное слово: +1 очко и +3 сек. Неверное полностью введённое слово: −3 сек и сброс серии.'],start:'НАЧАТЬ',again:'ЕЩЁ РАЗ',restart:'НАЧАТЬ ЗАНОВО',home:'НА ГЛАВНУЮ',words:'Слова',errors:'Ошибки',energy:'Энергия',record:'Рекорд',series:'Серия',passed:'Пройдено',time:'Время',points:'Очки',correct:'Верно! +3 сек',wrong:'Неверное слово',done:'Попытка завершена',timeDone:'Время вышло',energyEmpty:'Энергия закончилась',wait:'До следующей энергии',full:'Энергия полная',refill:'⭐ ВОССТАНОВИТЬ ЭНЕРГИЮ',refillNote:'Покупку через Telegram Stars подключим после выбора цены.',serverFallback:'Тестовый режим: состояние сохранено на устройстве.'},
 en:{limited:['❤️','Limited attempts','10 words · 3 mistakes per run · one run costs 1 energy. Energy restores by 1 every 30 minutes.'],nohint:['🚫','No hints','No hints. You have 3 mistakes. Go as far as you can; the streak resets after a wrong word.'],blitz:['⚡','Blitz','60 seconds. Correct word: +1 point and +3 sec. A fully entered wrong word: −3 sec and streak reset.'],start:'START',again:'PLAY AGAIN',restart:'START OVER',home:'HOME',words:'Words',errors:'Mistakes',energy:'Energy',record:'Record',series:'Streak',passed:'Solved',time:'Time',points:'Points',correct:'Correct! +3 sec',wrong:'Wrong word',done:'Run finished',timeDone:'Time is up',energyEmpty:'No energy left',wait:'Next energy in',full:'Energy full',refill:'⭐ REFILL ENERGY',refillNote:'Telegram Stars refill will be connected after the price is chosen.',serverFallback:'Test mode: state is saved on this device.'},
 az:{limited:['❤️','Məhdud cəhdlər','10 söz · hər cəhddə 3 səhv · bir başlanğıc 1 enerji sərf edir. Enerji hər 30 dəqiqədən bir 1 vahid bərpa olunur.'],nohint:['🚫','İpucusuz','İpucu yoxdur. 3 səhv haqqın var. Bacardığın qədər davam et; səhv sözdən sonra seriya sıfırlanır.'],blitz:['⚡','Blits','60 saniyə. Düzgün söz: +1 xal və +3 san. Tam yazılmış səhv söz: −3 san və seriya sıfırlanır.'],start:'BAŞLA',again:'YENƏ OYNA',restart:'YENİDƏN BAŞLA',home:'ANA SƏHİFƏ',words:'Sözlər',errors:'Səhvlər',energy:'Enerji',record:'Rekord',series:'Seriya',passed:'Keçildi',time:'Vaxt',points:'Xal',correct:'Düzdür! +3 san',wrong:'Söz yanlışdır',done:'Cəhd bitdi',timeDone:'Vaxt bitdi',energyEmpty:'Enerji bitdi',wait:'Növbəti enerjiyə',full:'Enerji doludur',refill:'⭐ ENERJİNİ BƏRPA ET',refillNote:'Telegram Stars ilə bərpa qiymət seçildikdən sonra qoşulacaq.',serverFallback:'Test rejimi: vəziyyət bu cihazda saxlanılır.'}
};
const tr=()=>I[lang()]||I.ru;
const alphabet=()=>lang()==='az'?'ABCÇDEƏFGĞHXIİJKLMNOÖPQRSŞTUÜVYZ':lang()==='en'?'ABCDEFGHJKLMNPQRSTUVWXYZ':'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЭЮЯ';
const rawInit=()=>window.Telegram?.WebApp?.initData||'';
let mode='blitz',state=null,running=false,question=null,answer='',tiles=[],selected=[],used=new Set(),hearts=3,correct=0,streak=0,bestRunStreak=0,score=0,deadline=0,timer=null,order=[],pos=0,energyTimer=null,serverMode=true;
const localKey='pw.challenge.local.v1';
function localRead(){
 let d={energy:5,ref:Date.now(),limited_best_score:0,nohint_best_streak:0,blitz_best_score:0,blitz_best_streak:0};try{d={...d,...JSON.parse(localStorage.getItem(localKey)||'{}')}}catch{}
 const now=Date.now();if(d.energy<5){const gain=Math.floor(Math.max(0,now-d.ref)/ENERGY_MS);if(gain>0){d.energy=Math.min(5,d.energy+gain);d.ref=d.energy===5?now:d.ref+gain*ENERGY_MS;localStorage.setItem(localKey,JSON.stringify(d));}}
 return {...d,energy_max:5,next_energy_at:d.energy<5?new Date(d.ref+ENERGY_MS).toISOString():null};
}
function localWrite(d){try{localStorage.setItem(localKey,JSON.stringify(d))}catch{}}
async function api(action,extra={}){
 const initData=rawInit();
 if(initData){
  try{
   const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,initData,...extra})});
   const j=await r.json();if(!r.ok)throw Object.assign(new Error(j.error||'challenge_error'),{data:j});serverMode=true;return j.challenge;
  }catch(e){if(e?.data?.challenge)state=e.data.challenge;if(e?.message==='challenge_no_energy')throw e;}
 }
 serverMode=false;let d=localRead();
 if(action==='start'&&extra.mode==='limited'){if(d.energy<=0)throw Object.assign(new Error('challenge_no_energy'),{data:{challenge:d}});if(d.energy===5)d.ref=Date.now();d.energy--;localWrite(d);}
 if(action==='finish'){
  if(extra.mode==='limited')d.limited_best_score=Math.max(d.limited_best_score,extra.score||0);
  if(extra.mode==='nohint')d.nohint_best_streak=Math.max(d.nohint_best_streak,extra.streak||0);
  if(extra.mode==='blitz'){d.blitz_best_score=Math.max(d.blitz_best_score,extra.score||0);d.blitz_best_streak=Math.max(d.blitz_best_streak,extra.streak||0);}
  localWrite(d);
 }
 return localRead();
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function resetOrder(){order=shuffle(Q.map((_,i)=>i));pos=0}
function nextQ(){if(pos>=order.length)resetOrder();question=Q[order[pos++]];answer=question[lang()]||question.ru;buildPuzzle()}
function pool(word){const a=[...word],want=Math.max(12,a.length+5),chars=[...alphabet()].filter(ch=>!a.includes(ch));shuffle(chars);return shuffle([...a,...chars.slice(0,Math.max(0,want-a.length))])}
function buildPuzzle(){
 selected=Array([...answer].length).fill(null);used.clear();tiles=pool(answer);
 const photos=$('challengePhotos');photos.replaceChildren();question.p.forEach((e,i)=>{const d=document.createElement('div');d.className='photo';d.textContent=e;d.setAttribute('aria-label','Image '+(i+1));photos.append(d)});
 renderInput();$('challengeStatus').textContent='';
}
function renderInput(){
 const slots=$('challengeSlots'),letters=$('challengeLetters');slots.replaceChildren();letters.replaceChildren();
 selected.forEach((idx,i)=>{const b=document.createElement('button');b.className='slot';b.textContent=idx===null?'':tiles[idx];b.onclick=()=>{if(!running||idx===null)return;used.delete(idx);selected[i]=null;renderInput()};slots.append(b)});
 tiles.forEach((ch,i)=>{const b=document.createElement('button');b.className='letter'+(used.has(i)?' used':'');b.textContent=ch;b.disabled=used.has(i)||!running;b.onclick=()=>choose(i);letters.append(b)});
}
function choose(i){if(!running||used.has(i))return;const s=selected.indexOf(null);if(s<0)return;selected[s]=i;used.add(i);renderInput();if(!selected.includes(null))setTimeout(checkWord,70)}
function clearWord(){selected.fill(null);used.clear();renderInput()}
function heartsText(){return '❤️'.repeat(Math.max(0,hearts))+'🖤'.repeat(Math.max(0,3-hearts))}
function setHud(labels,values){for(let i=0;i<4;i++){const n=i+1;$('hudLabel'+n).textContent=labels[i]||'';$('hudValue'+n).textContent=values[i]??''}}
function updateHud(){
 const x=tr();
 if(mode==='limited')setHud([x.words,x.errors,x.energy,x.record],[correct+'/10',heartsText(),(state?.energy??0)+'/5',(state?.limited_best_score||0)+'/10']);
 else if(mode==='nohint')setHud([x.series,x.errors,x.record,x.passed],[streak,heartsText(),Math.max(state?.nohint_best_streak||0,bestRunStreak),correct]);
 else setHud([x.time,x.points,x.series,x.record],[Math.max(0,Math.ceil((deadline-Date.now())/1000)),score,streak,Math.max(state?.blitz_best_score||0,score)]);
}
function flash(msg,good=false){const e=$('challengeStatus');e.textContent=msg;e.classList.toggle('challenge-good',good)}
function checkWord(){
 if(!running)return;const word=selected.map(i=>tiles[i]).join('');
 if(word===answer){
  pw?.sfx?.('success');pw?.haptic?.('success');correct++;streak++;bestRunStreak=Math.max(bestRunStreak,streak);if(mode==='blitz'){score++;deadline+=3000;flash(tr().correct,true)}else flash('✓',true);
  updateHud();
  if(mode==='limited'&&correct>=10){setTimeout(()=>finish('complete'),250);return}
  setTimeout(nextQ,220);
 }else{
  pw?.sfx?.('error');pw?.haptic?.('error');streak=0;flash(tr().wrong,false);
  $('challengeSlots').classList.add('wrong');
  if(mode==='blitz'){deadline-=3000;updateHud();setTimeout(()=>{if(running){$('challengeSlots').classList.remove('wrong');clearWord()}},330);if(deadline<=Date.now())setTimeout(()=>finish('time'),340);return}
  hearts--;updateHud();setTimeout(()=>{$('challengeSlots').classList.remove('wrong');if(hearts<=0)finish('lives');else clearWord()},380);
 }
}
function formatLeft(ms){const s=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(s/60);return m+':'+String(s%60).padStart(2,'0')}
function renderIntro(){
 clearInterval(energyTimer);document.querySelectorAll('.challenge-energy-countdown').forEach(e=>e.remove());const x=tr(),d=x[mode];$('challengeGameTitle').textContent=d[1];$('challengeGameSubtitle').textContent=mode==='limited'?x.energy:mode==='nohint'?x.series:x.time;$('challengeIntroIcon').textContent=d[0];$('challengeIntroTitle').textContent=d[1];$('challengeIntroText').textContent=d[2];$('challengeStart').textContent=x.start+' ▶';
 const stats=$('challengeIntroStats');stats.replaceChildren();
 const add=(label,value)=>{const e=document.createElement('div');e.innerHTML='<small></small><b></b>';e.querySelector('small').textContent=label;e.querySelector('b').textContent=value;stats.append(e)};
 if(mode==='limited'){add(x.energy,(state?.energy??0)+'/5');add(x.record,(state?.limited_best_score||0)+'/10');const b=$('challengeStart');b.disabled=(state?.energy??0)<=0;$('energyRefill').hidden=(state?.energy??0)>0;$('energyRefill').textContent=x.refill;$('energyRefillNote').hidden=true;const countdown=document.createElement('p');countdown.className='challenge-energy-countdown';stats.after(countdown);const tick=()=>{if((state?.energy??0)>=5){countdown.textContent=x.full;return}const left=Date.parse(state?.next_energy_at||'')-Date.now();countdown.textContent=left>0?x.wait+': '+formatLeft(left):x.wait+': 0:00';if(left<=0)loadState()};tick();energyTimer=setInterval(tick,1000)}
 else{$('challengeStart').disabled=false;$('energyRefill').hidden=true;$('energyRefillNote').hidden=true;if(mode==='nohint'){add(x.record,state?.nohint_best_streak||0);add(x.errors,'❤️❤️❤️')}else{add(x.record,state?.blitz_best_score||0);add(x.series,state?.blitz_best_streak||0)}}
 if(!serverMode){const note=document.createElement('small');note.className='challenge-local-note';note.textContent=x.serverFallback;stats.append(note)}
}
async function loadState(){try{state=await api('state');renderIntro()}catch{state=localRead();serverMode=false;renderIntro()}}
async function startRun(){
 try{state=await api('start',{mode,language:lang()})}catch(e){if(e?.data?.challenge)state=e.data.challenge;if(String(e?.message)==='challenge_no_energy'){renderIntro();flash(tr().energyEmpty);return}state=localRead()}
 running=true;hearts=3;correct=0;streak=0;bestRunStreak=0;score=0;resetOrder();clearInterval(timer);clearInterval(energyTimer);
 $('challengeIntro').hidden=true;$('challengeResult').hidden=true;$('challengeHud').hidden=false;$('challengePuzzle').hidden=false;
 if(mode==='blitz'){deadline=Date.now()+60000;timer=setInterval(()=>{updateHud();if(running&&Date.now()>=deadline)finish('time')},150)}
 updateHud();nextQ();
}
async function finish(reason){
 if(!running)return;running=false;clearInterval(timer);renderInput();$('challengePuzzle').hidden=true;$('challengeHud').hidden=true;
 const x=tr(),finishScore=mode==='blitz'?score:correct,finishStreak=bestRunStreak;
 try{state=await api('finish',{mode,score:finishScore,streak:finishStreak,language:lang()})}catch{}
 $('challengeResult').hidden=false;$('challengeResultTitle').textContent=reason==='time'?x.timeDone:x.done;
 if(mode==='limited'){$('challengeResultMain').textContent=x.passed+': '+correct+' / 10';$('challengeResultSub').textContent=x.record+': '+Math.max(state?.limited_best_score||0,correct)+' / 10'}
 else if(mode==='nohint'){$('challengeResultMain').textContent=x.passed+': '+correct+' · '+x.series+': '+bestRunStreak;$('challengeResultSub').textContent=x.record+': '+Math.max(state?.nohint_best_streak||0,bestRunStreak)}
 else{$('challengeResultMain').textContent=x.points+': '+score+' · '+x.series+': '+bestRunStreak;$('challengeResultSub').textContent=x.record+': '+Math.max(state?.blitz_best_score||0,score)}
 $('challengeAgain').textContent=(mode==='nohint'?x.restart:x.again)+' ▶';
}
function openMode(m){
 if(!I.ru[m])m='blitz';mode=m;document.documentElement.lang=lang();document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('active',e.id==='challengeScreen'));window.scrollTo(0,0);
 $('challengeHome').textContent=tr().home;$('challengeIntro').hidden=false;$('challengeHud').hidden=true;$('challengePuzzle').hidden=true;$('challengeResult').hidden=true;loadState();
}
function closeMode(){running=false;clearInterval(timer);clearInterval(energyTimer);document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('active',e.id==='home'));window.scrollTo(0,0)}
$('challengeStart')?.addEventListener('click',startRun);$('challengeAgain')?.addEventListener('click',startRun);$('challengeShuffle')?.addEventListener('click',()=>{if(!running)return;tiles=shuffle([...tiles]);selected.fill(null);used.clear();renderInput()});$('challengeBack')?.addEventListener('click',closeMode);$('challengeHome')?.addEventListener('click',closeMode);
$('energyRefill')?.addEventListener('click',()=>{$('energyRefillNote').hidden=false;$('energyRefillNote').textContent=tr().refillNote});
window.PWChallenge={open:openMode,close:closeMode};
if(modeParam&&I.ru[modeParam])setTimeout(()=>openMode(modeParam),0);
})();