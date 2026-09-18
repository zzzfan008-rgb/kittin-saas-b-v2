> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2.5-vip 系列官逆上线，gpt-image-2.5-all 同步上线

> 官逆侧新增 gpt-image-2.5-vip（别名，指向 gpt-image-2.5-sunburst-vip）、gpt-image-2.5-flare-vip、gpt-image-2.5-sunburst-vip 三个模型，与 gpt-image-2-vip 同一 Adobe 官逆线路，$0.03/张按次、Default 分组、调用方式不变；三款实测都接受 quality 到 high 并支持透明背景，size 30 档锁定。gpt-image-2.5-all 同步上线，与 gpt-image-2-all 同价同行为。

**2026/9/9 19:55 (UTC+8)** · 新模型 · OpenAI

🚀 **`gpt-image-2.5-vip` 系列官逆已上线，`Default` 分组可直接调用**

新增三个模型：`gpt-image-2.5-vip`（别名，指向 `gpt-image-2.5-sunburst-vip`）、`gpt-image-2.5-flare-vip`（速度优先）、`gpt-image-2.5-sunburst-vip`（画质与编辑精度优先）。它们与 `gpt-image-2-vip` 走同一条 Adobe 官逆线路（Firefly，高质量 GPT-Image 2.5 逆向资源，不是低质量超分），**\$0.03/张按次、分组、端点、调用方式完全相同**，把 `model` 换成新名字即可。

上线前用同渠道同令牌三臂对比实测：三款都接受 `quality` 到 `high`（`xhigh` / `max` 不可用）、都支持 `background: "transparent"`、`size` 30 档逐像素锁定。注意 2.5 的 `high` 只等于 `gpt-image-2-vip` 的 `medium`，从旧模型迁移别原样照搬 `quality`；`mask` 三款都只做整图重绘，精确局部重绘请走官转。

官逆 ChatGPT 网页版线路同步上线 `gpt-image-2.5-all`：ChatGPT 网页版已整体升级到 Images 2.5，`gpt-image-2-all` 现在出的就是 2.5 的图，新名只是把升级表达出来，两名同价同行为、可互换。

文档侧边栏已改为「GPT-Image-2.5-VIP 生图」「GPT-Image-2.5-All 生图」，旧模型页面与 URL 不变。

📖 三款 -vip 逐项对照：[GPT-Image-2.5-VIP 概览](/api-capabilities/gpt-image-2-vip/overview) · 官转 vs 官逆选型：[对比页](/api-capabilities/gpt-image-2/vs-gpt-image-2-all)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
