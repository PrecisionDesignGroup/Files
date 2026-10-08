/* ---------- SHOP > See on Garment: try a graphic with the camera ----------
   A Camera button on the 3D preview swaps the card for a live camera viewfinder (back camera on phones) with the
   graphic laid over it. Drag to move it, pinch or use the sliders to size and rotate, "Fabric" blends it into what
   the camera sees, and the shutter saves or shares a photo. Nothing is uploaded; the video stays on the device.
   The graphic stays where it's placed on screen (it doesn't track the shirt). */
(function(){
const deck=document.getElementById("deck");if(!deck)return;
const coarse=matchMedia("(pointer:coarse)").matches;
const st=document.createElement("style");st.textContent=`
.gm-cam{position:absolute;z-index:3;left:10px;top:8px;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 13px 0 11px;border-radius:999px;border:1px solid var(--line);
  background:color-mix(in srgb,var(--surface) 78%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:var(--ink);font:inherit;font-weight:600;font-size:12px;cursor:pointer;transition:transform .15s}
.gm-cam:active{transform:scale(.94)}
.gm-cam svg{width:15px;height:15px}
html.cam-on .gm-toggle{display:none!important}
.cam-view{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;background:#000;border-radius:inherit;overflow:hidden;cursor:default;touch-action:none}
.cam-vf{position:relative;flex:1;min-height:0;overflow:hidden;background:#0b0b0c}
.cam-vf video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.cam-vf video.mirror{transform:scaleX(-1)}
.cam-g{position:absolute;left:0;top:0;width:40%;max-width:none;transform-origin:50% 50%;cursor:grab;user-select:none;-webkit-user-select:none;-webkit-user-drag:none;touch-action:none;filter:drop-shadow(0 2px 6px rgba(0,0,0,.25))}
.cam-g.fabric{mix-blend-mode:hard-light;opacity:.92;filter:none}
.cam-top{position:absolute;left:0;right:0;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;padding:10px;pointer-events:none;background:linear-gradient(rgba(0,0,0,.45),transparent)}
.cam-top button{pointer-events:auto;width:38px;height:38px;border-radius:50%;border:0;display:grid;place-items:center;background:rgba(20,20,22,.6);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#fff;cursor:pointer}
.cam-top button svg{width:18px;height:18px}
.cam-top span{font-family:var(--f-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.85);text-align:center;padding:0 8px}
.cam-msg{position:absolute;inset:0;z-index:2;display:grid;place-items:center;text-align:center;padding:28px;color:#f4f2ec;font-size:14px;line-height:1.5}
.cam-msg b{display:block;font-size:16px;margin-bottom:6px}
.cam-msg button{margin-top:14px;height:36px;padding:0 16px;border-radius:999px;border:1px solid rgba(255,255,255,.4);background:transparent;color:#fff;font:inherit;font-weight:600;cursor:pointer}
.cam-flash{position:absolute;inset:0;z-index:4;background:#fff;opacity:0;pointer-events:none;transition:opacity .35s}
.cam-tray{flex:none;display:flex;flex-direction:column;gap:9px;padding:12px 14px 14px;border-top:1px solid var(--line);background:var(--surface);color:var(--ink);touch-action:pan-x}
.cam-tray .gm-row{display:flex;gap:8px;align-items:center;overflow-x:auto;scrollbar-width:none;padding:3px;margin:-3px}
.cam-tray .gm-row::-webkit-scrollbar{display:none}
.cam-shot{display:flex;align-items:center;justify-content:space-between;gap:10px}
.cam-shutter{flex:none;width:58px;height:58px;border-radius:50%;border:4px solid var(--ink);background:var(--surface);box-shadow:inset 0 0 0 4px var(--surface),inset 0 0 0 30px var(--ink);cursor:pointer;transition:transform .12s}
.cam-shutter:active{transform:scale(.9)}
.cam-shutter:disabled{opacity:.35}
.sheet.camshot .bigart{display:grid;place-items:center;background:#0b0b0c;padding:14px;aspect-ratio:auto;min-height:280px}
.sheet.camshot .bigart img{max-width:100%;max-height:min(62vh,640px);border-radius:12px;display:block}
.camshot .pds-btns{display:flex;flex-direction:column;gap:8px}
.camshot .pds-btns button{display:flex;align-items:center;gap:12px;width:100%;padding:13px 16px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:600;font-size:15px;cursor:pointer;text-align:left}
.camshot .pds-btns svg{width:20px;height:20px;flex:none}
`;document.head.appendChild(st);

const camIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.6"/></svg>';
const xIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const flipIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><path d="M9 13a3 3 0 0 1 5.2-2M15 13a3 3 0 0 1-5.2 2M14.5 9.2v1.9h-1.9M9.5 16.8v-1.9h1.9"/></svg>';
const shareIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
const dlIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>';

/* the button, on every garment preview */
function addBtn(view){const stage=view.querySelector(".gm-stage");if(!stage||stage.querySelector(".gm-cam"))return;
  const b=document.createElement("button");b.type="button";b.className="gm-cam";b.setAttribute("aria-label","Try this graphic with your camera");b.innerHTML=camIco+"<span>Camera</span>";
  b.addEventListener("pointerdown",e=>e.stopPropagation());b.addEventListener("click",e=>{e.stopPropagation();open(view)});stage.appendChild(b)}
new MutationObserver(()=>{deck.querySelectorAll(".gm-view").forEach(addBtn);if(cam&&!cam.box.isConnected)close()}).observe(deck,{childList:true,subtree:true});

/* graphics offered in the preview's tray (their transparent PNGs) */
function graphicsOf(view){return [...view.querySelectorAll(".gm-tray [data-g]")].map(b=>{const m=/url\(["']?([^"')]+)["']?\)/.exec(b.style.backgroundImage||"");return{id:b.dataset.g,title:b.getAttribute("title")||"",url:m?m[1]:""}}).filter(g=>g.url)}
function activeId(view){try{const d=window.__gmDebug();if(d.layers[d.active])return d.layers[d.active][0]}catch(e){}const b=view.querySelector(".gm-tray [data-g][aria-pressed=true]");return b&&b.dataset.g}

let cam=null;
async function start(facing){
  if(!cam)return;stop(true);const c=cam;c.facing=facing;msg("");
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){msg(`<b>Camera isn't available here</b>Open precisiondesign.club in Safari or Chrome to use it.`,false);return}
  msg("Starting the camera…");
  try{
    const s=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:facing},width:{ideal:1920},height:{ideal:1080}}});
    if(cam!==c){s.getTracks().forEach(t=>t.stop());return}
    c.stream=s;c.video.srcObject=s;c.video.classList.toggle("mirror",facing==="user");await c.video.play().catch(()=>{});msg("");c.shutter.disabled=false;
  }catch(e){const n=e&&e.name;
    msg(n==="NotAllowedError"||n==="SecurityError"?`<b>Camera access is off</b>Allow camera access for this site in your browser settings, then try again.`
      :n==="NotFoundError"||n==="OverconstrainedError"?`<b>No camera found</b>This device doesn't seem to have a camera we can use.`
      :`<b>Couldn't start the camera</b>If you're in an app's built-in browser, open the site in Safari or Chrome.`,true)}
}
function stop(keep){if(cam&&cam.stream){cam.stream.getTracks().forEach(t=>t.stop());cam.stream=null;if(cam.video)cam.video.srcObject=null}if(cam&&cam.shutter)cam.shutter.disabled=true}
function msg(html,retry){const m=cam&&cam.box.querySelector(".cam-msg");if(!m)return;m.style.display=html?"grid":"none";m.innerHTML=html?`<div>${html}${retry?'<br><button type="button" data-retry>Try again</button>':""}</div>`:"";
  const r=m.querySelector("[data-retry]");if(r)r.onclick=()=>start(cam.facing)}
