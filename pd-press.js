/* ---------- Press & shop links (2026-11-04) ----------
   Projects whose product was written about or sold online get:
   - a small "Seen in …" badge on their portfolio card;
   - a "Seen in" row of press cards in the opened project (publication, what the piece covers, link);
   - a "Get it" list for official shop pages, when there are any.
   Add or change links in PRESS below, keyed by project id. Links open in a new tab and send a GA press_click event. */
(function(){
if(typeof openDetail!=="function")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const host=u=>{try{return new URL(u).hostname.replace(/^www\./,"")}catch(e){return""}};

const MSG=[
  {pub:"Essence",what:"Burna Boy's Madison Square Garden merch",url:"https://essence.com/entertainment/burna-boy-madison-square-garden-merch"},
  {pub:"The Source",what:"Limited merch line for One Night in Space",url:"https://thesource.com/?p=650972"},
  {pub:"StyleRave",what:"One Night in Space, the night and the merch",url:"https://stylerave.com/burna-boy-one-night-in-space/"}];
const CAU=[
  {pub:"Hypebeast",what:"New Balance unveils the Conversations Amongst Us collection",url:"https://hypebeast.com/2022/4/new-balance-2002r-550-conversation-amongst-us-release-date"},
  {pub:"Highsnobiety",what:"Joe Freshgoods × New Balance 550, Conversations Amongst Us",url:"https://www.highsnobiety.com/p/joe-freshgoods-new-balance-conversations-amongst-us-550"},
  {pub:"Essence",what:"The collection and the story behind it",url:"https://essence.com/fashion/new-balance-conversations-among-us"},
  {pub:"Hypebae",what:"Release info for the full range",url:"https://hypebae.com/2022/4/joe-freshgoods-new-balance-conversations-amongst-us-release-info"},
  {pub:"Gear Patrol",what:"A New Balance collab that champions diversity",url:"https://www.gearpatrol.com/style/shoes-boots/g39717051/new-balance-conversations-amongst-us-550"}];

const EARL10=[
    {pub:"Grimy Goods",what:"Earl's surprise IDLSIDGO 10-year show at the Echoplex, and its anniversary shirts",url:"https://www.grimygoods.com/?p=266690"},
    {pub:"The Poly Post",what:"A packed one-night-only 10-year anniversary show in LA",url:"https://thepolypost.com/arts-and-culture/2025/04/15/earl-sweatshirt-delivers-nostalgia-humor-for-packed-10-year-anniversary-show-at-las-echoplex/"},
    {pub:"The FADER",what:"I Don't Like Shit… turns 10",url:"https://www.thefader.com/2025/03/27/liam-inscoe-jones-songs-in-the-key-of-mp3-earl-sweatshirt"}];

const PRESS={
  "burna":{press:MSG,shop:[{store:"On a Spaceship",item:"Burna Boy official store",url:"https://onaspaceship.com"}]},
  "burna-space":{press:MSG,shop:[{store:"On a Spaceship",item:"Burna Boy official store",url:"https://onaspaceship.com"}]},
  "hh50":{press:[
    {pub:"Uproxx",what:"Dreamville's Hip-Hop 50 capsule collection",url:"https://uproxx.com/music/dreamville-hip-hop-50-capsule-collection"},
    {pub:"Boardroom",what:"Dreamville × Starter for hip-hop's 50th",url:"https://boardroom.tv/?p=84158"},
    {pub:"The Source",what:"The Hip-Hop 50 × Dreamville drop",url:"https://thesource.com/?p=702174"}],
   shop:[
    {store:"Mass Appeal",item:"Black Starter jacket",url:"https://shop.massappeal.com/products/hh50-x-dreamville-black-starter-jacket"},
    {store:"Mass Appeal",item:"Hoodie",url:"https://shop.massappeal.com/products/hh50-x-dreamville-black-hoodie"},
    {store:"Mass Appeal",item:"Hat",url:"https://shop.massappeal.com/products/hh50-x-dreamville-hat"}]},
  "dreamville":{press:[
    {pub:"Highsnobiety",what:"Dreamville's merch collection",url:"https://www.highsnobiety.com/p/dreamville-merch-collection"},
    {pub:"Complex",what:"Dreamville shares a new apparel collection",url:"https://www.complex.com/style/dreamville-shares-new-apparel-collection"},
    {pub:"The Source",what:"Dreamville's outerwear drop",url:"https://thesource.com/?p=676401"}]},
  "conversations":{press:CAU,shop:[{store:"GOAT",item:"574 Conversations Amongst Us",url:"https://www.goat.com/sneakers/joe-freshgoods-x-574-conversations-amongst-us-u574bh2"}]},
  "jfgnb":{press:[
    {pub:"Highsnobiety",what:"Joe Freshgoods, New Balance and conversations that matter",url:"https://highsnobiety.com/p/joe-freshgoods-new-balance-campaign-interview"},
    {pub:"Hypebeast",what:"The Conversations Amongst Us collection",url:CAU[0].url},
    {pub:"Black Enterprise",what:"Joe Freshgoods releases his New Balance collection",url:"https://blackenterprise.com/chicago-designer-joe-freshgoods-releases-his-new-sneaker-collection-in-collaboration-with-new-balance/"}]},
  "jfgsprite":{press:[
    {pub:"Essence",what:"ICYMI: the Joe Freshgoods × Sprite launch",url:"https://www.essence.com/fashion/icymi-joe-fresh-goods-sprite-launch/"},
    {pub:"FoodSided",what:"Sprite × Joe Freshgoods, Chicago-inspired cans",url:"https://foodsided.com/sprite-joe-freshgoods-obey-your-thirst"},
    {pub:"Beverage Industry",what:"Sprite and Joe Freshgoods partner on a capsule",url:"https://www.bevindustry.com/articles/97116-sprite-joe-freshgoods-partner-on-capsule-collection"},
    {pub:"Packaging Connections",what:"Sprite launches its Joe Freshgoods collab",url:"https://packagingconnections.com/news/sprite-launches-new-collaboration-joe-freshgoods"}]},
  "ed-sheeran":{press:[
    {pub:"TWTD",what:"The Sheeran Town shirt on sale at the Ipswich pop-up",url:"https://www.twtd.co.uk/amp/news/36542/sheeran-town-shirt-on-sale-at-pop-up-shop-ahead-of-ipswich-gigs"}]},
  "cardi-b-bodega":{press:[
    {pub:"CBS New York",what:"Cardi B's Bodega Baddie pop-up in Washington Heights",url:"https://www.cbsnews.com/amp/newyork/news/cardi-b-bodega-baddie-pop-up-washington-heights"},
    {pub:"Complex",what:"The turnout at Cardi B's NYC pop-up",url:"https://www.complex.com/music/a/treyalston/cardi-b-atlantic-records-underestimated-nyc-pop-up"}]},
  "cleveland-collage":{shop:[
    {store:"Zumiez",item:"EST 19XX Cleveland Collage white tee",url:"https://www.zumiez.com/est-19xx-cleveland-collage-white-t-shirt.html"}]},
  "earl-idls":{press:EARL10},
  "earl-10-years":{press:EARL10},
  "idls-gate":{press:EARL10},
  "idls":{press:[
    {pub:"Hypebeast",what:"Review: I Don't Like Shit, I Don't Go Outside",url:"https://hypebeast.com/2015/4/earl-sweatshirt-i-dont-like-shit-i-dont-go-outside-review"},
    {pub:"XXL",what:"Review of Earl's second album",url:"https://www.xxlmag.com/earl-sweatshirt-dont-like-shit-go-outside-review/"},
    {pub:"The FADER",what:"The album turns 10",url:"https://www.thefader.com/2025/03/27/liam-inscoe-jones-songs-in-the-key-of-mp3-earl-sweatshirt"},
    {pub:"PopMatters",what:"Review: I Don't Like Shit, I Don't Go Outside",url:"https://popmatters.com/review/191714-earl-sweatshirt-i-dont-like-shit-i-dont-go-outside"},
    {pub:"Slant",what:"Review of the 2015 album",url:"https://slantmagazine.com/music/earl-sweatshirt-i-dont-do-shit-i-dont-go-outside"}]},
  "lll":{press:[
    {pub:"Billboard",what:"Earl Sweatshirt releases Live Laugh Love",url:"https://ca.billboard.com/music/rb-hip-hop/earl-sweatshirt-live-laugh-love-album-release-track-list-1236047511/"},
    {pub:"The FADER",what:"Review: Earl Sweatshirt unwinds on Live Laugh Love",url:"https://www.thefader.com/2025/08/27/earl-sweatshirt-live-laugh-love-review"},
    {pub:"Complex",what:"Stream Earl's new album Live Laugh Love",url:"https://www.complex.com/music/a/joshua-espinoza/earl-sweatshirt-live-laugh-love-album-stream"},
    {pub:"Stereogum",what:"Album of the week: Live Laugh Love",url:"https://stereogum.com/2320176/earl-sweatshirt-live-laugh-love-album-review/columns"},
    {pub:"Consequence",what:"Live Laugh Love review",url:"https://consequence.net/2025/08/earl-sweatshirt-live-laugh-love-review"},
    {pub:"SSENSE",what:"The Normal Life of Earl Sweatshirt",url:"https://www.ssense.com/en-lv/editorial/music/earl-sweatshirt-live-laugh-love"},
    {pub:"Uproxx",what:"Earl Sweatshirt releases Live Laugh Love",url:"https://uproxx.com/music/earl-sweatshirt-releases-live-laugh-love-album"},
    {pub:"Slant",what:"Live Laugh Love review: keep calm and carry on",url:"https://www.slantmagazine.com/music/earl-sweatshirt-live-laugh-love-album-review"}],
   shop:[
    {store:"Turntable Lab",item:"Live Laugh Love vinyl LP",url:"https://turntablelab.com/products/earl-sweatshirt-live-laugh-love-vinyl-lp"},
    {store:"Good Taste Records",item:"Live Laugh Love vinyl LP",url:"https://goodtasterecords.com/products/earl-sweatshirt-live-laugh-love-vinyl-lp"},
    {store:"Good Taste Records",item:"Alternative cover vinyl, black & orange crush",url:"https://goodtasterecords.com/products/earl-sweatshirt-live-laugh-love-alternative-cover-black-orange-crush-color-vinyl-lp"}]}
};
window.PD_PRESS=PRESS;

/* ---- every project opens on its flat, textured graphic: some older projects used a product or model photo
   (hosted on the old Wix site) as the cover; their textured "pd-cover-…" graphic in the gallery takes its place
   and the photo moves into the gallery right after it. ---- */
if(typeof PROJECTS!=="undefined"&&Array.isArray(PROJECTS))PROJECTS.forEach(p=>{
  if(!p||!p.image||/pd-cover-|webflow-prod-assets/.test(p.image)&&!/wixstatic/.test(p.image))return;
  const g=(p.gallery||[]).slice(),k=g.findIndex(u=>typeof u==="string"&&/pd-cover-/.test(u));if(k<0)return;
  const cov=g.splice(k,1)[0];p.gallery=[p.image,...g];p.image=cov;
});
/* ---- the card's background is the cover's own background colour, so the graphic looks full-bleed ---- */
if(typeof PROJECTS!=="undefined"&&Array.isArray(PROJECTS)&&window.PD_BG)PROJECTS.forEach(p=>{
  if(!p||!p.image||p.nl||p.ad)return;const c=window.PD_BG[window.PD_BGKEY(p.image)];if(c)p.imageBg="#"+c;
});

/* ---- the deck order is shuffled on every visit (2026-11-06: replaces "projects with press come first").
   Special cards (newsletter, ads) stay in their slots. ---- */
if(typeof PROJECTS!=="undefined"&&Array.isArray(PROJECTS)){
  const special=p=>!p||p.kind||p.nl||p.ad||/^pd-/.test(String(p.id));
  const slots=[],items=[];PROJECTS.forEach((p,i)=>{if(!special(p)){slots.push(i);items.push(p)}});
  for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]]}
  slots.forEach((i,k)=>PROJECTS[i]=items[k]);
  try{if(typeof idx!=="undefined"&&idx===0&&typeof renderDeck==="function"&&(typeof mode==="undefined"||mode==="swipe"))renderDeck()}catch(e){}
}

