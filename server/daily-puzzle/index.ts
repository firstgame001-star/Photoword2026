import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
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
function shuffle(a:string[]){for(let i=a.length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a;}
async function snapshot(db:any,telegramId:number,language:string){
 const result=await db.rpc("daily_puzzle_state",{p_telegram_id:telegramId,p_language:language});if(result.error)throw result.error;
 const d=result.data;
 const row=await db.from("daily_puzzle_questions").select("ru,en,az").eq("id",d.question_id).single();if(row.error)throw row.error;
 const word=row.data[language];
 const alphabet=language==="ru"?"АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ":language==="az"?"ABCÇDEƏFGĞHXIİJKQLMNOÖPRSŞTUÜVYZ":"ABCDEFGHIJKLMNOPQRSTUVWXYZ";
 const extra=shuffle([...alphabet].filter(x=>!word.includes(x))).slice(0,Math.max(3,Math.min(6,18-[...word].length)));
 return {...d,letters:shuffle([...word,...extra])};
}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply({error:"method"},405);
 const token=Deno.env.get("TELEGRAM_BOT_TOKEN");if(!token)return reply({error:"not_configured"},503);
 try{
  const body=await req.json(),user=await verify(body?.initData,token);if(!user)return reply({error:"invalid_telegram_auth"},401);
  const language=String(body.language||"ru"),action=String(body.action||"state");
  if(!["ru","en","az"].includes(language))return reply({error:"bad_language"},400);
  const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
  if(action==="state")return reply({daily:await snapshot(db,user.id,language)});
  if(action!=="answer")return reply({error:"unknown_action"},400);
  if(typeof body.answer!=="string"||[...body.answer].length>40||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(body.requestId||""))||!/^\d{4}-\d{2}-\d{2}$/.test(String(body.day||"")))return reply({error:"bad_request"},400);
  const r=await db.rpc("daily_puzzle_answer",{p_telegram_id:user.id,p_day:body.day,p_language:language,p_answer:body.answer,p_request_id:body.requestId});
  if(r.error){const m=String(r.error.message||"");const error=["daily_changed","daily_closed","bad_answer","player_not_found"].find(x=>m.includes(x))||"answer_failed";return reply({error,daily:await snapshot(db,user.id,language)},error.startsWith("daily_")?409:400)}
  const p=await db.from("players").select("coins").eq("telegram_id",user.id).single();if(p.error)throw p.error;
  return reply({daily:await snapshot(db,user.id,language),result:r.data,coins:p.data.coins});
 }catch{return reply({error:"server_error"},500)}
});
