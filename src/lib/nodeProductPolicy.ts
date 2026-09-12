import { NODE_SPECS, type NodeKind, type WorkflowTemplate } from "../types/workflow";

export const V1_UNSUPPORTED_NODE_KINDS = [
  "fabric-recolor",
  "upscale",
  "print-extract",
  "print-mutate",
] as const satisfies readonly NodeKind[];

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

const UNSUPPORTED_NODE_KIND_SET = new Set<NodeKind>(V1_UNSUPPORTED_NODE_KINDS);

/**
 * Phase-one product admission is deliberately narrower than the historical
 * workflow schema. Unsupported nodes stay readable/editable for compatibility,
 * but cannot be newly added or submitted to a paid Provider.
 */
export function nodeProductPolicy(kind: NodeKind): NodeProductPolicyDecision {
  if (!UNSUPPORTED_NODE_KIND_SET.has(kind)) {
    return { status: "supported", canCreate: true, paidRunAllowed: true };
  }
  const title = NODE_SPECS[kind].title;
  return {
    status: "unsupported",
    canCreate: false,
    paidRunAllowed: false,
    reason: `首版产品政策暂不支持「${title}」节点：该节点尚无逐模型独立提示词、参数档案和真实评估证据。历史项目仍可读取、查看和编辑，但不能发起付费运行。`,
  };
}

/**
 * Built-in templates containing out-of-scope nodes remain visible as an
 * explicit roadmap item, but cannot seed a new project in phase one. User
 * templates remain launchable so existing user-authored material is not hidden;
 * their unsupported nodes are still fail-closed by node run admission.
 */
export function templateProductPolicy(
  template: Pick<WorkflowTemplate, "builtIn" | "flow">,
): TemplateProductPolicyDecision {
  const blockedNodeKinds = [...new Set(
    template.flow.nodes
      .map((node) => node.data.kind)
      .filter((kind): kind is NodeKind => !nodeProductPolicy(kind).paidRunAllowed),
  )];
  if (!template.builtIn || blockedNodeKinds.length === 0) {
    return {
      status: "supported",
      launchAllowed: true,
      blockedNodeKinds,
    };
  }
  const titles = blockedNodeKinds.map((kind) => NODE_SPECS[kind].title);
  return {
    status: "unsupported",
    launchAllowed: false,
    blockedNodeKinds,
    reason: `该内置模板包含首版暂不支持的节点：${titles.join("、")}。完成逐模型独立提示词、参数档案和真实评估前，不能用它新建付费流程。`,
  };
}
