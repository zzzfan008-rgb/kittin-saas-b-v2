> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 价格说明

> 了解 API易 和 AI大模型的定价逻辑和优势，享受比官方更优惠的价格。用户提供透明、优惠的定价方案，让您以更低的成本享受顶级 AI 模型服务。

## API易 定价原则

### 1. 模型价格对齐

* **海外大模型**：价格等同于各自官网标准（包括 OpenAI、Claude、Gemini、Grok等）。
* **国内大模型**：价格均低于官网价格（包括 DeepSeek、Qwen、Doubao、Kimi等）
* **稀有模型**：个别新出的海外大模型（比如以前的 gpt-5.2-pro），或申请门槛特别高的模型会有一些上调。但充值赠送的折扣下来和官网相近。

<CardGroup cols={2}>
  <Card title="价格透明、八折起" icon="tags">
    绝大部分模型价格与官方保持一致，消耗视角完全透明，只为用的放心\~
  </Card>

  <Card title="模型齐全、上新快" icon="bell-dot">
    每当各家厂商发布新模型，API易 总是及时上新。快就是优势！
  </Card>
</CardGroup>

## 充值优势

### 2. 固定汇率

<CardGroup cols={2}>
  <Card title="固定汇率" icon="dollar-sign">
    **1:7** 固定汇率

    不随实时汇率波动，方便计费；可与充值活动叠加享受额外优惠
  </Card>

  <Card title="最低门槛" icon="coins">
    **5 美元**起充

    仅需 35 元人民币即可开始使用
  </Card>
</CardGroup>

### 3. 充值赠送

<Note>
  **充值越多，优惠越大**

  首充加赠 + 阶梯加赠（10%-20%），综合折扣可达官方**八折**
</Note>

<Card title="查看完整充值优惠政策" icon="gift" href="/faq/recharge-promotions">
  了解详细的首充加赠、阶梯加赠比例、企业客户服务等信息
</Card>

## API易 比官网的更多优势

更关键，相比官方单一账号，API易 提供更全面的服务：

<CardGroup cols={2}>
  <Card title="无限制使用" icon="infinity">
    * 不限速率
    * 不封号风险
    * 按量计费
  </Card>

  <Card title="模型齐全" icon="layers">
    * 400+ 热门模型
    * 一键切换
    * 持续更新
  </Card>

  <Card title="接入简单" icon="plug">
    * 统一 API 接口
    * 兼容 OpenAI 格式
    * 零迁移成本
  </Card>

  <Card title="企业级服务" icon="shield-check">
    * 专业技术支持
    * 稳定可靠
    * 数据安全保障
  </Card>
</CardGroup>

## 科普：计费基础知识

### 什么是『按量计费』？

按量计费（Pay-as-you-go）意味着您只需为实际使用的服务付费，无需预付月费或年费。

<CardGroup cols={2}>
  <Card title="灵活使用" icon="chart-line">
    * 用多少付多少
    * 无最低消费要求
    * 随时开始或停止
  </Card>

  <Card title="成本可控" icon="gauge">
    * 实时查看消耗
    * 设置额度预警
    * 精确到每次调用
  </Card>
</CardGroup>

### 计费模式优先级

APIYI 支持两种计费模式，当同一模型同时支持两种模式时：

<Warning>
  **按次计费优先于按量计费**

  如果一个模型同时支持按次和按量计费，系统默认使用按次计费。
</Warning>

#### 令牌（API Key）设置影响

您的计费方式也受令牌配置影响：

<CardGroup cols={2}>
  <Card title="仅允许按量计费" icon="sliders-horizontal">
    如果令牌设置为"仅按量计费"，即使模型支持按次计费，也会使用按量计费
  </Card>

  <Card title="默认设置" icon="circle-check">
    令牌默认支持所有计费模式，系统自动选择（按次优先）
  </Card>
</CardGroup>

### 『按次计费』场景

以下类型的模型通常采用按次计费：

<Tabs>
  <Tab title="图片生成">
    **适用模型**：

    * sora\_image 系列（逆向模型）
    * flux-kontext-pro（官方模型）
    * DALL-E 系列
    * Midjourney 相关模型

    **计费单位**：每张图片
  </Tab>

  <Tab title="视频生成">
    **适用模型**：

    * 视频生成类 API
    * 动画制作模型

    **计费单位**：每个视频/每秒
  </Tab>

  <Tab title="特殊模型">
    **识别方式**：

    * 模型名称包含 `-all` 后缀的逆向模型
    * 特定功能型模型

    **计费单位**：每次调用
  </Tab>
</Tabs>

