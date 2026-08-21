import { Router } from "express";
import { nanoid } from "nanoid";
import type { PoolClient } from "pg";
import { requestUser } from "../lib/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { query, queryOne, transaction } from "../lib/database";
import { deleteStoredImage } from "../lib/fileStore";
import { validateAndMigrateFlow, WorkflowValidationError } from "../lib/workflowSchema";
import {
  assertImageReferencesAccessible,
  ImageReferenceAccessError,
} from "../lib/imageReferenceAccess";
import { lockActiveOwner } from "../lib/ownerMutation";
import { isLocalImageReference } from "../lib/imageValidation";
import type { PersistedWorkflow } from "../../src/types/workflow";

export const projectsRouter = Router();

interface ProjectRow {
  id: string;
  owner_id: string;
  owner_name: string;
  name: string;
  flow_json: string;
  updated_at: string;
}

interface ProjectMaskFileRef {
  fileId: string;
  nodeId: string;
}

const RETIRED_MASK_RETENTION_MS = 30 * 24 * 60 * 60 * 1_000;

function imageRefs(value: unknown, output = new Set<string>()): Set<string> {
  if (typeof value === "string" && value.startsWith("/api/files/")) output.add(value);
  else if (Array.isArray(value)) value.forEach((item) => imageRefs(item, output));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => imageRefs(item, output));
  return output;
}

async function syncAssetRefs(
  client: PoolClient,
  projectId: string,
  ownerId: string,
  flow: PersistedWorkflow,
): Promise<void> {
  const refs = [...imageRefs(flow)];
  const assets = await query<{ id: string; image: string }>(`
    SELECT id, image FROM assets
    WHERE deleted_at IS NULL AND (scope IN ('global','shared') OR owner_id = $1)
      AND image = ANY($2::text[])
    FOR KEY SHARE
  `, [ownerId, refs], client);
  const wanted = assets.map((asset) => asset.id);
  const now = new Date().toISOString();
  await client.query("DELETE FROM project_asset_refs WHERE project_id = $1", [projectId]);
  for (const assetId of wanted) {
    await client.query(
      "INSERT INTO project_asset_refs (project_id, asset_id, created_at) VALUES ($1, $2, $3)",
      [projectId, assetId, now],
    );
  }
}

function projectMaskFileRefs(flow: PersistedWorkflow): ProjectMaskFileRef[] {
  return flow.nodes.flatMap((node) => {
    if (node.data.kind !== "mask-redraw" || typeof node.data.mask !== "string") return [];
    if (!isLocalImageReference(node.data.mask)) return [];
    return [{
      fileId: node.data.mask.slice("/api/files/".length),
      nodeId: node.id,
    }];
  });
}

/** 认领当前蒙版文件，并让同项目已替换的旧蒙版进入延迟回收。 */
async function syncMaskFiles(
  client: PoolClient,
  projectId: string,
  ownerId: string,
  flow: PersistedWorkflow,
  now: Date,
): Promise<void> {
  const refs = projectMaskFileRefs(flow);
  const ids = [...new Set(refs.map((ref) => ref.fileId))];
  const rows = ids.length === 0
    ? []
    : (await client.query<{
        id: string;
        owner_id: string | null;
        source_type: string;
        project_id: string | null;
        node_id: string | null;
        mime_type: string | null;
      }>(`
        SELECT id, owner_id, source_type, project_id, node_id, mime_type
        FROM files
        WHERE id = ANY($1::text[]) AND deleted_at IS NULL
        ORDER BY id
        FOR UPDATE
      `, [ids])).rows;
  const byId = new Map(rows.map((row) => [row.id, row]));
  for (const ref of refs) {
    const row = byId.get(ref.fileId);
    if (
      !row || row.owner_id !== ownerId ||
      (row.source_type !== "mask-draft" && row.source_type !== "mask") ||
      row.project_id !== projectId || row.node_id !== ref.nodeId ||
      row.mime_type !== "image/png"
    ) {
      throw new ImageReferenceAccessError("蒙版文件与当前项目或节点不匹配，请重新保存蒙版");
    }
  }

  const retireAt = new Date(now.getTime() + RETIRED_MASK_RETENTION_MS).toISOString();
  await client.query(`
    UPDATE files
    SET purge_after = COALESCE(purge_after, $3)
    WHERE owner_id = $1 AND project_id = $2
      AND source_type IN ('mask-draft', 'mask')
      AND NOT (id = ANY($4::text[]))
  `, [ownerId, projectId, retireAt, ids]);
  if (ids.length > 0) {
    await client.query(`
      UPDATE files
      SET source_type = 'mask', purge_after = NULL
      WHERE owner_id = $1 AND project_id = $2 AND id = ANY($3::text[])
    `, [ownerId, projectId, ids]);
  }
}

