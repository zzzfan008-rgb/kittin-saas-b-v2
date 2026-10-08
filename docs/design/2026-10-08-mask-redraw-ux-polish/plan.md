# R-86 蒙版重绘页四项 UI 改造 — 视觉规格（送审）

- 日期：2026-10-08 · owner：designer
- 关联：R-86 蒙版重绘改造 · 上一轮设计稿 `docs/design/2026-10-06-image-edit-panels-v2/design-v2.html`
- 本次不碰 `src/**`、`e2e/**`；只写规格，落地归 frontend

---

## 信号色使用原则（全局约束）

> **每屏绿色实底仅出现 0–1 次**，且仅用于：①当前选中态；②每屏唯一主行动按钮；③成功/确认反馈。
> 章节编号徽标、装饰性标签、内联小注、说明文字一律使用中性色（`--gc-text-muted`），禁止用信号色装饰。

- **章节徽标**（A/B/C/D）：`background: var(--gc-panel)` + `border: 1px solid var(--gc-border)` + `color: var(--gc-text-muted)`，不用信号色
- **状态小标签**（"自适应""适合画布"等）：`color: var(--gc-text-muted)`，不用信号色
- **成功勾选**：仅用于确认类反馈

---

## §A 模式按鈕（涂抹修改区 / 恢复保留区）选中态强化

### 背景问题
当前用 shadcn `Button variant="secondary"`，在曜黑·萤光绿主题下与未选中态对比不足。

### 四态完整规格

| 状态 | 背景 | 文字色 | 字重 | 边框 | 圆角 | 备注 |
|------|------|--------|------|------|------|------|
| 未选中 | `transparent` | `--gc-text-muted` | 400 | `1px solid --gc-border` | `5px`（内圆角） | `border-radius:5px` |
| 悬停 | `rgba(183,243,90,0.08)` | `--gc-text` | 400 | `1px solid --gc-border` | `5px` | 微亮，不抢选中态 |
| 选中 | `--gc-accent`（#B7F35A） | `--gc-accent-cta-ink`（#131313） | **600** | **none** | `5px` | 纯底色，色盲/低对比场景需冗余 |
| 禁用 | `transparent` | `--gc-text-muted` opacity 40% | 400 | `1px solid --gc-border` opacity 40% | `5px` | cursor: not-allowed |

### 为什么用 --gc-accent + --gc-accent-cta-ink（理由）
- 两者在曜黑·萤光绿主题下对比度 = 15.3:1，远超 WCAG AAA（7:1）；在简白·蓝主题下对比度 = 10.2:1，同样超 AAA。
- 不用额外边框或圆点标记：加 border 会破坏 pill 内壁紧凑感；加小圆点会在 `gap:2px` 的 pill 容器里挤占文字空间。
- **色盲冗余方案**（§A 额外要求）：字重 600 + 底色填充已构成"亮+实心"双通道；如日后需更强保障，可额外加底部 2px `border-bottom: 2px solid var(--gc-accent-deep)`（落在未选中态上不占额外宽度），但当前不预设。

### shadcn variant 可用性判断
shadcn `Button variant="secondary"` **不能**覆盖以上规格：
- `secondary` 在曜黑·萤光绿主题下用 `bg: --gc-accent` + `text: --gc-accent-cta-ink`，恰好是选中态颜色——这意味着 secondary 在此主题下等于"选中态"，与设计语义冲突。
- **结论**：需要自定义 `Button variant="segment"`（或 `className="seg-btn"`），专门实现上表四态；不可复用 `secondary`。
- 推荐 className：`"seg-item"`（未选中/悬停/禁用三态）+ `"seg-item seg-item--on"`（选中态）。

### 精确 CSS 变量值（可直接翻进 Tailwind config）

