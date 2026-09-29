-- Reserve each paid, targeted invitation before delivering a Telegram message.
-- A short lease permits retry after a transient network failure; the bot can
-- only reach players who opted in to Telegram notifications.
alter table public.duel_matches
  add column if not exists notification_claimed_at timestamptz,
  add column if not exists notification_sent_at timestamptz,
  add column if not exists notification_attempts smallint not null default 0
    check (notification_attempts between 0 and 3);

create or replace function public.duel_notification_claim(p_telegram_id bigint,p_code text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.duel_matches; target public.players; sender public.players;
begin
 select dm.* into m from public.duel_matches dm join public.players p on p.id=dm.creator
   where dm.code=upper(p_code) and p.telegram_id=p_telegram_id for update of dm;
 if not found or m.invitee is null or m.status<>'waiting' or m.expires_at<=clock_timestamp()
   or m.notification_sent_at is not null or m.notification_attempts>=3
   or (m.notification_claimed_at is not null and m.notification_claimed_at>clock_timestamp()-interval '20 seconds')
   then return null; end if;
 select * into target from public.players where id=m.invitee;
 if not found or not coalesce(target.notifications_enabled,false) then return null; end if;
 select * into sender from public.players where id=m.creator;
 update public.duel_matches set notification_claimed_at=clock_timestamp(),
   notification_attempts=notification_attempts+1 where id=m.id;
 return jsonb_build_object('code',m.code,'telegram_id',target.telegram_id,
   'language',coalesce(target.notification_language,'ru'),
   'from',coalesce(nullif(sender.game_nickname,''),nullif(sender.first_name,''),sender.photoword_id),
   'stake',m.stake,'expires_at',m.expires_at,'kind',case when m.rematch_of is null then 'friend' else 'rematch' end);
end $$;

create or replace function public.duel_notification_finish(p_telegram_id bigint,p_code text,p_sent boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
 if p_sent then
   update public.duel_matches dm set notification_sent_at=clock_timestamp()
     from public.players p where p.id=dm.creator and p.telegram_id=p_telegram_id
     and dm.code=upper(p_code) and dm.notification_claimed_at is not null
     and dm.notification_sent_at is null;
 end if;
end $$;
revoke all on function public.duel_notification_claim(bigint,text),
  public.duel_notification_finish(bigint,text,boolean) from public,anon,authenticated;
grant execute on function public.duel_notification_claim(bigint,text),
  public.duel_notification_finish(bigint,text,boolean) to service_role;
