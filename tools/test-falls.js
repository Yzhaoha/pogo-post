const BASE=process.env.BASE||'file://'+require('path').resolve(__dirname,'..');
// usage: node tools/test-falls.js <out prefix>   (gap fall to the street, wall hit, face plant on a roof, perfect-landing coins)
// Falls: gap fall to the street, wall hit then slide down, sea splash; and perfect-landing coins. usage: node fall-test.js <outPrefix>
const {chromium}=require('playwright');const out=process.argv[2];
(async()=>{const b=await chromium.launch();const errs=[];
const page=async lv=>{const p=await b.newPage({viewport:{width:1000,height:670}});p.on('pageerror',e=>errs.push(String(e)));
 await p.addInitScript(()=>{localStorage.setItem('pp_mute','true');localStorage.setItem('pp_air2','3');localStorage.setItem('pp_coins','0')});
 await p.goto(`${BASE}/index.html?lang=zh&lvl=${lv}`);await p.waitForTimeout(500);await p.addStyleTag({content:'#tip{display:none!important}'});return p};
const tick=(p,n)=>p.evaluate(n=>{for(let i=0;i<n;i++)__pp.tick(1/60)},n);
// 1) gap fall, level 7 (no quick retry there)
let p=await page(6);
await p.evaluate(()=>{const s=__pp.GS.s,L=__pp.GS.L,a=L.plats[0],b=L.plats[1];s.on=-1;s.x=(a[0]+a[1]+b[0])/2;s.y=a[2]+30;s.vx=40;s.vy=200});
for(const [n,tag] of [[30,'a'],[30,'b'],[40,'c']]){await tick(p,n);await p.screenshot({path:`${out}-gap-${tag}.png`})}
console.log('gap:',await p.evaluate(()=>[__pp.GS.mode,__pp.GS.s.dead,Math.round(__pp.GS.s.y),__pp.GS.grounded].join(' ')));await p.close();
// 2) wall hit, level 7: start beside the second building, below its roof
p=await page(6);
await p.evaluate(()=>{const s=__pp.GS.s,L=__pp.GS.L,b=L.plats[1];s.on=-1;s.x=b[0]-8;s.y=b[2]-60;s.vx=260;s.vy=0});
for(const [n,tag] of [[20,'a'],[35,'b'],[60,'c']]){await tick(p,n);await p.screenshot({path:`${out}-wall-${tag}.png`})}
console.log('wall:',await p.evaluate(()=>[__pp.GS.mode,__pp.GS.s.dead,Math.round(__pp.GS.s.y),__pp.GS.grounded].join(' ')));await p.close();
// 3) face plant on a roof must stay on the roof
p=await page(6);
await p.evaluate(()=>{const s=__pp.GS.s,L=__pp.GS.L,b=L.plats[1];s.on=-1;s.x=b[0]+b[1]/2;s.y=b[2]+40;s.vx=0;s.vy=-300;s.th=1.3;s.om=0});
await tick(p,90);console.log('face:',await p.evaluate(()=>{const s=__pp.GS.s;return [s.dead,Math.round(s.y),__pp.GS.L.plats[1][2]].join(' ')}));await p.close();
// 4) perfect landings pay coins (bot on level 3)
p=await page(2);
await p.evaluate(()=>{const r=__pp.solve(2,{});__pp.startLevel(2);__pp.autoplay(r.plan)});
let perf=0;for(let k=0;k<60&&await p.evaluate(()=>__pp.GS.mode==='play');k++){await tick(p,30);perf=Math.max(perf,await p.evaluate(()=>__pp.GS.pfN||0))}
console.log('perfect streak seen',perf,'coins',await p.evaluate(()=>localStorage.getItem('pp_coins')),'runCoins',await p.evaluate(()=>__pp.GS.runCoins));await p.close();
console.log('errors:',errs.length?errs:'none');await b.close()})();
