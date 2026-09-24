# Evaluation Campaign 规格：v8 内置模板放行

**目标**：让 15 个内置模板的功能节点不再提示「未完成评估不可用」，用户可正常发起付费生成。

**合规依据**：AGENTS.md §4 — 每次付费调用必须绑定封闭 campaign + 精确 slot + 输入 hash + 预算上限。

**执行前提**：本规格经用户确认预算后，backend 方可执行；执行前 architect 再向用户要一次显式付费授权。

---

## 1. 待评变体清单（从模板实际引用推导，backend 需枚举断言）

15 个内置模板（`server/routes/templates.ts`）实际引用的变体常量：

| 变体 ID | 绑定模板数 | 用途 |
|---|---|---|
| `fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1` | 13 | 编辑类：模特试穿、摆拍、换背景、LookBook、数字模特、印花提取、印花裂变、换色、面料更换、线稿渲染、改款、转人台 |
| `fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1` | 1 | 生成类：穿搭推荐 |
| `video-animate.doubao-seedance-2-5-260628.edit.v1` | 2 | 视频：走秀视频、小红书视频 |

**机检断言（2026-09-23 修订：定义为运行时断言，不可静态 grep）**：模板调用点绑定的是
`EDIT_VARIANT` 等**常量引用**而非字面量（templates.ts:55-57 定义、:163-446 调用），静态 grep
字面量抓不到调用点。正确形式：runner `seal` 前调用**导出函数 `builtinTemplates()`**
（templates.ts:147）运行时遍历全部 `WorkflowTemplate.flow.nodes`，收集
`data.promptVariantId` 全集，断言 ⊆ {2 个图像变体} ∪ {视频变体（标记 out-of-scope，§7.5）}；
发现清单外变体即拒绝 seal（fail-closed，退出非零）。该断言随模板演化自动失效重跑，
不存在「grep 口径漂移」问题。

**实现口径统一（backend 已按此实证 PASS 15/15，2026-09-23）**：断言实现**直接读节点的
`data.promptVariantId` 字段**——该字段由 `imageGeneratorNode`/`videoGeneratorNode` 两个 helper
从变体常量静态写入（templates.ts:103/:135），且 17 个生成节点调用点全部经由这两个 helper
（仓库内 `kind: "image-generator"` / `kind: "video-generator"` 各只出现 1 次，即 helper 内部；
无绕过路径），前端准入同样直接读该字段（promptRunAdmission.ts:314）。
**不要在断言里用 modelId + operationMode + promptFamily 重新推导 variantId**——variantId 的
命名确实由这三元组构成，但推导逻辑与字段写入逻辑是两处代码，重新推导会引入命名约定漂移风险；
读字段 = 读单一事实来源。backend 的运行时验证结果（edit.v1→13 模板 / generate.v1→1 模板 /
video edit.v1→2 模板，0 越界）与本节 §1 表格逐条一致，作为断言正确性的基线证据记录在案。

## 2. 模型范围（五模型契约）

| 类型 | 模型 ID | 来源 |
|---|---|---|
| 图像（标准） | `gpt-image-2.5-flare-vip` | `STANDARD_IMAGE_MODEL_IDS[0]`，模板默认 |
| 图像（备选） | `gemini-3.1-flash-image`、`flux-2-pro`、`seedream-5-0-260128` | `STANDARD_IMAGE_MODEL_IDS[1..3]` |
| 视频 | `doubao-seedance-2-5-260628` | `DEFAULT_VIDEO_MODEL_ID` |

**已拍板（2026-09-23 用户决策）**：只评模板默认模型——`gpt-image-2.5-flare-vip`（图像）+ `doubao-seedance-2-5-260628`（视频）。其余三个标准图像模型（`gemini-3.1-flash-image`、`flux-2-pro`、`seedream-5-0-260128`）**不在本次 campaign 范围内**，用户换用这些模型时节点仍会提示「未完成评估」，属已知边界、非缺陷。

## 3. Campaign 结构（stage 顺序）

复用 `server/lib/evaluationCampaign.ts` 的三阶段：

```
provider-probe → internal-experiment → formal-validation
```

