-- Adaptive verification with server-owned timestamps; never trust client-supplied scores.
CREATE TABLE IF NOT EXISTS public.anti_cheat_flags (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
 run_id uuid NOT NULL REFERENCES public.challenge_runs(id) ON DELETE CASCADE,
 event_type text NOT NULL,
 details jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(run_id,event_type)
);
ALTER TABLE public.anti_cheat_flags ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.anti_cheat_flags FROM PUBLIC, anon, authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.anti_cheat_flags TO service_role;

CREATE OR REPLACE FUNCTION public.record_challenge_answer_server(p_telegram_id bigint, p_run_id uuid, p_question_id integer, p_answer text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_player public.players; v_run public.challenge_runs; v_q public.challenge_run_questions;
 v_expected text; v_ok boolean; v_now timestamptz:=clock_timestamp(); v_score integer; v_streak integer;
 v_best integer; v_mistakes integer; v_adjustment integer; v_remaining bigint;
begin
 if p_answer is null or length(p_answer)>40 then raise exception 'bad_answer'; end if;
 select * into v_player from public.players where telegram_id=p_telegram_id for update;
 if v_player.id is null then raise exception 'player_not_found'; end if;
 select * into v_run from public.challenge_runs where id=p_run_id and player_id=v_player.id for update;
 if v_run.id is null then raise exception 'run_not_found'; end if;
 if v_run.finished_at is not null then raise exception 'run_finished'; end if;
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
 if v_run.mode='blitz' then
  v_remaining:=greatest(0,floor(extract(epoch from (v_run.started_at+interval '60 seconds'+(v_adjustment*interval '1 second')-v_now))*1000)::bigint);
 else v_remaining:=null; end if;
 return jsonb_build_object('correct',v_ok,'score',v_score,'streak',v_streak,'best_streak',v_best,'mistakes',v_mistakes,'remaining_ms',v_remaining);
end $function$
;
CREATE OR REPLACE FUNCTION public.duel_submit(p_telegram_id bigint, p_code text, p_answer text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare m public.duel_matches; v_id uuid; v_creator boolean; v_index integer; v_allowed timestamptz;
        v_correct text; v_ok boolean;
begin
  select id into v_id from public.players where telegram_id=p_telegram_id;
  select * into m from public.duel_matches where code=upper(p_code) and (creator=v_id or opponent=v_id) for update;
  if not found then raise exception 'duel_not_found'; end if;
  if m.status<>'active' or clock_timestamp()<m.starts_at or clock_timestamp()>=m.ends_at then raise exception 'duel_not_active'; end if;
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
      opponent_next_guess_at=clock_timestamp()+(case when v_ok then interval '0.35 seconds' else interval '2 seconds' end)
      where id=m.id;
  end if;
  return v_ok;
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
  if v_coins>0 then insert into public.coin_transactions(player_id,amount,transaction_type,description)
    values(v_player.id,v_coins,'challenge_reward','Challenge '||p_mode||' score '||v_score||' streak '||v_streak); end if;
  v_rewarded_today:=v_rewarded_today+1;
 end if;
 return jsonb_build_object('reward_coins',v_coins,'reward_xp',v_xp,'rewarded_runs_today',v_rewarded_today,'reward_limit',3,'duplicate',false);
end $function$
;

-- Keep administrative RPCs inaccessible from the browser.
REVOKE ALL ON FUNCTION public.record_challenge_answer_server(bigint,uuid,integer,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_challenge_answer_server(bigint,uuid,integer,text) TO service_role;
REVOKE ALL ON FUNCTION public.duel_submit(bigint,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.duel_submit(bigint,text,text) TO service_role;
REVOKE ALL ON FUNCTION public.finish_challenge_run_server(bigint,uuid,text,integer,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finish_challenge_run_server(bigint,uuid,text,integer,integer) TO service_role;
