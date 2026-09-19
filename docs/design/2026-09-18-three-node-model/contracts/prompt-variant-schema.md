# 契约：PromptVariant 完整 schema 与功能迁移对照（R-41）

- 来源：plan.md §1.3 / §2.1 / §4.3 / §3.6；需求挂靠 R1（功能退化为内容）、R6（评估发布链保留）、Q1=B（文本变体）、Q4=A（needsMask 声明驱动）
- 性质：字段级契约 + 迁移清单 + 设置流程。本文是「一个功能由哪些字段定义」的唯一事实来源；`garmentPromptPresets.ts` 重写时以本文为契约锚点。
- 边界：本文只定**数据/契约口径**（「功能是什么」）；悬浮窗口长什么样、功能选项如何陈列、参数/模型如何排布由 designer 的 R-40（`node-inspector-window/`）定。本文不规定窗口视觉与交互。
- v1：R-41 首版（2026-09-18 晚）。
- v2：R-59 修订（2026-09-20）。§3.1 的 ai-modify / sketch-to-render 两行定版——消除首版「新变体 id 形态」列（4 条 id）与「备注」列（12 个变体）之间的自相矛盾，三选一裁定取【选项二：改备注列，familyId 收敛为三任务族】；同时把 §1.1 的 familyId 取值域从「六族平铺」改为同一收敛口径，并登记对 `modelParameterProfiles.ts`（② 画幅档案）的契约侧要求。修订理由与影响面完整记录见 §3.1 表后的「R-59 裁定记录」段。

---

## 1. PromptVariant 字段级 schema（新模型下的定版）

以 `src/lib/garmentPromptPresets.ts` 当前实现为基线，逐字段说明**去留**与**语义变化**。P2-d 重写目录时按本表逐字段落地。

```ts
export interface PromptVariant {
  variantId: string;                          // 保留
  familyId: PromptFamilyId;                   // 保留（取值域扩展）
  modelId: ImageModelId | TextModelId | VideoModelId;  // 保留（类型并集扩展）
  nodeKind: NodeKind;                         // 保留（取值域 9 → 3）
  mode: PromptOperationMode;                  // 保留（归属语义反转）
  needsMask: boolean;                         // 新增（Q4=A）
  promptLocale: "zh-CN";                      // 保留
  fullPrompt: string;                         // 保留（功能文案唯一来源）
  parameterProfileId: string;                 // 保留（评估链绑定锚点）
  supportStatus: PromptSupportStatus;         // 保留
  contractHash: `sha256:${string}`;           // 保留
  evaluationVersion: string;                  // 保留
  statusReason: string;                       // 保留
}
```

### 1.1 现有字段逐一去留