| Stage | 目的 | 输入 | 放行判据 |
|---|---|---|---|
| provider-probe | 验证模型可用、参数合法 | 每变体 × 每模型 1 次 dry-run | 返回 200，无参数错误 |
| internal-experiment | 验证提示词在目标模型上的输出质量 | 每变体 × 每模型 3 组 case（case 从模板预置输入派生） | 人工抽检通过率 ≥ 2/3 |
| formal-validation | 封闭 campaign，生成放行证据 | 每变体 × 每模型 1 次正式调用（绑定 slot + 输入 hash） | 成功返回 + 证据 hash 上链 |

## 4. Case/Sample 绑定

- **Case 来源**：15 模板各自的预置输入（文本节点的默认提示词 + 预置图片节点的占位图）。
- **Sample 来源**：每 case 取 1 个 sample（batchSize=1 的模板）或 2 个 sample（batchSize=2 的模板：LookBook、印花裂变）。
- **输入 hash**：case 的文本 + 图片引用 + 参数对象做 SHA-256，作为 slot 绑定键。

**机检断言**：每 slot 的输入 hash 必须等于 `sha256(case.text + case.imageRefs + case.params)`，防止 backend 执行时篡改输入。

## 5. 预算上限（常量，fail-closed）

| 项 | 数值 | 说明 |
|---|---|---|
| 单变体单模型最大请求数 | 8 | `MAX_PROVIDER_REQUESTS = 8`（`evaluationCampaign.ts` 已定义） |
| 单 stage 最大请求数 | 待确认 | 建议 ≤ 变体数 × 模型数 × 2（含重试） |
| 总预算上限（USD） | **$50**（已拍板） | 累计扣费达到 $50 即 fail-closed，不再发起新请求 |
| 单请求最大 token | 待确认 | 建议 ≤ 4096（图像生成）/ 8192（视频） |

**预算已拍板**：总预算上限 $50（用户 2026-09-23 确认）。单 stage 上限与单请求 token 上限由 backend 在执行时按 `evaluationCampaign.ts` 的默认值落实，超出即 fail-closed。

## 6. 放行判据

- `formal-validation` 全部 slot 成功关闭；
- 证据链完整：每 slot 的 case/sample/输入 hash/返回 hash/扣费记录五元组上链；
- `evaluationReleaseRegistry` 中对应变体的 `supportStatus` 从 `unverified` 翻转为 `verified`；
- 前端 `GeneratorParamsPanel.tsx:429` 的「未完成评估」提示消失（机检：断言该文案不再出现在渲染结果中）。

## 7. 执行入口（2026-09-23 修订版 —— 原 §7 引用的 CLI 参数在代码里全部不存在，本节按真实代码重写）

### 7.0 裁决：方案 A（CLI 桥接脚本）

**裁决理由**（architect，2026-09-23）：
- 方案 B（新增服务端 HTTP API）会扩大公开 API 面（鉴权、限流、审查负担），而**付费评估执行通路已经存在**：
  `POST /api/run-plan` 接受 evaluation policy（`server/routes/runPlan.ts:198-270`），由
  `ENABLE_PAID_EVALUATION_RUNS=true` 部署开关 + admin 角色 + 持久化授权四元组把门
  （`server/lib/evaluationRunPolicy.ts:parseEvaluationRunPolicy`）。不需要任何新路由。
- 真实缺口只有两个：① `createSealedEvaluationCampaign`（`server/lib/evaluationCampaign.ts:405`）
  **全仓库没有任何调用方**——seal 无入口；② 没有把 authorize → run-plan → evidence → gate
  串起来的编排器。两者都能落进一个脚本，不碰任何共享契约。

**新增文件**：`scripts/evaluation-campaign-runner.ts`。子命令：`prepare`、`seal`、`execute`。

### 7.1a `prepare` —— 物化 slot hash（capture，零付费，幂等）

```bash
npx tsx scripts/evaluation-campaign-runner.ts prepare \
  --variant-id <variantId> --code-sha <git-sha> --out <slots.materialized.json>
```

- 按 §7.7 子集选择器过滤出恰好 2 个 unit（沿用 §7.7 枚举断言，禁止回退全量）。
- 对每 unit × 每 stage × 每 slot，用 capture 模式（`executeStep` + `captureProvider` +
  `beforeProviderCall` 抛错拦请求）调用 `buildEvaluationCaseSnapshotFromRuntime` +
  `campaignRuntimeBinding`，产生 `resolvedPromptSha256` / `nativeParametersSha256` /
  `referenceInputsSha256`，**全程零 Provider 调用**。
- **`campaignRuntimeBinding` 是唯一计算函数**（`server/lib/evaluationEvidenceStore.ts:247`，
  `export function`）：本文 §7.3 要求的 `seal` 与 `execute` 必须共用此函数，不得另写一份实现。
