import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(path,'utf8');
const base=read('supabase/migrations/20261024180425_review_human_speed_bot_patterns.sql');
const calibration=read('supabase/migrations/20261024180640_calibrate_bot_behavior_interval_coverage.sql');
const extras=read('supabase/migrations/20261024180817_observe_main_theme_answer_behavior.sql');
const types=read('supabase/migrations/20261024181005_fix_behavior_capture_row_types.sql');
const transactional=read('scripts/test-bot-behavior.sql');

for(const name of ['challenge_answer_attempts','duel_answer_attempts'])
 assert(base.includes('ON public.'+name),'Missing '+name+' signal trigger');
for(const name of ['coin_transactions','main_level_answer_attempts','theme_level_answer_attempts'])
 assert(extras.includes('ON public.'+name),'Missing '+name+' signal trigger');
for(const source of ['main','theme','challenge','duel'])
 assert(extras.includes("'"+source+"'")||base.includes("'"+source+"'"),'Missing behavioral source '+source);
for(const c of ["v_n>=24","v_intervals>=18","v_cv<=0.085","v_n>=64","v_sessions>=5"])
 assert(base.includes(c),'Bot signal confidence gate missing: '+c);
assert(calibration.includes('v_intervals>=v_all_intervals*0.85'),'Irregular timing coverage safeguard missing');
assert(base.includes("'review_only',true"),'Signals must remain review-only');
assert(base.includes('ON DELETE CASCADE'),'Account deletion must clear telemetry');
for(const sql of [base,calibration,extras,types]){
 assert(sql.includes('REVOKE ALL ON FUNCTION'),'New anti-bot functions cannot be public');
 assert(!sql.includes("UPDATE public.players SET coins="),'Bot detection must never change player wallets');
 assert(!sql.includes("UPDATE public.duel_matches SET status="),'Bot detection must not decide winners');
}
assert(types.includes('v_correct:=true')&&types.includes('v_correct:=false'),'Main and theme outcomes must be captured correctly');
assert(types.includes('v_correct:=NEW.is_correct'),'Challenge and duel outcomes must be captured correctly');
assert(transactional.includes("ROLLBACK;"),'Live DB regression must roll back synthetic players');
assert(transactional.includes('ordinary varied human responses wrongly flagged'),'False positive regression missing');
assert(transactional.includes('70-answer multi-session perfection ignored'),'Long streak regression missing');
console.log('PASS: review-only human-speed bot signals cover all main/theme/challenge/duel answers; false-positive safeguards and isolated access retained.');
