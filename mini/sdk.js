/* ================= SDK / ads ================= */
/* 小游戏广告：激励视频（复活 / 跳关 / 商店 +60 金币）和插屏（关卡之间）。
 * 广告位 ID 要等开通流量主以后在后台创建，填到 AD_UNITS 里；没填的时候：
 * 复活和跳关直接免费给，商店的看广告按钮不显示，关卡之间不放插屏。 */
const AD_UNITS={
 wx:{rewarded:'',interstitial:''},   // 微信：流量主 → 广告管理 → 新建激励视频 / 插屏广告位
 tt:{rewarded:'',interstitial:''},   // 抖音：小游戏后台 → 流量主 → 广告管理
 sim:{rewarded:'sim',interstitial:'sim'}};
const UNIT=AD_UNITS[PLAT]||{};
let gpOn=false;
function gp(on){gpOn=on}
function audioOff(){adMute=true;chargeSnd(false);try{AC&&AC.suspend()}catch(e){}}
function audioOn(){adMute=false;try{AC&&AC.resume()}catch(e){}}
let RV=null,rvDone=null;
function rv(){if(RV||!UNIT.rewarded||!P.createRewardedVideoAd)return RV;try{RV=P.createRewardedVideoAd({adUnitId:UNIT.rewarded});
  RV.onClose(r=>{const f=rvDone;rvDone=null;f&&f(!r||r.isEnded!==false)});RV.onError(()=>{const f=rvDone;rvDone=null;f&&f(false)})}catch(e){RV=null}return RV}
const Ads={busy:false,has(){return !!rv()},
 rewarded(cb,btn,free){if(this.busy)return;this.busy=true;const done=ok=>{this.busy=false;audioOn();if(!ok&&free){cb(true);return}if(!ok&&btn){btn.disabled=true;showTip(T('adNo'),2.6)}cb(ok)};
  const ad=rv();if(!ad){done(false);return}
  audioOff();rvDone=done;ad.show().catch(()=>ad.load().then(()=>ad.show())).catch(()=>{if(rvDone){rvDone=null;done(false)}})}};
// interstitials: only between levels, not in the first minute, at most one every 2 minutes
let IA=null,iaLast=0;const iaBoot=Date.now();
function ia(){if(IA||!UNIT.interstitial||!P.createInterstitialAd)return IA;try{IA=P.createInterstitialAd({adUnitId:UNIT.interstitial})}catch(e){IA=null}return IA}
function adBreak(cb){const ad=plays>0&&Date.now()-iaBoot>60e3&&Date.now()-iaLast>120e3?ia():null;if(!ad){cb();return}
 let fin=false;const go=()=>{if(fin)return;fin=true;try{ad.offClose&&ad.offClose(go)}catch(e){}audioOn();cb()};
 iaLast=Date.now();audioOff();try{ad.onClose(go);ad.show().catch(go)}catch(e){go()}}
try{P.onHide&&P.onHide(()=>{document.hidden=true;if(GS.mode==='play')pause();try{AC&&AC.suspend()}catch(e){}})}catch(e){}
try{P.onShow&&P.onShow(()=>{document.hidden=false;last=performance.now();if(!adMute)try{AC&&AC.resume()}catch(e){}})}catch(e){}
// share from the capsule menu
try{P.showShareMenu&&P.showShareMenu({withShareTicket:false,menus:['shareAppMessage','shareTimeline']})}catch(e){}
try{P.onShareAppMessage&&P.onShareAppMessage(()=>({title:'踩着跳跳杆送快递，一件都不能掉！来试试《蹦蹦快递》'}))}catch(e){}
try{P.onShareTimeline&&P.onShareTimeline(()=>({title:'蹦蹦快递：一件都不能掉！'}))}catch(e){}

/* ================= input ================= */
function down(){if(GS.mode==='play'){GS.hold=true;ac()}}
function up(){GS.hold=false}
let touchN=0,gameTouch=false;
function tpos(e){const t=(e.changedTouches&&e.changedTouches[0])||(e.touches&&e.touches[0])||e;return[t.clientX!=null?t.clientX:t.x,t.clientY!=null?t.clientY:t.y]}
P.onTouchStart(e=>{touchN=(e.touches&&e.touches.length)||1;GS.inp='touch';ac();const[x,y]=tpos(e);const h=uiHit(x,y);
 if(h){UI.press=h;return}
 if(!uiModal()){gameTouch=true;down()}});
P.onTouchEnd(e=>{touchN=(e.touches&&e.touches.length)||0;const[x,y]=tpos(e);const p=UI.press;
 if(p){UI.press=null;const h=uiHit(x,y);if(h&&h.id===p.id&&h.fn){try{h.fn()}catch(err){console.error(err)}}}
 if(touchN===0&&gameTouch){gameTouch=false;up()}});
P.onTouchCancel&&P.onTouchCancel(()=>{touchN=0;UI.press=null;gameTouch=false;up()});
