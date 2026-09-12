> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 100 元人民币可以兑换多少算力？

> API易仅提供模型服务与对应定价，人民币与算力的兑换比例由客户系统自行决定。

## 简短回答

API易无法直接给出“100 元人民币可以兑换多少算力”的标准答案。

`算力`通常是客户在自己平台中定义的计量单位，其与人民币的兑换比例、扣减规则和消耗方式均由客户自行设计。API易作为模型服务提供商，不了解也不会干预客户系统内部的算力规则。

## 为什么 API易无法确定兑换比例？

API易提供的是模型调用服务以及对应的模型价格，本身并不提供：

* 人民币与算力的换算规则
* 客户后台的算力扣减逻辑
* 用户充值的最终计费单位

因此，是否将 1 元设置为 10 算力、100 算力或其他比例，都由客户的平台规则和业务策略决定。

## 如何自行设置算力消耗规则？

如果你计划在自己的后台中为用户配置算力消耗，可以参考以下要点：

* **参考模型价格**：根据 API易的模型定价估算每次调用的成本
* **设定兑换比例**：自行决定 1 元对应多少算力
* **设计扣减规则**：按模型、调用方式、输入输出 Token 等维度配置消耗
* **结合运营策略**：根据你的服务定位和利润空间进行动态调整

<Info>
  API易只提供模型调用本身的价格信息，不提供客户的算力换算建议。请基于你自己的产品定位、运营成本和定价策略进行配置。
</Info>

## 模型价格说明

API易的模型价格大致分为以下几类：

* **图片模型**：部分模型提供特价
* **文本模型**：价格通常与模型官网保持一致
* **充值优惠**：更多折扣请关注平台当前的充值活动

具体价格以登录 API易 平台后展示的为准。

## 相关问题

<CardGroup cols={2}>
  <Card title="模型倍率说明" icon="calculator" href="/faq/model-multiplier">
    了解不同模型的计费倍率与 Token 换算方式。
  </Card>

  <Card title="充值方式" icon="dollar-sign" href="/faq/payment-methods">
    查看 API易 支持的充值方式与到账时效。
  </Card>

  <Card title="充值优惠" icon="gift" href="/faq/recharge-promotions">
    了解当前可用的充值活动与折扣规则。
  </Card>

  <Card title="余额不足怎么办？" icon="credit-card" href="/faq/balance-insufficient">
    处理调用过程中余额不足的提示与建议。
  </Card>
</CardGroup>
