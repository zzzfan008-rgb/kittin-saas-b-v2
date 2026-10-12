# 模特试穿模板协议重写 + familyId 打标 — 契约设计

日期：2026-10-12
分支：fix/r100-comments-1-3
上游：用户已拍板 A（生成节点加 familyId 字段）+「文本也做」排期；hermes 2026-10-12 正式派单
关联：docs/design/2026-10-12-prompt-rewrite/plan.md（提示词改写层，本契约是其 §7-2 A 机制 + §10 落地配套）
状态：契约定稿（只定契约，无实现代码；backend/frontend 评审后动手）

---

## 0. 结论先行

本契约交付 4 件事：

1. **familyId 打标（A 机制）**：只给 `image-generator` 加可选 `familyId?: string`（video 侧**不**加，裁定见 §1.4）；落 4 处（类型 / schema 字段清单与校验 / 快照投影白名单 / 模板打标）。旧文档 familyId 缺省=undefined=白名单 miss=不改写（fail-closed）。
2. **新增冻结族 model-tryon（edit）**：逐字协议文本（参考图1=服装、参考图2=模特角色绑定 + 3:4 全身竖版 + 用户补充位），替代 builtin-model-tryon 当前借用的 fashion-lookbook:edit；同步冻结表族清单/快照测试。**同时新增改写层专用 REWRITE_SYSTEM_PROMPTS["model-tryon"]**（保护冻结协议、只补全用户补充段）——这是白名单启用的前置条件，缺了它启用即事故（default 改写提示词会把冻结协议当用户输入重写）。
3. **画幅 3:4**：builtin-model-tryon 生成节点默认 aspectRatio 1:1→3:4（flare-vip 3:4=1536x2048 已在 VIP_SIZE_BY_RATIO，无需新尺寸逻辑）。
4. **白名单启用**：REWRITE_ENABLED_FAMILIES []→["model-tryon"] 的启用前置清单（§4）。

关键工程裁定：
- **模板种子是双源**：代码定义 `templates.ts builtinTemplates()`（权威源）+ 入库 JSON `data/templates/builtin/*.json`（git tracked，已确认）。`ensureBuiltinTemplates()` 只补缺失/损坏、**不覆盖可读但陈旧的 JSON** → 改定义后必须双改 JSON，并增强 ensure 为「内容指纹不一致即回填」（§1.5），否则已部署环境永久读到旧模板。
- **入边顺序已验证可用**：dag 上游按 edges 数组顺序（dag.ts:277 注释「上游按 edges 数组顺序」），模板 edges 里 garment 边在 model 边前 → inputImages[0]=服装、[1]=模特，与前端徽标序号（workflow.ts:590「序号按 edges 数组顺序，= 模型看到的参考图N」）同源一致。协议写「参考图1=服装、参考图2=模特」有结构保证。

---

## 1. familyId 打标（范围 1）

### 1.1 类型（frontend 首落）

`src/types/workflow.ts:165` `ImageGeneratorNodeData` 新增：

```
  /**
   * 工作流族标识（模板实例化时落标，如 "model-tryon"）。
   * 用途：运行时提示词改写白名单门控（见 2026-10-12-prompt-rewrite/plan.md §2.3）。
   * 可选：手动新建节点与历史文档为 undefined；undefined 不触发任何族专属行为（fail-closed）。
   * 仅 image-generator 携带；video-generator 本期不使用（裁定 §1.4）。
   */
  familyId?: string;
```

合法值：`string`，非空，长度上限沿用 `MAX_TEXT_LENGTH`；值域本期实际只产出 `"model-tryon"`，但**不做封闭枚举校验**（族清单是模板目录的开集，schema 不应反向依赖模板 id 列表）。白名单判定（是否命中 REWRITE_ENABLED_FAMILIES）在运行时做，不在保存时做。

### 1.2 schema（backend）

`server/lib/workflowSchema.ts`：
- `GENERATION_FIELDS`（:57）数组追加 `"familyId"`——该清单双重用途：既是生成节点允许字段，也是输入节点禁带字段的反向清单（assertNoGenerationFields :219）。追加后 text/image/video 输入节点携带 familyId 会被 fail 拒绝（语义正确）。
- `image-generator` case（:289-316）返回对象增加可选项：
  `const familyId = raw.familyId === undefined ? undefined : stringValue(raw.familyId, \`${path}.familyId\`, { nonEmpty: true });`
  返回体加 `...(familyId !== undefined ? { familyId } : {})`。
- `video-generator` case（:318-）**不加**：raw 携带 familyId 时白名单重建自然剥离（与 v7 variant 六字段同款处理，:303 注释有先例）。

### 1.3 快照投影（backend + frontend 同文件归 frontend 域）

