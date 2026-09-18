> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-5.x-chat-latest 系列被 OpenAI 下线，返回 404 model_not_found

> OpenAI 已停用 gpt-5.1/5.2/5.3-chat-latest 等版本化 chat-latest 模型，直连官方返回 404 model_not_found。这是上游模型退役而非链路故障，重试不会恢复，需改 model 字段迁移；GPT-5.6 系列 terra / sol / luna 三档可继续调用。

**2026/8/14 13:47 (UTC+8)** · 服务通知 · OpenAI

🗂️ **`gpt-5.x-chat-latest` 系列已被 OpenAI 下线，调用返回 404 `model_not_found`**

OpenAI 已停用 `gpt-5.1-chat-latest` / `gpt-5.2-chat-latest` / `gpt-5.3-chat-latest` 等版本化的 chat-latest 模型，直连官方返回 HTTP 404，错误体为 `The model gpt-5.3-chat-latest has been deprecated`，`type` 为 `invalid_request_error`、`code` 为 `model_not_found`。这是上游模型退役，不是本站链路故障，重试与换分组都不会恢复，需要改 `model` 字段迁移。

同为对话主力的 GPT-5.6 系列可继续调用，三档均为 100 万上下文（按需自选）：

* `gpt-5.6-terra`：\$2 / \$12 每 1M tokens，性能对标 GPT-5.5 而价格减半
* `gpt-5.6-sol`：\$5 / \$30 每 1M tokens，系列旗舰档，`gpt-5.6` 别名指向它
* `gpt-5.6-luna`：\$0.2 / \$1.2 每 1M tokens，轻量档，高并发与成本敏感场景

迁移只需替换请求里的 `model` 名，其余参数不变；实时价格与可用分组以[模型价格](/models)页为准。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
