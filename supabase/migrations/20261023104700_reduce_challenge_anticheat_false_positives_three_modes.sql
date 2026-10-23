-- PhotoWord: basic speed observations are audit-only across limited/nohint/blitz.
-- Ten consecutive server-verified correct answers in <12 seconds are a stronger
-- automated-play signal. Preserve coins/XP, records and earned achievements for
-- rapid but otherwise legitimate play. No current player balance is altered.
CREATE OR REPLACE FUNCTION public.achievement_metrics(p_player uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare m jsonb;themes jsonb;chapters jsonb;daily_best_streak integer;ds jsonb;duels jsonb;challenges jsonb;
begin
 select jsonb_build_object('main',count(*) filter(where mode='main'),'nohint',count(*) filter(where mode='main' and no_hint),'theme_total',count(*) filter(where mode='theme')) into m from public.achievement_levels where player_id=p_player;
 select coalesce(jsonb_object_agg('theme_'||theme_id,n),'{}'::jsonb)||jsonb_build_object('themes_complete',count(*) filter(where n>=100)) into themes from (select theme_id,count(*) n from public.achievement_levels where player_id=p_player and mode='theme' group by theme_id) t;
 select jsonb_object_agg('chapter_'||i,case when n=last_level-first_level+1 then 1 else 0 end) into chapters
 from (select b.i,b.first_level,b.last_level,count(l.level_id) n
       from (values(1,1,20),(2,21,50),(3,51,90),(4,91,130),(5,131,180),(6,181,230),(7,231,280),(8,281,330),(9,331,380),(10,381,430),(11,431,480),(12,481,530),(13,531,580),(14,581,630),(15,631,680)) b(i,first_level,last_level)
       left join public.achievement_levels l on l.player_id=p_player and l.mode='main' and l.level_id between b.first_level and b.last_level
       group by b.i,b.first_level,b.last_level) c;
 select coalesce(max(n),0) into daily_best_streak from (select count(*) n from (select puzzle_day-(row_number() over(order by puzzle_day))::integer grp from public.daily_puzzle_progress where player_id=p_player and solved) d group by grp) series;
 select jsonb_build_object('daily_total',count(*),'daily_first',count(*) filter(where attempts=1),'daily_streak',daily_best_streak) into ds from public.daily_puzzle_progress where player_id=p_player and solved;
 select jsonb_build_object('duel_played',count(*),'duel_wins',count(*) filter(where winner=p_player),'duel_draws',count(*) filter(where winner is null),'duel_best',coalesce(max(case when creator=p_player then creator_score else opponent_score end),0)) into duels from public.duel_matches m where m.status='finished' and (m.creator=p_player or m.opponent=p_player) and m.created_at>=(select progress_reset_at from public.players where id=p_player)
 and not exists(select 1 from public.duel_anti_cheat_flags f where f.match_id=m.id and f.player_id=p_player and f.event_type in ('superhuman_correct_sequence','confirmed_automation'));
 select jsonb_build_object('challenge_runs',count(*) filter(where reward_coins>0),'challenge_streak',coalesce(max(streak),0),'blitz_best',coalesce(max(score) filter(where mode='blitz'),0)) into challenges from public.challenge_runs r where r.player_id=p_player and r.finished_at is not null
 and not exists(select 1 from public.anti_cheat_flags f where f.run_id=r.id and f.event_type in ('superhuman_correct_sequence','confirmed_automation'));
 return m||themes||chapters||ds||duels||challenges;
end
$function$;

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
  return jsonb_build_object('reward_coins',v_run.reward_coins,'reward_xp',v_run.reward_xp,'rewarded_runs_today',v_rewarded_today,'reward_limit',3,'duplicate',true,'review_pending',exists(select 1 from public.anti_cheat_flags f where f.run_id=v_run.id and f.event_type in ('superhuman_correct_sequence','confirmed_automation')));
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
 -- Basic timing anomalies are audit-only; only severe automation findings
 -- block coins/XP and promotion of challenge high scores.
 select exists(select 1 from public.anti_cheat_flags f where f.run_id=v_run.id and f.event_type in ('superhuman_correct_sequence','confirmed_automation')) into v_flagged;
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

CREATE OR REPLACE FUNCTION public.record_challenge_answer_server(p_telegram_id bigint, p_run_id uuid, p_question_id integer, p_answer text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_player public.players; v_run public.challenge_runs; v_q public.challenge_run_questions;
 v_expected text; v_ok boolean; v_now timestamptz:=clock_timestamp(); v_score integer; v_streak integer;
 v_best integer; v_mistakes integer; v_adjustment integer; v_remaining bigint; v_count integer; v_window interval; v_all_correct boolean;
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
  -- Short fast streaks are audit only; severe automation evidence needs
  -- ten consecutive correct submitted answers within twelve seconds.
  if v_score>=10 then
    select count(*),bool_and(is_correct),max(created_at)-min(created_at)
      into v_count,v_all_correct,v_window
    from (select created_at,is_correct from public.challenge_answer_attempts
          where run_id=p_run_id order by created_at desc,id desc limit 10) recent_ten;
    if v_count=10 and coalesce(v_all_correct,false) and v_window<interval '12 seconds' then
      insert into public.anti_cheat_flags(player_id,run_id,event_type,details)
      values(v_player.id,p_run_id,'superhuman_correct_sequence',
        jsonb_build_object('ten_correct_seconds',extract(epoch from v_window),'mode',v_run.mode,'score',v_score))
      on conflict(run_id,event_type) do nothing;
    end if;
  end if;
 end if;
 if v_run.mode='blitz' then
  v_remaining:=greatest(0,floor(extract(epoch from (v_run.started_at+interval '60 seconds'+(v_adjustment*interval '1 second')-v_now))*1000)::bigint);
 else v_remaining:=null; end if;
 return jsonb_build_object('correct',v_ok,'score',v_score,'streak',v_streak,'best_streak',v_best,'mistakes',v_mistakes,'remaining_ms',v_remaining);
end $function$;
