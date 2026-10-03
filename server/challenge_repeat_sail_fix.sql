-- Restore the completed-main-level exclusion for challenge question 166.
-- Identifiers only: answer keys remain private.
begin;
update public.challenge_question_catalog
set main_ids=array(select distinct n from unnest(main_ids||array[538]) n order by n)
where question_id=166;
do $$ begin
 if not exists(select 1 from public.challenge_question_catalog where question_id=166 and 538=any(main_ids)) then
  raise exception 'Missing challenge exclusion for main level 538';
 end if;
end $$;
commit;
