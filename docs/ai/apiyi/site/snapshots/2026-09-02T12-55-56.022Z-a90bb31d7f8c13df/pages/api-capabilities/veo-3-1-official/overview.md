> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 Official 视频生成

> Google Veo 3.1 官转通道完整指南：透传 Google AI Studio 官方端点，按次计费 $0.3 / $1.2，4 / 6 / 8 秒灵活时长，支持 720p / 1080p / 4k 多档分辨率，开箱即用无需切换分组与计费模式。

## 概述

**VEO 3.1 Official** 是 API易 接入 Google Veo 3.1 系列的 **官转通道**（透传 Google AI Studio），直连 Google `veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview` 异步端点，模型 ID、响应字段、约束条件与 Google 官方完全一致。**按次计费**、**默认分组即可调用**，是目前接入门槛最低的 Veo 3.1 官方质量通道。

<Note>
  **🎬 核心亮点**：透传 Google AI Studio 官方端点 + 同步音视频原生输出 + 4 / 6 / 8 秒灵活时长 + 720p / 1080p / 4k 三档分辨率 + 按次计费 \$0.3 起 + **默认分组 + 按次计费 / 按量优先令牌即可调用**（无需切换专属分组）。**适合广告短片、电商视频素材、社交媒体内容、产品演示** 等追求官方画质 + 简单接入的生产场景。
</Note>