```css
/* 未选中 */
.seg-item {
  flex: 1; text-align: center;
  font-size: 11.5px; line-height: 1;
  padding: 5px 0;
  border-radius: 5px;
  color: var(--gc-text-muted);
  background: transparent;
  border: 1px solid var(--gc-border);
  font-weight: 400;
  cursor: pointer;
  transition: background .15s, color .15s, border-color .15s;
}
/* 悬停（修订：增加 border-color 变化，与未选中形成"面+线"双通道） */
.seg-item:hover:not(.seg-item--on):not(:disabled) {
  background: rgba(183, 243, 90, 0.10);
  color: var(--gc-text);
  border-color: rgba(183, 243, 90, 0.35);
}
/* 选中 */
.seg-item--on {
  background: var(--gc-accent);          /* #B7F35A */
  color: var(--gc-accent-cta-ink);      /* #131313 */
  font-weight: 600;
  border: none;
}
/* 禁用（修订：显式降色，保留边框可见性，触屏可辨） */
.seg-item:disabled {
  color: color-mix(in srgb, var(--gc-text-muted) 40%, transparent);
  border-style: dashed;
  border-color: color-mix(in srgb, var(--gc-border) 45%, transparent);
  cursor: not-allowed;
  /* 不使用 opacity 整体压暗——那样会让边框也消失 */
}
.seg-item--on:disabled {
  background: color-mix(in srgb, var(--gc-accent) 40%, transparent);
  color: color-mix(in srgb, var(--gc-accent-cta-ink) 40%, transparent);
  border: none;
}
```

**vision 复审修订点：**
- 悬停底色 8%→10% + 增加 `border-color` 变化（rgba 35%），形成"面+线"双通道，防止低亮度屏上悬停与未选中混淆。
- 禁用态：去掉 `opacity` 整体压暗，改为 `color-mix()` 显式降色 + `border-style: dashed`，边框始终可见，触屏也能区分。

---

## §B 笔刷 / 羽化 说明文案方案

### 推荐方案：标签右同行 + tooltip 展开（理由）
- 羽化行内空间有限（rail 宽 ~256–360px），同排标签最节省垂直空间。
- tooltip 覆盖全行，一眼可读，无需悬停等待。
- 放在标签右侧而非标题正下方或 tooltip only：直觉上"笔刷"是控件，"笔刷说明"是注解，同行排列最自然。

### 笔刷说明文案（中，可直接进代码）

> 笔刷：在图片上按住拖动画出涂抹区域

- 字体：`11px --gc-text-muted` / `letter-spacing: .04em`
- 位置：笔刷段（`seg` 行）右侧，与 `seg` 同一行底部，或单独一行放 `笔刷说明` 小标签
- 推荐实现：在 `笔刷` 标题旁加 `<span class="info-btn" title="在图片上按住拖动画出涂抹区域">ⓘ</span>`（11px，muted 色，悬停变色），不占额外行高

### 羽化说明文案（中，可直接进代码）

> 羽化：控制蒙版边缘柔和程度；勾选「自适应」由系统自动计算

- 「自适应」勾选=含义：`featherRadius=undefined`，系统按蒙版形状自动算半径
- 拖动滑杆 = 自动取消勾选，改为手动 0–64px
- 再次勾选 = 回到自适应

### 羽化行内布局（精确）

```
羽化 [☑自适应]  [——track——●——] [42%]
         ← tooltip on ⓘ
```

- `lab`（羽化）: `11px --gc-text-muted letter-spacing:.04em`
- checkbox + 文字同现有 `.cbox` 样式
- track 同现有 `.slide` / `.track` 布局
- 数值显示：`42%` 或 `自适应`，11px，muted，右对齐 34px 宽

---

## §C 四个工具按鈕（撤销 / 重做 / 清空 / 反选）文字化

### 形态决策：图标 + 文字并排（推荐）

理由：
1. 工具条 rail 宽 ~256–360px，四个字并排 + 图标每字约 48–56px，总宽 ~192–224px，加上 gap 在 2×2 网格时需换行。
2. 纯文字 chip（当前 `.tb`）虽然紧凑，但"清空""反选"图标歧义大（清空=🗑? ✕?  Eraser?），图标消除歧义。
3. 推荐 **图标 + 文字** 并排（`Undo 撤销`、`Redo 重做`、`Clear 清空`、`Invert 反选`），2×2 网格排列。

### 精确组合

