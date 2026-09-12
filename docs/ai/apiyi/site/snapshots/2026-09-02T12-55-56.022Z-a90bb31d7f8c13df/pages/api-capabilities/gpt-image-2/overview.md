> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2 生图/编辑

> OpenAI 旗舰图像生成模型 gpt-image-2，原生 2K/4K 任意分辨率，参考图自动高保真，同档降价 20-30%，支持文生图、参考图编辑、多图融合、mask 局部重绘。

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。请为本模型设置足够大的 timeout，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

## 概述

**gpt-image-2** 是 OpenAI 最新旗舰图像生成模型，是 `gpt-image-1.5` 的升级版。核心升级：**任意合法分辨率（含 2K / 3840×2160 4K）**、**参考图自动高保真**、**同档降价 20-30%**。API易 网关完整兼容 OpenAI Images API，OpenAI 官方 SDK 把 `base_url` 指过来即可零代码改动直连。

<Note>
  **🎨 核心亮点**：原生支持任意合法分辨率（最大 3840×2160 4K）+ 参考图编辑自动启用 high-fidelity + 同尺寸同画质成本较 1.5 降低 20-30% + 中文提示词原生支持。**适合需要精确控制 size / quality、要求与 OpenAI 官方一致、要 4K 出图**的生产场景。
</Note>

