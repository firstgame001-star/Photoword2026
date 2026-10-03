"""Launch the real client with AdsGram unavailable. All account APIs are mocks."""
import json, threading, time, urllib.parse
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(Path.cwd())))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/clean/'
raw=urllib.parse.urlencode({'auth_date':str(int(time.time())),'user':json.dumps({'id':123,'first_name':'Test'}),'hash':'mock-only'})
fragment=urllib.parse.urlencode({'tgWebAppData':raw})

with sync_playwright() as pw:
 for engine in ['chromium','webkit']:
  browser=getattr(pw,engine).launch()
  for language in ['ru','en','az']:
   ctx=browser.new_context(viewport={'width':390,'height':800},has_touch=True,is_mobile=True)
   ctx.add_init_script(f"localStorage.setItem('pw.language','{language}');")
   ctx.route('https://telegram.org/js/telegram-web-app.js',lambda r:r.fulfill(content_type='application/javascript',body='window.Telegram={WebApp:{ready(){},expand(){},setHeaderColor(){},setBackgroundColor(){}}};'))
   ad_requests=[]
   def block_ad(route):
    ad_requests.append(route.request.url);route.abort()
   ctx.route('https://sad.adsgram.ai/**',block_ad)
   player={'photoword_id':'PW-STARTTEST','first_name':'Test','last_name':'','game_nickname':None,'coins':250,'xp':0,'completed_levels':0,'current_level':1,'rank':1,'daily_streak':0,'last_daily_reward':None}
   def api(route):
    body=route.request.post_data_json or {};action=body.get('action','')
    data={'player':player,'progress':[]}
    if action=='public_config':data={'config':{'adsgram_reward_block_id':'51571'}}
    elif action=='shop_status':data={'shop':{'coins':250,'energy':5,'energy_max':5,'ads':{'configured':True,'claimed_today':0,'daily_limit':10,'reward_coins':5},'history':[]}}
    elif action=='theme_progress':data={'progress':[]}
    elif action=='track_event':data={'ok':True}
    elif '/rest/v1/' in route.request.url:data=[]
    route.fulfill(content_type='application/json',body=json.dumps(data),headers={'Access-Control-Allow-Origin':'*'})
   ctx.route('https://bqoraxewpcnmidvjlpuy.supabase.co/**',api)
   page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(base+'#'+fragment,wait_until='domcontentloaded',timeout=15000)
   expect(page.locator('#homeChapter1Label')).to_contain_text({'ru':'Глава','en':'Chapter','az':'Fəsil'}[language])
   expect(page.locator('#name')).to_have_text('Test')
   assert not ad_requests,'Startup requested AdsGram'
   page.locator('#settingsBtn').tap();expect(page.locator('#settingsModal')).to_be_visible()
   page.locator('#settingsModal [data-close]').first.tap()
   # Invoke the actual shop opener, then simulate an unavailable SDK.
   page.locator('#shopNav').tap()
   expect(page.locator('#shopModal')).to_be_visible()
   expect(page.locator('#watchAd')).to_be_enabled();page.locator('#watchAd').tap()
   expect(page.locator('#watchAd')).to_be_enabled(timeout=5000)
   expect(page.locator('#adText')).to_have_text({'ru':'Рекламу не удалось показать. Попробуй позже.','en':'The ad could not be shown. Try again later.','az':'Reklamı göstərmək mümkün olmadı. Sonra yenidən cəhd et.'}[language])
   assert len(ad_requests)==1,ad_requests
   assert not errors,errors
   print(f'PASS: {engine}/{language}: home, login and settings start without AdsGram; failed ad restores button.',flush=True)
   ctx.close()
  browser.close()
server.shutdown()
