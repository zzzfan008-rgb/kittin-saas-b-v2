# 服装提示词 × 模型评估与运行准入契约

这套评估不假定一份提示词能通用于所有图片模型。每个模型使用独立、可版本化的完整提示词和参数档案；只有同一评估单位内的证据可以合并。

## 当前实施状态（2026-09-08）

- 已实现离线契约、评估判定纯函数、提示词运行准入、持久化一次性授权账本以及 Worker 运行时证据链；这些能力不等于已经完成真实模型质量评估。
- 当前可执行范围由 `evaluation-plan-v2.json` 定义，只包含五个现役模型。`evaluation-plan-v1.json` 是不可改写的历史计划，已被 v2 取代，不得用于新运行、评估或发布准入。
- 当前五模型目录基线已按本轮人工复核物化：`2026-09-03T13:22:48.000Z` 的认证 `/v1/models` 原始响应为 61,774 字节、包含 271 个规范化唯一 ID，五个现役 ID 精确覆盖 5/5；原始文件 SHA-256 为 `7d5348336bbe5ac63a34107a506e3c5c72340064608c11193602df65c4327408`，`sha256-canonical-model-id-set-v1` 指纹为 `43b6914c1328f07599468e9129d18ba7966293cf73144b4a722c9494a2c8636d`。本次目录相对先前 269-ID 记录发生漂移，旧记录保持不可改写；原始文件继续保存在 Git 工作树外。
- 当前目录中的全部提示词变体仍为 `unverified`，没有任何变体被提升为 `verified` 或 `recommended`。因此普通运行会在界面、客户端和服务端被拒绝，不能绕过界面直接调用 `/api/run-plan` 或 `/api/generate`。
- `recommendation` 当前额外保持 fail-closed：仓库尚无经过人工复核的逐模型“基础提示词”定义，也没有把候选 case 与独立基线 case 配对的证据格式。历史或手工填写的 `baselineScores` 只为旧哈希链兼容而读取，不能生成推荐级 receipt、promotion 或运行时发布。
- 方案 A 当前仍是零费用准备清单，不是执行授权。不可变 Campaign/Slot 总账已实现；真实付费运行必须先封存一个具体 campaign，冻结全部 sample/case 槽位、输入哈希、模型、参数、单槽与全局请求/预算上限，并把一次性授权精确绑定到其中一个 slot。gate、promotion 和运行时激活还必须验证该具体 campaign 的完整证据闭包。没有任何真实 campaign 或真实质量结果会因清单、环境变量或自哈希制品而自动获得授权。
- 运行时支持状态不直接信任提示词目录中的状态字段。只有独立的评估发布清单同时保存并匹配提示词正文、所需参考角色、完整参数档案、契约哈希、评估版本和后处理版本的精确快照，才会得到 `verified` 或 `recommended`；当前发布清单为空。任何一项变化都会自动降回 `unverified`。
- 评估复核与发布制品只能写到 Git 工作树外的显式受控目录。结构检查会递归验证 registry、promotion、完整阶段 receipt 链、每个付费阶段的 Campaign Closure、contract check 和 retained `/v1/models` 原始文件，并重算可达闭包 SHA-256。构建只编入已锁定的 registry/bundle/code 身份；运行时才重新验证完整闭包。当前发布清单仍为空，因此没有任何变体被激活。
- 浏览器与服务端只编入最小运行准入投影；审批人、理由和时间仍保留在外置 promotion/receipt/contract 制品中，不进入浏览器 JS。
- 普通运行只允许 `verified` 或 `recommended`；`unverified` 和 `experimental` 只能进入另行授权的真实评估运行。
- 截至 2026-09-04，本轮实现、迁移验证和自动化测试付费调用数为 **0**，也没有形成可用于晋级的真实评估结果。历史成功、失败或超时记录只能作为重新测试线索，不能作为本轮通过证据。

## 节点、提示词与 Provider 参数离线复核

`node-prompt-parameter-matrix-v1.json` 是当前节点能力、逐模型提示词、判别联合参数档案和 API易请求形状的可重算离线证据。`npm run evaluation:node-matrix:check` 会从生产代码重新生成预期结构并与物化文件精确比较；测试还逐一核对提示词是否包含主体与任务、构图、风格与材质、文字限制、画幅输出和负面约束。

