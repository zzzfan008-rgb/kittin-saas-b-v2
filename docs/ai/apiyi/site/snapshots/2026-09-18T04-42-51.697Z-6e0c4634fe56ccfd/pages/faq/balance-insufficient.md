> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 为什么还有余额跑不通？

> API易余额不足问题排查指南，了解请求预扣机制和Token超长的解决方案

## 请求预扣机制

API易采用**请求预扣**机制，在发送请求时会预先扣除预估费用。如果当前余额不足以支持这个请求，即使账户中还有一些余额，也会导致请求失败。

<Warning>
  **预扣机制说明**

  系统会根据输入内容的复杂度预估本次请求的最大可能费用，如果预估费用超过当前余额，请求将无法执行。
</Warning>

## 常见原因分析

### 1. 输入内容Token超长

**图片内容**

* 上传了复杂的图片（高分辨率、多图片）
* 页面多的PDF文件或复杂文档
* 图表、截图等视觉内容较多

**文本内容**

* 在第三方软件中开启了联网搜索插件
* 传入了整个代码库（多目录多文件）
* 长篇文档或大量代码

### 2. 超过模型上下文限制

这些超长内容可能导致：

* **超过当前模型的整个上下文**（输入+输出总和）
* **超过您当前API易的余额**
* **请求预扣金额过高**

<Info>
  **上下文计算**

  模型的上下文限制 = 输入Token + 输出Token的总和

  例如：如果模型支持128K上下文，而您的输入已经用了100K Token，那么输出最多只能有28K Token。
</Info>

## 解决方案

### 1. 检查输入内容

**优化输入**

* 压缩或减小图片尺寸
* 分批处理大文件
* 关闭不必要的联网搜索功能
* 只传入相关的代码文件，而非整个项目

**内容分片**

* 将长文档拆分为多个部分
* 分批上传多张图片
* 逐个处理代码文件

### 2. 检查账户余额

**余额查看**

* 登录控制台查看当前余额
* 确认余额是否足够支付预估费用
* 考虑充值以获得更充足的余额

### 3. 选择合适的模型

**推荐测试模型**

* `gpt-4o-mini` - 价格便宜，适合测试
* `gpt-3.5-turbo` - 成本较低的选择
* `claude-3-haiku` - 快速且经济的模型

<Tip>
  **成本优化建议**

  先用便宜的模型测试您的输入内容是否合理，确认没有问题后再切换到更高端的模型。
</Tip>

### 4. 分析Token使用

**Token计算工具**

* 使用在线Token计算器预估内容长度
* 查看API返回的Token使用统计
* 对比不同内容的Token消耗

## 技术支持

如果按照上述方法仍然无法解决问题，可以联系技术客服获得帮助：

<Card title="企业微信客服" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  扫码添加 或 [点击联系客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

  请提供以下信息以便快速诊断：

  * 账户余额截图
  * 输入内容的大致描述
  * 使用的模型名称
  * 错误信息截图
</Card>

## 预防措施

### 1. 内容预处理

* 在发送前评估内容复杂度
* 使用压缩工具优化文件大小
* 提取关键信息而非全量内容

### 2. 余额管理

* 保持充足的账户余额
* 设置余额预警提醒
* 定期查看消费记录

### 3. 模型选择

* 根据任务复杂度选择合适模型
* 简单任务使用经济型模型
* 复杂任务再考虑高端模型

## 常见错误信息

* `Insufficient balance for this request` - 余额不足
* `Input too long` - 输入内容过长
* `Context length exceeded` - 超过上下文限制
* `Request timeout` - 请求超时（通常因内容过长）
