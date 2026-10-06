(() => {
'use strict';
const $=id=>document.getElementById(id),pw=window.PW;
const copy={
ru:{entry:'Дуэли',desc:'60 секунд · взнос 25–500 🪙',title:'Дуэль',subtitle:'Кто отгадает больше за минуту?',setup:'Создать комнату',rules:'Одинаковые задания, 60 секунд. Победитель получает 90% общего банка. При ничьей взносы возвращаются.',stake:'Взнос каждого',pot:(a,b)=>'Банк '+a+' 🪙 · победителю '+b+' 🪙',create:'СОЗДАТЬ КОМНАТУ',waiting:'Ожидание соперника',invite:s=>'Взнос '+s+' 🪙 удержан. Приглашение действует 5 минут.',share:'ПОДЕЛИТЬСЯ ПРИГЛАШЕНИЕМ',cancel:'ОТМЕНИТЬ И ВЕРНУТЬ ВЗНОС',join:'Приглашение на дуэль',joinInfo:s=>'Взнос каждого '+s+' 🪙. Игра длится 60 секунд.',accept:'ПРИНЯТЬ ВЫЗОВ',back:'НА ГЛАВНУЮ',you:'Ты',friend:'Друг',clear:'СБРОСИТЬ БУКВЫ',skip:n=>'ПРОПУСТИТЬ · '+n,skipped:'Слово пропущено',soon:'Старт через ',ready:'Отгадывай слова!',wrong:'Неверно · попробуй снова',correct:'Верно! +1',wait:'Ожидаем итог...',won:'Победа!',lost:'Соперник победил',draw:'Ничья',cancelled:'Взнос возвращён',result:(a,b,p)=>'Счёт '+a+':'+b+' · начислено '+p+' 🪙',drawResult:s=>'Ставка '+s+' 🪙 возвращена каждому.',expired:'Приглашение истекло. Взнос возвращён.',notFound:'Приглашение не найдено или уже закрыто.',own:'Это твоё приглашение.',busy:'У тебя уже есть открытая дуэль.',waitError:'Подожди секунду перед новой попыткой.',shareText:s=>'Вызываю тебя на дуэль в PhotoWord! Взнос '+s+' 🪙, 60 секунд. Примешь вызов?',needCoins:'Недостаточно монет для этой ставки.'},
en:{entry:'Duels',desc:'60 seconds · 25–500 🪙 entry',title:'Duel',subtitle:'Who can solve more in one minute?',setup:'Create a room',rules:'Same puzzles, 60 seconds. Winner receives 90% of the pot. A tie refunds both entries.',stake:'Entry per player',pot:(a,b)=>'Pot '+a+' 🪙 · winner gets '+b+' 🪙',create:'CREATE ROOM',waiting:'Waiting for opponent',invite:s=>'Your '+s+' 🪙 entry is held. Invite expires in 5 minutes.',share:'SHARE INVITATION',cancel:'CANCEL AND REFUND',join:'Duel invitation',joinInfo:s=>'Each player enters for '+s+' 🪙. Play for 60 seconds.',accept:'ACCEPT CHALLENGE',back:'HOME',you:'You',friend:'Friend',clear:'CLEAR LETTERS',skip:n=>'SKIP · '+n,skipped:'Word skipped',soon:'Starts in ',ready:'Solve the words!',wrong:'Wrong · try again',correct:'Correct! +1',wait:'Waiting for result...',won:'You won!',lost:'Opponent won',draw:'Draw',cancelled:'Entry refunded',result:(a,b,p)=>'Score '+a+':'+b+' · credited '+p+' 🪙',drawResult:s=>s+' 🪙 returned to each player.',expired:'Invite expired. Entry refunded.',notFound:'Invite not found or already closed.',own:'This is your invitation.',busy:'You already have an open duel.',waitError:'Wait a moment before trying again.',shareText:s=>'I challenge you to a PhotoWord duel! '+s+' 🪙 entry, 60 seconds. Join me!',needCoins:'Not enough coins for this entry.'},
az:{entry:'Duellər',desc:'60 saniyə · 25–500 🪙 giriş',title:'Duel',subtitle:'Bir dəqiqədə kim daha çox söz tapacaq?',setup:'Otaq yarat',rules:'Eyni tapmacalar, 60 saniyə. Qalib ümumi bankın 90%-ni alır. Bərabərlikdə giriş haqları qaytarılır.',stake:'Hər oyunçunun girişi',pot:(a,b)=>'Bank '+a+' 🪙 · qalibə '+b+' 🪙',create:'OTAQ YARAT',waiting:'Rəqib gözlənilir',invite:s=>s+' 🪙 saxlanılır. Dəvət 5 dəqiqə qüvvədədir.',share:'DƏVƏTİ PAYLAŞ',cancel:'LƏĞV ET VƏ QAYTAR',join:'Duel dəvəti',joinInfo:s=>'Hər oyunçu '+s+' 🪙 ödəyir. Oyun 60 saniyə çəkir.',accept:'QƏBUL ET',back:'ANA SƏHİFƏ',you:'Sən',friend:'Dost',clear:'HƏRFLƏRİ SİL',skip:n=>'KEÇ · '+n,skipped:'Söz keçildi',soon:'Başlayır: ',ready:'Sözləri tap!',wrong:'Yanlışdır · yenidən yoxla',correct:'Düzdür! +1',wait:'Nəticə gözlənilir...',won:'Qələbə!',lost:'Rəqib qalib gəldi',draw:'Bərabərlik',cancelled:'Giriş qaytarıldı',result:(a,b,p)=>'Hesab '+a+':'+b+' · əlavə edildi '+p+' 🪙',drawResult:s=>s+' 🪙 hər oyunçuya qaytarıldı.',expired:'Dəvət vaxtı bitdi. Giriş qaytarıldı.',notFound:'Dəvət tapılmadı və ya bağlanıb.',own:'Bu sənin dəvətindir.',busy:'Artıq açıq duelin var.',waitError:'Bir az gözlə, sonra yenidən yoxla.',shareText:s=>'Səni PhotoWord duelinə çağırıram! Giriş '+s+' 🪙, 60 saniyə. Qoşul!',needCoins:'Bu giriş üçün kifayət qədər sikkə yoxdur.'}
};
Object.assign(copy.ru,{rematch:'РЕВАНШ',rematchTitle:'Реванш с тем же другом',rematchInfo:'Выбери взнос. Монеты спишутся после подтверждения вызова; друг оплатит свой взнос при принятии.',rematchConfirm:'ПРЕДЛОЖИТЬ РЕВАНШ',resultBack:'НАЗАД К ИТОГУ',offerTitle:'Друг зовёт на реванш',offerInfo:s=>'Взнос '+s+' 🪙 с каждого. Прими вызов, чтобы начать новый матч.',acceptOffer:s=>'ПРИНЯТЬ РЕВАНШ · '+s+' 🪙',privateInvite:'Это приглашение для другого игрока.',notFinished:'Сначала дождись завершения дуэли.'});
Object.assign(copy.en,{rematch:'REMATCH',rematchTitle:'Play the same friend again',rematchInfo:'Choose an entry. Your coins are held when you confirm; your friend pays on acceptance.',rematchConfirm:'OFFER REMATCH',resultBack:'BACK TO RESULT',offerTitle:'Your friend wants a rematch',offerInfo:s=>'Each player enters for '+s+' 🪙. Accept to start another match.',acceptOffer:s=>'ACCEPT REMATCH · '+s+' 🪙',privateInvite:'This invitation is for another player.',notFinished:'Wait for the duel to finish first.'});
Object.assign(copy.az,{rematch:'TƏKRAR OYNA',rematchTitle:'Eyni dostla yenidən oyna',rematchInfo:'Giriş haqqını seç. Təsdiqdən sonra sikkələrin saxlanılır; dostun qəbul edəndə öz payını ödəyir.',rematchConfirm:'TƏKRAR OYUN TƏKLİF ET',resultBack:'NƏTİCƏYƏ QAYIT',offerTitle:'Dostun yenidən oynamaq istəyir',offerInfo:s=>'Hər oyunçu '+s+' 🪙 ödəyir. Yeni oyun üçün dəvəti qəbul et.',acceptOffer:s=>'QƏBUL ET · '+s+' 🪙',privateInvite:'Bu dəvət başqa oyunçu üçündür.',notFinished:'Əvvəlcə duelin bitməsini gözlə.'});
Object.assign(copy.ru,{rooms:'Открытые комнаты',roomsEmpty:'Пока нет открытых комнат',refreshRooms:'Обновить комнаты',joinRoom:'ВОЙТИ',roomTime:n=>'ещё '+n+' мин',openRoom:'СОЗДАТЬ ОТКРЫТУЮ КОМНАТУ',privateRoom:'СОЗДАТЬ ПО ССЫЛКЕ',openInfo:s=>'Открытая комната · взнос '+s+' 🪙 удержан. Ожидаем соперника до 5 минут.'});
Object.assign(copy.en,{rooms:'Open rooms',roomsEmpty:'No open rooms yet',refreshRooms:'Refresh rooms',joinRoom:'JOIN',roomTime:n=>n+' min left',openRoom:'CREATE OPEN ROOM',privateRoom:'CREATE BY LINK',openInfo:s=>'Open room · '+s+' 🪙 held. Waiting up to 5 minutes for an opponent.'});
Object.assign(copy.az,{rooms:'Açıq otaqlar',roomsEmpty:'Hələ açıq otaq yoxdur',refreshRooms:'Otaqları yenilə',joinRoom:'QOŞUL',roomTime:n=>n+' dəq qalıb',openRoom:'AÇIQ OTAQ YARAT',privateRoom:'LİNKLƏ YARAT',openInfo:s=>'Açıq otaq · '+s+' 🪙 saxlanılır. Rəqib 5 dəqiqəyə qədər gözlənilir.'});
copy.ru.reconnecting='Восстанавливаем соединение…';copy.en.reconnecting='Reconnecting…';copy.az.reconnecting='Bağlantı bərpa olunur…';
Object.assign(copy.ru,{stats:'СТАТИСТИКА',statsTitle:'Статистика дуэлей',statsPlayed:'Матчи',statsWins:'Победы',statsLosses:'Поражения',statsDraws:'Ничьи',statsBest:'Лучший счёт',statsNet:'Итог по монетам',statsRecent:'Последние матчи',statsBack:'НАЗАД К ДУЭЛЯМ',statsLoading:'Загружаю статистику…',statsEmpty:'Дуэлей пока нет',statsOpponent:'Без соперника',statsRefund:'Возврат взноса',statsStake:'Взнос',statsScore:'Счёт'});
Object.assign(copy.en,{stats:'STATISTICS',statsTitle:'Duel statistics',statsPlayed:'Matches',statsWins:'Wins',statsLosses:'Losses',statsDraws:'Draws',statsBest:'Best score',statsNet:'Coin balance',statsRecent:'Recent matches',statsBack:'BACK TO DUELS',statsLoading:'Loading statistics…',statsEmpty:'No duels yet',statsOpponent:'No opponent',statsRefund:'Entry refunded',statsStake:'Entry',statsScore:'Score'});
Object.assign(copy.az,{stats:'STATİSTİKA',statsTitle:'Duel statistikası',statsPlayed:'Oyunlar',statsWins:'Qələbələr',statsLosses:'Məğlubiyyətlər',statsDraws:'Bərabərliklər',statsBest:'Ən yaxşı nəticə',statsNet:'Sikkə balansı',statsRecent:'Son oyunlar',statsBack:'DUELLƏRƏ QAYIT',statsLoading:'Statistika yüklənir…',statsEmpty:'Hələ duel yoxdur',statsOpponent:'Rəqib yoxdur',statsRefund:'Giriş qaytarıldı',statsStake:'Giriş',statsScore:'Hesab'});
const friendCopy={
ru:{pick:'Выбрать друга',add:'ДОБАВИТЬ',hint:'Добавь игрока по PhotoWord ID. Он подтвердит заявку.',section:'Игровые друзья',referral:'Приглашения по ссылке',none:'Пока нет друзей. Узнай PhotoWord ID игрока в его профиле.',incoming:'Хочет дружить',outgoing:'Заявка отправлена',accept:'ПРИНЯТЬ',remove:'УДАЛИТЬ',challenge:'ВЫЗВАТЬ',selected:'ВЫЗВАТЬ ДРУГА',addAfter:'ДОБАВИТЬ В ДРУЗЬЯ',sent:'Заявка отправлена',accepted:'Теперь вы друзья',invite:'Вызов от ',pickHint:'Выбери друга и взнос либо создай ссылку ниже.',noFriend:'Выбери друга',notFound:'Игрок или заявка не найдены.',self:'Нельзя добавить себя.',locked:'Друг ещё не принял заявку.',sentTo:(name,stake)=>'Вызов отправлен: '+name+'. Взнос '+stake+' 🪙 удержан на 5 минут.'},
en:{pick:'Choose a friend',add:'ADD',hint:'Add a player by PhotoWord ID. They will confirm your request.',section:'Game friends',referral:'Link invitations',none:'No friends yet. Find their PhotoWord ID in their profile.',incoming:'Wants to be friends',outgoing:'Request sent',accept:'ACCEPT',remove:'REMOVE',challenge:'CHALLENGE',selected:'CHALLENGE FRIEND',addAfter:'ADD FRIEND',sent:'Request sent',accepted:'You are now friends',invite:'Challenge from ',pickHint:'Choose a friend and entry, or create a link below.',noFriend:'Choose a friend',notFound:'Player or request not found.',self:'You cannot add yourself.',locked:'Friend has not accepted yet.',sentTo:(name,stake)=>'Challenge sent to '+name+'. '+stake+' 🪙 held for 5 minutes.'},
az:{pick:'Dost seç',add:'ƏLAVƏ ET',hint:'Oyunçunu PhotoWord ID ilə əlavə et. O, sorğunu təsdiqləyəcək.',section:'Oyun dostları',referral:'Linklə dəvətlər',none:'Hələ dost yoxdur. Oyunçunun PhotoWord ID-sini profilindən öyrən.',incoming:'Dost olmaq istəyir',outgoing:'Sorğu göndərilib',accept:'QƏBUL ET',remove:'SİL',challenge:'DUELƏ ÇAĞIR',selected:'DOSTU ÇAĞIR',addAfter:'DOST ƏLAVƏ ET',sent:'Sorğu göndərildi',accepted:'İndi dostsunuz',invite:'Çağırış: ',pickHint:'Dostu və giriş haqqını seç və ya link yarat.',noFriend:'Dost seç',notFound:'Oyunçu və ya sorğu tapılmadı.',self:'Özünü əlavə edə bilməzsən.',locked:'Dostun hələ sorğunu qəbul etməyib.',sentTo:(name,stake)=>'Çağırış göndərildi: '+name+'. '+stake+' 🪙 5 dəqiqə saxlanılır.'}}
Object.assign(friendCopy.ru,{popupTitle:'Друг вызывает на дуэль!',popupText:(name,stake)=>name+' приглашает тебя сыграть. Взнос: '+stake+' 🪙 с каждого.',popupExpiry:'У тебя есть 5 минут, чтобы принять вызов.',popupOpen:'ОТКРЫТЬ ВЫЗОВ',popupLater:'ПОЗЖЕ'});
Object.assign(friendCopy.en,{popupTitle:'A friend challenges you!',popupText:(name,stake)=>name+' invites you to play. Entry: '+stake+' 🪙 each.',popupExpiry:'You have 5 minutes to accept.',popupOpen:'OPEN CHALLENGE',popupLater:'LATER'});
Object.assign(friendCopy.az,{popupTitle:'Dostun səni duelə çağırır!',popupText:(name,stake)=>name+' səni oyuna dəvət edir. Giriş: hərəyə '+stake+' 🪙.',popupExpiry:'Qəbul etmək üçün 5 dəqiqən var.',popupOpen:'ÇAĞIRIŞI AÇ',popupLater:'SONRA'});
const ft=()=>friendCopy[language()]||friendCopy.ru;
let friends=[],selectedFriend='',pendingHomeOffer=null,dismissedOfferCode='',homeOfferRequesting=false,rooms=[],roomPoll=null,roomsRequesting=false,statsReturn='duelSetup',statsReq=0,statsData=null;
const language=()=>{try{return localStorage.getItem('pw.language')||'ru'}catch{return'ru'}};
const t=()=>copy[language()]||copy.ru;
const chapterTitles={
 ru:['','Новичок','Любитель','Знаток','Опытный','Эксперт','Профессионал','Мастер','Виртуоз','Легенда','Мастер слов','Исследователь','Хранитель знаний'],
 en:['','Novice','Amateur','Adept','Experienced','Expert','Professional','Master','Virtuoso','Legend','Word Master','Explorer','Keeper of Knowledge'],
 az:['','Yeni başlayan','Həvəskar','Bilici','Təcrübəli','Ekspert','Peşəkar','Usta','Virtuoz','Əfsanə','Söz ustası','Tədqiqatçı','Bilik qoruyucusu']
};
function playerTitle(levels){const finished=[20,50,90,130,180,230,280,330,380,430,480,530].filter(end=>Number(levels||0)>=end).length;return(chapterTitles[language()]||chapterTitles.ru)[Math.max(1,finished)]}
function frameAvatar(parent,id,name,frame){let e=document.getElementById(id);if(!e){e=document.createElement('span');e.id=id;e.className='frame-avatar duel-frame-avatar';e.setAttribute('aria-hidden','true');parent.prepend(e)}e.textContent=(name||'P').charAt(0).toUpperCase();window.PWFrames?.decorate?.(e,frame)}
function paintRoomHost(d){$('duelRoomHost').hidden=!d?.creator;if(!d?.creator)return;$('duelRoomHostName').textContent=d.my_name||t().you;$('duelRoomHostTitle').textContent=playerTitle(d.my_completed_levels);frameAvatar($('duelRoomHost'),'duelHostAvatar',d.my_name,d.my_frame)}
let wrongTimer=null,submitTimer=null,code='',duel=null,preview=null,incomingOffer=null,requesting=false,offerRequesting=false,answering=false,poll=null,tick=null,offerPoll=null,offset=0,questionId=null,chosen=[],disabled=false,lastStatus='',answerEpoch=0,stateSeq=0,stateStarted=0,lastSyncAt=0;
const matchKey='pw.duel.current';
function savedMatch(){try{const d=JSON.parse(localStorage.getItem(matchKey));if(d&&/^[A-F0-9]{16}$/.test(d.code)&&Date.now()-d.at<86400000)return d.code;localStorage.removeItem(matchKey)}catch{}return''}
function rememberMatch(matchCode){try{localStorage.setItem(matchKey,JSON.stringify({code:matchCode,at:Date.now()}))}catch{}}
function forgetMatch(){try{localStorage.removeItem(matchKey)}catch{}}
const reactions={laugh:'😂',cool:'😎',fire:'🔥',clap:'👏',wow:'😮',heart:'❤️',thinking:'🤔',strong:'💪'};
let reactionMatch='',reactionSeen={my:null,their:null},reactionTimers={my:null,their:null},reacting=false,pendingReaction='',reactionPoll=null,reactionRequesting=false;
function closeReactions(){$('duelReactionPicker').hidden=true;$('duelYouLabel').setAttribute('aria-expanded','false')}
function paintNames(d){frameAvatar($('duelYouLabel').parentElement,'duelYouAvatar',d?.my_name,d?.my_frame);frameAvatar($('duelFriendLabel').parentElement,'duelTheirAvatar',d?.their_name,d?.their_frame);$('duelYouLabel').textContent=d?.my_name||t().you;$('duelFriendLabel').textContent=d?.their_name||t().friend;$('duelYouLabel').setAttribute('aria-label',$('duelYouLabel').textContent+' · '+({ru:'выбрать реакцию',en:'choose a reaction',az:'reaksiya seç'}[language()]||'выбрать реакцию'))}
function paintReaction(side,key,at){
 const node=$(side==='my'?'duelYouReaction':'duelFriendReaction');
 if(!at||reactionSeen[side]===at)return;
 if(side==='my'&&pendingReaction===key){pendingReaction='';reactionSeen.my=at;return}
 reactionSeen[side]=at;clearTimeout(reactionTimers[side]);node.textContent='';
 if(!Object.hasOwn(reactions,key)||Date.now()+offset-Date.parse(at)>8000)return;
 node.textContent=reactions[key];node.classList.remove('pop');void node.offsetWidth;node.classList.add('pop');
 reactionTimers[side]=setTimeout(()=>{node.textContent='';node.classList.remove('pop')},2600);
}
function paintReactions(d){
 if(reactionMatch!==d.code){reactionMatch=d.code;reactionSeen={my:null,their:null};for(const side of ['my','their']){clearTimeout(reactionTimers[side]);$(side==='my'?'duelYouReaction':'duelFriendReaction').textContent=''}}
 paintReaction('my',d.my_reaction,d.my_reaction_at);paintReaction('their',d.their_reaction,d.their_reaction_at);
}
const reactionPicker=$('duelReactionPicker');
for(const [key,emoji] of Object.entries(reactions)){const button=document.createElement('button');button.type='button';button.textContent=emoji;button.setAttribute('aria-label',key);button.onclick=async()=>{if(reacting||duel?.status!=='active')return;closeReactions();reacting=true;pendingReaction=key;const match=code;const node=$('duelYouReaction');clearTimeout(reactionTimers.my);node.textContent=emoji;node.classList.remove('pop');void node.offsetWidth;node.classList.add('pop');reactionTimers.my=setTimeout(()=>{node.textContent='';node.classList.remove('pop')},2600);try{await call('react',{code:match,emoji:key})}catch(e){if(code===match){pendingReaction='';error(e)}}finally{reacting=false}};reactionPicker.append(button)}
$('duelYouLabel').onclick=()=>{if(duel?.status!=='active')return;reactionPicker.hidden=!reactionPicker.hidden;$('duelYouLabel').setAttribute('aria-expanded',String(!reactionPicker.hidden))};
const panels=['duelSetup','duelStats','duelRematchSetup','duelInvite','duelJoin','duelGame','duelResult'];
function show(id){const changed=$(id).hidden||!$('duelScreen').classList.contains('active');for(const p of panels)$(p).hidden=p!==id;document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('active',e.id==='duelScreen'));if(changed){pw.status('');window.scrollTo(0,0)}}
function home(){if(duel&&['finished','cancelled'].includes(duel.status))forgetMatch();stateSeq++;requesting=false;closeReactions();clearInterval(poll);clearInterval(tick);clearInterval(offerPoll);clearInterval(roomPoll);clearInterval(reactionPoll);poll=tick=offerPoll=roomPoll=reactionPoll=null;document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('active',e.id==='home'));window.scrollTo(0,0);checkHomeOffer()}
function labels(){
const x=t(),ids={duelEntryTitle:x.entry,duelEntryDesc:x.desc,duelTitle:x.title,duelSubtitle:x.subtitle,duelSetupTitle:x.setup,duelRules:x.rules,duelStatsOpen:'📊 '+x.stats,duelStatsFromResult:'📊 '+x.stats,duelStatsTitle:x.statsTitle,duelStatsPlayedLabel:x.statsPlayed,duelStatsWinsLabel:x.statsWins,duelStatsLossesLabel:x.statsLosses,duelStatsDrawsLabel:x.statsDraws,duelStatsBestLabel:x.statsBest,duelStatsNetLabel:x.statsNet,duelStatsRecentTitle:x.statsRecent,duelStatsBack:x.statsBack,duelRoomsTitle:x.rooms,duelStakeLabel:x.stake,duelCreate:x.privateRoom,duelCreatePublic:x.openRoom,duelInviteTitle:x.waiting,duelShare:x.share,duelCancel:x.cancel,duelJoinTitle:x.join,duelAccept:x.accept,duelDecline:x.back,duelYouLabel:x.you,duelFriendLabel:x.friend,duelClear:x.clear,duelDone:x.back,duelRematch:x.rematch,duelRematchTitle:x.rematchTitle,duelRematchInfo:x.rematchInfo,duelRematchStakeLabel:x.stake,duelRematchConfirm:x.rematchConfirm,duelRematchBack:x.resultBack};
for(const [id,value] of Object.entries(ids))$(id).textContent=value;
if(duel?.status==='active')paintNames(duel);
if(duel?.status==='waiting')paintRoomHost(duel);
if(statsData&&!$('duelStats').hidden)paintStats(statsData);
if(!$('duelStats').hidden){$('duelTitle').textContent=x.statsTitle;$('duelSubtitle').textContent=''}
stakeLabel();friendLabels();drawRooms();$('duelRoomsRefresh').setAttribute('aria-label',x.refreshRooms);paintOfferPopup();if(incomingOffer){$('duelAcceptRematch').textContent=x.acceptOffer(incomingOffer.stake);$('duelJoinTitle').textContent=incomingOffer.kind==='friend'?ft().invite+(incomingOffer.from||''):x.offerTitle;$('duelJoinInfo').textContent=x.offerInfo(incomingOffer.stake)}
}
function stakeLabel(){for(const prefix of ['duel','duelRematch']){const n=Number($(prefix+'Stake').value);$(prefix+'StakeValue').textContent=n+' 🪙';$(prefix+'Payout').textContent=t().pot(n*2,n*9/5)}}
function error(e){const key=String(e?.message||'');const x=t();pw.status(({duel_not_found:x.notFound,duel_not_waiting:x.notFound,duel_own_invite:x.own,duel_invitee_only:x.privateInvite,duel_not_finished:x.notFinished,duel_already_open:x.busy,duel_wait:x.waitError,duel_reaction_wait:x.waitError,duel_skips_exhausted:x.skip(0),insufficient_coins:x.needCoins,friend_not_found:ft().notFound,friend_self:ft().self,friend_not_accepted:ft().locked})[key]||key)}
function paintStats(data){
 const x=t();for(const [id,key] of [['duelStatsPlayed','played'],['duelStatsWins','wins'],['duelStatsLosses','losses'],['duelStatsDraws','draws'],['duelStatsBest','best_score']])$(id).textContent=Number(data[key]||0);
 const net=Number(data.net_coins||0);$('duelStatsNet').textContent=(net>0?'+':'')+net+' 🪙';
 const list=$('duelStatsList');list.replaceChildren();if(!data.history?.length){const p=document.createElement('p');p.textContent=x.statsEmpty;list.append(p);return}
 const locale=language()==='az'?'az-AZ':language()==='en'?'en-GB':'ru-RU';
 for(const match of data.history){const row=document.createElement('div'),info=document.createElement('div'),name=document.createElement('b'),detail=document.createElement('small'),amount=document.createElement('strong');row.className='duel-history-row';
  const icon={won:'🏆',lost:'⚔️',draw:'🤝',cancelled:'↩️'}[match.outcome]||'⚔️';name.textContent=icon+' '+(match.opponent_name||x.statsOpponent);
  const when=match.settled_at?new Intl.DateTimeFormat(locale,{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(match.settled_at)):'';
  detail.textContent=when+' · '+(match.outcome==='cancelled'?x.statsRefund:x.statsScore+' '+match.my_score+':'+match.their_score)+' · '+x.statsStake+' '+match.stake+' 🪙';
  const value=Number(match.net_coins||0);amount.textContent=(value>0?'+':'')+value+' 🪙';amount.className=value>0?'gain':value<0?'loss':'';
  info.append(name,detail);row.append(info,amount);list.append(row)
 }
}
async function openStats(fromStatsScreen=false){statsReturn=fromStatsScreen?'statsScreen':$('duelResult').hidden?'duelSetup':'duelResult';show('duelStats');$('duelTitle').textContent=t().statsTitle;$('duelSubtitle').textContent='';const request=++statsReq;$('duelStatsList').textContent=t().statsLoading;
 try{const r=await call('statistics');if(request!==statsReq||$('duelStats').hidden)return;statsData=r.stats;paintStats(statsData)}
 catch(e){if(request===statsReq&&!$('duelStats').hidden)$('duelStatsList').textContent=e.message}
}
function backStats(){statsReq++;$('duelTitle').textContent=t().title;$('duelSubtitle').textContent=t().subtitle;if(statsReturn==='statsScreen'){window.PWStats?.show();return}show(statsReturn);if(statsReturn==='duelSetup')refreshRooms().catch(()=>{});else checkOffer().catch(()=>{})}
window.PWDuelStats={openFromStats:()=>openStats(true)};
$('duelStatsOpen').onclick=()=>openStats();$('duelStatsFromResult').onclick=()=>openStats();$('duelStatsBack').onclick=backStats;
function refreshCoins(){pw.login(true).catch(()=>{})}
function startPolling(){if(!poll)poll=setInterval(()=>{if($('duelScreen').classList.contains('active'))state().catch(error)},700);if(!tick)tick=setInterval(updateClock,150);if(!reactionPoll)reactionPoll=setInterval(syncReactions,600)}
async function syncReactions(){
 if(reactionRequesting||document.hidden||!code||duel?.status!=='active'||!$('duelScreen').classList.contains('active'))return;
 reactionRequesting=true;const matchCode=code;
 try{const r=await call('reactions',{code:matchCode});if(code===matchCode&&duel?.status==='active'&&r.reactions)paintReactions({...r.reactions,code:matchCode})}catch{}finally{reactionRequesting=false}
}
function startOfferPolling(){if(!offerPoll)offerPoll=setInterval(()=>{if(!$('duelResult').hidden)checkOffer().catch(error)},1800);checkOffer().catch(error)}
async function checkOffer(){
if(offerRequesting||!duel||duel.status!=='finished'||$('duelResult').hidden)return;
offerRequesting=true;const oldCode=duel.code;
try{
 const r=await call('offer',{code:oldCode});
 if(duel?.code!==oldCode||$('duelResult').hidden)return;
 incomingOffer=r.offer;
 $('duelAcceptRematch').hidden=!incomingOffer;
 $('duelRematch').hidden=Boolean(incomingOffer);
 if(incomingOffer)$('duelAcceptRematch').textContent=t().acceptOffer(incomingOffer.stake);
}finally{offerRequesting=false}
}
function updateClock(){
if(!duel)return;
const now=Date.now()+offset;
if(duel.status==='active'){
 const begin=Date.parse(duel.starts_at),end=Date.parse(duel.ends_at);
 $('duelTimer').textContent=now<begin?Math.max(1,Math.ceil((begin-now)/1000)):Math.max(0,Math.ceil((end-now)/1000));
 disabled=now<begin||now>=end||!duel.question||Boolean(duel.next_guess_at&&now<Date.parse(duel.next_guess_at));
 $('duelSkip').disabled=disabled||(duel.skips_left??0)<=0||answering;
 $('duelGameStatus').textContent=now<begin?t().soon+Math.max(1,Math.ceil((begin-now)/1000)):now>=end?t().wait:!document.hidden&&lastSyncAt&&Date.now()-lastSyncAt>3500?t().reconnecting:!duel.question?t().wait:lastStatus||t().ready;
}
}
async function call(action,body={}){const r=await pw.duelRequest(action,body);if(r.server_now)offset=Date.parse(r.server_now)-Date.now();return r}
async function state(){
if(answering||document.hidden||!code||!$('duelScreen').classList.contains('active')||requesting)return;
requesting=true;stateStarted=Date.now();const seq=++stateSeq,epoch=answerEpoch,matchCode=code;
try{const r=await call('state',{code:matchCode,questionId});if(seq!==stateSeq||epoch!==answerEpoch||matchCode!==code||!$('duelScreen').classList.contains('active'))return;
 if(!r.duel){forgetMatch();home();return}
 if(r.duel.status==='active'&&!r.duel.question&&duel?.question&&r.duel.question_id===duel.question_id)r.duel.question=duel.question;
 duel=r.duel;render();
}catch(e){if(seq===stateSeq&&duel?.status==='active')updateClock();else if(seq===stateSeq)throw e}
finally{if(seq===stateSeq)requesting=false}
}
function render(){
const d=duel;if(!d)return;
lastSyncAt=Date.now();if(d.status==='active'||d.status==='waiting')rememberMatch(d.code);
if(d.status==='waiting'){
 if(d.creator){show('duelInvite');paintRoomHost(d);$('duelShare').hidden=Boolean(d.invitee_name);$('duelInviteInfo').textContent=d.invitee_name?ft().sentTo(d.invitee_name,d.stake):d.public_room?t().openInfo(d.stake):t().invite(d.stake)}
 else show('duelJoin');
}else if(d.status==='active'){
 show('duelGame');paintNames(d);paintReactions(d);$('duelYouScore').textContent=d.my_score;$('duelFriendScore').textContent=d.their_score;$('duelSkip').textContent=t().skip(d.skips_left??3);$('duelSkip').disabled=(d.skips_left??0)<=0||!d.question_id;
 const q=d.question;
 if(q&&questionId!==d.question_id){questionId=d.question_id;chosen=[];lastStatus='';drawQuestion(q)}
 updateClock();
}else{
 closeReactions();clearInterval(poll);clearInterval(tick);clearInterval(reactionPoll);poll=tick=reactionPoll=null;show('duelResult');
 $('duelResultIcon').textContent=d.status==='cancelled'?'↩️':d.draw?'🤝':d.won?'🏆':'⚔️';
 $('duelResultTitle').textContent=d.status==='cancelled'?t().cancelled:d.draw?t().draw:d.won?t().won:t().lost;
 $('duelResultText').textContent=d.status==='cancelled'?t().drawResult(d.stake):d.draw?t().drawResult(d.stake):t().result(d.my_score,d.their_score,d.payout||0);
 $('duelAddFriend').hidden=d.status!=='finished'||Boolean(d.friends);$('duelRematch').hidden=d.status!=='finished';$('duelAcceptRematch').hidden=true;
 if(d.status==='finished')startOfferPolling();
 refreshCoins();
}
}
function drawQuestion(q){
clearTimeout(wrongTimer);clearTimeout(submitTimer);wrongTimer=submitTimer=null;$('duelClear').disabled=true;const photos=$('duelPhotos'),slots=$('duelSlots'),letters=$('duelLetters');photos.replaceChildren();slots.replaceChildren();letters.replaceChildren();
for(const emoji of q.photos){const div=document.createElement('div');div.className='photo';div.textContent=emoji;photos.append(div)}
slots.style.gridTemplateColumns='repeat('+Math.min(q.length,8)+',minmax(0,1fr))';
for(let i=0;i<q.length;i++){const b=document.createElement('button');b.className='slot';b.type='button';b.onclick=()=>{if(!answering&&chosen[i]!==undefined){clearTimeout(submitTimer);submitTimer=null;chosen.splice(i,1);paint(q)}};slots.append(b)}
letters.style.gridTemplateColumns='repeat('+Math.min(q.letters.length,7)+',minmax(0,1fr))';
q.letters.forEach((ch,i)=>{const b=document.createElement('button');b.className='letter';b.type='button';b.textContent=ch;b.onclick=()=>{if(disabled||answering||chosen.includes(i)||chosen.length>=q.length)return;chosen.push(i);paint(q);if(chosen.length===q.length){submitTimer=setTimeout(()=>{submitTimer=null;if(chosen.length===q.length&&duel?.question_id===questionId)submit(q)},400)}};letters.append(b)});
}
function paint(q){$('duelClear').disabled=!chosen.length;[...$('duelSlots').children].forEach((e,i)=>e.textContent=chosen[i]===undefined?'':q.letters[chosen[i]]);[...$('duelLetters').children].forEach((e,i)=>{e.classList.toggle('used',chosen.includes(i));e.disabled=answering||chosen.includes(i)})}
async function submit(q){
if(answering||disabled)return;answering=true;answerEpoch++;const submittedCode=code,submittedQuestionId=questionId;
try{
const answer=chosen.map(i=>q.letters[i]).join('');const r=await call('answer',{code:submittedCode,answer});
if(code!==submittedCode||questionId!==submittedQuestionId||!$('duelScreen').classList.contains('active'))return;
duel=r.duel;lastStatus=r.correct?t().correct:t().wrong;
pw.haptic(r.correct?'success':'error');pw.sfx(r.correct?'success':'error');
if(!r.correct){clearLetters();$('duelSlots').classList.add('wrong');wrongTimer=setTimeout(()=>{$('duelSlots').classList.remove('wrong')},450)}
render();
}catch(e){error(e);clearLetters()}finally{answering=false;if(duel?.question)paint(duel.question);state().catch(()=>{})}
}
async function open(){
clearInterval(offerPoll);offerPoll=null;incomingOffer=null;labels();questionId=null;code='';duel=null;preview=null;show('duelSetup');
try{
 await pw.login();let r=await call('state');
 if(!r.duel&&savedMatch()){r=await call('state',{code:savedMatch()});if(!r.duel)forgetMatch()}
 if(r.duel){code=r.duel.code;duel=r.duel;render();if(['waiting','active'].includes(duel.status))startPolling();return}
 refreshRooms().catch(error);if(!roomPoll)roomPoll=setInterval(()=>{if($('duelScreen').classList.contains('active')&&!$('duelSetup').hidden&&!document.hidden)refreshRooms().catch(()=>{})},5000);
 await refreshFriends();const offer=await call('offer');if(offer.offer)showIncoming(offer.offer);
}catch(e){error(e)}
}
function showIncoming(offer){
dismissedOfferCode=offer.code;closeOfferPopup();incomingOffer=offer;preview=offer;code=offer.code;
$('duelJoinTitle').textContent=offer.kind==='friend'?ft().invite+(offer.from||''):t().offerTitle;$('duelJoinInfo').textContent=t().offerInfo(offer.stake);show('duelJoin');
}
async function invited(c){
labels();show('duelJoin');code=c;
try{
 await pw.login();
 // A launch link remains in Telegram after joining. Restore a participant's
 // match before treating that link as a new invitation.
 const current=await call('state',{code});
 if(current.duel){duel=current.duel;questionId=null;render();if(['waiting','active'].includes(duel.status))startPolling();return}
 const r=await call('preview',{code});preview=r.duel;if(!preview||preview.status!=='waiting'||Date.parse(preview.expires_at)<Date.now()+offset)throw new Error('duel_not_found');$('duelJoinInfo').textContent=t().joinInfo(preview.stake)
}catch(e){error(e);home()}
}
async function create(){
const button=$('duelCreate');button.disabled=true;
try{await pw.login();const r=await call('create',{stake:Number($('duelStake').value),language:language()});code=r.duel.code;duel=r.duel;questionId=null;render();refreshCoins();startPolling()}catch(e){error(e)}finally{button.disabled=false}
}
async function createPublic(){
 const button=$('duelCreatePublic');button.disabled=true;
 try{await pw.login();const r=await call('create_public',{stake:Number($('duelStake').value),language:language()});code=r.duel.code;duel=r.duel;questionId=null;render();refreshCoins();startPolling()}catch(e){error(e)}finally{button.disabled=false}
}
async function joinPublic(roomCode,button){
 button.disabled=true;
 try{const r=await call('join_public',{code:roomCode,language:language()});code=r.duel.code;duel=r.duel;questionId=null;render();refreshCoins();startPolling()}
 catch(e){error(e);refreshRooms().catch(()=>{})}finally{button.disabled=false}
}
async function join(button=$('duelAccept')){
button.disabled=true;const oldCode=duel?.code;
try{const r=await call('join',{code,language:language()});clearInterval(offerPoll);offerPoll=null;incomingOffer=null;duel=r.duel;questionId=null;render();refreshCoins();startPolling()}catch(e){if(oldCode)code=oldCode;error(e)}finally{button.disabled=false}
}
function rematchSetup(){
if(duel?.status!=='finished')return;
$('duelRematchStake').value=String(duel.stake);stakeLabel();show('duelRematchSetup');
}
async function rematchCreate(){
const button=$('duelRematchConfirm');button.disabled=true;
try{
 const r=await call('rematch',{code:duel.code,stake:Number($('duelRematchStake').value),language:language()});
 clearInterval(offerPoll);offerPoll=null;incomingOffer=null;
 code=r.duel.code;duel=r.duel;questionId=null;render();refreshCoins();startPolling();
}catch(e){error(e);show('duelResult');checkOffer().catch(()=>{})}finally{button.disabled=false}
}
async function acceptIncoming(){
if(!incomingOffer)return;code=incomingOffer.code;await join($('duelAcceptRematch'));
}
async function cancel(){
const button=$('duelCancel');button.disabled=true;
try{const r=await call('cancel',{code});duel=r.duel;render()}catch(e){error(e)}finally{button.disabled=false}
}
function friendLabels(){
 const x=ft();for(const [id,value] of Object.entries({duelPickTitle:x.pick,gameFriendsTitle:x.section,gameFriendsHint:x.hint,referralHeading:x.referral,friendAdd:x.add,duelCreateFriend:x.selected,duelAddFriend:x.addAfter}))$(id).textContent=value;
 $('friendCode').placeholder='PhotoWord ID';drawFriends();
}
function makeButton(label,handler){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=handler;return b}
function drawRooms(){
 const list=$('duelRoomsList');list.replaceChildren();
 if(!rooms.length){const p=document.createElement('p');p.id='duelRoomsEmpty';p.textContent=t().roomsEmpty;list.append(p);return}
 for(const room of rooms){
  const row=document.createElement('div');row.className='duel-room-row';
  const info=document.createElement('div'),identity=document.createElement('div'),name=document.createElement('b'),title=document.createElement('span'),detail=document.createElement('small');
  identity.className='duel-room-identity';title.className='duel-room-title';name.textContent=room.name;title.textContent=playerTitle(room.completed_levels);identity.append(name,title);
  detail.textContent=room.stake+' 🪙 · '+t().roomTime(Math.max(1,Math.ceil((Date.parse(room.expires_at)-Date.now()-offset)/60000)));
  info.append(identity,detail);const button=makeButton(t().joinRoom,()=>joinPublic(room.code,button));row.append(info,button);list.append(row);
 }
}
async function refreshRooms(){
 if(roomsRequesting)return;roomsRequesting=true;
 try{const r=await call('public_rooms',{language:language()});if(!$('duelSetup').hidden&&$('duelScreen').classList.contains('active')){rooms=r.rooms||[];drawRooms()}}
 finally{roomsRequesting=false}
}
function drawFriends(){
 const x=ft(),list=$('gameFriendsList'),picker=$('duelFriendChoices');list.replaceChildren();picker.replaceChildren();
 if(!friends.length){const p=document.createElement('p');p.className='muted';p.textContent=x.none;list.append(p)}
 for(const f of friends){
  const row=document.createElement('div');row.className='game-friend-row';const info=document.createElement('div'),name=document.createElement('b'),small=document.createElement('small');name.textContent=f.name;small.textContent=f.code+(f.status==='pending'?' · '+(f.direction==='incoming'?x.incoming:x.outgoing):'');info.append(name,small);row.append(info);
  const actions=document.createElement('div');actions.className='game-friend-actions';
  if(f.status==='accepted'){
   actions.append(makeButton(x.challenge,async()=>{$('friendsModal').hidden=true;await open();selectedFriend=f.code;drawFriends()}));
   const choose=makeButton(f.name,()=>{selectedFriend=f.code;drawFriends()});choose.className='friend-choice'+(selectedFriend===f.code?' chosen':'');picker.append(choose);
  }else if(f.direction==='incoming')actions.append(makeButton(x.accept,()=>changeFriend(f.id,'accept')));
  actions.append(makeButton(x.remove,()=>changeFriend(f.id,'remove')));row.append(actions);list.append(row);
 }
 $('duelCreateFriend').hidden=!selectedFriend;
}
async function refreshFriends(){
 try{await pw.login();const r=await call('friend_list');friends=r.friends||[];if(selectedFriend&&!friends.some(f=>f.code===selectedFriend&&f.status==='accepted'))selectedFriend='';drawFriends()}catch(e){$('gameFriendsList').textContent=e.message;error(e)}
}
async function changeFriend(id,change){try{await call('friend_change',{requestId:id,change});await refreshFriends()}catch(e){error(e)}}
async function addFriend(){const button=$('friendAdd');button.disabled=true;try{const r=await call('friend_request',{friendCode:$('friendCode').value.trim()});$('friendCode').value='';pw.status(r.status==='accepted'?ft().accepted:ft().sent);await refreshFriends()}catch(e){error(e)}finally{button.disabled=false}}
async function createForFriend(){const button=$('duelCreateFriend');if(!selectedFriend)return pw.status(ft().noFriend);button.disabled=true;
 try{const r=await call('create_friend',{friendCode:selectedFriend,stake:Number($('duelStake').value),language:language()});code=r.duel.code;duel=r.duel;questionId=null;render();refreshCoins();startPolling()}catch(e){error(e)}finally{button.disabled=false}}
async function addOpponent(){const button=$('duelAddFriend');button.disabled=true;try{const r=await call('friend_request',{code:duel.code});pw.status(r.status==='accepted'?ft().accepted:ft().sent);await refreshFriends();button.hidden=true}catch(e){error(e)}finally{button.disabled=false}}
window.PWDuelFriends={refresh:refreshFriends,labels};
$('friendAdd').onclick=addFriend;$('friendCode').onkeydown=e=>{if(e.key==='Enter')addFriend()};
$('duelCreateFriend').onclick=createForFriend;$('duelAddFriend').onclick=addOpponent;
$('duelEntry').onclick=open;$('duelBack').onclick=()=>{if(!$('duelStats').hidden)backStats();else home()};$('duelDecline').onclick=home;$('duelDone').onclick=home;
$('duelStake').oninput=stakeLabel;$('duelRematchStake').oninput=stakeLabel;
$('duelCreate').onclick=create;$('duelCreatePublic').onclick=createPublic;$('duelRoomsRefresh').onclick=()=>refreshRooms().catch(error);$('duelAccept').onclick=()=>join();$('duelCancel').onclick=cancel;
$('duelRematch').onclick=rematchSetup;$('duelRematchConfirm').onclick=rematchCreate;
$('duelRematchBack').onclick=()=>{show('duelResult');checkOffer().catch(error)};
$('duelAcceptRematch').onclick=acceptIncoming;
function clearLetters(){clearTimeout(wrongTimer);clearTimeout(submitTimer);wrongTimer=submitTimer=null;chosen=[];$('duelSlots').classList.remove('wrong');if(duel?.question)paint(duel.question)}
async function skip(){if(answering||disabled||!duel?.question||duel.skips_left<=0)return;const button=$('duelSkip');button.disabled=true;answering=true;answerEpoch++;
 try{clearLetters();const r=await call('skip',{code});duel=r.duel;lastStatus=t().skipped;render();pw.haptic('selection')}
 catch(e){error(e)}finally{answering=false;if(duel?.status==='active'){$('duelSkip').disabled=duel.skips_left<=0;if(duel.question)paint(duel.question)}state().catch(()=>{})}
}
$('duelClear').onclick=clearLetters;$('duelSkip').onclick=skip;
$('duelShare').onclick=()=>{
const link='https://t.me/PhotoWordBot?startapp=duel_'+code;
const url='https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent(t().shareText(duel.stake));
if(window.Telegram?.WebApp?.openTelegramLink)Telegram.WebApp.openTelegramLink(url);else location.href=url;
};
window.addEventListener('storage',e=>{if(e.key==='pw.language'){rooms=[];labels();if(!$('duelSetup').hidden)refreshRooms().catch(error)}});
function closeOfferPopup(){ $('duelOfferModal').hidden=true; }
function paintOfferPopup(){
 const x=ft(),o=pendingHomeOffer;
 $('duelOfferHeading').textContent=x.popupTitle;
 $('duelOfferText').textContent=o?x.popupText(o.from||t().friend,o.stake):'';
 $('duelOfferExpiry').textContent=x.popupExpiry;
 $('duelOfferOpen').textContent=x.popupOpen;
 $('duelOfferLater').textContent=x.popupLater;
}
function canShowOfferPopup(){return ![...document.querySelectorAll('.modal:not([hidden])')].some(m=>m.id!=='duelOfferModal')}
function showOfferPopup(){
 if(!pendingHomeOffer||pendingHomeOffer.code===dismissedOfferCode||!$('home').classList.contains('active')||!canShowOfferPopup())return;
 paintOfferPopup();$('duelOfferModal').hidden=false;
}
async function checkHomeOffer(){
 if(homeOfferRequesting||!pw.hasAuth||!$('home').classList.contains('active')||document.hidden)return;
 homeOfferRequesting=true;
 try{
  const r=await call('offer');pendingHomeOffer=r.offer||null;
  $('duelEntryDesc').textContent=pendingHomeOffer?ft().invite+(pendingHomeOffer.from||'')+' · '+pendingHomeOffer.stake+' 🪙':t().desc;
  if(!pendingHomeOffer||Date.parse(pendingHomeOffer.expires_at)<=Date.now()+offset){pendingHomeOffer=null;closeOfferPopup();return}
  if(pendingHomeOffer.code!==dismissedOfferCode)showOfferPopup();
 }catch{/* Keep the entry usable when offline. */}finally{homeOfferRequesting=false}
}
$('duelOfferLater').onclick=()=>{dismissedOfferCode=pendingHomeOffer?.code||'';closeOfferPopup()};
$('duelOfferOpen').onclick=async()=>{
 const button=$('duelOfferOpen');button.disabled=true;
 try{
  const latest=await call('offer');if(!latest.offer||latest.offer.code!==pendingHomeOffer?.code)throw new Error('duel_not_found');
  dismissedOfferCode=latest.offer.code;closeOfferPopup();await open();
 }catch(e){closeOfferPopup();pendingHomeOffer=null;error(e)}finally{button.disabled=false}
};
window.addEventListener('pw:player',()=>checkHomeOffer());
function resumeVisible(){if($('duelScreen').classList.contains('active')&&code&&duel&&['waiting','active'].includes(duel.status))state().catch(()=>{});else checkHomeOffer()}
window.addEventListener('focus',resumeVisible);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)resumeVisible()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('duelOfferModal').hidden){dismissedOfferCode=pendingHomeOffer?.code||'';closeOfferPopup()}});
setTimeout(checkHomeOffer,1200);setInterval(checkHomeOffer,4000);

labels();
const start=String(window.Telegram?.WebApp?.initDataUnsafe?.start_param||new URLSearchParams(location.search).get('startapp')||'');
if(/^duel_[A-Fa-f0-9]{16}$/.test(start))invited(start.slice(5).toUpperCase());
else if(savedMatch())pw.login().then(async()=>{
 if(!$('home').classList.contains('active')||document.querySelector('.modal:not([hidden])'))return;
 const matchCode=savedMatch();if(!matchCode)return;
 try{const r=await call('state',{code:matchCode});if(!$('home').classList.contains('active')||document.querySelector('.modal:not([hidden])'))return;
  if(!r.duel){forgetMatch();return}
  code=matchCode;duel=r.duel;questionId=null;render();if(['waiting','active'].includes(duel.status))startPolling();
 }catch{/* A saved duel stays available from the Duels entry when connection returns. */}
}).catch(()=>{});
})();
