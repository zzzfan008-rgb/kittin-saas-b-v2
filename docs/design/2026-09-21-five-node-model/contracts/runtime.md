# 运行时契约 — v8 执行语义

- 状态：**已定稿**（architect 2026-09-21）
- 依赖：`docs/design/2026-09-21-five-node-model/contracts/data-model.md`
- 项目硬规则：`AGENTS.md`（引用，不复述）

## 1. 执行入口：只有生成节点可运行

| kind | 可运行 |
|------|--------|
| `text` / `image` / `video` | **否** |
| `image-generator` / `video-generator` | **是** |
| `result-image` / `result-video` | **否** |

`server/engine/runner.ts` 的 `executeStep` 分发收敛为：

```ts
switch (step.kind) {
  case "image-generator": return executeImageGeneratorStep(...);
  case "video-generator": return executeVideoGeneratorStep(...);
  case "text": case "image": case "video":
  case "result-image": case "result-video":
    throw new Error(`Node ${step.nodeId} 不是可执行节点类型`);
}
```

**复用而非重写**：`executeImageGeneratorStep` / `executeVideoGeneratorStep` 的主体逻辑
**逐行沿用**现有 `executeImageStep` / `executeVideoStep`（提示词组装、参考图解析、
Provider 调用、后处理、runQueue 准入），差异只在：

1. **输入来源**：v7 的 image 节点自持 `outputImages`（输入输出同体 R8）；
   v8 的生成节点从**入边**取输入（`reference` / `first-frame` 边指向的 image/video/result 节点）。
2. **产出归宿**：v7 写回节点自身；v8 通过 RunEvent 创建 result 节点（§3）。

服务的 HTTP 路由层（`server/routes/generate.ts`、`runPlan.ts`）需同步：
把「按 nodeId 找 image/video 节点」改为「按 nodeId 找 `*-generator` 节点」。

## 2. DAG 提取规则

`server/engine/dag.ts` 的 `extractOutputImages` / `extractParams` 按 v8 扩展：

```ts
function extractOutputImages(data: WorkflowNodeData): string[] {
  switch (data.kind) {
    case "image":            return data.outputImages;   // 输入节点（用户上传）
    case "result-image":     return data.images;         // 结果节点（产物，可复用为下游输入）
    case "text": case "video":
    case "image-generator": case "video-generator":
    case "result-video":     return [];
  }
}

function extractOutputVideos(data: WorkflowNodeData): string[] {
  switch (data.kind) {
    case "video":        return data.outputVideos;
    case "result-video": return data.videos;
    default:             return [];
  }
}
```

**关键语义**：结果节点是**合法的下游输入源**（D6 决策 + §3 不削弱原则）。
`result-image` 可作为 `image-generator` 的 `reference` 或 `video-generator` 的 `first-frame`。

### 2.1 入边解析

生成节点的输入来自入边，按 `targetHandle` 分区：

| targetHandle | 源 kind | 约束 |
|--------------|---------|------|
| `prompt` | `text` | ≥1 条；**同一 text 节点只能连 1 个生成节点** |
| `reference`（image-generator） | `image` / `result-image` | 可选，多条；**顺序即 `order`** |
| `reference`（video-generator） | `video` 本版**禁止** / `result-video` 本版**禁止** | 见 T4 |
| `first-frame` | `image` / `result-image` | 可选，0–1 条 |

`order` 语义沿用 AGENTS.md §4 的「ordered reference-image semantics (order only)」：
按边在文档中的稳定顺序确定，不由数组位置静默推断语义。

**T4 落地**：`result-video → video-generator` 与 `video → video-generator` 的 `reference` 边，
**schema 层拒绝**（校验 fail），不是 UI 层隐藏。理由是 UI 隐藏但 schema 放行 = 允许非法文档
落盘；fail-closed 要求校验层拒绝。

## 3. 结果节点创建：RunEvent 驱动

**服务端创建，前端实例化**。前端不得本地凭空造结果节点（否则刷新/重连丢产物）。

### 3.1 新增事件类型

在现有 `RunEvent` 联合中新增：

```ts
| (RunEventMeta & {
    type: "result-node-created";
    /** 前端据此实例化 result 节点 */
    resultNodeId: string;
    sourceGeneratorId: string;
    runId: string;
    /** "image" | "video" */
    mediaKind: "image" | "video";
    /** 产物引用（/api/files/xxx） */
    urls: string[];
    outputSizes?: Array<string | null>;
  })
```

### 3.2 事件时序

```
生成节点 queued ──► node-status(queued)          [一次]
                ──► node-status(running)          [一次]
                ──► result-node-created           [一次/run，携带该 run 的全部产物]
                ──► node-status(success)          [一次，收口]
```

**一轮 run 发一次 `result-node-created`，携带全部产物**（与 T3 裁定 A 一致：
一个 run = 一个结果节点）。这不违反「渐进反馈」——渐进反馈由既有 `node-status(running)`
的进度信息承载，产物落盘仍是批量的（Provider 批量返回）。

**失败路径**：
- `node-status(error)`：不创建结果节点；错误回显在生成节点上。
- 结果未知（`outcome_unknown`）：不创建结果节点；走既有恢复路径。
  若恢复后确认成功，**此时才补发** `result-node-created`。

### 3.3 持久化要求

`result-node-created` 驱动的节点**必须进 `DocumentSnapshot`**：

- 前端收到事件 → 写入 flowStore → 打脏标记 → 走既有项目保存链路
- 保存绑定沿用 AGENTS.md §3 的 `tabId + projectId + documentEpoch`
- **late response 保护**：run 属于 tab A、期间用户切到 tab B 时，
  `result-node-created` 必须写回 **tab A**，不得污染 tab B

### 3.4 「最近结果」面板不受影响

画布内 result 节点是**新增载体**，不是既有「最近生成成功卡」的替代。
既有查看/对比/下载/设为输入流程（AGENTS.md §3 列举项）保持原样，
两者读同一套运行记录（`sourceGeneratorId` + `runId` 是同一账本的两种视图）。

## 4. 结果节点位置算法

T3 裁定 A 下，一次 run 产生**一个**结果节点，位置：

```
resultX = generator.x + 380
resultY = generator.y
```

即生成节点右侧同高，间距 380 与既有网格惯例一致。

**批量产物不再产生 N 个节点，因此不需要垂直对称分布算法**（这是我上一轮为 B 方案写的算法，
A 裁定后作废）。产物在节点内部以网格展示：

| 数量 | 网格 |
|------|------|
| 1 | 1×1 |
| 2 | 2×1 |
| 3 | 3×1 |
| 4 | 2×2 |
| 5–8 | 4×2 |

**重跑的位置**：重跑产生**新** result 节点，位置为
`resultX = generator.x + 380 + 380 * (该生成节点已有 result 节点数量)`——向右依次错开，
不叠加在同一坐标。旧 result 节点不动。

**自动布局只在创建那一刻生效**；此后用户拖动，系统不重排（position 属文档，用户意图优先）。

## 5. 生成节点存续（D10）

生成节点不因上游断连而消失：
- 上游全部断开 → 进入「待接线」状态（UI 提示需要什么输入），**不自我销毁**
- 只有用户显式删除才消失

## 6. 向后兼容的执行语义

v7 项目迁移后（见 migration.md），旧节点变成输入节点，**不可运行**。
用户要重新生成，需手动创建生成节点并连线。这是用户已拍板的保守路径取舍。
