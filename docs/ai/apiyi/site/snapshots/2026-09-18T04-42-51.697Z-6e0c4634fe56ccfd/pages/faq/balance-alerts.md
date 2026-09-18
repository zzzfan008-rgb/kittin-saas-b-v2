> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何设置余额告警提醒？

> API易支持邮件、企业微信/钉钉/飞书群机器人、余额提醒 API 等多种告警方式，避免余额不足影响业务。

## 简短回答

API易支持**三种余额告警方式**：邮件通知（默认开启）、企业微信/钉钉/飞书等群机器人推送、以及自定义的余额提醒 API 接入。进入后台 **通知设置** 页面即可配置告警阈值和通知方式。

<Card title="前往通知设置" icon="settings" href="https://api.apiyi.com/account/notificationSettings">
  后台路径：**账户 → 通知设置**

  在此页面可配置告警阈值、启用/关闭各类通知渠道。
</Card>

## 告警方式详解

<CardGroup cols={3}>
  <Card title="邮件通知" icon="mail">
    **默认开启**

    余额低于阈值时，系统自动发送告警邮件到账户注册邮箱，无需额外配置。
  </Card>

  <Card title="群机器人" icon="bot">
    支持 **企业微信 / 钉钉 / 飞书** 等常用办公群的 Webhook 机器人，实时推送到团队群。
  </Card>

  <Card title="余额提醒 API" icon="code">
    支持接入自定义的**余额提醒 API**，便于对接自有监控系统或业务告警平台。
  </Card>
</CardGroup>

## 配置步骤

<Steps>
  <Step title="登录 API易后台">
    访问 [api.apiyi.com](https://api.apiyi.com) 并登录你的账户。
  </Step>

  <Step title="进入通知设置">
    在左侧菜单进入 **账户 → 通知设置**，或直接打开 [通知设置页面](https://api.apiyi.com/account/notificationSettings)。
  </Step>

  <Step title="设置余额预警阈值">
    配置余额低于多少时触发告警（例如余额少于 10 元时提醒），建议根据日均消耗合理设置，至少保留 3-7 天的使用量。
  </Step>

  <Step title="启用告警通知渠道">
    按需启用邮件、群机器人 Webhook 或余额提醒 API，并填写对应的通知地址 / Webhook URL。
  </Step>

  <Step title="测试告警是否生效">
    配置完成后，可通过测试按钮或临时调低阈值的方式验证告警是否正常触达。
  </Step>
</Steps>

## 告警渠道推荐

<Tip>
  **团队用户建议同时启用多渠道告警**

  * **个人开发者**：邮件通知即可
  * **小团队**：邮件 + 企业微信/钉钉/飞书群机器人
  * **企业用户**：邮件 + 群机器人 + 余额提醒 API（接入自有监控系统）
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么没有收到告警邮件？">
    请检查：

    1. 账户注册邮箱是否正确、能否正常收信
    2. 告警邮件是否被误判为垃圾邮件（查看垃圾箱）
    3. 在通知设置中确认**邮件通知**是否已开启
    4. 余额是否真的低于设置的告警阈值
  </Accordion>

  <Accordion title="群机器人如何获取 Webhook 地址？">
    * **企业微信**：群聊 → 群机器人 → 添加机器人 → 获取 Webhook URL
    * **钉钉**：群设置 → 智能群助手 → 添加机器人 → 自定义机器人 → 复制 Webhook
    * **飞书**：群设置 → 群机器人 → 添加机器人 → 自定义机器人 → 复制 Webhook 地址

    将获取到的 Webhook URL 填入通知设置对应的输入框即可。
  </Accordion>

  <Accordion title="余额提醒 API 如何使用？">
    余额提醒 API 允许你配置一个自定义的 HTTP 回调地址，当余额低于阈值时，系统会向该地址发送 POST 请求，便于你接入自有监控平台（如 Grafana、Prometheus、内部告警系统等）。

    具体接入方式请参考文档中心的 API 说明，或联系客服获取接入指引。
  </Accordion>

  <Accordion title="告警触发后多久会再次提醒？">
    系统默认有防打扰机制，避免短时间内重复推送相同告警。建议设置告警阈值后，及时完成充值，避免余额进一步降低导致业务中断。
  </Accordion>

  <Accordion title="可以设置多个告警阈值吗？">
    目前通知设置中可配置余额预警阈值，当余额低于该值时触发告警。如需更复杂的多级告警策略，可结合余额提醒 API 在自有系统中实现。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="为什么还有余额跑不通？" icon="credit-card" href="/faq/balance-insufficient">
    了解请求预扣机制，避免余额充足却调用失败
  </Card>

  <Card title="充值方式" icon="dollar-sign" href="/faq/payment-methods">
    查看 API易 支持的充值渠道与操作指南
  </Card>

  <Card title="充值优惠" icon="gift" href="/faq/recharge-promotions">
    了解最新的充值加赠活动，节省成本
  </Card>

  <Card title="调用日志" icon="file-text" href="/faq/call-logs">
    查看消费明细，分析余额消耗情况
  </Card>
</CardGroup>

<Info>
  **温馨提醒**

  余额告警只是辅助手段，建议同时定期关注账户余额与消费情况，尤其在业务高峰期或新接入模型时及时充值，避免因余额不足影响线上服务。
</Info>
