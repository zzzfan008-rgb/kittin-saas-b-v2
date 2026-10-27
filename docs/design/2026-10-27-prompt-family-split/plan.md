# 内置模板提示词族拆分 — 设计/契约记录

日期：2026-10-27
关联 PR：#130
基线：main `2ee9c540`
状态：已落地（本文档是事后同步，记录决策与契约，不含新代码）

---

## 1. 问题（实跑体检发现）

2026-10-22 对 15 个内置工作流各跑 1 次真实生成，发现 **8 个模板共用同一段冻结文本** `fashion-lookbook:edit`：

| 模板 | 实际拿到的提示词 | 后果（实跑证实） |
|---|---|---|
| builtin-pose | fashion-lookbook:edit | Pose 模板输出全身 Lookbook 摆拍，无镜头/姿态锁定 |
| builtin-background-swap | fashion-lookbook:edit | 不换背景，产出仍是原图风格 |
| builtin-digital-model | fashion-lookbook:edit | 真人模特而非数字模特 |
| builtin-fabric-swap | fashion-lookbook:edit | 面料不替换 |
| builtin-sketch-to-garment | fashion-lookbook:edit | 产出与线稿无关 |
| builtin-ai-restyle | fashion-lookbook:edit | 不执行改款 |
| builtin-person-to-mannequin | fashion-lookbook:edit | 输出真人而非人台 |
| builtin-lookbook | fashion-lookbook:edit | 唯一语义正确者（本就是 Lookbook 任务） |

8 段正文哈希完全相同。根因是早期模板只搭流程、提示词统一借用 lookbook 文本，之后未逐个补齐。

## 2. 决策（用户拍板）

为前 7 个模板**各建一个独立冻结族**（均仅 `edit` 条目），第 8 个 `builtin-lookbook` 保持绑定 `fashion-lookbook:edit` 不动。

模板 → 族映射（`server/routes/templates.ts` 实测）：

| 模板 | 族 |
|---|---|
| builtin-pose | `pose-shot` |
| builtin-background-swap | `background-swap` |
| builtin-digital-model | `digital-model` |
| builtin-fabric-swap | `fabric-swap` |
| builtin-sketch-to-garment | `sketch-to-garment` |
| builtin-ai-restyle | `ai-restyle` |
| builtin-person-to-mannequin | `person-to-mannequin` |
| builtin-lookbook | `fashion-lookbook`（不变） |

## 3. 契约变化

### 3.1 族集合 12 → 19

`server/lib/promptPresetsFrozen.ts:51` `FROZEN_PRESET_FAMILY_IDS` 追加 7 族：

```
pose-shot / background-swap / digital-model / fabric-swap
sketch-to-garment / ai-restyle / person-to-mannequin
```

历史口径：11 族（截至 2026-10-12 前）→ 12 族（+ `model-tryon`，见 `2026-10-12-model-tryon-template/plan.md:110`）→ **19 族**（本批 +7）。

### 3.2 文本归属

7 份新文本均落在两处同源位置：

- `server/lib/promptPresetsFrozen.ts` 的 `PRESET_TEMPLATE_TEXTS`（服务端，`requirePresetText` 消费）
- `src/lib/promptPresetsFrozenClient.ts`（客户端镜像，与服务端逐字一致）

`pose-shot` 文本含「构图锁定」段（平视机位/主体完整入镜/留白约束），此前一轮单独修复并同步了冻结哈希。

### 3.3 fail-closed 闸门

新增 `tests/builtin-prompt-distinct.test.ts`：

- 15 个内置模板的 text 节点正文**两两不同**；
- 任何模板回退到共用文本 / 新建模板忘配专属文本，闸门立即红。

既有 `tests/prompt-presets-frozen.test.ts` 继续以 sha256 快照逐字锁定全部冻结文本。

## 4. 变更文件清单（#130）

| 文件 | 变更 |
|---|---|
| `server/lib/promptPresetsFrozen.ts` | +7 族 ID、+7 份 edit 文本 |
| `src/lib/promptPresetsFrozenClient.ts` | 同步 7 份文本镜像 |
| `server/routes/templates.ts` | 7 个模板 `requirePresetText` 改指专属族 |
| `data/templates/builtin/*.json`（7 份） | `ensureBuiltinTemplates()` 回填磁盘 |
| `tests/builtin-prompt-distinct.test.ts` | 新增闸门 |
| `tests/prompt-presets-frozen.test.ts` | 快照哈希更新 |
| `tests/templates-v8.test.ts` | 断言同步 |

## 5. 对历史文档的关系

- 取代 `2026-10-12-model-tryon-template/plan.md:105` 中「其余换装模板本批不动、fashion-lookbook:edit 保留给它们借用」的临时性结论 —— 当时只处理 model-tryon 一族，本批完成剩余 7 族拆分；`fashion-lookbook:edit` 仍保留，但只服务 lookbook 任务。
- 本文档不涉及文本改写层（`2026-10-12-prompt-rewrite/`）——该层处理的是运行时用户输入改写，与内置模板静态提示词族是两个子系统。

## 6. 门禁证据

- `tsc --noEmit` rc 0
- 全量单测：102/102 通过（`node scripts/test-with-postgres.mjs`）
- CI 5 项（static / unit / e2e / production-smoke / code-intelligence）全绿
