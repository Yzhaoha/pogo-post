# 当前状态（2026-11-14）

- 测试链接：https://yzhaoha.github.io/pogo-post/ （GitHub Pages，main / root）
- `python3 tools/build.py` 生成 `dist/poki/`、`dist/crazygames/` 和两个 zip（index.html 在 zip 根目录）。
- CrazyGames 版：游戏只调用 PokiSDK 形状的接口；build.py 在 CG 版里注入 CG SDK v3 适配层（body 就绪后 init、loadingStart/Stop、gameplayStart/Stop、midgame 只在 adStarted 静音、rewarded、settings.muteAudio、systemInfo.locale）。游戏侧接口是 `window.__ppHost`。
- Poki 版：手机上 HUD 下移 46px（TOPPAD），避开顶部中间的 Poki 按钮。
- 已在 Chrome（127.0.0.1）测过：无报错；Poki 调试模式和 CG local 环境下 SDK 调用顺序正确。

## 等用户回复
- 第 1 章手感：跳跃距离、后仰程度、包裹晃动是否太难 / 太容易。

## 待办
1. 按手感反馈调数值（常量在 index.html 开头）。
2. 第 2 章「大风码头」10 关（风、风扇、超长件、活鸡已实现，只差关卡数据），然后第 3 章「雨夜高楼」。
3. 9 种语言（fr it de es tr ja ko pt ru）。
4. CG 封面 1920×1080 / 800×1200 / 800×800（只有标题文字），预览视频 1080p 横 + 1080×1620 竖，15–20 秒、无声。
5. 可选：CG Data 模块存档。
6. 提交 Poki / CrazyGames：要用户本机的 Chrome（已登录的账号），在本机做；表单不选任何 AI 选项，最终提交前截图给用户确认。