export async function purgeExpiredProjects(): Promise<void> {
  const now = new Date().toISOString();
  const expiredFileIds = await transaction(async (client) => {
    await client.query(`
      DELETE FROM project_asset_refs
      WHERE project_id IN (SELECT id FROM projects WHERE purge_after IS NOT NULL AND purge_after <= $1)
    `, [now]);
    await client.query("DELETE FROM usage_events WHERE purge_after IS NOT NULL AND purge_after <= $1", [now]);
    await client.query("DELETE FROM generation_runs WHERE purge_after IS NOT NULL AND purge_after <= $1", [now]);
    await client.query(`
      DELETE FROM assets
      WHERE purge_after IS NOT NULL AND purge_after <= $1
        AND NOT EXISTS (SELECT 1 FROM project_asset_refs r WHERE r.asset_id = assets.id)
    `, [now]);
    // 先锁定有限的过期候选，再检查 durable run。入队按 files → run 写入；这里沿用
    // 相同顺序，保证若入队先持有文件共享锁，等待后执行的 DELETE 能看到新提交的 run。
    const candidates = await client.query<{ id: string }>(`
      SELECT f.id
      FROM files f
      WHERE f.purge_after IS NOT NULL AND f.purge_after <= $1
        AND NOT EXISTS (
          SELECT 1 FROM assets a
          WHERE a.image = '/api/files/' || f.id
        )
      ORDER BY f.id
      FOR UPDATE OF f
    `, [now]);
    const candidateIds = candidates.rows.map((row) => row.id);
    const files = candidateIds.length === 0
      ? { rows: [] as Array<{ id: string }> }
      : await client.query<{ id: string }>(`
          DELETE FROM files f
          WHERE f.id = ANY($2::text[])
            AND f.purge_after IS NOT NULL AND f.purge_after <= $1
            AND NOT EXISTS (
              SELECT 1 FROM assets a
              WHERE a.image = '/api/files/' || f.id
            )
            AND NOT EXISTS (
              SELECT 1
              FROM generation_runs r
              WHERE r.deleted_at IS NULL
                AND r.plan_json IS NOT NULL
                AND r.status IN ('queued','running','retry_wait','cancel_requested')
                AND jsonb_path_exists(
                  r.plan_json::jsonb,
                  '$.** ? (@ == $ref)',
                  jsonb_build_object('ref', '/api/files/' || f.id)
                )
            )
          RETURNING f.id
        `, [now, candidateIds]);
    await client.query("DELETE FROM projects WHERE purge_after IS NOT NULL AND purge_after <= $1", [now]);
    return files.rows.map((row) => row.id);
  });
  expiredFileIds.forEach(deleteStoredImage);
}

