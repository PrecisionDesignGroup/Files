/* ---------- V2 on precisiondesign.club: the live connections ----------
   Only sends to Webflow when the page is served by Webflow (the <html> tag carries data-wf-site). On the test artifact
   the in-frame forms fall back to an email draft.
   - Forms send to the same Webflow form as the old site ("pd-contact" on the home page), with Cloudflare Turnstile.
   - GA events: view_project, press_click, start_project_click, form_submit, share (gtag comes from the site-wide head code).
   - Share links: opening a project puts precisiondesign.club/#p/<id> in the address bar; "Share project" copies it.
   - /shop?nyp=1 opens the Name Your Price offer; #shop opens Shop.
   - Shop links that used to point at the old shop page open the matching form here, in the same frame. */
(function(){
const H=document.documentElement,SITE=H.getAttribute("data-wf-site"),LIVE=!!SITE;
const ctaEl=document.getElementById("ctaBtn");
const EMAIL=window.PD_EMAIL||"";   /* optional: set window.PD_EMAIL in the page's head code to allow an email-draft fallback */
const WF={page:"6abb3f89363fa4f6e1709b17",el:"10a951be-bcb8-1db1-79a1-b96b2704c006",name:"pd-contact",key:"0x4AAAAAAAQTptj2So4dx43e"};
const e=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const isDark=()=>H.dataset.theme?H.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;

/* ---- analytics ---- */
const ev=(n,p)=>{try{if(LIVE&&typeof gtag==="function")gtag("event",n,p||{})}catch(_){}};
window.pdEv=ev;

/* ---- form sending (Webflow Forms + Turnstile, email fallback) ---- */
let tsLoading=null;
function tsReady(){
  if(window.turnstile&&window.turnstile.render)return Promise.resolve(window.turnstile);
  if(!tsLoading)tsLoading=new Promise(res=>{
    if(!document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')){const s=document.createElement("script");s.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";s.async=true;document.head.appendChild(s)}
    let n=0;const t=setInterval(()=>{if(window.turnstile&&window.turnstile.render){clearInterval(t);res(window.turnstile)}else if(++n>100){clearInterval(t);res(null)}},150);
  });
  return tsLoading;
}
/* attach a spam check to a form; returns {token(), reset()} */
function guard(slot){
  const st={tok:"",id:null};
  if(!LIVE||!slot)return {token:()=>"",reset(){}};
  tsReady().then(t=>{if(!t||!slot.isConnected)return;const box=document.createElement("div");slot.appendChild(box);
    try{st.id=t.render(box,{sitekey:WF.key,appearance:"interaction-only",theme:isDark()?"dark":"light",callback:v=>{st.tok=v},"expired-callback":()=>{st.tok=""},"error-callback":()=>{st.tok=""}})}catch(_){st.id=null}});
  return {token:()=>st.tok,reset(){st.tok="";try{if(st.id!==null)window.turnstile.reset(st.id)}catch(_){}}};
}
/* fields: {Name,Email,Business,Website,Message}. Resolves true when Webflow accepted it. */
function send(fields,g,say){
  return new Promise(res=>{
    if(!LIVE||!window.fetch)return res(false);
    let waited=0;
    const go=()=>{
      if(!g.token()&&waited++<75){say&&say("Verifying you're human…");return setTimeout(go,200)}
      say&&say("Sending…");
      const f=Object.assign({},fields);const t=g.token();if(t)f["cf-turnstile-response"]=t;
      const b=new URLSearchParams();
      [["name",WF.name],["pageId",WF.page],["elementId",WF.el],["domain",H.getAttribute("data-wf-domain")||""],["collectionId",""],["itemSlug",""],["source",location.href],["test","false"],["dolphin","false"]].forEach(([k,v])=>b.append(k,v));
      Object.keys(f).forEach(k=>b.append(`fields[${k}]`,f[k]==null?"":String(f[k])));
      fetch("https://webflow.com/api/v1/form/"+SITE,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",Accept:"application/json"},body:b.toString()})
      .then(r=>r.json()).then(r=>res(!!(r&&r.code===200))).catch(()=>res(false)).finally(()=>g.reset());
    };go();
  });
}
const mailto=(subject,body)=>{const h=`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(String(body).slice(0,1800))}`;try{window.open(h,"_top")}catch(_){location.href=h}};
window.pdForm={live:LIVE,guard,send,mailto,email:EMAIL};

/* ---- in-frame panel: takes the place of the artwork, same frame as everything else ---- */
const css=document.createElement("style");css.textContent=`
.pdfp{position:absolute;z-index:30;top:clamp(88px,13vh,120px);bottom:clamp(16px,4vh,32px);left:50%;transform:translateX(-50%);width:min(480px,calc(100% - 200px));display:flex;flex-direction:column;color:var(--ink);animation:dIn .4s var(--ease-out,ease)}
.pdfp .svf-sc{padding-top:14px}
.pdfp h3.pdfp-h{font-family:var(--font-display);font-weight:900;text-transform:uppercase;font-size:clamp(1.7rem,3.2vw,2.4rem);line-height:.95;margin:0 0 10px}
.screen.fp-on .art-layer img,.screen.fp-on #panels,.screen.fp-on .headline-wrap,.screen.fp-on .gm-wrap,.screen.fp-on #gmWrap{opacity:0!important;pointer-events:none!important;transition:opacity .3s}
.pdfp .nyp-follow{display:flex;gap:8px;flex-wrap:wrap}
.pdfp .nyp-follow a{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 14px;border-radius:999px;border:1px solid var(--line);color:var(--ink);text-decoration:none;font-size:12.5px}
.pdfp .nyp-follow a .ok{display:none}.pdfp .nyp-follow a.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}.pdfp .nyp-follow a.on .ok{display:inline}
.pdfp .nyp-lock{font-size:12px;color:var(--ink-soft);margin:0}
.pdfp form[data-locked="1"] .nyp-fields{opacity:.35;pointer-events:none}
.pdfp .nyp-fields{display:grid;gap:14px}
.pdfp .bonus{border:1px solid var(--line);border-radius:14px;padding:12px;display:grid;gap:10px;font-size:12px;line-height:1.45;color:var(--ink-soft)}
.pdfp .bonus b{color:var(--ink)}
.pdfp .ghost{display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:none;color:var(--ink);font:inherit;font-size:12px;cursor:pointer}
.pdfp .cd{font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)}
.pdfp .cd b{color:var(--ink)}
.pdfp ol.ht{list-style:none;margin:4px 0 18px;padding:0;display:grid;gap:14px}
.pdfp ol.ht li{display:grid;grid-template-columns:34px 1fr;gap:12px;align-items:start}
.pdfp .ht-ic{width:34px;height:34px;border-radius:50%;border:1px solid var(--line);display:grid;place-items:center;color:var(--ink);font-size:16px}
.pdfp .ht-ic svg{width:18px;height:18px;display:block}
.pdfp .ht-jog{width:10px;height:20px;border-radius:6px;border:1.6px solid currentColor;background:repeating-linear-gradient(currentColor 0 1.4px,transparent 1.4px 4px);background-clip:content-box;padding:3px 1px;box-sizing:border-box}
.pdfp .ht-grid{width:14px;height:14px;background:radial-gradient(circle,currentColor 2.6px,transparent 3px) 0 0/7px 7px}
.pdfp ol.ht b{display:block;font-size:13.5px;margin:1px 0 2px}
.pdfp ol.ht p{margin:0;font-size:12.5px;line-height:1.45;color:var(--ink-soft)}
.pdfp .ht-ok{align-self:flex-start;background:none;border:1.5px solid var(--ink);color:var(--ink);height:36px;padding:0 20px}
.howto-btn{font:inherit;color:inherit;text-align:left;cursor:pointer;width:100%}
@media (max-width:720px){.pdfp{top:clamp(118px,16vh,140px);bottom:14px;left:16px;right:86px;width:auto;transform:none}}
@media (max-width:720px){.screen.left .pdfp{left:86px;right:16px}}
`;document.head.appendChild(css);

const screenEl=document.getElementById("screen");
let fp=null,fpSec="sec-shop";
function closePanel(){if(!fp)return;fp.remove();fp=null;screenEl&&screenEl.classList.remove("fp-on")}
function openPanel(step,bodyHTML){
  closePanel();if(!screenEl)return null;
  fp=document.createElement("div");fp.className="pdfp svf";fp.setAttribute("role","region");
  fp.innerHTML=`<div class="svf-top"><span class="st0">${step}</span><button type="button" class="svf-back">← Back</button></div><div class="svf-sc"><div class="svf-body">${bodyHTML}</div></div>`;
  screenEl.appendChild(fp);screenEl.classList.add("fp-on");
  fp.querySelector(".svf-back").addEventListener("click",ev=>{ev.stopPropagation();closePanel()});
  ["pointerdown","touchstart","touchmove","wheel","keydown","keyup"].forEach(t=>fp.addEventListener(t,x=>{x.stopPropagation();if(t==="keydown"&&x.key==="Escape")closePanel()},{passive:true}));
  return fp;
}
window.pdClosePanel=closePanel;
/* leaving the section closes the panel */
if(screenEl)new MutationObserver(()=>{if(fp&&!screenEl.classList.contains(fpSec))closePanel()}).observe(screenEl,{attributes:true,attributeFilter:["class"]});

const lab=(t,r)=>`<span>${e(t)}${r?' <i class="req">*</i>':""}</span>`;
function wireForm(f,{required,emailField="email",build,onDone}){
  const st=f.querySelector(".foot .st"),say=t=>{st.textContent=t};const g=guard(f.querySelector(".ts"));
  f.addEventListener("input",x=>{x.target.removeAttribute&&x.target.removeAttribute("aria-invalid");if(!f.querySelector("[aria-invalid]"))say("")});
  f.addEventListener("submit",async x=>{
    x.preventDefault();const btn=f.querySelector("button[type=submit]");if(btn.disabled)return;
    const v=n=>((f.elements[n]&&f.elements[n].value)||"").trim();
    if(f.dataset.locked==="1"){say("Follow us on Instagram and X first to unlock your offer.");return}
    const bad=required.map(n=>f.elements[n]).filter(el=>el&&!String(el.value).trim());
    if(v(emailField)&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v(emailField)))bad.push(f.elements[emailField]);
    (build.check?build.check(v):[]).forEach(n=>bad.push(f.elements[n]));
    bad.forEach(el=>el.setAttribute("aria-invalid","true"));
    if(bad.length){say("Please fill in the highlighted fields.");bad[0].focus();return}
    const m=build(v);btn.disabled=true;
    const ok=await send(m.fields,g,say);btn.disabled=false;
    if(!ok){if(!EMAIL){say("Couldn't send. Please check your connection and try again.");return}mailto(m.subject,m.fields.Message)}
    ev("form_submit",{form:m.form,sent_by:ok?"webflow":"email"});
    onDone(ok,v);
  });
}

/* ---- general contact form (the old site's "send a message"), used by Start Your Project and shop asks ---- */
function openContact(topic,prefill){
  fpSec=(screenEl&&[...screenEl.classList].find(c=>c.startsWith("sec-")))||"sec-shop";
  const p=openPanel(`<b>Contact</b> · ${e(topic||"Studio inquiry")}`,`<h3 class="pdfp-h">${e(topic||"Start your project")}</h3>
  <p class="dep">Tell us what you need and we'll reply by email. Each service in the Services section also has its own form with the deposit.</p>
  <form novalidate>
    <div class="row"><label>${lab("Name",1)}<input name="name" autocomplete="name" required></label><label>${lab("Email",1)}<input name="email" type="email" autocomplete="email" required></label></div>
    <div class="row"><label>${lab("Business name")}<input name="business" autocomplete="organization"></label><label>${lab("Website")}<input name="website" inputmode="url" placeholder="yourbrand.com"></label></div>
    <label>${lab("What's on your mind?",1)}<textarea name="message" rows="4" required>${e(prefill||"")}</textarea></label>
    <div class="ts"></div>
    <div class="foot"><button class="go" type="submit">Send message</button><span class="st" role="status" aria-live="polite"></span></div>
  </form>`);if(!p)return;
  const f=p.querySelector("form");
  wireForm(f,{required:["name","email","message"],build:v=>({form:"contact",subject:"Project inquiry — "+(v("business")||v("name")),
    fields:{Name:v("name"),Email:v("email"),Business:v("business"),Website:v("website"),Message:`${topic?topic+"\n\n":""}${v("message")}`}}),
    onDone:(ok,v)=>{p.querySelector(".st0").innerHTML="<b>Sent</b>";p.querySelector(".svf-body").innerHTML=`<div class="done"><h3>${ok?"Message sent":"Almost there"}</h3><p>${ok?`Thanks, ${e(v("name").split(" ")[0])}. Precision Design will reply by email.`:"Your email app should have opened with your message filled in. Hit send and we'll reply."}</p></div>`}});
}
window.pdOpenContact=openContact;

/* ---- Name Your Price offer (same steps and fields as the old site) ---- */
const NYP_END=new Date("2026-11-23T18:00:00-05:00").getTime();
const IG="https://www.instagram.com/precisiondesigngroup",X="https://x.com/prcsndesigns",SHARE_URL="https://precisiondesign.club/shop?nyp=1";
const TYPES=["Graphics","Logos","Branding","Website","Collection Design"];
const getF=()=>{try{return JSON.parse(localStorage.getItem("pdNypFollow")||"{}")}catch(_){return {}}};
const setF=o=>{try{localStorage.setItem("pdNypFollow",JSON.stringify(o))}catch(_){}};
function cdText(){const l=Math.max(0,NYP_END-Date.now()),d=Math.floor(l/864e5),h=Math.floor(l/36e5)%24,m=Math.floor(l/6e4)%60;return l<=0?"Offer ended":`Ends in <b>${d}d ${h}h ${m}m</b>`}
function openNYP(){
  fpSec="sec-shop";
  const fo=getF(),both=fo.ig&&fo.x;
  const p=openPanel(`<b>Name Your Price</b> · <span class="cd">${cdText()}</span>`,`<h3 class="pdfp-h">Make your offer</h3>
  <p class="dep">For one week only, you set the price. Tell us what you want made and what you want to pay. We'll accept or counter within <b>1–3 hours</b>, and if we accept, work starts the next day. Ends Mon Nov 23, 6 PM ET.</p>
  <form novalidate data-locked="${both?0:1}">
    <fieldset><legend>Step 1 · Follow us</legend><div class="nyp-follow">
      <a href="${IG}" target="_blank" rel="noopener" data-f="ig" class="${fo.ig?"on":""}">Instagram <span class="ok">✓</span></a>
      <a href="${X}" target="_blank" rel="noopener" data-f="x" class="${fo.x?"on":""}">X <span class="ok">✓</span></a></div></fieldset>
    <p class="nyp-lock" role="status">${both?"Thanks for following! Your offer form is unlocked.":"Follow both pages to make an offer. Tap each to follow, then come back here."}</p>
    <div class="nyp-fields">
      <div class="row"><label>${lab("Name",1)}<input name="name" autocomplete="name" required></label><label>${lab("Brand name",1)}<input name="brand" autocomplete="organization" required></label></div>
      <div class="row"><label>${lab("Email",1)}<input name="email" type="email" autocomplete="email" required placeholder="So we can reply"></label><label>${lab("Instagram handle",1)}<input name="handle" required placeholder="@yourbrand" autocapitalize="none"></label></div>
      <label>${lab("Project type",1)}<select name="type" required><option value="">Choose one</option>${TYPES.map(t=>`<option>${t}</option>`).join("")}</select></label>
      <label>${lab("How much do you want to pay?",1)}<input name="offer" inputmode="decimal" required placeholder="$ Your offer"></label>
      <label>${lab("Anything we should know?")}<textarea name="notes" rows="2" placeholder="What you want made, references, timing…"></textarea></label>
      <div class="bonus"><span><b>Bonus: free extra colorway.</b> Share this offer to your Instagram story and tag <b>@precisiondesigngroup</b>. If we accept your offer, you get an extra colorway on us. Sent by a friend? Add their @ and you both get it.</span>
        <div><button type="button" class="ghost" data-share>Share the offer</button> <span class="st" data-share-msg></span></div>
        <label class="agree"><input type="checkbox" name="shared"><span>I shared it and tagged @precisiondesigngroup</span></label>
        <label>${lab("Referred by")}<input name="ref" placeholder="@yourfriend" autocapitalize="none"></label></div>
      <div class="ts"></div>
      <div class="foot"><button class="go" type="submit">Send my offer</button><span class="st" role="status" aria-live="polite"></span></div>
    </div>
  </form>`);if(!p)return;
  const f=p.querySelector("form"),lock=p.querySelector(".nyp-lock");
  p.querySelectorAll(".nyp-follow a").forEach(a=>a.addEventListener("click",()=>{const o=getF();o[a.dataset.f]=1;setF(o);a.classList.add("on");
    if(o.ig&&o.x){f.dataset.locked="0";lock.textContent="Thanks for following! Your offer form is unlocked."}else lock.textContent=`Now follow us on ${o.ig?"X":"Instagram"} too to unlock the form.`}));
  const sm=p.querySelector("[data-share-msg]");
  p.querySelector("[data-share]").addEventListener("click",async()=>{
    const data={title:"Name Your Price · Precision Design",text:"Precision Design is letting you name your price on graphics, logos, branding and more this week only.",url:SHARE_URL};
    try{if(navigator.share){await navigator.share(data);sm.textContent="Thanks for sharing!";return}}catch(_){return}
    try{await navigator.clipboard.writeText(SHARE_URL);sm.textContent="Link copied"}catch(_){sm.textContent=SHARE_URL}});
  const amt=v=>parseFloat(v("offer").replace(/[^0-9.]/g,""));
  const build=v=>{const handle=v("handle").replace(/^@?/,"@"),ref=v("ref")?v("ref").replace(/^@?/,"@"):"—",price="$"+amt(v).toLocaleString("en-US",{maximumFractionDigits:2});
    const msg=["NAME YOUR PRICE OFFER","",`Offer: ${price}`,`Project type: ${v("type")}`,`Name: ${v("name")}`,`Brand: ${v("brand")}`,`Email: ${v("email")}`,`Instagram: ${handle}`,
      `Says they followed: Instagram + X`,`Shared to story and tagged us: ${f.elements.shared.checked?"Yes (free extra colorway if accepted)":"No"}`,`Referred by: ${ref}`,`Notes: ${v("notes")||"—"}`,"",
      `Reply within 1–3 hours to accept or counter. If accepted, work starts the next day.`].join("\n");
    return {form:"name_your_price",subject:"Name Your Price offer: "+price+" ("+v("brand")+")",fields:{Name:v("name"),Email:v("email"),Business:v("brand"),Website:handle,Message:msg}}};
  build.check=v=>v("offer")&&!(amt(v)>0)?["offer"]:[];
  wireForm(f,{required:["name","brand","email","handle","type","offer"],build,onDone:(ok,v)=>{
    p.querySelector(".st0").innerHTML="<b>Offer sent</b>";
    p.querySelector(".svf-body").innerHTML=`<div class="done"><h3>${ok?"Offer sent!":"Almost there"}</h3><p>${ok?`Thanks, ${e(v("name").split(" ")[0])}. We'll accept or counter your offer within <b>1–3 hours</b> by email. If we accept, work starts the next day.`:"Your email app should have opened with your offer filled in. Hit send and we'll reply within 1–3 hours."}</p><p>Want the free extra colorway? Share the offer to your story and tag @precisiondesigngroup.</p></div>`}});
  if(Date.now()>NYP_END){f.querySelector(".foot .st").textContent="This offer has ended.";f.querySelector("button[type=submit]").disabled=true}
}
window.pdOpenNYP=openNYP;

/* ---- per-project hook: GA view, share address, links ---- */
let cur=null,curSec=null,vt=0,lastViewed="";
const pjLink=document.getElementById("pjLink");
window.pdOnProject=function(p,sec){
  cur=p;curSec=sec;closePanel();
  if(!LIVE||!p)return;
  const proj=sec==="work"||sec==="branding"||sec==="collections"||sec==="apparel"||sec==="albumart";
  if(pjLink&&proj){pjLink.textContent="Share project ↗";pjLink.href=`https://precisiondesign.club/#p/${p.id}`}
  setTimeout(()=>{try{if(proj)history.replaceState(null,"",location.pathname+location.search+"#p/"+p.id)}catch(_){}},0);
  clearTimeout(vt);if(proj)vt=setTimeout(()=>{if(lastViewed===p.id)return;lastViewed=p.id;ev("view_project",{project_id:String(p.id),project_title:p.t,project_client:p.c||""})},1200);
};
function flash(t){const el=document.getElementById("toast");if(!el)return;el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1800)}
if(pjLink)pjLink.addEventListener("click",x=>{
  const p=cur;if(!p)return;
  if(curSec==="shop"){
    x.preventDefault();x.stopPropagation();
    if(p.id==="nyp"){ev("start_project_click",{from:"shop",item:"nyp"});openNYP();return}
    const gift=/^gc/.test(p.id);
    ev("start_project_click",{from:"shop",item:p.id});
    openContact(gift?p.t:"Custom graphic",gift?`I'd like to buy the ${p.t}.`:`I saw "${p.t}" in the shop and want a custom graphic like it.`);return;
  }
  if(LIVE&&(curSec==="work"||curSec==="branding"||curSec==="collections"||curSec==="apparel"||curSec==="albumart")){
    x.preventDefault();const url=`https://precisiondesign.club/#p/${p.id}`;
    (async()=>{try{if(navigator.share&&matchMedia("(pointer:coarse)").matches){await navigator.share({title:p.t+" · Precision Design",url});return}}catch(_){return}
      try{await navigator.clipboard.writeText(url);flash("Link copied")}catch(_){flash(url)}})();
    ev("share",{method:"link",content_type:"project",item_id:String(p.id)});
  }
},true);

/* press / shop chips */
document.addEventListener("click",x=>{const a=x.target.closest&&x.target.closest("#ppRow a[href]");if(!a||!cur)return;
  let host="";try{host=new URL(a.href).hostname.replace(/^www\./,"")}catch(_){}
  ev("press_click",{project:cur.id,link_domain:host});},true);

/* the Start Your Project button: the contact form in the frame, instead of an email draft */
if(ctaEl)ctaEl.addEventListener("click",x=>{x.preventDefault();ev("start_project_click",{from:"cta"});openContact("Start your project","")},true);

/* ---- How to use the site: shown once on a first visit (remembered), reopened from Studio or #help ---- */
const HKEY="pd-v2-howto";
const lsGet=k=>{try{return localStorage.getItem(k)}catch(_){return null}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}};
const icon=sel=>{const n=document.querySelector(sel);return n?n.outerHTML.replace(/\swidth="\d+"/,' width="18"').replace(/\sheight="\d+"/,' height="18"').replace(/\s(id|class)="[^"]*"/g,""):""};
function openHowTo(from){
  fpSec=(screenEl&&[...screenEl.classList].find(c=>c.startsWith("sec-")))||"sec-work";
  const touch=matchMedia("(pointer:coarse)").matches;
  const row=(ic,t,d)=>`<li><span class="ht-ic" aria-hidden="true">${ic}</span><div><b>${t}</b><p>${d}</p></div></li>`;
  const p=openPanel(`<b>Guide</b> · New here?`,`<h3 class="pdfp-h">How to use the site</h3>
  <ol class="ht">
  ${row(icon('.rail-btn[data-sec="work"] svg'),"Big dial: sections",`Tap an icon on the big dial${touch?"":" (or drag it)"} to switch between Graphics, Branding, Apparel, Collections, Album Art, Services, Process, Studio, Play and Shop.`)}
  ${row('<span class="ht-jog"></span>',"Small dial: flip through",`${touch?"Drag":"Scroll or drag"} the small dial at the bottom to go to the next project, service or shop item.`)}
  ${row(icon("#gridBtn svg")||'<span class="ht-grid"></span>',"See everything","The grid button shows every project at once. Tap one to open it. The SZ slider makes the art bigger or smaller.")}
  ${row(icon("#sideBtn svg"),"Switch sides","Moves the dials to the left or right, whichever is easier for your hand.")}
  ${row(icon("#themeBtn .ic-sun"),"Light or dark","Switches the site between light and dark mode.")}
  ${row('<span class="ht-share">↗</span>',"Share or start a project","Share project copies a link to the piece you're looking at. On Services, Start a project opens the form right here.")}
  </ol>
  <button type="button" class="go ht-ok">Got it</button>`);
  if(!p)return;lsSet(HKEY,"1");ev("howto_open",{from:from||"auto"});
  p.querySelector(".ht-ok").addEventListener("click",x=>{x.stopPropagation();closePanel()});
}
window.pdOpenHowTo=openHowTo;
document.addEventListener("click",x=>{const b=x.target.closest&&x.target.closest("#howtoBtn");if(b){x.preventDefault();openHowTo("studio")}},true);
if(/^#help$/.test(location.hash)||/[?&]howto=1/.test(location.search))setTimeout(()=>openHowTo("link"),1200);
else if(!lsGet(HKEY)&&!/[?&]nyp=1/.test(location.search))setTimeout(()=>{if(!fp)openHowTo("auto")},1600);

/* /shop?nyp=1 (the old share link) opens the offer */
if(/[?&]nyp=1/.test(location.search))setTimeout(()=>{try{if(screenEl&&!screenEl.classList.contains("sec-shop"))document.querySelector('.rail-btn[data-sec="shop"]').click()}catch(_){}setTimeout(openNYP,900)},1200);
})();
/* the first project is drawn before this file runs: give it the same treatment */
(function(){try{const sc=document.getElementById("screen"),sec=sc&&[...sc.classList].find(c=>c.startsWith("sec-"));const k=sec&&sec.slice(4);
  const t=(document.getElementById("pjTitle")||{}).textContent,list=k==="shop"?window.SHOPV:k==="services"?window.SVCV:window.PDPROJ;
  const p=list&&list.find(x=>x.t===t);if(p&&window.pdOnProject)pdOnProject(p,k)}catch(_){}})();
