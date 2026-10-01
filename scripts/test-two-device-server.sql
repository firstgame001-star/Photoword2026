begin;
insert into public.players(telegram_id,photoword_id,completed_levels) values(-911170001,'TWO_DEVICE_'||gen_random_uuid(),100);
insert into public.challenge_runs(player_id,mode) select id,m from public.players cross join unnest(array['nohint','blitz','limited']) m where telegram_id=-911170001;
select jsonb_build_object(
 'phone_a',public.reserve_challenge_questions(-911170001,(select r.id from public.challenge_runs r join public.players p on p.id=r.player_id where p.telegram_id=-911170001 and r.mode='nohint'),'nohint',array[100,101]),
 'phone_b',public.reserve_challenge_questions(-911170001,(select r.id from public.challenge_runs r join public.players p on p.id=r.player_id where p.telegram_id=-911170001 and r.mode='blitz'),'blitz',array[]::integer[]),
 'phone_a_reload',public.reserve_challenge_questions(-911170001,(select r.id from public.challenge_runs r join public.players p on p.id=r.player_id where p.telegram_id=-911170001 and r.mode='limited'),'limited',array[]::integer[])
) as batches;
rollback;