<CardGroup cols={2}>
  <Card title="文生图 API" icon="wand-sparkles" href="/api-capabilities/gpt-image-2/text-to-image">
    `/v1/images/generations`，输入文本提示词生成图片，支持 size / quality / output\_format。
  </Card>

  <Card title="图片编辑 API" icon="image" href="/api-capabilities/gpt-image-2/image-edit">
    `/v1/images/edits`，multipart 上传参考图（最多 16 张）+ 编辑/融合指令，支持 mask 局部重绘。
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——超时、base64 渲染、上传压缩、质量参数这几个高频坑已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 gpt-image-2 的文生图与图片编辑。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查 gpt-image-2 的「文生图 + 图片编辑」。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/gpt-image-2/overview.md](https://docs.apiyi.com/api-capabilities/gpt-image-2/overview.md) 拿到本页纯文本版；需要更细的参数说明时，text-to-image 和 image-edit 两页同样在地址后加 `.md` 即可。

  接入要求：

  1. 超时：客户端 timeout 提到 360 秒兜底。图片接口是同步调用，没有任务 ID，客户端一断连结果就丢了、但这次请求照样计费，所以宁可多等也不要过早超时。反向代理、网关、Serverless 执行上限这些中间层也要一起放宽，任何一层小于生成时间都会掐断请求。

  2. 返回渲染：`/v1/images/generations` 固定返回 base64（`b64_json`，不带 `data:` 前缀），不是 URL。前端要能把 base64 渲染成图片展示，并提供「保存到本地」。不要传 `response_format`，传了直接报 400；也不要传 `input_fidelity`。

  3. 上传压缩：调 `/v1/images/edits`（multipart，最多 16 张参考图）前先压缩参考图——超过 1.5MB 才处理，长边等比缩到 2048px 以内（不放大小图），以质量 0.9 重编码、保持原格式；多图时合计控制在 6MB 以内。某张图压缩失败就回退用原图继续，不要因为压缩失败中断整个请求。

  4. 质量参数：`quality` 必传，默认 `medium`，前台界面加一个质量下拉（`low` / `medium` / `high`）。不要传 `auto`——它是动态推理档，费用和耗时都会漂移。

  5. Key 从环境变量 `APIYI_API_KEY` 读，base\_url 用 [https://api.apiyi.com/v1，不要硬编码进代码、也不要提交进](https://api.apiyi.com/v1，不要硬编码进代码、也不要提交进) git。

  6. 改完真跑一次文生图 + 一次图片编辑，把出图结果和这两次调用的花费贴给我。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求                   | 挡掉的坑                                                                                                                      |
  | -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
  | timeout 提到 360 秒     | 主流 HTTP 客户端默认 30-60 秒超时，会在服务端还在正常出图时掐断请求，而**断连的请求照常计费**。详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices) |
  | 渲染 base64            | 本模型不返回 URL，按 `data[0].url` 取值只会拿到空值                                                                                       |
  | 不传 `response_format` | 目前最高频的 400 报错，见本页[常见问题](#常见问题)                                                                                            |
  | 上传前压缩                | 手机原图动辄 4-5MB，base64 编码后还会再膨胀约 33%。压缩标准见 [图片压缩与输出分辨率说明](/api-capabilities/image-compression-resolution)                    |
  | 显式传 `quality`        | `auto` 是动态推理档，同一条提示词的费用和耗时会在档位之间漂移                                                                                        |
</Accordion>

## 为什么选 API易 的 GPT-image-2 官转？

对标 OpenAI 官方通道，针对企业生产场景在 **稳定性**、**成本**、**接入体验** 三方面做了深度优化：

<CardGroup cols={2}>
  <Card title="官方通道 · 与官方一致" icon="shield-check">
    严格走 OpenAI 官方转发链路，请求和响应 **100% 与 OpenAI 官方一致**——字段、错误码、模型行为完全相同，质量无损、无偷跑风险。
  </Card>

  <Card title="不限并发 · 企业可放量" icon="infinity">
    不受 OpenAI 官方 **Tier 等级** 对 RPM / TPM 的硬限，企业量级请求可线性放大，批量生图与高峰场景更从容。
  </Card>

  <Card title="同价 + 充值最低 85 折" icon="percent">
    默认单价与 OpenAI 官方一致，叠加 [充值加赠活动](/faq/recharge-promotions) **最低可享 85 折**，长期使用成本显著下降。
  </Card>

  <Card title="全球零门槛接入" icon="globe">
    **无需海外服务器或代理**，国内机房、家宽网络、海外节点均可直连 `api.apiyi.com`，延迟稳定、免去出海改造。
  </Card>

  <Card title="模型生态齐全" icon="layers">
    官逆 [`gpt-image-2-all`](/api-capabilities/gpt-image-2-all/overview)（\$0.03/张统一价）可无缝切换，另有性价比标杆 [Nano Banana Pro / 2](/api-capabilities/nano-banana-2-image/overview)，按场景自由组合。
  </Card>

  <Card title="专业服务 · 企业陪跑" icon="handshake">
    团队深耕图像生成场景，具备丰富的选型、调优与集成经验，可为企业客户提供从 PoC 到生产上线的完整技术支持。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="任意分辨率（含 4K）" icon="expand">
    支持任意合法尺寸输出，预设涵盖 1K / 2K / 3840×2160 4K，自定义尺寸只需满足边长 16 倍数、比例 ≤ 3:1 等基本约束。
  </Card>

  <Card title="参考图自动高保真" icon="wand-sparkles">
    编辑场景下自动启用 high-fidelity，参考图细节、人物身份、文字内容保留度大幅提升。**无需也不能**再传 `input_fidelity`。
  </Card>

  <Card title="同档降价 20-30%" icon="dollar-sign">
    1024×1024 高画质从 1.5 时代的 \$0.25 级别降到 \$0.211/张，2K/4K 按 token 实计但同样下行，长期使用成本明显降低。
  </Card>

  <Card title="中文 + 文字渲染" icon="type">
    中文提示词原生支持，招牌、海报、UI 截图等场景的中英文文字渲染稳定，`high` 档位下精细文字几乎不糊。
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="多图融合（最多 16 张）" icon="layers">
    `image[]` 数组最多接受 16 张参考图，prompt 中可用「图1/图2/图3」明确指代。
  </Card>

  <Card title="mask 局部重绘" icon="paintbrush">
    支持上传带 alpha 通道的 mask 图，透明区域为重绘区，不透明区域保留原图。
  </Card>

  <Card title="多种输出格式" icon="file-image">
    支持 png（默认）/ jpeg / webp，jpeg/webp 可设 `output_compression` 控制体积。
  </Card>

  <Card title="OpenAI SDK 直连" icon="plug">
    把 `base_url` 指向 `https://api.apiyi.com/v1` 即可用 OpenAI 官方 SDK 直接调用，零代码改动迁移。
  </Card>
</CardGroup>

## 模型定价

API易 `gpt-image-2`（Default 分组）**单价与 OpenAI 官网完全一致**，折扣体现在充值活动上——**充值 100 美金即送 10%，最多可送 20%**，📖 [了解充值活动](/faq/recharge-promotions)。

### 按 token 计费单价（与官网一致）

按 token 计费，一次请求 = 文本输入 + 图片输入 + 图片输出三段 token 之和：

| 计费项                | 单价（每 1M tokens）       | 说明                                   |
| ------------------ | --------------------- | ------------------------------------ |
| 文本输入（Text Input）   | \$5.00                | prompt 文字部分                          |
| 图片输入（Image Input）  | \$8.00                | 编辑/融合场景的参考图，按 Vision 规则换算 token      |
| 图片输出（Image Output） | \$30.00               | **成本大头**，由 size × quality 决定 token 量 |
| 缓存输入（Cached Input） | 文本 \$1.25 / 图片 \$2.00 | 已配置，但高并发下命中率有限，详见 [FAQ](#常见问题)       |

**图片输入为什么更贵？** 图片输入单价 \$8.00 / 1M tokens，是文本输入 \$5.00 / 1M tokens 的 **1.6 倍**（官方定价如此）。这也是为什么带参考图的编辑 / 多图融合请求，输入成本会明显高于纯文生图——参考图本身按 Vision 规则换算成大量 image token，且每个 token 的单价还比文本 token 高六成。

### 每张成本速查（官方按量定价表）

1K 预设尺寸下，每张输出图的典型成本：

| 画质     | 1024×1024 | 1024×1536 | 1536×1024 |
| ------ | --------- | --------- | --------- |
| Low    | \$0.006   | \$0.005   | \$0.005   |
| Medium | \$0.053   | \$0.041   | \$0.041   |
| High   | \$0.211   | \$0.165   | \$0.165   |

<Info>
  **计费说明**：

  * 单价与 OpenAI 官网一致，叠加 [充值加赠](/faq/recharge-promotions)（充 \$100 送 10%，最高 20%）后实际成本低于官方直连
  * 2K / 4K 无固定每张价，按输入 + 输出 token 实计
  * 编辑场景因强制高保真，输入 token 明显高于纯文生图
  * 流式出图（`stream: true` + `partial_images: N`）每张 partial 额外消耗 100 个输出 image token
  * 对比 `gpt-image-1.5`，同档同尺寸 `gpt-image-2` 成本低约 20-30%
</Info>

### 多图输入的价格影响（2026-07 实测）

客户常问：「参考图是每张定量收费，还是图片越大消耗越多？」答案是**两者都影响，且张数严格线性累加**。`gpt-image-2` 对输入图固定高保真处理（`input_fidelity` 不可调，传了直接 400），每张参考图按尺寸/宽高比换算成 image token。以下为控制变量实测（编辑接口，2026-07-15）：

| 参考图输入             | `image_tokens`       | 输入费用（\$8/M） |
| ----------------- | -------------------- | ----------- |
| 1 张 512×512       | 1024                 | ≈\$0.0082   |
| 1 张 1024×1024     | 1024                 | ≈\$0.0082   |
| 1 张 2048×2048     | 1521                 | ≈\$0.0122   |
| 1 张 4096×4096     | 1521                 | ≈\$0.0122   |
| 1 张 1024×1536（竖版） | 1536                 | ≈\$0.0123   |
| **4 张 1024×1024** | **4096（= 4 × 1024）** | ≈\$0.0328   |

三个规律：

1. **张数严格线性**：N 张参考图 ≈ N × 单张 token。16 张 1024² 参考图 ≈ 16384 tokens ≈ \$0.13——已与一张 `high` 输出（\$0.211）同量级，多图融合时不可忽略。
2. **尺寸有下限也有封顶**：小于等于 1024² 的方图统一按 1024 tokens 计（把图缩到 512 **不省钱**）；2048² 与 4096² 同为 1521 tokens（超大图先缩放再换算，**封顶**）。单张参考图的 token 大致在 800-1600 区间浮动（含宽高比影响）。
3. **token 由像素尺寸决定，与文件体积无关**：把图压到 1.5MB 是为了上传稳定和速度，**不会减少 image token**；反过来，费用也不会因为你传了 50MB 的原图而爆炸（有封顶）。

<Tip>
  成本视角的直觉：`low` 输出（196 tokens ≈ \$0.006）时，1 张参考图的输入费（≈\$0.008）反而比输出还贵；`high` 输出（≈\$0.211）时 1 张参考图只占约 4%。**输出的尺寸和画质永远是价格的最大变量**，参考图张数是第二变量。
</Tip>

### 2K/4K 成本预估（像素比例外推，⚠️ 非官方固定价）

OpenAI 官方只公布了 1K 尺寸的固定每张单价表，2K/4K **没有官方逐尺寸定价**。下表是 API易 按「像素总数比例」从上方 1K 官方单价**外推**的预估值，仅供预算参考：

| 画质     | 2048×2048（2K 方形） | 2048×1152（2K 横版） | 3840×2160 / 2160×3840（4K） |
| ------ | ---------------- | ---------------- | ------------------------- |
| Low    | ≈\$0.024         | ≈\$0.008         | ≈\$0.026                  |
| Medium | ≈\$0.212         | ≈\$0.062         | ≈\$0.216                  |
| High   | ≈\$0.844         | ≈\$0.248         | ≈\$0.870                  |

<Warning>
  **这不是官方定价表，是估算值。** 计算方法：以 1K 官方表中同长宽比的行为基准，按目标尺寸与基准尺寸的像素总数比例线性外推（如 2048×2048 像素数是 1024×1024 的 4 倍，估算成本也 ×4）。实际出图的 image token 数由模型按内容复杂度动态决定，并非严格线性，**真实成本务必以每次调用响应里的 `usage.output_tokens` 为准**（见下方「如何查看每次调用的真实 token 数」）。`high` + 超过 2560×1440 的尺寸目前还是官方标记的实验档位，估算误差可能更大。
</Warning>

### 与 SaaS 套餐 / 积分制计费方式的区别

图像生成类工具厂商常见两种计费模式：

* **包月套餐（订阅制）**：固定月费换取"每月可生成 N 张"的额度。这个额度背后是运营商按平均用量预估的**超卖定价**——套餐设计时就假设不是所有人都会用满，宣传的"单张成本"只是套餐价除以额度上限的理论值，跟你真实一张图的实际生成成本没有必然关系。
* **积分包 / 动态点数计费**：把不同画质、尺寸的生成任务换算成不透明的"积分"消耗，本质上也是按量计费，只是用积分做了一层包装，掩盖了底层真实的 token 用量。

API易走的是**官转 API + 按 token 实际用量计费**：没有套餐额度，没有积分模糊层，每次调用的成本 = 实际消耗的 input/output token × 官方单价，可以精确核算到每一次调用，不存在套餐"多退少补"或"超额限流"的问题。

<Tip>
  按量计费的代价是需要自己估算 / 监控用量，不像套餐那样有固定月度总价的确定性——好处是用多少花多少，没有闲置浪费。下面教你怎么从响应里直接拿到每次调用的真实 token 数，自己核算成本。
</Tip>

### 如何查看每次调用的真实 token 数

`/v1/images/generations` 和 `/v1/images/edits` 的响应都带 `usage` 字段，**图片输入 token 和文本输入 token 是分开返回的**，不用估算，直接读字段就能精确核算这一次调用的真实成本。下面是一次真实编辑请求（带 1 张参考图）返回的完整 `usage`（实测抓包）：

```json theme={null}
{
    "data": [ { "b64_json": "..." } ],
    "usage": {
        "input_tokens": 848,
        "input_tokens_details": {
            "image_tokens": 832,
            "text_tokens": 16
        },
        "output_tokens": 196,
        "output_tokens_details": {
            "image_tokens": 196,
            "text_tokens": 0
        },
        "total_tokens": 1044
    }
}
```

| 字段                                        | 含义                                                                                                                                              |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `usage.input_tokens_details.text_tokens`  | 输入 prompt 文本消耗的 token 数，按 \$5.00 / 1M 计                                                                                                         |
| `usage.input_tokens_details.image_tokens` | 参考图按 Vision 规则换算出的 token 数，按 \$8.00 / 1M 计；纯文生图（无参考图）时恒为 0                                                                                      |
| `usage.input_tokens`                      | 上面两项之和                                                                                                                                          |
| `usage.output_tokens`                     | 输出图片的 token 数，由 `quality × size` 共同决定，是**成本大头**，按 \$30.00 / 1M 计，2K/4K 请求应重点关注这个值（`output_tokens_details.image_tokens` 与其相同，`text_tokens` 恒为 0） |
| `usage.total_tokens`                      | 输入 + 输出总和                                                                                                                                       |

自行核算公式（精确版）：

```
成本 ≈ input_tokens_details.text_tokens × \$5.00 / 1,000,000
     + input_tokens_details.image_tokens × \$8.00 / 1,000,000
     + output_tokens × \$30.00 / 1,000,000
```

<Tip>
  想看历史调用的真实 token 消耗和计费明细，也可以直接去控制台「日志」页面查：📖 [如何查看调用记录](/faq/call-logs)——日志详情里会把「输入价格 / 图片输入价格 / 输出价格」和对应的 token 数都列出来，跟接口里 `usage.input_tokens_details` / `usage.output_tokens_details` 是对应的。Responses API 的 `image_generation` 工具调用同样在 `usage.input_tokens` / `usage.output_tokens` 里给出 token 数，用法一致，参见 [Responses 工具集成](/api-capabilities/gpt-image-2/responses-image-tool)。
</Tip>

## 分组介绍

`gpt-image-2` 官转目前提供两个分组，可在后台「令牌设置 → 分组」中切换：

| 分组                      | 倍率   | 适用场景                                   |
| ----------------------- | ---- | -------------------------------------- |
| `Default` 默认分组          | 1.0x | 与 OpenAI 官方同价，资源宽裕时首选；高峰期可能并发紧张、出现 429 |
| `image2Enterprise` 企业分组 | 1.2x | 默认分组紧张时的稳定过渡通道，稳定优先                    |

**1.2x 倍率怎么来的？** 基于"3000 美金单次充值大客户加赠 20% 后约等官网原价"的口径设定——平台不计税务成本，不赚钱也优先保障供给。默认分组不稳定时，把令牌切到 `image2Enterprise` 即可临时过渡使用。

<Frame caption="令牌设置：选择 image2Enterprise 分组（1.2x），常规资源不足时仍稳定">
  <img src="https://mintcdn.com/apiyillc/UtyWoIxj7WA74SC7/images/image2-enterprise-token-setup-20260425.png?fit=max&auto=format&n=UtyWoIxj7WA74SC7&q=85&s=10b41109f9642890dfdc96ec3b6afa03" alt="令牌创建界面：计费模式选「按量优先」，分组选 image2Enterprise（1.2x），高速正价的 GPT image 2 企业分组" width="1274" height="988" data-path="images/image2-enterprise-token-setup-20260425.png" />
</Frame>

📖 分组上线公告：[/live/2026-04/image2-enterprise](/live/2026-04/image2-enterprise)

## 技术规格

| 维度            | 参数                                                                         |
| ------------- | -------------------------------------------------------------------------- |
| **模型名**       | `gpt-image-2`                                                              |
| **速度**        | 约 120 秒（高画质 4K 接近 2 分钟）                                                    |
| **输出分辨率**     | 任意合法尺寸（1K/2K/4K，最大 3840×2160）                                              |
| **画质档位**      | `auto` / `low` / `medium` / `high`                                         |
| **输出格式**      | `png`（默认）/ `jpeg` / `webp`                                                 |
| **中文提示词**     | ✅ 原生支持                                                                     |
| **单次出图数量**    | 1 张（`n=1`）                                                                 |
| **参考图上限**     | 16 张（`image[]`）                                                            |
| **单图大小上限**    | multipart 文件每张小于 50MB（png/jpg/webp）；base64 data URL 字段约 20MiB，原图建议 15MB 以内 |
| **mask 局部重绘** | ✅ 支持（要求带 alpha 通道，PNG 且小于 4MB）                                             |
| **透明背景**      | ✅ 支持（`background: "transparent"` + `png` / `webp`；`jpeg` 无 alpha 通道，与透明互斥） |
| **响应字段**      | `b64_json`（**纯 base64，无前缀**）；**不接受 `response_format` 参数**，传了直接 400         |

## 端点一览

| 端点                            | 用途                     | Content-Type          |
| ----------------------------- | ---------------------- | --------------------- |
| `POST /v1/images/generations` | 文生图                    | `application/json`    |
| `POST /v1/images/edits`       | 参考图编辑 / 多图融合 / mask 重绘 | `multipart/form-data` |

<Tip>
  **域名选择**：`api.apiyi.com` 为主域名，也可使用 `b.apiyi.com` / `vip.apiyi.com` 等平台提供的其他网关域名，响应行为一致。
</Tip>

## 尺寸（size）详解

### 预设尺寸

| size        | 含义      | 像素   |
| ----------- | ------- | ---- |
| `auto`      | 自适应（默认） | 模型决定 |
| `1024x1024` | 方形 1:1  | 1K   |
| `1536x1024` | 横版 3:2  | 1K   |
| `1024x1536` | 竖版 2:3  | 1K   |
| `2048x2048` | 方形 1:1  | 2K   |
| `2048x1152` | 横版 16:9 | 2K   |
| `3840x2160` | 横版 16:9 | 4K   |
| `2160x3840` | 竖版 9:16 | 4K   |

### 自定义尺寸约束

`gpt-image-2` 接受**任意合法尺寸**，只需同时满足：

1. **最大边 ≤ 3840px**
2. **两条边都是 16 的倍数**
3. **长短边比例 ≤ 3:1**
4. **总像素数 ∈ \[655,360, 8,294,400]**（下限约 0.65MP，上限约 8.3MP）

**合法示例**：`1600x1200`、`1792x1024`、`2048x1536`、`3200x1800`
**非法示例**：`1000x1000`（非 16 倍数）、`4000x4000`（超上限）、`3840x1000`（比例超 3:1）

<Warning>
  超过 `2560×1440`（约 3.69MP）的输出目前官方标记为**实验性**，可能不稳定或出现质量波动。生产环境建议优先用预设尺寸：`2048x1152` / `2048x2048` / `3840x2160` 等。
</Warning>

## 画质（quality）详解

### 可选档位

| quality  | 含义         | 说明                         |
| -------- | ---------- | -------------------------- |
| `auto`   | 自动（**默认**） | 不传 `quality` 时即为此值，由模型自动选档 |
| `low`    | 低画质        | 速度最快、成本最低，适合草稿 / 批量        |
| `medium` | 中画质        | 日常 / 终稿的均衡选择               |
| `high`   | 高画质        | 文字、精细纹理、印刷场景，耗时与成本最高       |

<Warning>
  **默认是 `auto`，不是 `medium`。** 不传 `quality` 等同于传 `"quality": "auto"`，由模型自动选择合适的画质档位，**官方没有承诺它固定等同于 `medium`**。`auto` 选中的档位不可控，会直接影响出图成本、响应速度与计费稳定性。**需要控制成本和可预期性时，请显式传入 `low` / `medium` / `high`，不要依赖 `auto`。**
</Warning>

<Warning>
  **不要传旧版 DALL·E 的 `standard` / `hd`。** `quality` 只接受 `low` / `medium` / `high` / `auto` 四个官方枚举值。旧版 DALL·E 3 的 `standard` / `hd` 在不同后端渠道下行为不一致：有时直接 400 报错（`invalid_value`），有时被静默忽略、按 `auto` 档跑出结果（费用不可控）。请始终显式传四个官方值之一。
</Warning>

<Info>
  **`quality` 是影响价格最大的参数，比 `size` 更显著。** 输出图片 token 量由 `quality × size` 共同决定，但 `quality` 的权重明显更高——同一尺寸下从 `low` 到 `high`，每张成本可相差 **30 倍以上**（参见上方「每张成本速查」表：1024×1024 从 `low` \$0.006 到 `high` \$0.211）。预算和选档时应**优先按 `quality` 评估成本**，再叠加 `size` 的影响。
</Info>

## 最佳实践

<Warning>
  **对接经验：先用 `low` 跑通，再按需升档**

  实测有客户首次接入就直接拉满 `quality=high` + 高分辨率，**单张耗时 ≈ 235 秒（约 4 分钟）**，一度误以为是接口卡住。`high` 模式推理复杂度最高，4K 场景甚至接近 5 分钟。**正式上线前请先用 `quality=low` 跑通整条链路**（鉴权、SDK、参数、超时、错误处理），确认功能 OK 后再按业务对画质的实际需求逐档升到 `medium` / `high`。
</Warning>

<Steps>
  <Step title="对接先跑 low 验证链路">
    新接入时**优先用 `quality=low` + 预设尺寸**跑通整条链路（鉴权、参数、超时、错误处理）。`low` 速度比 `high` 快数倍，能快速暴露所有非画质相关的问题，避免被长耗时干扰排查。
  </Step>

  <Step title="尺寸优先选预设">
    8 个预设尺寸经过官方优化，速度和质量更稳定；自定义尺寸留给真有比例需求的场景。
  </Step>

  <Step title="画质按场景分档">
    草稿 / 批量 → `low`；默认 / 终稿 → `medium`；文字、精细纹理、印刷 → `high`。**注意 `low` ↔ `high` 不仅是画面精美度差异，还包含推理复杂度差异**——耗时差距可达数倍。
  </Step>

  <Step title="输出格式选 JPEG">
    对最终展示无特别要求时，`output_format=jpeg` + `output_compression=85` 比 PNG 快且体积小一半以上。
  </Step>

  <Step title="文字场景锁 high">
    文字渲染是主要卖点，但 low/medium 仍可能糊；招牌、海报类场景锁 `quality=high`。
  </Step>

  <Step title="编辑场景准备参考图">
    单张上限 50MB（建议压到 1.5MB 以内），PNG/JPEG/WebP 均可；最多 16 张；prompt 里用「图1/图2」指代顺序。
  </Step>

  <Step title="超时分档配置（high 兜底 600 秒）">
    影响出图耗时最大的是 **`quality`** 与 **`size`**，尤其是 `quality`。建议按档位配置客户端超时：

    | quality  | 推荐客户端超时         | 实测耗时区间                       |
    | -------- | --------------- | ---------------------------- |
    | `low`    | ≥ **120 秒**     | 通常 10–40 秒                   |
    | `medium` | ≥ **240 秒**     | 通常 30–90 秒                   |
    | `high`   | ≥ **600 秒**（兜底） | 2K/4K 实测 3–5 分钟，长尾可达 235 秒以上 |

    **`high` 模式务必配 600 秒兜底**，覆盖排队 / 长尾 / 服务抖动等各种异常情况；前端务必给进度反馈；服务端建议用任务队列解耦。
  </Step>

  <Step title="迁移注意">
    从 `gpt-image-1.5` 迁移：删掉 `input_fidelity`（强制高保真，传了会报错）；`background: transparent` 照常可用，无需改动。从 DALL·E 2/3 老代码迁移：**删掉 `response_format`**（GPT Image 系列不接受此参数，传了直接 400 `Unknown parameter: 'response_format'`，返回固定为 `b64_json`）。
  </Step>
</Steps>

## 错误码与重试

| 状态码   | 含义                        | 处理建议                                                                                                                                                                                                                                                                          |
| ----- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `400` | 参数非法（size 不合约束、传了不支持的字段等） | 按尺寸约束章节校验；**注意不要传** `response_format` / `input_fidelity`；`background: transparent` 配 `output_format: jpeg` 也会 400（jpeg 无 alpha 通道），改用 `png` / `webp`；报 `Unknown parameter: 'response_format'` 直接删掉该参数即可，见 [FAQ](#常见问题)；编辑接口报 `invalid_image_file` 多为手机原拍 MPO 图，见 [FAQ](#常见问题) |
| `401` | 令牌无效                      | 检查 Bearer Token                                                                                                                                                                                                                                                               |
| `403` | 内容审核拦截                    | 调整 prompt 或传 `moderation: low`                                                                                                                                                                                                                                                |
| `429` | 限流 / 余额不足                 | 指数退避重试                                                                                                                                                                                                                                                                        |
| `5xx` | 网关 / 后端错误                 | 重试 1–2 次                                                                                                                                                                                                                                                                      |
| 超时    | 长尾                        | 客户端超时按 `quality` 分档：`low` ≥ **120 秒** / `medium` ≥ **240 秒** / `high` ≥ **600 秒**（high + 2K/4K 实测 3–5 分钟，长尾可达 235 秒以上）                                                                                                                                                        |

<Info>
  **建议客户端**：

  * 请求超时按 `quality` 分档配置：`low` ≥ **120 秒** / `medium` ≥ **240 秒** / **`high` ≥ 600 秒**（兜底；实测 3–5 分钟，按 120/360 秒配会大量误超时）
  * **新接入先用 `quality=low` 跑通链路**，再按需升到 `medium` / `high`
  * 对 5xx 与超时做 **指数退避重试**（建议 2 次）
  * 记录响应头 `x-request-id` 方便排查
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="报 400「Unknown parameter: 'response_format'」怎么办？">
    **删掉 `response_format` 参数即可，这是目前最高频的 400 报错。** `gpt-image-2`（及整个 GPT Image 系列）**不接受** `response_format`——返回格式固定为 `b64_json`，无需也不能指定。传了就会报：

    ```json theme={null}
    {
      "error": {
        "message": "Unknown parameter: 'response_format'.",
        "type": "invalid_request_error",
        "param": "response_format",
        "code": "unknown_parameter"
      }
    }
    ```

    这个参数是 **DALL·E 2/3 时代**的遗留（当年可选 `url` / `b64_json`），网上大量旧示例代码和部分第三方库默认会带上它。迁移到 `gpt-image-2` 时把这个字段删掉，直接读 `data[0].b64_json`（纯 base64，decode 后即为图片文件）。该错误在入口参数校验阶段返回，**不计费**。

    如果业务确实需要拿到**图片 URL** 而不是 base64：

    * 官方 `gpt-image-2` 没有 URL 输出，需自行 decode 后上传到自己的对象存储
    * 或改用官逆 [`gpt-image-2-all`](/api-capabilities/gpt-image-2-all/overview)，它支持 `response_format: "url"`，返回 24 小时有效的 CDN 链接
  </Accordion>

  <Accordion title="返回的 b64_json 要不要自己加 data:image/png;base64, 前缀？">
    **要**。`gpt-image-2` 返回的是**纯 base64 字符串**（无前缀），与 `gpt-image-2-all` 不同。客户端有两种用法：

    * **写文件**：`base64.b64decode(b64_str)` 后写入磁盘
    * **浏览器渲染**：`img.src = 'data:image/png;base64,' + b64_str` 自行拼前缀

    若你的代码沿用了 1.5 时代的"已含前缀"假设，会拿到损坏的 data URL，请显式判断。
  </Accordion>

  <Accordion title="为什么传 input_fidelity 会报 400？">
    `gpt-image-2` **强制启用** high-fidelity 处理参考图，不再接受 `input_fidelity` 参数。从 1.5 迁移时把这个字段移除即可，无需替换。
  </Accordion>

  <Accordion title="想要透明背景怎么办？">
    直接传 `background: "transparent"`，配合 `output_format` 为 `png` 或 `webp`，返回的就是带 alpha 通道的透明底图，不需要任何后处理抠图。文生图、图片编辑、Responses 出图工具三条路都支持。

    两个边界：`jpeg` 没有 alpha 通道，与透明互斥（会 400）；编辑接口传透明时是**重绘去背**而不是沿原图轮廓精确抠像，主体细节会有变化，要像素级还原请自行用 `rembg` / `PIL` / `sharp` 处理。

    完整说明与各模型支持情况见 [怎么生成透明背景的图片](/faq/image-transparent-background)。
  </Accordion>

  <Accordion title="单次能出几张？">
    1 张（`n=1`）。如需 N 张请客户端并行 N 次调用。每次独立按 token 计费。
  </Accordion>

  <Accordion title="2K/4K 出图为什么很慢？">
    输出分辨率越高、画质档位越高，需要生成的 image token 越多，自然耗时越长。**实测有客户在 `quality=high` + 高分辨率下耗时 ≈ 235 秒（约 4 分钟）单张**，`3840×2160` + `high` 长尾可接近 5 分钟。建议：

    * **新接入先用 `quality=low` 跑通链路**，确认正常后再按业务需求升档
    * 客户端超时按档位配：`low` ≥ **120 秒** / `medium` ≥ **240 秒** / **`high` ≥ 600 秒**（兜底）
    * 前端显示"生成中"进度反馈
    * 不需要 4K 时仍用 1024×1024 / 1536×1024 等 1K 预设
  </Accordion>

  <Accordion title="编辑请求为什么比文生图贵？">
    因为 `gpt-image-2` 对参考图自动启用 high-fidelity 处理，参考图本身会按 Vision 计费规则换算成大量输入 token。带图编辑的输入 token 明显高于文生图，预算时要留足。
  </Accordion>

  <Accordion title="尺寸、参考图都一样，为什么每次调用价格还不一样？">
    **根因：`quality` 传了 `auto`（或没传）。** 有客户反馈「尺寸、分辨率、参考图完全一样，价格却忽高忽低」，定位后发现请求里 `size` 和 `quality` 都用了 `auto`。

    **问题出在 `quality: auto`**：自动模式下，模型会**自行理解需求、临时选择不同的质量档位**去创作。档位不同 → 输出的 image token 数量不同 → 价格自然不同。下面是三次「输入完全一致（input 都是 1061 token）」却价格相差数倍的真实账单：

    | 耗时    | 输入 token | 输出 token | 单次价格           |
    | ----- | -------- | -------- | -------------- |
    | 53 秒  | 1061     | 1286     | \$0.055082     |
    | 135 秒 | 1061     | **5146** | **\$0.194042** |
    | 68 秒  | 1061     | 1287     | \$0.055118     |

    第二次 `auto` 被模型判定为更高画质，输出 token 飙到 5146，价格也随之涨到约 3.5 倍。

    **解决办法：不要让 `quality` 用 `auto`，显式传 `low` / `medium` / `high`。** 固定档位后，相同输入的输出 token 量和价格才稳定可预期。详见上方「画质（quality）详解」章节。
  </Accordion>

  <Accordion title="缓存计费（Cached Input）能享受到吗？">
    **已配置，但请勿把缓存折扣纳入成本预算。** 官方缓存单价为文本 \$1.25 / 图片 \$2.00（每 1M tokens），API易 通道同样配置了缓存计费，命中时按缓存价结算。

    但需要如实同步一个客观限制：API易 为承载高并发，请求会分散到多个 OpenAI 上游账号（单个 OpenAI Tier-5 账号的 RPM 仅 250）。OpenAI 的提示词缓存不跨账号共享，高并发下同一前缀的请求未必落在同一账号上，**缓存可能命中不了**。

    好在影响很小：图像生成的成本大头是图片输出 token（\$30 / 1M），缓存折扣只作用于输入端，对单张图总成本的影响本就式微。建议按**全正价输入**做预算，缓存命中时视为额外节省。
  </Accordion>

  <Accordion title="图片编辑接口的图片数量和大小限制？">
    `gpt-image-2` 图片编辑接口（`/v1/images/edits`）最多支持上传 **16 张**参考图：

    * **multipart/form-data 文件上传**：每张图片**小于 50MB**，支持 `png` / `jpg` / `webp`
    * **base64 data URL 方式**：字段长度限制约 **20MiB**（schema `maxLength: 20971520`，是字符串字段限制，**不等同于** multipart 的 50MB 上限），实际原图建议控制在 **15MB 以内**
    * **mask 文件**：单独限制为 **PNG 且小于 4MB**

    实践建议：不要多张大图同时顶满上限——请求体过大易在网关 / 超时层面失败，每张先压到 **1.5MB 以内**最稳，且输出画质与输入体积无关。
  </Accordion>

  <Accordion title="编辑接口报 400「Invalid image file or mode for image 1」怎么办？">
    这个报错（`code: invalid_image_file`）的含义是：**第 N 张参考图不是标准的 png / jpg / webp 格式**（序号从 1 开始，按序号定位问题图）。

    最常见的根因是手机原拍照片的 **MPO 格式**：华为 Mate 系列等机型直出的 `.jpg` 内嵌 HDR 增益图副帧，实为多帧 JPEG 容器（MPO）。文件头同为 `FFD8`，扩展名和 `file` 命令都显示 JPEG，肉眼无法分辨——2026-07 实测 MPO 图必被拒，重编码为标准 JPEG/PNG 后**原分辨率上传即成功**（与尺寸、`image[]` 字段名、`quality`/`size` 参数均无关）。该错误在入口校验阶段返回，**不计费**。

    **修复**：上传前用 Pillow 重编码（`Image.open(f).format` 返回 `"MPO"` 即需转换）：

    ```python theme={null}
    from PIL import Image
    im = Image.open("photo.jpg")
    im.load()                          # MPO 只取第一帧
    im.convert("RGB").save("photo_fixed.jpg", quality=92)
    ```

    完整说明与判别方法见 [图片编辑 API「参考图格式要求与预处理」](/api-capabilities/gpt-image-2/image-edit#参考图格式要求与预处理)。
  </Accordion>

  <Accordion title="mask 文件怎么准备？">
    * 与原图**相同尺寸**，**PNG 格式**，单张**小于 4MB**
    * **必须带 alpha 通道**：透明区域（alpha=0）= 要重绘的部分，不透明区域 = 保留
    * 仅对第一张 image 生效
    * mask 是"软引导"非精确边界，模型可能在蒙版周围扩展 / 收敛
  </Accordion>

  <Accordion title="和 gpt-image-2-all 怎么选？">
    | 选                       | 场景                                                          |
    | ----------------------- | ----------------------------------------------------------- |
    | **gpt-image-2**（官方）     | 需要精确控制 size / quality、要求与 OpenAI 官方完全一致、要 4K 出图、要 mask 局部重绘 |
    | **gpt-image-2-all**（官逆） | 追求统一价 \$0.03/张、约 30–60 秒出图、参数极简、对一致性 / 中文文字要求高              |
  </Accordion>

  <Accordion title="能用 OpenAI 的官方 SDK 直连吗？">
    可以，零代码改动。把 `base_url` 指向 `https://api.apiyi.com/v1`，`api_key` 设为 API易 令牌即可：

    ```python theme={null}
    from openai import OpenAI
    client = OpenAI(api_key="sk-your-key", base_url="https://api.apiyi.com/v1")
    resp = client.images.generate(model="gpt-image-2", prompt="...", size="2048x1152", quality="high")
    ```
  </Accordion>

  <Accordion title="支持主动中断生成任务吗？">
    **不支持**。`gpt-image-2` 走 OpenAI 官方同步端点，请求一旦提交就会跑到结束，无法发出"取消"指令。客户端即使断开连接，服务端仍会把这次生成完整跑完并照常计费。建议在客户端做好超时控制，不要依赖"断连就不收费"的假设。
  </Accordion>

  <Accordion title="有请求速率限制（RPM）吗？">
    默认 **100 RPM**（每分钟 100 次请求）。实际可用 RPM 还会受**全平台总并发**动态调整。如果你的业务需要更高配额，请联系我们告知预估 QPS / RPM，可单独申请扩容资源。
  </Accordion>

  <Accordion title="支持异步调用吗？">
    **不支持**。`gpt-image-2` 严格与 OpenAI 官方一致——只有同步调用，发起请求后阻塞等待结果（`high` 档 + 4K 实测 1–2 分钟）。如需异步队列、回调通知等能力：

    * 在业务层用任务队列（Celery / BullMQ 等）自行封装异步
    * 或改用 [`gpt-image-2-all`](/api-capabilities/gpt-image-2-all/overview)，出图约 30–60 秒，更适合前端轮询
  </Accordion>

  <Accordion title="生成失败会扣费吗？">
    **不会**。OpenAI 自带内容安全审核，触发审核或参数非法时会直接返回 `400` 错误并**不计费**。典型响应：

    ```json theme={null}
    {
      "status_code": 400,
      "error": {
        "message": "Your request was rejected by the safety system. ...",
        "type": "shell_api_error",
        "code": "moderation_blocked"
      }
    }
    ```

    其它常见的 0 计费错误：`401`（令牌无效）、`429`（限流）。**只有请求实际进入模型生成阶段（即收到 `200` + `b64_json`）才会按 token 计费**。
  </Accordion>
</AccordionGroup>

## 相关文档

* [⚖️ 官转 vs 官逆 对比](/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - 选型对照表，帮你决定用哪个
* [文生图 Playground](/api-capabilities/gpt-image-2/text-to-image) - `/v1/images/generations` 在线调试
* [图片编辑 Playground](/api-capabilities/gpt-image-2/image-edit) - `/v1/images/edits` 多图融合 + mask
* [深度解读：gpt-image-2 上线说明](/news/gpt-image-2-launch) - News 文章
* [完整接入文档（中文）](/api-capabilities/gpt-image-2/overview) - 完整 API 参考
* [GPT-Image-2-All（官逆版本）](/api-capabilities/gpt-image-2-all/overview) - 更便宜、更快的备选方案
* [社区贡献：Luck GPT-Image 2 ComfyUI 节点](/scenarios/ecosystem/luckgpt2-comfyui) - 在 ComfyUI 中一键调用 `gpt-image-2`（含 mask / 5 图输入 / 自定义尺寸）
* [社区贡献：APIYI GPT-Image 2 Skills](/scenarios/ecosystem/apiyi-gpt-image-skills) - 在 Codex CLI / Cursor / Gemini CLI 等 AI 编程工具中一句话调用
* [API 使用手册](/api-manual) - 通用调用规范

<Info>
  `gpt-image-2` 是 OpenAI 官方旗舰，按 token 实计；如果你更看重统一定价（\$0.03/张）和出图速度（30–60s），可参考 [gpt-image-2-all](/api-capabilities/gpt-image-2-all/overview)。
</Info>
