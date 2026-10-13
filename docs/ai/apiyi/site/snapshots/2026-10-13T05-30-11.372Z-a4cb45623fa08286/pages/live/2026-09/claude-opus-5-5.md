> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 5.5 已上线，价格低于 Opus 5

> Anthropic 9 月 22 日发布的 Claude Opus 5.5 已在 API易 上线，模型名 claude-opus-5-5 与 claude-opus-5-5-thinking，default、svip、ClaudeCode 分组可用。定价输入 4 美元、输出 20 美元每百万 tokens，缓存读取 0.20 美元，四项计费与官网一致；从 Opus 5 迁移前注意思考无法关闭、强制工具调用报 400、effort 默认降为 medium。

**2026/9/23 13:27 (UTC+8)** · 新模型 · Anthropic

🚀 **`claude-opus-5-5` 已上线，Fable 级表现，价格比 Opus 5 更低**

Anthropic 9/22 发布的 Claude 5.5 系列首款模型，Terminal-Bench 4.0 得分 66.4%，超过 Fable 5.1 的 55.8%。API易 同时提供 `claude-opus-5-5` 与 `claude-opus-5-5-thinking`，`default` / `svip` / `ClaudeCode` 分组可用，OpenAI 兼容与 Anthropic 原生双端点均可调用。定价输入 \$4 / 输出 \$20 / 缓存读取 \$0.20 每百万 tokens，四项计费与官网一致。

从 Opus 5 迁移前请注意：

* 思考无法关闭，`thinking: {"type": "disabled"}` 会返回 400
* `tool_choice` 为 `any` / `tool` 会返回 400
* effort 默认值从 `high` 降为 `medium`，编程任务建议显式设置

📖 完整基准、迁移清单与代码示例：[Claude Opus 5.5 上线](/news/claude-opus-5-5-launch)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.