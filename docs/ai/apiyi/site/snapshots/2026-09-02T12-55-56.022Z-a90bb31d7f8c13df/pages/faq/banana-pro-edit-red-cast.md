> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# banana pro 改图后画面偏红怎么办？

> banana pro 改图后画面整体偏红/偏暖的常见缓解路径：切换 Vertex 通道，或改用 gpt-image-2。

## 简短回答

Nano Banana Pro（`gemini-3-pro-image`）改图后画面整体偏红/偏暖是改图场景下出现较多的情况。常见可尝试的缓解路径有两种：

1. 把 banana pro 切到 Vertex 通道再试
2. 改用 gpt-image-2

## 详细说明

### banana pro 默认走的是哪条通道？

API易 上 Nano Banana Pro 默认分组**走的是官转 AI Studio 线路**，Vertex 作为独立算力池在 AIStudio 出问题时顶上（详见 [Google 系模型走 AI Studio 还是 Vertex？](/faq/google-upstream-aistudio-vertex)）。

### 怎么切到 Vertex 通道？

Vertex 在 API易 控制台里以**独立分组**形式提供。在创建或编辑令牌时，从「选择分组」里挑到 Vertex 相关的分组即可，调用方式不变，**代码层无需修改**（详见 [Google 系模型走 AI Studio 还是 Vertex？](/faq/google-upstream-aistudio-vertex)）。

### 改用 gpt-image-2 是否能解决？

gpt-image-2 在改图场景下整体色彩保真度通常更好，可作为备选方案评估，详见 [GPT-Image-2 图片编辑 API](/api-capabilities/gpt-image-2-all/image-edit)。

## 排查步骤

<Steps>
  <Step title="先在网页端复测">
    打开 `imagen.apiyi.com` 网页端，使用相同的参考图 + 编辑指令再测一次。

    * 如果网页端也偏红 → 大概率是模型在该提示词下的表现，可走 Vertex / gpt-image-2 备选
    * 如果网页端不偏红 → 排查接入链路（参考 [图片与参考图差异过大排查](/faq/image-result-differs-from-reference)）
  </Step>

  <Step title="确认参考图为 base64 上传">
    banana pro 系列**不支持 OpenAI 格式上传参考图**，必须用 base64（参考 [图片与参考图差异过大排查](/faq/image-result-differs-from-reference)）。如果参考图是 URL 直接放进 `image_url`，得到的图本身就是模型"猜"的，偏红也可能与参考图没真正传进去有关。
  </Step>

  <Step title="尝试换 Vertex 通道">
    在控制台给令牌选 Vertex 分组，重跑同一指令。记录色偏程度差异。
  </Step>

  <Step title="尝试 gpt-image-2">
    如果 Vertex 通道仍偏色，作为兜底再试 gpt-image-2。注意出图风格会与 banana pro 有差异，需要重新调提示词。
  </Step>
</Steps>

## 常见问题

<AccordionGroup>
  <Accordion title="gpt-image-2 和 banana pro 在改图上的差别？">
    banana pro 偏向"画风化重绘"，gpt-image-2 偏向"原图微调"。如果你的诉求是尽量贴近原图色彩，gpt-image-2 通常更合适。
  </Accordion>
</AccordionGroup>

## 相关文档

* [Google 系模型走 AI Studio 还是 Vertex？](/faq/google-upstream-aistudio-vertex)
* [图片与参考图差异过大排查](/faq/image-result-differs-from-reference)
* [Nano Banana Pro 图片编辑 API](/api-capabilities/nano-banana-image/image-edit)
* [GPT-Image-2 图片编辑 API](/api-capabilities/gpt-image-2-all/image-edit)

## 联系我们

如需确认 Vertex 分组是否在控制台对你的账号可见，或需要协助排查改图色偏，请联系客服。
