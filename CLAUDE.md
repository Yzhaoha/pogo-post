# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目

弹簧快递 Pogo Post：单键物理闯关小游戏（纯 Canvas 2D，单文件，不发外部请求）。同一份游戏代码发到 Poki、CrazyGames（网页）和微信 / 抖音小游戏（中文名「蹦蹦快递」）。用户不看代码、只看效果，全程用中文、说话直白。

## 进度记录（必读、必写）

- **开工前先读 `docs/STATUS.md` 开头的「★」小节**——那是当前状态和下一步；下面是逐日历史。`docs/弹簧快递-开发交接.md` 是早期设计记录，部分已过时。
- **每做完一批改动，在 `docs/STATUS.md` 顶部加 / 更新一节「★ 日期 标题」**：改了什么（带关键常量 / 函数名）、怎么验证的、没验证的、在哪个分支、有没有提交到平台、下一步。用户原话里的决定要记下来（尤其是「以后不要动」这类）。
- 平台后台的状态（审核、试运行数据、提交了哪个版本）也记在 `docs/STATUS.md`；CrazyGames 数据交接见 `docs/交接-CrazyGames数据-*.md`，小游戏版说明见 `docs/小游戏版.md`。

## 命令

```
python3 tools/build.py        # index.html → dist/poki/、dist/crazygames/ 和两个 zip（CG 后台只收解压后的 index.html）
python3 tools/build_mini.py   # index.html + mini/*.js → dist/wechat/、dist/douyin/、mini-preview/
```

测试脚本用 Playwright（`require('playwright')`，Chromium），没有 package.json / 测试框架，单个脚本直接 `node` 跑：

```
node tools/test-autoplay.js 0 5 47     # 关卡下标从 0 算：机器人先解关，再在真实游戏循环里回放，输出 win / crash:原因
node tools/test-cg-build.js <截图前缀>  # 先 build.py；用假 CG SDK（广告全失败）启动 CG 包，打印 SDK 调用顺序并截图
node tools/test-falls.js <前缀>  /  node tools/test-shop.js <前缀>
```

- 上面几个用 `file://` 直接打开仓库里的 `index.html`（可用 `BASE=` 覆盖）。
- `test-solve.js`、`test-endless.js`、`gen-levels.js`、`verify-levels.js` 默认连 `http://127.0.0.1:8765/index.html`，要先在仓库根目录起静态服务（如 `python3 -m http.server 8765`），或用 `URL=file:///…/index.html` 覆盖。
- 测试版 URL 参数：`?lvl=N` 直接进第 N+1 关，`?lang=xx` 指定语言，`?new` 当全新玩家玩（存档只在内存）。

## 架构

**`index.html` 是唯一源码**（约 1270 行，一个 IIFE）。脚本用 `/* ================= 名字 ================= */` 分段：text（11 种语言的 `TXT`）→ constants → levels（`LEVELS`、`NARROW`）→ simulation → save → canvas → audio → game state → events→fx → UI → SDK / ads → input → update → render → loop → boot。

- **模拟是确定性的定步长**（`step(s,L,hold)`、`newState`）。求解器、抗噪验证、自动回放都直接复用它：`/*TEST*/…/*ENDTEST*/` 之间挂了 `window.__pp`（`solve`、`robust`、`autoplay`、`tick`、`startLevel` 等）。**改物理会影响所有关卡的可通关性和三星时间（PAR）**，改完要用机器人重验。只让关卡更容易的改动（如完美落地稳住包裹塔）不影响验证。
- **打包靠文本替换**：`build.py` 删掉 `/*TEST*/…/*ENDTEST*/`，把 `const BUILD='test';` 换成 `'poki'`/`'cg'`，在 `<!--POKISDK-->` 处插 SDK。游戏只认 PokiSDK 形状的接口（init / gameLoadingFinished / gameplayStart/Stop / commercialBreak / rewardedBreak），CG 包里是一个把 CrazyGames SDK v3 包成这个接口的适配层。这几个标记和 `const BUILD='test';` 这一行不能改写法，脚本里有 assert。
- **小游戏版**：`build_mini.py` 取出 `index.html` 的主脚本，按分段标记把 UI、SDK / ads + input、boot 三段换成 `mini/ui.js`、`mini/sdk.js`、`mini/boot.js`，前面拼上 `mini/prelude.js`（用 `wx`/`tt` 冒充 window、document、localStorage，并按有无 `tt`/`wx` 定 `PLAT`）。所以**小游戏版的界面全部画在画布上**，网页 DOM 界面的改动要在 `mini/ui.js` 里另做一遍；玩法改动打包后自动跟上。
  - 微信版和抖音版的 `game.js` 完全相同，平台差异在运行时用 `PLAT==='tt'/'wx'` 判断；两个目录只差 `project.config.json`（AppID）。
  - 小游戏代码不能用 `??` 和 `?.`（抖音 IDE 的 ES5 编译会挂），`build_mini.py` 会 assert。
  - 广告位 ID 填在 `mini/sdk.js` 的 `AD_UNITS`；没填时复活 / 跳关免费给。
  - 启动画面（`drawSplash`）有《健康游戏忠告》；面向玩家的文字不要出现「抖音 / 微信 官方 / 出品 / 授权」之类会让人误会的字样。
- **不要直接改 `dist/`、`mini-preview/`**，都是生成的。
- **关卡**：第 1–4 章手写；第 5–15 章由 `tools/gen-levels.js` 生成到 `tools/levels/chN.json`，`tools/embed-levels.py` 写进 `LEVELS` 里 GENERATED 标记之间。`NARROW` 表由 `tools/narrow-levels.js` 生成——**重跑前必须先把 `NARROW` 表清空**，否则会在已变窄的屋顶上再改窄。关卡数据格式见 `docs/弹簧快递-开发交接.md`「关卡数据格式」。
- **存档键**都以 `pp_` 开头（如 `pp_air2`、`pp_gift1`、`pp_dl`）；新加的教学 / 礼物用新键，别复用旧键，免得老玩家状态错乱。
- 新增界面文字要补全 11 种语言的 `TXT` 词条。

## 约定

- 难度调整的既定决定记在 `docs/STATUS.md`（例如空中后仰第一次「画面停住」的教学，用户要求以后调难度也不要去掉）。
- 往平台提交新版本、推送、合并分支前先问用户。
