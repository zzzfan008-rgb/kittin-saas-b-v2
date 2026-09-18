> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip 已恢复正常，凌晨两段波动说明

> gpt-image-2-vip 当前状态正常，出图约 90 秒。今日凌晨受上游风控影响号池资源不足，02:19–03:31 部分任务接口超时，03:55:38–04:16:32 返回 HTTP 429 即时报错约 20 分钟。同时给出超时设置与双通道兜底两点接入建议。

**2026/8/13 09:59 (UTC+8)** · 模型状态 · OpenAI

✅ **`gpt-image-2-vip` 已恢复正常，当前出图耗时约 90 秒**

今日凌晨上游因风控收紧导致号池资源不足，出现两段波动（以下时间均为 UTC+8）：**02:19–03:31** 部分任务的 API 接口超时，请求会长时间挂起；**03:55:38–04:16:32** 返回 `Upstream resources are temporarily busy. Please try again later.`（HTTP 429，类型 `rate_limit_error`），这 20 分钟内该模型完全不可用——但属于即时报错、不会占住连接，调用方可以立刻感知并转向其他模型。目前资源已恢复。

两点接入建议：

* **超时设置**：`gpt-image-2-vip` 的请求超时建议直接设到上限 **360 秒**，避免第一类「挂起等待」把调用方长时间拖住。
* **双通道兜底**：官转 `gpt-image-2` 与官逆 `gpt-image-2-vip` 同步接入、互为兜底。官转是可靠性保障，官逆大部分时间同样稳定但难以做到完美，两条链路并行可以显著降低单点波动的影响。

给您带来不便深表歉意，我们会持续盯住上游资源水位。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