<Warning>
  **⚠️ 暂不返回 CDN URL，需要自行拉取 MP4 落地**：本通道目前**不输出任何可分发的公网 / CDN URL**——拿到 `status: "completed"` 后，**通过 `GET /v1/videos/{task_id}/content` 拉取 MP4 二进制流并保存到你自己的 OSS / CDN**，再分发给终端用户。前端不能直连 `/content` 端点（需鉴权头）。详见下方 [端点一览](#%E7%AB%AF%E7%82%B9%E4%B8%80%E8%A7%88) 段落。
</Warning>

<CardGroup cols={2}>
  <Card title="文生视频 API" icon="wand-sparkles" href="/api-capabilities/veo-3-1-official/text-to-video">
    `POST /v1/videos`，纯文本提示词生成视频，JSON 请求体，最简单的入口。
  </Card>

  <Card title="图生视频 API" icon="image" href="/api-capabilities/veo-3-1-official/image-to-video">
    `POST /v1/videos` + multipart 上传 `input_reference`，让静态图片动起来。
  </Card>

  <Card title="官转 vs 官逆" icon="scale" href="/api-capabilities/veo-3-1-official/vs-veo-reverse">
    与既有 [VEO 3.1（官逆）](/api-capabilities/veo/overview) 的选型对照表。
  </Card>

  <Card title="可视化接口测试" icon="flask-conical" href="https://icover.ai/zh/veo-official">
    在 iCover 可视化测试工具里直接调试本接口，无需写代码。
  </Card>

  <Card title="异步任务查询 / 下载" icon="list-checks" href="https://api.apiyi.com/task">
    在 API易后台查看已提交的视频任务、下载视频链接（API 之外的查询入口）。
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——异步轮询、**必须自己拉 MP4 落地**、超时分档、4K 的硬约束这几个高频坑已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 VEO 3.1 官转的文生视频与图生视频。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查 VEO 3.1 官转的「文生视频 + 图生视频」。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/veo-3-1-official/overview.md](https://docs.apiyi.com/api-capabilities/veo-3-1-official/overview.md) 拿到本页纯文本版；需要更细的参数说明时，text-to-video 和 image-to-video 两页同样在地址后加 `.md` 即可。

  接入要求：

  1. 走异步三步，不要写成同步等待。本通道**只支持异步**：`POST /v1/videos` 提交任务拿 `task_id` → 每 **8 到 10 秒**轮询一次 `GET /v1/videos/{task_id}` 直到 `status` 变成 `completed` → 再从 `GET /v1/videos/{task_id}/content` 下载 MP4。**没有 webhook，只能轮询**，别去找回调配置。

  2. 视频落地（**本模型最关键的一条**）：响应里**没有任何 CDN 或公网 URL**——没有 `video_url`、没有 `data.url`。视频只能从 `/content` 端点拉 MP4 二进制流，而且**必须带 `Authorization` 头**。所以前端**不能**把这个端点地址直接塞进 video 标签的 `src`，浏览器不带鉴权头会 401。正确做法是：**拿到 `completed` 后立刻在服务端下载 MP4，转存到你自己的 OSS / CDN**，再把你自家的 URL 分发给终端用户。远端视频的留存期官方没有明确，**不要长期依赖 `task_id` 去取视频**。下载 `/content` 时做 3 到 5 次重试、每次间隔 4 秒——`status` 刚翻成 `completed` 的那一瞬间偶发 400。

  3. 超时分档：POST 提交给 30 秒（multipart 上传参考图会更慢）。轮询的最长等待按分辨率分档——720p / 1080p 等 **3 分钟**，4K 等 **10 分钟**。这些都放进配置，别写死一个值。

  4. 模型与参数：模型名是 `veo-3.1-fast-generate-preview`（便宜、日常用）或 `veo-3.1-generate-preview`（标准档）。时长字段名是 **`seconds` 而不是 `duration`**，而且**必须传字符串**（`"4"` / `"6"` / `"8"`），传数字会被服务端拒绝。**写成 `duration` 不会报错、会被静默忽略并回落到 4 秒**——「我传了 8 秒却只出 4 秒」就是这么来的。**时长和分辨率是联动的**：`1080p` 和 `4k` 都**只支持 `seconds` 为 `"8"`**，传 `"4"` 或 `"6"` 会直接报错；只有 `720p` 三档时长都能用。所以如果前台让用户同时选分辨率和时长，务必做联动约束，别放出非法组合。4K 还额外要求模型用 `veo-3.1-generate-preview`、超时提到 10 分钟。注意 4K 渲染比 1080p 慢 4 到 6 倍、文件大约 10 倍，而且**按次计费与时长、分辨率都无关（4K 不加价也不省钱）**，所以默认给 1080p、把 4K 做成用户显式选择的选项。

  5. 图生视频的三条硬约束：必须用 **`multipart/form-data`**（不是 JSON）；图片字段名**只能叫 `input_reference`**，写成 `image` / `reference` / `input_image` 都不认；**只收 1 张图**，传多张只取第一张、其余静默丢弃。而且**不接受远程 URL**，只能上传文件或 Base64。格式限 `image/jpeg` / `image/png` / `image/webp`。另外本通道**没有首尾帧、也没有多参考图**能力，别照着谷歌官方文档写。multipart 模式下 `metadata.*` 要拍平成 `resolution` / `aspectRatio` / `seed` 这样的表单字段。

  6. **不要传 `generateAudio`**。Veo 3.1 原生自带音频，但这个参数传了上游会直接回 `INVALID_ARGUMENT`。要控制音效、人声、环境音，把意图写进 prompt，不要找音频开关——本通道根本没有音频字段。

  7. 计费与错误：**按模型名按次结算**，与时长、分辨率、是否传参考图都无关。异步模式下**生成失败、内容审核拦截、服务过载都不计费，只有 `status` 为 `completed` 才扣费**，所以失败重试不用担心重复扣钱。错误处理：`PUBLIC_` 前缀的错误是上游官方内容审核拦截，不计费，调整提示词后可以直接重试；`5xx` 或 `INTERNAL` 是上游瞬时错误，保持同 seed 重试 1 到 2 次；任务变成 `failed` 多半是审核或上游容量问题，同样不计费。

  8. 令牌计费模式要注意：本模型需要令牌是**按次计费**或**按量优先**，**按量计费不支持**。如果调用报错提示计费模式问题，去控制台把令牌切一下。

  9. Key 从环境变量 `APIYI_API_KEY` 读，base\_url 用 [https://api.apiyi.com/v1，不要硬编码进代码、也不要提交进](https://api.apiyi.com/v1，不要硬编码进代码、也不要提交进) git。

  10. 改完真跑一次文生视频 + 一次图生视频，把生成的视频和这两次调用的花费贴给我。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求                 | 挡掉的坑                                                                          |
  | ------------------ | ----------------------------------------------------------------------------- |
  | 立即下载 MP4 并转存       | 响应里根本没有可分发的 URL，且远端留存期未明确；把 `task_id` 当长期地址用早晚取不到                             |
  | 前端不能直连 `/content`  | 该端点要鉴权头，浏览器直接请求会 401，视频标签放上去就是黑屏                                              |
  | 轮询而不是同步等待          | 官转只有异步端点，没有 webhook，写成一次 HTTP 阻塞等结果根本跑不通                                      |
  | 时长与分辨率联动           | `1080p` 和 `4k` 都只接受 `seconds` 为 `"8"`，默认给 1080p 却配 `"4"` 会直接报错——只有 720p 三档都能用 |
  | `seconds` 是字符串不是数字 | 字段名也不是 `duration`，两处写错都会被服务端拒绝                                                |
  | 失败不计费              | 只有 `completed` 才扣费，知道这点才敢放心做自动重试                                              |
  | 令牌要按次或按量优先         | 按量计费模式调不通，报错原因不在代码里                                                           |
</Accordion>

## 为什么选 API易 的 VEO 3.1 Official

对标 Google 官方 / Vertex AI 通道，针对企业生产场景在 **接入门槛**、**稳定性**、**成本** 三方面做了深度优化：

<CardGroup cols={2}>
  <Card title="官转直连 · 模型 ID 一致" icon="shield-check">
    透传到 Google AI Studio 的 Veo 3.1 异步端点，**模型 ID（`veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview`）与官方完全一致**，请求/响应字段、约束条件一比一对齐。
  </Card>

  <Card title="开箱即用 · 无需切分组" icon="plug">
    走 `Default` 默认分组、**按次计费 或 按量优先 令牌均可调用**（按量计费暂不支持），**无需切换专属分组**。老用户现有 Key 不改配置就能直接跑，是最低接入门槛的官方质量通道。
  </Card>

  <Card title="不限并发 · 企业可放量" icon="infinity">
    账号池聚合透传，批量出片 / 短视频矩阵 / 广告生产等高并发场景下可线性扩容，**不受 Google 单账号 Tier 限制**。
  </Card>

  <Card title="按次定价 · 对比 Google 立省 60%+" icon="percent">
    `veo-3.1-fast-generate-preview` \$0.3/次、`veo-3.1-generate-preview` \$1.2/次，按次计费、4/6/8 秒 + 720p/1080p/4k 同价。**对比 Google 官方 8 秒 1080p 立省 62-68%**，叠加 [充值加赠活动](/faq/recharge-promotions) 进一步下降；失败任务不计费。
  </Card>

  <Card title="全球零门槛接入" icon="globe">
    **无需海外服务器或代理**，国内机房、家宽网络、海外节点均可直连 `api.apiyi.com`，省去为 Google AI Studio / Vertex AI 配置出海链路的麻烦。
  </Card>

  <Card title="专业服务 · 企业陪跑" icon="handshake">
    团队深耕视频生成场景，在 prompt 工程、分辨率选型、批量生产、视频后处理等场景具备丰富经验，可为企业客户提供从 PoC 到生产上线的完整技术支持。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="同步音视频原生输出" icon="volume-2">
    Veo 3.1 系列**原生输出带同步音轨的视频**（环境音、对话、配乐），无需后期单独配音。音频效果通过 prompt 描述即可。
  </Card>

  <Card title="4 / 6 / 8 秒灵活时长" icon="clock">
    `seconds` 字符串枚举 `"4"` / `"6"` / `"8"`，**按次计费、时长不影响单价**。1080p / 4k 分辨率仅支持 `"8"`。
  </Card>

  <Card title="三档分辨率分级" icon="expand">
    `720p` / `1080p` / `4k` 三档，**单价均一**。横屏（`16:9`）、竖屏（`9:16`）灵活切换。
  </Card>

  <Card title="精准指令遵循" icon="target">
    Veo 3.1 在镜头运动、物体物理、人物表情等细节上的指令遵循能力领先同档模型，支持丰富的镜头语言关键词（推/拉/摇/跟、俯/仰拍等）。
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="图生视频（input_reference）" icon="image">
    上传一张图片作为视频起始帧，让静态画面"动起来"。详见 [图生视频](/api-capabilities/veo-3-1-official/image-to-video)。
  </Card>

  <Card title="异步任务化" icon="list-check">
    提交后返回 `task_id`，轮询状态、独立下载视频，便于批量管理和断点续传。
  </Card>

  <Card title="OpenAI 兼容协议" icon="plug">
    `base_url=https://api.apiyi.com/v1` + `Bearer` 鉴权，HTTP / OpenAI SDK 底层 `client.post()` 均可调用。
  </Card>

  <Card title="失败不计费" icon="circle-check">
    异步模式下，生成失败、内容审核拦截、参数错误等情况均**不计费**，**仅 `status=completed` 的任务才扣费**。
  </Card>
</CardGroup>

## 模型定价

API易 使用 **Pay-per-request** 计费，在支持的时长和分辨率组合内统一价格，**不按时长或分辨率额外加价**。按 `ai.google.dev/gemini-api/docs/pricing` 公开价格测算，Google 官方 Veo 3.1 以秒计费；以下折扣按 **8 秒视频** 计算。

| 模型                              | API易 价格       | Google 官方 8 秒 1080p      | Google 官方 8 秒 4K         |
| ------------------------------- | ------------- | ------------------------ | ------------------------ |
| `veo-3.1-fast-generate-preview` | **\$0.3 / 次** | \$0.96<br />便宜 **68.8%** | \$2.40<br />便宜 **87.5%** |
| `veo-3.1-generate-preview`      | **\$1.2 / 次** | \$3.20<br />便宜 **62.5%** | \$4.80<br />便宜 **75.0%** |

<Info>
  **计费说明**：

  * 按 **模型名** 按次结算，与时长（4/6/8 秒）、分辨率（720p/1080p/4k）、是否传 `input_reference` 无关——选 4K 不加价
  * 异步模式下生成失败 / 内容审核拦截 / 服务过载错误**均不计费**
  * 充值加赠政策见 [充值加赠活动](/faq/recharge-promotions)，叠加后实际成本进一步下降
  * 4K 同价但渲染慢 4–6 倍、文件大 \~10 倍，**日常用 1080p 性价比更优**
  * Google 官方 4K 单价 fast \$0.30/秒、standard \$0.60/秒，8 秒约 \$2.40 / \$4.80（数据来源 `ai.google.dev/gemini-api/docs/pricing`）
</Info>

## 分组介绍

VEO 3.1 Official **在 `Default` 默认分组即可调用**（1x），**无需切换专属分组**。令牌计费模式需为 **按次计费** 或 **按量优先**——**按量计费暂不支持**（请在 [控制台](https://api.apiyi.com/token) 把令牌切到按次或按量优先）。

<Tip>
  **接入门槛低**：VEO 3.1 Official 走默认分组 + 按次或按量优先都行，无需为它单独开分组，**适合追求"现有按次令牌一行 base\_url 就接入"** 的团队。
</Tip>

| 维度   | VEO 3.1 Official         | 备注           |
| ---- | ------------------------ | ------------ |
| 分组   | `Default`（1x）            | 无需切换         |
| 计费模式 | 按次计费 ✅ / 按量优先 ✅ / 按量计费 ❌ | 按量计费不支持，必须切换 |
| 令牌要求 | 按次 或 按量优先 + Default 分组   | 不需要专属令牌      |
| 倍率   | 1.0x                     | 直接按定价表结算     |

## 技术规格

| 维度                             | `veo-3.1-fast-generate-preview`                         | `veo-3.1-generate-preview` |
| ------------------------------ | ------------------------------------------------------- | -------------------------- |
| **价格**                         | \$0.3 / 次                                               | \$1.2 / 次                  |
| **支持时长（seconds，字符串）**          | `"4"` / `"6"` / `"8"`                                   | `"4"` / `"6"` / `"8"`      |
| **支持分辨率（metadata.resolution）** | `720p` / `1080p` / `4k`                                 | `720p` / `1080p` / `4k`    |
| **支持比例（metadata.aspectRatio）** | `16:9` / `9:16`                                         | `16:9` / `9:16`            |
| **音轨**                         | ✅ 同步音视频                                                 | ✅ 同步音视频                    |
| **图生视频（input\_reference）**     | ✅（仅 1 张参考图）                                             | ✅（仅 1 张参考图）                |
| **典型生成耗时**                     | 720p 60–90s · 1080p 80–120s · 4K 5–6 分钟                 | 同                          |
| **视频留存**                       | 官方未明确，建议生成后立即下载落地                                       | 同                          |
| **响应字段**                       | `id` / `task_id` / `status` / `progress` / `created_at` | 同                          |

<Warning>
  **1080p / 4k 分辨率时 `seconds` 必须传 `"8"`**，传 `"4"` 或 `"6"` 会被上游拒绝。720p 三档时长都支持。
</Warning>

## 端点一览

| 端点                             | 方法   | 用途                        | Content-Type                               |
| ------------------------------ | ---- | ------------------------- | ------------------------------------------ |
| `/v1/videos`                   | POST | 提交视频生成任务（文生视频 / 图生视频统一端点） | `application/json` 或 `multipart/form-data` |
| `/v1/videos/{task_id}`         | GET  | 查询任务状态与进度                 | —                                          |
| `/v1/videos/{task_id}/content` | GET  | **下载已生成的视频文件（MP4 二进制）**   | —                                          |

<Warning>
  **⚠️ 仅支持 MP4 二进制流下载，暂不返回 CDN URL**

  本通道目前**不会在响应中输出任何 CDN / 公网 URL**——视频文件**只能通过 `GET /v1/videos/{task_id}/content` 拉取 MP4 二进制流**，需要带 `Authorization: Bearer` 头。

  这意味着：

  * 响应字段里**没有** `video_url` / `data.url` / 任何可直接分发的链接
  * 前端**不能**直接把端点 URL 贴到 `<video>` 标签——浏览器请求不带鉴权头会 401
  * **拿到 `status: "completed"` 后立即下载 MP4，落地到自己的 OSS / CDN**，再把你自家的 URL 分发给终端用户
  * 视频留存期官方未明确，**不要长期依赖远端 `task_id`** 拿视频
</Warning>

<Tip>
  **域名选择**：主域名 `api.apiyi.com`，也可使用 `vip.apiyi.com` / `b.apiyi.com` 等其它网关域名，响应行为一致。
</Tip>

## 关键参数详解

<Tip>
  **⚡ 完整参数速查表**：跳转到 [文生视频 - 参数说明速查](/api-capabilities/veo-3-1-official/text-to-video#%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E%E9%80%9F%E6%9F%A5) 一表看全 `model` / `prompt` / `seconds` / `size` / `metadata.*` 的类型、必填、默认值、取值约束。本节只展开**最容易踩坑的 3 个参数**。
</Tip>

### `seconds`（视频时长）

控制时长的字段名是 **`seconds`**（不是 `duration`），**必须传字符串**（`"4"` / `"6"` / `"8"`），传数字会被服务端拒绝并报：

```
parse_request_failed: cannot unmarshal number into Go struct field ... duration of type string
```

| 值     | 720p  | 1080p | 4k    |
| ----- | ----- | ----- | ----- |
| `"4"` | ✅     | ❌     | ❌     |
| `"6"` | ✅     | ❌     | ❌     |
| `"8"` | ✅（默认） | ✅（必填） | ✅（必填） |

<Warning>
  **常见踩坑：字段名写成 `duration` 会被静默忽略**。`duration` 不是本通道识别的字段 → 被丢弃 → 时长回落到默认 **4 秒**：

  * 720p 等允许 4 秒的分辨率：**不报错，但只出 4 秒**（"传了 8s 却只出 4s" 就是这么来的）
  * 1080p / 4k：因 4 秒非法直接报错 `Resolution 1080p requires duration seconds to be 8 seconds, but got 4`

  **正确写法：请求字段用 `seconds`，值 `"8"`（字符串）。**
</Warning>

参数识别优先级：`metadata.durationSeconds > seconds > 8`

### `metadata.resolution`（分辨率）

| 值          | 像素（横）       | 像素（竖）       | 备注                              |
| ---------- | ----------- | ----------- | ------------------------------- |
| `720p`（默认） | `1280x720`  | `720x1280`  | 三档时长都可用                         |
| `1080p`    | `1920x1080` | `1080x1920` | **仅支持 `seconds="8"`**           |
| `4k`       | `3840x2160` | `2160x3840` | **仅支持 `seconds="8"`**，渲染慢 4–6 倍 |

参数识别优先级：`metadata.resolution > size > 720p`

### ⚠️ 不要传 `generateAudio`

Veo 3 / 3.1 **原生带音频**，但 `generateAudio` 参数**不要传**，上游会回 `INVALID_ARGUMENT`。要控制音频效果，**把意图写进 prompt**：

> "黄昏海边的灯塔，海浪声、远处海鸟叫声，低沉的风声，电影级氛围"

## 最佳实践

<Steps>
  <Step title="按需选模型">
    * **试水 / 批量预览** → `veo-3.1-fast-generate-preview`（\$0.3/次）
    * **最终交付 / 4K 高清** → `veo-3.1-generate-preview`（\$1.2/次）
    * 同 prompt + 同 seed 下两个模型各跑一次，人工挑成片
  </Step>

  <Step title="先调通 4 秒再放大时长">
    每个 prompt 先用 `seconds: "4"` 快速验证镜头方向、风格是否符合预期（耗时 60–90 秒、单价 \$0.3），定型后再放大到 8 秒或换 1080p。
  </Step>

  <Step title="走异步轮询而不是同步等待">
    官转通道**仅支持异步**：POST 提交拿 `task_id` → 每 8–10 秒轮询 `GET /v1/videos/{task_id}` 直到 `status: "completed"` → 从 `/content` 下载 MP4。**没有 webhook，只能轮询**。
  </Step>

  <Step title="客户端超时分档配置">
    * 720p / 1080p：3 分钟硬超时
    * 4K：10 分钟硬超时
    * POST 提交（multipart）：30 秒起步
  </Step>

  <Step title="完成后立即下载落地">
    生成完成后**立即下载到自己的 OSS / CDN**，不要长期依赖远端 `task_id` 拿视频。`status` 刚翻 `completed` 后调 `/content` **偶发 400**，等 4 秒重试一次即可（参考客户端已内置重试）。
  </Step>

  <Step title="音频效果写进 prompt">
    **不要传 `generateAudio` 参数**（会被 `INVALID_ARGUMENT` 拒）。要环境音 / 对白 / BGM 直接写到 prompt 里："海浪声、远处海鸟叫声、低沉的风声"。
  </Step>

  <Step title="生产侧自己限流">
    并发上限官方未明示，实测同时 10 个任务全部成功入队。**生产侧建议 in-flight ≤ 10**，对 429 / 5xx 加指数退避重试。
  </Step>
</Steps>

## 错误码与重试

| 状态码 / 现象                       | 含义                                    | 处理建议                                         |
| ------------------------------ | ------------------------------------- | -------------------------------------------- |
| `400` + `parse_request_failed` | `seconds` 传成数字了                       | 改成字符串 `"4"` / `"6"` / `"8"`                  |
| 只出 4 秒 / `... but got 4`       | 字段名写成了 `duration`（被静默忽略，回落默认 4 秒）     | 改用 `seconds`，值 `"8"`（字符串）                    |
| `INVALID_ARGUMENT`             | 传了 `generateAudio` 或 1080p/4k 配了非 8 秒 | 删掉 `generateAudio`；分辨率高档时 `seconds="8"`      |
| `401`                          | 令牌无效                                  | 检查 `Authorization: Bearer <key>` 无空格、key 未过期 |
| `429`                          | 限流 / 余额不足                             | 指数退避重试；充值后立即可用                               |
| `5xx` / `INTERNAL`             | 上游瞬时错误                                | 保持同 seed 重试 1–2 次（不计费）                       |
| `GET /content` 偶发 400          | `status` 刚翻 completed                 | 等 4 秒重试一次（建议客户端做 3–5 次重试）                    |
| 任务 `failed`                    | 视频生成失败（多为内容审核或上游容量）                   | 调整 prompt 重试；**该任务不计费**                      |

<Info>
  **建议客户端**：

  * POST 提交超时 **30 秒**（multipart 上传可能更慢）
  * GET 轮询间隔 **8–10 秒**，最长等待 720p/1080p **3 分钟**、4K **10 分钟**
  * 对 5xx 与任务 `failed` 做 **指数退避重试**（建议 1–2 次）
  * 下载 `/content` 做 3–5 次重试，每次间隔 4 秒
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="官转和官逆有什么区别？现在还能用官逆吗？">
    **官转（本页）**：透传到 Google AI Studio 官方端点，模型 ID 与 Google 官方一致（`veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview`），按次 \$0.3 / \$1.2，仅支持异步端点。

    **官逆**（既有 [VEO 3.1](/api-capabilities/veo/overview)）：通过逆向工程接入 Google Flow，模型 ID 是 `veo-3.1-fast` / `veo-3.1` / `-fl` 系列，按次 \$0.15 起，价格更便宜，同时支持 **同步流式** 与异步两种调用，且支持**首尾帧**。

    详细对比见 [官转 vs 官逆 选型表](/api-capabilities/veo-3-1-official/vs-veo-reverse)。两个通道并存，按业务需求选。
  </Accordion>

  <Accordion title="时长字段到底是 seconds 还是 duration？为什么要传字符串？">
    **请求字段名是 `seconds`**（字符串 `"4"` / `"6"` / `"8"`）。写成 `duration` 不会被识别，会被静默丢弃，时长回落到默认 4 秒——这是"传了 8s 却只出 4s"的根因。

    至于为什么必须传字符串：后端的 Go struct 把这个字段（内部名 `duration`）声明为 `string` 类型，传数字直接被解码层拒掉，报 `parse_request_failed: cannot unmarshal number into Go struct field ... duration of type string`（错误信息里出现的 `duration` 是后端内部字段名，请求里仍然要写 `seconds`）。**写代码时记得：字段名用 `seconds`、值加引号 `"4"` / `"6"` / `"8"`**。
  </Accordion>

  <Accordion title="想要带对白 / 环境音 / BGM 怎么办？generateAudio 能传吗？">
    Veo 3 / 3.1 是 **原生带音频** 的视频模型，但 `generateAudio` 这个参数 **不要传**（传了会被上游回 `INVALID_ARGUMENT`）。要控制声音，**把音频意图写进 prompt**：

    > "黄昏海边的灯塔，海浪声、远处海鸟叫声，低沉的风声，电影级氛围"
  </Accordion>

  <Accordion title="fast 和 standard 到底怎么选？fast 是更快还是更便宜？">
    * 同等参数下 **渲染时长基本相同**（实测 720p 8 秒：fast 83s、standard 78s），**fast 不是更快，而是更便宜**（\$0.3 vs \$1.2）
    * 默认用 `veo-3.1-fast-generate-preview`
    * 最终交付、对画面细腻度 / 物理一致性敏感时切 `veo-3.1-generate-preview`
    * 建议线上 AB：同 prompt + 同 seed 下两个模型各跑一次，人工挑
  </Accordion>

  <Accordion title="4K 值得用吗？什么时候用 4K？">
    **绝大多数场景不推荐**：

    * 同价格按次，听起来划算
    * 但渲染**慢 4–6 倍**（720p 80s → 4K 350s）
    * 文件大 \~10 倍（720p 4MB → 4K 40MB），带宽 / 存储成本翻倍
    * 视觉上 1080p 已经够用，大部分播放场景看不出差别

    **确实需要 4K 时**：模型用 `veo-3.1-generate-preview`、`seconds` 必须 `"8"`、客户端超时 ≥ 10 分钟、异步任务做好后台处理。
  </Accordion>

  <Accordion title="任务什么时候才算完成？要不要 webhook？">
    * 目前 **没有 webhook**，只能轮询 `GET /v1/videos/{task_id}`
    * 推荐轮询间隔：**8 秒**（实测够用，不触发限流）
    * 实测耗时：720p / 1080p 60–115 秒，4K 5–6 分钟
    * 客户端超时建议 720p/1080p 设 3 分钟，4K 设 10 分钟
  </Accordion>

  <Accordion title="GET /content 返回 400 是什么原因？">
    `status` 刚翻 `completed` 后立即调 `/v1/videos/{task_id}/content` 偶发 400，是上游 CDN 同步延迟。**等 4 秒重试一次**通常就好（参考客户端内置 3–5 次重试，间隔 4 秒）。
  </Accordion>

  <Accordion title="响应里能直接拿到视频的 CDN URL 吗？前端能直连吗？">
    **暂时不可以**。本通道目前**不返回任何 CDN / 公网 URL**——响应字段里**没有** `video_url` / `data.url` 之类的可直接分发链接。

    **唯一拿视频的方式**：拿到 `status: "completed"` 后调 `GET /v1/videos/{task_id}/content`，**返回 MP4 二进制流**（需要带 `Authorization: Bearer` 头）。

    **生产侧标准做法**：

    1. 后端任务完成后立即下载 MP4 → 推到自己的 OSS / CDN
    2. 把自家 CDN URL 分发给终端用户
    3. **前端 `<video>` 标签不要直接指向 `/content` 端点**——浏览器请求不带鉴权头会 401

    后续如官方上线 CDN URL 输出能力，本页会同步更新。
  </Accordion>

  <Accordion title="视频在远端保存多久？需要立刻下载吗？">
    官方文档**未明确给出留存期**。**强烈建议生成完成后立即下载落本地存储**，不要长期依赖远端 `task_id` 拿视频——`/content` 端点过期后会 404。
  </Accordion>

  <Accordion title="progress 字段为什么一直是 50%？">
    这个字段是粗粒度，**只在 0 / 50 / 100 三档之间跳**，不要拿来做百分比进度条。要展示进度，要么用旋转 loading，要么按"已等待秒数 / 预期秒数"自己算。
  </Accordion>

  <Accordion title="视频生成失败会扣费吗？">
    **不会**。**只对 `status=completed` 的任务计费**，`failed` / 取消 / 内容审核拦截 / 参数错误都免费。**只要任务没真正出片就不扣费**。
  </Accordion>

  <Accordion title="seed 能复现一模一样的视频吗？">
    **不能字节级复现**。实测同 prompt + 同 seed（`88888`）+ 同参数，fast 跑两次：文件大小 9.81 MB vs 9.25 MB、md5 完全不同、渲染耗时也不同。

    **但 seed 不是装饰品**：同 seed 多次结果**互相聚集**（5 次实测组内文件大小跨度仅 6%），不同 seed **系统性偏移**（组间差距 +36.8%）。所以：

    * 想要"稳定风格" → 固定 seed
    * 想要"探索变体" → 换 seed 比换 prompt 局部词更直观
    * 想要"精确重放" → 别想了，把 mp4 存下来
  </Accordion>

  <Accordion title="能传多张参考图吗？能传首尾帧吗？">
    **当前都不支持**。图生视频只能 1 张图，字段名固定 `input_reference`，且**只接受文件或 Base64，不接受远程 URL**。

    Google 官方 Veo 3.1 有多参考图 / 首尾帧 / 视频扩展能力，但本站官转通道暂未开放。**首尾帧需求请用 [VEO 3.1（官逆）](/api-capabilities/veo/overview)** 的 `-fl` 系列模型。
  </Accordion>

  <Accordion title="一次能并发多少任务？有 QPS 限制吗？">
    实测一口气提交 10 个任务全部成功入队，未触发拒绝。具体上限官方未明示，**建议生产侧自己限流（in-flight ≤ 10）**，对 429 / 5xx 加指数退避重试。
  </Accordion>

  <Accordion title="视频带水印 / 溯源信息吗？">
    * 没有可视水印
    * 但带 **Google C2PA Content Credentials** 签名（`urn:c2pa:...`，Google C2PA Media Services 颁发），藏在 MP4 元数据里。终端用户肉眼看不到，**用 C2PA 工具（如 Adobe Content Authenticity）可以验出"由 Veo 生成"**
    * 二创再分发知情即可，一般不影响播放
  </Accordion>

  <Accordion title="可以用 OpenAI 官方 SDK 直连吗？">
    部分可以。接口是 OpenAI 风格的（`Bearer` 鉴权 + `/v1/...`），但 OpenAI 官方 SDK **没有 `videos.create` 这个方法**（`/v1/videos` 是自定义路径），多半要用 OpenAI SDK 的底层 `client.post()` 或直接 HTTP 调用。**直接 HTTP 最省事**，详见 [文生视频](/api-capabilities/veo-3-1-official/text-to-video) Playground 页的代码示例。
  </Accordion>
</AccordionGroup>

## 相关文档

* [文生视频 Playground](/api-capabilities/veo-3-1-official/text-to-video) - `POST /v1/videos`（JSON）在线调试，5 段语言代码示例
* [图生视频 Playground](/api-capabilities/veo-3-1-official/image-to-video) - `POST /v1/videos`（multipart）+ `input_reference` 用法详解
* [官转 vs 官逆 选型表](/api-capabilities/veo-3-1-official/vs-veo-reverse) - 与 [VEO 3.1（官逆）](/api-capabilities/veo/overview) 的差异对照
* [充值加赠活动](/faq/recharge-promotions) - 加赠最高档位与适用渠道
* [API 使用手册](/api-manual) - 通用调用规范、超时与重试建议
* Google 官方模型页：`ai.google.dev/gemini-api/docs/models/veo-3.1-generate-preview`
* Google 官方视频生成文档：`ai.google.dev/gemini-api/docs/video`

<Info>
  VEO 3.1 Official 是 API易 透传 Google AI Studio 的稳定官转服务。模型 ID、响应字段、约束条件与 Google 官方完全一致，且**默认分组 + 按次计费 / 按量优先 令牌即可调用**——是目前接入门槛最低的官方质量通道。如有问题或建议，欢迎在控制台工单中反馈。
</Info>
