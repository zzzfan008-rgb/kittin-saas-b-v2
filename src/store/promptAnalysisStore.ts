/**
 * 「解析图片」动作的状态与编排。
 *
 * 与节点运行状态（`node.data.status`，只由 SSE `node-status` 驱动）分开存放：
 * 解析发生在 run 之前、不进入队列，不能污染运行状态机。
 *
 * 编排顺序（不可颠倒）：
 *   预保存 → 请求解析 → 合并写回文本节点 → 关闭开关
 * 预保存必须在请求之前：服务端以数据库 `flow_json` 为权威，最新连上的参考图
 * 只有落库后才可见（与 textRewrite「先保存再改写」同理）。
 */
import { create } from "zustand";
import {
  flushActiveTextEdit,
  selectActiveEdges,
  selectActiveNodes,
  selectActiveProjectId,
  updateCoalescedTextEdit,
  useFlowStore,
} from "@/store/flowStore";
import { isPromptEdge } from "@/types/workflow";
import { requestReferenceAnalysis, type ReferenceAnalysisFailed, type ReferenceAnalysisMatch, type ReferenceAnalysisUnmatched } from "@/lib/referenceAnalysisClient";
import { mergeAnalysisIntoPrompt } from "@/lib/promptAnalysisMerge";

export type PromptAnalysisStatus = "idle" | "analyzing" | "done" | "failed";

export interface PromptAnalysisRecord {
  status: PromptAnalysisStatus;
  reason?: string;
  message?: string;
  elapsedMs?: number;
  modelId?: string;
  matched: ReferenceAnalysisMatch[];
  unmatched: ReferenceAnalysisUnmatched[];
  failed: ReferenceAnalysisFailed[];
  switchedOff?: boolean;
}

interface PromptAnalysisStore {
  records: Record<string, PromptAnalysisRecord>;
  analyze: (nodeId: string) => Promise<void>;
  reset: (nodeId: string) => void;
}

const EMPTY: Omit<PromptAnalysisRecord, "status"> = { matched: [], unmatched: [], failed: [] };

const REASON_TEXT: Record<string, string> = {
  disabled: "解析功能已关闭",
  switched_off: "解析开关未开启",
  no_references: "没有可解析的参考图",
  no_matched_references: "参考图名称都无法识别",
  no_readable_images: "参考图读取失败",
  no_anchor: "提示词缺少「补充要求：」锚点",
  not_generator: "该节点不支持解析",
  invalid_flow: "画布数据异常",
  plan_failed: "画布解析失败",
  budget_exhausted: "解析超时",
  unusable_output: "模型没有读出可用内容",
  vision_request_rejected: "模型不支持图片输入",
  vision_rate_limited: "解析请求过于频繁",
  vision_upstream_error: "解析服务暂时不可用",
  vision_transport_error: "解析网络异常",
  vision_bad_response: "解析结果无效",
};

function reasonText(reason: string | undefined): string {
  if (!reason) return "解析未生效，已保留原文";
  return REASON_TEXT[reason] ?? "解析未生效，已保留原文";
}

/** 找到目标生成节点的提示词上游文本节点（服务端也按同一条 prompt 边反查）。 */
function findPromptTextNodeId(nodeId: string): string | undefined {
  const state = useFlowStore.getState();
  const edges = selectActiveEdges(state);
  const nodes = selectActiveNodes(state);
  for (const edge of edges) {
    if (edge.target !== nodeId || !isPromptEdge(edge)) continue;
    const source = nodes.find((node) => node.id === edge.source);
    if (source?.data.kind === "text") return source.id;
  }
  return undefined;
}

function readNodeText(nodeId: string): string {
  const nodes = selectActiveNodes(useFlowStore.getState());
  const node = nodes.find((item) => item.id === nodeId);
  return typeof node?.data.text === "string" ? node.data.text : "";
}

export const usePromptAnalysisStore = create<PromptAnalysisStore>((set, get) => ({
  records: {},

  reset: (nodeId) => set((state) => {
    const next = { ...state.records };
    delete next[nodeId];
    return { records: next };
  }),

  analyze: async (nodeId) => {
    if (get().records[nodeId]?.status === "analyzing") return;

    const setRecord = (record: PromptAnalysisRecord) => set((state) => ({
      records: { ...state.records, [nodeId]: record },
    }));

    const projectId = selectActiveProjectId(useFlowStore.getState());
    const textNodeId = findPromptTextNodeId(nodeId);
    if (!projectId || !textNodeId) {
      setRecord({
        ...EMPTY,
        status: "failed",
        message: !projectId ? "当前项目尚未保存，无法解析" : "请先连接一个提示词文本节点",
      });
      return;
    }

    setRecord({ ...EMPTY, status: "analyzing" });

    // 1) 预保存：服务端读 DB 快照取参考图
    const saved = await useFlowStore.getState().saveProject().catch(() => false);
    if (!saved) {
      useFlowStore.getState().updateNodeData(nodeId, { analyzeReferences: false });
      setRecord({ ...EMPTY, status: "failed", switchedOff: true, message: "项目保存失败，解析已取消" });
      return;
    }

    try {
      // 2) 请求解析
      const result = await requestReferenceAnalysis({ projectId, nodeId });
      if (!result.analysis) {
        useFlowStore.getState().updateNodeData(nodeId, { analyzeReferences: false });
        setRecord({
          ...EMPTY,
          status: "failed",
          switchedOff: true,
          reason: result.reason,
          matched: result.matched ?? [],
          unmatched: result.unmatched ?? [],
          failed: result.failed ?? [],
          elapsedMs: result.elapsedMs,
          message: reasonText(result.reason),
        });
        return;
      }

      // 3) 合并写回（替换锚点之后的补充段，协议段逐字保留）
      const merged = mergeAnalysisIntoPrompt(readNodeText(textNodeId), result.analysis);
      if (merged.changed) {
        const token = updateCoalescedTextEdit(
          { kind: "node-data", nodeId: textNodeId, field: "text" },
          merged.text,
        );
        if (token) flushActiveTextEdit(token);
      }

      // 4) 一次性开关：解析完自动关闭，按钮恢复「运行」
      useFlowStore.getState().updateNodeData(nodeId, { analyzeReferences: false });

      setRecord({
        status: "done",
        switchedOff: true,
        modelId: result.modelId,
        elapsedMs: result.elapsedMs,
        matched: result.matched ?? [],
        unmatched: result.unmatched ?? [],
        failed: result.failed ?? [],
        ...(merged.changed ? {} : { message: merged.missingAnchor ? "提示词缺少「补充要求：」锚点，正文未改动" : "解析结果与原文一致" }),
      });
    } catch (error) {
      useFlowStore.getState().updateNodeData(nodeId, { analyzeReferences: false });
      setRecord({
        ...EMPTY,
        status: "failed",
        switchedOff: true,
        message: error instanceof Error ? error.message : "解析失败，已保留原文",
      });
    }
  },
}));
