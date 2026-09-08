# Research: Garment Canvas 全量逻辑与代码审计

**Date**: 2026-09-04

## Baseline

- 工作树位于 `/Users/lionfan/Documents/ChatGPT/无限画布/garment-canvas`。
- 当前分支为 `codex/p0-provider-download-and-p2-presets`。
- `HEAD` 与 `origin/main` 均为 `b9b051f72fb9e0ce5514f8b646e9e3068ff9359c`；候选范围是未提交工作树。
- 88 个已跟踪文件变更，11,122 行新增、919 行删除，86 个未跟踪状态条目。
- `npm run check` 已通过；它不能单独证明发布资格。
- GitNexus 索引对应当前提交，但对工作树的变更影响仍需在交付前运行 `detect_changes`。

## Decisions

### Decision 1: 先建立证据闭包，再做代码整改

**Rationale**: 工作树差异规模大且混合业务代码、测试、证据和文档。先固定基线可以防止误删用户改动，并让每个修复与验证命令一一对应。

**Alternatives considered**: 直接按文件大小重构；被拒绝，因为它不能区分发布阻断与维护性问题，也无法建立回滚证据。

### Decision 2: PostgreSQL 18 保持生产事实源

**Rationale**: 当前运行、所有权、租约和历史记录依赖 PostgreSQL 事务与锁语义。SQLite 继续用于迁移验证，不改变生产事实源。

**Alternatives considered**: 以 SQLite 统一运行时；被拒绝，因为会削弱现有并发和迁移验证的真实性。

### Decision 3: 共享领域规则，适配层隔离外部依赖

**Rationale**: 参考图角色、提示词准入、模型参数和运行状态已经同时被浏览器、服务端和脚本使用；规则必须有一个可测试来源，Express、PostgreSQL、文件存储、Provider 和 CLI 只负责适配。

**Alternatives considered**: 在各路由和组件内复制校验；被拒绝，因为已出现类型边界和规则漂移风险。

### Decision 4: API易证据按需执行，目录基线保持外置原始文件

**Rationale**: API易相关变更必须核对本地知识库和只读目录，但普通审计无需重复该校验。完整账户级 `/v1/models` 原始响应保存在工作树外，仓库记录精确字节 SHA、规范化 ID SHA 和脱敏摘要，避免把完整目录混入发布包。

**Current evidence**: 外置文件大小 61,774 bytes，原始 SHA-256 为 `7d5348336bbe5ac63a34107a506e3c5c72340064608c11193602df65c4327408`；离线契约结构检查通过，提供该文件时五个现役 ID 精确命中 5/5。`npm run docs:apiyi:kb:check` 通过。

**Fail-closed rule**: 缺少任一现役 ID、原始文件、原始 SHA 或规范化 ID SHA 时，不得把目录基线标记为通过；差异必须输出模型 ID、HTTP 状态/响应元数据、期望哈希和实际哈希，供 API易支持处理。

### Decision 5: 未知 Provider 结果不自动重放

**Rationale**: 当前 API易 是同步长请求，连接超时、响应中断和尾部不完整可能已经产生计费。队列可以恢复业务状态，但不能在无法确定上游结果时自动发起第二次付费请求。

### Decision 6: 先 P0/P1，再 P2/P3

**Rationale**: 权限、数据损坏、重复计费和发布闭包问题优先。结构重构必须在契约和回归测试准备后进行；UI 重设计留到行为边界稳定后并单独确认。

## Risk Inventory

| Area | Evidence | Initial risk | Next verification |
|------|----------|--------------|-------------------|
| Release/evidence | `scripts/codex-gate.mjs`, `scripts/apiyi-docs.mjs`, external model export | P0 | exact export check, clean release gate |
| Auth/ownership | `server/routes/auth.ts`, `files.ts`, `generate.ts`, `runPlan.ts`, `templates.ts` | P1 | route impact, authorization tests |
| Document boundary | `src/store/flowStore.ts`, `src/lib/documentSnapshot.ts` | P1 | active-document and tab/epoch tests |
| DAG/queue | `server/engine/dag.ts`, `runQueue.ts`, `runner.ts` | P1 | lease/retry/unknown-result tests |
| Provider | `server/providers/apiyi.ts`, `apiyiTransport.ts`, model contracts | P1 | offline contract and fake-provider tests |
| Migration | `server/lib/database.ts`, `workflowSchema.ts` | P1 | PostgreSQL and SQLite migration tests |
| Complexity | flowStore, database, runQueue, evaluation scripts | P2 | callgraph/complexity evidence and bounded refactor |
| UI | large panels/nodes | P3 | Playwright at 1024/1280/1440 |

## Open Questions Resolved by Existing Evidence

- `server/routes/usage.ts` 的 XSS 告警先按 CSV 下载语义处理：必须继续验证公式注入防护、`Content-Disposition` 和 `nosniff`，不能仅凭静态路径定性。
- `src/types/imageModels.ts` 与 `src/types/workflow.ts` 的循环依赖需要以构建产物和运行时加载测试确认；类型循环本身不等于运行时错误。
- API易 `/v1/models` 当前外置原始导出只证明本配置凭据在捕获时刻可见五个 ID，不证明图片生成、编辑、质量或计费可用性。
