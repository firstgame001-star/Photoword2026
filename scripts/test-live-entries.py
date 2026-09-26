"""Exercise the real published PhotoWord Pages UI. Supabase is fully mocked: no user balances or progress are changed."""
import json, time, urllib.parse, urllib.request, re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE='https://firstgame001-star.github.io/Photoword2026/'
RELEASE='20260926-r12'
OUT=Path('test-results'); OUT.mkdir(exist_ok=True)

# Wait for the exact public release, not merely for GitHub source commits.
for attempt in range(36):
    try:
        with urllib.request.urlopen(BASE+'clean/release.json?verify='+str(time.time()),timeout=20) as r:
            body=r.read().decode()
            if r.status==200 and RELEASE in body: break
    except Exception:
        pass
    time.sleep(5)
else:
    raise AssertionError('Public Pages never reached '+RELEASE)

for path in ['clean/','clean/game.html','clean/core.js','clean/home.js','clean/game.js','clean/ui.css','clean/privacy.html','clean/terms.html']:
    with urllib.request.urlopen(BASE+path+'?r='+RELEASE,timeout=20) as r:
        assert r.status==200, path
    print('LIVE HTTP 200:',path,flush=True)

ANSWERS={
 'ru':['СОБАКА','КОШКА','МОРЕ','ДОЖДЬ','ВРЕМЯ','ТЕПЛО','ПАМЯТЬ','СВЕТ','ПУТЬ','ТАЙНА'],
 'en':['DOG','CAT','SEA','RAIN','TIME','WARMTH','MEMORY','LIGHT','PATH','SECRET'],
 'az':['İT','PİŞİK','DƏNİZ','YAĞIŞ','ZAMAN','İSTİ','YADDAŞ','İŞIQ','YOL','SİRR'],
}
HINTS={'ru':'Домашнее животное','en':'loyal domestic animal','az':'İnsanın ən yaxın dostu'}
LEVEL_WORD={'ru':'Уровень','en':'Level','az':'səviyyə'}
reports=[]

def init_data():
    raw=urllib.parse.urlencode({'auth_date':str(int(time.time())),'user':json.dumps({'id':90000000,'first_name':'Test'}),'hash':'pw-ci-only'})
    return raw, urllib.parse.urlencode({'tgWebAppData':raw,'tgWebAppVersion':'8.0','tgWebAppPlatform':'ios'})

def install_mock(ctx, account, completed, lang):
    def mock(route):
        req=route.request
        if req.method=='OPTIONS':
            route.fulfill(status=204,headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'}); return
        body=json.loads(req.post_data or '{}')
        if '/rest/v1/rpc/get_leaderboard' in req.url:
            route.fulfill(status=200,content_type='application/json',body=json.dumps([account.copy()]),headers={'Access-Control-Allow-Origin':'*'}); return
        assert 'pw-ci-only' in body.get('initData',''), 'Telegram launch data lost'
        action=body.get('action','login'); status=200; data=None
        if action=='use_hint':
            level=int(body['levelId']); assert level<=account['current_level']
            cost={'letter':50,'remove':100,'text':150}[body['hintType']]
            if account['coins']<cost: status=402; data={'error':'insufficient_coins'}
            else: account['coins']-=cost
        elif action=='complete_level':
            level=int(body['levelId']); assert body.get('answer')==ANSWERS[lang][level-1]
            if level not in completed:
                completed.add(level); account['coins']+=20; account['xp']+=15; account['completed_levels']+=1; account['current_level']=max(account['current_level'],level+1)
        elif action=='reset_progress':
            completed.clear(); account.update(xp=0,completed_levels=0,current_level=1,rank=0)
        elif action=='friends':
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'friends':[],'invited':0,'rewarded':0,'total_reward':0}),headers={'Access-Control-Allow-Origin':'*'}); return
        elif action in ('claim_daily','claim_task','register_referral'):
            pass
        elif action=='create_invoice':
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'invoice_url':'https://t.me/$test'}),headers={'Access-Control-Allow-Origin':'*'}); return
        if data is None: data={'player':account.copy()}
        route.fulfill(status=status,content_type='application/json',body=json.dumps(data),headers={'Access-Control-Allow-Origin':'*'})
    ctx.route('https://bqoraxewpcnmidvjlpuy.supabase.co/**',mock)

def tap_word(page, word):
    for index,ch in enumerate(word):
        if page.locator('#slots .slot').nth(index).inner_text():
            continue
        loc=page.locator('#letters .letter:not([disabled])').filter(has_text=re.compile('^'+re.escape(ch)+'$')).first
        expect(loc).to_be_visible()
        loc.tap()

