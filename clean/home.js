(() => {
'use strict';
const $=id=>document.getElementById(id),pw=window.PW;
const text=(id,v)=>{const e=$(id);if(e)e.textContent=v};
const open=id=>{const e=$(id);if(!e)return;e.hidden=false;e.querySelector('button')?.focus()};
const close=id=>{const e=$(id);if(e)e.hidden=true};
const screen=id=>{document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('active',e.id===id));window.scrollTo(0,0)};

const UI={
ru:{chapter:'Глава 1',warm:'Разминка',desc:'Простые слова для хорошего старта',levels:'уровней',play:'ИГРАТЬ',daily:'Ежедневная награда',tasks:'Задания',rating:'Рейтинг',home:'Главная',chapters:'Главы',friends:'Друзья',shop:'Магазин',settings:'Настройки',language:'Язык',sound:'Звук',vibration:'Вибрация',music:'Музыка',notifications:'Уведомления',rules:'Правила игры',support:'Поддержка',privacy:'Конфиденциальность',agreement:'Пользовательское соглашение',reset:'Сбросить прогресс',best:'ВЫГОДНО',coinshop:'Магазин монет',free:'Получить бесплатно',soon:'СКОРО',invite:'ПРИГЛАСИТЬ ДРУГА',invited:'Приглашено',received:'Получено',invitedList:'Приглашённые',dailyTitle:'Ежедневная награда',claim:'ПОЛУЧИТЬ',dayTasks:'Задания дня',soundDesc:'Буквы, победа, ошибка и награды',hapticDesc:'Нажатия, верный и неверный ответ',musicDesc:'Спокойная фоновая музыка',notifyState:'Награды и новые уровни · Разрешить',rulesDesc:'Как играть, монеты, XP и подсказки',privacyDesc:'Какие данные используются и зачем',resetDesc:'Уровни, XP и место в рейтинге',novice:'Новичок',knower:'Знаток',expert:'Эксперт',master:'Мастер',legend:'Легенда',place:'место',rulesTitle:'Правила игры',resetTitle:'Сбросить прогресс?',cancel:'Отмена',unranked:'вне рейтинга',supportDesc:'Связаться с поддержкой',supportText:'Контакты поддержки будут добавлены перед запуском.',dailyCopy:'Заходи каждый день и забирай награду.',claimed:'Награда получена ✓',alreadyDaily:'Сегодня награда уже получена.'},
en:{chapter:'Chapter 1',warm:'Warm-up',desc:'Simple words for a good start',levels:'levels',play:'PLAY',daily:'Daily reward',tasks:'Tasks',rating:'Leaderboard',home:'Home',chapters:'Chapters',friends:'Friends',shop:'Shop',settings:'Settings',language:'Language',sound:'Sound',vibration:'Haptics',music:'Music',notifications:'Notifications',rules:'Game rules',support:'Support',privacy:'Privacy',agreement:'Terms of use',reset:'Reset progress',best:'BEST VALUE',coinshop:'Coin shop',free:'Get for free',soon:'SOON',invite:'INVITE A FRIEND',invited:'Invited',received:'Earned',invitedList:'Invited friends',dailyTitle:'Daily reward',claim:'CLAIM',dayTasks:'Daily tasks',soundDesc:'Letters, wins, mistakes and rewards',hapticDesc:'Taps, correct and wrong answers',musicDesc:'Calm background music',notifyState:'Rewards and new levels · Allow',rulesDesc:'How to play, coins, XP and hints',privacyDesc:'What data is used and why',resetDesc:'Levels, XP and leaderboard position',novice:'Novice',knower:'Skilled',expert:'Expert',master:'Master',legend:'Legend',place:'place',rulesTitle:'Game rules',resetTitle:'Reset progress?',cancel:'Cancel',unranked:'unranked',supportDesc:'Contact support',supportText:'Support contacts will be added before launch.',dailyCopy:'Come back every day and claim your reward.',claimed:'Reward claimed ✓',alreadyDaily:'Today’s reward has already been claimed.'},
az:{chapter:'Fəsil 1',warm:'İsinmə',desc:'Yaxşı başlanğıc üçün sadə sözlər',levels:'səviyyə',play:'OYNA',daily:'Gündəlik mükafat',tasks:'Tapşırıqlar',rating:'Reytinq',home:'Ana səhifə',chapters:'Fəsillər',friends:'Dostlar',shop:'Mağaza',settings:'Ayarlar',language:'Dil',sound:'Səs',vibration:'Vibrasiya',music:'Musiqi',notifications:'Bildirişlər',rules:'Oyun qaydaları',support:'Dəstək',privacy:'Məxfilik',agreement:'İstifadəçi razılaşması',reset:'Tərəqqini sıfırla',best:'SƏRFƏLİ',coinshop:'Sikkə mağazası',free:'Pulsuz əldə et',soon:'TEZLİKLƏ',invite:'DOSTU DƏVƏT ET',invited:'Dəvət edilib',received:'Qazanılıb',invitedList:'Dəvət olunanlar',dailyTitle:'Gündəlik mükafat',claim:'GÖTÜR',dayTasks:'Günün tapşırıqları',soundDesc:'Hərflər, qələbə, səhv və mükafat səsləri',hapticDesc:'Toxunuş, düzgün və səhv cavab',musicDesc:'Sakit fon musiqisi',notifyState:'Mükafatlar və yeni səviyyələr · İcazə ver',rulesDesc:'Oyun, sikkələr, XP və ipucları',privacyDesc:'Hansı məlumatların niyə istifadə edilməsi',resetDesc:'Səviyyələr, XP və reytinq mövqeyi',novice:'Yeni başlayan',knower:'Bilici',expert:'Ekspert',master:'Usta',legend:'Əfsanə',place:'yer',rulesTitle:'Oyun qaydaları',resetTitle:'Tərəqqi sıfırlansın?',cancel:'Ləğv et',unranked:'reytinqdən kənar',supportDesc:'Dəstəklə əlaqə',supportText:'Dəstək əlaqələri istifadəyə verilməzdən əvvəl əlavə olunacaq.',dailyCopy:'Hər gün daxil ol və mükafatını götür.',claimed:'Mükafat alındı ✓',alreadyDaily:'Bugünkü mükafat artıq alınıb.'}
};
const THEMES={ru:{game:'Игровая',night:'Ночная',light:'Светлая',neon:'Неон',gold:'Золотая'},en:{game:'Game',night:'Night',light:'Light',neon:'Neon',gold:'Gold'},az:{game:'Oyun',night:'Gecə',light:'İşıqlı',neon:'Neon',gold:'Qızılı'}};
const LANGS={ru:'Русский',en:'English',az:'Azərbaycan dili'};
const getLang=()=>{try{return localStorage.getItem('pw.language')||''}catch{return''}};
const getTheme=()=>{try{return localStorage.getItem('pw.theme')||'game'}catch{return'game'}};
const lang=()=>getLang()||'ru';

const RULES={
ru:`<h3>Цель игры</h3><p>На экране четыре изображения. У них есть одно общее слово. Собери это слово из предложенных букв.</p><h3>Как отвечать</h3><p>Нажимай буквы по порядку. Нажатие на заполненную клетку возвращает букву обратно. Неверное слово автоматически очищается.</p><h3>Подсказки</h3><p>💡 открыть правильную букву — 50 🪙.<br>🪄 убрать до трёх лишних букв — 100 🪙.<br>Текстовая подсказка — 150 🪙.<br>🔀 перемешивание букв — бесплатно.</p><h3>Награды</h3><p>За первое прохождение уровня: +20 🪙 и +15 XP. Повторное прохождение награду не даёт. Ежедневная награда — +5 🪙. Дополнительные монеты можно получать за задания и приглашения друзей.</p><h3>XP и ранги</h3><p>0–399 — Новичок · 400–1499 — Знаток · 1500–2499 — Эксперт · 2500–3999 — Мастер · 4000+ — Легенда. XP не тратится и влияет на рейтинг.</p><h3>Друзья</h3><p>Если приглашённый по твоей ссылке игрок пройдёт 10 уровней, вы оба получите по 20 🪙.</p><h3>Язык</h3><p>Слова, буквы и текстовые подсказки соответствуют выбранному языку: Русский, English или Azərbaycan dili.</p>`,
en:`<h3>Goal</h3><p>Four images have one word in common. Build that word from the available letters.</p><h3>Answering</h3><p>Tap letters in order. Tap a filled slot to return a letter. A wrong word is cleared automatically.</p><h3>Hints</h3><p>💡 reveal a correct letter — 50 🪙.<br>🪄 remove up to three extra letters — 100 🪙.<br>Text hint — 150 🪙.<br>🔀 shuffle — free.</p><h3>Rewards</h3><p>First completion: +20 🪙 and +15 XP. Replays do not grant another reward. Daily reward: +5 🪙. Tasks and referrals can grant more coins.</p><h3>XP and ranks</h3><p>0–399 Novice · 400–1499 Skilled · 1500–2499 Expert · 2500–3999 Master · 4000+ Legend. XP is not spent and affects the leaderboard.</p><h3>Friends</h3><p>If a player joins through your referral and completes 10 levels, both of you receive 20 🪙.</p><h3>Language</h3><p>Words, letters and text hints follow the selected language: Русский, English or Azərbaycan dili.</p>`,
az:`<h3>Oyunun məqsədi</h3><p>Dörd şəkli birləşdirən bir söz var. Həmin sözü verilən hərflərdən düzəlt.</p><h3>Cavab vermək</h3><p>Hərflərə ardıcıllıqla toxun. Doldurulmuş xanaya toxunmaq hərfi geri qaytarır. Səhv söz avtomatik silinir.</p><h3>İpucları</h3><p>💡 düzgün hərfi açmaq — 50 🪙.<br>🪄 üçədək artıq hərfi silmək — 100 🪙.<br>Mətn ipucu — 150 🪙.<br>🔀 hərfləri qarışdırmaq — pulsuz.</p><h3>Mükafatlar</h3><p>Səviyyəni ilk dəfə keçdikdə +20 🪙 və +15 XP verilir. Təkrar keçid əlavə mükafat vermir. Gündəlik mükafat +5 🪙-dir.</p><h3>XP və rütbələr</h3><p>0–399 Yeni başlayan · 400–1499 Bilici · 1500–2499 Ekspert · 2500–3999 Usta · 4000+ Əfsanə. XP xərclənmir və reytinqə təsir edir.</p><h3>Dostlar</h3><p>Sənin dəvət linkinlə gələn oyunçu 10 səviyyə keçdikdə hər ikiniz 20 🪙 alırsınız.</p><h3>Dil</h3><p>Sözlər, hərflər və mətn ipucları seçilmiş dilə uyğun olur.</p>`
};
const RESET={
ru:'Будут удалены: прохождение всех уровней, XP и текущая позиция в рейтинге. Игра снова начнётся с уровня 1. Сохранённые подсказки уровней будут очищены. Монеты, покупки Telegram Stars, уже полученные ежедневные/реферальные награды и история платежей сохраняются, чтобы не потерять оплаченные покупки и не допустить повторного получения наград.',
en:'This removes all completed levels, XP and your current leaderboard position. The game starts again from level 1 and saved level hints are cleared. Coins, Telegram Stars purchases, already claimed daily/referral rewards and payment history are kept so paid purchases are not lost and rewards cannot be claimed twice.',
az:'Bütün keçilmiş səviyyələr, XP və cari reytinq mövqeyi silinəcək. Oyun yenidən 1-ci səviyyədən başlayacaq və saxlanmış ipucları təmizlənəcək. Ödənilmiş alışların itməməsi və mükafatların təkrar alınmaması üçün sikkələr, Telegram Stars alışları, artıq alınmış gündəlik/referral mükafatları və ödəniş tarixçəsi saxlanılır.'
};

function leagueName(p,l=lang()){const t=UI[l]||UI.ru;return p.xp>=4000?t.legend:p.xp>=2500?t.master:p.xp>=1500?t.expert:p.xp>=400?t.knower:t.novice}
function update(p){
 const l=lang(),t=UI[l]||UI.ru,name=pw.name(p);
 const rankText=p.rank>0?'#'+p.rank:'—';text('name',name);text('profileName',name);text('rankLabel',leagueName(p,l)+' · '+(p.rank>0?t.place+' #'+p.rank:t.unranked));text('profileRank',rankText);
 text('photoWordId',p.photoword_id);text('profileXp',p.xp);text('profileDone',p.completed_levels);text('profileUsername',p.username?'@'+p.username:'Username не указан');
 text('done',Math.min(20,p.completed_levels));$('progress').style.width=Math.min(100,p.completed_levels*5)+'%';
 const play=$('playLink'),next=Math.max(1,Math.min(10,p.current_level||1));play.href='./game.html?level='+next;
 if((p.current_level||1)>10)play.innerHTML=(l==='ru'?'УРОВНИ 1–10 ПРОЙДЕНЫ':l==='en'?'LEVELS 1–10 COMPLETED':'1–10 SƏVİYYƏ KEÇİLİB')+' <span>✓</span>';
 for(const id of ['avatar','profileAvatar'])text(id,name.charAt(0).toUpperCase());text('myRank','#'+p.rank);text('myXp',p.xp+' XP');
}
function applyTheme(theme){if(!['game','night','light','neon','gold'].includes(theme))theme='game';document.documentElement.dataset.theme=theme;try{localStorage.setItem('pw.theme',theme)}catch{};text('themeCurrent',(THEMES[lang()]||THEMES.ru)[theme]);document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('selected',b.dataset.theme===theme))}
function applyHomeLanguage(l){
 const t=UI[l]||UI.ru;document.documentElement.lang=l;const q=s=>document.querySelector(s),qa=s=>document.querySelectorAll(s);
 q('.chapter-title small').textContent=t.chapter;q('.chapter-title h1').textContent=t.warm;q('.chapter-title p').textContent=t.desc;
 const count=q('.count');count.childNodes[count.childNodes.length-1].textContent=' / 20 '+t.levels;
 if($('playLink')&&!$('playLink').textContent.includes('1–10'))$('playLink').innerHTML=t.play+' <span>▶</span>';
 const sh=qa('.shortcuts button b');if(sh[0])sh[0].textContent=t.daily;if(sh[1])sh[1].textContent=t.tasks;if(sh[2])sh[2].textContent=t.rating;
 const nav=qa('nav small');[t.home,t.chapters,t.rating,t.friends,t.shop].forEach((v,i)=>{if(nav[i])nav[i].textContent=v});
 text('settingsTitle',t.settings);$('languageBtn').querySelector('b').textContent=t.language;
 const rows=qa('#settingsModal .settingrow b');if(rows[0])rows[0].textContent=t.sound;if(rows[1])rows[1].textContent=t.vibration;if(rows[2])rows[2].textContent=t.music;
 text('soundDesc',t.soundDesc);text('hapticDesc',t.hapticDesc);text('musicDesc',t.musicDesc);$('notificationsBtn').querySelector('b').textContent=t.notifications;text('supportDesc',t.supportDesc);text('supportTitle',t.support);text('supportText',t.supportText);text('dailyCopy',t.dailyCopy);
 if(!localStorage.getItem('pw.writeAccess'))text('notificationsState',t.notifyState);
 $('rulesBtn').querySelector('b').textContent=t.rules;$('rulesBtn').querySelector('small').textContent=t.rulesDesc;
 $('privacyLink').querySelector('b').textContent=t.privacy;$('privacyLink').querySelector('small').textContent=t.privacyDesc;
 $('termsLink').querySelector('b').textContent=t.agreement;$('resetProgressBtn').querySelector('b').textContent=t.reset;$('resetProgressBtn').querySelector('small').textContent=t.resetDesc;
 text('rulesTitle',t.rulesTitle);$('rulesBody').innerHTML=RULES[l]||RULES.ru;text('resetTitle',t.resetTitle);text('resetBody',RESET[l]||RESET.ru);text('cancelReset',t.cancel);
 if($('friendsModal')){const x=$('friendsModal');x.querySelector('h2').textContent=t.friends;const st=x.querySelectorAll('.friendstats small');if(st[0])st[0].textContent=t.invited;if(st[1])st[1].textContent=t.received;text('inviteFriend',t.invite);x.querySelector('h3').textContent=t.invitedList}
 if($('shopModal')){$('shopModal').querySelector('h2').textContent=t.coinshop;const best=$('shopModal').querySelector('.best i');if(best)best.textContent=t.best;$('shopModal').querySelector('.adreward b').textContent=t.free;text('watchAd',t.soon)}
 if($('dailyModal')){$('dailyModal').querySelector('h2').textContent=t.dailyTitle;text('claimDaily',t.claim)}
 if($('tasksModal'))$('tasksModal').querySelector('h2').textContent='🎯 '+t.dayTasks;
 text('themeCurrent',(THEMES[l]||THEMES.ru)[getTheme()]);text('languageCurrent',LANGS[l]);
 if(pw.player)update(pw.player);
}
function setLang(l){if(!LANGS[l])l='ru';try{localStorage.setItem('pw.language',l)}catch{};document.querySelectorAll('[data-language]').forEach(b=>b.classList.toggle('selected',b.dataset.language===l));applyHomeLanguage(l)}
function persistPrefs(){try{localStorage.setItem('photoword-prefs',JSON.stringify(pw.prefs))}catch{}}

