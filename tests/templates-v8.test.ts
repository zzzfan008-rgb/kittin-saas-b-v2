/**
 * 内置模板结构回归测试（R-87 → 64 Phase 1 C7 v9 重写，纯逻辑，不调真实 API/DB）。
 *
 * 覆盖模板格式契约 docs/design/2026-09-21-five-node-model/contracts/template-format.md
 * 的可机检验收项 P1/P3/P5/P7–P10，以及 C7 v9 快照断言：
 * - schemaVersion = 9
 * - generator 显式 modelId + operationMode + 契约默认参数（aspectRatio 1:1 / batchSize 1，
 *   LookBook/印花裂变覆盖 batchSize 2；modelOptions = 契约推荐默认）
 * - text 节点 = family 预设模板文本（server/lib/promptPresetsFrozen.ts 冻结表，所见即所发）
 * - 逐模板过 validateAndMigrateFlow（v9）
 *
 * 运行：node node_modules/tsx/dist/cli.mjs tests/templates-v8.test.ts
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// 先把内置模板的落盘目录指向临时目录，避免污染真实 data/templates/builtin。
const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "garment-canvas-templates-test-"));
process.env.DATA_DIR = TEST_DATA_DIR;

const { builtinTemplates } = await import("../server/routes/templates");
const { validateAndMigrateFlow } = await import("../server/lib/workflowSchema");
const { presetTemplateText } = await import("../server/lib/promptPresetsFrozen");
const { DEFAULT_GENERATION_MODEL_ID, defaultImageModelOptions } = await import("../src/types/imageModels");
const { DEFAULT_VIDEO_MODEL_ID } = await import("../src/types/videoModels");

const INPUT_KINDS = new Set(["text", "image", "video"]);
const GENERATOR_KINDS = new Set(["image-generator", "video-generator"]);
const RESULT_KINDS = new Set(["result-image", "result-video"]);

/** 每模板期望：text 节点预设（family, mode）+ generator operationMode（+ batchSize 覆盖）。 */
const EXPECTED: Record<string, { preset: readonly [string, string]; operationMode: string; batchSize?: number }> = {
  "builtin-model-tryon": { preset: ["fashion-lookbook", "edit"], operationMode: "edit" },
  "builtin-pose": { preset: ["fashion-lookbook", "edit"], operationMode: "edit" },
  "builtin-background-swap": { preset: ["fashion-lookbook", "edit"], operationMode: "edit" },
  "builtin-lookbook": { preset: ["fashion-lookbook", "edit"], operationMode: "edit", batchSize: 2 },
  "builtin-digital-model": { preset: ["fashion-lookbook", "edit"], operationMode: "edit" },
  "builtin-print-extract": { preset: ["print-extract", "edit"], operationMode: "edit" },
  "builtin-print-mutate": { preset: ["print-mutate", "edit"], operationMode: "edit", batchSize: 2 },
  "builtin-garment-recolor": { preset: ["fabric-recolor", "edit"], operationMode: "edit" },
  "builtin-fabric-swap": { preset: ["fashion-lookbook", "edit"], operationMode: "edit" },
  "builtin-sketch-to-garment": { preset: ["fashion-lookbook", "edit"], operationMode: "edit" },
  "builtin-ai-restyle": { preset: ["fashion-lookbook", "edit"], operationMode: "edit" },
  "builtin-outfit-recommend": { preset: ["fashion-lookbook", "generate"], operationMode: "generate" },
  "builtin-person-to-mannequin": { preset: ["fashion-lookbook", "edit"], operationMode: "edit" },
  // 视频模板：operationMode=generate（零系统文本），动效任务文本写入 text 正文（避免重复拼装）
  "builtin-video-runway": { preset: ["video-animate", "edit"], operationMode: "generate" },
  "builtin-video-xhs": { preset: ["video-animate", "edit"], operationMode: "generate" },
};