**裁定：familyId 纳入文档快照。** 理由：白名单门控要在「保存项目→关闭→重开→运行」后仍生效；若不投影，保存时 familyId 被白名单剥离，重开后节点变回 undefined、白名单永久 miss——familyId 是持久的模板来源元数据（与 modelId/operationMode 同性质），不是运行时或 UI 状态。

`src/lib/documentSnapshot.ts`：
- 生成节点文档接口（:62-77 image-generator 段）加 `familyId?: string;`；
- `DOCUMENT_NODE_ALLOWED_FIELDS["image-generator"]`（:317-322）追加 `"familyId"`（video-generator 段不追加）；
- image-generator 投影构造处（:257-263 附近 `modelId: stringOrEmpty(...)` 段）：familyId 用「有值才写、无值省略」投影（参照 operationModeField :208 的窄化写入模式，不写空串）。

### 1.4 video 侧裁定：本期不加

`VideoGeneratorNodeData`（workflow.ts:179）不新增 familyId。理由：①改写白名单本期仅 image 域（REWRITE_ENABLED_FAMILIES 只含图片族）；②视频模板族（video-animate 等）无改写产品需求；③按「按当前需求设计，不为想象中的未来买单」，未来视频要改写时再走同一契约补字段（schema 白名单重建已天然容忍前向数据）。

### 1.5 模板打标 + JSON 种子回填规则（backend）

- `server/routes/templates.ts`：
  - `ImageGeneratorOptions` 接口（:71）加 `familyId?: string`；
  - `imageGeneratorNode()`（:74-99）签名透传 familyId 到 `data.familyId`（仅 image）；
  - builtin-model-tryon 定义（:155 附近 `imageGeneratorNode("tryon-gen", 380, 20, "试穿生成", "edit")`）传 `{ familyId: "model-tryon", aspectRatio: "3:4" }`——aspectRatio 当前在函数内硬编码 `"1:1"`（:88），需把 aspectRatio 提为 options 字段（本批唯一改函数签名处；其余模板默认仍 "1:1"）。
  - 注意 `:86` 注释「aspectRatio 1:1 拍板③」的历史口径仅对默认模板成立，tryon 是首个特例，注释更新。

- **JSON 种子双改 + 回填增强**：
  - `data/templates/builtin/builtin-model-tryon.json`（git tracked）随代码定义同 PR 更新（familyId、3:4、新协议文本，§2/§3）；
  - `ensureBuiltinTemplates()`（:443-466）增强：当前逻辑是「文件缺失或不可读→写入，可读→保留」。改为对内置模板做**内容指纹比对**（代码定义序列化为稳定 JSON 的 sha256，与磁盘文件解析后的规范形比对），不一致即覆盖回填内置模板（用户模板功能已取消，内置目录无用户数据，覆盖安全）。指纹比对必须基于「语义规范形」（解析+重序列化），不得直接比文件字节（thumbnail 等响应态字段不参与）。
  - 这样 git pull（tracked JSON 更新）与持久卷部署（磁盘陈旧 JSON 被指纹回填）两条路径都收敛到代码定义。

### 1.6 旧文档/手动节点语义（写进契约）

- v8/v9 及更早历史项目、v7 模板迁移产物、用户手动从空画布新建的生成节点：`familyId === undefined`；
- schema 对缺失 familyId 不报错（可缺省）；快照投影省略；
- 运行时白名单判定：undefined ∉ REWRITE_ENABLED_FAMILIES → 跳过自动改写（fail-closed 安全方向）；
- ✨补全按钮不受影响（族无关，family 缺失→REWRITE_SYSTEM_PROMPTS.default）。

---

## 2. model-tryon 冻结协议文本（范围 2）

### 2.1 新增冻结族条目（逐字定稿，backend 照抄进 promptPresetsFrozen.ts，sha256 锁定）

`PRESET_TEMPLATE_TEXTS["model-tryon:edit"]`（mode=edit；该族无 generate 条目）：

```
AI 换装模特试穿。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源；参考图2=模特，是唯一的人物身份来源（长相、发型、肤色、身材、姿势）。把参考图1的服装完整穿到参考图2的模特身上：忠实还原服装的版型、颜色、花型、面料质感、缝线、闭合方式与五金细节；保留模特本人的面部特征、发型、肤色、身材比例与姿势，只更换身上服装，不改变人物身份，不融合两张脸或两件衣服。
输出 3:4 单人全身竖版：人物完整入镜、头脚不裁切，服装与身体贴合自然，褶皱、垂坠与遮挡关系可信；默认平视机位、约 50mm、柔和均匀光线、干净中性背景。仅在不与用户要求和参考图冲突的前提下，补全主体、环境、光线、镜头、色调、构图六个维度的合理细节；不得新增用户未要求的人物、道具、文字、Logo 或水印。禁止使用「8K」「杰作」「大师级」「完美光线」「超高清」等无信息量夸大词。
用户补充要求（如为空则忽略本行）：
```

