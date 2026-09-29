-- The two participants solve the same question IDs, each in their chosen language.
alter table public.duel_matches add column if not exists opponent_language text
  check (opponent_language in ('ru','en','az'));

-- The public lobby includes every language; joining records the player's own choice.
drop index if exists public.duel_open_public_rooms;
create index if not exists duel_open_public_all on public.duel_matches(created_at desc)
  where public_room and status='waiting' and invitee is null;
create or replace function public.duel_public_rooms(p_telegram_id bigint,p_language text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
  select id into actor from public.players where telegram_id=p_telegram_id;
  if actor is null then raise exception 'player_not_found'; end if;
  if p_language not in ('ru','en','az') then raise exception 'duel_bad_language'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'code',rooms.code,'stake',rooms.stake,'name',rooms.name,'expires_at',rooms.expires_at)
      order by rooms.created_at desc)
    from (select m.code,m.stake,m.expires_at,m.created_at,
      coalesce(nullif(p.game_nickname,''),nullif(p.first_name,''),nullif(p.username,''),p.photoword_id) name
      from public.duel_matches m join public.players p on p.id=m.creator
      where m.public_room and m.status='waiting' and m.invitee is null
        and m.expires_at>clock_timestamp() and m.creator<>actor
      order by m.created_at desc limit 20) rooms),'[]'::jsonb);
end $$;

create or replace function public.duel_join_localized(p_telegram_id bigint,p_code text,p_language text)
returns void language plpgsql security definer set search_path='' as $$
begin
  if p_language not in ('ru','en','az') then raise exception 'duel_bad_language'; end if;
  perform public.duel_join(p_telegram_id,p_code);
  update public.duel_matches set opponent_language=p_language
    where code=upper(p_code) and opponent=(select id from public.players where telegram_id=p_telegram_id);
end $$;

create or replace function public.duel_join_public_localized(p_telegram_id bigint,p_code text,p_language text)
returns void language plpgsql security definer set search_path='' as $$
declare room public.duel_matches;
begin
  if p_language not in ('ru','en','az') then raise exception 'duel_bad_language'; end if;
  select * into room from public.duel_matches where code=upper(p_code) for update;
  if not found or not room.public_room or room.invitee is not null
     then raise exception 'duel_not_found'; end if;
  if room.status<>'waiting' or room.expires_at<=clock_timestamp()
     then raise exception 'duel_not_waiting'; end if;
  perform public.duel_join_localized(p_telegram_id,room.code,p_language);
end $$;

create or replace function public.duel_rematch_localized(p_telegram_id bigint,p_previous_code text,p_stake integer,p_language text)
returns text language plpgsql security definer set search_path='' as $$
declare created_code text;
begin
  if p_language not in ('ru','en','az') then raise exception 'duel_bad_language'; end if;
  created_code:=public.duel_rematch(p_telegram_id,p_previous_code,p_stake);
  update public.duel_matches set language=p_language where code=created_code
    and creator=(select id from public.players where telegram_id=p_telegram_id);
  return created_code;
end $$;
revoke all on function public.duel_join_localized(bigint,text,text),
  public.duel_join_public_localized(bigint,text,text),
  public.duel_rematch_localized(bigint,text,integer,text) from public,anon,authenticated;
grant execute on function public.duel_join_localized(bigint,text,text),
  public.duel_join_public_localized(bigint,text,text),
  public.duel_rematch_localized(bigint,text,integer,text) to service_role;

-- Answer validation uses the player's chosen locale, while question IDs and scores stay shared.
create or replace function public.duel_submit(p_telegram_id bigint,p_code text,p_answer text)
returns boolean language plpgsql security definer set search_path='' as $$
declare m public.duel_matches; v_id uuid; v_creator boolean; v_index integer; v_allowed timestamptz;
        v_correct text; v_ok boolean;
