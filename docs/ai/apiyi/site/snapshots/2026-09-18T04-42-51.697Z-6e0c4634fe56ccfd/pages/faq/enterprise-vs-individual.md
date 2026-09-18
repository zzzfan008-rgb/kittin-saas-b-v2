> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 企业客户和个人用户有什么区别？

> API易企业客户与个人用户在账号属性上没有区别，本文说明企业常用的多令牌管理、服务群对接、内部共享与议价政策。

## 简短回答

**在账号属性上，企业客户和个人用户没有任何区别——注册后即是用户，使用同一套后台和接口。**

区别只在于"使用方式"：企业通常会通过多令牌区分部门、对接企业微信服务群、在内部共享账号等方式来更好地协作。价格对所有用户公开透明，没有单独议价。

## 账号属性：完全一致

API易不区分"企业版"和"个人版"。无论是个人开发者还是企业团队，注册后获得的都是同一种账号，享有相同的：

* 400+ 模型访问权限
* 统一的 `https://api.apiyi.com` 接口
* 相同的控制台、令牌管理与日志功能
* 相同的公开价格

<Info>
  企业无需单独开通"企业账号"，直接注册即可。下面介绍的是企业在实际使用中的常见做法。
</Info>

## 企业常用的使用方式

<CardGroup cols={2}>
  <Card title="多令牌区分部门 / 员工" icon="key">
    通过创建多个令牌（KEY），把不同部门或员工的用量隔离开，便于分别统计消耗、控制额度和管理权限。
  </Card>

  <Card title="企业微信服务群" icon="message-circle">
    可联系 API易 售后及运营，创建专属的企业微信服务群，协助接口对接和日常答疑。
  </Card>

  <Card title="内部共享账号" icon="users">
    报销或付款人不同的场景，可在企业内部共享账号密码，由统一的账号集中管理充值与用量。
  </Card>

  <Card title="消耗日志查询" icon="file-text">
    不登录后台也能查询某个 KEY 的消耗日志，方便财务或非技术同事核对用量。
  </Card>
</CardGroup>

### 1. 通过多令牌区分部门或员工

企业可以在控制台创建多个令牌（KEY），把它们分配给不同的部门或员工使用。这样做的好处：

* **用量隔离**：每个令牌的消耗独立统计，便于内部核算
* **额度控制**：可为单个令牌设置余额上限和有效期
* **权限管理**：某个令牌泄露或离职时，单独禁用即可，不影响其他业务

详细的令牌创建方法见 [如何创建 KEY？](/faq/token-management)。

### 2. 对接企业微信服务群

企业客户可以联系 API易 售后及运营团队，创建专属的**企业微信服务群**，由我们协助企业完成接口对接、解决日常使用问题。

<Tip>
  基础问题（如令牌创建、计费规则、模型选择、常见报错）建议**优先查阅本文档**，能更快得到答案；文档未覆盖或企业级的对接问题，再通过服务群沟通，效率更高。
</Tip>

### 3. 内部共享账号与消耗查询

企业常遇到"使用人、报销人、付款人不是同一个人"的情况。API易的处理方式很简单：

* **共享账号密码**：可在企业内部共享同一个账号，由统一的账号集中充值、管理令牌
* **免登录查询消耗**：如果不方便登录后台，也可以通过查询页面核对某个 KEY（令牌）的消耗日志

<Card title="令牌消耗查询页面" icon="search" href="https://api.apiyi.com/query">
  无需登录即可查询：[https://api.apiyi.com/query](https://api.apiyi.com/query)

  输入令牌（KEY）即可查看其消耗日志，方便财务或非技术同事核对用量。
</Card>

## 企业客户有单独议价吗？

**没有。我们的价格公开透明，对所有用户一视同仁。**

API易唯一的优惠形式是**充值加赠活动**，我们推荐企业客户参与，长期使用更划算。

<Info>
  **关于我们**：API易是已稳定运营两年的站点，正规团队交付，长期可靠服务。价格统一公开，省去了反复议价的沟通成本——这本身也是对企业客户的一种确定性保障。
</Info>

充值加赠活动详情见 [充值优惠活动](/faq/recharge-promotions)。

## 相关文档

<CardGroup cols={2}>
  <Card title="如何创建 KEY？" icon="key" href="/faq/token-management">
    多令牌管理的完整说明
  </Card>

  <Card title="如何查看调用日志？" icon="file-text" href="/faq/call-logs">
    用量与消耗的查询方式
  </Card>

  <Card title="充值优惠活动" icon="gift" href="/faq/recharge-promotions">
    充值加赠活动详情
  </Card>

  <Card title="支持哪些充值方式？" icon="credit-card" href="/faq/payment-methods">
    对公转账等付款方式
  </Card>
</CardGroup>

## 联系我们

<Card title="企业微信客服" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  企业对接、服务群申请等需求，欢迎联系：

  * [联系企业微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * 邮箱：[hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
