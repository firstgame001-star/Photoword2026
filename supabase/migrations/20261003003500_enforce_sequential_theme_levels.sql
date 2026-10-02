CREATE OR REPLACE FUNCTION public.complete_theme_level_server(
  p_telegram_id bigint,
  p_theme_id text,
  p_level_id integer,
  p_language text,
  p_answer text,
  p_reward_coins integer DEFAULT 15,
  p_reward_xp integer DEFAULT 10
)
RETURNS public.players
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  v public.players;
  v_expected text;
  v_inserted integer;
BEGIN
  IF p_theme_id NOT IN ('sport','art','professions','travel','science','technology','cinema','food','animals','transport','home','nature')
     OR p_level_id NOT BETWEEN 1 AND 100
     OR p_language NOT IN ('ru','en','az')
     OR p_reward_coins IS DISTINCT FROM 15
     OR p_reward_xp IS DISTINCT FROM 10 THEN
    RAISE EXCEPTION 'bad_theme_level';
  END IF;

  SELECT CASE p_language WHEN 'ru' THEN a.ru WHEN 'en' THEN a.en ELSE a.az END
    INTO v_expected
    FROM public.theme_level_answers AS a
    WHERE a.theme_id=p_theme_id AND a.level_id=p_level_id;

  IF v_expected IS NULL THEN RAISE EXCEPTION 'bad_theme_level'; END IF;
  IF trim(coalesce(p_answer,'')) IS DISTINCT FROM v_expected THEN
    RAISE EXCEPTION 'wrong_answer';
  END IF;

  SELECT * INTO v
    FROM public.players
    WHERE telegram_id=p_telegram_id
    FOR UPDATE;

  IF v.id IS NULL THEN RAISE EXCEPTION 'player_not_found'; END IF;

  -- Serialize completions on the player row, then reject first-time skips.
  -- Previously completed levels remain replayable without another reward.
  IF NOT EXISTS (
       SELECT 1 FROM public.theme_progress AS done
       WHERE done.player_id=v.id
         AND done.theme_id=p_theme_id
         AND done.level_id=p_level_id
     )
     AND EXISTS (
       SELECT 1
       FROM generate_series(1,p_level_id-1) AS required(level_id)
       WHERE NOT EXISTS (
         SELECT 1 FROM public.theme_progress AS prior
         WHERE prior.player_id=v.id
           AND prior.theme_id=p_theme_id
           AND prior.level_id=required.level_id
       )
     ) THEN
    RAISE EXCEPTION 'theme_level_locked';
  END IF;

  INSERT INTO public.theme_progress(player_id,theme_id,level_id)
    VALUES(v.id,p_theme_id,p_level_id)
    ON CONFLICT(player_id,theme_id,level_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted=0 THEN RETURN v; END IF;

  UPDATE public.players
    SET coins=coins+p_reward_coins,
        xp=xp+p_reward_xp
    WHERE id=v.id
    RETURNING * INTO v;

  INSERT INTO public.coin_transactions(player_id,amount,transaction_type,description)
    VALUES(v.id,p_reward_coins,'theme_level_reward','Theme '||p_theme_id||' level '||p_level_id);

  RETURN v;
END
$function$;
