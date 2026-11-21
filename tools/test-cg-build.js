const BASE=process.env.BASE||'file://'+require('path').resolve(__dirname,'..');
// usage: node tools/test-cg-build.js <out prefix>   (run python3 tools/build.py first; boots dist/crazygames with a stand-in CG SDK whose ads always fail)
// Boot the CrazyGames build with a stand-in SDK (ads always fail, like Basic Launch) and check the calls and the first screens.
const {chromium}=require('playwright');const out=process.argv[2];
const STUB=`window.__cg=[];window.CrazyGames={SDK:{init:()=>new Promise(r=>setTimeout(r,300)),
 game:{loadingStart(){__cg.push('loadingStart')},loadingStop(){__cg.push('loadingStop')},gameplayStart(){__cg.push('gameplayStart')},gameplayStop(){__cg.push('gameplayStop')},
  settings:{muteAudio:false},addSettingsChangeListener(){}},
 ad:{requestAd(t,cb){__cg.push('ad:'+t);setTimeout(()=>cb.adError&&cb.adError('disabled'),50)}},
 user:{systemInfo:{locale:'en-US'}}}};`;
(async()=>{const b=await chromium.launch();const errs=[];
for(const [w,h,tag] of [[1000,600,'desk'],[390,844,'phone']]){
 const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>errs.push(String(e)));
 await p.route('https://sdk.crazygames.com/**',r=>r.fulfill({contentType:'application/javascript',body:STUB}));
 await p.goto(BASE+'/dist/crazygames/index.html');await p.waitForTimeout(1500);
 await p.screenshot({path:`${out}-${tag}-start.png`});
 console.log(tag,'calls:',(await p.evaluate(()=>__cg)).join(','),'| title hidden:',await p.evaluate(()=>document.getElementById('title').hidden));
 // play: hold & release a few times (new player is in level 1)
 for(let j=0;j<3;j++){await p.mouse.move(w/2,h/2);await p.mouse.down();await p.waitForTimeout(420);await p.mouse.up();await p.waitForTimeout(1500)}
 await p.screenshot({path:`${out}-${tag}-play.png`});
 console.log(tag,'calls after play:',(await p.evaluate(()=>__cg)).join(','));await p.close()}
console.log('errors:',errs.length?errs:'none');await b.close()})();
