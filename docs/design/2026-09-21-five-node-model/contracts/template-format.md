# 模板格式契约 — v8 内置模板

- 状态：**已定稿**（architect 2026-09-21）
- 依赖：`data-model.md`、`runtime.md`
- 项目硬规则：`AGENTS.md`（引用，不复述）

## 1. 模板结构总则

v8 模板 = **输入层 + 生成层 + 边**；**不含结果节点**。

理由：结果节点是运行时的产物（runtime.md §3），模板是静态起点，不可能预置产物。

```
模板节点 kind ∈ { text, image, video, image-generator, video-generator }
模板边   ∈ { text→generator[prompt], image→generator[reference],
             result-image→generator[reference]（模板里不出现，无 result 节点） }
```

## 2. 命名规则

模板 id 前缀 `builtin-`，全小写连字符。菜单项 id（`src/components/workbench/railConfig.tsx`）
与模板 id 通过 `src/lib/workflowMenuMapping.ts` 解耦映射。

## 3. 17 个模板的分期

| 期 | 模板 | 理由 |
|----|------|------|
| **本期（15 个）** | model-tryon / pose / background / lookbook / digital-model / print-extract / print-mutate / recolor / fabric / sketch-render / ai-restyle / outfit / mannequin / runway / xhs | 全部落在现有 runner 能力内 |
| **延后（2 个）** | keyframes（首尾帧）/ video-clone（视频复刻） | runner 未实现尾帧与 v2v（见 runtime.md §2.1 T4 与 data-model.md §0 T4） |

**延后模板的 UI 行为**：菜单项保留，点击后提示「该功能正在开发中」，不静默失败、
不跳节点库（plan.md §1.1 的 fail-closed 要求）。

## 4. 本期 15 个模板规格

记法：`T`=text，`I`=image，`IG`=image-generator，`VG`=video-generator。

公共默认值：

```
EDIT_VARIANT   = fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1
GENERATE_VARIANT = fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1
IMAGE_MODEL    = gpt-image-2.5-flare-vip
VIDEO_MODEL    = doubao-seedance-2-5-260628
VIDEO_OPTIONS  = { seconds: "5", resolution: "720p", aspectRatio: "adaptive" }
```

> 变体 id 以 P2-d 目录重写后的实际值为准（`src/lib/garmentPromptPresets.ts`）；
> 下列 id 为当前目录值，backend 注册前需用 `getGarmentPromptVariantById` 逐条解析验证。

### 4.1 AI 换装（5 个）

| # | 菜单 id | 模板 id | 节点 | 边 |
|---|---------|---------|------|-----|
| 1 | model-tryon | `builtin-model-tryon` | `T(试穿要求)` `I(服装图)` `I(数字模特)` `IG(试穿生成)` | T→IG.prompt；I(服装)→IG.reference；I(数字模特)→IG.reference |
| 2 | pose | `builtin-pose` | `T(Pose/镜头要求)` `I(服装或模特图)` `IG(摆拍生成)` | T→IG.prompt；I→IG.reference |
| 3 | background | `builtin-background-swap` | `T(目标背景描述)` `I(人物或产品图)` `IG(换背景生成)` | T→IG.prompt；I→IG.reference |
| 4 | lookbook | `builtin-lookbook` | `T(风格/场景清单)` `I(服装图)` `IG(LookBook 生成, batchSize 2)` | T→IG.prompt；I→IG.reference |
| 5 | digital-model | `builtin-digital-model` | `T(数字模特风格要求)` `I(服装图)` `IG(数字模特生成)` | T→IG.prompt；I→IG.reference |

**模板 1 的特殊约定**：`I(数字模特)` 节点的资产选择器默认打开「数字模特」分类
（见 `docs/design/2026-09-19-workbench-entry-wiring/asset-library-model.md`）。

### 4.2 服装设计（8 个）

