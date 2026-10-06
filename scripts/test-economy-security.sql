begin;
do $$
declare a uuid;b uuid;t bigint:=-floor(extract(epoch from clock_timestamp())*1000000)::bigint;
 v public.players;e public.challenge_profiles;r jsonb;n uuid;k integer;answer text;before_coins integer;mode text;
begin
 insert into public.players(telegram_id,photoword_id,coins) values(t,'ECON-'||gen_random_uuid(),1000) returning id into a;
 insert into public.players(telegram_id,photoword_id,coins) values(t-1,'ECON-'||gen_random_uuid(),1000) returning id into b;
 -- Forged costs, locked levels and overdrafts.
 begin perform public.spend_hint_server(t,1,'letter',-50);raise exception 'negative hint accepted';exception when others then if sqlerrm<>'bad_hint' then raise;end if;end;
 perform public.spend_hint_server(t,1,'letter',50);
 if (select coins from public.players where id=a)<>950 then raise exception 'hint cost mismatch';end if;
 update public.players set coins=20 where id=a;
 begin perform public.spend_hint_server(t,1,'text',150);raise exception 'overdraft accepted';exception when others then if sqlerrm<>'insufficient_coins' then raise;end if;end;
 update public.players set coins=1000 where id=a;
 perform public.complete_level_server(t,1);perform public.complete_level_server(t,1);
 if (select coins from public.players where id=a)<>1020 then raise exception 'main reward duplicated';end if;
 begin perform public.complete_level_server(t,3);raise exception 'locked accepted';exception when others then if sqlerrm<>'level_locked' then raise;end if;end;
 begin perform public.complete_level_server(t,2,999,999);raise exception 'forged reward accepted';exception when others then if sqlerrm<>'invalid_level_or_reward' then raise;end if;end;
 perform public.claim_daily_reward_server(t);
 begin perform public.claim_daily_reward_server(t);raise exception 'daily duplicated';exception when others then if sqlerrm<>'daily_claimed' then raise;end if;end;
 perform public.claim_daily_task_server(t,'level_1');
 begin perform public.claim_daily_task_server(t,'level_1');raise exception 'task duplicated';exception when others then if sqlerrm<>'task_claimed' then raise;end if;end;
 begin perform public.claim_daily_task_server(t,'level_2');raise exception 'unearned task';exception when others then if sqlerrm<>'task_not_ready' then raise;end if;end;
 -- Theme language changes cannot replay a reward.
 select ru into answer from public.theme_level_answers where theme_id='food' and level_id=1;
 begin perform public.complete_theme_level_server(t,'food',1,'ru',answer);raise exception 'rate bypass';exception when others then if sqlerrm<>'theme_level_too_fast' then raise;end if;end;
 update public.level_progress set completed_at=clock_timestamp()-interval '4 seconds' where player_id=a;
 perform public.complete_theme_level_server(t,'food',1,'ru',answer);
 select en into answer from public.theme_level_answers where theme_id='food' and level_id=1;
 before_coins:=(select coins from public.players where id=a);
 perform public.complete_theme_level_server(t,'food',1,'en',answer);
 if (select coins from public.players where id=a)<>before_coins then raise exception 'theme replay rewarded';end if;
 -- Real stored scores govern rewards; client score values are ignored.
 foreach mode in array array['limited','nohint','blitz'] loop
  for k in 1..4 loop
   insert into public.challenge_runs(player_id,mode,score,best_streak,started_at) values(a,mode,12,12,clock_timestamp()-interval '1 minute') returning id into n;
   r:=public.finish_challenge_run_server(t,n,mode,999999,999999);
   if (r->>'reward_coins')::integer<>(case when k<=3 then 15 else 0 end) then raise exception 'mode daily cap mismatch';end if;
   r:=public.finish_challenge_run_server(t,n,mode,999999,999999);
   if not(r->>'duplicate')::boolean then raise exception 'finish retry failed';end if;
  end loop;
 end loop;
 insert into public.challenge_runs(player_id,mode,started_at) values(a,'blitz',clock_timestamp()-interval '1 minute') returning id into n;
 r:=public.finish_challenge_run_server(t,n,'blitz',999999,999999);
 if (r->>'reward_coins')::integer<>0 then raise exception 'forged score rewarded';end if;
 begin perform public.finish_challenge_run_server(t-1,n,'blitz',99,99);raise exception 'foreign run accepted';exception when others then if sqlerrm<>'run_not_found' then raise;end if;end;
 -- Atomic starts consume every unit, and failed starts roll back.
 for k in 1..5 loop r:=public.start_challenge_run_atomic_server(t,'limited','ru',0);end loop;
 begin perform public.start_challenge_run_atomic_server(t,'limited','ru',0);raise exception 'sixth energy accepted';exception when others then if sqlerrm<>'challenge_no_energy' then raise;end if;end;
 if (select limited_energy from public.challenge_profiles where player_id=a)<>0 then raise exception 'energy consumption mismatch';end if;
 update public.challenge_profiles set energy_ref_at=clock_timestamp()-interval '61 minutes' where player_id=a;
 e:=public.refresh_challenge_energy_server(a);
 if e.limited_energy<>2 then raise exception 'energy regen mismatch';end if;
 e:=public.refresh_challenge_energy_server(a);
 if e.limited_energy<>2 then raise exception 'regen repeated';end if;
 begin perform public.start_challenge_run_atomic_server(t,'limited','ru',99);raise exception 'stale generation';exception when others then if sqlerrm<>'progress_reset' then raise;end if;end;
 -- Purchase retry after reaching full energy is acknowledged without another grant.
 e:=public.credit_challenge_energy_purchase_server(t,'ECON-e-'||a,'pwenergy:e5:testpayload',50,5);
 e:=public.credit_challenge_energy_purchase_server(t,'ECON-e-'||a,'pwenergy:e5:testpayload',50,5);
 if e.limited_energy<>5 or (select count(*) from public.challenge_energy_purchases where player_id=a)<>1 then raise exception 'energy payment duplicate';end if;
 perform public.credit_star_purchase_server(t,'ECON-c-'||a,'pwcoins:c10:testpayload',15,10);
 before_coins:=(select coins from public.players where id=a);
 perform public.credit_star_purchase_server(t,'ECON-c-'||a,'pwcoins:c10:testpayload',15,10);
 if (select coins from public.players where id=a)<>before_coins then raise exception 'Stars repeated';end if;
 begin perform public.credit_star_purchase_server(t,'invalid','pwcoins:c10:testpayload',1,10000);raise exception 'forged package';exception when others then if sqlerrm<>'bad_star_pack' then raise;end if;end;
 -- Ad completion requires server confirmation and nonce ownership.
 insert into public.ad_reward_claims(player_id) values(a) returning nonce into n;
 begin perform public.claim_ad_reward_server(t,n);raise exception 'unconfirmed ad';exception when others then if sqlerrm<>'ad_claim_unconfirmed' then raise;end if;end;
 perform public.confirm_adsgram_reward_server(t);perform public.claim_ad_reward_server(t,n);
 begin perform public.claim_ad_reward_server(t,n);raise exception 'ad duplicate';exception when others then if sqlerrm<>'ad_claim_unconfirmed' then raise;end if;end;
 begin perform public.claim_ad_reward_server(t-1,n);raise exception 'foreign nonce';exception when others then if sqlerrm<>'ad_claim_unconfirmed' then raise;end if;end;
 insert into public.ad_reward_claims(player_id,status,prepared_at) values(a,'confirmed',now()-interval '9 minutes') returning nonce into n;
 begin perform public.claim_ad_reward_server(t,n);raise exception 'expired nonce';exception when others then if sqlerrm<>'ad_claim_expired' then raise;end if;end;
 for k in 1..9 loop insert into public.ad_reward_claims(player_id,status) values(a,'confirmed') returning nonce into n;perform public.claim_ad_reward_server(t,n);end loop;
 insert into public.ad_reward_claims(player_id,status) values(a,'confirmed') returning nonce into n;
 begin perform public.claim_ad_reward_server(t,n);raise exception 'ad cap';exception when others then if sqlerrm<>'ad_daily_limit' then raise;end if;end;
 if exists(select 1 from pg_proc p join pg_namespace ns on ns.oid=p.pronamespace where ns.nspname='public' and p.proname in ('start_challenge_run_atomic_server','refresh_challenge_energy_server','credit_star_purchase_server','spend_hint_server','claim_ad_reward_server') and (has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('authenticated',p.oid,'EXECUTE'))) then raise exception 'public economy RPC';end if;
end $$;
rollback;
