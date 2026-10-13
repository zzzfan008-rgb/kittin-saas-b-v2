> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Oxygen 视频生成

> AZ8 Oxygen（oxygen-1.0）视频生成接入指南：OpenAI Videos 兼容接口，支持文生、首帧、首尾帧、参考图/视频/音频生视频，320p–768p、4–15 秒，按秒计费 $0.02/秒。

## 概述

Oxygen 是 AZ8 提供的视频生成模型。AZ8 是新加坡的 AI 视频创作平台（前身为 Videoinu）。API易 以 `oxygen-1.0` 提供该模型，接口兼容 **OpenAI Videos**（`POST /v1/videos` 提交、`GET /v1/videos/{id}` 查询），时长 4–15 秒，清晰度 320p / 480p / 768p，**每秒 \$0.02，不区分清晰度**。

<Note>
  **核心亮点**：一个模型同时支持文生视频、首帧生视频、首尾帧生视频，以及最多 9 张参考图 + 3 段参考视频 + 3 段参考音频的参考生成；成片自带音轨；**\$0.02/秒**，5 秒视频 \$0.10、15 秒 \$0.30，失败任务自动退款。定位是走量、低成本的批量视频生成。
</Note>

<CardGroup cols={2}>
  <Card title="视频生成 API 参考" icon="video" href="/api-capabilities/oxygen/video-generation">
    提交 + 轮询 + 下载，含 Python / cURL / Node.js 示例与在线调试
  </Card>

  <Card title="充值加赠活动" icon="gift" href="/faq/recharge-promotions">
    充值加赠叠加后，实际单价更低
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码。显式传 `size`、高级参数要写进 `input_reference` 的 JSON 信封、时长只认 `seconds` 这几个高频坑已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 Oxygen（oxygen-1.0）视频生成。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查 Oxygen（oxygen-1.0）视频生成（文生视频 / 首帧 / 首尾帧 / 参考素材生视频）。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/oxygen/overview.md](https://docs.apiyi.com/api-capabilities/oxygen/overview.md) 拿到本页纯文本版；参数与代码示例在 [https://docs.apiyi.com/api-capabilities/oxygen/video-generation.md](https://docs.apiyi.com/api-capabilities/oxygen/video-generation.md) 。

  接入要求：

  1. 端点：OpenAI Videos 格式。提交 `POST https://api.apiyi.com/v1/videos`（JSON），查询 `GET https://api.apiyi.com/v1/videos/{id}`。提交立即返回 `{"id": ..., "status": "queued"}`，视频要轮询取回。

  2. 轮询与状态：每 5 秒查一次，整体给 15 分钟兜底。状态 `queued` / `in_progress` / `completed` / `failed`，**成功是 `completed`**。

  3. 视频落地：成功后用响应里的 **`video_url`** 直接下载（不需要鉴权头），**不要依赖 `/v1/videos/{id}/content`**——刚完成时它可能还返回 400。`expires_at` 之后链接会失效（约 24 小时），拿到就转存到自己的存储。

  4. 时长：顶层 `seconds` 必填，整数 4–15（字符串 `"5"` 也行），**按它计费**。

  5. 清晰度与横竖：**每次都显式传 `size`**，不传时网关会默认补 `720x1280`，出来是竖版。`1280x720` / `720x1280` = 480p，`1792x1024` / `1024x1792` = 768p。

  6. 图生视频：只给首帧时，`input_reference` 填公网 https 图片链接或 data URI，成片比例跟随首帧。

  7. 高级参数（首尾帧、参考素材、320p、1:1）：**必须写进 `input_reference` 的 JSON 字符串里**（以 `{` 开头），例如 `"input_reference": "{\"images\":[\"https://...first.png\"],\"last_image\":\"https://...last.png\"}"`。可用键：`images`、`last_image`、`reference_images`（≤9）、`reference_videos`（≤3）、`reference_audios`（≤3）、`resolution`（`320p` / `480p` / `768p`）、`aspect_ratio`（`16:9` / `9:16` / `1:1`）、`prompt`。**这些字段写在请求体顶层会被静默丢弃、不报错**；信封里不能写 `duration`（会 400）；首尾帧和参考素材不能混用。

  8. 计费与重试：每秒 0.02 美元，不分清晰度；提交时预扣，`failed` 自动全额退款，提交阶段报 400 不扣费。偶发 `upstream_error` 失败时，隔几分钟重新提交即可；400 类错误先改参数，不要重试。

  9. 令牌：`default` 或 `svip` 分组，计费模式用**按量优先**；Key 从环境变量 `APIYI_API_KEY` 读，不要硬编码或提交进 git。

  10. 改完真跑一次 4 秒、`size: "1280x720"` 的文生视频，把 `video_url` 和这次调用的花费（应为 0.08 美元）贴给我。整个流程 1–3 分钟，受限执行环境里把命令超时放到 600 秒以上或放后台。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求 | 挡掉的坑 |
  | - | - |
  | 每次显式传 `size` | 不传时网关默认补竖版尺寸，横屏需求出了竖屏视频 |
  | 高级参数写进 `input_reference` 信封 | 把 `last_image`、`reference_images`、`resolution` 写在顶层会被静默丢弃，不报错，结果尾帧不生效、参考图被忽略、清晰度不对 |
  | 时长只认 `seconds` | 信封里写 `duration` 会被拒；计费和成片时长都以 `seconds` 为准 |
  | 用 `video_url` 下载 | 状态刚变 `completed` 时调 `/content` 可能返回 400，误判成失败 |
  | 及时转存 | 链接约 24 小时后失效 |
</Accordion>

## 为什么选 API易 的 Oxygen

<CardGroup cols={2}>
  <Card title="走量价格" icon="receipt">
    \$0.02/秒，不分清晰度；4 秒 \$0.08，适合批量出片和 A/B 试稿
  </Card>

  <Card title="失败自动退款" icon="shield-check">
    任务失败全额退回，提交阶段报错不扣费，只为成功的视频付费
  </Card>

  <Card title="OpenAI Videos 兼容" icon="plug">
    沿用 `/v1/videos` 的提交、查询写法，已有 Sora 类接入代码改动很小
  </Card>

  <Card title="充值加赠可叠加" icon="gift">
    叠加 [充值加赠活动](/faq/recharge-promotions) 后实际成本更低
  </Card>

  <Card title="视频模型生态齐全" icon="clapperboard">
    同一个 Key 还能调 [Seedance 2.0 / 2.5](/api-capabilities/seedance2/overview)、[MiniMax-H3](/api-capabilities/minimax-h3/overview)、[Wan2.7](/api-capabilities/wan/overview) 等视频模型
  </Card>

  <Card title="全球零门槛接入" icon="globe">
    `api.apiyi.com` 直连，一个 API Key 即可调用，无需海外账号
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="四种生成方式" icon="layers">
    文生、首帧、首尾帧、参考图 / 视频 / 音频生视频，同一个端点
  </Card>

  <Card title="三档清晰度" icon="monitor">
    320p / 480p / 768p，价格相同，按需选择速度与画质
  </Card>

  <Card title="4–15 秒任意整数时长" icon="timer">
    按请求秒数计费，短视频不浪费
  </Card>

  <Card title="自带音轨" icon="music">
    成片 MP4 自带音频轨，无需单独配音
  </Card>
</CardGroup>

## 模型定价

| 计费项 | 价格 |
| - | - |
| 输出视频（320p / 480p / 768p 同价） | **\$0.02 / 秒** |
| 首帧、尾帧、参考图 / 视频 / 音频 | 不额外收费 |
| 示例：4 秒视频 | \$0.08 |
| 示例：15 秒视频 | \$0.30 |

<Note>模型价格可能调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。</Note>

<Info>
  **计费说明**：

  * 按请求的 `seconds` 计费，提交受理时预扣；成片实际长度会略长于请求值（4 秒约 4.5 秒），不额外收费
  * 清晰度、画幅、参考素材都不影响价格
  * 任务失败（上游失败、超时等）**自动全额退款**
  * 提交阶段返回 400 的请求不扣费；查询和下载不收费
</Info>

## 分组介绍

`oxygen-1.0` **在 `default` 默认分组即可调用**，`svip` 分组同样可用。令牌计费模式请用 **按量优先**（`Pay-as-you-go Priority`）。如果调用时报「当前分组没有可用渠道」，说明令牌分组不含本模型，或 `model` 拼写有误。

| 维度 | 要求 |
| - | - |
| 分组 | `default`（默认）或 `svip` |
| 计费模式 | 按量优先 |
| 模型名 | `oxygen-1.0`（必须带 `-1.0`） |

## 技术规格

| 项目 | 规格 |
| - | - |
| 模型 ID | `oxygen-1.0` |
| 时长 | 整数 4–15 秒（顶层 `seconds`） |
| 清晰度 | 320p / 480p（默认）/ 768p |
| 画幅 | 横 16:9、竖 9:16、方 1:1；图生视频跟随首帧比例 |
| 输出尺寸（实测） | 320p：576×320；480p：864×480 / 480×864 / 480×480；768p：1344×768 / 768×1344 / 768×768 |
| 音频 | 输出自带音轨 |
| 图片输入 | 公网 https 链接或图片 data URI |
| 参考素材 | 图片 ≤ 9、视频 ≤ 3、音频 ≤ 3（视频与音频仅支持 https 链接） |
| 输出 | MP4，通过查询响应的 `video_url` 获取，链接约 24 小时有效 |
| 生成耗时 | 通常 1–3 分钟；高峰排队时可能 5 分钟以上 |

## 端点一览

| 用途 | Method | Path |
| - | - | - |
| 创建任务 | `POST` | `/v1/videos` |
| 查询任务 | `GET` | `/v1/videos/{id}` |
| 下载成片（可选） | `GET` | `/v1/videos/{id}/content` |

<Tip>
  主域名 `https://api.apiyi.com`，备用域名 `https://b.apiyi.com`，路径相同。下载建议直接用查询响应里的 `video_url`。
</Tip>

## 生成方式详解

顶层字段只有 `model`、`prompt`、`seconds`、`size`、`input_reference` 五个会生效。首尾帧、参考素材、320p、1:1 这些**高级参数统一写进 `input_reference` 的 JSON 信封**（一段以 `{` 开头的 JSON 字符串）：

| 生成方式 | 写法 | 清晰度 / 画幅 |
| - | - | - |
| 文生视频 | 不传 `input_reference` | 由 `size` 决定 |
| 首帧生视频 | `input_reference` 填图片链接或 data URI | 清晰度由 `size` 决定，比例跟随首帧 |
| 首尾帧生视频 | 信封 `{"images":["首帧"],"last_image":"尾帧"}` | 同上 |
| 参考素材生视频 | 信封 `{"reference_images":[...],"reference_videos":[...],"reference_audios":[...]}` | 由 `size` 决定，可在信封里写 `aspect_ratio` |
| 指定 320p 或 1:1 | 信封 `{"resolution":"320p","aspect_ratio":"1:1"}`（可与上面任一种合并） | 信封优先于 `size` |

`size` 与清晰度的对应关系：

| `size` | 清晰度 | 画幅 |
| - | - | - |
| `1280x720` | 480p | 横 16:9 |
| `720x1280` | 480p | 竖 9:16 |
| `1792x1024` | 768p | 横 16:9 |
| `1024x1792` | 768p | 竖 9:16 |

信封写法示例（首尾帧）：

```json theme={null}
{
  "model": "oxygen-1.0",
  "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
  "seconds": "5",
  "size": "1280x720",
  "input_reference": "{\"images\":[\"https://your-cdn.example.com/first.png\"],\"last_image\":\"https://your-cdn.example.com/last.png\"}"
}
```

<Warning>
  * `last_image`、`reference_images`、`resolution`、`aspect_ratio` 等字段**写在请求体顶层会被静默丢弃**：不报错、照常扣费，但尾帧不生效、参考图被忽略、清晰度按 `size` 走。一定要写进 `input_reference` 信封
  * 信封里**不能写 `duration`**，时长只用顶层 `seconds`；JSON 写错、键名拼错都会返回 400（`param: input_reference`），不扣费
  * 首尾帧与参考素材**不能**混用
  * `input_reference` 必须是**字符串**：信封要先 JSON 序列化（Python 用 `json.dumps`，JS 用 `JSON.stringify`），直接传对象或数组会被拒
</Warning>

## 最佳实践

<Steps>
  <Step title="先用 4 秒试效果">
    按秒计费，先用 4 秒确认构图和风格，再出 10–15 秒正式版
  </Step>

  <Step title="每次显式写 size">
    横屏 `1280x720`、竖屏 `720x1280`；要更清晰用 `1792x1024` / `1024x1792`（768p）
  </Step>

  <Step title="首尾帧用比例相近的两张图">
    成片比例跟随首帧，尾帧比例差太多时过渡会被裁切
  </Step>

  <Step title="素材放在稳定的公网存储">
    用自己的 OSS / CDN 直链，避免防盗链或签名过期导致素材下载失败
  </Step>

  <Step title="轮询间隔 5 秒，整体 15 分钟兜底">
    通常 1–3 分钟出片，高峰期可能更久
  </Step>

  <Step title="拿到 video_url 立即转存">
    链接约 24 小时后失效，下载后存到自己的存储再分发
  </Step>
</Steps>

## 错误码与重试

| 阶段 | 表现 | 原因 | 处理 |
| - | - | - | - |
| 提交 | 400，`invalid_params`，`param: input.duration` | `seconds` 不在 4–15 | 改时长，不扣费 |
| 提交 | 400，`invalid_params`，`param: input_reference` | 信封 JSON 写错、有未知键，或写了 `duration` | 按报错修正信封，不扣费 |
| 提交 | 400，`cannot unmarshal array ... input_reference` | `input_reference` 传了数组或对象，没有序列化成字符串 | 先 `json.dumps` / `JSON.stringify` |
| 提交 | 500，`下载参考文件失败` | `input_reference` 的图片链接无法访问 | 换成可公网访问的 https 链接 |
| 提交 | 503，无可用渠道 | 令牌分组不含本模型，或模型名拼错 | 检查分组与 `oxygen-1.0` |
| 执行 | `failed`，`upstream_error` | 上游偶发失败 | 隔几分钟重新提交（失败已退款） |
| 执行 | `failed`，`upstream_timeout` | 上游排队过久，超出时限 | 稍后重新提交（失败已退款） |

<Info>
  错误信息是一段 JSON 字符串，包在响应的 `message` 字段里，例如 `{"message":"{\"error\":{\"code\":\"invalid_params\",...}}","type":"task_error"}`，解析时需要再 `json.loads` 一次。
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么我要的横屏视频出来是竖屏？">
    没传 `size`。不传时网关会默认补 `720x1280`（竖屏）。横屏请显式传 `1280x720` 或 `1792x1024`。
  </Accordion>

  <Accordion title="传了 last_image / reference_images 为什么没效果？">
    这些字段写在了请求体顶层。顶层只有 `model`、`prompt`、`seconds`、`size`、`input_reference` 会生效，其余字段会被静默丢弃。请写进 `input_reference` 的 JSON 信封，见上文「生成方式详解」。
  </Accordion>

  <Accordion title="怎么选 320p？传 resolution 不生效？">
    顶层的 `resolution` 会被丢弃。请写进信封：`"input_reference": "{\"resolution\":\"320p\"}"`。三档清晰度同价。
  </Accordion>

  <Accordion title="不同清晰度价格一样吗？">
    一样，都是 \$0.02/秒。320p 生成更快、文件更小，768p 更清晰。
  </Accordion>

  <Accordion title="状态显示 completed，但 /content 返回 400？">
    状态刚变成 `completed` 时，`/v1/videos/{id}/content` 可能还要几秒才能下载。直接用查询响应里的 `video_url` 即可。
  </Accordion>

  <Accordion title="视频地址能保存多久？">
    约 24 小时（见查询响应的 `expires_at`），请拿到后尽快下载转存。
  </Accordion>

  <Accordion title="任务失败会扣费吗？">
    不会。任务 `failed` 后自动全额退款；提交阶段返回 400 的请求不扣费。
  </Accordion>

  <Accordion title="偶尔返回 upstream_error 怎么办？">
    属于上游偶发失败，已自动退款。隔几分钟重新提交通常即可成功。
  </Accordion>

  <Accordion title="成片时长为什么比 seconds 长一点？">
    实际成片会略长（4 秒约 4.5 秒、5 秒约 5.2 秒），按请求的 `seconds` 计费，不多收。
  </Accordion>

  <Accordion title="首帧可以传 Base64 吗？">
    可以，`input_reference` 或信封里的 `images` 都支持图片 data URI（如 `data:image/jpeg;base64,...`）。参考视频和参考音频只支持 https 链接。
  </Accordion>

  <Accordion title="图生视频能指定画幅吗？">
    不能，图生视频的画幅跟随首帧图片比例，`aspect_ratio` 会被忽略。清晰度仍可通过 `size` 或信封里的 `resolution` 选择。
  </Accordion>
</AccordionGroup>

## 相关文档

* [Oxygen 视频生成 API 参考](/api-capabilities/oxygen/video-generation)
* [MiniMax-H3 视频生成](/api-capabilities/minimax-h3/overview)
* [Seedance 2.0 / 2.5 视频生成](/api-capabilities/seedance2/overview)
* [Wan2.7 视频生成](/api-capabilities/wan/overview)
* [充值加赠活动](/faq/recharge-promotions)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.