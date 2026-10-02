-- Cosmetic selection is validated against durable server achievements.
alter table public.players add column if not exists avatar_frame text;
create table if not exists public.avatar_frame_catalog(id text primary key,achievement_id text not null references public.achievement_catalog(id),position integer not null unique);
alter table public.avatar_frame_catalog enable row level security;
revoke all on public.avatar_frame_catalog from public,anon,authenticated;
grant select on public.avatar_frame_catalog to service_role;
insert into public.avatar_frame_catalog values
 ('bronze','main_10',1),('silver','main_50',2),('gold','main_150',3),('diamond','main_500',4),('scholar','nohint_50',5),('duelist','duel_win_10',6),('champion','duel_win_100',7),('flame','daily_streak_30',8),('cosmos','daily_streak_90',9),('collector','collector_12',10)
on conflict(id) do nothing;
create or replace function public.avatar_frame_state(p_telegram_id bigint,p_language text) returns jsonb language plpgsql set search_path='' as $$
declare s jsonb;frames jsonb;selected text;
begin
 s:=public.achievement_state(p_telegram_id,p_language);
 select avatar_frame into selected from public.players where telegram_id=p_telegram_id;
 select jsonb_agg(jsonb_build_object('id',c.id,'unlocked',(a->>'unlocked')::boolean,'progress',(a->>'progress')::integer,'target',(a->>'target')::integer,'description',a->>'description') order by c.position) into frames
 from public.avatar_frame_catalog c join jsonb_array_elements(s->'items') a on a->>'id'=c.achievement_id;
 return s||jsonb_build_object('frames',frames,'avatar_frame',selected);
end $$;
create or replace function public.avatar_frame_equip(p_telegram_id bigint,p_language text,p_frame text) returns jsonb language plpgsql set search_path='' as $$
declare s jsonb;
begin
 s:=public.avatar_frame_state(p_telegram_id,p_language);
 if p_frame is not null and not exists(select 1 from jsonb_array_elements(s->'frames') f where f->>'id'=p_frame and (f->>'unlocked')::boolean) then raise exception 'frame_locked';end if;
 update public.players set avatar_frame=p_frame where telegram_id=p_telegram_id;
 return s||jsonb_build_object('avatar_frame',p_frame);
end $$;
revoke all on function public.avatar_frame_state(bigint,text),public.avatar_frame_equip(bigint,text,text) from public,anon,authenticated;
grant execute on function public.avatar_frame_state(bigint,text),public.avatar_frame_equip(bigint,text,text) to service_role;
-- Public lookup exposes only the same game IDs already visible on the leaderboard.
create or replace function public.get_avatar_frames(p_codes text[]) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_object_agg(p.photoword_id,p.avatar_frame),'{}'::jsonb) from public.players p
 where p.photoword_id in (select code from unnest(p_codes) code limit 100) and p.avatar_frame is not null;
$$;
revoke all on function public.get_avatar_frames(text[]) from public;
grant execute on function public.get_avatar_frames(text[]) to anon,authenticated,service_role;