| # | 菜单 id | 模板 id | 节点 | 边 |
|---|---------|---------|------|-----|
| 6 | print-extract | `builtin-print-extract` | `T(提取要求)` `I(带印花服装)` `IG(印花提取)` | T→IG.prompt；I→IG.reference |
| 7 | print-mutate | `builtin-print-mutate` | `T(裂变方向/数量)` `I(印花图)` `IG(印花裂变, batchSize 2)` | T→IG.prompt；I→IG.reference |
| 8 | recolor | `builtin-garment-recolor` | `T(目标配色清单)` `I(服装图)` `IG(换色生成)` | T→IG.prompt；I→IG.reference |
| 9 | fabric | `builtin-fabric-swap` | `T(面料说明)` `I(服装图)` `I(面料参考)` `IG(面料更换合成)` | T→IG.prompt；I(服装)→IG.reference(order 0)；I(面料)→IG.reference(order 1) |
| 10 | sketch-render | `builtin-sketch-to-garment` | `T(面料/色彩/风格)` `I(线稿)` `IG(线稿渲染)` | T→IG.prompt；I→IG.reference |
| 11 | ai-restyle | `builtin-ai-restyle` | `T(改款指令)` `I(服装图)` `IG(改款生成)` | T→IG.prompt；I→IG.reference |
| 12 | outfit | `builtin-outfit-recommend` | `T(场合/风格/身材)` `IG(穿搭推荐, GENERATE_VARIANT)` | T→IG.prompt（**无 reference 边，纯文生图**） |
| 13 | mannequin | `builtin-person-to-mannequin` | `T(人台要求)` `I(真人着装图)` `IG(转人台生成)` | T→IG.prompt；I→IG.reference |

### 4.3 视频生成（2 个，本期）

| # | 菜单 id | 模板 id | 节点 | 边 |
|---|---------|---------|------|-----|
| 14 | runway | `builtin-video-runway` | `T(走秀/镜头/场景)` `I(服装或模特图)` `VG(走秀视频)` | T→VG.prompt；I→VG.first-frame |
| 15 | xhs | `builtin-video-xhs` | `T(小红书脚本)` `I(主图)` `VG(小红书视频)` | T→VG.prompt；I→VG.first-frame |

**视频模板硬约束**：`VG.modelOptions.aspectRatio` 必须 `"adaptive"`
（Seedance 2.5 首帧/首尾帧任务约束，见 data-model.md C6）。

## 5. 位置惯例

沿用 `server/routes/templates.ts` 既有网格：

```
输入节点列  x = 0（纵向自 -170 起，间距 190）
生成节点    x = 380
纵向中心对齐：生成节点 y = 输入节点列的纵向中心
```

具体到模板 1（4 节点）：

```
T(试穿要求)   (0, -170)
I(服装图)     (0,  20)
I(数字模特)   (0, 210)
IG(试穿生成)  (380, 20)
```

## 6. 种子提示词口径

- **结构化占位**，不写死具体色值/面料/风格：`【服装】上传服装图` / `【要求】…` / `【示例】…`
- 每条模板的 `T` 节点种子文案见 `docs/design/2026-09-19-workbench-entry-wiring/plan.md` §1.2
  （本文件不重复；如两处冲突以 plan.md 为准，因它是用户已确认的产品口径）
- 种子文案**不得**包含可直接复制执行的付费提示词（模板是引导，不是预设）

## 7. backend 注册实现要点

```ts
function textNode(id, x, y, label, text): PersistedWorkflowNode
function imageNode(id, x, y, label): PersistedWorkflowNode          // 输入节点，无变体绑定
function imageGeneratorNode(id, x, y, label, variantId, options): PersistedWorkflowNode
function videoGeneratorNode(id, x, y, label, variantId, options): PersistedWorkflowNode
```

与 v7 的关键差异：`imageNode()` **不再接收 variantId/aspectRatio**
（输入节点无生成语义，见 data-model.md §3）；生成参数移到 `*-GeneratorNode` helper。

`ensureBuiltinTemplates()` 的增量补齐机制沿用；**v7 内置模板文件需清理**
（id 冲突或结构不兼容时按现有 `builtinTemplateIsReadable` 逻辑重建）。

## 8. 可机检验收

| # | 验收项 | 机检方式 |
|---|--------|---------|
| P1 | 15 个模板 id 全部出现在 `GET /api/templates` | 列表断言 |
| P2 | 每个模板通过 `validateAndMigrateFlow` | 逐模板跑校验 |
| P3 | 模板不含 result 节点 | 断言 kind ∉ {result-image, result-video} |
| P4 | 每个 `image-generator` 的 `promptVariantId` 可解析 | `getGarmentPromptVariantById` 非 undefined |
| P5 | 每个 `video-generator` 的 `aspectRatio === "adaptive"` | 断言 |
| P6 | 模板 12 是唯一 `GENERATE_VARIANT`，其余用 `EDIT_VARIANT`/视频变体 | 逐模板断言变体归属 |
| P7 | 模板 9 的生成节点恰有 2 条 reference 边 | 断言 |
| P8 | 每条边都符合 plan.md §2.1 合法边表 | 跑图不变量校验 |
| P9 | 每个 `T` 节点恰连 1 个生成节点 | 断言 |
| P10 | 延后模板（keyframes/video-clone）**未注册** | 断言 id 不存在 |
