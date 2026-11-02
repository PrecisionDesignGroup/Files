/* ---------- SHOP: sold-out graphics + shop tabs that always fit ----------
   SOLD OUT: every item in Shop > Graphics (the premade graphics) is marked sold out. They stay in the deck as a showcase:
   a "Sold out" tag sits on the card art and under the price, the Buy / custom-text / Add to cart buttons are replaced by
   a greyed-out "Sold out" pill, swiping right or tapping the cart doesn't add them (the card springs back), and any that
   were already in a visitor's cart show "Sold out" there with no checkout. To bring items back, take them out of SOLD.
   TABS: on screens too narrow to fit the category tabs in the header (most phones), the tabs move to their own
   full-width row right under the header, sharing the width evenly, so every tab is visible at once. When the header
   has room (laptops, tablets), they stay in the header as before.
   STILL PAGE: no rubber-band pull, and the page snaps back to the top if Safari leaves it scrolled. */
(function(){
if(typeof SHOP==="undefined"||typeof renderPockets!=="function")return;

/* ===== SOLD OUT ===== */
const SOLD=p=>!!p&&p.kind==="Graphics"&&!p.nyp;
SHOP.forEach(p=>{if(!SOLD(p))return;p.soldOut=true;p.stripe="";p.cartLink=null;if(p.addon)p.addon.stripe=""});
const isSold=p=>!!(p&&p.soldOut);
const cur=()=>typeof L==="function"&&typeof idx!=="undefined"&&mode==="wallet"?L()[idx]:null;

const css=`
.pd-sold{position:absolute;top:14px;left:14px;z-index:3;padding:6px 11px 5px;border-radius:999px;background:#D8282E;color:#fff;
  font-family:var(--f-mono);font-weight:700;font-size:11px;letter-spacing:.12em;text-transform:uppercase;line-height:1;
  box-shadow:0 6px 18px -8px rgba(0,0,0,.6);pointer-events:none}
.sheet .bigart .pd-sold{top:18px;left:18px;font-size:12px;padding:7px 13px 6px}
.slist .thumb .pd-sold{display:none}
.pd-strike{text-decoration:line-through;text-decoration-thickness:2px;opacity:.55}
.meta .sprice span.pd-so,.sheet .price .soon.pd-so,.slist .cprice i.pd-so{color:#D8282E;opacity:1}
.pill.pd-so-pill{opacity:1;background:var(--surface);color:var(--muted);border-style:dashed;cursor:not-allowed}
html.shopsw #btnSave.pd-so-btn{opacity:.45}
@keyframes pd-nope{0%,100%{translate:0}20%{translate:-10px}40%{translate:9px}60%{translate:-6px}80%{translate:4px}}
.dcard.pd-nope{animation:pd-nope .42s ease}
`;
const st=document.createElement("style");st.textContent=css+SHOP.filter(isSold).map(p=>
  `html.shopsw .dcard[data-pid="${p.id}"] .foot>span.mono::after{content:"Sold out"!important;color:#ff6b6b;opacity:1}
html.shopsw .dcard[data-pid="${p.id}"] .stamp.save{visibility:hidden}`).join("\n");
document.head.appendChild(st);

/* the tag on the card art (deck cards "d…", detail sheet "x…") */
const _artFor=artFor;
artFor=function(p,uid){
  const h=_artFor.apply(this,arguments);
  return isSold(p)&&/^[dx]/.test(uid||"")&&h.endsWith("</div>")?h.slice(0,-6)+'<span class="pd-sold">Sold out</span></div>':h;
};

/* deck cards: data-pid (so the foot can say Sold out and the Cart stamp stays hidden), and the cart button */
const deckEl=document.getElementById("deck");
function markDeck(){
  if(typeof L!=="function")return;
  const cards=[...document.querySelectorAll("#deck .dcard")],list=L();
  cards.forEach((c,i)=>{const p=list[idx+(cards.length-1-i)];if(p&&c.dataset.pid!==String(p.id))c.dataset.pid=p.id});
  const p=cur(),b=document.getElementById("btnSave");
  if(b){const on=isSold(p);b.classList.toggle("pd-so-btn",on);b.setAttribute("aria-label",on?"Sold out":mode==="wallet"?"Add to cart":"Add to shortlist")}
}
if(deckEl)new MutationObserver(markDeck).observe(deckEl,{childList:true,subtree:true,characterData:true});

/* swiping right / the cart button on a sold-out item: no cart, the card springs back */
const _fly=fly;
fly=function(el,dir){
  const p=cur();
  if(dir>0&&isSold(p)){
    el=el||document.querySelector("#deck .dcard.top");
    if(el){el.style.transform="";el.style.opacity="";el.querySelectorAll(".stamp").forEach(s=>s.style.opacity=0);
      el.classList.remove("pd-nope");void el.offsetWidth;el.classList.add("pd-nope")}
    toast(`${p.title} is sold out`);return;
  }
  return _fly.apply(this,arguments);
};

/* price under the card (wider screens) */
const _renderMeta=renderMeta;
renderMeta=function(){
  const r=_renderMeta.apply(this,arguments),p=cur(),sp=document.querySelector("#swipeMeta .sprice");
  if(sp&&isSold(p))sp.innerHTML=`<b class="pd-strike">${esc(priceText(p))}</b><span class="pd-so">Sold out</span>`;
  markDeck();return r;
};

/* detail sheet */
const _openProduct=openProduct;
openProduct=function(p){
  const r=_openProduct.apply(this,arguments);
  if(!isSold(p))return r;
  const sh=document.querySelector(".scrim .sheet");if(!sh)return r;
  const pr=sh.querySelector(".price");
  if(pr){pr.innerHTML=`<span class="pd-strike">${esc(priceText(p))}</span><span class="soon pd-so">Sold out</span>`}
  const a=sh.querySelector(".actions");
  if(a){[...a.children].forEach(c=>{if(!c.classList.contains("row"))c.remove()});
    a.insertAdjacentHTML("beforeend",`<button class="pill pd-so-pill" disabled>Sold out</button><button class="pill solid" id="pdSoStudio">Ask about a custom graphic</button>`);
    const b=sh.querySelector("#pdSoStudio");if(b)b.onclick=()=>{if(typeof closeSheet==="function")closeSheet();openStudio()}}
  const n=sh.querySelector(".note");if(n)n.textContent="This graphic has sold out. Want something like it? Get in touch for a custom one.";
  return r;
};

/* cart drawer: sold-out items say so and can't be bought */
const _renderDrawer=renderDrawer;
renderDrawer=function(){
  const r=_renderDrawer.apply(this,arguments);
  let any=false,all=true;
  document.querySelectorAll("#clist [data-cid]").forEach(b=>{const p=SHOP.find(x=>x.id===b.dataset.cid);if(!p)return;
    if(!isSold(p)){all=false;return}any=true;
    const i=b.querySelector(".cprice i");if(i){i.textContent="Sold out";i.classList.add("pd-so")}
    b.onclick=()=>{closeDrawer();openProduct(p)}});
  const co=document.getElementById("cartCheckout"),note=document.getElementById("cartNote");
  if(any&&all&&co){co.disabled=true;co.textContent="Sold out";co.onclick=null;
    if(note){note.hidden=false;note.textContent="The graphics in your cart have sold out. Remove them, or get in touch about a custom graphic."}}
  return r;
};

/* ===== TABS THAT ALWAYS FIT ===== */
const tabsCss=`
.pd-tabrow{display:none}
html.pd-tabs-row .pd-tabrow{display:block;padding-block:8px;border-bottom:1px solid var(--line)}
html.pd-tabs-row .pd-tabrow .pockets{display:flex;gap:6px;overflow:visible;-webkit-mask-image:none;mask-image:none;padding:0}
html.pd-tabs-row .pd-tabrow .pocket-tab{flex:1 1 0;min-width:0;justify-content:center;padding:7px 6px;font-size:12px;gap:5px;white-space:nowrap}
html.pd-tabs-row .pd-tabrow .pocket-tab span{font-size:10px}
html.pd-tabs-row header .bar-div{display:none}
`;
const st2=document.createElement("style");st2.textContent=tabsCss;document.head.appendChild(st2);

const pk=document.getElementById("pockets"),hdr=document.querySelector("header"),bar=pk&&pk.parentNode;
if(pk&&hdr&&bar){
  const row=document.createElement("div");row.className="pd-tabrow";hdr.insertAdjacentElement("afterend",row);
  let busy=false;
  function fit(){
    if(busy)return;busy=true;
    /* measure in the header: do the tabs fit without scrolling? */
    if(pk.parentNode!==bar){bar.appendChild(pk);document.documentElement.classList.remove("pd-tabs-row")}
    const fits=pk.scrollWidth<=pk.clientWidth+1;
    if(!fits){row.appendChild(pk);document.documentElement.classList.add("pd-tabs-row")}
    busy=false;setHdr();
  }
  /* the deck's height is the screen minus the header: count the tab row as part of the header */
  window.setHdr=function(){document.documentElement.style.setProperty("--hdr",(hdr.offsetHeight+(row.contains(pk)?row.offsetHeight:0))+"px")};
  const _rp=renderPockets;
  renderPockets=function(){const r=_rp.apply(this,arguments);fit();return r};
  let t=0;addEventListener("resize",()=>{cancelAnimationFrame(t);t=requestAnimationFrame(fit)});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  fit();
}

/* ===== TAB ORDER: Services first, then Graphics, then Gift Cards; the shop opens on Services ===== */
{const ORDER=["Services","Graphics","Gift Cards"],rank=k=>{const i=ORDER.indexOf(k);return i<0?99:i};
  if(typeof SCATS!=="undefined"&&Array.isArray(SCATS)){SCATS.sort((a,b)=>rank(a)-rank(b));
    if(typeof scat!=="undefined"&&scat!==SCATS[0]&&!location.hash.startsWith("#p/")){scat=SCATS[0];idx=0;history=[]}}}

/* ===== CARD FOOTERS: every card's bottom strip is the same height =====
   Two fixed lines: the title gets the whole first line (its font steps down to fit long titles, "…" only as a last
   resort), and the client sits on the second line with the discipline / price on the right ("Sold out" beside the
   price, not under it). The "Swipe left to start" hint on the first card sits in the top-right corner, and that
   card's title fits to the space beside it. */
{const s=document.createElement("style");s.textContent=`
#deck .dcard .foot{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto;column-gap:12px;row-gap:2px;align-items:end}
#deck .dcard .foot>div{display:contents}
#deck .dcard .foot b{grid-column:1/-1;grid-row:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:22px;height:22px}
#deck .dcard .foot>div>span{grid-column:1;grid-row:2;display:block;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#deck .dcard .foot>span.mono{grid-column:2;grid-row:2;white-space:nowrap;text-align:right}
#deck .dcard .foot>span.mono::before{position:absolute;top:15px;right:16px;margin:0}
html.shopsw #deck .dcard .foot>span.mono::after{display:inline;margin:0 0 0 8px}
@media (max-width:420px){#deck .dcard .foot>span.mono::before{font-size:10px;letter-spacing:.05em}}`;document.head.appendChild(s);
  const hintW=sp=>{const cs=getComputedStyle(sp,"::before");if(cs.display==="none"||cs.visibility==="hidden"||cs.content==="none")return 0;
    const t=document.createElement("span");t.textContent=(cs.content||"").replace(/^"|"$/g,"").replace(/\\2190/g,"\u2190").replace(/\\00a0 ?/g,"\u00a0");
    t.style.cssText=`position:absolute;visibility:hidden;white-space:nowrap;font:${cs.font};letter-spacing:${cs.letterSpacing};text-transform:${cs.textTransform}`;
    document.body.appendChild(t);const w=t.getBoundingClientRect().width;t.remove();return w};
  const fitFoot=()=>document.querySelectorAll("#deck .dcard .foot b").forEach(b=>{
    const sp=b.closest(".foot").querySelector(":scope>span.mono"),hw=sp?hintW(sp):0;
    b.style.fontSize="";b.style.paddingRight=hw?(hw+12)+"px":"";
    const max=parseFloat(getComputedStyle(b).fontSize)||20;let f=max;
    while(b.scrollWidth>b.clientWidth+1&&f>12){f-=.5;b.style.fontSize=f+"px"}});
  const dk=document.getElementById("deck");let q=0;const run=()=>{if(!q)q=requestAnimationFrame(()=>{q=0;fitFoot()})};
  if(dk)new MutationObserver(run).observe(dk,{childList:true,attributes:true,attributeFilter:["class"]});
  addEventListener("resize",run);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(run);run()}

/* ===== KEEP THE PAGE STILL ON PHONES AND TABLETS =====
   The app fills the screen exactly, but Safari still lets a drag pull the whole page down (rubber-band) and can leave
   it scrolled a little; the header then slides under Safari's top edge, which frosts it. Stop the pull, and put the
   page back at the top whenever it drifts while nothing that scrolls (a sheet, the cart, a form field) is open. */
{const s=document.createElement("style");s.textContent="html,body{overscroll-behavior:none}";document.head.appendChild(s);
  let t=0;const settle=()=>{t=0;const a=document.activeElement;
    if(window.scrollY>0&&!document.querySelector(".scrim")&&!(document.getElementById("drawer")||{}).classList?.contains("on")&&!(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))
      &&document.documentElement.scrollHeight<=innerHeight+4)window.scrollTo(0,0)};
  addEventListener("scroll",()=>{if(!t)t=setTimeout(settle,180)},{passive:true});
  addEventListener("resize",()=>{if(!t)t=setTimeout(settle,180)})}

/* iPhone/iPad Safari: the floating address bar sits over the bottom of the page,
   so the deck stops above it (not in a home-screen app or other browsers) */
{const u=navigator.userAgent,ios=/iP(hone|od|ad)/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1);
 if(ios&&/Safari/.test(u)&&!/CriOS|FxiOS|EdgiOS|OPiOS|GSA|Instagram|FBAN|FBAV|Line\//.test(u)&&!navigator.standalone&&!matchMedia("(display-mode: standalone)").matches){
  /* Only when Safari's bar floats over the page. When Safari already keeps the page above its bar, the small viewport
     (svh) is clearly shorter than the large one (lvh) and no extra room is needed. */
  const de=document.documentElement,probe=u=>{const d=document.createElement("div");d.style.cssText="position:fixed;left:-9px;top:0;width:1px;visibility:hidden;pointer-events:none;height:100"+u;document.body.appendChild(d);const h=d.getBoundingClientRect().height;d.remove();return h};
  const s=document.createElement("style");
  s.textContent="html.pd-iosbar #deck.deck{height:calc(100svh - var(--hdr,56px) - 24px - var(--pd-bar,78px))}";
  document.head.appendChild(s);
  const chk=()=>{let floats=true;try{const sv=probe("svh"),lv=probe("lvh");if(sv&&lv&&lv-sv>=40)floats=false}catch(e){}de.classList.toggle("pd-iosbar",floats)};
  chk();addEventListener("resize",chk);addEventListener("orientationchange",()=>setTimeout(chk,300))}}

/* redraw whatever is on screen now */
try{renderPockets();if(mode==="wallet"&&document.documentElement.classList.contains("shopsw"))renderDeck();else if(mode==="wallet")renderWallet();renderDrawer()}catch(e){}
})();
