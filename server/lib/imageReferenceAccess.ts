import type { PoolClient } from "pg";
import { isLocalImageReference, isRemoteImageReference } from "./imageValidation";
import { query } from "./database";
import { verifyImageDataUrlForAdmission, verifyStoredImageFile } from "./fileStore";

export const IMAGE_REFERENCE_UNAVAILABLE_MESSAGE = "参考图不可用，请重新选择后再试";
export const IMAGE_REFERENCE_UNAVAILABLE_REASON = "reference image is unavailable";
export const REMOTE_IMAGE_REFERENCE_MESSAGE = "远程参考图不能直接用于生成，请先上传或导入后再试";
export const REMOTE_IMAGE_REFERENCE_REASON = "remote reference must be uploaded or imported before generation";

export interface ImageReferenceAccessIssue {
  order: number;
  sourceNodeId?: string;
  targetNodeId?: string;
  reason: typeof IMAGE_REFERENCE_UNAVAILABLE_REASON | typeof REMOTE_IMAGE_REFERENCE_REASON;
}

export interface ImageReferenceAccessEvidence {
  imageRef: string;
  order: number;
  sourceNodeId?: string;
  targetNodeId?: string;
}

export class ImageReferenceAccessError extends Error {
  readonly references?: ImageReferenceAccessIssue[];

  constructor(
    message = "画布包含无权访问的图片，请重新选择图片后再试",
    references?: ImageReferenceAccessIssue[],
  ) {
    super(message);
    this.name = "ImageReferenceAccessError";
    this.references = references;
  }
}

export function imageReferenceAccessFailurePayload(error: ImageReferenceAccessError): {
  error: string;
  code?: "reference-image-unavailable";
  references?: ImageReferenceAccessIssue[];
} {
  if (!error.references?.length) return { error: error.message };
  return {
    error: error.message,
    code: "reference-image-unavailable",
    references: error.references,
  };
}

/**
 * Product policy requires every user-supplied HTTP(S) reference to be imported
 * before a paid run is queued. Provider output URLs are handled separately by
 * the Worker and are intentionally outside this admission-only check.
 */
export function assertNoRemoteImageReferencesAtAdmission(
  referenceInputs: readonly ImageReferenceAccessEvidence[],
): void {
  const references = referenceInputs.flatMap((reference) => (
    isRemoteImageReference(reference.imageRef)
      ? [{
        order: reference.order,
        ...(reference.sourceNodeId ? { sourceNodeId: reference.sourceNodeId } : {}),
        ...(reference.targetNodeId ? { targetNodeId: reference.targetNodeId } : {}),
        reason: REMOTE_IMAGE_REFERENCE_REASON,
      } satisfies ImageReferenceAccessIssue]
      : []
  ));
  if (references.length > 0) {
    throw new ImageReferenceAccessError(REMOTE_IMAGE_REFERENCE_MESSAGE, references);
  }
}

function collectLocalImageIds(
  value: unknown,
  output = new Set<string>(),
  invalidRefs?: Set<string>,
): Set<string> {
  if (typeof value === "string" && value.startsWith("/api/files/")) {
    if (!isLocalImageReference(value)) {
      if (invalidRefs) invalidRefs.add(value);
      else throw new ImageReferenceAccessError("本地图片引用格式无效");
      return output;
    }
    output.add(value.slice("/api/files/".length));
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectLocalImageIds(item, output, invalidRefs));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectLocalImageIds(item, output, invalidRefs));
  }
  return output;
}

function collectInlineImageRefs(value: unknown, output = new Set<string>()): Set<string> {
  if (typeof value === "string" && value.startsWith("data:")) {
    output.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectInlineImageRefs(item, output));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectInlineImageRefs(item, output));
  }
  return output;
}

/**
 * Provider worker 会直接读取本地文件，因此在入队/保存边界复用文件路由的访问规则。
 * 缺失、已删除或属于其他用户且未共享的本地文件一律拒绝。
 */
