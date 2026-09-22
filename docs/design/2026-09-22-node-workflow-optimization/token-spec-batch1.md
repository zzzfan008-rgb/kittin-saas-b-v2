# 批次一 Token 规范值清单

> 产出时间：2026-09-22
> 依据：`design-plan.md` §批次一 + 决策点 D-1=A
> 数值唯一源：`docs/design/2026-09-17-ui-audit/tokens.css`（已追加）
> 原型锚定：`docs/design/2026-09-17-ui-audit/prototype-v4.html` §节点家族

---

## 1. 节点阴影（VIS-03 / D-1=A）

三槽 + 三主题，各主题独立值（数值源：prototype-v4.html §节点家族）。

| Token | 曜黑 (current) | 简白 (white) | 护眼绿 (eye) |
|---|---|---|---|
| `--gc-node-shadow` | `0 0 0 0.5px rgba(0,0,0,.5), 0 1px 2px rgba(0,0,0,.4), 0 4px 10px rgba(0,0,0,.36), 0 20px 44px rgba(0,0,0,.5)` | `0 0 0 0.5px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.05), 0 4px 8px rgba(0,0,0,.05), 0 20px 44px rgba(0,0,0,.11)` | `0 0 0 0.5px rgba(18,59,43,.06), 0 1px 2px rgba(18,59,43,.05), 0 4px 10px rgba(18,59,43,.06), 0 20px 44px rgba(18,59,43,.11)` |
| `--gc-node-shadow-lift` | `0 0 0 0.5px rgba(0,0,0,.5), 0 2px 4px rgba(0,0,0,.42), 0 8px 18px rgba(0,0,0,.4), 0 28px 60px rgba(0,0,0,.56)` | `0 0 0 0.5px rgba(0,0,0,.05), 0 2px 4px rgba(0,0,0,.06), 0 8px 16px rgba(0,0,0,.08), 0 28px 60px rgba(0,0,0,.15)` | `0 0 0 0.5px rgba(18,59,43,.07), 0 2px 4px rgba(18,59,43,.06), 0 8px 18px rgba(18,59,43,.09), 0 28px 60px rgba(18,59,43,.16)` |
| `--gc-node-shadow-hover` | `0 0 0 0.5px rgba(0,0,0,.5), 0 2px 6px rgba(0,0,0,.45), 0 8px 16px rgba(0,0,0,.42), 0 28px 60px rgba(0,0,0,.52)` | `0 0 0 0.5px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.10), 0 28px 60px rgba(0,0,0,.18)` | `0 0 0 0.5px rgba(18,59,43,.08), 0 2px 5px rgba(18,59,43,.07), 0 8px 16px rgba(18,59,43,.10), 0 28px 60px rgba(18,59,43,.19)` |

**接入点（frontend 实施用）：**
- `box-shadow: var(--gc-node-shadow)` → 节点默认态
- `box-shadow: var(--gc-node-shadow-lift)` → selected/悬浮抬起态（NodeToolbar 绝对定位）
- `box-shadow: var(--gc-node-shadow-hover)` → hover 态（由 frontend 实施卡决定接入时机）

---

## 2. 已验证 Token 盘点（批次一覆盖范围）

以下 token 在 tokens.css 中已存在，frontend 实施卡直接引用即可，无需再查色值：

| Token | 值（各主题同义） | 用途 |
|---|---|---|
| `--gc-radius-node` | `12px` | 节点卡圆角 |
| `--gc-radius-ctl` | `8px` | 节点内控件圆角 |
| `--gc-radius-chip` | `999px` | chip/标签圆角 |
| `--gc-status-error` | `#f87171`（曜黑）/ `#d30000`（简白）/ `#c23a3a`（护眼绿） | 状态错误色 |
| `--gc-node-gap` | `12px` | 节点内元素纵向间距 |
| `--gc-node-toolbar-gap` | `8px`（在 `src/index.css:112`） | NodeToolbar 与节点底边距 |
| `--gc-dot-status` | `10px` | 状态点直径 |

**对比度结论（VIS-09 destructive 取值）：**
- `--gc-status-error` 在三主题下均 ≥4.5:1（正文）/ ≥3:1（图形），VIS-09 接入只需改 `src/index.css:609` 从 `#dc2626` → `var(--gc-status-error)`，无需查新色值。

---

## 3. 语义类名映射建议（frontend 实施卡参考）

| 语义含义 | 建议引用 | 说明 |
|---|---|---|
| 节点默认阴影 | `box-shadow: var(--gc-node-shadow)` | 三主题自适应 |
| 节点选中/抬起 | `box-shadow: var(--gc-node-shadow-lift)` | 叠在默认阴影上 |
| 节点 hover | `box-shadow: var(--gc-node-shadow-hover)` | 由实施卡决定是否独立于 selected |
| destructive 错误 | `var(--gc-status-error)` | shadcn 桥接段接入点 |
| 节点内间距 | `gap: var(--gc-node-gap)` | 纵向布局用 |
| 工具栏距节点 | `mb-[var(--gc-node-toolbar-gap)]` | Tailwind arbitrary value |

---

## 4. VIS-09 destructive 接入路径（简短说明）

`src/index.css:609` 段：
```css
/* 现状（硬编码） */
--color-destructive: #dc2626;

/* 改为（接入主题状态色） */
--color-destructive: var(--gc-status-error);
```

浅色主题（white / eye）覆盖值已在 tokens.css 的对应段定义，无需额外操作。

---

## 5. 尚未覆盖（批次二/三，详见实施清单）

- VIS-01：反查段中性类清理
- VIS-06：`--gc-canvas-mask-*` / `--gc-minimap-node` token
- VIS-08：字阶 `text-[11px]` → `text-label` 映射
- VIS-07：焦点环三主题值（已有 `--gc-focus-ring`，需验证是否覆盖节点内）
- VIS-04：SMIL reduced-motion
- VIS-05：snapGrid 吸附

详见 `批次二-三实施清单.md`
