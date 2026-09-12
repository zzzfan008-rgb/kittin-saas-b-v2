> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API易 的企业服务值得信任吗？模型保真吗？

> 我们是纯透明官转代理，不路由、不降智、不偷换模型。本文从上线时长、流量数据、定价逻辑、数据安全等角度，给出可自行验证的信任依据。

## 简短回答

**值得，而且欢迎您自己验证，而不只是听我们口头保证。**

API易 是**纯透明官转代理**：请求只走可溯源的官方通道（如 Claude 默认走 AWS Bedrock 官方接入），**不路由到便宜模型、不降智、不偷换、不留存您的数据**。我们不是低价平台——低价的代价往往是您看不见的"掺水"。下面给出几条**可客观核验**的信任依据，您也可以先用小额度实测，逐步建立信任。

<Info>
  **我们完全理解这个担忧。**

  "中转站会不会把我的请求偷偷路由到便宜模型？"——这是每一位认真选型的企业都会问的问题。比起承诺，我们更愿意提供**可以验证的依据**和**可以实测的方式**。
</Info>

## 我们为什么不会"偷换便宜模型"

核心原因很简单：**我们的商业模式不靠掺水赚钱。**

<Warning>
  **"掺水"是低价平台才需要做的事**

  逆向破解、共享账号、模型降智、把贵模型悄悄替换成便宜模型——这些手段都能把价格压下来，但用的时候您完全不知道通道里掺了什么：输出质量时好时坏、随时可能断供，甚至您的对话数据被转卖也察觉不到。

  **价格越低，往往越不透明。** 低价平台几乎一定有您看不见的代价。
</Warning>

<Info>
  **API易 走的是另一条路：纯正官转，宁可贵一点也要干净**

  以 Claude 为例：我们默认走 **AWS Bedrock 官方接入**，替补走 **Anthropic 官方 Key 直连**，两条通道都是纯官转、可溯源、按量计费、不留存数据。综合成本约官网价 **85 折**（含充值加赠后约为 79–86 折区间）。

  我们的省钱来自**高缓存命中**（Claude 原生格式下的 Prompt Cache）和充值加赠，**不是来自降智或替换模型**。详见 [Claude API 基础说明](/api-capabilities/claude)。
</Info>

## 5 个可参考的信任依据

<CardGroup cols={2}>
  <Card title="上线满 2 年、月访问约 14.5 万" icon="chart-line">
    非新站点，已有一批长期复用的客户。
  </Card>

  <Card title="持续用心运维的文档中心" icon="book-open">
    上百篇文档与 FAQ 持续更新，是认真做平台的直接体现。
  </Card>

  <Card title="不走低价路线" icon="shield-check">
    纯正官转、约 85 折，宁可贵一点也要干净。
  </Card>

  <Card title="纯透明代理、不存数据" icon="lock">
    只做安全转发，不留存您的对话内容。
  </Card>
</CardGroup>

### 1. 上线时长与流量水平

API易 **上线已满 2 年**，并非临时搭建的新站点，背后是一批长期合作、持续复用的客户。第三方流量监测显示 `api.apiyi.com` **月访问约 14.5 万、域名注册满 2 年**：

<img src="https://mintcdn.com/apiyillc/dOkZIz7MGldG6ZGu/images/apiyi-traffic-similarweb.png?fit=max&auto=format&n=dOkZIz7MGldG6ZGu&q=85&s=81086e48816ad5859f399a3b78a03eb7" alt="第三方流量统计：api.apiyi.com 月访问约 14.5 万、域名注册满 2 年" style={{maxWidth: "560px"}} width="1016" height="1212" data-path="images/apiyi-traffic-similarweb.png" />

<Note>
  数据来自第三方流量监测工具，仅供参考。一个跑路或玩"掺水"套路的平台，很难维持两年稳定的访问量和持续的客户复用。
</Note>

### 2. 文档中心的专业度

您正在阅读的这套文档中心，本身就是平台是否"用心运维"的直接证据：上百篇 API 手册、模型说明、FAQ 持续更新，价格口径、计费规则、通道说明都摆在明处。**一个打算赚快钱的平台，不会花精力把这些讲清楚。**

### 3. 价格上，我们不是低价平台

一句话理解我们的定价：**约 85 折用纯官转的 AWS Claude，质量可靠，靠高缓存命中省钱。**

我们并不是卖得贵，而是把价格守在"稳定可靠"与"价格合理"之间那条线上——**不碰来路不明的便宜货**。如果一个平台的价格低到离谱，请务必警惕：那部分差价，很可能就是用您看不见的方式补回来的。

详见 [Claude API 基础说明](/api-capabilities/claude)。

### 4. 数据安全：纯透明代理，不留存数据

API易 是**纯透明代理**：我们的职责是安全、高效地把请求转发给上游官方通道，**不留存您的对话内容**。这一点既是隐私保障，也从根本上决定了我们没有动机去"动"您的请求。

详见 [API易如何保障数据安全？](/faq/data-security)。

### 5. 信任是逐步建立的

我们不要求您一上来就大额投入。**信任应该建立在验证之上**：

<Tip>
  **建议的合作节奏**

  1. 先充 **\$10 小额度**，跑通您真实的业务场景；
  2. 对比官方输出、查看调用日志，确认质量与计费符合预期；
  3. 确认无误后，再逐步加量、长期合作。

  这样您的每一步投入都建立在已验证的结果之上，风险可控。
</Tip>

## 如何自行验证"模型是否保真"

与其只听保证，您完全可以**自己动手核验**：

<Steps>
  <Step title="小额度实测对比">
    用 **\$10 小额度**跑真实任务，把输出与官方渠道做横向对比，看质量是否一致、稳定。
  </Step>

  <Step title="查看调用日志">
    在控制台查看每次调用的模型、tokens 消耗与计费明细，做到账目透明、可追溯。详见 [如何查看调用日志？](/faq/call-logs)。
  </Step>

  <Step title="验证缓存与计费">
    Claude 使用 **Anthropic 原生格式**（`/v1/messages`）时可触发缓存计费，长上下文/重复 system prompt 场景账单会明显降低——这是官转通道才有的特性。详见 [Claude API 基础说明](/api-capabilities/claude)。
  </Step>
</Steps>

<Note>
  如果您是月消耗较大的企业客户，也可以联系我们约定 SLA 保障与额度补偿条款，把责任边界写进合同。详见 [APIYI 有 SLA 保障吗？](/faq/sla-guarantee)。
</Note>

## 相关文档

<CardGroup cols={2}>
  <Card title="API易如何保障数据安全？" icon="lock" href="/faq/data-security">
    纯透明代理、最小化存储与访问控制
  </Card>

  <Card title="Claude API 基础说明" icon="sparkles" href="/api-capabilities/claude">
    纯官转 AWS Claude、约 85 折与缓存计费
  </Card>

  <Card title="APIYI 有 SLA 保障吗？" icon="shield-check" href="/faq/sla-guarantee">
    异常计费补偿与企业合同约定
  </Card>

  <Card title="企业客户和个人用户有什么区别？" icon="building-2" href="/faq/enterprise-vs-individual">
    企业账号、多令牌与内部共享
  </Card>
</CardGroup>

## 联系我们

<Card title="企业微信客服" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  企业选型评估、小额测试对接、SLA 与合同条款等需求，欢迎联系：

  * [联系企业微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * 邮箱：[hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
