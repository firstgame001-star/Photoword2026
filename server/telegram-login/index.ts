import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const headers={"Access-Control-Allow-Origin":"https://firstgame001-star.github.io","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin"};
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
const enc=new TextEncoder();
const APP_URL="https://firstgame001-star.github.io/Photoword2026/clean/";
let botUiConfigured=false;
function notificationCopy(language:string,kind:string,chapter=0){
 const l=language==="en"?"en":language==="az"?"az":"ru";
 const c:any={
  ru:{enabled:"🔔 Уведомления PhotoWord включены. Тестовое сообщение доставлено.",test:"🔔 Тест PhotoWord: уведомления работают.",chapter:(n:number)=>"🔓 Открыта глава "+n+"! Можно продолжать приключение.",play:"🎮 Играть"},
  en:{enabled:"🔔 PhotoWord notifications are enabled. Test message delivered.",test:"🔔 PhotoWord test: notifications are working.",chapter:(n:number)=>"🔓 Chapter "+n+" is unlocked! Keep playing.",play:"🎮 Play"},
  az:{enabled:"🔔 PhotoWord bildirişləri aktivdir. Test mesajı çatdırıldı.",test:"🔔 PhotoWord testi: bildirişlər işləyir.",chapter:(n:number)=>"🔓 "+n+"-ci fəsil açıldı! Oyuna davam et.",play:"🎮 Oyna"}
 }[l];
 return {text:kind==="chapter_unlocked"?c.chapter(chapter):kind==="test"?c.test:c.enabled,button:c.play};
}
async function sendNotification(token:string,chatId:number,language:string,kind:string,chapter=0,url=APP_URL){
 const c=notificationCopy(language,kind,chapter);
 try{
  const r=await fetch("https://api.telegram.org/bot"+token+"/sendMessage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:chatId,text:c.text,reply_markup:{inline_keyboard:[[{"text":c.button,"web_app":{"url":url}}]]}})});
  const j=await r.json();return Boolean(j?.ok);
 }catch{return false}
}
async function botCall(token:string,method:string,payload:any){try{await fetch("https://api.telegram.org/bot"+token+"/"+method,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});}catch{}}
async function ensureBotUi(token:string){
 if(botUiConfigured)return;botUiConfigured=true;
 await Promise.all([
  botCall(token,"setMyCommands",{commands:[{command:"start",description:"Запустить PhotoWord"},{command:"play",description:"Открыть игру"},{command:"support",description:"Поддержка"},{command:"help",description:"Помощь"}]}),
  botCall(token,"setChatMenuButton",{menu_button:{type:"web_app",text:"🎮 Играть",web_app:{url:APP_URL}}}),
  botCall(token,"setMyDescription",{description:"PhotoWord — 4 изображения, 1 слово. Решай уровни, получай XP и монеты."}),
  botCall(token,"setMyShortDescription",{short_description:"4 изображения · 1 слово · RU / EN / AZ"})
 ]);
}
async function webhookSecret(token:string){const data=new TextEncoder().encode(token);const hash=await crypto.subtle.digest("SHA-256",data);return "pw_"+Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("").slice(0,48);}
async function sign(key:Uint8Array,data:string){const k=await crypto.subtle.importKey("raw",key,{name:"HMAC",hash:"SHA-256"},false,["sign"]);return crypto.subtle.sign("HMAC",k,enc.encode(data));}
async function verify(raw:unknown,token:string){
 if(typeof raw!=="string"||raw.length>16384)return null;
 const p=new URLSearchParams(raw),hash=p.get("hash");
 if(!hash||! /^[a-fA-F0-9]{64}$/.test(hash))return null;
 const seen=new Set<string>();for(const [key] of p){if(seen.has(key))return null;seen.add(key);}
 const date=Number(p.get("auth_date")),now=Date.now()/1000;
 if(!Number.isInteger(date)||date<=0||now-date>86400||date>now+60)return null;
 p.delete("hash");
 const check=[...p.entries()].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>k+"="+v).join("\n");
 const secret=await sign(enc.encode("WebAppData"),token);
 const key=await crypto.subtle.importKey("raw",secret,{name:"HMAC",hash:"SHA-256"},false,["verify"]);
 const signature=new Uint8Array(hash.match(/../g)!.map(x=>parseInt(x,16)));
 if(!await crypto.subtle.verify("HMAC",key,signature,enc.encode(check)))return null;
 try{const u=JSON.parse(p.get("user")||"null");return u&&Number.isSafeInteger(u.id)&&u.id>0?u:null;}catch{return null;}
}
function profile(p:any,rank:number){return {photoword_id:p.photoword_id,first_name:p.first_name,last_name:p.last_name,username:p.username,game_nickname:p.game_nickname,nickname_changed:p.nickname_changed,notifications_enabled:p.notifications_enabled,notification_language:p.notification_language,avatar_url:p.avatar_url,avatar_frame:p.avatar_frame,featured_achievements:p.featured_achievements,progress_generation:p.progress_generation,coins:p.coins,xp:p.xp,current_chapter:p.current_chapter,current_level:p.current_level,completed_levels:p.completed_levels,daily_streak:p.daily_streak,last_daily_reward:p.last_daily_reward,rank};}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply({error:"method"},405);
 if(req.headers.get("origin")&&req.headers.get("origin")!=="https://firstgame001-star.github.io")return reply({error:"origin"},403);
 const token=Deno.env.get("TELEGRAM_BOT_TOKEN");if(!token)return reply({error:"not_configured"},503);
 try{
  const raw=await req.text();if(raw.length>32768)return reply({error:"body_too_large"},413);
  let body;try{body=JSON.parse(raw);}catch{return reply({error:"json"},400);}
  const user=await verify(body?.initData,token);if(!user)return reply({error:"invalid_telegram_auth"},401);
  const action=body?.action||"login";
  if(!["login","use_hint","complete_level","theme_hint","theme_complete","claim_daily","claim_task","create_invoice","create_energy_invoice","register_referral","friends","reset_progress","set_nickname","enable_notifications","public_config","ad_prepare","ad_claim","track_event","erase_account","theme_progress","profile_stats","shop_status","notification_state","update_notifications","test_notification"].includes(action))return reply({error:"unknown_action"},400);
  const level=Number(body?.levelId);
  const themeId=typeof body?.themeId==="string"?body.themeId:"";
  const themeIds=new Set(["sport","art","professions","travel","science","technology","cinema","food","animals","transport","home","nature"]);
  if(["use_hint","complete_level"].includes(action)&&(!Number.isInteger(level)||level<1||level>680))return reply({error:"bad_level"},400);
  if(["theme_hint","theme_complete"].includes(action)&&(!themeIds.has(themeId)||!Number.isInteger(level)||level<1||level>100))return reply({error:"bad_level"},400);
  const costs:Record<string,number>={letter:50,remove:100,text:150};
  if(["use_hint","theme_hint"].includes(action)&&!Object.hasOwn(costs,body.hintType))return reply({error:"bad_hint"},400);
  const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
  let mainAnswers:string[]|null=null;
  let mainAnswer:string|null=null;
  let hintPayload:Record<string,unknown>|null=null;
  if(["use_hint","complete_level"].includes(action)){
   const result=await db.from("main_level_answers").select("ru,en,az").eq("level_id",level).maybeSingle();
   if(result.error||!result.data)return reply({error:"answer_unavailable"},500);
   mainAnswers=[result.data.ru,result.data.en,result.data.az].filter((value):value is string=>typeof value==="string");
   const language=["ru","en","az"].includes(String(body?.language))?String(body.language):"ru";
   mainAnswer=result.data[language] as string;
   if(action==="complete_level"&&(typeof body.answer!=="string"||!mainAnswers.includes(body.answer.trim().toLocaleUpperCase("az")))){
    const attempt=await db.rpc("register_wrong_main_answer",{p_telegram_id:user.id,p_level_id:level});
    if(attempt.error)return reply({error:"answer_attempt_failed"},500);
    if(attempt.data!==true)return reply({error:"answer_rate_limited"},429);
    return reply({error:"wrong_answer"},422);
   }
   if(action==="use_hint"&&body.hintType==="letter"){
    const chars=[...mainAnswer],fixed=Array.isArray(body.fixedPositions)?body.fixedPositions.filter((v:unknown)=>Number.isInteger(v)&&Number(v)>=0&&Number(v)<chars.length):[];
    const open=chars.map((_,i)=>i).filter(i=>!fixed.includes(i));
    if(!open.length)return reply({error:"all_letters"},409);
    const position=open[Math.floor(Math.random()*open.length)];
    hintPayload={position,letter:chars[position]};
   }else if(action==="use_hint"&&body.hintType==="remove"&&typeof body.pool==="string"){
    const pool=[...body.pool.slice(0,64)];
    const need:Record<string,number>={};for(const ch of mainAnswer)need[ch]=(need[ch]||0)+1;
    const have:Record<string,number>={};const removeIndices:number[]=[];
    pool.forEach((ch,index)=>{have[ch]=(have[ch]||0)+1;if(have[ch]>(need[ch]||0)&&removeIndices.length<3)removeIndices.push(index)});
    if(!removeIndices.length)return reply({error:"no_extra_letters"},409);
    hintPayload={removeIndices};
   }
  }
  let themeAnswer:string|null=null;
  if(["theme_hint","theme_complete"].includes(action)){
   const result=await db.from("theme_level_answers").select("ru,en,az").eq("theme_id",themeId).eq("level_id",level).maybeSingle();
   if(result.error||!result.data)return reply({error:"answer_unavailable"},500);
   const language=["ru","en","az"].includes(String(body?.language))?String(body.language):"ru";
   themeAnswer=result.data[language] as string;
   if(action==="theme_complete"&&(typeof body.answer!=="string"||body.answer.trim().toLocaleUpperCase("az")!==themeAnswer)){
    const attempt=await db.rpc("register_wrong_theme_answer",{p_telegram_id:user.id,p_theme_id:themeId,p_level_id:level});
    if(attempt.error)return reply({error:"answer_attempt_failed"},500);
    if(attempt.data!==true)return reply({error:"answer_rate_limited"},429);
    return reply({error:"wrong_answer"},422);
   }
   if(action==="theme_hint"&&body.hintType==="letter"){
    const chars=[...themeAnswer],fixed=Array.isArray(body.fixedPositions)?body.fixedPositions.filter((v:unknown)=>Number.isInteger(v)&&Number(v)>=0&&Number(v)<chars.length):[];
    const open=chars.map((_,i)=>i).filter(i=>!fixed.includes(i));
    if(!open.length)return reply({error:"all_letters"},409);
    const position=open[Math.floor(Math.random()*open.length)];
    hintPayload={position,letter:chars[position]};
   }else if(action==="theme_hint"&&body.hintType==="remove"&&typeof body.pool==="string"){
    const pool=[...body.pool.slice(0,64)],need:Record<string,number>={};for(const ch of themeAnswer)need[ch]=(need[ch]||0)+1;
    const have:Record<string,number>={},removeIndices:number[]=[];
    pool.forEach((ch,index)=>{have[ch]=(have[ch]||0)+1;if(have[ch]>(need[ch]||0)&&removeIndices.length<3)removeIndices.push(index)});
    if(!removeIndices.length)return reply({error:"no_extra_letters"},409);
    hintPayload={removeIndices};
   }
  }
  const text=(value:unknown,max:number)=>typeof value==="string"?value.slice(0,max):null;
  const fields={first_name:text(user.first_name,256),last_name:text(user.last_name,256),username:text(user.username,64),avatar_url:text(user.photo_url,2048)};
  let {data:player,error}=await db.from("players").select("*").eq("telegram_id",user.id).maybeSingle();
  if(error)return reply({error:"db"},500);
  if(!player){
   const r=await db.from("players").insert({...fields,telegram_id:user.id,photoword_id:"PW-"+crypto.randomUUID().replaceAll("-","").slice(0,16).toUpperCase()}).select("*").single();
   if(r.error){const existing=await db.from("players").select("*").eq("telegram_id",user.id).maybeSingle();if(!existing.data)return reply({error:"create"},500);player=existing.data;}else player=r.data;
  }else if(action==="login"){
   const r=await db.from("players").update(fields).eq("id",player.id).select("*").single();if(r.error)return reply({error:"db"},500);player=r.data;
  }
  if(action!=="login"&&action!=="reset_progress"&&body.progressGeneration!==undefined&&body.progressGeneration!==player.progress_generation)return reply({error:"progress_reset"},409);
  if(action==="profile_stats"){
   const themeRows=await db.from("theme_progress").select("theme_id,level_id").eq("player_id",player.id);
   if(themeRows.error)return reply({error:"db"},500);
   const themeCounts:any={sport:0,art:0,professions:0,travel:0,science:0,technology:0,cinema:0,food:0,animals:0,transport:0,home:0,nature:0};
   for(const row of themeRows.data||[]){if(Object.hasOwn(themeCounts,row.theme_id))themeCounts[row.theme_id]++;}
   const themeLevels=Object.values(themeCounts).reduce((a:any,b:any)=>Number(a)+Number(b),0);
   const themesComplete=Object.values(themeCounts).filter((n:any)=>Number(n)>=100).length;

   const cp=await db.from("challenge_profiles").select("limited_best_score,nohint_best_streak,blitz_best_score,blitz_best_streak").eq("player_id",player.id).maybeSingle();
   if(cp.error)return reply({error:"db"},500);
   const cr=await db.from("challenge_runs").select("reward_coins,reward_xp").eq("player_id",player.id);
   if(cr.error)return reply({error:"db"},500);
   let challengeRewardCoins=0,challengeRewardXp=0;
   for(const row of cr.data||[]){challengeRewardCoins+=Number(row.reward_coins||0);challengeRewardXp+=Number(row.reward_xp||0);}

   const daily=await db.rpc("profile_daily_summary",{p_telegram_id:user.id});if(daily.error)return reply({error:"db"},500);
   return reply({stats:{
    daily:daily.data,
    theme_levels_completed:themeLevels,
    themes_completed:themesComplete,
    themes_total:12,
    theme_counts:themeCounts,
    challenge:{
      limited_best_score:Number(cp.data?.limited_best_score||0),
      nohint_best_streak:Number(cp.data?.nohint_best_streak||0),
      blitz_best_score:Number(cp.data?.blitz_best_score||0),
      blitz_best_streak:Number(cp.data?.blitz_best_streak||0),
      runs_total:(cr.data||[]).length,
      reward_coins:challengeRewardCoins,
      reward_xp:challengeRewardXp
    }
   }});
  }
  if(action==="theme_progress"){
   const rows=await db.from("theme_progress").select("theme_id,level_id").eq("player_id",player.id).order("theme_id").order("level_id");
   if(rows.error)return reply({error:"db"},500);
   const progress:any={sport:[],art:[],professions:[],travel:[],science:[],technology:[],cinema:[],food:[],animals:[],transport:[],home:[],nature:[]};
   for(const row of rows.data||[]){if(Array.isArray(progress[row.theme_id]))progress[row.theme_id].push(Number(row.level_id));}
   return reply({theme_progress:progress});
  }
  if(["use_hint","complete_level"].includes(action)&&level>(player.current_level??1))return reply({error:"level_locked"},409);
  if(action==="use_hint"){
   const hintCost=costs[body.hintType];
   if(!hintCost)return reply({error:"bad_hint"},400);
   const spent=await db.rpc("spend_hint_server",{p_telegram_id:user.id,p_level_id:level,p_hint_type:String(body.hintType),p_cost:hintCost});
   if(spent.error){
    const m=String(spent.error.message||"");
    if(m.includes("insufficient_coins"))return reply({error:"insufficient_coins"},402);
    if(m.includes("level_locked"))return reply({error:"level_locked"},409);
    if(m.includes("level_completed"))return reply({error:"level_completed"},409);
    if(m.includes("bad_hint"))return reply({error:"bad_hint"},400);
    return reply({error:"hint_failed"},500);
   }
   player=spent.data;
  }
  if(action==="complete_level"){
   const playerId=player.id,language=["ru","en","az"].includes(String(player.notification_language||body.language||""))?String(player.notification_language||body.language):"ru";
   const prior=await db.from("level_progress").select("completed").eq("player_id",playerId).eq("level_id",level).maybeSingle();
   if(prior.error)return reply({error:"db"},500);
   const wasDone=Boolean(prior.data?.completed);
   const r=await db.rpc("complete_level_server",{p_telegram_id:user.id,p_level_id:level,p_reward_coins:20,p_reward_xp:15});if(r.error){const m=String(r.error.message||"");if(m.includes("level_too_fast"))return reply({error:"level_too_fast",retry_after_seconds:3},429);if(m.includes("level_locked"))return reply({error:"level_locked"},409);return reply({error:"complete_failed"},500);}player=r.data;
   const rr=await db.rpc("reward_qualified_referral_server",{p_invitee_telegram_id:user.id});if(!rr.error&&rr.data)player=rr.data;
   const nextChapter:any={20:2,50:3,90:4,130:5,180:6,230:7,280:8,330:9,380:10,430:11,480:12}[level];
   if(!wasDone&&nextChapter){
    const pref=await db.from("notification_settings").select("chapter_unlocked").eq("player_id",playerId).maybeSingle();
    const enabled=Boolean((Array.isArray(player)?player[0]?.notifications_enabled:player?.notifications_enabled));
    if(enabled&&(pref.data?.chapter_unlocked??true)){
     const dedupe="chapter:"+nextChapter;
     const sentBefore=await db.from("notification_log").select("id").eq("player_id",playerId).eq("kind","chapter_unlocked").eq("dedupe_key",dedupe).maybeSingle();
     if(!sentBefore.data&&await sendNotification(token,user.id,language,"chapter_unlocked",nextChapter,APP_URL+"?chapter="+nextChapter)){
      await db.from("notification_log").insert({player_id:playerId,kind:"chapter_unlocked",dedupe_key:dedupe});
      await db.from("players").update({last_notification_sent_at:new Date().toISOString()}).eq("id",playerId);
     }
    }
   }
  }
  if(action==="theme_hint"){
   const hintCost=costs[body.hintType];
   const spent=await db.rpc("spend_theme_hint_server",{p_telegram_id:user.id,p_theme_id:themeId,p_level_id:level,p_hint_type:String(body.hintType),p_cost:hintCost});
   if(spent.error){
    const m=String(spent.error.message||"");
    if(m.includes("insufficient_coins"))return reply({error:"insufficient_coins"},402);
    if(m.includes("bad_hint"))return reply({error:"bad_hint"},400);
    if(m.includes("bad_theme_level"))return reply({error:"bad_level"},400);
    return reply({error:"hint_failed"},500);
   }
   player=spent.data;
  }
  let themeRewarded=false;
  if(action==="theme_complete"){
   const language=["ru","en","az"].includes(String(body.language||""))?String(body.language):"ru";
   if(typeof body.answer!=="string")return reply({error:"wrong_answer"},422);
   const prior=await db.from("theme_progress").select("level_id").eq("player_id",player.id).eq("theme_id",themeId).eq("level_id",level).maybeSingle();
   if(prior.error)return reply({error:"db"},500);
   const done=await db.rpc("complete_theme_level_server",{p_telegram_id:user.id,p_theme_id:themeId,p_level_id:level,p_language:language,p_answer:String(body.answer),p_reward_coins:15,p_reward_xp:10});
   if(done.error){
    const m=String(done.error.message||"");
    if(m.includes("wrong_answer"))return reply({error:"wrong_answer"},422);
    if(m.includes("bad_theme_level"))return reply({error:"bad_level"},400);
    if(m.includes("theme_level_locked"))return reply({error:"theme_level_locked"},409);if(m.includes("theme_level_too_fast"))return reply({error:"level_too_fast",retry_after_seconds:3},429);
    return reply({error:"complete_failed"},500);
   }
   player=done.data;themeRewarded=!prior.data;
  }
  if(action==="set_nickname"){
   const nick=typeof body.nickname==="string"?body.nickname:"";
   const r=await db.rpc("set_game_nickname_server",{p_telegram_id:user.id,p_nickname:nick});
   if(r.error){const m=r.error.message||"";const e=m.includes("nickname_locked")?"nickname_locked":m.includes("nickname_taken")?"nickname_taken":m.includes("bad_nickname")?"bad_nickname":"nickname_failed";return reply({error:e},409);}player=r.data;
  }
  if(action==="notification_state"){
   const pref=await db.from("notification_settings").select("*").eq("player_id",player.id).maybeSingle();
   if(pref.error)return reply({error:"notification_failed"},500);
   return reply({notifications:{
    enabled:Boolean(player.notifications_enabled),
    daily_reward:pref.data?.daily_reward??true,
    energy_full:pref.data?.energy_full??true,
    chapter_unlocked:pref.data?.chapter_unlocked??true,
    timezone_offset_minutes:Number(pref.data?.timezone_offset_minutes||0),
    language:player.notification_language||"ru"
   }});
  }
  if(action==="update_notifications"){
   const enabled=Boolean(body.enabled),l=["ru","en","az"].includes(String(body.language||""))?String(body.language):"ru";
   const offset=Math.max(-840,Math.min(840,Math.round(Number(body.timezoneOffsetMinutes)||0)));
   const settings={
    player_id:player.id,
    daily_reward:body.dailyReward!==false,
    energy_full:body.energyFull!==false,
    chapter_unlocked:body.chapterUnlocked!==false,
    timezone_offset_minutes:offset,
    updated_at:new Date().toISOString()
   };
   const upPref=await db.from("notification_settings").upsert(settings,{onConflict:"player_id"});if(upPref.error)return reply({error:"notification_failed"},500);
   const wasEnabled=Boolean(player.notifications_enabled);
   if(enabled&&!wasEnabled){
    if(!await sendNotification(token,user.id,l,"enabled"))return reply({error:"notification_failed"},502);
   }
   const upd=await db.from("players").update({
    notifications_enabled:enabled,notification_language:l,
    notifications_enabled_at:enabled?(player.notifications_enabled_at||new Date().toISOString()):player.notifications_enabled_at,
    last_notification_sent_at:enabled&&!wasEnabled?new Date().toISOString():player.last_notification_sent_at
   }).eq("id",player.id).select("*").single();
   if(upd.error||!upd.data)return reply({error:"notification_failed"},500);player=upd.data;
   if(enabled&&!wasEnabled){
    await db.from("notification_log").insert({player_id:player.id,kind:"test",dedupe_key:"enable:"+crypto.randomUUID()});
   }
   return reply({notifications:{enabled,daily_reward:settings.daily_reward,energy_full:settings.energy_full,chapter_unlocked:settings.chapter_unlocked,timezone_offset_minutes:offset,language:l}});
  }
  if(action==="test_notification"){
   const l=["ru","en","az"].includes(String(body.language||player.notification_language||""))?String(body.language||player.notification_language):"ru";
   if(!player.notifications_enabled)return reply({error:"notifications_disabled"},409);
   if(!await sendNotification(token,user.id,l,"test"))return reply({error:"notification_failed"},502);
   await db.from("notification_log").insert({player_id:player.id,kind:"test",dedupe_key:"manual:"+crypto.randomUUID()});
   await db.from("players").update({last_notification_sent_at:new Date().toISOString()}).eq("id",player.id);
   return reply({ok:true});
  }
  if(action==="shop_status"){
   const now=Date.now(),energyMax=5,energyMs=30*60*1000;
   const cp=await db.from("challenge_profiles").select("limited_energy,energy_ref_at").eq("player_id",player.id).maybeSingle();
   if(cp.error)return reply({error:"shop_failed"},500);
   let energy=Number(cp.data?.limited_energy??energyMax),ref=Date.parse(cp.data?.energy_ref_at||new Date(now).toISOString());
   if(!Number.isFinite(ref))ref=now;
   if(energy<energyMax){
    const gain=Math.floor(Math.max(0,now-ref)/energyMs);
    if(gain>0){
     energy=Math.min(energyMax,energy+gain);ref=energy>=energyMax?now:ref+gain*energyMs;
     await db.from("challenge_profiles").update({limited_energy:energy,energy_ref_at:new Date(ref).toISOString(),updated_at:new Date(now).toISOString()}).eq("player_id",player.id);
    }
   }

   const cfg=await db.from("app_config").select("key,value").in("key",["adsgram_reward_block_id"]);
   if(cfg.error)return reply({error:"shop_failed"},500);
   const blockId=String((cfg.data||[]).find((x:any)=>x.key==="adsgram_reward_block_id")?.value||"").trim();
   const day=new Date(now);day.setUTCHours(0,0,0,0);
   const adCount=await db.from("ad_reward_claims").select("id",{count:"exact",head:true}).eq("player_id",player.id).eq("status","claimed").gte("claimed_at",day.toISOString());
   if(adCount.error)return reply({error:"shop_failed"},500);

   const [coinHistory,energyHistory,adHistory]=await Promise.all([
    db.from("star_purchases").select("stars,coins,created_at").eq("player_id",player.id).order("created_at",{ascending:false}).limit(20),
    db.from("challenge_energy_purchases").select("stars,energy_added,created_at").eq("player_id",player.id).order("created_at",{ascending:false}).limit(20),
    db.from("ad_reward_claims").select("reward_coins,claimed_at").eq("player_id",player.id).eq("status","claimed").order("claimed_at",{ascending:false}).limit(20)
   ]);
   if(coinHistory.error||energyHistory.error||adHistory.error)return reply({error:"shop_failed"},500);
   const history:any[]=[];
   for(const row of coinHistory.data||[])history.push({type:"coins",coins:Number(row.coins||0),stars:Number(row.stars||0),at:row.created_at});
   for(const row of energyHistory.data||[])history.push({type:"energy",energy:Number(row.energy_added||0),stars:Number(row.stars||0),at:row.created_at});
   for(const row of adHistory.data||[])history.push({type:"ad",coins:Number(row.reward_coins||0),stars:0,at:row.claimed_at});
   history.sort((a,b)=>Date.parse(b.at||"")-Date.parse(a.at||""));

   return reply({shop:{
    coins:Number(player.coins||0),
    energy,
    energy_max:energyMax,
    next_energy_at:energy<energyMax?new Date(ref+energyMs).toISOString():null,
    ads:{configured:Boolean(blockId),reward_coins:5,claimed_today:Number(adCount.count||0),daily_limit:10},
    history:history.slice(0,30)
   }});
  }
  if(action==="public_config"){
   const rows=await db.from("app_config").select("key,value").in("key",["ads_provider","adsgram_reward_block_id","support_contact"]);
   if(rows.error)return reply({error:"config_failed"},500);
   return reply({config:Object.fromEntries((rows.data||[]).map((x:any)=>[x.key,x.value]))});
  }
  if(action==="track_event"){
   const allowed=new Set(["app_open","chapter_open","level_open","level_complete","wrong_answer","hint_use","daily_claim","task_claim","shop_open","invoice_open","payment_status","theme_change","language_change","ad_open","ad_complete","ad_error","support_open","client_error","server_error"]);
   const event=String(body.event||"");if(!allowed.has(event))return reply({error:"bad_event"},400);
   const level=Number.isInteger(Number(body.levelId))?Number(body.levelId):null;
   const chapter=Number.isInteger(Number(body.chapterId))?Number(body.chapterId):null;
   const language=["ru","en","az"].includes(String(body.language||""))?String(body.language):null;
   const md=(body.metadata&&typeof body.metadata==="object"&&!Array.isArray(body.metadata))?body.metadata:{};
   const safeMeta:any={};for(const k of Object.keys(md).slice(0,8)){const v=md[k];if(["string","number","boolean"].includes(typeof v))safeMeta[String(k).slice(0,40)]=typeof v==="string"?String(v).slice(0,120):v;}
   await db.from("game_events").insert({player_id:player.id,event_name:event,level_id:level,chapter_id:chapter,language,metadata:safeMeta});
   return reply({ok:true});
  }
  if(action==="ad_prepare"){
   const cfg=await db.from("app_config").select("value").eq("key","adsgram_reward_block_id").maybeSingle();
   const blockId=String(cfg.data?.value||"").trim();if(!blockId)return reply({error:"ads_not_configured"},409);
   const day=new Date();day.setUTCHours(0,0,0,0);
   const cnt=await db.from("ad_reward_claims").select("id",{count:"exact",head:true}).eq("player_id",player.id).eq("status","claimed").gte("claimed_at",day.toISOString());
   if((cnt.count??0)>=10)return reply({error:"ad_daily_limit"},429);
   const recent=await db.from("ad_reward_claims").select("prepared_at").eq("player_id",player.id).order("prepared_at",{ascending:false}).limit(1).maybeSingle();
   if(recent.data?.prepared_at&&Date.now()-Date.parse(recent.data.prepared_at)<120000)return reply({error:"ad_cooldown"},429);
   const created=await db.from("ad_reward_claims").insert({player_id:player.id}).select("nonce").single();
   if(created.error)return reply({error:"ad_prepare_failed"},500);
   return reply({nonce:created.data.nonce,block_id:blockId,reward:5});
  }
  if(action==="ad_claim"){
   const r=await db.rpc("claim_ad_reward_server",{p_telegram_id:user.id,p_nonce:String(body.nonce||"")});
   if(r.error){const m=r.error.message||"";const e=m.includes("ad_daily_limit")?"ad_daily_limit":m.includes("ad_too_fast")?"ad_too_fast":m.includes("expired")?"ad_claim_expired":"ad_claim_invalid";return reply({error:e},409);}
   player=r.data;
  }
  if(action==="erase_account"){
   if(String(body.confirm||"")!=="ERASE")return reply({error:"erase_confirm"},400);
   const r=await db.rpc("erase_player_account_server",{p_telegram_id:user.id});
   if(r.error)return reply({error:"erase_failed"},500);
   return reply({erased:true});
  }
  if(action==="enable_notifications"){
   const l=["ru","en","az"].includes(String(body.language||""))?String(body.language):"ru";
   const offset=Math.max(-840,Math.min(840,Math.round(Number(body.timezoneOffsetMinutes)||0)));
   const pref=await db.from("notification_settings").upsert({player_id:player.id,daily_reward:true,energy_full:true,chapter_unlocked:true,timezone_offset_minutes:offset,updated_at:new Date().toISOString()},{onConflict:"player_id"});
   if(pref.error)return reply({error:"notification_failed"},500);
   if(!await sendNotification(token,user.id,l,"enabled"))return reply({error:"notification_failed"},502);
   const u=await db.from("players").update({notifications_enabled:true,notification_language:l,notifications_enabled_at:player.notifications_enabled_at||new Date().toISOString(),last_notification_sent_at:new Date().toISOString()}).eq("id",player.id).select("*").single();
   if(u.error||!u.data)return reply({error:"notification_failed"},500);
   await db.from("notification_log").insert({player_id:player.id,kind:"test",dedupe_key:"legacy:"+crypto.randomUUID()});
   player=u.data;
  }
  if(action==="reset_progress"){const r=await db.rpc("reset_game_progress_server",{p_telegram_id:user.id,p_generation:body.progressGeneration??player.progress_generation});if(r.error){const m=String(r.error.message||"");const e=m.includes("reset_duel_active")?"reset_duel_active":m.includes("reset_cooldown")?"reset_cooldown":m.includes("progress_reset")?"progress_reset":"reset_failed";return reply({error:e},409);}player=r.data;}
  if(action==="friends"){
   const {data:refs,error:re}=await db.from("referrals").select("invitee_id,rewarded_at,created_at").eq("inviter_id",player.id).order("created_at",{ascending:false});
   if(re)return reply({error:"friends_failed"},500);
   const ids=(refs||[]).map((x:any)=>x.invitee_id);
   let people:any[]=[];
   if(ids.length){const pr=await db.from("players").select("id,photoword_id,first_name,last_name,username,game_nickname,completed_levels").in("id",ids);if(pr.error)return reply({error:"friends_failed"},500);people=pr.data||[];}
   const byId=new Map(people.map((x:any)=>[x.id,x]));
   const friends=(refs||[]).map((x:any)=>{const p=byId.get(x.invitee_id)||{};return {photoword_id:p.photoword_id,first_name:p.first_name,last_name:p.last_name,username:p.username,game_nickname:p.game_nickname,completed_levels:Math.min(10,p.completed_levels||0),rewarded:Boolean(x.rewarded_at)};});
   return reply({friends,invited:friends.length,rewarded:friends.filter((x:any)=>x.rewarded).length,total_reward:friends.filter((x:any)=>x.rewarded).length*20});
  }
  if(action==="register_referral"){
   const referralCode=typeof body.referrer==="string"?body.referrer.slice(0,40):"";
   const referralResult=await db.rpc("register_referral_server",{p_inviter_code:referralCode,p_invitee_telegram_id:user.id});
   if(referralResult.error)return reply({error:"referral_failed"},400);
   player=referralResult.data;
  }
  if(action==="create_energy_invoice"){
   const packs:Record<string,{energy:number,stars:number,full?:boolean}>={e1:{energy:1,stars:15},e5:{energy:5,stars:50,full:true}};
   const packKey=String(body.pack||""),pack=packs[packKey];if(!pack)return reply({error:"bad_pack"},400);
   const cp=(await db.from("challenge_profiles").select("limited_energy,energy_ref_at").eq("player_id",player.id).maybeSingle()).data;
   let currentEnergy=Number(cp?.limited_energy??5),ref=Date.parse(cp?.energy_ref_at||new Date().toISOString());
   if(currentEnergy<5&&Number.isFinite(ref)){currentEnergy=Math.min(5,currentEnergy+Math.floor(Math.max(0,Date.now()-ref)/(30*60*1000)));}
   if(currentEnergy>=5)return reply({error:"energy_full"},409);
   const payload="pwenergy:"+packKey+":"+user.id+":"+crypto.randomUUID();
   const webhookUrl=Deno.env.get("SUPABASE_URL")+"/functions/v1/telegram-webhook";
   const whRes=await fetch("https://api.telegram.org/bot"+token+"/setWebhook",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:webhookUrl,secret_token:await webhookSecret(token),allowed_updates:["message","pre_checkout_query"],drop_pending_updates:false})});
   const whData=await whRes.json();if(!whData?.ok)return reply({error:"webhook_failed"},502);
   const tgRes=await fetch("https://api.telegram.org/bot"+token+"/createInvoiceLink",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
     title:(pack.full?"Энергия 5/5 PhotoWord":"+1 энергия PhotoWord"),description:"Энергия для режима «Ограниченные попытки»",payload,currency:"XTR",prices:[{label:(pack.full?"Восстановить до 5/5":"+1 энергия"),amount:pack.stars}]
   })});
   const tgData=await tgRes.json();if(!tgData.ok||typeof tgData.result!=="string")return reply({error:"invoice_failed"},502);
   return reply({invoice_url:tgData.result,pack:packKey,energy:pack.energy,stars:pack.stars});
  }
  if(action==="create_invoice"){
   const packs:Record<string,{coins:number,stars:number}>={c10:{coins:10,stars:15},c50:{coins:50,stars:65},c150:{coins:150,stars:175},c300:{coins:300,stars:300}};
   const packKey=String(body.pack||""),pack=packs[packKey];if(!pack)return reply({error:"bad_pack"},400);
   const payload="pwcoins:"+packKey+":"+user.id+":"+crypto.randomUUID();
   const webhookUrl=Deno.env.get("SUPABASE_URL")+"/functions/v1/telegram-webhook";
   const whRes=await fetch("https://api.telegram.org/bot"+token+"/setWebhook",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:webhookUrl,secret_token:await webhookSecret(token),allowed_updates:["message","pre_checkout_query"],drop_pending_updates:false})});
   const whData=await whRes.json();
   let attemptId:any=null;
   const attempt=await db.from("star_invoice_attempts").insert({player_id:player.id,pack:packKey,stars:pack.stars,coins:pack.coins,invoice_payload:payload,webhook_ok:Boolean(whData?.ok),invoice_created:false,telegram_error:whData?.ok?null:String(whData?.description||"setWebhook failed")}).select("id").single();
   if(!attempt.error)attemptId=attempt.data?.id;
   if(!whData?.ok)return reply({error:"webhook_failed"},502);
   const infoRes=await fetch("https://api.telegram.org/bot"+token+"/getWebhookInfo");
   const infoData=await infoRes.json();
   if(!infoData?.ok||infoData?.result?.url!==webhookUrl){
     if(attemptId)await db.from("star_invoice_attempts").update({telegram_error:"Webhook verification failed"}).eq("id",attemptId);
     return reply({error:"webhook_failed"},502);
   }
   const tgRes=await fetch("https://api.telegram.org/bot"+token+"/createInvoiceLink",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
     title:pack.coins+" монет PhotoWord",description:"Игровые монеты PhotoWord",payload,currency:"XTR",prices:[{label:pack.coins+" монет",amount:pack.stars}]
   })});
   const tgData=await tgRes.json();
   if(!tgData.ok||typeof tgData.result!=="string"){
     if(attemptId)await db.from("star_invoice_attempts").update({telegram_error:String(tgData?.description||"createInvoiceLink failed")}).eq("id",attemptId);
     return reply({error:"invoice_failed"},502);
   }
   if(attemptId)await db.from("star_invoice_attempts").update({invoice_created:true,telegram_error:null}).eq("id",attemptId);
   return reply({invoice_url:tgData.result,pack:packKey,coins:pack.coins,stars:pack.stars});
  }
  if(action==="claim_daily"){
   const r=await db.rpc("claim_daily_reward_server",{p_telegram_id:user.id});
   if(r.error){const m=r.error.message||"";return reply({error:m.includes("daily_claimed")?"daily_claimed":"daily_failed"},m.includes("daily_claimed")?409:500);}player=r.data;
  }
  if(action==="claim_task"){
   const r=await db.rpc("claim_daily_task_server",{p_telegram_id:user.id,p_task_key:body.taskKey});
   if(r.error){const m=r.error.message||"";const e=m.includes("task_claimed")?"task_claimed":m.includes("task_not_ready")?"task_not_ready":m.includes("bad_task")?"bad_task":"task_failed";return reply({error:e},e==="task_not_ready"||e==="task_claimed"?409:500);}player=r.data;
  }
  // PostgREST may serialize a composite result as a one-element row array.
  if(Array.isArray(player))player=player[0];
  if(!player?.id)return reply({error:"db_response"},500);
  if((player.xp??0)<=0)return reply({player:profile(player,0),...(action==="theme_complete"?{theme_rewarded:themeRewarded}:{}),...(["use_hint","theme_hint"].includes(action)&&hintPayload?{hint:hintPayload}:{})});
  const rank=await db.from("players").select("id",{count:"exact",head:true}).gt("xp",0).or(`xp.gt.${player.xp},and(xp.eq.${player.xp},completed_levels.gt.${player.completed_levels}),and(xp.eq.${player.xp},completed_levels.eq.${player.completed_levels},created_at.lt.${player.created_at})`);
  if(rank.error)return reply({error:"rank_failed"},500);
  return reply({player:profile(player,(rank.count??0)+1),...(action==="theme_complete"?{theme_rewarded:themeRewarded}:{}),...(["use_hint","theme_hint"].includes(action)&&hintPayload?{hint:hintPayload}:{})});
 }catch{return reply({error:"server_error"},500);}
});
