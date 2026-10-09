/* ---------- SHOP > See on Garment: try a graphic with the camera ----------
   A Camera button on the 3D preview swaps the card for a live camera viewfinder (back camera on phones) with the
   graphic laid over it. Drag to move it, pinch or use the sliders to size and rotate.
   Fabric: the graphic bends with the folds and takes on their light and shadow, worked out from the camera image
   itself every frame (WebGL; the Wrinkle slider sets how strong). Zoom: a 1× / 2× / 3× switch styled like the
   Portfolio / Shop switch; tap a stop or drag the thumb for anything in between. It uses the camera's own zoom where
   the browser offers it (most Android phones) and zooms into the picture everywhere else.
   The shutter saves or shares a photo. Nothing is uploaded; the video stays on the device. */
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
.cam-vf canvas.cam-gl{position:absolute;inset:0;width:100%;height:100%;display:block}
.cam-vf.gl video{opacity:0}
.cam-g{position:absolute;left:0;top:0;width:40%;max-width:none;transform-origin:50% 50%;user-select:none;-webkit-user-select:none;-webkit-user-drag:none;pointer-events:none;filter:drop-shadow(0 2px 6px rgba(0,0,0,.25))}
.cam-g.fabric{mix-blend-mode:hard-light;opacity:.92;filter:none}
.cam-vf.gl .cam-g{display:none}
.cam-top{position:absolute;left:0;right:0;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;padding:10px;pointer-events:none;background:linear-gradient(rgba(0,0,0,.45),transparent)}
.cam-top button{pointer-events:auto;width:38px;height:38px;border-radius:50%;border:0;display:grid;place-items:center;background:rgba(20,20,22,.6);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#fff;cursor:pointer}
.cam-top button svg{width:18px;height:18px}
.cam-top span{font-family:var(--f-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.85);text-align:center;padding:0 8px}
.cam-top span.on{color:#9EF25B}
.cam-msg{position:absolute;inset:0;z-index:2;display:grid;place-items:center;text-align:center;padding:28px;color:#f4f2ec;font-size:14px;line-height:1.5}
.cam-msg b{display:block;font-size:16px;margin-bottom:6px}
.cam-msg button{margin-top:14px;height:36px;padding:0 16px;border-radius:999px;border:1px solid rgba(255,255,255,.4);background:transparent;color:#fff;font:inherit;font-weight:600;cursor:pointer}
.cam-flash{position:absolute;inset:0;z-index:4;background:#fff;opacity:0;pointer-events:none;transition:opacity .35s}
.cam-tray{flex:none;display:flex;flex-direction:column;gap:9px;padding:12px 14px 14px;border-top:1px solid var(--line);background:var(--surface);color:var(--ink);touch-action:pan-x}
.cam-tray .gm-row{display:flex;gap:8px;align-items:center;overflow-x:auto;scrollbar-width:none;padding:3px;margin:-3px}
.cam-tray .gm-row::-webkit-scrollbar{display:none}
.cam-tray .gm-sl input:disabled{opacity:.35}
.cam-shot{display:flex;align-items:center;justify-content:space-between;gap:10px}
.cam-shot .gm-chip{min-width:88px}
.cam-zoom{flex:none;position:relative;display:flex;background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:2px;touch-action:none;-webkit-user-select:none;user-select:none;cursor:pointer}
.cam-zoom .zm-thumb{position:absolute;top:2px;bottom:2px;left:0;width:0;border-radius:999px;background:var(--ink);box-shadow:0 2px 10px -3px var(--shadow);transition:transform .45s cubic-bezier(.3,1.3,.5,1),width .45s cubic-bezier(.3,1.3,.5,1);will-change:transform;pointer-events:none;display:grid;place-items:center;overflow:hidden;color:var(--bg);font-style:normal;font-weight:600;font-size:12px;font-variant-numeric:tabular-nums;white-space:nowrap}
.cam-zoom button{position:relative;z-index:1;width:42px;padding:6px 0;text-align:center;border:0;border-radius:999px;background:transparent;color:var(--muted);font:inherit;font-weight:600;font-size:12px;font-variant-numeric:tabular-nums;cursor:pointer;transition:color .22s .06s}
.cam-zoom button.hid{color:transparent}
.cam-zoom.dragging{cursor:grabbing}
.cam-zoom.dragging .zm-thumb{transition:none}
.cam-zoom.dragging button{transition:none}
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

function addBtn(view){const stage=view.querySelector(".gm-stage");if(!stage||stage.querySelector(".gm-cam"))return;
  const b=document.createElement("button");b.type="button";b.className="gm-cam";b.setAttribute("aria-label","Try this graphic with your camera");b.innerHTML=camIco+"<span>Camera</span>";
  b.addEventListener("pointerdown",e=>e.stopPropagation());b.addEventListener("click",e=>{e.stopPropagation();open(view)});stage.appendChild(b)}
new MutationObserver(()=>{deck.querySelectorAll(".gm-view").forEach(addBtn);if(cam&&!cam.box.isConnected)close()}).observe(deck,{childList:true,subtree:true});
function graphicsOf(view){return [...view.querySelectorAll(".gm-tray [data-g]")].map(b=>{const m=/url\(["']?([^"')]+)["']?\)/.exec(b.style.backgroundImage||"");return{id:b.dataset.g,title:b.getAttribute("title")||"",url:m?m[1]:""}}).filter(g=>g.url)}
function activeId(view){try{const d=window.__gmDebug();if(d.layers[d.active])return d.layers[d.active][0]}catch(e){}const b=view.querySelector(".gm-tray [data-g][aria-pressed=true]");return b&&b.dataset.g}

/* ---------- WebGL: camera + graphic, with fold warping and shading from the camera's own light ---------- */
const VS="attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
const FS_DOWN="precision mediump float;varying vec2 v;uniform sampler2D t;uniform vec2 A,B;uniform float first;void main(){vec2 uv=first>.5?v*A+B:v;vec3 c=texture2D(t,uv).rgb;float l=first>.5?dot(c,vec3(.299,.587,.114)):c.r;gl_FragColor=vec4(l,l,l,1.);}";
const FS_MAIN=`precision mediump float;varying vec2 v;
uniform sampler2D vid,l1,l3,l5,gfx;uniform vec2 A,B,res,gc,gs,rot,d2;uniform float warp,shade,hasG;
void main(){
  vec3 cam=texture2D(vid,v*A+B).rgb;
  float hx=texture2D(l3,v+vec2(d2.x,0.)).r-texture2D(l3,v-vec2(d2.x,0.)).r;
  float hy=texture2D(l3,v+vec2(0.,d2.y)).r-texture2D(l3,v-vec2(0.,d2.y)).r;
  vec2 gr=vec2(hx,hy);gr=gr/max(1.,length(gr)*6.);
  vec2 p=v*res+gr*warp-gc;
  vec2 q=vec2(rot.x*p.x-rot.y*p.y,rot.y*p.x+rot.x*p.y);
  vec2 g=q/gs+.5;
  vec4 col=vec4(0.);
  if(hasG>.5&&g.x>0.&&g.x<1.&&g.y>0.&&g.y<1.)col=texture2D(gfx,g);
  float lf=texture2D(l1,v).r,ll=texture2D(l5,v).r,lc=dot(cam,vec3(.299,.587,.114));
  float sh=clamp(lf/max(ll,.05),.45,1.6);
  vec3 gcol=col.rgb*mix(1.,sh,shade)+(lc-lf)*.35*shade;
  gl_FragColor=vec4(mix(cam,clamp(gcol,0.,1.),col.a*(shade>0.?.96:1.)),1.);
}`;
function glInit(canvas){
  const gl=canvas.getContext("webgl",{premultipliedAlpha:false,preserveDrawingBuffer:true,antialias:false,alpha:false});if(!gl)return null;
  const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
  const prog=fs=>{const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,VS));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.bindAttribLocation(p,0,"p");gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error("link");const u={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);u[a.name]=gl.getUniformLocation(p,a.name)}return{p,u}};
  const tex=()=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]].forEach(([k,v])=>gl.texParameteri(gl.TEXTURE_2D,k,v));return t};
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  const G={gl,down:prog(FS_DOWN),main:prog(FS_MAIN),vid:tex(),gfx:tex(),levels:[],hasG:false,tex};
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  return G;
}
function glLevels(G,W,H){const gl=G.gl;G.levels.forEach(l=>{gl.deleteTexture(l.t);gl.deleteFramebuffer(l.f)});G.levels=[];
  for(let w=256;w>=8;w/=2){const h=Math.max(4,Math.round(w*H/W)),t=G.tex();gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);G.levels.push({t,f,w,h})}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null)}
