/* ---------- Button bar below the card (2026-11-04) ----------
   The round buttons (undo, skip, save, open, light) and the Grid view / See on garment / Name your price pill
   used to float over the bottom of the card. They now sit in their own strip under the card, so the whole card
   (art and title strip) stays clear. The card gets shorter by the strip's height (--pd-dock). */
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
#deck .dcard .art img{padding-bottom:0!important}
.pd-coach{bottom:calc(var(--pd-dock) + 84px)!important}
#swipeView .deckwrap>.pg-toggle.pg-stack,#swipeView .deckwrap>.nyp-toggle.nyp-stack{bottom:calc(64px + var(--pd-gap))}
@media (min-width:1100px){html #deck.deck{height:calc(100svh - var(--hdr,56px) - 48px - var(--pd-dock) - var(--pd-cut,0px))}}
`;
const st=document.createElement("style");st.id="pd-dock";st.textContent=css;document.body.appendChild(st);
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
