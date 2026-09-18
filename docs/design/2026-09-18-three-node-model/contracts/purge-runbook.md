# 契约：清理 / 不兼容执行手册（R7）

- 来源：plan.md §4；需求挂靠 R7、§3.7
- 性质：P2-f 执行手册的契约层。范围已按 Q5=A 裁定定稿。
- v3.1（缺口修复 + 用户裁定 D1/D2）：`usage_events` 明确为**删行不删表**（D1「有账无闸」裁定）；导出步骤扩展为含生成媒体文件复制 + 文件数/字节数双重校验 + 总体积回执（D2）。

## 1. 范围矩阵（Q5=A 已裁定；usage_events 处置按 D1 裁定修订）

| 对象 | 存储位置 | 处置 | 备注 |
|---|---|---|---|
| 用户项目（全部） | `projects` 表 | 物理删除 | 含 `lifecycle='saved'` 与 `'initial_draft'` |
| 用户模板 | `data/templates/user/*.json` | 物理删除 | 目录保留 |
| 内置模板 | `data/templates/builtin/*.json` | 重写为 v7 | 不在删除范围；随 P2-d 交付 |
| 运行历史 | `generation_runs` / `generation_outputs` | **物理删除全部行**（Q5=A） | 引用旧 kind/旧节点 ID，新 UI 无法呈现 |
| 用量账 | `usage_events` | **删除全部存量行，表结构保留**（D1 裁定修订） | 「有账无闸」是有意选择：不加任何 per-user 配额/预算上限，但用量账必须连续。新 kind 的计量行（text token、video billed 证据、image 沿用）从清理后开始继续写入同一张表，用量统计口径 = 自清理时点起重计。扩展点：将来若要加配额闸，在 `promptRunAdmission` 准入处加配额检查位（plan.md §4.4），不翻改本表 |
| 生成文件 | `files` 中仅被已删对象引用的行 | 级联清理（DB 行 + 磁盘文件） | 走现有 purge 机制补扫；磁盘文件随 DB 行删除一并清理（`<dataDir>/uploads/` 与 `<dataDir>/thumbnails/` 对应文件） |
| 素材库 | `assets` | **保留**（Q5=A） | 用户显式保存的素材；含义 = 素材库存活、生成产物不存活（生成产物随上行 files 级联清理） |
| 素材引用 | `project_asset_refs` | 随 projects 级联删除 | 引用关系随主体 |
| 评估证据 | `evaluation_*` 表、`docs/ai/evaluation/**` | 保留 | 审计资产 |
| 账号/会话 | `users` / `sessions` / `revoked_sessions` | 不动 | — |

## 2. 执行顺序（脚本契约）

`scripts/three-node-migration-purge.mjs`（P2-f 实现）：

1. **Preflight**
   - 连接目标库，断言 `database_name` 以配置预期值匹配（复用 test runner 的 127.0.0.1/命名防呆思想：脚本要求显式 `--env=production` 才允许指向非本地库）。
   - 统计各表行数，写入回执头部。
   - **媒体导出预估**（D2）：统计将被级联删除的 `files` 行数与其 `byte_length` 总量，打印预估导出体积（「将导出 N 个媒体文件，约 X MB」），供操作者确认磁盘空间。
2. **导出兜底**（不可逆前的最后一次机会，§3.7；D2 裁定：连媒体一起导）
   - `projects`：逐行导出 `{id, owner_id, name, flow_json, updated_at}` 至 `data/migration-export-<UTC 时间戳>/projects/<owner_id>/<project_id>.json`。
   - 用户模板：整目录复制至 `<导出目录>/templates-user/`。
   - **生成媒体**（D2 新增）：所有将随清理删除的 `files` 行对应的磁盘文件（图片与视频，源位置 `<dataDir>/uploads/<file_id>.<ext>` 及对应缩略图），复制至 `<导出目录>/files/<file_id>.<ext>`（按 files 表 id 平铺——同一文件可能被多个 project 引用，按 owner/project 分目录会产生重复副本，平铺 + 清单中的引用关系表已足够追溯）。
   - 同时导出 `generation_runs` 元数据（不含图片 blob）至 `runs.json`（Q5=A 已确认删除，导出仅作证据）。
   - **完整性校验（双重）**：① DB 侧：导出 JSON 文件数 == 对应表行数；② 媒体侧：复制文件数 == 待删 files 行数 **且** 复制总字节数 == 待删 files 行 `byte_length` 合计。任一校验失败则**中止且不执行删除**。
3. **二次确认**
   - 交互式输入 `DELETE-ALL-PROJECTS`，随后 `YES`；脚本打印将删除的逐表行数。
4. **删除**（单事务）
   - 顺序：`usage_events`（删行不删表，D1）→ `generation_outputs` → `generation_runs` → `project_asset_refs` → `projects` → 提交。
   - 用户模板文件与级联 `files` 磁盘文件在事务提交后删除（文件系统无事务，放最后）。
5. **回执**
   - 打印逐表 before/after 行数（`usage_events` 行注明「表结构保留」）+ 导出目录路径 + 导出校验哈希（逐文件 sha256 清单写 `manifest.sha256`，含媒体文件）。
   - **媒体导出总量**（D2）：回执中报告导出媒体文件数与总体积（字节数与人类可读两种格式）。
   - 回执存 `data/migration-export-<时间戳>/RECEIPT.txt`，并在部署记录中引用。

## 3. 不可逆提示（产品侧）

- schema v7 上线后，旧格式项目/模板在读取路径一律拒绝（见 contracts/data-model.md §2），拒绝文案即用户可见的不可逆提示。
- 清理脚本执行窗口前，应用内是否需要横幅通知（"将于 X 日清空旧项目"）属运营决策——**默认不做**（当前产品处于内部/早期阶段，用户已在需求层明确接受不可逆）；若 orchestrator 判定需要，归 P2-f 的 UI 小项。

## 4. 回滚

- 步骤 4 提交前任何失败：事务回滚，零副作用，导出目录保留供排查。
- 步骤 4 提交后：**不可回滚**（R7 已明确）。导出目录是唯一兜底，仅作证据与人工补救素材，不提供自动恢复工具。
