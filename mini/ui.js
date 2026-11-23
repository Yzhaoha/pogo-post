/* ================= UI ================= */
/* 小游戏版界面：小游戏里没有网页元素，所有面板和按钮都画在画布上。
 * 状态仍记在 $('id') 的替身对象上（hidden / textContent / disabled / onclick），
 * 所以游戏其余代码不用改；UI.draw() 每帧把当前打开的面板画出来，并登记可点区域。 */
const LAYERS=['title','mapL','shopL','pauseL','winL','failL'];
const C_O='#ff6b4a',C_Y='#ffc23d',C_G='#3fbf88',C_SEC='#8b7bd8',C_CARD='#fffdf8',C_INK='#2b2340';
const FONT='"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif';
const UI={hits:[],press:null,t0:0,win:null,fail:null,nope:null,tipAt:0};
function showLayer(id){LAYERS.forEach(l=>$(l).hidden=l!==id);if(id)$('pauseB').hidden=true;UI.t0=performance.now();UI.press=null}
function applyText(){$('muteB').textContent=muted?'🔇':'🔊'}
function goTitle(){gp(false);GS.mode='title';GS.L=LEVELS[0];GS.s=newState(GS.L,1);GS.s.stack=['box','frag','cake'].map(t=>({t,crack:0}));GS.debris=[];GS.fx=[];GS.cam.z=1;showLayer('title');$('pauseB').hidden=true;applyText();showGift()}
function goalData(){const c=nextSkinCost();return{cost:c,pct:c?Math.min(1,COINS/c):1,ready:c&&COINS>=c,left:c-COINS,daily:dailyAmt(Math.min(7,DL.s+1))}}
function showWin(){hideTip();const r=GS.result,L=GS.L;
 [0,1,2].forEach(k=>{if(k<r.st)setTimeout(()=>SFX.star(k),150+k*250)});
 const chips=[[T('st1'),1],[T('st2'),!r.lost],[T('st3',{n:L.par})+' · '+T('time',{n:r.time.toFixed(1)}),r.time<=L.par]].map(([t,on])=>({t:(on?'★ ':'☆ ')+t,on,coin:0}));
 chips.push({t:'+'+r.coins,on:1,coin:1});if(r.nb)chips.push({t:'🎯 '+r.hits+'/'+r.nb,on:r.hits>=r.nb,coin:0});
 UI.win={st:r.st,quip:pickQ(r.lost?'q_drop':'q_win'),chips,goal:goalData()};
 const last=L.i>=LEVELS.length-1;$('wNext').textContent=last?T('allDone'):T('next');$('wNext').disabled=false;showLayer('winL');autoNext(last)}
function showFail(){hideTip();$('fRevive').disabled=$('fSkip').disabled=false;
 UI.fail={quip:GS.quip,endless:!!GS.L.endless,score:GS.endScore,best:EB,newBest:GS.newBest,coins:GS.endCoins||0};
 $('fMap').textContent=GS.L.endless?T('back'):T('levels');const fr=$('fRevive');fr.hidden=GS.revived||!GS.s.safe||GS.s.safe.on===0&&GS.s.jumps<2;
 $('fSkip').hidden=failsHere<3||GS.L.i>=LEVELS.length-1;showLayer('failL')}
$('wNext').onclick=()=>{clearInterval(GS.anT);const i=GS.L.i;if(i>=LEVELS.length-1){openMap();return}adBreak(()=>startLevel(i+1))};
function autoNext(last){clearInterval(GS.anT);if(last)return;let n=4;const b=$('wNext'),lab=T('next');b.textContent=lab+' ('+n+')';GS.anT=setInterval(()=>{if($('winL').hidden){clearInterval(GS.anT);return}n--;if(n<=0){clearInterval(GS.anT);b.click()}else b.textContent=lab+' ('+n+')'},1000)}
$('wRetry').onclick=()=>{clearInterval(GS.anT);adBreak(()=>startLevel(GS.L.i))};$('wMap').onclick=()=>{clearInterval(GS.anT);openMap()};
$('fRetry').onclick=()=>adBreak(restart);$('fMap').onclick=()=>{if(GS.L.endless)goTitle();else openMap()};
$('fRevive').onclick=()=>Ads.rewarded(ok=>{if(ok)revive()},$('fRevive'),true);
$('fSkip').onclick=()=>Ads.rewarded(ok=>{if(!ok)return;const i=GS.L.i;if(!LP[i]){LP[i]=0.5;store.set('lvp',LP)}failsHere=0;startLevel(i+1)},$('fSkip'),true);
let mapCh=0;
function openMap(ch){gp(false);if(ch!=null)mapCh=ch;else mapCh=Math.min(CHAPTERS-1,curLevel()/PER|0);GS.mode=GS.mode==='play'?'paused':GS.mode;showLayer('mapL')}
$('mapBack').onclick=()=>goTitle();$('gOk').onclick=()=>{$('giftL').hidden=true};
let shopTab='skin';
function buyFx(id){tone(180,120,0.15,'square',0.06);UI.nope={id,t:performance.now()}}
function openShop(){gp(false);if(!Ads.busy)$('sAd').disabled=false;$('sAd').hidden=!Ads.has();showLayer('shopL')}
$('tShop').onclick=()=>{SFX.click();openShop()};$('sBack').onclick=()=>goTitle();$('sAd').onclick=()=>Ads.rewarded(ok=>{if(ok){addCoins(60);SFX.star(1);openShop()}},$('sAd'));
$('tPlay').onclick=()=>{SFX.click();startLevel(curLevel())};$('tMap').onclick=()=>openMap();$('tEnd').onclick=()=>{SFX.click();startEndless()};
function pause(){if(GS.mode!=='play')return;GS.mode='paused';GS.hold=false;chargeSnd(false);gp(false);$('pSub').textContent=GS.L.endless?T('endless'):T('lvN',{n:GS.L.i+1});showLayer('pauseL')}
function resume(){if(GS.mode!=='paused')return;GS.mode='play';GS.s.needRel=true;showLayer(null);$('pauseB').hidden=false;gp(true)}
$('pauseB').onclick=()=>pause();$('pGo').onclick=resume;$('pRetry').onclick=restart;$('pMap').onclick=()=>openMap();
$('muteB').onclick=()=>{muted=!muted;store.set('mute',muted);applyText();if(muted)chargeSnd(false)};
let tipT=0;function showTip(t,d){const e=$('tip');e.textContent=t;e.hidden=false;UI.tipAt=performance.now();tipT=d||0}
function hideTip(){$('tip').hidden=true;tipT=0}