- 输出 `slots.materialized.json`，含 §7.1 seal 输入所需的全部 hash 字段。
- **幂等要求**：连跑两次，同一 slot 的 3 个 hash 必须逐字节相同（prompt 解析确定性已在
  架构裁决中验证——全 `server/**/*prompt*` grep 命中 0 个非确定性源）。

### 7.1b `seal` —— 封存 campaign（消费 prepare 物化的 slots）

```bash
npx tsx scripts/evaluation-campaign-runner.ts seal \
  --admin-id <uuid> --campaign-id <id> \
  --stage <provider-probe|internal-experiment|formal-validation> \
  --model-id gpt-image-2.5-flare-vip --variant-id <variantId> \
  --code-sha <git-sha> --slots <slots.json> \
  --max-provider-requests <N> --budget-limit-minor <N> --currency USD
```

- **范围收敛强制**：`--variant-id` 只接受 §7.7 锁定集合内的值；slot 枚举、枚举断言与
  seal 期预算断言（Σbudget ≤ 5000 minor）按 §7.7 执行，任何「过滤不到回退全量」的逻辑被禁止。

- 直接调用 `createSealedEvaluationCampaign(client, actor, manifest)`；actor 必须是**持久化的 active admin**（库内已强制，:412/:424-429）。
- **一个 campaign 只绑一个 (stage, modelId, authorizationUnitKey)**（manifest 结构决定，:49-60）。
  → 本次范围 = 2 个图像变体 × 3 个 stage = **6 个 campaign**，campaignId 建议
  `v8rel-<variant短名>-<stage>`。
- `slots.json` 每 slot：`caseId / sampleId / resolvedPromptSha256 / nativeParametersSha256 /
  referenceInputsSha256 / requestedImageCount / maxProviderRequests /
  priceMinorPerProviderRequest / budgetLimitMinor`（= `EvaluationCampaignSlotManifest`，:36-47）。
- **hash 由 prepare 子命令产出，seal 不得另设计算分支或手填全零**：
  `reserveEvaluationCampaignProviderRequest` 逐字段比对 sealed slot 值与执行期
  `campaignRuntimeBinding` 输出（`evaluationCampaign.ts:537-547`），任一 hash 漂移 = 硬失败。
  seal 侧对 `resolvedPromptSha256` / `nativeParametersSha256` / `referenceInputsSha256`
  施加**退化断言**（regex `/^(.)\1{63}$/` 拒绝全零/全同字符）——强制消费 prepare 的真实产出。
- `authorizationUnitKey` = `sha256:${promptEvaluationUnitKey(unit)}`（`src/lib/promptEvaluation.ts:110`），
  三个 stage 必须使用**同一个 key**（gate 链校验，`evaluationPromotion.ts:349-358`）。

### 7.2 `authorize` —— per-slot 授权（复用现有 CLI，零新代码）

```bash
npx tsx scripts/evaluation-authorize.ts --admin-id <uuid> --owner-id <uuid> \
  --campaign-id <id> --slot-id <id> --model-id gpt-image-2.5-flare-vip \
  --evaluation-unit-key sha256:<...> --max-provider-requests <N> \
  --price-minor-per-provider-request <N> --max-budget-minor <N> \
  --currency USD --expires-at <ISO> --reason "<audit>"
```

- `registerEvaluationRunAuthorization` 内部完成 `lockEvaluationCampaignSlotForRunAuthorization`
  + `bindEvaluationCampaignSlotToRun`（`evaluationAuthorizationLedger.ts:324/:373`）——每 slot 一次性，重复授权硬失败。
- 支持 `--dry-run` 本地校验参数形状（不落库）。

### 7.3 `execute` —— 驱动付费运行（runner 第二个子命令）

```bash
npx tsx scripts/evaluation-campaign-runner.ts execute \
  --campaign-id <id> [--slot-id <id>] [--dry-run]
```

**前置条件（runner 强制，缺一即 fail-closed 退出非零）**：
1. `ENABLE_PAID_EVALUATION_RUNS=true`（环境变量，部署级开关）；
2. admin 会话凭证（runner 走 `POST /api/run-plan`，与生产同一入口、同一套闸）；
3. **预算闸**：发起每个新请求前查询 campaign 累计 `reserved_budget_minor`，
   `reserved + price > budget_limit_minor` 即拒绝发起（DB 事务内
   `reserveEvaluationCampaignProviderRequest:556-563` 是第二道同语义硬闸，双保险）；
