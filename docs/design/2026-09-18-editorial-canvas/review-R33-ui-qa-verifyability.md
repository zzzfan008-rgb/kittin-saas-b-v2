# R-33 · ui-qa 方案审核：可验证性复核

对象：`docs/design/2026-09-18-editorial-canvas/`（design.md / token-proposal.md / tokens.css / prototype-*.html / shots/）
角色：三方审核之一（ui-qa 域 = 可验证性）。**本轮不实现、不验收、不改 design 文件、不 commit、不 push。**
日期：2026-09-18 · 状态：审核意见（P1）

---

## 0. 结论摘要

| 级别 | 结论 |
|---|---|
| 阻塞 P0-1 | **§7 的「程序预验证」不可复现**：16 条声明中 5 条用 tokens.css 原值重算对不上（深色行 4 条 + 浅色「紫 on 卡其带」1 条），且深色 4 条的隐含底色与 `--gc-canvas` 不是同一个底（同段混用两种底色）→ 它现在是**结论**而不是**可复跑证据**，不能作为验收基线。已提供替代基线脚本 `review-R33-token-audit.mjs`。 |
| 阻塞 P0-2 | **paper-dark 的状态点/状态色在它自己的米白纸卡上 7/8 槽位 < 3:1**（实测 1.42–2.44，`unknown` 仅 1.42）。设计 §3 明确「卡头 = 编号 + 标题 + **状态点**」，而 §7 只把状态色对**深色画布**做了配对，从未测过「状态色 × 节点卡底色」。落地方案 token-proposal 未给卡内配对决策 → 无口径可判通过/失败。 |
| 阻塞 P0-3 | **§3 承诺的「端口中性底 + 静态 2px 紫环」在 app 里不可能靠填 token 实现**：真实端口样式由 `src/index.css:534` 的 `radial-gradient(…var(--gc-handle-highlight/mid/node-accent/dark))` + `border-color: var(--gc-node-main)` 驱动，纸感主题必须新增一段 `[data-theme="paper"]/.paper-dark .react-flow__handle` 覆盖（像 white/eye 那样）。token-proposal §A/§B 与 design §6 都没列这一条 → 验收时只能判「未实现」。 |
| 阻塞 P0-4 | **1024 档没有可验收的节点宽**：app 里 `src/components/nodes/NodeFrame.tsx:100` 硬编码 `w-[280px]`，原型是**流体 220–269px**（实测）；我按原样重渲染原型，1024 实测 **N-01 与 N-02 重叠 45.6px**、最右节点距画布右缘仅 **1.2px**。design §8「1024 实测通过」只能证明「不溢出画布」，不能证明「节点互不重叠」，也不能移植到 app。§6.5 未决（收侧栏 or 收节点卡）→ 决定前写不出 1024 断言。 |
| 建议 P1-1 | **paper-dark 是深色主题，却会落进 shadcn 的浅色分支**：`index.css:4` 是 `@custom-variant dark (&:is([data-theme="current"] *))`，编译产物里 **27 条** `dark:` 规则全部以 `:is([data-theme=current] *)` 为前缀（`dist/assets/index-_QwURfTc.css` 实测）。也就是说 paper-dark 下 18 处 `dark:` 工具类（button/tabs/dropdown-menu/input）**全部不生效**，同一个控件在 `current` 与 `paper-dark` 会走两套分支。design 的 D1「两个 data-theme 段与 white/eye 同构」在此维度上不成立，需明确决定。 |
| 建议 P1-2 | 现有取证链路 **拿不到动效证据**：`scripts/p0-screenshots.mjs:29` 以 `reducedMotion: "reduce"` 建上下文，而 D8 的 hover `-translate-y-2px` 只在非 reduce 下存在。 |
| 建议 P1-3 | 既有三主题「零改动」目前是**声明**没有证据。建议加「改动前/后三主题×三档逐像素比对」作为回归证据（成本低，见 §5-G6）。 |
| 通过的项（如实记录） | ① `shots/` 6 张经我本机 PNG 解码 + 主色统计，**确为 tokens 渲染**（命中 `#1d1a17/#23201b/#fbfaf7/#9c96f2`、`#fbfaf7/#f5f2ec/#ffffff/#4a42b8`）；② §1 的 `ink/45=2.73`、`ink/55=3.59` 复现为 2.72/3.60；③ light 行 9/10 条、dark 行 2/6 条逐值复现（差值 0.000）；④ 米白纸卡 + 紫 = 6.28:1（design 自己在 tokens.css 注释里引用的数）复现无误；⑤ 原型的 1024 右缘 774.8 < 776 复现（余量 1.2px）；⑥ §7 自认「焦点环只做了目测」「Plate 白描边未测」是诚实披露，我已补测（见 §3-B/C）。 |

