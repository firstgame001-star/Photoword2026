-- Rollback-only regression for the full reset cooldown.
DO $test$
DECLARE
  v_telegram bigint := -floor(extract(epoch FROM clock_timestamp())*1000000)::bigint;
  v_code text := 'SEC-RESET-'||replace(gen_random_uuid()::text,'-','');
  v_player public.players;
BEGIN
  BEGIN
    INSERT INTO public.players(telegram_id,photoword_id) VALUES(v_telegram,v_code);
    v_player:=public.reset_game_progress_server(v_telegram,0);
    IF v_player.progress_generation<>1 OR v_player.coins<>250 THEN RAISE EXCEPTION 'first_reset_mismatch'; END IF;

    BEGIN
      PERFORM public.reset_game_progress_server(v_telegram,1);
      RAISE EXCEPTION 'expected_reset_cooldown_generation';
    EXCEPTION WHEN OTHERS THEN
      IF SQLERRM<>'reset_cooldown' THEN RAISE; END IF;
    END;

    BEGIN
      PERFORM public.reset_game_progress_server(v_telegram);
      RAISE EXCEPTION 'expected_reset_cooldown_legacy_rpc';
    EXCEPTION WHEN OTHERS THEN
      IF SQLERRM<>'reset_cooldown' THEN RAISE; END IF;
    END;

    RAISE EXCEPTION 'test_rollback';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM<>'test_rollback' THEN RAISE; END IF;
  END;
END
$test$;