4. **全局 $50 闸**：runner 维护跨 campaign 累计（6 个 campaign 的 reserved 之和，USD minor ≤ 5000），超限即停。

**行为**：对每个已授权未执行的 slot → `POST /api/run-plan`（evaluation policy =
`{caseId, sampleId, authorizationId, campaignId, slotId}`，runPlan.ts:198-270 原样消费）→
轮询 run 至终态 → evidence 由 `evaluationEvidenceStore` 自动落账（reserve + case evidence，:298）。

**中止语义**：任何 slot outcome ≠ `succeeded` → `finalizeEvaluationCampaignSlot` 已把 campaign
置 `stopped`（evaluationCampaign.ts:610-615）；runner 检测到 stopped 立即退出非零，**不跑后续 slot、不跑后续 stage**。

**约束：seal 与 execute 必须共用 `campaignRuntimeBinding`**（`server/lib/evaluationEvidenceStore.ts:247`，
`export function`）。seal 侧禁止另写一份 hash 计算实现——两者的 `resolvedPromptSha256` /
`nativeParametersSha256` / `referenceInputsSha256` 必须来自同一函数，这是 reserve 逐字段比对
（`evaluationCampaign.ts:537-547`）能通过的唯一保证。

### 7.4 score / gate / promote —— 复用现有 `evaluation-review.ts`（零新代码）

```bash
npx tsx scripts/evaluation-review.ts reconcile ...   # 对账
npx tsx scripts/evaluation-review.ts score ...       # 评分
npx tsx scripts/evaluation-review.ts gate --stage formal-validation \
  --campaign-id <id> --variant-id <variantId> --code-sha <git-sha> --admin-id <uuid> ...
npx tsx scripts/evaluation-review.ts promote ...     # 写 registry
```

- `gate` 对付费 stage 内部完成 `buildEvaluationCampaignClosure` + `sealEvaluationCampaignClosure`
  （evaluation-review.ts:1435-1448）；付费 gate **禁止 `--cases-file`**（case 只能来自 sealed campaign，源码强制）。
- **stage 链**：`formal-validation` 的 gate 要求**恰好 2 个前置 receipt**（provider-probe +
  internal-experiment，`evaluationPromotion.ts:1021-1023`），且三个付费 stage 的
  `authorizationUnitKey` 全等（:349-358）→ 执行顺序不可跳跃、不可换 key。
- `promote` 产出 `prompt-release-registry.json` → 构建期注入
  `__GARMENT_CANVAS_PROMPT_EVALUATION_RELEASE_REGISTRY__`（vite.config.ts:70 / build-server.ts:32）
  → 前端 `effectivePromptSupport` 翻 `verified` → §6 的「未完成评估」提示消失。
- **stage→status 映射**（evaluationPromotion.ts:445-448）：provider-probe→unverified（不进 registry）、
  internal-experiment→experimental、formal-validation→verified。**用户可用 = 至少走完 formal-validation**。

### 7.5 视频变体：结构性缺口（本次不执行，单独立项）

`EvaluationCampaignManifest.modelId` 类型是 `ImageModelId`（evaluationCampaign.ts:53），
`evaluation-authorize.ts:82` 强制 `isImageModelId` —— **`video-animate.doubao-seedance-2-5-260628.edit.v1`
在现行契约下进不了 campaign 账本**，无法按本 spec 放行。

- **本次 campaign 范围钉死为 2 个图像变体**（fashion-lookbook 的 edit + generate × gpt-image-2.5-flare-vip），
  覆盖 15 模板中的 13 个；
- 视频 2 模板（走秀/小红书）的放行需要契约修订：`modelId` 扩展为 `ImageModelId | VideoModelId`，
  影响 evaluationCampaign / authorizationLedger / evidenceStore / evaluation-review 四处 + DB 校验语义，
  **另行立项**（architect 出修订契约 → backend 实现），不混入本次执行，不静默缩小 §6 验收范围
  （§6 的「提示消失」验收本次只对图像生成节点生效，视频节点维持现状提示，属已知边界）。

### 7.6 零付费预检（2026-09-23 修订：每条命令标明环境/输入/断言/fail-closed）

