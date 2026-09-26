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

const T={
ru:{
logo:['4','Ф','О','Т','О'],one:'1 СЛОВО',tagline:'Больше, чем просто слова',
chapter:n=>'Глава '+n,chapter1:'Разминка',chapter1Desc:'От простых слов к более сложным ассоциациям',chapter2:'Ассоциации',chapter2Desc:'Более сложные слова и связи между образами',levels:'уровней',
play:'ИГРАТЬ',replay:'ПЕРЕИГРАТЬ',locked:'ЗАКРЫТО',allDone:'ГЛАВЫ 1–2 ПРОЙДЕНЫ',
home:'Главная',chapters:'Главы',chaptersSubtitle:'Выбирай главу и продолжай игру',rating:'Рейтинг',ratingSubtitle:'Лучшие игроки PhotoWord',overallRating:'🏆 Общий рейтинг',myPosition:'Твоя позиция',refresh:'Обновить рейтинг',
friends:'Друзья',shop:'Магазин',daily:'Ежедневная награда',tasks:'Задания',
settings:'Настройки',sound:'Звук',soundDesc:'Буквы, победа, ошибка и награды',vibration:'Вибрация',hapticDesc:'Нажатия, верный и неверный ответ',music:'Музыка',musicDesc:'Спокойная фоновая музыка',language:'Язык',notifications:'Уведомления',notifyAllow:'Награды и новые уровни · Разрешить',notifyAllowed:'Разрешены',theme:'Тема',rules:'Правила игры',rulesDesc:'Как играть, монеты, XP и подсказки',support:'Поддержка',supportDesc:'Связаться с поддержкой',supportText:'Контакты поддержки будут добавлены перед запуском.',privacy:'Конфиденциальность',privacyDesc:'Какие данные используются и зачем',terms:'Пользовательское соглашение',reset:'Сбросить прогресс',resetDesc:'Уровни, XP и место в рейтинге',
novice:'Новичок',skilled:'Знаток',expert:'Эксперт',master:'Мастер',legend:'Легенда',place:'место',unranked:'вне рейтинга',profileRank:'Место',profileLevels:'Уровней',profilePrivacy:'Telegram ID не показывается в рейтинге.',noUsername:'Telegram username не указан',
nicknameSet:'Установить игровой ник',nicknameDone:'Игровой ник установлен',nicknameTitle:'Игровой ник',nicknameText:'Можно установить только один раз. 3–16 символов: английские буквы, цифры и _.',save:'СОХРАНИТЬ',share:'Поделиться игрой',shareText:'Попробуй PhotoWord — 4 картинки, 1 слово!',
dailyCopy:'Заходи каждый день и забирай награду.',streak:'Серия',claim:'ПОЛУЧИТЬ',claimed:'Награда получена ✓',alreadyDaily:'Сегодня награда уже получена.',
taskTitle:'🎯 Задания дня',task1:'Пройди 1 уровень',task2:'Пройди 2 уровня',reward:'Награда',take:'ЗАБРАТЬ',tasksFoot:'Задания обновляются каждый день.',taskClaimed:'ПОЛУЧЕНО',
invite:'ПРИГЛАСИТЬ ДРУГА',invited:'Приглашено',earned:'Получено',inviteCondition:'Друг проходит 10 уровней — вы оба получаете +20 🪙.',invitedList:'Приглашённые',none:'Пока никого нет.',rewardReceived:'Награда получена',
coinShop:'Магазин монет',payStars:'Оплата через Telegram Stars ⭐',best:'ВЫГОДНО',adTitle:'Получить бесплатно',adText:'Посмотри рекламу и получи +5 🪙',soon:'СКОРО',shopFoot:'Монеты начисляются после подтверждения платежа Telegram.',offerTitle:'Больше монет — больше возможностей!',offerText:'Открывай буквы, получай подсказки и проходи уровни',
themeTitle:'Тема',themeSubtitle:'Выберите оформление игры',themeNames:{game:'🎮 Игровая',night:'🌙 Ночная',light:'☀️ Светлая',neon:'⚡ Неон',gold:'👑 Золотая'},themeDesc:{game:'Текущая классическая тема',night:'Графит и приглушённые цвета',light:'Светлый фон и тёмный текст',neon:'Яркое свечение и контраст',gold:'Тёмный фон и золотые акценты'},
rulesTitle:'Правила игры',resetTitle:'Сбросить прогресс?',cancel:'Отмена',resetButton:'СБРОСИТЬ ПРОГРЕСС',confirmReset:'НАЖМИ ЕЩЁ РАЗ ДЛЯ ПОДТВЕРЖДЕНИЯ',
profileSynced:'Профиль синхронизирован',loading:'Загрузка…',noPlayers:'Пока нет игроков',notifyNeedTelegram:'Открой игру внутри Telegram, чтобы разрешить уведомления.',notifyGranted:'Уведомления разрешены.',notifyDenied:'Разрешение не предоставлено.',resetDone:'Прогресс сброшен. Выберите язык игры.'
},
en:{
logo:['4','P','I','C','S'],one:'1 WORD',tagline:'More than just words',
chapter:n=>'Chapter '+n,chapter1:'Warm-up',chapter1Desc:'From simple words to more challenging associations',chapter2:'Associations',chapter2Desc:'More challenging words and deeper image connections',levels:'levels',
play:'PLAY',replay:'REPLAY',locked:'LOCKED',allDone:'CHAPTERS 1–2 COMPLETED',
home:'Home',chapters:'Chapters',chaptersSubtitle:'Choose a chapter and continue',rating:'Leaderboard',ratingSubtitle:'Top PhotoWord players',overallRating:'🏆 Overall leaderboard',myPosition:'Your position',refresh:'Refresh leaderboard',
friends:'Friends',shop:'Shop',daily:'Daily reward',tasks:'Tasks',
settings:'Settings',sound:'Sound',soundDesc:'Letters, wins, mistakes and rewards',vibration:'Haptics',hapticDesc:'Taps, correct and wrong answers',music:'Music',musicDesc:'Calm background music',language:'Language',notifications:'Notifications',notifyAllow:'Rewards and new levels · Allow',notifyAllowed:'Allowed',theme:'Theme',rules:'Game rules',rulesDesc:'How to play, coins, XP and hints',support:'Support',supportDesc:'Contact support',supportText:'Support contacts will be added before launch.',privacy:'Privacy',privacyDesc:'What data is used and why',terms:'Terms of use',reset:'Reset progress',resetDesc:'Levels, XP and leaderboard position',
novice:'Novice',skilled:'Skilled',expert:'Expert',master:'Master',legend:'Legend',place:'place',unranked:'unranked',profileRank:'Place',profileLevels:'Levels',profilePrivacy:'Telegram ID is not shown on the leaderboard.',noUsername:'Telegram username not set',
nicknameSet:'Set game nickname',nicknameDone:'Game nickname set',nicknameTitle:'Game nickname',nicknameText:'You can set it only once. 3–16 characters: English letters, numbers and _.',save:'SAVE',share:'Share game',shareText:'Try PhotoWord — 4 pictures, 1 word!',
dailyCopy:'Come back every day and claim your reward.',streak:'Streak',claim:'CLAIM',claimed:'Reward claimed ✓',alreadyDaily:'Today’s reward has already been claimed.',
taskTitle:'🎯 Daily tasks',task1:'Complete 1 level',task2:'Complete 2 levels',reward:'Reward',take:'CLAIM',tasksFoot:'Tasks refresh every day.',taskClaimed:'CLAIMED',
invite:'INVITE A FRIEND',invited:'Invited',earned:'Earned',inviteCondition:'Your friend completes 10 levels — both of you get +20 🪙.',invitedList:'Invited friends',none:'No invited friends yet.',rewardReceived:'Reward received',
coinShop:'Coin shop',payStars:'Payment via Telegram Stars ⭐',best:'BEST VALUE',adTitle:'Get for free',adText:'Watch an ad and get +5 🪙',soon:'SOON',shopFoot:'Coins are credited after Telegram confirms the payment.',offerTitle:'More coins — more possibilities!',offerText:'Reveal letters, use hints and complete levels',
themeTitle:'Theme',themeSubtitle:'Choose the game appearance',themeNames:{game:'🎮 Game',night:'🌙 Night',light:'☀️ Light',neon:'⚡ Neon',gold:'👑 Gold'},themeDesc:{game:'Current classic theme',night:'Graphite and muted colors',light:'Light background and dark text',neon:'Bright glow and contrast',gold:'Dark background with gold accents'},
rulesTitle:'Game rules',resetTitle:'Reset progress?',cancel:'Cancel',resetButton:'RESET PROGRESS',confirmReset:'TAP AGAIN TO CONFIRM',
profileSynced:'Profile synced',loading:'Loading…',noPlayers:'No players yet',notifyNeedTelegram:'Open the game inside Telegram to enable notifications.',notifyGranted:'Notifications allowed.',notifyDenied:'Permission was not granted.',resetDone:'Progress reset. Choose your game language.'
},
az:{
logo:['4','F','O','T','O'],one:'1 SÖZ',tagline:'Sadəcə sözlərdən daha çox',
chapter:n=>'Fəsil '+n,chapter1:'İsinmə',chapter1Desc:'Sadə sözlərdən daha çətin assosiasiyalara',chapter2:'Assosiasiyalar',chapter2Desc:'Daha çətin sözlər və şəkillər arasında daha dərin əlaqələr',levels:'səviyyə',
play:'OYNA',replay:'YENİDƏN OYNA',locked:'BAĞLIDIR',allDone:'1–2-Cİ FƏSİLLƏR TAMAMLANDI',
home:'Ana səhifə',chapters:'Fəsillər',chaptersSubtitle:'Fəsli seç və oyuna davam et',rating:'Reytinq',ratingSubtitle:'PhotoWord-un ən yaxşı oyunçuları',overallRating:'🏆 Ümumi reytinq',myPosition:'Sənin yerin',refresh:'Reytinqi yenilə',
friends:'Dostlar',shop:'Mağaza',daily:'Gündəlik mükafat',tasks:'Tapşırıqlar',
settings:'Ayarlar',sound:'Səs',soundDesc:'Hərflər, qələbə, səhv və mükafat səsləri',vibration:'Vibrasiya',hapticDesc:'Toxunuş, düzgün və səhv cavab',music:'Musiqi',musicDesc:'Sakit fon musiqisi',language:'Dil',notifications:'Bildirişlər',notifyAllow:'Mükafatlar və yeni səviyyələr · İcazə ver',notifyAllowed:'İcazə verilib',theme:'Tema',rules:'Oyun qaydaları',rulesDesc:'Oyun, sikkələr, XP və ipucları',support:'Dəstək',supportDesc:'Dəstəklə əlaqə',supportText:'Dəstək əlaqələri istifadəyə verilməzdən əvvəl əlavə olunacaq.',privacy:'Məxfilik',privacyDesc:'Hansı məlumatların niyə istifadə edilməsi',terms:'İstifadəçi razılaşması',reset:'Tərəqqini sıfırla',resetDesc:'Səviyyələr, XP və reytinq mövqeyi',
novice:'Yeni başlayan',skilled:'Bilici',expert:'Ekspert',master:'Usta',legend:'Əfsanə',place:'yer',unranked:'reytinqdən kənar',profileRank:'Yer',profileLevels:'Səviyyələr',profilePrivacy:'Telegram ID reytinqdə göstərilmir.',noUsername:'Telegram username göstərilməyib',
nicknameSet:'Oyun niki təyin et',nicknameDone:'Oyun niki təyin edilib',nicknameTitle:'Oyun niki',nicknameText:'Yalnız bir dəfə təyin etmək olar. 3–16 simvol: ingilis hərfləri, rəqəmlər və _.',save:'YADDA SAXLA',share:'Oyunu paylaş',shareText:'PhotoWord-u sına — 4 şəkil, 1 söz!',
dailyCopy:'Hər gün daxil ol və mükafatını götür.',streak:'Seriya',claim:'GÖTÜR',claimed:'Mükafat alındı ✓',alreadyDaily:'Bugünkü mükafat artıq alınıb.',
taskTitle:'🎯 Günün tapşırıqları',task1:'1 səviyyə keç',task2:'2 səviyyə keç',reward:'Mükafat',take:'GÖTÜR',tasksFoot:'Tapşırıqlar hər gün yenilənir.',taskClaimed:'ALINDI',
invite:'DOSTU DƏVƏT ET',invited:'Dəvət edilib',earned:'Qazanılıb',inviteCondition:'Dostun 10 səviyyə keçir — hər ikiniz +20 🪙 alırsınız.',invitedList:'Dəvət olunanlar',none:'Hələ dəvət olunan yoxdur.',rewardReceived:'Mükafat alındı',
coinShop:'Sikkə mağazası',payStars:'Ödəniş Telegram Stars ilə ⭐',best:'SƏRFƏLİ',adTitle:'Pulsuz əldə et',adText:'Reklama bax və +5 🪙 qazan',soon:'TEZLİKLƏ',shopFoot:'Sikkələr Telegram ödənişi təsdiqlədikdən sonra əlavə olunur.',offerTitle:'Daha çox sikkə — daha çox imkan!',offerText:'Hərfləri aç, ipuclarından istifadə et və səviyyələri keç',
themeTitle:'Tema',themeSubtitle:'Oyunun görünüşünü seç',themeNames:{game:'🎮 Oyun',night:'🌙 Gecə',light:'☀️ İşıqlı',neon:'⚡ Neon',gold:'👑 Qızılı'},themeDesc:{game:'Klassik oyun mövzusu',night:'Qrafit və sakit rənglər',light:'Açıq fon və tünd mətn',neon:'Parlaq işıq və kontrast',gold:'Tünd fon və qızılı vurğular'},
rulesTitle:'Oyun qaydaları',resetTitle:'Tərəqqi sıfırlansın?',cancel:'Ləğv et',resetButton:'TƏRƏQQİNİ SIFIRLA',confirmReset:'TƏSDİQ ÜÇÜN YENƏ TOXUN',
profileSynced:'Profil sinxronlaşdırıldı',loading:'Yüklənir…',noPlayers:'Hələ oyunçu yoxdur',notifyNeedTelegram:'Bildirişləri aktivləşdirmək üçün oyunu Telegram daxilində açın.',notifyGranted:'Bildirişlərə icazə verildi.',notifyDenied:'İcazə verilmədi.',resetDone:'Tərəqqi sıfırlandı. Oyun dilini seçin.'
}};

