-- Server-authoritative authenticated request token buckets; all client data ignored for identity.
CREATE TABLE IF NOT EXISTS public.player_request_buckets (
 telegram_id bigint NOT NULL CHECK (telegram_id>0),
 scope text NOT NULL CHECK (length(scope) BETWEEN 1 AND 64),
 tokens double precision NOT NULL CHECK (tokens>=0),
 touched_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY (telegram_id,scope)
);
ALTER TABLE public.player_request_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.player_request_buckets FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE public.player_request_buckets TO service_role;
CREATE OR REPLACE FUNCTION public.consume_player_request_budget_server(p_telegram_id bigint, p_route text, p_action text DEFAULT ''::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  v_now timestamptz := clock_timestamp();
  v_scope text;
  v_subscope text;
  v_cap double precision;
  v_rate double precision;
  v_tokens double precision;
  v_current double precision;
  v_touched timestamptz;
  v_retry integer;
  v_step integer;
BEGIN
  IF p_telegram_id IS NULL OR p_telegram_id <= 0 OR p_route NOT IN
    ('telegram-login','duel-game','challenge-game','daily-puzzle','achievements')
    THEN RAISE EXCEPTION 'invalid_rate_guard_input'; END IF;

  -- Client actions are mapped to fixed categories: a random action cannot
  -- manufacture fresh buckets or bypass the per-account global budget.
  v_subscope := CASE
    WHEN p_route='telegram-login' AND p_action='track_event' THEN 'telemetry'
    WHEN p_route='telegram-login' THEN 'game'
    WHEN p_route='duel-game' AND p_action='reactions' THEN 'reactions'
    WHEN p_route='duel-game' AND p_action='state' THEN 'state'
    WHEN p_route='duel-game' THEN 'actions'
    WHEN p_route='challenge-game' AND p_action IN ('state','puzzle') THEN 'state'
    WHEN p_route='challenge-game' AND p_action='answer' THEN 'answer'
    WHEN p_route='challenge-game' THEN 'actions'
    WHEN p_route='daily-puzzle' THEN 'daily'
    ELSE 'achievements'
  END;

  FOR v_step IN 1..2 LOOP
    IF v_step=1 THEN
      v_scope := 'all';
      v_cap := 48; v_rate := 6; -- all routes combined
    ELSE
      v_scope := p_route || ':' || v_subscope;
      CASE v_scope
        WHEN 'telegram-login:telemetry' THEN v_cap:=8; v_rate:=0.5;
        WHEN 'telegram-login:game' THEN v_cap:=18; v_rate:=1.6;
        WHEN 'duel-game:reactions' THEN v_cap:=24; v_rate:=3;
        WHEN 'duel-game:state' THEN v_cap:=18; v_rate:=2;
        WHEN 'duel-game:actions' THEN v_cap:=12; v_rate:=1.4;
        WHEN 'challenge-game:state' THEN v_cap:=18; v_rate:=2;
        WHEN 'challenge-game:answer' THEN v_cap:=8; v_rate:=1.2;
        WHEN 'challenge-game:actions' THEN v_cap:=12; v_rate:=1;
        WHEN 'daily-puzzle:daily' THEN v_cap:=10; v_rate:=0.8;
        WHEN 'achievements:achievements' THEN v_cap:=10; v_rate:=0.8;
        ELSE RAISE EXCEPTION 'invalid_rate_scope';
      END CASE;
    END IF;

    -- Atomic upsert ensures simultaneous requests do not all consume the same
    -- remaining token; unused quota refills gradually based on server time.
    INSERT INTO public.player_request_buckets AS b
      (telegram_id,scope,tokens,touched_at)
    VALUES (p_telegram_id,v_scope,v_cap-1,v_now)
    ON CONFLICT (telegram_id,scope) DO UPDATE
      SET tokens = LEAST(v_cap,b.tokens +
                        GREATEST(0,EXTRACT(EPOCH FROM v_now-b.touched_at))*v_rate)-1,
          touched_at = v_now
      WHERE LEAST(v_cap,b.tokens +
                  GREATEST(0,EXTRACT(EPOCH FROM v_now-b.touched_at))*v_rate) >= 1
    RETURNING tokens INTO v_tokens;

    IF NOT FOUND THEN
      SELECT b.tokens,b.touched_at INTO v_current,v_touched
      FROM public.player_request_buckets b
      WHERE b.telegram_id=p_telegram_id AND b.scope=v_scope;
      v_retry := GREATEST(1,CEIL(
        GREATEST(0,1-LEAST(v_cap,COALESCE(v_current,0)+
          GREATEST(0,EXTRACT(EPOCH FROM v_now-COALESCE(v_touched,v_now)))*v_rate))/v_rate
      )::integer);
      RETURN jsonb_build_object('allowed',false,'retry_after_seconds',v_retry);
    END IF;
  END LOOP;
  RETURN jsonb_build_object('allowed',true);
END $function$;
REVOKE ALL ON FUNCTION public.consume_player_request_budget_server(bigint,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consume_player_request_budget_server(bigint,text,text) TO service_role;
