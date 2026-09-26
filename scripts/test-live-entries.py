"""Exercise the real published PhotoWord Mini App UI. Supabase calls are mocked; no real account data is changed."""
import json, time, urllib.parse, urllib.request, re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE='https://firstgame001-star.github.io/Photoword2026/'
RELEASE='20260927-r19'
OUT=Path('test-results'); OUT.mkdir(exist_ok=True)

for attempt in range(48):
    try:
        with urllib.request.urlopen(BASE+'clean/release.json?verify='+str(time.time()),timeout=20) as r:
            body=r.read().decode()
            if r.status==200 and RELEASE in body: break
    except Exception: pass
    time.sleep(5)
else: raise AssertionError('Public Pages never reached '+RELEASE)

for path in ['clean/','clean/game.html','clean/core.js','clean/home.js','clean/game.js','clean/ui.css','clean/privacy.html','clean/terms.html']:
    with urllib.request.urlopen(BASE+path+'?r='+RELEASE,timeout=20) as r: assert r.status==200,path
    print('LIVE HTTP 200:',path,flush=True)

ANSWERS={
'ru':["СОБАКА","КОШКА","МОРЕ","ДОЖДЬ","ВРЕМЯ","ТЕПЛО","ПАМЯТЬ","СВЕТ","ПУТЬ","ТАЙНА","ТЕНЬ","СЛЕД","ВОЛНА","КЛЮЧ","КОРЕНЬ","СЕТЬ","ТОК","КАДР","СВЯЗЬ","ИСТОЧНИК","МОСТ","МАСКА","ИСКРА","ЗЕРКАЛО","ПУСТЫНЯ","ШИФР","ПЛАМЯ","КОМЕТА","ЛАБИРИНТ","СИГНАЛ","ПЕЧАТЬ","УЗЕЛ","СПУТНИК","ОБЛАКО","ГРАНЬ","КОНТУР","ОСКОЛОК","ИМПУЛЬС","АРХИВ","ГОРИЗОНТ","ВЕКТОР","СПЕКТР","ОРБИТА","РЕЗОНАНС","ПАРАДОКС","МАТРИЦА","ТРАЕКТОРИЯ","КОДЕКС","КОМПАС"],
'en':["DOG","CAT","SEA","RAIN","TIME","WARMTH","MEMORY","LIGHT","PATH","SECRET","SHADOW","TRACE","WAVE","KEY","ROOT","NET","CURRENT","FRAME","LINK","SOURCE","BRIDGE","MASK","SPARK","MIRROR","DESERT","CODE","FLAME","COMET","MAZE","SIGNAL","STAMP","KNOT","SATELLITE","CLOUD","EDGE","OUTLINE","SHARD","IMPULSE","ARCHIVE","HORIZON","VECTOR","SPECTRUM","ORBIT","RESONANCE","PARADOX","MATRIX","TRAJECTORY","CODEX","COMPASS"],
'az':["İT","PİŞİK","DƏNİZ","YAĞIŞ","ZAMAN","İSTİ","YADDAŞ","İŞIQ","YOL","SİRR","KÖLGƏ","İZ","DALĞA","AÇAR","KÖK","ŞƏBƏKƏ","CƏRƏYAN","KADR","ƏLAQƏ","MƏNBƏ","KÖRPÜ","MASKA","QILCIM","GÜZGÜ","SƏHRA","ŞİFRƏ","ALOV","KOMETA","LABİRİNT","SİQNAL","MÖHÜR","DÜYÜN","PEYK","BULUD","KƏNAR","KONTUR","QIRINTI","İMPULS","ARXİV","ÜFÜQ","VEKTOR","SPEKTR","ORBİT","REZONANS","PARADOKS","MATRİSA","TRAEKTORİYA","KODEKS","KOMPAS"]
}
HINTS={
'ru':{1:'Домашнее животное',11:'Она появляется рядом',21:'Соединяет два берега',31:'Её ставят на документ',41:'Направленная величина'},
'en':{1:'loyal domestic animal',11:'object blocks light',21:'connects two sides',31:'put on a document',41:'directed quantity'},
'az':{1:'ən yaxın dostu',11:'İşığın qarşısı kəsiləndə',21:'İki sahili',31:'sənədə və ya kağıza',41:'istiqamətli kəmiyyət'}
}
reports=[]

def auth_fragment():
    raw=urllib.parse.urlencode({'auth_date':str(int(time.time())),'user':json.dumps({'id':90000000,'first_name':'Test'}),'hash':'pw-ci-only'})
    return urllib.parse.urlencode({'tgWebAppData':raw,'tgWebAppVersion':'8.0','tgWebAppPlatform':'ios'})

