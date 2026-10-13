> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 个人访问令牌上线，旧系统令牌计划 2026-11-11 停用

> 控制台新增个人访问令牌，用于余额查询、日志查询、令牌管理等管理接口，可按权限勾选、设置到期时间与 IP 白名单。旧系统令牌计划 2026-11-11 (UTC+8) 停用，平台会视使用情况决定是否延期，建议尽早更换。

**2026/10/12 20:20 (UTC+8)** · 服务通知

🚀 **个人访问令牌上线：管理接口有了可按权限授权的新凭证**

入口在个人中心 →「账户选项」→ **个人访问令牌**。它用来让脚本调用余额查询、日志查询、令牌管理等管理接口，与调用模型的 API Key 是两回事：

* **按需授权**：读取、写入、查看密钥相互独立，例如对账脚本只勾「用量与个人记录 · 读取」
* **到期时间**：默认 30 天，可选 90 / 180 / 365 天、自定义或永不过期，建议选久一点
* **IP 白名单**：支持 IPv4、IPv6、CIDR，创建后不能修改；建议先不填，调通后再新建一把带白名单的正式令牌
* **数量**：每个账号最多 20 个，一个脚本一把，泄漏时只删那一把

⏸ **旧系统令牌计划于 2026-11-11 (UTC+8) 停用**，停用后调用会返回 401 `ACCESS_TOKEN_LEGACY_RETIRED`。平台会根据使用情况决定是否延期，但推荐尽早换成个人访问令牌：只需替换请求头 `Authorization` 里的值，代码不用改。

创建步骤、权限对照表与常见报错见 [什么是个人访问令牌？如何替换系统令牌？](/faq/personal-access-token)；[余额查询](/api-capabilities/balance-query)、[日志查询](/api-capabilities/log-query)、[令牌管理](/api-capabilities/token-management) 三个 API 文档已同步更新。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.