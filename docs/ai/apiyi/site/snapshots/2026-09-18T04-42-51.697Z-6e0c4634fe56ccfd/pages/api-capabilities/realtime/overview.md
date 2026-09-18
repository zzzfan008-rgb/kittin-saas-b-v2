> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Realtime 实时语音（WebSocket）

> 四个实时语音模型，一条 wss 端点，一把 API易 令牌：双向流式音频、可打断、两种自动断句、工具调用与图片输入。四款模型均已上架，默认分组直接调用；含两套协议的完整字段对照与零成本文本自测方案。

## 概述

Realtime 是一类**走 WebSocket 长连接**的语音模型：音频流进、音频流出，中途可以被打断，不需要「录完再上传、等一段再播放」。它和「ASR + 文本模型 + TTS」三段式拼接的最大区别是端到端——模型直接听到语气、停顿和情绪，也直接说出来，延迟能压到亚秒级。

目前 API易 接入了 **4 个模型、2 套协议**，共用同一条端点和同一把令牌：

* `gpt-realtime-2.1` / `gpt-realtime-2.1-mini` —— OpenAI Realtime GA 协议
* `qwen3.5-omni-plus-realtime` / `qwen3.5-omni-flash-realtime` —— 阿里云百炼协议

<Warning>
  **接入状态（2026-09-14 (UTC+8) 更新）**：四款模型**均已正式上架，令牌勾选默认分组（default）即可直接调用，无需申请**，VIP / SVIP 分组同样可用。欢迎测试、体验与对接；文档有缺漏或与实测不符，欢迎直接反馈给我们。上游协议与行为仍可能调整，本页「已知限制与规避」一节列出的差异均为实测结论、且会随上游变化更新；请在客户端实现重连与降级后再投产。需要更高并发额度的客户，欢迎通过[企业微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)联系，也可邮件 [hi@apiyi.com](mailto:hi@apiyi.com) / [feedback@apiyi.com](mailto:feedback@apiyi.com)。
</Warning>

<Note>
  **🎤 核心亮点**：单连接双向流式音频、**可随时打断**、`server_vad` 与 `semantic_vad` 两种自动断句、Function Calling 全链路（含结果回注）、图片输入、`usage` 按模态分列。四个模型的上述能力均已逐项实测通过（2026-08-24 首测、2026-09-14 复测 (UTC+8)）。
</Note>

<Info>
  **先记住这一件事**：4 个模型分属**两套不同的请求协议**，字段名和事件名都不一样。**只改 `model` 参数、不改请求体字段，一定连不通**——这是接入本能力最高频的失败原因。差异只有 6 个字段 + 3 个事件名，全部列在下方「两套协议对照」一节。
</Info>

<CardGroup cols={2}>
  <Card title="令牌与分组管理" icon="key-round" href="/api-capabilities/token-management">
    四款模型在默认分组下直接可用；创建令牌、勾选分组与设置额度看这里。
  </Card>

  <Card title="API 使用手册" icon="book-open" href="/api-manual">
    令牌创建、Base URL、计费模式等通用调用规范。
  </Card>

  <Card title="企业微信客服" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    接入问题、并发扩容、文档缺漏都可以直接找到人。
  </Card>

  <Card title="调用日志查询" icon="receipt-text" href="https://api.apiyi.com/log">
    在控制台查看每次调用的 token 用量与实际扣费。
  </Card>
</CardGroup>

