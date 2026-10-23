-- PhotoWord fairness: do not forfeit honest fast answers or achievements.
-- Five correct in under 8 seconds and 12 wrong guesses remain audit-only.
-- Automatic void requires 10 correct in under 12 seconds, or confirmed_automation.
-- Preserves historic player balances, flags, outcomes, and refunds.
CREATE OR REPLACE FUNCTION public.achievement_metrics(p_player uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare m jsonb;themes jsonb;chapters jsonb;daily_best_streak integer;ds jsonb;duels jsonb;challenges jsonb;
begin
 select jsonb_build_object('main',count(*) filter(where mode='main'),'nohint',count(*) filter(where mode='main' and no_hint),'theme_total',count(*) filter(where mode='theme')) into m from public.achievement_levels where player_id=p_player;
 select coalesce(jsonb_object_agg('theme_'||theme_id,n),'{}'::jsonb)||jsonb_build_object('themes_complete',count(*) filter(where n>=100)) into themes from (select theme_id,count(*) n from public.achievement_levels where player_id=p_player and mode='theme' group by theme_id) t;
 select jsonb_object_agg('chapter_'||i,case when n=last_level-first_level+1 then 1 else 0 end) into chapters
 from (select b.i,b.first_level,b.last_level,count(l.level_id) n
       from (values(1,1,20),(2,21,50),(3,51,90),(4,91,130),(5,131,180),(6,181,230),(7,231,280),(8,281,330),(9,331,380),(10,381,430),(11,431,480),(12,481,530),(13,531,580),(14,581,630),(15,631,680)) b(i,first_level,last_level)
       left join public.achievement_levels l on l.player_id=p_player and l.mode='main' and l.level_id between b.first_level and b.last_level
       group by b.i,b.first_level,b.last_level) c;
 select coalesce(max(n),0) into daily_best_streak from (select count(*) n from (select puzzle_day-(row_number() over(order by puzzle_day))::integer grp from public.daily_puzzle_progress where player_id=p_player and solved) d group by grp) series;
 select jsonb_build_object('daily_total',count(*),'daily_first',count(*) filter(where attempts=1),'daily_streak',daily_best_streak) into ds from public.daily_puzzle_progress where player_id=p_player and solved;
 select jsonb_build_object('duel_played',count(*),'duel_wins',count(*) filter(where winner=p_player),'duel_draws',count(*) filter(where winner is null),'duel_best',coalesce(max(case when creator=p_player then creator_score else opponent_score end),0)) into duels from public.duel_matches m where m.status='finished' and (m.creator=p_player or m.opponent=p_player) and m.created_at>=(select progress_reset_at from public.players where id=p_player)
 and not exists(select 1 from public.duel_anti_cheat_flags f where f.match_id=m.id and f.player_id=p_player and f.event_type in ('superhuman_correct_sequence','confirmed_automation'));
 select jsonb_build_object('challenge_runs',count(*) filter(where reward_coins>0),'challenge_streak',coalesce(max(streak),0),'blitz_best',coalesce(max(score) filter(where mode='blitz'),0)) into challenges from public.challenge_runs r where r.player_id=p_player and r.finished_at is not null
 and not exists(select 1 from public.anti_cheat_flags f where f.run_id=r.id and f.event_type in ('implausibly_fast_run','fast_correct_sequence'));
 return m||themes||chapters||ds||duels||challenges;
end
$function$;

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
          and f.event_type in ('superhuman_correct_sequence','confirmed_automation'))
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

