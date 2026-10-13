> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude 返回 200 但 content 为空？新增 FAQ 讲清拒答的形态与处理

> 新增 FAQ：Claude 触发原厂安全策略时不报错，返回 HTTP 200、空 content 与 stop_reason: refusal，并在 stop_details 里给出拒答类别；FAQ 给出四种调用格式的实测输出体、按原厂规则的计费方式和识别代码。

**2026/9/29 13:10 (UTC+8)** · 文档更新 · Anthropic

📚 **Claude 返回 200 但 `content` 为空、取 `content[0]` 报错？这是模型拒答，不是接口故障**

真实工单：用 Claude 批量判断代码是否存在漏洞，一部分样本在 1\~2 秒内返回 HTTP 200，`content` 为空数组、`output_tokens` 为 0，脚本在 `message.content[0]` 上崩溃。原因是请求触发了原厂的网络安全防护：响应的 `stop_reason` 为 `refusal`，`stop_details.category` 为 `cyber`。OpenAI 兼容格式下则是空字符串加 `finish_reason: "refusal"`。

新 FAQ 给出原生 / OpenAI 兼容、流式 / 非流式四种实测输出体，五个拒答类别，按原厂规则的计费方式（`cyber`、`general_harms` 类在输出前拒答不计费），以及两种 SDK 的识别代码，见 [Claude 拒答为什么返回空内容？](/faq/claude-content-safety-refusal)。文档侧栏「Claude 原生调用」下新增「Claude常见问题」子栏目。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.