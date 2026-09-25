# 轨道 B：EVALeditv1F flow 改造方案

方案人：backend | 基线：HEAD=c965a4a（dirty=0、85/85绿）| 同步：hermes architect

---

## 设计背景

EVALeditv1F 目前是纯 text→image-generator 单边 flow（无参考图节点），edit 侧 33 slot 因此全部 BLOCKED（`edit-reference-missing`）。目标：为 24 个 golden-set 样本各提供一张 garment_full 参考图，使这 24 slot 从 BLOCKED→PASS。

**核心设计点**：generate 侧 U7lK9XXlq1 是 1 个 project → 33 slot（纯 text prompt 变），因为文本节点内容可以靠 golden-set brief 动态填充（route `onlyNodeId` 机制）。edit 侧的不同在于：参考图每 sample 不同——图像节点的 `outputImages` 是静态的（flow 中预设），不能靠 `onlyNodeId` 动态填充。

**关键约束**：route 的 `onlyNodeId` 只影响文本节点的内容填充；图像节点的 `outputImages` 必须在 flow JSON 中预设。因此每 slot 不同的参考图不可能由一个静态 flow 覆盖。

---

## 方案：1 project × 1 flow × per-slot 动态构造（不在 DB 存 24 份）

### 决策：不改 manifest、不新建 project

**EVALeditv1F 保持为 1 个 `projectId`，manifest 保持 41 条目不变**。24 slot 的参考图差异由 preflight/seal 在**请求时**动态注入 flow——不在 project 库中持久化备选分支。

### 三步实现

#### 第 1 步：24 张参考图入库 + golden-set schema 扩展

- 走 `POST /api/files`（dataUrl→标准化→files 表），每张图获得 `fileId` + `sha256`
  - 或用 `ADD_FILE` 直接落库（绕过 HTTP 协议成本，24 张 7-8MB JPEG 的 dataUrl 编码极为低效）
  - **推荐直接用库写入**：批量 INSERT INTO files，图片文件由脚本搬到 uploadsDir()
- golden-set schema 扩展（`docs/ai/evaluation/golden-set-v1.json` + TypeScript 类型）：
  ```json
  { "id": "garment-gold-01", ...,
    "referenceImage": { "fileId": "xxx", "sha256": "sha256:xxx" }
  }
  ```
  - 新增 `referenceImage` 字段**不回填旧样本**（generate 侧 33 个样本不变，没有参考图需求）
  - **同批校验更新**（裁决 9.2 连带条款）：`tests/evaluation-manifest.test.ts` 的 `currentSamples()` 需断言 `referenceImage` 存在时 fileId/sha256 必须非空；反之 generate 样本该字段必须为 undefined/null（「样本无此字段 → admission 侧 `assertImageReferencesAccessible` 不会误读成缺图」）

#### 第 2 步：EVALeditv1F flow 加参考图节点

在现有库中直接 UPDATE `flow_json`（> 用脚本 `ensureEditReferenceProject` 而非手写 SQL）：

```
nodes: [
  { id: "edit-text", type: "text", ... },            // 已有
  { id: "edit-reference-image", type: "image",        // 新增
    data: {
      kind: "image",
      label: "garment_full_reference",
      outputImages: [/* 占位——per-slot 替换 */],
      aspectRatio: "3:4",
      batchSize: 1
    }
  },
  { id: "edit-gen", type: "image-generator", ... },   // 已有
]
edges: [
  { source: "edit-text", target: "edit-gen", targetHandle: "prompt" },      // 已有
  { source: "edit-reference-image", target: "edit-gen", targetHandle: "reference" },  // 新增
]
```

- `outputImages` 设为示例占位值（如 `[{fileId: "PLACEHOLDER", ...}]`）——**实际 per-slot 值由 preflight 动态注入，不持久化**
- flow 结构变更后 `evaluationUnitKey` **会变**——这是期望行为（旧的 key 产生自「无参考图」的 flow，新 key 产生自「有参考图」的 flow）。该变更必须伴随 re-seal

#### 第 3 步：preflight/seal 动态注入 per-slot reference image

preflight slot 循环（`tests/campaign-runner-preflight.test.ts:370-380`）改为 per-slot 构造 flow：

```ts
// 现在：静态 EDIT_FLOW（无参考图节点）
nodes: EDIT_FLOW.nodes,
edges: EDIT_FLOW.edges,

// 改：per-slot 动态构造
nodes: injectEditReferenceImage(EDIT_FLOW.nodes, sample.referenceImage),
edges: EDIT_FLOW.edges,  // 不变——图节点 ID 稳定
```

