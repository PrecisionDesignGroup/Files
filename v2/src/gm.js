/* ---------- SHOP: 3D garment try-on, built into the Shop viewer (test preview copy of the live site's try-on) ----------
   Same garment models, fabric normal maps, decal placement and garment/colour/placement controls as precisiondesign.club.
   On a premade graphic, the "Art / On garment" switch swaps the flat art for the 3D garment in the same spot on the page;
   the dial keeps cycling items and the garment picks up each graphic. Models are stored uncompressed next to the page (gm/). */
(function(){
const THREE_URL="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js";
const ASSETS="gm/";
const IDS=["g1","g2","g3","g4","g5","g6","g7","g8","g9","g10","x1"];
const pngURL=id=>IDS.includes(id)?ASSETS+"art-"+id+".png":null;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const screenEl=document.querySelector(".screen"),headWrap=document.getElementById("headWrap"),szRow=document.querySelector(".sz-row");
if(!screenEl||!headWrap||!szRow||typeof SHOPV==="undefined")return;

const css=document.createElement("style");css.textContent=`
.gm-sw{display:none;position:relative;padding:3px;border-radius:999px;border:1px solid var(--line);background:var(--chip);gap:0}
.gm-sw.show{display:inline-flex}
.gm-sw button{position:relative;z-index:1;height:28px;padding:0 12px;border:0;border-radius:999px;background:none;color:var(--chip-ink);font:inherit;font-size:11.5px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:5px;transition:color .25s}
.gm-sw button svg{width:13px;height:13px}
.gm-sw i{position:absolute;z-index:0;top:3px;bottom:3px;left:3px;border-radius:999px;background:var(--chip-ink);transition:transform .45s var(--ease-spring),width .45s var(--ease-spring)}
.gm-sw button[aria-pressed="true"]{color:var(--chip)}
.proj-foot{flex-wrap:wrap}
.gm-inline{position:absolute;inset:0;z-index:2;touch-action:none;cursor:grab;-webkit-user-select:none;user-select:none;animation:gmIn .4s var(--ease-out)}
@keyframes gmIn{from{opacity:0}}
.gm-inline canvas{position:absolute;inset:0;width:100%!important;height:100%!important;display:block}
.gm-inline .gm-msg{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:24px;font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft);pointer-events:none}
.gm-inline .gm-hint{position:absolute;z-index:2;left:0;right:0;bottom:2px;text-align:center;font-family:var(--font-mono);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft);pointer-events:none}
.screen.gm3d .art-layer{background:var(--bg)!important}
.screen.gm3d .art-layer img{opacity:0!important}
.screen.gm3d .sz-row{display:none}
.gm-tray{--f-mono:var(--font-mono);display:flex;flex-direction:column;gap:8px;margin-bottom:14px;max-width:520px;cursor:default;touch-action:pan-x;animation:gmIn .4s var(--ease-out)}
.gm-row{display:flex;gap:7px;align-items:center;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:2px;margin:-2px}
.gm-row::-webkit-scrollbar{display:none}
.gm-lbl{flex:none;font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft);width:52px}
.gm-chip{flex:none;height:30px;padding:0 11px;border-radius:999px;border:1px solid var(--line);background:var(--surface);font:inherit;font-size:11.5px;font-weight:600;color:var(--ink);cursor:pointer;white-space:nowrap}
.gm-chip[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.gm-chip.gm-rm{display:none}
.gm-dot{flex:none;width:20px;height:20px;border-radius:50%;border:1px solid var(--line);padding:0;cursor:pointer}
.gm-dot[aria-pressed="true"]{box-shadow:0 0 0 2px var(--bg),0 0 0 3.5px var(--ink)}
.gm-sl{display:flex;align-items:center;gap:8px;flex:1;min-width:110px}
.gm-sl span{font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft)}
.gm-sl input{flex:1;min-width:50px;accent-color:var(--ink)}
@media (max-width:720px){.gm-tray{gap:7px;margin-bottom:10px}.gm-lbl{width:44px;font-size:9px}.gm-chip{height:28px;padding:0 10px;font-size:11px}}

/* uniform controls: same dark capsule, cream thumb and mono labels as the size slider and grid button */
.gm-sw{--cap:#1B1C1F;--capline:#44464C;--cream:#F3EFE6;height:32px;padding:3px;background:var(--cap)!important;border:1px solid var(--capline)!important;align-items:center}
.gm-sw button{height:24px!important;padding:0 11px!important;font-size:11px!important;color:rgba(243,239,230,.62)!important}
.gm-sw button[aria-pressed="true"]{color:#1B1C1F!important}
.gm-sw i{top:3px!important;bottom:3px!important;background:#F3EFE6!important;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.gm-tray{gap:8px}
.gm-row{gap:10px}
.gm-lbl,.gm-sl span{font-family:var(--font-mono)!important;font-size:10px!important;letter-spacing:.12em!important;text-transform:uppercase;color:var(--ink-soft)!important;width:52px}
.gm-lbl2{width:auto;margin-left:6px}
.gm-seg{flex:none;display:inline-flex;align-items:center;gap:2px;height:32px;padding:3px;border-radius:999px;background:#1B1C1F;border:1px solid #44464C}
.gm-seg .gm-chip{height:24px!important;padding:0 11px!important;border:0!important;border-radius:999px;background:none!important;color:rgba(243,239,230,.62)!important;font-size:11px!important;font-weight:600;transition:background .3s var(--ease-spring),color .25s}
.gm-seg .gm-chip:hover{color:#F3EFE6!important}
.gm-seg .gm-chip[aria-pressed="true"]{background:#F3EFE6!important;color:#1B1C1F!important;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.gm-seg .gm-chip.gm-rm{color:#f0a7a0!important}
.gm-dots{gap:6px;padding:0 8px}
.gm-dots .gm-dot{width:16px;height:16px;border:1px solid rgba(255,255,255,.22)}
.gm-dots .gm-dot[aria-pressed="true"]{box-shadow:0 0 0 2px #1B1C1F,0 0 0 3.5px #F3EFE6}
.gm-sl{flex:0 1 148px;min-width:96px;height:32px;padding:0 9px;border-radius:999px;background:#1B1C1F;border:1px solid #44464C;display:flex;align-items:center}
.gm-sl input{-webkit-appearance:none;appearance:none;width:100%;height:16px;margin:0;background:transparent;cursor:pointer}
.gm-sl input::-webkit-slider-runnable-track{height:2px;border-radius:2px;background:rgba(243,239,230,.28)}
.gm-sl input::-moz-range-track{height:2px;border-radius:2px;background:rgba(243,239,230,.28)}
.gm-sl input::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;margin-top:-7px;border-radius:50%;background:#F3EFE6;border:0;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.gm-sl input::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#F3EFE6;border:0;box-shadow:0 2px 8px rgba(0,0,0,.35)}
@media (max-width:720px){.gm-lbl,.gm-sl span{width:44px;font-size:9px!important}.gm-lbl2{width:auto;margin-left:2px}.gm-seg,.gm-sl,.gm-sw{height:30px}.gm-seg .gm-chip,.gm-sw button{height:22px!important;padding:0 9px!important;font-size:10.5px!important}.gm-sl{flex:1 1 0;min-width:56px;padding:0 7px}.gm-lbl2{margin-left:0}
  .gm-tray{gap:6px;max-width:none}.gm-row{gap:6px;overflow:hidden}
  .gm-lbl,.gm-sl span{width:38px;font-size:8.5px!important;letter-spacing:.1em!important}
  .gm-lbl2{width:auto}
  .gm-seg,.gm-sl,.gm-sw{height:28px}
  .gm-seg{flex:1 1 0;min-width:0;padding:2px}
  .gm-seg .gm-chip,.gm-sw button{height:22px!important;font-size:10px!important}
  .gm-seg .gm-chip{flex:1 1 0;min-width:0;padding:0 4px!important;overflow:hidden;text-overflow:ellipsis}
  .gm-seg .gm-chip[data-garment="zip"],.gm-seg .gm-chip[data-garment="polo"]{display:none}
  .gm-long{display:none}
  .gm-dots{justify-content:space-between;padding:0 7px}
  .gm-dots .gm-dot{width:14px;height:14px}
  .gm-sl{flex:1 1 0;min-width:0;padding:0 6px}
  .gm-sl input::-webkit-slider-thumb{width:14px;height:14px;margin-top:-6px}
}
`;document.head.appendChild(css);

const teeIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M8 3 3 6l2 5 3-1v11h8V10l3 1 2-5-5-3c-.5 1.6-2 2.5-4 2.5S8.5 4.6 8 3z"/></svg>';
const foot=document.querySelector(".proj-foot");
const sw=document.createElement("div");sw.className="gm-sw";sw.setAttribute("role","group");sw.setAttribute("aria-label","Show the art or a 3D garment");
sw.innerHTML='<i aria-hidden="true"></i><button type="button" data-v="art" aria-pressed="true">Art</button><button type="button" data-v="3d" aria-pressed="false">'+teeIcon+'On garment</button>';
if(foot)foot.insertBefore(sw,foot.querySelector("small"));
const swThumb=sw.querySelector("i"),swBtns=[...sw.querySelectorAll("button")];
function paintSw(){const b=swBtns[want?1:0];swBtns.forEach(x=>x.setAttribute("aria-pressed",String(x===b)));if(!b.offsetWidth)return;swThumb.style.width=b.offsetWidth+"px";swThumb.style.transform=`translateX(${b.offsetLeft-3}px)`}
let on=false,want=false,curId=null,savedDark=false;
function curItem(){if(!screenEl.classList.contains("sec-shop"))return null;const t=document.getElementById("pjTitle");
  const it=SHOPV.find(p=>p.t===(t&&t.textContent));return it&&/^g\d+$/.test(it.id)?{id:it.id,title:it.t}:null}

/* ---------- graphics: transparent PNGs from the repo; background removed automatically for any without one ---------- */
const art={};
function loadImg(src){return new Promise(res=>{const im=new Image();im.crossOrigin="anonymous";im.onload=()=>res(im);im.onerror=()=>res(null);im.src=src})}
function cutout(im){
  const M=1024,k=Math.min(1,M/Math.max(im.naturalWidth,im.naturalHeight)),w=Math.round(im.naturalWidth*k),h=Math.round(im.naturalHeight*k);
  const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0,w,h);
  const d=x.getImageData(0,0,w,h),a=d.data,R=[],G=[],B=[];const pick=(i,j)=>{const o=(j*w+i)*4;R.push(a[o]);G.push(a[o+1]);B.push(a[o+2])};
  for(let i=0;i<w;i+=3){pick(i,2);pick(i,h-3)}for(let j=0;j<h;j+=3){pick(2,j);pick(w-3,j)}
  const med=v=>v.sort((m,n)=>m-n)[v.length>>1],br=med(R),bg=med(G),bb=med(B),T1=40,T2=78;let x0=w,y0=h,x1=0,y1=0;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const o=(j*w+i)*4,dr=a[o]-br,dg=a[o+1]-bg,db=a[o+2]-bb,dist=Math.sqrt(dr*dr+dg*dg+db*db);
    const al=dist<=T1?0:dist>=T2?1:(dist-T1)/(T2-T1);a[o+3]=Math.round(a[o+3]*al);if(al>.5){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j}}
  x.putImageData(d,0,0);if(x1<=x0||y1<=y0)return c;
  const cw=x1-x0+1,ch=y1-y0+1,o=document.createElement("canvas");o.width=cw;o.height=ch;o.getContext("2d").drawImage(c,x0,y0,cw,ch,0,0,cw,ch);return o;
}
/* crop the empty transparent margin so the print size and position match the artwork itself */
function trim(im){
  const k=Math.min(1,2048/Math.max(im.naturalWidth,im.naturalHeight)),w=Math.round(im.naturalWidth*k),h=Math.round(im.naturalHeight*k);
  const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0,w,h);
  const a=x.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(a[(j*w+i)*4+3]>8){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j}
  if(x1<0)return c;x0=Math.max(0,x0-2);y0=Math.max(0,y0-2);x1=Math.min(w-1,x1+2);y1=Math.min(h-1,y1+2);
  const cw=x1-x0+1,ch=y1-y0+1,o=document.createElement("canvas");o.width=cw;o.height=ch;o.getContext("2d").drawImage(c,x0,y0,cw,ch,0,0,cw,ch);return o;
}
function graphicOf(p){
  if(art[p.id])return art[p.id];
  return art[p.id]=(async()=>{
    const u=pngURL(p.id);
    if(u){const im=await loadImg(u);if(im){try{const c=trim(im);return{img:c,url:u,w:c.width,h:c.height}}catch(e){return{img:im,url:u,w:im.naturalWidth,h:im.naturalHeight}}}}
    if(!p.image)return null;const im=await loadImg(p.image);if(!im)return null;
    try{const c=cutout(im);return{img:c,url:c.toDataURL(),w:c.width,h:c.height}}catch(e){return{img:im,url:p.image,w:im.naturalWidth,h:im.naturalHeight}}
  })();
}

