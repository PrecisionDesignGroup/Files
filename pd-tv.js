/* ---------- PORTFOLIO: "As Seen on TV" ad card ----------
   The 10th card under "All" is a late-night TV order screen for one premade graphic from the shop.
   Tapping it (or the up arrow) takes you to that graphic in Shop > Graphics. Swiping moves past it (no shortlist).
   To advertise a different graphic, change PID; the title, price and photo come from the shop listing. */
(function(){
if(typeof PROJECTS==="undefined"||typeof SHOP==="undefined"||typeof artFor!=="function")return;
const PID="g6";          /* Precision.fm */
const POS=9;             /* 0-based: the 10th card */
const P=SHOP.find(p=>p.id===PID);if(!P)return;
const m=/(\d+)(?:\.(\d{2}))?/.exec(P.price||"");const DOL=m?m[1]:"",CTS=m?(m[2]||"00"):"";
const TV={id:"pd-tv",tv:true,cat:"Shop",client:"As Seen on TV",title:P.title,discipline:"Shop · "+(P.price||""),year:"2026",
  blurb:`Order ${P.title}, a premade graphic, for ${P.price}. Tap the card to see it in the shop.`,
  bg:"#2347B5",fg:"#FFFFFF",inks:["#2347B5","#FFE800","#FFFFFF"],formats:[],gallery:[]};
const isTV=p=>!!(p&&p.tv);
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

const st=document.createElement("style");st.textContent=`
.tv-art{position:absolute;inset:0;container-type:size;overflow:hidden;cursor:pointer;
  background:radial-gradient(90% 75% at 50% 42%,#4f7ee6 0%,#305fd0 45%,#1f42a8 100%)}
.tv-in{position:absolute;inset:0;--u:min(1cqw,.74cqh);padding:calc(var(--u)*5.5) calc(var(--u)*5) 70px;display:flex;flex-direction:column;justify-content:space-evenly;gap:calc(var(--u)*1.6);
  font-family:"Arial Black","Arial Bold",Arial,Helvetica,sans-serif;font-weight:900;color:#fff;filter:blur(.25px) saturate(1.12);text-shadow:.06em .06em 0 rgba(10,20,70,.55)}
.tv-top{display:grid;grid-template-columns:min(44%,37cqh) 1fr;gap:calc(var(--u)*3.5);align-items:center}
.tv-shot{position:relative;aspect-ratio:4/5;border-radius:calc(var(--u)*.8);overflow:hidden;background:${P.imageBg||"#A6DCC8"};
  box-shadow:0 0 0 calc(var(--u)*.5) rgba(255,255,255,.18),0 calc(var(--u)*1.2) calc(var(--u)*2.4) rgba(5,12,50,.55)}
.dcard .art .tv-shot img,.tv-shot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover!important;filter:contrast(1.06) saturate(1.1) blur(.35px)}
.tv-shot::after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.18),transparent 40%),radial-gradient(120% 90% at 50% 50%,transparent 60%,rgba(0,0,0,.35))}
.tv-side{display:flex;flex-direction:column;align-items:center;text-align:center;min-width:0;width:100%;max-width:calc(var(--u)*44);justify-self:center}
.tv-cards{display:flex;gap:calc(var(--u)*1.2);margin-bottom:calc(var(--u)*1.6)}
.tv-cards i{width:calc(var(--u)*8);height:calc(var(--u)*5.2);border-radius:calc(var(--u)*.6);display:grid;place-items:center;font-style:normal;font-size:calc(var(--u)*1.7);letter-spacing:-.02em;text-shadow:none;box-shadow:0 calc(var(--u)*.4) calc(var(--u)*.8) rgba(0,0,0,.35)}
.tv-cards .v{background:#fff;color:#1a1f71;font-style:italic}
.tv-cards .mc{background:#fff;position:relative}
.tv-cards .mc::before,.tv-cards .mc::after{content:"";position:absolute;top:22%;width:38%;height:56%;border-radius:50%}
.tv-cards .mc::before{left:16%;background:#eb001b}.tv-cards .mc::after{right:16%;background:#f79e1b;mix-blend-mode:multiply}
.tv-cards .ax{background:#2e77bb;color:#fff;font-size:calc(var(--u)*1.5)}
.tv-cards .ap{background:#111;color:#fff;font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:calc(var(--u)*1.6)}
.tv-nocod{font-size:calc(var(--u)*3.3);line-height:1.05}
.tv-price{display:flex;align-items:flex-start;justify-content:center;color:#FFE800;font-style:italic;line-height:.82;margin:calc(var(--u)*.8) 0;
  -webkit-text-stroke:calc(var(--u)*.35) #1d1d1d;paint-order:stroke fill;text-shadow:calc(var(--u)*.7) calc(var(--u)*.7) 0 #0d1640}
.tv-price .d{font-size:calc(var(--u)*6);margin-top:calc(var(--u)*1)}
.tv-price .n{font-size:calc(var(--u)*15.5);letter-spacing:-.04em}
.tv-price .c{font-size:calc(var(--u)*6.4);margin-top:calc(var(--u)*.6)}
.tv-fine{font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:calc(var(--u)*2.3);line-height:1.15;align-self:flex-end;text-align:right}
.tv-tiny{font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:calc(var(--u)*1.9);color:#FFE800;margin-top:calc(var(--u)*.8);opacity:.95}
.tv-url{display:block;width:100%;height:auto}
.dcard .art svg.tv-url{width:100%!important;height:auto!important}
.tv-guar{text-align:center;font-style:italic;color:#FFE8A0;font-size:calc(var(--u)*3.4)}
.tv-order{display:grid;grid-template-columns:auto 1fr;gap:calc(var(--u)*3);align-items:start}
.tv-order small{font-size:calc(var(--u)*2.5);line-height:1.1;display:block;padding-top:calc(var(--u)*.8)}
.tv-order div{font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:calc(var(--u)*3);line-height:1.25;text-align:center}
.tv-order b{display:block;font-size:calc(var(--u)*5);line-height:1.1}
.tv-foot{font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:calc(var(--u)*2.2);text-align:center;opacity:.92}
/* the TV: scan lines, vignette, a slow tracking band */
.tv-art::before{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.13) 0 1px,transparent 1px 3px);mix-blend-mode:multiply}
.tv-art::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(130% 100% at 50% 50%,transparent 62%,rgba(0,0,20,.45))}
/* tall cards (phones): everything a size up so it fills the screen like the real thing */
@container (max-aspect-ratio:4/5){.tv-in{--u:min(1.1cqw,.6cqh)}.tv-top{grid-template-columns:49% 1fr;gap:calc(var(--u)*3)}.tv-guar{font-size:calc(var(--u)*4)}.tv-order b{font-size:calc(var(--u)*5.6)}.tv-order div{font-size:calc(var(--u)*3.4)}.tv-foot{font-size:calc(var(--u)*2.5)}}
.tv-band{position:absolute;left:0;right:0;height:14%;top:-20%;z-index:3;pointer-events:none;background:linear-gradient(transparent,rgba(255,255,255,.07),transparent);animation:tvBand 7s linear infinite}
@keyframes tvBand{to{top:120%}}
.dcard:not(.top) /* tall cards (phones): everything a size up so it fills the screen like the real thing */
@container (max-aspect-ratio:4/5){.tv-in{--u:min(1.1cqw,.6cqh)}.tv-top{grid-template-columns:49% 1fr;gap:calc(var(--u)*3)}.tv-guar{font-size:calc(var(--u)*4)}.tv-order b{font-size:calc(var(--u)*5.6)}.tv-order div{font-size:calc(var(--u)*3.4)}.tv-foot{font-size:calc(var(--u)*2.5)}}
.tv-band{animation:none;display:none}
@media (prefers-reduced-motion:reduce){/* tall cards (phones): everything a size up so it fills the screen like the real thing */
@container (max-aspect-ratio:4/5){.tv-in{--u:min(1.1cqw,.6cqh)}.tv-top{grid-template-columns:49% 1fr;gap:calc(var(--u)*3)}.tv-guar{font-size:calc(var(--u)*4)}.tv-order b{font-size:calc(var(--u)*5.6)}.tv-order div{font-size:calc(var(--u)*3.4)}.tv-foot{font-size:calc(var(--u)*2.5)}}
.tv-band{display:none}}
.pg-tile[aria-label^="As Seen on TV, "]{display:none!important}
`;document.head.appendChild(st);

function art(){
  return `<div class="tv-art" role="img" aria-label="TV ad for ${esc(P.title)}, ${esc(P.price)}"><div class="tv-in">
    <div class="tv-top">
      <div class="tv-shot"><img src="${esc(P.image||"")}" alt="" draggable="false"></div>
      <div class="tv-side">
        <div class="tv-cards" aria-hidden="true"><i class="v">VISA</i><i class="mc"></i><i class="ax">AMEX</i><i class="ap">Pay</i></div>
        <div class="tv-nocod">No Dial-Up<br>Needed!</div>
        <div class="tv-price"><span class="d">$</span><span class="n">${esc(DOL)}</span><span class="c">${esc(CTS)}</span></div>
        <div class="tv-fine">Plus $0 S+H<br>It's a Digital File!</div>
        <div class="tv-tiny">Must Have Taste to Order</div>
      </div>
    </div>
    <svg class="tv-url" viewBox="0 0 1000 118" aria-label="precisiondesign.club"><text x="500" y="96" text-anchor="middle" textLength="980" lengthAdjust="spacingAndGlyphs"
      font-family="Arial Black,Arial Bold,Arial,Helvetica,sans-serif" font-weight="900" font-style="italic" font-size="104" fill="#FFE800" stroke="#1d1d1d" stroke-width="9" paint-order="stroke"
      style="filter:drop-shadow(7px 7px 0 #0d1640)">PRECISIONDESIGN.CLUB</text></svg>
    <div class="tv-guar">HQ File in 1–48 Hours!</div>
    <div class="tv-order"><small>Send Your<br>Order To:</small><div><b>Precision Design</b>Shop › Graphics<br>"${esc(P.title)}"</div></div>
    <div class="tv-foot">Precision Design Group, precisiondesign.club/shop</div>
  </div><i class="tv-band"></i></div>`;
}
const _artFor=artFor;
artFor=function(p){return isTV(p)?art():_artFor.apply(this,arguments)};

/* tap the card (or the up arrow / Enter): straight to the graphic in the shop */
function goTo(){
  if(typeof closeSheetNow==="function")closeSheetNow();
  if(typeof mode!=="undefined"&&mode!=="wallet"&&typeof setMode==="function")setMode("wallet");
  if(typeof scat!=="undefined"&&scat!=="Graphics"&&typeof setCat==="function")setCat("Graphics");
  const i=SL().findIndex(p=>p.id===PID);if(i<0)return;
  idx=i;try{history.length=0}catch(e){}renderDeck();renderMeta();
  const c=document.querySelector("#deck .dcard.top");if(c&&!reduce)c.animate([{transform:"scale(.94)",filter:"brightness(1.4)"},{transform:"none",filter:"none"}],{duration:520,easing:"cubic-bezier(.2,.9,.25,1.1)"});
}
if(typeof openDetail==="function"){let lastI=-1;const _od=openDetail;openDetail=function(p){
  if(isTV(p)){const sh=document.querySelector(".scrim .sheet"),L0=PL(),i=L0.indexOf(p);
    if(sh&&lastI>=0&&i>=0&&L0.length>1)return openDetail(L0[(i+(lastI>i?-1:1)+L0.length)%L0.length]);   /* arrows in an open project step over it */
    return goTo()}
  lastI=PL().indexOf(p);return _od.apply(this,arguments)}}
if(typeof openProduct==="function"){const _op=openProduct;openProduct=function(p){return isTV(p)?goTo():_op.apply(this,arguments)}}

/* swiping either way moves past it */
if(typeof fly==="function"){const _fly=fly;fly=function(el,dir){
  const p=idx<L().length?L()[idx]:null;if(!isTV(p))return _fly.apply(this,arguments);
  const had=shortlist.has(p.id),r=_fly.apply(this,arguments);
  if(!had&&shortlist.has(p.id)){shortlist.delete(p.id);persist();updateCount();const t=document.getElementById("toast");if(t)t.classList.remove("on")}
  return r}}

/* desktop info panel */
if(typeof renderMeta==="function"){const _rm=renderMeta;renderMeta=function(){const r=_rm.apply(this,arguments);
  const el=document.getElementById("swipeMeta"),p=typeof mode!=="undefined"&&mode==="swipe"&&idx<L().length?L()[idx]:null;
  if(el&&isTV(p))el.innerHTML=`<div class="idx">${pad(idx+1)}<small> / ${pad(L().length)}</small></div><h2>As Seen on TV</h2><p>${esc(TV.blurb)}</p>
    <dl class="spec mono"><dt>Graphic</dt><dd>${esc(P.title)}</dd><dt>Price</dt><dd>${esc(P.price)}</dd><dt>Delivery</dt><dd>${esc(P.delivery||"")}</dd></dl>`;
  return r}}

PROJECTS.splice(Math.min(POS,PROJECTS.length),0,TV);
if(typeof mode!=="undefined"&&mode==="swipe"&&pcat==="All"&&idx>=POS-2&&idx<=POS){try{renderDeck()}catch(e){}}
try{if(typeof renderPockets==="function")renderPockets()}catch(e){}
})();
