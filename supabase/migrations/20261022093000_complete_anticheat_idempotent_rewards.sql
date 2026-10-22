-- Anti-cheat audit and idempotent reward ledger. Current public player balances are not modified.
-- New unique keys are present only on future tagged transactions, not historical reset-era rows.
ALTER TABLE public.coin_transactions ADD COLUMN IF NOT EXISTS reward_generation integer;
ALTER TABLE public.coin_transactions ADD COLUMN IF NOT EXISTS reward_source_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS coin_reward_once_per_epoch
  ON public.coin_transactions(player_id,reward_generation,transaction_type,description)
  WHERE reward_generation IS NOT NULL AND transaction_type IN ('level_reward','theme_level_reward');
CREATE UNIQUE INDEX IF NOT EXISTS coin_reward_once_per_server_event
  ON public.coin_transactions(player_id,transaction_type,reward_source_id)
  WHERE reward_source_id IS NOT NULL AND transaction_type IN ('duel_win','duel_refund','challenge_reward');

CREATE TABLE IF NOT EXISTS public.duel_answer_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES public.duel_matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  question_index integer NOT NULL CHECK(question_index>=0),
  is_correct boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS duel_attempt_player_time
  ON public.duel_answer_attempts(match_id,player_id,created_at DESC);
ALTER TABLE public.duel_answer_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.duel_answer_attempts FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.duel_answer_attempts TO service_role;

CREATE TABLE IF NOT EXISTS public.duel_anti_cheat_flags (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES public.duel_matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(match_id,player_id,event_type)
);
ALTER TABLE public.duel_anti_cheat_flags ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.duel_anti_cheat_flags FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.duel_anti_cheat_flags TO service_role;

-- Secure ledger data: SQL functions below have row locks and use server identities.
CREATE OR REPLACE FUNCTION public.complete_level_server(p_telegram_id bigint, p_level_id integer, p_reward_coins integer DEFAULT 20, p_reward_xp integer DEFAULT 15)
 RETURNS players
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v public.players; already_complete boolean; next_chapter integer; last_completed_at timestamptz;
begin
 if p_level_id not between 1 and 680 or p_reward_coins is distinct from 20 or p_reward_xp is distinct from 15 then raise exception 'invalid_level_or_reward'; end if;
 select * into v from public.players where telegram_id=p_telegram_id for update;
 if v.id is null then raise exception 'player_not_found'; end if;
 if p_level_id>v.current_level then raise exception 'level_locked'; end if;
 select completed into already_complete from public.level_progress where player_id=v.id and level_id=p_level_id;
 if coalesce(already_complete,false) then return v; end if;
 select max(completed_at) into last_completed_at from (
   select completed_at from public.level_progress where player_id=v.id and completed
   union all
   select completed_at from public.theme_progress where player_id=v.id
 ) history;
 if last_completed_at is not null and clock_timestamp()<last_completed_at+interval '3 seconds' then raise exception 'level_too_fast'; end if;
 insert into public.level_progress(player_id,level_id,completed,attempts,completed_at) values(v.id,p_level_id,true,1,clock_timestamp())
 on conflict(player_id,level_id) do update set completed=true,attempts=public.level_progress.attempts+1,completed_at=clock_timestamp();
 next_chapter:=case when p_level_id>=630 then 15 when p_level_id>=580 then 14 when p_level_id>=530 then 13 when p_level_id>=480 then 12 when p_level_id>=430 then 11 when p_level_id>=380 then 10 when p_level_id>=330 then 9 when p_level_id>=280 then 8 when p_level_id>=230 then 7 when p_level_id>=180 then 6 when p_level_id>=130 then 5 when p_level_id>=90 then 4 when p_level_id>=50 then 3 when p_level_id>=20 then 2 else 1 end;
 update public.players set coins=coins+p_reward_coins,xp=xp+p_reward_xp,completed_levels=completed_levels+1,current_level=greatest(current_level,p_level_id+1),current_chapter=greatest(current_chapter,next_chapter) where id=v.id returning * into v;
 insert into public.coin_transactions(player_id,amount,transaction_type,description,reward_generation) values(v.id,p_reward_coins,'level_reward','Level '||p_level_id,v.progress_generation);
 return v;
