> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cherry Studio

> 功能强大的 AI 对话客户端集成指南，支持 OpenAI、Anthropic、Gemini 三种渠道类型

Cherry Studio 是一款功能强大的 AI 对话客户端，支持多种大语言模型。通过 API易，您可以在 Cherry Studio 中使用各种主流 AI 模型，并根据需要选择不同的渠道类型以获得最佳体验和成本优化。

## 快速集成（OpenAI 兼容格式）

这是最通用的接入方式，支持 API易 全部 400+ 模型。

### 1. 获取 API 密钥

请参考 [API密钥获取与管理教程](/faq/token-management) 获取您的 API 密钥。

### 2. 配置步骤

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/cherry-studio-config.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=697ce7c87d0a7ddadbc2a4ae4eeca322" alt="Cherry Studio OpenAI兼容配置界面" width="2400" height="1668" data-path="images/cherry-studio-config.png" />

按照上图所示，完成以下配置步骤：

1. 打开 Cherry Studio 应用
2. 点击左侧的设置图标进入设置页面
3. 选择"模型服务"选项
4. 在模型提供商列表中创建自定义渠道【API易】
5. 填写配置信息：
   * **API 地址**：`https://api.apiyi.com`
   * **API 密钥**：输入您的 API易 密钥（[获取方式](/faq/token-management)）
6. 点击底部的"➕ 添加"按钮保存配置

<Info>
  **配置要点**

  * API 地址务必使用：`https://api.apiyi.com`
  * API 密钥获取方式请参考 [API密钥获取与管理教程](/faq/token-management)
  * 建议先测试连接确保配置正确
</Info>

## 三种渠道类型对比

Cherry Studio 支持多种渠道类型，API易 均可接入。根据您的使用场景选择最合适的方式：

| 特性         | OpenAI 兼容格式                | Anthropic 格式      | Gemini 格式   |
| ---------- | -------------------------- | ----------------- | ----------- |
| **API 地址** | 均为 `https://api.apiyi.com` |                   |             |
| **支持模型**   | 全部 400+ 模型                 | 仅 Claude 模型       | 仅 Gemini 模型 |
| **核心优势**   | 通用兼容                       | 缓存省钱              | 原生功能 + 文生图  |
| **缓存计费**   | 无                          | 缓存 token 约 10% 价格 | 无           |
| **特色功能**   | 最广模型支持                     | 连续对话成本优化          | 文生图、代码执行    |
| **推荐场景**   | 通用、多模型切换                   | 高频 Claude 使用      | Gemini 专属功能 |

<Tip>
  **如何选择？**

  * 如果您使用多种模型，选择 **OpenAI 兼容格式**（默认推荐）
  * 如果您主要用 Claude 且对话频繁（5 分钟内连续对话），选择 **Anthropic 格式** 可省钱
  * 如果您需要 Gemini 文生图等原生功能，选择 **Gemini 格式**
</Tip>

## Anthropic 渠道类型

Anthropic 原生格式支持 **[Prompt Caching（提示缓存）](/api-capabilities/claude-prompt-caching)** 功能，在 5 分钟内的连续对话中，缓存命中的输入 tokens 仅需正常价格的约 10%，大幅降低使用成本。

### 配置步骤

<img src="https://mintcdn.com/apiyillc/7TkKa5JmqO5PH0BI/images/cherry-studio-anthropic-provider.png?fit=max&auto=format&n=7TkKa5JmqO5PH0BI&q=85&s=2f3eeb3f3536cbe6cb0ec1f2bd2478f8" alt="Cherry Studio 添加 Anthropic 提供商配置界面" width="1570" height="1020" data-path="images/cherry-studio-anthropic-provider.png" />

1. 打开 Cherry Studio 设置 → 模型服务
2. 点击底部的"➕ 添加"按钮，在弹窗中填写：
   * **提供商名称**：自定义命名（如 `APIYI-CLAUDE`，便于识别）
   * **提供商类型**：选择 **Anthropic**
3. 点击"确定"创建后，在新渠道中填写配置信息：
   * **API 地址**：`https://api.apiyi.com`
   * **API 密钥**：输入您的 API易 密钥
