> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 官逆渠道暂停 · 谷歌上游 500 INTERNAL

> VEO 3.1 视频生成官逆 API 今晚谷歌上游系统故障，持续返回 500 Internal error，渠道空跑数小时后已暂停。明天观察上游恢复情况，保持关注。

**2026/5/13 00:58 (UTC+8)** · 模型状态 · Google

⚠️ **VEO 3.1 官逆视频生成渠道暂停 · 谷歌上游 500 INTERNAL** —— 今晚 (UTC+8) 谷歌官方侧出现系统问题，VEO 3.1 视频生成官逆 API 持续返回 **500 Internal error**，原生报错如下：

```json theme={null}
{
  "error": {
    "code": 500,
    "message": "Internal error encountered.",
    "status": "INTERNAL"
  }
}
```

🛑 **当前处理**：渠道已空跑数小时（每次调用均失败），为避免继续消耗客户端重试与超时，**已先暂停该官逆渠道**。**明天 (5/13) 持续观察谷歌上游恢复情况**，恢复后会第一时间重新上线并同步动态，保持关注。

💡 **状态参考**：本次为谷歌侧上游基础设施故障（`INTERNAL`），与 VEO/Sora 2 偶发的 `PUBLIC_*` 内容审核拦截不同——后者属上游审核策略、可直接重试；本次属上游服务不可用，重试无效。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
