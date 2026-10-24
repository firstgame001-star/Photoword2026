-- Harden anonymous PhotoWord leaderboard/frame RPCs without changing their URL or response.
-- Privileged reads are isolated from the exposed public schema.
CREATE SCHEMA IF NOT EXISTS photoword_public_reads;
REVOKE ALL ON SCHEMA photoword_public_reads FROM PUBLIC;
GRANT USAGE ON SCHEMA photoword_public_reads TO anon,authenticated,service_role;

CREATE OR REPLACE FUNCTION photoword_public_reads.get_leaderboard(p_limit integer)
RETURNS TABLE(
 rank bigint,photoword_id text,first_name text,last_name text,
 username text,game_nickname text,avatar_url text,xp integer,completed_levels integer
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $fn$
 SELECT row_number() OVER(ORDER BY p.xp DESC,p.completed_levels DESC,p.created_at ASC),
        p.photoword_id,p.first_name,p.last_name,p.username,p.game_nickname,
        p.avatar_url,p.xp,p.completed_levels
 FROM public.players p WHERE p.xp>0
 ORDER BY p.xp DESC,p.completed_levels DESC,p.created_at ASC
 LIMIT LEAST(GREATEST(COALESCE(p_limit,100),1),100);
$fn$;

CREATE OR REPLACE FUNCTION photoword_public_reads.get_avatar_frames(p_codes text[])
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $fn$
 SELECT coalesce(jsonb_object_agg(p.photoword_id,p.avatar_frame),'{}'::jsonb)
 FROM public.players p
 WHERE p.photoword_id IN (
  SELECT requested.code FROM unnest(p_codes[1:100]) AS requested(code)
 ) AND p.avatar_frame IS NOT NULL;
$fn$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA photoword_public_reads
 FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION photoword_public_reads.get_leaderboard(integer)
 TO anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION photoword_public_reads.get_avatar_frames(text[])
 TO anon,authenticated,service_role;

-- Public signatures stay unchanged for clean/core.js; privileges do not.
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_limit integer DEFAULT 100)
RETURNS TABLE(
 rank bigint,photoword_id text,first_name text,last_name text,
 username text,game_nickname text,avatar_url text,xp integer,completed_levels integer
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=''
AS $fn$
 SELECT * FROM photoword_public_reads.get_leaderboard(p_limit);
$fn$;

CREATE OR REPLACE FUNCTION public.get_avatar_frames(p_codes text[])
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=''
AS $fn$
 SELECT photoword_public_reads.get_avatar_frames(p_codes);
$fn$;
REVOKE ALL ON FUNCTION public.get_leaderboard(integer)
 FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.get_avatar_frames(text[])
 FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer)
 TO anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.get_avatar_frames(text[])
 TO anon,authenticated,service_role;
