"""Published Blitz UI with the server answer contract; real accounts are untouched."""
import ast, json, time, re, urllib.parse, uuid
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE='https://firstgame001-star.github.io/Photoword2026/'
tree=ast.parse(Path('scripts/test-live-entries.py').read_text())
needed={'auth_fragment','install_mock','parse_json_array_after','current_challenge_answer','tap_challenge_word','relevant_errors'}
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in needed],type_ignores=[]),'<smoke-helpers>','exec'))
CHALLENGE_BANK=parse_json_array_after(Path('clean/challenge.js').read_text(),'const Q=')+parse_json_array_after(Path('clean/challenge-bank-extra.js').read_text(),'window.PW_CHALLENGE_EXTRA=')
CHALLENGE_BY_PHOTOS={tuple(q['p']):q for q in CHALLENGE_BANK}
with sync_playwright() as p:
    browser=p.chromium.launch()
    for language in ['ru','en','az']:
        ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
        ctx.add_init_script('localStorage.setItem("pw.language",'+json.dumps(language)+');')
        account={'photoword_id':'BLITZ-TEST','first_name':'Test','coins':5000,'xp':300,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None}
        install_mock(ctx,account,set(range(1,21)),language)
        page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(BASE+'clean/#'+auth_fragment(),wait_until='domcontentloaded')
        page.locator('[data-challenge="blitz"]').tap();page.locator('#challengeStart').tap()
        word=current_challenge_answer(page,language)
        tap_challenge_word(page,word)
        expect(page.locator('#hudValue2')).to_have_text('1')
        run=account['_challenge_test_runs'][account['_challenge_run_id']]
        assert run['score']==1 and run['streak']==1
        page.wait_for_timeout(350)
        second=current_challenge_answer(page,language)
        letters=page.locator('#challengeLetters .letter').all_inner_texts()
        wrong=''.join(letters[:len(second)])
        if wrong==second: wrong=wrong[::-1]
        if wrong==second: wrong=''.join(letters[-len(second):])
        assert wrong!=second
        tap_challenge_word(page,wrong)
        expect(page.locator('#hudValue2')).to_have_text('1')
        deadline=time.monotonic()+5
        while run['mistakes']!=1 and time.monotonic()<deadline: page.wait_for_timeout(25)
        assert run['mistakes']==1 and run['score']==1 and run['streak']==0
        assert not relevant_errors(errors),errors
        ctx.close();print('PASS: published Blitz correct/wrong answer and score in '+language)
    browser.close()
