> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash 正式版上线

> deepseek-v4-flash-ga-260731 上架，与官方同价 $0.14/$0.28 每 1M tokens。实测 32.2 万 tokens 上下文 14.77 秒返回、隐式缓存二轮命中 99.9%、20 并发零限流；双端点可用、显式缓存链式命中，结构化输出与联网搜索不可用。

**2026/8/5 23:29 (UTC+8)** · 新模型 · DeepSeek

🚀 **DeepSeek V4 Flash 正式版上线，\$0.14/\$0.28 每 1M tokens 与官方同价**

`deepseek-v4-flash-ga-260731` 对应 DeepSeek 7 月 31 日转正式的开源检查点 `DeepSeek-V4-Flash-0731`。架构与预览版一致（284B 总参 / 13B 激活 MoE、1M 上下文、384K 最大输出），官方明确只重做了后训练阶段，但五项 agent 基准均反超 V4-Pro 预览版，Terminal Bench 2.1 达 82.7。

上线前完成 21 个用例实测：32.2 万 tokens 上下文 **14.77 秒**返回并准确捞出中段信息，上下文硬上限 1,048,570 tokens；隐式缓存免配置、第二轮命中 99.9%；20 并发全部成功无限流。

Chat Completions 与 Responses **双端点均可用**。Responses 端显式缓存需走链式调用：首轮带 `caching: {"type": "enabled"}` 写入，后续用 `previous_response_id` 链下去，实测每轮整体命中上一轮全部上下文（15,629 → 15,664 → 15,701）。

接入前需知道的三项边界：

* 结构化输出 `response_format` / `text.format` 双端点均收参但不约束，返回 200 却完全无视 schema，需要强约束请走 Function Call
* 联网搜索工具已接通（能看到 `web_search_call`），但搜索后端 6/6 报错、不返回 `results`；MCP 返回 `AccessDenied`，属账号级内置工具权限
* `reasoning_effort` 非单调档位，仅 `minimal` 确定性生效；控成本建议用 `thinking: {"type": "disabled"}`

该模型为纯文本，不支持图片输入，也未开通 Anthropic 端点。需要 Claude Code 接入的场景请用 `deepseek-v4-flash`。

完整实测数据见 [上线说明](/news/deepseek-v4-flash-ga-launch)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
