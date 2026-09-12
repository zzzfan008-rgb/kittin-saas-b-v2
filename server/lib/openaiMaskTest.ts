import OpenAI, { toFile } from "openai";
import sharp from "sharp";

export const NATIVE_MASK_MODEL = "gpt-image-2";
export const NATIVE_MASK_MAX_BYTES = 50 * 1024 * 1024;

export class NativeMaskInputError extends Error {}

export async function inspectNativeMaskPng(buffer: Buffer, requireAlpha = false) {
  if (!buffer.length || buffer.length >= NATIVE_MASK_MAX_BYTES) throw new NativeMaskInputError("PNG 文件必须小于 50MB");
  try {
    const image = sharp(buffer, { failOn: "error", limitInputPixels: 40_000_000, animated: false });
    const meta = await image.metadata();
    if (meta.format !== "png" || (meta.pages ?? 1) > 1 || !meta.width || !meta.height) throw new Error("PNG required");
    if (requireAlpha && !meta.hasAlpha) throw new NativeMaskInputError("蒙版必须包含 Alpha 通道，透明区域表示允许修改");
    await image.stats();
    return { width: meta.width, height: meta.height, hasAlpha: Boolean(meta.hasAlpha) };
  } catch (error) {
    if (error instanceof NativeMaskInputError) throw error;
    throw new NativeMaskInputError("无法读取 PNG 图片，文件可能损坏或尺寸过大");
  }
}

export async function validateNativeMaskPair(image: Buffer, mask: Buffer) {
  const source = await inspectNativeMaskPng(image);
  const selection = await inspectNativeMaskPng(mask, true);
  if (source.width !== selection.width || source.height !== selection.height) {
    throw new NativeMaskInputError("原图和蒙版的像素尺寸必须完全相同");
  }
}

/** Official Images API example: no prompt rendering, resizing, or output compositing. */
export async function callNativeMaskEdit(
  client: Pick<OpenAI, "images">,
  input: { image: Buffer; mask: Buffer; prompt: string },
): Promise<Buffer> {
  if (!input.prompt.trim() || input.prompt.length > 32000) throw new NativeMaskInputError("请填写不超过 32000 字符的提示词");
  await validateNativeMaskPair(input.image, input.mask);
  const response = await client.images.edit({
    model: NATIVE_MASK_MODEL,
    image: await toFile(input.image, "image.png", { type: "image/png" }),
    mask: await toFile(input.mask, "mask.png", { type: "image/png" }),
    prompt: input.prompt,
  });
  const encoded = response.data?.[0]?.b64_json;
  if (!encoded) throw new Error("服务未返回图片，不会自动重试");
  const image = Buffer.from(encoded, "base64");
  await inspectNativeMaskPng(image);
  return image;
}
