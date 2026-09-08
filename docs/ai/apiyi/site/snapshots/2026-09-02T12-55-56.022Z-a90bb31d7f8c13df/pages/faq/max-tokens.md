> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# max_tokens 是什么？不设置会怎样？

> 了解 max_tokens 参数的作用、OpenAI 参数名称演变、不设置时的默认行为，以及各大模型的最大输出 tokens 参考值。

## 简短回答

`max_tokens` 控制模型单次回复最多生成多少个 token。**API易 不对 max\_tokens 做额外限制**，该参数会直接透传给上游模型。你可以自行设置，不设置则使用模型的默认值。

<Info>
  **API易 的立场**：我们不强制限制 `max_tokens`，完全由你自行控制。不设置时，模型会使用各自的默认值输出。
</Info>

## max\_tokens 的作用

`max_tokens`（最大输出 token 数）是调用大模型 API 时最常见的参数之一，它告诉模型：**这次回复最多生成多少个 token**。

* 设置得**太小**：模型可能在回答到一半时被截断（返回 `finish_reason: "length"`）
* 设置得**太大**：不会强制模型生成那么多内容，但可能消耗更多费用（部分模型按输出 token 计费）
* **不设置**：使用模型的默认值（各厂商不同，见下方表格）

<Tip>
  **Token ≠ 字符**。中文大约 1 个汉字 ≈ 1-2 个 token，英文大约 1 个单词 ≈ 1-1.5 个 token。4,096 tokens 大约相当于 3,000 个中文汉字或 3,000 个英文单词。
</Tip>

## OpenAI 参数名称演变

OpenAI 在不同时期和不同 API 中使用了不同的参数名称，容易造成混淆：

| API 类型               | 参数名称                    | 适用模型                   | 引入时间              |
| -------------------- | ----------------------- | ---------------------- | ----------------- |
| Chat Completions API | `max_tokens`            | GPT-3.5、GPT-4、GPT-4o 等 | 最初版本              |
| Chat Completions API | `max_completion_tokens` | o1、o3、o4-mini 等推理模型    | 2024 年 9 月（o1 发布） |
| Responses API        | `max_output_tokens`     | GPT-4o、GPT-5.4、o3 等全系列 | 2025 年            |

### 为什么要改名？

2024 年 9 月 OpenAI 发布 o1 推理模型时，引入了「隐藏推理 token」的概念——模型内部会生成大量推理 token（reasoning tokens），但这些 token **不会出现在你的回复中**。

原来的 `max_tokens` 既表示「生成的 token 数」又表示「你收到的 token 数」，但在推理模型中这两者不再相等。因此 OpenAI 改用 `max_completion_tokens` 来明确表示「**你收到的回复 token 上限**」。

后来 Responses API 统一使用了 `max_output_tokens` 这个更直观的名称。

<Warning>
  **注意**：如果你使用 OpenAI 的 o 系列推理模型（如 o3、o4-mini），在 Chat Completions API 中**必须使用 `max_completion_tokens`** 而非 `max_tokens`，否则会报错。
</Warning>

## 不设置 max\_tokens 会怎样？

不同厂商的处理方式不同：

| 厂商                     | 不设置时的默认行为         | 说明                               |
| ---------------------- | ----------------- | -------------------------------- |
| **OpenAI**             | 无上限（输出到上下文窗口用完）   | 模型自行决定输出长度，不会被人为截断               |
| **Anthropic Claude**   | ❌ **必填参数，不设置会报错** | Claude API 要求必须显式指定 `max_tokens` |
| **Google Gemini**      | 默认 8,192 tokens   | 即使模型支持更大输出，不设置也只返回 8,192 tokens  |
| **DeepSeek（chat）**     | 默认 4,000 tokens   | 可手动提高到 8,000                     |
| **DeepSeek（reasoner）** | 默认 32,000 tokens  | 包含思维链输出，最大 64,000                |

<Warning>
  **特别注意**：Anthropic Claude API 的 `max_tokens` 是**必填参数**。如果不传这个参数，API 会直接返回错误。使用 Claude 模型时请务必设置。
