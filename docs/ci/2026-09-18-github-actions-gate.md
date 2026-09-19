# GitHub Actions CI 门禁规格(2026-09-18)

本文是 Garment Canvas 的 GitHub Actions CI 设计规格。落地配置为
`.github/workflows/ci.yml`;本文件解释设计决策、契约、覆盖范围与已知缺口,
不复制 YAML 条文。

## 1. 背景与授权

- 用户指令:「启用 GitHub Actions,并修改 agents.md 的规定,取消本地 gate:codex 为准这条规定」。
- 改动前仓库没有任何 `.github/workflows/`,无 git hooks,无其它 CI 配置。
- `gh` token scopes 含 `workflow`,允许推送 CI 配置文件(推送仍需用户显式授权,不在本批)。

## 2. 触发条件

- `push`:仅 `main`,且带 `paths-ignore: ['docs/**', '**.md']`。理由(2026-09-19 修订):
  实测近 60 次 run 中 ≥21 次是 docs/design-only 提交,仍要各装一次 chromium 并跑
  `e2e` + `production-smoke` 两个 playwright job(每次 ≈5min);而交付分支的 push 与它的 PR
  是同一个 commit,等于把整套矩阵跑两遍(实测 3 个 commit × 2 run)。
  交付分支的绿灯由 PR 事件给出,不再由 push 给出。
- `pull_request`(目标 `main`):PR 场景是分支保护状态检查的唯一来源,**刻意不加 `paths-ignore`** ——
  main 的保护要求这 5 个 check 出现在 PR 的精确 head 上,被 paths 过滤掉的 PR 会永远等不到
  check 而无法合并(docs-only PR 仍跑全矩阵,这是保护正确性的代价)。
- `concurrency` 按 `ci-${{ github.workflow }}-${{ github.ref }}` 分组并
  `cancel-in-progress: true`:同一分支/PR 的新 push 取代未跑完的旧 run,避免队列堆积。
- `permissions: contents: read`:workflow 只需要读仓库,不申请任何写权限。

## 3. Job 划分与并行关系

5 个 job 互不依赖,并行运行:

| job | 内容 | 依赖服务 | 实测/预估耗时 |
| --- | --- | --- | --- |
| `static` | `npm run lint`(= `tsc --noEmit`) + `npm run build:web`(含 CSS/bundle 预算校验) | 无 | ~10s |
| `unit` | `npm run test`(`test:suite`,75 个测试文件串行) | postgres:18 service | ~100s |
| `e2e` | `npm run test:e2e`(dev 模式 playwright,server+vite) | postgres:18 service | 2.6–4.7min |
| `production-smoke` | `npm run test:e2e:production`(先 `npm run build`,再以 dist-server 冒烟) | postgres:18 service | ~3–5min |
| `code-intelligence` | ast-grep 结构规则 + dependency-cruiser 依赖规则 | 无 | <5s |

设计取舍:

- **并行而非串成一条**:5 个 job 互相独立,失败信号在最短时间内全部浮现;
  本地 `gate:codex` 的 5 阶段是串行的(ci → check → e2e → build → e2e:production),
  适合"过一道门才走下一道"的本地场景,在 CI 上会浪费等待时间。
- **`build:web` 只挂在 `static` 上,`production-smoke` 内自跑 `npm run build`**:
  `production-smoke` 需要 `dist-server` 产物,依赖 `static` 的产物会把两个 job 串起来;
  让 `production-smoke` 自己构建,代价是重复一次 ~6s 的 web build,换来并行。
- **e2e 与 production-smoke 分开**:两者都需要 PostgreSQL + playwright,但语义不同
  (dev 模式 vs 生产产物冒烟),合并会模糊失败归因;两者各自独占一个 postgres service。

## 4. PostgreSQL service 契约

所有需要数据库的 job 使用同一形状的 `services.postgres`:

- 镜像 `postgres:18`,与 AGENTS.md §1「PostgreSQL 18 is the production source of truth」一致。
- `POSTGRES_USER=garment_canvas`、`POSTGRES_PASSWORD=ci-test-password`、
  `POSTGRES_DB=garment_canvas_test`。
