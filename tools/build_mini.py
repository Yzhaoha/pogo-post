"""Build the WeChat / Douyin mini-game versions of 蹦蹦快递 from index.html.

usage: python3 tools/build_mini.py
  dist/wechat/   game.js + game.json + project.config.json  (open this folder in 微信开发者工具)
  dist/douyin/   game.js + game.json + project.config.json  (open this folder in 抖音开发者工具)
  mini-preview/  index.html + game.js: the same game.js running in a browser on a fake wx,
                 to check the canvas UI without the IDEs

The game code is the web version's script. Four parts are swapped for mini/*.js:
  prelude.js  stand-ins for window / document / localStorage ... on top of wx / tt
  ui.js       replaces the "UI" section: every panel and button drawn on the canvas
  sdk.js      replaces "SDK / ads" + "input": rewarded video / interstitial ads, touch input
  boot.js     replaces "boot"
"""
import json, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
mini = root / 'mini'
html = (root / 'index.html').read_text(encoding='utf-8')

m = re.search(r'<script>\n(\(function\(\)\{.*\}\)\(\);)\n</script>', html, re.S)
assert m, 'main script not found'
js = re.sub(r'/\*TEST\*/.*?/\*ENDTEST\*/', '', m.group(1), flags=re.S)
assert "const BUILD='test';" in js
js = js.replace("const BUILD='test';", "const BUILD='mini';")

def mark(name):
    return '/* ================= %s ================= */' % name

def swap(src, start, end, new):
    a = src.index(mark(start))
    b = src.index(mark(end)) if end else src.rindex('})();')
    return src[:a] + new.rstrip() + '\n' + src[b:]

part = lambda n: (mini / n).read_text(encoding='utf-8')
js = swap(js, 'UI', 'SDK / ads', part('ui.js'))
js = swap(js, 'SDK / ads', 'update', part('sdk.js'))
js = swap(js, 'boot', None, part('boot.js'))
game = part('prelude.js').rstrip() + '\n' + js + '\n})();\n})();\n'
# older phone JS engines (and the Douyin IDE's ES5 compile) choke on ?? and ?.
game = game.replace('(GS.cfT??now)', '(GS.cfT!=null?GS.cfT:now)')
bad = re.findall(r'.{30}(?:\?\?|\?\.(?=[A-Za-z_$\[(])).{10}', game)
assert not bad, 'newer syntax left in game.js, rewrite it: %r' % bad

game_json = {'deviceOrientation': 'portrait', 'showStatusBar': False, 'networkTimeout': {'request': 5000}}
projects = {
    'wechat': {'description': '蹦蹦快递', 'projectname': 'bengbeng-kuaidi', 'compileType': 'game', 'appid': 'touristappid',
               'setting': {'urlCheck': False, 'es6': True, 'enhance': True, 'minified': True, 'postcss': False}},
    'douyin': {'description': '蹦蹦快递', 'projectname': 'bengbeng-kuaidi', 'appid': '',
               'setting': {'urlCheck': False, 'es6': True, 'minified': True}},
}
for name, proj in projects.items():
    d = root / 'dist' / name
    d.mkdir(parents=True, exist_ok=True)
    (d / 'game.js').write_text(game, encoding='utf-8')
    (d / 'game.json').write_text(json.dumps(game_json, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (d / 'project.config.json').write_text(json.dumps(proj, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(name, len(game.encode()), 'bytes ->', d.relative_to(root))

pv = root / 'mini-preview'
pv.mkdir(exist_ok=True)
(pv / 'game.js').write_text(game, encoding='utf-8')
(pv / 'index.html').write_text(part('preview.html'), encoding='utf-8')
print('preview ->', pv.relative_to(root))
