> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 常见问题总览

> API易 常见问题总索引：新手接入、模型调用、令牌与日志、充值计费、企业服务、账号登录，全部 FAQ 支持按主题与按症状两种方式检索。

这里汇总了 API易 全部常见问题。第一次来的话，先看**新手三步**和**高频问题**；已经在用、遇到具体报错的，直接跳到**按症状排查**；想系统翻一遍的，往下看**按主题浏览**。

## 🚀 新手三步

<CardGroup cols={3}>
  <Card title="第一步：注册账号" icon="mail" href="/faq/email-registration">
    支持 Gmail、Outlook、Foxmail 及全球高校邮箱，也可用 GitHub 一键登录
  </Card>

  <Card title="第二步：创建 KEY" icon="key" href="/faq/token-management">
    在控制台令牌页拿到默认令牌，或新建一个专用 KEY 并选好分组
  </Card>

  <Card title="第三步：填 Base URL" icon="link" href="/faq/base-url-config">
    OpenAI 格式填 `/v1`，Claude 填根域名，Gemini 填 `/v1beta`
  </Card>
</CardGroup>

## 🔥 高频问题

<CardGroup cols={2}>
  <Card title="如何创建 KEY？" icon="key" href="/faq/token-management">
    获取默认令牌与新建 KEY 的完整步骤
  </Card>

  <Card title="Base URL 怎么填？" icon="link" href="/faq/base-url-config">
    `/v1`、根域名、`/v1beta` 三种填法分别对应哪类模型
  </Card>

  <Card title="如何选择合适的 AI 模型？" icon="compass" href="/faq/model-selection-guide">
    按场景、成本、速度三个维度做模型选型
  </Card>

  <Card title="为什么提示 API Key 无效？" icon="triangle-alert" href="/faq/invalid-api-key">
    九成是 Base URL 与 KEY 不配套，先按这篇自查
  </Card>

  <Card title="为什么还有余额跑不通？" icon="credit-card" href="/faq/balance-insufficient">
    预扣费机制与 max\_tokens 设置过大导致的余额判定
  </Card>

  <Card title="系统里模型的【倍率】是什么？" icon="calculator" href="/faq/model-multiplier">
    倍率是人民币计价单位，乘固定汇率才是美元等效价
  </Card>

  <Card title="网站有什么充值活动吗？" icon="gift" href="/faq/recharge-promotions">
    首充加赠、阶梯加赠与企业客户政策
  </Card>

  <Card title="为什么官方网页版和 API 返回结果不同？" icon="layers" href="/faq/webapp-vs-api-difference">
    同一个模型，官网聊得聪明、API 却像变笨的原因
  </Card>
</CardGroup>

***

## 🔧 按症状排查

遇到具体问题时，先在这张表里对号入座。同一个现象可能跨多个主题，这里按你实际看到的表现重新串了一遍。

