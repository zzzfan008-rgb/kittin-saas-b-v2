# R-xx 节点与画布视觉/主题一致性优化方案（方向 D）

- 基线：main @ 0584cd7
- 作者：designer；输入：只读审计 findings 10 条（卡评论）
- 状态：**方案待用户定稿**。实施须另行派卡，本文档不改任何 src/tests/e2e/server/data。
- 规范锚点：`docs/design/2026-09-17-ui-audit/DESIGN-Rev2-locked-2026-09-19.md`（锁定版）、
  `DESIGN-Rev2.1` / `DESIGN-Rev2.2` 补遗、`tokens.css`（Rev.3 机读源）、`prototype-v4.html` 定稿。
- 主题唯一事实源铁律（§2）：`data-theme` + `--gc-*` 变量。任何 hardcoded 色值、
  `!important` 反查段、组件内字面色，都是"第二主题源"，属于本方案清剿对象。

## 对比度预验证声明

所有本文引用的对比度数值出自同目录 `contrast-probe.py` / `probe2` / `probe3` / `probe4`
（WCAG 相对亮度公式，与 CI 断言同口径）。关键结论：

| 场景 | 对比度 | 3:1 判定 |
|---|---|---|
| white 小地图节点现状 rgba(0,0,0,.08) | 1.20:1 | FAIL |
| white 候选 rgba(0,0,0,.45) | 3.30:1 | PASS |
| eye 小地图现状 #c9dccc | 1.25:1 | FAIL |
| eye 候选 --gc-text-muted #47685A | 5.37:1 | PASS |
| 曜黑小地图现状 --gc-border #33373f | 1.49:1 | FAIL |
| 曜黑候选 --gc-text-muted #9ba1a9 | 6.82:1 | PASS |
| 参考图不可用 amber-400 #fbbf24 on 白 | 1.67:1 | FAIL |
| 不可用候选 --gc-warn-text（white #b45309 / eye #92600a） | 5.02 / 5.38:1 | PASS |
| 可用候选 emerald-600 #059669（→ 改用 --gc-status-success） | 3.77:1 | PASS |

---

## 批次一：纯 token 接入（零风险，先做）

### VIS-02 [P1] 圆角 token 未接入，同类控件 6/10/12px 并存

- 证据：`src/components/nodes/` 全家族实测分布 —— `rounded-md`×17、`rounded-[10px]`×6、
  `rounded-sm`×6、`rounded-xl`×1、`rounded-full`×3（NodeFrame.tsx 卡体 rounded-xl=12px，
  图片槽 rounded-[10px]，按钮/输入 rounded-md=6px、rounded-sm=4px 四档并存）。
  tokens.css §2 已定稿 `--gc-radius-node: 12px / --gc-radius-ctl: 8px / --gc-radius-chip: 999px`
  却零引用（`grep gc-radius src/` 为空）。
- 严重度：P1（同类控件几何不一致，是最显眼的"没对齐"感）。
- 改法：
  1. `@theme inline` 增加 `--radius-node: var(--gc-radius-node)` 等映射，产出 Tailwind 语义类；
  2. 节点卡体/大圆角容器 → `rounded-node`(12px)；图片槽、文本框、参数面板从 10px/6px 收敛为
     12px 外层 + 8px 内层控件；`rounded-sm`(4px) 仅保留在 ≤20px 高的微缩元素（chip 内 tag）。
  3. 不新增第四个 radius 档；980 胶囊继续用 `--gc-radius-chip`。
- 三主题验收口径：NodeFrame 卡体、图片槽、内层按钮/输入三档截图对齐 ——
  曜黑/简白/护眼绿三主题下卡体圆角均 12px、内层控件均 8px，无 6/10px 残留。

### VIS-03 [P2] 节点阴影硬编码深色 rgba，三主题同值，浅底偏重

