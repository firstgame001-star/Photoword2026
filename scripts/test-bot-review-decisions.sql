-- Rollback-only review moderation test; no real players or messages changed.
BEGIN;
DO $qa$
DECLARE player_pk uuid; admin_id bigint; v_case bigint; v jsonb;
BEGIN
 SELECT (value::jsonb->>0)::bigint INTO admin_id FROM public.app_config
 WHERE key='support_admin_telegram_ids';
 IF admin_id IS NULL THEN RAISE EXCEPTION 'admin configuration missing';END IF;
 INSERT INTO public.players(telegram_id,photoword_id,coins)
 VALUES(-998824013,'REVIEW-QA-'||gen_random_uuid(),250) RETURNING id INTO player_pk;
 INSERT INTO public.bot_behavior_signals(player_id,event_kind,utc_day,evidence)
 VALUES(player_pk,'regular_cadence_high_accuracy',(now() AT TIME ZONE 'UTC')::date,
 '{"sample":30,"accuracy_percent":100,"review_only":true}'::jsonb)
 RETURNING id INTO v_case;
 v:=public.review_bot_behavior_signal_server(v_case,admin_id+99999,'pending','dismissed','');
 IF v->>'reason'<>'forbidden' THEN RAISE EXCEPTION 'non-admin decision accepted';END IF;
 v:=public.review_bot_behavior_signal_server(v_case,admin_id,'pending','in_review','Нужно проверить вручную');
 IF v->>'ok'<>'true' THEN RAISE EXCEPTION 'start review failed';END IF;
 v:=public.review_bot_behavior_signal_server(v_case,admin_id,'pending','dismissed','stale press');
 IF v->>'reason'<>'stale' THEN RAISE EXCEPTION 'old keyboard did not fail safely';END IF;
 v:=public.review_bot_behavior_signal_server(v_case,admin_id,'in_review','dismissed','false positive');
 IF v->>'ok'<>'true' THEN RAISE EXCEPTION 'dismiss failed';END IF;
 v:=public.review_bot_behavior_signal_server(v_case,admin_id,'in_review','reviewed','duplicate action');
 IF v->>'reason'<>'stale' THEN RAISE EXCEPTION 'duplicate decision accepted';END IF;
 v:=public.review_bot_behavior_signal_server(v_case,admin_id,'dismissed','pending','reopen');
 IF v->>'ok'<>'true' THEN RAISE EXCEPTION 'reopen failed';END IF;
 v:=public.review_bot_behavior_signal_server(v_case,admin_id,'pending','reviewed','reviewed without sanction');
 IF v->>'ok'<>'true' THEN RAISE EXCEPTION 'review closure failed';END IF;
 IF (SELECT count(*) FROM public.bot_behavior_review_history h WHERE h.signal_id=v_case)<>4
 THEN RAISE EXCEPTION 'incorrect review audit count';END IF;
 IF (SELECT coins FROM public.players WHERE id=player_pk)<>250 OR
 EXISTS (SELECT 1 FROM public.coin_transactions t WHERE t.player_id=player_pk) OR
 EXISTS (SELECT 1 FROM public.duel_anti_cheat_flags f WHERE f.player_id=player_pk)
 THEN RAISE EXCEPTION 'review affected gameplay or finances';END IF;
 IF has_function_privilege('anon','public.review_bot_behavior_signal_server(bigint,bigint,text,text,text)','EXECUTE') OR
 has_table_privilege('anon','public.bot_behavior_review_history','SELECT')
 THEN RAISE EXCEPTION 'review exposed to public role';END IF;
END $qa$;
ROLLBACK;
