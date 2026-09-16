/**
 * 工作流执行：
 *   POST /api/run-plan            { clientRequestId, projectId, nodes, edges, onlyNodeId?, includeDownstream? }
 *                                   → 202 { runId, status }
 *                                   （事务入队后立即返回，由 PostgreSQL Worker 执行）
 *   GET  /api/run-plan/:id/events SSE 事件流（含重放，事件见 engine/runner.ts RunEvent）
 */
import { Router, type Request, type Response } from "express";
import { isDeepStrictEqual } from "node:util";
import {
  NODE_SPECS,
  WORKFLOW_SCHEMA_VERSION,
  type ExecutionPlan,
  type NodeExecution,
  type PersistedWorkflow,
  type PersistedWorkflowEdge,
} from "../../src/types/workflow";
import {
  assertPlanInputs,
  assertPromptRunAdmissions,
  buildExecutionPlan,
  DagError,
  PromptRunAdmissionError,
} from "../engine/dag";
import {
  promptRunAdmissionFailurePayload,
  promptRunReferenceSnapshotsFromGraph,
  type PromptRunAdmissionDecision,
} from "../../src/lib/promptRunAdmission";
import { getRunForUser, type RunEvent } from "../engine/runner";
import {
  ActiveRunLimitError,
  assertGenerationOwnerActive,
  CLIENT_REQUEST_ID_PATTERN,
  DURABLE_RUN_EVENT_BATCH_SIZE,
  enqueueGenerationRunInTransaction,
  EvaluationCaseConflictError,
  GenerationOwnerUnavailableError,
  GenerationRequestConflictError,
  getDurableRunForUser,
  readDurableRunEvents,
} from "../engine/runQueue";
import {
  validateAndMigrateFlow,
  WorkflowReferenceRoleValidationError,
  WorkflowValidationError,
} from "../lib/workflowSchema";
import { requestUser } from "../lib/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { queryOne, transaction } from "../lib/database";
import {
  assertNoRemoteImageReferencesAtAdmission,
  assertImageReferencesAccessible,
  imageReferenceAccessFailurePayload,
  type ImageReferenceAccessEvidence,
  ImageReferenceAccessError,
} from "../lib/imageReferenceAccess";
import {
  attachEvaluationRunPolicy,
  EvaluationRunPolicyError,
  parseEvaluationRunPolicy,
} from "../lib/evaluationRunPolicy";

export const runPlanRouter = Router();

function hasExactExecutionEdgeSemantics(
  submittedEdges: readonly unknown[],
  savedEdges: readonly PersistedWorkflowEdge[],
): boolean {
  return submittedEdges.length === savedEdges.length && submittedEdges.every((value, index) => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
    const submitted = value as Record<string, unknown>;
    const saved = savedEdges[index];
    return submitted.id === saved.id
      && submitted.source === saved.source
      && submitted.target === saved.target
      && (submitted.sourceHandle ?? null) === (saved.sourceHandle ?? null)
      && (submitted.targetHandle ?? null) === (saved.targetHandle ?? null);
  });
}

function referenceRoleIssueReason(
  error: WorkflowReferenceRoleValidationError,
  order: number,
): string {
  if (error.field === "data") return `references[${order}] must be an object`;
  if (error.field === "role") return `references[${order}].role must be a supported reference role`;
  if (error.issueKind === "missing") return "roleNeedsConfirmation is not false";
  return `references[${order}].roleNeedsConfirmation must be a boolean`;
}

