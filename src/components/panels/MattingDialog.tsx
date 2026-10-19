import { useCallback, useRef, useState } from "react";
import { removeBackground, type Config } from "@imgly/background-removal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { apiErrorMessage } from "@/lib/apiErrors";
import { featherForegroundToDataUrl } from "@/lib/mattingCompositor";
import {
  MATTING_PUBLIC_PATH,
  describeMattingResourceError,
} from "@/lib/mattingModelSource";

interface MattingDialogProps {
  open: boolean;
  source: string;
  sourceRef?: string;
  onMattingComplete: (mattedUrl: string) => void;
  onClose: () => void;
}

type Quality = "fast" | "medium" | "large";

/**
 * 处理阶段：把库的 progress(key, current, total) 归一到 0–100。
 * 库有两类阶段：fetch:xxx（下载资源，主要等待）与 compute:*（decode/inference/mask/encode）。
 */
function mapProgress(key: string, current: number, total: number): number {
  if (key.startsWith("fetch:")) {
    const ratio = total > 0 ? Math.min(1, current / total) : 0;
    return Math.round(ratio * 70); // 下载占 0–70
  }
  const step = Math.min(4, Math.max(0, current)); // compute:decode=0/4 … encode=4/4
  return Math.round(70 + (step / 4) * 30);
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
    setStageLabel("加载抠图模型…");

    try {
      const model: Config["model"] =
        quality === "fast" ? "isnet_quint8" : quality === "medium" ? "isnet_fp16" : "isnet";

      // 库返回的 blob 已是「原像素 + alpha=前景蒙版」成品 PNG；接真实进度回调。
      const foreground = await removeBackground(source, {
        model,
        publicPath: MATTING_PUBLIC_PATH,
        progress: (key, current, total) => {
          setStageLabel(key.startsWith("fetch:") ? "下载模型资源…" : "AI 抠图计算…");
          setProgress(mapProgress(key, current, total));
        },
      });

      setStageLabel("合成与羽化…");
      // 顺序 await（createImageBitmap）消除旧实现 maskImg.onload/toBlob 竞态；
      // 羽化只作用 alpha 通道边缘（RGB 主体不糊）。
      const dataUrl = await featherForegroundToDataUrl(foreground, featherRadius);

      setStageLabel("上传结果…");
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(apiErrorMessage(res.status, data, `上传失败 HTTP ${res.status}`));
      }
      if (typeof data.url !== "string" || !data.url) {
        throw new Error("服务端返回无效的图片 URL");
      }

      setProgress(100);
      // 关键修复：先预览，由用户「采用」才替换原图（旧代码直接 onComplete+onClose）。
      setResult(data.url);
    } catch (err) {
      // 资源/网络类失败给明确中文提示（#4），其余透出原始信息，绝不静默。
      setError(describeMattingResourceError(err));
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
