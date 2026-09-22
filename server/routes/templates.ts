/**
 * 工作流内置模板（只读，JSON 文件存储）：
 *   GET    /api/templates      → WorkflowTemplate[]（15 个内置模板）
 *   GET    /api/templates/:id  → 单个内置模板
 * 「我的模板」功能已取消（2026-09-25 决策）：POST / DELETE 写入路径已移除，
 * 用户模板生命周期（server/lib/userTemplateLifecycle.ts）已删除。
 * 内置模板存 data/templates/builtin/（启动时增量补齐）。
 */
import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config";
import { writeJsonAtomicSync } from "../lib/atomicJson";
import { validateAndMigrateFlow, WorkflowValidationError } from "../lib/workflowSchema";
import { isLocalImageReference } from "../lib/imageValidation";
import { thumbnailUrlForImage } from "../lib/fileStore";
import {
  WORKFLOW_SCHEMA_VERSION,
  type BatchSize,
  type PersistedWorkflowEdge,
  type PersistedWorkflowNode,
  type WorkflowTemplate,
} from "../../src/types/workflow";
import {
  DEFAULT_GENERATION_MODEL_ID,
  defaultImageModelOptions,
} from "../../src/types/imageModels";
import {
  DEFAULT_VIDEO_MODEL_ID,
  type VideoModelOptions,
} from "../../src/types/videoModels";
import { getGarmentPromptVariantById } from "../../src/lib/garmentPromptPresets";
import {
  getModelParameterProfile,
  materializeModelParameterProfile,
} from "../../src/types/modelParameterProfiles";

export const templatesRouter = Router();

