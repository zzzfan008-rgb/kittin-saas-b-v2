import {
  isReferenceRole,
  type ImageGenRequest,
  type ReferenceImageInput,
} from "../types/workflow";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;

export interface ReferenceInputRoleState {
  role: unknown;
  order: unknown;
  roleNeedsConfirmation?: unknown;
  sourceNodeId?: unknown;
}

export type ReferenceInputIssueCode =
  | "reference-role-invalid"
  | "reference-role-unconfirmed";

export type ReferenceInputIssueField =
  | "references"
  | "reference"
  | "order"
  | "role"
  | "roleNeedsConfirmation";

export interface ReferenceInputIssue {
  code: ReferenceInputIssueCode;
  field: ReferenceInputIssueField;
  /** The authoritative array position, even when the submitted order value is invalid. */
  order: number;
  sourceNodeId?: string;
  reason: string;
}

/**
 * Canonical role/order/confirmation validation shared by browser, server and
 * Worker admission. Issues stay in input-array order; within one entry,
 * structural role issues precede confirmation so callers can fail closed on
 * the most fundamental error without recomputing a second validation model.
 */
export function referenceInputIssues(
  references: unknown,
): ReferenceInputIssue[] {
  if (references === undefined) return [];
  if (!Array.isArray(references)) {
    return [{
      code: "reference-role-invalid",
      field: "references",
      order: 0,
      reason: "references must be an array",
    }];
  }
  const issues: ReferenceInputIssue[] = [];
  references.forEach((value, index) => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      issues.push({
        code: "reference-role-invalid",
        field: "reference",
        order: index,
        reason: `references[${index}] must be an object`,
      });
      return;
    }
    const reference = value as ReferenceInputRoleState;
    const sourceNodeId = typeof reference.sourceNodeId === "string" && reference.sourceNodeId.length > 0
      ? reference.sourceNodeId
      : undefined;
    const locate = <T extends Omit<ReferenceInputIssue, "order" | "sourceNodeId">>(issue: T) => ({
      ...issue,
      order: index,
      ...(sourceNodeId ? { sourceNodeId } : {}),
    });
    if (!Number.isSafeInteger(reference.order) || reference.order !== index) {
      issues.push(locate({
        code: "reference-role-invalid",
        field: "order",
        reason: `references[${index}].order must be a safe integer equal to ${index}`,
      }));
    }
    if (!isReferenceRole(reference.role)) {
      issues.push(locate({
        code: "reference-role-invalid",
        field: "role",
        reason: `references[${index}].role must be a supported reference role`,
      }));
    }
    if (reference.roleNeedsConfirmation === undefined || reference.roleNeedsConfirmation === true) {
      issues.push(locate({
        code: "reference-role-unconfirmed",
        field: "roleNeedsConfirmation",
        reason: "roleNeedsConfirmation is not false",
      }));
    } else if (reference.roleNeedsConfirmation !== false) {
      issues.push(locate({
        code: "reference-role-invalid",
        field: "roleNeedsConfirmation",
        reason: `references[${index}].roleNeedsConfirmation must be a boolean`,
      }));
    }
  });
  return issues;
}

export function orderedReferenceInputs(request: ImageGenRequest): ReferenceImageInput[] {
  return [...(request.references ?? [])].sort((left, right) => left.order - right.order);
}

/**
 * Provider 适配层的唯一参考图入口。迁移期允许只有旧数组，但当两者
 * 同时存在时必须完全一致，防止角色证据与真实请求分叉。
 */
export function referenceDataUrls(request: ImageGenRequest): string[] {
  const structured = orderedReferenceInputs(request).map((reference) => reference.dataUrl);
  return structured.length > 0 ? structured : [...(request.referenceImages ?? [])];
}

/** Data/body validation that deliberately leaves role admission to the shared gate. */
export function referenceInputsTransportError(request: ImageGenRequest): string | undefined {
  if (request.references !== undefined && !Array.isArray(request.references)) {
    return "references must be an array";
  }
  if (request.referenceImages !== undefined && !Array.isArray(request.referenceImages)) {
    return "referenceImages must be an array";
  }
  const structured = request.references ?? [];
  const legacy = request.referenceImages ?? [];
  if (structured.length > 0) {
    for (const [index, value] of structured.entries()) {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return `references[${index}] must be an object`;
      }
      const reference = value as ReferenceImageInput;
      if (typeof reference.dataUrl !== "string" || reference.dataUrl.length === 0) {
        return `references[${index}].dataUrl must be a non-empty string`;
      }
      if (!SHA256_PATTERN.test(reference.assetSha256)) {
        return `references[${index}].assetSha256 must be a lowercase SHA-256`;
      }
      if (
        reference.sourceNodeId !== undefined
        && (typeof reference.sourceNodeId !== "string" || reference.sourceNodeId.length === 0)
      ) {
        return `references[${index}].sourceNodeId must be a non-empty string`;
      }
    }
  }
  if (structured.length > 0 && legacy.length > 0) {
    const structuredUrls = structured.map((reference) => reference.dataUrl);
    if (
      structuredUrls.length !== legacy.length
      || structuredUrls.some((url, index) => url !== legacy[index])
    ) {
      return "references and referenceImages must describe the same ordered images";
    }
  }
  return undefined;
}

/** Compatibility wrapper used by the Provider boundary: transport plus invalid roles/orders. */
export function referenceInputsError(request: ImageGenRequest): string | undefined {
  const firstInvalidRoleIssue = referenceInputIssues(request.references)
    .find((issue) => issue.code === "reference-role-invalid");
  return firstInvalidRoleIssue?.reason ?? referenceInputsTransportError(request);
}
