> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2 状态：默认分组饱和 · 企业分组仍可正常出图

> gpt-image-2 默认分组当前持续饱和，请把令牌分组直接切到 image2Enterprise 企业分组。最新调用日志显示企业分组首字节 35–293 秒区间内仍可正常出图，部分默认分组请求已通过兜底路由进入企业分组。

**2026/5/13 14:32 (UTC+8)** · 模型状态 · OpenAI

⚠️ **`gpt-image-2` 当前状态：默认分组饱和，仍请使用 `image2Enterprise` 企业分组** —— 同步：`gpt-image-2` 默认分组近期持续饱和（排队 / 超时偏多），**企业分组 `image2Enterprise` 当前可正常出图**。今天下午 (5/13 14:29–14:31 UTC+8) 调用日志显示，企业分组首字节集中在 **35–293 秒** 区间，非流式调用均正常返回，提示 / 补全 token 量级正常；部分仍在使用默认分组的请求已通过 **「兜底命中 Default → image2Enterprise」** 自动路由进入企业分组。

<Frame>
  <img src="https://mintcdn.com/apiyillc/dzF0LRNrHbNWs5rJ/images/gpt-image-2-enterprise-call-log-20260513.png?fit=max&auto=format&n=dzF0LRNrHbNWs5rJ&q=85&s=b85d44cdcf196bc8c870908efcd1e97e" alt="gpt-image-2 调用日志 5/13 14:29–14:31：9 条非流式调用全部路由到 image2Enterprise 企业分组，首字节 35-293 秒不等，1.2x 倍率，最后一条显示『兜底命中 Default → image2Enterprise』" width="1648" height="1212" data-path="images/gpt-image-2-enterprise-call-log-20260513.png" />
</Frame>

💡 **使用建议**：把令牌的模型分组**直接切到 `image2Enterprise`**，避免依赖兜底路由（也省去默认分组失败/排队的时间）。企业分组并发高、出图稳定，**1.2x 倍率**保供给（平台不赚钱）。

📖 如何调整令牌分组（含截图）：[/live/2026-04/image2-enterprise](/live/2026-04/image2-enterprise)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
