// Generate chapters 5-15 (levels 41-150) and keep only levels the solver can finish.
// usage: node tools/gen-levels.js <chapter 5..15> [out.json]     (serve the repo on :8765 first)
// A level is kept when: the solver finishes it without dropping a parcel, and with hand-like
// timing noise (robust, 60 tries per jump) a single run succeeds often enough (>=30%, boss >=15%).
// Output: one JSON array of 10 raw levels (same format as LEVELS in index.html, with par).
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const CH=+process.argv[2];if(!(CH>=5&&CH<=15)){console.error('chapter 5..15');process.exit(1)}
const out=process.argv[3]||path.join(__dirname,'levels','ch'+CH+'.json');fs.mkdirSync(path.dirname(out),{recursive:true});

function genTry(ch,k,seed){
 let st=seed|0;const R=()=>{st=(st+0x6D2B79F5)|0;let t=st;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
 const pick=a=>a[R()*a.length|0],rr=(a,b)=>a+(b-a)*R(),PKH={box:26,frag:26,cake:24,chick:26,long:18};
 const i=(ch-1)*10+k,boss=k===9,d=Math.min(1,(i-40)/80+(boss?0.1:0)),X=ch>=10?ch-9:0,XH=Math.min(X,3),dd=d+0.08*XH; // length keeps growing with X, gap/width difficulty caps at chapter 12 // X: chapters 10+ get longer and harder
 const WX={5:{snow:1},6:{fog:1},7:{gust:1},8:{storm:1},9:{snow:1,wind:1},10:{fog:1},11:{gust:1,wind:1},13:{rain:1},14:{snow:1,wind:1}}[ch]||
  (boss?{storm:1,fog:1}:[{snow:1},{fog:1},{gust:1},{storm:1},{snow:1,fog:1},{fog:1,gust:1},{snow:1,gust:1},{storm:1},{snow:1,wind:1}][k]);
 const POOL={5:['hop','hop','tramp','dog','hover'],6:['hop','hop','rope','dog'],7:['hop','hop','fan','tramp'],8:['hop','hop','rope','tramp','dog'],
  9:['hop','hop','fan','dog','hover'],10:['hop','hover','hover','rope'],11:['hop','fan','hover','tramp'],12:['hop','hop','tramp','rope','dog','fan','hover'],
  13:['hop','hover','dog','tramp','rope'],14:['hop','hop','fan','dog','tramp'],15:['hop','hop','tramp','rope','dog','fan','hover']}[ch];
 const L={};
 if(WX.snow)L.snow=1;if(WX.fog)L.fog=1;if(WX.rain)L.rain=1;
 if(WX.storm){L.rain=1;L.storm=1;L.gust=Math.round(rr(50,80))}
 if(WX.gust)L.gust=Math.round(rr(55,85)+20*d);
 if(L.gust)L.gp=+rr(0,6.28).toFixed(2);
 if(WX.wind)L.wind=(R()<0.5?-1:1)*Math.round(rr(25,45)+20*d);
 if(ch===11)L.wind=(R()<0.5?-1:1)*Math.round(rr(20,40));
 if(ch===14){if(k%2)L.wind=(R()<0.5?-1:1)*Math.round(rr(10,22));else delete L.wind} // snow + strong wind on a pier was almost never passable
 const np=Math.min(4,2+Math.floor(d*1.6+(boss?1:0)+R()*0.8)),kinds=['frag','cake','chick'].concat(L.wind||L.gust?['long']:[]);
 L.pk=['box'];for(let q=1;q<np;q++){let t=R()<0.45?'box':pick(kinds);if(t==='cake'&&L.pk.includes('cake'))t='box';L.pk.push(t)}
 const sh=L.pk.reduce((a,t)=>a+PKH[t],0);
 const plats=[[0,Math.round(rr(220,260)),Math.round(rr(110,160))]];L.tramps=[];L.ropes=[];L.dogs=[];L.fans=[];
 const end=()=>{const p=plats[plats.length-1];return p[0]+p[1]+(p[4]||0)},top=()=>plats[plats.length-1][2],cl=v=>Math.round(Math.min(320,Math.max(60,v)));
 const nseg=(boss?Math.round(9+R()*2):Math.round(5+d*2+R()*1.5))+Math.round(Math.min(X,4)*0.7);/* chapters 13-15: +3 segments */let last='';
 for(let q=0;q<nseg;q++){let t=pick(POOL);if(t===last&&t!=='hop')t='hop';if(plats[plats.length-1][4]&&t==='hover')t='hop';last=t;
  const gap=rr(80,130),wet=L.snow?55:L.rain?35:0;
  if(t==='hop'){const g=rr(80+20*XH,150+90*dd),w=rr(200-60*dd,240-70*dd);plats.push([Math.round(end()+g),Math.round(w+wet),cl(top()+(R()-0.5)*(80+80*dd))])}
  else if(t==='hover'){const amp=Math.round(rr(38,52));plats.push([Math.round(end()+gap+amp),Math.round(rr(150,175)+wet*0.6),cl(top()+(R()-0.5)*60),0,amp,+rr(1.15,1.55).toFixed(2),+rr(0,6.28).toFixed(2)])}
  else if(t==='tramp'){const p1=[Math.round(end()+gap),190,cl(top()-60-R()*60)];plats.push(p1);L.tramps.push([p1[0]+120,60]);plats.push([p1[0]+265,250,Math.round(Math.min(360,p1[2]+215+R()*30))])}
  else if(t==='dog'){const w=Math.round(rr(400,460)),p=[Math.round(end()+gap),w,cl(top()+(R()-0.5)*60)];plats.push(p);L.dogs.push([p[0]+120,p[0]+w-120,+rr(1.0,1.5).toFixed(2)])}
  else if(t==='rope'){const w=Math.round(rr(440,520)),p=[Math.round(end()+gap),w,cl(top()+(R()-0.5)*50)];plats.push(p);L.ropes.push([p[0]+110,p[0]+w-110,Math.round(p[2]+96+sh+52+8),8])}
  else if(t==='fan'){const g=Math.round(rr(330,400)),x0=end();plats.push([x0+g,Math.round(rr(220,260)),cl(top()+(R()-0.5)*40)]);L.fans.push([x0+20,40,g-40,420,Math.round(rr(450,650))])}}
 plats.push([Math.round(end()+rr(90,150)),320,cl(top()+(R()-0.5)*60)]);
 L.plats=plats;if(boss)L.boss=1;
 const tip={5:'t_snow',6:'t_fog',7:'t_gust',8:'t_storm'}[ch];if(k===0&&tip)L.tip=tip;
 for(const key of ['tramps','ropes','dogs','fans'])if(!L[key].length)delete L[key];
 const raw=JSON.parse(JSON.stringify(L));
 __pp.prep(L,i);
 const r=__pp.solve(L,{});
 if(!r.ok||r.lost)return{ok:false,why:r.ok?'drops a parcel':'stuck at x='+Math.round(r.at)};
 const pr=pl=>__pp.robust(L,pl,0.04,60).reduce((a,q)=>a*q.ok,1);let pass=pr(r.plan);
 const need=X?(boss?0.1:0.2):(boss?0.15:0.3); // longer chapters: a lower single-run pass rate is accepted
 if(pass<need){const rb=__pp.solve(L,{bull:true});if(rb.ok&&!rb.lost)pass=Math.max(pass,pr(rb.plan))} // a safer, centre-aiming route counts too
 if(pass<need)return{ok:false,why:'pass '+pass.toFixed(2)};
 raw.par=Math.ceil(r.time*1.35+2);
 return{ok:true,L:raw,time:r.time,pass:+pass.toFixed(2),jumps:r.plan.length}}

(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const p=await b.newPage();
 await p.goto((process.env.URL||'http://127.0.0.1:8765/index.html')+'?lvl=0');await p.waitForTimeout(400);
 await p.addScriptTag({content:'window.genTry='+genTry.toString()});
 // ONLY=3,4 : generate just those levels (k = 0..9 within the chapter) into <out>.k<k>.json, for running several processes at once
 const only=process.env.ONLY?process.env.ONLY.split(',').map(Number):null;
 const res=only?[]:fs.existsSync(out)?JSON.parse(fs.readFileSync(out,'utf8')):[]; // resume
 for(const k of only||[...Array(10).keys()].slice(res.length)){let got=null;
  for(let tr=0;tr<(+process.env.TRIES||12)&&!got;tr++){const t0=Date.now();const r=await p.evaluate(([ch,k,seed])=>genTry(ch,k,seed),[CH,k,(CH*100+k)*7919+tr*104729]);
   console.log('L'+((CH-1)*10+k+1),'try',tr,r.ok?'OK time '+r.time+' pass '+r.pass+' jumps '+r.jumps:'no: '+r.why,((Date.now()-t0)/1000).toFixed(0)+'s');if(r.ok)got=r.L}
  if(!got){console.error('gave up on level',(CH-1)*10+k+1);process.exit(2)}
  if(only){fs.writeFileSync(out+'.k'+k+'.json',JSON.stringify(got));continue}
  res.push(got);fs.writeFileSync(out,JSON.stringify(res))}
 console.log('wrote',out);await b.close()})();
