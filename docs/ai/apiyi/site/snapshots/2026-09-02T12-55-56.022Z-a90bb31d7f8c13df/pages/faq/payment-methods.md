> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI 支持哪些充值方式？

> API易 支持微信 / 支付宝 / USDT / Stripe（外币信用卡）等在线自助充值，以及 PayPal / Wise / Mercury Bank / 对公转账等人工充值，覆盖国内外个人与企业用户，支持开具中文增值税发票与美国 Invoice。

## 简短回答

API易 目前共支持 **7 种主流充值方式**，分两类：

* **🟢 在线自助充值**（站内一键到账）：**微信、支付宝、USDT、Stripe（外币信用卡）**
* **🛠️ 人工充值**（联系客服后台到账）：**PayPal、Wise、Mercury Bank、对公转账**

可开具 **中国公司增值税发票** 或 **美国公司 Invoice**（法律实体涵盖中国 + 美国双主体），适配国内外财务流程。

## 支付方式总览

| 支付方式             | 操作办法                                                           | 充值方式                           | 适用人群        |
| ---------------- | -------------------------------------------------------------- | ------------------------------ | ----------- |
| **微信**           | 站内在线，仅支持**中国用户**                                               | 在线自助                           | 国内个人        |
| **支付宝**          | 站内在线，支持**国际版支付宝**、海外账号付款                                       | 在线自助                           | 国内 + 海外华人   |
| **USDT**         | 站内在线，加密货币，**全球用户**均可支付；手续费约 **2 USDT/次**（如自备能量更省，大额转账同样为一次性费用） | 在线自助                           | 全球，币圈用户     |
| **Stripe**       | 站内在线，**外币信用卡**（实时到账，3D Secure 风控）；**单笔最低 \$50**                | 在线自助                           | 海外个人 / 企业   |
| **PayPal**       | 转账到指定账户地址，**手续费约 6%**，用户自理                                     | 联系客服给 PayPal 账号，人工充值           | 海外个人        |
| **Wise**         | 转账到指定账户地址，WISE 收款                                              | 联系客服给 Wise 账号，人工充值             | 海外企业 / 跨境个人 |
| **Mercury Bank** | 转账到指定账户地址，**一般无手续费**，**自动开具 Invoice**                          | 联系客服给银行付款链接（Payment Link），人工充值 | 海外企业首选      |

## 🟢 在线自助充值（实时到账）

<CardGroup cols={2}>
  <Card title="微信支付" icon="wechat" iconType="brands">
    站内一键扫码支付，**仅支持中国大陆用户**。最常用、最快捷的国内充值方式。
  </Card>

  <Card title="支付宝" icon="alipay" iconType="brands">
    站内在线，**国际版支付宝 / 海外账号**均可付款，国内外华人用户友好。
  </Card>

  <Card title="USDT 加密货币" icon="bitcoin">
    站内在线，**全球可用、24/7 不限地区**。手续费约 **2 USDT/次**，大额转账同样为单次费用，自备 TRON 能量可进一步压缩成本。

    支持网络：**TRC20**（推荐）、**Solana** 等主流公链。
  </Card>

  <Card title="Stripe（外币信用卡）" icon="credit-card">
    站内在线，支持**外币信用卡**支付，**实时到账**，自带 3D Secure 风控。请使用**公司 / 个人 / 学校**名下的实名信用卡。

    ⚠️ **单笔最低 \$50**：充值金额未达 \$50 时，Stripe 通道不可选。

    📖 [门槛调整公告](/live/2026-07/stripe-minimum-topup-50) · [上线公告](/live/2026-05/stripe-payment-launch)
  </Card>
</CardGroup>

<Warning>
  **Stripe 安全提示**：Stripe 风控等级高，**不安全 / 非实名的信用卡会被直接拒绝**；**恶意支付**（盗卡、拒付、欺诈测试等）的账号将被**封号处理**。请勿用他人卡片或测试卡尝试。
</Warning>

## 🛠️ 人工充值（联系客服后台入账）

<CardGroup cols={2}>
  <Card title="PayPal" icon="paypal" iconType="brands">
    转账到客服提供的 PayPal 账号。**手续费约 6%，由用户自理**（即转账金额需含手续费）。适合海外个人小额充值。
  </Card>

  <Card title="Wise（原 TransferWise）" icon="globe">
    转账到客服提供的 Wise 收款账户。汇率透明、跨境到账快，适合**跨境工作者与海外企业**。
  </Card>

  <Card title="Mercury Bank（推荐海外企业）" icon="landmark">
    转账到客服提供的银行账户（含 Payment Link）。**一般无手续费**，**到账后自动开具 Invoice**，海外企业财务最友好。
  </Card>

  <Card title="对公转账（银行电汇）" icon="building">
    适合**中国公司客户**或**通过中国贸易伙伴付款的海外企业**（详见下方跨境方案）。
  </Card>
</CardGroup>

<Tip>
  **人工充值流程**：1️⃣ 联系客服获取收款账户 → 2️⃣ 完成转账 → 3️⃣ 提供转账凭证 / Hash / Payment Link 截图 → 4️⃣ 客服核对后充值到账。
</Tip>

## 🌏 跨境贸易 / 海外客户付款方案

对于**俄罗斯、中亚、东南亚**等需要走中国贸易伙伴付款的海外客户，我们提供完整的合规付款链路：

