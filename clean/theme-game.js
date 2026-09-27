(() => {
'use strict';
const $=id=>document.getElementById(id),pw=window.PW;
const getLang=()=>{try{return localStorage.getItem('pw.language')||'ru'}catch{return'ru'}};
const lang=getLang();
const themeParam=new URLSearchParams(location.search).get('theme');
const themeId=['sport','art','professions','travel','science','technology'].includes(themeParam)?themeParam:'sport';
const UI={
 ru:{sport:'⚽ Спорт',art:'🎨 Искусство',professions:'🧑‍💼 Профессии',travel:'🌍 Путешествия',science:'🔬 Наука',technology:'💻 Технологии',level:n=>'Тематический уровень '+n,textHint:'Текстовая подсказка',tap:'Нажми, чтобы открыть',wrong:'Неверное слово. Попробуй ещё раз.',passed:n=>'Уровень '+n+' пройден!',saved:'Прогресс сохранён отдельно от основной игры.',next:'СЛЕДУЮЩИЙ УРОВЕНЬ',back:'К ТЕМАМ',locked:n=>'Сначала пройди уровень '+n+'.',letter:'Буква открыта.',remove:'Лишние буквы убраны.',shuffle:'Буквы перемешаны.',text:'Подсказка открыта.',allLetters:'Все буквы уже открыты.',noExtra:'Лишних букв не осталось.',placeFail:'Не удалось разместить букву.',saving:'Сохраняю результат…',reward:'+15 🪙 · +10 XP',replayReward:'Уровень уже был пройден · награда не начисляется.',needTelegram:'Открой игру через Telegram, чтобы получать награды и использовать подсказки.',spent:(n,msg)=>'−'+n+' 🪙 · '+msg,image:n=>'Изображение '+n},
 en:{sport:'⚽ Sport',art:'🎨 Art',professions:'🧑‍💼 Professions',travel:'🌍 Travel',science:'🔬 Science',technology:'💻 Technology',level:n=>'Themed level '+n,textHint:'Text hint',tap:'Tap to reveal',wrong:'Wrong word. Try again.',passed:n=>'Level '+n+' completed!',saved:'Progress saved separately from the main game.',next:'NEXT LEVEL',back:'BACK TO THEMES',locked:n=>'Complete level '+n+' first.',letter:'Letter revealed.',remove:'Extra letters removed.',shuffle:'Letters shuffled.',text:'Hint revealed.',allLetters:'All letters are already revealed.',noExtra:'No extra letters remain.',placeFail:'Could not place the letter.',saving:'Saving result…',reward:'+15 🪙 · +10 XP',replayReward:'Level already completed · no repeat reward.',needTelegram:'Open the game in Telegram to receive rewards and use hints.',spent:(n,msg)=>'−'+n+' 🪙 · '+msg,image:n=>'Image '+n},
 az:{sport:'⚽ İdman',art:'🎨 İncəsənət',professions:'🧑‍💼 Peşələr',travel:'🌍 Səyahət',science:'🔬 Elm',technology:'💻 Texnologiya',level:n=>n+'-ci mövzu səviyyəsi',textHint:'Mətn ipucu',tap:'Açmaq üçün toxun',wrong:'Söz yanlışdır. Yenidən cəhd et.',passed:n=>n+'-ci səviyyə keçildi!',saved:'Tərəqqi əsas oyundan ayrıca saxlanıldı.',next:'NÖVBƏTİ SƏVİYYƏ',back:'MÖVZULARA QAYIT',locked:n=>'Əvvəlcə '+n+'-ci səviyyəni keç.',letter:'Hərf açıldı.',remove:'Artıq hərflər silindi.',shuffle:'Hərflər qarışdırıldı.',text:'İpucu açıldı.',allLetters:'Bütün hərflər artıq açılıb.',noExtra:'Artıq hərf qalmayıb.',placeFail:'Hərfi yerləşdirmək mümkün olmadı.',saving:'Nəticə saxlanılır…',reward:'+15 🪙 · +10 XP',replayReward:'Səviyyə artıq keçilib · təkrar mükafat verilmir.',needTelegram:'Mükafat almaq və ipuclarından istifadə etmək üçün oyunu Telegram-da aç.',spent:(n,msg)=>'−'+n+' 🪙 · '+msg,image:n=>n+'-ci şəkil'}
};
const ui=UI[lang]||UI.ru;
const THEME_REWARD_COINS=15,THEME_REWARD_XP=10,HINT_COSTS={letter:50,remove:100,text:150};
const SETTINGS_UI={
 ru:{settings:'Настройки',sound:'Звук',soundDesc:'Буквы, победа, ошибка и подсказки',haptic:'Вибрация',hapticDesc:'Нажатия, верный и неверный ответ',music:'Музыка',musicDesc:'Спокойная фоновая музыка',language:'Язык',notifications:'Уведомления',notify:'Разрешить сообщения от бота',notifyOn:'Разрешены',theme:'Тема',rules:'Правила игры',rulesDesc:'Как играть в тематическом режиме',support:'Поддержка',supportDesc:'Связаться с поддержкой',privacy:'Конфиденциальность',terms:'Пользовательское соглашение',languageTitle:'Выберите язык',themeTitle:'Тема',rulesTitle:'Правила игры',supportText:'Напиши в поддержку через Telegram-бота. Ответ придёт в этот же чат.',supportOpen:'НАПИСАТЬ В ПОДДЕРЖКУ',notifyNeed:'Открой игру внутри Telegram, чтобы разрешить уведомления.',notifyDenied:'Разрешение не предоставлено.',notifySent:'Уведомления разрешены. Тестовое сообщение отправлено.',themeNames:{game:'🎮 Игровая',night:'🌙 Ночная',light:'☀️ Светлая',neon:'⚡ Неон',gold:'👑 Золотая'}},
 en:{settings:'Settings',sound:'Sound',soundDesc:'Letters, wins, mistakes and hints',haptic:'Haptics',hapticDesc:'Taps, correct and wrong answers',music:'Music',musicDesc:'Calm background music',language:'Language',notifications:'Notifications',notify:'Allow bot messages',notifyOn:'Allowed',theme:'Theme',rules:'Game rules',rulesDesc:'How themed mode works',support:'Support',supportDesc:'Contact support',privacy:'Privacy',terms:'Terms of use',languageTitle:'Choose language',themeTitle:'Theme',rulesTitle:'Game rules',supportText:'Message support through the Telegram bot. The reply will arrive in the same chat.',supportOpen:'CONTACT SUPPORT',notifyNeed:'Open the game inside Telegram to enable notifications.',notifyDenied:'Permission was not granted.',notifySent:'Notifications enabled. A test message was sent.',themeNames:{game:'🎮 Game',night:'🌙 Night',light:'☀️ Light',neon:'⚡ Neon',gold:'👑 Gold'}},
 az:{settings:'Ayarlar',sound:'Səs',soundDesc:'Hərflər, qələbə, səhv və ipucları',haptic:'Vibrasiya',hapticDesc:'Toxunuş, düzgün və səhv cavab',music:'Musiqi',musicDesc:'Sakit fon musiqisi',language:'Dil',notifications:'Bildirişlər',notify:'Bot mesajlarına icazə ver',notifyOn:'İcazə verilib',theme:'Tema',rules:'Oyun qaydaları',rulesDesc:'Mövzu rejiminin qaydaları',support:'Dəstək',supportDesc:'Dəstəklə əlaqə',privacy:'Məxfilik',terms:'İstifadəçi razılaşması',languageTitle:'Dil seçin',themeTitle:'Tema',rulesTitle:'Oyun qaydaları',supportText:'Telegram botu vasitəsilə dəstəyə yaz. Cavab eyni çata gələcək.',supportOpen:'DƏSTƏYƏ YAZ',notifyNeed:'Bildirişləri aktivləşdirmək üçün oyunu Telegram daxilində açın.',notifyDenied:'İcazə verilmədi.',notifySent:'Bildirişlər aktiv edildi. Test mesajı göndərildi.',themeNames:{game:'🎮 Oyun',night:'🌙 Gecə',light:'☀️ İşıqlı',neon:'⚡ Neon',gold:'👑 Qızılı'}}
};
const RULES={
 ru:'<h3>Тематический режим</h3><p>Выбирай отдельную тему и проходи её уровни независимо от основной игры.</p><h3>Награды</h3><p>Первое прохождение тематического уровня: +15 🪙 и +10 XP. Повторное прохождение награду не даёт.</p><h3>Прогресс</h3><p>Прогресс каждой темы сохраняется отдельно. В каждой готовой теме предусмотрено 100 уровней.</p><h3>Подсказки</h3><p>💡 открыть букву — 50 🪙. 🪄 убрать лишние буквы — 100 🪙. Текстовая подсказка — 150 🪙. Перемешивание букв бесплатно.</p>',
 en:'<h3>Themed mode</h3><p>Choose a category and complete its levels separately from the main game.</p><h3>Rewards</h3><p>First completion of a themed level: +15 🪙 and +10 XP. Replays do not grant another reward.</p><h3>Progress</h3><p>Each theme keeps separate progress. Every completed theme contains 100 levels.</p><h3>Hints</h3><p>💡 reveal a letter — 50 🪙. 🪄 remove extra letters — 100 🪙. Text hint — 150 🪙. Shuffling is free.</p>',
 az:'<h3>Mövzu rejimi</h3><p>Mövzunu seç və onun səviyyələrini əsas oyundan ayrıca keç.</p><h3>Mükafatlar</h3><p>Mövzu səviyyəsinin ilk keçidi: +15 🪙 və +10 XP. Təkrar keçid əlavə mükafat vermir.</p><h3>Tərəqqi</h3><p>Hər mövzunun tərəqqisi ayrıca saxlanılır. Hazır olan hər mövzuda 100 səviyyə var.</p><h3>İpucları</h3><p>💡 hərf açmaq — 50 🪙. 🪄 artıq hərfləri silmək — 100 🪙. Mətn ipucu — 150 🪙. Hərfləri qarışdırmaq pulsuzdur.</p>'
};
const settingsUI=SETTINGS_UI[lang]||SETTINGS_UI.ru;
const THEME_KEYS=['game','night','light','neon','gold'];
const openModal=id=>{const e=$(id);if(e)e.hidden=false};
const closeModal=id=>{const e=$(id);if(e)e.hidden=true};
function currentTheme(){try{return localStorage.getItem('pw.theme')||'game'}catch{return'game'}}
function applyThemeSetting(theme){if(!THEME_KEYS.includes(theme))theme='game';document.documentElement.dataset.theme=theme;try{localStorage.setItem('pw.theme',theme)}catch{};textSettingLabels()}
function persistPrefs(){try{localStorage.setItem('photoword-prefs',JSON.stringify(pw.prefs))}catch{}}
function textSettingLabels(){
 const s=settingsUI,theme=currentTheme();
 $('tgSettingsTitle').textContent=s.settings;$('tgSoundLabel').textContent=s.sound;$('tgSoundDesc').textContent=s.soundDesc;$('tgHapticLabel').textContent=s.haptic;$('tgHapticDesc').textContent=s.hapticDesc;$('tgMusicLabel').textContent=s.music;$('tgMusicDesc').textContent=s.musicDesc;
 $('tgLanguageLabel').textContent=s.language;$('tgLanguageCurrent').textContent=lang==='ru'?'Русский':lang==='en'?'English':'Azərbaycan dili';$('tgNotificationsLabel').textContent=s.notifications;$('tgNotificationsState').textContent=(localStorage.getItem('pw.writeAccess')==='1'?s.notifyOn:s.notify);
 $('tgThemeLabel').textContent=s.theme;$('tgThemeCurrent').textContent=s.themeNames[theme]||s.themeNames.game;$('tgRulesLabel').textContent=s.rules;$('tgRulesDesc').textContent=s.rulesDesc;$('tgSupportLabel').textContent=s.support;$('tgSupportDesc').textContent=s.supportDesc;$('tgPrivacyLabel').textContent=s.privacy;$('tgTermsLabel').textContent=s.terms;
 $('tgLanguageTitle').textContent=s.languageTitle;$('tgThemeTitle').textContent=s.themeTitle;$('tgRulesTitle').textContent=s.rulesTitle;$('tgRulesBody').innerHTML=RULES[lang]||RULES.ru;$('tgSupportTitle').textContent=s.support;$('tgSupportText').textContent=s.supportText;$('tgOpenSupport').textContent=s.supportOpen;
 document.querySelectorAll('[data-tg-theme]').forEach(b=>{const key=b.dataset.tgTheme,n=b.querySelector('b');if(n)n.textContent=s.themeNames[key]||key;b.classList.toggle('selected',key===theme)});
 document.querySelectorAll('[data-tg-language]').forEach(b=>b.classList.toggle('selected',b.dataset.tgLanguage===lang));
}


const LEVELS={
 1:{answer:'ГОЛ',hint:'Результативный удар или бросок, который меняет счёт.',photos:[['⚽','Мяч'],['🥅','Цель'],['🎉','Радость'],['📣','Болельщики']]},
 2:{answer:'МАТЧ',hint:'Встреча соперников по правилам определённого вида спорта.',photos:[['⏱️','Время'],['👥','Соперники'],['🏟️','Арена'],['📺','Трансляция']]},
 3:{answer:'ТРЕНЕР',hint:'Человек, который готовит спортсмена или команду к соревнованиям.',photos:[['📋','План'],['🗣️','Подсказки'],['🏃','Тренировка'],['👥','Команда']]},
 4:{answer:'СТАДИОН',hint:'Большая спортивная площадка с трибунами для зрителей.',photos:[['🎟️','Билет'],['👥','Зрители'],['💡','Прожекторы'],['🏟️','Арена']]},
 5:{answer:'РЕКОРД',hint:'Лучший зафиксированный результат.',photos:[['⏱️','Время'],['📈','Лучший результат'],['🏆','Достижение'],['1️⃣','Первое место']]},
 6:{answer:'МЕДАЛЬ',hint:'Награда, которую получают за призовое место.',photos:[['🏁','Финиш'],['🏆','Награда'],['🎖️','Знак отличия'],['🥇','Первое место']]},
 7:{answer:'КОМАНДА',hint:'Группа игроков, выступающих вместе ради общей цели.',photos:[['👕','Форма'],['🤝','Вместе'],['👥','Игроки'],['🏆','Общая цель']]},
 8:{answer:'СУДЬЯ',hint:'Следит за правилами и принимает решения во время соревнования.',photos:[['🟨','Предупреждение'],['⏱️','Время'],['📣','Свисток и сигнал'],['⚖️','Решение']]},
 9:{answer:'РАКЕТКА',hint:'Спортивный инвентарь для ударов по мячу или волану.',photos:[['🏟️','Корт'],['🎾','Мяч'],['🏸','Волан'],['✋','Удар рукой']]},
 10:{answer:'ЛЫЖИ',hint:'Инвентарь для движения по снегу.',photos:[['❄️','Снег'],['⛰️','Склон'],['🥽','Очки'],['🎿','Спуск']]},
 11:{answer:'ШЛЕМ',hint:'Защищает голову спортсмена в опасных дисциплинах.',photos:[['🏎️','Автоспорт'],['🚴','Велоспорт'],['🏈','Контактный спорт'],['⛑️','Защита головы']]},
 12:{answer:'ЭСТАФЕТА',hint:'Командная гонка, где участники по очереди передают друг другу этап.',photos:[['🏃','Бег'],['🤝','Передача'],['🏃','Следующий участник'],['🏁','Финиш']]},
 13:{answer:'ФИНИШ',hint:'Конечная точка дистанции или гонки.',photos:[['⏱️','Время'],['🏃','Последние метры'],['🏁','Черта'],['🎉','Завершение']]},
 14:{answer:'СЕТКА',hint:'Она разделяет стороны площадки или ловит мяч у ворот.',photos:[['⚽','Футбол'],['🏐','Волейбол'],['🎾','Теннис'],['🕸️','Переплетение']]},
 15:{answer:'ПОДАЧА',hint:'Начальный удар или ввод мяча в игру.',photos:[['🎾','Теннис'],['🏐','Волейбол'],['✋','Движение рукой'],['➡️','Начало розыгрыша']]},
 16:{answer:'ТАЙМ',hint:'Одна из частей спортивного матча.',photos:[['⏱️','Отрезок времени'],['📣','Сигнал'],['1️⃣','Первая часть'],['2️⃣','Вторая часть']]},
 17:{answer:'ПРЫЖОК',hint:'Движение, при котором спортсмен на время отрывается от поверхности.',photos:[['🏃','Разбег'],['⬆️','Вверх'],['🏅','Соревнование'],['🤸','Отрыв от земли']]},
 18:{answer:'СКОРОСТЬ',hint:'Показывает, насколько быстро движется спортсмен или техника.',photos:[['🏎️','Гонка'],['🚴','Движение'],['⏱️','Время'],['💨','Быстро']]},
 19:{answer:'ПОБЕДА',hint:'Итог соревнования, когда соперник оказался позади.',photos:[['🏁','Конец'],['🙌','Радость'],['🏆','Трофей'],['🎉','Празднование']]},
 20:{answer:'ЧЕМПИОН',hint:'Спортсмен или команда, занявшие первое место в главном соревновании.',photos:[['🏆','Кубок'],['👑','Лучший'],['🥇','Первое место'],['🎉','Празднование']]},
 21:{answer:'БОКС',hint:'Единоборство, где соперники сражаются в перчатках на ринге.',photos:[['🔔','Раунд'],['⏱️','Время'],['👊','Удар'],['🥊','Перчатки']]},
 22:{answer:'БАСКЕТБОЛ',hint:'Командная игра, где мяч стараются забросить в высоко расположенную корзину.',photos:[['👟','Площадка'],['⛹️','Игрок'],['🧺','Корзина'],['🏀','Мяч']]},
 23:{answer:'ВОЛЕЙБОЛ',hint:'Игра через сетку, где мяч обычно отбивают руками.',photos:[['🏖️','Площадка'],['🙌','Удар руками'],['🕸️','Сетка'],['🏐','Мяч']]},
 24:{answer:'ПЛАВАНИЕ',hint:'Спортивное движение в воде на скорость или выносливость.',photos:[['⏱️','Время'],['🥽','Очки'],['💦','Вода'],['🏊','Спортсмен']]},
 25:{answer:'ГОНКА',hint:'Соревнование, в котором важно прийти к финишу раньше соперников.',photos:[['⏱️','Время'],['🛣️','Трасса'],['💨','Скорость'],['🏁','Финиш']]},
 26:{answer:'ПЕНАЛЬТИ',hint:'Особый удар по воротам за нарушение правил.',photos:[['🟨','Нарушение'],['⚽','Мяч'],['🥅','Ворота'],['🎯','Точный удар']]},
 27:{answer:'ДРИБЛИНГ',hint:'Ведение мяча с контролем во время движения.',photos:[['👟','Движение'],['🔄','Контроль'],['🏃','Продвижение'],['🏀','Мяч']]},
 28:{answer:'БАССЕЙН',hint:'Место с водой, где проводят тренировки и соревнования по плаванию.',photos:[['🥽','Очки'],['💦','Вода'],['🏊','Пловец'],['🟦','Дорожка']]},
 29:{answer:'РИНГ',hint:'Ограниченная площадка для поединков в некоторых единоборствах.',photos:[['🔔','Раунд'],['🟥','Угол'],['👊','Бой'],['🥊','Перчатки']]},
 30:{answer:'ТАБЛО',hint:'Показывает счёт, время и другую информацию во время матча.',photos:[['👀','Зрители'],['⏱️','Время'],['2️⃣','Счёт'],['📊','Информация']]},
 31:{answer:'КУБОК',hint:'Трофей, который часто вручают победителю турнира.',photos:[['🏁','Финиш'],['🥇','Первое место'],['🎉','Праздник'],['🏆','Трофей']]},
 32:{answer:'ФОРМА',hint:'Одежда спортсмена или команды, обычно выполненная в общих цветах.',photos:[['👥','Команда'],['🎽','Экипировка'],['🧢','Цвета'],['👕','Одежда']]},
 33:{answer:'РАЗМИНКА',hint:'Подготовительные упражнения перед основной нагрузкой.',photos:[['🌡️','Разогрев'],['🤸','Упражнение'],['🏃','Движение'],['⏱️','Перед стартом']]},
 34:{answer:'ТРИБУНА',hint:'Место для зрителей рядом со спортивной площадкой.',photos:[['🎟️','Билет'],['📣','Болельщики'],['👥','Зрители'],['🏟️','Арена']]},
 35:{answer:'ТУРНИР',hint:'Серия соревнований, в которой участники борются за общий итоговый результат.',photos:[['🗓️','Расписание'],['👥','Участники'],['🔀','Сетка игр'],['🏆','Приз']]},
 36:{answer:'ВРАТАРЬ',hint:'Игрок, основная задача которого — защищать ворота.',photos:[['🧤','Перчатки'],['🥅','Ворота'],['⚽','Мяч'],['🛡️','Защита']]},
 37:{answer:'ЗАЩИТА',hint:'Действия команды, направленные на то, чтобы не дать сопернику набрать очки.',photos:[['↩️','Возврат'],['👥','Линия игроков'],['🥅','Свои ворота'],['🛡️','Оборона']]},
 38:{answer:'АТАКА',hint:'Активные действия команды или спортсмена ради набора очков.',photos:[['➡️','Вперёд'],['🏃','Рывок'],['⚽','Мяч'],['🎯','Цель']]},
 39:{answer:'ПАС',hint:'Передача мяча партнёру по команде.',photos:[['🤝','Партнёр'],['➡️','Передача'],['⚽','Мяч'],['👥','Команда']]},
 40:{answer:'НОКАУТ',hint:'Завершение боя, когда соперник не может продолжить поединок.',photos:[['🔔','Раунд'],['😵','Падение'],['👊','Удар'],['🥊','Бой']]},
 41:{answer:'МАРАФОН',hint:'Очень длинная беговая дистанция на выносливость.',photos:[['👟','Бег'],['🛣️','Дистанция'],['⏱️','Время'],['🏃','Долгий забег']]},
 42:{answer:'СПРИНТ',hint:'Короткий забег, где особенно важна максимальная скорость.',photos:[['⚡','Быстро'],['⏱️','Секунды'],['🏃','Бег'],['💨','Скорость']]},
 43:{answer:'ФИТНЕС',hint:'Тренировки для поддержания силы, выносливости и общей физической формы.',photos:[['💧','Нагрузка'],['❤️','Здоровье'],['🏃','Кардио'],['🏋️','Тренировка']]},
 44:{answer:'ГАНТЕЛЬ',hint:'Компактный спортивный снаряд, который держат одной рукой.',photos:[['💪','Сила'],['🏠','Тренировка дома'],['🏋️','Вес'],['🔩','Металл']]},
 45:{answer:'ШТАНГА',hint:'Силовой снаряд с длинным грифом и весом по краям.',photos:[['🏋️','Подъём'],['💪','Сила'],['⚫','Вес'],['➖','Длинный гриф']]},
 46:{answer:'БАРЬЕР',hint:'Препятствие, через которое спортсмен должен перепрыгнуть на беговой дорожке.',photos:[['🏃','Разбег'],['⬆️','Прыжок'],['🛣️','Дорожка'],['🚧','Препятствие']]},
 47:{answer:'СВИСТОК',hint:'С его помощью судья подаёт короткий звуковой сигнал.',photos:[['🧑‍⚖️','Судья'],['👂','Звук'],['⏱️','Остановка'],['🟨','Правило']]},
 48:{answer:'ДИСТАНЦИЯ',hint:'Расстояние, которое нужно преодолеть от старта до финиша.',photos:[['📏','Расстояние'],['🏃','Движение'],['🛣️','Маршрут'],['🏁','Финиш']]},
 49:{answer:'ТАКТИКА',hint:'План действий спортсмена или команды для достижения результата.',photos:[['🧠','Решение'],['📋','План'],['↔️','Перестроение'],['👥','Команда']]},
 50:{answer:'СЕКУНДОМЕР',hint:'Прибор для точного измерения времени в тренировке или соревновании.',photos:[['🏃','Забег'],['🏁','Финиш'],['🕐','Время'],['⏱️','Измерение']]},
 51:{answer:"ФУТБОЛ",hint:"Командная игра, где мяч стараются отправить в ворота ногами.",photos:[["👟","Бутсы"],["👥","Команда"],["🥅","Ворота"],["⚽","Мяч"]]},
 52:{answer:"ТЕННИС",hint:"Игра на корте, где соперники перебрасывают мяч ракетками через сетку.",photos:[["🏟️","Корт"],["↔️","Две стороны"],["🕸️","Сетка"],["🎾","Мяч"]]},
 53:{answer:"ХОККЕЙ",hint:"Командная игра на льду с клюшками и шайбой.",photos:[["❄️","Лёд"],["🥅","Ворота"],["🧤","Защита"],["🏒","Клюшка"]]},
 54:{answer:"ГОЛЬФ",hint:"Игра, где маленький мяч стараются отправить в лунку за минимальное число ударов.",photos:[["🌿","Поле"],["🎯","Точность"],["🕳️","Лунка"],["⛳","Флаг"]]},
 55:{answer:"БЕЙСБОЛ",hint:"Командная игра с битой, мячом и пробежками по базам.",photos:[["🧢","Кепка"],["🧤","Ловля"],["🏃","Бег"],["⚾","Мяч"]]},
 56:{answer:"РЕГБИ",hint:"Контактная командная игра с овальным мячом.",photos:[["👥","Команда"],["💪","Контакт"],["🏟️","Поле"],["🏉","Овальный мяч"]]},
 57:{answer:"БОРЬБА",hint:"Единоборство, где соперники пытаются провести приём и получить преимущество без ударов.",photos:[["🤝","Захват"],["💪","Сила"],["🟦","Ковёр"],["🤼","Поединок"]]},
 58:{answer:"ДЗЮДО",hint:"Японское единоборство с бросками, удержаниями и специальной формой.",photos:[["🤝","Захват"],["🔄","Бросок"],["🏅","Поединок"],["🥋","Форма"]]},
 59:{answer:"КАРАТЭ",hint:"Единоборство, в котором используют удары руками и ногами.",photos:[["👊","Удар рукой"],["🦶","Удар ногой"],["🎗️","Пояс"],["🥋","Форма"]]},
 60:{answer:"ФЕХТОВАНИЕ",hint:"Спортивный поединок на специальных клинках, где важны скорость и точность.",photos:[["🧤","Защита"],["📏","Дистанция"],["⚔️","Клинки"],["🤺","Поединок"]]},
 61:{answer:"ГИМНАСТИКА",hint:"Спорт с упражнениями на гибкость, силу, равновесие и координацию.",photos:[["🎀","Предмет"],["⚖️","Равновесие"],["🌀","Вращение"],["🤸","Упражнение"]]},
 62:{answer:"АКРОБАТИКА",hint:"Упражнения с прыжками, вращениями и сложными положениями тела.",photos:[["🤝","Поддержка"],["⬆️","Высота"],["🔄","Вращение"],["🤸","Трюк"]]},
 63:{answer:"БИАТЛОН",hint:"Зимний спорт, который сочетает лыжную гонку и стрельбу по мишеням.",photos:[["⏱️","Время"],["🎯","Мишень"],["❄️","Зима"],["🎿","Лыжи"]]},
 64:{answer:"СКЕЙТ",hint:"Доска на колёсах и спортивное катание с трюками.",photos:[["🧢","Уличный стиль"],["🛣️","Покрытие"],["⚖️","Баланс"],["🛹","Доска"]]},
 65:{answer:"СЕРФИНГ",hint:"Катание на доске по морским волнам.",photos:[["🌊","Волна"],["🏖️","Берег"],["⚖️","Баланс"],["🏄","Доска"]]},
 66:{answer:"ГРЕБЛЯ",hint:"Движение лодки по воде с помощью вёсел как спортивная дисциплина.",photos:[["💧","Вода"],["↔️","Ритм"],["💪","Усилие"],["🚣","Лодка"]]},
 67:{answer:"ЯХТИНГ",hint:"Спортивное управление судном, которое движется силой ветра.",photos:[["🌬️","Ветер"],["🌊","Вода"],["🧭","Курс"],["⛵","Парусник"]]},
 68:{answer:"ВЕЛОСПОРТ",hint:"Соревнования и тренировки на велосипеде.",photos:[["🛣️","Маршрут"],["⛰️","Подъём"],["🪖","Шлем"],["🚴","Велосипедист"]]},
 69:{answer:"ТРИАТЛОН",hint:"Соревнование, объединяющее плавание, велосипед и бег.",photos:[["🏊","Плавание"],["🚴","Велосипед"],["🏃","Бег"],["3️⃣","Три этапа"]]},
 70:{answer:"АЛЬПИНИЗМ",hint:"Спортивное восхождение на горные вершины и сложные маршруты.",photos:[["🪢","Верёвка"],["❄️","Высота"],["⛰️","Гора"],["🧗","Восхождение"]]},
 71:{answer:"СТРЕЛЬБА",hint:"Спортивная дисциплина, где оценивают точность попадания в цель.",photos:[["👁️","Прицел"],["🤫","Концентрация"],["🎯","Цель"],["🏅","Результат"]]},
 72:{answer:"МИШЕНЬ",hint:"Объект, в который стараются точно попасть в стрелковых дисциплинах.",photos:[["👁️","Наведение"],["📏","Дистанция"],["🎯","Центр"],["🏹","Попадание"]]},
 73:{answer:"КЛЮШКА",hint:"Спортивный инвентарь, которым ведут и ударяют шайбу или мяч.",photos:[["🧤","Хват"],["❄️","Лёд"],["🥅","Ворота"],["🏒","Инвентарь"]]},
 74:{answer:"ШАЙБА",hint:"Плоский диск, которым играют в хоккей.",photos:[["❄️","Лёд"],["💨","Скорость"],["🥅","Ворота"],["🏒","Хоккей"]]},
 75:{answer:"КОРТ",hint:"Размеченная площадка для тенниса и некоторых других игр.",photos:[["📏","Разметка"],["↔️","Стороны"],["🕸️","Сетка"],["🎾","Игра"]]},
 76:{answer:"ДОРОЖКА",hint:"Отдельная полоса на беговом стадионе или в бассейне.",photos:[["📏","Разметка"],["🏃","Бег"],["🏊","Плавание"],["➡️","Полоса"]]},
 77:{answer:"СЕКТОР",hint:"Отдельная размеченная часть спортивной площадки для определённой дисциплины.",photos:[["📐","Угол"],["📍","Зона"],["🏟️","Стадион"],["🎯","Участок"]]},
 78:{answer:"РАУНД",hint:"Один отдельный отрезок поединка или матча.",photos:[["🔔","Сигнал"],["⏱️","Время"],["1️⃣","Часть"],["🥊","Поединок"]]},
 79:{answer:"СЕТ",hint:"Часть матча в теннисе, волейболе и ряде других игр.",photos:[["🔢","Счёт"],["↔️","Стороны"],["🏐","Игра"],["🎾","Матч"]]},
 80:{answer:"ПЕРИОД",hint:"Одна из крупных временных частей спортивной игры.",photos:[["⏱️","Время"],["1️⃣","Часть"],["📣","Сигнал"],["🏒","Матч"]]},
 81:{answer:"ОВЕРТАЙМ",hint:"Дополнительное время, назначаемое после ничейного основного времени.",photos:[["⏱️","Время"],["➕","Дополнительно"],["🤝","Равный счёт"],["🏆","Решение"]]},
 82:{answer:"РЕЗУЛЬТАТ",hint:"Итог выступления, матча или соревнования.",photos:[["📊","Итог"],["⏱️","Финиш"],["🔢","Цифры"],["✅","Итог"]]},
 83:{answer:"СЧЕТ",hint:"Числовой итог, показывающий положение соперников в игре.",photos:[["🔢","Цифры"],["📺","Табло"],["👥","Соперники"],["🏟️","Матч"]]},
 84:{answer:"НИЧЬЯ",hint:"Результат, при котором соперники заканчивают с одинаковым счётом.",photos:[["🤝","Равенство"],["⚖️","Баланс"],["1️⃣","Одинаково"],["📊","Счёт"]]},
 85:{answer:"ФОЛ",hint:"Нарушение правил во время спортивной игры.",photos:[["🚫","Нарушение"],["📣","Свисток"],["🟨","Предупреждение"],["⚽","Игра"]]},
 86:{answer:"ОФСАЙД",hint:"Положение игрока, которое в некоторых играх считается нарушением атаки.",photos:[["📏","Линия"],["➡️","Вперёд"],["🚩","Флаг"],["⚽","Футбол"]]},
 87:{answer:"УГЛОВОЙ",hint:"Возобновление футбольной игры ударом от угла поля.",photos:[["🚩","Флажок"],["📐","Угол"],["🥅","Ворота"],["⚽","Мяч"]]},
 88:{answer:"СТАРТ",hint:"Начальная точка или момент соревнования.",photos:[["⏱️","Отсчёт"],["👟","Готовность"],["📣","Сигнал"],["🏁","Начало"]]},
 89:{answer:"ОТБОР",hint:"Этап, на котором определяют участников следующей стадии соревнования.",photos:[["👥","Участники"],["📋","Условия"],["✅","Проход"],["➡️","Следующий этап"]]},
 90:{answer:"ЛИГА",hint:"Организованное соревнование команд или игроков в течение сезона.",photos:[["👥","Участники"],["🗓️","Сезон"],["📊","Таблица"],["🏆","Турнир"]]},
 91:{answer:"ДИВИЗИОН",hint:"Группа команд или участников определённого уровня внутри соревнования.",photos:[["📊","Группа"],["⬆️","Уровень"],["👥","Команды"],["🏆","Соревнование"]]},
 92:{answer:"СЕЗОН",hint:"Период, в течение которого проводится цикл соревнований.",photos:[["🗓️","Календарь"],["🔄","Цикл"],["🏟️","Матчи"],["🏆","Итог"]]},
 93:{answer:"ПЛЕЙОФФ",hint:"Стадия турнира на выбывание после основной части.",photos:[["🔀","Сетка"],["❌","Выбывание"],["➡️","Следующий раунд"],["🏆","Трофей"]]},
 94:{answer:"ФИНАЛ",hint:"Решающая последняя встреча соревнования.",photos:[["2️⃣","Два соперника"],["🏟️","Арена"],["🏆","Трофей"],["🥇","Победитель"]]},
 95:{answer:"ПОЛУФИНАЛ",hint:"Стадия перед финалом, после которой остаются участники решающей встречи.",photos:[["4️⃣","Четыре участника"],["🔀","Сетка"],["➡️","Дальше"],["🏆","Финал впереди"]]},
 96:{answer:"КАПИТАН",hint:"Игрок, который представляет команду на поле и часто ведёт её за собой.",photos:[["👥","Команда"],["🗣️","Лидер"],["🎽","Повязка"],["⭐","Ответственность"]]},
 97:{answer:"БОЛЕЛЬЩИК",hint:"Человек, который поддерживает спортсмена или команду.",photos:[["📣","Поддержка"],["🎟️","Матч"],["🙌","Эмоции"],["👥","Трибуна"]]},
 98:{answer:"ЭКИПИРОВКА",hint:"Набор одежды, защиты и инвентаря, необходимого спортсмену.",photos:[["👟","Обувь"],["🪖","Защита"],["🎽","Одежда"],["🎒","Набор"]]},
 99:{answer:"ТРЕНИРОВКА",hint:"Занятие, на котором спортсмен развивает навыки и физическую форму.",photos:[["⏱️","Режим"],["💪","Нагрузка"],["🔁","Повтор"],["🏃","Занятие"]]},
 100:{answer:"ОЛИМПИАДА",hint:"Крупнейшее международное спортивное соревнование по множеству дисциплин.",photos:[["🌍","Страны"],["🔥","Огонь"],["🏅","Медали"],["🏟️","Игры"]]}
};

const TRANSLATED={
 en:{
 1:{answer:'GOAL',hint:'A scoring shot or play that changes the score.'},2:{answer:'MATCH',hint:'A contest between opponents under the rules of a sport.'},3:{answer:'COACH',hint:'A person who prepares an athlete or team for competition.'},4:{answer:'STADIUM',hint:'A large sports venue with stands for spectators.'},5:{answer:'RECORD',hint:'The best officially measured result.'},
 6:{answer:'MEDAL',hint:'An award given for a top finishing position.'},7:{answer:'TEAM',hint:'A group of players competing together for one goal.'},8:{answer:'REFEREE',hint:'The official who enforces rules and makes decisions during play.'},9:{answer:'RACKET',hint:'Equipment used to hit a ball or shuttlecock.'},10:{answer:'SKIS',hint:'Equipment used to move across snow.'},
 11:{answer:'HELMET',hint:'Protective equipment worn on the head in risky sports.'},12:{answer:'RELAY',hint:'A team race where athletes complete sections one after another.'},13:{answer:'FINISH',hint:'The final point of a race or distance.'},14:{answer:'NET',hint:'It divides a court or catches the ball behind a goal.'},15:{answer:'SERVE',hint:'The action that starts a rally or puts the ball into play.'},
 16:{answer:'HALF',hint:'One of the main time sections of a sports match.'},17:{answer:'JUMP',hint:'A movement where the athlete leaves the ground for a moment.'},18:{answer:'SPEED',hint:'How fast an athlete or vehicle moves.'},19:{answer:'VICTORY',hint:'The result when you defeat the opponent.'},20:{answer:'CHAMPION',hint:'The athlete or team that wins the top competition.'},
 21:{answer:'BOXING',hint:'A combat sport where opponents fight with gloves in a ring.'},22:{answer:'BASKETBALL',hint:'A team game where players try to put the ball through a raised hoop.'},23:{answer:'VOLLEYBALL',hint:'A game across a net where the ball is usually struck with the hands.'},24:{answer:'SWIMMING',hint:'Moving through water as a sport for speed or endurance.'},25:{answer:'RACE',hint:'A contest where the goal is to reach the finish before opponents.'},
 26:{answer:'PENALTY',hint:'A special attempt awarded after a rule violation.'},27:{answer:'DRIBBLE',hint:'Controlling and moving the ball while advancing.'},28:{answer:'POOL',hint:'A place filled with water used for swimming practice and competition.'},29:{answer:'RING',hint:'A bounded area used for bouts in some combat sports.'},30:{answer:'SCOREBOARD',hint:'It displays the score, time, and other match information.'},
 31:{answer:'TROPHY',hint:'An award often presented to the winner of a competition.'},32:{answer:'UNIFORM',hint:'Matching sports clothing worn by an athlete or team.'},33:{answer:'WARMUP',hint:'Preparatory exercises performed before the main physical effort.'},34:{answer:'STANDS',hint:'The seating area for spectators beside a sports venue.'},35:{answer:'TOURNAMENT',hint:'A series of contests leading to an overall winner.'},
 36:{answer:'GOALKEEPER',hint:'The player whose main job is to protect the goal.'},37:{answer:'DEFENSE',hint:'Actions used to stop the opponent from scoring.'},38:{answer:'ATTACK',hint:'Active play aimed at creating a scoring chance.'},39:{answer:'PASS',hint:'Sending the ball to a teammate.'},40:{answer:'KNOCKOUT',hint:'A fight ending when an opponent cannot continue.'},
 41:{answer:'MARATHON',hint:'A very long running event that tests endurance.'},42:{answer:'SPRINT',hint:'A short race where maximum speed is especially important.'},43:{answer:'FITNESS',hint:'Training that supports strength, endurance, and general physical condition.'},44:{answer:'DUMBBELL',hint:'A compact weight usually held in one hand.'},45:{answer:'BARBELL',hint:'A long strength-training bar with weights at the ends.'},
 46:{answer:'HURDLE',hint:'An obstacle an athlete jumps over during a track race.'},47:{answer:'WHISTLE',hint:'A referee uses it to make a short sharp signal.'},48:{answer:'DISTANCE',hint:'The length that must be covered from start to finish.'},49:{answer:'TACTICS',hint:'A plan of actions used by an athlete or team to get a result.'},50:{answer:'STOPWATCH',hint:'A device used to measure time precisely in training or competition.'},
51:{answer:"FOOTBALL",hint:"A team sport where players try to send the ball into a goal mainly with their feet."},
52:{answer:"TENNIS",hint:"A court game where opponents hit a ball over a net with rackets."},
53:{answer:"HOCKEY",hint:"A team sport played on ice with sticks and a puck."},
54:{answer:"GOLF",hint:"A game where a small ball is played into a hole in as few strokes as possible."},
55:{answer:"BASEBALL",hint:"A team sport with a bat, ball, and running around bases."},
56:{answer:"RUGBY",hint:"A contact team sport played with an oval ball."},
57:{answer:"WRESTLING",hint:"A combat sport where opponents grapple and use holds rather than strikes."},
58:{answer:"JUDO",hint:"A Japanese martial art using throws, holds, and a special uniform."},
59:{answer:"KARATE",hint:"A martial art that uses hand and foot strikes."},
60:{answer:"FENCING",hint:"A sport duel with special blades where speed and precision matter."},
61:{answer:"GYMNASTICS",hint:"A sport involving flexibility, strength, balance, and coordination."},
62:{answer:"ACROBATICS",hint:"Exercises involving jumps, rotations, and difficult body positions."},
63:{answer:"BIATHLON",hint:"A winter sport combining cross-country skiing and target shooting."},
64:{answer:"SKATE",hint:"A wheeled board used for riding and performing tricks."},
65:{answer:"SURFING",hint:"Riding ocean waves on a board."},
66:{answer:"ROWING",hint:"A sport of moving a boat through water using oars."},
67:{answer:"SAILING",hint:"Sporting control of a boat powered by the wind."},
68:{answer:"CYCLING",hint:"Competition and training performed on a bicycle."},
69:{answer:"TRIATHLON",hint:"An endurance event combining swimming, cycling, and running."},
70:{answer:"CLIMBING",hint:"Sport climbing on mountains and difficult routes."},
71:{answer:"SHOOTING",hint:"A sport in which accuracy at hitting a target is measured."},
72:{answer:"TARGET",hint:"An object competitors try to hit accurately in shooting sports."},
73:{answer:"STICK",hint:"Sports equipment used to control and strike a puck or ball."},
74:{answer:"PUCK",hint:"A flat disk used in ice hockey."},
75:{answer:"COURT",hint:"A marked playing area used for tennis and some other sports."},
76:{answer:"LANE",hint:"A marked lane on a running track or in a swimming pool."},
77:{answer:"SECTOR",hint:"A marked part of a sports venue assigned to a particular event."},
78:{answer:"ROUND",hint:"One separate segment of a bout or match."},
79:{answer:"SET",hint:"A section of a match in tennis, volleyball, and some other sports."},
80:{answer:"PERIOD",hint:"One of the main time sections of a sports game."},
81:{answer:"OVERTIME",hint:"Extra time played after regulation ends tied."},
82:{answer:"RESULT",hint:"The final outcome of a performance, match, or competition."},
83:{answer:"SCORE",hint:"The numerical tally showing the state of a game."},
84:{answer:"DRAW",hint:"A result in which opponents finish with the same score."},
85:{answer:"FOUL",hint:"A violation of the rules during a sports game."},
86:{answer:"OFFSIDE",hint:"A player position that is an attacking violation in some sports."},
87:{answer:"CORNER",hint:"A football restart taken from the corner of the field."},
88:{answer:"START",hint:"The beginning point or moment of a competition."},
89:{answer:"QUALIFIER",hint:"A stage used to determine who advances to the next round."},
90:{answer:"LEAGUE",hint:"An organized competition of teams or players across a season."},
91:{answer:"DIVISION",hint:"A group of teams or competitors at a particular level within a competition."},
92:{answer:"SEASON",hint:"The period during which a cycle of competitions is played."},
93:{answer:"PLAYOFF",hint:"The elimination stage of a competition after the regular phase."},
94:{answer:"FINAL",hint:"The decisive last contest of a competition."},
95:{answer:"SEMIFINAL",hint:"The stage before the final that determines the finalists."},
96:{answer:"CAPTAIN",hint:"A player who represents and often leads the team on the field."},
97:{answer:"FAN",hint:"A person who supports an athlete or team."},
98:{answer:"EQUIPMENT",hint:"The clothing, protective gear, and equipment an athlete needs."},
99:{answer:"TRAINING",hint:"A session where an athlete develops skills and physical condition."},
100:{answer:"OLYMPICS",hint:"The major international multi-sport competition held across many disciplines."}
 },
 az:{
 1:{answer:'QOL',hint:'Hesabı dəyişən uğurlu zərbə və ya atış.'},2:{answer:'MATÇ',hint:'İdman qaydaları ilə iki rəqib arasında keçirilən görüş.'},3:{answer:'MƏŞQÇİ',hint:'İdmançını və ya komandanı yarışa hazırlayan şəxs.'},4:{answer:'STADİON',hint:'Tamaşaçı tribunaları olan böyük idman meydanı.'},5:{answer:'REKORD',hint:'Rəsmi şəkildə qeydə alınmış ən yaxşı nəticə.'},
 6:{answer:'MEDAL',hint:'Mükafat yeri üçün verilən mükafat.'},7:{answer:'KOMANDA',hint:'Ortaq məqsəd üçün birlikdə çıxış edən oyunçular qrupu.'},8:{answer:'HAKİM',hint:'Yarış zamanı qaydalara nəzarət edən və qərar verən şəxs.'},9:{answer:'RAKETKA',hint:'Topa və ya volana vurmaq üçün istifadə olunan idman aləti.'},10:{answer:'XİZƏK',hint:'Qar üzərində hərəkət etmək üçün istifadə olunan vasitə.'},
 11:{answer:'DƏBİLQƏ',hint:'Təhlükəli idman növlərində başı qoruyan vasitə.'},12:{answer:'ESTAFET',hint:'İştirakçıların mərhələləri növbə ilə keçdiyi komanda yarışı.'},13:{answer:'FİNİŞ',hint:'Yarış məsafəsinin son nöqtəsi.'},14:{answer:'TOR',hint:'Meydanı ayırır və ya qapının arxasında topu saxlayır.'},15:{answer:'SERVİS',hint:'Topu oyuna daxil edən başlanğıc zərbəsi.'},
 16:{answer:'HİSSƏ',hint:'İdman matçının əsas vaxt bölmələrindən biri.'},17:{answer:'TULLANMA',hint:'İdmançının qısa müddətə yerdən ayrıldığı hərəkət.'},18:{answer:'SÜRƏT',hint:'İdmançının və ya texnikanın nə qədər tez hərəkət etdiyini göstərir.'},19:{answer:'QƏLƏBƏ',hint:'Rəqib məğlub ediləndə əldə olunan nəticə.'},20:{answer:'ÇEMPİON',hint:'Əsas yarışda birinci yeri tutan idmançı və ya komanda.'},
 21:{answer:'BOKS',hint:'Rəqiblərin əlcəklə rinqdə döyüşdüyü idman növü.'},22:{answer:'BASKETBOL',hint:'Topu hündür səbətə atmağa çalışılan komanda oyunu.'},23:{answer:'VOLEYBOL',hint:'Topun adətən əllə vurulduğu və tor üzərindən oynanan komanda oyunu.'},24:{answer:'ÜZGÜÇÜLÜK',hint:'Suda sürət və ya dözümlülük üçün edilən idman hərəkəti.'},25:{answer:'YARIŞ',hint:'Məqsədin rəqiblərdən əvvəl finişə çatmaq olduğu mübarizə.'},
 26:{answer:'PENALTİ',hint:'Qayda pozuntusundan sonra verilən xüsusi zərbə.'},27:{answer:'DRİBLİNQ',hint:'Hərəkət zamanı topu nəzarətdə saxlayaraq irəliləmək.'},28:{answer:'HOVUZ',hint:'Üzgüçülük məşqləri və yarışları üçün su ilə dolu yer.'},29:{answer:'RİNQ',hint:'Bəzi döyüş idmanlarında qarşılaşmanın keçirildiyi məhdud meydan.'},30:{answer:'TABLO',hint:'Oyun zamanı hesabı, vaxtı və digər məlumatları göstərir.'},
 31:{answer:'KUBOK',hint:'Turnirin qalibinə tez-tez verilən mükafat.'},32:{answer:'FORMA',hint:'İdmançı və ya komandanın eyni üslubda geyindiyi idman geyimi.'},33:{answer:'İSİNMƏ',hint:'Əsas fiziki yükdən əvvəl edilən hazırlıq hərəkətləri.'},34:{answer:'TRİBUNA',hint:'İdman meydançasının yanında tamaşaçılar üçün ayrılmış yer.'},35:{answer:'TURNİR',hint:'Ümumi qalibi müəyyən edən ardıcıl yarışlar sistemi.'},
 36:{answer:'QAPIÇI',hint:'Əsas vəzifəsi qapını qorumaq olan oyunçu.'},37:{answer:'MÜDAFİƏ',hint:'Rəqibin xal qazanmasına mane olmağa yönələn hərəkətlər.'},38:{answer:'HÜCUM',hint:'Xal qazanmaq üçün irəli yönəlmiş aktiv oyun.'},39:{answer:'ÖTÜRMƏ',hint:'Topu komanda yoldaşına göndərmək.'},40:{answer:'NOKAUT',hint:'Rəqib davam edə bilmədikdə döyüşün bitməsi.'},
 41:{answer:'MARAFON',hint:'Dözümlülüyü yoxlayan çox uzun qaçış məsafəsi.'},42:{answer:'SPRİNT',hint:'Maksimum sürətin xüsusilə vacib olduğu qısa qaçış.'},43:{answer:'FİTNES',hint:'Güc, dözümlülük və ümumi fiziki formanı qorumaq üçün məşqlər.'},44:{answer:'QANTEL',hint:'Adətən bir əllə tutulan yığcam ağırlıq aləti.'},45:{answer:'ŞTANQ',hint:'Kənarlarında ağırlıq olan uzun güc məşqi aləti.'},
 46:{answer:'MANEƏ',hint:'Qaçış zamanı idmançının üzərindən tullanmalı olduğu əngəl.'},47:{answer:'FİT',hint:'Hakimin qısa səs siqnalı vermək üçün istifadə etdiyi vasitə.'},48:{answer:'MƏSAFƏ',hint:'Startdan finişə qədər keçilməli olan uzunluq.'},49:{answer:'TAKTİKA',hint:'Nəticə əldə etmək üçün idmançı və ya komandanın fəaliyyət planı.'},50:{answer:'SANİYƏÖLÇƏN',hint:'Məşq və yarışda vaxtı dəqiq ölçən cihaz.'},
51:{answer:"FUTBOL",hint:"Topu əsasən ayaqla qapıya vurmağa çalışılan komanda oyunu."},
52:{answer:"TENNİS",hint:"Rəqiblərin topu raketka ilə torun üzərindən vurduğu kort oyunu."},
53:{answer:"HOKEY",hint:"Buz üzərində çubuq və şayba ilə oynanan komanda idmanı."},
54:{answer:"QOLF",hint:"Kiçik topu mümkün qədər az zərbə ilə çuxura salmağa çalışılan oyun."},
55:{answer:"BEYSBOL",hint:"Dəyənək, top və bazalar ətrafında qaçışla oynanan komanda oyunu."},
56:{answer:"REQBİ",hint:"Oval top ilə oynanan kontakt komanda idmanı."},
57:{answer:"GÜLƏŞ",hint:"Rəqiblərin zərbə yox, tutma və fəndlərlə üstünlük qazandığı döyüş idmanı."},
58:{answer:"CÜDO",hint:"Atışlar, tutmalar və xüsusi geyimdən istifadə olunan yapon döyüş sənəti."},
59:{answer:"KARATE",hint:"Əl və ayaq zərbələrindən istifadə olunan döyüş sənəti."},
60:{answer:"QILINCOYNATMA",hint:"Xüsusi qılınclarla keçirilən, sürət və dəqiqliyin vacib olduğu idman dueli."},
61:{answer:"GİMNASTİKA",hint:"Elastiklik, güc, tarazlıq və koordinasiya hərəkətlərindən ibarət idman növü."},
62:{answer:"AKROBATİKA",hint:"Tullanma, fırlanma və mürəkkəb bədən mövqelərindən ibarət hərəkətlər."},
63:{answer:"BİATLON",hint:"Xizək yarışı ilə hədəfə atıcılığı birləşdirən qış idmanı."},
64:{answer:"SKEYT",hint:"Təkərli lövhə üzərində sürüşmə və fəndlər etmə idmanı."},
65:{answer:"SÖRFİNQ",hint:"Dəniz dalğaları üzərində lövhə ilə sürüşmə."},
66:{answer:"AVARÇƏKMƏ",hint:"Qayığın avarlarla suda hərəkət etdirildiyi idman növü."},
67:{answer:"YELKƏN",hint:"Küləyin gücü ilə hərəkət edən qayığın idman məqsədli idarə edilməsi."},
68:{answer:"VELOSİPED",hint:"Velosipedlə keçirilən yarış və məşqlər."},
69:{answer:"TRİATLON",hint:"Üzgüçülük, velosiped və qaçışı birləşdirən dözümlülük yarışı."},
70:{answer:"ALPİNİZM",hint:"Dağ zirvələrinə və çətin marşrutlara idman məqsədli qalxma."},
71:{answer:"ATICILIQ",hint:"Hədəfə dəqiq vurmanın qiymətləndirildiyi idman növü."},
72:{answer:"HƏDƏF",hint:"Atıcılıq növlərində dəqiq vurmağa çalışılan obyekt."},
73:{answer:"ÇUBUQ",hint:"Şayba və ya topu idarə etmək və vurmaq üçün istifadə olunan idman aləti."},
74:{answer:"ŞAYBA",hint:"Hokkeydə istifadə olunan yastı disk."},
75:{answer:"KORT",hint:"Tennis və bəzi başqa oyunlar üçün xətlərlə ayrılmış meydança."},
76:{answer:"ZOLAQ",hint:"Qaçış stadionunda və ya hovuzda ayrılmış zolaq."},
77:{answer:"SEKTOR",hint:"Müəyyən idman növü üçün ayrılmış meydança hissəsi."},
78:{answer:"RAUND",hint:"Döyüşün və ya oyunun ayrıca vaxt hissəsi."},
79:{answer:"SET",hint:"Tennis, voleybol və bəzi başqa oyunlarda matçın bir hissəsi."},
80:{answer:"PERİOD",hint:"İdman oyununun əsas zaman hissələrindən biri."},
81:{answer:"ƏLAVƏVAXT",hint:"Əsas vaxt bərabər bitdikdə oynanan əlavə vaxt."},
82:{answer:"NƏTİCƏ",hint:"Çıxışın, matçın və ya yarışın yekun nəticəsi."},
83:{answer:"HESAB",hint:"Oyunda tərəflərin vəziyyətini göstərən rəqəm nəticəsi."},
84:{answer:"BƏRABƏRLİK",hint:"Rəqiblərin oyunu eyni hesabla bitirdiyi nəticə."},
85:{answer:"FOL",hint:"İdman oyunu zamanı qaydanın pozulması."},
86:{answer:"OFSAYD",hint:"Bəzi oyunlarda hücum zamanı qayda pozuntusu sayılan oyunçu mövqeyi."},
87:{answer:"KÜNC",hint:"Futbolda oyunun meydanın küncündən zərbə ilə davam etdirilməsi."},
88:{answer:"START",hint:"Yarışın başlanğıc nöqtəsi və ya anı."},
89:{answer:"SEÇİM",hint:"Növbəti mərhələyə keçən iştirakçıların müəyyən olunduğu seçim mərhələsi."},
90:{answer:"LİQA",hint:"Komandaların və ya oyunçuların mövsüm boyu təşkil olunmuş yarışı."},
91:{answer:"DİVİZİON",hint:"Yarış daxilində müəyyən səviyyəli komandalar və ya iştirakçılar qrupu."},
92:{answer:"MÖVSÜM",hint:"Yarışlar silsiləsinin keçirildiyi dövr."},
93:{answer:"PLEYOFF",hint:"Əsas mərhələdən sonra uduzanın mübarizədən çıxdığı turnir hissəsi."},
94:{answer:"FİNAL",hint:"Yarışın həlledici son qarşılaşması."},
95:{answer:"YARIMFİNAL",hint:"Finaldan əvvəl finalçıları müəyyən edən mərhələ."},
96:{answer:"KAPİTAN",hint:"Meydanda komandanı təmsil edən və çox vaxt ona rəhbərlik edən oyunçu."},
97:{answer:"AZARKEŞ",hint:"İdmançını və ya komandanı dəstəkləyən insan."},
98:{answer:"AVADANLIQ",hint:"İdmançıya lazım olan geyim, qoruyucu vasitə və inventar toplusu."},
99:{answer:"MƏŞQ",hint:"İdmançının bacarıq və fiziki formasını inkişaf etdirdiyi məşğələ."},
100:{answer:"OLİMPİADA",hint:"Çoxsaylı idman növləri üzrə keçirilən ən böyük beynəlxalq idman yarışı."}
 }
};

const ART_LEVELS={
 1:{"answer":"КИСТЬ","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🖌️","🖌️"],["🎨","🎨"],["✋","✋"],["🖼️","🖼️"]]},
 2:{"answer":"КРАСКА","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🎨","🎨"],["🟥","🟥"],["🟦","🟦"],["🟨","🟨"]]},
 3:{"answer":"ХОЛСТ","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🖼️","🖼️"],["🧵","🧵"],["⬜","⬜"],["🎨","🎨"]]},
 4:{"answer":"ПАЛИТРА","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🎨","🎨"],["🌈","🌈"],["🟣","🟣"],["🟡","🟡"]]},
 5:{"answer":"КАРТИНА","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🖼️","🖼️"],["🎨","🎨"],["👀","👀"],["🖌️","🖌️"]]},
 6:{"answer":"ПОРТРЕТ","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["👤","👤"],["🖼️","🖼️"],["📸","📸"],["🎨","🎨"]]},
 7:{"answer":"ПЕЙЗАЖ","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🏞️","🏞️"],["🌄","🌄"],["🖼️","🖼️"],["🎨","🎨"]]},
 8:{"answer":"НАТЮРМОРТ","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🍎","🍎"],["🏺","🏺"],["🌼","🌼"],["🖼️","🖼️"]]},
 9:{"answer":"ЭСКИЗ","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["✏️","✏️"],["📄","📄"],["🖌️","🖌️"],["📝","📝"]]},
 10:{"answer":"РАМА","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🪵","🪵"],["◻️","◻️"],["🖼️","🖼️"],["📐","📐"]]},
 11:{"answer":"ГАЛЕРЕЯ","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🖼️","🖼️"],["🏛️","🏛️"],["👥","👥"],["🎟️","🎟️"]]},
 12:{"answer":"МУЗЕЙ","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🏛️","🏛️"],["🖼️","🖼️"],["🏺","🏺"],["👀","👀"]]},
 13:{"answer":"ХУДОЖНИК","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🧑‍🎨","🧑‍🎨"],["🎨","🎨"],["🖌️","🖌️"],["🖼️","🖼️"]]},
 14:{"answer":"МОЛЬБЕРТ","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🪜","🪜"],["🖼️","🖼️"],["🎨","🎨"],["🖌️","🖌️"]]},
 15:{"answer":"АКВАРЕЛЬ","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["💧","💧"],["🎨","🎨"],["🖌️","🖌️"],["🌈","🌈"]]},
 16:{"answer":"ГУАШЬ","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🎨","🎨"],["🖌️","🖌️"],["⬜","⬜"],["🟥","🟥"]]},
 17:{"answer":"МАСЛО","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🛢️","🛢️"],["🎨","🎨"],["🖌️","🖌️"],["🖼️","🖼️"]]},
 18:{"answer":"ФРЕСКА","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🧱","🧱"],["🎨","🎨"],["🏛️","🏛️"],["🖼️","🖼️"]]},
 19:{"answer":"ГРАФИКА","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["✒️","✒️"],["📐","📐"],["⚫","⚫"],["⚪","⚪"]]},
 20:{"answer":"ГРАВЮРА","hint":"Понятие или предмет из живописи и создания изображений.","photos":[["🪵","🪵"],["🖋️","🖋️"],["📄","📄"],["🖼️","🖼️"]]},
 21:{"answer":"СКУЛЬПТУРА","hint":"Материал или приём, связанный со скульптурой и объёмной формой.","photos":[["🗿","🗿"],["👐","👐"],["🪨","🪨"],["🎨","🎨"]]},
 22:{"answer":"СТАТУЯ","hint":"Материал или приём, связанный со скульптурой и объёмной формой.","photos":[["🗿","🗿"],["🏛️","🏛️"],["🪨","🪨"],["👤","👤"]]},
 23:{"answer":"МРАМОР","hint":"Материал или приём, связанный со скульптурой и объёмной формой.","photos":[["🪨","🪨"],["⚪","⚪"],["🏛️","🏛️"],["🗿","🗿"]]},
 24:{"answer":"ГЛИНА","hint":"Материал или приём, связанный со скульптурой и объёмной формой.","photos":[["🏺","🏺"],["👐","👐"],["🟤","🟤"],["🔥","🔥"]]},
 25:{"answer":"РЕЗЕЦ","hint":"Материал или приём, связанный со скульптурой и объёмной формой.","photos":[["🔨","🔨"],["🗿","🗿"],["🪨","🪨"],["✋","✋"]]},
 26:{"answer":"МУЗЫКА","hint":"Понятие из музыки, звучания и исполнения.","photos":[["🎵","🎵"],["🎧","🎧"],["🎼","🎼"],["🎶","🎶"]]},
 27:{"answer":"МЕЛОДИЯ","hint":"Понятие из музыки, звучания и исполнения.","photos":[["🎶","🎶"],["🎼","🎼"],["❤️","❤️"],["🎧","🎧"]]},
 28:{"answer":"РИТМ","hint":"Понятие из музыки, звучания и исполнения.","photos":[["🥁","🥁"],["🎵","🎵"],["⏱️","⏱️"],["💃","💃"]]},
 29:{"answer":"НОТА","hint":"Понятие из музыки, звучания и исполнения.","photos":[["🎵","🎵"],["📄","📄"],["🎼","🎼"],["🔤","🔤"]]},
 30:{"answer":"АККОРД","hint":"Понятие из музыки, звучания и исполнения.","photos":[["🎹","🎹"],["🎸","🎸"],["🎼","🎼"],["🤝","🤝"]]},
 31:{"answer":"СКРИПКА","hint":"Понятие из музыки, звучания и исполнения.","photos":[["🎻","🎻"],["🎼","🎼"],["🎶","🎶"],["👂","👂"]]},
 32:{"answer":"ПИАНИНО","hint":"Понятие из музыки, звучания и исполнения.","photos":[["🎹","🎹"],["🎼","🎼"],["🎵","🎵"],["🎤","🎤"]]},
 33:{"answer":"ГИТАРА","hint":"Понятие из музыки, звучания и исполнения.","photos":[["🎸","🎸"],["🎶","🎶"],["🎵","🎵"],["🤘","🤘"]]},
 34:{"answer":"БАРАБАН","hint":"Понятие из музыки, звучания и исполнения.","photos":[["🥁","🥁"],["🎵","🎵"],["💥","💥"],["🎶","🎶"]]},
 35:{"answer":"ФЛЕЙТА","hint":"Понятие из музыки, звучания и исполнения.","photos":[["🪈","🪈"],["🎵","🎵"],["🌬️","🌬️"],["🎼","🎼"]]},
 36:{"answer":"ОРКЕСТР","hint":"Понятие из музыки, звучания и исполнения.","photos":[["🎻","🎻"],["🎺","🎺"],["🥁","🥁"],["🎼","🎼"]]},
 37:{"answer":"ДИРИЖЕР","hint":"Понятие из музыки, звучания и исполнения.","photos":[["🎼","🎼"],["🪄","🪄"],["👥","👥"],["🎻","🎻"]]},
 38:{"answer":"КОНЦЕРТ","hint":"Понятие из музыки, звучания и исполнения.","photos":[["🎤","🎤"],["🎟️","🎟️"],["🎶","🎶"],["👥","👥"]]},
 39:{"answer":"СЦЕНА","hint":"Понятие из театра, танца и сценического искусства.","photos":[["🎭","🎭"],["💡","💡"],["👥","👥"],["🎤","🎤"]]},
 40:{"answer":"ТЕАТР","hint":"Понятие из театра, танца и сценического искусства.","photos":[["🎭","🎭"],["🏛️","🏛️"],["🎟️","🎟️"],["👥","👥"]]},
 41:{"answer":"АКТЕР","hint":"Понятие из театра, танца и сценического искусства.","photos":[["🎭","🎭"],["🧑","🧑"],["🎬","🎬"],["👏","👏"]]},
 42:{"answer":"БАЛЕТ","hint":"Понятие из театра, танца и сценического искусства.","photos":[["🩰","🩰"],["🎶","🎶"],["🎭","🎭"],["👯","👯"]]},
 43:{"answer":"ТАНЕЦ","hint":"Понятие из театра, танца и сценического искусства.","photos":[["💃","💃"],["🕺","🕺"],["🎶","🎶"],["👣","👣"]]},
 44:{"answer":"ОПЕРА","hint":"Понятие из театра, танца и сценического искусства.","photos":[["🎭","🎭"],["🎶","🎶"],["🎤","🎤"],["🏛️","🏛️"]]},
 45:{"answer":"МАСКА","hint":"Понятие из театра, танца и сценического искусства.","photos":[["🎭","🎭"],["😶‍🌫️","😶‍🌫️"],["🎉","🎉"],["👤","👤"]]},
 46:{"answer":"ЗАНАВЕС","hint":"Понятие из театра, танца и сценического искусства.","photos":[["🎭","🎭"],["🟥","🟥"],["↔️","↔️"],["💡","💡"]]},
 47:{"answer":"ДЕКОРАЦИЯ","hint":"Понятие из театра, танца и сценического искусства.","photos":[["🏰","🏰"],["🌳","🌳"],["🎭","🎭"],["🛠️","🛠️"]]},
 48:{"answer":"КОСТЮМ","hint":"Понятие из театра, танца и сценического искусства.","photos":[["👗","👗"],["🎭","🎭"],["🧵","🧵"],["🎬","🎬"]]},
 49:{"answer":"РЕПЕТИЦИЯ","hint":"Понятие из театра, танца и сценического искусства.","photos":[["🎭","🎭"],["🔁","🔁"],["📝","📝"],["👥","👥"]]},
 50:{"answer":"ПРЕМЬЕРА","hint":"Понятие из театра, танца и сценического искусства.","photos":[["🎟️","🎟️"],["✨","✨"],["🎭","🎭"],["👏","👏"]]},
 51:{"answer":"АРХИТЕКТУРА","hint":"Элемент архитектуры, декора или художественного построения формы.","photos":[["🏛️","🏛️"],["📐","📐"],["🏗️","🏗️"],["🎨","🎨"]]},
 52:{"answer":"АРКА","hint":"Элемент архитектуры, декора или художественного построения формы.","photos":[["🏛️","🏛️"],["🌉","🌉"],["⭕","⭕"],["📐","📐"]]},
 53:{"answer":"КОЛОННА","hint":"Элемент архитектуры, декора или художественного построения формы.","photos":[["🏛️","🏛️"],["⬆️","⬆️"],["🪨","🪨"],["📐","📐"]]},
 54:{"answer":"ФАСАД","hint":"Элемент архитектуры, декора или художественного построения формы.","photos":[["🏢","🏢"],["🎨","🎨"],["🚪","🚪"],["🪟","🪟"]]},
 55:{"answer":"ВИТРАЖ","hint":"Элемент архитектуры, декора или художественного построения формы.","photos":[["🪟","🪟"],["🌈","🌈"],["⛪","⛪"],["🎨","🎨"]]},
 56:{"answer":"МОЗАИКА","hint":"Элемент архитектуры, декора или художественного построения формы.","photos":[["🔷","🔷"],["🔶","🔶"],["🧩","🧩"],["🎨","🎨"]]},
 57:{"answer":"ОРНАМЕНТ","hint":"Элемент архитектуры, декора или художественного построения формы.","photos":[["🌿","🌿"],["🔁","🔁"],["🎨","🎨"],["🏺","🏺"]]},
 58:{"answer":"УЗОР","hint":"Элемент архитектуры, декора или художественного построения формы.","photos":[["🧶","🧶"],["🔷","🔷"],["🔁","🔁"],["🎨","🎨"]]},
 59:{"answer":"СИММЕТРИЯ","hint":"Элемент архитектуры, декора или художественного построения формы.","photos":[["⚖️","⚖️"],["🪞","🪞"],["◀️","◀️"],["▶️","▶️"]]},
 60:{"answer":"КОМПОЗИЦИЯ","hint":"Элемент архитектуры, декора или художественного построения формы.","photos":[["🖼️","🖼️"],["📐","📐"],["🎨","🎨"],["👀","👀"]]},
 61:{"answer":"ФОТО","hint":"Понятие из фотографии и работы с изображением камерой.","photos":[["📷","📷"],["🖼️","🖼️"],["👀","👀"],["✨","✨"]]},
 62:{"answer":"КАМЕРА","hint":"Понятие из фотографии и работы с изображением камерой.","photos":[["📷","📷"],["🔘","🔘"],["👁️","👁️"],["🖼️","🖼️"]]},
 63:{"answer":"ОБЪЕКТИВ","hint":"Понятие из фотографии и работы с изображением камерой.","photos":[["📷","📷"],["🔍","🔍"],["👁️","👁️"],["💡","💡"]]},
 64:{"answer":"ВСПЫШКА","hint":"Понятие из фотографии и работы с изображением камерой.","photos":[["📸","📸"],["⚡","⚡"],["🌙","🌙"],["✨","✨"]]},
 65:{"answer":"ЭКСПОЗИЦИЯ","hint":"Понятие из фотографии и работы с изображением камерой.","photos":[["📷","📷"],["☀️","☀️"],["⏱️","⏱️"],["🎚️","🎚️"]]},
 66:{"answer":"РАКУРС","hint":"Понятие из фотографии и работы с изображением камерой.","photos":[["📷","📷"],["↗️","↗️"],["👁️","👁️"],["🎬","🎬"]]},
 67:{"answer":"КАДР","hint":"Понятие из фотографии и работы с изображением камерой.","photos":[["🎞️","🎞️"],["📷","📷"],["🖼️","🖼️"],["⏱️","⏱️"]]},
 68:{"answer":"ФОТОГРАФ","hint":"Понятие из фотографии и работы с изображением камерой.","photos":[["📷","📷"],["🧑‍🎨","🧑‍🎨"],["👀","👀"],["🏞️","🏞️"]]},
 69:{"answer":"ПЛЕНКА","hint":"Понятие из фотографии и работы с изображением камерой.","photos":[["🎞️","🎞️"],["📷","📷"],["🧪","🧪"],["🖼️","🖼️"]]},
 70:{"answer":"РЕТУШЬ","hint":"Понятие из фотографии и работы с изображением камерой.","photos":[["💻","💻"],["📷","📷"],["✨","✨"],["🖌️","🖌️"]]},
 71:{"answer":"ДИЗАЙН","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["✏️","✏️"],["📐","📐"],["💻","💻"],["🎨","🎨"]]},
 72:{"answer":"ШРИФТ","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["🔤","🔤"],["🅰️","🅰️"],["✒️","✒️"],["📄","📄"]]},
 73:{"answer":"ЛОГОТИП","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["🔵","🔵"],["🔺","🔺"],["🔤","🔤"],["🏷️","🏷️"]]},
 74:{"answer":"ПОСТЕР","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["📰","📰"],["🎨","🎨"],["📌","📌"],["🖼️","🖼️"]]},
 75:{"answer":"КОЛЛАЖ","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["✂️","✂️"],["📰","📰"],["🧩","🧩"],["🎨","🎨"]]},
 76:{"answer":"ИЛЛЮСТРАЦИЯ","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["📖","📖"],["🖌️","🖌️"],["🎨","🎨"],["🖼️","🖼️"]]},
 77:{"answer":"КОМИКС","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["💬","💬"],["🦸","🦸"],["📖","📖"],["🎨","🎨"]]},
 78:{"answer":"АНИМАЦИЯ","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["🎞️","🎞️"],["🖥️","🖥️"],["🏃","🏃"],["✨","✨"]]},
 79:{"answer":"КЕРАМИКА","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["🏺","🏺"],["🔥","🔥"],["👐","👐"],["🎨","🎨"]]},
 80:{"answer":"ФАРФОР","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["🍽️","🍽️"],["⚪","⚪"],["🏺","🏺"],["✨","✨"]]},
 81:{"answer":"ЮВЕЛИР","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["💍","💍"],["🔨","🔨"],["💎","💎"],["✨","✨"]]},
 82:{"answer":"ЭМАЛЬ","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["🔥","🔥"],["🎨","🎨"],["💍","💍"],["🏺","🏺"]]},
 83:{"answer":"ГОБЕЛЕН","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["🧵","🧵"],["🖼️","🖼️"],["🏰","🏰"],["🎨","🎨"]]},
 84:{"answer":"ВЫШИВКА","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["🪡","🪡"],["🧵","🧵"],["🌸","🌸"],["👗","👗"]]},
 85:{"answer":"КАЛЛИГРАФИЯ","hint":"Понятие из дизайна, иллюстрации или декоративного искусства.","photos":[["✒️","✒️"],["📜","📜"],["🖋️","🖋️"],["🔤","🔤"]]},
 86:{"answer":"ПОЭЗИЯ","hint":"Понятие из литературы и художественного текста.","photos":[["✍️","✍️"],["📖","📖"],["🌙","🌙"],["❤️","❤️"]]},
 87:{"answer":"РОМАН","hint":"Понятие из литературы и художественного текста.","photos":[["📚","📚"],["📖","📖"],["🧑‍💻","🧑‍💻"],["☕","☕"]]},
 88:{"answer":"СТИХ","hint":"Понятие из литературы и художественного текста.","photos":[["📝","📝"],["📖","📖"],["🎵","🎵"],["✍️","✍️"]]},
 89:{"answer":"РИФМА","hint":"Понятие из литературы и художественного текста.","photos":[["🎵","🎵"],["🔤","🔤"],["📝","📝"],["🔁","🔁"]]},
 90:{"answer":"МЕТАФОРА","hint":"Понятие из литературы и художественного текста.","photos":[["💭","💭"],["📝","📝"],["🌉","🌉"],["🧠","🧠"]]},
 91:{"answer":"МИНИАТЮРА","hint":"Термин, связанный с художественными стилями, эпохами или мастерством.","photos":[["🖼️","🖼️"],["🔍","🔍"],["🎨","🎨"],["📜","📜"]]},
 92:{"answer":"ИКОНА","hint":"Термин, связанный с художественными стилями, эпохами или мастерством.","photos":[["🖼️","🖼️"],["⛪","⛪"],["✨","✨"],["🙏","🙏"]]},
 93:{"answer":"АВАНГАРД","hint":"Термин, связанный с художественными стилями, эпохами или мастерством.","photos":[["⚡","⚡"],["🎨","🎨"],["🚀","🚀"],["🖼️","🖼️"]]},
 94:{"answer":"ИМПРЕССИОНИЗМ","hint":"Термин, связанный с художественными стилями, эпохами или мастерством.","photos":[["🌅","🌅"],["🎨","🎨"],["🖌️","🖌️"],["💡","💡"]]},
 95:{"answer":"КУБИЗМ","hint":"Термин, связанный с художественными стилями, эпохами или мастерством.","photos":[["🔷","🔷"],["🔶","🔶"],["🟥","🟥"],["🟦","🟦"]]},
 96:{"answer":"СЮРРЕАЛИЗМ","hint":"Термин, связанный с художественными стилями, эпохами или мастерством.","photos":[["🌀","🌀"],["🌙","🌙"],["🧠","🧠"],["🎨","🎨"]]},
 97:{"answer":"РЕАЛИЗМ","hint":"Термин, связанный с художественными стилями, эпохами или мастерством.","photos":[["👤","👤"],["🏙️","🏙️"],["🖼️","🖼️"],["👀","👀"]]},
 98:{"answer":"РЕНЕССАНС","hint":"Термин, связанный с художественными стилями, эпохами или мастерством.","photos":[["🏛️","🏛️"],["🎨","🎨"],["📜","📜"],["🌟","🌟"]]},
 99:{"answer":"ШЕДЕВР","hint":"Термин, связанный с художественными стилями, эпохами или мастерством.","photos":[["🏆","🏆"],["🖼️","🖼️"],["✨","✨"],["👑","👑"]]},
 100:{"answer":"ТВОРЧЕСТВО","hint":"Термин, связанный с художественными стилями, эпохами или мастерством.","photos":[["💡","💡"],["🎨","🎨"],["🧠","🧠"],["✨","✨"]]}
};
const ART_TRANSLATED={
 "en": {
  "1": {
   "answer": "BRUSH",
   "hint": "A concept or tool from painting and image-making."
  },
  "2": {
   "answer": "PAINT",
   "hint": "A concept or tool from painting and image-making."
  },
  "3": {
   "answer": "CANVAS",
   "hint": "A concept or tool from painting and image-making."
  },
  "4": {
   "answer": "PALETTE",
   "hint": "A concept or tool from painting and image-making."
  },
  "5": {
   "answer": "PAINTING",
   "hint": "A concept or tool from painting and image-making."
  },
  "6": {
   "answer": "PORTRAIT",
   "hint": "A concept or tool from painting and image-making."
  },
  "7": {
   "answer": "LANDSCAPE",
   "hint": "A concept or tool from painting and image-making."
  },
  "8": {
   "answer": "STILLLIFE",
   "hint": "A concept or tool from painting and image-making."
  },
  "9": {
   "answer": "SKETCH",
   "hint": "A concept or tool from painting and image-making."
  },
  "10": {
   "answer": "FRAME",
   "hint": "A concept or tool from painting and image-making."
  },
  "11": {
   "answer": "GALLERY",
   "hint": "A concept or tool from painting and image-making."
  },
  "12": {
   "answer": "MUSEUM",
   "hint": "A concept or tool from painting and image-making."
  },
  "13": {
   "answer": "ARTIST",
   "hint": "A concept or tool from painting and image-making."
  },
  "14": {
   "answer": "EASEL",
   "hint": "A concept or tool from painting and image-making."
  },
  "15": {
   "answer": "WATERCOLOR",
   "hint": "A concept or tool from painting and image-making."
  },
  "16": {
   "answer": "GOUACHE",
   "hint": "A concept or tool from painting and image-making."
  },
  "17": {
   "answer": "OIL",
   "hint": "A concept or tool from painting and image-making."
  },
  "18": {
   "answer": "FRESCO",
   "hint": "A concept or tool from painting and image-making."
  },
  "19": {
   "answer": "GRAPHICS",
   "hint": "A concept or tool from painting and image-making."
  },
  "20": {
   "answer": "ENGRAVING",
   "hint": "A concept or tool from painting and image-making."
  },
  "21": {
   "answer": "SCULPTURE",
   "hint": "A material or technique connected with sculpture and three-dimensional form."
  },
  "22": {
   "answer": "STATUE",
   "hint": "A material or technique connected with sculpture and three-dimensional form."
  },
  "23": {
   "answer": "MARBLE",
   "hint": "A material or technique connected with sculpture and three-dimensional form."
  },
  "24": {
   "answer": "CLAY",
   "hint": "A material or technique connected with sculpture and three-dimensional form."
  },
  "25": {
   "answer": "CHISEL",
   "hint": "A material or technique connected with sculpture and three-dimensional form."
  },
  "26": {
   "answer": "MUSIC",
   "hint": "A concept from music, sound, and performance."
  },
  "27": {
   "answer": "MELODY",
   "hint": "A concept from music, sound, and performance."
  },
  "28": {
   "answer": "RHYTHM",
   "hint": "A concept from music, sound, and performance."
  },
  "29": {
   "answer": "NOTE",
   "hint": "A concept from music, sound, and performance."
  },
  "30": {
   "answer": "CHORD",
   "hint": "A concept from music, sound, and performance."
  },
  "31": {
   "answer": "VIOLIN",
   "hint": "A concept from music, sound, and performance."
  },
  "32": {
   "answer": "PIANO",
   "hint": "A concept from music, sound, and performance."
  },
  "33": {
   "answer": "GUITAR",
   "hint": "A concept from music, sound, and performance."
  },
  "34": {
   "answer": "DRUM",
   "hint": "A concept from music, sound, and performance."
  },
  "35": {
   "answer": "FLUTE",
   "hint": "A concept from music, sound, and performance."
  },
  "36": {
   "answer": "ORCHESTRA",
   "hint": "A concept from music, sound, and performance."
  },
  "37": {
   "answer": "CONDUCTOR",
   "hint": "A concept from music, sound, and performance."
  },
  "38": {
   "answer": "CONCERT",
   "hint": "A concept from music, sound, and performance."
  },
  "39": {
   "answer": "STAGE",
   "hint": "A concept from theater, dance, and stage art."
  },
  "40": {
   "answer": "THEATER",
   "hint": "A concept from theater, dance, and stage art."
  },
  "41": {
   "answer": "ACTOR",
   "hint": "A concept from theater, dance, and stage art."
  },
  "42": {
   "answer": "BALLET",
   "hint": "A concept from theater, dance, and stage art."
  },
  "43": {
   "answer": "DANCE",
   "hint": "A concept from theater, dance, and stage art."
  },
  "44": {
   "answer": "OPERA",
   "hint": "A concept from theater, dance, and stage art."
  },
  "45": {
   "answer": "MASK",
   "hint": "A concept from theater, dance, and stage art."
  },
  "46": {
   "answer": "CURTAIN",
   "hint": "A concept from theater, dance, and stage art."
  },
  "47": {
   "answer": "SCENERY",
   "hint": "A concept from theater, dance, and stage art."
  },
  "48": {
   "answer": "COSTUME",
   "hint": "A concept from theater, dance, and stage art."
  },
  "49": {
   "answer": "REHEARSAL",
   "hint": "A concept from theater, dance, and stage art."
  },
  "50": {
   "answer": "PREMIERE",
   "hint": "A concept from theater, dance, and stage art."
  },
  "51": {
   "answer": "ARCHITECTURE",
   "hint": "An element of architecture, decoration, or artistic form."
  },
  "52": {
   "answer": "ARCH",
   "hint": "An element of architecture, decoration, or artistic form."
  },
  "53": {
   "answer": "COLUMN",
   "hint": "An element of architecture, decoration, or artistic form."
  },
  "54": {
   "answer": "FACADE",
   "hint": "An element of architecture, decoration, or artistic form."
  },
  "55": {
   "answer": "STAINEDGLASS",
   "hint": "An element of architecture, decoration, or artistic form."
  },
  "56": {
   "answer": "MOSAIC",
   "hint": "An element of architecture, decoration, or artistic form."
  },
  "57": {
   "answer": "ORNAMENT",
   "hint": "An element of architecture, decoration, or artistic form."
  },
  "58": {
   "answer": "PATTERN",
   "hint": "An element of architecture, decoration, or artistic form."
  },
  "59": {
   "answer": "SYMMETRY",
   "hint": "An element of architecture, decoration, or artistic form."
  },
  "60": {
   "answer": "COMPOSITION",
   "hint": "An element of architecture, decoration, or artistic form."
  },
  "61": {
   "answer": "PHOTO",
   "hint": "A concept from photography and camera-based image-making."
  },
  "62": {
   "answer": "CAMERA",
   "hint": "A concept from photography and camera-based image-making."
  },
  "63": {
   "answer": "LENS",
   "hint": "A concept from photography and camera-based image-making."
  },
  "64": {
   "answer": "FLASH",
   "hint": "A concept from photography and camera-based image-making."
  },
  "65": {
   "answer": "EXPOSURE",
   "hint": "A concept from photography and camera-based image-making."
  },
  "66": {
   "answer": "ANGLE",
   "hint": "A concept from photography and camera-based image-making."
  },
  "67": {
   "answer": "SHOT",
   "hint": "A concept from photography and camera-based image-making."
  },
  "68": {
   "answer": "PHOTOGRAPHER",
   "hint": "A concept from photography and camera-based image-making."
  },
  "69": {
   "answer": "FILM",
   "hint": "A concept from photography and camera-based image-making."
  },
  "70": {
   "answer": "RETOUCH",
   "hint": "A concept from photography and camera-based image-making."
  },
  "71": {
   "answer": "DESIGN",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "72": {
   "answer": "FONT",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "73": {
   "answer": "LOGO",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "74": {
   "answer": "POSTER",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "75": {
   "answer": "COLLAGE",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "76": {
   "answer": "ILLUSTRATION",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "77": {
   "answer": "COMIC",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "78": {
   "answer": "ANIMATION",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "79": {
   "answer": "CERAMICS",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "80": {
   "answer": "PORCELAIN",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "81": {
   "answer": "JEWELER",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "82": {
   "answer": "ENAMEL",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "83": {
   "answer": "TAPESTRY",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "84": {
   "answer": "EMBROIDERY",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "85": {
   "answer": "CALLIGRAPHY",
   "hint": "A concept from design, illustration, or decorative art."
  },
  "86": {
   "answer": "POETRY",
   "hint": "A concept from literature and artistic writing."
  },
  "87": {
   "answer": "NOVEL",
   "hint": "A concept from literature and artistic writing."
  },
  "88": {
   "answer": "VERSE",
   "hint": "A concept from literature and artistic writing."
  },
  "89": {
   "answer": "RHYME",
   "hint": "A concept from literature and artistic writing."
  },
  "90": {
   "answer": "METAPHOR",
   "hint": "A concept from literature and artistic writing."
  },
  "91": {
   "answer": "MINIATURE",
   "hint": "A term connected with artistic styles, periods, or mastery."
  },
  "92": {
   "answer": "ICON",
   "hint": "A term connected with artistic styles, periods, or mastery."
  },
  "93": {
   "answer": "AVANTGARDE",
   "hint": "A term connected with artistic styles, periods, or mastery."
  },
  "94": {
   "answer": "IMPRESSIONISM",
   "hint": "A term connected with artistic styles, periods, or mastery."
  },
  "95": {
   "answer": "CUBISM",
   "hint": "A term connected with artistic styles, periods, or mastery."
  },
  "96": {
   "answer": "SURREALISM",
   "hint": "A term connected with artistic styles, periods, or mastery."
  },
  "97": {
   "answer": "REALISM",
   "hint": "A term connected with artistic styles, periods, or mastery."
  },
  "98": {
   "answer": "RENAISSANCE",
   "hint": "A term connected with artistic styles, periods, or mastery."
  },
  "99": {
   "answer": "MASTERPIECE",
   "hint": "A term connected with artistic styles, periods, or mastery."
  },
  "100": {
   "answer": "CREATIVITY",
   "hint": "A term connected with artistic styles, periods, or mastery."
  }
 },
 "az": {
  "1": {
   "answer": "FIRÇA",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "2": {
   "answer": "BOYA",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "3": {
   "answer": "KƏTAN",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "4": {
   "answer": "PALETRA",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "5": {
   "answer": "RƏSM",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "6": {
   "answer": "PORTRET",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "7": {
   "answer": "MƏNZƏRƏ",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "8": {
   "answer": "NATÜRMORT",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "9": {
   "answer": "ESKİZ",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "10": {
   "answer": "ÇƏRÇİVƏ",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "11": {
   "answer": "QALEREYA",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "12": {
   "answer": "MUZEY",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "13": {
   "answer": "RƏSSAM",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "14": {
   "answer": "MOLBERT",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "15": {
   "answer": "AKVAREL",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "16": {
   "answer": "QUAŞ",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "17": {
   "answer": "YAĞ",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "18": {
   "answer": "FRESKA",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "19": {
   "answer": "QRAFİKA",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "20": {
   "answer": "QRAVÜRA",
   "hint": "Rəssamlıq və təsvir yaratma ilə bağlı anlayış və ya alət."
  },
  "21": {
   "answer": "HEYKƏLTƏRAŞLIQ",
   "hint": "Heykəltəraşlıq və həcmli forma ilə bağlı material və ya üsul."
  },
  "22": {
   "answer": "HEYKƏL",
   "hint": "Heykəltəraşlıq və həcmli forma ilə bağlı material və ya üsul."
  },
  "23": {
   "answer": "MƏRMƏR",
   "hint": "Heykəltəraşlıq və həcmli forma ilə bağlı material və ya üsul."
  },
  "24": {
   "answer": "GİL",
   "hint": "Heykəltəraşlıq və həcmli forma ilə bağlı material və ya üsul."
  },
  "25": {
   "answer": "KƏSKİ",
   "hint": "Heykəltəraşlıq və həcmli forma ilə bağlı material və ya üsul."
  },
  "26": {
   "answer": "MUSİQİ",
   "hint": "Musiqi, səs və ifa ilə bağlı anlayış."
  },
  "27": {
   "answer": "MELODİYA",
   "hint": "Musiqi, səs və ifa ilə bağlı anlayış."
  },
  "28": {
   "answer": "RİTM",
   "hint": "Musiqi, səs və ifa ilə bağlı anlayış."
  },
  "29": {
   "answer": "NOT",
   "hint": "Musiqi, səs və ifa ilə bağlı anlayış."
  },
  "30": {
   "answer": "AKKORD",
   "hint": "Musiqi, səs və ifa ilə bağlı anlayış."
  },
  "31": {
   "answer": "SKRİPKA",
   "hint": "Musiqi, səs və ifa ilə bağlı anlayış."
  },
  "32": {
   "answer": "PİANO",
   "hint": "Musiqi, səs və ifa ilə bağlı anlayış."
  },
  "33": {
   "answer": "GİTARA",
   "hint": "Musiqi, səs və ifa ilə bağlı anlayış."
  },
  "34": {
   "answer": "BARABAN",
   "hint": "Musiqi, səs və ifa ilə bağlı anlayış."
  },
  "35": {
   "answer": "FLEYTA",
   "hint": "Musiqi, səs və ifa ilə bağlı anlayış."
  },
  "36": {
   "answer": "ORKESTR",
   "hint": "Musiqi, səs və ifa ilə bağlı anlayış."
  },
  "37": {
   "answer": "DİRİJOR",
   "hint": "Musiqi, səs və ifa ilə bağlı anlayış."
  },
  "38": {
   "answer": "KONSERT",
   "hint": "Musiqi, səs və ifa ilə bağlı anlayış."
  },
  "39": {
   "answer": "SƏHNƏ",
   "hint": "Teatr, rəqs və səhnə sənəti ilə bağlı anlayış."
  },
  "40": {
   "answer": "TEATR",
   "hint": "Teatr, rəqs və səhnə sənəti ilə bağlı anlayış."
  },
  "41": {
   "answer": "AKTYOR",
   "hint": "Teatr, rəqs və səhnə sənəti ilə bağlı anlayış."
  },
  "42": {
   "answer": "BALET",
   "hint": "Teatr, rəqs və səhnə sənəti ilə bağlı anlayış."
  },
  "43": {
   "answer": "RƏQS",
   "hint": "Teatr, rəqs və səhnə sənəti ilə bağlı anlayış."
  },
  "44": {
   "answer": "OPERA",
   "hint": "Teatr, rəqs və səhnə sənəti ilə bağlı anlayış."
  },
  "45": {
   "answer": "MASKA",
   "hint": "Teatr, rəqs və səhnə sənəti ilə bağlı anlayış."
  },
  "46": {
   "answer": "PƏRDƏ",
   "hint": "Teatr, rəqs və səhnə sənəti ilə bağlı anlayış."
  },
  "47": {
   "answer": "DEKORASİYA",
   "hint": "Teatr, rəqs və səhnə sənəti ilə bağlı anlayış."
  },
  "48": {
   "answer": "KOSTYUM",
   "hint": "Teatr, rəqs və səhnə sənəti ilə bağlı anlayış."
  },
  "49": {
   "answer": "REPETİSİYA",
   "hint": "Teatr, rəqs və səhnə sənəti ilə bağlı anlayış."
  },
  "50": {
   "answer": "PREMYERA",
   "hint": "Teatr, rəqs və səhnə sənəti ilə bağlı anlayış."
  },
  "51": {
   "answer": "MEMARLIQ",
   "hint": "Memarlıq, dekor və bədii forma quruluşu ilə bağlı element."
  },
  "52": {
   "answer": "TAĞ",
   "hint": "Memarlıq, dekor və bədii forma quruluşu ilə bağlı element."
  },
  "53": {
   "answer": "SÜTUN",
   "hint": "Memarlıq, dekor və bədii forma quruluşu ilə bağlı element."
  },
  "54": {
   "answer": "FASAD",
   "hint": "Memarlıq, dekor və bədii forma quruluşu ilə bağlı element."
  },
  "55": {
   "answer": "VİTRAJ",
   "hint": "Memarlıq, dekor və bədii forma quruluşu ilə bağlı element."
  },
  "56": {
   "answer": "MOZAİKA",
   "hint": "Memarlıq, dekor və bədii forma quruluşu ilə bağlı element."
  },
  "57": {
   "answer": "ORNAMENT",
   "hint": "Memarlıq, dekor və bədii forma quruluşu ilə bağlı element."
  },
  "58": {
   "answer": "NAXIŞ",
   "hint": "Memarlıq, dekor və bədii forma quruluşu ilə bağlı element."
  },
  "59": {
   "answer": "SİMMETRİYA",
   "hint": "Memarlıq, dekor və bədii forma quruluşu ilə bağlı element."
  },
  "60": {
   "answer": "KOMPOZİSİYA",
   "hint": "Memarlıq, dekor və bədii forma quruluşu ilə bağlı element."
  },
  "61": {
   "answer": "FOTO",
   "hint": "Fotoqrafiya və kamera ilə təsvir yaratma sahəsinə aid anlayış."
  },
  "62": {
   "answer": "KAMERA",
   "hint": "Fotoqrafiya və kamera ilə təsvir yaratma sahəsinə aid anlayış."
  },
  "63": {
   "answer": "OBYEKTİV",
   "hint": "Fotoqrafiya və kamera ilə təsvir yaratma sahəsinə aid anlayış."
  },
  "64": {
   "answer": "FLAŞ",
   "hint": "Fotoqrafiya və kamera ilə təsvir yaratma sahəsinə aid anlayış."
  },
  "65": {
   "answer": "EKSPOZİSİYA",
   "hint": "Fotoqrafiya və kamera ilə təsvir yaratma sahəsinə aid anlayış."
  },
  "66": {
   "answer": "RAKURS",
   "hint": "Fotoqrafiya və kamera ilə təsvir yaratma sahəsinə aid anlayış."
  },
  "67": {
   "answer": "KADR",
   "hint": "Fotoqrafiya və kamera ilə təsvir yaratma sahəsinə aid anlayış."
  },
  "68": {
   "answer": "FOTOQRAF",
   "hint": "Fotoqrafiya və kamera ilə təsvir yaratma sahəsinə aid anlayış."
  },
  "69": {
   "answer": "LENT",
   "hint": "Fotoqrafiya və kamera ilə təsvir yaratma sahəsinə aid anlayış."
  },
  "70": {
   "answer": "RETUŞ",
   "hint": "Fotoqrafiya və kamera ilə təsvir yaratma sahəsinə aid anlayış."
  },
  "71": {
   "answer": "DİZAYN",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "72": {
   "answer": "ŞRİFT",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "73": {
   "answer": "LOQO",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "74": {
   "answer": "POSTER",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "75": {
   "answer": "KOLLAJ",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "76": {
   "answer": "İLLÜSTRASİYA",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "77": {
   "answer": "KOMİKS",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "78": {
   "answer": "ANİMASİYA",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "79": {
   "answer": "KERAMİKA",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "80": {
   "answer": "FARFOR",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "81": {
   "answer": "ZƏRGƏR",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "82": {
   "answer": "MİNA",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "83": {
   "answer": "QOBELEN",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "84": {
   "answer": "TİKMƏ",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "85": {
   "answer": "KALLİQRAFİYA",
   "hint": "Dizayn, illüstrasiya və ya dekorativ sənətlə bağlı anlayış."
  },
  "86": {
   "answer": "POEZİYA",
   "hint": "Ədəbiyyat və bədii mətnlə bağlı anlayış."
  },
  "87": {
   "answer": "ROMAN",
   "hint": "Ədəbiyyat və bədii mətnlə bağlı anlayış."
  },
  "88": {
   "answer": "ŞEİR",
   "hint": "Ədəbiyyat və bədii mətnlə bağlı anlayış."
  },
  "89": {
   "answer": "QAFİYƏ",
   "hint": "Ədəbiyyat və bədii mətnlə bağlı anlayış."
  },
  "90": {
   "answer": "METAFORA",
   "hint": "Ədəbiyyat və bədii mətnlə bağlı anlayış."
  },
  "91": {
   "answer": "MİNİATÜR",
   "hint": "Bədii üslub, dövr və ya sənətkarlıqla bağlı termin."
  },
  "92": {
   "answer": "İKONA",
   "hint": "Bədii üslub, dövr və ya sənətkarlıqla bağlı termin."
  },
  "93": {
   "answer": "AVANQARD",
   "hint": "Bədii üslub, dövr və ya sənətkarlıqla bağlı termin."
  },
  "94": {
   "answer": "İMPRESSİONİZM",
   "hint": "Bədii üslub, dövr və ya sənətkarlıqla bağlı termin."
  },
  "95": {
   "answer": "KUBİZM",
   "hint": "Bədii üslub, dövr və ya sənətkarlıqla bağlı termin."
  },
  "96": {
   "answer": "SÜRREALİZM",
   "hint": "Bədii üslub, dövr və ya sənətkarlıqla bağlı termin."
  },
  "97": {
   "answer": "REALİZM",
   "hint": "Bədii üslub, dövr və ya sənətkarlıqla bağlı termin."
  },
  "98": {
   "answer": "RENESSANS",
   "hint": "Bədii üslub, dövr və ya sənətkarlıqla bağlı termin."
  },
  "99": {
   "answer": "ŞEDEVR",
   "hint": "Bədii üslub, dövr və ya sənətkarlıqla bağlı termin."
  },
  "100": {
   "answer": "YARADICILIQ",
   "hint": "Bədii üslub, dövr və ya sənətkarlıqla bağlı termin."
  }
 }
};
const PROF_LEVELS={
 "1": {
  "answer": "ВРАЧ",
  "hint": "Профессия, связанная с медициной и здоровьем.",
  "photos": [
   [
    "🩺",
    "🩺"
   ],
   [
    "🏥",
    "🏥"
   ],
   [
    "💊",
    "💊"
   ],
   [
    "👨‍⚕️",
    "👨‍⚕️"
   ]
  ]
 },
 "2": {
  "answer": "УЧИТЕЛЬ",
  "hint": "Профессия, связанная с обучением и развитием людей.",
  "photos": [
   [
    "🏫",
    "🏫"
   ],
   [
    "📚",
    "📚"
   ],
   [
    "✏️",
    "✏️"
   ],
   [
    "👩‍🏫",
    "👩‍🏫"
   ]
  ]
 },
 "3": {
  "answer": "ПОВАР",
  "hint": "Профессия, связанная с приготовлением еды.",
  "photos": [
   [
    "👨‍🍳",
    "👨‍🍳"
   ],
   [
    "🍳",
    "🍳"
   ],
   [
    "🥘",
    "🥘"
   ],
   [
    "🔪",
    "🔪"
   ]
  ]
 },
 "4": {
  "answer": "ПОЛИЦЕЙСКИЙ",
  "hint": "Профессия, связанная с безопасностью и защитой людей.",
  "photos": [
   [
    "👮",
    "👮"
   ],
   [
    "🚓",
    "🚓"
   ],
   [
    "🚨",
    "🚨"
   ],
   [
    "🛡️",
    "🛡️"
   ]
  ]
 },
 "5": {
  "answer": "ПОЖАРНЫЙ",
  "hint": "Профессия, связанная с безопасностью и защитой людей.",
  "photos": [
   [
    "🧑‍🚒",
    "🧑‍🚒"
   ],
   [
    "🚒",
    "🚒"
   ],
   [
    "🔥",
    "🔥"
   ],
   [
    "🧯",
    "🧯"
   ]
  ]
 },
 "6": {
  "answer": "ВОДИТЕЛЬ",
  "hint": "Профессия, связанная с транспортом и перевозками.",
  "photos": [
   [
    "🚗",
    "🚗"
   ],
   [
    "🛣️",
    "🛣️"
   ],
   [
    "🛞",
    "🛞"
   ],
   [
    "🚦",
    "🚦"
   ]
  ]
 },
 "7": {
  "answer": "ПИЛОТ",
  "hint": "Профессия, связанная с транспортом и перевозками.",
  "photos": [
   [
    "✈️",
    "✈️"
   ],
   [
    "🛫",
    "🛫"
   ],
   [
    "☁️",
    "☁️"
   ],
   [
    "🧑‍✈️",
    "🧑‍✈️"
   ]
  ]
 },
 "8": {
  "answer": "СТРОИТЕЛЬ",
  "hint": "Профессия, связанная с строительством и обслуживанием зданий.",
  "photos": [
   [
    "🏗️",
    "🏗️"
   ],
   [
    "🧱",
    "🧱"
   ],
   [
    "🔨",
    "🔨"
   ],
   [
    "🏠",
    "🏠"
   ]
  ]
 },
 "9": {
  "answer": "ПРОДАВЕЦ",
  "hint": "Профессия, связанная с торговлей и покупателями.",
  "photos": [
   [
    "🛒",
    "🛒"
   ],
   [
    "🏪",
    "🏪"
   ],
   [
    "💳",
    "💳"
   ],
   [
    "📦",
    "📦"
   ]
  ]
 },
 "10": {
  "answer": "ФЕРМЕР",
  "hint": "Профессия, связанная с природой, растениями или сельским хозяйством.",
  "photos": [
   [
    "🚜",
    "🚜"
   ],
   [
    "🌾",
    "🌾"
   ],
   [
    "🐄",
    "🐄"
   ],
   [
    "🌱",
    "🌱"
   ]
  ]
 },
 "11": {
  "answer": "МЕХАНИК",
  "hint": "Профессия, связанная с техникой и технологиями.",
  "photos": [
   [
    "🔧",
    "🔧"
   ],
   [
    "🚗",
    "🚗"
   ],
   [
    "⚙️",
    "⚙️"
   ],
   [
    "🛠️",
    "🛠️"
   ]
  ]
 },
 "12": {
  "answer": "ЭЛЕКТРИК",
  "hint": "Профессия, связанная с техникой и технологиями.",
  "photos": [
   [
    "⚡",
    "⚡"
   ],
   [
    "🔌",
    "🔌"
   ],
   [
    "💡",
    "💡"
   ],
   [
    "🪛",
    "🪛"
   ]
  ]
 },
 "13": {
  "answer": "САНТЕХНИК",
  "hint": "Профессия, связанная с строительством и обслуживанием зданий.",
  "photos": [
   [
    "🚰",
    "🚰"
   ],
   [
    "🔧",
    "🔧"
   ],
   [
    "🚿",
    "🚿"
   ],
   [
    "💧",
    "💧"
   ]
  ]
 },
 "14": {
  "answer": "ПАРИКМАХЕР",
  "hint": "Профессия, связанная с обслуживанием людей.",
  "photos": [
   [
    "✂️",
    "✂️"
   ],
   [
    "💇",
    "💇"
   ],
   [
    "🪮",
    "🪮"
   ],
   [
    "🪞",
    "🪞"
   ]
  ]
 },
 "15": {
  "answer": "ПЕКАРЬ",
  "hint": "Профессия, связанная с приготовлением еды.",
  "photos": [
   [
    "🍞",
    "🍞"
   ],
   [
    "🥖",
    "🥖"
   ],
   [
    "🔥",
    "🔥"
   ],
   [
    "👨‍🍳",
    "👨‍🍳"
   ]
  ]
 },
 "16": {
  "answer": "КОНДИТЕР",
  "hint": "Профессия, связанная с приготовлением еды.",
  "photos": [
   [
    "🎂",
    "🎂"
   ],
   [
    "🧁",
    "🧁"
   ],
   [
    "🍰",
    "🍰"
   ],
   [
    "🍫",
    "🍫"
   ]
  ]
 },
 "17": {
  "answer": "ОФИЦИАНТ",
  "hint": "Профессия, связанная с обслуживанием людей.",
  "photos": [
   [
    "🍽️",
    "🍽️"
   ],
   [
    "📝",
    "📝"
   ],
   [
    "☕",
    "☕"
   ],
   [
    "🍴",
    "🍴"
   ]
  ]
 },
 "18": {
  "answer": "БАРМЕН",
  "hint": "Профессия, связанная с обслуживанием людей.",
  "photos": [
   [
    "🍹",
    "🍹"
   ],
   [
    "🥃",
    "🥃"
   ],
   [
    "🍸",
    "🍸"
   ],
   [
    "🧊",
    "🧊"
   ]
  ]
 },
 "19": {
  "answer": "ВИДЕОГРАФ",
  "hint": "Профессия, связанная с информацией, текстом или медиа.",
  "photos": [
   [
    "🎥",
    "🎥"
   ],
   [
    "📹",
    "📹"
   ],
   [
    "🎬",
    "🎬"
   ],
   [
    "📷",
    "📷"
   ]
  ]
 },
 "20": {
  "answer": "ЖУРНАЛИСТ",
  "hint": "Профессия, связанная с информацией, текстом или медиа.",
  "photos": [
   [
    "📰",
    "📰"
   ],
   [
    "🎤",
    "🎤"
   ],
   [
    "📝",
    "📝"
   ],
   [
    "📺",
    "📺"
   ]
  ]
 },
 "21": {
  "answer": "РЕДАКТОР",
  "hint": "Профессия, связанная с информацией, текстом или медиа.",
  "photos": [
   [
    "📝",
    "📝"
   ],
   [
    "📚",
    "📚"
   ],
   [
    "✏️",
    "✏️"
   ],
   [
    "✅",
    "✅"
   ]
  ]
 },
 "22": {
  "answer": "ПИСАТЕЛЬ",
  "hint": "Профессия, связанная с информацией, текстом или медиа.",
  "photos": [
   [
    "✍️",
    "✍️"
   ],
   [
    "📖",
    "📖"
   ],
   [
    "💭",
    "💭"
   ],
   [
    "📝",
    "📝"
   ]
  ]
 },
 "23": {
  "answer": "ПЕРЕВОДЧИК",
  "hint": "Профессия, связанная с информацией, текстом или медиа.",
  "photos": [
   [
    "🌐",
    "🌐"
   ],
   [
    "🗣️",
    "🗣️"
   ],
   [
    "📖",
    "📖"
   ],
   [
    "🔤",
    "🔤"
   ]
  ]
 },
 "24": {
  "answer": "ЮРИСТ",
  "hint": "Профессия, связанная с правом, расследованием или законом.",
  "photos": [
   [
    "⚖️",
    "⚖️"
   ],
   [
    "📜",
    "📜"
   ],
   [
    "🏛️",
    "🏛️"
   ],
   [
    "📚",
    "📚"
   ]
  ]
 },
 "25": {
  "answer": "АДВОКАТ",
  "hint": "Профессия, связанная с правом, расследованием или законом.",
  "photos": [
   [
    "⚖️",
    "⚖️"
   ],
   [
    "👔",
    "👔"
   ],
   [
    "📄",
    "📄"
   ],
   [
    "🏛️",
    "🏛️"
   ]
  ]
 },
 "26": {
  "answer": "ПРОКУРОР",
  "hint": "Профессия, связанная с правом, расследованием или законом.",
  "photos": [
   [
    "⚖️",
    "⚖️"
   ],
   [
    "🏛️",
    "🏛️"
   ],
   [
    "📁",
    "📁"
   ],
   [
    "🔍",
    "🔍"
   ]
  ]
 },
 "27": {
  "answer": "НОТАРИУС",
  "hint": "Профессия, связанная с правом, расследованием или законом.",
  "photos": [
   [
    "📜",
    "📜"
   ],
   [
    "🖋️",
    "🖋️"
   ],
   [
    "✅",
    "✅"
   ],
   [
    "🔏",
    "🔏"
   ]
  ]
 },
 "28": {
  "answer": "БУХГАЛТЕР",
  "hint": "Профессия, связанная с финансами и расчётами.",
  "photos": [
   [
    "🧮",
    "🧮"
   ],
   [
    "📊",
    "📊"
   ],
   [
    "💰",
    "💰"
   ],
   [
    "🧾",
    "🧾"
   ]
  ]
 },
 "29": {
  "answer": "ЭКОНОМИСТ",
  "hint": "Профессия, связанная с финансами и расчётами.",
  "photos": [
   [
    "📈",
    "📈"
   ],
   [
    "💰",
    "💰"
   ],
   [
    "📊",
    "📊"
   ],
   [
    "🧮",
    "🧮"
   ]
  ]
 },
 "30": {
  "answer": "МЕНЕДЖЕР",
  "hint": "Профессия, связанная с управлением, данными или продвижением.",
  "photos": [
   [
    "👔",
    "👔"
   ],
   [
    "📋",
    "📋"
   ],
   [
    "👥",
    "👥"
   ],
   [
    "📊",
    "📊"
   ]
  ]
 },
 "31": {
  "answer": "МАРКЕТОЛОГ",
  "hint": "Профессия, связанная с управлением, данными или продвижением.",
  "photos": [
   [
    "📣",
    "📣"
   ],
   [
    "📊",
    "📊"
   ],
   [
    "🎯",
    "🎯"
   ],
   [
    "🛍️",
    "🛍️"
   ]
  ]
 },
 "32": {
  "answer": "ДИЗАЙНЕР",
  "hint": "Профессия, связанная с творчеством, сценой или визуальным искусством.",
  "photos": [
   [
    "🎨",
    "🎨"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "✏️",
    "✏️"
   ],
   [
    "📐",
    "📐"
   ]
  ]
 },
 "33": {
  "answer": "АРХИТЕКТОР",
  "hint": "Профессия, связанная с строительством и обслуживанием зданий.",
  "photos": [
   [
    "🏛️",
    "🏛️"
   ],
   [
    "📐",
    "📐"
   ],
   [
    "🏗️",
    "🏗️"
   ],
   [
    "✏️",
    "✏️"
   ]
  ]
 },
 "34": {
  "answer": "ИНЖЕНЕР",
  "hint": "Профессия, связанная с техникой и технологиями.",
  "photos": [
   [
    "⚙️",
    "⚙️"
   ],
   [
    "📐",
    "📐"
   ],
   [
    "🛠️",
    "🛠️"
   ],
   [
    "🏗️",
    "🏗️"
   ]
  ]
 },
 "35": {
  "answer": "ПРОГРАММИСТ",
  "hint": "Профессия, связанная с техникой и технологиями.",
  "photos": [
   [
    "💻",
    "💻"
   ],
   [
    "⌨️",
    "⌨️"
   ],
   [
    "🧑‍💻",
    "🧑‍💻"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "36": {
  "answer": "ТЕСТИРОВЩИК",
  "hint": "Профессия, связанная с техникой и технологиями.",
  "photos": [
   [
    "🧪",
    "🧪"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "🐞",
    "🐞"
   ],
   [
    "✅",
    "✅"
   ]
  ]
 },
 "37": {
  "answer": "АДМИНИСТРАТОР",
  "hint": "Профессия, связанная с управлением, данными или продвижением.",
  "photos": [
   [
    "🖥️",
    "🖥️"
   ],
   [
    "⚙️",
    "⚙️"
   ],
   [
    "🔐",
    "🔐"
   ],
   [
    "📋",
    "📋"
   ]
  ]
 },
 "38": {
  "answer": "АНАЛИТИК",
  "hint": "Профессия, связанная с управлением, данными или продвижением.",
  "photos": [
   [
    "📊",
    "📊"
   ],
   [
    "🔍",
    "🔍"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "📈",
    "📈"
   ]
  ]
 },
 "39": {
  "answer": "ДИСПЕТЧЕР",
  "hint": "Профессия, связанная с доставкой и координацией маршрутов.",
  "photos": [
   [
    "🎧",
    "🎧"
   ],
   [
    "📞",
    "📞"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "🚦",
    "🚦"
   ]
  ]
 },
 "40": {
  "answer": "ЛОГИСТ",
  "hint": "Профессия, связанная с доставкой и координацией маршрутов.",
  "photos": [
   [
    "📦",
    "📦"
   ],
   [
    "🚚",
    "🚚"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "📋",
    "📋"
   ]
  ]
 },
 "41": {
  "answer": "КУРЬЕР",
  "hint": "Профессия, связанная с доставкой и координацией маршрутов.",
  "photos": [
   [
    "📦",
    "📦"
   ],
   [
    "🛵",
    "🛵"
   ],
   [
    "📍",
    "📍"
   ],
   [
    "📱",
    "📱"
   ]
  ]
 },
 "42": {
  "answer": "ПОЧТАЛЬОН",
  "hint": "Профессия, связанная с доставкой и координацией маршрутов.",
  "photos": [
   [
    "✉️",
    "✉️"
   ],
   [
    "📮",
    "📮"
   ],
   [
    "📦",
    "📦"
   ],
   [
    "🚶",
    "🚶"
   ]
  ]
 },
 "43": {
  "answer": "МАШИНИСТ",
  "hint": "Профессия, связанная с транспортом и перевозками.",
  "photos": [
   [
    "🚆",
    "🚆"
   ],
   [
    "🛤️",
    "🛤️"
   ],
   [
    "🚦",
    "🚦"
   ],
   [
    "👨‍✈️",
    "👨‍✈️"
   ]
  ]
 },
 "44": {
  "answer": "ШТУРМАН",
  "hint": "Профессия, связанная с транспортом и перевозками.",
  "photos": [
   [
    "🧭",
    "🧭"
   ],
   [
    "🚢",
    "🚢"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "⚓",
    "⚓"
   ]
  ]
 },
 "45": {
  "answer": "МОРЯК",
  "hint": "Профессия, связанная с транспортом и перевозками.",
  "photos": [
   [
    "⚓",
    "⚓"
   ],
   [
    "🚢",
    "🚢"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "🪢",
    "🪢"
   ]
  ]
 },
 "46": {
  "answer": "СПАСАТЕЛЬ",
  "hint": "Профессия, связанная с безопасностью и защитой людей.",
  "photos": [
   [
    "🛟",
    "🛟"
   ],
   [
    "🚨",
    "🚨"
   ],
   [
    "⛑️",
    "⛑️"
   ],
   [
    "🤝",
    "🤝"
   ]
  ]
 },
 "47": {
  "answer": "ОХРАННИК",
  "hint": "Профессия, связанная с безопасностью и защитой людей.",
  "photos": [
   [
    "🛡️",
    "🛡️"
   ],
   [
    "🚪",
    "🚪"
   ],
   [
    "👀",
    "👀"
   ],
   [
    "🔐",
    "🔐"
   ]
  ]
 },
 "48": {
  "answer": "ВОЕННЫЙ",
  "hint": "Профессия, связанная с безопасностью и защитой людей.",
  "photos": [
   [
    "🎖️",
    "🎖️"
   ],
   [
    "🪖",
    "🪖"
   ],
   [
    "🫡",
    "🫡"
   ],
   [
    "🏕️",
    "🏕️"
   ]
  ]
 },
 "49": {
  "answer": "СЛЕДОВАТЕЛЬ",
  "hint": "Профессия, связанная с правом, расследованием или законом.",
  "photos": [
   [
    "🔍",
    "🔍"
   ],
   [
    "📁",
    "📁"
   ],
   [
    "🕵️",
    "🕵️"
   ],
   [
    "📝",
    "📝"
   ]
  ]
 },
 "50": {
  "answer": "ДЕТЕКТИВ",
  "hint": "Профессия, связанная с правом, расследованием или законом.",
  "photos": [
   [
    "🕵️",
    "🕵️"
   ],
   [
    "🔎",
    "🔎"
   ],
   [
    "🧩",
    "🧩"
   ],
   [
    "📸",
    "📸"
   ]
  ]
 },
 "51": {
  "answer": "КРИМИНАЛИСТ",
  "hint": "Профессия, связанная с исследованиями и наукой.",
  "photos": [
   [
    "🔬",
    "🔬"
   ],
   [
    "🔍",
    "🔍"
   ],
   [
    "🧤",
    "🧤"
   ],
   [
    "🧬",
    "🧬"
   ]
  ]
 },
 "52": {
  "answer": "ВЕТЕРИНАР",
  "hint": "Профессия, связанная с медициной и здоровьем.",
  "photos": [
   [
    "🐕",
    "🐕"
   ],
   [
    "🐈",
    "🐈"
   ],
   [
    "🩺",
    "🩺"
   ],
   [
    "💉",
    "💉"
   ]
  ]
 },
 "53": {
  "answer": "ФАРМАЦЕВТ",
  "hint": "Профессия, связанная с медициной и здоровьем.",
  "photos": [
   [
    "💊",
    "💊"
   ],
   [
    "⚗️",
    "⚗️"
   ],
   [
    "🏥",
    "🏥"
   ],
   [
    "🧾",
    "🧾"
   ]
  ]
 },
 "54": {
  "answer": "МЕДСЕСТРА",
  "hint": "Профессия, связанная с медициной и здоровьем.",
  "photos": [
   [
    "🏥",
    "🏥"
   ],
   [
    "💉",
    "💉"
   ],
   [
    "🩹",
    "🩹"
   ],
   [
    "🩺",
    "🩺"
   ]
  ]
 },
 "55": {
  "answer": "ХИРУРГ",
  "hint": "Профессия, связанная с медициной и здоровьем.",
  "photos": [
   [
    "🏥",
    "🏥"
   ],
   [
    "🩺",
    "🩺"
   ],
   [
    "🔪",
    "🔪"
   ],
   [
    "🧤",
    "🧤"
   ]
  ]
 },
 "56": {
  "answer": "СТОМАТОЛОГ",
  "hint": "Профессия, связанная с медициной и здоровьем.",
  "photos": [
   [
    "🦷",
    "🦷"
   ],
   [
    "🪥",
    "🪥"
   ],
   [
    "🩺",
    "🩺"
   ],
   [
    "😁",
    "😁"
   ]
  ]
 },
 "57": {
  "answer": "ПСИХОЛОГ",
  "hint": "Профессия, связанная с медициной и здоровьем.",
  "photos": [
   [
    "🧠",
    "🧠"
   ],
   [
    "💬",
    "💬"
   ],
   [
    "🛋️",
    "🛋️"
   ],
   [
    "❤️",
    "❤️"
   ]
  ]
 },
 "58": {
  "answer": "ЛОГОПЕД",
  "hint": "Профессия, связанная с обучением и развитием людей.",
  "photos": [
   [
    "🗣️",
    "🗣️"
   ],
   [
    "👄",
    "👄"
   ],
   [
    "🔤",
    "🔤"
   ],
   [
    "👧",
    "👧"
   ]
  ]
 },
 "59": {
  "answer": "ИНСТРУКТОР",
  "hint": "Профессия, связанная с обучением и развитием людей.",
  "photos": [
   [
    "👨‍🏫",
    "👨‍🏫"
   ],
   [
    "📋",
    "📋"
   ],
   [
    "🧭",
    "🧭"
   ],
   [
    "✅",
    "✅"
   ]
  ]
 },
 "60": {
  "answer": "ПРОФЕССОР",
  "hint": "Профессия, связанная с обучением и развитием людей.",
  "photos": [
   [
    "🎓",
    "🎓"
   ],
   [
    "🏫",
    "🏫"
   ],
   [
    "📚",
    "📚"
   ],
   [
    "🔬",
    "🔬"
   ]
  ]
 },
 "61": {
  "answer": "ВОСПИТАТЕЛЬ",
  "hint": "Профессия, связанная с обучением и развитием людей.",
  "photos": [
   [
    "🧸",
    "🧸"
   ],
   [
    "👧",
    "👧"
   ],
   [
    "📚",
    "📚"
   ],
   [
    "🏫",
    "🏫"
   ]
  ]
 },
 "62": {
  "answer": "БИБЛИОТЕКАРЬ",
  "hint": "Профессия, связанная с обучением и развитием людей.",
  "photos": [
   [
    "📚",
    "📚"
   ],
   [
    "🏛️",
    "🏛️"
   ],
   [
    "🔖",
    "🔖"
   ],
   [
    "🤫",
    "🤫"
   ]
  ]
 },
 "63": {
  "answer": "АРХЕОЛОГ",
  "hint": "Профессия, связанная с исследованиями и наукой.",
  "photos": [
   [
    "🏺",
    "🏺"
   ],
   [
    "⛏️",
    "⛏️"
   ],
   [
    "🗿",
    "🗿"
   ],
   [
    "📜",
    "📜"
   ]
  ]
 },
 "64": {
  "answer": "ИСТОРИК",
  "hint": "Профессия, связанная с исследованиями и наукой.",
  "photos": [
   [
    "📜",
    "📜"
   ],
   [
    "🏛️",
    "🏛️"
   ],
   [
    "📚",
    "📚"
   ],
   [
    "🕰️",
    "🕰️"
   ]
  ]
 },
 "65": {
  "answer": "БИОЛОГ",
  "hint": "Профессия, связанная с исследованиями и наукой.",
  "photos": [
   [
    "🧬",
    "🧬"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🌱",
    "🌱"
   ],
   [
    "🦠",
    "🦠"
   ]
  ]
 },
 "66": {
  "answer": "ХИМИК",
  "hint": "Профессия, связанная с исследованиями и наукой.",
  "photos": [
   [
    "🧪",
    "🧪"
   ],
   [
    "⚗️",
    "⚗️"
   ],
   [
    "🥼",
    "🥼"
   ],
   [
    "🔬",
    "🔬"
   ]
  ]
 },
 "67": {
  "answer": "ФИЗИК",
  "hint": "Профессия, связанная с исследованиями и наукой.",
  "photos": [
   [
    "⚛️",
    "⚛️"
   ],
   [
    "📐",
    "📐"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "⚡",
    "⚡"
   ]
  ]
 },
 "68": {
  "answer": "АСТРОНОМ",
  "hint": "Профессия, связанная с исследованиями и наукой.",
  "photos": [
   [
    "🔭",
    "🔭"
   ],
   [
    "🌌",
    "🌌"
   ],
   [
    "⭐",
    "⭐"
   ],
   [
    "🪐",
    "🪐"
   ]
  ]
 },
 "69": {
  "answer": "ГЕОЛОГ",
  "hint": "Профессия, связанная с исследованиями и наукой.",
  "photos": [
   [
    "🪨",
    "🪨"
   ],
   [
    "⛏️",
    "⛏️"
   ],
   [
    "🏔️",
    "🏔️"
   ],
   [
    "🗺️",
    "🗺️"
   ]
  ]
 },
 "70": {
  "answer": "ЭКОЛОГ",
  "hint": "Профессия, связанная с исследованиями и наукой.",
  "photos": [
   [
    "🌿",
    "🌿"
   ],
   [
    "🌍",
    "🌍"
   ],
   [
    "♻️",
    "♻️"
   ],
   [
    "💧",
    "💧"
   ]
  ]
 },
 "71": {
  "answer": "МЕТЕОРОЛОГ",
  "hint": "Профессия, связанная с исследованиями и наукой.",
  "photos": [
   [
    "🌦️",
    "🌦️"
   ],
   [
    "🌡️",
    "🌡️"
   ],
   [
    "☁️",
    "☁️"
   ],
   [
    "📡",
    "📡"
   ]
  ]
 },
 "72": {
  "answer": "КАРТОГРАФ",
  "hint": "Профессия, связанная с исследованиями и наукой.",
  "photos": [
   [
    "🗺️",
    "🗺️"
   ],
   [
    "📐",
    "📐"
   ],
   [
    "🌍",
    "🌍"
   ],
   [
    "✏️",
    "✏️"
   ]
  ]
 },
 "73": {
  "answer": "ГЕОДЕЗИСТ",
  "hint": "Профессия, связанная с исследованиями и наукой.",
  "photos": [
   [
    "📐",
    "📐"
   ],
   [
    "📍",
    "📍"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "🔭",
    "🔭"
   ]
  ]
 },
 "74": {
  "answer": "ЛАБОРАНТ",
  "hint": "Профессия, связанная с исследованиями и наукой.",
  "photos": [
   [
    "🔬",
    "🔬"
   ],
   [
    "🧪",
    "🧪"
   ],
   [
    "🥼",
    "🥼"
   ],
   [
    "🧫",
    "🧫"
   ]
  ]
 },
 "75": {
  "answer": "УЧЕНЫЙ",
  "hint": "Профессия, связанная с исследованиями и наукой.",
  "photos": [
   [
    "🔬",
    "🔬"
   ],
   [
    "📚",
    "📚"
   ],
   [
    "🧪",
    "🧪"
   ],
   [
    "💡",
    "💡"
   ]
  ]
 },
 "76": {
  "answer": "КАСКАДЕР",
  "hint": "Профессия, связанная с творчеством, сценой или визуальным искусством.",
  "photos": [
   [
    "🎬",
    "🎬"
   ],
   [
    "🏍️",
    "🏍️"
   ],
   [
    "🔥",
    "🔥"
   ],
   [
    "🎭",
    "🎭"
   ]
  ]
 },
 "77": {
  "answer": "РЕЖИССЕР",
  "hint": "Профессия, связанная с творчеством, сценой или визуальным искусством.",
  "photos": [
   [
    "🎬",
    "🎬"
   ],
   [
    "🎥",
    "🎥"
   ],
   [
    "📣",
    "📣"
   ],
   [
    "🎭",
    "🎭"
   ]
  ]
 },
 "78": {
  "answer": "ОПЕРАТОР",
  "hint": "Профессия, связанная с творчеством, сценой или визуальным искусством.",
  "photos": [
   [
    "🎥",
    "🎥"
   ],
   [
    "📷",
    "📷"
   ],
   [
    "🎬",
    "🎬"
   ],
   [
    "🎞️",
    "🎞️"
   ]
  ]
 },
 "79": {
  "answer": "СЦЕНАРИСТ",
  "hint": "Профессия, связанная с творчеством, сценой или визуальным искусством.",
  "photos": [
   [
    "📝",
    "📝"
   ],
   [
    "🎬",
    "🎬"
   ],
   [
    "💭",
    "💭"
   ],
   [
    "📖",
    "📖"
   ]
  ]
 },
 "80": {
  "answer": "ПРОДЮСЕР",
  "hint": "Профессия, связанная с творчеством, сценой или визуальным искусством.",
  "photos": [
   [
    "🎬",
    "🎬"
   ],
   [
    "💰",
    "💰"
   ],
   [
    "📋",
    "📋"
   ],
   [
    "🎤",
    "🎤"
   ]
  ]
 },
 "81": {
  "answer": "МУЗЫКАНТ",
  "hint": "Профессия, связанная с творчеством, сценой или визуальным искусством.",
  "photos": [
   [
    "🎵",
    "🎵"
   ],
   [
    "🎸",
    "🎸"
   ],
   [
    "🎹",
    "🎹"
   ],
   [
    "🎶",
    "🎶"
   ]
  ]
 },
 "82": {
  "answer": "ПЕВЕЦ",
  "hint": "Профессия, связанная с творчеством, сценой или визуальным искусством.",
  "photos": [
   [
    "🎤",
    "🎤"
   ],
   [
    "🎵",
    "🎵"
   ],
   [
    "🎶",
    "🎶"
   ],
   [
    "👏",
    "👏"
   ]
  ]
 },
 "83": {
  "answer": "ТАНЦОР",
  "hint": "Профессия, связанная с творчеством, сценой или визуальным искусством.",
  "photos": [
   [
    "💃",
    "💃"
   ],
   [
    "🕺",
    "🕺"
   ],
   [
    "🎵",
    "🎵"
   ],
   [
    "🎭",
    "🎭"
   ]
  ]
 },
 "84": {
  "answer": "ХОРЕОГРАФ",
  "hint": "Профессия, связанная с творчеством, сценой или визуальным искусством.",
  "photos": [
   [
    "💃",
    "💃"
   ],
   [
    "📝",
    "📝"
   ],
   [
    "🎵",
    "🎵"
   ],
   [
    "👥",
    "👥"
   ]
  ]
 },
 "85": {
  "answer": "ИЛЛЮСТРАТОР",
  "hint": "Профессия, связанная с творчеством, сценой или визуальным искусством.",
  "photos": [
   [
    "✏️",
    "✏️"
   ],
   [
    "🎨",
    "🎨"
   ],
   [
    "📖",
    "📖"
   ],
   [
    "🖥️",
    "🖥️"
   ]
  ]
 },
 "86": {
  "answer": "СКУЛЬПТОР",
  "hint": "Профессия, связанная с творчеством, сценой или визуальным искусством.",
  "photos": [
   [
    "🗿",
    "🗿"
   ],
   [
    "🔨",
    "🔨"
   ],
   [
    "🪨",
    "🪨"
   ],
   [
    "🎨",
    "🎨"
   ]
  ]
 },
 "87": {
  "answer": "ЧАСОВЩИК",
  "hint": "Профессия, связанная с ручным трудом и профессиональным мастерством.",
  "photos": [
   [
    "⌚",
    "⌚"
   ],
   [
    "⚙️",
    "⚙️"
   ],
   [
    "🔧",
    "🔧"
   ],
   [
    "🕰️",
    "🕰️"
   ]
  ]
 },
 "88": {
  "answer": "ПОРТНОЙ",
  "hint": "Профессия, связанная с ручным трудом и профессиональным мастерством.",
  "photos": [
   [
    "🧵",
    "🧵"
   ],
   [
    "✂️",
    "✂️"
   ],
   [
    "👔",
    "👔"
   ],
   [
    "📏",
    "📏"
   ]
  ]
 },
 "89": {
  "answer": "ШВЕЯ",
  "hint": "Профессия, связанная с ручным трудом и профессиональным мастерством.",
  "photos": [
   [
    "🪡",
    "🪡"
   ],
   [
    "🧵",
    "🧵"
   ],
   [
    "👗",
    "👗"
   ],
   [
    "✂️",
    "✂️"
   ]
  ]
 },
 "90": {
  "answer": "МОДЕЛЬЕР",
  "hint": "Профессия, связанная с ручным трудом и профессиональным мастерством.",
  "photos": [
   [
    "👗",
    "👗"
   ],
   [
    "✏️",
    "✏️"
   ],
   [
    "🧵",
    "🧵"
   ],
   [
    "🎨",
    "🎨"
   ]
  ]
 },
 "91": {
  "answer": "ФЛОРИСТ",
  "hint": "Профессия, связанная с природой, растениями или сельским хозяйством.",
  "photos": [
   [
    "💐",
    "💐"
   ],
   [
    "🌷",
    "🌷"
   ],
   [
    "✂️",
    "✂️"
   ],
   [
    "🎁",
    "🎁"
   ]
  ]
 },
 "92": {
  "answer": "САДОВНИК",
  "hint": "Профессия, связанная с природой, растениями или сельским хозяйством.",
  "photos": [
   [
    "🌱",
    "🌱"
   ],
   [
    "🌳",
    "🌳"
   ],
   [
    "🪴",
    "🪴"
   ],
   [
    "💧",
    "💧"
   ]
  ]
 },
 "93": {
  "answer": "АГРОНОМ",
  "hint": "Профессия, связанная с природой, растениями или сельским хозяйством.",
  "photos": [
   [
    "🌾",
    "🌾"
   ],
   [
    "🌱",
    "🌱"
   ],
   [
    "🚜",
    "🚜"
   ],
   [
    "📋",
    "📋"
   ]
  ]
 },
 "94": {
  "answer": "ЛЕСНИК",
  "hint": "Профессия, связанная с природой, растениями или сельским хозяйством.",
  "photos": [
   [
    "🌲",
    "🌲"
   ],
   [
    "🦌",
    "🦌"
   ],
   [
    "🔥",
    "🔥"
   ],
   [
    "🥾",
    "🥾"
   ]
  ]
 },
 "95": {
  "answer": "ШАХТЕР",
  "hint": "Профессия, связанная с ручным трудом и профессиональным мастерством.",
  "photos": [
   [
    "⛏️",
    "⛏️"
   ],
   [
    "🪨",
    "🪨"
   ],
   [
    "🪖",
    "🪖"
   ],
   [
    "⬇️",
    "⬇️"
   ]
  ]
 },
 "96": {
  "answer": "СВАРЩИК",
  "hint": "Профессия, связанная с ручным трудом и профессиональным мастерством.",
  "photos": [
   [
    "🔥",
    "🔥"
   ],
   [
    "🥽",
    "🥽"
   ],
   [
    "🔧",
    "🔧"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "97": {
  "answer": "ТОКАРЬ",
  "hint": "Профессия, связанная с ручным трудом и профессиональным мастерством.",
  "photos": [
   [
    "⚙️",
    "⚙️"
   ],
   [
    "🔩",
    "🔩"
   ],
   [
    "🛠️",
    "🛠️"
   ],
   [
    "🏭",
    "🏭"
   ]
  ]
 },
 "98": {
  "answer": "СЛЕСАРЬ",
  "hint": "Профессия, связанная с ручным трудом и профессиональным мастерством.",
  "photos": [
   [
    "🔧",
    "🔧"
   ],
   [
    "🔩",
    "🔩"
   ],
   [
    "🛠️",
    "🛠️"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "99": {
  "answer": "ПЛОТНИК",
  "hint": "Профессия, связанная с ручным трудом и профессиональным мастерством.",
  "photos": [
   [
    "🪚",
    "🪚"
   ],
   [
    "🪵",
    "🪵"
   ],
   [
    "🔨",
    "🔨"
   ],
   [
    "📐",
    "📐"
   ]
  ]
 },
 "100": {
  "answer": "ШТУКАТУР",
  "hint": "Профессия, связанная с строительством и обслуживанием зданий.",
  "photos": [
   [
    "🧱",
    "🧱"
   ],
   [
    "🏠",
    "🏠"
   ],
   [
    "🪣",
    "🪣"
   ],
   [
    "🛠️",
    "🛠️"
   ]
  ]
 }
};
const PROF_TRANSLATED={
 "en": {
  "1": {
   "answer": "DOCTOR",
   "hint": "A profession connected with medicine and health."
  },
  "2": {
   "answer": "TEACHER",
   "hint": "A profession connected with education and development."
  },
  "3": {
   "answer": "CHEF",
   "hint": "A profession connected with food preparation."
  },
  "4": {
   "answer": "POLICE",
   "hint": "A profession connected with safety and protection."
  },
  "5": {
   "answer": "FIREFIGHTER",
   "hint": "A profession connected with safety and protection."
  },
  "6": {
   "answer": "DRIVER",
   "hint": "A profession connected with transport and travel."
  },
  "7": {
   "answer": "PILOT",
   "hint": "A profession connected with transport and travel."
  },
  "8": {
   "answer": "BUILDER",
   "hint": "A profession connected with construction and buildings."
  },
  "9": {
   "answer": "SELLER",
   "hint": "A profession connected with sales and customers."
  },
  "10": {
   "answer": "FARMER",
   "hint": "A profession connected with nature, plants, or agriculture."
  },
  "11": {
   "answer": "MECHANIC",
   "hint": "A profession connected with technology and machinery."
  },
  "12": {
   "answer": "ELECTRICIAN",
   "hint": "A profession connected with technology and machinery."
  },
  "13": {
   "answer": "PLUMBER",
   "hint": "A profession connected with construction and buildings."
  },
  "14": {
   "answer": "HAIRDRESSER",
   "hint": "A profession connected with customer service."
  },
  "15": {
   "answer": "BAKER",
   "hint": "A profession connected with food preparation."
  },
  "16": {
   "answer": "PASTRYCHEF",
   "hint": "A profession connected with food preparation."
  },
  "17": {
   "answer": "WAITER",
   "hint": "A profession connected with customer service."
  },
  "18": {
   "answer": "BARTENDER",
   "hint": "A profession connected with customer service."
  },
  "19": {
   "answer": "VIDEOGRAPHER",
   "hint": "A profession connected with information, writing, or media."
  },
  "20": {
   "answer": "JOURNALIST",
   "hint": "A profession connected with information, writing, or media."
  },
  "21": {
   "answer": "EDITOR",
   "hint": "A profession connected with information, writing, or media."
  },
  "22": {
   "answer": "WRITER",
   "hint": "A profession connected with information, writing, or media."
  },
  "23": {
   "answer": "TRANSLATOR",
   "hint": "A profession connected with information, writing, or media."
  },
  "24": {
   "answer": "LAWYER",
   "hint": "A profession connected with law or investigation."
  },
  "25": {
   "answer": "ATTORNEY",
   "hint": "A profession connected with law or investigation."
  },
  "26": {
   "answer": "PROSECUTOR",
   "hint": "A profession connected with law or investigation."
  },
  "27": {
   "answer": "NOTARY",
   "hint": "A profession connected with law or investigation."
  },
  "28": {
   "answer": "ACCOUNTANT",
   "hint": "A profession connected with finance and accounting."
  },
  "29": {
   "answer": "ECONOMIST",
   "hint": "A profession connected with finance and accounting."
  },
  "30": {
   "answer": "MANAGER",
   "hint": "A profession connected with management, data, or promotion."
  },
  "31": {
   "answer": "MARKETER",
   "hint": "A profession connected with management, data, or promotion."
  },
  "32": {
   "answer": "DESIGNER",
   "hint": "A profession connected with creative arts and performance."
  },
  "33": {
   "answer": "ARCHITECT",
   "hint": "A profession connected with construction and buildings."
  },
  "34": {
   "answer": "ENGINEER",
   "hint": "A profession connected with technology and machinery."
  },
  "35": {
   "answer": "PROGRAMMER",
   "hint": "A profession connected with technology and machinery."
  },
  "36": {
   "answer": "TESTER",
   "hint": "A profession connected with technology and machinery."
  },
  "37": {
   "answer": "ADMINISTRATOR",
   "hint": "A profession connected with management, data, or promotion."
  },
  "38": {
   "answer": "ANALYST",
   "hint": "A profession connected with management, data, or promotion."
  },
  "39": {
   "answer": "DISPATCHER",
   "hint": "A profession connected with delivery and logistics."
  },
  "40": {
   "answer": "LOGISTICIAN",
   "hint": "A profession connected with delivery and logistics."
  },
  "41": {
   "answer": "COURIER",
   "hint": "A profession connected with delivery and logistics."
  },
  "42": {
   "answer": "POSTMAN",
   "hint": "A profession connected with delivery and logistics."
  },
  "43": {
   "answer": "TRAINDRIVER",
   "hint": "A profession connected with transport and travel."
  },
  "44": {
   "answer": "NAVALOFFICER",
   "hint": "A profession connected with transport and travel."
  },
  "45": {
   "answer": "SAILOR",
   "hint": "A profession connected with transport and travel."
  },
  "46": {
   "answer": "RESCUER",
   "hint": "A profession connected with safety and protection."
  },
  "47": {
   "answer": "GUARD",
   "hint": "A profession connected with safety and protection."
  },
  "48": {
   "answer": "SERVICEMAN",
   "hint": "A profession connected with safety and protection."
  },
  "49": {
   "answer": "INVESTIGATOR",
   "hint": "A profession connected with law or investigation."
  },
  "50": {
   "answer": "DETECTIVE",
   "hint": "A profession connected with law or investigation."
  },
  "51": {
   "answer": "FORENSICEXPERT",
   "hint": "A profession connected with science and research."
  },
  "52": {
   "answer": "VETERINARIAN",
   "hint": "A profession connected with medicine and health."
  },
  "53": {
   "answer": "PHARMACIST",
   "hint": "A profession connected with medicine and health."
  },
  "54": {
   "answer": "NURSE",
   "hint": "A profession connected with medicine and health."
  },
  "55": {
   "answer": "SURGEON",
   "hint": "A profession connected with medicine and health."
  },
  "56": {
   "answer": "DENTIST",
   "hint": "A profession connected with medicine and health."
  },
  "57": {
   "answer": "PSYCHOLOGIST",
   "hint": "A profession connected with medicine and health."
  },
  "58": {
   "answer": "SPEECHTHERAPIST",
   "hint": "A profession connected with education and development."
  },
  "59": {
   "answer": "INSTRUCTOR",
   "hint": "A profession connected with education and development."
  },
  "60": {
   "answer": "PROFESSOR",
   "hint": "A profession connected with education and development."
  },
  "61": {
   "answer": "EDUCATOR",
   "hint": "A profession connected with education and development."
  },
  "62": {
   "answer": "LIBRARIAN",
   "hint": "A profession connected with education and development."
  },
  "63": {
   "answer": "ARCHAEOLOGIST",
   "hint": "A profession connected with science and research."
  },
  "64": {
   "answer": "HISTORIAN",
   "hint": "A profession connected with science and research."
  },
  "65": {
   "answer": "BIOLOGIST",
   "hint": "A profession connected with science and research."
  },
  "66": {
   "answer": "CHEMIST",
   "hint": "A profession connected with science and research."
  },
  "67": {
   "answer": "PHYSICIST",
   "hint": "A profession connected with science and research."
  },
  "68": {
   "answer": "ASTRONOMER",
   "hint": "A profession connected with science and research."
  },
  "69": {
   "answer": "GEOLOGIST",
   "hint": "A profession connected with science and research."
  },
  "70": {
   "answer": "ECOLOGIST",
   "hint": "A profession connected with science and research."
  },
  "71": {
   "answer": "METEOROLOGIST",
   "hint": "A profession connected with science and research."
  },
  "72": {
   "answer": "CARTOGRAPHER",
   "hint": "A profession connected with science and research."
  },
  "73": {
   "answer": "SURVEYOR",
   "hint": "A profession connected with science and research."
  },
  "74": {
   "answer": "LABTECHNICIAN",
   "hint": "A profession connected with science and research."
  },
  "75": {
   "answer": "SCIENTIST",
   "hint": "A profession connected with science and research."
  },
  "76": {
   "answer": "STUNTMAN",
   "hint": "A profession connected with creative arts and performance."
  },
  "77": {
   "answer": "DIRECTOR",
   "hint": "A profession connected with creative arts and performance."
  },
  "78": {
   "answer": "CAMERAMAN",
   "hint": "A profession connected with creative arts and performance."
  },
  "79": {
   "answer": "SCREENWRITER",
   "hint": "A profession connected with creative arts and performance."
  },
  "80": {
   "answer": "PRODUCER",
   "hint": "A profession connected with creative arts and performance."
  },
  "81": {
   "answer": "MUSICIAN",
   "hint": "A profession connected with creative arts and performance."
  },
  "82": {
   "answer": "SINGER",
   "hint": "A profession connected with creative arts and performance."
  },
  "83": {
   "answer": "DANCER",
   "hint": "A profession connected with creative arts and performance."
  },
  "84": {
   "answer": "CHOREOGRAPHER",
   "hint": "A profession connected with creative arts and performance."
  },
  "85": {
   "answer": "ILLUSTRATOR",
   "hint": "A profession connected with creative arts and performance."
  },
  "86": {
   "answer": "SCULPTOR",
   "hint": "A profession connected with creative arts and performance."
  },
  "87": {
   "answer": "WATCHMAKER",
   "hint": "A profession connected with skilled craft and manual work."
  },
  "88": {
   "answer": "TAILOR",
   "hint": "A profession connected with skilled craft and manual work."
  },
  "89": {
   "answer": "SEAMSTRESS",
   "hint": "A profession connected with skilled craft and manual work."
  },
  "90": {
   "answer": "FASHIONDESIGNER",
   "hint": "A profession connected with skilled craft and manual work."
  },
  "91": {
   "answer": "FLORIST",
   "hint": "A profession connected with nature, plants, or agriculture."
  },
  "92": {
   "answer": "GARDENER",
   "hint": "A profession connected with nature, plants, or agriculture."
  },
  "93": {
   "answer": "AGRONOMIST",
   "hint": "A profession connected with nature, plants, or agriculture."
  },
  "94": {
   "answer": "FORESTER",
   "hint": "A profession connected with nature, plants, or agriculture."
  },
  "95": {
   "answer": "MINER",
   "hint": "A profession connected with skilled craft and manual work."
  },
  "96": {
   "answer": "WELDER",
   "hint": "A profession connected with skilled craft and manual work."
  },
  "97": {
   "answer": "TURNER",
   "hint": "A profession connected with skilled craft and manual work."
  },
  "98": {
   "answer": "LOCKSMITH",
   "hint": "A profession connected with skilled craft and manual work."
  },
  "99": {
   "answer": "CARPENTER",
   "hint": "A profession connected with skilled craft and manual work."
  },
  "100": {
   "answer": "PLASTERER",
   "hint": "A profession connected with construction and buildings."
  }
 },
 "az": {
  "1": {
   "answer": "HƏKİM",
   "hint": "tibb və sağlamlıqla bağlı peşə."
  },
  "2": {
   "answer": "MÜƏLLİM",
   "hint": "təhsil və inkişafla bağlı peşə."
  },
  "3": {
   "answer": "AŞPAZ",
   "hint": "yemək hazırlanması ilə bağlı peşə."
  },
  "4": {
   "answer": "POLİS",
   "hint": "təhlükəsizlik və mühafizə ilə bağlı peşə."
  },
  "5": {
   "answer": "YANĞINSÖNDÜRƏN",
   "hint": "təhlükəsizlik və mühafizə ilə bağlı peşə."
  },
  "6": {
   "answer": "SÜRÜCÜ",
   "hint": "nəqliyyat və daşınma ilə bağlı peşə."
  },
  "7": {
   "answer": "PİLOT",
   "hint": "nəqliyyat və daşınma ilə bağlı peşə."
  },
  "8": {
   "answer": "İNŞAATÇI",
   "hint": "tikinti və binalarla bağlı peşə."
  },
  "9": {
   "answer": "SATICI",
   "hint": "ticarət və müştərilərlə bağlı peşə."
  },
  "10": {
   "answer": "FERMER",
   "hint": "təbiət, bitkilər və kənd təsərrüfatı ilə bağlı peşə."
  },
  "11": {
   "answer": "MEXANİK",
   "hint": "texnika və texnologiya ilə bağlı peşə."
  },
  "12": {
   "answer": "ELEKTRİK",
   "hint": "texnika və texnologiya ilə bağlı peşə."
  },
  "13": {
   "answer": "SANTEXNİK",
   "hint": "tikinti və binalarla bağlı peşə."
  },
  "14": {
   "answer": "BƏRBƏR",
   "hint": "insanlara xidmətlə bağlı peşə."
  },
  "15": {
   "answer": "ÇÖRƏKÇİ",
   "hint": "yemək hazırlanması ilə bağlı peşə."
  },
  "16": {
   "answer": "ŞİRNİYYATÇI",
   "hint": "yemək hazırlanması ilə bağlı peşə."
  },
  "17": {
   "answer": "OFİSİANT",
   "hint": "insanlara xidmətlə bağlı peşə."
  },
  "18": {
   "answer": "BARMEN",
   "hint": "insanlara xidmətlə bağlı peşə."
  },
  "19": {
   "answer": "VİDEOQRAF",
   "hint": "məlumat, mətn və media ilə bağlı peşə."
  },
  "20": {
   "answer": "JURNALİST",
   "hint": "məlumat, mətn və media ilə bağlı peşə."
  },
  "21": {
   "answer": "REDAKTOR",
   "hint": "məlumat, mətn və media ilə bağlı peşə."
  },
  "22": {
   "answer": "YAZIÇI",
   "hint": "məlumat, mətn və media ilə bağlı peşə."
  },
  "23": {
   "answer": "TƏRCÜMƏÇİ",
   "hint": "məlumat, mətn və media ilə bağlı peşə."
  },
  "24": {
   "answer": "HÜQUQŞÜNAS",
   "hint": "hüquq, araşdırma və qanunla bağlı peşə."
  },
  "25": {
   "answer": "VƏKİL",
   "hint": "hüquq, araşdırma və qanunla bağlı peşə."
  },
  "26": {
   "answer": "PROKUROR",
   "hint": "hüquq, araşdırma və qanunla bağlı peşə."
  },
  "27": {
   "answer": "NOTARİUS",
   "hint": "hüquq, araşdırma və qanunla bağlı peşə."
  },
  "28": {
   "answer": "MÜHASİB",
   "hint": "maliyyə və hesablamalarla bağlı peşə."
  },
  "29": {
   "answer": "İQTİSADÇI",
   "hint": "maliyyə və hesablamalarla bağlı peşə."
  },
  "30": {
   "answer": "MENECER",
   "hint": "idarəetmə, məlumat və tanıtımla bağlı peşə."
  },
  "31": {
   "answer": "MARKETOLOQ",
   "hint": "idarəetmə, məlumat və tanıtımla bağlı peşə."
  },
  "32": {
   "answer": "DİZAYNER",
   "hint": "yaradıcılıq və səhnə sənəti ilə bağlı peşə."
  },
  "33": {
   "answer": "MEMAR",
   "hint": "tikinti və binalarla bağlı peşə."
  },
  "34": {
   "answer": "MÜHƏNDİS",
   "hint": "texnika və texnologiya ilə bağlı peşə."
  },
  "35": {
   "answer": "PROQRAMÇI",
   "hint": "texnika və texnologiya ilə bağlı peşə."
  },
  "36": {
   "answer": "TESTÇİ",
   "hint": "texnika və texnologiya ilə bağlı peşə."
  },
  "37": {
   "answer": "ADMİNİSTRATOR",
   "hint": "idarəetmə, məlumat və tanıtımla bağlı peşə."
  },
  "38": {
   "answer": "ANALİTİK",
   "hint": "idarəetmə, məlumat və tanıtımla bağlı peşə."
  },
  "39": {
   "answer": "DİSPETÇER",
   "hint": "çatdırılma və logistika ilə bağlı peşə."
  },
  "40": {
   "answer": "LOGİST",
   "hint": "çatdırılma və logistika ilə bağlı peşə."
  },
  "41": {
   "answer": "KURYER",
   "hint": "çatdırılma və logistika ilə bağlı peşə."
  },
  "42": {
   "answer": "POÇTALYON",
   "hint": "çatdırılma və logistika ilə bağlı peşə."
  },
  "43": {
   "answer": "MAŞİNİST",
   "hint": "nəqliyyat və daşınma ilə bağlı peşə."
  },
  "44": {
   "answer": "ŞTURMAN",
   "hint": "nəqliyyat və daşınma ilə bağlı peşə."
  },
  "45": {
   "answer": "DƏNİZÇİ",
   "hint": "nəqliyyat və daşınma ilə bağlı peşə."
  },
  "46": {
   "answer": "XİLASEDİCİ",
   "hint": "təhlükəsizlik və mühafizə ilə bağlı peşə."
  },
  "47": {
   "answer": "MÜHAFİZƏÇİ",
   "hint": "təhlükəsizlik və mühafizə ilə bağlı peşə."
  },
  "48": {
   "answer": "HƏRBÇİ",
   "hint": "təhlükəsizlik və mühafizə ilə bağlı peşə."
  },
  "49": {
   "answer": "MÜSTƏNTİQ",
   "hint": "hüquq, araşdırma və qanunla bağlı peşə."
  },
  "50": {
   "answer": "DETEKTİV",
   "hint": "hüquq, araşdırma və qanunla bağlı peşə."
  },
  "51": {
   "answer": "KRİMİNALİST",
   "hint": "elm və tədqiqatla bağlı peşə."
  },
  "52": {
   "answer": "BAYTAR",
   "hint": "tibb və sağlamlıqla bağlı peşə."
  },
  "53": {
   "answer": "ƏCZAÇI",
   "hint": "tibb və sağlamlıqla bağlı peşə."
  },
  "54": {
   "answer": "TİBBBACISI",
   "hint": "tibb və sağlamlıqla bağlı peşə."
  },
  "55": {
   "answer": "CƏRRAH",
   "hint": "tibb və sağlamlıqla bağlı peşə."
  },
  "56": {
   "answer": "DİŞHƏKİMİ",
   "hint": "tibb və sağlamlıqla bağlı peşə."
  },
  "57": {
   "answer": "PSİXOLOQ",
   "hint": "tibb və sağlamlıqla bağlı peşə."
  },
  "58": {
   "answer": "LOQOPED",
   "hint": "təhsil və inkişafla bağlı peşə."
  },
  "59": {
   "answer": "TƏLİMATÇI",
   "hint": "təhsil və inkişafla bağlı peşə."
  },
  "60": {
   "answer": "PROFESSOR",
   "hint": "təhsil və inkişafla bağlı peşə."
  },
  "61": {
   "answer": "TƏRBİYƏÇİ",
   "hint": "təhsil və inkişafla bağlı peşə."
  },
  "62": {
   "answer": "KİTABXANAÇI",
   "hint": "təhsil və inkişafla bağlı peşə."
  },
  "63": {
   "answer": "ARXEOLOQ",
   "hint": "elm və tədqiqatla bağlı peşə."
  },
  "64": {
   "answer": "TARİXÇİ",
   "hint": "elm və tədqiqatla bağlı peşə."
  },
  "65": {
   "answer": "BİOLOQ",
   "hint": "elm və tədqiqatla bağlı peşə."
  },
  "66": {
   "answer": "KİMYAÇI",
   "hint": "elm və tədqiqatla bağlı peşə."
  },
  "67": {
   "answer": "FİZİK",
   "hint": "elm və tədqiqatla bağlı peşə."
  },
  "68": {
   "answer": "ASTRONOM",
   "hint": "elm və tədqiqatla bağlı peşə."
  },
  "69": {
   "answer": "GEOLOQ",
   "hint": "elm və tədqiqatla bağlı peşə."
  },
  "70": {
   "answer": "EKOLOQ",
   "hint": "elm və tədqiqatla bağlı peşə."
  },
  "71": {
   "answer": "METEOROLOQ",
   "hint": "elm və tədqiqatla bağlı peşə."
  },
  "72": {
   "answer": "KARTOQRAF",
   "hint": "elm və tədqiqatla bağlı peşə."
  },
  "73": {
   "answer": "GEODEZİST",
   "hint": "elm və tədqiqatla bağlı peşə."
  },
  "74": {
   "answer": "LABORANT",
   "hint": "elm və tədqiqatla bağlı peşə."
  },
  "75": {
   "answer": "ALİM",
   "hint": "elm və tədqiqatla bağlı peşə."
  },
  "76": {
   "answer": "KASKADYOR",
   "hint": "yaradıcılıq və səhnə sənəti ilə bağlı peşə."
  },
  "77": {
   "answer": "REJİSSOR",
   "hint": "yaradıcılıq və səhnə sənəti ilə bağlı peşə."
  },
  "78": {
   "answer": "OPERATOR",
   "hint": "yaradıcılıq və səhnə sənəti ilə bağlı peşə."
  },
  "79": {
   "answer": "SSENARİST",
   "hint": "yaradıcılıq və səhnə sənəti ilə bağlı peşə."
  },
  "80": {
   "answer": "PRODÜSER",
   "hint": "yaradıcılıq və səhnə sənəti ilə bağlı peşə."
  },
  "81": {
   "answer": "MUSİQİÇİ",
   "hint": "yaradıcılıq və səhnə sənəti ilə bağlı peşə."
  },
  "82": {
   "answer": "MÜĞƏNNİ",
   "hint": "yaradıcılıq və səhnə sənəti ilə bağlı peşə."
  },
  "83": {
   "answer": "RƏQQAS",
   "hint": "yaradıcılıq və səhnə sənəti ilə bağlı peşə."
  },
  "84": {
   "answer": "XOREOQRAF",
   "hint": "yaradıcılıq və səhnə sənəti ilə bağlı peşə."
  },
  "85": {
   "answer": "İLLÜSTRATOR",
   "hint": "yaradıcılıq və səhnə sənəti ilə bağlı peşə."
  },
  "86": {
   "answer": "HEYKƏLTƏRAŞ",
   "hint": "yaradıcılıq və səhnə sənəti ilə bağlı peşə."
  },
  "87": {
   "answer": "SAATUSTASI",
   "hint": "peşəkar sənətkarlıq və əl əməyi ilə bağlı peşə."
  },
  "88": {
   "answer": "DƏRZİ",
   "hint": "peşəkar sənətkarlıq və əl əməyi ilə bağlı peşə."
  },
  "89": {
   "answer": "TİKİŞÇİ",
   "hint": "peşəkar sənətkarlıq və əl əməyi ilə bağlı peşə."
  },
  "90": {
   "answer": "MODELYER",
   "hint": "peşəkar sənətkarlıq və əl əməyi ilə bağlı peşə."
  },
  "91": {
   "answer": "FLORİST",
   "hint": "təbiət, bitkilər və kənd təsərrüfatı ilə bağlı peşə."
  },
  "92": {
   "answer": "BAĞBAN",
   "hint": "təbiət, bitkilər və kənd təsərrüfatı ilə bağlı peşə."
  },
  "93": {
   "answer": "AQRONOM",
   "hint": "təbiət, bitkilər və kənd təsərrüfatı ilə bağlı peşə."
  },
  "94": {
   "answer": "MEŞƏÇİ",
   "hint": "təbiət, bitkilər və kənd təsərrüfatı ilə bağlı peşə."
  },
  "95": {
   "answer": "MƏDƏNÇİ",
   "hint": "peşəkar sənətkarlıq və əl əməyi ilə bağlı peşə."
  },
  "96": {
   "answer": "QAYNAQÇI",
   "hint": "peşəkar sənətkarlıq və əl əməyi ilə bağlı peşə."
  },
  "97": {
   "answer": "TORNAÇI",
   "hint": "peşəkar sənətkarlıq və əl əməyi ilə bağlı peşə."
  },
  "98": {
   "answer": "ÇİLİNGƏR",
   "hint": "peşəkar sənətkarlıq və əl əməyi ilə bağlı peşə."
  },
  "99": {
   "answer": "DÜLGƏR",
   "hint": "peşəkar sənətkarlıq və əl əməyi ilə bağlı peşə."
  },
  "100": {
   "answer": "SUVAQÇI",
   "hint": "tikinti və binalarla bağlı peşə."
  }
 }
};
const TRAVEL_LEVELS={
 "1": {
  "answer": "ПАСПОРТ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛂",
    "🛂"
   ],
   [
    "📕",
    "📕"
   ],
   [
    "✈️",
    "✈️"
   ],
   [
    "🌍",
    "🌍"
   ]
  ]
 },
 "2": {
  "answer": "БИЛЕТ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🎫",
    "🎫"
   ],
   [
    "✈️",
    "✈️"
   ],
   [
    "🚆",
    "🚆"
   ],
   [
    "📱",
    "📱"
   ]
  ]
 },
 "3": {
  "answer": "ЧЕМОДАН",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🧳",
    "🧳"
   ],
   [
    "✈️",
    "✈️"
   ],
   [
    "🏨",
    "🏨"
   ],
   [
    "🧥",
    "🧥"
   ]
  ]
 },
 "4": {
  "answer": "РЮКЗАК",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🎒",
    "🎒"
   ],
   [
    "🥾",
    "🥾"
   ],
   [
    "🏕️",
    "🏕️"
   ],
   [
    "🗺️",
    "🗺️"
   ]
  ]
 },
 "5": {
  "answer": "КАРТА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🗺️",
    "🗺️"
   ],
   [
    "📍",
    "📍"
   ],
   [
    "🧭",
    "🧭"
   ],
   [
    "🌍",
    "🌍"
   ]
  ]
 },
 "6": {
  "answer": "ГОСТИНИЦА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏨",
    "🏨"
   ],
   [
    "🛏️",
    "🛏️"
   ],
   [
    "🛎️",
    "🛎️"
   ],
   [
    "🧳",
    "🧳"
   ]
  ]
 },
 "7": {
  "answer": "АЭРОПОРТ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "✈️",
    "✈️"
   ],
   [
    "🛄",
    "🛄"
   ],
   [
    "🛫",
    "🛫"
   ],
   [
    "🛬",
    "🛬"
   ]
  ]
 },
 "8": {
  "answer": "ВОКЗАЛ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🚉",
    "🚉"
   ],
   [
    "🚆",
    "🚆"
   ],
   [
    "🕒",
    "🕒"
   ],
   [
    "🎫",
    "🎫"
   ]
  ]
 },
 "9": {
  "answer": "ПОЕЗД",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🚆",
    "🚆"
   ],
   [
    "🛤️",
    "🛤️"
   ],
   [
    "🚉",
    "🚉"
   ],
   [
    "🎫",
    "🎫"
   ]
  ]
 },
 "10": {
  "answer": "САМОЛЕТ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "✈️",
    "✈️"
   ],
   [
    "☁️",
    "☁️"
   ],
   [
    "🛫",
    "🛫"
   ],
   [
    "🌍",
    "🌍"
   ]
  ]
 },
 "11": {
  "answer": "КОРАБЛЬ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🚢",
    "🚢"
   ],
   [
    "⚓",
    "⚓"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "🧭",
    "🧭"
   ]
  ]
 },
 "12": {
  "answer": "АВТОБУС",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🚌",
    "🚌"
   ],
   [
    "🛣️",
    "🛣️"
   ],
   [
    "🚏",
    "🚏"
   ],
   [
    "🎫",
    "🎫"
   ]
  ]
 },
 "13": {
  "answer": "ТАКСИ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🚕",
    "🚕"
   ],
   [
    "📍",
    "📍"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "🛣️",
    "🛣️"
   ]
  ]
 },
 "14": {
  "answer": "МЕТРО",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🚇",
    "🚇"
   ],
   [
    "🚉",
    "🚉"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "🎫",
    "🎫"
   ]
  ]
 },
 "15": {
  "answer": "ДОРОГА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛣️",
    "🛣️"
   ],
   [
    "🚗",
    "🚗"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "➡️",
    "➡️"
   ]
  ]
 },
 "16": {
  "answer": "ТРАССА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛣️",
    "🛣️"
   ],
   [
    "🚙",
    "🚙"
   ],
   [
    "🧭",
    "🧭"
   ],
   [
    "📍",
    "📍"
   ]
  ]
 },
 "17": {
  "answer": "МОСТ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🌉",
    "🌉"
   ],
   [
    "🚗",
    "🚗"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "🏙️",
    "🏙️"
   ]
  ]
 },
 "18": {
  "answer": "ТОННЕЛЬ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🚇",
    "🚇"
   ],
   [
    "🕳️",
    "🕳️"
   ],
   [
    "🚗",
    "🚗"
   ],
   [
    "💡",
    "💡"
   ]
  ]
 },
 "19": {
  "answer": "ГРАНИЦА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛂",
    "🛂"
   ],
   [
    "🚧",
    "🚧"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "🏳️",
    "🏳️"
   ]
  ]
 },
 "20": {
  "answer": "ВИЗА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛂",
    "🛂"
   ],
   [
    "📄",
    "📄"
   ],
   [
    "✈️",
    "✈️"
   ],
   [
    "✅",
    "✅"
   ]
  ]
 },
 "21": {
  "answer": "ТУРИСТ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "📷",
    "📷"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "🧳",
    "🧳"
   ],
   [
    "😎",
    "😎"
   ]
  ]
 },
 "22": {
  "answer": "ГИД",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🗣️",
    "🗣️"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "👥",
    "👥"
   ],
   [
    "📍",
    "📍"
   ]
  ]
 },
 "23": {
  "answer": "ЭКСКУРСИЯ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🚌",
    "🚌"
   ],
   [
    "🏛️",
    "🏛️"
   ],
   [
    "👥",
    "👥"
   ],
   [
    "🎧",
    "🎧"
   ]
  ]
 },
 "24": {
  "answer": "МАРШРУТ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🗺️",
    "🗺️"
   ],
   [
    "📍",
    "📍"
   ],
   [
    "➡️",
    "➡️"
   ],
   [
    "🧭",
    "🧭"
   ]
  ]
 },
 "25": {
  "answer": "НАВИГАТОР",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "📱",
    "📱"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "📍",
    "📍"
   ],
   [
    "🧭",
    "🧭"
   ]
  ]
 },
 "26": {
  "answer": "КОМПАС",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🧭",
    "🧭"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "🥾",
    "🥾"
   ],
   [
    "🌍",
    "🌍"
   ]
  ]
 },
 "27": {
  "answer": "КЕМПИНГ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏕️",
    "🏕️"
   ],
   [
    "⛺",
    "⛺"
   ],
   [
    "🔥",
    "🔥"
   ],
   [
    "🌲",
    "🌲"
   ]
  ]
 },
 "28": {
  "answer": "ПАЛАТКА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "⛺",
    "⛺"
   ],
   [
    "🏕️",
    "🏕️"
   ],
   [
    "🌲",
    "🌲"
   ],
   [
    "🌙",
    "🌙"
   ]
  ]
 },
 "29": {
  "answer": "КОСТЕР",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🔥",
    "🔥"
   ],
   [
    "🏕️",
    "🏕️"
   ],
   [
    "🌙",
    "🌙"
   ],
   [
    "🪵",
    "🪵"
   ]
  ]
 },
 "30": {
  "answer": "ПОХОД",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🥾",
    "🥾"
   ],
   [
    "🎒",
    "🎒"
   ],
   [
    "⛰️",
    "⛰️"
   ],
   [
    "🗺️",
    "🗺️"
   ]
  ]
 },
 "31": {
  "answer": "ПИКНИК",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🧺",
    "🧺"
   ],
   [
    "🥪",
    "🥪"
   ],
   [
    "🌳",
    "🌳"
   ],
   [
    "☀️",
    "☀️"
   ]
  ]
 },
 "32": {
  "answer": "ПЛЯЖ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏖️",
    "🏖️"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "☀️",
    "☀️"
   ],
   [
    "⛱️",
    "⛱️"
   ]
  ]
 },
 "33": {
  "answer": "КУРОРТ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏨",
    "🏨"
   ],
   [
    "🏖️",
    "🏖️"
   ],
   [
    "🌴",
    "🌴"
   ],
   [
    "😎",
    "😎"
   ]
  ]
 },
 "34": {
  "answer": "ОСТРОВ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏝️",
    "🏝️"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "🌴",
    "🌴"
   ],
   [
    "🚤",
    "🚤"
   ]
  ]
 },
 "35": {
  "answer": "МАТЕРИК",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🌍",
    "🌍"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "🏔️",
    "🏔️"
   ],
   [
    "🌊",
    "🌊"
   ]
  ]
 },
 "36": {
  "answer": "ГОРА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "⛰️",
    "⛰️"
   ],
   [
    "🥾",
    "🥾"
   ],
   [
    "❄️",
    "❄️"
   ],
   [
    "🧗",
    "🧗"
   ]
  ]
 },
 "37": {
  "answer": "ВЕРШИНА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏔️",
    "🏔️"
   ],
   [
    "🚩",
    "🚩"
   ],
   [
    "🥾",
    "🥾"
   ],
   [
    "☁️",
    "☁️"
   ]
  ]
 },
 "38": {
  "answer": "ДОЛИНА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏞️",
    "🏞️"
   ],
   [
    "⛰️",
    "⛰️"
   ],
   [
    "🌿",
    "🌿"
   ],
   [
    "🌊",
    "🌊"
   ]
  ]
 },
 "39": {
  "answer": "ЛЕС",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🌲",
    "🌲"
   ],
   [
    "🌳",
    "🌳"
   ],
   [
    "🥾",
    "🥾"
   ],
   [
    "🦌",
    "🦌"
   ]
  ]
 },
 "40": {
  "answer": "ПУСТЫНЯ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏜️",
    "🏜️"
   ],
   [
    "🐪",
    "🐪"
   ],
   [
    "☀️",
    "☀️"
   ],
   [
    "🌵",
    "🌵"
   ]
  ]
 },
 "41": {
  "answer": "ВОДОПАД",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "💦",
    "💦"
   ],
   [
    "🏞️",
    "🏞️"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "⬇️",
    "⬇️"
   ]
  ]
 },
 "42": {
  "answer": "ОЗЕРО",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏞️",
    "🏞️"
   ],
   [
    "💧",
    "💧"
   ],
   [
    "🚣",
    "🚣"
   ],
   [
    "🌲",
    "🌲"
   ]
  ]
 },
 "43": {
  "answer": "РЕКА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏞️",
    "🏞️"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "🚣",
    "🚣"
   ],
   [
    "🌉",
    "🌉"
   ]
  ]
 },
 "44": {
  "answer": "ОКЕАН",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🌊",
    "🌊"
   ],
   [
    "🐋",
    "🐋"
   ],
   [
    "🚢",
    "🚢"
   ],
   [
    "🌍",
    "🌍"
   ]
  ]
 },
 "45": {
  "answer": "БУХТА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🌊",
    "🌊"
   ],
   [
    "⛵",
    "⛵"
   ],
   [
    "🏝️",
    "🏝️"
   ],
   [
    "⚓",
    "⚓"
   ]
  ]
 },
 "46": {
  "answer": "ПОРТ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "⚓",
    "⚓"
   ],
   [
    "🚢",
    "🚢"
   ],
   [
    "📦",
    "📦"
   ],
   [
    "🌊",
    "🌊"
   ]
  ]
 },
 "47": {
  "answer": "МАЯК",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🗼",
    "🗼"
   ],
   [
    "💡",
    "💡"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "🚢",
    "🚢"
   ]
  ]
 },
 "48": {
  "answer": "ЗАКАТ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🌅",
    "🌅"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "📷",
    "📷"
   ],
   [
    "🧡",
    "🧡"
   ]
  ]
 },
 "49": {
  "answer": "РАССВЕТ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🌄",
    "🌄"
   ],
   [
    "☀️",
    "☀️"
   ],
   [
    "📷",
    "📷"
   ],
   [
    "🌅",
    "🌅"
   ]
  ]
 },
 "50": {
  "answer": "ПАНОРАМА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏞️",
    "🏞️"
   ],
   [
    "📷",
    "📷"
   ],
   [
    "👀",
    "👀"
   ],
   [
    "🌄",
    "🌄"
   ]
  ]
 },
 "51": {
  "answer": "СНИМОК",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "📷",
    "📷"
   ],
   [
    "📸",
    "📸"
   ],
   [
    "🖼️",
    "🖼️"
   ],
   [
    "🌍",
    "🌍"
   ]
  ]
 },
 "52": {
  "answer": "СУВЕНИР",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🎁",
    "🎁"
   ],
   [
    "🧲",
    "🧲"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "🛍️",
    "🛍️"
   ]
  ]
 },
 "53": {
  "answer": "ОТКРЫТКА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "💌",
    "💌"
   ],
   [
    "📮",
    "📮"
   ],
   [
    "🏞️",
    "🏞️"
   ],
   [
    "✍️",
    "✍️"
   ]
  ]
 },
 "54": {
  "answer": "РУИНЫ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏛️",
    "🏛️"
   ],
   [
    "🧱",
    "🧱"
   ],
   [
    "🏺",
    "🏺"
   ],
   [
    "📷",
    "📷"
   ]
  ]
 },
 "55": {
  "answer": "ЗАМОК",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏰",
    "🏰"
   ],
   [
    "👑",
    "👑"
   ],
   [
    "🗿",
    "🗿"
   ],
   [
    "📷",
    "📷"
   ]
  ]
 },
 "56": {
  "answer": "ДВОРЕЦ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏛️",
    "🏛️"
   ],
   [
    "👑",
    "👑"
   ],
   [
    "✨",
    "✨"
   ],
   [
    "📷",
    "📷"
   ]
  ]
 },
 "57": {
  "answer": "ХРАМ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛕",
    "🛕"
   ],
   [
    "🙏",
    "🙏"
   ],
   [
    "🏛️",
    "🏛️"
   ],
   [
    "🕯️",
    "🕯️"
   ]
  ]
 },
 "58": {
  "answer": "МЕЧЕТЬ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🕌",
    "🕌"
   ],
   [
    "🌙",
    "🌙"
   ],
   [
    "🙏",
    "🙏"
   ],
   [
    "🏛️",
    "🏛️"
   ]
  ]
 },
 "59": {
  "answer": "СОБОР",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "⛪",
    "⛪"
   ],
   [
    "🔔",
    "🔔"
   ],
   [
    "🏛️",
    "🏛️"
   ],
   [
    "✨",
    "✨"
   ]
  ]
 },
 "60": {
  "answer": "ПЛОЩАДЬ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏙️",
    "🏙️"
   ],
   [
    "⛲",
    "⛲"
   ],
   [
    "👥",
    "👥"
   ],
   [
    "📷",
    "📷"
   ]
  ]
 },
 "61": {
  "answer": "УЛИЦА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏙️",
    "🏙️"
   ],
   [
    "🚶",
    "🚶"
   ],
   [
    "🚦",
    "🚦"
   ],
   [
    "🏘️",
    "🏘️"
   ]
  ]
 },
 "62": {
  "answer": "РЫНОК",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛍️",
    "🛍️"
   ],
   [
    "🥭",
    "🥭"
   ],
   [
    "👥",
    "👥"
   ],
   [
    "💰",
    "💰"
   ]
  ]
 },
 "63": {
  "answer": "КАФЕ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "☕",
    "☕"
   ],
   [
    "🥐",
    "🥐"
   ],
   [
    "🪑",
    "🪑"
   ],
   [
    "🍰",
    "🍰"
   ]
  ]
 },
 "64": {
  "answer": "РЕСТОРАН",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🍽️",
    "🍽️"
   ],
   [
    "🍷",
    "🍷"
   ],
   [
    "👨‍🍳",
    "👨‍🍳"
   ],
   [
    "🧾",
    "🧾"
   ]
  ]
 },
 "65": {
  "answer": "МЕНЮ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "📖",
    "📖"
   ],
   [
    "🍽️",
    "🍽️"
   ],
   [
    "🍲",
    "🍲"
   ],
   [
    "💳",
    "💳"
   ]
  ]
 },
 "66": {
  "answer": "ЗАВТРАК",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "☕",
    "☕"
   ],
   [
    "🥐",
    "🥐"
   ],
   [
    "🍳",
    "🍳"
   ],
   [
    "🌅",
    "🌅"
   ]
  ]
 },
 "67": {
  "answer": "ПРОГУЛКА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🚶",
    "🚶"
   ],
   [
    "🌳",
    "🌳"
   ],
   [
    "📷",
    "📷"
   ],
   [
    "☀️",
    "☀️"
   ]
  ]
 },
 "68": {
  "answer": "САМОКАТ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛴",
    "🛴"
   ],
   [
    "🛣️",
    "🛣️"
   ],
   [
    "🪖",
    "🪖"
   ],
   [
    "🌳",
    "🌳"
   ]
  ]
 },
 "69": {
  "answer": "ЛОДКА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🚤",
    "🚤"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "⚓",
    "⚓"
   ],
   [
    "🛟",
    "🛟"
   ]
  ]
 },
 "70": {
  "answer": "ПАРОМ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "⛴️",
    "⛴️"
   ],
   [
    "🚗",
    "🚗"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "⚓",
    "⚓"
   ]
  ]
 },
 "71": {
  "answer": "КРУИЗ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛳️",
    "🛳️"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "🏝️",
    "🏝️"
   ],
   [
    "🍹",
    "🍹"
   ]
  ]
 },
 "72": {
  "answer": "РЕЙС",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "✈️",
    "✈️"
   ],
   [
    "🕒",
    "🕒"
   ],
   [
    "🎫",
    "🎫"
   ],
   [
    "🛫",
    "🛫"
   ]
  ]
 },
 "73": {
  "answer": "ВЗЛЕТ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛫",
    "🛫"
   ],
   [
    "✈️",
    "✈️"
   ],
   [
    "☁️",
    "☁️"
   ],
   [
    "⬆️",
    "⬆️"
   ]
  ]
 },
 "74": {
  "answer": "ПРИЛЕТ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛬",
    "🛬"
   ],
   [
    "✈️",
    "✈️"
   ],
   [
    "🛄",
    "🛄"
   ],
   [
    "👋",
    "👋"
   ]
  ]
 },
 "75": {
  "answer": "БАГАЖ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🧳",
    "🧳"
   ],
   [
    "🛄",
    "🛄"
   ],
   [
    "✈️",
    "✈️"
   ],
   [
    "🏷️",
    "🏷️"
   ]
  ]
 },
 "76": {
  "answer": "РЕГИСТРАЦИЯ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🎫",
    "🎫"
   ],
   [
    "🛂",
    "🛂"
   ],
   [
    "🛄",
    "🛄"
   ],
   [
    "✅",
    "✅"
   ]
  ]
 },
 "77": {
  "answer": "БРОНЬ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "📱",
    "📱"
   ],
   [
    "🏨",
    "🏨"
   ],
   [
    "✅",
    "✅"
   ],
   [
    "📅",
    "📅"
   ]
  ]
 },
 "78": {
  "answer": "НОМЕР",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛏️",
    "🛏️"
   ],
   [
    "🏨",
    "🏨"
   ],
   [
    "🔑",
    "🔑"
   ],
   [
    "🚪",
    "🚪"
   ]
  ]
 },
 "79": {
  "answer": "КЛЮЧ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🔑",
    "🔑"
   ],
   [
    "🏨",
    "🏨"
   ],
   [
    "🚪",
    "🚪"
   ],
   [
    "🧳",
    "🧳"
   ]
  ]
 },
 "80": {
  "answer": "ХОСТЕЛ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛏️",
    "🛏️"
   ],
   [
    "🎒",
    "🎒"
   ],
   [
    "👥",
    "👥"
   ],
   [
    "🏠",
    "🏠"
   ]
  ]
 },
 "81": {
  "answer": "ТРАНСФЕР",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🚐",
    "🚐"
   ],
   [
    "✈️",
    "✈️"
   ],
   [
    "🏨",
    "🏨"
   ],
   [
    "📍",
    "📍"
   ]
  ]
 },
 "82": {
  "answer": "СТРАХОВКА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛡️",
    "🛡️"
   ],
   [
    "📄",
    "📄"
   ],
   [
    "✈️",
    "✈️"
   ],
   [
    "✅",
    "✅"
   ]
  ]
 },
 "83": {
  "answer": "ВАЛЮТА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "💵",
    "💵"
   ],
   [
    "💶",
    "💶"
   ],
   [
    "💱",
    "💱"
   ],
   [
    "🏦",
    "🏦"
   ]
  ]
 },
 "84": {
  "answer": "ОБМЕН",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "💱",
    "💱"
   ],
   [
    "💵",
    "💵"
   ],
   [
    "💶",
    "💶"
   ],
   [
    "🏦",
    "🏦"
   ]
  ]
 },
 "85": {
  "answer": "ЧАСОВОЙПОЯС",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🕒",
    "🕒"
   ],
   [
    "🌍",
    "🌍"
   ],
   [
    "✈️",
    "✈️"
   ],
   [
    "🌐",
    "🌐"
   ]
  ]
 },
 "86": {
  "answer": "ПРИКЛЮЧЕНИЕ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🧭",
    "🧭"
   ],
   [
    "🎒",
    "🎒"
   ],
   [
    "⛰️",
    "⛰️"
   ],
   [
    "✨",
    "✨"
   ]
  ]
 },
 "87": {
  "answer": "ЭКСПЕДИЦИЯ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🧭",
    "🧭"
   ],
   [
    "🏕️",
    "🏕️"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "🔭",
    "🔭"
   ]
  ]
 },
 "88": {
  "answer": "САФАРИ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🦁",
    "🦁"
   ],
   [
    "🚙",
    "🚙"
   ],
   [
    "🌍",
    "🌍"
   ],
   [
    "📷",
    "📷"
   ]
  ]
 },
 "89": {
  "answer": "ДАЙВИНГ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🤿",
    "🤿"
   ],
   [
    "🐠",
    "🐠"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "🪸",
    "🪸"
   ]
  ]
 },
 "90": {
  "answer": "РАФТИНГ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🛶",
    "🛶"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "🦺",
    "🦺"
   ],
   [
    "🏞️",
    "🏞️"
   ]
  ]
 },
 "91": {
  "answer": "СНЕГОХОД",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏔️",
    "🏔️"
   ],
   [
    "❄️",
    "❄️"
   ],
   [
    "🛷",
    "🛷"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "92": {
  "answer": "СНОУБОРД",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏂",
    "🏂"
   ],
   [
    "❄️",
    "❄️"
   ],
   [
    "🏔️",
    "🏔️"
   ],
   [
    "🚠",
    "🚠"
   ]
  ]
 },
 "93": {
  "answer": "ФУНИКУЛЕР",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🚞",
    "🚞"
   ],
   [
    "⛰️",
    "⛰️"
   ],
   [
    "⬆️",
    "⬆️"
   ],
   [
    "🏙️",
    "🏙️"
   ]
  ]
 },
 "94": {
  "answer": "ТРОПА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🥾",
    "🥾"
   ],
   [
    "🌲",
    "🌲"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "⛰️",
    "⛰️"
   ]
  ]
 },
 "95": {
  "answer": "ПЕРЕВАЛ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏔️",
    "🏔️"
   ],
   [
    "🛣️",
    "🛣️"
   ],
   [
    "🥾",
    "🥾"
   ],
   [
    "🧭",
    "🧭"
   ]
  ]
 },
 "96": {
  "answer": "ЛАГУНА",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🏝️",
    "🏝️"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "🐠",
    "🐠"
   ],
   [
    "☀️",
    "☀️"
   ]
  ]
 },
 "97": {
  "answer": "РИФ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🪸",
    "🪸"
   ],
   [
    "🐠",
    "🐠"
   ],
   [
    "🌊",
    "🌊"
   ],
   [
    "🤿",
    "🤿"
   ]
  ]
 },
 "98": {
  "answer": "ВУЛКАН",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🌋",
    "🌋"
   ],
   [
    "🔥",
    "🔥"
   ],
   [
    "🏝️",
    "🏝️"
   ],
   [
    "📷",
    "📷"
   ]
  ]
 },
 "99": {
  "answer": "ЛЕДНИК",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🧊",
    "🧊"
   ],
   [
    "🏔️",
    "🏔️"
   ],
   [
    "❄️",
    "❄️"
   ],
   [
    "💧",
    "💧"
   ]
  ]
 },
 "100": {
  "answer": "ПУТЕШЕСТВИЕ",
  "hint": "Слово, связанное с путешествиями, дорогой, отдыхом или новыми местами.",
  "photos": [
   [
    "🌍",
    "🌍"
   ],
   [
    "✈️",
    "✈️"
   ],
   [
    "🧳",
    "🧳"
   ],
   [
    "🗺️",
    "🗺️"
   ]
  ]
 }
};
const TRAVEL_TRANSLATED={
 "en": {
  "1": {
   "answer": "PASSPORT",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "2": {
   "answer": "TICKET",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "3": {
   "answer": "SUITCASE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "4": {
   "answer": "BACKPACK",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "5": {
   "answer": "MAP",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "6": {
   "answer": "HOTEL",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "7": {
   "answer": "AIRPORT",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "8": {
   "answer": "STATION",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "9": {
   "answer": "TRAIN",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "10": {
   "answer": "AIRPLANE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "11": {
   "answer": "SHIP",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "12": {
   "answer": "BUS",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "13": {
   "answer": "TAXI",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "14": {
   "answer": "METRO",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "15": {
   "answer": "ROAD",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "16": {
   "answer": "HIGHWAY",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "17": {
   "answer": "BRIDGE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "18": {
   "answer": "TUNNEL",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "19": {
   "answer": "BORDER",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "20": {
   "answer": "VISA",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "21": {
   "answer": "TOURIST",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "22": {
   "answer": "GUIDE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "23": {
   "answer": "EXCURSION",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "24": {
   "answer": "ROUTE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "25": {
   "answer": "NAVIGATOR",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "26": {
   "answer": "COMPASS",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "27": {
   "answer": "CAMPING",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "28": {
   "answer": "TENT",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "29": {
   "answer": "CAMPFIRE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "30": {
   "answer": "HIKE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "31": {
   "answer": "PICNIC",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "32": {
   "answer": "BEACH",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "33": {
   "answer": "RESORT",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "34": {
   "answer": "ISLAND",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "35": {
   "answer": "CONTINENT",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "36": {
   "answer": "MOUNTAIN",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "37": {
   "answer": "SUMMIT",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "38": {
   "answer": "VALLEY",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "39": {
   "answer": "FOREST",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "40": {
   "answer": "DESERT",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "41": {
   "answer": "WATERFALL",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "42": {
   "answer": "LAKE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "43": {
   "answer": "RIVER",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "44": {
   "answer": "OCEAN",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "45": {
   "answer": "BAY",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "46": {
   "answer": "PORT",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "47": {
   "answer": "LIGHTHOUSE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "48": {
   "answer": "SUNSET",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "49": {
   "answer": "SUNRISE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "50": {
   "answer": "PANORAMA",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "51": {
   "answer": "SNAPSHOT",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "52": {
   "answer": "SOUVENIR",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "53": {
   "answer": "POSTCARD",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "54": {
   "answer": "RUINS",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "55": {
   "answer": "CASTLE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "56": {
   "answer": "PALACE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "57": {
   "answer": "TEMPLE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "58": {
   "answer": "MOSQUE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "59": {
   "answer": "CATHEDRAL",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "60": {
   "answer": "SQUARE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "61": {
   "answer": "STREET",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "62": {
   "answer": "MARKET",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "63": {
   "answer": "CAFE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "64": {
   "answer": "RESTAURANT",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "65": {
   "answer": "MENU",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "66": {
   "answer": "BREAKFAST",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "67": {
   "answer": "WALK",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "68": {
   "answer": "SCOOTER",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "69": {
   "answer": "BOAT",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "70": {
   "answer": "FERRY",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "71": {
   "answer": "CRUISE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "72": {
   "answer": "FLIGHT",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "73": {
   "answer": "TAKEOFF",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "74": {
   "answer": "ARRIVAL",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "75": {
   "answer": "BAGGAGE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "76": {
   "answer": "CHECKIN",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "77": {
   "answer": "BOOKING",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "78": {
   "answer": "ROOM",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "79": {
   "answer": "KEY",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "80": {
   "answer": "HOSTEL",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "81": {
   "answer": "TRANSFER",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "82": {
   "answer": "INSURANCE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "83": {
   "answer": "CURRENCY",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "84": {
   "answer": "EXCHANGE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "85": {
   "answer": "TIMEZONE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "86": {
   "answer": "ADVENTURE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "87": {
   "answer": "EXPEDITION",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "88": {
   "answer": "SAFARI",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "89": {
   "answer": "DIVING",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "90": {
   "answer": "RAFTING",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "91": {
   "answer": "SNOWMOBILE",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "92": {
   "answer": "SNOWBOARD",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "93": {
   "answer": "FUNICULAR",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "94": {
   "answer": "TRAIL",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "95": {
   "answer": "MOUNTAINPASS",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "96": {
   "answer": "LAGOON",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "97": {
   "answer": "REEF",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "98": {
   "answer": "VOLCANO",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "99": {
   "answer": "GLACIER",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  },
  "100": {
   "answer": "TRAVEL",
   "hint": "A word connected with travel, routes, holidays, or exploring new places."
  }
 },
 "az": {
  "1": {
   "answer": "PASPORT",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "2": {
   "answer": "BİLET",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "3": {
   "answer": "ÇAMADAN",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "4": {
   "answer": "BELÇANTASI",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "5": {
   "answer": "XƏRİTƏ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "6": {
   "answer": "OTEL",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "7": {
   "answer": "AEROPORT",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "8": {
   "answer": "VAĞZAL",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "9": {
   "answer": "QATAR",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "10": {
   "answer": "TƏYYARƏ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "11": {
   "answer": "GƏMİ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "12": {
   "answer": "AVTOBUS",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "13": {
   "answer": "TAKSİ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "14": {
   "answer": "METRO",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "15": {
   "answer": "YOL",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "16": {
   "answer": "MAGİSTRAL",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "17": {
   "answer": "KÖRPÜ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "18": {
   "answer": "TUNEL",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "19": {
   "answer": "SƏRHƏD",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "20": {
   "answer": "VİZA",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "21": {
   "answer": "TURİST",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "22": {
   "answer": "BƏLƏDÇİ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "23": {
   "answer": "EKSKURSİYA",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "24": {
   "answer": "MARŞRUT",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "25": {
   "answer": "NAVİQATOR",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "26": {
   "answer": "KOMPAS",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "27": {
   "answer": "KEMPİNQ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "28": {
   "answer": "ÇADIR",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "29": {
   "answer": "TONQAL",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "30": {
   "answer": "YÜRÜŞ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "31": {
   "answer": "PİKNİK",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "32": {
   "answer": "ÇİMƏRLİK",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "33": {
   "answer": "KURORT",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "34": {
   "answer": "ADA",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "35": {
   "answer": "QİTƏ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "36": {
   "answer": "DAĞ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "37": {
   "answer": "ZİRVƏ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "38": {
   "answer": "VADİ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "39": {
   "answer": "MEŞƏ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "40": {
   "answer": "SƏHRA",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "41": {
   "answer": "ŞƏLALƏ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "42": {
   "answer": "GÖL",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "43": {
   "answer": "ÇAY",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "44": {
   "answer": "OKEAN",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "45": {
   "answer": "KÖRFƏZ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "46": {
   "answer": "LİMAN",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "47": {
   "answer": "MAYAK",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "48": {
   "answer": "GÜNBATIMI",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "49": {
   "answer": "GÜNÇIXIMI",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "50": {
   "answer": "PANORAMA",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "51": {
   "answer": "ŞƏKİL",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "52": {
   "answer": "SUVENİR",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "53": {
   "answer": "AÇIQCA",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "54": {
   "answer": "XARABALIQ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "55": {
   "answer": "QALA",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "56": {
   "answer": "SARAY",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "57": {
   "answer": "MƏBƏD",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "58": {
   "answer": "MƏSCİD",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "59": {
   "answer": "KAFEDRAL",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "60": {
   "answer": "MEYDAN",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "61": {
   "answer": "KÜÇƏ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "62": {
   "answer": "BAZAR",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "63": {
   "answer": "KAFE",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "64": {
   "answer": "RESTORAN",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "65": {
   "answer": "MENYU",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "66": {
   "answer": "SƏHƏRYEMƏYİ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "67": {
   "answer": "GƏZİNTİ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "68": {
   "answer": "SKUTER",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "69": {
   "answer": "QAYIQ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "70": {
   "answer": "BƏRƏ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "71": {
   "answer": "KRUIZ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "72": {
   "answer": "REYS",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "73": {
   "answer": "UÇUŞ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "74": {
   "answer": "GƏLİŞ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "75": {
   "answer": "BAQAJ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "76": {
   "answer": "QEYDİYYAT",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "77": {
   "answer": "REZERV",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "78": {
   "answer": "OTAQ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "79": {
   "answer": "AÇAR",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "80": {
   "answer": "HOSTEL",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "81": {
   "answer": "TRANSFER",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "82": {
   "answer": "SIĞORTA",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "83": {
   "answer": "VALYUTA",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "84": {
   "answer": "MÜBADİLƏ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "85": {
   "answer": "SAATZOLAĞI",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "86": {
   "answer": "MACƏRA",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "87": {
   "answer": "EKSPEDİSİYA",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "88": {
   "answer": "SAFARİ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "89": {
   "answer": "DAYVİNQ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "90": {
   "answer": "RAFTİNQ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "91": {
   "answer": "QARMAŞINI",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "92": {
   "answer": "SNOUBORD",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "93": {
   "answer": "FUNİKULYOR",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "94": {
   "answer": "CIĞIR",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "95": {
   "answer": "AŞIRIM",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "96": {
   "answer": "LAQUN",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "97": {
   "answer": "RİF",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "98": {
   "answer": "VULKAN",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "99": {
   "answer": "BUZLAQ",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  },
  "100": {
   "answer": "SƏYAHƏT",
   "hint": "Səyahət, yol, istirahət və yeni yerlərlə bağlı söz."
  }
 }
};
const SCIENCE_LEVELS={
 "1": {
  "answer": "НАУКА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🔬",
    "🔬"
   ],
   [
    "🧪",
    "🧪"
   ],
   [
    "📚",
    "📚"
   ],
   [
    "💡",
    "💡"
   ]
  ]
 },
 "2": {
  "answer": "ИССЛЕДОВАТЕЛЬ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🔬",
    "🔬"
   ],
   [
    "📚",
    "📚"
   ],
   [
    "🧪",
    "🧪"
   ],
   [
    "💡",
    "💡"
   ]
  ]
 },
 "3": {
  "answer": "ЛАБОРАТОРИЯ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧪",
    "🧪"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🥼",
    "🥼"
   ],
   [
    "⚗️",
    "⚗️"
   ]
  ]
 },
 "4": {
  "answer": "ЭКСПЕРИМЕНТ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧪",
    "🧪"
   ],
   [
    "⚗️",
    "⚗️"
   ],
   [
    "📋",
    "📋"
   ],
   [
    "✅",
    "✅"
   ]
  ]
 },
 "5": {
  "answer": "МИКРОСКОП",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🔬",
    "🔬"
   ],
   [
    "🦠",
    "🦠"
   ],
   [
    "🧫",
    "🧫"
   ],
   [
    "👁️",
    "👁️"
   ]
  ]
 },
 "6": {
  "answer": "ТЕЛЕСКОП",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🔭",
    "🔭"
   ],
   [
    "⭐",
    "⭐"
   ],
   [
    "🌌",
    "🌌"
   ],
   [
    "🪐",
    "🪐"
   ]
  ]
 },
 "7": {
  "answer": "ПРОБИРКА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧪",
    "🧪"
   ],
   [
    "⚗️",
    "⚗️"
   ],
   [
    "💧",
    "💧"
   ],
   [
    "🥼",
    "🥼"
   ]
  ]
 },
 "8": {
  "answer": "КОЛБА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚗️",
    "⚗️"
   ],
   [
    "🧪",
    "🧪"
   ],
   [
    "🔥",
    "🔥"
   ],
   [
    "💧",
    "💧"
   ]
  ]
 },
 "9": {
  "answer": "РЕАКТИВ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧪",
    "🧪"
   ],
   [
    "⚗️",
    "⚗️"
   ],
   [
    "🧴",
    "🧴"
   ],
   [
    "🔬",
    "🔬"
   ]
  ]
 },
 "10": {
  "answer": "ФОРМУЛА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧮",
    "🧮"
   ],
   [
    "📐",
    "📐"
   ],
   [
    "✏️",
    "✏️"
   ],
   [
    "📘",
    "📘"
   ]
  ]
 },
 "11": {
  "answer": "АТОМ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚛️",
    "⚛️"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🧪",
    "🧪"
   ],
   [
    "✨",
    "✨"
   ]
  ]
 },
 "12": {
  "answer": "МОЛЕКУЛА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚛️",
    "⚛️"
   ],
   [
    "🔗",
    "🔗"
   ],
   [
    "🧪",
    "🧪"
   ],
   [
    "🔬",
    "🔬"
   ]
  ]
 },
 "13": {
  "answer": "ЭЛЕМЕНТ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧪",
    "🧪"
   ],
   [
    "🔤",
    "🔤"
   ],
   [
    "⚛️",
    "⚛️"
   ],
   [
    "📊",
    "📊"
   ]
  ]
 },
 "14": {
  "answer": "ПРОТОН",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚛️",
    "⚛️"
   ],
   [
    "➕",
    "➕"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🧪",
    "🧪"
   ]
  ]
 },
 "15": {
  "answer": "НЕЙТРОН",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚛️",
    "⚛️"
   ],
   [
    "0️⃣",
    "0️⃣"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🧪",
    "🧪"
   ]
  ]
 },
 "16": {
  "answer": "ЭЛЕКТРОН",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚛️",
    "⚛️"
   ],
   [
    "➖",
    "➖"
   ],
   [
    "⚡",
    "⚡"
   ],
   [
    "🔬",
    "🔬"
   ]
  ]
 },
 "17": {
  "answer": "ИОН",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚛️",
    "⚛️"
   ],
   [
    "⚡",
    "⚡"
   ],
   [
    "➕",
    "➕"
   ],
   [
    "➖",
    "➖"
   ]
  ]
 },
 "18": {
  "answer": "ЯДРО",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚛️",
    "⚛️"
   ],
   [
    "🎯",
    "🎯"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🧪",
    "🧪"
   ]
  ]
 },
 "19": {
  "answer": "КРИСТАЛЛ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "💎",
    "💎"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "✨",
    "✨"
   ],
   [
    "🧊",
    "🧊"
   ]
  ]
 },
 "20": {
  "answer": "РАСТВОР",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧪",
    "🧪"
   ],
   [
    "💧",
    "💧"
   ],
   [
    "⚗️",
    "⚗️"
   ],
   [
    "🥄",
    "🥄"
   ]
  ]
 },
 "21": {
  "answer": "КИСЛОТА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧪",
    "🧪"
   ],
   [
    "⚠️",
    "⚠️"
   ],
   [
    "💧",
    "💧"
   ],
   [
    "⚗️",
    "⚗️"
   ]
  ]
 },
 "22": {
  "answer": "ЩЕЛОЧЬ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧪",
    "🧪"
   ],
   [
    "🧼",
    "🧼"
   ],
   [
    "⚗️",
    "⚗️"
   ],
   [
    "📊",
    "📊"
   ]
  ]
 },
 "23": {
  "answer": "ГАЗ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "💨",
    "💨"
   ],
   [
    "🧪",
    "🧪"
   ],
   [
    "☁️",
    "☁️"
   ],
   [
    "🎈",
    "🎈"
   ]
  ]
 },
 "24": {
  "answer": "ЖИДКОСТЬ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "💧",
    "💧"
   ],
   [
    "🧪",
    "🧪"
   ],
   [
    "🥤",
    "🥤"
   ],
   [
    "🌊",
    "🌊"
   ]
  ]
 },
 "25": {
  "answer": "ВЕЩЕСТВО",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧪",
    "🧪"
   ],
   [
    "⚛️",
    "⚛️"
   ],
   [
    "🧊",
    "🧊"
   ],
   [
    "💨",
    "💨"
   ]
  ]
 },
 "26": {
  "answer": "ТЕМПЕРАТУРА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌡️",
    "🌡️"
   ],
   [
    "🔥",
    "🔥"
   ],
   [
    "❄️",
    "❄️"
   ],
   [
    "📈",
    "📈"
   ]
  ]
 },
 "27": {
  "answer": "ДАВЛЕНИЕ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "📊",
    "📊"
   ],
   [
    "🌬️",
    "🌬️"
   ],
   [
    "🧪",
    "🧪"
   ],
   [
    "⬇️",
    "⬇️"
   ]
  ]
 },
 "28": {
  "answer": "УСКОРЕНИЕ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🏎️",
    "🏎️"
   ],
   [
    "💨",
    "💨"
   ],
   [
    "📈",
    "📈"
   ],
   [
    "⏱️",
    "⏱️"
   ]
  ]
 },
 "29": {
  "answer": "СИЛА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "💪",
    "💪"
   ],
   [
    "➡️",
    "➡️"
   ],
   [
    "⚙️",
    "⚙️"
   ],
   [
    "📐",
    "📐"
   ]
  ]
 },
 "30": {
  "answer": "РАБОТА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚙️",
    "⚙️"
   ],
   [
    "📐",
    "📐"
   ],
   [
    "➡️",
    "➡️"
   ],
   [
    "🔋",
    "🔋"
   ]
  ]
 },
 "31": {
  "answer": "МОЩНОСТЬ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚡",
    "⚡"
   ],
   [
    "🔋",
    "🔋"
   ],
   [
    "📈",
    "📈"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "32": {
  "answer": "ЭНЕРГИЯ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚡",
    "⚡"
   ],
   [
    "🔋",
    "🔋"
   ],
   [
    "☀️",
    "☀️"
   ],
   [
    "🔥",
    "🔥"
   ]
  ]
 },
 "33": {
  "answer": "ИМПУЛЬС",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "➡️",
    "➡️"
   ],
   [
    "⚽",
    "⚽"
   ],
   [
    "📐",
    "📐"
   ],
   [
    "💨",
    "💨"
   ]
  ]
 },
 "34": {
  "answer": "ТРЕНИЕ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🛞",
    "🛞"
   ],
   [
    "🧱",
    "🧱"
   ],
   [
    "🔥",
    "🔥"
   ],
   [
    "✋",
    "✋"
   ]
  ]
 },
 "35": {
  "answer": "ИНЕРЦИЯ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🚗",
    "🚗"
   ],
   [
    "➡️",
    "➡️"
   ],
   [
    "🧍",
    "🧍"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "36": {
  "answer": "ГРАВИТАЦИЯ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌍",
    "🌍"
   ],
   [
    "⬇️",
    "⬇️"
   ],
   [
    "🍎",
    "🍎"
   ],
   [
    "🪐",
    "🪐"
   ]
  ]
 },
 "37": {
  "answer": "ВОЛНА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌊",
    "🌊"
   ],
   [
    "〰️",
    "〰️"
   ],
   [
    "📡",
    "📡"
   ],
   [
    "🎵",
    "🎵"
   ]
  ]
 },
 "38": {
  "answer": "ЗВУК",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🔊",
    "🔊"
   ],
   [
    "🎵",
    "🎵"
   ],
   [
    "👂",
    "👂"
   ],
   [
    "〰️",
    "〰️"
   ]
  ]
 },
 "39": {
  "answer": "СВЕТ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "💡",
    "💡"
   ],
   [
    "☀️",
    "☀️"
   ],
   [
    "🌈",
    "🌈"
   ],
   [
    "👁️",
    "👁️"
   ]
  ]
 },
 "40": {
  "answer": "ОПТИКА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "👓",
    "👓"
   ],
   [
    "🔭",
    "🔭"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "💡",
    "💡"
   ]
  ]
 },
 "41": {
  "answer": "ПРЕЛОМЛЕНИЕ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌈",
    "🌈"
   ],
   [
    "💧",
    "💧"
   ],
   [
    "🔍",
    "🔍"
   ],
   [
    "➡️",
    "➡️"
   ]
  ]
 },
 "42": {
  "answer": "СПЕКТР",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌈",
    "🌈"
   ],
   [
    "📊",
    "📊"
   ],
   [
    "💡",
    "💡"
   ],
   [
    "🔬",
    "🔬"
   ]
  ]
 },
 "43": {
  "answer": "ЛАЗЕР",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🔴",
    "🔴"
   ],
   [
    "💡",
    "💡"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "📏",
    "📏"
   ]
  ]
 },
 "44": {
  "answer": "МАГНИТ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧲",
    "🧲"
   ],
   [
    "📎",
    "📎"
   ],
   [
    "🧭",
    "🧭"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "45": {
  "answer": "ТОК",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚡",
    "⚡"
   ],
   [
    "🔌",
    "🔌"
   ],
   [
    "💡",
    "💡"
   ],
   [
    "🔋",
    "🔋"
   ]
  ]
 },
 "46": {
  "answer": "НАПРЯЖЕНИЕ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚡",
    "⚡"
   ],
   [
    "🔌",
    "🔌"
   ],
   [
    "📈",
    "📈"
   ],
   [
    "🔋",
    "🔋"
   ]
  ]
 },
 "47": {
  "answer": "ЗАРЯД",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚡",
    "⚡"
   ],
   [
    "➕",
    "➕"
   ],
   [
    "➖",
    "➖"
   ],
   [
    "🔋",
    "🔋"
   ]
  ]
 },
 "48": {
  "answer": "ПОЛЕ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧲",
    "🧲"
   ],
   [
    "🌐",
    "🌐"
   ],
   [
    "⚡",
    "⚡"
   ],
   [
    "📐",
    "📐"
   ]
  ]
 },
 "49": {
  "answer": "ЧАСТИЦА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚛️",
    "⚛️"
   ],
   [
    "✨",
    "✨"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🧪",
    "🧪"
   ]
  ]
 },
 "50": {
  "answer": "КВАНТ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⚛️",
    "⚛️"
   ],
   [
    "✨",
    "✨"
   ],
   [
    "📐",
    "📐"
   ],
   [
    "🔬",
    "🔬"
   ]
  ]
 },
 "51": {
  "answer": "КЛЕТКА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🔬",
    "🔬"
   ],
   [
    "🧬",
    "🧬"
   ],
   [
    "🦠",
    "🦠"
   ],
   [
    "🌱",
    "🌱"
   ]
  ]
 },
 "52": {
  "answer": "ТКАНЬ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧬",
    "🧬"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🫀",
    "🫀"
   ],
   [
    "🧫",
    "🧫"
   ]
  ]
 },
 "53": {
  "answer": "ОРГАН",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🫀",
    "🫀"
   ],
   [
    "🧠",
    "🧠"
   ],
   [
    "🫁",
    "🫁"
   ],
   [
    "🧬",
    "🧬"
   ]
  ]
 },
 "54": {
  "answer": "ГЕН",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧬",
    "🧬"
   ],
   [
    "👨‍👩‍👧",
    "👨‍👩‍👧"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "📘",
    "📘"
   ]
  ]
 },
 "55": {
  "answer": "ДНК",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧬",
    "🧬"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "👨‍👩‍👧",
    "👨‍👩‍👧"
   ],
   [
    "🧪",
    "🧪"
   ]
  ]
 },
 "56": {
  "answer": "ХРОМОСОМА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧬",
    "🧬"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🧪",
    "🧪"
   ],
   [
    "📊",
    "📊"
   ]
  ]
 },
 "57": {
  "answer": "БЕЛОК",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🥚",
    "🥚"
   ],
   [
    "🧬",
    "🧬"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "💪",
    "💪"
   ]
  ]
 },
 "58": {
  "answer": "ФЕРМЕНТ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧪",
    "🧪"
   ],
   [
    "⚗️",
    "⚗️"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🍽️",
    "🍽️"
   ]
  ]
 },
 "59": {
  "answer": "БАКТЕРИЯ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🦠",
    "🦠"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🧫",
    "🧫"
   ],
   [
    "🧪",
    "🧪"
   ]
  ]
 },
 "60": {
  "answer": "ВИРУС",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🦠",
    "🦠"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🧬",
    "🧬"
   ],
   [
    "😷",
    "😷"
   ]
  ]
 },
 "61": {
  "answer": "МИКРОБ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🦠",
    "🦠"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🧫",
    "🧫"
   ],
   [
    "👀",
    "👀"
   ]
  ]
 },
 "62": {
  "answer": "ИММУНИТЕТ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🛡️",
    "🛡️"
   ],
   [
    "🦠",
    "🦠"
   ],
   [
    "💉",
    "💉"
   ],
   [
    "🧬",
    "🧬"
   ]
  ]
 },
 "63": {
  "answer": "ЭВОЛЮЦИЯ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🐒",
    "🐒"
   ],
   [
    "🧬",
    "🧬"
   ],
   [
    "🌳",
    "🌳"
   ],
   [
    "⏳",
    "⏳"
   ]
  ]
 },
 "64": {
  "answer": "МУТАЦИЯ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧬",
    "🧬"
   ],
   [
    "⚡",
    "⚡"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🔄",
    "🔄"
   ]
  ]
 },
 "65": {
  "answer": "ВИД",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🐾",
    "🐾"
   ],
   [
    "🌱",
    "🌱"
   ],
   [
    "🧬",
    "🧬"
   ],
   [
    "📚",
    "📚"
   ]
  ]
 },
 "66": {
  "answer": "ПОПУЛЯЦИЯ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "👥",
    "👥"
   ],
   [
    "🐾",
    "🐾"
   ],
   [
    "🌍",
    "🌍"
   ],
   [
    "📊",
    "📊"
   ]
  ]
 },
 "67": {
  "answer": "ЭКОСИСТЕМА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌳",
    "🌳"
   ],
   [
    "🐦",
    "🐦"
   ],
   [
    "💧",
    "💧"
   ],
   [
    "🌱",
    "🌱"
   ]
  ]
 },
 "68": {
  "answer": "БИОСФЕРА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌍",
    "🌍"
   ],
   [
    "🌱",
    "🌱"
   ],
   [
    "🐋",
    "🐋"
   ],
   [
    "🌳",
    "🌳"
   ]
  ]
 },
 "69": {
  "answer": "ФОТОСИНТЕЗ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌿",
    "🌿"
   ],
   [
    "☀️",
    "☀️"
   ],
   [
    "💧",
    "💧"
   ],
   [
    "🌬️",
    "🌬️"
   ]
  ]
 },
 "70": {
  "answer": "ХЛОРОФИЛЛ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌿",
    "🌿"
   ],
   [
    "🟢",
    "🟢"
   ],
   [
    "☀️",
    "☀️"
   ],
   [
    "🔬",
    "🔬"
   ]
  ]
 },
 "71": {
  "answer": "МИНЕРАЛ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "💎",
    "💎"
   ],
   [
    "🪨",
    "🪨"
   ],
   [
    "⛏️",
    "⛏️"
   ],
   [
    "🔬",
    "🔬"
   ]
  ]
 },
 "72": {
  "answer": "ПОРОДА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🪨",
    "🪨"
   ],
   [
    "⛰️",
    "⛰️"
   ],
   [
    "⛏️",
    "⛏️"
   ],
   [
    "🔬",
    "🔬"
   ]
  ]
 },
 "73": {
  "answer": "МАГМА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌋",
    "🌋"
   ],
   [
    "🔥",
    "🔥"
   ],
   [
    "🪨",
    "🪨"
   ],
   [
    "🌍",
    "🌍"
   ]
  ]
 },
 "74": {
  "answer": "ТЕКТОНИКА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌍",
    "🌍"
   ],
   [
    "🪨",
    "🪨"
   ],
   [
    "↔️",
    "↔️"
   ],
   [
    "🏔️",
    "🏔️"
   ]
  ]
 },
 "75": {
  "answer": "СЕЙСМОГРАФ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "📈",
    "📈"
   ],
   [
    "🌍",
    "🌍"
   ],
   [
    "⚡",
    "⚡"
   ],
   [
    "🏚️",
    "🏚️"
   ]
  ]
 },
 "76": {
  "answer": "ЗЕМЛЕТРЯСЕНИЕ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌍",
    "🌍"
   ],
   [
    "🏚️",
    "🏚️"
   ],
   [
    "⚡",
    "⚡"
   ],
   [
    "📈",
    "📈"
   ]
  ]
 },
 "77": {
  "answer": "ЭРОЗИЯ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌊",
    "🌊"
   ],
   [
    "🪨",
    "🪨"
   ],
   [
    "💨",
    "💨"
   ],
   [
    "⏳",
    "⏳"
   ]
  ]
 },
 "78": {
  "answer": "КЛИМАТ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "☀️",
    "☀️"
   ],
   [
    "🌧️",
    "🌧️"
   ],
   [
    "❄️",
    "❄️"
   ],
   [
    "🌬️",
    "🌬️"
   ]
  ]
 },
 "79": {
  "answer": "АТМОСФЕРА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌍",
    "🌍"
   ],
   [
    "☁️",
    "☁️"
   ],
   [
    "🌬️",
    "🌬️"
   ],
   [
    "🌌",
    "🌌"
   ]
  ]
 },
 "80": {
  "answer": "ОЗОН",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌍",
    "🌍"
   ],
   [
    "☀️",
    "☀️"
   ],
   [
    "🛡️",
    "🛡️"
   ],
   [
    "🌤️",
    "🌤️"
   ]
  ]
 },
 "81": {
  "answer": "ПЛАНЕТА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🪐",
    "🪐"
   ],
   [
    "🌍",
    "🌍"
   ],
   [
    "🌌",
    "🌌"
   ],
   [
    "🔭",
    "🔭"
   ]
  ]
 },
 "82": {
  "answer": "ЗВЕЗДА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "⭐",
    "⭐"
   ],
   [
    "🌌",
    "🌌"
   ],
   [
    "🔭",
    "🔭"
   ],
   [
    "☀️",
    "☀️"
   ]
  ]
 },
 "83": {
  "answer": "ГАЛАКТИКА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌌",
    "🌌"
   ],
   [
    "⭐",
    "⭐"
   ],
   [
    "🌀",
    "🌀"
   ],
   [
    "🔭",
    "🔭"
   ]
  ]
 },
 "84": {
  "answer": "ТУМАННОСТЬ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌌",
    "🌌"
   ],
   [
    "☁️",
    "☁️"
   ],
   [
    "✨",
    "✨"
   ],
   [
    "🔭",
    "🔭"
   ]
  ]
 },
 "85": {
  "answer": "КОМЕТА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "☄️",
    "☄️"
   ],
   [
    "🌌",
    "🌌"
   ],
   [
    "⭐",
    "⭐"
   ],
   [
    "🔭",
    "🔭"
   ]
  ]
 },
 "86": {
  "answer": "АСТЕРОИД",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🪨",
    "🪨"
   ],
   [
    "🌌",
    "🌌"
   ],
   [
    "☄️",
    "☄️"
   ],
   [
    "🔭",
    "🔭"
   ]
  ]
 },
 "87": {
  "answer": "МЕТЕОР",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "☄️",
    "☄️"
   ],
   [
    "🔥",
    "🔥"
   ],
   [
    "🌌",
    "🌌"
   ],
   [
    "✨",
    "✨"
   ]
  ]
 },
 "88": {
  "answer": "ОРБИТА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🪐",
    "🪐"
   ],
   [
    "⭕",
    "⭕"
   ],
   [
    "🌍",
    "🌍"
   ],
   [
    "🛰️",
    "🛰️"
   ]
  ]
 },
 "89": {
  "answer": "СПУТНИК",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🛰️",
    "🛰️"
   ],
   [
    "🌍",
    "🌍"
   ],
   [
    "📡",
    "📡"
   ],
   [
    "🌌",
    "🌌"
   ]
  ]
 },
 "90": {
  "answer": "КОСМОС",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🌌",
    "🌌"
   ],
   [
    "🚀",
    "🚀"
   ],
   [
    "⭐",
    "⭐"
   ],
   [
    "🪐",
    "🪐"
   ]
  ]
 },
 "91": {
  "answer": "МАТЕМАТИКА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "➗",
    "➗"
   ],
   [
    "📐",
    "📐"
   ],
   [
    "🧮",
    "🧮"
   ],
   [
    "📊",
    "📊"
   ]
  ]
 },
 "92": {
  "answer": "ЧИСЛО",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🔢",
    "🔢"
   ],
   [
    "🧮",
    "🧮"
   ],
   [
    "📊",
    "📊"
   ],
   [
    "✏️",
    "✏️"
   ]
  ]
 },
 "93": {
  "answer": "ГРАФИК",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "📈",
    "📈"
   ],
   [
    "📊",
    "📊"
   ],
   [
    "📉",
    "📉"
   ],
   [
    "🧮",
    "🧮"
   ]
  ]
 },
 "94": {
  "answer": "УРАВНЕНИЕ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🧮",
    "🧮"
   ],
   [
    "=",
    "="
   ],
   [
    "✏️",
    "✏️"
   ],
   [
    "📐",
    "📐"
   ]
  ]
 },
 "95": {
  "answer": "ВЕРОЯТНОСТЬ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "🎲",
    "🎲"
   ],
   [
    "📊",
    "📊"
   ],
   [
    "❓",
    "❓"
   ],
   [
    "🧮",
    "🧮"
   ]
  ]
 },
 "96": {
  "answer": "СТАТИСТИКА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "📊",
    "📊"
   ],
   [
    "📈",
    "📈"
   ],
   [
    "🔢",
    "🔢"
   ],
   [
    "🧮",
    "🧮"
   ]
  ]
 },
 "97": {
  "answer": "ГИПОТЕЗА",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "💭",
    "💭"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "❓",
    "❓"
   ],
   [
    "📝",
    "📝"
   ]
  ]
 },
 "98": {
  "answer": "ТЕОРИЯ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "📚",
    "📚"
   ],
   [
    "💡",
    "💡"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🧠",
    "🧠"
   ]
  ]
 },
 "99": {
  "answer": "ДАННЫЕ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "💾",
    "💾"
   ],
   [
    "📊",
    "📊"
   ],
   [
    "🔢",
    "🔢"
   ],
   [
    "💻",
    "💻"
   ]
  ]
 },
 "100": {
  "answer": "ОТКРЫТИЕ",
  "hint": "Понятие, объект или инструмент, связанный с наукой и исследованием мира.",
  "photos": [
   [
    "💡",
    "💡"
   ],
   [
    "🔬",
    "🔬"
   ],
   [
    "🎉",
    "🎉"
   ],
   [
    "📚",
    "📚"
   ]
  ]
 }
};
const SCIENCE_TRANSLATED={
 "en": {
  "1": {
   "answer": "SCIENCE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "2": {
   "answer": "RESEARCHER",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "3": {
   "answer": "LABORATORY",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "4": {
   "answer": "EXPERIMENT",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "5": {
   "answer": "MICROSCOPE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "6": {
   "answer": "TELESCOPE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "7": {
   "answer": "TESTTUBE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "8": {
   "answer": "FLASK",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "9": {
   "answer": "REAGENT",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "10": {
   "answer": "FORMULA",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "11": {
   "answer": "ATOM",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "12": {
   "answer": "MOLECULE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "13": {
   "answer": "ELEMENT",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "14": {
   "answer": "PROTON",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "15": {
   "answer": "NEUTRON",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "16": {
   "answer": "ELECTRON",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "17": {
   "answer": "ION",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "18": {
   "answer": "NUCLEUS",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "19": {
   "answer": "CRYSTAL",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "20": {
   "answer": "SOLUTION",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "21": {
   "answer": "ACID",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "22": {
   "answer": "ALKALI",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "23": {
   "answer": "GAS",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "24": {
   "answer": "LIQUID",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "25": {
   "answer": "MATTER",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "26": {
   "answer": "TEMPERATURE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "27": {
   "answer": "PRESSURE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "28": {
   "answer": "ACCELERATION",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "29": {
   "answer": "FORCE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "30": {
   "answer": "WORK",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "31": {
   "answer": "POWER",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "32": {
   "answer": "ENERGY",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "33": {
   "answer": "MOMENTUM",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "34": {
   "answer": "FRICTION",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "35": {
   "answer": "INERTIA",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "36": {
   "answer": "GRAVITY",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "37": {
   "answer": "WAVE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "38": {
   "answer": "SOUND",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "39": {
   "answer": "LIGHT",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "40": {
   "answer": "OPTICS",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "41": {
   "answer": "REFRACTION",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "42": {
   "answer": "SPECTRUM",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "43": {
   "answer": "LASER",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "44": {
   "answer": "MAGNET",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "45": {
   "answer": "CURRENT",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "46": {
   "answer": "VOLTAGE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "47": {
   "answer": "CHARGE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "48": {
   "answer": "FIELD",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "49": {
   "answer": "PARTICLE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "50": {
   "answer": "QUANTUM",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "51": {
   "answer": "CELL",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "52": {
   "answer": "TISSUE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "53": {
   "answer": "ORGAN",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "54": {
   "answer": "GENE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "55": {
   "answer": "DNA",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "56": {
   "answer": "CHROMOSOME",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "57": {
   "answer": "PROTEIN",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "58": {
   "answer": "ENZYME",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "59": {
   "answer": "BACTERIA",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "60": {
   "answer": "VIRUS",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "61": {
   "answer": "MICROBE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "62": {
   "answer": "IMMUNITY",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "63": {
   "answer": "EVOLUTION",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "64": {
   "answer": "MUTATION",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "65": {
   "answer": "SPECIES",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "66": {
   "answer": "POPULATION",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "67": {
   "answer": "ECOSYSTEM",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "68": {
   "answer": "BIOSPHERE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "69": {
   "answer": "PHOTOSYNTHESIS",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "70": {
   "answer": "CHLOROPHYLL",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "71": {
   "answer": "MINERAL",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "72": {
   "answer": "ROCK",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "73": {
   "answer": "MAGMA",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "74": {
   "answer": "TECTONICS",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "75": {
   "answer": "SEISMOGRAPH",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "76": {
   "answer": "EARTHQUAKE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "77": {
   "answer": "EROSION",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "78": {
   "answer": "CLIMATE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "79": {
   "answer": "ATMOSPHERE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "80": {
   "answer": "OZONE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "81": {
   "answer": "PLANET",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "82": {
   "answer": "STAR",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "83": {
   "answer": "GALAXY",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "84": {
   "answer": "NEBULA",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "85": {
   "answer": "COMET",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "86": {
   "answer": "ASTEROID",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "87": {
   "answer": "METEOR",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "88": {
   "answer": "ORBIT",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "89": {
   "answer": "SATELLITE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "90": {
   "answer": "SPACE",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "91": {
   "answer": "MATHEMATICS",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "92": {
   "answer": "NUMBER",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "93": {
   "answer": "GRAPH",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "94": {
   "answer": "EQUATION",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "95": {
   "answer": "PROBABILITY",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "96": {
   "answer": "STATISTICS",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "97": {
   "answer": "HYPOTHESIS",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "98": {
   "answer": "THEORY",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "99": {
   "answer": "DATA",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  },
  "100": {
   "answer": "DISCOVERY",
   "hint": "A concept, object, or tool connected with science and understanding the world."
  }
 },
 "az": {
  "1": {
   "answer": "ELM",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "2": {
   "answer": "TƏDQİQATÇI",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "3": {
   "answer": "LABORATORİYA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "4": {
   "answer": "TƏCRÜBƏ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "5": {
   "answer": "MİKROSKOP",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "6": {
   "answer": "TELESKOP",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "7": {
   "answer": "SINAQŞÜŞƏSİ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "8": {
   "answer": "KOLBA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "9": {
   "answer": "REAKTİV",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "10": {
   "answer": "FORMUL",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "11": {
   "answer": "ATOM",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "12": {
   "answer": "MOLEKUL",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "13": {
   "answer": "ELEMENT",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "14": {
   "answer": "PROTON",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "15": {
   "answer": "NEYTRON",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "16": {
   "answer": "ELEKTRON",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "17": {
   "answer": "İON",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "18": {
   "answer": "NÜVƏ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "19": {
   "answer": "KRİSTAL",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "20": {
   "answer": "MƏHLUL",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "21": {
   "answer": "TURŞU",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "22": {
   "answer": "QƏLƏVİ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "23": {
   "answer": "QAZ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "24": {
   "answer": "MAYE",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "25": {
   "answer": "MADDƏ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "26": {
   "answer": "TEMPERATUR",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "27": {
   "answer": "TƏZYİQ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "28": {
   "answer": "SÜRƏTLƏNMƏ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "29": {
   "answer": "QÜVVƏ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "30": {
   "answer": "İŞ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "31": {
   "answer": "GÜC",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "32": {
   "answer": "ENERJİ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "33": {
   "answer": "İMPULS",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "34": {
   "answer": "SÜRTÜNMƏ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "35": {
   "answer": "ƏTALƏT",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "36": {
   "answer": "CAZİBƏ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "37": {
   "answer": "DALĞA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "38": {
   "answer": "SƏS",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "39": {
   "answer": "İŞIQ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "40": {
   "answer": "OPTİKA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "41": {
   "answer": "SINMA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "42": {
   "answer": "SPEKTR",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "43": {
   "answer": "LAZER",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "44": {
   "answer": "MAQNİT",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "45": {
   "answer": "CƏRƏYAN",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "46": {
   "answer": "GƏRGİNLİK",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "47": {
   "answer": "YÜK",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "48": {
   "answer": "SAHƏ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "49": {
   "answer": "ZƏRRƏCİK",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "50": {
   "answer": "KVANT",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "51": {
   "answer": "HÜCEYRƏ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "52": {
   "answer": "TOXUMA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "53": {
   "answer": "ORQAN",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "54": {
   "answer": "GEN",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "55": {
   "answer": "DNT",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "56": {
   "answer": "XROMOSOM",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "57": {
   "answer": "ZÜLAL",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "58": {
   "answer": "FERMENT",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "59": {
   "answer": "BAKTERİYA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "60": {
   "answer": "VİRUS",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "61": {
   "answer": "MİKROB",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "62": {
   "answer": "İMMUNİTET",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "63": {
   "answer": "TƏKAMÜL",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "64": {
   "answer": "MUTASİYA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "65": {
   "answer": "NÖV",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "66": {
   "answer": "POPULYASİYA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "67": {
   "answer": "EKOSİSTEM",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "68": {
   "answer": "BİOSFER",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "69": {
   "answer": "FOTOSİNTEZ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "70": {
   "answer": "XLOROFİL",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "71": {
   "answer": "MİNERAL",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "72": {
   "answer": "SÜXUR",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "73": {
   "answer": "MAQMA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "74": {
   "answer": "TEKTONİKA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "75": {
   "answer": "SEYSMOQRAF",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "76": {
   "answer": "ZƏLZƏLƏ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "77": {
   "answer": "EROZİYA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "78": {
   "answer": "İQLİM",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "79": {
   "answer": "ATMOSFER",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "80": {
   "answer": "OZON",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "81": {
   "answer": "PLANET",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "82": {
   "answer": "ULDUZ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "83": {
   "answer": "QALAKTİKA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "84": {
   "answer": "DUMANLIQ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "85": {
   "answer": "KOMETA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "86": {
   "answer": "ASTEROİD",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "87": {
   "answer": "METEOR",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "88": {
   "answer": "ORBİT",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "89": {
   "answer": "PEYK",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "90": {
   "answer": "KOSMOS",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "91": {
   "answer": "RİYAZİYYAT",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "92": {
   "answer": "ƏDƏD",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "93": {
   "answer": "QRAFİK",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "94": {
   "answer": "TƏNLİK",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "95": {
   "answer": "EHTİMAL",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "96": {
   "answer": "STATİSTİKA",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "97": {
   "answer": "FƏRZİYYƏ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "98": {
   "answer": "NƏZƏRİYYƏ",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "99": {
   "answer": "MƏLUMAT",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  },
  "100": {
   "answer": "KƏŞF",
   "hint": "Elm və dünyanı öyrənməklə bağlı anlayış, obyekt və ya alət."
  }
 }
};
const TECHNOLOGY_LEVELS={
 "1": {
  "answer": "ТЕХНОЛОГИЯ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "💻",
    "💻"
   ],
   [
    "⚙️",
    "⚙️"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "🤖",
    "🤖"
   ]
  ]
 },
 "2": {
  "answer": "КОМПЬЮТЕР",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "💻",
    "💻"
   ],
   [
    "⌨️",
    "⌨️"
   ],
   [
    "🖱️",
    "🖱️"
   ],
   [
    "🖥️",
    "🖥️"
   ]
  ]
 },
 "3": {
  "answer": "НОУТБУК",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "💻",
    "💻"
   ],
   [
    "🔋",
    "🔋"
   ],
   [
    "⌨️",
    "⌨️"
   ],
   [
    "🎒",
    "🎒"
   ]
  ]
 },
 "4": {
  "answer": "ПЛАНШЕТ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "📱",
    "📱"
   ],
   [
    "✍️",
    "✍️"
   ],
   [
    "🖥️",
    "🖥️"
   ],
   [
    "🔋",
    "🔋"
   ]
  ]
 },
 "5": {
  "answer": "СМАРТФОН",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "📱",
    "📱"
   ],
   [
    "📲",
    "📲"
   ],
   [
    "🔋",
    "🔋"
   ],
   [
    "🌐",
    "🌐"
   ]
  ]
 },
 "6": {
  "answer": "МОНИТОР",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🖥️",
    "🖥️"
   ],
   [
    "👀",
    "👀"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "📺",
    "📺"
   ]
  ]
 },
 "7": {
  "answer": "КЛАВИАТУРА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "⌨️",
    "⌨️"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "🔤",
    "🔤"
   ],
   [
    "🖥️",
    "🖥️"
   ]
  ]
 },
 "8": {
  "answer": "МЫШЬ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🖱️",
    "🖱️"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "👆",
    "👆"
   ],
   [
    "🖥️",
    "🖥️"
   ]
  ]
 },
 "9": {
  "answer": "ПРИНТЕР",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🖨️",
    "🖨️"
   ],
   [
    "📄",
    "📄"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "🖋️",
    "🖋️"
   ]
  ]
 },
 "10": {
  "answer": "СКАНЕР",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "📄",
    "📄"
   ],
   [
    "🔍",
    "🔍"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "🖨️",
    "🖨️"
   ]
  ]
 },
 "11": {
  "answer": "ВЕБКАМЕРА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "📹",
    "📹"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "🎥",
    "🎥"
   ],
   [
    "🌐",
    "🌐"
   ]
  ]
 },
 "12": {
  "answer": "МИКРОФОН",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🎤",
    "🎤"
   ],
   [
    "🎙️",
    "🎙️"
   ],
   [
    "🔊",
    "🔊"
   ],
   [
    "💻",
    "💻"
   ]
  ]
 },
 "13": {
  "answer": "НАУШНИКИ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🎧",
    "🎧"
   ],
   [
    "🎵",
    "🎵"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "🔊",
    "🔊"
   ]
  ]
 },
 "14": {
  "answer": "КОЛОНКА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔊",
    "🔊"
   ],
   [
    "🎵",
    "🎵"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "📶",
    "📶"
   ]
  ]
 },
 "15": {
  "answer": "РОУТЕР",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "📶",
    "📶"
   ],
   [
    "🌐",
    "🌐"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "📱",
    "📱"
   ]
  ]
 },
 "16": {
  "answer": "МОДЕМ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "📡",
    "📡"
   ],
   [
    "🌐",
    "🌐"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "🔌",
    "🔌"
   ]
  ]
 },
 "17": {
  "answer": "СЕРВЕР",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🖥️",
    "🖥️"
   ],
   [
    "🌐",
    "🌐"
   ],
   [
    "🗄️",
    "🗄️"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "18": {
  "answer": "ДИСК",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "💽",
    "💽"
   ],
   [
    "💾",
    "💾"
   ],
   [
    "🖥️",
    "🖥️"
   ],
   [
    "📁",
    "📁"
   ]
  ]
 },
 "19": {
  "answer": "ФЛЕШКА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "💾",
    "💾"
   ],
   [
    "🔌",
    "🔌"
   ],
   [
    "📁",
    "📁"
   ],
   [
    "💻",
    "💻"
   ]
  ]
 },
 "20": {
  "answer": "ЧИП",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔬",
    "🔬"
   ],
   [
    "⚙️",
    "⚙️"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "💻",
    "💻"
   ]
  ]
 },
 "21": {
  "answer": "ПРОЦЕССОР",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "⚙️",
    "⚙️"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "🔥",
    "🔥"
   ],
   [
    "🔬",
    "🔬"
   ]
  ]
 },
 "22": {
  "answer": "ВИДЕОКАРТА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🎮",
    "🎮"
   ],
   [
    "🖥️",
    "🖥️"
   ],
   [
    "⚙️",
    "⚙️"
   ],
   [
    "🧊",
    "🧊"
   ]
  ]
 },
 "23": {
  "answer": "ПАМЯТЬ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "💾",
    "💾"
   ],
   [
    "🧠",
    "🧠"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "📦",
    "📦"
   ]
  ]
 },
 "24": {
  "answer": "БАТАРЕЯ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔋",
    "🔋"
   ],
   [
    "⚡",
    "⚡"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "💻",
    "💻"
   ]
  ]
 },
 "25": {
  "answer": "ЗАРЯДКА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔌",
    "🔌"
   ],
   [
    "⚡",
    "⚡"
   ],
   [
    "🔋",
    "🔋"
   ],
   [
    "📱",
    "📱"
   ]
  ]
 },
 "26": {
  "answer": "КАБЕЛЬ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔌",
    "🔌"
   ],
   [
    "➿",
    "➿"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "⚡",
    "⚡"
   ]
  ]
 },
 "27": {
  "answer": "РАЗЪЕМ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔌",
    "🔌"
   ],
   [
    "🧩",
    "🧩"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "📱",
    "📱"
   ]
  ]
 },
 "28": {
  "answer": "ЭКРАН",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🖥️",
    "🖥️"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "👀",
    "👀"
   ],
   [
    "✨",
    "✨"
   ]
  ]
 },
 "29": {
  "answer": "СЕНСОР",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "👆",
    "👆"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "📡",
    "📡"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "30": {
  "answer": "ПИКСЕЛЬ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔲",
    "🔲"
   ],
   [
    "🖥️",
    "🖥️"
   ],
   [
    "🎨",
    "🎨"
   ],
   [
    "📷",
    "📷"
   ]
  ]
 },
 "31": {
  "answer": "ИНТЕРНЕТ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🌐",
    "🌐"
   ],
   [
    "📶",
    "📶"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "📱",
    "📱"
   ]
  ]
 },
 "32": {
  "answer": "САЙТ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🌐",
    "🌐"
   ],
   [
    "🖥️",
    "🖥️"
   ],
   [
    "🔗",
    "🔗"
   ],
   [
    "📄",
    "📄"
   ]
  ]
 },
 "33": {
  "answer": "БРАУЗЕР",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🌐",
    "🌐"
   ],
   [
    "🔎",
    "🔎"
   ],
   [
    "🖥️",
    "🖥️"
   ],
   [
    "📑",
    "📑"
   ]
  ]
 },
 "34": {
  "answer": "ПОИСК",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔎",
    "🔎"
   ],
   [
    "🌐",
    "🌐"
   ],
   [
    "⌨️",
    "⌨️"
   ],
   [
    "📱",
    "📱"
   ]
  ]
 },
 "35": {
  "answer": "ССЫЛКА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔗",
    "🔗"
   ],
   [
    "🌐",
    "🌐"
   ],
   [
    "📄",
    "📄"
   ],
   [
    "👆",
    "👆"
   ]
  ]
 },
 "36": {
  "answer": "СЕТЬ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🌐",
    "🌐"
   ],
   [
    "🔗",
    "🔗"
   ],
   [
    "📡",
    "📡"
   ],
   [
    "💻",
    "💻"
   ]
  ]
 },
 "37": {
  "answer": "ВАЙФАЙ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "📶",
    "📶"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "🌐",
    "🌐"
   ]
  ]
 },
 "38": {
  "answer": "БЛЮТУЗ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🟦",
    "🟦"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "🎧",
    "🎧"
   ],
   [
    "📶",
    "📶"
   ]
  ]
 },
 "39": {
  "answer": "ОБЛАКО",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "☁️",
    "☁️"
   ],
   [
    "💾",
    "💾"
   ],
   [
    "🌐",
    "🌐"
   ],
   [
    "📁",
    "📁"
   ]
  ]
 },
 "40": {
  "answer": "ДОМЕН",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🌐",
    "🌐"
   ],
   [
    "🔤",
    "🔤"
   ],
   [
    "🖥️",
    "🖥️"
   ],
   [
    "🔗",
    "🔗"
   ]
  ]
 },
 "41": {
  "answer": "ХОСТИНГ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🖥️",
    "🖥️"
   ],
   [
    "🌐",
    "🌐"
   ],
   [
    "📦",
    "📦"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "42": {
  "answer": "ПАРОЛЬ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔐",
    "🔐"
   ],
   [
    "⌨️",
    "⌨️"
   ],
   [
    "👤",
    "👤"
   ],
   [
    "🛡️",
    "🛡️"
   ]
  ]
 },
 "43": {
  "answer": "ЛОГИН",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "👤",
    "👤"
   ],
   [
    "⌨️",
    "⌨️"
   ],
   [
    "🔐",
    "🔐"
   ],
   [
    "🌐",
    "🌐"
   ]
  ]
 },
 "44": {
  "answer": "ПРОФИЛЬ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "👤",
    "👤"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "⚙️",
    "⚙️"
   ],
   [
    "🌐",
    "🌐"
   ]
  ]
 },
 "45": {
  "answer": "АККАУНТ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "👤",
    "👤"
   ],
   [
    "🔐",
    "🔐"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "🌐",
    "🌐"
   ]
  ]
 },
 "46": {
  "answer": "ФАЙЛ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "📄",
    "📄"
   ],
   [
    "💾",
    "💾"
   ],
   [
    "📁",
    "📁"
   ],
   [
    "💻",
    "💻"
   ]
  ]
 },
 "47": {
  "answer": "ПАПКА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "📁",
    "📁"
   ],
   [
    "📄",
    "📄"
   ],
   [
    "💾",
    "💾"
   ],
   [
    "🗂️",
    "🗂️"
   ]
  ]
 },
 "48": {
  "answer": "АРХИВ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🗜️",
    "🗜️"
   ],
   [
    "📦",
    "📦"
   ],
   [
    "📁",
    "📁"
   ],
   [
    "💾",
    "💾"
   ]
  ]
 },
 "49": {
  "answer": "БАЗАДАННЫХ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🗄️",
    "🗄️"
   ],
   [
    "📊",
    "📊"
   ],
   [
    "💾",
    "💾"
   ],
   [
    "🖥️",
    "🖥️"
   ]
  ]
 },
 "50": {
  "answer": "БЭКАП",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "💾",
    "💾"
   ],
   [
    "☁️",
    "☁️"
   ],
   [
    "🔄",
    "🔄"
   ],
   [
    "🛡️",
    "🛡️"
   ]
  ]
 },
 "51": {
  "answer": "КОД",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "💻",
    "💻"
   ],
   [
    "⌨️",
    "⌨️"
   ],
   [
    "🔣",
    "🔣"
   ],
   [
    "🧑‍💻",
    "🧑‍💻"
   ]
  ]
 },
 "52": {
  "answer": "ПРОГРАММА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "💻",
    "💻"
   ],
   [
    "⚙️",
    "⚙️"
   ],
   [
    "📄",
    "📄"
   ],
   [
    "▶️",
    "▶️"
   ]
  ]
 },
 "53": {
  "answer": "ПРИЛОЖЕНИЕ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "📱",
    "📱"
   ],
   [
    "🧩",
    "🧩"
   ],
   [
    "👆",
    "👆"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "54": {
  "answer": "СИСТЕМА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "⚙️",
    "⚙️"
   ],
   [
    "🖥️",
    "🖥️"
   ],
   [
    "🔗",
    "🔗"
   ],
   [
    "📊",
    "📊"
   ]
  ]
 },
 "55": {
  "answer": "АЛГОРИТМ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🧠",
    "🧠"
   ],
   [
    "🔢",
    "🔢"
   ],
   [
    "➡️",
    "➡️"
   ],
   [
    "💻",
    "💻"
   ]
  ]
 },
 "56": {
  "answer": "ФУНКЦИЯ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔣",
    "🔣"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "➡️",
    "➡️"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "57": {
  "answer": "ПЕРЕМЕННАЯ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔤",
    "🔤"
   ],
   [
    "📦",
    "📦"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "🔄",
    "🔄"
   ]
  ]
 },
 "58": {
  "answer": "МАССИВ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "📚",
    "📚"
   ],
   [
    "🔢",
    "🔢"
   ],
   [
    "🧩",
    "🧩"
   ],
   [
    "💻",
    "💻"
   ]
  ]
 },
 "59": {
  "answer": "ЦИКЛ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔄",
    "🔄"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "➡️",
    "➡️"
   ],
   [
    "🔁",
    "🔁"
   ]
  ]
 },
 "60": {
  "answer": "ОШИБКА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🐞",
    "🐞"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "⚠️",
    "⚠️"
   ],
   [
    "🔧",
    "🔧"
   ]
  ]
 },
 "61": {
  "answer": "ОТЛАДКА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🐞",
    "🐞"
   ],
   [
    "🔍",
    "🔍"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "🛠️",
    "🛠️"
   ]
  ]
 },
 "62": {
  "answer": "ВЕРСИЯ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔢",
    "🔢"
   ],
   [
    "📦",
    "📦"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "🔄",
    "🔄"
   ]
  ]
 },
 "63": {
  "answer": "ОБНОВЛЕНИЕ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔄",
    "🔄"
   ],
   [
    "⬆️",
    "⬆️"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "💻",
    "💻"
   ]
  ]
 },
 "64": {
  "answer": "УСТАНОВКА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "⬇️",
    "⬇️"
   ],
   [
    "📦",
    "📦"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "✅",
    "✅"
   ]
  ]
 },
 "65": {
  "answer": "ИНТЕРФЕЙС",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🖥️",
    "🖥️"
   ],
   [
    "🔘",
    "🔘"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "👆",
    "👆"
   ]
  ]
 },
 "66": {
  "answer": "КНОПКА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔘",
    "🔘"
   ],
   [
    "👆",
    "👆"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "🖥️",
    "🖥️"
   ]
  ]
 },
 "67": {
  "answer": "ПАНЕЛЬ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🖥️",
    "🖥️"
   ],
   [
    "📊",
    "📊"
   ],
   [
    "🔘",
    "🔘"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "68": {
  "answer": "УВЕДОМЛЕНИЕ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔔",
    "🔔"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "💬",
    "💬"
   ],
   [
    "⚠️",
    "⚠️"
   ]
  ]
 },
 "69": {
  "answer": "ЧАТ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "💬",
    "💬"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "👥",
    "👥"
   ],
   [
    "⌨️",
    "⌨️"
   ]
  ]
 },
 "70": {
  "answer": "СООБЩЕНИЕ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "💬",
    "💬"
   ],
   [
    "✉️",
    "✉️"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "🔔",
    "🔔"
   ]
  ]
 },
 "71": {
  "answer": "ВИДЕО",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🎥",
    "🎥"
   ],
   [
    "▶️",
    "▶️"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "🖥️",
    "🖥️"
   ]
  ]
 },
 "72": {
  "answer": "СТРИМ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔴",
    "🔴"
   ],
   [
    "🎥",
    "🎥"
   ],
   [
    "📡",
    "📡"
   ],
   [
    "👥",
    "👥"
   ]
  ]
 },
 "73": {
  "answer": "ПОДКАСТ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🎙️",
    "🎙️"
   ],
   [
    "🎧",
    "🎧"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "🔊",
    "🔊"
   ]
  ]
 },
 "74": {
  "answer": "СОЦСЕТЬ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "👥",
    "👥"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "❤️",
    "❤️"
   ],
   [
    "🌐",
    "🌐"
   ]
  ]
 },
 "75": {
  "answer": "МЕССЕНДЖЕР",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "💬",
    "💬"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "🔔",
    "🔔"
   ],
   [
    "👥",
    "👥"
   ]
  ]
 },
 "76": {
  "answer": "QRКОД",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔳",
    "🔳"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "📷",
    "📷"
   ],
   [
    "🔗",
    "🔗"
   ]
  ]
 },
 "77": {
  "answer": "ГЕОЛОКАЦИЯ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "📍",
    "📍"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "🛰️",
    "🛰️"
   ]
  ]
 },
 "78": {
  "answer": "GPS",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🛰️",
    "🛰️"
   ],
   [
    "📍",
    "📍"
   ],
   [
    "🗺️",
    "🗺️"
   ],
   [
    "📱",
    "📱"
   ]
  ]
 },
 "79": {
  "answer": "БАЗОВАЯСТАНЦИЯ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "📡",
    "📡"
   ],
   [
    "🏙️",
    "🏙️"
   ],
   [
    "📶",
    "📶"
   ],
   [
    "📱",
    "📱"
   ]
  ]
 },
 "80": {
  "answer": "ДРОН",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🚁",
    "🚁"
   ],
   [
    "📷",
    "📷"
   ],
   [
    "📡",
    "📡"
   ],
   [
    "🔋",
    "🔋"
   ]
  ]
 },
 "81": {
  "answer": "РОБОТ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🤖",
    "🤖"
   ],
   [
    "⚙️",
    "⚙️"
   ],
   [
    "🦾",
    "🦾"
   ],
   [
    "🔋",
    "🔋"
   ]
  ]
 },
 "82": {
  "answer": "АНДРОИД",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🤖",
    "🤖"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "💚",
    "💚"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "83": {
  "answer": "АВТОМАТИКА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "⚙️",
    "⚙️"
   ],
   [
    "🤖",
    "🤖"
   ],
   [
    "🔄",
    "🔄"
   ],
   [
    "🏭",
    "🏭"
   ]
  ]
 },
 "84": {
  "answer": "НЕЙРОСЕТЬ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🧠",
    "🧠"
   ],
   [
    "🔗",
    "🔗"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "✨",
    "✨"
   ]
  ]
 },
 "85": {
  "answer": "МОДЕЛЬ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🧠",
    "🧠"
   ],
   [
    "📊",
    "📊"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "⚙️",
    "⚙️"
   ]
  ]
 },
 "86": {
  "answer": "МЕТАДАННЫЕ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "💾",
    "💾"
   ],
   [
    "🏷️",
    "🏷️"
   ],
   [
    "📊",
    "📊"
   ],
   [
    "🔍",
    "🔍"
   ]
  ]
 },
 "87": {
  "answer": "АНАЛИТИКА",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "📊",
    "📊"
   ],
   [
    "📈",
    "📈"
   ],
   [
    "🔍",
    "🔍"
   ],
   [
    "💻",
    "💻"
   ]
  ]
 },
 "88": {
  "answer": "КИБЕРБЕЗОПАСНОСТЬ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🛡️",
    "🛡️"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "🔐",
    "🔐"
   ],
   [
    "🌐",
    "🌐"
   ]
  ]
 },
 "89": {
  "answer": "ШИФРОВАНИЕ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔐",
    "🔐"
   ],
   [
    "🔣",
    "🔣"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "🛡️",
    "🛡️"
   ]
  ]
 },
 "90": {
  "answer": "ФАЕРВОЛ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🧱",
    "🧱"
   ],
   [
    "🔥",
    "🔥"
   ],
   [
    "🛡️",
    "🛡️"
   ],
   [
    "🌐",
    "🌐"
   ]
  ]
 },
 "91": {
  "answer": "ТРОЯН",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🐴",
    "🐴"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "⚠️",
    "⚠️"
   ],
   [
    "🔐",
    "🔐"
   ]
  ]
 },
 "92": {
  "answer": "АНТИВИРУС",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🛡️",
    "🛡️"
   ],
   [
    "🦠",
    "🦠"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "✅",
    "✅"
   ]
  ]
 },
 "93": {
  "answer": "БЛОКЧЕЙН",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "⛓️",
    "⛓️"
   ],
   [
    "🔗",
    "🔗"
   ],
   [
    "💻",
    "💻"
   ],
   [
    "🔐",
    "🔐"
   ]
  ]
 },
 "94": {
  "answer": "КРИПТОГРАФИЯ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🔐",
    "🔐"
   ],
   [
    "🔣",
    "🔣"
   ],
   [
    "📜",
    "📜"
   ],
   [
    "💻",
    "💻"
   ]
  ]
 },
 "95": {
  "answer": "ВИРТУАЛЬНОСТЬ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🥽",
    "🥽"
   ],
   [
    "🌐",
    "🌐"
   ],
   [
    "🎮",
    "🎮"
   ],
   [
    "✨",
    "✨"
   ]
  ]
 },
 "96": {
  "answer": "VR",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🥽",
    "🥽"
   ],
   [
    "🎮",
    "🎮"
   ],
   [
    "🌐",
    "🌐"
   ],
   [
    "🕹️",
    "🕹️"
   ]
  ]
 },
 "97": {
  "answer": "3DПЕЧАТЬ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🖨️",
    "🖨️"
   ],
   [
    "🧱",
    "🧱"
   ],
   [
    "🧩",
    "🧩"
   ],
   [
    "📐",
    "📐"
   ]
  ]
 },
 "98": {
  "answer": "УМНЫЙДОМ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "🏠",
    "🏠"
   ],
   [
    "📱",
    "📱"
   ],
   [
    "💡",
    "💡"
   ],
   [
    "🌐",
    "🌐"
   ]
  ]
 },
 "99": {
  "answer": "БИОМЕТРИЯ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "👆",
    "👆"
   ],
   [
    "👁️",
    "👁️"
   ],
   [
    "🔐",
    "🔐"
   ],
   [
    "📱",
    "📱"
   ]
  ]
 },
 "100": {
  "answer": "ИННОВАЦИЯ",
  "hint": "Понятие, устройство или технология из цифрового и технического мира.",
  "photos": [
   [
    "💡",
    "💡"
   ],
   [
    "🚀",
    "🚀"
   ],
   [
    "⚙️",
    "⚙️"
   ],
   [
    "✨",
    "✨"
   ]
  ]
 }
};
const TECHNOLOGY_TRANSLATED={
 "en": {
  "1": {
   "answer": "TECHNOLOGY",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "2": {
   "answer": "COMPUTER",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "3": {
   "answer": "LAPTOP",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "4": {
   "answer": "TABLET",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "5": {
   "answer": "SMARTPHONE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "6": {
   "answer": "MONITOR",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "7": {
   "answer": "KEYBOARD",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "8": {
   "answer": "MOUSE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "9": {
   "answer": "PRINTER",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "10": {
   "answer": "SCANNER",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "11": {
   "answer": "WEBCAM",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "12": {
   "answer": "MICROPHONE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "13": {
   "answer": "HEADPHONES",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "14": {
   "answer": "SPEAKER",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "15": {
   "answer": "ROUTER",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "16": {
   "answer": "MODEM",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "17": {
   "answer": "SERVER",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "18": {
   "answer": "DRIVE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "19": {
   "answer": "FLASHDRIVE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "20": {
   "answer": "CHIP",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "21": {
   "answer": "PROCESSOR",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "22": {
   "answer": "GRAPHICSCARD",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "23": {
   "answer": "MEMORY",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "24": {
   "answer": "BATTERY",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "25": {
   "answer": "CHARGER",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "26": {
   "answer": "CABLE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "27": {
   "answer": "CONNECTOR",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "28": {
   "answer": "SCREEN",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "29": {
   "answer": "SENSOR",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "30": {
   "answer": "PIXEL",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "31": {
   "answer": "INTERNET",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "32": {
   "answer": "WEBSITE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "33": {
   "answer": "BROWSER",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "34": {
   "answer": "SEARCH",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "35": {
   "answer": "LINK",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "36": {
   "answer": "NETWORK",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "37": {
   "answer": "WIFI",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "38": {
   "answer": "BLUETOOTH",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "39": {
   "answer": "CLOUD",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "40": {
   "answer": "DOMAIN",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "41": {
   "answer": "HOSTING",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "42": {
   "answer": "PASSWORD",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "43": {
   "answer": "LOGIN",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "44": {
   "answer": "PROFILE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "45": {
   "answer": "ACCOUNT",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "46": {
   "answer": "FILE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "47": {
   "answer": "FOLDER",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "48": {
   "answer": "ARCHIVE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "49": {
   "answer": "DATABASE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "50": {
   "answer": "BACKUP",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "51": {
   "answer": "CODE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "52": {
   "answer": "PROGRAM",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "53": {
   "answer": "APP",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "54": {
   "answer": "SYSTEM",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "55": {
   "answer": "ALGORITHM",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "56": {
   "answer": "FUNCTION",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "57": {
   "answer": "VARIABLE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "58": {
   "answer": "ARRAY",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "59": {
   "answer": "LOOP",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "60": {
   "answer": "BUG",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "61": {
   "answer": "DEBUG",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "62": {
   "answer": "VERSION",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "63": {
   "answer": "UPDATE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "64": {
   "answer": "INSTALL",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "65": {
   "answer": "INTERFACE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "66": {
   "answer": "BUTTON",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "67": {
   "answer": "PANEL",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "68": {
   "answer": "NOTIFICATION",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "69": {
   "answer": "CHAT",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "70": {
   "answer": "MESSAGE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "71": {
   "answer": "VIDEO",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "72": {
   "answer": "STREAM",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "73": {
   "answer": "PODCAST",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "74": {
   "answer": "SOCIALNETWORK",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "75": {
   "answer": "MESSENGER",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "76": {
   "answer": "QRCODE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "77": {
   "answer": "GEOLOCATION",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "78": {
   "answer": "GPS",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "79": {
   "answer": "BASESTATION",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "80": {
   "answer": "DRONE",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "81": {
   "answer": "ROBOT",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "82": {
   "answer": "ANDROID",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "83": {
   "answer": "AUTOMATION",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "84": {
   "answer": "NEURALNET",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "85": {
   "answer": "MODEL",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "86": {
   "answer": "METADATA",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "87": {
   "answer": "ANALYTICS",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "88": {
   "answer": "CYBERSECURITY",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "89": {
   "answer": "ENCRYPTION",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "90": {
   "answer": "FIREWALL",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "91": {
   "answer": "TROJAN",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "92": {
   "answer": "ANTIVIRUS",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "93": {
   "answer": "BLOCKCHAIN",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "94": {
   "answer": "CRYPTOGRAPHY",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "95": {
   "answer": "VIRTUALITY",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "96": {
   "answer": "VR",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "97": {
   "answer": "3DPRINTING",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "98": {
   "answer": "SMARTHOME",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "99": {
   "answer": "BIOMETRICS",
   "hint": "A concept, device, or technology from the digital and technical world."
  },
  "100": {
   "answer": "INNOVATION",
   "hint": "A concept, device, or technology from the digital and technical world."
  }
 },
 "az": {
  "1": {
   "answer": "TEXNOLOGİYA",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "2": {
   "answer": "KOMPÜTER",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "3": {
   "answer": "NOUTBUK",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "4": {
   "answer": "PLANŞET",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "5": {
   "answer": "SMARTFON",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "6": {
   "answer": "MONİTOR",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "7": {
   "answer": "KLAVİATURA",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "8": {
   "answer": "SİÇAN",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "9": {
   "answer": "PRİNTER",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "10": {
   "answer": "SKANER",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "11": {
   "answer": "VEBKAMERA",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "12": {
   "answer": "MİKROFON",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "13": {
   "answer": "QULAQLIQ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "14": {
   "answer": "DİNAMİK",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "15": {
   "answer": "ROUTER",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "16": {
   "answer": "MODEM",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "17": {
   "answer": "SERVER",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "18": {
   "answer": "DİSK",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "19": {
   "answer": "FLAŞKART",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "20": {
   "answer": "ÇİP",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "21": {
   "answer": "PROSESSOR",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "22": {
   "answer": "VİDEOKART",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "23": {
   "answer": "YADDAŞ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "24": {
   "answer": "BATAREYA",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "25": {
   "answer": "ŞARJ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "26": {
   "answer": "KABEL",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "27": {
   "answer": "KONNEKTOR",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "28": {
   "answer": "EKRAN",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "29": {
   "answer": "SENSOR",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "30": {
   "answer": "PİKSEL",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "31": {
   "answer": "İNTERNET",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "32": {
   "answer": "SAYT",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "33": {
   "answer": "BRAUZER",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "34": {
   "answer": "AXTARIŞ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "35": {
   "answer": "LİNK",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "36": {
   "answer": "ŞƏBƏKƏ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "37": {
   "answer": "VAYFAY",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "38": {
   "answer": "BLUTUZ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "39": {
   "answer": "BULUD",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "40": {
   "answer": "DOMEN",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "41": {
   "answer": "HOSTİNQ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "42": {
   "answer": "PAROL",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "43": {
   "answer": "LOQİN",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "44": {
   "answer": "PROFİL",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "45": {
   "answer": "AKKAUNT",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "46": {
   "answer": "FAYL",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "47": {
   "answer": "QOVLUQ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "48": {
   "answer": "ARXİV",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "49": {
   "answer": "VERİLƏNLƏRBAZASI",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "50": {
   "answer": "EHTİYATNÜSXƏ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "51": {
   "answer": "KOD",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "52": {
   "answer": "PROQRAM",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "53": {
   "answer": "TƏTBİQ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "54": {
   "answer": "SİSTEM",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "55": {
   "answer": "ALQORİTM",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "56": {
   "answer": "FUNKSİYA",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "57": {
   "answer": "DƏYİŞƏN",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "58": {
   "answer": "MASSİV",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "59": {
   "answer": "DÖVR",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "60": {
   "answer": "SƏHV",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "61": {
   "answer": "DEBAQ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "62": {
   "answer": "VERSİYA",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "63": {
   "answer": "YENİLƏMƏ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "64": {
   "answer": "QURAŞDIRMA",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "65": {
   "answer": "İNTERFEYS",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "66": {
   "answer": "DÜYMƏ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "67": {
   "answer": "PANEL",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "68": {
   "answer": "BİLDİRİŞ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "69": {
   "answer": "ÇAT",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "70": {
   "answer": "MESAJ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "71": {
   "answer": "VİDEO",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "72": {
   "answer": "YAYIM",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "73": {
   "answer": "PODKAST",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "74": {
   "answer": "SOSİALŞƏBƏKƏ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "75": {
   "answer": "MESENCER",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "76": {
   "answer": "QRKOD",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "77": {
   "answer": "GEOLOKASİYA",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "78": {
   "answer": "GPS",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "79": {
   "answer": "BAZASTANSİYASI",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "80": {
   "answer": "DRON",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "81": {
   "answer": "ROBOT",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "82": {
   "answer": "ANDROİD",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "83": {
   "answer": "AVTOMATLAŞMA",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "84": {
   "answer": "NEYRONŞƏBƏKƏ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "85": {
   "answer": "MODEL",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "86": {
   "answer": "METAMƏLUMAT",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "87": {
   "answer": "ANALİTİKA",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "88": {
   "answer": "KİBERTƏHLÜKƏSİZLİK",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "89": {
   "answer": "ŞİFRLƏMƏ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "90": {
   "answer": "FAYRVOL",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "91": {
   "answer": "TROYAN",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "92": {
   "answer": "ANTİVİRUS",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "93": {
   "answer": "BLOKÇEYN",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "94": {
   "answer": "KRİPTOQRAFİYA",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "95": {
   "answer": "VİRTUALLIQ",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "96": {
   "answer": "VR",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "97": {
   "answer": "3DÇAP",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "98": {
   "answer": "AĞILLIEV",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "99": {
   "answer": "BİOMETRİYA",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  },
  "100": {
   "answer": "İNNOVASİYA",
   "hint": "Rəqəmsal və texniki dünyaya aid anlayış, cihaz və ya texnologiya."
  }
 }
};
const THEME_BANKS={sport:[LEVELS,TRANSLATED],art:[ART_LEVELS,ART_TRANSLATED],professions:[PROF_LEVELS,PROF_TRANSLATED],travel:[TRAVEL_LEVELS,TRAVEL_TRANSLATED],science:[SCIENCE_LEVELS,SCIENCE_TRANSLATED],technology:[TECHNOLOGY_LEVELS,TECHNOLOGY_TRANSLATED]};
const [ACTIVE_LEVELS,ACTIVE_TRANSLATED]=THEME_BANKS[themeId]||THEME_BANKS.sport;
if(ACTIVE_TRANSLATED[lang])Object.keys(ACTIVE_LEVELS).forEach(k=>Object.assign(ACTIVE_LEVELS[k],ACTIVE_TRANSLATED[lang][k]));


const alphabet=lang==='az'?'ABCÇDEƏFGĞHXIİJKLMNOÖPQRSŞTUÜVYZ':lang==='en'?'ABCDEFGHJKLMNPQRSTUVWXYZ':'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЭЮЯ';
function makePool(answer){
 const a=[...answer],used=new Set(a),extras=[];
 for(const ch of [...alphabet]){if(!used.has(ch)){extras.push(ch);if(extras.length>=Math.max(5,12-a.length))break}}
 return [...a,...extras];
}
function progressKey(){return 'pw.themeProgress.'+themeId}
function getProgress(){try{const a=JSON.parse(localStorage.getItem(progressKey())||'[]');return new Set(Array.isArray(a)?a.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=100):[])}catch{return new Set()}}
function saveProgress(set){try{localStorage.setItem(progressKey(),JSON.stringify([...set].sort((a,b)=>a-b)))}catch{}}
function firstIncomplete(set){for(let n=1;n<=100;n++)if(!set.has(n))return n;return 101}

const requested=Number(new URLSearchParams(location.search).get('level')||1),levelId=ACTIVE_LEVELS[requested]?requested:1,level=ACTIVE_LEVELS[levelId],answer=[...level.answer];
const progress=getProgress(),unlock=firstIncomplete(progress);
const pool=makePool(level.answer),tiles=pool.map((letter,id)=>({id,letter}));
let order=tiles.map(t=>t.id),selected=Array(answer.length).fill(null),fixed=new Map(),removed=new Set(),busy=false,solved=false,textOpen=false,hintBusy=false;

document.documentElement.lang=lang;
$('themeGameTitle').textContent=ui[themeId]||ui.sport;$('levelTitle').textContent=ui.level(levelId);$('letterHint').textContent='💡 '+HINT_COSTS.letter;$('removeHint').textContent='🪄 '+HINT_COSTS.remove;$('textHintLabel').textContent=ui.textHint+' · '+HINT_COSTS.text+' 🪙';$('hintValue').textContent=ui.tap;
$('slots').style.gridTemplateColumns='repeat('+answer.length+',1fr)';$('slots').classList.toggle('long-answer',answer.length>=9);
level.photos.forEach(([emoji],index)=>{const d=document.createElement('div');d.className='photo';d.setAttribute('role','img');d.setAttribute('aria-label',ui.image(index+1));d.textContent=emoji;$('photos').append(d)});

function shuffle(){
 const prev=order.join(',');
 for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
 if(order.join(',')===prev&&order.length>1)order.push(order.shift());
}
function paint(){
 const used=new Set(selected.filter(id=>id!==null));
 $('slots').replaceChildren();$('letters').replaceChildren();
 answer.forEach((_,pos)=>{const b=document.createElement('button');b.type='button';b.className='slot'+(fixed.has(pos)?' fixed':'');b.textContent=tiles[selected[pos]]?.letter||'';b.disabled=busy||solved||hintBusy||fixed.has(pos);b.onclick=()=>{selected[pos]=null;paint()};$('slots').append(b)});
 order.forEach(id=>{const b=document.createElement('button');b.type='button';b.className='letter'+(used.has(id)?' used':'')+(removed.has(id)?' removed':'');b.textContent=tiles[id].letter;b.disabled=busy||solved||hintBusy||used.has(id)||removed.has(id);b.onclick=()=>choose(id);$('letters').append(b)});
 ['letterHint','removeHint','textHint','shuffle'].forEach(id=>$(id).disabled=busy||solved||hintBusy);
 if(textOpen)$('hintValue').textContent=level.hint;
}
function clearInput(){selected=Array(answer.length).fill(null);for(const [pos,id] of fixed)selected[pos]=id}
function choose(id){if(busy||solved||hintBusy)return;const pos=selected.indexOf(null);if(pos<0)return;pw?.sfx?.('tap');pw?.haptic?.();selected[pos]=id;paint();check()}
function applyServerPlayer(result){
 const p=result?.player;if(!p)return;
 document.querySelectorAll('[data-coins]').forEach(e=>e.textContent=String(p.coins??0));
}
async function showSuccess(){
 let rewarded=false;
 if(pw.hasAuth){
   pw.status(ui.saving);
   try{
     const result=await pw.actionRequest('theme_complete',{themeId,levelId,language:lang,answer:level.answer});
     applyServerPlayer(result);rewarded=Boolean(result?.theme_rewarded);
   }catch(e){
     solved=false;busy=false;paint();pw.status(e?.message||String(e));return false;
   }
 }
 progress.add(levelId);saveProgress(progress);$('status').hidden=true;$('successPanel').hidden=false;$('successTitle').textContent=ui.passed(levelId);
 $('successReward').textContent=pw.hasAuth?(rewarded?ui.reward:ui.replayReward):ui.saved;
 const next=$('nextLevel');if(levelId<100){next.href='./theme-game.html?theme='+themeId+'&level='+(levelId+1);next.innerHTML=ui.next+' <span>▶</span>'}else{next.href='./index.html';next.innerHTML=ui.back+' <span>✓</span>'}
 return true;
}
async function check(){
 if(selected.some(id=>id===null))return;
 const word=selected.map(id=>tiles[id].letter).join('');
 if(word!==level.answer){busy=true;paint();pw?.status?.(ui.wrong);$('slots').classList.add('wrong');pw?.sfx?.('error');pw?.haptic?.('error');setTimeout(()=>{clearInput();busy=false;$('slots').classList.remove('wrong');paint()},700);return}
 busy=true;solved=true;pw?.sfx?.('success');pw?.haptic?.('success');paint();await showSuccess();
}
async function hint(type){
 if(busy||solved||hintBusy)return;
 if(!pw.hasAuth){pw.status(ui.needTelegram);return}
 const cost=HINT_COSTS[type];if(!cost)return;
 let target=null,bad=null;
 if(type==='text'){if(textOpen){pw.status(ui.text);return}}
 else if(type==='letter'){
   const available=answer.map((_,i)=>i).filter(i=>!fixed.has(i));if(!available.length){pw.status(ui.allLetters);return}
   const pos=available[Math.floor(Math.random()*available.length)],reserved=new Set(fixed.values()),tile=tiles.find(t=>t.letter===answer[pos]&&!reserved.has(t.id));
   if(!tile){pw.status(ui.placeFail);return}target={pos,tile};
 }else{
   bad=tiles.filter(t=>!answer.includes(t.letter)&&!removed.has(t.id));if(!bad.length){pw.status(ui.noExtra);return}
 }
 hintBusy=true;paint();
 try{
   const result=await pw.actionRequest('theme_hint',{themeId,levelId,hintType:type});
   applyServerPlayer(result);
   if(type==='text'){textOpen=true;$('hintValue').textContent=level.hint;pw.status(ui.spent(cost,ui.text))}
   else if(type==='letter'){
     const {pos,tile}=target;selected=selected.map(id=>id===tile.id?null:id);selected[pos]=tile.id;fixed.set(pos,tile.id);pw.status(ui.spent(cost,ui.letter));
   }else{
     bad.slice(0,3).forEach(t=>{removed.add(t.id);selected=selected.map(id=>id===t.id?null:id)});pw.status(ui.spent(cost,ui.remove));
   }
   pw?.sfx?.('hint');
 }catch(e){pw.status(e?.message||String(e))}
 finally{hintBusy=false;paint()}
 if(type==='letter'&&selected.every(id=>id!==null))check();
}
$('shuffle').onclick=()=>{shuffle();paint();pw?.status?.(ui.shuffle);pw?.sfx?.('tap')};$('letterHint').onclick=()=>hint('letter');$('removeHint').onclick=()=>hint('remove');$('textHint').onclick=()=>hint('text');

$('tgSoundToggle').checked=Boolean(pw.prefs.sound);$('tgSoundToggle').onchange=()=>{pw.prefs.sound=$('tgSoundToggle').checked;persistPrefs();if(pw.prefs.sound)pw.sfx('tap')};
$('tgHapticToggle').checked=Boolean(pw.prefs.haptic);$('tgHapticToggle').onchange=()=>{pw.prefs.haptic=$('tgHapticToggle').checked;persistPrefs();pw.haptic()};
$('tgMusicToggle').checked=Boolean(pw.prefs.music);$('tgMusicToggle').onchange=()=>pw.setMusic($('tgMusicToggle').checked);
$('tgLanguageBtn').onclick=()=>{closeModal('tgSettingsModal');openModal('tgLanguageModal')};
$('tgThemeBtn').onclick=()=>{closeModal('tgSettingsModal');openModal('tgThemeModal')};
$('tgRulesBtn').onclick=()=>{closeModal('tgSettingsModal');textSettingLabels();openModal('tgRulesModal')};
$('tgSupportBtn').onclick=()=>{closeModal('tgSettingsModal');openModal('tgSupportModal')};
$('tgOpenSupport').onclick=()=>{const url='https://t.me/PhotoWordBot?start=support';if(window.Telegram?.WebApp?.openTelegramLink)Telegram.WebApp.openTelegramLink(url);else location.href=url};
$('tgNotificationsBtn').onclick=()=>{const tg=window.Telegram?.WebApp;if(!tg?.requestWriteAccess){pw.status(settingsUI.notifyNeed);return}tg.requestWriteAccess(ok=>{if(!ok){pw.status(settingsUI.notifyDenied);return}(async()=>{try{await pw.api('enable_notifications',{language:lang});try{localStorage.setItem('pw.writeAccess','1')}catch{};textSettingLabels();pw.status(settingsUI.notifySent)}catch(e){pw.status(e.message)}})()})};
document.querySelectorAll('[data-tg-language]').forEach(b=>b.onclick=()=>{try{localStorage.setItem('pw.language',b.dataset.tgLanguage)}catch{};location.reload()});
document.querySelectorAll('[data-tg-theme]').forEach(b=>b.onclick=()=>{applyThemeSetting(b.dataset.tgTheme);closeModal('tgThemeModal')});
document.querySelectorAll('[data-tg-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.tgClose));
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.hidden=true}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal').forEach(m=>m.hidden=true)});
textSettingLabels();

shuffle();paint();
if(levelId>unlock&&!progress.has(levelId)){busy=true;paint();pw?.status?.(ui.locked(unlock))}else{pw?.status?.(ui.level(levelId))}
if(pw.hasAuth)pw.login().catch(e=>pw.status(e.message));
})();