/**
 * 抠图合成的纯 Canvas 逻辑（MattingDialog 用）。
 *
 * 事实依据（@imgly/background-removal 1.7.0）：removeBackground 返回的 blob
 * 已是「原像素 + alpha=前景蒙版」的成品 PNG（见库 index.mjs removeBackground：
 * output alpha 取自 alphamask，RGB 保留原图）。因此：
 * - 不再需要 destination-in 二次合成（旧代码既多余又制造竞态）；
 * - 羽化只作用于 **alpha 通道边缘**：对 alpha 做高斯模糊再回填，RGB 主体不糊。
 */

/**
 * 对一张已抠好的带透明背景图做「边缘羽化」并导出 PNG dataURL。
 *
 * 顺序 await（createImageBitmap）保证：必须等位图解码完成后再 drawImage，
 * 彻底消除旧实现 maskImg.onload 与 canvas.toBlob 之间的竞态。
 *
 * @param foreground  removeBackground 返回的带 alpha 前景 Blob
 * @param featherRadius 羽化半径（px）；<=0 时仅转码、不改 alpha
 * @param createBitmap 可注入（测试/环境差异），默认全局 createImageBitmap
 * @returns PNG dataURL（data:image/png;base64,…）
 */
export async function featherForegroundToDataUrl(
  foreground: Blob,
  featherRadius: number,
  createBitmap: (blob: Blob) => Promise<ImageBitmap> = (b) =>
    globalThis.createImageBitmap(b),
): Promise<string> {
  // 顺序 await：位图未就绪绝不碰 canvas（旧 bug：缓存命中时 onload 同步、toBlob 抢先）。
  const bitmap = await createBitmap(foreground);
  const width = bitmap.width;
  const height = bitmap.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法获取 Canvas 2D 上下文");

  if (featherRadius <= 0) {
    ctx.drawImage(bitmap, 0, 0);
    return canvasToPngDataUrl(canvas);
  }

  // 1) 取出库输出的 RGBA（alpha 即前景蒙版）。
  ctx.drawImage(bitmap, 0, 0);
  const frame = ctx.getImageData(0, 0, width, height);
  const alpha = new Uint8ClampedArray(width * height);
  for (let i = 0; i < width * height; i += 1) alpha[i] = frame.data[i * 4 + 3];

  // 2) 只对 alpha 通道做可分离高斯模糊（水平+垂直两遍），半径按 sigma≈radius/3。
  const blurred = gaussianBlurAlpha(alpha, width, height, featherRadius);

  // 3) 回填模糊后的 alpha，RGB 保持原像素不变——羽化的是边缘透明度而非整图。
  for (let i = 0; i < width * height; i += 1) frame.data[i * 4 + 3] = blurred[i];
  ctx.putImageData(frame, 0, 0);

  return canvasToPngDataUrl(canvas);
}

/** canvas → PNG dataURL（经 toBlob，避免 toDataURL 的同步大对象）。 */
function canvasToPngDataUrl(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas 转 PNG 失败"));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error ?? new Error("DataURL 读取失败"));
        reader.readAsDataURL(blob);
      },
      "image/png",
      1.0,
    );
  });
}

/**
 * 可分离盒式近似高斯（3 趟 box blur，等价 sigma≈radius）作用于单通道 alpha。
 * 纯函数：输入 Uint8ClampedArray，返回新数组，便于无 DOM 单测。
 */
export function gaussianBlurAlpha(
  src: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
): Uint8ClampedArray {
  const r = Math.max(1, Math.round(radius));
  let out = boxBlurAlpha(src, width, height, r, true);
  out = boxBlurAlpha(out, width, height, r, false);
  // 第三趟让边缘过渡更接近高斯（比两趟 box 更平滑）。
  out = boxBlurAlpha(out, width, height, r, true);
  return out;
}

/** 一趟 box blur（horizontal=true 横向，false 纵向），边界用 clamp 采样。 */
function boxBlurAlpha(
  src: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
  horizontal: boolean,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(src.length);
  const span = radius * 2 + 1;
  if (horizontal) {
    for (let y = 0; y < height; y += 1) {
      const row = y * width;
      let sum = 0;
      for (let x = -radius; x <= radius; x += 1) {
        sum += src[row + clampIndex(x, width)];
      }
      for (let x = 0; x < width; x += 1) {
        out[row + x] = Math.round(sum / span);
        const xOut = clampIndex(x - radius, width);
        const xIn = clampIndex(x + radius + 1, width);
        sum += src[row + xIn] - src[row + xOut];
      }
    }
  } else {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      for (let y = -radius; y <= radius; y += 1) {
        sum += src[clampIndex(y, height) * width + x];
      }
      for (let y = 0; y < height; y += 1) {
        out[y * width + x] = Math.round(sum / span);
        const yOut = clampIndex(y - radius, height);
        const yIn = clampIndex(y + radius + 1, height);
        sum += src[yIn * width + x] - src[yOut * width + x];
      }
    }
  }
  return out;
}

function clampIndex(i: number, size: number): number {
  if (i < 0) return 0;
  if (i >= size) return size - 1;
  return i;
}

/**
 * 把服务端存好的抠图结果（`/api/files/:id` URL）取回本地做 alpha 羽化，返回 dataUrl。
 *
 * 为什么羽化留在前端而不是服务端：
 * 服务端只负责 rembg 的精确抠像（它的 alpha 已经是最准的）；羽化是**用户可调**的
 * 呈现参数（滑杆 0-40），放在前端才能实时预览，不必每调一次都跑一遍推理。
 *
 * 这个封装存在的意义：`featherForegroundToDataUrl` 只吃 Blob，
 * 而服务端返回的是 URL，中间需要一次 fetch。
 */
export async function featherStoredImageUrl(
  url: string,
  featherRadius: number,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`无法读取抠图结果（HTTP ${response.status}）`);
  }
  const blob = await response.blob();
  return featherForegroundToDataUrl(blob, featherRadius);
}
