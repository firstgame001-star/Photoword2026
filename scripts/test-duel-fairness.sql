-- Database regression of PhotoWord duel fairness. Always ROLLBACK.
BEGIN;
DO $reg$
DECLARE a public.players;b public.players;code_ text;match_ uuid;qids integer[];ans text;stat jsonb;
BEGIN
 insert into public.players(telegram_id,photoword_id,coins) values(-911165671,'FAIR_DUEL_A_'||gen_random_uuid(),1500) returning * into a;
 insert into public.players(telegram_id,photoword_id,coins) values(-911165672,'FAIR_DUEL_B_'||gen_random_uuid(),1500) returning * into b;
 -- Five fast correct answers: record monitoring flag, allow legitimate win.
 code_:=public.duel_create(-911165671,25,'ru');perform public.duel_join(-911165672,code_);
 select m.id,m.question_ids into match_,qids from public.duel_matches m where m.code=code_;
 update public.duel_matches set starts_at=clock_timestamp()-interval '45 seconds',ends_at=clock_timestamp()+interval '40 seconds',creator_index=4,creator_score=4 where id=match_;
 insert into public.duel_answer_attempts(match_id,player_id,question_index,is_correct,created_at)
 select match_,a.id,i,true,clock_timestamp()-((5-i)*interval '1 second') from generate_series(0,3) i;
 select answer_ru into ans from public.duel_questions where id=qids[5];
 if not public.duel_submit(-911165671,code_,ans) then raise exception 'fifth correct answer rejected';end if;
 if not exists(select 1 from public.duel_anti_cheat_flags f where f.match_id=match_ and f.player_id=a.id and f.event_type='fast_correct_sequence')
  then raise exception 'fast-correct monitoring signal missing';end if;
 update public.duel_matches set ends_at=clock_timestamp()-interval '1 second' where id=match_;
 perform public.duel_settle_one(match_);perform public.duel_settle_one(match_);
 if (select coins from public.players where id=a.id)<>1520 or (select status from public.duel_matches where id=match_)<>'finished'
  then raise exception 'honest fast winner not paid';end if;
 stat:=public.achievement_metrics(a.id);
 if (stat->>'duel_wins')::int<>1 then raise exception 'honest fast winner lost achievement';end if;
 -- Ten correct answers in under 12 seconds: severe anomaly, void without fine.
 code_:=public.duel_create(-911165671,25,'ru');perform public.duel_join(-911165672,code_);
 select m.id,m.question_ids into match_,qids from public.duel_matches m where m.code=code_;
 update public.duel_matches set starts_at=clock_timestamp()-interval '45 seconds',ends_at=clock_timestamp()+interval '40 seconds',creator_index=9,creator_score=9 where id=match_;
 insert into public.duel_answer_attempts(match_id,player_id,question_index,is_correct,created_at)
 select match_,a.id,i,true,clock_timestamp()-((10-i)*interval '1 second') from generate_series(0,8) i;
 select answer_ru into ans from public.duel_questions where id=qids[10];
 if not public.duel_submit(-911165671,code_,ans) then raise exception 'tenth correct answer rejected';end if;
 if not exists(select 1 from public.duel_anti_cheat_flags f where f.match_id=match_ and f.player_id=a.id and f.event_type='superhuman_correct_sequence')
  then raise exception 'high-confidence signal missing';end if;
 update public.duel_matches set ends_at=clock_timestamp()-interval '1 second' where id=match_;
 perform public.duel_settle_one(match_);perform public.duel_settle_one(match_);
 if (select coins from public.players where id=a.id)<>1520 or (select status from public.duel_matches where id=match_)<>'cancelled' or (select payout from public.duel_matches where id=match_)<>0
  then raise exception 'extreme-speed win improperly paid';end if;
 if (select count(*) from public.coin_transactions where reward_source_id=match_ and transaction_type='duel_refund')<>2
  then raise exception 'high-confidence invalidation did not refund both stakes';end if;
 stat:=public.achievement_metrics(a.id);
 if (stat->>'duel_wins')::int<>1 then raise exception 'extreme speed affected prior legitimate achievement';end if;
END $reg$;
ROLLBACK;