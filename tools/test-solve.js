// usage: node tools/test-solve.js [levels e.g. 0,1,2] [bull]   (serve the repo on :8765 first)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:960,height:540}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(''+(process.env.URL||'http://127.0.0.1:8765/index.html')+'?lvl=0');await p.waitForTimeout(500);
const n=await p.evaluate(()=>__pp.LEVELS.length);
const which=process.argv[2]&&process.argv[2]!=='all'?process.argv[2].split(',').map(Number):[...Array(n).keys()];const bull=!!process.argv[3],all=process.argv[3]==='allhit';
for(const i of which){const t0=Date.now();const r=await p.evaluate(([i,bull,beam,all])=>__pp.solve(i,{bull,beam,all}),[i,bull,+process.env.BEAM||5,all]);console.log('L'+(i+1),r.ok?'OK':'FAIL',r.time||'',r.lost!=null?'lost '+r.lost:'','bull '+r.hits+'/'+r.nb,'score '+r.score, r.ok?'':'stuck at x='+r.at, ((Date.now()-t0)/1000).toFixed(1)+'s');if(process.env.PLAN)console.log('   ',JSON.stringify(r.plan))}
console.log('errors',errs);await b.close()})();
