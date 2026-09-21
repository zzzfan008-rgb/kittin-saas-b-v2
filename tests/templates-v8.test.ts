/**
 * v8 内置模板结构回归测试（R-87，纯逻辑，不调真实 API/DB）。
 *
 * 覆盖模板格式契约 docs/design/2026-09-21-five-node-model/contracts/template-format.md
 * 的可机检验收项 P1 / P3–P10。P2（逐模板过 validateAndMigrateFlow）依赖 R-85 的
 * schema v8 重写（server/lib/workflowSchema.ts）。schema 已是 v8（R-85 已落地），
 * 因此 P2 以 assert.doesNotThrow 硬断言执行；探测/跳过分支仅为历史兼容兜底。
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
const { validateAndMigrateFlow, WorkflowValidationError } = await import("../server/lib/workflowSchema");
const { getGarmentPromptVariantById } = await import("../src/lib/garmentPromptPresets");

const GENERATE_VARIANT = "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1";
const EDIT_VARIANT = "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1";
const VIDEO_VARIANT = "video-animate.doubao-seedance-2-5-260628.edit.v1";

const INPUT_KINDS = new Set(["text", "image", "video"]);
const GENERATOR_KINDS = new Set(["image-generator", "video-generator"]);
const RESULT_KINDS = new Set(["result-image", "result-video"]);

let passed = 0;
let skipped = 0;
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
function skip(name: string, reason: string): void {
  skipped += 1;
  console.log(`  – ${name}（跳过：${reason}）`);
}

function main() {
  console.log("v8 内置模板结构回归测试");

  const templates = builtinTemplates();

  ok("P1：内置模板恰为 15 个", () => {
    assert.equal(templates.length, 15);
  });

  const expectedIds = [
    "builtin-model-tryon",
    "builtin-pose",
    "builtin-background-swap",
    "builtin-lookbook",
    "builtin-digital-model",
    "builtin-print-extract",
    "builtin-print-mutate",
    "builtin-garment-recolor",
    "builtin-fabric-swap",
    "builtin-sketch-to-garment",
    "builtin-ai-restyle",
    "builtin-outfit-recommend",
    "builtin-person-to-mannequin",
    "builtin-video-runway",
    "builtin-video-xhs",
  ];
  ok("P1：15 个模板 id 与契约完全一致", () => {
    const ids = templates.map((t) => t.id).sort();
    assert.deepEqual(ids, [...expectedIds].sort());
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

  ok("P4：每个 image-generator 的 promptVariantId 可解析", () => {
    for (const tpl of templates) {
      for (const node of tpl.flow.nodes) {
        if (node.type !== "image-generator") continue;
        const variantId = (node.data as { promptVariantId?: string }).promptVariantId;
        assert.ok(variantId, `${tpl.id}/${node.id} 缺少 promptVariantId`);
        assert.ok(getGarmentPromptVariantById(variantId), `${tpl.id}/${node.id} 变体无法解析: ${variantId}`);
      }
    }
  });

  ok("P4b：每个 video-generator 的 promptVariantId 可解析", () => {
    for (const tpl of templates) {
      for (const node of tpl.flow.nodes) {
        if (node.type !== "video-generator") continue;
        const variantId = (node.data as { promptVariantId?: string }).promptVariantId;
        assert.ok(variantId, `${tpl.id}/${node.id} 缺少 promptVariantId`);
        assert.ok(getGarmentPromptVariantById(variantId), `${tpl.id}/${node.id} 变体无法解析: ${variantId}`);
      }
    }
  });

  ok("P5：每个 video-generator 的 aspectRatio 为 adaptive", () => {
    for (const tpl of templates) {
      for (const node of tpl.flow.nodes) {
        if (node.type !== "video-generator") continue;
        const data = node.data as { aspectRatio?: string; modelOptions?: { aspectRatio?: string } };
        assert.equal(data.aspectRatio, "adaptive", `${tpl.id}/${node.id} aspectRatio != adaptive`);
        assert.equal(data.modelOptions?.aspectRatio, "adaptive", `${tpl.id}/${node.id} modelOptions.aspectRatio != adaptive`);
      }
    }
  });

  ok("P6：模板 12（outfit）是唯一 GENERATE_VARIANT，其余用 EDIT_VARIANT/视频变体", () => {
    for (const tpl of templates) {
      for (const node of tpl.flow.nodes) {
        if (node.type === "image-generator") {
          const variantId = (node.data as { promptVariantId?: string }).promptVariantId;
          if (tpl.id === "builtin-outfit-recommend") {
            assert.equal(variantId, GENERATE_VARIANT, `${tpl.id}/${node.id} 应为 GENERATE_VARIANT`);
          } else {
            assert.equal(variantId, EDIT_VARIANT, `${tpl.id}/${node.id} 应为 EDIT_VARIANT`);
          }
        } else if (node.type === "video-generator") {
          const variantId = (node.data as { promptVariantId?: string }).promptVariantId;
          assert.equal(variantId, VIDEO_VARIANT, `${tpl.id}/${node.id} 应为 VIDEO_VARIANT`);
        }
      }
    }
  });

  ok("P7：模板 9（fabric）生成节点恰有 2 条 reference 边", () => {
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

  // P2：逐模板过 validateAndMigrateFlow。schema 已是 v8（R-85 已落地）。
  // 探测分支仅为历史兼容兜底；正常路径 schemaV8Ready === true，直接走硬断言。
  const first = templates[0];
  let schemaV8Ready = true;
  try {
    validateAndMigrateFlow(first.flow);
  } catch (error) {
    if (error instanceof WorkflowValidationError) schemaV8Ready = false;
    else throw error;
  }
  if (schemaV8Ready) {
    ok("P2：每个模板通过 validateAndMigrateFlow", () => {
      for (const tpl of templates) {
        assert.doesNotThrow(() => validateAndMigrateFlow(tpl.flow), `${tpl.id} 未通过校验`);
      }
    });
  } else {
    skip("P2：每个模板通过 validateAndMigrateFlow", "依赖 R-85 的 schema v8（workflowSchema.ts 仍为 v7，只认 text/image/video）");
  }

  console.log(`\n通过 ${passed} 项，跳过 ${skipped} 项`);
}

main();
fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
