# 项目分析与优化建议 — 合并版（2026-09-17）

> 由 default agent 合并自两个 team agent 的独立分析，供 architect 出整合方案用。
> 完整原始件：backend 清单见其 state.db；designer 件在 `docs/design/2026-09-17-ui-audit/`（audit-report.md / design.md / tokens.css / shots/）。

## 一、后端（backend 审查，范围 server/）

结论基调：工程质量高（20 迁移、统一锁序、SKIP LOCKED、幂等去重、不可变评估账本、SSRF 防护到位），以下是增量问题。

| ID | 级别 | 分类 | 一句话 | 位置 |
|----|------|------|--------|------|
| B-01 | **P1** | 安全 | 文件 ACL 对 `owner_id IS NULL` fail-open，无主文件可被任意登录用户读 | `server/routes/files.ts:36-49` |
| B-02 | P2 | 持久化 | `generationRecords.ts`+`createRun` 死代码，用旧状态词表写同一张 `generation_runs` | `server/lib/generationRecords.ts`、`runner.ts:160` |
| B-03 | P2 | 可靠性 | 限流 Map 永不回收 + 未声明 `trust proxy` | `server/lib/rateLimit.ts:21-41`、`index.ts` |
| B-04 | P3 | 可靠性 | `transaction()` ROLLBACK 可能掩盖原始异常 | `databaseRuntime.ts:49-62` |
| B-05 | P3 | 持久化 | BIGINT→Number 隐性精度边界（当前安全，需注释声明） | `databaseRuntime.ts:5` |
| B-06 | P3 | API 一致性 | `/files/:id` 与 thumbnail 对「不存在 vs 无权限」返回不一致 | `files.ts:338-378` |

关键细节（B-01）：`if (access.owner_id === null || access.shared) return "public"` 把「未知归属」默认成公开，违反 AGENTS.md §4。建议 `owner_id IS NULL → denied`，只 `shared`（显式 global/shared）公开。

## 二、UI/UX（designer 审核，范围 src/components + css）

总评：底子不差（单一主题源、shadcn/Base UI 桥接、WorkbenchShell aria 齐全），核心是**token 体系被架空**（100+ 硬编码 hex）、三主题 accent 漂移、8-10px 中文字号。统计 4 critical · 6 major · 5 minor。

Critical：
- **C1** token 被架空：`src/components/**` 100+ 内联 hex（#262626×40 等），`index.css` 被迫用转义类名反查补主题，改一个值主题静默断裂。→ 全部迁 `--gc-*` token，删类名反查段。
- **C2** 双主题源：根目录 `theme-blocks.css` 无引用且与 `index.css` 值冲突。→ 删。
- **C3** 假字体：声明 `Inter` 但全项目无加载。→ 砍假 Inter，诚实系统栈 + 自托管 mono（数字/坐标用）。
- **C4** 8-10px 中文字号（text-[8/9/10px] 共 183 处），50% 缩放不可读。→ 中文下限 11px，8/9px 清零。

Major（M1-M6）：accent 语义漂移（粉/藏蓝都不对）；护眼绿换肤半成品（node-muted 3.43:1 不达标）；金色一色多用语义过载；「黑白」主题节点内两套控件语言（粉 accent 3.00:1 踩线）；reduced-motion 覆盖不全；状态点 8px 无图例。

Minor（m1-m5）：默认项目名机械时间戳；unsupported 英文徽章；onboarding 版本徽章+中英混杂；节点库卡片高度不齐；连线细弱无箭头。

正面确认：对比度 21 对 19 对达标（色板健康）；`@theme inline` 桥接、React Flow handle 光影、WorkbenchShell aria 都保留。

**design.md 已给完整修法**：字体策略（§1）、色彩系统 + accent 语义分配表（§2）、间距几何（§3）、动效（§4）、文案（§5）、实施顺序 P0-P4（§6）、数值唯一源 tokens.css。

## 三、交叉与依赖（供 architect 参考）

- 后端（server/）与前端（src/components+css）**无直接重叠**，可并行。
- 两条线都受 AGENTS.md 约束：UI 改动先给方案等确认；交付走 tsc/test/ast-grep/depcruise/gate:codex。
- 前端内部有强依赖：**C1（token 迁移）是 M1/M2/M3/M4 的前置**（accent 语义、护眼绿、金色收拢都要在 token 层先落地）；C2/C3/C4 可独立先行。
- B-01 是唯一 P1，建议独立先行（安全，改动小，有明确回归测试）。

## 四、architect 自己出的分析（第三份输入：架构现状 + 后续方向）

- **阶段 1.0 拆分已完成并验证**：runQueue.ts → 9 模块，语义等价（公开 API/5 错误类身份不变）、0 新增循环、0 孤儿、tsc/test/build/e2e 全绿，已合入 main。
- **遗留 P3**：`tests/codex-gate.test.mjs:1097` 的 `--commit` 精确范围测试被删、日志仍声明覆盖（非本次引入），建议独立 issue 跟进。
- **下一步建议（架构方向）**：阶段 2 继续拆大文件（候选 `evaluationPromotion.ts`）；或先修 P3。

> architect 这份是「架构现状 + 后续重构方向」，与 backend/designer 的「具体缺陷清单」互补。整合方案需同时覆盖三条线：backend 缺陷（B-01..B-06）、UI 缺陷（C/M/m）、架构层阶段 2 重构方向。

