import { useEffect, useRef, useState } from "react";
import { CircleHelpIcon, KeyboardIcon, PaletteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  retryTabSessionPersistence,
  selectActiveReadOnly,
  useFlowStore,
} from "@/store/flowStore";
import { THEMES, useTheme, type ThemeId } from "@/lib/theme";
import { OPEN_TUTORIAL_EVENT } from "@/tutorials/tutorialRuntime";
import { AccountMenu } from "./AccountMenu";

const THEME_PICKER_ID = "theme-picker-options";
const SHORTCUTS_PANEL_ID = "workbench-shortcuts";

function themePreviewColors(theme: ThemeId) {
  if (theme === "white") {
    return { shell: "#f5f5f7", panel: "#ffffff", line: "#d3d3d8", accent: "#e98fa8" };
  }
  if (theme === "eye") {
    return { shell: "#dcebd0", panel: "#eef5e8", line: "#a4bb94", accent: "#173b63" };
  }
  return { shell: "#101010", panel: "#1b1b1b", line: "#3a3a3a", accent: "#c9a66b" };
}

function ThemeMiniature({ theme }: { theme: ThemeId }) {
  const colors = themePreviewColors(theme);
  return (
    <span
      aria-hidden="true"
      className="relative block h-10 w-16 shrink-0 overflow-hidden rounded-md border border-white/10"
      style={{ backgroundColor: colors.shell }}
    >
      <span className="absolute inset-x-0 top-0 h-2" style={{ backgroundColor: colors.panel }} />
      <span className="absolute bottom-1.5 left-1.5 top-3 w-2 rounded-sm" style={{ backgroundColor: colors.panel }} />
      <span className="absolute left-5 top-3 h-3 w-4 rounded-sm border" style={{ borderColor: colors.line }} />
      <span className="absolute left-10 top-4 h-px w-3" style={{ backgroundColor: colors.line }} />
      <span className="absolute bottom-1.5 right-1.5 h-3 w-4 rounded-sm border" style={{ borderColor: colors.accent }} />
      <span className="absolute left-[35px] top-[19px] size-1 rounded-full" style={{ backgroundColor: colors.accent }} />
    </span>
  );
}