/* ---------- garments (h = display height, default 2.4; placement: fx = across, -.5..5 of the width, + is the wearer's left; fy = up from the hem, 0..1; w = width of the graphic) ---------- */
const G={
  tee:{name:"Tee",file:"tee.glb",normal:"tee-normal",presets:[["Front",{side:"f",fx:0,fy:.6,w:.3,r:0}],["Chest",{side:"f",fx:.1,fy:.74,w:.11,r:0}],["Back",{side:"b",fx:0,fy:.62,w:.36,r:0}],["Sleeve",{side:"f",fx:.33,fy:.72,w:.08,r:0}]]},
  hoodie:{name:"Hoodie",file:"hoodie.glb",normal:"hoodie-normal",presets:[["Front",{side:"f",fx:0,fy:.58,w:.28,r:0}],["Chest",{side:"f",fx:.1,fy:.68,w:.1,r:0}],["Back",{side:"b",fx:0,fy:.56,w:.36,r:0}],["Sleeve",{side:"f",fx:.36,fy:.42,w:.09,r:0}]]},
  zip:{name:"Zip hoodie",file:"zip-hoodie.glb",presets:[["Left chest",{side:"f",fx:.11,fy:.68,w:.11,r:0}],["Right chest",{side:"f",fx:-.11,fy:.68,w:.11,r:0}],["Back",{side:"b",fx:0,fy:.56,w:.36,r:0}],["Sleeve",{side:"f",fx:.37,fy:.42,w:.09,r:0}]]},
  crew:{name:"Crewneck",file:"crewneck.glb",normal:"crewneck-normal",presets:[["Front",{side:"f",fx:0,fy:.6,w:.28,r:0}],["Chest",{side:"f",fx:.1,fy:.68,w:.1,r:0}],["Back",{side:"b",fx:0,fy:.6,w:.36,r:0}],["Sleeve",{side:"f",fx:.37,fy:.42,w:.09,r:0}]]},
  polo:{name:"Polo",file:"polo.glb",presets:[["Chest",{side:"f",fx:.13,fy:.72,w:.11,r:0}],["Front",{side:"f",fx:0,fy:.55,w:.28,r:0}],["Back",{side:"b",fx:0,fy:.62,w:.36,r:0}],["Sleeve",{side:"f",fx:.34,fy:.74,w:.08,r:0}]]},
  hat:{name:"Hat",file:"hat.glb",normal:"hat-normal",h:1.7,presets:[["Front",{side:"f",fx:0,fy:.6,w:.3,r:0}],["Small front",{side:"f",fx:0,fy:.6,w:.18,r:0}],["Back",{side:"b",fx:0,fy:.55,w:.2,r:0}]]}
};
const COLORS=[["Black","#1c1c1e"],["White","#f4f3ef"],["Heather","#a9a9a7"],["Cream","#e9dfc9"],["Navy","#26304a"],["Forest","#2f4a3a"],["Brown","#5a4334"]];
/* every graphic on the garment is a layer {g, preset, w, r, p, n, tex, mat, mesh}; one is active (the sliders, Place and drags act on it) */
const st={garment:"tee",color:"#1c1c1e",layers:[],active:-1},MAXL=6,AL=()=>st.layers[st.active]||null;

