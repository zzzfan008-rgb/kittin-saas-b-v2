> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 日志查询 API 文档上线，可程序化拉取每次调用的模型、扣费与耗时

> 新增日志查询 API 文档：GET /api/log/self 返回本账号每一次调用的模型、实际扣费、耗时与错误码，适合自动对账、故障自查与报障提工单。文档已写明 page_size 上限 10 必须翻页、对账须带 type=2、quota ÷ 500000 = 美元三个易踩的口径。

**2026/8/2 01:23 (UTC+8)** · 文档更新

📊 **日志查询 API 文档上线，调用明细现在可以用程序拉了**

接口是 `GET https://api.apiyi.com/api/log/self`，返回本账号**每一次 API 调用**的模型、实际扣费、耗时、是否流式与失败时的错误码。它和[余额查询 API](/api-capabilities/balance-query) 互补：余额查询回答「现在还剩多少钱」，日志查询回答「钱花在哪了」。适合自动对账、故障自查，以及报障时把 `request_id` 直接给客服定位那一次调用。

认证用**系统令牌**（个人中心底部生成），不是 `sk-` 开头的 API Key，且 `Authorization` 填裸值、**不加 `Bearer` 前缀**。

三个容易踩的口径文档里都写了：`page_size` 实际上限是 **10**，传 100 也只返回 10 条且不报错，拉任何有意义的时间段都必须翻页；统计花费务必带 `type=2`，否则充值与系统赠送记录会混进来把分组求和算错；`quota ÷ 500,000 = 美元`，与余额查询同一套换算。

📖 相关：[日志查询 API](/api-capabilities/log-query) · [余额查询 API](/api-capabilities/balance-query) · [如何查看我的调用记录](/faq/call-logs)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