| 字段 | 去留 | 语义 / 变化 |
|---|---|---|
| `variantId` | **保留** | 稳定键，唯一索引。命名约定沿用 `{familyId}.{modelId}.{mode}.v{n}`，版本推进 = 新 ID + 旧 ID 走撤销（plan.md §4.4 / runtime.md §5d）。 |
| `familyId` | **保留** | 取值域扩展：旧三族 `fashion-lookbook` / `commerce-hero` / `design-sheet` + `mask-local-edit` 之外，新增 §3 迁移表中的新族 familyId。**R-59 修订定版（见 §3.1 表后裁定记录）**：四硬编码族（`upscale` / `print-extract` / `print-mutate` / `fabric-recolor`）平铺为四个新族；但 ai-modify / sketch-to-render **不新增族**——v6 中它们只是三任务族文案经旧 nodeKind 维度的投影（v6 目录共 25 变体 = 三族×四模型×两 mode 24 条 + 蒙版 1 条，并无独立的 ai-modify / sketch-to-render 文案），familyId 收敛回三任务族本身。再加上文本族 `prompt-polish` / `prompt-generate`、视频族 `video-animate`（§3.3 / §3.4）。类型从 `GarmentPromptFamilyId` 改名为 `PromptFamilyId`（不再是「服装专用」，文本/视频变体同入目录），联合成员随目录重写一次性定版。 |
| `modelId` | **保留** | 类型从 `ImageModelId` 放宽为 `ImageModelId \| TextModelId \| VideoModelId`——Q1=B 引入文本变体、视频节点引入视频变体后，目录跨三种模型域。与契约防线一致：变体的 `modelId` 必须在其域的契约清单内（`imageModels.ts` 顶部 throw 同款断言，文本/视频域各复制一份）。 |
| `nodeKind` | **保留** | 取值域从 9 值收敛为 3 值（`"text" \| "image" \| "video"`，data-model.md §1）。这是「变体可在哪种节点上被选用」的闸——`listGarmentPromptVariants` 在悬浮窗口按当前节点 kind 过滤时走这个字段。旧 9 值全部失效，目录重写时按 §3 表逐条改写。 |
| `mode` | **保留，归属语义反转** | 取值域沿用 `"generate" \| "edit" \| "mask-edit"`（mask-edit 保留为 needsMask=true 的 edit 语义别名，不新增值）。**归属反转**：v6 中 mode 由节点自描述（`ModelSelectableNodeData.operationMode`），节点是 owner；新模型中 mode 由**变体携带**，节点不再持有 `operationMode` 字段（data-model.md §3 删除族），变体是 owner。运行时 `renderProviderPrompt` 的 `operationMode` 入参直接取 `variant.mode`（runtime.md §1 第 6 步）。语义：generate = 零参考图纯生成；edit = 有参考图的编辑/合成；mask-edit = needsMask=true 时的蒙版编辑（与 needsMask 联动，见下）。 |
| `needsMask` | **新增（boolean，缺省 false）** | Q4=A 裁定的落地字段。声明该变体运行时是否需要蒙版输入。驱动三件事：(a) `ImageNodeData.mask` / `maskSourceRef` / `featherRadius` 字段**仅当选中变体 `needsMask=true` 时存在**（data-model.md §3）；(b) `assertPlanInputs` 的 mask 检查改为变体声明驱动（runtime.md §1 第 5 步）；(c) `renderProviderPrompt` 的 `maskPromptTemplate` 包装仅对 `needsMask=true` 的变体生效（runtime.md §1 第 5 步，沿用现有 `providerPromptRenderer.ts:153` 的 kind 分支，迁移后改为变体分支）。v6 中该职责由 `nodeKind === "mask-redraw"` 承担，收敛后由变体声明接管。 |
| `promptLocale` | **保留** | 取值恒 `"zh-CN"`（本期语言范围仅中文，graph-invariants.md §5）。 |
| `fullPrompt` | **保留，职责升格** | 功能文案的**唯一来源**。v6 中六族功能文案分散在 runner 硬编码（`server/engine/runner.ts` 的 upscale/print-extract/print-mutate 文案 + `src/lib/colors.ts` 的 `buildRecolorPrompt`）与目录变体两处；新模型下**全部归入 `fullPrompt`**，runner 内零功能文案（runtime.md §1 末段「禁止」条款 + ast-grep 门禁）。组装协议：`taskPrompt = variant.fullPrompt + "\n\n" + userPrompt`（runtime.md §1 第 3 步）。 |
| `parameterProfileId` | **保留** | 评估链绑定的参数档案锚点（`promptEvaluationRelease.ts` 经 `getModelParameterProfile` 消费）。命名约定沿用 `{modelId}:{familyId}:{mode}:v{n}`。文本/视频变体的 parameter profile 在各自契约产物中登记（`text-model-contracts` 区块 / `video-model-contracts.json`），profile 命名空间跨域唯一。 |
| `supportStatus` | **保留** | 取值域不变：`unsupported / unverified / experimental / verified / recommended`。运行时语义不变：普通运行只允许 verified/recommended，其余 fail-closed（evaluation README「运行准入」节）。目录重写后**全部变体重置为 `unverified`**（plan.md §4.3，Q5=A 附带裁定：上线即 unverified，评估另行排期，与现状 25 变体全 unverified 一致）。 |
| `contractHash` | **保留** | 绑定时计算的模型契约哈希（`imageModelContractHash(modelId)` 同款，文本/视频域各一份）。语义弱化见 runtime.md §5c（R5 后不再隐含参数组合已评估）。 |
| `evaluationVersion` | **保留** | 评估链版本向量字段，release registry 审计锚点。重写后统一重置为新常量（沿用 `garment-eval-v3-pending` 之类，P2-d 定死字符串）。 |
| `statusReason` | **保留** | unverified 时的用户可读原因文案。 |

### 1.2 新增字段汇总（新模型引入）

