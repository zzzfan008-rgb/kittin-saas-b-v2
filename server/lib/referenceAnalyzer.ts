/**
 * 参考图解析：每张图 **单独一次请求、并发发出**，按角色使用专用提示词，
 * 产出可直接拼进生图提示词的补充段。
 *
 * 设计约束（2026-11-10 产品裁决）：
 * - 角色按 **图片节点名称** 匹配（`src/lib/referenceRole.ts` 唯一事实源），不按固定序号；
 * - 最多 4 张，超出只取前 4 张；
 * - 每张图一个独立请求，**并发**执行；单个请求内部按模型链顺序回退；
 * - 未识别的图不送模型，但在结果里逐张回报；
 * - 单图输出按角色设上限（服装 140 / 模特 110 / 姿态 90 / 场景 100 字），宁短勿杂；
 * - 本模块 **不抛异常**：失败返回 `analysis: null` + reason，由路由降级为 skipped；
 * - 只返回补充段，绝不返回工作流协议内容（协议由前端逐字保留）。
 */
import sharp from "sharp";
import { matchReferenceRole, type ReferenceRole } from "../../src/lib/referenceRole";
import { config } from "../config";
import { resolveToDataUrl } from "./fileStore";
import { withImageProcessingSlot } from "./imageProcessingLimit";
import { buildRoleUserPrompt, ROLE_PROMPTS } from "./referenceAnalysisPrompt";
import {
  createVisionChatCompletion,
  VisionChatError,
  type VisionContentPart,
  type VisionMessage,
} from "./visionChat";

/** 单次解析最多送的参考图数量（产品裁决：最多 4 张）。 */
export const MAX_ANALYZED_REFERENCES = 4;
/** 单张图长边上限与 JPEG 质量：q80 会让部分模型把清晰图判成「不可辨识」，固定 q92。 */
const MAX_EDGE = 1024;
const JPEG_QUALITY = 92;
/** 「不可辨识」出现次数超过该值视为没看清（单图单独判定）。 */
const MAX_UNREADABLE_HITS = 1;

export interface AnalyzedReferenceInput {
  /** 展示序号（1 起，对应画布「图N」）。 */
  order: number;
  imageRef: string;
  label: string;
  sourceNodeId?: string;
}

export interface MatchedReference {
  order: number;
  role: ReferenceRole;
  label: string;
  sourceNodeId?: string;
}

export interface UnmatchedReference {
  order: number;
  label: string;
}

export interface FailedReference {
  order: number;
  role: ReferenceRole;
  label: string;
  reason: string;
}

export interface ReferenceAnalysisOutcome {
  analysis: string | null;
  reason?: string;
  matched: MatchedReference[];
  unmatched: UnmatchedReference[];
  failed: FailedReference[];
  elapsedMs: number;
  modelId?: string;
  /** 实际送解析的图片张数（≤ MAX_ANALYZED_REFERENCES）。 */
  analyzedCount: number;
  /** 被 4 张上限丢弃的图片张数。 */
  droppedCount: number;
}

/** 按角色关键词识别参考图；返回前 N 张的匹配结果与未识别清单。 */
export function classifyReferences(inputs: readonly AnalyzedReferenceInput[]): {
  matched: Array<AnalyzedReferenceInput & { role: ReferenceRole }>;
  unmatched: UnmatchedReference[];
  droppedCount: number;
} {
  const limited = inputs.slice(0, MAX_ANALYZED_REFERENCES);
  const matched: Array<AnalyzedReferenceInput & { role: ReferenceRole }> = [];
  const unmatched: UnmatchedReference[] = [];
  for (const input of limited) {
    const role = matchReferenceRole(input.sourceNodeId ?? "", input.label);
    if (role) matched.push({ ...input, role });
    else unmatched.push({ order: input.order, label: input.label });
  }
  return { matched, unmatched, droppedCount: Math.max(0, inputs.length - limited.length) };
}

