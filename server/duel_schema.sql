-- PhotoWord duel: server-owned questions and transactional coin escrow.
create table if not exists public.duel_questions (
  id integer generated always as identity primary key,
  photos text[] not null check (cardinality(photos)=4),
  answer_ru text not null,
  answer_en text not null,
  answer_az text not null
);
alter table public.duel_questions enable row level security;
revoke all on public.duel_questions from public, anon, authenticated;
grant select on public.duel_questions to service_role;
create unique index if not exists duel_question_ru_unique on public.duel_questions(answer_ru);
create unique index if not exists duel_question_en_unique on public.duel_questions(answer_en);
create unique index if not exists duel_question_az_unique on public.duel_questions(answer_az);

create table if not exists public.duel_matches (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,16)),
  creator uuid not null references public.players(id) on delete cascade,
  opponent uuid references public.players(id) on delete cascade,
  stake integer not null check(stake between 25 and 500 and stake % 25=0),
  language text not null check(language in ('ru','en','az')),
  status text not null default 'waiting' check(status in ('waiting','active','finished','cancelled')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now()+interval '5 minutes',
  starts_at timestamptz,
  ends_at timestamptz,
  question_ids integer[] not null default '{}',
  creator_index integer not null default 0,
  opponent_index integer not null default 0,
  creator_score integer not null default 0,
  opponent_score integer not null default 0,
  creator_next_guess_at timestamptz,
  opponent_next_guess_at timestamptz,
  winner uuid references public.players(id) on delete set null,
  payout integer not null default 0,
  settled_at timestamptz,
  constraint duel_distinct_players check(creator<>opponent)
);
create index if not exists duel_open_creator on public.duel_matches(creator) where status in ('waiting','active');
create index if not exists duel_open_opponent on public.duel_matches(opponent) where status='active';
create index if not exists duel_expiry on public.duel_matches(expires_at) where status='waiting';
create index if not exists duel_end on public.duel_matches(ends_at) where status='active';
alter table public.duel_matches enable row level security;
revoke all on public.duel_matches from public, anon, authenticated;