要点对照（派单 5 要求）：① 参考图1=服装/参考图2=模特角色绑定，显式序号、禁跨图挪用（与 dag edges 顺序、图N徽标一致，见 §0）；② 六要素补齐以「不与用户要求和参考图冲突」为前提；③ 结尾「用户补充要求（如为空则忽略本行）：」=用户补充位，text 节点用户在其后追加；④ 禁负资产词逐字在列；⑤ 3:4 单人全身竖版 + 头脚不裁切 + 输出一致性。

### 2.2 模板接线

- `templates.ts:151` builtin-model-tryon 的 text 节点：`requirePresetText("fashion-lookbook", "edit")` → `requirePresetText("model-tryon", "edit")`；
- 其余 4 个换装模板（builtin-pose / builtin-background-swap / builtin-lookbook / builtin-digital-model，以及同样借用 fashion-lookbook:edit 的 builtin-fabric-swap / builtin-sketch-to-garment / builtin-ai-restyle / builtin-person-to-mannequin 等）**本批不动**——它们是单参考图或不同任务，不适用双图角色协议；fashion-lookbook:edit 保留不删。

### 2.3 冻结表结构同步（backend）

`server/lib/promptPresetsFrozen.ts`：
- `FROZEN_PRESET_FAMILY_IDS`（:51）追加 `"model-tryon"`（11→12 族）；
- `PRESET_TEMPLATE_TEXTS` 增 `"model-tryon:edit"` 键（14→15 条）；
- `frozenPromptBindingForVariantId` / `VARIANT_ID_PATTERN`：**不扩逻辑**。裁定：pattern 族段正则 `[a-z-]+` 天然匹配 model-tryon，解析器对新族前向兼容；v8→v9 迁移不需要「认识」新族——历史 v8 文档不存在 model-tryon variantId（该族本期才建），无迁移数据。若未来出现历史绑定再补迁移。
- 客户端镜像：检查 `src/lib/promptPresetsFrozenClient.ts`（已见其承载 fashion-lookbook 文本）是否需要同步 model-tryon 文本——按现有镜像机制同批同步（frontend 域，落地时先读该文件确认其消费面，勿凭本契约假设其结构）。

### 2.4 改写层专用 system prompt（白名单启用前置，逐字定稿）

`REWRITE_SYSTEM_PROMPTS["model-tryon"]`（2026-10-12-prompt-rewrite/plan.md §3 已预留该覆盖位）：

```
你是 AI 换装「模特试穿」工作流的提示词补全编辑。输入正文由两部分组成：①一段已冻结的工作流协议（以「AI 换装模特试穿。」开头、规定参考图角色与输出要求的部分）；②用户补充要求（结尾「用户补充要求」之后的内容）。
铁律（最高优先级，违反即失败）：
1. 冻结协议部分必须逐字原样保留，不得删除、改写、重排或弱化其中任何参考图角色绑定与输出约束；
2. 只对「用户补充要求」部分做结构化补全：围绕主体、环境、光线、镜头、色调、构图六个维度补充与用户要求和协议不冲突的合理细节；用户明确写出的要求原样保留、最高优先级；严禁新增与用户要求、参考图角色或 3:4 竖版输出相冲突的设定；
3. 输出前后自洽，补全内容与协议、用户原话之间不得自相矛盾；不适用的维度不要硬凑。
输出格式：输出完整正文（冻结协议部分逐字保留，后接补全后的用户补充要求），只输出一段连续中文文本，不要解释、不要分点、不要 Markdown 标题或列表符号；禁止使用「8K」「杰作」「大师级」「完美光线」「超高清」等无信息量夸大词。
```

没有这条，白名单启用后 default 改写提示词会把整段冻结协议当普通用户输入重写（改掉参考图角色绑定），故列为 §4 启用前置。

---

## 3. 画幅 3:4（范围 3）

- builtin-model-tryon 的 `imageGeneratorNode` 调用传 `aspectRatio: "3:4"`（经 §1.5 options 透传）；`defaultImageModelOptions(DEFAULT_GENERATION_MODEL_ID, "3:4")` 已存在按比例取契约推荐参数的路径，flare-vip 3:4 = 1536x2048（VIP_SIZE_BY_RATIO imageModels.ts:172；档位表 :189 快速960x1280/标准1536x2048/高清2480x3312 已齐）——**无新增尺寸逻辑**。
- 裁定「尺寸档位联动语义」：切换 aspectRatio 时现有 `imageModelOptionsForAspectRatio`（imageModels.ts:291 gemini 分支 / flare-vip VIP_SIZE_BY_RATIO 分支 :287）已做同档跟随，模板落 3:4 后 modelOptions 由 `defaultImageModelOptions(modelId, "3:4")` 首次实例化即取 3:4 档；用户在 UI 再切比例时既有联动不变。本批零新增联动代码。
- JSON 种子 modelOptions/aspectRatio 双改（随 §1.5 JSON 更新）。