| 按钮 | 图标 | 中文 | 英文标识（辅助） |
|------|------|------|------|
| 撤销 | `↩` 或 `undo` SVG | 撤销 | Undo |
| 重做 | `↪` 或 `redo` SVG | 重做 | Redo |
| 清空 | `🗑` 或 `trash` SVG | 清空 | Clear |
| 反选 | `⇄` 或 `flip` SVG | 反选 | Invert |

图标建议：Lucide `Undo2` / `Redo2` / `Trash2` / `FlipHorizontal2`（均 14px，stroke-width 2）。

### 2×2 网格排列

```css
.tool-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.tool-btn {
  display: flex; align-items: center; justify-content: center; gap: 5px;
  font-size: 11.5px; color: var(--gc-text-muted);
  border: 1px solid var(--gc-border); border-radius: 6px;
  padding: 5px 8px;
  background: transparent;
  height: 30px;          /* 统一高度，与滑杆行视觉平衡 */
  cursor: pointer;
  transition: background .15s, color .15s;
}
.tool-btn:hover:not(:disabled) {
  background: rgba(183,243,90,0.06);
  color: var(--gc-text);
}
/* 可选：清空警告色悬停 */
.tool-btn.tool-btn--warn:hover:not(:disabled) {
  background: rgba(239,68,68,0.08);
  color: #ef4444;
}
.tool-btn:disabled {
  color: color-mix(in srgb, var(--gc-text-muted) 40%, transparent);
  border-style: dashed;
  border-color: color-mix(in srgb, var(--gc-border) 45%, transparent);
  cursor: not-allowed;
}
```

**图标规范（16px SVG，stroke-width 1.5，统一线性图标，禁止 emoji）：**

| 按钮 | SVG path d |
|------|-------------|
| 撤销 | `<path d="M9 14 4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>` |
| 重做 | `<path d="M15 14l5-5-5-5"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>` |
| 清空 | `<polyline points="3 6 5 6 6 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>` |
| 反选 | `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9l6 6M15 9l-6 6"/>` |

> vision 复审指出 emoji（🗑 ⧉）视觉重量不一致，替换为统一 SVG 线性图标；禁用态加 `border-style: dashed` 触屏可辨。

### 清空 / 反选是否破坏性操作的判断

**结论：不算破坏性操作，不需要二次确认或警告色。**

理由：
- 撤销/重做的历史栈在前端内存，清空只是清栈，用户还有底图兜底。
- 反选是蒙版区域的数学反转（涂白→涂黑，涂黑→涂白），可撤销，且是蒙版编辑器标准操作。
- 两者均不可逆但可撤销，且无数据落盘风险（蒙版草稿未执行前不影响节点数据）。
- **唯一边界**：若当前无历史（撤销栈空），撤销/重做按钮 `disabled`，颜色变淡（opacity 0.38）；清空在无蒙版时也 `disabled`。

---

## §D 原图缩放交互（仅图片放大，非整页）

### 交互形式推荐组合（理由）

**推荐：滚轮缩放（以指针为中心）+ 双击切换适合画布↔100%**

| 交互 | 行为 |
|------|------|
| 滚轮 | 以鼠标/触控指针为中心缩放，步进 10%（或 25%） |
| 双击 | 在适合画布 ↔ 100% 两个锚点之间切换 |
| +/– 按钮 | 固定步进 ±10%，边界各停 |
| 拖拽平移 | 按住鼠标拖动画布（滚轮缩放时禁平移） |

不适合：捏合（touch pad）因产品面向桌面鼠标用户省略。

### 缩放范围与锚点

| 锚点 | 含义 |
|------|------|
| 适合画布（Fit） | 图片完全放入 rail 内（等比缩放至不超过 rail 可视区） |
| 100% | 原图 1:1 显示 |

- 范围：`25%–400%`
- 步进：滚轮 ±10%，按钮 ±10%
- 适合画布为**默认**，页面打开时即自动 Fit

### 硬性要求：坐标映射契约（§D 核心）

> **屏幕坐标 ↔ 原图像素坐标的映射必须完整记录，违反则画布错位。**

变换链（三层）：

