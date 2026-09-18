> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-all / vip 安全 500 错误直接披露 · 去掉内部重试

> gpt-image-2-all 与 gpt-image-2-vip 之前偶现的 429 实为 OpenAI 安全系统 500 拦截。原本官逆侧设有内部重试一次，现已去掉，500 错误会原样披露。同步说明官逆 vs 官转差异。

**2026/5/13 11:00 (UTC+8)** · 服务通知 · OpenAI

⚠️ **`gpt-image-2-all` / `gpt-image-2-vip` 安全 500 错误现已直接披露（去掉内部重试）** —— 之前部分客户偶现的 429 报错，**真实根因是 OpenAI 上游安全系统拦截返回的 500 错误**：

```text theme={null}
Your request was rejected by the safety system. If you believe this is an error,
contact us at help.openai.com
```

🔧 **改动说明**：原本官逆侧设有"内部重试一次"的兜底逻辑（重试失败的尾部偶尔会表现为 429），**现已去掉该重试**。后续遇到 500 安全拦截会**直接原样披露**给调用方，便于客户在自己业务里识别这类拒绝并按上游建议申诉（`help.openai.com`）。

💡 **官逆 vs 官转 差异**：`gpt-image-2-all` / `gpt-image-2-vip` 这类 **官逆通道** 会做一些必要的运维操作（如此前的内部重试、降级路由等）；而 **官转通道**（`gpt-image-2` 直连 OpenAI 官方 API）是 **纯透明代理**，原样转发上游响应，不做任何加工。

📖 官转 vs 官逆差异详解：[/api-capabilities/gpt-image-2/vs-gpt-image-2-all](/api-capabilities/gpt-image-2/vs-gpt-image-2-all)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
