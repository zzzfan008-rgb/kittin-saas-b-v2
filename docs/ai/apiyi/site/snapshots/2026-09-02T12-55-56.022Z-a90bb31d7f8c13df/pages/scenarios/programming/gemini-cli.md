> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini CLI

> 通过 API易 使用 Gemini CLI 进行 AI 辅助编程，支持代码生成、代码审查、智能问答等功能

## 概述

Gemini CLI 是 Google 官方推出的命令行工具，允许您在终端中直接与 Gemini AI 模型交互。通过 API易 中转，您可以：

* 🚀 在终端中快速调用 Gemini 模型
* 💻 进行 AI 辅助编程和代码生成
* 🔍 代码审查和优化建议
* 📝 技术问答和文档生成
* 🌐 跨平台使用（Linux、macOS、Windows）

<Info>
  **为什么选择 API易？**

  通过 API易 使用 Gemini CLI，您可以享受更稳定的网络连接、更优惠的价格，以及 7×24 小时技术支持。
</Info>

## 快速开始

### 前置要求

* Node.js >= 18.0.0
* npm 或 yarn 包管理器
* API易 账号和 API Key

### 第一步：安装 Gemini CLI

<CodeGroup>
  ```bash npm theme={null}
  # 检查 Node.js 版本
  node --version  # 需要 >= 18

  # 全局安装 Gemini CLI
  npm install -g @google/gemini-cli

  # 验证安装
  gemini --version
  ```

  ```bash yarn theme={null}
  # 检查 Node.js 版本
  node --version  # 需要 >= 18

  # 使用 yarn 安装
  yarn global add @google/gemini-cli

  # 验证安装
  gemini --version
  ```
</CodeGroup>

### 第二步：获取 API易 密钥

<Steps>
  <Step title="注册/登录 API易">
    访问 `api.apiyi.com` 注册或登录您的账号
  </Step>

  <Step title="创建 API Key">
    进入后台「令牌管理」页面（`api.apiyi.com/token`），点击「创建新令牌」
  </Step>

  <Step title="复制密钥">
    复制生成的 API Key（格式：`sk-***`），妥善保存
  </Step>
</Steps>

### 第三步：配置环境变量

<Warning>
  **重要配置**：`GOOGLE_GEMINI_BASE_URL` 必须设置为 `https://api.apiyi.com`，不能有多余的路径（如 `/v1` 或 `/gemini`），否则会导致连接失败。
</Warning>

