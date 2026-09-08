> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.4+ 工具调用报 400：端点选型与迁移指南上线

> GPT-5.4 起的模型在 /v1/chat/completions 上同时传 tools 和显式 reasoning_effort 可能被上游直接 400 拒绝。新增一页文档，讲怎么确认自己撞上了、两条出路怎么选、代码逐字段怎么改。

**2026/9/2 19:45 (UTC+8)** · 文档更新 · OpenAI

📖 **GPT-5.4+ 在 chat 端点上「工具调用 + 显式推理档位」可能被直接拒绝**

请求带 `tools`、又显式传了非 `none` 的 `reasoning_effort` 时，上游会返回 400 `Function tools with reasoning_effort are not supported ...`。这是 OpenAI 从 GPT-5.4 系列起的官方限制，目的就是把工具调用推向 `/v1/responses`。

我们 9 月 2 日在默认分组做了实测：`low` / `medium` / `high` / `xhigh` 四个档位都会触发，**不传该参数则不触发**；是否触发还取决于请求落到哪条上游链路，同一个模型可能这次 200、下次 400，所以「我这次没报错」不能当作安全依据。

两条出路：带工具的请求改走 `/v1/responses`（推理和工具都保留），或显式设 `reasoning_effort="none"`（保住端点，放弃推理）。新页给了实测数据、两条路的取舍、带工具调用的完整前后代码对照，以及迁移后的验证清单。

📖 [端点选型与迁移](/api-capabilities/openai/responses-migration)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