/* ---------- drawing helpers ---------- */
const ui={
 font(sz,w){return(w||900)+' '+sz+'px '+FONT},
 text(c,s,x,y,o){o=o||{};c.font=ui.font(o.size||16,o.weight);c.textAlign=o.align||'center';c.textBaseline='middle';
  if(o.stroke){c.lineJoin='round';c.lineWidth=o.sw||4;c.strokeStyle=o.stroke;c.strokeText(s,x,y)}c.fillStyle=o.color||C_INK;c.fillText(s,x,y)},
 // split text into lines that fit maxW (works for Chinese: breaks between any two characters, keeps latin words together)
 wrap(c,s,maxW,size,w){c.font=ui.font(size,w);const out=[];let line='';const toks=String(s).match(/[A-Za-z0-9'’.,!?%-]+|\s+|./gu)||[];
  for(const t of toks){const nx=line+t;if(line&&c.measureText(nx).width>maxW){out.push(line.trim());line=t.trim()}else line=nx}if(line.trim())out.push(line.trim());return out},
 panel(c,x,y,w,h){c.save();c.fillStyle='rgba(0,0,0,0.13)';rr(c,x,y+14,w,h+4,26);c.fill();c.fillStyle=C_INK;rr(c,x,y+8,w,h,26);c.fill();
  c.fillStyle=C_CARD;c.strokeStyle=C_INK;c.lineWidth=4;rr(c,x,y,w,h,26);c.fill();c.stroke();c.restore()},
 dim(c,a){c.fillStyle='rgba(43,35,64,'+(a==null?0.33:a)+')';c.fillRect(0,0,CW,CH)},
 hit(id,x,y,w,h,fn){UI.hits.push({id,x,y,w,h,fn})},
 // a chunky button like the web version's .btn
 btn(c,id,x,y,w,h,o){const off=!!o.disabled,pr=UI.press&&UI.press.id===id&&!off,dy=pr?3:0,r=o.r||16;c.save();if(off)c.globalAlpha=0.45;
  c.fillStyle=C_INK;rr(c,x,y+(pr?3:5),w,h,r);c.fill();c.fillStyle=o.bg||C_O;c.strokeStyle=C_INK;c.lineWidth=3;rr(c,x,y+dy,w,h,r);c.fill();c.stroke();
  const fg=o.fg||'#fff',cy=y+dy+h/2;
  if(o.small){ui.text(c,o.label,x+w/2,cy-9,{size:o.fs||21,color:fg});ui.text(c,o.small,x+w/2,cy+13,{size:13,weight:800,color:fg})}
  else if(o.coin!=null){c.font=ui.font(o.fs||17);const t1=o.label+' · ',t2=''+o.coin,w1=c.measureText(t1).width,w2=c.measureText(t2).width,cr=(o.fs||17)*0.42,tw=w1+cr*2+4+w2;let tx=x+w/2-tw/2;
   ui.text(c,t1,tx,cy,{size:o.fs||17,color:fg,align:'left'});tx+=w1+cr;coinIcon(c,tx,cy,cr);ui.text(c,t2,tx+cr+4,cy,{size:o.fs||17,color:fg,align:'left'})}
  else ui.text(c,o.label,x+w/2,cy,{size:o.fs||21,color:fg});
  c.restore();if(!off)ui.hit(id,x,y,w,h+5,o.fn||(()=>$(id).click()))},
 star(c,x,y,r,on,sc){c.save();c.translate(x,y);c.scale(sc,sc);c.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr2=k%2?r*0.45:r;c.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2)}c.closePath();
  c.lineJoin='round';c.lineWidth=3;c.strokeStyle=C_INK;c.fillStyle=on?C_Y:'#e6dff0';c.fill();c.stroke();c.restore()}
};
const ease=k=>k<=0?0:k>=1?1:1-Math.pow(1-k,3);
const popS=k=>k<=0?0.2:k<0.7?0.2+1.05*(k/0.7):k<1?1.25-0.25*((k-0.7)/0.3):1;

