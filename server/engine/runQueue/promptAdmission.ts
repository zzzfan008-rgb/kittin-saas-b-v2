import type { ClaimedJob } from "./types";
import { PromptAdmissionBlockedBeforeProviderCall } from "./types";
import { createHash } from "node:crypto";
import type {
  ImageGenRequest,
  ReferenceImageInput,
  ReferenceImageSource,
} from "../../../src/types/workflow";
import { validateImageDataUrl } from "../../lib/imageValidation";

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
  // v7：蒙版引导图检查改由 needsMask 语义驱动（变体声明）；P2-b 重写时
  // 从 variant.needsMask 读取。过渡期按 mask-edit 模式判定（等价旧行为）。
  if (request.operationMode === "mask-edit") {
    const guideIndexes = references.flatMap((reference, index) => (
      reference.sourceNodeId === maskGuideSourceNodeId ? [index] : []
    ));
    const guideIndex = guideIndexes[0];
    if (
      guideIndexes.length !== 1
      || guideIndex !== references.length - 1
    ) {
      throw new PromptAdmissionBlockedBeforeProviderCall(
        "蒙版 Provider 请求必须且只能在用户参考图之后附加一张系统引导图。",
      );
    }
    // 移除系统引导图，避免在 admission 快照中重复计数。
    userReferences = references.slice(0, -1);
  } else if (references.some((reference) => reference.sourceNodeId === maskGuideSourceNodeId)) {
    throw new PromptAdmissionBlockedBeforeProviderCall(
      "非蒙版 Provider 请求不得携带系统蒙版引导图。",
    );
  }

  return userReferences.map((reference) => ({
    dataUrl: reference.dataUrl,
    order: reference.order,
    assetSha256: reference.assetSha256,
    ...(reference.sourceNodeId ? { sourceNodeId: reference.sourceNodeId } : {}),
  }));
}
