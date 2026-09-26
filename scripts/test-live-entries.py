"""Read the real Pages build. All Supabase requests are mocked; no live balance changes."""
import json, time, urllib.parse, urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
BASE = 'https://firstgame001-star.github.io/Photoword2026/'
OUT = Path('test-results'); OUT.mkdir(exist_ok=True)
for path in ['', 'app/', 'game.html', 'app/game.html']:
    for attempt in range(24):
        with urllib.request.urlopen(BASE + path + '?release_check=entry-r2', timeout=20) as r:
            text=r.read().decode()
            ok=r.status==200 and 'pw-entry-r2' in text
        if ok: break
        time.sleep(5)
    else: raise AssertionError('Entry not published: '+path)
    print('LIVE ENTRY HTTP 200:', path or '/', flush=True)

reports=[]
with sync_playwright() as pw:
    for engine in ['chromium', 'webkit']:
        browser=getattr(pw,engine).launch()
        for path in ['', 'app/', 'clean/']:
            ctx=browser.new_context(viewport={'width':390,'height':780},has_touch=True,is_mobile=True)
            account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'coins':250,'xp':0,'completed_levels':0,'rank':1}
            errors=[]; actions=[]
            def mock(route):
                req=route.request
                if req.method=='OPTIONS':
                    route.fulfill(status=204,headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'})
                    return
                body=json.loads(req.post_data or '{}')
                if '/rest/v1/rpc/get_leaderboard' in req.url:
                    data=[account.copy()]; status=200
                else:
                    assert 'pw-ci-only' in body.get('initData',''), 'Telegram launch data lost'
                    action=body.get('action','login'); actions.append(action)
                    status=200; data=None
                    if action=='use_hint':
                        cost={'letter':50,'remove':100,'text':150}[body['hintType']]
                        if account['coins']<cost:
                            status=402; data={'error':'insufficient_coins'}
                        else: account['coins']-=cost
                    if action=='complete_level':
                        assert body.get('answer')=='СОБАКА'
                        if account['completed_levels']==0:
                            account.update(coins=account['coins']+20,xp=100,completed_levels=1)
                    if data is None: data={'player':account.copy()}
                route.fulfill(status=status,content_type='application/json',body=json.dumps(data),headers={'Access-Control-Allow-Origin':'*'})
            ctx.route('https://bqoraxewpcnmidvjlpuy.supabase.co/**',mock)
            page=ctx.new_page(); page.on('pageerror',lambda e:errors.append(str(e)))
            raw=urllib.parse.urlencode({'auth_date':str(int(time.time())),'user':json.dumps({'id':90000000,'first_name':'Test'}),'hash':'pw-ci-only'})
            fragment=urllib.parse.urlencode({'tgWebAppData':raw,'tgWebAppVersion':'8.0','tgWebAppPlatform':'ios'})
            page.goto(BASE+path+'#'+fragment,wait_until='domcontentloaded',timeout=45000)
            expect(page.locator('#settingsBtn')).to_be_visible()
            page.locator('#settingsBtn').tap()
            expect(page.locator('#settingsModal')).to_be_visible()
            page.locator('[data-close="settingsModal"]').tap()
            expect(page.locator('#settingsModal')).to_be_hidden()
            page.locator('#playLink').tap()
            expect(page.locator('#shuffle')).to_be_visible()
            expect(page.locator('[data-coins]')).to_have_text('250')
            before=page.locator('#letters .letter').evaluate_all('(xs)=>xs.map(x=>x.dataset.tile).join(",")')
            page.locator('#shuffle').tap()
            after=page.locator('#letters .letter').evaluate_all('(xs)=>xs.map(x=>x.dataset.tile).join(",")')
            assert before!=after,'Shuffle did not change tile order'
            page.evaluate('if(window.Telegram?.WebApp?.HapticFeedback) Telegram.WebApp.HapticFeedback.notificationOccurred=()=>{throw new Error("mock native bridge error")};')
            for letter in 'НТЛДЕР':
                page.get_by_role('button',name=letter,exact=True).tap()
            expect(page.locator('#status')).to_contain_text('Неверное слово')
            page.wait_for_function('Array.from(document.querySelectorAll("#slots .slot")).every(x=>!x.textContent)')
            page.locator('#letterHint').tap()
            expect(page.locator('[data-coins]')).to_have_text('200')
            expect(page.locator('#slots .fixed')).to_have_count(1)
            page.locator('#removeHint').tap()
            expect(page.locator('[data-coins]')).to_have_text('100')
            expect(page.locator('#letters .removed')).to_have_count(3)
            page.locator('#textHint').tap()
            expect(page.locator('#status')).to_contain_text('Недостаточно монет')
            expect(page.locator('[data-coins]')).to_have_text('100')
            for index,letter in enumerate('СОБАКА'):
                if page.locator('#slots .slot').nth(index).inner_text(): continue
                page.locator('#letters .letter:not([disabled])').filter(has_text=letter).first.tap()
            expect(page.locator('#finish')).to_be_visible()
            expect(page.locator('[data-coins]')).to_have_text('120')
            page.screenshot(path=str(OUT/f'{engine}-{path.strip("/") or "root"}.png'),full_page=True)
            assert not errors,errors
            reports.append({'engine':engine,'entry':path or '/','checks':['entry redirects','settings open/close','play navigation','Telegram data retained','shuffle','wrong answer reset despite native bridge error','letter hint','remove hint','insufficient balance','answer saved'],'server':'MOCKED; no real balance changes','result':'PASS'})
            print(json.dumps(reports[-1]),flush=True)
            ctx.close()
        browser.close()
(OUT/'results.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2))
