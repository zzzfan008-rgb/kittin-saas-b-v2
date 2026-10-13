> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 出图返回 IMAGE_OTHER 怎么办？

> Gemini 图片模型返回 finishReason: IMAGE_OTHER 时，图已经画完但在输出前被原厂过滤。本文解释它与 NO_IMAGE、blockReason 的区别，并给出实测定位方法与修复建议。

## 简短回答

如果 Gemini 图片接口返回 HTTP 200，`candidates[0].finishReason` 是 `IMAGE_OTHER`，并且 `finishMessage` 写着 `Unable to show the generated image`，说明**模型已经生成了图片，但这张图在返回之前被原厂的输出检查拦下了**。

* 它是**概率性**的：同一个请求有时成功、有时失败，失败率可能很高
* 它**和负向提示词、参数、网关都无关**，问题出在「画出来的内容」上
* 我们实测到的最典型诱因是：**提示词里点名了真实人物**
* 原厂在 `finishMessage` 里注明这类请求不计费

处理思路是：**找出提示词里让画面「像某个具体真人或受保护内容」的那部分，把它换成描述。**

## 怎么识别

典型响应如下：

```json theme={null}
{
  "candidates": [
    {
      "finishReason": "IMAGE_OTHER",
      "finishMessage": "Unable to show the generated image. The model could not generate the image based on the prompt provided. You will not be charged for this request. Try rephrasing the prompt. ..."
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 1430,
    "candidatesTokenCount": 274,
    "thoughtsTokenCount": 274
  },
  "modelVersion": "gemini-3-pro-image",
  "responseId": "..."
}
```

注意 `candidatesTokenCount` 不是 0，而是等于 `thoughtsTokenCount`：模型完成了思考，只是最终的图片没有交付。

三种「没出图」的形态对比：

| 特征 | IMAGE\_OTHER | NO\_IMAGE | blockReason: OTHER |
| - | - | - | - |
| 失败信号所在字段 | `candidates[0].finishReason` | `candidates[0].finishReason` | `promptFeedback.blockReason` |
| 发生在哪一步 | 图已生成，**输出时被过滤** | 模型没有去画图 | 生成前，**输入被拦截** |
| `finishMessage` | `Unable to show the generated image` | 通常没有 | 没有 `candidates` |
| 输出 token | 只有思考 token | 0 或只有文字 | 0 |
| 是否稳定复现 | 概率性 | 概率性 | 通常稳定复现 |
| 常见原因 | 画面像具体真人等受限内容 | 提示词在要求输出文字 | 某张参考图被拦截 |
| 处理方向 | 改提示词里的人物/受限描述 | 见 [NO\_IMAGE 排查](/faq/gemini-no-image) | 见 [blockReason: OTHER 排查](/faq/gemini-image-input-blocked) |

<Info>
  官方 API 文档中，`IMAGE_OTHER` 与 `IMAGE_SAFETY`、`IMAGE_PROHIBITED_CONTENT`、`IMAGE_RECITATION` 同属「图片生成被停止」的一组原因，`IMAGE_OTHER` 表示原因不属于其余几类，原厂不会公开具体判断依据。
</Info>

## 一个实测案例

2026-09 (UTC+8) 一位客户反馈：一个纯文生图的球员卡请求，在 gemini-3-pro-image 上**约 63% 的调用不出图**。提示词约 5500 字符，结构如下：

* 开头一句点名一位真实的运动员，要求「1:1 复刻其面部特征」
* 姿势、构图、队服配色、画风、白底背景等详细描述
* 两大段负向提示词（NEGATIVE），列了大量品牌名

我们复现到的失败全部是 `IMAGE_OTHER`，约 20 秒返回。随后每组 6 次、逐项删减：

| 改动 | 不出图 |
| - | - |
| 原提示词 | **5/6** |
| **只删掉点名真人的那一句**，其余逐字保留 | **0/6** |
| 保留人名，只删掉「1:1 复刻」这类措辞 | 4/6 |
| 删掉两段负向提示词 | 3/6 |

结论很清楚：**触发源是真人姓名本身**。模型认得这个名字、就会往这个人的样子画，画得越像越容易在输出时被过滤；画得不太像的那几次就能通过，所以表现为「时好时坏」。「1:1 复刻」的措辞和冗长的负向提示词都不是原因。

删掉名字后，原提示词里已有的发色、脸型、眼型等外貌描述足以画出同样风格的球员卡。

<Tip>
  二分定位时每组 6 次就够用：原请求失败率 5/6 时，删对了的那一组连续 6 次全部成功，碰巧的概率约为十万分之二。整个定位只用了 24 次调用。
</Tip>

## 如何定位

<Steps>
  <Step title="第一步：确认失败形态">
    原样重发 5\~6 次，确认失败时 `finishReason` 是 `IMAGE_OTHER`，并记下失败率。如果是 `NO_IMAGE` 或 `blockReason`，请看对应的排查页。
  </Step>

  <Step title="第二步：先查人名和具体对象">
    优先检查提示词里是否出现了**真实人物的姓名**（明星、运动员、网红、政要等），或要求「和某人一模一样」。删掉后重发一组。
  </Step>

  <Step title="第三步：逐段删减">
    如果不是人名，把提示词按段落对半删减，每组 6 次，只在失败率明显下降的那一半里继续缩小范围。
  </Step>

  <Step title="第四步：改写而不是硬删">
    定位到诱因后，用外貌、服装、风格等**描述**替换掉「指名道姓」，保留你真正需要的画面要求。
  </Step>
