/* ---------- Premium polish (2026-11-03) ----------
   1. SOFT LOAD: card and project images fade in from a light blur instead of popping in. The typographic cover
      underneath shows while the picture loads.
   2. CARD OPENS INTO THE PROJECT: tapping a card (or the ↑ button) grows the project view out of the card itself,
      instead of the sheet sliding up from below. Closing still flies the picture back into the card.
      Off for visitors who ask their device for reduced motion.
   3. RICHER PROJECT PAGES: any project can carry extras that show in its opened view:
        quote:   { text:"…", by:"Name, Role" }          → a client quote under the description
        mockups: ["https://…jpg", …]                    → an "In use" strip (garments, packaging, signage…)
        video:   "https://…mp4"                         → a short looping clip (muted, plays inline)
      Add them in EXTRAS below, keyed by the project id. Projects without extras look as before.
   4. DEPTH: on a laptop/desktop the top card tilts a few degrees toward the mouse (the existing light sheen follows it).
      On Android phones the artwork drifts a few pixels as the phone tilts. iPhones would show a motion-permission
      prompt for this, so they're left still. All of it is off for reduced-motion visitors and while a card is dragged.
   5. TYPE & SPACE: on large screens the side columns get calmer, consistent sizes and a little more room. */
(function(){
if(typeof openDetail!=="function"||typeof showSheet!=="function")return;
const reduce=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---- 3. extras per project id ---- */
const EXTRAS={
  /* "trill-goods": { quote:{text:"…",by:"…"}, mockups:["https://…/tee-front.jpg"], video:"https://…/loop.mp4" }, */
};
window.PD_EXTRAS=EXTRAS;

const css=`
img.pd-ld{opacity:0;filter:blur(14px);transform:scale(1.03)}
.dcard .art img,.bigart img,.ss-slide img,.wcard .art img,.pd-mock img{transition:opacity .5s ease,filter .7s ease,transform .7s cubic-bezier(.22,1,.36,1)}
@media (prefers-reduced-motion:reduce){img.pd-ld{filter:none;transform:none}}
.pd-quote{margin:0;padding:16px 18px;border-left:3px solid var(--ink);background:var(--surface);border-radius:4px 12px 12px 4px}
.pd-quote p{margin:0;font-size:17px;line-height:1.45;font-style:italic}
.pd-quote cite{display:block;margin-top:10px;font-style:normal;font-family:var(--f-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.pd-inuse>.mono{color:var(--muted);margin-bottom:10px}
.pd-mocks{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:6px;-webkit-overflow-scrolling:touch}
.pd-mock{flex:0 0 72%;max-width:320px;aspect-ratio:4/5;border-radius:12px;overflow:hidden;background:var(--surface);scroll-snap-align:start;position:relative}
.pd-mock img,.pd-mock video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pd-mock.vid{flex-basis:72%}
.sheet.pd-grow .body>*{animation:pdIn .5s cubic-bezier(.22,1,.36,1) both}
.sheet.pd-grow .body>*:nth-child(2){animation-delay:.04s}.sheet.pd-grow .body>*:nth-child(3){animation-delay:.08s}
.sheet.pd-grow .body>*:nth-child(4){animation-delay:.12s}.sheet.pd-grow .body>*:nth-child(n+5){animation-delay:.16s}
#deck{perspective:1400px}
#deck .dcard.top{transition:rotate .18s ease-out}
#deck .dcard.top.pd-tilt-off{transition:rotate .6s cubic-bezier(.22,1,.36,1)}
#deck .dcard.top .fx-glare{transition:opacity .35s}
#deck .dcard.top .art img{translate:var(--pd-px,0) var(--pd-py,0)}
@media (min-width:1100px){
  header{padding-block:16px}
  .swipe{padding-block:24px;gap:clamp(28px,3.4vw,52px)}
  .meta{gap:16px}
  .meta h2{font-size:26px;letter-spacing:-.005em;line-height:1.05}
  .meta p{font-size:15px;line-height:1.6;max-width:32ch}
  .meta .spec,.meta dl{font-size:11px;letter-spacing:.06em;row-gap:8px}
  .hints{gap:12px;font-size:11px;letter-spacing:.06em}
  .hints div:last-child{font-size:13px!important;line-height:1.55;max-width:26ch!important}
}
@keyframes pdIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
`;
const st=document.createElement("style");st.id="pd-premium";st.textContent=css;document.body.appendChild(st);

/* ---- 1. soft load ---- */
const SEL=".dcard .art img,.bigart img,.ss-slide img,.wcard .art img,.pd-mock img";
function soft(img){
  if(img._pdSoft)return;img._pdSoft=1;
  if(img.complete&&img.naturalWidth)return;          // already there: no flash
  img.classList.add("pd-ld");
  const done=()=>requestAnimationFrame(()=>img.classList.remove("pd-ld"));
  img.addEventListener("load",done,{once:true});img.addEventListener("error",done,{once:true});
}
const scan=root=>{if(root.matches&&root.matches(SEL))soft(root);root.querySelectorAll&&root.querySelectorAll(SEL).forEach(soft)};
new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>n.nodeType===1&&scan(n)))).observe(document.body,{childList:true,subtree:true});
scan(document.body);

