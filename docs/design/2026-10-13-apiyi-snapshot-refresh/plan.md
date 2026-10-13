# API易本地知识库快照刷新 — 收敛指令（2026-10-13）

## 背景

API易本地知识库快照已从 `2026-09-18T04-42-51.697Z-6e0c4634fe56ccfd`（2799 页）刷新到
`2026-10-13T05-30-11.372Z-a4cb45623fa08286`（3057 页）。

快照文件本身已作为**独立提交** `7ab7018a` 落在本分支（从 origin/main @`1295c3d5` 建出，
只含这一个纯文档提交、3066 个文件、零功能代码——这是**刻意的解耦**：快照基线维护
独立于 `fix/r100-comments-1-3` 功能线，不要把功能代码合进来）。

刷新后 27 个精选来源全部报 SHA 漂移，`guard` 当前 FAIL。本分支的目标：把基线维护线
收敛到 guard 绿，之后独立走门禁、独立开 PR。

## 执行步骤（backend）

在主仓 `~/dev/kittin-saas-b-v2` 上先 `git checkout chore/apiyi-snapshot-20261013`（或用
`.worktrees/snapshot-refresh`），然后：

1. **更新精选来源 hash**：跑 `npm run docs:apiyi:refresh`，把
   `docs/ai/apiyi/sources.json` 的 27 个精选来源 hash 更新到新快照；核对模型清单基线
   （`model-knowledge.json` / `model-contracts.json`）是否需同步。
2. **自洽校验**：跑 `node scripts/apiyi-docs.mjs check`，确认 sources/契约自洽。
3. **receipt 处置**：评估 `docs/ai/apiyi/consultations/` 下各 receipt 是否因快照变化
   失效（fingerprint 或 sources sha 与当前快照不一致的即失效），需要则按正规路径重新
   `lookup` 生成。
   - 知识门硬约束：`writeConsultationReceipt` 绑「当前 HEAD + 未提交 diff」——
     affectedPaths 必须在工作树未提交改动里；`baseCommit` 取当前 HEAD。
   - guard 读的是**当前工作树**，必须在检出目标 head 的树里跑。
   - 需要覆盖 base..head 区间时走「受控 worktree 再生法」（基于 base 的 worktree 里
     checkout head 文件 → lookup → json 拷回 commit）。
   - 手写指纹一律禁止，必须用库内 `lookup`。
4. **最终自证**：`npm run docs:apiyi:guard -- --base origin/main --head HEAD` 必须
   EXIT=0（merge-base 基线口径，不是 parent 基线）。
5. **提交**：明确路径 `git add`，**不许 `git add -A`**；不 push（等统一指令）。

## 纪律

- 凭据一律脱敏，不落盘、不出现在任何输出/回执里。
- 所有结论以**真实跑的命令输出**为准；不采信转述、不自述未验证的事项。
- 读磁盘核实，不采信任何自述。

## 交付回执格式

- 改了哪些文件（路径列表）
- `npm run docs:apiyi:refresh` 输出（27 个来源是否全部更新）
- `node scripts/apiyi-docs.mjs check` 结果
- 各 receipt 的处置（保留 / 重新生成，附新 hash）
- `guard --base origin/main --head HEAD` 最终输出（EXIT=0）
- 新提交 SHA

## 参考

- 快照提交：`7ab7018a`（本分支 HEAD，从 origin/main @1295c3d5 cherry-pick 而来，
  原始快照生成提交为 6001e8a，已废弃删除）
- 快照元数据：`docs/ai/apiyi/site/current.json`（rawSnapshotPointer）
- 精选来源清单：`docs/ai/apiyi/sources.json`（schemaVersion 3，27 个来源）
- 知识门技能：`apiyi-knowledge-gate`（guard 基线口径、receipt 再生法、漂移机理）