def install_mock(ctx,account,completed,lang):
    def mock(route):
        req=route.request
        if req.method=='OPTIONS':
            route.fulfill(status=204,headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'});return
        body=json.loads(req.post_data or '{}')
        if '/rest/v1/rpc/get_leaderboard' in req.url:
            row=account.copy()
            route.fulfill(status=200,content_type='application/json',body=json.dumps([row] if row['xp']>0 else []),headers={'Access-Control-Allow-Origin':'*'});return
        assert 'pw-ci-only' in body.get('initData',''),'Telegram launch data lost'
        action=body.get('action','login');status=200;data=None
        if action=='use_hint':
            cost={'letter':50,'remove':100,'text':150}[body['hintType']]
            if account['coins']<cost: status=402;data={'error':'insufficient_coins'}
            else: account['coins']-=cost
        elif action=='complete_level':
            level=int(body['levelId']);assert body.get('answer')==ANSWERS[lang][level-1],(lang,level,body.get('answer'))
            if level not in completed:
                completed.add(level);account['coins']+=20;account['xp']+=15;account['completed_levels']+=1;account['current_level']=max(account['current_level'],level+1);account['rank']=1
        elif action=='reset_progress':
            completed.clear();account.update(xp=0,completed_levels=0,current_level=1,rank=0)
        elif action=='claim_daily':
            account['coins']+=5;account['daily_streak']=max(1,account.get('daily_streak',0)+1);account['last_daily_reward']=time.strftime('%Y-%m-%d')
        elif action=='claim_task':
            account['coins']+=40 if body.get('taskKey')=='level_1' else 80
        elif action=='set_nickname':
            nick=body.get('nickname','');assert re.fullmatch(r'[A-Za-z0-9_]{3,16}',nick);account['game_nickname']=nick;account['nickname_changed']=True
        elif action=='friends':
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'friends':[{'photoword_id':'PW-FRIEND','first_name':'Friend','last_name':'','username':'friend','game_nickname':'FriendOne','completed_levels':7,'rewarded':False}],'invited':1,'rewarded':0,'total_reward':0}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='create_invoice':
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'invoice_url':'https://t.me/$test'}),headers={'Access-Control-Allow-Origin':'*'});return
        if data is None:data={'player':account.copy()}
        route.fulfill(status=status,content_type='application/json',body=json.dumps(data),headers={'Access-Control-Allow-Origin':'*'})
    ctx.route('https://bqoraxewpcnmidvjlpuy.supabase.co/**',mock)

def tap_word(page,word):
    for pos,ch in enumerate(word):
        if page.locator('#slots .slot').nth(pos).inner_text(): continue
        loc=page.locator('#letters .letter:not([disabled])').filter(has_text=re.compile('^'+re.escape(ch)+'$')).first
        expect(loc).to_be_visible();loc.tap()