- `DATABASE_URL=postgresql://garment_canvas:ci-test-password@127.0.0.1:5432/garment_canvas_test`
  在 step 级 env 传入。
- health check `pg_isready` 每 5s 一次,20 次重试;runner 的
  `assertTestDatabaseReachable` 是第二道探活,service 起来慢时由它兜住。

为什么口令可以硬编码:这是 GitHub Actions runner 内一次性容器里的临时凭据,
容器随 job 结束销毁;它不是任何真实环境的凭据,也不是 secret。
`scripts/test-with-postgres.mjs` 的 `validateTestDatabaseUrl` 硬校验要求:

- 协议必须是 `postgresql:`;
- 主机必须是 `127.0.0.1` 或 `localhost`;
- **库名必须以 `_test` 结尾**(此处固定为 `garment_canvas_test`);
- 必须同时含用户名和密码。

playwright 配置额外硬校验(见 `playwright.config.ts` / `playwright.production.config.ts`):
`DATABASE_URL` 的库名必须恰好是 `garment_canvas_test`,`E2E_BASE_URL`/`E2E_API_URL`
必须指向 `http://127.0.0.1`,`APIYI_API_KEY` 必须等于 `e2e-disabled`。
这些常量与上述 service 环境一致,不需要任何仓库 secret。

## 5. Node 版本与缓存

- `actions/setup-node@v4` + `node-version-file: .nvmrc`:与本地门禁一致,
  以 `.nvmrc`(24.20.0)为唯一事实来源,不在 CI 里复制版本号。
- `cache: npm`:按 `package-lock.json` hash 缓存 `~/.npm`。实测本地 `npm ci` 4.9s,
  缓存只是好习惯;不为它引入 `actions/cache` 手工键或依赖路径定制。

## 6. 代码智能段(CI 版)

`code-intelligence` job 复刻本地 gate 的确定性代码智能证据,但**不含 LLM 评审段**
(见 §9 未覆盖环节)。

工具来源与版本策略(2026-09-18 R-17 修订):

- `ast-grep` 与 `dependency-cruiser` 已作为 devDependencies 固定进 `package.json`
  (`@ast-grep/cli@0.39.5`、`dependency-cruiser@18.3.0`),`npm ci` 后从
  `node_modules/.bin` 直接调用,本地 gate 与 CI 使用同一 lock 文件中的同一版本。
  版本漂移(本地 brew 18.3.0 vs CI npm 17.2.0)曾导致 CI 的 depcruise 输出
  不可解析 JSON;根因是 17.2.0 在 `import type` 解析与循环检测上的行为差异,
  升级 18.3.0 并在 `.dependency-cruiser.cjs` 中显式启用 `tsPreCompilationDeps: true`
  后消除。ast-grep 0.39.5 为 CI 首轮实测可用版本,与本地 brew 0.45.3 的规则集
  兼容;若后续升级需同步验证 `sgconfig.yml` 全部规则。
- 版本号固定到具体版本而非 range,保证 CI 可复现;升级走显式改动。
- dependency-cruiser 步骤通过 `NODE_PATH=$PWD/node_modules` 指向仓库依赖,
  与本地 gate 一致——缺失时会静默漏掉全部 TS 模块(见 codex-gate.mjs 注释)。
  且 depcruise 的 JSON reporter 退出码恒为 0,因此 CI 自行解析 stdout JSON 判定,
  不可解析即 fail-closed。

失败语义与 `scripts/codex-gate.mjs` 逐条对齐:

- dependency-cruiser:`error` 级违规、或任何 `severity !== "warn"` 或
  `rule.name !== "no-circular-baseline"` 的命中,都让 job 失败。
  depcruise 进程只在 error 级违规时返回非零,因此 CI 解析 `--output-type json`
  的 `summary.violations` 自行判定,**不允许把 warn 级非基线命中静默放行**。
- ast-grep:任何结构规则命中即失败(当前规则集不含豁免项)。
- 两步骤各自把原始 JSON 写到工作区文件再解析,与本地 gate 的
  「按 PATH 解析 + JSON 证据」同构,便于排障时对照本地结果。

安装步骤契约(2026-09-18 R-21 补充):

