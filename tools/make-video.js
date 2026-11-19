// Record the preview videos from bot replays, frame by frame (crisp, 30 fps, no sound).
// usage: node tools/make-video.js [out dir = submission]     (serve the repo on :8765 first; needs ffmpeg)
// writes preview-1920x1080.mp4 and preview-1080x1620.mp4
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),os=require('os');
const out=process.argv[2]||'submission';fs.mkdirSync(out,{recursive:true});
const FPS=30;
// [level index, seconds to skip before recording, seconds to record]
const CLIPS=[[1,0.6,3],[45,0.8,3],[12,2.2,3],[52,0.9,3],[73,1.0,3],[30,1.2,3]]; // street, snow, fans, fog, storm, hover pads
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});
 for(const [w,h] of [[1920,1080],[1080,1620]]){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ppvid-'));let n=0;
  const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
  await p.addInitScript(()=>{localStorage.setItem('pp_tb','1');localStorage.setItem('pp_mute','true')});
  await p.goto((process.env.URL||'http://127.0.0.1:8765/index.html')+'?lang=en&lvl=1');await p.waitForTimeout(500);
  await p.addStyleTag({content:'#tip,#pauseB,#muteB{display:none!important}'});
  for(const [lv,skip,len] of CLIPS){
   const plan=await p.evaluate(i=>{const r=__pp.solve(i,{bull:true});return r.ok?r.plan:__pp.solve(i,{}).plan},lv);
   await p.evaluate(([i,pl])=>{__pp.startLevel(i);__pp.autoplay(pl);__pp.tick(0)},[lv,plan]);
   for(let k=0;k<Math.round(skip*FPS);k++)await p.evaluate(dt=>__pp.tick(dt),1/FPS);
   for(let k=0;k<Math.round(len*FPS);k++){await p.evaluate(dt=>__pp.tick(dt),1/FPS);await p.screenshot({path:path.join(dir,'f'+String(n++).padStart(5,'0')+'.png')})}
   console.log(w+'x'+h,'level',lv+1,'frames so far',n)}
  await p.close();
  const f=path.join(out,`preview-${w}x${h}.mp4`);
  execFileSync('ffmpeg',['-y','-loglevel','error','-framerate',String(FPS),'-i',path.join(dir,'f%05d.png'),'-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','slow','-movflags','+faststart','-an',f]);
  fs.rmSync(dir,{recursive:true,force:true});console.log('wrote',f,(fs.statSync(f).size/1e6).toFixed(1)+' MB',(n/FPS).toFixed(1)+' s')}
 await b.close()})();