function glFrame(G,video,AB,P,warp,shade){
  const gl=G.gl,c=gl.canvas,[A,B]=AB;
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,G.vid);
  try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,video)}catch(e){return false}
  /* luminance pyramid in screen space (256 -> 8 wide), for fold slopes and local light */
  gl.useProgram(G.down.p);gl.uniform1i(G.down.u.t,0);
  G.levels.forEach((l,i)=>{gl.bindFramebuffer(gl.FRAMEBUFFER,l.f);gl.viewport(0,0,l.w,l.h);
    gl.bindTexture(gl.TEXTURE_2D,i===0?G.vid:G.levels[i-1].t);gl.uniform1f(G.down.u.first,i===0?1:0);gl.uniform2f(G.down.u.A,A[0],A[1]);gl.uniform2f(G.down.u.B,B[0],B[1]);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)});
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,c.width,c.height);
  const M=G.main,u=M.u;gl.useProgram(M.p);
  const bind=(unit,t,name)=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.uniform1i(u[name],unit)};
  bind(0,G.vid,"vid");bind(1,G.levels[0].t,"l1");bind(2,G.levels[3].t,"l3");bind(3,G.levels[Math.min(4,G.levels.length-1)].t,"l5");bind(4,G.gfx,"gfx");
  const k=c.width/P.W;
  gl.uniform2f(u.A,A[0],A[1]);gl.uniform2f(u.B,B[0],B[1]);gl.uniform2f(u.res,c.width,c.height);
  gl.uniform2f(u.gc,P.cx*k,c.height-P.cy*k);gl.uniform2f(u.gs,P.w*k,P.h*k);
  const r=P.r*Math.PI/180;gl.uniform2f(u.rot,Math.cos(r),Math.sin(r));
  gl.uniform2f(u.d2,1./G.levels[3].w,1./G.levels[3].h);gl.uniform1f(u.warp,warp*k);gl.uniform1f(u.shade,shade);gl.uniform1f(u.hasG,G.hasG?1:0);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return true}

