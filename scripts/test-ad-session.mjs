import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const timers=new Map();let timerId=0;
const scripts=[];
const document={createElement:()=>({remove(){this.removed=true}}),head:{append:s=>scripts.push(s)}};
const context={document,window:{},setTimeout:(fn,ms)=>{timers.set(++timerId,{fn,ms});return timerId},clearTimeout:id=>timers.delete(id)};
vm.createContext(context);vm.runInContext(readFileSync('clean/ad-session.js','utf8'),context);
assert.equal(scripts.length,0,'Module initialization requested AdsGram');
const ensureSDK=context.window.PWAdSession.ensureSDK;
let sdk=ensureSDK({timeoutMs:50});assert.equal(ensureSDK(),sdk,'Concurrent SDK loads were duplicated');assert.equal(scripts.length,1);assert.equal(scripts[0].async,true);
const loadTimer=[...timers].find(([,v])=>v.ms===50);timers.delete(loadTimer[0]);loadTimer[1].fn();await assert.rejects(sdk,/ad_sdk_timeout/);assert.equal(scripts[0].removed,true);
sdk=ensureSDK();assert.equal(scripts.length,2);context.window.Adsgram={init(){}};scripts[1].onload();assert.equal(await sdk,context.window.Adsgram);assert.equal(timers.size,0);assert.equal(await ensureSDK(),context.window.Adsgram);assert.equal(scripts.length,2);
function controller(){let resolve,reject;const listeners=new Map();return {listeners,destroyed:0,show:()=>new Promise((a,b)=>{resolve=a;reject=b}),addEventListener:(event,fn)=>listeners.set(event,fn),removeEventListener:(event,fn)=>{if(listeners.get(event)===fn)listeners.delete(event)},destroy(){this.destroyed++},resolve:result=>resolve(result),reject:error=>reject(error)}}
function fire(ms){const entry=[...timers].find(([,v])=>v.ms===ms);assert(entry,'Missing timeout '+ms);timers.delete(entry[0]);entry[1].fn()}
const show=context.window.PWAdSession.show;
let c=controller(),p=show(c);fire(30000);await assert.rejects(p,/ad_timeout/);assert.equal(c.destroyed,1);assert.equal(timers.size,0);assert.equal(c.listeners.size,0);c.resolve({done:true});await Promise.resolve();
c=controller();let started=0;p=show(c,{onStart:()=>started++});c.listeners.get('onStart')();assert.equal(started,1);assert(![...timers.values()].some(v=>v.ms===30000),'Loading timeout cut off a playing ad');c.resolve({done:true});assert.equal((await p).done,true);assert.equal(c.destroyed,0);assert.equal(timers.size,0);assert.equal(c.listeners.size,0);
c=controller();p=show(c);c.listeners.get('onStart')();fire(180000);await assert.rejects(p,/ad_timeout/);assert.equal(c.destroyed,1);
c=controller();p=show(c);const error={description:'No banner found',state:'load'};c.reject(error);await assert.rejects(p,e=>e===error);assert.equal(timers.size,0);
c=controller();c.show=()=>{throw new Error('SDK failure')};await assert.rejects(show(c),/SDK failure/);assert.equal(timers.size,0);

// Execute the actual home click handler: no client coin grant before confirmation,
// no duplicate attempt while pending, and the button always recovers.
const source=readFileSync('clean/home.js','utf8');
const section=source.slice(source.indexOf('function renderAdButton()'),source.indexOf("$('claimDaily').onclick"));
let showResolve,claimCalls=0,updates=0,mode='success';const events=[],elements=new Map();
const get=id=>{if(!elements.has(id))elements.set(id,{disabled:false,textContent:'',setAttribute(){}});return elements.get(id)};
const ui={window:{Adsgram:{init:()=>({})},PWAdSession:{ensureSDK:async()=>{},show:()=>new Promise(resolve=>showResolve=resolve)}},$:get,t:()=>({adWatch:'Watch',adLoading:'Loading',adPlaying:'Playing',adChecking:'Checking',adError:'Unavailable',adTimeout:'Timeout',adPending:'Pending',adCooldown:'Wait',adRewarded:'Credited'}),text:(id,value)=>get(id).textContent=value,pw:{actionRequest:async()=>({nonce:'n',block_id:'51571'}),api:async()=>{claimCalls++;if(mode==='unconfirmed')throw new Error('ad_claim_invalid');return {coins:5}},status:()=>{},sfx:()=>{}},track:event=>events.push(event),update:()=>updates++,flashStatus:()=>{},loadShopStatus:async()=>{},setTimeout:fn=>{fn();return 1},publicConfig:{},shopStatus:{ads:{configured:true,claimed_today:0,daily_limit:10}},adController:null,adBusy:false,adPhase:'',adLastError:''};
ui.adRewardKind="coins";ui.lang=()=>"ru";ui.shopCountdown=()=>"10:00";vm.createContext(ui);vm.runInContext(source.slice(source.indexOf("function adChoice()"),source.indexOf("for(const [id,kind] of",source.indexOf("function adChoice()"))),ui);vm.runInContext(section,ui);ui.renderAdButton();
let click=get('watchAd').onclick();await new Promise(resolve=>setImmediate(resolve));assert.equal(get('watchAd').disabled,true);ui.renderAdButton();assert.equal(get('watchAd').disabled,true);assert.equal(get('watchAd').textContent,'Loading');await get('watchAd').onclick();assert.equal(events.filter(e=>e==='ad_open').length,1);assert.equal(claimCalls,0);showResolve({done:true});await click;assert.equal(updates,1);assert.equal(get('watchAd').disabled,false);assert.equal(get('watchAd').textContent,'Watch');
mode='unconfirmed';click=get('watchAd').onclick();await new Promise(resolve=>setImmediate(resolve));showResolve({done:true});await click;assert.equal(updates,1,'Unconfirmed ad granted coins');assert.equal(get('adText').textContent,'Pending');assert.equal(get('watchAd').disabled,false);assert.equal(events.filter(e=>e==='ad_complete').length,1);
ui.window.PWAdSession.show=async()=>{throw {description:'provider error',state:'load'}};await get('watchAd').onclick();assert.equal(get('watchAd').disabled,false);assert.equal(get('adText').textContent,'Unavailable');assert.equal(updates,1);
ui.shopStatus.ads.claimed_today=3;ui.shopStatus.ads.daily_limit=3;ui.renderAdButton();assert.equal(get('watchAd').disabled,true);
ui.adRewardKind='energy';ui.shopStatus.ads.energy_daily_limit=2;ui.shopStatus.ads.energy_claimed_today=0;ui.shopStatus.energy=5;ui.renderAdButton();assert.equal(get('watchAd').disabled,true);ui.shopStatus.energy=4;ui.renderAdButton();assert.equal(get('watchAd').disabled,false);ui.shopStatus.ads.next_ad_at=new Date(Date.now()+600000).toISOString();ui.renderAdButton();assert.equal(get('watchAd').disabled,true);
console.log('PASS: AdsGram loading/playback deadlines, destroy/cleanup, provider errors, busy-button protection, and server-confirmed rewards only.');
