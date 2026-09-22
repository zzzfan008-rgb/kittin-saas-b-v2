import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { ReferenceEvidenceList } from "../src/components/ImageViewer";

const images = ["/api/files/reference.png", "/api/files/reference-2.png"];
const evidence = [{
    order: 4,
    assetSha256: "坏哈希",
    sourceNodeId: "legacy-garment-source",
  }];

const markup = renderToStaticMarkup(createElement(ReferenceEvidenceList, { images, evidence }));
assert.match(markup, /参考图 · 2 张/);
assert.match(markup, /历史证据，待复核/);
assert.match(markup, /证据不可用，待复核/);
assert.match(markup, /来源：legacy-garment-source/);

// 2026-09-25 决策 5：结果详情弹窗(z-71) 之上叠查看器，查看器必须在详情之上。
// ui-qa 用 elementFromPoint 钉住；这里用渲染出的 className 做结构守卫。
assert.match(
  readFileSync(new URL("../src/components/ImageViewer.tsx", import.meta.url), "utf8"),
  /className="fixed inset-0 z-\[80\] flex items-stretch bg-black\/85"/,
  "图片查看器必须渲染在结果详情弹窗之上（z-80 > z-71）",
);

console.log("历史参考证据查看器契约测试通过");
