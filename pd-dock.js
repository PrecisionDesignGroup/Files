/* ---------- Button bar below the card (2026-11-04) ----------
   The round buttons (undo, skip, save, open, light) and the Grid view / See on garment / Name your price pill
   used to float over the bottom of the card. They now sit in their own strip under the card, so the whole card
   (art and title strip) stays clear. The card gets shorter by the strip's height (--pd-dock). */
(function(){
const css=`
:root{--pd-dock:62px}
html #deck.deck{height:calc(100svh - var(--hdr,56px) - 24px - var(--pd-dock))}
html.pd-iosbar #deck.deck{height:calc(100svh - var(--hdr,56px) - 24px - var(--pd-bar,78px) - var(--pd-dock))}
html.pd-iosfit #deck.deck{height:calc(100svh - var(--hdr,56px) - 12px - var(--pd-dock))}
#swipeView .deckwrap{padding-bottom:var(--pd-dock)}
#swipeView .deckwrap>.controls,#swipeView .deckwrap>.pg-toggle,#swipeView .deckwrap>.nyp-toggle,#swipeView .deckwrap>.gm-toggle{bottom:2px;box-shadow:none}
#swipeView .deckwrap>.controls{right:0}
#swipeView .deckwrap>.pg-toggle,#swipeView .deckwrap>.nyp-toggle,#swipeView .deckwrap>.gm-toggle{left:0}
#swipeView .deckwrap>.pg-toggle.pg-stack,#swipeView .deckwrap>.nyp-toggle.nyp-stack{bottom:calc(var(--pd-dock) + 2px)}
#swipeView .deckwrap.gm-on>.gm-toggle{bottom:calc(var(--gm-tray,210px) + 12px)}
#deck .dcard .art img{padding-bottom:0!important}
.pd-coach{bottom:calc(var(--pd-dock) + 84px)!important}
@media (min-width:1100px){html #deck.deck{height:calc(100svh - var(--hdr,56px) - 48px - var(--pd-dock))}}
`;
const st=document.createElement("style");st.id="pd-dock";st.textContent=css;document.body.appendChild(st);
/* the desktop help text said the buttons were in the card's corner */
document.querySelectorAll(".hints div").forEach(d=>{if(/buttons in its corner/.test(d.textContent))d.textContent=d.textContent.replace("buttons in its corner","buttons below it")});
try{dispatchEvent(new Event("resize"))}catch(e){}
})();
