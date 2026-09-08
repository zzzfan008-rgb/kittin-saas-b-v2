> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip 恢复正常速度，并发可以放开跑

> 8 月 26 日 gpt-image-2-vip 的出图速度已回到日常水平，非流式首字节实测集中在 37–55 秒，昨天的压低并发建议不必再保持。原厂侧同时恢复了 4K 输出与 quality 参数，按次计费 $0.03 每请求。

**2026/8/26 13:15 (UTC+8)** · 模型状态 · OpenAI

✅ **`gpt-image-2-vip` 已恢复正常速度，并发可以放开跑**

昨天下午起的饱和已经过去。今天 13:13–13:14 (UTC+8) 的实测日志里，非流式调用的**首字节耗时集中在 37–55 秒**，个别到 66–71 秒，相比昨天的 82–190 秒回到日常水平。此前「压低并发、遇 429 自行重试」的临时建议**不必再刻意保持**，并发可以按业务需要往上加。

<Frame caption="2026/8/26 13:13–13:14 (UTC+8) 的 gpt-image-2-vip 调用日志，首字节耗时集中在 37–55 秒">
  <img src="https://mintcdn.com/apiyillc/c28UKRpk95VIIz0F/images/gpt-image-2-vip-speed-log-20260826.png?fit=max&auto=format&n=c28UKRpk95VIIz0F&q=85&s=8327c77c8f02028d93210de26d3d0757" alt="控制台日志列表：多条 gpt-image-2-vip 非流式调用记录，首字节耗时 37 秒至 71 秒不等" width="882" height="1422" data-path="images/gpt-image-2-vip-speed-log-20260826.png" />
</Frame>

同时，原厂侧确认 `gpt-image-2-vip` **重新支持 4K 输出与 `quality` 参数**：

* 端点：出图 `/v1/images/generations`、编辑 `/v1/images/edits`
* `size`：常见 1K / 2K / 4K 尺寸
* `quality`：`low` / `medium` / `high`
* 计费：按次 **\$0.03 / 请求**，请使用 `default` 分组的**按次计费令牌**调用

参数细节与代码示例见 [gpt-image-2 概述](/api-capabilities/gpt-image-2/overview)。感谢这两天的耐心等待，我们会持续盯着这条通道的水位。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