<Tabs>
  <Tab title="Zsh (macOS/Linux)">
    ```bash theme={null}
    # 编辑 .zshrc 文件
    nano ~/.zshrc

    # 添加以下环境变量
    export GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    export GEMINI_API_KEY="sk-your-api-key"  # 替换为你的 API易 密钥

    # 保存后重新加载配置
    source ~/.zshrc
    ```
  </Tab>

  <Tab title="Bash (Linux)">
    ```bash theme={null}
    # 编辑 .bashrc 文件
    nano ~/.bashrc

    # 添加以下环境变量
    export GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    export GEMINI_API_KEY="sk-your-api-key"  # 替换为你的 API易 密钥

    # 保存后重新加载配置
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="PowerShell (Windows)">
    ```powershell theme={null}
    # 设置环境变量
    $env:GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    $env:GEMINI_API_KEY="sk-your-api-key"

    # 永久保存（可选）
    [System.Environment]::SetEnvironmentVariable('GOOGLE_GEMINI_BASE_URL', 'https://api.apiyi.com', 'User')
    [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'sk-your-api-key', 'User')
    ```
  </Tab>

  <Tab title="CMD (Windows)">
    ```cmd theme={null}
    # 临时设置环境变量
    set GOOGLE_GEMINI_BASE_URL=https://api.apiyi.com
    set GEMINI_API_KEY=sk-your-api-key

    # 永久保存（需要管理员权限）
    setx GOOGLE_GEMINI_BASE_URL "https://api.apiyi.com"
    setx GEMINI_API_KEY "sk-your-api-key"
    ```
  </Tab>
</Tabs>

### 第四步：初始化和测试

<Steps>
  <Step title="启动 Gemini CLI">
    ```bash theme={null}
    gemini
    ```
  </Step>

  <Step title="首次认证">
    在交互界面中输入：

    ```bash theme={null}
    /auth
    ```

    选择：**Gemini API Key (AI Studio)**
  </Step>

  <Step title="测试连接">
    ```bash theme={null}
    # 简单测试
    gemini "Hello, 测试连接是否正常"

    # 编程相关测试
    gemini "解释一下 React Hooks 的使用方法"
    gemini "编写一个 Python 函数来计算斐波那契数列"
    ```
  </Step>
</Steps>

## 核心功能

### 代码生成

<Tabs>
  <Tab title="函数生成">
    ```bash theme={null}
    gemini "用 Python 写一个快速排序算法，包含详细注释"
    ```

    **输出示例**：

    ```python theme={null}
    def quick_sort(arr):
        """
        快速排序算法
        时间复杂度：平均 O(n log n)，最坏 O(n²)
        空间复杂度：O(log n)
        """
        if len(arr) <= 1:
            return arr

        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]

        return quick_sort(left) + middle + quick_sort(right)
    ```
  </Tab>

  <Tab title="完整项目脚手架">
    ```bash theme={null}
    gemini "创建一个 Express.js REST API 项目结构，包含用户认证和数据库配置"
    ```
  </Tab>

  <Tab title="单元测试">
    ```bash theme={null}
    gemini "为这个函数编写 Jest 单元测试：
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }"
    ```
  </Tab>
</Tabs>

### 代码审查

```bash theme={null}
# 审查代码质量
gemini "审查以下代码的性能问题和潜在 bug：
[粘贴你的代码]
"

# 安全审计
gemini "检查这段代码的安全漏洞，特别关注 SQL 注入和 XSS 攻击"

# 最佳实践建议
gemini "这段 React 组件有什么可以优化的地方？遵循最佳实践吗？"
```

### 技术问答

```bash theme={null}
# 概念解释
gemini "解释一下 JavaScript 的闭包概念，并给出实际应用场景"

# 错误排查
gemini "为什么我的 Promise 没有被正确 resolve？"

# 性能优化
gemini "如何优化 React 组件的渲染性能？"

# 架构设计
gemini "微服务架构和单体架构的优缺点对比"
```

### 文档生成

```bash theme={null}
# 生成 README
gemini "为我的 Node.js 库生成一个专业的 README.md，包括安装、使用示例、API 文档"

# API 文档
gemini "为这个 REST API 端点生成 OpenAPI 3.0 规范文档"

