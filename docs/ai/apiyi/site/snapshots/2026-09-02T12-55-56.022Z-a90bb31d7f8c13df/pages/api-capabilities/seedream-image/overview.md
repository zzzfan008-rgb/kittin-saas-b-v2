> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream 生图/编辑

> 字节跳动 BytePlus 火山方舟 Seedream 系列图像生成模型完整指南，5.0 / 4.5 / 4.0 三版本统一接入，支持 4K 高清、多图融合、批量序列生成、参考图编辑。

## 概述

**Seedream** 是字节跳动 BytePlus 火山方舟海外版的旗舰图像生成模型系列，**统一生成-编辑架构**：文生图、单图编辑、多图融合、批量序列生成都通过同一个 `/v1/images/generations` 端点完成，仅参数不同。API易 与 BytePlus 达成官方战略合作，第一时间接入全部活跃版本。

<Note>
  **🎨 核心亮点**：三个活跃版本（5.0 / 4.5 / 4.0）统一计费 + 4K 高清出图 + 最多 10 张参考图融合 + 批处理 (输入+输出 ≤ 15 张) + 强中文文字渲染。**适合电商主图、广告海报、产品摄影、内容创作** 等需要高画质 + 文字渲染的生产场景。
</Note>

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。请为本模型设置足够大的 timeout，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

<Note>
  **资源版本说明**：API易 接入的 Seedream 走**海外 BytePlus（国际版）官方资源**，而非国内的豆包 / 火山引擎版本。国际版的内容审核策略相对国内版宽松，创作自由度更高——这是本平台的一项优势，但**不代表没有安全审核**：BytePlus 仍内置内容安全机制，违规提示词或参考图会被 400/403 拦截（拦截不计费）。请在合规前提下使用。
</Note>

