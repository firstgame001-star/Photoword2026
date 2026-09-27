(() => {
'use strict';
const $=id=>document.getElementById(id),pw=window.PW;
const getLang=()=>{try{return localStorage.getItem('pw.language')||'ru'}catch{return'ru'}};
const lang=getLang();
const UI={
 ru:{sport:'⚽ Спорт',level:n=>'Тематический уровень '+n,textHint:'Текстовая подсказка',tap:'Нажми, чтобы открыть',wrong:'Неверное слово. Попробуй ещё раз.',passed:n=>'Уровень '+n+' пройден!',saved:'Прогресс сохранён отдельно от основной игры.',next:'СЛЕДУЮЩИЙ УРОВЕНЬ',back:'К ТЕМАМ',locked:n=>'Сначала пройди уровень '+n+'.',letter:'Буква открыта.',remove:'Лишние буквы убраны.',shuffle:'Буквы перемешаны.',text:'Подсказка открыта.',allLetters:'Все буквы уже открыты.',noExtra:'Лишних букв не осталось.',placeFail:'Не удалось разместить букву.',image:n=>'Изображение '+n},
 en:{sport:'⚽ Sport',level:n=>'Themed level '+n,textHint:'Text hint',tap:'Tap to reveal',wrong:'Wrong word. Try again.',passed:n=>'Level '+n+' completed!',saved:'Progress saved separately from the main game.',next:'NEXT LEVEL',back:'BACK TO THEMES',locked:n=>'Complete level '+n+' first.',letter:'Letter revealed.',remove:'Extra letters removed.',shuffle:'Letters shuffled.',text:'Hint revealed.',allLetters:'All letters are already revealed.',noExtra:'No extra letters remain.',placeFail:'Could not place the letter.',image:n=>'Image '+n},
 az:{sport:'⚽ İdman',level:n=>n+'-ci mövzu səviyyəsi',textHint:'Mətn ipucu',tap:'Açmaq üçün toxun',wrong:'Söz yanlışdır. Yenidən cəhd et.',passed:n=>n+'-ci səviyyə keçildi!',saved:'Tərəqqi əsas oyundan ayrıca saxlanıldı.',next:'NÖVBƏTİ SƏVİYYƏ',back:'MÖVZULARA QAYIT',locked:n=>'Əvvəlcə '+n+'-ci səviyyəni keç.',letter:'Hərf açıldı.',remove:'Artıq hərflər silindi.',shuffle:'Hərflər qarışdırıldı.',text:'İpucu açıldı.',allLetters:'Bütün hərflər artıq açılıb.',noExtra:'Artıq hərf qalmayıb.',placeFail:'Hərfi yerləşdirmək mümkün olmadı.',image:n=>n+'-ci şəkil'}
};
const ui=UI[lang]||UI.ru;
const SETTINGS_UI={
 ru:{settings:'Настройки',sound:'Звук',soundDesc:'Буквы, победа, ошибка и подсказки',haptic:'Вибрация',hapticDesc:'Нажатия, верный и неверный ответ',music:'Музыка',musicDesc:'Спокойная фоновая музыка',language:'Язык',notifications:'Уведомления',notify:'Разрешить сообщения от бота',notifyOn:'Разрешены',theme:'Тема',rules:'Правила игры',rulesDesc:'Как играть в тематическом режиме',support:'Поддержка',supportDesc:'Связаться с поддержкой',privacy:'Конфиденциальность',terms:'Пользовательское соглашение',languageTitle:'Выберите язык',themeTitle:'Тема',rulesTitle:'Правила игры',supportText:'Напиши в поддержку через Telegram-бота. Ответ придёт в этот же чат.',supportOpen:'НАПИСАТЬ В ПОДДЕРЖКУ',notifyNeed:'Открой игру внутри Telegram, чтобы разрешить уведомления.',notifyDenied:'Разрешение не предоставлено.',notifySent:'Уведомления разрешены. Тестовое сообщение отправлено.',themeNames:{game:'🎮 Игровая',night:'🌙 Ночная',light:'☀️ Светлая',neon:'⚡ Неон',gold:'👑 Золотая'}},
 en:{settings:'Settings',sound:'Sound',soundDesc:'Letters, wins, mistakes and hints',haptic:'Haptics',hapticDesc:'Taps, correct and wrong answers',music:'Music',musicDesc:'Calm background music',language:'Language',notifications:'Notifications',notify:'Allow bot messages',notifyOn:'Allowed',theme:'Theme',rules:'Game rules',rulesDesc:'How themed mode works',support:'Support',supportDesc:'Contact support',privacy:'Privacy',terms:'Terms of use',languageTitle:'Choose language',themeTitle:'Theme',rulesTitle:'Game rules',supportText:'Message support through the Telegram bot. The reply will arrive in the same chat.',supportOpen:'CONTACT SUPPORT',notifyNeed:'Open the game inside Telegram to enable notifications.',notifyDenied:'Permission was not granted.',notifySent:'Notifications enabled. A test message was sent.',themeNames:{game:'🎮 Game',night:'🌙 Night',light:'☀️ Light',neon:'⚡ Neon',gold:'👑 Gold'}},
 az:{settings:'Ayarlar',sound:'Səs',soundDesc:'Hərflər, qələbə, səhv və ipucları',haptic:'Vibrasiya',hapticDesc:'Toxunuş, düzgün və səhv cavab',music:'Musiqi',musicDesc:'Sakit fon musiqisi',language:'Dil',notifications:'Bildirişlər',notify:'Bot mesajlarına icazə ver',notifyOn:'İcazə verilib',theme:'Tema',rules:'Oyun qaydaları',rulesDesc:'Mövzu rejiminin qaydaları',support:'Dəstək',supportDesc:'Dəstəklə əlaqə',privacy:'Məxfilik',terms:'İstifadəçi razılaşması',languageTitle:'Dil seçin',themeTitle:'Tema',rulesTitle:'Oyun qaydaları',supportText:'Telegram botu vasitəsilə dəstəyə yaz. Cavab eyni çata gələcək.',supportOpen:'DƏSTƏYƏ YAZ',notifyNeed:'Bildirişləri aktivləşdirmək üçün oyunu Telegram daxilində açın.',notifyDenied:'İcazə verilmədi.',notifySent:'Bildirişlər aktiv edildi. Test mesajı göndərildi.',themeNames:{game:'🎮 Oyun',night:'🌙 Gecə',light:'☀️ İşıqlı',neon:'⚡ Neon',gold:'👑 Qızılı'}}
};
const RULES={
 ru:'<h3>Тематический режим</h3><p>Выбирай отдельную тему и проходи её уровни независимо от основной игры.</p><h3>Прогресс</h3><p>Прогресс каждой темы сохраняется отдельно. В разделе «Спорт» предусмотрено 100 уровней.</p><h3>Подсказки</h3><p>Можно открыть букву, убрать лишние буквы, перемешать набор или открыть текстовую подсказку.</p>',
 en:'<h3>Themed mode</h3><p>Choose a category and complete its levels separately from the main game.</p><h3>Progress</h3><p>Each theme keeps separate progress. The Sport section is designed for 100 levels.</p><h3>Hints</h3><p>You can reveal a letter, remove extra letters, shuffle the set, or reveal a text hint.</p>',
 az:'<h3>Mövzu rejimi</h3><p>Mövzunu seç və onun səviyyələrini əsas oyundan ayrıca keç.</p><h3>Tərəqqi</h3><p>Hər mövzunun tərəqqisi ayrıca saxlanılır. İdman bölməsi 100 səviyyə üçün nəzərdə tutulub.</p><h3>İpucları</h3><p>Hərf açmaq, artıq hərfləri silmək, hərfləri qarışdırmaq və mətn ipucunu açmaq olar.</p>'
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
 50:{answer:'СЕКУНДОМЕР',hint:'Прибор для точного измерения времени в тренировке или соревновании.',photos:[['🏃','Забег'],['🏁','Финиш'],['🕐','Время'],['⏱️','Измерение']]}
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
 46:{answer:'HURDLE',hint:'An obstacle an athlete jumps over during a track race.'},47:{answer:'WHISTLE',hint:'A referee uses it to make a short sharp signal.'},48:{answer:'DISTANCE',hint:'The length that must be covered from start to finish.'},49:{answer:'TACTICS',hint:'A plan of actions used by an athlete or team to get a result.'},50:{answer:'STOPWATCH',hint:'A device used to measure time precisely in training or competition.'}
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
 46:{answer:'MANEƏ',hint:'Qaçış zamanı idmançının üzərindən tullanmalı olduğu əngəl.'},47:{answer:'FİT',hint:'Hakimin qısa səs siqnalı vermək üçün istifadə etdiyi vasitə.'},48:{answer:'MƏSAFƏ',hint:'Startdan finişə qədər keçilməli olan uzunluq.'},49:{answer:'TAKTİKA',hint:'Nəticə əldə etmək üçün idmançı və ya komandanın fəaliyyət planı.'},50:{answer:'SANİYƏÖLÇƏN',hint:'Məşq və yarışda vaxtı dəqiq ölçən cihaz.'}
 }
};
if(TRANSLATED[lang])Object.keys(LEVELS).forEach(k=>Object.assign(LEVELS[k],TRANSLATED[lang][k]));

const alphabet=lang==='az'?'ABCÇDEƏFGĞHXIİJKLMNOÖPQRSŞTUÜVYZ':lang==='en'?'ABCDEFGHJKLMNPQRSTUVWXYZ':'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЭЮЯ';
function makePool(answer){
 const a=[...answer],used=new Set(a),extras=[];
 for(const ch of [...alphabet]){if(!used.has(ch)){extras.push(ch);if(extras.length>=Math.max(5,12-a.length))break}}
 return [...a,...extras];
}
function progressKey(){return 'pw.themeProgress.sport'}
function getProgress(){try{const a=JSON.parse(localStorage.getItem(progressKey())||'[]');return new Set(Array.isArray(a)?a.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=50):[])}catch{return new Set()}}
function saveProgress(set){try{localStorage.setItem(progressKey(),JSON.stringify([...set].sort((a,b)=>a-b)))}catch{}}
function firstIncomplete(set){for(let n=1;n<=50;n++)if(!set.has(n))return n;return 51}

