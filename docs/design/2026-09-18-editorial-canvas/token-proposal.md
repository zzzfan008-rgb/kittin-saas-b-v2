# token 落地提案（供 frontend 审）· 映射到既有命名

唯一数值事实源 = [`tokens.css`](./tokens.css)。本表只回答「落到哪里」。

## A. 新增 token（仅本主题引入）

| 新 token | 用途 | 落点 |
|---|---|---|
| `--gc-plate-coral / -acid / -teal / -brick` | 几何色卡 Plate 的三色带 + 装饰珊瑚 | `[data-theme="paper"]` / `[data-theme="paper-dark"]` 两段各一份 |
| `--gc-deco-text` | 珊瑚的文本安全变体（error 态同族复用） | 同上 |
| `--gc-font-display` | 衬线展示字栈 | 同上 |
| `--gc-font-editorial-meta` | 编号/标签 = 复用 `--gc-font-mono` | 同上 |
| `--gc-tracking-display / -meta` | 负字距 / 大写宽字距 | 同上 |
| `--gc-elev-hard` | 硬投影（每屏 ≤1 处） | 同上 |
| `.gc-plate` / `.gc-plate-alt` / `.gc-meta-index` / `.gc-display` / `.gc-elev-hard` | 共享装饰工具类 | `src/index.css` 末尾新增段（不属任一 data-theme） |

## B. 复用既有 token（新主题段填值，不动现有三主题）

`--gc-shell · --gc-canvas · --gc-panel · --gc-panel-hover · --gc-control · --gc-text · --gc-text-muted · --gc-border · --gc-border-strong · --gc-accent · --gc-accent-cta-ink · --gc-accent-deep · --gc-primary-foreground · --gc-node-main · --gc-node-header · --gc-node-inner · --gc-node-inner-hover · --gc-node-border · --gc-node-text · --gc-node-muted · --gc-node-accent · --gc-edge · --gc-handle-highlight · --gc-handle-mid · --gc-handle-dark · --gc-handle-ring · --gc-handle-glow · --gc-status-*(×8) · --gc-warn-text`

共 37 个既有槽位，全部在 `[data-theme="paper"]` 与 `[data-theme="paper-dark"]` 两段填值——与 white/eye 段同构，契约测试 `coreThemeTokens` 循环可直接覆盖。

## C. theme.ts 改动点（最小集）

```ts
export type ThemeId = "current" | "white" | "eye" | "paper" | "paper-dark";
// THEMES += { id:"paper", label:"纸感编者", swatch:"#4a42b8", desc:"暖米白纸 + 编辑紫" }
//         += { id:"paper-dark", label:"纸感编者·墨", swatch:"#9c96f2", desc:"暖墨画布 + 米白纸卡" }
// getTheme() 的 URL/localStorage 校验白名单同步加 "paper" | "paper-dark"
```

## D. 契约测试扩展

- `THEMES.map(id)` 断言 → 5 项
- `for (const theme of [...])` 循环加 `"paper"`, `"paper-dark"`
- 若断言「每主题完整 token 集」→ 白名单加 §A 的 9 个新 token

## E. 不做

- 不改 `@theme` 回退值（gold 仍 = 活力黄，与默认主题一致）
- 不改 `@theme inline` 的 shadcn 语义桥（paper 主题自动继承 `--gc-*` 桥接）
- 不新增反查工具类段（`[data-theme="paper"] .text-neutral-*`）——新主题组件直接用 `var(--gc-*)`，符合 2026-09-17 定稿§7「新组件不再新增反查规则」
