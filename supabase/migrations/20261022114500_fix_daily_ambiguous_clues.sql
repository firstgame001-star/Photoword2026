-- Keep live daily puzzle image clues in sync with server/daily-bank.json.
-- Four upcoming daily questions only; no answers, rewards, progress or history change.
DO $$
DECLARE v_count integer;
BEGIN
  UPDATE public.daily_puzzle_questions d SET photos=v.new_photos
  FROM (VALUES
    (31, '["🚗","⚡","🔋","🔌"]'::jsonb, '["🚙","🔋","🔌","🌱"]'::jsonb),
    (115,'["📶","🌐","💻","📱"]'::jsonb,'["📡","🏠","📶","💻"]'::jsonb),
    (222,'["🔭","🌌","⭐","🪐"]'::jsonb,'["🧑‍🔬","🔭","📒","✨"]'::jsonb),
    (291,'["🔌","🧩","💻","📱"]'::jsonb,'["🔌","🧩","🔗","💻"]'::jsonb)
  ) AS v(question_id,old_photos,new_photos)
  WHERE d.id=v.question_id AND (d.photos=v.old_photos OR d.photos=v.new_photos);
  GET DIAGNOSTICS v_count=ROW_COUNT;
  IF v_count<>4 THEN
    RAISE EXCEPTION 'daily clue synchronization expected four rows, got %',v_count;
  END IF;
END
$$;