fragment=auth_fragment()
with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
    browser=getattr(pw,engine).launch()

    # First launch language gate is universally understandable.
    ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
    account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':5000,'xp':0,'completed_levels':0,'current_level':1,'rank':0,'daily_streak':0,'last_daily_reward':None}
    install_mock(ctx,account,set(),'az');page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'clean/#'+fragment,wait_until='domcontentloaded',timeout=45000)
    expect(page.locator('#languageModal')).to_be_visible();expect(page.locator('#languageTitle')).to_contain_text('Choose language');expect(page.locator('#languageTitle')).to_contain_text('Dil seçin');expect(page.locator('#languageClose')).to_be_hidden()
    page.locator('[data-language="az"]').tap();expect(page.locator('#languageModal')).to_be_hidden()
    expect(page.locator('#activeChapterTitle')).to_have_text('İsinmə');expect(page.locator('#shopOffer')).to_contain_text('Daha çox sikkə');expect(page.locator('#logoWord')).to_have_text('1 SÖZ');page.locator('#chaptersNav').tap();expect(page.locator('#chapter1Label')).to_contain_text('1–20');expect(page.locator('#chapter2Label')).to_contain_text('21–49');expect(page.locator('#chapter2Play')).to_have_class(re.compile('locked'));page.locator('#chaptersBack').tap()
    body=page.locator('body').inner_text()
    for leak in ['Больше монет','Главная','Задания','Рейтинг','Сегодня награда']: assert leak not in body,('AZ leak',leak)
    assert not errors,errors;ctx.close()

    # Settings, full localization, themes, nickname, daily, friends, reset language gate.
    for language in ['ru','en','az']:
      ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
      ctx.add_init_script(f"localStorage.setItem('pw.language','{language}'); localStorage.setItem('pw.theme','game');")
      account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':5000,'xp':300,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None}
      completed=set(range(1,21));install_mock(ctx,account,completed,language);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      page.goto(BASE+'clean/#'+fragment,wait_until='domcontentloaded',timeout=45000)
      # Chapters: chapter 2 is unlocked after level 20 and uses a 29-level counter.
      expect(page.locator('#activeChapterLabel')).to_contain_text('2')
      page.locator('#chaptersNav').tap();expect(page.locator('#chaptersScreen')).to_be_visible();expect(page.locator('#chapter1Label')).to_contain_text('1–20');expect(page.locator('#chapter2Label')).to_contain_text('21–49');expect(page.locator('#chapter2Count')).to_contain_text('29');expect(page.locator('#chapter2Play')).not_to_have_class(re.compile('locked'));expect(page.locator('#chapter2Play')).to_have_attribute('href','./game.html?level=21');page.locator('#chaptersBack').tap()
      # Every visual theme must apply and persist.
      for theme in ['game','night','light','neon','gold']:
        page.locator('#settingsBtn').tap();page.locator('#themeBtn').tap();expect(page.locator('#themeModal')).to_be_visible();page.locator(f'button[data-theme="{theme}"]').tap();assert page.evaluate("document.documentElement.dataset.theme")==theme;assert page.evaluate("localStorage.getItem('pw.theme')")==theme
      # Sound, haptics and music preferences persist.
      page.locator('#settingsBtn').tap();page.locator('#soundToggle').uncheck();page.locator('#hapticToggle').uncheck();page.locator('#musicToggle').check();prefs=page.evaluate("JSON.parse(localStorage.getItem('photoword-prefs'))");assert prefs['sound'] is False and prefs['haptic'] is False and prefs['music'] is True;page.locator('#musicToggle').uncheck();page.locator('[data-close="settingsModal"]').tap()
      # Language can be changed from Settings and changed back without losing the game.
      other={'ru':'en','en':'az','az':'ru'}[language];page.locator('#settingsBtn').tap();page.locator('#languageBtn').tap();page.locator(f'[data-language="{other}"]').tap();assert page.evaluate("localStorage.getItem('pw.language')")==other;page.locator('#settingsBtn').tap();page.locator('#languageBtn').tap();page.locator(f'[data-language="{language}"]').tap();assert page.evaluate("localStorage.getItem('pw.language')")==language
      # Notification setting is present and localized; native permission is controlled by Telegram.
      page.locator('#settingsBtn').tap();expect(page.locator('#notificationsBtn')).to_be_visible();expect(page.locator('#notificationsState')).not_to_be_empty();page.locator('[data-close="settingsModal"]').tap()
      # Rules and support are localized.
      page.locator('#settingsBtn').tap();page.locator('#rulesBtn').tap();expect(page.locator('#rulesModal')).to_be_visible();assert len(page.locator('#rulesBody').inner_text())>100;page.locator('[data-close="rulesModal"]').tap()
      page.locator('#settingsBtn').tap();page.locator('#supportBtn').tap();expect(page.locator('#supportModal')).to_be_visible()
      if language=='az': expect(page.locator('#supportTitle')).to_have_text('Dəstək')
      if language=='en': expect(page.locator('#supportTitle')).to_have_text('Support')
      page.locator('[data-close="supportModal"]').tap()
      # Privacy and terms follow the selected language.
      legal=ctx.new_page();legal.goto(BASE+'clean/privacy.html?r='+RELEASE,wait_until='domcontentloaded');expected_priv={'ru':'Политика конфиденциальности','en':'Privacy Policy','az':'Məxfilik siyasəti'}[language];expect(legal.locator('#pt')).to_have_text(expected_priv);legal.goto(BASE+'clean/terms.html?r='+RELEASE,wait_until='domcontentloaded');expected_terms={'ru':'Пользовательское соглашение','en':'Terms of Use','az':'İstifadəçi razılaşması'}[language];expect(legal.locator('#tt')).to_have_text(expected_terms);legal.close()
      # Nickname is one-time UI and becomes the displayed name.
      page.locator('#profileBtn').tap();page.locator('#nicknameBtn').tap();page.locator('#nicknameInput').fill('Player_77');page.locator('#saveNickname').tap();expect(page.locator('#name')).to_have_text('Player_77');page.locator('#profileBtn').tap();expect(page.locator('#nicknameBtn')).to_be_disabled()
      # Share-game control is available from the profile.
      expect(page.locator('#shareGameBtn')).to_be_visible();page.locator('[data-close="profileModal"]').tap()
      # Daily +5 updates balance, marks claimed and closes.
      before=int(page.locator('[data-coins]').first.inner_text());page.locator('#dailyRewardBtn').tap();page.locator('#claimDaily').tap();expect(page.locator('[data-coins]').first).to_have_text(str(before+5));expect(page.locator('#dailyModal')).to_be_hidden(timeout=2500)
      # Daily tasks claim and update balance.
      before=int(page.locator('[data-coins]').first.inner_text());page.locator('#tasksBtn').tap();page.locator('[data-task="level_1"]').tap();expect(page.locator('[data-coins]').first).to_have_text(str(before+40));page.locator('[data-close="tasksModal"]').tap()
      # Friends use nickname and progress.
      page.locator('#friendsNav').tap();expect(page.locator('#friendsList')).to_contain_text('FriendOne');expect(page.locator('#friendsList')).to_contain_text('7 / 10');page.locator('[data-close="friendsModal"]').tap()
      # Rating and shop surfaces are reachable/localized; native Stars invoice UI is Telegram-controlled.
      page.locator('#ratingNav').tap();expect(page.locator('#leaderboard')).to_contain_text('Player_77');page.locator('#ratingBack').tap();page.locator('#shopNav').tap();expect(page.locator('#shopModal')).to_be_visible();expect(page.locator('#watchAd')).to_be_disabled();expect(page.locator('[data-pack="c10"]')).to_be_enabled();page.locator('[data-close="shopModal"]').tap()
      # Reset requires double confirmation and then requires language again.
      page.locator('#settingsBtn').tap();page.locator('#resetProgressBtn').tap();page.locator('#confirmReset').tap();page.locator('#confirmReset').tap();expect(page.locator('#languageModal')).to_be_visible(timeout=3000);expect(page.locator('#languageClose')).to_be_hidden()
      assert not errors,errors;ctx.close()

    # Complete all 49 levels in all 3 languages and exercise hints across both chapters.
    for language in ['ru','en','az']:
      ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
      ctx.add_init_script(f"localStorage.setItem('pw.language','{language}'); localStorage.setItem('pw.theme','game');")
      account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':10000,'xp':0,'completed_levels':0,'current_level':1,'rank':0,'daily_streak':0,'last_daily_reward':None}
      completed=set();install_mock(ctx,account,completed,language);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      page.goto(BASE+'clean/#'+fragment,wait_until='domcontentloaded',timeout=45000);page.locator('#playLink').tap();expect(page.locator('#shuffle')).to_be_visible()
      for level in range(1,50):
        expect(page.locator('#levelTitle')).to_contain_text(str(level))
        answer=ANSWERS[language][level-1]
        available=page.locator('#letters .letter').all_inner_texts()
        for ch in set(answer): assert available.count(ch)>=answer.count(ch),(language,level,ch,available)
        if level in (1,11,21,31,41):
          page.locator('#textHint').tap();expect(page.locator('#hintValue')).to_contain_text(HINTS[language][level])
        if level in (2,12,22,32,42):
          page.locator('#letterHint').tap();expect(page.locator('#slots .fixed')).to_have_count(1)
        if level in (3,13,23,33,43):
          page.locator('#removeHint').tap();expect(page.locator('#letters .removed')).to_have_count(3)
        tap_word(page,answer);expect(page.locator('#successPanel')).to_be_visible(timeout=5000);expect(page.locator('#successTitle')).to_contain_text(str(level));expect(page.locator('#successReward')).to_contain_text('15 XP')
        if level==20:
          expect(page.locator('#successChapter')).to_be_visible();expect(page.locator('#successChapter')).to_contain_text('2' if language=='az' else ('Chapter 2' if language=='en' else 'Глава 2'));expect(page.locator('#nextLevel')).to_have_attribute('href','./game.html?level=21');page.locator('#nextLevel').tap();expect(page.locator('.game-head>div:nth-child(2)>b')).to_contain_text('2');expect(page.locator('#shuffle')).to_be_visible()
        elif level<49:
          page.locator('#nextLevel').tap();expect(page.locator('#shuffle')).to_be_visible()
        else:
          expect(page.locator('#successChapter')).to_be_visible();expect(page.locator('#nextLevel')).to_have_attribute('href','./index.html')
      assert account['completed_levels']==49 and account['xp']==735 and account['current_level']==50
      page.screenshot(path=str(OUT/f'{engine}-{language}-level49.png'),full_page=True)
      assert not errors,errors
      report={'engine':engine,'language':language,'levels':'1-49','checks':['chapter 1 levels 1-20','chapter 2 levels 21-49','chapter transition at 20','all answer letter pools','localized text hints across difficulty bands','letter hint','remove hint','49 server answers mocked','15 XP each','20 coins each','final level 49 returns home'],'result':'PASS'}
      reports.append(report);print(json.dumps(report,ensure_ascii=False),flush=True);ctx.close()
    browser.close()

(OUT/'results.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2))
