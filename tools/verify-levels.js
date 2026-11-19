// Re-check generated chapters with the current physics (solver + hand-noise pass rate) and refresh their par.
// usage: node tools/verify-levels.js <chapter> [--write]     (serve the repo on :8765 first)
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const CH=+process.argv[2],write=process.argv.includes('--write');
const file=path.join(__dirname,'levels','ch'+CH+'.json');const levels=JSON.parse(fs.readFileSync(file,'utf8'));
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const p=await b.newPage();
 await p.goto((process.env.URL||'http://127.0.0.1:8765/index.html')+'?lvl=0');await p.waitForTimeout(400);
 let bad=0;
 for(let k=0;k<levels.length;k++){const i=(CH-1)*10+k;
  const r=await p.evaluate(([raw,i])=>{const L=JSON.parse(JSON.stringify(raw));__pp.prep(L,i);const r=__pp.solve(L,{});if(!r.ok)return{ok:false,at:Math.round(r.at)};
   const pr=pl=>__pp.robust(L,pl,0.04,80).reduce((a,q)=>a*q.ok,1);let pass=pr(r.plan);if(pass<0.3){const rb=__pp.solve(L,{bull:true});if(rb.ok&&!rb.lost)pass=Math.max(pass,pr(rb.plan))}return{ok:true,time:r.time,lost:r.lost,pass:+pass.toFixed(2),par:Math.ceil(r.time*1.35+2)}},[levels[k],i]);
  const old=levels[k].par;if(!r.ok||r.lost)bad++;
  console.log('L'+(i+1),r.ok?'OK':'FAIL at '+r.at,r.ok?'time '+r.time+' lost '+r.lost+' pass '+r.pass+' par '+old+'->'+r.par:'');
  if(r.ok&&write)levels[k].par=r.par}
 if(write)fs.writeFileSync(file,JSON.stringify(levels));
 console.log('chapter',CH,bad?bad+' PROBLEM(S)':'all good');await b.close()})();
