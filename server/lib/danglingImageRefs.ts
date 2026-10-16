import { query } from "./database";
import { LOCAL_IMAGE_REF_RE, stripLocalImageRefs } from "./localImageRefs";

const PREFIX = "/api/files/";

/**
 * 给定一批本地引用与项目属主，返回其中「无权访问」的引用集合。
 * 规则与保存/入队闸（assertImageReferencesAccessible）一致：
 * 缺失、已软删、或属于他人且未被 global/shared 资产引用者，均视为无权访问。
 */
export async function findInaccessibleImageRefs(
  refs: readonly string[],
  userId: string,
): Promise<Set<string>> {
  const inaccessible = new Set<string>();
  if (refs.length === 0) return inaccessible;
  const sharedRows = await query<{ image: string }>(`
    SELECT image FROM assets
    WHERE image = ANY($1::text[]) AND deleted_at IS NULL AND scope IN ('global','shared')
  `, [refs]);
  const sharedRefs = new Set(sharedRows.map((row) => row.image));
  const ids = refs.map((ref) => ref.slice(PREFIX.length));
  const fileRows = await query<{ id: string; owner_id: string | null }>(`
    SELECT id, owner_id FROM files
    WHERE id = ANY($1::text[]) AND deleted_at IS NULL
  `, [ids]);
  const byId = new Map(fileRows.map((row) => [row.id, row]));
  for (const ref of refs) {
    const row = byId.get(ref.slice(PREFIX.length));
    if (!row || (row.owner_id !== null && row.owner_id !== userId && !sharedRefs.has(ref))) {
      inaccessible.add(ref);
    }
  }
  return inaccessible;
}

/**
 * 启动期自愈：清掉项目画布里「已删除/无权访问」的本地图片引用。
 * 历史级联删除或 TTL 回收（以及旧版本清理不彻底）会留下悬空引用，
 * 而草稿/项目保存的存在性闸要求每个引用都能真访问——悬空引用会让整包同步失败。
 * 幂等：第二次运行不会命中任何引用。返回修复的项目数与清除的引用数。
 */
export async function repairDanglingImageReferences(): Promise<{ projects: number; refs: number }> {
  const rows = await query<{ id: string; owner_id: string; flow_json: string }>(
    "SELECT id, owner_id, flow_json FROM projects WHERE deleted_at IS NULL AND flow_json LIKE '%/api/files/%'",
  );
  if (rows.length === 0) return { projects: 0, refs: 0 };
  const allRefs = new Set<string>();
  const refsByProject = new Map<string, string[]>();
  for (const row of rows) {
    const refs = [...new Set([...row.flow_json.matchAll(LOCAL_IMAGE_REF_RE)].map((m) => m[0]))];
    refsByProject.set(row.id, refs);
    for (const ref of refs) allRefs.add(ref);
  }
  if (allRefs.size === 0) return { projects: 0, refs: 0 };
  const distinctRefs = [...allRefs];
  const cache = new Map<string, Set<string>>();
  let projectsTouched = 0;
  let refsRemoved = 0;
  for (const row of rows) {
    const refs = refsByProject.get(row.id) ?? [];
    if (refs.length === 0) continue;
    let bad = cache.get(row.owner_id);
    if (!bad) {
      bad = await findInaccessibleImageRefs(distinctRefs, row.owner_id);
      cache.set(row.owner_id, bad);
    }
    if (bad.size === 0) continue;
    const target = new Set(refs.filter((ref) => bad.has(ref)));
    if (target.size === 0) continue;
    const { value, removed } = stripLocalImageRefs(JSON.parse(row.flow_json), (ref) => target.has(ref));
    if (removed === 0) continue;
    await query("UPDATE projects SET flow_json = $1 WHERE id = $2", [JSON.stringify(value), row.id]);
    projectsTouched += 1;
    refsRemoved += removed;
  }
  return { projects: projectsTouched, refs: refsRemoved };
}
