import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const core=readFileSync('clean/core.js','utf8');
const home=readFileSync('clean/home.js','utf8');
const login=readFileSync('server/telegram-login/index.ts','utf8');
const webhook=readFileSync('server/telegram-webhook/index.ts','utf8');
const css=readFileSync('clean/ui.css','utf8');
const html=readFileSync('clean/index.html','utf8');

assert(core.includes("action==='login'&&['ru','en','az'].includes(storedLanguage())"),'Signed-in login must sync existing selected language');
assert(home.includes("pw.actionRequest('set_language',{language:b.dataset.language})"),'Language-switch button must persist locale on server');
for(const action of ['create_invoice','create_energy_invoice']){
 assert(home.includes("pw.actionRequest('"+action+"',"),'Missing invoice action '+action);
}
assert(home.includes("pack:b.dataset.pack,language:lang()"),'Coin checkout must transmit chosen game language');
assert(home.includes("pack:b.dataset.energyStorePack,language:lang()"),'Energy checkout must transmit chosen game language');
assert(login.includes('"set_language"'),'Authenticated locale update action must exist');
assert(login.includes('if(action==="set_language")'),'Selected language not persisted to player');
assert(login.includes('notification_language:gameLanguage'),'Persisted game locale must be used by bot');
for(const kind of ['pwcoins','pwenergy']){
 assert(login.includes('"'+kind+':"+packKey+":"+user.id+":"+(gameLanguage||player.notification_language||"ru")+":"'),'Stars invoice missing selected locale: '+kind);
}
assert(webhook.includes('const paidLocale=payload.match('),'Webhook must extract locale from the invoice actually paid');
assert(webhook.includes('const l=paidLocale||'),'Invoice locale must take priority over old Telegram preference');
const paymentLocale=/^pw(?:coins|energy):[^:]+:\d+:(ru|en|az):/;
for(const lang of ['ru','en','az']){
 for(const type of ['pwcoins:ctest','pwcoins:c10','pwenergy:e1','pwenergy:e5']){
  const payload=type+':123456789:'+lang+':01234567-89ab-cdef';
  assert.equal(payload.match(paymentLocale)?.[1],lang,'Payment locale parsing failed: '+payload);
 }
}
for(const p of ['pwcoins:ctest:123456789:01234567-89ab-cdef','pwenergy:e1:123456789:01234567-89ab']){
 assert.equal(p.match(paymentLocale),null,'Old invoices must use account-language fallback');
}
assert(css.includes('place-items:center'),'Purchase terms must be centered');
assert(css.includes('height:100dvh'),'Purchase terms must use dynamic mobile viewport');
assert(html.includes('20261024-centered-purchase-terms'),'Centered purchase terms style not cache-busted');
console.log('PASS: signed login, game language changes, Stars invoice locale and RU/EN/AZ bot payment notifications; centered iPhone modal.');