- 矩阵固定覆盖 7 类节点 × 5 个现役模型，共 35 个组合。
- 其中 9 个产品允许组合仍为 `unverified`：四个普通模型分别对应 `sketch-to-render` 与 `ai-modify`，以及 `gpt-image-2` 对应 `mask-redraw`。`unverified` 不是可运行状态，当前发布清单为空时仍会被浏览器、路由和 Worker 拒绝。
- 其余 26 个组合为 `unsupported`，没有提示词、参数档案或 Provider 请求形状。`fabric-recolor`、`upscale`、`print-extract`、`print-mutate` 全部保持产品级 fail-closed；`gpt-image-2` 也不扩展到普通生成或普通编辑节点。
- awesome-gpt-image-2 只提供提示词分类与六段式编写依据。生产提示词按模型、任务族和模式独立保存，不读取社区模板作为运行时回退。
- API易参数复核绑定当前本地契约与 Provider 构造器。Seedream 固定使用 `response_format=b64_json`、`watermark=false`、`sequential_image_generation=disabled`，禁止 `n` 和 `aspect_ratio`，并保留 Provider 实际输出尺寸。
- 该矩阵生成与检查不读取 API Key，不发送 Provider 请求；`noProviderCallsPerformed=true` 且 `imageGenerationOrEditCalls=0` 是证据范围声明，不是外部端点可用性证明。

## 固定评估单位

唯一键由以下字段共同组成：

`taskFamilyId × promptVariantId × presetId × presetVersion × nodeKind × modelId × operationMode × referenceRoleProfile × parameterProfileId × parameterProfileVersion`

- `referenceRoleProfile` 是实际 Provider 输入的有序 `{order, role}` 列表；顺序、数量和重复角色全部保留，蒙版轨还包括系统区域引导图与 mask。任何差异都会形成不同单位。
- 切换模型、节点、生成/编辑模式、参考角色顺序/数量、提示词版本、Provider 提示词 renderer 或参数版本，都会生成新的评估单位，禁止借用旧单位结论。
- 运行授权使用该单位的规范 JSON 生成 `sha256:...` 形式的 `evaluationUnitKey`。除上述字段外，精确授权键还绑定契约哈希、评估版本、后处理版本、业务画幅、输出数和完整模型原生参数；任何变化都会使旧授权失配。
- `sampleId` 标识黄金集或实验集中的原始样本，`caseId` 标识该样本的一次具体运行。两者都必填；获准重跑时保留 `sampleId`，但必须使用新的 `caseId` 和新授权。
- `providerContractVersion`、实际解析模型版本、Provider 提示词 renderer 版本/hash、输入归一化、后处理、黄金集或评分规则任一变化，已验证状态自动降为 `unverified`，重新跑完整评估。

## 方案 A：25 个基础单元与 9 个首批探针

`evaluation-manifest-v1.json` 是当前零费用准备清单。它将 25 个现役提示词变体逐一物化为完整 `PromptEvaluationUnit`，并绑定当前版本向量、业务画幅及不含代码 SHA 的 release-vector SHA-256。`npm run evaluation:manifest:check` 会从当前提示词目录、参数档案、评估计划和生产权威构造器重新计算全部内容；任一字段漂移都会失败，不能静默沿用旧清单。

方案 A 的 9 个首批 `model × mode` 探针采用最低参考图复杂度：四个普通模型各选 `commerce-hero` 的 generate 与 edit，GPT Image 2 使用唯一的 `mask-local-edit`。普通 generate 为 1:1、零参考图；普通 edit 只使用一张 `garment_full`；蒙版输入顺序固定为 `garment_full → generic 系统引导图 → mask`。这 9 个单位只代表自身，未入选的 16 个基础单位继续保持 `unverified`，不得借用探针证据。

当前固定、不复用的请求上限为：

- 单位完整生命周期规划上限：`1 + 8 + 24 + 50 × 2 = 133` 次。
- 9 个首批连通性探针：最多 `9` 次；若未来让这 9 个单位全部走完各阶段，则最多 `1,197` 次。
- 25 个基础单位全部走完各阶段：最多 `3,325` 次。

