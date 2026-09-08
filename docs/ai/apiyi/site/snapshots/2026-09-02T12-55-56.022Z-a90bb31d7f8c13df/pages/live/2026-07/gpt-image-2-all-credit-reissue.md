> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-all 本周超时调用周末补发额度

> 本周 ChatGPT 官网生成图片故障波及 gpt-image-2-all，周末将统计出图日志中用时超过 300 秒的调用并统一补发额度。当前官方算力有所恢复但仍时有慢请求；对稳定性有硬性要求的场景可选官转 gpt-image-2。

**2026/7/10 00:45 (UTC+8)** · 服务通知 · OpenAI

⚠️ **`gpt-image-2-all` 本周超时调用将于周末统一补发额度 · 当前速度有所恢复但仍有波动**

本周 ChatGPT 官网生成图片故障（`status.openai.com` 可查看官方问题告示），`gpt-image-2-all` 随之受影响。本周末（预计 2026/7/11 起，UTC+8）将统计本周出图日志中用时超过 300 秒的调用，统一为客户补发额度。当前官方算力有所恢复，实测首字节多在 40-60 秒，但仍时有 220 秒以上的慢请求。

两点说明，便于按需选择通道：

* `gpt-image-2-all`：属逆向资源，可用性与 ChatGPT 官网同步——官网不故障，我们即稳定
* 官转 `gpt-image-2`：走官方 API、tokens 计费，稳定性可靠；1K 出图场景下价格差距并不大

欢迎用出图测试工具 [imagen.apiyi.com](https://imagen.apiyi.com) 实测对比两个通道。感谢耐心等待，我们持续运维。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
