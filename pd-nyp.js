/* ---------- SHOP: "Name Your Price" promotion card ----------
   First card in Shop > Graphics while the promotion runs. Live countdown on the card and in the sheet; tapping the card,
   its pill button, swiping it right or the cart button opens the offer sheet (it never goes in the cart).
   Sheet: follow on Instagram + X (unlocks the form), the offer form, and a share bonus. Offers go to Webflow Forms through
   the hidden "Studio Inquiry" form (same route as the service intakes), with an email fallback.
   To run it again: change END (and COVER for a new photo). After END the card stops showing. */
(function(){
if(typeof SHOP==="undefined"||typeof artFor!=="function")return;
const END=new Date("2026-10-14T18:00:00-04:00").getTime();   /* Wed Oct 14, 6:00 PM Eastern */
const COVER="";                                              /* cover photo URL; empty = the designed cover */
const IG="https://www.instagram.com/precisiondesigngroup",X="https://x.com/prcsndesigns";
const SHARE_URL="https://precisiondesign.club/shop?nyp=1";
const TYPES=["Graphics","Logos","Branding","Website","Collection Design"];
const left=()=>Math.max(0,END-Date.now());
if(left()<=0)return;

const NYP={id:"nyp",nyp:true,kind:"Graphics",title:"Name Your Price",type:"Limited-time offer",price:"You decide",stripe:"",
  delivery:"Offers answered in 1–3 hours",discipline:"Limited time",includes:[],
  blurb:"For one week only, you set the price. Tell us what you want made and what you want to pay. We'll accept or counter your offer within 1–3 hours, and if we accept, work starts the next day.",
  style:"type",bg:"#F2C649",fg:"#141414",inks:["#F2C649","#141414","#F4F2EC"],client:"Limited-time offer",year:"Shop",cat:"Graphics"};
{const at=SHOP.findIndex(p=>p.kind==="Graphics");SHOP.splice(at<0?SHOP.length:at,0,NYP)}

const css=`
.nyp-art{position:absolute;inset:0;overflow:hidden;container-type:size;background:#F2C649;color:#141414}
.nyp-art .nyp-ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
.nyp-art.ph::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.55),transparent 42%),linear-gradient(to bottom,rgba(0,0,0,.35),transparent 22%);pointer-events:none}
.nyp-fr{position:absolute;inset:min(4cqw,14px);border:1px solid rgba(20,20,20,.35);pointer-events:none;z-index:1}
.nyp-art.ph .nyp-fr{border-color:rgba(255,255,255,.45)}
.nyp-type{position:absolute;left:min(7cqw,30px);right:min(7cqw,30px);top:max(17%,62px);font-family:var(--f-display);font-weight:900;text-transform:uppercase;line-height:.82;font-size:min(25cqw,17cqh);letter-spacing:-.01em}
.nyp-type em{font-style:normal;display:inline-block;background:#141414;color:#F2C649;padding:0 .08em .02em;transform:rotate(-3deg);margin:.04em 0}
.nyp-art svg.nyp-tag{position:absolute;right:min(7cqw,30px);top:auto;bottom:calc(78px + 62px);left:auto;width:min(26cqw,22cqh,110px)!important;height:auto!important;aspect-ratio:4/5;transform:rotate(14deg);display:block}
.nyp-chip{position:absolute;left:min(6cqw,24px);top:min(6cqw,24px);z-index:2;display:inline-flex;align-items:center;gap:8px;padding:7px 12px 7px 10px;border-radius:999px;background:#141414;color:#F4F2EC;font-family:var(--f-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.nyp-chip i{width:8px;height:8px;border-radius:50%;background:#E5484D;box-shadow:0 0 0 0 rgba(229,72,77,.6);animation:nypPulse 1.6s infinite}
@keyframes nypPulse{0%{box-shadow:0 0 0 0 rgba(229,72,77,.6)}70%{box-shadow:0 0 0 9px rgba(229,72,77,0)}100%{box-shadow:0 0 0 0 rgba(229,72,77,0)}}
.nyp-chip b{font-weight:600;font-variant-numeric:tabular-nums}
.nyp-cta{position:absolute;left:50%;bottom:78px;transform:translateX(-50%);z-index:3;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;border:0;border-radius:999px;padding:13px 20px;background:#141414;color:#F2C649;font:inherit;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 10px 24px -10px rgba(0,0,0,.5);transition:transform .15s}
.nyp-cta:active{transform:translateX(-50%) scale(.95)}
.nyp-cta svg{width:15px!important;height:15px!important;transition:transform .25s}
.nyp-cta:hover svg{transform:translateX(3px)}
.nyp-art.ph .nyp-cta{background:#F2C649;color:#141414}
.dcard:not(.top) .nyp-cta{pointer-events:none}
html.shopsw .dcard[data-pid="nyp"] .foot>span.mono::after{content:none}
.bigart .nyp-cta{display:none}
.bigart{position:relative}.bigart .nyp-art{position:relative;width:100%;height:100%;min-height:260px}
.bigart .nyp-art svg.nyp-tag{bottom:12%;right:8%}
/* sheet */
.nyp-cd{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.nyp-cd div{border:1px solid var(--line);border-radius:12px;background:var(--surface);padding:10px 6px 8px;text-align:center}
.nyp-cd b{display:block;font-family:var(--f-display);font-weight:900;font-size:34px;line-height:1;font-variant-numeric:tabular-nums;color:var(--ink)}
.nyp-cd span{font-family:var(--f-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.nyp-steps{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;font-size:14px;line-height:1.45}
.nyp-steps li{display:flex;gap:10px}.nyp-steps li>i{flex:none;width:22px;height:22px;border-radius:50%;background:var(--ink);color:var(--bg);display:grid;place-items:center;font-style:normal;font-family:var(--f-mono);font-size:11px;font-weight:600}
.nyp-follow{display:flex;flex-wrap:wrap;gap:8px}
.nyp-follow a{display:inline-flex;align-items:center;gap:8px;padding:10px 16px 10px 12px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);text-decoration:none;font-weight:600;font-size:14px;transition:border-color .2s,background .2s}
.nyp-follow a svg{width:17px;height:17px;flex:none}
.nyp-follow a .ok{display:none}
.nyp-follow a.on{border-color:var(--ink);background:var(--ink);color:var(--bg)}
.nyp-follow a.on .ok{display:inline}
.nyp-lock{font-size:12px;color:var(--muted)}
.nyp-form[data-locked="1"] .nyp-fields{opacity:.42;pointer-events:none;filter:saturate(.5)}
.nyp-price{position:relative}.nyp-price b{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-weight:700;color:var(--muted);pointer-events:none}
.nyp-price input{padding-left:28px!important;font-weight:700}
.nyp-bonus{border:1px dashed var(--line);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:10px;font-size:13px;line-height:1.5;background:color-mix(in srgb,var(--accent) 10%,var(--surface))}
.nyp-bonus b{color:var(--ink)}
.nyp-bonus .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.nyp-end{padding:12px 14px;border-radius:12px;background:var(--surface);border:1px solid var(--line);font-size:14px}
`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

const pad2=n=>String(n).padStart(2,"0");
function parts(){const s=Math.floor(left()/1000);return{d:Math.floor(s/86400),h:Math.floor(s%86400/3600),m:Math.floor(s%3600/60),s:s%60}}
const chipText=()=>{if(left()<=0)return"Offer ended";const p=parts();return`${p.d}d ${pad2(p.h)}:${pad2(p.m)}:${pad2(p.s)}`};
const arrow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const tag=`<svg class="nyp-tag" viewBox="0 0 80 100" aria-hidden="true"><path d="M14 4h52l10 14v74a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V18z" fill="#141414"/><circle cx="40" cy="20" r="6" fill="#F2C649"/><text x="40" y="70" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="40" fill="#F2C649">$?</text></svg>`;
function art(uid){
  const ph=!!COVER;
  return `<div class="nyp-art${ph?" ph":""}">${ph?`<img class="nyp-ph" src="${esc(COVER)}" alt="Name Your Price" draggable="false">`:`${tag}<div class="nyp-type">Name<br><em>your</em><br>price</div>`}
    <i class="nyp-fr"></i>
    <span class="nyp-chip" aria-label="Time left"><i></i>Ends in <b data-nyp-cd>${chipText()}</b></span>
    <button type="button" class="nyp-cta">Click here to name your price ${arrow}</button></div>`;
}
const _artFor=artFor;
artFor=function(p,uid){return p&&p.nyp?art(uid):_artFor.apply(this,arguments)};

/* card interactions: the pill opens the sheet without starting a drag */
document.addEventListener("pointerdown",e=>{if(e.target.closest&&e.target.closest(".nyp-cta"))e.stopPropagation()},true);
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest(".dcard .nyp-cta");if(b){e.stopPropagation();e.preventDefault();openNYP()}},true);
/* tap / swipe up / Enter */
if(typeof openProduct==="function"){const _op=openProduct;openProduct=function(p){return p&&p.nyp?openNYP():_op.apply(this,arguments)}}
if(typeof openDetail==="function"){const _od=openDetail;openDetail=function(p){return p&&p.nyp?openNYP():_od.apply(this,arguments)}}
/* swipe right / cart button: never goes in the cart, opens the sheet instead */
if(typeof fly==="function"){const _fly=fly;fly=function(el,dir){
  const p=idx<L().length?L()[idx]:null;if(!(p&&p.nyp)||dir<=0)return _fly.apply(this,arguments);
  const had=shortlist.has(p.id),r=_fly.apply(this,arguments);
  if(!had&&shortlist.has(p.id)){shortlist.delete(p.id);persist();updateCount();const t=document.getElementById("toast");if(t)t.classList.remove("on");try{renderDrawer()}catch(e){}}
  setTimeout(openNYP,320);return r}}