---

## 1. 复核方法（全部可复跑）

| 证据 | 复跑方式 |
|---|---|
| WCAG 对比度重算 + 未覆盖组合矩阵 + 反解隐含底色 + ΔE/色相 | `node docs/design/2026-09-18-editorial-canvas/review-R33-token-audit.mjs` |
| 原型几何/计算样式重渲染（Playwright chromium，3 档 × 双主题） | 见本文件 §7 附录脚本（已实测运行，输出见 §3-A） |
| `shots/*.png` 是否为真渲染 | 本机最小 PNG 解码 + 主色直方图（脚本见 §7 附录 B） |
| 既有主题机制 / 契约测试 / 硬编码点 | `src/lib/theme.ts`、`src/index.css`、`tests/theme-contract.test.ts`、`e2e/workbench.spec.ts`、`scripts/p0-screenshots.mjs`、`dist/assets/index-_QwURfTc.css` 源码与产物核对 |

**声明实测与判断分离**：下文凡标「实测」均为脚本输出或本机渲染读数；凡标「源码证据」为静态阅读；凡标「判断」为我的裁定。

---

## 2. §7 对比度审计可信度裁定

### 2.1 可复现（11/16，差值 ≤0.001）

`ink on shell 15.07` · `muted on shell 4.42` · `accent on shell 7.28` · `白字 on CTA 7.60` · `白字 on hover 紫 8.96` · `queued 4.72` · `unknown 5.24` · `deco-text 4.95` · `珊瑚原色 2.85` · 深色 `accent 6.23` · 深色 `装饰珊瑚 6.51`。
→ 方法与公式（WCAG 2.1 相对亮度、alpha 合成）是**正确**的，`accent/coral` 两条与 `--gc-canvas #23201b` 精确吻合，证明底色取值本身没问题。

### 2.2 不可复现（5/16）

| 声明 | 声明值 | 我实测 | 差 | 反解：声明值要求底色亮度 Y 是多少 |
|---|---|---|---|---|
| 深 米白墨 on canvas | 15.02 | **14.53** | −0.49 | 0.0126（`#23201b` 实际 0.0147） |
| 深 muted on canvas | 6.21 | **6.01** | −0.20 | 0.0126 |
| 深 queued on canvas | 9.44 | **9.12** | −0.32 | 0.0125 |
| 深 unknown on canvas | 11.35 | **10.97** | −0.38 | 0.0125 |
| 浅 紫 on 卡其带 | 5.30 | **6.15**（on `--gc-panel-hover #ebe7dc`） | +0.85 | 0.682（≈等亮灰 `#d7d7d7`，tokens.css 无此底色） |

- 深色 4 条彼此自洽（同一隐含底 Y≈0.0126），但与交付的 `--gc-canvas #23201b`（Y=0.0147）**不是同一个底**；同一段落里 `accent/coral` 用的却是 `#23201b`。→ **同段混用两种底色**，判定：该行不是「对唯一事实源的一次测量」，而是迭代过程中的陈旧数字，未随 v2–v4 的调色同步刷新。
- 四条偏差**全部偏向乐观**（声明 > 实际），即这 4 条目前**高估了深色的对比度**；浅色「卡其带」一条偏向保守。
- 裁定：**§7 不能作为验收基线**。P0-1 → 修法（二选一，都零成本）：① 用我的脚本产出数值并回填；② 在 §7 顶部写明「脚本路径 + 复跑命令」。

### 2.3 方法层面的缺口（比数值本身更要紧）

