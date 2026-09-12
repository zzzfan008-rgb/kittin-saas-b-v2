> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip 已恢复正常

> 8 月 25 日 00:45 (UTC+8)，gpt-image-2-vip 已恢复正常，失败率与耗时回到日常水平，昨晚 20:30 起的原厂风控/限速影响结束。使用 -vip 的客户仍建议同时接上官转 gpt-image-2 做备用通道，或在 C 端前台把两个通道透出交由用户选择。

**2026/8/25 00:45 (UTC+8)** · 模型状态 · OpenAI

✅ **`gpt-image-2-vip` 已于 8 月 25 日 00:45 (UTC+8) 恢复正常**

昨晚 20:30 (UTC+8) 起的原厂侧风控与限速影响已结束，`gpt-image-2-vip` 的失败率与出图耗时回到日常水平，2K / 4K 与 `size` 精准控制均正常可用。此前发出的波动提示到此闭环。

出图通道当前状态如下（按需自选）：

* `gpt-image-2-vip`：已恢复正常
* 官转 `gpt-image-2`：运行正常，按量计费，4K 与 `quality=high` 单价较高

对以 `-vip` 为主力的客户，我们一贯的接入建议是**同时接上官转 `gpt-image-2` 作为备用通道**，在代码里做好双通道切换；C 端产品也可以把两个通道直接透出到前台，由用户自行选择。这样遇到任一通道波动时业务不会整体中断。接入官转时记得显式传 `quality`（默认值 `auto` 是动态推理档，费用与耗时都会漂移），参数说明见 [gpt-image-2 概述](/api-capabilities/gpt-image-2/overview)。

感谢各位在波动期间的耐心等待，我们会持续观察。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