---

## 4. 白名单启用（范围 4）

`REWRITE_ENABLED_FAMILIES` 由 `[]` 改为 `["model-tryon"]` 的**全部前置**（缺一不启用，保持 []）：

1. familyId 四处落标合入（类型/schema/快照投影/模板，§1）且 tsc + 落盘闸测试绿；
2. `PRESET_TEMPLATE_TEXTS["model-tryon:edit"]` 冻结文本合入、族清单与 sha256 快照测试更新（§2.3）；
3. `REWRITE_SYSTEM_PROMPTS["model-tryon"]` 专用改写提示词合入并纳入冻结 sha256（§2.4）；
4. builtin-model-tryon JSON 种子（familyId + 3:4 + 新协议文本）与代码定义一致，ensure 指纹回填测试绿（§1.5）；
5. runner 判定契约（2026-10-12-prompt-rewrite/plan.md §2.3）：`step.params`/节点 data 能读到 familyId——**本契约新增落地点**：dag.ts buildExecutionPlan 的 params 构造（:302 `const params = { ...extractParams(data), inputTexts }`）需把 `data.familyId` 经 extractParams 带入 step.params（extractParams 在 dag.ts:348+，按其现有白名单模式追加 familyId 透传；只透传不校验），runner 才能读到。契约：`params.familyId: string | undefined`。

runner 判定逻辑（契约，不写实现）：`const familyId = typeof step.params.familyId === "string" ? step.params.familyId : undefined;` 命中白名单且 userPrompt 非空才改写；改写调用传 `{ kind, mode, familyId }`，textRewriter 用 `REWRITE_SYSTEM_PROMPTS[familyId] ?? REWRITE_SYSTEM_PROMPTS.default` 选提示词。

---

## 5. 插入点清单（file:line 汇总）

| # | 位置 | 变更 | 域 |
|---|---|---|---|
| 1 | `src/types/workflow.ts:165-177` | ImageGeneratorNodeData 加 `familyId?: string`（video 不加） | frontend |
| 2 | `server/lib/workflowSchema.ts:57` | GENERATION_FIELDS 加 `"familyId"` | backend |
| 3 | `server/lib/workflowSchema.ts:289-316` | image-generator case 加 optionalString(nonEmpty) 与条件展开；video case 不动 | backend |
| 4 | `src/lib/documentSnapshot.ts:62-77` | image-generator 文档接口加 familyId? | frontend |
| 5 | `src/lib/documentSnapshot.ts:317-322` | ALLOWED_FIELDS image-generator 加 `"familyId"` | frontend |
| 6 | `src/lib/documentSnapshot.ts:257-263` | 投影窄化写入（有值才写，照 operationModeField 模式） | frontend |
| 7 | `server/lib/promptPresetsFrozen.ts:51` | FROZEN_PRESET_FAMILY_IDS 加 model-tryon | backend |
| 8 | `server/lib/promptPresetsFrozen.ts` PRESET_TEMPLATE_TEXTS | 加 model-tryon:edit（§2.1 逐字文本） | backend |
| 9 | 同文件 REWRITE_SYSTEM_PROMPTS | 加 model-tryon 覆盖条（§2.4 逐字文本） | backend |
| 10 | `server/routes/templates.ts:71-99` | ImageGeneratorOptions 加 familyId/aspectRatio；imageGeneratorNode 透传 | backend |
| 11 | `server/routes/templates.ts:151-159` | builtin-model-tryon：preset 改 model-tryon:edit、generator 传 familyId+3:4 | backend |
| 12 | `server/routes/templates.ts:443-466` | ensureBuiltinTemplates 增内容指纹回填 | backend |
| 13 | `data/templates/builtin/builtin-model-tryon.json` | 种子双改（familyId/3:4/新文本） | backend |
| 14 | `src/lib/promptPresetsFrozenClient.ts:100-160` | 客户端镜像同步：BINDING_MAP 加 model-tryon:edit、FROZEN_PROMPT_FAMILY_IDS 加族、`FROZEN_PROMPT_ENTRY_COUNT` 注释 14→15 | frontend |
| 15 | `server/engine/dag.ts:302/348` | extractParams/params 透传 familyId 到 step.params | backend |
| 16 | `server/lib/textRewriter.ts`（改写层新文件） | REWRITE_ENABLED_FAMILIES []→["model-tryon"]（仅在 §4 五前置齐后） | backend |

