> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-all 出图耗时变长 · 源头仍是 ChatGPT 网页版

> ChatGPT 网页版画图请求偶发失败重试，导致 gpt-image-2-all 部分请求耗时超过 300 秒，源头在上游网页版而非本站网关；gpt-image-2-vip 同样受影响，1K 需求也可选用 Nano Banana 2 / gemini-3.1-flash-lite-image。

**2026/7/8 14:27 (UTC+8)** · 模型状态 · OpenAI / Google

⚠️ **`gpt-image-2-all` 出图耗时变长 · 源头仍是 ChatGPT 网页版**

排查发现，ChatGPT 网页版画图请求近期偶发失败重试，导致整体耗时增加，部分请求长达 300 秒以上；`gpt-image-2-vip` 同样受此上游波动影响，未必更快。

1K 分辨率出图需求可选通道状态（按需自选）：

* 官转 `gpt-image-2`：耗时与 `gpt-image-2-vip` 接近，暂无明显差异
* `gpt-image-2-vip`：同样受上游波动影响
* `Nano Banana 2`：可用
* `gemini-3.1-flash-lite-image`：可用

我们持续关注上游修复进展。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
