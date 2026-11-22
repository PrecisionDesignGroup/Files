/* ---------- SERVICES: "Start a project" intake forms, shown in place in the Services frame (test preview only) ----------
   Same questions, deposits and Stripe links as the live Services page (precisiondesign.club/shop).
   Step 1: the intake form. Step 2: pay the deposit on Stripe.
   On this test site the answers open in the visitor's email app (the live site's fallback route),
   so nothing is sent to the live site's Webflow forms. */
(function(){
const EMAIL=window.PD_EMAIL||"";
const BUDGET=["Under $500","$500 – $1,000","$1,000 – $2,500","$2,500 – $5,000","$5,000 – $10,000","$10,000+","Not sure yet"];
const TIMELINE=["ASAP (within 2 weeks)","2 – 4 weeks","1 – 2 months","2 – 3 months","3+ months","Flexible"];
const PACK={dep:100,link:"https://buy.stripe.com/4gMaEXf3xei22XA16tffy0q",q:[
  {k:"What product is the packaging for?",t:"text",r:1},
  {k:"Packaging type",t:"chips",o:["Box","Label / sticker","Bag / pouch","Vinyl / CD / cassette","Can / bottle","Hang tag","Other"]},
  {k:"Estimated quantity / print run",t:"text"},
  {k:"Do you have dielines or a manufacturer?",t:"select",o:["Yes, both","Dielines only","Manufacturer only","Not yet"]}]};
const F={
  "svc-brand":{dep:100,link:"https://buy.stripe.com/14A3cv9Jd6PAaq2eXjffy0o",q:[
    {k:"Issue(s) with current brand identity",t:"area",help:"If applicable"},
    {k:"What does your business do, and who is it for?",t:"area",r:1},
    {k:"What do you need?",t:"chips",o:["Logo","Color palette","Typography","Brand guidelines","Social templates","Packaging","Apparel / merch","Other"]}]},
  "svc-apparel":{dep:50,link:"https://buy.stripe.com/9B66oH9Jdb5Q1Tw5mJffy0p",q:[
    {k:"How many graphics are you planning on purchasing?",t:"select",r:1,o:["1","2 – 3","4 – 5","6 – 10","10+"]},
    {k:"What will they be printed on?",t:"chips",o:["T-shirts","Hoodies / crewnecks","Hats","Outerwear","Accessories","Other"]},
    {k:"Print method (if known)",t:"select",o:["Screen print","DTG","Embroidery","Puff print","Not sure"]}]},
  /* the live site has no Album card: album covers book through Packaging, with vinyl/CD/cassette ticked */
  "svc-album":Object.assign({},PACK,{pre:{"Packaging type":["Vinyl / CD / cassette"]},q:[
    {k:"Artist and release name",t:"text",r:1},
    {k:"Packaging type",t:"chips",o:["Vinyl / CD / cassette","Label / sticker","Other"]},
    {k:"Estimated quantity / print run",t:"text"},
    {k:"Release date (if set)",t:"text"}]}),
  "svc-packaging":PACK,
  "svc-web":{dep:250,link:"https://buy.stripe.com/eVqaEX4oT2zkdCe8yVffy0s",q:[
    {k:"Issue(s) with current website",t:"area",help:"If applicable"},
    {k:"Platform preference",t:"select",o:["Webflow","Shopify","No preference"]},
    {k:"Do you need to sell products online?",t:"select",o:["Yes","No","Not sure"]},
    {k:"Approximate number of pages",t:"select",o:["1 – 3","4 – 7","8 – 15","15+","Not sure"]}]},
  "svc-logos":{dep:100,link:"https://buy.stripe.com/28EfZhaNh6PA1TwaH3ffy0t",q:[
    {k:"Issue(s) with current logo",t:"area",help:"If you have one"},
    {k:"What type of logo?",t:"select",r:1,o:["Monogram","Symbolic","Combination mark","Wordmark","Other / not sure"]},
    {k:"Where will the logo be used most?",t:"chips",o:["Apparel","Packaging","Website / social","Signage / storefront","Print","Other"]}]}
};
const e=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const css=document.createElement("style");css.textContent=`
.svu.fm .svu-list li:not(.on){display:none}
.svu.fm .svu-l{justify-content:flex-start;padding-top:clamp(0px,4vh,40px)}
.svu-d.svf{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;gap:0;max-width:46ch;color:var(--ink)}
.svf-top{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)}
.svf-top b{color:var(--ink);font-weight:600}
.svf-back{flex:none;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:none;color:var(--ink);cursor:pointer;font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase}
.svf-sc{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;padding:14px 2px 28px;-webkit-mask:linear-gradient(transparent,#000 12px,#000 calc(100% - 26px),transparent);mask:linear-gradient(transparent,#000 12px,#000 calc(100% - 26px),transparent);animation:dIn .35s var(--ease-out)}
.svf .dep{font-size:12.5px;line-height:1.5;color:var(--ink-soft);margin:0 0 16px}
.svf .dep b{color:var(--ink)}
.svf form{display:grid;gap:14px}
.svf .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.svf label,.svf fieldset{display:grid;gap:4px;min-width:0;margin:0;padding:0;border:0}
.svf label>span:first-child,.svf legend{font-family:var(--font-mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft);padding:0;margin-bottom:5px}
.svf i.req{font-style:normal;color:var(--ink)}
.svf input:not([type=checkbox]),.svf select,.svf textarea{width:100%;box-sizing:border-box;font:inherit;font-size:16px;color:var(--ink);background:transparent;border:0;border-bottom:1.5px solid var(--line);border-radius:0;padding:5px 0;outline:none;-webkit-appearance:none;appearance:none;transition:border-color .2s}
.svf select{background-image:linear-gradient(45deg,transparent 50%,currentColor 50%),linear-gradient(-45deg,transparent 50%,currentColor 50%);background-position:calc(100% - 9px) 55%,calc(100% - 4px) 55%;background-size:5px 5px;background-repeat:no-repeat;padding-right:20px}
.svf select option{color:#121316;background:#fff}
.svf textarea{resize:vertical;min-height:44px;line-height:1.4}
.svf input:focus,.svf select:focus,.svf textarea:focus{border-bottom-color:var(--ink)}
.svf [aria-invalid=true]{border-bottom-color:#D9534F!important}
.svf .help{text-transform:none!important;letter-spacing:0!important;font-family:inherit!important;font-size:11.5px;color:var(--ink-soft);line-height:1.4}
.svf .chips{display:flex;flex-wrap:wrap;gap:6px}
.svf .chips label{display:block;cursor:pointer}
.svf .chips input{position:absolute;opacity:0;pointer-events:none}
.svf .chips span{display:inline-flex;align-items:center;height:28px;padding:0 11px;border-radius:999px;border:1px solid var(--line);font-size:12px;transition:background .2s,color .2s,border-color .2s}
.svf .chips input:checked+span{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.svf .chips input:focus-visible+span{outline:2px solid var(--ink);outline-offset:2px}
.svf .agree{display:flex;gap:9px;align-items:flex-start;font-size:12px;line-height:1.45;color:var(--ink-soft);cursor:pointer}
.svf .agree input{margin-top:2px;accent-color:var(--ink);width:15px;height:15px;flex:none}
.svf .agree.bad{color:#D9534F}
.svf .foot{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:4px}
.svf .go{display:inline-flex;align-items:center;height:34px;padding:0 16px;border-radius:999px;border:0;background:var(--ink);color:var(--bg);font:inherit;font-size:12px;font-weight:600;cursor:pointer;text-decoration:none}
.svf .st{font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft)}
.svf .done h3{font-family:var(--font-display);font-weight:900;text-transform:uppercase;font-size:1.6rem;line-height:1;margin:2px 0 10px}
.svf .done p{font-size:13px;line-height:1.55;color:var(--ink-soft);margin:0 0 14px}
.svf .done p b{color:var(--ink)}
@media (max-width:720px){.svu.fm{grid-template-rows:24% minmax(0,1fr)}.svf-top .st0{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.svu.fm .svu-l{padding-top:0}.svu-d.svf{max-width:none}.svf .row{grid-template-columns:1fr}.svf form{gap:12px}}
`;document.head.appendChild(css);

const opt=o=>o.map(x=>`<option>${e(x)}</option>`).join("");
const sel=(n,o,r)=>`<select name="${n}"${r?" required":""}><option value="">Select…</option>${opt(o)}</select>`;
const lab=(t,r)=>`<span>${e(t)}${r?' <i class="req">*</i>':""}</span>`;
const policy=d=>`The <b>deposit</b> is non-refundable and also counts as your <b>consultation fee</b>. If you move forward, it goes toward your project. If you decide not to proceed after the consultation, you're only charged for the consultation.`;
function field(q,i,pre){
  const n="q"+i;
  if(q.t==="chips")return `<fieldset><legend>${e(q.k)}</legend><div class="chips">${q.o.map(x=>`<label><input type="checkbox" name="${n}" value="${e(x)}"${(pre[q.k]||[]).includes(x)?" checked":""}><span>${e(x)}</span></label>`).join("")}</div></fieldset>`;
  const inner=q.t==="area"?`<textarea name="${n}" rows="3"${q.r?" required":""}></textarea>`:q.t==="select"?sel(n,q.o,q.r):`<input name="${n}"${q.r?" required":""}>`;
  return `<label>${lab(q.k,q.r)}${inner}${q.help?`<span class="help">${e(q.help)}</span>`:""}</label>`;
}
/* Shows the form in place of the service details (same frame, no pop-up). onBack restores the details. */
window.svFormInline=function(id,host,onBack){
  const it=(window.SVCV||[]).find(p=>p.id===id),c=F[id];if(!it||!c||!host)return false;
  const svu=host.closest(".svu");if(svu)svu.classList.add("fm");
  host.className="svu-d svf";
  host.innerHTML=`<div class="svf-top"><span class="st0"><b>Step 1/2</b> · Deposit required</span><button type="button" class="svf-back">← Back</button></div>
  <div class="svf-sc"><div class="svf-body">
  <p class="dep">${policy(c.dep)}<br>Step 1: send this form. Step 2: pay the deposit on Stripe.</p>
  <form novalidate>
    <div class="row"><label>${lab("First name",1)}<input name="first" autocomplete="given-name" required></label><label>${lab("Last name",1)}<input name="last" autocomplete="family-name" required></label></div>
    <div class="row"><label>${lab("Email",1)}<input name="email" type="email" autocomplete="email" required></label><label>${lab("Phone")}<input name="phone" type="tel" autocomplete="tel"></label></div>
    <div class="row"><label>${lab("Business name")}<input name="business" autocomplete="organization"></label><label>${lab("Website")}<input name="website" inputmode="url" placeholder="yourbrand.com"></label></div>
    ${c.q.map((q,i)=>field(q,i,c.pre||{})).join("")}
    <div class="row"><label>${lab("Target budget",1)}${sel("budget",BUDGET,1)}</label><label>${lab("Target timeline",1)}${sel("timeline",TIMELINE,1)}</label></div>
    <label>${lab("References — link")}<input name="refs" inputmode="url" placeholder="Drive, Dropbox, Pinterest or Instagram link"></label>
    <label>${lab("References — description")}<textarea name="refdesc" rows="2" placeholder="What do you like about these references?"></textarea><span class="help">Share any references that help show the direction you want.${EMAIL?` You can also email files to ${e(EMAIL)} with your name and business.`:""}</span></label>
    <label>${lab("Notes to Precision Design")}<textarea name="notes" rows="2"></textarea></label>
    <label class="agree"><input type="checkbox" name="agree" required><span>I understand the deposit is non-refundable, counts as my consultation fee, and goes toward my project if I proceed.</span></label>
    <div class="svf-ts"></div>
    <div class="foot"><button class="go" type="submit">Send &amp; continue to deposit</button><span class="st" role="status" aria-live="polite"></span></div>
  </form></div></div>`;
  const back=()=>{if(svu)svu.classList.remove("fm");onBack&&onBack()};
  host.querySelector(".svf-back").addEventListener("click",ev=>{ev.stopPropagation();back()});
  ["pointerdown","touchstart","touchmove","wheel","keydown","keyup"].forEach(t=>host.addEventListener(t,ev=>{ev.stopPropagation();if(t==="keydown"&&ev.key==="Escape")back()},{passive:true}));
  const sc=host.querySelector(".svf-sc"),f=host.querySelector("form"),st=host.querySelector(".st"),say=t=>{st.textContent=t};
  f.addEventListener("input",ev=>{ev.target.removeAttribute("aria-invalid");ev.target.closest(".agree")?.classList.remove("bad");if(!f.querySelector("[aria-invalid]"))say("")});
  const PF=window.pdForm,g=PF?PF.guard(host.querySelector(".svf-ts")):null;
  f.addEventListener("submit",async ev=>{
    ev.preventDefault();const btn=f.querySelector("button[type=submit]");if(btn.disabled)return;
    const v=n=>{const el=f.elements[n];return el?String(el.value||"").trim():""};
    const bad=[...f.querySelectorAll("[required]")].filter(el=>el.type==="checkbox"?!el.checked:!String(el.value).trim()||(el.type==="email"&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())));
    bad.forEach(el=>{el.setAttribute("aria-invalid","true");el.closest(".agree")?.classList.add("bad")});
    if(bad.length){say(bad.length===1&&bad[0].name==="agree"?"Please confirm the deposit terms.":"Please fill in the highlighted fields.");bad[0].focus();return}
    const lines=[`SERVICE INTAKE — ${it.t} ($${c.dep} deposit)`,"",`Name: ${v("first")} ${v("last")}`,`Email: ${v("email")}`,`Phone: ${v("phone")||"—"}`,`Business: ${v("business")||"—"}`,`Website: ${v("website")||"—"}`,""];
    c.q.forEach((q,i)=>{const n="q"+i;const val=q.t==="chips"?[...f.querySelectorAll(`input[name="${n}"]:checked`)].map(x=>x.value).join(", "):v(n);lines.push(`${q.k}: ${val||"—"}`)});
    lines.push(`Target budget: ${v("budget")}`,`Target timeline: ${v("timeline")}`,`References link: ${v("refs")||"—"}`,`References description: ${v("refdesc")||"—"}`,`Notes: ${v("notes")||"—"}`,"",`Agreed to deposit terms: Yes ($${c.dep}, non-refundable, counts as consultation fee)`);
    const subj=it.t+" project intake — "+(v("business")||v("first")+" "+v("last")),msg=lines.join("\n");
    let sent=false;
    if(PF&&PF.live){btn.disabled=true;sent=await PF.send({Name:`${v("first")} ${v("last")}`,Email:v("email"),Business:v("business"),Website:v("website"),Message:msg},g,say);btn.disabled=false}
    if(!sent&&PF&&PF.live&&!EMAIL){say("Couldn't send. Please check your connection and try again.");return}
    if(!sent){const href=`mailto:${EMAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(msg.slice(0,1800))}`;try{window.open(href,"_top")}catch(_){location.href=href}}
    try{window.pdEv&&pdEv("form_submit",{form:"service_intake",service:it.t,sent_by:sent?"webflow":"email"})}catch(_){}
    host.querySelector(".st0").innerHTML=`<b>Step 2/2</b> · Deposit`;
    host.querySelector(".svf-body").innerHTML=`<div class="done"><h3>Now your deposit</h3>
      <p>${sent?"Your project details were sent to Precision Design. ":"Your project details are ready to send to Precision Design in your email app. "}Pay your <b>${e(it.t)}</b> deposit to lock in your consultation. Once paid, Precision Design will reach out with your project intake and everything about your project.</p>
      <div class="foot"><a class="go" href="${e(c.link)}" target="_blank" rel="noopener" onclick="try{window.pdEv&&pdEv('begin_checkout',{item:'${e(it.t)} deposit',value:${c.dep},currency:'USD'})}catch(_){}">Pay deposit on Stripe ↗</a></div>
      <p style="margin-top:16px;font-size:11.5px">${policy(c.dep)}</p></div>`;
    sc.scrollTop=0;
  });
  return true;
};
})();
