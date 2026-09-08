> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Obsidian Copilot

> 在 Obsidian 笔记软件中通过 Copilot 插件接入 API易，与个人知识库对话

Obsidian Copilot 是一款开源的 Obsidian AI 助手插件，设计简洁、注重隐私。它支持通过自定义 API 密钥接入任何兼容 OpenAI 格式的模型服务，可以自定义提示词、快速与整个笔记库对话，从个人知识库中获取答案和见解。

通过 API易，您可以在 Obsidian 中一站式使用 GPT、Claude、Gemini、DeepSeek 等 400+ 主流模型，无需分别注册多个平台账号。

## 核心特性

<CardGroup cols={2}>
  <Card title="与笔记库对话" icon="messages-square">
    Vault QA 模式基于向量索引检索整个笔记库，针对您的个人知识库进行问答
  </Card>

  <Card title="自定义提示词" icon="wand-sparkles">
    内置总结、翻译、改写等命令，支持创建自定义提示词一键处理选中文本
  </Card>

  <Card title="隐私优先" icon="shield-check">
    插件开源、数据本地存储，API 密钥仅保存在本地配置中
  </Card>

  <Card title="灵活接入模型" icon="plug">
    支持任何 OpenAI 兼容接口，通过 API易 可自由切换 400+ 模型
  </Card>
</CardGroup>

## 快速开始

### 第一步：获取 API易 密钥

