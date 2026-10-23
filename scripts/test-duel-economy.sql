-- Rollback-only test. Does not change real PhotoWord players or accounts.
BEGIN;
DO $audit$
DECLARE a public.players;b public.players; c public.players; duel_code text; duel_id uuid;
 stake integer; prior_a integer;prior_b integer;expected integer;n integer;
BEGIN
 INSERT INTO public.players(telegram_id,photoword_id,coins) VALUES(-911164301,'DUEL_ECON_TEST_A_'||gen_random_uuid(),3000) RETURNING * INTO a;
 INSERT INTO public.players(telegram_id,photoword_id,coins) VALUES(-911164302,'DUEL_ECON_TEST_B_'||gen_random_uuid(),3000) RETURNING * INTO b;
 INSERT INTO public.players(telegram_id,photoword_id,coins) VALUES(-911164303,'DUEL_ECON_TEST_C_'||gen_random_uuid(),25) RETURNING * INTO c;

 -- A normal winner receives 90% of the combined pot, exactly once.
 FOREACH stake IN ARRAY ARRAY[25,50,75,100,500] LOOP
  SELECT coins INTO prior_a FROM public.players WHERE id=a.id;
  SELECT coins INTO prior_b FROM public.players WHERE id=b.id;
  duel_code:=public.duel_create(-911164301,stake,'ru');
  PERFORM public.duel_join(-911164302,duel_code);
  SELECT m.id INTO duel_id FROM public.duel_matches m WHERE m.code=duel_code;
  UPDATE public.duel_matches SET creator_score=7,opponent_score=2,starts_at=clock_timestamp()-interval '65 seconds',ends_at=clock_timestamp()-interval '1 second' WHERE id=duel_id;
  PERFORM public.duel_settle_one(duel_id);PERFORM public.duel_settle_one(duel_id);
  expected:=stake*9/5;
  IF (SELECT coins FROM public.players WHERE id=a.id)<>prior_a-stake+expected
   OR (SELECT coins FROM public.players WHERE id=b.id)<>prior_b-stake
   OR (SELECT payout FROM public.duel_matches WHERE id=duel_id)<>expected
   OR (SELECT count(*) FROM public.coin_transactions WHERE reward_source_id=duel_id AND transaction_type='duel_win')<>1
  THEN RAISE EXCEPTION 'incorrect payout or replay at stake %',stake;END IF;
 END LOOP;

 -- A creator may cancel a pending invite once; an outsider may not.
 SELECT coins INTO prior_a FROM public.players WHERE id=a.id;
 duel_code:=public.duel_create(-911164301,25,'ru');
 SELECT m.id INTO duel_id FROM public.duel_matches m WHERE m.code=duel_code;
 BEGIN PERFORM public.duel_cancel(-911164303,duel_code);RAISE EXCEPTION 'outsider cancelled a duel';
 EXCEPTION WHEN OTHERS THEN IF sqlerrm<>'duel_cannot_cancel' THEN RAISE;END IF;END;
 PERFORM public.duel_cancel(-911164301,duel_code);
 BEGIN PERFORM public.duel_cancel(-911164301,duel_code);RAISE EXCEPTION 'cancelled twice';
 EXCEPTION WHEN OTHERS THEN IF sqlerrm<>'duel_cannot_cancel' THEN RAISE;END IF;END;
 IF (SELECT coins FROM public.players WHERE id=a.id)<>prior_a
 OR (SELECT count(*) FROM public.coin_transactions WHERE reward_source_id=duel_id AND transaction_type='duel_refund')<>1
 THEN RAISE EXCEPTION 'cancel refund failed';END IF;

 -- Expiring invites refund once.
 SELECT coins INTO prior_a FROM public.players WHERE id=a.id;
 duel_code:=public.duel_create(-911164301,25,'ru');
 SELECT m.id INTO duel_id FROM public.duel_matches m WHERE m.code=duel_code;
 UPDATE public.duel_matches SET expires_at=clock_timestamp()-interval '1 second' WHERE id=duel_id;
 PERFORM public.duel_settle_one(duel_id);PERFORM public.duel_settle_one(duel_id);
 IF (SELECT coins FROM public.players WHERE id=a.id)<>prior_a
 OR (SELECT count(*) FROM public.coin_transactions WHERE reward_source_id=duel_id AND transaction_type='duel_refund')<>1
 THEN RAISE EXCEPTION 'expired invite refund failed';END IF;

 -- On draws both deposits are returned; no fees.
 SELECT coins INTO prior_a FROM public.players WHERE id=a.id;
 SELECT coins INTO prior_b FROM public.players WHERE id=b.id;
 duel_code:=public.duel_create(-911164301,100,'ru');PERFORM public.duel_join(-911164302,duel_code);
 SELECT m.id INTO duel_id FROM public.duel_matches m WHERE m.code=duel_code;
 UPDATE public.duel_matches SET creator_score=6,opponent_score=6,starts_at=clock_timestamp()-interval '65 seconds',ends_at=clock_timestamp()-interval '1 second' WHERE id=duel_id;
 PERFORM public.duel_settle_one(duel_id);PERFORM public.duel_settle_one(duel_id);
 IF (SELECT coins FROM public.players WHERE id=a.id)<>prior_a
 OR (SELECT coins FROM public.players WHERE id=b.id)<>prior_b
 OR (SELECT count(*) FROM public.coin_transactions WHERE reward_source_id=duel_id AND transaction_type='duel_refund')<>2
 OR (SELECT payout FROM public.duel_matches WHERE id=duel_id)<>0 THEN RAISE EXCEPTION 'draw refund failed';END IF;

 -- A flagged would-be winner cannot take the pot; both stakes return.
 SELECT coins INTO prior_a FROM public.players WHERE id=a.id;
 SELECT coins INTO prior_b FROM public.players WHERE id=b.id;
 duel_code:=public.duel_create(-911164301,25,'ru');PERFORM public.duel_join(-911164302,duel_code);
 SELECT m.id INTO duel_id FROM public.duel_matches m WHERE m.code=duel_code;
 UPDATE public.duel_matches SET creator_score=9,opponent_score=2,starts_at=clock_timestamp()-interval '65 seconds',ends_at=clock_timestamp()-interval '1 second' WHERE id=duel_id;
 INSERT INTO public.duel_anti_cheat_flags(match_id,player_id,event_type,details) VALUES(duel_id,a.id,'superhuman_correct_sequence','{}'::jsonb);
 PERFORM public.duel_settle_one(duel_id);PERFORM public.duel_settle_one(duel_id);
 IF (SELECT status FROM public.duel_matches WHERE id=duel_id)<>'cancelled'
 OR (SELECT payout FROM public.duel_matches WHERE id=duel_id)<>0
 OR (SELECT coins FROM public.players WHERE id=a.id)<>prior_a
 OR (SELECT coins FROM public.players WHERE id=b.id)<>prior_b
 OR (SELECT count(*) FROM public.coin_transactions WHERE reward_source_id=duel_id AND transaction_type='duel_refund')<>2
 THEN RAISE EXCEPTION 'flagged winner credited';END IF;

 -- If only the losing player is flagged, the legitimate opponent is paid.
 SELECT coins INTO prior_a FROM public.players WHERE id=a.id;
 SELECT coins INTO prior_b FROM public.players WHERE id=b.id;
 duel_code:=public.duel_create(-911164301,25,'ru');PERFORM public.duel_join(-911164302,duel_code);
 SELECT m.id INTO duel_id FROM public.duel_matches m WHERE m.code=duel_code;
 UPDATE public.duel_matches SET creator_score=2,opponent_score=9,starts_at=clock_timestamp()-interval '65 seconds',ends_at=clock_timestamp()-interval '1 second' WHERE id=duel_id;
 INSERT INTO public.duel_anti_cheat_flags(match_id,player_id,event_type,details) VALUES(duel_id,a.id,'excessive_wrong_answers','{}'::jsonb);
 PERFORM public.duel_settle_one(duel_id);PERFORM public.duel_settle_one(duel_id);
 IF (SELECT status FROM public.duel_matches WHERE id=duel_id)<>'finished'
 OR (SELECT payout FROM public.duel_matches WHERE id=duel_id)<>45
 OR (SELECT coins FROM public.players WHERE id=a.id)<>prior_a-25
 OR (SELECT coins FROM public.players WHERE id=b.id)<>prior_b-25+45
 THEN RAISE EXCEPTION 'honest opponent payout blocked';END IF;

 -- Invalid stakes and overdrafts cannot create matches or debit wallets.
 FOREACH stake IN ARRAY ARRAY[-25,0,24,26,501] LOOP
  BEGIN PERFORM public.duel_create(-911164303,stake,'ru');RAISE EXCEPTION 'invalid stake accepted';
  EXCEPTION WHEN OTHERS THEN IF sqlerrm<>'duel_bad_stake' THEN RAISE;END IF; END;
 END LOOP;
 BEGIN PERFORM public.duel_create(-911164303,500,'ru');RAISE EXCEPTION 'overdraft accepted';
 EXCEPTION WHEN OTHERS THEN IF sqlerrm<>'insufficient_coins' THEN RAISE;END IF; END;
 RAISE NOTICE 'PASS: five payouts, 10%% commission, single settlement, cancelled/expired/draw refunds, anti-cheat void, honest opponent, bad stakes and insufficient funds';
END $audit$;
ROLLBACK;