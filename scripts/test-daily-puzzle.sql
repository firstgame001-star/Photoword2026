begin;
do $$
declare a uuid;b uuid;d date;idx integer;q public.daily_puzzle_questions;r jsonb;s jsonb;first_request uuid:=gen_random_uuid();i integer;
begin
 if public.daily_puzzle_day('2026-10-01 19:59:59+00')<>date '2026-10-01' or public.daily_puzzle_day('2026-10-01 20:00:00+00')<>date '2026-10-02' then raise exception 'Saratov midnight incorrect';end if;
 if (select count(distinct public.daily_puzzle_index(date '2026-10-02'+n)) from generate_series(0,364) n)<>365 or public.daily_puzzle_index(date '2027-10-02')<>1 then raise exception '365 day schedule repeats';end if;
 if (select count(*) from public.daily_puzzle_questions)<>365 then raise exception 'bank incomplete';end if;
 insert into public.players(telegram_id,photoword_id,coins) values(-911200001,'DAILY_A_'||gen_random_uuid(),1000) returning id into a;
 insert into public.players(telegram_id,photoword_id,coins) values(-911200002,'DAILY_B_'||gen_random_uuid(),1000) returning id into b;
 d:=public.daily_puzzle_day(clock_timestamp());idx:=public.daily_puzzle_index(d);select * into q from public.daily_puzzle_questions where id=idx;
 insert into public.daily_puzzle_progress(player_id,puzzle_day,question_id,attempts) values(a,d-1,public.daily_puzzle_index(d-1),3);
 s:=public.daily_puzzle_state(-911200001,'ru');if (s->>'attempts_left')::integer<>3 or s?'answer' or s?'ru' then raise exception 'bad initial state';end if;
 begin perform public.daily_puzzle_answer(-911200001,d-1,'ru',q.ru,gen_random_uuid());raise exception 'stale day accepted';exception when others then if sqlerrm<>'daily_changed' then raise;end if;end;
 begin perform public.daily_puzzle_answer(-911200001,d,'ru','',gen_random_uuid());raise exception 'incomplete answer accepted';exception when others then if sqlerrm<>'bad_answer' then raise;end if;end;
 r:=public.daily_puzzle_answer(-911200001,d,'ru',repeat('X',char_length(q.ru)),first_request);
 if (r->>'correct')::boolean then raise exception 'wrong answer accepted';end if;
 r:=public.daily_puzzle_answer(-911200001,d,'ru',repeat('X',char_length(q.ru)),first_request);
 if not(r->>'duplicate')::boolean or (public.daily_puzzle_state(-911200001,'en')->>'attempts_left')::integer<>2 then raise exception 'retry consumed another attempt';end if;
 for i in 1..2 loop perform public.daily_puzzle_answer(-911200001,d,'en',repeat('X',char_length(q.en)),gen_random_uuid());end loop;
 s:=public.daily_puzzle_state(-911200001,'az');if not(s->>'closed')::boolean or (s->>'attempts_left')::integer<>0 then raise exception 'three failures did not close';end if;
 begin perform public.daily_puzzle_answer(-911200001,d,'ru',q.ru,gen_random_uuid());raise exception 'fourth attempt accepted';exception when others then if sqlerrm<>'daily_closed' then raise;end if;end;
 perform public.reset_game_progress_server(-911200001);
 if (public.daily_puzzle_state(-911200001,'ru')->>'attempts_left')::integer<>3 then raise exception 'full reset did not clear daily progress';end if;
 -- Third attempt can win; shared attempts across all languages.
 perform public.daily_puzzle_answer(-911200002,d,'ru',repeat('X',char_length(q.ru)),gen_random_uuid());
 perform public.daily_puzzle_answer(-911200002,d,'az',repeat('X',char_length(q.az)),gen_random_uuid());
 first_request:=gen_random_uuid();r:=public.daily_puzzle_answer(-911200002,d,'en',q.en,first_request);
 if not(r->>'correct')::boolean or (r->>'reward_coins')::integer<>25 then raise exception 'third attempt did not win';end if;
 perform public.daily_puzzle_answer(-911200002,d,'en',q.en,first_request);
 s:=public.daily_puzzle_state(-911200002,'ru');
 if not(s->>'solved')::boolean or not(s->>'closed')::boolean or (s->>'attempts_left')::integer<>0 then raise exception 'win state incorrect';end if;
 if (select coins from public.players where id=b)<>1025 or (select xp from public.players where id=b)<>0 or (select coins from public.players where id=a)<>250 then raise exception 'reward duplicate or unwanted XP';end if;
 if (select count(*) from public.coin_transactions where player_id=b and transaction_type='daily_puzzle_reward')<>1 then raise exception 'ledger duplicate';end if;
 if has_table_privilege('anon','public.daily_puzzle_questions','SELECT') or has_function_privilege('authenticated','public.daily_puzzle_answer(bigint,date,text,text,uuid)','EXECUTE') then raise exception 'daily permissions public';end if;
end $$;
rollback;
