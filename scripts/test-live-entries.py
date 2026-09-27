"""Exercise the real published PhotoWord Mini App UI. Supabase calls are mocked; no real account data is changed."""
import json, time, urllib.parse, urllib.request, re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE='https://firstgame001-star.github.io/Photoword2026/'
RELEASE='20260927-r62'
OUT=Path('test-results'); OUT.mkdir(exist_ok=True)

for attempt in range(48):
    try:
        with urllib.request.urlopen(BASE+'clean/release.json?verify='+str(time.time()),timeout=20) as r:
            body=r.read().decode()
            if r.status==200 and RELEASE in body: break
    except Exception: pass
    time.sleep(5)
else: raise AssertionError('Public Pages never reached '+RELEASE)

for path in ['clean/','clean/game.html','clean/theme-game.html','clean/core.js','clean/home.js','clean/game.js','clean/theme-game.js','clean/challenge-bank-extra.js','clean/challenge.js','clean/ui.css','clean/privacy.html','clean/terms.html']:
    with urllib.request.urlopen(BASE+path+'?r='+RELEASE,timeout=20) as r: assert r.status==200,path
    print('LIVE HTTP 200:',path,flush=True)

ANSWERS={
 'ru': [
  "СОБАКА",
  "КОШКА",
  "МОРЕ",
  "ДОЖДЬ",
  "ВРЕМЯ",
  "ТЕПЛО",
  "ПАМЯТЬ",
  "СВЕТ",
  "ПУТЬ",
  "ТАЙНА",
  "ТЕНЬ",
  "СЛЕД",
  "ВОЛНА",
  "КЛЮЧ",
  "КОРЕНЬ",
  "СЕТЬ",
  "ТОК",
  "КАДР",
  "СВЯЗЬ",
  "ИСТОЧНИК",
  "МОСТ",
  "МАСКА",
  "ИСКРА",
  "ЗЕРКАЛО",
  "ПУСТЫНЯ",
  "ШИФР",
  "ПЛАМЯ",
  "КОМЕТА",
  "ЛАБИРИНТ",
  "СИГНАЛ",
  "ПЕЧАТЬ",
  "УЗЕЛ",
  "СПУТНИК",
  "ОБЛАКО",
  "ГРАНЬ",
  "КОНТУР",
  "ОСКОЛОК",
  "ИМПУЛЬС",
  "АРХИВ",
  "ГОРИЗОНТ",
  "ВЕКТОР",
  "СПЕКТР",
  "ОРБИТА",
  "РЕЗОНАНС",
  "ПАРАДОКС",
  "МАТРИЦА",
  "ТРАЕКТОРИЯ",
  "КОДЕКС",
  "КОМПАС",
  "БАЛАНС",
  "РИТМ",
  "ФОКУС",
  "ЭХО",
  "ПУЛЬС",
  "ТОН",
  "ПОРТАЛ",
  "КАНАЛ",
  "ФИЛЬТР",
  "СЦЕНА",
  "СИМВОЛ",
  "ПОТОК",
  "ПРЕДЕЛ",
  "МОМЕНТ",
  "ОБРАЗ",
  "ЭНЕРГИЯ",
  "ЧАСТОТА",
  "СИСТЕМА",
  "МОДЕЛЬ",
  "КОНТАКТ",
  "РЕСУРС",
  "МАСШТАБ",
  "ТОЧКА",
  "ЛИНИЯ",
  "ФОРМУЛА",
  "СТРУКТУРА",
  "ПРОЦЕСС",
  "ШАБЛОН",
  "СХЕМА",
  "КОНТЕКСТ",
  "ФАКТОР",
  "ДИАЛОГ",
  "ГРАНИЦА",
  "ЦИКЛ",
  "ЯДРО",
  "МОДУЛЬ",
  "ПАРАМЕТР",
  "АЛГОРИТМ",
  "СЦЕНАРИЙ",
  "СМЫСЛ",
  "СВЯЗКА",
  "МЕХАНИЗМ",
  "КООРДИНАТА",
  "ПЕРСПЕКТИВА",
  "ИНТЕРВАЛ",
  "ПРОПОРЦИЯ",
  "ИЕРАРХИЯ",
  "КОНФИГУРАЦИЯ",
  "ТРАНСФОРМАЦИЯ",
  "ИНТЕГРАЦИЯ",
  "АБСТРАКЦИЯ",
  "РАВНОВЕСИЕ",
  "АРХИТЕКТУРА",
  "СИНХРОНИЗАЦИЯ",
  "АДАПТАЦИЯ",
  "ЭВОЛЮЦИЯ",
  "СТРАТЕГИЯ",
  "ЛОГИКА",
  "ГИПОТЕЗА",
  "АНАЛИЗ",
  "СИНТЕЗ",
  "ПРИОРИТЕТ",
  "ПОТЕНЦИАЛ",
  "СТАБИЛЬНОСТЬ",
  "ДИНАМИКА",
  "ИНЕРЦИЯ",
  "ГРАВИТАЦИЯ",
  "СИММЕТРИЯ",
  "ПРОЕКЦИЯ",
  "ИЗМЕРЕНИЕ",
  "ПЕРЕХОД",
  "ПОРЯДОК",
  "ПРИЧИНА",
  "СЛЕДСТВИЕ",
  "УСЛОВИЕ",
  "МЕТОД",
  "КРИТЕРИЙ",
  "ПРИНЦИП",
  "ТЕОРИЯ",
  "МАССА",
  "ФОРМА",
  "ГЛУБИНА",
  "ШТОРМ",
  "КРИСТАЛЛ",
  "МАГНИТ",
  "ВУЛКАН",
  "МАЯК",
  "КАНЬОН",
  "ТУМАН",
  "КАПЛЯ",
  "СПИРАЛЬ",
  "МОЛНИЯ",
  "КУПОЛ",
  "МАРШРУТ",
  "ПИКСЕЛЬ",
  "МОЗАИКА",
  "КОЛЬЦО",
  "МАЯТНИК",
  "ЛИНЗА",
  "ВИХРЬ",
  "РЕЛЬЕФ",
  "КАПСУЛА",
  "СФЕРА",
  "ПРИЗМА",
  "АТЛАС",
  "КОНТРАСТ",
  "ФРАГМЕНТ",
  "ПАНОРАМА",
  "ОПТИКА",
  "ИНДЕКС",
  "ДИАПАЗОН",
  "ТЕНДЕНЦИЯ",
  "ФАЗА",
  "РЕАКЦИЯ",
  "ИНТЕРФЕЙС",
  "КАТАЛОГ",
  "ПРОТОКОЛ",
  "СЕНСОР",
  "ИНДИКАТОР",
  "КЛАСТЕР",
  "РАКУРС",
  "ТЕКСТУРА",
  "СИЛУЭТ",
  "ГРАДИЕНТ",
  "МАРКЕР",
  "СЕКТОР",
  "КОЛЕБАНИЕ",
  "АМПЛИТУДА",
  "РАДИУС",
  "ДИАГРАММА",
  "ОРИЕНТИР"
 ],
 'en': [
  "DOG",
  "CAT",
  "SEA",
  "RAIN",
  "TIME",
  "WARMTH",
  "MEMORY",
  "LIGHT",
  "PATH",
  "SECRET",
  "SHADOW",
  "TRACE",
  "WAVE",
  "KEY",
  "ROOT",
  "NET",
  "CURRENT",
  "FRAME",
  "LINK",
  "SOURCE",
  "BRIDGE",
  "MASK",
  "SPARK",
  "MIRROR",
  "DESERT",
  "CODE",
  "FLAME",
  "COMET",
  "MAZE",
  "SIGNAL",
  "STAMP",
  "KNOT",
  "SATELLITE",
  "CLOUD",
  "EDGE",
  "OUTLINE",
  "SHARD",
  "IMPULSE",
  "ARCHIVE",
  "HORIZON",
  "VECTOR",
  "SPECTRUM",
  "ORBIT",
  "RESONANCE",
  "PARADOX",
  "MATRIX",
  "TRAJECTORY",
  "CODEX",
  "COMPASS",
  "BALANCE",
  "RHYTHM",
  "FOCUS",
  "ECHO",
  "PULSE",
  "TONE",
  "PORTAL",
  "CHANNEL",
  "FILTER",
  "STAGE",
  "SYMBOL",
  "FLOW",
  "LIMIT",
  "MOMENT",
  "IMAGE",
  "ENERGY",
  "FREQUENCY",
  "SYSTEM",
  "MODEL",
  "CONTACT",
  "RESOURCE",
  "SCALE",
  "POINT",
  "LINE",
  "FORMULA",
  "STRUCTURE",
  "PROCESS",
  "PATTERN",
  "SCHEME",
  "CONTEXT",
  "FACTOR",
  "DIALOGUE",
  "BOUNDARY",
  "CYCLE",
  "CORE",
  "MODULE",
  "PARAMETER",
  "ALGORITHM",
  "SCENARIO",
  "MEANING",
  "LINKAGE",
  "MECHANISM",
  "COORDINATE",
  "PERSPECTIVE",
  "INTERVAL",
  "PROPORTION",
  "HIERARCHY",
  "CONFIGURATION",
  "TRANSFORMATION",
  "INTEGRATION",
  "ABSTRACTION",
  "EQUILIBRIUM",
  "ARCHITECTURE",
  "SYNCHRONIZATION",
  "ADAPTATION",
  "EVOLUTION",
  "STRATEGY",
  "LOGIC",
  "HYPOTHESIS",
  "ANALYSIS",
  "SYNTHESIS",
  "PRIORITY",
  "POTENTIAL",
  "STABILITY",
  "DYNAMICS",
  "INERTIA",
  "GRAVITY",
  "SYMMETRY",
  "PROJECTION",
  "DIMENSION",
  "TRANSITION",
  "ORDER",
  "CAUSE",
  "EFFECT",
  "CONDITION",
  "METHOD",
  "CRITERION",
  "PRINCIPLE",
  "THEORY",
  "MASS",
  "FORM",
  "DEPTH",
  "STORM",
  "CRYSTAL",
  "MAGNET",
  "VOLCANO",
  "LIGHTHOUSE",
  "CANYON",
  "FOG",
  "DROP",
  "SPIRAL",
  "LIGHTNING",
  "DOME",
  "ROUTE",
  "PIXEL",
  "MOSAIC",
  "RING",
  "PENDULUM",
  "LENS",
  "VORTEX",
  "RELIEF",
  "CAPSULE",
  "SPHERE",
  "PRISM",
  "ATLAS",
  "CONTRAST",
  "FRAGMENT",
  "PANORAMA",
  "OPTICS",
  "INDEX",
  "RANGE",
  "TREND",
  "PHASE",
  "REACTION",
  "INTERFACE",
  "CATALOG",
  "PROTOCOL",
  "SENSOR",
  "INDICATOR",
  "CLUSTER",
  "ANGLE",
  "TEXTURE",
  "SILHOUETTE",
  "GRADIENT",
  "MARKER",
  "SECTOR",
  "OSCILLATION",
  "AMPLITUDE",
  "RADIUS",
  "DIAGRAM",
  "LANDMARK"
 ],
 'az': [
  "İT",
  "PİŞİK",
  "DƏNİZ",
  "YAĞIŞ",
  "ZAMAN",
  "İSTİ",
  "YADDAŞ",
  "İŞIQ",
  "YOL",
  "SİRR",
  "KÖLGƏ",
  "İZ",
  "DALĞA",
  "AÇAR",
  "KÖK",
  "ŞƏBƏKƏ",
  "CƏRƏYAN",
  "KADR",
  "ƏLAQƏ",
  "MƏNBƏ",
  "KÖRPÜ",
  "MASKA",
  "QILCIM",
  "GÜZGÜ",
  "SƏHRA",
  "ŞİFRƏ",
  "ALOV",
  "KOMETA",
  "LABİRİNT",
  "SİQNAL",
  "MÖHÜR",
  "DÜYÜN",
  "PEYK",
  "BULUD",
  "KƏNAR",
  "KONTUR",
  "QIRINTI",
  "İMPULS",
  "ARXİV",
  "ÜFÜQ",
  "VEKTOR",
  "SPEKTR",
  "ORBİT",
  "REZONANS",
  "PARADOKS",
  "MATRİSA",
  "TRAEKTORİYA",
  "KODEKS",
  "KOMPAS",
  "TARAZLIQ",
  "RİTM",
  "FOKUS",
  "SƏDA",
  "NƏBZ",
  "TON",
  "PORTAL",
  "KANAL",
  "FİLTR",
  "SƏHNƏ",
  "SİMVOL",
  "AXIN",
  "HƏDD",
  "AN",
  "TƏSVİR",
  "ENERJİ",
  "TEZLİK",
  "SİSTEM",
  "MODEL",
  "TƏMAS",
  "RESURS",
  "MİQYAS",
  "NÖQTƏ",
  "XƏTT",
  "FORMUL",
  "STRUKTUR",
  "PROSES",
  "NÜMUNƏ",
  "SXEM",
  "KONTEKST",
  "AMİL",
  "DİALOQ",
  "SƏRHƏD",
  "DÖVR",
  "NÜVƏ",
  "MODUL",
  "PARAMETR",
  "ALQORİTM",
  "SSENARİ",
  "MƏNA",
  "BAĞLANTI",
  "MEXANİZM",
  "KOORDİNAT",
  "PERSPEKTİV",
  "İNTERVAL",
  "NİSBƏT",
  "İYERARXİYA",
  "KONFİQURASİYA",
  "TRANSFORMASİYA",
  "İNTEQRASİYA",
  "ABSTRAKSİYA",
  "MÜVAZİNƏT",
  "MEMARLIQ",
  "SİNXRONLAŞMA",
  "UYĞUNLAŞMA",
  "TƏKAMÜL",
  "STRATEGİYA",
  "MƏNTİQ",
  "FƏRZİYYƏ",
  "TƏHLİL",
  "SİNTEZ",
  "PRİORİTET",
  "POTENSİAL",
  "SABİTLİK",
  "DİNAMİKA",
  "ƏTALƏT",
  "CAZİBƏ",
  "SİMMETRİYA",
  "PROYEKSİYA",
  "ÖLÇÜ",
  "KEÇİD",
  "QAYDA",
  "SƏBƏB",
  "NƏTİCƏ",
  "ŞƏRT",
  "METOD",
  "MEYAR",
  "PRİNSİP",
  "NƏZƏRİYYƏ",
  "KÜTLƏ",
  "FORMA",
  "DƏRİNLİK",
  "FIRTINA",
  "KRİSTAL",
  "MAQNİT",
  "VULKAN",
  "MAYAK",
  "KANYON",
  "DUMAN",
  "DAMCI",
  "SPİRAL",
  "ŞİMŞƏK",
  "GÜNBƏZ",
  "MARŞRUT",
  "PİKSEL",
  "MOZAİKA",
  "HALQA",
  "KƏFKİR",
  "LİNZA",
  "BURULĞAN",
  "RELYEF",
  "KAPSUL",
  "KÜRƏ",
  "PRİZMA",
  "ATLAS",
  "KONTRAST",
  "FRAQMENT",
  "PANORAMA",
  "OPTİKA",
  "İNDEKS",
  "DİAPAZON",
  "TENDENSİYA",
  "FAZA",
  "REAKSİYA",
  "İNTERFEYS",
  "KATALOQ",
  "PROTOKOL",
  "SENSOR",
  "İNDİKATOR",
  "KLASTER",
  "RAKURS",
  "TEKSTURA",
  "SİLUET",
  "QRADİYENT",
  "MARKER",
  "SEKTOR",
  "TİTRƏMƏ",
  "AMPLİTUDA",
  "RADİUS",
  "DİAQRAM",
  "ORİYENTİR"
 ]
}

