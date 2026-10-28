/**
 * 参考图 alpha 压平（用户 2026-10-28 拍板，来自 pixeltamer skill 的实测结论）。
 *
 * 为什么：透明 PNG 当参考图时，模型读到的不只是"抠好的主体"——边缘是预乘 alpha 的
 * 半透明像素，全透明区域底下还藏着原始场景的 RGB（常见一整块幽灵背景）。模型会把这些
 * 一起当成参考信息，表现为主体边缘发灰、背景渗色、结果里出现原图残影。
 *
 * 因此：参考图副本一律压到不透明底（默认白色，服装电商标配），产物原图不动。
 * 只处理真有 alpha 通道且确实带透明的图；不透明图零成本返回原 dataURL。
 */
import sharp from "sharp";
import { validateImageDataUrl } from "./imageValidation.js";

/** 压平背景色：服装/商品出图统一用白色，避免引入新色调。 */
const FLATTEN_BACKGROUND = { r: 255, g: 255, b: 255 };

/**
 * 若 dataURL 是带透明通道的图，压到白底后返回新的 JPEG dataURL；否则原样返回。
 * 失败一律返回原值（参考图不能被这个增强步骤阻断）。
 */
export async function flattenReferenceAlpha(dataUrl: string): Promise<string> {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) return dataUrl;
  try {
    const validated = validateImageDataUrl(dataUrl);
    if (!validated.mime.startsWith("image/")) return dataUrl;
    const metadata = await sharp(validated.buffer).metadata();
    if (!metadata.hasAlpha) return dataUrl;
    const flattened = await sharp(validated.buffer)
      .rotate()
      .flatten({ background: FLATTEN_BACKGROUND })
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();
    return `data:image/jpeg;base64,${flattened.toString("base64")}`;
  } catch {
    return dataUrl;
  }
}