let cam=null;
async function start(facing){
  if(!cam)return;stop(true);const c=cam;c.facing=facing;msg("");
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){msg(`<b>Camera isn't available here</b>Open precisiondesign.club in Safari or Chrome to use it.`,false);return}
  msg("Starting the camera…");
  try{
    const s=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:facing},width:{ideal:1280},height:{ideal:720}}});
    if(cam!==c){s.getTracks().forEach(t=>t.stop());return}
    c.stream=s;c.video.srcObject=s;c.video.classList.toggle("mirror",facing==="user");
    try{const tr=s.getVideoTracks()[0],cap=tr&&tr.getCapabilities?tr.getCapabilities():{};c.zcap=cap.zoom&&cap.zoom.max>1?{min:Math.max(1,cap.zoom.min||1),max:cap.zoom.max}:null}catch(e){c.zcap=null}
    c.zhw=null;if(c.applyZoom)c.applyZoom();
    await c.video.play().catch(()=>{});msg("");c.shutter.disabled=false;c.loop();
  }catch(e){const n=e&&e.name;
    msg(n==="NotAllowedError"||n==="SecurityError"?`<b>Camera access is off</b>Allow camera access for this site in your browser settings, then try again.`
      :n==="NotFoundError"||n==="OverconstrainedError"?`<b>No camera found</b>This device doesn't seem to have a camera we can use.`
      :`<b>Couldn't start the camera</b>If you're in an app's built-in browser, open the site in Safari or Chrome.`,true)}
}
function stop(){if(cam&&cam.stream){cam.stream.getTracks().forEach(t=>t.stop());cam.stream=null;if(cam.video)cam.video.srcObject=null}if(cam&&cam.shutter)cam.shutter.disabled=true}
function msg(html,retry){const m=cam&&cam.box.querySelector(".cam-msg");if(!m)return;m.style.display=html?"grid":"none";m.innerHTML=html?`<div>${html}${retry?'<br><button type="button" data-retry>Try again</button>':""}</div>`:"";
  const r=m.querySelector("[data-retry]");if(r)r.onclick=()=>start(cam.facing)}
