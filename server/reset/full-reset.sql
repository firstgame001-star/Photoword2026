-- A new game has no previous gameplay progress. Payment/account records stay auditable.
alter table public.players add column if not exists progress_generation integer not null default 0;
alter table public.players add column if not exists progress_reset_at timestamptz not null default '-infinity';
create or replace function public.reset_game_progress_server(p_telegram_id bigint,p_generation integer) returns public.players language plpgsql set search_path='' as $$
declare v public.players;m record;actor uuid;
begin
 select * into v from public.players where telegram_id=p_telegram_id;actor:=v.id;
 if p_generation is not null and p_generation<v.progress_generation then return v;end if;
 if actor is null then raise exception 'player_not_found';end if;
 -- Match locks always precede player locks, as in the duel settlement path.
 for m in select id,code,status from public.duel_matches where (creator=actor or opponent=actor) and status in('waiting','active') order by id loop
  perform public.duel_settle_one(m.id);
  if exists(select 1 from public.duel_matches where id=m.id and status='active') then raise exception 'reset_duel_active';end if;
  if exists(select 1 from public.duel_matches where id=m.id and status='waiting' and creator=actor) then perform public.duel_cancel(p_telegram_id,m.code);end if;
 end loop;
 select * into v from public.players where id=actor for update;
 if p_generation is not null and p_generation<v.progress_generation then return v;end if;
 if p_generation is not null and p_generation<>v.progress_generation then raise exception 'progress_reset';end if;
 if exists(select 1 from public.duel_matches where (creator=actor or opponent=actor) and status in('waiting','active')) then raise exception 'reset_duel_active';end if;
 delete from public.level_progress where player_id=actor;
 delete from public.theme_progress where player_id=actor;
 delete from public.player_achievements where player_id=actor;
 delete from public.achievement_levels where player_id=actor;
 delete from public.challenge_runs where player_id=actor;
 delete from public.challenge_profiles where player_id=actor;
 delete from public.challenge_question_history where player_id=actor;
 delete from public.daily_puzzle_submissions where player_id=actor;
 delete from public.daily_puzzle_progress where player_id=actor;
 delete from public.daily_rewards where player_id=actor;
 delete from public.task_claims where player_id=actor;
 delete from public.notification_settings where player_id=actor;
 delete from public.notification_log where player_id=actor;
 insert into public.coin_transactions(player_id,amount,transaction_type,description) values(actor,250-v.coins,'game_reset','Full game reset '||(v.progress_generation+1));
 update public.players set coins=default,xp=default,current_chapter=default,current_level=default,completed_levels=default,daily_streak=default,last_daily_reward=default,avatar_frame=null,featured_achievements=default,game_nickname=null,nickname_changed=false,notifications_enabled=false,notification_language='ru',notifications_enabled_at=null,last_notification_sent_at=null,progress_generation=progress_generation+1,progress_reset_at=clock_timestamp() where id=actor returning * into v;
 return v;
end $$;
create or replace function public.reset_game_progress_server(p_telegram_id bigint) returns public.players language sql set search_path='' as $$select public.reset_game_progress_server(p_telegram_id,null)$$;
revoke all on function public.reset_game_progress_server(bigint),public.reset_game_progress_server(bigint,integer) from public,anon,authenticated;
grant execute on function public.reset_game_progress_server(bigint),public.reset_game_progress_server(bigint,integer) to service_role;
-- Old queued daily guesses cannot solve the new game after a reset.
create or replace function public.daily_puzzle_answer_epoch(p_telegram_id bigint,p_day date,p_language text,p_answer text,p_request_id uuid,p_generation integer) returns jsonb language plpgsql set search_path='' as $$
declare v public.players;
begin
 select * into v from public.players where telegram_id=p_telegram_id for update;
 if v.id is null then raise exception 'player_not_found';end if;
 if coalesce(p_generation,0)<>v.progress_generation then raise exception 'daily_reset';end if;
 return public.daily_puzzle_answer(p_telegram_id,p_day,p_language,p_answer,p_request_id);
end $$;
revoke all on function public.daily_puzzle_answer_epoch(bigint,date,text,text,uuid,integer) from public,anon,authenticated;
grant execute on function public.daily_puzzle_answer_epoch(bigint,date,text,text,uuid,integer) to service_role;
