create or replace function public.complete_level_server(p_telegram_id bigint, p_level_id integer, p_reward_coins integer default 20, p_reward_xp integer default 15)
returns public.players language plpgsql security definer set search_path to ''
as $function$
declare v public.players; already_complete boolean; next_chapter integer; last_completed_at timestamptz;
begin
  if p_level_id not between 1 and 680 or p_reward_coins is distinct from 20 or p_reward_xp is distinct from 15 then raise exception 'invalid_level_or_reward'; end if;
  select * into v from public.players where telegram_id=p_telegram_id for update;
  if v.id is null then raise exception 'player_not_found'; end if;
  if p_level_id>v.current_level then raise exception 'level_locked'; end if;
  select completed into already_complete from public.level_progress where player_id=v.id and level_id=p_level_id;
  if coalesce(already_complete,false) then return v; end if;
  select max(completed_at) into last_completed_at from public.level_progress where player_id=v.id and completed;
  if last_completed_at is not null and clock_timestamp()<last_completed_at+interval '3 seconds' then raise exception 'level_too_fast'; end if;
  insert into public.level_progress(player_id,level_id,completed,attempts,completed_at) values(v.id,p_level_id,true,1,now())
  on conflict(player_id,level_id) do update set completed=true,attempts=public.level_progress.attempts+1,completed_at=now();
  next_chapter:=case when p_level_id>=630 then 15 when p_level_id>=580 then 14 when p_level_id>=530 then 13 when p_level_id>=480 then 12 when p_level_id>=430 then 11 when p_level_id>=380 then 10 when p_level_id>=330 then 9 when p_level_id>=280 then 8 when p_level_id>=230 then 7 when p_level_id>=180 then 6 when p_level_id>=130 then 5 when p_level_id>=90 then 4 when p_level_id>=50 then 3 when p_level_id>=20 then 2 else 1 end;
  update public.players set coins=coins+p_reward_coins,xp=xp+p_reward_xp,completed_levels=completed_levels+1,current_level=greatest(current_level,p_level_id+1),current_chapter=greatest(current_chapter,next_chapter) where id=v.id returning * into v;
  insert into public.coin_transactions(player_id,amount,transaction_type,description) values(v.id,p_reward_coins,'level_reward','Level '||p_level_id);
  return v;
end
$function$;