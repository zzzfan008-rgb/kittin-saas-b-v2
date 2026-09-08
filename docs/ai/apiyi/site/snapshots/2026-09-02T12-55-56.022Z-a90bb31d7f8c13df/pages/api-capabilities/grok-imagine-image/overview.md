> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Imagine 2 生图/编辑

> xAI 最新一代图像生成模型 Grok Imagine 2（grok-imagine-image / grok-imagine-image-quality）完整指南，支持 5 种宽高比、1K/2K 双档分辨率、单次最多 10 张、真参考图编辑，按次计费 $0.02 / $0.045 一张，不区分分辨率，出 2K 约合官网 6.4 折。

## 概述

**Grok Imagine 2** 是 xAI **最新发布的第二代**图像生成模型，相比初代在参数可控性与编辑能力上是整代升级：宽高比与分辨率参数真实生效、2K 档可用、单次最多出 10 张、参考图编辑能真正保留原图特征。

API易 提供 `grok-imagine-image`（标准）与 `grok-imagine-image-quality`（高质量）两个型号，共用同一套接口与参数，区别只在画质档位与价格。

<Note>
  **核心亮点**：按次固定计费且**不区分分辨率**（官网 quality 版 2K 收 \$0.07，我们统一 \$0.045，**出 2K 约合 6.4 折**），5 种宽高比 × 2 档分辨率参数**真实生效**，单次最多出 10 张，参考图编辑保真度高（画风、构图、配色、主体身份都能保留）。1K 出图约 9 秒。
</Note>

<Info>
  **模型 ID 里不带 `2`**。产品代号叫 Grok Imagine 2，但调用时的模型名是 **`grok-imagine-image`** 和 **`grok-imagine-image-quality`**——不要写成 `grok-imagine-2-image`，那样会因模型不存在而返回 503。
</Info>

