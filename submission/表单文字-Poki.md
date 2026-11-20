# Pogo Post · Poki 提交材料（2026-11-20 准备）

## 先看：和 CrazyGames 的冲突
- 这款游戏 11-20 起在 CrazyGames 试运行（Game ID 178409，到 12-11）。
- Poki 签约一般要求「网页独占」：签了以后，游戏在网页上只能放 Poki（Steam、手机应用商店不受影响），期限 5–7 年，以合同为准。
- 只投申请不签合同，不算违约。Poki 真要签的时候，要在 Poki 和 CrazyGames 之间选一个。
- 表单如果问「游戏有没有在别的网站发布过」，如实填：发布在 CrazyGames（试运行）。

## 提交方式
- 在用户本机 Chrome 里打开 Poki for Developers 的提交表单，用 Poki 账号（nc 开头那个 Gmail，开发者名 MiracleGames）。
- 第一步 Poki 只要一个能玩的链接，不用传 zip；人工审核后决定要不要。
- Poki 之前给这个账号回的都是同一封模板拒信（「暂不开放新开发者测试资格」），这次被拒的可能也很大，跟游戏好坏关系不大。

## 表单填法（照之前捏捏叠叠乐的填法）
- 公司：英国注册公司；团队 2–3 人；发过 Web / Steam / iOS / Android。
- 引擎：Custom engine / framework。**不选任何 AI 相关选项**。
- 如果单独问是否用了 AI 生成内容（封面是 ChatGPT 画的）：停下来，由用户自己决定。
- 确认框用户自己勾，最终提交前截图给用户看。
- 可玩链接：https://yzhaoha.github.io/pogo-post/
- 游戏包（如果后面要传）：`dist/pogo-post-poki.zip`（已接 Poki SDK，只请求 Poki 自己的 SDK 地址，没有别的外部请求）。
- 图标：`art/final/pogo-post-poki-628x628-notext.png`（628×628 是凭印象定的尺寸，传之前对一下表单要求）。
- 视频（如果问）：`submission/preview-1920x1080.mp4`。

## Title
Pogo Post

## Short description（一句话）
A one-button physics game: bounce a pogo-stick courier across rooftops without dropping the parcel tower on your head.

## Description
Pogo Post is a one-button physics delivery game. You're a courier on a pogo stick with a wobbly tower of parcels on your head. Hold to squish the spring, let go to bounce from rooftop to rooftop, and hold in mid-air to lean forward so you land upright. Land badly and the stack wobbles; tip too far and your parcels go flying. Hit the bullseye in the middle of each roof for bonus points, and chain them for a bigger streak.

Features:
- 90 levels in 9 chapters: sunny streets, a windy pier, rainy nights, sunset rooftops, snow, fog, gusts and thunderstorms
- Bounce pads, clotheslines, barking dogs, giant fans and hovering platforms
- Fragile boxes, cakes, a live chicken and extra-long parcels that catch the wind
- Endless Run: random rooftops, doorstep deliveries and a high score to beat
- Coins and 12 outfits to unlock
- 11 languages

## Controls
Hold Space, click or tap to charge the spring · Release to jump · Hold again in mid-air to lean forward · P to pause · M to mute · R to restart