function mapSubmittedReferenceRoleError(
  error: WorkflowReferenceRoleValidationError,
  submittedEdges: readonly unknown[],
  savedFlow: PersistedWorkflow,
  basePlan: ExecutionPlan,
): PromptRunAdmissionError {
  if (!hasExactExecutionEdgeSemantics(submittedEdges, savedFlow.edges)) throw error;

  const targetStep = basePlan.steps.find((step) => step.nodeId === error.targetNodeId);
  if (!targetStep || !NODE_SPECS[targetStep.kind].providerId) throw error;
  const savedEdge = savedFlow.edges[error.edgeIndex];
  if (
    !savedEdge
    || savedEdge.source !== error.sourceNodeId
    || savedEdge.target !== error.targetNodeId
  ) {
    throw error;
  }

  const before = promptRunReferenceSnapshotsFromGraph(
    savedFlow.nodes,
    savedFlow.edges.slice(0, error.edgeIndex),
    error.targetNodeId,
  );
  const through = promptRunReferenceSnapshotsFromGraph(
    savedFlow.nodes,
    savedFlow.edges.slice(0, error.edgeIndex + 1),
    error.targetNodeId,
  );
  const affectedReferences = through.slice(before.length);
  if (affectedReferences.length === 0) throw error;

  const unconfirmed = error.field === "roleNeedsConfirmation" && error.issueKind === "missing";
  const decision: PromptRunAdmissionDecision = {
    allowed: false,
    code: unconfirmed ? "reference-role-unconfirmed" : "reference-role-invalid",
    reason: unconfirmed ? "参考图角色尚未全部确认" : "参考图角色或顺序无效。",
    references: affectedReferences.map((reference) => ({
      order: reference.order,
      ...(reference.sourceNodeId ? { sourceNodeId: reference.sourceNodeId } : {}),
      reason: referenceRoleIssueReason(error, reference.order),
    })),
  };
  return new PromptRunAdmissionError(error.targetNodeId, decision);
}

export function requestedCountForStep(kind: string, params: Record<string, unknown>): number {
  return kind === "fabric-recolor"
    ? Math.max(1, Array.isArray(params.colors) ? params.colors.length : 1)
    : kind === "print-mutate"
      ? Math.max(1, Math.min(8, Number(params.count) || 4))
      : kind === "sketch-to-render" || kind === "ai-modify"
        ? Math.max(1, Math.min(8, Number(params.batchSize) || 1))
        : 1;
}

function plannedStepReferences(step: NodeExecution): ImageReferenceAccessEvidence[] {
  if (step.inputReferences?.length === step.inputImages.length) {
    return step.inputReferences.map((reference, order) => ({
      imageRef: step.inputImages[order],
      order,
      ...(reference.sourceNodeId ? { sourceNodeId: reference.sourceNodeId } : {}),
      targetNodeId: step.nodeId,
    }));
  }
  if (step.upstream?.length) {
    return step.upstream.flatMap((upstream) => upstream.images.map((imageRef) => ({
      imageRef,
      order: 0,
      sourceNodeId: upstream.nodeId,
      targetNodeId: step.nodeId,
    }))).map((reference, order) => ({ ...reference, order }));
  }
  return step.inputImages.map((imageRef, order) => ({
    imageRef,
    order,
    targetNodeId: step.nodeId,
  }));
}

/**
 * References that can actually be read before a Provider request in this run.
 * Static outputs are propagated through non-Provider nodes (notably `result`),
 * while every executing Provider contributes no static output because its
 * persisted snapshot will be replaced. This mirrors the runner's output-map
 * precedence instead of trusting a stale intermediate-node snapshot.
 */