with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
    browser=getattr(pw,engine).launch()

    # First launch must force a language choice and then persist it.
    raw,fragment=init_data()
    ctx=browser.new_context(viewport={'width':390,'height':780},has_touch=True,is_mobile=True)
    account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'coins':5000,'xp':0,'completed_levels':0,'current_level':1,'rank':1,'daily_streak':0}
    install_mock(ctx,account,set(),'en')
    page=ctx.new_page(); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'clean/#'+fragment,wait_until='domcontentloaded',timeout=45000)
    expect(page.locator('#languageModal')).to_be_visible()
    page.locator('[data-language="en"]').tap()
    expect(page.locator('#languageModal')).to_be_hidden()
    expect(page.locator('.chapter-title h1')).to_have_text('Warm-up')
    assert page.evaluate("localStorage.getItem('pw.language')")=='en'
    assert not errors,errors
    ctx.close()

    # Settings: theme, rules, music toggle, notification action, reset semantics.
    ctx=browser.new_context(viewport={'width':390,'height':780},has_touch=True,is_mobile=True)
    ctx.add_init_script("localStorage.setItem('pw.language','ru'); localStorage.setItem('pw.theme','game');")
    account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'coins':5000,'xp':150,'completed_levels':10,'current_level':11,'rank':1,'daily_streak':2}
    install_mock(ctx,account,set(range(1,11)),'ru')
    page=ctx.new_page(); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'clean/#'+fragment,wait_until='domcontentloaded',timeout=45000)
    page.locator('#settingsBtn').tap(); expect(page.locator('#settingsModal')).to_be_visible()
    page.locator('#themeBtn').tap(); expect(page.locator('#themeModal')).to_be_visible()
    page.locator('[data-theme="neon"]').tap(); assert page.evaluate("document.documentElement.dataset.theme")=='neon'
    page.locator('#settingsBtn').tap(); page.locator('#rulesBtn').tap(); expect(page.locator('#rulesModal')).to_be_visible(); expect(page.locator('#rulesBody')).to_contain_text('Подсказки')
    page.locator('[data-close="rulesModal"]').tap(); page.locator('#settingsBtn').tap()
    page.locator('#musicToggle').check(); assert page.evaluate("JSON.parse(localStorage.getItem('photoword-prefs')).music") is True
    page.locator('#musicToggle').uncheck()
    page.locator('#notificationsBtn').tap(); expect(page.locator('#status')).not_to_be_empty()
    page.locator('#resetProgressBtn').tap(); expect(page.locator('#resetModal')).to_be_visible()
    page.locator('#confirmReset').tap(); page.locator('#confirmReset').tap()
    expect(page.locator('#done')).to_have_text('0'); expect(page.locator('#rankLabel')).to_contain_text('вне рейтинга')
    assert not errors,errors
    ctx.close()

    # Full 1 -> 10 progression in every language on the real published game UI.
    for lang in ['ru','en','az']:
      ctx=browser.new_context(viewport={'width':390,'height':780},has_touch=True,is_mobile=True)
      ctx.add_init_script(f"localStorage.setItem('pw.language','{lang}'); localStorage.setItem('pw.theme','game');")
      account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'coins':5000,'xp':0,'completed_levels':0,'current_level':1,'rank':1,'daily_streak':0}
      completed=set(); install_mock(ctx,account,completed,lang)
      page=ctx.new_page(); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
      page.goto(BASE+'clean/#'+fragment,wait_until='domcontentloaded',timeout=45000)
      page.locator('#playLink').tap(); expect(page.locator('#shuffle')).to_be_visible()
      for level in range(1,11):
        expect(page.locator('#levelTitle')).to_contain_text(str(level))
        answer=ANSWERS[lang][level-1]
        # Every answer character must be present in the active language letter bank.
        available=page.locator('#letters .letter').all_inner_texts()
        for ch in set(answer):
            assert available.count(ch)>=answer.count(ch), (lang,level,ch,available)
        if level==1:
            page.locator('#textHint').tap(); expect(page.locator('#hintValue')).to_contain_text(HINTS[lang])
            wrong=answer[::-1]
            if wrong==answer: wrong=answer[1:]+answer[:1]
            tap_word(page,wrong); expect(page.locator('#status')).to_be_visible()
            page.wait_for_function('Array.from(document.querySelectorAll("#slots .slot")).every(x=>!x.textContent)',timeout=5000)
        if level==2:
            page.locator('#letterHint').tap(); expect(page.locator('#slots .fixed')).to_have_count(1)
        if level==3:
            page.locator('#removeHint').tap(); expect(page.locator('#letters .removed')).to_have_count(3)
        tap_word(page,answer)
        expect(page.locator('#successPanel')).to_be_visible(timeout=5000)
        expect(page.locator('#successTitle')).to_contain_text(str(level))
        expect(page.locator('#successReward')).to_contain_text('15 XP')
        if level<10:
            page.locator('#nextLevel').tap(); expect(page.locator('#shuffle')).to_be_visible()
        else:
            expect(page.locator('#nextLevel')).to_have_attribute('href','./index.html')
      assert account['completed_levels']==10 and account['xp']==150 and account['current_level']==11
      page.screenshot(path=str(OUT/f'{engine}-{lang}-level10.png'),full_page=True)
      assert not errors,errors
      report={'engine':engine,'language':lang,'levels':'1-10','checks':['first language-specific hint','letter bank coverage','wrong answer reset','letter hint','remove hint','all 10 answers','15 XP per level','20 coins per level','final level returns home'],'result':'PASS'}
      reports.append(report); print(json.dumps(report,ensure_ascii=False),flush=True)
      ctx.close()
    browser.close()

(OUT/'results.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2))
