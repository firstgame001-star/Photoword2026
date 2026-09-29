-- Private, server-verified duel totals and the latest settled matches.
create or replace function public.duel_statistics(p_telegram_id bigint)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid; item record; totals jsonb; recent jsonb;
begin
  select id into actor from public.players where telegram_id=p_telegram_id;
  if actor is null then raise exception 'player_not_found'; end if;

  -- A result is available as soon as the server clock expires, even before cron runs.
  for item in select id from public.duel_matches
    where (creator=actor or opponent=actor)
      and ((status='active' and ends_at<=clock_timestamp())
        or (status='waiting' and expires_at<=clock_timestamp()))
  loop perform public.duel_settle_one(item.id); end loop;

  select jsonb_build_object(
    'played',count(*),
    'wins',count(*) filter (where winner=actor),
    'draws',count(*) filter (where winner is null),
    'losses',count(*) filter (where winner is not null and winner<>actor),
    'best_score',coalesce(max(case when creator=actor then creator_score else opponent_score end),0),
    'net_coins',coalesce(sum(case when winner=actor then payout-stake
        when winner is null then 0 else -stake end),0)) into totals
  from public.duel_matches
  where status='finished' and (creator=actor or opponent=actor);

  select coalesce(jsonb_agg(to_jsonb(h) order by h.settled_at desc),'[]'::jsonb) into recent
  from (
    select m.code,m.stake,m.settled_at,
      case when m.status='cancelled' then 'cancelled'
        when m.winner=actor then 'won'
        when m.winner is null then 'draw' else 'lost' end as outcome,
      case when m.creator=actor then m.creator_score else m.opponent_score end as my_score,
      case when m.creator=actor then m.opponent_score else m.creator_score end as their_score,
      case when m.winner=actor then m.payout else 0 end as payout,
      case when m.status='cancelled' or m.winner is null then 0
        when m.winner=actor then m.payout-m.stake else -m.stake end as net_coins,
      coalesce(nullif(p.game_nickname,''),nullif(p.first_name,''),nullif(p.username,''),p.photoword_id) as opponent_name
    from public.duel_matches m
    left join public.players p on p.id=case when m.creator=actor then m.opponent else m.creator end
    where (m.creator=actor or m.opponent=actor) and m.status in ('finished','cancelled')
    order by m.settled_at desc,m.created_at desc limit 15
  ) h;
  return totals||jsonb_build_object('history',recent);
end $$;
revoke all on function public.duel_statistics(bigint) from public,anon,authenticated;
grant execute on function public.duel_statistics(bigint) to service_role;
