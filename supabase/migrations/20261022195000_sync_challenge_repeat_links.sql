-- Refresh answer-equivalence pointers used to avoid serving a challenge
-- question if a player has already solved the corresponding main/theme level.
-- Answers remain in the server-only tables. No player balances/progress touched.
DO $audit$
DECLARE v_updated integer; v_total integer; v_drift integer;
BEGIN
 WITH expected AS (
   SELECT c.question_id,
     ARRAY(SELECT m.level_id FROM public.main_level_answers m
        WHERE m.ru=c.answer_ru OR m.en=c.answer_en OR m.az=c.answer_az
        ORDER BY m.level_id) main_ids,
     COALESCE((SELECT jsonb_object_agg(theme_id, ids)
       FROM (SELECT t.theme_id,to_jsonb(array_agg(t.level_id ORDER BY t.level_id)) ids
          FROM public.theme_level_answers t
          WHERE t.ru=c.answer_ru OR t.en=c.answer_en OR t.az=c.answer_az
          GROUP BY t.theme_id) matched),
       '{}'::jsonb) themes
   FROM public.challenge_question_answers c
 )
 UPDATE public.challenge_question_catalog catalog
 SET main_ids=expected.main_ids, themes=expected.themes
 FROM expected WHERE expected.question_id=catalog.question_id
   AND (catalog.main_ids IS DISTINCT FROM expected.main_ids
        OR catalog.themes IS DISTINCT FROM expected.themes);
 GET DIAGNOSTICS v_updated=ROW_COUNT;

 SELECT count(*) INTO v_total FROM public.challenge_question_catalog;
 IF v_total<>400 THEN RAISE EXCEPTION 'expected 400 challenge questions, got %',v_total; END IF;

 WITH expected AS (
   SELECT c.question_id,
     ARRAY(SELECT m.level_id FROM public.main_level_answers m
       WHERE m.ru=c.answer_ru OR m.en=c.answer_en OR m.az=c.answer_az
       ORDER BY m.level_id) main_ids,
     COALESCE((SELECT jsonb_object_agg(theme_id,ids)
       FROM (SELECT t.theme_id,to_jsonb(array_agg(t.level_id ORDER BY t.level_id)) ids
         FROM public.theme_level_answers t
         WHERE t.ru=c.answer_ru OR t.en=c.answer_en OR t.az=c.answer_az
         GROUP BY t.theme_id) matches),'{}'::jsonb) themes
    FROM public.challenge_question_answers c
 )
 SELECT count(*) INTO v_drift FROM public.challenge_question_catalog q JOIN expected e USING(question_id)
 WHERE q.main_ids IS DISTINCT FROM e.main_ids OR q.themes IS DISTINCT FROM e.themes;

 IF v_drift<>0 THEN RAISE EXCEPTION 'challenge question links still drift: %',v_drift; END IF;
 RAISE NOTICE 'PASS: % challenge links refreshed, 400 question mappings synchronized',v_updated;
END
$audit$;