const css=`
.pd-seen{position:absolute;top:12px;left:12px;z-index:4;display:flex;align-items:center;gap:6px;max-width:calc(100% - 24px);box-sizing:border-box;
  padding:5px 10px 5px 8px;border-radius:999px;background:rgba(14,14,16,.62);color:#fff;-webkit-backdrop-filter:blur(10px) saturate(1.4);backdrop-filter:blur(10px) saturate(1.4);
  font-family:var(--f-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;pointer-events:none;box-shadow:0 6px 18px -8px rgba(0,0,0,.5)}
.pd-seen b{font-family:var(--f-display);font-weight:800;font-size:13px;letter-spacing:.02em}
.pd-seen i{font-style:normal;opacity:.6}
.pd-seen svg{flex:none;width:11px;height:11px}
html.shopsw .pd-seen{display:none}
.pd-seen{animation:pdSeenIn .45s .3s cubic-bezier(.22,1,.36,1) both}
/* paper grain over the whole cover area, so the flat colour around the graphic reads as the same printed sheet */
#deck .dcard .art:has(img)::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.5;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.6 -.55'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E");background-size:220px 220px}
.pd-ext{position:absolute;display:block;pointer-events:none;background-repeat:no-repeat;transform:scaleY(-1)}
.pd-ext-b{-webkit-mask-image:linear-gradient(to top,#000,transparent);mask-image:linear-gradient(to top,#000,transparent)}
.pd-ext-t{-webkit-mask-image:linear-gradient(to bottom,#000,transparent);mask-image:linear-gradient(to bottom,#000,transparent)}
@keyframes pdSeenIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.pd-seen{animation:none}}
.pd-press>.mono,.pd-get>.mono{display:flex;justify-content:space-between;color:var(--muted);margin-bottom:10px}
.pd-pcards{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 2px 8px;margin:0 -2px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.pd-pcards::-webkit-scrollbar{display:none}
.pd-pcard{flex:0 0 64%;max-width:240px;min-height:138px;box-sizing:border-box;scroll-snap-align:start;display:flex;flex-direction:column;justify-content:space-between;gap:10px;
  padding:14px 14px 12px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--ink);text-decoration:none;
  transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s,border-color .35s}
.pd-pcard:first-child{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.pd-pcard .pub{font-family:var(--f-display);font-weight:800;font-size:25px;line-height:.95;text-transform:uppercase;letter-spacing:.01em}
.pd-pcard .what{font-size:13px;line-height:1.35;opacity:.82}
.pd-pcard .src{display:flex;justify-content:space-between;align-items:center;font-family:var(--f-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;opacity:.6}
.pd-pcard .src span:last-child{transition:transform .35s cubic-bezier(.22,1,.36,1)}
.pd-pcard:hover,.pd-pcard:focus-visible{transform:translateY(-3px);box-shadow:0 14px 28px -16px rgba(0,0,0,.45)}
.pd-pcard:hover .src span:last-child{transform:translate(3px,-3px)}
.pd-glist{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.pd-glist a{display:flex;align-items:center;gap:12px;padding:12px 2px;border-bottom:1px solid var(--line);color:var(--ink);text-decoration:none}
.pd-glist .st{font-family:var(--f-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);min-width:0;flex:none;max-width:40%}
.pd-glist .it{flex:1;font-weight:600;font-size:14px}
.pd-glist .go{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:var(--bg);font-size:13px;transition:transform .3s}
.pd-glist li:last-child a{border-bottom:0}
.pd-glist a:hover .go{transform:rotate(-45deg)}
@media (prefers-reduced-motion:reduce){.pd-pcard,.pd-pcard .src span,.pd-glist .go{transition:none}.pd-pcard:hover{transform:none}}
`;
const st=document.createElement("style");st.id="pd-press";st.textContent=css;document.body.appendChild(st);