function close(){stop();if(cam&&cam.box.isConnected)cam.box.remove();cam=null;document.documentElement.classList.remove("cam-on")}
document.addEventListener("visibilitychange",()=>{if(!cam)return;if(document.hidden)stop();else if(!cam.stream)start(cam.facing)});

function open(view){
  if(cam)close();
  const gs=graphicsOf(view);if(!gs.length)return;let g=gs.find(x=>x.id===activeId(view))||gs[0];
  const box=document.createElement("div");box.className="cam-view";
  box.innerHTML=`<div class="cam-vf"><video playsinline muted autoplay></video><img class="cam-g" alt="" draggable="false" crossorigin="anonymous">
    <div class="cam-top"><button type="button" data-close aria-label="Close camera">${xIco}</button><span>${coarse?"Drag to move · pinch to size":"Drag to move"}</span><button type="button" data-flip aria-label="Switch camera">${flipIco}</button></div>
    <div class="cam-msg"></div><i class="cam-flash"></i></div>
    <div class="cam-tray">
      <div class="gm-row"><span class="gm-lbl">Graphic</span>${gs.map(x=>`<button class="gm-thumb" data-cg="${x.id}" title="${esc(x.title)}" aria-label="${esc(x.title)}" style="background-image:url('${x.url}')"></button>`).join("")}</div>
      <div class="gm-row"><label class="gm-sl"><span>Size</span><input type="range" min="10" max="100" step="1" value="42" data-size></label><label class="gm-sl"><span>Rotate</span><input type="range" min="-180" max="180" step="1" value="0" data-rot></label></div>
      <div class="cam-shot"><button class="gm-chip" type="button" data-blend aria-pressed="false">Fabric</button><button class="cam-shutter" type="button" aria-label="Take a photo" disabled></button><button class="gm-chip" type="button" data-center>Center</button></div>
    </div>`;
  view.appendChild(box);document.documentElement.classList.add("cam-on");
  ["pointerdown","pointermove","pointerup","click","touchstart","touchmove","wheel","dblclick","keydown"].forEach(t=>box.addEventListener(t,e=>e.stopPropagation()));
  const vf=box.querySelector(".cam-vf"),img=box.querySelector(".cam-g"),size=box.querySelector("[data-size]"),rot=box.querySelector("[data-rot]");
  cam={box,view,video:box.querySelector("video"),shutter:box.querySelector(".cam-shutter"),stream:null,facing:"environment",x:.5,y:.45,w:.42,r:0,blend:false};
  const S=cam;
  const draw=()=>{const W=vf.clientWidth,H=vf.clientHeight,w=S.w*W;img.style.width=w+"px";
    img.style.transform=`translate(${S.x*W-w/2}px,${S.y*H-(img.naturalHeight?w*img.naturalHeight/img.naturalWidth:w)/2}px) rotate(${S.r}deg)`;
    size.value=Math.round(S.w*100);rot.value=Math.round(S.r)};
  const pick=x=>{g=x;img.onload=draw;img.src=x.url;box.querySelectorAll("[data-cg]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.cg===x.id)))};
  pick(g);
  box.querySelectorAll("[data-cg]").forEach(b=>b.onclick=()=>pick(gs.find(x=>x.id===b.dataset.cg)));
  size.oninput=()=>{S.w=size.value/100;draw()};rot.oninput=()=>{S.r=+rot.value;draw()};
  box.querySelector("[data-blend]").onclick=e=>{S.blend=!S.blend;img.classList.toggle("fabric",S.blend);e.currentTarget.setAttribute("aria-pressed",String(S.blend))};
  box.querySelector("[data-center]").onclick=()=>{S.x=.5;S.y=.45;S.r=0;draw()};
  box.querySelector("[data-close]").onclick=close;
  box.querySelector("[data-flip]").onclick=()=>start(S.facing==="environment"?"user":"environment");
  /* drag anywhere in the viewfinder to move; two fingers pinch/twist to size and rotate */
  const pts=new Map();let g0=null;
  vf.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;vf.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});g0=snap()});
  vf.addEventListener("pointermove",e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});const W=vf.clientWidth,H=vf.clientHeight,P=[...pts.values()];
    if(P.length===1){S.x=Math.min(1,Math.max(0,g0.x+(P[0].x-g0.p[0].x)/W));S.y=Math.min(1,Math.max(0,g0.y+(P[0].y-g0.p[0].y)/H))}
    else if(P.length>=2&&g0.p.length>=2){const d0=Math.hypot(g0.p[1].x-g0.p[0].x,g0.p[1].y-g0.p[0].y),d1=Math.hypot(P[1].x-P[0].x,P[1].y-P[0].y);
      const a0=Math.atan2(g0.p[1].y-g0.p[0].y,g0.p[1].x-g0.p[0].x),a1=Math.atan2(P[1].y-P[0].y,P[1].x-P[0].x);
      S.w=Math.min(1,Math.max(.1,g0.w*d1/Math.max(20,d0)));S.r=((g0.r+(a1-a0)*180/Math.PI+540)%360)-180}
    draw()});
  const up=e=>{pts.delete(e.pointerId);g0=snap()};vf.addEventListener("pointerup",up);vf.addEventListener("pointercancel",up);
  vf.addEventListener("wheel",e=>{e.preventDefault();S.w=Math.min(1,Math.max(.1,S.w*(1-e.deltaY*.001)));draw()},{passive:false});
  function snap(){return{x:S.x,y:S.y,w:S.w,r:S.r,p:[...pts.values()].map(p=>({...p}))}}
  new ResizeObserver(draw).observe(vf);
  cam.shutter.onclick=()=>shoot(g);
  start("environment");
}

