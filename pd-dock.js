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
