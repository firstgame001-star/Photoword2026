"""A full restart clears visible progress and persistent queues on mobile devices."""
import ast,json,urllib.parse,time
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
BASE='https://firstgame001-star.github.io/Photoword2026/'
OUT=Path('test-results/full-reset');OUT.mkdir(parents=True,exist_ok=True)
tree=ast.parse(Path('scripts/test-live-entries.py').read_text())
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in {'auth_fragment','install_mock','relevant_errors'}],type_ignores=[]),'<helpers>','exec'))
catalog=json.loads(Path('server/achievements/catalog.json').read_text())
with sync_playwright() as pw:
 for engine in ['chromium','webkit']:
  browser=getattr(pw,engine).launch()
  for language in ['ru','en','az']:
   ctx=browser.new_context(viewport={'width':320 if language=='az' else 390,'height':820},is_mobile=True,has_touch=True)
   # Seed only on the first page; language selection is intentionally required after reset.
   ctx.add_init_script('if(!sessionStorage.getItem("test.seeded")){localStorage.setItem("pw.language",'+json.dumps(language)+');sessionStorage.setItem("test.seeded","1")}')
   account={'photoword_id':'RESET-TEST','first_name':'Test','last_name':'','username':None,'game_nickname':'ResetNick','nickname_changed':True,'coins':999,'xp':900,'completed_levels':50,'current_level':51,'current_chapter':3,'rank':1,'avatar_frame':'bronze','progress_generation':0,'daily_streak':7,'last_daily_reward':'2026-10-02','_daily_solved':True,'_daily_attempts':1,'_theme_completed':['sport:1'],'_challenge_energy':0}
   install_mock(ctx,account,set(range(1,51)),language)
   def achievements(route):
    if route.request.method=='OPTIONS':route.fulfill(status=204,headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type'});return
    b=json.loads(route.request.post_data);n=account['completed_levels']
    items=[{**c,'title':c['title'][b['language']],'description':c['description'][b['language']],'progress':min(c['target'],n if c['metric']=='main' else 0),'unlocked':c['metric']=='main' and n>=c['target'],'claimed':False} for c in catalog]
    frames=[{'id':id,'unlocked':n>=goal,'progress':min(n,goal),'target':goal,'description':conditions} for id,goal,conditions in [('bronze',10,'10'),('silver',50,'50'),('gold',150,'150'),('diamond',500,'500')]]+[{'id':id,'unlocked':False,'progress':0,'target':50,'description':'50'} for id in ['scholar','duelist','champion','flame','cosmos','collector']]
    route.fulfill(status=200,content_type='application/json',body=json.dumps({'items':items,'frames':frames,'avatar_frame':account['avatar_frame'],'coins':account['coins']}),headers={'Access-Control-Allow-Origin':'*'})
   ctx.route('**/functions/v1/achievements',achievements)
   page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(BASE+'clean/#'+auth_fragment(),wait_until='domcontentloaded',timeout=45000);expect(page.locator('[data-coins]').first).to_have_text('999');expect(page.locator('#avatar')).to_have_attribute('data-frame','bronze')
   page.evaluate('''() => {localStorage.setItem('pw.daily.pending.RESET-TEST','old');localStorage.setItem('pw.challenge.pendingFinish.r117.RESET-TEST','old');localStorage.setItem('pw.themeProgress.sport','[1]');sessionStorage.setItem('pw.hints.main.1','old')}''')
   page.locator('#settingsBtn').tap();page.locator('#resetProgressBtn').tap();expect(page.locator('#resetBody')).to_contain_text('250');expect(page.locator('#resetBody')).to_contain_text('5/5');page.screenshot(path=str(OUT/(engine+'-'+language+'-confirmation.png')))
   page.locator('#confirmReset').tap();assert account['progress_generation']==0;page.locator('#confirmReset').tap()
   expect(page.locator('#languageModal')).to_be_visible(timeout=10000);expect(page.locator('#languageClose')).to_be_hidden();expect(page.locator('[data-coins]').first).to_have_text('250')
   assert account['xp']==0 and account['completed_levels']==0 and account['game_nickname'] is None and account['progress_generation']==1
   assert page.evaluate("localStorage.getItem('pw.daily.pending.RESET-TEST')") is None
   assert page.evaluate("localStorage.getItem('pw.challenge.pendingFinish.r117.RESET-TEST')") is None
   assert page.evaluate("JSON.parse(localStorage.getItem('pw.themeProgress.sport') || '[]')") == []
   assert page.evaluate("sessionStorage.getItem('pw.hints.main.1')") is None
   expect(page.locator('#avatar')).not_to_have_attribute('data-frame','bronze')
   page.locator('[data-language='+language+']').tap();expect(page.locator('#rulesWelcomeModal')).to_be_visible();page.locator('#rulesWelcomeRead').tap();expect(page.locator('#rulesBody .rule-section')).to_have_count(8);page.locator('#rulesDone').tap()
   page.locator('#achievementsEntry').tap();expect(page.locator('.achievement-card')).to_have_count(len(catalog));expect(page.locator('.achievement-card.unlocked')).to_have_count(0);page.locator('#achievementsHome').tap()
   page.locator('#profileBtn').tap();page.locator('#profileFrames').tap();expect(page.locator('.frame-card')).to_have_count(10);expect(page.locator('.frame-card.unlocked')).to_have_count(0);expect(page.locator('#framesCount')).to_have_text('0 / 10');page.screenshot(path=str(OUT/(engine+'-'+language+'-frames.png')))
   # A second device detects an externally reset epoch and clears its stale cached data.
   page.locator('#framesBack').tap();page.evaluate("localStorage.setItem('pw.daily.pending.RESET-TEST','old-second-device')");account['progress_generation']=2
   page.evaluate('void window.PW.login(true)');expect(page.locator('#languageModal')).to_be_visible(timeout=10000);assert page.evaluate("localStorage.getItem('pw.daily.pending.RESET-TEST')") is None
   assert not relevant_errors(errors),errors;ctx.close()
  browser.close()
print('PASS: full reset, 250 coins, no achievements/frames, storage/queues cleared, fresh language/rules and other-device reset detection; RU/EN/AZ, Chromium/WebKit.')
