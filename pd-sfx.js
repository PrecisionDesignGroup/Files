/* ---------- Site sound effects for the add-on features ----------
   The site's own sound engine lives inside its private code, so add-ons (solitaire, camera, Name Your Price,
   sharing) couldn't play sounds. This is the same set of effects, made available as window.sfx. It follows the
   site's sound button (the "pd-sound" setting) and only starts after the visitor's first tap, like the original. */
(function(){
if(typeof window.sfx==="function")return;
let ac=null,master=null,noiseBuf=null,seaBuf=null;
function ensureAC(){
  if(ac){if(ac.state==="suspended")ac.resume().catch(()=>{});return ac}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
  try{ac=new C()}catch(e){return null}
  master=ac.createGain();master.gain.value=.5;master.connect(ac.destination);
  noiseBuf=ac.createBuffer(1,Math.floor(ac.sampleRate*.6),ac.sampleRate);
  const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  /* brown noise for the swipe waves: deep and soft, like surf rather than static */
  seaBuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);
  const s=seaBuf.getChannelData(0);let b=0;for(let i=0;i<s.length;i++){b=(b+.02*(Math.random()*2-1))/1.02;s[i]=b*3.5}
  return ac;
}
function env(g,now,peak,attack,dur){g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(peak,now+attack);g.gain.exponentialRampToValueAtTime(.0001,now+dur)}
function noise(dur,o){
  const now=ac.currentTime+(o.t||0),src=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
  src.buffer=noiseBuf;f.type=o.type||"bandpass";f.Q.value=o.q||1;
  f.frequency.setValueAtTime(o.f0,now);if(o.f1)f.frequency.exponentialRampToValueAtTime(o.f1,now+dur);
  env(g,now,o.gain||.2,o.attack||.004,dur);
  src.connect(f);f.connect(g);g.connect(master);src.start(now);src.stop(now+dur+.05);
}
function tone(freq,dur,o){
  const now=ac.currentTime+(o.t||0),osc=ac.createOscillator(),g=ac.createGain();
  osc.type=o.type||"sine";osc.frequency.setValueAtTime(freq,now);if(o.f1)osc.frequency.exponentialRampToValueAtTime(o.f1,now+dur);
  env(g,now,o.gain||.12,o.attack||.006,dur);
  osc.connect(g);g.connect(master);osc.start(now);osc.stop(now+dur+.05);
}
/* A wave: slow swell, gentle fall, drifting across the stereo field in the swipe direction */
function wave(o){
  const now=ac.currentTime+(o.t||0),dur=o.dur||1.2,src=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain(),lo=o.lo||220,hi=o.hi||900;
  src.buffer=seaBuf;f.type="lowpass";f.Q.value=.3;
  f.frequency.setValueAtTime(lo,now);f.frequency.exponentialRampToValueAtTime(hi,now+dur*.38);f.frequency.exponentialRampToValueAtTime(lo,now+dur);
  g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(o.gain||.5,now+dur*.38);g.gain.exponentialRampToValueAtTime(.0001,now+dur);
  src.connect(f);f.connect(g);
  if(ac.createStereoPanner){const p=ac.createStereoPanner(),pn=o.pan||0;p.pan.setValueAtTime(-pn*.5,now);p.pan.linearRampToValueAtTime(pn,now+dur);g.connect(p);p.connect(master)}else g.connect(master);
  src.start(now,Math.random()*.6);src.stop(now+dur+.05);
}
const SFX={
  tick:()=>noise(.035,{f0:3400,q:6,gain:.32,attack:.002}),
  soft:()=>noise(.03,{f0:2300,q:4,gain:.16,attack:.002}),
  pop:()=>{tone(480,.1,{gain:.16,f1:760});noise(.025,{f0:4000,q:3,gain:.08,attack:.002})},
  whoosh:()=>noise(.3,{f0:450,f1:2600,q:.8,gain:.26,attack:.07}),
  close:()=>noise(.24,{f0:2200,f1:420,q:.8,gain:.2,attack:.04}),
  pass:()=>wave({pan:-.7,dur:1.25,gain:1.1}),
  save:()=>{wave({pan:.7,dur:1.25,gain:1.1});tone(1318.5,.2,{type:"triangle",gain:.07,t:.12});tone(1975.5,.34,{type:"triangle",gain:.055,t:.2})},
  remove:()=>tone(880,.16,{type:"triangle",gain:.09,f1:560}),
  undo:()=>wave({pan:.5,dur:.95,gain:.9,hi:750}),
  deal:i=>noise(.045,{f0:2800,q:3,gain:.1,attack:.002,t:i*.045})
};
const on=()=>{try{return localStorage.getItem("pd-sound")!=="off"}catch(e){return true}};
window.sfx=function(name,a){if(Array.isArray(window.__sfxlog))window.__sfxlog.push([name,a===undefined?null:a,Date.now()]);
  if(!on()||!ac||ac.state!=="running")return;try{SFX[name](a)}catch(e){}};
["pointerdown","keydown","touchend"].forEach(t=>document.addEventListener(t,()=>{if(on())ensureAC()},true));
})();
