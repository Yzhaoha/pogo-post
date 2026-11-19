// Turn cover artwork into the three CrazyGames cover sizes, with the game logo on top.
// usage: node tools/make-covers.js --wide art-wide.png --tall art-tall.png --square art-square.png [--logo logo.png] [--out submission]
//   any of --wide / --tall / --square may be left out; a missing one falls back to --wide (centre-cropped)
//   --logo: a transparent PNG of the wordmark; without it the name is drawn as text in the title-screen style
//   --pos-wide / --pos-tall / --pos-square: where the logo goes, e.g. "left top" (default for wide) or "center top"
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const a=process.argv.slice(2),arg=(k,d)=>{const i=a.indexOf('--'+k);return i>=0?a[i+1]:d};
const uri=f=>{const ext=path.extname(f).slice(1).toLowerCase();return'data:image/'+(ext==='jpg'?'jpeg':ext)+';base64,'+fs.readFileSync(f).toString('base64')};
const out=arg('out','submission');fs.mkdirSync(out,{recursive:true});
const wide=arg('wide'),tall=arg('tall',wide),square=arg('square',wide),logo=arg('logo');
if(!wide&&!tall&&!square){console.error('give at least --wide <image>');process.exit(1)}
const jobs=[['wide',wide,1920,1080,arg('pos-wide','left top')],['tall',tall,800,1200,arg('pos-tall','center top')],['square',square,800,800,arg('pos-square','center top')]];
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});
 for(const [name,img,w,h,pos] of jobs){if(!img)continue;const [px,py]=pos.split(' ');
  const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
  const fs_=Math.round(Math.min(w*0.2,h*0.2)),just=px==='left'?'flex-start':px==='right'?'flex-end':'center',al=py==='bottom'?'flex-end':'flex-start';
  await p.setContent(`<style>html,body{margin:0;height:100%;overflow:hidden}
   body{background:url(${uri(img)}) center/cover no-repeat;display:flex;justify-content:${just};align-items:${al};padding:${Math.round(h*0.05)}px ${Math.round(w*0.045)}px;box-sizing:border-box;font-family:"Nunito","Trebuchet MS",system-ui,sans-serif}
   h1{margin:0;font-size:${fs_}px;line-height:.9;font-weight:900;letter-spacing:2px;color:#ffc23d;-webkit-text-stroke:${Math.max(4,fs_*0.06)}px #2b2340;paint-order:stroke fill;text-shadow:0 ${fs_*0.07}px 0 #2b2340,0 ${fs_*0.14}px ${fs_*0.2}px #0005;transform:rotate(-4deg);text-align:center}
   img{max-width:${px==='center'?70:46}%;max-height:34%;filter:drop-shadow(0 ${fs_*0.08}px ${fs_*0.12}px #0006)}</style>
   ${logo?`<img src="${uri(logo)}">`:`<h1>Pogo${w>h?' ':'<br>'}Post</h1>`}`);
  await p.waitForTimeout(300);const f=path.join(out,`cover-${w}x${h}.png`);await p.screenshot({path:f});console.log('wrote',f);await p.close()}
 await b.close()})();
