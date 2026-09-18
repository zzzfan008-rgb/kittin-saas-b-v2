> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Roo Code (VS Code)

> VS Code 中的 AI 开发团队 - 支持多模式配置的智能编程助手

## 概述

Roo Code 是一款强大的 VS Code AI 编程助手插件，为您提供一个完整的 AI 开发团队。它最大的特色是**多模式配置**，允许针对不同的开发任务使用不同的 AI 模型，实现最佳的开发效率。

<Card>
  **核心优势**

  * 🎯 **多模式配置**：为架构、编码、调试等不同任务分配专门的模型
  * 🤖 **Agent 智能体**：自动规划和执行复杂的开发任务
  * 🔄 **多文件操作**：理解项目结构，智能修改多个文件
  * 💰 **完全免费**：开源免费，只需支付 AI 模型使用费用
  * 🌐 **广泛兼容**：支持 400+ 主流 AI 模型
  * 🔌 **MCP 支持**：通过 Model Context Protocol 连接外部工具
</Card>

<Info>
  **Roo Code vs Cline**

  Roo Code 是 Cline 的一个分支项目，保留了 Cline 的核心功能，同时添加了独特的多模式配置系统。如果您需要为不同开发阶段使用不同模型，Roo Code 是更好的选择。
</Info>

## 维护状态与 Responses 端点支持

### 官方已停止更新（2026 年）

Roo Code 团队已发布**最后一个版本**，宣布重心转向 Roomote（其云端智能体平台）：扩展会继续无限期工作，但**不再有错误修复、新功能和模型更新**。官方建议想继续使用扩展形态的用户关注社区维护的 fork `ZooCode`，或回到其起源项目 [Cline](/scenarios/programming/cline)。

<img src="https://mintcdn.com/apiyillc/4Btanb2HSbrGHo5H/images/roo-code-final-version-notice.png?fit=max&auto=format&n=4Btanb2HSbrGHo5H&q=85&s=79f576a16c788e343200e409e1cfecf2" alt="Roo Code 最后一个版本公告：扩展继续无限期工作但不再有错误修复、新功能或模型更新，官方推荐 ZooCode 与 Cline" style={{maxWidth: "560px"}} width="860" height="706" data-path="images/roo-code-final-version-notice.png" />

<Warning>
  停更的直接影响：「OpenAI」provider 的**预置模型列表止步 `gpt-5.4`**，gpt-5.5 / gpt-5.6 系列等后续新模型无法在下拉中选到。存量功能不受影响。
</Warning>

### 为数不多支持 /v1/responses 的 IDE 插件（实测可用）

Roo Code 的「OpenAI」provider 走 `/v1/responses` 端点（注意与「OpenAI Compatible」provider 区分，后者走 `/v1/chat/completions`），并支持自定义 Base URL。这让它成为目前少数能在 IDE 里跑通 **GPT-5.4「推理 + 工具调用」** 的插件——GPT-5.4 及之后的模型在 chat/completions 上已被 OpenAI 禁止工具与推理同用（详见 [Responses 原生调用指南](/api-capabilities/openai/native)），而走 responses 不受此限。

配置方式：API Provider 选 **OpenAI**（不是 OpenAI Compatible），Base URL 填 `https://api.apiyi.com/v1`，模型选 `gpt-5.4`。

### 在 Trae 等 VS Code 系 IDE 中安装使用

Trae 等基于 VS Code 的 IDE 同样可以安装 Roo Code 插件。实测在 Trae 内安装 Roo Code、按上述方式配置 OpenAI provider 后，Responses 端点的工具调用与任务执行均正常——相当于给自定义模型只支持 chat/completions 的 [Trae](/scenarios/programming/trae) 补上了一条 Responses 通道（模型上限同样是 `gpt-5.4`）。

<img src="https://mintcdn.com/apiyillc/4Btanb2HSbrGHo5H/images/roo-code-in-trae-responses-test.png?fit=max&auto=format&n=4Btanb2HSbrGHo5H&q=85&s=19bcff9afd8acdb6f3e30b631b2da7a1" alt="在 Trae IDE 中通过 Roo Code 插件走 Responses 端点执行任务的实测截图" style={{maxWidth: "480px"}} width="800" height="1548" data-path="images/roo-code-in-trae-responses-test.png" />

## 快速安装

### 方式一：VS Code 扩展商店（推荐）

