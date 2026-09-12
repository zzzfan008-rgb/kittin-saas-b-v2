# Garment Canvas 部署与运维手册

本文是生产安装、macOS 运行、管理员初始化、备份恢复、数据库迁移、故障处理和安全加固的权威操作手册。产品仅支持桌面浏览器：最低 1024 CSS px，主要验收宽度为 1280 与 1440。

## 1. 发布边界

- 生产数据由 PostgreSQL 18 与 `DATA_DIR` 共同组成，二者必须在同一个恢复点备份。
- `dist/`、`dist-server/`、`.env` 和 `data/` 都不是版本库内容；部署现场构建或使用 Docker 多阶段构建。
- 自动化和验收不得连接真实 AI。只有正式部署才填写真实 `APIYI_API_KEY`。
- 浏览器内未保存的 session 草稿不属于服务端备份。维护前应先让用户保存项目并退出生成任务。
- 生成队列与历史由 PostgreSQL 持久化；启动后会恢复活动任务并通过 Results 展示成功、失败或未知状态。同步未完成时不要盲目重新提交，以免重复计费。

## 2. 环境变量

从 `.env.example` 复制私有 `.env`，不要提交、打印或上传该文件。

| 变量 | 必需 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `APIYI_API_KEY` | 是 | 无 | API易图片网关密钥；就绪检查只验证非空，不会主动调用模型 |
| `APIYI_BASE_URL` | 否 | `https://api.apiyi.com` | 覆盖默认网关时必须是 HTTPS URL |
| `PORT` | 否 | 本地 3001；Compose 无配置时对外 3002 | 非 Docker 时是服务监听端口；Compose 容器内固定监听 3002，宿主机映射使用该值 |
| `API_PROXY_TARGET` | 否 | 跟随 `PORT` | 仅开发环境需要转发到独立 API 地址时设置 |
| `DATA_DIR` | 否 | `./data` | 上传、生成文件与旧 SQLite 导入源目录 |
| `DATABASE_URL` | 否 | 无 | 非 Docker 部署可使用完整 PostgreSQL 连接串；设置后优先于分项变量 |
| `PGHOST` / `PGPORT` | 否 | `127.0.0.1` / `POSTGRES_HOST_PORT` | 非 Docker PostgreSQL 地址 |
| `PGDATABASE` / `PGUSER` / `PGPASSWORD` | 否 | 回退到 `POSTGRES_*` | 非 Docker PostgreSQL 凭据 |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Compose 必需 | 数据库名和用户有默认值 | `POSTGRES_PASSWORD` 必须使用长随机值 |
| `POSTGRES_HOST_PORT` | 否 | `54329` | PostgreSQL 只绑定到本机开发端口 |
| `DATABASE_POOL_SIZE` | 否 | `10` | 连接池上限，服务端限制为 1–50 |
| `INITIAL_ADMIN_ACCOUNT_ID` | 空库必需 | 无 | 仅数据库没有用户时创建首位管理员 |
| `INITIAL_ADMIN_PASSWORD` | 空库必需 | 无 | 至少 10 位并同时含字母和数字；首次登录强制修改 |
| `SQLITE_IMPORT_FILE` | 否 | `garment-canvas.db` | 相对于 `DATA_DIR` 的旧 SQLite 文件，只在 PostgreSQL 空库时导入一次 |
| `COOKIE_SECURE` | 否 | `false` | HTTPS 反向代理部署必须设为 `true` |
| `API_ONLY` | 否 | `false` | `true` 时不要求或托管前端构建 |
| `AI_TIMEOUT_MS` | 否 | 按模型契约，通常 300000 | AI 请求超时毫秒数 |
| `UPLOAD_NORMALIZATION_MOZJPEG` | 否 | `false` | 上传 JPEG 标准化默认使用 libjpeg；仅在质量/兼容回滚时设为 `true` 启用旧 mozjpeg 路径并重启服务 |
| `ENABLE_PAID_EVALUATION_RUNS` | 否 | `false` | 只有完成单次预算审批与持久化授权后才可设为 `true`；普通生产发布保持关闭 |
| `GARMENT_CANVAS_BUILD_CODE_SHA` | 付费评估或非空受审发布构建必需 | 无 | 构建阶段写入固定镜像身份文件的已审核提交 SHA；不是运行时信任输入 |
| `GARMENT_CANVAS_CODE_SHA` | 付费评估或非空受审发布运行必需 | 无 | 已审核发布提交的恰好 40 或 64 位小写十六进制 SHA；必须匹配真实 Git HEAD 或镜像内构建身份 |
| `GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR` | Compose 非空受审发布必需 | 无 | 宿主机 Git 工作树外的完整发布闭包绝对目录；必须通过宿主预检后只读挂载 |
| `GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SOURCE` | Compose 非空受审发布必需 | 无 | 必须精确指向 `HOST_DIR/prompt-release-registry.json`；仅作为构建输入，不是运行时完整证据包 |
| `GARMENT_CANVAS_EVALUATION_RELEASE_DIR` | 非 Docker 非空受审发布必需 | 无 | 运行时可读的完整外置发布闭包目录；Compose override 固定为 `/run/garment-canvas/evaluation-release` |
| `GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH` | 非 Docker 非空受审发布必需 | 无 | 运行时 registry 绝对路径；必须精确位于 `RELEASE_DIR/prompt-release-registry.json` |
| `GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256` | 非空受审发布必需 | 无 | registry 原始文件字节的 SHA-256；前后端构建与运行时必须相同 |
| `GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256` | 非空受审发布必需 | 无 | registry 递归可达发布闭包的受审根哈希，不能用 registry 文件哈希代替 |
| `APIYI_TAIL_STALL_SALVAGE` | 否 | `true` | 完整对象 JSON 已到齐但连接不结束时启用安全收尾；设为 `false`、`0` 或 `off` 只关闭宽限期提前收尾，流式响应大小上限始终生效 |
| `APIYI_TAIL_STALL_GRACE_MS` | 否 | `5000` | 最后一块数据后的完整 JSON 探测宽限期，限制为 1000–30000ms；不替代模型总超时或 Undici body timeout |
| `GENERATION_WORKER_POLL_MS` | 否 | `2000` | Worker 轮询间隔，限制为 100–60000 ms |

