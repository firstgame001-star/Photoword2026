import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Previously sold 1-Star test packs must stay in the historical payment ledger.
// New invoices and storefronts must use production prices.
const login=readFileSync('server/telegram-login/index.ts','utf8');
const webhook=readFileSync('server/telegram-webhook/index.ts','utf8');
const html=readFileSync('clean/index.html','utf8');
const home=readFileSync('clean/home.js','utf8');
const migration=readFileSync('supabase/migrations/20261024114239_temporary_one_star_one_coin_test_pack.sql','utf8');

assert(!login.includes('ctest:{coins:1,stars:1}'),'Coin test pack still open for new invoices');
assert(!html.includes('data-pack="ctest"'),'Temporary coin package is visible');
assert(!html.includes('ТЕСТ: +1 🪙'),'Temporary coin label is visible');
assert(!webhook.includes('payload.match(/^pwcoins:(ctest|c10|c50|c150|c300):(\\d+):/);') ||
  webhook.indexOf('payload.match(/^pwcoins:(ctest|c10|c50|c150|c300):') >
  webhook.indexOf('const pay=msg?.successful_payment'),
  'One-Star coin offer must be rejected before checkout');
assert(webhook.includes('ctest:{coins:1,stars:1}'),'Legacy completed coin receipts must still reconcile safely');
assert(webhook.includes('e1:{energy:1,stars:15}'),'New +1 energy price must be 15 Stars');
assert(login.includes('e1:{energy:1,stars:15}'),'Invoice must request 15 Stars');
assert(html.includes('<button data-energy-pack="e1">+1 ⚡ · 15 ⭐</button>'),'Challenge energy price outdated');
assert(html.includes('data-energy-store-pack="e1"><b>+1 ⚡</b><span>15 ⭐</span>'),'Shop energy price outdated');
assert(login.includes('currency:"XTR"')&&login.includes('amount:pack.stars'),'Telegram Stars invoice amount invalid');
assert(webhook.includes('q.total_amount')&&webhook.includes('pay.total_amount'),'Payment amount validation missing');
assert(webhook.includes('telegram_payment_charge_id'),'Transaction ID replay protection missing');
assert(home.includes("document.querySelectorAll('[data-pack]')"),'Coin invoice buttons disconnected');
assert(home.includes('tg.openInvoice(result.invoice_url'),'Payment sheet missing');
assert(migration.includes('stars=1 AND coins=1'),'Historical 1-Star coin purchases must remain supported');
console.log('PASS: test prices retired, 15-Star energy and normal coin offers restored; historic receipts preserved.');
