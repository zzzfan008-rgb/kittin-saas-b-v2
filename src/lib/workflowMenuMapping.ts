/**
 * 菜单项 → 内置模板 → 资产选择器提示。
 *
 * 契约锚点：
 * - `docs/design/2026-09-21-five-node-model/contracts/template-format.md` §2/§3/§4
 *   （菜单项 id 与模板 id 解耦；本期 15 个模板，keyframes / video-clone 延后）
 * - `docs/design/2026-09-19-workbench-entry-wiring/asset-library-model.md` §6
 *   （模板 1 `builtin-model-tryon` 的 `model` 节点打开资产选择器时默认「数字模特」分类）
 *
 * 本文件是**纯映射 + 解析**：不发网络请求、不碰 React 状态、不写文档。
 * 菜单项点击后的模板解析与 fail-closed 提示由消费方（工作台外壳）实现。
 */
import type { Asset } from "@/types/workflow";

/** 资产选择器预选分类：素材分类 + 「全部」。 */
export type AssetPickerHintCategory = Asset["category"];

export interface WorkflowMenuBinding {
  /**
   * 内置模板 id；`null` = 该菜单项本期未注册模板（延后项）。
   * 消费方对 `null` 必须显式提示，不得静默失败或跳节点库。
   */
  templateId: string | null;
  /** 延后原因（仅 `templateId === null` 时给出），用于「功能开发中」提示。 */
  pendingReason?: string;
  /**
   * 资产选择器的默认分类提示：key = 模板内节点 id（与模板种子 id 一致）。
   * 只影响选择器打开时的预选分类；命中不了就退回「全部」，不阻塞选择。
   */
  assetPickerHints?: Readonly<Record<string, AssetPickerHintCategory>>;
}

/** 17 个菜单项（`railConfig.tsx` 的工作流菜单项）与模板/提示的对应表。 */
export const WORKFLOW_MENU_MAPPING: Readonly<Record<string, WorkflowMenuBinding>> = {
  // AI 换装
  "model-tryon": {
    templateId: "builtin-model-tryon",
    assetPickerHints: { model: "model" },
  },
  pose: { templateId: "builtin-pose" },
  background: { templateId: "builtin-background-swap" },
  lookbook: { templateId: "builtin-lookbook" },
  "digital-model": { templateId: "builtin-digital-model" },
  // 服装设计
  "print-extract": { templateId: "builtin-print-extract" },
  "print-mutate": { templateId: "builtin-print-mutate" },
  recolor: { templateId: "builtin-garment-recolor" },
  fabric: { templateId: "builtin-fabric-swap" },
  "sketch-render": { templateId: "builtin-sketch-to-garment" },
  "ai-restyle": { templateId: "builtin-ai-restyle" },
  outfit: { templateId: "builtin-outfit-recommend" },
  mannequin: { templateId: "builtin-person-to-mannequin" },
  // 视频生成（本期）
  runway: { templateId: "builtin-video-runway" },
  xhs: { templateId: "builtin-video-xhs" },
  // 视频生成（延后：runner 未实现尾帧 / v2v）
  keyframes: { templateId: null, pendingReason: "首尾帧模板正在开发中" },
  "video-clone": { templateId: null, pendingReason: "视频复刻正在开发中" },
};

/** 解析菜单项对应的内置模板 id；未注册模板返回 `null`。 */
export function workflowTemplateIdForMenuItem(menuItemId: string): string | null {
  return WORKFLOW_MENU_MAPPING[menuItemId]?.templateId ?? null;
}

/**
 * 节点 id → 资产选择器预选分类。
 * 命中不到返回 `undefined`（选择器退回「全部」），不做猜测。
 */
export function assetPickerCategoryForNode(nodeId: string): AssetPickerHintCategory | undefined {
  if (!nodeId) return undefined;
  for (const binding of Object.values(WORKFLOW_MENU_MAPPING)) {
    const hint = binding.assetPickerHints?.[nodeId];
    if (hint) return hint;
  }
  return undefined;
}
