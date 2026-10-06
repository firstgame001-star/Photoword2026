(() => {
'use strict';
const $=id=>document.getElementById(id),pw=window.PW;
const text=(id,v)=>{const e=$(id);if(e)e.textContent=v};
const open=id=>{const e=$(id);if(!e)return;e.hidden=false;e.querySelector('button,input')?.focus()};
const close=id=>{const e=$(id);if(e)e.hidden=true;if(id==='purchaseTermsModal')finishPurchaseTerms(false);if(id==='eraseAccountModal'){eraseArmed=false;clearTimeout(eraseTimer);text('confirmEraseAccount',t().eraseButton)}};
const screen=id=>{document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('active',e.id===id));window.scrollTo(0,0)};
const getLang=()=>{try{return localStorage.getItem('pw.language')||''}catch{return''}};
const getTheme=()=>{try{return localStorage.getItem('pw.theme')||'game'}catch{return'game'}};
const lang=()=>getLang()||'ru';
const today=()=>new Date().toISOString().slice(0,10);
const track=(event,data={})=>pw.actionRequest('track_event',{event,language:lang(),...data}).catch(()=>{});
function flashStatus(message,ms=1800){
 pw.status(message,ms);
}
let publicConfig={},adController=null,adBusy=false,adPhase='',adLastError='',shopStatus=null,shopTimer=null;
window.addEventListener('pw:error',e=>track('server_error',{metadata:{code:String(e.detail?.code||'error'),status:Number(e.detail?.status||0)}}));
window.addEventListener('error',e=>track('client_error',{metadata:{message:String(e.message||'error').slice(0,120)}}));
window.addEventListener('unhandledrejection',e=>track('client_error',{metadata:{message:String(e.reason?.message||e.reason||'rejection').slice(0,120)}}));

const T={
ru:{
logo:['4','Ф','О','Т','О'],one:'1 СЛОВО',tagline:'Больше, чем просто слова',
chapter:n=>'Глава '+n,chapter1:'Разминка',chapter1Desc:'От простых слов к более сложным ассоциациям',chapter2:'Ассоциации',chapter2Desc:'Более сложные слова и связи между образами',chapter3:'Связи',chapter3Desc:'Новые сочетания и более тонкие ассоциации',chapter3Lock:'🔒 Пройди 50-й уровень',chapter4:'Глубина',chapter4Desc:'Больше уровней, систем и сложных связей',chapter4Lock:'🔒 Пройди 90-й уровень',chapter5:'Мастерство',chapter5Desc:'Новые формы, явления и более сложные ассоциации',chapter5Lock:'🔒 Пройди 130-й уровень',chapter6:'Исследование',chapter6Desc:'От природы и технологий к устройству мира',chapter6Lock:'🔒 Пройди 180-й уровень',chapter7:'Цивилизация',chapter7Desc:'Города, архитектура, общество и современная среда',chapter7Lock:'🔒 Пройди 230-й уровень',chapter8:'Человек',chapter8Desc:'Тело, чувства, характер и внутренний мир',chapter8Lock:'🔒 Пройди 280-й уровень',chapter9:'Вселенная',chapter9Desc:'Звёзды, космос, астрономия и полёты за пределы Земли',chapter9Lock:'🔒 Пройди 330-й уровень',chapter10:'Повседневность',chapter10Desc:'Дом, еда и привычные вещи',chapter10Lock:'🔒 Пройди 380-й уровень',chapter11:'Природа',chapter11Desc:'Ландшафты, растения и животные',chapter11Lock:'🔒 Пройди 430-й уровень',chapter12:'Современный мир',chapter12Desc:'Техника, дороги, искусство и профессии',chapter12Lock:'🔒 Пройди 480-й уровень',chapter13:'Открытия',chapter13Desc:'Необычные приборы, ориентиры и способы познавать мир',chapter13Lock:'🔒 Пройди 530-й уровень',chapter14:'Границы знаний',chapter14Desc:'Космос, природа и научные открытия',chapter14Lock:'🔒 Пройди 580-й уровень',chapter15:'Цифровая эпоха',chapter15Desc:'Устройства, программы и технологии вокруг нас',chapter15Lock:'🔒 Пройди 630-й уровень',future:'Скоро',futureDesc:'Новая глава готовится',futureState:'Закрыто',levels:'уровней',
play:'ИГРАТЬ',replay:'ПЕРЕИГРАТЬ',locked:'ЗАКРЫТО',allDone:'ВСЕ 15 ГЛАВ ПРОЙДЕНЫ',
home:'Главная',chapters:'Главы',chaptersSubtitle:'Выбирай главу и продолжай игру',rating:'Рейтинг',ratingSubtitle:'Рейтинг по XP · титулы и прогресс',overallRating:'🏆 Общий рейтинг',myPosition:'Твоя позиция',refresh:'Обновить рейтинг',
friends:'Друзья',shop:'Магазин',daily:'Ежедневная награда',tasks:'Задания',
settings:'Настройки',sound:'Звук',soundDesc:'Буквы, победа, ошибка и награды',vibration:'Вибрация',hapticDesc:'Нажатия, верный и неверный ответ',music:'Музыка',musicDesc:'Спокойная фоновая музыка',language:'Язык',notifications:'Уведомления',notifyAllow:'Выключены · Настроить',notifyAllowed:'Включены',notificationsTitle:'Уведомления',notificationsDesc:'Выбери, какие сообщения PhotoWord может отправлять в Telegram.',notificationsMasterLabel:'Уведомления',notificationsMasterDesc:'Главный переключатель сообщений от PhotoWord',notificationDailyLabel:'Ежедневная награда',notificationDailyDesc:'Напомнить, когда +5 🪙 снова доступны',notificationEnergyLabel:'Энергия восстановлена',notificationEnergyDesc:'Сообщить, когда энергия станет 5/5 ⚡',notificationChapterLabel:'Новая глава',notificationChapterDesc:'Сообщить, когда откроется следующая глава',notificationTimeNote:'Ежедневная награда — примерно в 10:00 по местному времени.',notificationSave:'СОХРАНИТЬ',notificationTest:'ОТПРАВИТЬ ТЕСТ',notificationSaved:'Настройки уведомлений сохранены.',notificationTestSent:'Тестовое уведомление отправлено в Telegram.',theme:'Тема',rules:'Правила игры',rulesDesc:'Как играть, монеты, XP и подсказки',support:'Поддержка',supportDesc:'Связаться с поддержкой',supportText:'Открой чат с ботом и отправь описание проблемы. Укажи режим, уровень и что произошло; можно приложить скриншот. По покупке — дату, пакет и чек Telegram. Не отправляй пароли и коды входа.',supportOpen:'НАПИСАТЬ В ПОДДЕРЖКУ',privacy:'Конфиденциальность',privacyDesc:'Какие данные используются и зачем',terms:'Пользовательское соглашение',reset:'Начать заново',resetDesc:'Полный сброс игры, достижений и рамок',
novice:'Новичок',skilled:'Знаток',expert:'Эксперт',master:'Мастер',legend:'Легенда',place:'место',unranked:'вне рейтинга',guestName:'Игрок',telegramLogin:'Вход в Telegram',profileRank:'Место',profileLevels:'Основных уровней',profilePrivacy:'Telegram ID не показывается в рейтинге.',profileLoginStatus:'Вход не выполнен',noUsername:'Telegram username не указан',profileProgressTitle:'Прогресс',profileChapters:'Глав завершено',profileThemeLevels:'Тематических уровней',profileThemesDone:'Тем завершено',profileChallenges:'Испытания',profileLimited:'Ограниченные',profileNoHint:'Без подсказок',profileBlitz:'Блиц · очки',profileBlitzStreak:'Блиц · серия',profileChallengeRuns:'Попыток',profileChallengeRewards:'Награды',profileStatsLoading:'Загружаю статистику…',profileStatsError:'Статистику испытаний загрузить не удалось.',
nicknameSet:'Установить игровой ник',nicknameDone:'Игровой ник установлен',nicknameTitle:'Игровой ник',nicknameText:'Можно установить только один раз. 3–16 символов: английские буквы, цифры и _.',save:'СОХРАНИТЬ',share:'Поделиться игрой',shareText:'Попробуй PhotoWord — 4 картинки, 1 слово!',
dailyCopy:'Заходи каждый день и забирай награду.',streak:'Серия',claim:'ПОЛУЧИТЬ',claimed:'Награда получена ✓',alreadyDaily:'Сегодня награда уже получена.',
taskTitle:'🎯 Задания дня',task1:'Пройди 1 уровень',task2:'Пройди 2 уровня',reward:'Награда',take:'ЗАБРАТЬ',tasksFoot:'Задания обновляются каждый день.',taskClaimed:'ПОЛУЧЕНО',
invite:'ПРИГЛАСИТЬ ДРУГА',invited:'Приглашено',earned:'Получено',inviteCondition:'Друг проходит 10 уровней — вы оба получаете +20 🪙.',invitedList:'Приглашённые',none:'Пока никого нет.',rewardReceived:'Награда получена',
coinShop:'Магазин',coinSection:'Монеты',energySection:'Энергия',energyMax:'Максимум 5/5 ⚡',energyFull:'До 5/5 ⚡',payStars:'Оплата через Telegram Stars ⭐',best:'ВЫГОДНО',shopBalanceLabel:'Баланс',shopEnergyLabel:'Энергия',shopAdsLabel:'Реклама',shopHistory:'История',shopHistoryEmpty:'Покупок и наград пока нет.',shopLoading:'Обновляю магазин…',shopAdsReady:'Доступно',shopAdsUnavailable:'Не подключено',shopAdsLimit:'Лимит на сегодня',shopEnergyFullShort:'Полная',shopEnergyNext:'Следующая через',historyCoins:'Монеты',historyEnergy:'Энергия',historyAd:'Реклама',historyFree:'Бесплатно',adLimitReached:'ЛИМИТ',adTitle:'Получить бесплатно',adText:'Посмотри рекламу и получи +5 🪙',soon:'СКОРО',adWatch:'СМОТРЕТЬ',adLoading:'ЗАГРУЗКА…',adPlaying:'ПРОСМОТР…',adChecking:'ПРОВЕРКА…',adTimeout:'AdsGram не ответил вовремя. Попробуй позже.',adPending:'Просмотр завершён, но подтверждение награды ещё не получено.',adCooldown:'Между попытками нужно подождать 2 минуты.',adSetup:'НЕДОСТУПНО',adUnavailableTitle:'Бесплатные монеты',adUnavailableText:'Реклама пока не подключена. Когда рекламный блок будет готов, здесь появится +5 🪙.',adRewarded:'+5 🪙 начислено за просмотр рекламы.',adError:'Рекламу не удалось показать. Попробуй позже.',chapter2Lock:'🔒 Пройди 20-й уровень',shopFoot:'Покупки начисляются после подтверждения платежа Telegram.',offerTitle:'Больше монет — больше возможностей!',offerText:'Открывай буквы, получай подсказки и проходи уровни',
themeTitle:'Тема',themeSubtitle:'Выберите оформление игры',themeNames:{game:'🎮 Игровая',night:'🌙 Ночная',light:'☀️ Светлая',neon:'⚡ Неон',gold:'👑 Золотая'},themeDesc:{game:'Текущая классическая тема',night:'Графит и приглушённые цвета',light:'Светлый фон и тёмный текст',neon:'Яркое свечение и контраст',gold:'Тёмный фон и золотые акценты'},
rulesTitle:'Правила игры',resetTitle:'Начать игру заново?',cancel:'Отмена',resetButton:'СБРОСИТЬ ПРОГРЕСС',confirmReset:'НАЖМИ ЕЩЁ РАЗ ДЛЯ ПОДТВЕРЖДЕНИЯ',eraseLabel:'Удалить аккаунт',eraseDesc:'Полное удаление профиля и игровых данных',eraseTitle:'Удалить аккаунт?',eraseText:'Будут безвозвратно удалены профиль, прогресс, монеты, XP, история покупок и наград. Это действие нельзя отменить.',eraseButton:'УДАЛИТЬ АККАУНТ',eraseConfirm:'НАЖМИ ЕЩЁ РАЗ ДЛЯ УДАЛЕНИЯ',eraseAfter:'Данные PhotoWord удалены. Закрой игру. При новом запуске через бота будет создан новый профиль. Удаление не отменяет платежи Telegram Stars.',eraseDone:'Аккаунт удалён.',
profileSynced:'Профиль синхронизирован',loading:'Загрузка…',noPlayers:'Пока нет игроков',notifyNeedTelegram:'Открой игру внутри Telegram, чтобы разрешить уведомления.',notifyGranted:'Уведомления разрешены.',notifyDenied:'Разрешение не предоставлено.',notifyTestSent:'Готово. Тестовое сообщение отправлено в Telegram.',paymentProcessing:'Платёж подтверждён. Начисляю монеты…',paymentCredited:'Монеты начислены ✓',energyCredited:'Энергия начислена ✓',energyFullError:'Энергия уже 5/5.',shopNeedTelegram:'Открой игру внутри Telegram, чтобы совершить покупку.',paymentPending:'Платёж обрабатывается. Монеты начислятся после подтверждения Telegram.',paymentFailed:'Оплата не прошла.',paymentCancelled:'Оплата отменена.',resetDone:'Прогресс сброшен. Выберите язык игры.'
},
en:{
logo:['4','P','I','C','S'],one:'1 WORD',tagline:'More than just words',
chapter:n=>'Chapter '+n,chapter1:'Warm-up',chapter1Desc:'From simple words to more challenging associations',chapter2:'Associations',chapter2Desc:'More challenging words and deeper image connections',chapter3:'Connections',chapter3Desc:'New combinations and subtler associations',chapter3Lock:'🔒 Complete level 50',chapter4:'Depth',chapter4Desc:'More levels, systems, and deeper connections',chapter4Lock:'🔒 Complete level 90',chapter5:'Mastery',chapter5Desc:'New forms, phenomena, and more advanced associations',chapter5Lock:'🔒 Complete level 130',chapter6:'Exploration',chapter6Desc:'From nature and technology to how the world works',chapter6Lock:'🔒 Complete level 180',chapter7:'Civilization',chapter7Desc:'Cities, architecture, society, and the modern environment',chapter7Lock:'🔒 Complete level 230',chapter8:'Human',chapter8Desc:'Body, emotions, character and the inner world',chapter8Lock:'🔒 Complete level 280',chapter9:'Universe',chapter9Desc:'Stars, space, astronomy and journeys beyond Earth',chapter9Lock:'🔒 Complete level 330',chapter10:'Everyday Life',chapter10Desc:'Home, food and familiar things',chapter10Lock:'🔒 Complete level 380',chapter11:'Nature',chapter11Desc:'Landscapes, plants and animals',chapter11Lock:'🔒 Complete level 430',chapter12:'Modern World',chapter12Desc:'Technology, journeys, arts and jobs',chapter12Lock:'🔒 Complete level 480',chapter13:'Discoveries',chapter13Desc:'Unusual devices, landmarks, and ways to explore the world',chapter13Lock:'🔒 Complete level 530',chapter14:'Frontiers of Knowledge',chapter14Desc:'Space, nature, and scientific discoveries',chapter14Lock:'🔒 Complete level 580',chapter15:'Digital Age',chapter15Desc:'Devices, software, and the technology around us',chapter15Lock:'🔒 Complete level 630',future:'Coming soon',futureDesc:'A new chapter is being prepared',futureState:'Locked',levels:'levels',
play:'PLAY',replay:'REPLAY',locked:'LOCKED',allDone:'ALL 15 CHAPTERS COMPLETED',
home:'Home',chapters:'Chapters',chaptersSubtitle:'Choose a chapter and continue',rating:'Leaderboard',ratingSubtitle:'XP ranking · titles and progress',overallRating:'🏆 Overall leaderboard',myPosition:'Your position',refresh:'Refresh leaderboard',
friends:'Friends',shop:'Shop',daily:'Daily reward',tasks:'Tasks',
settings:'Settings',sound:'Sound',soundDesc:'Letters, wins, mistakes and rewards',vibration:'Haptics',hapticDesc:'Taps, correct and wrong answers',music:'Music',musicDesc:'Calm background music',language:'Language',notifications:'Notifications',notifyAllow:'Off · Configure',notifyAllowed:'On',notificationsTitle:'Notifications',notificationsDesc:'Choose which PhotoWord messages may be sent to you in Telegram.',notificationsMasterLabel:'Notifications',notificationsMasterDesc:'Master switch for PhotoWord messages',notificationDailyLabel:'Daily reward',notificationDailyDesc:'Remind me when +5 🪙 is available again',notificationEnergyLabel:'Energy restored',notificationEnergyDesc:'Tell me when energy reaches 5/5 ⚡',notificationChapterLabel:'New chapter',notificationChapterDesc:'Tell me when the next chapter unlocks',notificationTimeNote:'Daily reward reminder arrives at about 10:00 local time.',notificationSave:'SAVE',notificationTest:'SEND TEST',notificationSaved:'Notification settings saved.',notificationTestSent:'Test notification sent in Telegram.',theme:'Theme',rules:'Game rules',rulesDesc:'How to play, coins, XP and hints',support:'Support',supportDesc:'Contact support',supportText:'Open the bot chat and describe the issue: mode, level and what happened. You can attach a screenshot. For purchases, include the date, pack and Telegram receipt. Do not send passwords or login codes.',supportOpen:'CONTACT SUPPORT',privacy:'Privacy',privacyDesc:'What data is used and why',terms:'Terms of use',reset:'Start over',resetDesc:'Reset the game, achievements and frames',
novice:'Novice',skilled:'Skilled',expert:'Expert',master:'Master',legend:'Legend',place:'place',unranked:'unranked',guestName:'Player',telegramLogin:'Sign in with Telegram',profileRank:'Place',profileLevels:'Main levels',profilePrivacy:'Telegram ID is not shown on the leaderboard.',profileLoginStatus:'Not signed in',noUsername:'Telegram username not set',profileProgressTitle:'Progress',profileChapters:'Chapters completed',profileThemeLevels:'Themed levels',profileThemesDone:'Themes completed',profileChallenges:'Challenges',profileLimited:'Limited',profileNoHint:'No hints',profileBlitz:'Blitz · score',profileBlitzStreak:'Blitz · streak',profileChallengeRuns:'Runs',profileChallengeRewards:'Rewards',profileStatsLoading:'Loading statistics…',profileStatsError:'Challenge statistics could not be loaded.',
nicknameSet:'Set game nickname',nicknameDone:'Game nickname set',nicknameTitle:'Game nickname',nicknameText:'You can set it only once. 3–16 characters: English letters, numbers and _.',save:'SAVE',share:'Share game',shareText:'Try PhotoWord — 4 pictures, 1 word!',
dailyCopy:'Come back every day and claim your reward.',streak:'Streak',claim:'CLAIM',claimed:'Reward claimed ✓',alreadyDaily:'Today’s reward has already been claimed.',
taskTitle:'🎯 Daily tasks',task1:'Complete 1 level',task2:'Complete 2 levels',reward:'Reward',take:'CLAIM',tasksFoot:'Tasks refresh every day.',taskClaimed:'CLAIMED',
invite:'INVITE A FRIEND',invited:'Invited',earned:'Earned',inviteCondition:'Your friend completes 10 levels — both of you get +20 🪙.',invitedList:'Invited friends',none:'No invited friends yet.',rewardReceived:'Reward received',
coinShop:'Shop',coinSection:'Coins',energySection:'Energy',energyMax:'Maximum 5/5 ⚡',energyFull:'Restore to 5/5 ⚡',payStars:'Payment via Telegram Stars ⭐',best:'BEST VALUE',shopBalanceLabel:'Balance',shopEnergyLabel:'Energy',shopAdsLabel:'Ads',shopHistory:'History',shopHistoryEmpty:'No purchases or rewards yet.',shopLoading:'Refreshing shop…',shopAdsReady:'Available',shopAdsUnavailable:'Not connected',shopAdsLimit:'Daily limit reached',shopEnergyFullShort:'Full',shopEnergyNext:'Next in',historyCoins:'Coins',historyEnergy:'Energy',historyAd:'Ad reward',historyFree:'Free',adLimitReached:'LIMIT',adTitle:'Get for free',adText:'Watch an ad and get +5 🪙',soon:'SOON',adWatch:'WATCH',adLoading:'LOADING…',adPlaying:'PLAYING…',adChecking:'CHECKING…',adTimeout:'The ad timed out. Please try again later.',adPending:'The ad ended, but reward confirmation has not arrived yet.',adCooldown:'Please wait 2 minutes between attempts.',adSetup:'UNAVAILABLE',adUnavailableTitle:'Free coins',adUnavailableText:'Ads are not connected yet. When the reward block is ready, +5 🪙 will appear here.',adRewarded:'+5 🪙 credited for watching the ad.',adError:'The ad could not be shown. Try again later.',chapter2Lock:'🔒 Complete level 20',shopFoot:'Purchases are credited after Telegram confirms the payment.',offerTitle:'More coins — more possibilities!',offerText:'Reveal letters, use hints and complete levels',
themeTitle:'Theme',themeSubtitle:'Choose the game appearance',themeNames:{game:'🎮 Game',night:'🌙 Night',light:'☀️ Light',neon:'⚡ Neon',gold:'👑 Gold'},themeDesc:{game:'Current classic theme',night:'Graphite and muted colors',light:'Light background and dark text',neon:'Bright glow and contrast',gold:'Dark background with gold accents'},
rulesTitle:'Game rules',resetTitle:'Start a new game?',cancel:'Cancel',resetButton:'RESET PROGRESS',confirmReset:'TAP AGAIN TO CONFIRM',eraseLabel:'Delete account',eraseDesc:'Permanently delete profile and game data',eraseTitle:'Delete account?',eraseText:'Your profile, progress, coins, XP, purchase history and rewards will be permanently deleted. This cannot be undone.',eraseButton:'DELETE ACCOUNT',eraseConfirm:'TAP AGAIN TO DELETE',eraseAfter:'Your PhotoWord data is deleted. Close the game. Opening it again from the bot creates a new profile. Deletion does not refund Telegram Stars payments.',eraseDone:'Account deleted.',
profileSynced:'Profile synced',loading:'Loading…',noPlayers:'No players yet',notifyNeedTelegram:'Open the game inside Telegram to enable notifications.',notifyGranted:'Notifications allowed.',notifyDenied:'Permission was not granted.',notifyTestSent:'Done. A test message was sent in Telegram.',paymentProcessing:'Payment confirmed. Crediting coins…',paymentCredited:'Coins credited ✓',energyCredited:'Energy credited ✓',energyFullError:'Energy is already 5/5.',shopNeedTelegram:'Open the game inside Telegram to make a purchase.',paymentPending:'Payment is processing. Coins will be credited after Telegram confirms it.',paymentFailed:'Payment failed.',paymentCancelled:'Payment cancelled.',resetDone:'Progress reset. Choose your game language.'
},
az:{
logo:['4','F','O','T','O'],one:'1 SÖZ',tagline:'Sadəcə sözlərdən daha çox',
chapter:n=>'Fəsil '+n,chapter1:'İsinmə',chapter1Desc:'Sadə sözlərdən daha çətin assosiasiyalara',chapter2:'Assosiasiyalar',chapter2Desc:'Daha çətin sözlər və şəkillər arasında daha dərin əlaqələr',chapter3:'Əlaqələr',chapter3Desc:'Yeni birləşmələr və daha incə assosiasiyalar',chapter3Lock:'🔒 50-ci səviyyəni keç',chapter4:'Dərinlik',chapter4Desc:'Daha çox səviyyə, sistem və daha dərin əlaqələr',chapter4Lock:'🔒 90-cı səviyyəni keç',chapter5:'Ustalıq',chapter5Desc:'Yeni formalar, hadisələr və daha çətin assosiasiyalar',chapter5Lock:'🔒 130-cu səviyyəni keç',chapter6:'Araşdırma',chapter6Desc:'Təbiət və texnologiyadan dünyanın quruluşuna doğru',chapter6Lock:'🔒 180-ci səviyyəni keç',chapter7:'Sivilizasiya',chapter7Desc:'Şəhərlər, memarlıq, cəmiyyət və müasir mühit',chapter7Lock:'🔒 230-cu səviyyəni keç',chapter8:'İnsan',chapter8Desc:'Bədən, hisslər, xarakter və daxili dünya',chapter8Lock:'🔒 280-ci səviyyəni keç',chapter9:'Kainat',chapter9Desc:'Ulduzlar, kosmos, astronomiya və Yerdən kənar uçuşlar',chapter9Lock:'🔒 330-cu səviyyəni keç',chapter10:'Gündəlik həyat',chapter10Desc:'Ev, yemək və tanış əşyalar',chapter10Lock:'🔒 380-ci səviyyəni keç',chapter11:'Təbiət',chapter11Desc:'Mənzərələr, bitkilər və heyvanlar',chapter11Lock:'🔒 430-cu səviyyəni keç',chapter12:'Müasir dünya',chapter12Desc:'Texnika, səfərlər, sənət və peşələr',chapter12Lock:'🔒 480-ci səviyyəni keç',chapter13:'Kəşflər',chapter13Desc:'Qeyri-adi cihazlar, istiqamətlər və dünyanı öyrənmək yolları',chapter13Lock:'🔒 530-cu səviyyəni keç',chapter14:'Bilik üfüqləri',chapter14Desc:'Kosmos, təbiət və elmi kəşflər',chapter14Lock:'🔒 580-ci səviyyəni keç',chapter15:'Rəqəmsal dövr',chapter15Desc:'Qurğular, proqramlar və gündəlik texnologiyalar',chapter15Lock:'🔒 630-cu səviyyəni keç',future:'Tezliklə',futureDesc:'Yeni fəsil hazırlanır',futureState:'Bağlıdır',levels:'səviyyə',
play:'OYNA',replay:'YENİDƏN OYNA',locked:'BAĞLIDIR',allDone:'BÜTÜN 15 FƏSİL TAMAMLANDI',
home:'Ana səhifə',chapters:'Fəsillər',chaptersSubtitle:'Fəsli seç və oyuna davam et',rating:'Reytinq',ratingSubtitle:'XP reytinqi · titullar və tərəqqi',overallRating:'🏆 Ümumi reytinq',myPosition:'Sənin yerin',refresh:'Reytinqi yenilə',
friends:'Dostlar',shop:'Mağaza',daily:'Gündəlik mükafat',tasks:'Tapşırıqlar',
settings:'Ayarlar',sound:'Səs',soundDesc:'Hərflər, qələbə, səhv və mükafat səsləri',vibration:'Vibrasiya',hapticDesc:'Toxunuş, düzgün və səhv cavab',music:'Musiqi',musicDesc:'Sakit fon musiqisi',language:'Dil',notifications:'Bildirişlər',notifyAllow:'Söndürülüb · Quraşdır',notifyAllowed:'Aktivdir',notificationsTitle:'Bildirişlər',notificationsDesc:'PhotoWord-un Telegram-da hansı mesajları göndərə biləcəyini seç.',notificationsMasterLabel:'Bildirişlər',notificationsMasterDesc:'PhotoWord mesajları üçün əsas keçid',notificationDailyLabel:'Gündəlik mükafat',notificationDailyDesc:'+5 🪙 yenidən hazır olduqda xatırlat',notificationEnergyLabel:'Enerji bərpa olundu',notificationEnergyDesc:'Enerji 5/5 ⚡ olduqda xəbər ver',notificationChapterLabel:'Yeni fəsil',notificationChapterDesc:'Növbəti fəsil açıldıqda xəbər ver',notificationTimeNote:'Gündəlik mükafat xatırlatması yerli vaxtla təxminən 10:00-da gəlir.',notificationSave:'YADDA SAXLA',notificationTest:'TEST GÖNDƏR',notificationSaved:'Bildiriş ayarları yadda saxlanıldı.',notificationTestSent:'Test bildirişi Telegram-a göndərildi.',theme:'Tema',rules:'Oyun qaydaları',rulesDesc:'Oyun, sikkələr, XP və ipucları',support:'Dəstək',supportDesc:'Dəstəklə əlaqə',supportText:'Bot çatını aç və problemi təsvir et: rejim, səviyyə və nə baş verib. Ekran görüntüsü əlavə edə bilərsən. Alış üçün tarix, paket və Telegram qəbzini göstər. Şifrə və giriş kodlarını göndərmə.',supportOpen:'DƏSTƏYƏ YAZ',privacy:'Məxfilik',privacyDesc:'Hansı məlumatların niyə istifadə edilməsi',terms:'İstifadəçi razılaşması',reset:'Yenidən başla',resetDesc:'Oyunu, nailiyyətləri və çərçivələri sıfırla',
novice:'Yeni başlayan',skilled:'Bilici',expert:'Ekspert',master:'Usta',legend:'Əfsanə',place:'yer',unranked:'reytinqdən kənar',guestName:'Oyunçu',telegramLogin:'Telegram ilə daxil ol',profileRank:'Yer',profileLevels:'Əsas səviyyələr',profilePrivacy:'Telegram ID reytinqdə göstərilmir.',profileLoginStatus:'Daxil olmayıb',noUsername:'Telegram username göstərilməyib',profileProgressTitle:'Tərəqqi',profileChapters:'Tamamlanan fəsillər',profileThemeLevels:'Mövzu səviyyələri',profileThemesDone:'Tamamlanan mövzular',profileChallenges:'Sınaqlar',profileLimited:'Məhdud',profileNoHint:'İpucusuz',profileBlitz:'Blits · xal',profileBlitzStreak:'Blits · seriya',profileChallengeRuns:'Cəhdlər',profileChallengeRewards:'Mükafatlar',profileStatsLoading:'Statistika yüklənir…',profileStatsError:'Sınaq statistikasını yükləmək olmadı.',
nicknameSet:'Oyun niki təyin et',nicknameDone:'Oyun niki təyin edilib',nicknameTitle:'Oyun niki',nicknameText:'Yalnız bir dəfə təyin etmək olar. 3–16 simvol: ingilis hərfləri, rəqəmlər və _.',save:'YADDA SAXLA',share:'Oyunu paylaş',shareText:'PhotoWord-u sına — 4 şəkil, 1 söz!',
dailyCopy:'Hər gün daxil ol və mükafatını götür.',streak:'Seriya',claim:'GÖTÜR',claimed:'Mükafat alındı ✓',alreadyDaily:'Bugünkü mükafat artıq alınıb.',
taskTitle:'🎯 Günün tapşırıqları',task1:'1 səviyyə keç',task2:'2 səviyyə keç',reward:'Mükafat',take:'GÖTÜR',tasksFoot:'Tapşırıqlar hər gün yenilənir.',taskClaimed:'ALINDI',
invite:'DOSTU DƏVƏT ET',invited:'Dəvət edilib',earned:'Qazanılıb',inviteCondition:'Dostun 10 səviyyə keçir — hər ikiniz +20 🪙 alırsınız.',invitedList:'Dəvət olunanlar',none:'Hələ dəvət olunan yoxdur.',rewardReceived:'Mükafat alındı',
coinShop:'Mağaza',coinSection:'Sikkələr',energySection:'Enerji',energyMax:'Maksimum 5/5 ⚡',energyFull:'5/5-ə qədər bərpa et ⚡',payStars:'Ödəniş Telegram Stars ilə ⭐',best:'SƏRFƏLİ',shopBalanceLabel:'Balans',shopEnergyLabel:'Enerji',shopAdsLabel:'Reklam',shopHistory:'Tarixçə',shopHistoryEmpty:'Hələ alış və mükafat yoxdur.',shopLoading:'Mağaza yenilənir…',shopAdsReady:'Mövcuddur',shopAdsUnavailable:'Qoşulmayıb',shopAdsLimit:'Günlük limit bitib',shopEnergyFullShort:'Doludur',shopEnergyNext:'Növbəti',historyCoins:'Sikkələr',historyEnergy:'Enerji',historyAd:'Reklam mükafatı',historyFree:'Pulsuz',adLimitReached:'LİMİT',adTitle:'Pulsuz əldə et',adText:'Reklama bax və +5 🪙 qazan',soon:'TEZLİKLƏ',adWatch:'BAX',adLoading:'YÜKLƏNİR…',adPlaying:'BAXIŞ…',adChecking:'YOXLANIR…',adTimeout:'Reklam vaxtında yüklənmədi. Sonra yenidən cəhd et.',adPending:'Baxış bitdi, amma mükafat təsdiqi hələ gəlməyib.',adCooldown:'Cəhdlər arasında 2 dəqiqə gözlə.',adSetup:'MÖVCUD DEYİL',adUnavailableTitle:'Pulsuz sikkələr',adUnavailableText:'Reklam hələ qoşulmayıb. Mükafat bloku hazır olduqda burada +5 🪙 görünəcək.',adRewarded:'Reklama baxdığın üçün +5 🪙 əlavə olundu.',adError:'Reklamı göstərmək mümkün olmadı. Sonra yenidən cəhd et.',chapter2Lock:'🔒 20-ci səviyyəni keç',shopFoot:'Alışlar Telegram ödənişi təsdiqlədikdən sonra əlavə olunur.',offerTitle:'Daha çox sikkə — daha çox imkan!',offerText:'Hərfləri aç, ipuclarından istifadə et və səviyyələri keç',
themeTitle:'Tema',themeSubtitle:'Oyunun görünüşünü seç',themeNames:{game:'🎮 Oyun',night:'🌙 Gecə',light:'☀️ İşıqlı',neon:'⚡ Neon',gold:'👑 Qızılı'},themeDesc:{game:'Klassik oyun mövzusu',night:'Qrafit və sakit rənglər',light:'Açıq fon və tünd mətn',neon:'Parlaq işıq və kontrast',gold:'Tünd fon və qızılı vurğular'},
rulesTitle:'Oyun qaydaları',resetTitle:'Oyuna yenidən başlansın?',cancel:'Ləğv et',resetButton:'TƏRƏQQİNİ SIFIRLA',confirmReset:'TƏSDİQ ÜÇÜN YENƏ TOXUN',eraseLabel:'Hesabı sil',eraseDesc:'Profili və oyun məlumatlarını tam sil',eraseTitle:'Hesab silinsin?',eraseText:'Profil, tərəqqi, sikkələr, XP, alış tarixçəsi və mükafatlar birdəfəlik silinəcək. Bu əməliyyatı geri qaytarmaq olmaz.',eraseButton:'HESABI SİL',eraseConfirm:'SİLMƏK ÜÇÜN YENƏ TOXUN',eraseAfter:'PhotoWord məlumatların silindi. Oyunu bağla. Botdan yenidən açdıqda yeni profil yaranacaq. Silinmə Telegram Stars ödənişlərini geri qaytarmır.',eraseDone:'Hesab silindi.',
profileSynced:'Profil sinxronlaşdırıldı',loading:'Yüklənir…',noPlayers:'Hələ oyunçu yoxdur',notifyNeedTelegram:'Bildirişləri aktivləşdirmək üçün oyunu Telegram daxilində açın.',notifyGranted:'Bildirişlərə icazə verildi.',notifyDenied:'İcazə verilmədi.',notifyTestSent:'Hazırdır. Telegram-da test mesajı göndərildi.',paymentProcessing:'Ödəniş təsdiqləndi. Sikkələr əlavə olunur…',paymentCredited:'Sikkələr əlavə olundu ✓',energyCredited:'Enerji əlavə olundu ✓',energyFullError:'Enerji artıq 5/5-dir.',shopNeedTelegram:'Alış etmək üçün oyunu Telegram daxilində aç.',paymentPending:'Ödəniş emal olunur. Telegram təsdiqlədikdən sonra sikkələr əlavə olunacaq.',paymentFailed:'Ödəniş uğursuz oldu.',paymentCancelled:'Ödəniş ləğv edildi.',resetDone:'Tərəqqi sıfırlandı. Oyun dilini seçin.'
}};
Object.assign(T.ru,{statsTitle:'Статистика',statsDesc:'Прогресс, испытания и дуэли',statsSubtitle:'Весь прогресс в одном месте',statsMain:'Основная игра',statsLevels:'Уровни',statsChapters:'Главы',statsXp:'Опыт',statsRank:'Место',statsThemes:'Тематические уровни',statsThemeLevels:'Пройдено уровней',statsThemesDone:'Завершено тем',statsChallenges:'Испытания',statsLimited:'Ограниченные',statsNoHint:'Без подсказок',statsBlitz:'Блиц',statsRuns:'Попыток',statsDuels:'Дуэли',statsPlayed:'Матчи',statsWins:'Победы',statsLosses:'Поражения',statsCoins:'Монеты',statsDuelMore:'ИСТОРИЯ ДУЭЛЕЙ ›',statsPartial:'Часть статистики не загрузилась. Открой экран ещё раз.'});
Object.assign(T.en,{statsTitle:'Statistics',statsDesc:'Progress, challenges and duels',statsSubtitle:'All your progress in one place',statsMain:'Main game',statsLevels:'Levels',statsChapters:'Chapters',statsXp:'XP',statsRank:'Rank',statsThemes:'Themed levels',statsThemeLevels:'Levels completed',statsThemesDone:'Themes completed',statsChallenges:'Challenges',statsLimited:'Limited',statsNoHint:'No hints',statsBlitz:'Blitz',statsRuns:'Runs',statsDuels:'Duels',statsPlayed:'Matches',statsWins:'Wins',statsLosses:'Losses',statsCoins:'Coins',statsDuelMore:'DUEL HISTORY ›',statsPartial:'Some statistics could not load. Open this screen again.'});
Object.assign(T.az,{statsTitle:'Statistika',statsDesc:'Tərəqqi, sınaqlar və duellər',statsSubtitle:'Bütün tərəqqin bir yerdə',statsMain:'Əsas oyun',statsLevels:'Səviyyələr',statsChapters:'Fəsillər',statsXp:'Təcrübə',statsRank:'Yer',statsThemes:'Mövzu səviyyələri',statsThemeLevels:'Keçilmiş səviyyələr',statsThemesDone:'Tamamlanan mövzular',statsChallenges:'Sınaqlar',statsLimited:'Məhdud',statsNoHint:'İpucusuz',statsBlitz:'Blits',statsRuns:'Cəhdlər',statsDuels:'Duellər',statsPlayed:'Oyunlar',statsWins:'Qələbələr',statsLosses:'Məğlubiyyətlər',statsCoins:'Sikkələr',statsDuelMore:'DUEL TARİXÇƏSİ ›',statsPartial:'Statistikanın bir hissəsi yüklənmədi. Ekranı yenidən aç.'});

const THEMES=['game','night','light','neon','gold'];
const THEME_CATEGORIES=[
 {id:'sport',icon:'⚽'},{id:'art',icon:'🎨'},{id:'professions',icon:'🧑‍💼'},{id:'travel',icon:'🌍'},
 {id:'science',icon:'🔬'},{id:'technology',icon:'💻'},{id:'cinema',icon:'🎬'},{id:'food',icon:'🍽️'},
 {id:'animals',icon:'🐾'},{id:'transport',icon:'🚗'},{id:'home',icon:'🏠'},{id:'nature',icon:'🌿'}
];
const THEME_MODE={
 ru:{title:'Темы',subtitle:'Выбери сферу и проходи отдельные уровни',entry:'Тематические уровни',entryBadge:'НОВЫЙ РЕЖИМ',entryDesc:'12 тем · 1200 уровней',unlock:'Тематические уровни откроются после 10-го уровня основной игры.',separate:'Прогресс тематических разделов будет считаться отдельно от основной игры.',detail:'Отдельный режим · 100 уровней',preparing:'Раздел создан на 100 уровней. Контент уровней будем добавлять постепенно.',levels:'уровней',cats:{
  sport:['Спорт','Игры, соревнования, инвентарь и достижения'],art:['Искусство','Живопись, музыка, сцена и творчество'],professions:['Профессии','Работа, специальности и инструменты'],travel:['Путешествия','Страны, дороги, отдых и приключения'],
  science:['Наука','Открытия, эксперименты и знания'],technology:['Технологии','Гаджеты, интернет и цифровой мир'],cinema:['Кино','Фильмы, съёмки, жанры и кинозалы'],food:['Еда','Продукты, блюда, кухня и вкусы'],
  animals:['Животные','Дикие и домашние животные'],transport:['Транспорт','Машины, поезда, самолёты и дороги'],home:['Дом и быт','Предметы, комнаты и повседневная жизнь'],nature:['Природа','Растения, погода, ландшафты и стихии']
 }},
 en:{title:'Themes',subtitle:'Choose a category and play separate levels',entry:'Themed levels',entryBadge:'NEW MODE',entryDesc:'12 themes · 1200 levels',unlock:'Themed levels unlock after level 10 of the main game.',separate:'Theme progress will be tracked separately from the main game.',detail:'Separate mode · 100 levels',preparing:'This category is structured for 100 levels. Level content will be added gradually.',levels:'levels',cats:{
  sport:['Sport','Games, competitions, gear and achievements'],art:['Art','Painting, music, stage and creativity'],professions:['Professions','Jobs, specialties and tools'],travel:['Travel','Countries, roads, holidays and adventures'],
  science:['Science','Discoveries, experiments and knowledge'],technology:['Technology','Gadgets, internet and the digital world'],cinema:['Cinema','Films, production, genres and screenings'],food:['Food','Products, dishes, cooking and flavors'],
  animals:['Animals','Wild and domestic animals'],transport:['Transport','Cars, trains, planes and roads'],home:['Home & everyday life','Rooms, objects and daily routines'],nature:['Nature','Plants, weather, landscapes and elements']
 }},
 az:{title:'Mövzular',subtitle:'Sahəni seç və ayrıca səviyyələri keç',entry:'Mövzu səviyyələri',entryBadge:'YENİ REJİM',entryDesc:'12 mövzu · 1200 səviyyə',unlock:'Mövzu səviyyələri əsas oyunun 10-cu səviyyəsindən sonra açılır.',separate:'Mövzu bölmələrinin tərəqqisi əsas oyundan ayrıca hesablanacaq.',detail:'Ayrı rejim · 100 səviyyə',preparing:'Bu bölmə 100 səviyyə üçün yaradılıb. Səviyyə məzmunu mərhələli əlavə olunacaq.',levels:'səviyyə',cats:{
  sport:['İdman','Oyunlar, yarışlar, inventar və nailiyyətlər'],art:['İncəsənət','Rəsm, musiqi, səhnə və yaradıcılıq'],professions:['Peşələr','İş, ixtisaslar və alətlər'],travel:['Səyahət','Ölkələr, yollar, istirahət və macəralar'],
  science:['Elm','Kəşflər, təcrübələr və biliklər'],technology:['Texnologiya','Qadcetlər, internet və rəqəmsal dünya'],cinema:['Kino','Filmlər, çəkilişlər, janrlar və kinozallar'],food:['Yemək','Məhsullar, yeməklər, mətbəx və dadlar'],
  animals:['Heyvanlar','Vəhşi və ev heyvanları'],transport:['Nəqliyyat','Maşınlar, qatarlar, təyyarələr və yollar'],home:['Ev və məişət','Əşyalar, otaqlar və gündəlik həyat'],nature:['Təbiət','Bitkilər, hava, landşaft və təbiət hadisələri']
 }}
};
const CHALLENGE_MODE={
 ru:{title:'Испытания',state:'НАГРАДЫ АКТИВНЫ',close:'ПОНЯТНО',modal:'Награды начисляются сервером. В каждом режиме оплачиваются до 3 результативных попыток в день.',modes:{limited:['🛡️','Ограниченные попытки','10 слов, 3 ошибки и энергия · награда от 4 правильных'],nohint:['🚫','Без подсказок','3 ошибки, никаких подсказок · награда за серию от 3'],blitz:['⚡','Блиц','60 секунд · награда от 5 очков, подсказки дороже']}},
 en:{title:'Challenges',state:'REWARDS ACTIVE',close:'GOT IT',modal:'Rewards are credited by the server. Up to 3 qualifying runs per mode are rewarded each day.',modes:{limited:['🛡️','Limited attempts','10 words, 3 mistakes and energy · rewards from 4 correct'],nohint:['🚫','No hints','3 mistakes, no hints · rewards from a streak of 3'],blitz:['⚡','Blitz','60 seconds · rewards from 5 points, pricier hints']}},
 az:{title:'Sınaqlar',state:'MÜKAFATLAR AKTİVDİR',close:'BAŞA DÜŞDÜM',modal:'Mükafatlar server tərəfindən hesablanır. Hər rejimdə gündə 3 nəticəli cəhd mükafatlandırılır.',modes:{limited:['🛡️','Məhdud cəhdlər','10 söz, 3 səhv və enerji · 4 düzgün sözdən mükafat'],nohint:['🚫','İpucusuz','3 səhv, ipucu yoxdur · 3-lük seriyadan mükafat'],blitz:['⚡','Blits','60 saniyə · 5 xaldan mükafat, ipucları daha bahadır']}}
};
function challengeMode(){return CHALLENGE_MODE[lang()]||CHALLENGE_MODE.ru}
function setChallengeLabels(){
 const m=challengeMode();
 text('challengeTitle',m.title);
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
const READY_THEME_IDS=['sport','art','professions','travel','science','technology','cinema','food','animals','transport','home','nature'];
function getThemeProgress(id){try{const raw=JSON.parse(localStorage.getItem('pw.themeProgress.'+id)||'[]');return new Set(Array.isArray(raw)?raw.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=100):[])}catch{return new Set()}}
function cacheThemeProgressMap(map){
 for(const id of READY_THEME_IDS){
  const levels=Array.isArray(map?.[id])?map[id].map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=100):[];
  try{localStorage.setItem('pw.themeProgress.'+id,JSON.stringify([...new Set(levels)].sort((a,b)=>a-b)))}catch{}
 }
}
async function syncThemeProgress(){
 if(!pw.hasAuth)return null;
 const result=await pw.actionRequest('theme_progress');
 cacheThemeProgressMap(result?.theme_progress||{});
 if(pw.player)renderThemeHub(pw.player);
 return result?.theme_progress||{};
}
function clearThemeProgressCache(){for(const id of READY_THEME_IDS)try{localStorage.removeItem('pw.themeProgress.'+id)}catch{}}
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
 const m=themeMode(),copy=m.cats[id]||[id,''],progress=getThemeProgress(id),done=progress.size,isReady=READY_THEME_IDS.includes(id);
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
 ru:{1:'Новичок',2:'Любитель',3:'Знаток',4:'Опытный',5:'Эксперт',6:'Профессионал',7:'Мастер',8:'Виртуоз',9:'Легенда',10:'Мастер слов',11:'Исследователь',12:'Хранитель знаний',13:'Первопроходец',14:'Новатор',15:'Визионер'},
 en:{1:'Novice',2:'Amateur',3:'Adept',4:'Experienced',5:'Expert',6:'Professional',7:'Master',8:'Virtuoso',9:'Legend',10:'Word Master',11:'Explorer',12:'Keeper of Knowledge',13:'Pioneer',14:'Innovator',15:'Visionary'},
 az:{1:'Yeni başlayan',2:'Həvəskar',3:'Bilici',4:'Təcrübəli',5:'Ekspert',6:'Peşəkar',7:'Usta',8:'Virtuoz',9:'Əfsanə',10:'Söz ustası',11:'Kəşfiyyatçı',12:'Bilik qoruyucusu',13:'İlk kəşf edən',14:'Yenilikçi',15:'Uzaqgörən'}
};
const MAIN_CHAPTERS=[
 {num:1,start:1,end:20,key:'chapter1'},{num:2,start:21,end:50,key:'chapter2'},{num:3,start:51,end:90,key:'chapter3'},
 {num:4,start:91,end:130,key:'chapter4'},{num:5,start:131,end:180,key:'chapter5'},{num:6,start:181,end:230,key:'chapter6'},
 {num:7,start:231,end:280,key:'chapter7'},{num:8,start:281,end:330,key:'chapter8'},{num:9,start:331,end:380,key:'chapter9'},
 {num:10,start:381,end:430,key:'chapter10'},{num:11,start:431,end:480,key:'chapter11'},{num:12,start:481,end:530,key:'chapter12'},{num:13,start:531,end:580,key:'chapter13'},{num:14,start:581,end:630,key:'chapter14'},{num:15,start:631,end:680,key:'chapter15'}
].map(ch=>({...ch,total:ch.end-ch.start+1}));
function completedChapterCount(p){
 const explicit=Array.isArray(p?.completed_chapters)?p.completed_chapters.length:Number(p?.completed_chapters);
 if(Number.isFinite(explicit)&&explicit>0)return Math.max(0,Math.min(15,Math.floor(explicit)));
 const done=Number(p?.completed_levels||0);return MAIN_CHAPTERS.filter(ch=>done>=ch.end).length;
}
function earnedChapterTitle(p){const n=completedChapterCount(p);return n?(CHAPTER_TITLES[lang()]||CHAPTER_TITLES.ru)[n]||'': ''}
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
 const range=(ch.num===1?0:ch.start)+'–'+ch.end;
 text(base+'Label',x.chapter(ch.num)+' · '+range);
 text(base+'Title',x[ch.key]);text(base+'Desc',x[ch.key+'Desc']);
 text(base+'Done',range);text(base+'Count',x.levels);
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
}
function updateHomeCarousel(p){
 const x=t();for(const ch of MAIN_CHAPTERS)renderMainChapterCard(p,x,ch,'homeChapter');
}
let profileStatsRequest=0;
function resetProfileStats(){
 const x=t();
 text('profileProgressTitle',x.profileProgressTitle);text('profileChallengesTitle',x.profileChallenges);
 text('profileChaptersLabel',x.profileChapters);text('profileThemeDoneLabel',x.profileThemeLevels);text('profileThemesCompleteLabel',x.profileThemesDone);
 text('profileLimitedLabel',x.profileLimited);text('profileNoHintLabel',x.profileNoHint);text('profileBlitzLabel',x.profileBlitz);text('profileBlitzStreakLabel',x.profileBlitzStreak);
 for(const id of ['profileThemeDone','profileThemesComplete','profileLimitedBest','profileNoHintBest','profileBlitzBest','profileBlitzStreak'])text(id,'—');
 text('profileChapters',completedChapterCount(pw.player||{})+'/12');
 text('profileStatsStatus',x.profileStatsLoading);
}
function renderProfileStats(stats){
 const x=t(),challenge=stats?.challenge||{};
 text('profileChapters',completedChapterCount(pw.player||{})+'/12');
 text('profileThemeDone',Number(stats?.theme_levels_completed||0)+'/1200');
 text('profileThemesComplete',Number(stats?.themes_completed||0)+'/'+Number(stats?.themes_total||12));
 text('profileLimitedBest',Number(challenge.limited_best_score||0)+'/10');
 text('profileNoHintBest',Number(challenge.nohint_best_streak||0));
 text('profileBlitzBest',Number(challenge.blitz_best_score||0));
 text('profileBlitzStreak',Number(challenge.blitz_best_streak||0));
 text('profileStatsStatus',x.profileChallengeRuns+': '+Number(challenge.runs_total||0)+' · '+x.profileChallengeRewards+': +'+Number(challenge.reward_coins||0)+' 🪙 · +'+Number(challenge.reward_xp||0)+' XP');
}
function applyStatsLabels(){const x=t(),ids={statsEntryTitle:x.statsTitle,statsEntryDesc:x.statsDesc,statsTitle:x.statsTitle,statsSubtitle:x.statsSubtitle,statsMainTitle:x.statsMain,statsMainLevelsLabel:x.statsLevels,statsChaptersLabel:x.statsChapters,statsXpLabel:x.statsXp,statsRankLabel:x.statsRank,statsThemeTitle:x.statsThemes,statsThemeLevelsLabel:x.statsThemeLevels,statsThemesLabel:x.statsThemesDone,statsChallengeTitle:x.statsChallenges,statsLimitedLabel:x.statsLimited,statsNoHintLabel:x.statsNoHint,statsBlitzLabel:x.statsBlitz,statsRunsLabel:x.statsRuns,statsDuelTitle:x.statsDuels,statsDuelPlayedLabel:x.statsPlayed,statsDuelWinsLabel:x.statsWins,statsDuelLossesLabel:x.statsLosses,statsDuelNetLabel:x.statsCoins,statsDuelMore:x.statsDuelMore};for(const [id,value] of Object.entries(ids))text(id,value)}
let statsRequestId=0;
async function openStatsScreen(){screen('statsScreen');applyStatsLabels();const request=++statsRequestId,p=pw.player||{};
 text('statsMainLevels',Number(p.completed_levels||0)+'/680');text('statsChapters',completedChapterCount(p)+'/15');text('statsXp',Number(p.xp||0));text('statsRank',p.rank>0?'#'+p.rank:'—');
 for(const id of ['statsThemeLevels','statsThemes','statsLimited','statsNoHint','statsBlitz','statsRuns','statsDuelPlayed','statsDuelWins','statsDuelLosses','statsDuelNet'])text(id,'—');text('statsStatus',t().profileStatsLoading);
 if(!pw.hasAuth){text('statsStatus',t().profileStatsError);return}
 try{const current=await pw.login();if(request!==statsRequestId||!$('statsScreen').classList.contains('active'))return;text('statsMainLevels',Number(current.completed_levels||0)+'/680');text('statsChapters',completedChapterCount(current)+'/15');text('statsXp',Number(current.xp||0));text('statsRank',current.rank>0?'#'+current.rank:'—')}catch(e){if(request===statsRequestId)text('statsStatus',e.message);return}
 const [profile,duels]=await Promise.allSettled([pw.actionRequest('profile_stats'),pw.duelRequest('statistics')]);
 if(request!==statsRequestId||!$('statsScreen').classList.contains('active'))return;
 if(profile.status==='fulfilled'){const s=profile.value.stats||{},c=s.challenge||{};text('statsThemeLevels',Number(s.theme_levels_completed||0)+'/1200');text('statsThemes',Number(s.themes_completed||0)+'/'+Number(s.themes_total||12));text('statsLimited',Number(c.limited_best_score||0)+'/10');text('statsNoHint',Number(c.nohint_best_streak||0));text('statsBlitz',Number(c.blitz_best_score||0));text('statsRuns',Number(c.runs_total||0))}
 if(duels.status==='fulfilled'){const s=duels.value.stats||{},net=Number(s.net_coins||0);text('statsDuelPlayed',Number(s.played||0));text('statsDuelWins',Number(s.wins||0));text('statsDuelLosses',Number(s.losses||0));text('statsDuelNet',(net>0?'+':'')+net+' 🪙')}
 text('statsStatus',profile.status==='rejected'||duels.status==='rejected'?t().statsPartial:'');
}
function showStatsScreen(){screen('statsScreen')}
window.PWStats={show:showStatsScreen};
$('statsEntry').onclick=openStatsScreen;$('statsBack').onclick=()=>screen('home');$('statsDuelMore').onclick=()=>window.PWDuelStats?.openFromStats();
async function openProfile(){
 open('profileModal');resetProfileStats();const req=++profileStatsRequest;
 if(!pw.hasAuth){text('profileStatsStatus',t().profileStatsError);return}
 try{const data=await pw.actionRequest('profile_stats');if(req===profileStatsRequest)renderProfileStats(data?.stats||{});}
 catch{if(req===profileStatsRequest)text('profileStatsStatus',t().profileStatsError);}
}
function update(p){
 const x=t(),name=pw.name(p),rank=p.rank>0?'#'+p.rank:'—';
 text('shopBalance',p.coins??0);
 const chapterTitle=earnedChapterTitle(p);
 text('name',name);text('profileName',name);text('rankLabel',(chapterTitle?chapterTitle+' · ':'')+(p.rank>0?x.place+' #'+p.rank:x.unranked));text('profileRank',rank);
 text('profileTitle',chapterTitle);if($('profileTitle'))$('profileTitle').hidden=!chapterTitle;
 text('photoWordId',p.photoword_id);text('profileXp',p.xp);text('profileDone',p.completed_levels);text('profileUsername',p.username?'@'+p.username:x.noUsername);
 for(const id of ['avatar','profileAvatar'])text(id,(name||'P').charAt(0).toUpperCase());text('myRank',rank);text('myXp',p.xp+' XP · '+(chapterTitle?chapterTitle+' · ':'')+p.completed_levels+' '+x.levels);
 text('nicknameBtn',p.nickname_changed?x.nicknameDone:x.nicknameSet);$('nicknameBtn').disabled=Boolean(p.nickname_changed);
 updateHomeCarousel(p);updateChapterCards(p);renderThemeHub(p);
 const claimed=String(p.last_daily_reward||'')===today();$('claimDaily').disabled=claimed;text('claimDaily',claimed?x.claimed:x.claim);text('dailyStreak',x.streak+': '+(p.daily_streak||0));text('notificationsState',p.notifications_enabled?x.notifyAllowed:x.notifyAllow);
}
function applyLanguage(l,persist=true){
 if(!T[l])l='ru';if(persist){try{localStorage.setItem('pw.language',l)}catch{}}document.documentElement.lang=l;const x=T[l];setLogo(x);setThemeHubLabels();setChallengeLabels();window.PWAchievements?.labels?.();window.PWFrames?.labels?.();window.PWDaily?.labels();window.PWProfile?.labels();
 const nav=document.querySelectorAll('nav small');[x.home,x.chapters,x.rating,x.friends,x.shop].forEach((v,i)=>{if(nav[i])nav[i].textContent=v});document.querySelectorAll('#homeChapterDots button').forEach(dot=>dot.setAttribute('aria-label',x.chapter(Number(dot.dataset.dot))));
 applyStatsLabels();text('chaptersTitle',x.chapters);text('homeChaptersTitle',x.chapters);text('homeChapterHint',l==='en'?'SWIPE BETWEEN CHAPTERS':l==='az'?'FƏSİLLƏRİ SÜRÜŞDÜR':'ЛИСТАЙ ВЛЕВО И ВПРАВО');text('chaptersSubtitle',x.chaptersSubtitle);text('ratingTitle',x.rating);text('ratingSubtitle',x.ratingSubtitle);text('ratingLeague',x.overallRating);text('myPositionLabel',x.myPosition);text('refreshRating',x.refresh);
 text('settingsTitle',x.settings);const rows=document.querySelectorAll('#settingsModal .settingrow b');if(rows[0])rows[0].textContent=x.sound;if(rows[1])rows[1].textContent=x.vibration;if(rows[2])rows[2].textContent=x.music;
 text('soundDesc',x.soundDesc);text('hapticDesc',x.hapticDesc);text('musicDesc',x.musicDesc);$('languageBtn').querySelector('b').textContent=x.language;$('notificationsBtn').querySelector('b').textContent=x.notifications;text('notificationsState',pw.player?.notifications_enabled?x.notifyAllowed:x.notifyAllow);text('notificationsTitle',x.notificationsTitle);text('notificationsDesc',x.notificationsDesc);text('notificationsMasterLabel',x.notificationsMasterLabel);text('notificationsMasterDesc',x.notificationsMasterDesc);text('notificationDailyLabel',x.notificationDailyLabel);text('notificationDailyDesc',x.notificationDailyDesc);text('notificationEnergyLabel',x.notificationEnergyLabel);text('notificationEnergyDesc',x.notificationEnergyDesc);text('notificationChapterLabel',x.notificationChapterLabel);text('notificationChapterDesc',x.notificationChapterDesc);text('notificationTimeNote',x.notificationTimeNote);text('saveNotifications',x.notificationSave);text('testNotification',x.notificationTest);$('themeBtn').querySelector('b').textContent=x.theme;
 $('rulesBtn').querySelector('b').textContent=x.rules;$('rulesBtn').querySelector('small').textContent=x.rulesDesc;$('supportBtn').querySelector('b').textContent=x.support;text('supportTitle',x.support);text('supportDesc',x.supportDesc);text('supportText',x.supportText);text('openSupportChat',x.supportOpen);text('openPaymentSupport',({ru:'ПРОБЛЕМА С ПОКУПКОЙ',en:'PURCHASE SUPPORT',az:'ALIŞLA BAĞLI DƏSTƏK'})[l]);$('privacyLink').querySelector('b').textContent=x.privacy;$('privacyLink').querySelector('small').textContent=x.privacyDesc;$('termsLink').querySelector('b').textContent=x.terms;$('resetProgressBtn').querySelector('b').textContent=x.reset;$('resetProgressBtn').querySelector('small').textContent=x.resetDesc;text('eraseAccountLabel',x.eraseLabel);text('eraseAccountDesc',x.eraseDesc);
 text('profileRankLabel',x.profileRank);text('photoWordId',x.profileLoginStatus);text('myXp',x.profileLoginStatus);text('nicknameBtn',x.nicknameSet);text('profileDoneLabel',x.profileLevels);text('profilePrivacyNote',x.profilePrivacy);text('profileProgressTitle',x.profileProgressTitle);text('profileChallengesTitle',x.profileChallenges);text('profileChaptersLabel',x.profileChapters);text('profileThemeDoneLabel',x.profileThemeLevels);text('profileThemesCompleteLabel',x.profileThemesDone);text('profileLimitedLabel',x.profileLimited);text('profileNoHintLabel',x.profileNoHint);text('profileBlitzLabel',x.profileBlitz);text('profileBlitzStreakLabel',x.profileBlitzStreak);text('nicknameTitle',x.nicknameTitle);text('nicknameText',x.nicknameText);text('saveNickname',x.save);text('shareGameBtn',x.share);
 text('friendsInvited',document.getElementById('friendsInvited')?.textContent||'0');const fs=document.querySelectorAll('.friendstats small');if(fs[0])fs[0].textContent=x.invited;if(fs[1])fs[1].textContent=x.earned;text('friendsCondition',x.inviteCondition);text('inviteFriend',x.invite);$('friendsModal').querySelector('h2').textContent=x.friends;$('invitedHeading').textContent=x.invitedList;window.PWDuelFriends?.labels();if($('friendsEmpty'))text('friendsEmpty',x.none);
 text('shopTitle',x.coinShop);text('coinShopSectionTitle',x.coinSection);text('energyShopSectionTitle',x.energySection);text('energyShopNote',x.energyMax);text('energyFullLabel',x.energyFull);text('shopPayNote',x.payStars);text('shopBalanceLabel',x.shopBalanceLabel);text('shopEnergyLabel',x.shopEnergyLabel);text('shopAdsLabel',x.shopAdsLabel);text('shopHistoryTitle',x.shopHistory);const best=$('shopModal').querySelector('.best i');if(best)best.textContent=x.best;text('adTitle',x.adTitle);text('adText',x.adText);text('watchAd',publicConfig.adsgram_reward_block_id?x.adWatch:x.adSetup);text('shopFootnote',x.shopFoot);const offer=$('shopOffer');if(offer){offer.querySelector('b').textContent=x.offerTitle;offer.querySelector('small').textContent=x.offerText;}if(shopStatus)renderShopStatus(shopStatus);
 $('dailyModal').querySelector('h2').textContent=x.daily;text('dailyCopy',x.dailyCopy);
 const shortcuts=document.querySelectorAll('.shortcuts button b');if(shortcuts[0])shortcuts[0].textContent=x.daily;if(shortcuts[1])shortcuts[1].textContent=x.rating;
 text('rulesTitle',x.rulesTitle);$('rulesBody').innerHTML=RULES[l]||RULES.ru;const guide=GUIDE[l]||GUIDE.ru;text('rulesIntro',guide.intro);text('rulesDone',guide.done);text('rulesWelcomeTitle',guide.title);text('rulesWelcomeText',guide.text);text('rulesWelcomeRead',guide.read);text('rulesWelcomeSkip',guide.skip);text('homeRulesOpen',guide.link);text('resetTitle',x.resetTitle);text('resetBody',RESET[l]||RESET.ru);text('cancelReset',x.cancel);text('confirmReset',x.resetButton);text('eraseAccountTitle',x.eraseTitle);text('eraseAccountText',x.eraseText);text('confirmEraseAccount',x.eraseButton);text('cancelEraseAccount',x.cancel);
 setThemeLabels(x);text('themeCurrent',x.themeNames[getTheme()]);text('languageCurrent',l==='ru'?'Русский':l==='en'?'English':'Azərbaycan dili');document.querySelectorAll('[data-language]').forEach(b=>b.classList.toggle('selected',b.dataset.language===l));
 if(pw.player)update(pw.player);
 else{text('name',x.guestName);text('profileName',x.guestName);text('rankLabel',x.telegramLogin);const initial=x.guestName.charAt(0).toUpperCase();text('avatar',initial);text('profileAvatar',initial);const guest={current_level:1,completed_levels:0};updateHomeCarousel(guest);updateChapterCards(guest)}
}
function markHomeChapter(n){text('homeChapterPosition',String(n).padStart(2,'0')+' / 15');document.querySelectorAll('#homeChapterDots button').forEach(b=>{const on=Number(b.dataset.dot)===n;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});try{sessionStorage.setItem('pw.homeChapter',String(n))}catch{}}
function showHomeChapter(n,smooth=true){n=Math.max(1,Math.min(15,Number(n)||1));const car=$('homeChapterCarousel'),slide=car?.querySelector('[data-home-chapter="'+n+'"]');if(!car||!slide)return;const left=Math.max(0,slide.offsetLeft-(car.clientWidth-slide.clientWidth)/2);car.scrollTo({left,behavior:smooth?'smooth':'auto'});markHomeChapter(n)}
function initHomeCarousel(){const car=$('homeChapterCarousel');if(!car)return;let timer;const sync=()=>{const center=car.scrollLeft+car.clientWidth/2;let best=1,dist=Infinity;car.querySelectorAll('[data-home-chapter]').forEach(s=>{const d=Math.abs(s.offsetLeft+s.clientWidth/2-center);if(d<dist){dist=d;best=Number(s.dataset.homeChapter)}});markHomeChapter(best)};car.addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(sync,80)},{passive:true});document.querySelectorAll('#homeChapterDots button').forEach(b=>b.onclick=()=>showHomeChapter(Number(b.dataset.dot)));car.querySelectorAll('[data-home-chapter]').forEach(s=>s.addEventListener('click',e=>{if(e.target.closest('a,button,input,label'))return;const n=Number(s.dataset.homeChapter);if(n)showHomeChapter(n)}));markHomeChapter(1);}
function showRequiredLanguagePicker(){if(getLang())return;const c=$('languageClose');if(c)c.hidden=true;open('languageModal')}

