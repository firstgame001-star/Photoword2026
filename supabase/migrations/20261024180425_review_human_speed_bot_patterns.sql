-- PhotoWord: advisory bot behavior signals; no automatic sanctions or payouts.
CREATE TABLE IF NOT EXISTS public.bot_answer_telemetry(
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
 source_type text NOT NULL CHECK(source_type IN ('challenge','duel')),
 session_id uuid NOT NULL,
 is_correct boolean NOT NULL,
 answered_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS bot_answer_player_time_idx ON public.bot_answer_telemetry(player_id,answered_at DESC,id DESC);
ALTER TABLE public.bot_answer_telemetry ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bot_answer_telemetry FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.bot_answer_telemetry TO service_role;
GRANT USAGE,SELECT ON SEQUENCE public.bot_answer_telemetry_id_seq TO service_role;

CREATE TABLE IF NOT EXISTS public.bot_behavior_signals(
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
 event_kind text NOT NULL CHECK(event_kind IN ('regular_cadence_high_accuracy','sustained_unusual_accuracy')),
 utc_day date NOT NULL,
 first_seen timestamptz NOT NULL DEFAULT clock_timestamp(),
 last_seen timestamptz NOT NULL DEFAULT clock_timestamp(),
 observations integer NOT NULL DEFAULT 1,
 evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
 review_status text NOT NULL DEFAULT 'pending' CHECK(review_status IN ('pending','reviewed','dismissed')),
 UNIQUE(player_id,event_kind,utc_day)
);
CREATE INDEX IF NOT EXISTS bot_behavior_pending_idx ON public.bot_behavior_signals(last_seen DESC) WHERE review_status='pending';
ALTER TABLE public.bot_behavior_signals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bot_behavior_signals FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.bot_behavior_signals TO service_role;
GRANT USAGE,SELECT ON SEQUENCE public.bot_behavior_signals_id_seq TO service_role;

CREATE OR REPLACE FUNCTION public.evaluate_player_answer_behavior_server(p_player_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $eval$
DECLARE
 v_n integer;v_hits integer;v_sessions integer;v_intervals integer;
 v_mean numeric;v_std numeric;v_span numeric;v_cv numeric;
 v_evidence jsonb;v_found integer:=0;
BEGIN
 IF p_player_id IS NULL THEN RETURN 0;END IF;
 WITH recent AS(
  SELECT id,source_type,session_id,is_correct,answered_at
  FROM public.bot_answer_telemetry WHERE player_id=p_player_id
  AND answered_at>=clock_timestamp()-interval '48 hours'
  ORDER BY answered_at DESC,id DESC LIMIT 80
 ), deltas AS(
  SELECT source_type,session_id,is_correct,answered_at,
   lag(session_id) OVER(ORDER BY answered_at,id) prev_session,
   lag(source_type) OVER(ORDER BY answered_at,id) prev_type,
   extract(epoch FROM answered_at-lag(answered_at) OVER(ORDER BY answered_at,id)) dt
  FROM recent
 )
 SELECT count(*)::integer,count(*) FILTER(WHERE is_correct)::integer,
  count(DISTINCT (source_type,session_id))::integer,
  count(*) FILTER(WHERE prev_session=session_id AND prev_type=source_type AND dt BETWEEN 1.2 AND 18)::integer,
  avg(dt) FILTER(WHERE prev_session=session_id AND prev_type=source_type AND dt BETWEEN 1.2 AND 18),
  stddev_pop(dt) FILTER(WHERE prev_session=session_id AND prev_type=source_type AND dt BETWEEN 1.2 AND 18),
  extract(epoch FROM max(answered_at)-min(answered_at))
 INTO v_n,v_hits,v_sessions,v_intervals,v_mean,v_std,v_span FROM deltas;
 IF v_n<24 THEN RETURN 0;END IF;
 v_cv:=CASE WHEN coalesce(v_mean,0)>0 THEN v_std/v_mean ELSE NULL END;
 v_evidence:=jsonb_build_object('sample',v_n,'correct',v_hits,
  'accuracy_percent',round(100.0*v_hits/greatest(1,v_n),1),
  'sessions',v_sessions,'in_session_intervals',v_intervals,
  'mean_interval_seconds',round(v_mean,2),'interval_cv',round(v_cv,3),
  'sample_span_seconds',round(v_span,0),'review_only',true);
 IF v_n>=24 AND v_hits::numeric/v_n>=0.90 AND v_intervals>=18
 AND v_mean BETWEEN 1.5 AND 18 AND v_cv<=0.085 THEN
  INSERT INTO public.bot_behavior_signals(player_id,event_kind,utc_day,evidence)
  VALUES(p_player_id,'regular_cadence_high_accuracy',(clock_timestamp() AT TIME ZONE 'UTC')::date,v_evidence)
  ON CONFLICT(player_id,event_kind,utc_day) DO UPDATE
  SET last_seen=clock_timestamp(),observations=public.bot_behavior_signals.observations+1,evidence=excluded.evidence
  WHERE public.bot_behavior_signals.review_status='pending';
  v_found:=v_found+1;
 END IF;
 IF v_n>=64 AND v_hits::numeric/v_n>=0.985 AND v_sessions>=5 AND v_span>=600 THEN
  INSERT INTO public.bot_behavior_signals(player_id,event_kind,utc_day,evidence)
  VALUES(p_player_id,'sustained_unusual_accuracy',(clock_timestamp() AT TIME ZONE 'UTC')::date,v_evidence)
  ON CONFLICT(player_id,event_kind,utc_day) DO UPDATE
  SET last_seen=clock_timestamp(),observations=public.bot_behavior_signals.observations+1,evidence=excluded.evidence
  WHERE public.bot_behavior_signals.review_status='pending';
  v_found:=v_found+1;
 END IF;
 RETURN v_found;
END $eval$;
REVOKE ALL ON FUNCTION public.evaluate_player_answer_behavior_server(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.evaluate_player_answer_behavior_server(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.capture_game_answer_behavior_server()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $capture$
DECLARE v_player uuid;v_source text;v_session uuid;v_id bigint;
BEGIN
 IF TG_TABLE_NAME='challenge_answer_attempts' THEN
  SELECT player_id INTO v_player FROM public.challenge_runs WHERE id=NEW.run_id;
  v_source:='challenge';v_session:=NEW.run_id;
 ELSIF TG_TABLE_NAME='duel_answer_attempts' THEN
  v_player:=NEW.player_id;v_source:='duel';v_session:=NEW.match_id;
 ELSE RETURN NEW;END IF;
 IF v_player IS NULL THEN RETURN NEW;END IF;
 INSERT INTO public.bot_answer_telemetry(player_id,source_type,session_id,is_correct,answered_at)
 VALUES(v_player,v_source,v_session,NEW.is_correct,NEW.created_at)
 RETURNING id INTO v_id;
 IF v_id%5=0 THEN PERFORM public.evaluate_player_answer_behavior_server(v_player);END IF;
 RETURN NEW;
EXCEPTION WHEN OTHERS THEN
 -- Detector malfunction must never interrupt an answer or withhold a reward.
 RETURN NEW;
END $capture$;
REVOKE ALL ON FUNCTION public.capture_game_answer_behavior_server() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.capture_game_answer_behavior_server() TO service_role;
DROP TRIGGER IF EXISTS bot_behavior_challenge_answer ON public.challenge_answer_attempts;
CREATE TRIGGER bot_behavior_challenge_answer AFTER INSERT ON public.challenge_answer_attempts
 FOR EACH ROW EXECUTE FUNCTION public.capture_game_answer_behavior_server();
DROP TRIGGER IF EXISTS bot_behavior_duel_answer ON public.duel_answer_attempts;
CREATE TRIGGER bot_behavior_duel_answer AFTER INSERT ON public.duel_answer_attempts
 FOR EACH ROW EXECUTE FUNCTION public.capture_game_answer_behavior_server();
