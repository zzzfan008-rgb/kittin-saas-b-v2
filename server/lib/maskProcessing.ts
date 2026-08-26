import sharp from "sharp";
import { ProviderError, toDataUrl } from "../providers/base";
import { withImageProcessingSlot } from "./imageProcessingLimit";
import { validateImageDataUrl } from "./imageValidation";
import { maskFeatherSigma, maskSafetyRadius } from "../../src/lib/maskGeometry";
import {
  normalizeMaskCompositeMode,
  type MaskCompositeMode,
} from "../../src/types/workflow";

export const MAX_GPT_IMAGE_MASK_BYTES = 4 * 1024 * 1024;
const MAX_MASK_PIXELS = 40_000_000;

export interface ValidatedMaskPair {
  sourceBuffer: Buffer;
  maskBuffer: Buffer;
  width: number;
  height: number;
}

const SHARP_MASK_INPUT = {
  animated: false,
  failOn: "error" as const,
  limitInputPixels: MAX_MASK_PIXELS,
};

async function editableAlpha(pair: ValidatedMaskPair, feather: boolean): Promise<Buffer> {
  const radius = maskSafetyRadius(pair.width, pair.height);
  let protectedAlpha = await sharp(pair.maskBuffer, SHARP_MASK_INPUT)
    .extractChannel("alpha")
    .toColourspace("b-w")
    .raw()
    .toBuffer();
  if (radius > 0) {
    // Sharp/libvips 的形态学操作以暗色为前景；对原蒙版 Alpha 做 dilate，
    // 会把透明（可编辑）区域向外扩张。显式转回 b-w 可避免 raw 单通道自动升为 sRGB 三通道。
    protectedAlpha = await sharp(protectedAlpha, {
      raw: { width: pair.width, height: pair.height, channels: 1 },
    })
      .dilate(radius)
      .toColourspace("b-w")
      .raw()
      .toBuffer();
  }
  let editAlpha = Buffer.allocUnsafe(protectedAlpha.length);
  for (let index = 0; index < protectedAlpha.length; index += 1) {
    editAlpha[index] = 255 - protectedAlpha[index];
  }
  const sigma = feather ? maskFeatherSigma(pair.width, pair.height) : 0;
  if (sigma > 0) {
    editAlpha = await sharp(editAlpha, {
      raw: { width: pair.width, height: pair.height, channels: 1 },
    })
      .blur(sigma)
      .toColourspace("b-w")
      .raw()
      .toBuffer();
  }
  return editAlpha;
}

