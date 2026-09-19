import type { NodeExecution } from "../../src/types/workflow";

/**
 * v7（R-53）：旧 kind 特化后处理（sketch-to-render/ai-modify 的画幅拟合、
 * upscale 的长边放大）随旧 9 值 kind 一并退役。image 节点的画幅由 modelOptions.size
 * 在 Provider 侧控制；本地 fit/upscale 不再按节点类型触发。
 * 函数签名保留以兼容既有调用点（runner / generate 路由）。
 */
export async function postProcessGeneratedOutputImages(
  _kind: NodeExecution["kind"],
  _params: Record<string, unknown>,
  images: string[],
): Promise<string[]> {
  return images;
}
