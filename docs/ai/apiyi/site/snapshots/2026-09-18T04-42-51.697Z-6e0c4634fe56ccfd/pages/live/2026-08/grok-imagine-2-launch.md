> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Imagine 2 图片模型上线，出 2K 约合官网 6.4 折

> xAI 第二代图像模型上架，grok-imagine-image $0.02/张、grok-imagine-image-quality $0.045/张，按次固定计费且不区分分辨率。官网 quality 版 2K 要 $0.07，我们两档统一 $0.045，叠加充值加赠后常规约 5.8 折。5 种宽高比与 1K/2K 参数实测精确生效，单次最多 10 张，参考图编辑支持 1-4 张融合。

**2026/8/13 01:08 (UTC+8)** · 新模型 · xAI

🚀 **Grok Imagine 2 图片模型上线，`Default` 分组即可调用，出 2K 约合官网 6.4 折**

xAI 8 月 7 日发布的第二代图像模型（官方名 Grok Imagine Image 2.0），我们接入的是**官转通道的 Quality Mode**。两个型号 `grok-imagine-image` 与 `grok-imagine-image-quality` 共用同一套接口与参数，区别只在画质档位与价格。**注意模型 ID 里不带 `2`**，不要写成 `grok-imagine-2-image`。

**价格是这次最值得说的一点**：xAI 官网的 quality 版**按分辨率分档**收费（1K \$0.05、2K \$0.07），我们**两档统一 \$0.045**——所以出的图分辨率越高相对越省，出 1K 约 9 折、**出 2K 约 6.4 折**。叠加[充值加赠](/faq/recharge-promotions)后，常规 \$100 档约 **5.8 折**、拉满约 **5.4 折**。标准版 \$0.02/张与官网持平。

约 220 次真实调用的实测结论：5 种宽高比 × 1K/2K 双档共 20 组，**输出像素与请求值 20/20 精确吻合**（16:9 出 2K 达 2816×1584）；`n` 支持 1–10；1K 约 9 秒出图、2K 约 15–17 秒，100 RPM 无压力。参考图编辑是**真编辑**——改指定部分、其余逐像素保留，多图融合支持 **1–4 张**，实测每多传一张输出就多一个对应主体。

接入时有两个口径要注意，**照上游厂商文档写会撞 400**：

* 图片编辑必须走 `/v1/images/edits` + `multipart/form-data` 文件上传，发 JSON 一律 400（好处是不需要图床，直接传本地文件）
* 参考图**不要**传给 `/v1/images/generations`，那样会返回 200 并正常出图，但参考图被静默丢弃且照常计费，没有任何错误提示

另外编辑端点的输出画幅**跟随第一张参考图**，`resolution` / `aspect_ratio` 在该端点传了不生效。

完整参数、迁移指南与代码示例见 [Grok Imagine 2 接入文档](/api-capabilities/grok-imagine-image/overview)，实测细节见 [上线说明](/news/grok-imagine-2-launch)。已经在用 GPT-Image-2 的团队可以直接看文档里的[迁移章节](/api-capabilities/grok-imagine-image/overview#从-gpt-image-2-迁移)——端点一样，但参数体系是另一套。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
