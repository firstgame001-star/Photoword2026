-- Regression: execute against live Postgres; all fake player data rolled back.
-- No real player's balances, progress, or rewards are modified.
BEGIN;
DO $test$
DECLARE
 t bigint := -floor(extract(epoch FROM clock_timestamp())*1000000)::bigint;
 a uuid; b uuid; rid uuid; mid uuid; duel_code text; ids integer[];
 q record; v jsonb; result_players public.players; i integer; chosen_answer text;
BEGIN
 INSERT INTO public.players(telegram_id,photoword_id) VALUES(t,'AUDIT_A_'||gen_random_uuid()) RETURNING id INTO a;
 INSERT INTO public.players(telegram_id,photoword_id) VALUES(t-1,'AUDIT_B_'||gen_random_uuid()) RETURNING id INTO b;
 INSERT INTO public.challenge_profiles(player_id) VALUES(a);

 -- One reward per level per epoch even with repeated calls.
 FOR i IN 1..12 LOOP result_players:=public.complete_level_server(t,1,20,15); END LOOP;
 IF result_players.coins<>270 OR result_players.xp<>15 OR
    (SELECT count(*) FROM public.coin_transactions WHERE player_id=a AND transaction_type='level_reward' AND reward_generation=0)<>1
 THEN RAISE EXCEPTION 'main level reward replay'; END IF;
 result_players:=public.reset_game_progress_server(t,0);
 IF result_players.coins<>250 OR result_players.progress_generation<>1 THEN RAISE EXCEPTION 'reset epoch'; END IF;
 INSERT INTO public.challenge_profiles(player_id) VALUES(a);
 FOR i IN 1..12 LOOP result_players:=public.complete_level_server(t,1,20,15); END LOOP;
 IF result_players.coins<>270 OR result_players.xp<>15 OR
    (SELECT count(*) FROM public.coin_transactions WHERE player_id=a AND transaction_type='level_reward')<>2
 THEN RAISE EXCEPTION 'new epoch replay'; END IF;
 BEGIN
   INSERT INTO public.coin_transactions(player_id,amount,transaction_type,description,reward_generation)
   VALUES(a,20,'level_reward','Level 1',1);
   RAISE EXCEPTION 'missing ledger uniqueness';
 EXCEPTION WHEN unique_violation THEN NULL; END;
 result_players:=public.reset_game_progress_server(t,0);
 IF result_players.progress_generation<>1 OR result_players.completed_levels<>1
 THEN RAISE EXCEPTION 'stale reset destroyed progress'; END IF;

 -- Challenge scores are based on server-recorded answers, not reported client score.
 INSERT INTO public.challenge_runs(player_id,mode,started_at) VALUES(a,'limited',clock_timestamp()-interval '12 seconds') RETURNING id INTO rid;
 INSERT INTO public.challenge_run_questions(run_id,seq,question_id)
 SELECT rid,row_number() over(order by question_id)-1,question_id
 FROM (SELECT question_id FROM public.challenge_question_catalog ORDER BY question_id LIMIT 5) selected;
 FOR q IN SELECT qr.seq,qr.question_id,ca.answer_ru answer
       FROM public.challenge_run_questions qr
       JOIN public.challenge_question_answers ca USING(question_id)
       WHERE qr.run_id=rid ORDER BY qr.seq
 LOOP
   IF q.seq=0 THEN
     BEGIN
       PERFORM public.record_challenge_answer_server(t-1,rid,q.question_id,q.answer);
       RAISE EXCEPTION 'cross-user challenge accepted';
     EXCEPTION WHEN OTHERS THEN
       IF SQLERRM<>'run_not_found' THEN RAISE; END IF;
     END;
   ELSE
     IF q.seq=1 THEN
       BEGIN
         PERFORM public.record_challenge_answer_server(t,rid,q.question_id,q.answer);
         RAISE EXCEPTION 'rapid challenge answer accepted';
       EXCEPTION WHEN OTHERS THEN
         IF SQLERRM<>'answer_wait' THEN RAISE; END IF;
       END;
     END IF;
     UPDATE public.challenge_runs SET last_answer_at=clock_timestamp()-interval '2 seconds' WHERE id=rid;
   END IF;
   v:=public.record_challenge_answer_server(t,rid,q.question_id,q.answer);
   IF NOT (v->>'correct')::boolean THEN RAISE EXCEPTION 'real answer rejected'; END IF;
 END LOOP;
 IF NOT EXISTS(SELECT 1 FROM public.anti_cheat_flags WHERE run_id=rid AND event_type='fast_correct_sequence')
 THEN RAISE EXCEPTION 'challenge anomaly not detected'; END IF;
 v:=public.finish_challenge_run_server(t,rid,'limited',10000,10000);
 IF (v->>'reward_coins')::integer<>5 OR (v->>'reward_xp')::integer<>3
 THEN RAISE EXCEPTION 'client-forged score credited'; END IF;
 v:=public.finish_challenge_run_server(t,rid,'limited',0,0);
 IF NOT (v->>'duplicate')::boolean THEN RAISE EXCEPTION 'challenge finish duplicate not recognized'; END IF;
 IF (SELECT count(*) FROM public.coin_transactions WHERE player_id=a AND transaction_type='challenge_reward' AND reward_source_id=rid)<>1
 THEN RAISE EXCEPTION 'challenge ledger repeated'; END IF;
 BEGIN
   INSERT INTO public.coin_transactions(player_id,amount,transaction_type,description,reward_source_id)
   VALUES(a,5,'challenge_reward','duplicate attempted',rid);
   RAISE EXCEPTION 'challenge reward source uniqueness missing';
 EXCEPTION WHEN unique_violation THEN NULL; END;

 -- Explicit cancelled-match refunds also have an immutable match receipt.
 duel_code:=public.duel_create(t,25,'ru');
 SELECT id INTO mid FROM public.duel_matches WHERE code=duel_code;
 PERFORM public.duel_cancel(t,duel_code);
 IF (SELECT count(*) FROM public.coin_transactions WHERE player_id=a AND transaction_type='duel_refund' AND reward_source_id=mid)<>1
 THEN RAISE EXCEPTION 'cancellation refund missing source receipt'; END IF;
 BEGIN
   INSERT INTO public.coin_transactions(player_id,amount,transaction_type,description,reward_source_id)
   VALUES(a,25,'duel_refund','duplicate cancellation',mid);
   RAISE EXCEPTION 'duplicate cancellation receipt accepted';
 EXCEPTION WHEN unique_violation THEN NULL; END;

 -- Duel: 950ms cooldown for creator AND opponent; audit extremely fast sequences.
 duel_code:=public.duel_create(t,25,'ru');
 PERFORM public.duel_join_localized(t-1,duel_code,'en');
 UPDATE public.duel_matches SET starts_at=clock_timestamp()-interval '2 seconds',
       ends_at=clock_timestamp()+interval '60 seconds'
 WHERE code=duel_code RETURNING id,question_ids INTO mid,ids;
 IF cardinality(ids)<5 THEN RAISE EXCEPTION 'duel bank too small'; END IF;
 BEGIN
   PERFORM public.duel_submit(t-100,duel_code,'fake');
   RAISE EXCEPTION 'outsider submitted duel answer';
 EXCEPTION WHEN OTHERS THEN
   IF SQLERRM<>'duel_not_found' THEN RAISE; END IF;
 END;
 FOR i IN 1..5 LOOP
   SELECT answer_ru INTO chosen_answer FROM public.duel_questions WHERE id=ids[i];
   IF i>1 THEN
     UPDATE public.duel_matches SET creator_next_guess_at=clock_timestamp()-interval '1 second'
       WHERE id=mid;
   END IF;
   IF NOT public.duel_submit(t,duel_code,chosen_answer)
   THEN RAISE EXCEPTION 'valid duel answer rejected'; END IF;
   IF i=1 AND (SELECT creator_next_guess_at FROM public.duel_matches WHERE id=mid)<clock_timestamp()+interval '700 milliseconds'
   THEN RAISE EXCEPTION 'creator cooldown too short'; END IF;
 END LOOP;
 SELECT answer_en INTO chosen_answer FROM public.duel_questions WHERE id=ids[1];
 IF NOT public.duel_submit(t-1,duel_code,chosen_answer) THEN RAISE EXCEPTION 'opponent answer rejected'; END IF;
 IF (SELECT opponent_next_guess_at FROM public.duel_matches WHERE id=mid)<clock_timestamp()+interval '700 milliseconds'
 THEN RAISE EXCEPTION 'opponent cooldown too short'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.duel_anti_cheat_flags WHERE match_id=mid AND player_id=a AND event_type='fast_correct_sequence')
 THEN RAISE EXCEPTION 'fast duel streak not flagged'; END IF;
 UPDATE public.duel_matches SET ends_at=clock_timestamp()-interval '1 second' WHERE id=mid;
 PERFORM public.duel_settle_one(mid);
 PERFORM public.duel_settle_one(mid);
 IF (SELECT count(*) FROM public.coin_transactions WHERE player_id=a AND transaction_type='duel_win' AND reward_source_id=mid)<>1
 THEN RAISE EXCEPTION 'duel winning payout repeated'; END IF;
 IF (SELECT status FROM public.duel_matches WHERE id=mid)<>'finished'
 THEN RAISE EXCEPTION 'duel not settled'; END IF;
 IF has_table_privilege('anon','public.duel_answer_attempts','SELECT') OR
    has_table_privilege('anon','public.duel_anti_cheat_flags','INSERT') OR
    has_function_privilege('anon','public.duel_submit(bigint,text,text)','EXECUTE')
 THEN RAISE EXCEPTION 'anti-cheat data or payout RPC publicly accessible'; END IF;
END
$test$;
ROLLBACK;