HINTS={
'ru':{1:'Домашнее животное',11:'Она появляется рядом',21:'Соединяет два берега',31:'Её ставят на документ',41:'Направленная величина',51:'Повторяющийся рисунок'},
'en':{1:'loyal domestic animal',11:'object blocks light',21:'connects two sides',31:'put on a document',41:'directed quantity',51:'repeating pattern'},
'az':{1:'ən yaxın dostu',11:'İşığın qarşısı kəsiləndə',21:'İki sahili',31:'sənədə və ya kağıza',41:'istiqamətli kəmiyyət',51:'təkrarlanan ardıcıllığı'}
}
reports=[]

def auth_fragment():
    raw=urllib.parse.urlencode({'auth_date':str(int(time.time())),'user':json.dumps({'id':90000000,'first_name':'Test'}),'hash':'pw-ci-only'})
    return urllib.parse.urlencode({'tgWebAppData':raw,'tgWebAppVersion':'8.0','tgWebAppPlatform':'ios'})

def install_mock(ctx,account,completed,lang):
    def mock(route):
        req=route.request
        if req.method=='OPTIONS':
            route.fulfill(status=204,headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type,apikey','Access-Control-Allow-Methods':'POST,OPTIONS'});return
        body=json.loads(req.post_data or '{}')
        if '/functions/v1/challenge-game' in req.url:
            action=body.get('action','state');mode=body.get('mode');energy=account.setdefault('_challenge_energy',5)
            if action=='start' and mode=='limited' and energy>0:
                account['_challenge_energy']=energy-1
            ch={'energy':account['_challenge_energy'],'energy_max':5,'next_energy_at':None,'limited_best_score':0,'nohint_best_streak':0,'blitz_best_score':0,'blitz_best_streak':0,'server_now':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
            if action=='hint':
                cost={'letter':75,'remove':125,'text':200}[body['hintType']]
                if account['coins']<cost:
                    route.fulfill(status=402,content_type='application/json',body=json.dumps({'error':'insufficient_coins'}),headers={'Access-Control-Allow-Origin':'*'});return
                account['coins']-=cost
                route.fulfill(status=200,content_type='application/json',body=json.dumps({'challenge':ch,'coins':account['coins'],'cost':cost,'hintType':body['hintType']}),headers={'Access-Control-Allow-Origin':'*'});return
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'challenge':ch}),headers={'Access-Control-Allow-Origin':'*'});return
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
        elif action=='set_nickname':
            nick=body.get('nickname','');assert re.fullmatch(r'[A-Za-z0-9_]{3,16}',nick);account['game_nickname']=nick;account['nickname_changed']=True
        elif action=='friends':
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'friends':[{'photoword_id':'PW-FRIEND','first_name':'Friend','last_name':'','username':'friend','game_nickname':'FriendOne','completed_levels':7,'rewarded':False}],'invited':1,'rewarded':0,'total_reward':0}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='public_config':
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'config':{'ads_provider':'adsgram','adsgram_reward_block_id':None,'support_contact':'@PhotoWordBot'}}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='track_event':
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'ok':True}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='erase_account':
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'erased':True}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='create_invoice':
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'invoice_url':'https://t.me/$test','coins':10,'stars':15}),headers={'Access-Control-Allow-Origin':'*'});return
        if data is None:data={'player':account.copy()}
        route.fulfill(status=status,content_type='application/json',body=json.dumps(data),headers={'Access-Control-Allow-Origin':'*'})
    ctx.route('https://bqoraxewpcnmidvjlpuy.supabase.co/**',mock)

