-- Rollback-only behavioral anti-bot regression. No existing player is modified.
BEGIN;
DO $test$
DECLARE robot uuid;person uuid;streak uuid;session uuid;
        base timestamptz:=clock_timestamp()-interval '35 minutes';
        signals int; balance int;
BEGIN
 INSERT INTO public.players(telegram_id,photoword_id,coins) VALUES(-993001001,'BOT-REGRESSION-'||gen_random_uuid(),250) RETURNING id INTO robot;
 INSERT INTO public.players(telegram_id,photoword_id,coins) VALUES(-993001002,'PERSON-REGRESSION-'||gen_random_uuid(),250) RETURNING id INTO person;
 INSERT INTO public.players(telegram_id,photoword_id,coins) VALUES(-993001003,'STREAK-REGRESSION-'||gen_random_uuid(),250) RETURNING id INTO streak;
 session:=gen_random_uuid();
 INSERT INTO public.bot_answer_telemetry(player_id,source_type,session_id,is_correct,answered_at)
 SELECT robot,'main',session,true,base+gs*interval '4 seconds'
 FROM generate_series(1,30) gs;
 signals:=public.evaluate_player_answer_behavior_server(robot);
 IF signals<>1 OR NOT EXISTS(SELECT 1 FROM public.bot_behavior_signals
 WHERE player_id=robot AND event_kind='regular_cadence_high_accuracy')
 THEN RAISE EXCEPTION '4-second perfect bot cadence not flagged';END IF;
 session:=gen_random_uuid();
 INSERT INTO public.bot_answer_telemetry(player_id,source_type,session_id,is_correct,answered_at)
 SELECT person,'theme',session,gs%11<>0,
 base+(sum(2+gs%7) OVER(ORDER BY gs))*interval '1 second'
 FROM generate_series(1,30) gs;
 signals:=public.evaluate_player_answer_behavior_server(person);
 IF signals<>0 OR EXISTS(SELECT 1 FROM public.bot_behavior_signals WHERE player_id=person)
 THEN RAISE EXCEPTION 'ordinary varied human responses wrongly flagged';END IF;
 INSERT INTO public.bot_answer_telemetry(player_id,source_type,session_id,is_correct,answered_at)
 SELECT streak,'duel',md5('qa-session-'||((gs-1)/10)::text)::uuid,true,
 base+(gs*5+((gs-1)/10)*140)*interval '1 second'
 FROM generate_series(1,70) gs;
 signals:=public.evaluate_player_answer_behavior_server(streak);
 IF NOT EXISTS(SELECT 1 FROM public.bot_behavior_signals WHERE player_id=streak
 AND event_kind='sustained_unusual_accuracy' AND review_status='pending')
 THEN RAISE EXCEPTION '70-answer multi-session perfection ignored';END IF;
 IF (SELECT count(*) FROM public.bot_behavior_signals WHERE player_id=robot)>1
 THEN RAISE EXCEPTION 'false extra bot signals';END IF;
 IF (SELECT count(*) FROM public.bot_behavior_signals WHERE player_id=streak
   AND evidence->>'review_only'='true')<1
 THEN RAISE EXCEPTION 'signals not marked for human review';END IF;
 SELECT count(*) INTO signals FROM public.coin_transactions WHERE player_id IN(robot,person,streak);
 IF signals<>0 OR EXISTS(SELECT 1 FROM public.anti_cheat_flags WHERE player_id IN(robot,person,streak))
 OR EXISTS(SELECT 1 FROM public.duel_anti_cheat_flags WHERE player_id IN(robot,person,streak))
 THEN RAISE EXCEPTION 'observation alone affected rewards or sanctions';END IF;
 IF has_table_privilege('anon','public.bot_answer_telemetry','SELECT')
 OR has_table_privilege('authenticated','public.bot_behavior_signals','SELECT')
 OR has_function_privilege('anon','public.evaluate_player_answer_behavior_server(uuid)','EXECUTE')
 THEN RAISE EXCEPTION 'client can read or manufacture bot signals';END IF;
END $test$;
ROLLBACK;
