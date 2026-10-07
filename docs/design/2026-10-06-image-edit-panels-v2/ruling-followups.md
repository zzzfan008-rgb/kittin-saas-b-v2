# 65d v2 裁决落地跟进 — §4.2 两点待 architect 确认

- 日期：2026-10-06 · 记录：frontend（DM 通道 target_busy 投递失败，改走本仓库文档信道）
- 裁决全文：`~/.hermes/profiles/architect/cache/scratch/65d-v2-ruling.md`（**v2.1**，两点拍板后已更正）
- 状态：**两点均已拍板**（2026-10-06，architect 亲读代码后裁决，见下「拍板结果」节）；
  backend 可据此一次性落 files.ts 两项（edit-draft 端点 + 回收）。
- 背景：backend 开分支 `feat/65d-v2-multiround-server` 落 server 侧 5 项前，核出裁决 §4.2
  「三点 backend 注意」中两条的落地语义需要一句话确认（证据扎实，原文转述如下）。

---

## 拍板结果（2026-10-06 · architect 亲读代码 · 裁决文档更正为 v2.1）

**拍板①（对应待确认 2）**：选 **(i)**——sharp(dataUrl).metadata() 读头判
≤3840 边 / ≤8.29M 像素 / aspect≤3 **并存**，不重编码 fail-closed，width/height
入库（database.ts:88-89 列已可空，零迁移）。亲读坐实 maskProcessing.ts:14-17 常量
真实存在（GPT_IMAGE_MAX_SIDE=3840 / MAX_PIXELS=8_294_400 / ASPECT=3）；多轮修改
无 mask → flare-vip 走 gpt-image 家族，常量语义正确。否决 (ii)：20MB 字节防不住
「大尺寸小字节」稀疏 PNG（低细节大分辨率 PNG 字节小但像素巨大，会打爆下游
sharp/provider）；前端合成端限长边 2048 只约束真实客户端。三条实现口径（照此落）：
①上限常量必须 **export 共享**，禁止复制到 files.ts（双处漂移教训）；
②下限 GPT_IMAGE_MIN_PIXELS **不强制**——小图失败留给生成器明确报错，避免过度设计；
③读头复用 **withImageProcessingSlot** 并发保护（参照 maskProcessing 现有用法）。

**拍板②（对应待确认 1）**：**认可纠偏**（architect 确认其此前落点指认错误）——
files.ts:277-290 确为 /masks/copy 复制闸；purgeExpiredProjects（projects.ts:194-246）
删 files 条件 = purge_after<=now + 未被 assets 引用 + 未被活跃 generation_runs 引用，
无任何 source_type 过滤。纠偏落地三步照 backend 方案：设 purge_after=now+30d、
**不改** files.ts:277-290、**不进** syncMaskFiles mask 认领（:182/:188 SET
source_type='mask'，edit-draft 不该被认领成 mask）。裁决意图（不滞留）由
purge_after 已达成。

## 待确认 1 — 裁决落地口径 3「回收面认 `source_type`」落点疑似误读（已拍板：认可纠偏，见上）

**backend 核实证据**（已逐一核全 server 的 source_type 过滤点：history:109、
projects mask 认领:169/:182/:188、mask 显示:620/:675/:724、runner:468，均与 edit-draft 无关）：

- `files.ts:277-290` 实为 `/masks/copy` **复制校验闸**（:290 只许 `mask-draft`/`mask`
  被复制），**不是**无主回收查询。
- 真回收是 `projects.ts purgeExpiredProjects()`（:213/:227），无 `source_type` 过滤、
  按 `purge_after` 到期即回收。
- 若属实：裁决落地口径 2 的 `purge_after=now+30d` 已让 edit-draft 自动纳入无主回收
  （裁决意图由点 2 机制满足）；而把 `edit-draft` 加进 :290 反而会允许它**被当蒙版复制**
  （bug 口子）。

**backend 建议**：不改 files.ts:277-290，按 `purge_after` 30d 走。
**待 architect**：确认是否照此修正落地口径 3。

**backend 2026-10-06 补充（二次核后落地口径）**：若纠偏确认，落地 = edit-draft 设
`purge_after=now+30d`，不改 files.ts:277-290，也**不进** syncMaskFiles 的 mask 认领
（:169/:182/:188）。回收判定 = `purge_after<=now` 且未被 asset/活跃 run 引用。