/* ---------- shop icons (canvas copies of the web version's SVG icons, 40-wide box) ---------- */
function rrp(c,x,y,w,h,r,fill,lw){rr(c,x,y,w,h,Math.min(r,w/2,h/2));if(fill){c.fillStyle=fill;c.fill()}if(lw!==0){c.lineWidth=lw||2;c.stroke()}}
function circ(c,x,y,r,fill,lw){c.beginPath();c.arc(x,y,r,0,7);if(fill){c.fillStyle=fill;c.fill()}if(lw!==0){c.lineWidth=lw||2;c.stroke()}}
function poly(c,pts,fill){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill()}c.lineWidth=2;c.stroke()}
function dome(c,col){c.beginPath();c.moveTo(10,11);c.arc(20,11,10,Math.PI,0);c.closePath();c.fillStyle=col;c.fill();c.lineWidth=2;c.stroke()}
function iconSkin(c,k){const q=SKINS[k];c.strokeStyle=C_INK;c.lineJoin='round';
 rrp(c,18,30,4,26,2,q.pg);rrp(c,8,47,24,5,2,'#c9d3e6');rrp(c,13,38,5,10,2,q.lg);rrp(c,22,38,5,10,2,q.lg);rrp(c,9,21,22,20,7,q.jk);
 c.beginPath();c.moveTo(11,24);c.lineTo(28,39);c.strokeStyle=q.st;c.lineWidth=2.5;c.stroke();c.strokeStyle=C_INK;
 rrp(c,15,28,9,6,2,q.pk,1.5);c.beginPath();c.ellipse(11.5,14,4,6.5,0,0,7);c.fillStyle='#7a4526';c.fill();c.lineWidth=2;c.stroke();
 circ(c,20,12,10,'#ffd2b0');c.beginPath();c.moveTo(10,11);c.arc(20,11,10,Math.PI,0);c.quadraticCurveTo(25,7,21,10);c.quadraticCurveTo(16,7,10,11);c.closePath();c.fillStyle='#7a4526';c.fill();c.stroke();
 if(q.hat==='band'){rrp(c,9.5,5.5,21,5,2.5,q.cap);rrp(c,1,6,9,3.5,1.7,q.cap)}
 else if(q.hat==='crown')poly(c,[[10,9],[10,0],[15,5],[20,-1],[25,5],[30,0],[30,9]],q.cap);
 else if(q.hat==='beanie'){dome(c,q.cap);rrp(c,9,7.5,22,5,2.5,q.pk)}
 else if(q.hat==='helmet'){dome(c,q.cap);c.fillStyle='#fff';c.fillRect(18.5,2,3,8);rrp(c,8,8.5,24,4,2,q.cap)}
 else{dome(c,q.cap);rrp(c,23,8,13,4.5,2.2,q.cap)}
 circ(c,17,15,1.6,C_INK,0);circ(c,24,15,1.6,C_INK,0)}
