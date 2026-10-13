> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 出图秒回 blockReason: OTHER 或时好时坏的 NO_IMAGE？两页 FAQ 讲清原因与修法

> 新增 FAQ：Gemini 图片模型几秒内返回 promptFeedback.blockReason=OTHER 且没有 candidates 时，常由单张参考图触发，给出定位方法与参考图预处理建议。同时更新 NO_IMAGE 排查页，补充提示词索要设计方案导致概率性不出图的实测与修法。

**2026/9/23 15:12 (UTC+8)** · 文档更新 · Google

📚 **Gemini 出图失败的两类常见情况：输入图被拦截，和提示词在要求模型写文字**

**输入图被拦截**：`gemini-3-pro-image` 会在生成前检查输入，被拦时几秒内返回 HTTP 200、`promptFeedback.blockReason: OTHER`，没有 `candidates`。我们实测的一个 6 图服装目录请求，触发源只有其中一张 AI 生成的人物参考图，与提示词无关，flash 能过；这张图重新导出 JPEG 后通过，完整请求正常出图。新 FAQ 给出对半拆分定位方法，以及人工操作、代码两类参考图预处理建议，见 [blockReason: OTHER 怎么办？](/faq/gemini-image-input-blocked)

**提示词在要求模型写文字**：提示词里有「生成设计方案」「分析内容深入」这类句子时，只许出图的调用会概率性返回 `NO_IMAGE`，实测约 21%，同一请求时好时坏；末尾追加一句「只输出最终图片」后 0/24。已补充进 [NO\_IMAGE 排查](/faq/gemini-no-image)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.