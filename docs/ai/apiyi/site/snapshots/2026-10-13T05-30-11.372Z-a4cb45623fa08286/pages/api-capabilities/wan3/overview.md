> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan3.0 视频生成（阿里云通义万相）

> 阿里云通义万相 Wan3.0 视频生成完整指南：一个模型 ID 覆盖文生 / 图生 / 参考生 / 视频编辑，最长 30 秒、480P-1080P、原生带音轨，含标准版与优速版 Prime 的逐档价格对照；默认 98 折，充值加赠最高档低至官方 8.2 折、480P 低至 $0.0245/秒。

## 概述

**Wan3.0 是通义万相的一体化视频模型**：和 Wan2.7 需要在 `t2v` / `i2v` / `r2v` / `videoedit` 四个模型 ID 之间切换不同，Wan3.0 **一个模型 ID 打通全部玩法**——传什么素材就做什么事，文生、图生、参考生、视频编辑都在同一个请求体里完成。

两个型号，能力相同、速度与价格不同：

| 模型 ID | 定位 | 相对速度 | 本站 720P 价格 | **充值加赠 20% 低至** |
| - | - | - | - | - |
| `wan3.0-video` | 标准版 | 基准 | \$0.0588/秒 | **\$0.049/秒**（≈ ¥0.34/秒） |
| `wan3.0-video-prime` | **优速版（Prime）** | 更快出片 | \$0.126/秒 | **\$0.105/秒**（≈ ¥0.74/秒） |

<Info>
  两个型号的**参数、端点、素材规则完全一致**，只有速度与单价不同。先用 `wan3.0-video` 跑通流程，对出片时延敏感的线上业务再切 `wan3.0-video-prime`。
