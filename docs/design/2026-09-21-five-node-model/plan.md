# 节点模型重构 + 节点 UI 重设计 — 实施方案

- 日期：2026-09-21 · 起草：frontend
- 状态：**草案，待用户确认 + architect 契约定稿**
- 前置：`docs/design/2026-09-18-three-node-model/`（v7 三节点模型，本方案在其上做 v8 演进）
- 关联决策：用户已逐条拍板（见 §9 决策记录）

---

## 0. 目标

1. 把「用户上传/预览」与「AI 生成」两件事从同一个节点里拆开，各自成为独立节点。
2. 生成结果不再挤在生成节点内部，而是落成独立的结果节点，可单独预览、播放、复用。
3. 每个基础节点正上方有各自的横版工具条（职责单一、互不雷同）。
4. 重构原来的 3 个基础节点——**之前太复杂**（一个 image 节点同时承担上传、参考图来源、参数配置、模型调用、结果展示五件事）。

## 1. 节点模型（7 kind）

```ts
export type NodeKind =
  | "text" | "image" | "video"                       // 输入节点
  | "image-generator" | "video-generator"            // 生成节点
  | "result-image" | "result-video";                 // 结果节点
```

| # | kind | 类别 | 职责 | 有运行按钮 |
|---|------|------|------|-----------|
| 1 | `text` | 输入 | 提示词正文；色彩工具入口 | 否（文本功能由生成节点承担） |
| 2 | `image` | 输入 | 上传/显示图片；作为参考图来源 | 否 |
| 3 | `video` | 输入 | 上传/显示视频；作为参考视频来源 | 否 |
| 4 | `image-generator` | 生成 | 选功能、配参数（模型/画幅/数量/模型参数）、触发生图 | **是** |
| 5 | `video-generator` | 生成 | 选功能、配参数（模型/画幅/数量/时长/首尾帧/运动）、触发生视频 | **是** |
| 6 | `result-image` | 结果 | 展示生成图片，点击预览 | 否 |
| 7 | `result-video` | 结果 | 展示生成视频，点击播放 | 否 |

### 1.1 与 v7 的关键差异

| 维度 | v7（当前） | v8（本方案） |
|------|-----------|-------------|
| 基础节点数 | 3 | 7 |
| image 节点职责 | 上传 + 参考源 + 参数 + 生成 + 结果显示（五合一） | **仅**上传 + 显示 + 参考源 |
| 生成入口 | image/video 节点自带「运行」 | 独立 `*-generator` 节点 |
| 结果展示 | 生成节点内部网格 | 独立 `result-*` 节点 |
| 参数配置面 | 右侧悬浮窗（功能目录 + 参数 + 模型混在一起） | 生成节点自带参数面板（**不含功能目录**，仅模型与模型参数） |
| 功能选择 | 悬浮窗内目录 | 生成节点工具条 `[功能选项]` |

> **设计要点**：输入节点不再有任何生成语义，生成节点不再承载任何媒体展示，结果节点不再承载任何参数。三层各司其职。

## 2. 连线规则

### 2.1 合法边

| 源 | 目标 | targetHandle | 数量约束 |
|----|------|--------------|---------|
| `text` | `image-generator` | `prompt` | 必须 ≥1；**单个 text 节点只能连 1 个生成节点** |
| `text` | `video-generator` | `prompt` | 同上 |
| `image` | `image-generator` | `reference` | 可选，可多条（顺序即序号） |
| `image` | `video-generator` | `first-frame` | 可选，0–1 条 |
| `video` | `video-generator` | `reference` | 可选，可多条 |
| `result-image` | `image-generator` | `reference` | 可选（结果可复用为下游输入） |
| `result-image` | `video-generator` | `first-frame` | 可选，0–1 条 |
| `result-video` | `video-generator` | `reference` | 可选 |
| `*-generator` | `result-*` | `result` | **系统自动创建**，用户不可手动连 |

### 2.2 禁止的边

- 输入节点之间互连（`text→text`、`text→image`、`image→image`、`image→video`、`video→*` 全部禁止）
- 生成节点连出到其它生成节点（`*-generator → *-generator`）
- 结果节点连到结果节点或输入节点
- 生成节点作为其它节点的输入（生成节点不是数据源；要复用请用 `result-*`）

