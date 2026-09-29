(() => {
'use strict';
const $=id=>document.getElementById(id),pw=window.PW;
const copy={
ru:{entry:'Дуэль с другом',desc:'60 секунд · взнос 25–500 🪙',title:'Дуэль с другом',subtitle:'Кто отгадает больше за минуту?',setup:'Вызови друга',rules:'Одинаковые задания, 60 секунд. Победитель получает 90% общего банка. При ничьей взносы возвращаются.',stake:'Взнос каждого',pot:(a,b)=>'Банк '+a+' 🪙 · победителю '+b+' 🪙',create:'СОЗДАТЬ ДУЭЛЬ',waiting:'Ждём друга',invite:s=>'Взнос '+s+' 🪙 удержан. Приглашение действует 5 минут.',share:'ПРИГЛАСИТЬ ДРУГА',cancel:'ОТМЕНИТЬ И ВЕРНУТЬ ВЗНОС',join:'Приглашение на дуэль',joinInfo:s=>'Взнос каждого '+s+' 🪙. Игра длится 60 секунд.',accept:'ПРИНЯТЬ ВЫЗОВ',back:'НА ГЛАВНУЮ',you:'Ты',friend:'Друг',clear:'СБРОСИТЬ БУКВЫ',skip:n=>'ПРОПУСТИТЬ · '+n,skipped:'Слово пропущено',soon:'Старт через ',ready:'Отгадывай слова!',wrong:'Неверно · попробуй снова',correct:'Верно! +1',wait:'Ожидаем итог...',won:'Победа!',lost:'Друг победил',draw:'Ничья',cancelled:'Взнос возвращён',result:(a,b,p)=>'Счёт '+a+':'+b+' · начислено '+p+' 🪙',drawResult:s=>'Ставка '+s+' 🪙 возвращена каждому.',expired:'Приглашение истекло. Взнос возвращён.',notFound:'Приглашение не найдено или уже закрыто.',own:'Это твоё приглашение.',busy:'У тебя уже есть открытая дуэль.',waitError:'Подожди секунду перед новой попыткой.',shareText:s=>'Вызываю тебя на дуэль в PhotoWord! Взнос '+s+' 🪙, 60 секунд. Примешь вызов?',needCoins:'Недостаточно монет для этой ставки.'},
en:{entry:'Duel a friend',desc:'60 seconds · 25–500 🪙 entry',title:'Duel a friend',subtitle:'Who can solve more in one minute?',setup:'Challenge a friend',rules:'Same puzzles, 60 seconds. Winner receives 90% of the pot. A tie refunds both entries.',stake:'Entry per player',pot:(a,b)=>'Pot '+a+' 🪙 · winner gets '+b+' 🪙',create:'CREATE DUEL',waiting:'Waiting for a friend',invite:s=>'Your '+s+' 🪙 entry is held. Invite expires in 5 minutes.',share:'INVITE A FRIEND',cancel:'CANCEL AND REFUND',join:'Duel invitation',joinInfo:s=>'Each player enters for '+s+' 🪙. Play for 60 seconds.',accept:'ACCEPT CHALLENGE',back:'HOME',you:'You',friend:'Friend',clear:'CLEAR LETTERS',skip:n=>'SKIP · '+n,skipped:'Word skipped',soon:'Starts in ',ready:'Solve the words!',wrong:'Wrong · try again',correct:'Correct! +1',wait:'Waiting for result...',won:'You won!',lost:'Your friend won',draw:'Draw',cancelled:'Entry refunded',result:(a,b,p)=>'Score '+a+':'+b+' · credited '+p+' 🪙',drawResult:s=>s+' 🪙 returned to each player.',expired:'Invite expired. Entry refunded.',notFound:'Invite not found or already closed.',own:'This is your invitation.',busy:'You already have an open duel.',waitError:'Wait a moment before trying again.',shareText:s=>'I challenge you to a PhotoWord duel! '+s+' 🪙 entry, 60 seconds. Join me!',needCoins:'Not enough coins for this entry.'},
az:{entry:'Dostla duel',desc:'60 saniyə · 25–500 🪙 giriş',title:'Dostla duel',subtitle:'Bir dəqiqədə kim daha çox söz tapacaq?',setup:'Dostunu çağır',rules:'Eyni tapmacalar, 60 saniyə. Qalib ümumi bankın 90%-ni alır. Bərabərlikdə giriş haqları qaytarılır.',stake:'Hər oyunçunun girişi',pot:(a,b)=>'Bank '+a+' 🪙 · qalibə '+b+' 🪙',create:'DUEL YARAT',waiting:'Dost gözlənilir',invite:s=>s+' 🪙 saxlanılır. Dəvət 5 dəqiqə qüvvədədir.',share:'DOSTU DƏVƏT ET',cancel:'LƏĞV ET VƏ QAYTAR',join:'Duel dəvəti',joinInfo:s=>'Hər oyunçu '+s+' 🪙 ödəyir. Oyun 60 saniyə çəkir.',accept:'QƏBUL ET',back:'ANA SƏHİFƏ',you:'Sən',friend:'Dost',clear:'HƏRFLƏRİ SİL',skip:n=>'KEÇ · '+n,skipped:'Söz keçildi',soon:'Başlayır: ',ready:'Sözləri tap!',wrong:'Yanlışdır · yenidən yoxla',correct:'Düzdür! +1',wait:'Nəticə gözlənilir...',won:'Qələbə!',lost:'Dostun qalib gəldi',draw:'Bərabərlik',cancelled:'Giriş qaytarıldı',result:(a,b,p)=>'Hesab '+a+':'+b+' · əlavə edildi '+p+' 🪙',drawResult:s=>s+' 🪙 hər oyunçuya qaytarıldı.',expired:'Dəvət vaxtı bitdi. Giriş qaytarıldı.',notFound:'Dəvət tapılmadı və ya bağlanıb.',own:'Bu sənin dəvətindir.',busy:'Artıq açıq duelin var.',waitError:'Bir az gözlə, sonra yenidən yoxla.',shareText:s=>'Səni PhotoWord duelinə çağırıram! Giriş '+s+' 🪙, 60 saniyə. Qoşul!',needCoins:'Bu giriş üçün kifayət qədər sikkə yoxdur.'}
};
Object.assign(copy.ru,{rematch:'РЕВАНШ',rematchTitle:'Реванш с тем же другом',rematchInfo:'Выбери взнос. Монеты спишутся после подтверждения вызова; друг оплатит свой взнос при принятии.',rematchConfirm:'ПРЕДЛОЖИТЬ РЕВАНШ',resultBack:'НАЗАД К ИТОГУ',offerTitle:'Друг зовёт на реванш',offerInfo:s=>'Взнос '+s+' 🪙 с каждого. Прими вызов, чтобы начать новый матч.',acceptOffer:s=>'ПРИНЯТЬ РЕВАНШ · '+s+' 🪙',privateInvite:'Это приглашение для другого игрока.',notFinished:'Сначала дождись завершения дуэли.'});
Object.assign(copy.en,{rematch:'REMATCH',rematchTitle:'Play the same friend again',rematchInfo:'Choose an entry. Your coins are held when you confirm; your friend pays on acceptance.',rematchConfirm:'OFFER REMATCH',resultBack:'BACK TO RESULT',offerTitle:'Your friend wants a rematch',offerInfo:s=>'Each player enters for '+s+' 🪙. Accept to start another match.',acceptOffer:s=>'ACCEPT REMATCH · '+s+' 🪙',privateInvite:'This invitation is for another player.',notFinished:'Wait for the duel to finish first.'});
Object.assign(copy.az,{rematch:'TƏKRAR OYNA',rematchTitle:'Eyni dostla yenidən oyna',rematchInfo:'Giriş haqqını seç. Təsdiqdən sonra sikkələrin saxlanılır; dostun qəbul edəndə öz payını ödəyir.',rematchConfirm:'TƏKRAR OYUN TƏKLİF ET',resultBack:'NƏTİCƏYƏ QAYIT',offerTitle:'Dostun yenidən oynamaq istəyir',offerInfo:s=>'Hər oyunçu '+s+' 🪙 ödəyir. Yeni oyun üçün dəvəti qəbul et.',acceptOffer:s=>'QƏBUL ET · '+s+' 🪙',privateInvite:'Bu dəvət başqa oyunçu üçündür.',notFinished:'Əvvəlcə duelin bitməsini gözlə.'});
const friendCopy={
ru:{pick:'Выбрать друга',add:'ДОБАВИТЬ',hint:'Добавь игрока по PhotoWord ID. Он подтвердит заявку.',section:'Игровые друзья',referral:'Приглашения по ссылке',none:'Пока нет друзей. Узнай PhotoWord ID игрока в его профиле.',incoming:'Хочет дружить',outgoing:'Заявка отправлена',accept:'ПРИНЯТЬ',remove:'УДАЛИТЬ',challenge:'ВЫЗВАТЬ',selected:'ВЫЗВАТЬ ДРУГА',addAfter:'ДОБАВИТЬ В ДРУЗЬЯ',sent:'Заявка отправлена',accepted:'Теперь вы друзья',invite:'Вызов от ',pickHint:'Выбери друга и взнос либо создай ссылку ниже.',noFriend:'Выбери друга',notFound:'Игрок или заявка не найдены.',self:'Нельзя добавить себя.',locked:'Друг ещё не принял заявку.',sentTo:(name,stake)=>'Вызов отправлен: '+name+'. Взнос '+stake+' 🪙 удержан на 5 минут.'},
en:{pick:'Choose a friend',add:'ADD',hint:'Add a player by PhotoWord ID. They will confirm your request.',section:'Game friends',referral:'Link invitations',none:'No friends yet. Find their PhotoWord ID in their profile.',incoming:'Wants to be friends',outgoing:'Request sent',accept:'ACCEPT',remove:'REMOVE',challenge:'CHALLENGE',selected:'CHALLENGE FRIEND',addAfter:'ADD FRIEND',sent:'Request sent',accepted:'You are now friends',invite:'Challenge from ',pickHint:'Choose a friend and entry, or create a link below.',noFriend:'Choose a friend',notFound:'Player or request not found.',self:'You cannot add yourself.',locked:'Friend has not accepted yet.',sentTo:(name,stake)=>'Challenge sent to '+name+'. '+stake+' 🪙 held for 5 minutes.'},
az:{pick:'Dost seç',add:'ƏLAVƏ ET',hint:'Oyunçunu PhotoWord ID ilə əlavə et. O, sorğunu təsdiqləyəcək.',section:'Oyun dostları',referral:'Linklə dəvətlər',none:'Hələ dost yoxdur. Oyunçunun PhotoWord ID-sini profilindən öyrən.',incoming:'Dost olmaq istəyir',outgoing:'Sorğu göndərilib',accept:'QƏBUL ET',remove:'SİL',challenge:'DUELƏ ÇAĞIR',selected:'DOSTU ÇAĞIR',addAfter:'DOST ƏLAVƏ ET',sent:'Sorğu göndərildi',accepted:'İndi dostsunuz',invite:'Çağırış: ',pickHint:'Dostu və giriş haqqını seç və ya link yarat.',noFriend:'Dost seç',notFound:'Oyunçu və ya sorğu tapılmadı.',self:'Özünü əlavə edə bilməzsən.',locked:'Dostun hələ sorğunu qəbul etməyib.',sentTo:(name,stake)=>'Çağırış göndərildi: '+name+'. '+stake+' 🪙 5 dəqiqə saxlanılır.'}}
const ft=()=>friendCopy[language()]||friendCopy.ru;
let friends=[],selectedFriend='';
const language=()=>{try{return localStorage.getItem('pw.language')||'ru'}catch{return'ru'}};
const t=()=>copy[language()]||copy.ru;
let wrongTimer=null,code='',duel=null,preview=null,incomingOffer=null,requesting=false,offerRequesting=false,answering=false,poll=null,tick=null,offerPoll=null,offset=0,questionId=null,chosen=[],disabled=false,lastStatus='',answerEpoch=0;
const panels=['duelSetup','duelRematchSetup','duelInvite','duelJoin','duelGame','duelResult'];
function show(id){const changed=$(id).hidden||!$('duelScreen').classList.contains('active');for(const p of panels)$(p).hidden=p!==id;document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('active',e.id==='duelScreen'));if(changed)window.scrollTo(0,0)}
function home(){clearInterval(poll);clearInterval(tick);clearInterval(offerPoll);poll=tick=offerPoll=null;document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('active',e.id==='home'));window.scrollTo(0,0)}
function labels(){
const x=t(),ids={duelEntryTitle:x.entry,duelEntryDesc:x.desc,duelTitle:x.title,duelSubtitle:x.subtitle,duelSetupTitle:x.setup,duelRules:x.rules,duelStakeLabel:x.stake,duelCreate:x.create,duelInviteTitle:x.waiting,duelShare:x.share,duelCancel:x.cancel,duelJoinTitle:x.join,duelAccept:x.accept,duelDecline:x.back,duelYouLabel:x.you,duelFriendLabel:x.friend,duelClear:x.clear,duelDone:x.back,duelRematch:x.rematch,duelRematchTitle:x.rematchTitle,duelRematchInfo:x.rematchInfo,duelRematchStakeLabel:x.stake,duelRematchConfirm:x.rematchConfirm,duelRematchBack:x.resultBack};
for(const [id,value] of Object.entries(ids))$(id).textContent=value;
stakeLabel();friendLabels();if(incomingOffer){$('duelAcceptRematch').textContent=x.acceptOffer(incomingOffer.stake);$('duelJoinTitle').textContent=incomingOffer.kind==='friend'?ft().invite+(incomingOffer.from||''):x.offerTitle;$('duelJoinInfo').textContent=x.offerInfo(incomingOffer.stake)}
}
function stakeLabel(){for(const prefix of ['duel','duelRematch']){const n=Number($(prefix+'Stake').value);$(prefix+'StakeValue').textContent=n+' 🪙';$(prefix+'Payout').textContent=t().pot(n*2,n*9/5)}}
function error(e){const key=String(e?.message||'');const x=t();pw.status(({duel_not_found:x.notFound,duel_not_waiting:x.notFound,duel_own_invite:x.own,duel_invitee_only:x.privateInvite,duel_not_finished:x.notFinished,duel_already_open:x.busy,duel_wait:x.waitError,duel_skips_exhausted:x.skip(0),insufficient_coins:x.needCoins,friend_not_found:ft().notFound,friend_self:ft().self,friend_not_accepted:ft().locked})[key]||key)}
function refreshCoins(){pw.login(true).catch(()=>{})}
function startPolling(){if(!poll)poll=setInterval(()=>{if($('duelScreen').classList.contains('active'))state().catch(error)},1100);if(!tick)tick=setInterval(updateClock,150)}
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
 $('duelGameStatus').textContent=now<begin?t().soon+Math.max(1,Math.ceil((begin-now)/1000)):now>=end||!duel.question?t().wait:lastStatus||t().ready;
}
}
async function call(action,body={}){const r=await pw.duelRequest(action,body);if(r.server_now)offset=Date.parse(r.server_now)-Date.now();return r}
async function state(){
if(requesting||answering||!code)return;requesting=true;const epoch=answerEpoch;
try{const r=await call('state',{code});if(!r.duel||epoch!==answerEpoch)return;duel=r.duel;render()}finally{requesting=false}
}
function render(){
const d=duel;if(!d)return;
if(d.status==='waiting'){
 if(d.creator){show('duelInvite');$('duelShare').hidden=Boolean(d.invitee_name);$('duelInviteInfo').textContent=d.invitee_name?ft().sentTo(d.invitee_name,d.stake):t().invite(d.stake)}
 else show('duelJoin');
}else if(d.status==='active'){
 show('duelGame');$('duelYouScore').textContent=d.my_score;$('duelFriendScore').textContent=d.their_score;$('duelSkip').textContent=t().skip(d.skips_left??3);$('duelSkip').disabled=(d.skips_left??0)<=0||!d.question_id;
 const q=d.question;
 if(q&&questionId!==d.question_id){questionId=d.question_id;chosen=[];lastStatus='';drawQuestion(q)}
 updateClock();
}else{
 clearInterval(poll);clearInterval(tick);poll=tick=null;show('duelResult');
 $('duelResultIcon').textContent=d.status==='cancelled'?'↩️':d.draw?'🤝':d.won?'🏆':'⚔️';
 $('duelResultTitle').textContent=d.status==='cancelled'?t().cancelled:d.draw?t().draw:d.won?t().won:t().lost;
 $('duelResultText').textContent=d.status==='cancelled'?t().drawResult(d.stake):d.draw?t().drawResult(d.stake):t().result(d.my_score,d.their_score,d.payout||0);
 $('duelAddFriend').hidden=d.status!=='finished'||Boolean(d.friends);$('duelRematch').hidden=d.status!=='finished';$('duelAcceptRematch').hidden=true;
 if(d.status==='finished')startOfferPolling();
 refreshCoins();
}
}
function drawQuestion(q){
clearTimeout(wrongTimer);wrongTimer=null;$('duelClear').disabled=true;const photos=$('duelPhotos'),slots=$('duelSlots'),letters=$('duelLetters');photos.replaceChildren();slots.replaceChildren();letters.replaceChildren();
for(const emoji of q.photos){const div=document.createElement('div');div.className='photo';div.textContent=emoji;photos.append(div)}
slots.style.gridTemplateColumns='repeat('+Math.min(q.length,8)+',minmax(0,1fr))';
for(let i=0;i<q.length;i++){const b=document.createElement('button');b.className='slot';b.type='button';b.onclick=()=>{if(chosen.length){chosen.pop();paint(q)}};slots.append(b)}
letters.style.gridTemplateColumns='repeat('+Math.min(q.letters.length,7)+',minmax(0,1fr))';
q.letters.forEach((ch,i)=>{const b=document.createElement('button');b.className='letter';b.type='button';b.textContent=ch;b.onclick=()=>{if(disabled||answering||chosen.includes(i)||chosen.length>=q.length)return;chosen.push(i);paint(q);if(chosen.length===q.length)submit(q)};letters.append(b)});
}
function paint(q){$('duelClear').disabled=!chosen.length||answering;[...$('duelSlots').children].forEach((e,i)=>e.textContent=chosen[i]===undefined?'':q.letters[chosen[i]]);[...$('duelLetters').children].forEach((e,i)=>e.classList.toggle('used',chosen.includes(i)))}
async function submit(q){
if(answering||disabled)return;answering=true;answerEpoch++;$('duelClear').disabled=true;
try{
const answer=chosen.map(i=>q.letters[i]).join('');const r=await call('answer',{code,answer});
duel=r.duel;lastStatus=r.correct?t().correct:t().wrong;
pw.haptic(r.correct?'success':'error');pw.sfx(r.correct?'success':'error');
if(!r.correct){const submittedId=questionId;$('duelSlots').classList.add('wrong');wrongTimer=setTimeout(()=>{if(duel?.question_id===submittedId)clearLetters()},450)}
render();
}catch(e){error(e);clearLetters()}finally{answering=false;if(duel?.question)paint(duel.question)}
}
async function open(){
clearInterval(offerPoll);offerPoll=null;incomingOffer=null;labels();questionId=null;code='';duel=null;preview=null;show('duelSetup');
try{
 await pw.login();const r=await call('state');
 if(r.duel&&['waiting','active'].includes(r.duel.status)){code=r.duel.code;duel=r.duel;render();startPolling();return}
 await refreshFriends();const offer=await call('offer');if(offer.offer)showIncoming(offer.offer);
}catch(e){error(e)}
}
function showIncoming(offer){
incomingOffer=offer;preview=offer;code=offer.code;
$('duelJoinTitle').textContent=offer.kind==='friend'?ft().invite+(offer.from||''):t().offerTitle;$('duelJoinInfo').textContent=t().offerInfo(offer.stake);show('duelJoin');
}
async function invited(c){
labels();show('duelJoin');code=c;
try{await pw.login();const r=await call('preview',{code});preview=r.duel;if(!preview||preview.status!=='waiting'||Date.parse(preview.expires_at)<Date.now()+offset)throw new Error('duel_not_found');$('duelJoinInfo').textContent=t().joinInfo(preview.stake)}catch(e){error(e);home()}
}
async function create(){
const button=$('duelCreate');button.disabled=true;
try{await pw.login();const r=await call('create',{stake:Number($('duelStake').value),language:language()});code=r.duel.code;duel=r.duel;questionId=null;render();refreshCoins();startPolling()}catch(e){error(e)}finally{button.disabled=false}
}
async function join(button=$('duelAccept')){
button.disabled=true;const oldCode=duel?.code;
try{const r=await call('join',{code});clearInterval(offerPoll);offerPoll=null;incomingOffer=null;duel=r.duel;questionId=null;render();refreshCoins();startPolling()}catch(e){if(oldCode)code=oldCode;error(e)}finally{button.disabled=false}
}
function rematchSetup(){
if(duel?.status!=='finished')return;
$('duelRematchStake').value=String(duel.stake);stakeLabel();show('duelRematchSetup');
}
async function rematchCreate(){
const button=$('duelRematchConfirm');button.disabled=true;
try{
 const r=await call('rematch',{code:duel.code,stake:Number($('duelRematchStake').value)});
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
$('duelEntry').onclick=open;$('duelBack').onclick=home;$('duelDecline').onclick=home;$('duelDone').onclick=home;
$('duelStake').oninput=stakeLabel;$('duelRematchStake').oninput=stakeLabel;
$('duelCreate').onclick=create;$('duelAccept').onclick=()=>join();$('duelCancel').onclick=cancel;
$('duelRematch').onclick=rematchSetup;$('duelRematchConfirm').onclick=rematchCreate;
$('duelRematchBack').onclick=()=>{show('duelResult');checkOffer().catch(error)};
$('duelAcceptRematch').onclick=acceptIncoming;
function clearLetters(){clearTimeout(wrongTimer);wrongTimer=null;chosen=[];$('duelSlots').classList.remove('wrong');if(duel?.question)paint(duel.question)}
async function skip(){if(answering||disabled||!duel?.question||duel.skips_left<=0)return;const button=$('duelSkip');button.disabled=true;answering=true;answerEpoch++;
 try{clearLetters();const r=await call('skip',{code});duel=r.duel;lastStatus=t().skipped;render();pw.haptic('selection')}
 catch(e){error(e)}finally{answering=false;if(duel?.status==='active'){$('duelSkip').disabled=duel.skips_left<=0;if(duel.question)paint(duel.question)}}
}
$('duelClear').onclick=()=>{if(!answering)clearLetters()};$('duelSkip').onclick=skip;
$('duelShare').onclick=()=>{
const link='https://t.me/PhotoWordBot?startapp=duel_'+code;
const url='https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent(t().shareText(duel.stake));
if(window.Telegram?.WebApp?.openTelegramLink)Telegram.WebApp.openTelegramLink(url);else location.href=url;
};
window.addEventListener('storage',e=>{if(e.key==='pw.language')labels()});
async function checkHomeOffer(){
 if(!pw.hasAuth||!$('home').classList.contains('active'))return;
 try{const r=await call('offer');$('duelEntryDesc').textContent=r.offer?ft().invite+(r.offer.from||'')+' · '+r.offer.stake+' 🪙':t().desc}catch{/* Keep the entry usable when offline. */}
}
setTimeout(checkHomeOffer,1800);setInterval(checkHomeOffer,12000);

labels();
const start=String(window.Telegram?.WebApp?.initDataUnsafe?.start_param||new URLSearchParams(location.search).get('startapp')||'');
if(/^duel_[A-Fa-f0-9]{16}$/.test(start))invited(start.slice(5).toUpperCase());
})();
