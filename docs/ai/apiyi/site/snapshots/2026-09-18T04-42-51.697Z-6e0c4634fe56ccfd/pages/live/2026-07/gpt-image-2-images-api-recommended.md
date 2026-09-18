> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip / -all 推荐使用 Images API 端点出图

> 官逆两模型 gpt-image-2-vip 与 gpt-image-2-all 推荐统一使用 OpenAI Images API 的 /v1/images/generations 与 /v1/images/edits 端点：与官网调用方式标准对齐、供给更稳。对话式端点仍可用但不再主推，文档已同步调整。

**2026/7/6 18:46 (UTC+8)** · 服务通知 · OpenAI

📣 **`gpt-image-2-vip` / `gpt-image-2-all` 推荐统一使用 OpenAI Images API 两个端点出图**

出于**与官网统一调用方式标准**和**供给更稳**两方面考虑，官逆两模型推荐使用 `/v1/images/generations`（文生图）与 `/v1/images/edits`（图片编辑）：与官转 `gpt-image-2` 同套代码、`size` 等参数完全兼容，互切只需改 `model` 名；同时上游对 Images API 通道的资源供给更充足，调用成功率更高。

对话式端点（`/v1/chat/completions`）仍可正常调用，但**不再主推**、不建议用它生成图片，仅保留给多轮迭代改图、直接传在线图片 URL 的场景。文档已同步调整，详见 [GPT-Image-2-All 概览](/api-capabilities/gpt-image-2-all/overview) 与 [GPT-Image-2-VIP 概览](/api-capabilities/gpt-image-2-vip/overview)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
