-- Supabase migration applied as 20261024150725, mirrored from deployed catalog.
-- Secure accounting for inbound Telegram Bot API refunded_payment events.
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS refund_coin_debt integer NOT NULL DEFAULT 0;
ALTER TABLE public.players ADD CONSTRAINT players_refund_coin_debt_nonnegative CHECK (refund_coin_debt >= 0);

CREATE TABLE public.star_refunds (
  telegram_payment_charge_id text PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  invoice_payload text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('coins','energy')),
  stars integer NOT NULL CHECK(stars > 0),
  status text NOT NULL CHECK (status IN ('applied','pending')),
  revoked_coins integer NOT NULL DEFAULT 0 CHECK(revoked_coins >= 0),
  coin_debt_created integer NOT NULL DEFAULT 0 CHECK(coin_debt_created >= 0),
  revoked_energy integer NOT NULL DEFAULT 0 CHECK(revoked_energy >= 0),
  unrecovered_energy integer NOT NULL DEFAULT 0 CHECK(unrecovered_energy >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX star_refunds_player_time_idx ON public.star_refunds(player_id,created_at DESC);
ALTER TABLE public.star_refunds ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.star_refunds FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE public.star_refunds TO service_role;

CREATE OR REPLACE FUNCTION public.apply_star_refund_debt_to_earnings()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE v_offset integer;
BEGIN
  IF NEW.coins > OLD.coins AND OLD.refund_coin_debt > 0 THEN
    v_offset:=LEAST(NEW.coins-OLD.coins,OLD.refund_coin_debt);
    NEW.coins:=NEW.coins-v_offset;
    NEW.refund_coin_debt:=OLD.refund_coin_debt-v_offset;
    INSERT INTO public.coin_transactions(player_id,amount,transaction_type,description)
    VALUES(NEW.id,-v_offset,'stars_refund_debt_payment','Recovery of previously refunded Stars');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER players_star_refund_debt_on_earnings
BEFORE UPDATE OF coins ON public.players
FOR EACH ROW EXECUTE FUNCTION public.apply_star_refund_debt_to_earnings();

CREATE OR REPLACE FUNCTION public.register_star_refund_server(p_telegram_id bigint, p_charge_id text, p_payload text, p_stars integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_player public.players%ROWTYPE;
  v_existing public.star_refunds%ROWTYPE;
  v_coin public.star_purchases%ROWTYPE;
  v_energy_purchase public.challenge_energy_purchases%ROWTYPE;
  v_profile public.challenge_profiles%ROWTYPE;
  v_kind text;
  v_revoked integer := 0;
  v_shortfall integer := 0;
  v_ref timestamptz;
  v_current integer;
  v_regen integer;
BEGIN
  IF p_charge_id IS NULL OR length(p_charge_id)<3 OR p_payload IS NULL OR length(p_payload)<10
     OR p_stars IS NULL OR p_stars<1
     OR p_payload !~ '^pw(coins|energy):[a-zA-Z0-9]+:[0-9]+:'
     OR split_part(p_payload,':',3)::bigint<>p_telegram_id
  THEN RAISE EXCEPTION 'bad_refund'; END IF;
  SELECT * INTO v_player FROM public.players WHERE telegram_id=p_telegram_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'player_not_found'; END IF;

  SELECT * INTO v_existing FROM public.star_refunds WHERE telegram_payment_charge_id=p_charge_id;
  IF FOUND THEN
    IF v_existing.player_id<>v_player.id OR v_existing.invoice_payload<>p_payload
       OR v_existing.stars<>p_stars THEN RAISE EXCEPTION 'refund_receipt_mismatch'; END IF;
    RETURN jsonb_build_object('status','duplicate','kind',v_existing.kind);
  END IF;

  SELECT * INTO v_coin FROM public.star_purchases
   WHERE telegram_payment_charge_id=p_charge_id FOR UPDATE;
  IF FOUND THEN
    IF v_coin.player_id<>v_player.id OR v_coin.invoice_payload<>p_payload
       OR v_coin.stars<>p_stars THEN RAISE EXCEPTION 'refund_receipt_mismatch'; END IF;
    v_kind:='coins';
    v_revoked:=LEAST(v_player.coins,v_coin.coins);
    v_shortfall:=v_coin.coins-v_revoked;
    UPDATE public.players
       SET coins=coins-v_revoked,refund_coin_debt=refund_coin_debt+v_shortfall
     WHERE id=v_player.id;
    IF v_revoked>0 THEN
      INSERT INTO public.coin_transactions(player_id,amount,transaction_type,description)
      VALUES(v_player.id,-v_revoked,'stars_refund','Telegram Stars refund: '||p_charge_id);
    END IF;
    INSERT INTO public.star_refunds
      (telegram_payment_charge_id,player_id,invoice_payload,kind,stars,status,revoked_coins,coin_debt_created)
    VALUES (p_charge_id,v_player.id,p_payload,v_kind,p_stars,'applied',v_revoked,v_shortfall);
    RETURN jsonb_build_object('status','applied','kind','coins','revoked_coins',v_revoked,'debt_coins',v_shortfall);
  END IF;

  SELECT * INTO v_energy_purchase FROM public.challenge_energy_purchases
   WHERE telegram_payment_charge_id=p_charge_id FOR UPDATE;
  IF FOUND THEN
    IF v_energy_purchase.player_id<>v_player.id OR v_energy_purchase.invoice_payload<>p_payload
       OR v_energy_purchase.stars<>p_stars THEN RAISE EXCEPTION 'refund_receipt_mismatch'; END IF;
    v_kind:='energy';
    SELECT * INTO v_profile FROM public.challenge_profiles WHERE player_id=v_player.id FOR UPDATE;
    IF NOT FOUND THEN
      INSERT INTO public.challenge_profiles(player_id) VALUES(v_player.id) RETURNING * INTO v_profile;
    END IF;
    v_current:=COALESCE(v_profile.limited_energy,5);
    v_ref:=COALESCE(v_profile.energy_ref_at,now());
    IF v_current<5 THEN
      v_regen:=GREATEST(0,floor(extract(epoch FROM (now()-v_ref))/1800)::integer);
      IF v_regen>0 THEN
        v_current:=LEAST(5,v_current+v_regen);
        v_ref:=CASE WHEN v_current>=5 THEN now() ELSE v_ref+v_regen*interval '30 minutes' END;
      END IF;
    END IF;
    v_revoked:=LEAST(v_current,v_energy_purchase.energy_added);
    v_shortfall:=v_energy_purchase.energy_added-v_revoked;
    UPDATE public.challenge_profiles
       SET limited_energy=v_current-v_revoked,
           energy_ref_at=CASE WHEN v_current>=5 THEN now() ELSE v_ref END,
           updated_at=now()
     WHERE player_id=v_player.id;
    INSERT INTO public.star_refunds
      (telegram_payment_charge_id,player_id,invoice_payload,kind,stars,status,revoked_energy,unrecovered_energy)
    VALUES (p_charge_id,v_player.id,p_payload,v_kind,p_stars,'applied',v_revoked,v_shortfall);
    RETURN jsonb_build_object('status','applied','kind','energy','revoked_energy',v_revoked,'unrecovered_energy',v_shortfall);
  END IF;

  -- Refund delivered ahead of the corresponding successful_payment.
  -- Persist the charge as refunded, and refuse any later grant for it.
  v_kind:=CASE WHEN p_payload LIKE 'pwcoins:%' THEN 'coins' ELSE 'energy' END;
  INSERT INTO public.star_refunds(telegram_payment_charge_id,player_id,invoice_payload,kind,stars,status)
    VALUES(p_charge_id,v_player.id,p_payload,v_kind,p_stars,'pending');
  RETURN jsonb_build_object('status','pending','kind',v_kind);
END;
$function$;

REVOKE ALL ON FUNCTION public.register_star_refund_server(bigint,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.register_star_refund_server(bigint,text,text,integer) TO service_role;

CREATE OR REPLACE FUNCTION public.credit_star_purchase_server(p_telegram_id bigint, p_charge_id text, p_payload text, p_stars integer, p_coins integer)
 RETURNS players
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE v public.players;
BEGIN
 IF NOT ((p_stars,p_coins) IN ((1,1),(15,10),(65,50),(175,150),(300,300)))
 THEN RAISE EXCEPTION 'bad_star_pack'; END IF;
 IF p_charge_id IS NULL OR length(p_charge_id)<1 OR p_payload IS NULL OR length(p_payload)<10
 THEN RAISE EXCEPTION 'bad_payment'; END IF;
 SELECT * INTO v FROM public.players WHERE telegram_id=p_telegram_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'player_not_found'; END IF;
 IF EXISTS (SELECT 1 FROM public.star_refunds WHERE telegram_payment_charge_id=p_charge_id)
 THEN RETURN v; END IF;
 IF EXISTS (SELECT 1 FROM public.star_purchases WHERE telegram_payment_charge_id=p_charge_id)
 THEN RETURN v; END IF;
 INSERT INTO public.star_purchases(player_id,telegram_payment_charge_id,invoice_payload,stars,coins)
 VALUES(v.id,p_charge_id,p_payload,p_stars,p_coins);
 UPDATE public.players SET coins=coins+p_coins WHERE id=v.id RETURNING * INTO v;
 INSERT INTO public.coin_transactions(player_id,amount,transaction_type,description)
 VALUES(v.id,p_coins,'stars_purchase','Telegram Stars: '||p_stars||' XTR');
 RETURN v;
END;
$function$;

REVOKE ALL ON FUNCTION public.credit_star_purchase_server(bigint,text,text,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.credit_star_purchase_server(bigint,text,text,integer,integer) TO service_role;

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
 IF NOT ((p_stars,p_energy) IN ((15,1),(50,5))) THEN RAISE EXCEPTION 'bad_energy_pack'; END IF;
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