const initial=getLang();applyTheme(getTheme());if(initial)setLang(initial);else{setTimeout(()=>open('languageModal'),250);applyHomeLanguage('ru')}

$('settingsBtn').onclick=()=>open('settingsModal');$('languageBtn').onclick=()=>{close('settingsModal');setTimeout(()=>open('languageModal'),0)};$('themeBtn').onclick=()=>{close('settingsModal');setTimeout(()=>open('themeModal'),0)};
document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{applyTheme(b.dataset.theme);close('themeModal')});
document.querySelectorAll('[data-language]').forEach(b=>b.onclick=()=>{setLang(b.dataset.language);close('languageModal');pw.status(b.dataset.language==='ru'?'Язык игры: Русский':b.dataset.language==='en'?'Game language: English':'Oyun dili: Azərbaycan dili')});
$('profileBtn').onclick=()=>open('profileModal');$('supportBtn').onclick=()=>{close('settingsModal');setTimeout(()=>open('supportModal'),0)};$('dailyRewardBtn').onclick=()=>open('dailyModal');$('tasksBtn').onclick=()=>open('tasksModal');$('shopOffer').onclick=()=>open('shopModal');$('shopNav').onclick=()=>open('shopModal');
$('rulesBtn').onclick=()=>{close('settingsModal');applyHomeLanguage(lang());setTimeout(()=>open('rulesModal'),0)};$('resetProgressBtn').onclick=()=>{close('settingsModal');resetArmed=false;applyHomeLanguage(lang());$('confirmReset').textContent=lang()==='en'?'RESET PROGRESS':lang()==='az'?'TƏRƏQQİNİ SIFIRLA':'СБРОСИТЬ ПРОГРЕСС';setTimeout(()=>open('resetModal'),0)};