---

## 6. 跨端改动顺序（不破坏合入）

字段是「可选、双端容忍缺失」的加法契约。**注意 tsc 依赖**：dag.ts extractParams（:360 image-generator 分支是显式字段枚举）要读 `data.familyId`，其类型来自 `src/types/workflow.ts`（frontend 域），故类型字段必须最先合入，backend 随后。推荐顺序：

1. **类型先行（frontend，纯加法无行为）**：#1 workflow.ts 加 `familyId?: string`。此提交单独可发布（无人读取该字段）。
2. **backend 契约面**：schema 校验（#2-3）→ dag extractParams 透传（#15，此时类型已在）→ 冻结表两条文本（#7-9）。中间态：familyId 能存能透传但白名单空，无行为变化。
3. **frontend 投影/镜像**：#4-6 快照白名单与窄化写入、#14 客户端镜像（含 `FROZEN_PROMPT_ENTRY_COUNT` 注释 14→15、FROZEN_PROMPT_FAMILY_IDS 加 model-tryon、BINDING_MAP 加条目，promptPresetsFrozenClient.ts:100-160）。
4. **模板打标与种子**（#10-13）：依赖类型 + schema 先认 familyId。
5. **白名单启用**（#16）：最后一步，§4 五前置全绿后单独提交，便于出问题时单点回滚到 []。

每步独立可发布（中间态：familyId 能存但白名单空=无行为变化；冻结文本存在但模板未切=无引用）。改写层 backend 工与本契约在同一 worktree（feat/prompt-rewrite-backend）协作时，#7-9/#15/#16 与其同 PR 或紧接 PR 由 hermes 排。

---

## 7. 测试契约

冻结/快照（backend）：
- `tests/prompt-presets-frozen.test.ts`：EXPECTED_FAMILY_IDS 11→12（加 model-tryon）；EXPECTED_PRESET_KEYS 14→15（加 model-tryon:edit）；PRESET_TEMPLATE_TEXTS_SHA256 加新条目 hash；REWRITE_SYSTEM_PROMPTS（在改写层冻结测试里）加 default + model-tryon 两条 hash。
- 新增条目 hash 由实现落地时计算填入（契约不定 hash 值，只定「必须有快照行」）。

schema（backend）：
- image-generator data 带 familyId 合法字符串 → 校验通过且保留；空串/非字符串 → fail；输入节点（text/image）带 familyId → fail（GENERATION_FIELDS 反向清单）；video-generator 带 familyId → 静默剥离不报错。

快照/投影（frontend）：
- image-generator 带 familyId 落盘→回读，字段保留；无 familyId 投影结果不含该键；video-generator 投影永不带 familyId；unprojectedDocumentFields 对带 familyId 的 image-generator 返回 []。

模板一致性（backend，`tests/templates-v8.test.ts` 扩展）：
- EXPECTED 表（:35）builtin-model-tryon preset 改 `["model-tryon","edit"]`，新增期望 `familyId: "model-tryon"`、`aspectRatio: "3:4"`；
- 新增断言：tryon text 节点正文 === presetTemplateText("model-tryon","edit") 且以「用户补充要求」锚点结尾；tryon generator modelOptions 与 3:4 档一致；
- model 节点 id 断言（:86）保留；
- **新增种子一致性测试**：builtinTemplates() 每个模板的规范形与 data/templates/builtin/<id>.json 读回的规范形 deepEqual（驱动 §1.5 指纹回填，防代码/JSON 再次漂移）；测试沿用临时目录模式（:19）时对真实入库 JSON 另开只读比对用例。

dag/runner（backend）：
- extractParams 透传 familyId → step.params.familyId；
- 白名单三态（已在改写层 plan.md §6-f2）：familyId 命中→改写；缺失/不命中/空白名单→原文直通；
- model-tryon 改写集成样例：输入=冻结协议+用户补充，mock 文本通道，断言发出的 userPrompt 中协议段逐字未改（协议前缀完整匹配）、补充段被扩写。

---

## 8. 风险清单

