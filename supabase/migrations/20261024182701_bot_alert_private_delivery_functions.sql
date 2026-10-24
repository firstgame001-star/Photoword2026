-- Atomic claim leases, capped retries, and delivery acknowledgement.
CREATE OR REPLACE FUNCTION public.claim_bot_alert_delivery_server(p_signal_id bigint, p_admin_id bigint)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE v_token uuid:=gen_random_uuid();v_result uuid;
BEGIN
 IF p_signal_id IS NULL OR p_signal_id<=0 OR p_admin_id IS NULL OR p_admin_id<=0 THEN RETURN NULL;END IF;
 INSERT INTO public.bot_alert_deliveries AS d
   (signal_id,admin_telegram_id,status,claim_token,lease_until,attempts)
 SELECT s.id,p_admin_id,'processing',v_token,clock_timestamp()+interval '2 minutes',1
 FROM public.bot_behavior_signals s
 WHERE s.id=p_signal_id AND s.review_status='pending'
 AND s.last_seen>=clock_timestamp()-interval '7 days'
 ON CONFLICT(signal_id,admin_telegram_id) DO UPDATE
 SET claim_token=v_token,status='processing',
     lease_until=clock_timestamp()+interval '2 minutes',
     attempts=d.attempts+1,updated_at=clock_timestamp(),last_error=NULL
 WHERE d.status IN ('processing','retry') AND d.lease_until<=clock_timestamp() AND d.attempts<6
 AND EXISTS(SELECT 1 FROM public.bot_behavior_signals s
   WHERE s.id=p_signal_id AND s.review_status='pending')
 RETURNING claim_token INTO v_result;
 RETURN v_result;
END $function$;
REVOKE ALL ON FUNCTION public.claim_bot_alert_delivery_server(bigint,bigint) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_bot_alert_delivery_server(bigint,bigint) TO service_role;
CREATE OR REPLACE FUNCTION public.finish_bot_alert_delivery_server(p_signal_id bigint, p_admin_id bigint, p_claim_token uuid, p_sent boolean, p_error text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE v_count integer;
BEGIN
 IF p_claim_token IS NULL OR p_sent IS NULL THEN RETURN false;END IF;
 UPDATE public.bot_alert_deliveries SET
 status=CASE WHEN p_sent THEN 'sent' ELSE 'retry' END,
 sent_at=CASE WHEN p_sent THEN clock_timestamp() ELSE NULL END,
 lease_until=CASE WHEN p_sent THEN clock_timestamp() ELSE clock_timestamp()+interval '10 minutes' END,
 last_error=CASE WHEN p_sent THEN NULL ELSE left(coalesce(p_error,'delivery_failed'),100) END,
 updated_at=clock_timestamp()
 WHERE signal_id=p_signal_id AND admin_telegram_id=p_admin_id
 AND claim_token=p_claim_token AND status='processing';
 GET DIAGNOSTICS v_count=ROW_COUNT;
 RETURN v_count=1;
END $function$;
REVOKE ALL ON FUNCTION public.finish_bot_alert_delivery_server(bigint,bigint,uuid,boolean,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finish_bot_alert_delivery_server(bigint,bigint,uuid,boolean,text) TO service_role;
