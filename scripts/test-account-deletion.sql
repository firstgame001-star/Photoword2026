begin;
do $$
declare a uuid;b uuid;c text;
begin
 insert into public.players(telegram_id,photoword_id,coins) values(-911180201,'DELETE_QA_'||gen_random_uuid(),1000) returning id into a;
 insert into public.players(telegram_id,photoword_id,coins) values(-911180202,'SURVIVOR_QA_'||gen_random_uuid(),1000) returning id into b;
 insert into public.support_tickets(telegram_id,player_id,message) values(-911180201,a,'synthetic deletion check');
 insert into public.bot_support_sessions(telegram_id,active) values(-911180201,true);
 insert into public.game_events(player_id,event_name,language) values(a,'app_open','ru');
 c:=public.duel_create(-911180201,25,'ru');perform public.duel_join_localized(-911180202,c,'en');
 perform public.erase_player_account_server(-911180201);
 if exists(select 1 from public.players where id=a) or exists(select 1 from public.support_tickets where telegram_id=-911180201) or exists(select 1 from public.bot_support_sessions where telegram_id=-911180201) or exists(select 1 from public.game_events where player_id=a) then raise exception 'deletion incomplete';end if;
 if (select coins from public.players where id=b)<>1000 then raise exception 'opponent lost stake';end if;
 perform public.erase_player_account_server(-911180201);
 if (select coins from public.players where id=b)<>1000 then raise exception 'double refund';end if;
 if has_function_privilege('anon','public.erase_player_account_server(bigint)','execute') then raise exception 'public deletion access';end if;
end $$;
rollback;
