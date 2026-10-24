-- Private, reversible human review for PhotoWord behavior signals.
-- No gameplay restriction, wallet mutation, score changes or automated sanctions.
ALTER TABLE public.bot_behavior_signals
 DROP CONSTRAINT bot_behavior_signals_review_status_check;
ALTER TABLE public.bot_behavior_signals
 ADD CONSTRAINT bot_behavior_signals_review_status_check
 CHECK (review_status IN ('pending','in_review','dismissed','reviewed'));

CREATE TABLE public.bot_behavior_review_history(
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 signal_id bigint NOT NULL REFERENCES public.bot_behavior_signals(id) ON DELETE CASCADE,
 reviewer_telegram_id bigint NOT NULL CHECK(reviewer_telegram_id>0),
 previous_status text NOT NULL,
 new_status text NOT NULL,
 note text NOT NULL DEFAULT '',
 evidence_snapshot jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK (previous_status IN ('pending','in_review','dismissed','reviewed')),
 CHECK (new_status IN ('pending','in_review','dismissed','reviewed')),
 CHECK (char_length(note)<=500)
);
CREATE INDEX bot_behavior_review_history_signal_idx
 ON public.bot_behavior_review_history(signal_id,created_at DESC);
ALTER TABLE public.bot_behavior_review_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.bot_behavior_review_history FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON TABLE public.bot_behavior_review_history TO service_role;
REVOKE ALL ON SEQUENCE public.bot_behavior_review_history_id_seq FROM PUBLIC,anon,authenticated;
GRANT USAGE,SELECT ON SEQUENCE public.bot_behavior_review_history_id_seq TO service_role;

CREATE OR REPLACE FUNCTION public.review_bot_behavior_signal_server(
 p_signal_id bigint,p_reviewer_telegram_id bigint,
 p_expected_status text,p_new_status text,p_note text DEFAULT ''
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $review$
DECLARE
 v_signal public.bot_behavior_signals;
 v_conf text;
 v_admins jsonb;
 v_note text:=left(btrim(coalesce(p_note,'')),500);
BEGIN
 IF p_signal_id IS NULL OR p_signal_id<=0 OR p_reviewer_telegram_id IS NULL
    OR p_reviewer_telegram_id<=0
    OR p_expected_status NOT IN ('pending','in_review','dismissed','reviewed')
    OR p_new_status NOT IN ('pending','in_review','dismissed','reviewed')
 THEN RETURN jsonb_build_object('ok',false,'reason','invalid_input');END IF;
 SELECT value INTO v_conf FROM public.app_config WHERE key='support_admin_telegram_ids';
 IF v_conf IS NULL THEN RETURN jsonb_build_object('ok',false,'reason','forbidden');END IF;
 BEGIN v_admins:=v_conf::jsonb;
 EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok',false,'reason','forbidden');END;
 IF jsonb_typeof(v_admins)<>'array' OR NOT EXISTS(
  SELECT 1 FROM jsonb_array_elements_text(v_admins) a(value)
  WHERE a.value=p_reviewer_telegram_id::text
 ) THEN RETURN jsonb_build_object('ok',false,'reason','forbidden');END IF;
 SELECT * INTO v_signal FROM public.bot_behavior_signals WHERE id=p_signal_id FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'reason','not_found');END IF;
 IF v_signal.review_status<>p_expected_status THEN
  RETURN jsonb_build_object('ok',false,'reason','stale',
    'current_status',v_signal.review_status);
 END IF;
 IF v_signal.review_status=p_new_status THEN
  RETURN jsonb_build_object('ok',false,'reason','unchanged',
    'current_status',v_signal.review_status);
 END IF;
 -- Start investigation, close the review without sanctions, dismiss a false alarm,
 -- or restore the case to the queue. Every decision can be revised.
 IF NOT (
  (p_new_status='pending' AND v_signal.review_status IN ('in_review','dismissed','reviewed'))
  OR (p_new_status='in_review' AND v_signal.review_status='pending')
  OR (p_new_status IN ('dismissed','reviewed') AND v_signal.review_status IN ('pending','in_review'))
 ) THEN RETURN jsonb_build_object('ok',false,'reason','bad_transition');END IF;
 UPDATE public.bot_behavior_signals
 SET review_status=p_new_status WHERE id=v_signal.id;
 INSERT INTO public.bot_behavior_review_history
  (signal_id,reviewer_telegram_id,previous_status,new_status,note,evidence_snapshot)
 VALUES(v_signal.id,p_reviewer_telegram_id,v_signal.review_status,p_new_status,
  v_note,v_signal.evidence);
 RETURN jsonb_build_object('ok',true,'case_id',v_signal.id,
   'previous_status',v_signal.review_status,'current_status',p_new_status);
END $review$;
REVOKE ALL ON FUNCTION public.review_bot_behavior_signal_server(bigint,bigint,text,text,text)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.review_bot_behavior_signal_server(bigint,bigint,text,text,text)
 TO service_role;
