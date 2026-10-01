"""Two isolated mobile browser contexts. API authentication is mocked;
question batches are captured from the live server in a rolled-back test.
No real Telegram account is used or changed.
"""
import ast,json,time,re,urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
BASE='https://firstgame001-star.github.io/Photoword2026/'
OUT=Path('test-results/two-devices');OUT.mkdir(parents=True,exist_ok=True)
# Reuse existing mock and UI helpers without executing the full smoke suite.
tree=ast.parse(Path('scripts/test-live-entries.py').read_text())
needed={'auth_fragment','install_mock','parse_json_array_after','current_challenge_answer','tap_challenge_word','relevant_errors'}
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in needed],type_ignores=[]),'<smoke-helpers>','exec'))
CHALLENGE_BANK=parse_json_array_after(Path('clean/challenge.js').read_text(),'const Q=')+parse_json_array_after(Path('clean/challenge-bank-extra.js').read_text(),'window.PW_CHALLENGE_EXTRA=')
CHALLENGE_BY_PHOTOS={tuple(q['p']):q for q in CHALLENGE_BANK}
batches=json.loads(Path('scripts/two-device-batches.json').read_text())
all_ids=sum(batches.values(),[])
assert len(all_ids)==30 and len(set(all_ids))==30
assert all(i>=100 and i not in (100,101) for i in all_ids)
account={'photoword_id':'PW-TWO-DEVICES','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':5000,'xp':1500,'completed_levels':100,'current_level':101,'rank':1,'daily_streak':0,'last_daily_reward':None}
errors=[];starts=[]

def phone(browser,width,language,keys):
    ctx=browser.new_context(viewport={'width':width,'height':800},has_touch=True,is_mobile=True)
    ctx.add_init_script('if(!localStorage.getItem("pw.language"))localStorage.setItem("pw.language",'+json.dumps(language)+');localStorage.setItem("phone-only-marker",'+json.dumps(language)+');')
    install_mock(ctx,account,set(range(1,101)),language)
    queue=list(keys)
    def challenge(route):
        body=json.loads(route.request.post_data or '{}')
        if body.get('action')!='start':route.fallback();return
        assert queue,'Unexpected extra start'
        key=queue.pop(0);ids=batches[key];starts.append((key,body['mode'],ids))
        energy=account.setdefault('_challenge_energy',5)
        if body['mode']=='limited':energy-=1;account['_challenge_energy']=energy
        account['_challenge_run_id']='00000000-0000-0000-0000-000000000099'
        state={'energy':energy,'energy_max':5,'next_energy_at':None,'limited_best_score':0,'nohint_best_streak':0,'blitz_best_score':0,'blitz_best_streak':0,'server_now':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'rewarded_runs_today':{'limited':0,'nohint':0,'blitz':0},'reward_limit':3,'run_id':account['_challenge_run_id'],'question_ids':ids}
        route.fulfill(status=200,content_type='application/json',body=json.dumps({'challenge':state}),headers={'Access-Control-Allow-Origin':'*'})
    ctx.route('**/functions/v1/challenge-game',challenge)
    page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'clean/#'+auth_fragment(),wait_until='domcontentloaded',timeout=45000)
    expect(page.locator('[data-coins]').first).to_have_text(str(account['coins']))
    return ctx,page

def start(page,mode,key,language):
    page.locator('[data-challenge="'+mode+'"]').tap();page.locator('#challengeStart').tap()
    expect(page.locator('#challengePhotos .photo')).to_have_count(4)
    expect(page.locator('#challengePhotos .photo').first).to_have_text(CHALLENGE_BANK[batches[key][0]]['p'][0])
    answer=current_challenge_answer(page,language)
    assert answer==CHALLENGE_BANK[batches[key][0]][language]
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    return answer

with sync_playwright() as pw:
    # Separate browser engines also guarantee independent cookies and storage.
    iphone=pw.webkit.launch();android=pw.chromium.launch()
    ctx_a,a=phone(iphone,390,'ru',['phone_a','phone_a_reload'])
    ctx_b,b=phone(android,412,'en',['phone_b'])
    assert a.evaluate('localStorage.getItem("phone-only-marker")')=='ru'
    assert b.evaluate('localStorage.getItem("phone-only-marker")')=='en'
    answer_a=start(a,'nohint','phone_a','ru')
    answer_b=start(b,'blitz','phone_b','en')
    assert tuple(a.locator('#challengePhotos .photo').all_inner_texts())!=tuple(b.locator('#challengePhotos .photo').all_inner_texts())
    tap_challenge_word(a,answer_a);expect(a.locator('#challengeCorrectPanel')).to_be_visible()
    a.locator('#challengeCorrectNext').tap()
    expect(a.locator('#challengePhotos .photo').first).to_have_text(CHALLENGE_BANK[batches['phone_a'][1]]['p'][0])
    assert current_challenge_answer(a,'ru')==CHALLENGE_BANK[batches['phone_a'][1]]['ru']
    b.locator('#blitzLetterHint').tap();expect(b.locator('#challengeSlots .slot.fixed')).to_have_count(1)
    expect(b.locator('[data-coins]').first).to_have_text('4925')
    a.screenshot(path=str(OUT/'iphone-ru.png'));b.screenshot(path=str(OUT/'android-en.png'))
    # Reopen A with a third language; B's language and puzzle remain independent.
    a.goto(BASE+'clean/#'+auth_fragment(),wait_until='domcontentloaded',timeout=45000)
    a.evaluate('localStorage.setItem("pw.language","az")');a.reload(wait_until='domcontentloaded')
    expect(a.locator('[data-coins]').first).to_have_text('4925')
    start(a,'limited','phone_a_reload','az')
    expect(a.locator('#hudValue3')).to_have_text('4/5')
    assert b.evaluate('localStorage.getItem("pw.language")')=='en'
    assert current_challenge_answer(b,'en')==answer_b
    a.screenshot(path=str(OUT/'iphone-az-reopened.png'))
    assert len(starts)==3 and not relevant_errors(errors),(starts,errors)
    ctx_a.close();ctx_b.close();iphone.close();android.close()
(OUT/'results.json').write_text(json.dumps({'passed':True,'checks':['isolated_storage','same_account','different_modes','different_languages','server_batches_disjoint','next_question_order','balance_after_reopen','energy_after_reopen','no_page_errors'],'starts':starts},ensure_ascii=False,indent=2))
print('PASS: two independent mobile sessions; shared account, distinct server batches, languages, reopen, balance and energy.')
