"""Published PhotoWord duel mobile UI: iOS WebKit and Android Chromium.
Uses actual GitHub Pages HTML/JS with a shared, deterministic synthetic duel
backend. Telegram authentication and monetary API calls are mocked: no real
accounts, payments or balances are modified.
"""
import ast, json, time, re, urllib.parse, uuid
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE='https://firstgame001-star.github.io/Photoword2026/'
OUT=Path('test-results/duel-mobile')
OUT.mkdir(parents=True, exist_ok=True)
CODE='ABCDEF1234567890'
AUTH_FILE=Path('scripts/test-live-entries.py').read_text(encoding='utf-8')
tree=ast.parse(AUTH_FILE)
needed={'auth_fragment','install_mock','relevant_errors'}
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in needed],type_ignores=[]),'<duel-mock-helpers>','exec'))

class DuelFixture:
    def __init__(self,scenario):
        self.scenario=scenario
        self.coins={'A':300,'B':300}
        self.account={
            id:{'photoword_id':'PW-DUEL-MOBILE-'+id,'first_name':'Player '+id,
            'last_name':'','username':None,'game_nickname':None,
            'nickname_changed':False,'coins':300,'xp':150,
            'completed_levels':10,'current_level':11,'rank':1,
            'daily_streak':0,'last_daily_reward':None} for id in ['A','B']}
        self.joined=False
        self.status=None
        self.scores={'A':0,'B':0}
        self.winner=None
        self.payout=0
        self.settles=0
        self.events=[]
    def set_balance(self,person,coins):
        self.coins[person]=coins
        self.account[person]['coins']=coins
    def snapshot(self,person):
        if self.status is None or person=='B' and not self.joined:return None
        now=time.time()
        language='ru' if person=='A' else 'en'
        opponent='B' if person=='A' else 'A'
        answer=['К','О','Т'] if person=='A' else ['C','A','T']
        q={'photos':['🐈','🐾','🧶','🥛'],'length':3,
           'letters':answer+(['Ж'] if person=='A' else ['X'])}
        return {'code':CODE,'stake':25,'status':self.status,'language':language,
          'creator':person=='A','my_name':'Player '+person,'their_name':'Player '+opponent,
          'my_completed_levels':10,'their_completed_levels':10,
          'skips_left':3,'friends':True,
          'my_score':self.scores[person],'their_score':self.scores[opponent],
          'starts_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime(now-4)),
          'ends_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime(now+50)),
          'expires_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime(now+250)),
          'question_id':1 if self.status=='active' else None,
          'question':q if self.status=='active' else None,
          'won':self.status=='finished' and self.winner==person,
          'draw':self.status=='finished' and self.winner is None,
          'payout':self.payout if self.winner==person else 0,
          'public_room':False,'invitee_name':None}
    def handle(self,person,action,data):
        self.events.append((person,action))
        body=data or {}
        if action=='create':
            assert person=='A' and self.status is None
            assert body['stake']==25 and body['language']=='ru'
            self.status='waiting';self.set_balance('A',275)
        elif action=='preview':
            assert body.get('code')==CODE
            return {'duel':{'code':CODE,'stake':25,'status':'waiting',
              'expires_at':self.snapshot('A')['expires_at']}}
        elif action=='join':
            assert person=='B' and self.status=='waiting'
            self.joined=True;self.status='active';self.set_balance('B',275)
        elif action=='answer':
            answer='КОТ' if person=='A' else 'CAT'
            correct=body.get('answer')==answer
            if correct:self.scores[person]+=1
            return {'duel':self.snapshot(person),'correct':correct,'server_now':self.now()}
        elif action=='cancel':
            assert person=='A' and self.status=='waiting'
            self.status='cancelled';self.set_balance('A',300);self.settles+=1
        elif action=='state':
            return {'duel':self.snapshot(person),'server_now':self.now()}
        elif action=='offer':return {'offer':None}
        elif action=='reactions':return {'reactions':{'my_reaction':None,'their_reaction':None},'server_now':self.now()}
        elif action=='public_rooms':return {'rooms':[]}
        elif action=='friend_list':return {'friends':[]}
        elif action=='statistics':return {'stats':{}}
        else:raise AssertionError('Unexpected duel API action: '+action)
        return {'duel':self.snapshot(person),'server_now':self.now()}
    def now(self):return time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
    def finish(self):
        assert self.status=='active'
        if self.scenario=='win':
            assert self.scores['A']>self.scores['B']
            self.status='finished';self.winner='A';self.payout=45
            self.set_balance('A',320)
        elif self.scenario=='draw':
            assert self.scores['A']==self.scores['B']
            self.status='finished';self.winner=None;self.payout=0
            self.set_balance('A',300);self.set_balance('B',300)
        elif self.scenario=='flagged':
            assert self.scores['A']>self.scores['B']
            self.status='cancelled';self.winner=None;self.payout=0
            self.set_balance('A',300);self.set_balance('B',300)
        else:raise AssertionError(self.scenario)
        self.settles+=1

