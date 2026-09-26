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
    text('rankLabel','Место #' + p.rank); text('profileRank','#' + p.rank);
    text('photoWordId',p.photoword_id); text('profileXp',p.xp); text('profileDone',p.completed_levels);
    text('profileUsername',p.username ? '@' + p.username : 'Username не указан');
    text('done',Math.min(20,p.completed_levels)); $('progress').style.width = Math.min(100,p.completed_levels*5) + '%';
    const play=$('playLink'), next=Math.max(1,Math.min(3,p.current_level||1));play.href='./game.html?level='+next;
    if((p.current_level||1)>3)play.innerHTML='УРОВНИ 1–3 ПРОЙДЕНЫ <span>✓</span>';
    for (const id of ['avatar','profileAvatar']) text(id,name.charAt(0).toUpperCase());
    text('myRank','#' + p.rank); text('myXp',p.xp + ' XP');
  }
  // Bind navigation first. A failed login must not disable settings or the play link.
  $('settingsBtn').onclick = () => open('settingsModal');
  $('profileBtn').onclick = () => open('profileModal');
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
    'Главы':'Сейчас доступны первые три уровня главы «Разминка». Остальные уровни добавим дальше.',
    'Награда':'Ежедневная награда пока не подключена.', 'Задания':'Задания пока не подключены.', 'Друзья':'Приглашения друзей пока не подключены.',
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
  pw.login().then(() => pw.status('Профиль синхронизирован')).catch(e => pw.status(e.message));
})();
