# 工作台入口接线 + AI 画板 + 色彩工具 — 实施方案（待评审）

- 日期：2026-09-19 · 起草：frontend
- 状态：**草案，待 architect 评审 / 用户确认后开工**
- 关联：`src/components/workbench/{railConfig.tsx, WorkbenchShell.tsx}`、`docs/design/2026-09-18-three-node-model/`

## 0. 已确认决策（用户拍板）

1. **17 个工作流菜单项** → 每一项对应一个内置 `WorkflowTemplate`，点击即 `launchTemplateInNewTab` 新开项目页签（与项目中心「从模板新建」一致）。**所有模板只能组合基础节点 text/image/video，禁止造新节点类型**，保证基础节点演进时模板不漂移。
2. **AI 画板** → 独立的自由绘画画布（不放在 React Flow 里），画的是**服装设计草图/标记，导出 PNG 后作为输入图喂给 AI 生成**。选型 **Excalidraw（MIT）**。
3. **色彩工具** → 从左侧 Rail **完全移除**，图标+窗口搬进**文本节点悬浮窗（功能设置）的第一个位置**；选色 + 确定后，在**光标处**把 `#RRGGBB` 插入该文本节点的提示词正文。

> 关键许可事实：tldraw 2025-09 起 v4 SDK 转商业许可（生产约 $6000/年，免费档强制水印），仅 1.x MIT 但永久停更 —— 故选 Excalidraw。

---

## 1. Part A：17 菜单项 → 模板映射 + 流程草案

### 1.1 映射表（草案，模板 id 待 architect 定稿命名）

| 菜单组 | 菜单项 id | 模板 id（草案） |
|---|---|---|
| AI 换装 | model-tryon | `builtin-model-tryon` |
| AI 换装 | pose | `builtin-pose` |
| AI 换装 | background | `builtin-background-swap` |
| AI 换装 | lookbook | `builtin-lookbook` |
| AI 换装 | digital-model | `builtin-digital-model` |
| 服装设计 | print-extract | `builtin-print-extract` |
| 服装设计 | print-mutate | `builtin-print-mutate` |
| 服装设计 | recolor | `builtin-garment-recolor` |
| 服装设计 | fabric | `builtin-fabric-swap` |
| 服装设计 | sketch-render | `builtin-sketch-to-garment` |
| 服装设计 | ai-restyle | `builtin-ai-restyle` |
| 服装设计 | outfit | `builtin-outfit-recommend` |
| 服装设计 | mannequin | `builtin-person-to-mannequin` |
| 视频生成 | runway | `builtin-video-runway` |
| 视频生成 | xhs | `builtin-video-xhs` |
| 视频生成 | keyframes | `builtin-video-keyframes` |
| 视频生成 | video-clone | `builtin-video-clone` |

前端侧新增 `src/lib/workflowMenuMapping.ts`：`Record<RailMenuItem.id, templateId>`，并校验每个 id 都能在 `/api/templates` 列表里解析；模板缺失时 fail-closed（不静默跳节点库），显示「模板未就绪」。

### 1.2 各模板流程草案（仅基础节点；节点位置沿用现有网格 ±380/760 惯例）

> 记法：T = text 节点，I = image 节点，V = video 节点；边标注 prompt / reference。

**AI 换装（image 节点为主，R8 输入输出同体）**
1. model-tryon 模特试穿：`T(要求：模特姿态/场景,可空) →prompt I(上传服装图，edit 变体，提示词「同一模特穿上该服装」)`
2. pose 摆拍 Pose：`T(指定 Pose/镜头) →prompt I(上传服装或模特图，edit)`
3. background 更换背景：`T(目标背景描述) →prompt I(上传人物/产品图，edit)`
4. lookbook LookBook：`T(风格/场景清单) →prompt I(上传服装，edit，batchSize 可选 2/4)`
5. digital-model 数字模特：`T(数字模特风格要求) →prompt I(上传服装，edit)`

**服装设计**
6. print-extract 印花提取：`T(提取要求) →prompt I(上传带印花服装，edit，提示词「平铺提取印花」)`
7. print-mutate 印花裂变：`T(裂变方向/数量) →prompt I(上传印花，edit，batchSize)`
8. recolor 服装换色：`T(目标配色清单) →prompt I(上传服装，edit)`
9. fabric 面料更换：`I(服装) ─reference→ I(合成节点，edit)`；`T(面料/参考说明) →prompt I合成`；另可 `I(面料参考) ─reference→ I合成`
10. sketch-render 线稿图到服装：`T(面料/色彩/风格) →prompt I(上传线稿，edit)`
11. ai-restyle AI 改款：`T(改款指令：领型/袖长…) →prompt I(上传服装，edit)`
12. outfit 穿搭推荐：`T(场合/风格/身材) →prompt I(generate 变体)`
13. mannequin 真人转人台：`T(人台/立裁要求) →prompt I(上传真人着装图，edit)`

**视频生成（video 节点；异步 submit+轮询，当前唯一模型 doubao-seedance-2-5-260628）**
14. runway 服装走秀：`T(走秀/镜头/场景) →prompt V`；`I(服装/模特图) ─reference→ V`
15. xhs 小红书视频：`T(小红书风格脚本) →prompt V`；`I(主图) ─reference→ V`
16. keyframes 首尾帧：`I(首帧) ─reference→ V`、`I(尾帧) ─reference→ V`；`T(运动描述) →prompt V`
17. video-clone 视频复刻：`T(复刻要求) →prompt V`；（输入视频是否可作为 video 节点引用 —— **见 §6 契约问题**）