### 2.3 生成节点的独立性

`*-generator` 节点一旦创建就是画布上的持久实体：
- 用户断开上游输入连线（取消选中/删除上游）**不会**导致生成节点消失；
- 它只在用户显式删除时消失；
- 上游全部断开时，节点进入「待接线」状态（显示需要什么输入），而不是自我销毁。

## 3. 节点 UI

### 3.1 卡片结构（三类共用骨架）

```
┌──────────────────────────────────────┐
│ ●  节点名                              │  ← 标题栏：状态点 + 名称（双击改名）
├──────────────────────────────────────┤
│  内容区（按 kind 不同）                 │
└──────────────────────────────────────┘
```

宽度统一 **256px**（v7 是 280px，偏宽；缩窄后同屏可容纳更多节点）。圆角、边框、阴影沿用 `--gc-node-*` / `--gc-*` token，不新增样式源。

### 3.2 正上方横版工具条（每 kind 不同）

位置：节点卡片正上方 8px，居中；**仅在选中态渲染**（未选中不占 DOM，避免画布信息过载）。

| kind | 工具条（从左到右） |
|------|-------------------|
| `text` | `[色彩工具] [复制]` |
| `image` | `[裁剪] [抠图] [复制] [替换]` |
| `video` | `[复制] [替换]` |
| `image-generator` | `[功能选项] [运行] [复制]` |
| `video-generator` | `[功能选项] [运行] [复制]` |
| `result-image` | `[预览] [下载] [复制]` |
| `result-video` | `[播放] [下载] [复制]` |

> **口径记录（R-103，落地 architect R-100 F3 裁定）**：本方案草案曾列出的 result 节点
> `[作为输入]` 按钮**恒禁用，已从工具条移除**——结果作为下游输入不经按钮转化，改由
> **输出柄直连**：从 result 节点输出柄拖线到生成节点入边句柄即可（`result-image` →
> image-generator 的 `reference` 或 video-generator 的 `first-frame`，见 §2.1 与
> contracts/runtime.md §2「结果节点是合法的下游输入源」）。

约定：
- 每个按钮 = 图标 + `aria-label`（hover 显示 Tooltip 文字），键盘可达、可见焦点环。
- 禁用态（如未上传图片时的「裁剪」）显示禁用样式并给出 `title` 原因，不隐藏。
- 全部用项目本地 shadcn `Button`（`variant="ghost"` / `size="icon-sm"`）组合，不手搓按钮。

**按钮语义**

| 按钮 | 语义 | 可用条件 |
|------|------|---------|
| 裁剪 | 打开图片裁剪器，产出新图片 | image 节点已有图 |
| 抠图 | 主体提取 / 去背景，产出新图片 | image 节点已有图 |
| 替换 | 替换当前媒体（重新上传 / 从素材库选） | image / video 节点 |
| 色彩工具 | 打开取色面板，确定后把色值插入正文光标处 | text 节点 |
| 功能选项 | 弹出功能胶囊，选定后**在右侧新建生成节点**并自动连线 | 生成节点 |
| 运行 | 提交本次生成 | 生成节点 |
| 预览 / 播放 | 打开大图查看器 / 播放视频 | result 节点有产物 |
| 下载 | 下载产物 | result 节点有产物 |
| 作为输入（已移除，R-103） | **不落地此按钮**：本方案草案曾列此按钮恒禁用。结果作为下游输入不经按钮转化，改由**输出柄直连**——从 result 节点输出柄拖线到生成节点 `reference` / `first-frame` 入边句柄（runtime.md §2.1 边表），与 contracts/data-model.md §0.2 P2-4 裁定（reference 边显式 `EDGE_HANDLE_REFERENCE`）一致 | — |
| 复制 | 复制节点（含 data，不含产物文件） | 全部 |

> **待确认 T1**：`[功能选项]` 归属。你先后说过「生成节点没有功能选项」与「功能选项应该在生成模式节点内」。本文按**后者（最新表述）**落：功能选项在生成节点上。若实际意图是「生成节点无功能选项、功能在创建时一次性选定」，此列需改写。

