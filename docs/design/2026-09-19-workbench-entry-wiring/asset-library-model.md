# 数字模特库 — 资产契约

- 日期：2026-09-20
- 状态：已定稿（用户拍板 label = 数字模特）
- 关联：`docs/design/2026-09-19-workbench-entry-wiring/plan.md`、模板 1（model-tryon）

## 1. 决策

资产库新增 category 值 `model`（数字模特），**不新增资产类型、不新增表**。

理由：
- `assets` 表已有完整的 category 枚举 + scope + owner + 回收站机制
- API 已支持 `?category=xxx` 过滤
- AssetPickerOverlay 已有分类 tab 结构
- 唯一改动：枚举扩一个值

## 2. 改动清单（4 处）

| # | 文件 | 改动 | 影响 |
|---|---|---|---|
| 1 | `server/lib/database.ts:103` | CHECK 约束扩为 `('print','fabric','reference','model')` | 需要数据库迁移 |
| 2 | `server/routes/assets.ts:13` | `CATEGORIES` 数组加 `"model"` | 无破坏性 |
| 3 | `src/types/workflow.ts:268` | `category` 联合类型加 `\| "model"` | 无破坏性 |
| 4 | `src/components/AssetPickerOverlay.tsx:9-14` | `CATEGORY_TABS` 加 `["model", "数字模特"]` | 无破坏性 |

## 3. 数据库迁移

```sql
-- 扩 category 枚举
ALTER TABLE assets DROP CONSTRAINT assets_category_check;
ALTER TABLE assets ADD CONSTRAINT assets_category_check
  CHECK (category IN ('print','fabric','reference','model'));
```

兼容性：现有数据不受影响（枚举扩容），无需回填。

## 4. 种子数据策略

**空库启动**。理由：
- 模特图是用户私域资产（每个品牌/设计师的模特不同）
- 预置公共模特库引入版权/肖像权风险
- 用户自己上传积累，或后续做「从生成结果一键存入数字模特库」

## 5. 上传时归入

`POST /api/assets` 已支持 `category` 字段。前端在上传组件加「存入数字模特库」选项（勾选后 `category: "model"`）。

## 6. 模板接入方式

模板 1（model-tryon）的 `model` 节点打开 AssetPickerOverlay 时**预选 model 分类 tab**。

前端在 `src/lib/workflowMenuMapping.ts` 加 hint：

```ts
export const WORKFLOW_MENU_MAPPING: Record<string, {
  templateId: string;
  assetPickerHints?: Record<string, "model" | "print" | "fabric" | "reference">;
}> = {
  "model-tryon": {
    templateId: "builtin-model-tryon",
    assetPickerHints: {
      "model": "model",  // nodeId "model" 的 AssetPickerOverlay 默认打开 model 分类
    },
  },
};
```

AssetPickerOverlay 接收 `initialCategory` prop，打开时跳过 "all" 直接过滤。

## 7. 验收标准

- [ ] 启动时数据库迁移自动执行，现有数据无损
- [ ] `GET /api/assets?category=model` 返回 200
- [ ] AssetPickerOverlay tab 栏出现「数字模特」
- [ ] 模板 1 的 model 节点打开选择器时默认「数字模特」分类
- [ ] 上传组件有「存入数字模特库」选项
