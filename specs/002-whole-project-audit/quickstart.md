# Quickstart Validation: Garment Canvas 全量审计整改

本指南用于复核当前工作树候选，不替代 `AGENTS.md` 中的项目政策。所有 Provider 行为使用假 Provider 或离线契约检查；本轮不调用图片生成或编辑端点。

## 1. Spec Kit prerequisites

```bash
bash .specify/scripts/bash/check-prerequisites.sh --json --require-spec --require-tasks --include-tasks
```

Expected: `FEATURE_DIR` points to `specs/002-whole-project-audit` and all required documents are present.

## 2. Focused contract checks

```bash
npm run docs:apiyi:kb:check
node scripts/apiyi-docs.mjs check --offline
npm run evaluation:node-matrix:check
npm run evaluation:manifest:check
```

Expected: the five exact API易 IDs are covered by the reviewed export metadata; all offline contracts, parameter profiles and release manifests validate. No paid Provider call is made.

## 3. Core regression checks

```bash
npm run test
npm run lint
npm run check
npm run build
git diff --check
```

Expected: authentication and ownership, document epoch isolation, DAG/queue state transitions, Provider failure classification, migrations, history recovery and evidence validation pass.

## 4. Desktop acceptance

```bash
npm run test:e2e
```

Run the core workflow at 1024, 1280 and 1440 CSS px. Verify login, project open/save/reopen, reference-role admission, run status, result viewing and error recovery. Check keyboard focus, no stale async write-back, and readable unavailable states.

## 5. GitNexus and release gate

```bash
gitnexus status
npm run gate:codex -- --uncommitted
```

The final `--base origin/main` gate requires a clean worktree and is only valid after the candidate is committed. Any actionable P0-P3 finding, stale index, missing evidence or non-repeatable test remains fail-closed.

## Evidence recording

Record command status and concise output in `docs/audit/2026-09-04/verification.md`. Record findings in `findings.json`; do not mark a finding fixed until its regression test and verification command exist.