| 字段 | 类型 | 引入裁定 | 说明 |
|---|---|---|---|
| `needsMask` | `boolean`（缺省 `false`） | Q4=A | 见 §1.1 对应行。文本/视频变体恒 `false`（mask 是 image 节点能力），类型层不强制但契约约定必须显式写 `false`，不留 `undefined`（防「漏写」与「声明 false」歧义）。 |

无其他新增字段。`outputText` / `lastRunInput` 等是**节点数据**字段（data-model.md §3），不属于变体。

### 1.3 字段不新增清单（明确否决）

以下字段**有意不进 PromptVariant**，理由逐条：

| 字段 | 否决理由 |
|---|---|
| `displayName` / `description` | 功能在悬浮窗口的陈列名/描述是**视图关注点**，归 R-40 窗口产物的数据源（或 i18n 键 `variants.{variantId}.name`），不进目录数据结构。目录只承诺 `variantId` 稳定，展示文案由窗口侧绑定。 |
| `aspectRatio` / `batchSize` 默认值 | 业务画幅与批量是**节点参数**（`ImageNodeData.aspectRatio/batchSize`），不是变体属性；模板预设里写的默认值是模板内容，不是变体契约。 |
| `recommendedOptions` | 在 `model-contracts.json` 的**模型**区块（data-model.md §4），不在变体上——参数推荐是模型属性，不是功能属性。 |
| `tags` / `category` | 三族 + 六族 + 文本族的枚举已由 `familyId` 承担，不引入第二套分类维度（避免双源分类）。 |

---

## 2. 查询键契约（`listGarmentPromptVariants` / `getGarmentPromptVariant`）

### 2.1 四键查询在新模型下的形态

`PromptVariantQuery` 四键**保留**，但各键取值域与语义随 §1.1 变化：

```ts
export interface PromptVariantQuery {
  familyId: PromptFamilyId;
  modelId: ImageModelId | TextModelId | VideoModelId;
  nodeKind: NodeKind;         // "text" | "image" | "video"
  mode: PromptOperationMode;
}
```

- **唯一性约束不变**：`variantById` 与 `variantByQuery` 两个 Map 的规模断言（`garmentPromptPresets.ts` 顶部 throw）保留——四键组合在目录内必须唯一，否则加载即抛错。这条防线防「同 (family, model, kind, mode) 出现两份文案」的静默分叉。
- **`modelId` 维度仍需保留**。理由：同一 (familyId, nodeKind, mode) 在不同模型上的 `fullPrompt` 写法差异是实质的（v6 现状：四个模型×三族×两 mode = 24 份独立文案，无跨模型 base prompt）。Q1=B 引入文本模型后这一差异不会消失（gpt-5.3 与 gemini-3.6-flash 的润色提示词写法不同）。**不**做「跨模型共享变体」的抽象——那是双源真相的入口。
- **`getGarmentPromptVariant` 的「绝不回退」语义保留**（`garmentPromptPresets.ts:262` 注释：只返回完全匹配，绝不回退到其他模型/节点/模式）。新模型下这条更关键：回退意味着用户选了模型 A 却跑出模型 B 的文案，评估绑定（contractHash）随之失效。

### 2.2 `listGarmentPromptVariants` 的 filter 契约（悬浮窗口消费侧）

悬浮窗口（R-40 产物）调用 `listGarmentPromptVariants(filter)` 时，filter 字段的**推荐口径**（契约，非实现）：

| 调用场景 | filter 字段 | 说明 |
|---|---|---|
| image 节点悬浮窗口的「功能」分区 | `{ nodeKind: "image" }` | 列出所有可用于 image 节点的变体；`familyId` 留给窗口做分组陈列（三族/六族/…），`modelId` 由窗口的「模型」分区选定后再过滤或联动置灰。**窗口是否在功能列表阶段就按 modelId 过滤，归 R-40 决定**，本文不锁死。 |
| text 节点悬浮窗口 | `{ nodeKind: "text" }` | 同上，列出文本变体（润色/生成等）。 |
| video 节点悬浮窗口 | `{ nodeKind: "video" }` | 同上，列出视频变体。 |
| 运行时 `executeStep` | 不经过 list，直接 `getGarmentPromptVariantById(promptVariantId)` | 运行时绑定的是具体 variantId，不是四键查询；四键只服务「陈列与挑选」。 |

