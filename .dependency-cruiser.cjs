/**
 * Dependency-cruiser 规则集 — Garment Canvas 交付门禁的代码智能证据来源。
 *
 * 门禁范围（scope）:`src server scripts e2e`。这里只描述第一方模块图，
 * `node_modules/`、`dist/`、`dist-server/` 等第三方与生成产物不参与。
 *
 * 约定:
 * - `error` 必须是当前代码库真实为零违规的结构不变量；出现就是本批或后续批次引入的回归。
 * - 已知历史违规只允许用**逐路径**的显式豁免处理，并在 `comment` 里写清理由；
 *   不允许用大范围 `exclude` 把整目录排除来伪装干净。
 */
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ---------------------------------------------------------------- 循环依赖
    {
      // 历史基线豁免：仅命中 server 里那 3 个既存环。
      // 理由：server/config.ts（环境聚合）↔ server/lib/{database,databaseRuntime,
      // sqliteImport}（存储运行时）↔ server/lib/{evaluationCampaign,auth}（评估/鉴权）
      // 互相需要对方的常量与断言函数。拆环需要把 ROOT_DIR/env 装载、评估活动就绪断言、
      // 鉴权主体类型抽到独立模块，属于跨模块重构，会同时触及 §4 安全不变量（鉴权/会话）与
      // 评估发布门禁，不能和「门禁工具链改造」混在同一批里做。
      // 处置：本批显式降级为 warn 并记录在案；下一批做专门的重构批次后再删除此豁免。
      // 该豁免只覆盖「环上所有模块都在下面 viaOnly.path 里」的情况：
      // 任何一个新模块被卷进这些环，就会落进下面 error 级别的 no-circular。
      name: "no-circular-baseline",
      severity: "warn",
      comment:
        "既有基线：server 配置/存储/评估模块之间的 3 个环，需要专门的重构批次拆解",
      from: {},
      to: {
        circular: true,
        viaOnly: {
          path: "^server/(config\\.ts|lib/(database|databaseRuntime|sqliteImport|auth|evaluationCampaign)\\.ts)$",
        },
      },
    },
    {
      // 除上面的显式基线外，任何循环依赖（含新模块加入既存环）都是 error。
      name: "no-circular",
      severity: "error",
      comment:
        "循环依赖使模块无法独立测试与按序加载，且会掩盖真实的分层方向；只允许 no-circular-baseline 里逐路径列出的既存环",
      from: {},
      to: {
        circular: true,
        via: {
          pathNot:
            "^server/(config\\.ts|lib/(database|databaseRuntime|sqliteImport|auth|evaluationCampaign)\\.ts)$",
        },
      },
    },

    // ------------------------------------------------------------ 分层/架构边界
    {
      name: "src-must-not-import-server",
      severity: "error",
      comment:
        "前端（src/）不得依赖后端实现（server/）：共享契约只允许走 src/types 与 src/lib 中的纯模块，否则会把服务端实现拖进客户端 bundle",
      from: { path: "^src/" },
      to: { path: "^server/" },
    },
    {
      name: "server-must-not-import-frontend-ui",
      severity: "error",
      comment:
        "后端（server/）不得依赖前端 UI/状态层（src/components、src/store、src/hooks）或 React 运行时",
      from: { path: "^server/" },
      to: {
        path: "^(src/(components|store|hooks)/|node_modules/(react|react-dom|@xyflow|@base-ui)/)",
      },
    },
    {
      name: "tooling-must-not-import-frontend-ui",
      severity: "error",
      comment:
        "脚本与 e2e（scripts/、e2e/）不得依赖前端 UI/状态层；工具只能依赖 src/types 与 src/lib 里的纯模块",
      from: { path: "^(scripts|e2e)/" },
      to: { path: "^src/(components|store|hooks)/" },
    },
    {
      name: "app-must-not-import-dev-tooling",
      severity: "error",
      comment:
        "应用代码（src/）不得依赖测试/工具代码（e2e/、scripts/），否则测试脚手架会进入产品依赖图",
      from: { path: "^src/" },
      to: { path: "^(scripts|e2e)/" },
    },
    {
      name: "ui-primitives-are-presentation-only",
      severity: "error",
      comment:
        "src/components/ui/ 是本项目本地 shadcn 基元，只负责呈现/可访问性/受控组件行为（AGENTS.md §2）：不得依赖 src/store 业务状态、src/hooks 或服务端代码",
      from: { path: "^src/components/ui/" },
      to: { path: "^(src/(store|hooks)/|server/)" },
    },
    {
      name: "lib-must-not-import-ui",
      severity: "error",
      comment:
        "src/lib/ 是纯逻辑层，不得反向依赖组件层（src/components/），否则纯逻辑无法在无 DOM 环境下复用",
      from: { path: "^src/lib/" },
      to: { path: "^src/components/" },
    },
    {
      name: "types-layer-stays-pure",
      severity: "error",
      comment:
        "src/types/ 是共享类型契约层，只能依赖自身：不得依赖组件、状态、服务端、工具或测试代码",
      from: { path: "^src/types/" },
      to: { path: "^(src/(components|store|hooks)/|server/|scripts/|e2e/)" },
    },

    // ---------------------------------------------------------------- 孤儿模块
    {
      name: "no-orphans",
      severity: "error",
      comment:
        "没有任何模块引用、且不是宿主入口的模块即为孤儿：要么是死代码，要么是漏接线的新模块。入口清单逐条列在 pathNot 里并注明原因。",
      from: {
        orphan: true,
        pathNot: [
          "^e2e/", // Playwright 用例/夹具：由 playwright 配置直接驱动，天然无引用者
          "^scripts/", // CLI/门禁脚本：从 package.json 或命令行直接调用
          "^server/index\\.ts$", // 服务端进程入口
          "^src/main\\.tsx$", // 前端入口（由 index.html 引用）
          "\\.d\\.ts$", // 环境/宿主类型声明，编译期生效
          // 豁免：这是 tests/reference-inputs.test.ts 直接引用的门面模块。
          // depcruise 的域内不含 tests/，因此在模块图里看不到引用方。
          // 理由：测试面向门面（server façade）而不是深路径，属于刻意保留的公共入口。
          "^server/lib/referenceRolePrompt\\.ts$",
          // 豁免：本地 shadcn 基元工具箱（AGENTS.md §2 要求项目自持基元）。
          // 当前没有界面引用它，但它不是一个可安全删除的死代码块——UI 代码的增删
          // 需要先与用户确认（AGENTS.md §2），因此保留并在此显式登记。
          "^src/components/ui/sheet\\.tsx$",
        ],
      },
      to: {},
    },
  ],

  options: {
    // 第三方与构建产物不属于第一方分层契约。
    doNotFollow: { path: "(^|/)node_modules/" },
    exclude: { path: "(^|/)(node_modules|dist|dist-server|playwright-report|test-results)/" },
    // 使用 tsconfig 的 compilerOptions（含 @/* 与 @server/* 路径别名），
    // 否则相对路径之外的别名导入会变成 unresolved，规则会静默漏判。
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
      extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"],
    },
    combinedDependencies: false,
    reporterOptions: {
      dot: { collapsePattern: "^(node_modules|[^/]+/node_modules)/" },
    },
  },
};
