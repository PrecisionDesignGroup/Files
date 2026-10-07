/* ---------- SHOP > See on Garment: share your design ----------
   A Share button on the 3D preview turns the current view into a branded image:
   Instagram Story (9:16, through the phone's share menu), a post for X (4:5) and a download.
   WebGL clears its canvas after each frame, so 3D canvases are created with preserveDrawingBuffer to allow the capture. */
(function(){
const _gc=HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext=function(type,attrs){
  if(type==="webgl"||type==="webgl2"||type==="experimental-webgl")attrs=Object.assign({},attrs,{preserveDrawingBuffer:true});
  return _gc.call(this,type,attrs)};
const deck=document.getElementById("deck");if(!deck)return;
const SITE="precisiondesign.club/shop",URL_="https://precisiondesign.club/shop",IG="@precisiondesigngroup",XH="@prcsndesigns";

const st=document.createElement("style");st.textContent=`
.gm-share{position:absolute;z-index:3;right:10px;top:8px;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 13px 0 11px;border-radius:999px;border:1px solid var(--line);
  background:color-mix(in srgb,var(--surface) 78%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:var(--ink);font:inherit;font-weight:600;font-size:12px;cursor:pointer;transition:transform .15s}
.gm-share:active{transform:scale(.94)}
.gm-share svg{width:14px;height:14px}
.gm-stage .gm-hint{padding:0 96px}
.sheet.pdshare .bigart{display:grid;place-items:center;background:var(--surface);padding:18px;aspect-ratio:auto;min-height:300px}
.sheet.pdshare .bigart img{max-width:100%;max-height:min(62vh,640px);width:auto;height:auto;border-radius:12px;box-shadow:0 18px 40px -18px rgba(0,0,0,.6);display:block}
.sheet.pdshare .bigart .ld{font-family:var(--f-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.pds-fmt{display:flex;gap:6px}
.pds-fmt button{height:32px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:12px;font-weight:600;cursor:pointer}
.pds-fmt button[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.pds-btns{display:flex;flex-direction:column;gap:8px}
.pds-btns button{display:flex;align-items:center;gap:12px;width:100%;padding:13px 16px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:600;font-size:15px;cursor:pointer;text-align:left;transition:border-color .2s,transform .15s}
.pds-btns button:hover{border-color:var(--ink)}
.pds-btns button:active{transform:scale(.98)}
.pds-btns button:disabled{opacity:.45;cursor:default}
.pds-btns svg{width:20px;height:20px;flex:none}
.pds-btns small{display:block;font-weight:500;font-size:12px;color:var(--muted);margin-top:2px}
.pds-btns .ig i{width:20px;height:20px;border-radius:6px;flex:none;background:radial-gradient(circle at 30% 107%,#fdf497 0%,#fd5949 45%,#d6249f 60%,#285AEB 90%);display:grid;place-items:center}
.pds-btns .ig i svg{width:14px;height:14px;color:#fff}
.pds-msg{font-size:13px;color:var(--muted);min-height:1.4em}
`;document.head.appendChild(st);

const shareIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
const igIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>';
const xIco='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z"/></svg>';
const dlIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>';

/* add the button whenever a garment preview opens */
function addBtn(view){const stage=view.querySelector(".gm-stage");if(!stage||stage.querySelector(".gm-share"))return;
  const b=document.createElement("button");b.type="button";b.className="gm-share";b.setAttribute("aria-label","Share your design");b.innerHTML=shareIco+"<span>Share</span>";
  b.addEventListener("pointerdown",e=>e.stopPropagation());b.addEventListener("click",e=>{e.stopPropagation();open(view)});stage.appendChild(b)}
new MutationObserver(()=>{deck.querySelectorAll(".gm-view").forEach(addBtn)}).observe(deck,{childList:true,subtree:true});

/* what's on the garment, read from the tray */
function info(view){
  const t=view.querySelector(".gm-tray");const ga=t&&t.querySelector("[data-garment][aria-pressed=true]"),co=t&&t.querySelector("[data-color][aria-pressed=true]");
  let ids=[];try{ids=window.__gmDebug().layers.map(l=>l[0])}catch(e){ids=[...(t?t.querySelectorAll("[data-g][data-on]"):[])].map(b=>b.dataset.g)}
  const titles=ids.map(id=>{const b=t&&t.querySelector(`[data-g="${id}"]`);const p=(typeof SHOP!=="undefined"&&SHOP.find(x=>x.id===id));return (p&&p.title)||(b&&b.getAttribute("title"))||""}).filter(Boolean);
  return{garment:ga?ga.textContent.trim():"Tee",color:co?co.getAttribute("aria-label"):"",hex:co?co.dataset.color:"#1c1c1e",titles};
}
const cssVar=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const lum=h=>{const m=/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})/i.exec(h||"");if(!m)return 0;const [r,g,b]=m.slice(1).map(x=>parseInt(x,16)/255);return .2126*r+.7152*g+.0722*b};

