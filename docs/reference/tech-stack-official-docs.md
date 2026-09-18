# 技术栈 · 官方文档索引(agent 指导文件)

> 本文件是 **参考资料**,不是运行时契约。任何冲突以 `package.json` / `package-lock.json`、
> 代码与 [`AGENTS.md`](../AGENTS.md) 的当前规则为准。
>
> - 快照时间:2026-09-18T16:06:52+08:00 (CST);精确固定策略于 2026-09-18T16:29:44+0800 追加核实;锚头刷新于 2026-09-18T18:21:22+0800(仅重锚,第 1–6 节版本值未改动);锚句措辞修正于 2026-09-18T18:28:45+0800(去掉会随 main 前进而失效的等值断言)
> - 仓库锚:`2eec80f`(`main`);该 SHA 已推送到 `origin`,刷新当时即 `origin/main`,CI run `35333888603` 在该精确 SHA 上五个必需检查(static / unit / e2e / production-smoke / code-intelligence)全部 success。锚的外部可验证性由此成立:任何人 `git checkout 2eec80f` 都能复核。**锚落后于 `origin/main` 属正常**:main 每有一次新提交就会前进,而本表的版本事实绑定 `package-lock.json`,只在依赖真的变动时才需要更新(见第 9 节),不要把「锚不在 main 顶端」误读为文档失效。版本基线原采集于 `722900d`;本次刷新已重新对 `package-lock.json` 逐项复核第 1–6 节,26 个 npm 版本零不一致
> - 版本事实来源:`package.json` + `package-lock.json`(lockfileVersion 3) + `node_modules/<pkg>/package.json` 实测 + `.nvmrc` + `Dockerfile` + `compose.yaml`
> - 链接可达性:2026-09-18 对本文件内 75 个真实链接 URL 用 `curl -4 -s -L` 逐个实测,**除第 5 节标注的 Gemini 一项(302,本环境不可达)外全部 HTTP 200**;方法与重跑命令见第 7 节

---

## 0. Agent 使用规则(先读这一节)

1. **引用必须带版本**。本项目多处锁定在过去 major(Vite 6、TypeScript 5.9、Express 4、nanoid 5),
   而线上文档站多数只呈现最新版。查文档前先看第 2 节的「版本对应」列,不要拿最新版文档回答旧版行为。
2. **本地证据优先于线上文档**。任何一个包的确定版本与导出面,以
   `node_modules/<pkg>/package.json`、`node_modules/<pkg>/README.md`、包内 `.d.ts` 为第一手。
3. **只引一手来源**(官方文档站、官方仓库 tag、规范原文)。二手博客/教程只能用于发现线索,不能作为结论依据。
4. **改依赖版本后必须回来更新本文件**,否则第 1–6 节会出现与仓库不符的版本号。
5. **本文件不含任何密钥、内网地址或受保护内容**;`.env` / `data/` / `dist*` 一律不在范围内。

---

## 1. 运行时与基础设施

| 组件 | 仓库锁定版本 | 事实来源 | 官方文档 | 版本对应 |
| --- | --- | --- | --- | --- |
| Node.js | `24.20.0`(最低基线,`engines: >=24.20.0`) | `.nvmrc`、`package.json` | https://nodejs.org/docs/latest-v24.x/api/ | **版本化站点**(24.x 线) |
| Node.js v24.20.0 发布页 | — | `Dockerfile` 基础镜像、`.nvmrc` | https://nodejs.org/download/release/v24.20.0/ | 精确版本 |
| Node.js 发布/支持周期 | — | — | https://nodejs.org/en/about/previous-releases | 用于判断 LTS 状态 |
| PostgreSQL | `18`(生产真源) | `compose.yaml` (`postgres:18-alpine`)、`README.md` | https://www.postgresql.org/docs/18/ | **版本化站点**(18) |
| Docker Compose | Compose Spec(不锁版本) | `compose.yaml`、`README.md` | https://docs.docker.com/compose/ · https://docs.docker.com/reference/compose-file/ | 规范式,无版本号 |
| GitHub Actions | `actions/checkout@v4`、`actions/setup-node@v4` | `.github/workflows/ci.yml` | https://docs.github.com/en/actions | 按 action 各自 major |

