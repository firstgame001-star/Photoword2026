(() => {
'use strict';
const $=id=>document.getElementById(id),pw=window.PW;
const text=(id,v)=>{const e=$(id);if(e)e.textContent=v};
const open=id=>{const e=$(id);if(!e)return;e.hidden=false;e.querySelector('button,input')?.focus()};
const close=id=>{const e=$(id);if(e)e.hidden=true};
const screen=id=>{document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('active',e.id===id));window.scrollTo(0,0)};
const getLang=()=>{try{return localStorage.getItem('pw.language')||''}catch{return''}};
const getTheme=()=>{try{return localStorage.getItem('pw.theme')||'game'}catch{return'game'}};
const lang=()=>getLang()||'ru';
const today=()=>new Date().toISOString().slice(0,10);
const track=(event,data={})=>pw.actionRequest('track_event',{event,language:lang(),...data}).catch(()=>{});
let publicConfig={},adController=null;
window.addEventListener('pw:error',e=>track('server_error',{metadata:{code:String(e.detail?.code||'error'),status:Number(e.detail?.status||0)}}));
window.addEventListener('error',e=>track('client_error',{metadata:{message:String(e.message||'error').slice(0,120)}}));
window.addEventListener('unhandledrejection',e=>track('client_error',{metadata:{message:String(e.reason?.message||e.reason||'rejection').slice(0,120)}}));

const T={
ru:{
logo:['4','Ф','О','Т','О'],one:'1 СЛОВО',tagline:'Больше, чем просто слова',
chapter:n=>'Глава '+n,chapter1:'Разминка',chapter1Desc:'От простых слов к более сложным ассоциациям',chapter2:'Ассоциации',chapter2Desc:'Более сложные слова и связи между образами',chapter3:'Связи',chapter3Desc:'Новые сочетания и более тонкие ассоциации',chapter3Lock:'🔒 Пройди 50-й уровень',chapter4:'Глубина',chapter4Desc:'Больше уровней, систем и сложных связей',chapter4Lock:'🔒 Пройди 90-й уровень',chapter5:'Мастерство',chapter5Desc:'Новые формы, явления и более сложные ассоциации',chapter5Lock:'🔒 Пройди 131-й уровень',chapter6:'Исследование',chapter6Desc:'От природы и технологий к устройству мира',chapter6Lock:'🔒 Пройди 180-й уровень',chapter7:'Цивилизация',chapter7Desc:'Города, архитектура, общество и современная среда',chapter7Lock:'🔒 Пройди 230-й уровень',chapter8:'Человек',chapter8Desc:'Тело, чувства, характер и внутренний мир',chapter8Lock:'🔒 Пройди 280-й уровень',chapter9:'Вселенная',chapter9Desc:'Звёзды, космос, астрономия и полёты за пределы Земли',chapter9Lock:'🔒 Пройди 330-й уровень',future:'Скоро',futureDesc:'Новая глава готовится',futureState:'Закрыто',levels:'уровней',
play:'ИГРАТЬ',replay:'ПЕРЕИГРАТЬ',locked:'ЗАКРЫТО',allDone:'ГЛАВЫ 1–2 ПРОЙДЕНЫ',
home:'Главная',chapters:'Главы',chaptersSubtitle:'Выбирай главу и продолжай игру',rating:'Рейтинг',ratingSubtitle:'Лучшие игроки PhotoWord',overallRating:'🏆 Общий рейтинг',myPosition:'Твоя позиция',refresh:'Обновить рейтинг',
friends:'Друзья',shop:'Магазин',daily:'Ежедневная награда',tasks:'Задания',
settings:'Настройки',sound:'Звук',soundDesc:'Буквы, победа, ошибка и награды',vibration:'Вибрация',hapticDesc:'Нажатия, верный и неверный ответ',music:'Музыка',musicDesc:'Спокойная фоновая музыка',language:'Язык',notifications:'Уведомления',notifyAllow:'Награды и новые уровни · Разрешить',notifyAllowed:'Разрешены',theme:'Тема',rules:'Правила игры',rulesDesc:'Как играть, монеты, XP и подсказки',support:'Поддержка',supportDesc:'Связаться с поддержкой',supportText:'Напиши в поддержку через Telegram-бота. Обращение сохранится, а ответ придёт в этот же чат.',supportOpen:'НАПИСАТЬ В ПОДДЕРЖКУ',privacy:'Конфиденциальность',privacyDesc:'Какие данные используются и зачем',terms:'Пользовательское соглашение',reset:'Сбросить прогресс',resetDesc:'Уровни, XP и место в рейтинге',
novice:'Новичок',skilled:'Знаток',expert:'Эксперт',master:'Мастер',legend:'Легенда',place:'место',unranked:'вне рейтинга',profileRank:'Место',profileLevels:'Уровней',profilePrivacy:'Telegram ID не показывается в рейтинге.',noUsername:'Telegram username не указан',
nicknameSet:'Установить игровой ник',nicknameDone:'Игровой ник установлен',nicknameTitle:'Игровой ник',nicknameText:'Можно установить только один раз. 3–16 символов: английские буквы, цифры и _.',save:'СОХРАНИТЬ',share:'Поделиться игрой',shareText:'Попробуй PhotoWord — 4 картинки, 1 слово!',
dailyCopy:'Заходи каждый день и забирай награду.',streak:'Серия',claim:'ПОЛУЧИТЬ',claimed:'Награда получена ✓',alreadyDaily:'Сегодня награда уже получена.',
taskTitle:'🎯 Задания дня',task1:'Пройди 1 уровень',task2:'Пройди 2 уровня',reward:'Награда',take:'ЗАБРАТЬ',tasksFoot:'Задания обновляются каждый день.',taskClaimed:'ПОЛУЧЕНО',
invite:'ПРИГЛАСИТЬ ДРУГА',invited:'Приглашено',earned:'Получено',inviteCondition:'Друг проходит 10 уровней — вы оба получаете +20 🪙.',invitedList:'Приглашённые',none:'Пока никого нет.',rewardReceived:'Награда получена',
coinShop:'Магазин',coinSection:'Монеты',energySection:'Энергия',energyMax:'Максимум 5/5 ⚡',energyFull:'До 5/5 ⚡',payStars:'Оплата через Telegram Stars ⭐',best:'ВЫГОДНО',adTitle:'Получить бесплатно',adText:'Посмотри рекламу и получи +5 🪙',soon:'СКОРО',adWatch:'СМОТРЕТЬ',adSetup:'НАСТРОЙКА',adRewarded:'+5 🪙 начислено за просмотр рекламы.',adError:'Рекламу не удалось показать. Попробуй позже.',chapter2Lock:'🔒 Пройди 20-й уровень',shopFoot:'Покупки начисляются после подтверждения платежа Telegram.',offerTitle:'Больше монет — больше возможностей!',offerText:'Открывай буквы, получай подсказки и проходи уровни',
themeTitle:'Тема',themeSubtitle:'Выберите оформление игры',themeNames:{game:'🎮 Игровая',night:'🌙 Ночная',light:'☀️ Светлая',neon:'⚡ Неон',gold:'👑 Золотая'},themeDesc:{game:'Текущая классическая тема',night:'Графит и приглушённые цвета',light:'Светлый фон и тёмный текст',neon:'Яркое свечение и контраст',gold:'Тёмный фон и золотые акценты'},
rulesTitle:'Правила игры',resetTitle:'Сбросить прогресс?',cancel:'Отмена',resetButton:'СБРОСИТЬ ПРОГРЕСС',confirmReset:'НАЖМИ ЕЩЁ РАЗ ДЛЯ ПОДТВЕРЖДЕНИЯ',eraseLabel:'Удалить аккаунт',eraseDesc:'Полное удаление профиля и игровых данных',eraseTitle:'Удалить аккаунт?',eraseText:'Будут безвозвратно удалены профиль, прогресс, монеты, XP, история покупок и наград. Это действие нельзя отменить.',eraseButton:'УДАЛИТЬ АККАУНТ',eraseConfirm:'НАЖМИ ЕЩЁ РАЗ ДЛЯ УДАЛЕНИЯ',eraseDone:'Аккаунт удалён.',
profileSynced:'Профиль синхронизирован',loading:'Загрузка…',noPlayers:'Пока нет игроков',notifyNeedTelegram:'Открой игру внутри Telegram, чтобы разрешить уведомления.',notifyGranted:'Уведомления разрешены.',notifyDenied:'Разрешение не предоставлено.',notifyTestSent:'Готово. Тестовое сообщение отправлено в Telegram.',paymentProcessing:'Платёж подтверждён. Начисляю монеты…',paymentCredited:'Монеты начислены ✓',energyCredited:'Энергия начислена ✓',energyFullError:'Энергия уже 5/5.',shopNeedTelegram:'Открой игру внутри Telegram, чтобы совершить покупку.',paymentPending:'Платёж обрабатывается. Монеты начислятся после подтверждения Telegram.',paymentFailed:'Оплата не прошла.',paymentCancelled:'Оплата отменена.',resetDone:'Прогресс сброшен. Выберите язык игры.'
},
en:{
logo:['4','P','I','C','S'],one:'1 WORD',tagline:'More than just words',
chapter:n=>'Chapter '+n,chapter1:'Warm-up',chapter1Desc:'From simple words to more challenging associations',chapter2:'Associations',chapter2Desc:'More challenging words and deeper image connections',chapter3:'Connections',chapter3Desc:'New combinations and subtler associations',chapter3Lock:'🔒 Complete level 50',chapter4:'Depth',chapter4Desc:'More levels, systems, and deeper connections',chapter4Lock:'🔒 Complete level 90',chapter5:'Mastery',chapter5Desc:'New forms, phenomena, and more advanced associations',chapter5Lock:'🔒 Complete level 131',chapter6:'Exploration',chapter6Desc:'From nature and technology to how the world works',chapter6Lock:'🔒 Complete level 180',chapter7:'Civilization',chapter7Desc:'Cities, architecture, society, and the modern environment',chapter7Lock:'🔒 Complete level 230',chapter8:'Human',chapter8Desc:'Body, emotions, character and the inner world',chapter8Lock:'🔒 Complete level 280',chapter9:'Universe',chapter9Desc:'Stars, space, astronomy and journeys beyond Earth',chapter9Lock:'🔒 Complete level 330',future:'Coming soon',futureDesc:'A new chapter is being prepared',futureState:'Locked',levels:'levels',
play:'PLAY',replay:'REPLAY',locked:'LOCKED',allDone:'CHAPTERS 1–2 COMPLETED',
home:'Home',chapters:'Chapters',chaptersSubtitle:'Choose a chapter and continue',rating:'Leaderboard',ratingSubtitle:'Top PhotoWord players',overallRating:'🏆 Overall leaderboard',myPosition:'Your position',refresh:'Refresh leaderboard',
friends:'Friends',shop:'Shop',daily:'Daily reward',tasks:'Tasks',
settings:'Settings',sound:'Sound',soundDesc:'Letters, wins, mistakes and rewards',vibration:'Haptics',hapticDesc:'Taps, correct and wrong answers',music:'Music',musicDesc:'Calm background music',language:'Language',notifications:'Notifications',notifyAllow:'Rewards and new levels · Allow',notifyAllowed:'Allowed',theme:'Theme',rules:'Game rules',rulesDesc:'How to play, coins, XP and hints',support:'Support',supportDesc:'Contact support',supportText:'Message support through the Telegram bot. Your request will be saved and the reply will arrive in the same chat.',supportOpen:'CONTACT SUPPORT',privacy:'Privacy',privacyDesc:'What data is used and why',terms:'Terms of use',reset:'Reset progress',resetDesc:'Levels, XP and leaderboard position',
novice:'Novice',skilled:'Skilled',expert:'Expert',master:'Master',legend:'Legend',place:'place',unranked:'unranked',profileRank:'Place',profileLevels:'Levels',profilePrivacy:'Telegram ID is not shown on the leaderboard.',noUsername:'Telegram username not set',
nicknameSet:'Set game nickname',nicknameDone:'Game nickname set',nicknameTitle:'Game nickname',nicknameText:'You can set it only once. 3–16 characters: English letters, numbers and _.',save:'SAVE',share:'Share game',shareText:'Try PhotoWord — 4 pictures, 1 word!',
dailyCopy:'Come back every day and claim your reward.',streak:'Streak',claim:'CLAIM',claimed:'Reward claimed ✓',alreadyDaily:'Today’s reward has already been claimed.',
taskTitle:'🎯 Daily tasks',task1:'Complete 1 level',task2:'Complete 2 levels',reward:'Reward',take:'CLAIM',tasksFoot:'Tasks refresh every day.',taskClaimed:'CLAIMED',
invite:'INVITE A FRIEND',invited:'Invited',earned:'Earned',inviteCondition:'Your friend completes 10 levels — both of you get +20 🪙.',invitedList:'Invited friends',none:'No invited friends yet.',rewardReceived:'Reward received',
coinShop:'Shop',coinSection:'Coins',energySection:'Energy',energyMax:'Maximum 5/5 ⚡',energyFull:'Restore to 5/5 ⚡',payStars:'Payment via Telegram Stars ⭐',best:'BEST VALUE',adTitle:'Get for free',adText:'Watch an ad and get +5 🪙',soon:'SOON',adWatch:'WATCH',adSetup:'SETUP',adRewarded:'+5 🪙 credited for watching the ad.',adError:'The ad could not be shown. Try again later.',chapter2Lock:'🔒 Complete level 20',shopFoot:'Purchases are credited after Telegram confirms the payment.',offerTitle:'More coins — more possibilities!',offerText:'Reveal letters, use hints and complete levels',
themeTitle:'Theme',themeSubtitle:'Choose the game appearance',themeNames:{game:'🎮 Game',night:'🌙 Night',light:'☀️ Light',neon:'⚡ Neon',gold:'👑 Gold'},themeDesc:{game:'Current classic theme',night:'Graphite and muted colors',light:'Light background and dark text',neon:'Bright glow and contrast',gold:'Dark background with gold accents'},
rulesTitle:'Game rules',resetTitle:'Reset progress?',cancel:'Cancel',resetButton:'RESET PROGRESS',confirmReset:'TAP AGAIN TO CONFIRM',eraseLabel:'Delete account',eraseDesc:'Permanently delete profile and game data',eraseTitle:'Delete account?',eraseText:'Your profile, progress, coins, XP, purchase history and rewards will be permanently deleted. This cannot be undone.',eraseButton:'DELETE ACCOUNT',eraseConfirm:'TAP AGAIN TO DELETE',eraseDone:'Account deleted.',
profileSynced:'Profile synced',loading:'Loading…',noPlayers:'No players yet',notifyNeedTelegram:'Open the game inside Telegram to enable notifications.',notifyGranted:'Notifications allowed.',notifyDenied:'Permission was not granted.',notifyTestSent:'Done. A test message was sent in Telegram.',paymentProcessing:'Payment confirmed. Crediting coins…',paymentCredited:'Coins credited ✓',energyCredited:'Energy credited ✓',energyFullError:'Energy is already 5/5.',shopNeedTelegram:'Open the game inside Telegram to make a purchase.',paymentPending:'Payment is processing. Coins will be credited after Telegram confirms it.',paymentFailed:'Payment failed.',paymentCancelled:'Payment cancelled.',resetDone:'Progress reset. Choose your game language.'
},
az:{
logo:['4','F','O','T','O'],one:'1 SÖZ',tagline:'Sadəcə sözlərdən daha çox',
chapter:n=>'Fəsil '+n,chapter1:'İsinmə',chapter1Desc:'Sadə sözlərdən daha çətin assosiasiyalara',chapter2:'Assosiasiyalar',chapter2Desc:'Daha çətin sözlər və şəkillər arasında daha dərin əlaqələr',chapter3:'Əlaqələr',chapter3Desc:'Yeni birləşmələr və daha incə assosiasiyalar',chapter3Lock:'🔒 50-ci səviyyəni keç',chapter4:'Dərinlik',chapter4Desc:'Daha çox səviyyə, sistem və daha dərin əlaqələr',chapter4Lock:'🔒 90-cı səviyyəni keç',chapter5:'Ustalıq',chapter5Desc:'Yeni formalar, hadisələr və daha çətin assosiasiyalar',chapter5Lock:'🔒 131-ci səviyyəni keç',chapter6:'Araşdırma',chapter6Desc:'Təbiət və texnologiyadan dünyanın quruluşuna doğru',chapter6Lock:'🔒 180-ci səviyyəni keç',chapter7:'Sivilizasiya',chapter7Desc:'Şəhərlər, memarlıq, cəmiyyət və müasir mühit',chapter7Lock:'🔒 230-cu səviyyəni keç',chapter8:'İnsan',chapter8Desc:'Bədən, hisslər, xarakter və daxili dünya',chapter8Lock:'🔒 280-ci səviyyəni keç',chapter9:'Kainat',chapter9Desc:'Ulduzlar, kosmos, astronomiya və Yerdən kənar uçuşlar',chapter9Lock:'🔒 330-cu səviyyəni keç',future:'Tezliklə',futureDesc:'Yeni fəsil hazırlanır',futureState:'Bağlıdır',levels:'səviyyə',
play:'OYNA',replay:'YENİDƏN OYNA',locked:'BAĞLIDIR',allDone:'1–2-Cİ FƏSİLLƏR TAMAMLANDI',
home:'Ana səhifə',chapters:'Fəsillər',chaptersSubtitle:'Fəsli seç və oyuna davam et',rating:'Reytinq',ratingSubtitle:'PhotoWord-un ən yaxşı oyunçuları',overallRating:'🏆 Ümumi reytinq',myPosition:'Sənin yerin',refresh:'Reytinqi yenilə',
friends:'Dostlar',shop:'Mağaza',daily:'Gündəlik mükafat',tasks:'Tapşırıqlar',
settings:'Ayarlar',sound:'Səs',soundDesc:'Hərflər, qələbə, səhv və mükafat səsləri',vibration:'Vibrasiya',hapticDesc:'Toxunuş, düzgün və səhv cavab',music:'Musiqi',musicDesc:'Sakit fon musiqisi',language:'Dil',notifications:'Bildirişlər',notifyAllow:'Mükafatlar və yeni səviyyələr · İcazə ver',notifyAllowed:'İcazə verilib',theme:'Tema',rules:'Oyun qaydaları',rulesDesc:'Oyun, sikkələr, XP və ipucları',support:'Dəstək',supportDesc:'Dəstəklə əlaqə',supportText:'Telegram botu vasitəsilə dəstəyə yaz. Müraciət yadda saxlanacaq və cavab eyni çata gələcək.',supportOpen:'DƏSTƏYƏ YAZ',privacy:'Məxfilik',privacyDesc:'Hansı məlumatların niyə istifadə edilməsi',terms:'İstifadəçi razılaşması',reset:'Tərəqqini sıfırla',resetDesc:'Səviyyələr, XP və reytinq mövqeyi',
novice:'Yeni başlayan',skilled:'Bilici',expert:'Ekspert',master:'Usta',legend:'Əfsanə',place:'yer',unranked:'reytinqdən kənar',profileRank:'Yer',profileLevels:'Səviyyələr',profilePrivacy:'Telegram ID reytinqdə göstərilmir.',noUsername:'Telegram username göstərilməyib',
nicknameSet:'Oyun niki təyin et',nicknameDone:'Oyun niki təyin edilib',nicknameTitle:'Oyun niki',nicknameText:'Yalnız bir dəfə təyin etmək olar. 3–16 simvol: ingilis hərfləri, rəqəmlər və _.',save:'YADDA SAXLA',share:'Oyunu paylaş',shareText:'PhotoWord-u sına — 4 şəkil, 1 söz!',
dailyCopy:'Hər gün daxil ol və mükafatını götür.',streak:'Seriya',claim:'GÖTÜR',claimed:'Mükafat alındı ✓',alreadyDaily:'Bugünkü mükafat artıq alınıb.',
taskTitle:'🎯 Günün tapşırıqları',task1:'1 səviyyə keç',task2:'2 səviyyə keç',reward:'Mükafat',take:'GÖTÜR',tasksFoot:'Tapşırıqlar hər gün yenilənir.',taskClaimed:'ALINDI',
invite:'DOSTU DƏVƏT ET',invited:'Dəvət edilib',earned:'Qazanılıb',inviteCondition:'Dostun 10 səviyyə keçir — hər ikiniz +20 🪙 alırsınız.',invitedList:'Dəvət olunanlar',none:'Hələ dəvət olunan yoxdur.',rewardReceived:'Mükafat alındı',
coinShop:'Mağaza',coinSection:'Sikkələr',energySection:'Enerji',energyMax:'Maksimum 5/5 ⚡',energyFull:'5/5-ə qədər bərpa et ⚡',payStars:'Ödəniş Telegram Stars ilə ⭐',best:'SƏRFƏLİ',adTitle:'Pulsuz əldə et',adText:'Reklama bax və +5 🪙 qazan',soon:'TEZLİKLƏ',adWatch:'BAX',adSetup:'QURULUR',adRewarded:'Reklama baxdığın üçün +5 🪙 əlavə olundu.',adError:'Reklamı göstərmək mümkün olmadı. Sonra yenidən cəhd et.',chapter2Lock:'🔒 20-ci səviyyəni keç',shopFoot:'Alışlar Telegram ödənişi təsdiqlədikdən sonra əlavə olunur.',offerTitle:'Daha çox sikkə — daha çox imkan!',offerText:'Hərfləri aç, ipuclarından istifadə et və səviyyələri keç',
themeTitle:'Tema',themeSubtitle:'Oyunun görünüşünü seç',themeNames:{game:'🎮 Oyun',night:'🌙 Gecə',light:'☀️ İşıqlı',neon:'⚡ Neon',gold:'👑 Qızılı'},themeDesc:{game:'Klassik oyun mövzusu',night:'Qrafit və sakit rənglər',light:'Açıq fon və tünd mətn',neon:'Parlaq işıq və kontrast',gold:'Tünd fon və qızılı vurğular'},
rulesTitle:'Oyun qaydaları',resetTitle:'Tərəqqi sıfırlansın?',cancel:'Ləğv et',resetButton:'TƏRƏQQİNİ SIFIRLA',confirmReset:'TƏSDİQ ÜÇÜN YENƏ TOXUN',eraseLabel:'Hesabı sil',eraseDesc:'Profili və oyun məlumatlarını tam sil',eraseTitle:'Hesab silinsin?',eraseText:'Profil, tərəqqi, sikkələr, XP, alış tarixçəsi və mükafatlar birdəfəlik silinəcək. Bu əməliyyatı geri qaytarmaq olmaz.',eraseButton:'HESABI SİL',eraseConfirm:'SİLMƏK ÜÇÜN YENƏ TOXUN',eraseDone:'Hesab silindi.',
profileSynced:'Profil sinxronlaşdırıldı',loading:'Yüklənir…',noPlayers:'Hələ oyunçu yoxdur',notifyNeedTelegram:'Bildirişləri aktivləşdirmək üçün oyunu Telegram daxilində açın.',notifyGranted:'Bildirişlərə icazə verildi.',notifyDenied:'İcazə verilmədi.',notifyTestSent:'Hazırdır. Telegram-da test mesajı göndərildi.',paymentProcessing:'Ödəniş təsdiqləndi. Sikkələr əlavə olunur…',paymentCredited:'Sikkələr əlavə olundu ✓',energyCredited:'Enerji əlavə olundu ✓',energyFullError:'Enerji artıq 5/5-dir.',shopNeedTelegram:'Alış etmək üçün oyunu Telegram daxilində aç.',paymentPending:'Ödəniş emal olunur. Telegram təsdiqlədikdən sonra sikkələr əlavə olunacaq.',paymentFailed:'Ödəniş uğursuz oldu.',paymentCancelled:'Ödəniş ləğv edildi.',resetDone:'Tərəqqi sıfırlandı. Oyun dilini seçin.'
}};

const THEMES=['game','night','light','neon','gold'];
const THEME_CATEGORIES=[
 {id:'sport',icon:'⚽'},{id:'art',icon:'🎨'},{id:'professions',icon:'🧑‍💼'},{id:'travel',icon:'🌍'},
 {id:'science',icon:'🔬'},{id:'technology',icon:'💻'},{id:'cinema',icon:'🎬'},{id:'food',icon:'🍽️'},
 {id:'animals',icon:'🐾'},{id:'transport',icon:'🚗'},{id:'home',icon:'🏠'},{id:'nature',icon:'🌿'}
];
const THEME_MODE={
 ru:{title:'Темы',subtitle:'Выбери сферу и проходи отдельные уровни',entry:'Тематические уровни',entryBadge:'НОВЫЙ РЕЖИМ',entryDesc:'12 тем · 1200 уровней',unlock:'Тематические уровни откроются после 10-го уровня основной игры.',separate:'Прогресс тематических разделов будет считаться отдельно от основной игры.',detail:'Отдельный режим · 100 уровней',preparing:'Раздел создан на 100 уровней. Контент уровней будем добавлять постепенно.',levels:'уровней',cats:{
  sport:['Спорт','Игры, соревнования, инвентарь и достижения'],art:['Искусство','Живопись, музыка, сцена и творчество'],professions:['Профессии','Работа, специальности и инструменты'],travel:['Путешествия','Страны, дороги, отдых и приключения'],
  science:['Наука','Открытия, эксперименты и знания'],technology:['Технологии','Гаджеты, интернет и цифровой мир'],cinema:['Кино и развлечения','Фильмы, сцена, игры и шоу'],food:['Еда','Продукты, блюда, кухня и вкусы'],
  animals:['Животные','Дикие и домашние животные'],transport:['Транспорт','Машины, поезда, самолёты и дороги'],home:['Дом и быт','Предметы, комнаты и повседневная жизнь'],nature:['Природа','Растения, погода, ландшафты и стихии']
 }},
 en:{title:'Themes',subtitle:'Choose a category and play separate levels',entry:'Themed levels',entryBadge:'NEW MODE',entryDesc:'12 themes · 1200 levels',unlock:'Themed levels unlock after level 10 of the main game.',separate:'Theme progress will be tracked separately from the main game.',detail:'Separate mode · 100 levels',preparing:'This category is structured for 100 levels. Level content will be added gradually.',levels:'levels',cats:{
  sport:['Sport','Games, competitions, gear and achievements'],art:['Art','Painting, music, stage and creativity'],professions:['Professions','Jobs, specialties and tools'],travel:['Travel','Countries, roads, holidays and adventures'],
  science:['Science','Discoveries, experiments and knowledge'],technology:['Technology','Gadgets, internet and the digital world'],cinema:['Cinema & entertainment','Movies, stage, games and shows'],food:['Food','Products, dishes, cooking and flavors'],
  animals:['Animals','Wild and domestic animals'],transport:['Transport','Cars, trains, planes and roads'],home:['Home & everyday life','Rooms, objects and daily routines'],nature:['Nature','Plants, weather, landscapes and elements']
 }},
 az:{title:'Mövzular',subtitle:'Sahəni seç və ayrıca səviyyələri keç',entry:'Mövzu səviyyələri',entryBadge:'YENİ REJİM',entryDesc:'12 mövzu · 1200 səviyyə',unlock:'Mövzu səviyyələri əsas oyunun 10-cu səviyyəsindən sonra açılır.',separate:'Mövzu bölmələrinin tərəqqisi əsas oyundan ayrıca hesablanacaq.',detail:'Ayrı rejim · 100 səviyyə',preparing:'Bu bölmə 100 səviyyə üçün yaradılıb. Səviyyə məzmunu mərhələli əlavə olunacaq.',levels:'səviyyə',cats:{
  sport:['İdman','Oyunlar, yarışlar, inventar və nailiyyətlər'],art:['İncəsənət','Rəsm, musiqi, səhnə və yaradıcılıq'],professions:['Peşələr','İş, ixtisaslar və alətlər'],travel:['Səyahət','Ölkələr, yollar, istirahət və macəralar'],
  science:['Elm','Kəşflər, təcrübələr və biliklər'],technology:['Texnologiya','Qadcetlər, internet və rəqəmsal dünya'],cinema:['Kino və əyləncə','Filmlər, səhnə, oyunlar və şoular'],food:['Yemək','Məhsullar, yeməklər, mətbəx və dadlar'],
  animals:['Heyvanlar','Vəhşi və ev heyvanları'],transport:['Nəqliyyat','Maşınlar, qatarlar, təyyarələr və yollar'],home:['Ev və məişət','Əşyalar, otaqlar və gündəlik həyat'],nature:['Təbiət','Bitkilər, hava, landşaft və təbiət hadisələri']
 }}
};
const CHALLENGE_MODE={
 ru:{kicker:'НОВЫЕ РЕЖИМЫ',title:'Испытания',subtitle:'Три режима уже можно тестировать. Награды настроим отдельно.',state:'ГОТОВО К ТЕСТУ',close:'ПОНЯТНО',modal:'Режим уже добавлен в игру. Правила, результат и награды настроим следующим этапом.',modes:{limited:['🛡️','Ограниченные попытки','Проходи задания с ограниченным запасом ошибок'],nohint:['🚫','Без подсказок','Только изображения, буквы и твоя логика'],blitz:['⚡','Блиц','Быстрый режим на время']}},
 en:{kicker:'NEW MODES',title:'Challenges',subtitle:'All three modes are ready to test. Rewards will be configured separately.',state:'READY TO TEST',close:'GOT IT',modal:'This mode is already added to the game. Rules, scoring and rewards will be configured next.',modes:{limited:['🛡️','Limited attempts','Solve puzzles with a limited number of mistakes'],nohint:['🚫','No hints','Only images, letters and your logic'],blitz:['⚡','Blitz','A fast timed mode']}},
 az:{kicker:'YENİ REJİMLƏR',title:'Sınaqlar',subtitle:'Üç rejimin hamısını artıq test etmək olar. Mükafatları ayrıca quracağıq.',state:'TESTƏ HAZIR',close:'BAŞA DÜŞDÜM',modal:'Bu rejim artıq oyuna əlavə edilib. Qaydaları, nəticəni və mükafatları növbəti mərhələdə quracağıq.',modes:{limited:['🛡️','Məhdud cəhdlər','Məhdud səhv sayı ilə tapşırıqları keç'],nohint:['🚫','İpucusuz','Yalnız şəkillər, hərflər və sənin məntiqin'],blitz:['⚡','Blits','Vaxta qarşı sürətli rejim']}}
};
function challengeMode(){return CHALLENGE_MODE[lang()]||CHALLENGE_MODE.ru}
function setChallengeLabels(){
 const m=challengeMode();
 text('challengeKicker',m.kicker);text('challengeTitle',m.title);text('challengeSubtitle',m.subtitle);
 const ids={limited:'Limited',nohint:'NoHint',blitz:'Blitz'};
 for(const [key,suffix] of Object.entries(ids)){
  const d=m.modes[key];text('challenge'+suffix+'Title',d[1]);text('challenge'+suffix+'Desc',d[2]);text('challenge'+suffix+'State',m.state);
 }
}
function openChallengeMode(id){
 const m=challengeMode(),d=m.modes[id];if(!d)return;
 track('challenge_mode_open',{metadata:{mode:id}});
 if(window.PWChallenge?.open)window.PWChallenge.open(id);
 else location.href='./index.html?challenge='+encodeURIComponent(id);
}
function themeMode(){return THEME_MODE[lang()]||THEME_MODE.ru}
function themeCategory(id){return THEME_CATEGORIES.find(x=>x.id===id)}
function setThemeHubLabels(){
 const m=themeMode();
 text('themesEntryBadge',m.entryBadge);text('themesEntryTitle',m.entry);text('themesEntryDesc',m.entryDesc);text('themesTitle',m.title);text('themesSubtitle',m.subtitle);
}
function getThemeProgress(id){try{const raw=JSON.parse(localStorage.getItem('pw.themeProgress.'+id)||'[]');return new Set(Array.isArray(raw)?raw.map(Number).filter(Number.isInteger):[])}catch{return new Set()}}
function renderThemeHub(p){
 setThemeHubLabels();
 const m=themeMode(),done=Number(p?.completed_levels||0),unlocked=done>=10,wrap=$('themeCards');
 if($('themesUnlockNote'))text('themesUnlockNote',unlocked?m.separate:m.unlock);
 if(!wrap)return;
 wrap.replaceChildren();
 for(const cat of THEME_CATEGORIES){
   const copy=m.cats[cat.id]||[cat.id,''],button=document.createElement('button'),progressSet=getThemeProgress(cat.id),count=progressSet.size;
   button.type='button';button.className='theme-card'+(unlocked?'':' locked');button.disabled=!unlocked;
   const icon=document.createElement('span'),body=document.createElement('span'),title=document.createElement('b'),desc=document.createElement('small'),progress=document.createElement('em');
   icon.className='theme-card-icon';icon.textContent=cat.icon;title.textContent=copy[0];desc.textContent=copy[1];progress.textContent=unlocked?(count+' / 100'):m.unlock;
   body.append(title,desc);button.append(icon,body,progress);
   if(unlocked)button.onclick=()=>openThemeCategory(cat.id);
   wrap.append(button);
 }
}
function openThemeCategory(id){
 const cat=themeCategory(id);if(!cat)return;
 const m=themeMode(),copy=m.cats[id]||[id,''],progress=getThemeProgress(id),done=progress.size,isReady=['sport','art','professions','travel','science','technology'].includes(id);
 text('themeDetailTitle',cat.icon+' '+copy[0]);text('themeDetailSubtitle',done+' / 100 · '+m.detail);text('themeDetailInfo',isReady?(lang()==='ru'?'Все 100 уровней раздела готовы.':lang()==='en'?'All 100 levels in this category are ready.':'Bu bölmənin bütün 100 səviyyəsi hazırdır.'):m.preparing);
 const grid=$('themeLevelGrid');grid.replaceChildren();
 const next=Math.min(100,done+1);
 for(let n=1;n<=100;n++){
   const b=document.createElement('button');b.type='button';b.textContent=n;b.setAttribute('aria-label',copy[0]+' '+n);
   const completed=progress.has(n),available=isReady&&n<=100&&(completed||n<=next);
   b.disabled=!available;b.classList.toggle('done',completed);b.classList.toggle('next',available&&!completed);
   if(available)b.onclick=()=>{location.href='./theme-game.html?theme='+encodeURIComponent(id)+'&level='+n};
   grid.append(b);
 }
 screen('themeDetailScreen');track('theme_category_open',{metadata:{theme:id}});
}

function t(){return T[lang()]||T.ru}
function leagueName(p){const x=t();return p.xp>=4000?x.legend:p.xp>=2500?x.master:p.xp>=1500?x.expert:p.xp>=400?x.skilled:x.novice}
const CHAPTER_TITLES={
 ru:{1:'Новичок',2:'Любитель',3:'Знаток',4:'Опытный',5:'Эксперт',6:'Профессионал',7:'Мастер',8:'Виртуоз',9:'Легенда',10:'Мастер слов'},
 en:{1:'Novice',2:'Amateur',3:'Adept',4:'Experienced',5:'Expert',6:'Professional',7:'Master',8:'Virtuoso',9:'Legend',10:'Word Master'},
 az:{1:'Yeni başlayan',2:'Həvəskar',3:'Bilici',4:'Təcrübəli',5:'Ekspert',6:'Peşəkar',7:'Usta',8:'Virtuoz',9:'Əfsanə',10:'Söz ustası'}
};
const MAIN_CHAPTERS=[
 {num:1,start:1,end:20,key:'chapter1'},{num:2,start:21,end:50,key:'chapter2'},{num:3,start:51,end:90,key:'chapter3'},
 {num:4,start:91,end:131,key:'chapter4'},{num:5,start:132,end:180,key:'chapter5'},{num:6,start:181,end:230,key:'chapter6'},
 {num:7,start:231,end:280,key:'chapter7'},{num:8,start:281,end:330,key:'chapter8'},{num:9,start:331,end:380,key:'chapter9'}
].map(ch=>({...ch,total:ch.end-ch.start+1}));
function completedChapterCount(p){
 const explicit=Array.isArray(p?.completed_chapters)?p.completed_chapters.length:Number(p?.completed_chapters);
 if(Number.isFinite(explicit)&&explicit>0)return Math.max(0,Math.min(12,Math.floor(explicit)));
 const done=Number(p?.completed_levels||0);return MAIN_CHAPTERS.filter(ch=>done>=ch.end).length;
}
function earnedChapterTitle(p){const n=completedChapterCount(p);return n?(CHAPTER_TITLES[lang()]||CHAPTER_TITLES.ru)[n]||'': ''}
function shownChapterLevel(p,start,end,finished,unlocked){
 if(finished)return end;
 const current=Number(p?.current_level||1);
 if(current>=start&&current<=end)return current;
 if(current>end)return end;
 return unlocked?start:0;
}
function persistPrefs(){try{localStorage.setItem('photoword-prefs',JSON.stringify(pw.prefs))}catch{}}
function setLogo(x){const e=$('logoLetters');if(e)e.innerHTML=x.logo.map(v=>'<i>'+v+'</i>').join('');text('logoWord',x.one);text('logoTagline',x.tagline)}
function chapterData(p,x){
 const l=Number(p.current_level||1),ch=MAIN_CHAPTERS.find(v=>l<=v.end)||MAIN_CHAPTERS[MAIN_CHAPTERS.length-1];
 return {num:ch.num,title:x[ch.key],desc:x[ch.key+'Desc'],start:ch.start,end:ch.end,total:ch.total};
}

function applyTheme(theme){
 if(!THEMES.includes(theme))theme='game';
 document.documentElement.dataset.theme=theme;try{localStorage.setItem('pw.theme',theme)}catch{}
 const x=t();text('themeCurrent',x.themeNames[theme]);document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('selected',b.dataset.theme===theme));
}
function setThemeLabels(x){
 text('themeTitle',x.themeTitle);text('themeSubtitle',x.themeSubtitle);
 for(const key of THEMES){const cap=key[0].toUpperCase()+key.slice(1);text('theme'+cap+'Name',x.themeNames[key]);text('theme'+cap+'Desc',x.themeDesc[key]);}
}
function renderMainChapterCard(p,x,ch,prefix){
 const done=Math.min(ch.total,Math.max(0,Number(p.completed_levels||0)-(ch.start-1))),finished=done>=ch.total;
 const unlocked=ch.num===1||(p.current_level||1)>=ch.start||Number(p.completed_levels||0)>=ch.start-1;
 const base=prefix+ch.num;
 text(base+'Label',x.chapter(ch.num)+' · '+ch.start+'–'+ch.end);
 text(base+'Title',x[ch.key]);text(base+'Desc',x[ch.key+'Desc']);
 text(base+'Done',shownChapterLevel(p,ch.start,ch.end,finished,unlocked));text(base+'Count','/ '+ch.end+' '+x.levels);
 const progress=$(base+'Progress');if(progress)progress.style.width=(done/ch.total*100)+'%';
 const lock=$(base+'LockNote'),play=$(base+'Play');
 if(unlocked){
  if(lock)lock.hidden=true;
  const next=finished?ch.start:Math.max(ch.start,Math.min(ch.end,p.current_level||ch.start));
  play.classList.remove('locked');play.removeAttribute('aria-disabled');play.href='./game.html?level='+next;
  play.innerHTML=(finished?x.replay:x.play)+' <span>▶</span>';
 }else{
  if(lock){lock.hidden=false;text(base+'LockNote',x[ch.key+'Lock']);}
  play.classList.add('locked');play.setAttribute('aria-disabled','true');play.removeAttribute('href');play.textContent=x.locked;
 }
}
function renderFutureChapter(x,n,prefix){
 text(prefix+n+'Label',x.chapter(n));text(prefix+n+'Title',x.future);text(prefix+n+'Desc',x.futureDesc);
 const countId=prefix==='homeChapter'?prefix+n+'State':prefix+n+'Count';
 text(countId,x.futureState);text(prefix+n+'Play',x.future);
}
function updateChapterCards(p){
 const x=t();for(const ch of MAIN_CHAPTERS)renderMainChapterCard(p,x,ch,'chapter');
 for(let n=10;n<=12;n++)renderFutureChapter(x,n,'chapter');
}
function updateHomeCarousel(p){
 const x=t();for(const ch of MAIN_CHAPTERS)renderMainChapterCard(p,x,ch,'homeChapter');
 for(let n=10;n<=12;n++)renderFutureChapter(x,n,'homeChapter');
}
function update(p){
 const x=t(),name=pw.name(p),rank=p.rank>0?'#'+p.rank:'—';
 const chapterTitle=earnedChapterTitle(p);
 text('name',name);text('profileName',name);text('rankLabel',(chapterTitle?chapterTitle+' · ':'')+(p.rank>0?x.place+' #'+p.rank:x.unranked));text('profileRank',rank);
 text('profileTitle',chapterTitle);if($('profileTitle'))$('profileTitle').hidden=!chapterTitle;
 text('photoWordId',p.photoword_id);text('profileXp',p.xp);text('profileDone',p.completed_levels);text('profileUsername',p.username?'@'+p.username:x.noUsername);
 for(const id of ['avatar','profileAvatar'])text(id,(name||'P').charAt(0).toUpperCase());text('myRank',rank);text('myXp',p.xp+' XP');
 text('nicknameBtn',p.nickname_changed?x.nicknameDone:x.nicknameSet);$('nicknameBtn').disabled=Boolean(p.nickname_changed);
 updateHomeCarousel(p);updateChapterCards(p);renderThemeHub(p);
 const claimed=String(p.last_daily_reward||'')===today();$('claimDaily').disabled=claimed;text('claimDaily',claimed?x.claimed:x.claim);text('dailyStreak',x.streak+': '+(p.daily_streak||0));text('notificationsState',p.notifications_enabled?x.notifyAllowed:x.notifyAllow);
}
function applyLanguage(l,persist=true){
 if(!T[l])l='ru';if(persist){try{localStorage.setItem('pw.language',l)}catch{}}document.documentElement.lang=l;const x=T[l];setLogo(x);setThemeHubLabels();setChallengeLabels();
 const nav=document.querySelectorAll('nav small');[x.home,x.chapters,x.rating,x.friends,x.shop].forEach((v,i)=>{if(nav[i])nav[i].textContent=v});
 text('chaptersTitle',x.chapters);text('chaptersSubtitle',x.chaptersSubtitle);text('ratingTitle',x.rating);text('ratingSubtitle',x.ratingSubtitle);text('ratingLeague',x.overallRating);text('myPositionLabel',x.myPosition);text('refreshRating',x.refresh);
 text('settingsTitle',x.settings);const rows=document.querySelectorAll('#settingsModal .settingrow b');if(rows[0])rows[0].textContent=x.sound;if(rows[1])rows[1].textContent=x.vibration;if(rows[2])rows[2].textContent=x.music;
 text('soundDesc',x.soundDesc);text('hapticDesc',x.hapticDesc);text('musicDesc',x.musicDesc);$('languageBtn').querySelector('b').textContent=x.language;$('notificationsBtn').querySelector('b').textContent=x.notifications;text('notificationsState',(pw.player?.notifications_enabled||localStorage.getItem('pw.writeAccess'))?x.notifyAllowed:x.notifyAllow);$('themeBtn').querySelector('b').textContent=x.theme;
 $('rulesBtn').querySelector('b').textContent=x.rules;$('rulesBtn').querySelector('small').textContent=x.rulesDesc;text('supportTitle',x.support);text('supportDesc',x.supportDesc);text('supportText',x.supportText);text('openSupportChat',x.supportOpen);$('privacyLink').querySelector('b').textContent=x.privacy;$('privacyLink').querySelector('small').textContent=x.privacyDesc;$('termsLink').querySelector('b').textContent=x.terms;$('resetProgressBtn').querySelector('b').textContent=x.reset;$('resetProgressBtn').querySelector('small').textContent=x.resetDesc;text('eraseAccountLabel',x.eraseLabel);text('eraseAccountDesc',x.eraseDesc);
 text('profileRankLabel',x.profileRank);text('profileDoneLabel',x.profileLevels);text('profilePrivacyNote',x.profilePrivacy);text('nicknameTitle',x.nicknameTitle);text('nicknameText',x.nicknameText);text('saveNickname',x.save);text('shareGameBtn',x.share);
 text('friendsInvited',document.getElementById('friendsInvited')?.textContent||'0');const fs=document.querySelectorAll('.friendstats small');if(fs[0])fs[0].textContent=x.invited;if(fs[1])fs[1].textContent=x.earned;text('friendsCondition',x.inviteCondition);text('inviteFriend',x.invite);$('friendsModal').querySelector('h2').textContent=x.friends;$('friendsModal').querySelector('h3').textContent=x.invitedList;if($('friendsEmpty'))text('friendsEmpty',x.none);
 text('shopTitle',x.coinShop);text('coinShopSectionTitle',x.coinSection);text('energyShopSectionTitle',x.energySection);text('energyShopNote',x.energyMax);text('energyFullLabel',x.energyFull);text('shopPayNote',x.payStars);const best=$('shopModal').querySelector('.best i');if(best)best.textContent=x.best;text('adTitle',x.adTitle);text('adText',x.adText);text('watchAd',publicConfig.adsgram_reward_block_id?x.adWatch:x.adSetup);text('shopFootnote',x.shopFoot);const offer=$('shopOffer');if(offer){offer.querySelector('b').textContent=x.offerTitle;offer.querySelector('small').textContent=x.offerText;}
 $('dailyModal').querySelector('h2').textContent=x.daily;text('dailyCopy',x.dailyCopy);
 const shortcuts=document.querySelectorAll('.shortcuts button b');if(shortcuts[0])shortcuts[0].textContent=x.daily;if(shortcuts[1])shortcuts[1].textContent=x.rating;
 text('rulesTitle',x.rulesTitle);$('rulesBody').innerHTML=RULES[l]||RULES.ru;text('resetTitle',x.resetTitle);text('resetBody',RESET[l]||RESET.ru);text('cancelReset',x.cancel);text('confirmReset',x.resetButton);text('eraseAccountTitle',x.eraseTitle);text('eraseAccountText',x.eraseText);text('confirmEraseAccount',x.eraseButton);text('cancelEraseAccount',x.cancel);
 text('homeChapter3Label',x.chapter(3)+' · 51–90');text('homeChapter3Title',x.chapter3);text('homeChapter3Desc',x.chapter3Desc);text('chapter3Label',x.chapter(3)+' · 51–90');text('chapter3Title',x.chapter3);text('chapter3Desc',x.chapter3Desc);text('chapter3Count','/ 90 '+x.levels);text('homeChapter4Label',x.chapter(4)+' · 91–131');text('homeChapter4Title',x.chapter4);text('homeChapter4Desc',x.chapter4Desc);text('chapter4Label',x.chapter(4)+' · 91–131');text('chapter4Title',x.chapter4);text('chapter4Desc',x.chapter4Desc);text('chapter4Count','/ 131 '+x.levels);for(const ch of MAIN_CHAPTERS.filter(ch=>ch.num>=8)){text('homeChapter'+ch.num+'Label',x.chapter(ch.num)+' · '+ch.start+'–'+ch.end);text('homeChapter'+ch.num+'Title',x[ch.key]);text('homeChapter'+ch.num+'Desc',x[ch.key+'Desc']);text('chapter'+ch.num+'Label',x.chapter(ch.num)+' · '+ch.start+'–'+ch.end);text('chapter'+ch.num+'Title',x[ch.key]);text('chapter'+ch.num+'Desc',x[ch.key+'Desc']);}for(let n=10;n<=12;n++){text('homeChapter'+n+'Label',x.chapter(n));text('homeChapter'+n+'Title',x.future);text('homeChapter'+n+'Desc',x.futureDesc);text('homeChapter'+n+'State',x.futureState);text('homeChapter'+n+'Play',x.future);text('chapter'+n+'Label',x.chapter(n));text('chapter'+n+'Title',x.future);text('chapter'+n+'Desc',x.futureDesc);text('chapter'+n+'Count',x.futureState);text('chapter'+n+'Play',x.future);}setThemeLabels(x);text('themeCurrent',x.themeNames[getTheme()]);text('languageCurrent',l==='ru'?'Русский':l==='en'?'English':'Azərbaycan dili');document.querySelectorAll('[data-language]').forEach(b=>b.classList.toggle('selected',b.dataset.language===l));
 if(pw.player)update(pw.player);
}
function markHomeChapter(n){document.querySelectorAll('#homeChapterDots button').forEach(b=>{const on=Number(b.dataset.dot)===n;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});try{sessionStorage.setItem('pw.homeChapter',String(n))}catch{}}
function showHomeChapter(n,smooth=true){n=Math.max(1,Math.min(12,Number(n)||1));const car=$('homeChapterCarousel'),slide=car?.querySelector('[data-home-chapter="'+n+'"]');if(!car||!slide)return;const left=Math.max(0,slide.offsetLeft-(car.clientWidth-slide.clientWidth)/2);car.scrollTo({left,behavior:smooth?'smooth':'auto'});markHomeChapter(n)}
function initHomeCarousel(){const car=$('homeChapterCarousel');if(!car)return;let timer;const sync=()=>{const center=car.scrollLeft+car.clientWidth/2;let best=1,dist=Infinity;car.querySelectorAll('[data-home-chapter]').forEach(s=>{const d=Math.abs(s.offsetLeft+s.clientWidth/2-center);if(d<dist){dist=d;best=Number(s.dataset.homeChapter)}});markHomeChapter(best)};car.addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(sync,80)},{passive:true});document.querySelectorAll('#homeChapterDots button').forEach(b=>b.onclick=()=>showHomeChapter(Number(b.dataset.dot)));car.querySelectorAll('[data-home-chapter]').forEach(s=>s.addEventListener('click',e=>{if(e.target.closest('a,button,input,label'))return;const n=Number(s.dataset.homeChapter);if(n)showHomeChapter(n)}));markHomeChapter(1);}
function showRequiredLanguagePicker(){if(getLang())return;const c=$('languageClose');if(c)c.hidden=true;open('languageModal')}