### 3.3 生成节点：参数面板

生成节点**不使用** v7 的悬浮窗（`NodeInspectorWindowPortal`）。参数直接内联在节点卡片上，自下而上分三段：

```
┌──────────────────────────────┐
│ ●  试穿生成                    │
├──────────────────────────────┤
│ 功能  [ 模特试穿        ▾ ]   │  ← 第1段 功能（来自工具条「功能选项」，此处只读展示+可改）
├──────────────────────────────┤
│ 模型  [ gpt-image-2.5-sun ▾]  │  ← 第2段 模型
│ 画幅  [ 3:4 ▾ ]  数量 [ 2 ▾ ] │  ← 第2段 画幅比例 + 生成数量
├──────────────────────────────┤
│ 画质  [ high ▾ ]              │  ← 第3段 模型支持参数（按模型契约动态渲染）
│ seed  [ 12345   ]             │
├──────────────────────────────┤
│ 参考图 2 张 · 提示词 1 条      │  ← 接线状态回显
│ [        运  行        ]      │  ← 运行按钮（工具条内亦有）
└──────────────────────────────┘
```

- 字段顺序固定：**功能 → 模型 → 画幅比例 + 数量 → 模型其它参数**。
- 模型其它参数按所选模型契约（`modelParameterProfiles` / `imageModels` / `videoModels`）动态渲染，不硬编码。
- 视频生成节点在「画幅+数量」之后额外有：**时长**、**首尾帧**（来自 image 输入的 `first-frame` 边）、**运动参数**。

> **待确认 T2**：视频生成节点的「时长/运动」是否由模型契约动态给出？还是固定枚举？——建议由契约给出（同其它参数一路），避免前端硬编码。

### 3.4 结果节点

```
┌──────────────────────────────┐
│ ●  结果 · 试穿生成             │
├──────────────────────────────┤
│  ┌────┬────┐                 │
│  │ 图1 │ 图2 │                 │  ← 图片网格，点击任一格看大图
│  └────┴────┘                 │
│  来自：试穿生成 · 2 张          │
└──────────────────────────────┘
```

- result-image：网格缩略图，点击任一格 → 现有 `openViewer` 大图查看器。
- result-video：`<video preload="metadata" controls>`，点击播放。
- 结果节点的产物**不得**被「删除生成节点」连带删除（文件层保留，符合 AGENTS.md §3「结果不得被削弱」）。

> **待确认 T3**：一次运行产出 N 张图时，结果节点粒度：
> - **选项 A（本文推荐）**：一次运行 = **一个** result-image 节点，内部网格展示 N 张。
> - 选项 B：每张产物 = **一个** result-image 节点（N 个节点自动排布）。
>
> A 的节点数量可控、同一次运行的产物天然成组；B 更便于逐张单独复用但画布易爆炸。architect 倾向 B，frontend 推荐 A，请你拍板。

> **待确认 T4**：同名「result-video 也能被 video-generator 引用」——视频作参考（v2v）当前 runner 只实现了首帧（0–1 张 image 边）。是否本次先把 `result-video → video-generator` 的边**禁止**，等 backend 扩展 runner 后再放开？

## 4. 交互流程

### 4.1 创建生成节点

```
① 用户选中一个输入节点（text / image / video）
        ↓
② 节点右侧浮出两个胶囊：[生图] [生视频]
        ↓
③ 用户点击其一
        ↓
④ 在源节点右侧 x+380 处新建对应生成节点，并自动连线：
     text   → image-generator.prompt      （text→生图）
     text   → video-generator.prompt      （text→生视频）
     image  → image-generator.reference   （image→生图）
     image  → video-generator.first-frame （image→生视频）
     video  → video-generator.reference   （video→生视频）
        ↓
⑤ 生成节点进入「待配置」态，用户点工具条 [功能选项] 选功能
        ↓
⑥ 配置模型/画幅/数量/参数，点 [运行]
        ↓
⑦ 运行完成 → 在生成节点右侧自动创建 result-image / result-video 节点
```

约束：
- **text 节点只能连 1 个生成节点**：若已有，再次点胶囊时提示「该文本节点已连接生成节点，请先断开」，并提供「断开并新建」。不静默替换。
- 胶囊按钮本身用 shadcn `Button`；两个胶囊的键盘顺序、`aria-label` 齐备。