本页篇幅不短，三节是必读：**两套协议对照**（改模型必看）、**先用文本跑通**（不用麦克风就能验证链路）、**已知限制与规避**（四条会打到客户端代码的实测差异）。

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——**两套协议的字段族**、采样率红线、打断收口、空闲断线这几个高频问题已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查 Realtime 实时语音。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查 API易 的 Realtime 实时语音（WebSocket 双向流式）。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/realtime/overview.md](https://docs.apiyi.com/api-capabilities/realtime/overview.md) 拿到本页纯文本版，重点看「两套协议对照」和「已知限制与规避」两节。

  接入要求：

  1. 这是 **WebSocket 长连接**，不是 HTTP 请求。端点是 `wss://api.apiyi.com/v1/realtime?model=<模型名>`，鉴权走 `Authorization: Bearer <令牌>` 请求头。**不要写成 HTTP POST，也不要去拼 `/v1/audio/speech` 或 `/v1/audio/transcriptions` 这类端点**，它们是另一回事。

  2. **动手前先确认模型属于哪个协议家族，再决定写哪套字段**。`gpt-realtime-2.1` 和 `gpt-realtime-2.1-mini` 走 Realtime GA 协议；`qwen3.5-omni-plus-realtime` 和 `qwen3.5-omni-flash-realtime` 走阿里云百炼协议。两套只有端点和鉴权相同，请求体与事件名全都不同：输出模态 `modalities` 对 `output_modalities`；音色 `voice` 在顶层 对 `audio.output.voice`；`input_audio_format` 对 `audio.input.format`；`turn_detection` 在顶层 对 `audio.input.turn_detection`；`input_audio_transcription` 对 `audio.input.transcription`。事件名：`response.text.delta` 对 `response.output_text.delta`，`response.audio.delta` 对 `response.output_audio.delta`。**把这两套写成两个配置模板，不要用 if 到处打补丁。**

  3. 音频格式红线：一律 PCM 有符号 16 位、单声道、Base64 编码后放进 `input_audio_buffer.append`。**采样率两套不一样**——百炼协议是 16000，Realtime GA 协议要求大于等于 24000，传 16000 会直接报 `integer_below_min_value`。重采样在客户端做完再发，不要指望服务端兜底。

  4. 打断收口不要死等 `response.done`。发出 `response.cancel` 之后，**百炼协议那两个模型目前收不到 `response.done`**（实测稳定复现）。请以 `response.output_item.done` 作为一轮结束的判据，并额外加一个 5 秒超时兜底；Realtime GA 协议两个模型正常，但用同一套判据也不会错。

  5. 长连接要做保活与重连。**百炼协议实测空闲 300 秒会被上游断开，而且 WebSocket 层的 ping/pong 不算活动**，续不了这个计时；空闲期要么定时发一个应用层事件，要么接受断线并自动重连。Realtime GA 协议的会话对象带 `expires_at`（实测约建连后 30 分钟），到期同样要重连。**重连之后必须重放 `session.update` 和必要的上下文**，否则新会话是默认配置。

  6. 音色必须在**首帧 `session.update` 就定死**。会话里一旦已经产生过音频输出，再改音色会报 `cannot_update_voice`。要换音色请新开会话。

  7. Key 从环境变量 `APIYI_API_KEY` 读，不要硬编码进代码、也不要提交进 git。**前端不要直连**，写一个后端中继，由后端持有令牌并转发音频帧。

  8. 先跑纯文本冒烟再接麦克风：`output_modalities` 只留文本，发一条 `input_text`，确认能收到文本增量和 `response.done` 里的 `usage`，再去接音频。改完两个协议家族各真跑一次，把两次的 `usage` 贴给我。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求                        | 挡掉的坑                                                   |
  | ------------------------- | ------------------------------------------------------ |
  | 先确认协议家族再写字段               | 只改 `model` 名不改请求体，握手能过但 `session.update` 必被拒           |
  | 采样率分家族写死                  | 给 Realtime GA 协议传 16 kHz 直接报 `integer_below_min_value` |
  | 输出模态字段改名了                 | 照着百炼那套写 `modalities`，在 GA 协议上是无效字段                     |
  | 事件名也换了                    | 监听 `response.text.delta` 在 GA 协议上永远收不到东西               |
  | 打断以 `output_item.done` 收口 | 百炼协议打断后不下发 `response.done`，死等会把这一轮挂住                   |
  | 空闲要保活，ping 不算数            | 以为有心跳就不会断，实际 300 秒静默照样被切                               |
  | 音色首帧定死                    | 出过音频后再改会报 `cannot_update_voice`                        |
  | 前端不直连、写后端中继               | 浏览器直连要把令牌交给页面，等于公开密钥                                   |
</Accordion>

## 为什么选 API易 的 Realtime 语音

<CardGroup cols={2}>
  <Card title="一把令牌，四个模型" icon="key-round">
    同一条 `wss` 端点、同一套鉴权，换模型只改 `model` 参数与对应字段模板，不用维护两家账号体系。
  </Card>

  <Card title="国内直连，免出海" icon="globe">
    国内机房、家宽网络、海外节点均可直连 `api.apiyi.com`，无需注册上游厂商账号、无需实名与预充值。
  </Card>

  <Card title="两套协议差异已替你测完" icon="git-compare">
    字段对照、事件名对照、采样率红线、四条实测限制全部写进本页，不用自己踩一遍。
  </Card>

  <Card title="文本通道可零成本自测" icon="terminal">
    不接麦克风就能验证握手、鉴权、字段、工具链和并发——音频档位比文本贵一个数量级，联调阶段省下来的是真金白银。
  </Card>

  <Card title="实测延迟与并发有据可查" icon="gauge">
    40 并发下握手 p50 约 1 秒、首个文本增量 p50 约 1 秒、120 路会话 120 路成功，测试口径与日期都写在「技术规格」里。
  </Card>

  <Card title="接入问题直连技术支持" icon="handshake">
    企业微信直连，接入问题、并发扩容、上游行为变化都可以直接问到人。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="双向流式 · 可打断" icon="radio">
    音频边说边出，客户端随时发 `response.cancel` 打断当前回复，会话不中断、上下文不丢。四个模型均实测通过。
  </Card>

  <Card title="两种自动断句" icon="scissors">
    `server_vad` 按静音时长断句，`semantic_vad` 按语义意图断句（更能忽略「嗯」「对」这类附和声）。两种在四个模型上均实测通过。
  </Card>

  <Card title="Function Calling 全链路" icon="wrench">
    模型自主触发工具 → 客户端执行 → `function_call_output` 回注结果 → 模型接着说。四个模型的完整链路均实测通过。
  </Card>

  <Card title="图片输入 · 分模态计量" icon="image">
    会话中可以送入图片让模型识读；`usage` 把文本 / 音频 / 图片 token 分列返回，成本可归因。四个模型均实测通过。
  </Card>
</CardGroup>

## 支持的模型

| 模型                            | 协议家族           | 开放状态   | 默认音色    | 输入采样率    | Prompt 缓存 | 定位                                  |
| ----------------------------- | -------------- | ------ | ------- | -------- | --------- | ----------------------------------- |
| `gpt-realtime-2.1`            | Realtime GA 协议 | ✅ 默认分组 | `marin` | ≥ 24 kHz | ✅ 支持      | 旗舰，多语种与推理能力最强，支持 `reasoning.effort` |
| `gpt-realtime-2.1-mini`       | Realtime GA 协议 | ✅ 默认分组 | `marin` | ≥ 24 kHz | ✅ 支持      | 高性价比，日常对话够用                         |
| `qwen3.5-omni-plus-realtime`  | 阿里云百炼协议        | ✅ 默认分组 | `Tina`  | 16 kHz   | ⏸ 暂不支持    | 中文场景旗舰                              |
| `qwen3.5-omni-flash-realtime` | 阿里云百炼协议        | ✅ 默认分组 | `Tina`  | 16 kHz   | ⏸ 暂不支持    | 中文场景高性价比                            |

输出音频四个模型统一为 **PCM 有符号 16 位 / 单声道 / 24 kHz**。

<Warning>
  两个协议家族**只有端点与鉴权相同**，请求体字段与服务端事件名都不同。换模型时必须同步换字段模板，详见下方「两套协议对照」一节。
</Warning>

## 模型定价

<Info>
  **一句话理解定价**：按 token 计费，**音频比文本贵一个数量级**（以 `gpt-realtime-2.1` 为例，音频输入 \$32 对文本输入 \$4，音频输出 \$64 对文本输出 \$24）。所以联调阶段应该跑纯文本，等链路确认无误再接音频——具体做法见下方「先用文本跑通」一节。
</Info>

下表为**各厂商的官方定价口径**，单位为每 100 万 tokens 美元，站内按同价逐 token 计费（2026-09-14 (UTC+8) 已逐模态对账）。**站内实际扣费以[控制台调用日志](/api-capabilities/log-query)为准**；叠加[充值加赠活动](/faq/recharge-promotions)后实付更低。

### Realtime GA 协议

| 模型                      | 文本输入  | 文本输出  | 缓存读（官方）            | 图片输入  | 音频输入 | 音频输出 |
| ----------------------- | ----- | ----- | ------------------ | ----- | ---- | ---- |
| `gpt-realtime-2.1`      | \$4   | \$24  | \$0.4（站内暂按 \$4）    | \$5   | \$32 | \$64 |
| `gpt-realtime-2.1-mini` | \$0.6 | \$2.4 | \$0.06（站内暂按 \$0.6） | \$0.8 | \$10 | \$20 |

### 阿里云百炼协议

计费维度与上表不同：图片输入并入文本档，输出侧只区分「纯文本」与「文本+音频」（后者只对音频部分计费）。

| 模型                            | 文本 / 图片输入 | 音频输入   | 文本输出   | 文本+音频输出 |
| ----------------------------- | --------- | ------ | ------ | ------- |
| `qwen3.5-omni-plus-realtime`  | \$1.38    | \$11   | \$8.25 | \$41.26 |
| `qwen3.5-omni-flash-realtime` | \$0.45    | \$3.71 | \$2.75 | \$14.71 |

<Note>
  **计费说明**：文本、音频、图片三类 token 按上表官方价逐笔计费，打断（`response.cancel`）的一轮按实际已产出的 token 计，空会话不计费。**缓存读目前暂不打折**：命中的 `cached_tokens` 会在 `usage` 里如实回显，但站内暂按对应的文本输入价计费，计费链路修复后自动按官方缓存价生效并在[更新日志](/changelog)公告。平台会随官方政策与供给能力动态调整价格，该能力以**保障供给、服务客户**为主，并非盈利型定价。
</Note>

## 分组介绍

| 分组                | 覆盖模型 | 说明                           |
| ----------------- | ---- | ---------------------------- |
| **default（默认分组）** | 四款全部 | 令牌勾选默认分组即可，无需申请；分组倍率 1，与官方同价 |
| VIP / SVIP        | 四款全部 | 已挂载，扣费按令牌所在分组的倍率计            |

<Note>
  四款模型共用同一条端点与同一把令牌，切换分组只需在[令牌管理](/api-capabilities/token-management)里改勾选，代码无需改动。
</Note>

## 技术规格

| 维度       | 参数                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------- |
| **传输协议** | WebSocket（`wss://`），单连接双向流式                                                                        |
| **鉴权**   | `Authorization: Bearer <令牌>` 请求头                                                                   |
| **事件格式** | 与 OpenAI Realtime 事件模型兼容（客户端事件 / 服务端事件）                                                            |
| **输入音频** | PCM 有符号 16 位、单声道、Base64。**百炼协议 16 kHz；Realtime GA 协议 ≥ 24 kHz**                                    |
| **输出音频** | PCM 有符号 16 位、单声道、24 kHz                                                                            |
| **输出模态** | 文本 / 音频（可只要文本）                                                                                     |
| **自动断句** | `server_vad`、`semantic_vad`，或关闭走手动 `commit`                                                        |
| **工具调用** | 支持，含 `function_call_output` 结果回注                                                                   |
| **图片输入** | 支持（两家族写法不同，见下）                                                                                     |
| **会话时长** | Realtime GA 协议：会话带 `expires_at`，实测两次分别约建连后 30 分钟与 60 分钟，以 `session.created` 回显为准；百炼协议：实测空闲 300 秒断开 |

### 实测延迟与并发

2026-09-14 (UTC+8) 经 `api.apiyi.com` 公网路径实测，`gpt-realtime-2.1` 与 `-mini` 各 20 路、40 路两档并发，单轮纯文本问答：

| 指标           | 实测值（40 路 × 2 模型）                      |
| ------------ | ------------------------------------- |
| WebSocket 握手 | p50 0.96–1.03 秒，最大 1.40 秒             |
| 首个文本增量       | p50 0.99–1.08 秒，最大 1.67 秒             |
| 单轮问答整轮       | p50 1.30–1.44 秒，最大 2.11 秒             |
| 会话成功率        | 100%（20 路 + 40 路两档共 120 路，全部成功，零 429） |
| 空闲保持         | 静默 5 分钟后仍可对话，ping/pong 约 200 ms       |

<Warning>
  上述数字是特定时点、特定并发下的实测值，不构成性能承诺，**不提供可用率 SLA**，请在客户端实现重连与降级。
</Warning>

## 端点一览

| 端点                                            | 用途       | 鉴权                           |
| --------------------------------------------- | -------- | ---------------------------- |
| `wss://api.apiyi.com/v1/realtime?model=<模型名>` | 建立实时语音会话 | `Authorization: Bearer <令牌>` |

四个模型共用这一条端点，`model` 查询参数决定路由到哪个模型。

<Warning>
  **关于浏览器直连**：本端点也接受 `Sec-WebSocket-Protocol` 子协议形式的鉴权（`realtime, openai-insecure-api-key.<令牌>, openai-beta.realtime-v1`），浏览器 `WebSocket` 构造函数能直接连上——但这**等于把令牌发给浏览器**，任何访问者都能从网络面板里拿到。**仅供本机验证使用**。生产环境请写一个后端中继：由后端持有令牌、建立到 API易 的连接，前端只与你自己的服务通信。
</Warning>

## ⚠️ 两套协议对照（迁移必读）

两个家族的端点、鉴权、整体事件流程完全一致，差异集中在 `session.update` 的字段结构和几个服务端事件名上。

### 请求体字段对照

| 用途     | 阿里云百炼协议                            | Realtime GA 协议                                           |
| ------ | ---------------------------------- | -------------------------------------------------------- |
| 输出模态   | `modalities: ["text","audio"]`     | `output_modalities: ["audio"]`                           |
| 音色     | `voice`（顶层）                        | `audio.output.voice`                                     |
| 语速     | 不支持                                | `audio.output.speed`（0.7 / 1.0 / 1.5 实测线性生效）             |
| 输入音频格式 | `input_audio_format: "pcm"`，16 kHz | `audio.input.format: {"type":"audio/pcm","rate":24000}`  |
| 输出音频格式 | `output_audio_format: "pcm"`       | `audio.output.format: {"type":"audio/pcm","rate":24000}` |
| 自动断句   | `turn_detection`（顶层）               | `audio.input.turn_detection`                             |
| 输入转写   | `input_audio_transcription`        | `audio.input.transcription`                              |

### 服务端事件名对照

| 内容     | 阿里云百炼协议                           | Realtime GA 协议                           |
| ------ | --------------------------------- | ---------------------------------------- |
| 文本增量   | `response.text.delta`             | `response.output_text.delta`             |
| 音频增量   | `response.audio.delta`            | `response.output_audio.delta`            |
| 音频转写增量 | `response.audio_transcript.delta` | `response.output_audio_transcript.delta` |

`session.created` / `session.updated` / `conversation.item.create` / `input_audio_buffer.append` / `input_audio_buffer.commit` / `response.create` / `response.cancel` / `response.done` 等其余事件名两套一致。

### 两段最小 session.update

同一件事各写一遍，可以直接抄。**阿里云百炼协议**：

```json theme={null}
{
  "type": "session.update",
  "session": {
    "modalities": ["text", "audio"],
    "voice": "Ethan",
    "input_audio_format": "pcm",
    "output_audio_format": "pcm",
    "input_audio_transcription": { "model": "qwen3-asr-flash-realtime" },
    "turn_detection": { "type": "semantic_vad" }
  }
}
```

**Realtime GA 协议**：

```json theme={null}
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "output_modalities": ["audio"],
    "audio": {
      "input": {
        "format": { "type": "audio/pcm", "rate": 24000 },
        "transcription": { "model": "whisper-1" },
        "turn_detection": { "type": "semantic_vad" }
      },
      "output": {
        "format": { "type": "audio/pcm", "rate": 24000 },
        "voice": "alloy",
        "speed": 1.0
      }
    }
  }
}
```

<Warning>
  **采样率是硬约束**：Realtime GA 协议的 `audio.input.format.rate` 必须 **≥ 24000**，传 16000 会直接报 `integer_below_min_value: Expected a value >= 24000`。阿里云百炼协议则要求输入 16 kHz。重采样请在客户端完成。
</Warning>

## 先用文本跑通：文本通道的意义与三级自测阶梯

音频链路要调麦克风采集、重采样、分片、断句，任何一环出错都表现为「没反应」，很难定位。所以**不要一上来就接麦克风**。

### 文本是控制面，不是备选输入

在实时语音模型里，文本不是「音频之外的另一种输入方式」，而是**除音频流以外的全部控制通道**：

| 组合       | 典型用途                                                                 |
| -------- | -------------------------------------------------------------------- |
| 文本 → 控制面 | `instructions` 系统提示、`function_call_output` 工具返回、检索结果注入——全部是文本，麦克风碰不到 |
| 文本 → 音频  | 等于一个**带完整对话上下文的 TTS**：让普通模型先想清楚，再交给实时模型「说出来」，适合播报与提示音                |
| 文本 → 文本  | **最便宜的调试通道**：纯文本对话本身用普通对话模型更划算，它在这里的价值是零成本验证链路                       |

### 三级自测阶梯

<Steps>
  <Step title="第一级：纯文本，不碰麦克风">
    把 `output_modalities` 只留文本、关掉自动断句，发一条 `input_text` 就能验证：握手通不通、令牌与分组对不对、**字段模板选对了没有**、`session.update` 有没有生效、工具能不能回注、多轮上下文在不在、并发扛不扛得住。**完全不产生音频 token。**
  </Step>

  <Step title="第二级：回放本地 wav 文件">
    用一段固定的本地音频代替麦克风，按 100 毫秒一片喂进 `input_audio_buffer.append`。这一步把**音频链路**（格式、采样率、分片、`commit`、VAD 触发）与业务逻辑解耦，可重复、可回归——同一个文件跑两次结果应该一致。
  </Step>

  <Step title="第三级：接实时麦克风">
    前两级都通过之后，只剩采集与播放两件事要调。这时如果出问题，范围已经被缩到很小。
  </Step>
</Steps>

<Tip>
  **没有现成测试音频？** macOS 自带工具一行就能造一段合规的：

  ```bash theme={null}
  say -v Tingting -o /tmp/ask.aiff "今天北京的天气怎么样？请用一句话回答。"

  # Realtime GA 协议用 24000
  afconvert -f WAVE -d LEI16@24000 -c 1 /tmp/ask.aiff ask_24k.wav
  # 阿里云百炼协议用 16000
  afconvert -f WAVE -d LEI16@16000 -c 1 /tmp/ask.aiff ask_16k.wav
  ```

  采样率选错是第二级最常见的翻车点，两套协议要求不同，别混用。
</Tip>

### 一段能跑的文本冒烟脚本

只依赖 `websockets`（`pip install websockets`）。改 `FAMILY` 一个变量就能在两套协议之间切换：

```python theme={null}
import asyncio, json, os, websockets

FAMILY = "ga"           # ga = gpt-realtime-2.1 系列；omni = qwen3.5-omni 系列
MODEL = "gpt-realtime-2.1" if FAMILY == "ga" else "qwen3.5-omni-plus-realtime"
URL = f"wss://api.apiyi.com/v1/realtime?model={MODEL}"
HEADERS = {"Authorization": "Bearer " + os.environ["APIYI_API_KEY"]}

# 两套协议只在这里分叉：session 字段结构与文本增量事件名不同，其余流程完全一样
SESSION = ({"type": "realtime", "output_modalities": ["text"],
            "audio": {"input": {"turn_detection": None}}}
           if FAMILY == "ga" else
           {"modalities": ["text"], "turn_detection": None})
TEXT_DELTA = "response.output_text.delta" if FAMILY == "ga" else "response.text.delta"

async def main():
    async with websockets.connect(URL, additional_headers=HEADERS) as ws:
        while json.loads(await ws.recv())["type"] != "session.created":
            pass
        await ws.send(json.dumps({"type": "session.update", "session": SESSION}))
        await ws.send(json.dumps({"type": "conversation.item.create", "item": {
            "type": "message", "role": "user",
            "content": [{"type": "input_text", "text": "用一句话解释什么是 WebSocket。"}]}}))
        await ws.send(json.dumps({"type": "response.create"}))
        while True:
            e = json.loads(await ws.recv())
            if e["type"] == TEXT_DELTA:
                print(e["delta"], end="", flush=True)
            elif e["type"] == "response.done":
                print("\n\nusage =", json.dumps(e["response"]["usage"], ensure_ascii=False))
                return
            elif e["type"] == "error":
                print("\nERROR:", json.dumps(e, ensure_ascii=False))
                return

asyncio.run(main())
```

跑通了说明端点、令牌、分组、字段模板四件事都对了，可以进第二级。

## 会话能力：音色 · 断句 · 工具 · 图片

### 音色

| 项    | 阿里云百炼协议                           | Realtime GA 协议                               |
| ---- | --------------------------------- | -------------------------------------------- |
| 默认音色 | `Tina`                            | `marin`                                      |
| 实测可用 | `Tina`、`Ethan` 等                  | `alloy`、`marin`、`cedar`、`shimmer`、`verse`    |
| 语速调节 | 不支持                               | `audio.output.speed`，0.7 / 1.0 / 1.5 时长呈线性变化 |
| 非法音色 | 报 `Voice 'xxx' is not supported.` | 报 `invalid_value`                            |

<Warning>
  **音色要在首帧 `session.update` 就定死。** 会话里一旦已经产生过音频输出，再改音色会报 `cannot_update_voice`——这是两套协议共有的行为。要换音色请新开一个会话。另外阿里云百炼协议**不要传空字符串音色**，空值会回落到一个不受支持的音色并报 400；不需要指定时直接省略该字段即可。
</Warning>

### 断句：server\_vad 与 semantic\_vad

* `server_vad` —— 按静音时长断句，参数直观（`threshold`、`silence_duration_ms`、`prefix_padding_ms`）。
* `semantic_vad` —— 按语义意图断句，能忽略「嗯」「对」这类附和声和无意义背景音，多人环境更稳。
* 也可以把断句关掉（传 `null` 或 `none`）走**手动模式**：自己发 `input_audio_buffer.commit` 再发 `response.create`，适合「按住说话」这类由 UI 控制轮次的交互。

<Tip>
  用 VAD 模式时**必须持续推流**。说完话之后要接着推一小段静音（实测补 2 秒即可），服务端才能判定「说话结束」；只推有声部分然后停下，`speech_stopped` 不会触发，也就不会自动应答。
</Tip>

### 工具调用

事件顺序：模型输出 `function_call` 类型的 `response.output_item.done`（其中带 `call_id` 和 `arguments`）→ 客户端执行 → 回注结果 → 再次 `response.create` 让模型接着说。

```json theme={null}
{
  "type": "conversation.item.create",
  "item": {
    "type": "function_call_output",
    "call_id": "call_xxx",
    "output": "{\"city\":\"北京\",\"weather\":\"小雨\",\"temp_c\":21}"
  }
}
```

四个模型的完整链路均实测通过，回注结果后模型能正确复述工具返回的内容。

### 图片输入

**Realtime GA 协议**：直接在消息里放 `input_image`，值可以是 data URI。

```json theme={null}
{
  "type": "conversation.item.create",
  "item": {
    "type": "message",
    "role": "user",
    "content": [
      { "type": "input_image", "image_url": "data:image/jpeg;base64,..." },
      { "type": "input_text", "text": "图里写了什么？" }
    ]
  }
}
```

**阿里云百炼协议**：图片被当作**视频帧**处理，必须先有音频再追加图片，否则报 `Error append image before append audio.`。实测做法是把 `input_image_buffer.append` 按约每秒一帧交织进 `input_audio_buffer.append` 序列里。

## 已知限制与规避

以下各条均为实测结论，且都会打到客户端代码，接入前请先看一遍。

| 现象                                                                                | 影响家族                | 客户端怎么绕                                                                                    |
| --------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| 发出 `response.cancel` 后收不到 `response.done`，这一轮不会收口                                 | 阿里云百炼协议（6 次测试全部复现）  | 以 `response.output_item.done` 判定一轮结束，并加 5 秒超时兜底。会话本身不受影响，打断后可继续对话                         |
| 空闲 300 秒被上游断开，且 WebSocket 层 ping/pong **不算活动**                                    | 阿里云百炼协议             | 空闲期定时发一个应用层事件保活，或接受断线并自动重连；重连后重放 `session.update`                                         |
| 会话已产生音频后无法再改音色，报 `cannot_update_voice`                                            | 两个家族                | 首帧 `session.update` 就把 `voice` 定死；要换音色新开会话                                                |
| 手动 `commit` 模式下收不到输入转写的完成事件                                                       | 阿里云百炼协议的 `flash` 型号 | 改用 `server_vad` / `semantic_vad` 模式，该模式下转写正常；对话本身不受影响，模型对音频内容的理解与回答是正确的                   |
| `POST /v1/realtime/client_secrets`（临时密钥）与 `POST /v1/realtime/calls`（WebRTC）返回 404 | 全部                  | 站内只支持 WebSocket 直连，WebRTC / SIP / ephemeral token 不可用。浏览器与移动端场景请走后端中继，由后端持有令牌建立 WebSocket |
| 自定义音色（`audio.output.voice` 传 `{id: …}` 对象）返回上游 500                                | Realtime GA 协议      | 只用内置音色名（`marin` / `cedar` / `alloy` 等字符串）                                                 |

<Warning>
  上述行为可能随上游变化而调整，本页会持续更新。遇到本表之外的异常，欢迎通过[企业微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)或 [feedback@apiyi.com](mailto:feedback@apiyi.com) 反馈，附上时间点与 `session.id` 便于我们定位。
</Warning>

## 最佳实践

<Steps>
  <Step title="先按协议家族选字段模板">
    把两套 `session.update` 写成两个配置常量，按模型名选择，不要用 if 到处打补丁。这是最容易在半年后维护出错的地方。
  </Step>

  <Step title="首帧一次性定死会话参数">
    `output_modalities`、`voice`、`speed`、`turn_detection`、`transcription` 在第一条 `session.update` 里全部设好。音色尤其如此——出过音频再改就晚了。
  </Step>

  <Step title="纯文本冒烟通过再接音频">
    先跑本页的文本冒烟脚本确认端点、令牌、分组、字段四件事都对，再进音频。音频档位比文本贵一个数量级，联调期跑文本能省下大部分成本。
  </Step>

  <Step title="采样率与声道在客户端转好">
    PCM 有符号 16 位、单声道，百炼协议 16 kHz、Realtime GA 协议 ≥ 24 kHz。不要指望服务端兜底，格式不对通常表现为「没反应」而不是明确报错。
  </Step>

  <Step title="用 output_item.done 加超时收口">
    不要只等 `response.done`。这样写在两个家族上都正确，也避免打断时把一轮挂住。
  </Step>

  <Step title="长会话做保活与重连">
    百炼协议关注 300 秒空闲上限，Realtime GA 协议关注会话 `expires_at`。**重连之后必须重放 `session.update` 与必要的上下文**，否则新会话是默认配置。
  </Step>

  <Step title="生产走后端中继">
    令牌只放在后端，前端与你自己的服务通信。浏览器直连虽然技术上可行，但等于公开密钥。
  </Step>
</Steps>

## 错误码与重试

| 现象                                        | 含义                           | 处理建议                                            |
| ----------------------------------------- | ---------------------------- | ----------------------------------------------- |
| 握手返回 401                                  | 令牌无效，或没有携带 `Authorization` 头 | 检查令牌本身、是否写成了 `https://`、请求头有没有带上                |
| 握手返回 503 且提示无可用渠道                         | 令牌所在分组没有该模型（四款都在默认分组），或模型名拼错 | 核对令牌分组与 `model` 参数                              |
| 握手返回 400                                  | 缺少 `model` 查询参数              | 端点必须带 `?model=<模型名>`                            |
| `invalid_request_error` + 未知字段            | **协议家族用错了**                  | 对照本页「请求体字段对照」换成该模型对应的字段模板                       |
| `integer_below_min_value`                 | Realtime GA 协议的输入采样率小于 24000 | 客户端重采样到 24 kHz 及以上                              |
| `cannot_update_voice`                     | 会话已产生音频后又改音色                 | 首帧定死音色；要换请新开会话                                  |
| `Error append image before append audio.` | 百炼协议下先追加了图片                  | 先 `input_audio_buffer.append` 再追加图片帧            |
| WebSocket 1006 / 1011 异常断开                | 网络抖动或上游断连                    | 指数退避重连（1 秒 / 4 秒 / 16 秒），重连后重放 `session.update` |
| 连接静默约 5 分钟后断开                             | 百炼协议的空闲上限                    | 见「已知限制与规避」的保活方案                                 |

<Info>
  排查建议：记录每条事件的 `event_id` 与会话的 `session.id`，反馈问题时附上，能大幅缩短定位时间。另外 **Realtime GA 协议的错误对象带 `code` 与 `param` 字段**（会明确指出是哪个字段、支持哪些取值），百炼协议的错误信息相对粗一些，调试期优先在前者上验证字段写法。
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么这一页没有在线 Playground？">
    在线 Playground 由 OpenAPI 规格驱动，而 OpenAPI 描述的是「一次请求、一次响应」的 HTTP 交互。Realtime 是一条长连接上几十种事件双向来回跑，映射不过去。替代方案是本页「先用文本跑通」一节的文本冒烟脚本——不用麦克风、几十行代码就能确认链路是通的。
  </Accordion>

  <Accordion title="四个模型能只改 model 名互相替换吗？">
    **不能。** 端点和鉴权一样，但请求体字段和事件名分属两套协议。至少要改这几处：`modalities` ↔ `output_modalities`、`voice` ↔ `audio.output.voice`、`input_audio_format` ↔ `audio.input.format`、`turn_detection` ↔ `audio.input.turn_detection`、`input_audio_transcription` ↔ `audio.input.transcription`，以及 `response.text.delta` ↔ `response.output_text.delta`、`response.audio.delta` ↔ `response.output_audio.delta` 两个事件名。完整对照见下方「两套协议对照」一节。
  </Accordion>

  <Accordion title="握手就失败 / 连不上，怎么排查？">
    按顺序查五件事：① 协议是不是写成了 `https://`，应该是 `wss://`；② 端点有没有带 `?model=<模型名>`；③ `Authorization: Bearer <令牌>` 请求头有没有带上；④ 令牌分组是否包含该模型（四款都在默认分组；不匹配会返回 503 提示无可用渠道）；⑤ 中间有没有反向代理吃掉了 `Upgrade` 头——自建网关转发时这一点很常见。
  </Accordion>

  <Accordion title="浏览器能直连吗？令牌会不会泄露？">
    技术上能。本端点接受 `Sec-WebSocket-Protocol` 子协议形式的鉴权，浏览器 `WebSocket` 构造函数可以直接连上。但这**等于把令牌发给浏览器**，任何访问者都能从网络面板读到，**只建议用于本机验证**。生产环境请写一个后端中继：后端持有令牌并建立到 API易 的连接，前端只与你自己的服务通信。
  </Accordion>

  <Accordion title="给 gpt-realtime-2.1 传 16 kHz 音频报错？">
    Realtime GA 协议要求输入采样率 **≥ 24000**，传 16000 会报 `integer_below_min_value`。正确写法是 `"audio": {"input": {"format": {"type": "audio/pcm", "rate": 24000}}}`。阿里云百炼协议那两个模型则要求 16 kHz，两套不能混用。
  </Accordion>

  <Accordion title="没有麦克风 / 音频不好测，怎么办？">
    走本页「先用文本跑通」一节的三级自测阶梯：先纯文本验证链路（不产生音频 token），再用一段本地 wav 文件回放验证音频链路，最后才接实时麦克风。测试音频可以用 macOS 自带的 `say` + `afconvert` 一行生成，命令见该节。
  </Accordion>

  <Accordion title="发了 response.cancel 之后一直等不到 response.done？">
    这是阿里云百炼协议那两个模型目前的已知行为（6 次测试全部复现）：打断后会依次收到 `response.text.done`、`response.content_part.done`、`response.output_item.done`，但不再下发 `response.done`。**请改用 `response.output_item.done` 作为一轮结束的判据，并加超时兜底。** 会话本身不受影响，打断后可以继续正常对话。Realtime GA 协议那两个模型此处表现正常。
  </Accordion>

  <Accordion title="连接大约 5 分钟就断了？">
    阿里云百炼协议实测**空闲 300 秒**会被上游主动断开，而且 **WebSocket 层的 ping/pong 不算活动**——有心跳也续不了这个计时。解决办法：空闲期定时发一个应用层事件（例如一次 `session.update`）保活，或者接受断线并实现自动重连。重连后记得重放 `session.update` 与必要的上下文。
  </Accordion>

  <Accordion title="一个会话最长能开多久？">
    Realtime GA 协议的 `session.created` 事件里带 `expires_at` 字段，实测约为建连后 30 分钟，到期需要重连。阿里云百炼协议侧我们主要观测到的是空闲 300 秒断开这一约束。长通话请按「会话会到期」来设计，做好跨会话的上下文续接。
  </Accordion>

  <Accordion title="音色怎么设？为什么中途改音色报 cannot_update_voice？">
    音色在 `session.update` 里设：百炼协议是顶层 `voice`，Realtime GA 协议是 `audio.output.voice`。**一旦会话中已经产生过音频输出，就不能再改音色**，这是两套协议共有的限制，会报 `cannot_update_voice`。请在首帧就定死，要换音色请新开会话。另外百炼协议不要传空字符串音色，会触发 400。
  </Accordion>

  <Accordion title="手动 commit 模式下拿不到输入转写文本？">
    阿里云百炼协议的 `flash` 型号在手动 `commit` 模式下不会下发转写的完成事件（多次测试稳定复现），`plus` 型号正常，两者在 VAD 模式下都正常。**推荐改用 `server_vad` 或 `semantic_vad` 模式**。实测发现转写文本此时落在增量事件的一个未公开字段里，但该字段随时可能变化，**不建议依赖**。注意这只影响「在界面上回显用户说了什么」，不影响对话本身——模型对音频内容的理解与回答是正确的。
  </Accordion>

  <Accordion title="支持图片输入吗？为什么报 Error append image before append audio.？">
    四个模型都支持图片输入，但写法不同。Realtime GA 协议可以直接在消息里放 `input_image`；阿里云百炼协议把图片当作**视频帧**处理，必须先追加音频再追加图片，否则就会报这个错。实测做法是按约每秒一帧，把图片交织进音频分片序列里。
  </Accordion>

  <Accordion title="有 Prompt 缓存吗？怎么确认命中？">
    Realtime GA 协议那两个模型支持，且是自动生效的——实测同一会话内第二轮即命中，`usage` 的 `input_token_details.cached_tokens` 会有值（前缀 ≥ 1024 token、以 128 为粒度）。**注意站内目前对命中的缓存部分暂按文本输入全价计费**，修复后会在更新日志公告。阿里云百炼协议那两个模型目前未观察到缓存命中。
  </Accordion>

  <Accordion title="支持 WebRTC / SIP / 临时密钥（client_secrets）吗？">
    **不支持。** `POST /v1/realtime/client_secrets` 与 `POST /v1/realtime/calls` 在站内都返回 404，SIP 同样不可用，只有 `wss://api.apiyi.com/v1/realtime` 这一条 WebSocket 端点。浏览器或移动端场景请写一个后端中继：后端持有令牌并建立 WebSocket，前端只与你自己的服务通信。
  </Accordion>

  <Accordion title="gpt-realtime-2.1 的 reasoning.effort、noise_reduction 这些 GA 新字段能用吗？">
    能，实测全部原样透传并在 `session.updated` 里回显：`reasoning.effort`（`minimal` / `low` / `medium` / `high` / `xhigh`，两款都接受）、`audio.input.noise_reduction`、`audio.input.turn_detection.idle_timeout_ms`、`audio.input.transcription.model`（含 `gpt-realtime-whisper`）、`truncation`、`tracing`、`max_output_tokens`、`parallel_tool_calls`。字段语义以 OpenAI 官方参考为准，网关不做改写。
  </Accordion>

  <Accordion title="成本怎么估？文本和音频是分开算的吗？">
    `response.done` 事件的 `usage` 字段按模态分列返回（文本 / 音频 / 图片，输入输出各一组），可以据此归因；控制台调用日志的详情里也带同一份分模态 `usage`，每完成一轮 `response.done` 落一条记录。音频档位显著高于文本，所以联调期建议跑纯文本。**准确扣费请以[控制台调用日志](/api-capabilities/log-query)为准。**
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="API 使用手册" icon="book-open" href="/api-manual">
    令牌创建、Base URL、计费模式等通用调用规范。
  </Card>

  <Card title="令牌与分组管理" icon="key-round" href="/api-capabilities/token-management">
    令牌创建、分组勾选与额度控制。
  </Card>

  <Card title="调用日志查询" icon="receipt-text" href="/api-capabilities/log-query">
    查看每次调用的 token 用量与实际扣费。
  </Card>

  <Card title="模型价格总表" icon="table" href="/models">
    全站模型的实时价格、端点与分组。
  </Card>

  <Card title="充值加赠活动" icon="percent" href="/faq/recharge-promotions">
    叠加后实付更低。
  </Card>

  <Card title="企业微信客服" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    接入问题、并发扩容、文档缺漏，直接找到人。
  </Card>
</CardGroup>

<Info>
  四款 Realtime 模型均已正式上架（默认分组）。本页实测结论来自 2026-08-24 首测与 2026-09-14 复测 (UTC+8)，会随上游变化持续更新。有接入计划、遇到本页未覆盖的问题、或需要更高并发额度，欢迎联系 [hi@apiyi.com](mailto:hi@apiyi.com) / [feedback@apiyi.com](mailto:feedback@apiyi.com)。
</Info>