1. **只按「主题的壳层底」测量，从不按「组件的实际父底」测量**。状态点画在**节点卡**上、焦点环画在**卡片内部控件**上、端口环骑在**卡边/画布交界**上——§7 这三处全部没测（见表 §3）。
2. **8 个状态槽位只交代了 3 个**（浅底只列 queued/unknown/error）。`running / retry / idle / warn` 一个没提，而这 4 个里有 3 个不达 4.5（见 §3-C）。
3. **没有可复跑脚本**：全文唯一「程序预验证」的载体是一段人读文字。

---

## 3. 未覆盖组合清单（实测值）

判定档：文本 4.5:1（AA）／大字号·图形·UI 组件 3:1（WCAG 1.4.11）。

### A. 页面几何（Playwright 重渲染原型，860px 高，deviceScaleFactor=1）

| 档位 | 节点宽 | position | 节点两两重叠 | 溢出画布 | 最右节点距画布右缘 |
|---|---|---|---|---|---|
| light/dark 1024 | **220.0** | absolute | **N-01 ↔ N-02 重叠 45.6px** | 无 | **1.2px** |
| light/dark 1280 | **227.2** | absolute | 无 | 无 | 24.0px |
| light/dark 1440 | **269.4** | absolute | 无 | 无 | 24.0px |

- 1024 重叠根因（实测）：`.canvas` 12 栏、1024 档每栏 43.6px，`grid-column: 1 / span 4` 的轨道宽 174.4px < 节点 `max-width:220px`，节点居中后左右各溢出 22.8px，正好咬进下一轨道 45.6px。
- 1280/1440 实测 `N-01.r == N-02.l`（507.2 / 734.4）→ **相邻节点 0 gutter**，两张白卡肩并肩；这是原型网格轨道的产物，React Flow 里节点由用户摆放，**没有对应物**，不要把它写成验收项。
- → design §8「三断点节点边界实测在画布内」可复现（774.8 < 776 ✓），但它只证明了「不越画布右界」，**不覆盖节点互叠**。

### B. paper-dark 的米白纸卡上的状态色（1.4.11，需 3:1）

| token | paper-dark 值 | on 米白卡 `#fbfaf7` | 同组合在既有 current（白卡） |
|---|---|---|---|
| `--gc-status-unknown` | `#5eead4` | **1.42 ★** | 2.72 |
| `--gc-status-warn` | `#fbbf24` | **1.60 ★** | 1.67 |
| `--gc-status-queued` | `#f5b83d` | **1.70 ★** | 1.86 |
| `--gc-status-success` | `#34d399` | **1.84 ★** | 1.92 |
| `--gc-status-retry` | `#fb923c` | **2.17 ★** | 2.26 |
| `--gc-status-error` | `#f28390` | **2.39 ★** | 2.77 |
| `--gc-status-running` | `#60a5fa` | **2.44 ★** | 2.54 |
| `--gc-status-idle` | `#8a8880` | 3.40 ✓ | 3.18 |

- 关键判断：**这是既有架构缺陷（current 同构且 7/8 也不达标），不是本主题首创**；但 paper-dark 在 7 个槽位上都**比 current 更差**（唯一更好的只有 idle），因为它把「深底亮色版」配色直接用在了最浅的纸卡上。渲染证据：原型 dark 档我实测到的成功态圆点就是 `rgb(52,211,153)` 画在 `rgb(251,250,247)` 上 = 1.84:1，**缺陷已在交付截图里存在**。
- 修法在调色板里现成：浅色主题的 8 个状态值就是为 `#fbfaf7` 这一档底配的（`queued #a16207` on 米白 = 4.72 ✓、`unknown #0f766e` = 5.24 ✓…）。决策归 designer/architect，我只指出「不决策就无法出判定」。

### C. 浅底主题（paper）的状态槽位覆盖缺口

