import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { apiErrorMessage } from "@/lib/apiErrors";
import { featherForegroundToDataUrl } from "@/lib/mattingCompositor";

interface MattingDialogProps {
  open: boolean;
  source: string;
  sourceRef?: string;
  onMattingComplete: (mattedUrl: string) => void;
  onClose: () => void;
}

type Quality = "fast" | "medium" | "large";

/**
 * 画质档 → 服务端模型。
 *
 * 2026-10-23 改造：抠图从浏览器本地（@imgly/background-removal，每次要下载
 * 170MB 模型）改为服务端 rembg（rembg-service/，模型常驻内存、启动即预加载）。
 * 用户端零下载；边缘更锐利（isnet 过渡带 0.307% vs u2net 1.210%）。
 *
 * 服务端只预置了 isnet-general-use。其余模型需运维先放文件，
 * 否则 /remove 返回 503（刻意不触发 170MB 下载把请求挂死）。
 */
const MODEL_BY_QUALITY: Record<Quality, string> = {
  fast: "isnet-general-use",
  medium: "isnet-general-use",
  large: "isnet-general-use",
};

/**
 * 抠图请求的进度节点（0–100）。
 *
 * 旧实现按 @imgly 的 fetch:xxx / compute:* 两类阶段算（下载占 0-70）。
 * 现在模型常驻服务端、没有下载阶段，改成「上传 → 推理 → 羽化」三段。
 */
function progressFor(stage: "upload" | "infer" | "feather"): number {
  return stage === "upload" ? 15 : stage === "infer" ? 65 : 85;
}

/**
 * 把图片引用（本地 blob URL / data URL / `/api/files/...`）转成 dataUrl。
 *
 * 为什么要这一层：抠图入口的 `source` 可能是三种形态之一 ——
 *   1. `blob:` 本地刚上传还没落库
 *   2. `data:image/...` 直接内联
 *   3. `/api/files/xxx.png` 已落库
 * 服务端 route 统一收 base64 dataUrl，所以这里归一化。
 */
async function imageRefToDataUrl(source: string): Promise<string> {
  if (source.startsWith("data:image/")) return source;
  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`无法读取原图（HTTP ${response.status}）`);
  }
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("无法读取原图数据"));
    reader.readAsDataURL(blob);
  });
}

/**
 * 失败提示翻译。
 *
 * 服务端（server/routes/matting.ts 的 describeMattingError）已经把 Python 侧
 * 的错误翻成中文并写进 `error` 字段，这里再兜一层网络层失败。
 */
function describeMattingError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (!raw) return "抠图失败，请稍后重试";
  if (/Failed to fetch|NetworkError|network|load failed/i.test(raw)) {
    return "无法连接抠图服务，请检查网络后重试";
  }
  if (/AbortError|timeout/i.test(raw)) {
    return "抠图超时，请换一张更小的图片或稍后重试";
  }
  // 服务端已翻好的中文，原样透出
  return raw;
}