/* ---- 2. card grows into the project view ---- */
if(typeof flyOpen==="function"&&Element.prototype.animate){
  const _flyOpen=flyOpen;
  flyOpen=function(card,p,afterHide,ms){
    if(!card||!card.classList||!card.classList.contains("dcard")||reduce())return _flyOpen.apply(this,arguments);
    const from=card.getBoundingClientRect();
    card.style.visibility="hidden";afterHide&&afterHide();
    openDetail(p);
    const s=typeof scrim!=="undefined"?scrim:document.querySelector(".scrim"),sheet=s&&s.querySelector(".sheet");
    if(!sheet){card.style.visibility="";return}
    s._fly={card};
    sheet.style.transition="none";sheet.style.transform="none";
    const to=sheet.getBoundingClientRect();
    const sx=from.width/to.width,sy=from.height/to.height,dx=from.left-to.left,dy=from.top-to.top;
    sheet.classList.add("pd-grow");
    const a=sheet.animate([
      {transformOrigin:"0 0",transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`,borderRadius:"14px"},
      {transformOrigin:"0 0",transform:"none",borderRadius:"20px"}
    ],{duration:ms||480,easing:"cubic-bezier(.22,1,.36,1)"});
    a.onfinish=a.oncancel=()=>{sheet.style.transition="";sheet.style.transform="";setTimeout(()=>sheet.classList.remove("pd-grow"),400)};
    /* a copy of the card rides on top and fades out as the project view takes its place */
    const g=card.cloneNode(true);g.removeAttribute("id");g.style.cssText=`position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;margin:0;transform:none;visibility:visible;opacity:1;z-index:260;pointer-events:none;transition:none`;
    document.body.appendChild(g);
    const ga=g.animate([
      {transformOrigin:"0 0",transform:"none",opacity:1},
      {transformOrigin:"0 0",transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`,opacity:0}
    ],{duration:(ms||480)*.7,easing:"cubic-bezier(.4,0,.2,1)",fill:"forwards"});
    ga.onfinish=ga.oncancel=()=>g.remove();
  };
  /* the ↑ button opens the same way as tapping the card */
  const ob=document.getElementById("btnOpen");
  if(ob)ob.onclick=()=>{try{const list=L();if(idx>=list.length)return;flyOpen(document.querySelector("#deck .dcard.top"),list[idx])}catch(e){}};
}

/* ---- 3. extras in the opened project ---- */
const _od=openDetail;
openDetail=function(p){
  const r=_od.apply(this,arguments);
  try{
    const x=p&&!p.kind&&(EXTRAS[p.id]||p.extras);if(!x)return r;
    const s=typeof scrim!=="undefined"?scrim:document.querySelector(".scrim"),body=s&&s.querySelector(".sheet .body");if(!body)return r;
    const desc=body.querySelector(":scope>p");
    let h="";
    if(x.quote&&x.quote.text)h+=`<blockquote class="pd-quote"><p>“${esc(x.quote.text)}”</p>${x.quote.by?`<cite>${esc(x.quote.by)}</cite>`:""}</blockquote>`;
    const m=(x.mockups||[]).filter(Boolean);
    if(m.length||x.video)h+=`<div class="pd-inuse"><div class="mono">In use</div><div class="pd-mocks">${
      x.video?`<div class="pd-mock vid"><video src="${esc(x.video)}" muted loop playsinline autoplay preload="metadata"></video></div>`:""}${
      m.map(u=>`<div class="pd-mock"><img src="${esc(u)}" alt="${esc(p.title)} in use" loading="lazy" decoding="async"></div>`).join("")}</div></div>`;
    if(h)(desc||body.firstElementChild).insertAdjacentHTML("afterend",h);
    if(reduce())body.querySelectorAll("video[autoplay]").forEach(v=>{v.removeAttribute("autoplay");v.controls=true});
  }catch(e){}
  return r;
};
/* ---- 4. depth ---- */
if(!reduce()){
  const deck=document.getElementById("deck");
  if(deck&&matchMedia("(hover:hover) and (pointer:fine)").matches){
    let raf=0,ev=null,down=false;
    const top=()=>deck.querySelector(".dcard.top");
    const reset=c=>{if(!c)return;c.classList.add("pd-tilt-off");c.style.rotate="";setTimeout(()=>c.classList.remove("pd-tilt-off"),600)};
    deck.addEventListener("pointerdown",()=>{down=true;reset(top())});
    addEventListener("pointerup",()=>{down=false});
    deck.addEventListener("pointermove",e=>{
      if(e.pointerType!=="mouse"||down||e.buttons)return;ev=e;if(raf)return;
      raf=requestAnimationFrame(()=>{raf=0;const c=top();if(!c||!ev||c.classList.contains("fx-gone"))return;
        const r=c.getBoundingClientRect(),nx=Math.max(-1,Math.min(1,(ev.clientX-r.left)/r.width*2-1)),ny=Math.max(-1,Math.min(1,(ev.clientY-r.top)/r.height*2-1));
        const a=5*Math.min(1,Math.hypot(nx,ny));
        c.style.rotate=a<.05?"":`${(-ny).toFixed(3)} ${nx.toFixed(3)} 0 ${a.toFixed(2)}deg`});
    });
    deck.addEventListener("pointerleave",()=>reset(top()));
    /* a flung card shouldn't keep its tilt */
    if(typeof fly==="function"){const _f=fly;fly=function(el){const c=el||top();if(c)c.style.rotate="";return _f.apply(this,arguments)}}
  }else if(deck&&typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission!=="function"){
    let raf=0,b0=null;
    addEventListener("deviceorientation",e=>{
      if(e.gamma==null||raf)return;
      raf=requestAnimationFrame(()=>{raf=0;if(b0===null)b0=e.beta;
        const x=Math.max(-1,Math.min(1,e.gamma/25)),y=Math.max(-1,Math.min(1,(e.beta-b0)/25));
        deck.style.setProperty("--pd-px",(x*6).toFixed(1)+"px");deck.style.setProperty("--pd-py",(y*6).toFixed(1)+"px")});
    });
  }
}
})();
