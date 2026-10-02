-- Legacy challenge completion is called only by the Telegram-authenticated Edge Function.
revoke execute on function public.finish_challenge_run_server(bigint,uuid,text,integer,integer) from public,anon,authenticated;
grant execute on function public.finish_challenge_run_server(bigint,uuid,text,integer,integer) to service_role;