| token | 值 | 面板 `#fff` | 画布 `#f5f2ec` | 白卡 `#fff` | §7 是否交代 |
|---|---|---|---|---|---|
| `--gc-status-queued` | `#a16207` | 4.92 | 4.41 | 4.92 | ✓（只报了壳层 4.72） |
| `--gc-status-running` | `#3b82f6` | 3.68 | **3.29** | 3.68 | ✗ 未提 |
| `--gc-status-retry` | `#ea8a00` | **2.58** | **2.31** | **2.58** | ✗ 未提 |
| `--gc-status-idle` | `#8a8880` | **3.55** | **3.18** | **3.55** | ✗ 未提 |
| `--gc-status-success` | `#1d7a3e` | 5.38 | 4.81 | 5.38 | ✗ 未提（达标） |
| `--gc-status-error` | `#c9334e` | 5.16 | 4.62 | 5.16 | ✓ |
| `--gc-status-unknown` | `#0f766e` | 5.47 | 4.90 | 5.47 | ✓ |
| `--gc-warn-text` | `#92600a` | 5.38 | 4.82 | 5.38 | ✗ 未提（达标） |

- `running/retry/idle` 与 **white 主题同值**（`#3b82f6/#ea8a00`，实测 white 面板 3.68/2.58）→ 属继承既有值。D9 说「状态色浅/深底重配对」，实际只重配了 3/8 个槽位，另 5 个静默继承。**要么在 §7 披露为「继承既有」，要么一并重配；现在的写法读起来像 8 个都审过。**

### D. 环类（端口环 / 焦点环）——「画在卡上还是画布上」的分岔

| 组合 | 实测 | 判定 |
|---|---|---|
| paper 端口环 `rgba(74,66,184,.75)` on 白卡 | 4.19 | ✓（四主题里最好） |
| paper 端口环 on 画布 `#f5f2ec` | 3.92 | ✓ |
| **paper-dark 端口环 `rgba(156,150,242,.75)` on 米白卡** | **1.94** | ★ <3:1 |
| paper-dark 端口环 on 画布 `#23201b` | 4.11 | ✓ |
| paper-dark `handle-mid #9c96f2` on 米白卡 | **2.50** | ★ |
| paper 焦点环 `#4a42b8` on 白卡 | 7.60 | ✓ |
| **paper-dark 焦点环 `#9c96f2` on 米白卡**（卡内 input/textarea/select 的 focus 环） | **2.50** | ★ |
| 基线：current 焦点环 `#FFC940` on 白卡 | 1.54 | ★（项目既有） |
| 基线：current 端口环 on 白卡 | 1.39 | ★（项目既有） |

- §7 把焦点环判为「风险低」，理由是 `accent 7.28:1 对底远超 3:1`——**这个理由用错了参照底**：卡内控件的焦点环参照底是 `--gc-node-main`（paper-dark 下 2.50），不是画布。
- 同样，Q3 问「静态紫环会不会造成认知跳跃」——现在可以量化：**paper-dark 的环在对画布 4.11 达标、对纸卡 1.94 不达标**，即同一端口的两侧可见性差 2 倍以上；而 `current` 的环两侧是 1.39 /（对画布）更高，方向相反。所以「跳跃」客观存在，只是需要决定接受它还是统一它。

### E. Plate 白描边（§7 自认未测，我补测）

白 `0.6` 描边：accent 3.83 / coral 1.95 / acid **1.14** / teal 1.69 / brick 1.63。
纯装饰（WCAG 豁免）——但 **Q4 一旦让 Plate 承载语义（色板/取色结果），豁免立刻消失**，1.14 会成为硬伤。→ 该条在 Q4 定稿前不可判定。

### F. 状态点两两可辨识（CIELAB ΔE76；10px 实心点）

- paper 最紧 3 对：`queued↔warn ΔE=7.0`、`queued↔retry 28.1`、`success↔unknown 31.1`
- paper-dark 最紧 3 对：`queued↔warn 10.4`、`success↔unknown 22.9`、`queued↔retry 24.8`
- 基线 current 最紧：`queued↔success 20.5`、`running↔unknown 31.3`
- 判断：`success↔unknown`（paper-dark 22.9）与基线同量级，**不构成新问题**；`queued↔warn` 的 7.0/10.4 远低于基线最紧对，**仅在两者会同屏时**才成为问题 → 需要 designer 回答「queued 点与 warn 文本会不会同屏」才能定判定。
- 色相角（D2「四主题 hue 各占一族」可量化）：current 43° / white 210° / eye 150° / paper 244° / paper-dark 244°。paper 与 white 只差 **34°**——是否算「各占一族」需要阈值（建议 ≥30° 或 ≥45° 二选一并写死）。

