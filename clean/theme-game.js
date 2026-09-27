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
if(TRANSLATED[lang])Object.keys(LEVELS).forEach(k=>Object.assign(LEVELS[k],TRANSLATED[lang][k]));

const alphabet=lang==='az'?'ABCÇDEƏFGĞHXIİJKLMNOÖPQRSŞTUÜVYZ':lang==='en'?'ABCDEFGHJKLMNPQRSTUVWXYZ':'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЭЮЯ';
function makePool(answer){
 const a=[...answer],used=new Set(a),extras=[];
 for(const ch of [...alphabet]){if(!used.has(ch)){extras.push(ch);if(extras.length>=Math.max(5,12-a.length))break}}
 return [...a,...extras];
}
function progressKey(){return 'pw.themeProgress.sport'}
function getProgress(){try{const a=JSON.parse(localStorage.getItem(progressKey())||'[]');return new Set(Array.isArray(a)?a.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=100):[])}catch{return new Set()}}
function saveProgress(set){try{localStorage.setItem(progressKey(),JSON.stringify([...set].sort((a,b)=>a-b)))}catch{}}
function firstIncomplete(set){for(let n=1;n<=100;n++)if(!set.has(n))return n;return 101}

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
 const next=$('nextLevel');if(levelId<100){next.href='./theme-game.html?theme=sport&level='+(levelId+1);next.innerHTML=ui.next+' <span>▶</span>'}else{next.href='./index.html';next.innerHTML=ui.back+' <span>✓</span>'}
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