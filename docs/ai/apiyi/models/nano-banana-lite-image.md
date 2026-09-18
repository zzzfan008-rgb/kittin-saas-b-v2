# Nano Banana 2 Lite（官转 · Google Gemini 3.1 Flash Lite Image）

API易官转模型 `gemini-3.1-flash-lite-image`（Nano Banana 2 Lite），按次 $0.025/张，约 4 秒出图。

- 端点：`POST /v1beta/models/{model}:generateContent`（Gemini 原生格式）。
- `generationConfig.imageConfig.imageSize`：仅 `1K`；`aspectRatio`：14 种宽高比。
- 响应：`candidates[].content.parts[].inlineData`（base64），异构 parts，需扫描所有图片 part。
- 本文件是经审查的本地契约摘录，原始页面见 `sources.json` 中 `apiyi-nano-banana-lite-*` 源。