function close(){stop();if(cam){cam.dead=true;if(cam.box.isConnected)cam.box.remove()}cam=null;document.documentElement.classList.remove("cam-on")}
document.addEventListener("visibilitychange",()=>{if(!cam)return;if(document.hidden)stop();else if(!cam.stream)start(cam.facing)});

function open(view){
  if(cam)close();
  const gs=graphicsOf(view);if(!gs.length)return;let g=gs.find(x=>x.id===activeId(view))||gs[0];
  const box=document.createElement("div");box.className="cam-view";
  box.innerHTML=`<div class="cam-vf"><video playsinline muted autoplay></video><canvas class="cam-gl"></canvas><img class="cam-g" alt="" draggable="false" crossorigin="anonymous">
    <div class="cam-top"><button type="button" data-close aria-label="Close camera">${xIco}</button><span data-hint>${coarse?"Drag to move · pinch to size":"Drag to move"}</span><button type="button" data-flip aria-label="Switch camera">${flipIco}</button></div>
    <div class="cam-msg"></div><i class="cam-flash"></i></div>
    <div class="cam-tray">
      <div class="gm-row"><span class="gm-lbl">Graphic</span>${gs.map(x=>`<button class="gm-thumb" data-cg="${x.id}" title="${esc(x.title)}" aria-label="${esc(x.title)}" style="background-image:url('${x.url}')"></button>`).join("")}</div>
      <div class="gm-row"><label class="gm-sl"><span>Size</span><input type="range" min="10" max="100" step="1" value="42" data-size></label><label class="gm-sl"><span>Rotate</span><input type="range" min="-180" max="180" step="1" value="0" data-rot></label></div>
      <div class="gm-row"><label class="gm-sl"><span>Wrinkle</span><input type="range" min="0" max="100" step="1" value="55" data-wr disabled></label></div>
      <div class="cam-shot"><button class="gm-chip" type="button" data-blend aria-pressed="false">Fabric</button><button class="cam-shutter" type="button" aria-label="Take a photo" disabled></button><div class="cam-zoom" role="group" aria-label="Zoom"><i class="zm-thumb" aria-hidden="true"></i><button type="button" data-z="1" aria-label="Zoom 1×">1×</button><button type="button" data-z="2" aria-label="Zoom 2×">2×</button><button type="button" data-z="3" aria-label="Zoom 3×">3×</button></div></div>
    </div>`;
  view.appendChild(box);document.documentElement.classList.add("cam-on");
  ["pointerdown","pointermove","pointerup","click","touchstart","touchmove","wheel","dblclick","keydown"].forEach(t=>box.addEventListener(t,e=>e.stopPropagation()));
  const vf=box.querySelector(".cam-vf"),img=box.querySelector(".cam-g"),cv=box.querySelector("canvas.cam-gl"),size=box.querySelector("[data-size]"),rot=box.querySelector("[data-rot]"),wr=box.querySelector("[data-wr]"),hint=box.querySelector("[data-hint]");
  const S=cam={box,view,video:box.querySelector("video"),shutter:box.querySelector(".cam-shutter"),stream:null,facing:"environment",
    x:.5,y:.45,w:.42,r:0,blend:false,wr:.55,z:1,dz:1,zcap:null,zhw:null,G:null,dead:false};
  /* WebGL if we can; otherwise the plain overlay */
  try{S.G=glInit(cv)}catch(e){S.G=null}
  if(S.G)vf.classList.add("gl");
  const dims=()=>({W:vf.clientWidth,H:vf.clientHeight});
  const ratio=()=>img.naturalWidth?img.naturalHeight/img.naturalWidth:1;
  /* where the graphic goes this frame, in viewfinder pixels */
  function place(){const {W,H}=dims(),w=S.w*W;return{W,H,cx:S.x*W,cy:S.y*H,w,h:w*ratio(),r:S.r}}
  function css(){const P=place();img.style.width=P.w+"px";img.style.transform=`translate(${P.cx-P.w/2}px,${P.cy-P.h/2}px) rotate(${P.r}deg)`}
  function sync(){size.value=Math.round(S.w*100);rot.value=Math.round(S.r)}
  function resize(){const {W,H}=dims();if(!W||!H)return;const d=Math.min(2,devicePixelRatio||1);cv.width=Math.round(W*d);cv.height=Math.round(H*d);if(S.G)glLevels(S.G,W,H);css()}
  /* screen <-> video mapping for object-fit:cover (+ mirror for the front camera) */
  function cover(){const {W,H}=dims(),vw=S.video.videoWidth||W,vh=S.video.videoHeight||H,s=Math.max(W/vw,H/vh),fx=W/(vw*s)/S.dz,fy=H/(vh*s)/S.dz,m=S.facing==="user";
    return{AB:[[m?-fx:fx,fy],[m?.5+.5*fx:.5-.5*fx,.5-.5*fy]]}}
  const pick=x=>{g=x;img.onload=()=>{css();if(S.G){const gl=S.G.gl;gl.bindTexture(gl.TEXTURE_2D,S.G.gfx);try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);S.G.hasG=true}catch(e){S.G.hasG=false}}};img.src=x.url;
    box.querySelectorAll("[data-cg]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.cg===x.id)))};
  pick(g);
  box.querySelectorAll("[data-cg]").forEach(b=>b.onclick=()=>pick(gs.find(x=>x.id===b.dataset.cg)));
  size.oninput=()=>{S.w=size.value/100;css()};rot.oninput=()=>{S.r=+rot.value;css()};
  wr.oninput=()=>{S.wr=wr.value/100};
  box.querySelector("[data-blend]").onclick=e=>{S.blend=!S.blend;img.classList.toggle("fabric",S.blend);wr.disabled=!S.blend||!S.G;e.currentTarget.setAttribute("aria-pressed",String(S.blend))};
  /* zoom switch: tap 1× / 2× / 3×, or drag the thumb for anything between (camera zoom where offered, else digital) */
  const zw=box.querySelector(".cam-zoom"),zth=zw.querySelector(".zm-thumb"),zbs=[...zw.querySelectorAll("[data-z]")],stops=zbs.map(b=>+b.dataset.z);
  const ZMIN=stops[0],ZMAX=stops[stops.length-1],zfmt=z=>(Math.round(z*10)/10).toString().replace(/\.0$/,"")+"×";
  let zBusy=false,zWant=null,hintT=0;
  const hwApply=v=>{const tr=S.stream&&S.stream.getVideoTracks()[0];if(!tr||!tr.applyConstraints)return;if(zBusy){zWant=v;return}zBusy=true;
    tr.applyConstraints({advanced:[{zoom:v}]}).then(()=>{S.zhw=v},()=>{S.zcap=null;S.zhw=null;S.applyZoom()}).finally(()=>{zBusy=false;if(zWant!==null&&S.zcap){const w=zWant;zWant=null;hwApply(w)}})};
  S.applyZoom=()=>{const hw=S.zcap?Math.min(S.zcap.max,Math.max(S.zcap.min,S.z)):1;if(S.zcap&&hw!==S.zhw)hwApply(hw);
    S.dz=S.z/hw;S.video.style.transform=(S.facing==="user"?"scaleX(-1) ":"")+(S.dz>1.001?`scale(${S.dz})`:"");css()};
  const zPos=z=>{let i=0;while(i<stops.length-2&&z>stops[i+1])i++;const t=Math.min(1,Math.max(0,(z-stops[i])/(stops[i+1]-stops[i]))),a=zbs[i],b=zbs[i+1];
    return[a.offsetLeft+(b.offsetLeft-a.offsetLeft)*t,a.offsetWidth+(b.offsetWidth-a.offsetWidth)*t]};
  const zDraw=instant=>{const [x,w]=zPos(S.z);if(instant)zth.style.transition="none";zth.style.width=w+"px";zth.style.transform=`translateX(${x}px)`;if(instant){void zth.offsetWidth;zth.style.transition=""}
    zth.textContent=zfmt(S.z);
    zbs.forEach((b,i)=>{const c=b.offsetLeft+b.offsetWidth/2;b.classList.toggle("hid",c>x-2&&c<x+w+2);b.setAttribute("aria-pressed",String(Math.abs(stops[i]-S.z)<.05))})};
  const setZoom=(z,instant)=>{S.z=Math.min(ZMAX,Math.max(ZMIN,z));S.applyZoom();zDraw(instant);
    hint.textContent="Zoom "+zfmt(S.z);clearTimeout(hintT);hintT=setTimeout(()=>{hint.textContent=coarse?"Drag to move · pinch to size":"Drag to move"},1200)};
  const zAt=clientX=>{const r=zw.getBoundingClientRect(),x=clientX-r.left,c=zbs.map(b=>b.offsetLeft+b.offsetWidth/2);
    if(x<=c[0])return ZMIN;for(let i=0;i<c.length-1;i++)if(x<=c[i+1])return stops[i]+(x-c[i])/(c[i+1]-c[i])*(stops[i+1]-stops[i]);return ZMAX};
  let zd=null;
  zw.addEventListener("pointerdown",e=>{if(e.button)return;zd={x:e.clientX,id:e.pointerId,moved:false,b:e.target.closest("[data-z]")};try{zw.setPointerCapture(e.pointerId)}catch(_){}});
  zw.addEventListener("pointermove",e=>{if(!zd||e.pointerId!==zd.id)return;if(!zd.moved){if(Math.abs(e.clientX-zd.x)<4)return;zd.moved=true;zw.classList.add("dragging")}setZoom(zAt(e.clientX),true)});
  const zEnd=e=>{if(!zd||e.pointerId!==zd.id)return;const d=zd;zd=null;zw.classList.remove("dragging");
    if(!d.moved&&d.b){setZoom(+d.b.dataset.z);if(typeof sfx==="function")try{sfx("tick")}catch(_){}}
    else if(d.moved){let n=S.z;stops.forEach(v=>{if(Math.abs(v-S.z)<.12)n=v});if(n!==S.z)setZoom(n)}};
  zw.addEventListener("pointerup",zEnd);zw.addEventListener("pointercancel",zEnd);
  zw.addEventListener("click",e=>e.preventDefault());
  zw.addEventListener("keydown",e=>{if(e.key==="ArrowRight"||e.key==="ArrowUp"){e.preventDefault();setZoom(S.z+.1,true)}else if(e.key==="ArrowLeft"||e.key==="ArrowDown"){e.preventDefault();setZoom(S.z-.1,true)}});
  zbs.forEach(b=>b.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setZoom(+b.dataset.z)}}));
  new ResizeObserver(()=>zDraw(true)).observe(zw);zDraw(true);
  box.querySelector("[data-close]").onclick=close;
  box.querySelector("[data-flip]").onclick=()=>start(S.facing==="environment"?"user":"environment");
  vf.addEventListener("dblclick",()=>{S.x=.5;S.y=.45;S.r=0;sync();css()});
  /* drag to move; two fingers pinch/twist to size and rotate */
  const pts=new Map();let g0=null;
  vf.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;vf.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});g0=snap()});
  vf.addEventListener("pointermove",e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});const {W,H}=dims(),P=[...pts.values()];
    if(P.length===1){const dx=P[0].x-g0.p[0].x,dy=P[0].y-g0.p[0].y;S.x=Math.min(1,Math.max(0,g0.x+dx/W));S.y=Math.min(1,Math.max(0,g0.y+dy/H))}
    else if(P.length>=2&&g0.p.length>=2){const d0=Math.hypot(g0.p[1].x-g0.p[0].x,g0.p[1].y-g0.p[0].y),d1=Math.hypot(P[1].x-P[0].x,P[1].y-P[0].y);
      const a0=Math.atan2(g0.p[1].y-g0.p[0].y,g0.p[1].x-g0.p[0].x),a1=Math.atan2(P[1].y-P[0].y,P[1].x-P[0].x),f=d1/Math.max(20,d0);
      S.w=Math.min(1,Math.max(.1,g0.w*f));S.r=((g0.r+(a1-a0)*180/Math.PI+540)%360)-180}
    sync();css()});
  const up=e=>{pts.delete(e.pointerId);g0=snap()};vf.addEventListener("pointerup",up);vf.addEventListener("pointercancel",up);
  vf.addEventListener("wheel",e=>{e.preventDefault();const f=1-e.deltaY*.001;S.w=Math.min(1,Math.max(.1,S.w*f));sync();css()},{passive:false});
  function snap(){return{x:S.x,y:S.y,w:S.w,r:S.r,p:[...pts.values()].map(p=>({...p}))}}
  new ResizeObserver(resize).observe(vf);
  /* per frame: draw */
  S.loop=()=>{if(S.looping)return;S.looping=true;const tick=now=>{if(S.dead||!S.stream){S.looping=false;return}
      const v=S.video;
      const P=place();
      if(S.G&&v.readyState>=2){const C=cover();const on=S.blend?S.wr:0;if(!glFrame(S.G,v,C.AB,P,on*50,on*.9)){S.G=null;vf.classList.remove("gl")}}
      else css();
      requestAnimationFrame(tick)};requestAnimationFrame(tick)};
  cam.shutter.onclick=()=>shoot(g);
  resize();start("environment");
}