这些数字不包含补样，也是预算规划而非当前可执行授权。当前 `automaticRetries = 0`、`supplementalSamplesPerStage = 0`；任何无效结果、超时、断连或 `outcome_unknown` 都会停止后续调用，核对账单后另行决定是否建立新 case 和新授权。清单本身授权的付费调用数恒为 0，也尚未绑定干净 exact-SHA。真实探针前必须封存具体 Campaign/Slot：提供样本与素材哈希、当前单价和币种、campaign 硬预算、case ID 和逐 case 一次性管理员授权；账本会拒绝遗漏、重复或超额槽位。推荐阶段的 100 次候选/基线配对预算在基础提示词语义和双侧证据契约获批前不得授权或执行。

### 付费 campaign 账本已实现

真实执行不能由操作者临时列出一组“看起来成功”的 case。Campaign 总账会在任何授权之前冻结：campaign ID、阶段、精确评估单位、全部 sample/case 槽位与顺序、每槽最多一次 Provider 请求、模型/模式、素材 SHA-256、逐槽和全局最坏费用、币种、首次失败停止状态，以及获准重跑时与原 case 的关系。gate 按 campaign ID 从数据库读取完整闭包，拒绝自由挑选的子集；Worker 在同一事务中执行 campaign 级请求/预算计数与 stop 状态。

当前 campaign 实现状态为 `ready`，但这不等于已有可执行的付费 campaign。`evaluation:authorize --dry-run` 可用于离线核对单 case 参数；非 dry-run 写入必须绑定已封存的 Campaign/Slot。`ENABLE_PAID_EVALUATION_RUNS=true` 只允许服务在 clean exact-SHA 上启动，不构成调用授权；每次真实运行仍需真实数据库账本、逐 case 授权和精确 slot 绑定。`evaluation:review gate` 的非 `contract` 阶段必须提供 `--campaign-id`，并从账本读取全部槽位；`promote` 和非空 runtime bundle 则继续校验 gate、closed Campaign Closure、评分、账单与图像证据链。任何不完整、失败或 `outcome_unknown` 的槽位都会停止 campaign，不能通过环境变量、结构解析器或手工编辑数据库绕过这些校验。

## 分阶段淘汰

| 阶段 | 固定门槛 | 通过后的最高状态 |
|---|---|---|
| `contract` | 所有合法、边界和非法参数的离线契约测试通过；不存在文档冲突或静默降级 | `unverified` |
| `provider-probe` | 每模型、每模式串行 1 次最低成本探针；只证明通道完成，不证明质量 | `unverified` |
| `internal-experiment` | 精确使用 8 个互异样本且得到 8 个有效结果；均分 ≥70；严重失败与硬阻断均为 0 | `experimental` |
| `formal-validation` | 精确使用 24 个黄金样本；均分 ≥80、P10 ≥65、任务通过率 ≥85%、近期请求完成率 ≥95%；硬阻断和未解决 `outcome_unknown` 为 0 | `verified` |
| `recommendation` | 规划门槛：精确使用 50 个互异样本及 50 对独立候选/基线结果；均分 ≥88、通过率 ≥90%；相对受审的同模型基础提示词，配对增益的 95% bootstrap 置信区间下界 >0。当前因基线定义与配对证据契约未完成而硬阻断 | 暂不可晋级 |

每一阶段都必须先通过前置阶段，且当前阶段的 `caseEvidenceId`、`runId`、`caseId` 均不得与任何前置阶段收据复用；`provider-probe`、`internal-experiment` 与 `formal-validation` 的 `authorizationUnitKey` 也必须完全一致。任何硬阻断都优先于加权分数。`provider-probe` 不会把组合升为 `experimental`。

### 推荐级基线待确认

推荐级比较不能把五维分数直接写进候选 case 充当“基线”。后续实现必须为每个样本保留彼此独立的候选与基线 bundle，并分别重验请求快照、Provider 原图、业务成片、参考图角色/顺序/哈希、模型、模式、参数、版本、账单和人工评分。两侧只能在受审的提示词分支上存在预先定义的差异。

在产品明确“基础提示词”究竟采用逐模型任务族最小模板、原始用户意图，还是上一版已发布提示词之前，`evaluation:review` 会拒绝 `--baseline-scores-file` 与 `recommendation` gate；服务端也会忽略历史 detached baseline 分数并拒绝任何推荐级 receipt/promotion。内部实验与正式验证不受这一待确认事项影响。

## 评分与硬阻断

固定评分权重：

- 服装结构、颜色和材质还原：30%
- 指令遵循：25%
- 身份、姿势、构图及参考图角色边界：20%
- 肢体、纹理、文字和其它伪影控制：15%
- 商业可用性：10%

