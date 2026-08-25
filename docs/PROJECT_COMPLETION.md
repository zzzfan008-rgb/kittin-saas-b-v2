# Garment Canvas 项目完成度台账

本文件记录从基线 `main@105fa861d5de7493a6d0d330e81c0a121eac4fb1` 到正式交付候选版本的实施、验证与审查证据。只有 A–G 全部验收并经用户确认合并最终 PR 后，项目才视为完成。

## 范围与约束

- 产品仅支持桌面端：最低 1024 CSS px，主要验收宽度为 1280 与 1440。
- 不建设移动端、触控专用布局、视频/音频生成或通用 AI 聊天伙伴。
- 不发送真实 AI 请求；自动化使用 dummy key、不可达 AI 地址或显式 stub。
- 保留登录、单设备会话、项目页签、生成队列、SSE 恢复、防重复计费、未知结果保护、跨项目 Results、查看、对比、素材、模板与三主题。
- 每个阶段使用 `codex/` 分支和独立 PR。可自动推送、创建 PR、运行 CI 与请求 Codex Cloud Review；合并、打 tag、发布和部署必须等待用户确认。
- GitHub 操作仅使用项目本地 `.env` 中的 `GITHUB_PAT`；不得提交或输出密钥。

## 当前基线

| 项目 | 状态 | 证据 |
| --- | --- | --- |
| 上一阶段 PR | 已合并 | [PR #2](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/pull/2) |
| 基线提交 | 已确认 | `d50aa6dc46fcdea23368c4c547683a582b9ca49a` |
| 基线 main CI | 通过 | [GitHub Actions 32802751095](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/actions/runs/32802751095) |
| 当前工作分支 | 进行中 | `codex/document-persistence-boundary` |
| GitNexus | 已重建 | 当前索引对应 `6e4feaf`：15,095 symbols、32,713 edges、226 clusters、300 flows；索引未写入仓库 |

## 阶段进度

状态约定：`未开始`、`进行中`、`待审查`、`待用户确认`、`已完成`、`阻塞`。

| 阶段 | 状态 | 交付范围 | PR | CI | Cloud Review |
| --- | --- | --- | --- | --- | --- |
| A 状态正确性与撤销事务 | 已完成 | 文档事务、运行态隔离、拖拽单步撤销、canonical selection、失效结果引用清理 | [PR #2](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/pull/2) | [实现终态](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/actions/runs/32755048012)与[合并后 main](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/actions/runs/32802751095)通过 | [最终精确头审查](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/pull/2#issuecomment-5398788404)无重大问题 |
| B 文档与持久化边界 | 进行中 | `DocumentSnapshot`、活动文档单一数据源、草稿隔离、持久化节流 | [PR #3](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/pull/3) | [B3 checkpoint CI 32811518375](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/actions/runs/32811518375) 通过 | B1、B2、B3 各三次独立本地审计 APPROVE；[B3 精确头 Cloud Review](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/pull/3#issuecomment-5405637505) 无重大问题 |
| C 首次生成黄金路径 | 未开始 | pristine 启动器、模板 fit/聚焦、点击添加/快捷建图、隔离生成 E2E | — | — | — |
| D 结果迭代与桌面体验 | 未开始 | 显式结果动作、三主题 × 三宽度、键盘与焦点、人工浏览器验收 | — | — | — |
| E 生产产物与 CI | 未开始 | production Playwright smoke、CI 顺序、runner 信号清理 | — | — | — |
| F 性能与包体 | 未开始 | lazy boundary、稳定拆包、初始 gzip 预算、CI 体积门禁 | — | — | — |
| G 文档与发布准备 | 未开始 | 部署/恢复/安全文档、发布候选 PR、最终审计与用户确认 | — | — | — |

## 验收清单

### A. 状态正确性与撤销事务

- [x] queued/running/retry/cancel 等运行态不进入撤销历史。
- [x] 一次节点拖拽只产生一条撤销记录，且一次撤销回到拖拽前位置。
- [x] 无实际文档变化的 undo/redo 不修改 revision、dirty 或 saveState。
- [x] 成功生成输出作为一次原子文档提交。
- [x] 建立并统一使用 `commitDocumentMutation`、`runWithoutHistory`、`beginHistoryTransaction` / `endHistoryTransaction`。
- [x] React Flow 使用 drag start/stop 作为事务边界；blur、pointercancel 与卸载也会幂等收口。
- [x] `selectedNodeIds` 为 canonical，`primarySelectedNodeId` 为派生值；点击、框选、新增、删除、复制、切页和空白取消一致。
- [x] DOM focus 不进入文档、撤销栈或项目持久化。
- [x] recentResults 裁剪、删除和同步后原子清理失效的 selectedResultId / compareIds。
- [x] Inspector、复制、删除与 Result 对比作用于同一选择对象。

Phase A 本地行为证据：`flow-history` 19/19、`selection-consistency` 11/11、`project-tabs` 35/35、`project-tabs-session` 12/12、`recent-results` 20/20；Playwright 在 1024 / 1280 / 1440 三个桌面项目共 11/11 通过。用户确认后 PR #2 已合并为 `d50aa6dc46fcdea23368c4c547683a582b9ca49a`，合并后 main CI 全部通过。

### B. 文档与持久化边界

- [x] 定义纯 `DocumentSnapshot`，仅含可保存项目内容。
- [x] selection、viewer、compare、运行状态、测量尺寸和临时 UI 不进入文档。
- [x] tabs 中活动文档成为唯一数据源；移除依赖订阅顺序的双向复制同步。
- [x] 保留兼容 selector，分步迁移消费者。
- [ ] session 持久化按文档 revision / 页签拓扑触发，并 debounce 或 idle flush。
- [ ] 草稿按页签隔离；单页签配额失败不删除其他草稿。
- [ ] 连续输入形成合理撤销粒度，不逐键序列化完整 tabs。
- [ ] 刷新、切页、后台任务、坏页签、配额失败、撤销重做和跨账号清理均有测试。

Phase B1 本地证据：项目保存、模板保存、运行计划与 v1 浏览器草稿统一走同一纯文档 serializer；9 种节点的运行态、错误、选择、测量、React Flow 外壳与未知字段均被剥离，wire 仅补 `status: idle`。服务端严格 canonicalization、v0/v1 模板读取、历史不兼容 v2 内置模板修复与全新目录六份模板均有回归。`document-snapshot`、`workflow-schema` 22/22、`project-tabs-session`、`project-tabs` 35/35、`npm run check` 与生产构建通过；三名独立审计最终均为 APPROVE。

Phase B2 本地证据：建立完整活动文档 selector 边界，并将画布、顶栏、属性/结果面板、节点、模板、复制粘贴与命令式 `getState()` 路径全部迁移。TypeScript TypeChecker 架构门禁扫描 57 个 `flowStore` 外的消费者源文件，拒绝绕过 selector 直读 14 个临时镜像字段，并以故意违规的参数解构/重命名负向探针防止门禁空跑。印花素材异步保存修复了请求期间切页后误回写新页签的竞态，回归验证始终定向发起命令的原页签。`npm run check` 含完整隔离 PostgreSQL 套件通过；GitNexus 因涉及 48 个已变更符号、41 个受影响符号与多条画布/页签流程评为 critical，已用页签、选择、历史、会话与全套回归覆盖，三次独立审计最终均为 APPROVE。

Phase B3 本地证据：`ProjectTab[]` 成为活动与后台文档的唯一真相，`FlowState` 已删除 14 个顶层镜像字段、镜像 helper 和同步 subscriber；selector 直接返回 `tabs` 内原始对象引用。文档、选择、结果引用、保存元数据、SSE 回写、会话草稿与页签切换都以单次 `tabs` 替换原子发布。zundo 仅作为每页签历史栈记录器，公开与应用内 undo/redo 统一由 canonical 页签回放适配器执行，不会生成顶层幽灵字段，并保留服务端运行态、选择与 React Flow 测量瞬态。所有保存、运行、上传、素材选择、蒙版和印花素材异步回写在发起时捕获不可变 `DocumentTarget(tabId, projectId, documentEpoch)`，因此同一页签整体换项目后，旧响应也不能污染新文档。`npm run check`、`npm run build`、`git diff --check` 通过；历史 21/21、页签 37/37、选择 11/11、会话 13/13、结果 20/20、活动文档边界 5/5，共 107 项高风险定向回归通过。GitNexus 最终识别 131 个变更符号、110 个受影响符号与 12 个索引文件，风险为 critical；范围与本次横切单一数据源及异步身份迁移一致。三轮独立终审均为 APPROVE，无 P0–P3。

### C. 首次生成黄金路径

- [ ] pristine 项目展示任务化启动器，至少含“上传图片开始”和“文本生成开始”。
- [ ] 任务选择创建独立页签或明确替换；不静默覆盖现有画布。
- [ ] 模板落地后自动 fitView，并聚焦首个缺失输入/参数节点。
- [ ] Dock 开合保持 viewport，不触发自动 fit/recenter。
- [ ] 节点库支持拖拽与点击添加。
- [ ] 上下游快捷建图复用连接校验、只读门禁和撤销事务。
- [ ] 隔离黄金路径 E2E：模板 → 输入 → stub 生成 → 运行状态 → 成功结果 → 查看/对比/继续处理。
- [ ] Results 的跨项目恢复、失败、未知结果、查看和对比能力无降级。

### D. 结果迭代与桌面体验

- [ ] 结果卡显式提供查看、对比、下载、继续处理/设为输入。
- [ ] 项目、节点、状态、失败原因和未知结果清晰可辨。
- [ ] current / white / eye × 1024 / 1280 / 1440 视觉回归有保存证据。
- [ ] Tab、Escape、焦点恢复、Dialog/Popover focus trap、React Flow 快捷键隔离、Dock inert 通过。
- [ ] 使用内置浏览器完成登录后的人工视觉验收。

### E. 生产产物与 CI

- [ ] production Playwright 先构建 `dist` / `dist-server`，再以隔离 PG、DATA_DIR 和 dummy AI 启动。
- [ ] 浏览器真实加载哈希 JS/CSS，覆盖登录、工作台、模板、静态路由与 SPA fallback。
- [ ] CI 将生产构建和 production smoke 设为必过门禁。
- [ ] E2E runner 在 SIGINT/SIGTERM 下回收 Compose、临时目录和测试锁。
- [ ] 测试与正式 DB、AI 和真实密钥完全隔离。

### F. 性能与包体

- [ ] 记录约 721 kB minified / 230 kB gzip 基线与模块/请求构成。
- [ ] 非首屏 overlay 优先 lazy-load；React、Base UI、XYFlow/D3 与业务模块合理拆分。
- [ ] 无单 chunk 超过 500 kB 的 Vite 警告。
- [ ] 初始必须请求 JS gzip 总量不高于 210 kB。
- [ ] 懒加载无 chunk 404、明显闪烁、状态丢失或 Canvas/Dock/Results 重挂。
- [ ] CI 包体预算门记录前后数据与取舍。

### G. 文档与发布准备

- [ ] README、环境变量、管理员安装、macOS 部署、备份恢复、迁移、故障、安全和桌面矩阵更新。
- [ ] 首次安装、登录、改密、项目恢复、任务恢复和失败处理流程明确。
- [ ] `dist` / `dist-server` 不受版本控制；Docker/macOS/CI 现场构建。
- [ ] `npm audit` 无未处置高危漏洞。
- [ ] 发布候选 PR 附摘要、风险/回滚、测试矩阵、视觉证据、包体、GitNexus、CI 与 Cloud Review。
- [ ] 用户明确确认最终合并后，main 合并后 CI 再次成功。

## 每阶段门禁与证据

每个阶段至少记录以下结果；不适用项必须说明原因，不能留空后宣称完成。

| 门禁 | 最新结果 | 证据/备注 |
| --- | --- | --- |
| `npm ci` | 通过 | 2026-08-24；依赖安装完成，未使用真实 AI 配置 |
| `npm run check` | 通过 | 2026-08-25；Phase B3 的 lint、Vite/CSS 构建门禁与隔离 PostgreSQL 全套回归均通过；仅使用 dummy/stub AI |
| `npm run test:e2e` | 通过 | 11/11；1024、1280、1440 桌面项目，临时 PostgreSQL + dummy AI |
| production browser smoke | 待实现 | Phase E |
| `npm run build` | 通过 | 2026-08-25；Phase B3 Web + server；主 JS 734.01 kB / gzip 234.37 kB，server 295.3 kB；既有 >500 kB 警告留待 Phase F |
| `npm audit` | 通过 | `found 0 vulnerabilities` |
| `git diff --check` | 通过 | 未发现空白错误；`dist` / `dist-server` 仍为忽略产物 |
| GitNexus `detect_changes` | 已执行 | 2026-08-25 Phase B3 最终差异为 critical：131 changed / 110 affected / 12 indexed files。范围为 canonical tabs、文档 mutation/history、页签生命周期、异步 DocumentTarget、SSE/结果引用与 session 序列化；完整 `npm run check` 及六类共 107 项高风险定向回归覆盖 |
| GitHub CI | Phase B B3 checkpoint 通过 | [Actions 32811518375](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/actions/runs/32811518375) 对应 `e3672fc`，检查、11 项桌面浏览器回归与生产构建全部成功；Phase A [合并后 main 32802751095](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/actions/runs/32802751095) 已成功 |
| Codex Cloud Review | Phase B B3 checkpoint 通过 | [精确头审查 5405637505](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/pull/3#issuecomment-5405637505) 对应 `e3672fc720`，未发现重大问题；Phase A [最终审查 5398788404](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/pull/2#issuecomment-5398788404) 同样通过 |
| 视觉证据 | 待采集 | Phase D：3 主题 × 3 宽度 |

## 已知风险与决策日志

| 日期 | 项目 | 结论/后续动作 |
| --- | --- | --- |
| 2026-08-24 | Store 双数据源与隐式同步 | Phase A 先以行为测试锁住撤销/选择不变量；Phase B 再迁移到 `DocumentSnapshot` 单一数据源，避免一次性大爆炸重写。 |
| 2026-08-24 | 运行态污染文档历史 | 先审计 zundo partialize、SSE/runtime 写回和成功输出边界，再建立显式 history API。 |
| 2026-08-24 | 浏览器自动化只覆盖开发服务器 | Phase E 增加真实 production bundle smoke，作为后续拆包保护门。 |
| 2026-08-24 | 主包约 721 kB / 230 kB gzip | Phase F 先测量，再 lazy-load 与拆包；禁止仅提高警告阈值。 |
| 2026-08-24 | shadcn/Base UI 使用边界 | 用户确认可结合仓库使用；优先复用现有 UI primitives 承担通用弹层、Tabs、Tooltip 与焦点管理，继续由 `data-theme` / `--gc-*` 和业务 Store 掌管主题与状态。 |
| 2026-08-24 | Phase A 每页签撤销历史 | zundo 继续挂载活动文档，非活动页签使用进程内 past/future 栈换入换出；历史不跨刷新持久化，项目文档与会话恢复仍由 Phase B 收敛。 |
| 2026-08-24 | 中断拖拽瞬态 | blur、pointercancel、卸载均提交最后可见位置并清除 `dragging`；历史 Undo→Redo 与会话恢复都不得重新引入永久拖拽态。 |
| 2026-08-24 | 大型节点拖拽性能 | Cloud 首轮 P2 指出每帧序列化完整 mask payload；改为字段级相等性与共享值短路，并以 `toJSON` 探针保证位置检测不触发大型 data 序列化。 |
| 2026-08-24 | 拖拽会话原子性 | Cloud 第二轮 P2 指出中间坐标可能以 clean/saved 元数据落 session；事务中改为 deferred persistence，在 end/cancel 所有稳定出口补写，并覆盖无位移、净零位移、并发 success、失败重试与切页取消。 |
| 2026-08-24 | 空白画布上下文 | Cloud 第二轮 P2 指出关闭 Result viewer 后上下文粘住；空白 pane 统一调用 canonical selection command，清节点与结果选择但保留独立 compareIds，且不写文档历史。 |
| 2026-08-25 | 拖拽期间显式保存 | Cloud 第三轮 P2 指出 Ctrl/Cmd+S 可能写入中间坐标；保存、首次付费运行与撤销/重做统一等待真实 dragStop/cancel 后按 FIFO 执行，保存固定到发起页签，切页/关闭时安全取消。 |
| 2026-08-25 | 保存重试与手势身份 | 显式保存重试使用独立 generation，不与 revision 自动补写混用；同快照成功不多发第三请求。拖拽以原生事件 `timeStamp` 隔离旧 stop 与新手势，取消后的迟到位置帧不会污染新页签或拆散历史。 |
| 2026-08-25 | 纯文档持久化边界 | 项目、模板、运行计划与浏览器草稿统一使用严格白名单 `DocumentSnapshot`；运行态在 wire 层固定为 idle。合法 v0/v1 内置模板保留，已知损坏或不兼容的历史 builtin 由当前定义受控修复，用户模板不受影响。 |
| 2026-08-25 | 活动文档消费边界 | B2 先以叶子 selector 收口 React 订阅，命令式复合读取使用 `selectActiveDocument` / `selectDocumentForTab`。组件不直接订阅会构造新对象的复合 selector；B3 仅替换 selector 内部数据源即可移除镜像字段。 |
| 2026-08-25 | 异步素材回写 | 印花素材保存在发起请求前固定 `tabId`，成功后使用 `updateNodeDataInTab` 回写原页签；请求期间切页的回归已覆盖。 |
| 2026-08-25 | canonical tabs 与 zundo 回放 | 顶层活动文档镜像与同步 subscriber 已删除。zundo 继续保管每页签 past/future，但不再将 partial snapshot 直接合并到根 Store；所有回放原子替换活动 `ProjectTab`，并保留 runtime、selection、edge selection 与 React Flow 测量瞬态。 |
| 2026-08-25 | 同页签整体换项目的异步身份 | 仅固定 `tabId` 仍可能让旧保存、运行或上传响应写入同一容器中的新项目；异步边界统一改为捕获并校验 `tabId + projectId + documentEpoch`，保存队列和运行准备键也使用完整身份。 |
| 2026-08-25 | 切页取消拖拽回滚 | 取消事务回到起点时显式不保留 `dragging`，并直接断言后台 canonical 页签内存状态，避免依赖 session sanitize 掩盖永久拖拽态。 |

## 更新规则

1. 实现或验证完成后，在同一提交中更新本台账。
2. PR、CI、Cloud Review 和截图必须填写可追溯 URL、提交 SHA 或文件路径。
3. 失败门禁保留失败原因与修复提交，不覆盖历史事实。
4. 未经用户确认，不把阶段 PR 或最终发布候选 PR 合并到 `main`。
