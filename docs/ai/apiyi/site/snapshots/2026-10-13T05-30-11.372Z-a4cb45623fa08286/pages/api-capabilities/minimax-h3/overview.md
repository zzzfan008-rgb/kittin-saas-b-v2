> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-H3 视频生成

> MiniMax H3（海螺 3.0）视频生成接入指南：一个端点覆盖文生、首尾帧、参考图/视频/音频生视频，原生立体声，768P、4–15 秒，按秒计费 $0.03/秒。

## 概述

MiniMax H3（海螺 3.0）是 MiniMax 于 2026-07-31 (UTC+8) 发布的全模态视频生成模型：一个模型同时理解文本、图片、视频和音频，直接输出**带立体声音轨**的视频。API易 通过开源权重自部署通道提供 `MiniMax-H3`，分辨率 768P，时长 4–15 秒，按秒计费。

<Note>
  **核心亮点**：同一个端点支持文生视频、首帧 / 尾帧 / 首尾帧生视频、最多 9 张参考图 + 3 段参考视频 + 3 段参考音频的混合参考生成；每条视频自带配乐与音效；**\$0.03/秒**（原厂官方 API 为 \$0.08/秒），10 秒视频 \$0.30，失败任务自动退款。
</Note>

<CardGroup cols={2}>
  <Card title="视频生成 API 参考" icon="video" href="/api-capabilities/minimax-h3/video-generation">
    创建任务 + 按 task\_id 查询，含 Python / cURL / Node.js 示例与在线调试
  </Card>

  <Card title="充值加赠活动" icon="gift" href="/faq/recharge-promotions">
    充值加赠叠加后，实际单价更低
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——路径要带 `/hailuo`、结果包在 `task` 里、`duration` 必须是 4 到 15 的整数这几个高频坑已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 MiniMax-H3 视频生成。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查 MiniMax-H3 视频生成（文生视频 / 首尾帧生视频 / 参考素材生视频）。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/minimax-h3/overview.md](https://docs.apiyi.com/api-capabilities/minimax-h3/overview.md) 拿到本页纯文本版；参数与代码示例在 [https://docs.apiyi.com/api-capabilities/minimax-h3/video-generation.md](https://docs.apiyi.com/api-capabilities/minimax-h3/video-generation.md) 。

  接入要求：

  1. 端点：提交 `POST https://api.apiyi.com/hailuo/v2/video_generation`，查询 `GET https://api.apiyi.com/hailuo/v2/query/video_generation/{task_id}`。**路径必须带 `/hailuo` 前缀**，不带前缀会拿到一张网页而不是 JSON。

  2. 轮询与状态：提交只返回 `{"task_id": ...}`。每 10 秒查一次，整体超时按任务类型设：不带参考视频给 30 分钟，带参考视频给 2 小时。查询结果包在 **`task`** 对象里，状态是 `queued` / `running` / `succeeded` / `failed`，**成功是 `succeeded`**。`progress` 只有 0 和 1 两个值，别拿来做进度条。

  3. 视频落地：地址在 **`task.content.url`**，下载不需要鉴权头。拿到后在服务端下载转存到自己的存储。检查地址可用性要用 GET，这个地址对 HEAD 请求会返回 403。

  4. 请求体结构与类型：`{ model, content[], resolution, duration, ratio }` 五个字段都必填。`model` 固定 `MiniMax-H3`（大小写敏感）；**`duration` 是整数**，传字符串 `"5"` 或小数会被拒；**`resolution` 只能是大写 `768P`**，`768p` 和 `2K` 都会被拒。

  5. 参数红线：`duration` 4 到 15 秒；`ratio` 取 `21:9` `16:9` `4:3` `1:1` `3:4` `9:16` `adaptive`；**纯文本和纯音频请求不能用 `adaptive`**。`content` 里必须恰好一个文本项，文本不超过 7000 字符。不要加文档没有的字段（比如 `seed`、`prompt`），会被拒。

  6. 媒体输入：图片放 `{"type":"image_url","image_url":{"url":...},"role":...}`，视频用 `video_url` + `reference_video`，音频用 `audio_url` + `reference_audio`。所有 url 必须是**公网 https 直链**，不支持 Base64 / data URI / 内网地址。首帧 / 尾帧（`first_frame` / `last_frame`）**不能**和参考素材混用；多张图片必须写 `role`。上限：参考图 9 张、参考视频 3 段（累计不超过 15 秒）、参考音频 3 段。提示词里用 `<Picture 1>` `<Video 1>` `<Audio 1>` 按同类素材顺序引用。

  7. 计费与幂等：按秒计费，每秒 0.03 美元，参考图 / 视频 / 音频不额外收费；任务 `failed` 会自动退款，提交阶段报错不扣费。**`Idempotency-Key` 请求头目前不生效，重复提交会重复计费**——业务层自己维护「业务 ID 到 task\_id」的映射，只对提交阶段的 HTTP 500 和网络错误做退避重试（5 秒 / 10 秒 / 20 秒），400 类错误先改参数不要重试。

  8. 令牌：`default` 默认分组或 `svip` 分组即可调用，计费模式用**按量优先**；报「无可用渠道」说明令牌分组不对或模型名拼错。

  9. Key 从环境变量 `APIYI_API_KEY` 读，不要硬编码进代码、也不要提交进 git。

  10. 改完真跑一次 5 秒文生视频，把视频地址和这次调用的花费贴给我。整个流程要 2 到 4 分钟，如果你在受限的执行环境里跑，把命令超时放到 600 秒以上或者放后台。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求 | 挡掉的坑 |
  | - | - |
  | 路径带 `/hailuo` | 不带前缀的 `/v2/...` 返回网页，JSON 解析直接报错，看起来像服务挂了 |
  | 结果在 `task` 里 | 在顶层找 `status` 永远拿不到，轮询会一直空转到超时 |
  | `duration` 是整数 4–15 | 字符串 / 小数被拒，报错文案还会误导成「JSON 无效」 |
  | 纯文本不能用 `adaptive` | 文生视频必须给固定比例 |
  | 幂等键不生效 | 以为带了 `Idempotency-Key` 就能放心重试，结果每次重试都是一笔新扣费 |
  | 用 GET 探活 | 视频地址对 HEAD 回 403，误判成链接失效 |
</Accordion>

## 为什么选 API易 的 MiniMax-H3

<CardGroup cols={2}>
  <Card title="完整能力开放" icon="layers">
    文生、首尾帧、参考图 / 视频 / 音频混合生成全部可用，参考素材上限与官方一致（9 图 + 3 视频 + 3 音频）
  </Card>

  <Card title="按秒计费，失败退款" icon="receipt">
    \$0.03/秒，只为成功的视频付费；任务失败自动全额退款，提交报错不扣费
  </Card>

  <Card title="充值加赠可叠加" icon="gift">
    叠加 [充值加赠活动](/faq/recharge-promotions) 后实际成本更低
  </Card>

  <Card title="全球零门槛接入" icon="globe">
    `api.apiyi.com` 直连，一个 API Key 即可调用，无需海外账号
  </Card>

  <Card title="视频模型生态齐全" icon="clapperboard">
    同一个 Key 还能调 [Seedance 2.0 / 2.5](/api-capabilities/seedance2/overview)、[Wan2.7](/api-capabilities/wan/overview)、[VEO 3.1](/api-capabilities/veo-3-1-official/overview) 等视频模型
  </Card>

  <Card title="专业服务" icon="headset">
    接入问题可联系客服，企业客户可获得接入陪跑
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="原生立体声" icon="music">
    每条视频自带配乐与音效，由提示词和参考音频驱动，无需后期配音
  </Card>

  <Card title="7 种画幅" icon="ratio">
    `21:9` 到 `9:16` 六档固定比例，另有 `adaptive` 跟随参考图比例
  </Card>

  <Card title="4–15 秒任意整数时长" icon="timer">
    按实际秒数计费，短视频不浪费
  </Card>

  <Card title="长提示词" icon="text">
    单条提示词最长 7000 字符，适合分镜式详细描述
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="首尾帧控制" icon="image">
    只给首帧、只给尾帧、或首尾帧同时给，控制起止画面
  </Card>

  <Card title="多参考图" icon="images">
    最多 9 张参考图，提示词里用 `<Picture 1>` 等标签指定角色与物体
  </Card>

  <Card title="参考视频动作迁移" icon="film">
    最多 3 段参考视频，复刻运镜与动作节奏
  </Card>

  <Card title="音频驱动" icon="audio-lines">
    最多 3 段参考音频，画面随音乐节奏或人声生成
  </Card>
</CardGroup>

## 模型定价

本通道部署的是 MiniMax 开源的 H3 权重，**不是原厂官方 API 的转发**，因此采用独立定价：

| 计费项 | API易（自部署，768P） | 原厂官方 API（768P） |
| - | - | - |
| 输出视频 | **\$0.03 / 秒** | \$0.08 / 秒 |
| 参考图片 | 不收费（最多 9 张） | 前 5 张免费，第 6 张起 \$0.04 / 张 |
| 参考视频 | 不收费 | 按输入时长 \$0.08 / 秒 |
| 参考音频 | 不收费 | 不收费 |
| 示例：10 秒文生视频 | **\$0.30** | \$0.80 |

<Note>本通道为开源权重自部署，定价独立于原厂官方 API，且可能调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。原厂价格来源：`platform.minimax.io/docs/guides/pricing-paygo`（2026-09-29 获取）。</Note>

<Info>
  **计费说明**：

  * 按请求的 `duration` 秒数计费，提交受理时预扣
  * **参考素材不额外收费**：参考图（最多 9 张）、参考视频、参考音频都不影响价格，只按时长计费
  * 任务失败（素材下载失败、格式不支持、执行失败等）**自动全额退款**
  * 提交阶段返回 4xx / 5xx 的请求不扣费；查询和下载不收费
  * 充值加赠政策见 [充值加赠活动](/faq/recharge-promotions)，叠加后实际成本更低
</Info>

## 分组介绍

MiniMax-H3 **在 `default` 默认分组即可调用**，`svip` 分组同样可用，无需切换专属分组。令牌计费模式推荐 **按量优先**（`Pay-as-you-go Priority`）。如果调用时报「当前分组没有可用渠道」，说明令牌分组不含本模型，或 `model` 拼写有误（大小写敏感）。

| 维度 | 要求 |
| - | - |
| 分组 | `default`（默认）或 `svip` |
| 计费模式 | 按量优先（推荐） |
| 模型名 | `MiniMax-H3`，大小写敏感 |

## 技术规格

| 项目 | 规格 |
| - | - |
| 模型 ID | `MiniMax-H3` |
| 分辨率 | 仅 `768P` |
| 时长 | 整数 4–15 秒（成片通常比请求值长 0.1–0.5 秒） |
| 画幅 | `21:9` 1536×672 / `16:9` 1344×768 / `4:3` 1024×768 / `1:1` 768×768 / `3:4` 768×1024 / `9:16` 768×1344 / `adaptive` |
| 音频 | 输出自带立体声音轨，无开关 |
| 提示词 | 1 个文本项，1–7000 字符 |
| 参考素材 | 图片 ≤ 9、视频 ≤ 3（累计 ≤ 15 秒）、音频 ≤ 3；媒体合计 ≤ 12 |
| 素材传入方式 | 仅公网 HTTPS 链接 |
| 输出 | MP4，通过 `task.content.url` 获取 |
| 生成耗时 | 5 秒约 3 分钟、15 秒约 13 分钟；带参考视频明显更久，见下方「生成耗时预估」 |

<Warning>
  MiniMax H3 官方模型支持 2K，但本通道**只开放 768P**，传 `2K` 会被拒绝。
</Warning>

## 生成耗时预估

MiniMax-H3 的生成耗时主要取决于两点：**输出时长**和**是否带参考视频**。下表是本通道的现状，数据来自 2026-09-29 至 2026-10-10 (UTC+8) 的 400 余个成功任务：

| 输出时长 | 不带参考视频（文生 / 图生） | 带参考视频 |
| - | - | - |
| 4–6 秒 | 约 3 分钟，多数 5 分钟内 | 约 15 分钟（12–25 分钟） |
| 7–10 秒 | 约 6 分钟，多数 11 分钟内 | 样本较少，建议按 30 分钟以上预留 |
| 11–15 秒 | 约 13 分钟，多数 20 分钟内 | 约 85 分钟（50–90 分钟） |

* **时长越长，耗时增长越快**：15 秒视频的耗时约是 5 秒视频的 5 倍，不是 3 倍
* **参考视频最耗时**：模型要逐帧解析参考视频，再和新画面一起计算，计算量成倍增加
* **客户端超时按上表设置**：不带参考视频的任务建议给 30 分钟，带参考视频的任务建议给 2 小时，避免任务还在运行就被判为失败

<Note>
  以上是本通道当前的实测水平，对时效敏感的业务可以先用 4–6 秒短视频，或用参考图代替参考视频。**速度更快、质量更高的 MiniMax 分组即将推出**，上线后会在本页和 [网站公告](/changelog) 中通知。
</Note>

## 端点一览

| 用途 | Method | Path | Content-Type |
| - | - | - | - |
| 创建任务 | `POST` | `/hailuo/v2/video_generation` | `application/json` |
| 查询任务 | `GET` | `/hailuo/v2/query/video_generation/{task_id}` | — |

<Tip>
  主域名 `https://api.apiyi.com`，备用域名 `https://b.apiyi.com`，路径相同。注意路径**以 `/hailuo` 开头**，不是 `/v1`。
</Tip>

## 生成方式详解

系统根据 `content[]` 里有什么素材自动判断生成方式：

| 生成方式 | `content[]` 组成 | `ratio` |
| - | - | - |
| 文生视频 | 仅 1 个文本项 | 必须固定比例 |
| 首帧生视频 | 文本 + 1 张 `first_frame` | 固定比例或 `adaptive` |
| 尾帧生视频 | 文本 + 1 张 `last_frame` | 固定比例或 `adaptive` |
| 首尾帧生视频 | 文本 + `first_frame` + `last_frame` | 固定比例或 `adaptive` |
| 参考素材生视频 | 文本 + `reference_image` / `reference_video` / `reference_audio` 任意组合 | 固定比例或 `adaptive`；**只有音频时必须固定比例** |

### 提示词里怎么引用参考素材

同类素材按在 `content[]` 中出现的顺序各自编号：第 1、2 张参考图是 `<Picture 1>`、`<Picture 2>`；第 1 段参考视频是 `<Video 1>`；第 1 段参考音频是 `<Audio 1>`。例如：

```text theme={null}
<Picture 1> 按照 <Video 1> 的动作起舞，节奏跟随 <Audio 1>
```

<Warning>
  * 首帧 / 尾帧**不能**与任何参考素材混用
  * 只有一张图片时可以省略 `role`（按首帧处理）；**两张及以上必须显式写 `role`**
  * 多段参考视频的**累计时长**不能超过 15 秒，否则任务会失败（自动退款）；单段超过 15 秒则只取片头 15 秒
</Warning>

## 最佳实践

<Steps>
  <Step title="先用 4–5 秒试效果">
    按秒计费，先用短时长确认构图和风格，再出 10–15 秒的正式版本
  </Step>

  <Step title="文生视频选固定比例">
    横屏 `16:9`、竖屏 `9:16`、宽银幕 `21:9`；带首帧图时用 `adaptive` 保持原图比例
  </Step>

  <Step title="素材先放到稳定的公网存储">
    用自己的 OSS / CDN 直链，避免防盗链、临时签名过期导致素材下载失败
  </Step>

  <Step title="提示词写清运镜和声音">
    描述主体、动作、镜头运动、光线，以及想要的音乐和音效，模型会一并生成
  </Step>

  <Step title="轮询间隔 10 秒">
    5 秒视频通常 3 分钟左右；客户端整体超时不带参考视频给 30 分钟、带参考视频给 2 小时（见「生成耗时预估」）
  </Step>

  <Step title="自己做幂等">
    保存「业务 ID 到 task\_id」的映射；提交超时时先查已有任务，不要直接重新提交
  </Step>

  <Step title="拿到地址立即转存">
    `task.content.url` 用 GET 下载后存到自己的存储再分发
  </Step>
</Steps>

## 错误码与重试

| 阶段 | 表现 | 原因 | 处理 |
| - | - | - | - |
| 提交 | 400，`type: invalid_request`，中文提示 | 参数不合法（时长、比例、数量、角色等） | 按提示改参数，不要重试 |
| 提交 | 400，`bad_request_error` | 上游拒绝（如 `resolution must be 768P`、不支持的字段） | 按提示改参数 |
| 提交 | 500，`Unknown Error` | 部分非法参数（多个文本项、`http://` 链接、未知字段等）或瞬时过载 | 先按「生成方式详解」核对请求体；确认无误后退避重试 |
| 提交 | 503，无可用渠道 | 令牌分组不含本模型，或 `model` 拼写错误 | 检查令牌分组与模型名 |
| 执行 | `status: failed`，`input_download_failed` | 素材链接不可下载（如 404） | 换成可公网访问的链接后重新提交 |
| 执行 | `status: failed`，`input_format_unsupported` | 素材格式不对（如图片位置放了音频） | 检查素材类型与格式 |
| 执行 | `status: failed`，`task_execution_failed` | 生成过程失败 | 稍后重新提交（失败已退款） |

<Info>
  **客户端建议**：提交请求超时设 60 秒（高峰期提交本身可能要 10 秒以上）；只对 HTTP 500 和网络错误做退避重试；所有执行阶段失败都已自动退款，重新提交会产生新的计费。
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么请求返回了一张网页而不是 JSON？">
    路径少了 `/hailuo` 前缀。正确路径是 `/hailuo/v2/video_generation` 和 `/hailuo/v2/query/video_generation/{task_id}`。
  </Accordion>

  <Accordion title="支持 2K 或 1080P 吗？">
    本通道只支持 `768P`。MiniMax 官方模型支持 2K，但本通道未开放。
  </Accordion>

  <Accordion title="时长能设 1–3 秒吗？">
    不能，`duration` 取值为 4–15 的整数。
  </Accordion>

  <Accordion title="视频有声音吗？能关掉吗？">
    每条视频都自带立体声音轨，目前没有关闭参数。不需要声音时可在后期去掉音轨。
  </Accordion>

  <Accordion title="Idempotency-Key 请求头能防止重复扣费吗？">
    目前不能。带相同 `Idempotency-Key` 重复提交仍会创建新任务并分别计费。请在业务层自行记录已提交的任务。
  </Accordion>

  <Accordion title="任务失败会扣费吗？">
    不会。任务进入 `failed` 后自动全额退款；提交阶段直接报错的请求也不扣费。
  </Accordion>

  <Accordion title="可以直接传 Base64 或本地文件吗？">
    不可以，所有素材都必须是公网 HTTPS 链接。可先上传到自己的对象存储再传链接。
  </Accordion>

  <Accordion title="adaptive 会输出什么尺寸？">
    跟随输入图片的宽高比，例如方图输出 768×768、16:9 图输出 1344×768。纯文本和纯音频请求不能用 `adaptive`。
  </Accordion>

  <Accordion title="参考视频超过 15 秒会报错吗？">
    单段超过 15 秒会自动只取片头 15 秒；但多段参考视频累计超过 15 秒时任务会失败（自动退款）。
  </Accordion>

  <Accordion title="生成要多久？">
    5 秒视频约 3 分钟，15 秒视频约 13 分钟；带参考视频的任务明显更久，15 秒约 85 分钟。完整数据见上方「生成耗时预估」。
  </Accordion>

  <Accordion title="视频地址能保存多久？">
    地址目前未见短时过期，但不承诺长期有效，请拿到后尽快下载转存。检查地址时请用 GET，HEAD 请求会返回 403。
  </Accordion>

  <Accordion title="提交时偶尔返回 500 Unknown Error 怎么办？">
    先确认请求体符合规范（只有一个文本项、没有多余字段、素材是 https 链接）；确认无误的话多为瞬时过载，退避几秒后重试即可，报错的请求不扣费。
  </Accordion>
</AccordionGroup>

## 相关文档

* [MiniMax-H3 视频生成 API 参考](/api-capabilities/minimax-h3/video-generation)
* [Seedance 2.0 / 2.5 视频生成](/api-capabilities/seedance2/overview)
* [Wan2.7 视频生成](/api-capabilities/wan/overview)
* [VEO 3.1 视频生成](/api-capabilities/veo-3-1-official/overview)
* [充值加赠活动](/faq/recharge-promotions)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.