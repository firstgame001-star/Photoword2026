create or replace function public.duel_snapshot(p_telegram_id bigint,p_code text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.duel_matches; v_id uuid; v_index integer; v_allowed timestamptz; invitee_name text; my_name text; their_name text; my_levels integer; their_levels integer; my_frame text; their_frame text;
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
 select coalesce(nullif(game_nickname,''),nullif(first_name,''),nullif(username,''),photoword_id),completed_levels,avatar_frame into my_name,my_levels,my_frame
   from public.players where id=v_id;
 if m.opponent is not null then
   select coalesce(nullif(game_nickname,''),nullif(first_name,''),nullif(username,''),photoword_id),completed_levels,avatar_frame into their_name,their_levels,their_frame
     from public.players where id=case when m.creator=v_id then m.opponent else m.creator end;
 end if;
 return jsonb_build_object('code',m.code,'stake',m.stake,'language',case when m.creator=v_id then m.language else coalesce(m.opponent_language,m.language) end,'status',m.status,
   'creator',m.creator=v_id,'invitee_name',invitee_name,'public_room',m.public_room,
   'my_name',my_name,'their_name',their_name,'my_frame',my_frame,'their_frame',their_frame,
   'my_completed_levels',my_levels,'their_completed_levels',their_levels,
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
