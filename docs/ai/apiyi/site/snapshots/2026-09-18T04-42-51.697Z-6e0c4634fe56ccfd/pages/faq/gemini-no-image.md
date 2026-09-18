> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 为什么 Gemini 图片接口返回 NO_IMAGE？

> 解释 Gemini 图片接口返回 NO_IMAGE 的常见原因，并提供提示词优化和故障排查方法。

## 简短回答

当接口返回 `finishReason: NO_IMAGE` 且 `parts` 为 `null` 时，通常表示模型处理了请求，但没有返回图片内容。

这不一定代表提示词触发了内容安全审核。对于“什么是 GEO”“请介绍一下某个概念”这类更像文本问答的提示词，模型可能无法确认用户是否明确要求生成图片，因此直接返回 `NO_IMAGE`。

建议在提示词开头明确说明要生成什么图片，并补充画面主体、布局、风格和输出要求。

## 为什么会返回 NO\_IMAGE？

### 1. 提示词更像文本问答

例如：

```text theme={null}
什么是 GEO？

GEO 就是让企业在大模型 AI 中获得排名……
```

这段内容主要是在解释 GEO 的概念，没有明确说明：

* 要生成什么类型的图片；
* 画面中应该出现哪些元素；
* 信息应该如何排版；
* 是否只需要图片，不需要文字解释。

即使请求中包含“生成图片”几个字，模型仍可能将整体请求理解为文本说明或知识问答。

### 2. 图片生成意图不够明确

某些平台工具会自动在用户输入前添加“生成图片：”等提示词。但通过 API 调用时，平台通常只是透明转发请求，不一定会自动补充完整的图像生成意图。

因此，不建议只写：

```text theme={null}
生成图片：什么是 GEO？
```

而应直接说明图片类型和视觉要求：

```text theme={null}
生成一张中文科技风信息图海报，主题是“什么是 GEO”。
```

### 3. 输入内容缺少视觉描述

如果提示词只有概念解释，模型不知道应该把内容转换成什么画面。建议补充以下信息：

* 图片类型：信息图、海报、流程图或宣传图；
* 画面结构：三栏布局、时间轴或中心辐射结构；
* 视觉风格：科技风、商务风、简约风或品牌风；
* 文字要求：标题、编号、正文和排版层级；
* 输出要求：仅生成图片，不要返回文字解释。

## GEO 提示词示例

可以将原始提示词改写为：

```text theme={null}
生成一张中文科技风信息图海报，主题是“什么是 GEO”。

画面包含一个主标题和三个编号说明模块：

1. 让企业在大模型 AI 的搜索和推荐中获得更高曝光；
2. 让企业成为用户问题的答案；
3. 建立 AI 对企业信息的信任和推荐。

设计要求：

- 使用蓝紫色科技风；
- 采用清晰的三栏布局；
- 突出“排名”“答案”“信任推荐”三个关键词；
- 使用简洁、易读的中文排版；
- 适合作为企业宣传海报；
- 仅生成图片，不要返回文字解释。
```

<Tip>
  “生成图片”本身通常只是一个动作提示，不能完全替代对画面内容的描述。越明确说明图片类型、主体、布局和视觉风格，模型越容易判断这是一个图片生成请求。
</Tip>

## 如何排查 NO\_IMAGE？

<Steps>
  <Step title="第一步：确认响应中是否有图片内容">
    检查响应中的 `parts`、`inlineData`、`image` 或等效图片字段。如果 `parts` 为 `null`，通常表示本次响应没有返回图片内容。
  </Step>

  <Step title="第二步：检查提示词是否明确要求生成图片">
    确认提示词中包含“生成一张图片”“制作一张海报”或“create an image”等明确指令，不要只提交“什么是……”或“请解释……”这类文本问题。
  </Step>

  <Step title="第三步：再排查内容安全因素">
    如果已经明确要求生成图片，但仍然返回 `NO_IMAGE`，再检查是否涉及 NSFW、未成年人、知名 IP、去水印、真实人物肖像或其他上游安全策略。
  </Step>

  <Step title="第四步：查看调用日志">
    检查调用日志中的完整响应、模型名称、request ID 和消费记录。`usageMetadata` 表示模型处理过请求，但不能单独证明图片已经生成，也不能单独判断是否触发了安全拦截。
  </Step>
</Steps>

## NO\_IMAGE 和内容安全拦截有什么区别？

| 现象                                   | 可能原因               | 建议处理方式                               |
| ------------------------------------ | ------------------ | ------------------------------------ |
| `NO_IMAGE` 且 `parts` 为 `null`，提示词偏抽象 | 图片生成意图不明确          | 补充图片类型、画面主体和视觉要求                     |
| 返回安全策略相关错误                           | 触发上游内容审核           | 修改或删除可能触发审核的内容                       |
| 已明确图片意图仍然无法出图                        | 可能是模型、分组、令牌或上游通道问题 | 联系客服，并提供完整错误信息、模型名称、request ID 和调用时间 |

<Info>
  `finishReason: NO_IMAGE` 只能说明本次没有返回图片，不能仅凭这个字段断定一定是内容违规。需要结合完整错误消息、提示词内容和调用日志一起判断。
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="提示词中加上“生成图片”就一定能解决吗？">
    不一定。“生成图片”只能表达基本意图，建议同时说明图片类型、主体、构图、风格和输出要求。对于抽象概念，最好明确要求生成信息图、海报或流程图。
  </Accordion>

  <Accordion title="GEO 这个主题是不是被内容安全拦截了？">
    从 GEO 的概念本身来看，没有明显的内容安全风险。但 `NO_IMAGE` 并不能完全排除上游策略影响，仍需要结合完整响应和调用日志判断。就当前案例而言，提示词更像知识解释，图片生成意图不够具体是更值得优先排查的方向。
  </Accordion>

  <Accordion title="为什么 usageMetadata 有 token，但仍然没有图片？">
    `usageMetadata` 只能说明模型处理了输入并产生了推理或文本 token，不代表响应一定包含图片。是否生成图片，应以响应中是否存在图片数据为准。
  </Accordion>

  <Accordion title="NO_IMAGE 会扣费吗？">
    不能只根据 `NO_IMAGE` 判断是否扣费。请以 API易 控制台的调用日志为准，确认该请求是否产生消费记录。
  </Accordion>
</AccordionGroup>

## 仍然无法解决？联系我们

如果明确补充了图片生成意图后仍然返回 `NO_IMAGE`，请联系 API易 客服，并提供：

* 模型名称和令牌分组；
* 完整错误消息和 `request ID`；
* 脱敏后的提示词；
* 问题发生时间；
* 调用日志中的消费记录。

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

    邮件标题建议包含「NO\_IMAGE + 模型名称」。
  </Card>
</CardGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="Nano Banana 系列出图失败" icon="image-off" href="/faq/nano-banana-image-failure">
    查看内容安全、去水印、知名 IP 和未成年人等常见原因
  </Card>

  <Card title="模型调用报错怎么排查？" icon="alert-triangle" href="/faq/model-error-troubleshooting">
    查看 401、429、503、504、超时和分组问题的通用排查流程
  </Card>

  <Card title="怎么看懂日志里的计费金额？" icon="file-text" href="/faq/log-billing-explained">
    通过调用日志确认请求是否成功和是否产生消费
  </Card>
</CardGroup>
