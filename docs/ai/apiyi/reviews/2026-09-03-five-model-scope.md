# 现役五模型范围复核

复核日期：2026-09-03

## 决策

Garment Canvas 的现役图片模型收窄为：

- `gpt-image-2`
- `gpt-image-2-vip`
- `gemini-3.1-flash-image`
- `flux-2-pro`
- `seedream-5-0-260128`

`grok-imagine-image` 自本决策起退役。它不得出现于新建节点的模型选择、现役 Provider 注册表、参数/提示词档案、评估计划或发布基线。旧项目、历史结果和证据中的该 ID 可以继续读取，但重新运行、评估或发送 Provider 请求必须失败关闭，且不得静默替换为其他模型。

这是产品范围决策，不是对 API易或厂商当前能力的新探针结论，也不将历史失败改写为通过。

## 现役契约处理

- `sources.json.modelCatalog.expectedGatewayModelIds`、`model-knowledge.json.models[]` 和 `model-contracts.json.models[]` 统一为上述五个 ID。
- 从现役精选来源中移除 Grok 的 API易网关页、xAI 厂商来源和模型适配文档；全站 `site/` 快照不受影响。
- 现役契约 ID 升为 `apiyi-image-contracts-v4`，`schemaVersion` 仍为 3；这是范围破坏性变更，不是 JSON schema 破坏性变更。
- `reviewedModelCatalogBaseline.expectedGatewayModelIds` 的改变属于每个模型的规范语义包络；五个剩余模型的 `contractHash` 必须全部重算后才能用于契约检查或发布。
- `evaluation-plan-v2.json` 是当前评估计划；`evaluation-plan-v1.json` 保留为历史计划，不得就地改写或用于新评估。

## 不可改写的历史证据

以下材料保留当时的六模型预期、观测值和阻断结论：

- `evidence/2026-09-02-model-catalog-probe.json`
- `evidence/2026-09-03-model-catalog-probe.json`
- `reviews/2026-09-02-contract-rebuild.md`
- `reviews/2026-09-03-model-catalog-drift.md`
- 已存在的 `consultations/` 凭证
- `site/current.json` 所指的不可变全站快照及其 manifest
- `evaluation-plan-v1.json`
- 已生成的 contract-check、gate receipt、promotion、registry 和 release bundle

其中 2026-09-03 目录探针的 269 个规范化唯一 ID、完整集合哈希、当时的六模型命中结果及阻断决定都不随本次产品范围变更而改写。`sources.json.pricingSnapshot` 也是 2026-08-26 的历史信号，其 `absent` 值保留原样。

## 发布状态

`sources.json.modelCatalog.reviewedExportSha256` 仍为 `null`。两份脱敏目录探针不是经人工批准的原始 `/v1/models` 导出，因此退役 Grok 不会自动使发布门禁通过。在原始五模型基线完成独立人工复核、五个契约哈希重算且相关离线测试通过之前，发布仍必须失败关闭。

本次复核不读取密钥，不访问网络，不发送付费 Provider 请求。