function iconOf(c,tab,q){c.strokeStyle=C_INK;c.lineJoin='round';c.lineCap='round';
 if(tab==='pogo'){let col=q.col||'#ff4f6d';if(q.rb){col=c.createLinearGradient(0,0,0,58);col.addColorStop(0,'#ff4f6d');col.addColorStop(0.5,'#ffc23d');col.addColorStop(1,'#3d7bff')}
  rrp(c,8,6,24,5,2.5,col);rrp(c,17,6,6,36,3,col);c.beginPath();[44,48,52].forEach(y=>{c.moveTo(14,y);c.lineTo(26,y)});c.lineWidth=2;c.stroke();rrp(c,17,52,6,5,2,'#c9d3e6');return}
 if(tab==='trail'){const k=q.k;
  if(k==='star')poly(c,[[20,8],[24,17],[33,18],[26,24],[28,33],[20,28],[12,33],[14,24],[7,18],[16,17]],'#ffc23d');
  else if(k==='heart'){c.beginPath();c.moveTo(20,40);c.bezierCurveTo(4,28,8,14,20,22);c.bezierCurveTo(32,14,36,28,20,40);c.closePath();c.fillStyle='#ff5d8f';c.fill();c.lineWidth=2;c.stroke()}
  else if(k==='bub'){c.strokeStyle='#7fc0ff';circ(c,16,22,8,null,3);circ(c,27,34,5,null,3)}
  else if(k==='conf'){[[8,14,'#ff4f6d'],[22,10,'#3fbf88'],[14,28,'#3d7bff'],[26,30,'#ffc23d']].forEach(([x,y,f])=>{c.fillStyle=f;c.fillRect(x,y,8,5)})}
  else if(k==='spark'){c.beginPath();c.moveTo(20,6);c.lineTo(20,46);c.moveTo(2,26);c.lineTo(38,26);c.strokeStyle='#ffc23d';c.lineWidth=4;c.stroke();c.strokeStyle=C_INK;circ(c,20,26,6,'#fff6c9')}
  else if(k==='rb'){[[10,30,5,'#ff4f6d'],[18,22,5,'#ffc23d'],[26,16,5,'#3fbf88'],[33,10,4,'#3d7bff']].forEach(([x,y,r,f])=>circ(c,x,y,r,f,0))}
  else{c.save();c.setLineDash&&c.setLineDash([3,4]);c.beginPath();c.moveTo(10,40);c.lineTo(30,12);c.strokeStyle='#bbb';c.lineWidth=3;c.stroke();c.restore()}return}
 if(tab==='box'){rrp(c,4,12,32,28,3,q.f);c.fillStyle=q.t;if(q.pz){c.beginPath();c.arc(20,26,6,0,7);c.fill()}else c.fillRect(17,13,6,26);if(q.rib)c.fillRect(5,23,30,5);c.fillStyle='rgba(255,255,255,0.53)';c.fillRect(8,16,7,5);return}
 if(tab==='item'){if(q.id==='tape'){circ(c,20,25,14,'#d9c9a3');circ(c,20,25,6,'#fff');c.beginPath();c.moveTo(32,30);c.lineTo(38,34);c.lineWidth=2;c.stroke()}
  else{circ(c,20,25,13,'#fff');c.beginPath();c.moveTo(20,8);c.lineTo(20,42);c.moveTo(3,25);c.lineTo(37,25);c.lineWidth=2;c.stroke();circ(c,20,25,4,'#ff4f6d')}}}

/* ---------- screens ---------- */
function bottomY(){return SAFE.bottom-10}
function drawTitle(c,now){const k=ease((now-UI.t0)/400);c.save();
 const name=T('name'),fs=Math.min(92,Math.max(46,CW*0.15));c.translate(CW/2,SAFE.top+40+fs*0.5);c.rotate(-4*Math.PI/180);
 c.font=ui.font(fs);c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.fillStyle='rgba(0,0,0,0.2)';c.fillText(name,0,12);
 c.fillStyle=C_INK;c.fillText(name,0,6);c.lineWidth=6;c.strokeStyle=C_INK;c.strokeText(name,0,0);c.fillStyle=C_Y;c.fillText(name,0,0);c.restore();
 // subtitle pill
 const tag=T('tag');c.font=ui.font(14,800);const tw=c.measureText(tag).width+28,ty=SAFE.top+40+fs*1.15;
 c.save();c.fillStyle=C_INK;rr(c,CW/2-tw/2,ty+3,tw,26,13);c.fill();c.fillStyle=C_CARD;c.strokeStyle=C_INK;c.lineWidth=3;rr(c,CW/2-tw/2,ty,tw,26,13);c.fill();c.stroke();c.restore();
 ui.text(c,tag,CW/2,ty+13,{size:14,weight:800});
 // buttons at the bottom
 const w=Math.min(400,CW-32),x=CW/2-w/2,gift=T('dailyNext',{n:dailyAmt(Math.min(7,DL.s+1))});let y=bottomY()-26-(65+10)*2-(44+5)+(1-k)*60;
 c.save();c.globalAlpha=k;
 ui.btn(c,'tPlay',x,y,w,60,{label:T('play'),small:T('lvN',{n:curLevel()+1})});y+=75;
 ui.btn(c,'tEnd',x,y,w,EB?60:50,{label:T('endless'),small:EB?T('best',{n:EB}):null,bg:C_Y,fg:C_INK});y+=(EB?60:50)+15;
 const hw=(w-10)/2;ui.btn(c,'tMap',x,y,hw,40,{label:T('levels'),bg:C_SEC,fs:17});ui.btn(c,'tShop',x+hw+10,y,hw,40,{label:T('shop'),coin:COINS,bg:C_SEC,fs:17});
 ui.text(c,'🎁 '+gift,CW/2,y+66,{size:13,weight:800,color:C_INK,stroke:'rgba(255,253,248,0.8)',sw:4});c.restore()}
function drawPanelLayer(c,h,fn,dim){if(dim!==false)ui.dim(c);const w=Math.min(400,CW-32),x=CW/2-w/2,y=Math.max(SAFE.top,(CH-h)/2);ui.panel(c,x,y,w,h);fn(x+20,y+20,w-40)}
function drawPause(c){drawPanelLayer(c,212,(x,y,w)=>{ui.text(c,T('paused'),x+w/2,y+16,{size:26});ui.text(c,$('pSub').textContent,x+w/2,y+48,{size:15,weight:800,color:'rgba(43,35,64,0.75)'});
 ui.btn(c,'pGo',x,y+70,w,48,{label:T('resume')});const hw=(w-10)/2;ui.btn(c,'pRetry',x,y+130,hw,40,{label:T('retry'),bg:C_SEC,fs:17});ui.btn(c,'pMap',x+hw+10,y+130,hw,40,{label:T('levels'),bg:C_SEC,fs:17})})}
