> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cursor

> AI 驱动的代码编辑器集成指南

# Cursor

Cursor 是一款 AI 驱动的代码编辑器，通过集成 API易，您可以在编写代码时获得强大的 AI 辅助功能。

## 快速配置

### 1. 打开设置

点击右上角的齿轮图标 ⚙️，选择 **Models** 选项

### 2. 配置 API

* **OpenAI API Key**：输入您的 API易 密钥（直接用默认令牌即可）
* **Override OpenAI Base URL**：勾选并输入 `https://api.apiyi.com/v1`
* 点击 **Verify** 验证配置

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/cursor-setting.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=47cf7afe1c00e511395e34cc033b877e" alt="Cursor 配置界面" width="2066" height="990" data-path="images/cursor-setting.png" />

### 3. 模型配置

<Warning>
  **重要说明**：Cursor 目前**不支持 Agent 模式**，只能使用 Chat 聊天对话模式。您可以在对话过程中让 AI 生成代码，然后手动应用到实际代码中。

  如果您是新手并且非常依赖 Agent 模式进行 Vibe Coding，建议：

  * 购买 Cursor 官方会员使用其原生服务
  * 或使用替代方案：VS Code 的 **RooCode** 或 **Cline** 插件（支持 Agent 模式）
</Warning>

#### 推荐模型配置

Cursor 通过 API易 支持 400+ 主流 AI 模型，包括 OpenAI、Google Gemini、Claude、DeepSeek 等。

<Card title="查看编程开发模型推荐" icon="code" href="/api-capabilities/model-info">
  查看最新的编程模型推荐、性能对比和使用建议。包括顶级性能模型、高性价比模型、推理增强模型等详细分类。
</Card>

<Info>
  **为什么不在此列出具体模型？**

  AI 模型更新迭代速度非常快，为了确保您获取最准确的模型推荐信息，我们统一在 [模型推荐页面](/api-capabilities/model-info) 维护最新的模型列表、性能数据和使用建议。
</Info>

## 使用模式说明

### Chat 模式工作流程

由于 Cursor 不支持 Agent 模式，推荐以下工作流程：

1. **对话生成代码**
   * 使用 `Ctrl/Cmd + L` 打开聊天
   * 描述您的需求，让 AI 生成代码
   * 查看生成的代码片段

2. **手动应用代码**
   * 从聊天窗口复制代码
   * 粘贴到目标文件
   * 或使用 "Apply" 按钮（如果可用）

3. **迭代优化**
   * 继续对话要求修改
   * 重复应用过程

### 替代方案对比

| 工具                     | Agent 模式 | 优势                  | 劣势         |
| ---------------------- | -------- | ------------------- | ---------- |
| **Cursor**             | ❌        | 界面优雅，补全体验好          | 无 Agent 模式 |
| **Cline (VS Code)**    | ✅        | 完整 Agent 功能，可自动修改文件 | 需要 VS Code |
| **RooCode (VS Code)**  | ✅        | Agent 模式，支持多文件编辑    | 较新，功能还在完善  |
| **Continue (VS Code)** | ✅        | 开源，可定制性强            | 配置较复杂      |

## 核心功能

### 智能代码补全

* **Tab 补全**：按 Tab 接受 AI 建议
* **多行补全**：支持函数级别的代码生成
* **上下文感知**：基于项目结构提供建议

### AI 对话

* **Ctrl/Cmd + K**：打开命令面板
* **Ctrl/Cmd + L**：侧边栏对话
* **代码解释**：选中代码后询问 AI

### 代码编辑

* **生成代码**：描述需求，AI 自动生成
* **重构建议**：获取优化建议
* **错误修复**：AI 协助定位和修复错误

## 快捷键

| 快捷键            | 功能      |
| -------------- | ------- |
| `Ctrl/Cmd + K` | AI 命令面板 |
| `Ctrl/Cmd + L` | AI 对话   |
| `Tab`          | 接受代码建议  |
| `Esc`          | 取消建议    |

## 使用技巧

### 1. 提供清晰的上下文

```javascript theme={null}
// @context: React组件，用于用户认证
// @requirements: 需要支持OAuth2登录
// @constraints: 兼容NextJS 13+

// AI会基于这些信息生成更准确的代码
```

### 2. 优化提示词

```
// 不好的提示
"修复这个函数"

// 好的提示
"修复calculateTotal函数中的浮点数精度问题，确保金额计算准确到小数点后两位"
```

### 3. 充分利用 Chat 模式

虽然没有 Agent 模式，但可以：

* 让 AI 生成完整的文件内容
* 要求 AI 提供详细的修改说明
* 使用 AI 进行代码审查和重构建议

## 故障排除

### 连接超时

1. 检查网络连接
2. 确认 API 地址：`https://api.apiyi.com/v1`
3. 验证 API 密钥有效性

### 模型不响应

1. 检查账户余额
2. 尝试切换模型
3. 重启 Cursor

### 代码建议质量差

1. 提供更多项目上下文
2. 使用更具体的提示词
3. 尝试不同模型

## 最佳实践

### 项目级配置

在项目根目录创建 `.cursor-settings.json`：

```json theme={null}
{
  "model": "gpt-4.1",
  "temperature": 0.7,
  "contextFiles": ["README.md", "package.json"],
  "rules": [
    "使用TypeScript严格模式",
    "遵循ESLint规范",
    "添加适当的注释"
  ]
}
```

### 代码规范

在提示中明确代码规范：

* 使用 TypeScript
* 遵循 Airbnb 规范
* 添加 JSDoc 注释
* 使用函数式风格

### 安全意识

* 不在代码中包含敏感信息
* 审查 AI 生成的代码
* 验证第三方依赖安全性

## 集成工作流

### Git 集成

```bash theme={null}
# AI 生成 commit message
git add .
# 使用 Cursor AI 生成描述性的提交信息
```

### 测试驱动开发

1. 先写测试用例
2. 让 AI 生成实现代码
3. 运行测试验证
4. 迭代优化

### 代码审查

使用 AI 进行代码审查：

```
请审查这段代码，关注：
1. 性能问题
2. 安全漏洞  
3. 代码规范
4. 最佳实践
```

## 需要 Agent 模式？

如果您需要 AI 能够自动修改多个文件、执行复杂的重构任务，推荐查看：

<CardGroup cols={2}>
  <Card title="Cline" icon="bot" href="/scenarios/programming/cline">
    VS Code 中功能完整的 AI Agent，支持自动修改文件
  </Card>

  <Card title="RooCode" icon="code" href="https://marketplace.visualstudio.com/items?itemName=roocode.roocode">
    新兴的 VS Code AI Agent 插件，支持多文件编辑
  </Card>
</CardGroup>

<Info>
  **提示**：如果您是 Vibe Coding 爱好者，需要 AI 自主完成复杂编程任务，建议使用支持 Agent 模式的工具，或考虑购买 Cursor 官方会员以获得完整体验。
</Info>

需要更多帮助？请访问 [API易官网](https://api.apiyi.com) 获取支持。
