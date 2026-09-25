# 轨道 B：EVALeditv1F 夹具改造方案（v3，absorb architect 2026-09-25 ruling）

方案人：backend | 基线：HEAD=9098f34（dirty=0、85/85 绿）| 同步：architect 裁决通过

---

## 核心形态：project-per-brief

**否定**：在 preflight/seal slot loop 内注入 brief 到提交 body
**采用**：每个 distinct brief 一个 evaluation project，brief **bake 进 project 的 flow_json text 节点**

否决原因（architect 裁决并亲验）：`runPlan.ts:223-239` 的 `isDeepStrictEqual(submittedPlan, basePlan)` 比较 `dag.ts` 的 buildExecutionPlan 结果——text 节点内容被收集到 plan.steps[].params.inputTexts（dag.ts:229→:247），提交 body 改 text → submittedPlan.inputTexts 变、basePlan 不变 → 必然不等 → 全 66 slot 被闸拒。**这道闸不许为评估放宽。**

### 具体形态

```
goldenSetBriefForSlot(stage, sampleIdx)  ← 唯一共享函数，preflight/seal/execute 三处同调
  │
  ├─ provider-probe (1 slot)  → brief[0]         → project EVALgen-brief-01 / EVALedit-brief-01
  ├─ internal-experiment (8)  → brief[0..7]       → EVALgen-brief-01..08 / EVALedit-brief-01..08
  └─ formal-validation (24)   → brief[0..23]      → EVALgen-brief-01..24 / EVALedit-brief-01..24
```

**48 个 project**（24 briefs × 2 variants，probe/internal 复用 formal 前缀 project）。
已验证无 project 维度唯一约束：`evaluation_campaign_slots` + `evaluation_run_authorizations` 均无 project_id 唯一索引。

### 与旧方案的关键差异

| 旧（preflight 注入） | 新（project-per-brief） |
|---|---|
| 提交 body 改 text → 被 plan-equality 闸拒 | brief bake 进 flow_json → 库内 plan 与提交 plan **同一份 flow** → 等值通过 |
| 2 个 project 复用，运行时改 text | 48 个 project，每个 text 不变，可哈希可验证 |
| per-slot 注入函数在请求侧 | goldenSetBriefForSlot 在夹具生成期运行 → 项目里 flow_json 已是目标态 |
| seal 与 execute 可能 flow 不同 → 缺陷 | seal 与 execute 用同一个 project → flow 天然相等 |

---

## 三步实施

### 第 1 步：24 图入库 + golden-set v2 schema 扩展

**入库**：走生产上传路径函数 `uploadFile`（`src/lib/fileStore.ts`），不裸 INSERT。
理由：architect 裁决 (a)——裸 INSERT 绕过校验/命名/fileId 生成，此后 schema 变更静默不报。

**golden-set v2 schema 扩展**：追加 `referenceImage: { fileId: string; sha256: string }`
**同批校验**（裁决 9.2）：加载脚本断言「24 条 brief 每条都有可访问参考图」，挂 `evaluation:manifest:check` 同族入口，不只是文档描述。

### 第 2 步：48 夹具 project 生成（确定性脚本）

脚本性质：纯机械、三次跑同入同出、内置 48 个「project 数量 == 24 * 2」断言。

**基础**：24 个 EVALgen-*-brief-NN project（clone U7lK9XXlq1，text 节点填 golden-set brief）
        24 个 EVALedit-*-brief-NN project（clone s1xf4H2MGa 的形态，text 节点填 brief + image reference 节点）

**文本注入**：`flow_json.nodes.find(n => n.data.kind === "text").data.text = goldenSetBriefForSlot(stage, idx)`——这是 **唯一** 写入 brief 的位置。存入数据库即 bake 完成，此后提交 body 与库内 flow 完全一致 → plan-equality 闸自然通过。

**edit 侧参考图节点**：每 project 的 flow 加 image 节点 `{ type: "image", data: { kind: "image", label: "garment_full_reference", outputImages: [{fileId: "ref-file-id", ...}] } }` 加 edge `{ source: "edit-reference-image", target: "image-generator", targetHandle: "reference" }`

### 裁决 D：outputImages fileId 与 golden-set 同源（单一事实源）

edit project 的 image 节点 `outputImages` fileId **必须是 24 图入库后的真实 fileId**（走生产上传存储层），bake 时写死进 flow_json。与 golden-set schema 扩展的 `referenceImage: {fileId, sha256}` 是**同一个 fileId**，夹具生成脚本从 golden-set 读、填进 image 节点 ⇒ 单一事实源。

**断言**：每个 edit project 的 outputImages fileId ∈ golden-set 24 个 fileId 集合，且与该项目 sampleIdx 对应的那一条相等。

**可重跑**：48 条 INSERT 幂等（按 projectId 去重）+ 内含完整断言。

**运行时零注入**：text 和参考图均在夹具生成期 bake 进 flow_json。preflight/seal 提交的 body 与库内 flow 完全一致（`isDeepStrictEqual` 天然通过）。实证：修改 text 字符 → HTTP 409 被闸拒（`tests/campaign-runner-preflight.test.ts` 变异测试 15，f276ac2）。参考图 `outputImages` 同样进 `plan.steps[].inputImages/inputReferences`（dag.ts:255→227→232→244-245），与 text 输入 `plan.steps[].params.inputTexts`（dag.ts:229→247）**同闸同拒**。

### 裁决 B：edges 顺序锁定（防 referenceInputsSha256 静默漂移）

