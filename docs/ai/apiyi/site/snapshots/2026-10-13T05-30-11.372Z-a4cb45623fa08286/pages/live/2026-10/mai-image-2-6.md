> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 微软 MAI-Image 2.6 图像模型上线

> 微软自研图像模型 MAI-Image-2.6 与 MAI-Image-2.6-Flash 上线，官转接入，支持文生图与参考图编辑，中文文字渲染出色；按次计费 0.12 / 0.06 美元一张、不区分尺寸，default 分组即可调用。

**2026/10/3 18:59 (UTC+8)** · 新模型 · Microsoft

🚀 **微软 `MAI-Image-2.6` / `MAI-Image-2.6-Flash` 上线，按次 \$0.12 / \$0.06 一张、不区分尺寸**

微软 AI 自研的图像模型，9/4 在 Microsoft Foundry 公开预览，发布时 Arena 文生图与图片编辑均排第 2。API易 走微软官方渠道接入，支持文生图（`/v1/images/generations`）与参考图编辑（`/v1/images/edits`），中文招牌、对联等文字能逐字正确渲染。

* 尺寸：`width` + `height` 自定义，最高 1536×1536 面积
* 分组：`default` 即可调用
* 注意：不要传 `response_format` / `seed` / `negative_prompt`（返回 400）；编辑只支持 multipart 文件上传；不支持 chat 端点

详见 [接入文档](/api-capabilities/mai-image/overview)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.