/* ---------- three.js ---------- */
let T=null,R=null,scene,cam,group,view,stage,tray,raf=0,loadP=null,rotY=0,rotX=-.04,velY=0,zoom=7.6,dirty=true,gar=null;
const garCache={};
function loadThree(){return loadP||(loadP=import(THREE_URL).then(m=>{T=m;return m}))}
function hint(t){const h=stage&&stage.querySelector(".gm-hint");if(h)h.textContent=t}
const HINT="Drag to turn \u00b7 drag the graphic to move it";
/* minimal reader for these single-mesh GLB files (meshopt-compressed, quantized); the fabric normal map is a separate JPEG */
async function loadGarment(key){
  if(garCache[key])return garCache[key];
  return garCache[key]=(async()=>{
    
    const ab=await (await fetch(ASSETS+G[key].file.replace(".glb","-glb.wasm"))).arrayBuffer(),dv=new DataView(ab),jl=dv.getUint32(12,true);
    const j=JSON.parse(new TextDecoder().decode(new Uint8Array(ab,20,jl))),bin=new Uint8Array(ab,28+jl,dv.getUint32(20+jl,true));
    const views=j.bufferViews.map(bv=>{const x=bv.extensions&&bv.extensions.EXT_meshopt_compression;
      if(!x)return new Uint8Array(bin.buffer,bin.byteOffset+(bv.byteOffset||0),bv.byteLength);
      const out=new Uint8Array(x.count*x.byteStride);MD.decodeGltfBuffer(out,x.count,x.byteStride,new Uint8Array(bin.buffer,bin.byteOffset+(x.byteOffset||0),x.byteLength),x.mode,x.filter||"NONE");return out});
    /* every attribute is turned back into plain floats (indices stay integers) */
    const acc=(i,ints)=>{const a=j.accessors[i],bv=j.bufferViews[a.bufferView],n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],
      C={5126:Float32Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5120:Int8Array,5121:Uint8Array}[a.componentType],E=C.BYTES_PER_ELEMENT,
      u8=views[a.bufferView],src=new C(u8.buffer,u8.byteOffset,u8.byteLength/E),s=(bv.byteStride||n*E)/E,o=(a.byteOffset||0)/E;
      const out=ints?new C(a.count*n):new Float32Array(a.count*n),k=!a.normalized?1:{5122:1/32767,5123:1/65535,5120:1/127,5121:1/255}[a.componentType]||1;
      for(let q=0;q<a.count;q++)for(let c=0;c<n;c++){const v=src[o+q*s+c]*k;out[q*n+c]=a.normalized&&k!==1?Math.max(-1,v):v}
      return new T.BufferAttribute(out,n)};
    const pr=j.meshes[0].primitives[0],geo=new T.BufferGeometry();
    geo.setAttribute("position",acc(pr.attributes.POSITION));geo.setAttribute("normal",acc(pr.attributes.NORMAL));
    if(pr.attributes.TEXCOORD_0!==undefined)geo.setAttribute("uv",acc(pr.attributes.TEXCOORD_0));
    if(pr.attributes.TANGENT!==undefined)geo.setAttribute("tangent",acc(pr.attributes.TANGENT));
    if(pr.indices!==undefined)geo.setIndex(acc(pr.indices,true));
    /* bake the node transform (it also undoes the position quantization), then centre and scale to a common height */
    const nd=j.nodes.find(n=>n.mesh===0)||{},m4=new T.Matrix4();
    m4.compose(new T.Vector3().fromArray(nd.translation||[0,0,0]),new T.Quaternion().fromArray(nd.rotation||[0,0,0,1]),new T.Vector3().fromArray(nd.scale||[1,1,1]));
    geo.applyMatrix4(m4);geo.computeBoundingBox();const bb=geo.boundingBox,c=bb.getCenter(new T.Vector3()),sz=bb.getSize(new T.Vector3()),k=(G[key].h||2.4)/sz.y;
    geo.translate(-c.x,-c.y,-c.z);geo.scale(k,k,k);geo.computeBoundingBox();geo.computeBoundingSphere();
    /* fabric normal map: smaller file on phones */
    let nmap=null;
    if(G[key].normal){const im=await loadImg(ASSETS+G[key].normal+"-"+(window.innerWidth<700?1024:2048)+".jpg");
      if(im){nmap=new T.Texture(im);nmap.flipY=false;nmap.wrapS=nmap.wrapT=T.RepeatWrapping;nmap.colorSpace=T.NoColorSpace;nmap.needsUpdate=true}}
    return{geo,nmap,grid:buildGrid(geo)};
  })();
}
/* uniform grid over the triangles: fast ray picks and decal building on 50k\u2013120k triangle models */
function buildGrid(geo){
  const P=geo.attributes.position.array,I=geo.index?geo.index.array:null,nt=(I?I.length:P.length/3)/3,bb=geo.boundingBox;
  const vi=(t,k)=>I?I[t*3+k]:t*3+k;
  const cs=.07,mn=[bb.min.x-.01,bb.min.y-.01,bb.min.z-.01],dim=[0,1,2].map(a=>Math.max(1,Math.ceil(((a?a==1?bb.max.y:bb.max.z:bb.max.x)+.01-mn[a])/cs)));
  const cellOf=(v,a)=>Math.max(0,Math.min(dim[a]-1,Math.floor((v-mn[a])/cs)));
  const cnt=new Int32Array(dim[0]*dim[1]*dim[2]+1),rng=new Int32Array(nt*6);
  for(let t=0;t<nt;t++){let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];for(let k=0;k<3;k++){const v=vi(t,k)*3;for(let a=0;a<3;a++){const q=P[v+a];if(q<lo[a])lo[a]=q;if(q>hi[a])hi[a]=q}}
    for(let a=0;a<3;a++){rng[t*6+a]=cellOf(lo[a],a);rng[t*6+3+a]=cellOf(hi[a],a)}
    for(let z=rng[t*6+2];z<=rng[t*6+5];z++)for(let y=rng[t*6+1];y<=rng[t*6+4];y++)for(let x=rng[t*6];x<=rng[t*6+3];x++)cnt[x+dim[0]*(y+dim[1]*z)+1]++}
  for(let i=1;i<cnt.length;i++)cnt[i]+=cnt[i-1];
  const fill=cnt.slice(),list=new Int32Array(cnt[cnt.length-1]);
  for(let t=0;t<nt;t++)for(let z=rng[t*6+2];z<=rng[t*6+5];z++)for(let y=rng[t*6+1];y<=rng[t*6+4];y++)for(let x=rng[t*6];x<=rng[t*6+3];x++)list[fill[x+dim[0]*(y+dim[1]*z)]++]=t;
  return{P,N:geo.attributes.normal.array,I,nt,vi,cs,mn,dim,cnt,list,stamp:new Int32Array(nt),sid:0};
}
/* ray (local space) against the grid: returns {t,point,normal} */
function rayPick(o,d){
  const g=gar.grid,{P,N,cs,mn,dim,cnt,list}=g;let best=null,bt=1e9;
  const bmn=mn,bmx=[mn[0]+dim[0]*cs,mn[1]+dim[1]*cs,mn[2]+dim[2]*cs];let t0=0,t1=1e9;
  for(let a=0;a<3;a++){const oa=[o.x,o.y,o.z][a],da=[d.x,d.y,d.z][a];if(Math.abs(da)<1e-9){if(oa<bmn[a]||oa>bmx[a])return null;continue}
    let ta=(bmn[a]-oa)/da,tb=(bmx[a]-oa)/da;if(ta>tb)[ta,tb]=[tb,ta];t0=Math.max(t0,ta);t1=Math.min(t1,tb);if(t0>t1)return null}
  const O=[o.x,o.y,o.z],D=[d.x,d.y,d.z],c=[0,1,2].map(a=>Math.max(0,Math.min(dim[a]-1,Math.floor((O[a]+D[a]*(t0+1e-6)-mn[a])/cs)))),
    step=D.map(v=>v>0?1:-1),tMax=[0,1,2].map(a=>Math.abs(D[a])<1e-9?1e9:((mn[a]+(c[a]+(D[a]>0?1:0))*cs)-O[a])/D[a]),tDel=D.map(v=>Math.abs(v)<1e-9?1e9:cs/Math.abs(v));
  g.sid++;
  while(true){
    const ci=c[0]+dim[0]*(c[1]+dim[1]*c[2]);
    for(let q=cnt[ci];q<cnt[ci+1];q++){const t=list[q];if(g.stamp[t]===g.sid)continue;g.stamp[t]=g.sid;
      const a=g.vi(t,0)*3,b=g.vi(t,1)*3,e=g.vi(t,2)*3;
      const e1x=P[b]-P[a],e1y=P[b+1]-P[a+1],e1z=P[b+2]-P[a+2],e2x=P[e]-P[a],e2y=P[e+1]-P[a+1],e2z=P[e+2]-P[a+2];
      const px=D[1]*e2z-D[2]*e2y,py=D[2]*e2x-D[0]*e2z,pz=D[0]*e2y-D[1]*e2x,det=e1x*px+e1y*py+e1z*pz;if(Math.abs(det)<1e-12)continue;
      const inv=1/det,sx=O[0]-P[a],sy=O[1]-P[a+1],sz=O[2]-P[a+2],u=(sx*px+sy*py+sz*pz)*inv;if(u<0||u>1)continue;
      const qx=sy*e1z-sz*e1y,qy=sz*e1x-sx*e1z,qz=sx*e1y-sy*e1x,v=(D[0]*qx+D[1]*qy+D[2]*qz)*inv;if(v<0||u+v>1)continue;
      const tt=(e2x*qx+e2y*qy+e2z*qz)*inv;if(tt>1e-5&&tt<bt){bt=tt;const w0=1-u-v;
        best={t:tt,point:new T.Vector3(O[0]+D[0]*tt,O[1]+D[1]*tt,O[2]+D[2]*tt),normal:new T.Vector3(N[a]*w0+N[b]*u+N[e]*v,N[a+1]*w0+N[b+1]*u+N[e+1]*v,N[a+2]*w0+N[b+2]*u+N[e+2]*v).normalize()}}}
    const ax=tMax[0]<tMax[1]?(tMax[0]<tMax[2]?0:2):(tMax[1]<tMax[2]?1:2);
    if(best&&bt<=tMax[ax])break;if(tMax[ax]>t1)break;
    c[ax]+=step[ax];if(c[ax]<0||c[ax]>=dim[ax])break;tMax[ax]+=tDel[ax];
  }
  if(best&&best.normal.dot(new T.Vector3(D[0],D[1],D[2]))>0)best.normal.negate();
  return best;
}
/* projected decal: clip the triangles under a box onto the surface (like three.js DecalGeometry, limited to nearby cells) */
function decalBasis(L){const n=L.n.clone().normalize(),up=Math.abs(n.y)>.95?new T.Vector3(0,0,1):new T.Vector3(0,1,0);
  const x=new T.Vector3().crossVectors(up,n).normalize(),y=new T.Vector3().crossVectors(n,x),rr=L.r*Math.PI/180,c=Math.cos(rr),s=Math.sin(rr);
  const X=x.clone().multiplyScalar(c).addScaledVector(y,s),Y=y.clone().multiplyScalar(c).addScaledVector(x,-s);
  return new T.Matrix4().makeBasis(X,Y,n).setPosition(L.p)}
