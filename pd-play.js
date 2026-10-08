/* ---------- PORTFOLIO: "Play" — solitaire with project covers on the card backs ----------
   The portfolio's category row shows just "All" and "Play". Play swaps the card deck for a game of Klondike
   solitaire (draw 1): every face-down card shows a real project cover. Drag cards, or tap one to send it to the
   best spot; tap the stock to draw. Undo, New game, moves and time; the game is saved between visits.
   Winning shows the projects whose covers were in the deck; tapping one opens it. */
(function(){
if(typeof PROJECTS==="undefined"||typeof renderPockets!=="function")return;
const main=document.querySelector("main"),sv=document.getElementById("swipeView");if(!main||!sv)return;
const KEY="pd-solitaire";
const SUITS=["♠","♥","♦","♣"],RED=s=>s===1||s===2,RANK=["","A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const snd=n=>{if(typeof sfx==="function")try{sfx(n)}catch(e){}};

const st=document.createElement("style");st.textContent=`
#playView{display:flex;flex-direction:column;gap:10px;padding-block:10px;width:100%}
#playView[hidden]{display:none}
.play-top{display:flex;align-items:center;justify-content:space-between;gap:10px;width:min(100%,900px);margin:0 auto}
.play-top h2{font-family:var(--f-display);font-weight:900;font-size:clamp(22px,4vw,30px);line-height:1;text-transform:uppercase;margin:0}
.play-top .stat{font-family:var(--f-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);display:flex;gap:12px}
.play-top .btns{display:flex;gap:6px}
.play-top button{height:34px;padding:0 13px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:600;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.play-top button:disabled{opacity:.4;cursor:default}
.play-top button svg{width:14px;height:14px}
@media (max-width:440px){.play-top button{padding:0 10px}.play-top button[data-undo] span,.play-top button[data-new] span{display:none}}
.play-win .acts{display:flex;gap:8px;flex-wrap:wrap}
.play-win .share{height:40px;padding:0 18px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px}
.play-win .share svg{width:16px;height:16px}
.play-win .share:disabled{opacity:.5}
.sheet.deckshot .bigart{display:grid;place-items:center;background:#0b0b0c;padding:14px;aspect-ratio:auto;min-height:280px}
.sheet.deckshot .bigart img{max-width:100%;max-height:min(64vh,660px);border-radius:12px;display:block}
.deckshot .pds-btns{display:flex;flex-direction:column;gap:8px}
.deckshot .pds-btns button{display:flex;align-items:center;gap:12px;width:100%;padding:13px 16px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:600;font-size:15px;cursor:pointer;text-align:left}
.deckshot .pds-btns svg{width:20px;height:20px;flex:none}
.play-board{position:relative;isolation:isolate;width:min(100%,900px);margin:0 auto;height:calc(100svh - var(--hdr,56px) - 86px);min-height:430px;touch-action:none;user-select:none;-webkit-user-select:none}
.ps{position:absolute;border-radius:var(--pr);border:1.5px dashed var(--line);display:grid;place-items:center;color:var(--muted);font-family:var(--f-display);font-weight:700;font-size:calc(var(--cw)*.36)}
.ps.stock{cursor:pointer;border-style:solid}
.ps.stock svg{width:40%;height:40%;opacity:.6}
.pc{position:absolute;left:0;top:0;width:var(--cw);height:var(--ch);border-radius:var(--pr);transition:transform .24s cubic-bezier(.2,.8,.2,1);will-change:transform}
.pc.drag{transition:none;z-index:900!important}
.pc .fc,.pc .bk{position:absolute;inset:0;border-radius:inherit;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.25),0 0 0 1px rgba(0,0,0,.12)}
.pc .fc{background:#F6F4EE;color:#141414;display:none;cursor:grab}
.pc.up .fc{display:block}.pc.up .bk{display:none}
.pc.red .fc{color:#C8282D}
.pc .fc b{position:absolute;left:7%;top:3%;font-family:var(--f-display);font-weight:900;font-size:calc(var(--cw)*.34);line-height:1;letter-spacing:-.02em}
.pc .fc i{position:absolute;right:7%;top:5%;font-style:normal;font-size:calc(var(--cw)*.24);line-height:1}
.pc .fc em{position:absolute;left:0;right:0;bottom:8%;text-align:center;font-style:normal;font-size:calc(var(--cw)*.56);line-height:1}
.pc .fc .ft{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--f-display);font-weight:900;font-size:calc(var(--cw)*.62);opacity:.9;padding-top:22%}
.pc .bk{background:#111}
.pc .bk img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
.pc .bk::after{content:"";position:absolute;inset:calc(var(--cw)*.05);border:1.5px solid rgba(255,255,255,.85);border-radius:calc(var(--pr)*.7);pointer-events:none}
.pc .bk i{position:absolute;right:calc(var(--cw)*.09);bottom:calc(var(--cw)*.09);width:calc(var(--cw)*.2);height:calc(var(--cw)*.2);border-radius:50%;border:1.5px solid #fff;box-shadow:inset 0 0 0 calc(var(--cw)*.04) rgba(0,0,0,.35),inset 0 0 0 calc(var(--cw)*.055) #fff;background:rgba(0,0,0,.25)}
.pc.hint .fc{box-shadow:0 0 0 2px #F2C649,0 6px 16px rgba(0,0,0,.3)}
.pc.bad{animation:pcShake .3s}
@keyframes pcShake{25%{margin-left:-5px}75%{margin-left:5px}}
.play-win{position:absolute;inset:0;z-index:1000;display:grid;place-items:center;background:color-mix(in srgb,var(--bg) 70%,transparent);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);border-radius:16px}
.play-win>div{box-sizing:border-box;width:min(94%,560px);max-height:94%;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:12px;box-shadow:0 30px 60px -30px rgba(0,0,0,.6)}
.play-win h3{font-family:var(--f-display);font-weight:900;font-size:44px;line-height:.9;text-transform:uppercase;margin:0}
.play-win p{margin:0;color:var(--muted)}
.play-win .pw-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:8px;max-height:min(40vh,320px);overflow-y:auto;padding:2px}
.play-win .pw-row button{width:100%;aspect-ratio:5/7;border-radius:8px;border:0;padding:0;overflow:hidden;cursor:pointer;background:#111}
.play-win .pw-row img{width:100%;height:100%;object-fit:cover;display:block}
.play-win .go{align-self:flex-start;height:40px;padding:0 18px;border-radius:999px;border:0;background:var(--ink);color:var(--bg);font:inherit;font-weight:700;cursor:pointer}
`;document.head.appendChild(st);

/* ---------- the view ---------- */
const undoIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg>';
const backIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';
const newIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>';
const pv=document.createElement("section");pv.className="view";pv.id="playView";pv.hidden=true;
pv.innerHTML=`<div class="play-top"><div><h2>Solitaire</h2><div class="stat"><span data-mv>0 moves</span><span data-tm>0:00</span></div></div>
  <div class="btns"><button type="button" data-back aria-label="Back to portfolio">${backIco}<span>Portfolio</span></button><button type="button" data-undo aria-label="Undo">${undoIco}<span>Undo</span></button><button type="button" data-new aria-label="New game">${newIco}<span>New</span></button></div></div>
  <div class="play-board" aria-label="Solitaire board"></div>`;
sv.after(pv);
const board=pv.querySelector(".play-board"),mvEl=pv.querySelector("[data-mv]"),tmEl=pv.querySelector("[data-tm]"),undoBtn=pv.querySelector("[data-undo]");

/* ---------- the deck: backs are project covers ---------- */
function covers(){const seen=new Set();return PROJECTS.filter(p=>p.image&&!p.nl&&!p.ad&&!p.nyp&&!p.tv&&!seen.has(p.image)&&seen.add(p.image))}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
let G=null,hist=[],cards={},els={},playing=false,tick=null;
function deal(){
  const cv=shuffle(covers().slice());const deck=[];let n=0;
  for(let s=0;s<4;s++)for(let r=1;r<=13;r++){const p=cv.length?cv[n%cv.length]:null;deck.push({id:"c"+s+"_"+r,s,r,up:false,pid:p?p.id:null,img:p?p.image:"",bg:p?(p.imageBg||p.bg||"#111"):"#111"});n++}
  shuffle(deck);const tab=[[],[],[],[],[],[],[]];
  for(let c=0;c<7;c++)for(let k=0;k<=c;k++){const x=deck.pop();x.up=k===c;tab[c].push(x)}
  G={stock:deck,waste:[],found:[[],[],[],[]],tab,moves:0,time:0,started:false,won:false};hist=[];build();layout(true);save();
  if(!reduce){Object.values(els).forEach((e,i)=>{e.style.transitionDelay=(i%28)*14+"ms";setTimeout(()=>{e.style.transitionDelay=""},700)})}
  snd("deal");
}
const all=()=>[...G.stock,...G.waste,...G.found.flat(),...G.tab.flat()];
function wix(u){return u.replace(/\/v1\/fit\/w_\d+,h_\d+/,"/v1/fit/w_300,h_300")}
function build(){
  board.querySelectorAll(".pc,.ps").forEach(e=>e.remove());els={};cards={};
  const slot=(cls,html="")=>{const d=document.createElement("div");d.className="ps "+cls;d.innerHTML=html;board.appendChild(d);return d};
  slots.stock=slot("stock",newIco);slots.waste=slot("waste");slots.found=[0,1,2,3].map(i=>slot("found",SUITS[i]+"︎"));slots.tab=[0,1,2,3,4,5,6].map(()=>slot("tab","K"));
  slots.stock.addEventListener("click",drawStock);
  all().forEach(c=>{cards[c.id]=c;const e=document.createElement("div");e.className="pc"+(RED(c.s)?" red":"");e.dataset.id=c.id;
    const face=c.r>10?`<span class="ft">${RANK[c.r]}</span>`:`<em>${SUITS[c.s]}︎</em>`;
    e.innerHTML=`<div class="fc"><b>${RANK[c.r]}</b><i>${SUITS[c.s]}︎</i>${face}</div><div class="bk" style="background:${c.bg}">${c.img?`<img alt="" loading="lazy" decoding="async" src="${wix(c.img)}" onerror="this.remove()">`:""}<i></i></div>`;
    board.appendChild(e);els[c.id]=e});
}
const slots={};

/* ---------- layout ---------- */
let M={};
function layout(instant){
  if(!G)return;const W=board.clientWidth,H=board.clientHeight;if(!W||!H)return;
  const gap=Math.max(4,Math.min(14,W*.014)),cw=Math.min(118,(W-6*gap)/7),ch=cw*1.4,pr=Math.max(4,cw*.08);
  board.style.setProperty("--cw",cw+"px");board.style.setProperty("--ch",ch+"px");board.style.setProperty("--pr",pr+"px");
  const x=i=>i*(cw+gap)+(W-(7*cw+6*gap))/2,y0=ch+gap*2;M={cw,ch,gap,x,y0,H};
  const put=(e,X,Y)=>{e.style.left=X+"px";e.style.top=Y+"px";e.style.width=cw+"px";e.style.height=ch+"px"};
  put(slots.stock,x(0),0);put(slots.waste,x(1),0);slots.found.forEach((s,i)=>put(s,x(3+i),0));slots.tab.forEach((s,i)=>put(s,x(i),y0));
  let z=1;const pos=(c,X,Y)=>{const e=els[c.id];e.classList.toggle("up",c.up);e.style.zIndex=z++;
    if(instant){e.style.transition="none";requestAnimationFrame(()=>{e.style.transition=""})}e.style.transform=`translate(${X}px,${Y}px)`;c._x=X;c._y=Y};
  G.stock.forEach((c,i)=>pos(c,x(0)+Math.min(i,3)*.0,0));
  G.waste.forEach((c,i)=>pos(c,x(1),0));
  G.found.forEach((f,i)=>f.forEach(c=>pos(c,x(3+i),0)));
  G.tab.forEach((col,i)=>{const nd=col.filter(c=>!c.up).length,nu=col.length-nd;let dD=ch*.14,dU=ch*.3;
    const need=nd*dD+Math.max(0,nu-1)*dU+ch,room=H-y0-4;if(need>room&&col.length>1){const k=Math.max(.35,(room-ch)/(nd*dD+Math.max(0,nu-1)*dU));dD*=k;dU*=k}
    let Y=y0;col.forEach(c=>{pos(c,x(i),Y);Y+=c.up?dU:dD})});
  mvEl.textContent=G.moves+(G.moves===1?" move":" moves");undoBtn.disabled=!hist.length;
}
new ResizeObserver(()=>layout(true)).observe(board);

/* ---------- rules ---------- */
const top=a=>a[a.length-1];
function canFound(c,f){const t=top(f);return t?t.s===c.s&&c.r===t.r+1:c.r===1}
function canTab(c,col){const t=top(col);return t?t.up&&RED(t.s)!==RED(c.s)&&c.r===t.r-1:c.r===13}
function where(c){if(G.waste.includes(c))return{pile:G.waste,kind:"waste"};for(const f of G.found)if(f.includes(c))return{pile:f,kind:"found"};
  for(const t of G.tab)if(t.includes(c))return{pile:t,kind:"tab"};return{pile:G.stock,kind:"stock"}}
function snap(){hist.push(JSON.stringify({stock:G.stock.map(c=>[c.id,c.up]),waste:G.waste.map(c=>[c.id,c.up]),found:G.found.map(f=>f.map(c=>[c.id,c.up])),tab:G.tab.map(t=>t.map(c=>[c.id,c.up])),moves:G.moves}));if(hist.length>300)hist.shift()}
function restore(j){const o=JSON.parse(j),m=a=>a.map(([id,up])=>{const c=cards[id];c.up=up;return c});G.stock=m(o.stock);G.waste=m(o.waste);G.found=o.found.map(m);G.tab=o.tab.map(m);G.moves=o.moves}
function startClock(){if(!G.started){G.started=true}}
function moveCards(list,from,to){snap();from.splice(from.length-list.length,list.length);to.push(...list);
  const t=top(from);if(t&&!t.up&&G.tab.includes(from))t.up=true;G.moves++;startClock();layout();save();after()}
function drawStock(){if(!G||G.won)return;snap();
  if(G.stock.length){const c=G.stock.pop();c.up=true;G.waste.push(c);snd("tick")}
  else if(G.waste.length){G.stock=G.waste.reverse().map(c=>(c.up=false,c));G.waste=[];snd("deal")}
  else{hist.pop();return}
  G.moves++;startClock();layout();save()}
/* tap: foundation first, then the best tableau column */
function autoMove(c){const w=where(c);if(w.kind==="stock")return false;const i=w.pile.indexOf(c),list=w.pile.slice(i);
  if(list.length===1){const f=G.found.find(f=>canFound(c,f));if(f&&w.pile!==f){moveCards(list,w.pile,f);snd("pop");return true}}
  if(w.kind!=="found"||list.length===1){const cols=G.tab.filter(t=>t!==w.pile&&canTab(c,t));const best=cols.find(t=>t.length)||(c.r===13&&i===0&&w.kind==="tab"?null:cols[0]);
    if(best){moveCards(list,w.pile,best);snd("tick");return true}}
  return false}
function after(){
  if(G.found.every(f=>f.length===13)){win();return}
  /* everything face up and dealt: finish it automatically */
  if(!G.stock.length&&!G.waste.length&&G.tab.every(t=>t.every(c=>c.up))&&!G.auto){G.auto=true;const step=()=>{if(!G.auto)return;
    for(const t of G.tab){const c=top(t);if(c){const f=G.found.find(f=>canFound(c,f));if(f){t.pop();f.push(c);G.moves++;layout();snd("pop");if(G.found.every(f=>f.length===13)){G.auto=false;save();win();return}setTimeout(step,reduce?20:110);return}}}
    G.auto=false;save()};setTimeout(step,250)}
}
function win(){G.won=true;save();snd("save");
  if(!reduce)G.found.forEach((f,i)=>f.forEach((c,k)=>{const e=els[c.id];e.animate([{transform:e.style.transform},{transform:`${e.style.transform} translateY(-24px) rotate(${(k%2?1:-1)*8}deg)`},{transform:e.style.transform}],{duration:600,delay:i*90+k*30,easing:"ease-out"})}));
  const seen=[],ids=new Set();all().forEach(c=>{if(c.pid&&!ids.has(c.pid)){ids.add(c.pid);const p=PROJECTS.find(x=>x.id===c.pid);if(p)seen.push(p)}});
  const d=document.createElement("div");d.className="play-win";
  d.innerHTML=`<div><h3>You won!</h3><p>${G.moves} moves · ${fmt(G.time)}. You uncovered these projects:</p><div class="pw-row">${seen.map(p=>`<button type="button" data-p="${esc(p.id)}" aria-label="${esc(p.client+", "+p.title)}"><img alt="" src="${wix(p.image)}" onerror="this.remove()"></button>`).join("")}</div><div class="acts"><button class="share" type="button">${shareIco}<span>Share my deck</span></button><button class="go" type="button">Play again</button></div></div>`;
  board.appendChild(d);d.querySelector(".go").onclick=()=>{d.remove();deal()};
  const sb=d.querySelector(".share");sb.onclick=async()=>{sb.disabled=true;sb.querySelector("span").textContent="Making your image…";
    try{await shareDeck(seen)}catch(e){}sb.disabled=false;sb.querySelector("span").textContent="Share my deck"};
  d.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{const p=PROJECTS.find(x=>x.id===b.dataset.p);if(p&&typeof openDetail==="function")openDetail(p)})}

/* ---------- share the winning deck: all its covers as cards on one branded image ---------- */
const shareIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
const xIco='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z"/></svg>';
const dlIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>';
const closeIco='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const cssv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function loadCors(u){return new Promise(res=>{if(!u)return res(null);const im=new Image();im.crossOrigin="anonymous";let done=false;const fin=v=>{if(!done){done=true;res(v)}};
  im.onload=()=>fin(im);im.onerror=()=>fin(null);setTimeout(()=>fin(null),8000);im.src=wix(u)+(u.includes("?")?"&":"?")+"pdcors=1"})}