function ThemeSwitcher() {
  const [theme, switchTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = THEMES.find((item) => item.id === theme) ?? THEMES[0];

  const closeAndRestoreFocus = () => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as globalThis.Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && rootRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        closeAndRestoreFocus();
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as globalThis.Node | null)) setOpen(false);
      }}
    >
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="sm"
        aria-label={`切换主题，当前为${current.label}`}
        aria-controls={THEME_PICKER_ID}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="h-8 min-w-32 justify-between border-[var(--gc-border)] bg-[var(--gc-panel)] px-3 text-[11px] text-[var(--gc-text)] hover:border-[var(--gc-accent)]"
      >
        <PaletteIcon aria-hidden="true" className="size-3.5 text-[var(--gc-accent)]" />
        <span>{current.label}</span>
        <span aria-hidden="true" className="text-[9px] text-[var(--gc-text-muted)]">{open ? "▲" : "▼"}</span>
      </Button>

      {open && (
        <div
          id={THEME_PICKER_ID}
          role="menu"
          aria-label="主题"
          className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-xl border border-[var(--gc-border)] bg-[var(--gc-panel)] p-2 shadow-2xl shadow-black/60"
        >
          <p className="px-2 pb-2 pt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--gc-text-muted)]">主题</p>
          <div className="space-y-1">
            {THEMES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitemradio"
                aria-checked={theme === item.id}
                onClick={() => {
                  switchTheme(item.id);
                  closeAndRestoreFocus();
                }}
                className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
                  theme === item.id
                    ? "border-[var(--gc-accent)] bg-[var(--gc-panel-hover)]"
                    : "border-transparent hover:border-[var(--gc-border)] hover:bg-[var(--gc-panel-hover)]"
                }`}
              >
                <ThemeMiniature theme={item.id} />
                <span className="min-w-0 flex-1">
                  <span className={`block text-[11px] font-medium ${theme === item.id ? "text-[var(--gc-accent)]" : "text-[var(--gc-text)]"}`}>
                    {item.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[9px] text-[var(--gc-text-muted)]">{item.desc}</span>
                </span>
                {theme === item.id && <span className="text-xs text-[var(--gc-accent)]">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ShortcutKey({ children }: { children: string }) {
  return (
    <kbd className="min-w-6 rounded border border-[var(--gc-border)] bg-[var(--gc-control)] px-1.5 py-0.5 text-center font-mono text-[9px] leading-4 text-[var(--gc-text)] shadow-sm">
      {children}
    </kbd>
  );
}

function ShortcutMenu() {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const command = isMac ? "⌘" : "Ctrl";

  const clearTimers = () => {
    if (openTimer.current !== null) window.clearTimeout(openTimer.current);
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };

  useEffect(() => () => clearTimers(), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setPinned(false);
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const shortcuts = [
    { label: "保存", keys: [command, "S"] },
    { label: "撤销", keys: [command, "Z"] },
    { label: "重做", keys: isMac ? ["⇧", command, "Z"] : [command, "Shift", "Z"] },
    { label: "复制节点", keys: [command, "C"] },
    { label: "粘贴节点", keys: [command, "V"] },
    { label: "删除节点", keys: [isMac ? "⌫" : "Delete"] },
    { label: "关闭浮层", keys: ["Esc"] },
  ];

  return (
    <div
      className="relative"
      onPointerEnter={() => {
        clearTimers();
        if (!open) openTimer.current = window.setTimeout(() => setOpen(true), 180);
      }}
      onPointerLeave={() => {
        clearTimers();
        if (!pinned) closeTimer.current = window.setTimeout(() => setOpen(false), 150);
      }}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        if (!pinned && !event.currentTarget.contains(event.relatedTarget as globalThis.Node | null)) setOpen(false);
      }}
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="查看快捷键"
        aria-controls={SHORTCUTS_PANEL_ID}
        aria-expanded={open}
        aria-pressed={pinned}
        title="快捷键"
        onClick={() => {
          const nextPinned = !pinned;
          setPinned(nextPinned);
          setOpen(nextPinned);
        }}
        className="border-[var(--gc-border)] bg-[var(--gc-panel)] text-[var(--gc-text-muted)] hover:border-[var(--gc-accent)] hover:text-[var(--gc-text)]"
      >
        <KeyboardIcon aria-hidden="true" className="size-4" />
      </Button>

      {open && (
        <div
          id={SHORTCUTS_PANEL_ID}
          role="region"
          aria-label="快捷键说明"
          className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-xl border border-[var(--gc-border)] bg-[var(--gc-panel)] p-2 shadow-2xl shadow-black/60"
        >
          <div className="flex items-center justify-between border-b border-[var(--gc-border)] px-2 pb-2 pt-1">
            <span className="text-[11px] font-semibold text-[var(--gc-text)]">快捷键</span>
            <span className="text-[9px] text-[var(--gc-text-muted)]">{pinned ? "已固定" : "点击图标可固定"}</span>
          </div>
          <div className="pt-1">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.label} className="flex min-h-9 items-center justify-between gap-4 rounded-md px-2 hover:bg-[var(--gc-panel-hover)]">
                <span className="text-[10px] text-[var(--gc-text-muted)]">{shortcut.label}</span>
                <span className="flex items-center gap-1">
                  {shortcut.keys.map((key, index) => <ShortcutKey key={`${shortcut.label}-${index}`}>{key}</ShortcutKey>)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TopBar() {
  const readOnly = useFlowStore(selectActiveReadOnly);
  const tabSessionPersistenceError = useFlowStore((state) => state.tabSessionPersistenceError);

  return (
    <header className="gc-panel relative z-40 grid h-12 min-w-[1024px] shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--gc-border)] bg-[var(--gc-panel)] px-4">
      <div className="flex min-w-0 items-center gap-3 justify-self-start">
        <span className="whitespace-nowrap text-sm font-semibold tracking-[0.08em] text-[var(--gc-accent)]">Coin AI - Canvas</span>
        <span aria-hidden="true" className="h-5 w-px bg-[var(--gc-border)]" />
        <AccountMenu />
      </div>

      <div className="relative flex items-center justify-center">
        <ThemeSwitcher />
        <div className="absolute left-full ml-2">
          <ShortcutMenu />
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2 justify-self-end">
        {tabSessionPersistenceError && (
          <Button
            type="button"
            variant="destructive"
            size="xs"
            onClick={retryTabSessionPersistence}
            title={tabSessionPersistenceError}
          >
            本地恢复失败 · 重试
          </Button>
        )}
        {readOnly && (
          <span className="rounded-md border border-blue-400/40 px-2 py-1 text-[10px] text-blue-400">管理员只读</span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="打开使用教程"
          title="使用教程"
          onClick={() => window.dispatchEvent(new Event(OPEN_TUTORIAL_EVENT))}
          className="text-[var(--gc-text-muted)] hover:text-[var(--gc-text)]"
        >
          <CircleHelpIcon aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </header>
  );
}