const requested=Number(new URLSearchParams(location.search).get('level')||1),levelId=LEVELS[requested]?requested:1,level=LEVELS[levelId],answer=[...level.answer];
const progress=getProgress(),unlock=firstIncomplete(progress);
const pool=makePool(level.answer),tiles=pool.map((letter,id)=>({id,letter}));
let order=tiles.map(t=>t.id),selected=Array(answer.length).fill(null),fixed=new Map(),removed=new Set(),busy=false,solved=false,textOpen=false;

document.documentElement.lang=lang;
$('themeGameTitle').textContent=ui.sport;$('levelTitle').textContent=ui.level(levelId);$('textHintLabel').textContent=ui.textHint;$('hintValue').textContent=ui.tap;
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
 answer.forEach((_,pos)=>{const b=document.createElement('button');b.type='button';b.className='slot'+(fixed.has(pos)?' fixed':'');b.textContent=tiles[selected[pos]]?.letter||'';b.disabled=busy||solved||fixed.has(pos);b.onclick=()=>{selected[pos]=null;paint()};$('slots').append(b)});
 order.forEach(id=>{const b=document.createElement('button');b.type='button';b.className='letter'+(used.has(id)?' used':'')+(removed.has(id)?' removed':'');b.textContent=tiles[id].letter;b.disabled=busy||solved||used.has(id)||removed.has(id);b.onclick=()=>choose(id);$('letters').append(b)});
 ['letterHint','removeHint','textHint','shuffle'].forEach(id=>$(id).disabled=busy||solved);
 if(textOpen)$('hintValue').textContent=level.hint;
}
function clearInput(){selected=Array(answer.length).fill(null);for(const [pos,id] of fixed)selected[pos]=id}
function choose(id){if(busy||solved)return;const pos=selected.indexOf(null);if(pos<0)return;pw?.sfx?.('tap');pw?.haptic?.();selected[pos]=id;paint();check()}
function showSuccess(){
 const p=getProgress();p.add(levelId);saveProgress(p);$('status').hidden=true;$('successPanel').hidden=false;$('successTitle').textContent=ui.passed(levelId);$('successReward').textContent=ui.saved;
 const next=$('nextLevel');if(levelId<50){next.href='./theme-game.html?theme=sport&level='+(levelId+1);next.innerHTML=ui.next+' <span>▶</span>'}else{next.href='./index.html';next.innerHTML=ui.back+' <span>✓</span>'}
}
function check(){
 if(selected.some(id=>id===null))return;
 const word=selected.map(id=>tiles[id].letter).join('');
 if(word!==level.answer){busy=true;paint();pw?.status?.(ui.wrong);$('slots').classList.add('wrong');pw?.sfx?.('error');pw?.haptic?.('error');setTimeout(()=>{clearInput();busy=false;$('slots').classList.remove('wrong');paint()},700);return}
 solved=true;pw?.sfx?.('success');pw?.haptic?.('success');paint();showSuccess();
}
function hint(type){
 if(busy||solved)return;
 if(type==='text'){textOpen=true;$('hintValue').textContent=level.hint;pw?.status?.(ui.text);return}
 if(type==='letter'){
   const available=answer.map((_,i)=>i).filter(i=>!fixed.has(i));if(!available.length){pw?.status?.(ui.allLetters);return}
   const pos=available[Math.floor(Math.random()*available.length)],reserved=new Set(fixed.values()),tile=tiles.find(t=>t.letter===answer[pos]&&!reserved.has(t.id));
   if(!tile){pw?.status?.(ui.placeFail);return}
   selected=selected.map(id=>id===tile.id?null:id);selected[pos]=tile.id;fixed.set(pos,tile.id);pw?.status?.(ui.letter);pw?.sfx?.('hint');paint();if(selected.every(id=>id!==null))check();return
 }
 const bad=tiles.filter(t=>!answer.includes(t.letter)&&!removed.has(t.id));if(!bad.length){pw?.status?.(ui.noExtra);return}
 bad.slice(0,3).forEach(t=>{removed.add(t.id);selected=selected.map(id=>id===t.id?null:id)});pw?.status?.(ui.remove);pw?.sfx?.('hint');paint();
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