- 证据：`src/index.css:466`（静息 `0 10px 28px rgba(8,14,22,.2)`）、`:501`（hover
  `0 18px 38px rgba(8,14,22,.34)`）、`:515`、`:575`（handle 投影 rgba(0,0,0,.42)）——
  三主题共用同一深色投影。prototype-v4.html:22-58 已定稿分主题 `--node-shadow` /
  `--node-shadow-lift` 四层软阴影（简白全链 0.04~0.15 alpha，护眼绿以 #123B2B 调色），
  现行实现只取了 Rev2 锁定版 §A4 的单层描述值且不分主题。
- 严重度：P2（视觉分量重但不致不可读）。
- 改法（**有取舍，见 §决策点 D-1**）：
  - 方案 A（推荐）：接入 prototype-v4 已定稿的分主题双层阴影 —— 新增
    `--gc-node-shadow` / `--gc-node-shadow-lift` / `--gc-node-shadow-hover` 三个 token，
    每主题给值（数值唯一源 = tokens.css 追加段），index.css 四处改引变量。
    与 v4 定稿完全一致，简白/护眼绿立即减重。
  - 方案 B：只加一层 `--gc-node-shadow-color` 分主题给色，几何（10/28、18/38）保持不变。
    改动最小，但与 v4 四层定稿仍有偏差。
- 三主题验收口径：简白/护眼绿下节点悬浮时投影不再发黑发闷（合成后阴影不深于
  v4 定稿对应档）；曜黑不变或更深一档维持浮起感。

### VIS-09 [P2] destructive 与状态错误色双源

- 证据：`src/index.css:609` `--color-destructive: #dc2626`（shadcn 桥接段硬编码），
  与 `:root:117` 段 `--gc-status-error: #f87171`（浅色主题另有 #d30000 / #c23a3a 覆盖）
  是两套"错误红"，无引用关系。
- 严重度：P2。
- 改法：shadcn 桥接段改 `--color-destructive: var(--gc-status-error)`，让 Base UI 的
  destructive 语义（危险按钮、aria-invalid 环）从主题状态色取值。浅色主题下
  #d30000/#c23a3a 满足文字 4.5:1 与图形 3:1（已按 Rev.2 B5 口径加深，无需再动）。
- 三主题验收口径：任意触发 aria-invalid / destructive 按钮的界面，三主题错误红
  与节点状态错误点同色。

### VIS-10 [P2] 节点间距多档混用，缺 4px 栅格约定

- 证据：`src/components/nodes/` 实测 `gap-2`×9、`gap-1`×5、`gap-1.5`×4、`gap-0.5`×2、
  `gap-4`×1；纵向 `py-1.5`×9、`py-2`×3、`py-4`×2、`py-1`/`py-0.5`/`py-2.5` 各 1 ——
  出现 2/4/6/8/16px 五档纵距，无约定。
- 严重度：P2。
- 改法（纯约定 + 少量类名替换，不动布局结构）：
  - 节点内间距阶 = **4 / 8 / 12**（tokens.css 已有 `--gc-node-gap: 12px`、
    `--gc-node-toolbar-gap: 8px`）：控件行内 4px（gap-1）、控件组间 8px（gap-2）、
    区块间 12px（gap-3 / --gc-node-gap）；6px 档（gap-1.5/py-1.5）除紧凑按钮内边距外
    逐步归入 4 或 8；`gap-0.5`(2px) 仅限文字内微调。
  - 验收口径：抽 3 个节点家族（ImageGeneratorNode / TextNode / ResultImageNode）
    三主题截图，同层级间距像素一致，无 6px 纵距残留。

---

## 批次二：组件迁移，删 !important 反查段

### VIS-01 [P1] 中性类 + !important 反查 = 第二主题层，漏一条即换肤失败