<Warning>
  **📌 上手前必看的一条**：**参考图只能传给编辑接口 `/v1/images/edits`，不能传给文生图接口。**

  给 `/v1/images/generations` 传 `image` / `image_url` / `images` 会返回 **200 并正常出图**，但参考图被**静默丢弃**、且照常计费——没有任何错误提示。详见下方 [端点一览](#端点一览)。
</Warning>

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。请为本模型设置足够大的 timeout，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

<CardGroup cols={2}>
  <Card title="文生图 API" icon="wand-sparkles" href="/api-capabilities/grok-imagine-image/text-to-image">
    输入文本提示词生成图片，带交互式 Playground 在线调试。
  </Card>

  <Card title="图片编辑 API" icon="image" href="/api-capabilities/grok-imagine-image/image-edit">
    上传参考图 + 编辑指令生成新图，支持 1–4 张多图融合，带 Playground。
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——超时、URL 结果要立即转存、**参考图发错端点会静默丢弃还照样计费**、以及 `size` 不生效这几个高频坑已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 Grok Imagine 2 的文生图与图片编辑。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查 Grok Imagine 2 的「文生图 + 图片编辑」。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/grok-imagine-image/overview.md](https://docs.apiyi.com/api-capabilities/grok-imagine-image/overview.md) 拿到本页纯文本版；需要更细的参数说明时，text-to-image 和 image-edit 两页同样在地址后加 `.md` 即可。

  接入要求：

  1. 模型名：普通档是 `grok-imagine-image`，高画质档是 `grok-imagine-image-quality`。**注意模型 ID 里不带数字 2**——写成 `grok-imagine-2-image` 会因为模型不存在返回 503。

  2. 超时：客户端 timeout 提到 360 秒兜底。虽然实测 1K 约 9 秒、2K 约 15 秒，但按 60 秒配会产生大量误超时，而这些请求仍然计费。图片接口是同步调用，没有任务 ID，客户端一断连结果就丢了。反向代理、网关、Serverless 执行上限这些中间层也要一起放宽。

  3. 端点选择（**本模型最容易踩的一条**）：文生图打 `/v1/images/generations`（JSON）；**任何带参考图的请求都必须打 `/v1/images/edits`，而且必须是 `multipart/form-data`**。两个方向都有坑：把参考图塞进 `/v1/images/generations`，接口会**返回 200、静默丢弃参考图、当成纯文生图出一张不相干的图，并且照常计费**；反过来给 `/v1/images/edits` 发 JSON 则固定返回 400。文件字段名必须是 `image` 或 `image[]`，写成 `images` 或 `image_file` 会返回 415。编辑端点最多 1 到 4 张参考图，传 5 张返回 400。

  4. 返回处理：默认返回 `url`，也可以传 `response_format: "b64_json"` 拿纯 base64（不带 `data:` 前缀）；同一条 `data[]` 里只会有其中一个。走 URL 的话请在服务端立即下载转存到自己的对象存储。另外注意本模型**不返回 `revised_prompt`**，`created` 恒为 0，`usage` 是占位值（`prompt_tokens` 永远是 1000 乘以 n），**不能拿来对账**，费用请以控制台账单为准。

  5. 尺寸参数：用 `aspect_ratio`（`1:1` / `16:9` / `9:16` / `4:3` / `3:4`，默认 `1:1`）加 `resolution`（`1k` / `2k`，**小写**，默认 `1k`）。**不要传 `size`**——它会被静默忽略，结果是你以为设了 1536×1024、实际拿到一张 1024×1024 的方图。同理 `quality` / `style` 也会被静默忽略，要高画质请换 `-quality` 那个模型名，而不是传参数。传超出枚举的 `aspect_ratio` 或 `resolution` 会静默回落到默认值；特别地 `resolution: "4k"` 会返回 503，那是参数错误不是服务故障。还有一点：**在编辑端点上 `resolution` 和 `aspect_ratio` 都不起作用**，输出画幅固定跟随第一张参考图的尺寸。

  6. 上传压缩：上传前先压缩参考图——超过 1.5MB 才处理，长边等比缩到 2048px 以内（不放大小图），以质量 0.9 重编码、保持原格式；多图时合计控制在 6MB 以内。某张图压缩失败就回退用原图继续，不要因为压缩失败中断整个请求。

  7. 错误处理：`400 invalid_request` 同时覆盖「参数写错」和「内容审核拦截」两种情况，从响应体里区分不出来，排查时两个方向都要看。`n` 取值 1 到 10，传 0 会被当成 1，传 11 及以上返回 400。`seed` 虽然接受但不生效，结果不可复现。本模型不支持 `mask`。

  8. Key 从环境变量 `APIYI_API_KEY` 读，base\_url 用 [https://api.apiyi.com/v1，不要硬编码进代码、也不要提交进](https://api.apiyi.com/v1，不要硬编码进代码、也不要提交进) git。

  9. 改完真跑一次文生图 + 一次图片编辑，把出图结果和这两次调用的花费贴给我。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求            | 挡掉的坑                                                                                                         |
  | ------------- | ------------------------------------------------------------------------------------------------------------ |
  | 参考图只发编辑端点     | 发到 `/v1/images/generations` 会返回 200、静默丢弃参考图、照样计费——最贵的一个坑，因为它不报错                                              |
  | 不传 `size`     | `size` 被静默忽略，你以为设了尺寸，拿到的却是一张 1024×1024 方图                                                                    |
  | 模型 ID 不带数字 2  | 写成 `grok-imagine-2-image` 会返回 503，看起来像服务故障其实是名字错了                                                            |
  | 高画质换模型不是传参    | 本模型没有 `quality` 参数，传了会被静默忽略                                                                                  |
  | 不拿 `usage` 对账 | `usage` 是占位值，`prompt_tokens` 恒为 1000 乘以 n，费用请以控制台账单为准                                                        |
  | 超时仍设 360 秒    | 出图只要十几秒容易让人把超时压得很小，高峰时就会误超时，而**断连的请求照常计费**。详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices) |
</Accordion>

## 为什么选 API易 的 Grok Imagine 2

<CardGroup cols={2}>
  <Card title="OpenAI 兼容格式" icon="shield-check">
    走标准 `/v1/images/generations` 与 `/v1/images/edits`，请求体与响应字段与 OpenAI Images API 一致，可直接用 OpenAI SDK 调用，迁移零改造。
  </Card>

  <Card title="不限并发 · 企业可放量" icon="infinity">
    没有 RPM/RPD 硬限制，**实测 100 RPM 无压力**，渠道资源充足，批量出图可线性放大，无需申请配额或自建限流。
  </Card>

  <Card title="按次计费 · 成本可预测" icon="percent">
    固定单价、**不区分分辨率**：官网 quality 版 1K \$0.05 / 2K \$0.07，我们两档统一 \$0.045，**出 2K 约合官网 6.4 折**。预算可精确到张，叠加 [充值加赠活动](/faq/recharge-promotions) 更低。
  </Card>

  <Card title="全球零门槛接入" icon="globe">
    **无需海外服务器或代理**，国内机房、家宽网络、海外节点均可直连 `api.apiyi.com`，免去出海改造。
  </Card>

  <Card title="模型生态齐全" icon="layers">
    图像侧还有 [Nano Banana 2](/api-capabilities/nano-banana-2-image/overview)、[GPT-Image-2](/api-capabilities/gpt-image-2/overview)、[Seedream](/api-capabilities/seedream-image/overview)、[FLUX](/api-capabilities/flux/overview) 可按场景组合；文本侧有 [Grok 系列](/api-capabilities/grok/overview)。
  </Card>

  <Card title="专业服务 · 企业陪跑" icon="handshake">
    团队深耕图像生成场景，具备丰富的选型、调优与集成经验，可为企业客户提供从 PoC 到生产上线的完整技术支持。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="双档分辨率" icon="expand">
    `1k` 约 1 兆像素、`2k` 约 4.2–4.5 兆像素（16:9 达 2816×1584），**两档同价，出 2K 更划算**
  </Card>

  <Card title="5 种宽高比" icon="maximize">
    `1:1` / `16:9` / `9:16` / `4:3` / `3:4`，实测像素与请求值精确吻合
  </Card>

  <Card title="单次最多 10 张" icon="images">
    `n` 支持 1–10，一次请求返回多张，适合批量选图
  </Card>

  <Card title="出图快" icon="zap">
    1K 约 9 秒、2K 约 15–17 秒；并发下延迟稳定，100 RPM 无压力
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="真参考图编辑" icon="wand">
    改指定部分、其余逐像素保留——画风、构图、配色、主体身份都不走样
  </Card>

  <Card title="多图融合" icon="layers-2">
    编辑接口支持 1–4 张参考图，实测每多一张就多一个主体；第一张决定输出画幅
  </Card>

  <Card title="双返回格式" icon="braces">
    `url` 直链或 `b64_json` 纯 base64，两个端点都支持
  </Card>

  <Card title="OpenAI SDK 直连" icon="plug">
    `client.images.generate()` / `client.images.edit()` 直接可用，无需自己拼 HTTP
  </Card>
</CardGroup>

## 模型定价

| 模型                               | 分辨率         | API易定价          | xAI 官网 | 折扣          |
| -------------------------------- | ----------- | --------------- | ------ | ----------- |
| **`grok-imagine-image`**         | `1k` / `2k` | **\$0.02 / 张**  | \$0.02 | 持平          |
| **`grok-imagine-image-quality`** | `1k`        | **\$0.045 / 张** | \$0.05 | **9 折**     |
| **`grok-imagine-image-quality`** | `2k`        | **\$0.045 / 张** | \$0.07 | **约 6.4 折** |

<Info>
  **计费说明**

  * **我们不区分分辨率，官方区分**。xAI 官网的 quality 版 1K 收 \$0.05、2K 收 \$0.07，API易 两档统一 **\$0.045**——所以**分辨率越高越划算**，出 2K 相当于官网 **6.4 折**。
  * **按张计费**：`n=4` 即按 4 张计费，与提示词长度无关。
  * **编辑与文生图同价**：走 `/v1/images/edits` 不额外收费。
  * **响应体里的 `usage` 不能用来核账**：`prompt_tokens` 恒为 `1000 × n`，是占位值，真实扣费以控制台账单为准。
</Info>

### 叠加充值加赠后的实际成本

上面的折扣还能**叠加 [充值阶梯加赠](/faq/recharge-promotions)**（加赠按**单次充值金额**计算）。以 quality 版出 2K 为例：

| 充值档位               | 到账倍数   | 单张实付         | 相当于官网 \$0.07 |
| ------------------ | ------ | ------------ | ------------ |
| 不参与活动（挂牌价）         | 1.0 倍  | \$0.045      | **6.4 折**    |
| 单次充 \$100（送 10%）   | 1.1 倍  | ≈ \$0.041    | **约 5.8 折**  |
| 单次充 \$1,000（送 15%） | 1.15 倍 | ≈ \$0.039    | **约 5.6 折**  |
| 单次充 \$3,000（送 20%） | 1.2 倍  | **\$0.0375** | **约 5.4 折**  |

<Tip>
  **常规情况下（充 \$100 档）出 2K 约合官网 5.8 折，加赠拉满可到约 5.4 折。** 标准版 `grok-imagine-image` 同样可叠加加赠，\$0.02 挂牌价在 20% 加赠下实付约 \$0.0167/张。
</Tip>

## 分组介绍

Grok Imagine 2 在 **`Default` 默认分组（1.0x 倍率）**，与上方定价表一致，**无需切换分组**即可调用。

**令牌「计费模式」推荐**：选 `按量优先`（Pay-as-you-go Priority）—— 本系列是按次计费模型，按量优先与按次计费都能正常路由，选按量优先可以让同一把令牌兼容站内其它按 token 计费的模型。

<Tip>
  如果你的令牌还覆盖其它图像模型，保持主分组 `Default` 即可，本系列不需要任何专属分组或额外配置。
</Tip>

## 技术规格

| 项目                  | 规格                                                |
| ------------------- | ------------------------------------------------- |
| 模型 ID               | `grok-imagine-image`、`grok-imagine-image-quality` |
| 宽高比                 | 5 种：`1:1` / `16:9` / `9:16` / `4:3` / `3:4`       |
| 分辨率档位               | `1k`（约 0.9–1.05 MP）、`2k`（约 4.2–4.5 MP）            |
| 输出格式                | **1K 为 JPEG（约 220–300 KB）、2K 为 PNG（约 5–6 MB）**    |
| 单次张数                | `n` 1–10                                          |
| 参考图                 | 编辑接口 **1–4 张**（`image[]` 重复传入，传 5 张返回 400）        |
| mask 局部重绘           | ❌ 不支持                                             |
| `seed` 可复现          | ❌ 不支持，结果不可复现                                      |
| `revised_prompt` 回显 | ❌ 不返回                                             |
| 出图耗时                | 1K 约 9 秒、2K 约 15–17 秒                             |
| 并发 / 速率             | 不限并发，**实测 100 RPM 无压力**                           |
| 建议客户端超时             | ≥ 360 秒                                           |

## 端点一览

| 功能    | 方法     | 路径                       | Content-Type              |
| ----- | ------ | ------------------------ | ------------------------- |
| 文生图   | `POST` | `/v1/images/generations` | `application/json`        |
| 图片编辑  | `POST` | `/v1/images/edits`       | **`multipart/form-data`** |
| 对话式出图 | `POST` | `/v1/chat/completions`   | `application/json`        |

<Warning>
  **✅ 编辑接口必须用 `multipart/form-data` 文件上传**

  发送 JSON 到 `/v1/images/edits` 会**固定返回 400**：

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  这条对**照着上游厂商文档接入的客户尤其重要**——上游文档写的是 JSON + 公网图片 URL 的形式，但在 API易 网关上走不通，**请以本站文档为准**：用 `-F "image=@photo.jpg"` 上传文件。完整示例见 [图片编辑 API](/api-capabilities/grok-imagine-image/image-edit)。

  文件字段名只能是 `image` 或 `image[]`，写成 `images` / `image_file` 会返回 415。
</Warning>

<Warning>
  **⚠️ 参考图不要传给文生图接口**

  `/v1/images/generations` 收到 `image` / `image_url` / `images` 时**不会报错**，而是返回 200 并按提示词重新生成一张全新的图，参考图被完全忽略，**并且照常计费**。

  由于没有任何错误信号，这类问题往往要到发现"出的图和输入图毫无关系"时才被察觉。**只要涉及参考图，一律走 `/v1/images/edits`。**
</Warning>

<Tip>
  主域名 `https://api.apiyi.com`，备用域名 `https://vip.apiyi.com`。对话式出图（`/v1/chat/completions`）可用但**不主推**，详见下方常见问题。
</Tip>

## 从 GPT-Image-2 迁移

如果你已经接入了 [GPT-Image-2](/api-capabilities/gpt-image-2/overview)，**端点和调用方式完全一样**（`/v1/images/generations` + `/v1/images/edits`，OpenAI SDK 直连），但**参数体系是另一套**，直接换模型名跑不通。下面是必须改的地方。

### 参数对照

| 维度        | GPT-Image-2                                          | **Grok Imagine 2**            | 迁移动作                          |
| --------- | ---------------------------------------------------- | ----------------------------- | ----------------------------- |
| 输出尺寸      | `size`（`1536x1024` 等具体像素）                            | `aspect_ratio` + `resolution` | **必须改写**，且 `size` 传了不报错       |
| 画质档位      | `quality`（`low`/`medium`/`high`/`auto`）              | 无此参数，**用模型名区分**               | 删掉 `quality`，改选 `-quality` 型号 |
| 输出格式      | `output_format`（png/jpeg/webp）+ `output_compression` | 无此参数，**格式由分辨率决定**             | 删掉；1K 固定 JPEG、2K 固定 PNG       |
| 背景        | `background`（`opaque`/`auto`）                        | 无此参数                          | 删掉                            |
| 审核强度      | `moderation`（`auto`/`low`）                           | 无此参数                          | 删掉                            |
| 高保真       | 禁传 `input_fidelity`                                  | 无此参数                          | 删掉                            |
| 单次张数      | `n` **仅支持 1**                                        | `n` **支持 1–10**               | ✅ 可以去掉客户端的并发出图循环              |
| 编辑参考图上限   | 16 张                                                 | **4 张**                       | ⚠️ 超过 4 张要改逻辑                 |
| mask 局部重绘 | ✅ 支持                                                 | ❌ **不支持**                     | ⚠️ 依赖 mask 的流程无法迁移            |
| 计费        | 按 token（high 档约 \$0.21/张）                            | **按次固定** \$0.02 / \$0.045     | 预算模型从"按量"变"按张"                |

### 三个最容易踩的坑

<Warning>
  **1. 响应格式默认值是反的 —— 这条最容易漏**

  GPT-Image-2 **只返回 `b64_json`**（没有 `url`），而 Grok Imagine 2 **默认返回 `url`**。如果你的解析代码写的是 `resp.data[0].b64_json`，迁移后会拿到 `None` / `undefined`。

  两个解法，二选一：

  * **保持原代码不动** → 显式传 `"response_format": "b64_json"`
  * **改用直链** → 读 `data[0].url` 再下载

  另外 GPT-Image-2 的 `usage` 是**真实 token 数**，Grok Imagine 2 的 `usage` 是**占位值**（恒为 `1000 × n`）——如果你有基于 `usage` 做成本统计的脚本，迁移后会算出错误的数字。
</Warning>

<Warning>
  **2. `size` 传了不会报错，只会静默失效**

  GPT-Image-2 的参数校验是严格的，传错通常直接 400。**Grok Imagine 2 的校验很宽松**：`size`、`quality`、`style` 这些 OpenAI 习惯字段传进来一律**静默忽略**，非法的 `aspect_ratio` / `resolution` 也会**静默回退默认值**。

  也就是说，如果你只把 `model` 改了、`size: "1536x1024"` 忘了删，请求会**返回 200 并出一张 1024×1024 的方图**——没有任何报错提示你参数没生效。

  迁移后请**先用一次调用核对输出像素**，确认 `aspect_ratio` / `resolution` 真的生效了。
</Warning>

<Warning>
  **3. 参考图不能再传给文生图接口**

  这是本模型独有的坑：给 `/v1/images/generations` 传参考图会 **200 出图但静默丢弃参考图并照常计费**。任何涉及参考图的调用都必须走 `/v1/images/edits`（`multipart/form-data`），详见上方 [端点一览](#端点一览)。
</Warning>

### 迁移前后代码对照

```python theme={null}
# 迁移前：GPT-Image-2
resp = client.images.generate(
    model="gpt-image-2",
    prompt="赛博朋克城市雨夜",
    size="1536x1024",           # ← 删掉
    quality="high",             # ← 删掉
    output_format="jpeg"        # ← 删掉
)
img = base64.b64decode(resp.data[0].b64_json)

# 迁移后：Grok Imagine 2
resp = client.images.generate(
    model="grok-imagine-image",           # 高画质用 grok-imagine-image-quality
    prompt="赛博朋克城市雨夜",
    n=1,
    extra_body={
        "aspect_ratio": "16:9",           # ← 取代 size
        "resolution": "1k",               # ← 取代 quality 的尺寸含义
        "response_format": "b64_json"     # ← 显式指定，保持解析代码不变
    }
)
img = base64.b64decode(resp.data[0].b64_json)
```

<Tip>
  **该选哪个？** 需要 mask 局部重绘、精确到像素的自定义尺寸、或 16 张参考图融合 → 继续用 [GPT-Image-2](/api-capabilities/gpt-image-2/overview)。想要**成本可预测**（按张固定价、2K 不加价）、**单次多图**（`n` 最多 10）、或**编辑时高度保留原图** → 用 Grok Imagine 2。两者共存不冲突，同一把令牌都能调。
</Tip>

## 关键参数详解

### `aspect_ratio` 与 `resolution`（输出尺寸）

两个参数组合决定实际输出像素。下表为实测值，与请求值精确吻合：

| `aspect_ratio` | `resolution: 1k` | `resolution: 2k` |
| -------------- | ---------------- | ---------------- |
| `1:1`          | 1024×1024        | 2048×2048        |
| `16:9`         | 1280×720         | 2816×1584        |
| `9:16`         | 720×1280         | 1584×2816        |
| `4:3`          | 1152×864         | 2368×1776        |
| `3:4`          | 864×1152         | 1776×2368        |

<Warning>
  **这两个参数只在文生图接口生效。** 在编辑接口 `/v1/images/edits` 上传入不会报错，但也**不起作用**——编辑结果的画幅**跟随第一张参考图**（输入 1280×720 就输出 1280×720；多图融合时把顺序颠倒，画幅会跟着新的第一张变）。需要改变画幅请先自行裁剪参考图。
</Warning>

<Info>
  **参数校验很宽松，写错不会报错**：传入枚举外的 `aspect_ratio`（如 `5:7`、`21:9`）或 `resolution`（如 `1K`、`1024x1024`）都会**静默回退默认值**并正常出图。`response_format` 传非法值同样静默回退为 `url`。所以拿到的图不符合预期时，**先检查参数拼写**。

  唯一的例外是 `resolution: "4k"` —— 它会返回 `503 model_service_unavailable`，这是**该档位不支持**，不是渠道故障，改回 `1k` / `2k` 即可。
</Info>

### `n`（单次出图数量）

取值 **1–10**，返回的 `data` 数组长度等于 `n`，按张计费。传 `0` 会静默按 `1` 处理；传 `11` 及以上返回 400。

## 最佳实践

<Steps>
  <Step title="先明确是「生成」还是「编辑」">
    没有参考图 → `/v1/images/generations`；有参考图（哪怕只是想微调一处）→ `/v1/images/edits`。选错端点不会报错，只会拿到不符预期的图。
  </Step>

  <Step title="客户端超时设到 360 秒">
    图片 API 是同步调用，2K 出图约 15–17 秒，高峰或冷启动时可能更久。按 60 秒配置会产生大量误超时，而请求实际仍在计费。
  </Step>

  <Step title="用 aspect_ratio 控制构图，不要写进提示词">
    参数是真实生效的，直接传 `aspect_ratio: "16:9"` 比在提示词里写「横版构图」可靠得多。
  </Step>

  <Step title="按带宽选择分辨率档">
    2K 是 PNG 无损、单张 5–6 MB，1K 是 JPEG、单张 220–300 KB，相差约 20 倍。移动端或需要批量回传的场景优先 1K——反正两档同价（出 2K 反而更划算），选择只取决于画质与带宽的权衡。
  </Step>

  <Step title="编辑时明确写「其余保持不变」">
    编辑指令建议写成「把围巾改成红色，其余部分完全保持不变」这种形式，模型对这类约束遵循度很好，能最大限度保留原图。
  </Step>

  <Step title="多图融合时在提示词里显式指代">
    `image[]` 的上传顺序就是「图1 / 图2 / 图3」，在提示词里写明「把图1的主体放进图2的场景」，比让模型自己猜要稳。
  </Step>

  <Step title="不要依赖 seed 做复现">
    本系列不支持 `seed`，同一提示词两次调用结果不同。需要固定素材请把出图结果存下来，而不是指望重跑复现。
  </Step>

  <Step title="批量出图直接并发">
    没有并发限制，**实测 100 RPM 无压力**，渠道资源充足。不需要自建队列串行化，也不用额外申请配额。
  </Step>
</Steps>

## 错误码与重试

| HTTP  | code                        | 含义                          | 处理建议                               |
| ----- | --------------------------- | --------------------------- | ---------------------------------- |
| `400` | `invalid_image_request`     | 编辑接口收到了 JSON 而非 multipart   | 改用 `multipart/form-data` 文件上传，不要重试 |
| `400` | `invalid_request`           | 参数非法**或**提示词被内容审核拦截         | 两者同码，先自查参数；参数无误则调整提示词              |
| `415` | —                           | 编辑接口的文件字段名不受支持              | 字段名改为 `image` 或 `image[]`          |
| `429` | —                           | 频率超限或额度不足                   | 指数退避重试，并检查账户余额                     |
| `503` | `model_service_unavailable` | 参数档位不支持（如 `resolution: 4k`） | **不是渠道故障**，改回 `1k` / `2k`，不要重试     |
| `503` | —                           | 当前分组无可用渠道                   | 检查令牌分组配置，见上方「分组介绍」                 |

<Info>
  **客户端建议**：`400` 与 `415` 是确定性错误，重试没有意义，应直接告警。只有 `429` 和网络层超时值得重试，建议指数退避、最多 3 次。

  注意 `400 invalid_request` 同时承载「参数错误」和「内容被审核拦截」两种语义，**错误体无法区分**。经验判据是耗时：被审核拦截通常在 5–6 秒返回，比正常出图（约 9 秒）更快，因为拦截发生在生成之前。
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么我按厂商文档发 JSON 到 /v1/images/edits 就报 400？">
    因为 **API易 网关的编辑接口只接受 `multipart/form-data`**，而上游厂商文档写的是 JSON + 公网图片 URL 的形式。这两种口径不一致，请以本站文档为准。

    正确写法是文件上传：

    ```bash theme={null}
    curl -X POST "https://api.apiyi.com/v1/images/edits" \
      -H "Authorization: Bearer sk-your-api-key" \
      -F "model=grok-imagine-image" \
      -F "prompt=把围巾改成红色，其余保持不变" \
      -F "image=@photo.jpg"
    ```

    好处是**不需要图床**——直接传本地文件即可，比公网 URL 的方式更省事。完整示例见 [图片编辑 API](/api-capabilities/grok-imagine-image/image-edit)。
  </Accordion>

  <Accordion title="我给文生图接口传了参考图，返回 200 但图完全不对？">
    这是预期行为，也是本模型**最容易踩的坑**：`/v1/images/generations` 收到 `image` / `image_url` / `images` 时会**静默忽略**它们，只按提示词重新生成，并且**照常计费**。

    因为没有任何错误信号，很容易误以为"编辑功能有问题"。**只要涉及参考图，请改用 `/v1/images/edits`。**
  </Accordion>

  <Accordion title="编辑接口传了 resolution / aspect_ratio 为什么不生效？">
    编辑接口的输出画幅**跟随输入参考图**：输入 1280×720 就输出 1280×720，输入 1024×1024 就输出 1024×1024。`resolution` 与 `aspect_ratio` 在这个端点上传了不报错也不起作用。

    需要改变输出画幅，请先自行裁剪或缩放参考图再上传。
  </Accordion>

  <Accordion title="响应里为什么没有 revised_prompt？">
    本系列**不返回** `revised_prompt`，也不返回 `respect_moderation` 等字段。`data[]` 里每项只有 `url` 或 `b64_json` **二选一**（取决于 `response_format`），不会同时出现。

    解析响应时请不要假设这些字段存在。
  </Accordion>

  <Accordion title="usage 里的 token 数能用来核对账单吗？">
    **不能。** 响应体的 `usage.prompt_tokens` 恒为 `1000 × n`，与提示词实际长度无关，是占位值。

    本系列是**按次计费**（按张固定价），真实扣费请以 API易 控制台的账单记录为准。
  </Accordion>

  <Accordion title="为什么 1K 出 JPEG、2K 出 PNG？体积差很多">
    这是上游的行为：`resolution: 1k` 返回 JPEG（约 220–300 KB），`resolution: 2k` 返回 PNG 无损（约 5–6 MB），体积相差约 20 倍。

    返回的 URL 扩展名、HTTP `Content-Type` 与实际字节格式三者是一致的，可以直接按 `Content-Type` 分支处理。

    如果你的场景对带宽敏感（移动端、批量回传），建议用 `1k`——两档同价，纯看画质与带宽取舍；反过来，追求画质时选 `2k` 不加价、相对官网折扣更深。
  </Accordion>

  <Accordion title="传 resolution: 4k 报 503，是渠道挂了吗？">
    **不是。** `4k` 不是本系列支持的档位，网关会返回 `503 model_service_unavailable`。这个错误码看起来像服务故障，但实际是参数问题，**重试无效**，改回 `1k` 或 `2k` 即可。

    支持的档位只有 `1k` 和 `2k` 两个。
  </Accordion>

  <Accordion title="为什么参数写错了不报错，只是图不对？">
    本系列的参数校验很宽松：非法的 `aspect_ratio`（如 `5:7`）、`resolution`（如 `1K`、`1024x1024`）、`response_format`（如 `base64`）都会**静默回退到默认值**并正常出图，不会返回 400。

    所以拿到的图不符合预期时，**第一步先检查参数拼写**，特别注意 `resolution` 的值是小写 `1k` / `2k`。
  </Accordion>

  <Accordion title="单次最多能出几张？">
    `n` 支持 **1–10**，返回的 `data` 数组长度等于 `n`，**按张计费**。

    传 `0` 会静默按 `1` 处理；传 `11` 及以上返回 `400 invalid_request`。
  </Accordion>

  <Accordion title="支持 seed 复现吗？">
    **不支持。** 传入 `seed` 不会报错，但也不生效——相同提示词、相同 `seed` 的两次调用会得到不同的图。

    需要复用某张图请把结果保存下来，不要指望通过重跑复现。
  </Accordion>

  <Accordion title="能用 OpenAI 官方 SDK 直接调用吗？">
    可以。两个端点都兼容 OpenAI Images API 格式，把 `base_url` 指向 `https://api.apiyi.com/v1` 即可：

    ```python theme={null}
    from openai import OpenAI
    client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

    resp = client.images.generate(
        model="grok-imagine-image",
        prompt="a red wooden boat on an alpine lake at dawn",
        extra_body={"aspect_ratio": "16:9", "resolution": "1k"}
    )
    ```

    注意 `aspect_ratio` / `resolution` 不是 OpenAI SDK 的标准字段，需要放进 `extra_body` 传递。
  </Accordion>

  <Accordion title="有并发限制吗？批量出图会不会被限流？">
    **不限制并发。** 实测 **100 RPM 无压力**，没有 429、没有排队拒绝，渠道资源充足，可以直接并发调用，不需要自建串行队列，也无需额外申请配额。

    真正要注意的是 **`timeout`**：图片 API 是同步调用，建议客户端超时设到 **360 秒**，避免请求还在正常处理就被本地超时掐断——被掐断的请求仍然会计费。
  </Accordion>

  <Accordion title="内容审核是怎样的？被拦了怎么判断？">
    本系列有内容审核。被拦截时返回 `400 invalid_request`，**与参数错误使用完全相同的错误码和提示文案**，从响应体无法区分。

    实用判据是**耗时**：审核拦截通常在 5–6 秒返回（拦截发生在生成之前），而正常出图约 9 秒。另外，审核结果具有一定随机性，个别边界内容多次重试的结果可能不一致，因此**不要根据单次结果就下判断**。

    确认参数无误后仍持续报 400，通常就是提示词触发了审核，建议调整表述。
  </Accordion>

  <Accordion title="能用 /v1/chat/completions 对话方式出图吗？">
    可以，但**不主推**。该端点会返回标准的 chat 结构，`content` 是一个 markdown 图片链接：

    ```text theme={null}
    ![image](https://apac.ossforai.com/...)
    ```

    适合 Chatbox / LobeChat 这类对话式客户端直接接入。但**程序化调用请统一使用 Images API**（`/v1/images/generations` 与 `/v1/images/edits`）——参数更完整、响应结构更稳定，也与本文档的说明一致。
  </Accordion>
</AccordionGroup>

## 相关文档

* [Grok Imagine 2 文生图 API](/api-capabilities/grok-imagine-image/text-to-image) - 带 Playground 的接口参考
* [Grok Imagine 2 图片编辑 API](/api-capabilities/grok-imagine-image/image-edit) - 参考图编辑与多图融合
* [Grok 系列模型调用指南](/api-capabilities/grok/overview) - xAI 文本模型
* [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices) - 超时、断连、压缩通用建议
* [API 使用手册](/api-manual)
* [充值加赠活动](/faq/recharge-promotions)