function rrect(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
async function deckCanvas(list){
  const DSP=cssv("--f-display")||"Impact,sans-serif",MONO=cssv("--f-mono")||"monospace",BODY=cssv("--f-body")||"sans-serif";
  try{await Promise.all([document.fonts.load(`900 80px ${DSP}`),document.fonts.load(`500 20px ${MONO}`),document.fonts.load(`700 28px ${BODY}`)])}catch(e){}
  const W=1080,H=1350,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const g=x.createRadialGradient(W/2,H*.45,60,W/2,H*.5,H*.8);g.addColorStop(0,"#1d1e22");g.addColorStop(1,"#0b0c0e");x.fillStyle=g;x.fillRect(0,0,W,H);
  x.strokeStyle="rgba(255,255,255,.035)";x.lineWidth=1;for(let i=0;i<W;i+=54){x.beginPath();x.moveTo(i+.5,0);x.lineTo(i+.5,H);x.stroke()}for(let j=0;j<H;j+=54){x.beginPath();x.moveTo(0,j+.5);x.lineTo(W,j+.5);x.stroke()}
  const M=48;x.fillStyle="#F4F2EC";x.textBaseline="alphabetic";
  x.strokeStyle="#F4F2EC";x.lineWidth=3;x.beginPath();x.arc(M+15,M+18,14,0,7);x.stroke();x.beginPath();x.arc(M+15,M+18,6,0,7);x.stroke();
  x.font=`800 30px ${DSP}`;x.fillText("PRECISION DESIGN GROUP",M+42,M+29);
  x.fillStyle="rgba(244,242,236,.55)";x.font=`500 20px ${MONO}`;x.textAlign="right";x.fillText("SOLITAIRE",W-M,M+26);x.textAlign="left";
  x.fillStyle="#F4F2EC";x.font=`900 96px ${DSP}`;x.fillText(`${list.length} PROJECTS UNCOVERED`.toUpperCase(),M,M+140,W-2*M);
  x.fillStyle="rgba(244,242,236,.6)";x.font=`500 24px ${MONO}`;x.fillText(`I BEAT PRECISION SOLITAIRE · ${G.moves} MOVES · ${fmt(G.time)}`,M,M+182);
  /* 9 x 6 cards: the deck's covers, then the ace of spades and king of hearts */
  const cols=9,rows=6,gap=10,top0=M+214,cw=(W-2*M-(cols-1)*gap)/cols,ch=cw*1.4,r=9;
  const imgs=await Promise.all(list.map(p=>loadCors(p.image)));
  const slotsN=cols*rows;
  for(let i=0;i<slotsN;i++){const X=M+(i%cols)*(cw+gap),Y=top0+Math.floor(i/cols)*(ch+gap);
    x.save();x.shadowColor="rgba(0,0,0,.45)";x.shadowBlur=10;x.shadowOffsetY=4;rrect(x,X,Y,cw,ch,r);
    if(i<list.length){const p=list[i],im=imgs[i];x.fillStyle=p.imageBg||p.bg||"#222";x.fill();x.restore();x.save();rrect(x,X,Y,cw,ch,r);x.clip();
      if(im){const s=Math.max(cw/im.naturalWidth,ch/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;x.drawImage(im,X+(cw-w)/2,Y+(ch-h)/2,w,h)}
      else{x.fillStyle=p.fg||"#F4F2EC";x.font=`900 ${Math.round(cw*.2)}px ${DSP}`;x.textAlign="center";x.fillText(String(p.client||p.title||"").toUpperCase().slice(0,10),X+cw/2,Y+ch/2,cw-10);x.textAlign="left"}
      x.restore();x.save();rrect(x,X+5,Y+5,cw-10,ch-10,r*.7);x.strokeStyle="rgba(255,255,255,.85)";x.lineWidth=1.6;x.stroke();
      x.beginPath();x.arc(X+cw-15,Y+ch-15,7,0,7);x.fillStyle="rgba(0,0,0,.3)";x.fill();x.strokeStyle="#fff";x.lineWidth=1.5;x.stroke();x.beginPath();x.arc(X+cw-15,Y+ch-15,2.6,0,7);x.fillStyle="#fff";x.fill();x.restore()}
    else{const k=i-list.length,face=[[1,0],[13,1],[12,2],[11,3]][k%4];x.fillStyle="#F6F4EE";x.fill();x.restore();x.save();
      x.fillStyle=RED(face[1])?"#C8282D":"#141414";x.font=`900 ${Math.round(cw*.34)}px ${DSP}`;x.fillText(RANK[face[0]],X+8,Y+cw*.36);
      x.font=`${Math.round(cw*.5)}px serif`;x.textAlign="center";x.fillText(SUITS[face[1]]+"\uFE0E",X+cw/2,Y+ch*.82);x.textAlign="left";x.restore()}}
  /* call to action */
  const py=H-M-8,label="Play at precisiondesign.club";x.font=`700 30px ${BODY}`;const pw=x.measureText(label).width+60;
  x.fillStyle="#F2C649";rrect(x,M,py-50,pw,66,33);x.fill();x.fillStyle="#141414";x.fillText(label,M+30,py-6);
  x.fillStyle="rgba(244,242,236,.6)";x.font=`500 22px ${MONO}`;x.textAlign="right";x.fillText("@precisiondesigngroup",W-M,py-8);x.textAlign="left";
  return c}
async function shareDeck(list){
  if(typeof showSheet!=="function")return;
  const c=await deckCanvas(list);let blob=null;try{blob=await new Promise(r=>c.toBlob(r,"image/png"))}catch(e){}
  if(!blob)return;const name="precision-solitaire-deck.png",file=new File([blob],name,{type:"image/png"}),url=URL.createObjectURL(blob);
  const coarse=matchMedia("(pointer:coarse)").matches,canFiles=(()=>{try{return !!(navigator.canShare&&navigator.canShare({files:[file]}))}catch(e){return false}})();
  const LINK="https://precisiondesign.club/#play",text=`I beat Precision Solitaire in ${G.moves} moves and uncovered ${list.length} projects by @prcsndesigns. Your turn:`;
  const s=showSheet(`<div class="bigart"><img src="${url}" alt="Your solitaire deck"></div><div class="body">
    <div class="top"><span class="mono">Share your deck</span><button class="x" aria-label="Close">${closeIco}</button></div>
    <div><h3>Show off the win</h3></div><p>Every card in your deck, with the projects on the back. Tag <b>@precisiondesigngroup</b> when you post it.</p>
    <div class="pds-btns">${canFiles?`<button type="button" data-a="share">${shareIco}<span>Share image</span></button>`:""}<button type="button" data-a="x">${xIco}<span>Post on X</span></button><button type="button" data-a="dl">${dlIco}<span>Save image</span></button></div>
    <span class="mono note" data-m style="color:var(--muted)"></span></div>`,"deckshot");
  const m=s.querySelector("[data-m]"),dl=()=>{const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove()};
  const sh=s.querySelector('[data-a="share"]');if(sh)sh.onclick=()=>navigator.share({files:[file],text:text+" "+LINK}).then(()=>{m.textContent="Shared!";snd("save")}).catch(()=>{});
  s.querySelector('[data-a="x"]').onclick=()=>{if(coarse&&canFiles){navigator.share({files:[file],text:text+" "+LINK}).catch(()=>{});m.textContent="Pick X from the share menu.";return}
    const w=window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(LINK)}`,"_blank");if(w)try{w.opener=null}catch(_){}dl();m.textContent="Image saved. Attach it to your post on X."};
  s.querySelector('[data-a="dl"]').onclick=()=>{dl();m.textContent="Image saved."};
}

/* ---------- pointer: drag a card (and what's on it), or tap it ---------- */
let drag=null;
board.addEventListener("pointerdown",e=>{const el=e.target.closest(".pc");if(!el||!G||G.won||G.auto)return;const c=cards[el.dataset.id];if(!c)return;
  const w=where(c);if(w.kind==="stock"){drawStock();return}if(!c.up)return;if((w.kind==="waste"||w.kind==="found")&&top(w.pile)!==c)return;
  const i=w.pile.indexOf(c),list=w.pile.slice(i);board.setPointerCapture(e.pointerId);
  drag={list,from:w.pile,x:e.clientX,y:e.clientY,moved:false,id:e.pointerId}});
board.addEventListener("pointermove",e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)<6)return;drag.moved=true;
  drag.list.forEach((c,k)=>{const el=els[c.id];el.classList.add("drag");el.style.zIndex=900+k;el.style.transform=`translate(${c._x+dx}px,${c._y+dy}px) rotate(${k?0:Math.max(-4,Math.min(4,dx*.02))}deg)`})});
const endDrag=e=>{if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;d.list.forEach(c=>els[c.id].classList.remove("drag"));
  if(!d.moved){if(!autoMove(d.list[0])){const el=els[d.list[0].id];el.classList.remove("bad");void el.offsetWidth;el.classList.add("bad");layout()}return}
  const lead=d.list[0],r=board.getBoundingClientRect(),cx=lead._x+(e.clientX-d.x)+M.cw/2,cy=lead._y+(e.clientY-d.y)+M.ch/2;
  let target=null;
  if(d.list.length===1)G.found.forEach((f,i)=>{const X=M.x(3+i);if(cx>X-M.gap&&cx<X+M.cw+M.gap&&cy<M.ch+M.gap&&canFound(lead,f))target=f});
  if(!target)G.tab.forEach((t,i)=>{const X=M.x(i);if(!target&&t!==d.from&&cx>X-M.gap/2&&cx<X+M.cw+M.gap/2&&cy>M.y0-M.ch*.5&&canTab(lead,t))target=t});
  if(target&&target!==d.from){moveCards(d.list,d.from,target);snd(G.found.includes(target)?"pop":"tick")}else layout()};
board.addEventListener("pointerup",endDrag);board.addEventListener("pointercancel",endDrag);
undoBtn.onclick=()=>{if(!hist.length)return;G.auto=false;restore(hist.pop());layout();save();snd("undo")};
pv.querySelector("[data-back]").onclick=()=>{leave();renderPockets();if(typeof renderDeck==="function")renderDeck()};
pv.querySelector("[data-new]").onclick=()=>{const w=board.querySelector(".play-win");if(w)w.remove();deal()};

/* ---------- clock + saving ---------- */
const fmt=s=>Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
function save(){try{localStorage.setItem(KEY,JSON.stringify({v:1,G:{...G,auto:false,stock:G.stock,waste:G.waste,found:G.found,tab:G.tab}}))}catch(e){}}
function load(){try{const o=JSON.parse(localStorage.getItem(KEY)||"null");if(!o||o.v!==1||!o.G)return false;G=o.G;G.auto=false;hist=[];build();
  const map=c=>cards[c.id];G.stock=G.stock.map(map);G.waste=G.waste.map(map);G.found=G.found.map(f=>f.map(map));G.tab=G.tab.map(t=>t.map(map));
  all().forEach((c,i)=>{const o2=[...o.G.stock,...o.G.waste,...o.G.found.flat(),...o.G.tab.flat()].find(x=>x.id===c.id);c.up=o2.up});return true}catch(e){return false}}

/* ---------- the tabs: All + Play ---------- */
const playIco='<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>';
function enter(){if(playing)return;playing=true;
  if(typeof pcat!=="undefined"&&pcat!=="All"){pcat="All";idx=0}
  sv.hidden=true;pv.hidden=false;if(!G&&!load())deal();else{layout(true);if(G.won&&!board.querySelector(".play-win"))win()}
  document.querySelectorAll("#deck video").forEach(v=>v.pause());
  clearInterval(tick);tick=setInterval(()=>{if(G&&G.started&&!G.won&&!document.hidden){G.time++;tmEl.textContent=fmt(G.time);if(G.time%5===0)save()}},1000);tmEl.textContent=fmt(G.time||0);
  renderPockets();try{window.history.replaceState(null,"",location.pathname+location.search+"#play")}catch(e){}}
function leave(){if(!playing)return;playing=false;clearInterval(tick);pv.hidden=true;if(typeof mode!=="undefined"&&mode==="swipe")sv.hidden=false;save();
  try{if(location.hash==="#play")window.history.replaceState(null,"",location.pathname+location.search)}catch(e){}}
window.pdPlaying=()=>playing;
window.__pdSol=()=>({G,layout,after,cards});
const _rp=renderPockets;renderPockets=function(){const r=_rp.apply(this,arguments);
  if(typeof mode!=="undefined"&&mode==="swipe"){const nav=document.getElementById("pockets");if(nav){
    nav.querySelectorAll(".pocket-tab").forEach(b=>{if(b.dataset.cat!=="All")b.remove();else b.setAttribute("aria-pressed",String(!playing))});
    const b=document.createElement("button");b.className="pocket-tab";b.dataset.cat="__play";b.setAttribute("aria-pressed",String(playing));b.innerHTML=`${playIco}Play`;
    b.onclick=e=>{e.stopPropagation();enter()};nav.appendChild(b);
}}
  return r};
const _sc=setCat;setCat=function(c){if(typeof mode!=="undefined"&&mode==="swipe"&&c!=="All")c="All";if(playing&&c==="All"){leave();renderPockets();renderDeck();return}return _sc.call(this,c)};
const _sm=setMode;setMode=function(m){if(playing&&m!=="swipe")leave();return _sm.apply(this,arguments)};
/* keys that swipe the deck do nothing in the game; Z undoes a move */
addEventListener("keydown",e=>{if(!playing||document.querySelector(".scrim"))return;if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Enter"," "].includes(e.key)){e.stopImmediatePropagation();e.preventDefault()}
  if(e.key.toLowerCase()==="z"&&!e.metaKey&&!e.ctrlKey){e.stopImmediatePropagation();e.preventDefault();undoBtn.click()}},true);
/* old category picks fall back to All */
if(typeof pcat!=="undefined"&&pcat!=="All"&&typeof mode!=="undefined"){pcat="All";idx=0;try{renderDeck()}catch(e){}}
try{renderPockets()}catch(e){}
if(location.hash==="#play"&&typeof mode!=="undefined"&&mode==="swipe")enter();
})();
