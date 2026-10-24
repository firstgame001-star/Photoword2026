-- Private idempotent delivery records for staff bot-behavior alerts.
CREATE TABLE IF NOT EXISTS public.bot_alert_deliveries(
 signal_id bigint NOT NULL REFERENCES public.bot_behavior_signals(id) ON DELETE CASCADE,
 admin_telegram_id bigint NOT NULL CHECK(admin_telegram_id>0),
 status text NOT NULL DEFAULT 'processing' CHECK(status IN ('processing','retry','sent')),
 claim_token uuid NOT NULL DEFAULT gen_random_uuid(),
 lease_until timestamptz NOT NULL DEFAULT clock_timestamp()+interval '2 minutes',
 attempts integer NOT NULL DEFAULT 1 CHECK(attempts BETWEEN 1 AND 6),
 sent_at timestamptz,
 last_error text,
 updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(signal_id,admin_telegram_id)
);
CREATE INDEX IF NOT EXISTS bot_alert_delivery_retry_idx
 ON public.bot_alert_deliveries(lease_until) WHERE status IN ('processing','retry');
ALTER TABLE public.bot_alert_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bot_alert_deliveries FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.bot_alert_deliveries TO service_role;
