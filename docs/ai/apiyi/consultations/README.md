# API易咨询凭证

任何命中 `../change-scope.json` 的修改都采用两阶段流程：编码前先运行 `docs:apiyi:kb:check` 与 `docs:apiyi:search` 阅读当前本地快照；完成明确选择和实现后，再用 `docs:apiyi:lookup` 把查阅页面、快照哈希、实际影响路径、精确差异指纹和决策写成 JSON 凭证：

```bash
npm run docs:apiyi:lookup -- \
  --query "图片模型超时 重试 错误响应" \
  --paths "server/providers/base.ts,tests/provider-retry.test.ts" \
  --receipt "docs/ai/apiyi/consultations/2026-09-02-example.json" \
  --decision "沿用结果不明不重放，并补充 request-id 证据"
```

凭证只证明“当前变更确实先查过当前快照且引用文件未被篡改”。它不把原始文档提升为生产契约，也不授权付费调用、密钥操作、提交、发布或部署。

如果存在会显著改变费用、质量、安全、依赖或兼容性的多个合法方案，先在 `--unresolved` 中记录问题，并向用户提供 2–3 个明确选项。`unresolvedChoices` 非空时门禁保持失败；得到选择后重新生成凭证。

格式见 [schema.json](./schema.json)。
