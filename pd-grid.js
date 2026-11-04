/* ---------- PORTFOLIO: grid view (Pinterest-style masonry) ----------
   A "Grid view" pill sits where "See on Garment" sits in the shop (bottom left of the card, inline with the card
   buttons). It opens every project in the current portfolio tab as a masonry grid under the header: tiles cascade in,
   images fade up as they load, hovering lifts a tile, the ribbon saves to the shortlist, and tapping opens the project.
   A row of category tabs sits right above the grid and filters it (the header only shows All and Play);
   "Card view" (or Esc) goes back to the cards. Opens straight away on #grid.
   2026-11-04: the pill is now a round "views" icon that opens a small menu: Grid or Scroll. Scroll is a single column
   you read top to bottom (big image, title, client, discipline, short description, press). A Cards | Grid | Scroll
   switch at the bottom moves between all three. Opens straight away on #scroll too. */
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
.pg-cats{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;margin:0 0 16px;padding:2px 0}
.pg-cats::-webkit-scrollbar{display:none}
.pg-cats .pocket-tab{cursor:pointer;font:inherit;font-weight:600;font-size:12px}
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
/* views icon + menu on the card */
.pg-toggle .pg-vbtn{width:40px;padding:0;justify-content:center}
.pg-toggle .pg-vbtn svg{width:18px;height:18px}
.pg-toggle.pg-tight .pg-vbtn{width:40px;padding:0}.pg-toggle.pg-tight .pg-vbtn svg{display:block}
.pg-menu{position:absolute;left:0;bottom:calc(100% + 8px);display:flex;flex-direction:column;gap:2px;padding:6px;min-width:168px;border-radius:16px;background:var(--surface);border:1px solid var(--line);
  box-shadow:0 18px 40px -16px var(--shadow);opacity:0;transform:translateY(6px) scale(.97);transform-origin:bottom left;pointer-events:none;transition:opacity .2s,transform .25s cubic-bezier(.2,.8,.2,1)}
