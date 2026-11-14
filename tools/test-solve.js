const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:960,height:540}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(''+(process.env.URL||'http://127.0.0.1:8765/index.html')+'?lvl=0');await p.waitForTimeout(500);
const which=process.argv[2]?process.argv[2].split(',').map(Number):[...Array(10).keys()];
for(const i of which){const t0=Date.now();const r=await p.evaluate(i=>__pp.solve(i),i);console.log('L'+(i+1),r.ok?'OK':'FAIL',r.time||'',r.lost!=null?'lost '+r.lost:'', r.ok?'':'stuck at x='+r.at, ((Date.now()-t0)/1000).toFixed(1)+'s');console.log('   ',r.plan.map(q=>`${q.w?'w'+q.w+' ':''}c${q.c} h${q.hs}+${q.hd}→${q.x}${q.lost?' L'+q.lost:''}`).join(' | '))}
console.log('errors',errs);await b.close()})();
