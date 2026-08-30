<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **kittin-saas-b-v2** (19639 symbols, 43580 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user. For unified PDG impact, add `mode: "pdg"` with optional `line: <N>` — it returns statement-level `affectedStatements` over CDG + REACHING_DEF and inter-procedural symbols in `interproceduralByDepth`/`byDepth`; no-layer/degraded PDG results are UNKNOWN-risk notes (`--pdg` layer).
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).
- For control/data dependence, `pdg_query({mode: "controls", target: "fileOrSymbol"})` answers "under what condition does X run?" (CDG, incl. guard clauses) and `pdg_query({mode: "flows", target, variable})` traces "where does variable Y flow?" (REACHING_DEF). `--pdg` layer.

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/kittin-saas-b-v2/context` | Codebase overview, check index freshness |
| `gitnexus://repo/kittin-saas-b-v2/clusters` | All functional areas |
| `gitnexus://repo/kittin-saas-b-v2/processes` | All execution flows |
| `gitnexus://repo/kittin-saas-b-v2/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

# Garment Canvas — Current Project Rules

This file is the single source of truth for current project rules. Dated handoffs,
completion ledgers, review notes, and screenshots are historical evidence only. If
they conflict with this file, follow this file and the user's latest explicit
instruction, then verify drift-prone repository and release state live.

## 1. Product Scope

- Garment Canvas is a desktop-only web product. The supported minimum width is
  1024 CSS pixels; 1280px and 1440px are the primary acceptance widths.
- Do not add mobile navigation, mobile-only layouts, touch-only interactions, or
  mobile regression scope unless the user explicitly changes the product contract.
- Use Node.js 22.20.0 or newer. PostgreSQL 18 is the production source of truth;
  SQLite exists only for legacy import and migration verification.

## 2. UI and Interaction Rules

- Every new or modified general-purpose UI surface must use the project's local
  shadcn components in `src/components/ui/`. This includes buttons, tabs, dialogs,
  alert dialogs, menus, cards, sheets, tooltips, skeletons, and equivalent standard
  controls. Do not hand-roll a second implementation of an available primitive.
- When no matching primitive exists, add or extend a project-local shadcn primitive,
  then compose the product-specific component from it. Canvas mechanics that have
  no shadcn equivalent may continue to use React Flow and domain code, but their
  visible standard controls must still be composed from shadcn primitives.
- A scoped UI change should migrate any equivalent hand-rolled controls it touches;
  unrelated legacy UI is not a reason for a broad rewrite.
- shadcn components own presentation, accessibility, and controlled component
  behavior only. Business state remains in the existing Store/domain layer. Theme
  ownership remains `data-theme` plus `--gc-*` variables; do not create a second
  theme source of truth.
- Preserve keyboard operation, visible focus, accessible names/states, reduced-motion
  behavior, and focus restoration for every changed interaction.
- Before editing UI or interaction code, present the concrete behavior and layout
  proposal to the user and wait for explicit confirmation. Read-only audits,
  screenshots, impact analysis, and proposal writing do not require confirmation.

## 3. Results and Document Boundaries

- Results must not be removed, hidden behind a degraded path, or weakened. Preserve
  cross-project run recovery, success, failure, unknown-result handling, view,
  compare, download, and continued processing / set-as-input flows.
- Keep `ProjectTab[]` as the canonical document source and preserve the strict
  `DocumentSnapshot` boundary. Selection, viewer/compare state, runtime state,
  React Flow measurements, and temporary UI state do not belong in project data.
- Async save, run, upload, asset, and mask writes must remain bound to the initiating
  `tabId + projectId + documentEpoch`. Do not let late responses write into a new
  document occupying the same tab container.
- UI panel open/closed state remains local UI state and must not enter document
  history, session persistence, or the business Store.

## 4. Security and Data Invariants

- Keep `/api/health`, `/api/ready`, login, and session checks intentionally separate
  from authenticated routes. Do not weaken `requireAuth`, `requirePasswordChanged`,
  or `requireAdmin` coverage.
- Preserve one active device session per account, hashed tokens, secure cookie
  attributes, replacement-session reporting, and revocation after account changes.
- Enforce owner/admin checks on projects, files, assets, history, usage, and output.
  Prefer a non-disclosing `404` when revealing resource existence would leak data.
- Validate image identifiers, MIME/extension, decoded size, and local references
  before filesystem access. Prevent traversal and arbitrary local/remote URL access.
- Keep destructive multi-table operations and ownership/reference updates
  transactional. Preserve recovery windows and referenced-asset deletion guards.
- Never expose AI gateway keys to clients or logs. Retain provider request limits,
  reference-image ordering, and non-stretching resize semantics. Automated tests
  must not call paid or real AI providers unless the user explicitly authorizes it.

## 5. Change and Verification Workflow

- Inspect relevant flows and tests first. Run GitNexus `impact` before editing a
  function, class, method, route contract, or shared type; warn before proceeding
  when risk is HIGH or CRITICAL.
- Prefer the smallest evidence-backed patch. Do not mix UI work with unrelated
  security fixes, architecture rewrites, dependency upgrades, or formatting churn.
- Add or update regression coverage for each behavior change. For desktop UI, assert
  rendered geometry and interactions at 1024, 1280, and 1440 rather than class names.
- Use the existing scripts: `npm run lint`, `npm run test`, `npm run check`, and
  `npm run build`. The isolated PostgreSQL runner owns test Compose lifecycle; do
  not replace it with ad-hoc direct Compose commands.
- Before delivery or commit, run the relevant focused tests, `npm run check`,
  `npm run build`, `git diff --check`, and GitNexus `detect_changes`. Report any
  unavailable or degraded gate instead of treating it as passed.

## 6. Git, Review, and Release Gates

- Preserve unrelated user changes in a dirty worktree. Do not force-reset, clean,
  rebase, or overwrite work that is outside the requested scope.
- The user message `通过` authorizes committing and pushing the approved batch plus
  a local exact-SHA review using the configured local review model. It does not
  authorize merging to `main`, tagging, releasing, or deploying.
- Do not trigger or wait for Codex Cloud review. The current review path is local
  tests, GitNexus, CI where applicable, exact head/base verification, local-model
  review, and the user's explicit approval.
- Merging a PR, tagging, publishing a release, and deploying each require explicit
  user authorization. Never merge automatically.
- Keep `.env`, `.env.local`, PATs, provider keys, credentials, uploads, database
  dumps, `data/`, `dist/`, `dist-server/`, and other runtime/generated output out of
  commits and agent output. `.env.example` remains the public configuration contract.
- Historical audit details belong in `CODEX_REVIEW_HANDOFF_APP.md` and dated docs,
  not in this current-rule file.