const GUIDE={ru:{intro:'Всё, что нужно для первого раунда',done:'ПОНЯТНО',title:'Добро пожаловать в PhotoWord',text:'Четыре эмодзи скрывают одно слово. Хочешь узнать о подсказках, наградах и режимах перед игрой?',read:'ПРОЧИТАТЬ ПРАВИЛА',skip:'НАЧАТЬ ИГРАТЬ',link:'Как играть ›'},en:{intro:'Everything you need for your first round',done:'GOT IT',title:'Welcome to PhotoWord',text:'Four emoji hide one word. Want to learn about hints, rewards and game modes before playing?',read:'READ THE RULES',skip:'START PLAYING',link:'How to play ›'},az:{intro:'İlk oyun üçün lazım olan hər şey',done:'BAŞA DÜŞDÜM',title:'PhotoWord-a xoş gəldin',text:'Dörd emoji bir sözü gizlədir. Başlamazdan əvvəl ipucları, mükafatlar və rejimlər haqqında oxumaq istəyirsən?',read:'QAYDALARI OXU',skip:'OYUNA BAŞLA',link:'Necə oynamaq olar ›'}};
const RULES={"ru": "<section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">🧩</span><div><h3>Одно слово — четыре подсказки</h3><p>Посмотри на четыре эмодзи и найди общее слово. Нажимай на буквы, чтобы собрать ответ. Чтобы убрать букву, нажми на неё в строке ответа.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">📚</span><div><h3>Главы и темы</h3><p>В основной игре 15 глав и 680 уровней. Проходи уровни по порядку — следующая глава откроется после предыдущей. В темах выбирай интересующую область: их прогресс сохраняется отдельно.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">💡</span><div><h3>Если слово не находится</h3><p>Перемешать буквы можно бесплатно. В главах: открыть правильную букву — 50 монет, убрать до трёх лишних — 100, текстовая подсказка — 150. В других режимах смотри цену на кнопке перед покупкой.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">☀️</span><div><h3>Загадка дня</h3><p>Каждый день — одно общее для всех задание из банка на 365 дней. Собери слово и нажми «Ответить»: только отправка полного ответа расходует попытку. Доступны 3 попытки в день. Правильный ответ приносит 25 монет, без XP, и закрывает загадку. После третьей ошибки она тоже закрывается. Новое задание и три попытки появятся, когда закончится таймер. Очистка и перемешивание бесплатны; попытки общие на всех твоих устройствах.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">⚡</span><div><h3>Испытания</h3><p>«Ограниченные попытки»: 10 слов и максимум 3 ошибки, награда от 4 правильных ответов. «Без подсказок»: максимум 3 ошибки, награда за серию от 3. «Блиц»: 60 секунд, награда от 5 очков. В каждом режиме оплачиваются до 3 результативных прохождений в день.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">⚔️</span><div><h3>Дуэли</h3><p>Создай комнату или присоединись к сопернику. У обоих одинаковые задания и 60 секунд. Каждый вносит указанное число монет. Победитель получает 90% общего банка; при ничьей взносы возвращаются.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">🪙</span><div><h3>Награды и прогресс</h3><p>Первое прохождение основного уровня: 20 монет и 15 XP. Ежедневная награда: 5 монет. Повторное прохождение уже оплаченного уровня не даёт новой награды. XP повышают ранг; статистика показывает твои результаты. За приглашённого друга, прошедшего 10 основных уровней, вы оба получите по 20 монет. Выполняй цели в разделе «Достижения»: доступно 120 целей, а монетную награду нужно забрать вручную.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">↻</span><div><h3>Полный сброс</h3><p>Это полный новый старт. Удалятся главы и темы, XP и место в рейтинге, результаты и история испытаний и дуэлей, загадки дня и серии, достижения и рамки. Монеты вернутся к 250, энергия — к 5/5. Игровой ник и настройки сбросятся; язык и правила появятся снова. Telegram-аккаунт, контакты друзей и история оплат сохраняются. Во время активной дуэли сначала дождись её завершения.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">ℹ️</span><div><h3>Темы и энергия</h3><p>Первое прохождение тематического уровня даёт 15 монет и 10 XP. «Ограниченные попытки» расходуют 1 энергию; максимум 5, одна восстанавливается за 30 минут. Блиц: верный ответ добавляет 3 секунды, ошибка отнимает 3.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">ℹ️</span><div><h3>Дуэль: пропуски и связь</h3><p>Взнос — от 25 до 500 монет. У каждого 3 бесплатных пропуска; «Сбросить буквы» очищает ответ. Реакции не влияют на счёт. До входа соперника комнату можно отменить и вернуть взнос. Перезагрузка восстанавливает матч, но таймер на сервере продолжает идти.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">ℹ️</span><div><h3>Покупки, поддержка и удаление</h3><p>Покупки начисляются после подтверждения Telegram. При проблеме не плати повторно — используй поддержку покупок и приложи чек. Реклама добровольная: +5 монет только после подтверждения просмотра, до 10 раз в день. В настройках доступны поддержка, политика и удаление аккаунта. Удаление необратимо и не возвращает Stars.</p></div></section>", "en": "<section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">🧩</span><div><h3>Four clues. One word.</h3><p>Find the word connecting four emoji. Tap letters to build your answer. Tap a letter in the answer row to remove it.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">📚</span><div><h3>Chapters and themes</h3><p>The main game has 15 chapters and 680 levels. Complete levels in order to unlock the next chapter. Choose a topic in Themes; theme progress is saved separately.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">💡</span><div><h3>Need a clue?</h3><p>Shuffling is free. In chapters: reveal a correct letter for 50 coins, remove up to three extra letters for 100, or get a text hint for 150. In other modes, check the button price before buying.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">☀️</span><div><h3>Daily puzzle</h3><p>Everyone gets the same puzzle each day, from a 365-day bank. Build a word and tap Submit: only submitting a full answer uses an attempt. You have 3 attempts per day. A correct answer gives 25 coins, no XP, and closes the puzzle. Three wrong answers also close it. The timer shows when a new puzzle and three attempts arrive. Clearing and shuffling are free; attempts are shared across your devices.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">⚡</span><div><h3>Challenges</h3><p>Limited attempts: 10 words, up to 3 mistakes; rewards from 4 correct answers. No hints: up to 3 mistakes; rewards from a streak of 3. Blitz: 60 seconds; rewards from 5 points. Up to 3 qualifying runs per mode receive rewards each day.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">⚔️</span><div><h3>Duels</h3><p>Create or join a room. Both players get the same puzzles and 60 seconds. Each pays the displayed entry amount. The winner receives 90% of the total pot; a draw refunds both entries.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">🪙</span><div><h3>Rewards and progress</h3><p>First completion of a main level: 20 coins and 15 XP. Daily reward: 5 coins. Replaying a rewarded level gives no new reward. XP raises your rank; Statistics shows your results. When an invited friend completes 10 main levels, both of you receive 20 coins. Complete goals in Achievements: 120 goals are available, and coin rewards must be claimed manually.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">↻</span><div><h3>Full reset</h3><p>This starts a new game. Chapters, themes, XP, ranking, challenge and duel results and history, daily puzzles and streaks, achievements and frames are reset. Coins return to 250 and energy to 5/5. Your game nickname and settings reset; language selection and rules appear again. Your Telegram account, friend contacts and payment records remain. Finish an active duel before resetting.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">ℹ️</span><div><h3>Themes and energy</h3><p>First completion of a theme level gives 15 coins and 10 XP. Limited attempts uses 1 energy; maximum 5, with one restored every 30 minutes. In Blitz a correct answer adds 3 seconds and a mistake removes 3.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">ℹ️</span><div><h3>Duel skips and connection</h3><p>Entry ranges from 25 to 500 coins. Each player has 3 free skips; Clear letters resets the answer. Reactions do not change the score. Cancel before an opponent joins to refund your entry. Reload restores your match while the server timer keeps running.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">ℹ️</span><div><h3>Purchases, support and deletion</h3><p>Purchases are credited after Telegram confirmation. Do not pay twice for a missing purchase: use purchase support and attach the receipt. Ads are optional: +5 coins after confirmed completion, up to 10 times daily. Settings includes support, privacy and account deletion. Deletion is irreversible and does not refund Stars.</p></div></section>", "az": "<section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">🧩</span><div><h3>Dörd ipucu — bir söz</h3><p>Dörd emojini birləşdirən sözü tap. Cavabı qurmaq üçün hərflərə toxun. Hərfi silmək üçün cavab sətrində həmin hərfə toxun.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">📚</span><div><h3>Fəsillər və mövzular</h3><p>Əsas oyunda 15 fəsil və 680 səviyyə var. Növbəti fəsli açmaq üçün əvvəlkini tamamla. Mövzularda maraqlandığın sahəni seç; tərəqqi ayrıca saxlanılır.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">💡</span><div><h3>İpucu lazımdır?</h3><p>Hərfləri qarışdırmaq pulsuzdur. Fəsillərdə düzgün hərfi açmaq 50, üçədək artıq hərfi silmək 100, mətn ipucusu 150 sikkədir. Digər rejimlərdə alışdan əvvəl düymədəki qiymətə bax.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">☀️</span><div><h3>Günün tapmacası</h3><p>365 günlük bankdan hər gün hamıya eyni tapmaca verilir. Sözü qur və «Cavab ver» düyməsinə toxun: yalnız tam cavab göndərmək cəhdi sərf edir. Gündə 3 cəhd var. Düzgün cavab 25 sikkə verir, XP vermir və tapmacanı bağlayır. Üç səhv cavabdan sonra da tapmaca bağlanır. Taymer bitdikdə yeni tapmaca və üç cəhd açılır. Təmizləmək və qarışdırmaq pulsuzdur; cəhdlər bütün cihazlarında ortaqdır.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">⚡</span><div><h3>Sınaqlar</h3><p>Məhdud cəhdlər: 10 söz və ən çox 3 səhv; 4 düzgün cavabdan mükafat. İpucusuz: ən çox 3 səhv; 3-lük düzgün cavab seriyasından mükafat. Blits: 60 saniyə; 5 xaldan mükafat. Hər rejimdə gündə 3 nəticəli oyun mükafatlandırılır.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">⚔️</span><div><h3>Duellər</h3><p>Otaq yarat və ya rəqibə qoşul. Hər iki oyunçuya eyni tapmacalar və 60 saniyə verilir. Hər oyunçu göstərilən məbləği ödəyir. Qalib ümumi bankın 90%-ni alır; heç-heçədə ödənişlər qaytarılır.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">🪙</span><div><h3>Mükafatlar və tərəqqi</h3><p>Əsas səviyyəni ilk dəfə keçdikdə 20 sikkə və 15 XP verilir. Gündəlik mükafat 5 sikkədir. Ödənilmiş səviyyəni təkrar keçmək yeni mükafat vermir. XP rütbəni artırır; nəticələr Statistika bölməsindədir. Dəvət etdiyin dost 10 əsas səviyyəni keçdikdə hər ikiniz 20 sikkə alırsınız. Nailiyyətlər bölməsindəki məqsədləri yerinə yetir: 120 məqsəd mövcuddur, sikkə mükafatını əl ilə götürmək lazımdır.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">↻</span><div><h3>Tam sıfırlama</h3><p>Bu, oyuna tam yenidən başlamaqdır. Fəsillər, mövzular, XP, reytinq, sınaq və duel nəticələri və tarixçəsi, günün tapmacaları və seriyalar, nailiyyətlər və çərçivələr sıfırlanır. Sikkələr 250, enerji 5/5 olur. Oyun niki və ayarlar sıfırlanır; dil seçimi və qaydalar yenidən görünür. Telegram hesabı, dost əlaqələri və ödəniş qeydləri qalır. Aktiv dueli bitirdikdən sonra sıfırla.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">ℹ️</span><div><h3>Mövzular və enerji</h3><p>Mövzu səviyyəsini ilk dəfə keçmək 15 sikkə və 10 XP verir. Məhdud cəhdlər 1 enerji sərf edir; maksimum 5-dir, hər 30 dəqiqədə biri bərpa olunur. Blitsdə düzgün cavab 3 saniyə əlavə edir, səhv 3 saniyə çıxır.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">ℹ️</span><div><h3>Dueldə ötürmə və əlaqə</h3><p>Giriş 25–500 sikkədir. Hər oyunçunun 3 pulsuz ötürməsi var; Hərfləri təmizlə cavabı sıfırlayır. Reaksiyalar xalı dəyişmir. Rəqib qoşulmazdan əvvəl otağı ləğv etmək ödənişi qaytarır. Yenidən yükləmə matçı bərpa edir, server taymeri isə davam edir.</p></div></section><section class=\"rule-section\"><span class=\"rule-icon\" aria-hidden=\"true\">ℹ️</span><div><h3>Alışlar, dəstək və silinmə</h3><p>Alış Telegram təsdiqindən sonra verilir. Alış görünmürsə təkrar ödəmə: alış dəstəyinə qəbzi göndər. Reklam könüllüdür: təsdiqlənmiş baxışdan +5 sikkə, gündə ən çox 10 dəfə. Ayarlarda dəstək, məxfilik və hesabın silinməsi var. Silinmə geri qaytarılmır və Stars qaytarmır.</p></div></section>"};const RESET={"ru": "Это полный новый старт. Удалятся главы и темы, XP и место в рейтинге, результаты и история испытаний и дуэлей, загадки дня и серии, достижения и рамки. Монеты вернутся к 250, энергия — к 5/5. Игровой ник и настройки сбросятся; язык и правила появятся снова. Telegram-аккаунт, контакты друзей и история оплат сохраняются. Во время активной дуэли сначала дождись её завершения.", "en": "This starts a new game. Chapters, themes, XP, ranking, challenge and duel results and history, daily puzzles and streaks, achievements and frames are reset. Coins return to 250 and energy to 5/5. Your game nickname and settings reset; language selection and rules appear again. Your Telegram account, friend contacts and payment records remain. Finish an active duel before resetting.", "az": "Bu, oyuna tam yenidən başlamaqdır. Fəsillər, mövzular, XP, reytinq, sınaq və duel nəticələri və tarixçəsi, günün tapmacaları və seriyalar, nailiyyətlər və çərçivələr sıfırlanır. Sikkələr 250, enerji 5/5 olur. Oyun niki və ayarlar sıfırlanır; dil seçimi və qaydalar yenidən görünür. Telegram hesabı, dost əlaqələri və ödəniş qeydləri qalır. Aktiv dueli bitirdikdən sonra sıfırla."};

