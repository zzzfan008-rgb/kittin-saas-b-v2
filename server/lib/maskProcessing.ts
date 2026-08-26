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
const GPT_IMAGE_SIZE_MULTIPLE = 16;
const GPT_IMAGE_MAX_SIDE = 3840;
const GPT_IMAGE_MIN_PIXELS = 655_360;
const GPT_IMAGE_MAX_PIXELS = 8_294_400;
const GPT_IMAGE_MAX_ASPECT_RATIO = 3;
const PRESERVE_DIFF_LOW = 16;
const PRESERVE_DIFF_HIGH = 64;

export interface ValidatedMaskPair {
  sourceBuffer: Buffer;
  maskBuffer: Buffer;
  width: number;
  height: number;
}

export interface PreparedMaskGeneration {
  mask: string;
  size: string;
  width: number;
  height: number;
}

/**
 * GPT Image 2 的输出尺寸必须是 16 的倍数，并落在文档规定的像素与比例范围内。
 * 在全部合法候选中选择最接近原图比例和像素量的一档；合法原图会原尺寸直出。
 */
export function maskGenerationDimensions(width: number, height: number): { width: number; height: number } {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new ProviderError("原图尺寸无效，无法准备蒙版生成", 400, "gpt-image-2", "invalid_request");
  }
  const sourceAspect = width / height;
  const symmetricAspect = Math.max(sourceAspect, 1 / sourceAspect);
  if (symmetricAspect > GPT_IMAGE_MAX_ASPECT_RATIO) {
    throw new ProviderError(
      "原图宽高比超过蒙版模型支持范围，请先裁剪至 3:1 以内",
      400, "gpt-image-2", "invalid_request",
    );
  }
  const desiredPixels = Math.min(GPT_IMAGE_MAX_PIXELS, Math.max(GPT_IMAGE_MIN_PIXELS, width * height));
  let best: { width: number; height: number; score: number } | undefined;
  for (
    let candidateWidth = GPT_IMAGE_SIZE_MULTIPLE;
    candidateWidth <= GPT_IMAGE_MAX_SIDE;
    candidateWidth += GPT_IMAGE_SIZE_MULTIPLE
  ) {
    const candidateHeight = Math.round(candidateWidth / sourceAspect / GPT_IMAGE_SIZE_MULTIPLE)
      * GPT_IMAGE_SIZE_MULTIPLE;
    if (candidateHeight < GPT_IMAGE_SIZE_MULTIPLE || candidateHeight > GPT_IMAGE_MAX_SIDE) continue;
    const pixels = candidateWidth * candidateHeight;
    if (pixels < GPT_IMAGE_MIN_PIXELS || pixels > GPT_IMAGE_MAX_PIXELS) continue;
    const candidateAspect = Math.max(candidateWidth / candidateHeight, candidateHeight / candidateWidth);
    if (candidateAspect > GPT_IMAGE_MAX_ASPECT_RATIO) continue;
    const aspectError = Math.abs(Math.log((candidateWidth / candidateHeight) / sourceAspect));
    const pixelError = Math.abs(Math.log(pixels / desiredPixels));
    const score = aspectError * 100 + pixelError;
    if (!best || score < best.score) best = { width: candidateWidth, height: candidateHeight, score };
  }
  if (!best) {
    throw new ProviderError("找不到可安全映射的蒙版输出尺寸", 400, "gpt-image-2", "invalid_request");
  }
  return { width: best.width, height: best.height };
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
): Promise<PreparedMaskGeneration> {
  const pair = await validateMaskForSource(sourceDataUrl, maskDataUrl);
  const dimensions = maskGenerationDimensions(pair.width, pair.height);
  const radius = maskSafetyRadius(pair.width, pair.height);
  let providerMask = pair.maskBuffer;
  if (radius > 0) {
    const expandedEditAlpha = await withImageProcessingSlot(() => editableAlpha(pair, false));
    providerMask = await withImageProcessingSlot(() => (
      rgbaMaskFromAlpha(expandedEditAlpha, pair.width, pair.height, true)
    ));
  }
  return {
    mask: toDataUrl(providerMask.toString("base64"), "image/png"),
    size: `${dimensions.width}x${dimensions.height}`,
    ...dimensions,
  };
}

