const BASE=process.env.BASE||'file://'+require('path').resolve(__dirname,'..');
// usage: node tools/test-autoplay.js 0 5 47   (level indexes; the bot solves each level, then plays it in the real game loop and prints win / crash:<why>)
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.addInitScript(()=>{localStorage.setItem('pp_tb','1');localStorage.setItem('pp_mute','true')});
await p.goto(BASE+'/index.html?lang=en&lvl=1');await p.waitForTimeout(500);
const res=[];for(const lv of process.argv.slice(2).map(Number)){
 const r=await p.evaluate(i=>{const r=__pp.solve(i,{});if(!r.ok)return 'nosolve';__pp.startLevel(i);__pp.autoplay(r.plan);for(let k=0;k<60*60&&__pp.GS.mode==='play';k++)__pp.tick(1/60);return __pp.GS.mode+(__pp.GS.s.dead?':'+__pp.GS.s.dead:'')},lv);res.push((lv+1)+'='+r)}
console.log(res.join(' '));await b.close()})();
