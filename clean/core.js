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
  const messages = {invalid_telegram_auth: 'Не удалось подтвердить вход. Закрой мини-приложение и открой его через бота.',
    not_configured: 'Сервер входа ещё не настроен.', insufficient_coins: 'Недостаточно монет.',
    complete_failed: 'Сервер не сохранил прохождение.', level_completed: 'Уровень уже пройден. Монеты не списаны.', wrong_answer: 'Неверное слово.',
    hint_failed: 'Сервер не применил подсказку.', level_locked:'Сначала пройди предыдущий уровень.', invoice_failed:'Не удалось создать счёт Telegram Stars.', bad_pack:'Такого пакета монет нет.', daily_claimed:'Сегодня награда уже получена.', daily_failed:'Не удалось получить ежедневную награду.', task_claimed:'Эта награда сегодня уже получена.', task_not_ready:'Сначала выполни условие задания.', task_failed:'Не удалось получить награду за задание.', bad_task:'Такого задания нет.', level_locked: 'Сначала пройди предыдущий уровень.', bad_level: 'Такого уровня пока нет.', reset_failed:'Не удалось сбросить прогресс.'};
  function status(message) {
    const e = document.getElementById('status');
    if (e) { e.textContent = message; e.hidden = false; }
  }
  function name(p) {
    const text = [p?.first_name, p?.last_name].filter(Boolean).join(' ').trim();
    return /[\p{L}\p{N}]/u.test(text) ? text : 'Игрок' + (p?.photoword_id ? ' ' + p.photoword_id : '');
  }
  async function request(path, body, headers = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(URL + path, {method:'POST', headers:{'Content-Type':'application/json', ...headers},
        body:JSON.stringify(body), signal:controller.signal, cache:'no-store'});
      const data = await response.json();
      if (!response.ok || data?.error) throw new Error(messages[data?.error] || 'Ошибка сервера (' + response.status + ').');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Сервер не ответил. Проверь соединение.');
      if (error instanceof TypeError) throw new Error('Не удалось связаться с сервером.');
      throw error;
    } finally { clearTimeout(timer); }
  }
  let current = null;
  let loginPending = null;
  async function api(action = 'login', extra = {}) {
    if (!raw) throw new Error('Telegram не передал данные входа. Запусти игру кнопкой приложения у @PhotoWordBot.');
    const result = await request('/functions/v1/telegram-login', {...extra, action, initData:raw});
    if (!result?.player?.photoword_id) throw new Error('Сервер не вернул профиль.');
    current = result.player;
    // Do not cache the complete response: it contains the private Telegram ID.
    document.querySelectorAll('[data-coins]').forEach(e => e.textContent = current.coins);
    window.dispatchEvent(new CustomEvent('pw:player', {detail:current}));
    return current;
  }
  function login(force=false) {
    if(force) loginPending=null;
    if (!loginPending) loginPending = api().catch(e => { loginPending = null; throw e; });
    return loginPending;
  }
  async function actionRequest(action,extra={}) {
    if(!raw) throw new Error('Telegram не передал данные входа. Запусти игру через бота.');
    return request('/functions/v1/telegram-login',{...extra,action,initData:raw});
  }
  async function leaderboard() {
    const rows = await request('/rest/v1/rpc/get_leaderboard', {p_limit:100}, {apikey:KEY});
    if (!Array.isArray(rows)) throw new Error('Сервер вернул некорректный рейтинг.');
    return rows;
  }
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
  window.PW = {store, prefs, status, name, api, login, actionRequest, leaderboard, haptic, sfx, setMusic,
    get player() { return current; }, get hasAuth() { return Boolean(raw); }};
})();