初始化成功并完成管理员改密后，可以从 `.env` 移除 `INITIAL_ADMIN_ACCOUNT_ID` 和 `INITIAL_ADMIN_PASSWORD`，避免长期保留临时凭据。

Compose 会读取私有 `.env` 做端口插值：复制当前 `.env.example` 后宿主机网页端口是 3001；删除或不设置 `PORT` 时回退到 3002。Compose 部署通常不要再设置 `DATABASE_URL`，否则它会优先于容器内的 `PG*` 连接配置。

真实付费评估必须先通过独立发布门禁：`git rev-parse HEAD` 必须逐字符等于获准 SHA，且 `git status --porcelain=v1 --untracked-files=normal` 必须为空。Docker 部署把同一个值分别写入私有 `.env` 的 `GARMENT_CANVAS_BUILD_CODE_SHA`（只在构建阶段生成固定身份文件）和 `GARMENT_CANVAS_CODE_SHA`（运行时声明），然后才设置 `ENABLE_PAID_EVALUATION_RUNS=true`。两者缺失、格式错误或不一致时服务会在数据库初始化和 Worker 启动前退出，不会调用 Provider。

构建身份文件只证明镜像构建时声明了哪个 SHA，**不能证明 Docker build context 本身干净**。因此不能用该文件代替上面的干净 exact-SHA 发布门禁。运行镜像不安装 Git，也不复制 `.git`；在保留 Git 元数据的本地部署中，服务直接读取真实 HEAD 和 dirty 状态，环境变量不能覆盖它们。

