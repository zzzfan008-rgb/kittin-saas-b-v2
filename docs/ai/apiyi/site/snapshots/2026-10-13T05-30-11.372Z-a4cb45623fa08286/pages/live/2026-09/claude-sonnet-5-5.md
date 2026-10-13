> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Sonnet 5.5 上线，价格与 Sonnet 5 相同

> Anthropic 9 月 28 日发布的 Claude Sonnet 5.5 已上线 API易，Terminal-Bench 4.0 官方分 70.6% 超过 Opus 5.5，定价 $2/$10 每百万 tokens 与官网一致，从 Sonnet 5 迁移需把 thinking disabled 改为 between_tools。

**2026/9/30 00:51 (UTC+8)** · 新模型 · Anthropic

🚀 **`claude-sonnet-5-5` 已上线，定价 \$2 / \$10 每百万 tokens，四项计费与官网一致**

Anthropic 9 月 28 日发布的 Claude 5.5 系列第二款，1M 上下文、速度比 Sonnet 5 快三成，Terminal-Bench 4.0 官方分 70.6%，超过 Opus 5.5 的 66.4%。同时提供 `claude-sonnet-5-5-thinking`，`default` / `svip` / `ClaudeCode` 分组可用。

从 Sonnet 5 迁移注意：`thinking: {"type": "disabled"}` 改为 `between_tools`，`tool_choice` 的 `any` / `tool` 返回 400，`top_p` / `top_k` 也会报错（状态码显示 429，不是限流）。完整说明见 [Claude Sonnet 5.5 上线解读](/news/claude-sonnet-5-5-launch)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.