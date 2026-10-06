// 65d v2 多轮修改（裁决 §4.2）：edit-draft 上传。
// 与 mask 端点（maskUpload.ts）的三点差异——裁决 §4.2 已钉死：
//   ① 入参无 sourceRef（那是蒙版↔源图尺寸对照专用；edit-draft 是完整 RGB 合成图不需要）；
//   ② server 不重编码（normalized=FALSE），字节即前端合成的 PNG；
//   ③ 回收面认 source_type='edit-draft' 纳入无主回收。
// 前端只依赖返回的 URL（写进 ImageNodeData.editInputRef，dag primary = editInputRef ?? outputImages[0]）。

const EDIT_DRAFT_ENDPOINT = "/api/files/edit-draft";

export interface EditDraftUploadResult {
  url: string;
  id?: string;
  width?: number;
  height?: number;
  byteLength?: number;
}

export interface EditDraftUploadParams {
  /** 前端合成的 PNG dataURL（「底图 + 标记」）。 */
  dataUrl: string;
  projectId: string;
  /** 归属图片节点 id（回收面与 audit 用）。 */
  nodeId: string;
}

/** dataURL → Blob（复用 maskUpload 的字节化路径语义；失败即抛，由调用方转状态行）。 */
function dataUrlToBlob(dataUrl: string): Blob {
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex < 0) throw new Error("合成图 dataURL 格式无效");
  const meta = dataUrl.slice(0, commaIndex);
  const payload = dataUrl.slice(commaIndex + 1);
  const mimeType = /^data:([^;,]+)/.exec(meta)?.[1] ?? "image/png";
  if (atob === undefined || btoa === undefined) throw new Error("当前浏览器不支持 dataURL 编码");
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

/**
 * 上传多轮修改的合成图；成功返回 /api/files/ URL（写进 editInputRef）。
 * 失败抛错（含 413 超限提示），由面板状态行承接。
 */
export async function uploadEditDraft(params: EditDraftUploadParams): Promise<EditDraftUploadResult> {
  const trimmedDataUrl = typeof params.dataUrl === "string" ? params.dataUrl.trim() : "";
  const trimmedProjectId = typeof params.projectId === "string" ? params.projectId.trim() : "";
  const trimmedNodeId = typeof params.nodeId === "string" ? params.nodeId.trim() : "";
  if (!trimmedDataUrl || !trimmedProjectId || !trimmedNodeId) {
    throw new Error("合成图上传参数缺失");
  }
  const blob = dataUrlToBlob(trimmedDataUrl);
  if (blob.size === 0) throw new Error("合成图内容为空");

  const body = new FormData();
  body.append("file", blob, "edit-draft.png");
  body.append("projectId", trimmedProjectId);
  body.append("nodeId", trimmedNodeId);

  const response = await fetch(EDIT_DRAFT_ENDPOINT, { method: "POST", body });
  if (!response.ok) {
    let message = `合成图上传失败（HTTP ${response.status}）`;
    try {
      const payload = await response.json() as { error?: string };
      if (typeof payload?.error === "string" && payload.error.trim()) message = payload.error.trim();
    } catch {
      // 非 JSON 错误体沿用 HTTP 文案。
    }
    throw new Error(message);
  }

  let payload: {
    url?: string;
    id?: string;
    width?: number;
    height?: number;
    byteLength?: number;
  };
  try {
    payload = await response.json();
  } catch {
    throw new Error("合成图上传响应格式无效");
  }
  if (typeof payload?.url !== "string" || !payload.url.trim()) {
    throw new Error("合成图上传响应缺少 url");
  }

  return {
    url: payload.url.trim(),
    ...(typeof payload.id === "string" ? { id: payload.id } : {}),
    ...(typeof payload.width === "number" ? { width: payload.width } : {}),
    ...(typeof payload.height === "number" ? { height: payload.height } : {}),
    ...(typeof payload.byteLength === "number" ? { byteLength: payload.byteLength } : {}),
  };
}
