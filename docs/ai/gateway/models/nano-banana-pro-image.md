# Nano Banana Pro（官转 · Google Gemini 3 Pro Image）

API易官转模型 `gemini-3-pro-image-preview`（别名 `gemini-3-pro-image`、Nano Banana Pro），按次 $0.09/张。

- 端点：`POST /v1beta/models/{model}:generateContent`（Gemini 原生格式）。
- `generationConfig.imageConfig.imageSize`：`1K` / `2K` / `4K`；`aspectRatio`：10 种宽高比。
- 响应：`candidates[].content.parts[].inlineData`（base64），异构 parts，需扫描所有图片 part。
- 本文件是经审查的本地契约摘录，原始页面见 `sources.json` 中 `apiyi-nano-banana-pro-*` 源。