CREATE OR REPLACE FUNCTION public.duel_submit(p_telegram_id bigint, p_code text, p_answer text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare m public.duel_matches; v_id uuid; v_creator boolean; v_index integer; v_allowed timestamptz;
        v_correct text; v_ok boolean; v_now timestamptz; v_count integer; v_window interval;
begin
  select id into v_id from public.players where telegram_id=p_telegram_id;
  select * into m from public.duel_matches where code=upper(p_code) and (creator=v_id or opponent=v_id) for update;
  if not found then raise exception 'duel_not_found'; end if;
  if m.status<>'active' or clock_timestamp()<m.starts_at or clock_timestamp()>=m.ends_at then raise exception 'duel_not_active'; end if;
  v_now:=clock_timestamp();
  v_creator:=m.creator=v_id;
  v_index:=case when v_creator then m.creator_index else m.opponent_index end;
  v_allowed:=case when v_creator then m.creator_next_guess_at else m.opponent_next_guess_at end;
  if v_index>=cardinality(m.question_ids) then raise exception 'duel_no_questions'; end if;
  if v_allowed is not null and clock_timestamp()<v_allowed then raise exception 'duel_wait'; end if;
  select case (case when v_creator then m.language else coalesce(m.opponent_language,m.language) end) when 'en' then answer_en when 'az' then answer_az else answer_ru end into v_correct
    from public.duel_questions where id=m.question_ids[v_index+1];
  if length(p_answer)>40 or p_answer is null then raise exception 'duel_bad_answer'; end if;
  v_ok:=trim(p_answer)=v_correct;
  if v_creator then
    update public.duel_matches set creator_index=creator_index+case when v_ok then 1 else 0 end,
      creator_score=creator_score+case when v_ok then 1 else 0 end,
      creator_next_guess_at=clock_timestamp()+(case when v_ok then interval '0.95 seconds' else interval '2 seconds' end)
      where id=m.id;
  else
    update public.duel_matches set opponent_index=opponent_index+case when v_ok then 1 else 0 end,
      opponent_score=opponent_score+case when v_ok then 1 else 0 end,
      opponent_next_guess_at=clock_timestamp()+(case when v_ok then interval '0.95 seconds' else interval '2 seconds' end)
      where id=m.id;
  end if;
  insert into public.duel_answer_attempts(match_id,player_id,question_index,is_correct,created_at)
    values(m.id,v_id,v_index,v_ok,v_now);
  if v_ok then
    select count(*),max(created_at)-min(created_at) into v_count,v_window
      from (select created_at from public.duel_answer_attempts
            where match_id=m.id and player_id=v_id and is_correct
            order by created_at desc limit 5) recent;
    if v_count=5 and v_window<interval '8 seconds' then
      insert into public.duel_anti_cheat_flags(match_id,player_id,event_type,details)
      values(m.id,v_id,'fast_correct_sequence',jsonb_build_object('five_correct_seconds',extract(epoch from v_window),
              'score',case when v_creator then m.creator_score+1 else m.opponent_score+1 end))
      on conflict(match_id,player_id,event_type) do nothing;
    end if;
    -- Monitor rapid five-correct sequences, but do not automatically punish.
    -- A ten-answer sequence in under 12s is the high-confidence auto-void signal.
    select count(*),max(created_at)-min(created_at) into v_count,v_window
      from (select created_at from public.duel_answer_attempts
            where match_id=m.id and player_id=v_id and is_correct
            order by created_at desc limit 10) recent_ten;
    if v_count=10 and v_window<interval '12 seconds' then
      insert into public.duel_anti_cheat_flags(match_id,player_id,event_type,details)
      values(m.id,v_id,'superhuman_correct_sequence',
       jsonb_build_object('ten_correct_seconds',extract(epoch from v_window),
        'score',case when v_creator then m.creator_score+1 else m.opponent_score+1 end))
      on conflict(match_id,player_id,event_type) do nothing;
    end if;
  elsif (select count(*) from public.duel_answer_attempts where match_id=m.id and player_id=v_id and not is_correct)>=12 then
    insert into public.duel_anti_cheat_flags(match_id,player_id,event_type,details)
    values(m.id,v_id,'excessive_wrong_answers',jsonb_build_object('threshold',12))
    on conflict(match_id,player_id,event_type) do nothing;
  end if;
  return v_ok;
end $function$;
