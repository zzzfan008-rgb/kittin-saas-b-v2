> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何注销账户？

> 在 API易 个人中心可一键注销账户，注销后所有用户资料、调用日志、充值记录将永久丢失，请审慎操作。

## 简短回答

登录 API易 后台，进入 **个人中心** 页面 `api.apiyi.com/account/profile`，在页面底部「账户选项」区域点击 **注销** 按钮，按提示完成二次确认即可。

<Warning>
  **注销不可恢复**：账户一旦注销，所有的**用户资料、调用日志、充值记录、余额**都将永久丢失，无法恢复。意外注销由用户自行承担，平台不负责数据恢复。请在操作前务必确认。
</Warning>

## 操作入口

注销入口位于 **个人中心 → 账户选项** 区域，与「修改密码」「系统令牌」「访问令牌」并列：

<img src="https://mintcdn.com/apiyillc/Az0T-cmcmXqc4ycr/images/account-deletion-button.png?fit=max&auto=format&n=Az0T-cmcmXqc4ycr&q=85&s=36f570e399cf0f60267c39c9a70f3a25" alt="账户注销按钮位置" width="1140" height="258" data-path="images/account-deletion-button.png" />

## 操作步骤

<Steps>
  <Step title="进入个人中心">
    登录 API易 后台后，访问个人中心页面：

    ```
    https://api.apiyi.com/account/profile
    ```
  </Step>

  <Step title="找到「账户选项」区域">
    滚动到页面**底部**，找到「账户选项」分组。
  </Step>

  <Step title="点击「注销」按钮">
    点击红色的 **注销** 按钮（带垃圾桶图标）。
  </Step>

  <Step title="完成二次确认">
    系统会弹出二次确认提示，请仔细阅读后再确认。**确认后立即生效，无法撤销。**
  </Step>
</Steps>

## 注销前请务必确认

<CardGroup cols={2}>
  <Card title="账户余额" icon="wallet" color="#ef4444">
    余额将一并清零，且**不支持退款**。如有余额，建议提前消耗或申请退款。
  </Card>

  <Card title="调用日志" icon="file-text" color="#ef4444">
    所有历史调用记录将被删除，无法用于后续对账或审计。
  </Card>

  <Card title="充值记录" icon="receipt" color="#ef4444">
    历史充值发票、订单记录将一并丢失，请提前导出或开票。
  </Card>

  <Card title="API Key" icon="key" color="#ef4444">
    所有系统令牌、访问令牌将立即失效，正在运行的业务会立刻中断。
  </Card>
</CardGroup>

<Tip>
  **建议**：注销前先检查是否有未开发票的充值订单、未导出的调用日志，以及正在调用 API 的线上业务。
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="注销后还能用同一个邮箱重新注册吗？">
    一般情况下注销后释放邮箱，可重新注册新账户，但**新账户与原账户无任何关联**：原账户的余额、日志、充值记录、优惠资格不会迁移。如有特殊需求，请通过客服微信咨询。
  </Accordion>

  <Accordion title="账户有余额，注销后能退款吗？">
    注销前如需退款，请先按 [退款政策](/faq/refund-policy) 申请并完成退款，再进行注销操作。**一旦注销，余额无法找回，也不再受理退款。**
  </Accordion>

  <Accordion title="点错了「注销」按钮，能撤销吗？">
    系统设置了二次确认，仅点击「注销」按钮**不会立即注销**。但一旦完成二次确认，操作即刻生效且**无法撤销**。请在二次确认弹窗中仔细阅读后再点击确认。
  </Accordion>

  <Accordion title="不想用了，但又怕将来要用，有别的办法吗？">
    如果只是**暂时不用**，无需注销账户：

    * 可以在「系统令牌」中**禁用或删除 API Key**，避免被误用
    * 余额会保留在账户中，下次登录可继续使用
    * 这样既保留了历史记录和资料，也避免了未来重新注册的麻烦
  </Accordion>

  <Accordion title="忘记密码，无法登录后台，如何注销？">
    请先按 [忘记密码怎么办？](/faq/forgot-password) 找回账户，登录后再进行注销操作。如无法找回，请通过客服微信联系我们协助处理。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="退款政策" icon="rotate-ccw" href="/faq/refund-policy">
    注销前先了解余额退款规则
  </Card>

  <Card title="忘记密码怎么办？" icon="key" href="/faq/forgot-password">
    密码找回与重置流程
  </Card>

  <Card title="数据安全说明" icon="shield" href="/faq/data-security">
    了解 API易 的数据安全与隐私政策
  </Card>

  <Card title="调用日志查询" icon="file-text" href="/faq/call-logs">
    注销前可先导出历史调用记录
  </Card>
</CardGroup>