def relevant_errors(errors):
    return [e for e in errors if 'due to access control checks' not in e]

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
    expect(page.locator('#homeChapter1Title')).to_have_text('İsinmə');expect(page.locator('#homeChapter2Title')).to_have_text('Assosiasiyalar');expect(page.locator('[data-home-chapter="3"]')).to_be_visible();expect(page.locator('[data-home-chapter="4"]')).to_be_visible();expect(page.locator('[data-home-chapter="12"]')).to_be_attached();expect(page.locator('#homeChapterDots button')).to_have_count(12);expect(page.locator('#shopOffer')).to_contain_text('Daha çox sikkə');expect(page.locator('#logoWord')).to_have_text('1 SÖZ');page.locator('#chaptersNav').tap();expect(page.locator('#chapter1Label')).to_contain_text('1–20');expect(page.locator('#chapter2Label')).to_contain_text('21–50');expect(page.locator('#chapter2Select .chapter-cover-mark')).to_have_text('II');expect(page.locator('#chapter2Play')).to_have_class(re.compile('locked'));expect(page.locator('#chapter12Select')).to_be_attached();page.locator('#chaptersBack').tap()
    body=page.locator('body').inner_text()
    for leak in ['Больше монет','Главная','Задания','Рейтинг','Сегодня награда']: assert leak not in body,('AZ leak',leak)
    assert not relevant_errors(errors),errors;ctx.close()

    # Settings, full localization, themes, nickname, daily, friends, reset language gate.
    for language in ['ru','en','az']:
      ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
      ctx.add_init_script(f"localStorage.setItem('pw.language','{language}'); localStorage.setItem('pw.theme','game');")
      account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':5000,'xp':300,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None}
      completed=set(range(1,21));install_mock(ctx,account,completed,language);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      page.goto(BASE+'clean/#'+fragment,wait_until='domcontentloaded',timeout=45000)
      # Chapters: chapter 2 is unlocked after level 20 and uses a 30-level counter; chapter 3 is present.
      expect(page.locator('#homeChapter1')).to_be_visible();expect(page.locator('#homeChapter2')).to_be_visible();page.locator('#homeChapter1').scroll_into_view_if_needed();expect(page.locator('#homeChapter1Title')).to_be_visible();page.locator('#homeChapter2').scroll_into_view_if_needed();expect(page.locator('#homeChapter2Title')).to_be_visible();page.locator('#homeChapter1').scroll_into_view_if_needed();expect(page.locator('#homeChapter1Title')).to_be_visible()
      page.locator('#chaptersNav').tap();expect(page.locator('#chaptersScreen')).to_be_visible();expect(page.locator('#chapter1Label')).to_contain_text('1–20');expect(page.locator('#chapter2Label')).to_contain_text('21–50');expect(page.locator('#chapter2Done')).to_have_text('21');expect(page.locator('#chapter2Count')).to_contain_text('50');expect(page.locator('#chapter2Play')).not_to_have_class(re.compile('locked'));expect(page.locator('#chapter2Play')).to_have_attribute('href','./game.html?level=21');page.locator('#chaptersBack').tap()
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
      expect(page.locator('#openSupportChat')).to_be_visible();page.locator('[data-close="supportModal"]').tap()
      # Account deletion flow is present and requires explicit confirmation.
      page.locator('#settingsBtn').tap();page.locator('#eraseAccountBtn').tap();expect(page.locator('#eraseAccountModal')).to_be_visible();expect(page.locator('#confirmEraseAccount')).to_be_visible();page.locator('#cancelEraseAccount').tap()
      # Privacy and terms follow the selected language.
      legal=ctx.new_page();legal.goto(BASE+'clean/privacy.html?r='+RELEASE,wait_until='domcontentloaded');expected_priv={'ru':'Политика конфиденциальности','en':'Privacy Policy','az':'Məxfilik siyasəti'}[language];expect(legal.locator('#pt')).to_have_text(expected_priv);legal.goto(BASE+'clean/terms.html?r='+RELEASE,wait_until='domcontentloaded');expected_terms={'ru':'Пользовательское соглашение','en':'Terms of Use','az':'İstifadəçi razılaşması'}[language];expect(legal.locator('#tt')).to_have_text(expected_terms);body_legal=legal.locator('body').inner_text();assert 'will be added before public launch' not in body_legal;assert 'будет добавлен до публичного запуска' not in body_legal;legal.close()
      # Chapter-earned title appears after completing Chapter 1.
      expected_title={'ru':'Новичок','en':'Novice','az':'Yeni başlayan'}[language]
      expect(page.locator('#rankLabel')).to_contain_text(expected_title)
      page.locator('#profileBtn').tap();expect(page.locator('#profileTitle')).to_have_text(expected_title);page.locator('[data-close="profileModal"]').tap()
      # Nickname is one-time UI and becomes the displayed name.
      page.locator('#profileBtn').tap();page.locator('#nicknameBtn').tap();page.locator('#nicknameInput').fill('Player_77');page.locator('#saveNickname').tap();expect(page.locator('#name')).to_have_text('Player_77');page.locator('#profileBtn').tap();expect(page.locator('#nicknameBtn')).to_be_disabled()
      # Share-game control is available from the profile.
      expect(page.locator('#shareGameBtn')).to_be_visible();page.locator('[data-close="profileModal"]').tap()
      # Daily +5 updates balance, marks claimed and closes.
      before=int(page.locator('[data-coins]').first.inner_text());page.locator('#dailyRewardBtn').tap();page.locator('#claimDaily').tap();expect(page.locator('[data-coins]').first).to_have_text(str(before+5));expect(page.locator('#dailyModal')).to_be_hidden(timeout=2500)
      # High-reward daily tasks were removed from the product surface.
      expect(page.locator('#tasksBtn')).to_have_count(0);expect(page.locator('#tasksModal')).to_have_count(0)
      # Thematic mode is a prominent separate surface and unlocks after 10 main levels.
      expect(page.locator('#challengeModes')).to_be_visible();expect(page.locator('[data-challenge]')).to_have_count(3)
      page.locator('[data-challenge="blitz"]').tap();expect(page.locator('#challengeScreen')).to_be_visible();expect(page.locator('#challengeIntroTitle')).to_have_text({'ru':'Блиц','en':'Blitz','az':'Blits'}[language]);page.locator('#challengeStart').tap();expect(page.locator('#challengeHud')).to_be_visible();expect(page.locator('#challengePhotos .photo')).to_have_count(4);expect(page.locator('#blitzHints')).to_be_visible();expect(page.locator('#challengeCorrectPanel')).to_be_hidden();assert page.evaluate("window.PW_CHALLENGE_EXTRA.length")==200;coins_before=int(page.locator('[data-coins]').first.inner_text());page.locator('#blitzLetterHint').tap();expect(page.locator('#challengeSlots .slot.fixed')).to_have_count(1);expect(page.locator('[data-coins]').first).to_have_text(str(coins_before-75));page.locator('#challengeBack').tap();expect(page.locator('#home')).to_be_visible()
      page.locator('[data-challenge="nohint"]').tap();expect(page.locator('#challengeScreen')).to_be_visible();page.locator('#challengeStart').tap();expect(page.locator('#challengeHud')).to_be_visible();expect(page.locator('#hudValue2')).to_contain_text('🛡');page.locator('#challengeBack').tap()
      page.locator('[data-challenge="limited"]').tap();expect(page.locator('#challengeScreen')).to_be_visible();expect(page.locator('#challengeIntroStats')).to_contain_text('5');expect(page.locator('#energyRefill')).to_be_visible();expect(page.locator('[data-energy-pack]')).to_have_count(2);page.locator('#challengeStart').tap();expect(page.locator('#challengeHud')).to_be_visible();expect(page.locator('#hudValue3')).to_have_text('4/5');page.locator('#challengeBack').tap()
      expect(page.locator('#themesEntry')).to_be_visible();expect(page.locator('#themesEntryBadge')).to_be_visible();page.locator('#themesEntry').tap();expect(page.locator('#themesScreen')).to_be_visible();expect(page.locator('#themeCards .theme-card')).to_have_count(12);expect(page.locator('#themeCards .theme-card').first).to_be_enabled();page.locator('#themeCards .theme-card').first.tap();expect(page.locator('#themeDetailScreen')).to_be_visible();expect(page.locator('#themeLevelGrid button')).to_have_count(100);expect(page.locator('#themeLevelGrid button').nth(0)).to_be_enabled();expect(page.locator('#themeLevelGrid button').nth(20)).to_be_disabled();page.locator('#themeDetailBack').tap();page.locator('#themesBack').tap()
      # Friends use nickname and progress.
      page.locator('#friendsNav').tap();expect(page.locator('#friendsList')).to_contain_text('FriendOne');expect(page.locator('#friendsList')).to_contain_text('7 / 10');page.locator('[data-close="friendsModal"]').tap()
      # Rating and shop surfaces are reachable/localized; native Stars invoice UI is Telegram-controlled.
      page.locator('#ratingNav').tap();expect(page.locator('#leaderboard')).to_contain_text('Player_77');page.locator('#ratingBack').tap();page.locator('#shopNav').tap();expect(page.locator('#shopModal')).to_be_visible();expect(page.locator('#watchAd')).to_be_disabled();expect(page.locator('[data-pack="c10"]')).to_be_enabled();expect(page.locator('[data-energy-store-pack]')).to_have_count(2);expect(page.locator('[data-energy-store-pack="e1"]')).to_be_enabled();expect(page.locator('[data-energy-store-pack="e5"]')).to_be_enabled();page.locator('[data-close="shopModal"]').tap()
      # Reset requires double confirmation and then requires language again.
      page.locator('#settingsBtn').tap();page.locator('#resetProgressBtn').tap();page.locator('#confirmReset').tap();page.locator('#confirmReset').tap();expect(page.locator('#languageModal')).to_be_visible(timeout=3000);expect(page.locator('#languageClose')).to_be_hidden()
      assert not relevant_errors(errors),errors;ctx.close()

    # Thematic Sport game keeps separate progress, shows real coins, and has no settings/progress widgets in the top-right header.
    for language in ['ru','en','az']:
      ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
      ctx.add_init_script(f"localStorage.setItem('pw.language','{language}'); localStorage.setItem('pw.theme','game');")
      account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':4321,'xp':300,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None}
      completed=set(range(1,21));install_mock(ctx,account,completed,language);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      page.goto(BASE+'clean/theme-game.html?theme=sport&level=1#'+fragment,wait_until='domcontentloaded',timeout=45000)
      expect(page.locator('[data-coins]')).to_have_text('4321');expect(page.locator('#themeSettingsBtn')).to_have_count(0);expect(page.locator('#themeProgress')).to_have_count(0)
      sport_answer={'ru':'ГОЛ','en':'GOAL','az':'QOL'}[language];tap_word(page,sport_answer);expect(page.locator('#successPanel')).to_be_visible();assert page.evaluate("JSON.parse(localStorage.getItem('pw.themeProgress.sport')).includes(1)")
      page.evaluate("localStorage.setItem('pw.themeProgress.sport',JSON.stringify(Array.from({length:20},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=sport&level=21#'+fragment,wait_until='domcontentloaded',timeout=45000)
      answer21={'ru':'БОКС','en':'BOXING','az':'BOKS'}[language];tap_word(page,answer21);expect(page.locator('#successPanel')).to_be_visible()
      page.evaluate("localStorage.setItem('pw.themeProgress.sport',JSON.stringify(Array.from({length:49},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=sport&level=50#'+fragment,wait_until='domcontentloaded',timeout=45000)
      answer50={'ru':'СЕКУНДОМЕР','en':'STOPWATCH','az':'SANİYƏÖLÇƏN'}[language];tap_word(page,answer50);expect(page.locator('#successPanel')).to_be_visible()
      page.evaluate("localStorage.setItem('pw.themeProgress.sport',JSON.stringify(Array.from({length:50},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=sport&level=51#'+fragment,wait_until='domcontentloaded',timeout=45000)
      answer51={'ru':'ФУТБОЛ','en':'FOOTBALL','az':'FUTBOL'}[language];tap_word(page,answer51);expect(page.locator('#successPanel')).to_be_visible()
      page.evaluate("localStorage.setItem('pw.themeProgress.sport',JSON.stringify(Array.from({length:74},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=sport&level=75#'+fragment,wait_until='domcontentloaded',timeout=45000)
      answer75={'ru':'КОРТ','en':'COURT','az':'KORT'}[language];tap_word(page,answer75);expect(page.locator('#successPanel')).to_be_visible()
      page.evaluate("localStorage.setItem('pw.themeProgress.sport',JSON.stringify(Array.from({length:99},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=sport&level=100#'+fragment,wait_until='domcontentloaded',timeout=45000)
      answer100={'ru':'ОЛИМПИАДА','en':'OLYMPICS','az':'OLİMPİADA'}[language];tap_word(page,answer100);expect(page.locator('#successPanel')).to_be_visible();expect(page.locator('#nextLevel')).to_have_attribute('href','./index.html')
      assert not relevant_errors(errors),errors;ctx.close()


    # Thematic Art has its own 100-level bank and separate progress from Sport.
    for language in ['ru','en','az']:
      ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
      ctx.add_init_script(f"localStorage.setItem('pw.language','{language}'); localStorage.setItem('pw.theme','game');")
      account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':4321,'xp':300,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None}
      completed=set(range(1,21));install_mock(ctx,account,completed,language);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      page.goto(BASE+'clean/theme-game.html?theme=art&level=1#'+fragment,wait_until='domcontentloaded',timeout=45000)
      expect(page.locator('#themeGameTitle')).to_contain_text({'ru':'Искусство','en':'Art','az':'İncəsənət'}[language])
      art_answer={'ru':'КИСТЬ','en':'BRUSH','az':'FIRÇA'}[language];tap_word(page,art_answer);expect(page.locator('#successPanel')).to_be_visible();assert page.evaluate("JSON.parse(localStorage.getItem('pw.themeProgress.art')).includes(1)");assert page.evaluate("localStorage.getItem('pw.themeProgress.sport')") is None
      page.evaluate("localStorage.setItem('pw.themeProgress.art',JSON.stringify(Array.from({length:99},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=art&level=100#'+fragment,wait_until='domcontentloaded',timeout=45000)
      art100={'ru':'ТВОРЧЕСТВО','en':'CREATIVITY','az':'YARADICILIQ'}[language];tap_word(page,art100);expect(page.locator('#successPanel')).to_be_visible();expect(page.locator('#nextLevel')).to_have_attribute('href','./index.html')
      assert not relevant_errors(errors),errors;ctx.close()

    # Representative main-game browser checks. Loading game.js also validates every published answer/pool in RU/EN/AZ.
    sample_levels=[1,20,21,50,51,60,61,90,91,100,101,131,132,150,180]
    for language in ['ru','en','az']:
      ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
      ctx.add_init_script(f"localStorage.setItem('pw.language','{language}'); localStorage.setItem('pw.theme','game');")
      account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':10000,'xp':0,'completed_levels':0,'current_level':181,'rank':1,'daily_streak':0,'last_daily_reward':None}
      completed=set();install_mock(ctx,account,completed,language);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      for level in sample_levels:
        page.goto(BASE+f'clean/game.html?level={level}#'+fragment,wait_until='domcontentloaded',timeout=45000)
        expect(page.locator('#levelTitle')).to_contain_text(str(level));expect(page.locator('#shuffle')).to_be_visible()
        answer=ANSWERS[language][level-1]
        available=page.locator('#letters .letter').all_inner_texts()
        for ch in set(answer): assert available.count(ch)>=answer.count(ch),(language,level,ch,available)
        if level==21:
          page.locator('#textHint').tap();expect(page.locator('#hintValue')).to_contain_text(HINTS[language][21])
        if level==51:
          page.locator('#letterHint').tap();expect(page.locator('#slots .fixed')).to_have_count(1)
        if level==60:
          page.locator('#removeHint').tap();expect(page.locator('#letters .removed')).to_have_count(3)
        tap_word(page,answer);expect(page.locator('#successPanel')).to_be_visible(timeout=5000);expect(page.locator('#successTitle')).to_contain_text(str(level))
        if level==20:
          expect(page.locator('#successChapter')).to_be_visible();expect(page.locator('#successChapter')).to_contain_text({'ru':'Новичок','en':'Novice','az':'Yeni başlayan'}[language]);expect(page.locator('#nextLevel')).to_have_attribute('href','./game.html?level=21')
        elif level==50:
          expect(page.locator('#successChapter')).to_be_visible();expect(page.locator('#nextLevel')).to_have_attribute('href','./game.html?level=51')
        elif level==90:
          expect(page.locator('#successChapter')).to_be_visible();expect(page.locator('#nextLevel')).to_have_attribute('href','./game.html?level=91')
        elif level==100:
          expect(page.locator('#nextLevel')).to_have_attribute('href','./game.html?level=101')
        elif level==131:
          expect(page.locator('#successChapter')).to_be_visible();expect(page.locator('#successChapter')).to_contain_text({'ru':'Опытный','en':'Experienced','az':'Təcrübəli'}[language]);expect(page.locator('#nextLevel')).to_have_attribute('href','./game.html?level=132')
        elif level==180:
          expect(page.locator('#successChapter')).to_be_visible();expect(page.locator('#successChapter')).to_contain_text({'ru':'Эксперт','en':'Expert','az':'Ekspert'}[language]);expect(page.locator('#nextLevel')).to_have_attribute('href','./index.html')
      assert account['completed_levels']==len(sample_levels) and account['xp']==15*len(sample_levels)
      page.screenshot(path=str(OUT/f'{engine}-{language}-level180.png'),full_page=True)
      assert not relevant_errors(errors),errors
      report={'engine':engine,'language':language,'levels':'1-180 validated / boundary samples played','checks':['runtime validation of all 180 answer pools','chapter 1 sample','chapter 2 boundaries 21 and 50','completed chapter 3 through 90','chapter 4 complete 91-131','chapter 5 complete 132-180','transitions at 20, 50, 90, 131 and completion at 180','localized text hint','letter hint','remove hint','level 100 continues to 101, level 131 opens 132, and level 180 returns home'],'result':'PASS'}
      reports.append(report);print(json.dumps(report,ensure_ascii=False),flush=True);ctx.close()
    browser.close()

(OUT/'results.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2))
