import { useCallback, useRef, useState } from "react";
import { Crop, PixelCrop, ReactCrop } from "react-image-crop";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { apiErrorMessage } from "@/lib/apiErrors";

interface CropImageDialogProps {
  open: boolean;
  source: string;
  sourceRef?: string;
  onCropComplete: (croppedUrl: string) => void;
  onClose: () => void;
}

export function CropImageDialog({
  open,
  source,
  sourceRef,
  onCropComplete,
  onClose,
}: CropImageDialogProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCrop = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      setError("请先框选裁剪区域");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const canvas = document.createElement("canvas");
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = completedCrop.width * pixelRatio;
      canvas.height = completedCrop.height * pixelRatio;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法获取 canvas 上下文");

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height,
      );

      // 转换为 blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (value) => (value ? resolve(value) : reject(new Error("裁剪失败"))),
          "image/png",
          0.95,
        );
      });

      // 转换为 data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // 上传到服务器
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

      onCropComplete(data.url);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "裁剪或上传失败，请重试",
      );
    } finally {
      setProcessing(false);
    }
  }, [completedCrop, onCropComplete, onClose]);

  const handleImageLoad = () => {
    if (!imgRef.current) return;
    // 2026-10-22 用户批注 3：打开时不预置裁剪框。自带一圈默认选区会被误读成
    // 「已选好可确认」，用户直接点确认就裁成非预期的中央 80%。
    // 保持 crop 初始 0×0，由用户自己拖出选区；未框选时确认按钮 disabled。
    setCrop({ unit: "px", x: 0, y: 0, width: 0, height: 0 });
    setCompletedCrop(null);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70"
        // 2026-10-22 用户批注 2：整体 UI 对齐蒙版重绘页——全屏分栏（左 stage + 右栏），
        // 不再是居中卡片。R-83：sm:max-w-none 必须显式补，否则 base sm:max-w-sm(384px) 穿透。
        className="top-0 left-0 flex h-dvh w-screen max-w-none sm:max-w-none translate-x-0 translate-y-0 gap-0 rounded-none bg-transparent p-0 ring-0"
        data-panel="crop"
        aria-label="裁剪图片"
      >
        <DialogTitle className="sr-only">裁剪图片</DialogTitle>

        <div className="flex min-h-0 flex-1 gap-0">
          {/* 左侧：裁剪画布。用 viewport 绝对约束替代百分比自引用（R-83 第二条：
              max-w-full 在收缩型 flex item 内会解析为 0，图直接塌缩）。 */}
          <main className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden p-6">
            {source && (
              <ReactCrop
                crop={crop}
                onChange={(c: Crop) => setCrop(c)}
                onComplete={(c: PixelCrop) => setCompletedCrop(c)}
                circularCrop={false}
                locked={false}
                className="max-w-[calc(100vw-360px)] max-h-[calc(100vh-64px)]"
              >
                <img
                  ref={imgRef}
                  src={source}
                  alt="裁剪预览"
                  onLoad={handleImageLoad}
                  style={{
                    maxWidth: "calc(100vw - 360px)",
                    maxHeight: "calc(100vh - 64px)",
                    objectFit: "contain",
                  }}
                />
              </ReactCrop>
            )}
          </main>

          {/* 右栏：对齐蒙版重绘页——全高、左边框、clamp 宽度、纵向滚动。 */}
          <aside className="flex h-full w-[clamp(256px,25%,360px)] shrink-0 flex-col gap-4 overflow-y-auto border-l border-[var(--gc-border)] bg-[var(--gc-panel)] p-4">
            <div className="flex items-center justify-between border-b border-[var(--gc-border)] pb-3">
              <h2 className="text-sm font-medium text-[var(--gc-text)]">裁剪图片</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="关闭"
                title="关闭（ESC）"
                onClick={onClose}
                disabled={processing}
              >
                <XIcon aria-hidden="true" className="size-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-[var(--gc-text)]">
                裁剪信息
              </h3>
              {completedCrop && (
                <dl className="space-y-1 text-label text-[var(--gc-text-muted)]">
                  <div className="flex justify-between">
                    <dt>宽</dt>
                    <dd>{Math.round(completedCrop.width)} px</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>高</dt>
                    <dd>{Math.round(completedCrop.height)} px</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>宽高比</dt>
                    <dd>
                      {(
                        completedCrop.width / completedCrop.height
                      ).toFixed(2)}
                    </dd>
                  </div>
                </dl>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-950/20 p-2 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleCrop}
                disabled={processing || !completedCrop}
                className="w-full bg-gold text-[var(--gc-accent-cta-ink)]"
              >
                {processing ? "处理中…" : "确认裁剪"}
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
              在左侧拖拽或调整手柄来框选裁剪区域，然后点击「确认裁剪」。
            </p>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
