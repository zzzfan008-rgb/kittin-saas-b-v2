> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Fable 5.1 上线：同价升级，缓存读取降至四分之一

> Anthropic 于 2026 年 9 月 1 日发布的 Mythos 级新旗舰 claude-fable-5-1 已在 API易 上线，另有 claude-fable-5-1-thinking，default / svip / ClaudeCode 三个分组与双端点均可用。最显著的变化是缓存读取从 1 美元降到 0.25 美元，我们已同步下调，四项计费与官网逐项一致。有三项破坏性变更需要在迁移前核对。

**2026/9/2 11:16 (UTC+8)** · 新模型 · Anthropic

🚀 **`claude-fable-5-1` 已上线，缓存读取从 \$1.00 降到 \$0.25，我们已同步下调**

Anthropic 于 9 月 1 日发布的 Mythos 级新旗舰，同时上线的还有 `claude-fable-5-1-thinking`。这一代最显著的变化就是**缓存读取价格**：从 \$1.00 降到 **\$0.25 / 百万 tokens**（0.025x 基础输入价，其余 Claude 模型是 0.1x），长周期 Agent 会话反复读取同一段缓存前缀时降幅最直接；输入 \$10 / 输出 \$50 每百万 tokens 保持不变。\*\*我们的定价与官网一致——输入、输出、缓存读取、缓存创建四项逐项相同，缓存读取已同步改到 \$0.25。\*\*规格上是 100 万 token 上下文、12.8 万 token 最大输出，自适应思考恒开、由 `effort` 参数控制深度（默认 `high`）。

可用范围（按需自选）：

* `default` / `svip` 分组：OpenAI 兼容格式，`https://api.apiyi.com/v1`
* `ClaudeCode` 分组：Anthropic 原生格式，`https://api.apiyi.com`（该分组另有折扣，可与充值加赠叠加——这部分是我们的让利，与模型定价无关）

⚠️ 从 `claude-fable-5` 迁移前请核对三项破坏性变更：`tool_choice` 设为 `any` 或 `tool` 的强制工具调用会返回 400；思考块与产出它的模型绑定，中途切回更早模型会丢失该轮推理；编辑历史消息（改 `system`、改 `tools`、注入又删除的临时提醒）会让后续思考块失效——把会话当成只追加来维护即可规避。数据保留方面，Fable 5.1 与 Mythos 5.1 同属受涵盖模型，输入输出在原厂侧保留 30 天用于滥用检测，API易 自身不保留数据。

完整规格、性能对比与迁移清单见 [Claude Fable 5.1 上线深度解读](/news/claude-fable-5-1-launch)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
