/* Shared Telegram session. Never manufacture identity or save bot secrets here. */
(() => {
  'use strict';
  const URL = 'https://bqoraxewpcnmidvjlpuy.supabase.co';
  const KEY = 'sb_publishable_HKRkkTIXzsfZp4RMT9-27w_Qc4ooODB'; // public, read-only RPC access
  const store = {
    get(k, fallback = null) { try { return JSON.parse(sessionStorage.getItem(k)) ?? fallback; } catch { return fallback; } },
    set(k, value) { try { sessionStorage.setItem(k, JSON.stringify(value)); } catch { /* Private browsing must not stop buttons. */ } }
  };
  const tg = window.Telegram?.WebApp;
  const hash = new URLSearchParams(location.hash.slice(1));
  const query = new URLSearchParams(location.search);
  let raw = tg?.initData || hash.get('tgWebAppData') || query.get('tgWebAppData') || '';
  if (raw) store.set('pw.init', raw);
  else raw = store.get('pw.init', '');
  const authDate = Number(new URLSearchParams(raw).get('auth_date'));
  if (!authDate || Date.now() / 1000 - authDate > 86400 || authDate > Date.now() / 1000 + 60) raw = '';
  for (const [method, value] of [['ready'], ['expand'], ['setHeaderColor', '#061d2c'], ['setBackgroundColor', '#061d2c']]) {
    try { tg?.[method]?.(value); } catch { /* Native bridge is optional, UI is not. */ }
  }
  try{const theme=localStorage.getItem('pw.theme')||'game';document.documentElement.dataset.theme=['game','night','light','neon','gold'].includes(theme)?theme:'game';}catch{document.documentElement.dataset.theme='game';}
  let prefs;
  try { prefs = JSON.parse(localStorage.getItem('photoword-prefs')) || {}; } catch { prefs = {}; }
  prefs = {sound: true, haptic: true, music: false, ...prefs};
  const ERR={
    ru:{reset_duel_active:'Заверши текущую дуэль перед полным сбросом.',energy_full:'Энергия уже 5/5.',player_not_found:'Профиль игрока не найден. Перезапусти игру через бота.',rank_failed:'Не удалось обновить позицию в рейтинге.',server_error:'Временная ошибка сервера. Попробуй ещё раз.',db:'Временная ошибка базы данных. Попробуй ещё раз.',db_response:'Сервер вернул некорректный ответ. Попробуй ещё раз.',create:'Не удалось создать профиль. Перезапусти игру через бота.',invalid_telegram_auth:'Не удалось подтвердить вход. Закрой мини-приложение и открой его через бота.',not_configured:'Сервер входа ещё не настроен.',insufficient_coins:'Недостаточно монет.',complete_failed:'Сервер не сохранил прохождение.',level_completed:'Уровень уже пройден.',wrong_answer:'Неверное слово.',all_letters:'Все буквы уже открыты.',no_extra_letters:'Лишних букв не осталось.',answer_rate_limited:'Подожди 5 минут перед следующими попытками на этом уровне.',answer_attempt_failed:'Не удалось проверить попытку. Попробуй ещё раз.',answer_unavailable:'Ответ уровня временно недоступен.',hint_failed:'Сервер не применил подсказку.',level_locked:'Сначала пройди предыдущий уровень.',invoice_failed:'Не удалось создать счёт Telegram Stars.',webhook_failed:'Не удалось подготовить подтверждение платежа Telegram.',notification_failed:'Telegram не разрешил отправить тестовое уведомление. Проверь разрешение на сообщения от бота.',bad_pack:'Такого пакета монет нет.',daily_claimed:'Сегодня награда уже получена.',daily_failed:'Не удалось получить ежедневную награду.',task_claimed:'Эта награда сегодня уже получена.',task_not_ready:'Сначала выполни условие задания.',task_failed:'Не удалось получить награду за задание.',bad_task:'Такого задания нет.',bad_level:'Такого уровня пока нет.',reset_failed:'Не удалось сбросить прогресс.',nickname_locked:'Игровой ник уже был установлен и больше не меняется.',nickname_taken:'Этот ник уже занят.',bad_nickname:'Ник: 3–16 символов, только английские буквы, цифры и _.',nickname_failed:'Не удалось сохранить ник.',referral_failed:'Не удалось зарегистрировать приглашение.',friends_failed:'Не удалось загрузить друзей.',ads_not_configured:'Реклама ещё не подключена.',ad_daily_limit:'Лимит рекламных наград на сегодня достигнут.',ad_cooldown:'Следующую рекламу можно посмотреть чуть позже.',ad_prepare_failed:'Не удалось подготовить рекламу.',ad_too_fast:'Просмотр ещё не подтверждён.',ad_claim_expired:'Подтверждение рекламы истекло. Посмотри новую рекламу.',ad_claim_invalid:'Не удалось подтвердить рекламную награду.',config_failed:'Не удалось загрузить настройки приложения.',erase_confirm:'Подтверди удаление аккаунта.',erase_failed:'Не удалось удалить аккаунт.'},
    en:{reset_duel_active:'Finish the current duel before resetting the game.',energy_full:'Energy is already 5/5.',player_not_found:'Player profile was not found. Reopen the game from the bot.',rank_failed:'Could not update leaderboard position.',server_error:'Temporary server error. Try again.',db:'Temporary database error. Try again.',db_response:'The server returned an invalid response. Try again.',create:'Could not create the profile. Reopen the game from the bot.',invalid_telegram_auth:'Could not verify Telegram login. Close the Mini App and open it again from the bot.',not_configured:'Login server is not configured.',insufficient_coins:'Not enough coins.',complete_failed:'The server did not save level completion.',level_completed:'This level is already completed.',wrong_answer:'Wrong word.',all_letters:'All letters are already revealed.',no_extra_letters:'No extra letters remain.',answer_rate_limited:'Wait 5 minutes before trying this level again.',answer_attempt_failed:'Could not check this attempt. Try again.',answer_unavailable:'This level answer is temporarily unavailable.',hint_failed:'The server did not apply the hint.',level_locked:'Complete the previous level first.',invoice_failed:'Could not create a Telegram Stars invoice.',webhook_failed:'Could not prepare Telegram payment confirmation.',notification_failed:'Telegram could not send the test notification. Check the bot message permission.',bad_pack:'This coin pack does not exist.',daily_claimed:'Today’s daily reward has already been claimed.',daily_failed:'Could not claim the daily reward.',task_claimed:'This task reward has already been claimed today.',task_not_ready:'Complete the task first.',task_failed:'Could not claim the task reward.',bad_task:'This task does not exist.',bad_level:'This level is not available yet.',reset_failed:'Could not reset progress.',nickname_locked:'Your game nickname has already been set and cannot be changed again.',nickname_taken:'This nickname is already taken.',bad_nickname:'Nickname: 3–16 characters, English letters, numbers and _ only.',nickname_failed:'Could not save the nickname.',referral_failed:'Could not register the referral.',friends_failed:'Could not load friends.',ads_not_configured:'Ads are not connected yet.',ad_daily_limit:'Today’s rewarded-ad limit has been reached.',ad_cooldown:'The next ad will be available shortly.',ad_prepare_failed:'Could not prepare the ad.',ad_too_fast:'The ad view is not confirmed yet.',ad_claim_expired:'The ad confirmation expired. Watch a new ad.',ad_claim_invalid:'Could not confirm the ad reward.',config_failed:'Could not load app configuration.',erase_confirm:'Confirm account deletion.',erase_failed:'Could not delete the account.'},
    az:{reset_duel_active:'Oyunu sıfırlamazdan əvvəl cari dueli tamamla.',energy_full:'Enerji artıq 5/5-dir.',player_not_found:'Oyunçu profili tapılmadı. Oyunu botdan yenidən aç.',rank_failed:'Reytinq mövqeyini yeniləmək mümkün olmadı.',server_error:'Müvəqqəti server xətası. Yenidən cəhd et.',db:'Müvəqqəti verilənlər bazası xətası. Yenidən cəhd et.',db_response:'Server düzgün cavab qaytarmadı. Yenidən cəhd et.',create:'Profil yaratmaq mümkün olmadı. Oyunu botdan yenidən aç.',invalid_telegram_auth:'Telegram girişini təsdiqləmək mümkün olmadı. Mini tətbiqi bağlayıb botdan yenidən açın.',not_configured:'Giriş serveri sazlanmayıb.',insufficient_coins:'Kifayət qədər sikkə yoxdur.',complete_failed:'Server səviyyənin keçilməsini yadda saxlamadı.',level_completed:'Bu səviyyə artıq keçilib.',wrong_answer:'Söz yanlışdır.',all_letters:'Bütün hərflər artıq açılıb.',no_extra_letters:'Əlavə hərf qalmayıb.',answer_rate_limited:'Bu səviyyədə yenidən cəhd etməzdən əvvəl 5 dəqiqə gözlə.',answer_attempt_failed:'Cəhdi yoxlamaq mümkün olmadı. Yenidən cəhd et.',answer_unavailable:'Səviyyənin cavabı müvəqqəti əlçatan deyil.',hint_failed:'Server ipucunu tətbiq etmədi.',level_locked:'Əvvəlki səviyyəni keçin.',invoice_failed:'Telegram Stars hesabı yaratmaq mümkün olmadı.',webhook_failed:'Telegram ödəniş təsdiqini hazırlamaq mümkün olmadı.',notification_failed:'Telegram test bildirişini göndərə bilmədi. Botun mesaj icazəsini yoxlayın.',bad_pack:'Belə sikkə paketi yoxdur.',daily_claimed:'Bugünkü gündəlik mükafat artıq alınıb.',daily_failed:'Gündəlik mükafatı almaq mümkün olmadı.',task_claimed:'Bu tapşırığın mükafatı bu gün artıq alınıb.',task_not_ready:'Əvvəlcə tapşırığı yerinə yetirin.',task_failed:'Tapşırıq mükafatını almaq mümkün olmadı.',bad_task:'Belə tapşırıq yoxdur.',bad_level:'Bu səviyyə hələ mövcud deyil.',reset_failed:'Tərəqqini sıfırlamaq mümkün olmadı.',nickname_locked:'Oyun nikiniz artıq seçilib və bir daha dəyişdirilə bilməz.',nickname_taken:'Bu nik artıq istifadə olunur.',bad_nickname:'Nik 3–16 simvol olmalıdır: yalnız ingilis hərfləri, rəqəmlər və _.',nickname_failed:'Niki saxlamaq mümkün olmadı.',referral_failed:'Dəvəti qeyd etmək mümkün olmadı.',friends_failed:'Dostları yükləmək mümkün olmadı.',ads_not_configured:'Reklam hələ qoşulmayıb.',ad_daily_limit:'Bu gün üçün reklam mükafatı limiti bitib.',ad_cooldown:'Növbəti reklam bir az sonra əlçatan olacaq.',ad_prepare_failed:'Reklamı hazırlamaq mümkün olmadı.',ad_too_fast:'Reklam baxışı hələ təsdiqlənməyib.',ad_claim_expired:'Reklam təsdiqinin vaxtı bitdi. Yeni reklama bax.',ad_claim_invalid:'Reklam mükafatını təsdiqləmək mümkün olmadı.',config_failed:'Tətbiq ayarlarını yükləmək mümkün olmadı.',erase_confirm:'Hesabın silinməsini təsdiqlə.',erase_failed:'Hesabı silmək mümkün olmadı.'}
  };
  function lang(){try{return localStorage.getItem('pw.language')||'ru'}catch{return'ru'}}
  function errText(code,statusCode){const t=ERR[lang()]||ERR.ru;return t[code]||(lang()==='en'?'Server error ('+statusCode+').':lang()==='az'?'Server xətası ('+statusCode+').':'Ошибка сервера ('+statusCode+').')}
  let statusTimer;
  function status(message, duration = 2200) {
    const e = document.getElementById('status');
    if (!e) return;
    clearTimeout(statusTimer);
    e.textContent = String(message || '');
    e.hidden = !message;
    if (message) statusTimer = setTimeout(() => {
      e.hidden = true;
      e.textContent = '';
    }, duration);
  }
  function name(p) {
    if(p?.game_nickname) return p.game_nickname;
    const value=[p?.first_name,p?.last_name].filter(Boolean).join(' ').trim();
    return /[\p{L}\p{N}]/u.test(value)?value:(p?.photoword_id||'Player');
  }
  async function request(path, body, headers = {}, timeoutMs = 12000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(URL + path, {method:'POST', headers:{'Content-Type':'application/json', ...headers},
        body:JSON.stringify(body), signal:controller.signal, cache:'no-store'});
      const data = await response.json();
      if (!response.ok || data?.error) {try{if(body?.action!=='track_event')window.dispatchEvent(new CustomEvent('pw:error',{detail:{code:data?.error||'http_error',status:response.status}}))}catch{};throw new Error(errText(data?.error,response.status));}
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {try{if(body?.action!=='track_event')window.dispatchEvent(new CustomEvent('pw:error',{detail:{code:'timeout',status:0}}))}catch{};throw Object.assign(new Error(lang()==='en'?'Server did not respond. Check your connection.':lang()==='az'?'Server cavab vermədi. İnternet bağlantısını yoxlayın.':'Сервер не ответил. Проверь соединение.'),{code:'timeout'});}
      if (error instanceof TypeError) {try{if(body?.action!=='track_event')window.dispatchEvent(new CustomEvent('pw:error',{detail:{code:'network',status:0}}))}catch{};throw Object.assign(new Error(lang()==='en'?'Could not connect to the server.':lang()==='az'?'Serverlə əlaqə yaratmaq mümkün olmadı.':'Не удалось связаться с сервером.'),{code:'network'});}
      throw error;
    } finally { clearTimeout(timer); }
  }
  let current = null;
  let accountErased = false;
  function endDeletedSession(){
    accountErased=true;raw='';current=null;loginPending=null;
    setMusic(false);
    clearProgressStorage();
    try{sessionStorage.removeItem('pw.init')}catch{}
  }
  function clearProgressStorage(){
    try{for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k?.startsWith('pw.')||k?.startsWith('photoword'))localStorage.removeItem(k)}for(let i=sessionStorage.length-1;i>=0;i--){const k=sessionStorage.key(i);if(k?.startsWith('pw.')&&k!=='pw.init')sessionStorage.removeItem(k)}}catch{}
  }
  let loginPending = null;
  async function api(action = 'login', extra = {}) {
    if (!raw) throw new Error(lang()==='en'?'Telegram did not provide login data. Open the game from the bot.':lang()==='az'?'Telegram giriş məlumatlarını ötürmədi. Oyunu botdan açın.':'Telegram не передал данные входа. Запусти игру через бота.');
    let result;try{result = await request('/functions/v1/telegram-login', {...extra, action, initData:raw,progressGeneration:current?.progress_generation,accountId:current?.photoword_id},{},action==='login'?25000:12000);}catch(e){if(e.message==='progress_reset'&&action!=='login'){loginPending=null;await api('login')}throw e;}
    if(accountErased)throw new Error('account_deleted');
    if (!result?.player?.photoword_id) throw new Error(lang()==='en'?'Server did not return a profile.':lang()==='az'?'Server profil qaytarmadı.':'Сервер не вернул профиль.');
    const incoming=result.player,generation=Number(incoming.progress_generation||0),key='pw.generation.'+incoming.photoword_id;
    if(current?.photoword_id===incoming.photoword_id&&Number(current.progress_generation||0)>generation)return current;
    let seen=null,previousAccount=null;try{seen=localStorage.getItem(key);previousAccount=localStorage.getItem('pw.accountId')}catch{}
    const changed=Boolean(previousAccount&&previousAccount!==incoming.photoword_id)||(current&&current.photoword_id!==incoming.photoword_id)||(current?.photoword_id===incoming.photoword_id&&generation>Number(current.progress_generation||0))||(seen!==null&&generation>Number(seen))||(seen===null&&generation>0);
    if(changed){clearProgressStorage();window.dispatchEvent(new CustomEvent('pw:reset'))}
    try{localStorage.setItem(key,String(generation));localStorage.setItem('pw.accountId',incoming.photoword_id)}catch{}
    current = incoming;
    if(changed&&action!=='reset_progress')setTimeout(()=>location.replace('./index.html?restart='+generation+location.hash),0);
    // Do not cache the complete response: it contains the private Telegram ID.
    document.querySelectorAll('[data-coins]').forEach(e => e.textContent = current.coins);
    window.dispatchEvent(new CustomEvent('pw:player', {detail:current}));
    return current;
  }
  function login(force=false) {
    if(force) loginPending=null;
    if (!loginPending) loginPending = (async()=>{
      try{return await api()}
      catch(e){
        if(!['timeout','network'].includes(e.code))throw e;
        await new Promise(resolve=>setTimeout(resolve,700));
        return api();
      }
    })().catch(e => { loginPending = null; throw e; });
    return loginPending;
  }
  async function actionRequest(action,extra={}) {
    if(['create_invoice','create_energy_invoice'].includes(action)&&window.PWPurchaseTerms&&!await window.PWPurchaseTerms())throw new Error(lang()==='en'?'Purchase canceled.':lang()==='az'?'Alış ləğv edildi.':'Покупка отменена.');
    if(!raw) throw new Error(lang()==='en'?'Telegram did not provide login data. Open the game from the bot.':lang()==='az'?'Telegram giriş məlumatlarını ötürmədi. Oyunu botdan açın.':'Telegram не передал данные входа. Запусти игру через бота.');
    const hintAction=['use_hint','theme_hint'].includes(action),pendingKey=hintAction?'pw.hintRequest.'+current?.photoword_id+'.'+current?.progress_generation+'.'+action+'.'+(extra.themeId||'main')+'.'+extra.levelId+'.'+extra.hintType:null;
    if(pendingKey){let saved=null;try{saved=JSON.parse(localStorage.getItem(pendingKey))}catch{};if(!saved){saved={...extra,requestId:crypto.randomUUID()};try{localStorage.setItem(pendingKey,JSON.stringify(saved))}catch{}}extra=saved;}
    try{const result=await request('/functions/v1/telegram-login',{...extra,action,initData:raw,progressGeneration:current?.progress_generation,accountId:current?.photoword_id});if(pendingKey)try{localStorage.removeItem(pendingKey)}catch{};return result;}catch(e){if(e.message==='progress_reset')await login(true);throw e;}
  }
  async function duelRequest(action,extra={}) {
    if(!raw) throw new Error(lang()==='en'?'Open the game from the Telegram bot.':lang()==='az'?'Oyunu Telegram botundan aç.':'Открой игру через Telegram-бота.');
    const timeoutMs=action==='reactions'?3000:['state','react'].includes(action)?4500:12000;
    try{return await request('/functions/v1/duel-game',{...extra,action,initData:raw,progressGeneration:current?.progress_generation,accountId:current?.photoword_id},{},timeoutMs)}catch(e){if(e.message==='progress_reset')await login(true);throw e;}
  }
  async function leaderboard() {
    const rows = await request('/rest/v1/rpc/get_leaderboard', {p_limit:100}, {apikey:KEY});
    if (!Array.isArray(rows)) throw new Error(lang()==='en'?'Server returned an invalid leaderboard.':lang()==='az'?'Server səhv reytinq qaytardı.':'Сервер вернул некорректный рейтинг.');
    return rows;
  }
  async function avatarFrames(codes){return request('/rest/v1/rpc/get_avatar_frames',{p_codes:codes},{apikey:KEY});}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&current)login(true).catch(()=>{});});
  let audioCtx=null,musicTimer=null,musicIndex=0;
  function ensureAudio(){
    if(!audioCtx){const C=window.AudioContext||window.webkitAudioContext;if(C)audioCtx=new C();}
    if(audioCtx?.state==='suspended')audioCtx.resume().catch(()=>{});
    return audioCtx;
  }
  function tone(freq,duration=.08,volume=.04,type='sine',delay=0){
    const ctx=ensureAudio();if(!ctx)return;
    const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+delay;
    o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+duration+.03);
  }
  function sfx(kind='tap'){
    if(!prefs.sound)return;
    if(kind==='success'){tone(523,.16,.045,'sine');tone(659,.18,.04,'sine',.08);tone(784,.22,.035,'sine',.16);}
    else if(kind==='error'){tone(180,.14,.045,'square');tone(140,.16,.035,'square',.08);}
    else if(kind==='coin'){tone(880,.08,.04,'triangle');tone(1175,.12,.035,'triangle',.06);}
    else if(kind==='hint'){tone(660,.1,.035,'sine');tone(880,.12,.03,'sine',.07);}
    else tone(440,.045,.025,'sine');
  }
  function stopMusic(){if(musicTimer){clearTimeout(musicTimer);musicTimer=null;}}
  function musicStep(){
    if(!prefs.music){stopMusic();return;}
    const seq=[261.63,329.63,392,493.88,392,329.63,293.66,349.23];
    tone(seq[musicIndex++%seq.length],1.45,.012,'sine');
    musicTimer=setTimeout(musicStep,900);
  }
  function setMusic(enabled){
    prefs.music=Boolean(enabled);
    try{localStorage.setItem('photoword-prefs',JSON.stringify(prefs));}catch{}
    if(prefs.music){ensureAudio();if(!musicTimer)musicStep();}else stopMusic();
  }
  document.addEventListener('pointerdown',()=>{if(prefs.music&&!musicTimer)setMusic(true);},{once:false,passive:true});
  function haptic(kind = 'light') {
    if (!prefs.haptic) return;
    try {
      if (kind === 'error' || kind === 'success') tg?.HapticFeedback?.notificationOccurred(kind);
      else tg?.HapticFeedback?.impactOccurred(kind);
    } catch { /* Haptics must never interrupt answer reset or hint application. */ }
  }
  const accessibleLabels=new WeakMap();
  const accessibleCopy={
    'Закрыть':['Close','Bağla'],'К темам':['Back to themes','Mövzulara qayıt'],'На главную':['Home','Ana səhifə'],'Настройки':['Settings','Ayarlar'],'Обновить комнаты':['Refresh rooms','Otaqları yenilə'],
    'Буквы':['Letters','Hərflər'],'Ответ':['Answer','Cavab'],'Четыре подсказки':['Four clues','Dörd ipucu'],
    'Открыть букву':['Reveal a letter','Hərfi aç'],'Убрать лишние буквы':['Remove extra letters','Artıq hərfləri sil'],'Перемешать':['Shuffle','Qarışdır'],
    'Открыть букву за 50 монет':['Reveal a letter for 50 coins','50 sikkəyə hərfi aç'],'Убрать лишние за 100 монет':['Remove extra letters for 100 coins','100 sikkəyə artıq hərfləri sil'],'Перемешать бесплатно':['Shuffle for free','Pulsuz qarışdır']
  };
  function localizeAccessibility(language=lang()){
    document.querySelectorAll('[aria-label]').forEach(e=>{
      const label=accessibleLabels.get(e)||e.getAttribute('aria-label');
      const chapter=label?.match(/^Глава (\d+)$/),copy=accessibleCopy[label];
      if(!chapter&&!copy)return;
      accessibleLabels.set(e,label);
      e.setAttribute('aria-label',language==='en'?(chapter?'Chapter '+chapter[1]:copy[0]):language==='az'?(chapter?'Fəsil '+chapter[1]:copy[1]):label);
    });
  }
  localizeAccessibility();
  window.PW = {store, prefs, status, name, api, login, actionRequest, duelRequest, leaderboard, avatarFrames, clearProgressStorage, endDeletedSession, localizeAccessibility, haptic, sfx, setMusic,
    get player() { return current; }, get hasAuth() { return Boolean(raw); }};
})();