def attach(browser,fixture,person,errors,login_fragment=False):
    lang='ru' if person=='A' else 'en'
    width=390 if person=='A' else 412
    ctx=browser.new_context(viewport={'width':width,'height':800},has_touch=True,is_mobile=True)
    ctx.add_init_script('localStorage.setItem("pw.language",'+json.dumps(lang)+');')
    # Intercept the PW initializer before duel.js processes Telegram startapp links.
    ctx.add_init_script("""() => {
      let pwCore;
      Object.defineProperty(window,'PW',{
        configurable:true,
        get(){return pwCore;},
        set(core){
          pwCore=core;
          if(core)core.duelRequest=(action,body={})=>window.duelSyntheticApi(action,body);
        }
      });
    }""")
    install_mock(ctx,fixture.account[person],set(range(1,11)),lang)
    # No unscripted duel request should ever reach the production API.
    ctx.route('**/functions/v1/duel-game',lambda route:route.fulfill(
        status=503,content_type='application/json',body='{"error":"duel_test_no_production"}',
        headers={'Access-Control-Allow-Origin':'*'}))
    page=ctx.new_page()
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.expose_function('duelSyntheticApi',lambda action,body={}:fixture.handle(person,action,body))
    target=BASE+'clean/'
    if login_fragment:target+='?startapp=duel_'+CODE
    page.goto(target+'#'+auth_fragment(),wait_until='domcontentloaded',timeout=45000)
    expect(page.locator('#duelEntry')).to_be_visible(timeout=15000)
    page.evaluate("""() => {if(!window.PW)throw Error('Missing public game core');
       window.PW.duelRequest=(action,body={})=>window.duelSyntheticApi(action,body);}""")
    return ctx,page

def type_word(page,letters):
    for ch in letters:
        loc=page.locator('#duelLetters .letter:not([disabled])').filter(has_text=re.compile('^'+re.escape(ch)+'$')).first
        expect(loc).to_be_visible(timeout=4000)
        loc.tap()

def assert_viewport(page):
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'), 'Horizontal overflow in duel view'

with sync_playwright() as pw:
    ios=pw.webkit.launch();android=pw.chromium.launch()
    report=[]
    for scenario in ['win','draw','flagged','cancel']:
        fixture=DuelFixture(scenario)
        errors=[]
        ctx_a,a=attach(ios,fixture,'A',errors)
        a.locator('#duelEntry').tap()
        expect(a.locator('#duelSetup')).to_be_visible(timeout=12000)
        assert '90%' in a.locator('#duelRules').inner_text()
        assert 'подозритель' in a.locator('#duelRules').inner_text().lower()
        expect(a.locator('#duelPayout')).to_contain_text('45')
        a.locator('#duelCreate').tap()
        expect(a.locator('#duelInvite')).to_be_visible(timeout=12000)
        assert fixture.coins['A']==275
        assert_viewport(a)
        if scenario=='cancel':
            a.locator('#duelCancel').tap()
            expect(a.locator('#duelResult')).to_be_visible(timeout=12000)
            assert a.locator('#duelResultIcon').inner_text()=='↩️'
            assert fixture.coins=={'A':300,'B':300}
            assert fixture.settles==1
            a.screenshot(path=str(OUT/'cancelled-iphone.png'))
            ctx_a.close()
        else:
            ctx_b,b=attach(android,fixture,'B',errors,True)
            expect(b.locator('#duelJoin')).to_be_visible(timeout=12000)
            b.locator('#duelAccept').tap()
            expect(b.locator('#duelGame')).to_be_visible(timeout=12000)
            expect(a.locator('#duelGame')).to_be_visible(timeout=12000)
            expect(a.locator('#duelPhotos .photo')).to_have_count(4)
            expect(b.locator('#duelPhotos .photo')).to_have_count(4)
            assert fixture.coins=={'A':275,'B':275}
            type_word(a,'КОТ')
            expect(a.locator('#duelYouScore')).to_have_text('1',timeout=12000)
            if scenario=='draw':
                type_word(b,'CAT')
                expect(b.locator('#duelYouScore')).to_have_text('1',timeout=12000)
            fixture.finish()
            expect(a.locator('#duelResult')).to_be_visible(timeout=12000)
            expect(b.locator('#duelResult')).to_be_visible(timeout=12000)
            if scenario=='win':
                assert a.locator('#duelResultIcon').inner_text()=='🏆'
                assert fixture.coins=={'A':320,'B':275}
                assert '45' in a.locator('#duelResultText').inner_text()
            elif scenario=='draw':
                assert a.locator('#duelResultIcon').inner_text()=='🤝'
                assert fixture.coins=={'A':300,'B':300}
            else:
                assert a.locator('#duelResultIcon').inner_text()=='↩️'
                assert b.locator('#duelResultIcon').inner_text()=='↩️'
                assert fixture.coins=={'A':300,'B':300}
            assert fixture.settles==1
            assert_viewport(a);assert_viewport(b)
            a.screenshot(path=str(OUT/(scenario+'-iphone.png')))
            b.screenshot(path=str(OUT/(scenario+'-android.png')))
            ctx_a.close();ctx_b.close()
        assert not relevant_errors(errors),(scenario,errors)
        report.append({'scenario':scenario,'result':'PASS','balances':fixture.coins,
          'actions':fixture.events,'settlement_count':fixture.settles})
        print('PASS: live published mobile duel UI, '+scenario,flush=True)
    ios.close();android.close()
(OUT/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('PASS: published duel create/join/win/draw/anti-cheat-refund/cancel in WebKit iPhone and Chromium Android; no production mutations',flush=True)