const track=(p,l)=>{try{if(typeof gtag==="function")gtag("event","press_click",{project:p.id,link_domain:host(l.url)})}catch(e){}};
const arrow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l2.9 6.3 6.8.7-5.1 4.6 1.5 6.7L12 16.9 5.9 20.3l1.5-6.7L2.3 9l6.8-.7z"/></svg>';

const bag='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l1 13H5z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>';
/* ---- badge on the portfolio card ("Seen in …", or "Sold at …" when there are only shop links) ---- */
function badges(){
  if(document.documentElement.classList.contains("shopsw"))return;
  document.querySelectorAll("#deck .dcard[data-pid]").forEach(c=>{
    const has=c.querySelector(".pd-seen");
    /* only the card on top gets a badge (not the ones waiting underneath, nor the one flying away) */
    if(!c.classList.contains("top")||c.classList.contains("fx-gone")){if(has)has.remove();return}
    const x=PRESS[c.dataset.pid];
    const pr=(x&&x.press)||[],sh=(x&&x.shop)||[];
    if(!pr.length&&!sh.length){if(has)has.remove();return}
    if(has&&has.dataset.pid===c.dataset.pid)return;if(has)has.remove();
    const b=document.createElement("div");b.className="pd-seen";b.dataset.pid=c.dataset.pid;
    b.innerHTML=pr.length?`${arrow}<span>Seen in</span><b>${esc(pr[0].pub)}</b>${pr.length>1?`<i>+${pr.length-1}</i>`:""}`
      :`${bag}<span>Sold at</span><b>${esc(sh[0].store)}</b>`;
    c.appendChild(b);
  });
}
/* ---- the cover graphic looks full-bleed: the strip of card left above/below it continues the graphic's own paper
   (its edge, mirrored and fading out) on top of the matching flat colour ---- */
