import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Test the real shared WebAudio music code without sound hardware or network.
const core=readFileSync('clean/core.js','utf8');
assert(core.includes('music: true, ...prefs'),'Background music should be enabled by default for new players');
for(const page of ['index.html','game.html','theme-game.html']){
 const html=readFileSync('clean/'+page,'utf8');
 assert(html.includes('core.js?v=20261024-four-rotating-melodies'),'Fresh music script missing in '+page);
}
const start=core.indexOf('  let audioCtx=null,musicTimer=null,trackIndex=0,trackBeat=0;');
const finish=core.indexOf('  function haptic(',start);
assert(start>0&&finish>start,'Shared audio section missing');
const audio=core.slice(start,finish);
const listeners=new Map(),notes=[],timers=new Map(),saved=new Map();
let next=0;
const document={
 hidden:false,
 addEventListener(type,callback){listeners.set(type,callback)}
};
class FakeAudioContext{
 constructor(){this.currentTime=0;this.state='running';this.destination={};this.oscillators=[]}
 createOscillator(){
  const n={
   type:'sine',frequency:{setValueAtTime(x){n.pitch=x}},
   connect(){},disconnect(){},start(){n.started=true},
   stop(when){if(when===undefined)n.halted=true;else n.scheduledStop=when}
  };notes.push(n);this.oscillators.push(n);return n;
 }
 createGain(){
  return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};
 }
 resume(){this.state='running';return Promise.resolve()}
}
const ctx={
 window:{AudioContext:FakeAudioContext,addEventListener(type,callback){listeners.set(type,callback)}},
 document,prefs:{sound:true,music:true},accountErased:false,
 localStorage:{setItem(k,v){saved.set(k,v)}},
 setTimeout(fn,delay){const id=++next;timers.set(id,{fn,delay});return id},
 clearTimeout(id){timers.delete(id)},
 Math
};
vm.createContext(ctx);
vm.runInContext(audio+'\nwindow.musicTest={setMusic,sfx,stopMusic,musicStep,trackState:()=>({index:trackIndex,beat:trackBeat}),tracks:musicTracks.map(t=>({name:t.name,tempo:t.tempo,lead:t.lead.join(\",\"),chords:t.chords.length}))};',ctx);
assert.equal(notes.length,0,'Music must not autoplay before first interaction');
assert.equal(timers.size,0,'Music timers must not run before a gesture');
listeners.get('pointerdown')();
assert.equal(notes.length,6,'Opening chord, bass and melody must start as layered music');
assert.equal(timers.size,1);
assert.equal([...timers.values()][0].delay,735,'First melody tempo must be calm');
const firstPitches=new Set(notes.map(n=>n.pitch));
assert(firstPitches.size>=5,'Music must use chords rather than repeat one beep');
function tick(){
 const [id,timer]=[...timers][0];
 assert(timer,'Beat timer missing');
 timers.delete(id);timer.fn();
}
for(let i=0;i<5;i++)tick();
assert(notes.length>8,'Soundtrack must continue to generate a melody');
const tracks=ctx.window.musicTest.tracks;
assert.equal(tracks.length,4,'Four distinct background melodies must be installed');
assert.equal(new Set(tracks.map(t=>t.name)).size,4,'Track names must be unique');
assert.equal(new Set(tracks.map(t=>t.lead)).size,4,'Each track must have a different lead melody');
assert(tracks.every(t=>t.chords===4),'Every track must have its own harmonic progression');
const heard=new Set([ctx.window.musicTest.trackState().index]);
for(let i=0;i<4*64;i++){
 tick();
 heard.add(ctx.window.musicTest.trackState().index);
}
assert.deepEqual([...heard],[0,1,2,3],'The soundtrack must cycle through all four tracks automatically');
assert.equal(ctx.window.musicTest.trackState().index,0,'The soundtrack must loop to the first melody');

const preFx=notes.length;ctx.prefs.sound=false;ctx.window.musicTest.sfx('success');
assert.equal(notes.length,preFx,'Sound effects toggle must silence SFX separately');
tick();assert.equal(timers.size,1,'Music must continue with sound effects muted');
ctx.window.musicTest.setMusic(false);
assert.equal(timers.size,0,'Switching music off must clear the beat timer');
assert(notes.some(n=>n.halted),'Switching music off must stop already playing music');
assert.equal(JSON.parse(saved.get('photoword-prefs')).music,false,'Music off must persist');
const stoppedCount=notes.length;listeners.get('pointerdown')();
assert.equal(notes.length,stoppedCount,'Off preference must survive further taps');
ctx.window.musicTest.setMusic(true);
assert.equal(timers.size,1,'Music should resume after explicit opt-in');
assert.equal(JSON.parse(saved.get('photoword-prefs')).music,true);
document.hidden=true;listeners.get('visibilitychange')();
assert.equal(timers.size,0,'Music must pause in the background');
assert.equal(ctx.prefs.music,true,'Background pause must not overwrite the saved preference');
document.hidden=false;listeners.get('visibilitychange')();
assert.equal(timers.size,1,'Music should resume when the Telegram app is visible');
listeners.get('pagehide')();
assert.equal(timers.size,0,'Page navigation must stop music');
listeners.get('pointerdown')();
assert.equal(timers.size,1,'A new interaction can restart music after page return');
ctx.accountErased=true;tick();assert.equal(timers.size,0,'Erased accounts must not continue playing');
console.log('PASS: four distinct melodies rotate automatically, with gentle chords, saved mute, independent SFX and lifecycle pause/resume.');
