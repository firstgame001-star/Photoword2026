begin;
insert into public.players(telegram_id,photoword_id,first_name,coins) values(-911400001,'FRAME-TEST-A','Frame A',1000),(-911400002,'FRAME-TEST-B','Frame B',1000);
do $$
declare actor uuid; s jsonb; f jsonb;
begin
 select id into actor from public.players where telegram_id=-911400001;
 s:=public.avatar_frame_state(-911400001,'ru');if jsonb_array_length(s->'frames')<>10 then raise exception 'frame count';end if;
 if exists(select 1 from jsonb_array_elements(s->'frames') x where (x->>'unlocked')::boolean) then raise exception 'new account unlock';end if;
 begin perform public.avatar_frame_equip(-911400001,'ru','bronze');raise exception 'locked frame accepted';exception when others then if sqlerrm<>'frame_locked' then raise;end if;end;
 begin perform public.avatar_frame_equip(-911400001,'ru','fake');raise exception 'unknown frame accepted';exception when others then if sqlerrm<>'frame_locked' then raise;end if;end;
 insert into public.achievement_levels(player_id,mode,level_id,no_hint) select actor,'main',i,true from generate_series(1,10)i;
 s:=public.avatar_frame_equip(-911400001,'en','bronze');if s->>'avatar_frame'<>'bronze' then raise exception 'equip failed';end if;
 if (select coins from public.players where id=actor)<>1000 then raise exception 'equip changed economy';end if;
 if public.get_avatar_frames(array['FRAME-TEST-A','FRAME-TEST-B'])->>'FRAME-TEST-A'<>'bronze' then raise exception 'public rendering';end if;
 if (public.avatar_frame_state(-911400002,'az')->>'avatar_frame') is not null then raise exception 'account isolation';end if;
 perform public.reset_game_progress_server(-911400001);
 s:=public.avatar_frame_state(-911400001,'az');if s->>'avatar_frame'<>'bronze' then raise exception 'reset removed selection';end if;
 perform public.avatar_frame_equip(-911400001,'az','bronze');
 s:=public.avatar_frame_equip(-911400001,'ru',null);if s->>'avatar_frame' is not null then raise exception 'remove failed';end if;
 if public.get_avatar_frames(array['FRAME-TEST-A'])<>'{}'::jsonb then raise exception 'removed frame public';end if;
 -- All previously unlocked achievements open their frames without claiming coin rewards.
 insert into public.player_achievements(player_id,achievement_id) select actor,achievement_id from public.avatar_frame_catalog on conflict do nothing;
 s:=public.avatar_frame_state(-911400001,'ru');if (select count(*) from jsonb_array_elements(s->'frames') x where (x->>'unlocked')::boolean)<>10 then raise exception 'legacy unlocks';end if;
 for f in select * from jsonb_array_elements(s->'frames') loop perform public.avatar_frame_equip(-911400001,'ru',f->>'id');end loop;
 if has_function_privilege('anon','public.avatar_frame_equip(bigint,text,text)','execute') or has_function_privilege('authenticated','public.avatar_frame_state(bigint,text)','execute') or has_table_privilege('anon','public.avatar_frame_catalog','select') then raise exception 'private frame permissions';end if;
end $$;
rollback;