function decalSize(L){const W=gar.geo.boundingBox.max.x-gar.geo.boundingBox.min.x,w=L.w*W,a=L.g.h/L.g.w;return{w,h:w*a,d:Math.max(.28,w*.55)}}
function dropMesh(L){if(L.mesh){if(L.mesh.parent)L.mesh.parent.remove(L.mesh);L.mesh.geometry.dispose();L.mesh=null}}
function buildDecal(L){
  dropMesh(L);
  if(!gar||!group||!L.p||!L.mat)return;
  const g=gar.grid,{P,N}=g,M=decalBasis(L),Mi=M.clone().invert(),{w,h,d}=decalSize(L),hw=w/2,hh=h/2,hd=d/2,nd=L.n.clone().normalize();
  const rad=Math.sqrt(hw*hw+hh*hh+hd*hd),lo=[0,1,2].map(a=>Math.max(0,Math.floor(([L.p.x,L.p.y,L.p.z][a]-rad-g.mn[a])/g.cs))),hi=[0,1,2].map(a=>Math.min(g.dim[a]-1,Math.floor(([L.p.x,L.p.y,L.p.z][a]+rad-g.mn[a])/g.cs)));
  const pos=[],uv=[],me=Mi.elements,v=new T.Vector3();g.sid++;
  const clip=(poly,a,s)=>{const out=[];for(let i=0;i<poly.length;i++){const A=poly[i],B=poly[(i+1)%poly.length],da=s*A[a]-[hw,hh,hd][a],db=s*B[a]-[hw,hh,hd][a];
    if(da<=0)out.push(A);if((da<=0)!==(db<=0)){const t=da/(da-db);out.push([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t])}}return out};
  for(let z=lo[2];z<=hi[2];z++)for(let y=lo[1];y<=hi[1];y++)for(let x=lo[0];x<=hi[0];x++){const ci=x+g.dim[0]*(y+g.dim[1]*z);
    for(let q=g.cnt[ci];q<g.cnt[ci+1];q++){const t=g.list[q];if(g.stamp[t]===g.sid)continue;g.stamp[t]=g.sid;
      const ids=[g.vi(t,0)*3,g.vi(t,1)*3,g.vi(t,2)*3];
      const nx=N[ids[0]]+N[ids[1]]+N[ids[2]],ny=N[ids[0]+1]+N[ids[1]+1]+N[ids[2]+1],nz=N[ids[0]+2]+N[ids[1]+2]+N[ids[2]+2];
      if(Math.abs(nx*nd.x+ny*nd.y+nz*nd.z)/Math.max(1e-6,Math.hypot(nx,ny,nz))<.2)continue;   /* faces edge-on to the print (models may store normals either way; depth limit keeps the far side out) */
      let poly=ids.map(i=>{v.set(P[i],P[i+1],P[i+2]).applyMatrix4(Mi);return[v.x,v.y,v.z]});
      if(poly.every(p=>p[0]>hw)||poly.every(p=>p[0]<-hw)||poly.every(p=>p[1]>hh)||poly.every(p=>p[1]<-hh)||poly.every(p=>p[2]>hd)||poly.every(p=>p[2]<-hd))continue;
      for(let a=0;a<3&&poly.length;a++){poly=clip(poly,a,1);if(poly.length)poly=clip(poly,a,-1)}
      if(poly.length<3)continue;
      for(let i=1;i<poly.length-1;i++)for(const p of [poly[0],poly[i],poly[i+1]]){v.set(p[0],p[1],p[2]).applyMatrix4(M).addScaledVector(nd,.003);pos.push(v.x,v.y,v.z);uv.push(p[0]/w+.5,p[1]/h+.5)}}}
  if(!pos.length)return;
  const geo=new T.BufferGeometry(),nrm=new Float32Array(pos.length);for(let i=0;i<nrm.length;i+=3){nrm[i]=nd.x;nrm[i+1]=nd.y;nrm[i+2]=nd.z}
  geo.setAttribute("position",new T.Float32BufferAttribute(pos,3));geo.setAttribute("uv",new T.Float32BufferAttribute(uv,2));geo.setAttribute("normal",new T.BufferAttribute(nrm,3));
  L.mesh=new T.Mesh(geo,L.mat);L.mesh.renderOrder=2+st.layers.indexOf(L);group.add(L.mesh);dirty=true;
}
const buildAll=()=>st.layers.forEach(buildDecal);
let decalQueued=false;function queueDecal(){if(decalQueued)return;decalQueued=true;requestAnimationFrame(()=>{decalQueued=false;const L=AL();if(L)buildDecal(L)})}
function makeMat(L){
  if(L.tex)L.tex.dispose();
  L.tex=new T.Texture(L.g.img);L.tex.colorSpace=T.SRGBColorSpace;L.tex.anisotropy=R?Math.min(8,R.capabilities.getMaxAnisotropy()):1;L.tex.needsUpdate=true;
  /* later layers sit a hair above earlier ones where they overlap */
  if(!L.mat)L.mat=new T.MeshStandardMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4-st.layers.indexOf(L),roughness:.92,metalness:0,side:T.DoubleSide});
  L.mat.map=L.tex;L.mat.needsUpdate=true;
}
/* next free spot: the first one, then the back, then the rest */
function freePreset(){const ps=G[st.garment].presets,used=st.layers.map(L=>L.preset),idx=ps.map((p,i)=>i),order=[0,...idx.filter(i=>i&&ps[i][1].side==="b"),...idx.filter(i=>i&&ps[i][1].side!=="b")];
  return order.find(i=>!used.includes(i))??0}
