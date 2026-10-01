create or replace function public.achievement_state(p_telegram_id bigint,p_language text) returns jsonb language plpgsql set search_path='' as $$
declare actor uuid;m jsonb;items jsonb;
begin
 if p_language is null or p_language not in('ru','en','az') then raise exception 'bad_language';end if;
 select id into actor from public.players where telegram_id=p_telegram_id for update;
 if actor is null then raise exception 'player_not_found';end if;
 m:=public.achievement_metrics(actor);
 insert into public.player_achievements(player_id,achievement_id) select actor,c.id from public.achievement_catalog c where coalesce((m->>c.metric)::integer,0)>=c.target on conflict do nothing;
 select jsonb_agg(jsonb_build_object('id',c.id,'category',c.category,'target',c.target,'progress',least(c.target,case when a.achievement_id is not null then c.target else coalesce((m->>c.metric)::integer,0) end),'reward_coins',c.reward_coins,'icon',c.icon,'title',c.title->>p_language,'description',c.description->>p_language,'unlocked',a.achievement_id is not null,'claimed',a.claimed_at is not null,'unlocked_at',a.unlocked_at) order by c.position) into items from public.achievement_catalog c left join public.player_achievements a on a.player_id=actor and a.achievement_id=c.id;
 return jsonb_build_object('items',coalesce(items,'[]'::jsonb),'coins',(select coins from public.players where id=actor));
end $$;