```
屏幕坐标（screenX, screenY）
  ↓ canvas元素.getBoundingClientRect() — viewport偏移
画布坐标（canvasX, canvasY）= (screenX - rect.left, screenY - rect.top)
  ↓ zoomScale（当前缩放比，如 1.5）
  ↓ panOffset（当前平移偏移，{x, y}）
原图像素坐标（imageX, imageY）
```

**具体实现约束**：

```js
// 屏幕 → 原图（缩放/平移后）
function screenToImage(sx, sy, canvas, zoomScale, panOffset) {
  const rect = canvas.getBoundingClientRect();
  const cx = sx - rect.left;       // 画布内坐标
  const cy = sy - rect.top;
  const ix = (cx - panOffset.x) / zoomScale;
  const iy = (cy - panOffset.y) / zoomScale;
  return { x: ix, y: iy };
}

// 原图 → 屏幕（用于将蒙版重绘的笔触渲染到正确位置）
function imageToScreen(ix, iy, canvas, zoomScale, panOffset) {
  const cx = ix * zoomScale + panOffset.x;
  const cy = iy * zoomScale + panOffset.y;
  const rect = canvas.getBoundingClientRect();
  return {
    sx: cx + rect.left,
    sy: cy + rect.top
  };
}
```

**蒙版笔触写入时必须用 `screenToImage`（当前缩放+平移后）**，否则缩放/平移后笔触位置与图片不对齐。

**蒙版绘制 canvas 本身必须以原图自然尺寸存储**，在显示时整体应用 `transform: scale(zoomScale) translate(panOffset.x, panOffset.y)`。不能重新采样（rasterize）蒙版。

### 缩放状态指示器

- 位置：rail 右下角（固定，不随 rail-body 滚动）
- 格式：`78%` 或 `适合画布`
- 样式：11px `--gc-text-muted`，背景 `rgba(0,0,0,0.4)` pill，右下角 `6px 10px`
- 点击状态指示器：直接重置为适合画布

### 与蒙版涂层的层级关系

| 层（从底到顶） | 内容 | 随缩放同步变换 |
|---------------|------|---------------|
| Layer 0 | 底图（原图） | scale + translate |
| Layer 1 | 蒙版重绘层（红色修改区 / 透明保留区） | 同底图（必须同步） |
| Layer 2 | 绘制中笔触预览 | 同底图 |
| Layer 3 | UI 控件（rail，右上角关闭等） | 不变（固定 viewport） |

**必须保证**：蒙版重绘层的 canvas 变换矩阵与底图完全一致，否则用户画的位置与底图对不上。

---

## §D 补充：历史记录结果图的缩放功能

### 背景

用户追加：历史创作记录里生成结果图的查看也要有同样的缩放功能。这意味着 **§D 的缩放规格需覆盖两个场景**：

| 场景 | 组件 | 路径 |
|------|------|------|
| A：蒙版重绘页原图 | rail 内画布 | `src/components/panels/MaskRedrawPanel.*`（前端自行 grep） |
| B：历史记录结果图查看 | `ResultDetailDialog` 左列大图 → `ImageViewer` | `src/components/panels/ResultDetailDialog.tsx:78-95` + `src/components/ImageViewer.tsx:58` |

### 场景 B 的当前状态

**入口**：`src/components/panels/ResultDetailDialog.tsx:78-95`
- 点大图 → 调用 `openResultViewer(record)` 打开全局 `ImageViewer`（z-80）
- ImageViewer 内已有滚轮缩放（MIN=1，MAX=2），双击复位，Esc 关闭

**与场景 A 的差异**：

| 维度 | 场景 A（蒙版重绘页） | 场景 B（ImageViewer） |
|------|---------------------|---------------------|
| 缩放范围 | 25%–400% | 100%–200%（当前值） |
| 锚点 | 适合画布 / 100% | 100%（当前值） |
| 平移 | 拖拽平移 | 无平移（仅缩放） |
| 指示器 | 右下角 pill + 底部 ± 按钮 | 左上角文字提示 |

### 合并后规格（两场景共用同一可复用组件）

