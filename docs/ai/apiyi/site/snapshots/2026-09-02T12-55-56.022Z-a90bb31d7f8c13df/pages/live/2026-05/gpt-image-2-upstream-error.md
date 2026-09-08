> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2 官转 (企业分组) 报错源自 OpenAI 上游

> OpenAI 状态页显示 image generation API 错误率升高，目前 gpt-image-2 企业分组（官转 OpenAI API）出现卡顿与 The server had an error while processing your request. 报错，已确认是官方上游问题。

**2026/5/7 16:07 (UTC+8)** · 模型状态 · OpenAI

⚠️ **gpt-image-2 官转（企业分组）卡顿与报错源自 OpenAI 上游** —— 目前 `gpt-image-2` 企业分组（官转 OpenAI API）出现卡顿、报错 `The server had an error while processing your request.`，经核查 **OpenAI 官方状态页** 已挂出 `Increased error rate with image generation in the API`（Monitoring · Affects APIs），属上游官方故障，APIYI 直转通道与 OpenAI 同步受影响。

🔁 **状态参考**：`gpt-image-2-all`（官逆通道，走 ChatGPT 网页通道，不走官方 API）当前未在该故障范围内。后续我们会跟进 OpenAI 状态页恢复进度并更新此动态。

<Frame>
  <img src="https://mintcdn.com/apiyillc/6G_eO3td8qdCgLbM/images/openai-status-image-gen-error-20260507.png?fit=max&auto=format&n=6G_eO3td8qdCgLbM&q=85&s=f1d856920771dcf1977c83272e0808f5" alt="OpenAI 状态页：Increased error rate with image generation in the API — Monitoring · Ongoing for 8 minutes · Affects APIs" width="1762" height="1458" data-path="images/openai-status-image-gen-error-20260507.png" />
</Frame>

📖 官转 vs 官逆区别：[/api-capabilities/gpt-image-2/vs-gpt-image-2-all](/api-capabilities/gpt-image-2/vs-gpt-image-2-all)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