async function preserveGeneratedLayer(
  sourceBuffer: Buffer,
  generatedBuffer: Buffer,
  editAlpha: Buffer,
  width: number,
  height: number,
): Promise<Buffer> {
  const [source, generated] = await Promise.all([
    sharp(sourceBuffer, SHARP_MASK_INPUT).ensureAlpha().raw().toBuffer(),
    sharp(generatedBuffer, SHARP_MASK_INPUT).ensureAlpha().raw().toBuffer(),
  ]);
  const layer = Buffer.alloc(width * height * 4);
  let editablePixels = 0;
  let stronglyChangedPixels = 0;
  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4;
    const difference = Math.max(
      Math.abs(generated[offset] - source[offset]),
      Math.abs(generated[offset + 1] - source[offset + 1]),
      Math.abs(generated[offset + 2] - source[offset + 2]),
    );
    const differenceAlpha = difference <= PRESERVE_DIFF_LOW
      ? 0
      : difference >= PRESERVE_DIFF_HIGH
        ? 255
        : Math.round(((difference - PRESERVE_DIFF_LOW) / (PRESERVE_DIFF_HIGH - PRESERVE_DIFF_LOW)) * 255);
    const alpha = Math.min(generated[offset + 3], differenceAlpha);
    layer[offset] = generated[offset];
    layer[offset + 1] = generated[offset + 1];
    layer[offset + 2] = generated[offset + 2];
    layer[offset + 3] = alpha;
    if (editAlpha[index] >= 128) {
      editablePixels += 1;
      if (alpha >= 250) stronglyChangedPixels += 1;
    }
  }
  if (editablePixels > 0 && stronglyChangedPixels / editablePixels > 0.92) {
    throw new ProviderError(
      "保持原图模式检测到选区几乎被整体替换，原图未被覆盖；请缩小选区、调整提示词或改用替换选区模式",
      502, "gpt-image-2", "invalid_response",
    );
  }
  return sharp(layer, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

/**
 * 保持模式只把模型返回的透明修改层叠加到原图；替换模式允许重绘选区。
 * 两种模式都使用扩张并羽化的安全带，避免新内容在核心选区边缘硬截断。
 */
export async function compositeMaskedEdit(
  sourceDataUrl: string,
  maskDataUrl: string,
  generatedDataUrl: string,
  options: {
    mode?: MaskCompositeMode;
    expectedGeneratedSize?: { width: number; height: number };
  } = {},
): Promise<string> {
  const pair = await validateMaskForSource(sourceDataUrl, maskDataUrl);
  const generated = validateImageDataUrl(generatedDataUrl);
  const mode = normalizeMaskCompositeMode(options.mode);
  return withImageProcessingSlot(async () => {
    const generatedMeta = await sharp(generated.buffer, {
      animated: false, failOn: "error", limitInputPixels: MAX_MASK_PIXELS,
    }).metadata();
    const expected = options.expectedGeneratedSize ?? { width: pair.width, height: pair.height };
    if (generatedMeta.width !== expected.width || generatedMeta.height !== expected.height) {
      throw new ProviderError(
        `AI 返回图片尺寸与请求不一致（请求 ${expected.width}x${expected.height}，返回 ${generatedMeta.width ?? "?"}x${generatedMeta.height ?? "?"}），无法安全执行蒙版外像素保护`,
        502, "gpt-image-2", "invalid_response",
      );
    }
    const alignedGenerated = expected.width === pair.width && expected.height === pair.height
      ? generated.buffer
      : await sharp(generated.buffer, SHARP_MASK_INPUT)
        .resize({ width: pair.width, height: pair.height, fit: "fill" })
        .png()
        .toBuffer();
    const editAlpha = await editableAlpha(pair, true);
    const generatedLayer = mode === "preserve"
      ? await preserveGeneratedLayer(pair.sourceBuffer, alignedGenerated, editAlpha, pair.width, pair.height)
      : alignedGenerated;
    const editMask = await rgbaMaskFromAlpha(editAlpha, pair.width, pair.height);
    const editableLayer = await sharp(generatedLayer)
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