architect 亲验 dag.ts:222-236：`inputReferences[].order` 派生自 edges 数组遍历索引 ⇒ edges 顺序变 → order 变 → `referenceInputsSha256` 变 → 账本 hash 静默失效。己方复核 `evaluationEvidence.ts:547-572` 确认 order 在 `sha256(snapshot.references)` 输入中。

**三条强制要求：**
1. **夹具生成脚本写死 edges 顺序**（确定性构造，不得依赖 Map/Set/Object 迭代顺序），脚本内断言 edges 数组顺序与预期逐条相等
2. **seal 期封存 flow_json sha256** ⇒ execute 期校验（见裁决 C），把「edges 不可变」变成机制保证
3. **反恒真测试**：同一语义 flow 两种 edges 排列 → `referenceInputsSha256` 必须不同（证明 hash 对 order 敏感）

### 裁决 C：flow_json_sha256 列（防跨时间漂移）

plan-equality 闸只比较同一次请求的「提交 vs 库里」，不管「seal 时 vs execute 时」的跨时间漂移。裁决：新列 `flow_json_sha256 TEXT` nullable，与 envelope 三列同批 migration（version 24）：
- seal 写入（与 envelope 快照同一次调用，单一计算点）
- execute 重算比对，**不等即 fail closed**（不得降级 warning）
- 不可变触发器覆盖（同 envelope 三列形态）
- **关键变异验收**：篡改 flow_json 一个字符 → execute 必须拒
- 注册 `TEST_FILES` + `SERIAL_TEST_FILES`

### 第 3 步：promotion 加牙齿（哈希等值）

现有 promotion 只查 case 名单齐全、不查内容真跑过——这正是本次事实门能存在的制度原因。

**形态**：哈希等值（不是字符串比对）：
- 每个 sealed slot 的 resolvedPromptSha256 == sha256(goldenSetBriefForSlot(stage, sampleIdx))
- 哈希由与注入侧**同一共享函数**派生（防 promotion 里另写比对→各持一份→第 N 个缺陷）
- **fail closed**：任一不等即拒，不得降级 warning
- 完备断言：formal 的 24 slot 覆盖 sampleIdx 0..23 全集，缺任一即拒

---

## per-stage 映射

| stage | slots | brief 映射 | distinct projects (×2 variants) |
|---|---|---|---|
| `provider-probe` | 1 | brief[0] | 1（复用 formal 首 project） |
| `internal-experiment` | 8 | brief[0..7]（sampleIdx 升序前缀） | 8（复用 formal 前 8 个 project） |
| `formal-validation` | 24 | brief[0..23]（1:1 完备） | **全部 24 个** |

**强制**：唯一共享函数 `goldenSetBriefForSlot(stage: string, sampleIdx: number): string`。
内部断言 `sampleIdx ∈ [0, 24)` 越界即 throw（照 envelope「非 undefined 即 throw」原则）。
preflight/seal/execute/promotion 四处调同一函数。

---

## 对轨道 A 的影响（envelope/unitKey 不变，但 slot 级 hash 会变）

- **evaluation_unit_key（12 字段）不变**：text prompt 不在 envelope 内 → unitKey 不因 brief 变更而变
- **但**：`resolvedPromptSha256` 会变（brief 替换「【要求】描述场合、风格与身材」后 prompt 内容变了） + edit 侧 `referenceInputsSha256` 会变（加参考图后输入哈希变了）
- **关键约束**：**prepare capture 必须在 48 夹具 project 就位后重新物化**。若用旧 flow 物化 capture、用新 project flow 提交 execute → 哈希比对不等 → seal 期被拦（缺陷）
- **执行顺序**：48 夹具 project 生成 → 轨道 B 注入接线 → 轨道 A 的 prepare capture 在其上物化 → re-seal v8rel7

---

## 预检断言（66 全 PASS + 完备性断言）

轨道 B 完成后三态预期：
- edit 侧 33 BLOCKED(`edit-reference-missing`) → 33 PASS（归零）
- 总计：**66/66 全 PASS**

新增完备性断言（全 66 slot、非抽样）：
1. 注入后 `text == goldenSetBriefForSlot(stage, sampleIdx)`（每个 slot 的 prompt 与 golden-set brief 一致）
2. 66 slot 覆盖的 brief 集合 == golden-set 24 条全集（formal 侧）——防有人把映射改成「只用前 8 条」
3. 断言禁令不变：不得缩 filter、不得缩 slot 数

---

## spec 同批更新（`docs/ai/evaluation/`）

① §7.x 新增「brief 注入是付费执行前提」，格式：背景/决策/后果/被否决选项
② golden-set v2 schema extension `docs/ai/evaluation/golden-set-v2.json` + validation script

---

## 依赖与风险评估

| 变更 | 影响面 | 风险 | 缓解 |
|---|---|---|---|
| 24 图入库（uploadFile 路径） | files/assets 表 | 生产函数耦合 | 先定位 uploadFile 函数形态再调用 |
| 48 project 生成 | projects 表 × 48 INSERT | 幂等 | 按 projectId 去重 + 确定性脚本 |
| EVALgen/edit-v1Fi 变更 | 旧 U7lK9XXlq1/s1xf4H2MGa project | 零。**新建 project，不动旧 project** | 旧 project 保留为审计锚点 |
| capture 重新物化 | resolvePromptSha256 变化 | 旧 capture 哈希作废 | 在 48 夹具就位后重物化 |
| promotion 哈希等值 | promotion 逻辑 | 新加 fail-closed 闸 | shared function 防各持一份 |

---

## 禁令（不变）

- 不可 push 轨道 B 工作到 origin 直至轨道 A 先 push
- 不可付费真跑
- 不可 re-seal 直到 19 条验收全绿 + 预检 66/66 PASS
- 零花费纪律