// usage: node tools/test-endless.js [seeds=6] [platforms=160]   (serve the repo on :8765 first)
// a greedy bot plays the endless run: checks that generated platforms never dead-end
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto((process.env.URL||'http://127.0.0.1:8765/index.html')+'?lvl=0');await p.waitForTimeout(400);
const N=+process.argv[2]||6,M=+process.argv[3]||160;
for(let k=0;k<N;k++){const r=await p.evaluate(([seed,M])=>{const {mkEndless,ensure,step,newState,DT,CHARGE_T}=__pp;const L=mkEndless(seed);ensure(L,0);let s=newState(L,seed);
 const clone=s=>{const o=JSON.parse(JSON.stringify(s));o.ev=[];return o};
 const act=(s,w,c,hs,hd)=>{for(let i=0;i<Math.round(w/DT);i++){step(s,L,false);if(s.dead)return}const C=Math.max(1,Math.round(c*CHARGE_T/DT));for(let i=0;i<C;i++)step(s,L,true);step(s,L,false);let f=0;const H0=Math.round(hs/DT),H1=Math.round((hs+hd)/DT);while(s.on<0&&!s.dead&&f<700){step(s,L,f>=H0&&f<H1&&hd>0);f++}for(let i=0;i<50&&!s.dead;i++)step(s,L,false);s.ev=[]};
 let jumps=0,gaps=[],widths=[];
 while(s.lastP<M&&jumps<M*3){ensure(L,s.x);const cur=s.on;let best=null,bs=-1e9;const dogNear=L.dogs.some(d=>d[0]>s.x-100&&d[0]<s.x+700)||!!(L.plats[cur][4]||L.plats[cur+1][4]);
  for(const w of (dogNear?[0,0.5,1,1.6,2.3,3,3.8,4.6]:[0]))for(let c=0;c<=1.001;c+=(dogNear?0.05:0.025))for(const [hs,hd] of [[0,0],[0.1,0.1],[0.1,0.2],[0.2,0.2],[0.05,0.3]]){const r=clone(s);act(r,w,c,hs,hd);if(r.dead||r.on<=cur&&r.x<=s.x+5)continue;if(dogNear){const q=clone(r);for(let i=0;i<840&&!q.dead;i++)step(q,L,false);if(q.dead)continue}
   const bx=L.bull[r.on];const sc=(r.on>cur?1000:0)-(r.on>cur+1?300:0)-(bx==null?60:Math.min(150,Math.abs(r.x-bx)))-(r.lost-s.lost)*600-Math.abs(r.psi)*200-w*20;if(sc>bs){bs=sc;best=[w,c,hs,hd]}}
  if(!best)return{ok:false,at:s.lastP,x:Math.round(s.x),plat:L.plats[s.on],next:L.plats[s.on+1],wind:L.winds.slice(-1)[0],stack:s.stack.length};
  act(s,...best);jumps++}
 for(let i=1;i<=M;i++){gaps.push(L.plats[i][0]-L.plats[i-1][0]-L.plats[i-1][1]);widths.push(L.plats[i][1])}
 return{ok:true,reached:s.lastP,jumps,score:s.score,hits:s.hits,stack:s.stack.length,lost:s.lost,maxGap:Math.max(...gaps),minW:Math.min(...widths),dogs:L.dogs.length,tramps:L.tramps.length,movers:L.plats.filter(p=>p[4]).length,gold:L.gold.filter(Boolean).length,winds:L.winds.map(w=>w[2]).join('/')}},[1000+k*7919,M]);
 console.log('seed',k,JSON.stringify(r))}
console.log('errors',errs);await b.close()})();