/* the photo, exactly as framed (the WebGL frame, or video + overlay) */
function shoot(g){
  const S=cam;if(!S||!S.stream)return;const v=S.video,vf=S.box.querySelector(".cam-vf"),img=S.box.querySelector(".cam-g");
  const W=vf.clientWidth,H=vf.clientHeight,vw=v.videoWidth,vh=v.videoHeight;if(!vw||!vh)return;
  let c,k;
  if(S.G){const src=S.G.gl.canvas;c=document.createElement("canvas");c.width=src.width;c.height=src.height;c.getContext("2d").drawImage(src,0,0);k=c.width/W}
  else{k=Math.min(3,Math.max(1.5,Math.max(vw/W,vh/H)));c=document.createElement("canvas");c.width=Math.round(W*k);c.height=Math.round(H*k);const x=c.getContext("2d");
    const s=Math.max(W/vw,H/vh)*(S.dz||1),dw=vw*s*k,dh=vh*s*k;x.save();if(S.facing==="user"){x.translate(c.width,0);x.scale(-1,1)}x.drawImage(v,(c.width-dw)/2,(c.height-dh)/2,dw,dh);x.restore();
    const m=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)\s*rotate\(([-\d.]+)deg\)/.exec(img.style.transform||""),gw=parseFloat(img.style.width)||W*.4,gh=img.naturalWidth?gw*img.naturalHeight/img.naturalWidth:gw;
    if(m){x.save();x.translate((+m[1]+gw/2)*k,(+m[2]+gh/2)*k);x.rotate(+m[3]*Math.PI/180);if(S.blend){x.globalCompositeOperation="hard-light";x.globalAlpha=.92}try{x.drawImage(img,-gw/2*k,-gh/2*k,gw*k,gh*k)}catch(e){}x.restore()}}
  const x=c.getContext("2d"),fs=Math.round(13*k);x.font=`600 ${fs}px ${getComputedStyle(document.documentElement).getPropertyValue("--f-mono")||"monospace"}`;x.textAlign="right";
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
addEventListener("keydown",e=>{if(!cam||document.querySelector(".scrim"))return;if(e.key==="Escape"){e.stopImmediatePropagation();e.preventDefault();close()}},true);
})();
