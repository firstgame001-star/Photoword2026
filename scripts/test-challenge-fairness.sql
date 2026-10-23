-- Rollback-only PhotoWord challenge fairness regression for all three modes.
-- Exercises real Postgres scoring and settlement without modifying player data.
BEGIN;
DO $test$
DECLARE actor public.players; run uuid; mode_name text; resp jsonb; correct_answer text;
BEGIN
 insert into public.players(telegram_id,photoword_id)
 values(-911166701,'CHALLENGE_FAIRNESS_'||gen_random_uuid()) returning * into actor;
 insert into public.challenge_profiles(player_id) values(actor.id);
 -- A short fast winning session is suspicious for audit but must still be paid.
 FOREACH mode_name IN ARRAY ARRAY['limited','nohint','blitz'] LOOP
  insert into public.challenge_runs(player_id,mode,started_at,score,best_streak)
  values(actor.id,mode_name,clock_timestamp()-interval '7 seconds',5,5) returning id into run;
  insert into public.anti_cheat_flags(player_id,run_id,event_type,details)
  values(actor.id,run,'fast_correct_sequence','{}'::jsonb);
  resp:=public.finish_challenge_run_server(-911166701,run,mode_name,1000,1000);
  if (resp->>'reward_coins')::integer<>5 or (resp->>'reward_xp')::integer<>3
     or (resp->>'review_pending')::boolean is true
   then raise exception 'fair % wrongly penalized: %',mode_name,resp;end if;
  if not exists(select 1 from public.anti_cheat_flags
                where run_id=run and event_type='implausibly_fast_run')
   then raise exception 'fast % audit trail missing',mode_name;end if;
  resp:=public.finish_challenge_run_server(-911166701,run,mode_name,9999,9999);
  if (resp->>'duplicate')::boolean is not true or (resp->>'reward_coins')::integer<>5
   then raise exception 'fast % replay changed reward',mode_name;end if;
 END LOOP;
 if (select coins from public.players where id=actor.id)<>265
    or (select xp from public.players where id=actor.id)<>9 then
  raise exception 'three legal payouts not precisely 15 coins, 9 XP';end if;

 -- Ten consecutive server-verifiable answers within 12s trigger withholding.
 FOREACH mode_name IN ARRAY ARRAY['limited','nohint','blitz'] LOOP
  insert into public.challenge_runs(player_id,mode,language,started_at,score,streak,best_streak,last_answer_at)
  values(actor.id,mode_name,'ru',clock_timestamp()-interval '30 seconds',9,9,9,clock_timestamp()-interval '2 seconds')
  returning id into run;
  insert into public.challenge_run_questions(run_id,seq,question_id,answered_at)
  select run,q.seq,q.question_id,case when q.seq<9 then clock_timestamp()-interval '2 seconds' else null end
  from (select row_number() over(order by question_id)-1 seq,question_id
        from (select question_id from public.challenge_question_catalog order by question_id limit 10) ten) q;
  insert into public.challenge_answer_attempts(run_id,seq,submitted_answer,is_correct,created_at)
  select run,seq,'TEST',true,clock_timestamp()-(10-seq)*interval '1 second'
  from generate_series(0,8) seq;
  select a.answer_ru into correct_answer from public.challenge_run_questions q
    join public.challenge_question_answers a on a.question_id=q.question_id
    where q.run_id=run and q.seq=9;
  resp:=public.record_challenge_answer_server(-911166701,run,
       (select q.question_id from public.challenge_run_questions q where q.run_id=run and q.seq=9),
       correct_answer);
  if (resp->>'correct')::boolean is not true
   then raise exception 'legitimate tenth answer rejected';end if;
  if not exists(select 1 from public.anti_cheat_flags
    where run_id=run and event_type='superhuman_correct_sequence')
   then raise exception 'ten-answer severe signal missing in %',mode_name;end if;
  resp:=public.finish_challenge_run_server(-911166701,run,mode_name,1,1);
  if (resp->>'reward_coins')::integer<>0 or (resp->>'reward_xp')::integer<>0
    or (resp->>'review_pending')::boolean is not true
   then raise exception 'extreme % improperly paid',mode_name;end if;
  resp:=public.finish_challenge_run_server(-911166701,run,mode_name,999,999);
  if (resp->>'duplicate')::boolean is not true or (resp->>'reward_coins')::integer<>0
   then raise exception 'extreme % paid twice',mode_name;end if;
 END LOOP;
 if (select coins from public.players where id=actor.id)<>265
 or (select xp from public.players where id=actor.id)<>9
 or (select count(*) from public.coin_transactions
     where player_id=actor.id and transaction_type='challenge_reward')<>3
 then raise exception 'severe flag altered wallet or coin history';end if;
 if (public.achievement_metrics(actor.id)->>'challenge_runs')::integer<>3
 or (public.achievement_metrics(actor.id)->>'challenge_streak')::integer<>5
 or (public.achievement_metrics(actor.id)->>'blitz_best')::integer<>5
 then raise exception 'unearned achievements or records';end if;
 if (select limited_best_score from public.challenge_profiles where player_id=actor.id)<>5
 or (select nohint_best_streak from public.challenge_profiles where player_id=actor.id)<>5
 or (select blitz_best_score from public.challenge_profiles where player_id=actor.id)<>5
 then raise exception 'extreme scores promoted';end if;
 raise notice 'PASS: limited/nohint/blitz fast-fair rewards, severe ten-answer anti-cheat, idempotency, achievement eligibility';
END $test$;
ROLLBACK;