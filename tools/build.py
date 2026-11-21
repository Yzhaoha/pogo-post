"""Build the platform versions from index.html (the GitHub test version).

usage: python3 tools/build.py
  dist/poki/index.html         + dist/pogo-post-poki.zip         (Poki SDK)
  dist/crazygames/index.html   + dist/pogo-post-crazygames.zip   (CrazyGames SDK v3)
Both strip the /*TEST*/.../*ENDTEST*/ hooks; index.html sits at the zip root.

The game talks to one interface (window.PokiSDK: init, gameLoadingFinished,
gameplayStart/Stop, commercialBreak, rewardedBreak). The CrazyGames build adds a
small adapter that provides that interface on top of CrazyGames.SDK v3, plus
platform mute (settings.muteAudio) and locale via window.__ppHost."""
import re, pathlib, zipfile

root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'index.html').read_text(encoding='utf-8')
base = re.sub(r'/\*TEST\*/.*?/\*ENDTEST\*/', '', src, flags=re.S)
assert "const BUILD='test';" in base and '<!--POKISDK-->' in base

POKI = '<script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script>'

CG = r'''<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>
<script>
/* CrazyGames v3 adapter: exposes the PokiSDK-shaped interface the game uses */
(function(){
var sdk=null,ready=null,loaded=false; // loaded: the game finished loading (maybe before the SDK was ready)
function body(){return new Promise(function(r){if(document.body)r();else document.addEventListener('DOMContentLoaded',function(){r()},{once:true})})}
function host(){return window.__ppHost}
function ad(type,onStart){return new Promise(function(res){
  if(!sdk){res(false);return}
  try{sdk.ad.requestAd(type,{
    adStarted:function(){try{onStart&&onStart()}catch(e){}},
    adFinished:function(){res(true)},
    adError:function(){res(false)}})}catch(e){res(false)}})}
window.PokiSDK={
  init:function(){
    if(ready)return ready;
    ready=body().then(function(){
      if(!window.CrazyGames||!CrazyGames.SDK)throw new Error('no sdk');
      return CrazyGames.SDK.init().then(function(){sdk=CrazyGames.SDK})
    }).then(function(){
      try{sdk.game.loadingStart()}catch(e){}
      if(loaded){try{sdk.game.loadingStop()}catch(e){}} // slow SDK: the game booted on its 4 s fallback, still report the load as finished
      try{var h=host(),st=sdk.game.settings;if(h&&st)h.setPlatMute(!!st.muteAudio);
          sdk.game.addSettingsChangeListener(function(n){var h=host();if(h&&n)h.setPlatMute(!!n.muteAudio)})}catch(e){}
      try{var loc=sdk.user&&sdk.user.systemInfo&&sdk.user.systemInfo.locale;var h2=host();if(loc&&h2)h2.setLang(loc)}catch(e){}
    }).catch(function(){sdk=null});
    return ready},
  gameLoadingFinished:function(){loaded=true;try{sdk&&sdk.game.loadingStop()}catch(e){}},
  gameplayStart:function(){try{sdk&&sdk.game.gameplayStart()}catch(e){}},
  gameplayStop:function(){try{sdk&&sdk.game.gameplayStop()}catch(e){}},
  commercialBreak:function(before){return ad('midgame',before).then(function(){})},
  rewardedBreak:function(before){return ad('rewarded',before)}
};
})();
</script>'''

dist = root / 'dist'
for name, build, head in (('poki', 'poki', POKI), ('crazygames', 'cg', CG)):
    out = base.replace("const BUILD='test';", "const BUILD='%s';" % build).replace('<!--POKISDK-->', head)
    d = dist / name
    d.mkdir(parents=True, exist_ok=True)
    (d / 'index.html').write_text(out, encoding='utf-8')
    z = dist / ('pogo-post-%s.zip' % name)
    with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as f:
        f.write(d / 'index.html', 'index.html')
    print(name, len(out.encode()), 'bytes ->', z.name)