# 代码注释
gemini "为以下代码添加详细的 JSDoc 注释"
```

## 交互式命令

在 Gemini CLI 交互模式下，可以使用以下命令：

| 命令       | 说明      | 示例                       |
| -------- | ------- | ------------------------ |
| `/auth`  | 重新认证    | `/auth`                  |
| `/model` | 切换模型    | `/model gemini-pro`      |
| `/clear` | 清除对话历史  | `/clear`                 |
| `/help`  | 显示帮助信息  | `/help`                  |
| `/exit`  | 退出 CLI  | `/exit` 或 `Ctrl+C`       |
| `/save`  | 保存对话到文件 | `/save conversation.txt` |

<Tip>
  **模型切换**：使用 `/model` 命令可以在不同的 Gemini 模型之间切换，如 `gemini-3-pro-preview`、`gemini-2.5-flash`、`gemini-2.5-pro` 等。
</Tip>

## 支持的模型

通过 API易，您可以使用以下最新 Gemini 模型：

### Gemini 3 系列（推荐）

| 模型                                | 适用场景         | 特点                      |
| --------------------------------- | ------------ | ----------------------- |
| **gemini-3-pro-preview**          | 高质量代码生成、复杂推理 | 🏆 性能最强，LMArena 排行榜全球第一 |
| **gemini-3-pro-preview-thinking** | 超复杂推理、算法设计   | 🧠 思维链输出，深度推理能力         |

### Gemini 2.5 系列

| 模型                        | 适用场景       | 特点             |
| ------------------------- | ---------- | -------------- |
| **gemini-2.5-pro**        | 专业级代码生成    | ⚡ 高性能，100 万上下文 |
| **gemini-2.5-flash**      | 快速响应、日常开发  | 🚀 速度快，成本低     |
| **gemini-2.5-flash-lite** | 轻量级任务、批量调用 | 💰 超低成本，高频调用   |

<Info>
  **推荐配置**：

  * 复杂编程任务、架构设计：`gemini-3-pro-preview`
  * 日常代码生成、问答：`gemini-2.5-flash`
  * 批量处理、快速迭代：`gemini-2.5-flash-lite`
</Info>

<Card title="查看完整模型列表" icon="list" href="/api-capabilities/model-info">
  查看 API易 支持的所有 Gemini 模型、详细价格和性能对比
</Card>

## 高级用法

### VS Code 集成

在 VS Code 中使用 Gemini CLI 扩展：

```json theme={null}
{
  "gemini.apiKey": "sk-your-api-key",
  "gemini.baseUrl": "https://api.apiyi.com",
  "gemini.model": "gemini-3-pro-preview",
  "gemini.temperature": 0.7,
  "gemini.maxTokens": 4000
}
```

### GitHub Actions 集成

自动化代码审查：

```yaml theme={null}
name: Gemini Code Review
on:
  pull_request:
    branches: [ main ]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli

      - name: Run Code Review
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
          GOOGLE_GEMINI_BASE_URL: https://api.apiyi.com
        run: |
          gemini "审查这个 Pull Request 的代码质量、安全性和性能：
          $(git diff origin/main...HEAD)"
```

### 批处理脚本

创建自动化脚本：

```bash theme={null}
#!/bin/bash

# 批量代码审查
for file in src/**/*.js; do
  echo "Reviewing $file..."
  gemini "审查文件 $file 的代码质量" < "$file"
done

# 生成项目文档
gemini "为整个项目生成技术文档大纲" < README.md
```

## 常见问题

<AccordionGroup>
  <Accordion title="连接失败或认证错误？">
    **检查清单**：

    1. **环境变量是否正确**：

       ```bash theme={null}
       echo $GOOGLE_GEMINI_BASE_URL
       echo $GEMINI_API_KEY
       ```

       确保输出为：

       * `GOOGLE_GEMINI_BASE_URL`: `https://api.apiyi.com`（不要有 /v1 或其他路径）
       * `GEMINI_API_KEY`: `sk-` 开头的完整密钥

    2. **重新加载环境变量**：
       ```bash theme={null}
       source ~/.zshrc  # 或 source ~/.bashrc
       ```

    3. **重启终端**：完全关闭并重新打开终端窗口

    4. **验证 API Key**：登录 API易 后台确认 Key 是否有效且余额充足
  </Accordion>

  <Accordion title="如何切换不同的 Gemini 模型？">
    在交互模式下使用 `/model` 命令：

    ```bash theme={null}
    /model gemini-3-pro-preview
    /model gemini-3-pro-preview-thinking
    /model gemini-2.5-flash
    ```

    或在命令行直接指定：

    ```bash theme={null}
    gemini --model gemini-3-pro-preview "你的问题"
    gemini --model gemini-2.5-flash "快速测试"
    ```
  </Accordion>

  <Accordion title="如何保存对话历史？">
    **方法一**：使用 `/save` 命令

    ```bash theme={null}
    /save conversation-2025-01-01.txt
    ```

    **方法二**：重定向输出

    ```bash theme={null}
    gemini "你的问题" > output.txt
    gemini "你的问题" | tee output.txt  # 同时显示和保存
    ```

    **方法三**：使用会话管理

    ```bash theme={null}
    gemini --session my-project "继续之前的讨论"
    ```
  </Accordion>

  <Accordion title="Node.js 版本不满足要求怎么办？">
    **推荐使用 nvm 管理 Node.js 版本**：

    ```bash theme={null}
    # 安装 nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

    # 安装 Node.js 18+
    nvm install 18
    nvm use 18
    nvm alias default 18

    # 验证版本
    node --version
    ```
  </Accordion>

  <Accordion title="为什么响应速度慢？">
    **可能原因和解决方案**：

    1. **网络问题**：API易 提供国内优化节点，通常响应很快
    2. **模型选择**：使用 `gemini-2.5-flash` 或 `gemini-2.5-flash-lite` 获得最快响应
    3. **Token 限制**：减少单次请求的复杂度
    4. **并发请求**：避免同时发送大量请求

    **测试连接速度**：

    ```bash theme={null}
    time gemini --model gemini-2.5-flash "Hello"
    ```
  </Accordion>

  <Accordion title="如何在 Windows 上使用？">
    **推荐使用 PowerShell**：

    1. 安装 Node.js（从官网下载安装包）
    2. 以管理员身份运行 PowerShell
    3. 设置环境变量：
       ```powershell theme={null}
       [System.Environment]::SetEnvironmentVariable('GOOGLE_GEMINI_BASE_URL', 'https://api.apiyi.com', 'User')
       [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'sk-your-key', 'User')
       ```
    4. 重启 PowerShell
    5. 安装和使用 Gemini CLI

    **或使用 WSL**（Windows Subsystem for Linux）获得更好的体验。
  </Accordion>