---

## 4. 对既有三主题的影响（你点名的第三问）

| 维度 | 实测/源码证据 | 裁定 |
|---|---|---|
| token 覆盖 | token-proposal §A/§B 只在新增的 `[data-theme="paper"]`/`[data-theme="paper-dark"]` 段赋值；`:root`、`[data-theme="current"/"white"/"eye"]` 不改；`@theme`/`@theme inline` 不动 | ✅ 不覆盖，**但这是推断，不是证据**（见 G6：建议补逐像素回归） |
| 全局 `[data-theme]` 反查段 | `src/index.css:443-532` 的 `.gc-node-card/.gc-node-body/.text-neutral-*` 均以 `[data-theme]` 为前缀 → 新主题**自动继承**，无需新增规则 | ✅ 与 token-proposal §E「不新增反查段」一致 |
| 契约测试 | `tests/theme-contract.test.ts:75` 是 `assert.deepEqual(THEMES.map(id), ["current","white","eye"])`——**精确深比较**，不改必然红；`cssBlock()` 用 `new RegExp(sel + '\\s*\\{')` 取**首个**匹配块 | ✅ design §6.1 指向正确；但见 G4 的写法陷阱 |
| 主题白名单 | `src/lib/theme.ts:21,23` 两处硬编码 `"current"/"white"/"eye"`；漏一处即静默回退（`getTheme()` 返回 `current`） | ✅ §6.1 判断正确 |
| e2e 硬编码清单 | `e2e/workbench.spec.ts:410-414` 与 `982-986` 两处 3 项列表 + `toHaveAttribute("data-theme", …)` | ⚠️ §6 未提，但必须同步；`theme picker` 测试会变成 5 轮 |
| **`dark:` shadcn 变体** | `src/index.css:4`：`@custom-variant dark (&:is([data-theme="current"] *))`；编译产物 `dist/assets/index-_QwURfTc.css` 里 **27 条** `:is([data-theme=current] *)` 选择器；源码里 18 处 `dark:` 出现在 `ui/button.tsx`、`ui/tabs.tsx`、`ui/dropdown-menu.tsx`、`ui/input.tsx` | ❌ **paper-dark 作为深色主题拿不到深色分支**（同控件在 current 与 paper-dark 走两套），D1「与 white/eye 同构」在此维度不成立。§6 完全未提 → P1-1 |
| 端口样式 | `white/eye` 各自有一段 `[data-theme="X"] .react-flow__handle { border-color; box-shadow }`（`index.css:279-286`、`305-312`）；paper 要「中性底 + 静态 2px 紫环」**必须**照此新增一段（真实 handle 的渐变与 3px 边框由 `:111`/`:534` 两处定义） | ❌ 提案缺该条目 → P0-3 |

---

## 5. 验收口径草案（方案定稿+落地后，我用什么证据判每条决策成立）

命名：G1…G12。**「机器」= 脚本/断言可判；「人眼」= 需人工看截图；「不可验证」= 见 §6。**
所有 e2e 断言落在**计算几何/计算样式/像素**上，不断言 class 名。