普通、不开启付费评估的 Docker 构建允许 `GARMENT_CANVAS_BUILD_CODE_SHA` 为空，服务不会读取空身份；这样的镜像只能运行普通任务。之后若要开启付费评估，必须带获准 SHA 重新构建镜像，不能只在旧容器上补运行时变量。

### 2.1 外置受审评估发布物

`docs/ai/evaluation/prompt-release-registry.json` 只是跟踪的空 schema 示例，不是生产发布源。真实的 contract check、各阶段 receipt、promotion 和 registry 必须由评估工具写入 Git 工作树外的受控目录，并在被评估的干净 exact-SHA 上生成。这样发布物不会改变 Git HEAD，也不会形成“提交 registry 后 SHA 又变化”的自指循环。工具只会初始化空的专用目录，并写入 `.garment-canvas-evaluation-release-root` 标记；文件系统根、HOME、共享临时根、Git 项目及其祖先、非空且无标记的目录都会被拒绝。

部署时必须同时锁定 registry 原始字节哈希、registry 可达发布闭包根哈希和代码 SHA。可达闭包固定为 `registry → promotion → 当前及全部前序 gate receipts → contract check → retained /v1/models 原始文件`；未被 registry 触达的 `exports/` 或孤儿文件不计入根哈希。运行时会逐个读取原始字节、验证固定路径与递归关系，并重算根哈希后同时对照环境变量和构建 manifest，不能只信任一串外部声明。

BuildKit secret 只避免把外部源文件保存在构建层历史中，不是浏览器保密边界。Vite 与 Node 会把**最小运行准入投影**编入产物；其中不含审批人、审批理由和审批时间。完整 promotion、receipt、contract check 及人工审计信息只留在外置包。前后端各自写出只含代码/闭包/registry 哈希和数量的 manifest；服务启动前还会校验服务端内嵌投影、运行时 registry、前后端 manifest 与 `GARMENT_CANVAS_CODE_SHA` 全部一致。任一可达文件缺失、被替换、路径穿越 symlink、哈希不符、模型目录漂移或版本漂移，都会在数据库初始化和 Worker 启动前失败关闭。运行时还会确认 registry 可达的每个文件及其包内父目录对服务进程都不可写，不再只检查 registry 一个文件。这个门禁与 `ENABLE_PAID_EVALUATION_RUNS` 无关，因为普通用户也会使用 `verified` / `recommended` 发布。

当前五模型范围的 API易 `/v1/models` 目录基线已按本轮人工复核物化：捕获时间 `2026-09-03T13:22:48.000Z`，HTTP 200，271 个规范化唯一 ID，五个现役 ID 精确覆盖 5/5；原始文件 SHA-256 为 `7d5348336bbe5ac63a34107a506e3c5c72340064608c11193602df65c4327408`，`sha256-canonical-model-id-set-v1` 指纹为 `43b6914c1328f07599468e9129d18ba7966293cf73144b4a722c9494a2c8636d`。本次目录相对先前 269-ID 记录发生漂移，旧历史记录不改写。原始文件仍在 Git 工作树外；contract check 必须读取其精确字节并把它保留到外置发布闭包，仓库内摘要和历史脱敏探针都不能代替原始文件。

该批准只关闭模型目录人工基线这一项前置阻断。五个模型仍为 `unverified`；在真实评估证据、阶段 gate、promotion、registry 和干净 exact-SHA 门禁完成前，仍不得生成或部署非空受审发布，也不得把目录存在解释为生成、编辑、质量或计费通过。

只有通过上述门禁的非空发布才使用专用 Compose override：

```bash
npm run evaluation:release:preflight
docker compose -f compose.yaml -f compose.evaluation-release.yaml config --quiet
docker compose -f compose.yaml -f compose.evaluation-release.yaml up -d --build --wait
```

