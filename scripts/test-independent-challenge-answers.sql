-- Server-only regression after applying the 40-puzzle rotation.
-- Contains question IDs, no correct answers.
DO $audit$
DECLARE v_count integer; v_duplicates integer; v_mapping_errors integer;
BEGIN
 SELECT count(*) INTO v_count FROM public.challenge_question_answers
 WHERE question_id BETWEEN 350 AND 369 OR question_id BETWEEN 380 AND 399;
 IF v_count<>40 THEN RAISE EXCEPTION 'challenge 40 puzzle subset incomplete'; END IF;
 SELECT count(*) INTO v_duplicates FROM public.challenge_question_answers c
 WHERE (c.question_id BETWEEN 350 AND 369 OR c.question_id BETWEEN 380 AND 399)
 AND (EXISTS(SELECT 1 FROM public.main_level_answers m WHERE
    m.ru=c.answer_ru OR m.en=c.answer_en OR m.az=c.answer_az)
 OR EXISTS(SELECT 1 FROM public.theme_level_answers t WHERE
    t.ru=c.answer_ru OR t.en=c.answer_en OR t.az=c.answer_az)
 OR EXISTS(SELECT 1 FROM public.daily_puzzle_questions d WHERE
    d.ru=c.answer_ru OR d.en=c.answer_en OR d.az=c.answer_az));
 IF v_duplicates<>0 THEN RAISE EXCEPTION 'curated challenge answers repeat other modes: %',v_duplicates; END IF;
 SELECT count(*) INTO v_mapping_errors
 FROM public.challenge_question_catalog q
 WHERE (q.question_id BETWEEN 350 AND 369 OR q.question_id BETWEEN 380 AND 399)
 AND (cardinality(q.main_ids)>0 OR q.themes<>'{}'::jsonb);
 IF v_mapping_errors<>0 THEN RAISE EXCEPTION 'old challenge repeat pointers remain: %',v_mapping_errors; END IF;
 IF (SELECT count(*) FROM public.challenge_question_answers)<>400 THEN RAISE EXCEPTION 'challenge bank no longer 400'; END IF;
 RAISE NOTICE 'PASS: 40 new challenge puzzles independent of main, all 12 themes and daily; private answer bank complete';
END
$audit$;