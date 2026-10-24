-- Reduce false positives: intervals outside the expected response range must
-- count against confidence rather than being silently excluded.
CREATE OR REPLACE FUNCTION public.evaluate_player_answer_behavior_server(p_player_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
 v_n integer;v_hits integer;v_sessions integer;v_intervals integer;v_all_intervals integer;
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
  count(*) FILTER(WHERE prev_session=session_id AND prev_type=source_type)::integer,
  avg(dt) FILTER(WHERE prev_session=session_id AND prev_type=source_type AND dt BETWEEN 1.2 AND 18),
  stddev_pop(dt) FILTER(WHERE prev_session=session_id AND prev_type=source_type AND dt BETWEEN 1.2 AND 18),
  extract(epoch FROM max(answered_at)-min(answered_at))
 INTO v_n,v_hits,v_sessions,v_intervals,v_all_intervals,v_mean,v_std,v_span FROM deltas;
 IF v_n<24 THEN RETURN 0;END IF;
 v_cv:=CASE WHEN coalesce(v_mean,0)>0 THEN v_std/v_mean ELSE NULL END;
 v_evidence:=jsonb_build_object('sample',v_n,'correct',v_hits,
  'accuracy_percent',round(100.0*v_hits/greatest(1,v_n),1),
  'sessions',v_sessions,'in_session_intervals',v_intervals,'all_in_session_intervals',v_all_intervals,
  'mean_interval_seconds',round(v_mean,2),'interval_cv',round(v_cv,3),
  'sample_span_seconds',round(v_span,0),'review_only',true);
 IF v_n>=24 AND v_hits::numeric/v_n>=0.90 AND v_intervals>=18 AND v_intervals>=v_all_intervals*0.85
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
END $function$;
REVOKE ALL ON FUNCTION public.evaluate_player_answer_behavior_server(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.evaluate_player_answer_behavior_server(uuid) TO service_role;