const THEMES=['game','night','light','neon','gold'];
function t(){return T[lang()]||T.ru}
function leagueName(p){const x=t();return p.xp>=4000?x.legend:p.xp>=2500?x.master:p.xp>=1500?x.expert:p.xp>=400?x.skilled:x.novice}
function persistPrefs(){try{localStorage.setItem('photoword-prefs',JSON.stringify(pw.prefs))}catch{}}
function setLogo(x){const e=$('logoLetters');if(e)e.innerHTML=x.logo.map(v=>'<i>'+v+'</i>').join('');text('logoWord',x.one);text('logoTagline',x.tagline)}
function chapterData(p,x){return (p.current_level||1)<=20?{num:1,title:x.chapter1,desc:x.chapter1Desc,start:1,end:20,total:20}:{num:2,title:x.chapter2,desc:x.chapter2Desc,start:21,end:49,total:29}}

function applyTheme(theme){
 if(!THEMES.includes(theme))theme='game';
 document.documentElement.dataset.theme=theme;try{localStorage.setItem('pw.theme',theme)}catch{}
 const x=t();text('themeCurrent',x.themeNames[theme]);document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('selected',b.dataset.theme===theme));
}
function setThemeLabels(x){
 text('themeTitle',x.themeTitle);text('themeSubtitle',x.themeSubtitle);
 for(const key of THEMES){const cap=key[0].toUpperCase()+key.slice(1);text('theme'+cap+'Name',x.themeNames[key]);text('theme'+cap+'Desc',x.themeDesc[key]);}
}
function updateChapterCards(p){
 const x=t(),done=Math.min(49,p.completed_levels||0),d1=Math.min(20,done),d2=Math.max(0,Math.min(29,done-20));
 text('chapter1Label',x.chapter(1)+' · 1–20');text('chapter1Title',x.chapter1);text('chapter1Desc',x.chapter1Desc);text('chapter1Done',d1);text('chapter1Count','/ 20 '+x.levels);$('chapter1Progress').style.width=d1*5+'%';
 const next1=d1>=20?1:Math.max(1,Math.min(20,p.current_level||1));$('chapter1Play').href='./game.html?level='+next1;$('chapter1Play').innerHTML=(d1>=20?x.replay:x.play)+' <span>▶</span>';
 text('chapter2Label',x.chapter(2)+' · 21–49');text('chapter2Title',x.chapter2);text('chapter2Desc',x.chapter2Desc);text('chapter2Done',d2);text('chapter2Count','/ 29 '+x.levels);$('chapter2Progress').style.width=(d2/29*100)+'%';
 const unlocked=(p.current_level||1)>=21||d1>=20;
 if(unlocked){
   const next2=d2>=29?21:Math.max(21,Math.min(49,p.current_level||21));$('chapter2Play').classList.remove('locked');$('chapter2Play').removeAttribute('aria-disabled');$('chapter2Play').href='./game.html?level='+next2;$('chapter2Play').innerHTML=(d2>=29?x.replay:x.play)+' <span>▶</span>';
 }else{
   $('chapter2Play').classList.add('locked');$('chapter2Play').setAttribute('aria-disabled','true');$('chapter2Play').removeAttribute('href');$('chapter2Play').textContent=x.locked;
 }
}
function update(p){
 const x=t(),name=pw.name(p),rank=p.rank>0?'#'+p.rank:'—';
 text('name',name);text('profileName',name);text('rankLabel',leagueName(p)+' · '+(p.rank>0?x.place+' #'+p.rank:x.unranked));text('profileRank',rank);
 text('photoWordId',p.photoword_id);text('profileXp',p.xp);text('profileDone',p.completed_levels);text('profileUsername',p.username?'@'+p.username:x.noUsername);
 for(const id of ['avatar','profileAvatar'])text(id,(name||'P').charAt(0).toUpperCase());text('myRank',rank);text('myXp',p.xp+' XP');
 text('nicknameBtn',p.nickname_changed?x.nicknameDone:x.nicknameSet);$('nicknameBtn').disabled=Boolean(p.nickname_changed);
 const done=Math.min(49,p.completed_levels||0),cd=chapterData(p,x),chapterDone=cd.num===1?Math.min(20,done):Math.max(0,Math.min(29,done-20));
 text('done',chapterDone);text('chapterCountSuffix','/ '+cd.total+' '+x.levels);$('progress').style.width=(chapterDone/cd.total*100)+'%';
 text('activeChapterLabel',x.chapter(cd.num));text('activeChapterTitle',cd.title);text('activeChapterDesc',cd.desc);
 $('activeChapterCard').classList.toggle('assoc',cd.num===2);$('activeChapterHero').classList.toggle('assoc-hero',cd.num===2);
 const next=(p.current_level||1)>49?21:Math.max(cd.start,Math.min(cd.end,p.current_level||cd.start));$('playLink').href='./game.html?level='+next;
 if((p.current_level||1)>49)$('playLink').innerHTML=x.allDone+' <span>✓</span>'; else $('playLink').innerHTML=x.play+' <span>▶</span>';
 updateChapterCards(p);
 const claimed=String(p.last_daily_reward||'')===today();$('claimDaily').disabled=claimed;text('claimDaily',claimed?x.claimed:x.claim);text('dailyStreak',x.streak+': '+(p.daily_streak||0));
}
function applyLanguage(l){
 if(!T[l])l='ru';try{localStorage.setItem('pw.language',l)}catch{};document.documentElement.lang=l;const x=T[l];setLogo(x);
 const nav=document.querySelectorAll('nav small');[x.home,x.chapters,x.rating,x.friends,x.shop].forEach((v,i)=>{if(nav[i])nav[i].textContent=v});
 text('chaptersTitle',x.chapters);text('chaptersSubtitle',x.chaptersSubtitle);text('ratingTitle',x.rating);text('ratingSubtitle',x.ratingSubtitle);text('ratingLeague',x.overallRating);text('myPositionLabel',x.myPosition);text('refreshRating',x.refresh);
 text('settingsTitle',x.settings);const rows=document.querySelectorAll('#settingsModal .settingrow b');if(rows[0])rows[0].textContent=x.sound;if(rows[1])rows[1].textContent=x.vibration;if(rows[2])rows[2].textContent=x.music;
 text('soundDesc',x.soundDesc);text('hapticDesc',x.hapticDesc);text('musicDesc',x.musicDesc);$('languageBtn').querySelector('b').textContent=x.language;$('notificationsBtn').querySelector('b').textContent=x.notifications;text('notificationsState',localStorage.getItem('pw.writeAccess')?x.notifyAllowed:x.notifyAllow);$('themeBtn').querySelector('b').textContent=x.theme;
 $('rulesBtn').querySelector('b').textContent=x.rules;$('rulesBtn').querySelector('small').textContent=x.rulesDesc;text('supportTitle',x.support);text('supportDesc',x.supportDesc);text('supportText',x.supportText);$('privacyLink').querySelector('b').textContent=x.privacy;$('privacyLink').querySelector('small').textContent=x.privacyDesc;$('termsLink').querySelector('b').textContent=x.terms;$('resetProgressBtn').querySelector('b').textContent=x.reset;$('resetProgressBtn').querySelector('small').textContent=x.resetDesc;
 text('profileRankLabel',x.profileRank);text('profileDoneLabel',x.profileLevels);text('profilePrivacyNote',x.profilePrivacy);text('nicknameTitle',x.nicknameTitle);text('nicknameText',x.nicknameText);text('saveNickname',x.save);text('shareGameBtn',x.share);
 text('friendsInvited',document.getElementById('friendsInvited')?.textContent||'0');const fs=document.querySelectorAll('.friendstats small');if(fs[0])fs[0].textContent=x.invited;if(fs[1])fs[1].textContent=x.earned;text('friendsCondition',x.inviteCondition);text('inviteFriend',x.invite);$('friendsModal').querySelector('h2').textContent=x.friends;$('friendsModal').querySelector('h3').textContent=x.invitedList;if($('friendsEmpty'))text('friendsEmpty',x.none);
 text('shopTitle',x.coinShop);text('shopPayNote',x.payStars);const best=$('shopModal').querySelector('.best i');if(best)best.textContent=x.best;text('adTitle',x.adTitle);text('adText',x.adText);text('watchAd',x.soon);text('shopFootnote',x.shopFoot);const offer=$('shopOffer');if(offer){offer.querySelector('b').textContent=x.offerTitle;offer.querySelector('small').textContent=x.offerText;}
 $('dailyModal').querySelector('h2').textContent=x.daily;text('dailyCopy',x.dailyCopy);text('tasksTitle',x.taskTitle);text('task1Title',x.task1);text('task1Reward',x.reward+': 40 🪙');text('task2Title',x.task2);text('task2Reward',x.reward+': 80 🪙');document.querySelectorAll('[data-task]').forEach(b=>{if(!b.disabled)b.textContent=x.take});text('tasksFootnote',x.tasksFoot);
 const shortcuts=document.querySelectorAll('.shortcuts button b');if(shortcuts[0])shortcuts[0].textContent=x.daily;if(shortcuts[1])shortcuts[1].textContent=x.tasks;if(shortcuts[2])shortcuts[2].textContent=x.rating;
 text('rulesTitle',x.rulesTitle);$('rulesBody').innerHTML=RULES[l]||RULES.ru;text('resetTitle',x.resetTitle);text('resetBody',RESET[l]||RESET.ru);text('cancelReset',x.cancel);text('confirmReset',x.resetButton);
 setThemeLabels(x);text('themeCurrent',x.themeNames[getTheme()]);text('languageCurrent',l==='ru'?'Русский':l==='en'?'English':'Azərbaycan dili');document.querySelectorAll('[data-language]').forEach(b=>b.classList.toggle('selected',b.dataset.language===l));
 if(pw.player)update(pw.player);
}
function showRequiredLanguagePicker(){const c=$('languageClose');if(c)c.hidden=true;open('languageModal')}