- **准入过滤不变**：`promptRunAdmission` 在运行时按 `supportStatus` fail-closed（普通用户只见 verified/recommended）；悬浮窗口的陈列侧是否预过滤 unverified 变体，归 R-40 窗口产物决定（现状 `InspectorPanel` 已按 supportStatus 陈列置灰，该交互语义保留，实现细节归窗口）。
- **`familyId` 不作为运行时的闸**：运行时只认 `variantId`；`familyId` 是纯陈列/分组维度。

---

## 3. 六族功能 → 新功能清单的迁移对照表（R-41 核心交付）

逐条列出旧 9 种节点类型中**承载功能的 6 种**（`image-input` 与 `result` 是数据/聚合节点，不是功能，已在 plan.md §3.3 / §1.3 归位，不在本表）+ `mask-redraw`（蒙版族，v6 已有变体，迁移路径不同）+ 文本族新增变体。

**「提示词正文来源」列**给出新变体 `fullPrompt` 的**逐字来源**——P2-d 重写目录时从该来源**逐字迁移**，diff 评审时逐字段对得上（plan.md §7.2 风险登记「文案逐字迁移」的落地锚点）。

### 3.1 六族迁移对照（旧 runner 硬编码文案 → 新目录变体）

| 旧功能（kind） | 新变体 familyId | 新变体 id 形态 | 提示词正文来源（逐字迁移源） | 适用 nodeKind | mode | needsMask | 适用模型 | 备注 |
|---|---|---|---|---|---|---|---|---|
| `upscale` | `upscale`（新族） | `upscale.{modelId}.edit.v1` | `server/engine/runner.ts:410`：「将这张服装效果图放大为超高清版本，增强面料纹理、走线与边缘细节，保持原有构图、色彩和光影完全不变」 | `image` | `edit` | `false` | 全部 image 模型 | v6 中 taskPrompt 与用户 extra 拼接；新模型下用户意图走 text 上游（R2），变体文案即上引全文。 |
| `print-extract` | `print-extract`（新族） | `print-extract.{modelId}.edit.v1` | `server/engine/runner.ts:412`：「提取这件衣服上的印花图案：将印花完整抠出并平铺展开为规整的矩形图案，纯白背景，去除衣身、褶皱、阴影和穿着效果，印花的比例、细节和色彩与原图保持一致，适合作为印花素材复用」 | `image` | `edit` | `false` | 全部 image 模型 | 同上；v6 的 `extra` 拼接逻辑删除，补充要求由 text 上游承载。 |
| `print-mutate` | `print-mutate`（新族） | `print-mutate.{modelId}.edit.v1` | `server/engine/runner.ts:380`：「基于这张印花图案生成风格一致的新变体：保持原有配色体系、艺术风格与笔触质感，重新编排元素的构图与组合方式，纯白背景，适合作为印花素材复用」 | `image` | `edit` | `false` | 全部 image 模型 | **v6 的 `count` 分批出图机制删除**（Q4=A 裁定：裂变批量取消）；张数由 `batchSize` 表达（plan.md §2.1 末段）。 |
| `fabric-recolor` | `fabric-recolor`（新族） | `fabric-recolor.{modelId}.edit.v1` | `src/lib/colors.ts:140` `buildRecolorPrompt` 的模板：「保持服装的版型、款式细节、构图和光线完全不变，仅将面料配色替换为：{colors}。配色应用于面料主体，呈现真实面料质感与准确色彩，无文字无水印。」——**迁移时 {colors} 占位删除**，配色清单由用户在 text 上游正文中写明（Q4=A：一色一图循环删除） | `image` | `edit` | `false` | 全部 image 模型 | **两个 v6 机制一并删除**：(a) 一色一图循环（`runner.ts:319` for 循环）；(b) `fabricImageUrl` 节点参数与 `targetHandle="fabric"` 专用入口（Q3=A 抹平）。面料角色语义由变体 `fullPrompt` 声明（如「参考图 2 = 面料」），顺序即语义（plan.md §1.3 Q3 段）。 |
|| `ai-modify` | **不新增族**（familyId 收敛回 v6 三任务族 `fashion-lookbook` / `commerce-hero` / `design-sheet`） | `{familyId}.{modelId}.edit.v1`（沿用三任务族既有 id 形态，共 4 模型×3 族 = 12 条） | v6 目录 `MODEL_PROMPTS[*][三族][edit]` 的 12 份文案逐字保留——v6 中 ai-modify 并无独立文案，它就是这 12 份文案在 `nodeKind: "ai-modify"` 入口下的陈列投影（v6 目录共 25 变体 = 三族×四模型×两 mode 24 条 + 蒙版 1 条） | `image` | `edit` | `false` | 全部 image 模型 | 迁移 = v6 目录中这 12 个 edit 变体的 `nodeKind` 字段改为 `"image"`，`variantId` / `familyId` / `fullPrompt` / `parameterProfileId` 全部不动。悬浮窗口的「功能」陈列若想保留「AI 修图」一词，属 R-40 陈列文案（绑定到 edit 变体分组），不进目录数据结构。 |
|| `sketch-to-render` | **不新增族**（同上，收敛回三任务族） | `{familyId}.{modelId}.generate.v1`（同上，12 条） | v6 目录 `MODEL_PROMPTS[*][三族][generate]` 的 12 份文案逐字保留——v6 中 sketch-to-render 同样只是这 12 份 generate 文案的陈列投影 | `image` | `generate` | `false` | 全部 image 模型 | 迁移 = v6 目录中这 12 个 generate 变体的 `nodeKind` 字段改为 `"image"`，其余字段不动。「手稿渲染」陈列名同 ai-modify，归 R-40 窗口产物。 |

