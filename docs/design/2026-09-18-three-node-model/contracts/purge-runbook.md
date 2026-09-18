# 契约：清理 / 不兼容执行手册（R7）

- 来源：plan.md §4；需求挂靠 R7、§3.7
- 性质：P2-f 执行手册的契约层。**执行前必须 Q5 裁定**。

## 1. 范围矩阵

| 对象 | 存储位置 | 处置 | 备注 |
|---|---|---|---|
| 用户项目（全部） | `projects` 表 | 物理删除 | 含 `lifecycle='saved'` 与 `'initial_draft'` |
| 用户模板 | `data/templates/user/*.json` | 物理删除 | 目录保留 |
| 内置模板 | `data/templates/builtin/*.json` | 重写为 v7 | 不在删除范围；随 P2-d 交付 |
| 运行历史 | `generation_runs` / `generation_outputs` / `usage_events` | 【Q5-a】推荐删除 | 引用旧 kind/旧节点 ID，新 UI 无法呈现 |
| 生成文件 | `files` 中仅被已删对象引用的行 | 级联清理 | 走现有 purge 机制补扫 |
| 素材库 | `assets` / `project_asset_refs` | 【Q5-b】推荐保留 assets；`project_asset_refs` 随 projects 级联删 | assets 是用户显式保存的素材 |
| 评估证据 | `evaluation_*` 表、`docs/ai/evaluation/**` | 保留 | 审计资产 |
| 账号/会话 | `users` / `sessions` / `revoked_sessions` | 不动 | — |

## 2. 执行顺序（脚本契约）

`scripts/three-node-migration-purge.mjs`（P2-f 实现）：

1. **Preflight**
   - 连接目标库，断言 `database_name` 以配置预期值匹配（复用 test runner 的 127.0.0.1/命名防呆思想：脚本要求显式 `--env=production` 才允许指向非本地库）。
   - 统计各表行数，写入回执头部。
2. **导出兜底**（不可逆前的最后一次机会，§3.7）
   - `projects`：逐行导出 `{id, owner_id, name, flow_json, updated_at}` 至 `data/migration-export-<UTC 时间戳>/projects/<owner_id>/<project_id>.json`。
   - 用户模板：整目录复制至 `<导出目录>/templates-user/`。
   - 校验：导出文件数 == 表行数；任一失败则**中止且不执行删除**。
   - 【Q5-a 若裁定删除】同时导出 `generation_runs` 元数据（不含图片 blob）至 `runs.json`。
3. **二次确认**
   - 交互式输入 `DELETE-ALL-PROJECTS`，随后 `YES`；脚本打印将删除的逐表行数。
4. **删除**（单事务）
   - 顺序：`usage_events` → `generation_outputs` → `generation_runs` → `project_asset_refs` → `projects` → 提交。
   - 用户模板文件在事务提交后删除（文件系统无事务，放最后）。
5. **回执**
   - 打印逐表 before/after 行数 + 导出目录路径 + 导出校验哈希（逐文件 sha256 清单写 `manifest.sha256`）。
   - 回执存 `data/migration-export-<时间戳>/RECEIPT.txt`，并在部署记录中引用。

## 3. 不可逆提示（产品侧）

- schema v7 上线后，旧格式项目/模板在读取路径一律拒绝（见 contracts/data-model.md §2），拒绝文案即用户可见的不可逆提示。
- 清理脚本执行窗口前，应用内是否需要横幅通知（"将于 X 日清空旧项目"）属运营决策——**默认不做**（当前产品处于内部/早期阶段，用户已在需求层明确接受不可逆）；若 orchestrator 判定需要，归 P2-f 的 UI 小项。

## 4. 回滚

- 步骤 4 提交前任何失败：事务回滚，零副作用，导出目录保留供排查。
- 步骤 4 提交后：**不可回滚**（R7 已明确）。导出目录是唯一兜底，仅作证据与人工补救素材，不提供自动恢复工具。
