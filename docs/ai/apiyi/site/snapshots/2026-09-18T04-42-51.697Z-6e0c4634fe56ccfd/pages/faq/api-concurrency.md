> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API 可以开多少并发？

> 了解不同类型模型的并发限制规则，以及如何申请更高并发配额

## 简短回答

**并发限制因模型类型而异**，文本模型并发最高，图片模型有适度控制。

<Info>
  **重要说明**

  并发限制是针对**单一模型**，而不是整个账号。例如，Nano Banana Pro 模型有 30 个并发，不影响其他模型的并发使用。
</Info>

## 不同模型类型的并发限制

<CardGroup cols={3}>
  <Card title="文本类模型" icon="file-text">
    **默认：50 次/秒**

    * ✅ 高并发支持
    * ✅ 适合批量处理
    * 🔓 可申请更高额度
  </Card>

  <Card title="视频异步模型" icon="video">
    **默认：高并发**

    * ✅ 异步处理机制
    * ✅ 支持大规模调用
    * 📊 适合批量视频生成
  </Card>

  <Card title="图片类模型" icon="image">
    **默认：30 次/秒**

    * ⚠️ 有并发控制
    * 📦 Base64 大数据传输
    * 🔓 可申请调整
  </Card>
</CardGroup>

## 为什么图片模型有并发控制？

<Warning>
  **技术原因**

  图片生成 API 使用 **Base64 编码**传输图像数据，单次请求数据体积较大（通常 500KB-5MB）。为保证服务稳定性和响应速度，需要适度控制并发。

  **示例**：Nano Banana Pro 模型默认 30 个并发，已满足大多数使用场景。
</Warning>

## 并发计算方式

### 按单一模型计算

并发限制是针对**每个具体模型**，而非整个账号：

| 场景     | 并发计算方式                          |
| ------ | ------------------------------- |
| 调用同一模型 | 受该模型并发限制（如 Nano Banana Pro 30次） |
| 调用不同模型 | 各模型独立计算，互不影响                    |
| 多个令牌   | 每个令牌独立计算并发                      |

<Tip>
  **实际示例**

  假设您同时使用：

  * Nano Banana Pro（图片）：30 个并发
  * GPT-4o mini（文本）：50 个并发
  * FLUX.1 Pro（图片）：30 个并发

  **总计可用并发**：110+ 次（各模型独立）
</Tip>

## 如何申请更高并发？

### 个人用户

<Steps>
  <Step title="评估实际需求">
    确定您需要的并发量级和使用场景
  </Step>

  <Step title="联系客服申请">
    通过[企业微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)说明需求
  </Step>

  <Step title="技术评估">
    我们会根据您的使用场景和历史数据评估
  </Step>

  <Step title="调整配额">
    审核通过后，为您的令牌调整并发限制
  </Step>
</Steps>

### 企业客户

<Info>
  **专线保障服务**

  企业客户可申请专线保障，享受：

  * 🚀 **更高并发配额**：根据业务需求定制
  * 🔒 **独立资源池**：不受公共流量影响
  * ⚡ **优先调度**：保证响应速度
  * 📞 **专属技术支持**：一对一服务

  联系我们了解企业服务方案。
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么文本模型并发比图片模型高？">
    文本模型的请求和响应数据量较小（通常几 KB），而图片模型传输 Base64 编码的图像数据（通常 500KB-5MB），为保证整体服务质量需要控制并发。
  </Accordion>

  <Accordion title="如何知道当前并发配额？">
    可以通过以下方式查看：

    * 后台控制台查看令牌配置
    * API 响应头中的 Rate Limit 信息
    * 联系客服查询具体配额
  </Accordion>

  <Accordion title="超出并发限制会怎样？">
    超出并发限制时，API 会返回 `429 Too Many Requests` 错误。建议：

    * 实现请求队列管理
    * 添加重试机制（指数退避）
    * 申请更高并发配额
  </Accordion>

  <Accordion title="不同令牌的并发是否共享？">
    不共享。每个令牌有独立的并发配额，互不影响。如需更高总并发，可以创建多个令牌分散请求。
  </Accordion>

  <Accordion title="调整并发配额需要额外费用吗？">
    一般情况下，合理的并发调整**不收取额外费用**。但极高并发或专线服务可能涉及企业定制方案，具体请咨询客服。
  </Accordion>
</AccordionGroup>

## 并发优化建议

<CardGroup cols={2}>
  <Card title="使用请求队列" icon="list">
    实现本地队列管理，控制同时发送的请求数量，避免超限
  </Card>

  <Card title="错误重试机制" icon="refresh-cw">
    遇到 429 错误时，使用指数退避策略重试
  </Card>

  <Card title="多令牌分散" icon="key">
    创建多个令牌，将请求分散到不同令牌，提升总并发
  </Card>

  <Card title="异步处理优先" icon="clock">
    对于非实时场景，优先使用异步 API（如视频生成）
  </Card>
</CardGroup>

## 联系我们

如需申请更高并发配额或咨询企业专线服务：

<CardGroup cols={3}>
  <Card title="邮件支持" icon="mail">
    [feedback@apiyi.com](mailto:feedback@apiyi.com)

    详细描述您的并发需求
  </Card>

  <Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加 或 [点击联系客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    快速响应，实时沟通
  </Card>

  <Card title="Telegram" icon="send">
    @apiyi001

    即时消息，高效解答
  </Card>
</CardGroup>

<Tip>
  **申请时请提供**：

  * 📊 **使用场景**：具体应用（如电商批量出图、内容审核等）
  * 📈 **预期并发**：需要的并发量级
  * 🕐 **高峰时段**：主要使用时间段
  * 📜 **历史数据**：当前调用量和频率

  这些信息有助于我们为您提供最合适的并发配额方案。
</Tip>
