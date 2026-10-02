begin;
do $$
declare a uuid;b uuid;p public.players;s jsonb;room_code text;old_run uuid;d date:=public.daily_puzzle_day(now());word text;
begin
 insert into public.players(telegram_id,photoword_id,coins,xp,current_level,completed_levels,game_nickname,nickname_changed,avatar_frame,daily_streak,last_daily_reward,notifications_enabled) values(-911500001,'RESET_A_'||gen_random_uuid(),999,900,51,50,'ResetTest',true,'bronze',7,current_date,true) returning id into a;
 insert into public.players(telegram_id,photoword_id,coins) values(-911500002,'RESET_B_'||gen_random_uuid(),500) returning id into b;
 insert into public.level_progress(player_id,level_id,completed,hints_used) values(a,1,true,1);
 insert into public.theme_progress(player_id,theme_id,level_id) values(a,'sport',1);
 insert into public.player_achievements(player_id,achievement_id,claimed_at) values(a,'main_10',now());
 insert into public.challenge_profiles(player_id,limited_energy,blitz_best_score) values(a,0,20);
 insert into public.challenge_runs(player_id,mode,score,streak,reward_coins,finished_at) values(a,'blitz',20,10,15,now()) returning id into old_run;
 insert into public.challenge_question_history(player_id,seen) values(a,array[1,2,3]);
 insert into public.daily_puzzle_progress(player_id,puzzle_day,question_id,attempts,solved) values(a,d,public.daily_puzzle_index(d),1,true);
 insert into public.daily_puzzle_submissions(player_id,request_id,puzzle_day,correct,reward_coins) values(a,gen_random_uuid(),d,true,25);
 insert into public.daily_rewards(player_id,reward_date,amount) values(a,current_date,5);
 insert into public.duel_matches(creator,opponent,stake,language,status,winner,creator_score,opponent_score,settled_at,created_at) values(a,b,25,'ru','finished',a,10,5,now(),now()-interval '1 day');
 if (public.duel_statistics(-911500001)->>'wins')::int<>1 then raise exception 'seed duel';end if;
 p:=public.reset_game_progress_server(-911500001,0);
 if p.coins<>250 or p.xp<>0 or p.completed_levels<>0 or p.current_level<>1 or p.current_chapter<>1 or p.progress_generation<>1 or p.avatar_frame is not null or p.game_nickname is not null or p.nickname_changed or p.daily_streak<>0 or p.last_daily_reward is not null or p.notifications_enabled then raise exception 'profile reset incomplete';end if;
 if exists(select 1 from public.level_progress where player_id=a) or exists(select 1 from public.theme_progress where player_id=a) or exists(select 1 from public.achievement_levels where player_id=a) or exists(select 1 from public.player_achievements where player_id=a) or exists(select 1 from public.challenge_runs where player_id=a) or exists(select 1 from public.challenge_profiles where player_id=a) or exists(select 1 from public.challenge_question_history where player_id=a) or exists(select 1 from public.daily_puzzle_progress where player_id=a) or exists(select 1 from public.daily_puzzle_submissions where player_id=a) or exists(select 1 from public.daily_rewards where player_id=a) then raise exception 'old gameplay retained';end if;
 s:=public.avatar_frame_state(-911500001,'ru');if exists(select 1 from jsonb_array_elements(s->'frames')f where (f->>'unlocked')::boolean) then raise exception 'frames reopened';end if;
 s:=public.achievement_metrics(a);if exists(select 1 from jsonb_each_text(s)metric where metric.value::int<>0) then raise exception 'metrics retained';end if;
 s:=public.duel_statistics(-911500001);if (s->>'played')::int<>0 or jsonb_array_length(s->'history')<>0 then raise exception 'duel history retained';end if;
 s:=public.duel_statistics(-911500002);if (s->>'played')::int<>1 then raise exception 'opponent history destroyed';end if;
 if (select coins from public.players where id=b)<>500 then raise exception 'opponent coins changed';end if;
 if (public.daily_puzzle_state(-911500001,'en')->>'attempts_left')::int<>3 then raise exception 'daily not reopened';end if;
 select ru into word from public.daily_puzzle_questions where id=public.daily_puzzle_index(d);
 begin perform public.daily_puzzle_answer_epoch(-911500001,d,'ru',word,gen_random_uuid(),0);raise exception 'stale daily accepted';exception when others then if sqlerrm<>'daily_reset' then raise;end if;end;
 begin perform public.finish_challenge_run_server(-911500001,old_run,'blitz',20,10);raise exception 'stale run accepted';exception when others then if sqlerrm<>'run_not_found' then raise;end if;end;
 -- A lost reset response retried with its old epoch cannot erase new progress.
 perform public.complete_level_server(-911500001,1);
 p:=public.reset_game_progress_server(-911500001,0);if p.progress_generation<>1 or p.completed_levels<>1 or p.coins<>270 then raise exception 'duplicate reset erased progress';end if;
 -- Progress/achievements can be earned again in the new game, with duplicate claims still blocked.
 insert into public.level_progress(player_id,level_id,completed) select a,i,true from generate_series(2,10)i;
 s:=public.achievement_claim(-911500001,'main_10','ru');if (s->>'reward_coins')::int<>15 then raise exception 'new achievement reward';end if;
 s:=public.achievement_claim(-911500001,'main_10','ru');if (s->>'reward_coins')::int<>0 then raise exception 'duplicate new reward';end if;
 -- Waiting invites are cancelled; active matches cannot be reset halfway through.
 room_code:=public.duel_create(-911500001,25,'ru');p:=public.reset_game_progress_server(-911500001,1);if p.coins<>250 or p.progress_generation<>2 or (select status from public.duel_matches where duel_matches.code=room_code)<>'cancelled' then raise exception 'waiting duel not cancelled';end if;
 room_code:=public.duel_create(-911500001,25,'ru');perform public.duel_join_localized(-911500002,room_code,'en');
 begin perform public.reset_game_progress_server(-911500001,2);raise exception 'active duel reset';exception when others then if sqlerrm<>'reset_duel_active' then raise;end if;end;
 if (select progress_generation from public.players where id=a)<>2 then raise exception 'failed reset mutated generation';end if;
 if has_function_privilege('anon','public.reset_game_progress_server(bigint,integer)','execute') then raise exception 'public reset';end if;
end $$;
rollback;