| 风险 | 影响 | 缓解 |
|---|---|---|
| 启用白名单后冻结协议被改写器重写 | 改掉参考图角色绑定，服装/模特错配，出图事故 | §2.4 model-tryon 专用改写 system prompt 列为启用前置；集成断言「协议段逐字未改」（§7） |
| 种子 JSON 陈旧不回填（ensure 只补缺失） | 已部署环境永久 GET 旧模板（1:1、旧协议、无 familyId） | §1.5 指纹回填 + 种子一致性测试；双改 |
| 入边顺序不稳定导致参考图1/2 错位 | 协议角色绑定失效 | dag 按 edges 数组序（已亲验 dag.ts:277）+ 模板 edges garment 先于 model；前端徽标同源；不新增任何重排逻辑；模板测试锁定 edges 顺序 |
| familyId 不进快照 | 保存重开后白名单永久 miss | §1.3 纳入投影白名单，投影测试覆盖 |
| 用户在模板 text 正文里删改协议 | 模型缺角色绑定；改写器协议前缀匹配不到 | 文本是用户可编辑正文（不锁定）——协议缺失时出图质量靠模型对参考图的通用理解；改写器对「协议前缀不匹配」的输入回退用 default 提示词或跳过改写（实现时二选一写入 textRewriter：**裁定回退跳过改写、原文直通**，fail-closed，不拿 default 提示词去碰疑似协议文本） |
| 冻结文本 sha256 与实现不一致 | 模块加载/测试红 | 文本唯一来源=本契约 §2.1/§2.4 逐字；落地后 hash 入快照，改动须走契约修订 |
| 客户端镜像漏同步 | 前端预设目录/展示与 server 不一致 | #14 同批；catalog 测试（prompt-presets-catalog.test.ts）扩 model-tryon |

---

## 9. 不做（范围边界）

- 不改其余换装/设计模板（pose/background-swap/lookbook/digital-model/fabric-swap 等）的协议文本；
- 不给 video-generator 加 familyId、不做视频改写族；
- 不做 familyId 封闭枚举/管理 UI（手动画布不提供族选择器；族只由内置模板落标）；
- 不做 v8→v9 的 model-tryon variant 迁移（无历史数据）；
- 不重写参考图尾巴渲染（providerPromptRenderer「参考图:」intro 对 flare-vip edit 已满足；协议文本内的「参考图1/2」是模型指令层，与尾巴拼接共存，参考图尾巴仍由 providerPromptRenderer v4 统一追加，契约不改其版本）。

## 7. 派单记录（orchestrator 2026-10-12）

### 7.1 frontend 待办：familyId 类型字段（跨端第 1 步，纯加法，最先合）
- `src/types/workflow.ts` `ImageGeneratorNodeData` 加 `familyId?: string;`，注释：模板来源族 id（如 "model-tryon"），供运行时提示词改写白名单门控；缺省=不参与自动改写（旧文档/手动建节点 miss，fail-closed）。
- **video-generator 不加**（§1 裁定：本期无视频改写需求）。
- 只做类型纯加法：**不改 server schema、不改模板打标、不写打标逻辑**（backend 域）。
- 门槛：`npx tsc --noEmit` 0 error；若 five-node-model-ui 等测试因可选字段报错最小修。
- 提交信息：`feat(prompt-rewrite): 生成节点 familyId 类型字段（跨端契约 A 第1步）`；push 等统一指令。

### 7.2 backend 待办（顺序不可换）
1. 先修测试环境依赖红（见 7.3）——已完成并核实（干净 worktree 13/13 绿）。
2. 零跨端部分：冻结表 `PRESET_TEMPLATE_TEXTS["model-tryon:edit"]` + `REWRITE_SYSTEM_PROMPTS["model-tryon"]`（**逐字照 §2.1/§2.4 原文，禁抄 DM/转述缩写版**）+ 模板打标 + 3:4 + JSON 种子/一致性测试 + schema `familyId`（等 7.1 合入后）。
3. runner 门控（dag 透传 `step.params.familyId` + runner.ts:241 判定 + §6-f2）最后单独提交。
4. 白名单启用=独立可回滚提交（`REWRITE_ENABLED_FAMILIES: [] → ["model-tryon"]`，五前置全绿才开）。
5. 排队：§10 出图模型替换（nano-banana-2.1，仅可选模型、3.1 retired、删 512）。

### 7.3 已确认的测试环境陷阱（勿复发）
`tests/text-rewriter.test.ts` 的 fetch 注入用例必须同时注入 `apiKey`（`TextChatClientDeps.apiKey`），否则走 `config.apiyiApiKey()` → worktree 无 `.env` 即 `Missing required env var` → 主树偶然绿、CI 必红。
### 7.3 已确认的测试环境陷阱（勿复发）
`tests/text-rewriter.test.ts` 的 fetch 注入用例必须同时注入 `apiKey`（`TextChatClientDeps.apiKey`），否则走 `config.apiyiApiKey()` → worktree 无 `.env` 即 `Missing required env var` → 主树偶然绿、CI 必红。

---

## 8. orchestrator 协调令（2026-10-12，backend 必读；DM 多次 busy 未达）