普通空发布不加该 override。宿主预检会拒绝相对路径、广域根/HOME/项目祖先目录、Git 工作树内路径、任一路径段 symlink、缺少专用目录标记、存在 `.prompt-release-registry.lock`、registry 位置/原始 SHA 不匹配以及 41–63 位伪代码 SHA。其 JSON 中 `ok: true` 只表示 `hostMountOnly: true` 的宿主路径、权限与哈希检查通过；`campaignReady: false` 是有意的宿主侧语义，表示预检没有加载或验证任何具体 Campaign/evidence 闭包，而不是账本或闭包能力尚未实现，也不能把该结果解释为总体发布就绪。评估工具把包目录精确写为 `0755`、文件精确写为 `0644`，使宿主操作者与容器 `USER node` UID 不同时仍可读；`0604`、`0744` 等近似权限也会被拒绝。`promote` 通过跨进程锁和 registry CAS 串行更新；遗留锁不会被自动破坏，必须人工确认无存活 writer 后处理。

`GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR` 必须是完整外置包目录，`GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SOURCE` 必须指向该目录下的 `prompt-release-registry.json`；容器内挂载点固定为 `/run/garment-canvas/evaluation-release` 且为只读。服务启动时会读取 Linux `/proc/self/mountinfo`，按最长路径匹配检查发布根、专用 marker、整棵发布树和所有递归可达文件/目录的 per-mount 选项；根为 `ro` 但存在嵌套 `rw` 挂载也会失败关闭。运行时还会拒绝活动 registry 锁、目录循环/绑定别名以及超过 20,000 项的异常发布树，再在只读证明后重读 registry。非空发布在非 Linux 环境或无法读取 mountinfo 时同样拒绝启动。`0755/0644` 只解决跨 UID 可读性，不是不可变证明；普通文件权限位不能替代 OS 级只读挂载。

## 3. Docker 安装与升级

要求 Docker Desktop 或 Docker Engine + Compose。

```bash
cp .env.example .env
chmod 600 .env
docker compose config
docker compose up -d --build --wait
curl --fail http://localhost:3001/api/ready
```

若本次部署获准执行真实评估，应在 `docker compose up` 前确认私有 `.env` 中的 `GARMENT_CANVAS_BUILD_CODE_SHA`、`GARMENT_CANVAS_CODE_SHA` 和获准提交三者完全一致，并强制重新构建镜像；不要把私有 `.env` 或完整 Compose 配置输出到公开日志。

首次登录使用私有 `.env` 中的管理员临时凭据。界面会要求管理员本人完成最终密码修改；随后再通过账户菜单创建、停用、重置或删除普通用户。

升级应用前先完成第 5 节的一致性备份，然后：

```bash
git fetch origin
git switch --detach <approved-release-commit>
docker compose up -d --build --wait
curl --fail http://localhost:3001/api/ready
```

不要在未复审的分支或漂移 SHA 上构建生产版本。升级数据库结构后，代码回滚不一定等于数据回滚；需要回退数据库时必须使用同一发布前备份。

## 4. macOS 非 Docker 部署

适用于已经独立管理 PostgreSQL 18 的单机环境。要求 macOS 13.5、Node.js 24.20.0 或更高版本。

```bash
npm ci
npm run check
npm run build
npm ci --omit=dev
NODE_ENV=production npm start
```

服务端会读取项目根目录的私有 `.env`。完整模式缺少 `dist/index.html` 时会直接退出；只有明确的 API 独立部署才设置 `API_ONLY=true`。

### launchd 示例

