-- Supabase migration 20261023063125_block_suspicious_challenge_reward_farming.sql.
-- Suspicious challenge results are persisted for investigation, but do not award
-- coins/XP or promote best scores. Replayed finish calls stay idempotent.
-- No existing player balances or historical transactions are modified.
CREATE OR REPLACE FUNCTION public.finish_challenge_run_server(p_telegram_id bigint, p_run_id uuid, p_mode text, p_score integer, p_streak integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_player public.players; v_run public.challenge_runs; v_score integer; v_streak integer; v_coins integer:=0; v_xp integer:=0; v_rewarded_today integer:=0; v_elapsed numeric; v_flagged boolean:=false;
begin
 if p_mode not in ('limited','nohint','blitz') then raise exception 'bad_mode'; end if;
 select * into v_player from public.players where telegram_id=p_telegram_id for update;
 if v_player.id is null then raise exception 'player_not_found'; end if;
 select * into v_run from public.challenge_runs where id=p_run_id and player_id=v_player.id for update;
 if v_run.id is null then raise exception 'run_not_found'; end if;
 if v_run.mode<>p_mode then raise exception 'run_mode_mismatch'; end if;
 if v_run.finished_at is not null then
  select count(*) into v_rewarded_today from public.challenge_runs where player_id=v_player.id and mode=p_mode and reward_coins>0 and finished_at>=date_trunc('day',now() at time zone 'utc') at time zone 'utc';
  return jsonb_build_object('reward_coins',v_run.reward_coins,'reward_xp',v_run.reward_xp,'rewarded_runs_today',v_rewarded_today,'reward_limit',3,'duplicate',true,'review_pending',exists(select 1 from public.anti_cheat_flags f where f.run_id=v_run.id and f.event_type in ('implausibly_fast_run','fast_correct_sequence')));
 end if;
 v_score:=greatest(0,least(case when p_mode='limited' then 10 else 100 end,coalesce(v_run.score,0)));
 v_streak:=greatest(0,least(v_score,coalesce(v_run.best_streak,0)));
 v_elapsed:=extract(epoch from (clock_timestamp()-v_run.started_at));
 if v_score>=5 and v_elapsed < (v_score * 2.0) then
  insert into public.anti_cheat_flags(player_id,run_id,event_type,details)
  values(v_player.id,v_run.id,'implausibly_fast_run',jsonb_build_object('mode',p_mode,'score',v_score,'elapsed_seconds',v_elapsed))
  on conflict(run_id,event_type) do nothing;
 end if;
 if p_mode='limited' then
  if v_score>=10 then v_coins:=15;v_xp:=10; elsif v_score>=7 then v_coins:=10;v_xp:=6; elsif v_score>=4 then v_coins:=5;v_xp:=3; end if;
 elsif p_mode='nohint' then
  if v_streak>=10 then v_coins:=15;v_xp:=10; elsif v_streak>=6 then v_coins:=10;v_xp:=6; elsif v_streak>=3 then v_coins:=5;v_xp:=3; end if;
 else
  if v_score>=12 then v_coins:=15;v_xp:=10; elsif v_score>=8 then v_coins:=10;v_xp:=6; elsif v_score>=5 then v_coins:=5;v_xp:=3; end if;
 end if;
 if v_elapsed<2 then v_coins:=0;v_xp:=0; end if;
 select count(*) into v_rewarded_today from public.challenge_runs where player_id=v_player.id and mode=p_mode and reward_coins>0 and finished_at>=date_trunc('day',now() at time zone 'utc') at time zone 'utc';
 if v_rewarded_today>=3 then v_coins:=0;v_xp:=0; end if;
 -- Exclude detected implausible / automated attempts from coins, XP and high scores.
 select exists(select 1 from public.anti_cheat_flags f where f.run_id=v_run.id and f.event_type in ('implausibly_fast_run','fast_correct_sequence')) into v_flagged;
 if v_flagged then v_coins:=0;v_xp:=0; end if;
 update public.challenge_runs set finished_at=clock_timestamp(),score=v_score,streak=v_streak,reward_coins=v_coins,reward_xp=v_xp where id=v_run.id;
 update public.challenge_profiles set
  limited_best_score=case when p_mode='limited' then greatest(limited_best_score,v_score) else limited_best_score end,
  nohint_best_streak=case when p_mode='nohint' then greatest(nohint_best_streak,v_streak) else nohint_best_streak end,
  blitz_best_score=case when p_mode='blitz' then greatest(blitz_best_score,v_score) else blitz_best_score end,
  blitz_best_streak=case when p_mode='blitz' then greatest(blitz_best_streak,v_streak) else blitz_best_streak end,
  updated_at=clock_timestamp() where player_id=v_player.id and not v_flagged;
 if v_coins>0 or v_xp>0 then
  update public.players set coins=coins+v_coins,xp=xp+v_xp where id=v_player.id;
  if v_coins>0 then insert into public.coin_transactions(player_id,amount,transaction_type,description,reward_source_id)
    values(v_player.id,v_coins,'challenge_reward','Challenge '||p_mode||' score '||v_score||' streak '||v_streak,v_run.id); end if;
  v_rewarded_today:=v_rewarded_today+1;
 end if;
 return jsonb_build_object('reward_coins',v_coins,'reward_xp',v_xp,'rewarded_runs_today',v_rewarded_today,'reward_limit',3,'duplicate',false,'review_pending',v_flagged);
end $function$;
