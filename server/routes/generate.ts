/**
 * POST /api/generate  { clientRequestId, modelId, kind?, request: ImageGenRequest, projectId? } → 202 { runId, status }
 * 请求事务入队后立即返回，由 PostgreSQL Worker 根据参考图选择生成或编辑。
 */
import { Router } from "express";
import {
  MASK_PIPELINE_VERSION,
  MAX_MASK_USER_REFERENCE_IMAGES,
  MAX_REFERENCE_IMAGES,
  NODE_SPECS,
  IMAGE_OPERATION_MODE_VALUES,
  allowedOperationModesForNode,
  type ImageGenRequest,
  type NodeKind,
  type ReferenceImageSource,
} from "../../src/types/workflow";
import { postProcessGeneratedOutputImages } from "../engine/runner";
import { EXACT_ASPECT_DIMENSIONS } from "../lib/imagePostProcessing";
import { requestUser } from "../lib/auth";
import { asyncHandler } from "../lib/asyncHandler";
import {
  ActiveRunLimitError,
  assertGenerationOwnerActive,
  CLIENT_REQUEST_ID_PATTERN,
  enqueueGenerationRunInTransaction,
  GenerationOwnerUnavailableError,
  GenerationRequestConflictError,
} from "../engine/runQueue";
import { queryOne, transaction } from "../lib/database";
import { isLocalImageReference } from "../lib/imageValidation";
import {
  assertNoRemoteImageReferencesAtAdmission,
  assertImageReferencesAccessible,
  imageReferenceAccessFailurePayload,
  ImageReferenceAccessError,
  type ImageReferenceAccessEvidence,
} from "../lib/imageReferenceAccess";
import {
  imageModelOptionsErrorForOperation,
  isImageModelId,
  isModelAllowedForNode,
  modelMaxReferenceImages,
} from "../../src/types/imageModels";
import {
  referenceDataUrls,
  referenceInputsTransportError,
} from "../../src/lib/referenceInputs";
import {
  evaluatePromptRunAdmission,
  promptRunAdmissionFailurePayload,
  promptRunAdmissionInputFromParams,
  type PromptRunReferenceSnapshot,
} from "../../src/lib/promptRunAdmission";

export const generateRouter = Router();

export type DirectGenerateKind = Exclude<NodeKind, "image-input" | "result">;

export type DirectGenerateValidation =
  | { ok: true; kind?: DirectGenerateKind }
  | { ok: false; error: string };

const DIRECT_REFERENCE_SOURCE_NODE_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

function directImageReferenceError(value: unknown): string | undefined {
  if (typeof value !== "string" || !value || value !== value.trim()) {
    return "must be a valid image reference";
  }
  if (value.startsWith("data:")) {
    // Strict Base64, MIME/magic and real decode checks run asynchronously in
    // the globally bounded image-processing slot below.
    return undefined;
  }
  if (value.startsWith("/api/files/")) {
    return isLocalImageReference(value)
      ? undefined
      : "must be a valid image dataURL, local /api/files reference, or http(s) URL";
  }
  try {
    const url = new URL(value);
    if (
      (url.protocol === "http:" || url.protocol === "https:")
      && url.hostname
      && !url.username
      && !url.password
    ) {
      return undefined;
    }
  } catch {
    // Collapse parser details so callers cannot distinguish internal handling.
  }
  return "must be a valid image dataURL, local /api/files reference, or http(s) URL";
}

function directMaskReferenceError(value: string): string | undefined {
  if (value.startsWith("data:")) {
    return /^data:image\/png;base64,/i.test(value)
      ? undefined
      : "must be an inline PNG dataURL or local /api/files/*.png reference";
  }
  return isLocalImageReference(value) && value.toLowerCase().endsWith(".png")
    ? undefined
    : "must be an inline PNG dataURL or local /api/files/*.png reference";
}

function isDirectGenerateKind(value: unknown): value is DirectGenerateKind {
  if (typeof value !== "string" || !Object.prototype.hasOwnProperty.call(NODE_SPECS, value)) return false;
  return Boolean(NODE_SPECS[value as NodeKind].providerId);
}

