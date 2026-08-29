# Garment Canvas 发布候选清单

只有本清单完成、发布候选 PR 经用户明确确认合并、且合并后 `main` CI 成功，项目才进入可发布状态。打 tag、部署和生产数据操作仍需单独授权。

## 1. 精确版本与范围

- [x] 工作分支以最新 `origin/main` 精确 SHA 为 base，工作树无无关改动。
- [x] PR head SHA、base SHA、分支名和提交范围已复核。
- [x] `.env`、密钥、数据库 dump、上传文件、`data/`、`dist/`、`dist-server/` 均未进入候选差异。
- [x] PR 摘要明确列出功能范围、不做的范围、已知风险和回滚方案。

## 2. 本地门禁

```bash
npm ci
npm audit
npm run check
npm run test:e2e
npm run build
npm run test:e2e:production
git diff --check
```

- [x] 所有测试使用隔离 PostgreSQL、临时 `DATA_DIR` 与 dummy/stub AI。
- [x] 包体预算通过：初始静态 JS gzip 148048 / 210000 bytes，任一 JS chunk ≤ 500000 bytes。
- [x] production smoke 3/3，真实加载哈希 JS/CSS 和动态 chunk，无 script 4xx/5xx。

## 3. 架构与审查

- [x] GitNexus 索引与候选 head 对齐，并使用 PDG 构建。
- [x] `detect_changes` 已记录：提交候选相对 `origin/main` 有 41 个已索引变更符号、7 个已索引文件、0 条受影响流程，风险 low；新增截图不进入执行图。
- [x] 本机 Ollama `gemma4:e4b` 对精确 base→head 分组复审，无有效 P0–P3 阻断项。
- [x] 不触发或等待 Codex Cloud；本机模型复审绑定精确 PR head SHA。

## 4. 桌面与恢复验收

- [x] `current / white / eye` × 1024 / 1280 / 1440 共 9 组视觉证据已保存。
- [x] 项目、节点、成功、失败、结果未知和失败原因清晰可辨。
- [x] Results 的跨项目恢复、查看、对比、下载和继续处理无降级。
- [x] Tab、Escape、焦点恢复、Dialog/菜单焦点边界、React Flow 快捷键隔离和 1024 Dock 互斥通过。
- [x] 首次安装、管理员登录/改密、项目保存/恢复、活动任务恢复和失败处理已由隔离测试与恢复场景覆盖。
- [x] PostgreSQL + `DATA_DIR` 同一恢复点的备份/恢复流程已在隔离环境验证。

本地门禁记录（2026-08-30）：`npm ci`、`npm audit`（0 漏洞）、`npm run check`、桌面 E2E 26/26、`npm run build`、production smoke 3/3 与 `git diff --check` 通过。首轮桌面 E2E 捕获 1 个 Tab 切换后的测试同步窗口；只增加可见性等待后全量重跑通过，产品 UI 未改动。恢复演练的一次性容器与临时目录均已清理。

本机 `gemma4:e4b` 先对暂存候选完成预提交复审，再对精确 `3dc6a1dc8b54b4ee2596f5f484471328380edafc...fbdff19193bff4dbdbc8b33dc416bcea1aa451d4` 完成最终复审并返回 `APPROVE`；[精确 SHA 复审记录](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/pull/17#issuecomment-5464184334)无有效 P0–P3。

## 5. PR、合并与发布

- [x] 发布候选 PR 附测试矩阵、视觉证据、包体、GitNexus、精确 SHA 复审、风险和回滚说明。
- [x] PR head CI 成功，审查评论和线程全部处置。
- [x] 用户明确授权后才合并；“通过”只授权当前约定的推送与复审，不代替最终合并授权。
- [x] 合并后单独记录 `MERGED` 状态、main merge SHA 和新的 main CI；CI 未结束时不得宣称发布门禁完成。
- [ ] tag、GitHub Release、生产部署、数据库恢复或密钥轮换均取得单独授权。

Phase G 发布候选记录：PR [#17](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/pull/17) 的 base 为 `3dc6a1dc8b54b4ee2596f5f484471328380edafc`，head 为 `fbdff19193bff4dbdbc8b33dc416bcea1aa451d4`；[PR head CI 33268687680](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/actions/runs/33268687680)通过。用户明确授权后，PR 合并为 `c23f4174865dda827f969219e035f55c3038a2e8`，[main CI 33269171028](https://github.com/zzzfan008-rgb/kittin-saas-b-v2/actions/runs/33269171028)再次成功。CodeRabbit 因免费额度限制未产出代码审查，不计作复审证据；有效复审证据为本机 Gemma、GitNexus 与 CI。

## 6. 回滚信息

Phase G 代码候选已经填写：

- 上一稳定 main SHA：`3dc6a1dc8b54b4ee2596f5f484471328380edafc`；候选 head SHA：`fbdff19193bff4dbdbc8b33dc416bcea1aa451d4`；合并后 main SHA：`c23f4174865dda827f969219e035f55c3038a2e8`。
- 代码回滚：将部署检出回上一稳定 main SHA 后重新执行 `docker compose up -d --build --wait`；预计停机时间为部署机器的一次构建与重启窗口，正式数值须在选定生产环境演练后记录。
- 本候选不包含数据库迁移、数据写入或产品运行时代码改动；代码回滚不需要数据库回滚。
- 隔离 PostgreSQL 18 dump/restore 与临时 `DATA_DIR` tar/restore 已通过并清理。真实生产备份位置、SHA-256 校验和与异地副本必须在正式部署前填写，当前未执行生产数据操作。
- 回滚后必须验证 `/api/ready`、登录、项目、Results、文件下载和活动任务；这些生产现场检查将在选定部署目标后记录。
