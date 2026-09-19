/**
 * 工作流模板（JSON 文件存储）：
 *   GET    /api/templates      → WorkflowTemplate[]（内置在前，用户模板按 createdAt 倒序）
 *   GET    /api/templates/:id  → 单个模板
 *   POST   /api/templates      { name, description?, thumbnail?, flow } → { ok, id }
 *   DELETE /api/templates/:id  → 删除用户模板；内置模板返回 403
 * 内置模板存 data/templates/builtin/（启动时增量补齐），用户模板存 data/templates/user/
 */
import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { config } from "../config";
import { writeJsonAtomicSync } from "../lib/atomicJson";
import { validateAndMigrateFlow, WorkflowValidationError } from "../lib/workflowSchema";
import { isLocalImageReference } from "../lib/imageValidation";
import { thumbnailUrlForImage } from "../lib/fileStore";
import { requestUser } from "../lib/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { transaction } from "../lib/database";
import { lockActiveOwner, lockActiveOwnerMutation } from "../lib/ownerMutation";
import { purgeExpiredUserTemplates } from "../lib/userTemplateLifecycle";
import {
  WORKFLOW_SCHEMA_VERSION,
  type PersistedWorkflowEdge,
  type PersistedWorkflowNode,
  type WorkflowTemplate,
} from "../../src/types/workflow";
import {
  DEFAULT_GENERATION_MODEL_ID,
  defaultImageModelOptions,
} from "../../src/types/imageModels";

export const templatesRouter = Router();

interface StoredWorkflowTemplate extends WorkflowTemplate {
  deletedAt?: string;
  purgeAfter?: string;
}

