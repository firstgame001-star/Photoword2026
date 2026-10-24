"""iPhone WebKit / Android Chromium: purchase terms must visibly precede invoice.
All network calls to PhotoWord servers are mocked; no payments or live users.
"""
import ast,json,time,threading,urllib.parse
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

tree=ast.parse(Path('scripts/test-live-entries.py').read_text(encoding='utf-8'))
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in {'auth_fragment','install_mock','relevant_errors'}],type_ignores=[]),'<mock-helpers>','exec'))
out=Path('test-results/purchase-consent')
out.mkdir(parents=True,exist_ok=True)
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(Path.cwd())))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'

with sync_playwright() as pw:
 for engine,language in [('webkit','ru'),('chromium','en'),('webkit','az')]:
  browser=getattr(pw,engine).launch()
  ctx=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  ctx.add_init_script('localStorage.setItem("pw.language",'+json.dumps(language)+');')
  account={'photoword_id':'CONSENT-TEST','first_name':'Test','game_nickname':'Test','coins':250,'xp':0,
    'completed_levels':0,'current_level':1,'rank':0,'daily_streak':0,'last_daily_reward':None,
    '_challenge_energy':4}
  install_mock(ctx,account,set(),language)
  page=ctx.new_page()
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.goto(base+'clean/#'+auth_fragment(),wait_until='domcontentloaded',timeout=50000)
  page.evaluate("""() => {
    window.__openedInvoices=[];
    if(!window.Telegram)window.Telegram={};
    if(!window.Telegram.WebApp)window.Telegram.WebApp={};
    window.Telegram.WebApp.openInvoice=(url,callback)=>{
      window.__openedInvoices.push(url);
      window.__paymentCallback=callback;
    };
  }""")
  page.locator('#shopNav').tap()
  expect(page.locator('#shopModal')).to_be_visible()
  # Capture the language sent to the invoice endpoint, never to real Telegram.
  page.locator('[data-pack="c10"]').tap()
  terms=page.locator('#purchaseTermsModal')
  expect(terms).to_be_visible(timeout=7000)
  assert page.evaluate("""() => {
    const t=document.getElementById('purchaseTermsModal'),
          s=document.getElementById('shopModal'),
          btn=document.getElementById('purchaseTermsAgree'),
          r=btn.getBoundingClientRect(),
          top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
    return !t.hidden && !s.hidden && top && t.contains(top) &&
       parseInt(getComputedStyle(t).zIndex)>parseInt(getComputedStyle(s).zIndex);
  }"""),'Consent is behind shop or cannot be tapped'
  geometry=page.evaluate("""() => {
    const box=document.querySelector('#purchaseTermsModal .modalcard').getBoundingClientRect(),
          viewport=window.visualViewport;
    return {offset:Math.abs(box.top+box.height/2-(viewport.offsetTop+viewport.height/2)),
            viewHeight:viewport.height,boxHeight:box.height};
  }""")
  assert geometry['offset']<max(22,geometry['viewHeight']*0.035),f'Consent not vertically centered: {geometry}'
  assert page.evaluate('window.__openedInvoices.length')==0,'Invoice opened before consent'
  page.screenshot(path=str(out/f'{engine}-{language}-consent.png'))
  page.locator('#purchaseTermsCancel').tap()
  expect(terms).to_be_hidden()
  assert page.evaluate('window.__openedInvoices.length')==0,'Cancelled consent still opened invoice'
  expect(page.locator('[data-pack="c10"]')).to_be_enabled()
  page.locator('[data-pack="c10"]').tap()
  expect(terms).to_be_visible()
  page.locator('#purchaseTermsAgree').tap()
  expect(terms).to_be_hidden()
  page.wait_for_function('window.__openedInvoices.length===1',timeout=10000)
  assert page.evaluate('window.__openedInvoices[0]')=='https://t.me/$test'
  page.evaluate("window.__paymentCallback('cancelled')")
  expect(page.locator('[data-pack="c10"]')).to_be_enabled()
  # Once accepted, a subsequent purchase opens the invoice without a second gate.
  page.locator('[data-energy-store-pack="e1"]').tap()
  page.wait_for_function('window.__openedInvoices.length===2',timeout=10000)
  assert page.evaluate('window.__openedInvoices[1]')=='https://t.me/$energy'
  assert terms.is_hidden(),'Consent unexpectedly reopened after acceptance'
  page.evaluate("window.__paymentCallback('cancelled')")
  expect(page.locator('[data-energy-store-pack="e1"]')).to_be_enabled()
  assert not relevant_errors(errors),errors
  print(f'PASS: {engine} {language}: consent above shop, cancel blocks payment, agree opens invoice, energy checkout unaffected')
  ctx.close();browser.close()
server.shutdown()
