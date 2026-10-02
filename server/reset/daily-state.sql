create or replace function public.daily_puzzle_state(p_telegram_id bigint,p_language text)
returns jsonb language plpgsql set search_path='' as $$
declare v_id uuid;generation integer;v_day date;v_now timestamptz:=clock_timestamp();q public.daily_puzzle_questions;p public.daily_puzzle_progress;word text;
begin
 if p_language is null or p_language not in('ru','en','az') then raise exception 'bad_language';end if;
 select id,progress_generation into v_id,generation from public.players where telegram_id=p_telegram_id;
 if v_id is null then raise exception 'player_not_found';end if;
 v_day:=public.daily_puzzle_day(v_now);
 select * into q from public.daily_puzzle_questions where id=public.daily_puzzle_index(v_day);
 if q.id is null then raise exception 'daily_not_configured';end if;
 select * into p from public.daily_puzzle_progress where player_id=v_id and puzzle_day=v_day;
 word:=case p_language when 'ru' then q.ru when 'en' then q.en else q.az end;
 return jsonb_build_object('day',v_day,'question_id',q.id,'language',p_language,'photos',q.photos,
  'length',char_length(word),'attempts',coalesce(p.attempts,0),'attempts_left',3-coalesce(p.attempts,0),
  'solved',coalesce(p.solved,false),'closed',coalesce(p.solved,false) or coalesce(p.attempts,0)>=3,
  'progress_generation',generation,'reward_coins',25,'server_now',v_now,'reset_at',(v_day+1)::timestamp at time zone 'Europe/Saratov');
end $$;