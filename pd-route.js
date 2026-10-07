/* ---------- Shop has its own address: precisiondesign.club/shop ----------
   The site is one page. The /shop page forwards to /#shop (which opens the shop); here the address bar is kept
   in step with what's on screen: /shop while in the shop, / in the portfolio. Query strings (e.g. utm tags) are kept. */
(function(){
if(typeof setMode!=="function"||!window.history.replaceState)return;
function sync(){
  const want=mode==="wallet"?"/shop":"/";
  if(location.pathname===want&&(want==="/shop"?!location.hash:location.hash!=="#shop"))return;
  const hash=want==="/"&&location.hash&&location.hash!=="#shop"&&location.hash!=="#wallet"?location.hash:"";
  try{window.history.replaceState(window.history.state,"",want+location.search+hash)}catch(e){}
}
const _setMode=setMode;
setMode=function(){const r=_setMode.apply(this,arguments);sync();return r};
sync();
})();
