/* AdsGram can leave show() pending when a banner fails to load. */
(() => {
 'use strict';
 let sdkPromise = null;
 window.PWAdSession = {
  ensureSDK({timeoutMs = 15000} = {}) {
   if (window.Adsgram?.init) return Promise.resolve(window.Adsgram);
   if (sdkPromise) return sdkPromise;
   sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    let settled = false;
    const finish = error => {
     if (settled) return;
     settled = true; clearTimeout(timer); script.onload = script.onerror = null;
     if (error) { script.remove(); reject(error); }
     else resolve(window.Adsgram);
    };
    const timer = setTimeout(() => finish(new Error('ad_sdk_timeout')), timeoutMs);
    script.async = true;
    script.src = 'https://sad.adsgram.ai/js/sad.min.js';
    script.onload = () => finish(window.Adsgram?.init ? null : new Error('ad_sdk_missing'));
    script.onerror = () => finish(new Error('ad_sdk_failed'));
    document.head.append(script);
   }).finally(() => { sdkPromise = null; });
   return sdkPromise;
  },
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