export function staticImageReferencesForPlan(plan: ExecutionPlan): ImageReferenceAccessEvidence[] {
  const executingNodeIds = new Set(plan.steps.map((step) => step.nodeId));
  const staticOutputsByNode = new Map<string, Array<{ imageRef: string; order: number }>>();
  const references: ImageReferenceAccessEvidence[] = [];
  for (const step of plan.steps) {
    if (!NODE_SPECS[step.kind].providerId) {
      if (step.kind === "image-input") {
        staticOutputsByNode.set(
          step.nodeId,
          typeof step.params.imageUrl === "string"
            ? [{ imageRef: step.params.imageUrl, order: 0 }]
            : [],
        );
      } else if (step.kind === "result") {
        let offset = 0;
        const outputs: Array<{ imageRef: string; order: number }> = [];
        for (const upstream of step.upstream ?? []) {
          const upstreamOutputs = executingNodeIds.has(upstream.nodeId)
            ? staticOutputsByNode.get(upstream.nodeId) ?? []
            : upstream.images.map((imageRef, order) => ({ imageRef, order }));
          outputs.push(...upstreamOutputs.map((output) => ({
            imageRef: output.imageRef,
            order: offset + output.order,
          })));
          // Preserve planned slots occupied by dynamic outputs so a surviving
          // static reference keeps its request-relative order.
          offset += upstream.images.length;
        }
        staticOutputsByNode.set(step.nodeId, outputs);
      } else {
        staticOutputsByNode.set(step.nodeId, []);
      }
      continue;
    }

    const actualStaticInputs: ImageReferenceAccessEvidence[] = [];
    if (!step.upstream?.length) {
      // Keep the exported helper fail-closed for persisted/evaluation plan
      // shapes that carry canonical inputImages without an upstream snapshot.
      actualStaticInputs.push(...plannedStepReferences(step));
    } else {
      let offset = 0;
      for (const upstream of step.upstream) {
        const upstreamOutputs = executingNodeIds.has(upstream.nodeId)
          ? staticOutputsByNode.get(upstream.nodeId) ?? []
          : upstream.images.map((imageRef, order) => ({ imageRef, order }));
        actualStaticInputs.push(...upstreamOutputs.map((output) => ({
          imageRef: output.imageRef,
          order: offset + output.order,
          sourceNodeId: upstream.nodeId,
          targetNodeId: step.nodeId,
        })));
        offset += upstream.images.length;
      }
    }
    references.push(...actualStaticInputs);

    const plannedInputCount = plannedStepReferences(step).length;
    // 仅 fabric-recolor 会携带 fabricImageUrl：删除原先 `|| step.kind === "fabric-replace"`
    // 是行为等价的死代码清理。fabric-replace 不是受支持的节点 kind（不在运行时 NODE_SPECS
    // 中，TypeScript 亦以 TS2367 证明该比较恒为 false），上游校验会拒绝未知 kind；
    // 回归不变量见 tests/generation-kind-contract.test.ts。
    if (step.kind === "fabric-recolor" && typeof step.params.fabricImageUrl === "string") {
      references.push({
        imageRef: step.params.fabricImageUrl,
        order: plannedInputCount,
        sourceNodeId: step.nodeId,
        targetNodeId: step.nodeId,
      });
    }
    if (step.kind === "mask-redraw" && typeof step.params.mask === "string") {
      references.push({
        imageRef: step.params.mask,
        order: plannedInputCount,
        sourceNodeId: step.nodeId,
        targetNodeId: step.nodeId,
      });
    }
    staticOutputsByNode.set(step.nodeId, []);
  }
  return references;
}