补充事实(非文档):
- 本机 `node -v` 为 `v26.8.2`,高于 `.nvmrc` 基线;`engines` 只要求 `>=24.20.0`,门禁在 `.nvmrc` 精确版本上跑。
- 镜像内卷挂载点与 17→18 升级注意事项见 `README.md`(项目自身文档,非上游)。

---

## 2. 前端

| 包 | 锁定版本 | 线上最新(2026-09-18) | 官方文档 | 版本对应 |
| --- | --- | --- | --- | --- |
| react / react-dom | `19.2.8` | 19.3.0 | https://react.dev/ · https://react.dev/reference/react · React 19 发布说明 https://react.dev/blog/2024/12/05/react-19 | 站点覆盖 19.x,不按 minor 分站 |
| vite | `6.4.3` | **8.3.0** | https://v6.vite.dev/ | **版本化站点(v6)**;https://vite.dev/guide/ 是当前最新版文档,**不代表 v6** |
| typescript | `5.9.3` | **7.0.2** | 手册 https://www.typescriptlang.org/docs/handbook/intro.html · tsconfig 参考 https://www.typescriptlang.org/tsconfig | 手册**无版本化**;锁定 5.9 请读 5.9 发布说明 https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html |
| tailwindcss + @tailwindcss/vite | `4.3.3`(=最新) | 4.3.3 | https://tailwindcss.com/docs · 安装(Vite)https://tailwindcss.com/docs/installation/using-vite · 升级指南 https://tailwindcss.com/docs/upgrade-guide | 站点即 v4;v3 旧站 https://v3.tailwindcss.com/docs/installation |
| shadcn(CLI) | `4.19.0` | 4.21.0 | https://ui.shadcn.com/docs · CLI https://ui.shadcn.com/docs/cli · 主题 https://ui.shadcn.com/docs/theming | 站点对应 CLI v4 世代;`components.json` 用 `style: "base-nova"` |
| @base-ui/react | `1.7.0` | 1.8.0 | https://base-ui.com/react/overview/quick-start | 1.x |
| @xyflow/react(React Flow) | `12.11.2` | 12.11.6 | https://reactflow.dev/learn · API https://reactflow.dev/api-reference/react-flow | 站点覆盖 React Flow 12 |
| zustand | `5.0.14` | 5.0.15 | https://zustand.docs.pmnd.rs/ | v5 迁移指南 https://zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5 |
| zundo(undo/redo) | `2.3.0`(=最新) | 2.3.0 | https://github.com/charkour/zundo/tree/v2.3.0 | 仓库 tag(README 为唯一一手文档) |
| lucide-react | `1.33.0` | 1.47.0 | https://lucide.dev/guide/react · 图标检索 https://lucide.dev/icons/ | 1.x |
| class-variance-authority | `0.7.1` | 未查询 | https://cva.style/docs/getting-started/variants | 0.7.x |
| clsx | `2.1.1` | 未查询 | https://github.com/lukeed/clsx/tree/v2.1.1 | 仓库 tag(README) |
| tailwind-merge | `3.6.0` | 3.7.0 | https://github.com/dcastil/tailwind-merge/tree/v3.6.0 | 仓库 tag(README) |
| tw-animate-css | `1.4.0` | 未查询 | https://github.com/Wombosvideo/tw-animate-css/tree/v1.4.0 | 仓库 tag |
| nanoid | `5.1.16` | **6.0.1** | https://github.com/ai/nanoid/tree/5.1.16 | **tag 版文档**;`https://github.com/ai/nanoid` 的 `main` 分支已是 6.x |