/** 清洗单图输出：去 Markdown/列表符、剔除协议词与夸大词、按角色限长。 */
export function sanitizeRoleAnalysis(raw: string, role: ReferenceRole): string {
  const spec = ROLE_PROMPTS[role];
  let text = raw.replace(/\r\n/g, "\n").trim();
  text = text.replace(/```[a-zA-Z]*\n?/g, "").replace(/```/g, "");
  text = text
    .split("\n")
    .map((line) => line.replace(/^\s{0,3}(#{1,6}\s*|[-*+•]\s+|\d+[.、)]\s+)/, "").trimEnd())
    .filter((line) => line.trim().length > 0)
    .join(" ");
  // 角色前缀（模型可能自作主张加「图1（服装）：」）由聚合层统一生成，这里剥掉
  text = text.replace(/^图\s*\d*\s*[（(]?\s*(服装|模特|姿态|场景)?\s*[）)]?\s*[:：]\s*/, "");
  const protocolWords = [
    /AI\s*换装/g,
    /不得跨图挪用/g,
    /输出画幅/g,
    /补充要求[:：]?/g,
    /参考图\s*\d*/g,
    /\b\d{1,2}\s*[:：]\s*\d{1,2}\b/g,
  ];
  for (const pattern of protocolWords) text = text.replace(pattern, "");
  text = text.replace(/(8K|4K|杰作|大师级|完美光线|超高清|大片感)/gi, "");
  text = text.replace(/[ \t]{2,}/g, " ").replace(/\s*\n\s*/g, " ").trim();
  if (text.length > spec.maxChars) {
    const cut = text.slice(0, spec.maxChars);
    const lastStop = Math.max(cut.lastIndexOf("。"), cut.lastIndexOf("；"), cut.lastIndexOf("，"));
    text = (lastStop > spec.maxChars * 0.6 ? cut.slice(0, lastStop + 1) : cut).trim();
  }
  return text;
}

/** 质量闸：内容太短或出现「不可辨识」→ 判为没读出内容。 */
export function isUsableRoleAnalysis(text: string, role: ReferenceRole): boolean {
  const compact = text.replace(/\s/g, "");
  if (compact.length < ROLE_PROMPTS[role].minChars) return false;
  return (text.match(/不可辨识/g) ?? []).length <= MAX_UNREADABLE_HITS;
}

async function toVisionDataUrl(imageRef: string): Promise<string | null> {
  try {
    return await withImageProcessingSlot(async () => {
      const dataUrl = resolveToDataUrl(imageRef);
      const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl);
      if (!match?.[2]) return null;
      const buffer = Buffer.from(match[3], "base64");
      const out = await sharp(buffer)
        .rotate()
        .flatten({ background: "#ffffff" })
        .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY })
        .toBuffer();
      return `data:image/jpeg;base64,${out.toString("base64")}`;
    });
  } catch {
    return null;
  }
}

function buildMessages(role: ReferenceRole, dataUrl: string): VisionMessage[] {
  const parts: VisionContentPart[] = [
    { type: "text", text: buildRoleUserPrompt(role) },
    { type: "image_url", image_url: { url: dataUrl } },
  ];
  return [
    { role: "system", content: ROLE_PROMPTS[role].systemPrompt },
    { role: "user", content: parts },
  ];
}

export interface AnalyzeReferencesOptions {
  /** 测试注入：替换视觉调用。 */
  complete?: typeof createVisionChatCompletion;
  /** 测试注入：模型链。 */
  models?: string[];
  now?: () => number;
}

type OneResult =
  | { ok: true; order: number; role: ReferenceRole; label: string; text: string; modelId: string }
  | { ok: false; order: number; role: ReferenceRole; label: string; reason: string };

/**
 * 单图解析：内部按模型链顺序回退（并发发生在图片之间，不在模型之间）。
 */