</Steps>

## 处理建议

1. **提示词里不要写真人姓名**：改成具体的外貌描述，例如「金色直发、偏分、杏仁眼、鹅蛋脸」。这是本案例中唯一有效的修复。
2. **负向提示词可以精简，但它不是这个问题的原因**：Gemini 图片模型没有独立的负向提示词参数，大段 NEGATIVE 列表只会被当作普通文字理解，精简后提示词更清晰，但不会降低 `IMAGE_OTHER` 的概率。
3. **不要把重试当成方案**：失败率在 60% 以上时，重试只是在碰运气，还会增加整体耗时。客户端可以在收到 `IMAGE_OTHER` 时重试 1 次兜底，但治本要改提示词。
4. **批量生成场景提前改模板**：如果是按名单批量生成（例如每位球员一张卡），不要把名单里的姓名拼进提示词，姓名只用于你自己的文件命名或后期排版。
5. **需要人物形象一致时用参考图**：如果确实需要画出某个具体的人，请提供本人授权的参考图，并注意 [Nano Banana 出图失败](/faq/nano-banana-image-failure) 里列出的真人、未成年人等限制。

代码里可以这样区分三种形态：

```python theme={null}
def classify_no_image(resp: dict) -> str:
    if resp.get("promptFeedback", {}).get("blockReason"):
        return "input_blocked"        # 见 blockReason: OTHER 排查
    cand = (resp.get("candidates") or [{}])[0]
    reason = cand.get("finishReason")
    if reason == "IMAGE_OTHER":
        return "output_filtered"      # 改提示词里的人名/受限描述
    if reason == "NO_IMAGE":
        return "no_image_intent"      # 见 NO_IMAGE 排查
    if reason in ("IMAGE_SAFETY", "IMAGE_PROHIBITED_CONTENT"):
        return "safety"               # 明确的安全拦截，不要重试
    return "ok" if any("inlineData" in p for p in (cand.get("content") or {}).get("parts") or []) else "unknown"
```

## 常见问题

<AccordionGroup>
  <Accordion title="提示词里只是写了名字，没有要求画得像，也会触发吗？">
    会。在我们的实测中，删掉「1:1 复刻」这类措辞、只保留人名，失败率仍有 4/6。模型认得这个名字，就会往这个人的样子画。
  </Accordion>

  <Accordion title="同一个请求为什么时好时坏？">
    过滤发生在图片生成之后，取决于这一次画出来的结果。每次生成都不一样，所以同一个请求会时而通过、时而被过滤。
  </Accordion>

  <Accordion title="为什么换了分组或渠道后就正常了？">
    不同分组背后的输出检查严格程度可能不同，同一提示词在不同分组上的失败率会有差异。但分组的路由会随时调整，这种差异并不稳定，从提示词上修复才是可靠的做法。
  </Accordion>

  <Accordion title="负向提示词（NEGATIVE）有用吗？">
    Gemini 图片模型没有单独的负向提示词参数，写在提示词里的 NEGATIVE 列表会被当作普通文字。它对 `IMAGE_OTHER` 没有影响，但过长的列表可能稀释主要描述，建议只保留最关键的几项，并改成正向表述（例如「纯白背景」而不是列一长串「不要体育场、不要草地……」）。
  </Accordion>

  <Accordion title="IMAGE_OTHER 会扣费吗？">
    原厂在 `finishMessage` 中注明这类请求不计费。实际是否产生消费，请以 API易 控制台的调用日志为准。
  </Accordion>
</AccordionGroup>

## 仍然无法解决？联系我们

请提供以下信息，方便我们协助排查：

* 模型名称和令牌分组；
* 完整响应（至少包含 `finishReason`、`finishMessage` 和 `responseId`）与 `request ID`；
* 问题发生时间（请注明时区）；
* 脱敏后的提示词，以及你统计到的失败率。

<Warning>
  请勿发送完整 API Key。提交截图或日志前，请将密钥内容打码。
</Warning>

<CardGroup cols={2}>
  <Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加，或点击本卡片直接联系客服。
  </Card>

  <Card title="邮件咨询" icon="mail">
    **客服邮箱**：[support@apiyi.com](mailto:support@apiyi.com)

    邮件标题建议包含「IMAGE\_OTHER + 模型名称」。
  </Card>
</CardGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="为什么 Gemini 图片接口返回 NO_IMAGE？" icon="image-off" href="/faq/gemini-no-image">
    提示词意图不明确导致的未出图与修复方法
  </Card>

  <Card title="Gemini 出图返回 blockReason: OTHER 怎么办？" icon="shield-alert" href="/faq/gemini-image-input-blocked">
    输入图在生成前被拦截时的定位方法与参考图预处理建议
  </Card>

  <Card title="Nano Banana 系列出图失败" icon="image-off" href="/faq/nano-banana-image-failure">
    内容安全、去水印、知名 IP 和未成年人等常见原因
  </Card>

  <Card title="Gemini 生图 API 错误处理指南" icon="triangle-alert" href="/api-capabilities/gemini-image-error-handling">
    完整的响应判断顺序与 C 端友好提示方案
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.