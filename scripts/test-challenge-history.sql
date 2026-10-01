begin;
do $$
declare a uuid;b uuid;r uuid;s uuid;t uuid;x integer[];y integer[];z integer[];i integer;cycle_no integer;
begin
 insert into public.players(telegram_id,photoword_id,completed_levels) values(-911160001,'TEST_HISTORY_'||gen_random_uuid(),530) returning id into a;
 insert into public.players(telegram_id,photoword_id) values(-911160002,'TEST_HISTORY_'||gen_random_uuid()) returning id into b;
 insert into public.challenge_runs(player_id,mode) values(a,'limited') returning id into r;
 insert into public.challenge_runs(player_id,mode) values(a,'nohint') returning id into s;
 insert into public.challenge_runs(player_id,mode) values(a,'blitz') returning id into t;
 x:=public.reserve_challenge_questions(-911160001,r,'limited',array[300,301,-1,999]);
 y:=public.reserve_challenge_questions(-911160001,s,'nohint',array[0,1,2]);
 z:=public.reserve_challenge_questions(-911160001,t,'blitz');
 if cardinality(x)<>10 or cardinality(y)<>10 or cardinality(z)<>10 or x&&y or x&&z or y&&z then raise exception 'shared history failure';end if;
 if x&&array[300,301] then raise exception 'seed ignored';end if;
 if exists(select 1 from public.challenge_question_catalog where question_id=any(x||y||z) and cardinality(main_ids)>0) then raise exception 'completed main exclusion failed';end if;
 begin perform public.reserve_challenge_questions(-911160002,r,'limited');raise exception 'unauthorized run accepted';exception when others then if sqlerrm<>'run_not_found' then raise;end if;end;
 update public.challenge_question_history set seen=array(select generate_series(0,399)) where player_id=a;
 x:=public.reserve_challenge_questions(-911160001,t,'blitz');
 select cycle into cycle_no from public.challenge_question_history where player_id=a;
 if cardinality(x)<>10 or cycle_no<>2 then raise exception 'cycle reset failed';end if;
 perform public.reset_game_progress_server(-911160001);
 if exists(select 1 from public.challenge_question_history where player_id=a and cardinality(seen)>0) then raise exception 'reset failed';end if;
 if has_table_privilege('anon','public.challenge_question_history','SELECT') or has_function_privilege('authenticated','public.reserve_challenge_questions(bigint,uuid,text,integer[])','EXECUTE') then raise exception 'acl failure';end if;
end $$;
rollback;