<Info>
  查看完整的模型价格表：[APIYI 价格列表](https://api.apiyi.com/account/pricing)
</Info>

### 什么是 Tokens？

Token 是 AI 模型处理文本的基本单位。理解 Token 有助于您估算和控制成本。

<Info>
  **Token 计算参考**

  * 中文：1 个汉字 ≈ 1-2 个 tokens
  * 英文：1 个单词 ≈ 1-2 个 tokens
  * 1000 tokens ≈ 750 个英文单词 ≈ 500 个汉字
</Info>

#### Token 计算示例

```
输入文本："你好，请帮我写一个Python函数"
Token 数：约 12-15 个 tokens

输出文本："def hello_world():\n    print('Hello, World!')"
Token 数：约 15-20 个 tokens

总消耗：输入 + 输出 ≈ 30-35 个 tokens
```

### 提示词与补全

在每次 API 调用中，费用由两部分组成：

<Steps>
  <Step title="提示词（Prompt）- 输入 Tokens">
    您发送给模型的所有内容，包括：

    * 系统提示
    * 用户问题
    * 上下文信息
    * 历史对话（如有）
  </Step>

  <Step title="补全（Completion）- 输出 Tokens">
    模型生成的回复内容，包括：

    * 文本回答
    * 代码生成
    * 结构化数据
  </Step>
</Steps>

<Warning>
  不同模型的输入和输出价格可能不同。通常输出 tokens 的价格高于输入 tokens。
</Warning>

## 如何选择合适的模型？

### 模型选择策略

<Tabs>
  <Tab title="成本优先">
    **适合场景**：大批量处理、简单任务、测试开发

    **推荐模型**：

    * gemini-2.5-flash （又快又好）
    * gpt-4.1（可是官方替代 gpt-4.5 的模型）
    * deepseek-v3（国产之光、性价比高）

    **预估成本**：\$0.1-1/百万 tokens
  </Tab>

  <Tab title="性能优先">
    **适合场景**：复杂推理、专业内容、高质量输出

    **推荐模型**：

    * gemini-2.5-pro（综合多模态很强）
    * claude-sonnet-4-20250514-thinking（长文本处理）
    * o3（OpenAI 主力的推理模型，多模态能力）
    * deepseek-r1-0528 (R1优化版本)

    **预估成本**：\$3-15/百万 tokens
  </Tab>

  <Tab title="均衡选择">
    **适合场景**：日常使用、中等复杂度任务

    **推荐模型**：

    * gpt-4.1（性价比均衡）
    * claude-3-5-haiku-20241022（快速响应）
    * qwen-max（中文优化）

    **预估成本**：\$0.5-3/百万 tokens
  </Tab>
</Tabs>

更多请关注左侧「当下热门模型」页面。

### 成本预估方法

<Steps>
  <Step title="小样本测试">
    使用少量样本（5-10个）进行测试调用
  </Step>

  <Step title="查看消耗日志">
    在 APIYI 控制台查看每次调用的详细 token 消耗
  </Step>

  <Step title="计算平均值">
    统计平均每次调用的 token 数量
  </Step>

  <Step title="预估总成本">
    平均 tokens × 预计调用次数 × 模型单价
  </Step>
</Steps>

<Card title="实践建议" icon="lightbulb">
  1. 先用便宜的模型测试，验证可行性
  2. 通过 APIYI 后台日志分析实际消耗
  3. 根据任务复杂度选择合适模型
  4. 优化提示词减少不必要的 token 消耗
</Card>

## 实时价格查询

<CardGroup cols={2}>
  <Card title="模型价格表" icon="table" href="https://api.apiyi.com/account/pricing">
    查看所有模型的实时价格

    * 按量计费价格
    * 按次计费价格
    * 优惠幅度对比
  </Card>

  <Card title="费用计算器(开发中)" icon="calculator" href="https://api.apiyi.com">
    快速估算使用成本

    * 输入预估用量
    * 选择使用模型
    * 自动计算费用
  </Card>
</CardGroup>

## 常见问题

<AccordionGroup>
  <Accordion title="如何查看实时价格？">
    登录 [APIYI 控制台](https://api.apiyi.com)，在模型列表页面可以查看所有模型的实时价格。
  </Accordion>

  <Accordion title="充值后多久到账？">
    充值实时到账，支付成功后立即可以使用。
  </Accordion>

  <Accordion title="是否支持发票？">
    支持开具正规发票，请在控制台提交开票申请。
  </Accordion>

  <Accordion title="有批量采购优惠吗？">
    企业大额充值可享受更多优惠，请联系客服咨询。
  </Accordion>
</AccordionGroup>

## 开发票说明

### 开票流程

客户在线充值或对公转账成功后，以实付金额开票（所有价格均含税），需要客户提供详细的开票信息：企业或高校抬头、税号等。

<Steps>
  <Step title="提交开票信息">
    网站后台顶部导航-开票，自助提交开票表单

    [提交开票申请 →](https://xinqikeji.feishu.cn/share/base/form/shrcns8TS3alZTN2Av1JfkOvmqh)
  </Step>

  <Step title="发票类型">
    * 可开增值税普通发票（专票需求另外沟通税点）
    * 开票类目：**信息技术服务费**或**数据采集费**
    * 可配合开具：采购清单并加盖公章
  </Step>

  <Step title="交付时间">
    1个工作日左右，通过微信或邮箱发送电子发票
  </Step>
</Steps>

<Info>
  我们有不少的高校与企业客户，会配合贵方的各种合理的报销要求。
</Info>

***

<Card title="立即开始" icon="rocket" href="https://api.apiyi.com">
  注册账号，充值即享优惠，体验 400+ AI 模型
</Card>