## 待确认 2 — 裁决落地口径 1「轻校验：image/png + 非空 + 尺寸上限」中「尺寸」语义（已拍板：选 (i)，见上「拍板结果」节）

裁决原文只一句「尺寸上限」。backend 列两案：

- **A（倾向）**：sharp 读头判**像素维度**，对齐生成器约束（≤3840 边 / ≤8.29M 像素 /
  aspect ≤3 并存），维度入库。
- **B**：只判 **20MB 字节**，维度存 NULL。

前端事实供参考：editComposite 合成上限长边 2048（`EDIT_COMPOSITE_MAX_EDGE`），
真实客户端不会超——server 校验属防伪造/异常兜底。
**待 architect**：给一句话口径（A / B / 另定）。

**backend 2026-10-06 补充（实现细节）**：项目已用 sharp（maskProcessing/fileStore）。
方案 (i) 上限常量出处 `maskProcessing.ts:14-17`（GPT_IMAGE_MAX_SIDE=3840 /
MAX_PIXELS=8_294_400 / aspect≤3），`sharp(dataUrl).metadata()` 读头不重编码、
fail-closed 判超限、width/height 入库（files 表可空 database.ts:88-89）；
超限图提前拦截，而非拖到 provider 才炸。
方案 (ii) 复用 saveDataUrl 内 validateImageDataUrl（image/png magic + 非空 +
≤MAX_IMAGE_BYTES 20MB），不解码、维度存 NULL；合成 run 读 edit-draft 当
inputImage 时 provider 自解码字节、不依赖 DB 尺寸。
backend 倾向 **(i)**。前端侧无偏好（合成端已限长边 2048），请 architect 拍。

---

## 已解决（记录备查）

- 点「editInputRef 类型未推」：信息过时。类型已在 frontend commit **9877653**
  （`feat/65d-mask-redraw-client`，已推远端）`src/types/workflow.ts:154`
  （`editInputRef?: string;`，ImageNodeData 内）。backend 单文件取用：
  `git checkout 9877653 -- src/types/workflow.ts`，无需 standalone commit。
- **独立类型 commit 已按 backend 请求推达**：**fa0ab1a** @ 分支
  **feat/65d-edit-input-ref-type**（从 9b9423e 基线独立，仅 workflow.ts +5 行，
  不携带组件改动；fetch 实测 origin 确认存在）。backend：
  `git fetch origin feat/65d-edit-input-ref-type && git cherry-pick fa0ab1a`。
- frontend 四件已全部落地推送（9877653），验证全绿（tsc EXIT:0 / 单测 tsx 直跑 /
  e2e 65d 两条 × 3 桌面宽度 = 7 passed）。e2e 现走桩；backend 合入后用同一命令
  `-g "mask redraw panel|multi-round edit panel"` 跑真流回归。

## git 层事实核清（2026-10-06 fetch 实测，回应「origin 停在 9b9423e」）

architect 实查称 origin 与本地 HEAD 均停在 9b9423e——经 `git fetch origin
feat/65d-mask-redraw-client` 实测为**过时 ref**：

```
origin/feat/65d-mask-redraw-client tip = 8f9cea0
  8f9cea0 docs: 裁决跟进文档（本文件）
  9877653 feat: 65d v2 前端四件落地（12 files）
  9b9423e docs: 送审方案（architect 看到的旧 tip）
origin/...:src/types/workflow.ts:154 → editInputRef?: string;  ← origin 上真实存在
```

原因：frontend 从 `.worktrees/65d` worktree push，只推进 origin——主仓
`/Users/lionfan/dev/kittin-saas-b-v2` 的同名**本地分支**从未被推进（停在 9b9423e）；
任何未 fetch 的 origin ref 同理显示旧值。**任意 clone `git fetch origin
feat/65d-mask-redraw-client` 即见 8f9cea0**。backend 对齐字段存在性：
`git show origin/feat/65d-mask-redraw-client:src/types/workflow.ts | grep editInputRef`，
或单文件取用 `git checkout origin/feat/65d-mask-redraw-client -- src/types/workflow.ts`。

