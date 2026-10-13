> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 什么是个人访问令牌？如何替换系统令牌？

> 个人访问令牌用于余额查询、日志查询、令牌管理等管理接口，可按权限勾选、设置到期时间与 IP 白名单；旧系统令牌计划 2026-11-11 停用

## 简短回答

**个人访问令牌**是新版控制台推出的「管理接口凭证」，用来让脚本或自动化工具调用余额查询、日志查询、令牌管理这类接口。
它取代原来的**系统令牌**：可以**只勾选需要的权限**、**设置到期时间**、**限定 IP 白名单**，一个账号最多可建 20 个，按用途分开发放。

<Warning>
  **旧系统令牌计划于 2026-11-11 (UTC+8) 停用。** 停用后，用系统令牌调用管理接口会返回 401。
  平台会根据实际使用情况决定是否延期，但建议尽早换成个人访问令牌：只需替换请求头 `Authorization` 里的值，代码不用改。
</Warning>

<Info>
  个人访问令牌**不能调用模型**。调用模型请继续使用 API Key（控制台里叫「模型密钥」，`sk-` 开头）。
</Info>

## 与系统令牌有什么不同

| 对比项 | 旧系统令牌 | 个人访问令牌 |
| - | - | - |
| 权限 | 拥有账号的全部权限 | 按需勾选，读取、写入、查看密钥相互独立 |
| 数量 | 每个账号 1 个 | 每个账号最多 20 个，可按用途分开 |
| 到期时间 | 不过期 | 30 / 90 / 180 / 365 天、自定义或永不过期 |
| IP 白名单 | 不支持 | 支持 IPv4、IPv6、CIDR |
| 前缀 | 无固定前缀 | `nap_` 开头 |
| 状态 | 2026-11-11 (UTC+8) 起计划停用 | 当前推荐 |

## 如何创建

<Steps>
  <Step title="打开个人访问令牌">
    登录控制台，进入个人中心 `api.apiyi.com/account/profile`，在「账户选项」里点击 **个人访问令牌**，再点右上角 **创建令牌**。
  </Step>

  <Step title="填写名称与到期时间">
    名称按用途写，方便日后识别，例如「对账脚本」「余额监控」。到期时间默认 30 天，到期后令牌自动失效，**建议选久一点**（如 365 天），免得脚本突然中断。
  </Step>

  <Step title="设置 IP 白名单（可选）">
    多个地址用英文逗号分隔，支持 IPv4、IPv6 或 CIDR，留空表示不限制。**白名单创建后不能修改**，做法见下文。
  </Step>

  <Step title="勾选权限">
    只勾你的脚本用得到的权限，对照表见下文。
  </Step>

  <Step title="创建并保存令牌">
    点击 **创建令牌**，立即复制并妥善保存。
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-entry.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=74b07a2becc459ad9db610e57281d4b7" alt="个人中心「账户选项」里的个人访问令牌入口" width="1400" height="598" data-path="images/personal-access-token-entry.png" />

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-create.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=db4eacd9f8f57ee95018d609b062e78a" alt="创建个人访问令牌：名称、到期时间、IP 白名单与权限" width="900" height="1244" data-path="images/personal-access-token-create.png" />

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-expiry.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=79d7e78889391a1bdb1b31239f4a48f1" alt="到期时间可选 30 天、90 天、180 天、365 天、自定义时间或永不过期" width="900" height="361" data-path="images/personal-access-token-expiry.png" />

## 该勾选哪些权限

权限分为「读取」「写入」「查看密钥」三种，相互独立：勾了写入不等于能读取，勾了读取也看不到密钥明文。

| 你要调用的接口 | 需要勾选 |
| - | - |
| [余额查询](/api-capabilities/balance-query)（`GET /api/user/self`） | 个人资料 · 读取 |
| [日志查询](/api-capabilities/log-query)（`GET /api/log/self`） | 用量与个人记录 · 读取 |
| [令牌管理](/api-capabilities/token-management)：列出 / 查询 API Key | 模型密钥 · 读取 |
| [令牌管理](/api-capabilities/token-management)：创建 / 修改 / 删除 API Key | 模型密钥 · 写入 |
| [令牌管理](/api-capabilities/token-management)：获取 API Key 明文 | 模型密钥 · 查看密钥 |

例如只做每日对账，勾「用量与个人记录 · 读取」一项就够了；余额监控只勾「个人资料 · 读取」。
**修改密码、两步验证这类需要安全验证的操作，仍须登录网页完成**，个人访问令牌勾了写入也做不了。

<Tip>
  一个脚本一把令牌、只勾它用到的权限。哪天某个脚本不用了或令牌泄漏，删掉那一把即可，不影响其它脚本。
</Tip>

## IP 白名单怎么设才不踩坑

白名单创建后不能修改，要改只能新建一把。推荐的顺序：

1. **先建一把不填白名单的令牌**，把脚本调通。
2. 确认能用后，**再建一把带白名单的正式令牌**。把可能用到的出口 IP 都填上：生产服务器、备用服务器、需要临时排查时用的办公网络等。
3. 换上正式令牌，**删除那把不带白名单的测试令牌**。

填的是**公网出口 IP**，不是内网 IP。家用宽带、办公网络这类出口 IP 会变的环境不适合开白名单，可以改用只读权限加较短的到期时间来控制风险。

## 怎么调用

用法与系统令牌完全相同：请求头 `Authorization` 填令牌本身，加不加 `Bearer ` 前缀都可以。

```bash theme={null}
curl --compressed -s 'https://api.apiyi.com/api/user/self' \
  -H "Authorization: $APIYI_TOKEN"
```

原来用系统令牌的脚本，把环境变量或配置里的值换成新令牌即可。

## 常见报错

| HTTP 状态 | 返回内容 | 原因与处理 |
| - | - | - |
| 401 | `ACCESS_TOKEN_LEGACY_RETIRED`，`Legacy management tokens have been retired...` | 仍在使用旧系统令牌，且已过停用日期。按上文创建个人访问令牌替换 |
| 401 | `This access token may not be used from the current IP address.` | 请求来源 IP 不在白名单内。核对服务器的公网出口 IP，白名单不能改，需新建令牌 |
| 403 | `ACCESS_TOKEN_SCOPE_DENIED`，`This endpoint is outside this access token's granted permissions.` | 令牌没有勾选这个接口需要的权限。对照上表新建一把令牌 |
| 401 | 令牌无效 | 令牌已过期、已被删除，或者账号修改了密码、两步验证或通行密钥。**这三项任一改动都会撤销全部个人访问令牌**，需要重新创建 |

## 相关文档

<CardGroup cols={2}>
  <Card title="余额查询 API" icon="wallet" href="/api-capabilities/balance-query">
    用个人访问令牌查询账户余额
  </Card>

  <Card title="日志查询 API" icon="file-text" href="/api-capabilities/log-query">
    按时间段拉取调用明细做对账
  </Card>

  <Card title="令牌管理 API" icon="key" href="/api-capabilities/token-management">
    程序化创建、轮换和删除 API Key
  </Card>

  <Card title="如何安全地管理 API Key？" icon="shield-check" href="/faq/key-security-management">
    API Key 的权限边界与防泄漏
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.