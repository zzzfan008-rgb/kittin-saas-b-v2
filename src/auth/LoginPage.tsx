import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, type CurrentUser } from "./AuthContext";
import { broadcastAuthChange, prepareWorkspaceForLogin } from "./session";
import { suppressWorkspaceUnloadWarning } from "@/lib/workspaceUnload";
import { apiErrorMessage } from "@/lib/apiErrors";

export function LoginPage() {
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, password }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; user?: CurrentUser };
      if (!response.ok) {
        throw new Error(apiErrorMessage(response.status, body, `登录失败（HTTP ${response.status}）`));
      }
      if (!body.user?.id) throw new Error("登录响应缺少用户信息");
      // 同账号恢复本机草稿；只有切换到不同账号时才清除旧画布。
      prepareWorkspaceForLogin(window.sessionStorage, window.localStorage, body.user.id);
      broadcastAuthChange(window.localStorage, "login", body.user.id);
      suppressWorkspaceUnloadWarning();
      window.location.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative isolate grid h-full overflow-y-auto bg-[var(--gc-canvas)] text-[var(--gc-text)] lg:grid-cols-[1fr_480px]">
      {/* 左:品牌叙事区(1024 以下隐藏) */}
      <aside
        aria-hidden="true"
        className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 80%, color-mix(in srgb, var(--gc-accent) 6%, transparent), transparent), linear-gradient(160deg, var(--gc-shell) 0%, var(--gc-panel) 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--gc-text-muted) 18%, transparent) 1px, transparent 1.3px) 0 0/28px 28px",
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--gc-accent)] text-sm font-extrabold tracking-tight text-[var(--gc-accent-cta-ink)] shadow-[0_2px_8px_color-mix(in_srgb,var(--gc-accent)_30%,transparent)]">
            GC
          </span>
          <span className="text-[15px] font-bold tracking-tight">Garment Canvas</span>
        </div>
        <div className="relative z-10 max-w-[520px]">
          <p className="font-mono text-meta-en uppercase tracking-[0.18em] text-[var(--gc-text-muted)]">
            COIN AI · CANVAS STUDIO
          </p>
          <h1 className="mt-4 text-[clamp(36px,4vw,52px)] font-bold leading-[1.08] tracking-[-0.03em]">
            让每一张面料，
            <br />
            都有<span className="text-[var(--gc-accent)]">无限画布</span>。
          </h1>
          <p className="mt-[18px] max-w-[400px] text-[15px] leading-relaxed text-[var(--gc-text-muted)]">
            节点式 AI 工作台，为服装设计师而生。从草图到成衣效果图，从图案迁移到视频展示——在一个画布里完成。
          </p>
        </div>
        <div className="relative z-10 flex gap-8">
          {["节点式工作流", "多模型生成", "团队项目空间"].map((feature) => (
            <span key={feature} className="flex items-center gap-2.5 text-xs tracking-tight text-[var(--gc-text-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--gc-accent)] shadow-[0_0_8px_color-mix(in_srgb,var(--gc-accent)_50%,transparent)]" />
              {feature}
            </span>
          ))}
        </div>
      </aside>

      {/* 右:登录卡 */}
      <section className="relative z-10 flex min-h-full items-center justify-center bg-[var(--gc-canvas)] px-10 py-10">
        <form
          onSubmit={submit}
          data-testid="login-card"
          className="w-full max-w-[400px] rounded-[20px] bg-[var(--gc-panel)] p-9 text-[var(--gc-text)] shadow-[0_0_0_0.5px_color-mix(in_srgb,var(--gc-border)_60%,transparent),0_1px_2px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.1),0_20px_44px_rgba(0,0,0,0.18)]"
        >
          <div className="mb-7">
            <p className="font-mono text-meta-en uppercase tracking-[0.16em] text-[var(--gc-text-muted)]">
              Designer workspace
            </p>
            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em]">登录工作台</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--gc-text-muted)]">
              账号由管理员创建，同一账号仅允许一个设备在线。
            </p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold tracking-tight">账号</span>
            <Input
              autoFocus
              name="accountId"
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              autoComplete="username"
              placeholder="请输入账号"
              className="h-11 rounded-[10px] border-[var(--gc-border)] bg-[var(--gc-control)] px-3.5 text-[13.5px] placeholder:text-[var(--gc-text-muted)] focus-visible:border-[var(--gc-accent)] focus-visible:ring-[color-mix(in_srgb,var(--gc-accent)_18%,transparent)] focus-visible:ring-[3px]"
            />
          </label>

          <div className="mt-4">
            <label htmlFor="login-password" className="block text-xs font-semibold tracking-tight">
              密码
            </label>
            <div className="mt-1.5 flex h-11 overflow-hidden rounded-[10px] border border-[var(--gc-border)] bg-[var(--gc-control)] transition-[border-color,box-shadow] focus-within:border-[var(--gc-accent)] focus-within:ring-[3px] focus-within:ring-[color-mix(in_srgb,var(--gc-accent)_18%,transparent)]">
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="请输入密码"
                className="h-full flex-1 rounded-none border-0 bg-transparent px-3.5 text-[13.5px] shadow-none placeholder:text-[var(--gc-text-muted)] focus-visible:border-transparent focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? "隐藏输入内容" : "显示输入内容"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
                className="h-full w-11 shrink-0 rounded-none text-[var(--gc-text-muted)] hover:bg-[color-mix(in_srgb,var(--gc-text)_7%,transparent)] hover:text-[var(--gc-text)] focus-visible:ring-[color-mix(in_srgb,var(--gc-accent)_32%,transparent)] motion-reduce:transition-none"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2.4 12s3.5-6 9.6-6 9.6 6 9.6 6-3.5 6-9.6 6-9.6-6-9.6-6Z" />
                  <circle cx="12" cy="12" r="2.8" />
                  {showPassword && <path d="m4 4 16 16" />}
                </svg>
              </Button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-[10px] border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-[var(--gc-status-error,--gc-status-error,#dc2626)]"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting || !accountId || !password}
            aria-busy={submitting}
            className="mt-6 h-[46px] w-full rounded-[980px] bg-[var(--gc-accent)] text-sm font-bold tracking-[0.02em] text-[var(--gc-accent-cta-ink)] shadow-[0_4px_14px_color-mix(in_srgb,var(--gc-accent)_30%,transparent)] transition-[transform,filter,box-shadow] hover:-translate-y-px hover:brightness-105 focus-visible:ring-[color-mix(in_srgb,var(--gc-accent)_38%,transparent)] focus-visible:ring-[3px] focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.98] disabled:opacity-40 disabled:shadow-none motion-reduce:transform-none motion-reduce:transition-none"
          >
            {submitting ? "登录中…" : "登录"}
          </Button>

          <p className="mt-5 text-center text-label leading-5 text-[var(--gc-text-muted)]">如需重置密码，请联系管理员</p>
        </form>
      </section>
    </main>
  );
}