- 证据：`src/index.css:302-338`（`[data-theme="white"/"eye"] .text-neutral-*` 工具类
  反查段，每条带 `!important`）、`:527-541`（节点卡内 `.text-neutral-200~600` 二次反查）。
  组件侧残留：`src/components/nodes/` 共 7 处 `text-neutral-*`（ImageGrid、ImageNode、
  MaskEditor、ResultVideoNode、VideoNode、NodeFrame 等），panels/initialDraft 另有
  8 个文件。语义已由 `--gc-node-text / --gc-node-muted / --gc-text-muted` 表达，
  反查段是给旧工具类兜底的影子层。
- 严重度：P1（结构性风险：新增组件若误用中性类，浅色主题要么失查要么继续加反查行）。
- 改法：
  1. 新组件一律用语义类 `text-(--gc-node-text)` / `text-(--gc-node-muted)` 或 `gc-text` 语义类；
  2. 按文件批次迁移存量：每改一个组件文件，同步删除该文件触达的反查选择器行；
     全部迁完后删除 302-338、527-541 两段；
  3. 每批次跑三主题截图（节点家族逐个），确认与迁移前逐像素/逐色一致 ——
     反查段删行只允许在截图比对通过后提交。
- 三主题验收口径：`grep -c 'text-neutral-' src/components` 归零；
  三主题下节点家族、面板文字色与迁移前截图一致（色值抽样比对）。

### VIS-06 [P2] 小地图/徽章/滚动条硬编码 = 小型第二主题源

- 证据（审计行号核对后修正）：
  - 小地图三主题映射 `CanvasFlow.tsx:193-195`：`node` 色三主题都取 `--gc-border`
    （变量引用 ✓），但 `mask` 是字面量 `rgba(10,10,10,.7)` / `rgba(29,29,31,.08)` /
    `rgba(48,69,43,.15)`——三档字面色散在组件里。
  - `RefOrdinalBadge.tsx:16`：`border: "1.5px solid #ffffff"` 硬编码白边
    （徽章底是 rgba(0,0,0,.62)，白边本身对比 6.19:1 合格，问题只在"白"不经变量）。
  - `src/index.css:128-133`：滚动条深色默认 `#2a2a2a`，white/eye 各有一行反查
    （318、337-338），属既有主题反查段的滚动条翻版。
- 严重度：P2。
- 改法：
  1. 新增 `--gc-canvas-mask-*`（遮罩色）与 `--gc-minimap-node`（小地图节点色）token，
     三主题分值收进 tokens.css，`MINIMAP_COLORS` 只剩变量引用；
     小地图节点色同时按 VIS-07 批次里的对比度结论换档（见 VIS-07 的 D-2 决策点）；
  2. RefOrdinalBadge 白边 → `var(--gc-node-main)`（三主题同值 #ffffff，语义直达）；
  3. 滚动条默认值改 `var(--gc-border-strong)` 派生，white/eye 反查行删除。
- 三主题验收口径：小地图/序号徽章/滚动条三件套截图，色值全部可追溯到 tokens.css；
  组件文件内 grep 不到 `#` 开头颜色字面量。

### VIS-08 [P2] 字阶任意值未消费语义字号变量

- 证据：`text-[11px]`×44、`text-[10px]`×7（nodes 家族）+ panels 多处；tokens.css §0 已定
  `--gc-font-label: 11px / --gc-font-meta-en: 10px / --gc-font-ui: 12px / --gc-font-body: 13px`
  并已在 index.css:69-73 接入变量名，但组件仍用任意值类。
- 严重度：P2（机械量最大的一条，建议单独一个批次/一张实施卡）。
- 改法：`@theme` 映射 `--text-label: var(--gc-font-label)` 等，产出
  `text-label / text-meta-en / text-ui / text-body` 语义类；44 处 `text-[11px]` 按语境
  归位（正文标签→text-label；纯英文徽章/坐标/时间戳→text-meta-en，遵循 tokens.css
  §0 "10px 仅限纯英文"约束）。中文出现 10px 的（ImageNode.tsx:303 提示文案、
  VideoNode.tsx:86 占位）**提级到 11px**——这是可读性修复，不是纯机械替换。