/** Validate the node contract before starting or recording a direct generation. */
export function validateDirectGenerateRequest(
  kind: unknown,
  request: ImageGenRequest,
): DirectGenerateValidation {
  const referencesError = referenceInputsTransportError(request);
  if (referencesError) return { ok: false, error: `request ${referencesError}` };
  const referenceImages = referenceDataUrls(request);
  if (!IMAGE_OPERATION_MODE_VALUES.includes(request.operationMode as never)) {
    return { ok: false, error: "request.operationMode must be generate, edit, or mask-edit" };
  }
  if (request.operationMode === "generate" && referenceImages.length > 0) {
    return { ok: false, error: "generate mode cannot contain reference images" };
  }
  if (request.operationMode !== "generate" && referenceImages.length === 0) {
    return { ok: false, error: `${request.operationMode} mode requires at least one reference image` };
  }
  if (kind === undefined) {
    return { ok: false, error: "kind is required; direct paid runs cannot infer an evaluation node kind" };
  }
  if (!isDirectGenerateKind(kind)) {
    return { ok: false, error: "kind must identify a supported AI node" };
  }
  const allowedModes = allowedOperationModesForNode(kind);
  if (!allowedModes.includes(request.operationMode)) {
    return { ok: false, error: `${kind} operationMode must be one of: ${allowedModes.join(", ")}` };
  }
  if (kind === "sketch-to-render" || kind === "ai-modify") {
    if (
      typeof request.aspectRatio !== "string"
      || !Object.prototype.hasOwnProperty.call(EXACT_ASPECT_DIMENSIONS, request.aspectRatio)
    ) {
      return {
        ok: false,
        error: `request.aspectRatio must be one of ${Object.keys(EXACT_ASPECT_DIMENSIONS).join(", ")}`,
      };
    }
  }
  if (kind === "upscale" && request.imageSize !== "2K" && request.imageSize !== "4K") {
    return { ok: false, error: "request.imageSize must be 2K or 4K" };
  }
  if (
    kind === "mask-redraw"
    && referenceImages.length > MAX_MASK_USER_REFERENCE_IMAGES
  ) {
    return {
      ok: false,
      error: `request.referenceImages must contain at most ${MAX_MASK_USER_REFERENCE_IMAGES} user images for mask-redraw`,
    };
  }
  return { ok: true, kind };
}

/** Keep the direct endpoint on the same business output guarantees as the DAG runner. */
export function postProcessDirectGenerateImages(
  kind: DirectGenerateKind | undefined,
  request: ImageGenRequest,
  images: string[],
): Promise<string[]> {
  if (!kind) return Promise.resolve(images);
  return postProcessGeneratedOutputImages(
    kind,
    request as unknown as Record<string, unknown>,
    images,
  );
}

