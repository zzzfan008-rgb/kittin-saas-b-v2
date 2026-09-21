import assert from "node:assert/strict";
import fs from "node:fs";
import {
  WORKFLOW_MENU_MAPPING,
  assetPickerCategoryForNode,
  workflowTemplateIdForMenuItem,
} from "../src/lib/workflowMenuMapping";
import { assetNameFromUpload, assetSavePayload, saveImageToModelLibrary } from "../src/lib/assetSave";
import { RAIL_ENTRIES, RAIL_SEPARATOR_BEFORE } from "../src/components/workbench/railConfig";

/**
 * R-88：数字模特库前端接线 + 色彩工具入口移除。
 * R-90：上传入口「存入数字模特库」勾选（ImageNode）。
 * 契约：docs/design/2026-09-19-workbench-entry-wiring/asset-library-model.md §5/§7、
 *       docs/design/2026-09-21-five-node-model/contracts/template-format.md §2/§3/§4。
 */

const read = (path: string) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const assetPickerSource = read("src/components/AssetPickerOverlay.tsx");
const imageViewerSource = read("src/components/ImageViewer.tsx");
const imageNodeSource = read("src/components/nodes/ImageNode.tsx");
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

// ---------- 6b. 上传入口（ImageNode）：勾选后上传图同时进数字模特库 ----------
assert.match(imageNodeSource, /存入数字模特库/, "图片节点的上传入口必须有「存入数字模特库」选项");
assert.match(
  imageNodeSource,
  /aria-label="存入数字模特库"/,
  "勾选控件必须有可访问名称",
);
assert.match(
  imageNodeSource,
  /from "@\/components\/ui\/checkbox"/,
  "勾选控件必须复用本地 shadcn Checkbox",
);
assert.match(
  imageNodeSource,
  /if \(saveToModelLibrary\) void storeToModelLibrary\(upload\.url, file\.name, requestId\)/,
  "入库必须在本张图上传成功之后触发，并带上文件名与请求号",
);
assert.match(imageNodeSource, /saveImageToModelLibrary\(/, "入库必须走分类单一事实源 saveImageToModelLibrary");
assert.deepEqual(
  (imageNodeSource.match(/renderFileInput\("/g) ?? []).length,
  2,
  "文件选择器必须在「空槽位」与「已有图片」两种形态下都存在（否则工具条「替换」是死按钮）",
);
assert.match(
  imageNodeSource,
  /tabIndex=\{variant === "replace" \? -1 : undefined\}/,
  "已有图片时隐藏选择器不得新增不可见的 Tab 停靠点",
);

// 入库三态必须可见，且入库失败不得污染已成功的上传结果。
const librarySaveSource = imageNodeSource.slice(
  imageNodeSource.indexOf("const storeToModelLibrary = useCallback("),
  imageNodeSource.indexOf("const handleFile = useCallback("),
);
assert.ok(librarySaveSource.length > 0, "必须存在独立的入库函数");
assert.match(librarySaveSource, /setLibraryState\("saving"\)/, "入库中必须可见");
assert.match(librarySaveSource, /setLibraryState\("saved"\)/, "入库成功必须可见");
assert.match(librarySaveSource, /setLibraryState\("error"\)/, "入库失败必须落到失败态");
assert.doesNotMatch(
  librarySaveSource,
  /updateNodeDataInTab/,
  "入库失败不得把已经成功的上传改写成节点失败态",
);
assert.match(imageNodeSource, /role="status"/, "入库状态必须通过 status 语义暴露给读屏");

// 命名与分类：文件名优先（数字模特库靠名称辨识），空名称绝不提交。
assert.equal(assetNameFromUpload("模特-1.png"), "模特-1");
assert.equal(assetNameFromUpload("/Users/me/来图/模特 2 .JPG"), "模特 2");
assert.equal(assetNameFromUpload("   ", "图片节点"), "图片节点", "文件名不可用时回退到节点标题");
assert.equal(assetNameFromUpload("", "  "), "上传图片", "全都不可用时回退到默认名，不得提交空名称");
assert.equal(
  assetNameFromUpload(`${"ä".repeat(300)}.png`).length,
  60,
  "自动名称必须截断（服务端限制 200 字符）",
);

const assetPosts: Array<{ url: string; init: RequestInit }> = [];
await saveImageToModelLibrary({ name: "模特-1", image: "/api/files/a.png" }, async (url, init) => {
  assetPosts.push({ url, init });
  return { ok: true, status: 201 };
});
assert.equal(assetPosts.length, 1);
assert.equal(assetPosts[0]!.url, "/api/assets");
assert.equal(assetPosts[0]!.init.method, "POST");
assert.deepEqual(
  JSON.parse(String(assetPosts[0]!.init.body)),
  { name: "模特-1", category: "model", image: "/api/files/a.png" },
  "存入数字模特库必须提交 category=model",
);
await assert.rejects(
  () => saveImageToModelLibrary({ name: "模特-1", image: "/api/files/a.png" }, async () => ({ ok: false, status: 400 })),
  /HTTP 400/,
  "入库失败必须抛出可展示的错误（由调用方落到失败态）",
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

console.log("数字模特库前端接线（查看器 + 上传入口）+ 色彩工具入口移除 契约测试通过");