export function SessionEndedPage({ onContinue }: { onContinue: () => void }) {
  return (
    <main className="flex h-full items-center justify-center bg-[var(--gc-shell)] px-4 text-[var(--gc-text)]">
      <section className="w-full max-w-sm rounded-2xl border border-[var(--gc-border)] bg-[var(--gc-panel)] p-7 shadow-2xl">
        <p className="text-meta-en font-medium uppercase tracking-[0.35em] text-[var(--gc-accent)]">GARMENT CANVAS</p>
        <h1 className="mt-3 text-xl font-semibold">账号已在其他设备登录</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--gc-text-muted)]">
          为保护项目数据，本设备已退出工作区。已绑定当前账号的本机草稿会保留；使用其他账号登录时会安全清除，无法确认归属的旧缓存也不会继续加载。
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="mt-5 w-full rounded-lg bg-[var(--gc-accent)] py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          返回登录页
        </button>
      </section>
    </main>
  );
}

export function ChangePasswordPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirm) {
      setError("两次输入的新密码不一致");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(apiErrorMessage(response.status, body, "修改密码失败"));
      if (!user) throw new Error("登录状态已失效");
      broadcastAuthChange(window.localStorage, "auth-changed", user.id);
      suppressWorkspaceUnloadWarning();
      window.location.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex h-full items-center justify-center bg-[var(--gc-shell)] px-4 text-[var(--gc-text)]">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-[var(--gc-border)] bg-[var(--gc-panel)] p-7 shadow-2xl">
        <h1 className="text-xl font-semibold">首次登录，请修改密码</h1>
        <p className="mt-1 text-xs text-[var(--gc-text-muted)]">新密码至少 10 位，并同时包含字母和数字。</p>
        {[
          ["当前临时密码", currentPassword, setCurrentPassword, "current-password"],
          ["新密码", newPassword, setNewPassword, "new-password"],
          ["再次输入新密码", confirm, setConfirm, "new-password"],
        ].map(([label, value, setter, auto]) => (
          <label key={label as string} className="mt-4 block space-y-1.5">
            <span className="text-xs text-[var(--gc-text-muted)]">{label as string}</span>
            <input type="password" value={value as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)}
              autoComplete={auto as string} className="w-full rounded-lg border border-[var(--gc-border)] bg-[var(--gc-control)] px-3 py-2.5 text-sm outline-hidden focus:border-[var(--gc-accent)]" />
          </label>
        ))}
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={submitting || !currentPassword || !newPassword || !confirm}
          className="mt-5 w-full rounded-lg bg-[var(--gc-accent)] py-2.5 text-sm font-medium text-white disabled:opacity-50">
          {submitting ? "保存中…" : "修改密码并继续"}
        </button>
      </form>
    </main>
  );
}
