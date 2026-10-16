import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// 裁剪对话框接线契约（源码断言，无 DOM；与五节点 UI 测试同模式）。
// CropImageDialog 本体是 DOM 交互（react-image-crop 框选），由浏览器实测覆盖；
// 此处锁定：工具条裁剪入口接线 / 对话框组件存在 / 样式 vendor 存在 / 错误 import 不再出现。

const imageNodeSource = readFileSync("src/components/nodes/ImageNode.tsx", "utf8");
const dialogSource = readFileSync("src/components/panels/CropImageDialog.tsx", "utf8");

// 工具条裁剪入口：可点开对话框，未上传/只读禁用并给原因。
assert.match(imageNodeSource, /cropDialogOpen/, "ImageNode 缺少裁剪对话框开关状态");
assert.match(imageNodeSource, /setCropDialogOpen\(true\)/, "裁剪按钮未接线打开对话框");
assert.match(imageNodeSource, /请先上传图片后再裁剪/, "裁剪禁用原因缺失");
assert.match(imageNodeSource, /只读项目不能裁剪/, "只读禁用原因缺失");
console.log("  ✓ 工具条裁剪入口接线（含禁用原因）");

// 完成后回写：outputImages 替换 + 蒙版三字段清零（与抠图同款语义）。
assert.match(imageNodeSource, /outputImages: \[croppedUrl\]/, "裁剪完成后未回写 outputImages");
assert.match(imageNodeSource, /mask: undefined/, "裁剪完成后未清除蒙版");
console.log("  ✓ 裁剪完成后回写 outputImages 并清除蒙版");

// 对话框：无残留的错误 CSS 引用（react-image-crop 11.x 导出的是 dist/ReactCrop.css；
// 本项目用自带 vendor 样式，见 App.tsx 的 styles/react-image-crop.css 引入）。
assert.doesNotMatch(dialogSource, /react-image-crop\/dist\/index\.css/, "残留的错误 CSS 引用");
assert.match(dialogSource, /onCropComplete/, "对话框缺少完成回调");
assert.match(dialogSource, /ReactCrop/, "对话框未使用 react-image-crop 组件");
console.log("  ✓ 对话框组件与样式接线正确");

const appSource = readFileSync("src/App.tsx", "utf8");
assert.match(appSource, /styles\/react-image-crop\.css/, "App 未引入裁剪主题样式");
console.log("  ✓ App 引入裁剪主题样式");

console.log("裁剪对话框接线 契约测试通过");
