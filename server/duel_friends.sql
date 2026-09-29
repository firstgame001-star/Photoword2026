-- Mutual game friends, accessible only through Telegram-verified duel-game.
alter table public.friendships enable row level security;
revoke all on public.friendships from public,anon,authenticated;
create unique index if not exists friendships_unordered_pair on public.friendships
  (least(requester_id,addressee_id),greatest(requester_id,addressee_id));

create or replace function public.duel_friend_list(p_telegram_id bigint)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 select id into actor from public.players where telegram_id=p_telegram_id;
 if actor is null then raise exception 'player_not_found'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',f.id,'status',f.status,
   'direction',case when f.requester_id=actor then 'outgoing' else 'incoming' end,
   'code',p.photoword_id,'name',coalesce(nullif(p.game_nickname,''),nullif(p.first_name,''),p.photoword_id))
   order by f.created_at desc)
   from public.friendships f join public.players p on p.id=case when f.requester_id=actor then f.addressee_id else f.requester_id end
   where (f.requester_id=actor or f.addressee_id=actor) and f.status in ('accepted','pending')),'[]'::jsonb);
end $$;

create or replace function public.duel_friend_request(p_telegram_id bigint,p_friend_code text,p_duel_code text default null)
returns text language plpgsql security definer set search_path='' as $$
declare actor uuid; target uuid; existing public.friendships; match_row public.duel_matches;
begin
 select id into actor from public.players where telegram_id=p_telegram_id;
 if actor is null then raise exception 'player_not_found'; end if;
 if p_duel_code is not null then
   select * into match_row from public.duel_matches where code=upper(p_duel_code) and status='finished'
      and actor in (creator,opponent);
   if not found then raise exception 'duel_not_finished'; end if;
   target:=case when actor=match_row.creator then match_row.opponent else match_row.creator end;
 else
   if p_friend_code is null or length(trim(p_friend_code))>40 then raise exception 'friend_not_found'; end if;
   select id into target from public.players where upper(photoword_id)=upper(trim(p_friend_code));
 end if;
 if target is null then raise exception 'friend_not_found'; end if;
 if target=actor then raise exception 'friend_self'; end if;
 select * into existing from public.friendships
   where least(requester_id,addressee_id)=least(actor,target)
     and greatest(requester_id,addressee_id)=greatest(actor,target) for update;
 if found then
   if existing.status='blocked' then raise exception 'friend_unavailable'; end if;
   if existing.status='accepted' then return 'accepted'; end if;
   if existing.addressee_id=actor then
     update public.friendships set status='accepted' where id=existing.id;
     return 'accepted';
   end if;
   return 'pending';
 end if;
 insert into public.friendships(requester_id,addressee_id,status) values(actor,target,'pending');
 return 'pending';
exception when unique_violation then
 raise exception 'friend_already_requested';
end $$;

create or replace function public.duel_friend_change(p_telegram_id bigint,p_request_id bigint,p_action text)
returns void language plpgsql security definer set search_path='' as $$
declare actor uuid; f public.friendships;
begin
 select id into actor from public.players where telegram_id=p_telegram_id;
 if actor is null then raise exception 'player_not_found'; end if;
 select * into f from public.friendships where id=p_request_id for update;
 if not found or actor not in (f.requester_id,f.addressee_id) then raise exception 'friend_not_found'; end if;
 if p_action='accept' and f.status='pending' and actor=f.addressee_id then
   update public.friendships set status='accepted' where id=f.id;
 elsif p_action='remove' and f.status in ('pending','accepted') then
   delete from public.friendships where id=f.id;
 else raise exception 'friend_invalid_action'; end if;
end $$;

create or replace function public.duel_create_friend(p_telegram_id bigint,p_friend_code text,p_stake integer,p_language text)
returns text language plpgsql security definer set search_path='' as $$
declare actor uuid; target uuid; balance integer; created public.duel_matches;
begin
 if p_stake is null or p_stake<25 or p_stake>500 or p_stake%25<>0 then raise exception 'duel_bad_stake'; end if;
 if p_language not in ('ru','en','az') then raise exception 'duel_bad_language'; end if;
 if p_friend_code is null or length(trim(p_friend_code))>40 then raise exception 'friend_not_found'; end if;
 select id into actor from public.players where telegram_id=p_telegram_id;
 select id into target from public.players where upper(photoword_id)=upper(trim(p_friend_code));
 if actor is null or target is null or actor=target then raise exception 'friend_not_found'; end if;
 perform 1 from public.players p where p.id in (actor,target) order by p.id for update of p;
 if not exists(select 1 from public.friendships where status='accepted'
   and least(requester_id,addressee_id)=least(actor,target)
   and greatest(requester_id,addressee_id)=greatest(actor,target)) then raise exception 'friend_not_accepted'; end if;
 select coins into balance from public.players where id=actor;
 if exists(select 1 from public.duel_matches
   where (creator in (actor,target) or opponent in (actor,target) or invitee in (actor,target))
   and ((status='waiting' and expires_at>clock_timestamp()) or (status='active' and ends_at>clock_timestamp())))
   then raise exception 'duel_already_open'; end if;
 if balance<p_stake then raise exception 'insufficient_coins'; end if;
 update public.players set coins=coins-p_stake where id=actor;
 insert into public.duel_matches(creator,invitee,stake,language) values(actor,target,p_stake,p_language) returning * into created;
 insert into public.coin_transactions(player_id,amount,transaction_type,description)
   values(actor,-p_stake,'duel_entry','Friend invite '||created.code);
 return created.code;
end $$;

create or replace function public.duel_offer(p_telegram_id bigint,p_previous_code text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare target_id uuid; offer public.duel_matches; sender public.players;
begin
 select id into target_id from public.players where telegram_id=p_telegram_id;
 if target_id is null then return null; end if;
 select * into offer from public.duel_matches
   where invitee=target_id and status='waiting' and expires_at>clock_timestamp()
     and (p_previous_code is null or rematch_of=(select id from public.duel_matches where code=upper(p_previous_code)))
   order by created_at desc limit 1;
 if not found then return null; end if;
 select * into sender from public.players where id=offer.creator;
 return jsonb_build_object('code',offer.code,'stake',offer.stake,'language',offer.language,
   'expires_at',offer.expires_at,'kind',case when offer.rematch_of is null then 'friend' else 'rematch' end,
   'from',coalesce(nullif(sender.game_nickname,''),nullif(sender.first_name,''),sender.photoword_id));
end $$;

revoke all on function public.duel_friend_list(bigint),public.duel_friend_request(bigint,text,text),
  public.duel_friend_change(bigint,bigint,text),public.duel_create_friend(bigint,text,integer,text),
  public.duel_offer(bigint,text) from public,anon,authenticated;
grant execute on function public.duel_friend_list(bigint),public.duel_friend_request(bigint,text,text),
  public.duel_friend_change(bigint,bigint,text),public.duel_create_friend(bigint,text,integer,text),
  public.duel_offer(bigint,text) to service_role;
