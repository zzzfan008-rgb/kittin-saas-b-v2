import { useCallback, useEffect, useState } from "react";
import { useAuth, type CurrentUser } from "@/auth/AuthContext";
import { ASSET_LEAF_LABEL } from "@/lib/assetTaxonomy";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ImageModelId } from "@/types/imageModels";

interface ManagedUser extends CurrentUser {
  active: boolean;
  createdAt: string;
}

interface UsageItem {
  id: string; userId: string; accountId: string; displayName: string; model?: string;
  successfulCount: number; providerRequests: number; durationMs: number; createdAt: string;
}

interface AiDiagnosticProvider {
  providerId: ImageModelId;
  model: string;
  label: string;
  channel: string;
  probes: Array<"generate" | "edit">;
  configured: boolean;
  error?: string;
  capabilities?: {
    supportsGeneration: boolean;
    supportsEdit: boolean;
    maxReferenceImages: number;
    maxImagesPerRequest: number;
    timeoutMs: number;
  };
}

interface AiDiagnostics {
  gateway: string;
  providers: AiDiagnosticProvider[];
}

type AccountPanelTab = "usage" | "history" | "users" | "assets" | "diagnostics";

export function AccountMenu() {
  const { user, logout } = useAuth();
  const [panel, setPanel] = useState<AccountPanelTab | null>(null);
  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          aria-label={`账户菜单：${user.displayName}`}
          title={`账户菜单：${user.displayName}`}
          className="flex h-8 items-center justify-center gap-2 rounded-full border border-(--gc-border) px-3 py-1.5 text-label text-(--gc-text-muted) outline-hidden transition-colors hover:border-(--gc-accent) focus-visible:ring-3 focus-visible:ring-(--gc-accent)/50"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-(--gc-accent) text-label font-semibold text-white">
            {user.displayName.slice(0, 1)}
          </span>
          <span>{user.displayName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="w-44 border border-(--gc-border) bg-(--gc-panel) p-1.5 text-(--gc-text) ring-0"
        >
          <DropdownMenuItem className="px-2.5 py-2 text-label" onClick={() => setPanel("usage")}>
            消耗记录
          </DropdownMenuItem>
          {user.role === "admin" && (
            <>
              <DropdownMenuItem className="px-2.5 py-2 text-label" onClick={() => setPanel("history")}>
                历史创作
              </DropdownMenuItem>
              <DropdownMenuItem className="px-2.5 py-2 text-label" onClick={() => setPanel("assets")}>
                资产库
              </DropdownMenuItem>
              <DropdownMenuItem className="px-2.5 py-2 text-label" onClick={() => setPanel("users")}>
                用户管理
              </DropdownMenuItem>
              <DropdownMenuItem className="px-2.5 py-2 text-label" onClick={() => setPanel("diagnostics")}>
                AI 服务诊断
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator className="bg-(--gc-border)" />
          <DropdownMenuItem variant="destructive" className="px-2.5 py-2 text-label" onClick={() => void logout()}>
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {panel && <AccountPanel initialTab={panel} onClose={() => setPanel(null)} />}
    </>
  );
}

function AccountPanel({ initialTab, onClose }: { initialTab: AccountPanelTab; onClose: () => void }) {
  const { user } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [usage, setUsage] = useState<UsageItem[]>([]);
  const [diagnostics, setDiagnostics] = useState<AiDiagnostics | null>(null);
  const [probing, setProbing] = useState<string | null>(null);
  const [probeResults, setProbeResults] = useState<Record<string, string>>({});
  const [selectedUser, setSelectedUser] = useState(user?.role === "admin" ? "all" : user?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    if (user?.role !== "admin") return;
    const response = await fetch("/api/auth/users");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    setUsers(await response.json() as ManagedUser[]);
  };
  const loadUsage = async () => {
    const query = user?.role === "admin"
      ? selectedUser === "all" ? "?all=true" : `?userId=${encodeURIComponent(selectedUser)}`
      : "";
    const response = await fetch(`/api/usage${query}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    setUsage(await response.json() as UsageItem[]);
  };
  const loadDiagnostics = async () => {
    if (user?.role !== "admin") return;
    const response = await fetch("/api/ai-diagnostics");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    setDiagnostics(await response.json() as AiDiagnostics);
  };

  useEffect(() => {
    setError(null);
    void Promise.all([loadUsers(), loadUsage(), loadDiagnostics()]).catch((reason) => setError(reason instanceof Error ? reason.message : String(reason)));
  }, [selectedUser]);

  const runProbe = async (providerId: AiDiagnosticProvider["providerId"], mode: "generate" | "edit") => {
    const key = `${providerId}:${mode}`;
    setProbing(key);
    setError(null);
    try {
      const response = await fetch("/api/ai-diagnostics/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, mode }),
      });
      const body = await response.json() as { ok?: boolean; error?: string; durationMs?: number };
      setProbeResults((current) => ({
        ...current,
        [key]: response.ok && body.ok
          ? `正常 · ${((body.durationMs ?? 0) / 1000).toFixed(1)} 秒`
          : body.error ?? "诊断失败",
      }));
    } catch (reason) {
      setProbeResults((current) => ({ ...current, [key]: reason instanceof Error ? reason.message : "诊断失败" }));
    } finally {
      setProbing(null);
    }
  };

  const exportUsage = () => {
    const query = user?.role === "admin"
      ? selectedUser === "all" ? "?all=true&format=csv" : `?userId=${encodeURIComponent(selectedUser)}&format=csv`
      : "?format=csv";
    window.open(`/api/usage${query}`, "_blank", "noopener");
  };

  const createUser = async () => {
    const accountId = window.prompt("新用户账号");
    if (!accountId) return;
    const displayName = window.prompt("显示名称", accountId);
    if (!displayName) return;
    const password = window.prompt("初始密码（至少 10 位，包含字母和数字）");
    if (!password) return;
    const response = await fetch("/api/auth/users", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, displayName, password, role: "user" }),
    });
    const body = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) { setError(body.error ?? "创建失败"); return; }
    await loadUsers();
  };

  const toggleUser = async (target: ManagedUser) => {
    const response = await fetch(`/api/auth/users/${target.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !target.active }),
    });
    if (!response.ok) { setError("更新用户失败"); return; }
    await loadUsers();
  };

  const resetPassword = async (target: ManagedUser) => {
    const password = window.prompt(`为 ${target.displayName} 设置临时密码`);
    if (!password) return;
    const response = await fetch(`/api/auth/users/${target.id}/reset-password`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
    });
    const body = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) setError(body.error ?? "重置失败");
  };

  const deleteUser = async (target: ManagedUser) => {
    const choice = window.prompt("输入接收该用户数据的账号；若要把数据放入 15 天回收站，请输入 DELETE");
    if (!choice) return;
    const receiver = users.find((item) => item.accountId === choice && item.id !== target.id);
    if (choice !== "DELETE" && !receiver) { setError("没有找到数据接收账号"); return; }
    const response = await fetch(`/api/auth/users/${target.id}`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(choice === "DELETE" ? { deleteData: true } : { transferToUserId: receiver!.id }),
    });
    const body = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) { setError(body.error ?? "删除用户失败"); return; }
    await loadUsers();
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/70 p-6" onClick={onClose}>
      <section className="flex h-[70vh] w-full max-w-4xl flex-col rounded-xl border border-(--gc-border) bg-(--gc-panel) shadow-2xl"
        onClick={(event) => event.stopPropagation()}>
        <header className="flex items-center border-b border-(--gc-border) px-5 py-3">
          <button onClick={() => setTab("usage")} className={`px-3 py-1.5 text-xs ${tab === "usage" ? "text-(--gc-accent)" : "text-(--gc-text-muted)"}`}>消耗记录</button>
          {user?.role === "admin" && <button onClick={() => setTab("history")} className={`px-3 py-1.5 text-xs ${tab === "history" ? "text-(--gc-accent)" : "text-(--gc-text-muted)"}`}>历史创作</button>}
          {user?.role === "admin" && <button onClick={() => setTab("assets")} className={`px-3 py-1.5 text-xs ${tab === "assets" ? "text-(--gc-accent)" : "text-(--gc-text-muted)"}`}>资产库</button>}
          {user?.role === "admin" && <button onClick={() => setTab("users")} className={`px-3 py-1.5 text-xs ${tab === "users" ? "text-(--gc-accent)" : "text-(--gc-text-muted)"}`}>用户管理</button>}
          {user?.role === "admin" && <button onClick={() => setTab("diagnostics")} className={`px-3 py-1.5 text-xs ${tab === "diagnostics" ? "text-(--gc-accent)" : "text-(--gc-text-muted)"}`}>AI 服务诊断</button>}
          <button onClick={onClose} className="ml-auto text-sm text-(--gc-text-muted)">✕</button>
        </header>
        {error && <p className="mx-5 mt-3 rounded-sm bg-red-950/20 px-3 py-2 text-xs text-red-400">{error}</p>}
        {tab === "usage" ? (
          <div className="flex min-h-0 flex-1 flex-col p-5">
            <div className="mb-3 flex gap-2">
              {user?.role === "admin" && (
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="rounded-sm border border-(--gc-border) bg-(--gc-control) px-2 py-1 text-xs">
                  <option value="all">全部用户</option>
                  {users.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {item.accountId}</option>)}
                </select>
              )}
              <button onClick={exportUsage} className="ml-auto rounded-sm bg-(--gc-accent) px-3 py-1.5 text-xs text-white">导出 CSV</button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto rounded-sm border border-(--gc-border)">
              <table className="w-full text-left text-label">
                <thead className="sticky top-0 bg-(--gc-panel) text-(--gc-text-muted)"><tr><th className="p-2">时间</th><th>用户</th><th>模型</th><th>成功图片</th><th>请求数</th><th>耗时</th></tr></thead>
                <tbody>{usage.map((item) => <tr key={item.id} className="border-t border-(--gc-border)"><td className="p-2">{new Date(item.createdAt).toLocaleString("zh-CN")}</td><td>{item.displayName}</td><td>{item.model ?? "—"}</td><td>{item.successfulCount}</td><td>{item.providerRequests}</td><td>{(item.durationMs / 1000).toFixed(1)}s</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        ) : tab === "history" ? (
          <AdminHistoryPanel users={users} />
        ) : tab === "assets" ? (
          <AdminAssetsPanel users={users} />
        ) : tab === "users" ? (
          <div className="min-h-0 flex-1 overflow-auto p-5">
            <button onClick={() => void createUser()} className="mb-3 rounded-sm bg-(--gc-accent) px-3 py-1.5 text-xs text-white">创建用户</button>
            <div className="space-y-2">{users.map((item) => <div key={item.id} className="flex items-center rounded-sm border border-(--gc-border) p-3 text-xs"><span className="min-w-0 flex-1"><strong>{item.displayName}</strong><span className="ml-2 text-(--gc-text-muted)">{item.accountId} · {item.role === "admin" ? "管理员" : "用户"}</span></span><button onClick={() => void resetPassword(item)} className="mr-2 rounded-sm border border-(--gc-border) px-2 py-1">重置密码</button><button disabled={item.id === user?.id} onClick={() => void toggleUser(item)} className={`mr-2 rounded-sm px-2 py-1 ${item.active ? "bg-red-950/30 text-red-400" : "bg-emerald-950/30 text-emerald-400"}`}>{item.active ? "停用" : "启用"}</button>{item.id !== user?.id && <button onClick={() => void deleteUser(item)} className="rounded-sm border border-red-900/50 px-2 py-1 text-red-400">删除</button>}</div>)}</div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto p-5">
            <p className="mb-4 text-xs text-(--gc-text-muted)">
              网关：{diagnostics?.gateway ?? "读取中…"}。配置状态来自本地 API易契约；文生图与改图检查会各发起一次真实 AI 请求，可能产生少量消耗。
            </p>
            <div className="space-y-3">
              {diagnostics?.providers.map((provider) => (
                <section key={provider.providerId} className="rounded-lg border border-(--gc-border) p-4 text-xs">
                  <div className="mb-2 flex items-center gap-2">
                    <strong>{provider.label}</strong>
                    <span className="text-(--gc-text-muted)">
                      {provider.model} · {provider.channel === "official" ? "官转" : "Codex 官逆"}
                    </span>
                    <span className={provider.configured ? "ml-auto text-emerald-400" : "ml-auto text-red-400"}>
                      {provider.configured ? "配置完整" : "配置缺失"}
                    </span>
                  </div>
                  {!provider.configured && provider.error && (
                    <p className="mb-3 text-body text-red-400">{provider.error}</p>
                  )}
                  {provider.capabilities && (
                    <p className="mb-3 text-label text-(--gc-text-muted)">
                      文生图：{provider.capabilities.supportsGeneration ? "支持" : "不支持"}
                      ；参考图编辑：{provider.capabilities.supportsEdit ? `支持，最多 ${provider.capabilities.maxReferenceImages} 张` : "不支持"}
                      ；单次最多 {provider.capabilities.maxImagesPerRequest} 张；超时 {Math.round(provider.capabilities.timeoutMs / 1000)} 秒
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {provider.probes.map((mode) => {
                      const key = `${provider.providerId}:${mode}`;
                      const label = mode === "generate" ? "检查文生图" : "检查改图";
                      return (
                        <button key={mode} disabled={!provider.configured || probing !== null}
                          onClick={() => void runProbe(provider.providerId, mode)}
                          className="rounded-sm border border-(--gc-border) px-2.5 py-1.5 disabled:opacity-40">
                          {probing === key ? "检查中…" : label}
                          {probeResults[key] ? ` · ${probeResults[key]}` : ""}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

interface AdminAssetItem {
  id: string;
  ownerId: string | null;
  ownerName: string | null;
  scope: "global" | "private" | "shared";
  name: string;
  category: string;
  image: string;
  thumbnail?: string;
  createdAt: string;
  deletedAt: string | null;
  canManage: boolean;
}

const ASSET_CATEGORY_OPTIONS: ReadonlyArray<string> = [
  "print", "fabric", "colorcard", "sketch",
  "model", "garment", "accessory", "pose", "background",
  "refvideo", "audio",
];

const ASSETS_PAGE_SIZE = 24;

function assetCategoryLabel(value: string): string {
  return (ASSET_LEAF_LABEL as Record<string, string>)[value] ?? value;
}

/**
 * 管理员资产库：浏览全部用户上传的素材。
 *
 * 数据来自 GET /api/assets —— 该接口对 admin 已放开全部可见性并返回归属人；
 * 本组件只做展示与筛选，权限判定仍在服务端（管理员仅能删除自己的或全局资产）。
 */
function AdminAssetsPanel({ users }: { users: ManagedUser[] }) {
  const [items, setItems] = useState<AdminAssetItem[]>([]);
  const [category, setCategory] = useState("");
  const [owner, setOwner] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [withDeleted, setWithDeleted] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(ASSETS_PAGE_SIZE),
        offset: String(offset),
      });
      if (category) params.set("category", category);
      if (owner) params.set("ownerId", owner);
      if (search) params.set("search", search);
      if (withDeleted) params.set("deleted", "true");
      const response = await fetch(`/api/assets?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`加载失败（HTTP ${response.status}）`);
      setItems(await response.json() as AdminAssetItem[]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category, owner, search, withDeleted, offset]);

  useEffect(() => {
    void load();
  }, [load]);

  /** 任一筛选变化都要回到第一页，否则会出现空页。 */
  const changeFilter = (apply: () => void) => {
    apply();
    setOffset(0);
  };

  const removeAsset = async (item: AdminAssetItem) => {
    if (!window.confirm(`确定删除资产「${item.name}」？删除后进入待清理队列。`)) return;
    const response = await fetch(`/api/assets/${item.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError(response.status === 403 ? "无权删除其他用户的私有资产" : `删除失败（HTTP ${response.status}）`);
      return;
    }
    await load();
  };

  const page = Math.floor(offset / ASSETS_PAGE_SIZE) + 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          value={category}
          onChange={(event) => changeFilter(() => setCategory(event.target.value))}
          className="rounded-sm border border-(--gc-border) bg-(--gc-control) px-2 py-1 text-xs"
        >
          <option value="">全部分类</option>
          {ASSET_CATEGORY_OPTIONS.map((value) => (
            <option key={value} value={value}>{assetCategoryLabel(value)}</option>
          ))}
        </select>
        <select
          value={owner}
          onChange={(event) => changeFilter(() => setOwner(event.target.value))}
          className="rounded-sm border border-(--gc-border) bg-(--gc-control) px-2 py-1 text-xs"
        >
          <option value="">全部用户</option>
          {users.map((item) => (
            <option key={item.id} value={item.id}>{item.displayName} · {item.accountId}</option>
          ))}
        </select>
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") changeFilter(() => setSearch(searchInput.trim()));
          }}
          onBlur={() => changeFilter(() => setSearch(searchInput.trim()))}
          placeholder="按名称搜索，回车确认"
          className="w-48 rounded-sm border border-(--gc-border) bg-(--gc-control) px-2 py-1 text-xs"
        />
        <label className="flex items-center gap-1.5 text-xs text-(--gc-text-muted)">
          <input
            type="checkbox"
            checked={withDeleted}
            onChange={(event) => changeFilter(() => setWithDeleted(event.target.checked))}
          />
          含已删除
        </label>
        <button
          onClick={() => void load()}
          className="rounded-sm border border-(--gc-border) px-3 py-1 text-xs"
        >
          刷新
        </button>
      </div>

      {error && <p className="mb-2 rounded-sm bg-red-950/20 px-3 py-2 text-xs text-red-400">{error}</p>}

      <div className="min-h-0 flex-1 overflow-auto rounded-sm border border-(--gc-border)">
        <table className="w-full text-left text-label">
          <thead className="sticky top-0 bg-(--gc-panel) text-(--gc-text-muted)">
            <tr>
              <th className="p-2">预览</th>
              <th>名称</th>
              <th>分类</th>
              <th>归属</th>
              <th>上传时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-(--gc-border)">
                <td className="p-2">
                  <img
                    src={item.thumbnail || item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    loading="lazy"
                    className="h-12 w-12 rounded-sm border border-(--gc-border) object-cover"
                  />
                </td>
                <td className="max-w-[220px] truncate pr-2" title={item.name}>{item.name}</td>
                <td>{assetCategoryLabel(item.category)}</td>
                <td>
                  {item.ownerName ?? "—"}
                  {item.scope === "global" && <span className="ml-1 text-(--gc-text-muted)">（全局）</span>}
                  {item.scope === "shared" && <span className="ml-1 text-(--gc-text-muted)">（共享）</span>}
                </td>
                <td>{new Date(item.createdAt).toLocaleString("zh-CN")}</td>
                <td>{item.deletedAt ? <span className="text-red-400">待清理</span> : <span className="text-emerald-400">正常</span>}</td>
                <td>
                  <div className="flex gap-2">
                    <a href={item.image} target="_blank" rel="noreferrer" className="rounded-sm border border-(--gc-border) px-2 py-1">查看</a>
                    {item.canManage && !item.deletedAt && (
                      <button onClick={() => void removeAsset(item)} className="rounded-sm border border-red-900/50 px-2 py-1 text-red-400">删除</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr><td colSpan={7} className="p-6 text-center text-(--gc-text-muted)">没有匹配的资产</td></tr>
            )}
            {loading && items.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-(--gc-text-muted)">加载中…</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-(--gc-text-muted)">
        <span>第 {page} 页 · 本页 {items.length} 条</span>
        <button
          disabled={offset === 0}
          onClick={() => setOffset(Math.max(0, offset - ASSETS_PAGE_SIZE))}
          className="ml-auto rounded-sm border border-(--gc-border) px-3 py-1 disabled:opacity-40"
        >
          上一页
        </button>
        <button
          disabled={items.length < ASSETS_PAGE_SIZE}
          onClick={() => setOffset(offset + ASSETS_PAGE_SIZE)}
          className="rounded-sm border border-(--gc-border) px-3 py-1 disabled:opacity-40"
        >
          下一页
        </button>
      </div>
    </div>
  );
}

interface AdminHistoryRecord {
  id: string;
  image: string;
  thumbnail: string;
  providerImages?: string[];
  projectName?: string;
  nodeLabel?: string;
  model?: string | null;
  ownerId: string;
  ownerName: string;
  prompt?: string;
  requestedCount?: number;
  successfulCount?: number;
  status: string;
  error?: string | null;
  startedAt: number;
  finishedAt?: number | null;
}

const HISTORY_PAGE_SIZE = 24;

function historyStatusLabel(status: string): { text: string; tone: string } {
  switch (status) {
    // 历史接口的 status 可能来自输出行（success/error）或运行行（succeeded/failed），两者都要认
    case "success":
    case "succeeded": return { text: "成功", tone: "text-emerald-400" };
    case "error":
    case "failed": return { text: "失败", tone: "text-red-400" };
    case "outcome_unknown": return { text: "结果未知", tone: "text-amber-400" };
    case "cancelled": return { text: "已取消", tone: "text-(--gc-text-muted)" };
    case "running": return { text: "进行中", tone: "text-(--gc-accent)" };
    case "queued": return { text: "排队中", tone: "text-(--gc-text-muted)" };
    default: return { text: status || "—", tone: "text-(--gc-text-muted)" };
  }
}

/**
 * 管理员历史创作记录：只读浏览全部用户的生成历史。
 *
 * 刻意不复用画布的 `recentResults`——那里承载「作为输入 / 继续处理」等写操作，
 * 混入他人记录会跨用户串数据。这里只做审计查看。
 * 分页用服务端的 cursor 游标，本地维护游标栈以支持「上一页」。
 */
function AdminHistoryPanel({ users }: { users: ManagedUser[] }) {
  const [owner, setOwner] = useState("");
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([null]);
  const [pageIndex, setPageIndex] = useState(0);
  const [records, setRecords] = useState<AdminHistoryRecord[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cursor = cursorStack[pageIndex] ?? null;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: String(HISTORY_PAGE_SIZE) });
      if (owner) params.set("userId", owner);
      else params.set("all", "true");
      if (cursor) params.set("cursor", cursor);
      const response = await fetch(`/api/history?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`加载失败（HTTP ${response.status}）`);
      const body = await response.json() as { records?: AdminHistoryRecord[]; nextCursor?: string | null };
      setRecords(body.records ?? []);
      setNextCursor(body.nextCursor ?? null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setRecords([]);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  }, [owner, cursor]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeOwner = (value: string) => {
    setOwner(value);
    setCursorStack([null]);
    setPageIndex(0);
  };

  const goNext = () => {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev.slice(0, pageIndex + 1), nextCursor]);
    setPageIndex(pageIndex + 1);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          value={owner}
          onChange={(event) => changeOwner(event.target.value)}
          className="rounded-sm border border-(--gc-border) bg-(--gc-control) px-2 py-1 text-xs"
        >
          <option value="">全部用户</option>
          {users.map((item) => (
            <option key={item.id} value={item.id}>{item.displayName} · {item.accountId}</option>
          ))}
        </select>
        <button onClick={() => void load()} className="rounded-sm border border-(--gc-border) px-3 py-1 text-xs">刷新</button>
        <span className="ml-auto text-xs text-(--gc-text-muted)">按开始时间倒序，每页 {HISTORY_PAGE_SIZE} 条</span>
      </div>

      {error && <p className="mb-2 rounded-sm bg-red-950/20 px-3 py-2 text-xs text-red-400">{error}</p>}

      <div className="min-h-0 flex-1 overflow-auto rounded-sm border border-(--gc-border)">
        <table className="w-full text-left text-label">
          <thead className="sticky top-0 bg-(--gc-panel) text-(--gc-text-muted)">
            <tr>
              <th className="p-2">预览</th>
              <th>项目</th>
              <th>节点 / 模型</th>
              <th>归属</th>
              <th>出图</th>
              <th>状态</th>
              <th>开始时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const status = historyStatusLabel(record.status);
              return (
                <tr key={record.id} className="border-t border-(--gc-border)">
                  <td className="p-2">
                    {record.thumbnail || record.image ? (
                      <img
                        src={record.thumbnail || record.image}
                        alt={record.nodeLabel ?? record.id}
                        width={48}
                        height={48}
                        loading="lazy"
                        className="h-12 w-12 rounded-sm border border-(--gc-border) object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-sm border border-(--gc-border)" />
                    )}
                  </td>
                  <td className="max-w-[180px] truncate pr-2" title={record.projectName ?? ""}>{record.projectName ?? "—"}</td>
                  <td className="max-w-[160px] truncate pr-2" title={record.model ?? ""}>
                    {record.nodeLabel ?? "—"}
                    <span className="ml-1 text-(--gc-text-muted)">{record.model ?? ""}</span>
                  </td>
                  <td>{record.ownerName}</td>
                  <td>{record.successfulCount ?? 0}/{record.requestedCount ?? 0}</td>
                  <td className={status.tone} title={record.error ?? undefined}>{status.text}</td>
                  <td>{new Date(record.startedAt).toLocaleString("zh-CN")}</td>
                  <td>
                    {record.image
                      ? <a href={record.image} target="_blank" rel="noreferrer" className="rounded-sm border border-(--gc-border) px-2 py-1">查看</a>
                      : <span className="text-(--gc-text-muted)">—</span>}
                  </td>
                </tr>
              );
            })}
            {records.length === 0 && !loading && (
              <tr><td colSpan={8} className="p-6 text-center text-(--gc-text-muted)">没有历史记录</td></tr>
            )}
            {loading && records.length === 0 && (
              <tr><td colSpan={8} className="p-6 text-center text-(--gc-text-muted)">加载中…</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-(--gc-text-muted)">
        <span>第 {pageIndex + 1} 页 · 本页 {records.length} 条</span>
        <button
          disabled={pageIndex === 0}
          onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
          className="ml-auto rounded-sm border border-(--gc-border) px-3 py-1 disabled:opacity-40"
        >
          上一页
        </button>
        <button
          disabled={!nextCursor}
          onClick={goNext}
          className="rounded-sm border border-(--gc-border) px-3 py-1 disabled:opacity-40"
        >
          下一页
        </button>
      </div>
    </div>
  );
}
