-- Suspicious winning duel results never mint prize coins.
-- Void the match with two full refunds; score remains recorded for audit.
-- Preserve 90% winner payout for unflagged results and preserve draws.
-- Historical matches, players and balances are not changed by deployment.
CREATE OR REPLACE FUNCTION public.duel_settle_one(p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare m public.duel_matches; v_winner uuid; v_payout integer; v_flagged boolean:=false;
begin
  select * into m from public.duel_matches where id=p_id for update;
  if not found then return; end if;
  if m.status='waiting' and m.expires_at<=clock_timestamp() then
    update public.players set coins=coins+m.stake where id=m.creator;
    insert into public.coin_transactions(player_id,amount,transaction_type,description,reward_source_id)
      values(m.creator,m.stake,'duel_refund','Expired invite '||m.code,m.id);
    update public.duel_matches set status='cancelled',settled_at=clock_timestamp() where id=m.id;
  elsif m.status='active' and m.ends_at<=clock_timestamp() then
    if m.creator_score>m.opponent_score then v_winner:=m.creator;
    elsif m.opponent_score>m.creator_score then v_winner:=m.opponent;
    else v_winner:=null; end if;
    -- A suspicious prospective winner receives no duel pot. Void the match
    -- and return both stakes: no commissions, no confiscation, no payout.
    if v_winner is not null then
      select exists(select 1 from public.duel_anti_cheat_flags f
        where f.match_id=m.id and f.player_id=v_winner
          and f.event_type in ('fast_correct_sequence','excessive_wrong_answers'))
      into v_flagged;
    end if;
    if v_flagged then
      update public.players set coins=coins+m.stake where id in (m.creator,m.opponent);
      insert into public.coin_transactions(player_id,amount,transaction_type,description,reward_source_id)
        values(m.creator,m.stake,'duel_refund','Anti-cheat void '||m.code,m.id),
              (m.opponent,m.stake,'duel_refund','Anti-cheat void '||m.code,m.id);
      v_winner:=null;v_payout:=0;
    elsif v_winner is null then
      update public.players set coins=coins+m.stake where id in (m.creator,m.opponent);
      insert into public.coin_transactions(player_id,amount,transaction_type,description,reward_source_id)
        values(m.creator,m.stake,'duel_refund','Draw '||m.code,m.id),
              (m.opponent,m.stake,'duel_refund','Draw '||m.code,m.id);
      v_payout:=0;
    else
      v_payout:=m.stake*9/5;
      update public.players set coins=coins+v_payout where id=v_winner;
      insert into public.coin_transactions(player_id,amount,transaction_type,description,reward_source_id)
        values(v_winner,v_payout,'duel_win','Duel '||m.code,m.id);
    end if;
    update public.duel_matches set status=case when v_flagged then 'cancelled' else 'finished' end,winner=v_winner,payout=v_payout,settled_at=clock_timestamp() where id=m.id;
  end if;
end $function$;
