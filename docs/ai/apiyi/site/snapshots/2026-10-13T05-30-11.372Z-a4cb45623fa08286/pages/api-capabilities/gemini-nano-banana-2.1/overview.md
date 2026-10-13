> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2.1 生图/编辑

> 谷歌 Nano Banana 2.1（gemini-nano-banana-2.1）正式版：Nano Banana 2 的升级版，画质、文字渲染、多轮一致性提升。按次 $0.045/次（4K 同价），按量输入 $0.66、输出 $13.2 每百万 tokens。

## 概述

**Nano Banana 2.1** 是谷歌于 2026 年 10 月 6 日发布的图像生成模型，模型 ID 为 **`gemini-nano-banana-2.1`**，发布即为正式版（GA）。它是 [Nano Banana 2](/api-capabilities/nano-banana-2-image/overview)（`gemini-3.1-flash-image`）的升级版，保持 Flash 级速度，同时提升了画质、图中文字渲染和多轮编辑的一致性，并修复了上一代的平铺伪影。谷歌官方推荐新项目直接使用 2.1。

<Note>
  **🆕 2026 年 10 月 6 日发布**：API易 已同步上线，支持**按次**（\$0.045/次，1K / 2K / 4K 同价，2026-10-13 起由 \$0.05 降价）和**按量**（输入 \$0.66、输出 \$13.2 每百万 tokens）两种计费。Nano Banana 2 继续可用、价格不变，谷歌也尚未公布它的下线日期。
</Note>

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。请为本模型设置足够大的 timeout，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

