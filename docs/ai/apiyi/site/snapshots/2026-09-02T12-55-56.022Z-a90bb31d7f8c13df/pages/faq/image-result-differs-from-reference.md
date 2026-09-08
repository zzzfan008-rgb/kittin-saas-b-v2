> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 接入模型后生成的图片和参考图相差很大怎么办？

> Gemini-3-Pro-Image 和香蕉系列模型参考图上传需要使用 base64 格式，不支持 OpenAI 格式，常见排查方法见正文。

## 简短回答

如果使用 Gemini-3-Pro-Image、香蕉 Pro 或香蕉 2 模型生成图片，结果和参考图差异很大，通常是参考图上传方式不匹配导致的：

* 这些模型**不支持 OpenAI 格式上传参考图**
* 必须使用 **base64 格式**上传参考图
* 这个问题和接入方式有关，与模型本身无关

## 排查步骤

按以下顺序逐项排查，可以快速定位问题：

<Steps>
  <Step title="先在网页端测试模型">
    打开 `imagen.apiyi.com` 网页端，使用相同的参考图测试一次。

    如果网页端生成的图片和参考图一致，说明模型本身工作正常，问题出在你的接入方式；如果网页端也存在差异，再进一步排查模型相关问题。
  </Step>

  <Step title="检查令牌分组配置">
    登录 API易 控制台，确认你的令牌已正确勾选 `gemini-3-pro-image` 或香蕉系列模型所在的分组。

    模型未启用时，调用会退回到默认行为，导致结果与预期不一致。
  </Step>

  <Step title="确认令牌计费模式">
    在令牌设置中检查计费模式：

    * 选择**按量优先**：可使用按量和包月两种额度
    * 选择**仅按量**：仅使用按量额度，包月额度不可用

    计费模式与模型分组不匹配时，可能导致调用失败或结果异常。
  </Step>

  <Step title="参考正确接入方式">
    按目标模型的官方接入文档重新核对参数和参考图上传方式。

    以香蕉 2 模型为例：
    `docs.apiyi.com/api-capabilities/nano-banana-2-image/image-edit`

    重点关注：

    * 请求体中参考图字段是 **base64 字符串**，不是 URL
    * MIME 类型需要与图片实际格式一致
    * 多张参考图时，参数结构是否匹配当前模型要求
  </Step>
</Steps>

## 常见原因总结

| 现象              | 可能原因           |
| --------------- | -------------- |
| 网页端正常，API 调用差异大 | 接入方式不匹配（最常见）   |
| 所有调用结果都不一致      | 参考图未上传或上传失败    |
| 偶发性差异           | 提示词描述不充分或参考图过多 |
| 模型分组可见但调用失败     | 计费模式不匹配        |

<Tip>
  **最常见的原因**：把图片 URL 直接放到 OpenAI 兼容格式的 `image_url` 字段里。对于不支持 OpenAI 格式的模型，参考图必须先转成 base64 字符串，再放到对应字段中。
</Tip>

## 相关问题

<CardGroup cols={2}>
  <Card title="Nano Banana 图片失败" icon="banana" href="/faq/nano-banana-image-failure">
    Nano Banana 模型的常见问题与排查。
  </Card>

  <Card title="图片异步 API" icon="loader" href="/faq/image-async-api">
    图片异步任务接口的使用方式。
  </Card>

  <Card title="Base URL 怎么配置？" icon="link" href="/faq/base-url-config">
    在各客户端中接入 API易 的方法。
  </Card>

  <Card title="令牌管理与模型白名单" icon="key" href="/faq/token-model-whitelist">
    配置令牌可用的模型分组。
  </Card>
</CardGroup>
