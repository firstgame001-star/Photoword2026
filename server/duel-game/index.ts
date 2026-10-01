import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.117.1';

const origin='https://firstgame001-star.github.io';
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type',
  'Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
const enc=new TextEncoder();
async function hmac(key:Uint8Array,data:string){
  const k=await crypto.subtle.importKey('raw',key,{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC',k,enc.encode(data)));
}
async function verify(raw:unknown,token:string){
  if(typeof raw!=='string'||raw.length>16384)return null;
  const p=new URLSearchParams(raw),hash=p.get('hash');
  if(!hash||!/^[a-fA-F0-9]{64}$/.test(hash))return null;
  const seen=new Set<string>();for(const [key] of p){if(seen.has(key))return null;seen.add(key)}
  const date=Number(p.get('auth_date')),now=Date.now()/1000;
  if(!Number.isInteger(date)||date<=0||now-date>86400||date>now+60)return null;
  p.delete('hash');
  const check=[...p.entries()].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>k+'='+v).join('\n');
  const secret=await hmac(enc.encode('WebAppData'),token);
  const key=await crypto.subtle.importKey('raw',secret,{name:'HMAC',hash:'SHA-256'},false,['verify']);
  const signature=new Uint8Array(hash.match(/../g)!.map(x=>parseInt(x,16)));
  if(!await crypto.subtle.verify('HMAC',key,signature,enc.encode(check)))return null;
  try{const user=JSON.parse(p.get('user')||'null');return user&&Number.isSafeInteger(user.id)&&user.id>0?user:null}catch{return null}
}
function letters(answer:string,code:string,id:number,language:string){
  const base=Array.from(answer),alphabet=language==='az'?'ABCÇDEƏFGĞHXIİJKLMNOÖPQRSŞTUÜVYZ':language==='en'?'ABCDEFGHIJKLMNOPQRSTUVWXYZ':'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЭЮЯ';
  let seed=2166136261;for(const ch of code+id)seed=Math.imul(seed^ch.charCodeAt(0),16777619)>>>0;
  const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
  const pool=[...base];for(let i=0;i<Math.min(5,Math.max(3,Math.ceil(base.length/3)));i++)pool.push(alphabet[Math.floor(rand()*alphabet.length)]);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  return pool;
}
type DuelDb=ReturnType<typeof createClient>;
async function notifyDuelInvite(db:DuelDb,token:string,telegramId:number,duel:any){
  if(duel?.status!=='waiting'||!duel.creator||!duel.invitee_name)return false;
  try{
    const claim=await db.rpc('duel_notification_claim',{p_telegram_id:telegramId,p_code:duel.code});
    if(claim.error||!claim.data)return false;
    const invite=claim.data;
    const l=['ru','en','az'].includes(invite.language)?invite.language:'ru';
    const copy:any={
      ru:{friend:'⚔️ '+invite.from+' вызывает тебя на дуэль PhotoWord!',rematch:'🔁 '+invite.from+' предлагает реванш в PhotoWord!',entry:'Взнос каждого: ',time:'Прими вызов в течение 5 минут.',button:'🎮 Открыть дуэль'},
      en:{friend:'⚔️ '+invite.from+' challenges you to a PhotoWord duel!',rematch:'🔁 '+invite.from+' wants a PhotoWord rematch!',entry:'Entry per player: ',time:'Accept within 5 minutes.',button:'🎮 Open duel'},
      az:{friend:'⚔️ '+invite.from+' səni PhotoWord duelinə çağırır!',rematch:'🔁 '+invite.from+' PhotoWord-da təkrar oyun təklif edir!',entry:'Hər oyunçunun girişi: ',time:'5 dəqiqə ərzində qəbul et.',button:'🎮 Dueli aç'}
    }[l];
    const link='https://t.me/PhotoWordBot?startapp=duel_'+invite.code;
    const response=await fetch('https://api.telegram.org/bot'+token+'/sendMessage',{
      method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(5000),
      body:JSON.stringify({chat_id:invite.telegram_id,text:(invite.kind==='rematch'?copy.rematch:copy.friend)+'\n'+copy.entry+invite.stake+' 🪙. '+copy.time,
        reply_markup:{inline_keyboard:[[{text:copy.button,url:link}]]}})
    });
    const result=await response.json().catch(()=>null);
    const sent=Boolean(response.ok&&result?.ok);
    if(sent)await db.rpc('duel_notification_finish',{p_telegram_id:telegramId,p_code:duel.code,p_sent:true});
    return sent;
  }catch{return false}
}
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='POST')return reply({error:'method'},405);
  if(req.headers.get('origin')&&req.headers.get('origin')!==origin)return reply({error:'origin'},403);
  const token=Deno.env.get('TELEGRAM_BOT_TOKEN');if(!token)return reply({error:'not_configured'},503);
  try{
    const raw=await req.text();if(raw.length>32768)return reply({error:'body_too_large'},413);
    let body;try{body=JSON.parse(raw)}catch{return reply({error:'json'},400)}
    const user=await verify(body?.initData,token);if(!user)return reply({error:'invalid_telegram_auth'},401);
    const action=String(body.action||''),code=String(body.code||'').toUpperCase();
    if(code&&!/^[A-F0-9]{16}$/.test(code))return reply({error:'duel_not_found'},404);
    const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {auth:{persistSession:false,autoRefreshToken:false}});
    let result:any=null,correct:boolean|undefined;
    if(action==='reactions'){
      if(!code)return reply({error:'duel_not_found'},404);
      const actor=await db.from('players').select('id').eq('telegram_id',user.id).maybeSingle();
      if(actor.error)throw actor.error;if(!actor.data)return reply({error:'duel_not_found'},404);
      const match=await db.from('duel_matches').select('creator,opponent,creator_reaction,creator_reaction_at,opponent_reaction,opponent_reaction_at').eq('code',code).or('creator.eq.'+actor.data.id+',opponent.eq.'+actor.data.id).maybeSingle();
      if(match.error)throw match.error;if(!match.data)return reply({error:'duel_not_found'},404);
      const m=match.data,mine=m.creator===actor.data.id;
      return reply({reactions:{my_reaction:mine?m.creator_reaction:m.opponent_reaction,my_reaction_at:mine?m.creator_reaction_at:m.opponent_reaction_at,their_reaction:mine?m.opponent_reaction:m.creator_reaction,their_reaction_at:mine?m.opponent_reaction_at:m.creator_reaction_at},server_now:new Date().toISOString()});
    }
    if(action==='create'){
      const stake=Number(body.stake),language=String(body.language||'');
      if(!Number.isInteger(stake)||stake<25||stake>500||stake%25!==0||!['ru','en','az'].includes(language))return reply({error:'duel_bad_stake'},400);
      const r=await db.rpc('duel_create',{p_telegram_id:user.id,p_stake:stake,p_language:language});
      if(r.error)throw r.error;result=r.data;
    }else if(action==='create_public'){
      const stake=Number(body.stake),language=String(body.language||'');
      if(!Number.isInteger(stake)||stake<25||stake>500||stake%25!==0)return reply({error:'duel_bad_stake'},400);
      if(!['ru','en','az'].includes(language))return reply({error:'duel_bad_language'},400);
      const r=await db.rpc('duel_create_public',{p_telegram_id:user.id,p_stake:stake,p_language:language});
      if(r.error)throw r.error;result=r.data;
    }else if(action==='public_rooms'){
      const language=String(body.language||'');
      if(!['ru','en','az'].includes(language))return reply({error:'duel_bad_language'},400);
      const r=await db.rpc('duel_public_rooms',{p_telegram_id:user.id,p_language:language});
      if(r.error)throw r.error;return reply({rooms:r.data,server_now:new Date().toISOString()});
    }else if(action==='create_friend'){
      const stake=Number(body.stake),language=String(body.language||''),friendCode=String(body.friendCode||'');
      if(!Number.isInteger(stake)||stake<25||stake>500||stake%25!==0||!['ru','en','az'].includes(language))return reply({error:'duel_bad_stake'},400);
      const r=await db.rpc('duel_create_friend',{p_telegram_id:user.id,p_friend_code:friendCode,p_stake:stake,p_language:language});
      if(r.error)throw r.error;result=r.data;
    }else if(action==='friend_list'){
      const r=await db.rpc('duel_friend_list',{p_telegram_id:user.id});
      if(r.error)throw r.error;return reply({friends:r.data});
    }else if(action==='statistics'){
      const r=await db.rpc('duel_statistics',{p_telegram_id:user.id});
      if(r.error)throw r.error;return reply({stats:r.data,server_now:new Date().toISOString()});
    }else if(action==='friend_request'){
      const r=await db.rpc('duel_friend_request',{p_telegram_id:user.id,p_friend_code:String(body.friendCode||''),p_duel_code:code||null});
      if(r.error)throw r.error;return reply({status:r.data});
    }else if(action==='friend_change'){
      const requestId=Number(body.requestId),change=String(body.change||'');
      if(!Number.isSafeInteger(requestId)||requestId<1||!['accept','remove'].includes(change))return reply({error:'friend_invalid_action'},400);
      const r=await db.rpc('duel_friend_change',{p_telegram_id:user.id,p_request_id:requestId,p_action:change});
      if(r.error)throw r.error;return reply({ok:true});
    }else if(action==='rematch'){
      const stake=Number(body.stake),language=String(body.language||'');
      if(!Number.isInteger(stake)||stake<25||stake>500||stake%25!==0)return reply({error:'duel_bad_stake'},400);
      if(!['ru','en','az'].includes(language))return reply({error:'duel_bad_language'},400);
      const r=await db.rpc('duel_rematch_localized',{p_telegram_id:user.id,p_previous_code:code,p_stake:stake,p_language:language});
      if(r.error)throw r.error;result=r.data;
    }else if(action==='offer'){
      const r=await db.rpc('duel_offer',{p_telegram_id:user.id,p_previous_code:code||null});
      if(r.error)throw r.error;
      return reply({offer:r.data,server_now:new Date().toISOString()});
    }else if(action==='preview'){
      const r=await db.from('duel_matches').select('code,stake,status,language,expires_at').eq('code',code).maybeSingle();
      if(r.error)throw r.error;
      return r.data?reply({duel:r.data,server_now:new Date().toISOString()}):reply({error:'duel_not_found'},404);
    }else if(action==='join'||action==='join_public'||action==='cancel'){
      const language=String(body.language||'');
      if(action!=='cancel'&&!['ru','en','az'].includes(language))return reply({error:'duel_bad_language'},400);
      const r=await db.rpc(action==='join_public'?'duel_join_public_localized':action==='join'?'duel_join_localized':'duel_cancel',
        action==='cancel'?{p_telegram_id:user.id,p_code:code}:{p_telegram_id:user.id,p_code:code,p_language:language});
      if(r.error)throw r.error;result=code;
    }else if(action==='skip'){
      const r=await db.rpc('duel_skip',{p_telegram_id:user.id,p_code:code});
      if(r.error)throw r.error;result=code;
    }else if(action==='react'){
      const emoji=String(body.emoji||'');
      if(!['laugh','cool','fire','clap','wow','heart','thinking','strong'].includes(emoji))return reply({error:'duel_bad_reaction'},400);
      const r=await db.rpc('duel_react',{p_telegram_id:user.id,p_code:code,p_reaction:emoji});
      if(r.error)throw r.error;
      return reply({ok:true,server_now:new Date().toISOString()});
    }else if(action==='answer'){
      const answer=String(body.answer||'');if(!answer||answer.length>80)return reply({error:'duel_bad_answer'},400);
      const r=await db.rpc('duel_submit',{p_telegram_id:user.id,p_code:code,p_answer:answer});
      if(r.error)throw r.error;correct=Boolean(r.data);result=code;
    }else if(action!=='state')return reply({error:'unknown_action'},400);
    const r=await db.rpc('duel_snapshot',{p_telegram_id:user.id,p_code:result||code||null});
    if(r.error)throw r.error;
    const duel=r.data;
    if(!duel)return reply({duel:null,server_now:new Date().toISOString()});
    if(duel.status==='active'&&duel.question_id&&!(action==='state'&&Number(body.questionId)===Number(duel.question_id))){
      const q=await db.from('duel_questions').select('id,photos,answer_ru,answer_en,answer_az').eq('id',duel.question_id).single();
      if(q.error)throw q.error;
      const answer=q.data['answer_'+duel.language];
      duel.question={photos:q.data.photos,length:Array.from(answer).length,letters:letters(answer,duel.code,q.data.id,duel.language)};
    }
    const notification_sent=await notifyDuelInvite(db,token,user.id,duel);
    return reply({duel,correct,notification_sent,server_now:new Date().toISOString()});
  }catch(e){
    const message=String((e as Error)?.message||'duel_error');
    const known=['duel_bad_stake','duel_bad_language','duel_already_open','insufficient_coins','duel_not_found','duel_not_waiting','duel_own_invite','duel_invitee_only','duel_not_finished','duel_cannot_cancel','duel_not_active','duel_no_questions','duel_wait','duel_bad_answer','duel_skips_exhausted','duel_bad_reaction','duel_reaction_wait','friend_not_found','friend_self','friend_unavailable','friend_already_requested','friend_invalid_action','friend_not_accepted'];
    const code=known.find(x=>message.includes(x));
    return reply({error:code||'duel_error'},code?409:500);
  }
});
