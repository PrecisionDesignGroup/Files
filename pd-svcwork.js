/* ---------- Shop > Services: "Work like this" (2026-11-04) ----------
   Opening a service card shows a small swipeable row of portfolio projects that fit that service.
   Tapping one opens that project. Projects with press come first (PROJECTS is already in that order).
   Edit PICK to change which projects show for a service; SVC_WORK can name exact project ids instead. */
(function(){
if(typeof openDetail!=="function"||typeof PROJECTS==="undefined")return;
const has=(p,re)=>re.test(String(p.discipline||""));
const inCat=(p,c)=>(typeof catsOf==="function"?catsOf(p):String(p.cat||"").split(",")).includes(c);
/* exact picks win; otherwise the rule below */
const SVC_WORK={
  "Art Direction":["dreamville","lll","idls","jfgsprite","hh50","jfgnb","pooh-shiesty","carrots"],
  "Packaging":["jfgsprite","lll","idls"]
};
const PICK={
  "Brand Identity":p=>inCat(p,"Branding")&&!has(p,/^Apparel graphics$/i),
  "Apparel Graphics":p=>inCat(p,"Apparel")&&has(p,/apparel|merch|illustration/i),
  "Packaging":p=>has(p,/packaging/i),
  "Logos":p=>has(p,/logo/i),
  "Collection Design":p=>inCat(p,"Collections")||has(p,/collection|capsule/i)
};
const real=p=>p&&!p.nl&&!p.ad&&!p.kind&&!p.nyp&&!p.tv&&p.image;
function work(s){
  const ids=SVC_WORK[s.title];
  let L=ids?ids.map(id=>PROJECTS.find(p=>p.id===id)).filter(real):PICK[s.title]?PROJECTS.filter(p=>real(p)&&PICK[s.title](p)):[];
  const seen=new Set();return L.filter(p=>!seen.has(p.image)&&seen.add(p.image)).slice(0,10);
}
const css=`
.pd-work{margin:18px 0 6px}
.pd-work .mono{display:flex;justify-content:space-between;align-items:baseline;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 10px}
.pd-wrow{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;margin:0 -20px;padding:0 20px 4px;scroll-padding:0 20px}
.pd-wrow::-webkit-scrollbar{display:none}
.pd-wtile{all:unset;box-sizing:border-box;flex:none;width:118px;scroll-snap-align:start;cursor:pointer;display:flex;flex-direction:column;gap:6px}
.pd-wtile .im{display:block;width:100%;aspect-ratio:4/5;border-radius:12px;overflow:hidden;background:var(--c,#111);border:1px solid var(--line);transition:transform .25s cubic-bezier(.2,.8,.2,1)}
.pd-wtile .im img{width:100%;height:100%;object-fit:cover;display:block}
.pd-wtile:hover .im,.pd-wtile:focus-visible .im{transform:translateY(-3px)}
.pd-wtile:active .im{transform:scale(.96)}
.pd-wtile b{font-family:var(--f-display);font-weight:800;font-size:13px;line-height:1;text-transform:uppercase;color:var(--ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pd-wtile small{font-family:var(--f-mono);font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:-2px}
.pd-wnav{display:flex;align-items:center;gap:6px}
.pd-wnav button{all:unset;display:none;width:24px;height:24px;border-radius:50%;border:1px solid var(--line);text-align:center;line-height:22px;font-size:15px;color:var(--ink);cursor:pointer}
.pd-wnav button:hover{background:var(--ink);color:var(--bg)}
@media (hover:hover) and (pointer:fine){.pd-wnav button{display:inline-block}}
.pd-wtile:focus-visible{outline:2px solid var(--ink);outline-offset:3px;border-radius:12px}
`;
const st=document.createElement("style");st.id="pd-svcwork";st.textContent=css;document.body.appendChild(st);
const E=s=>typeof esc==="function"?esc(s):String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const _od=openDetail;
openDetail=function(s){
  const r=_od.apply(this,arguments);
  try{
    if(!s||s.kind!=="Services")return r;
    const L=work(s);if(!L.length)return r;
    const sc=typeof scrim!=="undefined"&&scrim?scrim:document.querySelector(".scrim"),body=sc&&sc.querySelector(".sheet .body");if(!body)return r;
    const sec=document.createElement("section");sec.className="pd-work";
    sec.innerHTML=`<div class="mono"><span>Work like this</span><span class="pd-wnav">${L.length} project${L.length>1?"s":""}<button type="button" data-d="-1" aria-label="Previous projects">‹</button><button type="button" data-d="1" aria-label="More projects">›</button></span></div><div class="pd-wrow">${
      L.map((p,i)=>`<button type="button" class="pd-wtile" data-i="${i}" style="--c:${E(p.imageBg||"#111")}" aria-label="Open ${E(p.title)}"><span class="im"><img alt="" loading="lazy" decoding="async" src="${E(p.image)}"></span><b>${E(p.title)}</b><small>${E(p.client||"")}</small></button>`).join("")}</div>`;
    const spec=body.querySelector(":scope>dl.spec");
    if(spec)body.insertBefore(sec,spec);else body.appendChild(sec);
    sec.addEventListener("click",e=>{const n=e.target.closest(".pd-wnav button");if(n){const rw=sec.querySelector(".pd-wrow");rw.scrollBy({left:+n.dataset.d*rw.clientWidth*.8,behavior:"smooth"});return}
      const t=e.target.closest(".pd-wtile");if(!t)return;const p=L[+t.dataset.i];if(!p)return;
      try{if(typeof gtag==="function")gtag("event","service_work_click",{service:s.title,project_id:p.id})}catch(_){}
      if(typeof closeSheetNow==="function")closeSheetNow();openDetail(p)});
  }catch(e){console.error("pd-svcwork.js",e)}
  return r;
};
})();
/* 2026-11-04: the header switch reads Portfolio | Services | Play (was "Shop") */
(function(){const b=document.getElementById("modeWallet");if(b&&/^\s*Shop\s*$/.test(b.textContent))b.textContent="Services"})();
/* 2026-11-04: on phones the Services / Graphics / Gift Cards tabs no longer take a full row above the card. They float as
   small vertical pills over the card's left edge (the empty strip beside the graphic), so the card gets that height back. */
