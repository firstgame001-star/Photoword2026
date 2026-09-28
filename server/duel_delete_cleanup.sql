-- Account deletion must not consume an opponent's held stake.
create or replace function public.duel_before_player_delete() returns trigger
language plpgsql security definer set search_path='' as $$
declare m public.duel_matches; survivor uuid;
begin
  for m in select * from public.duel_matches
    where (creator=old.id or opponent=old.id) and status='active'
    order by id for update
  loop
    survivor:=case when m.creator=old.id then m.opponent else m.creator end;
    update public.players set coins=coins+m.stake where id=survivor;
    insert into public.coin_transactions(player_id,amount,transaction_type,description)
      values(survivor,m.stake,'duel_refund','Opponent left '||m.code);
    update public.duel_matches set status='cancelled',settled_at=clock_timestamp() where id=m.id;
  end loop;
  return old;
end $$;
revoke all on function public.duel_before_player_delete() from public,anon,authenticated;
drop trigger if exists duel_player_deletion on public.players;
create trigger duel_player_deletion before delete on public.players
for each row execute function public.duel_before_player_delete();