export function MattingDialog({
  open,
  source,
  sourceRef: _sourceRef,
  onMattingComplete,
  onClose,
}: MattingDialogProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageLabel, setStageLabel] = useState<string>("");
  /** 已上传的抠图结果 URL；非 null 时左侧预览切到结果并出现「采用/放弃」。 */
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<Quality>("medium");
  const [featherRadius, setFeatherRadius] = useState(8);

  /** 调库抠图 → alpha 边缘羽化 → 上传；成功只 setResult（不再立即替换原图）。 */
  const handleMatting = useCallback(async () => {
    const img = imgRef.current;
    if (!img || processing) return;
    if (!img.complete || !img.naturalWidth) {
      setError("原图未加载完成");
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setStageLabel("准备抠图…");

    try {
      // 原图 → dataUrl（服务端 route 收 base64，与 /api/files 一致）
      setStageLabel("上传原图…");
      setProgress(progressFor("upload"));
      const sourceDataUrl = await imageRefToDataUrl(source);

      // 服务端抠图：rembg（isnet-general-use）返回透明底 PNG
      setStageLabel("AI 抠图计算…");
      setProgress(progressFor("infer"));
      const res = await fetch("/api/matting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: sourceDataUrl, model: MODEL_BY_QUALITY[quality] }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok) {
        // 服务端已把 Python 侧错误翻成中文（describeMattingError），直接透出
        throw new Error(
          typeof data.error === "string" && data.error
            ? data.error
            : apiErrorMessage(res.status, data, `抠图失败 HTTP ${res.status}`),
        );
      }
      if (typeof data.url !== "string" || !data.url) {
        throw new Error("服务端返回无效的图片 URL");
      }

      // 羽化在本地做：只作用 alpha 边缘，RGB 主体不糊。
      // 服务端返回的是已落库的 URL，先取回字节再做 alpha 羽化。
      setStageLabel("合成与羽化…");
      setProgress(progressFor("feather"));
      const { featherStoredImageUrl } = await import("@/lib/mattingCompositor");
      const finalUrl = await featherStoredImageUrl(data.url, featherRadius);

      setProgress(100);
      // 先预览，由用户「采用」才替换原图（旧代码直接 onComplete+onClose）。
      setResult(finalUrl);
    } catch (err) {
      // 失败给明确中文提示，绝不静默。
      setError(describeMattingError(err));
      setProgress(0);
    } finally {
      setProcessing(false);
      setStageLabel("");
    }
  }, [source, quality, featherRadius, processing]);

  /** 采用当前结果：写回节点并关闭。 */
  const handleAdopt = useCallback(() => {
    if (!result) return;
    onMattingComplete(result);
    onClose();
  }, [result, onMattingComplete, onClose]);

  /** 放弃当前结果：切回原图，允许调参重跑（不替换、保留对话框）。 */
  const handleDiscard = useCallback(() => {
    setResult(null);
    setProgress(0);
    setError(null);
  }, []);

  const busy = processing;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !busy) onClose();
      }}
    >
      <DialogContent
        overlayClassName="bg-black/70"
        className="flex h-[min(90vh,900px)] w-[min(95vw,1200px)] max-w-none flex-col gap-4 rounded-lg"
      >
        <DialogTitle>自动抠图</DialogTitle>

        <div className="flex min-h-0 flex-1 gap-4">
          {/* 左侧：预览（有结果时切到抠后图，否则原图）；棋盘格透出 alpha */}
          <div className="flex min-w-0 flex-1 items-center justify-center overflow-auto rounded-lg bg-[var(--gc-control)]">
            <div
              className="alpha-checkerboard relative inline-block"
            >
              <img
                ref={imgRef}
                src={result ?? source}
                alt={result ? "抠图结果" : "抠图原图"}
                data-testid="matting-preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
              {busy && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                  <div className="text-center text-white">
                    <div className="text-sm font-medium">{stageLabel || "处理中..."}</div>
                    <div className="mt-2 text-xs opacity-75">{progress}%</div>
                    <div className="mt-3 h-1 w-32 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full bg-gold transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：控制面板 */}
          <aside className="flex w-56 shrink-0 flex-col gap-4 rounded-lg border border-[var(--gc-border)] bg-[var(--gc-panel)] p-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-[var(--gc-text)]">
                处理选项
              </h3>

              {/* 质量等级 */}
              <div className="flex flex-col gap-1">
                <label className="text-label text-[var(--gc-text-muted)]">
                  质量等级
                </label>
                <div className="flex gap-1">
                  {(["fast", "medium", "large"] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuality(q)}
                      disabled={busy || result !== null}
                      className={`flex-1 rounded-sm px-2 py-1 text-xs transition-colors ${
                        quality === q
                          ? "border-gold bg-gold/20 text-gold"
                          : "border border-[var(--gc-border)] text-[var(--gc-text-muted)] hover:text-[var(--gc-text)]"
                      }`}
                    >
                      {q === "fast" ? "快" : q === "medium" ? "中" : "高"}
                    </button>
                  ))}
                </div>
              </div>

              {/* 边缘羽化（只作用 alpha 边缘） */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-label text-[var(--gc-text-muted)]">
                  <span>边缘羽化</span>
                  <span className="tabular-nums">{featherRadius}px</span>
                </div>
                <Slider
                  disabled={busy || result !== null}
                  value={[featherRadius]}
                  min={0}
                  max={32}
                  step={1}
                  onValueChange={(val) => setFeatherRadius(val[0])}
                  className="w-full"
                />
              </div>
            </div>

            {error && (
              <div
                className="rounded-md bg-red-950/20 p-2 text-xs text-red-400"
                data-testid="matting-error"
              >
                {error}
              </div>
            )}

            {result ? (
              // 结果态：采用 / 放弃（不再静默直接替换）
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleAdopt}
                  className="w-full bg-gold text-[var(--gc-accent-cta-ink)]"
                  data-testid="matting-adopt"
                >
                  采用结果
                </Button>
                <Button
                  onClick={handleDiscard}
                  variant="outline"
                  className="w-full border-[var(--gc-border)] text-[var(--gc-text)]"
                  data-testid="matting-discard"
                >
                  放弃，重调参数
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleMatting}
                  disabled={busy}
                  className="w-full bg-gold text-[var(--gc-accent-cta-ink)]"
                  data-testid="matting-run"
                >
                  {busy ? "处理中..." : "开始抠图"}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={busy}
                  className="w-full border-[var(--gc-border)] text-[var(--gc-text)]"
                >
                  取消
                </Button>
              </div>
            )}

            <p className="text-xs leading-relaxed text-[var(--gc-text-muted)]">
              选择质量等级和边缘羽化，点击「开始抠图」。完成后可先预览，采用才会替换原图。
            </p>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