async function analyzeOneImage(
  item: MatchedReference & { dataUrl: string },
  args: {
    models: string[];
    deadline: number;
    perModelTimeout: number;
    complete: typeof createVisionChatCompletion;
    now: () => number;
  },
): Promise<OneResult> {
  let lastReason = "vision_unavailable";
  for (const modelId of args.models) {
    const remaining = args.deadline - args.now();
    if (remaining <= 2_000) {
      lastReason = "budget_exhausted";
      break;
    }
    try {
      const result = await args.complete({
        modelId,
        messages: buildMessages(item.role, item.dataUrl),
        maxTokens: 500,
        timeoutMs: Math.min(args.perModelTimeout, remaining),
      });
      const cleaned = sanitizeRoleAnalysis(result.content, item.role);
      if (!isUsableRoleAnalysis(cleaned, item.role)) {
        lastReason = "unusable_output";
        continue;
      }
      return { ok: true, order: item.order, role: item.role, label: item.label, text: cleaned, modelId: result.modelId };
    } catch (error) {
      lastReason = error instanceof VisionChatError ? error.code : "vision_error";
    }
  }
  return { ok: false, order: item.order, role: item.role, label: item.label, reason: lastReason };
}

/**
 * 主入口：并发解析各参考图。永不抛错。
 */
export async function analyzeReferences(
  inputs: readonly AnalyzedReferenceInput[],
  options: AnalyzeReferencesOptions = {},
): Promise<ReferenceAnalysisOutcome> {
  const now = options.now ?? Date.now;
  const startedAt = now();
  const { matched, unmatched, droppedCount } = classifyReferences(inputs);
  const base = {
    matched: matched.map(({ order, role, label, sourceNodeId }) => ({
      order, role, label, ...(sourceNodeId ? { sourceNodeId } : {}),
    })),
    unmatched,
    droppedCount,
    analyzedCount: matched.length,
  };

  if (matched.length === 0) {
    return { ...base, analysis: null, reason: "no_matched_references", failed: [], elapsedMs: now() - startedAt };
  }

  // 并发降采样（内部受图片处理并发上限约束）
  const preparedPairs = await Promise.all(
    matched.map(async (item) => ({ ...item, dataUrl: await toVisionDataUrl(item.imageRef) })),
  );
  const prepared = preparedPairs.filter(
    (item): item is typeof item & { dataUrl: string } => typeof item.dataUrl === "string",
  );
  if (prepared.length === 0) {
    return { ...base, analysis: null, reason: "no_readable_images", failed: [], elapsedMs: now() - startedAt };
  }

  const models = options.models ?? config.promptAnalysisModels();
  const deadline = startedAt + config.promptAnalysisTotalBudgetMs();
  const perModelTimeout = config.promptAnalysisTimeoutMs();
  const complete = options.complete ?? createVisionChatCompletion;

  // 关键：图片之间并发（每张图一个独立请求）
  const results = await Promise.all(
    prepared.map((item) => analyzeOneImage(item, { models, deadline, perModelTimeout, complete, now })),
  );

  const succeeded = results.filter((item): item is Extract<OneResult, { ok: true }> => item.ok);
  const failed: FailedReference[] = results
    .filter((item): item is Extract<OneResult, { ok: false }> => !item.ok)
    .map(({ order, role, label, reason }) => ({ order, role, label, reason }));

  if (succeeded.length === 0) {
    return {
      ...base,
      analysis: null,
      reason: failed[0]?.reason ?? "vision_unavailable",
      failed,
      elapsedMs: now() - startedAt,
    };
  }

  const analysis = succeeded
    .sort((a, b) => a.order - b.order)
    .map((item) => `图${item.order}（${item.role}）：${item.text}`)
    .join("\n");

  return {
    ...base,
    analysis,
    failed,
    modelId: succeeded[0]?.modelId,
    elapsedMs: now() - startedAt,
  };
}
