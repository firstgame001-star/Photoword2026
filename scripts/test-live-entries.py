"""Exercise the real published PhotoWord Mini App UI. Supabase calls are mocked; no real account data is changed."""
import json, time, urllib.parse, urllib.request, re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE='https://firstgame001-star.github.io/Photoword2026/'
RELEASE='20260930-r106'
OUT=Path('test-results'); OUT.mkdir(exist_ok=True)

for attempt in range(48):
    try:
        with urllib.request.urlopen(BASE+'clean/release.json?verify='+str(time.time()),timeout=20) as r:
            body=r.read().decode()
            if r.status==200 and RELEASE in body: break
    except Exception: pass
    time.sleep(5)
else: raise AssertionError('Public Pages never reached '+RELEASE)

for path in ['clean/','clean/game.html','clean/theme-game.html','clean/core.js','clean/home.js','clean/game.js','clean/main-levels-8-9.js','clean/theme-game.js','clean/challenge-bank-extra.js','clean/challenge.js','clean/ui.css','clean/privacy.html','clean/terms.html']:
    with urllib.request.urlopen(BASE+path+'?r='+RELEASE,timeout=20) as r: assert r.status==200,path
    print('LIVE HTTP 200:',path,flush=True)

ANSWERS={
 "ru": [
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
  "ОРИЕНТИР",
  "ПЛАНЕТА",
  "АЙСБЕРГ",
  "ВОДОПАД",
  "ДЕЛЬТА",
  "ОАЗИС",
  "ЛАВИНА",
  "ТОРНАДО",
  "ЦУНАМИ",
  "КРАТЕР",
  "ПЕЩЕРА",
  "КОМПЬЮТЕР",
  "МИКРОЧИП",
  "РОБОТ",
  "АНТЕННА",
  "РАДАР",
  "ЛАЗЕР",
  "БАТАРЕЯ",
  "МОТОР",
  "ТУРБИНА",
  "ГЕНЕРАТОР",
  "МОЛЕКУЛА",
  "АТОМ",
  "КЛЕТКА",
  "ДНК",
  "ФЕРМЕНТ",
  "НЕЙРОН",
  "ВИРУС",
  "ИММУНИТЕТ",
  "ТЕЛЕСКОП",
  "МИКРОСКОП",
  "МЕРИДИАН",
  "ЭКВАТОР",
  "ПОЛЮС",
  "КЛИМАТ",
  "МУССОН",
  "СЕЙСМОГРАФ",
  "БАРОМЕТР",
  "ТЕРМОМЕТР",
  "КАЛЕЙДОСКОП",
  "ПРОТОН",
  "ЭЛЕКТРОН",
  "ФОТОН",
  "КВАНТ",
  "ВАКУУМ",
  "ПЛАЗМА",
  "ИЗОТОП",
  "ОРГАНИЗМ",
  "ЭКОСИСТЕМА",
  "БИОСФЕРА",
  "ГАЛАКТИКА",
  "ГОРОД",
  "СТОЛИЦА",
  "КРЕПОСТЬ",
  "БАШНЯ",
  "АРКА",
  "КОЛОННА",
  "ФОНТАН",
  "ПАМЯТНИК",
  "ПИРАМИДА",
  "АМФИТЕАТР",
  "БИБЛИОТЕКА",
  "УНИВЕРСИТЕТ",
  "БОЛЬНИЦА",
  "ТЕАТР",
  "СТАДИОН",
  "ФАБРИКА",
  "ЗАВОД",
  "ГАВАНЬ",
  "РЫНОК",
  "БАНК",
  "СУД",
  "ПАРЛАМЕНТ",
  "МЭРИЯ",
  "ПЛОЩАДЬ",
  "УЛИЦА",
  "ПЕРЕКРЕСТОК",
  "СВЕТОФОР",
  "ТРОТУАР",
  "ПАРК",
  "БУЛЬВАР",
  "НАБЕРЕЖНАЯ",
  "ВОКЗАЛ",
  "АЭРОПОРТ",
  "СТАНЦИЯ",
  "ТЕРМИНАЛ",
  "ЭСКАЛАТОР",
  "ЛИФТ",
  "ТУННЕЛЬ",
  "ПЛОТИНА",
  "АКВЕДУК",
  "ШОССЕ",
  "ПЕРЕУЛОК",
  "РАЙОН",
  "КВАРТАЛ",
  "ПРИГОРОД",
  "МЕГАПОЛИС",
  "НАСЕЛЕНИЕ",
  "ОБЩЕСТВО",
  "КУЛЬТУРА",
  "ЦИВИЛИЗАЦИЯ"
 ],
 "en": [
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
  "LANDMARK",
  "PLANET",
  "ICEBERG",
  "WATERFALL",
  "DELTA",
  "OASIS",
  "AVALANCHE",
  "TORNADO",
  "TSUNAMI",
  "CRATER",
  "CAVE",
  "COMPUTER",
  "MICROCHIP",
  "ROBOT",
  "ANTENNA",
  "RADAR",
  "LASER",
  "BATTERY",
  "ENGINE",
  "TURBINE",
  "GENERATOR",
  "MOLECULE",
  "ATOM",
  "CELL",
  "DNA",
  "ENZYME",
  "NEURON",
  "VIRUS",
  "IMMUNITY",
  "TELESCOPE",
  "MICROSCOPE",
  "MERIDIAN",
  "EQUATOR",
  "POLE",
  "CLIMATE",
  "MONSOON",
  "SEISMOGRAPH",
  "BAROMETER",
  "THERMOMETER",
  "KALEIDOSCOPE",
  "PROTON",
  "ELECTRON",
  "PHOTON",
  "QUANTUM",
  "VACUUM",
  "PLASMA",
  "ISOTOPE",
  "ORGANISM",
  "ECOSYSTEM",
  "BIOSPHERE",
  "GALAXY",
  "CITY",
  "CAPITAL",
  "FORTRESS",
  "TOWER",
  "ARCH",
  "COLUMN",
  "FOUNTAIN",
  "MONUMENT",
  "PYRAMID",
  "AMPHITHEATER",
  "LIBRARY",
  "UNIVERSITY",
  "HOSPITAL",
  "THEATER",
  "STADIUM",
  "FACTORY",
  "PLANT",
  "HARBOR",
  "MARKET",
  "BANK",
  "COURT",
  "PARLIAMENT",
  "CITYHALL",
  "SQUARE",
  "STREET",
  "CROSSROAD",
  "TRAFFICLIGHT",
  "SIDEWALK",
  "PARK",
  "BOULEVARD",
  "EMBANKMENT",
  "TERMINUS",
  "AIRPORT",
  "STATION",
  "TERMINAL",
  "ESCALATOR",
  "ELEVATOR",
  "TUNNEL",
  "DAM",
  "AQUEDUCT",
  "HIGHWAY",
  "ALLEY",
  "DISTRICT",
  "BLOCK",
  "SUBURB",
  "MEGACITY",
  "POPULATION",
  "SOCIETY",
  "CULTURE",
  "CIVILIZATION"
 ],
 "az": [
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
  "ORİYENTİR",
  "PLANET",
  "AYSBERQ",
  "ŞƏLALƏ",
  "DELTA",
  "VAHA",
  "UÇQUN",
  "TORNADO",
  "SUNAMİ",
  "KRATER",
  "MAĞARA",
  "KOMPÜTER",
  "MİKROÇİP",
  "ROBOT",
  "ANTENA",
  "RADAR",
  "LAZER",
  "BATAREYA",
  "MÜHƏRRİK",
  "TURBİN",
  "GENERATOR",
  "MOLEKUL",
  "ATOM",
  "HÜCEYRƏ",
  "DNT",
  "FERMENT",
  "NEYRON",
  "VİRUS",
  "İMMUNİTET",
  "TELESKOP",
  "MİKROSKOP",
  "MERİDİAN",
  "EKVATOR",
  "QÜTB",
  "İQLİM",
  "MUSSON",
  "SEYSMOQRAF",
  "BAROMETR",
  "TERMOMETR",
  "KALEYDOSKOP",
  "PROTON",
  "ELEKTRON",
  "FOTON",
  "KVANT",
  "VAKUUM",
  "PLAZMA",
  "İZOTOP",
  "ORQANİZM",
  "EKOSİSTEM",
  "BİOSFER",
  "QALAKTİKA",
  "ŞƏHƏR",
  "PAYTAXT",
  "QALA",
  "QÜLLƏ",
  "TAĞ",
  "SÜTUN",
  "FƏVVARƏ",
  "ABİDƏ",
  "PİRAMİDA",
  "AMFİTEATR",
  "KİTABXANA",
  "UNİVERSİTET",
  "XƏSTƏXANA",
  "TEATR",
  "STADİON",
  "FABRİK",
  "ZAVOD",
  "LİMAN",
  "BAZAR",
  "BANK",
  "MƏHKƏMƏ",
  "PARLAMENT",
  "BƏLƏDİYYƏ",
  "MEYDAN",
  "KÜÇƏ",
  "YOLAYRICI",
  "SVETOFOR",
  "SƏKİ",
  "PARK",
  "BULVAR",
  "SAHİLBOYU",
  "VAĞZAL",
  "AEROPORT",
  "STANSİYA",
  "TERMİNAL",
  "ESKALATOR",
  "LİFT",
  "TUNEL",
  "BƏND",
  "AKVEDUK",
  "ŞOSSE",
  "DÖNGƏ",
  "RAYON",
  "MƏHƏLLƏ",
  "ŞƏHƏRYANI",
  "MEQAPOLİS",
  "ƏHALİ",
  "CƏMİYYƏT",
  "MƏDƏNİYYƏT",
  "SİVİLİZASİYA"
 ]
}
extra_main_source=Path('clean/main-levels-8-9.js').read_text(encoding='utf-8')
extra_start=extra_main_source.index('[')
EXTRA_MAIN=json.JSONDecoder().raw_decode(extra_main_source[extra_start:])[0]
assert len(EXTRA_MAIN)==100 and EXTRA_MAIN[0]['id']==281 and EXTRA_MAIN[-1]['id']==380
for _lang,_answers in ANSWERS.items():
    _answers.extend([row[_lang]['answer'] for row in EXTRA_MAIN])
    assert len(_answers)==380,(_lang,len(_answers))
    assert len(set(_answers))==380,('duplicate-main-answer',_lang)

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
            rewards=account.setdefault('_challenge_rewards_today',{'limited':0,'nohint':0,'blitz':0})
            if action=='start':
                if mode=='limited' and energy>0: account['_challenge_energy']=energy-1
                account['_challenge_run_id']='00000000-0000-0000-0000-000000000099'
            ch={'energy':account['_challenge_energy'],'energy_max':5,'next_energy_at':None,'limited_best_score':0,'nohint_best_streak':0,'blitz_best_score':0,'blitz_best_streak':0,'server_now':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'rewarded_runs_today':rewards.copy(),'reward_limit':3}
            if action=='start': ch['run_id']=account['_challenge_run_id']
            if action=='hint':
                cost={'letter':75,'remove':125,'text':200}[body['hintType']]
                if account['coins']<cost:
                    route.fulfill(status=402,content_type='application/json',body=json.dumps({'error':'insufficient_coins'}),headers={'Access-Control-Allow-Origin':'*'});return
                account['coins']-=cost
                route.fulfill(status=200,content_type='application/json',body=json.dumps({'challenge':ch,'coins':account['coins'],'cost':cost,'hintType':body['hintType']}),headers={'Access-Control-Allow-Origin':'*'});return
            if action=='finish':
                score=int(body.get('score') or 0);streak=int(body.get('streak') or 0);coins=xp=0
                if rewards.get(mode,0)<3:
                    metric=score if mode in ('limited','blitz') else streak
                    if mode=='limited':
                        coins,xp=(15,10) if metric>=10 else (10,6) if metric>=7 else (5,3) if metric>=4 else (0,0)
                    elif mode=='nohint':
                        coins,xp=(15,10) if metric>=10 else (10,6) if metric>=6 else (5,3) if metric>=3 else (0,0)
                    else:
                        coins,xp=(15,10) if metric>=12 else (10,6) if metric>=8 else (5,3) if metric>=5 else (0,0)
                if coins or xp:
                    rewards[mode]=rewards.get(mode,0)+1;account['coins']+=coins;account['xp']+=xp
                ch['rewarded_runs_today']=rewards.copy()
                reward={'reward_coins':coins,'reward_xp':xp,'rewarded_runs_today':rewards.get(mode,0),'reward_limit':3}
                route.fulfill(status=200,content_type='application/json',body=json.dumps({'challenge':ch,'reward':reward,'coins':account['coins'],'xp':account['xp']}),headers={'Access-Control-Allow-Origin':'*'});return
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
        elif action=='profile_stats':
            stats=account.get('_profile_stats') or {'theme_levels_completed':0,'themes_completed':0,'themes_total':6,'theme_counts':{'sport':0,'art':0,'professions':0,'travel':0,'science':0,'technology':0},'challenge':{'limited_best_score':7,'nohint_best_streak':4,'blitz_best_score':9,'blitz_best_streak':5,'runs_total':12,'reward_coins':35,'reward_xp':22}}
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'stats':stats}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='theme_progress':
            theme_map={k:[] for k in ['sport','art','professions','travel','science','technology']}
            for item in account.setdefault('_theme_completed',[]):
                try:
                    theme,level=item.split(':',1);level=int(level)
                    if theme in theme_map and 1<=level<=100: theme_map[theme].append(level)
                except Exception: pass
            for theme in theme_map: theme_map[theme]=sorted(set(theme_map[theme]))
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'theme_progress':theme_map}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='theme_hint':
            cost={'letter':50,'remove':100,'text':150}[body['hintType']]
            if account['coins']<cost: status=402;data={'error':'insufficient_coins'}
            else: account['coins']-=cost
        elif action=='theme_complete':
            theme=str(body['themeId']);level=int(body['levelId']);key=theme+':'+str(level)
            theme_done=account.setdefault('_theme_completed',[])
            rewarded=key not in theme_done
            if rewarded:
                theme_done.append(key);account['coins']+=15;account['xp']+=10;account['rank']=1
            data={'player':account.copy(),'theme_rewarded':rewarded}
        elif action=='reset_progress':
            completed.clear();account['_theme_completed']=[];account.update(xp=0,completed_levels=0,current_level=1,rank=0)
        elif action=='claim_daily':
            account['coins']+=5;account['daily_streak']=max(1,account.get('daily_streak',0)+1);account['last_daily_reward']=time.strftime('%Y-%m-%d')
        elif action=='set_nickname':
            nick=body.get('nickname','');assert re.fullmatch(r'[A-Za-z0-9_]{3,16}',nick);account['game_nickname']=nick;account['nickname_changed']=True
        elif action=='notification_state':
            n=account.setdefault('_notifications',{'enabled':bool(account.get('notifications_enabled',False)),'daily_reward':True,'energy_full':True,'chapter_unlocked':True,'timezone_offset_minutes':0,'language':account.get('notification_language',lang)})
            n['enabled']=bool(account.get('notifications_enabled',False));n['language']=account.get('notification_language',lang)
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'notifications':n}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='update_notifications':
            account['notifications_enabled']=bool(body.get('enabled'));account['notification_language']=body.get('language',lang)
            n={'enabled':account['notifications_enabled'],'daily_reward':body.get('dailyReward',True),'energy_full':body.get('energyFull',True),'chapter_unlocked':body.get('chapterUnlocked',True),'timezone_offset_minutes':body.get('timezoneOffsetMinutes',0),'language':account['notification_language']}
            account['_notifications']=n
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'notifications':n}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='test_notification':
            assert account.get('notifications_enabled') is True
            account['_notification_tests']=account.get('_notification_tests',0)+1
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'ok':True}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='enable_notifications':
            account['notifications_enabled']=True;account['notification_language']=body.get('language',lang);account['_notifications']={'enabled':True,'daily_reward':True,'energy_full':True,'chapter_unlocked':True,'timezone_offset_minutes':body.get('timezoneOffsetMinutes',0),'language':account['notification_language']}
        elif action=='friends':
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'friends':[{'photoword_id':'PW-FRIEND','first_name':'Friend','last_name':'','username':'friend','game_nickname':'FriendOne','completed_levels':7,'rewarded':False}],'invited':1,'rewarded':0,'total_reward':0}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='shop_status':
            history=account.setdefault('_shop_history',[])
            shop={'coins':account['coins'],'energy':account.get('_challenge_energy',5),'energy_max':5,'next_energy_at':None,'ads':{'configured':False,'reward_coins':5,'claimed_today':0,'daily_limit':10},'history':history}
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'shop':shop}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='public_config':
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'config':{'ads_provider':'adsgram','adsgram_reward_block_id':None,'support_contact':'@PhotoWordBot'}}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='track_event':
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'ok':True}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='ad_prepare':
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'nonce':'00000000-0000-0000-0000-000000000070','block_id':'audit-block','reward':5}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='ad_claim':
            account['coins']+=5;account.setdefault('_shop_history',[]).insert(0,{'type':'ad','coins':5,'stars':0,'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())})
        elif action=='erase_account':
            account['_erased']=True;route.fulfill(status=200,content_type='application/json',body=json.dumps({'erased':True}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='create_invoice':
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'invoice_url':'https://t.me/$test','coins':10,'stars':15}),headers={'Access-Control-Allow-Origin':'*'});return
        elif action=='create_energy_invoice':
            pack=body.get('pack');assert pack in ('e1','e5')
            if account.get('_challenge_energy',5)>=5:
                route.fulfill(status=409,content_type='application/json',body=json.dumps({'error':'energy_full'}),headers={'Access-Control-Allow-Origin':'*'});return
            route.fulfill(status=200,content_type='application/json',body=json.dumps({'invoice_url':'https://t.me/$energy','pack':pack,'energy':1 if pack=='e1' else 5,'stars':15 if pack=='e1' else 50}),headers={'Access-Control-Allow-Origin':'*'});return
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

def tap_challenge_word(page,word):
    for pos,ch in enumerate(word):
        if page.locator('#challengeSlots .slot').nth(pos).inner_text(): continue
        loc=page.locator('#challengeLetters .letter:not([disabled])').filter(has_text=re.compile('^'+re.escape(ch)+'$')).first
        expect(loc).to_be_visible(timeout=3000)
        loc.tap()


def parse_json_array_after(text,token):
    start=text.index('[',text.index(token))
    return json.JSONDecoder().raw_decode(text[start:])[0]

challenge_source=Path('clean/challenge.js').read_text(encoding='utf-8')
challenge_extra_source=Path('clean/challenge-bank-extra.js').read_text(encoding='utf-8')
CHALLENGE_BANK=parse_json_array_after(challenge_source,'const Q=')+parse_json_array_after(challenge_extra_source,'window.PW_CHALLENGE_EXTRA=')
assert len(CHALLENGE_BANK)==400
CHALLENGE_BY_PHOTOS={tuple(item['p']):item for item in CHALLENGE_BANK}
assert len(CHALLENGE_BY_PHOTOS)==400

def current_challenge_answer(page,language):
    # The mode start is asynchronous. Wait until the visible clue set and its
    # generated letter pool belong to the same puzzle before typing.
    deadline=time.time()+3
    last_clues=()
    while time.time()<deadline:
        clues=tuple(page.locator('#challengePhotos .photo').all_inner_texts())
        last_clues=clues
        item=CHALLENGE_BY_PHOTOS.get(clues)
        if item:
            answer=item[language]
            letters=page.locator('#challengeLetters .letter').all_inner_texts()
            if all(letters.count(ch)>=answer.count(ch) for ch in set(answer)):
                return answer
        page.wait_for_timeout(50)
    raise AssertionError(('challenge puzzle did not stabilize',language,last_clues))


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
    page.locator('#settingsBtn').tap();expect(page.locator('#supportBtn b')).to_have_text('Dəstək');page.locator('[data-close="settingsModal"]').tap()
    expect(page.locator('#homeChapter1Title')).to_have_text('İsinmə');expect(page.locator('#homeChapter2Title')).to_have_text('Assosiasiyalar');expect(page.locator('[data-home-chapter="3"]')).to_be_visible();expect(page.locator('[data-home-chapter="4"]')).to_be_visible();expect(page.locator('[data-home-chapter="12"]')).to_be_attached();expect(page.locator('#homeChapterDots button')).to_have_count(12);expect(page.locator('#shopOffer')).to_contain_text('Daha çox sikkə');expect(page.locator('#logoWord')).to_have_text('1 SÖZ');page.locator('#chaptersNav').tap();expect(page.locator('#chapter1Label')).to_contain_text('0–20');expect(page.locator('#chapter2Label')).to_contain_text('21–50');expect(page.locator('#chapter2Select .chapter-cover-mark')).to_have_text('II');expect(page.locator('#chapter2Play')).to_have_class(re.compile('locked'));expect(page.locator('#chapter8Label')).to_contain_text('281–330');expect(page.locator('#chapter9Label')).to_contain_text('331–380');expect(page.locator('#chapter12Select')).to_be_attached();page.locator('#chaptersBack').tap()
    body=page.locator('body').inner_text()
    for leak in ['Больше монет','Главная','Задания','Рейтинг','Сегодня награда']: assert leak not in body,('AZ leak',leak)
    assert not relevant_errors(errors),errors;ctx.close()

    # Guest mode must localize every chapter before a Telegram profile is loaded.
    ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
    ctx.add_init_script("localStorage.setItem('pw.language','az');")
    page=ctx.new_page();page.goto(BASE+'clean/',wait_until='domcontentloaded',timeout=45000)
    for n in range(1,10):
      expect(page.locator(f'#homeChapter{n}Label')).to_contain_text(f'Fəsil {n}')
      expect(page.locator(f'#homeChapter{n}Count')).to_have_text('səviyyə')
      expect(page.locator(f'#homeChapterDots button[data-dot="{n}"]')).to_have_attribute('aria-label',f'Fəsil {n}')
      if n>1: expect(page.locator(f'#homeChapter{n}LockNote')).to_contain_text('səviyyəni keç')
    page.locator('#chaptersNav').tap()
    for n in range(1,10): expect(page.locator(f'#chapter{n}Count')).to_have_text('səviyyə')
    page.locator('#chaptersBack').tap();page.locator('#settingsBtn').tap();page.locator('#languageBtn').tap();page.locator('[data-language="en"]').tap()
    for n in range(1,10):
      expect(page.locator(f'#homeChapter{n}Label')).to_contain_text(f'Chapter {n}')
      expect(page.locator(f'#homeChapter{n}Count')).to_have_text('levels')
    ctx.close()

    # Settings, full localization, themes, nickname, daily, friends, reset language gate.
    for language in ['ru','en','az']:
      ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
      ctx.add_init_script(f"localStorage.setItem('pw.language','{language}'); localStorage.setItem('pw.theme','game');")
      account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':5000,'xp':300,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None}
      completed=set(range(1,21));install_mock(ctx,account,completed,language);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      page.goto(BASE+'clean/#'+fragment,wait_until='domcontentloaded',timeout=45000)
      page.evaluate("""() => {
        window.__pwNative={links:[],invoices:[],closed:false};
        window.Telegram=window.Telegram||{};window.Telegram.WebApp=window.Telegram.WebApp||{};
        const set=(k,v)=>{try{Object.defineProperty(window.Telegram.WebApp,k,{configurable:true,writable:true,value:v})}catch{window.Telegram.WebApp[k]=v}};
        set('openTelegramLink',url=>window.__pwNative.links.push(url));
        set('openInvoice',(url,cb)=>{window.__pwNative.invoices.push(url);cb('cancelled')});
        set('requestWriteAccess',cb=>cb(true));
        set('close',()=>{window.__pwNative.closed=true});
      }""")
      # Chapters: chapter 2 is unlocked after level 20 and uses a 30-level counter; chapter 3 is present.
      expect(page.locator('#homeChapter1')).to_be_visible();expect(page.locator('#homeChapter2')).to_be_visible();page.locator('#homeChapter1').scroll_into_view_if_needed();expect(page.locator('#homeChapter1Title')).to_be_visible();page.locator('#homeChapter2').scroll_into_view_if_needed();expect(page.locator('#homeChapter2Title')).to_be_visible();page.locator('#homeChapter1').scroll_into_view_if_needed();expect(page.locator('#homeChapter1Title')).to_be_visible()
      page.locator('#chaptersNav').tap();expect(page.locator('#chaptersScreen')).to_be_visible();expect(page.locator('#chapter1Done')).to_have_text('0–20');expect(page.locator('#chapter2Done')).to_have_text('21–50');expect(page.locator('#chapter3Done')).to_have_text('51–90');expect(page.locator('#chapter4Done')).to_have_text('91–130');expect(page.locator('#chapter5Done')).to_have_text('131–180');expect(page.locator('#chapter1Label')).to_contain_text('0–20');expect(page.locator('#chapter2Label')).to_contain_text('21–50');expect(page.locator('#chapter2Done')).to_have_text('21–50');expect(page.locator('#chapter2Count')).to_have_text({'ru':'уровней','en':'levels','az':'səviyyə'}[language]);expect(page.locator('#chapter2Play')).not_to_have_class(re.compile('locked'));expect(page.locator('#chapter2Play')).to_have_attribute('href','./game.html?level=21');expect(page.locator('#chapter3Done')).to_have_text('51–90');expect(page.locator('#chapter3Count')).to_have_text({'ru':'уровней','en':'levels','az':'səviyyə'}[language]);page.locator('#chaptersBack').tap()
      # Every visual theme must apply and persist.
      for theme in ['game','night','light','neon','gold']:
        page.locator('#settingsBtn').tap();page.locator('#themeBtn').tap();expect(page.locator('#themeModal')).to_be_visible();page.locator(f'button[data-theme="{theme}"]').tap();assert page.evaluate("document.documentElement.dataset.theme")==theme;assert page.evaluate("localStorage.getItem('pw.theme')")==theme
      # Sound, haptics and music preferences persist.
      page.locator('#settingsBtn').tap();page.locator('#soundToggle').uncheck();page.locator('#hapticToggle').uncheck();page.locator('#musicToggle').check();prefs=page.evaluate("JSON.parse(localStorage.getItem('photoword-prefs'))");assert prefs['sound'] is False and prefs['haptic'] is False and prefs['music'] is True;page.locator('#musicToggle').uncheck();page.locator('[data-close="settingsModal"]').tap()
      # Language can be changed from Settings and changed back without losing the game.
      other={'ru':'en','en':'az','az':'ru'}[language];page.locator('#settingsBtn').tap();page.locator('#languageBtn').tap();page.locator(f'[data-language="{other}"]').tap();assert page.evaluate("localStorage.getItem('pw.language')")==other;expect(page.locator('#status')).to_be_hidden(timeout=3500);page.locator('#settingsBtn').tap();page.locator('#languageBtn').tap();page.locator(f'[data-language="{language}"]').tap();assert page.evaluate("localStorage.getItem('pw.language')")==language;expect(page.locator('#status')).to_be_hidden(timeout=3500)
      # Notification preferences: master permission, individual switches and test delivery.
      page.locator('#settingsBtn').tap();expect(page.locator('#notificationsBtn')).to_be_visible();page.locator('#notificationsBtn').tap();expect(page.locator('#notificationsModal')).to_be_visible();expect(page.locator('#notificationDaily')).to_be_checked();expect(page.locator('#notificationEnergy')).to_be_checked();expect(page.locator('#notificationChapter')).to_be_checked();page.locator('#notificationsMaster').check();page.locator('#notificationEnergy').uncheck();page.locator('#saveNotifications').tap();expect(page.locator('#notificationsMaster')).to_be_checked();expect(page.locator('#notificationEnergy')).not_to_be_checked();expect(page.locator('#testNotification')).to_be_enabled();assert page.evaluate("localStorage.getItem('pw.writeAccess')")=='1';page.locator('#testNotification').tap();assert account.get('_notification_tests')==1;page.locator('[data-close="notificationsModal"]').tap();page.locator('#settingsBtn').tap();expect(page.locator('#notificationsState')).to_have_text({'ru':'Включены','en':'On','az':'Aktivdir'}[language]);page.locator('[data-close="settingsModal"]').tap()
      # Rules and support are localized.
      page.locator('#settingsBtn').tap();page.locator('#rulesBtn').tap();expect(page.locator('#rulesModal')).to_be_visible();assert len(page.locator('#rulesBody').inner_text())>100;rules_text=page.locator('#rulesBody').inner_text();
      if language=='az': assert '7-ci fəsil “Sivilizasiya”' in rules_text and '5–12-ci fəsillər artıq' not in rules_text
      page.locator('[data-close="rulesModal"]').tap()
      page.locator('#settingsBtn').tap();page.locator('#supportBtn').tap();expect(page.locator('#supportModal')).to_be_visible()
      if language=='az': expect(page.locator('#supportTitle')).to_have_text('Dəstək')
      if language=='en': expect(page.locator('#supportTitle')).to_have_text('Support')
      expect(page.locator('#openSupportChat')).to_be_visible();page.locator('#openSupportChat').tap();assert 'start=support' in page.evaluate("window.__pwNative.links.at(-1)");page.locator('[data-close="supportModal"]').tap()
      # Account deletion flow is present and requires explicit confirmation.
      page.locator('#settingsBtn').tap();page.locator('#eraseAccountBtn').tap();expect(page.locator('#eraseAccountModal')).to_be_visible();expect(page.locator('#confirmEraseAccount')).to_be_visible();page.locator('#cancelEraseAccount').tap()
      # Privacy and terms follow the selected language.
      legal=ctx.new_page();legal.goto(BASE+'clean/privacy.html?r='+RELEASE,wait_until='domcontentloaded');expected_priv={'ru':'Политика конфиденциальности','en':'Privacy Policy','az':'Məxfilik siyasəti'}[language];expect(legal.locator('#pt')).to_have_text(expected_priv);legal.goto(BASE+'clean/terms.html?r='+RELEASE,wait_until='domcontentloaded');expected_terms={'ru':'Пользовательское соглашение','en':'Terms of Use','az':'İstifadəçi razılaşması'}[language];expect(legal.locator('#tt')).to_have_text(expected_terms);body_legal=legal.locator('body').inner_text();assert 'will be added before public launch' not in body_legal;assert 'будет добавлен до публичного запуска' not in body_legal;legal.close()
      # Chapter-earned title appears after completing Chapter 1.
      expected_title={'ru':'Новичок','en':'Novice','az':'Yeni başlayan'}[language]
      expect(page.locator('#rankLabel')).to_contain_text(expected_title)
      page.locator('#profileBtn').tap();expect(page.locator('#profileTitle')).to_have_text(expected_title);expect(page.locator('#profileChapters')).to_have_text('1/9');expect(page.locator('#profileThemeDone')).to_have_text('0/600');expect(page.locator('#profileThemesComplete')).to_have_text('0/6');expect(page.locator('#profileLimitedBest')).to_have_text('7/10');expect(page.locator('#profileNoHintBest')).to_have_text('4');expect(page.locator('#profileBlitzBest')).to_have_text('9');expect(page.locator('#profileBlitzStreak')).to_have_text('5');expect(page.locator('#profileStatsStatus')).to_contain_text('12');page.locator('[data-close="profileModal"]').tap()
      # Nickname is one-time UI and becomes the displayed name.
      page.locator('#profileBtn').tap();page.locator('#nicknameBtn').tap();page.locator('#nicknameInput').fill('Player_77');page.locator('#saveNickname').tap();expect(page.locator('#name')).to_have_text('Player_77');page.locator('#profileBtn').tap();expect(page.locator('#nicknameBtn')).to_be_disabled()
      # Share-game control opens Telegram share URL.
      expect(page.locator('#shareGameBtn')).to_be_visible();page.locator('#shareGameBtn').tap();assert 't.me/share/url' in page.evaluate("window.__pwNative.links.at(-1)");page.locator('[data-close="profileModal"]').tap()
      # Daily +5 updates balance, marks claimed and closes.
      before=int(page.locator('[data-coins]').first.inner_text());page.locator('#dailyRewardBtn').tap();page.locator('#claimDaily').tap();expect(page.locator('[data-coins]').first).to_have_text(str(before+5));expect(page.locator('#dailyModal')).to_be_hidden(timeout=2500);expect(page.locator('#status')).to_be_hidden(timeout=3500)
      # High-reward daily tasks were removed from the product surface.
      expect(page.locator('#tasksBtn')).to_have_count(0);expect(page.locator('#tasksModal')).to_have_count(0)
      # Thematic mode is a prominent separate surface and unlocks after 10 main levels.
      expect(page.locator('#challengeModes')).to_be_visible();expect(page.locator('[data-challenge]')).to_have_count(3)
      page.locator('[data-challenge="blitz"]').tap();expect(page.locator('#challengeScreen')).to_be_visible();expect(page.locator('#challengeIntroTitle')).to_have_text({'ru':'Блиц','en':'Blitz','az':'Blits'}[language]);page.locator('#challengeStart').tap();expect(page.locator('#challengeHud')).to_be_visible();expect(page.locator('#challengePhotos .photo')).to_have_count(4);expect(page.locator('#blitzHints')).to_be_visible();expect(page.locator('#challengeCorrectPanel')).to_be_hidden();assert page.evaluate("window.PW_CHALLENGE_EXTRA.length")==200;coins_before=int(page.locator('[data-coins]').first.inner_text());page.locator('#blitzLetterHint').tap();expect(page.locator('#challengeSlots .slot.fixed')).to_have_count(1);expect(page.locator('[data-coins]').first).to_have_text(str(coins_before-75));challenge_answer=current_challenge_answer(page,language);tap_challenge_word(page,challenge_answer);expect(page.locator('#hudValue2')).to_have_text('1',timeout=3000);page.locator('#challengeBack').tap();expect(page.locator('#home')).to_be_visible()
      page.locator('[data-challenge="nohint"]').tap();expect(page.locator('#challengeScreen')).to_be_visible();page.locator('#challengeStart').tap();expect(page.locator('#challengeHud')).to_be_visible();expect(page.locator('#hudValue2')).to_contain_text('🛡');challenge_answer=current_challenge_answer(page,language);tap_challenge_word(page,challenge_answer);expect(page.locator('#challengeCorrectPanel')).to_be_visible(timeout=3000);expect(page.locator('#challengeCorrectWord')).to_have_text(challenge_answer);page.locator('#challengeCorrectNext').tap();expect(page.locator('#challengeCorrectPanel')).to_be_hidden();page.locator('#challengeBack').tap()
      page.locator('[data-challenge="limited"]').tap();expect(page.locator('#challengeScreen')).to_be_visible();expect(page.locator('#challengeIntroStats')).to_contain_text('5');expect(page.locator('#challengeIntroStats')).to_contain_text('0/3');expect(page.locator('#energyRefill')).to_be_visible();expect(page.locator('[data-energy-pack]')).to_have_count(2);page.locator('#challengeStart').tap();expect(page.locator('#challengeHud')).to_be_visible();expect(page.locator('#hudValue3')).to_have_text('4/5');challenge_answer=current_challenge_answer(page,language);tap_challenge_word(page,challenge_answer);expect(page.locator('#challengeCorrectPanel')).to_be_visible(timeout=3000);expect(page.locator('#challengeCorrectWord')).to_have_text(challenge_answer);page.locator('#challengeCorrectNext').tap();expect(page.locator('#challengeCorrectPanel')).to_be_hidden();page.locator('#challengeBack').tap()
      expect(page.locator('#themesEntry')).to_be_visible();expect(page.locator('#themesEntryBadge')).to_be_visible();page.locator('#themesEntry').tap();expect(page.locator('#themesScreen')).to_be_visible();expect(page.locator('#themeCards .theme-card')).to_have_count(12);expect(page.locator('#themeCards .theme-card').first).to_be_enabled();expect(page.locator('#themeCards .theme-card').nth(2)).to_be_enabled();expect(page.locator('#themeCards .theme-card').nth(3)).to_be_enabled();expect(page.locator('#themeCards .theme-card').nth(4)).to_be_enabled();expect(page.locator('#themeCards .theme-card').nth(5)).to_be_enabled();page.locator('#themeCards .theme-card').first.tap();expect(page.locator('#themeDetailScreen')).to_be_visible();expect(page.locator('#themeLevelGrid button')).to_have_count(100);expect(page.locator('#themeLevelGrid button').nth(0)).to_be_enabled();expect(page.locator('#themeLevelGrid button').nth(20)).to_be_disabled();page.locator('#themeDetailBack').tap();page.locator('#themesBack').tap()
      # Friends use nickname and progress.
      page.locator('#friendsNav').tap();expect(page.locator('#friendsList')).to_contain_text('FriendOne');expect(page.locator('#friendsList')).to_contain_text('7 / 10');page.locator('[data-close="friendsModal"]').tap()
      # Rating, Stars invoices, energy purchase route and rewarded-ad claim are reachable.
      page.locator('#ratingNav').tap();expect(page.locator('#leaderboard')).to_contain_text('Player_77');expect(page.locator('#leaderboard')).to_contain_text(expected_title);expect(page.locator('#leaderboard')).to_contain_text('20');page.locator('#ratingBack').tap();page.locator('#shopNav').tap();expect(page.locator('#shopModal')).to_be_visible();expect(page.locator('#shopBalance')).to_have_text(str(account['coins']));expect(page.locator('#shopEnergyValue')).to_contain_text(str(account.get('_challenge_energy',5))+'/5');expect(page.locator('#shopAdsValue')).to_contain_text('0/10');expect(page.locator('#shopHistoryTitle')).to_be_visible();expect(page.locator('#watchAd')).to_be_disabled();expect(page.locator('#watchAd')).to_have_text({'ru':'НЕДОСТУПНО','en':'UNAVAILABLE','az':'MÖVCUD DEYİL'}[language]);expect(page.locator('[data-pack="c10"]')).to_be_enabled();expect(page.locator('[data-energy-store-pack]')).to_have_count(2);expect(page.locator('[data-energy-store-pack="e1"]')).to_be_enabled()
      page.locator('[data-pack="c10"]').tap();expect(page.locator('[data-pack="c10"]')).to_be_enabled();assert '$test' in page.evaluate("window.__pwNative.invoices.at(-1)")
      page.locator('[data-energy-store-pack="e1"]').tap();expect(page.locator('[data-energy-store-pack="e1"]')).to_be_enabled();assert '$energy' in page.evaluate("window.__pwNative.invoices.at(-1)")
      page.evaluate("""() => { window.Adsgram={init:()=>({show:async()=>({done:true})})}; document.getElementById('watchAd').disabled=false }""")
      ad_before=int(page.locator('[data-coins]').first.inner_text());page.locator('#watchAd').tap();expect(page.locator('[data-coins]').first).to_have_text(str(ad_before+5));expect(page.locator('#shopHistory')).to_contain_text('+5')
      page.locator('[data-close="shopModal"]').tap()
      # Reset requires double confirmation and then requires language again.
      page.locator('#settingsBtn').tap();page.locator('#resetProgressBtn').tap();page.locator('#confirmReset').tap();page.locator('#confirmReset').tap();expect(page.locator('#languageModal')).to_be_visible(timeout=3000);expect(page.locator('#languageClose')).to_be_hidden()
      assert not relevant_errors(errors),errors;ctx.close()

    # Confirm destructive account deletion end-to-end in the mocked backend.
    ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
    ctx.add_init_script("localStorage.setItem('pw.language','ru'); localStorage.setItem('pw.theme','game');")
    erase_account={'photoword_id':'PW-ERASE-TEST','first_name':'Erase','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':250,'xp':0,'completed_levels':0,'current_level':1,'rank':0,'daily_streak':0,'last_daily_reward':None}
    install_mock(ctx,erase_account,set(),'ru');page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'clean/#'+fragment,wait_until='domcontentloaded',timeout=45000)
    page.evaluate("""() => { window.Telegram=window.Telegram||{};window.Telegram.WebApp=window.Telegram.WebApp||{};try{Object.defineProperty(window.Telegram.WebApp,'close',{configurable:true,value:()=>{window.__pwClosed=true}})}catch{} }""")
    page.locator('#settingsBtn').tap();page.locator('#eraseAccountBtn').tap();expect(page.locator('#eraseAccountModal')).to_be_visible();page.locator('#confirmEraseAccount').tap();page.locator('#confirmEraseAccount').tap();expect(page.locator('#eraseAccountModal')).to_be_hidden();assert erase_account.get('_erased') is True;assert page.evaluate("localStorage.getItem('pw.language')") is None
    assert not relevant_errors(errors),errors;ctx.close()

    # Thematic Sport game keeps separate progress, shows real coins, and has no settings/progress widgets in the top-right header.
    for language in ['ru','en','az']:
      ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
      ctx.add_init_script(f"localStorage.setItem('pw.language','{language}'); localStorage.setItem('pw.theme','game');")
      account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':4321,'xp':300,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None}
      completed=set(range(1,21));install_mock(ctx,account,completed,language);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      page.goto(BASE+'clean/theme-game.html?theme=sport&level=1#'+fragment,wait_until='domcontentloaded',timeout=45000)
      expect(page.locator('[data-coins]')).to_have_text('4321');expect(page.locator('#themeSettingsBtn')).to_have_count(0);expect(page.locator('#themeProgress')).to_have_count(0)
      expect(page.locator('#letterHint')).to_contain_text('50');expect(page.locator('#removeHint')).to_contain_text('100');expect(page.locator('#textHintLabel')).to_contain_text('150')
      page.locator('#letterHint').tap();expect(page.locator('[data-coins]')).to_have_text('4271');expect(page.locator('#slots .fixed')).to_have_count(1)
      page.locator('#removeHint').tap();expect(page.locator('[data-coins]')).to_have_text('4171')
      page.locator('#textHint').tap();expect(page.locator('[data-coins]')).to_have_text('4021');expect(page.locator('#hintValue')).not_to_have_text({'ru':'Нажми, чтобы открыть','en':'Tap to reveal','az':'Açmaq üçün toxun'}[language])
      sport_answer={'ru':'ГОЛ','en':'GOAL','az':'QOL'}[language];tap_word(page,sport_answer);expect(page.locator('#successPanel')).to_be_visible();expect(page.locator('[data-coins]')).to_have_text('4036');expect(page.locator('#successReward')).to_contain_text('+15');assert account['xp']==310;assert page.evaluate("JSON.parse(localStorage.getItem('pw.themeProgress.sport')).includes(1)")
      page.goto(BASE+'clean/theme-game.html?theme=sport&level=1#'+fragment,wait_until='domcontentloaded',timeout=45000);tap_word(page,sport_answer);expect(page.locator('#successPanel')).to_be_visible();expect(page.locator('[data-coins]')).to_have_text('4036');assert account['xp']==310
      account['_theme_completed']=[f'sport:{i}' for i in range(1,21)];page.evaluate("localStorage.setItem('pw.themeProgress.sport',JSON.stringify(Array.from({length:20},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=sport&level=21#'+fragment,wait_until='domcontentloaded',timeout=45000)
      answer21={'ru':'БОКС','en':'BOXING','az':'BOKS'}[language];tap_word(page,answer21);expect(page.locator('#successPanel')).to_be_visible()
      account['_theme_completed']=[f'sport:{i}' for i in range(1,50)];page.evaluate("localStorage.setItem('pw.themeProgress.sport',JSON.stringify(Array.from({length:49},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=sport&level=50#'+fragment,wait_until='domcontentloaded',timeout=45000)
      answer50={'ru':'СЕКУНДОМЕР','en':'STOPWATCH','az':'SANİYƏÖLÇƏN'}[language];tap_word(page,answer50);expect(page.locator('#successPanel')).to_be_visible()
      account['_theme_completed']=[f'sport:{i}' for i in range(1,51)];page.evaluate("localStorage.setItem('pw.themeProgress.sport',JSON.stringify(Array.from({length:50},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=sport&level=51#'+fragment,wait_until='domcontentloaded',timeout=45000)
      answer51={'ru':'ФУТБОЛ','en':'FOOTBALL','az':'FUTBOL'}[language];tap_word(page,answer51);expect(page.locator('#successPanel')).to_be_visible()
      account['_theme_completed']=[f'sport:{i}' for i in range(1,75)];page.evaluate("localStorage.setItem('pw.themeProgress.sport',JSON.stringify(Array.from({length:74},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=sport&level=75#'+fragment,wait_until='domcontentloaded',timeout=45000)
      answer75={'ru':'КОРТ','en':'COURT','az':'KORT'}[language];tap_word(page,answer75);expect(page.locator('#successPanel')).to_be_visible()
      account['_theme_completed']=[f'sport:{i}' for i in range(1,100)];page.evaluate("localStorage.setItem('pw.themeProgress.sport',JSON.stringify(Array.from({length:99},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=sport&level=100#'+fragment,wait_until='domcontentloaded',timeout=45000)
      answer100={'ru':'ОЛИМПИАДА','en':'OLYMPICS','az':'OLİMPİADA'}[language];tap_word(page,answer100);expect(page.locator('#successPanel')).to_be_visible();expect(page.locator('#nextLevel')).to_have_attribute('href','./index.html')
      assert not relevant_errors(errors),errors;ctx.close()


    # Cross-device thematic progress sync: no local cache, server progress unlocks the next level.
    ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
    ctx.add_init_script("localStorage.setItem('pw.language','ru'); localStorage.setItem('pw.theme','game');")
    account={'photoword_id':'PW-SYNC','first_name':'Sync','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':500,'xp':300,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None,'_theme_completed':[f'sport:{i}' for i in range(1,21)]}
    install_mock(ctx,account,set(range(1,21)),'ru');page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'clean/theme-game.html?theme=sport&level=21#'+fragment,wait_until='domcontentloaded',timeout=45000)
    expect(page.locator('#levelTitle')).to_contain_text('21');expect(page.locator('#letters .letter:not([disabled])').first).to_be_visible()
    assert page.evaluate("JSON.parse(localStorage.getItem('pw.themeProgress.sport')).length")==20
    assert not relevant_errors(errors),errors;ctx.close()

    # Thematic hints refuse to apply when the player cannot afford them.
    ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
    ctx.add_init_script("localStorage.setItem('pw.language','ru'); localStorage.setItem('pw.theme','game');")
    account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':40,'xp':0,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None}
    install_mock(ctx,account,set(range(1,21)),'ru');page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'clean/theme-game.html?theme=sport&level=1#'+fragment,wait_until='domcontentloaded',timeout=45000)
    page.locator('#letterHint').tap();expect(page.locator('[data-coins]')).to_have_text('40');expect(page.locator('#slots .fixed')).to_have_count(0);assert account['coins']==40
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
      account['_theme_completed']=[f'art:{i}' for i in range(1,100)];page.evaluate("localStorage.setItem('pw.themeProgress.art',JSON.stringify(Array.from({length:99},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=art&level=100#'+fragment,wait_until='domcontentloaded',timeout=45000)
      art100={'ru':'ТВОРЧЕСТВО','en':'CREATIVITY','az':'YARADICILIQ'}[language];tap_word(page,art100);expect(page.locator('#successPanel')).to_be_visible();expect(page.locator('#nextLevel')).to_have_attribute('href','./index.html')
      assert not relevant_errors(errors),errors;ctx.close()

    # Thematic Professions has its own 100-level bank and separate progress.
    for language in ['ru','en','az']:
      ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
      ctx.add_init_script(f"localStorage.setItem('pw.language','{language}'); localStorage.setItem('pw.theme','game');")
      account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':4321,'xp':300,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None}
      completed=set(range(1,21));install_mock(ctx,account,completed,language);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      page.goto(BASE+'clean/theme-game.html?theme=professions&level=1#'+fragment,wait_until='domcontentloaded',timeout=45000)
      expect(page.locator('#themeGameTitle')).to_contain_text({'ru':'Профессии','en':'Professions','az':'Peşələr'}[language])
      prof_answer={'ru':'ВРАЧ','en':'DOCTOR','az':'HƏKİM'}[language];tap_word(page,prof_answer);expect(page.locator('#successPanel')).to_be_visible()
      assert page.evaluate("JSON.parse(localStorage.getItem('pw.themeProgress.professions')).includes(1)")
      assert page.evaluate("localStorage.getItem('pw.themeProgress.sport')") is None
      assert page.evaluate("localStorage.getItem('pw.themeProgress.art')") is None
      account['_theme_completed']=[f'professions:{i}' for i in range(1,100)];page.evaluate("localStorage.setItem('pw.themeProgress.professions',JSON.stringify(Array.from({length:99},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=professions&level=100#'+fragment,wait_until='domcontentloaded',timeout=45000)
      prof100={'ru':'ШТУКАТУР','en':'PLASTERER','az':'SUVAQÇI'}[language];tap_word(page,prof100);expect(page.locator('#successPanel')).to_be_visible();expect(page.locator('#nextLevel')).to_have_attribute('href','./index.html')
      assert not relevant_errors(errors),errors;ctx.close()

    # Thematic Travel has its own 100-level bank and separate progress.
    for language in ['ru','en','az']:
      ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
      ctx.add_init_script(f"localStorage.setItem('pw.language','{language}'); localStorage.setItem('pw.theme','game');")
      account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':4321,'xp':300,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None}
      completed=set(range(1,21));install_mock(ctx,account,completed,language);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      page.goto(BASE+'clean/theme-game.html?theme=travel&level=1#'+fragment,wait_until='domcontentloaded',timeout=45000)
      expect(page.locator('#themeGameTitle')).to_contain_text({'ru':'Путешествия','en':'Travel','az':'Səyahət'}[language])
      travel_answer={'ru':'ПАСПОРТ','en':'PASSPORT','az':'PASPORT'}[language];tap_word(page,travel_answer);expect(page.locator('#successPanel')).to_be_visible()
      assert page.evaluate("JSON.parse(localStorage.getItem('pw.themeProgress.travel')).includes(1)")
      account['_theme_completed']=[f'travel:{i}' for i in range(1,100)];page.evaluate("localStorage.setItem('pw.themeProgress.travel',JSON.stringify(Array.from({length:99},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=travel&level=100#'+fragment,wait_until='domcontentloaded',timeout=45000)
      travel100={'ru':'ПУТЕШЕСТВИЕ','en':'TRAVEL','az':'SƏYAHƏT'}[language];tap_word(page,travel100);expect(page.locator('#successPanel')).to_be_visible();expect(page.locator('#nextLevel')).to_have_attribute('href','./index.html')
      assert not relevant_errors(errors),errors;ctx.close()

    # Thematic Science has its own 100-level bank and separate progress.
    for language in ['ru','en','az']:
      ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
      ctx.add_init_script(f"localStorage.setItem('pw.language','{language}'); localStorage.setItem('pw.theme','game');")
      account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':4321,'xp':300,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None}
      completed=set(range(1,21));install_mock(ctx,account,completed,language);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      page.goto(BASE+'clean/theme-game.html?theme=science&level=1#'+fragment,wait_until='domcontentloaded',timeout=45000)
      expect(page.locator('#themeGameTitle')).to_contain_text({'ru':'Наука','en':'Science','az':'Elm'}[language])
      science_answer={'ru':'НАУКА','en':'SCIENCE','az':'ELM'}[language];tap_word(page,science_answer);expect(page.locator('#successPanel')).to_be_visible()
      assert page.evaluate("JSON.parse(localStorage.getItem('pw.themeProgress.science')).includes(1)")
      account['_theme_completed']=[f'science:{i}' for i in range(1,100)];page.evaluate("localStorage.setItem('pw.themeProgress.science',JSON.stringify(Array.from({length:99},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=science&level=100#'+fragment,wait_until='domcontentloaded',timeout=45000)
      science100={'ru':'ОТКРЫТИЕ','en':'DISCOVERY','az':'KƏŞF'}[language];tap_word(page,science100);expect(page.locator('#successPanel')).to_be_visible();expect(page.locator('#nextLevel')).to_have_attribute('href','./index.html')
      assert not relevant_errors(errors),errors;ctx.close()

    # Thematic Technology has its own 100-level bank and separate progress.
    for language in ['ru','en','az']:
      ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
      ctx.add_init_script(f"localStorage.setItem('pw.language','{language}'); localStorage.setItem('pw.theme','game');")
      account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':4321,'xp':300,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None}
      completed=set(range(1,21));install_mock(ctx,account,completed,language);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      page.goto(BASE+'clean/theme-game.html?theme=technology&level=1#'+fragment,wait_until='domcontentloaded',timeout=45000)
      expect(page.locator('#themeGameTitle')).to_contain_text({'ru':'Технологии','en':'Technology','az':'Texnologiya'}[language])
      technology_answer={'ru':'ТЕХНОЛОГИЯ','en':'TECHNOLOGY','az':'TEXNOLOGİYA'}[language];tap_word(page,technology_answer);expect(page.locator('#successPanel')).to_be_visible()
      assert page.evaluate("JSON.parse(localStorage.getItem('pw.themeProgress.technology')).includes(1)")
      account['_theme_completed']=[f'technology:{i}' for i in range(1,88)];page.evaluate("localStorage.setItem('pw.themeProgress.technology',JSON.stringify(Array.from({length:87},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=technology&level=88#'+fragment,wait_until='domcontentloaded',timeout=45000)
      long_answer={'ru':'КИБЕРБЕЗОПАСНОСТЬ','en':'CYBERSECURITY','az':'KİBERTƏHLÜKƏSİZLİK'}[language]
      slots_box=page.locator('#slots').bounding_box();assert slots_box and slots_box['x']>=0 and slots_box['x']+slots_box['width']<=391,(language,slots_box)
      tap_word(page,long_answer);expect(page.locator('#successPanel')).to_be_visible()
      account['_theme_completed']=[f'technology:{i}' for i in range(1,100)];page.evaluate("localStorage.setItem('pw.themeProgress.technology',JSON.stringify(Array.from({length:99},(_,i)=>i+1)))")
      page.goto(BASE+'clean/theme-game.html?theme=technology&level=100#'+fragment,wait_until='domcontentloaded',timeout=45000)
      technology100={'ru':'ИННОВАЦИЯ','en':'INNOVATION','az':'İNNOVASİYA'}[language];tap_word(page,technology100);expect(page.locator('#successPanel')).to_be_visible();expect(page.locator('#nextLevel')).to_have_attribute('href','./index.html')
      assert not relevant_errors(errors),errors;ctx.close()

    # Representative main-game browser checks. Loading game.js also validates every published answer/pool in RU/EN/AZ.
    sample_levels=[1,20,21,50,51,60,61,90,91,100,101,130,131,150,180,181,200,230,231,250,280,281,300,330,331,350,380]
    for language in ['ru','en','az']:
      ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
      ctx.add_init_script(f"localStorage.setItem('pw.language','{language}'); localStorage.setItem('pw.theme','game');")
      account={'photoword_id':'PW-TESTONLY','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':10000,'xp':0,'completed_levels':0,'current_level':381,'rank':1,'daily_streak':0,'last_daily_reward':None}
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
        elif level==130:
          expect(page.locator('#successChapter')).to_be_visible();expect(page.locator('#successChapter')).to_contain_text({'ru':'Опытный','en':'Experienced','az':'Təcrübəli'}[language]);expect(page.locator('#nextLevel')).to_have_attribute('href','./game.html?level=131')
        elif level==180:
          expect(page.locator('#successChapter')).to_be_visible();expect(page.locator('#successChapter')).to_contain_text({'ru':'Эксперт','en':'Expert','az':'Ekspert'}[language]);expect(page.locator('#nextLevel')).to_have_attribute('href','./game.html?level=181')
        elif level==230:
          expect(page.locator('#successChapter')).to_be_visible();expect(page.locator('#successChapter')).to_contain_text({'ru':'Профессионал','en':'Professional','az':'Peşəkar'}[language]);expect(page.locator('#nextLevel')).to_have_attribute('href','./game.html?level=231')
        elif level==280:
          expect(page.locator('#successChapter')).to_be_visible();expect(page.locator('#successChapter')).to_contain_text({'ru':'Мастер','en':'Master','az':'Usta'}[language]);expect(page.locator('#nextLevel')).to_have_attribute('href','./game.html?level=281')
        elif level==330:
          expect(page.locator('#successChapter')).to_be_visible();expect(page.locator('#successChapter')).to_contain_text({'ru':'Виртуоз','en':'Virtuoso','az':'Virtuoz'}[language]);expect(page.locator('#nextLevel')).to_have_attribute('href','./game.html?level=331')
        elif level==380:
          expect(page.locator('#successChapter')).to_be_visible();expect(page.locator('#successChapter')).to_contain_text({'ru':'Легенда','en':'Legend','az':'Əfsanə'}[language]);expect(page.locator('#nextLevel')).to_have_attribute('href','./index.html')
      assert account['completed_levels']==len(sample_levels) and account['xp']==15*len(sample_levels)
      page.screenshot(path=str(OUT/f'{engine}-{language}-level380.png'),full_page=True)
      assert not relevant_errors(errors),errors
      report={'engine':engine,'language':language,'levels':'1-380 validated / boundary samples played','checks':['runtime validation of all 380 answer pools','chapter 1 sample','chapter 2 boundaries 21 and 50','completed chapter 3 through 90','chapter 4 complete 91-130','chapter 5 complete 131-180','chapter 6 complete 181-230','chapter 7 complete 231-280','chapter 8 complete 281-330','chapter 9 complete 331-380','transitions at 20, 50, 90, 130, 180, 230, 280, 330 and completion at 380','localized text hint','letter hint','remove hint','level 100 continues to 101, 130 opens 131, 180 opens 181, 230 opens 231, 280 opens 281, 330 opens 331, and 380 returns home'],'result':'PASS'}
      reports.append(report);print(json.dumps(report,ensure_ascii=False),flush=True);ctx.close()
    # Narrow-screen long-answer smoke: no horizontal overflow at 320px.
    ctx=browser.new_context(viewport={'width':320,'height':720},has_touch=True,is_mobile=True)
    ctx.add_init_script("localStorage.setItem('pw.language','en'); localStorage.setItem('pw.theme','game');")
    narrow_account={'photoword_id':'PW-NARROW','first_name':'Narrow','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':5000,'xp':0,'completed_levels':380,'current_level':381,'rank':1,'daily_streak':0,'last_daily_reward':None}
    install_mock(ctx,narrow_account,set(),'en');page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'clean/game.html?level=103#'+fragment,wait_until='domcontentloaded',timeout=45000)
    assert page.evaluate("document.documentElement.scrollWidth<=window.innerWidth+1"),page.evaluate("({w:innerWidth,sw:document.documentElement.scrollWidth})")
    slots_box=page.locator('#slots').bounding_box();assert slots_box and slots_box['x']>=0 and slots_box['x']+slots_box['width']<=321,slots_box
    page.evaluate("localStorage.setItem('pw.language','az')")
    page.goto(BASE+'clean/theme-game.html?theme=technology&level=88#'+fragment,wait_until='domcontentloaded',timeout=45000)
    assert page.evaluate("document.documentElement.scrollWidth<=window.innerWidth+1"),page.evaluate("({w:innerWidth,sw:document.documentElement.scrollWidth})")
    slots_box=page.locator('#slots').bounding_box();assert slots_box and slots_box['x']>=0 and slots_box['x']+slots_box['width']<=321,slots_box
    assert not relevant_errors(errors),errors;ctx.close()

    # Exact regression for the reported Telegram overflow: AZ Professions level 5 (firefighter)
    # on a short iPhone-like Mini App viewport. The text hint must remain fully on screen.
    ctx=browser.new_context(viewport={'width':390,'height':650},has_touch=True,is_mobile=True)
    ctx.add_init_script("localStorage.setItem('pw.language','az'); localStorage.setItem('pw.theme','game');")
    short_account={'photoword_id':'PW-SHORT-FIREFIGHTER','first_name':'Short','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':5000,'xp':300,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None}
    install_mock(ctx,short_account,set(range(1,21)),'az');page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'clean/theme-game.html?theme=professions&level=5#'+fragment,wait_until='domcontentloaded',timeout=45000)
    expect(page.locator('#slots .slot')).to_have_count(len('YANĞINSÖNDÜRƏN'))
    viewport=page.evaluate("({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth})")
    hint_box=page.locator('#textHint').bounding_box();tools_box=page.locator('.tools').bounding_box()
    assert viewport['sw']<=viewport['w']+1,viewport
    assert hint_box and hint_box['y']+hint_box['height']<=viewport['h']+1,(viewport,hint_box)
    assert tools_box and tools_box['y']+tools_box['height']<=viewport['h']+1,(viewport,tools_box)
    assert not relevant_errors(errors),errors;ctx.close()

    browser.close()

(OUT/'results.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2))
