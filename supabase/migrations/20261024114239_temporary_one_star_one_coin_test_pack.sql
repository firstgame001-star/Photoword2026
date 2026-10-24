-- TEMPORARY: 1 Telegram Star for 1 PhotoWord coin to verify a real payment.
-- Remove when the user confirms completion; regular packs remain unchanged.
ALTER TABLE public.star_purchases DROP CONSTRAINT star_purchases_pack_check;
ALTER TABLE public.star_purchases ADD CONSTRAINT star_purchases_pack_check CHECK
 (((stars=1 AND coins=1) OR (stars=15 AND coins=10) OR (stars=65 AND coins=50) OR (stars=175 AND coins=150) OR (stars=300 AND coins=300)));
CREATE OR REPLACE FUNCTION public.credit_star_purchase_server(p_telegram_id bigint, p_charge_id text, p_payload text, p_stars integer, p_coins integer)
 RETURNS players
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v public.players;
begin
  if not ((p_stars,p_coins) in ((1,1),(15,10),(65,50),(175,150),(300,300))) then
    raise exception 'bad_star_pack';
  end if;
  if p_charge_id is null or length(p_charge_id)<1
     or p_payload is null or length(p_payload)<10 then
    raise exception 'bad_payment';
  end if;

  select * into v from public.players where telegram_id=p_telegram_id for update;
  if v.id is null then raise exception 'player_not_found'; end if;

  if exists(
    select 1 from public.star_purchases
    where telegram_payment_charge_id=p_charge_id
  ) then
    return v;
  end if;

  insert into public.star_purchases(
    player_id,telegram_payment_charge_id,invoice_payload,stars,coins
  )
  values(v.id,p_charge_id,p_payload,p_stars,p_coins);

  update public.players
  set coins=coins+p_coins
  where id=v.id
  returning * into v;

  insert into public.coin_transactions(player_id,amount,transaction_type,description)
  values(v.id,p_coins,'stars_purchase','Telegram Stars: '||p_stars||' XTR');

  return v;
end
$function$;
REVOKE ALL ON FUNCTION public.credit_star_purchase_server(bigint,text,text,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.credit_star_purchase_server(bigint,text,text,integer,integer) TO service_role;