<CardGroup cols={2}>
  <Card title="文生图 API" icon="wand-sparkles" href="/api-capabilities/seedream-image/text-to-image">
    `POST /v1/images/generations`，纯文本提示词生成图片，支持 1K/2K/3K/4K 与精确像素尺寸。
  </Card>

  <Card title="图片编辑 API" icon="image" href="/api-capabilities/seedream-image/image-edit">
    同端点 + `image` 参数，支持单图改图、多图融合、批量序列生成（最多 15 张）。
  </Card>

  <Card title="历史版本" icon="rotate-ccw-clock" href="/api-capabilities/seedream-image/historical-versions">
    5.0 / 4.5 / 4.0 三版本规格对比、价格差异、迁移指南。
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——超时、URL 结果要立即转存、编辑走 URL 数组而不是 multipart、以及 `seedream-5-0-pro` 的禁传参数这几个高频坑已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 Seedream 的文生图与图片编辑。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查 Seedream 的「文生图 + 图片编辑」。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/seedream-image/overview.md](https://docs.apiyi.com/api-capabilities/seedream-image/overview.md) 拿到本页纯文本版；需要更细的参数说明时，text-to-image 和 image-edit 两页同样在地址后加 `.md` 即可。

  接入要求：

  1. 超时：客户端 timeout 按型号分档——4.x 系列 60 秒起步，`seedream-5-0` 提到 120 秒，**`seedream-5-0-pro` 实测约 2 分钟出图，提到 240 秒**。图片接口是同步调用，没有任务 ID，客户端一断连结果就丢了、但这次请求照样计费。反向代理、网关、Serverless 执行上限这些中间层也要一起放宽。

  2. 返回处理：默认返回 `url`（BytePlus TOS 的临时签名链接，约 24 小时后失效），也可以传 `response_format: "b64_json"` 拿纯 base64（不带 `data:` 前缀）。走 URL 的话**必须在服务端立即下载转存到自己的对象存储**，不要把上游链接直接存进数据库当长期地址；走 base64 就要能渲染展示并提供「保存到本地」。请显式指定 `response_format`，别依赖默认值。

  3. 上传参考图（**和其它出图模型最不一样的一条**）：Seedream 是统一的生成-编辑架构，**没有 `/v1/images/edits` 端点**，生成和编辑都打 `/v1/images/generations`，`application/json`。参考图放在 `image` 字段里，它是一个 **URL 数组**——不是 multipart 文件上传，也不是重复的 `image[]` 字段。数组元素可以是图片 URL，也可以是 `data:image/jpeg;base64,...` 形式的 data URL，两种可以混用。最多 10 张参考图，且**输入图 + 输出图合计不能超过 15 张**。本模型没有 `mask` 字段。本地大图建议先传到你自己的对象存储再传 URL；如果用 data URL，上传前先压缩——超过 1.5MB 才处理，长边等比缩到 2048px 以内（不放大小图），以质量 0.9 重编码；多图时合计控制在 6MB 以内，某张图压缩失败就回退用原图继续。

  4. 参数红线：本模型**没有 `quality` 参数**，画质由型号和 `size` 决定。`size` 可以填档位（`1K` / `2K` / `3K` / `4K`，默认 `2K`）或者精确像素，注意 `seedream-5-0-pro` 总像素上限约 419 万、最大 2048×2048，**没有 3K / 4K 档**。`n` 会被**静默忽略**（仍只返回 1 张、按 1 张计费），要出多张得用 `sequential_image_generation`；`seed` 在 4.x / 5.x 上不生效。商用场景**务必显式传 `watermark: false`**，默认值随版本不同。`output_format` 只有 5.0 和 5.0-pro 支持 png，4.5 / 4.0 只出 jpeg、没有透明通道。

  5. `seedream-5-0-pro` 的两个硬红线：**不要传 `sequential_image_generation`（传任何值、包括 `"disabled"` 都会直接 400）**，也**不要传 `stream`**（同样 400）。如果你的代码是从 5.0 或 4.x 改过来的，务必把这两个字段整个删掉。

  6. Key 从环境变量 `APIYI_API_KEY` 读，base\_url 用 [https://api.apiyi.com/v1，不要硬编码进代码、也不要提交进](https://api.apiyi.com/v1，不要硬编码进代码、也不要提交进) git。用 OpenAI SDK 调用时，`image` / `sequential_image_generation` / `watermark` / `output_format` 这几个参数要放进 `extra_body` 才能传下去。

  7. 改完真跑一次文生图 + 一次图片编辑，把出图结果和这两次调用的花费贴给我。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求                     | 挡掉的坑                                                                                                                       |
  | ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
  | 编辑不走 multipart         | Seedream 没有 `/v1/images/edits`，参考图是 JSON 里的 URL 数组；按 OpenAI 习惯写 multipart 会整条路走不通                                          |
  | 立即服务端转存                | 上游链接约 24 小时失效，存进数据库当长期地址用会陆续 404                                                                                           |
  | 超时按型号分档                | `seedream-5-0-pro` 实测约 2 分钟，按 60 秒配会大量误超时，而**断连的请求照常计费**。详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices) |
  | `5-0-pro` 禁传两个字段       | `sequential_image_generation` 传 `"disabled"` 也照样 400，从其它型号改过来最容易踩                                                          |
  | 不依赖 `n`                | `n` 被静默忽略，仍只出 1 张，要多张得换 `sequential_image_generation`                                                                      |
  | 显式传 `watermark: false` | 默认值随版本不同，商用图上可能带水印                                                                                                         |
</Accordion>

## 为什么选 API易 的 Seedream

对标 BytePlus 火山方舟海外版官方通道，针对企业生产场景在 **稳定性**、**成本**、**接入体验** 三方面做了深度优化：

<CardGroup cols={2}>
  <Card title="官方战略合作 · 资源稳定" icon="shield-check">
    与 BytePlus 火山方舟达成官方合作，走授权直连链路，请求和响应行为与官方一致，**无协议绕行风险**，企业可放心走生产。
  </Card>

  <Card title="不限并发 · 企业可放量" icon="infinity">
    批量出图、多图融合、序列生成等高并发场景下，可线性扩容，不受官方账号 Tier 限制。**500 RPM 默认配额**，更高量级可申请扩容。
  </Card>

  <Card title="同价 + 充值最高 8 折" icon="percent">
    默认单价与 BytePlus 官方一致，叠加 [充值加赠活动](/faq/recharge-promotions) **最低可享 8 折**，长期使用成本显著下降。
  </Card>

  <Card title="全球零门槛接入" icon="globe">
    **无需海外服务器或代理**，国内机房、家宽网络、海外节点均可直连 `api.apiyi.com`，省去为 BytePlus `ap-southeast-1` / `eu-west-1` 配置出海链路的麻烦。
  </Card>

  <Card title="OpenAI 兼容 · 零代码改动" icon="plug">
    端点路径 `/v1/images/generations` 与 OpenAI 一致，OpenAI 官方 SDK 把 `base_url` 指过来即可调用，扩展参数（`image` / `sequential_image_generation` 等）通过 `extra_body` 透传。注意 OpenAI 的 `n` 参数上游不支持（传入被静默忽略，仍返回 1 张），多图输出请用 `sequential_image_generation`。
  </Card>

  <Card title="专业服务 · 企业陪跑" icon="handshake">
    团队深耕图像生成场景，在多图融合、文字渲染、批量素材生产等场景具备丰富经验，可为企业客户提供从 PoC 到生产上线的完整技术支持。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="4K 高保真出图" icon="expand">
    4.0 / 4.5 支持原生 4K（4096×4096），细节层次丰富，适合海报、印刷物料；5.0-lite 上限 3K，但综合体验更新。
  </Card>

  <Card title="统一生成-编辑架构" icon="wand-sparkles">
    文生图 / 单图编辑 / 多图融合 / 序列批量 都走 **同一端点同一参数集**，仅靠 `image` 与 `sequential_image_generation` 切换模式。
  </Card>

  <Card title="多图融合 · 最多 10 张参考图" icon="layers">
    `image` 字段接受 URL 数组，prompt 中可用「图1/图2」明确指代顺序，配合 `sequential_image_generation: "disabled"` 做主体一致性控制。
  </Card>

  <Card title="文字渲染突破" icon="type">
    4.5 版本对小文本渲染大幅改进，海报标题、广告文案、产品文字等场景清晰可读，业界领先。
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="批量序列生成（最多 15 张）" icon="images">
    `sequential_image_generation: "auto"` + `max_images` 一次生成成系列的连续图像，适合分镜、品牌视觉、产品系列图。
  </Card>

  <Card title="约 15 秒/张 · 速度均衡" icon="bolt">
    单图典型耗时 15 秒左右，4K + hd 档稍长。**500 RPM** 默认配额，企业批量需求可申请扩容。
  </Card>

  <Card title="灵活尺寸 · 任意比例" icon="ruler">
    支持分辨率档位（`1K`/`2K`/`3K`/`4K`）或精确像素，总像素范围 \[1280×720, 4096×4096]，宽高比 \[1/16, 16]。
  </Card>

  <Card title="OpenAI SDK 直连" icon="plug">
    `base_url=https://api.apiyi.com/v1` 即可用 OpenAI 官方 SDK 调用，扩展参数通过 `extra_body` 透传，零代码改动迁移。
  </Card>
</CardGroup>

## 模型定价

按张计费，**与 BytePlus 官方同价**，叠加充值加赠后实际成本进一步下降。

| 模型                        | API易价格       | 折扣前估算      | 状态                               |
| ------------------------- | ------------ | ---------- | -------------------------------- |
| `seedream-5-0-pro-260628` | \$0.12/次（单图） | 约 ￥0.84/次  | 🆕 专业版（约 2 分钟出图，常规场景建议 5.0-lite） |
| `seedream-5-0-260128`     | \$0.035/张    | 约 ￥0.245/张 | ✅ 当前推荐（最新）                       |
| `seedream-4-5-251128`     | \$0.04/张     | 约 ￥0.28/张  | ✅ 当前推荐                           |
| `seedream-4-0-250828`     | \$0.03/张     | 约 ￥0.21/张  | 🟡 维护中（仍可调用）                     |

<Info>
  **计费说明**：

  * 按出图张数计费，与 prompt 长度、是否走多图融合无关
  * `seedream-5-0-pro` 为**按次固定价 \$0.12**（每次输出 1 张，不支持批量序列）。官方原价按输出像素分两档（≤2.36M / >2.36M 各一价）并对第 2 张起的输入参考图另行收费；API易 简化为按次统一价，**不分档、已含输入图费用**。该模型**官方无任何折扣**，API易 按保供原则定价——计入充值加赠活动与税务等成本后基本不盈利，价格如有调整会提前公告
  * `sequential_image_generation: "auto"` 模式下按实际生成张数计费（如 `max_images: 4` 出 4 张则计 4 次）
  * 失败请求（4xx / 内容审核拦截）**不计费**
  * 官方提供 200 张免费图片测试额度（首次接入即享）
  * 充值加赠政策见 [充值加赠活动](/faq/recharge-promotions)
</Info>

## 技术规格

| 维度               | seedream-5-0-pro                                     | seedream-5-0                     | seedream-4-5          | seedream-4-0          |
| ---------------- | ---------------------------------------------------- | -------------------------------- | --------------------- | --------------------- |
| **Model ID**     | `seedream-5-0-pro-260628`                            | `seedream-5-0-260128`            | `seedream-4-5-251128` | `seedream-4-0-250828` |
| **Model ID 别名**  | —                                                    | `seedream-5-0-lite-260128`       | —                     | —                     |
| **上线日期**         | 2026-06-28 (UTC+8)                                   | 2026-01-28 (UTC+8)               | 2025-11-28 (UTC+8)    | 2025-08-28 (UTC+8)    |
| **支持分辨率档位**      | 1K / 2K + 精确 WxH（总像素 ≤ 4.19M，16:9 最长边可达 2720，约 2.7K） | 2K / 3K                          | 2K / 4K               | 1K / 2K / 4K          |
| **输出格式**         | `png` / `jpeg`                                       | `png` / `jpeg`                   | `jpeg`                | `jpeg`                |
| **Prompt 优化模式**  | standard / fast                                      | standard                         | standard              | standard / fast       |
| **文生图**          | ✅                                                    | ✅                                | ✅                     | ✅                     |
| **单图编辑**         | ✅                                                    | ✅                                | ✅                     | ✅                     |
| **多图参考融合**       | ✅（最多 10 张）                                           | ✅                                | ✅（最多 10 张）            | ✅                     |
| **批量序列生成**       | ❌（传参即 400）                                           | ✅                                | ✅                     | ✅                     |
| **流式输出**         | ❌（传参即 400）                                           | ✅                                | ✅                     | ✅                     |
| **每分钟最大出图（RPM）** | 500                                                  | 500                              | 500                   | 500                   |
| **单次输入+输出图数量**   | 输入 ≤ 10，输出 1                                         | ≤ 15                             | ≤ 15                  | ≤ 15                  |
| **典型延迟**         | 约 2 分钟                                               | 30 秒级                            | 10\~20 秒              | 10\~15 秒              |
| **响应字段**         | 同右                                                   | `data[].url` 或 `data[].b64_json` | 同                     | 同                     |

## 生成耗时对比

各版本单次请求的实测耗时（2026-07 实测，UTC+8；单位为从发起请求到拿到完整响应的墙钟时间，单次请求有正常波动）：

| 场景              | seedream-4-0 | seedream-4-5 | seedream-5-0 | seedream-5-0-pro           |
| --------------- | ------------ | ------------ | ------------ | -------------------------- |
| 文生图（1K/2K）      | 7\~11 秒      | 8\~13 秒      | 29\~34 秒     | **110\~130 秒**             |
| 文生图（高档位）        | 约 15 秒（4K）   | 约 18 秒（4K）   | 约 37 秒（3K）   | 约 134 秒（WxH 2720×1530，最大档） |
| 图生图 / 多图融合      | 约 11 秒       | 17\~21 秒     | 38\~40 秒     | **115\~132 秒**             |
| 组图（2 张，编辑+auto） | —            | 约 36 秒       | —            | —（不支持组图）                   |
| **建议客户端超时**     | ≥ 60 秒       | ≥ 60 秒       | ≥ 120 秒      | **≥ 240 秒**                |

<Warning>
  **`seedream-5-0-pro` 出图稳定在 2 分钟级**（实测 110\~132 秒，多轮无一例外），这是深度推理型出图的预期行为，不是故障。接入 pro 前请确认业务能接受该延迟：交互式场景（用户在线等图）不适合 pro，建议用 5.0-lite（30 秒级）；pro 适合离线批产、对画质与指令遵循要求极高的场景。
</Warning>

## 端点一览

| 端点                            | 用途                                                 | Content-Type       |
| ----------------------------- | -------------------------------------------------- | ------------------ |
| `POST /v1/images/generations` | 文生图 / 单图编辑 / 多图融合 / 批量序列 — 全部能力**统一入口**，靠请求体参数切换模式 | `application/json` |

<Tip>
  **域名选择**：主域名 `api.apiyi.com`，也可使用 `vip.apiyi.com` 等其它网关域名，响应行为一致。**不需要使用 BytePlus 原生的 `ark.ap-southeast.bytepluses.com` / `ark.eu-west.bytepluses.com`**——API易 网关已统一映射到 OpenAI 兼容路径。
</Tip>

## 关键参数详解

### `size`（输出尺寸）

支持两类取值，**二选一**：

**预设档位**（按分辨率自动决定宽高比）：

| 档位   | 含义              | 模型支持          |
| ---- | --------------- | ------------- |
| `1K` | 约 1024×1024     | 4.0 / 5.0-pro |
| `2K` | 约 2048×2048（默认） | 全部版本          |
| `3K` | 约 3072×3072     | 仅 5.0         |
| `4K` | 约 4096×4096     | 4.5 / 4.0     |

**精确像素**（自定义任意尺寸）：

* 总像素范围：\[1280×720, 4096×4096]
* 宽高比范围：\[1/16, 16]
* 默认值：`2048x2048`

**合法示例**：`1920x1080`（FullHD）、`3840x2160`（横版 4K）、`1080x1920`（手机壁纸）、`2560x1440`（横版 2K）
**非法示例**：`5000x5000`（超上限）、`100x1600`（比例超 1/16）

<Warning>
  超过 `4096×4096` 总像素的尺寸会直接报 400。某些极端比例（接近 1/16 或 16）可能出现画面拉伸不稳定，建议优先用预设档位或常见 16:9 / 9:16 / 1:1 比例。

  **5.0 系的精确像素范围与 4.x 不同**（下限更高、上限更低），超出时会返回 400 并在错误信息中提示合法范围。实测参考：5.0-lite 下限约 2560×1440；**5.0-pro 总像素上限 4.19M（最大 2048×2048，16:9 时最长边可达 2720×1530 ≈ 2.7K，实测可用），没有 3K/4K 预设**。
</Warning>

### `image` 与 `sequential_image_generation`（编辑 / 多图 / 批量模式开关）

`/v1/images/generations` 端点同时承担文生图与编辑/多图能力，靠 **两个参数组合** 切换模式：

| 模式     | `image` 参数              | `sequential_image_generation`                               | 说明                                                  |
| ------ | ----------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| 纯文生图   | 不传                      | 不传或 `"disabled"`                                            | 输出 1 张                                              |
| 单图编辑   | `["url1"]`              | `"disabled"`                                                | 基于 1 张参考图改图                                         |
| 多图融合   | `["url1", "url2", ...]` | `"disabled"`                                                | 最多 10 张参考图，prompt 用「图1/图2」指代                        |
| 批量序列生成 | 可选（传或不传）                | `"auto"` + `sequential_image_generation_options.max_images` | 输出 N 张连贯图像，**N ≤ max\_images** 且 **输入图 + 输出图 ≤ 15** |

<Warning>
  **`seedream-5-0-pro` 不支持 `sequential_image_generation` 参数**——传任何值（包括 `"disabled"`）都会直接返回 400。用 pro 做单图编辑 / 多图融合时**不要传**该参数，只传 `image` 即可；`stream` 同理不可传。
</Warning>

详细代码示例见 [文生图 Playground](/api-capabilities/seedream-image/text-to-image) 和 [图片编辑 Playground](/api-capabilities/seedream-image/image-edit)。

## 最佳实践

<Steps>
  <Step title="选对版本">
    * **追求最强综合体验** → `seedream-5-0-260128`（功能最全，但分辨率上限 3K）
    * **要 4K 出图 + 强文字渲染** → `seedream-4-5-251128`（4K + 文字渲染突破）
    * **要 4K + 性价比** → `seedream-4-0-250828`（最便宜的 4K）
    * **极致画质 / 复杂指令的专业场景** → `seedream-5-0-pro-260628`（\$0.12/次、约 2 分钟出图、仅 1K/2K，常规场景不建议）
  </Step>

  <Step title="尺寸优先选预设">
    `1K`/`2K`/`3K`/`4K` 档位经过官方优化，速度和质量更稳定。自定义像素留给真有比例需求的场景，注意各版本支持的档位不同。
  </Step>

  <Step title="多图融合时显式指代">
    传入 `image` 数组时，prompt 里用「把图1的人物放进图2的场景，沿用图3的色彩风格」明确顺序引用，避免模型自行猜测。
  </Step>

  <Step title="批量序列控制成本">
    `sequential_image_generation: "auto"` + `max_images: 4` 一次出 4 张，按张计费总价乘 4。先用 `max_images: 1` 验证 prompt，再放大批量。
  </Step>

  <Step title="输出格式按场景选">
    5.0 / 5.0-pro 支持 `png` 与 `jpeg`，4.5 / 4.0 仅 `jpeg`。需要透明背景或无损细节时优先 5.0 系 + png，体积敏感的场景用 jpeg。
  </Step>

  <Step title="超时配置 ≥ 60 秒">
    单图约 15 秒，但批量序列（4 张）或 4K + hd 可能 30–60 秒。**客户端超时建议 60 秒起步**，前端做进度反馈。**`seedream-5-0-pro` 实测约 2 分钟出图，超时建议 ≥ 240 秒**。
  </Step>

  <Step title="水印按需关闭">
    `watermark: false` 关闭水印（默认行为视版本而定，建议显式传）。商用素材建议显式关，避免输出带 BytePlus 标识。
  </Step>
</Steps>

## 错误码与重试

| 状态码   | 含义                                      | 处理建议                                  |
| ----- | --------------------------------------- | ------------------------------------- |
| `400` | 参数非法（size 超限、`image` 数组超 10、未支持的分辨率档位等） | 校验参数，注意各版本支持的分辨率档位差异                  |
| `401` | 令牌无效                                    | 检查 Bearer Token                       |
| `403` | 内容审核拦截                                  | 调整 prompt 或更换参考图                      |
| `429` | 限流（默认 500 RPM）/ 余额不足                    | 指数退避重试；超出 500 RPM 联系商务申请扩容            |
| `5xx` | 网关 / 后端错误                               | 重试 1–2 次                              |
| 超时    | 长尾请求                                    | 客户端超时 ≥ **60 秒**（批量序列或 4K hd 可达 1 分钟） |

<Info>
  **建议客户端**：

  * 请求超时 **60 秒** 起步（批量序列或 4K hd 可能 1 分钟）
  * 对 5xx 与超时做 **指数退避重试**（建议 2 次）
  * 记录响应头 `x-request-id` 方便排查
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="5.0 Pro / 5.0 / 4.5 / 4.0 应该选哪个？">
    | 你的需求                 | 推荐                                                    |
    | -------------------- | ----------------------------------------------------- |
    | 最新功能 + 综合体验          | `seedream-5-0-260128`                                 |
    | 4K 高清 + 强文字渲染（海报、广告） | `seedream-4-5-251128`                                 |
    | 4K 高清 + 最优性价比        | `seedream-4-0-250828`                                 |
    | 长期稳定大批量              | `seedream-4-0-250828`（已验证）                            |
    | 极致画质 / 复杂指令的专业场景     | `seedream-5-0-pro-260628`（\$0.12/次、约 2 分钟出图，非专业场景不建议） |

    详见 [历史版本对比](/api-capabilities/seedream-image/historical-versions)。
  </Accordion>

  <Accordion title="为什么图片编辑也走 generations 端点？">
    Seedream 是统一生成-编辑架构，**没有独立的 `/v1/images/edits` 端点**。和 OpenAI 的 `gpt-image-2` 不同：OpenAI 的图编辑要 `multipart/form-data` 上传文件到 `/v1/images/edits`，Seedream 则统一用 `application/json` 把图片 **URL 数组** 传到 `image` 字段。

    优点：协议统一、参数复用、容易切换模式。详见 [图片编辑 Playground](/api-capabilities/seedream-image/image-edit)。
  </Accordion>

  <Accordion title="image 字段接受 base64 吗？">
    **接受**（已实测验证）。格式必须是 data URI：`data:image/<格式>;base64,<base64编码>`，注意 `<格式>` 小写（如 `data:image/jpeg;base64,...`），URL 与 base64 也可以混在同一个数组里。本地图片体积较大时仍建议先上传到 OSS / 公网图床改传 URL，减小请求体。
  </Accordion>

  <Accordion title="多图融合最多几张？批量序列最多几张？">
    * **多图融合**（`image` 数组）：4.5 / 5.0-pro 官方明确"最多 10 张"，5.0 / 4.0 同样支持但官方未单独说明上限
    * **批量序列**（`max_images`）：受全局约束 **输入参考图 + 输出图 ≤ 15**。所以多图 + 序列同时用时要算总和。注意 **5.0-pro 不支持批量序列**（传 `sequential_image_generation` 即 400）。
  </Accordion>

  <Accordion title="返回的 b64_json 要不要自己加 data:image 前缀？">
    要看 `response_format`：

    * `response_format: "url"`（默认）→ 返回 `data[0].url`，直接 `<img src=...>` 渲染
    * `response_format: "b64_json"` → 返回 `data[0].b64_json` **纯 base64 字符串**（不含 `data:image/...;base64,` 前缀），客户端需 `base64.b64decode` 写文件，或浏览器渲染时自行拼前缀
  </Accordion>

  <Accordion title="支持流式出图吗？">
    5.0 / 4.5 / 4.0 支持，配合 `stream: true` 启用。流式特别适合长 prompt + 高分辨率场景，前端可提前渲染部分结果。**`seedream-5-0-pro` 不支持流式**——传 `stream` 参数会直接返回 400。
  </Accordion>

  <Accordion title="速率限制是多少？">
    **默认 500 张/分钟**（Max Images per Minute），各版本统一。如果业务需要更高配额，请联系商务告知预估 QPS，可申请扩容资源。
  </Accordion>

  <Accordion title="生成失败会扣费吗？">
    **不会**。BytePlus 自带内容安全审核，触发审核或参数非法时直接返回 `400`/`403` 错误并**不计费**。其它常见 0 计费错误：`401`（令牌无效）、`429`（限流）。**只有请求实际进入模型生成阶段（200 + 有效响应）才按张计费**。
  </Accordion>

  <Accordion title="可以用 OpenAI 官方 SDK 直连吗？">
    可以，零代码改动。把 `base_url` 指向 `https://api.apiyi.com/v1`，扩展参数（`image` / `sequential_image_generation` / `watermark` 等）通过 `extra_body` 透传：

    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(api_key="sk-your-key", base_url="https://api.apiyi.com/v1")
    resp = client.images.generate(
        model="seedream-5-0-260128",
        prompt="...",
        size="2K",
        extra_body={
            "image": ["https://.../ref.png"],
            "sequential_image_generation": "disabled",
            "watermark": False,
        }
    )
    ```
  </Accordion>

  <Accordion title="生成的图片版权归谁？">
    通过 API 生成的图片，用户拥有完整的使用权，可用于商业和非商业用途。具体条款详见 BytePlus 服务协议。
  </Accordion>

  <Accordion title="支持透明背景吗？">
    `seedream-5-0` / `seedream-5-0-pro` 支持 `png` 输出格式，可在 prompt 中要求"transparent background, alpha channel"得到带透明的图。`seedream-4-5` / `4-0` 仅 `jpeg` 输出，**不支持透明背景**，需自行后处理抠图。
  </Accordion>

  <Accordion title="主动取消生成任务可以吗？">
    **不支持**。`/v1/images/generations` 是同步端点，请求一旦提交会跑到结束。客户端即使断开连接，服务端仍会完整执行并照常计费。建议客户端做好超时控制，不要依赖"断连不计费"。
  </Accordion>
</AccordionGroup>

## 相关文档

* [文生图 Playground](/api-capabilities/seedream-image/text-to-image) - `POST /v1/images/generations` 在线调试，5 段语言代码示例
* [图片编辑 Playground](/api-capabilities/seedream-image/image-edit) - `image` + `sequential_image_generation` 用法详解
* [历史版本与迁移](/api-capabilities/seedream-image/historical-versions) - 5.0 / 4.5 / 4.0 规格对比、价格差异、迁移建议
* [Seedream 4.5 上线公告](/news/seedream-4-5-launch) - News 文章
* [API 使用手册](/api-manual) - 通用调用规范
* [图像生成测试工具](https://imagen.apiyi.com/) - 在线试玩
* BytePlus 官方文档：`docs.byteplus.com/en/docs/ModelArk/1824121` - Seedream 4.0-5.0 tutorial（英文）

<Info>
  Seedream 系列是 API易 与 BytePlus 火山方舟达成战略合作后推出的高品质图像生成服务。三个版本统一接入、统一计费、统一鉴权，按需切换。如有问题或建议，欢迎在控制台工单中反馈。
</Info>