### 1.3 模板种子实现位置（backend 执行，architect 定稿流程后）

- 在 `server/routes/templates.ts` 的 `builtinTemplates()` 增 17 条，复用现有 `textNode()/imageNode()` helper；新增 `videoNode()` helper（同构：绑定 promptVariantId/modelId/默认 modelOptions）。
- 启动时 `ensureBuiltinTemplates()` 自动增量补齐，无需迁移。
- 模板默认提示词只放**结构化占位**（如 `【服装】上传 / 【要求】…`），不写死具体色值/面料，避免误导。

---

## 2. Part B：AI 画板（Excalidraw）

- 新依赖：`@excalidraw/excalidraw`（MIT）。**需用户确认引入**；以独立 lazy chunk 加载（预计 gzip 数百 KB，不进主包），`build:web` 时核对单 chunk ≤ 500KB，超限报门禁。
- 形态：工作台级**全屏覆盖视图**（非路由多页、非节点），由 Rail「AI 画板」点击进入；Esc/关闭回工作台。打开时记录来源 tabId，返回不丢画布上下文。
- 组件：`src/components/drawing/DrawingCanvas.tsx`（Excalidraw 薄封装，主题接 `--gc-*`，字体/配色跟随当前主题；不引入第二主题源）。
- 核心动作「**用作输入图**」：`exportToBlob({mimeType: png})` → 校验尺寸（沿用 imageValidation）→ POST `/api/files` → 在原 tab 加一个 image 节点（R8：直接写入 outputImages）或连接到当前选中的 image 节点；成功后自动关闭画板并定位该节点。
- 不做：画板作品持久化/云端同步（会话内临时草图；v1 仅内存态，刷新丢弃，UI 需明示）。

---

## 3. Part C：色彩工具（迁入文本节点悬浮窗）

- Rail：删除 `color-tools` 入口及其分隔线位置调整（`RAIL_SEPARATOR_BEFORE` 同步）。
- 新组件：`src/components/nodes/inspector/ColorPickerSection.tsx`，作为 `NodeInspectorWindowPortal` 内 **text 节点的第一个 section**。
- 控件构成（无新依赖）：预设色板（项目常用色，数值从 token/常量文件导入，不在组件硬编码）+ 原生 `<input type="color">`（自绘为 shadcn 风格的项目本地 primitive 封装）+ 只读/可编辑 hex 输入（校验 `/^#[0-9a-fA-F]{6}$/`）+ 「确定」。
- 插入逻辑：
  - 新 hook `useTextInsertionCursor(nodeId)`：TextNode 正文 textarea 在 blur/打开悬浮窗前记录 `selectionStart/End`；确定时把 `#RRGGBB` 写入该区间（无选区则插入光标处；无记录则追加末尾并提示）。
  - 写入走 `updateNodeDataInTab`（保持 tabId/documentEpoch 绑定），插入后正文与 `useCoalescedTextEdit` 状态同步，不产生双写。
- 可访问性：控件 label/键盘可达/可见焦点、`aria-live` 反馈插入结果、减少动效。

---

## 4. 改动文件与影响面

**前端（src/）**
- `components/workbench/railConfig.tsx`：删 color-tools；`RailMenuItem` 无需加字段（映射放独立表）。
- `components/workbench/WorkbenchShell.tsx`：`handleSelectItem` 非 nodeKind 分支 → 查映射表 `launchTemplateInNewTab`；AI 画板入口 → 打开 DrawingCanvas。
- `lib/workflowMenuMapping.ts`（新）：17 项菜单 id → templateId + 运行时解析校验。
- `components/drawing/DrawingCanvas.tsx`（新）+ 工作台视图开关状态。
- `components/nodes/inspector/ColorPickerSection.tsx`（新）。
- `components/nodes/NodeInspectorWindowPortal.tsx`：text 节点挂载色彩区为第一 section。
- `hooks/useTextInsertionCursor.ts`（新）；`components/nodes/TextNode.tsx` 接光标记录。

**后端（server/）— 不属本卡，backend 实施**
- `routes/templates.ts`：+17 模板、`videoNode()` helper。

**共享契约 — architect 定稿见 §6。**

**依赖**：`@excalidraw/excalidraw`（MIT，lazy）——需用户批准。

---

## 5. 验证计划

- 聚焦测试：
  - `workflowMenuMapping`：17 项全部能解析到模板；缺失模板 fail-closed。
  - 色彩插入：光标中/选区替换/无记录追加三路径；非法 hex 拒绝。
  - 模板：17 个内置模板均可被 `createDocumentSnapshot`/`launchTemplateInNewTab` 正常打开（含 video 节点）。
- 交付前：`tsc --noEmit`、`build:web`（chunk 门禁）、ast-grep + depcruise、`npm run test`、相关 e2e（菜单点击→新 tab；选色插入）。
- 视觉/可访问性验收交 ui-qa（悬浮窗第一区、画板主题适配）。

## 6. 待 architect / 用户确认点

1. **video 节点输入契约**：Seedance 是否接受参考图（首/尾帧）？reference 边连入 video 节点的顺序与数量规则？（决定模板 14–16）
2. **视频复刻（17）**：video 节点能否引用已有视频作为输入（视频到视频）？若无 v2v，该模板降级为「上传抽帧图 + 提示词」或暂缓。
3. 17 个模板 id 命名与种子提示词口径（§1.1/1.2）。
4. AI 画板导出 PNG 的默认分辨率/背景（透明 vs 白底）——喂 AI 时建议白底。
5. 色板预设色值清单的数据源（设计 token 文件路径）。
6. 批准引入 `@excalidraw/excalidraw`。
