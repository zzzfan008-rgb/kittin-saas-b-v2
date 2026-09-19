# 契约：文本 / 视频模型提案（R10；2026-09-19 用户最终裁定已落地）

- 来源：plan.md §5；需求挂靠 R10
- 证据基线：API易 本地知识库快照 `docs/ai/apiyi/site/snapshots/2026-09-18T04-42-51.697Z-6e0c4634fe56ccfd`（capturedAt 2026-09-18T04:42:51.697Z，2799 页，`complete: true`）
- 信任姿态：快照页面属 `untrusted_document_content`；以下为选型证据，不构成"模型当前可用"的证明。上线前可用性由评估链 campaign 证明。
- v2：Q1=B 已裁定 text 节点引入文本模型链路，§4 从"若需要"转正为正式提案；文本与视频选型一并交用户确认（§5）。
- **v3（R10 最终裁定，2026-09-19，orchestrator 中继用户原话）**：§6 落地最终裁定。**原 §3/§4/§5 的推荐提案全部作废**（gpt-5.3 系 / gemini-3.6-flash / deepseek-v4-flash / Seedance 2.0 三档 / Veo 3.1 品质档 / SeeDance2 分组令牌要求），仅保留 §1/§2 作为历史选型对比证据。

## 1. 引用的本地页面（路径 + SHA-256）

历史提案（v2，已被 R10 最终裁定取代）引用的页面：

| 页面（快照内相对路径） | SHA-256 |
|---|---|
| `pages/api-capabilities/veo-3-1-official/overview.md` | `402b2714f1a4c4807f826dc210b1fefcad786a2bc4c9fdfd59d2d172d832175e` |
| `pages/api-capabilities/seedance2/overview.md` | `693a068a2a1ba83fdce83f745ea49ad36b1f0f7c3e8fca89b2cef57fd78f606f` |
| `pages/api-capabilities/wan/overview.md` | `2dfeb37d0e48c9d7c36733c4642774d51cfa62c78a8041073763d55543affe74` |
| `pages/api-capabilities/happyhorse/overview.md` | `17e40145c6d766e7646ef138f0c7f05eeb02394b83acb98f296867d98f55cb6c` |
| `pages/api-capabilities/text-generation.md` | `249e1196daa36c0bd7690bf6c1fa1b4ceab206eedcc396cc107bd055e6e0bd31` |
| `pages/api-capabilities/gpt-5-3-chat.md` | `6a0010791b51b630c8624d99de3ca232834a1ad9e9dc7d7ffed386491c1a8b47` |

R10 最终裁定（2026-09-19）四个实名的核实页（`npm run docs:apiyi:kb:check` 通过后逐页核实）：

| 实名 | 核实页（快照内相对路径） | SHA-256 | 核实内容 |
|---|---|---|---|
| `gpt-4o` | `pages/models.md` | `33100d3f0d97e8282bc1b1489472568dc1285d0642a5d79e4cdc0907859f00ed` | 计费目录登记 `"n": "gpt-4o"`（另有 `-2024-05-13`/`-2024-08-06`/`-2024-11-20` 快照变体） |
| `claude-sonnet-4-5` | `pages/models.md` | `33100d3f0d97e8282bc1b1489472568dc1285d0642a5d79e4cdc0907859f00ed` | 计费目录登记横线族：`claude-sonnet-4-5-20250929`、`claude-sonnet-4-5-20250929-thinking`；纯 `claude-sonnet-4-5` 见 `pages/scenarios/chat/chathub.md`（SHA-256 `9da7ec41696442a10207f936443bffdc9dabd9e8300c6ed0452b4bcaeccb9a3b`） |
| `gemini-3-pro-preview` | `pages/news/gemini-3-pro-preview-launch.md` | `d1e30e09c27a7a98cd2cb62a5a728f4340e9caf79f3686cf71f5cef809564eb8` | 上线记录；另 `pages/api-capabilities/text-generation.md` 示例 `model="gemini-3-pro-preview"`、`pages/api-capabilities/gemini/native.md` 计费表 `$1.80/$10.80` |
| `doubao-seedance-2-5-260628` | `pages/api-capabilities/seedance2/overview.md` | `693a068a2a1ba83fdce83f745ea49ad36b1f0f7c3e8fca89b2cef57fd78f606f` | 2.5 新版（2026-08-28 上线）：4–30s、参考图 30 张、1080p、mov；`SeeDance2` 分组 0.18x |

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

## 4. 文本模型对比（Q1=B 已裁定引入）

API易 文本侧为 OpenAI 兼容 `POST /v1/chat/completions`（400+ 模型，见 text-generation.md）。候选：

| 模型 | 档位 | 适配点 |
|---|---|---|
| `gpt-5.3` 系（gpt-5-3-chat.md） | 旗舰 | 提示词写作/改写质量最高；推荐主力 |
| `gemini-3.6-flash` / `3.5-flash-lite` | 轻量 | 低成本快速润色；推荐轻量档 |
| `deepseek-v4-flash` | 性价比 | 中文场景备选 |

**接入形态**（Q1=B 已裁定引入，本条确认选型）：同步调用（HTTP 请求内完成），计费按 prompt/completion token 复用 `usage_events` 骨架；变体准入走同一 `promptRunAdmission`；契约产物进 `model-contracts.json` 新增 `textModels` 区块（contracts/data-model.md §5b）。

**推荐**：主力 `gpt-5.3` + 轻量 `gemini-3.6-flash`；`deepseek-v4-flash` 备选。

## 5. 需用户确认的清单（同 plan.md §5.3）——已被 R10 最终裁定取代

> 以下 v2 提案清单于 2026-09-19 由用户最终裁定取代，裁定结果见 §6。保留原文仅作历史记录。

1. 文本主力 `gpt-5.3` + 轻量 `gemini-3.6-flash`（Q1=B 已裁定引入，本条确认选型）
2. 视频主力：Seedance 2.0 三档（接受 `SeeDance2` 分组要求）
3. 视频品质档：Veo 3.1 Official 两档

## 6. R10 最终裁定（2026-09-19，用户拍板，orchestrator 中继）

**文本模型（3 个，`gpt-4o` 为默认/主力）**：

- `gpt-4o` ← **默认**（用户原话「gimini-4o」经确认是笔误，实名以知识库 `gpt-4o` 为准）
- `claude-sonnet-4-5`（横线形式）
- `gemini-3-pro-preview`
- ⚠️ 原 P2-a 落地的 `gpt-5.3-chat-latest` / `gemini-3.6-flash` / `deepseek-v4-flash-ga-260731` **作废**，按上述三个替换。

**视频模型：只要 `doubao-seedance-2-5-260628`**——原提案的品质档（Veo 3.1）**取消**，`veo-3.1-*` 从清单移除；Seedance 2.0 三档同时移除。

**令牌变更**：用户已**新建专用令牌**调用 Seedance → 原「需勾选 SeeDance2 分组（0.18x）」的运营动作**取消**；方案/契约改为「支持配置专用令牌」（具体配置形态归 P2-e）。

**待确认项（诚实登记，不假设填坑）**：`claude-sonnet-4-5` 横线形式在知识库计费目录（models.md）中登记的条目是 `claude-sonnet-4-5-20250929` 与 `-thinking` 变体；纯横线形式仅见于 chathub 场景页示例。按用户裁定落横线形式；实际可调性（网关是否接受无日期后缀 ID）由 P2-b Provider 联调与评估链 campaign 证明，文档不预设结论。
