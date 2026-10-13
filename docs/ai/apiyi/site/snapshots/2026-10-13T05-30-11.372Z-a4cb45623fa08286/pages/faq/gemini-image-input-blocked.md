> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 出图返回 blockReason: OTHER 怎么办？

> Gemini 图片模型几秒内返回 promptFeedback.blockReason 且没有 candidates 时，如何定位被拦截的参考图，以及人工与代码两类场景下的参考图预处理建议。

## 简短回答

如果 Gemini 图片接口返回 HTTP 200，但响应里**没有 `candidates`**，只有 `promptFeedback.blockReason`（最常见的是 `OTHER`），说明请求在**开始生成之前**就被原厂的输入检查拦下了。

* 这类拦截通常几秒内就返回，比正常出图快得多
* `OTHER` 不会告诉你具体原因，`safetyRatings` 往往也是空的
* 它**不一定和提示词写法有关**，很多时候是某一张参考图触发的
* gemini-3-pro-image（Nano Banana Pro）的输入检查比 gemini-3.1-flash-image 更严格，同一个请求可能 Pro 被拦、flash 能出

处理思路是：**先找到是哪一张图，再对参考图做统一的预处理**。

## 怎么识别

典型响应如下：

```json theme={null}
{
  "promptFeedback": {
    "blockReason": "OTHER",
    "safetyRatings": []
  },
  "usageMetadata": {
    "promptTokenCount": 1919,
    "candidatesTokenCount": 0
  },
  "modelVersion": "gemini-3-pro-image",
  "responseId": "..."
}
```

| 特征 | blockReason 拦截 | NO\_IMAGE |
| - | - | - |
| 失败信号所在字段 | `promptFeedback.blockReason` | `candidates[0].finishReason` |
| `candidates` | 没有 | 有，但 `parts` 为 `null` |
| 返回速度 | 几秒内 | 与正常出图相近 |
| 常见原因 | 输入内容（多为参考图）被拦截 | 提示词意图不明确 |
| 处理方向 | 定位并预处理参考图 | 改提示词，见 [NO\_IMAGE 排查](/faq/gemini-no-image) |

## 一个实测案例

2026-09 (UTC+8) 我们复测了一个服装目录出图请求：1 段提示词 + 6 张参考图（姿势、人物、场景、穿搭、鞋袜拼图、帽子），2:3、2K、`responseModalities: ["IMAGE"]`。

* gemini-3-pro-image 连续 3 次返回 `blockReason: OTHER`；同一请求用 gemini-3.1-flash-image 能正常出图
* 用对半拆分的方法逐步缩小范围，最终定位到**唯一的触发源是那张人物参考图**（一张 AI 生成的人物四宫格设定图，包含正面、背面、侧面和面部特写）
* 这张图配任何提示词都会被拦，包括与任务无关的「把背景换成浅灰色」
* 事前最被怀疑的「带水印的真人姿势参考图」和「带商标的帽子图」，单独测试都能通过

最关键的发现是：

| 人物参考图的处理方式 | 结果 |
| - | - |
| 原图 | 拦截 13/13 |
| 像素完全相同，只换文件格式（如另存为 PNG） | 拦截 2/2 |
| 重新导出为 JPEG（质量 95，肉眼看不出差别） | 通过 6/6 |
| 用重新导出的图替换后，发送完整的 6 图请求 | 出图 2/2，人物、姿势、穿搭都正确 |

也就是说，这类检查对某些图片的原始像素非常敏感，重新导出一次就能正常通过。原厂不公开 `OTHER` 的具体判断依据，我们无法进一步归因。

<Info>
  这个案例说明：一次请求放多张参考图、把多个步骤合并成一次生成，本身都没有问题。遇到 `OTHER` 时，不要急着改提示词或拆分流程，先确认是哪一张图。
</Info>

## 如何定位是哪一张图

<Steps>
  <Step title="第一步：确认可以复现">
    原样重发 2\~3 次。`blockReason` 拦截通常是稳定复现的；如果时好时坏，更可能是 [NO\_IMAGE](/faq/gemini-no-image) 那类问题。
  </Step>

  <Step title="第二步：先排除提示词">
    保留全部图片，把提示词换成一句与任务无关的简单指令（例如「把背景换成浅灰色」）。如果仍被拦截，问题在图片上。
  </Step>

  <Step title="第三步：对半拆分图片">
    把参考图分成两半分别发送，只在仍被拦截的那一半里继续拆分，直到定位到单张图。6 张图最多拆 3 轮。
  </Step>

  <Step title="第四步：处理那张图">
    按下文「处理建议」重新导出该图后，再发送完整请求验证。
  </Step>
</Steps>

<Tip>
  定位时出一次图就可以判定这一组「能通过」，不必重复；连续 2 次被拦截即可判定「会被拦截」。这样整个定位过程通常只需要十几次调用。
</Tip>

## 处理建议

### 场景一：人工操作（在画布或工具里手动出图）

