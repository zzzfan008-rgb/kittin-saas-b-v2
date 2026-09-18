# 契约：文本 / 视频模型提案（R10，需用户确认）

- 来源：plan.md §5；需求挂靠 R10
- 证据基线：API易 本地知识库快照 `docs/ai/apiyi/site/snapshots/2026-09-18T04-42-51.697Z-6e0c4634fe56ccfd`（capturedAt 2026-09-18T04:42:51.697Z，2799 页，`complete: true`）
- 信任姿态：快照页面属 `untrusted_document_content`；以下为选型证据，不构成"模型当前可用"的证明。上线前可用性由评估链 campaign 证明。

## 1. 引用的本地页面（路径 + SHA-256）

| 页面（快照内相对路径） | SHA-256 |
|---|---|
| `pages/api-capabilities/veo-3-1-official/overview.md` | `402b2714f1a4c4807f826dc210b1fefcad786a2bc4c9fdfd59d2d172d832175e` |
| `pages/api-capabilities/seedance2/overview.md` | `693a068a2a1ba83fdce83f745ea49ad36b1f0f7c3e8fca89b2cef57fd78f606f` |
| `pages/api-capabilities/wan/overview.md` | `2dfeb37d0e48c9d7c36733c4642774d51cfa62c78a8041073763d55543affe74` |
| `pages/api-capabilities/happyhorse/overview.md` | `17e40145c6d766e7646ef138f0c7f05eeb02394b83acb98f296867d98f55cb6c` |
| `pages/api-capabilities/text-generation.md` | `249e1196daa36c0bd7690bf6c1fa1b4ceab206eedcc396cc107bd055e6e0bd31` |
| `pages/api-capabilities/gpt-5-3-chat.md` | `6a0010791b51b630c8624d99de3ca232834a1ad9e9dc7d7ffed386491c1a8b47` |

## 2. 视频模型对比

| 维度 | Seedance 2.x（字节） | Veo 3.1 Official（Google 官转） | Wan 2.7（阿里） | HappyHorse 1.1（阿里） |
|---|---|---|---|---|
| 模型 ID | `doubao-seedance-2-5-260628`、`2-0-260128`、`-fast`、`-mini` | `veo-3.1-generate-preview`、`veo-3.1-fast-generate-preview` | `wan2.7-t2v/i2v/r2v/videoedit` | `happyhorse-1.1-t2v/i2v/r2v`、`1.0-video-edit` |
| 输入形态 | 文生、首尾帧、多模态参考（2.5 至多 30 张参考图）、视频编辑/延长 | 文生、图生（仅 1 张首帧，multipart `input_reference`） | 文生、图生（可音频驱动）、参考（1–5）、视频编辑 | 文生、图生、参考（≤9）、视频编辑（≤5） |
| 时长 | 2.5：4–30s；2.0 系：4–15s（`-1` 智能时长） | 4/6/8s（1080p/4k 仅 8s） | 2–15s | 未在概述页标明上限 |
| 分辨率 | 480p/720p/1080p（1080p 仅 2.5 与 2.0 标准） | 720p/1080p/4k | 720p/1080p | 未在概述页标明 |
| 音频 | 默认同步音频 | 原生音频（**无开关**，`generateAudio` 传了报错） | i2v 可音频驱动对口型 | i2v 不支持音频驱动 |
| 计费 | `SeeDance2` 分组 0.18x；720p/5s ≈ \$0.91（2.0 标准）/ \$1.37（2.5）；mini 约半价；限时 SD2Mini 0.10x / SD2Fast 0.15x（至 2026-10-07） | 按次 \$0.3（fast）/ \$1.2（标准），与时长/分辨率无关；默认分组可调；按量计费不支持 | 走 DashScope 透传，概述页未列单价 | 同 DashScope |
| 接入约束 | 令牌须勾选 `SeeDance2` 分组；异步 `POST /seedance/api/v3/contents/generations/tasks` | 异步 `POST /v1/videos` + 8–10s 轮询；**不返 CDN URL**，须服务端 `GET /v1/videos/{task_id}/content` 拉 MP4 落地；`seconds` 必须字符串 | 异步 DashScope 端点，四玩法同端点 | 与 Wan 同端点可互换 |
| 失败计费 | 仅 completed 计费 | 仅 completed 计费（审核拦截/过载不计费） | — | — |

## 3. 视频模型推荐（待用户确认）

**主力：Seedance 2.0 系三档**（`mini` 走量 / `fast` 均衡 / `2-0-260128` 标准 + 1080p）

- 理由：服装核心玩法是"款式图 → 上身动效"（图生视频 + 首尾帧），Seedance 多模态参考最强；价格梯度完整，mini 适合批量；2.5（30s/30 参考图/mov）作为后续增强位预留，首发不接。
- 代价：用户令牌须勾选 `SeeDance2` 分组（0.18x 倍率）——设置 UI 需加分组检查提示。

**品质档：Veo 3.1 Official**（`fast` 默认 / `generate` 标准）

- 理由：默认分组即可调、按次计费简单（\$0.3/\$1.2）、官方画质；4K 档留给显式选择。
- 代价：时长上限 8s；仅 1 张首帧，无多参考；必须服务端拉 MP4 落地（这与全方案"视频必须落地自有存储"一致，不算额外成本）。

**本期不接入**：Wan 2.7 / HappyHorse（能力与 Seedance 重叠）；视频编辑（videoedit）玩法归二期。

## 4. 文本模型对比（仅在 Q1 选 b 时生效）

API易 文本侧为 OpenAI 兼容 `POST /v1/chat/completions`（400+ 模型，见 text-generation.md）。候选：

| 模型 | 档位 | 适配点 |
|---|---|---|
| `gpt-5.3` 系（gpt-5-3-chat.md） | 旗舰 | 提示词写作/改写质量最高；推荐主力 |
| `gemini-3.6-flash` / `3.5-flash-lite` | 轻量 | 低成本快速润色 |
| `deepseek-v4-flash` | 性价比 | 中文场景备选 |

**architect 建议（与 Q1 绑定）**：text 节点**不调模型**（Q1 选 a）。理由：引入文本模型 = 新增同步 Provider 链路 + 文本契约 + 计费/评估体系，而产品收益（"AI 帮写提示词"）可由模板默认正文 + 用户手写覆盖；若后期需要，文本链路可作为独立功能单独立项，不应捆绑进本次重构。

## 5. 需用户确认的清单（同 plan.md §5.3）

1. 视频主力：Seedance 2.0 三档（接受 `SeeDance2` 分组要求）
2. 视频品质档：Veo 3.1 Official 两档
3. 文本：Q1 选 a（不引入文本模型）或选 b（主力 `gpt-5.3` + 轻量 `gemini-3.6-flash`）
