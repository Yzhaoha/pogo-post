const BASE=process.env.BASE||'file://'+require('path').resolve(__dirname,'..');
// usage: node tools/test-shop.js <out prefix>   (all 5 shop tabs, buying, playing with the new cosmetics)
// Shop tabs, buying, and the new cosmetics/items in play. usage: node shop-test.js <outPrefix>
const {chromium}=require('playwright');const out=process.argv[2];
(async()=>{const b=await chromium.launch();const errs=[];
for(const [w,h] of [[1000,670],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>errs.push(String(e)));
await p.addInitScript(()=>{localStorage.setItem('pp_mute','true');localStorage.setItem('pp_lvp','[3,3,3,3,3,3]');localStorage.setItem('pp_coins','2000');localStorage.setItem('pp_air2','3');localStorage.setItem('pp_dl',JSON.stringify({d:Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5),s:1}))});
await p.goto(BASE+'/index.html?lang=zh');await p.waitForTimeout(800);
await p.click('#tShop');await p.waitForTimeout(200);
for(const [i,tab] of ['skin','pogo','trail','box','item'].entries()){await p.click(`#shopTabs .tab:nth-child(${i+1})`);await p.waitForTimeout(150);
 if(tab!=='skin'&&tab!=='item'){const bs=await p.$$('#skGrid .skb');await bs[bs.length-1].click();await p.waitForTimeout(100)}
 if(tab==='item'){await p.click('#skGrid .skb:nth-child(1)');await p.waitForTimeout(80);await p.click('#skGrid .skb:nth-child(1)');await p.waitForTimeout(100)}
 await p.screenshot({path:`${out}-${w}-${tab}.png`})}
console.log(w,'coins',await p.evaluate(()=>localStorage.getItem('pp_coins')),'inv',await p.evaluate(()=>localStorage.getItem('pp_inv')),'sel',await p.evaluate(()=>[localStorage.getItem('pp_pogo'),localStorage.getItem('pp_trail'),localStorage.getItem('pp_boxs')].join()));
if(w===1000){ // play level 5 with the rainbow pogo, rainbow trail, gold boxes and tape
 await p.evaluate(()=>{__pp.startLevel(4);__pp.GS.s.charging=false});
 await p.evaluate(()=>__pp.setHold(true));for(let k=0;k<40;k++)await p.evaluate(()=>__pp.tick(1/60));await p.evaluate(()=>__pp.setHold(false));
 for(let k=0;k<22;k++)await p.evaluate(()=>__pp.tick(1/60));await p.screenshot({path:`${out}-play.png`});
 console.log('tape armed',await p.evaluate(()=>__pp.GS.s.tape));}
await p.close()}
console.log('errors:',errs.length?errs:'none');await b.close()})();