| 你遇到的现象                         | 可能原因                            | 去看                                                                                          |
| ------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------- |
| 提示 API Key 无效 / 401            | Base URL 与 KEY 不配套，或 KEY 填错     | [API Key 无效](/faq/invalid-api-key) · [Base URL 怎么填](/faq/base-url-config)                   |
| 报错看不懂、不知道从哪查起                  | 先按错误类型对号入座                      | [模型调用报错怎么排查](/faq/model-error-troubleshooting)                                              |
| 有余额却跑不通                        | 预扣费机制，或 max\_tokens 设得过大        | [余额跑不通](/faq/balance-insufficient) · [预扣费机制](/faq/pre-deduction-quota)                      |
| 请求超时 / 中途断连                    | 客户端 timeout 太短，推理型模型耗时长         | [如何避免接口超时](/faq/timeout-configuration)                                                      |
| 日志显示成功并扣费，客户端却没收到              | 日志的用时只记到网关处理结束，差值在下行或收尾         | [日志显示已完成却收不到响应](/faq/log-duration-vs-client-wait)                                           |
| 网站 / 接口返回 502                  | 服务容器短暂自动重启，约 1 分钟恢复             | [502 怎么办](/faq/website-502-error)                                                           |
| 脚本间歇报 502，正文为空、日志里查不到          | 本机代理软件（Clash / v2rayN）自己生成的 502 | [代理造成的空 502](/faq/proxy-empty-502)                                                          |
| Python 报 SSLEOFError，curl 却正常  | OpenSSL 3.5+ 的后量子握手包被中间设备掐断     | [SSLEOFError 排查](/faq/openssl-pq-handshake-eof)                                             |
| 429 并发报错                       | 触达并发配额上限                        | [API 可以开多少并发](/faq/api-concurrency)                                                         |
| 输出被截断、写到一半停                    | max\_tokens 未设或设得太小             | [max\_tokens 是什么](/faq/max-tokens)                                                          |
| 某个模型调不了                        | 账号权限未解锁，或令牌模型白名单限制              | [为什么有些模型用不了](/faq/model-availability) · [令牌可用模型](/faq/token-model-whitelist)                |
| 出图失败 / 返回空结果                   | 触发谷歌内容安全机制                      | [Nano Banana 出图失败](/faq/nano-banana-image-failure)                                          |
| Gemini 出图返回 NO\_IMAGE          | 成因与内容风控拦截不同，需单独排查               | [为什么返回 NO\_IMAGE](/faq/gemini-no-image)                                                     |
| 生成图与参考图差很多                     | 参考图需用 base64 格式上传               | [出图与参考图不符](/faq/image-result-differs-from-reference)                                        |
| 上传图片报 does not match MIME type | 图片 URL 末尾带了 CDN 处理参数            | [MIME 类型不匹配](/faq/image-mime-type-mismatch-with-query)                                      |
| 白底图出现黑点 / 脏块                   | AI Studio 通道纯白背景的已知表现           | [白底图脏块](/faq/white-background-image-artifacts)                                              |
| 想用任务 ID 查出图结果                  | 图片生成均为同步调用                      | [图片生成有异步接口吗](/faq/image-async-api)                                                          |
| 出图账单比预期高很多                     | 分辨率、质量、宽高比与张数直接放大输出 token       | [GPT Image 输出 token 为什么高](/faq/gpt-image-output-token-calculation)                          |
| Seedance 传人脸参考图被拦截             | 真人脸须先入库拿 `asset://`，并完成真人认证     | [人脸素材为什么被拦截](/faq/seedance2-face-asset-whitelist)                                           |
| 模型自称别家模型 / 说不出版本号              | 模型自我认知本就不可靠                     | [Claude 自称 Qwen](/faq/claude-identity-confusion) · [模型不知道自己版本](/faq/model-version-identity) |
| 官网聪明、API 变笨                    | 官网带系统提示词与工具链，API 是裸模型           | [网页版与 API 的差异](/faq/webapp-vs-api-difference)                                               |
| KEY 有陌生调用                      | KEY 可能已泄露，需定位去向并停用              | [排查莫名的 KEY 调用](/faq/troubleshoot-key-usage) · [安全管理 API Key](/faq/key-security-management)  |
| 账单对不上 / 看不懂扣了多少                | 按量与按次计费口径不同                     | [看懂日志计费金额](/faq/log-billing-explained) · [模型倍率](/faq/model-multiplier)                      |
| 图片视频下载很慢                       | 海外 CDN 在特定服务器上的链路问题             | [CDN 下载慢](/faq/cdn-download-slow)                                                           |
| 需不需要挂代理                        | 国内可直连，无需代理                      | [是否需要代理网络](/faq/network-proxy)                                                              |
| GitHub 登录提示「该账户已绑定」            | 该 GitHub 账户已绑到别的邮箱              | [GitHub 绑定报错](/faq/github-bindng-bindng-error)                                              |
| 忘记密码登不进去                       | 邮箱重置或联系客服找回                     | [忘记密码怎么办](/faq/forgot-password)                                                             |

