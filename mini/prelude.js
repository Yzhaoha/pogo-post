/* 蹦蹦快递 · 微信 / 抖音小游戏版
 * 由 tools/build_mini.py 从 index.html 生成，别直接改 dist/ 里的文件。
 * 这一段是平台适配层：把游戏用到的浏览器接口（window、document、localStorage……）
 * 换成小游戏的 wx / tt 接口。游戏本体代码和网页版是同一份。 */
(function(){
'use strict';
// read the real global before the stand-in below shadows the name
const _RAF=typeof requestAnimationFrame!=='undefined'?requestAnimationFrame:null;
(function(){
const P=typeof tt!=='undefined'?tt:typeof wx!=='undefined'?wx:globalThis.__fakeP;
const PLAT=typeof tt!=='undefined'?'tt':typeof wx!=='undefined'?'wx':'sim';
const SYS=(()=>{try{return P.getSystemInfoSync()}catch(e){return{windowWidth:375,windowHeight:667,pixelRatio:2}}})();
const SCREEN=P.createCanvas(); // the first canvas a mini game creates is the one on screen
let innerWidth=SYS.windowWidth,innerHeight=SYS.windowHeight;

// safe area: keep the HUD below the status bar and the platform's capsule menu (top right)
const SAFE=(()=>{let top=(SYS.statusBarHeight||20)+4,bottom=innerHeight;
 try{const m=P.getMenuButtonBoundingClientRect?P.getMenuButtonBoundingClientRect():P.getMenuButtonLayout?P.getMenuButtonLayout():null;if(m&&m.bottom>0&&m.bottom<innerHeight/3)top=m.bottom+6}catch(e){}
 try{const sa=SYS.safeArea;if(sa&&sa.bottom>innerHeight*0.7)bottom=sa.bottom}catch(e){}
 return{top,bottom}})();

const LSN={};
function addEventListener(n,f){(LSN[n]=LSN[n]||[]).push(f)}
function fire(n,e){(LSN[n]||[]).forEach(f=>{try{f(e)}catch(err){console.error(err)}})}
try{P.onWindowResize&&P.onWindowResize(r=>{innerWidth=r.windowWidth||innerWidth;innerHeight=r.windowHeight||innerHeight;fire('resize')})}catch(e){}

// stand-ins for the page elements the game code still pokes (state only; ui.js draws them)
const EL={};
function el(id){if(id==='cv')return SCREEN;return EL[id]||(EL[id]={id,hidden:id!=='muteB',textContent:'',value:'',disabled:false,onclick:null,onchange:null,style:{},
 classList:{add(){},remove(){},contains(){return false}},appendChild(){},
 click(){if(this.onclick&&!this.disabled)this.onclick({stopPropagation(){},target:{classList:{contains(){return false}}}})}})}

const performance={now:()=>Date.now()};
const _raf=_RAF||(P.requestAnimationFrame?P.requestAnimationFrame.bind(P):f=>setTimeout(f,16));
const raf=f=>_raf(()=>f(performance.now())); // the game compares the frame time with performance.now(): give both the same clock
const document={hidden:false,title:'',documentElement:{lang:'zh-CN'},
 getElementById:el,querySelectorAll:()=>[],addEventListener,
 createElement:t=>t==='canvas'?P.createCanvas():el('_'+t)};
const localStorage={getItem(k){try{const v=P.getStorageSync(k);return v===''||v==null?null:v}catch(e){return null}},
 setItem(k,v){try{P.setStorageSync(k,String(v))}catch(e){}}};
const location={search:''};
class URLSearchParams{get(){return null}has(){return false}}
const navigator={language:'zh-CN',languages:['zh-CN'],vibrate(){try{P.vibrateShort&&P.vibrateShort({type:'light'})}catch(e){}return true}};
const matchMedia=q=>({matches:/hover:\s*none|pointer:\s*coarse/.test(q)});
function WebAC(){const f=P.createWebAudioContext||P.getWebAudioContext;if(!f)throw new Error('no web audio');return f.call(P)}
const window={devicePixelRatio:SYS.pixelRatio||2,AudioContext:(P.createWebAudioContext||P.getWebAudioContext)?WebAC:undefined,addEventListener};
const requestAnimationFrame=raf;
