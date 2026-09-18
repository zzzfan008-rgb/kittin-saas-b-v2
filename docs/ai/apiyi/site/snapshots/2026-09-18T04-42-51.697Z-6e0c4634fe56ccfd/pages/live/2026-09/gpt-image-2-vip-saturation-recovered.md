> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip 13:46–14:00 (UTC+8) 短暂饱和已恢复，根因是号池并发不足

> 9 月 5 日 13:46 至 14:00 (UTC+8) 约 15 分钟内，gpt-image-2-vip 因号池并发不足出现饱和，部分请求变慢或报错，14:00 整已恢复正常。官逆通道是与原厂平台风控持续对抗的过程，建议后续接入官转 gpt-image-2 作为兜底。

**2026/9/5 15:24 (UTC+8)** · 模型状态 · OpenAI

✅ **`gpt-image-2-vip` 于 13:46–14:00 (UTC+8) 出现约 15 分钟的并发饱和，14:00 整已恢复正常**

原因说明：饱和来自 `gpt-image-2-vip` 背后的号池并发不足，而非网关或参数问题。该模型走的是官逆通道，本质上是一个与原厂平台风控持续对抗的过程，号池容量会随风控动作波动，短时饱和难以完全避免。恢复后无需调整代码或参数。

建议后续在业务侧接上官转 `gpt-image-2` 作为兜底：两者同走 images API、参数兼容，`gpt-image-2-vip` 再遇波动时可自动回退，接入方式见 [gpt-image-2 接入文档](/api-capabilities/gpt-image-2/overview)。

感谢耐心等待，我们持续运维。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