const RULES={
ru:`<h3>Цель игры</h3><p>Четыре изображения связаны одним словом. Собери его из предложенных букв.</p><h3>Главы</h3><p>Глава 1 «Разминка» — уровни 1–20. Глава 2 «Ассоциации» — уровни 21–50. Глава 3 «Связи» — уровни 51–90. Глава 4 «Глубина» — уровни 91–131. Глава 5 «Мастерство» — уровни 132–180. Глава 6 «Исследование» — уровни 181–230. Глава 7 «Цивилизация» — уровни 231–280. Глава 8 «Человек» — уровни 281–330. Глава 9 «Вселенная» — уровни 331–380. Главы 10–12 будут наполняться дальше.</p><h3>Подсказки</h3><p>💡 правильная буква — 50 🪙.<br>🪄 убрать до трёх лишних — 100 🪙.<br>Текстовая подсказка — 150 🪙.<br>🔀 перемешивание — бесплатно.</p><h3>Награды</h3><p>Первое прохождение уровня: +20 🪙 и +15 XP. Ежедневная награда: +5 🪙. Повторное прохождение уровня награду не даёт.</p><h3>XP и ранги</h3><p>0–399 Новичок · 400–1499 Знаток · 1500–2499 Эксперт · 2500–3999 Мастер · 4000+ Легенда.</p><h3>Друзья</h3><p>Если приглашённый игрок пройдёт 10 уровней, вы оба получите +20 🪙.</p>`,
en:`<h3>Goal</h3><p>Four images are connected by one word. Build it from the available letters.</p><h3>Chapters</h3><p>Chapter 1 “Warm-up” contains levels 1–20. Chapter 2 “Associations” contains levels 21–50. Chapter 3 “Connections” contains levels 51–90. Chapter 4 “Depth” contains levels 91–131. Chapter 5 “Mastery” contains levels 132–180. Chapter 6 “Exploration” contains levels 181–230. Chapter 7 “Civilization” contains levels 231–280. Chapter 8 “Human” contains levels 281–330. Chapter 9 “Universe” contains levels 331–380. Chapters 10–12 will be filled next.</p><h3>Hints</h3><p>💡 correct letter — 50 🪙.<br>🪄 remove up to three extra letters — 100 🪙.<br>Text hint — 150 🪙.<br>🔀 shuffle — free.</p><h3>Rewards</h3><p>First completion: +20 🪙 and +15 XP. Daily reward: +5 🪙. Replaying a level gives no extra reward.</p><h3>XP and ranks</h3><p>0–399 Novice · 400–1499 Skilled · 1500–2499 Expert · 2500–3999 Master · 4000+ Legend.</p><h3>Friends</h3><p>If your invited friend completes 10 levels, both of you receive +20 🪙.</p>`,
az:`<h3>Məqsəd</h3><p>Dörd şəkli bir söz birləşdirir. Həmin sözü verilən hərflərdən düzəlt.</p><h3>Fəsillər</h3><p>1-ci fəsil “İsinmə” — 1–20-ci səviyyələr. 2-ci fəsil “Assosiasiyalar” — 21–50-ci səviyyələr. 3-cü fəsil “Əlaqələr” — 51–90-cı səviyyələr. 4-cü fəsil “Dərinlik” — 91–131-ci səviyyələr. 5-ci fəsil “Ustalıq” — 132–180-ci səviyyələr. 6-cı fəsil “Araşdırma” — 181–230-cu səviyyələr. 7-ci fəsil “Sivilizasiya” — 231–280-ci səviyyələr. 8-ci fəsil “İnsan” — 281–330-cu səviyyələr. 9-cu fəsil “Kainat” — 331–380-ci səviyyələr. 10–12-ci fəsillər sonra doldurulacaq.</p><h3>İpucları</h3><p>💡 düzgün hərf — 50 🪙.<br>🪄 üçədək artıq hərfi silmək — 100 🪙.<br>Mətn ipucu — 150 🪙.<br>🔀 qarışdırmaq — pulsuz.</p><h3>Mükafatlar</h3><p>Səviyyəni ilk dəfə keçdikdə +20 🪙 və +15 XP. Gündəlik mükafat +5 🪙. Təkrar keçid əlavə mükafat vermir.</p><h3>XP və rütbələr</h3><p>0–399 Yeni başlayan · 400–1499 Bilici · 1500–2499 Ekspert · 2500–3999 Usta · 4000+ Əfsanə.</p><h3>Dostlar</h3><p>Dəvət etdiyin oyunçu 10 səviyyə keçdikdə hər ikiniz +20 🪙 alırsınız.</p>`
};
const RESET={
ru:'Будут удалены прохождение всех уровней, XP и позиция в рейтинге. Игра начнётся с уровня 1, язык нужно будет выбрать снова. Монеты, покупки Telegram Stars и история уже полученных наград сохраняются.',
en:'All completed levels, XP and leaderboard position will be removed. The game restarts from level 1 and you will choose the language again. Coins, Telegram Stars purchases and previously claimed reward history are kept.',
az:'Bütün keçilmiş səviyyələr, XP və reytinq mövqeyi silinəcək. Oyun 1-ci səviyyədən başlayacaq və dil yenidən seçiləcək. Sikkələr, Telegram Stars alışları və artıq alınmış mükafatların tarixçəsi saxlanılır.'
};

