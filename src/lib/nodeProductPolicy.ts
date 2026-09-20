import type { NodeKind, WorkflowTemplate } from "../types/workflow";

/**
 * v7（R-48 P2-a）：旧 9 值 kind 收敛为三值后，「首版产品政策不支持四族旧 kind」
 * 的收窄清单随之失效——旧 kind 在类型层已不存在，无从 unsupported。
 * 三值 kind 全部默认 supported；若未来需要按 kind 收窄付费运行，
 * 在 P2-b/P2-c 的运行准入层按新裁定重建（本文件不预留旧清单）。
 */

export type NodeProductSupportStatus = "supported" | "unsupported";

export interface NodeProductPolicyDecision {
  status: NodeProductSupportStatus;
  canCreate: boolean;
  paidRunAllowed: boolean;
  reason?: string;
}

export interface TemplateProductPolicyDecision {
  status: NodeProductSupportStatus;
  launchAllowed: boolean;
  blockedNodeKinds: readonly NodeKind[];
  reason?: string;
}

export function nodeProductPolicy(_kind: NodeKind): NodeProductPolicyDecision {
  return { status: "supported", canCreate: true, paidRunAllowed: true };
}

/**
 * 模板启动策略：v7 下 blockedNodeKinds 恒为空（三值 kind 全部可启动）。
 * 保留函数形状供调用方（flowStore / templates 路由）过渡期编译，
 * 行为重写（含内置模板 v7 重做）归 P2-b/P2-c。
 */
export function templateProductPolicy(
  _template: Pick<WorkflowTemplate, "builtIn" | "flow">,
): TemplateProductPolicyDecision {
  return { status: "supported", launchAllowed: true, blockedNodeKinds: [] };
}
