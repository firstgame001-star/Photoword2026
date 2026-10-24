-- Use a per-table BOOLEAN variable: referencing NEW.is_correct on reward tables
-- causes PostgreSQL record field resolution to fail even within a CASE branch.
CREATE OR REPLACE FUNCTION public.capture_game_answer_behavior_server()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE v_player uuid;v_source text;v_session uuid;v_id bigint;v_at timestamptz;v_correct boolean;
BEGIN
 IF TG_TABLE_NAME='challenge_answer_attempts' THEN
  SELECT player_id INTO v_player FROM public.challenge_runs WHERE id=NEW.run_id;
  v_source:='challenge';v_session:=NEW.run_id;v_at:=NEW.created_at;v_correct:=NEW.is_correct;
 ELSIF TG_TABLE_NAME='duel_answer_attempts' THEN
  v_player:=NEW.player_id;v_source:='duel';v_session:=NEW.match_id;v_at:=NEW.created_at;v_correct:=NEW.is_correct;
 ELSIF TG_TABLE_NAME='coin_transactions' THEN
  IF NEW.transaction_type NOT IN ('level_reward','theme_level_reward') THEN RETURN NEW;END IF;
  v_player:=NEW.player_id;v_source:=CASE WHEN NEW.transaction_type='level_reward' THEN 'main' ELSE 'theme' END;
  v_at:=NEW.created_at;v_correct:=true;
 ELSIF TG_TABLE_NAME IN ('main_level_answer_attempts','theme_level_answer_attempts') THEN
  SELECT id INTO v_player FROM public.players WHERE telegram_id=NEW.telegram_id;
  v_source:=CASE WHEN TG_TABLE_NAME='main_level_answer_attempts' THEN 'main' ELSE 'theme' END;
  v_at:=NEW.attempted_at;v_correct:=false;
 ELSE RETURN NEW;END IF;
 IF v_player IS NULL THEN RETURN NEW;END IF;
 IF v_session IS NULL THEN v_session:=md5(v_player::text||':'||v_source||':'||date_trunc('hour',v_at)::text)::uuid;END IF;
 INSERT INTO public.bot_answer_telemetry(player_id,source_type,session_id,is_correct,answered_at)
 VALUES(v_player,v_source,v_session,v_correct,v_at)
 RETURNING id INTO v_id;
 IF v_id%5=0 THEN PERFORM public.evaluate_player_answer_behavior_server(v_player);END IF;
 RETURN NEW;
EXCEPTION WHEN OTHERS THEN
 -- Detector malfunction must never interrupt an answer or withhold a reward.
 RETURN NEW;
END $function$;
REVOKE ALL ON FUNCTION public.capture_game_answer_behavior_server() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.capture_game_answer_behavior_server() TO service_role;