> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# glm-5.3-flash 与 Seed 2.0 系列走 Responses 调用，建议使用 CodexResponses 分组

> 用 Codex 等客户端以 Responses 接口调用 glm-5.3-flash、dola-seed-2.1-turbo 或 Seed 2.0 系列时，令牌分组改为 CodexResponses 可减少平台内部重试、响应更快；Chat Completions 调用不受影响，继续用默认分组即可。

**2026/9/30 18:13 (UTC+8)** · 服务通知 · Zhipu / ByteDance

💡 **用 Responses 接口调用 `glm-5.3-flash` 或 Seed 2.0 系列，建议把令牌分组设为 `CodexResponses`，响应更快**

默认分组里同时有 Chat Completions 和 Responses 两类通道。Codex 这类客户端发出的 `/v1/responses` 请求，有时会先分到只支持 Chat Completions 的通道，被拒绝后平台再自动重试到 Responses 通道。结果不受影响，但每次会多等几秒到几十秒。`CodexResponses` 是 Responses 专用分组，请求直接进入 Responses 通道，没有这次内部重试。

适用模型（`CodexResponses` 分组均已开通）：

* `glm-5.3-flash`
* `dola-seed-2-1-turbo-260628`
* Seed 2.0 系列：`seed-2-0-pro-260328`、`seed-2-0-lite-260428`、`seed-2-0-mini-260428`、`seed-2-0-code-preview-260328` 等

在控制台的令牌设置里把分组改为 `CodexResponses` 即可，Key 不变。用 Chat Completions（`/v1/chat/completions`）调用的不受影响，继续用默认分组就行。模型详情见 [glm-5.3-flash](/models/glm-5-3-flash)、[dola-seed-2.1-turbo](/models/dola-seed-2-1-turbo)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.