const RULES={
ru:`<h3>Цель игры</h3><p>Четыре изображения связаны одним словом. Собери его из предложенных букв.</p><h3>Главы</h3><p>Глава 1 «Разминка» — уровни 1–20. Глава 2 «Ассоциации» — уровни 21–49 и открывается после прохождения 20-го уровня.</p><h3>Подсказки</h3><p>💡 правильная буква — 50 🪙.<br>🪄 убрать до трёх лишних — 100 🪙.<br>Текстовая подсказка — 150 🪙.<br>🔀 перемешивание — бесплатно.</p><h3>Награды</h3><p>Первое прохождение уровня: +20 🪙 и +15 XP. Ежедневная награда: +5 🪙. Повторное прохождение уровня награду не даёт.</p><h3>XP и ранги</h3><p>0–399 Новичок · 400–1499 Знаток · 1500–2499 Эксперт · 2500–3999 Мастер · 4000+ Легенда.</p><h3>Друзья</h3><p>Если приглашённый игрок пройдёт 10 уровней, вы оба получите +20 🪙.</p>`,
en:`<h3>Goal</h3><p>Four images are connected by one word. Build it from the available letters.</p><h3>Chapters</h3><p>Chapter 1 “Warm-up” contains levels 1–20. Chapter 2 “Associations” contains levels 21–49 and unlocks after level 20.</p><h3>Hints</h3><p>💡 correct letter — 50 🪙.<br>🪄 remove up to three extra letters — 100 🪙.<br>Text hint — 150 🪙.<br>🔀 shuffle — free.</p><h3>Rewards</h3><p>First completion: +20 🪙 and +15 XP. Daily reward: +5 🪙. Replaying a level gives no extra reward.</p><h3>XP and ranks</h3><p>0–399 Novice · 400–1499 Skilled · 1500–2499 Expert · 2500–3999 Master · 4000+ Legend.</p><h3>Friends</h3><p>If your invited friend completes 10 levels, both of you receive +20 🪙.</p>`,
az:`<h3>Məqsəd</h3><p>Dörd şəkli bir söz birləşdirir. Həmin sözü verilən hərflərdən düzəlt.</p><h3>Fəsillər</h3><p>1-ci fəsil “İsinmə” — 1–20-ci səviyyələr. 2-ci fəsil “Assosiasiyalar” — 21–49-cu səviyyələr və 20-ci səviyyədən sonra açılır.</p><h3>İpucları</h3><p>💡 düzgün hərf — 50 🪙.<br>🪄 üçədək artıq hərfi silmək — 100 🪙.<br>Mətn ipucu — 150 🪙.<br>🔀 qarışdırmaq — pulsuz.</p><h3>Mükafatlar</h3><p>Səviyyəni ilk dəfə keçdikdə +20 🪙 və +15 XP. Gündəlik mükafat +5 🪙. Təkrar keçid əlavə mükafat vermir.</p><h3>XP və rütbələr</h3><p>0–399 Yeni başlayan · 400–1499 Bilici · 1500–2499 Ekspert · 2500–3999 Usta · 4000+ Əfsanə.</p><h3>Dostlar</h3><p>Dəvət etdiyin oyunçu 10 səviyyə keçdikdə hər ikiniz +20 🪙 alırsınız.</p>`
};
const RESET={
ru:'Будут удалены прохождение всех уровней, XP и позиция в рейтинге. Игра начнётся с уровня 1, язык нужно будет выбрать снова. Монеты, покупки Telegram Stars и история уже полученных наград сохраняются.',
en:'All completed levels, XP and leaderboard position will be removed. The game restarts from level 1 and you will choose the language again. Coins, Telegram Stars purchases and previously claimed reward history are kept.',
az:'Bütün keçilmiş səviyyələr, XP və reytinq mövqeyi silinəcək. Oyun 1-ci səviyyədən başlayacaq və dil yenidən seçiləcək. Sikkələr, Telegram Stars alışları və artıq alınmış mükafatların tarixçəsi saxlanılır.'
};