function templatesDir(sub: "builtin" | "user"): string {
  const dir = path.join(config.dataDir(), "templates", sub);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function templatePath(sub: "builtin" | "user", id: string): string {
  return path.join(templatesDir(sub), `${path.basename(id)}.json`);
}

// ---------- 内置模板（v7 三基础节点；data 默认值见 contracts/template-format.md §1）----------
const BUILTIN_CREATED_AT = "2026-08-05T00:00:00.000Z";
// 六族功能 → 新变体清单归 P2-d 目录重写；此处先落到当前目录已注册的变体
// （generate/edit 族），P2-d 重写目录时按 prompt-variant-schema.md §3 一一替换。
const GENERATE_VARIANT = "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1";
const EDIT_VARIANT = "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1";

function textNode(id: string, x: number, y: number, label: string, text: string): PersistedWorkflowNode {
  return { id, type: "text", position: { x, y }, data: { kind: "text", label, status: "idle", text } };
}

function imageNode(
  id: string,
  x: number,
  y: number,
  label: string,
  variantId: string,
  aspectRatio: string,
): PersistedWorkflowNode {
  return {
    id,
    type: "image",
    position: { x, y },
    data: {
      kind: "image",
      label,
      status: "idle",
      promptVariantId: variantId,
      modelId: DEFAULT_GENERATION_MODEL_ID,
      modelOptions: defaultImageModelOptions(DEFAULT_GENERATION_MODEL_ID, aspectRatio),
      aspectRatio,
      batchSize: 1,
      outputImages: [],
    },
  };
}

function edge(id: string, source: string, target: string, targetHandle?: "prompt" | "reference"): PersistedWorkflowEdge {
  return { id, source, target, ...(targetHandle ? { targetHandle } : {}), data: {} };
}

function builtinTemplates(): WorkflowTemplate[] {
  return [
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-text-to-image",
      name: "文生图（服装设计）",
      description: "输入款式、面料、色彩、模特、场景与摄影要求，直接生成服装设计效果图",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode(
            "prompt-1", 0, 0, "提示词",
            "设计一套现代都市女装：廓形利落的短款西装搭配高腰阔腿长裤，使用有细腻垂坠感的深灰羊毛混纺面料；年轻亚洲女模特全身站姿，正面略微侧身，服装结构、面料纹理和缝线细节清晰；极简浅灰摄影棚背景，柔和侧光，高级时装品牌 Lookbook 风格，写实摄影，高质感，画面干净，无文字、无水印。",
          ),
          imageNode("gen-1", 380, 0, "文生图", GENERATE_VARIANT, "3:4"),
        ],
        edges: [edge("e1", "prompt-1", "gen-1", "prompt")],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-sketch-recolor",
      name: "草图→换色",
      description: "上传草图，说明配色方案，生成多配色效果图",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("sketch-note", -380, -170, "草图说明", "保持草图构图、款式与主体不变"),
          imageNode("sketch", 0, -170, "草图上传", EDIT_VARIANT, "3:4"),
          textNode("recolor-note", 0, 190, "换色说明", "将服装颜色替换为：奶白 + 驼色，保持版型与细节不变"),
          imageNode("recolor", 380, 0, "换色", EDIT_VARIANT, "3:4"),
        ],
        edges: [
          edge("e-sketch-prompt", "sketch-note", "sketch", "prompt"),
          edge("e-sketch-ref", "sketch", "recolor", "reference"),
          edge("e-recolor-prompt", "recolor-note", "recolor", "prompt"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-sketch-upscale",
      name: "草图→高清放大",
      description: "上传草图，放大至超高清精修细节",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("upload-note", -380, 0, "上传说明", "（可空）保持原构图"),
          imageNode("upload", 0, 0, "图片上传", EDIT_VARIANT, "3:4"),
          textNode("upscale-note", 380, -170, "放大说明", "放大为超高清版本，增强面料纹理、走线与边缘细节，保持构图、色彩和光影不变"),
          imageNode("upscale", 760, 0, "高清放大", EDIT_VARIANT, "3:4"),
        ],
        edges: [
          edge("e-upload-prompt", "upload-note", "upload", "prompt"),
          edge("e-upload-ref", "upload", "upscale", "reference"),
          edge("e-upscale-prompt", "upscale-note", "upscale", "prompt"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-text-recolor",
      name: "文生款式→换色",
      description: "纯提示词文生款式效果图，再按配色说明换色",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("design", 0, -170, "款式描述", "设计一款简约通勤风女装连衣裙，正面全身效果图，浅灰纯色背景"),
          imageNode("gen", 380, -170, "文生款式", GENERATE_VARIANT, "3:4"),
          textNode("recolor", 380, 190, "换色说明", "将连衣裙颜色替换为：藏青 + 酒红，保持版型与细节不变"),
          imageNode("recolor-out", 760, 0, "换色", EDIT_VARIANT, "3:4"),
        ],
        edges: [
          edge("e-design", "design", "gen", "prompt"),
          edge("e-gen-ref", "gen", "recolor-out", "reference"),
          edge("e-recolor", "recolor", "recolor-out", "prompt"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-person-scene-transfer",
      name: "人物场景迁移",
      description: "上传图1人物与图2场景，将人物保真迁移到场景中并匹配座椅、姿态、光影与透视",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("subject-note", -380, -170, "人物说明", "保持人物身份、发型、体型、服装不变"),
          imageNode("subject", 0, -170, "图1 · 人物主体", EDIT_VARIANT, "3:4"),
          textNode("scene-note", -380, 190, "场景说明", "保持场景、椅子、构图与空间陈设不变"),
          imageNode("scene", 0, 190, "图2 · 场景背景", EDIT_VARIANT, "3:4"),
          textNode("transfer-note", 380, 0, "合成说明", "将图1中的同一人物完整迁移到图2的背景中，并让人物自然坐在椅子上，保持身份与场景不变"),
          imageNode("transfer", 760, 0, "人物场景迁移", EDIT_VARIANT, "3:4"),
        ],
        edges: [
          edge("e-subject-prompt", "subject-note", "subject", "prompt"),
          edge("e-scene-prompt", "scene-note", "scene", "prompt"),
          edge("e-subject-ref", "subject", "transfer", "reference"),
          edge("e-scene-ref", "scene", "transfer", "reference"),
          edge("e-transfer-prompt", "transfer-note", "transfer", "prompt"),
        ],
      },
    },
    {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id: "builtin-pattern-style-transfer",
      name: "图案风格迁移",
      description: "保留图1的主题与构图，使用图2的材料、工艺、色彩和视觉语言重新演绎",
      builtIn: true,
      createdAt: BUILTIN_CREATED_AT,
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [
          textNode("pattern-note", -380, -170, "图案说明", "保持图案主题与构图"),
          imageNode("pattern", 0, -170, "图1 · 原始图案", EDIT_VARIANT, "3:4"),
          textNode("style-note", -380, 190, "风格说明", "保持风格参考材料与工艺"),
          imageNode("style", 0, 190, "图2 · 风格参考", EDIT_VARIANT, "3:4"),
          textNode("transfer-note", 380, 0, "迁移说明", "保留图1的主题元素与构图，重新演绎为图2的面料纹理、手工工艺、笔触、配色和质感"),
          imageNode("transfer", 760, 0, "风格迁移", EDIT_VARIANT, "3:4"),
        ],
        edges: [
          edge("e-pattern-prompt", "pattern-note", "pattern", "prompt"),
          edge("e-style-prompt", "style-note", "style", "prompt"),
          edge("e-pattern-ref", "pattern", "transfer", "reference"),
          edge("e-style-ref", "style", "transfer", "reference"),
          edge("e-transfer-prompt", "transfer-note", "transfer", "prompt"),
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
  // 旧版模板已拆分为两个明确模板；它是部署内置数据，不属于用户模板。
  fs.rmSync(templatePath("builtin", "builtin-style-transfer"), { force: true });
  for (const tpl of builtinTemplates()) {
    const filePath = templatePath("builtin", tpl.id);
    if (!fs.existsSync(filePath) || !builtinTemplateIsReadable(filePath)) {
      writeJsonAtomicSync(filePath, tpl);
    }
  }
}

ensureBuiltinTemplates();

function readTemplates(sub: "builtin" | "user"): StoredWorkflowTemplate[] {
  if (sub === "user") purgeExpiredUserTemplates();
  const dir = templatesDir(sub);
  const list: StoredWorkflowTemplate[] = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    try {
      const template = readTemplateFile(path.join(dir, f));
      if (sub === "user" && template.deletedAt) continue;
      list.push(template);
    } catch {
      // 跳过损坏文件
    }
  }
  return list;
}

function readTemplateFile(filePath: string): StoredWorkflowTemplate {
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
  if (raw.ownerId !== undefined && (typeof raw.ownerId !== "string" || raw.ownerId.length === 0)) {
    throw new WorkflowValidationError("invalid template owner");
  }
  for (const key of ["deletedAt", "purgeAfter"] as const) {
    if (raw[key] !== undefined && (typeof raw[key] !== "string" || !Number.isFinite(Date.parse(raw[key])))) {
      throw new WorkflowValidationError(`invalid template ${key}`);
    }
  }
  return { ...raw, schemaVersion: WORKFLOW_SCHEMA_VERSION, flow } as unknown as StoredWorkflowTemplate;
}

function templateForResponse(template: StoredWorkflowTemplate): WorkflowTemplate {
  const { deletedAt: _deletedAt, purgeAfter: _purgeAfter, ...visible } = template;
  return visible.thumbnail
    ? { ...visible, thumbnail: thumbnailUrlForImage(visible.thumbnail) }
    : visible;
}

templatesRouter.get("/", (req, res) => {
  try {
    const currentUser = requestUser(req);
    res.setHeader("Cache-Control", "no-store");
    const builtin = readTemplates("builtin");
    const user = readTemplates("user")
      .filter((template) => template.ownerId === currentUser.id || currentUser.role === "admin")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json([...builtin, ...user].map(templateForResponse));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

templatesRouter.get("/:id", (req, res) => {
  const currentUser = requestUser(req);
  res.setHeader("Cache-Control", "no-store");
  const id = req.params.id;
  const userFilePath = templatePath("user", id);
  const isUserTemplate = fs.existsSync(userFilePath);
  const filePath = isUserTemplate ? userFilePath : templatePath("builtin", id);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "template not found" });
    return;
  }
  try {
    const template = readTemplateFile(filePath);
    if (isUserTemplate && template.deletedAt) {
      res.status(404).json({ error: "template not found" });
      return;
    }
    if (isUserTemplate && template.ownerId !== currentUser.id && currentUser.role !== "admin") {
      res.status(404).json({ error: "template not found" });
      return;
    }
    res.json(templateForResponse(template));
  } catch (err) {
    res.status(err instanceof WorkflowValidationError ? 422 : 500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

templatesRouter.post("/", asyncHandler(async (req, res) => {
  const currentUser = requestUser(req);
  const { name, description, thumbnail, flow } = req.body as {
    name?: string;
    description?: string;
    thumbnail?: string;
    flow?: unknown;
  };
  if (typeof name !== "string" || name.trim().length === 0 || name.length > 200 || flow === undefined) {
    res.status(400).json({ error: "name and flow are required" });
    return;
  }
  let createdFilePath: string | undefined;
  try {
    if (description !== undefined && typeof description !== "string") throw new WorkflowValidationError("description must be a string");
    if (thumbnail !== undefined && !isLocalImageReference(thumbnail)) {
      throw new WorkflowValidationError("thumbnail must be a local /api/files image reference");
    }
    const id = nanoid(10);
    const template: WorkflowTemplate = {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      id,
      ownerId: currentUser.id,
      name: name.trim(),
      description: description ?? "",
      ...(thumbnail ? { thumbnail } : {}),
      flow: validateAndMigrateFlow(flow),
      createdAt: new Date().toISOString(),
    };
    createdFilePath = templatePath("user", id);
    const created = await transaction(async (client) => {
      if (!await lockActiveOwner(client, currentUser.id)) return false;
      writeJsonAtomicSync(createdFilePath as string, template);
      return true;
    });
    if (!created) {
      res.status(409).json({ error: "账号状态已变化，请刷新后重试" });
      return;
    }
    res.json({ ok: true, id });
  } catch (err) {
    if (createdFilePath) fs.rmSync(createdFilePath, { force: true });
    res.status(err instanceof WorkflowValidationError ? 400 : 500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}));

templatesRouter.delete("/:id", asyncHandler(async (req, res) => {
  const currentUser = requestUser(req);
  const id = req.params.id;
  if (fs.existsSync(templatePath("builtin", id))) {
    res.status(403).json({ error: "builtin template cannot be deleted" });
    return;
  }
  const filePath = templatePath("user", id);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "template not found" });
    return;
  }
  let ownerId: string | undefined;
  try {
    ownerId = readTemplateFile(filePath).ownerId;
  } catch (err) {
    res.status(err instanceof WorkflowValidationError ? 422 : 500).json({ error: err instanceof Error ? err.message : String(err) });
    return;
  }
  if (!ownerId) {
    res.status(409).json({ error: "模板归属待迁移，请先重启服务" });
    return;
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const outcome = await transaction(async (client) => {
      if (!await lockActiveOwnerMutation(client, ownerId as string)) {
        return { status: "owner_unavailable" as const };
      }
      if (!fs.existsSync(filePath)) return { status: "not_found" as const };
      const template = readTemplateFile(filePath);
      if (template.ownerId !== ownerId) {
        return { status: "owner_changed" as const, ownerId: template.ownerId };
      }
      if (template.deletedAt) return { status: "not_found" as const };
      if (template.ownerId !== currentUser.id && currentUser.role !== "admin") {
        return { status: "not_found" as const };
      }
      fs.unlinkSync(filePath);
      return { status: "deleted" as const };
    });
    if (outcome.status === "owner_changed" && outcome.ownerId) {
      ownerId = outcome.ownerId;
      continue;
    }
    if (outcome.status === "owner_unavailable") {
      res.status(409).json({ error: "账号状态已变化，请刷新后重试" });
      return;
    }
    if (outcome.status === "not_found") {
      res.status(404).json({ error: "template not found" });
      return;
    }
    res.json({ ok: true });
    return;
  }
  res.status(409).json({ error: "模板归属正在变化，请刷新后重试" });
}));