.pg-menu.on{opacity:1;transform:none;pointer-events:auto}
.pg-menu .pg-mi{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;font-weight:600;font-size:14px;color:var(--ink);cursor:pointer}
.pg-menu .pg-mi:hover,.pg-menu .pg-mi:focus-visible{background:color-mix(in srgb,var(--ink) 7%,transparent)}
.pg-menu .pg-mi svg{width:17px;height:17px;flex:none}
.pg-menu .pg-mi small{margin-left:auto;font-family:var(--f-mono);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:400}
/* Cards | Grid | Scroll switch inside the view */
.pg-back{display:flex;gap:4px}
.pg-back button{background:transparent;color:var(--ink);border-color:transparent}
.pg-back button[aria-current="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
/* scroll view: one column */
.pg-feed{display:flex;flex-direction:column;gap:34px;max-width:620px;margin:0 auto}
.pg-view.pg-scroll .pg-cats{max-width:620px;margin-inline:auto}
.pg-post{opacity:0;transform:translateY(30px);transition:opacity .7s cubic-bezier(.2,.8,.2,1),transform .7s cubic-bezier(.2,.8,.2,1)}
.pg-post.in{opacity:1;transform:none}
.pg-post .pg-img{aspect-ratio:var(--ar,.8);border-radius:18px;cursor:pointer}
.pg-post .pg-img img{object-fit:contain;background:var(--c)}
.pg-post .pg-save{opacity:.92;transform:none}
.pg-meta{padding:14px 2px 0;display:grid;gap:6px}
.pg-meta .cl{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.pg-meta h3{margin:0;font-family:var(--f-display);font-weight:800;font-size:clamp(26px,7vw,36px);line-height:.95;text-transform:uppercase;color:var(--ink);cursor:pointer}
.pg-meta p{margin:4px 0 0;font-size:15px;line-height:1.5;color:var(--ink);opacity:.85;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.pg-meta .tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.pg-meta .tags span{font-family:var(--f-mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:5px 9px;border-radius:999px;border:1px solid var(--line);color:var(--muted)}
.pg-meta .tags span.press{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.pg-meta .row{display:flex;gap:8px;margin-top:10px}
.pg-meta .row button{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:600;font-size:13px;cursor:pointer}
.pg-meta .row button.solid{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.pg-meta .row svg{width:14px;height:14px}
${reduce?".pg-tile,.pg-post,.pg-img img,.pg-view,.pg-back{transition:none!important;transform:none!important}.pg-tile,.pg-post{opacity:1}":""}`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

const gridIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7.5" height="10" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="6" rx="1.5"/><rect x="3" y="16" width="7.5" height="5" rx="1.5"/><rect x="13.5" y="12" width="7.5" height="9" rx="1.5"/></svg>';
const cardIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M9 7h6"/></svg>';
const scrollIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="2.5" width="16" height="9" rx="2"/><path d="M4 15h16M4 18.5h10M4 22h13"/></svg>';
const viewsIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="18" height="3" rx="1.2"/><rect x="3" y="19" width="18" height="2" rx="1"/></svg>';
const ribbon='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>';

const tg=document.createElement("div");tg.className="pg-toggle";
tg.innerHTML=`<button type="button" class="pg-vbtn" aria-label="Change view" aria-haspopup="menu" aria-expanded="false">${viewsIcon}</button>
  <div class="pg-menu" role="menu"><button type="button" class="pg-mi" role="menuitem" data-v="grid">${gridIcon}Grid<small>Overview</small></button><button type="button" class="pg-mi" role="menuitem" data-v="scroll">${scrollIcon}Scroll<small>One by one</small></button></div>`;
wrap.appendChild(tg);
const view=document.createElement("div");view.className="pg-view";view.setAttribute("aria-label","Portfolio grid");view.hidden=true;
view.innerHTML=`<div class="pg-in"><nav class="pg-cats" aria-label="Categories"></nav><div class="pg-grid"></div></div>`;
const back=document.createElement("div");back.className="pg-back";back.hidden=true;
back.innerHTML=`<button type="button" aria-label="Back to card view" data-v="cards">${cardIcon}<span>Cards</span></button><button type="button" aria-label="Grid view" data-v="grid">${gridIcon}<span>Grid</span></button><button type="button" aria-label="Scroll view" data-v="scroll">${scrollIcon}<span>Scroll</span></button>`;
document.body.append(view,back);
const grid=view.querySelector(".pg-grid"),cats=view.querySelector(".pg-cats");
let open=false,io=null,gcat="All",layout="grid";

/* Same fit rule as the garment pill: one line, then two short lines, then stacked above the buttons. */
function fit(){const c=wrap.querySelector(".controls");tg.classList.remove("pg-stack","pg-tight");if(!c)return;
  const ok=()=>{const a=tg.getBoundingClientRect(),b=c.getBoundingClientRect();return !(a.width&&b.width&&a.right>b.left-4)};
  if(ok())return;tg.classList.add("pg-tight");if(ok())return;tg.classList.remove("pg-tight");tg.classList.add("pg-stack")}
function sync(){const on=mode==="swipe";document.documentElement.classList.toggle("pg-ready",on);if(on)requestAnimationFrame(fit);if(!on&&open)close()}

/* the grid keeps its own category (the header is pinned to All while Play is installed) */
const inCat=(p,c)=>c==="All"||(typeof catsOf==="function"?catsOf(p):[p.cat]).includes(c);
const list=()=>PROJECTS.filter(p=>!p.nl&&inCat(p,gcat));
function renderCats(){
  const all=PROJECTS.filter(p=>!p.nl);
  const tabs=["All",...(typeof CATS!=="undefined"?CATS:[])];
  cats.innerHTML=tabs.map(c=>`<button type="button" class="pocket-tab" aria-pressed="${c===gcat}" data-cat="${esc(c)}">${esc(c)}<span>${all.filter(p=>inCat(p,c)).length}</span></button>`).join("");
}
cats.addEventListener("click",e=>{const b=e.target.closest(".pocket-tab");if(!b||b.dataset.cat===gcat)return;
  gcat=b.dataset.cat;renderCats();view.scrollTop=0;render();
  if(typeof sfx==="function")try{sfx("soft")}catch(e){}});
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
function post(p,i){
  const a=document.createElement("article");a.className="pg-post";
  const saved=typeof shortlist!=="undefined"&&shortlist.has(p.id);
  a.style.setProperty("--c",p.image?(p.imageBg||"#111"):p.bg);
  const x=(window.PD_PRESS||{})[p.id]||{},pr=(x.press||[]);
  const tags=[...pr.slice(0,3).map(l=>`<span class="press">${esc(l.pub)}</span>`),p.discipline?`<span>${esc(p.discipline)}</span>`:"",p.year?`<span>${esc(p.year)}</span>`:""].join("");
  a.innerHTML=`<div class="pg-img" role="button" tabindex="0" aria-label="Open ${esc(p.title)}">${p.image?`<img alt="${esc(p.title)}" draggable="false" loading="${i<3?"eager":"lazy"}" decoding="async">`:cover(p,"ps"+i)}
      <button class="pg-save" type="button" aria-pressed="${saved}" aria-label="${saved?"Remove from":"Add to"} shortlist">${ribbon}</button></div>
    <div class="pg-meta"><span class="cl">${esc(p.client)}</span><h3>${esc(p.title)}</h3>${p.blurb?`<p>${esc(p.blurb)}</p>`:""}<div class="tags">${tags}</div>
      <div class="row"><button type="button" class="solid pg-open">View project</button></div></div>`;
  const im=a.querySelector("img");
  if(im){im.onload=()=>{if(im.naturalWidth)a.style.setProperty("--ar",(im.naturalWidth/im.naturalHeight).toFixed(4));im.classList.add("ld")};
    im.onerror=()=>{im.replaceWith(Object.assign(document.createElement("div"),{innerHTML:cover(p,"pse"+i)}).firstChild)};im.src=p.image}
  else a.style.setProperty("--ar",".8");
  a.addEventListener("click",e=>{
    const s=e.target.closest(".pg-save");
    if(s){e.stopPropagation();if(typeof toggleShort==="function")toggleShort(p.id);const on=shortlist.has(p.id);s.setAttribute("aria-pressed",on);s.setAttribute("aria-label",(on?"Remove from":"Add to")+" shortlist");
      if(!reduce)s.animate([{transform:"scale(1)"},{transform:"scale(1.25)"},{transform:"scale(1)"}],{duration:320,easing:"cubic-bezier(.2,.8,.2,1)"});return}
    if(e.target.closest(".pg-img,h3,.pg-open"))openDetail(p)});
  a.querySelector(".pg-img").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openDetail(p)}});
  return a;
}
function render(){
  const L0=list(),cat=gcat;
  grid.className=layout==="scroll"?"pg-feed":"pg-grid";view.classList.toggle("pg-scroll",layout==="scroll");
  view.setAttribute("aria-label",layout==="scroll"?"Portfolio, one by one":"Portfolio grid");
  back.querySelectorAll("button").forEach(b=>b.setAttribute("aria-current",String(b.dataset.v===layout)));
  if(io)io.disconnect();grid.innerHTML="";
  if(!L0.length){grid.innerHTML=`<p class="pg-empty">${esc(cat)} projects coming soon.</p>`;return}
  const tiles=L0.map(layout==="scroll"?post:tile);tiles.forEach(t=>grid.appendChild(t));
  if(reduce){tiles.forEach(t=>t.classList.add("in"));return}
  /* cascade: tiles on screen come in one after another; the rest come in as they scroll into view */
  let n=0;
  io=new IntersectionObserver(es=>{es.forEach(e=>{if(!e.isIntersecting)return;const t=e.target;io.unobserve(t);
    t.style.setProperty("--d",Math.min(n++,14)*55+"ms");t.classList.add("in");setTimeout(()=>{n=Math.max(0,n-1)},120)})},{root:view,rootMargin:"0px 0px -6% 0px"});
  tiles.forEach(t=>io.observe(t));
}
function setTop(){const h=document.querySelector("header"),r=h&&h.getBoundingClientRect();view.style.setProperty("--pg-top",(r?Math.max(0,r.bottom):64)+"px");if(r&&r.width){const x=Math.max(16,Math.round(r.left))+"px";view.style.setProperty("--pg-x",x);back.style.setProperty("--pg-x",x)}}
function openGrid(v){
  if(typeof v==="string")layout=v;menu(false);
  if(open){view.scrollTop=0;render();try{window.history.replaceState(null,"","#"+layout)}catch(e){}return}
  if(mode!=="swipe")return;open=true;setTop();view.hidden=false;back.hidden=false;view.scrollTop=0;renderCats();render();
  requestAnimationFrame(()=>{view.classList.add("on");back.classList.add("on")});
  try{window.history.replaceState(null,"","#"+layout)}catch(e){}
  if(typeof sfx==="function")try{sfx("soft")}catch(e){}
}
function close(){
  if(!open)return;open=false;view.classList.remove("on");back.classList.remove("on");
  if(location.hash==="#grid"||location.hash==="#scroll")try{window.history.replaceState(null,"",location.pathname+location.search)}catch(e){}
  setTimeout(()=>{if(!open){view.hidden=true;back.hidden=true;if(io)io.disconnect();grid.innerHTML=""}},reduce?0:380);
}
const vb=tg.querySelector(".pg-vbtn"),mn=tg.querySelector(".pg-menu");
function menu(on){mn.classList.toggle("on",on);vb.setAttribute("aria-expanded",String(on))}
vb.onclick=e=>{e.stopPropagation();menu(!mn.classList.contains("on"))};
mn.addEventListener("click",e=>{const b=e.target.closest(".pg-mi");if(b){e.stopPropagation();openGrid(b.dataset.v)}});
document.addEventListener("pointerdown",e=>{if(mn.classList.contains("on")&&!tg.contains(e.target))menu(false)},true);
back.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.v==="cards")close();else if(b.dataset.v!==layout)openGrid(b.dataset.v)});
addEventListener("resize",()=>{if(open)setTop();else if(mode==="swipe")fit()});
/* while the grid is open the arrow keys shouldn't swipe the hidden cards; Esc closes it (after any open sheet) */
addEventListener("keydown",e=>{if(!open||document.querySelector(".scrim"))return;
  if(e.key==="Escape"){e.stopImmediatePropagation();close();return}
  if(["ArrowLeft","ArrowRight","ArrowUp","z","Z"].includes(e.key)&&!(e.target&&e.target.closest&&e.target.closest("input,textarea")))e.stopImmediatePropagation()},true);

/* switching to the shop closes the grid */
if(typeof setMode==="function"){const _setMode=setMode;setMode=function(){const r=_setMode.apply(this,arguments);sync();return r}}
if(typeof renderPockets==="function"){const _rp=renderPockets;renderPockets=function(){const r=_rp.apply(this,arguments);if(open)setTop();return r}}
sync();
if((location.hash==="#grid"||location.hash==="#scroll")&&mode==="swipe")openGrid(location.hash.slice(1));
})();