function chipsLayout(c,chips,w){c.font=ui.font(13);const rows=[[]];let rw=0;chips.forEach(ch=>{ch.w=c.measureText(ch.t).width+20+(ch.coin?16:0);if(rw+ch.w>w&&rows[rows.length-1].length){rows.push([]);rw=0}rows[rows.length-1].push(ch);rw+=ch.w+6});return rows}
function drawWin(c,now){const d=UI.win;if(!d)return;const age=(now-UI.t0)/1000;const w0=Math.min(400,CW-32)-40;
 const ql=ui.wrap(c,d.quip,w0,17),rows=chipsLayout(c,d.chips,w0),g=d.goal;const h=20+34+62+ql.length*22+8+rows.length*30+(g.cost?24:0)+22+12+56+52+16;
 drawPanelLayer(c,h,(x,y,w)=>{ui.text(c,T('win'),x+w/2,y+16,{size:26});let yy=y+40;
  for(let k=0;k<3;k++){const t=age-(0.1+k*0.25),on=k<d.st;ui.star(c,x+w/2+(k-1)*58,yy+28,25,on&&t>0,on?popS(t/0.45):1)}yy+=62;
  ql.forEach(l=>{ui.text(c,l,x+w/2,yy+11,{size:17,color:'#8b5cf6'});yy+=22});yy+=8;
  rows.forEach(r=>{let rw=r.reduce((a,ch)=>a+ch.w+6,-6),cx=x+w/2-rw/2;r.forEach(ch=>{c.fillStyle=ch.on?'#ffe08a':'#f1ecf6';rr(c,cx,yy,ch.w,24,12);c.fill();
   if(ch.coin){coinIcon(c,cx+16,yy+12,6.5);ui.text(c,ch.t,cx+26,yy+12.5,{size:13,align:'left'})}else ui.text(c,ch.t,cx+ch.w/2,yy+12.5,{size:13});cx+=ch.w+6});yy+=30});
  if(g.cost){if(g.ready)ui.text(c,T('skinReady'),x+w/2,yy+10,{size:14,color:C_O});else{const s=T('skinNext',{n:g.left});c.font=ui.font(14,800);const sw=c.measureText(s).width,bw=70,tx=x+w/2-(sw+8+bw)/2;
    ui.text(c,s,tx,yy+10,{size:14,weight:800,align:'left'});const bx=tx+sw+8;c.save();c.fillStyle='#fff';c.strokeStyle=C_INK;c.lineWidth=2;rr(c,bx,yy+6,bw,8,4);c.fill();c.stroke();c.fillStyle=C_Y;if(g.pct>0){rr(c,bx+1,yy+7,Math.max(6,(bw-2)*g.pct),6,3);c.fill()}c.restore()}yy+=24}
  ui.text(c,'🎁 '+T('dailyNext',{n:g.daily}),x+w/2,yy+10,{size:14,weight:800});yy+=34;
  ui.btn(c,'wNext',x,yy,w,48,{label:$('wNext').textContent});yy+=60;const hw=(w-10)/2;ui.btn(c,'wRetry',x,yy,hw,40,{label:T('retry'),bg:C_SEC,fs:17});ui.btn(c,'wMap',x+hw+10,yy,hw,40,{label:T('levels'),bg:C_SEC,fs:17})},false)}
function drawFail(c){const d=UI.fail;if(!d)return;const w0=Math.min(400,CW-32)-40,ql=ui.wrap(c,d.quip,w0,17);
 const bts=[['fRetry',T('retry'),C_O,'#fff',48]];if(!$('fRevive').hidden)bts.push(['fRevive',T('revive'),C_G,'#fff',44]);if(!$('fSkip').hidden)bts.push(['fSkip',T('skip'),C_Y,C_INK,44]);bts.push(['fMap',$('fMap').textContent,C_SEC,'#fff',40]);
 const h=20+34+ql.length*22+10+(d.endless?32:0)+bts.reduce((a,b)=>a+b[4]+12,0)+12;
 drawPanelLayer(c,h,(x,y,w)=>{ui.text(c,T('fail'),x+w/2,y+16,{size:26});let yy=y+40;ql.forEach(l=>{ui.text(c,l,x+w/2,yy+11,{size:17,color:'#8b5cf6'});yy+=22});yy+=10;
  if(d.endless){const s=T('pts',{n:d.score})+'  ·  '+(d.newBest?'🏆 '+T('newBest'):T('best',{n:d.best}))+(d.coins?'  ·  +'+d.coins:'');ui.text(c,s,x+w/2,yy+12,{size:18,color:C_O});yy+=32}
  bts.forEach(([id,lab,bg,fg,bh])=>{ui.btn(c,id,x,yy,w,bh,{label:lab,bg,fg,fs:bh>44?21:17,disabled:$(id).disabled});yy+=bh+12})},false)}