4. 添加所需的 Claude 模型（如 `claude-sonnet-4-5-20250929`、`claude-opus-4-5-20251101`）

<Warning>
  **注意**：Anthropic 渠道仅支持 Claude 系列模型。如需使用其他模型，请通过 OpenAI 兼容格式渠道。
</Warning>

### 适用场景

* **连续对话**：5 分钟内的高频对话，缓存命中率高，省钱效果明显
* **长上下文对话**：上下文越长，缓存节省的费用越多
* **偶尔聊天**：如果您只是时不时发一句，使用 OpenAI 兼容格式即可，两者差别不大

<CardGroup cols={2}>
  <Card title="Claude API 详细文档" icon="book" href="/api-capabilities/claude">
    查看 Anthropic 原生格式的完整 API 文档，包括流式响应、扩展思考等高级功能。
  </Card>

  <Card title="缓存计费深度指南" icon="database" href="/api-capabilities/claude-prompt-caching">
    了解 Prompt Cache 如何让账单打 1 折，含触发条件、最小示例与踩坑指南。
  </Card>
</CardGroup>

## Gemini 渠道类型

Gemini 原生格式支持所有 Gemini 专属功能，包括使用 `gemini-3-pro-image-preview` 进行**文生图（text-to-image）** 创作、代码执行、原生推理控制等。

### 配置步骤

1. 打开 Cherry Studio 设置 → 模型服务
2. 创建新的渠道，**渠道类型选择 Google Gemini**
3. 填写配置信息：
   * **API 地址**：`https://api.apiyi.com`
   * **API 密钥**：输入您的 API易 密钥
4. 添加所需的 Gemini 模型（如 `gemini-2.5-flash`、`gemini-3-pro-preview`、`gemini-3-pro-image-preview`）

<Warning>
  **注意**：Gemini 渠道仅支持 Gemini 系列模型。如需使用其他模型，请通过 OpenAI 兼容格式渠道。
</Warning>

### 特色功能

* **文生图**：使用 `gemini-3-pro-image-preview` 模型，直接在对话中生成图片
* **代码执行**：模型可自动执行 Python 代码进行数据分析
* **推理控制**：通过 `thinking_budget` 精细控制推理深度
* **多模态支持**：完整支持图片、音频、视频等多种媒体输入

<Card title="Gemini 原生格式详细文档" icon="sparkles" href="/api-capabilities/gemini/native">
  查看 Gemini 原生格式的完整 API 文档，包括多模态处理、推理控制、代码执行等功能。
</Card>

## 添加模型

完成渠道配置后，在对应渠道中添加所需模型：

1. 在模型搜索框中查找所需模型
2. 点击模型名称旁的图标来选择或配置模型
3. 根据需要启用或禁用不同的模型变体

<Card title="当下热门模型推荐" icon="star" href="/api-capabilities/model-info">
  查看最新的模型推荐、性能对比和使用建议。模型列表持续更新，确保您使用最新最强的 AI 模型。
</Card>

<Info>
  **为什么不在此列出具体模型？**

  AI 模型更新迭代速度非常快，为了确保您获取最准确的模型推荐信息，我们统一在 [模型推荐页面](/api-capabilities/model-info) 维护最新的模型列表、性能数据和使用建议。
</Info>

## 高级功能

### 图片支持

如果使用支持图片的模型（如 GPT-4V）：

1. 在设置中开启"图片"选项
2. 选择支持视觉的模型
3. 在对话中上传图片

### 流式输出

Cherry Studio 默认支持流式输出，提供更好的体验。

## 故障排除

### 连接失败

* 检查 API 密钥是否正确
* 确认 API 地址：`https://api.apiyi.com`
* 验证网络连接状态

### 模型不可用

* 确认账户余额充足
* 检查模型是否在对应的渠道类型中（例如 Claude 模型需在 OpenAI 或 Anthropic 渠道中）
* 尝试其他模型

## 使用技巧

1. **合理选择渠道**：根据主要使用的模型选择对应渠道类型，可同时配置多个渠道
2. **合理选择模型**：根据任务需求选择合适的模型
3. **定期更新**：关注新模型的发布
4. **监控使用**：通过 API易 查看使用情况

需要更多帮助？请访问 [API易官网](https://api.apiyi.com)。
