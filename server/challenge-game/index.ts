import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const headers={"Access-Control-Allow-Origin":"https://firstgame001-star.github.io","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json","Cache-Control":"no-store"};
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
const enc=new TextEncoder();
async function sign(key:Uint8Array,data:string){const k=await crypto.subtle.importKey("raw",key,{name:"HMAC",hash:"SHA-256"},false,["sign"]);return crypto.subtle.sign("HMAC",k,enc.encode(data));}
async function verify(raw:unknown,token:string){
 if(typeof raw!=="string"||raw.length>16384)return null;
 const p=new URLSearchParams(raw),hash=p.get("hash");if(!hash||!/^[a-fA-F0-9]{64}$/.test(hash))return null;
 const date=Number(p.get("auth_date")),now=Date.now()/1000;if(!Number.isInteger(date)||date<=0||now-date>86400||date>now+60)return null;
 p.delete("hash");
 const check=[...p.entries()].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>k+"="+v).join("\n");
 const secret=await sign(enc.encode("WebAppData"),token);
 const key=await crypto.subtle.importKey("raw",secret,{name:"HMAC",hash:"SHA-256"},false,["verify"]);
 const signature=new Uint8Array(hash.match(/../g)!.map(x=>parseInt(x,16)));
 if(!await crypto.subtle.verify("HMAC",key,signature,enc.encode(check)))return null;
 try{const u=JSON.parse(p.get("user")||"null");return u&&Number.isSafeInteger(u.id)&&u.id>0?u:null;}catch{return null;}
}
const ENERGY_MAX=5,ENERGY_MS=30*60*1000;
async function state(db:any,playerId:string){
 const fresh=await db.rpc("refresh_challenge_energy_server",{p_player_id:playerId});
 if(fresh.error)throw fresh.error;
 const row=Array.isArray(fresh.data)?fresh.data[0]:fresh.data;
 const energy=Number(row.limited_energy),ref=Date.parse(row.energy_ref_at),now=Date.now();
 const day=new Date(now);day.setUTCHours(0,0,0,0);
 const rr=await db.from("challenge_runs").select("mode,reward_coins").eq("player_id",playerId).gte("finished_at",day.toISOString()).gt("reward_coins",0);
 const counts:any={limited:0,nohint:0,blitz:0};for(const r of rr.data||[])if(counts[r.mode]!==undefined)counts[r.mode]++;
 return {energy,energy_max:ENERGY_MAX,next_energy_at:energy<ENERGY_MAX?new Date(ref+ENERGY_MS).toISOString():null,server_now:new Date(now).toISOString(),limited_best_score:Number(row.limited_best_score||0),nohint_best_streak:Number(row.nohint_best_streak||0),blitz_best_score:Number(row.blitz_best_score||0),blitz_best_streak:Number(row.blitz_best_streak||0),rewarded_runs_today:counts,reward_limit:3};
}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply({error:"method"},405);
 const token=Deno.env.get("TELEGRAM_BOT_TOKEN");if(!token)return reply({error:"not_configured"},503);
 try{
  const body=await req.json(),user=await verify(body?.initData,token);if(!user)return reply({error:"invalid_telegram_auth"},401);
  const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
  const p=(await db.from("players").select("id,progress_generation").eq("telegram_id",user.id).maybeSingle()).data;if(!p?.id)return reply({error:"player_not_found"},404);
  if(body.progressGeneration!==undefined&&body.progressGeneration!==p.progress_generation)return reply({error:"progress_reset"},409);
  const action=String(body.action||"state"),mode=String(body.mode||""),language=["ru","en","az"].includes(String(body.language||""))?String(body.language):"ru";
  if(action==="state")return reply({challenge:await state(db,p.id)});
  if(action==="start"){
   if(!["limited","nohint","blitz"].includes(mode))return reply({error:"bad_mode"},400);
   const initialSeen=Array.isArray(body.initialSeen)?body.initialSeen.filter((x:any)=>Number.isInteger(x)&&x>=0&&x<400).slice(0,400):[];
   const run=await db.rpc("start_challenge_run_atomic_server",{p_telegram_id:user.id,p_mode:mode,p_language:language,p_generation:p.progress_generation,p_initial_seen:initialSeen});
   if(run.error){const m=String(run.error.message||"");const error=m.includes("challenge_no_energy")?"challenge_no_energy":m.includes("progress_reset")?"progress_reset":"start_failed";return reply({error,challenge:await state(db,p.id)},error==="start_failed"?500:409);}
   return reply({challenge:{...await state(db,p.id),...run.data}});
  }

  if(action==="answer"){
   const runId=String(body.runId||""),questionId=Number(body.questionId),answer=String(body.answer||"");
   if(!["limited","nohint","blitz"].includes(mode)||!/^[0-9a-f-]{36}$/i.test(runId)||!Number.isInteger(questionId)||questionId<0||questionId>399||answer.length>40)return reply({error:"bad_answer"},400);
   const recorded=await db.rpc("record_challenge_answer_server",{p_telegram_id:user.id,p_run_id:runId,p_question_id:questionId,p_answer:answer});
   if(recorded.error){const m=String(recorded.error.message||"");const e=m.includes("answer_wait")?"answer_wait":m.includes("question_order")?"question_order":m.includes("challenge_time_over")?"challenge_time_over":m.includes("run_over")?"run_over":m.includes("run_finished")?"run_finished":"answer_failed";return reply({error:e},e==="answer_wait"?429:409);}
   return reply({challenge:await state(db,p.id),answer_result:recorded.data});
  }
  if(action==="questions"){
   const runId=String(body.runId||"");
   if(!["limited","nohint","blitz"].includes(mode)||!/^[0-9a-f-]{36}$/i.test(runId))return reply({error:"bad_run"},400);
   const questions=await db.rpc("reserve_challenge_questions",{p_telegram_id:user.id,p_run_id:runId,p_mode:mode});
   if(questions.error)return reply({error:"questions_failed"},400);
   return reply({challenge:{run_id:runId,question_ids:questions.data}});
  }
  if(action==="finish"){
   if(!["limited","nohint","blitz"].includes(mode))return reply({error:"bad_mode"},400);
   const runId=String(body.runId||"");if(!/^[0-9a-f-]{36}$/i.test(runId))return reply({error:"run_not_found"},400);
   const score=Math.max(0,Math.min(10000,Math.floor(Number(body.score)||0))),streak=Math.max(0,Math.min(10000,Math.floor(Number(body.streak)||0)));
   const fin=await db.rpc("finish_challenge_run_server",{p_telegram_id:user.id,p_run_id:runId,p_mode:mode,p_score:score,p_streak:streak});
   if(fin.error){const m=String(fin.error.message||"");return reply({error:m.includes("run_not_found")?"run_not_found":m.includes("run_mode_mismatch")?"run_mode_mismatch":"finish_failed"},400);}
   const reward=fin.data||{reward_coins:0,reward_xp:0,rewarded_runs_today:0,reward_limit:3};
   const player=(await db.from("players").select("coins,xp").eq("id",p.id).single()).data;
   return reply({challenge:await state(db,p.id),reward,coins:Number(player?.coins||0),xp:Number(player?.xp||0)});
  }
  if(action==="hint"){
   if(mode!=="blitz")return reply({error:"hints_blitz_only"},400);
   const costs:any={letter:75,remove:125,text:200};
   const hintType=String(body.hintType||""),cost=costs[hintType];
   if(!cost)return reply({error:"bad_hint"},400);
   const spent=await db.rpc("spend_challenge_coins_server",{p_telegram_id:user.id,p_cost:cost,p_reason:"blitz_"+hintType});
   if(spent.error){
    const m=String(spent.error.message||"");
    return reply({error:m.includes("insufficient_coins")?"insufficient_coins":"hint_failed"},m.includes("insufficient_coins")?402:500);
   }
   const row=Array.isArray(spent.data)?spent.data[0]:spent.data;
   return reply({challenge:await state(db,p.id),coins:Number(row?.coins||0),cost,hintType});
  }
  return reply({error:"unknown_action"},400);
 }catch{return reply({error:"server_error"},500);}
});