/* the photo: the visible part of the video plus the graphic, exactly as framed */
function shoot(g){
  const S=cam;if(!S||!S.stream)return;const v=S.video,vf=S.box.querySelector(".cam-vf"),img=S.box.querySelector(".cam-g");
  const W=vf.clientWidth,H=vf.clientHeight,vw=v.videoWidth,vh=v.videoHeight;if(!vw||!vh)return;
  const k=Math.min(3,Math.max(1.5,Math.max(vw/W,vh/H))),c=document.createElement("canvas");c.width=Math.round(W*k);c.height=Math.round(H*k);const x=c.getContext("2d");
  const s=Math.max(W/vw,H/vh),dw=vw*s*k,dh=vh*s*k;
  x.save();if(S.facing==="user"){x.translate(c.width,0);x.scale(-1,1)}x.drawImage(v,(c.width-dw)/2,(c.height-dh)/2,dw,dh);x.restore();
  const gw=S.w*W*k,gh=img.naturalWidth?gw*img.naturalHeight/img.naturalWidth:gw;
  x.save();x.translate(S.x*W*k,S.y*H*k);x.rotate(S.r*Math.PI/180);if(S.blend){x.globalCompositeOperation="hard-light";x.globalAlpha=.92}
  try{x.drawImage(img,-gw/2,-gh/2,gw,gh)}catch(e){}x.restore();
  /* small credit in the corner */
  const fs=Math.round(13*k);x.font=`600 ${fs}px ${getComputedStyle(document.documentElement).getPropertyValue("--f-mono")||"monospace"}`;x.textAlign="right";
  x.fillStyle="rgba(0,0,0,.35)";x.fillText("precisiondesign.club",c.width-12*k+1,c.height-12*k+1);x.fillStyle="rgba(255,255,255,.9)";x.fillText("precisiondesign.club",c.width-12*k,c.height-12*k);
  const fl=S.box.querySelector(".cam-flash");fl.style.transition="none";fl.style.opacity=.85;requestAnimationFrame(()=>{fl.style.transition="";fl.style.opacity=0});
  if(typeof sfx==="function")try{sfx("pop")}catch(_){}
  c.toBlob(blob=>{if(!blob)return;let file=null;const name=`precision-design-${(g.title||"graphic").toLowerCase().replace(/[^a-z0-9]+/g,"-")}.jpg`;
    try{file=new File([blob],name,{type:"image/jpeg"})}catch(e){}
    const canShare=(()=>{try{return !!(file&&navigator.canShare&&navigator.canShare({files:[file]}))}catch(e){return false}})();
    const url=URL.createObjectURL(blob);
    const s=showSheet(`<div class="bigart"><img src="${url}" alt="Your photo"></div><div class="body">
      <div class="top"><span class="mono">Your photo</span><button class="x" aria-label="Close">${xIco}</button></div>
      <div><h3>Looking good</h3></div><p>Share it and tag <b>@precisiondesigngroup</b>, or save it to your device.</p>
      <div class="pds-btns">${canShare?`<button type="button" data-share>${shareIco}<span>Share photo</span></button>`:""}<button type="button" data-dl>${dlIco}<span>Save photo</span></button></div>
      <span class="mono note" data-m style="color:var(--muted)"></span></div>`,"camshot");
    const m=s.querySelector("[data-m]");
    const sh=s.querySelector("[data-share]");if(sh)sh.onclick=()=>navigator.share({files:[file]}).then(()=>{m.textContent="Shared!"}).catch(()=>{});
    s.querySelector("[data-dl]").onclick=()=>{const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();m.textContent="Saved."};
  },"image/jpeg",.9);
}
/* keys that the preview would handle do nothing while the camera is open; Escape closes the camera first */
addEventListener("keydown",e=>{if(!cam||document.querySelector(".scrim"))return;if(e.key==="Escape"){e.stopImmediatePropagation();e.preventDefault();close()}},true);
})();
