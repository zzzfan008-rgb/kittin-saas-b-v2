# 2026-09-03 API易当前目录人工复核

本记录物化本轮当前五模型范围的 API易 `/v1/models` 人工复核结果。它只批准配置令牌在捕获时刻返回的精确目录指纹，不批准任何生成、编辑、质量、计费或发布结论。

## 原始观测

- 捕获时间：`2026-09-03T13:22:48.000Z`。
- 请求：使用已配置凭据认证 `GET /v1/models`，串行 1 次，重试 0 次，HTTP 200。
- 图片生成或编辑端点调用：0；付费 Provider 调用：0。
- 原始响应长度：61,774 字节。
- 原始文件 SHA-256：`7d5348336bbe5ac63a34107a506e3c5c72340064608c11193602df65c4327408`。
- 规范化唯一模型 ID：271 个。
- 规范化范围：`sha256-canonical-model-id-set-v1`。
- 规范化 ID 集合 SHA-256：`43b6914c1328f07599468e9129d18ba7966293cf73144b4a722c9494a2c8636d`。

完整原始导出保存在 Git 工作树外，按仓库根目录相对路径为 `../_external/apiyi-model-catalog/2026-09-03Tmanual-review-v1-models.json`。仓库只保存脱敏元数据和指纹；contract check 仍必须读取该精确外置文件，并同时核对原始字节 SHA 和规范化 ID 集合 SHA。

## 精确 ID 核对

| 当前产品模型 ID | 目录精确命中 |
| --- | --- |
| `gpt-image-2` | 是 |
| `gpt-image-2-vip` | 是 |
| `gemini-3.1-flash-image` | 是 |
| `flux-2-pro` | 是 |
| `seedream-5-0-260128` | 是 |

结果为 5/5。核对只接受完整字符串精确相等，不使用别名、模糊匹配或自动回退。按本轮用户请求完成复核并物化 `sources.json.modelCatalog.reviewedExportSha256` 与配套原始 SHA 基线。

## 漂移与历史边界

相对先前 `2026-09-03T08:12:22.094Z` 的人工复核，规范化目录从 269 个 ID 变为 271 个，原始字节和两层 SHA 均发生变化。这是当前目录漂移；旧的 `evidence/2026-09-03-five-model-catalog-review.json` 与对应复核 Markdown 保留为不可改写历史，不被当前基线覆盖。

## 发布边界

目录存在只证明该配置令牌的账户级目录视图包含这五个 ID。它不证明生成端点、编辑端点、输出质量、价格、计费、重试语义或 API易全局可用性。五个模型的 `observedEvidence.status` 仍全部为 `unverified`；必须继续通过独立评估证据、阶段 gate、promotion、registry 和干净 exact-SHA 发布门禁，才能讨论发布就绪。

本轮没有调用 `/v1/images/generations`、`/v1/images/edits` 或其他图片生成/编辑端点。
