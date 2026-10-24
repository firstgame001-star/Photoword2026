-- Detect human-speed automation in main chapters, themed levels, challenges and duels.
-- Main/theme session grouping is based on server time and never trusts client timing.
ALTER TABLE public.bot_answer_telemetry DROP CONSTRAINT IF EXISTS bot_answer_telemetry_source_type_check;
ALTER TABLE public.bot_answer_telemetry ADD CONSTRAINT bot_answer_telemetry_source_type_check
 CHECK(source_type IN ('main','theme','challenge','duel'));
CREATE OR REPLACE FUNCTION public.capture_game_answer_behavior_server()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE v_player uuid;v_source text;v_session uuid;v_id bigint;v_at timestamptz;
BEGIN
 IF TG_TABLE_NAME='challenge_answer_attempts' THEN
  SELECT player_id INTO v_player FROM public.challenge_runs WHERE id=NEW.run_id;
  v_source:='challenge';v_session:=NEW.run_id;v_at:=NEW.created_at;
 ELSIF TG_TABLE_NAME='duel_answer_attempts' THEN
  v_player:=NEW.player_id;v_source:='duel';v_session:=NEW.match_id;v_at:=NEW.created_at;
 ELSIF TG_TABLE_NAME='coin_transactions' THEN
  IF NEW.transaction_type NOT IN ('level_reward','theme_level_reward') THEN RETURN NEW;END IF;
  v_player:=NEW.player_id;v_source:=CASE WHEN NEW.transaction_type='level_reward' THEN 'main' ELSE 'theme' END;
  v_at:=NEW.created_at;
 ELSIF TG_TABLE_NAME IN ('main_level_answer_attempts','theme_level_answer_attempts') THEN
  SELECT id INTO v_player FROM public.players WHERE telegram_id=NEW.telegram_id;
  v_source:=CASE WHEN TG_TABLE_NAME='main_level_answer_attempts' THEN 'main' ELSE 'theme' END;
  v_at:=NEW.attempted_at;
 ELSE RETURN NEW;END IF;
 IF v_player IS NULL THEN RETURN NEW;END IF;
 IF v_session IS NULL THEN v_session:=md5(v_player::text||':'||v_source||':'||date_trunc('hour',v_at)::text)::uuid;END IF;
 INSERT INTO public.bot_answer_telemetry(player_id,source_type,session_id,is_correct,answered_at)
 VALUES(v_player,v_source,v_session,
  CASE WHEN TG_TABLE_NAME IN ('coin_transactions') THEN true
       WHEN TG_TABLE_NAME IN ('main_level_answer_attempts','theme_level_answer_attempts') THEN false
       ELSE NEW.is_correct END,v_at)
 RETURNING id INTO v_id;
 IF v_id%5=0 THEN PERFORM public.evaluate_player_answer_behavior_server(v_player);END IF;
 RETURN NEW;
EXCEPTION WHEN OTHERS THEN
 -- Detector malfunction must never interrupt an answer or withhold a reward.
 RETURN NEW;
END $function$;
REVOKE ALL ON FUNCTION public.capture_game_answer_behavior_server() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.capture_game_answer_behavior_server() TO service_role;
DROP TRIGGER IF EXISTS bot_behavior_main_level_win ON public.coin_transactions;
CREATE TRIGGER bot_behavior_main_level_win AFTER INSERT ON public.coin_transactions
 FOR EACH ROW EXECUTE FUNCTION public.capture_game_answer_behavior_server();
DROP TRIGGER IF EXISTS bot_behavior_main_wrong ON public.main_level_answer_attempts;
CREATE TRIGGER bot_behavior_main_wrong AFTER INSERT ON public.main_level_answer_attempts
 FOR EACH ROW EXECUTE FUNCTION public.capture_game_answer_behavior_server();
DROP TRIGGER IF EXISTS bot_behavior_theme_wrong ON public.theme_level_answer_attempts;
CREATE TRIGGER bot_behavior_theme_wrong AFTER INSERT ON public.theme_level_answer_attempts
 FOR EACH ROW EXECUTE FUNCTION public.capture_game_answer_behavior_server();
