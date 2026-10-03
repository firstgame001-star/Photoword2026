-- Reduce exact answer repeats against the main bank to 20% in the three selected themes.
BEGIN;
WITH replacements(theme_id, level_id, ru, en, az) AS (VALUES
    ('science',4,'КВАРЦИТ','QUARTZITE','KVARSTİT'),
    ('science',13,'ФЕРМИОН','FERMION','FERMİON'),
    ('science',14,'НЕЙТРИНО','NEUTRINO','NEYTRİNO'),
    ('science',18,'ГЛЮОН','GLUON','QLÜON'),
    ('science',19,'БОЗОН','BOSON','BOZON'),
    ('science',32,'АФЕЛИЙ','APHELION','AFELİ'),
    ('science',33,'ПЕРИГЕЛИЙ','PERIHELION','PERİHEL'),
    ('science',36,'ЭКЗОПЛАНЕТА','EXOPLANET','EKZOPLANET'),
    ('science',38,'ПАРАЛЛАКС','PARALLAX','PARALAKS'),
    ('science',40,'ЗЕНИТ','ZENITH','ZENİT'),
    ('science',42,'НАДИР','NADIR','NADİR'),
    ('science',45,'ЛИТОСФЕРА','LITHOSPHERE','LİTOSFER'),
    ('science',48,'КРИОСФЕРА','CRYOSPHERE','KRİOSFER'),
    ('science',49,'МАНТИЯ','MANTLE','MANTİYA'),
    ('science',50,'БАЗАЛЬТ','BASALT','BAZALT'),
    ('science',54,'ГРАФИТ','GRAPHITE','QRAFİT'),
    ('science',58,'ГРАФЕН','GRAPHENE','QRAFEN'),
    ('science',59,'ТОРФ','PEAT','TORF'),
    ('science',62,'ЦИКЛОН','CYCLONE','SİKLON'),
    ('science',66,'АНТИЦИКЛОН','ANTICYCLONE','ANTİSİKLON'),
    ('science',67,'ОПОЛЗЕНЬ','LANDSLIDE','SÜRÜŞMƏ'),
    ('science',68,'БИОТОП','BIOTOPE','BİOTOP'),
    ('science',75,'МИКОРИЗА','MYCORRHIZA','MİKORİZA'),
    ('science',78,'ПОЛИП','POLYP','POLİP'),
    ('science',79,'АКСОН','AXON','AKSON'),
    ('science',82,'ДЕНДРИТ','DENDRITE','DENDRİT'),
    ('science',83,'РЕФЛЕКС','REFLEX','REFLEKS'),
    ('science',84,'ХОРДА','NOTOCHORD','XORDA'),
    ('science',85,'ГЕНОМ','GENOME','GENOM'),
    ('science',86,'ЭКЗОСКЕЛЕТ','EXOSKELETON','EKZOSKELET'),
    ('science',87,'ГЛИЦЕРИН','GLYCERIN','QLİSERİN'),
    ('science',88,'ДИСПЕРСИЯ','DISPERSION','DİSPERSİYA'),
    ('science',89,'ИНТЕРФЕРЕНЦИЯ','INTERFERENCE','İNTERFERENSİYA'),
    ('science',90,'ИНДУКЦИЯ','INDUCTION','İNDÜKSİYA'),
    ('science',94,'КОНВЕКЦИЯ','CONVECTION','KONVEKSİYA'),
    ('science',97,'АДСОРБЦИЯ','ADSORPTION','ADSORBSİYA'),
    ('science',98,'СУБЛИМАЦИЯ','SUBLIMATION','SUBLİMASİYA'),
    ('travel',4,'ПОЛУОСТРОВ','PENINSULA','YARIMADA'),
    ('travel',6,'ПРОВИНЦИЯ','PROVINCE','VİLAYƏT'),
    ('travel',8,'ЗАПОВЕДНИК','RESERVE','QORUQ'),
    ('travel',10,'ВИАДУК','VIADUCT','VİADUK'),
    ('travel',15,'КАТАКОМБЫ','CATACOMBS','KATAKOMBALAR'),
    ('travel',16,'МЕДРЕСЕ','MADRASAH','MƏDRƏSƏ'),
    ('travel',18,'МАВЗОЛЕЙ','MAUSOLEUM','MƏQBƏRƏ'),
    ('travel',19,'ЦИТАДЕЛЬ','CITADEL','SİTADEL'),
    ('travel',25,'ОБЕЛИСК','OBELISK','OBELİSK'),
    ('travel',30,'КОЛОННАДА','COLONNADE','KOLONNADA'),
    ('travel',35,'БАЗИЛИКА','BASILICA','BAZİLİKA'),
    ('travel',46,'ПАГОДА','PAGODA','PAQODA'),
    ('travel',47,'МИНАРЕТ','MINARET','MİNARƏ'),
    ('travel',48,'МОНАСТЫРЬ','MONASTERY','MONASTIR'),
    ('travel',49,'КОНСУЛЬСТВО','CONSULATE','KONSULLUQ'),
    ('travel',50,'ОСТАНОВКА','BUSSTOP','DAYANACAQ'),
    ('travel',55,'СТОЯНКА','CAMPSITE','DÜŞƏRGƏ'),
    ('travel',60,'КАРАВАНСАРАЙ','CARAVANSERAI','KARVANSARA'),
    ('travel',61,'БИВУАК','BIVOUAC','BİVAK'),
    ('travel',62,'ФЛОТ','FLEET','DONANMA'),
    ('travel',68,'ПИРС','PIER','DOK'),
    ('travel',69,'РИВЬЕРА','RIVIERA','RİVYERA'),
    ('travel',70,'САНАТОРИЙ','SANATORIUM','SANATORİYA'),
    ('travel',79,'ГОНДОЛА','GONDOLA','QONDOLA'),
    ('travel',87,'ДОЛЬМЕН','DOLMEN','DOLMEN'),
    ('travel',97,'КРОМЛЕХ','CROMLECH','KROMLEX'),
    ('travel',98,'ПРИЮТ','SHELTER','SIĞINACAQ'),
    ('travel',99,'ТЕРРАСА','TERRACE','TERRAS'),
    ('technology',14,'МИКРОКОНТРОЛЛЕР','MICROCONTROLLER','MİKROKONTROLLER'),
    ('technology',27,'ТРАНЗИСТОР','TRANSISTOR','TRANZİSTOR'),
    ('technology',31,'РЕЗИСТОР','RESISTOR','REZİSTOR'),
    ('technology',35,'ДИОД','DIODE','DİOD'),
    ('technology',36,'КОНДЕНСАТОР','CAPACITOR','KONDENSATOR'),
    ('technology',39,'КАРТРИДЕР','CARDREADER','KARTOXUYUCU'),
    ('technology',41,'ФРЕЙМВОРК','FRAMEWORK','FREYMVORK'),
    ('technology',42,'КОМПИЛЯТОР','COMPILER','KOMPİLYATOR'),
    ('technology',46,'ИНТЕРПРЕТАТОР','INTERPRETER','İNTERPRETATOR'),
    ('technology',47,'РЕПОЗИТОРИЙ','REPOSITORY','REPOZİTORİYA'),
    ('technology',48,'КОММИТ','COMMIT','KOMMİT'),
    ('technology',51,'ПАТЧ','PATCH','PATÇ'),
    ('technology',53,'БЕНЧМАРК','BENCHMARK','BENÇMARK'),
    ('technology',54,'КЭШ','CACHE','KEŞ'),
    ('technology',55,'ТОКЕН','TOKEN','TOKEN'),
    ('technology',59,'ТРЕКПАД','TRACKPAD','TREKPAD'),
    ('technology',65,'ПЕРИФЕРИЯ','PERIPHERAL','PERİFERİYA'),
    ('technology',71,'ЛОКАЛХОСТ','LOCALHOST','LOCALHOST'),
    ('technology',80,'ДОКЕР','DOCKER','DOKER'),
    ('technology',81,'БИТРЕЙТ','BITRATE','BİTREYT'),
    ('technology',82,'БУТЛОАДЕР','BOOTLOADER','BUTLOADER'),
    ('technology',84,'ГИПЕРТЕКСТ','HYPERTEXT','HİPERTƏKST'),
    ('technology',85,'РЕНДЕРИНГ','RENDERING','RENDERİNQ')
)
UPDATE public.theme_level_answers AS current
SET ru = replacements.ru, en = replacements.en, az = replacements.az
FROM replacements
WHERE current.theme_id = replacements.theme_id AND current.level_id = replacements.level_id;

