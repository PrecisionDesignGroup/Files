/* ---------- Swipe down to close any opened card ----------
   Phones/tablets: drag an open card down (from the top of its scroll) and let go to close it; a short drag springs back.
   Mouse: the same works by dragging the card's picture. A small grab handle shows on touch screens. */
(function(){
if(typeof showSheet!=="function"||typeof closeSheet!=="function")return;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const st=document.createElement("style");st.textContent=`
.scrim .sheet{position:relative}
.pd-grab{position:absolute;top:0;left:0;right:0;height:22px;display:flex;justify-content:center;align-items:center;z-index:6;pointer-events:none}
.pd-grab i{width:42px;height:5px;border-radius:3px;background:rgba(255,255,255,.85);box-shadow:0 1px 4px rgba(0,0,0,.35)}
@media (hover:hover) and (pointer:fine){.pd-grab{display:none}}
.scrim .sheet.pd-drag{transition:none!important;will-change:transform}
.scrim .sheet .bigart{cursor:grab}
.scrim .sheet.pd-drag .bigart{cursor:grabbing}
`;document.head.appendChild(st);

const _show=showSheet;
showSheet=function(){const s=_show.apply(this,arguments),sh=s&&s.querySelector(".sheet");
  if(sh&&!sh.querySelector(".pd-grab")){const g=document.createElement("div");g.className="pd-grab";g.setAttribute("aria-hidden","true");g.innerHTML="<i></i>";sh.prepend(g)}
  return s};

const SKIP="input,textarea,select,button,a,label,.nyp-stk img,.nlform,iframe";
/* any scrolled-down box between the finger and the sheet means the drag should scroll it instead */
function scrolled(t,sh){for(let e=t;e&&e!==sh.parentNode;e=e.parentElement){if(e.scrollTop>0&&e.scrollHeight>e.clientHeight+1)return true}return false}
let g=null;
function begin(t,x,y,mouse){
  const sh=t.closest&&t.closest(".scrim .sheet");if(!sh||!sh.parentNode.classList.contains("on"))return;
  if(t.closest(SKIP))return;
  if(mouse&&!t.closest(".bigart"))return;
  g={sh,sc:sh.parentNode,x0:x,y0:y,t0:performance.now(),dy:0,on:false,dec:false,mouse,last:[[performance.now(),y]]};
}
function move(x,y,e){
  if(!g)return;const dx=x-g.x0,dy=y-g.y0;
  if(!g.dec){if(Math.abs(dx)<8&&Math.abs(dy)<8)return;g.dec=true;
    g.on=dy>0&&Math.abs(dy)>Math.abs(dx)*1.2&&!scrolled(e.target,g.sh);
    if(!g.on){g=null;return}
    g.sh.classList.add("pd-drag");g.y0=y;}
  if(e.cancelable)e.preventDefault();
  const d=Math.max(0,y-g.y0);g.dy=d;
  g.last.push([performance.now(),y]);if(g.last.length>5)g.last.shift();
  g.sh.style.transform=`translateY(${d}px)`;
  g.sc.style.backgroundColor=`rgba(10,11,13,${Math.max(.08,.55*(1-d/(innerHeight*.8)))})`;
}
function end(){
  if(!g)return;const k=g;g=null;if(!k.on)return;if(k.dy>4)eat=performance.now();
  const a=k.last[0],b=k.last[k.last.length-1],v=(b[1]-a[1])/Math.max(1,b[0]-a[0]);  /* px per ms */
  k.sh.classList.remove("pd-drag");
  if(k.dy>Math.min(140,innerHeight*.18)||(v>.55&&k.dy>30)){
    if(typeof sfx==="function")try{sfx("soft")}catch(_){}
    if(!k.sc._fly&&!reduce){k.sh.style.transition="transform .28s cubic-bezier(.4,0,1,1)";k.sh.style.transform=`translateY(${innerHeight}px)`}
    k.sc.style.backgroundColor="";
    if(scrim===k.sc)closeSheet();
  }else{
    k.sh.style.transition="transform .38s cubic-bezier(.2,1.3,.4,1)";k.sh.style.transform="";k.sc.style.backgroundColor="";
    setTimeout(()=>{k.sh.style.transition=""},400);
  }
}
/* touch: needs a non-passive move listener so the page doesn't scroll or bounce while dragging */
document.addEventListener("touchstart",e=>{if(e.touches.length!==1){g=null;return}const t=e.touches[0];begin(e.target,t.clientX,t.clientY,false)},{passive:true});
document.addEventListener("touchmove",e=>{if(!g||g.mouse)return;const t=e.touches[0];move(t.clientX,t.clientY,e)},{passive:false});
document.addEventListener("touchend",()=>{if(g&&!g.mouse)end()});
document.addEventListener("touchcancel",()=>{if(g&&!g.mouse){g.dy=0;end()}});
/* mouse: drag the picture */
document.addEventListener("mousedown",e=>{if(e.button===0)begin(e.target,e.clientX,e.clientY,true)});
addEventListener("mousemove",e=>{if(g&&g.mouse)move(e.clientX,e.clientY,e)});
addEventListener("mouseup",()=>{if(g&&g.mouse)end()});
/* a drag shouldn't also count as a click on the picture, or start the browser's image drag */
let eat=0;
document.addEventListener("click",e=>{if(performance.now()-eat<350&&e.target.closest&&e.target.closest(".scrim .sheet")){e.stopPropagation();e.preventDefault()}},true);
document.addEventListener("dragstart",e=>{if(e.target.closest&&e.target.closest(".scrim .bigart"))e.preventDefault()});
})();
