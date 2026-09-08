> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# claude-fable-5 暂停供给 · 因 Anthropic 与 AWS 源头暂停

> 因 Fable 5 的最新限制，AWS Claude 宣布暂停企业调用，API易随之暂停 claude-fable-5 供给。其它 Claude 模型不受影响，可继续使用 claude-opus-4-8、claude-sonnet-4-6 等系列。

**2026/6/13 10:25 (UTC+8)** · 服务通知 · Anthropic

⏸ **`claude-fable-5` 暂停供给 · 因 Anthropic 与 AWS 源头暂停** —— 因 Fable 5 的最新限制，AWS Claude 宣布暂停企业调用，于是我们也同步暂停 `claude-fable-5` 供给。其它 Claude 模型不受影响，欢迎各位客户继续使用 `claude-opus-4-8`、`claude-sonnet-4-6` 等系列。源头恢复后即同步恢复。

期间调用 `claude-fable-5` 会返回如下报错：

```text theme={null}
InvokeModel: operation error Bedrock Runtime: InvokeModel, exceeded maximum number of attempts, 3, https response error StatusCode: 500, RequestID: 7035202e-1cd5-414a-a2bc-1ccd54fef50b, InternalServerException: The system encountered an unexpected error during processing. Try your request again.
```

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
