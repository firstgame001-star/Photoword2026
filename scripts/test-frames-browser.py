"""Mobile frame previews, server selection, denied unlocks and persisted appearance."""
import ast,json,urllib.parse,time
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
BASE='https://firstgame001-star.github.io/Photoword2026/'
OUT=Path('test-results/frames');OUT.mkdir(parents=True,exist_ok=True)
tree=ast.parse(Path('scripts/test-live-entries.py').read_text())
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in {'auth_fragment','install_mock','relevant_errors'}],type_ignores=[]),'<helpers>','exec'))
ids=['bronze','silver','gold','diamond','scholar','duelist','champion','flame','cosmos','collector']
conditions={'ru':'Отгадать 10 слов','en':'Solve 10 words','az':'10 söz tap'}
with sync_playwright() as pw:
 for engine in ['chromium','webkit']:
  browser=getattr(pw,engine).launch()
  for lang in ['ru','en','az']:
   ctx=browser.new_context(viewport={'width':320 if lang=='az' else 390,'height':820},is_mobile=True,has_touch=True)
   ctx.add_init_script('localStorage.setItem("pw.language",'+json.dumps(lang)+');')
   account={'photoword_id':'FRAME-TEST','first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':1000,'xp':150,'completed_levels':10,'current_level':11,'rank':1,'avatar_frame':None,'daily_streak':0,'last_daily_reward':None}
   install_mock(ctx,account,set(range(1,11)),lang)
   state={'calls':[],'lose':False}
   def mock(route):
    if route.request.method=='OPTIONS':route.fulfill(status=204,headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type'});return
    b=json.loads(route.request.post_data)
    if b['action']=='equip':
     state['calls'].append(b['frame']);assert b['frame'] in [None,'bronze'],'Locked frame sent to server';account['avatar_frame']=b['frame']
     if state['lose']:state['lose']=False;route.abort('failed');return
    frames=[{'id':id,'unlocked':id=='bronze','progress':10 if id=='bronze' else 0,'target':10 if id=='bronze' else 50,'description':conditions[b['language']] if id=='bronze' else {'ru':'Выполни достижение','en':'Complete the achievement','az':'Nailiyyəti tamamla'}[b['language']]} for id in ids]
    route.fulfill(status=200,content_type='application/json',body=json.dumps({'items':[],'coins':1000,'frames':frames,'avatar_frame':account['avatar_frame']}),headers={'Access-Control-Allow-Origin':'*'})
   ctx.route('**/functions/v1/achievements',mock)
   ctx.route('**/rest/v1/rpc/get_avatar_frames',lambda route:route.fulfill(status=200,content_type='application/json',body=json.dumps({'FRAME-TEST':account['avatar_frame']}),headers={'Access-Control-Allow-Origin':'*'}))
   page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(BASE+'clean/#'+auth_fragment(),wait_until='domcontentloaded',timeout=45000)
   page.locator('#profileBtn').tap();page.locator('#profileFrames').tap();expect(page.locator('#framesTitle')).to_have_text({'ru':'Оформление','en':'Appearance','az':'Görünüş'}[lang]);expect(page.locator('.frame-card')).to_have_count(10);expect(page.locator('#framesStatus')).to_have_text('')
   page.locator('[data-frame-id=diamond]').tap();expect(page.locator('#framePreview')).to_have_attribute('data-frame','diamond');expect(page.locator('#framesEquip')).to_be_disabled();assert state['calls']==[]
   page.screenshot(path=str(OUT/(engine+'-'+lang+'-locked.png')))
   page.locator('[data-frame-id=bronze]').tap();expect(page.locator('#framesEquip')).to_be_enabled();page.locator('#framesEquip').tap();expect(page.locator('#avatar')).to_have_attribute('data-frame','bronze');expect(page.locator('#framesEquip')).to_be_disabled();assert account['coins']==1000
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   page.screenshot(path=str(OUT/(engine+'-'+lang+'-collection.png')))
   page.locator('#framesBack').tap();page.locator('#ratingShortcut').tap();expect(page.locator('[data-player-code=FRAME-TEST]')).to_have_attribute('data-frame','bronze');page.locator('#ratingBack').tap()
   page.reload(wait_until='domcontentloaded');expect(page.locator('#avatar')).to_have_attribute('data-frame','bronze');page.locator('#profileBtn').tap();expect(page.locator('#profileAvatar')).to_have_attribute('data-frame','bronze');page.screenshot(path=str(OUT/(engine+'-'+lang+'-profile.png')))
   page.locator('#profileFrames').tap();expect(page.locator('#framesStatus')).to_have_text('');page.locator('#framesNone').tap();page.locator('#framesEquip').tap();expect(page.locator('#avatar')).not_to_have_attribute('data-frame','bronze');assert account['avatar_frame'] is None
   # Server accepted choice but response was lost: retry/reopen reconciles selection.
   page.locator('[data-frame-id=bronze]').tap();state['lose']=True;page.locator('#framesEquip').tap();expect(page.locator('#framesStatus')).to_contain_text({'ru':'Не удалось','en':'Could not','az':'olmadı'}[lang]);assert account['avatar_frame']=='bronze'
   page.locator('#framesBack').tap();page.locator('#profileBtn').tap();page.locator('#profileFrames').tap();expect(page.locator('#avatar')).to_have_attribute('data-frame','bronze');expect(page.locator('#framesEquip')).to_be_disabled()
   assert not relevant_errors(errors),errors
   ctx.close()
  browser.close()
print('PASS: 10 frames, RU/EN/AZ, mobile previews, locked goals, equip/remove, reload and lost-response recovery, Chromium and WebKit.')