/* fresh frame from the 3D view (a resize makes the preview redraw) */
function grab(view){return new Promise(res=>{const cv=view.querySelector(".gm-stage canvas");if(!cv||!cv.width)return res(null);
  dispatchEvent(new Event("resize"));requestAnimationFrame(()=>requestAnimationFrame(()=>{
    /* trim to the garment so it fills the image */
    const w=cv.width,h=cv.height,tmp=document.createElement("canvas");tmp.width=w;tmp.height=h;const x=tmp.getContext("2d",{willReadFrequently:true});x.drawImage(cv,0,0);
    let d;try{d=x.getImageData(0,0,w,h).data}catch(e){return res(null)}
    let x0=w,y0=h,x1=-1,y1=-1;for(let j=0;j<h;j+=2)for(let i=0;i<w;i+=2){if(d[(j*w+i)*4+3]>24){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j}}
    if(x1<0)return res(null);const p=Math.round(Math.max(w,h)*.02);x0=Math.max(0,x0-p);y0=Math.max(0,y0-p);x1=Math.min(w-1,x1+p);y1=Math.min(h-1,y1+p);
    const o=document.createElement("canvas");o.width=x1-x0+1;o.height=y1-y0+1;o.getContext("2d").drawImage(cv,x0,y0,o.width,o.height,0,0,o.width,o.height);res(o)}))})}

function fit(ctx,text,max,size,weight,fam){let s=size;do{ctx.font=`${weight} ${s}px ${fam}`;if(ctx.measureText(text).width<=max)break;s-=2}while(s>18);return s}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function compose(shot,inf,fmt){
  const W=1080,H=fmt==="story"?1920:1350,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const DSP=cssVar("--f-display")||"Impact,sans-serif",MONO=cssVar("--f-mono")||"monospace";
  const darkG=lum(inf.hex)<.45,bg0=darkG?"#F1EFE9":"#1A1B1E",bg1=darkG?"#D8D5CD":"#0C0D0E",ink=darkG?"#141414":"#F4F2EC",mut=darkG?"rgba(20,20,20,.55)":"rgba(244,242,236,.55)";
  const g=x.createRadialGradient(W/2,H*.42,40,W/2,H*.5,H*.75);g.addColorStop(0,bg0);g.addColorStop(1,bg1);x.fillStyle=g;x.fillRect(0,0,W,H);
  /* faint grid, like the site */
  x.strokeStyle=darkG?"rgba(0,0,0,.05)":"rgba(255,255,255,.035)";x.lineWidth=1;for(let i=0;i<W;i+=54){x.beginPath();x.moveTo(i+.5,0);x.lineTo(i+.5,H);x.stroke()}for(let j=0;j<H;j+=54){x.beginPath();x.moveTo(0,j+.5);x.lineTo(W,j+.5);x.stroke()}
  const M=72,top=fmt==="story"?150:96;
  /* brand row */
  x.strokeStyle=ink;x.lineWidth=3;x.beginPath();x.arc(M+16,top-12,15,0,7);x.stroke();x.beginPath();x.arc(M+16,top-12,7,0,7);x.stroke();
  x.fillStyle=ink;x.font=`800 34px ${DSP}`;x.textBaseline="alphabetic";x.fillText("PRECISION DESIGN GROUP",M+46,top);
  x.fillStyle=mut;x.font=`500 22px ${MONO}`;x.textAlign="right";x.fillText("MY DESIGN",W-M,top-4);x.textAlign="left";
  /* garment */
  const by=fmt==="story"?1440:1010,ay=top+40,ah=by-ay-40,aw=W-2*M;
  if(shot){const k=Math.min(aw/shot.width,ah/shot.height),w=shot.width*k,h=shot.height*k;
    x.imageSmoothingQuality="high";x.drawImage(shot,(W-w)/2,ay+(ah-h)/2,w,h)}
  /* title + details */
  const title=(inf.titles.length?inf.titles.join(" + "):"Custom design").toUpperCase();
  const ts=fit(x,title,W-2*M,fmt==="story"?104:84,900,DSP);x.fillStyle=ink;x.font=`900 ${ts}px ${DSP}`;x.fillText(title,M,by+ts*.82);
  x.fillStyle=mut;x.font=`500 26px ${MONO}`;x.fillText([inf.garment,inf.color].filter(Boolean).join(" · ").toUpperCase(),M,by+ts*.82+50);
  /* call to action pill */
  const py=H-(fmt==="story"?190:110),label=`Make yours at ${SITE}`;x.font=`700 30px ${cssVar("--f-body")||"sans-serif"}`;const pw=x.measureText(label).width+64;
  x.fillStyle="#F2C649";rr(x,M,py-44,pw,72,36);x.fill();x.fillStyle="#141414";x.fillText(label,M+32,py+3);
  x.fillStyle=mut;x.font=`500 22px ${MONO}`;x.textAlign="right";x.fillText(IG,W-M,py+3);x.textAlign="left";
  return c;
}
const blobOf=c=>new Promise(r=>c.toBlob(r,"image/png"));
const coarse=matchMedia("(pointer:coarse)").matches;

