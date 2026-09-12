import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ReferenceRoleSummary,
  type ReferenceRoleSummaryReference,
} from "../src/components/nodes/ReferenceRoleSummary";

const references: ReferenceRoleSummaryReference[] = [
  {
    order: 0,
    sourceNodeId: "identity-source",
    sourceLabel: "人物参考",
    role: "identity",
    roleNeedsConfirmation: true,
    imageUrl: "data:image/png;base64,identity",
    available: true,
  },
  {
    order: 1,
    sourceNodeId: "pose-source",
    sourceLabel: "姿势参考",
    role: "pose_composition",
    roleNeedsConfirmation: false,
    imageUrl: "data:image/png;base64,pose",
    available: true,
  },
  {
    order: 2,
    sourceNodeId: "top-front",
    sourceLabel: "上装正面",
    role: "garment_top",
    roleNeedsConfirmation: false,
    imageUrl: "data:image/png;base64,top-front",
    available: true,
  },
  {
    order: 3,
    sourceNodeId: "top-back",
    sourceLabel: "上装背面",
    role: "garment_top",
    roleNeedsConfirmation: false,
    imageUrl: "data:image/png;base64,top-back",
    available: true,
  },
  {
    order: 4,
    sourceNodeId: "missing-source",
    sourceLabel: "缺失参考",
    role: "generic",
    roleNeedsConfirmation: true,
    available: false,
    unavailableReason: "源节点尚未产出可读取图片",
  },
];

const markup = renderToStaticMarkup(
  createElement(ReferenceRoleSummary, {
    references,
    onRoleChange: () => undefined,
  }),
);

assert.match(markup, /人物参考/);
assert.match(markup, /姿势参考/);
assert.match(markup, /上装正面/);
assert.match(markup, /上装背面/);
assert.match(markup, /缺失参考/);

const orderMatches = [...markup.matchAll(/data-reference-order="(\d+)"/g)].map((match) => match[1]);
assert.deepEqual(orderMatches, ["0", "1", "2", "3", "4"], "参考图必须按实际输入顺序渲染");

assert.match(markup, /待确认/, "未确认角色必须显式显示待确认状态");
assert.match(markup, /已确认/, "已确认角色必须显式显示已确认状态");
assert.match(markup, /重复角色/, "同一具体角色重复分配时必须显式提示");
assert.match(markup, /不可用/, "缺失或不可读参考图必须显式显示不可用状态");
assert.match(markup, /源节点尚未产出可读取图片/);

for (const reference of references) {
  const ordinal = reference.order + 1;
  assert.match(
    markup,
    new RegExp(`aria-label="参考图 ${ordinal}：${reference.sourceLabel} 的角色"`),
    `参考图 ${ordinal} 的角色选择器必须有可访问名称`,
  );
  assert.match(
    markup,
    new RegExp(`data-reference-order="${reference.order}"[\\s\\S]*?aria-label="参考图 ${ordinal}：${reference.sourceLabel}`),
  );
}

const comboboxes = markup.match(/role="combobox"/g) ?? [];
assert.equal(comboboxes.length, references.length, "每张参考图都必须提供一个角色选择器");
assert.equal(
  (markup.match(/tabindex="0"/g) ?? []).length,
  references.filter((reference) => reference.available).length,
  "可用参考图的角色选择器必须可通过键盘聚焦",
);
assert.equal(
  (markup.match(/aria-haspopup="listbox"/g) ?? []).length,
  references.length,
  "角色选择器必须暴露键盘可操作的列表框语义",
);

const unavailableRow = /data-reference-order="4"[\s\S]*?不可用[\s\S]*?disabled(?:="")?/;
assert.match(markup, unavailableRow, "不可用参考图的角色选择器必须保持禁用，避免误确认");

const interactiveMarkup = renderToStaticMarkup(
  createElement(ReferenceRoleSummary, {
    references: references.slice(0, 3),
    onRoleChange: () => undefined,
    onMove: () => undefined,
    onRemove: () => undefined,
  }),
);
assert.match(interactiveMarkup, /aria-label="上移参考图 1"[^>]*disabled/, "首条参考图不能上移");
assert.match(interactiveMarkup, /aria-label="下移参考图 3"[^>]*disabled/, "末条参考图不能下移");
assert.match(interactiveMarkup, /aria-label="上移参考图 2"/, "中间参考图必须提供上移操作");
assert.match(interactiveMarkup, /aria-label="下移参考图 2"/, "中间参考图必须提供下移操作");
assert.match(interactiveMarkup, /aria-label="移除参考图 2"/, "每条参考图必须提供移除操作");

const migratedMarkup = renderToStaticMarkup(
  createElement(ReferenceRoleSummary, {
    references: [
      {
        order: 0,
        sourceNodeId: "legacy-garment-source",
        sourceLabel: "历史服装图",
        role: "garment_full",
        roleNeedsConfirmation: true,
        imageUrl: "data:image/png;base64,legacy-garment",
        available: true,
      },
      {
        order: 1,
        sourceNodeId: "legacy-unknown-source",
        sourceLabel: "历史含糊图",
        role: "generic",
        roleNeedsConfirmation: true,
        imageUrl: "data:image/png;base64,legacy-unknown",
        available: true,
      },
    ],
    onRoleChange: () => undefined,
  }),
);
assert.equal((migratedMarkup.match(/data-reference-order=/g) ?? []).length, 2);
assert.match(migratedMarkup, /历史服装图/);
assert.match(migratedMarkup, /历史含糊图/);
for (const order of [0, 1]) {
  assert.match(
    migratedMarkup,
    new RegExp(`data-reference-order="${order}"[\\s\\S]*?待确认`),
    `迁移参考图 ${order + 1} 必须保持待确认`,
  );
}
assert.match(migratedMarkup, /整套服装/);
assert.match(migratedMarkup, /通用补充参考/);

console.log("参考角色摘要渲染与键盘可访问性契约测试通过");
