import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// TEMPORARY QA TEST: remove this file and package after confirmed paid checkout.
const login=readFileSync('server/telegram-login/index.ts','utf8');
const webhook=readFileSync('server/telegram-webhook/index.ts','utf8');
const html=readFileSync('clean/index.html','utf8');
const home=readFileSync('clean/home.js','utf8');
const migration=readFileSync('supabase/migrations/20261024114239_temporary_one_star_one_coin_test_pack.sql','utf8');

for(const [name,source] of [['invoice API',login],['payment webhook',webhook]]){
 assert(source.includes('ctest:{coins:1,stars:1}'),name+' does not register 1 Star = 1 coin');
}
assert(login.includes('packKey==="ctest"?"Тест PhotoWord · 1 монета"'),'Test invoice is not clearly labeled');
assert(login.includes('currency:"XTR"'),'Telegram Stars currency missing');
assert(login.includes('amount:pack.stars'),'Telegram invoice amount does not match server pack');
assert.equal((webhook.match(/\(ctest\|c10\|c50\|c150\|c300\)/g)||[]).length,2,'Both pre-checkout and payment fulfillment must accept ctest');
assert(webhook.includes('q.total_amount'),'Pre-checkout amount validation missing');
assert(webhook.includes('pay.total_amount'),'Payment amount validation missing');
assert(webhook.includes('telegram_payment_charge_id'),'Charge replay protection needs a unique Telegram receipt');
assert(home.includes("document.querySelectorAll('[data-pack]')"),'Coin pack buttons must be wired to invoice flow');
assert(home.includes("tg.openInvoice(result.invoice_url"),'Payment sheet is not opened');
assert(html.includes('data-pack="ctest"'),'One-Star test purchase is absent from shop');
assert(html.includes('<span>1 ⭐</span>'),'One-Star price label missing');
assert(migration.includes('stars=1 AND coins=1'),'Ledger must accept temporary reward price');
assert(migration.includes('((1,1),(15,10)'),'RPC must accept temporary reward price');
assert(migration.includes('ON FUNCTION public.credit_star_purchase_server'),'Server credit must keep protected EXECUTE grants');
console.log('PASS: 1-Star = 1 coin throughout storefront, invoice, checkout, webhook and secured one-time ledger.');
