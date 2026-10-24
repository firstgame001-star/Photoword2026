import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const legal=readFileSync('clean/legal-terms-data.js','utf8');
const home=readFileSync('clean/home.js','utf8');
const html=readFileSync('clean/index.html','utf8');
const standalone=readFileSync('clean/terms.html','utf8');
const css=readFileSync('clean/ui.css','utf8');

const window={};
vm.runInNewContext(legal,{window});
const terms=window.PWLegalTerms;
assert.deepEqual(Object.keys(terms).sort(),['az','en','ru'],'All locales must be available');
const expected={ru:'Пользовательское соглашение',en:'Terms of Use',az:'İstifadəçi razılaşması'};
for(const lang of ['ru','en','az']){
 const t=terms[lang];
 assert.equal(t.t,expected[lang],'Wrong legal title for '+lang);
 assert(t.d.length>5,'Update date missing '+lang);
 assert.equal((t.c.match(/<section>/g)||[]).length,6,'Six complete sections required '+lang);
 assert(t.c.includes('/paysupport'),'Payment support details missing '+lang);
 assert(t.c.includes('firstgame001@mail.ru'),'Support email missing '+lang);
 assert(t.c.includes('PhotoWord'),'Game identification missing '+lang);
 assert(t.c.length>2000,'Full agreement replaced with short teaser '+lang);
}
assert(html.includes('legal-terms-data.js?v='),'Embedded agreement script is missing');
assert(html.indexOf('legal-terms-data.js?v=')<html.indexOf('home.js?v='),'Legal data must load before home script');
assert(standalone.includes('const L=window.PWLegalTerms'),'Standalone Terms must use canonical source');
assert(standalone.includes('<script src="./legal-terms-data.js?v='),'Standalone page has no legal data');
assert(html.includes('id="purchaseTermsContent"'),'Purchase agreement needs an in-app scroll region');
assert(!html.includes('id="purchaseTermsLink"'),'Payment should not open external legal page');
assert(!/id="termsLink"[^>]*href=/.test(html),'Settings Terms link should not navigate outside the app');
assert(home.includes('content.innerHTML=legal.c'),'Full localized agreement must render inside PhotoWord');
assert(home.includes("purchaseTermsAccepted=true"),'Accepted payment terms must be recorded');
assert(home.includes("if(!resolve)return; // Reading from Settings never counts as accepting a purchase."),'Read-only Terms must not count as purchase consent');
assert(home.includes("$('termsLink').onclick="),'Settings Terms must open inside app');
assert(css.includes('.purchase-terms-content{'),'Scrollable in-app legal text needs styling');
assert(css.includes('overflow-y:auto'),'Legal scroll region missing');
assert(css.includes('place-items:center'),'Payment terms must remain centered');
console.log('PASS: full 6-section RU/EN/AZ Terms displayed in-app; Settings reading separated from purchase consent; no GitHub navigation.');