function templatesDir(): string {
  const dir = path.join(config.dataDir(), "templates", "builtin");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function templatePath(id: string): string {
  return path.join(templatesDir(), `${path.basename(id)}.json`);
}

// ---------- 内置模板（v8 三层七节点：输入层 + 生成层 + 边，不含 result 节点）----------
// 结构契约：docs/design/2026-09-21-five-node-model/contracts/template-format.md
const BUILTIN_CREATED_AT = "2026-08-05T00:00:00.000Z";
// 变体 id 以 src/lib/garmentPromptPresets.ts（P2-d 目录）实际值为准；
// 注册前经 getGarmentPromptVariantById 逐条解析验证（P4）。
const GENERATE_VARIANT = "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1";
const EDIT_VARIANT = "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1";
const VIDEO_VARIANT = "video-animate.doubao-seedance-2-5-260628.edit.v1";
// 视频生成节点硬约束：aspectRatio 必须 "adaptive"（Seedance 首帧任务，C6/P5）。
const VIDEO_OPTIONS = { seconds: "5", resolution: "720p", aspectRatio: "adaptive" } as const;

function textNode(id: string, x: number, y: number, label: string, text: string): PersistedWorkflowNode {
  return { id, type: "text", position: { x, y }, data: { kind: "text", label, status: "idle", text } };
}

function imageNode(id: string, x: number, y: number, label: string): PersistedWorkflowNode {
  // v8：输入节点不承载任何生成语义（无 variantId / modelId / aspectRatio / batchSize）。
  return { id, type: "image", position: { x, y }, data: { kind: "image", label, status: "idle", outputImages: [] } };
}

interface ImageGeneratorOptions {
  aspectRatio?: string;
  batchSize?: BatchSize;
}

function imageGeneratorNode(
  id: string,
  x: number,
  y: number,
  label: string,
  variantId: string,
  options: ImageGeneratorOptions = {},
): PersistedWorkflowNode {
  // 生成层：功能绑定 + 参数物化。变体绑定是唯一事实源，档案缺失时退回合同推荐默认值，
  // 由 parameter-drift 闸门在运行时拒绝（沿用 v7 的物化口径）。
  const boundVariant = getGarmentPromptVariantById(variantId);
  const boundProfile = boundVariant
    ? getModelParameterProfile(boundVariant.parameterProfileId)
    : undefined;
  const materialized = boundProfile
    ? materializeModelParameterProfile(boundProfile)
    : undefined;
  const aspectRatio = options.aspectRatio
    ?? (materialized && materialized.aspectRatio !== "source" ? materialized.aspectRatio : "3:4");
  const batchSize = options.batchSize ?? (materialized ? materialized.batchSize : 1);
  return {
    id,
    type: "image-generator",
    position: { x, y },
    data: {
      kind: "image-generator",
      label,
      status: "idle",
      promptVariantId: variantId,
      modelId: DEFAULT_GENERATION_MODEL_ID,
      modelOptions: materialized
        ? materialized.modelOptions
        : defaultImageModelOptions(DEFAULT_GENERATION_MODEL_ID, aspectRatio),
      aspectRatio,
      batchSize,
    },
  };
}

interface VideoGeneratorOptions {
  aspectRatio?: string;
  modelOptions?: VideoModelOptions;
}

function videoGeneratorNode(
  id: string,
  x: number,
  y: number,
  label: string,
  variantId: string,
  options: VideoGeneratorOptions = {},
): PersistedWorkflowNode {
  return {
    id,
    type: "video-generator",
    position: { x, y },
    data: {
      kind: "video-generator",
      label,
      status: "idle",
      promptVariantId: variantId,
      modelId: DEFAULT_VIDEO_MODEL_ID,
      modelOptions: options.modelOptions ?? { ...VIDEO_OPTIONS },
      aspectRatio: options.aspectRatio ?? "adaptive",
    },
  };
}

function edge(id: string, source: string, target: string, targetHandle?: "prompt" | "reference" | "first-frame"): PersistedWorkflowEdge {
  return { id, source, target, ...(targetHandle ? { targetHandle } : {}), data: {} };
}

export function builtinTemplates(): WorkflowTemplate[] {
  return [
    // ---------- AI 换装（5 个）----------
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-model-tryon",
      name: "模特试穿",
      description: "上传服装图与数字模特图，描述试穿要求，生成模特上身效果",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("tryon-requirement", 0, -170, "试穿要求", "【服装】上传服装图\n【数字模特】上传数字模特图\n【要求】描述试穿后的模特姿态、场景与镜头（可空）"),
          imageNode("garment", 0, 20, "服装图"),
          imageNode("model", 0, 210, "数字模特"),
          imageGeneratorNode("tryon-gen", 380, 20, "试穿生成", EDIT_VARIANT),
        ],
        edges: [
          edge("e-tryon-prompt", "tryon-requirement", "tryon-gen", "prompt"),
          edge("e-tryon-garment", "garment", "tryon-gen", "reference"),
          edge("e-tryon-model", "model", "tryon-gen", "reference"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-pose",
      name: "摆拍 Pose",
      description: "上传服装或模特图，描述 Pose 与镜头要求，生成摆拍效果",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("pose-requirement", 0, -170, "Pose/镜头要求", "【要求】描述目标 Pose、镜头与构图"),
          imageNode("source", 0, 20, "服装或模特图"),
          imageGeneratorNode("pose-gen", 380, -75, "摆拍生成", EDIT_VARIANT),
        ],
        edges: [
          edge("e-pose-prompt", "pose-requirement", "pose-gen", "prompt"),
          edge("e-pose-ref", "source", "pose-gen", "reference"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-background-swap",
      name: "更换背景",
      description: "上传人物或产品图，描述目标背景，生成换背景效果",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("background-requirement", 0, -170, "目标背景描述", "【要求】描述目标背景"),
          imageNode("subject", 0, 20, "人物或产品图"),
          imageGeneratorNode("background-gen", 380, -75, "换背景生成", EDIT_VARIANT),
        ],
        edges: [
          edge("e-background-prompt", "background-requirement", "background-gen", "prompt"),
          edge("e-background-ref", "subject", "background-gen", "reference"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-lookbook",
      name: "LookBook",
      description: "上传服装图，列出风格与场景清单，生成多组 LookBook",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("lookbook-requirement", 0, -170, "风格/场景清单", "【要求】列出风格与场景清单"),
          imageNode("garment", 0, 20, "服装图"),
          imageGeneratorNode("lookbook-gen", 380, -75, "LookBook 生成", EDIT_VARIANT, { batchSize: 2 }),
        ],
        edges: [
          edge("e-lookbook-prompt", "lookbook-requirement", "lookbook-gen", "prompt"),
          edge("e-lookbook-ref", "garment", "lookbook-gen", "reference"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-digital-model",
      name: "数字模特",
      description: "上传服装图，描述数字模特风格，生成数字模特上身效果",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("model-requirement", 0, -170, "数字模特风格要求", "【要求】描述数字模特的风格与外观要求"),
          imageNode("garment", 0, 20, "服装图"),
          imageGeneratorNode("model-gen", 380, -75, "数字模特生成", EDIT_VARIANT),
        ],
        edges: [
          edge("e-model-prompt", "model-requirement", "model-gen", "prompt"),
          edge("e-model-ref", "garment", "model-gen", "reference"),
        ],
      },
    },
    // ---------- 服装设计（8 个）----------
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-print-extract",
      name: "印花提取",
      description: "上传带印花服装，描述提取要求，平铺提取印花图案",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("extract-requirement", 0, -170, "提取要求", "【要求】描述印花提取的范围与整理要求"),
          imageNode("garment", 0, 20, "带印花服装"),
          imageGeneratorNode("extract-gen", 380, -75, "印花提取", EDIT_VARIANT),
        ],
        edges: [
          edge("e-extract-prompt", "extract-requirement", "extract-gen", "prompt"),
          edge("e-extract-ref", "garment", "extract-gen", "reference"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-print-mutate",
      name: "印花裂变",
      description: "上传印花图，描述裂变方向与数量，生成风格一致的新变体",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("mutate-requirement", 0, -170, "裂变方向/数量", "【要求】描述印花裂变的方向与数量"),
          imageNode("print", 0, 20, "印花图"),
          imageGeneratorNode("mutate-gen", 380, -75, "印花裂变", EDIT_VARIANT, { batchSize: 2 }),
        ],
        edges: [
          edge("e-mutate-prompt", "mutate-requirement", "mutate-gen", "prompt"),
          edge("e-mutate-ref", "print", "mutate-gen", "reference"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-garment-recolor",
      name: "服装换色",
      description: "上传服装图，列出目标配色，生成换色效果",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("recolor-requirement", 0, -170, "目标配色清单", "【要求】列出目标配色"),
          imageNode("garment", 0, 20, "服装图"),
          imageGeneratorNode("recolor-gen", 380, -75, "换色生成", EDIT_VARIANT),
        ],
        edges: [
          edge("e-recolor-prompt", "recolor-requirement", "recolor-gen", "prompt"),
          edge("e-recolor-ref", "garment", "recolor-gen", "reference"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-fabric-swap",
      name: "面料更换",
      description: "上传服装图与面料参考，描述面料说明，生成面料更换合成",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("fabric-requirement", 0, -170, "面料说明", "【要求】描述目标面料的质感与说明"),
          imageNode("garment", 0, 20, "服装图"),
          imageNode("fabric", 0, 210, "面料参考"),
          imageGeneratorNode("fabric-gen", 380, 20, "面料更换合成", EDIT_VARIANT),
        ],
        edges: [
          edge("e-fabric-prompt", "fabric-requirement", "fabric-gen", "prompt"),
          edge("e-fabric-garment", "garment", "fabric-gen", "reference"),
          edge("e-fabric-ref", "fabric", "fabric-gen", "reference"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-sketch-to-garment",
      name: "线稿图到服装",
      description: "上传线稿，描述面料、色彩与风格，生成服装渲染效果",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("sketch-requirement", 0, -170, "面料/色彩/风格", "【要求】描述面料、色彩与风格"),
          imageNode("sketch", 0, 20, "线稿"),
          imageGeneratorNode("sketch-gen", 380, -75, "线稿渲染", EDIT_VARIANT),
        ],
        edges: [
          edge("e-sketch-prompt", "sketch-requirement", "sketch-gen", "prompt"),
          edge("e-sketch-ref", "sketch", "sketch-gen", "reference"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-ai-restyle",
      name: "AI 改款",
      description: "上传服装图，描述改款指令，生成改款效果",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("restyle-requirement", 0, -170, "改款指令", "【要求】描述改款方向（领型、袖长、廓形等）"),
          imageNode("garment", 0, 20, "服装图"),
          imageGeneratorNode("restyle-gen", 380, -75, "改款生成", EDIT_VARIANT),
        ],
        edges: [
          edge("e-restyle-prompt", "restyle-requirement", "restyle-gen", "prompt"),
          edge("e-restyle-ref", "garment", "restyle-gen", "reference"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-outfit-recommend",
      name: "穿搭推荐",
      description: "描述场合、风格与身材，纯文生图生成穿搭推荐",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("outfit-requirement", 0, -170, "场合/风格/身材", "【要求】描述场合、风格与身材"),
          imageGeneratorNode("outfit-gen", 380, -170, "穿搭推荐", GENERATE_VARIANT),
        ],
        edges: [
          edge("e-outfit-prompt", "outfit-requirement", "outfit-gen", "prompt"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-person-to-mannequin",
      name: "真人转人台",
      description: "上传真人着装图，描述人台要求，生成人台展示效果",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("mannequin-requirement", 0, -170, "人台要求", "【要求】描述人台与立裁要求"),
          imageNode("person", 0, 20, "真人着装图"),
          imageGeneratorNode("mannequin-gen", 380, -75, "转人台生成", EDIT_VARIANT),
        ],
        edges: [
          edge("e-mannequin-prompt", "mannequin-requirement", "mannequin-gen", "prompt"),
          edge("e-mannequin-ref", "person", "mannequin-gen", "reference"),
        ],
      },
    },
    // ---------- 视频生成（2 个，本期）----------
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-video-runway",
      name: "服装走秀",
      description: "上传服装或模特图，描述走秀、镜头与场景，生成走秀视频",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("runway-requirement", 0, -170, "走秀/镜头/场景", "【要求】描述走秀动作、镜头与场景"),
          imageNode("source", 0, 20, "服装或模特图"),
          videoGeneratorNode("runway-gen", 380, -75, "走秀视频", VIDEO_VARIANT),
        ],
        edges: [
          edge("e-runway-prompt", "runway-requirement", "runway-gen", "prompt"),
          edge("e-runway-first-frame", "source", "runway-gen", "first-frame"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-video-xhs",
      name: "小红书视频",
      description: "上传主图，描述小红书脚本，生成小红书视频",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("xhs-requirement", 0, -170, "小红书脚本", "【要求】描述小红书视频脚本"),
          imageNode("main-image", 0, 20, "主图"),
          videoGeneratorNode("xhs-gen", 380, -75, "小红书视频", VIDEO_VARIANT),
        ],
        edges: [
          edge("e-xhs-prompt", "xhs-requirement", "xhs-gen", "prompt"),
          edge("e-xhs-first-frame", "main-image", "xhs-gen", "first-frame"),
        ],
      },
    },
  ];
}

function builtinTemplateIsReadable(filePath: string): boolean {
  try {
    readTemplateFile(filePath);
    return true;
  } catch {
    return false;
  }
}

/** 启动时补齐新增模板；保留可读旧版本，并用当前定义修复损坏或不兼容的内置文件。 */
export function ensureBuiltinTemplates(): void {
  // v8 重写后退役的 v7 内置模板文件：id 已不存在于 builtinTemplates()，结构也不兼容
  // （旧 image 节点五合一 vs v8 输入/生成分层），必须显式删除，避免 GET /api/templates
  // 继续返回已淘汰的旧模板。它们是部署内置数据，不属于用户模板。
  const retiredIds = [
    "builtin-style-transfer",
    "builtin-text-to-image",
    "builtin-sketch-recolor",
    "builtin-sketch-upscale",
    "builtin-text-recolor",
    "builtin-person-scene-transfer",
    "builtin-pattern-style-transfer",
  ] as const;
  for (const retiredId of retiredIds) {
    fs.rmSync(templatePath(retiredId), { force: true });
  }
  for (const tpl of builtinTemplates()) {
    const filePath = templatePath(tpl.id);
    if (!fs.existsSync(filePath) || !builtinTemplateIsReadable(filePath)) {
      writeJsonAtomicSync(filePath, tpl);
    }
  }
}

ensureBuiltinTemplates();

function readTemplates(): WorkflowTemplate[] {
  const dir = templatesDir();
  const list: WorkflowTemplate[] = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    try {
      list.push(readTemplateFile(path.join(dir, f)));
    } catch {
      // 跳过损坏文件
    }
  }
  return list;
}

function readTemplateFile(filePath: string): WorkflowTemplate {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Record<string, unknown>;
  const isLegacyVersion = raw.schemaVersion === undefined
    || raw.schemaVersion === 0
    || raw.schemaVersion === 1
    || raw.schemaVersion === 2
    || raw.schemaVersion === 3
    || raw.schemaVersion === 4
    || raw.schemaVersion === 5;
  if (!isLegacyVersion && raw.schemaVersion !== WORKFLOW_SCHEMA_VERSION) {
    throw new WorkflowValidationError(`unsupported template schemaVersion: ${String(raw.schemaVersion)}`);
  }
  const flow = validateAndMigrateFlow(raw.flow);
  if (
    typeof raw.id !== "string" || !raw.id ||
    typeof raw.name !== "string" || !raw.name ||
    typeof raw.description !== "string" ||
    typeof raw.createdAt !== "string" || !Number.isFinite(Date.parse(raw.createdAt))
  ) {
    throw new WorkflowValidationError("invalid template metadata");
  }
  if (raw.thumbnail !== undefined && !isLocalImageReference(raw.thumbnail)) {
    throw new WorkflowValidationError("template thumbnail must be a local /api/files image reference");
  }
  return { ...raw, schemaVersion: WORKFLOW_SCHEMA_VERSION, flow } as unknown as WorkflowTemplate;
}

function templateForResponse(template: WorkflowTemplate): WorkflowTemplate {
  return template.thumbnail
    ? { ...template, thumbnail: thumbnailUrlForImage(template.thumbnail) }
    : template;
}

templatesRouter.get("/", (_req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    res.json(readTemplates().map(templateForResponse));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

templatesRouter.get("/:id", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const filePath = templatePath(req.params.id);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "template not found" });
    return;
  }
  try {
    res.json(templateForResponse(readTemplateFile(filePath)));
  } catch (err) {
    res.status(err instanceof WorkflowValidationError ? 422 : 500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