### 4.2 运行与结果落盘

- 触发：生成节点的 `[运行]`（工具条内 + 卡片底部各一处，同一 action）。
- 运行中：生成节点显示既有「暗房显影」占位动画（`Developing`），结果节点在完成后出现。
- 结果节点由服务端 RunEvent 驱动创建（**不能前端凭空造**，否则刷新/重连丢失）；结果节点必须进 `DocumentSnapshot` 持久化。
- 失败：错误条回显在生成节点上，不创建结果节点；结果未知（`outcome_unknown`）走既有恢复路径。

## 5. 色彩工具（text 节点）

- 入口：text 节点工具条的 `[色彩工具]`。
- 面板：预设色板（数据源 `docs/design/2026-09-17-ui-audit/tokens.json`）+ 原生取色器（封装为项目本地组件）+ `[确定]`。
- 确定后：在文本节点正文的**光标处**插入 `#RRGGBB`；无光标记录时插入正文末尾。
- 键盘可达、色块有 `aria-label`（含色值）。

> 说明：色彩工具不再占用左侧 Rail 入口（按你此前决定：Rail 移除，只保留在文本节点内）。

## 6. 数据模型（前端草案 · 待 architect 定稿）

```ts
// 输入节点（大幅瘦身：不再有 modelOptions/promptVariantId/status/outputImages 之外的生成字段）
export interface TextNodeData  { kind: "text";  label: string; text: string; /* + 既有提示词相关字段 */ }
export interface ImageNodeData { kind: "image"; label: string; mediaUrl?: string; mediaUrls?: string[]; }
export interface VideoNodeData { kind: "video"; label: string; mediaUrl?: string; }

// 生成节点
export interface ImageGeneratorNodeData {
  kind: "image-generator";
  label: string;
  status: NodeRunStatus;
  promptVariantId?: string;
  modelId?: ImageModelId;
  aspectRatio?: string;
  batchSize?: number;
  modelOptions?: Record<string, unknown>;
  error?: string;
}
export interface VideoGeneratorNodeData {
  kind: "video-generator";
  label: string;
  status: NodeRunStatus;
  promptVariantId?: string;
  modelId?: VideoModelId;
  aspectRatio?: string;      // 首尾帧任务必须 "adaptive"
  batchSize?: number;
  duration?: number;         // 待确认 T2
  modelOptions?: Record<string, unknown>;
  error?: string;
}

// 结果节点
export interface ResultImageNodeData {
  kind: "result-image";
  label: string;
  sourceGeneratorId: string;   // 来源生成节点
  runId?: string;              // 运行记录引用
  images: string[];            // 该次运行的全部产物
  providerOutputSizes?: Array<string | null>;
}
export interface ResultVideoNodeData {
  kind: "result-video";
  label: string;
  sourceGeneratorId: string;
  runId?: string;
  videos: string[];
}
```

> 以上字段名待 architect 在 `docs/design/2026-09-21-five-node-model/contracts/` 定稿。前端 UI 不依赖未定稿字段名实现。

## 7. 迁移（v7 → v8）

已确认走**保守路径**（用户决策）：
- 旧 image/video 节点整体迁为对应**输入节点**，保留全部 `outputImages` / `outputVideos`；
- **不自动拆**出 generator / result（v7 的 `outputImages` 不区分「上传」与「生成」，自动拆会污染数据）；
- 旧项目迁移后 = 保数据、不保可运行性；用户想再跑生成，手动补一个生成节点接上去；
- 打开旧项目**不拒绝**（符合 §3 不削弱结果）。

## 8. 影响面

### 前端（我负责）
- `src/types/workflow.ts`：`NodeKind` 扩展、`NODE_SPECS`、各 NodeData 类型
- `src/components/nodes/`：`TextNode` / `ImageNode` / `VideoNode` 重构；新增 `ImageGeneratorNode` / `VideoGeneratorNode` / `ResultImageNode` / `ResultVideoNode`；`NodeFrame` 加工具条槽位
- 新增 `NodeToolbar`（各 kind 配置表）
- `NodeInspectorWindowPortal`：按新模型重写或退役（生成参数改为节点内联）
- `src/store/flowStore.ts`：节点规范化、运行入口、结果节点创建（RunEvent 驱动）
- `src/lib/documentSnapshot.ts`：v8 快照序列化 + v7 迁移
- 图不变量校验（§2 连线规则）
- `src/components/workbench/railConfig.tsx`：色彩工具入口移除

