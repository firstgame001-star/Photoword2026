(() => {
  'use strict';
  const pw = window.PW, answer = [...'СОБАКА'];
  const $ = id => document.getElementById(id);
  const tiles = [...'СОБАКАНТЛДЕР'].map((letter,id) => ({id,letter}));
  let order = tiles.map(t => t.id), selected = Array(6).fill(null), fixed = new Map(), removed = new Set();
  let busy = false, solved = false, textOpen = false, sessionKey = null;
  function shuffle() {
    const previous = order.join(',');
    for (let i=order.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [order[i],order[j]]=[order[j],order[i]]; }
    if (order.join(',') === previous) order.push(order.shift());
  }
  function save() { if (sessionKey) pw.store.set(sessionKey,{fixed:[...fixed],removed:[...removed],textOpen}); }
  function restore(p) {
    sessionKey = 'pw.hints.' + p.photoword_id + '.1';
    const saved = pw.store.get(sessionKey,{});
    fixed = new Map((saved.fixed || []).filter(([pos,tile]) => Number.isInteger(pos) && pos>=0 && pos<6 && tiles[tile]?.letter===answer[pos]));
    removed = new Set((saved.removed || []).filter(id => tiles[id] && !answer.includes(tiles[id].letter)));
    textOpen = saved.textOpen === true;
    for (const [pos,tile] of fixed) selected[pos]=tile;
    paint();
  }
  function paint() {
    const used = new Set(selected.filter(id => id !== null));
    $('slots').replaceChildren(); $('letters').replaceChildren();
    answer.forEach((_,pos) => {
      const b = document.createElement('button'); b.type='button'; b.className='slot'+(fixed.has(pos)?' fixed':'');
      b.textContent=tiles[selected[pos]]?.letter||''; b.disabled=busy||solved||fixed.has(pos);
      b.setAttribute('aria-label','Буква '+(pos+1));
      b.onclick=()=>{selected[pos]=null;paint();}; $('slots').append(b);
    });
    order.forEach(id=>{
      const b=document.createElement('button'); b.type='button'; b.className='letter'+(used.has(id)?' used':'')+(removed.has(id)?' removed':'');
      b.dataset.tile=id; b.textContent=tiles[id].letter; b.disabled=busy||solved||used.has(id)||removed.has(id);
      b.onclick=()=>choose(id); $('letters').append(b);
    });
    ['letterHint','removeHint','textHint','shuffle'].forEach(id=>$(id).disabled=busy||solved);
    if(textOpen) $('hintValue').textContent='Домашнее животное, которое часто называют другом человека.';
  }
  function clearInput() {
    selected = Array(6).fill(null); for(const [pos,id] of fixed) selected[pos]=id;
  }
  async function check() {
    if(selected.some(id=>id===null)) return;
    busy=true; paint();
    const word=selected.map(id=>tiles[id].letter).join('');
    if(word!=='СОБАКА') {
      pw.status('Неверное слово. Попробуй ещё раз.'); $('slots').classList.add('wrong');
      // Schedule reset before optional Telegram haptics, which can throw on old clients.
      setTimeout(()=>{clearInput();busy=false;$('slots').classList.remove('wrong');paint();},700);
      pw.haptic('error'); return;
    }
    pw.status('Проверяю и сохраняю ответ…');
    try {
      await pw.login();
      const previous = pw.player?.completed_levels ?? 0;
      const p=await pw.api('complete_level',{levelId:1,answer:word});
      solved=true; pw.haptic('success');
      pw.status(p.completed_levels>previous?'Верно! +20 монет и +100 XP.':'Уровень уже пройден. Повторная награда не начисляется.');
      $('finish').hidden=false;
    } catch(e) {pw.status(e.message);clearInput();}
    finally{busy=false;paint();}
  }
  function choose(id){if(busy||solved)return;const pos=selected.indexOf(null);if(pos<0)return;selected[pos]=id;paint();check();}
  async function hint(type){
    if(busy||solved)return;
    if(type==='text'&&textOpen){pw.status('Подсказка уже открыта.');return;}
    const available=answer.map((_,i)=>i).filter(i=>!fixed.has(i));
    const bad=tiles.filter(t=>!answer.includes(t.letter)&&!removed.has(t.id));
    if(type==='letter'&&!available.length){pw.status('Все буквы уже открыты.');return;}
    if(type==='remove'&&!bad.length){pw.status('Лишних букв не осталось.');return;}
    busy=true;paint();pw.status('Подсказка: ожидаю ответ сервера…');
    try {
      await pw.login();
      const p=await pw.api('use_hint',{hintType:type,levelId:1});
      if(!sessionKey) sessionKey='pw.hints.'+p.photoword_id+'.1';
      if(type==='letter'){
        const pos=available[Math.floor(Math.random()*available.length)];
        // Reserve a distinct tile, including the two copies of А.
        const reserved=new Set(fixed.values());
        const tile=tiles.find(t=>t.letter===answer[pos]&&!reserved.has(t.id));
        if(!tile)throw new Error('Не удалось разместить букву.');
        selected=selected.map(id=>id===tile.id?null:id); selected[pos]=tile.id; fixed.set(pos,tile.id);
        pw.status('Буква открыта. −50 монет.');
      } else if(type==='remove'){
        bad.slice(0,3).forEach(t=>{removed.add(t.id);selected=selected.map(id=>id===t.id?null:id);});
        pw.status('Лишние буквы убраны. −100 монет.');
      } else {textOpen=true;pw.status('Подсказка открыта. −150 монет.');}
      save();pw.haptic();
    }catch(e){pw.status(e.message);}
    finally{busy=false;paint();}
    if(selected.every(id=>id!==null))check();
  }
  $('shuffle').onclick=()=>{if(busy)return;shuffle();paint();pw.status('Буквы перемешаны. Бесплатно.');pw.haptic();};
  $('letterHint').onclick=()=>hint('letter'); $('removeHint').onclick=()=>hint('remove'); $('textHint').onclick=()=>hint('text');
  shuffle();paint();
  // Local letter input and shuffle still work when authorization is unavailable.
  pw.login().then(p=>{restore(p);pw.status('Профиль синхронизирован.');}).catch(e=>pw.status(e.message));
})();
