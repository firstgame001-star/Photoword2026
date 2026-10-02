-- Profile showcase is private and selected only from server-unlocked achievements.
alter table public.players add column if not exists featured_achievements text[] not null default '{}';
do $$ begin if not exists(select 1 from pg_constraint where conname='profile_showcase_size' and conrelid='public.players'::regclass) then alter table public.players add constraint profile_showcase_size check(cardinality(featured_achievements)<=3);end if;end $$;
create or replace function public.profile_showcase(p_telegram_id bigint,p_language text,p_achievements text[],p_generation integer) returns jsonb language plpgsql set search_path='' as $$
declare v public.players;s jsonb;
begin
 select * into v from public.players where telegram_id=p_telegram_id for update;
 if v.id is null then raise exception 'player_not_found';end if;
 if p_generation is null or p_generation<>v.progress_generation then raise exception 'progress_reset';end if;
 if p_achievements is null or cardinality(p_achievements)>3 or array_ndims(p_achievements)>1 or exists(select 1 from unnest(p_achievements)a where a is null) or cardinality(p_achievements)<>(select count(distinct a) from unnest(p_achievements)a) then raise exception 'bad_showcase';end if;
 s:=public.achievement_state(p_telegram_id,p_language);
 if exists(select 1 from unnest(p_achievements)a where not exists(select 1 from jsonb_array_elements(s->'items')i where i->>'id'=a and (i->>'unlocked')::boolean)) then raise exception 'achievement_locked';end if;
 update public.players set featured_achievements=p_achievements where id=v.id;
 return public.avatar_frame_state(p_telegram_id,p_language)||jsonb_build_object('featured_achievements',to_jsonb(p_achievements));
end $$;
revoke all on function public.profile_showcase(bigint,text,text[],integer) from public,anon,authenticated;
grant execute on function public.profile_showcase(bigint,text,text[],integer) to service_role;
create or replace function public.profile_daily_summary(p_telegram_id bigint) returns jsonb language plpgsql set search_path='' as $$
declare actor uuid;today date:=public.daily_puzzle_day(clock_timestamp());current_streak integer;best integer;total integer;
begin
 select id into actor from public.players where telegram_id=p_telegram_id;
 if actor is null then raise exception 'player_not_found';end if;
 with days as(select puzzle_day,puzzle_day-(row_number() over(order by puzzle_day))::integer grp from public.daily_puzzle_progress where player_id=actor and solved and puzzle_day<=today),series as(select count(*)::integer n,max(puzzle_day) last_day from days group by grp)
 select coalesce(max(n) filter(where last_day>=today-1),0),coalesce(max(n),0),coalesce(sum(n),0) into current_streak,best,total from series;
 return jsonb_build_object('streak',current_streak,'best_streak',best,'solved',total);
end $$;
revoke all on function public.profile_daily_summary(bigint) from public,anon,authenticated;
grant execute on function public.profile_daily_summary(bigint) to service_role;
