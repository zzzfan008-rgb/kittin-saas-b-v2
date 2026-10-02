# 事实门 ②：generate 侧 golden-set brief 消费状态（只读核查）

核查人：backend | HEAD=7391597 | 只读、未动库

---

## 问 1：U7lK9XXlq1 的 33 slot text prompt 是同一个还是 33 个不同？

**同一个**。U7lK9XXlq1 的 `flow_json` text 节点 text = `「【要求】描述场合、风格与身材」`——静态模板，全部 33 slot 共用。

preflight 测试的 GENERATE_FLOW text 节点 text = `"preflight test prompt"`——合成占位值。preflight 未将 golden-set brief 注入 text 节点——33 次 HTTP request 发送的都是同一个静态 prompt。

**golden-set 24 条 brief 目前只用于**：
- 评估证据存储（`evaluationEvidenceStore.ts:316` `input_normalization_version, golden_set_version, ...`）
- 发布校验（`evaluationPromotion.ts:494` `cases must contain the exact ${expected.length}-sample golden set`）
- **不作为**执行期 prompt 文本注入

#### 证据

| 来源 | 内容 | 路径 |
|---|---|---|
| U7lK9XXlq1 flow_json text 节点 | `「【要求】描述场合、风格与身材」` | 库内 `projects.flow_json` |
| preflight GENERATE_FLOW text 节点 | `"preflight test prompt"` | `tests/campaign-runner-preflight.test.ts:83` |
| golden-set briefs | 24 条详细服装描述 | `docs/ai/evaluation/golden-set-v1.json` |

---

## 问 2：轨道 B 范围应扩到「加图 + 接 brief 消费」两侧吗？

**是**。generate 侧同样未消费 golden-set brief——33 slot 共用一个静态模板 prompt 无法区分 24 个不同样本的效果。注入 golden-set brief 是两侧共同的前提条件。

轨道 B 范围修正为：

| 侧 | 当前 | 需加 | 注入机制 |
|---|---|---|---|
| generate | 静态模板 text prompt | per-slot golden-set brief 注入 | `onlyNodeId` 填充 text（已有机理，补数据源） |
| edit | 无参考图、静态模板 text | 同上 + per-slot reference image 注入 | `onlyNodeId` + `injectEditReferenceImage` |

两侧共用 `injectGoldenSetBrief(nodes, sampleIdx)` 函数：按 `sampleIdx` 取 golden-set 样本 brief，注入 text 节点。

---

## 问 3：若 generate 侧已消费（在未读到的环节），贴代码位置

**未找到**。搜索范围：
- `server/routes/runPlan.ts`（执行路由）：194 行，无 golden-set 引用；`onlyNodeId` 只选执行节点，不改 text 内容
- `scripts/evaluation-campaign-runner.ts`（seal/prepare）：无 golden-set brief 消费；sampleIdx 只用于 slot 命名和 budget 计算
- `tests/campaign-runner-preflight.test.ts`：text 节点 content 是合成占位字符串

若存在在 `prepare` materialization 环节的 brief 消费，请指明文件/行号，我将补充。

---

## 对 Track B 方案的影响

原方案（5b89706）只需扩一项：**edit 侧加参考图之前，先用共享函数 `injectGoldenSetBrief` 为 BOTH 两侧注入 per-slot brief**。注入位置：preflight slot loop 内、seal 内，同一函数，同构对齐。

修订后的三步：
1. 24 图入库 + golden-set 扩展 `referenceImage`
2. **新增**：`injectGoldenSetBrief` → preflight/seal 每 slot 注入 brief（两侧都会用到）
3. EVALeditv1F flow 加参考图节点 + per-slot 参考图注入

理由：step 2 是两侧共存前提——不注入 brief，33 generate slot 都跑同一个静态 template prompt，评估毫无区分力。edit 侧同理。