<Steps>
  <Step title="打开扩展商店">
    在 VS Code 中按 `Ctrl+Shift+X` (Windows/Linux) 或 `Cmd+Shift+X` (macOS)
  </Step>

  <Step title="搜索安装">
    搜索 "Roo Code" 并点击安装

    **扩展 ID**：`RooVeterinaryInc.roo-cline`
  </Step>

  <Step title="打开插件">
    安装完成后，点击左侧活动栏的 Roo Code 图标
  </Step>
</Steps>

### 方式二：Open VSX Registry

访问 [Open VSX Registry](https://open-vsx.org/) 搜索 Roo Code 进行安装。

## 配置 API易

### 基础配置

<Steps>
  <Step title="打开设置">
    点击 Roo Code 侧边栏的**齿轮图标**（设置按钮）
  </Step>

  <Step title="选择 API 提供商">
    在 API Provider 下拉菜单中选择 **OpenAI Compatible**
  </Step>

  <Step title="配置连接参数">
    **Base URL**: `https://api.apiyi.com/v1`

    **API Key**: 您的 API易 密钥（格式：`sk-***`）

    **Model Name**: 输入您要使用的模型名称
  </Step>

  <Step title="保存配置">
    点击保存，Roo Code 会自动验证连接
  </Step>
</Steps>

<Warning>
  **Base URL 配置要求**：

  * 必须使用 `https://api.apiyi.com/v1`（包含 `/v1` 路径）
  * 不要使用 `https://api.apiyi.com`（缺少 `/v1` 会导致连接失败）
</Warning>

### 获取 API易 密钥

<Steps>
  <Step title="访问 API易 后台">
    登录 `api.apiyi.com`
  </Step>

  <Step title="创建 API Key">
    进入「令牌管理」页面（`api.apiyi.com/token`），点击「创建新令牌」
  </Step>

  <Step title="复制密钥">
    复制生成的 API Key（格式：`sk-***`），并粘贴到 Roo Code 配置中
  </Step>
</Steps>

## 多模式配置（核心特性）

Roo Code 的独特之处在于可以为不同的开发模式分配不同的 AI 模型，实现专业化分工。

### 五大开发模式

<Tabs>
  <Tab title="Architect Mode">
    **架构模式** - 用于系统设计和架构规划

    **适合模型**：

    * Claude Sonnet（推理能力强，擅长架构设计）
    * GPT-4o（全面的技术知识）
    * DeepSeek V3（深度思考，性价比高）

    **典型任务**：

    ```text theme={null}
    设计一个微服务架构的电商系统：
    - 用户服务
    - 商品服务
    - 订单服务
    - 支付服务
    使用 Docker + Kubernetes 部署
    ```
  </Tab>

  <Tab title="Code Mode">
    **编码模式** - 用于实际代码生成和编写

    **适合模型**：

    * Claude Sonnet（代码质量高）
    * DeepSeek Coder（专业编程模型）
    * Qwen Coder（中文注释友好）

    **典型任务**：

    ```text theme={null}
    实现用户认证模块：
    - JWT token 生成和验证
    - 密码加密（bcrypt）
    - 登录/注册接口
    - 权限中间件
    ```
  </Tab>

  <Tab title="Ask Mode">
    **问答模式** - 用于技术咨询和实现规划

    **适合模型**：

    * GPT-4o-mini（快速响应，成本低）
    * Gemini Flash（速度快）
    * DeepSeek Chat（性价比高）

    **典型任务**：

    ```text theme={null}
    问：如何优化 React 组件的渲染性能？
    问：Redux 和 Zustand 的区别是什么？
    问：如何处理 Node.js 中的内存泄漏？
    ```
  </Tab>

  <Tab title="Debug Mode">
    **调试模式** - 用于错误排查和问题修复

    **适合模型**：

    * GPT-4o（理解复杂错误）
    * Claude Sonnet（代码分析能力强）
    * DeepSeek V3（深度分析）

    **典型任务**：

    ```text theme={null}
    调试这个错误：
    TypeError: Cannot read property 'map' of undefined

    帮我找出以下代码中的内存泄漏问题
    分析为什么这个异步函数没有正确执行
    ```
  </Tab>

  <Tab title="Orchestrator Mode">
    **编排模式** - 用于复杂任务的分解和协调

    **适合模型**：

    * Claude Opus（处理复杂任务）
    * GPT-4o（全局规划能力强）
    * DeepSeek V3（逻辑推理）

    **典型任务**：

    ```text theme={null}
    将整个项目从 JavaScript 迁移到 TypeScript：
    1. 分析现有代码结构
    2. 创建类型定义文件
    3. 逐步转换各模块
    4. 更新配置文件
    5. 运行测试验证
    ```
  </Tab>
</Tabs>

### 配置多模式

<Steps>
  <Step title="打开模式设置">
    在 Roo Code 设置中找到 **Mode Configuration** 区域
  </Step>

  <Step title="为每个模式选择模型">
    可以为每个模式单独配置：

    * API Provider
    * Model Name
    * Temperature（创造性参数）
    * Max Tokens
  </Step>

  <Step title="切换使用模式">
    在 Roo Code 界面中，通过模式选择器切换当前使用的模式
  </Step>
</Steps>

<Tip>
  **推荐配置策略**：

  * **Architect/Orchestrator** → 使用高质量模型（Claude Sonnet, GPT-4o）
  * **Code** → 使用专业编程模型（DeepSeek Coder, Claude Sonnet）
  * **Ask** → 使用快速经济模型（GPT-4o-mini, Gemini Flash）
  * **Debug** → 使用分析能力强的模型（Claude Sonnet, GPT-4o）
</Tip>

## 推荐模型

Roo Code 通过 API易 支持 400+ 主流 AI 模型，包括 OpenAI、Google Gemini、Claude、DeepSeek、国产模型等。

<Card title="查看编程开发模型推荐" icon="code" href="/api-capabilities/model-info">
  查看最新的编程模型推荐、性能对比和使用建议。包括顶级性能模型、高性价比模型、推理增强模型等详细分类。
</Card>

<Info>
  **为什么不在此列出具体模型？**

  AI 模型更新迭代速度非常快，为了确保您获取最准确的模型推荐信息，我们统一在 [模型推荐页面](/api-capabilities/model-info) 维护最新的模型列表、性能数据和使用建议。
</Info>

## 核心功能

### Agent 智能体模式

Roo Code 最强大的功能是 **Agent 模式**，AI 可以自主规划和执行复杂任务：

```text theme={null}
任务：创建一个完整的用户认证系统

Roo Code 会自动：
1. 分析需求，制定实现计划
2. 创建必要的文件和目录结构
3. 编写后端 API 代码
4. 创建前端登录/注册页面
5. 添加错误处理和验证
6. 生成单元测试
7. 更新相关文档
```

### 多文件智能编辑

理解项目结构，自动修改多个相关文件：

```text theme={null}
"将所有 API 调用从 axios 改为 fetch，并更新错误处理逻辑"

Roo Code 会：
- 找到所有使用 axios 的文件
- 转换为 fetch API
- 统一错误处理模式
- 更新类型定义（如果使用 TypeScript）
```

### 代码生成

<CodeGroup>
  ```python Python theme={null}
  # 输入描述
  """
  创建一个 FastAPI 端点，实现用户注册功能：
  - 接收 email 和 password
  - 验证邮箱格式
  - 密码加密存储
  - 返回 JWT token
  """

  # Roo Code 自动生成完整实现
  from fastapi import APIRouter, HTTPException
  from passlib.hash import bcrypt
  import jwt
  # ... 完整的代码实现
  ```

  ```javascript JavaScript theme={null}
  // 输入需求
  // 创建一个 React Hook 用于管理表单状态
  // 支持验证、错误提示、提交处理

  // Roo Code 生成
  import { useState, useCallback } from 'react';

  export function useForm(initialValues, validationRules) {
    // ... 完整的 Hook 实现
  }
  ```

  ```go Go theme={null}
  // 需求：实现一个并发安全的缓存
  // 支持 Set、Get、Delete、清理过期数据

  // Roo Code 生成完整的 Go 代码
  package cache

  import (
      "sync"
      "time"
  )

  type Cache struct {
      // ... 完整实现
  }
  ```
</CodeGroup>

### 代码审查和优化

```text theme={null}
审查这个 PR，关注：
- 代码规范
- 性能问题
- 安全漏洞
- 潜在 bug
- 可读性改进
```

Roo Code 会提供详细的审查报告和改进建议。

### 智能重构

```text theme={null}
重构这个函数，要求：
- 提高可读性
- 优化性能
- 添加错误处理
- 改进类型安全
```

### 测试生成

```text theme={null}
为 UserService 类生成完整的单元测试，包括：
- 正常流程测试
- 边界条件测试
- 错误处理测试
- Mock 外部依赖
```

## 常用命令

Roo Code 提供了丰富的命令面板命令：

| 命令                      | 快捷键              | 功能        |
| ----------------------- | ---------------- | --------- |
| Roo Code: New Task      | `Ctrl+Shift+L`   | 开始新任务     |
| Roo Code: Continue      | `Enter`          | 继续当前任务    |
| Roo Code: Approve       | `Ctrl+Enter`     | 批准 AI 的更改 |
| Roo Code: Reject        | `Ctrl+Backspace` | 拒绝更改      |
| Roo Code: Clear History | -                | 清除对话历史    |
| Roo Code: Switch Mode   | -                | 切换开发模式    |

<Tip>
  **快捷键提示**：可以在 VS Code 的键盘快捷方式设置中自定义 Roo Code 的快捷键。
</Tip>

## 高级功能

### API Configuration Profiles

为不同项目或团队创建不同的 API 配置文件：

```json theme={null}
{
  "roocode.apiProfiles": {
    "production": {
      "provider": "OpenAI Compatible",
      "baseUrl": "https://api.apiyi.com/v1",
      "apiKey": "sk-prod-key",
      "defaultModel": "claude-sonnet-4"
    },
    "development": {
      "provider": "OpenAI Compatible",
      "baseUrl": "https://api.apiyi.com/v1",
      "apiKey": "sk-dev-key",
      "defaultModel": "deepseek-chat"
    }
  }
}
```

### Codebase Indexing

Roo Code 会自动索引您的代码库，理解项目结构：

* 自动发现文件关系
* 理解代码依赖
* 智能上下文感知
* 跨文件引用追踪

### MCP 集成

通过 Model Context Protocol 连接外部工具：

* 数据库查询
* API 调用
* 文件系统操作
* Git 操作
* 自定义工具集成

### 自定义提示词模板

在设置中配置常用的提示词模板：

```json theme={null}
{
  "roocode.customTemplates": {
    "codeReview": "详细审查代码，关注性能、安全、可维护性",
    "optimize": "优化代码性能和可读性，添加必要的注释",
    "test": "生成全面的单元测试，覆盖边界情况",
    "refactor": "重构代码，遵循 SOLID 原则和设计模式"
  }
}
```

## 使用技巧

### 1. 提供清晰的上下文

<CardGroup cols={2}>
  <Card title="❌ 模糊描述" icon="x">
    "优化这个函数"
  </Card>

  <Card title="✅ 清晰描述" icon="check">
    "优化这个函数的性能，重点关注循环效率和内存使用，添加适当的注释说明优化思路"
  </Card>
</CardGroup>

### 2. 分步骤执行复杂任务

对于复杂任务，建议分解为多个步骤：

<Steps>
  <Step title="第一步：架构设计">
    使用 **Architect Mode** 设计整体架构
  </Step>

  <Step title="第二步：模块实现">
    切换到 **Code Mode** 实现各个模块
  </Step>

  <Step title="第三步：调试优化">
    使用 **Debug Mode** 排查问题
  </Step>

  <Step title="第四步：集成测试">
    使用 **Orchestrator Mode** 协调整合
  </Step>
</Steps>

### 3. 利用模式切换

针对不同任务类型切换最合适的模式：

* 需要设计架构？→ Architect Mode
* 写代码实现？→ Code Mode
* 快速咨询？→ Ask Mode
* 遇到 Bug？→ Debug Mode
* 复杂重构？→ Orchestrator Mode

### 4. 审查和批准更改

<Warning>
  **重要习惯**：

  * 始终审查 AI 生成的代码再批准
  * 理解每个更改的目的
  * 测试修改后的功能
  * 保持代码库的一致性
</Warning>

## 常见问题

<AccordionGroup>
  <Accordion title="Roo Code 和 Cline 有什么区别？">
    **主要区别**：

    1. **多模式配置**：Roo Code 的核心特性，Cline 不支持
    2. **代码库**：Roo Code 是 Cline 的 Fork，但在独立开发
    3. **更新频率**：Roo Code 更新更频繁，功能迭代快
    4. **社区**：两者都有活跃的社区，但侧重点不同

    **如何选择**：

    * 需要多模式？→ Roo Code
    * 需要稳定性？→ Cline
    * 都可以免费试用，选择最适合自己的
  </Accordion>

  <Accordion title="为什么连接失败或无法使用模型？">
    **常见原因和解决方案**：

    1. **Base URL 错误**：
       * ✅ 正确：`https://api.apiyi.com/v1`
       * ❌ 错误：`https://api.apiyi.com`

    2. **API Key 无效**：
       * 检查 Key 是否正确复制（注意首尾空格）
       * 确认账户余额充足
       * 验证 Key 状态为「启用」

    3. **模型名称错误**：
       * 确保使用正确的模型名称
       * 参考[模型列表](/api-capabilities/model-info)

    4. **网络问题**：
       * 检查网络连接
       * 尝试重启 VS Code
  </Accordion>

  <Accordion title="如何为不同模式配置不同的模型？">
    **配置步骤**：

    1. 打开 Roo Code 设置（齿轮图标）
    2. 找到 **Mode Configuration** 区域
    3. 为每个模式单独设置：
       * Architect Mode → `claude-sonnet-4`
       * Code Mode → `deepseek-coder`
       * Ask Mode → `gpt-4o-mini`
       * Debug Mode → `claude-sonnet-4`
       * Orchestrator Mode → `gpt-4o`
    4. 保存配置

    在使用时，通过模式选择器切换即可。
  </Accordion>

  <Accordion title="Roo Code 会自动修改我的代码吗？">
    **不会自动修改**，需要您的批准：

    1. Roo Code 会先展示建议的更改
    2. 您可以：
       * 查看 Diff（差异对比）
       * 批准（Apply）更改
       * 拒绝（Reject）更改
       * 修改后再批准
    3. 所有更改都在您的控制之下

    <Tip>
      建议启用版本控制（Git），这样可以随时回退不满意的更改。
    </Tip>
  </Accordion>

  <Accordion title="如何节省 API 使用成本？">
    **省钱策略**：

    1. **智能选择模型**：
       * 简单任务用便宜的模型（GPT-4o-mini, DeepSeek）
       * 复杂任务才用高级模型（Claude Opus, GPT-4o）

    2. **利用多模式配置**：
       * Ask Mode → 用最便宜的模型
       * Code/Debug Mode → 用中等价位的专业模型
       * Architect Mode → 仅在需要时用高级模型

    3. **充值优惠**：
       * API易 提供充值加赠（10%-20%）
       * 查看[充值活动](/faq/recharge-promotions)

    4. **控制上下文长度**：
       * 清除不必要的对话历史
       * 专注当前任务，减少无关上下文
  </Accordion>

  <Accordion title="Roo Code 支持哪些编程语言？">
    **几乎所有主流编程语言**，包括但不限于：

    * **Web**: JavaScript, TypeScript, HTML, CSS, React, Vue, Angular
    * **后端**: Python, Java, Go, Rust, C++, C#, PHP, Ruby
    * **移动**: Swift, Kotlin, Dart (Flutter), React Native
    * **数据**: SQL, R, Julia
    * **其他**: Shell, YAML, JSON, Markdown

    效果取决于：

    * 选择的 AI 模型
    * 模型的训练数据
    * 语言的流行程度
  </Accordion>
</AccordionGroup>

## 对比其他工具

| 特性           | Roo Code | Cline | Cursor | GitHub Copilot |
| ------------ | -------- | ----- | ------ | -------------- |
| **多模式配置**    | ✅        | ❌     | ❌      | ❌              |
| **Agent 模式** | ✅        | ✅     | ❌      | ❌              |
| **多文件编辑**    | ✅        | ✅     | 部分     | ❌              |
| **自定义 API**  | ✅        | ✅     | ✅      | ❌              |
| **免费开源**     | ✅        | ✅     | ❌      | ❌              |
| **模型选择**     | 400+     | 400+  | 有限     | GitHub 独家      |
| **学习曲线**     | 中等       | 中等    | 低      | 低              |

<Tip>
  **选择建议**：

  * **需要多模式配置** → Roo Code
  * **需要稳定成熟** → Cline
  * **需要简单易用** → Cursor
  * **GitHub 深度集成** → GitHub Copilot
</Tip>

## 价格说明

Roo Code 插件本身**完全免费**，您只需支付 AI 模型的使用费用。

通过 API易 使用 AI 模型的费用取决于您选择的模型和使用量。

<Card title="查看详细价格" icon="dollar-sign" href="/api-capabilities/model-info">
  查看所有模型的详细定价和性价比对比
</Card>

<Info>
  API易 提供充值优惠：充值越多，加赠比例越高（10%-20%）。首次充值还可获得额外加赠。查看 [充值活动详情](/faq/recharge-promotions)。
</Info>

## 相关资源

* [Roo Code 官方网站](https://roo-code.net/)
* [Roo Code 官方文档](https://docs.roocode.com/)
* [GitHub 仓库](https://github.com/RooCodeInc/Roo-Code)
* [VS Code 扩展商店](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline)
* [API易 快速开始](/getting-started)
* [模型推荐和价格](/api-capabilities/model-info)

## 获取帮助

<CardGroup cols={2}>
  <Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加 或 [点击联系客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    配置问题、使用指导
  </Card>

  <Card title="邮件咨询" icon="mail">
    **客服邮箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商务合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  **快速上手**：按照本文的「快速安装」和「配置 API易」章节，5 分钟即可开始使用 Roo Code 进行 AI 辅助编程！
</Tip>
