alter table public.ad_reward_claims add column reward_kind text not null default 'coins' check(reward_kind in ('coins','energy'));
alter table public.ad_reward_claims add column reward_energy integer not null default 0 check(reward_energy between 0 and 1);
create or replace function public.prepare_ad_reward_server(p_telegram_id bigint,p_kind text default 'coins') returns jsonb language plpgsql security invoker set search_path='' as $$
declare v public.players; n uuid; cnt integer; recent timestamptz; e public.challenge_profiles;
begin
 select * into v from public.players where telegram_id=p_telegram_id for update;
 if v.id is null then raise exception 'player_not_found'; end if;
 if p_kind not in ('coins','energy') or p_kind is null then raise exception 'bad_reward'; end if;
 select count(*) into cnt from public.ad_reward_claims where player_id=v.id and reward_kind=p_kind and status='claimed' and claimed_at >= date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
 if cnt>=(case when p_kind='energy' then 2 else 3 end) then raise exception 'ad_daily_limit'; end if;
 select max(prepared_at) into recent from public.ad_reward_claims where player_id=v.id;
 if recent>now()-interval '10 minutes' then raise exception 'ad_cooldown'; end if;
 if p_kind='energy' then
  e:=public.refresh_challenge_energy_server(v.id);
  if e.limited_energy>=5 then raise exception 'energy_full'; end if;
 end if;
 insert into public.ad_reward_claims(player_id,reward_kind,reward_coins,reward_energy) values(v.id,p_kind,case when p_kind='coins' then 5 else 0 end,case when p_kind='energy' then 1 else 0 end) returning nonce into n;
 return jsonb_build_object('nonce',n,'reward_kind',p_kind,'reward',case when p_kind='coins' then 5 else 1 end);
end $$;
revoke all on function public.prepare_ad_reward_server(bigint,text) from public,anon,authenticated;
grant execute on function public.prepare_ad_reward_server(bigint,text) to service_role;
create or replace function public.claim_ad_reward_server(p_telegram_id bigint,p_nonce uuid) returns public.players language plpgsql security invoker set search_path='' as $$
declare v public.players; c public.ad_reward_claims; cnt integer; e public.challenge_profiles;
begin
 select * into v from public.players where telegram_id=p_telegram_id for update;
 if v.id is null then raise exception 'player_not_found'; end if;
 select * into c from public.ad_reward_claims where nonce=p_nonce and player_id=v.id for update;
 if c.id is null then raise exception 'ad_claim_invalid'; end if;
 if c.status='claimed' then return v; end if;
 if c.status<>'confirmed' then raise exception 'ad_claim_unconfirmed'; end if;
 if c.prepared_at<now()-interval '8 minutes' then raise exception 'ad_claim_expired'; end if;
 select count(*) into cnt from public.ad_reward_claims where player_id=v.id and reward_kind=c.reward_kind and status='claimed' and claimed_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
 if cnt>=(case when c.reward_kind='energy' then 2 else 3 end) then raise exception 'ad_daily_limit'; end if;
 if c.reward_kind='energy' then
  e:=public.refresh_challenge_energy_server(v.id);
  update public.challenge_profiles set limited_energy=least(5,limited_energy+1),updated_at=now() where player_id=v.id;
 else
  update public.players set coins=coins+5 where id=v.id returning * into v;
  insert into public.coin_transactions(player_id,amount,transaction_type,description) values(v.id,5,'ad_reward','Rewarded ad');
 end if;
 update public.ad_reward_claims set status='claimed',claimed_at=now() where id=c.id;
 return v;
end $$;
revoke all on function public.claim_ad_reward_server(bigint,uuid) from public,anon,authenticated;
grant execute on function public.claim_ad_reward_server(bigint,uuid) to service_role;