| # | 对应决策 | 证据（怎么取） | 判定阈值 | 类型 |
|---|---|---|---|---|
| G1 | D1 主题接入 | ① `npm run test`（theme-contract 5 项）② URL `?theme=paper|paper-dark` 与 localStorage 两路径 ③ 5 主题 × 3 档截图非空且主色命中 tokens.css | 断言全绿；截图主色集合包含该主题 `--gc-shell/--gc-canvas/--gc-node-main` 三值 | 机器 |
| G2 | D2 一色一义（紫） | 全页扫描计算样式，收集 `--gc-accent` 着色元素集合 | 集合 ⊆ {主 CTA, 选中描边, 焦点环, 连线 `--gc-edge`, 编号高亮}；出现集合外元素即红 | 机器 |
| G3 | D2 四主题 hue 不撞 | 取 4 个 accent 的 HSL 色相角，两两最小夹角 | 阈值需 architect 定：实测 paper 244° vs white 210° = **34°**（≥30° 通过、≥45° 不通过） | 机器（阈值待定） |
| G4 | D1/§6.1 主题段落位 | `tests/theme-contract.test.ts` 扩 5 项 + 新主题段 | **写法陷阱**：`cssBlock()` 正则是 `\]\s*\{`，若写成 `[data-theme="paper"],\n[data-theme="paper-dark"] {`，取不到块，报错是「缺少 CSS 作用域」而非「缺少 token」→ 必须写成**两个独立块**，或同步放宽 `cssBlock` | 机器 |
| G5 | §6.6 硬投影每屏 ≤1 | `document.querySelectorAll('.gc-elev-hard').length`，在画布/工作台、弹窗、空态三个场景分别计数 | 每个视口快照 ≤1；出现 2 处即红 | 机器 |
| G6 | 既有三主题零改动（我的增补） | 改动前/后各跑一遍 `scripts/p0-screenshots.mjs`，对 `current/white/eye × 1024/1280/1440` 共 9 张做逐像素 diff | 9 张全 0 差异（允许 0 容忍，因为只该新增 CSS 段） | 机器 |
| G7 | 状态色 × 实际父底（修 P0-2） | 对每个状态点，取 `getComputedStyle(dot).backgroundColor` 与**其父卡头/卡体**实测底色，脚本内算对比度 | 阈值需先决策：①严格 3:1 → current 基线也红（1.86–2.77）；②「不得比 current 更差」比较门禁 → paper-dark 目前 7 项更差，会红；③按 1.4.11 判定「点是否承载唯一语义」（有 `aria-label` + Tooltip 文案 → 可主张非唯一语义，走豁免） | 机器（口径待定，**这是 P0-2 的核心**） |
| G8 | 焦点环可见性（修 §7 误判） | 在 paper-dark 的**节点卡内** input 上 `focus()`，采样焦点环像素 vs 卡底色 | 3:1；若采「不低于基线」口径则须 > current 的 1.54 | 机器 |
| G9 | 端口语言（修 P0-3） | ① 断言存在 `[data-theme="paper"]`/`[data-theme="paper-dark"]` 的 `.react-flow__handle` 覆盖规则且样式非径向渐变 ② 采样端口外缘 8 向像素，对其**外侧相邻底色**（卡/画布）分别算对比度 | 两侧均 ≥3:1（paper-dark 现状 1.94 不达标）→ 阈值需先定「≥3:1」还是「不低于其他三主题」 | 机器 |
| G10 | 1024 档节点（修 P0-4） | e2e 在 1024/1280/1440 三档：`node.frame.width`、节点两两不相交、节点在画布 rect 内 | ①宽度必须先定基线（280？220？）②两两不相交（`rect.left/right/top/bottom` 判交）③越界 ≤0 | 机器（基线待定） |
| G11 | D8 动效 + reduced-motion | ① 非 reduce 上下文 hover 节点库行 → 读 `transform` 矩阵，采样 0/90/200ms ③ reduce 上下文同操作 | 非 reduce：180ms 内到达 `translateY(-2px)`，无出现缩放/弹跳；reduce：**全程不得出现非恒等 transform** | 机器（**需新增非 reduce 通道**，现有脚本恒为 reduce） |
| G12 | D6 衬线使用边界 | 遍历节点卡、表单、页签内所有元素，取 `font-family` | 卡内元素 font-family 不得含 `--gc-font-display` 解析值（Georgia/Songti SC/serif）；出现即红 | 机器 |
| G13 | D7 编号语法 | ① 节点卡头 `N-\d\d` ② 项目页签 `01/02/03` ③ 区块标题「名称 · 编号」顺序 | 正则 + 顺序断言 | 机器 |
| G14 | 视觉结论（人眼） | 5 主题 × 3 档共 15 张，与 `shots/` 并排审查：Plate 硬投影是否「每屏一处」而不抢视线、衬线/无衬线层级是否成立、深浅两套的「纸感」是否都成立 | 无阻塞级偏差；审美差异记为建议 | 人眼 |
| G15 | 参考文献气质保真 | 与 `/tmp/editorial-profile-archive-reference.tsx` 对照：mono 编号、Plate、硬投影、克制动效四个母题是否被正确移植 | 主观，仅作结论说明，不作门禁 | 人眼/不可验证 |