$('notificationsBtn').onclick=()=>{
 const tg=window.Telegram?.WebApp;
 if(!tg?.requestWriteAccess){pw.status(lang()==='en'?'Open the game inside Telegram to enable notifications.':lang()==='az'?'Bildirişləri aktivləşdirmək üçün oyunu Telegram daxilində açın.':'Открой игру внутри Telegram, чтобы разрешить уведомления.');return}
 tg.requestWriteAccess(allowed=>{
   if(allowed){try{localStorage.setItem('pw.writeAccess','1')}catch{};text('notificationsState',lang()==='en'?'Allowed':lang()==='az'?'İcazə verilib':'Разрешены');pw.status(lang()==='en'?'Notifications allowed.':lang()==='az'?'Bildirişlərə icazə verildi.':'Уведомления разрешены.')}
   else pw.status(lang()==='en'?'Permission was not granted.':lang()==='az'?'İcazə verilmədi.':'Разрешение не предоставлено.');
 });
};

for(const [id,key] of [['soundToggle','sound'],['hapticToggle','haptic']]){
 $(id).checked=Boolean(pw.prefs[key]);$(id).onchange=()=>{pw.prefs[key]=$(id).checked;persistPrefs();if(key==='sound')pw.sfx('tap')};
}
$('musicToggle').checked=Boolean(pw.prefs.music);$('musicToggle').onchange=()=>pw.setMusic($('musicToggle').checked);

