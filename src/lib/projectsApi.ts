import { apiErrorMessage } from "./apiErrors";

/**
 * 项目中心「最近项目」卡片的管理操作（重命名 / 删除）。
 *
 * 收口在此处而非组件内：ProjectCenter 的源码形状契约
 * （tests/project-tabs-canvas.test.ts）禁止组件直接出现底层 HTTP 方法名，
 * 组件只触发语义化动作；本模块是唯一拼请求的地方。
 *
 * 端点契约（与 server/routes/projects.ts 同批）：
 * - PATCH /api/projects/:id  body { name }  重命名（trim 后非空由调用方保证）
 * - DELETE /api/projects/:id                软删除（deleted_at 置位）
 * 列表项的 previewImage（最后生成图）由 GET /api/projects 的服务端子查询给出。
 */

async function readErrorBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/** 重命名已保存项目；非 2xx 抛出带服务端文案的错误。fetcher 可注入以便单测。 */
export async function renameProjectRequest(
  projectId: string,
  name: string,
  fetcher: typeof fetch = fetch,
): Promise<void> {
  const response = await fetcher(`/api/projects/${encodeURIComponent(projectId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error(
      apiErrorMessage(response.status, await readErrorBody(response), `重命名失败 HTTP ${response.status}`),
    );
  }
}

/** 软删除已保存项目；非 2xx 抛出带服务端文案的错误。fetcher 可注入以便单测。 */
export async function deleteProjectRequest(
  projectId: string,
  fetcher: typeof fetch = fetch,
): Promise<void> {
  const response = await fetcher(`/api/projects/${encodeURIComponent(projectId)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(
      apiErrorMessage(response.status, await readErrorBody(response), `删除失败 HTTP ${response.status}`),
    );
  }
}
