# GPT Image 2.5 All（官逆 · ChatGPT 网页版线路）

API易官逆模型 `gpt-image-2.5-all`（别名 `gpt-image-2-all`），按次 $0.03/张，约 30–60 秒出图。

- 端点：`POST /v1/images/generations`（文生图）、`POST /v1/images/edits`（multipart，`image` 字段可重复）。
- 不接受 `size` / `quality` / `n` / `aspect_ratio`，尺寸靠 prompt 控制；单次返回 1 张。
- 响应：`b64_json`（默认，纯 base64）或显式 `response_format: "url"`。
- 本文件是经审查的本地契约摘录，原始页面见 `sources.json` 中 `apiyi-gpt-image-2-all-*` 源。