***

## 📚 按主题浏览

### 🧭 网站功能介绍（4 篇）

| 问题                                                                          | 一句话答案                        |
| --------------------------------------------------------------------------- | ---------------------------- |
| [令牌与分组](/faq/token-and-groups)                                              | KEY 怎么建、分组怎么选                |
| [什么是分组？用户分组与令牌分组解析](/faq/groups-explained)                                  | 实际生效的始终是令牌上选的分组              |
| [Codex、ClaudeCode 和 Default 分组有什么区别？](/faq/codex-claudecode-default-groups) | 来源与协议各不相同，生产环境优先用 Default 官转 |
| [为什么 API易 没有一键对接功能？](/faq/one-click-integration)                            | 模型接入方式不统一，改用右上角 AI 助手        |

### 🔑 令牌与日志（11 篇）

| 问题                                                   | 一句话答案                              |
| ---------------------------------------------------- | ---------------------------------- |
| [如何创建 KEY？](/faq/token-management)                   | 控制台令牌页获取默认令牌或新建                    |
| [令牌需要设置可用模型吗？](/faq/token-model-whitelist)           | 可选，多项目隔离时建议设                       |
| [如何安全地管理 API Key？](/faq/key-security-management)     | IP 白名单、模型白名单与日常使用习惯                |
| [令牌的按量优先/按次计费有什么区别？](/faq/token-billing-modes)       | 五种计费模式各自的适用场景                      |
| [如何查看我的调用记录？](/faq/call-logs)                        | 控制台日志页查调用与计费明细                     |
| [Request ID 在哪里查看？](/faq/request-id-troubleshooting) | 按接口类型找响应头或响应体，别把任务 ID 当 Request ID |
| [怎么看懂日志里的计费金额？](/faq/log-billing-explained)          | 按量与按次口径不同，可用 usage 自算              |
| [调用日志保存多久？多久清理一次？](/faq/log-retention-policy)        | 当月加此前两个自然月，每月 5 日清理                |
| [日志的时区设置和数据导出要注意什么？](/faq/log-timezone-and-export)   | 账户时区保持 UTC+0，导出文件固定按 UTC+0         |
| [为方便排查问题，可以在后台看到详细日志吗？](/faq/user-logs-control)      | 管理员可临时开启详细日志                       |
| [如何排查莫名的 KEY 调用？](/faq/troubleshoot-key-usage)       | 按日志里的真实 IP 定位并及时停用                 |

### 🏢 企业服务（9 篇）

| 问题                                                                   | 一句话答案                |
| -------------------------------------------------------------------- | -------------------- |
| [什么是企业分组（Enterprise）？什么时候该用？](/faq/enterprise-group-vertex-fallback) | 模型专属分组，供给更稳但倍率略高     |
| [图片生成有快速线或企业线吗？](/faq/image-generation-fast-enterprise-route)        | 没有加速线，耗时主要来自模型推理本身   |
| [API易 的企业服务值得信任吗？模型保真吗？](/faq/enterprise-trust)                      | 纯透明官转，不路由、不降智、不换模型   |
| [企业客户和个人用户有什么区别？](/faq/enterprise-vs-individual)                     | 账号属性相同，差别在协作与议价政策    |
| [企业客户如何充值？](/faq/enterprise-recharge)                                | 推荐对公转账，可签框架合同、开增值税发票 |
| [高校客户如何无忧报销？](/faq/university-reimbursement)                         | 提供发票、采购清单、盖章等报销材料    |
| [APIYI 有 SLA 保障吗？](/faq/sla-guarantee)                               | 有，含异常计费补偿与额度补发       |
| [智能体小程序需要做算法备案吗？](/faq/agent-miniapp-algorithm-filing)               | 通常需要，本文说明一般流程        |
| [国内产品调用海外模型，合规备案怎么办？](/faq/overseas-model-compliance)                | 资质分层、备案现状与内容安全要点     |

