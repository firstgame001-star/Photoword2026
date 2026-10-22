-- Retain moderation evidence across full progress resets. Account erasure still cascades to audit.
CREATE TABLE IF NOT EXISTS public.anti_cheat_audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('challenge','duel')),
  source_id uuid NOT NULL,
  event_type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(player_id,source_type,source_id,event_type)
);
CREATE INDEX IF NOT EXISTS anti_cheat_audit_player_time
  ON public.anti_cheat_audit_events(player_id,created_at DESC);
ALTER TABLE public.anti_cheat_audit_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.anti_cheat_audit_events FROM PUBLIC, anon, authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.anti_cheat_audit_events TO service_role;

CREATE OR REPLACE FUNCTION public.archive_challenge_anticheat_flag()
RETURNS trigger LANGUAGE plpgsql SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.anti_cheat_audit_events(player_id,source_type,source_id,event_type,details,created_at)
  VALUES(NEW.player_id,'challenge',NEW.run_id,NEW.event_type,NEW.details,NEW.created_at)
  ON CONFLICT(player_id,source_type,source_id,event_type) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.archive_challenge_anticheat_flag() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.archive_duel_anticheat_flag()
RETURNS trigger LANGUAGE plpgsql SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.anti_cheat_audit_events(player_id,source_type,source_id,event_type,details,created_at)
  VALUES(NEW.player_id,'duel',NEW.match_id,NEW.event_type,NEW.details,NEW.created_at)
  ON CONFLICT(player_id,source_type,source_id,event_type) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.archive_duel_anticheat_flag() FROM PUBLIC,anon,authenticated;

DROP TRIGGER IF EXISTS audit_challenge_anticheat_insert ON public.anti_cheat_flags;
CREATE TRIGGER audit_challenge_anticheat_insert
  AFTER INSERT ON public.anti_cheat_flags FOR EACH ROW
  EXECUTE FUNCTION public.archive_challenge_anticheat_flag();
DROP TRIGGER IF EXISTS audit_duel_anticheat_insert ON public.duel_anti_cheat_flags;
CREATE TRIGGER audit_duel_anticheat_insert
  AFTER INSERT ON public.duel_anti_cheat_flags FOR EACH ROW
  EXECUTE FUNCTION public.archive_duel_anticheat_flag();

INSERT INTO public.anti_cheat_audit_events(player_id,source_type,source_id,event_type,details,created_at)
SELECT player_id,'challenge',run_id,event_type,details,created_at FROM public.anti_cheat_flags
ON CONFLICT(player_id,source_type,source_id,event_type) DO NOTHING;
INSERT INTO public.anti_cheat_audit_events(player_id,source_type,source_id,event_type,details,created_at)
SELECT player_id,'duel',match_id,event_type,details,created_at FROM public.duel_anti_cheat_flags
ON CONFLICT(player_id,source_type,source_id,event_type) DO NOTHING;
