> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip 与 2.5-vip 系列持续扩容中，近期仍不稳定

> gpt-image-2-vip 与 gpt-image-2.5 的 -vip 系列为官逆线路，受号池并发影响，复工后请求量大，自昨天起持续补充资源，目前仍不稳定。我们持续加号；官转 gpt-image-2 与 gpt-image-2.5 并发充足，建议生产业务以官转作兜底。

**2026/10/9 10:47 (UTC+8)** · 模型状态 · OpenAI

⚠️ **`gpt-image-2-vip` 与 `gpt-image-2.5` 的 -vip 系列自昨天起持续补充资源，目前仍不稳定**

-vip 系列为官逆线路，可用并发取决于号池规模；复工后客户请求量明显增大，号池并发跟不上，会出现一段时间请求失败或排队变慢。我们正在持续加号扩容。

各线路当前状态：

* `gpt-image-2-vip`、`gpt-image-2.5-vip`、`gpt-image-2.5-sunburst-vip`、`gpt-image-2.5-flare-vip`：扩容中，仍有波动
* 官转 `gpt-image-2`：并发充足
* 官转 `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare`：并发充足

平台建议生产业务仍以官转作兜底，并在客户端做好失败重试。官转按 token 计费，与 -vip 按次计费口径不同，详见 [GPT-Image 官转概览](/api-capabilities/gpt-image-2/overview)。感谢耐心等待，我们持续运维。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.