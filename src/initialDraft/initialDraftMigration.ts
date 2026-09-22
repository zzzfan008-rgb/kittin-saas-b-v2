import {
  isPristineProjectTab,
  projectTabHasLocalDraftChanges,
  projectTabLifecycle,
  type ProjectTab,
  type ServerInitialDraftSnapshot,
} from "@/store/flowStore";
import { isServerInitialDraftPristine } from "./initialDraftClient";

export type InitialDraftStartupDecision =
  | { kind: "bootstrap-local"; local: ProjectTab }
  | { kind: "bootstrap-pristine"; local: ProjectTab }
  | { kind: "restore-server"; local: ProjectTab | null; server: ServerInitialDraftSnapshot }
  | { kind: "sync-local"; local: ProjectTab; server: ServerInitialDraftSnapshot }
  | { kind: "conflict"; local: ProjectTab; server: ServerInitialDraftSnapshot };

/** 服务器已没有该草稿时，旧 initial_draft ID 已退役，必须保留内容但换新身份。 */
export function bootstrapNeedsFreshProjectIdentity(
  decision: InitialDraftStartupDecision,
): boolean {
  return decision.kind === "bootstrap-pristine" || (
    decision.kind === "bootstrap-local" && projectTabLifecycle(decision.local) === "initial_draft"
  );
}

/**
 * 用户 2026-09-25 决策 A：登录后一律「空白优先、无页签」——启动时既不自动打开最近正式项目，
 * 也不自动新建初始草稿（草稿 bootstrap 会写库）。只有账号下一个正式项目都没有、且服务端没有
 * 待恢复草稿时才放行后续的草稿启动流程。空工作区（tabs=[]）在调用点已经提前返回。
 */
export function shouldStayBlankOnStartup(
  local: ProjectTab | null,
  server: ServerInitialDraftSnapshot | null,
  savedProjectCount: number,
): boolean {
  return local === null && savedProjectCount > 0 && (
    server === null || isServerInitialDraftPristine(server)
  );
}

/** 只有 Auth owner 已证明时才接管旧本地草稿；已标记的 initial_draft 优先。 */
export function selectLocalInitialDraftCandidate(
  tabs: ProjectTab[],
  activeTabId: string,
  ownerVerified: boolean,
): ProjectTab | null {
  if (!ownerVerified) return null;
  const active = tabs.find((tab) => tab.id === activeTabId);
  if (active && projectTabLifecycle(active) === "initial_draft") return active;
  const marked = tabs.find((tab) => projectTabLifecycle(tab) === "initial_draft");
  if (marked) return marked;
  if (active && projectTabHasLocalDraftChanges(active)) return active;
  return tabs.find((tab) => projectTabHasLocalDraftChanges(tab)) ?? null;
}

export function decideInitialDraftStartup(
  placeholder: ProjectTab,
  local: ProjectTab | null,
  server: ServerInitialDraftSnapshot | null,
): InitialDraftStartupDecision {
  if (!local) {
    return server
      ? { kind: "restore-server", local: null, server }
      : { kind: "bootstrap-pristine", local: placeholder };
  }
  if (!server) return { kind: "bootstrap-local", local };

  const lifecycle = projectTabLifecycle(local);
  const hasUnsyncedChanges = lifecycle === "initial_draft"
    ? local.revision > (local.draftSyncedRevision ?? 0)
    : !isPristineProjectTab(local);
  if (local.projectId === server.id && lifecycle === "initial_draft") {
    if (!hasUnsyncedChanges) return { kind: "restore-server", local, server };
    return (local.draftRevision ?? 0) === server.revision
      ? { kind: "sync-local", local, server }
      : { kind: "conflict", local, server };
  }

  if (isServerInitialDraftPristine(server) && server.revision === 0) {
    return { kind: "sync-local", local, server };
  }
  return { kind: "conflict", local, server };
}