1. 打开 [API易官网](https://api.apiyi.com) 并注册账号（已注册直接登录即可）
2. 进入控制台的"令牌"页面，创建新的 API Key
3. 点击复制密钥（格式为 `sk-...`），以备后续使用

### 第二步：安装 Obsidian Copilot 插件

<Steps>
  <Step title="安装 Obsidian 应用">
    从 Obsidian 官网下载并安装：`obsidian.md`
  </Step>

  <Step title="打开社区插件市场">
    进入 Obsidian **设置 → 第三方插件**，关闭"安全模式"，点击"浏览"社区插件市场
  </Step>

  <Step title="安装并启用 Copilot">
    搜索 **Copilot**（作者 Logan Yang），点击安装并启用
  </Step>
</Steps>

### 第三步：配置 API易 LLM 模型

<Steps>
  <Step title="打开 Copilot 设置">
    进入 **设置 → Copilot**，切换到 **Model**（模型）标签页
  </Step>

  <Step title="添加自定义模型">
    在 Chat Models 部分点击 **Add Custom Model**，填写以下信息：

    | 配置项            | 填写内容                                 |
    | -------------- | ------------------------------------ |
    | **Model Name** | 模型名称，如 `gpt-5.2` 或 `claude-sonnet-5` |
    | **Provider**   | 选择 **3rd party (openai-format)**     |
    | **Base URL**   | `https://api.apiyi.com/v1`           |
    | **API Key**    | 您的 API易 密钥（`sk-...`）                 |
  </Step>

  <Step title="验证并添加">
    点击 **Verify** 测试连通性，通过后点击 **Add Model** 完成添加
  </Step>
</Steps>

<Info>
  **配置要点**

  * Base URL 必须包含 `/v1` 后缀：`https://api.apiyi.com/v1`
  * 模型名称需与 API易 支持的模型名完全一致，可在 [模型列表](https://api.apiyi.com/account/models) 查询
  * 可重复添加多个模型，在聊天界面随时切换
</Info>

### 第四步：配置 Embedding 模型（Vault QA 必需）

如需使用 Vault QA（笔记库问答）模式，还需配置一个向量嵌入模型：

1. 在 Copilot 设置的 **Embedding Models** 部分点击 **Add Custom Model**
2. 填写 Embedding 模型名称：推荐 `text-embedding-3-small`（性价比高）或 `text-embedding-3-large`（精度更高）
3. Provider 同样选择 **3rd party (openai-format)**
4. Base URL 填写 `https://api.apiyi.com/v1`，API Key 填写 API易 密钥
5. 点击 **Add Model** 完成

### 第五步：保存并开始使用

选择刚添加的模型作为默认模型，点击 **Save and Reload**（保存并重新加载）。之后即可：

* 点击左侧边栏的 Copilot 图标打开聊天面板
* 在 **Chat** 模式下直接与模型对话
* 在 **Vault QA** 模式下基于整个笔记库进行检索问答（首次使用需等待索引构建完成）

## 支持的模型

Obsidian Copilot 通过 API易 支持 400+ 主流 AI 模型，包括 OpenAI、Claude、Gemini、DeepSeek、国产模型等。

<Card title="查看最新模型推荐" icon="star" href="/api-capabilities/model-info">
  查看最新的模型推荐、性能对比和使用建议。模型列表持续更新，确保您使用最新最强的 AI 模型。
</Card>

<Info>
  **为什么不在此列出具体模型？**

  AI 模型更新迭代速度非常快，为了确保您获取最准确的模型推荐信息，我们统一在 [模型推荐页面](/api-capabilities/model-info) 维护最新的模型列表、性能数据和使用建议。
</Info>

<Tip>
  **场景化选择建议**

  * **日常笔记问答**：选择响应快、价格低的轻量模型
  * **长文总结/深度写作**：选择长上下文的旗舰模型
  * **Vault QA 嵌入**：`text-embedding-3-small` 足够覆盖绝大多数知识库场景
</Tip>

## 高级功能

### 自定义命令与提示词

Copilot 支持将常用操作保存为自定义命令：

1. 在 Copilot 设置中进入 **Commands** 部分
2. 创建自定义提示词，例如"将选中内容改写为周报格式"
3. 在编辑器中选中文本，通过命令面板（`Ctrl/Cmd + P`）调用

### 与选中文本交互

选中笔记中的任意段落后，可直接调用内置命令：

* **Summarize**：一键总结选中内容
* **Translate**：翻译为指定语言
* **Simplify / Fix grammar**：简化表达、修正语法
* **Generate table of contents**：生成目录

### CORS 兼容模式

如果配置后聊天请求失败，可在添加模型时勾选 **CORS** 选项。

<Warning>
  开启 CORS 模式后 Obsidian 暂不支持流式输出，回复会在生成完毕后一次性显示。API易 的标准接口通常无需开启此选项，建议仅在请求失败时尝试。
</Warning>

## 故障排除

<AccordionGroup>
  <Accordion title="点击 Verify 验证失败或聊天无响应">
    * 检查 Base URL 是否为 `https://api.apiyi.com/v1`（注意包含 `/v1`）
    * 确认 API Key 已正确复制，无多余空格
    * 确认账户余额充足
    * 若仍失败，尝试在模型设置中勾选 CORS 选项
  </Accordion>

  <Accordion title="提示模型不存在（model not found）">
    * 模型名称必须与 API易 支持的名称完全一致（区分大小写）
    * 前往 [模型列表](https://api.apiyi.com/account/models) 核对准确的模型名
  </Accordion>

  <Accordion title="Vault QA 模式无法使用或索引失败">
    * 确认已单独配置 Embedding 模型（LLM 模型不能兼作嵌入模型）
    * 首次索引大型笔记库需要一定时间，请耐心等待
    * 修改 Embedding 模型后需要重建索引（Force Re-index）
  </Accordion>

  <Accordion title="回复速度慢">
    * 换用响应更快的轻量模型
    * 减少对话上下文长度
    * Vault QA 模式下适当降低检索返回的片段数量
  </Accordion>
</AccordionGroup>

## 使用技巧

1. **多模型分工**：添加多个模型，日常问答用轻量模型，深度写作切换旗舰模型，节省成本
2. **控制索引范围**：在 Copilot 设置中排除附件、模板等目录，减少 Embedding 消耗并提升检索质量
3. **善用自定义提示词**：将高频操作（如"整理会议记录"）固化为命令，一次配置长期复用
4. **定期重建索引**：笔记库大幅变动后执行 Force Re-index，保证 Vault QA 检索准确性

## 相关资源

<CardGroup cols={2}>
  <Card title="模型推荐" icon="star" href="/api-capabilities/model-info">
    查看最新模型列表与场景化推荐
  </Card>

  <Card title="快速开始" icon="rocket" href="/getting-started">
    3 分钟完成 API易 账号注册与密钥创建
  </Card>

  <Card title="Base URL 配置说明" icon="circle-question-mark" href="/faq/base-url-config">
    了解不同工具中 API 地址的正确填写方式
  </Card>

  <Card title="Cherry Studio" icon="cherry" href="/scenarios/chat/cherry-studio">
    另一款功能强大的桌面 AI 对话客户端
  </Card>
</CardGroup>

<Info>
  Obsidian Copilot 插件开源地址：`github.com/logancyang/obsidian-copilot`
</Info>
