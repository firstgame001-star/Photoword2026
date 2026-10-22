-- PhotoWord reward idempotency across a full progress reset.
-- Safe to run on production: synthetic player and all test rows are rolled back
-- using a nested PL/pgSQL exception subtransaction. Does NOT modify real players.
-- Parallel multi-session requests require a separate live concurrency test.
DO $test$
DECLARE
  v_telegram bigint := -floor(extract(epoch FROM clock_timestamp())*1000000)::bigint;
  v_player_id uuid;
  v_profile public.players;
  v_i integer;
  v_payouts integer;
BEGIN
  BEGIN
    INSERT INTO public.players(telegram_id,photoword_id)
      VALUES(v_telegram,'TEST-REWARD-EPOCH-'||replace(gen_random_uuid()::text,'-',''))
      RETURNING id INTO v_player_id;

    IF (SELECT coins FROM public.players WHERE id=v_player_id)<>250 THEN
      RAISE EXCEPTION 'new player must start with 250 coins';
    END IF;

    -- First completion rewards once; 20 replays are idempotent.
    v_profile:=public.complete_level_server(v_telegram,1,20,15);
    FOR v_i IN 1..20 LOOP
      v_profile:=public.complete_level_server(v_telegram,1,20,15);
    END LOOP;
    IF v_profile.coins<>270 OR v_profile.xp<>15 OR
       v_profile.completed_levels<>1 OR v_profile.progress_generation<>0 THEN
      RAISE EXCEPTION 'duplicate level completion rewarded before reset';
    END IF;
    SELECT count(*) INTO v_payouts FROM public.coin_transactions
      WHERE player_id=v_player_id AND transaction_type='level_reward' AND description='Level 1';
    IF v_payouts<>1 THEN RAISE EXCEPTION 'expected exactly one payout before reset, got %',v_payouts; END IF;

    -- Locked levels and forged payout parameters must fail.
    BEGIN
      PERFORM public.complete_level_server(v_telegram,3,20,15);
      RAISE EXCEPTION 'locked level accepted';
    EXCEPTION WHEN OTHERS THEN
      IF SQLERRM<>'level_locked' THEN RAISE; END IF;
    END;
    BEGIN
      PERFORM public.complete_level_server(v_telegram,1,20000,15);
      RAISE EXCEPTION 'forged reward accepted';
    EXCEPTION WHEN OTHERS THEN
      IF SQLERRM<>'invalid_level_or_reward' THEN RAISE; END IF;
    END;

    -- Full reset begins a NEW reward epoch and removes saved progress.
    v_profile:=public.reset_game_progress_server(v_telegram,0);
    IF v_profile.coins<>250 OR v_profile.xp<>0 OR v_profile.completed_levels<>0
       OR v_profile.current_level<>1 OR v_profile.progress_generation<>1 THEN
      RAISE EXCEPTION 'full reset did not restore new-player state';
    END IF;
    IF EXISTS(SELECT 1 FROM public.level_progress WHERE player_id=v_player_id) THEN
      RAISE EXCEPTION 'old level progress survived reset';
    END IF;

    -- Same level can now award again ONCE; additional 20 replays do not award.
    v_profile:=public.complete_level_server(v_telegram,1,20,15);
    FOR v_i IN 1..20 LOOP
      v_profile:=public.complete_level_server(v_telegram,1,20,15);
    END LOOP;
    IF v_profile.coins<>270 OR v_profile.xp<>15 OR
       v_profile.completed_levels<>1 OR v_profile.progress_generation<>1 THEN
      RAISE EXCEPTION 'level reward epoch after reset incorrect';
    END IF;
    SELECT count(*) INTO v_payouts FROM public.coin_transactions
      WHERE player_id=v_player_id AND transaction_type='level_reward' AND description='Level 1';
    IF v_payouts<>2 THEN
      RAISE EXCEPTION 'expected one payout in each reward epoch (2 total), got %',v_payouts;
    END IF;
    IF (SELECT count(*) FROM public.coin_transactions
        WHERE player_id=v_player_id AND transaction_type='game_reset')<>1 THEN
      RAISE EXCEPTION 'expected exactly one full reset transaction';
    END IF;

    -- A delayed duplicate reset carrying generation 0 MUST NOT erase new progress.
    v_profile:=public.reset_game_progress_server(v_telegram,0);
    IF v_profile.progress_generation<>1 OR v_profile.coins<>270 OR
       v_profile.xp<>15 OR v_profile.completed_levels<>1 THEN
      RAISE EXCEPTION 'stale reset erased subsequent progress';
    END IF;
    IF (SELECT count(*) FROM public.level_progress
        WHERE player_id=v_player_id AND level_id=1 AND completed)<>1 THEN
      RAISE EXCEPTION 'stale reset removed post-reset level';
    END IF;

    -- Only trusted server roles may execute economy-changing RPCs.
    IF has_function_privilege('anon',
       'public.complete_level_server(bigint,integer,integer,integer)','EXECUTE')
       OR has_function_privilege('authenticated',
       'public.complete_level_server(bigint,integer,integer,integer)','EXECUTE')
       OR has_function_privilege('anon',
       'public.reset_game_progress_server(bigint,integer)','EXECUTE') THEN
      RAISE EXCEPTION 'sensitive economy RPC exposed to clients';
    END IF;

    RAISE EXCEPTION '__test_rollback__';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM <> '__test_rollback__' THEN RAISE; END IF;
  END;
  RAISE NOTICE 'PASS: one payout per epoch, replays idempotent, reset reopens level, stale reset ignored, no persistent test rows';
END
$test$;