function face(L){if(!L)return;const p=G[st.garment].presets[L.preset];rotY=p&&p[1].side==="b"?Math.PI:0;velY=0;dirty=true}
/* put the graphic at a named spot by casting a ray at the garment from the front or back */
function applyPreset(i,L=AL()){
  if(!gar||!L)return;const pr=G[st.garment].presets[i];if(!pr)return;const s=pr[1],bb=gar.geo.boundingBox,W=bb.max.x-bb.min.x,H=bb.max.y-bb.min.y;
  L.preset=i;L.w=s.w;L.r=s.r;const dir=s.side==="b"?1:-1,y=bb.min.y+s.fy*H;
  let hit=null;for(const off of [0,.02,-.02,.05,-.05,.09,-.09]){const x=(s.fx+off)*W;hit=rayPick(new T.Vector3(x,y,dir<0?bb.max.z+1:bb.min.z-1),new T.Vector3(0,0,dir));if(hit)break}
  if(hit){L.p=hit.point;L.n=hit.normal.clone().lerp(new T.Vector3(0,0,-dir),.55).normalize()}
  if(L===AL()){rotY=s.side==="b"?Math.PI:0;velY=0}
  dirty=true;buildDecal(L);syncUI();
}
function showGarment(){
  if(!gar||!scene)return;st.layers.forEach(dropMesh);if(group)scene.remove(group);
  group=new T.Group();
  const mat=new T.MeshStandardMaterial({color:st.color,roughness:.95,metalness:0,side:T.DoubleSide,normalMap:gar.nmap||null});
  if(gar.nmap)mat.normalScale=new T.Vector2(1,1);
  group.add(new T.Mesh(gar.geo,mat));group.userData.mat=mat;scene.add(group);dirty=true;
}
async function setGarment(key){
  st.garment=key;syncUI();if(!T)return;hint("Loading garment\u2026");
  const g=await loadGarment(key);if(st.garment!==key)return;gar=g;showGarment();hint(HINT);
  /* each graphic keeps its spot (Front, Back, ...) on the new garment; the active one is placed last so the view turns to it */
  const n=G[key].presets.length,a=AL();st.layers.forEach(L=>{if(L!==a)applyPreset(Math.min(L.preset,n-1),L)});if(a)applyPreset(Math.min(a.preset,n-1),a);
}
function initScene(){
  R=new T.WebGLRenderer({antialias:true,alpha:true});R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));R.outputColorSpace=T.SRGBColorSpace;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
  scene=new T.Scene();cam=new T.PerspectiveCamera(30,1,.05,60);
  scene.add(new T.HemisphereLight(0xffffff,0x6a655c,1.2));
  const k=new T.DirectionalLight(0xffffff,1.9);k.position.set(2.5,3.5,5);scene.add(k);
  const f=new T.DirectionalLight(0xffffff,.55);f.position.set(-4,1,3);scene.add(f);
  const b=new T.DirectionalLight(0xffffff,.8);b.position.set(-2,2.5,-5);scene.add(b);
  const sc=document.createElement("canvas");sc.width=sc.height=128;const sx=sc.getContext("2d"),gr=sx.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,"rgba(0,0,0,.28)");gr.addColorStop(1,"rgba(0,0,0,0)");sx.fillStyle=gr;sx.fillRect(0,0,128,128);
  const sh=new T.Mesh(new T.PlaneGeometry(2.6,.8),new T.MeshBasicMaterial({map:new T.CanvasTexture(sc),transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=-1.3;scene.add(sh);
}
function size(){if(!R||!stage)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();dirty=true}
function loop(){raf=requestAnimationFrame(loop);if(!on||!group)return;
  if(Math.abs(velY)>.0004&&!drag){rotY+=velY;velY*=.93;dirty=true}
  if(!dirty)return;dirty=false;
  group.rotation.set(rotX,rotY,0);cam.position.set(0,.02,zoom);cam.lookAt(0,0,0);R.render(scene,cam)}

/* ---------- pointer: drag to rotate, drag the graphic to move it, tap to place, pinch/wheel to zoom ---------- */
let drag=null;const ptr={};
function pick(e){
  if(!gar||!group)return null;const r=R.domElement.getBoundingClientRect(),rc=new T.Raycaster();
  rc.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),cam);
  group.updateMatrixWorld();const inv=group.matrixWorld.clone().invert(),o=rc.ray.origin.clone().applyMatrix4(inv),d=rc.ray.direction.clone().transformDirection(inv);
  return rayPick(o,d);
}
/* which graphic a garment hit lands on (the active one first), or -1 */
function layerAt(h){if(!h)return -1;
  const order=st.layers.map((L,i)=>i).sort((a,b)=>(b===st.active)-(a===st.active)||b-a);
  for(const i of order){const L=st.layers[i];if(!L.p)continue;const v=h.point.clone().applyMatrix4(decalBasis(L).invert()),{w,h:hh,d}=decalSize(L);
    if(Math.abs(v.x)<=w*.6&&Math.abs(v.y)<=hh*.6&&Math.abs(v.z)<=d)return i}
  return -1}
