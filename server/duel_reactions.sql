-- Reactions are owned by each verified match participant, with a short server-side cooldown.
alter table public.duel_matches
 add column if not exists creator_reaction text,
 add column if not exists creator_reaction_at timestamptz,
 add column if not exists opponent_reaction text,
 add column if not exists opponent_reaction_at timestamptz;

create or replace function public.duel_react(p_telegram_id bigint,p_code text,p_reaction text)
returns void language plpgsql security definer set search_path='' as $$
declare m public.duel_matches; actor uuid; now_at timestamptz;
begin
 if p_reaction is null or p_reaction not in ('laugh','cool','fire','clap','wow','heart','thinking','strong')
   then raise exception 'duel_bad_reaction'; end if;
 select id into actor from public.players where telegram_id=p_telegram_id;
 select * into m from public.duel_matches where code=upper(p_code)
   and actor in (creator,opponent) for update;
 if not found then raise exception 'duel_not_found'; end if;
 now_at:=clock_timestamp();
 if m.status<>'active' or now_at<m.starts_at or now_at>=m.ends_at
   then raise exception 'duel_not_active'; end if;
 if m.creator=actor then
   if m.creator_reaction_at is not null and now_at<m.creator_reaction_at+interval '2 seconds'
     then raise exception 'duel_reaction_wait'; end if;
   update public.duel_matches set creator_reaction=p_reaction,creator_reaction_at=now_at where id=m.id;
 else
   if m.opponent_reaction_at is not null and now_at<m.opponent_reaction_at+interval '2 seconds'
     then raise exception 'duel_reaction_wait'; end if;
   update public.duel_matches set opponent_reaction=p_reaction,opponent_reaction_at=now_at where id=m.id;
 end if;
end $$;
revoke all on function public.duel_react(bigint,text,text) from public,anon,authenticated;
grant execute on function public.duel_react(bigint,text,text) to service_role;

-- The same snapshot is viewed from both sides: my/their are swapped by verified Telegram ID.
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
 return jsonb_build_object('code',m.code,'stake',m.stake,'language',m.language,'status',m.status,
   'creator',m.creator=v_id,'invitee_name',invitee_name,
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