projectsRouter.post("/", asyncHandler(async (req, res) => {
  const user = requestUser(req);
  const { id, name, flow } = req.body as { id?: string; name?: string; flow?: unknown };
  if (typeof name !== "string" || !name.trim() || name.length > 200 || flow === undefined) {
    res.status(400).json({ error: "name and flow are required" });
    return;
  }
  if (id !== undefined && (typeof id !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(id))) {
    res.status(400).json({ error: "id must contain only letters, digits, underscore or hyphen" });
    return;
  }
  try {
    const normalized = validateAndMigrateFlow(flow);
    const projectId = id || nanoid(10);
    const now = new Date().toISOString();
    const saved = await transaction(async (client) => {
      if (!await lockActiveOwner(client, user.id)) return "owner_unavailable" as const;
      const existing = await queryOne<{ owner_id: string; deleted_at: string | null }>(
        "SELECT owner_id, deleted_at FROM projects WHERE id = $1 FOR UPDATE",
        [projectId],
        client,
      );
      if (existing?.owner_id !== undefined && existing.owner_id !== user.id) return "forbidden" as const;
      if (existing?.deleted_at) return "deleted" as const;
      await assertImageReferencesAccessible(normalized, user.id, client, { fileLock: "update" });
      await syncMaskFiles(client, projectId, user.id, normalized, new Date(now));
      const result = await client.query(`
        INSERT INTO projects (id, owner_id, name, flow_json, updated_at, created_at)
        VALUES ($1, $2, $3, $4, $5, $5)
        ON CONFLICT(id) DO UPDATE
          SET name = excluded.name, flow_json = excluded.flow_json, updated_at = excluded.updated_at
          WHERE projects.owner_id = excluded.owner_id
        RETURNING id
      `, [projectId, user.id, name.trim(), JSON.stringify(normalized), now]);
      if (result.rowCount !== 1) return "forbidden" as const;
      await syncAssetRefs(client, projectId, user.id, normalized);
      return "saved" as const;
    });
    if (saved === "forbidden") {
      res.status(403).json({ error: "管理员只能查看其他用户项目，不能修改" });
      return;
    }
    if (saved === "deleted") {
      res.status(409).json({ error: "项目已在回收站中，请先恢复项目再保存" });
      return;
    }
    if (saved === "owner_unavailable") {
      res.status(409).json({ error: "账号已停用或删除，不能继续保存项目" });
      return;
    }
    res.json({ ok: true, id: projectId });
  } catch (error) {
    res.status(error instanceof WorkflowValidationError ? 400 : error instanceof ImageReferenceAccessError ? 403 : 500)
      .json({ error: error instanceof Error ? error.message : String(error) });
  }
}));

projectsRouter.get("/", asyncHandler(async (req, res) => {
  await purgeExpiredProjects();
  const user = requestUser(req);
  const rows = await query<Omit<ProjectRow, "flow_json">>(`
    SELECT p.id, p.owner_id, u.display_name AS owner_name, p.name, p.updated_at
    FROM projects p JOIN users u ON u.id = p.owner_id
    WHERE p.deleted_at IS NULL AND ($1 = 'admin' OR p.owner_id = $2)
    ORDER BY p.updated_at DESC
  `, [user.role, user.id]);
  res.json(rows.map((row) => ({
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    readOnly: row.owner_id !== user.id,
    updatedAt: row.updated_at,
  })));
}));

projectsRouter.get("/:id", asyncHandler(async (req, res) => {
  const user = requestUser(req);
  const row = await queryOne<ProjectRow>(`
    SELECT p.id, p.owner_id, u.display_name AS owner_name, p.name, p.flow_json, p.updated_at
    FROM projects p JOIN users u ON u.id = p.owner_id
    WHERE p.id = $1 AND p.deleted_at IS NULL
  `, [req.params.id]);
  if (!row) {
    res.status(404).json({ error: "project not found" });
    return;
  }
  if (row.owner_id !== user.id && user.role !== "admin") {
    res.status(403).json({ error: "无权查看此项目" });
    return;
  }
  try {
    const flow = validateAndMigrateFlow(JSON.parse(row.flow_json));
    res.json({
      id: row.id, name: row.name, flow, updatedAt: row.updated_at,
      ownerId: row.owner_id, ownerName: row.owner_name, readOnly: row.owner_id !== user.id,
    });
  } catch (error) {
    res.status(422).json({
      error: error instanceof WorkflowValidationError ? `项目数据无法迁移：${error.message}` : "项目数据损坏",
    });
  }
}));
