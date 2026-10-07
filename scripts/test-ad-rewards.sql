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
rollback;