begin
  select id into v_id from public.players where telegram_id=p_telegram_id;
  select * into m from public.duel_matches where code=upper(p_code) and (creator=v_id or opponent=v_id) for update;
  if not found then raise exception 'duel_not_found'; end if;
  if m.status<>'active' or clock_timestamp()<m.starts_at or clock_timestamp()>=m.ends_at then raise exception 'duel_not_active'; end if;
  v_creator:=m.creator=v_id;
  v_index:=case when v_creator then m.creator_index else m.opponent_index end;
  v_allowed:=case when v_creator then m.creator_next_guess_at else m.opponent_next_guess_at end;
  if v_index>=cardinality(m.question_ids) then raise exception 'duel_no_questions'; end if;
  if v_allowed is not null and clock_timestamp()<v_allowed then raise exception 'duel_wait'; end if;
  select case (case when v_creator then m.language else coalesce(m.opponent_language,m.language) end) when 'en' then answer_en when 'az' then answer_az else answer_ru end into v_correct
    from public.duel_questions where id=m.question_ids[v_index+1];
  if length(p_answer)>40 or p_answer is null then raise exception 'duel_bad_answer'; end if;
  v_ok:=trim(p_answer)=v_correct;
  if v_creator then
    update public.duel_matches set creator_index=creator_index+case when v_ok then 1 else 0 end,
      creator_score=creator_score+case when v_ok then 1 else 0 end,
      creator_next_guess_at=clock_timestamp()+(case when v_ok then interval '0.35 seconds' else interval '2 seconds' end)
      where id=m.id;
  else
    update public.duel_matches set opponent_index=opponent_index+case when v_ok then 1 else 0 end,
      opponent_score=opponent_score+case when v_ok then 1 else 0 end,
      opponent_next_guess_at=clock_timestamp()+(case when v_ok then interval '0.35 seconds' else interval '2 seconds' end)
      where id=m.id;
  end if;
  return v_ok;
end $$;

revoke all on function public.duel_submit(bigint,text,text) from public,anon,authenticated;
grant execute on function public.duel_submit(bigint,text,text) to service_role;

-- Each player's snapshot tells the Edge Function which localized answer and letters to serve.
create or replace function public.duel_snapshot(p_telegram_id bigint,p_code text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.duel_matches; v_id uuid; v_index integer; v_allowed timestamptz; invitee_name text; my_name text; their_name text;
begin
 select id into v_id from public.players where telegram_id=p_telegram_id;
 if p_code is null then
   select * into m from public.duel_matches where (creator=v_id or opponent=v_id)
     and status in ('waiting','active') order by created_at desc limit 1;
 else
   select * into m from public.duel_matches where code=upper(p_code) and (creator=v_id or opponent=v_id);
 end if;
 if not found then return null; end if;
 perform public.duel_settle_one(m.id);
 select * into m from public.duel_matches where id=m.id;
 v_index:=case when m.creator=v_id then m.creator_index else m.opponent_index end;
 v_allowed:=case when m.creator=v_id then m.creator_next_guess_at else m.opponent_next_guess_at end;
 if m.creator=v_id and m.invitee is not null then
   select coalesce(nullif(game_nickname,''),nullif(first_name,''),photoword_id) into invitee_name
     from public.players where id=m.invitee;
 end if;
 select coalesce(nullif(game_nickname,''),nullif(first_name,''),nullif(username,''),photoword_id) into my_name
   from public.players where id=v_id;
 if m.opponent is not null then
   select coalesce(nullif(game_nickname,''),nullif(first_name,''),nullif(username,''),photoword_id) into their_name
     from public.players where id=case when m.creator=v_id then m.opponent else m.creator end;
 end if;
 return jsonb_build_object('code',m.code,'stake',m.stake,'language',case when m.creator=v_id then m.language else coalesce(m.opponent_language,m.language) end,'status',m.status,
   'creator',m.creator=v_id,'invitee_name',invitee_name,'public_room',m.public_room,
   'my_name',my_name,'their_name',their_name,
   'my_reaction',case when m.creator=v_id then m.creator_reaction else m.opponent_reaction end,
   'my_reaction_at',case when m.creator=v_id then m.creator_reaction_at else m.opponent_reaction_at end,
   'their_reaction',case when m.creator=v_id then m.opponent_reaction else m.creator_reaction end,
   'their_reaction_at',case when m.creator=v_id then m.opponent_reaction_at else m.creator_reaction_at end,
   'skips_left',3-case when m.creator=v_id then m.creator_skips else m.opponent_skips end,
   'friends',case when m.opponent is null then false else exists(
     select 1 from public.friendships f where f.status='accepted'
       and least(f.requester_id,f.addressee_id)=least(m.creator,m.opponent)
       and greatest(f.requester_id,f.addressee_id)=greatest(m.creator,m.opponent)) end,
   'my_score',case when m.creator=v_id then m.creator_score else m.opponent_score end,
   'their_score',case when m.creator=v_id then m.opponent_score else m.creator_score end,
   'question_id',case when m.status='active' and v_index<cardinality(m.question_ids) then m.question_ids[v_index+1] else null end,
   'starts_at',m.starts_at,'ends_at',m.ends_at,'expires_at',m.expires_at,
   'next_guess_at',v_allowed,'won',m.winner=v_id,'draw',m.status='finished' and m.winner is null,
   'payout',case when m.winner=v_id then m.payout else 0 end);
end $$;
revoke all on function public.duel_snapshot(bigint,text) from public,anon,authenticated;
grant execute on function public.duel_snapshot(bigint,text) to service_role;