backend 零付费核查**已全部跑完（2026-09-23 最终结果）**：变体断言 ✅ PASS（15/15 模板，0 越界，
推导链路与 §1 表格逐条一致）；manifest 校验 ✅ PASS（41 base units / 9 probe / ok: true）；
release preflight ❌ 本地不可执行（缺 5 个 CI/CD 环境变量，属预期行为，见下表第 4 行）。
即：**零付费可验证部分已全部通过，付费调用保持封锁**，剩下的只有 runner 实现。

| # | 命令 | 执行环境 | 输入 | 断言 | fail-closed 行为 |
|---|---|---|---|---|---|
| 1 | `npx tsx scripts/evaluation-manifest.ts --print` | 本地，零依赖 | 无（从代码常量物化） | 输出 41-unit manifest JSON | 抛错退出非零 |
| 2 | `npx tsx scripts/evaluation-manifest.ts` | 本地，零依赖 | `docs/ai/evaluation/evaluation-manifest-v1.json`（默认路径，:23-26） | 物化 manifest 与落盘文件深比较一致 | 不一致退出非零（防止代码与档案漂移） |
| 3 | 变体断言 | **runner `seal` 内嵌**（§1 修订版），本地，需 PostgreSQL | `builtinTemplates()` 运行时遍历（非静态 grep——调用点是 `EDIT_VARIANT` 常量引用，字面量 grep 抓不到） | 全部 `data.promptVariantId` ⊆ {2 图像变体} ∪ {视频变体=out-of-scope} | 清单外变体 → 拒绝 seal，退出非零 |
| 4 | `npx tsx scripts/evaluation-release-preflight.ts` | **CI stage，非本地 stage**——见下方说明 | 5 个 `GARMENT_CANVAS_EVALUATION_RELEASE_*` / `GARMENT_CANVAS_*_CODE_SHA` 环境变量 + 已构建的 release bundle + 专用 host dir | registry/bundle/code SHA 三方一致；host dir 合法性（非根目录/非 HOME/非系统 tmp/非项目树内，:132-147） | 任一环境变量缺失或校验不过 → 抛错退出非零 |

**release preflight 的执行环境（回应 backend 核查发现 3，已实证）**：该脚本是**发布门禁的一部分，
不是 campaign 执行步骤，只能在 CI/CD 构建产物存在时跑**。前置条件（release-preflight.ts:17-31）：
1. `GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR` — 专用发布目录（带
   `.garment-canvas-evaluation-release-root` 标记文件，内容逐字
   `garment-canvas-evaluation-release-root-v1\n`；脚本强校验它不是文件系统根、不是 HOME
   或其祖先、不是系统 tmp、不在项目树内）；
2. `GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SOURCE` — 必须等于
   `$HOST_DIR/prompt-release-registry.json`（即 `promote` 的产物落位后）；
3. `GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256` / `..._BUNDLE_SHA256` /
   `GARMENT_CANVAS_BUILD_CODE_SHA` / `GARMENT_CANVAS_CODE_SHA`。

因此时序上 preflight 位于 **§7.4 promote 之后、发布之前**，在 CI 发布 job（或运维手工发布流程）
中执行；**本地无构建产物跑不了它是预期行为，不是缺陷，backend 无需再尝试**。
campaign 执行阶段（§7.1-7.3）不依赖 preflight。

**付费调用封锁确认**：§7.3 execute 的四项前置条件（部署开关/admin 凭证/预算闸/$50 全局闸）
任一不满足即退出非零；在 runner 实现并核验前，付费部分保持封锁，与本节零付费预检互不影响。

### 7.7 范围收敛与预算闸绑定（2026-09-23 新增，回应 backend 全量 manifest 烧穿预算风险）

**风险事实（实查 manifest 坐实）**：`evaluation-manifest-v1.json` 的 `baseUnits` = **41 units 全量**
（模型分布：gpt-image-2.5-flare-vip=10 / gemini-3.1-flash-image=10 / flux-2-pro=10 /
seedream-5-0-260128=10 / gpt-image-2.5-sunburst=1），`stageRequestCaps` = probe 1 / internal 8 /
formal 24 per unit（recommendation 100 已被 RECOMMENDATION_BASELINE_BLOCKER 挡掉）。
**全量 worst-case = 5453 次 Provider 请求**——若执行入口直接按全量 manifest 跑，必然瞬间烧穿 $50。
manifest 自身也声明 `paidCampaign.manifestIsExecutionAuthorization: false`（manifest 是规划证据，
不是执行授权，与 AGENTS.md §4「Option A manifest 永不授权付费调用」一致）。

