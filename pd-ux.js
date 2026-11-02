/* ---------- UX polish (2026-11-02) ----------
   1. HOW IT WORKS: first-time visitors see a small pill on the first portfolio card ("Swipe right to save · left to skip ·
      tap to open"). It goes away after their first swipe or tap and doesn't come back (remembered in localStorage).
   2. SHORTLIST PAYOFF: the shortlist drawer gets a "Start a project like these" button. It opens the contact form with the
      saved projects already listed in the message.
   3. ART STAYS VISIBLE: the card image is fitted into the space above the floating button bar, so the buttons sit on the
      card's background colour instead of on top of the design.
   4. SERVICES: each service card shows its deposit and "Book" in the bottom strip instead of "On request".
      Sold-out graphics are kept after any graphic that can still be bought.
   5. WORK WITH US: the header's Info button is now a filled "Work with us" button ("Hire us" on phones, a mail icon on the smallest; the sound button hides there to make room). It opens the
      studio sheet scrolled to the contact form.
   6. Toast messages ("Added … to shortlist") show at the top, under the header, so they don't cover the card title.
      Grey secondary text is a little darker for easier reading. The shortlist drawer no longer runs off the left edge
      of phones (its padding was added on top of the full width). */
(function(){
if(typeof renderDeck!=="function")return;
const $=s=>document.querySelector(s),root=document.documentElement;
const ls={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const escH=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* styles go at the end of <body> so they come after the embeds' own styles */
const css=`
:root{--muted:#55595F}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--muted:#A0A3A9}}
:root[data-theme="dark"]{--muted:#A0A3A9}
.toast{top:calc(var(--hdr,56px) + 14px);bottom:auto;transform:translate(-50%,-14px)}
.toast.on{transform:translate(-50%,0)}
#deck .dcard .art img{padding-bottom:72px!important;box-sizing:border-box!important;background:inherit}
.drawer{box-sizing:border-box}
.pd-coach{position:absolute;left:50%;bottom:142px;transform:translateX(-50%);z-index:25;max-width:calc(100% - 28px);box-sizing:border-box;
  display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;white-space:nowrap;
  background:color-mix(in srgb,var(--ink) 86%,transparent);color:var(--bg);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
  font-size:12px;font-weight:600;letter-spacing:.01em;box-shadow:0 8px 24px -10px rgba(0,0,0,.45);pointer-events:none;transition:opacity .3s}
.pd-coach.off{opacity:0}
.pd-coach i{font-style:normal;opacity:.55}
html.shopsw .pd-coach{display:none}
@media (max-width:360px){.pd-coach{font-size:11px;padding:7px 11px;gap:6px;bottom:200px}
  .pd-coach i:nth-of-type(2),.pd-coach span:nth-of-type(3){display:none}
  #openStudio.pd-hire{width:34px;height:34px;padding:0;justify-content:center;align-items:center}
  #btnSound{display:none!important}}
#openStudio.pd-hire svg{width:18px!important;height:18px!important;display:block;flex:none}
.pd-inq{display:flex;justify-content:center;width:100%;box-sizing:border-box;margin-top:10px;text-decoration:none}
.pd-inq-note{font-size:12px;color:var(--muted);text-align:center;margin:6px 0 2px}
#openStudio.pd-hire{background:var(--ink);color:var(--bg);border-radius:999px;padding:7px 14px;font-weight:600;white-space:nowrap}
#openStudio.pd-hire:hover{opacity:.88}
html.shopsw .dcard[data-pid^="sv"] .foot>span.mono::after{content:none}
.pd-book{color:var(--ink)!important;font-weight:600}
`;
const st=document.createElement("style");st.id="pd-ux";st.textContent=css;document.body.appendChild(st);

/* ---- 4b. sold-out graphics after available ones (same slots, stable order) ---- */
if(typeof SHOP!=="undefined"&&Array.isArray(SHOP)){
  const slots=[],g=[];SHOP.forEach((p,i)=>{if(p.kind==="Graphics"){slots.push(i);g.push(p)}});
  const sorted=g.filter(p=>!p.soldOut).concat(g.filter(p=>p.soldOut));
  slots.forEach((i,k)=>SHOP[i]=sorted[k]);
}

/* ---- 5. Work with us ---- */
function toForm(msg){
  try{if(typeof closeDrawer==="function")closeDrawer()}catch(e){}
  openStudio();
  setTimeout(()=>{
    const f=document.querySelector(".scrim #cform");if(!f)return;
    const t=f.querySelector("textarea[name=message]");if(msg&&t&&!t.value.trim())t.value=msg;
    const head=msg?f:([...document.querySelectorAll(".scrim .mono")].find(e=>/start a project/i.test(e.textContent))||f);
    head.scrollIntoView({behavior:"smooth",block:"start"});
  },60);
}
const hire=$("#openStudio");
if(hire){
  hire.classList.add("pd-hire");
  const mail='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
  let last="";const lab=()=>{const v=innerWidth<=360?"icon":innerWidth<=400?"Hire us":"Work with us";if(v===last)return;last=v;hire.innerHTML=v==="icon"?mail:v;try{if(typeof setHdr==="function")setHdr()}catch(e){}};lab();addEventListener("resize",lab);
  hire.setAttribute("aria-label","Work with us");
  hire.onclick=()=>toForm("");
  try{if(typeof setHdr==="function")setHdr()}catch(e){}
}

/* ---- 2. shortlist → start a project ---- */
const _rd=renderDrawer;
renderDrawer=function(){
  const r=_rd.apply(this,arguments);
  const ul=$("#slist");if(!ul)return r;
  let box=$("#pdInq");
  const items=(typeof PROJECTS!=="undefined"?PROJECTS:[]).filter(p=>shortlist.has(p.id));
  if(!items.length){if(box)box.remove();return r}
  if(!box){box=document.createElement("div");box.id="pdInq";ul.insertAdjacentElement("afterend",box)}
  box.innerHTML=`<button class="pill solid pd-inq" type="button">Start a project like ${items.length===1?"this":"these"}</button>
    <div class="pd-inq-note">Opens the contact form with your saved projects listed.</div>`;
  box.querySelector("button").onclick=()=>toForm("I'd like to start a project like these:\n"+items.map(p=>`• ${p.title} (${p.client})`).join("\n")+"\n\nAbout my project: ");
  return r;
};

/* ---- 4a. services: deposit + Book in the card strip ---- */
/* the deposit table lives inside another embed; read it back from what that embed writes into the meta panel */
const DEP={sv1:100,sv2:50,sv3:100,sv4:150,sv5:250,sv6:100,sv7:250};
function tagServices(){
  if(!root.classList.contains("shopsw"))return;
  document.querySelectorAll('#deck .dcard[data-pid^="sv"]').forEach(c=>{
    const d=DEP[c.dataset.pid],s=c.querySelector(".foot>span.mono");
    if(d&&s&&!s.classList.contains("pd-book")){s.classList.add("pd-book");s.textContent=`$${d} deposit · Book`}
  });
}

/* ---- 1. how-it-works pill ---- */
let coach=null;
const seen=()=>ls.get("pd-coach")==="1";
function showCoach(){
  if(coach||seen())return;
  const wrap=$("#swipeView .deckwrap");if(!wrap)return;
  coach=document.createElement("div");coach.className="pd-coach";coach.setAttribute("role","note");
  coach.innerHTML=`<span>Swipe right to save</span><i>·</i><span>left to skip</span><i>·</i><span>tap to open</span>`;
  wrap.appendChild(coach);
}
function doneCoach(){
  if(seen()&&!coach)return;ls.set("pd-coach","1");
  if(coach){const c=coach;coach=null;c.classList.add("off");setTimeout(()=>c.remove(),320)}
}
const _fly=fly;fly=function(){if(typeof mode==="undefined"||mode==="swipe")doneCoach();return _fly.apply(this,arguments)};
if(typeof openDetail==="function"){const _od=openDetail;openDetail=function(){doneCoach();return _od.apply(this,arguments)}}

/* keep things in step with the deck */
const deck=$("#deck");
if(deck)new MutationObserver(()=>{tagServices()}).observe(deck,{childList:true,subtree:true});
tagServices();showCoach();
try{renderDrawer()}catch(e){}
})();
