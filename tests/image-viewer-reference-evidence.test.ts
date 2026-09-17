import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
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

console.log("历史参考证据查看器契约测试通过");
