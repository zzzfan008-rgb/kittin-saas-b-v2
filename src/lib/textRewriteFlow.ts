// 「✨ 帮我补全」的前端编排（P1：未保存草稿必 404 的修复）。
//
// 变更点（相对首版）：
//   ① 先发 saveProject（付费先例 runImageEdit flowStore.ts:3730）——server 强制
//      lifecycle='saved' 才按 nodeId 反查 flow_json，模板派生/新建的 local 草稿
//      DB 无行必 404；保存失败即中止，不发改写请求。
//   ② 去掉静默 catch——出错透出 server 文案（403 只读/HTTP 状态/网络错误），
//      由调用方 setError 展示；200+{rewritten:null} 仍静默降级保持原文。
//
// 本模块为纯逻辑、依赖注入（saveProject/rewrite/commit/setError/setBusy），
// 供 TextNode 薄适配与 tests/text-rewrite-flow.test.ts 无 DOM 断言（无 jsdom）。

export interface PromptRewriteFlowArgs {
  /** 点击时的正文（含未 flush 的键入）；空正文调用方应在按钮处禁用。 */
  text: string;
  projectId: string;
  nodeId: string;
}

export interface PromptRewriteFlowDeps {
  /** 保存项目（useFlowStore.getState().saveProject）。返回服务端是否确认持久化。 */
  saveProject: () => Promise<boolean>;
  /** 改写请求（textRewriteClient.rewritePromptText 或其 mock）。 */
  rewrite: (args: { text: string; projectId: string; nodeId?: string }) => Promise<{ rewritten: string | null }>;
  /** 成功写回正文（useCoalescedTextEdit updateValue+flush，可 undo）。 */
  commit: (text: string) => void;
  /** 展示/清除错误文案；成功与静默降级时为 null。 */
  setError: (message: string | null) => void;
  /** 加载态开关（按钮转圈/禁用）。 */
  setBusy: (busy: boolean) => void;
}

export interface PromptRewriteFlowOutcome {
  /** 是否真实写回了改写结果（成功 200 rewritten）；否则保持原文。 */
  committed: boolean;
}

/**
 * 先保存 → 再改写 → 写回或报错。
 * 时序机检：saveProject 必在 rewrite 之前（防 404）；setBusy 开→…→setBusy 关。
 */
export async function runPromptRewriteFlow(
  args: PromptRewriteFlowArgs,
  deps: PromptRewriteFlowDeps,
): Promise<PromptRewriteFlowOutcome> {
  const text = args.text.trim();
  if (!text) return { committed: false }; // 防御：按钮已禁用，此处再挡一次，绝不发保存/改写

  deps.setBusy(true);
  deps.setError(null);
  try {
    // 保存失败即中止（不发改写请求），提示用户先保存项目。
    if (!(await deps.saveProject())) {
      deps.setError("项目保存失败，请先保存项目");
      return { committed: false };
    }
    const result = await deps.rewrite({ text, projectId: args.projectId, nodeId: args.nodeId });
    // 200+{rewritten:null,skipped:true} → 静默降级，保持原文（不弹错）。
    if (result.rewritten === null) return { committed: false };
    deps.commit(result.rewritten);
    return { committed: true };
  } catch (error) {
    // 不再静默吞：透出 server 文案（403 只读/400/HTTP 状态/网络错误），原文保持。
    deps.setError(
      error instanceof Error && error.message ? error.message : "提示词改写失败，请重试",
    );
    return { committed: false };
  } finally {
    deps.setBusy(false);
  }
}