**建议**：两场景共用一个 `ImageCanvas` 可复用组件，内部统一实现：
- 缩放范围：统一改为 **25%–400%**（以场景 A 的范围为准；ImageViewer MAX 2x → 4x）
- 锚点：`适合画布` ↔ `100%`
- 双击切换锚点
- 滚轮缩放（以指针为中心）
- 拖拽平移（在 >100% 时激活）
- 缩放指示器：右下角 pill

**ImageViewer 当前元数据比 ResultDetailDialog 少**，合并后需补充以下字段（从 `ResultRecordDetail.tsx` 迁移）：
- 节点类型（`nodeTitleForKind(record.kind)`）
- 上游实际尺寸（`record.providerOutputSize`）

若 ImageViewer 中无法平移显示这些字段，替代方案：ImageViewer 侧边栏底部加「查看详情」链接，点击跳回 ResultDetailDialog（保留两页，但 ImageViewer 侧边栏已包含大图查看的全部核心信息）。

### 两场景共用 token

```css
/* 缩放指示器（两场景共用） */
.zoom-hud {
  position: absolute; bottom: 10px; right: 10px;
  font-size: 11px; color: var(--gc-text-muted);
  background: rgba(0,0,0,.48); border: 1px solid var(--gc-border);
  border-radius: 999px; padding: 3px 10px;
  cursor: pointer; transition: all .15s;
  backdrop-filter: blur(4px);
}
.zoom-hud:hover { color: var(--gc-text); border-color: var(--gc-border-str); }
```

---

## §E 两页合并：结果详情弹窗 + 图片查看器 → 单一图片查看器

### 当前两页的路由/组件/入口

**来源文件（实际路径，行号）：**
- `src/components/panels/ResultDetailDialog.tsx:38` — `ResultDetailDialog` 组件，从 `ResultsFab.tsx:100` 渲染；由 `ResultsPanel.tsx:43` 触发（点单条历史结果）
- `src/components/ImageViewer.tsx:58` — `ImageViewer` 组件，从 `App.tsx:49` 懒加载；从 `ResultDetailDialog.tsx:80` 大图按钮触发，或从 `ImageGrid.tsx:12` 直接触发

**ResultDetailDialog 当前功能清单**（`ResultDetailDialog.tsx` 全量）：

| 功能 | 所在行 | 状态 |
|------|--------|------|
| 大图预览（点击进入 ImageViewer） | :78-95 | 保留 → 合并到 ImageViewer 左侧 |
| 完整运行记录（节点类型/模型/尺寸/时间/提示词） | `ResultRecordDetail.tsx` 全量 | 迁移到 ImageViewer 侧边栏 |
| 查看大图（footer 按钮） | :102-104 | 合并（ImageViewer 已是查看器） |
| 加入对比 / 取消对比 | :105-112 | 迁移 |
| 下载 | :113-119 | 迁移 |
| 设为输入 | :120-128 | 迁移 |
| 空态（结果已不在会话） | :132-136 | 迁移 |

**ImageViewer 当前功能清单**（`ImageViewer.tsx` 全量）：

| 功能 | 所在行 | 状态 |
|------|--------|------|
| 全屏大图（滚轮缩放 1x–2x / 双击复位 / Esc 关闭） | :58-160 | 保留（合并后功能扩展） |
| 侧边栏：标题/项目/状态/模型/数量/时间/耗时 | :165-181 | 保留（已有） |
| 提示词 + 复制 | :183 | 保留 |
| Provider 原图 | :184-194 | 保留 |
| 参考图（ReferenceEvidenceList） | :196-198 | 保留 |
| 生成参数（JSON 折叠） | :199 | **缺失 → 需新增** |
| 错误信息 | :200 | 保留 |
| 存入数字模特库（checkbox） | :202-213 | 保留 |
| 下载图片 | :215 | 保留 |
| 收藏为资产 | :216 | 保留 |
| 重新生成 | :217-227 | 保留 |
| 节点类型 | — | **缺失 → 需新增**（`ResultRecordDetail.tsx:62`） |
| 上游实际尺寸 | — | **缺失 → 需新增**（`ResultRecordDetail.tsx:81`） |

### 合并方案

**以 ImageViewer 为唯一样式**，把 ResultDetailDialog 的全部内容迁移进去：

