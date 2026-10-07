# 图片节点本地编辑面板 v2 — 蒙版重绘改造 + 多轮修改（送审方案）

- 日期：2026-10-06 · owner：frontend · 送审：architect
- 状态：**待架构师审核**（用户已确认设计稿 v2；本方案通过后动手实现）
- 关联契约：`65d-mask-redraw-panel-contract.md`（v3，architect scratch）。本方案**修订**其决策 E 与 §2.2 面板布局行；合成 step / image-node-updated / 类型收窄等其余部分保持。
- 设计稿：`docs/design/2026-10-06-image-edit-panels-v2/design-v2.html`（本目录，含工具条 + 两个编辑页 + 运行/完成态）

---

## 0. 用户已拍板决定（不可再议）

**设计侧**

1. 蒙版重绘与多轮修改均为「工具条点击 → 专属全屏编辑页」；两个入口**并列独立**，流程不合并。
2. 工具条命名与顺序：`蒙版重绘 · 多轮修改 · 裁剪 · 抠图 · 复制 · 替换`（前两项前置到最前）。
3. 面板形态：**无顶栏**；标题（「蒙版重绘」/「多轮修改」）+ 关闭按钮置于右栏顶部；右栏 ≈ 1/4 宽，承载**全部**文本/参数/按钮/滑杆；左栏 ≈ 3/4 仅图片与绘制层；**ESC 可关闭**。
4. 羽化：默认勾选「自适应」（不写数值）；拖动滑杆**自动取消勾选**、按滑杆值（0–64）生效；重新勾选回自适应。
5. 执行语义：点主按钮 = **自动保存**当前涂抹/标记 → 发起修改；运行期左栏切「显影中」全局动效（与图片/结果节点同款）；完成后**结果直接覆盖左栏图片**、页内停留可看，手动关闭（✕/ESC）。
6. 节点卡片内联编辑面板（修改描述 + 蒙版重绘/整图编辑按钮）**整块移除**。

**技术侧**

7. 多轮机制：**每轮独立一次修改请求**，「上一轮结果」即下一轮底图 —— 无需服务端会话（API易网关实测 `previous_response_id` 不生效，官方 prompting 指南的迭代做法一致）。
8. 标记不保留：提交后只保留**新生成的图**；新图作为下一轮底图继续标记；旧图（含标记）不落盘。
9. 标记提交 = 方案 A：前端把「底图 + 标记」**合成一张图**作为本轮输入。
10. 「整图编辑」更名「多轮修改」；「蒙版」→「蒙版重绘」（工具条按钮与面板标题统一）。

---

## 1. 目标形态

