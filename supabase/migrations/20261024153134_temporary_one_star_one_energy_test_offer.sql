-- TEMPORARY TEST OFFER: +1 limited-mode energy for 1 Telegram Star.
-- Preserve historical paid 15-Star e1 receipts; e5 remains 50 Stars.
ALTER TABLE public.challenge_energy_purchases DROP CONSTRAINT IF EXISTS challenge_energy_purchases_stars_check;
ALTER TABLE public.challenge_energy_purchases ADD CONSTRAINT challenge_energy_purchases_stars_check CHECK (stars IN (1,15,50));
CREATE OR REPLACE FUNCTION public.credit_challenge_energy_purchase_server(p_telegram_id bigint, p_charge_id text, p_payload text, p_stars integer, p_energy integer)
 RETURNS challenge_profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
 v_player public.players;
 v_profile public.challenge_profiles;
 v_now timestamptz:=now();
 v_energy integer;
 v_ref timestamptz;
 v_gain integer;
BEGIN
 IF NOT ((p_stars,p_energy) IN ((1,1),(15,1),(50,5))) THEN RAISE EXCEPTION 'bad_energy_pack'; END IF;
 IF p_charge_id IS NULL OR length(p_charge_id)<3 OR p_payload IS NULL OR length(p_payload)<10
 THEN RAISE EXCEPTION 'bad_payment'; END IF;
 SELECT * INTO v_player FROM public.players WHERE telegram_id=p_telegram_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'player_not_found'; END IF;
 SELECT * INTO v_profile FROM public.challenge_profiles WHERE player_id=v_player.id FOR UPDATE;
 IF NOT FOUND THEN
   INSERT INTO public.challenge_profiles(player_id) VALUES(v_player.id) RETURNING * INTO v_profile;
 END IF;
 IF EXISTS(SELECT 1 FROM public.star_refunds WHERE telegram_payment_charge_id=p_charge_id)
 THEN RETURN v_profile; END IF;
 v_energy:=COALESCE(v_profile.limited_energy,5);
 v_ref:=COALESCE(v_profile.energy_ref_at,v_now);
 IF v_energy<5 THEN
   v_gain:=floor(extract(epoch FROM (v_now-v_ref))/1800);
   IF v_gain>0 THEN
     v_energy:=LEAST(5,v_energy+v_gain);
     v_ref:=CASE WHEN v_energy>=5 THEN v_now ELSE v_ref+(v_gain*interval '30 minutes') END;
   END IF;
 END IF;
 INSERT INTO public.challenge_energy_purchases(player_id,telegram_payment_charge_id,invoice_payload,stars,energy_added)
 VALUES(v_player.id,p_charge_id,p_payload,p_stars,p_energy)
 ON CONFLICT(telegram_payment_charge_id) DO NOTHING;
 IF NOT FOUND THEN RETURN v_profile; END IF;
 IF p_energy=5 THEN v_energy:=5;
 ELSE v_energy:=LEAST(5,v_energy+1); END IF;
 UPDATE public.challenge_profiles
 SET limited_energy=v_energy,energy_ref_at=CASE WHEN v_energy>=5 THEN v_now ELSE v_ref END,updated_at=v_now
 WHERE player_id=v_player.id RETURNING * INTO v_profile;
 RETURN v_profile;
END;
$function$;
REVOKE ALL ON FUNCTION public.credit_challenge_energy_purchase_server(bigint,text,text,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.credit_challenge_energy_purchase_server(bigint,text,text,integer,integer) TO service_role;
