import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  nodeSpecForKind,
  nodeTitleForKind,
} from "../src/types/workflow";
import { UnsupportedNodeKindNotice } from "../src/components/nodes/NodeFrame";

let passed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

console.log("R-79 未知 kind 优雅降级测试");

// 旧 v6 类型：v7 类型层已删除（R7 无迁移路径），只能以持久化脏数据/旧档形态出现。
const LEGACY_KIND = "sketch-to-render";

test("nodeSpecForKind 对未知 kind 返回 undefined（显式「不支持」信号），对三值 kind 返回规格", () => {
  assert.equal(nodeSpecForKind(LEGACY_KIND), undefined);
  assert.equal(nodeSpecForKind("text")?.title, "文本");
  assert.equal(nodeSpecForKind("image")?.title, "图片");
  assert.equal(nodeSpecForKind("video")?.title, "视频");
  assert.equal(nodeSpecForKind(undefined), undefined);
  assert.equal(nodeSpecForKind(null), undefined);
  assert.equal(nodeSpecForKind(123), undefined);
});

test("nodeTitleForKind 未知 kind 返回原始字符串（类型可读），空值返回「未知类型」", () => {
  assert.equal(nodeTitleForKind("image"), "图片");
  assert.equal(nodeTitleForKind(LEGACY_KIND), LEGACY_KIND);
  assert.equal(nodeTitleForKind(""), "未知类型");
  assert.equal(nodeTitleForKind(undefined), "未知类型");
});

test("占位组件显式渲染「不支持的旧版本内容」与可读的节点名/类型（真实 DOM 静态输出）", () => {
  const html = renderToStaticMarkup(
    createElement(UnsupportedNodeKindNotice, { kind: LEGACY_KIND, label: "旧版草图渲染" }),
  );
  // 显式降级态，不是吞错：占位文案 + 节点名 + 原始类型都可读。
  assert.match(html, /不支持的旧版本内容/);
  assert.match(html, /旧版草图渲染/);
  assert.match(html, /sketch-to-render/);
  assert.match(html, /data-unsupported-kind="true"/);
});

test("结果查看器（生成记录详情）渲染分发不再直接下标查表未知 kind", () => {
  const inspector = readFileSync(
    new URL("../src/components/panels/InspectorPanel.tsx", import.meta.url),
    "utf8",
  );
  // 旧崩溃链 `NODE_SPECS[record.kind].title` / `NODE_SPECS[d.kind]` 已移除；
  // 结果详情与属性摘要都经 nodeSpecForKind / nodeTitleForKind 稳健查表并渲染占位。
  assert.ok(!inspector.includes("NODE_SPECS[record.kind]"), "结果详情仍直接下标查表");
  assert.ok(!inspector.includes("NODE_SPECS[d.kind]"), "属性摘要仍直接下标查表");
  assert.match(inspector, /nodeTitleForKind\(record\.kind\)/);
  assert.match(inspector, /nodeSpecForKind\(record\.kind\)/);
  assert.match(inspector, /nodeSpecForKind\(d\.kind\)/);
  assert.match(inspector, /UnsupportedNodeKindNotice/);
});

test("节点工具条 / 内联面板与连线校验的未知 kind 下标查表也已收敛到稳健查表", () => {
  // v8：承载功能目录的 v7 悬浮窗口已退役，同一不变式改在新表面上核查。
  const toolbar = readFileSync(
    new URL("../src/components/nodes/NodeToolbar.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(!toolbar.includes("NODE_SPECS["), "节点工具条仍直接下标查表");
  assert.match(toolbar, /nodeTitleForKind\(kind\)/);

  const panel = readFileSync(
    new URL("../src/components/nodes/GeneratorParamsPanel.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(!panel.includes("NODE_SPECS["), "生成节点内联面板仍直接下标查表");

  const store = readFileSync(
    new URL("../src/store/flowStore.ts", import.meta.url),
    "utf8",
  );
  assert.match(store, /nodeSpecForKind\(target\.data\.kind\)/);
});

console.log(`\n通过 ${passed} 项`);
