import type { NodeTypes } from "@xyflow/react";
import { TextNode } from "./TextNode";
import { ImageNode } from "./ImageNode";
import { VideoNode } from "./VideoNode";
import { ImageGeneratorNode } from "./ImageGeneratorNode";
import { VideoGeneratorNode } from "./VideoGeneratorNode";
import { ResultImageNode } from "./ResultImageNode";
import { ResultVideoNode } from "./ResultVideoNode";

/**
 * v8 三层七节点模型（plan.md §1）：
 * 输入层 text / image / video，生成层 image-generator / video-generator，
 * 结果层 result-image / result-video。
 */
export const nodeTypes: NodeTypes = {
  text: TextNode,
  image: ImageNode,
  video: VideoNode,
  "image-generator": ImageGeneratorNode,
  "video-generator": VideoGeneratorNode,
  "result-image": ResultImageNode,
  "result-video": ResultVideoNode,
};

export { TextNode } from "./TextNode";
export { ImageNode } from "./ImageNode";
export { VideoNode } from "./VideoNode";
export { ImageGeneratorNode } from "./ImageGeneratorNode";
export { VideoGeneratorNode } from "./VideoGeneratorNode";
export { ResultImageNode } from "./ResultImageNode";
export { ResultVideoNode } from "./ResultVideoNode";
export { NodeToolbar, NODE_TOOLBAR_ACTIONS } from "./NodeToolbar";
export { GeneratorParamsPanel } from "./GeneratorParamsPanel";