function drawMap(c,now){const w=Math.min(440,CW-32),gw=w-40,cell=(gw-8*4)/5,h=20+34+50+26+cell*2+8+24+52+10;
 ui.dim(c);const x0=CW/2-w/2,y0=Math.max(SAFE.top,(CH-h)/2);ui.panel(c,x0,y0,w,h);const x=x0+20;let y=y0+20;
 ui.text(c,T('levels'),CW/2,y+16,{size:26});y+=40;
 const open=lvOpen(mapCh*PER);
 const tab=(id,tx,tw,label,o)=>{const pr=UI.press&&UI.press.id===id;c.save();if(o.off)c.globalAlpha=0.3;c.fillStyle=o.bg||'#fff';c.strokeStyle=C_INK;c.lineWidth=3;rr(c,tx,y,tw,42,12);c.fill();c.stroke();
  if(o.sub){ui.text(c,o.sub,tx+tw/2,y+12,{size:11,weight:800,color:'rgba(43,35,64,0.7)'});ui.text(c,label,tx+tw/2,y+29,{size:16})}else ui.text(c,label,tx+tw/2,y+21+(pr?1:0),{size:18});c.restore();if(o.fn&&!o.off)ui.hit(id,tx,y,tw,42,o.fn)};
 tab('mPrev',x,52,'◀',{off:mapCh===0,fn:()=>{SFX.click();openMap(mapCh-1)}});
 tab('mMid',x+58,gw-116,(open?'':'🔒 ')+T('ch'+(mapCh+1)),{sub:T('chapN',{n:mapCh+1}),bg:C_Y});
 tab('mNext',x+gw-52,52,'▶',{off:mapCh===CHAPTERS-1,fn:()=>{SFX.click();openMap(mapCh+1)}});y+=50;
 const tot=LP.reduce((a,b)=>a+(b>=1?b:0),0);ui.text(c,'⭐ '+tot+' / '+LEVELS.length*3,CW/2,y+11,{size:15,weight:800,color:'rgba(43,35,64,0.75)'});y+=26;
 const cur=curLevel();
 for(let j=0;j<PER;j++){const i=mapCh*PER+j,L=LEVELS[i],cx=x+(j%5)*(cell+8),cy=y+(j/5|0)*(cell+8);
  const op=L&&lvOpen(i),st=L&&LP[i]>=1?LP[i]:0,isCur=L&&i===cur&&!LP[i],id='lv'+i,pr=UI.press&&UI.press.id===id;
  const sc=isCur?1+0.06*(0.5-0.5*Math.cos(now/1000*Math.PI*2)):1;c.save();c.translate(cx+cell/2,cy+cell/2);c.scale(sc,sc);c.translate(-cell/2,-cell/2+(pr?3:0));
  const lockC='#b9add0';c.fillStyle=op?C_INK:lockC;rr(c,0,pr?1:4,cell,cell,14);c.fill();
  c.fillStyle=!op?'#eee8f2':isCur?'#ffd8cc':L.boss?'#ffe9b0':'#fff';c.strokeStyle=op?C_INK:lockC;c.lineWidth=3;rr(c,0,0,cell,cell,14);c.fill();c.stroke();
  if(!L){ui.text(c,'🔒',cell/2,cell*0.38,{size:16});ui.text(c,T('soon'),cell/2,cell*0.7,{size:10,weight:800,color:lockC})}
  else if(!op)ui.text(c,'🔒',cell/2,cell/2,{size:18});
  else{ui.text(c,(L.boss?'👑':'')+(i+1),cell/2,cell*0.42,{size:L.boss?15:20});ui.text(c,'★'.repeat(st)+'☆'.repeat(3-st),cell/2,cell*0.74,{size:11,color:'#e0a000'});if(BA[i])ui.text(c,'🎯',cell-2,2,{size:14})}
  c.restore();if(op)ui.hit(id,cx,cy,cell,cell+4,()=>{SFX.click();startLevel(i)})}
 y+=cell*2+8+12;ui.btn(c,'mapBack',x,y,gw,40,{label:T('back'),bg:C_SEC,fs:17})}