DO $$
DECLARE expected RECORD; actual_count INTEGER; target_count INTEGER;
BEGIN
  SELECT count(*) INTO target_count FROM public.theme_level_answers WHERE (theme_id, level_id) IN (VALUES ('science',4), ('science',13), ('science',14), ('science',18), ('science',19), ('science',32), ('science',33), ('science',36), ('science',38), ('science',40), ('science',42), ('science',45), ('science',48), ('science',49), ('science',50), ('science',54), ('science',58), ('science',59), ('science',62), ('science',66), ('science',67), ('science',68), ('science',75), ('science',78), ('science',79), ('science',82), ('science',83), ('science',84), ('science',85), ('science',86), ('science',87), ('science',88), ('science',89), ('science',90), ('science',94), ('science',97), ('science',98), ('travel',4), ('travel',6), ('travel',8), ('travel',10), ('travel',15), ('travel',16), ('travel',18), ('travel',19), ('travel',25), ('travel',30), ('travel',35), ('travel',46), ('travel',47), ('travel',48), ('travel',49), ('travel',50), ('travel',55), ('travel',60), ('travel',61), ('travel',62), ('travel',68), ('travel',69), ('travel',70), ('travel',79), ('travel',87), ('travel',97), ('travel',98), ('travel',99), ('technology',14), ('technology',27), ('technology',31), ('technology',35), ('technology',36), ('technology',39), ('technology',41), ('technology',42), ('technology',46), ('technology',47), ('technology',48), ('technology',51), ('technology',53), ('technology',54), ('technology',55), ('technology',59), ('technology',65), ('technology',71), ('technology',80), ('technology',81), ('technology',82), ('technology',84), ('technology',85));
  IF target_count <> 88 THEN RAISE EXCEPTION 'Expected 88 updated theme levels, got %', target_count; END IF;
  FOR expected IN SELECT * FROM (VALUES ('science',20),('travel',20),('technology',20)) AS x(theme_id,overlap_count)
  LOOP
    SELECT count(DISTINCT t.level_id) INTO actual_count
    FROM public.theme_level_answers t JOIN public.main_level_answers m
      ON upper(t.ru)=upper(m.ru) OR upper(t.en)=upper(m.en) OR upper(t.az)=upper(m.az)
    WHERE t.theme_id=expected.theme_id;
    IF actual_count <> expected.overlap_count THEN RAISE EXCEPTION 'Expected % repeated levels in %, got %', expected.overlap_count, expected.theme_id, actual_count; END IF;
  END LOOP;
  IF EXISTS (
    WITH targets(theme_id,level_id) AS (VALUES ('science',4), ('science',13), ('science',14), ('science',18), ('science',19), ('science',32), ('science',33), ('science',36), ('science',38), ('science',40), ('science',42), ('science',45), ('science',48), ('science',49), ('science',50), ('science',54), ('science',58), ('science',59), ('science',62), ('science',66), ('science',67), ('science',68), ('science',75), ('science',78), ('science',79), ('science',82), ('science',83), ('science',84), ('science',85), ('science',86), ('science',87), ('science',88), ('science',89), ('science',90), ('science',94), ('science',97), ('science',98), ('travel',4), ('travel',6), ('travel',8), ('travel',10), ('travel',15), ('travel',16), ('travel',18), ('travel',19), ('travel',25), ('travel',30), ('travel',35), ('travel',46), ('travel',47), ('travel',48), ('travel',49), ('travel',50), ('travel',55), ('travel',60), ('travel',61), ('travel',62), ('travel',68), ('travel',69), ('travel',70), ('travel',79), ('travel',87), ('travel',97), ('travel',98), ('travel',99), ('technology',14), ('technology',27), ('technology',31), ('technology',35), ('technology',36), ('technology',39), ('technology',41), ('technology',42), ('technology',46), ('technology',47), ('technology',48), ('technology',51), ('technology',53), ('technology',54), ('technology',55), ('technology',59), ('technology',65), ('technology',71), ('technology',80), ('technology',81), ('technology',82), ('technology',84), ('technology',85)),
    new_words(theme_id,level_id,lang,word) AS (
      SELECT t.theme_id,t.level_id,'ru',upper(t.ru) FROM public.theme_level_answers t JOIN targets x USING(theme_id,level_id)
      UNION ALL SELECT t.theme_id,t.level_id,'en',upper(t.en) FROM public.theme_level_answers t JOIN targets x USING(theme_id,level_id)
      UNION ALL SELECT t.theme_id,t.level_id,'az',upper(t.az) FROM public.theme_level_answers t JOIN targets x USING(theme_id,level_id)
    ),
    all_words(lang,word,source,theme_id,level_id) AS (
      SELECT 'ru',upper(ru),'theme',theme_id,level_id FROM public.theme_level_answers UNION ALL SELECT 'en',upper(en),'theme',theme_id,level_id FROM public.theme_level_answers UNION ALL SELECT 'az',upper(az),'theme',theme_id,level_id FROM public.theme_level_answers
      UNION ALL SELECT 'ru',upper(ru),'main',NULL::text,NULL::integer FROM public.main_level_answers UNION ALL SELECT 'en',upper(en),'main',NULL::text,NULL::integer FROM public.main_level_answers UNION ALL SELECT 'az',upper(az),'main',NULL::text,NULL::integer FROM public.main_level_answers
      UNION ALL SELECT 'ru',upper(answer_ru),'challenge',NULL::text,NULL::integer FROM public.challenge_question_answers UNION ALL SELECT 'en',upper(answer_en),'challenge',NULL::text,NULL::integer FROM public.challenge_question_answers UNION ALL SELECT 'az',upper(answer_az),'challenge',NULL::text,NULL::integer FROM public.challenge_question_answers
      UNION ALL SELECT 'ru',upper(ru),'daily',NULL::text,NULL::integer FROM public.daily_puzzle_questions UNION ALL SELECT 'en',upper(en),'daily',NULL::text,NULL::integer FROM public.daily_puzzle_questions UNION ALL SELECT 'az',upper(az),'daily',NULL::text,NULL::integer FROM public.daily_puzzle_questions
    )
    SELECT 1 FROM new_words n JOIN all_words a ON a.lang=n.lang AND a.word=n.word
    WHERE a.source<>'theme' OR a.theme_id IS DISTINCT FROM n.theme_id OR a.level_id IS DISTINCT FROM n.level_id
  ) THEN RAISE EXCEPTION 'A replacement answer still duplicates another game answer'; END IF;
END $$;
COMMIT;
