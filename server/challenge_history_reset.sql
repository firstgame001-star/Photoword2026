CREATE OR REPLACE FUNCTION public.reset_game_progress_server(p_telegram_id bigint)
 RETURNS public.players LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $function$
declare v public.players;
begin
 select * into v from public.players where telegram_id=p_telegram_id for update;
 if v.id is null then raise exception 'player_not_found'; end if;
 delete from public.level_progress where player_id=v.id;
 delete from public.theme_progress where player_id=v.id;
 insert into public.challenge_question_history(player_id) values(v.id) on conflict(player_id) do update set seen='{}',last_question=null,cycle=1,updated_at=now();
 update public.players set xp=0,current_chapter=1,current_level=1,completed_levels=0 where id=v.id returning * into v;
 return v;
end $function$;