**R-59 裁定记录（本节为本表的修订依据，2026-09-20 定版）**

- **矛盾**：本表首版中，ai-modify / sketch-to-render 两行的「新变体 id 形态」列写的是 `ai-modify.{modelId}.edit.v1` / `sketch-to-render.{modelId}.generate.v1`（各 4 条 id），而「备注」列写的是「迁移 = 把 v6 目录中 `nodeKind: "ai-modify"` 的 **12 个变体** 的 nodeKind 改为 `"image"`」（各 12 个变体）。12 个变体装不进 4 个 id，两列自相矛盾。
- **三选一裁定**：改 id 形态列 / 改备注列 / 新增族 —— 取**【选项二：改备注列】**。
  1. **选项一（改 id 列，每族 12 条）**被否决：`variantByQuery` 四键唯一性断言（§2.1）会在目录加载时直接 throw——同一 `(familyId=ai-modify, modelId, nodeKind=image, mode=edit)` 下压 3 份不同文案，唯一键装不下；要成立必须再开第五键，那是类型层变更，超出「新增一个功能」的范畴（§4.1 第 3 条明文停步）。
  2. **选项三（新增族并保留 12 条）**被否决：等价于把三任务族的 familyId 改成 ai-modify / sketch-to-render，换来的是——(a) 窗口陈列失去「写实穿搭 / 电商主图 / 服装设定表」分组维度，而这正是 v6 三族 preset 的存在意义与 `FAMILY_FRAMES` 的画幅依据；(b) `modelParameterProfiles.ts` 的 `GarmentTaskFamilyId` 联合与 `FAMILY_FRAMES` 表必须同步重写，档案 id 全部重排；(c) 与「六族平铺」的初版直觉相比没有任何功能收益，只是换名。
  3. **选项二（采用）**：v6 中 ai-modify / sketch-to-render 本就不是独立功能族——v6 目录 25 个变体里只有三任务族的 24 份文案 + 1 份蒙版文案，这两个旧 nodeKind 只是同一批文案的两个陈列入口。新模型下 nodeKind 收敛为 3 值后，陈列入口消失，文案各归其族，familyId 收敛是唯一不制造新矛盾、不需要类型层变更、且保住窗口陈列维度的解。
