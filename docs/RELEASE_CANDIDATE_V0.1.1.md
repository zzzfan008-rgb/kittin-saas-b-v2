# Garment Canvas v0.1.1 发布候选

状态：本地候选准备中。本文只冻结版本范围和本地证据，不代表 tag、GitHub Release、合并或生产部署已经获得授权或完成。

## 候选范围

- 版本：`0.1.1`
- 基线：`origin/main@b9b051f72fb9e0ce5514f8b646e9e3068ff9359c`
- 工作分支：`codex/p0-provider-download-and-p2-presets`
- 候选 head：提交后由本地 Codex 门禁和后续 PR 精确绑定；本文件不预写未来 SHA。

### P0：Provider 结果下载兼容性

- 修复 Node.js 22 自动地址族选择启用 `lookup({ all: true })` 时，固定 DNS 连接器仍返回旧单地址回调格式的问题。
- 保留原有 SSRF 防护：每一跳先校验全部 DNS 结果，再固定连接到已校验的 global IP，并继续使用原 hostname 作为 Host/SNI。
- 新增单地址与 `all` 地址两种 Node lookup 回调契约测试。
- 本候选没有发送真实或付费 AI 请求。历史 GPT Image 2 VIP `outcome_unknown` 不自动重试；Grok 503 仍按既有持久队列策略处理。

### P2：服装提示词预设

- 在节点属性面板加入可折叠的服装提示词预设，不替换现有 Provider、队列、结果或工作流模板体系。
- 首批人工筛选三个方向：写实穿搭、电商主图、服装设定表。
- 每个预设保留用户当前设计意图，补齐构图、材质、文字、画幅、参考图角色和负面约束，并同步相应画幅比例。
- 模板来源和示例 case 在界面可见；重复切换预设不会把旧模板嵌套进新提示词。

### 节点提示词与 API易参数复核

- 使用 awesome-gpt-image-2 的分类、模板指导和六段式约束重新核对 25 个逐模型完整提示词；生产运行不存在跨模型提示词回退。
- 使用 API易本地契约和实际 Provider 请求构造器重新核对五个现役模型的端点、内容类型、参考图编码、顺序、尺寸、输出解析、超时及禁止字段。
- 物化 `docs/ai/evaluation/node-prompt-parameter-matrix-v1.json`，固定覆盖 35 个节点×模型组合：9 个为产品允许但仍未验证，26 个为明确不支持。
- Seedream 参数档案显式绑定 `response_format=b64_json`、`watermark=false`、`sequential_image_generation=disabled`，并禁止 `n` 与 `aspect_ratio`。
- 本轮复核没有调用 `/v1/images/generations` 或 `/v1/images/edits`；五模型目录基线只证明已配置令牌在 2026-09-03 的 `/v1/models` 视图精确包含五个 ID。

## 本地证据

- [x] Node.js `22.20.0` 下 `npm run check` 通过。
- [x] 类型检查、生产 Web 构建和全量隔离 PostgreSQL 测试通过。
- [x] 初始 JS gzip `163715 / 210000` bytes，13 个 JS chunk，单 chunk 未超过 500000 bytes。
- [x] 聚焦 Provider、DNS lookup 和提示词预设行为测试通过。
- [x] 节点×模型提示词、参数和 API易接口矩阵可从生产契约精确重算；35 个组合的 9/26 状态计数通过测试。
- [x] GitNexus `detect_changes` 已执行：整个候选分支横跨 87 个文件以及文档事务、运行准入、队列和 Provider 路径，累计风险为 critical；本轮节点矩阵使用定向契约测试与离线门禁覆盖。
- [x] 桌面 Playwright E2E：`33/33` 通过。
- [x] production Playwright smoke：`3/3` 通过。
- [ ] 候选提交后的精确 SHA 本地 Codex 默认模型门禁。
- [ ] 已登录本地浏览器人工验收；需要在输入本机管理员密码时取得当次确认。

## 发布与回滚边界

- 代码回滚：以反向提交撤回本候选；没有数据库迁移，不需要数据库回滚。
- Provider 下载修复若需撤回，只回退固定 DNS lookup 的 Node 22 回调适配；SSRF 校验逻辑不得绕过。
- 提示词预设若需撤回，只移除属性面板入口和预设数据；现有项目文档中的普通 prompt 字符串仍保持兼容。
- tag、GitHub Release、合并、生产部署、真实 Provider 验收和生产数据操作均需各自单独确认。
