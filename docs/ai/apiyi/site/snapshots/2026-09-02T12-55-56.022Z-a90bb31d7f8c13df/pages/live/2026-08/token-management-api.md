> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 令牌管理 API 文档上线，可程序化批量发放 Key 并限额度、限模型、限有效期

> 新增令牌管理 API 文档：/api/token/ 支持创建、查询、启停与删除 API Key，每把 Key 可分别限制额度、模型白名单与到期时间。文档已写明创建响应返回的 key 是明文且不含 sk- 前缀需自行拼接、服务端没有批量接口需客户端循环、model_limits 与 allow_ips 传了不生效。

**2026/8/2 01:24 (UTC+8)** · 文档更新

🔑 **令牌管理 API 文档上线，Key 的全生命周期可以交给程序了**

基础路径是 `https://api.apiyi.com/api/token/`，`POST` 创建、`GET` 列出或查单个、`PUT` 更新（带 `?status_only=true` 只切启停）、`DELETE` 删除。最常见的用法是**批量发放**：给团队成员、下游客户、不同项目各发一把，并用 `remain_quota` 限额度、`models` 限模型白名单、`expired_time` 限有效期。

认证同样用**系统令牌**裸值、不加 `Bearer` 前缀。需要留意的是系统令牌本身不能调用模型，但**能创建出可以调用模型的 Key**，所以泄漏它比泄漏单把 API Key 严重得多，请按账号密码的级别保管并定期轮换。

三处实现细节文档里都写了：创建响应里的 `key` 是**明文且不含 `sk-` 前缀**，实际使用要自己拼上；服务端**没有批量创建接口**，传 `count` 之类参数不生效，批量发放靠客户端循环调用；`model_limits`、`model_limits_enabled`、`allow_ips` 三个字段传入不报错但**当前不会生效**，限制可用模型请用 `models`。另外 `unlimited_quota` 缺省为 `false` 而 `remain_quota` 缺省为 0，两者一起缺省会建出一把额度为 0、无法使用的 Key。

📖 相关：[令牌管理 API](/api-capabilities/token-management) · [如何创建 KEY](/faq/token-management) · [日志查询 API](/api-capabilities/log-query)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
