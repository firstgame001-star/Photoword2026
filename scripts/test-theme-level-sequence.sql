-- Run against a disposable Supabase database or SQL editor.
-- The inner block always raises test_rollback after assertions so all fixture
-- rows and reward mutations are automatically rolled back.
DO $test$
DECLARE
  v_telegram bigint := -floor(extract(epoch FROM clock_timestamp())*1000000)::bigint;
  v_photoword_id text := 'SEC-TEST-'||replace(gen_random_uuid()::text,'-','');
  v_answer_1 text;
  v_answer_2 text;
  v_result public.players;
  v_before_coins integer;
  v_before_xp integer;
  v_rollback boolean := false;
BEGIN
  BEGIN
    INSERT INTO public.players(telegram_id,photoword_id)
      VALUES(v_telegram,v_photoword_id);

    SELECT coins,xp INTO v_before_coins,v_before_xp
      FROM public.players WHERE telegram_id=v_telegram;
    SELECT ru INTO v_answer_1 FROM public.theme_level_answers
      WHERE theme_id='sport' AND level_id=1;
    SELECT ru INTO v_answer_2 FROM public.theme_level_answers
      WHERE theme_id='sport' AND level_id=2;

    BEGIN
      PERFORM public.complete_theme_level_server(v_telegram,'sport',2,'ru',v_answer_2,15,10);
      RAISE EXCEPTION 'expected_theme_level_locked';
    EXCEPTION WHEN OTHERS THEN
      IF SQLERRM <> 'theme_level_locked' THEN RAISE; END IF;
    END;

    v_result := public.complete_theme_level_server(v_telegram,'sport',1,'ru',v_answer_1,15,10);
    IF v_result.coins <> v_before_coins+15 OR v_result.xp <> v_before_xp+10 THEN
      RAISE EXCEPTION 'level_1_reward_mismatch';
    END IF;

    v_result := public.complete_theme_level_server(v_telegram,'sport',2,'ru',v_answer_2,15,10);
    IF v_result.coins <> v_before_coins+30 OR v_result.xp <> v_before_xp+20 THEN
      RAISE EXCEPTION 'level_2_reward_mismatch';
    END IF;

    v_result := public.complete_theme_level_server(v_telegram,'sport',2,'ru',v_answer_2,15,10);
    IF v_result.coins <> v_before_coins+30 OR v_result.xp <> v_before_xp+20 THEN
      RAISE EXCEPTION 'duplicate_rewarded';
    END IF;

    RAISE EXCEPTION 'test_rollback';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM <> 'test_rollback' THEN RAISE; END IF;
    v_rollback := true;
  END;
  IF NOT v_rollback THEN RAISE EXCEPTION 'test_did_not_rollback'; END IF;
END
$test$;
