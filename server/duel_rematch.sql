-- Private rematches and a two-match question cooldown for both players.
alter table public.duel_matches
  add column if not exists invitee uuid references public.players(id) on delete set null,
  add column if not exists rematch_of uuid references public.duel_matches(id) on delete set null;
create index if not exists duel_pending_invitee on public.duel_matches(invitee,created_at desc)
  where status='waiting' and invitee is not null;

create or replace function public.duel_join(p_telegram_id bigint,p_code text)
returns void language plpgsql security definer set search_path='' as $$
declare m public.duel_matches; v public.players; v_recent integer[];
begin
  select * into m from public.duel_matches where code=upper(p_code) for update;
  if not found then raise exception 'duel_not_found'; end if;
  perform public.duel_settle_one(m.id);
  select * into m from public.duel_matches where id=m.id;
  if m.status<>'waiting' then raise exception 'duel_not_waiting'; end if;
  select * into v from public.players where telegram_id=p_telegram_id for update;
  if not found then raise exception 'player_not_found'; end if;
  if v.id=m.creator then raise exception 'duel_own_invite'; end if;
  if m.invitee is not null and v.id<>m.invitee then raise exception 'duel_invitee_only'; end if;
  if exists(select 1 from public.duel_matches where (creator=v.id or opponent=v.id) and status in ('waiting','active')
            and (status='active' and ends_at>clock_timestamp() or status='waiting' and expires_at>clock_timestamp()))
    then raise exception 'duel_already_open'; end if;
  if v.coins<m.stake then raise exception 'insufficient_coins'; end if;
  select coalesce(array_agg(distinct used.q),'{}'::integer[]) into v_recent
    from (
      select unnest(question_ids) q from (
        select question_ids from public.duel_matches
        where (creator=m.creator or opponent=m.creator) and status in ('active','finished')
        order by created_at desc limit 2
      ) creator_recent
      union all
      select unnest(question_ids) q from (
        select question_ids from public.duel_matches
        where (creator=v.id or opponent=v.id) and status in ('active','finished')
        order by created_at desc limit 2
      ) opponent_recent
    ) used;
  update public.players set coins=coins-m.stake where id=v.id;
  insert into public.coin_transactions(player_id,amount,transaction_type,description)
    values(v.id,-m.stake,'duel_entry','Joined '||m.code);
  update public.duel_matches set opponent=v.id,status='active',
    starts_at=clock_timestamp()+interval '3 seconds',ends_at=clock_timestamp()+interval '63 seconds',
    question_ids=array(
      select id from public.duel_questions
      order by case when id=any(v_recent) then 1 else 0 end,random()
      limit 24
    ) where id=m.id;
end $$;

create or replace function public.duel_rematch(p_telegram_id bigint,p_previous_code text,p_stake integer)
returns text language plpgsql security definer set search_path='' as $$
declare previous public.duel_matches; actor uuid; other_player uuid; balance integer; created public.duel_matches;
begin
  if p_stake is null or p_stake<25 or p_stake>500 or p_stake%25<>0 then raise exception 'duel_bad_stake'; end if;
  select * into previous from public.duel_matches where code=upper(p_previous_code) for update;
  if not found then raise exception 'duel_not_found'; end if;
  select id into actor from public.players where telegram_id=p_telegram_id;
  if actor is null or (actor is distinct from previous.creator and actor is distinct from previous.opponent)
    then raise exception 'duel_not_found'; end if;
  perform public.duel_settle_one(previous.id);
  select * into previous from public.duel_matches where id=previous.id;
  if previous.status<>'finished' then raise exception 'duel_not_finished'; end if;
  other_player:=case when actor=previous.creator then previous.opponent else previous.creator end;
  -- Lock both balances in a stable order before checking active games and taking a stake.
  perform 1 from public.players p where p.id in (actor,other_player) order by p.id for update of p;
  select coins into balance from public.players where id=actor;
  if balance is null then raise exception 'player_not_found'; end if;
  if exists(select 1 from public.duel_matches
      where (creator in (actor,other_player) or opponent in (actor,other_player))
        and ((status='waiting' and expires_at>clock_timestamp())
          or (status='active' and ends_at>clock_timestamp())))
    then raise exception 'duel_already_open'; end if;
  if balance<p_stake then raise exception 'insufficient_coins'; end if;
  update public.players set coins=coins-p_stake where id=actor;
  insert into public.duel_matches(creator,invitee,rematch_of,stake,language)
    values(actor,other_player,previous.id,p_stake,previous.language) returning * into created;
  insert into public.coin_transactions(player_id,amount,transaction_type,description)
    values(actor,-p_stake,'duel_entry','Rematch '||created.code);
  return created.code;
end $$;

create or replace function public.duel_offer(p_telegram_id bigint,p_previous_code text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare target_id uuid; offer public.duel_matches;
begin
  select id into target_id from public.players where telegram_id=p_telegram_id;
  if target_id is null then return null; end if;
  select * into offer from public.duel_matches
    where invitee=target_id and status='waiting' and expires_at>clock_timestamp()
      and (p_previous_code is null or rematch_of=(
        select id from public.duel_matches where code=upper(p_previous_code)
      ))
    order by created_at desc limit 1;
  if not found then return null; end if;
  return jsonb_build_object('code',offer.code,'stake',offer.stake,'language',offer.language,'expires_at',offer.expires_at);
end $$;

revoke all on function public.duel_join(bigint,text),public.duel_rematch(bigint,text,integer),
  public.duel_offer(bigint,text) from public,anon,authenticated;
grant execute on function public.duel_join(bigint,text),public.duel_rematch(bigint,text,integer),
  public.duel_offer(bigint,text) to service_role;
