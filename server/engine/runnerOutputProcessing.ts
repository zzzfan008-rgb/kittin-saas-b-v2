import type { NodeExecution } from "../../src/types/workflow";
import {
  fitGeneratedImageToAspect,
  normalizeExactAspectRatio,
  normalizeUpscaleSize,
  upscaleImageToLongEdge,
} from "../lib/imagePostProcessing";

/** Apply business-side output guarantees only to nodes that expose size controls to users. */
export async function postProcessGeneratedOutputImages(
  kind: NodeExecution["kind"],
  params: Record<string, unknown>,
  images: string[],
): Promise<string[]> {
  if (kind !== "sketch-to-render" && kind !== "ai-modify" && kind !== "upscale") return images;
  const aspectRatio = normalizeExactAspectRatio(params.aspectRatio);
  const imageSize = normalizeUpscaleSize(params.imageSize);
  const processed: string[] = [];
  for (const image of images) {
    processed.push(
      kind === "upscale"
        ? await upscaleImageToLongEdge(image, imageSize)
        : await fitGeneratedImageToAspect(image, aspectRatio),
    );
  }
  return processed;
}