</Info>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——**不能用 `/v1/videos`**、缺 `X-DashScope-Async` 头会报错、终态是 `completed` 不是 `SUCCEEDED`、参考视频的秒数也要计费这几个高频坑已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 Wan3.0 的文生视频、图生视频、参考生视频与视频编辑。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查 Wan3.0 的视频生成（文生视频 / 图生视频 / 参考生视频 / 视频编辑）。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/wan3/overview.md](https://docs.apiyi.com/api-capabilities/wan3/overview.md) 拿到本页纯文本版；接口参考页是 [https://docs.apiyi.com/api-capabilities/wan3/video-generation.md。](https://docs.apiyi.com/api-capabilities/wan3/video-generation.md。)

  接入要求：

  1. 端点和异步头（**最容易一上来就卡住的两条**）：提交必须打 `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`，而且**必须带请求头 `X-DashScope-Async: enable`**。**绝对不要用 `/v1/videos`**——那条路会丢掉 `media` 字段，分辨率和时长参数也不生效，计费还会偏高。轮询用的是**另一个前缀**：`GET /v1/tasks/{task_id}`（轮询不需要带异步头）。

  2. 轮询与状态：任务 ID 在提交响应的 **`output.task_id`**。轮询每 5 到 10 秒一次，**不要小于 3 秒**，客户端整体给 20 分钟兜底（5 秒视频实测 480P 约 100 秒、720P 约 120 秒、1080P 约 170 秒出片）。状态是 `submitted` / `in_progress` / `completed` / `failed`，**成功是 `completed`，不是 DashScope 原生的 `SUCCEEDED`**，按原生枚举写判断会永远轮询不到终点。`progress` 长时间停在 30% 是正常的，不是卡住了。**参数和素材错误也是先返回 HTTP 200、再异步 `failed`**，不能只看提交那一步的状态码。

  3. 视频落地：地址在顶层 **`result_url`**，是阿里云 OSS 签名直链、**24 小时过期**。拿到后**立即在服务端下载转存到自己的 OSS / CDN**，不要存进数据库当长期地址。下载这条直链时**不要带 `Authorization` 头**，带了会 403。

  4. 请求体结构与类型：body 是 DashScope 的嵌套结构 `{ model, input: { prompt, media[] }, parameters: { ... } }`，不是扁平的。**`duration` 必须是整数 `5`，不能是字符串 `"5"`**；**`resolution` 要写大写 `480P` / `720P` / `1080P`**。

  5. 模型与玩法：Wan3.0 **只有一个模型 ID**，文生 / 图生 / 参考生 / 视频编辑全靠 `input.media[]` 里每项的 `type` 区分——**不要照搬 Wan2.7 的 `t2v` / `i2v` / `r2v` / `videoedit` 四个模型 ID**（那是上一代模型，照样能调通但不是 Wan3.0）。`wan3.0-video`（标准版）和 `wan3.0-video-prime`（优速版）参数完全一致，只有速度和单价不同，做成可配置项即可。`media` 每项形如 `{"type": ..., "url": ...}`：不传 `media` 是文生视频；`first_frame`（可配 `last_frame`）是图生视频；`reference_image` / `reference_video` / `reference_audio` 是参考生；`file` / `link` 是文档或网页转视频。**`first_frame` / `last_frame` 不能与 `reference_*` / `file` / `link` 混用**，混传会被上游拒绝。`url` 必须是公网可直接 GET 的 https 链接，并且**在任务完成前一直可访问**。多个素材时提示词里用「图1 / 视频1」按 `media` 顺序指代。

  6. 关键参数：**`resolution` 务必显式传**——它决定单价，480P 只有 1080P 的四分之一。不传 `duration` 默认出 5 秒；**输入参考视频时长 + 输出 `duration` 合计不能超过 30 秒**，超了同样是提交 200、任务 `failed`。`ratio` 可选 `16:9` / `9:16` / `1:1` / `4:3` / `3:4` / `adaptive`，**传了首帧图时会被自动忽略**。`prompt_extend` 默认 `true`，建议保持；`audio` 默认 `true`，输出自带音轨。

  7. 计费与幂等：**按秒计费、单价由输出分辨率决定，计费秒数 = 输入参考视频时长 + 输出时长**——传 10 秒参考视频只出 2 秒，按 12 秒收；参考图片、音频、文件不计费。想省钱就先把参考视频裁短，调小 `duration` 省不掉输入那几秒。**带参考视频的任务提交时按 30 秒顶格预扣**，完成后自动退差额（账单里是一条负数记录），余额偏紧时要预留。任务 `failed` **全额退费**，但**重复提交同一个任务会重复计费**——业务层要维护「业务 ID 到 task\_id」的映射做幂等，不要写无脑自动重试；内容审核类失败换提示词，素材类失败先查 URL 可达性。5xx 和网络错误做指数退避（1 秒 / 4 秒 / 16 秒）。

  8. 令牌要求：本模型需要令牌带 `Wan&HappyHorse` 分组，且计费模式是**按量优先或按量计费**——**按次计费的令牌路由不过去**，会报「该模型无可用渠道」。

  9. Key 从环境变量 `APIYI_API_KEY` 读，不要硬编码进代码、也不要提交进 git。

  10. 改完真跑一次 480P 文生视频 + 一次图生视频，把生成的视频和这两次调用的花费贴给我。注意整个流程要几分钟，如果你在受限的执行环境里跑，记得把命令超时放到 600 秒以上或者放后台。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求 | 挡掉的坑 |
  | - | - |
  | 不能用 `/v1/videos` | 那条路会丢掉 `media`、分辨率和时长不生效、计费偏高，看起来像参数写错其实是端点选错 |
  | 必须带 `X-DashScope-Async` | 缺这个头会被当成同步调用直接拒绝 |
  | 成功状态是 `completed` | 按 DashScope 原生的 `SUCCEEDED` 写判断，会永远轮询不到终点 |
  | 只有一个模型 ID | 照搬 Wan2.7 的四个模型 ID 能调通，但调到的是上一代模型，时长上限和单价都不一样 |
  | 首帧与参考素材互斥 | `first_frame` 和 `reference_*` 混传会被上游拒绝，而且是异步 `failed` |
  | 参考视频秒数也计费 | 只调小 `duration` 省不掉输入那几秒；带参考视频还会先按 30 秒顶格预扣 |
  | 下载不带 `Authorization` | OSS 签名直链带 Auth 反而 403 |
</Accordion>

## 相比 Wan2.7 的变化

| 维度 | Wan2.7 | **Wan3.0** |
| - | - | - |
| 模型 ID | 4 个（t2v / i2v / r2v / videoedit） | **1 个**（传素材决定玩法） |
| 最长时长 | 15 秒（含参考视频时 10 秒） | **30 秒**（输入+输出合计） |
| 分辨率 | 720P / 1080P | **480P** / 720P / 1080P |
| 音频 | 需 `driving_audio` 驱动口型 | **默认输出带音轨** |
| 720P 单价 | \$0.084/秒 | **\$0.0588/秒**（便宜约 30%） |
| 1080P 单价 | \$0.14/秒 | **\$0.1176/秒**（便宜约 16%） |

Wan2.7 仍可正常调用，文档见 [Wan2.7 视频生成](/api-capabilities/wan/overview)。

## 核心特性

<CardGroup cols={2}>
  <Card title="一个模型打通四种玩法" icon="list-check">
    文生 / 图生（首帧、尾帧）/ 参考生（图、视频、音频）/ 视频编辑共用同一个模型 ID 与端点，靠 `input.media[]` 的 `type` 区分。
  </Card>

  <Card title="最长 30 秒长视频" icon="clock">
    单次最长 30 秒（输入参考视频 + 输出视频合计），比 Wan2.7 的 15 秒翻倍，适合完整口播段落与短剧分镜。
  </Card>

  <Card title="原生音轨" icon="volume-2">
    输出默认自带 `soun` 音轨，无需额外传驱动音频；也可用 `reference_audio` 指定音色参考。
  </Card>

  <Card title="三档分辨率" icon="expand">
    新增 480P 档，草稿阶段单价只有 1080P 的四分之一，定稿再升档，成本可控。
  </Card>
</CardGroup>

## 分组介绍

Wan3.0 与 Wan2.7、[HappyHorse](/api-capabilities/happyhorse/overview) **共用同一个 `Wan&HappyHorse` 分组**——一把令牌即可调用全部型号。视频按**秒**计费，令牌必须同时满足两个条件才能成功路由：

1. **计费模式**：选「按量优先」或「按量计费」——视频按秒计费，**按次计费的令牌无法路由**
2. **分组**：选择包含 `Wan&HappyHorse`

<Frame caption="创建令牌：计费模式选「按量优先」，分组选 Wan&HappyHorse（0.14x），即可调用 Wan3.0 / Wan2.7 / HappyHorse 全部视频模型（截图中为分组旧名 Wan，现已更名 Wan&HappyHorse）">
  <img src="https://mintcdn.com/apiyillc/5-SttsT0c5VQwgVz/images/wan-token-group-setup-20260523.png?fit=max&auto=format&n=5-SttsT0c5VQwgVz&q=85&s=f46887cb88777eb34d70837983f1fc49" alt="创建令牌界面：计费模式选「按量优先」，分组下拉中选择 Wan&HappyHorse（倍率 0.14x）" width="1286" height="988" data-path="images/wan-token-group-setup-20260523.png" />
</Frame>

## 模型定价

<Info>
  **默认 98 折，叠加充值加赠最高档低至官方 8.2 折。** 480P 低至 **\$0.0245/秒**（≈ ¥0.17/秒），
  720P 低至 **\$0.049/秒**（≈ ¥0.34/秒）——按 `wan3.0-video` 计。
</Info>

### 换算口径：默认 98 折，加赠后低至 8.2 折

控制台里 `Wan&HappyHorse` 分组显示倍率 **0.14x**，这是按**人民币**计价单位计的。本站统一用**美元充值、固定汇率 1:7**：

```
0.14（人民币计价单位） × 7（固定汇率） = 0.98
```

即 **本站每秒美元价 = 阿里云官方每秒人民币价 × 0.14**，等于官方价的 98%。

### 表一：本站价格明细（按秒计费）

| 模型 | 分辨率 | 默认价 | 送 10%（一般） | **送 20%（大客）** | 大客价折人民币 |
| - | - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.0294/秒 | \$0.0267/秒 | **\$0.0245/秒** | ¥0.1715/秒 |
| `wan3.0-video` | 720P | \$0.0588/秒 | \$0.0535/秒 | **\$0.049/秒** | ¥0.343/秒 |
| `wan3.0-video` | 1080P | \$0.1176/秒 | \$0.1069/秒 | **\$0.098/秒** | ¥0.686/秒 |
| `wan3.0-video-prime` | 480P | \$0.063/秒 | \$0.0573/秒 | **\$0.0525/秒** | ¥0.3675/秒 |
| `wan3.0-video-prime` | 720P | \$0.126/秒 | \$0.1145/秒 | **\$0.105/秒** | ¥0.735/秒 |
| `wan3.0-video-prime` | 1080P | \$0.252/秒 | \$0.2291/秒 | **\$0.21/秒** | ¥1.47/秒 |

| 档位 | 相当于阿里云官方价 | 算法 |
| - | - | - |
| 默认 | **98 折** | 倍率 0.14x × 固定汇率 7 |
| 充值送 10%（一般） | **约 8.9 折** | 0.98 ÷ 1.1 |
| 充值送 20%（大客） | **约 8.2 折** | 0.98 ÷ 1.2 |

「送 10% / 送 20%」指 [充值加赠活动](/faq/recharge-promotions) 到账额度放大后的**等效单价**，账单上的扣费仍按默认价计。

### 表二：与阿里云官方逐档对照

| 模型 | 分辨率 | 官方原价 | 官方现价 | 本站默认价（折人民币） | 相当于官方现价 | **加赠 20% 后** |
| - | - | - | - | - | - | - |
| `wan3.0-video` | 480P | ¥0.30/秒 | **¥0.21/秒** | ¥0.2058/秒 | 98 折 | **¥0.1715/秒 · 8.2 折** |
| `wan3.0-video` | 720P | ¥0.60/秒 | **¥0.42/秒** | ¥0.4116/秒 | 98 折 | **¥0.343/秒 · 8.2 折** |
| `wan3.0-video` | 1080P | ¥1.20/秒 | **¥0.84/秒** | ¥0.8232/秒 | 98 折 | **¥0.686/秒 · 8.2 折** |
| `wan3.0-video-prime` | 480P | ¥0.45/秒 | ¥0.45/秒 | ¥0.441/秒 | 98 折 | **¥0.3675/秒 · 8.2 折** |
| `wan3.0-video-prime` | 720P | ¥0.90/秒 | ¥0.90/秒 | ¥0.882/秒 | 98 折 | **¥0.735/秒 · 8.2 折** |
| `wan3.0-video-prime` | 1080P | ¥1.80/秒 | ¥1.80/秒 | ¥1.764/秒 | 98 折 | **¥1.47/秒 · 8.2 折** |

<Info>
  `wan3.0-video` 官方当前有**限时 7 折**（所有用户默认享受），本站价已跟随折后价；`wan3.0-video-prime` 官方无折扣。官方促销结束后本站价会同步调整。
</Info>

### 表三：常用时长的单次总价

| 模型 | 分辨率 | 5 秒 | 10 秒 | 30 秒（上限） |
| - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.147 | \$0.294 | \$0.882 |
| `wan3.0-video` | 720P | \$0.294 | \$0.588 | \$1.764 |
| `wan3.0-video` | 1080P | \$0.588 | \$1.176 | \$3.528 |
| `wan3.0-video-prime` | 480P | \$0.315 | \$0.63 | \$1.89 |
| `wan3.0-video-prime` | 720P | \$0.63 | \$1.26 | \$3.78 |
| `wan3.0-video-prime` | 1080P | \$1.26 | \$2.52 | \$7.56 |

### 叠加充值加赠

参与 [充值加赠活动](/faq/recharge-promotions) 后到账额度最高放大约 1.2 倍，等效价格进一步下探：

```
0.98 ÷ 1.2 ≈ 0.816
```

| 档位 | 等效价格（对比阿里云官方价） | 算法 |
| - | - | - |
| 默认 | **98 折** | 倍率 0.14x × 固定汇率 7 |
| 充值送 10%（一般） | **约 8.9 折** | 0.98 ÷ 1.1 |
| 充值送 20%（大客，最高档） | **约 8.2 折** | 0.98 ÷ 1.2 |

1:7 为**固定结算汇率**（不是优惠汇率），所有美元充值统一适用。

<Note>模型价格与官网对齐，且可能随官网调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。</Note>

## ⚠️ 计费规则（和别的视频模型不一样）

<Warning>
  **计费秒数 = 输入参考视频时长 + 输出视频时长。** 官方原文：「输入视频和输出视频均按时长计费，价格由输出视频分辨率决定」。
</Warning>

| 规则 | 说明 |
| - | - |
| 参考**视频**的秒数要计费 | 传了 10 秒的 `reference_video`、只要 2 秒输出，按 **12 秒** 计费 |
| 参考**图片 / 音频 / 文件**不计费 | 只有视频素材进计费时长 |
| 单价看**输出**分辨率 | 输入视频是 720P、输出 1080P，整段都按 1080P 单价 |
| 合计上限 30 秒 | 输入 + 输出 > 30 秒会被上游拒绝 |
| 不传 `duration` | 默认输出 5 秒，按 5 秒计费 |
| 失败任务 | **全额退费**，不需要找客服 |

<Tip>
  想省钱就**裁短参考视频**，调小 `duration` 省不掉输入那几秒。例：10 秒参考视频 + 2 秒输出 = 12 秒计费，而把参考视频裁到 3 秒后同样出 2 秒，只需 5 秒计费。
</Tip>

### 预扣与结算

* **不带参考视频**：按请求的 `duration` 预扣，金额即最终金额，没有结算行。
* **带参考视频**：提交时网关还不知道输入视频多长，按**上限 30 秒顶格预扣**，任务完成后按实际计费秒数重算、差额自动退回（账单里是一条单独的负数记录）。

<Info>
  顶格预扣会**临时冻结**一笔较大额度：480P \$0.147、720P \$0.294、1080P \$0.588（`wan3.0-video`，30 秒）。余额偏紧时请预留，退款在任务完成后数秒内到账。
</Info>

## ⚠️ 端点选择（最重要）

API易 同时挂载两条路径，**只有 DashScope 透传端点对 Wan3.0 完整可用**：

| 路径 | 协议风格 | 可用性 | 结论 |
| - | - | - | - |
| `/v1/videos` | OpenAI 扁平风格 | ❌ 媒体字段被丢弃，**且计费不准确** | **不要用** |
| `/wan/api/v1/services/aigc/video-generation/video-synthesis` | DashScope 原生透传 | ✅ 完整可用 | **始终用这条** |

<Warning>
  看到任何文档/示例里写 `/v1/videos` 提交 Wan 视频任务，**直接忽略**。该路径不仅会丢弃 `media` 字段，**分辨率与时长参数也不生效、计费会偏高**。所有 Wan3.0 请求都走 `/wan/api/v1/...video-synthesis`。
</Warning>

## 异步调用流程

<Steps>
  <Step title="创建任务">
    `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`，请求头带 `X-DashScope-Async: enable`，立刻返回 `task_id`。
  </Step>

  <Step title="轮询状态">
    `GET /v1/tasks/{task_id}`（带 `Authorization`），每 5–10 秒查一次（**不要小于 3 秒**），直到 `status` 变为 `completed`。
  </Step>

  <Step title="下载视频">
    从响应的 `result_url` 直接 GET 下载 mp4，**不要带 `Authorization` 头**（它是 OSS 签名直链，带 Auth 反而 403），有效期 24 小时。
  </Step>
</Steps>

### 任务状态说明

| 状态 | 含义 | 下一步操作 |
| - | - | - |
| `submitted` | 已提交，排队中 | 继续轮询 |
| `in_progress` | 生成中 | 继续轮询（progress 常停在 30%，是上游汇报粒度粗，不是卡住） |
| `completed` | 成功 | 从 `result_url` 下载 |
| `failed` | 失败 | 看 `error.message` / `fail_reason`，**不计费** |

<Warning>
  终态字符串是 **`completed` / `failed`**，不是 DashScope 原生的 `SUCCEEDED` / `FAILED`。按原生枚举写判断会永远轮询不到终点。
</Warning>

<Tip>
  **参数不合法也是先返回 HTTP 200、再异步 `failed`**，不是同步 400。例如素材 URL 下载不了、输入+输出超 30 秒，都要轮询到终态才知道。客户端不能只看提交那一步的状态码。
</Tip>

### 完整 Python 客户端

```python theme={null}
import json, time, urllib.request

BASE = "https://api.apiyi.com"
KEY  = "sk-your-api-key"   # 你的 API易 Key

def post(path, body):
    h = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
         "X-DashScope-Async": "enable"}
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers=h, method="POST")
    return json.loads(urllib.request.urlopen(req).read())

def get(path):
    req = urllib.request.Request(BASE + path, headers={"Authorization": f"Bearer {KEY}"})
    return json.loads(urllib.request.urlopen(req).read())

# 1. 创建任务（换玩法只改 input.media，模型 ID 不变）
r = post("/wan/api/v1/services/aigc/video-generation/video-synthesis", {
    "model": "wan3.0-video",
    "input": {"prompt": "黄昏海边的灯塔，镜头缓慢推进，海浪轻拍礁石，海鸟叫声"},
    "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 5, "prompt_extend": True}
})
task_id = r["output"]["task_id"]
print("task_id:", task_id)

# 2. 轮询（5–10 秒一次）
while True:
    info = get(f"/v1/tasks/{task_id}")
    status = info["status"]
    print("status:", status, "progress:", info.get("progress"))
    if status == "completed":
        url = info["result_url"]
        break
    if status == "failed":
        raise RuntimeError(info.get("error") or info.get("fail_reason"))
    time.sleep(10)

# 3. 下载（不要带 Authorization！result_url 是 OSS 签名直链）
urllib.request.urlretrieve(url, "out.mp4")
print("saved out.mp4")
```

## 关键参数详解

提交时 body 为 DashScope 嵌套结构：`{ model, input: { prompt, media[] }, parameters: {...} }`。

### `input` 字段

| 字段 | 类型 | 必填 | 说明 |
| - | - | - | - |
| `prompt` | string | ✓ | 自然语言描述；有多个素材时用「图1 / 视频1」在 prompt 里指代 |
| `negative_prompt` | string | | 反向提示词 |
| `media` | array | 非文生视频时必填 | 媒体素材数组，见下 |

### `media[]` 类型与玩法对应

| `type` | 玩法 | 说明 |
| - | - | - |
| 不传 `media` | **文生视频** | 纯文本 |
| `first_frame` | **图生视频** | 以这张图为首帧 |
| `last_frame` | 首尾帧生视频 | 与 `first_frame` 搭配使用 |
| `reference_image` | **参考生视频** | 保持主体 / 服装 / 场景一致 |
| `reference_video` | 参考生视频 / 视频编辑 | **这段视频的时长要计费** |
| `reference_audio` | 音色 / 节奏参考 | 不计费 |
| `file` / `link` | 文档、网页转视频 | 不计费 |

<Warning>
  **`first_frame` / `last_frame` 不能与 `reference_*` / `file` / `link` 混用**，两类素材互斥，混传会被上游拒绝。
</Warning>

每个媒体对象至少含 `type` + `url`，`url` 必须是公网可直接 GET 的 https 链接（本地文件先上传到 OSS / CDN，且**在任务完成前保持可访问**）。

### `parameters` 字段

| 字段 | 类型 | 取值 | 说明 |
| - | - | - | - |
| `resolution` | string | `480P` / `720P` / `1080P` | 大写，**建议显式指定**（决定单价） |
| `ratio` | string | `16:9` / `9:16` / `1:1` / `4:3` / `3:4` / `adaptive` | 宽高比；传了首帧图时自动忽略 |
| `duration` | int | 整数秒 | 输出时长；不传默认 5 秒，**输入+输出合计 ≤ 30** |
| `prompt_extend` | bool | `true` / `false` | 智能改写 prompt，默认 `true`，**建议保持** |
| `audio` | bool | `true` / `false` | 是否输出音轨，默认 `true` |
| `watermark` | bool | `true` / `false` | 右下角「AI 生成」水印 |
| `seed` | int | 0–2147483647 | 固定可提升可复现性 |

<Tip>
  `duration` 必须是**整数** `5` 而不是字符串 `"5"`；`resolution` 写**大写** `720P` 更稳。
</Tip>

## 怎么选：Wan3.0 / Wan2.7 / HappyHorse

| 场景 | 推荐 |
| - | - |
| 要 30 秒长视频、要 480P 省钱档、要原生音轨 | **Wan3.0** |
| 要音频驱动对口型（`driving_audio`） | [Wan2.7 `i2v`](/api-capabilities/wan/overview) |
| 对出片时延敏感的线上业务 | **`wan3.0-video-prime`** |
| 想要更低单价的同类能力 | [HappyHorse](/api-capabilities/happyhorse/overview) |

## 最佳实践

<AccordionGroup>
  <Accordion title="先用 480P 试 prompt，定稿再升 1080P" icon="wallet">
    480P 单价只有 1080P 的四分之一。prompt 与运镜在 480P 调通后再升档，一条 5 秒 1080P 的成本可以试四条草稿。
  </Accordion>

  <Accordion title="参考视频先裁剪再上传" icon="scissors">
    输入视频的秒数要计费。只需要其中 3 秒就别传 30 秒的原片——这是 Wan3.0 上最容易被忽略的成本项。
  </Accordion>

  <Accordion title="prompt 写动作，不要只写画面" icon="pen-line">
    视频模型吃的是「谁在做什么、镜头怎么动」。「一只橘猫在窗台伸懒腰，镜头缓慢推近」比「一只可爱的橘猫，阳光，高清」有效得多。
  </Accordion>

  <Accordion title="轮询间隔别小于 3 秒" icon="timer">
    480P 约 100 秒、720P 约 120 秒、1080P 约 170 秒出片（5 秒视频，实测）。5–10 秒轮询一次足够，过密只会浪费配额。
  </Accordion>

  <Accordion title="失败不要自动重试同一条 prompt" icon="repeat">
    失败任务全额退费，但重复提交会**重复计费**。内容审核类失败换 prompt，素材类失败先检查 URL 可达性。
  </Accordion>
</AccordionGroup>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么账单上的秒数比我出的视频长？">
    因为计费秒数 = **输入参考视频时长 + 输出视频时长**。传了 10 秒参考视频、出 2 秒成品，按 12 秒计费。参考图片、音频、文件不计费。
  </Accordion>

  <Accordion title="为什么刚提交就扣了一大笔，之后又退回来了？">
    带参考视频的任务按上限 30 秒顶格预扣，任务完成后按实际秒数重算并退差额。账单里会看到一条负数的调整记录。
  </Accordion>

  <Accordion title="任务一直是 in_progress / progress 停在 30%？">
    这是上游汇报粒度粗，不是卡住。1080P 或长视频可能要 3–5 分钟，继续轮询即可。
  </Accordion>

  <Accordion title="result_url 下载报 403？">
    下载时**不要带 `Authorization` 头**，它是 OSS 签名直链。链接 24 小时过期，请及时转存。
  </Accordion>

  <Accordion title="提交返回 200，但任务 failed？">
    参数与素材类错误都是异步失败，不是同步 400。常见原因：素材 URL 下载不了（含过期签名链接）、输入+输出超 30 秒、内容审核拦截。失败任务全额退费。
  </Accordion>

  <Accordion title="报「该模型无可用渠道」？">
    检查令牌的**计费模式**是否为「按量优先 / 按量计费」（按次计费无法路由视频模型），以及**分组**是否包含 `Wan&HappyHorse`。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="视频生成 API 参考" icon="code" href="/api-capabilities/wan3/video-generation">
    在线 Playground + cURL / Python / Node 示例
  </Card>

  <Card title="Wan2.7 视频生成" icon="video" href="/api-capabilities/wan/overview">
    上一代四模型方案，支持音频驱动对口型
  </Card>

  <Card title="HappyHorse 视频生成" icon="horse" href="/api-capabilities/happyhorse/overview">
    同分组的另一视频系列
  </Card>

  <Card title="模型价格" icon="dollar-sign" href="/models/index">
    全站模型价格总表（权威）
  </Card>
</CardGroup>

官方参考：`help.aliyun.com/zh/model-studio/wan3-video-generation-guide`、`help.aliyun.com/zh/model-studio/wan3-video-generation-api-reference`


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.