let resetArmed=false,resetTimer=null;
$('confirmReset').onclick=async()=>{
 if(!resetArmed){resetArmed=true;clearTimeout(resetTimer);$('confirmReset').textContent=lang()==='en'?'TAP AGAIN TO CONFIRM':lang()==='az'?'TƏSDİQ ÜÇÜN YENƏ TOXUN':'НАЖМИ ЕЩЁ РАЗ ДЛЯ ПОДТВЕРЖДЕНИЯ';resetTimer=setTimeout(()=>{resetArmed=false},5000);return}
 $('confirmReset').disabled=true;
 try{
   const p=await pw.api('reset_progress');
   try{for(let i=sessionStorage.length-1;i>=0;i--){const k=sessionStorage.key(i);if(k&&k.startsWith('pw.hints.'))sessionStorage.removeItem(k)}}catch{}
   update(p);close('resetModal');pw.sfx('success');pw.status(lang()==='en'?'Progress reset. Game starts from level 1.':lang()==='az'?'Tərəqqi sıfırlandı. Oyun 1-ci səviyyədən başlayır.':'Прогресс сброшен. Игра начинается с уровня 1.');
 }catch(e){pw.status(e.message)}
 finally{$('confirmReset').disabled=false;resetArmed=false}
};

async function loadFriends(){
 open('friendsModal');const list=$('friendsList');list.textContent=lang()==='en'?'Loading…':lang()==='az'?'Yüklənir…':'Загрузка…';
 try{
   const data=await pw.actionRequest('friends');text('friendsInvited',data.invited||0);text('friendsReward',(data.total_reward||0)+' 🪙');list.replaceChildren();
   if(!data.friends?.length){list.textContent=lang()==='en'?'No invited friends yet.':lang()==='az'?'Hələ dəvət olunan yoxdur.':'Пока никого нет.';return}
   data.friends.forEach(f=>{const row=document.createElement('div');row.className='friendrow'+(f.rewarded?' rewarded':'');const who=document.createElement('div'),n=document.createElement('b'),sub=document.createElement('small');n.textContent=[f.first_name,f.last_name].filter(Boolean).join(' ')||'Player';sub.textContent=f.username?'@'+f.username:f.photoword_id;who.append(n,sub);const prog=document.createElement('div'),label=document.createElement('span'),track=document.createElement('em'),bar=document.createElement('i');prog.className='friendprogress';label.textContent=f.rewarded?(lang()==='en'?'Reward received':lang()==='az'?'Mükafat alınıb':'Награда получена'):f.completed_levels+' / 10';bar.style.width=Math.min(100,(f.completed_levels||0)*10)+'%';track.append(bar);prog.append(label,track);row.append(who,prog);list.append(row)});
 }catch(e){list.textContent=e.message}
}
$('friendsNav').onclick=loadFriends;
$('inviteFriend').onclick=async()=>{try{const p=await pw.login(),start='ref_'+p.photoword_id,link='https://t.me/PhotoWordBot?startapp='+encodeURIComponent(start),share='https://t.me/share/url?url='+encodeURIComponent(link);window.Telegram?.WebApp?.openTelegramLink?.(share)}catch(e){pw.status(e.message)}};

