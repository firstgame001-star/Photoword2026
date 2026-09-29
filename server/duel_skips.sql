-- Each player may skip up to three questions during an active one-minute duel.
alter table public.duel_matches
  add column if not exists creator_skips integer not null default 0 check (creator_skips between 0 and 3),
  add column if not exists opponent_skips integer not null default 0 check (opponent_skips between 0 and 3);

create or replace function public.duel_skip(p_telegram_id bigint,p_code text)
returns void language plpgsql security definer set search_path='' as $$
declare m public.duel_matches; actor uuid; is_creator boolean; idx integer; used integer;
begin
 select id into actor from public.players where telegram_id=p_telegram_id;
 select * into m from public.duel_matches where code=upper(p_code)
   and actor in (creator,opponent) for update;
 if not found then raise exception 'duel_not_found'; end if;
 if m.status<>'active' or clock_timestamp()<m.starts_at or clock_timestamp()>=m.ends_at
   then raise exception 'duel_not_active'; end if;
 is_creator:=m.creator=actor;
 idx:=case when is_creator then m.creator_index else m.opponent_index end;
 used:=case when is_creator then m.creator_skips else m.opponent_skips end;
 if used>=3 then raise exception 'duel_skips_exhausted'; end if;
 if (case when is_creator then m.creator_next_guess_at else m.opponent_next_guess_at end)>clock_timestamp()
   then raise exception 'duel_wait'; end if;
 if idx>=cardinality(m.question_ids)-1 then raise exception 'duel_no_questions'; end if;
 if is_creator then
   update public.duel_matches set creator_index=creator_index+1,creator_skips=creator_skips+1,
     creator_next_guess_at=null where id=m.id;
 else
   update public.duel_matches set opponent_index=opponent_index+1,opponent_skips=opponent_skips+1,
     opponent_next_guess_at=null where id=m.id;
 end if;
end $$;
revoke all on function public.duel_skip(bigint,text) from public,anon,authenticated;
grant execute on function public.duel_skip(bigint,text) to service_role;

-- Reuse the match snapshot, with server-owned skip counter and friendship state.
create or replace function public.duel_snapshot(p_telegram_id bigint,p_code text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.duel_matches; v_id uuid; v_index integer; v_allowed timestamptz; invitee_name text;
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
 return jsonb_build_object('code',m.code,'stake',m.stake,'language',m.language,'status',m.status,
   'creator',m.creator=v_id,'invitee_name',invitee_name,
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