**收敛规则（runner `seal` 强制，全部机检）**：

1. **子集选择器**：runner 只接受显式 `--variant-id`（可重复）参数，seal 时从 manifest `baseUnits`
   过滤 `unit.promptVariantId ∈ 传入集合`。本次锁定集合（用户已拍板模型范围 A）：
   - `fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1`
   - `fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1`
2. **枚举断言（fail-closed）**：过滤结果必须**恰好 2 个 unit**，且每个 unit 的 `unitId` 与
   `promptVariantId` 逐字相等（manifest 实际结构如此）；数量不符、出现集合外 unit、或 unitId
   漂移 → 拒绝 seal，退出非零。**禁止任何「过滤不到就回退全量」的逻辑。**
3. **slot 枚举按子集生成**：每 unit × 每 stage 的 slot 数 = 该 stage 的 `incrementalSamples`
   （probe=1、internal=8、formal=24），每 slot `maxProviderRequests` = 该 stage 的
   `maxProviderRequestsPerSample`（=1）。子集 worst-case 总请求 = 2 × (1+8+24) = **66**。
4. **预算闸绑定收敛后的子集，不绑全量 manifest**：
   - 每 campaign（unit × stage）`budgetLimitMinor = requestsPerUnit(stage) × priceMinorPerProviderRequest`；
     `priceMinorPerProviderRequest` 由 backend 从 API易 本地知识库（§5 门禁）取当前定价，写入
     slots.json，**不得拍脑袋填**；
   - seal 前 runner 断言 `Σ(全部 6 个 campaign 的 budgetLimitMinor) ≤ 5000`（USD minor，即 $50）；
     超限拒绝 seal——**预算闸在 seal 时就封死，而不是等到 execute 才拦**；
   - execute 期的双保险不变（§7.3）：runner 全局累计闸 + DB 事务内
     `reserveEvaluationCampaignProviderRequest` 硬闸（evaluationCampaign.ts:556-563）。
5. **视频变体双重缺口佐证**：实查 manifest 的 41 units 全部是图像家族（无 video-animate unit）——
   视频变体不仅进不了 campaign 账本（§7.5 类型缺口），连全量 manifest 也不含它。§7.5 的
   「另行立项」结论不变，且立项时需要同步扩 manifest（41→N units）。

**验收（机检）**：runner 单测必须覆盖——(a) 传入 2 变体 → 枚举恰好 2 units、6 campaigns、
Σbudget ≤ 5000；(b) 传入集合外变体 → 拒绝；(c) 过滤结果为 0 或 >2 → 拒绝；(d) Σbudget 超 5000
→ 拒绝 seal。四个用例全部断言退出码非零 + 无 DB 写入。

6. **资产缺口分支（已实测关闭）**：prepare capture 后 `snapshot.references.length`：
   - `generate.v1` — `references=[]`（生成模式无图片输入，预期结构）
   - `edit.v1` — `references=[]`（实测 2026-09-24，run-queue.test.ts capture 模式输出）
   → **资产缺口不存在**，prepare 无需预准备任何参考图资产。若未来模型或变体引入
   reference-based 模式（references.length > 0），prepare 需扩展为「先上传参考图至
   Provider 文件 API 再 capture」的异步流程；此类资产入场须由用户显式授权，
   不得由自动化脚本隐式入库。

## 8. 风险与回滚

| 风险 | 应对 |
|---|---|
| 模型不可用或参数变更 | provider-probe 失败即中止，不进入付费 stage |
| 预算超限 | 每 stage 执行前检查累计预算，超限 fail-closed |
| 放行后用户反馈质量差 | 回滚：将变体 `supportStatus` 改回 `unverified`，前端提示恢复 |

---

**规格状态**：模型范围（A：仅默认模型）与预算上限（$50）已由用户拍板（2026-09-23）；§7 已按真实代码重写并裁决为方案 A；§1/§7.6 已吸收 backend 零付费核查结论（变体断言改运行时形式、preflight 标明发布期环境）；§7.7 已吸收 backend 全量 manifest 烧穿预算风险（子集收敛 + seal 期预算断言）。backend 按 §7.1-7.4 + §7.7 实现 `scripts/evaluation-campaign-runner.ts` 后即可执行；付费执行前 runner 的 fail-closed 前置条件（§7.3/§7.7）必须全绿。视频变体缺口见 §7.5，另行立项。
