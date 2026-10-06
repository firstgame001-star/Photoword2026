create or replace function public.refresh_challenge_energy_server(p_player_id uuid)
returns public.challenge_profiles language plpgsql set search_path='' as $$
declare p public.challenge_profiles; t timestamptz:=clock_timestamp(); gain integer;
begin
 perform 1 from public.players where id=p_player_id for update;
 if not found then raise exception 'player_not_found'; end if;
 insert into public.challenge_profiles(player_id) values(p_player_id) on conflict do nothing;
 select * into p from public.challenge_profiles where player_id=p_player_id for update;
 if p.limited_energy<5 then
  gain:=greatest(0,floor(extract(epoch from (t-p.energy_ref_at))/1800)::integer);
  if gain>0 then
   p.limited_energy:=least(5,p.limited_energy+gain);
   p.energy_ref_at:=case when p.limited_energy>=5 then t else p.energy_ref_at+gain*interval '30 minutes' end;
   update public.challenge_profiles set limited_energy=p.limited_energy,energy_ref_at=p.energy_ref_at,updated_at=t where player_id=p_player_id returning * into p;
  end if;
 end if;
 return p;
end $$;
revoke all on function public.refresh_challenge_energy_server(uuid) from public,anon,authenticated;
grant execute on function public.refresh_challenge_energy_server(uuid) to service_role;
create or replace function public.start_challenge_run_atomic_server(p_telegram_id bigint,p_mode text,p_language text,p_generation integer,p_initial_seen integer[] default '{}')
returns jsonb language plpgsql set search_path='' as $$
declare p public.players; e public.challenge_profiles; r uuid; q integer[]; t timestamptz:=clock_timestamp();
begin
 if p_mode is null or p_mode not in ('limited','nohint','blitz') or p_language is null or p_language not in ('ru','en','az') then raise exception 'bad_mode'; end if;
 select * into p from public.players where telegram_id=p_telegram_id for update;
 if p.id is null then raise exception 'player_not_found'; end if;
 if p_generation is distinct from p.progress_generation then raise exception 'progress_reset'; end if;
 e:=public.refresh_challenge_energy_server(p.id);
 if p_mode='limited' then
  if e.limited_energy<=0 then raise exception 'challenge_no_energy'; end if;
  update public.challenge_profiles set limited_energy=limited_energy-1,energy_ref_at=case when limited_energy>=5 then t else energy_ref_at end,updated_at=t where player_id=p.id;
 end if;
 insert into public.challenge_runs(player_id,mode,language) values(p.id,p_mode,p_language) returning id into r;
 q:=public.reserve_challenge_questions(p_telegram_id,r,p_mode,p_initial_seen);
 if coalesce(cardinality(q),0)=0 then raise exception 'questions_failed'; end if;
 return jsonb_build_object('run_id',r,'question_ids',q);
end $$;
revoke all on function public.start_challenge_run_atomic_server(bigint,text,text,integer,integer[]) from public,anon,authenticated;
grant execute on function public.start_challenge_run_atomic_server(bigint,text,text,integer,integer[]) to service_role;

CREATE OR REPLACE FUNCTION public.credit_challenge_energy_purchase_server(p_telegram_id bigint, p_charge_id text, p_payload text, p_stars integer, p_energy integer)
 RETURNS challenge_profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_player public.players;
  v_profile public.challenge_profiles;
  v_now timestamptz := now();
  v_energy integer;
  v_ref timestamptz;
  v_gain integer;
begin
  if not ((p_stars,p_energy) in ((15,1),(50,5))) then
    raise exception 'bad_energy_pack';
  end if;
  if p_charge_id is null or length(p_charge_id)<3 or p_payload is null or length(p_payload)<10 then
    raise exception 'bad_payment';
  end if;

  select * into v_player from public.players where telegram_id=p_telegram_id for update;
  if v_player.id is null then raise exception 'player_not_found'; end if;

  select * into v_profile from public.challenge_profiles where player_id=v_player.id for update;
  if v_profile.player_id is null then
    insert into public.challenge_profiles(player_id) values(v_player.id) returning * into v_profile;
  end if;

  v_energy := coalesce(v_profile.limited_energy,5);
  v_ref := coalesce(v_profile.energy_ref_at,v_now);
  if v_energy < 5 then
    v_gain := floor(extract(epoch from (v_now-v_ref))/1800);
    if v_gain > 0 then
      v_energy := least(5,v_energy+v_gain);
      v_ref := case when v_energy>=5 then v_now else v_ref+(v_gain*interval '30 minutes') end;
    end if;
  end if;


  insert into public.challenge_energy_purchases(
    player_id,telegram_payment_charge_id,invoice_payload,stars,energy_added
  )
  values(v_player.id,p_charge_id,p_payload,p_stars,p_energy)
  on conflict(telegram_payment_charge_id) do nothing;

  if not found then
    return v_profile;
  end if;

  if p_energy=5 then
    v_energy := 5;
  else
    v_energy := least(5,v_energy+1);
  end if;

  update public.challenge_profiles
  set limited_energy=v_energy,
      energy_ref_at=case when v_energy>=5 then v_now else v_ref end,
      updated_at=v_now
  where player_id=v_player.id
  returning * into v_profile;

  return v_profile;
end;
$function$

