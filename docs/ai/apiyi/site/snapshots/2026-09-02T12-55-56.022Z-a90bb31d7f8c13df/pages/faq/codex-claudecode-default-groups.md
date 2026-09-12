> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Codex、ClaudeCode 和 Default 分组有什么区别？

> 说明 CodexReverse、ClaudeCode 与 Default 令牌分组的来源、协议和日常开发使用建议。

## 简短回答

三个分组主要区别在于**上游来源、调用协议和适用工具**：

* **CodexReverse**：Codex 逆向资源通道，适合在 Codex 中日常开发，使用正常且缓存命中率较高
* **ClaudeCode**：为 Claude Code 和 Anthropic 原生 `/v1/messages` 环境准备的专属分组
* **Default**：通用官转分组，适合混合调用 GPT、Claude、Gemini、DeepSeek 等不同模型

## 三个分组怎么选

| 分组             | 主要特点                                 | 推荐场景                                                  |
| -------------- | ------------------------------------ | ----------------------------------------------------- |
| `CodexReverse` | Codex 逆向资源经济通道，来源性质与官方 API 官转不同      | Codex CLI、Codex 编程任务、成本敏感的开发调用                        |
| `ClaudeCode`   | 聚合兼容 Anthropic 原生 `/v1/messages` 的模型 | Claude Code、Anthropic 原生客户端、需要在 Claude Code 中使用兼容编程模型 |
| `Default`      | 通用官转资源，模型覆盖范围广                       | 日常混合开发、生产级稳定性优先、一个令牌调用多类模型                            |

<Info>
  **“官转”和“逆向”主要是上游资源来源不同。** `Default` 使用官方 API 转发资源；`CodexReverse` 使用 Codex 逆向资源。两者都可以正常调用，但生产稳定性、价格、缓存表现和可用模型可能不同。
</Info>

## 日常开发推荐配置

如果您同时使用 Codex 和 Claude Code，保留两把独立令牌是合理的：

* Codex 中使用 `CodexReverse` 令牌
* Claude Code 中使用 `ClaudeCode` 令牌
* 如果还需要在其他程序里混合调用多家模型，再额外保留一把 `Default` 令牌

这样可以避免协议和路由混用，也方便分别查看调用日志与费用。

<Warning>
  分组会影响可用模型、路由和计费倍率。`CodexReverse` 不等同于官方 API 官转资源；对生产级稳定性或来源合规要求较高的任务，建议优先使用 `Default` 官转分组并进行实际测试。
</Warning>

## 相关文档

* [什么是分组？](/faq/groups-explained)
* [令牌与分组](/faq/token-and-groups)
* [Codex CLI 接入指南](/scenarios/programming/codex-cli)
* [Claude Code 接入指南](/scenarios/programming/claude-code)
