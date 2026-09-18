> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# kimi-k3 多轮工具调用 400 问题已修复

> kimi-k3 此前在 chat/completions 上只要把 tool_calls 历史回灌进第二轮请求就会稳定返回 400，根因在 API易 网关转发时多带了一个 function.parameters 字段，原厂校验严格直接拒绝。问题已于 9 月 11 日 10:24 (UTC+8) 修复并验收，流式与非流式均恢复，客户无需改动代码。

**2026/9/11 14:18 (UTC+8)** · 模型状态 · Moonshot

✅ **`kimi-k3` 带工具调用的多轮对话已恢复正常，此前的 400 问题就此结案**

坦诚交代：此前 `kimi-k3` 在 `/v1/chat/completions` 上，只要把 assistant 的 `tool_calls` 历史回灌进第二轮请求，就会稳定返回 400（`Extra inputs are not permitted … parameters`）。根因在 API易 网关这一侧：转发历史消息时多带了一个 `function.parameters` 字段，其它模型的原厂都会忽略它，而 `kimi-k3` 原厂校验严格、直接拒绝。首轮工具调用与纯文本多轮一直正常，`/v1/responses` 也不受影响，所以问题没有被监控捕获，直到客户反馈才定位，这是我们的疏漏。

修复已于 2026/9/11 10:24 (UTC+8) 上线并验收：流式与非流式回灌、多轮并行工具调用、第三方 agent 工具端到端全部跑通。无需调整代码或参数。

感谢反馈问题的客户，也为这段时间造成的困扰致歉，我们持续运维。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
