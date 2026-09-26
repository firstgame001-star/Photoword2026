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
    10:{answer:'ТАЙНА',pool:'ТАЙНАСЕКРМОЛ',hint:'То, что скрывают и пытаются разгадать.',photos:[['🔐','Замок'],['🤫','Тишина'],['🕵️','Детектив'],['❓','Вопрос']]},
    11:{answer:'ТЕНЬ',pool:'ТЕНЬСВЛКРАМД',hint:'Она появляется рядом с предметом, когда свет не может пройти сквозь него.',photos:[['👤','Силуэт'],['☀️','Солнце'],['🌳','Дерево'],['💡','Лампа']]},
    12:{answer:'СЛЕД',pool:'СЛЕДНОГАТКРМ',hint:'Он остаётся после того, кто или что здесь прошло.',photos:[['👣','Следы ног'],['🐾','Следы лап'],['🚗','След шины'],['🕵️','Улика']]},
    13:{answer:'ВОЛНА',pool:'ВОЛНАРДИОКС',hint:'Она бывает на воде, в звуке и в радиосигнале.',photos:[['🌊','Морская волна'],['📻','Радио'],['🔊','Звук'],['〰️','Волнистая линия']]},
    14:{answer:'КЛЮЧ',pool:'КЛЮЧЗАМНОТАР',hint:'Им открывают замок, но этим словом называют и способ решения.',photos:[['🔑','Ключ'],['🔒','Замок'],['🎼','Музыкальный ключ'],['⌨️','Клавиша']]},
    15:{answer:'КОРЕНЬ',pool:'КОРЕНЬЗУБМАТ',hint:'Он есть у дерева и зуба, а ещё встречается в математике.',photos:[['🌳','Корни дерева'],['🦷','Зуб'],['√','Корень числа'],['🥕','Корнеплод']]},
    16:{answer:'СЕТЬ',pool:'СЕТЬИНТРЫБАК',hint:'Она может ловить рыбу, соединять компьютеры или напоминать паутину.',photos:[['🕸️','Паутина'],['🎣','Рыболовная сеть'],['🌐','Интернет'],['📡','Связь']]},
    17:{answer:'ТОК',pool:'ТОКРЕКАЛМНИЯ',hint:'Он бывает электрическим, а ещё так называют движение воды.',photos:[['⚡','Электричество'],['🔌','Розетка'],['🏞️','Течение реки'],['💡','Лампочка']]},
    18:{answer:'КАДР',pool:'КАДРФОТОЛМЕН',hint:'Один момент изображения в фотографии или кино.',photos:[['🎞️','Киноплёнка'],['📸','Фотография'],['🖼️','Рамка'],['🎬','Кино']]},
    19:{answer:'СВЯЗЬ',pool:'СВЯЗЬТЕЛФОНК',hint:'Она объединяет людей, устройства и отдельные части.',photos:[['📱','Телефон'],['🔗','Цепь'],['📶','Сигнал'],['🤝','Люди']]},
    20:{answer:'ИСТОЧНИК',pool:'ИСТОЧНИКВОДАС',hint:'Место или объект, откуда что-либо берёт начало.',photos:[['⛲','Родник'],['💡','Источник света'],['📚','Источник информации'],['🔋','Источник энергии']]}
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
      10:{answer:'SECRET',pool:'SECRETLOCKQAZ',hint:'Something hidden that others may try to discover.'},
      11:{answer:'SHADOW',pool:'SHADOWLIGHTER',hint:'It appears when an object blocks light.'},
      12:{answer:'TRACE',pool:'TRACEFOOTMNDS',hint:'A mark or sign left behind by someone or something.'},
      13:{answer:'WAVE',pool:'WAVERDIOSNMT',hint:'It can travel through water, sound, or radio.'},
      14:{answer:'KEY',pool:'KEYLOCKMUSICR',hint:'It opens a lock, but can also mean the solution to something.'},
      15:{answer:'ROOT',pool:'ROOTTOOTHMATH',hint:'A tree has one, a tooth has one, and mathematics uses the same word.'},
      16:{answer:'NET',pool:'NETWEBFISHRKA',hint:'It can catch fish or connect computers.'},
      17:{answer:'CURRENT',pool:'CURRENTPOWERA',hint:'It can mean flowing electricity or flowing water.'},
      18:{answer:'FRAME',pool:'FRAMEFILMPHOT',hint:'A single image in film, or a border around a picture.'},
      19:{answer:'LINK',pool:'LINKPHONEWEBAR',hint:'It connects people, devices, or pieces of information.'},
      20:{answer:'SOURCE',pool:'SOURCEWATEREN',hint:'The place or thing from which something begins or comes.'}
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
      10:{answer:'SİRR',pool:'SİRRKİLİDAQZ',hint:'Gizli saxlanılan və açılmağa çalışılan şey.'},
      11:{answer:'KÖLGƏ',pool:'KÖLGƏGÜNƏŞAR',hint:'İşığın qarşısı kəsiləndə yaranır.'},
      12:{answer:'İZ',pool:'İZAYAQTƏKƏRLM',hint:'Kimsə və ya nəsə keçdikdən sonra qalan nişan.'},
      13:{answer:'DALĞA',pool:'DALĞASURADİOK',hint:'Dənizdə, səsdə və radio siqnalında ola bilər.'},
      14:{answer:'AÇAR',pool:'AÇARKİLİDMUS',hint:'Qapını açır, həm də problemin həlli mənasında işlənə bilər.'},
      15:{answer:'KÖK',pool:'KÖKAĞACDİŞMAT',hint:'Ağacda və dişdə olur, riyaziyyatda da bu söz işlənir.'},
      16:{answer:'ŞƏBƏKƏ',pool:'ŞƏBƏKƏTORNETA',hint:'İnsanları və cihazları birləşdirə bilər, tor formasında da olur.'},
      17:{answer:'CƏRƏYAN',pool:'CƏRƏYANELEKSU',hint:'Elektrikdə və suyun hərəkətində işlənən anlayışdır.'},
      18:{answer:'KADR',pool:'KADRFİLMŞƏKİL',hint:'Foto və ya filmdə bir görüntü anıdır.'},
      19:{answer:'ƏLAQƏ',pool:'ƏLAQƏTELFONR',hint:'İnsanları, cihazları və məlumatları bir-birinə bağlayır.'},
      20:{answer:'MƏNBƏ',pool:'MƏNBƏSUGÜCİNF',hint:'Bir şeyin başladığı və ya əldə edildiyi yer.'}
    }
  };
  let gameLang='ru';try{gameLang=localStorage.getItem('pw.language')||'ru'}catch{}
  if(TRANSLATED[gameLang]) Object.keys(LEVELS).forEach(k=>Object.assign(LEVELS[k],TRANSLATED[gameLang][k]));
  function validateLanguageLevels(){
    const supported=['ru','en','az'];
    for(const lang of supported){
      for(let n=1;n<=20;n++){
        const item=lang==='ru'?LEVELS[n]:TRANSLATED[lang][n];
        if(!item||!item.answer||!item.pool||!item.hint)throw new Error('Incomplete language level '+lang+' '+n);
        const need=[...item.answer].reduce((m,ch)=>(m[ch]=(m[ch]||0)+1,m),{});
        const have=[...item.pool].reduce((m,ch)=>(m[ch]=(m[ch]||0)+1,m),{});
        for(const ch in need)if((have[ch]||0)<need[ch])throw new Error('Missing answer letter '+lang+' '+n+' '+ch);
      }
    }
  }
  validateLanguageLevels();
  const GAME_UI={
    ru:{chapter:n=>'Глава '+n,warm:'Разминка',assoc:'Ассоциации',level:n=>'Уровень '+n,textHint:'Текстовая подсказка',tap:'Нажми, чтобы открыть',wrong:'Неверное слово. Попробуй ещё раз.',checking:'Проверяю и сохраняю ответ…',passed:n=>'Уровень '+n+' пройден!',reward:'+20 монет · +15 XP',already:'Награда за этот уровень уже получена',next:'СЛЕДУЮЩИЙ УРОВЕНЬ',sync:'Профиль синхронизирован.',shuffle:'Буквы перемешаны. Бесплатно.',letter:'Буква открыта. −50 монет.',remove:'Лишние буквы убраны. −100 монет.',text:'Подсказка открыта. −150 монет.',textOpened:'Подсказка уже открыта.',allLetters:'Все буквы уже открыты.',noExtra:'Лишних букв не осталось.',hintWait:'Подсказка: ожидаю ответ сервера…',locked:n=>'Сначала пройди уровень '+n+'.',home:'НА ГЛАВНУЮ',slot:n=>'Буква '+n,image:n=>'Изображение '+n,placeFail:'Не удалось разместить букву.'},
    en:{chapter:n=>'Chapter '+n,warm:'Warm-up',assoc:'Associations',level:n=>'Level '+n,textHint:'Text hint',tap:'Tap to reveal',wrong:'Wrong word. Try again.',checking:'Checking and saving your answer…',passed:n=>'Level '+n+' completed!',reward:'+20 coins · +15 XP',already:'Reward for this level has already been claimed',next:'NEXT LEVEL',sync:'Profile synced.',shuffle:'Letters shuffled. Free.',letter:'Letter revealed. −50 coins.',remove:'Extra letters removed. −100 coins.',text:'Hint revealed. −150 coins.',textOpened:'Hint already revealed.',allLetters:'All letters are already revealed.',noExtra:'No extra letters remain.',hintWait:'Getting hint from the server…',locked:n=>'Complete level '+n+' first.',home:'HOME',slot:n=>'Letter '+n,image:n=>'Image '+n,placeFail:'Could not place the letter.'},
    az:{chapter:n=>'Fəsil '+n,warm:'İsinmə',assoc:'Assosiasiyalar',level:n=>n+'-ci səviyyə',textHint:'Mətn ipucu',tap:'Açmaq üçün toxun',wrong:'Söz yanlışdır. Yenidən cəhd et.',checking:'Cavab yoxlanılır və yadda saxlanılır…',passed:n=>n+'-ci səviyyə keçildi!',reward:'+20 sikkə · +15 XP',already:'Bu səviyyənin mükafatı artıq alınıb',next:'NÖVBƏTİ SƏVİYYƏ',sync:'Profil sinxronlaşdırıldı.',shuffle:'Hərflər qarışdırıldı. Pulsuz.',letter:'Hərf açıldı. −50 sikkə.',remove:'Artıq hərflər silindi. −100 sikkə.',text:'İpucu açıldı. −150 sikkə.',textOpened:'İpucu artıq açılıb.',allLetters:'Bütün hərflər artıq açılıb.',noExtra:'Artıq hərf qalmayıb.',hintWait:'İpucu serverdən alınır…',locked:n=>'Əvvəlcə '+n+'-ci səviyyəni keç.',home:'ANA SƏHİFƏ',slot:n=>n+'-ci hərf',image:n=>n+'-ci şəkil',placeFail:'Hərfi yerləşdirmək mümkün olmadı.'}
  };
  const requested = Number(new URLSearchParams(location.search).get('level') || 1);
  const levelId = LEVELS[requested] ? requested : 1, level = LEVELS[levelId], answer=[...level.answer];
  const tiles=[...level.pool].map((letter,id)=>({id,letter}));
  let order=tiles.map(t=>t.id), selected=Array(answer.length).fill(null), fixed=new Map(), removed=new Set();
  let busy=false, solved=false, textOpen=false, sessionKey=null;

  const ui=GAME_UI[gameLang]||GAME_UI.ru;
  document.documentElement.lang=gameLang;
  const chapterNum=levelId<=10?1:2;
  document.querySelector('.game-head>div b').textContent=ui.chapter(chapterNum);
  $('levelTitle').textContent=(chapterNum===1?ui.warm:ui.assoc)+' · '+ui.level(levelId);
  $('textHint').querySelector('b').textContent=ui.textHint;$('hintValue').textContent=ui.tap;
  $('slots').style.gridTemplateColumns='repeat('+answer.length+',1fr)';
  level.photos.forEach(([emoji],index)=>{const d=document.createElement('div');d.className='photo';d.setAttribute('role','img');d.setAttribute('aria-label',ui.image(index+1));d.textContent=emoji;$('photos').append(d);});

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
      b.textContent=tiles[selected[pos]]?.letter||'';b.disabled=busy||solved||fixed.has(pos);b.setAttribute('aria-label',ui.slot(pos+1));
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
    $('successTitle').textContent=ui.passed(levelId);
    $('successReward').textContent=rewarded?ui.reward:ui.already;
    const next=$('nextLevel');
    if(levelId<20){next.href='./game.html?level='+(levelId+1);next.innerHTML=ui.next+' <span>▶</span>';}
    else{next.href='./index.html';next.innerHTML=ui.home+' <span>✓</span>';}
  }
  async function check(){
    if(selected.some(id=>id===null))return;
    busy=true;paint();
    const word=selected.map(id=>tiles[id].letter).join('');
    if(word!==level.answer){
      pw.status(ui.wrong);$('slots').classList.add('wrong');
      setTimeout(()=>{clearInput();busy=false;$('slots').classList.remove('wrong');paint();},700);
      pw.sfx('error');pw.haptic('error');return;
    }
    pw.status(ui.checking);
    try{
      await pw.login();
      const previous=pw.player?.completed_levels??0;
      const p=await pw.api('complete_level',{levelId,answer:word});
      solved=true;pw.sfx('success');pw.haptic('success');showSuccess(p.completed_levels>previous);
    }catch(e){pw.status(e.message);clearInput();}
    finally{busy=false;paint();}
  }
  function choose(id){if(busy||solved)return;const pos=selected.indexOf(null);if(pos<0)return;pw.sfx('tap');pw.haptic();selected[pos]=id;paint();check();}
  async function hint(type){
    if(busy||solved)return;
    if(type==='text'&&textOpen){pw.status(ui.textOpened);return;}
    const available=answer.map((_,i)=>i).filter(i=>!fixed.has(i));
    const bad=tiles.filter(t=>!answer.includes(t.letter)&&!removed.has(t.id));
    if(type==='letter'&&!available.length){pw.status(ui.allLetters);return;}
    if(type==='remove'&&!bad.length){pw.status(ui.noExtra);return;}
    busy=true;paint();pw.status(ui.hintWait);
    try{
      await pw.login();
      const p=await pw.api('use_hint',{hintType:type,levelId});
      if(!sessionKey)sessionKey='pw.hints.'+p.photoword_id+'.'+levelId;
      if(type==='letter'){
        const pos=available[Math.floor(Math.random()*available.length)], reserved=new Set(fixed.values());
        const tile=tiles.find(t=>t.letter===answer[pos]&&!reserved.has(t.id));if(!tile)throw new Error(ui.placeFail);
        selected=selected.map(id=>id===tile.id?null:id);selected[pos]=tile.id;fixed.set(pos,tile.id);pw.status(ui.letter);
      }else if(type==='remove'){
        bad.slice(0,3).forEach(t=>{removed.add(t.id);selected=selected.map(id=>id===t.id?null:id);});pw.status(ui.remove);
      }else{textOpen=true;pw.status(ui.text);}
      save();pw.sfx('hint');pw.haptic();
    }catch(e){pw.status(e.message);}
    finally{busy=false;paint();}
    if(selected.every(id=>id!==null))check();
  }
  $('shuffle').onclick=()=>{if(busy)return;shuffle();paint();pw.status(ui.shuffle);pw.sfx('tap');pw.haptic();};
  $('letterHint').onclick=()=>hint('letter');$('removeHint').onclick=()=>hint('remove');$('textHint').onclick=()=>hint('text');
  shuffle();paint();
  pw.login().then(p=>{
    if(levelId>(p.current_level??1)){pw.status(ui.locked(p.current_level??1));busy=true;paint();return;}
    restore(p);pw.status(ui.sync);
  }).catch(e=>pw.status(e.message));
})();