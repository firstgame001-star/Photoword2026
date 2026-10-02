create table if not exists public.main_level_answers (
  level_id integer primary key check (level_id between 1 and 680),
  ru text not null,
  en text not null,
  az text not null
);
alter table public.main_level_answers enable row level security;
revoke all on table public.main_level_answers from anon, authenticated;
grant select, insert, update on table public.main_level_answers to service_role;

create table if not exists public.main_level_answer_attempts (
  telegram_id bigint not null,
  level_id integer not null check (level_id between 1 and 680),
  attempted_at timestamptz not null default clock_timestamp()
);
create index if not exists main_level_answer_attempts_recent_idx
  on public.main_level_answer_attempts (telegram_id, level_id, attempted_at desc);
alter table public.main_level_answer_attempts enable row level security;
revoke all on table public.main_level_answer_attempts from anon, authenticated;
grant select, insert, delete on table public.main_level_answer_attempts to service_role;

create or replace function public.register_wrong_main_answer(p_telegram_id bigint, p_level_id integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recent integer;
begin
  if p_telegram_id is null or p_level_id < 1 or p_level_id > 680 then
    raise exception 'bad_attempt';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_telegram_id::text || ':' || p_level_id::text, 0));
  select count(*)::integer into v_recent
  from public.main_level_answer_attempts
  where telegram_id = p_telegram_id
    and level_id = p_level_id
    and attempted_at > clock_timestamp() - interval '5 minutes';
  if v_recent >= 5 then
    return false;
  end if;
  insert into public.main_level_answer_attempts (telegram_id, level_id)
  values (p_telegram_id, p_level_id);
  return true;
end;
$$;
revoke all on function public.register_wrong_main_answer(bigint, integer) from public, anon, authenticated;
grant execute on function public.register_wrong_main_answer(bigint, integer) to service_role;

create or replace function public.sync_main_level_challenge_answer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.level_id between 1 and 100 then
    insert into public.challenge_question_answers(question_id, answer_ru, answer_en, answer_az)
    values(new.level_id - 1, new.ru, new.en, new.az)
    on conflict (question_id) do update
      set answer_ru = excluded.answer_ru,
          answer_en = excluded.answer_en,
          answer_az = excluded.answer_az;
  end if;
  return new;
end;
$$;
revoke all on function public.sync_main_level_challenge_answer() from public, anon, authenticated;
drop trigger if exists sync_main_level_challenge_answer on public.main_level_answers;
create trigger sync_main_level_challenge_answer
after insert or update on public.main_level_answers
for each row execute function public.sync_main_level_challenge_answer();