### 后端（backend）
- `server/engine/dag.ts`：识别 `*-generator`，提取参数
- `server/engine/runner.ts`：统一入口执行 image-generator / video-generator
- `server/lib/workflowSchema.ts` + 图不变量：新连线规则校验
- 模板注册：17 个内置模板重写为 v8 结构（输入层 + 生成层，不含 result）

### 契约（architect）
- `contracts/data-model.md`、`runtime.md`、`migration.md`、`template-format.md`

## 9. 决策记录（用户已拍板）

| # | 决策 | 结论 |
|---|------|------|
| D1 | 节点模型 | 拆成输入 / 生成 / 结果三层 |
| D2 | 基础节点数 | 7 kind（3 输入 + 2 生成 + 2 结果） |
| D3 | 输入节点是否保留生成功能 | 完全删除 |
| D4 | 生成结果位置 | **不**在生成节点内显示，必须独立结果节点 |
| D5 | 工具条归属 | 每个基础节点正上方各有一条，内容互不相同 |
| D6 | `[功能选项]` 归属 | 生成节点内（见 T1 备注） |
| D7 | 参数面板内容 | 仅模型 + 模型匹配参数 + 生成数量；**不含功能目录** |
| D8 | text→生成节点数量 | 1 个 |
| D9 | 输入节点互连 | 禁止 |
| D10 | 生成节点存续 | 独立持久，不因上游断连而消失 |
| D11 | 旧项目迁移 | 保守路径（保数据不保可运行性） |
| D12 | 17 个模板 | 全部按 v8 重写 |

## 10. 契约待定项（已裁定）

| # | 问题 | 裁定 | 状态 |
|---|------|------|------|
| Q1 | 输入节点是否完全删除生成功能 | 完全删除 | ✅ 用户确认 |
| Q2 | generator 节点 data 字段 | 按 §6 草案 | ✅ 用户确认 |
| Q3 | runner 执行语义 | 统一入口（只认 `*-generator`，内部分发图像/视频模型） | ✅ 用户确认 |
| Q4 | 向后兼容 | 自动迁移；outputImages 保留在原节点（保守，不自动拆 generator/result） | ✅ 用户确认 |
| Q5 | 17 个内置模板 | 全部重写为 v8 结构 | ✅ 用户确认 |
| Q6 | result 节点字段 | `sourceGeneratorId` / `runId` / `images`\|`videos` / `providerOutputSizes` | ✅ 用户确认 |
| Q7 | N 张产物的结果节点粒度 | **一次运行 = 一个结果节点，内部网格展示 N 张** | ✅ 用户确认 |
| Q8 | result-image 可否被下游 generator 引用 | 可以，作为 `reference` 输入 | ✅ 用户确认 |
| T1 | `[功能选项]` 归属 | 在生成节点内 | ✅ 已定 |
| T2 | 视频「时长/运动」参数来源 | 由模型契约动态给出，前端不硬编码 | ✅ 已定 |
| T3 | 结果节点粒度 | 同 Q7：1 个节点（网格） | ✅ 已定 |
| T4 | `result-video → video-generator` 边 | **本次先禁止**，等 runner 支持 v2v 再放开 | ✅ 已定 |

> 后续字段名以 architect 的 `contracts/*.md` 为准；契约未定稿前不写实现代码。

## 11. 验证计划（实现阶段）

- `tsc --noEmit`（`npm run lint`）
- 聚焦测试：`npx tsx tests/<受影响的>.test.ts`（图不变量 / 快照往返 / 模板格式）
- 交付前：`npm run check`、`npm run build`、`git diff --check`、ast-grep + dependency-cruiser 扫描
- UI 证据：1024 / 1280 / 1440 三宽度截图（`ui-qa` 验收）
