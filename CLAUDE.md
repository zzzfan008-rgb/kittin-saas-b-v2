@AGENTS.md

# Claude Code Collaboration

- Use the `review-and-optimize` skill for repository audits, security/correctness reviews, and evidence-backed fixes.
- Begin every task by recording the current commit, branch, worktree path, and whether the session is read-only or may edit.
- A primary-worktree session is audit-only. Before editing, verify that the current checkout is a linked worktree created for the task; otherwise stop and instruct the user to launch `claude --worktree <task-name>`.
- Respect the project PreToolUse hook. Do not disable, bypass, rewrite, or route around a blocked primary-worktree or sensitive-file operation.
- The hook prevents common mistakes; it is not an adversarial containment boundary. Its path guard covers file tools, not paths reached by Bash subprocesses in a linked worktree. Never use absolute paths, `git -C`, shell indirection, or child processes to evade it.
- Start worktrees from the current local `HEAD`. Do not silently switch the baseline to `main` or another remote branch.
- Do not install or update dependencies: worktrees intentionally share `node_modules`. Escalate dependency or lockfile changes to Codex.
- Keep all changes local. Do not push, open pull requests, merge, rebase, cherry-pick, reset hard, or clean.
- Finish with the structured Claude-to-Codex handoff required by `AGENTS.md`.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **kittin-saas-b-v2** (33451 symbols, 75442 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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
