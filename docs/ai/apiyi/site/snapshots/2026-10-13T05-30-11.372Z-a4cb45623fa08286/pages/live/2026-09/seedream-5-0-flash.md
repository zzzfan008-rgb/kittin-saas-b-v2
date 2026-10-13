> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream 5.0 Flash 上线：一张图 $0.018，约 15–20 秒出图

> BytePlus 新出的快速出图模型 seedream-5-0-flash-260915 已上线：按次 $0.018 与官方同价，参考图不收费，实测 15–20 秒出图、中文排版准确。不支持组图与流式，透明图层走分层并按输出张数计费。

**2026/9/24 19:06 (UTC+8)** · 新模型 · ByteDance

🚀 **`seedream-5-0-flash-260915` 已上线，按次 \$0.018，全系最便宜**

BytePlus 新出的快速出图模型，主打速度、排版和低成本。上架当天实测：文生图 15–20 秒，中文海报三行文字全部准确；参考图不收费，1 张和 10 张参考图都只扣 \$0.018。定价与官方一致，叠加充值加赠约官方的 91 折到 83 折。

接入前请留意：

* 不支持 `sequential_image_generation` 和 `stream`，传任何值都返回 400
* 不传 `watermark: false` 时默认带「AI generated」水印
* 透明素材要用 `layer_decomposition` 分层，按输出张数计费，一次常见十几张

完整解读见 [Seedream 5.0 Flash 上线](/news/seedream-5-0-flash-launch)，参数说明见 [Seedream 总览](/api-capabilities/seedream-image/overview)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.