# 轨道 B：EVALeditv1F flow 改造方案（修订版，回应 hermes 14:48 核验）

方案人：backend | 基线：HEAD=0e716a8（dirty=0、85/85绿）| 同步：hermes 核验通过

---

## 设计背景（修正）

**之前误读**：33 edit slot = 33 个同质 slot，全对应 golden-set ⇒ 24 张图不够。

**正确模型**（hermes 14:48 DB 实测）：edit 侧 33 slot = 3 个 stage，与 generate 侧完全对等：

| stage | incrementalSamples | golden-set 样本 | 参考图来源 |
|---|---|---|---|
| `provider-probe` | 1 | `garment-gold-01` | 最低成本探针，取首张 |
| `internal-experiment` | 8 | `garment-gold-01..08` | 按 sampleIdx 取前 8 张 |
| `formal-validation` | 24 | `garment-gold-01..24` | sampleIdx 0-23 → 各对应 1 张 |

**24 张 golden 图覆盖全部 33 edit slot**——三阶段的 `sampleIdx` 均从 0 开始、映射到同一 golden-set 同序样本。参考图可跨 stage 复用：README:72 的不得复用条款针对**证据收据**（caseEvidenceId/runId/caseId），不是输入图像资产（hermes 已核实）。

### repealing 的决策点

- ~~❌ 缩减 manifest edit 侧 33→24~~ — 侵犯必经 stage 门禁，违反「closed campaign containing all slots」
- ~~❌ 9 slot 永久 BLOCKED~~ — 同因；必经 stage 不可跳过
- ~~❌ 33 slot > 24 样本 ⇒ 图不足~~ — 误读三阶段同质；24 张 × stage 复用 = 33 slot 全覆盖

---

## 方案（核心设计不变）：1 project × 1 flow × per-slot 动态注入

### 决策：不改 manifest、不新建 project

EVALeditv1F 保持 1 个 projectId、manifest 保持 41 条目不变。33 slot 的参考图差异由 preflight/seal 在**请求时**动态注入 flow。

per-stage sample→reference-image 映射（与 generate 侧 brief 分配逻辑**完全对齐**）：
```
goldenSampleIdx = sampleIdx  // 每 stage 内从 0 开始取，映射同名 golden-set 样本
referenceImage  = goldenSet.samples[goldenSampleIdx].referenceImage
```
三项 stage 的 sampleIdx 互不重叠（probe:0、internal:0-7、formal:0-23），但映射到同一 golden-set 数据集。

### 三步实现

#### 第 1 步：24 张参考图入库 + golden-set schema 扩展

- **入库**：库内直接 INSERT + 文件搬移（不走 HTTP——24×8MB dataUrl 编码极低效）
- 幂等：按 fileId 去重，重复跑不产生重复文件
- 每张图登记 sha256，写入 golden-set 的 `referenceImage: { fileId, sha256 }` 字段
- golden-set schema 扩展示例：
  ```json
  { "id": "garment-gold-01", ..., "referenceImage": { "fileId": "...", "sha256": "sha256:..." } }
  ```
- **同批校验更新**（裁决 9.2）：`golden-set` 加载函数校验 `referenceImage` 存在时 fileId/sha256 非空；不存在时不误读为缺图

#### 第 2 步：EVALeditv1F flow 加参考图节点

直接 UPDATE `projects.flow_json WHERE id = 'EVALeditv1F'`：

```
nodes:
  + { id:"edit-reference-image", type:"image",
      data: { kind:"image", label:"garment_full_reference",
              outputImages:[/* placeholder */], aspectRatio:"3:4", batchSize:1 } }
edges:
  + { source:"edit-reference-image", target:"edit-gen", targetHandle:"reference" }
```

- `outputImages` 占位值由 `injectEditReferenceImage` 在运行时替换
- flow 结构变更 → `evaluationUnitKey` 变化（期望行为：旧 key 无参考图 → 新 key 有参考图）
- 三 stage 的 `authorizationUnitKey` 完全一致（参考图不进 12-field envelope，`reference_inputs_sha256` 是 slot 级独立列）——满足 README:72 要求

#### 第 3 步：preflight/seal 动态注入 per-slot reference image

**共享函数**（防各持一份→静默不等）：
```ts
function injectEditReferenceImage(
  nodes: PersistedWorkflowNode[],
  referenceImage: { fileId: string; sha256: string },
): PersistedWorkflowNode[] {
  return nodes.map(node => {
    if (node.type === "image" && node.data?.label === "garment_full_reference") {
      return { ...node, data: { ...node.data, outputImages: [referenceImage] } };
    }
    return node;
  });
}
```

preflight 调用：每 slot 的 HTTP request 构造 per-slot flow（`EDIT_FLOW.nodes` → `injectEditReferenceImage(...)`）。seal 同理——在 `sealCampaigns` 内计算 `evaluationAuthorizationEnvelopeFromFlow` 之前注入，杜绝「seal 算 key 用的 flow ≠ route 用的 flow」。

---

## 三态断言更新

轨道 B 完成后：edit 侧 33 slot 从 BLOCKED → PASS ⇒ **66/66 全 PASS**（不是 24 PASS + 9 BLOCKED——probe + internal + formal 三项必经 stage 全覆盖）。

断言更新为：`successCount === 66 && blockedCount === 0`，mutator gates 四闸全过。

---

## 回滚方式

- 改现有 EVALeditv1F（非新建 project）——`flow_json` UPDATE
- 回滚：还原为两节点纯 text→image-generator 版本
- manifest locator `projectId: "EVALeditv1F"` 不变
- golden-set `referenceImage` 纯追加字段——不影响 generate 侧

---

## 依赖与风险评估

| 变更 | 影响面 | 风险 |
|---|---|---|
| 24 图入库 | files/assets 表 | 幂等脚本 + sha256 登记 |
| golden-set schema 扩展 | `referenceImage` 追加字段 + 同批校验 | 旧 generate 样本不受影响 |
| EVALeditv1F flow 加参考图节点 | flow_json UPDATE | `evaluationUnitKey` 变化 → re-seal 必须 |
| per-slot 动态注入（单函数） | preflight + seal 调用点 | 共用 `injectEditReferenceImage`，预防「各持一份」 |
| reference_inputs_sha256 变化 | v8rel6 66 条授权作废 | 预期——re-seal v8rel7 后重新授权 |
| 预检三态断言更新 | 33+33 → 66+0 | 轨道 B 完成后改断言 |

---

## 确认状态

hermes 四个决策点已回答：
1. **入库**：库内直写 ✓
2. **注入点**：preflight/seal 层 ✓
3. **re-seal 时机**：等 24 图过 preflight 66/66 后 ✓
4. **三态断言**：66/66 全 PASS ✓（本修订版已更新）

## 下一步

1. PR 描述修完（等 hermes 补全剩余 2 处更正）
2. 本方案 hermes 确认后动库数据
3. re-seal 在 preflight 66/66 全绿后执行（append-only 不可逆）