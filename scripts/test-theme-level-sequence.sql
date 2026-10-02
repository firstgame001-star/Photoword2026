-- Transactional regression check: verifies skip rejection, normal sequence,
-- duplicate idempotency, and rolls all test mutations back.
BEGIN;
DO $test$
DECLARE
  v_player bigint := 728074279;
  v_answer_1 text;
  v_answer_2 text;
  v_result public.players;
  v_before_coins integer;
  v_before_xp integer;
BEGIN
  SELECT coins,xp INTO v_before_coins,v_before_xp
    FROM public.players WHERE telegram_id=v_player;

  SELECT ru INTO v_answer_1 FROM public.theme_level_answers
    WHERE theme_id='sport' AND level_id=1;
  SELECT ru INTO v_answer_2 FROM public.theme_level_answers
    WHERE theme_id='sport' AND level_id=2;

  BEGIN
    PERFORM public.complete_theme_level_server(v_player,'sport',2,'ru',v_answer_2,15,10);
    RAISE EXCEPTION 'expected_theme_level_locked';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM <> 'theme_level_locked' THEN RAISE; END IF;
  END;

  v_result := public.complete_theme_level_server(v_player,'sport',1,'ru',v_answer_1,15,10);
  IF v_result.coins <> v_before_coins+15 OR v_result.xp <> v_before_xp+10 THEN
    RAISE EXCEPTION 'level_1_reward_mismatch';
  END IF;

  v_result := public.complete_theme_level_server(v_player,'sport',2,'ru',v_answer_2,15,10);
  IF v_result.coins <> v_before_coins+30 OR v_result.xp <> v_before_xp+20 THEN
    RAISE EXCEPTION 'level_2_reward_mismatch';
  END IF;

  v_result := public.complete_theme_level_server(v_player,'sport',2,'ru',v_answer_2,15,10);
  IF v_result.coins <> v_before_coins+30 OR v_result.xp <> v_before_xp+20 THEN
    RAISE EXCEPTION 'duplicate_rewarded';
  END IF;
END
$test$;
ROLLBACK;
