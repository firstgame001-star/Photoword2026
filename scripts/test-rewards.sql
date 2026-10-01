begin;
do $$
declare a uuid;b uuid;r uuid;v jsonb;expected text;mode text;i integer;
begin
 insert into public.players(telegram_id,photoword_id,coins) values(-911190001,'REWARD_A_'||gen_random_uuid(),1000) returning id into a;
 insert into public.players(telegram_id,photoword_id,coins) values(-911190002,'REWARD_B_'||gen_random_uuid(),1000) returning id into b;
 insert into public.challenge_profiles(player_id) values(a);
 perform public.complete_level_server(-911190001,1);perform public.complete_level_server(-911190001,1);
 if (select coins from public.players where id=a)<>1020 or (select xp from public.players where id=a)<>15 then raise exception 'main duplicate reward';end if;
 begin perform public.complete_level_server(-911190001,3);raise exception 'locked reward accepted';exception when others then if sqlerrm<>'level_locked' then raise;end if;end;
 begin perform public.complete_level_server(-911190001,2,999,999);raise exception 'custom reward accepted';exception when others then if sqlerrm<>'invalid_level_or_reward' then raise;end if;end;
 select ru into expected from public.theme_level_answers where theme_id='food' and level_id=1;
 perform public.complete_theme_level_server(-911190001,'food',1,'ru',expected);
 select en into expected from public.theme_level_answers where theme_id='food' and level_id=1;
 perform public.complete_theme_level_server(-911190001,'food',1,'en',expected);
 if (select coins from public.players where id=a)<>1035 or (select xp from public.players where id=a)<>25 then raise exception 'theme replay/change-language duplicate';end if;
 begin perform public.complete_theme_level_server(-911190001,'food',2,'ru','WRONG');raise exception 'wrong answer rewarded';exception when others then if sqlerrm<>'wrong_answer' then raise;end if;end;
 perform public.claim_daily_reward_server(-911190001);
 begin perform public.claim_daily_reward_server(-911190001);raise exception 'daily paid twice';exception when others then if sqlerrm<>'daily_claimed' then raise;end if;end;
 foreach mode in array array['limited','nohint','blitz'] loop
  for i in 1..4 loop
   insert into public.challenge_runs(player_id,mode,started_at) values(a,mode,now()-interval '1 minute') returning id into r;
   v:=public.finish_challenge_run_server(-911190001,r,mode,12,12);
   if (v->>'reward_coins')::integer<>(case when i<=3 then 15 else 0 end) or (v->>'reward_xp')::integer<>(case when i<=3 then 10 else 0 end) then raise exception 'daily mode limit failed: % %',mode,i;end if;
   v:=public.finish_challenge_run_server(-911190001,r,mode,100,100);
   if not(v->>'duplicate')::boolean then raise exception 'retry not recognized';end if;
  end loop;
 end loop;
 if (select coins from public.players where id=a)<>1175 or (select xp from public.players where id=a)<>115 then raise exception 'challenge replay duplicate credit';end if;
 if (select count(*) from public.coin_transactions where player_id=a and transaction_type='challenge_reward')<>9 then raise exception 'challenge ledger duplicated';end if;
 insert into public.challenge_runs(player_id,mode) values(b,'limited') returning id into r;
 begin perform public.finish_challenge_run_server(-911190001,r,'limited',10,10);raise exception 'foreign run rewarded';exception when others then if sqlerrm<>'run_not_found' then raise;end if;end;
 v:=public.finish_challenge_run_server(-911190002,r,'limited',10,10);
 if (v->>'reward_coins')::integer<>0 then raise exception 'instant run rewarded';end if;
 if (select coins from public.players where id=b)<>1000 then raise exception 'foreign/instant run balance changed';end if;
end $$;
rollback;
