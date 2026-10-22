-- Server-owned answer contract: test one rotated puzzle in each of ten modes,
-- in three languages, against the real RPC, with transaction rollback.
-- Does not include any private answer word or modify actual users.
BEGIN;
DO $test$
DECLARE
  themes text[] := ARRAY['animals','cinema','home','nature','professions',
                          'science','sport','technology','transport','travel'];
  sample_levels integer[] := ARRAY[1,19,1,51,1,3,1,2,22,1];
  modes text[] := ARRAY['ru','en','az'];
  i integer; k integer; playerid uuid; fake_tg bigint;
  term text; mode text; lvl integer; w text; result public.players;
BEGIN
  FOR i IN 1..array_length(themes,1) LOOP
    term:=themes[i]; lvl:=sample_levels[i];
    FOR k IN 1..array_length(modes,1) LOOP
      mode:=modes[k];
      fake_tg:=-(floor(extract(epoch from clock_timestamp())*1000000)::bigint + i*100+k);
      INSERT INTO public.players(telegram_id,photoword_id)
        VALUES(fake_tg,'TEST_ROTATION_'||gen_random_uuid()::text)
        RETURNING id INTO playerid;
      IF lvl>1 THEN
        INSERT INTO public.theme_progress(player_id,theme_id,level_id,completed_at)
        SELECT playerid,term,x,clock_timestamp()-interval '30 seconds'
        FROM generate_series(1,lvl-1) AS x;
      END IF;
      SELECT CASE mode WHEN 'ru' THEN ru WHEN 'en' THEN en ELSE az END
      INTO w FROM public.theme_level_answers
      WHERE theme_id=term AND level_id=lvl;
      IF w IS NULL THEN RAISE EXCEPTION 'Missing themed answer % %',term,lvl; END IF;
      result:=public.complete_theme_level_server(fake_tg,term,lvl,mode,w,15,10);
      IF result.coins<>265 OR result.xp<>10 THEN
        RAISE EXCEPTION 'Incorrect payout for % % %: %/%',term,lvl,mode,result.coins,result.xp;
      END IF;
      result:=public.complete_theme_level_server(fake_tg,term,lvl,mode,w,15,10);
      IF result.coins<>265 OR result.xp<>10 THEN
        RAISE EXCEPTION 'Duplicate payout for % % %',term,lvl,mode;
      END IF;
      IF (SELECT count(*) FROM public.coin_transactions
          WHERE player_id=playerid AND transaction_type='theme_level_reward')<>1 THEN
        RAISE EXCEPTION 'Repeated reward ledger for % % %',term,lvl,mode;
      END IF;
    END LOOP;
  END LOOP;
END
$test$;
ROLLBACK;