const initial=getLang();applyTheme(getTheme());initHomeCarousel();if(initial)applyLanguage(initial);else{applyLanguage('ru',false);setTimeout(showRequiredLanguagePicker,250)}

$('settingsBtn').onclick=()=>open('settingsModal');
$('languageBtn').onclick=()=>{close('settingsModal');const c=$('languageClose');if(c)c.hidden=false;setTimeout(()=>open('languageModal'),0)};
$('themeBtn').onclick=()=>{close('settingsModal');setTimeout(()=>open('themeModal'),0)};
document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{applyTheme(b.dataset.theme);track('theme_change',{metadata:{theme:b.dataset.theme}});close('themeModal')});
document.querySelectorAll('[data-language]').forEach(b=>b.onclick=()=>{applyLanguage(b.dataset.language);track('language_change',{metadata:{language:b.dataset.language}});close('languageModal');pw.status(b.dataset.language==='ru'?'Язык игры: Русский':b.dataset.language==='en'?'Game language: English':'Oyun dili: Azərbaycan dili')});
$('profileBtn').onclick=()=>open('profileModal');$('dailyRewardBtn').onclick=()=>open('dailyModal');$('shopOffer').onclick=()=>{track('shop_open');open('shopModal')};$('shopNav').onclick=()=>{track('shop_open');open('shopModal')};$('themesEntry').onclick=()=>{renderThemeHub(pw.player);screen('themesScreen');track('themes_open')};$('themesBack').onclick=()=>screen('home');$('themeDetailBack').onclick=()=>screen('themesScreen');document.querySelectorAll('[data-challenge]').forEach(b=>b.onclick=()=>openChallengeMode(b.dataset.challenge));
function chapterIdForLevel(level){
 const n=Number(level||1);
 return n<=20?1:n<=50?2:n<=90?3:n<=131?4:n<=180?5:n<=230?6:n<=280?7:n<=330?8:n<=380?9:10;
}
$('chaptersNav').onclick=()=>{track('chapter_open',{chapterId:chapterIdForLevel(pw.player?.current_level)});screen('chaptersScreen')};$('chaptersBack').onclick=()=>screen('home');$('homeNav').onclick=()=>screen('home');
$('rulesBtn').onclick=()=>{close('settingsModal');applyLanguage(lang());setTimeout(()=>open('rulesModal'),0)};
$('supportBtn').onclick=()=>{track('support_open');close('settingsModal');setTimeout(()=>open('supportModal'),0)};
$('openSupportChat').onclick=()=>{const url='https://t.me/PhotoWordBot?start=support';if(window.Telegram?.WebApp?.openTelegramLink)Telegram.WebApp.openTelegramLink(url);else location.href=url};
$('resetProgressBtn').onclick=()=>{close('settingsModal');resetArmed=false;text('confirmReset',t().resetButton);setTimeout(()=>open('resetModal'),0)};

