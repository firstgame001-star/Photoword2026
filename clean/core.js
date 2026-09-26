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
  let prefs;
  try { prefs = JSON.parse(localStorage.getItem('photoword-prefs')) || {}; } catch { prefs = {}; }
  prefs = {sound: true, haptic: true, music: false, ...prefs};
  const messages = {invalid_telegram_auth: 'Не удалось подтвердить вход. Закрой мини-приложение и открой его через бота.',
    not_configured: 'Сервер входа ещё не настроен.', insufficient_coins: 'Недостаточно монет.',
    complete_failed: 'Сервер не сохранил прохождение.', level_completed: 'Уровень уже пройден. Монеты не списаны.', wrong_answer: 'Неверное слово.',
    hint_failed: 'Сервер не применил подсказку.'};
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
  function login() {
    if (!loginPending) loginPending = api().catch(e => { loginPending = null; throw e; });
    return loginPending;
  }
  async function leaderboard() {
    const rows = await request('/rest/v1/rpc/get_leaderboard', {p_limit:100}, {apikey:KEY});
    if (!Array.isArray(rows)) throw new Error('Сервер вернул некорректный рейтинг.');
    return rows;
  }
  function haptic(kind = 'light') {
    if (!prefs.haptic) return;
    try {
      if (kind === 'error' || kind === 'success') tg?.HapticFeedback?.notificationOccurred(kind);
      else tg?.HapticFeedback?.impactOccurred(kind);
    } catch { /* Haptics must never interrupt answer reset or hint application. */ }
  }
  window.PW = {store, prefs, status, name, api, login, leaderboard, haptic,
    get player() { return current; }, get hasAuth() { return Boolean(raw); }};
})();
