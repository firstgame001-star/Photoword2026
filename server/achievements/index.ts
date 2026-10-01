import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
const headers={"Access-Control-Allow-Origin":"https://firstgame001-star.github.io","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json","Cache-Control":"no-store"};
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
const enc=new TextEncoder();
async function sign(key:Uint8Array,data:string){const k=await crypto.subtle.importKey("raw",key,{name:"HMAC",hash:"SHA-256"},false,["sign"]);return crypto.subtle.sign("HMAC",k,enc.encode(data));}
async function verify(raw:unknown,token:string){
 if(typeof raw!=="string"||raw.length>16384)return null;
 const p=new URLSearchParams(raw),hash=p.get("hash");if(!hash||!/^[a-fA-F0-9]{64}$/.test(hash))return null;
 const seen=new Set<string>();for(const [key] of p){if(seen.has(key))return null;seen.add(key)}
 const date=Number(p.get("auth_date")),now=Date.now()/1000;if(!Number.isInteger(date)||date<=0||now-date>86400||date>now+60)return null;
 p.delete("hash");
 const check=[...p.entries()].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>k+"="+v).join("\n");
 const secret=await sign(enc.encode("WebAppData"),token);
 const key=await crypto.subtle.importKey("raw",secret,{name:"HMAC",hash:"SHA-256"},false,["verify"]);
 const signature=new Uint8Array(hash.match(/../g)!.map(x=>parseInt(x,16)));
 if(!await crypto.subtle.verify("HMAC",key,signature,enc.encode(check)))return null;
 try{const u=JSON.parse(p.get("user")||"null");return u&&Number.isSafeInteger(u.id)&&u.id>0?u:null;}catch{return null;}
}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply({error:"method"},405);
 if(req.headers.get("origin")&&req.headers.get("origin")!=="https://firstgame001-star.github.io")return reply({error:"origin"},403);
 const token=Deno.env.get("TELEGRAM_BOT_TOKEN");if(!token)return reply({error:"not_configured"},503);
 try{
  const raw=await req.text();if(raw.length>32768)return reply({error:"body_too_large"},413);
  let body;try{body=JSON.parse(raw)}catch{return reply({error:"json"},400)}
  const user=await verify(body?.initData,token);if(!user)return reply({error:"invalid_telegram_auth"},401);
  const language=body.language||"ru",action=body.action||"state";
  if(!["ru","en","az"].includes(language))return reply({error:"bad_language"},400);
  if(!["state","claim"].includes(action))return reply({error:"unknown_action"},400);
  if(action==="claim"&&(typeof body.achievement!=="string"||!/^[a-z0-9_]{1,60}$/.test(body.achievement)))return reply({error:"bad_achievement"},400);
  const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
  const settled=await db.rpc("duel_statistics",{p_telegram_id:user.id});if(settled.error)return reply({error:"server_error"},500);
  const args:any={p_telegram_id:user.id,p_language:language};if(action==="claim")args.p_achievement=body.achievement;
  const result=await db.rpc(action==="claim"?"achievement_claim":"achievement_state",args);
  if(result.error){const msg=String(result.error.message);const code=["achievement_locked","bad_achievement","player_not_found"].find(x=>msg.includes(x))||"server_error";return reply({error:code},code==="server_error"?500:400)}
  return reply(result.data);
 }catch{return reply({error:"server_error"},500)}
});
