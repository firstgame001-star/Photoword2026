(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const pw = window.PW;
  const text = (id, value) => { const el = $(id); if (el) el.textContent = value; };
  function open(id) { $(id).hidden = false; $(id).querySelector('button')?.focus(); }
  function close(id) { $(id).hidden = true; }
  function screen(id) { document.querySelectorAll('.screen').forEach(e => e.classList.toggle('active', e.id === id)); window.scrollTo(0,0); }
  function update(p) {
    const name = pw.name(p);
    text('name',name); text('profileName',name);
    const league=p.xp>=4000?'Легенда':p.xp>=2500?'Мастер':p.xp>=1500?'Эксперт':p.xp>=400?'Знаток':'Новичок';
    text('rankLabel',league+' · место #'+p.rank); text('profileRank','#' + p.rank);
    text('photoWordId',p.photoword_id); text('profileXp',p.xp); text('profileDone',p.completed_levels);
    text('profileUsername',p.username ? '@' + p.username : 'Username не указан');
    text('done',Math.min(20,p.completed_levels)); $('progress').style.width = Math.min(100,p.completed_levels*5) + '%';
    const play=$('playLink'), next=Math.max(1,Math.min(10,p.current_level||1));play.href='./game.html?level='+next;
    if((p.current_level||1)>10)play.innerHTML='УРОВНИ 1–10 ПРОЙДЕНЫ <span>✓</span>';
    for (const id of ['avatar','profileAvatar']) text(id,name.charAt(0).toUpperCase());
    text('myRank','#' + p.rank); text('myXp',p.xp + ' XP');
  }
  const UI={
    ru:{player:'Игрок',login:'Вход в Telegram',chapter:'Глава 1',warm:'Разминка',desc:'Простые слова для хорошего старта',levels:'уровней',play:'ИГРАТЬ',daily:'Ежедневная награда',tasks:'Задания',rating:'Рейтинг',home:'Главная',chapters:'Главы',friends:'Друзья',shop:'Магазин',settings:'Настройки',language:'Язык',sound:'Звук',vibration:'Вибрация',music:'Музыка',rules:'Правила игры',support:'Поддержка',privacy:'Конфиденциальность',agreement:'Пользовательское соглашение',reset:'Сбросить прогресс',best:'ВЫГОДНО',coinshop:'Магазин монет',free:'Получить бесплатно',soon:'СКОРО',invite:'ПРИГЛАСИТЬ ДРУГА',invited:'Приглашено',received:'Получено',invitedList:'Приглашённые',dailyTitle:'Ежедневная награда',claim:'ПОЛУЧИТЬ',dayTasks:'Задания дня'},
    en:{player:'Player',login:'Telegram login',chapter:'Chapter 1',warm:'Warm-up',desc:'Simple words for a good start',levels:'levels',play:'PLAY',daily:'Daily reward',tasks:'Tasks',rating:'Leaderboard',home:'Home',chapters:'Chapters',friends:'Friends',shop:'Shop',settings:'Settings',language:'Language',sound:'Sound',vibration:'Haptics',music:'Music',rules:'Game rules',support:'Support',privacy:'Privacy',agreement:'Terms of use',reset:'Reset progress',best:'BEST VALUE',coinshop:'Coin shop',free:'Get for free',soon:'SOON',invite:'INVITE A FRIEND',invited:'Invited',received:'Earned',invitedList:'Invited friends',dailyTitle:'Daily reward',claim:'CLAIM',dayTasks:'Daily tasks'},
    az:{player:'Oyunçu',login:'Telegram girişi',chapter:'Fəsil 1',warm:'İsinmə',desc:'Yaxşı başlanğıc üçün sadə sözlər',levels:'səviyyə',play:'OYNA',daily:'Gündəlik mükafat',tasks:'Tapşırıqlar',rating:'Reytinq',home:'Ana səhifə',chapters:'Fəsillər',friends:'Dostlar',shop:'Mağaza',settings:'Ayarlar',language:'Dil',sound:'Səs',vibration:'Vibrasiya',music:'Musiqi',rules:'Oyun qaydaları',support:'Dəstək',privacy:'Məxfilik',agreement:'İstifadəçi razılaşması',reset:'Tərəqqini sıfırla',best:'SƏRFƏLİ',coinshop:'Sikkə mağazası',free:'Pulsuz əldə et',soon:'TEZLİKLƏ',invite:'DOSTU DƏVƏT ET',invited:'Dəvət edilib',received:'Qazanılıb',invitedList:'Dəvət olunanlar',dailyTitle:'Gündəlik mükafat',claim:'GÖTÜR',dayTasks:'Günün tapşırıqları'}
  };
  function applyHomeLanguage(lang){
    const t=UI[lang]||UI.ru;document.documentElement.lang=lang;
    const q=(s)=>document.querySelector(s), qa=(s)=>document.querySelectorAll(s);
    if(q('.chapter-title small'))q('.chapter-title small').textContent=t.chapter;
    if(q('.chapter-title h1'))q('.chapter-title h1').textContent=t.warm;
    if(q('.chapter-title p'))q('.chapter-title p').textContent=t.desc;
    const count=q('.count');if(count)count.childNodes[count.childNodes.length-1].textContent=' / 20 '+t.levels;
    const play=$('playLink');if(play&&!play.textContent.includes('1–10'))play.innerHTML=t.play+' <span>▶</span>';
    const shortcut=qa('.shortcuts button b');if(shortcut[0])shortcut[0].innerHTML=t.daily.replace(' ','<br>');if(shortcut[1])shortcut[1].textContent=t.tasks;if(shortcut[2])shortcut[2].textContent=t.rating;
    const nav=qa('nav small');[t.home,t.chapters,t.rating,t.friends,t.shop].forEach((v,i)=>{if(nav[i])nav[i].textContent=v});
    if($('settingsTitle'))$('settingsTitle').textContent=t.settings;
    if($('languageBtn'))$('languageBtn').querySelector('b').textContent=t.language;
    const rows=qa('#settingsModal .settingrow b');if(rows[0])rows[0].textContent=t.sound;if(rows[1])rows[1].textContent=t.vibration;if(rows[2])rows[2].textContent=t.music;
    if($('friendsModal')){const x=$('friendsModal');x.querySelector('h2').textContent=t.friends;const st=x.querySelectorAll('.friendstats small');if(st[0])st[0].textContent=t.invited;if(st[1])st[1].textContent=t.received;if($('inviteFriend'))$('inviteFriend').textContent=t.invite;const h3=x.querySelector('h3');if(h3)h3.textContent=t.invitedList;}
    if($('shopModal')){$('shopModal').querySelector('h2').textContent=t.coinshop;const best=$('shopModal').querySelector('.best i');if(best)best.textContent=t.best;const fr=$('shopModal').querySelector('.adreward b');if(fr)fr.textContent=t.free;if($('watchAd'))$('watchAd').textContent=t.soon;}
    if($('dailyModal')){$('dailyModal').querySelector('h2').textContent=t.dailyTitle;if($('claimDaily'))$('claimDaily').textContent=t.claim;}
    if($('tasksModal'))$('tasksModal').querySelector('h2').textContent='🎯 '+t.dayTasks;
  }
  const LANGS={ru:'Русский',en:'English',az:'Azərbaycan dili'};
  function getLang(){try{return localStorage.getItem('pw.language')||''}catch{return''}}
  function setLang(lang){try{localStorage.setItem('pw.language',lang)}catch{};document.documentElement.lang=lang;text('languageCurrent',LANGS[lang]);document.querySelectorAll('[data-language]').forEach(b=>b.classList.toggle('selected',b.dataset.language===lang));applyHomeLanguage(lang);}
  const initialLang=getLang();
  if(initialLang)setLang(initialLang);
  else setTimeout(()=>open('languageModal'),250);
  // Bind navigation first. A failed login must not disable settings or the play link.
  $('settingsBtn').onclick = () => open('settingsModal');
  $('languageBtn').onclick = () => open('languageModal');
  document.querySelectorAll('[data-language]').forEach(b=>b.onclick=()=>{setLang(b.dataset.language);close('languageModal');pw.status(b.dataset.language==='ru'?'Язык игры: Русский':b.dataset.language==='en'?'Game language: English':'Oyun dili: Azərbaycan dili');});
  $('profileBtn').onclick = () => open('profileModal');
  $('dailyRewardBtn').onclick = () => open('dailyModal');
  $('tasksBtn').onclick = () => open('tasksModal');
  $('shopOffer').onclick = () => open('shopModal');
  $('shopNav').onclick = () => open('shopModal');
  async function loadFriends(){
    open('friendsModal');
    const list=$('friendsList'); list.textContent='Загрузка…';
    try{
      const data=await pw.actionRequest('friends');
      text('friendsInvited',data.invited||0); text('friendsReward',(data.total_reward||0)+' монет'); list.replaceChildren();
      if(!data.friends||!data.friends.length){list.textContent='Пока никого нет.';return;}
      data.friends.forEach(f=>{
        const row=document.createElement('div');row.className='friendrow'+(f.rewarded?' rewarded':'');
        const who=document.createElement('div'), n=document.createElement('b'), sub=document.createElement('small');
        n.textContent=[f.first_name,f.last_name].filter(Boolean).join(' ')||'Игрок';
        sub.textContent=f.username?'@'+f.username:f.photoword_id; who.append(n,sub);
        const prog=document.createElement('div'), label=document.createElement('span'), track=document.createElement('em'), bar=document.createElement('i');
        prog.className='friendprogress'; label.textContent=f.rewarded?'Награда получена':f.completed_levels+' / 10 уровней'; bar.style.width=Math.min(100,(f.completed_levels||0)*10)+'%';
        track.append(bar);prog.append(label,track);row.append(who,prog);list.append(row);
      });
    }catch(e){list.textContent=e.message;}
  }
  $('friendsNav').onclick = loadFriends;
  $('inviteFriend').onclick = async () => {
    try {
      const p=await pw.login();
      const start='ref_'+p.photoword_id;
      const link='https://t.me/PhotoWordBot?startapp='+encodeURIComponent(start);
      const share='https://t.me/share/url?url='+encodeURIComponent(link);
      if(window.Telegram?.WebApp?.openTelegramLink) Telegram.WebApp.openTelegramLink(share);
    } catch(e) { pw.status(e.message); }
  };
  document.querySelectorAll('[data-pack]').forEach(b=>b.onclick=async()=>{
    if(b.disabled)return;b.disabled=true;pw.status('Создаю счёт Telegram Stars…');
    try{
      const result=await pw.actionRequest('create_invoice',{pack:b.dataset.pack});
      const tg=window.Telegram?.WebApp;
      if(!tg?.openInvoice)throw new Error('Оплата доступна только внутри Telegram.');
      tg.openInvoice(result.invoice_url,status=>{
        b.disabled=false;
        if(status==='paid'){pw.status('Платёж подтверждён Telegram. Начисляю монеты…');setTimeout(()=>pw.login(true).catch(()=>{}),1200);}
        else if(status==='cancelled')pw.status('Покупка отменена.');
        else if(status==='failed')pw.status('Платёж не прошёл.');
      });
    }catch(e){pw.status(e.message);b.disabled=false;}
  });
  $('claimDaily').onclick = async () => {
    $('claimDaily').disabled=true; pw.status('Получаю ежедневную награду…');
    try { const p=await pw.api('claim_daily'); update(p); text('dailyStreak','Серия: '+(p.daily_streak||1)+' дн.'); pw.status('+5 монет! Ежедневная награда получена.'); $('claimDaily').textContent='ПОЛУЧЕНО'; }
    catch(e){ pw.status(e.message); $('claimDaily').disabled=false; }
  };
  document.querySelectorAll('[data-task]').forEach(b=>b.onclick=async()=>{
    b.disabled=true; pw.status('Проверяю задание…');
    try{const p=await pw.api('claim_task',{taskKey:b.dataset.task});update(p);b.textContent='ПОЛУЧЕНО';pw.status('Награда за задание начислена!');}
    catch(e){pw.status(e.message);b.disabled=false;}
  });
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => close(b.dataset.close));
  document.querySelectorAll('.modal').forEach(m => m.onclick = e => { if (e.target === m) close(m.id); });
  document.addEventListener('keydown',e => { if (e.key === 'Escape') document.querySelectorAll('.modal').forEach(m => m.hidden = true); });
  $('homeNav').onclick = () => screen('home'); $('ratingBack').onclick = () => screen('home');
  let requestId = 0;
  async function rating() {
    screen('ratingScreen'); const id = ++requestId;
    const board = $('leaderboard'); board.textContent = 'Загрузка…';
    try {
      // Wait for the first login to prevent the empty-ranking race during registration.
      if (pw.hasAuth) await pw.login().catch(e => pw.status(e.message));
      const rows = await pw.leaderboard(); if (id !== requestId) return;
      board.replaceChildren();
      if (!rows.length) board.textContent = 'Пока нет игроков';
      rows.forEach(p => {
        const row = document.createElement('div'); row.className = 'rankrow' + (p.photoword_id === pw.player?.photoword_id ? ' me' : '');
        const rank = document.createElement('b'); rank.textContent = '#' + p.rank;
        const person = document.createElement('div'); const title = document.createElement('strong'); title.textContent = pw.name(p);
        const sub = document.createElement('small'); sub.textContent = p.photoword_id;
        person.append(title,sub); const xp = document.createElement('b'); xp.textContent = p.xp + ' XP';
        row.append(rank,person,xp); board.append(row);
      });
      const me = rows.find(p => p.photoword_id === pw.player?.photoword_id);
      if (me) { text('myRank','#'+me.rank); text('myXp',me.xp+' XP'); }
      else if (pw.player) { text('myRank','#'+pw.player.rank); text('myXp',pw.player.xp+' XP'); }
    } catch (e) { board.textContent = e.message; }
  }
  ['ratingNav','ratingShortcut','refreshRating'].forEach(id => $(id).onclick = rating);
  const info = {
    'Правила':'Четыре подсказки связаны одним словом. Нажимай буквы, чтобы заполнить ответ. Нажатие на клетку возвращает букву. Неверный ответ очищается. Перемешивание бесплатно; остальные подсказки стоят 50, 100 и 150 монет.',
    'Магазин':'Покупки ещё не подключены. Нажатие здесь не списывает деньги.',
    'Главы':'Сейчас доступны первые 10 уровней главы «Разминка».',
    'Друзья':'Приглашения друзей пока не подключены.',
    'Язык':'Сейчас доступен русский язык.', 'Тема':'Сейчас доступна игровая тёмная тема.',
    'Уведомления':'Напоминания от бота пока не подключены.', 'Поддержка':'Контакт поддержки ещё не указан.',
    'Конфиденциальность':'Политика ещё не опубликована. Для входа сервер проверяет данные Telegram. Telegram ID не отображается в рейтинге.',
    'Соглашение':'Пользовательское соглашение ещё не опубликовано.', 'Сброс':'Серверный сброс прогресса ещё не подключён. Здесь ничего не удаляется.'
  };
  document.querySelectorAll('[data-info]').forEach(b => b.onclick = () => { text('infoTitle',b.dataset.info); text('infoText',info[b.dataset.info]); open('infoModal'); });
  for (const [id,key] of [['soundToggle','sound'],['hapticToggle','haptic']]) {
    $(id).checked = Boolean(pw.prefs[key]); $(id).onchange = () => {
      pw.prefs[key] = $(id).checked;
      try { localStorage.setItem('photoword-prefs',JSON.stringify(pw.prefs)); } catch { pw.status('Настройка действует до закрытия приложения.'); }
    };
  }
  window.addEventListener('pw:player',e => update(e.detail));
  pw.login().then(async () => {
    pw.status('Профиль синхронизирован');
    try {
      const start=window.Telegram?.WebApp?.initDataUnsafe?.start_param||'';
      if(start.indexOf('ref_PW-')===0) await pw.api('register_referral',{referrer:start.slice(4)});
    } catch(e) {}
  }).catch(e => pw.status(e.message));
})();