function placeAt(h){const L=AL();if(!L)return;L.p=h.point;const front=h.normal.z>=0;L.n=h.normal.clone().lerp(new T.Vector3(0,0,front?1:-1),.45).normalize();queueDecal()}
function bindCanvas(){
  const cv=R.domElement;
  cv.addEventListener("pointerdown",e=>{if(!T)return;cv.setPointerCapture(e.pointerId);ptr[e.pointerId]={x:e.clientX,y:e.clientY};
    const ids=Object.keys(ptr);if(ids.length===2){const [a,b]=ids.map(i=>ptr[i]);drag={pinch:Math.hypot(a.x-b.x,a.y-b.y),z:zoom};return}
    const h=pick(e),li=layerAt(h);if(li>=0&&li!==st.active){st.active=li;syncUI()}
    drag={x:e.clientX,y:e.clientY,t:Date.now(),move:li>=0,moved:false};velY=0;if(view)view.style.cursor=drag.move?"move":"grabbing"});
  cv.addEventListener("pointermove",e=>{if(!drag||!ptr[e.pointerId])return;ptr[e.pointerId]={x:e.clientX,y:e.clientY};
    if(drag.pinch){const [a,b]=Object.values(ptr);if(a&&b){zoom=Math.max(4.4,Math.min(11,drag.z*drag.pinch/Math.max(20,Math.hypot(a.x-b.x,a.y-b.y))));dirty=true}return}
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5)drag.moved=true;
    if(drag.move){const h=pick(e);if(h)placeAt(h)}
    else{rotY+=dx*.011;rotX=Math.max(-.45,Math.min(.45,rotX+dy*.005));velY=dx*.011;dirty=true}
    drag.x=e.clientX;drag.y=e.clientY});
  const up=e=>{delete ptr[e.pointerId];if(!drag)return;
    if(!drag.pinch&&!drag.moved&&Date.now()-drag.t<350&&!drag.move){const h=pick(e);if(h)placeAt(h)}   /* a tap on bare fabric moves the active graphic there */
    if(Object.keys(ptr).length===0){drag=null;if(view)view.style.cursor="grab"}};
  cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
  cv.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(4.4,Math.min(11,zoom*(1+e.deltaY*.001)));dirty=true},{passive:false});
}


