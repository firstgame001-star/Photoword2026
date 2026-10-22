-- Run after the matching private server answer rotation is applied.
-- This query contains no published answers and changes no player records.
DO $audit$
DECLARE v_main_collisions integer; v_internal_collisions integer; v_count integer;
BEGIN
  SELECT count(*) INTO v_count FROM public.theme_level_answers
    WHERE theme_id IN ('art','food');
  IF v_count<>200 THEN RAISE EXCEPTION 'art_food_count_wrong: %',v_count; END IF;
  SELECT count(*) INTO v_main_collisions
  FROM public.theme_level_answers t
  JOIN public.main_level_answers m
    ON (t.ru=m.ru OR t.en=m.en OR t.az=m.az)
  WHERE t.theme_id IN ('art','food');
  IF v_main_collisions<>0 THEN
    RAISE EXCEPTION 'art_food_duplicate_main_answers: %',v_main_collisions;
  END IF;
  SELECT count(*) INTO v_internal_collisions
  FROM public.theme_level_answers t
  JOIN public.theme_level_answers u ON
    (t.theme_id,t.level_id)<(u.theme_id,u.level_id)
    AND (t.ru=u.ru OR t.en=u.en OR t.az=u.az)
  WHERE t.theme_id IN ('art','food') AND u.theme_id IN ('art','food');
  IF v_internal_collisions<>0 THEN
    RAISE EXCEPTION 'art_food_cross_theme_duplicates: %',v_internal_collisions;
  END IF;
  RAISE NOTICE 'PASS: all 200 Art/Food themes unique vs 680 main levels and each other (RU/EN/AZ)';
END
$audit$;