end $function$
;

CREATE OR REPLACE FUNCTION public.complete_theme_level_server(p_telegram_id bigint, p_theme_id text, p_level_id integer, p_language text, p_answer text, p_reward_coins integer DEFAULT 15, p_reward_xp integer DEFAULT 10)
 RETURNS players
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v public.players; v_expected text; v_inserted integer; last_completed_at timestamptz;
begin
 if p_theme_id not in ('sport','art','professions','travel','science','technology','cinema','food','animals','transport','home','nature')
    or p_level_id not between 1 and 100 or p_language not in ('ru','en','az')
    or p_reward_coins is distinct from 15 or p_reward_xp is distinct from 10 then raise exception 'bad_theme_level'; end if;
 select case p_language when 'ru' then a.ru when 'en' then a.en else a.az end into v_expected
 from public.theme_level_answers a where a.theme_id=p_theme_id and a.level_id=p_level_id;
 if v_expected is null then raise exception 'bad_theme_level'; end if;
 if trim(coalesce(p_answer,'')) is distinct from v_expected then raise exception 'wrong_answer'; end if;
 select * into v from public.players where telegram_id=p_telegram_id for update;
 if v.id is null then raise exception 'player_not_found'; end if;
 if not exists(select 1 from public.theme_progress d where d.player_id=v.id and d.theme_id=p_theme_id and d.level_id=p_level_id)
    and exists(select 1 from generate_series(1,p_level_id-1) required(level_id) where not exists(
      select 1 from public.theme_progress prior where prior.player_id=v.id and prior.theme_id=p_theme_id and prior.level_id=required.level_id
    )) then raise exception 'theme_level_locked'; end if;
 if exists(select 1 from public.theme_progress where player_id=v.id and theme_id=p_theme_id and level_id=p_level_id) then return v; end if;
 select max(completed_at) into last_completed_at from (
   select completed_at from public.level_progress where player_id=v.id and completed
   union all
   select completed_at from public.theme_progress where player_id=v.id
 ) history;
 if last_completed_at is not null and clock_timestamp()<last_completed_at+interval '3 seconds' then raise exception 'theme_level_too_fast'; end if;
 insert into public.theme_progress(player_id,theme_id,level_id,completed_at) values(v.id,p_theme_id,p_level_id,clock_timestamp()) on conflict(player_id,theme_id,level_id) do nothing;
 get diagnostics v_inserted=row_count;
 if v_inserted=0 then return v; end if;
 update public.players set coins=coins+p_reward_coins,xp=xp+p_reward_xp where id=v.id returning * into v;
 insert into public.coin_transactions(player_id,amount,transaction_type,description,reward_generation) values(v.id,p_reward_coins,'theme_level_reward','Theme '||p_theme_id||' level '||p_level_id,v.progress_generation);
 return v;
end
$function$
;

