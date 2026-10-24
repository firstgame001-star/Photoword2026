-- Transactional regression: no messages and no persistent player changes.
BEGIN;
DO $qa$
DECLARE
  test_player uuid; alert_id bigint; second_alert bigint;
  token1 uuid; token2 uuid; admin_a bigint:=777001;admin_b bigint:=777002;
  count_before integer; account_bigint bigint:=-994000000001;
BEGIN
 INSERT INTO public.players(telegram_id,photoword_id,coins)
 VALUES(account_bigint,'ALERT-QA-'||gen_random_uuid(),250)
 RETURNING id INTO test_player;
 INSERT INTO public.bot_behavior_signals(player_id,event_kind,utc_day,evidence)
 VALUES(test_player,'regular_cadence_high_accuracy',(now() AT TIME ZONE 'UTC')::date,
  '{"sample":30,"accuracy_percent":100,"review_only":true}'::jsonb)
 RETURNING id INTO alert_id;
 token1:=public.claim_bot_alert_delivery_server(alert_id,admin_a);
 IF token1 IS NULL THEN RAISE EXCEPTION 'valid new alert not reserved';END IF;
 IF public.claim_bot_alert_delivery_server(alert_id,admin_a) IS NOT NULL THEN
  RAISE EXCEPTION 'duplicate simultaneous alert reserved';END IF;
 IF public.finish_bot_alert_delivery_server(alert_id,admin_a,gen_random_uuid(),true,NULL) THEN
  RAISE EXCEPTION 'another process can ack this reservation';END IF;
 IF NOT public.finish_bot_alert_delivery_server(alert_id,admin_a,token1,true,NULL) THEN
  RAISE EXCEPTION 'successful alert cannot be acknowledged';END IF;
 IF public.claim_bot_alert_delivery_server(alert_id,admin_a) IS NOT NULL THEN
  RAISE EXCEPTION 'already sent alert reserved again';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.bot_alert_deliveries
  WHERE signal_id=alert_id AND admin_telegram_id=admin_a AND status='sent'
   AND attempts=1 AND sent_at IS NOT NULL) THEN
  RAISE EXCEPTION 'delivery record was not persisted';END IF;
 token1:=public.claim_bot_alert_delivery_server(alert_id,admin_b);
 IF token1 IS NULL THEN RAISE EXCEPTION 'other authorized admin cannot receive signal';END IF;
 IF NOT public.finish_bot_alert_delivery_server(alert_id,admin_b,token1,true,NULL) THEN
  RAISE EXCEPTION 'second admin could not ack';END IF;
 INSERT INTO public.bot_behavior_signals(player_id,event_kind,utc_day,evidence)
 VALUES(test_player,'sustained_unusual_accuracy',(now() AT TIME ZONE 'UTC')::date,
  '{"sample":70,"accuracy_percent":100,"review_only":true}'::jsonb)
 RETURNING id INTO second_alert;
 token1:=public.claim_bot_alert_delivery_server(second_alert,admin_a);
 IF token1 IS NULL THEN RAISE EXCEPTION 'new second event was not claimed';END IF;
 IF NOT public.finish_bot_alert_delivery_server(second_alert,admin_a,token1,false,'network') THEN
  RAISE EXCEPTION 'failed alert could not be queued for retry';END IF;
 IF public.claim_bot_alert_delivery_server(second_alert,admin_a) IS NOT NULL THEN
  RAISE EXCEPTION 'immediate retry bypassed cooldown';END IF;
 UPDATE public.bot_alert_deliveries SET lease_until=clock_timestamp()-interval '1 second'
 WHERE signal_id=second_alert AND admin_telegram_id=admin_a;
 token2:=public.claim_bot_alert_delivery_server(second_alert,admin_a);
 IF token2 IS NULL OR token2=token1 THEN
  RAISE EXCEPTION 'expired retry lease was not safely refreshed';END IF;
 IF public.finish_bot_alert_delivery_server(second_alert,admin_a,token1,true,NULL) THEN
  RAISE EXCEPTION 'stale lease can mark a retry delivered';END IF;
 IF NOT public.finish_bot_alert_delivery_server(second_alert,admin_a,token2,true,NULL) THEN
  RAISE EXCEPTION 'current retry not acknowledged';END IF;
 UPDATE public.bot_behavior_signals SET review_status='dismissed' WHERE id=second_alert;
 IF public.claim_bot_alert_delivery_server(second_alert,admin_b) IS NOT NULL THEN
  RAISE EXCEPTION 'dismissed signal still notified';END IF;
 IF EXISTS(SELECT 1 FROM public.coin_transactions WHERE player_id=test_player) THEN
  RAISE EXCEPTION 'alert sending affected player coins';END IF;
 IF has_table_privilege('anon','public.bot_alert_deliveries','SELECT')
 OR has_function_privilege('anon','public.claim_bot_alert_delivery_server(bigint,bigint)','EXECUTE')
 OR has_function_privilege('authenticated','public.finish_bot_alert_delivery_server(bigint,bigint,uuid,boolean,text)','EXECUTE')
 THEN RAISE EXCEPTION 'private alert dispatch publicly available';END IF;
END $qa$;
ROLLBACK;
