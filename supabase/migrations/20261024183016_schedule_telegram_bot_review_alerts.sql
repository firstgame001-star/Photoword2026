-- Send staff-only behavioral review alerts every ten minutes through the
-- existing private notification secret, never exposing a bot token in pg_cron.
-- No real player is alerted or punished by this job.
SELECT cron.schedule(
 'photoword-bot-alerts-every-10min','*/10 * * * *',
 $cron$
 SELECT net.http_post(
  url:='https://bqoraxewpcnmidvjlpuy.supabase.co/functions/v1/bot-alert-dispatch',
  body:='{}'::jsonb,
  headers:=jsonb_build_object(
   'Content-Type','application/json',
   'x-pw-notification-secret',
   (SELECT value FROM public.app_config WHERE key='notification_dispatch_secret')
  ),
  timeout_milliseconds:=10000
 );
 $cron$
);
