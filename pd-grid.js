/* ---------- PORTFOLIO: grid view (Pinterest-style masonry) ----------
   A "Grid view" pill sits where "See on Garment" sits in the shop (bottom left of the card, inline with the card
   buttons). It opens every project in the current portfolio tab as a masonry grid under the header: tiles cascade in,
   images fade up as they load, hovering lifts a tile, the ribbon saves to the shortlist, and tapping opens the project.
   The header tabs filter the grid; "Card view" (or Esc) goes back to the cards. Opens straight away on #grid. */
(function(){
if(typeof PL!=="function"||typeof openDetail!=="function")return;
const wrap=document.querySelector("#swipeView .deckwrap");if(!wrap)return;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const css=`
.pg-toggle{position:absolute;left:10px;bottom:82px;height:50px;box-sizing:border-box;z-index:20;display:none;padding:5px;border-radius:999px;background:color-mix(in srgb,var(--surface) 72%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 8px 24px -12px var(--shadow)}
html.pg-ready .pg-toggle{display:block}
.pg-toggle button,.pg-back button{display:inline-flex;align-items:center;gap:5px;height:40px;padding:0 11px;border-radius:999px;background:var(--surface);border:1px solid var(--line);font:inherit;font-weight:600;font-size:10.5px;letter-spacing:-.01em;line-height:1.05;color:var(--ink);cursor:pointer;transition:transform .15s,background .2s;white-space:nowrap}
.pg-toggle button:active,.pg-back button:active{transform:scale(.94)}
.pg-toggle svg,.pg-back svg{width:13px;height:13px;flex:none}
.pg-toggle.pg-tight button{padding:0 9px;font-size:10px;white-space:normal;text-align:left;width:56px}
.pg-toggle.pg-tight svg{display:none}
.pg-toggle.pg-stack{bottom:138px}
.pg-view{position:fixed;left:0;right:0;bottom:0;top:var(--pg-top,64px);z-index:100;background:var(--bg);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;opacity:0;transition:opacity .35s ease}
.pg-view.on{opacity:1}
.pg-in{padding:18px var(--pg-x,16px) calc(110px + env(safe-area-inset-bottom,0px))}
.pg-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:2px 2px 16px}
.pg-head h2{margin:0;font-family:var(--f-display);font-weight:900;font-size:clamp(28px,6vw,52px);line-height:.9;text-transform:uppercase;color:var(--ink)}
.pg-head span{font-family:var(--f-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
.pg-grid{column-count:2;column-gap:10px}
@media (min-width:640px){.pg-grid{column-count:3;column-gap:14px}}
@media (min-width:1000px){.pg-grid{column-count:4;column-gap:16px}}
@media (min-width:1400px){.pg-grid{column-count:5}}
.pg-tile{position:relative;display:block;break-inside:avoid;margin:0 0 14px;cursor:pointer;-webkit-tap-highlight-color:transparent;opacity:0;transform:translateY(28px) scale(.97);transition:opacity .6s cubic-bezier(.2,.8,.2,1),transform .6s cubic-bezier(.2,.8,.2,1);transition-delay:var(--d,0ms)}
.pg-tile.in{opacity:1;transform:none}
.pg-img{position:relative;border-radius:14px;overflow:hidden;background:var(--c,#222);aspect-ratio:var(--ar,.72);box-shadow:0 1px 0 var(--line);transition:box-shadow .3s,transform .3s cubic-bezier(.2,.8,.2,1)}
.pg-img img,.pg-img svg{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;opacity:0;transform:scale(1.06);transition:opacity .7s ease,transform 1.1s cubic-bezier(.2,.8,.2,1)}
.pg-img svg{opacity:1;transform:none}
.pg-img img.ld{opacity:1;transform:scale(1)}
.pg-img::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.45),transparent 45%);opacity:0;transition:opacity .3s}
@media (hover:hover){
  .pg-tile:hover .pg-img{transform:translateY(-4px);box-shadow:0 18px 36px -18px var(--shadow)}
  .pg-tile:hover .pg-img img.ld{transform:scale(1.04)}
  .pg-tile:hover .pg-img::after{opacity:1}
  .pg-tile:hover .pg-save{opacity:1;transform:none}
}
.pg-tile:active .pg-img{transform:scale(.98)}
.pg-tile:focus-visible{outline:none}.pg-tile:focus-visible .pg-img{box-shadow:0 0 0 3px var(--accent)}
.pg-cap{padding:8px 4px 0;display:flex;flex-direction:column;gap:2px;min-width:0}
.pg-cap b{font-family:var(--f-display);font-weight:700;font-size:15px;line-height:1.1;text-transform:uppercase;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pg-cap span{font-family:var(--f-mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pg-save{position:absolute;top:8px;right:8px;z-index:2;width:34px;height:34px;display:grid;place-items:center;border-radius:50%;border:0;background:color-mix(in srgb,var(--surface) 80%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:var(--ink);cursor:pointer;opacity:.92;transition:opacity .25s,transform .25s,background .2s}
@media (hover:hover){.pg-save{opacity:0;transform:translateY(-4px)}}
.pg-save svg{width:15px;height:15px}
.pg-save[aria-pressed="true"]{background:var(--accent);color:#141414;opacity:1;transform:none}
.pg-back{position:fixed;left:var(--pg-x,16px);bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:101;padding:5px;border-radius:999px;background:color-mix(in srgb,var(--surface) 72%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 8px 24px -12px var(--shadow);opacity:0;transform:translateY(16px);transition:opacity .35s,transform .45s cubic-bezier(.2,.8,.2,1)}
.pg-back.on{opacity:1;transform:none}
.pg-back button{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.pg-empty{padding:40px 4px;color:var(--muted)}
${reduce?".pg-tile,.pg-img img,.pg-view,.pg-back{transition:none!important;transform:none!important}.pg-tile{opacity:1}":""}`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

const gridIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7.5" height="10" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="6" rx="1.5"/><rect x="3" y="16" width="7.5" height="5" rx="1.5"/><rect x="13.5" y="12" width="7.5" height="9" rx="1.5"/></svg>';
const cardIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M9 7h6"/></svg>';
const ribbon='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>';

const tg=document.createElement("div");tg.className="pg-toggle";
tg.innerHTML=`<button type="button" aria-label="Show the portfolio as a grid">${gridIcon}<span>Grid view</span></button>`;
wrap.appendChild(tg);
const view=document.createElement("div");view.className="pg-view";view.setAttribute("aria-label","Portfolio grid");view.hidden=true;
view.innerHTML=`<div class="pg-in"><div class="pg-head"><h2></h2><span></span></div><div class="pg-grid"></div></div>`;
const back=document.createElement("div");back.className="pg-back";back.hidden=true;
back.innerHTML=`<button type="button" aria-label="Back to card view">${cardIcon}<span>Card view</span></button>`;
document.body.append(view,back);
const grid=view.querySelector(".pg-grid");
let open=false,io=null;

/* Same fit rule as the garment pill: one line, then two short lines, then stacked above the buttons. */
function fit(){const c=wrap.querySelector(".controls");tg.classList.remove("pg-stack","pg-tight");if(!c)return;
  const ok=()=>{const a=tg.getBoundingClientRect(),b=c.getBoundingClientRect();return !(a.width&&b.width&&a.right>b.left-4)};
  if(ok())return;tg.classList.add("pg-tight");if(ok())return;tg.classList.remove("pg-tight");tg.classList.add("pg-stack")}
function sync(){const on=mode==="swipe";document.documentElement.classList.toggle("pg-ready",on);if(on)requestAnimationFrame(fit);if(!on&&open)close()}

const list=()=>PL().filter(p=>!p.nl);
function tile(p,i){
  const a=document.createElement("div");a.className="pg-tile";a.tabIndex=0;a.setAttribute("role","button");
  a.setAttribute("aria-label",`${p.client}, ${p.title}. Open project.`);
  const saved=typeof shortlist!=="undefined"&&shortlist.has(p.id);
  const c=p.image?(p.imageBg||"#111"):p.bg;
  a.style.setProperty("--c",c);
  a.innerHTML=`<div class="pg-img">${p.image?`<img alt="" draggable="false" loading="${i<12?"eager":"lazy"}" decoding="async">`:cover(p,"pg"+i)}</div>
    <button class="pg-save" type="button" aria-pressed="${saved}" aria-label="${saved?"Remove from":"Add to"} shortlist">${ribbon}</button>
    <div class="pg-cap"><b>${esc(p.title)}</b><span>${esc(p.client)}</span></div>`;
  const im=a.querySelector("img");
  if(im){im.onload=()=>{if(im.naturalWidth)a.style.setProperty("--ar",(im.naturalWidth/im.naturalHeight).toFixed(4));im.classList.add("ld")};
    im.onerror=()=>{im.replaceWith(Object.assign(document.createElement("div"),{innerHTML:cover(p,"pge"+i)}).firstChild)};im.src=p.image}
  else a.style.setProperty("--ar",".75");
  a.addEventListener("click",e=>{
    const s=e.target.closest(".pg-save");
    if(s){e.stopPropagation();if(typeof toggleShort==="function")toggleShort(p.id);const on=shortlist.has(p.id);s.setAttribute("aria-pressed",on);s.setAttribute("aria-label",(on?"Remove from":"Add to")+" shortlist");
      if(!reduce)s.animate([{transform:"scale(1)"},{transform:"scale(1.25)"},{transform:"scale(1)"}],{duration:320,easing:"cubic-bezier(.2,.8,.2,1)"});return}
    openDetail(p)});
  a.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openDetail(p)}});
  return a;
}
function render(){
  const L0=list(),cat=typeof pcat!=="undefined"?pcat:"All";
  view.querySelector(".pg-head h2").textContent=cat==="All"?"All projects":cat;
  view.querySelector(".pg-head span").textContent=`${L0.length} project${L0.length===1?"":"s"}`;
  if(io)io.disconnect();grid.innerHTML="";
  if(!L0.length){grid.innerHTML=`<p class="pg-empty">${esc(cat)} projects coming soon.</p>`;return}
  const tiles=L0.map(tile);tiles.forEach(t=>grid.appendChild(t));
  if(reduce){tiles.forEach(t=>t.classList.add("in"));return}
  /* cascade: tiles on screen come in one after another; the rest come in as they scroll into view */
  let n=0;
  io=new IntersectionObserver(es=>{es.forEach(e=>{if(!e.isIntersecting)return;const t=e.target;io.unobserve(t);
    t.style.setProperty("--d",Math.min(n++,14)*55+"ms");t.classList.add("in");setTimeout(()=>{n=Math.max(0,n-1)},120)})},{root:view,rootMargin:"0px 0px -6% 0px"});
  tiles.forEach(t=>io.observe(t));
}
function setTop(){const h=document.querySelector("header"),r=h&&h.getBoundingClientRect();view.style.setProperty("--pg-top",(r?Math.max(0,r.bottom):64)+"px");if(r&&r.width){const x=Math.max(16,Math.round(r.left))+"px";view.style.setProperty("--pg-x",x);back.style.setProperty("--pg-x",x)}}
function openGrid(){
  if(open||mode!=="swipe")return;open=true;setTop();view.hidden=false;back.hidden=false;view.scrollTop=0;render();
  requestAnimationFrame(()=>{view.classList.add("on");back.classList.add("on")});
  try{history.replaceState(null,"","#grid")}catch(e){}
  if(typeof sfx==="function")try{sfx("soft")}catch(e){}
}
function close(){
  if(!open)return;open=false;view.classList.remove("on");back.classList.remove("on");
  if(location.hash==="#grid")try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}
  setTimeout(()=>{if(!open){view.hidden=true;back.hidden=true;if(io)io.disconnect();grid.innerHTML=""}},reduce?0:380);
}
tg.querySelector("button").onclick=openGrid;
back.querySelector("button").onclick=close;
addEventListener("resize",()=>{if(open)setTop();else if(mode==="swipe")fit()});
/* while the grid is open the arrow keys shouldn't swipe the hidden cards; Esc closes it (after any open sheet) */
addEventListener("keydown",e=>{if(!open||document.querySelector(".scrim"))return;
  if(e.key==="Escape"){e.stopImmediatePropagation();close();return}
  if(["ArrowLeft","ArrowRight","ArrowUp","z","Z"].includes(e.key)&&!(e.target&&e.target.closest&&e.target.closest("input,textarea")))e.stopImmediatePropagation()},true);

/* header tabs filter the grid; switching to the shop closes it */
if(typeof setCat==="function"){const _setCat=setCat;setCat=function(){const r=_setCat.apply(this,arguments);if(open&&pcat!==lastCat){lastCat=pcat;view.scrollTop=0;render()}return r}}
if(typeof setMode==="function"){const _setMode=setMode;setMode=function(){const r=_setMode.apply(this,arguments);sync();return r}}
let lastCat=typeof pcat!=="undefined"?pcat:"All";
if(typeof renderPockets==="function"){const _rp=renderPockets;renderPockets=function(){const r=_rp.apply(this,arguments);if(open){setTop();if(pcat!==lastCat){lastCat=pcat;view.scrollTop=0;render()}}else lastCat=pcat;return r}}
sync();
if(location.hash==="#grid"&&mode==="swipe")openGrid();
})();