(function(){
const pk=document.getElementById("pockets"),row=document.querySelector(".pd-tabrow"),hdr=document.querySelector("header"),de=document.documentElement;
if(!pk||!row||!hdr)return;
const css=`
html.pd-tabs-side .pd-tabrow{display:none!important}
.pd-side{position:fixed;z-index:25;display:none;pointer-events:none}
html.pd-tabs-side .pd-side{display:block}
html.pd-tabs-side.pd-no-tabs .pd-side{display:none}
.pd-side .pockets{display:flex!important;flex-direction:column;gap:6px;padding:0;margin:0;overflow:visible;-webkit-mask-image:none;mask-image:none;pointer-events:auto}
.pd-side .pocket-tab{writing-mode:vertical-rl;transform:rotate(180deg);flex:none;justify-content:center;gap:5px;padding:9px 2px;width:auto;min-width:0;border-radius:999px;
  font-size:9.5px;line-height:1;letter-spacing:.02em;white-space:nowrap;background:color-mix(in srgb,var(--surface) 70%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
  box-shadow:0 6px 16px -10px rgba(0,0,0,.6)}
.pd-side .pocket-tab:active{transform:rotate(180deg) scale(.94)}
.pd-side .pocket-tab span{font-size:8.5px}
.pd-side .pocket-tab[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.pd-side .pocket-tab[aria-pressed="true"] span{opacity:.75}
`;
const st=document.createElement("style");st.id="pd-side";st.textContent=css;document.head.appendChild(st);
const side=document.createElement("div");side.className="pd-side";document.body.appendChild(side);
function place(){
  if(!side.contains(pk))return;const d=document.getElementById("deck"),r=d&&d.getBoundingClientRect();if(!r||!r.width)return;
  side.style.left=Math.round(r.left-side.offsetWidth/2)+"px";
  const h=side.offsetHeight;side.style.top=Math.round(r.top+Math.max(12,(r.height-90-h)/2))+"px";
}
function go(){
  if(row.contains(pk)){side.appendChild(pk);de.classList.add("pd-tabs-side")}
  else if(!side.contains(pk))de.classList.remove("pd-tabs-side");
  if(side.contains(pk)&&!de.classList.contains("pd-tabs-row"))de.classList.add("pd-tabs-row");
  try{de.style.setProperty("--hdr",hdr.offsetHeight+"px")}catch(e){}
  requestAnimationFrame(place);
}
/* the header measure in pd-shop.js puts the tabs back in the header first; if they don't fit there they go to the side */
const _set=window.setHdr;
window.setHdr=function(){if(side.contains(pk)||row.contains(pk)){if(row.contains(pk))side.appendChild(pk);de.classList.add("pd-tabs-side");de.style.setProperty("--hdr",hdr.offsetHeight+"px");requestAnimationFrame(place)}else{de.classList.remove("pd-tabs-side");_set&&_set()}};
if(typeof renderPockets==="function"){const _rp=renderPockets;renderPockets=function(){const r=_rp.apply(this,arguments);go();return r}}
addEventListener("resize",()=>requestAnimationFrame(()=>{go()}));
const d=document.getElementById("deck");if(d)new ResizeObserver(()=>place()).observe(d);
go();setTimeout(go,500);
})();
