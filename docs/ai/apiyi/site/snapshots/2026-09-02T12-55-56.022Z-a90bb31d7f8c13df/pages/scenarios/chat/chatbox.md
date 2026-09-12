> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Chatbox AI

> 跨平台 AI 客户端应用集成指南

Chatbox AI 是一个功能强大的跨平台 AI 客户端应用，支持多种大语言模型和 API。通过 API易，您可以在 Chatbox 中访问各种主流 AI 模型，享受本地存储的隐私保护。

## 快速开始

### 下载安装

Chatbox AI 支持多平台安装：

* **桌面版**：Windows、macOS、Linux
* **移动版**：iOS、Android
* **网页版**：直接通过浏览器访问

访问 [Chatbox AI 官网](https://chatboxai.app/en) 下载适合您平台的版本。

### 配置 API易

#### 步骤 1：打开设置

1. 启动 Chatbox AI 应用
2. 点击左下角的设置图标（⚙️）
3. 进入"模型配置"界面

#### 步骤 2：添加自定义提供商

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/chatbox-setting.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=dd787d3ef7889fbe04f9d2c3143b5cc5" alt="Chatbox AI 设置界面 - API易配置示例" width="2708" height="1536" data-path="images/chatbox-setting.png" />

按照上图所示的配置界面，完成以下设置步骤：

1. 在"模型提供商"部分点击 **+ 添加** 按钮

2. 填写提供商信息：
   * **名称**：API易（可自定义名称）
   * **API 模式**：选择 **OpenAI API 兼容**
   * **API 密钥**：输入您的 API易 密钥
   * **API 主机**：`https://api.apiyi.com/v1`
   * **API 路径**：`/chat/completions`（默认值）

3. **高级配置**（可选）：
   * 启用"改善网络兼容性"选项（如图所示）
   * 可配置图像生成专用端点

<Info>
  **配置要点**

  * API 主机字段对应 Base URL，必须包含 `/v1` 后缀
  * API 路径字段用于指定具体的端点路径
  * API 密钥可在 [API易控制台](https://api.apiyi.com) 获取
  * 配置完成后点击右下角的 **+ 新建** 按钮添加模型
</Info>

#### 步骤 3：选择模型

配置完成后，在聊天界面可以选择模型。

## 支持的模型

Chatbox AI 通过 API易 支持 400+ 主流 AI 模型，包括 OpenAI、Google Gemini、Claude、DeepSeek、国产模型等。

<Card title="查看当下热门模型推荐" icon="star" href="/api-capabilities/model-info">
  查看最新的模型推荐、性能对比和场景化使用建议。涵盖文本创作、编程开发、快速响应、图像生成、视频生成等全场景。
</Card>

<Info>
  **为什么不在此列出具体模型？**

  AI 模型更新迭代速度非常快，为了确保您获取最准确的模型推荐信息，我们统一在 [模型推荐页面](/api-capabilities/model-info) 维护最新的模型列表、性能数据和使用建议。
</Info>

## 核心功能

### 多平台同步

Chatbox AI 的核心优势：

* **本地存储**：数据完全存储在本地，保护隐私
* **跨平台访问**：在不同设备间切换使用
* **离线功能**：部分功能支持离线使用

### 对话管理

**智能对话功能**：

* 多轮对话上下文保持
* 对话历史搜索和管理
* 对话导出（Markdown、PDF）
* 提示词库和消息引用

### 文档处理

**文档理解能力**：

* PDF、TXT、DOCX 文档上传
* 图片理解和分析
* LaTeX 和 Markdown 渲染
* 代码高亮和预览

### 图像生成

**AI 图像创作**：

* 支持 DALL-E 系列模型图像生成
* 可配置专用图像生成端点
* 支持多种图像尺寸和风格
* 批量图像生成功能

**配置图像生成**：

1. 在设置中添加图像生成专用提供商
2. 使用标准 `/images/generations` 端点
3. 在聊天中直接描述图像需求
4. 系统自动调用图像生成API

### 高级设置

**参数调节**：

```yaml theme={null}
对话参数设置:
  - Temperature: 0.7        # 创造性控制（推理模型 GPT-5 只能用 1）
  - Max Tokens: 4096       # 最大输出长度
  - Top P: 0.9            # 采样参数（推理模型 gpt-5 只能用 1）
  - Context Length: 8192   # 上下文长度
```

## 使用技巧

### 提示词优化

Chatbox AI 内置提示词库，您也可以创建自定义提示词：

```markdown theme={null}
# 编程助手
你是一位经验丰富的软件工程师，请帮我：
- 编写高质量代码
- 解释复杂概念
- 提供最佳实践建议

# 输出格式
请使用代码块格式化代码，并提供详细注释。
```

### 隐私保护

Chatbox AI 采用"隐私设计"理念：

* 数据本地存储，不上传云端
* 支持自建 API 端点
* 可完全离线使用（配合本地模型）

## 高级配置

### 自定义 API 端点

除了基本的聊天功能，您还可以配置专用的图像生成端点：

#### 聊天完成端点配置

```yaml theme={null}
基础聊天配置:
  提供商名称: API易
  API模式: OpenAI API Compatible
  API密钥: sk-your-apiyi-key
  API主机: https://api.apiyi.com/v1
  API路径: /chat/completions
```

#### 图像生成端点配置

**方式一：使用专属 Image API**

```yaml theme={null}
图像生成配置:
  提供商名称: API易-图像
  API模式: OpenAI API Compatible
  API密钥: sk-your-apiyi-key
  API主机: https://api.apiyi.com/v1
  API路径: /images/generations  # 标准图像生成端点
  模型适用：gpt-image-1、flux-kontext-pro
```

**方式二：使用 Responses 端点**

```yaml theme={null}
Responses配置:
  提供商名称: API易-Responses
  API模式: OpenAI API Compatible
  API密钥: sk-your-apiyi-key
  API主机: https://api.apiyi.com
  API路径: /v1/responses  # 通用响应端点
```

<Tip>
  **端点选择建议**

  * 常规对话：使用 `/chat/completions` 端点
  * 逆向生成图片的模型，比如 sora\_image：使用 `/chat/completions` 端点
  * 图像生成：优先使用 `/images/generations` 标准端点
  * 特殊需求：可使用 `gpt-image-1` 或 `/v1/responses` 端点
  * 在 Chatbox 中，"API路径"字段对应具体的端点路径
</Tip>

### 网络代理设置

如需使用代理访问：

1. 进入设置 > 网络配置
2. 配置 HTTP/HTTPS 代理
3. 设置代理认证（如需要）

### 快捷键设置

常用快捷键：

* `Ctrl/Cmd + N`：新建对话
* `Ctrl/Cmd + T`：切换模型
* `Ctrl/Cmd + /`：显示命令面板
* `Ctrl/Cmd + K`：快速搜索

## 移动端配置

### iOS/Android 配置

移动端配置与桌面版相同：

1. 下载 Chatbox AI 移动应用
2. 进入设置 > 模型配置
3. 添加 API易 自定义提供商
4. 配置相同的 API Base URL 和密钥

### 移动端特色功能

* **语音输入**：支持语音转文字
* **相机集成**：直接拍照进行图像分析
* **离线缓存**：对话历史离线可用
* **推送通知**：重要消息提醒

## 故障排除

### 常见问题

**连接失败**

* 检查 API Base URL：`https://api.apiyi.com/v1`
* 验证 API 密钥有效性
* 确认网络连接正常

**模型不显示**

* 等待模型列表自动刷新
* 手动点击"刷新模型"按钮
* 检查 API 密钥权限

**响应速度慢**

* 尝试切换到更快的模型
* 检查网络延迟
* 减少上下文长度

### 日志调试

启用调试模式：

1. 设置 > 高级选项
2. 开启"调试模式"
3. 查看详细日志信息

### 数据备份

定期备份对话数据：

1. 设置 > 数据管理
2. 导出对话历史
3. 备份配置文件

## 最佳实践

### 性能优化

1. **合理选择模型**
   * 根据任务复杂度选择合适的模型
   * 查看 [模型推荐页面](/api-capabilities/model-info) 获取最新的模型选择建议

2. **上下文管理**
   * 定期清理无用对话
   * 合理设置上下文长度
   * 使用对话分组功能

3. **资源管理**
   * 监控 API 使用量
   * 设置使用限额提醒
   * 定期更新应用版本

### 安全建议

* 不要分享 API 密钥
* 定期更换密钥
* 使用强密码保护应用
* 谨慎处理敏感信息

### 团队协作

虽然 Chatbox AI 主要面向个人用户，但可以通过以下方式支持团队：

* 共享提示词模板
* 导出对话记录分享
* 统一 API 配置标准

## 对比优势

### vs 其他客户端

| 特性          | Chatbox AI | ChatGPT Web | 其他客户端 |
| ----------- | ---------- | ----------- | ----- |
| **本地存储**    | ✅          | ❌           | 部分支持  |
| **多平台**     | ✅          | ❌           | 部分支持  |
| **自定义 API** | ✅          | ❌           | ✅     |
| **离线功能**    | ✅          | ❌           | ❌     |
| **隐私保护**    | ✅          | ❌           | 不确定   |

### 选择 Chatbox AI 的理由

1. **隐私优先**：数据完全本地存储
2. **灵活配置**：支持多种 API 端点
3. **跨平台**：统一的使用体验
4. **功能丰富**：提示词库、文档处理等
5. **持续更新**：活跃的开发维护

需要更多帮助？请查看 [Chatbox AI 帮助中心](https://chatboxai.app/en/help-center) 或访问 [API易官网](https://api.apiyi.com)。