function ext(c){
  const im=c.querySelector(".art img");if(!im)return;
  if(!im.complete||!im.naturalWidth){if(!im.dataset.pdExt){im.dataset.pdExt="w";im.addEventListener("load",()=>{im.dataset.pdExt="";ext(c)},{once:true})}return}
  const W=im.clientWidth,H=im.clientHeight,nw=im.naturalWidth,nh=im.naturalHeight;if(!W||!H)return;
  const s=Math.min(W/nw,H/nh),dw=nw*s,dh=nh*s,py=(parseFloat((getComputedStyle(im).objectPosition||"50% 50%").split(" ")[1])||50)/100;
  const top=(H-dh)*py,bot=H-dh-top,src=im.currentSrc||im.src,sig=[src,W,H].join("|");
  if(im.dataset.pdExtSig===sig)return;im.dataset.pdExtSig=sig;
  const par=im.parentElement;par.querySelectorAll(":scope>.pd-ext").forEach(e=>e.remove());
  if(getComputedStyle(par).position==="static")par.style.position="relative";
  const f=Math.round(Math.min(dh*.06,36));
  [["b",bot],["t",top]].forEach(([k,g])=>{
    if(g<3)return;const d=document.createElement("i");d.className="pd-ext pd-ext-"+k;
    const y=k==="b"?im.offsetTop+top+dh:im.offsetTop+top-Math.min(g,f);
    d.style.cssText=`left:${im.offsetLeft+(W-dw)/2}px;width:${dw}px;top:${y}px;height:${Math.min(g,f)}px;`+
      `background-image:url("${src.replace(/"/g,"%22")}");background-size:${dw}px ${dh}px;background-position:center ${k==="b"?"bottom":"top"}`;
    im.after(d);
  });
}
function exts(){document.querySelectorAll("#deck .dcard[data-pid]").forEach(ext)}
const deck=document.getElementById("deck");
if(deck)new MutationObserver(()=>{badges();exts()}).observe(deck,{childList:true,subtree:true,attributes:true,attributeFilter:["data-pid","class","src"]});
badges();exts();
let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(exts,150)});