以下问题不能用平均分抵消：能力不支持、网关契约冲突、缺 Provider 原图、缺业务后处理图、参考角色串用、服装身份/结构严重损坏、不安全输出、证据链损坏、`outcome_unknown`、版本漂移。

## 运行时证据与双层图像

真实评估不仅保存最终图。Worker 在调用前会以已解析的实际请求建立 case 和 Provider request 证据，包括：

- 代码 SHA 及来源、契约/提示词/参数/评估/后处理版本、解析后完整提示词与其 SHA-256。
- `caseId`、`sampleId`、`authorizationId`、`evaluationUnitKey`、参考图角色/顺序/素材 SHA-256、完整原生参数和业务参数。
- 逐次 Provider 请求的开始/结束时间、耗时、解析模型、实际输出尺寸、结果或错误类别，以及预留最坏费用。
- 一旦某次 Provider 请求开始，case 和请求证据会在成功、确定失败或 `outcome_unknown` 时完成状态记录；失败样本可以没有图像证据，但不能丢失已开始请求及其错误证据。Provider 前的准入失败只记为零请求运行错误，不得计入质量样本。

每个成功样本必须保存两个不可混淆的证据：

1. `provider-original`：Provider 返回后、任何补边、缩放或 WebP 转换前的原图。
2. `postprocessed`：无限画布实际交付的业务成片，并通过 `sourceEvidenceId` 指回原图，同时记录后处理版本。

两层都记录 SHA-256、MIME、像素尺寸、存储引用和采集时间。Provider 原图还必须指向它所属的逐请求证据；成片只能指向同一 case/run/output 的原图。即使该节点当前不改变像素，也要分别生成两条证据记录，允许两个文件哈希相同。

## 付费调用与重试

本目录、类型、迁移及纯函数测试全部离线运行，不读取 API Key，也不会调用 Provider。真实付费评估默认关闭；`ENABLE_PAID_EVALUATION_RUNS=true` 只会在 clean exact-SHA 身份成立时允许服务启动，不会产生调用授权或绕过 Campaign/Slot 门禁。每次真实调用仍必须匹配已封存的 slot、一次性授权和实时请求/预算计数，并且必须提供 `GARMENT_CANVAS_CODE_SHA`。保留 Git 元数据时，该值必须等于真实 HEAD，且 dirty 状态只来自 Git；工作树不干净会直接终止。Git-less Docker 镜像则只接受构建阶段写入固定身份文件的 `GARMENT_CANVAS_BUILD_CODE_SHA`，并要求运行时 SHA 完全一致。构建身份只证明构建时声明的 SHA，不能证明 build context 干净，因此构建前仍必须通过干净 exact-SHA 发布门禁。

- 付费评估只接受管理员预先写入持久化账本的 `evaluation-unit` 精确授权，不接受仅按提示词变体划定的宽泛授权，也不接受请求时临时伪造的 `authorizationId`。授权绑定 active admin owner、模型、`evaluationUnitKey`、最大 Provider 请求数、每请求最坏价格（最小货币单位）、硬预算、币种、过期时间和审批理由。内部 CLI 可做零写入 `--dry-run` 校验；没有对外 HTTP 授权管理面。
- 一个授权只能使用一次。入队事务会锁定授权、重新计算 exact `evaluationUnitKey`，并原子地把它绑定到一个 `caseId`/run；并发请求中只有一个能消费成功。
- 每次真实评估必须由已认证的 active `admin` 发起，并同时提交合法的 `caseId`、`sampleId` 和已登记 `authorizationId`；一个 case 必须且只能包含一个付费节点。
- `/api/generate` 无条件拒绝任何带 `evaluation` 字段的 payload；真实评估唯一入口是 `/api/run-plan`，不能借直连端点绕过计划裁剪。
- 真实评估请求必须显式提交该付费节点的 `onlyNodeId`，并禁止 `includeDownstream=true`。执行计划只包含该节点；它的上游图片和角色从已保存画布快照解析，不执行上游或下游非付费节点，也不会让非 Provider 步骤提前消耗一次性授权。
- Worker 在每一次 Provider 调用前再次锁定账本，原子增加已用请求数与已用预算。预留金额为“该 case 最多 Provider 请求数 × 已审核单次最坏价格”，且不得超过硬预算；任一请求数或金额上限耗尽都会在上游调用前失败关闭。
- 评估运行强制持久化为 `run_type=evaluation` 与 `retry_policy=no-retry`。无论错误是否通常可重试，评估运行都不会自动重放。
- 同一所有者下的 `caseId` 具有唯一约束，用来阻止同一评估样本被误提交两次；需要获准重跑时应使用有关联关系的新 case ID。
- 一旦 Worker 开始 Provider 请求，case 和逐请求的账单状态均保持 `pending`，不会因为返回成功或确定失败而自动推断已计费/未计费。只有核对 API易调用日志与账单后，管理员才能通过带哈希链的追加式核对事件记录 `confirmed-not-billed` 或 `confirmed-billed`。人工评分同样使用不可更新/删除的追加式事件，不覆盖原始证据。
- 超时、断连或其它不能确认 Provider 是否接收/计费的情况标记为 `outcome_unknown`，立即停止后续步骤，并写入 case 硬阻断；在完成上述人工核对前不得重新提交。
- `outcome_unknown`、已计费失败、确定性参数错误和成功请求一律不得自动重放。真实探针、黄金集和回归调用仍须另行取得付费测试授权。