let passed = 0;
function ok(name: string, fn: () => void): void {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

function main() {
  console.log("内置模板结构回归测试（64 Phase 1 C7，v9）");

  const templates = builtinTemplates();

  ok("P1：内置模板恰为 15 个", () => {
    assert.equal(templates.length, 15);
  });

  ok("P1：15 个模板 id 与契约完全一致", () => {
    const ids = templates.map((t) => t.id).sort();
    assert.deepEqual(ids, [...Object.keys(EXPECTED)].sort());
  });

  ok("P10：延后模板 keyframes / video-clone 未注册", () => {
    const ids = new Set(templates.map((t) => t.id));
    assert.equal(ids.has("builtin-video-keyframes"), false);
    assert.equal(ids.has("builtin-video-clone"), false);
  });

  ok("id 约定：builtin-model-tryon 的数字模特输入节点 id 为 model", () => {
    const tryon = templates.find((t) => t.id === "builtin-model-tryon");
    assert.ok(tryon, "缺少 builtin-model-tryon");
    const modelNode = tryon.flow.nodes.find((n) => n.type === "image" && n.id === "model");
    assert.ok(modelNode, "builtin-model-tryon 缺少 id=model 的数字模特输入节点");
    assert.equal((modelNode.data as { label?: string }).label, "数字模特");
  });

  ok("P3：所有模板不含 result 节点", () => {
    for (const tpl of templates) {
      for (const node of tpl.flow.nodes) {
        assert.equal(RESULT_KINDS.has(node.type), false, `${tpl.id}/${node.id} 是 result 节点`);
      }
    }
  });

  ok("C7：全部模板 schemaVersion = 9（模板与 flow）", () => {
    for (const tpl of templates) {
      assert.equal(tpl.schemaVersion, 9, `${tpl.id} schemaVersion != 9`);
      assert.equal(tpl.flow.schemaVersion, 9, `${tpl.id} flow.schemaVersion != 9`);
    }
  });

  ok("C7：generator 显式 modelId + operationMode + 契约默认参数（快照）", () => {
    for (const tpl of templates) {
      const expected = EXPECTED[tpl.id];
      assert.ok(expected, `${tpl.id} 不在期望表`);
      for (const node of tpl.flow.nodes) {
        if (node.type === "image-generator") {
          const data = node.data as {
            modelId?: string; operationMode?: string; aspectRatio?: string;
            batchSize?: number; modelOptions?: Record<string, unknown>;
            promptVariantId?: unknown;
          };
          assert.equal(data.modelId, DEFAULT_GENERATION_MODEL_ID, `${tpl.id}/${node.id} modelId`);
          assert.equal(data.operationMode, expected.operationMode, `${tpl.id}/${node.id} operationMode`);
          assert.equal(data.aspectRatio, "1:1", `${tpl.id}/${node.id} aspectRatio`);
          assert.equal(data.batchSize, expected.batchSize ?? 1, `${tpl.id}/${node.id} batchSize`);
          assert.deepEqual(
            data.modelOptions,
            defaultImageModelOptions(DEFAULT_GENERATION_MODEL_ID, "1:1"),
            `${tpl.id}/${node.id} modelOptions 应为契约推荐默认`,
          );
          assert.ok(!("promptVariantId" in data), `${tpl.id}/${node.id} 不得携带 promptVariantId`);
        } else if (node.type === "video-generator") {
          const data = node.data as {
            modelId?: string; operationMode?: string; aspectRatio?: string;
            modelOptions?: { aspectRatio?: string };
          };
          assert.equal(data.modelId, DEFAULT_VIDEO_MODEL_ID, `${tpl.id}/${node.id} modelId`);
          assert.equal(data.operationMode, expected.operationMode, `${tpl.id}/${node.id} operationMode`);
          assert.equal(data.aspectRatio, "adaptive", `${tpl.id}/${node.id} aspectRatio`);
        }
      }
    }
  });

  ok("C7：text 节点 = family 预设模板文本（冻结表逐字，所见即所发）", () => {
    for (const tpl of templates) {
      const expected = EXPECTED[tpl.id];
      const expectedText = presetTemplateText(expected.preset[0], expected.preset[1]);
      assert.ok(expectedText, `预设不存在: ${expected.preset.join(":")}`);
      for (const node of tpl.flow.nodes) {
        if (node.type !== "text") continue;
        assert.equal(
          (node.data as { text: string }).text,
          expectedText,
          `${tpl.id}/${node.id} text 应为 ${expected.preset.join(":")} 预设模板文本`,
        );
      }
    }
  });

  ok("C5 模板侧自洽：edit 模板的 generator 必有 ≥1 条参考图入边", () => {
    for (const tpl of templates) {
      const expected = EXPECTED[tpl.id];
      if (expected.operationMode !== "edit") continue;
      for (const node of tpl.flow.nodes) {
        if (node.type !== "image-generator") continue;
        const refEdges = tpl.flow.edges.filter((e) => e.target === node.id && e.targetHandle === "reference");
        assert.ok(refEdges.length >= 1, `${tpl.id}/${node.id} edit 模板缺参考图入边`);
      }
    }
  });

  ok("P5：每个 video-generator 的 modelOptions.aspectRatio 为 adaptive", () => {
    for (const tpl of templates) {
      for (const node of tpl.flow.nodes) {
        if (node.type !== "video-generator") continue;
        const data = node.data as { modelOptions?: { aspectRatio?: string } };
        assert.equal(data.modelOptions?.aspectRatio, "adaptive", `${tpl.id}/${node.id} modelOptions.aspectRatio != adaptive`);
      }
    }
  });

  ok("P7：模板 fabric 生成节点恰有 2 条 reference 边", () => {
    const fabric = templates.find((t) => t.id === "builtin-fabric-swap");
    assert.ok(fabric, "缺少 builtin-fabric-swap");
    const generatorId = fabric.flow.nodes.find((n) => n.type === "image-generator")?.id;
    assert.ok(generatorId, "fabric 模板缺少生成节点");
    const refEdges = fabric.flow.edges.filter((e) => e.target === generatorId && e.targetHandle === "reference");
    assert.equal(refEdges.length, 2);
  });

  ok("P9：每个 text 节点恰连 1 个生成节点", () => {
    for (const tpl of templates) {
      const generatorIds = new Set(tpl.flow.nodes.filter((n) => GENERATOR_KINDS.has(n.type)).map((n) => n.id));
      for (const node of tpl.flow.nodes) {
        if (node.type !== "text") continue;
        const outgoing = tpl.flow.edges.filter((e) => e.source === node.id && generatorIds.has(e.target));
        assert.equal(outgoing.length, 1, `${tpl.id}/${node.id} 连到 ${outgoing.length} 个生成节点`);
      }
    }
  });

  ok("P8：每条边都符合合法边表", () => {
    for (const tpl of templates) {
      const kindById = new Map(tpl.flow.nodes.map((n) => [n.id, n.type]));
      for (const edge of tpl.flow.edges) {
        const sourceKind = kindById.get(edge.source);
        const targetKind = kindById.get(edge.target);
        assert.ok(sourceKind && targetKind, `${tpl.id}/${edge.id} 引用不存在的节点`);
        const handle = edge.targetHandle ?? "reference";
        const legal =
          (sourceKind === "text" && GENERATOR_KINDS.has(targetKind) && handle === "prompt")
          || (sourceKind === "image" && targetKind === "image-generator" && handle === "reference")
          || (sourceKind === "image" && targetKind === "video-generator" && handle === "first-frame");
        assert.ok(legal, `${tpl.id}/${edge.id} 非法边: ${sourceKind} → ${targetKind} (${handle})`);
      }
    }
  });

  ok("INV-1：每个生成节点都有 ≥1 条 text prompt 上游", () => {
    for (const tpl of templates) {
      const kindById = new Map(tpl.flow.nodes.map((n) => [n.id, n.type]));
      for (const node of tpl.flow.nodes) {
        if (!GENERATOR_KINDS.has(node.type)) continue;
        const hasTextPrompt = tpl.flow.edges.some(
          (e) => e.target === node.id && e.targetHandle === "prompt" && kindById.get(e.source) === "text",
        );
        assert.equal(hasTextPrompt, true, `${tpl.id}/${node.id} 缺少 text prompt 上游`);
      }
    }
  });

  ok("P2：每个模板通过 validateAndMigrateFlow（v9）", () => {
    for (const tpl of templates) {
      assert.doesNotThrow(() => validateAndMigrateFlow(tpl.flow), `${tpl.id} 未通过校验`);
    }
  });

  ok("输入层纯净：输入节点不携带任何生成语义字段", () => {
    for (const tpl of templates) {
      for (const node of tpl.flow.nodes) {
        if (!INPUT_KINDS.has(node.type)) continue;
        for (const field of ["modelId", "operationMode", "aspectRatio", "batchSize", "promptVariantId"]) {
          assert.ok(!(field in (node.data as Record<string, unknown>)), `${tpl.id}/${node.id} 不得携带 ${field}`);
        }
      }
    }
  });

  console.log(`\n通过 ${passed} 项`);
}

main();
fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
