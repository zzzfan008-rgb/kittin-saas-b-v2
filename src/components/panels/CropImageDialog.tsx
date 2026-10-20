import { useCallback, useRef, useState } from "react";
import { Crop, PixelCrop, ReactCrop } from "react-image-crop";
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
    const { naturalWidth, naturalHeight } = imgRef.current;
    // 默认裁剪区域：中央 80%
    const margin = Math.min(naturalWidth, naturalHeight) * 0.1;
    setCrop({
      unit: "px",
      x: margin,
      y: margin,
      width: naturalWidth - margin * 2,
      height: naturalHeight - margin * 2,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        overlayClassName="bg-black/70"
        className="flex h-[min(90vh,900px)] w-[min(95vw,1200px)] max-w-none flex-col gap-4 rounded-lg"
      >
        <DialogTitle>裁剪图片</DialogTitle>

        <div className="flex min-h-0 flex-1 gap-4">
          {/* 左侧：裁剪画布 */}
          <div className="flex min-w-0 flex-1 items-center justify-center overflow-auto bg-[var(--gc-control)] rounded-lg">
            {source && (
              <ReactCrop
                crop={crop}
                onChange={(c: Crop) => setCrop(c)}
                onComplete={(c: PixelCrop) => setCompletedCrop(c)}
                circularCrop={false}
                locked={false}
                className="max-w-full max-h-full"
              >
                <img
                  ref={imgRef}
                  src={source}
                  alt="裁剪预览"
                  onLoad={handleImageLoad}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </ReactCrop>
            )}
          </div>

          {/* 右侧：信息和操作 */}
          <aside className="flex w-56 shrink-0 flex-col gap-4 rounded-lg border border-[var(--gc-border)] bg-[var(--gc-panel)] p-4">
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
