import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "https://esm.sh/@supabase/supabase-js@2.117.1";

type AlertSignal={
 id:number;player_id:string;event_kind:string;first_seen:string;
 evidence:Record<string,unknown>|null;review_status:string;
};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
const getNumber=(source:unknown,limit=100000)=>Number.isFinite(Number(source))?
  Math.max(0,Math.min(limit,Number(source))):0;

function notification(signal:AlertSignal,gameId:string){
 const kind=signal.event_kind==="regular_cadence_high_accuracy"?
  "Необычно ровные интервалы ответов при высокой точности":
  signal.event_kind==="sustained_unusual_accuracy"?
  "Длительная серия ответов с необычно высокой точностью":"Поведенческая аномалия";
 const e=signal.evidence||{};
 const sample=Math.round(getNumber(e.sample));
 const accuracy=getNumber(e.accuracy_percent,100).toFixed(1);
 const sessions=Math.round(getNumber(e.sessions));
 const interval=getNumber(e.mean_interval_seconds,3600);
 const pace=interval>0?interval.toFixed(2)+" сек":"нет данных";
 const seen=String(signal.first_seen||"").slice(0,16).replace("T"," ")+" UTC";
 return [
  "🛡 PhotoWord · сигнал античита",
  "",
  "Игрок: "+gameId.slice(0,50),
  "Тип: "+kind,
  "Ответов в выборке: "+sample,
  "Точность: "+accuracy+"%",
  "Средний интервал: "+pace,
  "Игровых сессий: "+sessions,
  "Обнаружено: "+seen,
  "",
  "Это повод для ручной проверки, НЕ доказательство читерства.",
  "Игрок не заблокирован, монеты и результаты не изменены."
 ].join("\n");
}
function validAdmins(raw:unknown):number[]{
 try{
  const parsed=JSON.parse(String(raw||"[]"));
  if(!Array.isArray(parsed))return [];
  return [...new Set(parsed.filter((n:unknown)=>Number.isSafeInteger(n)&&Number(n)>0).map(Number))].slice(0,5);
 }catch{return []}
}
async function sendMessage(token:string,chatId:number,message:string){
 try{
  const reply=await fetch("https://api.telegram.org/bot"+token+"/sendMessage",{
   method:"POST",headers:{"Content-Type":"application/json"},
   signal:AbortSignal.timeout(10000),
   body:JSON.stringify({chat_id:chatId,text:message,disable_web_page_preview:true})
  });
  const body=await reply.json().catch(()=>null);
  return {ok:Boolean(reply.ok&&body?.ok),error:reply.ok?"telegram_not_ok":"telegram_http_"+reply.status};
 }catch{return {ok:false,error:"telegram_network_error"}}
}
Deno.serve(async(req)=>{
 if(req.method!=="POST")return json({error:"method"},405);
 const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {auth:{persistSession:false,autoRefreshToken:false}});
 const incoming=req.headers.get("x-pw-notification-secret")||"";
 if(!incoming)return json({error:"forbidden"},403);
 const config=await db.from("app_config").select("key,value")
  .in("key",["notification_dispatch_secret","support_admin_telegram_ids"]);
 if(config.error)return json({error:"db"},503);
 const settings=new Map((config.data||[]).map((x:{key:string,value:string})=>[x.key,x.value]));
 if(!settings.get("notification_dispatch_secret")||incoming!==settings.get("notification_dispatch_secret"))
  return json({error:"forbidden"},403);
 const token=Deno.env.get("TELEGRAM_BOT_TOKEN");
 const admins=validAdmins(settings.get("support_admin_telegram_ids"));
 if(!token||!admins.length)return json({error:"alerts_not_configured"},503);

 const signals=await db.from("bot_behavior_signals")
  .select("id,player_id,event_kind,first_seen,evidence,review_status")
  .eq("review_status","pending")
  .gte("last_seen",new Date(Date.now()-7*86400000).toISOString())
  .order("first_seen",{ascending:true}).limit(30);
 if(signals.error)return json({error:"db"},503);
 if(!signals.data?.length)return json({sent:0,failed:0,pending:0});
 const ids=[...new Set((signals.data as AlertSignal[]).map(s=>s.player_id))];
 const players=await db.from("players").select("id,photoword_id").in("id",ids);
 if(players.error)return json({error:"db"},503);
 const names=new Map((players.data||[]).map((p:{id:string,photoword_id:string})=>[p.id,p.photoword_id]));
 let sent=0,failed=0,claimed=0;
 for(const signal of signals.data as AlertSignal[]){
  for(const admin of admins){
   if(claimed>=15)return json({sent,failed,pending:signals.data.length,cap_reached:true});
   const lease=await db.rpc("claim_bot_alert_delivery_server",{
    p_signal_id:signal.id,p_admin_id:admin
   });
   if(lease.error){failed++;continue}
   if(typeof lease.data!=="string")continue;
   claimed++;
   const delivered=await sendMessage(token,admin,notification(signal,
    names.get(signal.player_id)||"неизвестный PhotoWord ID"));
   const finish=await db.rpc("finish_bot_alert_delivery_server",{
    p_signal_id:signal.id,p_admin_id:admin,p_claim_token:lease.data,
    p_sent:delivered.ok,p_error:delivered.ok?null:delivered.error
   });
   if(delivered.ok&&finish.data===true&&!finish.error)sent++;
   else failed++;
  }
 }
 return json({sent,failed,pending:signals.data.length});
});
