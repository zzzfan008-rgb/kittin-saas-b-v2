> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek 首个视觉模型上线，看图不额外加价

> deepseek-v4-flash-vision-exp 已接入，在 V4 Flash 底座上加了图像输入，定价与纯文本版完全一致。图片按尺寸折成输入 tokens，单图最多 384。OpenAI 与 Anthropic 两种格式都能调，各走各的分组。

**2026/8/21 23:41 (UTC+8)** · 新模型 · DeepSeek

🚀 **DeepSeek 首个视觉模型 `deepseek-v4-flash-vision-exp` 上线，看图不额外加价**

在 V4 Flash 底座上加了图像输入，1M 上下文与思考、函数调用、上下文缓存全部保留，
定价与纯文本版完全一致：输入 \$0.44、输出 \$1.32 每 1M tokens。图片按尺寸折成输入 tokens，
**单图最多 384**，大图自动缩到约 800×800 等效 —— 2000² 与 4000² 折出来完全一样，
上传前预压缩只省带宽、不省钱。传图支持 base64 内联与公网外链（单图 ≤ 32 MiB）。

两种协议都可用，**按协议选分组**：

* OpenAI 格式（`/v1/chat/completions`、`/v1/responses`）：令牌选 `default` 分组
* Anthropic 格式（`/v1/messages`，含 Claude Code 等客户端）：令牌选 `ClaudeCode` 分组

两个分组同价，选分组只影响能力、不影响计费。我们已完成 124 个用例、约 1100 次调用的实测，
三种传图通道、四种图片格式、`detail` 省 token 的细节都写进了文档。

📖 [DeepSeek V4 Flash Vision 概览](/api-capabilities/deepseek-v4-flash-vision/overview)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