function drawShop(c,now){const w=Math.min(440,CW-32),gw=w-40,items=shopTab==='item',cols=items?2:4,list=shopTab==='skin'?SKINS.map((q,k)=>k).sort((a,b)=>SKINS[a].c-SKINS[b].c):items?ITEMS:COS[shopTab].list;
 const ch=items?150:84,rows=Math.ceil(list.length/cols),showAd=!$('sAd').hidden,h=20+34+26+44+rows*(ch+8)+(showAd?58:0)+52+10;
 ui.dim(c);const x0=CW/2-w/2,y0=Math.max(SAFE.top,(CH-h)/2);ui.panel(c,x0,y0,w,h);const x=x0+20;let y=y0+20;
 ui.text(c,T('shop'),CW/2,y+16,{size:26});y+=38;c.font=ui.font(15,800);const cw=c.measureText(''+COINS).width;coinIcon(c,CW/2-cw/2-6,y+10,7);ui.text(c,''+COINS,CW/2+8,y+10,{size:15,weight:800});y+=26;
 const tabs=[['skin','tabSkin'],['pogo','tabPogo'],['trail','tabTrail'],['box','tabBox'],['item','tabItem']],tw=(gw-4*6)/5;
 tabs.forEach(([id,key],k)=>{const tx=x+k*(tw+6);c.fillStyle=shopTab===id?C_Y:'#fff';c.strokeStyle=C_INK;c.lineWidth=3;rr(c,tx,y,tw,34,12);c.fill();c.stroke();ui.text(c,T(key),tx+tw/2,y+17,{size:tw<62?12:13});
  ui.hit('tab'+id,tx,y,tw,34,()=>{SFX.click();shopTab=id;UI.nope=null})});y+=44;
 const cwid=(gw-8*(cols-1))/cols,buy=(id,cost,ok)=>{if(COINS<cost){buyFx(id);return false}COINS-=cost;store.set('coins',COINS);ok();return true};
 list.forEach((q0,j)=>{const cx=x+(j%cols)*(cwid+8),cy=y+(j/cols|0)*(ch+8),id='sk'+shopTab+j,pr=UI.press&&UI.press.id===id;
  let own,sel,cost,icon,fn;
  if(shopTab==='skin'){const k=q0,q=SKINS[k];own=!!OWN[k];sel=k===SKI;cost=q.c;icon=()=>iconSkin(c,k);
   fn=()=>{if(!OWN[k]){if(!buy(id,q.c,()=>{OWN[k]=1;store.set('own',OWN);SFX.star(2)}))return}else SFX.click();SKI=k;SK=SKINS[k];store.set('skin',k)}}
  else if(items){const q=q0;cost=q.c;icon=()=>iconOf(c,'item',q);fn=null}
  else{const C=COS[shopTab],k=j,q=q0;own=!!C.own[k];sel=k===C.sel;cost=q.c;icon=()=>shopTab==='pogo'&&k===0?iconOf(c,'pogo',{col:SK.pg}):iconOf(c,shopTab,q);
   fn=()=>{if(!C.own[k]){if(!buy(id,q.c,()=>{C.own[k]=1;store.set('own'+C.k,C.own);SFX.star(2)}))return}else SFX.click();C.sel=k;store.set(shopTab==='box'?'boxs':shopTab,k)}}
  const nope=UI.nope&&UI.nope.id===id?(now-UI.nope.t)/300:1,shx=nope<1?Math.sin(nope*Math.PI*4)*4:0;
  c.save();c.translate(cx+shx,cy+(sel?-2:0)+(pr?3:0));c.fillStyle=C_INK;rr(c,0,pr?1:4,cwid,ch,14);c.fill();c.fillStyle=sel?'#ffe08a':own?'#eef9f3':'#fff';c.strokeStyle=C_INK;c.lineWidth=3;rr(c,0,0,cwid,ch,14);c.fill();c.stroke();
  if(items){const q=q0,on=USE[q.id];c.save();c.translate(cwid/2-20,4);icon();c.restore();
   ui.text(c,T(q.id==='tape'?'itTape':'itScope'),cwid/2,62,{size:14});
   ui.wrap(c,T(q.id==='tape'?'itTapeD':'itScopeD'),cwid-12,11,800).slice(0,2).forEach((l,n)=>ui.text(c,l,cwid/2,79+n*14,{size:11,weight:800,color:'rgba(43,35,64,0.75)'}));
   ui.text(c,T('have',{n:INV[q.id]||0}),cwid/2,110,{size:11,weight:800,color:'rgba(43,35,64,0.75)'});
   c.font=ui.font(14);const pw=c.measureText(''+q.c).width;coinIcon(c,cwid/2-pw/2-6,128,6);ui.text(c,''+q.c,cwid/2+6,128,{size:14});
   // the 使用中 / 不用 pill toggles; the rest of the card buys one more
   const ul=T(on?'useOn':'useOff');c.font=ui.font(11);const uw=c.measureText(ul).width+16;c.fillStyle=on?C_G:'#fff';c.strokeStyle=C_INK;c.lineWidth=2;rr(c,cwid-uw-6,ch-26,uw,20,10);c.fill();c.stroke();ui.text(c,ul,cwid-uw/2-6,ch-16,{size:11,color:on?'#fff':C_INK});
   c.restore();
   ui.hit(id,cx,cy,cwid,ch+4,()=>{if(!buy(id,q.c,()=>{INV[q.id]=(INV[q.id]||0)+1;store.set('inv',INV);SFX.star(1)}))return});
   ui.hit(id+'u',cx+cwid-uw-12,cy+ch-32,uw+12,32,()=>{USE[q.id]=USE[q.id]?0:1;store.set('use',USE);SFX.click()});return}
  c.save();c.translate(cwid/2-14,4);c.scale(0.7,0.7);icon();c.restore();
  if(sel)ui.text(c,'✓',cwid/2,ch-14,{size:14});else if(!own){c.font=ui.font(14);const pw=c.measureText(''+cost).width;coinIcon(c,cwid/2-pw/2-5,ch-14,6);ui.text(c,''+cost,cwid/2+6,ch-14,{size:14})}
  c.restore();ui.hit(id,cx,cy,cwid,ch+4,fn)});
 y+=rows*(ch+8)+4;
 if(showAd){const lab='📺 +60';ui.btn(c,'sAd',x,y,gw,44,{label:lab,bg:C_G,fs:17,disabled:$('sAd').disabled});y+=56}
 ui.btn(c,'sBack',x,y,gw,40,{label:T('back'),bg:C_SEC,fs:17})}