const initial=getLang();applyTheme(getTheme());if(initial)applyLanguage(initial);else{applyLanguage('ru');setTimeout(showRequiredLanguagePicker,250)}

$('settingsBtn').onclick=()=>open('settingsModal');
$('languageBtn').onclick=()=>{close('settingsModal');const c=$('languageClose');if(c)c.hidden=false;setTimeout(()=>open('languageModal'),0)};
$('themeBtn').onclick=()=>{close('settingsModal');setTimeout(()=>open('themeModal'),0)};
document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{applyTheme(b.dataset.theme);close('themeModal')});
document.querySelectorAll('[data-language]').forEach(b=>b.onclick=()=>{applyLanguage(b.dataset.language);close('languageModal');pw.status(b.dataset.language==='ru'?'Язык игры: Русский':b.dataset.language==='en'?'Game language: English':'Oyun dili: Azərbaycan dili')});
$('profileBtn').onclick=()=>open('profileModal');$('dailyRewardBtn').onclick=()=>open('dailyModal');$('tasksBtn').onclick=()=>open('tasksModal');$('shopOffer').onclick=()=>open('shopModal');$('shopNav').onclick=()=>open('shopModal');
$('chaptersNav').onclick=()=>screen('chaptersScreen');$('chaptersBack').onclick=()=>screen('home');$('homeNav').onclick=()=>screen('home');
$('rulesBtn').onclick=()=>{close('settingsModal');applyLanguage(lang());setTimeout(()=>open('rulesModal'),0)};
$('supportBtn').onclick=()=>{close('settingsModal');setTimeout(()=>open('supportModal'),0)};
$('resetProgressBtn').onclick=()=>{close('settingsModal');resetArmed=false;text('confirmReset',t().resetButton);setTimeout(()=>open('resetModal'),0)};

