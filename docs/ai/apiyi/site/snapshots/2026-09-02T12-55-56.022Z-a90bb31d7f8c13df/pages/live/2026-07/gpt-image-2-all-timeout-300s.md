> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-all 偶现 300s 超时说明

> gpt-image-2-all 用时偏长的请求多为内容安全校验失败后触发号池重试所致。建议提示词与输入图保持合规，客户端 timeout 维持 300s 或适当缩短；已计费且用时达 300s 的调用将统一补发额度，预计 7/11（周六）处理。

**2026/7/6 15:24 (UTC+8)** · 模型状态 · OpenAI

⚠️ **`gpt-image-2-all` 偶现 300s 超时 · 与内容安全拦截有关**

排查发现，`gpt-image-2-all` 用时偏长的请求，多为内容安全校验失败后触发号池失败重试，多次重试叠加把整体耗时拉长——并非通道本身性能下降。

使用建议：

* 提示词与输入图片务必合规合理，从源头减少安全拦截引发的重试
* 客户端 `timeout` 控制在 300s 没问题，也可适当缩短，避免等待过久

补偿安排：日志中「`gpt-image-2-all` 已计费且用时达 300s」的调用，平台将统一补发额度，预计 2026/7/11（周六，UTC+8）统一处理。

感谢理解，我们持续运维。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
