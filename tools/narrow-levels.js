// Make some ordinary rooftops narrow (levels 11+), keeping only versions the solver can still finish
// with a reasonable single-run pass rate. Prints one JSON line per level: {"i":10,"p":[[k,width],...],"par":N}
// usage: node tools/narrow-levels.js <first level index> <last level index> > out.jsonl
//        (URL=file:///.../index.html or serve the repo on :8765; the page must have an empty NARROW table)
const {chromium}=require('playwright');
const A=+process.argv[2],B=+process.argv[3];
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const p=await b.newPage();
 await p.goto((process.env.URL||'http://127.0.0.1:8765/index.html')+'?lvl=0');await p.waitForTimeout(400);
 for(let i=A;i<=B;i++){const t0=Date.now();
  const r=await p.evaluate(i=>{
   let st=(i+1)*2654435761|0;const R=()=>{st=(st+0x6D2B79F5)|0;let t=st;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
   const base=JSON.parse(JSON.stringify(__pp.LEVELS[i])),boss=!!base.boss,wet=base.rain||base.snow;
   const need0=i<40?(boss?0.15:0.3):i<90?(boss?0.12:0.25):(boss?0.1:0.2);
   const pr=(L,pl)=>__pp.robust(L,pl,0.04,60).reduce((a,q)=>a*q.ok,1);
   const evalL=L=>{__pp.prep(L,i);const r=__pp.solve(L,{});if(!r.ok||r.lost)return null;let pass=pr(L,r.plan);
    if(pass<need0){const rb=__pp.solve(L,{bull:true});if(rb.ok&&!rb.lost)pass=Math.max(pass,pr(L,rb.plan))}return{time:r.time,pass}};
   const orig=evalL(JSON.parse(JSON.stringify(base)));const need=orig?Math.min(need0,orig.pass*0.7):0;
   const inside=(x,q)=>x>=q[0]-10&&x<=q[0]+q[1]+10;
   const cand=[];base.plats.forEach((q,k)=>{if(k===0||k===base.plats.length-1||q[4]||q[1]<130)return;
    if((base.tramps||[]).some(t=>inside(t[0],q))||(base.dogs||[]).some(d=>inside(d[0],q))||(base.ropes||[]).some(r=>inside(r[0],q))||(base.fans||[]).some(f=>f[0]<q[0]+q[1]&&f[0]+f[2]>q[0]))return;cand.push(k)});
   for(let j=cand.length-1;j>0;j--){const m=R()*(j+1)|0;[cand[j],cand[m]]=[cand[m],cand[j]]}
   let pick=cand.slice(0,Math.max(1,Math.min(3,Math.round(cand.length*0.35))));if(!cand.length||!orig)return{i,p:[],par:base.par,note:orig?'no candidates':'original unsolved'};
   const widths=pick.map(k=>Math.round(Math.min(base.plats[k][1]*0.7,i<40?100+R()*25:wet?105+R()*20:80+R()*25)));
   while(pick.length){const L=JSON.parse(JSON.stringify(base));pick.forEach((k,j)=>{const q=L.plats[k],w=widths[j];q[0]+=Math.round((q[1]-w)/2);q[1]=w});
    const e=evalL(L);if(e&&e.pass>=need)return{i,p:pick.map((k,j)=>[k,widths[j]]),par:Math.max(base.par,Math.ceil(e.time*1.35+2)),pass:+e.pass.toFixed(2),orig:+orig.pass.toFixed(2)};
    pick=pick.slice(0,-1)}
   return{i,p:[],par:base.par,note:'every narrowing failed',orig:+orig.pass.toFixed(2)}},i);
  r.sec=Math.round((Date.now()-t0)/1000);console.log(JSON.stringify(r))}
 await b.close()})();