### 💰 充值与安全（17 篇）

| 问题                                                      | 一句话答案                           |
| ------------------------------------------------------- | ------------------------------- |
| [价格和官网一样，为什么选择 API易？](/faq/official-pricing-advantages) | 同价但有充值加赠，可叠加分组折扣                |
| [为什么 API易 能比官网价格低？](/faq/why-cheaper-than-official)     | 规模化采购与厂商渠道分发，不是降智               |
| [系统里模型的【倍率】是什么？](/faq/model-multiplier)                 | 人民币计价单位，乘固定汇率得美元等效价             |
| [100 元人民币可以兑换多少算力？](/faq/rmb-to-computing-power)        | 充值按固定汇率 1 美元 = 7 元，算力兑换比例由你的系统定 |
| [API易支持缓存计费吗？](/faq/cache-billing)                      | 主流通道均支持，命中率因厂商而异                |
| [API 调用的预扣费机制是什么？](/faq/pre-deduction-quota)            | 请求前按预估扣，结束后按实际结算                |
| [为什么还有余额跑不通？](/faq/balance-insufficient)                | 预扣费判定或 max\_tokens 设得过大         |
| [如何设置余额告警提醒？](/faq/balance-alerts)                      | 邮件、群机器人、余额提醒 API 三选一            |
| [API易的余额会过期吗？有效期多久？](/faq/balance-validity-period)      | 365 天有效期，再次充值会重置全部余额            |
| [APIYI 支持哪些充值方式？](/faq/payment-methods)                 | 微信、支付宝、USDT、Stripe、PayPal 等     |
| [开票金额不足 100 美元怎么办？](/faq/invoice-minimum-amount)        | 建议多笔小额累计满 100 美元后合并开票           |
| [发票抬头填错了怎么办？可以重新开具吗？](/faq/invoice-reissue)             | 提交原发票与正确资料，红冲后重开                |
| [网站有什么充值活动吗？](/faq/recharge-promotions)                 | 首充加赠、阶梯加赠与发票服务                  |
| [如何申请代理合作？可以邀请好友返佣吗？](/faq/referral-program)            | 默认有邀请返佣，无需单独申请                  |
| [API易 的退款政策是怎样的？](/faq/refund-policy)                   | 退款条件、流程、手续费与发票说明                |
| [内容安全如何合规性？](/faq/content-safety)                       | 内容审核机制与违规处理措施                   |
| [API易如何保障数据安全？](/faq/data-security)                     | 加密传输、最小化存储、访问控制                 |

### ⚙️ 模型与调用（31 篇）

**选型与通用行为**

| 问题                                                                         | 一句话答案                |
| -------------------------------------------------------------------------- | -------------------- |
| [如何选择合适的 AI 模型？](/faq/model-selection-guide)                               | 按场景、成本、速度三维度选型       |
| [为什么有些模型我用不了？](/faq/model-availability)                                    | 部分模型需解锁权限后才可调用       |
| [有没有既能输出文本、又能生成图片的对话式 API？](/faq/text-and-image-in-one-api)                | 能看图和能出图是两回事，出图有四条路   |
| [Google 系模型走的是 AI Studio 还是 Vertex？](/faq/google-upstream-aistudio-vertex) | 默认分组走官转 AI Studio 线路 |
| [模型名称后缀 -c 是什么意思？](/faq/model-name-suffix-c)                               | 标识不同通道，计费有差别         |
| [为什么官方网页版和 API 返回结果不同？](/faq/webapp-vs-api-difference)                     | 官网带系统提示词，API 是裸模型    |
| [API 有类似 ChatGPT 的记忆能力吗？](/faq/api-memory)                                 | 没有，记忆是客户端读写的本地文件     |
| [为什么大模型不知道自己的版本号？](/faq/model-version-identity)                            | 模型自我认知不可靠，不能当依据      |
| [为什么 Claude 会自称 Qwen 或 DeepSeek？](/faq/claude-identity-confusion)          | 身份幻觉，不代表模型被换         |

