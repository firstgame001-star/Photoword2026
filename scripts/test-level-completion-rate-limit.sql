-- Rollback-only regression for the shared main/theme completion rate limit.
DO $test$
DECLARE
  v_telegram bigint := -floor(extract(epoch FROM clock_timestamp())*1000000)::bigint;
  v_code text := 'SEC-RATE-'||replace(gen_random_uuid()::text,'-','');
  v_player public.players;
  v_answer text;
  v_coins integer;
  v_xp integer;
BEGIN
  BEGIN
    INSERT INTO public.players(telegram_id,photoword_id) VALUES(v_telegram,v_code);
    SELECT coins,xp INTO v_coins,v_xp FROM public.players WHERE telegram_id=v_telegram;

    v_player := public.complete_level_server(v_telegram,1,20,15);
    IF v_player.coins<>v_coins+20 OR v_player.xp<>v_xp+15 THEN RAISE EXCEPTION 'main_reward_mismatch'; END IF;

    SELECT ru INTO v_answer FROM public.theme_level_answers WHERE theme_id='sport' AND level_id=1;
    BEGIN
      PERFORM public.complete_theme_level_server(v_telegram,'sport',1,'ru',v_answer,15,10);
      RAISE EXCEPTION 'expected_theme_rate_limit';
    EXCEPTION WHEN OTHERS THEN
      IF SQLERRM<>'theme_level_too_fast' THEN RAISE; END IF;
    END;

    PERFORM pg_sleep(3.1);
    v_player := public.complete_theme_level_server(v_telegram,'sport',1,'ru',v_answer,15,10);
    IF v_player.coins<>v_coins+35 OR v_player.xp<>v_xp+25 THEN RAISE EXCEPTION 'theme_reward_mismatch'; END IF;

    BEGIN
      PERFORM public.complete_level_server(v_telegram,2,20,15);
      RAISE EXCEPTION 'expected_main_rate_limit';
    EXCEPTION WHEN OTHERS THEN
      IF SQLERRM<>'level_too_fast' THEN RAISE; END IF;
    END;

    v_player := public.complete_theme_level_server(v_telegram,'sport',1,'ru',v_answer,15,10);
    IF v_player.coins<>v_coins+35 OR v_player.xp<>v_xp+25 THEN RAISE EXCEPTION 'duplicate_theme_rewarded'; END IF;

    PERFORM pg_sleep(3.1);
    v_player := public.complete_level_server(v_telegram,2,20,15);
    IF v_player.coins<>v_coins+55 OR v_player.xp<>v_xp+40 THEN RAISE EXCEPTION 'second_main_reward_mismatch'; END IF;

    RAISE EXCEPTION 'test_rollback';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM<>'test_rollback' THEN RAISE; END IF;
  END;
END
$test$;
