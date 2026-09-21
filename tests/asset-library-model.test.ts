import assert from "node:assert/strict";
import fs from "node:fs";
import {
  WORKFLOW_MENU_MAPPING,
  assetPickerCategoryForNode,
  workflowTemplateIdForMenuItem,
} from "../src/lib/workflowMenuMapping";
import { assetSavePayload } from "../src/lib/assetSave";
import { RAIL_ENTRIES, RAIL_SEPARATOR_BEFORE } from "../src/components/workbench/railConfig";

/**
 * R-88：数字模特库前端接线 + 色彩工具入口移除。
 * 契约：docs/design/2026-09-19-workbench-entry-wiring/asset-library-model.md §5/§6、
 *       docs/design/2026-09-21-five-node-model/contracts/template-format.md §2/§3/§4。
 */

const read = (path: string) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const assetPickerSource = read("src/components/AssetPickerOverlay.tsx");
const imageViewerSource = read("src/components/ImageViewer.tsx");
const railConfigSource = read("src/components/workbench/railConfig.tsx");
const workflowTypesSource = read("src/types/workflow.ts");
const appSource = read("src/App.tsx");

// ---------- 1. 素材分类联合扩 model（单一事实源在 src/types/workflow.ts） ----------
assert.match(
  workflowTypesSource,
  /category: "print" \| "fabric" \| "reference" \| "model"/,
  "Asset.category 必须扩到四个值（model = 数字模特）",
);

// ---------- 2. 选择器：tab、预选分类、v8 写回路径 ----------
assert.match(assetPickerSource, /\["model", "数字模特"\]/, "分类 tab 必须出现「数字模特」");
assert.match(
  assetPickerSource,
  /initialCategory\?: AssetPickerCategory/,
  "AssetPickerOverlay 必须接收 initialCategory prop",
);
assert.match(
  assetPickerSource,
  /request\.initialCategory \?\? initialCategory \?\? "all"/,
  "打开时必须按初始分类过滤，而不是固定「全部」",
);
assert.match(
  assetPickerSource,
  /outputImages: \[asset\.image\]/,
  "v8 图片输入节点以 outputImages 承载选中素材",
);
assert.doesNotMatch(
  assetPickerSource,
  /imageUrl: asset\.image/,
  "不得再写 v7 已退役的 imageUrl 字段",
);
assert.doesNotMatch(
  assetPickerSource,
  /addEventListener\(OPEN_ASSET_PICKER_EVENT/,
  "浮层不得自行监听打开事件（沿用 App 的单点分发）",
);

// ---------- 3. 打开路径：App 把节点 id 的映射提示传给浮层 ----------
assert.match(
  appSource,
  /assetPickerCategoryForNode\(assetPickerRequest\.nodeId\)/,
  "App 必须按节点 id 解析资产选择器预选分类",
);

// ---------- 4. 映射表：17 个菜单项 ↔ 模板 / 延后项 fail-closed ----------
const menuItemIds = RAIL_ENTRIES
  .flatMap((entry) => entry.items ?? [])
  .filter((item) => !item.nodeKind && !item.needsNodeContext)
  .map((item) => item.id);

assert.equal(menuItemIds.length, 17, "rail 的工作流菜单项必须是 17 个");
assert.deepEqual(
  [...menuItemIds].sort(),
  Object.keys(WORKFLOW_MENU_MAPPING).sort(),
  "菜单项与映射表必须一一对应（新增菜单项必须同时登记映射）",
);

const deferred = Object.entries(WORKFLOW_MENU_MAPPING)
  .filter(([, binding]) => binding.templateId === null)
  .map(([menuItemId]) => menuItemId);
assert.deepEqual(deferred.sort(), ["keyframes", "video-clone"], "只有首尾帧与视频复刻是延后项");
for (const menuItemId of deferred) {
  assert.ok(
    WORKFLOW_MENU_MAPPING[menuItemId]?.pendingReason,
    `${menuItemId} 没有模板时必须给出「开发中」提示文案（不得静默失败）`,
  );
  assert.equal(workflowTemplateIdForMenuItem(menuItemId), null);
}
assert.equal(workflowTemplateIdForMenuItem("model-tryon"), "builtin-model-tryon");
assert.equal(workflowTemplateIdForMenuItem("not-a-menu-item"), null);

// ---------- 5. 数字模特提示：模板 1 的 model 节点默认开 model 分类 ----------
assert.deepEqual(
  Object.entries(WORKFLOW_MENU_MAPPING)
    .filter(([, binding]) => binding.assetPickerHints)
    .map(([menuItemId]) => menuItemId),
  ["model-tryon"],
  "只有模板 1（model-tryon）带资产选择器提示",
);
assert.equal(assetPickerCategoryForNode("model"), "model");
assert.equal(assetPickerCategoryForNode("model-2"), undefined, "未命中节点 id 不得猜测分类");
assert.equal(assetPickerCategoryForNode(""), undefined);

// ---------- 6. 存入数字模特库：勾选后 category=model ----------
assert.match(imageViewerSource, /存入数字模特库/, "保存区必须有「存入数字模特库」选项");
assert.match(
  imageViewerSource,
  /category: saveToModelLibrary \? "model" : "reference"/,
  "勾选后必须写入 category: model，未勾选仍为参考素材",
);
assert.match(imageViewerSource, /from "@\/components\/ui\/checkbox"/, "勾选控件必须复用本地 shadcn Checkbox");
assert.deepEqual(
  assetSavePayload({ name: "模特-1", category: "model", image: "/api/files/a.png" }),
  { name: "模特-1", category: "model", image: "/api/files/a.png" },
);
assert.equal(
  assetSavePayload({ name: "模特-1", category: "model", image: "/api/files/a.png", sourceNote: "  " })
    .sourceNote,
  undefined,
  "空白来源说明不得进入请求体",
);

// ---------- 7. 色彩工具入口已从 Rail 移除（只保留文本节点内） ----------
assert.equal(
  RAIL_ENTRIES.some((entry) => entry.id === "color-tools"),
  false,
  "Rail 不得再保留色彩工具入口",
);
assert.doesNotMatch(railConfigSource, /DropletIcon/, "色彩工具图标不得残留在 rail 配置里");
assert.deepEqual(
  RAIL_ENTRIES.map((entry) => entry.id),
  ["add", "ai-tryon", "ai-design", "ai-video", "canvas", "inspector"],
);
assert.deepEqual(
  [...RAIL_SEPARATOR_BEFORE],
  [1, 4, 5],
  "移除色彩工具后分隔线索引必须同步（添加 / 视频生成 / 工具组之前）",
);
assert.ok(
  RAIL_SEPARATOR_BEFORE.every((index) => index < RAIL_ENTRIES.length),
  "分隔线索引不得越界",
);

console.log("数字模特库前端接线 + 色彩工具入口移除 契约测试通过");