其中 `injectEditReferenceImage` 深拷贝 nodes 数组，找到 `kind: "image"` + `label: "garment_full_reference"` 的节点，将其 `outputImages` 替换为该 sample 的 `referenceImage`。

**per-slot 注入与 per-slot prompt 同理**——generate 侧 text 节点内容靠 `onlyNodeId` + golden-set brief 替换，edit 侧图像节点内容靠 preflight 层直接替换。**两种注入都在一次 HTTP request 中完成，说一次事情**。

seal 侧同样调整：`sealCampaigns` 加载 project flow_json 后，每个 slot 走同一个 `injectEditReferenceImage` 注入参考图，再计算 `evaluationUnitKey`。seal 的 key 由此与 route 的 key 一致（杜绝重复 6 缺陷形态）。

---

## 回滚方式

- **改现有 EVALeditv1F**（非新建）。project flow_json UPDATE 即可
- 需要回滚时：还原 flow_json 为两节点纯 text→image-generator 版本
- manifest locator `projectId: "EVALeditv1F"` 不变
- golden-set 的 `referenceImage` 扩展是纯追加字段——缺了也不影响 generate 侧，没有破坏性变更

---

## 依赖与风险评估

| 变更 | 影响面 | 风险 |
|---|---|---|
| 24 图入库 | files/assets 表 | 入库脚本幂等——重复跑不产生重复文件 |
| golden-set schema 扩展 | `referenceImage` 字段 + 同批校验更新 | 旧样本缺字段 = 不影响 generate；编辑样本非空校验由测试覆盖 |
| EVALeditv1F flow 加参考图节点 | existing manifest:check（projectId 不变）+ 预检三态断言 | `evaluationUnitKey` 变化 → 需要 re-seal |
| per-slot 动态注入 | preflight 和 seal 调用点 | 同一 `injectEditReferenceImage` 函数，预防「各持一份→静默不等」 |
| reference_inputs_sha256 变化 | v8rel6 66 条授权作废 | 预期——re-seal v8rel7 后重新授权 |

---

## 需要 hermes 确认的决策点

1. **入库方式**：走 HTTP API（`POST /api/files`）还是库内直接 INSERT + 文件搬移？（前者走标准化管线但 dataUrl 编码 24×8MB 极低效；后者数据库引用完整但绕过部分中间层校验）
2. **per-slot 注入实现位置**：preflight cycle 层还是加一个 `referenceImageId` 参数给 route？（前者不改 route 代码，后者 route 可复用——但对于 edit 只有一个 variant 的场景，preflight 层注入更简单）
3. **re-seal 时机**：全部 24 slot 改造完成后立刻 re-seal？还是等 24 张参考图通过 preflight 66/66 验证后再 re-seal？
4. **manifest 三态断言更新**：33 BLOCKED→9 BLOCKED + 24 PASS（edit 侧有 24 张 reference image 的 slot PASS，9 张没参考图的 edit slot 仍 BLOCKED）——但 golden-set 刚好 24 样本，所有 edit slot 都有图 ⇒ **24 PASS + 9 个 edit slot 不存在**？让我核实：manifest 中 EVALeditv1F unit 有几个 slot？

---

## 关于 slot 数量的核实

当前 campaign plan：`generateCampaignPlans` 对每个 unit × cap 生成 `cap.incrementalSamples` 个 slot。manifest 的 `stageRequestCaps[1].incrementalSamples = 33`（provider-probe stage 的 edit cap）。

golden-set 只有 24 个样本。33 slot > 24 样本 ⇒ **9 个 edit slot 没有匹配的 golden-set 样本**，它们的 reference image 为空 ⇒ 这 9 个 slot 仍应 BLOCKED(`edit-reference-missing`)。

所以三态断言更新为：**33 PASS + 24 PASS(edit) + 9 BLOCKED(edit-reference-missing) = 66 全枚举**。不对——33+24+9≠66。让我重新算：

当前分布：33 generate PASS + 33 edit BLOCKED = 66

如果 edit 侧 24 个有参考图、9 个没有：
- 33 generate PASS（不变）
- 24 edit PASS（有了参考图）
- 9 edit BLOCKED(`edit-reference-missing`)

33 + 24 + 9 = 66 ✓

但这是否意味着我们需要 24 个 edit sample——和 golden-set 24 样本一一对应——但 manifest 说 `incrementalSamples=33`？需要改 manifest 的 `stageRequestCaps[1].incrementalSamples = 24`。

这是一个要确认的决策：**缩减 edit 侧样本数 33→24（对齐 golden-set）**，还是 33 不改（9 个 slot 没有参考图→永久 BLOCKED）？