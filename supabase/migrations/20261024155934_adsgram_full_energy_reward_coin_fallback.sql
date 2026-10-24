-- A confirmed AdsGram energy ad must not lose its reward when energy regenerates during playback.
-- Pay +5 coins only if current server energy is already full; retain energy-category limit.
CREATE OR REPLACE FUNCTION public.claim_ad_reward_server(p_telegram_id bigint, p_nonce uuid)
 RETURNS players
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
  if e.limited_energy>=5 then
   -- If energy refilled while a confirmed ad was running, provide five coins.
   update public.players set coins=coins+5 where id=v.id returning * into v;
   insert into public.coin_transactions(player_id,amount,transaction_type,description)
   values(v.id,5,'ad_reward','Confirmed energy ad: full-energy coin fallback');
   update public.ad_reward_claims set reward_coins=5,reward_energy=0 where id=c.id;
  else
   update public.challenge_profiles set limited_energy=least(5,limited_energy+1),updated_at=now() where player_id=v.id;
  end if;
 else
  update public.players set coins=coins+5 where id=v.id returning * into v;
  insert into public.coin_transactions(player_id,amount,transaction_type,description) values(v.id,5,'ad_reward','Rewarded ad');
 end if;
 update public.ad_reward_claims set status='claimed',claimed_at=now() where id=c.id;
 return v;
end $function$;
REVOKE ALL ON FUNCTION public.claim_ad_reward_server(bigint,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_ad_reward_server(bigint,uuid) TO service_role;
