# API易图片模型本地知识库

最后契约复核：2026-09-03

本目录是 garment-canvas **经审查、主动收窄后的实现契约**，也是运行时的契约来源
（`src/types/*Models.ts` 直接 import 这里的 JSON）。任何文件都不保存 API Key、用户提示词或用户图片内容。

> **2026-10-29 变更（用户拍板 A：精简）**
> - 删除 `site/` API易 全站快照（128 MB / 8,441 文件）：网关已迁至兔子API，快照不再被任何代码读取。
> - 取消 consultation receipt 凭证门（`scripts/apiyi-kb.mjs`、`scripts/lib/apiyi-knowledge-base.mjs`
>   及其测试一并删除，npm `docs:apiyi:kb:*` / `docs:apiyi:search` / `docs:apiyi:lookup` /
>   `docs:apiyi:guard` 移除）。`consultations/` 保留为历史记录，不再被校验。
> - **保留**结构门 `npm run docs:apiyi:check`（CI 每个 PR 都跑）：校验契约 JSON 一致性、
>   模型集合、`product ⊆ gateway` 与 `contractHash`。它与供应商无关，守的是运行时契约完整性。

## 本轮模型范围

| 模型 | 产品用途 | 可用节点 |
| --- | --- | --- |
| gpt-image-2 | OpenAI 官转蒙版编辑；最多 7 张用户图 + 1 张系统引导图 | 仅“局部修改”节点 |
| gpt-image-2-vip | 通用生成与参考图编辑 | 图片生成节点 |
| gemini-3.1-flash-image | 通用生成与多图编辑 | 图片生成节点 |
| flux-2-pro | 通用生成与最多 8 图融合 | 图片生成节点 |
| seedream-5-0-260128 | 通用生成与最多 8 图融合 | 图片生成节点 |

产品范围比上游能力更窄时，以本表为准。尤其是 gpt-image-2：上游也支持文生图和普通编辑，但本项目只能由局部修改节点调用。
原 `grok-imagine-image` 已从现役产品范围退役，不再出现于新建节点、Provider 契约或当前评估计划。旧项目中的该 ID 只允许为历史数据读取；重新运行、评估或发送 Provider 请求必须失败关闭，且不得静默替换成其他模型。

## 文件说明