```
┌────────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────┐ ┌─────────────────────┐ │
│ │  左栏 ≈3/4                     │ │ 蒙版重绘        ✕   │ │
│ │  图片 + 涂抹/标记绘制层         │ ├─────────────────────┤ │
│ │  （运行期 = 显影中动效）        │ │ 绘画工具/标记工具    │ │
│ │                                │ │ 笔刷 · 羽化 · 撤销…  │ │
│ │  完成 = 新图直接覆盖            │ │ 修改描述（≤500）     │ │
│ │                                │ │ [蒙版重绘]/[开始修改]│ │
│ └────────────────────────────────┘ │ 保存蒙版 / 修改记录  │ │
│                                    └─────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

- 右栏宽度：`clamp(256px, 25%, 360px)`，纵向可滚动（1024 宽视口仍完整可用）。
- 两个面板共用同一骨架（全屏 portal）；左栏仅在：有绘制层、运行期遮罩、结果图上有差异。

与 v1 实现（已有 commit a29e8a0 / ecc9bfa / 4de1ec8 / d88ea8e）的差异：

| # | v1 现状 | v2 目标 |
|---|---------|---------|
| 1 | 编辑面板内联在节点卡片上 | 整块移除；入口迁到工具条两个按钮 |
| 2 | 蒙版编辑页：顶栏 + 底部横条，控件分散 | 控件全部入右栏；无顶栏；标题+✕在右栏 |
| 3 | 无羽化控件 | 右栏新增勾选式自适应 + 0–64 滑杆 |
| 4 | 执行无动效、无页内结果 | 运行期「显影中」；完成后结果覆盖左图、停留可看 |
| 5 | 无多轮修改功能 | 新建：标记 + 描述 → 多轮迭代（独立入口） |
| 6 | 无 ESC 处理 | ESC 关闭（上传中除外） |

---

## 2. 前端实现（本域）

### 2.1 工具条（`src/components/nodes/NodeToolbar.tsx`、`ImageNode.tsx`）

- `MASK` 定义 label「蒙版」→「蒙版重绘」（:78）；新增 `MULTI_EDIT` 动作（label「多轮修改」，图标待定，建议 sparkle/pen 系）。
- `NODE_TOOLBAR_ACTIONS.image`（:82）重排为：`[MASK_REDRAW, MULTI_EDIT, CROP, MATTING, COPY, REPLACE]`。
- 绑定（`ImageNode.tsx` actions）：两者点击分别打开对应面板；未上传图片时禁用，原因文案「请先上传图片后再使用」。
- 面板开关状态：`ImageNode` 本地 state（与现 `editingMask` 同思路），分别 `editingMaskRedraw` / `editingMultiRound`。

### 2.2 蒙版重绘面板（改造 `src/components/nodes/MaskEditor.tsx`）

结构（左栏不变：图片 + 涂抹画布；右侧新增属性栏）：

- **右栏顶部**：标题「蒙版重绘」+ ✕（关闭）。
- 绘画工具：`涂抹修改区/恢复保留区` 模式段、笔刷滑杆（8–300）、**羽化行**、`撤销/重做/清空/反选`。
  - 羽化交互：`☑ 自适应`（默认，`featherRadius=undefined`）→ 拖滑杆自动取消勾选并写入 0–64；重新勾选回 undefined。值随 `saveMaskDraft`/执行一起持久化（现 `saveMaskDraft` 回调已可写 data，仅追加 featherRadius 写入）。
  - 保留原底部说明文案（「红色是修改中心…」）作为右栏小字。
- 修改描述：单行/多行输入（≤500，`maxLength` + 计数），绑定 `editPrompt`（coalesced 编辑通道，与现实现一致）。
- 主按钮**「蒙版重绘」**：有蒙版可执行；执行 = 自动保存蒙版（上传 mask-draft）→ 发起 `runImageEdit(id, prompt)`。
- 次按钮**「保存蒙版」**：保留（只存草稿不执行）。
- 状态行：显示上次执行结果（成功/失败原因），失败红色。
- **运行期**：左栏整幅覆盖 `Developing`（复用 `NodeFrame.tsx:263-271` 的显影中组件），绘制层与控件锁定；左栏图片来源改为**响应 store**（现为 open 时刻快照，需能反映 `image-node-updated` 覆盖后的新图）。
- **完成**：左栏显示新 `outputImages[0]`；mask 四字段已被清（契约 §3.4）→ 涂抹层重置为空白，可继续涂抹再执行。
- **关闭**：✕ / ESC；上传中禁用，运行中可关闭（run 已在 store 持久跟踪，节点态继续更新）。

### 2.3 多轮修改面板（新建 `src/components/nodes/MultiRoundEditPanel.tsx`）

- 右栏顶部：标题「多轮修改」+ ✕。
- 标记工具：`画笔 / 箭头 / 矩形 / 圆形 / 文字`；颜色（红/绿/蓝/白 4 预设，默认红）、粗细滑杆、`撤销 / 重做 / 清空标记`。
  - 绘制层与蒙版编辑器同构：离屏 canvas 以**原图自然尺寸**存储，指针坐标按 `canvas.width/rect.width` 缩放（复用 `MaskEditor.pointForEvent/drawSegment` 模式）。
  - 「文字」工具：点图面弹出内联输入（内容渲染进合成图）。
  - 撤销/重做：快照栈（复用 MaskEditor 模式，MAX_HISTORY）。
- 修改描述：输入（≤500，计数），同样绑定 `editPrompt`；标签显示「修改描述 · 第 N 轮」。
- 主按钮**「开始修改」**：描述必填（trim 非空，与既有服务端门一致）；执行 = 合成 → 上传 → 发起多轮 run（见 §4.1）。
- 修改记录：页内会话条（`原图 / 第1轮 / 第2轮 …`），当前轮高亮；**本期仅展示，无回退**。数据为面板本地状态（打开面板时以当前 `outputImages[0]` 为「原图」；成败轮次依次追加）。持久化留后续。
- 运行期/完成/关闭：同 2.2（显影中、结果覆盖、标记层清空可继续下一轮）。

**合成与上传（方案 A）**：
1. 离屏 canvas（原图自然尺寸）→ `drawImage(底图)` → `drawImage(标记层)` → `toBlob("image/png")`；
2. 上传（端点与生命周期见 §4.2）得到 `editInputRef` URL；
3. 调 `runImageEdit(id, prompt, { editInputRef })`（见 2.4），由 action 内置 saveTab + POST。

### 2.4 flowStore（`src/store/flowStore.ts`）

- `runImageEdit` 扩展为 `(id: string, prompt: string, opts?: { editInputRef?: string })`：
  - 蒙版路径：显式 `editInputRef: undefined`（fail-closed，防陈旧合成图引用被 dag 使用）；
  - 多轮路径：写入合成图 URL；
  - 其余（clientRequestId 幂等、AmbiguousRunSubmission 处理、事件消费）不变。
- `image-node-updated` 应用（`applyImageNodeUpdatedEventToTab`，:2983 起；live + resume 两条路径共用）：
  - 清除字段由 4 个 → **5 个**（mask / maskSourceRef / featherRadius / editPrompt / **editInputRef**）；
  - 幂等判定（alreadyApplied）同步关注第五个字段。
- 失败结算：`editInputRef` 在确定性失败（error/cancelled）时清除；`retry_wait/outcome_unknown`（同步中断）保留待恢复。

### 2.5 测试与 e2e（本域）

- **改写**：`e2e/workbench.spec.ts:1409+`（v1 内联面板断言 → 新面板：工具条入口、右栏控件、显影中、结果覆盖、多轮合成上传 + 合成 run 载荷）。
- **更新**：聚焦单测中引用节点卡片面板/工具条文案者（`mask-processing` / `five-node-model-ui` / `project-tabs` 等，落地时以实际断言面为准逐一对齐）。
- **新增**：多轮面板合成逻辑单测（合成尺寸=自然尺寸、标记层叠加、上传参数）、羽化勾选交互单测。
- 视觉验收：ui-qa（两面板 × 三档宽度，见 §7）。

---

## 3. 契约修订说明（供 architect 更新 65d 契约）

- 决策 E 原义「整图编辑：无 mask → edit（flare-vip），同一面板」**修订**为：多轮修改是**独立功能/独立入口**；其执行路径仍走合成 step 的 `edit` + `flare-vip` 分支，但输入图 = 合成图（§4.1），且新增标记交互与多轮语义。
- §2.2 面板行「3/4 图 + 1/4 属性栏：绘画工具 + 羽化 + 提示词 + 执行按钮 + 结果预览」本次**落地**（v1 实现偏离了此布局，v2 回归）。
- §1.1 `ImageNodeData` 字段清单需增加 §4.1 裁决的新字段。

---

## 4. 跨域契约点（请架构师裁决）

> 这是本方案**唯一**的跨域改动（其余全部前端域内）。用户已拍板方案 A（合成图），以下是如何接入服务端的机制选择。

### 4.1 合成图如何进入合成 step 的输入（核心裁决项）

**选项 A（推荐）：`ImageNodeData` 新增可选字段（暂名 `editInputRef?: string`）——「本轮编辑输入图」。**

- schema：image case 接受该字段（校验风格对齐 `mask`/`maskSourceRef` 的 `imageReference`）。
- dag 合成 step（`server/engine/dag.ts:169-210`）：`primary = editInputRef ?? outputImages[0]`；mask 存在时不使用该字段（见 §4.4 冲突规则）。
- **天然复用既有全部机制**：字段随 flow 保存 → runPlan 的 identity 校验（submittedPlan ≡ basePlan）直接覆盖；静态引用可达性校验（`staticImageReferencesForPlan` → `assertImageReferencesAccessible`）自动覆盖合成图文件；`generation_runs` 参数照常落库。
- 前端：`image-node-updated` 应用时清零（§2.4）；`documentSnapshot` 白名单与投影同步加字段（否则落盘闸 red）。

**选项 B：run-plan body 顶层新增字段（不进 flow）。**

- 需 runPlan 在 plan 构造后替换合成 step 的 `inputImages[0]/inputReferences[0]/upstream[0].images`；
- identity 校验不覆盖该字段（提交方可任意指向，语义分散在 route 层），无先例；
- **不推荐**。

### 4.2 合成图文件生命周期

现状：常规上传（`/api/files`，`source_type='upload'`）无回收机制、会进素材可见面；mask 走 `/api/files/mask`（`mask-draft` + `purge_after` + 项目保存时认领）。

建议（镜像 mask-draft）：
- 新端点 `POST /api/files/edit-draft`（或等价）：入参 `{ dataUrl, projectId, nodeId }`，`source_type='edit-draft'`、`image/png`、创建即带 `purge_after`（保留期可与 mask-draft 同档）；**不重编码**（保像素，同 mask 保存路径）。
- 成功执行后前端清字段 → 文件成为无主资产，走既有过期回收（或由后端在 run 完成时显式降期）。
- 若架构师认为可简化（如复用普通 upload + 定期清理），请给出口径；前端只依赖「上传返回 URL、URL 可被 run 引用、最终可回收」。

### 4.3 同步清单（若采纳选项 A）

| 文件 | 改动 | 域 |
|---|---|---|
| `src/types/workflow.ts` | `ImageNodeData.editInputRef?` | 共享类型（architect 裁决后落） |
| `server/lib/workflowSchema.ts` | image case 接受 `editInputRef`（imageReference 校验） | backend |
| `server/engine/dag.ts` | 合成 step 输入源改为 `editInputRef ?? outputImages[0]`；冲突规则（§4.4） | backend |
| `server/routes/files.ts`（+`lib/fileStore.ts`） | `edit-draft` 端点与回收策略（§4.2） | backend |
| `server/routes/runPlan.ts` | `imageEditGate` 大概率无需改（描述必填门已覆盖）；若需「有 editInputRef 无描述」的专属文案请裁决 | backend |
| `src/lib/documentSnapshot.ts` | image 白名单 + 投影加字段 | frontend |
| `src/store/flowStore.ts` | runImageEdit 扩展 + 清字段扩为 5 | frontend |
| 测试 | dag 合成 step（editInputRef 优先）、schema、runPlan、前端应用清字段 | 各自域 |

### 4.4 mask 与 editInputRef 并存规则（请裁决）

建议 **fail-closed**：两者同时在节点 data 上出现时，dag 合成 step 抛 `DagError`（明确文案）；前端层面多轮修改面板在节点带 mask 时禁用执行并提示「图片当前带有蒙版，请先清除蒙版或使用蒙版重绘」。理由：两功能在产品上并列独立，并存只可能是脏数据/缺陷，静默取一会有意外扣费风险。

### 4.5 附加项（可选，请裁决是否纳入）

多轮修改走 `edit` 模式，而 `modeSystemText("image-generator","edit")` 现为**空串**（`server/lib/promptPresetsFrozen.ts`）——即「图中红色标记 = 修改意图」需要由用户描述自行表达。是否要为多轮修改注入一段系统性说明文本（如「图中彩色标记标注了需要修改的位置，请按标记与描述执行」）？若需要，属 `MODE_SYSTEM_TEXT` 变更（backend + 冻结快照影响面需评估）；不需要则维持现状（依赖用户描述）。

---

## 5. 待决问题清单（汇总给架构师）

1. **§4.1 选项 A/B**：字段方案（推荐）或 body 方案；字段命名（建议 `editInputRef`，备选 `editSourceRef`）。
2. **§4.2**：`edit-draft` 端点形态与回收口径是否采纳镜像方案。
3. **§4.4**：并存冲突规则（建议 fail-closed + 面板禁用）。
4. **§4.5**：是否注入多轮修改的系统性说明文本。
5. 提交要求默认口径：**修改描述必填、标记可选**（与既有服务端门一致）。若用户后续要「仅标记可提交」，需扩 `imageEditGate`——本方案不纳入，先记录。
6. 「修改记录」本期仅展示（无回退）——用户已同意；持久化留后续。

---

## 6. 影响面（文件级，前端为主）

```
前端（本域）
  src/components/nodes/NodeToolbar.tsx      工具条：改名 + 新动作 + 重排
  src/components/nodes/ImageNode.tsx        移除内联面板；接两个面板入口
  src/components/nodes/MaskEditor.tsx       → 蒙版重绘面板改造（右栏化/羽化/ESC/显影中/结果覆盖）
  src/components/nodes/MultiRoundEditPanel.tsx  新增
  src/components/nodes/MarkLayer.tsx (暂名)     新增：标记绘制层（画笔/箭头/矩形/圆形/文字）
  src/lib/editComposite.ts (暂名)           新增：合成导出 + edit-draft 上传
  src/store/flowStore.ts                    runImageEdit 扩展 + 清字段 5 项 + 失败清 ref
  src/lib/documentSnapshot.ts               白名单 + 投影加字段
  src/types/workflow.ts                     ImageNodeData 新字段（共享，随 §4 裁决）
  e2e/workbench.spec.ts                     面板断言重写 + 多轮新用例
  tests/*                                   聚焦断言对齐（mask-processing 等）+ 新增合成/羽化单测

服务端（随 §4 裁决，另行拆分）
  workflowSchema / dag / files(edit-draft) / runPlan(如需) / 对应测试
```

## 7. 验收口径

- `tsc --noEmit` 0；受影响单测全绿（聚焦先跑，交付前全量 73+）。
- e2e：workbench 面板用例改写后过（desktop-1280 起步，交付含矩阵）。
- 视觉/可访问性：ui-qa 对两面板 × 三档宽度（1024/1280/1440）验收入档；对比度/焦点/ESC 行为清单纳入。
- 手工链路：上传图 → 蒙版重绘（画蒙版/羽化/描述/执行/显影中/结果覆盖）→ 多轮修改（标记+文字/描述/执行/结果覆盖/第二轮）→ 画布节点原位替换、无结果节点新建。

---

## 8. 请架构师回复方式

- 直接在本文档上批注（推荐），或回消息给我（frontend）。
- 关键裁决项：§4.1 / §4.2 / §4.4 / §4.5（其余默认通过即可开工）。
- 你裁决后：若涉服务端（大概率），请顺手把 backend 任务拆出来；我这边按裁决启动前端实现。
