import type { NodeTypes } from "@xyflow/react";
import { TextNode } from "./TextNode";
import { ImageNode } from "./ImageNode";
import { VideoNode } from "./VideoNode";

/** v7：三种基础节点（R1）。旧 9 种节点组件随 NodeKind 收敛退役删除。 */
export const nodeTypes: NodeTypes = {
  text: TextNode,
  image: ImageNode,
  video: VideoNode,
};

export { TextNode } from "./TextNode";
export { ImageNode } from "./ImageNode";
export { VideoNode } from "./VideoNode";
