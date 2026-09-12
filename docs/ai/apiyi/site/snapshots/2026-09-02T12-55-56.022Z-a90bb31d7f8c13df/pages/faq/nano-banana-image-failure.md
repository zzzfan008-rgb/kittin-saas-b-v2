> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 系列出图失败，常见原因有哪些？

> Nano Banana Pro/2 出图失败的常见原因分析，包括内容安全、去水印、知名IP、未成年人等触发谷歌安全机制的场景

## 简要说明

Nano Banana 系列（包括 Nano Banana Pro 和 Nano Banana 2）底层使用谷歌 Gemini 模型。出图失败的主要原因是**触发了谷歌的内容安全机制**，谷歌会在生成阶段直接拦截不合规的请求。API易作为透明代理，忠实转发谷歌的反馈结果。

## 常见触发原因

<CardGroup cols={2}>
  <Card title="NSFW 内容" icon="ban">
    包含色情、暴力、血腥、仇恨言论等不适当内容的提示词或参考图，会被谷歌安全机制直接拦截。
  </Card>

  <Card title="去水印请求" icon="droplet-off">
    要求去除图片上的水印属于违反内容政策的操作，谷歌会拒绝处理此类请求。
  </Card>

  <Card title="知名 IP / 版权角色" icon="copyright">
    涉及迪士尼、漫威、任天堂等知名版权角色的生成请求，会因版权保护被拒绝。
  </Card>

  <Card title="未成年人相关" icon="baby">
    任何涉及未成年人的不当内容生成请求，谷歌执行零容忍政策，严格拦截。
  </Card>
</CardGroup>

### Nano Banana 2 新增限制

<Warning>
  自 2026 年 2 月 27 日 Nano Banana 2 上线后，谷歌进一步收紧了安全机制，以下场景也会触发拦截：
</Warning>

<CardGroup cols={2}>
  <Card title="知名人物" icon="user-x">
    涉及公众人物（明星、政治人物等）的图像生成或编辑请求会被拒绝。
  </Card>

  <Card title="金融/订单信息修改" icon="credit-card">
    试图修改图片中的金融信息、订单截图、价格标签等内容会被拦截。
  </Card>

  <Card title="人物换装/换脸" icon="shirt">
    对人物进行换装、换脸等操作涉及隐私和伦理问题，会被安全机制拒绝。
  </Card>

  <Card title="隐性 NSFW 内容" icon="eye-off">
    即使没有直接的色情描述，暗示性的、擦边的不当内容也会被识别并拦截。
  </Card>
</CardGroup>

## 政策更新时间线

| 时间         | 事件               | 影响                               |
| ---------- | ---------------- | -------------------------------- |
| 2026年1月23日 | 谷歌调整风控政策         | 整体安全审核更加严格，部分原本可通过的提示词被拦截        |
| 2026年2月27日 | Nano Banana 2 上线 | 新增知名人物、金融信息修改、换装换脸、隐性 NSFW 等拦截规则 |

## 出图失败的典型表现

当出图失败时，API 返回的 HTTP 状态码仍然是 **200**，但响应内容中不包含图片数据，而是返回文字说明。

<Info>
  **为什么状态码是 200？** API易作为透明代理，忠实转发谷歌 API 的原始响应。谷歌在安全拦截时返回的就是 200 状态码 + 文本拒绝说明，而非 HTTP 错误码。
</Info>

### 常见的报错文案示例

谷歌 API 返回的拒绝文本通常包含以下内容：

* `"我不能完成 xxx 的修改"`
* `"我不能为你创建带有色情、不雅或冒犯性内容的图像"`
* `"I can't generate images that are sexually explicit."`
* `"I'm just a language model and can't help with that."`

<Warning>
  注意：谷歌的安全过滤存在一定的随机性。**同一个提示词有时能生成、有时不能**，这与参考图内容、提示词组合方式等因素有关。
</Warning>

## C 端产品开发者建议

如果你正在基于 Nano Banana 系列 API 开发面向用户的产品，建议做好错误处理逻辑，为用户提供友好的失败提示。

<Tip>
  **核心判断指标**：

  1. **candidatesTokenCount = 0**：谷歌在内容审核阶段直接拒绝
  2. **finishReason 不是 STOP**：生成过程中被安全策略拦截
  3. **有文本但无图片**：API 返回了拒绝说明而非图片数据
</Tip>

## 联系支持

如果你的使用场景是正常合规的，但仍然遇到出图失败问题，欢迎联系我们排查：

<Card title="技术支持" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  * 企业微信客服：[点击联系](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * 邮箱：[hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
