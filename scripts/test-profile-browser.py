"""Profile rank progress, public puzzle/duel totals, and synced three-badge showcase."""
import ast,json,time,urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
BASE='https://firstgame001-star.github.io/Photoword2026/'
OUT=Path('test-results/profile');OUT.mkdir(parents=True,exist_ok=True)
tree=ast.parse(Path('scripts/test-live-entries.py').read_text())
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in {'auth_fragment','install_mock','relevant_errors'}],type_ignores=[]),'<helpers>','exec'))
catalog=json.loads(Path('server/achievements/catalog.json').read_text())
with sync_playwright() as pw:
 for engine in ['chromium','webkit']:
  browser=getattr(pw,engine).launch()
  for language in ['ru','en','az']:
   ctx=browser.new_context(viewport={'width':320 if language=='az' else 390,'height':820},is_mobile=True,has_touch=True)
   ctx.add_init_script('localStorage.setItem("pw.language",'+json.dumps(language)+')')
   account={'photoword_id':'PROFILE-TEST','first_name':'Player','last_name':'','username':None,'game_nickname':'Player','nickname_changed':True,'coins':250,'xp':390,'completed_levels':10,'current_level':11,'current_chapter':1,'rank':42,'avatar_frame':None,'progress_generation':0,'featured_achievements':[],'daily_streak':0,'last_daily_reward':None,'_profile_stats':{'theme_levels_completed':12,'themes_completed':0,'themes_total':12,'theme_counts':{},'daily':{'streak':5,'best_streak':8,'solved':17},'challenge':{'limited_best_score':2,'nohint_best_streak':3,'blitz_best_score':4,'blitz_best_streak':5,'runs_total':2,'reward_coins':10,'reward_xp':5}}}
   install_mock(ctx,account,set(range(1,11)),language)
   state={'lose':True,'saved':[],'save_calls':0}
   def unlocked_items(l):
    out=[]
    for c in catalog:
     n=10 if c['metric'] in ('main','nohint','daily_total') else 1 if c['metric']=='chapter_1' else 0
     out.append({**c,'title':c['title'][l],'description':c['description'][l],'progress':min(n,c['target']),'unlocked':n>=c['target'],'claimed':False})
    return out
   def ach(route):
    if route.request.method=='OPTIONS':route.fulfill(status=204,headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type'});return
    b=json.loads(route.request.post_data);assert b.get('progressGeneration')==0
    if b['action']=='showcase':
     state['save_calls']+=1;assert len(b['achievements'])<=3 and len(set(b['achievements']))==len(b['achievements'])
     assert all(next(a for a in unlocked_items(b['language']) if a['id']==i)['unlocked'] for i in b['achievements'])
     state['saved']=b['achievements'][:];account['featured_achievements']=state['saved']
     if state['lose']:state['lose']=False;route.abort('failed');return
    route.fulfill(status=200,content_type='application/json',body=json.dumps({'items':unlocked_items(b['language']),'coins':account['coins'],'featured_achievements':state['saved'],'frames':[],'avatar_frame':None,'progress_generation':0}),headers={'Access-Control-Allow-Origin':'*'})
   ctx.route('**/functions/v1/achievements',ach)
   def duel(route):
    if route.request.method=='OPTIONS':route.fulfill(status=204,headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type'});return
    b=json.loads(route.request.post_data);assert b['action']=='statistics';route.fulfill(status=200,content_type='application/json',body=json.dumps({'stats':{'played':7,'wins':4,'draws':1,'losses':2,'best_score':8,'net_coins':20,'history':[]}}),headers={'Access-Control-Allow-Origin':'*'})
   ctx.route('**/functions/v1/duel-game',duel)
   page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(BASE+'clean/#'+auth_fragment(),wait_until='domcontentloaded',timeout=45000);page.locator('#profileBtn').tap()
   expect(page.locator('#profileLeague')).to_have_text({'ru':'Новичок','en':'Novice','az':'Yeni başlayan'}[language]);expect(page.locator('#profileNextRank')).to_contain_text('10');expect(page.locator('#profileWins')).to_have_text('4');expect(page.locator('#profilePuzzleStreak')).to_have_text('5');expect(page.locator('#profileAchievementBadges .profile-badge')).to_have_count(3);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   page.screenshot(path=str(OUT/(engine+'-'+language+'.png')))
   page.locator('#profileFeaturedBtn').tap();expect(page.locator('.featured-option')).to_have_count(sum(a['unlocked'] for a in unlocked_items(language)));expect(page.locator('#featuredCount')).to_have_text('0 / 3')
   for i in range(3):page.locator('.featured-option').nth(i).tap()
   expect(page.locator('#featuredCount')).to_have_text('3 / 3');assert not page.locator('.featured-option').nth(3).is_enabled();page.locator('#featuredSave').tap();expect(page.locator('#featuredStatus')).to_contain_text({'ru':'Не удалось','en':'Could not','az':'təsdiqləmək olmadı'}[language]);assert state['saved']
   page.locator('#featuredSave').tap();expect(page.locator('#featuredModal')).to_be_hidden();expect(page.locator('#profileAchievementBadges .profile-badge.earned')).to_have_count(3)
   page.reload(wait_until='domcontentloaded');page.locator('#profileBtn').tap();expect(page.locator('#profileAchievementBadges .profile-badge.earned')).to_have_count(3);assert state['save_calls']==2
   assert not relevant_errors(errors),errors;ctx.close()
  browser.close()
print('PASS: rank thresholds, XP progress, duel wins, daily puzzle streak, three unlocked featured achievements, lost-response retry, persistence, narrow mobile RU/EN/AZ in Chromium/WebKit.')