const initial=getLang();applyTheme(getTheme());initHomeCarousel();if(initial)applyLanguage(initial);else{applyLanguage('ru',false);setTimeout(showRequiredLanguagePicker,250)}

$('settingsBtn').onclick=()=>open('settingsModal');
$('languageBtn').onclick=()=>{close('settingsModal');const c=$('languageClose');if(c)c.hidden=false;setTimeout(()=>open('languageModal'),0)};
$('themeBtn').onclick=()=>{close('settingsModal');setTimeout(()=>open('themeModal'),0)};
document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{applyTheme(b.dataset.theme);track('theme_change',{metadata:{theme:b.dataset.theme}});close('themeModal')});
document.querySelectorAll('[data-language]').forEach(b=>b.onclick=()=>{const firstChoice=!getLang();applyLanguage(b.dataset.language);track('language_change',{metadata:{language:b.dataset.language}});close('languageModal');if(firstChoice)setTimeout(()=>open('rulesWelcomeModal'),0);pw.status(b.dataset.language==='ru'?'Язык игры: Русский':b.dataset.language==='en'?'Game language: English':'Oyun dili: Azərbaycan dili')});
$('profileBtn').onclick=openProfile;$('dailyRewardBtn').onclick=()=>open('dailyModal');$('shopOffer').onclick=openShop;$('shopNav').onclick=openShop;$('themesEntry').onclick=()=>{renderThemeHub(pw.player);screen('themesScreen');track('themes_open')};$('themesBack').onclick=()=>screen('home');$('themeDetailBack').onclick=()=>screen('themesScreen');document.querySelectorAll('[data-challenge]').forEach(b=>b.onclick=()=>openChallengeMode(b.dataset.challenge));
function chapterIdForLevel(level){
 const n=Number(level||1);
 return n<=20?1:n<=50?2:n<=90?3:n<=130?4:n<=180?5:n<=230?6:n<=280?7:n<=330?8:n<=380?9:n<=430?10:n<=480?11:n<=530?12:n<=580?13:n<=630?14:15;
}
$('chaptersNav').onclick=()=>{track('chapter_open',{chapterId:chapterIdForLevel(pw.player?.current_level)});screen('chaptersScreen')};$('chaptersBack').onclick=()=>screen('home');$('homeNav').onclick=()=>screen('home');
let purchaseTermsAccepted=false,purchaseTermsPending=null,purchaseTermsResolve=null;
function finishPurchaseTerms(accepted){if(!purchaseTermsResolve)return;purchaseTermsAccepted=accepted;$('purchaseTermsModal').hidden=true;const resolve=purchaseTermsResolve;purchaseTermsResolve=null;purchaseTermsPending=null;resolve(accepted)}
window.PWPurchaseTerms=()=>{
 if(purchaseTermsAccepted)return Promise.resolve(true);if(purchaseTermsPending)return purchaseTermsPending;
 const l=lang(),c={ru:['Перед покупкой','Монеты и энергия используются только в игре. Начисление — после подтверждения Telegram. Вопросы о покупке: /paysupport. Ознакомься с соглашением перед оплатой.','Пользовательское соглашение','ПРИНИМАЮ УСЛОВИЯ','ОТМЕНА'],en:['Before purchasing','Coins and energy are for game use. Credits follow Telegram confirmation. Purchase questions: /paysupport. Read the terms before paying.','Terms of Use','I ACCEPT THE TERMS','CANCEL'],az:['Alışdan əvvəl','Sikkə və enerji yalnız oyunda istifadə olunur. Əlavə etmə Telegram təsdiqindən sonra olur. Alış sualları: /paysupport. Ödənişdən əvvəl razılaşmanı oxu.','İstifadəçi razılaşması','ŞƏRTLƏRİ QƏBUL EDİRƏM','LƏĞV ET']}[l];
 ['purchaseTermsTitle','purchaseTermsText','purchaseTermsLink','purchaseTermsAgree','purchaseTermsCancel'].forEach((id,i)=>text(id,c[i]));$('purchaseTermsLink').href='./terms.html?lang='+l;
 purchaseTermsPending=new Promise(resolve=>purchaseTermsResolve=resolve);open('purchaseTermsModal');return purchaseTermsPending;
};
$('purchaseTermsAgree').onclick=()=>finishPurchaseTerms(true);$('purchaseTermsCancel').onclick=()=>finishPurchaseTerms(false);
$('rulesDone').onclick=()=>close('rulesModal');$('rulesWelcomeSkip').onclick=()=>close('rulesWelcomeModal');$('rulesWelcomeRead').onclick=()=>{close('rulesWelcomeModal');open('rulesModal')};$('homeRulesOpen').onclick=()=>{applyLanguage(lang());open('rulesModal')};
$('rulesBtn').onclick=()=>{close('settingsModal');applyLanguage(lang());setTimeout(()=>open('rulesModal'),0)};
$('supportBtn').onclick=()=>{track('support_open');close('settingsModal');setTimeout(()=>open('supportModal'),0)};
function supportChat(kind='support'){const url='https://t.me/PhotoWordBot?start='+kind+'_'+lang();if(window.Telegram?.WebApp?.openTelegramLink)Telegram.WebApp.openTelegramLink(url);else location.href=url}
$('openSupportChat').onclick=()=>supportChat();$('openPaymentSupport').onclick=()=>supportChat('paysupport');
$('resetProgressBtn').onclick=()=>{close('settingsModal');resetArmed=false;text('confirmReset',t().resetButton);setTimeout(()=>open('resetModal'),0)};

