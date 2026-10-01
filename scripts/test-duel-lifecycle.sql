begin;
do $$
declare a uuid;b uuid;c uuid;v_code text;prev text;mid uuid;old_ids integer[];new_ids integer[];v_ru text;v_en text;snap jsonb;
begin
 insert into public.players(telegram_id,photoword_id,coins) values(-911180001,'DUEL_A_'||gen_random_uuid(),1000) returning id into a;
 insert into public.players(telegram_id,photoword_id,coins) values(-911180002,'DUEL_B_'||gen_random_uuid(),1000) returning id into b;
 insert into public.players(telegram_id,photoword_id,coins) values(-911180003,'DUEL_C_'||gen_random_uuid(),1000) returning id into c;
 -- Cancellation and duplicate cancellation.
 v_code:=public.duel_create(-911180001,25,'ru');
 if (select coins from public.players where id=a)<>975 then raise exception 'stake not held';end if;
 perform public.duel_cancel(-911180001,v_code);
 begin perform public.duel_cancel(-911180001,v_code);raise exception 'duplicate cancel accepted';exception when others then if sqlerrm<>'duel_cannot_cancel' then raise;end if;end;
 if (select coins from public.players where id=a)<>1000 then raise exception 'cancel refund failure';end if;
 -- Expired invite settled twice, one refund.
 v_code:=public.duel_create(-911180001,25,'ru');
 update public.duel_matches set expires_at=clock_timestamp()-interval '1 second' where duel_matches.code=v_code returning id into mid;
 perform public.duel_settle_one(mid);perform public.duel_settle_one(mid);
 if (select coins from public.players where id=a)<>1000 then raise exception 'expiry refund failure';end if;
 -- Mixed languages, stake held once, duplicate joins/answers denied.
 v_code:=public.duel_create(-911180001,25,'ru');perform public.duel_join_localized(-911180002,v_code,'en');
 begin perform public.duel_join_localized(-911180002,v_code,'en');raise exception 'duplicate join accepted';exception when others then if sqlerrm<>'duel_not_waiting' then raise;end if;end;
 if (select coins from public.players where id=b)<>975 then raise exception 'duplicate stake charged';end if;
 if public.duel_snapshot(-911180003,v_code) is not null then raise exception 'outsider sees match';end if;
 begin perform public.duel_submit(-911180001,v_code,'X');raise exception 'early answer accepted';exception when others then if sqlerrm<>'duel_not_active' then raise;end if;end;
 update public.duel_matches set starts_at=clock_timestamp()-interval '1 second',ends_at=clock_timestamp()+interval '1 minute' where duel_matches.code=v_code returning id,question_ids into mid,old_ids;
 select answer_ru,answer_en into v_ru,v_en from public.duel_questions where id=old_ids[1];
 if not public.duel_submit(-911180001,v_code,v_ru) or not public.duel_submit(-911180002,v_code,v_en) then raise exception 'localized answer failed';end if;
 begin perform public.duel_submit(-911180001,v_code,v_ru);raise exception 'duplicate answer accepted';exception when others then if sqlerrm<>'duel_wait' then raise;end if;end;
 snap:=public.duel_snapshot(-911180001,v_code);
 if (snap->>'my_score')::integer<>1 or (snap->>'their_score')::integer<>1 or (snap->>'language')<>'ru' or (public.duel_snapshot(-911180002,v_code)->>'language')<>'en' then raise exception 'snapshot recovery failure';end if;
 -- Neither client needs to remain online for settlement.
 update public.duel_matches set ends_at=clock_timestamp()-interval '1 second' where id=mid;
 snap:=public.duel_snapshot(-911180002,v_code);perform public.duel_settle_one(mid);
 if snap->>'status'<>'finished' or not (snap->>'draw')::boolean or exists(select 1 from public.players where id in(a,b) and coins<>1000) then raise exception 'draw refund failure';end if;
 -- Private rematch, cooldown, winner payout, no duplicate settlement.
 prev:=v_code;v_code:=public.duel_rematch_localized(-911180001,prev,50,'az');
 begin perform public.duel_join_localized(-911180003,v_code,'en');raise exception 'outsider joined rematch';exception when others then if sqlerrm<>'duel_invitee_only' then raise;end if;end;
 perform public.duel_join_localized(-911180002,v_code,'en');
 select id,question_ids into mid,new_ids from public.duel_matches where duel_matches.code=v_code;
 if old_ids&&new_ids then raise exception 'rematch repeats prior questions';end if;
 update public.duel_matches set creator_score=2,opponent_score=0,starts_at=clock_timestamp()-interval '1 minute',ends_at=clock_timestamp()-interval '1 second' where id=mid;
 begin perform public.duel_submit(-911180001,v_code,'X');raise exception 'late answer accepted';exception when others then if sqlerrm<>'duel_not_active' then raise;end if;end;
 perform public.duel_settle_one(mid);perform public.duel_settle_one(mid);
 if (select coins from public.players where id=a)<>1040 or (select coins from public.players where id=b)<>950 then raise exception 'winner payout failure';end if;
 if (select count(*) from public.coin_transactions where player_id=a and transaction_type='duel_win' and description='Duel '||v_code)<>1 then raise exception 'duplicate payout ledger';end if;
 begin perform public.duel_rematch_localized(-911180003,v_code,25,'en');raise exception 'outsider created rematch';exception when others then if sqlerrm<>'duel_not_found' then raise;end if;end;
end $$;
rollback;
