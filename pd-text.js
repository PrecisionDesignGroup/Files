/* ---------- Copy edits on top of the main embeds ----------
   The Info sheet's opening line no longer names a city. */
(function(){
if(typeof openStudio!=="function")return;
const FIX=[[/^A Baltimore creative studio/,"A creative studio"]];
const _openStudio=openStudio;
openStudio=function(){
  const r=_openStudio.apply(this,arguments);
  const s=document.querySelector(".scrim .sheet.studio .body");
  if(s)s.querySelectorAll("p").forEach(p=>FIX.forEach(([a,b])=>{if(a.test(p.textContent))p.textContent=p.textContent.replace(a,b)}));
  return r;
};
const b=document.getElementById("openStudio");if(b)b.onclick=openStudio;
})();