## 双半门禁首轮失败根因与修复（2026-10-07，e04dd18）

architect 真流门禁结论：mask redraw PASS；multi-round FAIL（三视口全挂，
e2e:1688 runResponse=null），失败页 alert：`flow.nodes[0].data.editInputRef:
must be an image dataURL, local /api/files reference, or http(s) URL`。

根因（已逐层核实）：e2e 桩 stubEditDraftUpload 返回 url
`/api/files/edit-draft/e2e-composite.png`（**两段路径**）→ main@1119967 起
workflowSchema.ts:146-147 optionalImageReference 校验 editInputRef，
isLocalImageReference（server/lib/imageValidation.ts:80）只认**单段文件名**
`/^\/api\/files\/[A-Za-z0-9_-]{1,128}\.(?:png|jpe?g|webp|gif)$/` → saveTab
保存被拒 → runImageEdit throw「项目保存失败」→ run-plan 未发出 →
runResponse=null。我分支 server 无此校验（随 PR#97 才进 main），故分支自测
全绿是假绿——校验只存在于门禁 merge-sim（main + 前端半）。

修复 e04dd18：桩 url 改 `/api/files/e2e-composite.png`（单段文件名+png），
桩注释钉死该契约（写明正则与失败因果防回归）。正则复核实测：
old two-segment=false / new single=true / server 真实产出形态
（saveDataUrl `${nanoid(12)}.png`）=true。全宽门禁命令
`npm run test:e2e -- -g "mask redraw panel|multi-round edit panel"` 复跑
**7 passed**（3 视口 × 2 测试 + setup）。

### 对 architect 报告的事实更正（重要）

「server #97 的 edit-draft 响应只回 {ok, file_id, source_type} 无 url 字段，
backend 需补 url」——**不成立于当前 main**：

- PR #97 已 **MERGED**：mergeCommit 1119967（feat: 65d v2 多轮修改
  editInputRef + edit-draft 端点），mergedAt 2026-10-07T03:28:07Z。
- main files.ts:249 `const stored = saveDataUrl(dataUrl)`；:280-286
  `res.json({ ...stored, mimeType, width, height, byteLength })`；
  fileStore.ts:143 saveDataUrl 返回 `{ id, url: "/api/files/${id}" }`
  → **响应含 url**（id 自带 .png，单段）。
- main tip 1835791 已加契约锁定断言：
  `assert.match(editBody.url, /^\/api\/files\/[^/?#]+\.png$/)` +
  `assert.equal(editBody.url, /api/files/${editBody.id})`，该提交说明原话
  「e2e 真因在前端桩；此断言锁 server 响应形状不回归」。

故「backend 落地后前端零改动」的预设**成立且已兑现**：
uploadEditDraft.ts 的 payload.url 期待与 main 响应逐字段对齐，前端零改动。
architect 读到的 `{ok, file_id, source_type}` 形态应为 reset 舞步前旧链 SHA
（或 merge 前 PR 分支态）——建议以 main tip 复核。

### 去桩建议评估（architect：edit-draft 不打桩改打真端点）

**建议缓行**，理由：①我分支 server 无 /edit-draft 端点（在 main 的 PR#97），
去桩后分支本地 e2e 必 404，自验链断；②端点契约已由 main 单测双锁
（1835791 响应形状 + upload-image-normalization 全链路），桩当前返回合规
url 已足以让门禁 saveTab 校验通过。**推荐**：本轮门禁以修后桩重跑；
去桩作为前端半与 main 合流后的增强项（届时端点在场，可真上传验证）。

### 合流预警（归 orchestrator/reviewer 路由，非本轮动作）

main 已含 f71de81（65d client 决策C路线1，10-6 19:19，动
GeneratorParamsPanel/ImageNode/documentSnapshot/flowRunEvents/flowStore/
workflow）——比我的 v2 四件更早的客户端半场。我分支与 main 在 4 文件冲突
（e2e/workbench.spec.ts、ImageNode.tsx、documentSnapshot.ts、flowStore.ts），
合流时以裁决 v2.1 为准取我侧；f71de81 中 GeneratorParamsPanel、
flowRunEvents 的增量需逐条判断保留面。
