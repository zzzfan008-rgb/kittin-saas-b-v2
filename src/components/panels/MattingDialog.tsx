import { useCallback, useRef, useState } from "react";
import { removeBackground } from "@imgly/background-removal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { apiErrorMessage } from "@/lib/apiErrors";

interface MattingDialogProps {
  open: boolean;
  source: string;
  sourceRef?: string;
  onMattingComplete: (mattedUrl: string) => void;
  onClose: () => void;
}

type Quality = "fast" | "medium" | "large";

export function MattingDialog({
  open,
  source,
  sourceRef,
  onMattingComplete,
  onClose,
}: MattingDialogProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<Quality>("medium");
  const [featherRadius, setFeatherRadius] = useState(8);

  const handleMatting = useCallback(async () => {
    if (!imgRef.current) return;

    setProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // 1. 加载原图
      const img = imgRef.current;
      if (!img.complete || !img.naturalWidth) {
        throw new Error("原图未加载完成");
      }

      setProgress(10);

      // 2. 调用 removeBackground
      const blob = await removeBackground(source, {
        model: quality === "fast" ? "small" : quality === "medium" ? "medium" : "large",
        publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal/dist/assets",
      });

      setProgress(60);

      // 3. Canvas 合成
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas 未初始化");

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法获取 Canvas 上下文");

      // 3a. 创建掩膜图片
      const maskImg = new Image();
      maskImg.onload = () => {
        // 3b. 绘制原图
        ctx.drawImage(img, 0, 0);

        // 3c. 创建临时 canvas 用于 alpha 合成
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = img.naturalWidth;
        tempCanvas.height = img.naturalHeight;
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) throw new Error("临时 Canvas 失败");

        // 3d. 绘制原图和掩膜
        tempCtx.drawImage(img, 0, 0);
        tempCtx.globalCompositeOperation = "destination-in";
        tempCtx.drawImage(maskImg, 0, 0);

        // 3e. 如果需要羽化，应用羽化效果
        if (featherRadius > 0) {
          ctx.filter = `blur(${featherRadius}px)`;
        }

        // 3f. 绘制到最终 canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.filter = "none";
      };

      maskImg.onerror = () => {
        throw new Error("掩膜图片加载失败");
      };

      maskImg.src = URL.createObjectURL(blob);

      setProgress(85);

      // 4. 转换为 DataURL (PNG with Alpha)
      const dataUrl = await new Promise<string>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas 转换失败"));
              return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          },
          "image/png",
          1.0,
        );
      });

      setProgress(90);

      // 5. 上传到服务器
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
        throw new Error(
          apiErrorMessage(res.status, data, `上传失败 HTTP ${res.status}`),
        );
      }

      if (typeof data.url !== "string" || !data.url) {
        throw new Error("服务端返回无效的图片 URL");
      }

      setProgress(100);
      setResult(data.url);
      onMattingComplete(data.url);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "抠图处理失败，请重试",
      );
      setProgress(0);
    } finally {
      setProcessing(false);
    }
  }, [source, quality, featherRadius, onMattingComplete, onClose]);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        overlayClassName="bg-black/70"
        className="flex h-[min(90vh,900px)] w-[min(95vw,1200px)] max-w-none flex-col gap-4 rounded-lg"
      >
        <DialogTitle>自动抠图</DialogTitle>

        <div className="flex min-h-0 flex-1 gap-4">
          {/* 左侧：预览 */}
          <div className="flex min-w-0 flex-1 items-center justify-center overflow-auto rounded-lg bg-[var(--gc-control)]">
            <div className="relative inline-block">
              <img
                ref={imgRef}
                src={source}
                alt="抠图原图"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
              {processing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-center text-white">
                    <div className="text-sm font-medium">处理中...</div>
                    <div className="mt-2 text-xs opacity-75">{progress}%</div>
                    <div className="mt-3 h-1 w-32 bg-white/20 rounded-full overflow-hidden">
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
                      disabled={processing}
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

              {/* 羽化 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-label text-[var(--gc-text-muted)]">
                  <span>羽化</span>
                  <span className="tabular-nums">{featherRadius}px</span>
                </div>
                <Slider
                  disabled={processing}
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
              <div className="rounded-md bg-red-950/20 p-2 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleMatting}
                disabled={processing}
                className="w-full bg-gold text-[var(--gc-accent-cta-ink)]"
              >
                {processing ? "处理中..." : "开始抠图"}
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                disabled={processing}
                className="w-full border-[var(--gc-border)] text-[var(--gc-text)]"
              >
                取消
              </Button>
            </div>

            <p className="text-xs leading-relaxed text-[var(--gc-text-muted)]">
              选择质量等级和羽化参数，点击「开始抠图」处理图片。处理时间取决于质量等级。
            </p>
          </aside>
        </div>

        {/* 隐藏 canvas 用于合成 */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