- **model-contracts.json**：实现与测试读取的机器可读契约。
- **model-knowledge.json**：五个现役模型的厂商能力、网关契约、产品策略和实测证据四层记录。
- **async-runtime.md**：业务异步队列、重试、恢复和结果转存规则。
- **input-image-normalization.md**：用户上传素材进入节点和生成队列前的标准化硬门禁。
- **models/**：每个模型的人工可读适配说明。
- **sources.json**：上游 canonical URL、官方 Markdown URL、抓取日期、SHA-256 指纹以及对应的本地整理文档。
- **consultations/**：历史决策凭证（2026-10-29 起不再由门禁校验，仅作审计留存）。
- **evidence/**：脱敏的网关目录、探针事实和人工复核摘要；目录存在只证明配置令牌的观测视图，不等于端点生成通过。
- **change-scope.json**：哪些路径必须先经过本地知识库门禁。
- **project-guidance.json**：已经采用、建议后续处理和需要用户选择的文档建议。

`models/`、`async-runtime.md`、`model-contracts.json` 是经过项目范围收窄后的生产知识层；实现与测试只依赖这些经审查契约。上游原文已不再随仓库保存，引用上游时给 `sources.json` 里的 canonical URL + Markdown URL。

## 改契约前必须过的门

```bash
# 结构门（CI 每个 PR 都跑；离线、无付费调用）
npm run docs:apiyi:check -- --offline
```

它校验：契约 JSON 结构、模型集合、`product ⊆ gateway`、以及每个模型的 `contractHash`
是否与当前语义信封一致。改 `model-contracts.json` / `model-knowledge.json` 后必须重算 hash，
否则 provider 契约测试与 CI 会红。

改契约的纪律（不再有凭证门，但仍是要求）：
- 先看 `models/<sourceId>.md` 与 `sources.json` 的指纹，再动契约；
- 存在多个会实质影响费用、质量、安全、兼容性或产品行为的选项时，先列 2–3 个选项及影响让用户拍板；
- 改完同步 `model-knowledge.json`（同一模型两份文件必须逐项相等）。

## 四层证据边界

1. `vendorCapability` 只记录五个现役模型对应的 OpenAI、Google、BFL 和 BytePlus 官方能力与提示词方法。
2. `gatewayContract` 记录 API易实际接受的模型 ID、端点、字段、限制和错误语义，是调用层事实。
3. `productPolicy` 是 Garment Canvas 的主动收窄。`scripts/apiyi-docs.mjs` 会验证引用数、模式和节点不超出网关契约。
4. `observedEvidence` 只接受可追溯真实探针。文档、历史浏览器成功或失败都不能直接成为当前通过证据。

API易与厂商文档冲突时，请求仍按 `gatewayContract` 构造，同时将组合降为 `unverified` 等待真实探针。GPT Image 2 VIP 是 API易特有线路，没有可以替代它的 OpenAI 厂商契约。

## 漂移检查与受审刷新

```bash
# 无网络、无付费调用：验证 JSON 结构、五模型集合和 product ⊆ gateway
node scripts/apiyi-docs.mjs check --offline

# 只读抓取公开 Markdown 页面并核对 SHA-256；发现漂移时非零退出
node scripts/apiyi-docs.mjs check --model-list /path/to/current-apiyi-v1-models.json

# 只生成候选语义差异报告，绝不改写 sources.json 或 model-contracts.json
node scripts/apiyi-docs.mjs refresh --out docs/ai/apiyi/candidates/apiyi-refresh.json

# 可选：将经授权导出的 /v1/models JSON 纳入只读核对
node scripts/apiyi-docs.mjs check --offline --model-list /path/to/reviewed-model-list.json
```

不带 `--offline` 的发布检查必须同时取得 API易 `/v1/models` 的只读导出（也可通过 `APIYI_MODELS_EXPORT` 指定路径），并与 `sources.json` 中经人工确认的模型目录指纹匹配。保留的 2026-09-02 和早期 2026-09-03 探针分别记录 272 与 269 个规范化唯一模型 ID；按当时六模型范围计算均精确命中 5 个，`grok-imagine-image` 连续缺失。这些数值和当时的阻断结论是不可改写的历史事实，分别保存在 `evidence/2026-09-02-model-catalog-probe.json`、`evidence/2026-09-03-model-catalog-probe.json` 和 `reviews/2026-09-03-model-catalog-drift.md`。

自 `reviews/2026-09-03-five-model-scope.md` 的范围决策起，退役 ID 的缺失不再是当前五模型范围的阻断条件。当前人工复核导出捕获于 `2026-09-03T13:22:48.000Z`：认证 `GET /v1/models` 返回 HTTP 200，原始响应为 61,774 字节，原始文件 SHA-256 为 `7d5348336bbe5ac63a34107a506e3c5c72340064608c11193602df65c4327408`，包含 271 个规范化唯一 ID，五个现役 ID 精确覆盖 5/5；其 `sha256-canonical-model-id-set-v1` 指纹为 `43b6914c1328f07599468e9129d18ba7966293cf73144b4a722c9494a2c8636d`。这次目录相对先前 269-ID 记录发生漂移，旧证据仍保留为历史事实；当前记录见 `evidence/2026-09-03-manual-model-catalog-review.json` 和 `reviews/2026-09-03-manual-model-catalog-review.md`。完整原始文件仍在 Git 工作树外，contract check 必须取得其精确字节并重算两层哈希；仓库内摘要不能代替原始文件。

目录基线批准只关闭这一项前置阻断。五个模型的 `observedEvidence.status` 仍为 `unverified`，目录存在不证明生成、编辑、质量或计费；在评估证据、阶段 gate、promotion、registry 与干净 exact-SHA 门禁全部完成前，不得声称可发布。`--offline` 只证明结构与契约哈希自洽，不是发布通过证据。

`refresh` 的输出会列出旧/新哈希、HTTP 元数据和受影响的语义声明。人工复核并明确修改本地契约后，才可更新生产基线并重新评估。模型 ID、渠道、文档哈希或契约变化时，相关组合必须降为 `unverified`。

## 实现约束

1. API易图片接口本身均为同步长请求，不存在可轮询的上游 task_id。项目异步能力必须由 PostgreSQL 任务表和 Worker 提供。
2. 节点必须显式保存模型 ID；服务端不得用全局模型开关覆盖单个节点的选择。
3. 所有模型参数先在本地严格校验。不得依赖上游的静默回退或静默忽略行为。
4. 仅明确的 HTTP 429 和可重试 503 最多自动重试 3 次，退避为 5/30/120 秒并加入小幅随机抖动。连接超时、连接重置、响应中断等结果不确定场景标记为 outcome_unknown，不自动重放，避免重复计费。
5. URL 输出必须由 Worker 立即下载到项目自有存储，再写入历史记录。前端不得长期依赖第三方临时 URL。
6. 自动化测试只能使用假 Provider，不得调用任何付费模型。
7. 保持现有鉴权、项目归属、素材归属、最多 8 张产品引用图及无拉伸缩放规则。GPT Image 2 蒙版轨道取 7 张用户图并预留 1 张系统引导图。
8. 产品模型 ID 与上游请求模型 ID 分开保存。请求 URL 和请求体只能读取 `model-contracts.json` 的 `upstreamModelId`，不得假设二者永久相同。
9. 用户上传图片必须先完成 `inputNormalization` 契约并落盘，接口返回 `normalized: true` 后前端才能写入节点。原始上传字节不得直接传给模型。
10. API易同步长请求必须使用专属 Undici Agent 的 connect/headers/body 分阶段超时，并继续保留逐模型总超时；不得修改全局 dispatcher。
11. 尾部 JSON 恢复只接受无 `Content-Length`、至少 1KiB、静默宽限期后可严格解析的完整对象。截断、超限和连接错误仍为 outcome_unknown，且任何路径都不得在 Provider 层重放。

## 文档优先级

发生冲突时按以下顺序处理：

1. `gatewayContract`：`sources.json` 对应的 API易模型页面。
2. `productPolicy`：本目录与产品代码明确收窄的范围和安全约束。
3. `vendorCapability`：厂商官方文档，用于交叉检查而不是改写 API易请求。
4. API易通用图片最佳实践。
5. 历史接入文档。

docs/ai/gpt-image-2-lmu.md 描述的是灵眸网关，已被本目录取代，不得用于 API易实现。
