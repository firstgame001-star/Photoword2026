-- Transactional PhotoWord request flood regression. No live players modified.
BEGIN;
DO $guard$
DECLARE
 actor bigint := 850000000000 + floor(random()*1000000)::bigint;
 other_actor bigint := 860000000000 + floor(random()*1000000)::bigint;
 result jsonb;
 i integer;
 denied integer := 0;
BEGIN
 FOR i IN 1..24 LOOP
  result := public.consume_player_request_budget_server(actor,'duel-game','reactions');
  IF result->>'allowed'<>'true' THEN RAISE EXCEPTION 'normal duel polling blocked at %',i;END IF;
 END LOOP;
 result := public.consume_player_request_budget_server(actor,'duel-game','reactions');
 IF result->>'allowed'<>'false' OR (result->>'retry_after_seconds')::integer<1
  THEN RAISE EXCEPTION 'duel flood was not throttled';END IF;
 result := public.consume_player_request_budget_server(actor,'challenge-game','state');
 IF result->>'allowed'<>'true' THEN RAISE EXCEPTION 'unrelated challenge request denied';END IF;
 result := public.consume_player_request_budget_server(other_actor,'duel-game','reactions');
 IF result->>'allowed'<>'true' THEN RAISE EXCEPTION 'one user limited another';END IF;
 FOR i IN 1..60 LOOP
  result := public.consume_player_request_budget_server(actor,'telegram-login','login');
  IF result->>'allowed'='false' THEN denied := denied+1;END IF;
 END LOOP;
 IF denied<25 THEN RAISE EXCEPTION 'global flood guard bypassed';END IF;
 IF has_function_privilege('anon','public.consume_player_request_budget_server(bigint,text,text)','EXECUTE')
 OR has_function_privilege('authenticated','public.consume_player_request_budget_server(bigint,text,text)','EXECUTE')
 OR has_table_privilege('anon','public.player_request_buckets','INSERT')
 OR has_table_privilege('anon','public.player_request_buckets','SELECT')
 THEN RAISE EXCEPTION 'anonymous actor can tamper with limiter';END IF;
 RAISE NOTICE 'PASS: 24 duel polling requests, 25th denied; player and route isolation; global limiter; closed SQL ACL';
END $guard$;
ROLLBACK;
