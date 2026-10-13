> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 视频理解文档更新：除 Gemini 外，Seed、Qwen、Kimi 也能看视频

> 实测 19 个模型的视频理解能力：Seed 全系、Qwen 四款与 Kimi K3 可用，GPT、Grok、Claude、GLM、DeepSeek 不支持。文档补充通用 video_url 写法、各家输入限制与答案不可信的两种情况。

**2026/10/11 12:01 (UTC+8)** · 文档更新 · Google / ByteDance / Alibaba / Moonshot / OpenAI / xAI

📊 **[视频理解文档](/api-capabilities/video-understanding)已按 19 个模型的实测结果重写，不再只有 Gemini**

我们用同一段 10 秒测试视频逐个验证，结论如下：

* 可用：Seed 全系（`seed-2-0-pro-260328`、`dola-seed-2-1-turbo-260628` 等）、`qwen3.8-max` / `qwen3.8-flash` / `qwen3-vl-plus` / `qwen3.5-omni-plus`、`kimi-k3`、Gemini 系列
* 不支持：GPT、Grok、Claude、GLM、DeepSeek；其中 GPT 与 GLM 会静默丢掉视频并照常返回 200

通用写法是 `video_url`；旧的 `image_url` + `data:video/mp4` 写法只有 Gemini 认。页面还补充了抽帧兜底写法，以及答案不可信时的排查方法。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.