<CardGroup cols={2}>
  <Card title="文生图 API" icon="wand-sparkles" href="/api-capabilities/gemini-nano-banana-2.1/text-to-image">
    输入文本提示词生成图片，带交互式 Playground 在线调试。
  </Card>

  <Card title="图片编辑 API" icon="image" href="/api-capabilities/gemini-nano-banana-2.1/image-edit">
    上传图片 + 编辑指令生成新图片，带交互式 Playground 在线调试。
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——超时、`parts` 防御式解析、上传压缩、分辨率参数这几个高频坑已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 Nano Banana 2.1 的文生图与图片编辑。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查 Nano Banana 2.1（`gemini-nano-banana-2.1`）的「文生图 + 图片编辑」。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/gemini-nano-banana-2.1/overview.md](https://docs.apiyi.com/api-capabilities/gemini-nano-banana-2.1/overview.md) 拿到本页纯文本版；需要更细的参数说明时，text-to-image 和 image-edit 两页同样在地址后加 `.md` 即可。

  接入要求：

  1. 超时：走 Gemini 原生格式 `POST https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent`，客户端 timeout 提到 360 秒兜底。图片接口是同步调用，没有任务 ID，客户端一断连结果就丢了、但这次请求照样计费。反向代理、网关、Serverless 执行上限这些中间层也要一起放宽，任何一层小于生成时间都会掐断请求。如果你用 Node，注意 undici 有三个独立的超时设置，SDK 的 `timeout` 并不覆盖它们。

  2. 返回解析（**最容易写错的一条**）：图片是 base64，在 `candidates[0].content.parts[]` 里的 `inlineData.data`。但 `parts` 是**异构数组，段数和顺序都不保证**——前面可能挂一个文本段，图片就落到下标 1 而不是 0。所以**绝对不要写死 `parts[0]` 或 `parts[1]`**。正确写法：遍历 `parts`、筛出所有含 `inlineData` 的段，取**最后一张**（复杂任务会返回多张中间稿，最后一张才是终稿）。`mimeType` 也从响应里读，不要写死成 `image/png`。拿到后渲染展示并提供「保存到本地」。

  3. 上传压缩：编辑时把参考图 base64 塞进 `inlineData`。上传前先压缩——超过 1.5MB 才处理，长边等比缩到 2048px 以内（不放大小图），以质量 0.9 重编码、保持原格式；多图时合计控制在 6MB 以内。base64 编码后体积还会再膨胀约三分之一，所以单图尽量压到 5MB 以内留足余量。某张图压缩失败就回退用原图继续，不要因为压缩失败中断整个请求。另外注意：**同一个 part 里只能放 `text` 或 `inlineData` 其中一个**，不能两个字段并存，正确结构是 1 个文本段 + N 个图片段。

  4. 分辨率参数：**必须显式传** `generationConfig.imageConfig.imageSize`（`1K` / `2K` / `4K`，默认 `1K`；**本模型不支持 `512`，传了会直接报 400**）和 `aspectRatio`（本页列了 14 个合法比例）。不传 `aspectRatio` 时模型会按内容自己选比例，结果不可控。按量计费时**分辨率直接决定单价**。前台界面把分辨率和比例都做成下拉。

  5. 错误处理：内容审核拦截时 HTTP 仍然是 200，但 `candidates[0].content.parts` 为空。判断顺序是先看 `candidatesTokenCount` 是否为 0，再看 `finishReason` 是否非 `STOP`。`IMAGE_SAFETY` 这类拦截**不计费**，原样重试 1-2 次往往就成功了，建议在代码里对它做自动重试。

  6. Key 从环境变量 `APIYI_API_KEY` 读，用 `Authorization` 头加 `Bearer` 前缀传，不要硬编码进代码、也不要提交进 git。

  7. 改完真跑一次文生图 + 一次图片编辑，把出图结果和这两次调用的花费贴给我。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求 | 挡掉的坑 |
  | - | - |
  | 不写死 `parts` 下标 | `parts` 段数和顺序都不保证，写死下标一定会间歇性失败。详见 [Nano Banana 开发指南](/api-capabilities/nano-banana-dev-guide) |
  | 取最后一张图片段 | 复杂编辑任务会返回多张中间稿，最后一张才是终稿 |
  | 不传 `512` | 2.1 去掉了 512 档，沿用 Nano Banana 2 的代码会直接 400 |
  | 显式传 `imageSize` 和 `aspectRatio` | 按量计费下分辨率决定单价；不传比例时模型自己选，同一提示词可能出横图也可能出竖图 |
  | 上传前压缩 | base64 后体积还会再膨胀约三分之一。压缩标准见 [图片压缩与输出分辨率说明](/api-capabilities/image-compression-resolution) |
  | 对 `IMAGE_SAFETY` 自动重试 | 审核拦截返回 200 但没有图，且不计费，原样重试往往就过了。详见 [Gemini 出图错误处理](/api-capabilities/gemini-image-error-handling) |
</Accordion>

## 核心特性

<CardGroup cols={2}>
  <Card title="画质升级" icon="sparkles">
    视觉质量较 Nano Banana 2 提升，并修复了上一代的平铺伪影
  </Card>

  <Card title="文字渲染更准" icon="type">
    图中文字更清晰、错字更少，适合海报、营销物料、信息图
  </Card>

  <Card title="多轮编辑更稳" icon="message-circle">
    对话式多轮编辑时角色和画面一致性更好，逐步精调不易跑偏
  </Card>

  <Card title="三档思考" icon="brain">
    支持 minimal / medium / high 三档，默认 medium，比上一代多了中间档
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="4K 超清输出" icon="expand">
    1K / 2K / 4K 三档分辨率，按次计费 4K 与 1K 同价
  </Card>

  <Card title="14 种宽高比" icon="maximize">
    含 1:4、4:1、1:8、8:1 超长/超宽比例，官方称宽幅格式在高分辨率下效果更好
  </Card>

  <Card title="多参考图融合" icon="users">
    最多 10 张物体参考图 + 4 张角色参考图 + 3 张风格参考图
  </Card>

  <Card title="Google 搜索接地" icon="search">
    可挂 `googleSearch` 工具，画天气卡、行情图等需要实时信息的图片
  </Card>
</CardGroup>

## 与 Nano Banana 2 的区别

| 对比项 | **Nano Banana 2.1** | Nano Banana 2 |
| - | - | - |
| 模型 ID | `gemini-nano-banana-2.1` | `gemini-3.1-flash-image` |
| 状态 | 正式版，谷歌推荐新项目使用 | 正式版，继续可用 |
| 画质 / 文字渲染 / 多轮一致性 | 更好 | 好 |
| 分辨率 | 1K / 2K / 4K | 512 / 1K / 2K / 4K |
| 4K 单张输出 tokens | 3780 | 2520 |
| 思考档位 | minimal / medium / high，默认 medium | minimal / high，默认 minimal |
| 官方价：输入 | \$1.50 / M | \$0.50 / M |
| 官方价：图片输出 | \$30 / M | \$60 / M |
| 官方价：4K 每张 | \$0.113 | \$0.151 |
| **API易 按次** | **\$0.045 / 次** | \$0.055 / 次 |
| **API易 按量** | 输入 \$0.66 / 输出 \$13.2 每 M | 输入 \$0.18 / 输出 \$21.6 每 M |

<Tip>
  **怎么选**：

  * **新项目** → 直接用 Nano Banana 2.1，画质更好，按次也更便宜
  * **已在用 Nano Banana 2** → 改一个模型名即可切换；但如果代码里用了 `512` 档，要先改成 `1K`
  * **需要 512px 缩略图** → 继续用 Nano Banana 2，或用 [Nano Banana 2 Lite](/api-capabilities/nano-banana-lite-image/overview)
  * **追求画质上限** → [Nano Banana Pro](/api-capabilities/nano-banana-image/overview)（\$0.09/次）
</Tip>

## 模型定价

<Info>
  **计费模式选择**：Nano Banana 2.1 支持两种计费方式，通过创建令牌时的「Billing model」设置选择：

  * 选择 **Pay-as-you-go**（按量计费）或 **Pay-as-you-go Priority**（按量优先）→ 按量计费
  * 选择 **Pay-per-request**（按次计费）或 **Pay-per-request Priority**（按次优先）→ 按次计费
  * ⚠️ **请勿选择 Hybrid billing（混合计费）**
</Info>

### 按次计费

| 模型 | API易定价 | 谷歌官方 4K 定价 | 相对官方 |
| - | - | - | - |
| **Nano Banana 2.1** `gemini-nano-banana-2.1` | **\$0.045/次**（1K / 2K / 4K 同价） | \$0.113/张 | **约 40%** |

<Tip>
  **2026-10-13 起降价 10%：\$0.05 → \$0.045/次**（1K / 2K / 4K 同价）。

  * **为什么降**：按量计费下 1K / 2K 单张本来就只要 \$0.02–\$0.04，按次 \$0.05 显得偏贵，所以把按次价也降下来。出 4K 的话，按次比按量（\$0.06 以上）便宜近三成。
  * **按量价不变**：输入 \$0.66、输出 \$13.2 每百万 tokens。
  * **还能更低**：叠加充值活动加赠 10%–20%，按次实际约 \$0.038–\$0.041/次。
</Tip>

### 按量计费

| 计费项目 | Google 官方 | API易 | 相对官方 |
| - | - | - | - |
| 输入 | \$1.50/M tokens | \$0.66/M tokens | **44%** |
| 输出（图片、文本、思考统一计价） | 图片 \$30/M，文本与思考 \$7.50/M | \$13.2/M tokens | 图片部分 **44%** |

<Note>模型价格与官网对齐，且可能随官网调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。</Note>

### 按量计费：线上真实扣费预览

Nano Banana 2.1 **默认就会先思考再出图**（默认档 medium），每张图除了图片 tokens，还会产生约 400–1300 个思考和其它输出 tokens，它们与图片一起按 \$13.2/M 计费。所以按量计费的单张费用**不是定值，有高有低**。下表摘自 2026-10-07 线上按量计费的真实请求，金额为控制台实际扣费（分辨率按输出 tokens 推断）：

| 场景 | 输入 tokens | 输出 tokens | 实际扣费 |
| - | - | - | - |
| 1K 文生图 | 36 | 1,970 | \$0.0260 |
| 1K 单图编辑 | 1,137 | 2,015 | \$0.0273 |
| 1K 单图编辑（思考较多） | 1,132 | 2,409 | \$0.0325 |
| 2K 文生图 | 13 | 2,623 | \$0.0346 |
| 2K 单图编辑 | 1,188 | 2,957 | \$0.0398 |
| 2K 14 张参考图融合 | 15,735 | 2,827 | \$0.0581 |
| 4K 文生图 | 13 | 4,703 | \$0.0621 |
| 4K 复杂提示词 | 72 | 4,933 | \$0.0652 |

当天 60 次按量请求的分布：

| 分辨率 | 请求数 | 最低 | 中位 | 最高 | 对比按次 |
| - | - | - | - | - | - |
| 1K | 31 | \$0.021 | \$0.029 | \$0.033 | \$0.045 |
| 2K | 19 | \$0.033 | \$0.036 | \$0.058 | \$0.045 |
| 4K | 10 | \$0.061 | \$0.063 | \$0.067 | \$0.045 |

<Tip>
  **怎么选计费方式**：

  * **出 1K / 2K → 选按量**，单张通常 \$0.02–\$0.04，比按次 \$0.045 更低
  * **出 4K → 选按次**，固定 \$0.045/次，按量要 \$0.06 以上
  * **一次塞很多参考图**（如 10 张以上）时，输入 tokens 会让按量费用接近甚至超过 \$0.045，这类请求也建议走按次

  结合 [充值加赠活动](/faq/recharge-promotions)，实际成本更低。
</Tip>

<Info>
  **为什么不能只按图片 tokens 估成本**：`usageMetadata` 里的 `thoughtsTokenCount`（思考 tokens）不包含在 `candidatesTokenCount` 里，但会计入 API易 日志的输出 tokens 一起计费。按 1120 / 1680 / 3780 估算会低估 20%–40%。对账请以控制台日志的扣费为准。
</Info>

## 影响计费的参数

| 参数 | 对单次账单的影响 | 说明 |
| - | - | - |
| `imageConfig.imageSize` | 1K 约 \$0.026 → 4K 约 \$0.062（按量） | 最大的杠杆；按次计费不受影响 |
| `thinkingConfig.thinkingLevel` | `high` 比默认多约 30% 思考 tokens，4K 单张约 +6% | 影响很小，按需开 |
| `tools: [{"googleSearch": {}}]` | 每次检索另收 \$0.014，实测每次出图检索 2 次 | 开了之后单次成本会明显上升 |

### thinkingLevel：默认 medium，high 只贵一点

| 设置 | 思考 tokens（中位） | 4K 单张费用（按量） |
| - | - | - |
| 不传（默认 medium） | 约 690 | 约 \$0.062 |
| `high` | 约 940 | 约 \$0.066 |

与 Nano Banana 2 不同（它默认 minimal、开 `high` 要贵 54%），2.1 默认就已经在思考，`high` 只是多想一点。对画面内文字排版、数据图表比例有硬要求时可以放心开。

### Google 搜索接地：按检索次数另收费

需要实时信息才能画对的场景（天气卡、行情图、近期活动海报），可以挂 `googleSearch` 工具：

```json theme={null}
{
  "contents": [{ "parts": [{ "text": "画一张东京今天天气的卡片海报" }] }],
  "tools": [{ "googleSearch": {} }]
}
```

实测 3/3 触发接地，每次请求模型自主发起 2 次检索，每次检索收 \$0.014（即 \$14 / 1000 次）。**检索次数由模型决定，无法预先控制**，做成本预估时按每次请求 2–3 次检索算。

<Warning>
  **按次计费下检索费照样另收**：\$0.045/次只覆盖出图本身，挂了 `googleSearch` 后检索费按次数叠加在上面。
</Warning>

## 分组介绍

Nano Banana 2.1 在 API易 提供两个分组，可在后台「令牌设置」中切换：

| 分组 | 倍率 | 适用场景 |
| - | - | - |
| `Default` 默认分组 | 1.0x | 基础通道，与定价表一致；默认推荐 |
| `NB-Enterprise` 企业分组 | 1.4x | 兜底通道，默认分组紧张或超时高发时切换，稳定优先 |

**令牌「计费模式」推荐**：选 `按量优先`（Pay-as-you-go Priority）——同时兼容 Nano Banana 2 / 2.1 的按量计费和 Nano Banana Pro 的按次计费，**一把令牌跑全系列**。主分组放 `Default`、兜底分组挂上 `NB-Enterprise`，主分组 429 时会自动回退继续出图。

## 支持的分辨率与宽高比

### 输出分辨率

| 分辨率 | 说明 | 推荐场景 |
| - | - | - |
| 1K | 默认 | 社交媒体、网页展示 |
| 2K | 高清 | 高清显示、打印材料 |
| 4K | 超高清 | 专业设计、商业海报 |

<Warning>
  **不支持 `512`**：传 `"imageSize": "512"` 会直接返回 400 `Image size 512 is not supported for this model`（不计费）。从 Nano Banana 2 迁移时注意改掉。
</Warning>

### 支持的宽高比（14 种）

`1:1`、`1:4`、`4:1`、`1:8`、`8:1`、`2:3`、`3:2`、`3:4`、`4:3`、`4:5`、`5:4`、`9:16`、`16:9`、`21:9`

**不传 `aspectRatio` 时，模型会按内容自己选比例**：实测风景类提示词多出 16:9，海报类多出 2:3 或 3:4。需要固定比例请显式传。

### 实测输出尺寸（像素）

| 宽高比 | 1K | 2K | 4K |
| - | - | - | - |
| **16:9** | 1376×768 | 2752×1536 | 5504×3072 |
| **2:3** | 848×1264 | — | 3392×5056 |
| **3:4** | 896×1200 | — | — |
| **8:1** | 2928×352 | — | — |

<Info>
  以上为 2026-10-07 实测值，「—」为尚未实测。注意 8:1 在 1K 下是 2928×352，与 Nano Banana 2 的 3072×384 不同，**不要照搬 Nano Banana 2 的尺寸表**做前端预留。
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="Nano Banana 2.1 和 Nano Banana 2 是同一个模型吗？">
    不是。2.1 是独立的新模型 ID `gemini-nano-banana-2.1`，画质、文字渲染和多轮一致性更好，计费结构也不同（输入更贵、图片输出更便宜、4K 单张 tokens 更多）。两个模型在 API易 同时可用，互不影响。
  </Accordion>

  <Accordion title="从 Nano Banana 2 切换过来要改什么？">
    1. 模型名从 `gemini-3.1-flash-image`（或 `-preview`）改为 `gemini-nano-banana-2.1`
    2. 如果用了 `"imageSize": "512"`，改成 `1K`
    3. 如果你按 tokens 估算成本，重新按上方「每张实际多少钱」的表核一遍

    请求格式、返回结构、多图编辑和多轮编辑的写法都不用改。
  </Accordion>

  <Accordion title="Nano Banana 2 会下线吗？">
    截至 2026 年 10 月 7 日，谷歌没有公布 `gemini-3.1-flash-image` 的下线日期，只是把 2.1 列为推荐替代。API易 上的 Nano Banana 2 继续可用、价格不变。如有变化我们会提前通知。
  </Accordion>

  <Accordion title="为什么我的账单比按图片 tokens 算出来的高？">
    因为 2.1 默认就会思考，每张图多出约 400–1300 个思考和其它输出 tokens，与图片一起按输出价计费。这部分在返回的 `thoughtsTokenCount` 里能看到。如果你出 4K 为主，改用按次计费（\$0.045/次）更划算。
  </Accordion>

  <Accordion title="有并发限制吗？">
    **API 不限制并发**，可以放心自行并发调用，请求之间不排队、不互相阻塞。真正要注意的是 `timeout`：4K 或高峰时单次耗时可能较长（实测 4K 多在 30–50 秒，个别超过 2 分钟），**建议客户端超时设到 360 秒**。偶发 429 时，把令牌兜底分组挂上 `NB-Enterprise` 即可。
  </Accordion>

  <Accordion title="输出图片有水印吗？">
    所有输出图片都带有 SynthID 隐形数字水印（Google 的 AI 生成内容标识技术），肉眼不可见，不影响使用。
  </Accordion>
</AccordionGroup>

## 相关文档

* [Nano Banana 2 生图/编辑](/api-capabilities/nano-banana-2-image/overview) - 上一代，支持 512px
* [Nano Banana Pro 生图/编辑](/api-capabilities/nano-banana-image/overview) - 画质上限
* [Nano Banana 系列开发指南](/api-capabilities/nano-banana-dev-guide) - 尺寸控制、输入图片要求、URL 传图
* [Nano Banana 系列价格](/api-capabilities/nano-banana-pricing)
* [Gemini 出图错误处理](/api-capabilities/gemini-image-error-handling)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.