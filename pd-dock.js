/* ---------- Button bar below the card (2026-11-04) ----------
   The round buttons (undo, skip, save, open, light) and the Grid view / See on garment / Name your price pill
   used to float over the bottom of the card. They now sit in their own strip under the card, so the whole card
   (art and title strip) stays clear. The card gets shorter by the strip's height (--pd-dock).
   Since 2026-11-04 15:10 it is ONE full-width bar: the views button (or See on garment / Name your price in the shop) on
   the left, the card buttons spread across the rest. */
(function(){
const css=`
:root{--pd-gap:0px;--pd-dock:calc(62px + var(--pd-gap))}
/* phones and tablets: keep the buttons clear of the screen's bottom edge, the home bar and a bottom address bar */
@media (pointer:coarse){:root{--pd-gap:max(16px,env(safe-area-inset-bottom,0px))}}
html #deck.deck{height:calc(100svh - var(--hdr,56px) - 24px - var(--pd-dock) - var(--pd-cut,0px))}
html.pd-iosbar #deck.deck{height:calc(100svh - var(--hdr,56px) - 24px - var(--pd-bar,78px) - var(--pd-dock) - var(--pd-cut,0px))}
html.pd-iosfit #deck.deck{height:calc(100svh - var(--hdr,56px) - 12px - var(--pd-dock) - var(--pd-cut,0px))}
#swipeView .deckwrap{padding-bottom:var(--pd-dock)}
#swipeView .deckwrap>.controls,#swipeView .deckwrap>.pg-toggle,#swipeView .deckwrap>.nyp-toggle,#swipeView .deckwrap>.gm-toggle{bottom:calc(2px + var(--pd-gap));box-shadow:none}
#swipeView .deckwrap>.controls{right:0}
#swipeView .deckwrap>.pg-toggle,#swipeView .deckwrap>.nyp-toggle,#swipeView .deckwrap>.gm-toggle{left:0}
#swipeView .deckwrap.gm-on>.gm-toggle{bottom:calc(var(--gm-tray,210px) + 12px)}
/* one bar */
.pd-bar{position:absolute;left:0;right:0;bottom:calc(2px + var(--pd-gap));z-index:20;height:50px;box-sizing:border-box;display:flex;align-items:center;gap:6px;padding:5px;
  border-radius:999px;background:color-mix(in srgb,var(--surface) 72%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid var(--line)}
.pd-bar>.controls,.pd-bar>.pg-toggle,.pd-bar>.nyp-toggle,.pd-bar>.gm-toggle{position:static!important;inset:auto!important;height:40px!important;padding:0!important;background:none!important;box-shadow:none!important;
  -webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-radius:0!important}
.pd-bar>.pg-toggle,.pd-bar>.nyp-toggle,.pd-bar>.gm-toggle{flex:none}
.pd-bar>.controls{flex:1;min-width:0;display:flex;justify-content:space-evenly;align-items:center;gap:2px}
.pd-bar>.controls>*{flex:none}
@media (max-width:380px){
  .pd-bar{gap:4px;padding:4px}
  .pd-bar>.gm-toggle button{font-size:0!important;gap:0!important;width:40px;padding:0!important;justify-content:center}
  .pd-bar>.gm-toggle button svg{width:17px;height:17px}
  .pd-bar>.nyp-toggle button{font-size:10px!important;padding:0 8px!important;white-space:normal!important;text-align:left;width:62px;line-height:1.05}
  .pd-bar>.nyp-toggle button>svg{display:none}
}
.pd-bar .pd-sep{flex:none;width:1px;height:22px;background:var(--line)}
.pd-bar .pd-sep:first-child,.pd-bar .pd-sep:last-child{display:none}
.pd-bar>.pg-toggle.pg-tight button{width:40px}
.pg-back{height:50px;box-sizing:border-box;border:1px solid var(--line);box-shadow:none!important;padding:4px!important;gap:4px}
.pg-back.pd-matched{right:auto;bottom:auto}
.pg-back button{flex:1;justify-content:center;height:40px}
#swipeView .deckwrap.gm-on .pd-bar>.controls,#swipeView .deckwrap.gm-on .pd-bar>.pd-sep{display:none!important}
#deck .dcard .art img{padding-bottom:0!important}
html.pd-vopen #swipeView .pd-bar{position:fixed;right:auto;bottom:auto;z-index:103;box-shadow:0 10px 30px -14px var(--shadow)}
html.pd-vopen .pg-back{display:none!important}
.pg-menu .pg-mi[aria-current="true"]{background:color-mix(in srgb,var(--ink) 9%,transparent)}
.pg-menu .pg-mi[aria-current="true"]::after{content:"";width:6px;height:6px;border-radius:50%;background:var(--ink);margin-left:6px;flex:none}
.pd-coach{bottom:calc(var(--pd-dock) + 84px)!important}
#swipeView .deckwrap>.pg-toggle.pg-stack,#swipeView .deckwrap>.nyp-toggle.nyp-stack{bottom:calc(64px + var(--pd-gap))}
@media (min-width:1100px){html #deck.deck{height:calc(100svh - var(--hdr,56px) - 48px - var(--pd-dock) - var(--pd-cut,0px))}}
`;
const st=document.createElement("style");st.id="pd-dock";st.textContent=css;document.body.appendChild(st);
/* gather the left pill(s) and the card buttons into one bar */
function bar(){
  const w=document.querySelector("#swipeView .deckwrap"),c=w&&w.querySelector(".controls");if(!c)return;
  let b=w.querySelector(".pd-bar");
  if(!b){b=document.createElement("div");b.className="pd-bar";b.innerHTML='<i class="pd-sep" aria-hidden="true"></i>';w.appendChild(b)}
  const sep=b.querySelector(".pd-sep");
  w.querySelectorAll(":scope>.pg-toggle,:scope>.nyp-toggle,:scope>.gm-toggle").forEach(t=>b.insertBefore(t,sep));
  if(c.parentNode!==b)b.appendChild(c);
  /* hide the divider when no left pill is showing */
  const vis=[...b.querySelectorAll(".pg-toggle,.nyp-toggle,.gm-toggle")].some(t=>getComputedStyle(t).display!=="none");
  sep.style.display=vis?"block":"none";
}
bar();setTimeout(bar,400);setTimeout(bar,1500);
{const w=document.querySelector("#swipeView .deckwrap");if(w)new MutationObserver(()=>bar()).observe(w,{childList:true});
 new MutationObserver(()=>requestAnimationFrame(bar)).observe(document.documentElement,{attributes:true,attributeFilter:["class"]})}
/* Grid and Scroll keep the same bar: their Cards | Grid | Scroll switch sits exactly where the card bar is */
function placeViews(){
  const v=document.querySelector(".pg-back"),b=document.querySelector("#swipeView .pd-bar");if(!v||v.hidden)return;
  const r=b&&b.getBoundingClientRect();
  if(r&&r.width){v.classList.add("pd-matched");v.style.left=r.left+"px";v.style.width=r.width+"px";v.style.top=r.top+"px"}
  else{v.classList.remove("pd-matched");v.style.left=v.style.width=v.style.top=""}
}
{const v=document.querySelector(".pg-back");if(v)new MutationObserver(()=>requestAnimationFrame(placeViews)).observe(v,{attributes:true,attributeFilter:["hidden","class"]});
 addEventListener("resize",()=>requestAnimationFrame(placeViews))}
/* 2026-11-04 15:50: Grid and Scroll keep the WHOLE bar (views button + card buttons), not just a Cards | Grid | Scroll switch.
   The bar is lifted above the open view at the same spot; the views menu gains "Cards" and marks the current view; the card
   buttons work on the project in the middle of the screen (skip/back scroll to the next/previous one). */
{
  const view=document.querySelector(".pg-view"),back=document.querySelector(".pg-back"),de2=document.documentElement;
  const mn=document.querySelector(".pg-toggle .pg-menu"),vb=document.querySelector(".pg-toggle .pg-vbtn");
  const cardsIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="3" width="12" height="16" rx="2"/><path d="M4 7v12a2 2 0 0 0 2 2h10"/></svg>';
  if(view&&back&&mn&&!mn.querySelector('[data-v="cards"]')){
    const ci=document.createElement("button");ci.type="button";ci.className="pg-mi";ci.setRole="menuitem";ci.setAttribute("role","menuitem");ci.dataset.v="cards";
    ci.innerHTML=cardsIcon+"Cards<small>Swipe</small>";mn.insertBefore(ci,mn.firstChild);
    mn.addEventListener("click",e=>{const b=e.target.closest(".pg-mi");if(!b||b.dataset.v!=="cards")return;e.stopImmediatePropagation();
      mn.classList.remove("on");if(vb)vb.setAttribute("aria-expanded","false");const c=back.querySelector('[data-v="cards"]');if(c&&isOpen())c.click()},true);
  }
  const isOpen=()=>!!view&&!view.hidden;
  const cur=()=>{const v=back&&back.querySelector('button[aria-current="true"]');return isOpen()&&v?v.dataset.v:"cards"};
  function mark(){if(mn)mn.querySelectorAll(".pg-mi").forEach(b=>b.setAttribute("aria-current",String(b.dataset.v===cur())))}
  function lift(){
    const b=document.querySelector("#swipeView .pd-bar");if(!b)return;
    if(isOpen()){
      if(!de2.classList.contains("pd-vopen")){const u=document.getElementById("btnUndo");if(u){u.dataset.pdDis=u.disabled?"1":"";u.disabled=false}const r=b.getBoundingClientRect();if(r.width){b.style.left=r.left+"px";b.style.width=r.width+"px";b.style.top=r.top+"px"}de2.classList.add("pd-vopen")}
    }else if(de2.classList.contains("pd-vopen")){de2.classList.remove("pd-vopen");b.style.left=b.style.width=b.style.top="";const u=document.getElementById("btnUndo");if(u&&u.dataset.pdDis==="1"&&!(typeof history!=="undefined"&&history.length))u.disabled=true}
    mark();
  }
  if(view)new MutationObserver(()=>lift()).observe(view,{attributes:true,attributeFilter:["hidden","class"]});
  if(back)new MutationObserver(()=>mark()).observe(back,{attributes:true,subtree:true,attributeFilter:["aria-current"]});
  addEventListener("resize",()=>{if(de2.classList.contains("pd-vopen")){de2.classList.remove("pd-vopen");const b=document.querySelector("#swipeView .pd-bar");if(b)b.style.left=b.style.width=b.style.top="";requestAnimationFrame(lift)}});
  mark();
  /* card buttons act on the project in the middle of the open view */
  const items=()=>[...view.querySelectorAll(".pg-tile,.pg-post")];
  function mid(){const vr=view.getBoundingClientRect(),cy=vr.top+(vr.height-62)/2;let best=null,d=1e9;
    items().forEach(t=>{const r=t.getBoundingClientRect();if(r.bottom<vr.top||r.top>vr.bottom)return;const k=Math.abs((r.top+r.bottom)/2-cy)+(r.left>0?r.left/1000:0);if(k<d){d=k;best=t}});return best}
  function go(dir){const a=items(),m=mid();if(!m)return;const t=a[a.indexOf(m)+dir];
    if(t){const vr=view.getBoundingClientRect(),r=t.getBoundingClientRect();
      if(t.classList.contains("pg-tile")&&Math.abs(r.top-m.getBoundingClientRect().top)<4){t.animate([{transform:"scale(1)"},{transform:"scale(1.04)"},{transform:"scale(1)"}],{duration:300});return}
      view.scrollBy({top:(r.top+r.bottom)/2-(vr.top+(vr.height-62)/2),behavior:"smooth"})}}
  const act={btnUndo:()=>go(-1),btnPass:()=>go(1),
    btnSave:()=>{const m=mid(),s=m&&m.querySelector(".pg-save");if(s)s.click()},
    btnOpen:()=>{const m=mid();if(!m)return;const o=m.querySelector(".pg-open");(o||m).click()}};
  document.addEventListener("click",e=>{if(!isOpen())return;const b=e.target.closest&&e.target.closest("#btnUndo,#btnPass,#btnSave,#btnOpen");if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();act[b.id]()},true);
}
/* the desktop help text said the buttons were in the card's corner */
document.querySelectorAll(".hints div").forEach(d=>{if(/buttons in its corner/.test(d.textContent))d.textContent=d.textContent.replace("buttons in its corner","buttons below it")});
/* some tablets report a screen-height unit (100svh) taller than what is actually visible; take the difference off */
const de=document.documentElement;
function cut(){try{
  const a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;   // keyboard open: leave it
  const d=document.createElement("div");d.style.cssText="position:fixed;top:0;left:-9px;width:1px;height:100svh;visibility:hidden;pointer-events:none";document.body.appendChild(d);
  const sv=d.getBoundingClientRect().height;d.remove();
  const vis=(window.visualViewport&&visualViewport.scale<=1.01)?visualViewport.height:innerHeight;
  const c=Math.max(0,Math.min(120,Math.round(sv-vis)));de.style.setProperty("--pd-cut",c+"px");
}catch(e){}}
cut();addEventListener("resize",()=>setTimeout(cut,60));addEventListener("orientationchange",()=>setTimeout(cut,350));
if(window.visualViewport)visualViewport.addEventListener("resize",()=>setTimeout(cut,60));
try{dispatchEvent(new Event("resize"))}catch(e){}
})();
