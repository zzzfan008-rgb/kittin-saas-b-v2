/**
 * 在途运行恢复点（2026-11-10）。
 *
 * 背景：画布上的「生成中」占位结果节点是客户端瞬态 UI，服务端 `flow_json` 里没有它。
 * 会话快照（`flowTabSession`）虽然会额外保留占位节点，但只要刷新路径上有任何一步用
 * 服务端文档重建页签（初始草稿对账、重新打开项目、失败保存后的回滚…），占位节点就会
 * 被整体替换掉，用户看到的就是「刷新后占位节点不见了」。
 *
 * 因此把「这次运行还没收口」这件事独立存一份，与画布节点解耦：
 * - 提交时登记（含节点 id / 位置 / 生成中态起点）；
 * - runId 确认后补写；
 * - 结果落地或终态时删除；
 * - 刷新启动时按记录补回占位节点，再按 runId 重放 durable 事件。
 *
 * 合成编辑（`runImageEdit`）没有占位结果节点，产物经 `image-node-updated` 原位回写图片
 * 节点；它同样需要「生成中刷新、且在刷新期间跑完」时能把图补回来，所以复用同一份记录，
 * 用 `target` 区分产物去处，而不是另起一套恢复机制。
 *
 * 存在 sessionStorage：换标签页/换账号不该继承上一个工作区的在途运行。
 */

export const INFLIGHT_RUNS_STORAGE_KEY = "garment-canvas-inflight-runs";

/** 记录太久远（跨天挂着）就不再补回画布，避免把历史残留塞回用户眼前。 */
const INFLIGHT_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const INFLIGHT_MAX_RECORDS = 20;

export interface InflightRunRecord {
  tabId: string;
  projectId: string;
  /** 生成节点 id：事件按它回到对应文档。 */
  generatorId: string;
  /** 产物落脚节点 id：结果运行=占位结果节点；合成编辑=被编辑的图片节点本身。 */
  nodeId: string;
  /** 产物去处：`result`=占位结果节点（默认）；`image`=图片节点原位回写。 */
  target?: "result" | "image";
  mediaKind: "image" | "video";
  position: { x: number; y: number };
  startedAt: number;
  /** 已确认入队的运行编号；POST 响应到达前为空。 */
  runId?: string;
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

let cache: InflightRunRecord[] | undefined;

function storage(): StorageLike | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is InflightRunRecord {
  if (!value || typeof value !== "object") return false;
  const raw = value as Record<string, unknown>;
  const position = raw.position as Record<string, unknown> | undefined;
  return typeof raw.tabId === "string" && raw.tabId.length > 0
    && typeof raw.projectId === "string"
    && typeof raw.generatorId === "string" && raw.generatorId.length > 0
    && typeof raw.nodeId === "string" && raw.nodeId.length > 0
    && (raw.mediaKind === "image" || raw.mediaKind === "video")
    && (raw.target === undefined || raw.target === "result" || raw.target === "image")
    && typeof raw.startedAt === "number" && Number.isFinite(raw.startedAt)
    && Boolean(position) && typeof position?.x === "number" && typeof position?.y === "number"
    && (raw.runId === undefined || typeof raw.runId === "string");
}

function prune(records: readonly InflightRunRecord[], now = Date.now()): InflightRunRecord[] {
  return records
    .filter((record) => now - record.startedAt < INFLIGHT_MAX_AGE_MS)
    .slice(-INFLIGHT_MAX_RECORDS);
}

/** 读取在途运行记录（进程内缓存；坏数据整体丢弃，绝不让恢复链路崩）。 */
export function readInflightRuns(): InflightRunRecord[] {
  if (cache) return cache;
  const target = storage();
  if (!target) return [];
  let raw: string | null = null;
  try {
    raw = target.getItem(INFLIGHT_RUNS_STORAGE_KEY);
  } catch {
    return [];
  }
  if (!raw) {
    cache = [];
    return cache;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    cache = Array.isArray(parsed) ? prune(parsed.filter(isRecord)) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function commit(records: InflightRunRecord[]): void {
  cache = prune(records);
  const target = storage();
  if (!target) return;
  try {
    if (cache.length === 0) target.setItem(INFLIGHT_RUNS_STORAGE_KEY, "[]");
    else target.setItem(INFLIGHT_RUNS_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // 会话存储写满时退化为仅在内存里记住；不能因此中断生成流程。
  }
}

/** 旧记录没有 `target` 字段，一律视为结果运行（占位结果节点）。 */
export function inflightTarget(record: InflightRunRecord): "result" | "image" {
  return record.target === "image" ? "image" : "result";
}

/** 登记一次新的在途运行；同一生成节点/同一占位节点只保留最新一条。 */
export function rememberInflightRun(record: InflightRunRecord): void {
  const current = readInflightRuns().filter((candidate) => (
    candidate.nodeId !== record.nodeId
    && !(
      candidate.tabId === record.tabId
      && candidate.generatorId === record.generatorId
      && inflightTarget(candidate) === inflightTarget(record)
    )
  ));
  commit([...current, record]);
}

/** POST 返回 runId 后补写恢复点。 */
export function attachInflightRunId(nodeId: string, runId: string): void {
  const records = readInflightRuns();
  const target = records.find((record) => record.nodeId === nodeId);
  if (!target || target.runId === runId) return;
  commit(records.map((record) => (
    record.nodeId === nodeId ? { ...record, runId } : record
  )));
}

export function forgetInflightRun(nodeId: string): void {
  const records = readInflightRuns();
  if (!records.some((record) => record.nodeId === nodeId)) return;
  commit(records.filter((record) => record.nodeId !== nodeId));
}

/** 运行收口（结果落地 / 失败 / 取消 / 无法确认）时按 runId 清理。 */
export function forgetInflightRunByRunId(runId: string | undefined): void {
  if (!runId) return;
  const records = readInflightRuns();
  if (!records.some((record) => record.runId === runId)) return;
  commit(records.filter((record) => record.runId !== runId));
}
