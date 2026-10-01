"""Published daily UI, mobile Chromium/WebKit, mocked Telegram/API only."""
import ast,json,re,time,urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
BASE='https://firstgame001-star.github.io/Photoword2026/'
OUT=Path('test-results/daily');OUT.mkdir(parents=True,exist_ok=True)
tree=ast.parse(Path('scripts/test-live-entries.py').read_text())
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in {'auth_fragment','install_mock','relevant_errors'}],type_ignores=[]),'<helpers>','exec'))
bank=json.loads(Path('server/daily-bank.json').read_text())

def setup(browser,lang,scenario,width):
 ctx=browser.new_context(viewport={'width':width,'height':800},is_mobile=True,has_touch=True)
 ctx.add_init_script('localStorage.setItem("pw.language",'+json.dumps(lang)+');')
 account={'photoword_id':'DAILY-'+lang+scenario,'first_name':'Test','last_name':'','username':None,'game_nickname':None,'nickname_changed':False,'coins':1000,'xp':300,'completed_levels':20,'current_level':21,'rank':1,'daily_streak':0,'last_daily_reward':None}
 install_mock(ctx,account,set(range(1,21)),lang)
 state={'day':'2026-10-02','question_id':1,'attempts':0,'solved':False,'receipts':{},'lose':scenario=='lost','ids':[]}
 def snapshot(language):
  q=bank[state['question_id']-1];word=q[language]
  return {'day':state['day'],'question_id':q['id'],'language':language,'photos':q['photos'],'letters':list(word)+list('XYZ'),'length':len(word),'attempts':state['attempts'],'attempts_left':3-state['attempts'],'solved':state['solved'],'closed':state['solved'] or state['attempts']>=3,'reward_coins':25,'server_now':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'reset_at':'2026-10-03T20:00:00Z'}
 def daily(route):
  body=json.loads(route.request.post_data or '{}');language=body.get('language','ru')
  if route.request.method=='OPTIONS':route.fulfill(status=204,headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type'});return
  result=None
  if body['action']=='answer':
   state['ids'].append(body['requestId']);result=state['receipts'].get(body['requestId'])
   if result is None:
    assert state['attempts']<3 and not state['solved'],'Fourth attempt or reward after victory'
    state['attempts']+=1;state['solved']=body['answer']==bank[state['question_id']-1][language]
    result={'correct':state['solved'],'reward_coins':25 if state['solved'] else 0};state['receipts'][body['requestId']]=result
    if state['solved']:account['coins']+=25
   if state['lose']:state['lose']=False;route.abort('failed');return
  data={'daily':snapshot(language),'coins':account['coins']}
  if result is not None:data['result']=result
  route.fulfill(status=200,content_type='application/json',body=json.dumps(data),headers={'Access-Control-Allow-Origin':'*'})
 ctx.route('**/functions/v1/daily-puzzle',daily)
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'clean/#'+auth_fragment(),wait_until='domcontentloaded',timeout=45000)
 page.locator('#dailyPuzzleCard').tap();expect(page.locator('#dailyPuzzlePhotos .photo')).to_have_count(4)
 return ctx,page,state,account,errors

def fill(page,word):
 for ch in word:
  page.locator('#dailyPuzzleLetters .letter:not([disabled])').filter(has_text=re.compile('^'+re.escape(ch)+'$')).first.tap()
 expect(page.locator('#dailyPuzzleSubmit')).to_be_enabled();page.locator('#dailyPuzzleSubmit').tap()

with sync_playwright() as pw:
 for engine in ['chromium','webkit']:
  browser=getattr(pw,engine).launch()
  for lang in ['ru','en','az']:
   ctx,page,state,account,errors=setup(browser,lang,'win',320 if lang=='az' else 390)
   expect(page.locator('#dailyPuzzleAttempts')).to_contain_text('3 / 3')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   page.screenshot(path=str(OUT/(engine+'-'+lang+'-playing.png')))
   fill(page,bank[0][lang]);expect(page.locator('#dailyPuzzleOutcome')).to_be_visible();expect(page.locator('#dailyPuzzleBoard')).to_be_hidden();expect(page.locator('[data-coins]').first).to_have_text('1025')
   assert state['attempts']==1 and account['coins']==1025
   page.screenshot(path=str(OUT/(engine+'-'+lang+'-win.png')))
   assert not relevant_errors(errors),errors;ctx.close()
  ctx,page,state,account,errors=setup(browser,'ru','fail',412)
  wrong='X'+bank[0]['ru'][1:]
  for i in range(3):
   fill(page,wrong)
   expect(page.locator('#dailyPuzzleAttempts')).to_contain_text(str(2-i)+' / 3')
  expect(page.locator('#dailyPuzzleBoard')).to_be_hidden();expect(page.locator('#dailyPuzzleOutcome')).to_be_visible();assert account['coins']==1000
  page.screenshot(path=str(OUT/(engine+'-three-failures.png')))
  page.locator('#dailyPuzzleHome').tap();state.update(day='2026-10-03',question_id=2,attempts=0,solved=False,receipts={})
  page.locator('#dailyPuzzleCard').tap();expect(page.locator('#dailyPuzzleBoard')).to_be_visible();expect(page.locator('#dailyPuzzleAttempts')).to_contain_text('3 / 3');expect(page.locator('#dailyPuzzleSlots .slot')).to_have_count(len(bank[1]['ru']))
  assert not relevant_errors(errors),errors;ctx.close()
  ctx,page,state,account,errors=setup(browser,'en','lost',390)
  fill(page,bank[0]['en']);expect(page.locator('#dailyPuzzleRetry')).to_be_visible();assert state['attempts']==1 and account['coins']==1025
  page.reload(wait_until='domcontentloaded');page.locator('#dailyPuzzleCard').tap();expect(page.locator('#dailyPuzzleOutcome')).to_be_visible();expect(page.locator('[data-coins]').first).to_have_text('1025')
  assert len(state['ids'])==2 and state['ids'][0]==state['ids'][1] and state['attempts']==1 and account['coins']==1025
  assert not relevant_errors(errors),errors;ctx.close();browser.close()
print('PASS: daily mobile UI in RU/EN/AZ, third failure, next day, and lost-response retry after reload in Chromium and WebKit.')