**接入与参数**

| 问题                                                               | 一句话答案                              |
| ---------------------------------------------------------------- | ---------------------------------- |
| [Base URL 怎么填？/v1、根域名、/v1beta 有什么区别？](/faq/base-url-config)      | 按 OpenAI / Claude / Gemini 三种格式分别填 |
| [流式和非流式调用有什么区别？](/faq/streaming-vs-non-streaming)                | 由请求体的 `stream` 决定，内容与计费口径一致        |
| [max\_tokens 是什么？不设置会怎样？](/faq/max-tokens)                       | 控制最大输出长度，不设有默认值                    |
| [API 可以开多少并发？](/faq/api-concurrency)                             | 分模型类型限制，可申请提额                      |
| [如何避免接口超时？](/faq/timeout-configuration)                          | 放宽客户端 timeout，推理模型尤其慢              |
| [模型调用报错怎么排查？](/faq/model-error-troubleshooting)                  | 参数、鉴权、429、5xx、超时逐项对号入座             |
| [日志显示调用已完成并扣费，客户端却收不到响应，怎么排查？](/faq/log-duration-vs-client-wait) | 两个时钟量的不是同一段，先把差值测出来                |

**出图相关**

| 问题                                                                                             | 一句话答案                                                     |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [Nano Banana 系列出图失败，常见原因有哪些？](/faq/nano-banana-image-failure)                                  | 多数是触发谷歌内容安全机制                                             |
| [为什么 Gemini 图片接口返回 NO\_IMAGE？](/faq/gemini-no-image)                                           | 成因与风控拦截不同，需单独排查                                           |
| [白底图出现黑点 / 脏块 / 模糊色块怎么办？](/faq/white-background-image-artifacts)                               | 提示词改用浅色背景可规避                                              |
| [banana pro 改图后画面偏红怎么办？](/faq/banana-pro-edit-red-cast)                                        | 切换 Vertex 通道，或改用 `gpt-image-2`                            |
| [Nano Banana Pro 服装换装时印花变形如何优化？](/faq/nano-banana-pro-print-distortion)                        | 提示词、参考图权重与跨通道兜底                                           |
| [接入模型后生成的图片和参考图相差很大怎么办？](/faq/image-result-differs-from-reference)                             | 参考图必须用 base64 格式上传                                        |
| [怎么生成透明背景的图片（PNG 抠图）？](/faq/image-transparent-background)                                      | `gpt-image-2` 传 `background: "transparent"` 直接出带 alpha 的图 |
| [上传图片报 image content does not match MIME type 怎么解决？](/faq/image-mime-type-mismatch-with-query) | 去掉图片 URL 末尾的 CDN 处理参数                                     |
| [GPT Image 输出 token 为什么这么高？](/faq/gpt-image-output-token-calculation)                          | 分辨率、质量、宽高比与张数直接放大输出 token                                 |
| [用 Codex 接 GPT-Image 出图，报密钥认证失败怎么办？](/faq/gpt-image-incorrect-api-key-openai)                  | 报错来自 OpenAI，请求根本没到 API易                                   |
| [图片生成有异步接口吗？支持任务 ID 查询结果吗？](/faq/image-async-api)                                              | 均为同步调用，无任务 ID 查询                                          |

**视频相关**