已核实的项目约定(来自 `components.json`,一手事实):
`style: "base-nova"`,`iconLibrary: "lucide"`,`css: src/index.css`,`baseColor: neutral`,`cssVariables: true`,
aliases `@/components`、`@/components/ui`、`@/lib/utils`。
`base-nova` 是 Base UI 版 shadcn 样式 —— 已用官方 registry 直连核实:
`https://ui.shadcn.com/r/styles/base-nova/index.json` 的 `dependencies` 为
`class-variance-authority, cn, lucide-react, @base-ui/react`,`devDependencies` 为 `tw-animate-css, shadcn`,
与本仓库 `package.json` 依赖集合一致。Base UI 版组件页示例:https://ui.shadcn.com/docs/components/base/button
(shadcn CLI 的 `--base` 取值为 `base | radix | aria`,见 https://ui.shadcn.com/docs/cli)

---

## 3. 后端与数据

| 包 / 组件 | 锁定版本 | 线上最新(2026-09-18) | 官方文档 | 版本对应 |
| --- | --- | --- | --- | --- |
| express | `4.22.2` | **5.2.1** | https://expressjs.com/en/4x/api/ | **版本化站点(4.x)**;v5 文档为 https://expressjs.com/en/5x/api/ ,升级差异见 https://expressjs.com/en/guide/migrating-5/ |
| pg(node-postgres) | `8.23.0`(=最新) | 8.23.0 | https://node-postgres.com/ · Pool https://node-postgres.com/apis/pool | 8.x |
| better-sqlite3 | `13.0.3`(=最新) | 13.0.3 | https://github.com/WiseLibs/better-sqlite3/tree/v13.0.3 · API https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md | tag 版代码;**`docs/api.md` 取 `master` 分支**,如需严格对应请切到 v13.0.3 tag 后查看 |
| sharp | `0.35.3` | 0.35.4 | https://sharp.pixelplumbing.com/ · 构造参数 https://sharp.pixelplumbing.com/api-constructor | 站点即 0.35.x 线 |
| undici | `8.10.1` | 8.10.2 | https://undici.nodejs.org/ | 8.x;项目使用专属 `Agent` 做 connect/headers/body 分阶段超时 |
| openai(网关客户端) | `7.15.0` | 7.18.0 | https://github.com/openai/openai-node/tree/v7.15.0 · API 参考 https://developers.openai.com/api/reference/overview | 7.x |
| cors | `2.8.6` | 未查询 | https://github.com/expressjs/cors | README |
| @types/node | `24.13.3` | — | https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node | 与 Node 24 对齐 |

`package.json` 显式 `overrides`(安全补丁,排查依赖问题时必看):
`fast-uri: 3.1.7`、`qs: 6.16.0`。

---

## 4. 构建、测试与代码智能

| 工具 | 锁定版本 | 线上最新(2026-09-18) | 官方文档 | 版本对应 |
| --- | --- | --- | --- | --- |
| @playwright/test | `1.61.0` | **1.63.0** | https://playwright.dev/docs/intro · 发布说明 https://playwright.dev/docs/release-notes | **无版本化站点**:文档站始终是最新版;1.61 的变更只能查 release-notes 中的 `version 1.61` 段 |
| esbuild | `0.28.2`(=最新) | 0.28.2 | https://esbuild.github.io/ · API https://esbuild.github.io/api/ | 站点即最新 |
| tsx | `4.23.5` | 4.23.13 | https://tsx.is/ · https://tsx.is/getting-started | 4.x |
| ast-grep(`@ast-grep/cli`) | `0.39.5` | **0.45.3** | https://ast-grep.github.io/ · CLI https://ast-grep.github.io/reference/cli.html | 站点即最新;**0.39.5 精确版看 tag** https://github.com/ast-grep/ast-grep/tree/0.39.5 |
| dependency-cruiser | `18.3.0` | 18.3.1 | 规则参考 https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md · CLI https://github.com/sverweij/dependency-cruiser/blob/main/doc/cli.md · 文档目录 https://github.com/sverweij/dependency-cruiser/tree/main/doc | 官方文档只在仓库 `doc/`;**无独立文档站** |
| concurrently | `9.2.4` | 未查询 | https://github.com/open-cli-tools/concurrently/tree/v9.2.4 | 仓库 tag |
| cross-env | `7.0.3` | 未查询 | https://github.com/kentcdodds/cross-env | README |

### 版本声明策略(全仓库只有 4 个精确固定,一手核实)

`package.json` 里绝大多数依赖用 `^` 范围,但以下 **4 个是精确固定(无 `^`/`~`)**:

| 包 | 固定值 | 引入提交 | 原因(据提交与规则文件) |
| --- | --- | --- | --- |
| `@ast-grep/cli` | `0.39.5` | `63b4f9d`(R-17, 2026-09-18) | **让本地门禁与 CI 用同一个版本** |
| `dependency-cruiser` | `18.3.0` | `63b4f9d`(R-17, 2026-09-18) | 同上;此前本地(brew)与 CI(npm)版本不一致,同一份代码得出不同结论 |
| `@playwright/test` | `1.61.0` | `acda11f`(2026-08-24) | 浏览器回归基线可复现 |
| `undici` | `8.10.1` | (更早) | 传输层行为可复现 |

因此 **`@ast-grep/cli` 停在 0.39.5、`dependency-cruiser` 停在 18.3.0 是有意为之,不是遗漏**。
对其它 agent 的推论:升级这两个包属于「改动门禁行为」,需要单独评估并同步 CI,不能当成普通依赖升级随手带过。
代价是 ast-grep 落后上游 6 个 minor(见第 6 节技术债)。

**重要来源纠错(实测):**
- `https://dependency-cruiser.js.org/` 与 `https://sverweij.github.io/dependency-cruiser/` **不是文档站**:
  前者是一个跳转壳页,后者只渲染项目自身的依赖图。**引用 dependency-cruiser 必须指向 GitHub 仓库 `doc/`**。
- `playwright.dev` 的 `/docs/*` 页面永远对应最新发布版,对本仓库的 1.61.0 不是版本对齐文档。

项目内与之配套的规则文件(一手):`.dependency-cruiser.cjs`、`sgconfig.yml`、`tools/ast-grep-rules/`。

---

## 5. AI 网关与厂商能力

| 来源 | 类型 | 链接 | 可达性 |
| --- | --- | --- | --- |
| API易 官方文档 | gatewayContract(调用层事实) | https://docs.apiyi.com/ · 文档索引 https://docs.apiyi.com/llms.txt | 200 |
| OpenAI 图像生成指南 | vendorCapability | https://developers.openai.com/api/docs/guides/image-generation | 200 |
| OpenAI API 参考 | vendorCapability | https://developers.openai.com/api/reference/overview | 200(旧 `platform.openai.com/docs/api-reference` 已 302 到此) |
| BFL FLUX.2 提示词指南 | vendorCapability | https://docs.bfl.ai/guides/prompting_guide_flux2 | 200 |
| BytePlus Seedream(ModelArk) | vendorCapability | https://docs.byteplus.com/api/docs/ModelArk/1824121 | 200 |
| Google Gemini 图像生成 | vendorCapability | https://ai.google.dev/gemini-api/docs/image-generation | **本环境不可达**(302 → Google 登录回路,见下) |
| Google Cloud Vertex AI 图像生成(替代来源) | vendorCapability | https://cloud.google.com/vertex-ai/generative-ai/docs/image/generate-images | 200 |

**不可达来源如实说明:** `ai.google.dev` 在本环境对任何路径(含 `/gemini-api/docs`)都返回
`302 → https://ai.google.dev/oauth2authorize?...&auto_signin=True`,最终需要 Google 账号登录,`curl` 无法取得正文。
因此**本文件不对 Gemini 页面的内容做任何断言**;需要该厂商能力时请在浏览器人工打开,或用上表的
Vertex AI 文档作为可达的一手替代(注意二者是不同产品线,不可互换结论)。

**项目自身的本地知识库(优先级高于上表通用文档):**
- `docs/ai/apiyi/` —— 全站不可变快照 + 已审查契约。入口:`docs/ai/apiyi/README.md`
- 上游 canonical/镜像 URL、抓取时间与 SHA-256:`docs/ai/apiyi/sources.json`
- 机器可读契约:`docs/ai/apiyi/model-contracts.json`(实现与测试只读这一份,不读原始网页)
- 修改模型/参数/提示词/参考图语义前必须走 `npm run docs:apiyi:kb:check` → `docs:apiyi:search` → `docs:apiyi:lookup`
- `docs/ai/gpt-image-2-lmu.md` 描述的是灵眸网关,**已被取代,不得用于 API易实现**

---

## 6. 已知版本风险(供其它 agent 判断)

以下为「仓库锁定版 ≠ 线上最新 major」的项。**升级前必须单独评估破坏性变更,不要按最新版文档写旧版代码**。
标注「有意精确固定」的项不是疏漏,升级它们等于改动门禁或回归基线(见第 4 节「版本声明策略」):

| 包 | 锁定 | 最新 | 风险 |
| --- | --- | --- | --- |
| vite | 6.4.3 | 8.3.0 | 跨两个 major |
| typescript | 5.9.3 | 7.0.2 | 跨一个 major(原生重写线) |
| express | 4.22.2 | 5.2.1 | 中间件与错误处理语义变化 |
| nanoid | 5.1.16 | 6.0.1 | 主版本跨代 |
| @playwright/test | 1.61.0 | 1.63.0 | **有意精确固定**(回归基线可复现);小版本,升级需重装浏览器并复跑 E2E |
| ast-grep | 0.39.5 | 0.45.3 | **有意精确固定**(本地门禁 = CI 版本);落后 6 个 minor 属**技术债** |

同 major 内的小幅落后(sharp、openai、@xyflow/react、shadcn、@base-ui/react、lucide-react、
zustand、dependency-cruiser、tailwind-merge、tsx、undici)按上表对应文档使用即可,无需特殊处理。

---

## 7. 复核方法(可自行重跑)

```bash
cd /Users/lionfan/dev/kittin-saas-b-v2

# 1) 真实锁定版本(比 package.json 的 ^ 范围更可靠)
node -e 'for (const p of ["vite","typescript","express","react","tailwindcss"]) console.log(p+"="+require("./node_modules/"+p+"/package.json").version)'

# 2) 上游最新版本(判断"锁定版 vs 线上文档"是否错位)
for p in vite typescript express nanoid; do
  printf "%s: " "$p"; curl -4 -s "https://registry.npmjs.org/$p/latest" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).version))'
done

# 3) 本文件所有链接的 HTTP 状态(-4 必须带上,否则本机 IPv6 可能出现假失败)
curl -4 -s -o /dev/null -w "%{http_code} %{url_effective}\n" -L --max-time 25 "<URL>"
```

链接可达性实测口径:`curl -4 -s -o /dev/null -w "%{http_code}" -L`;
返回 `000` 时先加 `-4` 重试(本机存在 IPv6 解析到 `198.18.x.x` 导致连接失败的假阴性);
`302` 且落到第三方登录页视为**该来源在本环境不可达**,须在文中标注,不得降级引用二手来源。

---

## 8. 项目自有权威文档(非上游,但与上表配合使用)

| 主题 | 文件 | 说明 |
| --- | --- | --- |
| 当前项目硬规则(唯一规则源) | `AGENTS.md` | 与上游文档冲突时,以它和用户最新指令为准 |
| 部署、常驻运行、环境变量、备份恢复、故障处理 | `docs/DEPLOYMENT_AND_OPERATIONS.md` | 运维一手文档 |
| 发布前检查清单 | `docs/RELEASE_CHECKLIST.md` | 与 CI 门禁配套 |
| GitHub Actions 门禁设计 | `docs/ci/2026-09-18-github-actions-gate.md` | 五个必需检查的定义 |
| AI 网关本地知识库 | `docs/ai/apiyi/README.md` | 修改模型/参数前必读(见第 5 节) |
| 依赖边界规则 | `.dependency-cruiser.cjs` | 循环依赖与分层边界 |
| 结构规则 | `sgconfig.yml` + `tools/ast-grep-rules/*.yml` | 动态求值、不安全 HTML 注入、前端 `process.env` 泄漏、检查压制 |
| 本地开发与脚本入口 | `README.md`、`package.json` 的 `scripts` | `npm run dev / test / check / build / gate:codex` |

---

## 9. 维护规则

1. 依赖升级或新增依赖的 PR,**同一个批次**内更新第 1–6 节对应行(版本号 + 文档链接 + 版本对应说明)。
2. 出现新的「锁定版 ≠ 线上最新 major」错位时,补进第 6 节。本文件只记录**当前状态**,不保留历史行(历史证据属于 `docs/` 下带日期的文档)。
3. 本文件不复制上游 API 细节(参数、限制、行为),只做**定位**:把 agent 送到正确版本的官方文档,再由它去读原文。
