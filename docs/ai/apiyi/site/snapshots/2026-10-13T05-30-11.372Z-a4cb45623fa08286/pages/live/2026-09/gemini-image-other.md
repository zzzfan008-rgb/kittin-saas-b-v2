> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 出图返回 IMAGE_OTHER、时好时坏？新 FAQ 讲清原因与修法

> 新增 FAQ：Gemini 图片模型返回 finishReason: IMAGE_OTHER 时，图已生成但在输出时被原厂过滤。实测最典型诱因是提示词点名真人，删掉姓名后失败率从 5/6 降到 0/6。

**2026/9/25 00:39 (UTC+8)** · 文档更新 · Google

📚 **新增 FAQ：Gemini 出图返回 `IMAGE_OTHER` 怎么办？**

`IMAGE_OTHER` 表示模型已经画完图，但在返回前被原厂的输出检查过滤了，所以同一请求会时好时坏。我们实测的一个纯文生图请求在 `gemini-3-pro-image` 上 5/6 失败，只删掉提示词里点名真人的那一句后 0/6；负向提示词和「1:1 复刻」措辞都不是原因。原厂注明这类请求不计费，实际消费以控制台日志为准。

它与 [NO\_IMAGE](/faq/gemini-no-image)、[blockReason: OTHER](/faq/gemini-image-input-blocked) 两页一起，覆盖 Gemini 出图失败的三种形态。详见 [IMAGE\_OTHER 怎么办？](/faq/gemini-image-other)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.