- 三主题验收口径：无 `text-[1x px]` 残留；三主题下文字渲染尺寸抽查一致；
  中文 10px 归零。

---

## 批次三：交互可访问性

### VIS-07 [P2] 大量可交互元素无可见焦点

- 证据：audit 称 "grep focus-visible 仅 2 处；RunButton 无环"。核实修正：
  shadcn 基线件（button/input/select/tabs/slider/checkbox 等）自带
  `focus-visible:ring-3 ring-ring/50` ✓；nodes 家族内有 2 处（ColorToolPanel:80、
  ImageNode:1194 focus-within）✓。**真实缺口**：节点家族自绘控件 ——
  ImageNode.tsx:314 替换按钮、MaskEditor.tsx:393 面板按钮、ImageGrid/VideoNode
  占位按钮、RefOrdinalBadge（装饰件可豁免）、ReferenceImageList 行操作按钮 ——
  以及 RunButton（NodeFrame.tsx:196，走 shadcn Button 自带环，**但有缺陷**：它叠加
  `transition-opacity hover:opacity-90` 且 active 态换底色，焦点环颜色
  `ring-ring/50` = accent 50% 透明度，在浅底主题上压到 3:1 以下）。
- 严重度：P2（键盘可达性硬伤）。
- 改法：
  1. 节点内自绘按钮统一 `focus-visible:ring-2 ring-(--gc-accent-deep)` 范式
     （与 index.css:543-549 的缩放补偿规则自动联动，画布内环宽恒 ≈2px）；
  2. RunButton 保留 shadcn 基线环但显式覆写 `focus-visible:ring-(--gc-accent-deep)`
     不透明（deep 色三主题对 panel ≥4.5:1）；去掉 hover opacity-90 与焦点环打架的写法，
     hover 提亮改背景色；
  3. 装饰性徽章/手柄维持豁免，不加环。
- 三主题验收口径：Tab 遍历一个七节点工作流，每个可交互件（含 RunButton 各态）
  有 ≥3:1 可见焦点环；截图存档三主题。

### VIS-04 [P2] SMIL 动画不受 reduced-motion 约束

- 证据：`PulseEdge.tsx:81/90/99` 三颗 `<animateMotion>`（SMIL）光珠沿连线奔跑；
  index.css:293-300 的全局 reduce 兜底只覆盖 CSS animation/transition，SMIL 不在其列。
- 严重度：P2。
- 改法（**有取舍，见 §决策点 D-3**，实施需与前端协调同根改动）：
  - 方案 A（推荐，改动最小）：PulseEdge 读 `matchMedia('(prefers-reduced-motion: reduce)')`
    （或项目已有 hook），reduce 时只渲染静态连线 + 末端箭头，不渲染三颗光珠。
  - 方案 B：SMIL 改 CSS `offset-path` 动画——落入全局兜底覆盖范围，视觉完全一致；
    但涉及连线渲染管线改动，风险高于 A，且与前端其他边类动画（若有）需统一。
- 三主题验收口径：reduce 开启时三主题连线均无运动光珠；关闭时恢复。

### VIS-05 [P2] 点阵无吸附对齐，行列参差

- 证据：`CanvasFlow.tsx` 无 snapToGrid/snapGrid 配置；`DotWaveBackground.tsx:57`
  `GAP = 24`（点间距 24px 逻辑像素，实为视觉纹理，节点坐标与其无关系）。
- 严重度：P2（体验增强，不是缺陷修复）。
- 改法（**有取舍，见 §决策点 D-4**）：
  - React Flow `snapGrid=[24,24]` + `snapToGrid` 状态开关（默认关，快捷键/工具栏开）。
    24 与点阵 GAP 对齐，拖拽落点即点阵格点。
  - 不做吸附参考线（那个是另一档工作量），只做格点吸附。