async function rgbaMaskFromAlpha(
  alpha: Buffer,
  width: number,
  height: number,
  invert = false,
): Promise<Buffer> {
  const alphaBuffer = invert ? Buffer.allocUnsafe(alpha.length) : alpha;
  if (invert) {
    for (let index = 0; index < alpha.length; index += 1) {
      alphaBuffer[index] = 255 - alpha[index];
    }
  }
  return sharp({
    create: { width, height, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .joinChannel(alphaBuffer, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();
}

export async function validateMaskForSource(
  sourceDataUrl: string,
  maskDataUrl: string,
  providerId = "gpt-image-2",
): Promise<ValidatedMaskPair> {
  const source = validateImageDataUrl(sourceDataUrl);
  const mask = validateImageDataUrl(maskDataUrl, MAX_GPT_IMAGE_MASK_BYTES);
  if (mask.mime !== "image/png") {
    throw new ProviderError("蒙版必须是 PNG 图片", 400, providerId, "invalid_request");
  }

  return withImageProcessingSlot(async () => {
    const sourceMeta = await sharp(source.buffer, {
      animated: false, failOn: "error", limitInputPixels: MAX_MASK_PIXELS,
    }).metadata();
    const maskImage = sharp(mask.buffer, {
      animated: false, failOn: "error", limitInputPixels: MAX_MASK_PIXELS,
    });
    const maskMeta = await maskImage.metadata();
    if (!sourceMeta.width || !sourceMeta.height || !maskMeta.width || !maskMeta.height) {
      throw new ProviderError("无法读取原图或蒙版尺寸", 400, providerId, "invalid_request");
    }
    if (sourceMeta.width !== maskMeta.width || sourceMeta.height !== maskMeta.height) {
      throw new ProviderError(
        `蒙版尺寸必须与原图完全一致（原图 ${sourceMeta.width}x${sourceMeta.height}，蒙版 ${maskMeta.width}x${maskMeta.height}）`,
        400, providerId, "invalid_request",
      );
    }
    if (!maskMeta.hasAlpha) {
      throw new ProviderError("蒙版 PNG 必须包含 Alpha 通道", 400, providerId, "invalid_request");
    }
    const alphaPixels = await maskImage.extractChannel("alpha").raw().toBuffer();
    let minAlpha = 255;
    let maxAlpha = 0;
    for (const value of alphaPixels) {
      minAlpha = Math.min(minAlpha, value);
      maxAlpha = Math.max(maxAlpha, value);
    }
    if (minAlpha === 255) {
      throw new ProviderError("蒙版没有可编辑区域，请先涂抹需要修改的位置", 400, providerId, "invalid_request");
    }
    if (maxAlpha === 0) {
      throw new ProviderError("蒙版覆盖了整张图片，请保留不需要修改的区域", 400, providerId, "invalid_request");
    }
    return {
      sourceBuffer: source.buffer,
      maskBuffer: mask.buffer,
      width: sourceMeta.width,
      height: sourceMeta.height,
    };
  });
}

/**
 * 给模型使用的蒙版比用户核心选区略宽，避免新内容在核心边缘被硬截断。
 * 返回值仍保持 GPT Image 的“透明处可编辑、白色不透明处保留”契约。
 */
export async function prepareMaskForGeneration(
  sourceDataUrl: string,
  maskDataUrl: string,
): Promise<string> {
  const pair = await validateMaskForSource(sourceDataUrl, maskDataUrl);
  const radius = maskSafetyRadius(pair.width, pair.height);
  if (radius === 0) return maskDataUrl;
  const expandedEditAlpha = await withImageProcessingSlot(() => editableAlpha(pair, false));
  const providerMask = await withImageProcessingSlot(() => (
    rgbaMaskFromAlpha(expandedEditAlpha, pair.width, pair.height, true)
  ));
  return toDataUrl(providerMask.toString("base64"), "image/png");
}

async function assertPreserveLayer(
  generatedBuffer: Buffer,
  editAlpha: Buffer,
  width: number,
  height: number,
): Promise<void> {
  const image = sharp(generatedBuffer, SHARP_MASK_INPUT);
  const metadata = await image.metadata();
  if (!metadata.hasAlpha) {
    throw new ProviderError(
      "保持原图模式没有获得透明修改层，原图未被覆盖；请重试或改用替换选区模式",
      502, "gpt-image-2", "invalid_response",
    );
  }
  const alpha = await image.extractChannel("alpha").raw().toBuffer();
  let editablePixels = 0;
  let opaqueEditablePixels = 0;
  let transparentPixels = 0;
  for (let index = 0; index < width * height; index += 1) {
    if (alpha[index] === 0) transparentPixels += 1;
    if (editAlpha[index] < 128) continue;
    editablePixels += 1;
    if (alpha[index] >= 250) opaqueEditablePixels += 1;
  }
  if (transparentPixels === 0 || (editablePixels > 0 && opaqueEditablePixels / editablePixels > 0.92)) {
    throw new ProviderError(
      "保持原图模式返回了整块不透明选区，可能污染原有底色；原图未被覆盖，请重试或改用替换选区模式",
      502, "gpt-image-2", "invalid_response",
    );
  }
}

/**
 * 保持模式只把模型返回的透明修改层叠加到原图；替换模式允许重绘选区。
 * 两种模式都使用扩张并羽化的安全带，避免新内容在核心选区边缘硬截断。
 */
export async function compositeMaskedEdit(
  sourceDataUrl: string,
  maskDataUrl: string,
  generatedDataUrl: string,
  options: { mode?: MaskCompositeMode } = {},
): Promise<string> {
  const pair = await validateMaskForSource(sourceDataUrl, maskDataUrl);
  const generated = validateImageDataUrl(generatedDataUrl);
  const mode = normalizeMaskCompositeMode(options.mode);
  return withImageProcessingSlot(async () => {
    const generatedMeta = await sharp(generated.buffer, {
      animated: false, failOn: "error", limitInputPixels: MAX_MASK_PIXELS,
    }).metadata();
    if (generatedMeta.width !== pair.width || generatedMeta.height !== pair.height) {
      throw new ProviderError(
        "AI 返回图片尺寸与原图不一致，无法安全执行蒙版外像素保护",
        502, "gpt-image-2", "invalid_response",
      );
    }
    const editAlpha = await editableAlpha(pair, true);
    if (mode === "preserve") {
      await assertPreserveLayer(generated.buffer, editAlpha, pair.width, pair.height);
    }
    const editMask = await rgbaMaskFromAlpha(editAlpha, pair.width, pair.height);
    const editableLayer = await sharp(generated.buffer)
      .ensureAlpha()
      .composite([{ input: editMask, blend: "dest-in" }])
      .png()
      .toBuffer();
    const output = await sharp(pair.sourceBuffer)
      .ensureAlpha()
      .composite([{ input: editableLayer, blend: "over" }])
      .png()
      .toBuffer();
    return toDataUrl(output.toString("base64"), "image/png");
  });
}
