/* ---------- Device UI test (2026-11-16) ----------
   Opt-in preview of the new "device" layout: dark frame, a side notch cut into the card (views, project info,
   sound, light/dark), Portfolio / Shop / shortlist / Hire us pills on the card, no header or bottom bar.
   Only turns on with ?ui=device in the address (remembered for the visit); ?ui=off turns it back off.
   Everyone else sees the normal site. */
(function(){
let on=false;try{const q=new URLSearchParams(location.search).get("ui");if(q==="device")sessionStorage.setItem("pd-ui","device");if(q==="off")sessionStorage.removeItem("pd-ui");on=sessionStorage.getItem("pd-ui")==="device"}catch(e){}
if(!on)return;
const de=document.documentElement;
const I={
x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
filt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8 9.5h8M9.5 12.5h5M11 15.5h2"/></svg>',
up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>',
down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
bulb:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
cards:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="6" y="3" width="12" height="16" rx="2"/><path d="M4 7v12a2 2 0 0 0 2 2h10"/></svg>',
grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/></svg>',
scroll:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="3" width="16" height="8" rx="1.5"/><rect x="4" y="14" width="16" height="7" rx="1.5"/></svg>',
snd:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>',
logo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2.2"/></svg>',
bm:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>',
star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/></svg>'};
const CSS=`:root{--sk-bez:#141414;--sk-btn:#262626;--sk-acc:#B5492E;--sk-ink:#f2efe8;--sk-glass:rgba(240,238,232,.82)}
body{background:radial-gradient(120% 70% at 20% 10%,#d9dde3 0,#e7e3da 45%,#d8d1c4 100%)!important}
@media (prefers-color-scheme:dark){body{background:radial-gradient(120% 70% at 20% 10%,#24262b 0,#18181a 50%,#0f0f10 100%)!important}}
body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:999;opacity:.10;mix-blend-mode:multiply;
 background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
header>div[style],header hr,.hdr-line{border:0!important}
/* the device bezel */
#swipeView .deckwrap{background:var(--sk-bez)!important;border-radius:46px!important;padding:8px 8px 70px!important;box-shadow:0 30px 60px -30px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,255,255,.06)}
#deck .dcard{border-radius:38px!important;overflow:hidden}
#deck .dcard .foot{border-radius:0 0 38px 38px}
/* bottom bar sits on the bezel */
#swipeView .pd-bar{background:transparent!important;border:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;bottom:8px!important;left:8px!important;right:8px!important;height:60px!important;padding:0 6px!important;gap:8px!important}
.pd-bar .pd-sep,.pd-bar .pg-toggle,.pd-bar #btnUndo,.pd-bar #btnOpen,.pd-bar #btnTheme,.pd-bar .ctl-div{display:none!important}
.pd-bar>.controls{justify-content:space-between!important;gap:8px!important}
.pd-bar .cbtn{width:52px!important;height:52px!important;border-radius:50%!important;background:var(--sk-btn)!important;color:var(--sk-ink)!important;border:0!important;box-shadow:none!important}
.pd-bar .cbtn svg{width:22px;height:22px}
.sk-pill{height:52px;border-radius:26px;background:var(--sk-btn);color:var(--sk-ink);display:flex;align-items:center;gap:8px;padding:0 16px;font:600 15px/1 var(--f-body,Inter,sans-serif);border:0;flex:none}
.sk-pill svg{width:20px;height:20px}
.sk-count{font:500 13px/1 var(--f-mono,monospace);letter-spacing:.04em;color:#9b978e;padding:0 14px;gap:0}
.sk-count b{color:var(--sk-ink);font-weight:600}
/* side notch carved into the card */
.sk-notch{position:absolute;z-index:40;width:50px;background:var(--sk-bez);border-radius:25px 0 0 25px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:8px 0}
.sk-notch::before,.sk-notch::after{content:"";position:absolute;right:0;width:26px;height:26px;background:radial-gradient(circle at 0 0,transparent 25.5px,var(--sk-bez) 26px)}
.sk-notch::before{top:-26px}
.sk-notch::after{bottom:-26px;transform:scaleY(-1)}
.sk-notch button{width:36px;height:42px;border-radius:19px;border:0;background:none;color:#8d8a84;display:grid;place-items:center}
.sk-notch button[aria-current=true]{background:var(--sk-acc);color:#fff}
.sk-notch svg{width:19px;height:19px}
/* floating controls on the art */
.sk-float{position:absolute;z-index:40;display:flex;flex-direction:column;align-items:center;gap:12px}
.sk-circ{width:42px;height:42px;border-radius:50%;background:var(--sk-glass);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:0;color:#1b1b1b;display:grid;place-items:center;box-shadow:0 6px 18px -8px rgba(0,0,0,.4)}
.sk-circ svg{width:21px;height:21px}
.sk-vpill{width:42px;height:92px;border-radius:21px;background:var(--sk-glass);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:0;color:#1b1b1b;display:grid;place-items:center;box-shadow:0 6px 18px -8px rgba(0,0,0,.4)}
.sk-vpill span{writing-mode:vertical-rl;transform:rotate(180deg);font:700 15px/1 var(--f-body,Inter,sans-serif);letter-spacing:.01em}
.sk-cap{padding:4px;border-radius:28px;border:1.5px solid rgba(240,238,232,.55);display:flex;flex-direction:column;gap:4px}
.sk-cap .sk-circ{color:var(--sk-acc)}
.sk-cap .sk-circ svg{stroke-width:2.4}
/* header to match */
header .switch{background:var(--sk-bez)!important;border-color:transparent!important}
header .switch button{color:#a5a29b!important}
header .switch button[aria-pressed=true]{color:#fff!important}
header .switch .sw-thumb{background:var(--sk-acc)!important}
#btnHire,header .cta,header a[href*=hire]{background:var(--sk-bez)!important}

.sk-notch{gap:6px!important;padding:10px 0!important}
.sk-div{display:block;width:22px;height:1px;background:#3a3a3a;margin:2px 0}
.sk-notch .sk-det{height:92px!important;width:36px;color:#ece9e2!important}
.sk-notch .sk-det span{writing-mode:vertical-rl;transform:rotate(180deg);font:700 14px/1 var(--f-body,Inter,sans-serif)}
.sk-notch .sk-arr{background:#2a2a2a!important;color:var(--sk-acc)!important;width:36px!important;height:36px!important;border-radius:50%!important}
.sk-notch .sk-arr svg{width:18px;height:18px}

/* v4: full-height rail beside a narrower card */
#swipeView #deck.deck{width:auto!important;margin-left:58px!important;margin-right:0!important}
html.sk-right #swipeView #deck.deck{margin-left:0!important;margin-right:58px!important}
.sk-rail{top:8px!important;bottom:70px;left:8px;right:auto!important;width:52px!important;border-radius:26px!important;justify-content:space-between!important;padding:10px 0!important;box-sizing:border-box;background:#1f1f1f!important}
html.sk-right .sk-rail{left:auto;right:8px!important}
.sk-rail::before,.sk-rail::after{display:none!important}
.sk-rail .sk-grp{display:flex;flex-direction:column;align-items:center;gap:6px}
.sk-rail .sk-det{height:120px!important}
.sk-float{right:20px}
html.sk-right .sk-float{right:78px!important}
html:not(.sk-right) .sk-float{right:20px!important;left:auto!important}
.sk-side{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 58px);z-index:1000;font:600 10px/1 var(--f-body,Inter,sans-serif);border:0;border-radius:12px;padding:4px 10px;background:var(--sk-acc);color:#fff;opacity:.92}

.sk-float{top:20px}
/* v5: no bottom bar, card and rail run full height */
#swipeView .pd-bar{display:none!important}
#swipeView .deckwrap{padding-bottom:8px!important}
html #deck.deck,html.pd-iosbar #deck.deck,html.pd-iosfit #deck.deck{height:calc(100svh - var(--hdr,56px) - 24px - 16px)!important}
.sk-rail{bottom:8px!important}
/* v6: rail side of the frame runs into the screen edge */
#swipeView .deckwrap{margin-left:calc(-1 * var(--sk-gl,8px))!important;border-radius:0 46px 46px 0!important}
html.sk-right #swipeView .deckwrap{margin-left:0!important;margin-right:calc(-1 * var(--sk-gr,8px))!important;border-radius:46px 0 0 46px!important}
.sk-rail{background:transparent!important;border-radius:0!important;left:calc(var(--sk-gl,8px) - 2px)!important;top:24px!important;bottom:24px!important}
html.sk-right .sk-rail{left:auto!important;right:calc(var(--sk-gr,8px) - 2px)!important}
html.sk-right #swipeView #deck.deck{margin-right:calc(58px + var(--sk-gr,8px) - 8px)!important}
#swipeView #deck.deck{margin-left:calc(58px + var(--sk-gl,8px) - 8px)!important}
html.sk-right #swipeView #deck.deck{margin-left:0!important}
/* v7: nav cut into the card (card wraps above and below) */
#swipeView #deck.deck,html.sk-right #swipeView #deck.deck{margin-left:0!important;margin-right:0!important}
#swipeView .deckwrap{padding-left:calc(var(--sk-gl,8px) + 2px)!important}
html.sk-right #swipeView .deckwrap{padding-left:8px!important;padding-right:calc(var(--sk-gr,8px) + 2px)!important}
.sk-cut{top:50%!important;transform:translateY(-50%);left:0!important;right:auto!important;width:calc(var(--sk-gl,8px) + 54px)!important;padding:12px 0 12px calc(var(--sk-gl,8px))!important;box-sizing:border-box;border-radius:0 28px 28px 0!important;background:var(--sk-bez)!important;justify-content:flex-start!important;gap:6px!important}
html.sk-right .sk-cut{left:auto!important;right:0!important;width:calc(var(--sk-gr,8px) + 54px)!important;padding:12px calc(var(--sk-gr,8px)) 12px 0!important;border-radius:28px 0 0 28px!important}
.sk-cut::before,.sk-cut::after{display:block!important;content:"";position:absolute;width:28px;height:28px;left:0;right:auto}
.sk-cut::before{top:-28px;left:calc(var(--sk-gl,8px) + 2px);background:radial-gradient(circle at 100% 0,transparent 27.5px,var(--sk-bez) 28px)}
.sk-cut::after{bottom:-28px;left:calc(var(--sk-gl,8px) + 2px);background:radial-gradient(circle at 100% 100%,transparent 27.5px,var(--sk-bez) 28px);transform:none}
html.sk-right .sk-cut::before{left:auto;right:calc(var(--sk-gr,8px) + 2px);background:radial-gradient(circle at 0 0,transparent 27.5px,var(--sk-bez) 28px)}
html.sk-right .sk-cut::after{left:auto;right:calc(var(--sk-gr,8px) + 2px);background:radial-gradient(circle at 0 100%,transparent 27.5px,var(--sk-bez) 28px)}
.sk-cut .sk-det{height:96px!important}
.sk-cut .sk-grp{display:flex;flex-direction:column;align-items:center;gap:6px}
.sk-cut .sk-div{display:none}

/* v8: title strip removed, project info lives in the notch */
#deck .dcard .foot{display:none!important}
#deck .dcard .art{bottom:0!important;height:100%!important}
.sk-cut .sk-info{height:auto!important;max-height:300px;width:46px!important;display:flex!important;flex-direction:row-reverse;align-items:center;justify-content:center;gap:3px;padding:10px 0!important;overflow:hidden}
.sk-cut .sk-info span{writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-height:280px}
.sk-cut .sk-info .t{font:800 12px/1 var(--f-display,var(--f-body,Inter,sans-serif));letter-spacing:.02em;text-transform:uppercase;color:#f2efe8}
.sk-cut .sk-info .s{font:500 9px/1 var(--f-mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:#9b978e}
.sk-cut .sk-info .s{font-size:8.5px}
/* v9: keep the artwork clear of the notch */
#deck .dcard .art{box-sizing:border-box!important;padding-left:52px!important;padding-right:0!important}
html.sk-right #deck .dcard .art{padding-left:0!important;padding-right:52px!important}
/* v12: header back on top (no Play); side nav = views + project info */
#modePlay,header .bar-div{display:none!important}

/* v13: book = Portfolio, bag = Shop; switch removed from the top */
header .switch{display:none!important}
.sk-cut .sk-arr{color:#cfcbc3!important}
.sk-cut .sk-arr.sk-on{background:var(--sk-acc)!important;color:#fff!important}

/* v14: no header at all; page is full height */
body>header,header{display:none!important}
html #deck.deck,html.pd-iosbar #deck.deck,html.pd-iosfit #deck.deck{height:calc(100svh - 32px)!important}
#swipeView{padding-top:8px!important;margin-top:0!important}
.sk-side{top:auto!important;bottom:calc(env(safe-area-inset-bottom,0px) + 14px)}
.sk-float{flex-direction:row!important;gap:8px!important;align-items:center}
.sk-hire{height:42px;border-radius:21px;border:0;background:var(--sk-bez);color:#f2efe8;font:700 14px/1 var(--f-body,Inter,sans-serif);padding:0 16px;box-shadow:0 6px 18px -8px rgba(0,0,0,.4)}
.sk-bmk{position:relative}
.sk-bmk svg{width:17px!important;height:17px!important}
.sk-bmk b{position:absolute;top:-3px;right:-3px;min-width:17px;height:17px;border-radius:9px;background:#f2c94c;color:#141414;font:700 10px/17px var(--f-mono,monospace);text-align:center}
.sk-logo2{position:absolute;z-index:41;top:22px;left:calc(var(--sk-gl,8px) + 18px);width:38px;height:38px;color:#f2efe8}
html.sk-right .sk-logo2{left:24px}
.sk-logo2 svg{width:100%;height:100%}
.pd-seen{top:auto!important;bottom:18px!important;left:auto!important;right:18px!important}
html.sk-right .pd-seen{right:auto!important;left:18px!important}

/* v15: Portfolio/Shop pills top-right; sound + light in the side nav */
.sk-float{gap:6px!important}
.sk-pill2,.sk-hire{height:38px!important;border-radius:19px!important;border:0;font:700 13px/1 var(--f-body,Inter,sans-serif)!important;padding:0 13px!important;background:var(--sk-bez);color:#f2efe8;box-shadow:0 6px 18px -8px rgba(0,0,0,.4)}
.sk-pill2{color:#a5a29b}
.sk-pill2.on{background:var(--sk-acc);color:#fff}
.sk-bmk{width:38px!important;height:38px!important}
.sk-cut .sk-arr svg{width:17px;height:17px}
html.sk-right .sk-float{right:20px!important;left:auto!important}

html.pd-dev #swipeView{padding-top:max(8px,env(safe-area-inset-top,0px))!important}
html.pd-iosbar #deck.deck{height:calc(100svh - 32px - var(--pd-bar,78px))!important}
html.pd-vopen .sk-cut,html.pd-vopen .sk-float,html.pd-vopen .sk-logo2{display:none!important}
html.pd-vopen #swipeView .pd-bar{display:flex!important}
.sk-side{display:none}
/* closed by default: the notch tucks into the screen edge leaving a pull tab */
.sk-cut{transition:transform .32s cubic-bezier(.2,.8,.2,1);touch-action:none}
html.pd-dev:not(.sk-open) .sk-cut{transform:translate(calc(-100% + 22px),-50%)!important;background:#2c2b29!important}
html.pd-dev.sk-right:not(.sk-open) .sk-cut{transform:translate(calc(100% - 22px),-50%)!important}
html.pd-dev:not(.sk-open) .sk-cut>*{opacity:0;pointer-events:none}
.sk-cut>*{transition:opacity .2s}
.sk-grip{position:absolute;top:50%;right:8px;width:5px;height:56px;margin-top:-28px;border-radius:3px;background:#bdb8ae;opacity:0;transition:opacity .2s;pointer-events:none}
html.sk-right .sk-grip{right:auto;left:8px}
.sk-cut .sk-close{width:36px;height:28px;border:0;background:none;color:#8d8a84;display:grid;place-items:center}
.sk-cut .sk-close svg{width:18px;height:18px}
html.sk-right .sk-cut .sk-close svg{transform:scaleX(-1)}
.sk-cut{transition:transform .32s cubic-bezier(.2,.8,.2,1),background .2s}
html.pd-dev:not(.sk-open) .sk-cut>.sk-grip{opacity:1}
html.pd-dev:not(.sk-open) .sk-cut{cursor:pointer}
html.pd-dev:not(.sk-open) .sk-cut::before,html.pd-dev:not(.sk-open) .sk-cut::after{opacity:0}
.sk-cut::before,.sk-cut::after{transition:opacity .2s}
#deck .dcard .art{transition:padding .32s cubic-bezier(.2,.8,.2,1)}
html.pd-dev:not(.sk-open) #deck .dcard .art{padding-left:0!important;padding-right:0!important}
.sk-cut .sk-swap{width:36px;height:30px;border:0;background:none;color:#8d8a84;font:600 15px/1 var(--f-body,Inter,sans-serif);display:grid;place-items:center}
html.pd-vopen #swipeView .pd-bar .pg-toggle{display:flex!important}
html.pd-dev body #swipeView .deckwrap{background:var(--sk-bez)!important}
html.pd-dev .nyp-chip{margin-top:52px}
`;
function boot(){
  const w=document.querySelector("#swipeView .deckwrap"),deck=document.getElementById("deck");
  if(!w||!deck||!deck.querySelector(".dcard"))return setTimeout(boot,120);
  const st=document.createElement("style");st.id="pd-dev-css";
  const measure=()=>{st.disabled=true;const r=w.getBoundingClientRect();de.style.setProperty("--sk-gl",r.left+"px");de.style.setProperty("--sk-gr",(innerWidth-r.right)+"px");st.disabled=false};
  st.textContent=CSS;document.head.appendChild(st);de.classList.add("pd-dev","sk-open");measure();
  try{if(localStorage.getItem("pd-ui-side")==="r")de.classList.add("sk-right")}catch(e){}
  addEventListener("resize",()=>setTimeout(measure,60));
  const click=s=>{const b=document.querySelector(s);if(b)b.click()};
  /* side notch */
  const n=document.createElement("div");n.className="sk-notch sk-cut";
  n.innerHTML='<button class="sk-close" data-a="close" aria-label="Close menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m14 6-6 6 6 6"/></svg></button><div class="sk-grp"><button data-v="cards" aria-label="Cards">'+I.cards+'</button><button data-v="grid" aria-label="Grid">'+I.grid+'</button><button data-v="scroll" aria-label="Scroll">'+I.scroll+'</button></div><button class="sk-det sk-info" aria-label="Open project"></button><div class="sk-grp"><button class="sk-arr" data-a="snd" aria-label="Sound">'+I.snd+'</button><button class="sk-arr" data-a="theme" aria-label="Light or dark">'+I.bulb+'</button><button class="sk-swap" data-a="swap" aria-label="Move menu to the other side">&#8644;</button></div><i class="sk-grip" aria-hidden="true"></i>';
  w.appendChild(n);
  let sx=null,moved=false;
  n.addEventListener("click",e=>{if(moved){moved=false;return}const b=e.target.closest("button");if(!b)return;
    if(b.dataset.v){const m=document.querySelector('.pg-mi[data-v="'+b.dataset.v+'"]');if(m)m.click();setTimeout(sync,50)}
    else if(b.classList.contains("sk-info"))click("#btnOpen");
    else if(b.dataset.a==="snd")click("#btnSound");
    else if(b.dataset.a==="theme")click("#btnTheme");
    else if(b.dataset.a==="close")setOpen(false);
    else if(b.dataset.a==="swap"){de.classList.toggle("sk-right");try{localStorage.setItem("pd-ui-side",de.classList.contains("sk-right")?"r":"l")}catch(e){}}});
  /* open / close: tap the tab or pull it out; push it back toward the edge to close */
  const isR=()=>de.classList.contains("sk-right"),setOpen=v=>de.classList.toggle("sk-open",v);
  n.addEventListener("pointerdown",e=>{sx=e.clientX;moved=false;if(!de.classList.contains("sk-open"))try{n.setPointerCapture(e.pointerId)}catch(_){}});
  n.addEventListener("pointermove",e=>{if(sx==null)return;let dx=e.clientX-sx;if(isR())dx=-dx;if(Math.abs(dx)>8)moved=true;
    const open=de.classList.contains("sk-open");if(!open&&dx>24){setOpen(true);sx=null}else if(open&&dx<-24){setOpen(false);sx=null}});
  const up=()=>{if(sx!=null&&!moved&&!de.classList.contains("sk-open"))setOpen(true);sx=null};
  n.addEventListener("pointerup",up);n.addEventListener("pointercancel",()=>{sx=null});

  /* pills on the card */
  const f=document.createElement("div");f.className="sk-float";f.style.top="20px";
  f.innerHTML='<button class="sk-pill2" data-m="p">Portfolio</button><button class="sk-pill2" data-m="s">Shop</button><button class="sk-circ sk-bmk" aria-label="Shortlist">'+I.bm+'<b>0</b></button><button class="sk-hire">Hire us</button>';
  w.appendChild(f);
  f.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.m==="p")click("#modeSwipe");else if(b.dataset.m==="s")click("#modeWallet");
    else if(b.classList.contains("sk-bmk"))click("#openShort");else if(b.classList.contains("sk-hire"))click("#openStudio");setTimeout(sync,80)});
  const lg=document.createElement("div");lg.className="sk-logo2";lg.innerHTML=I.logo;lg.style.cursor="pointer";lg.onclick=()=>{location.href="/?ui=off"};w.appendChild(lg);
  let q=0;
  function sync(){q=0;
    const c=deck.querySelector(".dcard.top:not(.fx-gone)")||deck.querySelector(".dcard.top");
    const info=n.querySelector(".sk-info");
    if(c){const t=(c.querySelector(".foot b")||{}).textContent||"";const s=[...c.querySelectorAll(".foot .mono")].map(e=>e.textContent.trim()).filter(Boolean);
      const h='<span class="t">'+t.replace(/</g,"&lt;")+'</span>'+s.map(x=>'<span class="s">'+x.replace(/</g,"&lt;")+'</span>').join("");if(info.innerHTML!==h)info.innerHTML=h}
    const shop=(document.getElementById("modeWallet")||{}).getAttribute?.("aria-pressed")==="true";
    f.querySelector('[data-m="p"]').classList.toggle("on",!shop);f.querySelector('[data-m="s"]').classList.toggle("on",shop);
    const cnt=document.getElementById("shortCount");f.querySelector(".sk-bmk b").textContent=cnt?cnt.textContent.trim()||"0":"0";
    const cur=document.querySelector(".pg-mi[aria-current=true]");const v=cur?cur.dataset.v:"cards";
    n.querySelectorAll("[data-v]").forEach(b=>b.setAttribute("aria-current",String(b.dataset.v===v)));
  }
  const kick=()=>{if(!q)q=requestAnimationFrame(sync)};
  new MutationObserver(kick).observe(deck,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
  new MutationObserver(kick).observe(document.body,{subtree:true,attributes:true,attributeFilter:["aria-pressed","aria-current"]});
  const sc=document.getElementById("shortCount");if(sc)new MutationObserver(kick).observe(sc,{childList:true,characterData:true,subtree:true});
  sync();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,200));else setTimeout(boot,200);
})();