/* desktop info panel: show when it ends instead of "Coming soon" */
if(typeof renderMeta==="function"){const _rm=renderMeta;renderMeta=function(){const r=_rm.apply(this,arguments);
  const p=typeof mode!=="undefined"&&mode==="wallet"&&idx<L().length?L()[idx]:null,s=document.querySelector("#swipeMeta .sprice span");
  if(p&&p.nyp&&s)s.textContent="Ends Wed, Oct 14 · 6 PM ET";return r}}
/* live countdowns */
setInterval(()=>{const t=chipText(),p=parts();
  document.querySelectorAll("[data-nyp-cd]").forEach(e=>{if(e.textContent!==t)e.textContent=t});
  document.querySelectorAll("[data-nyp-big]").forEach(e=>{const v=pad2(p[e.dataset.nypBig]);if(e.textContent!==v)e.textContent=v});
  if(left()<=0){const f=document.querySelector(".nyp-form");if(f&&!f.dataset.ended){f.dataset.ended=1;f.outerHTML=`<div class="nyp-end"><b>This offer has ended.</b> Follow us to catch the next one.</div>`}}
},1000);

const KEY="pd-nyp-follow";
const getF=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}};
const setF=o=>{try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}};
const igIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>';
const xIcon='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z"/></svg>';
const L_=(t,r)=>`<span>${esc(t)}${r?' <i class="sf-req" aria-hidden="true">*</i>':""}</span>`;

