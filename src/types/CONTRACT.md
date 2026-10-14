# 跨层冻结契约（server ↔ src 共享面）

`server/` 反向 import `src/` 共 21 个文件（2026-10 实测），全部是类型 +
无副作用纯函数。这是设计使然，不是腐化：前后端共享同一套契约层。

## 冻结清单（改名/改签名必须先 `rg` 查 server 引用 + 报影响面）

`src/types/*`（纯类型，17 处引用）：

- `workflow.ts` — 全仓第一大契约（62 个文件 import）
- `imageModels.ts` / `videoModels.ts` / `imageOperations.ts` / `openaiMaskTest.ts`

`src/lib/` 纯模块（有运行时，6 处引用）：

- `promptRunAdmission.ts` — 付费准入闸（dag/runPlan 共用）
- `providerPromptRenderer.ts` — runner 拼 prompt
- `referenceInputs.ts` / `referenceEvidence.ts` — 参考图校验与证据
- `maskGeometry.ts` — 蒙版几何
- `src/tutorials/tutorialContract.ts` — 教程契约

## 禁区（两条门禁规则双锁，现状零命中）

- `server/` 不得 import `src/components` / `src/store` / `src/hooks`
  （depcruise `server-must-not-import-frontend-ui` +
  ast-grep `no-server-import-frontend-ui`）
- 新加 server→src 引用时，只允许上面冻结清单；新增纯模块先补进本清单。

## 关联门禁

改模型 id / 参数 / 重试 / 计费 → AGENTS.md §5 API易知识门。