**额外必须补的「口径前置」**（否则 G7/G9/G10 无法执行）：
1. 节点卡宽度基线（280 / 220 / 响应式）—— owner：architect+frontend，design §6.5 已挂账。
2. 状态点对比度门禁口径（严格 3:1 / 不低于 current / 豁免声明）—— owner：designer+architect。
3. `dark:` 变体在 paper-dark 的处置（接受浅分支 / 扩 `@custom-variant` / 主题反查段补丁）—— owner：architect。

---

## 6. 不可验证 / 含糊表述清单

| # | 位置 | 表述 | 为什么无法被证据支持 | 建议改写为 |
|---|---|---|---|---|
| U1 | D2 | 「四主题 hue 各占一族」 | 未给「一族」的判定量 | 「相邻主题 accent 色相角 ≥N°（实测 43/150/210/244，最小 34°）」 |
| U2 | D9 | 「unknown 青 5.24:1（与紫 6.28 **距离足够**）」 | 「距离」未定义（对比度差？ΔE？色相？）；且只算了与紫的距离，没算与 success 绿的距离 | 指定度量（建议 ΔE76）+ 需检查的配对清单 |
| U3 | Q3 | 「会不会造成主题切换时的**端口认知跳跃**」 | 「认知」本身不可程序判定 | 拆成可测项：端口外缘对两侧底色 ≥3:1（实测 1.94 不达标）+ 跨主题端口外观 ΔE + 一份人眼 A/B 盲测协议 |
| U4 | D5/Q1 | 「Windows 上 Songti 缺失时掉到 Noto Serif SC 或默认衬线，跨平台字形不一致」 | CI（Linux headless）三个字体都不在；无网络字体时无法判定「气质保真度」 | 只断言 font-family **栈声明**与 serif 兜底存在；字形差异写成「需真机人工记录」，明确列为不可自动验收项 |
| U5 | D8 | 「克制动效（气质）」 | 气质不可测 | 保留可测部分：时长 180ms、位移 −2px、无缩放/弹跳、reduce 下归零 |
| U6 | §7 | 「焦点环…只做了**目测**（截图审查通过）」 | 与本节标题「程序预验证，非目测」自相矛盾（诚实披露值得肯定，但结论强度不够） | 我已补测（§3-D）；建议纳入 G8 |
| U7 | Q4 | 「Plate 是否承载真实语义（本轮默认纯装饰）」 | 未决 → 决定 WCAG 是否豁免 | 定稿后再定 G 项 |
| U8 | §3 | 「空态是 Plate 母题的主场」「弹窗沿用 `--gc-panel` 白卡」 | §7 自认两个面未出原型；无 token 引用、无几何，无法验收 | 出原型或明确写「P2 补截图」，本轮不列为验收项 |
| U9 | §8 | 「v1 审查发现 9 项 → v2 → v3 → v4 终审通过（无 P0）」 | 无逐项 checklist、无判据存档；我实测 1024 仍有节点互叠 45.6px，说明「终审通过」的判据不含「节点互不重叠」 | 附 v4 判据清单（哪几条、阈值多少） |
| U10 | §1 | 「实测 `ink/45 = 2.73:1`、`ink/55 = 3.59:1` **均不达 WCAG AA**」 | 数值本身可复现（2.72/3.60，差 0.01 属取整）；但「/55 仍不达 AA」措辞易误读——3.60 ≥ 3.0，达 **3:1 大字/图形**档，只是不达正文 4.5 | 明确写「/55 达 3:1 图形档，不达正文 4.5 档」，与它自己「≥/55 级用于 10px 装饰标签」的裁定统一 |
| U11 | token-proposal §B | 「共 37 个既有槽位，全部…填值——与 white/eye 段同构」 | 我数了 `coreThemeTokens`（23 项）必须齐；但「37」的构成未列清单，无法核对 | 附槽位清单（或直接引用 `tests/theme-contract.test.ts` 的数组） |

---

## 7. 预判验收阻塞点（按会卡住的先后排序）