function tForDaily(){return UI[lang()]||UI.ru}

document.querySelectorAll('[data-pack]').forEach(b=>b.onclick=async()=>{if(b.disabled)return;b.disabled=true;try{const result=await pw.actionRequest('create_invoice',{pack:b.dataset.pack}),tg=window.Telegram?.WebApp;if(!tg?.openInvoice)throw new Error('Telegram required');tg.openInvoice(result.invoice_url,status=>{b.disabled=false;if(status==='paid'){pw.status('Payment confirmed');setTimeout(()=>pw.login(true).catch(()=>{}),1200)}})}catch(e){pw.status(e.message);b.disabled=false}});
$('claimDaily').onclick=async()=>{try{const p=await pw.api('claim_daily');update(p);text('dailyStreak',(lang()==='en'?'Streak: ':lang()==='az'?'Seriya: ':'Серия: ')+(p.daily_streak||1));pw.sfx('coin');pw.status('+5 🪙');text('claimDaily',tForDaily().claimed);$('claimDaily').disabled=true;setTimeout(()=>close('dailyModal'),900)}catch(e){if(String(e.message).includes('уже')||String(e.message).includes('already')){text('claimDaily',tForDaily().claimed);$('claimDaily').disabled=true;pw.status(tForDaily().alreadyDaily)}else pw.status(e.message)}};
document.querySelectorAll('[data-task]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{const p=await pw.api('claim_task',{taskKey:b.dataset.task});update(p);b.textContent='✓';pw.sfx('coin')}catch(e){pw.status(e.message);b.disabled=false}});

document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>close(b.dataset.close));
document.querySelectorAll('.modal').forEach(m=>m.onclick=e=>{if(e.target===m)close(m.id)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal').forEach(m=>m.hidden=true)});
$('homeNav').onclick=()=>screen('home');$('ratingBack').onclick=()=>screen('home');

let requestId=0;
async function rating(){
 screen('ratingScreen');const id=++requestId,board=$('leaderboard');board.textContent='…';
 try{if(pw.hasAuth)await pw.login().catch(e=>pw.status(e.message));const rows=await pw.leaderboard();if(id!==requestId)return;board.replaceChildren();if(!rows.length)board.textContent='—';rows.forEach(p=>{const row=document.createElement('div');row.className='rankrow'+(p.photoword_id===pw.player?.photoword_id?' me':'');const rank=document.createElement('b');rank.textContent='#'+p.rank;const person=document.createElement('div'),title=document.createElement('strong'),sub=document.createElement('small');title.textContent=pw.name(p);sub.textContent=p.photoword_id;person.append(title,sub);const xp=document.createElement('b');xp.textContent=p.xp+' XP';row.append(rank,person,xp);board.append(row)})}catch(e){board.textContent=e.message}
}
['ratingNav','ratingShortcut','refreshRating'].forEach(id=>$(id).onclick=rating);
const info={ru:{'Главы':'Уровни 1–10'},en:{'Главы':'Levels 1–10'},az:{'Главы':'1–10 səviyyələr'}};
document.querySelectorAll('[data-info]').forEach(b=>b.onclick=()=>{text('infoTitle',b.dataset.info);text('infoText',(info[lang()]||info.ru)[b.dataset.info]||b.dataset.info);open('infoModal')});

window.addEventListener('pw:player',e=>update(e.detail));
pw.login().then(async()=>{pw.status(lang()==='en'?'Profile synced':lang()==='az'?'Profil sinxronlaşdırıldı':'Профиль синхронизирован');try{const start=window.Telegram?.WebApp?.initDataUnsafe?.start_param||'';if(start.indexOf('ref_PW-')===0)await pw.api('register_referral',{referrer:start.slice(4)})}catch{}}).catch(e=>pw.status(e.message));
})();