| 问题                                                                     | 一句话答案                          |
| ---------------------------------------------------------------------- | ------------------------------ |
| [Seedance 视频任务提交后可以取消吗？](/faq/seedance-video-task-cancel)              | 接口没有取消能力，重点是别重复提交              |
| [如何按 task\_id 查一条 Seedance 视频的真实消费？](/faq/seedance-task-cost-lookup)   | 两条扣费记录与任务 quota 的对账口径          |
| [Seedance 2.0 调用时人脸参考图会自动上传素材库吗？](/faq/seedance2-asset-face-reference) | 不会，必须先入库拿 `asset://` 素材 ID 再引用 |
| [Seedance 2.0 / 2.5 人脸素材为什么被拦截？](/faq/seedance2-face-asset-whitelist)  | 真人脸需素材入库并完成真人认证                |

### 🌐 网络与连接（7 篇）

| 问题                                                              | 一句话答案                              |
| --------------------------------------------------------------- | ---------------------------------- |
| [使用 API 接口需要代理网络吗？](/faq/network-proxy)                         | 国内可直连，不需要代理或 VPN                   |
| [Python 报 SSLEOFError、curl 却正常？](/faq/openssl-pq-handshake-eof) | OpenSSL 3.5+ 的后量子握手包被中间设备掐断        |
| [API易的服务器在哪里？应该选择什么服务器？](/faq/server-location)                  | 节点分布、延迟测试与选购建议                     |
| [下载 CDN 图片/视频很慢怎么办？](/faq/cdn-download-slow)                    | 排查海外 CDN 在特定服务器上的链路                |
| [图片 API 延迟如何优化？](/faq/image-api-network-latency-optimization)   | 连接复用、HTTP/1.1 与超时设置                |
| [网站或接口返回 502 怎么办？](/faq/website-502-error)                      | 容器自动重启的短暂现象，约 1 分钟恢复，不计费，30 秒后重试即可 |
| [脚本报 502 但调用日志里查不到？](/faq/proxy-empty-502)                      | 本机代理自造的空 502，脚本绕开系统代理即可            |

### 👤 账号与登录（6 篇）

| 问题                                                         | 一句话答案                       |
| ---------------------------------------------------------- | --------------------------- |
| [API易 支持哪些邮箱注册？](/faq/email-registration)                  | Gmail、Outlook、Foxmail 及高校邮箱 |
| [如何使用 Passkey 登录？](/faq/passkey-login)                     | 个人中心绑定后可用指纹或面容登录            |
| [GitHub 登录提示「该账户已绑定」怎么办？](/faq/github-bindng-bindng-error) | 该 GitHub 账户已绑到其他邮箱          |
| [忘记密码了怎么办？](/faq/forgot-password)                          | 邮箱重置或联系客服协助找回               |
| [为什么提示 API Key 无效？](/faq/invalid-api-key)                  | Base URL 与 KEY 不配套是最常见原因    |
| [如何注销账户？](/faq/account-deletion)                           | 个人中心一键注销，数据不可恢复             |

***

## 💬 没找到答案？

<CardGroup cols={2}>
  <Card title="使用场景" icon="layout-grid" href="/scenarios">
    Cherry Studio、Claude Code、Cursor 等具体工具的接入指南
  </Card>

  <Card title="模型价格" icon="circle-dollar-sign" href="/models">
    全部模型的实时定价总表与详情页
  </Card>

  <Card title="实时动态" icon="radio-tower" href="/live/index">
    模型状态、供给变化、故障播报的每日更新
  </Card>

  <Card title="更新公告" icon="megaphone" href="/changelog">
    新模型上线、价格调整、功能更新的公告汇总
  </Card>
</CardGroup>

还是没解决？欢迎直接联系我们：

* 📧 **邮件咨询**：[support@apiyi.com](mailto:support@apiyi.com)
* 🌐 **访问控制台**：[api.apiyi.com](https://api.apiyi.com)
* 💰 **查看价格**：[价格页面](https://api.apiyi.com/account/pricing)

<Note>
  没找到的问题欢迎反馈给客服，我们会评估后补进 FAQ。新用户注册即可获得测试额度，可以先跑通再决定是否充值。
</Note>