$('nicknameBtn').onclick=()=>{if(pw.player?.nickname_changed)return;close('profileModal');$('nicknameInput').value='';open('nicknameModal')};
$('saveNickname').onclick=async()=>{const b=$('saveNickname'),value=$('nicknameInput').value.trim();b.disabled=true;try{const p=await pw.api('set_nickname',{nickname:value});update(p);close('nicknameModal');pw.sfx('success')}catch(e){pw.status(e.message)}finally{b.disabled=false}};
$('shareGameBtn').onclick=async()=>{const x=t(),link='https://t.me/PhotoWordBot?startapp=share',url='https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent(x.shareText);if(window.Telegram?.WebApp?.openTelegramLink)Telegram.WebApp.openTelegramLink(url);else location.href=url};

$('notificationsBtn').onclick=()=>{const tg=window.Telegram?.WebApp,x=t();if(!tg?.requestWriteAccess){pw.status(x.notifyNeedTelegram);return}tg.requestWriteAccess(ok=>{if(!ok){pw.status(x.notifyDenied);return}(async()=>{try{const p=await pw.api('enable_notifications',{language:lang()});try{localStorage.setItem('pw.writeAccess','1')}catch{};update(p);text('notificationsState',x.notifyAllowed);pw.status(x.notifyTestSent)}catch(e){pw.status(e.message)}})()})};
for(const [id,key] of [['soundToggle','sound'],['hapticToggle','haptic']]){$(id).checked=Boolean(pw.prefs[key]);$(id).onchange=()=>{pw.prefs[key]=$(id).checked;persistPrefs();if(key==='sound')pw.sfx('tap')}};
$('musicToggle').checked=Boolean(pw.prefs.music);$('musicToggle').onchange=()=>pw.setMusic($('musicToggle').checked);

let resetArmed=false,resetTimer=null,eraseArmed=false,eraseTimer=null;
$('eraseAccountBtn').onclick=()=>{close('settingsModal');eraseArmed=false;text('confirmEraseAccount',t().eraseButton);setTimeout(()=>open('eraseAccountModal'),0)};
$('confirmEraseAccount').onclick=async()=>{const b=$('confirmEraseAccount'),x=t();if(!eraseArmed){eraseArmed=true;b.textContent=x.eraseConfirm;clearTimeout(eraseTimer);eraseTimer=setTimeout(()=>{eraseArmed=false;b.textContent=x.eraseButton},5000);return}b.disabled=true;try{await pw.actionRequest('erase_account',{confirm:'ERASE',language:lang()});try{localStorage.clear();sessionStorage.clear()}catch{};close('eraseAccountModal');pw.status(x.eraseDone);setTimeout(()=>{try{window.Telegram?.WebApp?.close?.()}catch{}},900)}catch(e){pw.status(e.message);b.disabled=false;eraseArmed=false}};
$('confirmReset').onclick=async()=>{const b=$('confirmReset'),x=t();if(!resetArmed){resetArmed=true;b.textContent=x.confirmReset;clearTimeout(resetTimer);resetTimer=setTimeout(()=>{resetArmed=false;b.textContent=x.resetButton},5000);return}b.disabled=true;try{const p=await pw.api('reset_progress');try{for(let i=sessionStorage.length-1;i>=0;i--){const k=sessionStorage.key(i);if(k?.startsWith('pw.hints.'))sessionStorage.removeItem(k)}localStorage.removeItem('pw.language')}catch{};update(p);close('resetModal');pw.sfx('success');pw.status(x.resetDone);setTimeout(showRequiredLanguagePicker,350)}catch(e){pw.status(e.message)}finally{b.disabled=false;resetArmed=false}};

async function loadFriends(){const x=t();open('friendsModal');const list=$('friendsList');list.textContent=x.loading;try{const data=await pw.actionRequest('friends');text('friendsInvited',data.invited||0);text('friendsReward',(data.total_reward||0)+' 🪙');list.replaceChildren();if(!data.friends?.length){const p=document.createElement('p');p.className='muted';p.textContent=x.none;list.append(p);return}data.friends.forEach(f=>{const row=document.createElement('div');row.className='friendrow'+(f.rewarded?' rewarded':'');const who=document.createElement('div'),n=document.createElement('b'),sub=document.createElement('small');n.textContent=f.game_nickname||[f.first_name,f.last_name].filter(Boolean).join(' ')||f.photoword_id;sub.textContent=f.username?'@'+f.username:f.photoword_id;who.append(n,sub);const prog=document.createElement('div'),label=document.createElement('span'),track=document.createElement('em'),bar=document.createElement('i');prog.className='friendprogress';label.textContent=f.rewarded?x.rewardReceived:f.completed_levels+' / 10';bar.style.width=Math.min(100,(f.completed_levels||0)*10)+'%';track.append(bar);prog.append(label,track);row.append(who,prog);list.append(row)})}catch(e){list.textContent=e.message}}
$('friendsNav').onclick=loadFriends;
$('inviteFriend').onclick=async()=>{try{const p=await pw.login(),link='https://t.me/PhotoWordBot?startapp='+encodeURIComponent('ref_'+p.photoword_id),share='https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent(t().shareText);window.Telegram?.WebApp?.openTelegramLink?.(share)}catch(e){pw.status(e.message)}};

async function waitForStarCredit(before,coins){const x=t(),target=before+coins,delays=[700,1200,1800,2600,3600,5000];pw.status(x.paymentProcessing);for(const ms of delays){await new Promise(r=>setTimeout(r,ms));try{const p=await pw.login(true);if((p.coins||0)>=target){pw.sfx('coin');pw.status(x.paymentCredited);return true}}catch{}}pw.status(x.paymentPending);return false}
document.querySelectorAll('[data-pack]').forEach(b=>b.onclick=async()=>{if(b.disabled)return;b.disabled=true;try{const base=(pw.player||await pw.login()).coins||0;track('invoice_open',{metadata:{pack:b.dataset.pack}});const result=await pw.actionRequest('create_invoice',{pack:b.dataset.pack}),tg=window.Telegram?.WebApp;if(!tg?.openInvoice)throw new Error(t().notifyNeedTelegram);tg.openInvoice(result.invoice_url,status=>{b.disabled=false;track('payment_status',{metadata:{status,pack:b.dataset.pack}});if(status==='paid')waitForStarCredit(base,result.coins);else if(status==='pending'){pw.status(t().paymentPending);setTimeout(()=>pw.login(true).catch(()=>{}),2500)}else if(status==='failed')pw.status(t().paymentFailed);else if(status==='cancelled')pw.status(t().paymentCancelled)})}catch(e){pw.status(e.message);b.disabled=false}});

document.querySelectorAll('[data-energy-store-pack]').forEach(b=>b.onclick=async()=>{
 if(b.disabled)return;b.disabled=true;
 try{
  track('invoice_open',{metadata:{pack:b.dataset.energyStorePack,type:'energy'}});
  const result=await pw.actionRequest('create_energy_invoice',{pack:b.dataset.energyStorePack}),tg=window.Telegram?.WebApp;
  if(!tg?.openInvoice)throw new Error(t().shopNeedTelegram);
  tg.openInvoice(result.invoice_url,status=>{
    b.disabled=false;track('payment_status',{metadata:{status,pack:b.dataset.energyStorePack,type:'energy'}});
    if(status==='paid'){pw.sfx('coin');pw.status(t().energyCredited)}
    else if(status==='pending')pw.status(t().paymentPending);
    else if(status==='failed')pw.status(t().paymentFailed);
    else if(status==='cancelled')pw.status(t().paymentCancelled);
  });
 }catch(e){
  const m=String(e?.message||'');
  pw.status(m==='energy_full'?t().energyFullError:m);
  b.disabled=false;
 }
});

async function configureAds(){try{const r=await pw.actionRequest('public_config');publicConfig=r.config||{};const id=String(publicConfig.adsgram_reward_block_id||'').trim();if(id&&window.Adsgram&&!adController)adController=window.Adsgram.init({blockId:id,debug:false});text('watchAd',id?t().adWatch:t().adSetup);$('watchAd').disabled=!id}catch{$('watchAd').disabled=true}}
async function claimConfirmedAd(nonce){for(const delay of [300,700,1200,1800,2600,3600]){if(delay)await new Promise(r=>setTimeout(r,delay));try{return await pw.api('ad_claim',{nonce})}catch{}}throw new Error(t().adError)}
$('watchAd').onclick=async()=>{const b=$('watchAd'),x=t();if(b.disabled)return;b.disabled=true;try{const prep=await pw.actionRequest('ad_prepare');track('ad_open');if(!window.Adsgram)throw new Error(x.adError);if(!adController)adController=window.Adsgram.init({blockId:String(prep.block_id),debug:false});const result=await adController.show();if(!result?.done)throw new Error(x.adError);const p=await claimConfirmedAd(prep.nonce);track('ad_complete');update(p);pw.sfx('coin');pw.status(x.adRewarded)}catch(e){track('ad_error',{metadata:{message:String(e?.message||'ad').slice(0,80)}});pw.status(e?.message||x.adError)}finally{b.disabled=!publicConfig.adsgram_reward_block_id}};
$('claimDaily').onclick=async()=>{const x=t();try{const p=await pw.api('claim_daily');track('daily_claim');update(p);pw.sfx('coin');text('claimDaily',x.claimed);$('claimDaily').disabled=true;pw.status('+5 🪙');setTimeout(()=>close('dailyModal'),900)}catch(e){if(String(e.message)===x.alreadyDaily||String(e.message).toLowerCase().includes('already')||String(e.message).includes('уже')||String(e.message).includes('artıq')){text('claimDaily',x.claimed);$('claimDaily').disabled=true;pw.status(x.alreadyDaily)}else pw.status(e.message)}};

document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>close(b.dataset.close));
document.querySelectorAll('.modal').forEach(m=>m.onclick=e=>{if(e.target===m)close(m.id)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal').forEach(m=>m.hidden=true)});

$('ratingBack').onclick=()=>screen('home');let ratingReq=0;
async function rating(){const x=t();screen('ratingScreen');const id=++ratingReq,board=$('leaderboard');board.textContent=x.loading;try{if(pw.hasAuth)await pw.login().catch(e=>pw.status(e.message));const rows=await pw.leaderboard();if(id!==ratingReq)return;board.replaceChildren();if(!rows.length){board.textContent=x.noPlayers;return}rows.forEach(p=>{const row=document.createElement('div');row.className='rankrow'+(p.photoword_id===pw.player?.photoword_id?' me':'');const rank=document.createElement('b');rank.textContent='#'+p.rank;const person=document.createElement('div'),title=document.createElement('strong'),sub=document.createElement('small');title.textContent=pw.name(p);sub.textContent=p.photoword_id;person.append(title,sub);const xp=document.createElement('b');xp.textContent=p.xp+' XP';row.append(rank,person,xp);board.append(row)})}catch(e){board.textContent=e.message}}
['ratingNav','ratingShortcut','refreshRating'].forEach(id=>$(id).onclick=rating);

window.addEventListener('pw:player',e=>update(e.detail));
function showProfileSyncedOnce(){
 let shown=false;try{shown=sessionStorage.getItem('pw.profileSyncedShown')==='1';if(!shown)sessionStorage.setItem('pw.profileSyncedShown','1')}catch{}
 if(shown)return;
 const msg=t().profileSynced;pw.status(msg);
 setTimeout(()=>{const e=$('status');if(e&&!e.hidden&&e.textContent===msg){e.hidden=true;e.textContent=''}},1800);
}
pw.login().then(async()=>{showProfileSyncedOnce();track('app_open',{metadata:{version:'r78'}});configureAds();try{const start=window.Telegram?.WebApp?.initDataUnsafe?.start_param||'';if(start.startsWith('ref_PW-'))await pw.api('register_referral',{referrer:start.slice(4)})}catch{}}).catch(e=>pw.status(e.message));
})();