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
  // v7：只有 image 节点有业务画幅（aspectRatio）；text/video 直接透传。
  if (kind !== "image") return images;
  const aspectRatio = normalizeExactAspectRatio(params.aspectRatio);
  const processed: string[] = [];
  for (const image of images) {
    processed.push(await fitGeneratedImageToAspect(image, aspectRatio));
  }
  return processed;
}
