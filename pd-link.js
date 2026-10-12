/* ---------- PORTFOLIO: every project has its own link ----------
   Opening a project puts it in the address bar as precisiondesign.club/#p/<id>, so it can be copied, bookmarked or
   shared; visiting that link opens the project straight away. Closing it puts back whatever was there before
   (e.g. #grid). The opened project gets a Share button (the phone's share sheet, or copy link on a computer),
   and each open is sent to Google Analytics as a "view_project" event. */
(function(){
if(typeof openDetail!=="function"||typeof PROJECTS==="undefined")return;
const PRE="#p/";
let before=null;
const idOf=()=>location.hash.startsWith(PRE)?decodeURIComponent(location.hash.slice(PRE.length)):null;
const find=id=>PROJECTS.find(p=>String(p.id)===id&&!p.kind);
const setHash=h=>{try{window.history.replaceState(window.history.state,"",location.pathname+location.search+h)}catch(e){}};
const linkTo=p=>location.origin+"/"+PRE+encodeURIComponent(p.id);

const css=`.pd-sharebtn{display:inline-flex;align-items:center;justify-content:center;gap:6px}
.pd-sharebtn svg{width:13px;height:13px;flex:none}`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
const shareIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>';

function addShare(p){
  const s=document.querySelector(".scrim .sheet .actions");if(!s||s.querySelector(".pd-sharebtn"))return;
  const b=document.createElement("button");b.type="button";b.className="pill pd-sharebtn";b.innerHTML=`${shareIco}<span>Share</span>`;
  b.onclick=async()=>{
    const url=linkTo(p),title=`${p.title} · ${p.client}`;
    if(navigator.share){try{await navigator.share({title,url});return}catch(e){if(e&&e.name==="AbortError")return}}
    try{await navigator.clipboard.writeText(url);b.querySelector("span").textContent="Link copied";setTimeout(()=>{b.querySelector("span").textContent="Share"},1600)}
    catch(e){window.prompt("Copy this link",url)}
  };
  s.appendChild(b);
}

/* Some cards (ads, name-your-price) skip themselves on Next/Previous by calling openDetail again for the card
   after them; only the innermost call is the project actually shown, so an outer call that saw one does nothing. */
const _open=openDetail;let gen=0;
openDetail=function(p){
  const g=++gen,r=_open.apply(this,arguments);
  if(g!==gen)return r;
  if(p&&!p.kind&&p.id!=null){
    if(!location.hash.startsWith(PRE))before=location.hash;
    setHash(PRE+encodeURIComponent(p.id));addShare(p);
    if(typeof gtag==="function")try{gtag("event","view_project",{project_id:String(p.id),project_title:p.title,project_client:p.client})}catch(e){}
  }
  return r;
};
function restore(){if(location.hash.startsWith(PRE)){setHash(before&&!before.startsWith(PRE)?before:"");before=null}}
if(typeof closeSheet==="function"){const _c=closeSheet;closeSheet=function(){const r=_c.apply(this,arguments);restore();return r}}
if(typeof closeSheetNow==="function"){const _n=closeSheetNow;closeSheetNow=function(){const r=_n.apply(this,arguments);restore();return r}}

function fromHash(){const id=idOf();if(id==null)return;const p=find(id);
  if(!p){setHash("");return}
  if(typeof mode!=="undefined"&&mode!=="swipe"&&typeof setMode==="function")setMode("swipe");
  openDetail(p)}
addEventListener("hashchange",fromHash);
fromHash();
})();