先使用 `command -v node` 确认 Node 的绝对路径，并将下面所有 `/ABSOLUTE/PATH` 替换为真实路径。保存为 `~/Library/LaunchAgents/com.garment-canvas.app.plist`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.garment-canvas.app</string>
  <key>ProgramArguments</key>
  <array>
    <string>/ABSOLUTE/PATH/TO/node</string>
    <string>/ABSOLUTE/PATH/TO/garment-canvas/dist-server/index.js</string>
  </array>
  <key>WorkingDirectory</key><string>/ABSOLUTE/PATH/TO/garment-canvas</string>
  <key>EnvironmentVariables</key>
  <dict><key>NODE_ENV</key><string>production</string></dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/ABSOLUTE/PATH/TO/garment-canvas/logs/app.log</string>
  <key>StandardErrorPath</key><string>/ABSOLUTE/PATH/TO/garment-canvas/logs/app-error.log</string>
</dict>
</plist>
```

```bash
mkdir -p logs
launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.garment-canvas.app.plist
launchctl kickstart -k "gui/$(id -u)/com.garment-canvas.app"
curl --fail http://localhost:3001/api/ready
```

启用 HTTPS 反向代理后，将 `.env` 中的 `COOKIE_SECURE` 改为 `true` 并重启服务。不要把 PostgreSQL 或应用端口直接暴露到不可信网络。

## 5. 一致性备份

建议每天备份，并在每次发布、数据库迁移、批量用户管理前额外备份。以下命令使用时间戳目录，避免覆盖旧备份：

```bash
backup_dir="backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"
docker compose stop app
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' > "$backup_dir/postgres.dump"
tar -C data -czf "$backup_dir/data.tar.gz" .
shasum -a 256 "$backup_dir/postgres.dump" "$backup_dir/data.tar.gz" > "$backup_dir/SHA256SUMS"
docker compose start app
curl --fail http://localhost:3001/api/ready
```

备份完成后检查文件非空，并把整个时间戳目录复制到独立磁盘或受控备份系统。只有放在同一台机器同一磁盘上的副本不算灾备。

## 6. 恢复演练

恢复会覆盖数据，只能在明确选定的恢复环境中执行。生产恢复前停止应用，并保留当前故障现场的额外快照。

1. 校验备份：`shasum -a 256 -c SHA256SUMS`。
2. 使用相同主版本的 PostgreSQL 18 启动空环境。
3. 停止 `app`，确认没有生成 Worker 或写请求。
4. 在空数据库中执行：

```bash
docker compose exec -T postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' < backups/<timestamp>/postgres.dump
```

5. 将现有 `data/` 移到隔离位置后，重建空目录并解压同一时间戳的文件备份：

```bash
mkdir -p data
tar -C data -xzf backups/<timestamp>/data.tar.gz
```

6. 启动应用，检查 `/api/ready`，然后人工验证登录、项目、素材、Results、活动任务和文件下载。

不要只恢复 PostgreSQL 或只恢复 `DATA_DIR`。数据库记录与文件目录不一致时，结果卡可能存在但文件丢失，或出现无人引用的文件。

## 7. PostgreSQL 与旧 SQLite 迁移

### PostgreSQL 17 → 18

PostgreSQL 18 镜像挂载点为 `/var/lib/postgresql`，不能直接复用 17 的数据目录。使用 `pg_dump` 导出 17，再在全新的 18 卷中使用 `pg_restore`；确认恢复成功前不要删除旧卷。

### SQLite → PostgreSQL

- 把旧 SQLite 文件放到 `DATA_DIR`，并用 `SQLITE_IMPORT_FILE` 指定相对文件名。
- 只在 PostgreSQL 没有任何用户时触发一次只读导入。
- 导入覆盖用户、会话、项目、素材、生成记录和消耗流水；原 SQLite 文件保留不变。
- 导入后检查用户数量、项目、素材、历史、消耗 CSV 和文件下载，再把旧文件归档为只读证据。

## 8. 首次安装与恢复流程

### 首次安装

1. 生成私有 `.env`，启动服务并确认 `/api/ready` 为 200。
2. 管理员使用临时凭据登录并亲自完成强制改密。
3. 创建一个普通用户，验证普通用户看不到管理员功能和他人私有素材。
4. 创建、保存并重新打开一个项目，确认服务端持久化。
5. 使用 dummy/stub 环境完成发布验收；正式 AI 连通性只在生产授权范围内单独检查。

### 项目与任务恢复

- 已保存项目从项目中心重新打开；浏览器 session 草稿只用于同一浏览器的临时恢复，不能替代服务端保存。
- 刷新后等待历史与活动任务对账完成。同步失败时生成安全门保持关闭，应先重试同步或修复后端，不能直接重复运行。
- `失败` 记录保留失败原因且不计成功消耗；`结果未知` 表示终态无法确认，应先检查服务端历史和日志。
- Results 必须继续支持跨项目恢复、失败、未知、查看、对比、下载和继续处理。

## 9. 健康检查与故障排查

| 信号 | 含义 | 处理 |
| --- | --- | --- |
| `GET /api/health` 200 | Node 进程存活 | 仍需检查 `/api/ready` |
| `dataDirWritable: false` | `DATA_DIR` 不可创建、写入或清理探针 | 检查目录、磁盘空间、所有者和挂载权限 |
| `frontend: false` | 完整生产模式缺少 `dist/index.html` | 重新执行 `npm run build`；不要用 `API_ONLY` 掩盖完整部署错误 |
| `aiConfigured: false` | 密钥为空或网关 URL 不是 HTTPS | 检查私有 `.env`，不要输出密钥 |
| `database: false` | PostgreSQL 不可达或迁移失败 | 检查 `docker compose logs postgres`、连接变量和磁盘 |
| `usersConfigured: false` | 数据库没有用户且管理员初始化失败 | 检查初始管理员变量和密码规则 |
| 会话被替换 | 同一账号在另一设备登录 | 用户确认后重新登录；不要修改无关账号设置 |
| 任务长期运行或未知 | Worker、网关或 SSE 状态不完整 | 检查 app 日志、历史和活动任务；避免盲目重提 |

常用诊断：

```bash
docker compose ps
docker compose logs --tail=200 app postgres
curl --fail http://localhost:3001/api/health
curl --fail http://localhost:3001/api/ready
```

## 10. 安全基线

- `.env` 权限设为 600；密钥、数据库 dump、上传文件和 `data/` 不进入 Git、PR、日志或截图。
- 生产入口使用 HTTPS 反向代理并设置 `COOKIE_SECURE=true`；限制应用与 PostgreSQL 的网络暴露。
- 首次管理员必须改密；临时凭据完成初始化后从 `.env` 删除或轮换。
- 每个账号只保留一个有效设备会话，会话最长 30 天；管理员操作使用独立账号并遵循最小权限。
- AI 网关 URL 必须 HTTPS；生成、工作流入队和 AI 诊断探测共用按 IP 每分钟 100 次的限流，登录单独限制为每分钟 10 次。限流是单进程内存状态，多实例部署需额外的集中式限流。
- 定期运行 `npm audit`、依赖更新审查、恢复演练和权限抽查；高危漏洞未处置时不得发布。
- 备份包含敏感业务数据，应加密存储、限制访问并设置保留/销毁策略。

## 11. 桌面验收矩阵

| 宽度 | 最低高度/参考高度 | 必验内容 |
| --- | --- | --- |
| 1024 | 768 | 左右 Dock 互斥、画布仍可操作、顶栏/页签不溢出 |
| 1280 | 720 | 主工作区、节点参数、Results、MiniMap、弹层 |
| 1440 | 900 | 完整工作区密度、长提示词、结果详情、项目中心 |

每个宽度覆盖 `current`、`white`、`eye` 三主题，并验证 Tab、Escape、焦点恢复、Dialog/菜单焦点边界、React Flow 快捷键隔离、失败/未知 Results 和继续处理。最新证据见 [`PHASE_D_VISUAL_ACCEPTANCE.md`](PHASE_D_VISUAL_ACCEPTANCE.md)。
