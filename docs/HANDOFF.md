# 游戏 4｜弹簧快递 Pogo Post：美术试玩交接
更新：2026-11-26。此文档覆盖旧试玩站和旧交接里的版本判断；历史记录保留在 `docs/STATUS.md`。

## 从哪里继续
- 仓库 `Yzhaoha/pogo-post`，开发分支 `playtest/postal-menu-art`，本次核对的可玩源码为 `db6b87bbda180385ddce5d737a178e313419a435`。从这条分支继续，不要从旧 Pages 或旧屋顶试玩站开始；之后若分支多了交接文档提交，可玩代码并未回退。
- GitHub `main` 仍是 `bbd1e96962e53bd05f02ec050866492757b4a874`。CrazyGames 专线此前核对为 `a00b333` Active；那是杆尖贴地、回弹和第一轮按钮优化，不是本次全界面/换装/海港美术试玩。仓库旧平台包不可当成此次源码重建包。
- 用户本轮要看美术实际替进游戏后的效果。已有美术先在当前分支验证和补漏，不要只交概念图，也不要从头重画已经接好的部分。修改只在分支；等 Nick 确认可玩版本后再合 main 或更新 CrazyGames。

## 已接入与待验收
- `085c0a8`：信封主菜单、暂停、选关、结算、换装统一邮递风格。开场按钮独立面板，竖屏底部、横屏右侧，避免叠在楼图上。短竖屏按钮尺寸、Safari 商店切换标签残影待复测。
- `1925565`：15 套换装均有待机、腾空、失衡、压缩动作，过去缺的 11 套补了 44 张；装备、包裹、道具、尾迹和跌落反馈已接入。保留已购装备、价格、存档编号；检查同一换装在商店试穿和实战确实一致。
- `ed4403a`：按每个角色、每个动作的头顶定位包裹，修整金箱透明边造成的缝隙；核对疾风忍者双金箱的待机、蓄力、起跳和落地，不漂移、不悬空。
- `db6b87b`：海港货箱平台与海港旗杆换成木栈桥和系缆桩，检查画面和实际落点对齐，并保留其他街区的障碍与难度。剧情关同一关实际失败累计 7 次后，下次蓄力显示**完整轨迹**（以这条晚于「第七次开局」的用户说明为准）；过关清掉该关计数，下一关默认无辅助线，重新计算。不能因为装瞄准镜提前出半截线。无尽不因剧情失败计数显示线。
- 海港、阈值和头顶贴合均需用最新试玩在实际画面回归；源码核对不等于 Safari 真机通过。请实测第 6/7 次失败边界、通关后进下一关，另查已有存档、瞄准镜、主动重开和复活。不要把调试预置当作自然游玩验证。

## 固定到这次代码的试玩链接
- [海港木栈桥](https://raw.githack.com/Yzhaoha/pogo-post/db6b87bbda180385ddce5d737a178e313419a435/index.html?new&lang=zh&lvl=endless-pier) · [海港精准落点](https://raw.githack.com/Yzhaoha/pogo-post/db6b87bbda180385ddce5d737a178e313419a435/index.html?new&lang=zh&lvl=endless-flag)
- [信封菜单](https://raw.githack.com/Yzhaoha/pogo-post/db6b87bbda180385ddce5d737a178e313419a435/index.html?lang=zh&lvl=menu) · [换装试穿（临时金币）](https://raw.githack.com/Yzhaoha/pogo-post/db6b87bbda180385ddce5d737a178e313419a435/index.html?new&lang=zh&lvl=shop&fitting)
- [第 2 关双金箱，无辅助线](https://raw.githack.com/Yzhaoha/pogo-post/db6b87bbda180385ddce5d737a178e313419a435/index.html?new&lang=zh&lvl=ninja) · [同一关，预置 7 次失败](https://raw.githack.com/Yzhaoha/pogo-post/db6b87bbda180385ddce5d737a178e313419a435/index.html?new&lang=zh&lvl=ninja&attempt=7)

[旧开发对话](https://chatgpt.com/c/6b05815c-0ecc-83e8-ae15-2a97a294adab) · [海港美术反馈](https://chatgpt.com/c/6b05815c-0ecc-83e8-ae15-2a97a294adab?messageId=418819ee-bc7a-404b-98d4-9f4f38d5da71) · [辅助线完整轨迹要求](https://chatgpt.com/c/6b05815c-0ecc-83e8-ae15-2a97a294adab?messageId=9404b8eb-2854-4c1d-ac29-7a8524671691)