- 三主题验收口径：开启吸附后拖拽节点，松手位置 = 24px 格点（三主题相同，网格无关主题）；
  关闭后行为与现状一致。

---

## 决策点（用户拍板项）

### D-1 节点阴影档位（VIS-03）
- A. 接入 prototype-v4 定稿的分主题双层阴影（推荐；浅主题减重，与定稿一致）
- B. 只分主题给色、几何保持现状（改动最小，与 v4 有偏差）
- C. 维持现状不分主题（不推荐：简白/护眼绿投影发闷的问题不解决）

### D-2 小地图节点色三主题换档（VIS-06 关联，对比度已探针定值）
现状三主题 node 色全取 `--gc-border`，浅色下 1.2-1.7:1 不达 3:1。候选（probe3/probe4 实测）：
- A. 曜黑 → `--gc-text-muted` #9ba1a9（6.82:1）、简白 → rgba(0,0,0,.45)（3.30:1）、
  护眼绿 → `--gc-text-muted` #47685A（5.37:1）（推荐，全 PASS）
- B. 三主题统一 `--gc-text-muted` 变量引用（简白 4.66:1 PASS、护眼绿 5.37:1 PASS、
  曜黑 #9ba1a9 6.82:1 PASS——其实全过；少一个 token，但曜黑小地图会偏亮，
  亮片在暗画布上视觉权重偏高）
- C. 维持现状（不达标，不推荐）

### D-3 SMIL 静态化路径（VIS-04）
- A. reduce 时渲染静态连线、隐藏光珠（推荐，改动小）
- B. SMIL 改 CSS offset-path（覆盖更完备但动渲染管线，需前端评估）

### D-4 snapGrid 吸附（VIS-05）
- A. snapGrid=[24,24] + 开关，默认关（推荐）
- B. 不做吸附，仅点阵纹理微调（放弃该 finding）

---

## 实施批次建议（供 orchestrator 拆卡参考）

1. 批次一（token 接入）：VIS-02 + VIS-09 + VIS-10 + VIS-03(D-1) —— 一次交付，
   三主题节点家族截图验收；
2. 批次二（组件迁移）：VIS-01（按文件分批）+ VIS-06 + VIS-08 —— 每批删对应反查段，
   截图比对通过才准删行；
3. 批次三（可访问性/交互）：VIS-07 + VIS-04(D-3，与前端协同) + VIS-05(D-4)。

VIS-01 与批次二内部有依赖（同一段反查区）；批次一/二/三之间无交叉文件冲突，
可并行派卡但建议按序合入以减少 index.css 冲突。**VIS-04 实施涉及 PulseEdge 渲染分支，
与前端 A/B 方案同根，实施卡需前端签字。**

## 与锁定规范的偏差清单（需 Rev 补遗或用户解锁的项）

- tokens.css 需追加：`--gc-node-shadow*` 三槽（D-1 选 A 时）、`--gc-canvas-mask-*` /
  `--gc-minimap-node`、字阶映射四槽 —— 按 R-47/R-49 惯例出 Rev 补遗文件登记，
  不原地改锁定版。
- prototype-v4 的 `--node-shadow` 值若被 D-1 采纳，属"定稿值落地"，无新决策，直接入补遗。
- 无其他需要推翻既有裁定（§D4 胶囊标签等）的项。

## 验收总口径

- 三主题（曜黑 current / 简白 white / 护眼绿 eye）× 宽度 1280/1440 下逐批截图；
- 所有新色值对比度 ≥3:1（图形/状态）/ ≥4.5:1（正文）—— 数值以 probes 实测为准入复核；
- `grep` 断言：组件目录无 `text-neutral-`、无 `rounded-[10px]`、无字面色残留；
- 主线门禁照常（CI 五项检查），视觉验收由 ui-qa 复核。
