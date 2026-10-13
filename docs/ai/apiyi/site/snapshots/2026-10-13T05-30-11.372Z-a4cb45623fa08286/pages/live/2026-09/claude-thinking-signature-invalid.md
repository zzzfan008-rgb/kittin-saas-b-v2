> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude 报思考签名无效、重试 10 次都失败？新增 FAQ 讲清原因与解法

> 新增 FAQ：Claude Code 或 Claude Agent 智能体开启思考时报 429 Invalid signature in thinking block，这不是限流，而是会话历史里的思考块签名失效，重试无效；新开会话即可解决，一个会话只用一个模型和一个 Key。

**2026/9/29 22:38 (UTC+8)** · 文档更新 · Anthropic

📚 **Claude 报 429 `Invalid signature in thinking block`？这不是限流，是会话历史里的思考签名失效**

真实工单：用 Cherry Studio 的「Claude Agent」智能体开着思考跑任务，主对话一直出不来，界面提示「请求过于频繁」并自动重试 10 次；控制台日志里却能看到正常计费，那些是客户端辅助用的小请求。原因是历史里第一轮的 `thinking` 块签名为空，原厂校验不通过。同一段历史每次都原样发送，所以怎么重试都会失败。

新 FAQ 列出签名失效的四种常见原因（客户端丢签名、历史被改动、中途换模型、中途换 Key 或分组），以及自己写代码时回传 `thinking` 块的正确做法。结论很简单：**新开会话即可恢复**，一个会话只用一个模型和一个 Key。详见 [Claude 多轮对话报「思考签名无效」怎么办？](/faq/claude-thinking-signature-invalid)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.