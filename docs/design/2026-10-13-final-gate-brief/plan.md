# fix/r100-comments-1-3 最终完整 Gate 指令（2026-10-13）

## 背景

功能分支 `fix/r100-comments-1-3`（HEAD `70e2f55`，相对 origin/main @`1295c3d5` 共 68 提交）
包含：模特试穿模板协议重写、提示词改写层（运行时自动改写 + ✨按钮）、节点 UI 批注
R-100~R-126、INV-1 废止等。

此前已多轮复审，代码层面 PASS，但一直因外网中断无法跑**完整 gate**（npm ci + git fetch
+ reviewOnly:false model 评审），只出了离线确定性证据。现在外网已恢复，本次跑完整 gate。

## 范围

- diff `origin/main..HEAD`（base=`1295c3d5`，head=`70e2f55`）。

## 完整 gate 全部阶段（在线跑，不许跳过）

1. `git fetch origin`（网络恢复后在线）
2. `npm ci`
3. apiyi 知识门：`npm run docs:apiyi:guard -- --base origin/main --head HEAD`
   （merge-base 基线口径，**不是 parent 基线**；agent 自证用 parent 基线不等于门禁通过）
4. `npm run check`（tsc 0 / C8 白名单 0 违规 / build:web CSS+包体门禁 / PG 全量）
5. `npm run test:e2e`（3 viewport）
6. `npm run build:server`
7. `npm run test:e2e:production`
8. `git diff --check`
9. code intelligence（ast-grep 0 / depcruise）
10. hermes model review（**reviewOnly:false**，全量分批）

## 已知两点注意

1. **vis-keyboard.spec.ts 噪声**：它是截图证据生成器，每次把 9 张图写进仓库 tracked 路径
   `docs/design/2026-10-08-mask-redraw-ux-polish/shots-batch3/`，本机渲染与基线字节不同
   会导致工作树变脏、gate 收尾 snapshot 失败。处置（上次已验证有效）：对这 9 个文件
   `git update-index --assume-unchanged` 临时隔离跑完整 gate，跑完
   `--no-assume-unchanged` 还原 + `git restore`，确保无标志残留、工作树干净。
   这 9 个文件本批零改，属既有环境噪声（CI 标准环境字节稳定故不脏）。后续建议把该测试的
   SHOT_DIR 改到临时目录（像 vis01 那样走 SHOT_DIR env），可另开小卡归 ui-qa——非本次
   阻塞项。
2. **最新一轮新增内容**（均在评审范围）：R-118~R-126 图片节点两态 UI（frameless hover
   外发光等）、文本节点两态（`882fa6a`）、端口行融合+上游来源胶囊（`872eea3`）、
   ImageNode 隐藏 file input 恢复 + `tests/asset-library-model.test.ts` 契约放宽、
   `server/lib/workflowSchema.ts` INV-1 废止注释、`server/routes/textRewrite.ts` 删 v7
   死字段 `promptFamilyId`（`7eff837`）、✨保存先行 + 锚点后无补充时禁用（文本节点
   A 案，`bc248e3` 等已 cherry-pick 入分支）。按实际 diff 评审，不预设结论。

## 产出

- 完整 gate 的 **finalEvidence receipt**（`reviewOnly:false`，`gateDecision=pass`），路径
  惯例：`~/.hermes/profiles/reviewer/cache/scratch/pr100b-gate-final*/codex-gate-*.json`，
  并通过 `npm run gate:receipt:verify` 字节级验证。
- 各阶段真实输出留档。
- 发现缺陷照常按职责路由（orchestrator 不修）。

## 禁止事项

- **别 push、别开 PR**（push 等用户统一指令）。
- 别碰 `chore/apiyi-snapshot-20261013` 分支（backend 在收敛那条线）。
- 别删 worktree、别动 `.worktrees` 下目录。

## 回执格式

- receipt 路径 + `gate:receipt:verify` 结果
- 各阶段是否全绿（附关键数据：e2e passed/skipped/failed、PG 数、tsc、C8 违规数、
  depcruise modules/violations）
- model review 批次结果（clean / finding 数，finding 逐条列）
- 结论：PASS / FAIL
