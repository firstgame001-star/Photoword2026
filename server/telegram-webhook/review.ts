// Private PhotoWord bot-behavior case review. Read-only evidence and reversible
// decisions only; this module must NEVER change balances, games or account access.
type TelegramSend=(token:string,method:string,payload:any)=>Promise<any>;
const statuses:Record<string,string>={
 pending:"Новый сигнал",in_review:"В работе",dismissed:"Ложное срабатывание",
 reviewed:"Проверено без санкций"
};
const reasons:Record<string,string>={
 regular_cadence_high_accuracy:"Ровные интервалы + высокая точность",
 sustained_unusual_accuracy:"Длительная серия ответов почти без ошибок"
};
const stateCodes:Record<string,string>={pending:"p",in_review:"i",dismissed:"d",reviewed:"r"};
const codeStates:Record<string,string>={p:"pending",i:"in_review",d:"dismissed",r:"reviewed"};
type SignalRow={id:number,player_id:string,event_kind:string,review_status:string,
 evidence:any,observations:number,first_seen:string,last_seen:string};
const safeNum=(x:unknown,maximum=100000)=>Number.isFinite(Number(x))?
 Math.min(maximum,Math.max(0,Number(x))):0;

async function staff(db:any,id:number){
 if(!Number.isSafeInteger(id)||id<=0)return false;
 const cfg=await db.from("app_config").select("value").eq("key","support_admin_telegram_ids").maybeSingle();
 if(cfg.error)return false;
 try{const admins=JSON.parse(String(cfg.data?.value||"[]"));
  return Array.isArray(admins)&&admins.some((v:unknown)=>Number.isSafeInteger(v)&&v===id);
 }catch{return false}
}
function actions(id:number,status:string){
 const v=stateCodes[status];
 if(!v)return {inline_keyboard:[]};
 const btn=(label:string,action:string)=>({text:label,callback_data:"ac:"+action+":"+id+":"+v});
 const rows:any[]=[];
 if(status==="pending")rows.push([btn("🔎 В работу","i")]);
 if(status==="pending"||status==="in_review")
  rows.push([btn("✅ Ложный сигнал","d"),btn("📋 Проверено","r")]);
 if(status!=="pending")rows.push([btn("↩ Вернуть в очередь","p")]);
 return {inline_keyboard:rows};
}
async function card(db:any,id:number){
 if(!Number.isSafeInteger(id)||id<=0)return null;
 const record=await db.from("bot_behavior_signals")
  .select("id,player_id,event_kind,review_status,evidence,observations,first_seen,last_seen")
  .eq("id",id).maybeSingle();
 if(record.error||!record.data)return null;
 const s:SignalRow=record.data;
 const [player,hist]=await Promise.all([
  db.from("players").select("photoword_id").eq("id",s.player_id).maybeSingle(),
  db.from("bot_behavior_review_history")
   .select("previous_status,new_status,note,created_at")
   .eq("signal_id",id).order("created_at",{ascending:false}).limit(5)
 ]);
 if(player.error||hist.error)return null;
 const e=s.evidence||{};
 const lines=[
  "🛡 PhotoWord · сигнал #"+id,
  "Статус: "+(statuses[s.review_status]||"Неизвестно"),
  "Игрок: "+String(player.data?.photoword_id||"Профиль удалён").slice(0,52),
  "Признак: "+(reasons[s.event_kind]||"Статистическая аномалия"),
  "Ответов в выборке: "+Math.round(safeNum(e.sample)),
  "Точность: "+safeNum(e.accuracy_percent,100).toFixed(1)+"%",
  "Средний интервал: "+safeNum(e.mean_interval_seconds,3600).toFixed(2)+" сек",
  "Коэффициент вариации: "+safeNum(e.interval_cv,100).toFixed(3),
  "Сессий: "+Math.round(safeNum(e.sessions)),
  "Повторных наблюдений: "+Math.round(safeNum(s.observations)),
  "Обнаружено: "+String(s.first_seen||"").slice(0,16).replace("T"," ")+" UTC",
  "Последнее: "+String(s.last_seen||"").slice(0,16).replace("T"," ")+" UTC",
  "","История:"
 ];
 if(!hist.data?.length)lines.push("Решений ещё не было.");
 else for(const h of hist.data.slice(0,5)){
  const when=String(h.created_at||"").slice(0,16).replace("T"," ");
  lines.push(when+" · "+(statuses[h.previous_status]||h.previous_status)+" → "+
   (statuses[h.new_status]||h.new_status)+(h.note?" · "+String(h.note).slice(0,100):""));
 }
 lines.push("","⚠️ Сигнал НЕ является доказательством читерства.",
  "Эти решения не блокируют игрока и не меняют награды.",
  "Пояснение к решению: /case_decide "+id+" in_review текст");
 return {text:lines.join("\n"),reply_markup:actions(id,s.review_status)};
}
const parseId=(x:string)=>{const n=Number(x);return /^[1-9][0-9]{0,14}$/.test(x)&&Number.isSafeInteger(n)?n:0};
export async function handleReviewCommand(
 db:any,token:string,telegram:TelegramSend,
 sender:number,chatId:number,command:string,input:string
):Promise<boolean>{
 const send=(text:string,reply_markup?:any)=>telegram(token,"sendMessage",
  {chat_id:chatId,text,...(reply_markup?{reply_markup}:{})});
 if(!await staff(db,sender)){
  await send("Доступ к проверке античита закрыт.");
  return true;
 }
 if(command==="/anticheat"){
  const q=await db.from("bot_behavior_signals")
   .select("id,review_status,event_kind,player_id,last_seen")
   .in("review_status",["pending","in_review"]).order("last_seen",{ascending:false}).limit(12);
  if(q.error)return false;
  if(!q.data?.length){await send("🛡 Очередь античита пуста. Новых сигналов нет.");return true}
  const ids=[...new Set(q.data.map((s:any)=>s.player_id))];
  const players=await db.from("players").select("id,photoword_id").in("id",ids);
  if(players.error)return false;
  const names=new Map((players.data||[]).map((s:any)=>[s.id,s.photoword_id]));
  const lines=["🛡 Очередь античита ("+q.data.length+" последних):"];
  for(const item of q.data){
   lines.push("#"+item.id+" · "+(statuses[item.review_status]||item.review_status)+
    " · "+String(names.get(item.player_id)||"Профиль удалён").slice(0,35),
    reasons[item.event_kind]||"Поведенческая аномалия");
  }
  lines.push("","Открыть подробнее: /case ID");
  const kb={inline_keyboard:q.data.slice(0,10).map((s:any)=>[{
    text:"#"+s.id+" · "+(statuses[s.review_status]||""),
    callback_data:"ac:o:"+s.id+":p"
  }])};
  await send(lines.join("\n"),kb);
  return true;
 }
 const parts=input.trim().split(/\s+/);
 const id=parseId(parts[1]||"");
 if(!id){
  await send("/anticheat — очередь\n/case ID — подробности\n"+
   "/case_decide ID in_review|dismissed|reviewed|pending пояснение (до 500 символов)");
  return true;
 }
 if(command==="/case_decide"){
  const newStatus=parts[2]||"";
  const note=parts.slice(3).join(" ").trim();
  if(!["pending","in_review","dismissed","reviewed"].includes(newStatus)||note.length>500){
   await send("Укажите статус pending / in_review / dismissed / reviewed. Пояснение до 500 символов.");
   return true;
  }
  const old=await db.from("bot_behavior_signals").select("review_status").eq("id",id).maybeSingle();
  if(old.error)return false;
  if(!old.data){await send("Сигнал не найден.");return true}
  const result=await db.rpc("review_bot_behavior_signal_server",{
   p_signal_id:id,p_reviewer_telegram_id:sender,
   p_expected_status:old.data.review_status,p_new_status:newStatus,p_note:note
  });
  if(result.error)return false;
  await send(result.data?.ok===true?"Решение сохранено.":
   result.data?.reason==="stale"?"Дело уже изменилось. Откройте карточку заново.":
   "Действие не принято.");
 }
 const info=await card(db,id);
 if(info)await send(info.text,info.reply_markup);
 else await send("Не удалось открыть сигнал или он не найден.");
 return true;
}
export async function handleReviewCallback(
 db:any,token:string,telegram:TelegramSend,callback:any
):Promise<boolean>{
 const chat=callback.message?.chat;
 const sender=Number(callback.from?.id);
 const reply=async(text:string,show_alert=false)=>
  telegram(token,"answerCallbackQuery",{callback_query_id:callback.id,text,show_alert});
 if(!chat||chat.type!=="private"||Number(chat.id)!==sender||!await staff(db,sender)){
  await reply("Доступ запрещён.",true);return true;
 }
 const parsed=String(callback.data||"").match(/^ac:([oidrp]):([1-9][0-9]{0,14}):([pird])$/);
 if(!parsed){await reply("Некорректная команда.",true);return true;}
 const id=parseId(parsed[2]);
 if(!id){await reply("Некорректный номер.",true);return true}
 if(parsed[1]!=="o"){
  const dest=codeStates[parsed[1]],prev=codeStates[parsed[3]];
  const result=await db.rpc("review_bot_behavior_signal_server",{
   p_signal_id:id,p_reviewer_telegram_id:sender,
   p_expected_status:prev,p_new_status:dest,p_note:""
  });
  if(result.error){await reply("Ошибка сервера. Повторите.",true);return false;}
  if(result.data?.ok===true){
   if(callback.message?.message_id)await telegram(token,"editMessageReplyMarkup",{
    chat_id:chat.id,message_id:callback.message.message_id,
    reply_markup:{inline_keyboard:[]}
   }).catch(()=>{});
   await reply("Решение сохранено.");
  }else await reply(result.data?.reason==="stale"?
   "Карточка устарела, смотрите обновление.":"Решение не принято.",true);
 }else await reply("Открываю дело.");
 const info=await card(db,id);
 if(info)await telegram(token,"sendMessage",{chat_id:chat.id,...info});
 else await telegram(token,"sendMessage",{chat_id:chat.id,text:"Сигнал не найден."});
 return true;
}