function drawGift(c){drawPanelLayer(c,170,(x,y,w)=>{ui.text(c,'🎁 '+T('dailyT'),x+w/2,y+16,{size:26});ui.text(c,$('gTxt').textContent,x+w/2,y+58,{size:19,weight:800});
 ui.btn(c,'gOk',x,y+86,w,46,{label:T('claim'),bg:C_Y,fg:C_INK})})}
function drawTip(c,now){const e=$('tip');if(e.hidden)return;const k=ease((now-UI.tipAt)/300),mw=Math.min(380,CW*0.9)-28,ls=ui.wrap(c,e.textContent,mw,17);
 c.font=ui.font(17);const tw=Math.max(...ls.map(l=>c.measureText(l).width))+28,th=ls.length*22+16,x=CW/2-tw/2,y=(CH<=500?CH-10-th:CH*0.22)+(1-k)*10;
 c.save();c.globalAlpha=k;c.fillStyle=C_INK;rr(c,x,y+5,tw,th,16);c.fill();c.fillStyle='#fff';c.strokeStyle=C_INK;c.lineWidth=3;rr(c,x,y,tw,th,16);c.fill();c.stroke();
 ls.forEach((l,n)=>ui.text(c,l,CW/2,y+8+11+n*22,{size:17}));c.restore()}
function iconBtn(c,id,x,y,label){const pr=UI.press&&UI.press.id===id;c.save();c.fillStyle=C_INK;rr(c,x,y+3,46,46,14);c.fill();c.fillStyle='#fff';c.strokeStyle=C_INK;c.lineWidth=3;rr(c,x,y+(pr?2:0),46,46,14);c.fill();c.stroke();
 ui.text(c,label,x+23,y+23+(pr?2:0),{size:20});c.restore();ui.hit(id,x-6,y-6,58,58,()=>$(id).click())}
// opening screen with the 健康游戏忠告 that Chinese game platforms expect
UI.splashEnd=performance.now()+2200;
function drawSplash(c,now){const k=Math.min(1,(UI.splashEnd-now)/300);c.save();c.globalAlpha=k;c.fillStyle='#9fd8ff';c.fillRect(0,0,CW,CH);
 const fs=Math.min(72,CW*0.15);c.save();c.translate(CW/2,CH*0.36);c.rotate(-4*Math.PI/180);c.font=ui.font(fs);c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
 c.fillStyle=C_INK;c.fillText(T('name'),0,6);c.lineWidth=6;c.strokeStyle=C_INK;c.strokeText(T('name'),0,0);c.fillStyle=C_Y;c.fillText(T('name'),0,0);c.restore();
 const L=['抵制不良游戏，拒绝盗版游戏。','注意自我保护，谨防受骗上当。','适度游戏益脑，沉迷游戏伤身。','合理安排时间，享受健康生活。'];
 ui.text(c,'健康游戏忠告',CW/2,SAFE.bottom-120,{size:14,weight:900,color:C_INK});L.forEach((l,n)=>ui.text(c,l,CW/2,SAFE.bottom-96+n*20,{size:13,weight:700,color:'rgba(43,35,64,0.8)'}));c.restore()}
// draws whatever is open; called after the game's own render() every frame
function drawUI(c){UI.hits=[];const now=performance.now();c.save();c.setTransform(DPR,0,0,DPR,0,0);c.textBaseline='middle';
 if(now<UI.splashEnd){drawSplash(c,now);c.restore();ui.hit('splash',0,0,CW,CH,()=>{});return}
 const top=SAFE.top;if(!$('pauseB').hidden)iconBtn(c,'pauseB',10,top,'II');if(!$('muteB').hidden)iconBtn(c,'muteB',$('pauseB').hidden?10:64,top,$('muteB').textContent);
 drawTip(c,now);
 if(!$('title').hidden)drawTitle(c,now);else if(!$('mapL').hidden)drawMap(c,now);else if(!$('shopL').hidden)drawShop(c,now);else if(!$('pauseL').hidden)drawPause(c);else if(!$('winL').hidden)drawWin(c,now);else if(!$('failL').hidden)drawFail(c);
 if(!$('giftL').hidden){UI.hits=[];drawGift(c)}
 c.restore()}
// true when a panel is open: taps go to the panel, not to the courier
function uiModal(){return LAYERS.some(l=>!$(l).hidden)||!$('giftL').hidden}
function uiHit(x,y){for(let i=UI.hits.length-1;i>=0;i--){const h=UI.hits[i];if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h)return h}return null}