</AccordionGroup>

## 最佳实践

### 提示词优化

<CardGroup cols={2}>
  <Card title="明确具体" icon="target">
    ❌ "优化这段代码"

    ✅ "优化这段代码的性能，重点关注循环效率和内存使用"
  </Card>

  <Card title="提供上下文" icon="book">
    ❌ "这个函数有什么问题？"

    ✅ "这是一个用于处理用户登录的函数，目前遇到异步错误，帮我找出问题"
  </Card>

  <Card title="分步骤请求" icon="list-ordered">
    ❌ "帮我完成整个项目"

    ✅ "第一步：设计数据库模型；第二步：创建 API 路由；第三步：..."
  </Card>

  <Card title="要求示例" icon="code">
    ❌ "解释闭包"

    ✅ "解释 JavaScript 闭包，并给出 3 个实际应用场景和代码示例"
  </Card>
</CardGroup>

### 工作流建议

<Steps>
  <Step title="问题定义">
    清晰描述要解决的问题或实现的功能
  </Step>

  <Step title="获取方案">
    使用 Gemini CLI 生成初步解决方案或代码
  </Step>

  <Step title="审查优化">
    要求 AI 审查自己生成的代码，找出潜在问题
  </Step>

  <Step title="迭代改进">
    根据反馈逐步优化，直到满足需求
  </Step>

  <Step title="文档补充">
    生成必要的注释和文档
  </Step>
</Steps>

## 价格说明

使用 API易 调用 Gemini 模型的费用取决于您选择的模型和使用量。

<Card title="查看详细价格" icon="dollar-sign" href="/api-capabilities/model-info">
  查看所有 Gemini 模型的详细定价和性价比对比
</Card>

<Info>
  API易 提供充值优惠：充值越多，加赠比例越高（10%-20%）。首次充值还可获得额外加赠。查看 [充值活动详情](/faq/recharge-promotions)。
</Info>

## 相关资源

* [Gemini CLI 官方文档](https://ai.google.dev/gemini-api/docs/cli)
* [API易 快速开始指南](/getting-started)
* [模型推荐和价格对比](/api-capabilities/model-info)
* [充值优惠活动](/faq/recharge-promotions)
* [API 使用手册](/api-manual)

## 获取帮助

<CardGroup cols={2}>
  <Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加 或 [点击联系客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    技术咨询、使用指导
  </Card>

  <Card title="邮件咨询" icon="mail">
    **客服邮箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商务合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  **快速上手**：按照本文的「快速开始」章节，5 分钟即可完成配置并开始使用 Gemini CLI！
</Tip>