runPlanRouter.post("/", asyncHandler(async (req, res) => {
  const { nodes, edges, onlyNodeId, includeDownstream, projectId, clientRequestId, evaluation } = req.body as {
    nodes?: unknown[];
    edges?: unknown[];
    onlyNodeId?: string;
    includeDownstream?: boolean;
    projectId?: string;
    clientRequestId?: string;
    evaluation?: unknown;
  };
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    res.status(400).json({ error: "nodes and edges arrays are required" });
    return;
  }
  if (onlyNodeId !== undefined && (typeof onlyNodeId !== "string" || !onlyNodeId.trim())) {
    res.status(400).json({ error: "onlyNodeId must be a non-empty string" });
    return;
  }
  if (includeDownstream !== undefined && typeof includeDownstream !== "boolean") {
    res.status(400).json({ error: "includeDownstream must be a boolean" });
    return;
  }
  if (typeof projectId !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(projectId)) {
    res.status(400).json({ error: "projectId is required" });
    return;
  }
  if (typeof clientRequestId !== "string" || !CLIENT_REQUEST_ID_PATTERN.test(clientRequestId)) {
    res.status(400).json({ error: "clientRequestId is required" });
    return;
  }
  try {
    const user = requestUser(req);
    const evaluationPolicy = parseEvaluationRunPolicy(evaluation, user);
    if (evaluationPolicy && !onlyNodeId) {
      throw new EvaluationRunPolicyError("真实评估必须明确 onlyNodeId，并且只执行唯一的付费节点", 400);
    }
    if (evaluationPolicy && includeDownstream === true) {
      throw new EvaluationRunPolicyError("真实评估不得执行下游节点；上游输入只使用已保存画布快照", 400);
    }
    const outcome = await transaction(async (client) => {
      // 与账号转移/删除统一 user → project → assets → files → run 的锁顺序。
      await assertGenerationOwnerActive(client, user.id);
      // 与入队处于同一事务并持有共享锁，避免项目/素材在授权后、入队前被并发替换。
      const project = await queryOne<{ owner_id: string; name: string; flow_json: string }>(`
        SELECT owner_id, name, flow_json FROM projects
        WHERE id = $1 AND deleted_at IS NULL AND lifecycle = 'saved'
        FOR SHARE
      `, [projectId], client);
      if (!project) return { status: "not_found" as const };
      if (project.owner_id !== user.id) return { status: "forbidden" as const };

      // 执行语义必须与刚保存的项目一致；实际入队始终使用数据库中的计划与项目名称。
      const flow = validateAndMigrateFlow(JSON.parse(project.flow_json));
      const planOptions = {
        onlyNodeId,
        includeDownstream: includeDownstream ?? false,
      };
      const basePlan = buildExecutionPlan(flow.nodes, flow.edges, planOptions);
      let submittedFlow: PersistedWorkflow;
      try {
        submittedFlow = validateAndMigrateFlow({
          schemaVersion: WORKFLOW_SCHEMA_VERSION,
          nodes,
          edges,
        });
      } catch (error) {
        if (error instanceof WorkflowReferenceRoleValidationError) {
          throw mapSubmittedReferenceRoleError(error, edges, flow, basePlan);
        }
        throw error;
      }
      const submittedPlan = buildExecutionPlan(submittedFlow.nodes, submittedFlow.edges, planOptions);
      if (
        !hasExactExecutionEdgeSemantics(submittedFlow.edges, flow.edges)
        || !isDeepStrictEqual(submittedPlan, basePlan)
      ) {
        return { status: "conflict" as const };
      }
      // 点击单节点默认只执行自己，避免无意触发整条下游产生额外费用。
      if (basePlan.steps.length === 0) return { status: "empty" as const };
      assertPlanInputs(basePlan, flow.edges);
      assertPromptRunAdmissions(basePlan, { evaluationRun: Boolean(evaluationPolicy) });
      const plan = evaluationPolicy
        ? attachEvaluationRunPolicy(basePlan, evaluationPolicy)
        : basePlan;
      const targetStep = plan.steps.find((step) => step.nodeId === onlyNodeId) ?? plan.steps[plan.steps.length - 1];
      const staticReferences = staticImageReferencesForPlan(plan);
      assertNoRemoteImageReferencesAtAdmission(staticReferences);
      await assertImageReferencesAccessible(staticReferences.map((reference) => reference.imageRef), user.id, client, {
        verifyStoredFiles: true,
        verifyInlineImages: true,
        referenceInputs: staticReferences,
      });
      const targetNode = flow.nodes.find((node) => node.id === targetStep.nodeId);
      const params = targetStep.params;
      const requestedCount = requestedCountForStep(targetStep.kind, params);
      const run = await enqueueGenerationRunInTransaction(client, plan, user.id, {
        userId: user.id,
        clientRequestId,
        projectId,
        projectName: project.name,
        nodeId: targetStep.nodeId,
        nodeLabel: targetNode?.data.label ?? targetStep.kind,
        kind: targetStep.kind,
        prompt: typeof params.prompt === "string" ? params.prompt : undefined,
        parameters: {
          ...params,
          referenceInputs: targetStep.inputReferences ?? [],
        },
        referenceImages: targetStep.inputImages,
        referenceInputs: targetStep.inputReferences,
        requestedCount,
      }, evaluationPolicy ? "evaluation" : "workflow", evaluationPolicy);
      return { status: "queued" as const, runId: run.id };
    });
    if (outcome.status === "not_found") {
      res.status(404).json({ error: "项目不存在或已删除" });
    } else if (outcome.status === "forbidden") {
      res.status(403).json({ error: "管理员只能查看其他用户项目，不能运行或修改" });
    } else if (outcome.status === "conflict") {
      res.status(409).json({ error: "画布尚未保存或已在其他位置更新，请保存后重试" });
    } else if (outcome.status === "empty") {
      res.status(400).json({ error: "workflow contains no executable nodes" });
    } else {
      res.status(202).json({ runId: outcome.runId, status: "queued" });
    }
  } catch (err) {
    if (err instanceof EvaluationRunPolicyError) {
      res.status(err.status).json({ error: err.message });
    } else if (err instanceof PromptRunAdmissionError) {
      res.status(400).json(promptRunAdmissionFailurePayload(err.decision));
    } else if (err instanceof DagError || err instanceof WorkflowValidationError) {
      res.status(400).json({ error: err.message });
    } else if (err instanceof ImageReferenceAccessError) {
      res.status(403).json(imageReferenceAccessFailurePayload(err));
    } else if (err instanceof GenerationRequestConflictError || err instanceof EvaluationCaseConflictError) {
      res.status(409).json({ error: err.message });
    } else if (err instanceof ActiveRunLimitError) {
      res.status(409).json({ error: err.message });
    } else if (err instanceof GenerationOwnerUnavailableError) {
      res.status(409).json({ error: err.message });
    } else {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  }
}));

