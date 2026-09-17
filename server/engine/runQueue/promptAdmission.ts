import { ClaimedJob } from "./types";
import { persistedEvaluationPolicy } from "./evaluation";
import { createHash } from "node:crypto";
import type {
  ExecutionPlan,
  ImageGenRequest,
  NodeExecution,
  ReferenceImageInput,
  ReferenceImageSource,
} from "../../../src/types/workflow";
import { isReferenceRole, NODE_SPECS } from "../../../src/types/workflow";
import { validateImageDataUrl } from "../../lib/imageValidation";
import {
  evaluatePromptRunAdmission,
  promptRunAdmissionInputFromParams,
  type PromptRunReferenceSnapshot,
} from "../../../src/lib/promptRunAdmission";
export class PromptAdmissionBlockedBeforeProviderCall extends Error {
  constructor(reason: string) {
    super(`执行前提示词准入阻断：${reason}`);
    this.name = "PromptAdmissionBlockedBeforeProviderCall";
  }
}


export function evaluateClaimedJobPromptAdmission(
  job: ClaimedJob,
  runtimeUserReferences?: readonly PromptRunReferenceSnapshot[],
): { allowed: boolean; reason: string } {
  if (!NODE_SPECS[job.step.kind].providerId) {
    return { allowed: true, reason: "非付费节点不调用 Provider。" };
  }
  const hasEvaluationPolicy = (
    job.runType === "evaluation"
    && job.retryPolicy === "no-retry"
    && typeof job.evaluationCaseId === "string"
    && job.evaluationCaseId.trim().length > 0
    && typeof job.evaluationAuthorizationId === "string"
    && job.evaluationAuthorizationId.trim().length > 0
    && typeof job.evaluationCampaignId === "string"
    && job.evaluationCampaignId.trim().length > 0
    && typeof job.evaluationSlotId === "string"
    && job.evaluationSlotId.trim().length > 0
  );
  if (job.runType === "evaluation" && !hasEvaluationPolicy) {
    return {
      allowed: false,
      reason: "真实评估任务缺少持久化的 no-retry、caseId、authorizationId、campaignId 或 slotId。",
    };
  }
  if (hasEvaluationPolicy) {
    try {
      persistedEvaluationPolicy(job);
    } catch (error) {
      return {
        allowed: false,
        reason: error instanceof Error ? error.message : "真实评估策略快照无法验证。",
      };
    }
  }
  if (
    job.runType !== "evaluation"
    && (
      job.retryPolicy !== "standard"
      || job.evaluationCaseId !== null
      || job.evaluationAuthorizationId !== null
      || job.evaluationCampaignId !== null
      || job.evaluationSlotId !== null
    )
  ) {
    return {
      allowed: false,
      reason: "普通任务不得携带真实评估授权或 no-retry 策略。",
    };
  }
  const references = runtimeUserReferences ?? (job.step.inputReferences ?? []).map((reference) => ({
    role: reference.role,
    order: reference.order,
    roleNeedsConfirmation: reference.roleNeedsConfirmation,
    ...(reference.sourceNodeId ? { sourceNodeId: reference.sourceNodeId } : {}),
  }));
  return evaluatePromptRunAdmission(
    // Prompt/model/native parameter binding remains anchored to the reviewed,
    // durable step. Only the reference-role sequence is replaced at the final
    // Provider boundary with the inputs resolved for this run.
    promptRunAdmissionInputFromParams(job.step.kind, job.step.params, references),
    { evaluationRun: hasEvaluationPolicy },
  );
}


export function runtimeUserReferenceInputs(
  job: ClaimedJob,
  request: ImageGenRequest,
): ReferenceImageInput[] {
  if (request.references !== undefined && !Array.isArray(request.references)) {
    throw new PromptAdmissionBlockedBeforeProviderCall(
      "Provider 请求的结构化参考图不是数组。",
    );
  }
  if (request.referenceImages !== undefined && !Array.isArray(request.referenceImages)) {
    throw new PromptAdmissionBlockedBeforeProviderCall(
      "Provider 请求的兼容参考图不是数组。",
    );
  }
  const references = request.references ?? [];
  const referenceImages = request.referenceImages ?? [];
  if (
    referenceImages.length !== references.length
    || referenceImages.some((image, index) => image !== references[index]?.dataUrl)
  ) {
    throw new PromptAdmissionBlockedBeforeProviderCall(
      "Provider 请求的结构化参考图与兼容数组内容或顺序不一致。",
    );
  }

  references.forEach((reference, index) => {
    if (!Number.isSafeInteger(reference?.order) || reference.order !== index) {
      throw new PromptAdmissionBlockedBeforeProviderCall(
        `Provider 请求的参考图 references[${index}].order 必须是安全整数且等于 ${index}。`,
      );
    }
    let actualSha256: string;
    try {
      actualSha256 = createHash("sha256")
        .update(validateImageDataUrl(reference.dataUrl).buffer)
        .digest("hex");
    } catch (error) {
      throw new PromptAdmissionBlockedBeforeProviderCall(
        `Provider 请求的参考图 ${index + 1} 内容无法验证：${error instanceof Error ? error.message : String(error)}`,
      );
    }
    if (reference.assetSha256 !== actualSha256) {
      throw new PromptAdmissionBlockedBeforeProviderCall(
        `Provider 请求的参考图 ${index + 1} 内容与 assetSha256 证据不一致。`,
      );
    }
  });

  const maskGuideSourceNodeId = `${job.step.nodeId}:mask-guide`;
  let userReferences = references;
  if (job.step.kind === "mask-redraw" && request.operationMode === "mask-edit") {
    const guideIndexes = references.flatMap((reference, index) => (
      reference.sourceNodeId === maskGuideSourceNodeId ? [index] : []
    ));
    const guideIndex = guideIndexes[0];
    const guide = guideIndex === undefined ? undefined : references[guideIndex];
    if (
      guideIndexes.length !== 1
      || guideIndex !== references.length - 1
      || guide?.role !== "generic"
      || guide?.roleNeedsConfirmation !== false
    ) {
      throw new PromptAdmissionBlockedBeforeProviderCall(
        "蒙版 Provider 请求必须且只能在用户参考图之后附加一张已确认的系统引导图。",
      );
    }
    // promptRunReferenceRoleProfile owns the synthetic generic-guide + mask
    // suffix. Removing the runtime guide here prevents double-counting it.
    userReferences = references.slice(0, -1);
  } else if (references.some((reference) => reference.sourceNodeId === maskGuideSourceNodeId)) {
    throw new PromptAdmissionBlockedBeforeProviderCall(
      "非蒙版 Provider 请求不得携带系统蒙版引导图。",
    );
  }

  return userReferences.map((reference) => ({
    dataUrl: reference.dataUrl,
    role: reference.role,
    order: reference.order,
    assetSha256: reference.assetSha256,
    ...(reference.sourceNodeId ? { sourceNodeId: reference.sourceNodeId } : {}),
    roleNeedsConfirmation: reference.roleNeedsConfirmation,
  }));
}
