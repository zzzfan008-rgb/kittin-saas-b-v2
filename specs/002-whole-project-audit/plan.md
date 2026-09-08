# Implementation Plan: Garment Canvas 全量逻辑与代码审计整改

**Branch**: `002-whole-project-audit` | **Date**: 2026-09-04 | **Spec**: [spec.md](spec.md)

## Summary

先以当前工作树建立不可变审计基线和发现台账，再按 P0 发布/安全、P1 核心边界、P2 性能/可靠性、P3 可维护性/UI 分批整改。领域规则集中在纯 TypeScript 层，Express、PostgreSQL、文件存储、Provider 和 CLI 作为适配层；发布层独立维护模型目录、评估证据、代码身份和门禁闭包。

## Technical Context

**Language/Version**: TypeScript 5.7；Node.js 24.20.0+

**Primary Dependencies**: React 19、React Flow 12、Zustand 5、Express 4、`pg`、Sharp、Undici、Playwright 1.61

**Storage**: PostgreSQL 18；SQLite 仅用于迁移验证；文件存储保存规范化图片和 Provider 原图

**Testing**: TypeScript 行为测试、隔离 PostgreSQL、Playwright 桌面 E2E、本地 Codex gate、GitNexus

**Target Platform**: 桌面浏览器（1024 CSS px 起）与 Node.js 服务端

**Project Type**: 单仓库全栈 Web 应用

**Performance Goals**: 核心校验与当前节点输入数量线性增长；P2 以前先记录基线，再以 p95、请求数、内存和构建包体做回归比较

**Constraints**: 失败关闭、旧数据兼容、不可变运行快照、无真实图片端点调用、保留所有用户改动和外置证据

**Scale/Scope**: 当前全部候选差异、origin/main 存量架构、认证/文档/DAG/队列/Provider/迁移/结果/UI 发布链路

## Constitution Check

| Gate | Pre-research | Post-design | Evidence |
|------|--------------|-------------|----------|
| Single Policy Authority | PASS | PASS | 仅引用 `AGENTS.md`，不复制项目政策 |
| Outcome-First Specification | PASS | PASS | `spec.md` 包含优先场景、需求、指标、假设和排除项 |
| Ordered Artifact Flow | PASS | PASS | 本轮先生成规格与设计，再生成任务，随后才实施 |
| End-to-End Traceability | PASS | PASS | 每个 FR 映射到验收场景、契约和任务 |
| Evidence-Based Convergence | PASS | PASS | 基线、发现、验证和发布门禁均保存可复核证据 |

## Architecture Boundaries

### Domain layer

- `src/types/workflow.ts`
- `src/types/imageModels.ts`
- `src/lib/documentSnapshot.ts`
- `src/lib/promptRunAdmission.ts`
- `src/lib/referenceInputs.ts`
- `src/lib/evaluation*` and prompt policy modules

These modules own pure validation, state transition, compatibility and canonicalization. They MUST NOT read process globals, database connections or provider secrets.

### Adapter layer

- Express routes under `server/routes/`
- PostgreSQL and migrations under `server/lib/database.ts`
- File storage under `server/lib/fileStore.ts`
- DAG/queue/runner under `server/engine/`
- Provider transports under `server/providers/`
- CLI/evidence scripts under `scripts/`

Adapters translate external inputs to domain values and persist domain outcomes. They MUST not introduce a second business rule.

### Release layer

- `docs/ai/apiyi/`
- `scripts/apiyi-docs.mjs`
- `scripts/apiyi-kb.mjs`
- `scripts/codex-gate.mjs`
- `server/lib/evaluationRelease*.ts`

This layer owns evidence freshness, exact hashes, release registry, build identity and fail-closed promotion.

## Batch Strategy

1. **P0**: freeze baseline, close release evidence, verify API/route gates, correct confirmed authorization, data-loss, SSRF, duplicate-charge and release blockers.
2. **P1**: unify document epoch boundaries, DAG/queue/worker/provider/result contracts, and migration compatibility without breaking old reads.
3. **P2**: measure and optimize query count, queue claim, serialization, image processing, caching and rendering.
4. **P3**: split remaining high-complexity modules, remove duplicate rules, unify errors and perform separately approved UI refinements.

Each batch requires focused tests, lint/check/build, diff whitespace check, GitNexus impact and change detection, and the applicable Codex gate. API易 knowledge checks are required only when the batch touches API易-related paths.

## Migration and Rollback

| Legacy surface | New boundary | Compatibility period | Rollback |
|----------------|--------------|----------------------|----------|
| `ProjectTab[]` and stored `flow_json` | canonical `DocumentSnapshot` and epoch-bound transitions | read old fields and normalize on write | retain old readers and revert adapter switch |
| queue row + worker side effects | explicit lease/retry/outcome state machine | accept old durable rows and map unknown statuses | disable new claim path and replay only known-safe rows |
| model/provider config | product model ID + upstream contract ID | retain retired IDs for history only | restore previous contract snapshot and block new runs |
| evidence files and release registry | exact SHA-bound evidence closure | accept previous release only while hashes match | deploy previous saved release version |

No database or document format migration may delete data, silently replace a retired model, or discard historical evidence.

## Planned Verification Surfaces

- Unit/domain: `tests/*` for authorization, document boundary, DAG, queue, provider, migration and evidence.
- Integration: isolated PostgreSQL through existing `scripts/test-with-postgres.mjs`.
- Browser: `e2e/*` at 1024, 1280 and 1440 CSS px.
- Static/release: API易 offline/current export check, GitNexus `impact`/`detect_changes`, `npm run gate:codex`.