- **影响面**：(a) §1.1 familyId 取值域改为「三任务族 + mask-local-edit + 四硬编码新族 + 文本/视频新族」，本文件 §1.1 已同步修订；(b) R-57 / P2-d 目录重写：**现状即可**——「不新建族、文案并入三任务族的 edit/generate 变体」就是定版口径，无需任何调整；(c) ② 画幅档案（`modelParameterProfiles.ts`）衔接点见下方专门段落。
- **② `modelParameterProfiles.ts` 契约侧要求（衔接点，不动代码）**：四硬编码新族成为 `PromptFamilyId` 成员后，按 §1.1 `parameterProfileId` 命名约定（`{modelId}:{familyId}:{mode}:v{n}`），每个新族×每模型×edit 都需要一条参数档案。现 `modelParameterProfiles.ts` 的 `GarmentTaskFamilyId` 联合只有三任务族、`FAMILY_FRAMES` 只覆盖三族、档案生成矩阵只产 4 模型×3 族×2 mode + 蒙版共 25 条。**哪个面改**：`GarmentTaskFamilyId` 联合 + `FAMILY_FRAMES` 表 + 档案生成矩阵三处，由②的实现卡承担。**画幅取值已由用户拍板（2026-09-20，依现有「按输出用途定」约定）**：`upscale` = `source`、`fabric-recolor` = `source`、`print-extract` = `1:1`、`print-mutate` = `1:1`。契约侧补充两点约束：
  1. **`source` 画幅的模型兼容性 fail-closed**：`businessFrame.aspectRatio` 与 `postprocess.finalAspectRatio` 的类型已含 `"source"`（蒙版档案在用），但 vip/flux 两模型的 native 尺寸表（`VIP_SIZE` / `FLUX_DIMENSIONS`）只覆盖 `1:1/3:4/4:3`。`source` 语义 = 输出与输入参考图同尺寸，这两模型要求显式尺寸，无参考图即无 source 可定。upscale / fabric-recolor 都是 edit 变体，运行时必有参考图（`assertPlanInputs` 的 edit 参考图检查），② 的实现必须为这两模型定义「从参考图推导尺寸」的 native 取值路径；若实现侧判定模型契约不支持，按 fail-closed 将该模型从新族的「适用模型」列剔除并回报本契约修订，**不得静默回退到默认画幅**（回退 = 用户选了 source 却跑出固定画幅，与 §2.1「绝不回退」同性质）。
  2. **R-57 / P2-d 目录对齐**：三任务族 24 条变体的 `parameterProfileId`（`{modelId}:{族}:{mode}:v1`）不动，档案 1:1 仍在；四新族 16 条变体（4 族×4 模型×edit）的 `parameterProfileId` 依赖②先扩 `GarmentTaskFamilyId` 与生成矩阵——P2-d 落地顺序必须是 **② 的档案扩展先行，目录重写消费在后**，否则 `getModelParameterProfile` 返回 undefined，`promptEvaluationRelease` 的档案解析 throw。

### 3.2 蒙版族迁移（`mask-redraw`，路径不同）

| 旧功能（kind） | 新变体 familyId | 新变体 id | 提示词正文来源 | 适用 nodeKind | mode | needsMask | 适用模型 | 备注 |
|---|---|---|---|---|---|---|---|---|
| `mask-redraw` | `mask-local-edit`（沿用 v6 族名） | `mask-local-edit.gpt-image-2.5-sunburst.mask-edit.v1`（**ID 不变**） | v6 目录现有 `GPT_IMAGE_2_MASK_VARIANT.fullPrompt`（`garmentPromptPresets.ts:230`），逐字保留 | `image` | `mask-edit` | **`true`**（迁移的核心变化） | 仅 `gpt-image-2.5-sunburst`（现状不变：该模型仅 mask 变体可用，由变体声明驱动，data-model.md §3 保留检查第 1 条） | 迁移 = `nodeKind` 从 `"mask-redraw"` 改为 `"image"` + 显式补 `needsMask: true`；`fullPrompt` / `contractHash` / `parameterProfileId` 不动。`maskPromptTemplate` 包装、`prepareMaskForGeneration` 区域引导图、`compositeMaskedEdit` 后处理全部保留（runtime.md §1 第 5/8 步）。 |

### 3.3 文本族新增变体（Q1=B）

