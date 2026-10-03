/* AdsGram can leave show() pending when a banner fails to load. */
(() => {
 'use strict';
 window.PWAdSession = {
  show(controller, {onStart = () => {}, loadMs = 30000, totalMs = 180000} = {}) {
   return new Promise((resolve, reject) => {
    let settled = false, loadTimer, totalTimer;
    const cleanup = () => {
     clearTimeout(loadTimer); clearTimeout(totalTimer);
     controller.removeEventListener?.('onStart', started);
    };
    const finish = (error, result) => {
     if (settled) return;
     settled = true; cleanup();
     if (error) reject(error); else resolve(result);
    };
    const timeout = () => {
     const error = new Error('ad_timeout');
     finish(error);
     try { controller.destroy(); } catch {}
    };
    const started = () => { if (!settled) { clearTimeout(loadTimer); onStart(); } };
    controller.addEventListener?.('onStart', started);
    loadTimer = setTimeout(timeout, loadMs);
    totalTimer = setTimeout(timeout, totalMs);
    try { Promise.resolve(controller.show()).then(result => finish(null, result), error => finish(error || new Error('ad_error'))); }
    catch (error) { finish(error); }
   });
  }
 };
})();
