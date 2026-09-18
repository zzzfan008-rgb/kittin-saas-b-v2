> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 为方便排查问题，可以在后台看到详细日志吗？

> 了解管理员如何协助排查问题时开启详细日志记录功能

## 默认隐私保护策略

出于隐私安全考虑，API易默认**不存储**客户的输入和输出内容，只做透明代理的转发。

这意味着：

* ✅ 您的数据隐私得到最大程度保护
* ✅ 减少数据存储成本
* ✅ 符合数据安全最佳实践
* ❌ 管理员后台无法查看具体的对话内容

## 批量调用场景的问题

很多客户在跑批处理时会遇到这样的困扰：

<Warning>
  **典型问题场景**

  "后台能把用户的输入放进去吗？不然跑批的时候根本区分不出来哪次调用对应哪个任务啊！"

  批量处理时，如果没有详细的输入输出记录，确实很难追踪具体是哪个任务出了问题。
</Warning>

## 管理员协助排查功能

如果您遇到问题需要技术支持协助排查，我们可以**临时开启**详细日志记录功能，由管理员协助定位问题。

<Info>
  **重要说明**

  * 这个功能仅在**管理员后台**开启，客户无法自主控制
  * 详细日志内容**仅管理员可见**，不会透出给客户
  * 这是一个配合协助问题排查的功能，非常规使用
</Info>

### 如何请求开启

<Steps>
  <Step title="联系客服说明问题">
    通过客服渠道（Telegram、邮件等）详细描述遇到的问题，说明需要协助排查
  </Step>

  <Step title="管理员评估">
    技术支持人员评估是否需要开启详细日志来定位问题
  </Step>

  <Step title="临时开启">
    管理员在后台为您的账号临时开启日志详情记录功能
  </Step>

  <Step title="协助排查">
    管理员通过查看详细日志协助定位和解决问题
  </Step>

  <Step title="关闭功能">
    问题解决后，管理员会及时关闭详细日志记录功能
  </Step>
</Steps>

### 管理员后台界面

这是管理员后台的日志详情控制界面（客户无法访问）：

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/yl72wP6yNQxQvIte/images/user-logs-control.png?fit=max&auto=format&n=yl72wP6yNQxQvIte&q=85&s=77b33464164d5bb3ea193e19f82cd402" alt="管理员后台日志详情控制" width="1572" height="740" data-path="images/user-logs-control.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/yl72wP6yNQxQvIte/images/user-logs-control.png?fit=max&auto=format&n=yl72wP6yNQxQvIte&q=85&s=77b33464164d5bb3ea193e19f82cd402" alt="管理员后台日志详情控制" width="1572" height="740" data-path="images/user-logs-control.png" />

## 详细日志包含的内容

管理员开启详细日志记录后，系统会额外记录：

<CardGroup cols={2}>
  <Card title="输入内容" icon="log-in">
    * 用户的完整提示词
    * 系统消息
    * 上下文对话历史
    * 函数调用参数
  </Card>

  <Card title="输出内容" icon="log-out">
    * AI 模型的完整回复
    * 函数调用结果
    * 流式输出的完整内容
    * 返回的元数据
  </Card>
</CardGroup>

<Warning>
  **隐私提醒**

  这些详细日志**仅管理员可见**，用于协助您排查技术问题。我们承诺：

  * 仅在必要时开启此功能
  * 仅用于技术支持目的
  * 问题解决后及时关闭
  * 严格保护您的数据隐私
</Warning>

## 适用场景

### 推荐请求开启的场景

以下情况可以联系客服请求管理员协助排查：

* 🔍 **接口报错**：频繁出现错误但无法定位原因
* 📊 **批量任务异常**：跑批时部分任务失败，需要追踪具体哪些请求有问题
* 🧪 **输出质量问题**：模型输出异常，需要分析具体的输入输出内容
* 📈 **性能问题**：调用延迟异常，需要详细日志分析瓶颈
* 🐛 **疑似 Bug**：怀疑系统存在问题，需要提供详细信息给技术团队

### 何时无需开启

以下场景通常不需要开启详细日志：

* ✅ **正常使用**：API 调用正常，无异常情况
* ✅ **常规问题**：通过基础日志（Token 统计、错误类型）已能定位
* ✅ **隐私敏感**：处理极其敏感的数据，不希望任何人查看

## 数据安全说明

<Info>
  **重要提示**

  即使临时开启详细日志记录，我们也会：

  * ✅ 采用加密存储保护您的数据
  * ✅ 严格限制日志访问权限（仅授权管理员）
  * ✅ 问题解决后立即关闭功能
  * ✅ 定期自动清理过期日志数据
  * ✅ 遵守相关数据保护法规
  * ✅ 详细日志不会透出给任何第三方
</Info>

## 常见问题

### 我可以自己在后台开启这个功能吗？

不可以。这个功能仅在管理员后台开启，客户无法自主操作。如需协助排查问题，请联系客服。

### 开启后我能看到详细日志吗？

不能。详细日志内容仅管理员可见，用于技术支持目的。客户只能看到基础的调用记录（Token 统计、错误类型等）。

### 开启详细日志会影响性能吗？

影响极小，主要是增加少量日志写入时间（通常 \< 10ms），不会影响正常使用。

### 日志保存多久？

详细日志默认保存 7-30 天，问题解决后管理员会及时关闭记录功能。

### 管理员会看到我所有的请求内容吗？

仅在开启详细日志期间的请求会被记录。管理员仅在协助您排查问题时查看相关日志，严格遵守保密协议。

### 可以只记录特定时间段的调用吗？

可以。您可以与客服约定具体的开启时间段，例如只在复现问题的时候临时开启。

## 联系我们

如遇到技术问题需要管理员协助排查，请通过以下方式联系我们：

<CardGroup cols={3}>
  <Card title="邮件支持" icon="mail">
    [feedback@apiyi.com](mailto:feedback@apiyi.com)

    详细描述问题和复现步骤
  </Card>

  <Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加 或 [点击联系客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    快速响应，实时沟通
  </Card>

  <Card title="Telegram" icon="send">
    @apiyi001

    即时消息，高效解决
  </Card>
</CardGroup>

<Tip>
  **提高排查效率的建议**

  联系客服时，请尽量提供以下信息：

  * 问题发生的时间段
  * 受影响的 API 调用次数
  * 错误信息或异常现象描述
  * 是否可复现及复现步骤

  这些信息能帮助管理员更快定位和解决问题。
</Tip>
