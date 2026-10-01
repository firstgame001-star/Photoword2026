"""Published achievements UI with mocked signed Telegram and server replies."""
import ast,json,re,time,urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
BASE='https://firstgame001-star.github.io/Photoword2026/'
OUT=Path('test-results/achievements');OUT.mkdir(parents=True,exist_ok=True)
tree=ast.parse(Path('scripts/test-live-entries.py').read_text())
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in {'auth_fragment','install_mock','relevant_errors'}],type_ignores=[]),'<helpers>','exec'))
catalog=json.loads(Path('server/achievements/catalog.json').read_text())

def setup(browser,language,lose=False):
 ctx=browser.new_context(viewport={'width':320 if language=='az' else 390,'height':800},is_mobile=True,has_touch=True)
 ctx.add_init_script('localStorage.setItem("pw.language",'+json.dumps(language)+');')
 account={'photoword_id':'ACH-TEST','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':1000,'xp':150,'completed_levels':10,'current_level':11,'rank':1,'daily_streak':0,'last_daily_reward':None}
 install_mock(ctx,account,set(range(1,11)),language)
 state={'claimed':set(),'claim_calls':[],'lose':lose}
 def items(lang):
  metrics={'main':10,'nohint':9,'daily_total':1,'daily_first':1,'daily_streak':1}
  result=[]
  for c in catalog:
   n=min(c['target'],metrics.get(c['metric'],0));result.append({**c,'title':c['title'][lang],'description':c['description'][lang],'progress':n,'unlocked':n>=c['target'],'claimed':c['id'] in state['claimed']})
  return result
 def mock(route):
  if route.request.method=='OPTIONS':route.fulfill(status=204,headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type'});return
  b=json.loads(route.request.post_data);reward=0
  if b['action']=='claim':
   id=b['achievement'];state['claim_calls'].append(id)
   assert next(i for i in items(b['language']) if i['id']==id)['unlocked']
   if id not in state['claimed']:
    state['claimed'].add(id);reward=next(c['reward_coins'] for c in catalog if c['id']==id);account['coins']+=reward
   if state['lose']:state['lose']=False;route.abort('failed');return
  route.fulfill(status=200,content_type='application/json',body=json.dumps({'items':items(b['language']),'coins':account['coins'],'reward_coins':reward,'duplicate':reward==0}),headers={'Access-Control-Allow-Origin':'*'})
 ctx.route('**/functions/v1/achievements',mock)
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'clean/#'+auth_fragment(),wait_until='domcontentloaded',timeout=45000)
 page.locator('#achievementsEntry').tap();expect(page.locator('.achievement-card')).to_have_count(66)
 return ctx,page,state,account,errors

with sync_playwright() as pw:
 for engine in ['chromium','webkit']:
  browser=getattr(pw,engine).launch()
  for lang in ['ru','en','az']:
   ctx,page,state,account,errors=setup(browser,lang)
   expect(page.locator('#achievementsTitle')).to_have_text({'ru':'Достижения','en':'Achievements','az':'Nailiyyətlər'}[lang])
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   assert page.locator('.achievement-card').first.locator('.achievement-claim').is_enabled()
   # First completion and the goal 50 remain independent tiers.
   expect(page.locator('.achievement-card').nth(1).locator('.achievement-foot small')).to_have_text('10 / 50')
   page.screenshot(path=str(OUT/(engine+'-'+lang+'.png')))
   page.locator('.achievement-card').first.locator('.achievement-claim').tap();expect(page.locator('[data-coins]').first).to_have_text('1015');expect(page.locator('.achievement-card').first.locator('.achievement-claim')).to_be_disabled()
   page.locator('#achievementsFilters button').nth(1).tap();expect(page.locator('.achievement-card')).to_have_count(3)
   page.locator('#achievementsFilters button').nth(3).tap();expect(page.locator('.achievement-card')).to_have_count(16)
   page.locator('#achievementsHome').tap();page.locator('#profileBtn').tap();expect(page.locator('#profileAchievementBadges span')).to_have_count(4);page.locator('#profileAchievements').tap();expect(page.locator('#profileModal')).to_be_hidden();expect(page.locator('.achievement-card')).to_have_count(66)
   assert not relevant_errors(errors),errors;ctx.close()
  ctx,page,state,account,errors=setup(browser,'en',True)
  page.locator('.achievement-card').first.locator('.achievement-claim').tap();expect(page.locator('#achievementsStatus')).not_to_be_empty();assert account['coins']==1015
  page.locator('.achievement-card').first.locator('.achievement-claim').tap();expect(page.locator('.achievement-card').first.locator('.achievement-claim')).to_be_disabled();expect(page.locator('[data-coins]').first).to_have_text('1015');assert state['claim_calls']==['main_10','main_10']
  page.reload(wait_until='domcontentloaded');page.locator('#achievementsEntry').tap();expect(page.locator('.achievement-card').first.locator('.achievement-claim')).to_be_disabled();assert account['coins']==1015
  assert not relevant_errors(errors),errors;ctx.close();browser.close()
print('PASS: 66 achievements, RU/EN/AZ, narrow mobile layout, category filters, badges, reward claiming and lost-response retry in Chromium and WebKit.')
