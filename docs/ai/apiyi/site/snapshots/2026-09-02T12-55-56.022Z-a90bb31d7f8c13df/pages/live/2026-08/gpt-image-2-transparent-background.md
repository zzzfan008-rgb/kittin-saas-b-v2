> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2 支持透明背景，一个参数直接出带 alpha 通道的 PNG

> OpenAI 为 GPT-Image-2 开放了 background 参数的 transparent 取值，APIYI 已实测可用。传 background 为 transparent 并把 output_format 设为 png 或 webp，返回的就是带 alpha 通道的透明底图，文生图、图片编辑、Responses 出图工具三条路都支持，透明不额外计费。

**2026/8/21 16:57 (UTC+8)** · 新模型 · OpenAI

🚀 **`gpt-image-2` 支持透明背景了，一个参数直接出带 alpha 通道的 PNG，不用再自己抠图**

OpenAI 今天为 GPT-Image-2 开放了 `background` 参数的 `transparent` 取值（官方标注为 preview），APIYI 已实测可用。请求里加两个字段就行：`"background": "transparent"` 加 `"output_format": "png"`，返回的图就是真 alpha 通道的透明底 PNG。`webp` 同样支持 alpha，体积更小。

三条路都通：文生图 `/v1/images/generations`、图片编辑 `/v1/images/edits`、`/v1/responses` 的 `image_generation` 工具。蒙版局部重绘（`mask`）与透明背景可以同时用，互不冲突。**透明不额外计费**——相同画质档与尺寸下，`transparent` 与 `opaque` 消耗的 image token 完全一致。

两个边界要知道：

* `jpeg` 没有 alpha 通道，与透明互斥，`output_format` 传 `jpeg` 会 400，改用 `png` 或 `webp`
* 编辑接口传透明时是**重绘去背**，不是沿原图轮廓精确抠像，主体细节会有变化；要像素级还原请自行用 `rembg` / `PIL` / `sharp` 处理

官逆的 `gpt-image-2-all` 与 `gpt-image-2-vip` 没有 `background` 参数，只能在提示词里要求透明背景，偶现不稳定；需要稳定透明底用官转 `gpt-image-2`。

各模型的支持情况、最小示例与常见报错见 [怎么生成透明背景的图片](/faq/image-transparent-background)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
