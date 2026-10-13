> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 为什么 Gemini 图片接口返回 NO_IMAGE？

> 解释 Gemini 图片接口返回 NO_IMAGE 的常见原因，并提供提示词优化和故障排查方法。

## 简短回答

当接口返回 `finishReason: NO_IMAGE` 且 `parts` 为 `null` 时，通常表示模型处理了请求，但没有返回图片内容。

这不一定代表提示词触发了内容安全审核。对于“什么是 GEO”“请介绍一下某个概念”这类更像文本问答的提示词，模型可能无法确认用户是否明确要求生成图片，因此直接返回 `NO_IMAGE`。

建议在提示词开头明确说明要生成什么图片，并补充画面主体、布局、风格和输出要求。

另一类高频原因是**提示词在要求模型写文字**，比如「生成设计方案」「请确保分析内容深入」。在只允许输出图片的调用里，这类请求会以一定概率返回 `NO_IMAGE`，同一个请求时好时坏。见下文「提示词在要求模型输出文字」。

<Note>
  如果响应里没有 `candidates`，而是出现了 `promptFeedback.blockReason`（例如 `OTHER`），那是另一类问题：输入内容在生成前就被原厂拦截了。请看 [Gemini 出图返回 blockReason: OTHER 怎么办？](/faq/gemini-image-input-blocked)
</Note>

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

### 4. 提示词在要求模型输出文字

Gemini 图片模型同时具备看图和写文字的能力。如果提示词里有要求文字产出的句子，模型会以一定概率「先写方案」而不是直接出图：

```text theme={null}
……根据图1的鞋底款式，设计一款马拉松跑鞋……
针对鞋款生成专业、精准且可操作性强的设计方案。
请确保分析内容深入，判断准确，且设计与配色方案可直接应用于设计开发。
```

这类句子适合写给文本模型。写给出图模型时，一旦请求设置了只输出图片（`responseModalities: ["IMAGE"]`），模型想写的方案无法输出，响应就变成 `finishReason: NO_IMAGE`、`parts: null`、输出 token 为 0。

我们对一个真实的鞋款设计请求（3 张参考图 + 上面这类提示词）做过复测（2026-09 (UTC+8)，gemini-3.1-flash-image，`responseModalities: ["IMAGE"]`）：

| 提示词写法 | 返回 NO\_IMAGE 的次数 |
| - | - |
| 原提示词 | 10/48（约 21%，不同时段在 1/12 \~ 5/12 之间波动） |
| 删掉「生成设计方案」「分析内容深入」等句子 | 0/36 |
| 原文不动，末尾追加一句「只输出最终图片」 | 0/24 |
| 删掉提示词里的品牌名 | 1/12（品牌名不是诱因） |

所以同一个请求会「连续失败几次又成功」，而渠道本身没有任何变化。最简单的修法是在提示词末尾加一句：

```text theme={null}
【重要】本次只需直接输出最终效果图一张，不要输出任何文字方案、分析或提示词。
```

<Tip>
  参考图里有清晰可读的文字或第三方标识（如鞋底上的品牌字样）时，模型更容易进入「先分析素材」的状态。我们在上述测试中把这类字样模糊处理后，同一请求也是 0/36。
</Tip>

## responseModalities 不同，表现也不同

同一个「意图不明确」的请求，在不同的 `responseModalities` 设置下表现不一样：

| 设置 | 没出图时的表现 |
| - | - |
| `["IMAGE"]` | `finishReason: NO_IMAGE`，`parts: null`，输出 token 为 0 |
| 不传，或 `["TEXT", "IMAGE"]` | `finishReason: STOP`，但 `parts` 里只有一段文字、没有图片 |

**排查技巧**：把出问题的请求去掉 `responseModalities` 再发几次，看没出图时模型写的是什么：

* 写的是一篇方案、分析，或者一段出图提示词 → 意图不明确，按本页的方法改提示词
* 写的是「无法生成」这类拒绝说明 → 触发了内容审核，参考 [Nano Banana 系列出图失败](/faq/nano-banana-image-failure)

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
  <Step title="第一步：先分清失败信号在哪个字段">
    `candidates[0].finishReason` 为 `NO_IMAGE`，属于本页讨论的情况。如果没有 `candidates`，而 `promptFeedback.blockReason` 有值，说明输入在生成前就被拦截了，请看 [blockReason: OTHER 排查](/faq/gemini-image-input-blocked)。
  </Step>

  <Step title="第二步：确认响应中是否有图片内容">
    检查响应中的 `parts`、`inlineData`、`image` 或等效图片字段。如果 `parts` 为 `null`，通常表示本次响应没有返回图片内容。
  </Step>

  <Step title="第三步：检查提示词是否明确要求生成图片">
    确认提示词中包含“生成一张图片”“制作一张海报”或“create an image”等明确指令，不要只提交“什么是……”或“请解释……”这类文本问题。同时检查有没有「生成方案」「深入分析」「给出说明」这类要求文字产出的句子，有的话删掉，或在末尾追加「只输出图片」。
  </Step>

  <Step title="第四步：再排查内容安全因素">
    如果已经明确要求生成图片，但仍然返回 `NO_IMAGE`，再检查是否涉及 NSFW、未成年人、知名 IP、去水印、真实人物肖像或其他上游安全策略。
  </Step>

  <Step title="第五步：查看调用日志">
    检查调用日志中的完整响应、模型名称、request ID 和消费记录。`usageMetadata` 表示模型处理过请求，但不能单独证明图片已经生成，也不能单独判断是否触发了安全拦截。
  </Step>
</Steps>

## NO\_IMAGE 和内容安全拦截有什么区别？

| 现象 | 可能原因 | 建议处理方式 |
| - | - | - |
| `NO_IMAGE` 且 `parts` 为 `null`，提示词偏抽象 | 图片生成意图不明确 | 补充图片类型、画面主体和视觉要求 |
| 返回安全策略相关错误 | 触发上游内容审核 | 修改或删除可能触发审核的内容 |
| `NO_IMAGE` 时有时无，同一请求重试后又成功 | 提示词在要求文字产出，模型以一定概率先写方案 | 删掉索要方案/分析的句子，或末尾追加「只输出最终图片」 |
| 没有 `candidates`，`promptFeedback.blockReason` 为 `OTHER` | 输入内容在生成前被原厂拦截 | 见 [blockReason: OTHER 排查](/faq/gemini-image-input-blocked) |
| 已明确图片意图仍然无法出图 | 可能是模型、分组、令牌或上游通道问题 | 联系客服，并提供完整错误信息、模型名称、request ID 和调用时间 |

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

  <Accordion title="同一个请求为什么时好时坏？渠道变了吗？">
    多数情况下渠道没有变化。意图不明确导致的 `NO_IMAGE` 本身是概率性的：模型每次都在「出图」和「先写文字」之间做选择。在我们的实测中，同一请求的失败率约 21%，而且会连续出现。建议客户端在收到 `NO_IMAGE` 时自动重试 1\~2 次，同时从提示词上根治。
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
  <Card title="Gemini 出图返回 blockReason: OTHER 怎么办？" icon="shield-alert" href="/faq/gemini-image-input-blocked">
    输入图在生成前被拦截时的定位方法与参考图预处理建议
  </Card>

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


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.