1. **合并后单页名称**：`ImageViewer`（全屏图片查看器），标题继承 `record.nodeLabel`
2. **布局**：左侧图片区（合并后的 ResultDetailDialog 大图），右侧可滚动信息栏（`ResultRecordDetail.tsx` 全量 + 缺失字段补齐）
3. **关闭语义**：`Esc` / 点击背景 / 右上角 ✕；关闭后焦点归还触发元素（`ResultDetailDialog.tsx:66` 原有逻辑保留）
4. **删掉的页面**：`ResultDetailDialog` 组件删除（或保留空壳重定向到 ImageViewer），`ResultsPanel.tsx:43` 改为直接打开 ImageViewer（不再打开中间弹窗）

### 信息迁移边界

| 字段 | 当前所在 | 能否迁移 | 备注 |
|------|----------|----------|------|
| 大图 | ResultDetailDialog.tsx:78 | ✅ 直接合并 | ImageViewer 左侧 |
| 节点类型 | ResultRecordDetail.tsx:62 | ✅ 迁移 | ImageViewer 侧边栏新增 |
| 模型 | ImageViewer.tsx:176 已有 | ✅ 已有 | 无需迁移 |
| 上游实际尺寸 | ResultRecordDetail.tsx:81 | ✅ 迁移 | ImageViewer 侧边栏新增 |
| 时间/耗时 | ImageViewer.tsx:179-180 已有 | ✅ 已有 | 无需迁移 |
| 提示词 | ImageViewer.tsx:183 已有 | ✅ 已有 | 无需迁移 |
| 生成参数 | ResultRecordDetail 无，但 ImageViewer.tsx:199 有 | ✅ 已有 | 无需迁移 |
| 加入对比 | ResultDetailDialog.tsx:109 | ✅ 迁移 | ImageViewer 侧边栏底部操作区 |
| 下载 | ImageViewer.tsx:215 已有 | ✅ 已有 | 无需迁移 |
| 设为输入 | ResultDetailDialog.tsx:125 | ✅ 迁移 | ImageViewer 侧边栏底部操作区 |
| 空态（结果不在会话） | ResultDetailDialog.tsx:132 | ⚠️ 特殊处理 | ImageViewer 打开时若 `record == null` 显示空态提示 |

### 合并后单页信息架构（Visual Spec）

```
┌─────────────────────────────────────────────────────────────┐
│  [ImageViewer — 全屏���z-80]                                   │
│                                                              │
│  ┌───────────────────────────┐  ┌──────────────────────────┐│
│  │                           │  │ 结果标题（nodeLabel）      ││
│  │   全屏大图                 │  │ 项目名 / 状态 badge       ││
│  │   （滚轮缩放 25%-400%）   │  ├──────────────────────────┤│
│  │   适合画布 ↔ 100% 双击切换 │  │ 节点类型 / 模型           ││
│  │   拖拽平移（>100%时激活）  │  │ 上游尺寸 / 时间 / 耗时    ││
│  │                           │  ├──────────────────────────┤│
│  │  [缩放指示器 pill]        │  │ 提示词 + 复制            ││
│  │                           │  │ Provider 原图网格          ││
│  └───────────────────────────┘  │ 参考图（ReferenceEvidence）││
│                                  │ 生成参数（折叠）           ││
│                                  │ 错误信息                   ││
│                                  ├──────────────────────────┤│
│                                  │ [加入对比] [下载]         ││
│                                  │ [设为输入] [重新生成]      ││
│                                  └──────────────────────────┘│
│                                                              │
│  ← 左上角：滚轮缩放说明文字（双击重置 · Esc关闭）              │
└─────────────────────────────────────────────────────────────┘
```

### 迁移不了的字段及替代方案

| 缺失字段 | 原因 | 替代方案 |
|----------|------|----------|
| ResultDetailDialog 原来的「中等尺寸卡片布局」 | ImageViewer 全屏无此布局 | 不需要（大图已在全屏） |
| ResultRecordDetail 里的 `UnsupportedNodeKindNotice` | ImageViewer 侧边栏已有 `unsupportedKind` 判断（`ImageViewer.tsx:84`） | 已有等效实现，无需迁移 |

