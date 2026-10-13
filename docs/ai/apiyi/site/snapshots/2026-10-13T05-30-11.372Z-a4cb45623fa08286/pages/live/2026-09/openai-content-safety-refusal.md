> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI 模型拒答不报错也不分类？新增 FAQ 讲清长什么样、怎么识别

> 新增 FAQ：GPT 系列遇到违反原厂使用政策的请求时返回 HTTP 200、finish_reason 为 stop 和一句拒答，没有错误码和类别，照常计费；翻译等结构化输出场景会表现为 JSON 解析失败。非流式请求已启用内容安全自动切换官方线路。

**2026/9/18 14:41 (UTC+8)** · 文档更新 · OpenAI

📚 **OpenAI 模型拒答时返回 200，不报错也不分类，翻译任务里会表现为 JSON 解析失败**

GPT 系列遇到违反原厂使用政策的请求，返回 HTTP 200、`finish_reason: "stop"` 和一句拒答文字，没有错误码，也没有拒答类别，并按正常输出计费。要求 JSON 输出的任务拿到的是一句普通文字，客户端就会报 `Unrecognized token` 之类的解析错误。

平台已对**非流式请求**启用内容安全自动切换：某条官方线路触发内容过滤时，会自动切换到其他官方线路重新处理；流式请求开始输出后无法切换。新 FAQ 给出拒答输出体示例和识别方法，并建议把失败 Case 内部存档分析后，再考虑改用其他模型重试，见 [OpenAI 模型拒答长什么样？](/faq/openai-content-safety-refusal)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.