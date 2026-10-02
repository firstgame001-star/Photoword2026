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
 select max(completed_at) into last_completed_at from (
   select completed_at from public.level_progress where player_id=v.id and completed
   union all
   select completed_at from public.theme_progress where player_id=v.id
 ) history;
 if last_completed_at is not null and clock_timestamp()<last_completed_at+interval '3 seconds' then raise exception 'level_too_fast'; end if;
 insert into public.level_progress(player_id,level_id,completed,attempts,completed_at) values(v.id,p_level_id,true,1,clock_timestamp())
 on conflict(player_id,level_id) do update set completed=true,attempts=public.level_progress.attempts+1,completed_at=clock_timestamp();
 next_chapter:=case when p_level_id>=630 then 15 when p_level_id>=580 then 14 when p_level_id>=530 then 13 when p_level_id>=480 then 12 when p_level_id>=430 then 11 when p_level_id>=380 then 10 when p_level_id>=330 then 9 when p_level_id>=280 then 8 when p_level_id>=230 then 7 when p_level_id>=180 then 6 when p_level_id>=130 then 5 when p_level_id>=90 then 4 when p_level_id>=50 then 3 when p_level_id>=20 then 2 else 1 end;
 update public.players set coins=coins+p_reward_coins,xp=xp+p_reward_xp,completed_levels=completed_levels+1,current_level=greatest(current_level,p_level_id+1),current_chapter=greatest(current_chapter,next_chapter) where id=v.id returning * into v;
 insert into public.coin_transactions(player_id,amount,transaction_type,description) values(v.id,p_reward_coins,'level_reward','Level '||p_level_id);
 return v;
end $function$;

create or replace function public.complete_theme_level_server(p_telegram_id bigint,p_theme_id text,p_level_id integer,p_language text,p_answer text,p_reward_coins integer default 15,p_reward_xp integer default 10)
returns public.players language plpgsql set search_path to ''
as $function$
declare v public.players; v_expected text; v_inserted integer; last_completed_at timestamptz;
begin
 if p_theme_id not in ('sport','art','professions','travel','science','technology','cinema','food','animals','transport','home','nature')
    or p_level_id not between 1 and 100 or p_language not in ('ru','en','az')
    or p_reward_coins is distinct from 15 or p_reward_xp is distinct from 10 then raise exception 'bad_theme_level'; end if;
 select case p_language when 'ru' then a.ru when 'en' then a.en else a.az end into v_expected
 from public.theme_level_answers a where a.theme_id=p_theme_id and a.level_id=p_level_id;
 if v_expected is null then raise exception 'bad_theme_level'; end if;
 if trim(coalesce(p_answer,'')) is distinct from v_expected then raise exception 'wrong_answer'; end if;
 select * into v from public.players where telegram_id=p_telegram_id for update;
 if v.id is null then raise exception 'player_not_found'; end if;
 if not exists(select 1 from public.theme_progress d where d.player_id=v.id and d.theme_id=p_theme_id and d.level_id=p_level_id)
    and exists(select 1 from generate_series(1,p_level_id-1) required(level_id) where not exists(
      select 1 from public.theme_progress prior where prior.player_id=v.id and prior.theme_id=p_theme_id and prior.level_id=required.level_id
    )) then raise exception 'theme_level_locked'; end if;
 if exists(select 1 from public.theme_progress where player_id=v.id and theme_id=p_theme_id and level_id=p_level_id) then return v; end if;
 select max(completed_at) into last_completed_at from (
   select completed_at from public.level_progress where player_id=v.id and completed
   union all
   select completed_at from public.theme_progress where player_id=v.id
 ) history;
 if last_completed_at is not null and clock_timestamp()<last_completed_at+interval '3 seconds' then raise exception 'theme_level_too_fast'; end if;
 insert into public.theme_progress(player_id,theme_id,level_id,completed_at) values(v.id,p_theme_id,p_level_id,clock_timestamp()) on conflict(player_id,theme_id,level_id) do nothing;
 get diagnostics v_inserted=row_count;
 if v_inserted=0 then return v; end if;
 update public.players set coins=coins+p_reward_coins,xp=xp+p_reward_xp where id=v.id returning * into v;
 insert into public.coin_transactions(player_id,amount,transaction_type,description) values(v.id,p_reward_coins,'theme_level_reward','Theme '||p_theme_id||' level '||p_level_id);
 return v;
end
$function$;