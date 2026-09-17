# Garment Canvas UI 审核 — 2026-09-17

审核人：UI/UX Designer（Hallmark audit 规程）
对象：`kittin-saas-b-v2` @ dev 工作树（src/components 全量 + index.css + 运行态视觉 9 张截图，1280×720，三主题）
方法：代码审读 + 隔离实例登录实截 + WCAG 对比度程序计算。未修改任何产品代码。

---

## 总评

底子不差：`data-theme` + `--gc-*` 单一主题源、shadcn/Base UI 桥接、WorkbenchShell 的 aria/inert/motion-reduce 都是正确工程。**核心问题是 token 体系被架空**——组件里 100+ 处硬编码色值迫使主题系统用「类名反查」打补丁，三套主题的 accent 语义漂移，加上 8–10px 中文字号，让完成度停在「工程师自用原型」而非「服装设计 SaaS」。

**统计：4 critical · 6 major · 5 minor**（视觉证据：`shots/` 目录）

---

## Critical

### C1 · Token 系统被架空（mid-render token improvisation）
- **Where**：`src/components/**` 全域——`#262626`×40、`#333`×20、`#0f0f0f`×19、`#141414`×9…共 100+ 处内联 hex；典型如 `NodeFrame.tsx:71` `bg-[#141414]`、`inputClass`（`NodeFrame.tsx:204`）。
- **后果**：`index.css:222-294` 被迫用 `[data-theme="white"] .bg-\[\#141414\]` 这类**转义类名选择器**反查覆盖主题。组件里改一个任意值类，主题静默断裂，无任何报警。
- **Fix**：硬编码色全部迁入 `--gc-*` 语义 token（映射表见 `design.md` §3），删除类名反查段。

### C2 · 双主题源冲突 + 死文件
- **Where**：`theme-blocks.css`（仓库根）无任何引用（vite.config/HTML/CSS 均未 import），但其中 white 主题值（`#f5f4f0`）与 `index.css:224`（`#ffffff`）冲突。
- **Fix**：删除 `theme-blocks.css`。

### C3 · 字体声明是假的
- **Where**：`index.css:49-55` `font-family` 首选 `"Inter"`，但全项目无任何字体加载（无 fontsource / googleapis / @font-face）。macOS 实渲染 PingFang SC，Windows 实渲染 Microsoft YaHei——两端观感不一致，且声明本身误导。
- **Fix**：二选一（推荐 A）：A) 删掉 Inter，诚实走系统栈并为数字/坐标引入一个自托管 mono；B) 自托管 Inter Variable + 中文系统栈回退。

### C4 · 8–10px 中文字号
- **Where**：`text-[10px]`×131、`text-[9px]`×38、`text-[8px]×14`。8px 见于 `ImageViewer.tsx:38,42`、`ImageInputNode.tsx:190`、`FabricRecolorNode.tsx:176`、`ReferenceRoleSummary.tsx:120,207`。视觉审核确认：节点 50% 缩放下正文「几乎不可读」。
- **Fix**：中文最小 11px；10px 仅限英文徽章/标签；8/9px 清零。

## Major

### M1 · accent 语义漂移与命名失真
- 暗金=金 `#9a7333`；「黑白」主题 accent=粉 `#dc7397`（`index.css:333`）——既不黑白也非品牌色，视觉审核抓到「粉 accent + 绿 minimap + 深节点」三重冲突；护眼绿=藏蓝 `#173b63`。
- **Fix**：见 `design.md` §5 语义分配表。「黑白」建议改名「墨白」并用近黑 accent。

### M2 · 护眼绿主题是换肤半成品
- 蓝灰节点（`--gc-node-main:#adc8dc`）× 绿画布冷暖冲突；`--gc-node-muted #48677e` on `#adc8dc` = **3.43:1（不达 4.5）**。
- **Fix**：节点族改绿灰同族，accent 改深绿（`tokens.css` 已给值）。

### M3 · 金色一色多用，语义过载
- 视觉审核：品牌字、管理员徽章、活动标签点、警告文字、unsupported 徽章、主按钮、状态点**全是金**。用户无法靠颜色判断重要性。
- **Fix**：金只保留「品牌 + 主 CTA + 选中态」；警示归 amber、错误归 red、unsupported 归中性灰。

### M4 · 「黑白」主题节点内两套控件语言
- 白主题下节点反转成深色卡片（方向成立），但节点内 input/select 仍走 `--gc-node-inner`（深），与左侧面板浅色控件形成两套语言；粉 accent on `#fffefb` = **3.00:1 踩线**。
- **Fix**：节点内控件跟随节点表面 token；accent 换墨色后自动达标。

### M5 · reduced-motion 覆盖不全
- src 内无 `@media (prefers-reduced-motion)`；仅 10 处 Tailwind `motion-reduce:` 变体（集中在 WorkbenchShell）。`develop-*` 扫描线（`index.css:154-220`）、`animate-pulse`×5、`btn-running-breathe` 均无兜底。
- **Fix**：全局 media query 一条兜底（`design.md` §8）。

### M6 · 状态点无图例、尺寸过小
- `NodeFrame.tsx:31-38` StatusDot 8px 直径、8 种状态色，无图例；视觉审核：「用户不知道金点代表什么」。
- **Fix**：状态点 ≥10px + hover 图例（title 已有，需 visible tooltip），排队/运行态加描边环。

## Minor

- **m1** 默认项目名 `未修改项目名称20260917000000`（机械时间戳）→ 「未命名项目 · 09-17 14:32」。
- **m2** `unsupported` 英文徽章混在中文界面（`NodeLibraryPanel.tsx:115`）→「首版暂不支持」已有中文说明，徽章改「暂不支持」。
- **m3** onboarding 出现 `V1.2.0` 版本徽章 + `WORKSPACE GUIDE`/`STEP 1/4` 中英混杂（视觉证据）→ 去版本徽章、统一中文。
- **m4** 节点库卡片因 unsupported 警告文案高度不齐 → 警示文案收进 hover/展开区。
- **m5** 连线细弱、无方向箭头（视觉证据）→ marker 箭头 + 提级到 border-strong 色。

## 正面确认（不需要动）

- 对比度抽查 21 对，19 对达标（含全部正文/次要文字）——色板本身是健康的。
- `@theme inline` 把 shadcn 语义色桥到 `--gc-*`（`index.css:513-541`）——正确做法，保留。
- React Flow handle 的多层阴影/径向渐变（`index.css:485-510`）是全项目最「被设计过」的细节，保留。
- WorkbenchShell：aria-controls/expanded、inert、focus 语义齐全。

## 附：对比度计算结果（程序算得）

| 配色对 | 对比度 | 结论 |
|---|---|---|
| 护眼绿 node-muted on node-main | 3.43:1 | ✗ 不达 4.5 |
| 白主题 粉 accent on panel | 3.00:1 | ✗ 踩线（换墨色后消除）|
| 其余 19 对（正文/次要/节点字/警示） | 4.6–14.6:1 | ✓ |
