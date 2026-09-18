# 契约：模板格式（v7）与实例化

- 来源：plan.md §3；需求挂靠 R1/R2/R4、§3.8
- v2：无格式变化；text 节点可携带 `promptVariantId`/`modelId` 预设（Q1=B，文本功能变体如"提示词润色"），实例化语义不变。

## 1. 格式

模板即 `WorkflowTemplate`（结构沿用），约束：

- `schemaVersion: 7`（顶层与 `flow.schemaVersion` 一致）。
- `flow.nodes[].type ∈ {text, image, video}`。
- 每个 image/video 节点必须满足 INV-1（模板保存时即校验，损坏模板不得入库）。
- text 节点的 `data.text` 为**默认正文**：实例化后归用户文档所有，可自由编辑；模板侧后续修改不回溯已实例化项目。
- image/video 节点的 `promptVariantId / modelId / modelOptions / aspectRatio / batchSize` 为窗口预设（R4 三项配置的初始值）。
- 不得持久化运行状态：`status` 仅允许 `idle`（沿用 v6 现有规则：非 idle/success 强制归 idle；模板建议一律 idle）。

## 2. 内置模板重做清单（6 套）

| 旧模板 | 新形态（节点组合） |
|---|---|
| `builtin-text-to-image` | text(默认正文) → image(文生图变体) |
| `builtin-sketch-recolor` | image(草图上传位) + text(换色说明) → image(换色变体) |
| `builtin-sketch-upscale` | image(上传位) + text(可空，写"保持原构图") → image(放大变体) |
| `builtin-text-recolor` | text(款式+配色描述) → image(生成变体) → text(换色说明) → image(换色变体) |
| `builtin-pattern-style-transfer` | image(印花图) + image(服装图) + text(迁移说明) → image(迁移变体) |
| `builtin-person-scene-transfer` | image(人物) + image(场景) + text(合成说明) → image(合成变体) |

每套的"功能"全部落实为目录中**已发布或待发布**的系统提示词变体（P2-d 重写目录时一一对应登记）。

## 3. 实例化语义

- `launchTemplateInNewTab`：深拷贝 flow → 新 tab；拷贝后重新校验 INV-1（防御性）。
- `inferTemplateLaunchMode` 按新 kind 重写：含空 `outputImages` 且无图片入边的 image 节点 → `"upload"` 模式；否则含非空 text → `"text"` 模式；否则 `"default"`。
- 模板缩略图字段不变。

## 4. 用户模板

- 保存入口沿用（画布 → 存为模板），保存时走 v7 schema 校验（含 INV-1）。
- 旧用户模板目录 `data/templates/user/` 按 purge-runbook 清空，不做迁移。