### 8.1 #14 已就绪：请自行 cherry-pick
**分支 feat/prompt-rewrite-frontend @ aff65f3**（父 bbd66b6），仅 2 文件：`src/lib/promptPresetsFrozenClient.ts` + `tests/prompt-presets-catalog.test.ts`（+19/-9，零 server 改动）。
命令：`git cherry-pick aff65f3`（**orchestrator 不再动你的分支**——上轮撞车是我的流程错误，已固化教训）。

### 8.2 拿到后按序连做（§6 顺序）
1. **#7-9 两段冻结文本**：`PRESET_TEMPLATE_TEXTS["model-tryon:edit"]`（§2.1）+ `REWRITE_SYSTEM_PROMPTS["model-tryon"]`（§2.4），**逐字照本文件原文**，落表后重算真实 sha256（勿用预算值硬编码）。
2. **同步 tests/prompt-presets-frozen.test.ts**：11 族→12、14 条→15、加新条目 sha256（只有你能改）。
3. catalog 应转全绿（15=15，四处断言：条数/逐 server 条目反查/族 deepEqual/显式 variantId 双端函数）。
4. **#10-13 模板打标/3:4/种子双改 + ensure 指纹回填**：注意 `data/templates/builtin/builtin-model-tryon.json` 文本换新协议**必须与 #8 冻结条目同一提交**（catalog 3c-4 段要求 JSON 文本唯一命中冻结表）。
5. **#16 白名单** `[] → ["model-tryon"]` 单独提交（可单点回滚）。
6. PR 前如需重建干净提交链（上轮 amend 撞车），自行整理并验证 `git diff fa7f1d7 -- src/components/nodes/ImageNode.tsx` 为空。

每步门槛：全量 PG 绿 + `tsc --noEmit` 0。完成后报 <sha> 清单。
### 8.2 拿到后按序连做（§6 顺序）
1. **#7-9 两段冻结文本**：`PRESET_TEMPLATE_TEXTS["model-tryon:edit"]`（§2.1）+ `REWRITE_SYSTEM_PROMPTS["model-tryon"]`（§2.4），**逐字照本文件原文**，落表后重算真实 sha256（勿用预算值硬编码）。
2. **同步 tests/prompt-presets-frozen.test.ts**：11 族→12、14 条→15、加新条目 sha256（只有你能改）。
3. catalog 应转全绿（15=15，四处断言：条数/逐 server 条目反查/族 deepEqual/显式 variantId 双端函数）。
4. **#10-13 模板打标/3:4/种子双改 + ensure 指纹回填**：注意 `data/templates/builtin/builtin-model-tryon.json` 文本换新协议**必须与 #8 冻结条目同一提交**（catalog 3c-4 段要求 JSON 文本唯一命中冻结表）。
5. **#16 白名单** `[] → ["model-tryon"]` 单独提交（可单点回滚）。
6. PR 前如需重建干净提交链（上轮 amend 撞车），自行整理并验证 `git diff fa7f1d7 -- src/components/nodes/ImageNode.tsx` 为空。

每步门槛：全量 PG 绿 + `tsc --noEmit` 0。完成后报 <sha> 清单。

---

## 9. orchestrator 终检结论（2026-10-12；DM busy 未达，指令以此文档为准）

### 9.1 通过项（orchestrator 独立复跑/比对，非采信自述）
- `tsc --noEmit` 0；PG 全量 **80/80**。
- 两段冻结文本与 §2.1/§2.4 **逐字一致**（按代码块抽取 + sha256：preset 404 字符 `b593e8b9…`、rewrite 451 字符 `72768654…`）。
- `data/templates/builtin/builtin-model-tryon.json` 与代码定义一致（text sha `b593e8b9…`、familyId=model-tryon、aspectRatio=3:4）。
- `server/routes/templates.ts:157/160` 打标 + requirePresetText("model-tryon","edit") 到位；`textRewriter.ts:31` 白名单 `["model-tryon"]` 已开。

### 9.2 必补缺口：ensureBuiltinTemplates 指纹回填（§1.5 未落地）
`server/routes/templates.ts:470-484` 现仍是「文件缺失/不可读才写入」，**未做内容指纹比对**。
后果：已部署环境磁盘 JSON 为旧内容且「可读」→ 永不回填 → 拉新版本后模板仍是旧协议文本、无 familyId、1:1 画幅；git pull 与持久卷两条路径都收敛不到代码定义，本批改造在真实部署上等于未生效。

要求：
1. 按 §1.5 实现内容指纹回填（序列化为稳定 JSON 的 sha256 vs 磁盘文件解析后的**规范形**比对；不得比文件字节；thumbnail 等响应态字段不参与）；
2. 测试：陈旧可读 JSON（缺 familyId / 旧文本）→ ensure 后回填为代码定义；内容一致的 JSON 不被无谓重写；
3. 全量 PG 绿 + tsc 0 后提交并报 <sha>。

