/* ================= boot ================= */
TXT.zh.name='蹦蹦快递';LANG='zh';
// keep the HUD clear of the status bar and the capsule menu: the web HUD assumes the buttons sit at y=10
{const hud0=hud;hud=function(c){const off=SAFE.top-10;GS.walletXY=null;c.save();c.translate(0,off);hud0(c);c.restore();if(GS.walletXY)GS.walletXY=[GS.walletXY[0],GS.walletXY[1]+off]}}
{const render0=render;render=function(){render0();drawUI(ctx)}}
applyText();
GS.L=LEVELS[0];GS.s=newState(GS.L,1);GS.cam.x=200;GS.cam.y=100;
requestAnimationFrame(frame);
// first visit drops straight into level 1 (the tutorial)
setTimeout(()=>{if(!LP[0])startLevel(0);else goTitle()},Math.max(0,UI.splashEnd-performance.now()-300)); // after the 健康游戏忠告 screen
// browser preview only: hooks for automated checks
if(PLAT==='sim')globalThis.__mini={UI,GS,LP,store,startLevel,startEndless,openMap,openShop,goTitle,pause,showFail,onWin,die:why=>die(GS.s,why),showWinTest:()=>showWin(),tap(id){const h=UI.hits.find(h=>h.id===id);if(h)h.fn();return !!h}};
