> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip 受原厂风控限速影响，当前不稳定

> 8 月 24 日 20:30 (UTC+8) 起，gpt-image-2-vip 受原厂侧风控与限速加强影响，失败率上升、耗时拉长，目前仍在波动中。官转 gpt-image-2 运行正常，使用时建议显式传 quality 参数，避免默认 auto 档导致账单不可控。

**2026/8/24 21:55 (UTC+8)** · 模型状态 · OpenAI

⚠️ **`gpt-image-2-vip` 今晚 20:30 (UTC+8) 起受原厂风控/限速影响，当前不稳定**

`gpt-image-2-vip` 因 `size` 尺寸可精准控制、能出 2K 与 4K，一直是不少客户的常用选择。今晚 20:30 (UTC+8) 起，原厂侧的风控与限速明显加强，该模型出现失败率上升、耗时拉长，目前仍在波动中。

同系列出图通道状态如下（按需自选）：

* `gpt-image-2-vip`：受原厂风控/限速影响，当前不稳定
* 官转 `gpt-image-2`：运行正常，按量计费，4K 与 `quality=high` 单价较高

使用官转 `gpt-image-2` 时，建议**显式传 `quality`**（例如 `medium`）。不传时默认值是 `auto`，属动态推理档，模型会自行选择质量档位，同一条提示词的耗时与费用都会漂移，账单额度不可控。四个官方取值为 `low` / `medium` / `high` / `auto`，参数说明与分档计费见 [gpt-image-2 概述](/api-capabilities/gpt-image-2/overview)。

我们正在尝试解决并持续观察，恢复后会第一时间在此更新。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
