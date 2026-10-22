CREATE OR REPLACE FUNCTION public.duel_cancel(p_telegram_id bigint, p_code text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare m public.duel_matches;
begin
  select dm.* into m from public.duel_matches dm join public.players p on p.id=dm.creator
    where dm.code=upper(p_code) and p.telegram_id=p_telegram_id for update of dm;
  if not found or m.status<>'waiting' then raise exception 'duel_cannot_cancel'; end if;
  update public.players set coins=coins+m.stake where id=m.creator;
  insert into public.coin_transactions(player_id,amount,transaction_type,description,reward_source_id)
    values(m.creator,m.stake,'duel_refund','Cancelled '||m.code,m.id);
  update public.duel_matches set status='cancelled',settled_at=clock_timestamp() where id=m.id;
end $function$
;
REVOKE ALL ON FUNCTION public.duel_cancel(bigint,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.duel_cancel(bigint,text) TO service_role;