| 新变体 familyId | 新变体 id 形态 | 提示词正文来源 | 适用 nodeKind | mode | needsMask | 适用模型 | 备注 |
|---|---|---|---|---|---|---|---|
| `prompt-polish`（新族：提示词润色） | `prompt-polish.{textModelId}.edit.v1` | **新增文案，P2-d 撰写**——无 v6 迁移源（v6 无文本变体）。文案职责：把用户正文润色为结构化提示词，不执行生成 | `text` | `edit` | `false`（文本变体恒 false） | 文本模型清单（`TextModelId`，R10 待确认，plan.md §5.3） | 走同步 chat completions 链路（runtime.md §1b）；`messages = [{role:"system", content: fullPrompt}, {role:"user", content: input}]`。 |
| `prompt-generate`（新族：生成提示词） | `prompt-generate.{textModelId}.generate.v1` | **新增文案，P2-d 撰写**。文案职责：从零生成一段可用提示词 | `text` | `generate` | `false` | 同上 | 与 `prompt-polish` 的区别在 mode 语义：polish 是有上游输入的编辑（edit），generate 是零上游纯生成。**注意**：text 节点的 INV-1 不适用（INV-1 只约束 image/video，graph-invariants.md §1）；text 变体的「输入是否为空」由运行时 §1b 第 1 步的组装结果判空（trim 后为空则拒绝运行，文案 `inv2.emptyTextUpstream` 复用）。 |

### 3.4 视频族变体（Q2=A 配套，P2-e 落地）

| 新变体 familyId | 新变体 id 形态 | 提示词正文来源 | 适用 nodeKind | mode | needsMask | 适用模型 | 备注 |
|---|---|---|---|---|---|---|---|
| `video-animate`（新族：图生视频/款式动效） | `video-animate.{videoModelId}.edit.v1` | **新增文案，P2-e 撰写**——无 v6 迁移源 | `video` | `edit`（有首帧）或 `generate`（纯文生视频） | `false` | 视频模型清单（`VideoModelId`，data-model.md §5 已定六值） | 视频变体的 `fullPrompt` 职责与 image 同构（功能/质量约束）；首帧/时长/分辨率由 `modelOptions` 与节点 `outputVideos` 承载，不进变体。**注意**：`mode` 在视频域的取值暂沿用 `"generate" \| "edit"`（mask-edit 不适用），是否引入 `"i2v" \| "t2v"` 之类新值**待 P2-e 定**——本契约不预留。 |

### 3.5 被合并/取消的旧行为（Q4=A / Q3=A 裁定的明文清单）

以下 v6 行为在新模型下**不存在等价变体**，属有意删除，不是迁移遗漏：

| 旧行为 | 删除裁定 | 删除理由 / 新模型下的替代 |
|---|---|---|
| `fabric-recolor` 的**一色一图循环**（`runner.ts:306-373`：对每个颜色独立调用 Provider，一色出一图） | Q4=A | 由 `batchSize` + 系统提示词正文表达：变体 `fullPrompt` 中写「按用户在正文中给出的配色清单逐色生成」，节点 `batchSize` 控制张数。代价：精确的「一色绑定一图」控制变弱（plan.md §7.2 风险登记已记录，等级低）。 |
| `print-mutate` 的**分批出图**（`runner.ts:377`：`count` 参数单次最多 4 张，最多 8 张分两批） | Q4=A | 同上，`batchSize`（1/2/4/8）覆盖原 count 上限 8。 |
| `fabric-recolor` 的 **`fabricImageUrl` 节点参数**与 `targetHandle="fabric"` 专用 handle | Q3=A | 面料参考图 = 普通 image 入边，顺序语义；「谁是面料」由变体 `fullPrompt` 声明（graph-invariants.md §2 Q3 段）。 |
| `buildRecolorPrompt` 的 **{colors} 占位拼接**（`src/lib/colors.ts:138`） | Q4=A | 配色清单由用户在 text 上游正文写明，不再由节点参数拼进提示词。色板 UI（`ColorSwatch`）是否保留归 R-40 窗口产物决定；若保留，其作用仅为「把选中颜色的 hex 值填进 text 节点正文」，不再直接进 Provider 请求。 |
| `image-input` 节点类型 | R1 | 不是功能，是数据入口；归位为 image 节点的 `outputImages` 直写 + 图片入边（plan.md §1.3 多图参考表达）。 |
| `result` 节点类型 | R1 / §3.3 | 不是功能，是聚合 UI；归位为 image 节点自身网格 + ResultsPanel（plan.md §3.3）。 |

---

## 4. 新增一个功能的设置流程（操作性说明，衔接 plan.md §3.6 治理）

「新增一个功能」= 向提示词目录新增一个或多个 `PromptVariant`。从提出到可选的完整流程：

### 4.1 提出（任何开发者）