- **`code-intelligence` job 必须在 `setup-node` 之后、任何 `node_modules/.bin/*`
  或 `npm run` / `npx` 调用之前执行 `npm ci`。** R-17 把「Install gate tools」
  (`npm install --no-save`)改为从 `node_modules/.bin` 直调时漏掉了安装步骤,
  导致首次 CI 复跑 `depcruise` 退出码 127(可执行文件不存在);R-21 补上
  `- run: npm ci`,与其它 4 个 job 的写法一致。
- 推广到所有 job:任何依赖 `node_modules/.bin/*`、`npm run`、`npx` 或
  已安装包内脚本的步骤,前置必须存在 `npm ci`(或等价的依赖安装步骤)。
  新增 job 时把这条作为自查清单的第一项。
- 为什么本地预跑发现不了:本地 `node_modules` 长期存在,即使 workflow YAML
  漏写 `npm ci`,本地按 job 命令手动复跑也能跑通——只有 CI 的干净容器才暴露
  这个缺陷。此类「缺失安装步骤」只能依靠 CI 复跑发现,无法在本地预知。

## 7. 所需 secrets 清单

**当前 CI 不需要任何仓库 secret**。所有步骤使用的值要么是 CI 内部 dummy,
要么是公开常量:

| 值 | 来源 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` / postgres 口令 | YAML 内硬编码 | CI 一次性容器,见 §4 |
| `APIYI_API_KEY=e2e-disabled` | runner 脚本注入 | e2e/production-smoke 安全开关,禁止真实付费调用 |
| `GITHUB_TOKEN` | Actions 自动注入 | 仅 `contents: read`,当前 workflow 未使用 |

未来若要新增需要真实凭据的步骤(例如部署预览、发布 npm 包),必须使用
`secrets.*` 并在本节登记;不得把密钥写入 YAML 或 `.env*` 文件。

## 8. 证据归档

- **状态检查**:5 个 job 的成功/失败状态直接作为 PR 状态检查,
  是分支保护「Require status checks to pass」的证据来源。
- **e2e 失败工件**:`e2e` 与 `production-smoke` 在 `if: failure()` 时上传
  `test-results/` 与 `playwright-report/`(playwright 失败截图/trace 所在),
  保留 7 天;成功 run 不上传,避免存储膨胀。
- **代码智能证据**:ast-grep / depcruise 的 JSON 直接在 step 日志里打印汇总
  (与本地 gate 输出格式一致),不单独归档;需要逐条对照时在本地重跑 gate 即可。
- **本地 gate 证据**:`npm run gate:codex` 产生的 receipt 仍按原路径
  (`docs/evidence/` 等)归档,作为本地预检的可选辅助证据,不再是唯一权威。

## 9. 本地 gate:codex 与 CI 的分工边界

| 维度 | CI(GitHub Actions) | 本地 `gate:codex` |
| --- | --- | --- |
| 角色 | **项目门禁载体**:push/PR 的持续验证 + 分支保护状态检查 | 可选的本地预检 / 加速手段 |
| 证据权威 | PR 合并所需的状态检查来源 | advisory;不能替代绿 CI |
| 触发 | push / pull_request 自动 | 开发者手动 |
| LLM 评审 | **不跑**(见下) | 跑(Hermes reviewer 子进程) |
| base/head 选择 | 由 push/PR 事件隐式确定 | `--base` / `--commit` / `--uncommitted` 显式指定 |
| 不可变证据路径校验 | 不做 | 做(immutableEvidencePathspec) |
| docs:apiyi:guard | 不做 | 当 diff 命中 change-scope 时做 |
| 报告 | PR 状态检查 + Actions 日志 | receipt + 控制台 |

原则:

- **CI 是合并的必要条件**:PR 状态检查全绿才允许合并(配合分支保护)。
- **CI 不是合并的充分条件**:合并 main / 打 tag / 发布 / 部署仍需用户显式授权(AGENTS.md §7)。
- **本地 gate 仍推荐跑**:在 push 前用 `npm run gate:codex` 在本地复现 CI 的确定性检查
  (外加 LLM 评审段),把失败挡在本地;但它的结果只是参考,不是交付的权威证据。
- **degraded 必须如实报告**:CI 任何 job 跳过、取消、超时或以非预期方式通过,
  都必须如实标注,不得当作通过。这条原则在 AGENTS.md §6 保留。

## 10. 未能在 CI 覆盖的环节(诚实清单)

以下是 CI **没有、也不声称**覆盖的环节,依赖本地流程或人工把关:

1. **LLM 评审段**:`gate:codex` 的 Hermes reviewer 子进程评审不在 CI 跑。
   它需要本机 Hermes Agent 与用户配置的默认模型,且评审证据链(prompt 文件、
   sha256、哨兵包裹)是为本地隔离设计的;把它搬上 CI 需要重新设计证据链与
   密钥管理,是独立任务。
2. **不可变证据路径校验**:`gate:codex` 会校验 `docs/ai/apiyi/site/snapshots/` 与
   `docs/ai/apiyi/consultations/` 的逐字节不变量;CI 不校验这条(diff 范围由事件决定,
   不是 base/head 选择)。
3. **docs:apiyi:guard**:API易 知识门禁只在 diff 命中 `change-scope.json` 时本地触发,
   CI 不感知 change-scope。
4. **macOS / Windows  runner**:CI 只跑 `ubuntu-latest`。产品契约是桌面 Web(1024+ CSS px),
   部署目标是 Linux/Docker;不为本地 macOS 开发环境跑 CI。
5. **真实 AI provider 链路**:`APIYI_API_KEY=e2e-disabled` 是安全开关,
   CI 永远不触达真实付费 provider;评估授权(Campaign/Slot 账本)不在 CI 路径上。
6. **本地 `.env` 差异**:CI 只用 service 注入的连接串,不读 `.env`;
   开发机 `.env` 里的端口/口令差异不会被 CI 发现。
7. **并发数据库冲突**:本地 runner 的 per-worktree 锁防止两个本地测试撞库;
   CI 每个 job 一个独立容器,不存在该问题,但本地并发场景 CI 无法验证。
8. **「缺失安装步骤」类缺陷无法在本地预知**(2026-09-18 R-21 补):本地
   `node_modules` 长期存在,workflow YAML 漏写 `npm ci` 时本地按 job 命令
   手动复跑仍然能跑通;只有 CI 的干净容器才会以 `exit 127` 暴露。R-17
   改 `code-intelligence` job 时就漏了这一步,首次 CI 复跑才发现。
   防范手段是把「任何 `node_modules/.bin/*` / `npm run` / `npx` 调用之前
   必须存在 `npm ci`」列为新增/修改 job 时的自查清单第一项(见 §6)。

## 11. 验证状态

- `actionlint` 与 `act` 在本机不可用,workflow YAML 未做工具级 lint;
  语法与结构经人工对照 GitHub Actions 文档与现有项目脚本核对。
- `gh workflow list` / `gh api` 校验需要在 push 后进行(推送需用户授权,不在本批)。
- 本规格与 `.github/workflows/ci.yml` 同批交付;任何后续改动必须同步更新本文件。

## 12. 分支保护状态(2026-09-19 核验)

`gh api repos/zzzfan008-rgb/kittin-saas-b-v2/branches/main/protection` 实测:

| 项 | 值 | 含义 |
| --- | --- | --- |
| `required_status_checks.strict` | `true` | 合并前分支必须与 `main` 保持最新 |
| required checks | 上面 5 个 job | 必须出现在 PR 的**精确 head** 上 |
| `required_pull_request_reviews` | `required_approving_review_count: 0` | **合并必须走 PR**;不要求人工批准(本仓库只有一名人类维护者,要求 ≥1 会导致无人可批) |
| `enforce_admins` | `false` | 管理员仍可绕过保护直接推 `main`(安全阀) |
| `allow_force_pushes` / `allow_deletions` | `false` | 禁止强推与删分支 |

**含义的变化**:此前的保护只要求 5 个 check、不要求走 PR,因此直推 `main` 时 CI 是「事后验证」;
现在非管理员直推会被拒,交付路径收敛为「分支 → PR → 5 个 check 绿 → 合并」。
若要让门禁对管理员同样强制,把 `enforce_admins` 置 `true` 即可——这是需要用户显式决定的开关,
本文件只记录当前状态。
