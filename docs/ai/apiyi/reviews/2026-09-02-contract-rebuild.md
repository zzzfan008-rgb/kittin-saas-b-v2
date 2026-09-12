# 2026-09-02 六模型契约重建记录

本记录只证明公开文档契约已重建与复核，不证明任何付费模型当前可用。六个模型的 `observedEvidence.status` 仍为 `unverified`。

## 实施与来源基线

- Garment Canvas 的 Git HEAD 在实施前后均为 `b9b051f72fb9e0ce5514f8b646e9e3068ff9359c`；本轮没有提交、推送或发布。该工作树实施前已存在未提交改动，本记录只能证明它们被保留，不声称能从当前差异重建出“实施前的脏工作树”。
- `awesome-gpt-image-2` 来源固定为 `main@c7d293963b21c60bf338003915438cc5c39dd3ca`。唯一参考的结构化数据 `data/style-library.json` 的 SHA-256 为 `80f5cae039d0d6f312f0e2de2c9b3fc8a806640b0d517c120d704a71c5e4aa72`。
- 来源仓库的 `docs/templates.md` 存在未提交改动；本轮没有读取它作为发布输入，也没有把社区提示词当成跨模型运行时回退。

## 已处理的页面漂移

| 来源 | 2026-08-26 SHA-256 | 2026-09-02 SHA-256 | 契约复核结果 |
| --- | --- | --- | --- |
| GPT Image 2 VIP 总览 | `988326081558c5a95ef1255fef6915639e01ffa36f71f343f054cc11b4bd6360` | `2ed97c1500398dc939bd6b77e8e121227ef3906b1ae6a794658f1e75f967fdd0` | 保持 API易特有线路、30 个固定像素尺寸加 `auto`、最多 8 图；禁止 `quality/n/aspect_ratio`。 |
| Gemini/Nano Banana 2 总览 | `fa09e73b9409805d3b7471205ff34eb1751e07472723edb516a25d1d3aca361a` | `d3469a7e4587c9b23582e3e461c30364bf1af0a58f8118171bc0e010dd2be844` | 保持 `aspectRatio + imageSize`、产品 8 图上限，HTTP 200 无图仍按失败处理。 |
| FLUX 总览 | `49be87b346057c59842fc9fe35044dd512b230e6045395962c50c58c1e0a7993` | `1fc1c26bcaebc3de7d81e0bba95f457537babf223bf99a3a7cc32a90745984e3` | 保持宽高 16 的倍数、不超过 4MP、最多 8 图，立即下载临时 URL。 |
| Seedream 总览 | `3f4d3b47ff5baa431f0d92faa35091355838da1c47e0f4428b11a27f0d111482` | `a0c84cf7d8cf2b4e736fd03392eb36a6db2604eeb2207fc9578f7f0922a476da` | API易调用仍限定 2K/3K，产品最多 8 图，保存 Provider 实际输出尺寸。 |
| Grok Imagine 总览 | `4784917e39499754590ebd46aca6d98836b9c4c418dca3e60e7b3576c82195ac` | `0e6d8fdd1ea3eca0225eea43182d655ba6d68d8c7bc644492c8a54ae8727b74a` | API易仍使用 `grok-imagine-image`、编辑最多 4 图；不引入 xAI 直连 2.0 的 5 图与新比例。 |

## 分层结论

- `vendorCapability`：只用于提示词方法和交叉检查。
- `gatewayContract`：六模型当前 API易 ID、端点、引用图上限和不可发参数已写入 `model-knowledge.json`。
- `productPolicy`：运行时 `model-contracts.json` 保持为网关契约的子集。
- `observedEvidence`：不提升历史浏览器结果；等待专用 `no-retry` 真实评估和账单对账。

## 配置令牌的模型目录实证

2026-09-02T15:04:17Z 对当前项目配置的 API易主端点执行了一次认证 `GET /v1/models`；HTTP 200，不涉及任何图片生成或付费请求。脱敏证据见 `evidence/2026-09-02-model-catalog-probe.json`。

- 目录包含 272 个唯一模型 ID，完整 ID 集合的规范化 SHA-256 为 `bfe44201e1b2c6f2ea07ee75fa086857a3204dcf0d6ffb95f8dbf9bfaf1b7656`。
- 六个产品网关 ID 中五个精确存在；`grok-imagine-image` 缺失，且目录内没有可以自动替代的 Grok 图片 ID。
- 本地 Grok 公开文档仍声明该 ID 可用，因此这是“文档契约 vs. 配置令牌实际目录”冲突，可能受令牌白名单或账户分组影响。
- 本轮不写入 `reviewedExportSha256`，不更换 Grok 模型 ID，不发付费探针。发布检查继续失败是正确结果。

## 后续变更流程

1. `node scripts/apiyi-docs.mjs check` 只读检查公开 Markdown 哈希。
2. 如有漂移，`refresh` 只写入 `candidates/` 候选报告。
3. 审查人逐项核对语义声明，手工修改契约与基线哈希。
4. 所有受影响的提示词变体自动降为 `unverified`，重新评估后才可对普通用户开放。