### §E 合并结论

**合并后单页 = ImageViewer**，大图从左侧放大展示（替换原 ResultDetailDialog 左列），完整运行记录从 `ResultRecordDetail.tsx` 迁移到 ImageViewer 侧边栏，`ResultDetailDialog` 组件删除。ImageViewer 当前缺少「节点类型」和「上游实际尺寸」两字段需新增；ImageViewer 已有「生成参数折叠」和「模型/时间」等字段，无需迁移。无迁移不了的字段（空态由 `record == null` 判断兜底）。

---

## § 按鈕區設計：用戶反饋第 2 條「不需要先點保存蒙版」

### 方案：单一主行动，删除「保存蒙版」次按钮

**结论**：删除「保存蒙版」次按钮，按钮区改为单一主行动。

**按钮区视觉层级**（只剩一个主行动时）：

| 情况 | 视觉层级建议 |
|------|-------------|
| 有「每次提交自动保存蒙版」副标题 | 副标题保留（11px muted），消除用户对蒙版去向的焦虑 |
| 无副标题（无上下级说明） | 主按钮本身视觉完整，无需额外说明 |

建议保留一行 11px muted 文字副标题「每次提交自动保存蒙版」；若产品确认用户已完全理解流程，可移除此行。

**理由**：
1. 用户明确说"不需要先点保存蒙版"——行为契约已变更，不需要先存草稿再执行。
2. 草稿自动保存机制（涂抹过程中自动 saveMaskDraft）已在 backend 实现（plan.md §2.2），无需用户手动触发。
3. 单一主行动 `蒙版重绘` 即可执行：点击 → 自动保存当前涂抹 → 发起修改（plan.md §2.2 执行语义）。
4. 简化为单一按钮后，按钮区视觉更干净。

**视觉规格**：

```css
/* 主按钮 — 全宽 */
.btn-primary {
  width: 100%;
  background: var(--gc-accent);     /* #B7F35A */
  color: var(--gc-accent-cta-ink);   /* #131313 */
  font-size: 12px; font-weight: 600;
  text-align: center;
  border-radius: 7px; padding: 8px 0;
  border: none; cursor: pointer;
  transition: filter .15s;
}
.btn-primary:hover { filter: brightness(0.94); }
.btn-primary:active { filter: brightness(0.88); }
.btn-primary:disabled {
  opacity: 0.38; cursor: not-allowed; filter: none;
}
```

**「蒙版重绘」按钮何时 disabled**：
- 无蒙版时（`mask === null` 且 `maskSourceRef === null`）：显示为"请先涂抹蒙版"，disabled。
- 执行中（running）：disabled + 变淡。
- 有蒙版时：正常可点击。

**修改描述行**（保留在主按钮上方）：
- 单行/多行 textarea（≤500，maxLength + 计数）
- 无描述时点击主按钮：按现有服务端门处理（描述必填校验）。

---

## 关键决策汇总

| 决策点 | 结论 |
|--------|------|
| §A 选中态 token | `--gc-accent` 底 + `--gc-accent-cta-ink` 字；字重 600；shadcn secondary 不可复用，需自定义 `seg-item` class |
| §B 文案放置 | 标签右同行 + ⓘ tooltip；11px muted；笔刷/羽化各一句功能说明 |
| §C 四按钮最终形态 | 图标+文字并排，2×2 网格；清空/反选**不算**破坏性操作，无需二次确认 |
| §D 缩放推荐组合 | 滚轮+双击切换锚点+±按钮；范围 25–400%；默认适合画布 |
| §D 坐标映射 | 必须三链完整记录；蒙版 canvas 以原图自然尺寸存储，显示时整体应用 transform |
| §D 覆盖场景 | 蒙版重绘页原图 + 历史记录结果图（ImageViewer）共用 ImageCanvas 组件；范围 25–400% |
| 按鈕區 | 删除「保存蒙版」次按钮；建议保留 11px muted 副标题「每次提交自动保存蒙版」 |
| §E 合并结论 | 合并后单页 = ImageViewer；ResultDetailDialog 删除；侧边栏新增「节点类型」和「上游实际尺寸」两字段 |