function streamInMemoryRun(
  run: NonNullable<ReturnType<typeof getRunForUser>>,
  req: Request,
  res: Response,
): void {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("retry: 3000\n\n");

  const send = (event: RunEvent) => {
    if (event.seq !== undefined) res.write(`id: ${event.seq}\n`);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };
  const lastEventId = Number(req.get("Last-Event-ID") ?? 0);
  const cursor = Number.isSafeInteger(lastEventId) && lastEventId >= 0 ? lastEventId : 0;
  // 晚连接拿全量；重连只补发游标后的事件，避免终态/最近生成重复记账。
  for (const event of run.events) {
    if ((event.seq ?? 0) > cursor) send(event);
  }
  if (run.finished) {
    res.end();
    return;
  }
  run.emitter.on("event", send);
  const heartbeat = setInterval(() => res.write(": keepalive\n\n"), 15_000);
  const close = () => {
    clearInterval(heartbeat);
    run.emitter.off("event", send);
    res.end();
  };
  run.emitter.once("finish", close);
  req.on("close", () => {
    clearInterval(heartbeat);
    run.emitter.off("event", send);
    run.emitter.off("finish", close);
  });
}

interface DurableRunEventStreamDependencies {
  readEvents: typeof readDurableRunEvents;
  getRun: typeof getDurableRunForUser;
  wait: (milliseconds: number) => Promise<void>;
}

const durableRunEventStreamDependencies: DurableRunEventStreamDependencies = {
  readEvents: readDurableRunEvents,
  getRun: getDurableRunForUser,
  wait: (milliseconds) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds)),
};

export async function streamDurableRunEvents(
  runId: string,
  ownerId: string,
  req: Request,
  res: Response,
  overrides: Partial<DurableRunEventStreamDependencies> = {},
): Promise<void> {
  const dependencies = { ...durableRunEventStreamDependencies, ...overrides };
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("retry: 3000\n\n");
  let cursor = Number(req.get("Last-Event-ID") ?? 0);
  if (!Number.isSafeInteger(cursor) || cursor < 0) cursor = 0;
  let closed = false;
  req.on("close", () => { closed = true; });
  const heartbeat = setInterval(() => {
    if (!closed) res.write(": keepalive\n\n");
  }, 15_000);
  heartbeat.unref();

  const drain = async (): Promise<boolean> => {
    while (!closed) {
      const events = await dependencies.readEvents(runId, ownerId, cursor);
      if (!events) return false;
      for (const event of events) {
        if (closed) return true;
        if (event.seq !== undefined) {
          cursor = Math.max(cursor, event.seq);
          res.write(`id: ${event.seq}\n`);
        }
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
      if (events.length < DURABLE_RUN_EVENT_BATCH_SIZE) return true;
    }
    return true;
  };

  try {
    while (!closed) {
      if (!await drain()) break;
      const status = await dependencies.getRun(runId, ownerId);
      if (!status) break;
      if (status.finished) {
        // 终态状态与最后事件在同一事务提交；状态查询后再 drain 一次可关闭竞态窗口。
        await drain();
        break;
      }
      await dependencies.wait(500);
    }
  } finally {
    clearInterval(heartbeat);
    if (!closed) res.end();
  }
}

runPlanRouter.get("/:id/events", asyncHandler(async (req, res) => {
  const ownerId = requestUser(req).id;
  const durable = await getDurableRunForUser(req.params.id, ownerId);
  if (!durable) {
    const legacyRun = getRunForUser(req.params.id, ownerId);
    if (!legacyRun) {
      res.status(404).json({ error: "run not found" });
      return;
    }
    streamInMemoryRun(legacyRun, req, res);
    return;
  }
  await streamDurableRunEvents(req.params.id, ownerId, req, res);
}));

/** 刷新后先确认内存中的 Run 仍可恢复，避免对已丢失的 id 无限 SSE 重连。 */
runPlanRouter.get("/:id", asyncHandler(async (req, res) => {
  const ownerId = requestUser(req).id;
  const durable = await getDurableRunForUser(req.params.id, ownerId);
  if (durable) {
    res.json({ runId: durable.id, status: durable.status, finished: durable.finished });
    return;
  }
  const run = getRunForUser(req.params.id, ownerId);
  if (!run) {
    res.status(404).json({ error: "run not found" });
    return;
  }
  res.json({ runId: run.id, finished: run.finished });
}));
