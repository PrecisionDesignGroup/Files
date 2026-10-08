/* ---------- PORTFOLIO: video ad card ----------
   The 6th card under "All" is the studio's 2002-style commercial, playing full-card like an ad (muted until the
   speaker button is tapped). It plays only while it's the top card; tapping it opens the full video with sound.
   Swiping either way moves past it (it never goes on the shortlist). To swap the video, change SRC and POSTER. */
(function(){
if(typeof PROJECTS==="undefined"||typeof artFor!=="function")return;
const BASE="https://cdn.jsdelivr.net/gh/PrecisionDesignGroup/Files@9125d657ae599436a35dac74a4227b77db805e18/ad/";
const SRC=BASE+"precision-2002-commercial.mp4",POSTER=BASE+"precision-2002-commercial-poster.webp";
const POS=5;   /* 0-based: the 6th card */
const AD={id:"pd-ad",ad:true,cat:"Studio",client:"Precision Design",title:"The Commercial",discipline:"Studio ad",year:"2002",
  blurb:"Our 30-second spot, made like it's 2002: dial-up blue, bubbly logos and a VHS finish. Tap for the full thing with sound.",
  bg:"#1B2DB8",fg:"#F4F2EC",inks:["#1B2DB8","#F4F2EC","#F2C649"],formats:["30 sec","VHS finish"],gallery:[],image:POSTER,imageBg:"#0E1A7A"};
const isAd=p=>!!(p&&p.ad);
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

const st=document.createElement("style");st.textContent=`
.ad-art{position:absolute;inset:0;overflow:hidden;background:radial-gradient(120% 90% at 50% 45%,#2a3fd6,#0b1466 70%,#070c3d)}
.ad-art canvas.ad-fill{position:absolute;inset:-12%;width:124%!important;height:124%!important;filter:blur(22px) saturate(1.2);opacity:.85;pointer-events:none}
.ad-art video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;background:transparent}
.ad-art::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom,rgba(0,0,0,.35),transparent 18%,transparent 80%,rgba(0,0,0,.4))}
.ad-chip{position:absolute;left:16px;top:16px;z-index:2;display:inline-flex;align-items:center;gap:7px;padding:7px 12px 7px 10px;border-radius:999px;background:rgba(10,12,40,.62);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#F4F2EC;font-family:var(--f-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.ad-chip i{width:0;height:0;border-left:7px solid #F2C649;border-top:4.5px solid transparent;border-bottom:4.5px solid transparent}
.ad-snd{position:absolute;right:14px;top:12px;z-index:3;width:40px;height:40px;border-radius:50%;border:0;display:grid;place-items:center;background:rgba(10,12,40,.62);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#F4F2EC;cursor:pointer;transition:transform .15s}
.ad-snd:active{transform:scale(.92)}
.dcard .art .ad-snd svg,.ad-snd svg{width:18px!important;height:18px!important}
.ad-snd .on{display:none}.ad-snd[aria-pressed="true"] .on{display:block}.ad-snd[aria-pressed="true"] .off{display:none}
.ad-snd[aria-pressed="false"]::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid rgba(242,198,73,.8);animation:adPing 2.4s ease-out 1.5s infinite;pointer-events:none}
@keyframes adPing{0%{transform:scale(.85);opacity:1}70%,100%{transform:scale(1.35);opacity:0}}
.ad-bar{position:absolute;left:0;right:0;bottom:0;height:3px;z-index:2;background:rgba(255,255,255,.18)}
.ad-bar b{display:block;height:100%;width:0;background:#F2C649}
.dcard:not(.top) .ad-snd{pointer-events:none}
.sheet.adsheet .bigart{position:relative;background:#070c3d;aspect-ratio:4/3;min-height:0;display:grid;place-items:center}
.sheet.adsheet .bigart video{width:100%;height:100%;object-fit:contain;display:block;background:#070c3d}
@media (prefers-reduced-motion:reduce){.ad-snd::after{animation:none}}
`;document.head.appendChild(st);

const spk='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/>';
const sndIcons=spk+'<g class="on"><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></g><g class="off"><path d="M17 9.5l5 5M22 9.5l-5 5"/></g></svg>';
let soundOn=false;

function art(){
  return `<div class="ad-art"><canvas class="ad-fill" width="40" height="30"></canvas>
    <video class="ad-vid" muted playsinline loop preload="metadata" poster="${POSTER}" src="${SRC}" aria-label="Precision Design commercial"></video>
    <span class="ad-chip"><i></i>Ad · 0:30</span>
    <button type="button" class="ad-snd" aria-pressed="${soundOn}" aria-label="Sound">${sndIcons}</button>
    <i class="ad-bar"><b></b></i></div>`;
}
const _artFor=artFor;
artFor=function(p){return isAd(p)?art():_artFor.apply(this,arguments)};

/* the blurred fill behind the video and the progress bar follow the playing frame */
const loops=new WeakSet();
function follow(v){if(loops.has(v))return;loops.add(v);
  const box=v.closest(".ad-art"),cv=box&&box.querySelector("canvas.ad-fill"),bar=box&&box.querySelector(".ad-bar b"),x=cv&&cv.getContext("2d");let last=0;
  const tick=now=>{if(!v.isConnected){loops.delete(v);return}
    if(!v.paused&&now-last>90&&v.readyState>=2){last=now;try{x.drawImage(v,0,0,cv.width,cv.height)}catch(e){}if(bar&&v.duration)bar.style.width=(v.currentTime/v.duration*100)+"%"}
    if(!v.paused)requestAnimationFrame(tick);else loops.delete(v)};
  requestAnimationFrame(tick)}
/* only the top card plays, and only when nothing covers it */
function sync(){
  document.querySelectorAll("#deck .ad-vid").forEach(v=>{
    const card=v.closest(".dcard"),go=!reduce&&!document.hidden&&card&&card.classList.contains("top")&&typeof mode!=="undefined"&&mode==="swipe"&&!document.querySelector(".scrim")&&!document.querySelector(".pg-view:not([hidden])");
    const b=card&&card.querySelector(".ad-snd");if(b)b.setAttribute("aria-pressed",String(soundOn));
    if(go){v.muted=!soundOn;if(v.paused){const pr=v.play();if(pr&&pr.catch)pr.catch(()=>{if(!v.muted){soundOn=false;v.muted=true;if(b)b.setAttribute("aria-pressed","false");v.play().catch(()=>{})}})}follow(v)}
    else if(!v.paused)v.pause();
  })}
const deck=document.getElementById("deck");
if(deck)new MutationObserver(()=>requestAnimationFrame(sync)).observe(deck,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
new MutationObserver(()=>requestAnimationFrame(sync)).observe(document.body,{childList:true});   /* sheets opening/closing */
document.addEventListener("visibilitychange",sync);
document.addEventListener("pointerdown",e=>{if(e.target.closest&&e.target.closest(".dcard .ad-snd"))e.stopPropagation()},true);
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest(".dcard .ad-snd");if(!b)return;e.stopPropagation();e.preventDefault();
  soundOn=!soundOn;const v=b.closest(".ad-art").querySelector("video");b.setAttribute("aria-pressed",String(soundOn));if(v){v.muted=!soundOn;if(v.paused)v.play().catch(()=>{})}},true);

/* swiping either way moves past it */
if(typeof fly==="function"){const _fly=fly;fly=function(el,dir){
  const p=idx<L().length?L()[idx]:null;if(!isAd(p))return _fly.apply(this,arguments);
  const had=shortlist.has(p.id),r=_fly.apply(this,arguments);
  if(!had&&shortlist.has(p.id)){shortlist.delete(p.id);persist();updateCount();const t=document.getElementById("toast");if(t)t.classList.remove("on")}
  return r}}

/* tap / swipe up / Enter / grid: the full video with sound; detail-sheet arrows step over it */
function openAd(){
  if(typeof showSheet!=="function")return;
    const s=showSheet(`<div class="bigart"><video src="${SRC}" poster="${POSTER}" controls playsinline preload="auto" aria-label="Precision Design commercial"></video></div>
  <div class="body">
    <div class="top"><span class="mono">Studio ad · 0:30</span><button class="x" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
    <div><div class="client">Precision Design</div><h3>The Commercial</h3></div>
    <p>${esc(AD.blurb.replace(" Tap for the full thing with sound.",""))}</p>
    <dl class="spec mono"><dt>Client</dt><dd>Precision Design</dd><dt>Format</dt><dd>30 sec · VHS finish</dd><dt>Style</dt><dd>2002 TV spot</dd></dl>
    <div class="actions"><button class="pill solid" data-start>Start a project</button><button class="pill" data-shop>Visit the shop</button></div>
  </div>`,"adsheet");
  const v=s.querySelector("video");v.muted=false;v.play().catch(()=>{v.muted=true;v.play().catch(()=>{})});
  const a=s.querySelector("[data-start]"),b=s.querySelector("[data-shop]");
  if(a)a.onclick=()=>{if(typeof closeSheetNow==="function")closeSheetNow();if(typeof openStudio==="function")openStudio()};
  if(b)b.onclick=()=>{if(typeof closeSheet==="function")closeSheet();if(typeof setMode==="function")setMode("wallet")};
}
if(typeof openDetail==="function"){let lastI=-1;const _od=openDetail;openDetail=function(p){
  if(isAd(p)){const sh=document.querySelector(".scrim .sheet"),L0=PL(),i=L0.indexOf(p);
    if(sh&&!sh.classList.contains("adsheet")&&lastI>=0&&i>=0&&L0.length>1)return openDetail(L0[(i+(lastI>i?-1:1)+L0.length)%L0.length]);
    return openAd()}
  lastI=PL().indexOf(p);return _od.apply(this,arguments)}}
if(typeof openProduct==="function"){const _op=openProduct;openProduct=function(p){return isAd(p)?openAd():_op.apply(this,arguments)}}

/* desktop info panel */
if(typeof renderMeta==="function"){const _rm=renderMeta;renderMeta=function(){const r=_rm.apply(this,arguments);
  const m=document.getElementById("swipeMeta"),p=typeof mode!=="undefined"&&mode==="swipe"&&idx<L().length?L()[idx]:null;
  if(m&&isAd(p))m.innerHTML=`<div class="idx">${pad(idx+1)}<small> / ${pad(L().length)}</small></div><h2>The Commercial</h2><p>${esc(AD.blurb)}</p>
    <dl class="spec mono"><dt>What</dt><dd>Studio ad</dd><dt>Length</dt><dd>30 seconds</dd><dt>Style</dt><dd>2002 TV spot</dd></dl>`;
  return r}}
if(typeof setMode==="function"){const _sm=setMode;setMode=function(){const r=_sm.apply(this,arguments);requestAnimationFrame(sync);return r}}

/* slot it in as the 6th card (under "All"); only redraw if that part of the deck is already on screen */
PROJECTS.splice(Math.min(POS,PROJECTS.length),0,AD);
if(typeof mode!=="undefined"&&mode==="swipe"&&pcat==="All"&&idx>=POS-2&&idx<=POS){try{renderDeck()}catch(e){}}
try{if(typeof renderPockets==="function")renderPockets()}catch(e){}
sync();
})();
