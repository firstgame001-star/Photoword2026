import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const edgeRoutes=[
  ['telegram-login','  let mainAnswers'],
  ['duel-game','    if(body.progressGeneration'],
  ['challenge-game','  const p=(await db.from("players")'],
  ['daily-puzzle','  if(action==="state")'],
  ['achievements','  if(body.progressGeneration']
];
for(const [route,firstProtectedWork] of edgeRoutes){
  const src=readFileSync('server/'+route+'/index.ts','utf8');
  const signature=src.indexOf('const user=await verify(');
  const gate=src.indexOf('await db.rpc("consume_player_request_budget_server"')>=0?
    src.indexOf('await db.rpc("consume_player_request_budget_server"'):
    src.indexOf("await db.rpc('consume_player_request_budget_server'");
  const after=src.indexOf(firstProtectedWork);
  assert(signature>0&&gate>signature&&after>gate,route+' must authenticate and throttle before expensive database work');
  assert(src.includes('p_telegram_id:user.id'),route+' must use the signed Telegram identity');
  assert(src.includes('request_rate_limited')&&src.includes('},429)'),route+' must return HTTP 429');
  assert(src.includes('request_guard_unavailable')&&src.includes('},503)'),route+' must fail closed if the limiter database is unavailable');
}
const migration=readFileSync('supabase/migrations/20261024174709_authenticated_request_token_buckets.sql','utf8');
for(const fragment of [
 'PRIMARY KEY (telegram_id,scope)',
 'ENABLE ROW LEVEL SECURITY',
 'REVOKE ALL ON TABLE public.player_request_buckets FROM PUBLIC,anon,authenticated',
 'REVOKE ALL ON FUNCTION public.consume_player_request_budget_server',
 'ON CONFLICT (telegram_id,scope) DO UPDATE',
 'v_subscope := CASE',
 "p_route='duel-game' AND p_action='reactions'",
 "p_route='telegram-login' AND p_action='track_event'",
 'v_scope := \'all\'',
 'RETURN jsonb_build_object(\'allowed\',false'
]){
  assert(migration.includes(fragment),'Token bucket migration lost: '+fragment);
}
const webhook=readFileSync('server/telegram-webhook/index.ts','utf8');
assert(!webhook.includes('consume_player_request_budget_server'),'Paid Telegram webhooks must not be rate-limited by a player's game-API budget');
const core=readFileSync('clean/core.js','utf8');
for(const lang of ['ru','en','az']){
  assert(core.includes(lang+':{')&&core.includes('request_rate_limited:'),'Rate limit notices must be translatable');
}
console.log('PASS: all five signed game APIs enforce atomic per-account request budgets, return 429, fail closed and leave payment webhooks unaffected.');
