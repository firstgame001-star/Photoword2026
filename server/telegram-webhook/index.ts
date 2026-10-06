import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
async function webhookSecret(token:string){const data=new TextEncoder().encode(token);const hash=await crypto.subtle.digest("SHA-256",data);return "pw_"+Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("").slice(0,48);}
const packs:Record<string,{coins:number,stars:number}>={c10:{coins:10,stars:15},c50:{coins:50,stars:65},c150:{coins:150,stars:175},c300:{coins:300,stars:300}};
const energyPacks:Record<string,{energy:number,stars:number}>={e1:{energy:1,stars:15},e5:{energy:5,stars:50}};
const APP_URL="https://firstgame001-star.github.io/Photoword2026/clean/";
let botUiConfigured=false;
async function tg(token:string,method:string,payload:any={}){const r=await fetch("https://api.telegram.org/bot"+token+"/"+method,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});return await r.json();}
async function ensureBotUi(token:string){
 if(botUiConfigured)return;botUiConfigured=true;
 try{
  await Promise.all([
   tg(token,"setMyCommands",{commands:[{command:"start",description:"Запустить PhotoWord"},{command:"play",description:"Открыть игру"},{command:"support",description:"Поддержка"},{command:"paysupport",description:"Вопросы по покупкам"},{command:"terms",description:"Правила использования"},{command:"privacy",description:"Конфиденциальность"},{command:"cancel",description:"Отменить обращение"},{command:"myid",description:"Мой Telegram ID"},{command:"help",description:"Помощь"}]}),
   tg(token,"setChatMenuButton",{menu_button:{type:"web_app",text:"🎮 Играть",web_app:{url:APP_URL}}}),
   tg(token,"setMyDescription",{description:"PhotoWord — 4 изображения, 1 слово. Решай уровни, получай XP и монеты."}),
   tg(token,"setMyShortDescription",{short_description:"4 изображения · 1 слово · RU / EN / AZ"})
  ]);
 }catch{}
}
function keyboard(){return {inline_keyboard:[[{"text":"🎮 Играть","web_app":{"url":APP_URL}}],[{"text":"🆘 Поддержка","url":"https://t.me/PhotoWordBot?start=support"}]]};}
Deno.serve(async(req)=>{
 if(req.method!=="POST")return new Response("ok");
 const token=Deno.env.get("TELEGRAM_BOT_TOKEN");if(!token)return new Response("config",{status:500});
 if(req.headers.get("x-telegram-bot-api-secret-token")!==await webhookSecret(token))return new Response("forbidden",{status:403});
 await ensureBotUi(token);
 let u:any;try{u=await req.json()}catch{return new Response("ok")}
 if(u.pre_checkout_query){
   const q=u.pre_checkout_query;let ok=false;
   if(q.currency==="XTR"){
     const payload=String(q.invoice_payload||"");
     const m=payload.match(/^pwcoins:(c10|c50|c150|c300):(\d+):/);
     const e=payload.match(/^pwenergy:(e1|e5):(\d+):/);
     if(m&&Number(m[2])===q.from?.id&&packs[m[1]]?.stars===q.total_amount)ok=true;
     if(e&&Number(e[2])===q.from?.id&&energyPacks[e[1]]?.stars===q.total_amount)ok=true;
   }
   await fetch("https://api.telegram.org/bot"+token+"/answerPreCheckoutQuery",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pre_checkout_query_id:q.id,ok,error_message:ok?undefined:"Не удалось проверить пакет покупки."})});
 }
 const msg=u.message||u.edited_message;
 const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
 if(msg?.from?.id&&msg.chat?.type==='private'&&!msg.successful_payment){
   const text=String(msg.text||msg.caption||'').trim(),chatId=msg.chat.id;
   const player=(await db.from("players").select("id,photoword_id,notification_language").eq("telegram_id",msg.from.id).maybeSingle()).data;
   const launch=text.match(/^\/start(?:@PhotoWordBot)?\s+(?:support|paysupport)_(ru|en|az)$/i)?.[1]?.toLowerCase();
   const l=launch||(["ru","en","az"].includes(player?.notification_language)?player.notification_language:['en','az'].includes(msg.from.language_code)?msg.from.language_code:'ru');
   const copy={
    ru:{prompt:'🆘 Опиши проблему одним сообщением: режим, уровень и что произошло. Можно приложить скриншот. По покупке укажи дату, пакет и приложи чек Telegram. Не отправляй пароли и коды входа. /cancel — отменить.',accepted:(id:number)=>'✅ Обращение #'+id+' сохранено. Для дополнения используй /support. Ответ поддержки придёт в этот чат.',failed:'Не удалось сохранить обращение. Попробуй ещё раз; текст пока не принят.',cancel:'Ввод обращения отменён.',media:'Пришли текст или фото со скриншотом. /cancel — отменить.',welcome:'👋 Добро пожаловать в PhotoWord! Четыре подсказки — одно слово.',help:'Открой игру кнопкой ниже. /support — ошибки и данные, /paysupport — покупки, /terms — соглашение, /privacy — политика.'},
    en:{prompt:'🆘 Describe the issue in one message: mode, level and what happened. You may attach a screenshot. For purchases, include the date, pack and Telegram receipt. Do not send passwords or login codes. /cancel to cancel.',accepted:(id:number)=>'✅ Request #'+id+' saved. Use /support to add details. Support replies will arrive in this chat.',failed:'Could not save the request. Try again; it has not been accepted yet.',cancel:'Request entry canceled.',media:'Send text or a screenshot photo. /cancel to cancel.',welcome:'👋 Welcome to PhotoWord! Four clues — one word.',help:'Open the game below. /support for errors and data, /paysupport for purchases, /terms for terms, /privacy for privacy.'},
    az:{prompt:'🆘 Problemi bir mesajda təsvir et: rejim, səviyyə və nə baş verib. Ekran görüntüsü əlavə edə bilərsən. Alış üçün tarix, paket və Telegram qəbzini göndər. Şifrə və giriş kodlarını göndərmə. Ləğv üçün /cancel.',accepted:(id:number)=>'✅ #'+id+' müraciəti saxlanıldı. Əlavə məlumat üçün /support istifadə et. Dəstək cavabı bu çata gələcək.',failed:'Müraciət saxlanılmadı. Yenidən cəhd et; hələ qəbul edilməyib.',cancel:'Müraciət daxil etmə ləğv edildi.',media:'Mətn və ya ekran görüntüsü göndər. Ləğv üçün /cancel.',welcome:'👋 PhotoWord-a xoş gəldin! Dörd ipucu — bir söz.',help:'Aşağıdakı düymə ilə oyunu aç. /support — səhvlər və məlumatlar, /paysupport — alışlar, /terms — razılaşma, /privacy — siyasət.'}
   }[l];
   const send=(text:string)=>tg(token,'sendMessage',{chat_id:chatId,text});
   const command=text.split(/\s+/)[0].replace(/@PhotoWordBot$/i,'').toLowerCase();
   const payload=text.split(/\s+/)[1]||'';
   if(command==='/myid'){await send('Telegram ID: '+msg.from.id);return new Response('ok');}
   // Staff commands require an explicit private allowlist; no user can grant themselves access.
   if(['/support_queue','/ticket','/reply'].includes(command)){
     const conf=await db.from('app_config').select('value').eq('key','support_admin_telegram_ids').maybeSingle();
     let admins:number[]=[];try{const ids=JSON.parse(conf.data?.value||'[]');if(Array.isArray(ids))admins=ids.filter((id:any)=>Number.isSafeInteger(id)&&id>0)}catch{}
     if(!admins.includes(msg.from.id)){await send(l==='ru'?'Доступ к обращениям закрыт.':l==='az'?'Müraciətlərə giriş bağlıdır.':'Support access denied.');return new Response('ok');}
     if(command==='/support_queue'){
       const q=await db.from('support_tickets').select('id,message,status').neq('status','answered').order('id',{ascending:false}).limit(10);
       await send(q.error?copy.failed:q.data?.length?q.data.map((r:any)=>'#'+r.id+' · '+r.message.split('\n[Telegram photo:')[0].slice(0,180)).join('\n\n'):'Нет открытых обращений.');return new Response('ok');
     }
     const id=Number(payload);if(!Number.isSafeInteger(id)||id<1){await send('/ticket ID | /reply ID текст ответа');return new Response('ok');}
     const q=await db.from('support_tickets').select('id,telegram_id,message,status').eq('id',id).maybeSingle();
     if(q.error||!q.data){await send('Обращение не найдено.');return new Response('ok');}
     if(command==='/ticket'){
       const body=q.data.message.split('\n[Telegram photo:')[0];await send('#'+id+' · '+q.data.status+'\n'+body);
       const photo=q.data.message.match(/\[Telegram photo: ([^\]]+)\]/)?.[1];if(photo)await tg(token,'sendPhoto',{chat_id:chatId,photo});return new Response('ok');
     }
     const answer=text.replace(/^\/reply(?:@PhotoWordBot)?\s+\d+\s*/i,'').trim();
     if(!answer||answer.length>3500){await send('Ответ должен содержать от 1 до 3500 символов.');return new Response('ok');}
     const delivered=await tg(token,'sendMessage',{chat_id:q.data.telegram_id,text:'PhotoWord · #'+id+'\n'+answer});
     if(!delivered.ok){await send('Ответ не доставлен. Статус обращения сохранён.');return new Response('ok');}
     const saved=await db.from('support_tickets').update({status:'answered'}).eq('id',id);
     await send(saved.error?'Ответ доставлен, но статус не обновился.':'Ответ доставлен. Обращение закрыто.');return new Response('ok');
   }
   if(command==='/support'||command==='/paysupport'||command==='/start'&&/^(support|paysupport)(?:_(ru|en|az))?$/.test(payload)){
     if(launch&&player?.id)await db.from('players').update({notification_language:launch}).eq('id',player.id);
     const saved=await db.from('bot_support_sessions').upsert({telegram_id:msg.from.id,active:true,updated_at:new Date().toISOString()});
     await send(saved.error?copy.failed:copy.prompt);return new Response('ok');
   }
   if(command==='/cancel'){
     const saved=await db.from('bot_support_sessions').update({active:false,updated_at:new Date().toISOString()}).eq('telegram_id',msg.from.id);
     await send(saved.error?copy.failed:copy.cancel);return new Response('ok');
   }
   if(command==='/terms'||command==='/privacy'){
     await send(APP_URL+(command==='/terms'?'terms':'privacy')+'.html?lang='+l);return new Response('ok');
   }
   if(command==='/start'||command==='/play'||command==='/help'){
     await db.from('bot_support_sessions').update({active:false,updated_at:new Date().toISOString()}).eq('telegram_id',msg.from.id);
     const kb={inline_keyboard:[[{text:l==='ru'?'🎮 Играть':l==='az'?'🎮 Oyna':'🎮 Play',web_app:{url:APP_URL}}],[{text:l==='ru'?'🆘 Поддержка':l==='az'?'🆘 Dəstək':'🆘 Support',url:'https://t.me/PhotoWordBot?start=support'}]]};
     await tg(token,'sendMessage',{chat_id:chatId,text:command==='/help'?copy.help:copy.welcome,reply_markup:kb});return new Response('ok');
   }
   const session=(await db.from('bot_support_sessions').select('active').eq('telegram_id',msg.from.id).maybeSingle()).data;
   if(session?.active){
     const photo=msg.photo?.at(-1),attachment=photo?'\n[Telegram photo: '+photo.file_id+']':'';
     if(!text&&!photo){await send(copy.media);return new Response('ok');}
     const result=await db.from('support_tickets').insert({telegram_id:msg.from.id,player_id:player?.id||null,message:text+attachment}).select('id').single();
     if(result.error||!result.data?.id){await send(copy.failed);return new Response('ok');}
     await db.from('bot_support_sessions').update({active:false,updated_at:new Date().toISOString()}).eq('telegram_id',msg.from.id);
     await send(copy.accepted(result.data.id));return new Response('ok');
   }
 }

 const pay=msg?.successful_payment;
 if(pay&&pay.currency==="XTR"){
   const pref=(await db.from("players").select("notification_language").eq("telegram_id",msg.from?.id).maybeSingle()).data;
   const l=["ru","en","az"].includes(pref?.notification_language)?pref.notification_language:"ru";
   const coinText=(coins:number)=>l==="en"?"✅ Payment confirmed. "+coins+" 🪙 credited.":l==="az"?"✅ Ödəniş təsdiqləndi. "+coins+" 🪙 əlavə olundu.":"✅ Оплата подтверждена. Начислено "+coins+" 🪙.";
   const energyText=l==="en"?"✅ Payment confirmed. Energy restored (maximum 5/5 ⚡).":l==="az"?"✅ Ödəniş təsdiqləndi. Enerji bərpa olundu (maksimum 5/5 ⚡).":"✅ Оплата подтверждена. Энергия восстановлена (максимум 5/5 ⚡).";
   const payload=String(pay.invoice_payload||"");
   const m=payload.match(/^pwcoins:(c10|c50|c150|c300):(\d+):/);
   const e=payload.match(/^pwenergy:(e1|e5):(\d+):/);
   if(m&&Number(m[2])===msg.from?.id){
     const pack=packs[m[1]];
     if(pack&&pack.stars===pay.total_amount){
       const credit=await db.rpc("credit_star_purchase_server",{p_telegram_id:msg.from.id,p_charge_id:pay.telegram_payment_charge_id,p_payload:pay.invoice_payload,p_stars:pack.stars,p_coins:pack.coins});
       if(!credit.error)await tg(token,"sendMessage",{chat_id:msg.chat?.id||msg.from.id,text:coinText(pack.coins)});
     }
   } else if(e&&Number(e[2])===msg.from?.id){
     const pack=energyPacks[e[1]];
     if(pack&&pack.stars===pay.total_amount){
       const credit=await db.rpc("credit_challenge_energy_purchase_server",{p_telegram_id:msg.from.id,p_charge_id:pay.telegram_payment_charge_id,p_payload:pay.invoice_payload,p_stars:pack.stars,p_energy:pack.energy});
       if(!credit.error)await tg(token,"sendMessage",{chat_id:msg.chat?.id||msg.from.id,text:energyText});
     }
   }
 }
 return new Response("ok");
});
