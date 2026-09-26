(() => {
  'use strict';
  const pw = window.PW, $ = id => document.getElementById(id);
  const LEVELS = {
    1:{answer:'СОБАКА',pool:'СОБАКАНТЛДЕР',hint:'Домашнее животное, которое часто называют другом человека.',photos:[['🐕','Собака'],['🥣','Миска'],['🦴','Кость'],['🐾','Следы лап']]},
    2:{answer:'КОШКА',pool:'КОШКАТРМЕДЛС',hint:'Домашний питомец, который мурлычет.',photos:[['🐈','Кошка'],['🧶','Клубок ниток'],['🥛','Молоко'],['😺','Морда кошки']]},
    3:{answer:'МОРЕ',pool:'МОРЕЛКАСДТНБ',hint:'Большой солёный водоём.',photos:[['🌊','Волна'],['🐚','Ракушка'],['⛵','Парусник'],['🏖️','Пляж']]},
    4:{answer:'ДОЖДЬ',pool:'ДОЖДЬТКРСАЛМ',hint:'Он падает с неба и заставляет брать зонт.',photos:[['☔','Зонт'],['🌧️','Дождевое облако'],['💧','Капля'],['🌈','Радуга']]},
    5:{answer:'ВРЕМЯ',pool:'ВРЕМЯЧСДЛКОН',hint:'Его измеряют, но вернуть назад невозможно.',photos:[['⌚','Часы'],['⏳','Песочные часы'],['📅','Календарь'],['👴','Возраст']]},
    6:{answer:'ТЕПЛО',pool:'ТЕПЛОГРСМАКН',hint:'Его дают огонь и солнце, а зимой его особенно не хватает.',photos:[['🔥','Огонь'],['☀️','Солнце'],['🧣','Шарф'],['🌡️','Термометр']]},
    7:{answer:'ПАМЯТЬ',pool:'ПАМЯТЬКРСОНД',hint:'Она хранит то, что уже произошло.',photos:[['🧠','Мозг'],['📸','Фотография'],['💾','Накопитель'],['🕰️','Старые часы']]},
    8:{answer:'СВЕТ',pool:'СВЕТЛАМОРКНД',hint:'Без него трудно увидеть окружающий мир.',photos:[['💡','Лампочка'],['🔦','Фонарик'],['🌅','Рассвет'],['🕯️','Свеча']]},
    9:{answer:'ПУТЬ',pool:'ПУТЬДОРГАКСМ',hint:'Он может быть дорогой, маршрутом или направлением к цели.',photos:[['🛣️','Дорога'],['🧭','Компас'],['🥾','Ботинок путешественника'],['📍','Точка назначения']]},
    10:{answer:'ТАЙНА',pool:'ТАЙНАСЕКРМОЛ',hint:'То, что скрывают и пытаются разгадать.',photos:[['🔐','Замок'],['🤫','Тишина'],['🕵️','Детектив'],['❓','Вопрос']]}
  };
  const TRANSLATED={
    en:{
      1:{answer:'DOG',pool:'DOGCATRLMNES',hint:'A loyal domestic animal often called a human’s best friend.'},
      2:{answer:'CAT',pool:'CATDOGRLMNES',hint:'A domestic pet that purrs.'},
      3:{answer:'SEA',pool:'SEAWTRLMNOKD',hint:'A large body of salt water.'},
      4:{answer:'RAIN',pool:'RAINCLDOSTME',hint:'It falls from clouds and makes you reach for an umbrella.'},
      5:{answer:'TIME',pool:'TIMECLKAORNS',hint:'You can measure it, but you cannot turn it back.'},
      6:{answer:'WARMTH',pool:'WARMTHFIREOS',hint:'Fire and the sun give it; in winter we want more of it.'},
      7:{answer:'MEMORY',pool:'MEMORYPASTDK',hint:'It keeps what has already happened.'},
      8:{answer:'LIGHT',pool:'LIGHTSUNROPE',hint:'Without it, seeing the world becomes difficult.'},
      9:{answer:'PATH',pool:'PATHROADMNES',hint:'A road, route, or direction toward a destination.'},
      10:{answer:'SECRET',pool:'SECRETLOCKQAZ',hint:'Something hidden that others may try to discover.'}
    },
    az:{
      1:{answer:'İT',pool:'İTPİŞKALMONR',hint:'İnsanın ən yaxın dostu adlandırılan ev heyvanı.'},
      2:{answer:'PİŞİK',pool:'PİŞİKEVTOPAR',hint:'Mırıldayan ev heyvanı.'},
      3:{answer:'DƏNİZ',pool:'DƏNİZSUQLMAR',hint:'Böyük duzlu su hövzəsi.'},
      4:{answer:'YAĞIŞ',pool:'YAĞIŞBULUDKR',hint:'Göydən yağır və çətir götürməyə səbəb olur.'},
      5:{answer:'ZAMAN',pool:'ZAMANSAATLRK',hint:'Onu ölçmək olar, amma geri qaytarmaq olmaz.'},
      6:{answer:'İSTİ',pool:'İSTİODGÜNƏŞR',hint:'Od və günəş onu verir, qışda isə ona ehtiyac artır.'},
      7:{answer:'YADDAŞ',pool:'YADDAŞBEYİNR',hint:'Baş verənləri yadda saxlayır.'},
      8:{answer:'İŞIQ',pool:'İŞIQLAMPAGÜN',hint:'Onsuz ətrafı görmək çətindir.'},
      9:{answer:'YOL',pool:'YOLXƏRİTƏKMN',hint:'Məqsədə aparan istiqamət və ya marşrut.'},
      10:{answer:'SİRR',pool:'SİRRKİLİDAQZ',hint:'Gizli saxlanılan və açılmağa çalışılan şey.'}
    }
  };
  let gameLang='ru';try{gameLang=localStorage.getItem('pw.language')||'ru'}catch{}
  if(TRANSLATED[gameLang]) Object.keys(LEVELS).forEach(k=>Object.assign(LEVELS[k],TRANSLATED[gameLang][k]));
  const requested = Number(new URLSearchParams(location.search).get('level') || 1);
  const levelId = LEVELS[requested] ? requested : 1, level = LEVELS[levelId], answer=[...level.answer];
  const tiles=[...level.pool].map((letter,id)=>({id,letter}));
  let order=tiles.map(t=>t.id), selected=Array(answer.length).fill(null), fixed=new Map(), removed=new Set();
  let busy=false, solved=false, textOpen=false, sessionKey=null;

  $('levelTitle').textContent=(gameLang==='en'?'Warm-up · Level ':gameLang==='az'?'İsinmə · Səviyyə ':'Разминка · Уровень ')+levelId;
  $('slots').style.gridTemplateColumns='repeat('+answer.length+',1fr)';
  level.photos.forEach(([emoji,label])=>{const d=document.createElement('div');d.className='photo';d.setAttribute('role','img');d.setAttribute('aria-label',label);d.textContent=emoji;$('photos').append(d);});

  function shuffle(){
    const previous=order.join(',');
    for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    if(order.join(',')===previous)order.push(order.shift());
  }
  function save(){if(sessionKey)pw.store.set(sessionKey,{fixed:[...fixed],removed:[...removed],textOpen});}
  function restore(p){
    sessionKey='pw.hints.'+p.photoword_id+'.'+levelId;
    const saved=pw.store.get(sessionKey,{});
    fixed=new Map((saved.fixed||[]).filter(([pos,tile])=>Number.isInteger(pos)&&pos>=0&&pos<answer.length&&tiles[tile]?.letter===answer[pos]));
    removed=new Set((saved.removed||[]).filter(id=>tiles[id]&&!answer.includes(tiles[id].letter)));
    textOpen=saved.textOpen===true;
    selected=Array(answer.length).fill(null);
    for(const [pos,tile] of fixed)selected[pos]=tile;
    paint();
  }
  function paint(){
    const used=new Set(selected.filter(id=>id!==null));
    $('slots').replaceChildren();$('letters').replaceChildren();
    answer.forEach((_,pos)=>{
      const b=document.createElement('button');b.type='button';b.className='slot'+(fixed.has(pos)?' fixed':'');
      b.textContent=tiles[selected[pos]]?.letter||'';b.disabled=busy||solved||fixed.has(pos);b.setAttribute('aria-label','Буква '+(pos+1));
      b.onclick=()=>{selected[pos]=null;paint();};$('slots').append(b);
    });
    order.forEach(id=>{
      const b=document.createElement('button');b.type='button';b.className='letter'+(used.has(id)?' used':'')+(removed.has(id)?' removed':'');
      b.dataset.tile=id;b.textContent=tiles[id].letter;b.disabled=busy||solved||used.has(id)||removed.has(id);b.onclick=()=>choose(id);$('letters').append(b);
    });
    ['letterHint','removeHint','textHint','shuffle'].forEach(id=>$(id).disabled=busy||solved);
    if(textOpen)$('hintValue').textContent=level.hint;
  }
  function clearInput(){selected=Array(answer.length).fill(null);for(const [pos,id] of fixed)selected[pos]=id;}
  function showSuccess(rewarded){
    $('status').hidden=true;
    $('successPanel').hidden=false;
    $('successTitle').textContent='Уровень '+levelId+' пройден!';
    $('successReward').textContent=rewarded?'+20 монет · +15 XP':'Награда за этот уровень уже получена';
    const next=$('nextLevel');
    next.href='./game.html?level='+(levelId+1);next.innerHTML='СЛЕДУЮЩИЙ УРОВЕНЬ <span>▶</span>';
  }
  async function check(){
    if(selected.some(id=>id===null))return;
    busy=true;paint();
    const word=selected.map(id=>tiles[id].letter).join('');
    if(word!==level.answer){
      pw.status('Неверное слово. Попробуй ещё раз.');$('slots').classList.add('wrong');
      setTimeout(()=>{clearInput();busy=false;$('slots').classList.remove('wrong');paint();},700);
      pw.haptic('error');return;
    }
    pw.status('Проверяю и сохраняю ответ…');
    try{
      await pw.login();
      const previous=pw.player?.completed_levels??0;
      const p=await pw.api('complete_level',{levelId,answer:word});
      solved=true;pw.haptic('success');showSuccess(p.completed_levels>previous);
    }catch(e){pw.status(e.message);clearInput();}
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
    try{
      await pw.login();
      const p=await pw.api('use_hint',{hintType:type,levelId});
      if(!sessionKey)sessionKey='pw.hints.'+p.photoword_id+'.'+levelId;
      if(type==='letter'){
        const pos=available[Math.floor(Math.random()*available.length)], reserved=new Set(fixed.values());
        const tile=tiles.find(t=>t.letter===answer[pos]&&!reserved.has(t.id));if(!tile)throw new Error('Не удалось разместить букву.');
        selected=selected.map(id=>id===tile.id?null:id);selected[pos]=tile.id;fixed.set(pos,tile.id);pw.status('Буква открыта. −50 монет.');
      }else if(type==='remove'){
        bad.slice(0,3).forEach(t=>{removed.add(t.id);selected=selected.map(id=>id===t.id?null:id);});pw.status('Лишние буквы убраны. −100 монет.');
      }else{textOpen=true;pw.status('Подсказка открыта. −150 монет.');}
      save();pw.haptic();
    }catch(e){pw.status(e.message);}
    finally{busy=false;paint();}
    if(selected.every(id=>id!==null))check();
  }
  $('shuffle').onclick=()=>{if(busy)return;shuffle();paint();pw.status('Буквы перемешаны. Бесплатно.');pw.haptic();};
  $('letterHint').onclick=()=>hint('letter');$('removeHint').onclick=()=>hint('remove');$('textHint').onclick=()=>hint('text');
  shuffle();paint();
  pw.login().then(p=>{
    if(levelId>(p.current_level??1)){pw.status('Сначала пройди уровень '+(p.current_level??1)+'.');busy=true;paint();return;}
    restore(p);pw.status('Профиль синхронизирован.');
  }).catch(e=>pw.status(e.message));
})();