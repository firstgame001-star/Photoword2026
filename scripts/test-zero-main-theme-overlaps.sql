-- Private server regression: NO correct answer keys appear in this file.
-- Run after the 139-level server rotation, using a privileged database role.
DO $audit$
DECLARE n integer; across integer; intra integer; progress_count integer;
BEGIN
 SELECT count(*) INTO n FROM public.theme_level_answers;
 IF n<>1200 THEN RAISE EXCEPTION 'Expected 1200 thematic levels, got %',n; END IF;
 SELECT count(*) INTO across
 FROM public.theme_level_answers t
 JOIN public.main_level_answers m
  ON t.ru=m.ru OR t.en=m.en OR t.az=m.az;
 IF across<>0 THEN RAISE EXCEPTION 'Thematic vs main duplicate answers: %',across; END IF;
 SELECT count(*) INTO intra
 FROM public.theme_level_answers a JOIN public.theme_level_answers b
 ON (a.theme_id,a.level_id)<(b.theme_id,b.level_id)
  AND (a.ru=b.ru OR a.en=b.en OR a.az=b.az);
 IF intra<>0 THEN RAISE EXCEPTION 'Thematic internal duplicate answers: %',intra; END IF;
 RAISE NOTICE 'PASS: zero overlapping thematic answers vs main and across 12 themes, all RU EN AZ';
END
$audit$;
