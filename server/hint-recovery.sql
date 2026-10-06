create table if not exists public.hint_requests (
 player_id uuid not null references public.players(id) on delete cascade,
 request_id uuid not null,
 generation integer not null,
 theme_id text,
 level_id integer not null,
 hint_type text not null,
 hint jsonb not null,
 created_at timestamptz not null default now(),
 primary key(player_id,request_id)
);
alter table public.hint_requests enable row level security;
revoke all on public.hint_requests from public,anon,authenticated;
grant all on public.hint_requests to service_role;
create or replace function public.purchase_hint_once_server(p_telegram_id bigint,p_request_id uuid,p_generation integer,p_theme_id text,p_level_id integer,p_hint_type text,p_cost integer,p_hint jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare p public.players; prior public.hint_requests;
begin
 select * into p from public.players where telegram_id=p_telegram_id for update;
 if not found then raise exception 'player_not_found';end if;
 if p.progress_generation<>p_generation then raise exception 'progress_reset';end if;
 select * into prior from public.hint_requests where player_id=p.id and request_id=p_request_id;
 if found then
  if prior.generation<>p_generation or prior.theme_id is distinct from p_theme_id or prior.level_id<>p_level_id or prior.hint_type<>p_hint_type then raise exception 'bad_hint';end if;
  return jsonb_build_object('player',to_jsonb(p),'hint',prior.hint);
 end if;
 if p_theme_id is null then
  p:=public.spend_hint_server(p_telegram_id,p_level_id,p_hint_type,p_cost);
 else
  p:=public.spend_theme_hint_server(p_telegram_id,p_theme_id,p_level_id,p_hint_type,p_cost);
 end if;
 insert into public.hint_requests(player_id,request_id,generation,theme_id,level_id,hint_type,hint) values(p.id,p_request_id,p_generation,p_theme_id,p_level_id,p_hint_type,p_hint);
 return jsonb_build_object('player',to_jsonb(p),'hint',p_hint);
end $$;
revoke all on function public.purchase_hint_once_server(bigint,uuid,integer,text,integer,text,integer,jsonb) from public,anon,authenticated;
grant execute on function public.purchase_hint_once_server(bigint,uuid,integer,text,integer,text,integer,jsonb) to service_role;