function openNYP(){
  if(typeof showSheet!=="function")return;
  const p=parts(),f=getF(),both=f.ig&&f.x,list=SHOP.filter(x=>x.kind==="Graphics");
  const s=showSheet(`<div class="bigart">${art("xnyp")}</div>
  <div class="body">
    <div class="top"><span class="mono">Graphics · Limited time</span><button class="x" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
    <div><div class="client">Limited-time offer</div><h3>Name Your Price</h3></div>
    <div class="nyp-cd" role="timer" aria-label="Time left in the offer">
      <div><b data-nyp-big="d">${pad2(p.d)}</b><span>Days</span></div><div><b data-nyp-big="h">${pad2(p.h)}</b><span>Hours</span></div>
      <div><b data-nyp-big="m">${pad2(p.m)}</b><span>Min</span></div><div><b data-nyp-big="s">${pad2(p.s)}</b><span>Sec</span></div></div>
    <p>${esc(NYP.blurb)}</p>
    <ol class="nyp-steps"><li><i>1</i><span>Follow Precision Design on Instagram <b>and</b> X.</span></li><li><i>2</i><span>Tell us about your project and what you want to pay.</span></li><li><i>3</i><span>We'll accept or counter your offer within <b>1–3 hours</b>. If we accept, we start the next day.</span></li></ol>
    <form class="cform sform nyp-form" data-locked="${both?0:1}" novalidate>
      <h4 class="sf-h">Step 1 · Follow us</h4>
      <div class="nyp-follow">
        <a href="${IG}" target="_blank" rel="noopener" data-f="ig" class="${f.ig?"on":""}">${igIcon}<span>Instagram</span><span class="ok">✓</span></a>
        <a href="${X}" target="_blank" rel="noopener" data-f="x" class="${f.x?"on":""}">${xIcon}<span>X</span><span class="ok">✓</span></a>
      </div>
      <p class="nyp-lock" role="status">${both?"Thanks for following! Your offer form is unlocked.":"You must follow both pages to make an offer. Tap each to follow, then come back here."}</p>
      <div class="nyp-fields" style="display:flex;flex-direction:column;gap:12px">
      <h4 class="sf-h">Step 2 · Make your offer</h4>
      <div class="cf-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label>${L_("Name",1)}<input name="name" autocomplete="name" required></label>
        <label>${L_("Brand name",1)}<input name="brand" autocomplete="organization" required></label>
      </div>
      <div class="cf-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label>${L_("Email",1)}<input name="email" type="email" autocomplete="email" inputmode="email" required placeholder="So we can reply"></label>
        <label>${L_("Instagram handle",1)}<input name="handle" required placeholder="@yourbrand" autocapitalize="none"></label>
      </div>
      <label>${L_("Project type",1)}<select name="type" required><option value="">Choose one</option>${TYPES.map(t=>`<option>${t}</option>`).join("")}</select></label>
      <label>${L_("How much do you want to pay?",1)}<span class="nyp-price"><b>$</b><input name="offer" inputmode="decimal" required placeholder="Your offer"></span></label>
      <label>${L_("Anything we should know? (optional)")}<textarea name="notes" rows="3" placeholder="What you want made, references, timing…"></textarea></label>
      <div class="nyp-bonus">
        <span><b>Bonus: free extra colorway.</b> Share this offer to your Instagram story and tag <b>@precisiondesigngroup</b>. If we accept your offer, you get an extra colorway on us. Sent here by a friend? Add their @ below and you both get it.</span>
        <div class="row"><button type="button" class="pill" data-share>Share the offer</button><span class="mono" data-share-msg style="font-size:11px;color:var(--muted)"></span></div>
        <label class="sf-agree"><input type="checkbox" name="shared"><span>I shared it and tagged @precisiondesigngroup</span></label>
        <label>${L_("Referred by (optional)")}<input name="ref" placeholder="@yourfriend" autocapitalize="none"></label>
      </div>
      <div class="nl-ts"></div>
      <button class="pill solid" type="submit">Send my offer</button>
      <span class="mono note" data-status role="status" aria-live="polite">We'll accept or counter within 1–3 hours. If accepted, work starts the next day.</span>
      </div>
    </form>
  </div>`,"nyp");
  wire(s);
}