</Warning>

## 各模型最大输出 tokens 参考

以下为主流模型的最大输出 token 数参考值。**实际数值请以各厂商官方文档为准**，因为模型更新频繁。

| 模型                | 模型标识                 | 最大输出 tokens | 上下文窗口     |
| ----------------- | -------------------- | ----------- | --------- |
| GPT-5.4           | `gpt-5.4-2026-03-05` | 128,000     | 1,047,576 |
| GPT-4o            | `gpt-4o`             | 16,384      | 128,000   |
| o3                | `o3`                 | 100,000     | 200,000   |
| Claude Opus 4.6   | `claude-opus-4-6`    | 128,000     | 1,000,000 |
| Claude Sonnet 4.6 | `claude-sonnet-4-6`  | 64,000      | 1,000,000 |
| Gemini 3.1 Pro    | `gemini-3.1-pro`     | 65,536      | 2,000,000 |
| DeepSeek V3       | `deepseek-chat`      | 8,000       | 64,000    |
| DeepSeek R1       | `deepseek-reasoner`  | 64,000      | 64,000    |

<Info>
  **官方文档参考**（获取最新数值）：

  * OpenAI：`platform.openai.com/docs/models`
  * Anthropic Claude：`docs.anthropic.com/en/docs/about-claude/models`
  * Google Gemini：`ai.google.dev/gemini-api/docs/models`
  * DeepSeek：`api-docs.deepseek.com/api/create-chat-completion`
</Info>

## 使用建议

<Tip>
  **最佳实践**：建议在每次 API 调用中**显式设置 `max_tokens`**，原因如下：

  * 避免不同模型/厂商的默认值差异导致意外截断
  * 控制输出长度，防止不必要的 token 消耗
  * Claude API 强制要求，养成统一习惯可减少出错
  * 典型设置：普通对话 `2048-4096`，长文生成 `8192-16384`，代码生成 `4096-8192`
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="API易 有没有对 max_tokens 做限制？">
    **没有**。API易 完全透传 `max_tokens` 参数给上游模型，不做任何额外限制。你设置多少，上游模型就按多少处理。唯一的限制来自模型本身的最大输出 token 上限。
  </Accordion>

  <Accordion title="max_tokens 设置得比模型最大值还大会怎样？">
    不会报错，模型会自动按自身的最大输出上限生成。例如 GPT-4o 最大输出 16,384 tokens，即使你设置 `max_tokens: 100000`，它最多也只会输出 16,384 tokens。
  </Accordion>

  <Accordion title="max_tokens 和 max_completion_tokens 有什么区别？">
    功能相同，都是限制输出 token 数。区别在于：

    * `max_tokens`：OpenAI 早期参数名，适用于 GPT 系列非推理模型
    * `max_completion_tokens`：2024 年 9 月起，OpenAI o 系列推理模型使用的参数名
    * `max_output_tokens`：OpenAI Responses API 统一使用的参数名

    通过 API易 调用时，按照你使用的模型和 API 格式选择对应参数名即可。
  </Accordion>

  <Accordion title="输出被截断了（finish_reason 为 length），怎么办？">
    这说明模型生成的内容达到了 `max_tokens` 上限。解决方法：

    1. 增大 `max_tokens` 值
    2. 优化 prompt，让模型生成更简洁的回复
    3. 检查是否使用了正确的参数名（o 系列模型需用 `max_completion_tokens`）
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="如何选择合适的 AI 模型？" icon="compass" href="/faq/model-selection-guide">
    根据应用场景选择最适合的模型
  </Card>

  <Card title="API 可以开多少并发？" icon="gauge" href="/faq/api-concurrency">
    了解不同模型的并发限制
  </Card>

  <Card title="Base URL 配置指南" icon="settings" href="/faq/base-url-config">
    各类工具中配置 API易 Base URL 的方法
  </Card>

  <Card title="API易-令牌管理" icon="key" href="https://api.apiyi.com/token">
    管理 API 密钥、查看用量和余额
  </Card>
</CardGroup>
