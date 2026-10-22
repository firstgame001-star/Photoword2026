-- Do not serve known main/theme answer overlaps in new challenge runs.
-- Existing reserved questions in unfinished runs remain readable and unchanged.
CREATE OR REPLACE FUNCTION public.reserve_challenge_questions(p_telegram_id bigint, p_run_id uuid, p_mode text, p_initial_seen integer[] DEFAULT '{}'::integer[])
 RETURNS integer[]
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v public.players; h public.challenge_question_history; eligible integer[]; fresh integer[]; chosen integer[]; inserted integer; v_run public.challenge_runs;
begin
 select * into v from public.players where telegram_id=p_telegram_id for update;
 if v.id is null then raise exception 'player_not_found'; end if;
 select * into v_run from public.challenge_runs where id=p_run_id and player_id=v.id and mode=p_mode and finished_at is null for update;
 if v_run.id is null then raise exception 'run_not_found'; end if;
 insert into public.challenge_question_history(player_id) values(v.id) on conflict do nothing;
 get diagnostics inserted=row_count;
 select * into h from public.challenge_question_history where player_id=v.id for update;
 if inserted=1 then
  select coalesce(array_agg(distinct x),'{}'::integer[]) into h.seen from unnest(p_initial_seen) x where x between 0 and 399;
 end if;
 select array_agg(c.question_id order by c.question_id) into eligible
 from public.challenge_question_catalog c
 where cardinality(c.main_ids)=0 and c.themes='{}'::jsonb;
 if coalesce(cardinality(eligible),0)=0 then raise exception 'no_independent_challenge_questions'; end if;
 select array_agg(n) into fresh from unnest(eligible) n where not(n=any(h.seen));
 if coalesce(cardinality(fresh),0)=0 then h.seen:='{}';h.cycle:=h.cycle+1;fresh:=eligible;end if;
 select array_agg(n) into chosen from (select n from unnest(fresh) n order by (n is not distinct from h.last_question),random() limit 10) q;
 update public.challenge_question_history set seen=h.seen||chosen,last_question=chosen[cardinality(chosen)],cycle=h.cycle,updated_at=now() where player_id=v.id;
 insert into public.challenge_run_questions(run_id,seq,question_id)
 select p_run_id,coalesce((select max(seq)+1 from public.challenge_run_questions where run_id=p_run_id),0)+ord-1,qid
 from unnest(chosen) with ordinality as x(qid,ord);
 return chosen;
end $function$

