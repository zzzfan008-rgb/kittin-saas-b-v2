> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何选择合适的 AI 模型？

> 了解如何根据应用场景选择最适合的 AI 模型，掌握模型选型的核心原则

## 快速查看模型信息

<Info>
  **推荐查看**：[模型信息总览页面](/api-capabilities/model-info)

  本页面会及时更新当下最新的模型列表、性能指标和价格信息，帮助您快速了解所有可用模型。
</Info>

## 核心选型原则

<CardGroup cols={2}>
  <Card title="用新不用旧" icon="trending-up">
    **优先选择新模型**

    * ✅ 性能更强，效果更好
    * ✅ 价格反而更便宜
    * ✅ 功能更丰富
    * ✅ 支持更长上下文
  </Card>

  <Card title="按场景选择" icon="target">
    **匹配实际需求**

    * 📊 数据分析：推理能力强的模型
    * 💬 对话应用：平衡性能和成本
    * 🎨 创意生成：支持多模态的模型
    * ⚡ 批量处理：高性价比模型
  </Card>
</CardGroup>

## 常见场景推荐

### 文本生成与对话

<AccordionGroup>
  <Accordion title="💬 通用对话与内容创作">
    **推荐模型**：

    * **Claude 3.5 Sonnet**：综合能力强，适合复杂任务
    * **GPT-4o mini**：性价比极高，适合大量调用
    * **Gemini 2.0 Flash**：速度快，成本低

    **适用场景**：客服机器人、内容生成、文案撰写
  </Accordion>

  <Accordion title="🧠 复杂推理与数据分析">
    **推荐模型**：

    * **Claude 3.7 Sonnet**：顶级推理能力
    * **Gemini 3 Pro Preview**：数据分析专家
    * **o1 系列**：深度思考模型

    **适用场景**：数据分析、代码生成、逻辑推理
  </Accordion>

  <Accordion title="⚡ 批量处理与高并发">
    **推荐模型**：

    * **GPT-4o mini**：\$0.15/百万 tokens 起
    * **Gemini 2.0 Flash**：速度快，稳定性高
    * **GLM-4-Flash**：国产高性价比选择

    **适用场景**：批量翻译、内容审核、数据处理
  </Accordion>
</AccordionGroup>

### 图像生成

<Accordion title="🎨 图像生成模型选择">
  **推荐模型**：

  * **FLUX.1 Pro**：最高质量，适合专业场景
  * **FLUX.1 Schnell**：速度优先，快速迭代
  * **SeeDream 4.5**：4K 生成，性价比高（\$0.035/张）

  **适用场景**：

  * **电商产品图**：SeeDream 4.5（支持参考图像）
  * **营销创意**：FLUX.1 Pro（质量最优）
  * **快速原型**：FLUX.1 Schnell（3秒出图）
</Accordion>

### 代码与技术应用

<Accordion title="💻 代码生成与技术开发">
  **推荐模型**：

  * **Claude 3.7 Sonnet**：代码质量最佳
  * **GPT-4o**：多语言支持全面
  * **Gemini 3 Pro Preview**：SWE-bench 76.2% 高分

  **适用场景**：代码生成、代码审查、技术文档生成
</Accordion>

## 具体场景咨询

如果您有特定的应用场景，不确定该选择哪个模型，欢迎随时联系我们获取专业建议：

<CardGroup cols={3}>
  <Card title="邮件咨询" icon="mail">
    [feedback@apiyi.com](mailto:feedback@apiyi.com)

    详细描述您的使用场景
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
  **咨询时请提供以下信息**：

  * 🎯 **应用场景**：具体用途（如批量图片标题生成、客服对话等）
  * 📊 **使用规模**：预计每日调用量
  * ⚡ **性能要求**：响应速度、质量要求
  * 💰 **预算范围**：成本控制目标

  这些信息能帮助我们为您推荐最合适的模型组合。
</Tip>

## 实际案例

<Warning>
  **案例：批量图片标题生成**

  **客户需求**：需要为大量商品图片生成标题描述

  **推荐方案**：

  * **GPT-4o mini**：成本低（\$0.15/百万 tokens），质量稳定，适合批量处理
  * **Gemini 2.0 Flash**：速度快，成本更低，适合超大批量

  **理由**：这类任务对创意要求不高，但对成本和速度敏感，mini 和 flash 系列性价比最优。
</Warning>

## 模型更新说明

<Info>
  **保持关注**

  AI 模型迭代速度很快，新模型通常在性能和价格上都有显著提升。我们建议：

  * 📖 定期查看 [模型信息页面](/api-capabilities/model-info) 了解最新模型
  * 🔔 关注 [更新日志](/changelog) 获取新模型发布通知
  * 🧪 使用免费额度测试新模型效果
  * 📈 根据实际效果逐步切换到新模型

  **记住**：用新不用旧，新模型往往更强更便宜！
</Info>