/* ---- sections in the opened project ---- */
const _od=openDetail;
openDetail=function(p){
  const r=_od.apply(this,arguments);
  try{
    const x=p&&!p.kind&&PRESS[p.id];if(!x)return r;
    const s=typeof scrim!=="undefined"?scrim:document.querySelector(".scrim"),body=s&&s.querySelector(".sheet .body");if(!body)return r;
    let h="";const pr=x.press||[],sh=x.shop||[];
    if(pr.length)h+=`<section class="pd-press"><div class="mono"><span>Seen in</span><span>${pr.length} ${pr.length===1?"story":"stories"}</span></div><div class="pd-pcards">${
      pr.map((l,k)=>`<a class="pd-pcard" href="${esc(l.url)}" target="_blank" rel="noopener" data-k="p${k}"><span class="pub">${esc(l.pub)}</span><span class="what">${esc(l.what)}</span><span class="src"><span>${esc(host(l.url))}</span><span>↗</span></span></a>`).join("")}</div></section>`;
    if(sh.length)h+=`<section class="pd-get"><div class="mono"><span>Get it</span></div><ul class="pd-glist">${
      sh.map((l,k)=>`<li><a href="${esc(l.url)}" target="_blank" rel="noopener" data-k="s${k}"><span class="st">${esc(l.store)}</span><span class="it">${esc(l.item)}</span><span class="go">↗</span></a></li>`).join("")}</ul></section>`;
    if(!h)return r;
    const spec=body.querySelector(":scope>dl.spec");
    if(spec)spec.insertAdjacentHTML("beforebegin",h);else body.insertAdjacentHTML("beforeend",h);
    body.querySelectorAll(".pd-press a,.pd-get a").forEach(a=>a.addEventListener("click",()=>{const k=a.dataset.k,l=(k[0]==="p"?pr:sh)[+k.slice(1)];l&&track(p,l)}));
  }catch(e){}
  return r;
};
})();