function wire(s){
  const f=s.querySelector(".nyp-form");if(!f)return;
  const say=t=>{const e=f.querySelector("[data-status]");if(e)e.textContent=t};
  const lockMsg=f.querySelector(".nyp-lock");
  f.querySelectorAll(".nyp-follow a").forEach(a=>a.addEventListener("click",()=>{
    const o=getF();o[a.dataset.f]=1;setF(o);a.classList.add("on");
    if(o.ig&&o.x){f.dataset.locked="0";lockMsg.textContent="Thanks for following! Your offer form is unlocked."}
    else lockMsg.textContent=`Now follow us on ${o.ig?"X":"Instagram"} too to unlock the form.`}));
  /* share: native share sheet on phones, copy link elsewhere */
  const sm=f.querySelector("[data-share-msg]");
  f.querySelector("[data-share]").addEventListener("click",async()=>{
    const data={title:"Name Your Price · Precision Design",text:"Precision Design is letting you name your price on graphics, logos, branding and more this week only.",url:SHARE_URL};
    try{if(navigator.share){await navigator.share(data);sm.textContent="Thanks for sharing!";return}}catch(e){return}
    try{await navigator.clipboard.writeText(SHARE_URL);sm.textContent="Link copied. Paste it in your story."}catch(e){sm.textContent=SHARE_URL}
  });
  /* spam check, same as the other forms */
  let tsId=null,token="";
  const renderTs=()=>{const nf=document.getElementById("pd-contact"),key=nf&&nf.getAttribute("data-turnstile-sitekey"),slot=f.querySelector(".nl-ts");if(!key||tsId!==null||!slot)return;
    const t=window.turnstile;if(!t||!t.render){setTimeout(renderTs,300);return}const box=document.createElement("div");slot.appendChild(box);
    try{tsId=t.render(box,{sitekey:key,appearance:"interaction-only",theme:(typeof curTheme==="function"&&curTheme()==="light")?"light":"dark",callback:v=>{token=v},"expired-callback":()=>{token=""},"error-callback":()=>{token=""}})}catch(e){tsId=null}};
  f.addEventListener("focusin",renderTs,{once:true});
  f.addEventListener("input",e=>{if(e.target.removeAttribute)e.target.removeAttribute("aria-invalid")});
  f.addEventListener("submit",e=>{
    e.preventDefault();const btn=f.querySelector('button[type="submit"]');if(btn.disabled)return;
    if(left()<=0){say("This offer has ended.");return}
    if(f.dataset.locked==="1"){say("Follow us on Instagram and X first to unlock your offer.");lockMsg.scrollIntoView({behavior:"smooth",block:"center"});return}
    const v=n=>((f.elements[n]&&f.elements[n].value)||"").trim();
    const bad=[];["name","brand","email","handle","type","offer"].forEach(n=>{const el=f.elements[n];if(!v(n)){el.setAttribute("aria-invalid","true");bad.push(el)}});
    if(v("email")&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))){f.elements.email.setAttribute("aria-invalid","true");bad.push(f.elements.email)}
    const amt=parseFloat(v("offer").replace(/[^0-9.]/g,""));if(v("offer")&&!(amt>0)){f.elements.offer.setAttribute("aria-invalid","true");bad.push(f.elements.offer)}
    if(bad.length){say("Please fill in the highlighted fields.");bad[0].focus();return}
    const handle=v("handle").replace(/^@?/,"@"),ref=v("ref")?v("ref").replace(/^@?/,"@"):"—",price="$"+amt.toLocaleString("en-US",{maximumFractionDigits:2});
    const msg=["NAME YOUR PRICE OFFER","",`Offer: ${price}`,`Project type: ${v("type")}`,`Name: ${v("name")}`,`Brand: ${v("brand")}`,`Email: ${v("email")}`,`Instagram: ${handle}`,
      `Says they followed: Instagram + X`,`Shared to story and tagged us: ${f.elements.shared.checked?"Yes (free extra colorway if accepted)":"No"}`,`Referred by: ${ref}`,`Notes: ${v("notes")||"—"}`,"",
      `Reply within 1–3 hours to accept or counter. If accepted, work starts the next day.`].join("\n");
    const done=sent=>{f.outerHTML=`<div class="sf-done" id="nypDone"><h4>Offer sent${sent?"":" (almost)"}!</h4>
      <p>${sent?`Thanks, ${esc(v("name").split(" ")[0])}. We'll accept or counter your ${esc(price)} offer within <b>1–3 hours</b> by email. If we accept, work starts the next day.`:"Your email app should have opened with your offer filled in. Hit send and we'll reply within 1–3 hours."}</p>
      <p class="muted">Want the free extra colorway? Share the offer to your story and tag @precisiondesigngroup.</p></div>`;
      const d=s.querySelector("#nypDone");if(d)d.scrollIntoView({behavior:"smooth",block:"start"});if(typeof sfx==="function")try{sfx("save")}catch(_){}};
    const mail=()=>{location.href=`mailto:${EMAIL}?subject=${encodeURIComponent("Name Your Price offer: "+price+" ("+v("brand")+")")}&body=${encodeURIComponent(msg)}`;done(false)};
    const nf=document.getElementById("pd-contact"),site=document.documentElement.getAttribute("data-wf-site"),$j=window.jQuery;
    if(!nf||!site||!$j){mail();return}
    renderTs();btn.disabled=true;let waited=0;
    const send=()=>{
      if(nf.getAttribute("data-turnstile-sitekey")&&!token&&waited++<75){say("Verifying you're human…");return setTimeout(send,200)}
      say("Sending your offer…");
      const fields={Name:v("name"),Email:v("email"),Business:v("brand"),Website:handle,Message:msg};if(token)fields["cf-turnstile-response"]=token;
      $j.ajax({url:"https://webflow.com/api/v1/form/"+site,type:"POST",dataType:"json",crossDomain:true,data:{
        name:nf.getAttribute("data-name")||nf.getAttribute("name")||"Studio Inquiry",
        pageId:nf.getAttribute("data-wf-page-id")||"",elementId:nf.getAttribute("data-wf-element-id")||"",
        domain:document.documentElement.getAttribute("data-wf-domain")||null,collectionId:null,itemSlug:null,
        source:location.href,test:false,fields,fileUploads:{},dolphin:false,trackingCookies:{}}})
      .done(r=>{if(r&&r.code===200)done(true);else{say("Couldn't send. Opening email instead…");setTimeout(mail,700)}})
      .fail(()=>{say("Couldn't send. Opening email instead…");setTimeout(mail,700)})
      .always(()=>{btn.disabled=false;token="";try{if(tsId!==null)window.turnstile.reset(tsId)}catch(_){}});
    };send();
  });
}
window.openNYP=openNYP;

/* the shop may already be on screen: redraw it with the card in front */
if(typeof mode!=="undefined"&&mode==="wallet"&&typeof scat!=="undefined"&&scat==="Graphics"){idx=0;try{history.length=0}catch(e){}try{renderDeck();renderMeta()}catch(e){}}
try{if(typeof renderPockets==="function")renderPockets()}catch(e){}
/* shared link: /shop?nyp=1 opens the offer straight away */
if(/[?&]nyp\b/.test(location.search)){
  if(typeof setMode==="function"&&mode!=="wallet")setMode("wallet");
  if(typeof setCat==="function"&&scat!=="Graphics")setCat("Graphics");
  idx=0;try{renderDeck();renderMeta()}catch(e){}
  setTimeout(openNYP,600);
}
})();