async function open(view){
  if(typeof showSheet!=="function")return;
  const inf=info(view),name=(inf.titles[0]||"design").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const s=showSheet(`<div class="bigart"><span class="ld">Making your image…</span></div>
  <div class="body">
    <div class="top"><span class="mono">Share your design</span><button class="x" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
    <div><h3>Show it off</h3></div>
    <p>Share your ${esc(inf.garment.toLowerCase())} design and tag <b>${IG}</b>. We repost our favorites.</p>
    <div class="pds-fmt" role="group" aria-label="Image size"><button type="button" data-f="story" aria-pressed="true">Story 9:16</button><button type="button" data-f="post" aria-pressed="false">Post 4:5</button></div>
    <div class="pds-btns">
      <button type="button" class="ig" data-a="ig" disabled><i>${igIco}</i><span>Instagram Story<small>${coarse?"Pick Instagram, then Story":"Saves the image to post from your phone"}</small></span></button>
      <button type="button" data-a="x" disabled>${xIco}<span>Post on X<small>Opens a post with your image ready to attach</small></span></button>
      <button type="button" data-a="dl" disabled>${dlIco}<span>Download image<small>PNG, ready for anywhere</small></span></button>
    </div>
    <div class="pds-msg" role="status" aria-live="polite"></div>
  </div>`,"pdshare");
  const art=s.querySelector(".bigart"),msg=s.querySelector(".pds-msg"),say=t=>{msg.textContent=t};
  await (document.fonts?Promise.all([document.fonts.load(`900 80px ${cssVar("--f-display")}`),document.fonts.load(`500 20px ${cssVar("--f-mono")}`)]).catch(()=>{}):0);
  const shot=await grab(view);
  if(!shot){art.innerHTML=`<span class="ld">Couldn't capture the preview</span>`;say("Try again once the garment has loaded.");return}
  const out={};for(const f of ["story","post"]){const c=compose(shot,inf,f);out[f]={c,blob:await blobOf(c)}}
  if(!s.isConnected)return;
  let fmt="story";const im=new Image();im.alt="Your design";art.innerHTML="";art.appendChild(im);
  const show=()=>{if(im.src)URL.revokeObjectURL(im.src);im.src=URL.createObjectURL(out[fmt].blob)};show();
  s.querySelectorAll(".pds-fmt button").forEach(b=>b.onclick=()=>{fmt=b.dataset.f;s.querySelectorAll(".pds-fmt button").forEach(o=>o.setAttribute("aria-pressed",String(o===b)));show()});
  s.querySelectorAll(".pds-btns button").forEach(b=>b.disabled=false);
  const fileOf=f=>new File([out[f].blob],`precision-design-${name}-${f}.png`,{type:"image/png"});
  const download=f=>{const a=document.createElement("a");a.href=URL.createObjectURL(out[f].blob);a.download=`precision-design-${name}-${f}.png`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)};
  const canFiles=f=>{try{return !!(navigator.canShare&&navigator.canShare({files:[fileOf(f)]}))}catch(e){return false}};
  const text=`My ${inf.garment.toLowerCase()} design${inf.titles.length?` with "${inf.titles.join('" + "')}"`:""} by ${XH}. Make yours:`;
  const done=()=>{if(typeof sfx==="function")try{sfx("save")}catch(_){}};
  s.querySelector('[data-a="ig"]').onclick=async()=>{
    if(coarse&&canFiles("story")){try{await navigator.share({files:[fileOf("story")]});done();say(`Tag ${IG} in your story!`)}catch(e){if(e&&e.name!=="AbortError")say("Couldn't open the share menu. Use Download instead.")}return}
    download("story");done();say(`Story image saved. Add it to your Instagram story from your phone and tag ${IG}.`)};
  s.querySelector('[data-a="x"]').onclick=async()=>{
    if(coarse&&canFiles(fmt)){try{await navigator.share({files:[fileOf(fmt)],text:text+" "+URL_});done();say("Pick X from the share menu.")}catch(e){if(e&&e.name!=="AbortError")say("Couldn't open the share menu.")}return}
    const w=window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(URL_)}`,"_blank");if(w)try{w.opener=null}catch(_){}
    download(fmt);done();say("Image saved. Attach it to your post on X.")};
  s.querySelector('[data-a="dl"]').onclick=()=>{
    if(coarse&&canFiles(fmt)){navigator.share({files:[fileOf(fmt)]}).then(()=>{done();say("Saved!")}).catch(e=>{if(e&&e.name!=="AbortError")download(fmt)});return}
    download(fmt);done();say("Image saved.")};
}
})();