## 运行准入

运行准入采用 fail-closed 策略，并由浏览器反馈、客户端发起路径、服务端入队门禁以及 Worker 每次 Provider 调用前的最终门禁共同执行。即使任务入队后提示词、契约、发布快照或关闭规则发生变化，Worker 也会在上游调用计数增加前将任务确定性阻断，并保持 `provider_requests=0`。一次运行必须同时满足：

- 绑定的提示词变体与模型、节点类型、显式操作模式、任务族、参数档案、契约哈希和评估版本完全一致；不存在跨模型通用模板回退。
- 提示词正文、模型原生参数、业务画幅、输出数量和后处理版本没有偏离被评估的版本；系统不会静默修正参数。
- 所需参考图角色齐全，且没有“待确认”角色。
- 没有命中活动关闭规则。
- 普通运行的支持状态为 `verified` 或 `recommended`；真实评估运行则还必须通过上一节所述的部署开关、active admin 身份、`sampleId`、已登记 exact `evaluation-unit` 一次性授权，以及已封存的 `campaignId`/`slotId` 检查。

任一版本或绑定发生漂移时，旧节点不能借用已有证据，会显示具体禁用原因并要求重新选择、确认和评估。

## 四级静态关闭

关闭规则依次支持 `global`、`task-family`、`model-variant`、`task-family-model-node` 四个范围。任意匹配的活动规则都会关闭该单位；同时命中时以最具体规则作为展示原因。

当前实现是经过代码审查的静态运行时清单 `PROMPT_RUNTIME_SHUTDOWN_RULES`，初始清单为空。修改清单后需要随部署生效，并会同时作用于浏览器提示和服务端权威准入；它不是无需部署即可修改的动态管理后台。静态关闭只影响未来运行，不改写已有项目、历史结果或评估证据。

## 外置复核与发布闭包

评估管理员通过 `npm run evaluation:review -- <command>` 处理导出、账单核对、人工评分、离线 contract check、阶段 gate、晋级和 registry 校验。发布根目录按以下固定布局保存：

```text
prompt-release-registry.json
promotions/<artifactSha256>.json
gate-receipts/<artifactSha256>.json
campaign-closures/<artifactSha256>.json
contract-checks/<artifactSha256>.json
model-catalogs/<rawFileSha256>.json
exports/<artifactSha256>.json
```

根目录必须通过 `--release-root`、`GARMENT_CANVAS_EVALUATION_RELEASE_DIR` 或外部 `DATA_DIR/evaluation-release` 明确提供，并位于 Git 工作树外。工具只会在空的专用目录中建立 `.garment-canvas-evaluation-release-root` 标记；文件系统根、HOME、共享临时根、项目祖先或非空无标记目录都会被拒绝。路径逃逸、任意祖先 symlink、非普通文件或非固定文件名也会失败关闭。发布目录权限必须精确为 `0755`、文件必须精确为 `0644`，便于容器 `USER node` 跨 UID 读取。生产非空发布还会通过 Linux `/proc/self/mountinfo` 验证整棵发布树及所有嵌套挂载均为 `ro`，拒绝活动 registry 锁、目录循环/绑定别名和超过 20,000 项的异常树；普通 `0444/0555` 权限不能替代挂载级只读证明。`exports/` 用于人工审阅，但只有被 registry 递归触达的文件进入发布闭包：

