begin;
do $$
declare t bigint:=-floor(extract(epoch from clock_timestamp())*1000000)::bigint; a uuid;n uuid;i integer;v public.players;
begin
 insert into public.players(telegram_id,photoword_id,coins) values(t,'AD-QA-'||gen_random_uuid(),100) returning id into a;
 for i in 1..3 loop
 n:=(public.prepare_ad_reward_server(t,'coins')->>'nonce')::uuid;
 begin perform public.claim_ad_reward_server(t,n);raise exception 'unconfirmed accepted';exception when others then if sqlerrm<>'ad_claim_unconfirmed' then raise;end if;end;
 update public.ad_reward_claims set status='confirmed' where nonce=n;
 perform public.claim_ad_reward_server(t,n);perform public.claim_ad_reward_server(t,n);
 begin perform public.prepare_ad_reward_server(t,'energy');raise exception 'cooldown bypassed';exception when others then if sqlerrm<>'ad_cooldown' then raise;end if;end;
 update public.ad_reward_claims set prepared_at=now()-interval '11 minutes' where player_id=a;
 end loop;
 if(select coins from public.players where id=a)<>115 then raise exception 'coin duplicate';end if;
 begin perform public.prepare_ad_reward_server(t,'coins');raise exception 'coin limit bypassed';exception when others then if sqlerrm<>'ad_daily_limit' then raise;end if;end;
 perform public.refresh_challenge_energy_server(a);
 begin perform public.prepare_ad_reward_server(t,'energy');raise exception 'full energy accepted';exception when others then if sqlerrm<>'energy_full' then raise;end if;end;
 update public.challenge_profiles set limited_energy=2,energy_ref_at=now() where player_id=a;
 for i in 1..2 loop
 n:=(public.prepare_ad_reward_server(t,'energy')->>'nonce')::uuid;
 update public.ad_reward_claims set status='confirmed' where nonce=n;
 perform public.claim_ad_reward_server(t,n);perform public.claim_ad_reward_server(t,n);
 update public.ad_reward_claims set prepared_at=now()-interval '11 minutes' where player_id=a;
 end loop;
 if(select limited_energy from public.challenge_profiles where player_id=a)<>4 then raise exception 'energy duplicate';end if;
 begin perform public.prepare_ad_reward_server(t,'energy');raise exception 'energy limit bypassed';exception when others then if sqlerrm<>'ad_daily_limit' then raise;end if;end;
 if has_function_privilege('anon','public.prepare_ad_reward_server(bigint,text)','execute') then raise exception 'public reward access';end if;
end $$;

-- A confirmed AdsGram energy ad remains valuable if natural regeneration
-- fills energy while the advertiser's video is playing.
do $energy_fallback$
declare
  t bigint:=870000000000+floor(random()*1000000)::bigint;
  pid uuid;
  receipt uuid;
  v public.players;
begin
  insert into public.players(telegram_id,photoword_id,coins)
  values(t,'AD-FULL-REGRESSION-'||gen_random_uuid(),100) returning id into pid;
  insert into public.challenge_profiles(player_id,limited_energy,energy_ref_at)
  values(pid,4,now()-interval '31 minutes');
  insert into public.ad_reward_claims(player_id,status,reward_kind,reward_coins,reward_energy)
  values(pid,'confirmed','energy',0,1) returning nonce into receipt;
  v:=public.claim_ad_reward_server(t,receipt);
  if v.coins<>105 then raise exception 'full energy reward was lost';end if;
  if (select limited_energy from public.challenge_profiles where player_id=pid)<>5
    then raise exception 'energy regeneration was not preserved';end if;
  if not exists(select 1 from public.ad_reward_claims
    where nonce=receipt and reward_coins=5 and reward_energy=0 and status='claimed')
    then raise exception 'fallback reward ledger mismatch';end if;
  v:=public.claim_ad_reward_server(t,receipt);
  if v.coins<>105 then raise exception 'fallback granted twice';end if;
  if (select count(*) from public.coin_transactions
    where player_id=pid and transaction_type='ad_reward')<>1
    then raise exception 'fallback has duplicate ledger transactions';end if;
end $energy_fallback$;

rollback;
