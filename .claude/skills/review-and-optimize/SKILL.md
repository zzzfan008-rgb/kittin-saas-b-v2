---
name: review-and-optimize
description: Audit and safely improve Garment Canvas with bounded review lanes, independently validated findings, module-level impact analysis, measurable optimization targets, regression tests, isolated worktree edits, and a structured handoff to the local delivery gate. Use for project reviews, security or correctness audits, optimization requests, branch reviews, and fixing confirmed findings across authentication, authorization, files and assets, PostgreSQL, AI gateway boundaries, workflow data, API contracts, and canvas performance.
---

# Review and Optimize

Follow the five phases in order. Keep the audit independent from prior conclusions and prefer raw source, scan, test, and diff evidence.

## 1. Establish the baseline

- Record `BASE_COMMIT` with `git rev-parse HEAD`, the current branch, repository root, worktree path, and `git status --short` before doing anything else.
- Determine whether the current checkout is the primary worktree or a linked worktree using `git worktree list --porcelain`.
- Allow a read-only audit in either location. In the primary worktree, use only the hook's read-only Bash allowlist plus Read/Grep. Refuse all edits and instruct the user to restart with `claude --worktree <task-name>`.
- Stop if unrelated user changes make the audit or patch ambiguous. Do not stash, discard, overwrite, or absorb them.
- Never install or update dependencies because worktrees share `node_modules`.

## 2. Audit before editing

- Read `AGENTS.md` in full, including its code intelligence section, and take the current project rules from there rather than from dated handoffs.
- For structural questions use the deterministic tools the project actually ships: `dependency-cruiser` (`.dependency-cruiser.cjs`) for module dependency, layering and cycle questions, and `ast-grep` (`sgconfig.yml`, `tools/ast-grep-rules/`) for syntax-level structural questions. There is no symbol-graph or execution-flow index; fall back to `Grep` and the TypeScript language service for symbol-level questions, and say so when that limits the answer.
- Inspect tests and run focused non-mutating checks needed to distinguish real defects from speculation.
- Select one bounded lane per audit invocation unless the user explicitly requests a diff-only review:
  1. Authentication, single-device sessions, password changes, and administrator authorization.
  2. Ownership boundaries plus file, asset, upload, output, and path access.
  3. PostgreSQL 18 migrations, transactions, recovery, and SQLite import compatibility.
  4. AI gateway secrets, HTTPS, provider contracts, request limits, and reference ordering.
  5. Workflow persistence, schema compatibility, API contracts, and cross-resource consistency.
  6. Canvas and image-processing performance, only with a reproducible metric and baseline.
- Cap a lane at eight validated findings. For a whole-repository request, output the lane queue and complete lanes in separate invocations rather than starting a monolithic audit.
- Report every finding with: `ID`, `Severity` (`P0`–`P3`), `Confidence`, `Origin` (`pre-existing` or `introduced since BASE_COMMIT`), `File:line`, `Evidence`, `Impact`, `Reproduction or test`, `Independent validation`, and `Recommended fix`.
- Require a second validation path for P0–P2: a regression test, a type-check or scan result, or an independent reviewer given raw source/diff evidence. Keep an unvalidated candidate out of `FINDINGS` and list it under residual risks.
- Do not report formatting preferences, hypothetical issues without an executable path, or broad redesign ideas as defects.
- For optimization, record the workload, baseline metric, measurement command, and target before editing. If no reproducible baseline exists, report the measurement gap instead of claiming or implementing an optimization.

## 3. Fix confirmed findings only

- Edit only when the user requested fixes and the session is in a linked worktree.
- Before changing a function, class, method, route contract, or shared type, establish its module-level blast radius: who imports it, and which dependency paths reach it. If the change crosses a shared contract or a layer boundary, report the affected surface before editing.
- Implement the smallest coherent fix. Keep unrelated cleanup, dependency upgrades, and cosmetic changes out of the patch.
- Add a regression test that fails on the original behavior when practical.

## 4. Verify the branch

- Run the closest focused test first, then `npm run check` and `npm run build`.
- Run the deterministic scans over the changed surface and confirm no new dependency violation or structural finding: `npx depcruise --config .dependency-cruiser.cjs src server scripts e2e` and `ast-grep scan --config sgconfig.yml src server scripts e2e`. Report degraded or unavailable scan evidence instead of treating it as passed.
- Independently review the complete `BASE_COMMIT..HEAD` diff after tests. Recheck every P0–P2 fix using the validation path recorded with its finding.
- Review `git diff --check`, `git diff --stat`, and the complete diff. Confirm that no private `.env`/`.env.local` files, credentials, runtime data, generated build output, uploads, or unrelated files are included; allow intentional updates to the tracked `.env.example` contract.
- If any required check fails, do not present the change as complete. Either fix it or record the exact blocker and preserve the evidence.

## 5. Commit and hand off

- Create one or more focused local commits only after verification. Never push, create a PR, merge, rebase, cherry-pick, reset hard, or clean.
- End with this exact report structure:

```text
BASE_COMMIT: <sha>
WORKTREE: <absolute path>
CLAUDE_BRANCH: <branch>
CLAUDE_COMMITS: <sha list or NONE>
AUDIT_LANE: <1-6 or DIFF-ONLY>

FINDINGS:
- <ID, severity, confidence, origin, location, evidence, impact, independent validation>

CHANGES:
- <behavioral change and regression test>

TESTS:
- <command>: PASS | FAIL | NOT RUN — <reason>

CODE_INTELLIGENCE:
- <module-level blast radius, dependency or structural findings, and risk>

RESIDUAL_RISKS:
- <remaining issue or NONE>

DELIVERY_GATE_FOCUS:
- <specific diff, assumption, or risk for the reviewer to re-check>
```

- Hand the change to the user for the project's local delivery gate (see `AGENTS.md`, section 6) and give it the `DELIVERY_GATE_FOCUS` items, rather than asking any external service to review it. Do not recommend blind cherry-picking.
