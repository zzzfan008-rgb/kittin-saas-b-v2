/**
 * `✨ 帮我补全` 按钮路由（提示词改写层）。
 *
 * 契约：docs/design/2026-10-12-prompt-rewrite/plan.md §2.2 / §2.3。
 * - POST /api/text/rewrite，挂 /api 下 → 自动走全局 requireAuth + requirePasswordChanged。
 * - 入参 { text, nodeId?, projectId }；只读项目 403；入参非法 400。
 * - 成功 200 { rewritten: string }；**改写失败降级 200 { rewritten: null, skipped: true }**
 *   （改写失败不是请求失败，前端拿 null 保持原文，绝不 5xx 阻断）。
 * - 服务端按 nodeId 反查下游生成节点 kind/mode/family，**不信任客户端传参**（§2.2/§9）。
 *   反查不到 → 默认上下文（kind=image 通用服装改写）。
 * - ✨ 按钮是用户手动触发，不受运行时自动改写的 REWRITE_ENABLED_FAMILIES 白名单限制（§2.3）。
 */
import { Router, type Response } from "express";
import { requestUser } from "../lib/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { queryOne } from "../lib/database";
import { validateAndMigrateFlow } from "../lib/workflowSchema";
import { rewriteUserPrompt, type RewriteContext } from "../lib/textRewriter";
import { MAX_TEXT_LENGTH } from "../engine/runner";
import type { NodeKind } from "../../src/types/workflow";
import type { ImageOperationMode } from "../../src/types/imageOperations";

const SAFE_PROJECT_ID = /^[A-Za-z0-9_-]{1,64}$/;
const SAFE_NODE_ID = /^[A-Za-z0-9_-]{1,128}$/;
const GENERATOR_KINDS = new Set(["image-generator", "video-generator"]);
const IMAGE_OPERATION_MODES = new Set(["generate", "edit", "mask-edit"]);

interface ResolvedGenerator {
  kind: "image-generator" | "video-generator";
  mode: ImageOperationMode;
  familyId?: string;
}

interface RawNode {
  id?: unknown;
  type?: unknown;
  data?: unknown;
}
interface RawEdge {
  source?: unknown;
  target?: unknown;
  targetHandle?: unknown;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

/**
 * 按 nodeId 反查该 text 节点经 prompt 出边指向的下游生成节点，取 kind + operationMode + familyId。
 * 服务端运行时守卫读 raw，不 import 前端组件类型（§5 跨域字段纪律）。
 * 找不到节点 / 非 text / 无 prompt 下游生成节点 → undefined（调用方用默认上下文）。
 */
export function resolveDownstreamGenerator(
  flow: ReturnType<typeof validateAndMigrateFlow>,
  nodeId: string | undefined,
): ResolvedGenerator | undefined {
  if (!nodeId) return undefined;
  const textNode = flow.nodes.find((node) => node.id === nodeId);
  if (!textNode || textNode.type !== "text") return undefined;

  const promptEdges = flow.edges.filter(
    (edge: RawEdge) =>
      edge.source === nodeId &&
      (edge.targetHandle === "prompt" || edge.targetHandle === undefined),
  );
  for (const edge of promptEdges) {
    const target = flow.nodes.find((node) => node.id === (edge as RawEdge).target);
    if (!target || !GENERATOR_KINDS.has(target.type)) continue;
    const data = asRecord(target.data) ?? {};
    const rawMode = data.operationMode;
    const mode: ImageOperationMode =
      typeof rawMode === "string" && IMAGE_OPERATION_MODES.has(rawMode)
        ? rawMode as ImageOperationMode
        : "generate";
    // familyId：v9 生成节点的模板来源族字段（schema 已校验、快照投影落盘）。
    // 只读 v9 正式字段；promptFamilyId 是 v7 死字段，运行时数据里不会再有（C8 豁免面外禁止引用）。
    const rawFamily = data.familyId;
    const familyId = typeof rawFamily === "string" && rawFamily.trim() !== "" ? rawFamily : undefined;
    return { kind: target.type as "image-generator" | "video-generator", mode, ...(familyId ? { familyId } : {}) };
  }
  return undefined;
}

export interface TextRewriteRouterDeps {
  /** 测试注入改写核心（避免打真实文本通道）；缺省 rewriteUserPrompt。 */
  rewrite?: typeof rewriteUserPrompt;
}

export function createTextRewriteRouter(deps: TextRewriteRouterDeps = {}): Router {
  const router = Router();

  router.post("/rewrite", asyncHandler(async (req, res: Response) => {
    const user = requestUser(req);
    const body = asRecord(req.body) ?? {};
    const text = body.text;
    const projectId = body.projectId;
    const nodeId = typeof body.nodeId === "string" ? body.nodeId : undefined;

    // ---- 入参校验（400）----
    if (
      typeof text !== "string" ||
      text.trim() === "" ||
      text.length > MAX_TEXT_LENGTH
    ) {
      res.status(400).json({ error: "text must be a non-empty string at most 20000 characters", code: "invalid_request" });
      return;
    }
    if (typeof projectId !== "string" || !SAFE_PROJECT_ID.test(projectId)) {
      res.status(400).json({ error: "projectId is required", code: "invalid_request" });
      return;
    }
    if (nodeId !== undefined && !SAFE_NODE_ID.test(nodeId)) {
      res.status(400).json({ error: "nodeId is invalid", code: "invalid_request" });
      return;
    }

    // ---- 项目归属 / 只读（403）----
    const project = await queryOne<{ owner_id: string; flow_json: string }>(`
      SELECT owner_id, flow_json FROM projects
      WHERE id = $1 AND deleted_at IS NULL AND lifecycle = 'saved'
    `, [projectId]);
    if (!project) {
      res.status(404).json({ error: "project not found" });
      return;
    }
    if (project.owner_id !== user.id) {
      // 只读 = 非 owner（admin 对他人项目同样只读，见 projects.ts readOnly 口径）。改写会写回 text 节点，拒绝。
      res.status(403).json({ error: "只读项目不能改写提示词" });
      return;
    }

    // ---- 服务端反查下游生成节点上下文（不信任客户端）----
    let context: RewriteContext = { kind: "image-generator" as NodeKind, mode: "generate" as ImageOperationMode };
    try {
      const flow = validateAndMigrateFlow(JSON.parse(project.flow_json));
      const downstream = resolveDownstreamGenerator(flow, nodeId);
      if (downstream) context = { kind: downstream.kind, mode: downstream.mode, ...(downstream.familyId ? { familyId: downstream.familyId } : {}) };
    } catch {
      // flow 损坏不阻断改写：回退默认上下文（fail-closed 精神，改写是增强不是必经）。
    }

    // ---- 改写；任何失败降级 200 + null（绝不 5xx 阻断）。每次请求解析注入点（测试可替换）。----
    // HTTP 边界自持 fail-closed：rewriteUserPrompt 内部已吞错，但注入点（deps.rewrite/测试替身）
    // 可能 reject——此处再兜一层，保证路由头「绝不 5xx」的承诺不依赖被调方实现。
    const rewrite = deps.rewrite ?? rewriteUserPrompt;
    let outcome;
    try {
      outcome = await rewrite(text, context);
    } catch {
      res.json({ rewritten: null, skipped: true });
      return;
    }
    if (outcome.rewritten) {
      res.json({ rewritten: outcome.text });
      return;
    }
    res.json({ rewritten: null, skipped: true });
  }));

  return router;
}