export async function assertImageReferencesAccessible(
  value: unknown,
  userId: string,
  client?: PoolClient,
  options?: {
    fileLock?: "share" | "update";
    /** 只在付费入队边界校验物理文件；项目保存和文件路由维持既有语义。 */
    verifyStoredFiles?: boolean;
    /** 对实际静态 inline data URL 执行同一套受限 Sharp 解码。 */
    verifyInlineImages?: boolean;
    /** 目标节点的权威引用序列，用于生成不泄露原因的逐项失败证据。 */
    referenceInputs?: readonly ImageReferenceAccessEvidence[];
  },
): Promise<void> {
  const invalidRefs = options?.referenceInputs ? new Set<string>() : undefined;
  const ids = [...collectLocalImageIds(value, new Set<string>(), invalidRefs)];
  const inlineRefs = options?.verifyInlineImages ? [...collectInlineImageRefs(value)] : [];
  if (ids.length === 0 && !invalidRefs?.size && inlineRefs.length === 0) return;
  const refs = ids.map((id) => `/api/files/${id}`);
  // 项目保存与运行授权都按 assets → files 取锁，避免多个引用交叉等待。
  const referencedAssets = ids.length === 0
    ? []
    : await query<{ id: string; image: string; scope: "global" | "private" | "shared" }>(`
      SELECT id, image, scope FROM assets
      WHERE image = ANY($1::text[])
        AND deleted_at IS NULL
      ORDER BY id
      FOR SHARE
    `, [refs], client);
  const sharedRefs = new Set(
    referencedAssets
      .filter((row) => row.scope === "global" || row.scope === "shared")
      .map((row) => row.image),
  );
  // 项目保存随后会修改蒙版文件元数据，必须从一开始就按相同 id 顺序取得强锁；
  // 不能先 SHARE 再逐行升级，否则不同项目的交叉引用会形成锁升级死锁。
  const fileLock = options?.fileLock === "update" ? "FOR UPDATE" : "FOR SHARE";
  const rows = ids.length === 0
    ? []
    : await query<{ id: string; owner_id: string | null }>(`
      SELECT f.id, f.owner_id
      FROM files f
      WHERE f.id = ANY($1::text[])
        AND f.deleted_at IS NULL
      ORDER BY f.id
      ${fileLock}
    `, [ids], client);

  const rowsById = new Map(rows.map((row) => [row.id, row]));
  const unavailableRefs = new Set<string>(invalidRefs);
  for (const id of ids) {
    const imageRef = `/api/files/${id}`;
    const row = rowsById.get(id);
    if (
      !row
      || (
        row.owner_id !== null
        && row.owner_id !== userId
        && !sharedRefs.has(imageRef)
      )
    ) {
      unavailableRefs.add(imageRef);
      continue;
    }
    if (options?.verifyStoredFiles) {
      try {
        // Deliberately serial while DB locks are held: admission should have a
        // small, predictable memory/CPU ceiling even for multi-image requests.
        await verifyStoredImageFile(imageRef);
      } catch {
        unavailableRefs.add(imageRef);
      }
    }
  }
  for (const imageRef of inlineRefs) {
    try {
      await verifyImageDataUrlForAdmission(imageRef);
    } catch {
      unavailableRefs.add(imageRef);
    }
  }
  if (unavailableRefs.size > 0) {
    const references = options?.referenceInputs
      ? unavailableReferenceIssues(options.referenceInputs, unavailableRefs)
      : [];
    throw references.length > 0
      ? new ImageReferenceAccessError(IMAGE_REFERENCE_UNAVAILABLE_MESSAGE, references)
      : new ImageReferenceAccessError();
  }
}

function unavailableReferenceIssues(
  referenceInputs: readonly ImageReferenceAccessEvidence[],
  unavailableRefs: ReadonlySet<string>,
): ImageReferenceAccessIssue[] {
  return referenceInputs.flatMap((reference) => {
    if (!unavailableRefs.has(reference.imageRef)) return [];
    return [{
      order: reference.order,
      ...(reference.sourceNodeId ? { sourceNodeId: reference.sourceNodeId } : {}),
      ...(reference.targetNodeId ? { targetNodeId: reference.targetNodeId } : {}),
      reason: IMAGE_REFERENCE_UNAVAILABLE_REASON,
    }];
  });
}
