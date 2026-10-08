/* ---------- PORTFOLIO: video ad cards ----------
   Commercials that play full-card like ads between the projects under "All" (muted until the speaker button is tapped).
   A video plays only while its card is on top. Swiping either way moves past it (never onto the shortlist) and the
   cards stay out of grid view. An ad with tap:"shop" takes you to the shop when tapped; the others only swipe.
   To add or swap one, edit ADS (pos is 0-based: 5 = the 6th card). */
(function(){
if(typeof PROJECTS==="undefined"||typeof artFor!=="function")return;
const B1="https://cdn.jsdelivr.net/gh/PrecisionDesignGroup/Files@9125d657ae599436a35dac74a4227b77db805e18/ad/";
const B2="https://cdn.jsdelivr.net/gh/PrecisionDesignGroup/Files@fcafd03fe79af3659dc38459b0a185bb062c61ea/ad/";
const ADS=[
  {id:"pd-ad",pos:5,src:B1+"precision-2002-commercial.mp4",poster:B1+"precision-2002-commercial-poster.webp",chip:"Ad · 0:30",
   title:"The Commercial",discipline:"Studio ad",year:"2002",bg:"#1B2DB8",imageBg:"#0E1A7A",fill:"radial-gradient(120% 90% at 50% 45%,#2a3fd6,#0b1466 70%,#070c3d)",
   blurb:"Our 30-second spot, made like it's 2002: dial-up blue, bubbly logos and a VHS finish. Tap the speaker for sound.",
   spec:[["What","Studio ad"],["Length","30 seconds"],["Style","2002 TV spot"]]},
  {id:"pd-ad2",pos:9,tap:"shop",src:B2+"precision-internet-commercial.mp4",poster:B2+"precision-internet-commercial-poster.webp",chip:"Ad · Tap to shop",
   title:"Hot Off the Press",discipline:"Shop ad",year:"2000",bg:"#C4121B",imageBg:"#5e0409",fill:"radial-gradient(120% 90% at 50% 45%,#e2343a,#8f0c14 70%,#3d0306)",
   blurb:"Pick a premade, press it, wear it, all in a 30-second internet ad straight out of 2000. Tap the card to shop the graphics.",
   spec:[["What","Shop ad"],["Length","30 seconds"],["Style","2000 internet ad"]]}
].map(a=>Object.assign({ad:true,cat:"Studio",client:"Precision Design",fg:"#F4F2EC",inks:[a.bg,"#F4F2EC","#F2C649"],formats:["30 sec","VHS finish"],gallery:[],image:a.poster},a));
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
@media (prefers-reduced-motion:reduce){.ad-snd::after{animation:none}}
${ADS.map(a=>`.pg-tile[aria-label^="Precision Design, ${a.title}."]`).join(",")}{display:none!important}
.ad-art.tap{cursor:pointer}
`;document.head.appendChild(st);

const spk='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/>';
const sndIcons=spk+'<g class="on"><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></g><g class="off"><path d="M17 9.5l5 5M22 9.5l-5 5"/></g></svg>';
let soundOn=false;

function art(a){
  return `<div class="ad-art${a.tap?" tap":""}" style="background:${a.fill}"><canvas class="ad-fill" width="40" height="30"></canvas>
    <video class="ad-vid" muted playsinline loop preload="metadata" poster="${a.poster}" src="${a.src}" aria-label="Precision Design commercial: ${esc(a.title)}"></video>
    <span class="ad-chip"><i></i>${esc(a.chip)}</span>
    <button type="button" class="ad-snd" aria-pressed="${soundOn}" aria-label="Sound">${sndIcons}</button>
    <i class="ad-bar"><b></b></i></div>`;
}
const _artFor=artFor;
artFor=function(p){return isAd(p)?art(p):_artFor.apply(this,arguments)};

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
    const card=v.closest(".dcard"),go=!reduce&&!document.hidden&&!document.getElementById("swipeView").hidden&&card&&card.classList.contains("top")&&typeof mode!=="undefined"&&mode==="swipe"&&!document.querySelector(".scrim")&&!document.querySelector(".pg-view:not([hidden])");
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

/* tap / swipe up / Enter: the shop ad goes to the shop, the others do nothing; detail-sheet arrows step over them */
function goShop(){
  if(typeof closeSheetNow==="function")closeSheetNow();
  if(typeof setMode==="function"&&mode!=="wallet")setMode("wallet");
  if(typeof setCat==="function"&&typeof scat!=="undefined"&&scat!=="Graphics")setCat("Graphics");
  idx=0;try{history.length=0}catch(e){}try{renderDeck();renderMeta()}catch(e){}
}
if(typeof openDetail==="function"){let lastI=-1;const _od=openDetail;openDetail=function(p){
  if(isAd(p)){const sh=document.querySelector(".scrim .sheet"),L0=PL(),i=L0.indexOf(p);
    if(sh&&lastI>=0&&i>=0&&L0.length>1)return openDetail(L0[(i+(lastI>i?-1:1)+L0.length)%L0.length]);
    if(p.tap==="shop")goShop();return}
  lastI=PL().indexOf(p);return _od.apply(this,arguments)}}
if(typeof openProduct==="function"){const _op=openProduct;openProduct=function(p){if(isAd(p)){if(p.tap==="shop")goShop();return}return _op.apply(this,arguments)}}

/* desktop info panel */
if(typeof renderMeta==="function"){const _rm=renderMeta;renderMeta=function(){const r=_rm.apply(this,arguments);
  const m=document.getElementById("swipeMeta"),p=typeof mode!=="undefined"&&mode==="swipe"&&idx<L().length?L()[idx]:null;
  if(m&&isAd(p))m.innerHTML=`<div class="idx">${pad(idx+1)}<small> / ${pad(L().length)}</small></div><h2>${esc(p.title)}</h2><p>${esc(p.blurb)}</p>
    <dl class="spec mono">${p.spec.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`;
  return r}}
if(typeof setMode==="function"){const _sm=setMode;setMode=function(){const r=_sm.apply(this,arguments);requestAnimationFrame(sync);return r}}

/* slot them in (under "All"); only redraw if that part of the deck is already on screen */
ADS.slice().sort((a,b)=>a.pos-b.pos).forEach(a=>PROJECTS.splice(Math.min(a.pos,PROJECTS.length),0,a));
if(typeof mode!=="undefined"&&mode==="swipe"&&pcat==="All"&&ADS.some(a=>idx>=a.pos-2&&idx<=a.pos)){try{renderDeck()}catch(e){}}
try{if(typeof renderPockets==="function")renderPockets()}catch(e){}
sync();
})();