generateRouter.post("/", asyncHandler(async (req, res) => {
  if (Object.prototype.hasOwnProperty.call(req.body ?? {}, "evaluation")) {
    res.status(400).json({
      error: "真实评估只能通过 /api/run-plan 并显式提交 onlyNodeId；/api/generate 不接受 evaluation payload",
    });
    return;
  }
  const {
    providerId, modelId: requestedModelId, request, projectId, nodeId, nodeLabel, kind, clientRequestId,
  } = req.body as {
    providerId?: string; modelId?: string;
    request?: ImageGenRequest;
    projectId?: string; nodeId?: string; nodeLabel?: string; kind?: string; clientRequestId?: string;
  };
  const modelId = requestedModelId ?? providerId;
  if (!modelId || !request?.prompt) {
    res.status(400).json({ error: "modelId and request.prompt are required" });
    return;
  }
  if (!isImageModelId(modelId)) {
    res.status(400).json({ error: "modelId must identify a supported API易 image model" });
    return;
  }
  const validation = validateDirectGenerateRequest(kind, request);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }
  const resolvedKind = validation.kind;
  if (!resolvedKind) {
    res.status(400).json({ error: "kind is required" });
    return;
  }
  const submittedReferenceImages = referenceDataUrls(request);
  for (const [index, reference] of submittedReferenceImages.entries()) {
    const referenceError = directImageReferenceError(reference);
    if (referenceError) {
      res.status(400).json({ error: `request reference image ${index} ${referenceError}` });
      return;
    }
  }
  for (const [index, reference] of (request.references ?? []).entries()) {
    if (
      reference.sourceNodeId !== undefined
      && !DIRECT_REFERENCE_SOURCE_NODE_ID_PATTERN.test(reference.sourceNodeId)
    ) {
      res.status(400).json({
        error: `request references[${index}].sourceNodeId must be a safe node identifier`,
      });
      return;
    }
  }
  if (resolvedKind === "mask-redraw" && typeof request.mask === "string") {
    const maskError = directMaskReferenceError(request.mask);
    if (maskError) {
      res.status(400).json({ error: `request.mask ${maskError}` });
      return;
    }
  }
  const fabricImageUrl = (request as ImageGenRequest & { fabricImageUrl?: unknown }).fabricImageUrl;
  if ((resolvedKind === "fabric-recolor" || resolvedKind === "fabric-replace") && fabricImageUrl !== undefined) {
    const fabricReferenceError = directImageReferenceError(fabricImageUrl);
    if (fabricReferenceError) {
      res.status(400).json({ error: `request.fabricImageUrl ${fabricReferenceError}` });
      return;
    }
  }
  if (!isModelAllowedForNode(modelId, resolvedKind)) {
    res.status(400).json({ error: `${modelId} is not allowed for ${resolvedKind}` });
    return;
  }
  const structuredReferences = request.references ?? [];
  const requestReferenceImages = structuredReferences.length > 0
    ? structuredReferences.map((reference) => reference.dataUrl)
    : submittedReferenceImages;
  const maskSourceRef = requestReferenceImages[0];
  if (
    resolvedKind === "mask-redraw" &&
    (typeof maskSourceRef !== "string" || !maskSourceRef.trim() || typeof request.mask !== "string" || !request.mask.trim())
  ) {
    res.status(400).json({ error: "mask-redraw requires a source image and PNG mask" });
    return;
  }
  const maxReferences = Math.min(MAX_REFERENCE_IMAGES, modelMaxReferenceImages(modelId));
  const maxUserReferences = resolvedKind === "mask-redraw"
    ? Math.min(MAX_MASK_USER_REFERENCE_IMAGES, Math.max(0, maxReferences - 1))
    : maxReferences;
  if (requestReferenceImages.length > maxUserReferences) {
    const qualifier = resolvedKind === "mask-redraw" ? " user" : "";
    res.status(400).json({
      error: `referenceImages must contain at most ${maxUserReferences}${qualifier} images for ${modelId}`,
    });
    return;
  }
  if (!Object.prototype.hasOwnProperty.call(request, "modelOptions")) {
    res.status(400).json({ error: "request.modelOptions is required; parameters are never filled silently" });
    return;
  }
  const modelOptions = request.modelOptions;
  const optionsError = imageModelOptionsErrorForOperation(modelId, modelOptions, request.operationMode);
  if (optionsError) {
    res.status(400).json({ error: `request.modelOptions ${optionsError}` });
    return;
  }
  if (projectId !== undefined && (typeof projectId !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(projectId))) {
    res.status(400).json({ error: "projectId must contain only letters, digits, underscore or hyphen" });
    return;
  }
  if (typeof clientRequestId !== "string" || !CLIENT_REQUEST_ID_PATTERN.test(clientRequestId)) {
    res.status(400).json({ error: "clientRequestId is required" });
    return;
  }
  const requestedCount = Math.max(1, Math.min(8, Number(request.batchSize) || 1));
  const user = requestUser(req);
  const resolvedNodeId = nodeId ?? "direct-generate";
  const { maskMode: _legacyMaskMode, ...requestWithoutLegacyMaskMode } = request as ImageGenRequest & {
    maskMode?: unknown;
  };
  const resolvedRequest: ImageGenRequest = {
    ...requestWithoutLegacyMaskMode,
    referenceImages: requestReferenceImages.length ? requestReferenceImages : undefined,
    modelOptions,
  };
  const admissionReferences: PromptRunReferenceSnapshot[] = structuredReferences.length > 0
    ? structuredReferences.map((reference) => ({
      role: reference.role,
      order: reference.order,
      ...(reference.sourceNodeId ? { sourceNodeId: reference.sourceNodeId } : {}),
      roleNeedsConfirmation: reference.roleNeedsConfirmation,
    }))
    : requestReferenceImages.map((_imageRef, order) => ({
      role: "generic",
      order,
      roleNeedsConfirmation: true,
    }));
  const inputReferences: ReferenceImageSource[] = requestReferenceImages.map((imageRef, order) => ({
    imageRef,
    role: structuredReferences[order]?.role ?? "generic" as const,
    order,
    ...(structuredReferences[order]?.sourceNodeId
      ? { sourceNodeId: structuredReferences[order].sourceNodeId }
      : {}),
    // This canonical plan is reachable only after admission validates the raw
    // submitted order/role state below. Legacy-only inputs remain pending.
    roleNeedsConfirmation: structuredReferences[order]?.roleNeedsConfirmation ?? true,
  }));
  // Preserve the exact request order for failure evidence. Auxiliary inputs
  // append one-by-one so their indexes stay unambiguous even if node policies
  // later allow more than one auxiliary image at a time.
  const accessReferences: ImageReferenceAccessEvidence[] = [...inputReferences];
  if ((resolvedKind === "fabric-recolor" || resolvedKind === "fabric-replace") && typeof fabricImageUrl === "string") {
    accessReferences.push({
      imageRef: fabricImageUrl,
      order: accessReferences.length,
      sourceNodeId: "direct-fabric",
    });
  }
  if (resolvedKind === "mask-redraw" && typeof request.mask === "string") {
    accessReferences.push({
      imageRef: request.mask,
      order: accessReferences.length,
      sourceNodeId: "direct-mask",
    });
  }
  const basePlan = {
    steps: [{
      nodeId: resolvedNodeId,
      kind: resolvedKind,
      inputImages: requestReferenceImages,
      inputReferences,
      params: {
        ...resolvedRequest,
        modelId,
        ...(resolvedKind === "mask-redraw" ? { maskSourceRef, maskPipelineVersion: MASK_PIPELINE_VERSION } : {}),
      },
    }],
  };
  try {
    const admission = evaluatePromptRunAdmission(
      promptRunAdmissionInputFromParams(resolvedKind, basePlan.steps[0].params, admissionReferences),
      { evaluationRun: false },
    );
    if (!admission.allowed) {
      res.status(400).json(promptRunAdmissionFailurePayload(admission));
      return;
    }
    assertNoRemoteImageReferencesAtAdmission(accessReferences);
    // All cheap syntax/model/parameter/admission checks are complete. Decode
    // inline inputs exactly once, outside the database transaction but inside
    // the shared bounded image-processing slot.
    const inlineAccessReferences = accessReferences.filter((reference) => (
      reference.imageRef.startsWith("data:")
    ));
    try {
      await assertImageReferencesAccessible(
        inlineAccessReferences.map((reference) => reference.imageRef),
        user.id,
        undefined,
        {
          verifyInlineImages: true,
          referenceInputs: inlineAccessReferences,
        },
      );
    } catch (error) {
      if (error instanceof ImageReferenceAccessError) {
        res.status(400).json({ error: "request contains an unavailable inline image reference" });
        return;
      }
      throw error;
    }
    const plan = basePlan;
    const outcome = await transaction(async (client) => {
      // 与账号转移/删除统一 user → project → assets → files → run 的锁顺序。
      await assertGenerationOwnerActive(client, user.id);
      let serverProjectName: string | undefined;
      if (projectId) {
        const project = await queryOne<{ owner_id: string; name: string }>(`
          SELECT owner_id, name FROM projects
          WHERE id = $1 AND deleted_at IS NULL AND lifecycle = 'saved'
          FOR SHARE
        `, [projectId], client);
        if (!project) return { status: "not_found" as const };
        if (project.owner_id !== user.id) return { status: "forbidden" as const };
        serverProjectName = project.name;
      }
      const storedAccessReferences = accessReferences.filter((reference) => (
        isLocalImageReference(reference.imageRef)
      ));
      await assertImageReferencesAccessible(
        storedAccessReferences.map((reference) => reference.imageRef),
        user.id,
        client,
        {
          verifyStoredFiles: true,
          referenceInputs: storedAccessReferences,
        },
      );
      const run = await enqueueGenerationRunInTransaction(client, plan, user.id, {
        userId: user.id,
        clientRequestId,
        projectId,
        projectName: serverProjectName,
        nodeId: resolvedNodeId,
        nodeLabel: nodeLabel ?? "直接生成",
        kind: resolvedKind,
        prompt: request.prompt,
        parameters: plan.steps[0].params,
        referenceImages: requestReferenceImages,
        referenceInputs: inputReferences,
        requestedCount,
      }, "direct");
      return { status: "queued" as const, runId: run.id };
    });
    if (outcome.status === "not_found") {
      res.status(404).json({ error: "项目不存在或已删除" });
    } else if (outcome.status === "forbidden") {
      res.status(403).json({ error: "无权把直接生成任务写入此项目" });
    } else {
      res.status(202).json({ runId: outcome.runId, status: "queued" });
    }
  } catch (error) {
    if (error instanceof ImageReferenceAccessError) {
      res.status(403).json(imageReferenceAccessFailurePayload(error));
      return;
    }
    if (error instanceof GenerationRequestConflictError) {
      res.status(409).json({ error: error.message });
      return;
    }
    if (error instanceof ActiveRunLimitError) {
      res.status(409).json({ error: error.message });
      return;
    }
    if (error instanceof GenerationOwnerUnavailableError) {
      res.status(409).json({ error: error.message });
      return;
    }
    throw error;
  }
}));
