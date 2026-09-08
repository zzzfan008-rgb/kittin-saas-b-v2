> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gemini-3.1-pro-preview 偶发超时：谷歌原厂算力吃紧报 429

> gemini-3.1-pro-preview 当前出现时常超时，根因为谷歌上游算力吃紧，官方报 status_code=429 Resource has been exhausted (e.g. check quota)。建议适当调高客户端 timeout、增加重试机制，任务可容忍降级时也可视情况临时改用 gemini-2.5-pro。

**2026/5/11 23:05 (UTC+8)** · 模型状态 · Google

⚠️ **gemini-3.1-pro-preview 偶发超时：谷歌原厂算力吃紧报 429** —— 同步：`gemini-3.1-pro-preview` 当前出现时常超时，根因在谷歌上游算力吃紧。**即便我们账号侧并发充足**，官方仍会返回 `status_code=429, Resource has been exhausted (e.g. check quota).`，属谷歌原厂配额耗尽，无法在中转侧消化。

💡 **应对建议（视任务自行判断）**：

* 根据任务复杂度**适当调高客户端 timeout**，长任务给上游留出充足窗口
* 在客户端加 **重试机制**（带指数退避），命中 429 时自动重试通常能恢复
* 若任务可容忍降级，也可视情况临时改用 `gemini-2.5-pro`；该模型当前运行稳定

后续上游恢复时会同步更新此动态。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
