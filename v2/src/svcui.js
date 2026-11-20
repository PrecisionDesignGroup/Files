/* ---------- SERVICES: minimal type + large examples (test preview only) ----------
   Left: the service names, the current one in solid type, the rest faint; quiet details underneath.
   Right (top on phones): the example work, large. Tap the image or the arrows for the next example.
   The dial, arrows and swipes still move between services; sideways swipes change the example. */
(function(){
const screenEl=document.querySelector(".screen"),headWrap=document.getElementById("headWrap");
if(!screenEl||!headWrap||!window.SVCV)return;
const GET={
  "svc-brand":["Logo suite","Color palette","Type system","Graphic language","Brand guidelines"],
  "svc-apparel":["Front & back graphics","Placements","Colorways","Screen-print-ready files"],
  "svc-album":["Front & back cover","Vinyl, CD & cassette layouts","Disc labels","Booklet"],
  "svc-packaging":["Dielines","Front-of-pack design","Proofs","Production files"],
  "svc-direction":["Concept & moodboard","Shot lists","Lookbook layout","On-set direction"],
  "svc-web":["Webflow or Shopify build","Phone-first layouts","Product pages","Editable CMS"],
  "svc-logos":["Primary mark","Wordmark","Lockups","Print & embroidery files"]};
const GUIDE={
  "svc-brand":{for:["You're starting a brand or clothing line","You have a logo, but nothing else matches it","You're getting ready for a rebrand or a big launch"],
    steps:[["Tell us about it","Your name, who it's for, and brands you like."],["Deposit","The deposit holds your spot on the calendar."],["Directions","We show a few looks for logo, color and type."],["Refine","You pick one and we shape it together."],["Hand-off","Every file, plus a guide on how to use them."]],
    faq:[["Do I need a logo already?","No. A logo is part of the identity, so we can make it with you."],["What's the difference from Logos?","Logos is just the mark. Brand Identity is the whole look around it."]]},
  "svc-apparel":{for:["You're dropping tees, hoodies or hats","An artist or event needs merch","You have an idea but no print-ready art"],
    steps:[["Tell us about it","The piece, the vibe and any references."],["Deposit","The deposit holds your spot."],["Sketch","We send first artwork and where it sits on the garment."],["Refine","Tweaks, plus colorways for different blanks."],["Print files","Separated files your printer can use right away."]],
    faq:[["Do you print the shirts?","We make the artwork and files; your printer produces them."],["Can I see it on a shirt first?","Yes. You get mockups showing placement before anything prints."]]},
  "svc-album":{for:["You're releasing an album, EP or single","You need art that works on streaming and on vinyl","You want covers that match across a whole rollout"],
    steps:[["Tell us about it","The music, the title, the mood."],["Deposit","The deposit holds your spot."],["Cover concepts","First ideas for the front cover."],["Refine","We land the cover, then build the back and inside."],["Print & digital","Streaming-size art and print-ready layouts."]],
    faq:[["Can you do singles too?","Yes, and we can keep them matching the album."],["Which formats?","Streaming, vinyl, CD and cassette."]]},
  "svc-packaging":{for:["Your product needs a box, can or sleeve","You're pressing vinyl, CDs or tapes","You want packaging that matches your brand"],
    steps:[["Tell us about it","The product, sizes and your manufacturer if you have one."],["Deposit","The deposit holds your spot."],["Design","We lay the art onto the right template."],["Proofs","You check a flat proof before anything is made."],["Production files","Files set up for your manufacturer."]],
    faq:[["Do I need the template?","If your manufacturer has one, send it. If not, we'll help you get it."],["Do you manufacture?","We design and prep the files; your maker produces them."]]},
  "svc-direction":{for:["You're shooting a campaign, lookbook or drop","You want photos that look like your brand","You need someone to run the look on set"],
    steps:[["Tell us about it","The drop, the date and the feeling."],["Deposit","The deposit holds your dates."],["Concept","Moodboard, looks and a shot list."],["Shoot","We direct on set so it matches the plan."],["Select & layout","Picks and a lookbook layout ready to post."]],
    faq:[["Do you bring a photographer?","We can bring one or work with yours."],["Is it priced per day?","It's priced per campaign, based on the plan."]]},
  "svc-web":{for:["You need a site or online shop","Your current site is hard to update","Most of your visitors are on phones"],
    steps:[["Tell us about it","What you sell, pages you need, sites you like."],["Deposit","The deposit holds your spot."],["Design","Phone-first layouts for each page."],["Build","Built in Webflow or Shopify, tested on real phones."],["Launch","We go live and show you how to edit it."]],
    faq:[["Webflow or Shopify?","Shopify if you mainly sell products. Webflow for everything else."],["Can I update it myself?","Yes. Text, images and products are all editable."]]},
  "svc-logos":{for:["You need a logo, and fast","You want lettering drawn by hand, not a font","You need it to work on shirts, signs and screens"],
    steps:[["Tell us about it","Your name, your vibe and logos you like."],["Deposit","The deposit holds your spot."],["Sketches","First takes on the mark and lettering."],["Refine","You pick one and we polish it."],["Files","Every version and file type you'll need."]],
    faq:[["What files do I get?","Print, web and embroidery-ready files."],["Need more than a logo?","Look at Brand Identity for the full look."]]}};
const TABS=[["for","What it is","About"],["how","How it works","Steps"],["get","You get","You get"],["faq","Questions","FAQ"]];
let tab="for";
const DARKV=new Set(["logo-sheet","logo-high-above-society","logo-rally-golf","logo-wild-east-radio"]);
const themed=u=>{const m=/(?:^|\/)art\/cut2\/([^/]+)\.webp$/.exec(u||"");return m&&DARKV.has(m[1])&&isDarkUI()?u.replace(/\.webp$/,"-d.webp"):u};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

const css=document.createElement("style");css.textContent=`
.screen.svui .art-layer{background:var(--bg)!important}
.screen.svui .art-layer img{opacity:0!important}
.screen.svui #proj,.screen.svui .cw-label{display:none!important}
.svu{position:absolute;inset:0;z-index:2;display:grid;overflow:hidden;grid-template-columns:minmax(0,min(38%,400px)) minmax(0,1fr);grid-template-rows:minmax(0,1fr);gap:clamp(20px,4vw,64px);color:var(--ink);animation:svuIn .5s var(--ease-out)}
@keyframes svuIn{from{opacity:0}}
.svu-l{display:flex;flex-direction:column;justify-content:safe center;min-width:0;min-height:0;gap:clamp(12px,3vh,30px);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;-webkit-mask:linear-gradient(#000 calc(100% - 18px),transparent);mask:linear-gradient(#000 calc(100% - 18px),transparent)}.svu-l::-webkit-scrollbar{display:none}
.svu-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:2px}
.svu-list li{font-family:var(--font-display);font-weight:900;text-transform:uppercase;line-height:.98;font-size:clamp(1.15rem,min(2.9vw,5.4vh),2.7rem);letter-spacing:.005em;color:var(--ink);opacity:.16;cursor:pointer;white-space:nowrap;transition:opacity .4s var(--ease-out)}
.svu-list li:hover{opacity:.45}
.svu-list li.on{opacity:1}
.svu-list li.on .ch{display:inline-block;animation:chUp .5s var(--ease-out) backwards;animation-delay:calc(var(--i)*14ms)}
@keyframes chUp{from{transform:translateY(.35em);opacity:0}}
.svu-d{display:grid;gap:12px;max-width:44ch;animation:dIn .5s var(--ease-out) .08s backwards}
.svu-quick{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.svu-quick .q{font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)}
.svu-quick .q b{color:var(--ink);font-weight:600}
.svu-go{flex:none;border:0;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;height:32px;padding:0 14px;border-radius:999px;background:var(--ink);color:var(--bg);font-size:12px;font-weight:600;text-decoration:none;white-space:nowrap}
.svu-tabs{display:flex;gap:16px;overflow-x:auto;scrollbar-width:none}
.svu-tabs::-webkit-scrollbar{display:none}
.svu-tabs button{flex:none;background:none;border:0;padding:4px 0;font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft);cursor:pointer;border-bottom:1.5px solid transparent;opacity:.75}
.svu-tabs button[aria-selected="true"]{color:var(--ink);border-color:var(--ink);opacity:1}
.svu-pane{min-height:min(8.6em,18vh);font-size:13px;line-height:1.45;color:var(--ink-soft);animation:dIn .35s var(--ease-out)}
.svu-pane ul,.svu-pane ol{margin:0;padding:0;list-style:none;display:grid;gap:5px}
.svu-pane li{display:grid;grid-template-columns:22px 1fr;gap:4px}
.svu-pane li i{font-style:normal;font-family:var(--font-mono);font-size:10px;color:var(--ink-soft);padding-top:2px}
.svu-pane li b{color:var(--ink);font-weight:600}
.svu-pane .tags{display:flex;flex-wrap:wrap;gap:6px}
.svu-pane .tags span{padding:5px 10px;border:1px solid var(--line);border-radius:999px;color:var(--ink);font-size:12px}
.svu-tabs .sh{display:none}
.svu-what{margin:0 0 10px!important;color:var(--ink)!important;font-size:14px!important;line-height:1.45!important}
.svu-pane dl{margin:0;display:grid;gap:8px}.svu-pane dt{color:var(--ink);font-weight:600}.svu-pane dd{margin:0}
@keyframes dIn{from{opacity:0;transform:translateY(6px)}}
.svu-d p{margin:0;font-size:13.5px;line-height:1.45;color:var(--ink-soft)}
.svu-meta{font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft);line-height:1.7}
.svu-meta b{color:var(--ink);font-weight:600}
.svu-cta{justify-self:start;color:var(--ink);font-size:12.5px;font-weight:600;text-underline-offset:3px}
.svu-r{position:relative;min-width:0;min-height:0;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:10px;transition:padding .4s var(--ease-out)}
.screen.svui .cw-wrap{visibility:hidden!important}
.svu-dg{position:absolute;inset:0;z-index:4;pointer-events:none;animation:svuIn .5s var(--ease-out)}
.svu-it{position:absolute;pointer-events:auto;cursor:pointer;border:0;padding:4px;border-radius:10px;background:none;outline:1px solid transparent;transition:left .7s var(--ease-out),top .7s var(--ease-out),width .7s var(--ease-out),height .7s var(--ease-out),transform .5s var(--ease-spring,var(--ease-out)),opacity .4s var(--ease-out),filter .4s}
.svu-it img{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;-webkit-user-drag:none}
.svu-it:not(.on){opacity:.4}
.svu-it:hover{opacity:1}
.svu-it.on{outline-color:var(--line);background:color-mix(in srgb,var(--ink) 5%,transparent)}
.svu-it[hidden]{display:none}

.svu-img{position:relative;min-height:0;cursor:pointer}
.svu-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;transition:opacity .45s var(--ease-out),transform .6s var(--ease-out)}
.svu-img img.out{opacity:0;transform:scale(.98)}
.svu-cap{min-width:0;display:flex;align-items:center;gap:12px;font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)}
.svu-cap span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.svu-cap button{flex:none;width:30px;height:30px;border-radius:50%;border:1px solid var(--line);background:none;color:var(--ink);cursor:pointer;display:grid;place-items:center;padding:0}
.svu-cap button svg{width:13px;height:13px}
@media (max-width:720px){
  .svu{grid-template-columns:minmax(0,1fr);grid-template-rows:40% minmax(0,1fr);gap:12px}
  .svu-l{min-height:0;overflow:hidden}
  .svu-d{min-height:0;flex:1 1 auto;grid-template-rows:auto auto minmax(0,1fr);align-content:start}
  .svu-pane{overflow-y:auto;touch-action:pan-y;overscroll-behavior:contain;padding-bottom:18px;-webkit-mask:linear-gradient(#000 calc(100% - 22px),transparent);mask:linear-gradient(#000 calc(100% - 22px),transparent)}
  .svu-tabs .lg{display:none}.svu-tabs .sh{display:inline}
  .svu-what{font-size:13px!important;margin-bottom:8px!important}
  .svu-r{order:-1}
  .svu-l{justify-content:flex-start;gap:10px}
  .svu-list li{display:none;white-space:normal;font-size:clamp(1.9rem,9vw,2.5rem)}
  .svu-list li.on{display:block}
  .svu-d{gap:8px;max-width:none}
  .svu-d p{font-size:13px}
  .svu-pane{min-height:0;font-size:12.5px}
  .svu-pane li{gap:2px}
}
@media (prefers-reduced-motion:reduce){.svu *{animation:none!important;transition:none!important}}
`;document.head.appendChild(css);

const arrow=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d<0?"M15 5l-7 7 7 7":"M9 5l7 7-7 7"}"/></svg>`;
let dg=null,ui=null,on=false,curId=null,curImg=null;
const isDarkUI=()=>document.documentElement.dataset.theme?document.documentElement.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;
function curItem(){
  if(!screenEl.classList.contains("sec-services"))return null;
  const t=document.getElementById("pjTitle"),i=SVCV.findIndex(p=>p.t===(t&&t.textContent));if(i<0)return null;
  const bs=[...document.querySelectorAll("#cw button")],k=Math.max(0,bs.findIndex(b=>b.getAttribute("aria-selected")==="true"));
  return {it:SVCV[i],i,k};
}
const pickCw=k=>{const bs=document.querySelectorAll("#cw button");if(!bs.length)return;const n=bs.length;bs[((k%n)+n)%n].click()};
function mount(){
  if(ui&&ui.isConnected)return;if(dg)dg.remove();
  ui=document.createElement("div");ui.className="svu";
  ui.innerHTML=`<div class="svu-l"><ul class="svu-list">${SVCV.map((p,i)=>`<li data-i="${i}"><span class="nm">${esc(p.t)}</span></li>`).join("")}</ul><div class="svu-d"></div></div>
    <div class="svu-r"><div class="svu-img" role="button" aria-label="Next example"><img alt=""><img alt="" class="out"></div><div class="svu-cap"><span></span><button type="button" data-d="-1" aria-label="Previous example">${arrow(-1)}</button><button type="button" data-d="1" aria-label="Next example">${arrow(1)}</button></div></div>`;
  dg=document.createElement("div");dg.className="svu-dg";
  dg.innerHTML=[0,1,2,3].map(i=>`<button type="button" class="svu-it" data-i="${i}" aria-label="Show example ${i+1}"><img alt=""></button>`).join("");
  screenEl.appendChild(dg);
  dg.querySelectorAll(".svu-it").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();pickCw(+b.dataset.i)}));
  ui.querySelectorAll(".svu-cap button").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();const c=curItem();if(c)pickCw(c.k+ +b.dataset.d)}));
  ui.querySelector(".svu-img").addEventListener("click",e=>{e.stopPropagation();const c=curItem();if(c)pickCw(c.k+1)});
  dg.addEventListener("pointerdown",e=>e.stopPropagation());dg.addEventListener("touchstart",e=>{if(e.target.closest(".svu-it"))e.stopPropagation()},{passive:true});
  headWrap.appendChild(ui);
  ui.querySelectorAll(".svu-list li").forEach(li=>li.addEventListener("click",e=>{e.stopPropagation();if(window.pdGo)window.pdGo(+li.dataset.i)}));
  ["pointerdown"].forEach(t=>ui.querySelector(".svu-d").addEventListener(t,e=>e.stopPropagation()));
}
function layout(n,k){
  if(!dg)return;const S=screenEl.getBoundingClientRect(),m=document.getElementById("metaIdx").parentElement.getBoundingClientRect(),phone=innerWidth<=720;
  const sz=phone?42:60,sx=sz+(phone?6:10),sy=Math.round(sz*(phone?.3:.36));
  const x0=m.right-S.left+(phone?12:26),y0=m.top-S.top-(phone?6:8);
  dg.querySelectorAll(".svu-it").forEach((b,i)=>{b.hidden=i>=n;if(i>=n)return;
    Object.assign(b.style,{left:(x0+i*sx)+"px",top:(y0+i*sy)+"px",width:sz+"px",height:sz+"px"});b.classList.toggle("on",i===k)});
  const r=ui.querySelector(".svu-r");r.style.paddingTop="0px";
  const rr=r.getBoundingClientRect(),stairR=S.left+x0+(n-1)*sx+sz,stairB=S.top+y0+(n-1)*sy+sz;
  if(rr.left<stairR&&rr.top<stairB+10)r.style.paddingTop=Math.min(Math.ceil(stairB+10-rr.top),Math.round(ui.clientHeight*.45))+"px";
}
function setImg(u){
  const [a,b]=ui.querySelectorAll(".svu-img img"),front=a.classList.contains("out")?b:a,back=front===a?b:a;
  if(front.getAttribute("src")===u)return;
  back.onload=()=>{back.classList.remove("out");front.classList.add("out")};back.src=u;if(back.complete&&back.naturalWidth)back.onload();
}
function pane(it){
  const g=GUIDE[it.id]||{},el=ui.querySelector(".svu-pane");let h="";
  if(tab==="for")h=`<p class="svu-what">${esc(it.d)}</p><ul>${(g.for||[]).map(x=>`<li><i>✓</i><span>${esc(x)}</span></li>`).join("")}</ul>`;
  else if(tab==="how")h=`<ol>${(g.steps||[]).map(([a,b],i)=>`<li><i>0${i+1}</i><span><b>${esc(a)}.</b> ${esc(b)}</span></li>`).join("")}</ol>`;
  else if(tab==="get")h=`<div class="tags">${(GET[it.id]||[]).map(x=>`<span>${esc(x)}</span>`).join("")}</div>`;
  else h=`<dl>${(g.faq||[]).map(([q,a])=>`<div><dt>${esc(q)}</dt><dd>${esc(a)}</dd></div>`).join("")}</dl>`;
  el.style.animation="none";el.offsetHeight;el.style.animation="";el.innerHTML=h;
}
function render(c){
  const it=c.it,changed=curId!==it.id;
  ui.querySelectorAll(".svu-list li").forEach((li,i)=>{const now=i===c.i;if(now&&(changed||!li.classList.contains("on"))){let j=0;li.querySelector(".nm").innerHTML=it.t.split(" ").map(w=>`<span style="white-space:nowrap">${[...w].map(ch=>`<span class="ch" style="--i:${j++}">${esc(ch)}</span>`).join("")}</span>`).join(" ")}else if(!now)li.querySelector(".nm").textContent=SVCV[i].t;li.classList.toggle("on",now)});
  if(changed){
    ui.classList.remove("fm");
    const top=String(it.top||"").split("·").map(s=>s.trim()).filter(Boolean);
    ui.querySelector(".svu-d").outerHTML=`<div class="svu-d">
      <div class="svu-quick"><span class="q">${top.map(t=>`<b>${esc(t)}</b>`).join(" · ")}</span><button type="button" class="svu-go">${esc(it.lt||"Start a project")} →</button></div>
      <div class="svu-tabs" role="tablist">${TABS.map(([k,l,sh])=>`<button type="button" role="tab" data-k="${k}" aria-selected="${k===tab}"><span class="lg">${l}</span><span class="sh">${sh}</span></button>`).join("")}</div>
      <div class="svu-pane" role="tabpanel"></div></div>`;
    const d=ui.querySelector(".svu-d");d.addEventListener("pointerdown",e=>e.stopPropagation());d.addEventListener("touchstart",e=>e.stopPropagation(),{passive:true});
    d.querySelectorAll(".svu-tabs button").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();tab=b.dataset.k;d.querySelectorAll(".svu-tabs button").forEach(x=>x.setAttribute("aria-selected",x===b));pane(it)}));
    d.querySelector(".svu-go").addEventListener("click",e=>{e.stopPropagation();try{window.pdEv&&pdEv("start_project_click",{from:"services",service:it.t})}catch(_){}if(!(window.svFormInline&&svFormInline(it.id,d,()=>{curId=null;const c=curItem();if(c)render(c)})))open(it.link||"https://precisiondesign.club/shop","_blank","noopener")});
    pane(it);
    curId=it.id;
  }
  const n=Math.min(4,it.imgs.length);
  dg.querySelectorAll(".svu-it").forEach((b,i)=>{const im=b.querySelector("img"),u=themed(it.imgs[i]);if(u&&im.getAttribute("src")!==u)im.src=u;b.setAttribute("aria-label",(it.ex||[])[i]||("Example "+(i+1)))});
  last=[n,c.k];layout(n,c.k);setImg(themed(it.imgs[c.k]||it.imgs[0]));
  ui.querySelector(".svu-cap span").textContent=`${String(c.k+1).padStart(2,"0")} / ${String(n).padStart(2,"0")}  ·  ${(it.ex||[])[c.k]||""}`;
  ui.querySelectorAll(".svu-cap button").forEach(b=>b.hidden=n<2);
}
function show(c){on=true;mount();screenEl.classList.add("svui");screenEl.classList.toggle("dark",isDarkUI());render(c)}
function hide(){if(!on)return;on=false;if(ui)ui.remove();if(dg)dg.remove();dg=null;ui=null;curId=null;curImg=null;screenEl.classList.remove("svui")}
let last=null;addEventListener("resize",()=>{if(on&&last)layout(...last)});
window.svSync=function(){const c=curItem();if(c)show(c);else hide()};
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{if(on)screenEl.classList.toggle("dark",isDarkUI())});
const reTheme=()=>{if(!on)return;screenEl.classList.toggle("dark",isDarkUI());const c=curItem();if(c)render(c)};
addEventListener("pdtheme",reTheme);matchMedia("(prefers-color-scheme: dark)").addEventListener("change",reTheme);
window.svSync();
/* hide the moment Services is left by any route (rail, dial, wheel, swipe, keys) */
let wasSvc=screenEl.classList.contains("sec-services");
new MutationObserver(()=>{const now=screenEl.classList.contains("sec-services");if(now===wasSvc)return;wasSvc=now;if(!now)hide();else requestAnimationFrame(()=>window.svSync())}).observe(screenEl,{attributes:true,attributeFilter:["class"]});
})();