```text
registry
  → promotion
    → 当前 gate receipt
      → 全部前序 gate receipts
      → 每个付费 stage 的 campaign closure
      → contract check
        → retained /v1/models 原始文件
```

每个可达文件按原始字节计算 SHA-256，相对 POSIX 路径排序后生成 `sha256-canonical-evaluation-release-file-set-v1` 根哈希。孤儿文件和未引用的 export 不进入根哈希，因此该值应称为“可达发布闭包哈希”，不是整个目录的笼统哈希。运行时除重算哈希外，还会逐一确认所有可达文件和包内父目录对服务进程不可写。

外置结构解析会重新检查阶段对应支持级、空失败/硬阻断、精确 case/sample 数、formal 黄金样本集合、指标门槛、cases/metrics 一致性、单阶段身份唯一性、`caseEvidenceId/runId/caseId` 跨阶段互斥，以及所有付费阶段的 `authorizationUnitKey` 一致性。每个非 `contract` receipt 还必须解析固定路径的 Campaign Closure，并逐字段匹配 campaign、阶段、代码 SHA、模型、授权单位和完整 case 集合。结构与自哈希本身仍不是可信签名；真实来源由账本、追加式账单/人工评分事件和 review CLI 的数据库复算提供，不能把手工构造的 JSON 当作质量或计费证明。

当前 Campaign Closure 只会在全部已封存 slot 成功、账单已核对、人工评分事件存在且 Provider 原图与后处理图两层证据齐全时生成；它记录每槽的 case/run/authorization/evidence 绑定及图像集合哈希。`promote`、运行时 bundle 校验和发布激活都会沿 receipt 链验证这些闭包。只增加一个 `campaignId`、聚合分数或自哈希制品不构成完整闭包。

`promote` 对 registry 的读取、防降级判定、原子替换和失败回滚都在跨进程锁内完成，并使用原始 registry SHA-256 做 CAS。同时晋级不会丢失已发布条目，过期回滚也不能覆盖其他进程的成功结果。遗留 `.prompt-release-registry.lock` 时不自动删除：预检和新写者会保持阻断，管理员必须先人工确认无存活 writer。

`contract-check` 会在连接数据库和写制品之前依次执行本地 API易知识库、离线文档契约、五模型 Provider/参数/提示词/准入测试以及方案 A 评估清单校验，并要求一个人工复核的原始 `/v1/models` 导出。保留的 2026-09-02/03 脱敏探针只证明当时配置令牌的历史观测视图；当前基线来自 `2026-09-03T13:22:48.000Z` 的人工复核，记录在 `../apiyi/evidence/2026-09-03-manual-model-catalog-review.json` 与 `../apiyi/reviews/2026-09-03-manual-model-catalog-review.md`。生成 contract check 时仍必须提供 Git 工作树外的精确原始文件，并同时匹配原始字节 SHA-256 与规范化 ID 集合 SHA-256，不能用仓库内摘要代替。

模型目录基线已批准不等于发布就绪：五个模型仍为 `unverified`，必须继续完成模型评估证据、阶段 gate、promotion、registry 和干净 exact-SHA 发布门禁。目录存在本身不证明生成、编辑、质量或计费。

部署非空发布前必须先执行：

```bash
npm run evaluation:release:preflight
docker compose -f compose.yaml -f compose.evaluation-release.yaml config --quiet
```

宿主预检绑定外置目录、固定 registry 位置、registry 原始字节哈希、闭包哈希以及构建/运行代码 SHA，并只接受恰好 40 或 64 位的小写十六进制代码 SHA。预检输出中的 `ok: true` 仅说明 `hostMountOnly: true`；它会同时返回 `campaignStatus: ready` 表示账本实现已存在，但 `campaignReady: false` 明确表示宿主挂载预检本身没有加载某个具体 campaign 的完整 case/证据闭包，不能解读为发布、构建或运行时已获准。生产运行时再次重算闭包并与环境变量、前端 manifest、服务端 manifest 和服务端内嵌最小 registry 投影核对。所有这些步骤都是零 Provider 调用；真实探针与质量样本仍需独立付费授权。