1. **P0-2（状态色 × 米白纸卡）**：这是最可能让 P2 交付「看着完成了、实测不达标」的一项，因为 §3 的映射表**明确**要求卡头有状态点，而 §7 的审计维度里没有「卡」这个底。→ 需要先出决策（卡内状态色重配对 / 改卡底色 / 声明 1.4.11 豁免）。
2. **P0-3（端口）**：§3 承诺的视觉在 app 里靠现有机制不会发生；若 P2 只做 token-proposal 列的改动，我验收时会判「端口语言未实现」，而这会牵出一段新的 `data-theme` 覆盖 + 一次端口像素取证。
3. **P0-4 / §6.5（1024 节点宽）**：app 硬编码 280px 与原型流体 220–269px 直接冲突；原型在 1024 自身就有 45.6px 互叠 + 1.2px 余量，无法作为「1024 已通过」的证据。**决定前这一档完全无法验收。**
4. **P1-1（`dark:` 分支）**：不处理的话 paper-dark 的按钮/页签/输入框外观会与 current 的深色处理不同；这是「主题切换一致性」的可观测差异，人眼一眼能看出，但没人写进方案。
5. **P1-2（动效证据通道）**：现有截图脚本恒为 reduce，D8 的 hover 位移永远拍不到——不补通道，D8 就是不可验收项。
6. **G6（既有三主题回归证据）**：成本最低、收益最高的一条；「零改动」应当有 9 张逐像素 diff 兜底，而不是靠推理。
7. **P1-3（0 gutter / 落轨）**：如果 P2 试图把原型的网格落轨搬进 React Flow，会在 1280/1440 造出「卡片肩并肩无缝」的观感差异；这不是缺陷但会被当成缺陷报，建议提前在验收项里排除。

---

## 8. 我这一轮**没有**验证的（诚实声明）

- 未渲染 `src/**` 的真实工作台（本轮是方案审核，代码尚不存在；渲染需 dev server + PostgreSQL + 账号，属 P2 之后）。
- 未做 **Linux/CI 环境**下的字体兜底实测；`Georgia/Songti SC` 在 macOS 本次渲染可用，CI 不可用（U4）。
- 未做色盲模拟（protan/deutan）下的状态点可辨识度；只给了 CIELAB ΔE76。
- 未对 Plate 渐变做**逐像素**采样，只按 tokens.css 的三个色带端值计算（渐变中段的插值色未测）。
- 未评价设计的美学/气质（§5-G14/G15 属落地后的验收内容，本轮只审「能不能验」）。
- `shots/` 我做了主色与尺寸解码核对（确为真渲染），但**没有人眼看图**（本会话模型不具备可靠读图能力），因此对「视觉是否走样」不发表结论。

---

## 附录：本轮用到的复跑脚本

**A. token 复核（已入库）**
`node docs/design/2026-09-18-editorial-canvas/review-R33-token-audit.mjs`
输出 §2（声明 vs 实测 + 隐含底色反解）、§3 全量矩阵、§3-B/C/D、§4 基线、色相与 ΔE。

**B. 原型几何/样式重渲染（未入库，可重建）**
Playwright chromium 打开 `prototype-{light,dark}.html`，viewport 1024/1280/1440 × 高 860、`deviceScaleFactor:1`，读取 `.canvas` 与 `.node` 的 `getBoundingClientRect()`、`.node-head .dot` / `.handle` 的 `getComputedStyle`，并对 `shots/*.png` 做最小 PNG 解码（zlib inflate + 逐行 unfilter，8bit RGB 非隔行）后统计主色。
本轮实测输出即 §3-A 与 §0 的「通过的项②」。

**C. 静态证据点**
`src/lib/theme.ts:4,21,23` · `src/index.css:4,111-148,279-286,305-312,443-532,534-559,562-591` · `tests/theme-contract.test.ts:46-60,75,147-152,175-177` · `e2e/workbench.spec.ts:410-414,981-998` · `scripts/p0-screenshots.mjs:18-31` · `src/components/nodes/NodeFrame.tsx:43-67,100` · `dist/assets/index-_QwURfTc.css`（27 条 `:is([data-theme=current] *)`）
