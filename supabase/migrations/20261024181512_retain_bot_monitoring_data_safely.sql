-- Keep short-lived answer timing samples private and bounded as traffic grows.
CREATE INDEX IF NOT EXISTS bot_answer_cleanup_time_idx
 ON public.bot_answer_telemetry(answered_at);
-- Every hour, discard up to 10k raw timing observations older than 7 days,
-- and up to 2k review signals older than 90 days. Bounded batches avoid long locks.
SELECT cron.schedule(
 'photoword-bot-behavior-cleanup','23 * * * *',
 $job$
  DELETE FROM public.bot_answer_telemetry
  WHERE id IN (
   SELECT id FROM public.bot_answer_telemetry
   WHERE answered_at < now() - interval '7 days'
   ORDER BY answered_at LIMIT 10000
  );
  DELETE FROM public.bot_behavior_signals
  WHERE id IN (
   SELECT id FROM public.bot_behavior_signals
   WHERE last_seen < now() - interval '90 days'
   ORDER BY last_seen LIMIT 2000
  );
 $job$
);
