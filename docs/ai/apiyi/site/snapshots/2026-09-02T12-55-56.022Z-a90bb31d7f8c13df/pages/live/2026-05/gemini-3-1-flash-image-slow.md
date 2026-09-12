> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gemini-3.1-flash-image-preview 偶现较慢

> gemini-3.1-flash-image-preview 当前偶现 2-4 分钟较慢的情况，与谷歌上游负载波动相关；同时段 gemini-3-pro-image-preview（Nano Banana Pro）运行稳定。

**2026/5/14 10:11 (UTC+8)** · 模型状态 · Google

⚠️ **`gemini-3.1-flash-image-preview` 偶现较慢（2-4 分钟）** —— 同步：当前 `gemini-3.1-flash-image-preview` 偶发响应较慢，单次出图时间集中在 **2-4 分钟** 区间，根因与 **谷歌上游本身的负载波动** 相关，中转侧无法消化。同时段 `gemini-3-pro-image-preview`（即 Nano Banana Pro）运行稳定，调用基本符合预期。

💡 **应对建议**：客户端可适当 **调高 timeout** 并加 **指数退避重试**，给上游留出充足处理窗口；后续上游负载回落会同步更新此动态。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
