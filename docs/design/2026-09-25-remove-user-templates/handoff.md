# 取消「我的模板」功能 — 后端路由/契约变更记录

- 卡：`t_c40ec099`（用户 2026-09-25 决策）
- 批次：与前端「ProjectCenter 内置模板/我的模板 Tabs 移除」同批。

## 变更（server 侧）

1. 移除用户模板写入路径（`server/routes/templates.ts`）：
   - `POST /api/templates`
   - `DELETE /api/templates/:id`
   不再暴露；Express 对未匹配方法落到 `/api` 兜底返回 `404 API not found`。
2. 保留只读路由，`templatesRouter` 现在只读内置模板：
   - `GET /api/templates` → 15 个内置模板（结构仍为 `WorkflowTemplate[]`，`schemaVersion` 含 `flow`）。
   - `GET /api/templates/:id` → 单个内置模板。
3. 删除用户模板生命周期模块 `server/lib/userTemplateLifecycle.ts`
   （`reconcile/migrate/purge` + `prepareUserTemplateAccountMutation`），并移除全部调用点：
   - `server/index.ts` 启动时的 `migrateLegacyUserTemplateOwners` / `reconcileUserTemplateAccountMutations`。
   - `server/routes/auth.ts` 账号转移/删除路径中的用户模板 mutation 与 reconcile。
4. 同步测试 `tests/authorization.test.ts`：删除用户模板隔离、账号转移/15 天回收、journal 恢复三类用例
   及 legacy 无归属模板迁移 setup。

## 保留

- `data/templates/builtin/`（内置模板数据源）不动。
- `GET /api/templates` 返回结构契约不变（`WorkflowTemplate`，`schemaVersion` 含 `flow`），
  前端左侧工作流二级菜单与 e2e fixture 继续依赖。

## 遗留（前端域，本卡不处理）

- `src/types/workflow.ts` 中 `WorkflowTemplate.ownerId` 字段与「POST/DELETE /api/templates」注释已失
  效但未删除，归 frontend/architect 同批收尾。
- `scripts/three-node-migration-purge.mjs` 仍引用历史用户模板目录，属一次性历史脚本，未清理。