$('nicknameBtn').onclick=()=>{if(pw.player?.nickname_changed)return;close('profileModal');$('nicknameInput').value='';open('nicknameModal')};
$('saveNickname').onclick=async()=>{const b=$('saveNickname'),value=$('nicknameInput').value.trim();b.disabled=true;try{const p=await pw.api('set_nickname',{nickname:value});update(p);close('nicknameModal');pw.sfx('success')}catch(e){pw.status(e.message)}finally{b.disabled=false}};
$('shareGameBtn').onclick=async()=>{const x=t(),link='https://t.me/PhotoWordBot?startapp=share',url='https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent(x.shareText);if(window.Telegram?.WebApp?.openTelegramLink)Telegram.WebApp.openTelegramLink(url);else location.href=url};

let notificationState=null;
function paintNotificationState(s){
 notificationState=s||{enabled:false,daily_reward:true,energy_full:true,chapter_unlocked:true};
 $('notificationsMaster').checked=Boolean(notificationState.enabled);
 $('notificationDaily').checked=notificationState.daily_reward!==false;
 $('notificationEnergy').checked=notificationState.energy_full!==false;
 $('notificationChapter').checked=notificationState.chapter_unlocked!==false;
 $('testNotification').disabled=!notificationState.enabled;
}
async function loadNotificationState(){
 try{const r=await pw.actionRequest('notification_state');notificationState=r.notifications||{};paintNotificationState(notificationState);return notificationState}
 catch(e){pw.status(e.message);paintNotificationState({enabled:Boolean(pw.player?.notifications_enabled),daily_reward:true,energy_full:true,chapter_unlocked:true});return notificationState}
}
async function openNotifications(){close('settingsModal');open('notificationsModal');paintNotificationState({enabled:Boolean(pw.player?.notifications_enabled),daily_reward:true,energy_full:true,chapter_unlocked:true});await loadNotificationState()}
$('notificationsBtn').onclick=openNotifications;
$('saveNotifications').onclick=async()=>{
 const x=t(),b=$('saveNotifications'),enabled=$('notificationsMaster').checked,tg=window.Telegram?.WebApp;
 const save=async()=>{
  b.disabled=true;
  try{
   const tz=-new Date().getTimezoneOffset();
   const r=await pw.actionRequest('update_notifications',{enabled,dailyReward:$('notificationDaily').checked,energyFull:$('notificationEnergy').checked,chapterUnlocked:$('notificationChapter').checked,timezoneOffsetMinutes:tz,language:lang()});
   notificationState=r.notifications||{};paintNotificationState(notificationState);
   if(enabled){try{localStorage.setItem('pw.writeAccess','1')}catch{}}else{try{localStorage.removeItem('pw.writeAccess')}catch{}}
   const p=await pw.login(true);update(p);pw.status(x.notificationSaved);
  }catch(e){pw.status(e.message)}finally{b.disabled=false}
 };
 if(enabled&&!pw.player?.notifications_enabled){
  if(!tg?.requestWriteAccess){pw.status(x.notifyNeedTelegram);return}
  tg.requestWriteAccess(ok=>{if(!ok){pw.status(x.notifyDenied);return}save()});
 }else save();
};
$('testNotification').onclick=async()=>{const x=t(),b=$('testNotification');if(b.disabled)return;b.disabled=true;try{await pw.actionRequest('test_notification',{language:lang()});pw.status(x.notificationTestSent)}catch(e){pw.status(e.message)}finally{b.disabled=!notificationState?.enabled}};

for(const [id,key] of [['soundToggle','sound'],['hapticToggle','haptic']]){$(id).checked=Boolean(pw.prefs[key]);$(id).onchange=()=>{pw.prefs[key]=$(id).checked;persistPrefs();if(key==='sound')pw.sfx('tap')}};
$('musicToggle').checked=Boolean(pw.prefs.music);$('musicToggle').onchange=()=>pw.setMusic($('musicToggle').checked);

let resetArmed=false,resetTimer=null,eraseArmed=false,eraseTimer=null;
$('eraseAccountBtn').onclick=()=>{close('settingsModal');eraseArmed=false;text('confirmEraseAccount',t().eraseButton);setTimeout(()=>open('eraseAccountModal'),0)};
$('confirmEraseAccount').onclick=async()=>{const b=$('confirmEraseAccount'),x=t();if(!eraseArmed){eraseArmed=true;b.textContent=x.eraseConfirm;clearTimeout(eraseTimer);eraseTimer=setTimeout(()=>{eraseArmed=false;b.textContent=x.eraseButton},5000);return}b.disabled=true;try{await pw.actionRequest('erase_account',{confirm:'ERASE',language:lang()});pw.endDeletedSession();clearTimeout(eraseTimer);eraseArmed=false;document.querySelectorAll('.modal').forEach(e=>e.hidden=true);const panel=document.createElement('main');panel.className='legal-wrap';const card=document.createElement('article');card.className='legal-card';const title=document.createElement('h1');title.textContent=x.eraseDone;const note=document.createElement('p');note.textContent=x.eraseAfter;const link=document.createElement('a');link.className='play';link.href='https://t.me/PhotoWordBot';link.textContent='@PhotoWordBot';card.append(title,note,link);panel.append(card);for(const e of document.body.children)e.hidden=true;document.body.append(panel);setTimeout(()=>{try{window.Telegram?.WebApp?.close?.()}catch{}},900)}catch(e){pw.status(e.message);b.disabled=false;eraseArmed=false;clearTimeout(eraseTimer);b.textContent=x.eraseButton}};
$('confirmReset').onclick=async()=>{const b=$('confirmReset'),x=t();if(!resetArmed){resetArmed=true;b.textContent=x.confirmReset;clearTimeout(resetTimer);resetTimer=setTimeout(()=>{resetArmed=false;b.textContent=x.resetButton},5000);return}b.disabled=true;try{const p=await pw.api('reset_progress');pw.clearProgressStorage();try{localStorage.setItem('pw.generation.'+p.photoword_id,String(p.progress_generation||0))}catch{}location.replace('./index.html?restart='+Number(p.progress_generation||0)+location.hash)}catch(e){pw.status(e.message)}finally{b.disabled=false;resetArmed=false}};

async function loadFriends(){const x=t();open('friendsModal');window.PWDuelFriends?.refresh();const list=$('friendsList');list.textContent=x.loading;try{const data=await pw.actionRequest('friends');text('friendsInvited',data.invited||0);text('friendsReward',(data.total_reward||0)+' 🪙');list.replaceChildren();if(!data.friends?.length){const p=document.createElement('p');p.className='muted';p.textContent=x.none;list.append(p);return}data.friends.forEach(f=>{const row=document.createElement('div');row.className='friendrow'+(f.rewarded?' rewarded':'');const who=document.createElement('div'),n=document.createElement('b'),sub=document.createElement('small');n.textContent=f.game_nickname||[f.first_name,f.last_name].filter(Boolean).join(' ')||f.photoword_id;sub.textContent=f.username?'@'+f.username:f.photoword_id;who.append(n,sub);const prog=document.createElement('div'),label=document.createElement('span'),track=document.createElement('em'),bar=document.createElement('i');prog.className='friendprogress';label.textContent=f.rewarded?x.rewardReceived:f.completed_levels+' / 10';bar.style.width=Math.min(100,(f.completed_levels||0)*10)+'%';track.append(bar);prog.append(label,track);row.append(who,prog);list.append(row)})}catch(e){list.textContent=e.message}}
$('friendsNav').onclick=loadFriends;
$('inviteFriend').onclick=async()=>{try{const p=await pw.login(),link='https://t.me/PhotoWordBot?startapp='+encodeURIComponent('ref_'+p.photoword_id),share='https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent(t().shareText);window.Telegram?.WebApp?.openTelegramLink?.(share)}catch(e){pw.status(e.message)}};

function shopCountdown(ms){
 const total=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(total/60),s=total%60;
 return m+':'+String(s).padStart(2,'0');
}
function shopDate(raw){
 try{return new Intl.DateTimeFormat(lang()==='ru'?'ru-RU':lang()==='az'?'az-AZ':'en-GB',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(raw))}catch{return''}
}
function renderShopHistory(items){
 const x=t(),box=$('shopHistory');if(!box)return;box.replaceChildren();
 if(!Array.isArray(items)||!items.length){const p=document.createElement('p');p.className='muted';p.id='shopHistoryEmpty';p.textContent=x.shopHistoryEmpty;box.append(p);return}
 for(const item of items){
  const row=document.createElement('div');row.className='shop-history-item';
  const icon=document.createElement('span'),copy=document.createElement('div'),title=document.createElement('b'),date=document.createElement('small'),value=document.createElement('strong');
  if(item.type==='coins'){icon.textContent='🪙';title.textContent=x.historyCoins;value.textContent='+'+Number(item.coins||0)+' 🪙 · '+Number(item.stars||0)+' ⭐'}
  else if(item.type==='energy'){icon.textContent='⚡';title.textContent=x.historyEnergy;value.textContent='+'+Number(item.energy||0)+' ⚡ · '+Number(item.stars||0)+' ⭐'}
  else{icon.textContent='▶️';title.textContent=x.historyAd;value.textContent='+'+Number(item.coins||0)+' 🪙 · '+x.historyFree}
  date.textContent=shopDate(item.at);copy.append(title,date);row.append(icon,copy,value);box.append(row);
 }
}
function renderShopStatus(s){
 if(!s)return;shopStatus=s;const x=t(),energy=Number(s.energy||0),max=Number(s.energy_max||5),ads=s.ads||{},claimed=Number(ads.claimed_today||0),limit=Number(ads.daily_limit||10),configured=Boolean(ads.configured),limited=claimed>=limit;
 text('shopBalance',Number(s.coins??pw.player?.coins??0));text('shopEnergyValue',energy+'/'+max+' ⚡');text('shopAdsValue',claimed+'/'+limit);
 text('shopAdsState',limited?x.shopAdsLimit:configured?x.shopAdsReady:x.shopAdsUnavailable);
 text('adLimitText',configured?(claimed+'/'+limit+' · +'+Number(ads.reward_coins||5)+' 🪙'):'');
 text('adTitle',configured?x.adTitle:x.adUnavailableTitle);text('adText',adLastError||(configured?x.adText:x.adUnavailableText));
 document.querySelectorAll('[data-energy-store-pack]').forEach(b=>b.disabled=energy>=max);
 const adButton=$('watchAd');if(adButton){adButton.disabled=adBusy||!configured||limited;adButton.textContent=adBusy?x[adPhase]:limited?x.adLimitReached:configured?x.adWatch:x.adSetup}
 renderShopHistory(s.history||[]);
 clearInterval(shopTimer);shopTimer=null;
 const energyTimer=$('shopEnergyTimer');
 const tick=()=>{if(!energyTimer)return;if(energy>=max||!s.next_energy_at){energyTimer.textContent=x.shopEnergyFullShort;return}const left=Date.parse(s.next_energy_at)-Date.now();energyTimer.textContent=x.shopEnergyNext+' '+shopCountdown(left);if(left<=0){clearInterval(shopTimer);shopTimer=null;loadShopStatus().catch(()=>{})}};
 tick();if(energy<max&&s.next_energy_at)shopTimer=setInterval(tick,1000);
}
async function loadShopStatus(){
 const card=$('shopModal')?.querySelector('.shopcard');card?.classList.add('shop-status-loading');
 try{const data=await pw.actionRequest('shop_status');renderShopStatus(data?.shop||{});return data?.shop||{}}
 finally{card?.classList.remove('shop-status-loading')}
}
function openShop(){track('shop_open');open('shopModal');text('shopHistoryEmpty',t().shopLoading);loadShopStatus().catch(e=>pw.status(e.message))}
$('refreshShopHistory').onclick=()=>loadShopStatus().catch(e=>pw.status(e.message));
async function waitForEnergyCredit(before){
 const x=t();pw.status(x.paymentProcessing);
 for(const ms of [700,1200,1800,2600,3600,5000]){
  await new Promise(r=>setTimeout(r,ms));
  try{const s=await loadShopStatus();if(Number(s?.energy||0)>before){pw.sfx('coin');pw.status(x.energyCredited);return true}}catch{}
 }
 pw.status(x.paymentPending);return false;
}
async function waitForStarCredit(before,coins){const x=t(),target=before+coins,delays=[700,1200,1800,2600,3600,5000];pw.status(x.paymentProcessing);for(const ms of delays){await new Promise(r=>setTimeout(r,ms));try{const p=await pw.login(true);if((p.coins||0)>=target){pw.sfx('coin');pw.status(x.paymentCredited);await loadShopStatus().catch(()=>{});return true}}catch{}}pw.status(x.paymentPending);return false}
document.querySelectorAll('[data-pack]').forEach(b=>b.onclick=async()=>{if(b.disabled)return;b.disabled=true;try{const base=(pw.player||await pw.login()).coins||0;track('invoice_open',{metadata:{pack:b.dataset.pack}});const result=await pw.actionRequest('create_invoice',{pack:b.dataset.pack}),tg=window.Telegram?.WebApp;if(!tg?.openInvoice)throw new Error(t().notifyNeedTelegram);tg.openInvoice(result.invoice_url,status=>{b.disabled=false;track('payment_status',{metadata:{status,pack:b.dataset.pack}});if(status==='paid')waitForStarCredit(base,result.coins);else if(status==='pending'){pw.status(t().paymentPending);setTimeout(()=>pw.login(true).catch(()=>{}),2500)}else if(status==='failed')pw.status(t().paymentFailed);else if(status==='cancelled')pw.status(t().paymentCancelled)})}catch(e){pw.status(e.message);b.disabled=false}});

document.querySelectorAll('[data-energy-store-pack]').forEach(b=>b.onclick=async()=>{
 if(b.disabled)return;
 const before=Number(shopStatus?.energy||0);b.disabled=true;
 try{
  track('invoice_open',{metadata:{pack:b.dataset.energyStorePack,type:'energy'}});
  const result=await pw.actionRequest('create_energy_invoice',{pack:b.dataset.energyStorePack}),tg=window.Telegram?.WebApp;
  if(!tg?.openInvoice)throw new Error(t().shopNeedTelegram);
  tg.openInvoice(result.invoice_url,status=>{
    b.disabled=false;track('payment_status',{metadata:{status,pack:b.dataset.energyStorePack,type:'energy'}});
    if(status==='paid'){waitForEnergyCredit(before)}
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

function renderAdButton(){const b=$('watchAd'),x=t(),configured=Boolean(shopStatus?.ads?.configured??publicConfig.adsgram_reward_block_id),limited=Number(shopStatus?.ads?.claimed_today||0)>=Number(shopStatus?.ads?.daily_limit||10);b.disabled=adBusy||!configured||limited;b.textContent=adBusy?x[adPhase]:limited?x.adLimitReached:configured?x.adWatch:x.adSetup}
async function configureAds(){try{const r=await pw.actionRequest('public_config');publicConfig=r.config||{};renderAdButton()}catch{renderAdButton()}}
async function claimConfirmedAd(nonce){for(const delay of [300,700,1200,1800,2600,3600]){await new Promise(r=>setTimeout(r,delay));try{return await pw.api('ad_claim',{nonce})}catch{}}throw new Error('ad_confirmation_pending')}
$('watchAd').onclick=async()=>{
 const b=$('watchAd'),x=t();let stage='sdk';if(b.disabled||adBusy)return;
 adBusy=true;adPhase='adLoading';adLastError='';text('adText',x.adText);renderAdButton();
 try{
  if(!window.PWAdSession)throw new Error('ad_sdk_missing');
  await window.PWAdSession.ensureSDK();
  stage='prepare';const prep=await pw.actionRequest('ad_prepare');stage='show';track('ad_open');
  if(!adController)adController=window.Adsgram.init({blockId:String(prep.block_id),debug:false});
  const result=await window.PWAdSession.show(adController,{onStart(){adPhase='adPlaying';renderAdButton();track('ad_started')}});
  if(!result?.done)throw result||new Error('ad_incomplete');
  adPhase='adChecking';renderAdButton();track('ad_watched');
  const p=await claimConfirmedAd(prep.nonce);track('ad_complete');update(p);pw.sfx('coin');flashStatus(x.adRewarded);
 }catch(e){
  const code=String(e?.message||e?.description||'ad_error');
  track('ad_error',{metadata:{message:code.slice(0,120),state:String(e?.state||'').slice(0,24)}});
  const message=stage==='prepare'&&e?.message?e.message:(code==='ad_timeout'||code==='ad_sdk_timeout')?x.adTimeout:code==='ad_confirmation_pending'?x.adPending:code.includes('ad_cooldown')?x.adCooldown:x.adError;
  adLastError=message;text('adText',message);pw.status(message);
 }finally{adBusy=false;renderAdButton();loadShopStatus().catch(()=>{})}
};
$('claimDaily').onclick=async()=>{const x=t();try{const p=await pw.api('claim_daily');track('daily_claim');update(p);pw.sfx('coin');text('claimDaily',x.claimed);$('claimDaily').disabled=true;flashStatus('+5 🪙');setTimeout(()=>close('dailyModal'),900)}catch(e){if(String(e.message)===x.alreadyDaily||String(e.message).toLowerCase().includes('already')||String(e.message).includes('уже')||String(e.message).includes('artıq')){text('claimDaily',x.claimed);$('claimDaily').disabled=true;pw.status(x.alreadyDaily)}else pw.status(e.message)}};

document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>close(b.dataset.close));
document.querySelectorAll('.modal').forEach(m=>m.onclick=e=>{if(e.target===m)close(m.id)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal').forEach(m=>close(m.id))});

$('ratingBack').onclick=()=>screen('home');let ratingReq=0;
async function rating(){const x=t();screen('ratingScreen');const id=++ratingReq,board=$('leaderboard');board.textContent=x.loading;try{if(pw.hasAuth)await pw.login().catch(e=>pw.status(e.message));const rows=await pw.leaderboard();if(id!==ratingReq)return;board.replaceChildren();if(!rows.length){board.textContent=x.noPlayers;return}rows.forEach(p=>{const row=document.createElement('div');row.className='rankrow'+(p.photoword_id===pw.player?.photoword_id?' me':'');const rank=document.createElement('b');rank.className='rank-place';rank.textContent=p.rank===1?'🥇':p.rank===2?'🥈':p.rank===3?'🥉':'#'+p.rank;const person=document.createElement('div'),title=document.createElement('strong'),sub=document.createElement('small'),pt=earnedChapterTitle(p);title.textContent=pw.name(p);sub.textContent=(pt?pt+' · ':'')+Number(p.completed_levels||0)+' '+x.levels;person.append(title,sub);const xp=document.createElement('b');xp.className='rank-score';xp.textContent=p.xp+' XP';const avatar=document.createElement("span");avatar.className="frame-avatar rank-avatar";avatar.textContent=pw.name(p).charAt(0).toUpperCase();avatar.dataset.playerCode=p.photoword_id;row.append(rank,avatar,person,xp);board.append(row)});window.PWFrames?.hydrateRating?.(rows)}catch(e){board.textContent=e.message}}
['ratingNav','ratingShortcut','refreshRating'].forEach(id=>$(id).onclick=rating);

window.addEventListener('pw:player',e=>update(e.detail));
function showProfileSyncedOnce(){
 let shown=false;try{shown=sessionStorage.getItem('pw.profileSyncedShown')==='1';if(!shown)sessionStorage.setItem('pw.profileSyncedShown','1')}catch{}
 if(shown)return;
 const msg=t().profileSynced;pw.status(msg);
 setTimeout(()=>{const e=$('status');if(e&&!e.hidden&&e.textContent===msg){e.hidden=true;e.textContent=''}},1800);
}
pw.login().then(async()=>{showProfileSyncedOnce();track('app_open',{metadata:{version:'r101'}});configureAds();try{await syncThemeProgress()}catch(e){track('server_error',{metadata:{code:'theme_progress_sync',status:0}})}try{const start=window.Telegram?.WebApp?.initDataUnsafe?.start_param||'';if(start.startsWith('ref_PW-'))await pw.api('register_referral',{referrer:start.slice(4)})}catch{}}).catch(e=>pw.status(e.message));
})();