CREATE OR REPLACE FUNCTION public.record_challenge_answer_server(p_telegram_id bigint, p_run_id uuid, p_question_id integer, p_answer text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_player public.players; v_run public.challenge_runs; v_q public.challenge_run_questions;
 v_expected text; v_ok boolean; v_now timestamptz:=clock_timestamp(); v_score integer; v_streak integer;
 v_best integer; v_mistakes integer; v_adjustment integer; v_remaining bigint; v_count integer; v_window interval;
begin
 if p_answer is null or length(p_answer)>40 then raise exception 'bad_answer'; end if;
 select * into v_player from public.players where telegram_id=p_telegram_id for update;
 if v_player.id is null then raise exception 'player_not_found'; end if;
 select * into v_run from public.challenge_runs where id=p_run_id and player_id=v_player.id for update;
 if v_run.id is null then raise exception 'run_not_found'; end if;
 if v_run.finished_at is not null then raise exception 'run_finished'; end if;
 v_now:=clock_timestamp();
 if v_run.mode not in ('limited','nohint','blitz') then raise exception 'bad_mode'; end if;
 if v_run.mode in ('limited','nohint') and v_run.mistakes>=3 then raise exception 'run_over'; end if;
 if v_run.mode='limited' and v_run.score>=10 then raise exception 'run_over'; end if;
 if v_now<v_run.started_at+interval '1.2 seconds' then raise exception 'answer_wait'; end if;
 if v_run.last_answer_at is not null and v_now<v_run.last_answer_at+interval '900 milliseconds' then raise exception 'answer_wait'; end if;
 if v_run.mode='blitz' and v_now>=v_run.started_at+interval '60 seconds'+(v_run.blitz_adjustment_seconds*interval '1 second') then raise exception 'challenge_time_over'; end if;
 select * into v_q from public.challenge_run_questions
 where run_id=p_run_id and answered_at is null order by seq limit 1 for update;
 if v_q.run_id is null or v_q.question_id<>p_question_id then raise exception 'question_order'; end if;
 select case v_run.language when 'en' then answer_en when 'az' then answer_az else answer_ru end
 into v_expected from public.challenge_question_answers where question_id=v_q.question_id;
 if v_expected is null then raise exception 'answer_key_missing'; end if;
 v_ok:=upper(btrim(p_answer))=upper(v_expected);
 insert into public.challenge_answer_attempts(run_id,seq,submitted_answer,is_correct,created_at)
 values(p_run_id,v_q.seq,left(p_answer,40),v_ok,v_now);
 if v_ok then
   update public.challenge_run_questions set answered_at=v_now where run_id=p_run_id and seq=v_q.seq;
   v_score:=v_run.score+1; v_streak:=v_run.streak+1; v_best:=greatest(v_run.best_streak,v_streak);
   v_mistakes:=v_run.mistakes; v_adjustment:=v_run.blitz_adjustment_seconds+case when v_run.mode='blitz' then 3 else 0 end;
 else
   v_score:=v_run.score; v_streak:=0; v_best:=v_run.best_streak;
   v_mistakes:=v_run.mistakes+1; v_adjustment:=v_run.blitz_adjustment_seconds-case when v_run.mode='blitz' then 3 else 0 end;
 end if;
 update public.challenge_runs set score=v_score,streak=v_streak,best_streak=v_best,mistakes=v_mistakes,
  blitz_adjustment_seconds=v_adjustment,last_answer_at=v_now where id=p_run_id;
 if v_ok and v_score>=5 then
  select count(*), max(created_at)-min(created_at) into v_count,v_window
  from (select created_at from public.challenge_answer_attempts where run_id=p_run_id and is_correct
        order by created_at desc limit 5) recent;
  if v_count=5 and v_window<interval '8 seconds' then
    insert into public.anti_cheat_flags(player_id,run_id,event_type,details)
    values(v_player.id,p_run_id,'fast_correct_sequence',
      jsonb_build_object('five_correct_seconds',extract(epoch from v_window),'mode',v_run.mode,'score',v_score))
    on conflict(run_id,event_type) do nothing;
  end if;
 end if;
 if v_run.mode='blitz' then
  v_remaining:=greatest(0,floor(extract(epoch from (v_run.started_at+interval '60 seconds'+(v_adjustment*interval '1 second')-v_now))*1000)::bigint);
 else v_remaining:=null; end if;
 return jsonb_build_object('correct',v_ok,'score',v_score,'streak',v_streak,'best_streak',v_best,'mistakes',v_mistakes,'remaining_ms',v_remaining);
end $function$
;

CREATE OR REPLACE FUNCTION public.finish_challenge_run_server(p_telegram_id bigint, p_run_id uuid, p_mode text, p_score integer, p_streak integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_player public.players; v_run public.challenge_runs; v_score integer; v_streak integer; v_coins integer:=0; v_xp integer:=0; v_rewarded_today integer:=0; v_elapsed numeric;
begin
 if p_mode not in ('limited','nohint','blitz') then raise exception 'bad_mode'; end if;
 select * into v_player from public.players where telegram_id=p_telegram_id for update;
 if v_player.id is null then raise exception 'player_not_found'; end if;
 select * into v_run from public.challenge_runs where id=p_run_id and player_id=v_player.id for update;
 if v_run.id is null then raise exception 'run_not_found'; end if;
 if v_run.mode<>p_mode then raise exception 'run_mode_mismatch'; end if;
 if v_run.finished_at is not null then
  select count(*) into v_rewarded_today from public.challenge_runs where player_id=v_player.id and mode=p_mode and reward_coins>0 and finished_at>=date_trunc('day',now() at time zone 'utc') at time zone 'utc';
  return jsonb_build_object('reward_coins',v_run.reward_coins,'reward_xp',v_run.reward_xp,'rewarded_runs_today',v_rewarded_today,'reward_limit',3,'duplicate',true);
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
 update public.challenge_runs set finished_at=clock_timestamp(),score=v_score,streak=v_streak,reward_coins=v_coins,reward_xp=v_xp where id=v_run.id;
 update public.challenge_profiles set
  limited_best_score=case when p_mode='limited' then greatest(limited_best_score,v_score) else limited_best_score end,
  nohint_best_streak=case when p_mode='nohint' then greatest(nohint_best_streak,v_streak) else nohint_best_streak end,
  blitz_best_score=case when p_mode='blitz' then greatest(blitz_best_score,v_score) else blitz_best_score end,
  blitz_best_streak=case when p_mode='blitz' then greatest(blitz_best_streak,v_streak) else blitz_best_streak end,
  updated_at=clock_timestamp() where player_id=v_player.id;
 if v_coins>0 or v_xp>0 then
  update public.players set coins=coins+v_coins,xp=xp+v_xp where id=v_player.id;
  if v_coins>0 then insert into public.coin_transactions(player_id,amount,transaction_type,description,reward_source_id)
    values(v_player.id,v_coins,'challenge_reward','Challenge '||p_mode||' score '||v_score||' streak '||v_streak,v_run.id); end if;
  v_rewarded_today:=v_rewarded_today+1;
 end if;
 return jsonb_build_object('reward_coins',v_coins,'reward_xp',v_xp,'rewarded_runs_today',v_rewarded_today,'reward_limit',3,'duplicate',false);
end $function$
;

CREATE OR REPLACE FUNCTION public.duel_submit(p_telegram_id bigint, p_code text, p_answer text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare m public.duel_matches; v_id uuid; v_creator boolean; v_index integer; v_allowed timestamptz;
        v_correct text; v_ok boolean; v_now timestamptz; v_count integer; v_window interval;
begin
  select id into v_id from public.players where telegram_id=p_telegram_id;
  select * into m from public.duel_matches where code=upper(p_code) and (creator=v_id or opponent=v_id) for update;
  if not found then raise exception 'duel_not_found'; end if;
  if m.status<>'active' or clock_timestamp()<m.starts_at or clock_timestamp()>=m.ends_at then raise exception 'duel_not_active'; end if;
  v_now:=clock_timestamp();
  v_creator:=m.creator=v_id;
  v_index:=case when v_creator then m.creator_index else m.opponent_index end;
  v_allowed:=case when v_creator then m.creator_next_guess_at else m.opponent_next_guess_at end;
  if v_index>=cardinality(m.question_ids) then raise exception 'duel_no_questions'; end if;
  if v_allowed is not null and clock_timestamp()<v_allowed then raise exception 'duel_wait'; end if;
  select case (case when v_creator then m.language else coalesce(m.opponent_language,m.language) end) when 'en' then answer_en when 'az' then answer_az else answer_ru end into v_correct
    from public.duel_questions where id=m.question_ids[v_index+1];
  if length(p_answer)>40 or p_answer is null then raise exception 'duel_bad_answer'; end if;
  v_ok:=trim(p_answer)=v_correct;
  if v_creator then
    update public.duel_matches set creator_index=creator_index+case when v_ok then 1 else 0 end,
      creator_score=creator_score+case when v_ok then 1 else 0 end,
      creator_next_guess_at=clock_timestamp()+(case when v_ok then interval '0.95 seconds' else interval '2 seconds' end)
      where id=m.id;
  else
    update public.duel_matches set opponent_index=opponent_index+case when v_ok then 1 else 0 end,
      opponent_score=opponent_score+case when v_ok then 1 else 0 end,
      opponent_next_guess_at=clock_timestamp()+(case when v_ok then interval '0.95 seconds' else interval '2 seconds' end)
      where id=m.id;
  end if;
  insert into public.duel_answer_attempts(match_id,player_id,question_index,is_correct,created_at)
    values(m.id,v_id,v_index,v_ok,v_now);
  if v_ok then
    select count(*),max(created_at)-min(created_at) into v_count,v_window
      from (select created_at from public.duel_answer_attempts
            where match_id=m.id and player_id=v_id and is_correct
            order by created_at desc limit 5) recent;
    if v_count=5 and v_window<interval '8 seconds' then
      insert into public.duel_anti_cheat_flags(match_id,player_id,event_type,details)
      values(m.id,v_id,'fast_correct_sequence',jsonb_build_object('five_correct_seconds',extract(epoch from v_window),
              'score',case when v_creator then m.creator_score+1 else m.opponent_score+1 end))
      on conflict(match_id,player_id,event_type) do nothing;
    end if;
  elsif (select count(*) from public.duel_answer_attempts where match_id=m.id and player_id=v_id and not is_correct)>=12 then
    insert into public.duel_anti_cheat_flags(match_id,player_id,event_type,details)
    values(m.id,v_id,'excessive_wrong_answers',jsonb_build_object('threshold',12))
    on conflict(match_id,player_id,event_type) do nothing;
  end if;
  return v_ok;
end $function$
;

CREATE OR REPLACE FUNCTION public.duel_settle_one(p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare m public.duel_matches; v_winner uuid; v_payout integer;
begin
  select * into m from public.duel_matches where id=p_id for update;
  if not found then return; end if;
  if m.status='waiting' and m.expires_at<=clock_timestamp() then
    update public.players set coins=coins+m.stake where id=m.creator;
    insert into public.coin_transactions(player_id,amount,transaction_type,description,reward_source_id)
      values(m.creator,m.stake,'duel_refund','Expired invite '||m.code,m.id);
    update public.duel_matches set status='cancelled',settled_at=clock_timestamp() where id=m.id;
  elsif m.status='active' and m.ends_at<=clock_timestamp() then
    if m.creator_score>m.opponent_score then v_winner:=m.creator;
    elsif m.opponent_score>m.creator_score then v_winner:=m.opponent;
    else v_winner:=null; end if;
    if v_winner is null then
      update public.players set coins=coins+m.stake where id in (m.creator,m.opponent);
      insert into public.coin_transactions(player_id,amount,transaction_type,description,reward_source_id)
        values(m.creator,m.stake,'duel_refund','Draw '||m.code,m.id),
              (m.opponent,m.stake,'duel_refund','Draw '||m.code,m.id);
      v_payout:=0;
    else
      v_payout:=m.stake*9/5;
      update public.players set coins=coins+v_payout where id=v_winner;
      insert into public.coin_transactions(player_id,amount,transaction_type,description,reward_source_id)
        values(v_winner,v_payout,'duel_win','Duel '||m.code,m.id);
    end if;
    update public.duel_matches set status='finished',winner=v_winner,payout=v_payout,settled_at=clock_timestamp() where id=m.id;
  end if;
end $function$
;

-- No economy RPC is callable by anon or authenticated.
REVOKE ALL ON FUNCTION public.complete_level_server(bigint,integer,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.complete_level_server(bigint,integer,integer,integer) TO service_role;
REVOKE ALL ON FUNCTION public.complete_theme_level_server(bigint,text,integer,text,text,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.complete_theme_level_server(bigint,text,integer,text,text,integer,integer) TO service_role;
REVOKE ALL ON FUNCTION public.record_challenge_answer_server(bigint,uuid,integer,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_challenge_answer_server(bigint,uuid,integer,text) TO service_role;
REVOKE ALL ON FUNCTION public.finish_challenge_run_server(bigint,uuid,text,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finish_challenge_run_server(bigint,uuid,text,integer,integer) TO service_role;
REVOKE ALL ON FUNCTION public.duel_submit(bigint,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.duel_submit(bigint,text,text) TO service_role;
REVOKE ALL ON FUNCTION public.duel_settle_one(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.duel_settle_one(uuid) TO service_role;
