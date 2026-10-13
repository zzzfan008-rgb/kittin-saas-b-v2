> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图像理解文档更新：24 个模型实测，四种写法各自支持谁

> 图像理解页按 24 个模型的实测重写：新增 Gemini 3.8 Flash、GPT-6、Claude 5.5、Seed、Qwen3.8、Kimi K3 等，标清四种调用写法各自支持的模型，补充大图缩放、直链与 Agent 接入提示词。

**2026/10/11 17:59 (UTC+8)** · 文档更新 · Google / OpenAI / Anthropic / ByteDance / Alibaba / Moonshot

📊 **[图像理解文档](/api-capabilities/vision-understanding)已按 24 个模型的实测结果全面重写**

我们用同一张中英混排订单图逐个验证 OCR、计数、多图对比与公网直链，主要结论：

* 22 个视觉模型用 OpenAI 兼容的 `image_url` 写法全部可用，`gemini-3.8-flash`、`claude-sonnet-5-5`、`gpt-6-sol` 全项通过
* Responses 与 Anthropic 写法只支持部分模型，Grok 走 Anthropic 端点会静默丢图
* 大图要先缩放：9000×6000 的图在 `gpt-6-sol` 上一张记 63658 tokens，Claude 超 10MB 直接拒收；缩到长边 2048px 后全部通过

页面同时新增 AI Agent 接入提示词，并删除了已不成立的「GPT 只支持 temperature=1」提示。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.