<Steps>
  <Step title="与中国公司签订合同">
    海外客户与 API易 的**中国法律实体**签订采购 / 服务合同，明确金额、币种、付款方式。
  </Step>

  <Step title="对公付款（银行转账）">
    通过对公账户\*\*银行转账（电汇 / SWIFT / RUB 跨境结算）\*\*支付服务费至我方对公账户。
  </Step>

  <Step title="人工充值到 APIYI 账户">
    我方财务收到费用后，**人工充值到客户的 APIYI 后台账户**，余额即可用于 API 调用。
  </Step>

  <Step title="开具发票 / Invoice">
    可开具**中国增值税发票**（中国法律实体）或**美国 Invoice**（美国法律实体），适配客户当地财务报销需求。
  </Step>
</Steps>

<Info>
  **法律实体说明**：API易 的运营主体涵盖 **中国公司 + 美国公司** 两个法律实体，可根据客户所在地与财务需求灵活开票。具体抬头、税号请联系客服获取。
</Info>

## 🧾 发票 / Invoice 开具

| 开票类型                | 适用法律实体 | 适用场景              |
| ------------------- | ------ | ----------------- |
| **中国增值税普通 / 专用发票**  | 中国公司   | 国内企业财务报销          |
| **美国 Invoice（PDF）** | 美国公司   | 海外企业 / 跨境贸易 / 走外汇 |

<Tip>
  **开票提醒**：发票需求请在**付款时或付款前**告知客服（提供抬头 / 税号 / 邮箱），方便我们一次开具完整；后补开票可能涉及跨账期处理。
</Tip>

## 充值优惠与赠送

不同充值通道与金额可叠加**首充加赠 / 充值赠送活动**，最高可达近 8 折效果。

📖 详见：[充值优惠政策](/faq/recharge-promotions)

## 常见问题

<AccordionGroup>
  <Accordion title="Stripe 支付报错 / 信用卡被拒怎么办？">
    Stripe 风控较严，可能的原因：

    * **充值金额未达 \$50**（Stripe 通道仅在单笔 \$50 及以上时可选）
    * **使用了人民币信用卡**（Stripe 不接受 CNY 卡）
    * **未实名 / 非本人 / 非企业 / 非学校**名下的信用卡
    * **3D Secure 验证未通过**
    * 卡片或账号被风控标记

    建议改用其他通道（支付宝国际 / Wise / Mercury Bank），或更换合规的实名外币信用卡。**请勿用他人卡或测试卡反复尝试，避免触发账号风控。**
  </Accordion>

  <Accordion title="对公转账多久到账？">
    工作日通常**当日内**人工充值到账（依银行清算时间，部分跨境电汇可能 T+1 \~ T+3）。请在转账后**主动将凭证发给客服**，加快入账。
  </Accordion>

  <Accordion title="USDT 充值要选哪个网络？">
    推荐 **TRC20**（TRON 网络），手续费低、到账快；也支持 **Solana** 等主流公链。**请务必通过客服 / 站内界面获取最新收款地址**，不要相信任何第三方来源。
  </Accordion>

  <Accordion title="可以开具中文增值税专用发票吗？">
    可以。中国法律实体支持**增值税普通发票**和**增值税专用发票**，请在付款时把**公司抬头、税号、开户行、地址电话**等信息一并告知客服。
  </Accordion>

  <Accordion title="俄罗斯 / 中亚客户没有信用卡也没有支付宝怎么办？">
    走 **对公转账方案**：与我方**中国法律实体签订合同**，通过本地贸易公司或银行 SWIFT 电汇人民币 / 美元 / 卢布到我方对公账户，到账后我们**人工充值到您的 APIYI 后台账户**并开具中国增值税发票或美国 Invoice。具体流程联系客服。
  </Accordion>

  <Accordion title="是否支持其他加密货币？BTC / ETH？">
    目前默认支持的稳定币是 **USDT**（TRC20 / Solana）。如需 USDC、BTC、ETH 等其他币种，请联系客服评估。
  </Accordion>

  <Accordion title="有最低 / 最高充值限额吗？">
    **最低充值金额**：

    * **Stripe**：单笔 **\$50** 起（受 Stripe 手续费与结算结构影响，2026/7/28 起调整，未达该金额时通道不可选）
    * **其他支付方式**：单笔 **\$5** 起，不受影响

    **最高**：各通道无统一硬性限额，但部分通道（如 PayPal、Stripe）单笔有上游风控阈值；**大额（建议 ≥ 10000 元 / \$1500）** 建议先联系客服走对公或 Mercury Bank 通道，省手续费、便于开票。
  </Accordion>
</AccordionGroup>

## 联系客服 / 获取收款账户

<CardGroup cols={2}>
  <Card title="企业微信客服（推荐）" icon="phone" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加或点击进入企业微信对话，**获取所有人工充值通道账户**。
  </Card>

  <Card title="官方邮箱" icon="mail" href="mailto:hi@apiyi.com">
    **[hi@apiyi.com](mailto:hi@apiyi.com)**

    适合正式商务沟通、发票开具、大额对公付款合同洽谈、企业合作。
  </Card>
</CardGroup>

<Warning>
  **资金安全提醒**：所有对公账户、USDT 地址、PayPal / Wise / Mercury Bank 收款账户**仅通过官方客服渠道获取**，请勿相信任何第三方提供的"客服"或地址，避免资金损失。
</Warning>

## 相关文档

<CardGroup cols={2}>
  <Card title="充值优惠政策" icon="gift" href="/faq/recharge-promotions">
    首充加赠、阶梯返利、教育用户优惠
  </Card>

  <Card title="为什么余额跑不通？" icon="circle-question-mark" href="/faq/balance-insufficient">
    余额异常排查 / 计费模式说明
  </Card>

  <Card title="邀请返佣 5% 政策" icon="users" href="/faq/referral-program">
    持续 5% 额度返利与划转流程
  </Card>

  <Card title="退款政策" icon="rotate-ccw" href="/faq/refund-policy">
    余额退款规则与申请流程
  </Card>
</CardGroup>