补齐这一项即可交 reviewer 门禁。
后果：已部署环境磁盘 JSON 为旧内容且「可读」→ 永不回填 → 拉新版本后模板仍是旧协议文本、无 familyId、1:1 画幅；git pull 与持久卷两条路径都收敛不到代码定义，本批改造在真实部署上等于未生效。

要求：
1. 按 §1.5 实现内容指纹回填（序列化为稳定 JSON 的 sha256 vs 磁盘文件解析后的**规范形**比对；不得比文件字节；thumbnail 等响应态字段不参与）；
2. 测试：陈旧可读 JSON（缺 familyId / 旧文本）→ ensure 后回填为代码定义；内容一致的 JSON 不被无谓重写；
3. 全量 PG 绿 + tsc 0 后提交并报 <sha>。

补齐这一项即可交 reviewer 门禁。

---

## 10. orchestrator 第3轮核验（2026-10-12；DM busy，以本文档为准）

### 10.1 已修好（读磁盘核实）
- `server/routes/templates.ts:114` familyId 落 **data 顶层**（`...(options.familyId ? { familyId: options.familyId } : {})`），modelOptions 不再携带。
- `data/templates/builtin/builtin-model-tryon.json`：垃圾字段 `generator` 已清除；data keys 干净、familyId 顶层。
- 代码定义与 JSON 一致。

### 10.2 仍未完成（自述已做，磁盘未做）
1. `tests/templates-v8.test.ts:123/128` 仍是**旧口径**（注释「modelOptions 额外含 familyId」+ 断言 `data.modelOptions?.familyId`）→ 该测试当前**红**。
   应改为：断言 `data.familyId === "model-tryon"`（data 顶层）+ 断言 modelOptions **不含** familyId（`assert.ok(!("familyId" in (data.modelOptions ?? {})))`）。这是拦住本 bug 的回归断言。
2. 上述改动尚未提交（`git status`：templates.ts / builtin-model-tryon.json 仍为 M）。
3. untracked `scratch/` 目录：提交前清掉，勿带进分支。

### 10.3 完成标准
改测试 → `templates-v8` + 全量 PG 全绿 → `tsc --noEmit` 0 → 单提交（信息注明「familyId 落位修正（data 顶层，不进 modelOptions）+ 模板指纹回填 + 垃圾字段清除 + 回归断言」）→ 报 <sha>。
### 10.2 仍未完成（自述已做，磁盘未做）
1. `tests/templates-v8.test.ts:123/128` 仍是**旧口径**（注释「modelOptions 额外含 familyId」+ 断言 `data.modelOptions?.familyId`）→ 该测试当前**红**。
   应改为：断言 `data.familyId === "model-tryon"`（data 顶层）+ 断言 modelOptions **不含** familyId（`assert.ok(!("familyId" in (data.modelOptions ?? {})))`）。这是拦住本 bug 的回归断言。
2. 上述改动尚未提交（`git status`：templates.ts / builtin-model-tryon.json 仍为 M）。
3. untracked `scratch/` 目录：提交前清掉，勿带进分支。

### 10.3 完成标准
改测试 → `templates-v8` + 全量 PG 全绿 → `tsc --noEmit` 0 → 单提交（信息注明「familyId 落位修正（data 顶层，不进 modelOptions）+ 模板指纹回填 + 垃圾字段清除 + 回归断言」）→ 报 <sha>。

---

## 11. 收尾三件事（orchestrator 2026-10-12；终检已通过，DM busy 以本文档为准）

终检结论：HEAD=3de25e7 通过（tsc 0、PG 80/80、三条回归断言在、代码定义与 JSON 一致）。剩：

1. **清 untracked `scratch/`**（仍在磁盘）——提交前删除，勿带进分支。`git status` 最终应只剩两份契约 docs（untracked 参考副本，不提交）。
2. **重建干净提交链**：现链 222175d 与 1d3a9a2 两条同信息（a11y hunk 折进后者）。合并为按域清晰的提交（「改写层零依赖」与「a11y 修复」各自归属）；重建后验证：
   - `git diff fa7f1d7 -- src/components/nodes/ImageNode.tsx` 为空（内容与主树一致）
   - 全量 PG 仍 80/80
3. **统一 familyId 面知识门 receipt**：覆盖 src/types/workflow.ts + server/engine/dag.ts + server/lib/workflowSchema.ts 三个 gated 文件，guard 闭环。

完成后报：`git log --oneline` 全量 + 全量测试尾部 + guard 状态。