$('nicknameBtn').onclick=()=>{if(pw.player?.nickname_changed)return;close('profileModal');$('nicknameInput').value='';open('nicknameModal')};
$('saveNickname').onclick=async()=>{const b=$('saveNickname'),value=$('nicknameInput').value.trim();b.disabled=true;try{const p=await pw.api('set_nickname',{nickname:value});update(p);close('nicknameModal');pw.sfx('success')}catch(e){pw.status(e.message)}finally{b.disabled=false}};
$('shareGameBtn').onclick=async()=>{const x=t(),link='https://t.me/PhotoWordBot?startapp=share',url='https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent(x.shareText);if(window.Telegram?.WebApp?.openTelegramLink)Telegram.WebApp.openTelegramLink(url);else location.href=url};

$('notificationsBtn').onclick=()=>{const tg=window.Telegram?.WebApp,x=t();if(!tg?.requestWriteAccess){pw.status(x.notifyNeedTelegram);return}tg.requestWriteAccess(ok=>{if(ok){try{localStorage.setItem('pw.writeAccess','1')}catch{};text('notificationsState',x.notifyAllowed);pw.status(x.notifyGranted)}else pw.status(x.notifyDenied)})};
for(const [id,key] of [['soundToggle','sound'],['hapticToggle','haptic']]){$(id).checked=Boolean(pw.prefs[key]);$(id).onchange=()=>{pw.prefs[key]=$(id).checked;persistPrefs();if(key==='sound')pw.sfx('tap')}};
$('musicToggle').checked=Boolean(pw.prefs.music);$('musicToggle').onchange=()=>pw.setMusic($('musicToggle').checked);

let resetArmed=false,resetTimer=null;
$('confirmReset').onclick=async()=>{const b=$('confirmReset'),x=t();if(!resetArmed){resetArmed=true;b.textContent=x.confirmReset;clearTimeout(resetTimer);resetTimer=setTimeout(()=>{resetArmed=false;b.textContent=x.resetButton},5000);return}b.disabled=true;try{const p=await pw.api('reset_progress');try{for(let i=sessionStorage.length-1;i>=0;i--){const k=sessionStorage.key(i);if(k?.startsWith('pw.hints.'))sessionStorage.removeItem(k)}localStorage.removeItem('pw.language')}catch{};update(p);close('resetModal');pw.sfx('success');pw.status(x.resetDone);setTimeout(showRequiredLanguagePicker,350)}catch(e){pw.status(e.message)}finally{b.disabled=false;resetArmed=false}};

async function loadFriends(){const x=t();open('friendsModal');const list=$('friendsList');list.textContent=x.loading;try{const data=await pw.actionRequest('friends');text('friendsInvited',data.invited||0);text('friendsReward',(data.total_reward||0)+' 🪙');list.replaceChildren();if(!data.friends?.length){const p=document.createElement('p');p.className='muted';p.textContent=x.none;list.append(p);return}data.friends.forEach(f=>{const row=document.createElement('div');row.className='friendrow'+(f.rewarded?' rewarded':'');const who=document.createElement('div'),n=document.createElement('b'),sub=document.createElement('small');n.textContent=f.game_nickname||[f.first_name,f.last_name].filter(Boolean).join(' ')||f.photoword_id;sub.textContent=f.username?'@'+f.username:f.photoword_id;who.append(n,sub);const prog=document.createElement('div'),label=document.createElement('span'),track=document.createElement('em'),bar=document.createElement('i');prog.className='friendprogress';label.textContent=f.rewarded?x.rewardReceived:f.completed_levels+' / 10';bar.style.width=Math.min(100,(f.completed_levels||0)*10)+'%';track.append(bar);prog.append(label,track);row.append(who,prog);list.append(row)})}catch(e){list.textContent=e.message}}
$('friendsNav').onclick=loadFriends;
$('inviteFriend').onclick=async()=>{try{const p=await pw.login(),link='https://t.me/PhotoWordBot?startapp='+encodeURIComponent('ref_'+p.photoword_id),share='https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent(t().shareText);window.Telegram?.WebApp?.openTelegramLink?.(share)}catch(e){pw.status(e.message)}};

document.querySelectorAll('[data-pack]').forEach(b=>b.onclick=async()=>{if(b.disabled)return;b.disabled=true;try{const result=await pw.actionRequest('create_invoice',{pack:b.dataset.pack}),tg=window.Telegram?.WebApp;if(!tg?.openInvoice)throw new Error(t().notifyNeedTelegram);tg.openInvoice(result.invoice_url,status=>{b.disabled=false;if(status==='paid'){pw.status(t().profileSynced);setTimeout(()=>pw.login(true).catch(()=>{}),1200)}})}catch(e){pw.status(e.message);b.disabled=false}});

$('claimDaily').onclick=async()=>{const x=t();try{const p=await pw.api('claim_daily');update(p);pw.sfx('coin');text('claimDaily',x.claimed);$('claimDaily').disabled=true;pw.status('+5 🪙');setTimeout(()=>close('dailyModal'),900)}catch(e){if(String(e.message)===x.alreadyDaily||String(e.message).toLowerCase().includes('already')||String(e.message).includes('уже')||String(e.message).includes('artıq')){text('claimDaily',x.claimed);$('claimDaily').disabled=true;pw.status(x.alreadyDaily)}else pw.status(e.message)}};
document.querySelectorAll('[data-task]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{const p=await pw.api('claim_task',{taskKey:b.dataset.task});update(p);b.textContent=t().taskClaimed;pw.sfx('coin')}catch(e){pw.status(e.message);b.disabled=false}});

document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>close(b.dataset.close));
document.querySelectorAll('.modal').forEach(m=>m.onclick=e=>{if(e.target===m)close(m.id)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal').forEach(m=>m.hidden=true)});

$('ratingBack').onclick=()=>screen('home');let ratingReq=0;
async function rating(){const x=t();screen('ratingScreen');const id=++ratingReq,board=$('leaderboard');board.textContent=x.loading;try{if(pw.hasAuth)await pw.login().catch(e=>pw.status(e.message));const rows=await pw.leaderboard();if(id!==ratingReq)return;board.replaceChildren();if(!rows.length){board.textContent=x.noPlayers;return}rows.forEach(p=>{const row=document.createElement('div');row.className='rankrow'+(p.photoword_id===pw.player?.photoword_id?' me':'');const rank=document.createElement('b');rank.textContent='#'+p.rank;const person=document.createElement('div'),title=document.createElement('strong'),sub=document.createElement('small');title.textContent=pw.name(p);sub.textContent=p.photoword_id;person.append(title,sub);const xp=document.createElement('b');xp.textContent=p.xp+' XP';row.append(rank,person,xp);board.append(row)})}catch(e){board.textContent=e.message}}
['ratingNav','ratingShortcut','refreshRating'].forEach(id=>$(id).onclick=rating);

window.addEventListener('pw:player',e=>update(e.detail));
pw.login().then(async()=>{pw.status(t().profileSynced);try{const start=window.Telegram?.WebApp?.initDataUnsafe?.start_param||'';if(start.startsWith('ref_PW-'))await pw.api('register_referral',{referrer:start.slice(4)})}catch{}}).catch(e=>pw.status(e.message));
})();