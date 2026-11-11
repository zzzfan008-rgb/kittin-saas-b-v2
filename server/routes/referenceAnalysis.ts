/**
 * `POST /api/reference-analysis/analyze` —— 运行前参考图智能解析。
 *
 * 契约要点：
 * - 入参只有 `{ projectId, nodeId }`：**不接受客户端传图或传文本**，全部由服务端从 DB
 *   的项目快照反查（延续 textRewrite「不信任客户端传参」的原则）。
 * - 归属与只读：非 owner 403（解析结果会被写进该项目的文本节点）。
 * - 不满足条件一律 `200 { skipped: true, reason }`，**绝不 5xx**：解析是增强，不能阻断出图。
 * - 只返回「补充段」；工作流协议由前端逐字保留，服务端永不返回。
 */
import { Router } from "express";
import type { Response } from "express";
import { requestUser } from "../lib/auth";
import { config } from "../config";
import { queryOne } from "../lib/database";
import { asyncHandler } from "../lib/asyncHandler";
import { validateAndMigrateFlow } from "../lib/workflowSchema";
import { buildExecutionPlan } from "../engine/dag";
import { analyzeReferences, type AnalyzedReferenceInput } from "../lib/referenceAnalyzer";
import { REWRITE_SUPPLEMENT_ANCHORS } from "../lib/textRewriter";

const SAFE_PROJECT_ID = /^[A-Za-z0-9_-]{1,64}$/;
const SAFE_NODE_ID = /^[A-Za-z0-9_-]{1,128}$/;

export interface ReferenceAnalysisRouterDeps {
  /** 测试注入：替换真实解析实现。 */
  analyze?: typeof analyzeReferences;
}

function skipped(res: Response, reason: string): void {
  res.json({ skipped: true, reason, analysis: null, matched: [], unmatched: [] });
}

export function createReferenceAnalysisRouter(deps: ReferenceAnalysisRouterDeps = {}): Router {
  const router = Router();
  const analyze = deps.analyze ?? analyzeReferences;

  router.post("/analyze", asyncHandler(async (req, res) => {
    const user = requestUser(req);
    const body = (req.body ?? {}) as { projectId?: unknown; nodeId?: unknown };
    const projectId = body.projectId;
    const nodeId = body.nodeId;

    if (typeof projectId !== "string" || !SAFE_PROJECT_ID.test(projectId)) {
      res.status(400).json({ error: "projectId is required", code: "invalid_request" });
      return;
    }
    if (typeof nodeId !== "string" || !SAFE_NODE_ID.test(nodeId)) {
      res.status(400).json({ error: "nodeId is required", code: "invalid_request" });
      return;
    }

    if (config.promptAnalysisDisabled()) {
      skipped(res, "disabled");
      return;
    }

    const project = await queryOne<{ owner_id: string; flow_json: string }>(`
      SELECT owner_id, flow_json FROM projects
      WHERE id = $1 AND deleted_at IS NULL AND lifecycle = 'saved'
    `, [projectId]);
    if (!project) {
      res.status(404).json({ error: "project not found" });
      return;
    }
    if (project.owner_id !== user.id) {
      res.status(403).json({ error: "只读项目不能解析参考图" });
      return;
    }

    let flow;
    try {
      flow = validateAndMigrateFlow(JSON.parse(project.flow_json));
    } catch {
      skipped(res, "invalid_flow");
      return;
    }

    const node = flow.nodes.find((item) => item.id === nodeId);
    if (!node || node.type !== "image-generator") {
      skipped(res, "not_generator");
      return;
    }
    const data = (node.data ?? {}) as Record<string, unknown>;
    if (data.analyzeReferences === false) {
      skipped(res, "switched_off");
      return;
    }

    let step;
    try {
      const plan = buildExecutionPlan(flow.nodes, flow.edges, {
        onlyNodeId: nodeId,
        includeDownstream: false,
      });
      step = plan.steps.find((item) => item.nodeId === nodeId);
    } catch {
      skipped(res, "plan_failed");
      return;
    }
    if (!step) {
      skipped(res, "no_step");
      return;
    }

    const inputTexts = Array.isArray(step.params.inputTexts)
      ? (step.params.inputTexts as unknown[]).filter((item): item is string => typeof item === "string")
      : [];
    const hasAnchor = inputTexts.some((text) =>
      REWRITE_SUPPLEMENT_ANCHORS.some((anchor) => text.includes(anchor)));
    if (!hasAnchor) {
      skipped(res, "no_anchor");
      return;
    }

    const references = (step.inputReferences ?? []).slice(0, 4);
    if (references.length === 0) {
      skipped(res, "no_references");
      return;
    }
    const labelOf = new Map(flow.nodes.map((item) => [item.id, String(item.data?.label ?? "")]));
    const inputs: AnalyzedReferenceInput[] = references.map((reference, index) => ({
      order: index + 1,
      imageRef: reference.imageRef,
      label: labelOf.get(reference.sourceNodeId ?? "") ?? "",
      ...(reference.sourceNodeId ? { sourceNodeId: reference.sourceNodeId } : {}),
    }));

    const outcome = await analyze(inputs);
    const summary = {
      modelId: outcome.modelId ?? null,
      analyzed: outcome.analyzedCount,
      unmatched: outcome.unmatched.length,
      failed: outcome.failed.length,
      elapsedMs: outcome.elapsedMs,
      result: outcome.analysis ? "ok" : (outcome.reason ?? "failed"),
    };
    if (outcome.analysis) {
      console.info("[reference-analysis]", JSON.stringify(summary));
    } else {
      console.warn("[reference-analysis]", JSON.stringify(summary));
    }

    res.json({
      analysis: outcome.analysis,
      matched: outcome.matched,
      unmatched: outcome.unmatched,
      failed: outcome.failed,
      analyzedCount: outcome.analyzedCount,
      droppedCount: outcome.droppedCount,
      elapsedMs: outcome.elapsedMs,
      ...(outcome.modelId ? { modelId: outcome.modelId } : {}),
      ...(outcome.analysis ? {} : { skipped: true, reason: outcome.reason ?? "failed" }),
    });
  }));

  return router;
}