1. 在 `garmentPromptPresets.ts` 中新增变体条目，**逐字段填齐 §1.1 全部字段**：
   - `variantId`：按 `{familyId}.{modelId}.{mode}.v{n}` 命名；新功能通常意味着新 `familyId`（在 `PromptFamilyId` 联合中追加成员）。
   - `fullPrompt`：功能文案**唯一来源**，按 §3 各表的「文案职责」撰写；禁止从 runner 引入新硬编码（ast-grep 门禁会扫中文字面量，runtime.md §1 末段）。
   - `needsMask`：**显式写 `true` 或 `false`**（不留 undefined，§1.2）。
   - `supportStatus`：新增变体**只能填 `unverified`**，`statusReason` 填「该模型×任务族×操作模式尚未完成当前契约版本的真实评估，普通用户不可启用。」（沿用 `UNVERIFIED_REASON` 常量）。
   - `contractHash` / `parameterProfileId` / `evaluationVersion`：按 §1.1 对应行的绑定规则填。
2. 若新功能涉及新模型：先走模型契约评审（`model-contracts.json` / `textModels` 区块 / `video-model-contracts.json`），命中 `docs/ai/apiyi/change-scope.json` 时按 §5 知识库门禁走 `docs:apiyi:check` / `search` / `lookup` 回执（AGENTS.md §5）。
3. 若新功能需要新 `mode` 值或新 `nodeKind` 值：**停步**——这两者都是类型层变更，不是「新增一个功能」的范畴，需回到本方案评审（§1.1 mode 取值域、data-model.md §1 NodeKind）。

### 4.2 评审与合入（PR 评审 + 门禁）

- PR 评审走既有流程（AGENTS.md §6/§7）：`npm run check` + `npm run build` + ast-grep/dependency-cruiser 扫描 + CI 五检查。
- 目录加载断言（`variantById` / `variantByQuery` 唯一性 throw）在 `npm run test` 的 `tests/prompt-presets.test.ts` 中自动覆盖；新增变体导致冲突即红。
- 合入后变体状态 = `unverified`，**普通用户不可见不可选**（R6 准入不变）。

### 4.3 评估 campaign（orchestrator 排期）

- 按 `docs/ai/evaluation/README.md` 的 campaign 流程：封存 Campaign/Slot 总账 → 逐阶段（contract → provider-probe → internal-experiment → formal-validation）跑评估 → 每阶段 receipt 链。
- 评估节奏由 orchestrator 另行排期（Q5=A 附带裁定：上线不依赖评估完成）。

### 4.4 release registry 发布

- 评估通过后走 `evaluation:review gate` → `promote` → registry 登记（`docs/ai/evaluation/README.md`「外置复核与发布闭包」节）。
- 发布后 `supportStatus` 经 release registry 的发布动作升为 `verified` / `recommended`，普通用户可选。
- **修订纪律**：变体正文修订**必改 ID**（runtime.md §5d 默认口径）；同 ID 原地修订仅在 registry schema 扩展后开放（当前不启动）。

### 4.5 回滚

- 目录 PR revert + registry 中该变体标记撤销；存量引用节点运行时 fail-closed（runtime.md §5d），不自动回退用户文档。

---

## 5. 与悬浮窗口（R-40）的分工边界

| 关注点 | 归属 |
|---|---|
| 功能是什么（`PromptVariant` 字段、familyId 枚举、六族迁移清单、新增流程） | **本文**（数据/契约口径） |
| 窗口长什么样（功能选项如何陈列、参数/模型分区如何排布、交互细节、视觉样式） | **R-40 `node-inspector-window/`**（designer 产物） |
| 窗口调用 `listGarmentPromptVariants` 时**必须**按 `nodeKind` 过滤 | **本文**（§2.2，契约） |
| 窗口是否在功能列表阶段按 `modelId` 联动置灰 / 是否预过滤 unverified 变体 | **R-40**（本文不锁死，§2.2 备注） |
| 色板 UI 是否保留、`buildRecolorPrompt` 的替代交互 | **R-40**（§3.5 末行备注） |

若 R-40 产物与本文冲突（如窗口要求变体携带 `displayName`，或要求四键查询改为三键），**回报 orchestrator**，由 orchestrator 裁定后修订本文或 R-40 产物——本文不预留「待窗口定」的字段。