1. **参考图先重新导出一次再上传**：用任意修图工具（系统自带的预览、Photoshop 等）导出为 JPEG，质量 90\~95，长边不超过 2048px。
2. **大图先缩小**：长边 3000\~4000px 的原图缩到 2048px 以内，不影响出图效果，上传也更快。
3. **几秒就失败时先怀疑参考图**：优先把最近新加入的那张图重新导出后再试；仍不行就按上面的方法逐张排查。
4. **人物参考图优先用全身图**：在上面的案例中，人物四宫格拆开后，单独的正面全身图可以通过。如果某张人物设定图反复被拦截，可以先只用其中的全身图。
5. **临时替代**：某张图确实无法通过 Pro 时，可以先用 gemini-3.1-flash-image 完成这一步。

### 场景二：代码（工程化自动处理）

**1. 所有参考图发送前统一预处理**，不必针对某一张图单独处理：转为 sRGB → 按 EXIF 方向摆正 → 长边限制在 2048px → 重新编码为 JPEG（质量 90\~95）→ 去掉元数据。

这样做首先能显著减小请求体积、加快上传（上面的案例原始请求体约 4.6MB）；同时也能减少这类 `OTHER` 拦截。Node.js 示例：

```javascript theme={null}
import sharp from "sharp";

async function normalizeReference(buffer) {
  return sharp(buffer, { failOn: "none" })
    .rotate()                       // 按 EXIF 方向摆正
    .toColorspace("srgb")
    .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();                    // 默认不保留元数据
}

// parts.push({ inlineData: { mimeType: "image/jpeg", data: (await normalizeReference(buf)).toString("base64") } });
```

Python 可以用 Pillow 实现同样的流程：

```python theme={null}
from io import BytesIO
from PIL import Image, ImageOps

def normalize_reference(raw: bytes) -> bytes:
    im = ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert("RGB")
    im.thumbnail((2048, 2048))
    out = BytesIO()
    im.save(out, "JPEG", quality=92)
    return out.getvalue()
```

**2. 按失败类型分别处理**：

| 返回情况 | 含义 | 建议处理 |
| - | - | - |
| `promptFeedback.blockReason` 为 `OTHER`，几秒内返回 | 输入被原厂检查拦截，原因未公开 | 换一组编码参数（如质量 88、长边再缩小 1%）自动重发 1 次；仍失败则改用 flash，或提示用户更换参考图 |
| `blockReason` 为 `SAFETY` / `PROHIBITED_CONTENT`，或 `finishReason` 为 `IMAGE_SAFETY` 等 | 明确的内容安全拦截 | **不要重试**，直接提示用户修改素材或描述 |
| `finishReason` 为 `NO_IMAGE`，输出 token 为 0 | 提示词出图意图不明确 | 在提示词末尾追加「只输出最终图片，不要输出文字」后重发，见 [NO\_IMAGE 排查](/faq/gemini-no-image) |

<Warning>
  自动重试只适用于原因不明的 `OTHER`。对于明确的安全类原因，重新编码图片并不能、也不应该用来改变结果，请直接提示用户调整内容。
</Warning>

**3. 记录排查信息**：每次失败都记下 `responseId`，以及每张参考图的哈希值和尺寸。出现问题时能快速找到是哪张图，也方便联系我们时提供。

## 常见问题

<AccordionGroup>
  <Accordion title="为什么 flash 能出图，Pro 却被拦截？">
    两个模型的输入检查策略不同，Pro 更严格。同一张参考图在 flash 上通过、在 Pro 上被拦截是正常现象，并不代表请求本身有问题。
  </Accordion>

  <Accordion title="参考图是 AI 生成的，也会被拦截吗？">
    会有这种情况。上面案例里被拦截的就是一张用自己拍的照片重新生成的人物设定图。是否被拦截与图片来源没有简单对应关系，按本页的方法定位并预处理即可。
  </Accordion>

  <Accordion title="一次放 6 张参考图会不会太多？">
    在上面的案例中，6 张图本身不是问题：替换掉那一张人物图后，完整的 6 图请求可以正常出图。
  </Accordion>

  <Accordion title="被拦截的请求会扣费吗？">
    请以 API易 控制台的调用日志为准，确认该请求是否产生消费记录。
  </Accordion>
</AccordionGroup>

## 仍然无法解决？联系我们

请提供以下信息，方便我们协助排查：

* 模型名称和令牌分组；
* 完整响应（至少包含 `promptFeedback` 和 `responseId`）与 `request ID`；
* 问题发生时间（请注明时区）；
* 已经定位到的参考图（如方便提供）。

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

    邮件标题建议包含「blockReason + 模型名称」。
  </Card>
</CardGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="为什么 Gemini 图片接口返回 NO_IMAGE？" icon="image-off" href="/faq/gemini-no-image">
    提示词意图不明确导致的未出图与修复方法
  </Card>

  <Card title="Nano Banana 系列出图失败" icon="image-off" href="/faq/nano-banana-image-failure">
    内容安全、去水印、知名 IP 和未成年人等常见原因
  </Card>

  <Card title="Gemini 生图 API 错误处理指南" icon="triangle-alert" href="/api-capabilities/gemini-image-error-handling">
    完整的响应判断顺序与 C 端友好提示方案
  </Card>

  <Card title="怎么看懂日志里的计费金额？" icon="file-text" href="/faq/log-billing-explained">
    通过调用日志确认请求是否成功和是否产生消费
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.