create or replace function public.duel_settle_one(p_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare m public.duel_matches; v_winner uuid; v_payout integer;
begin
  select * into m from public.duel_matches where id=p_id for update;
  if not found then return; end if;
  if m.status='waiting' and m.expires_at<=clock_timestamp() then
    update public.players set coins=coins+m.stake where id=m.creator;
    insert into public.coin_transactions(player_id,amount,transaction_type,description)
      values(m.creator,m.stake,'duel_refund','Expired invite '||m.code);
    update public.duel_matches set status='cancelled',settled_at=clock_timestamp() where id=m.id;
  elsif m.status='active' and m.ends_at<=clock_timestamp() then
    if m.creator_score>m.opponent_score then v_winner:=m.creator;
    elsif m.opponent_score>m.creator_score then v_winner:=m.opponent;
    else v_winner:=null; end if;
    if v_winner is null then
      update public.players set coins=coins+m.stake where id in (m.creator,m.opponent);
      insert into public.coin_transactions(player_id,amount,transaction_type,description)
        values(m.creator,m.stake,'duel_refund','Draw '||m.code),
              (m.opponent,m.stake,'duel_refund','Draw '||m.code);
      v_payout:=0;
    else
      v_payout:=m.stake*9/5;
      update public.players set coins=coins+v_payout where id=v_winner;
      insert into public.coin_transactions(player_id,amount,transaction_type,description)
        values(v_winner,v_payout,'duel_win','Duel '||m.code);
    end if;
    update public.duel_matches set status='finished',winner=v_winner,payout=v_payout,settled_at=clock_timestamp() where id=m.id;
  end if;
end $$;

create or replace function public.duel_create(p_telegram_id bigint,p_stake integer,p_language text)
returns text language plpgsql security definer set search_path='' as $$
declare v public.players; m public.duel_matches;
begin
  if p_stake is null or p_stake<25 or p_stake>500 or p_stake%25<>0 then raise exception 'duel_bad_stake'; end if;
  if p_language not in ('ru','en','az') then raise exception 'duel_bad_language'; end if;
  select * into v from public.players where telegram_id=p_telegram_id for update;
  if not found then raise exception 'player_not_found'; end if;
  if exists(select 1 from public.duel_matches where (creator=v.id or opponent=v.id) and status in ('waiting','active')
            and (status='active' and ends_at>clock_timestamp() or status='waiting' and expires_at>clock_timestamp()))
    then raise exception 'duel_already_open'; end if;
  if v.coins<p_stake then raise exception 'insufficient_coins'; end if;
  update public.players set coins=coins-p_stake where id=v.id;
  insert into public.duel_matches(creator,stake,language) values(v.id,p_stake,p_language) returning * into m;
  insert into public.coin_transactions(player_id,amount,transaction_type,description)
    values(v.id,-p_stake,'duel_entry','Invite '||m.code);
  return m.code;
end $$;

create or replace function public.duel_join(p_telegram_id bigint,p_code text)
returns void language plpgsql security definer set search_path='' as $$
declare m public.duel_matches; v public.players;
begin
  select * into m from public.duel_matches where code=upper(p_code) for update;
  if not found then raise exception 'duel_not_found'; end if;
  perform public.duel_settle_one(m.id);
  select * into m from public.duel_matches where id=m.id;
  if m.status<>'waiting' then raise exception 'duel_not_waiting'; end if;
  select * into v from public.players where telegram_id=p_telegram_id for update;
  if not found then raise exception 'player_not_found'; end if;
  if v.id=m.creator then raise exception 'duel_own_invite'; end if;
  if exists(select 1 from public.duel_matches where (creator=v.id or opponent=v.id) and status in ('waiting','active')
            and (status='active' and ends_at>clock_timestamp() or status='waiting' and expires_at>clock_timestamp()))
    then raise exception 'duel_already_open'; end if;
  if v.coins<m.stake then raise exception 'insufficient_coins'; end if;
  update public.players set coins=coins-m.stake where id=v.id;
  insert into public.coin_transactions(player_id,amount,transaction_type,description)
    values(v.id,-m.stake,'duel_entry','Joined '||m.code);
  update public.duel_matches set opponent=v.id,status='active',
    starts_at=clock_timestamp()+interval '3 seconds',ends_at=clock_timestamp()+interval '63 seconds',
    question_ids=array(select id from public.duel_questions order by random() limit 24)
    where id=m.id;
end $$;

create or replace function public.duel_cancel(p_telegram_id bigint,p_code text)
returns void language plpgsql security definer set search_path='' as $$
declare m public.duel_matches;
begin
  select dm.* into m from public.duel_matches dm join public.players p on p.id=dm.creator
    where dm.code=upper(p_code) and p.telegram_id=p_telegram_id for update of dm;
  if not found or m.status<>'waiting' then raise exception 'duel_cannot_cancel'; end if;
  update public.players set coins=coins+m.stake where id=m.creator;
  insert into public.coin_transactions(player_id,amount,transaction_type,description)
    values(m.creator,m.stake,'duel_refund','Cancelled '||m.code);
  update public.duel_matches set status='cancelled',settled_at=clock_timestamp() where id=m.id;
end $$;

create or replace function public.duel_submit(p_telegram_id bigint,p_code text,p_answer text)
returns boolean language plpgsql security definer set search_path='' as $$
declare m public.duel_matches; v_id uuid; v_creator boolean; v_index integer; v_allowed timestamptz;
        v_correct text; v_ok boolean;
begin
  select id into v_id from public.players where telegram_id=p_telegram_id;
  select * into m from public.duel_matches where code=upper(p_code) and (creator=v_id or opponent=v_id) for update;
  if not found then raise exception 'duel_not_found'; end if;
  if m.status<>'active' or clock_timestamp()<m.starts_at or clock_timestamp()>=m.ends_at then raise exception 'duel_not_active'; end if;
  v_creator:=m.creator=v_id;
  v_index:=case when v_creator then m.creator_index else m.opponent_index end;
  v_allowed:=case when v_creator then m.creator_next_guess_at else m.opponent_next_guess_at end;
  if v_index>=cardinality(m.question_ids) then raise exception 'duel_no_questions'; end if;
  if v_allowed is not null and clock_timestamp()<v_allowed then raise exception 'duel_wait'; end if;
  select case m.language when 'en' then answer_en when 'az' then answer_az else answer_ru end into v_correct
    from public.duel_questions where id=m.question_ids[v_index+1];
  if length(p_answer)>40 or p_answer is null then raise exception 'duel_bad_answer'; end if;
  v_ok:=trim(p_answer)=v_correct;
  if v_creator then
    update public.duel_matches set creator_index=creator_index+case when v_ok then 1 else 0 end,
      creator_score=creator_score+case when v_ok then 1 else 0 end,
      creator_next_guess_at=clock_timestamp()+(case when v_ok then interval '0.35 seconds' else interval '2 seconds' end)
      where id=m.id;
  else
    update public.duel_matches set opponent_index=opponent_index+case when v_ok then 1 else 0 end,
      opponent_score=opponent_score+case when v_ok then 1 else 0 end,
      opponent_next_guess_at=clock_timestamp()+(case when v_ok then interval '0.35 seconds' else interval '2 seconds' end)
      where id=m.id;
  end if;
  return v_ok;
end $$;

create or replace function public.duel_snapshot(p_telegram_id bigint,p_code text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.duel_matches; v_id uuid; v_index integer; v_allowed timestamptz;
begin
  select id into v_id from public.players where telegram_id=p_telegram_id;
  if p_code is null then
    select * into m from public.duel_matches where (creator=v_id or opponent=v_id)
      and status in ('waiting','active') order by created_at desc limit 1;
  else
    select * into m from public.duel_matches where code=upper(p_code) and (creator=v_id or opponent=v_id);
  end if;
  if not found then return null; end if;
  perform public.duel_settle_one(m.id);
  select * into m from public.duel_matches where id=m.id;
  v_index:=case when m.creator=v_id then m.creator_index else m.opponent_index end;
  v_allowed:=case when m.creator=v_id then m.creator_next_guess_at else m.opponent_next_guess_at end;
  return jsonb_build_object('code',m.code,'stake',m.stake,'language',m.language,'status',m.status,
    'creator',m.creator=v_id,'my_score',case when m.creator=v_id then m.creator_score else m.opponent_score end,
    'their_score',case when m.creator=v_id then m.opponent_score else m.creator_score end,
    'question_id',case when m.status='active' and v_index<cardinality(m.question_ids) then m.question_ids[v_index+1] else null end,
    'starts_at',m.starts_at,'ends_at',m.ends_at,'expires_at',m.expires_at,
    'next_guess_at',v_allowed,'won',m.winner=v_id,'draw',m.status='finished' and m.winner is null,
    'payout',case when m.winner=v_id then m.payout else 0 end);
end $$;

create or replace function public.duel_expire_all() returns void
language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
  for v_id in select id from public.duel_matches where
    (status='waiting' and expires_at<=clock_timestamp()) or
    (status='active' and ends_at<=clock_timestamp())
  loop perform public.duel_settle_one(v_id); end loop;
end $$;

revoke all on function public.duel_settle_one(uuid),public.duel_create(bigint,integer,text),
  public.duel_join(bigint,text),public.duel_cancel(bigint,text),public.duel_submit(bigint,text,text),
  public.duel_snapshot(bigint,text),public.duel_expire_all() from public,anon,authenticated;
grant execute on function public.duel_settle_one(uuid),public.duel_create(bigint,integer,text),
  public.duel_join(bigint,text),public.duel_cancel(bigint,text),public.duel_submit(bigint,text,text),
  public.duel_snapshot(bigint,text),public.duel_expire_all() to service_role;

select cron.schedule('photoword_duel_settlement','* * * * *','select public.duel_expire_all()');