/* ---------- configurator tray ---------- */
function trayHTML(){
  return `<div class="gm-row"><span class="gm-lbl">Graphic</span>${graphics().map(p=>`<button class="gm-thumb" data-g="${p.id}" aria-label="${esc(p.title)}" title="${esc(p.title)}"></button>`).join("")}</div>
  <div class="gm-row"><span class="gm-lbl">Garment</span><span class="gm-seg">${Object.keys(G).map(k=>`<button class="gm-chip" data-garment="${k}">${G[k].name.replace("Crewneck","Crew<span class=\"gm-long\">neck</span>")}</button>`).join("")}</span></div>
  <div class="gm-row"><span class="gm-lbl">Color</span><span class="gm-seg gm-dots">${COLORS.map(([n,c])=>`<button class="gm-dot" data-color="${c}" style="background:${c}" aria-label="${n}" title="${n}"></button>`).join("")}</span></div>
  <div class="gm-row" data-presets></div>
  <div class="gm-row"><span class="gm-lbl">Size</span><label class="gm-sl"><input type="range" min="4" max="60" step="1" data-size aria-label="Size"></label><span class="gm-lbl gm-lbl2">Rotate</span><label class="gm-sl"><input type="range" min="-180" max="180" step="1" data-rot aria-label="Rotate"></label></div>`;
}
function syncUI(){
  if(!tray)return;const L=AL();
  tray.querySelectorAll("[data-g]").forEach(b=>{const id=b.dataset.g;b.toggleAttribute("data-on",st.layers.some(x=>x.g.id===id));b.setAttribute("aria-pressed",String(!!L&&L.g.id===id))});
  tray.querySelectorAll("[data-garment]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.garment===st.garment)));
  tray.querySelectorAll("[data-color]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.color===st.color)));
  const pr=tray.querySelector("[data-presets]");pr.innerHTML=`<span class="gm-lbl">Place</span><span class="gm-seg">`+(L?`<button class="gm-chip gm-rm" data-rm aria-label="Remove this graphic">Remove</button>`:"")
    +G[st.garment].presets.map(([n],i)=>`<button class="gm-chip" data-preset="${i}" aria-pressed="${!!L&&L.preset===i}">${n}</button>`).join("")+`</span>`;
  pr.querySelectorAll("[data-preset]").forEach(b=>b.onclick=()=>applyPreset(+b.dataset.preset));
  const rm=pr.querySelector("[data-rm]");if(rm)rm.onclick=removeActive;
  const sz=tray.querySelector("[data-size]"),ro=tray.querySelector("[data-rot]");sz.disabled=ro.disabled=!L;
  if(L){sz.value=Math.round(L.w*100);ro.value=Math.round(L.r)}
}
/* tap a graphic: put it on the garment at the next free spot, or select it if it is already on */
async function addGraphic(p){
  const at=st.layers.findIndex(L=>L.g.id===p.id);if(at>=0){st.active=at;face(AL());syncUI();return}
  if(st.layers.length>=MAXL){hint(`Up to ${MAXL} graphics at once`);return}
  if(!art[p.id+"_ok"])hint("Loading graphic\u2026");
  const g=await graphicOf(p);art[p.id+"_ok"]=1;hint(HINT);if(!g||!T||st.layers.some(L=>L.g.id===p.id))return;
  const L={g:{id:p.id,img:g.img,w:g.w,h:g.h},preset:freePreset(),w:.3,r:0,p:null,n:null};
  st.layers.push(L);st.active=st.layers.length-1;makeMat(L);applyPreset(L.preset,L);
}
function dropLayer(L){dropMesh(L);if(L.tex)L.tex.dispose();if(L.mat)L.mat.dispose()}
function removeActive(){const L=AL();if(!L)return;dropLayer(L);st.layers.splice(st.active,1);st.active=st.layers.length-1;dirty=true;syncUI()}
function clearLayers(){st.layers.forEach(dropLayer);st.layers=[];st.active=-1}
function bindTray(){
  tray.addEventListener("pointerdown",e=>e.stopPropagation());tray.addEventListener("click",e=>e.stopPropagation());
  tray.querySelectorAll("[data-g]").forEach(b=>{const p=graphics().find(x=>x.id===b.dataset.g);
    const u=pngURL(p.id);if(u)b.style.backgroundImage=`url("${u}")`;else graphicOf(p).then(g=>{if(g)b.style.backgroundImage=`url("${g.url}")`});
    b.onclick=()=>addGraphic(p)});
  tray.querySelectorAll("[data-garment]").forEach(b=>b.onclick=()=>setGarment(b.dataset.garment));
  tray.querySelectorAll("[data-color]").forEach(b=>b.onclick=()=>{st.color=b.dataset.color;if(group&&group.userData.mat){group.userData.mat.color.set(st.color);dirty=true}syncUI()});
  tray.querySelector("[data-size]").oninput=e=>{const L=AL();if(L){L.w=e.target.value/100;queueDecal()}};
  tray.querySelector("[data-rot]").oninput=e=>{const L=AL();if(L){L.r=+e.target.value;queueDecal()}};
}


/* inline controls: garment, colour, placement, size and rotate (the dial picks the graphic) */
function trayHTML(){
  return `<div class="gm-row"><span class="gm-lbl">Garment</span><span class="gm-seg">${Object.keys(G).map(k=>`<button class="gm-chip" data-garment="${k}">${G[k].name.replace("Crewneck","Crew<span class=\"gm-long\">neck</span>")}</button>`).join("")}</span></div>
  <div class="gm-row"><span class="gm-lbl">Color</span><span class="gm-seg gm-dots">${COLORS.map(([n,c])=>`<button class="gm-dot" data-color="${c}" style="background:${c}" aria-label="${n}" title="${n}"></button>`).join("")}</span></div>
  <div class="gm-row" data-presets></div>
  <div class="gm-row"><span class="gm-lbl">Size</span><label class="gm-sl"><input type="range" min="4" max="60" step="1" data-size aria-label="Size"></label><span class="gm-lbl gm-lbl2">Rotate</span><label class="gm-sl"><input type="range" min="-180" max="180" step="1" data-rot aria-label="Rotate"></label></div>`;
}
function mount(){
  if(stage&&stage.isConnected)return;
  stage=document.createElement("div");stage.className="gm-inline";
  stage.innerHTML=`<div class="gm-msg">Loading 3D garment\u2026</div><div class="gm-hint">${HINT}</div>`;
  headWrap.appendChild(stage);view=stage;
  tray=document.createElement("div");tray.className="gm-tray";tray.innerHTML=trayHTML();szRow.parentNode.insertBefore(tray,szRow);
  ["pointerdown","pointermove","pointerup","pointercancel","click","touchstart","touchmove","mousedown","dblclick","wheel"].forEach(t=>{stage.addEventListener(t,e=>e.stopPropagation(),{passive:true});tray.addEventListener(t,e=>e.stopPropagation(),{passive:true})});
  bindTray();syncUI();
  if(R){const m=stage.querySelector(".gm-msg");if(m)m.remove();stage.prepend(R.domElement);size();dirty=true}
}
function unmount(){if(stage)stage.remove();if(tray)tray.remove();stage=tray=view=null}
async function show(p){
  const first=!on;on=true;
  if(first){savedDark=screenEl.classList.contains("dark")}
  screenEl.classList.add("gm3d");screenEl.classList.toggle("dark",(document.documentElement.dataset.theme?document.documentElement.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches));mount();
  try{
    if(!T){await loadThree();if(!on)return;
      const test=document.createElement("canvas");if(!(test.getContext("webgl2")||test.getContext("webgl")))throw new Error("no webgl");
      initScene();bindCanvas();zoom=innerWidth>720?5.6:6.8;if(!raf)loop()}
    if(!on)return;
    if(!stage.contains(R.domElement))stage.prepend(R.domElement);size();
    graphicOf(p);const g=await loadGarment(st.garment);if(!on)return;const m2=stage.querySelector(".gm-msg");if(m2)m2.remove();
    if(gar!==g||!group){gar=g;showGarment()}
    if(curId!==p.id||!st.layers.length){curId=p.id;clearLayers();await addGraphic(p)}else{buildAll();syncUI()}
    if(!on)return;size();dirty=true;
  }catch(e){console.warn("gm",e);const msg=stage&&stage.querySelector(".gm-msg");if(msg)msg.textContent="3D preview isn't available on this device."}
}
function hide(restore){if(!on)return;on=false;unmount();screenEl.classList.remove("gm3d");if(restore)screenEl.classList.toggle("dark",savedDark)}
/* called after every item change */
window.gmSync=function(){
  const p=curItem();sw.classList.toggle("show",!!p);
  if(p&&want){if(curId!==p.id||!on){if(on)screenEl.classList.toggle("dark",(document.documentElement.dataset.theme?document.documentElement.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches));show(p)}else screenEl.classList.toggle("dark",(document.documentElement.dataset.theme?document.documentElement.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches))}
  else if(on)hide(false);
  requestAnimationFrame(paintSw);
};
swBtns.forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();want=b.dataset.v==="3d";paintSw();
  const p=curItem();if(want&&p)show(p);else hide(true)}));
new ResizeObserver(()=>{if(on)size()}).observe(headWrap);
window.addEventListener("hashchange",()=>{if(on&&!location.hash.includes("shop"))hide(false)});
gmSync();
})();
