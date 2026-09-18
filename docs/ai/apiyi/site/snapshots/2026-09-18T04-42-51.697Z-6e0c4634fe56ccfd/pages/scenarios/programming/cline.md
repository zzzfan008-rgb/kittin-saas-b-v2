> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cline (VS Code)

> VS Code 中的 AI 编程助手集成指南

# Cline (VS Code)

Cline（原 Claude Dev）是一款强大的 VS Code AI 编程助手插件，支持多种 AI 模型。通过 API易，您可以灵活切换使用各种主流 AI 模型辅助编程。

## 快速安装

### 1. 安装插件

在 VS Code 扩展商店搜索 "Cline" 并安装

### 2. 配置 API易

1. 点击左侧的 Cline 图标
2. 点击设置按钮（齿轮图标）
3. 选择 **OpenAI Compatible**
4. 配置参数：
   * **Base URL**：`https://api.apiyi.com/v1`
   * **API Key**：您的 API易 密钥
   * **Model Name**：输入模型名称

### 推荐模型

Cline 通过 API易 支持 400+ 主流 AI 模型，包括 OpenAI、Google Gemini、Claude、DeepSeek、国产模型等。

<Card title="查看编程开发模型推荐" icon="code" href="/api-capabilities/model-info">
  查看最新的编程模型推荐、性能对比和使用建议。包括顶级性能模型、高性价比模型、推理增强模型等详细分类。
</Card>

<Info>
  **为什么不在此列出具体模型？**

  AI 模型更新迭代速度非常快，为了确保您获取最准确的模型推荐信息，我们统一在 [模型推荐页面](/api-capabilities/model-info) 维护最新的模型列表、性能数据和使用建议。
</Info>

## 核心功能

### 智能代码补全

```python theme={null}
# 输入注释，AI 自动生成代码
# 计算斐波那契数列的第 n 项
def fibonacci(n):
    # Cline 会自动补全实现
```

### 代码解释

选中代码片段，使用：

* `Cline: Explain Code`：解释代码
* `Cline: Explain Error`：解释错误

### 代码重构

* **优化性能**：提供性能优化建议
* **改进可读性**：重构复杂代码
* **修复问题**：自动修复常见问题

### 生成测试

```javascript theme={null}
// 原始函数
function add(a, b) {
    return a + b;
}

// Cline 生成的测试
describe('add function', () => {
    test('should add two numbers correctly', () => {
        expect(add(2, 3)).toBe(5);
        expect(add(-1, 1)).toBe(0);
    });
});
```

## 常用命令

| 命令              | 快捷键            | 功能    |
| --------------- | -------------- | ----- |
| Cline: Ask      | `Ctrl+Shift+L` | 询问 AI |
| Cline: Explain  | `Ctrl+Shift+E` | 解释代码  |
| Cline: Refactor | `Ctrl+Shift+R` | 重构代码  |
| Cline: Generate | `Ctrl+Shift+G` | 生成代码  |

## 高级功能

### 多文件操作

Cline 可以理解和操作多个相关文件：

```bash theme={null}
"将 utils.js 中的函数移动到 helpers.js，并更新所有引用"
```

### 架构设计

生成项目架构：

```text theme={null}
请为电商后台管理系统设计架构，包含：
- 用户管理
- 商品管理
- 订单处理
- 数据分析
使用 React + Node.js + PostgreSQL
```

### 代码审查

```text theme={null}
Review PR:
- 检查代码规范
- 发现潜在 bug
- 性能优化建议
- 安全漏洞扫描
```

## 使用技巧

### 1. 上下文管理

提供更好的上下文：

```typescript theme={null}
// @context: React 组件用于用户认证
// @requirements: 支持 OAuth2 登录流程
// @constraints: 兼容 NextJS 13+

// AI 基于上下文生成更准确的代码
```

### 2. 自定义提示词

在设置中配置：

```json theme={null}
{
    "cline.customPrompts": {
        "codeReview": "审查代码，关注性能、安全、规范",
        "optimize": "优化代码性能和可读性",
        "document": "生成详细的中文文档"
    }
}
```

### 3. 项目级配置

创建 `.cline/config.json`：

```json theme={null}
{
    "model": "claude-3-5-sonnet-20241022",
    "temperature": 0.7,
    "language": "zh-CN",
    "codeStyle": {
        "naming": "camelCase",
        "indent": 4,
        "quotes": "single"
    }
}
```

## 故障排除

### 连接失败

检查配置：

* Base URL：`https://api.apiyi.com/v1`
* API 密钥是否有效
* 网络连接是否正常

### 响应超时

解决方案：

1. 使用更快的模型
2. 减少请求复杂度
3. 分解大任务

### 生成质量差

改进方法：

1. 提供更多上下文
2. 使用更强大的模型
3. 明确指定需求

### 调用 gpt-5.6 / gpt-5.5 / gpt-5.4 报 400

报错 `Function tools with reasoning_effort are not supported for ... in /v1/chat/completions`（400）是 OpenAI 从 GPT-5.4 系列起的官方限制：`/v1/chat/completions` 上工具调用不能与非 `none` 的 `reasoning_effort` 同用。Cline 的 OpenAI Compatible 方式固定走 chat/completions 端点，暂不支持 `/v1/responses`，客户端侧无法绕过。这条限制的来龙去脉见 [端点选型与迁移](/api-capabilities/openai/responses-migration)。

解决办法：

1. 改用不受限模型：`gpt-5.1` / `gpt-5.2`、Claude、Gemini、DeepSeek 等
2. 换用支持 Responses 端点的客户端，完整支持清单见 [OpenAI Responses API 原生调用指南](/api-capabilities/openai/native)

## 最佳实践

### 1. 模型选择策略

根据不同的编程任务类型，选择合适的模型可以提高效率并降低成本。

<Card title="查看编程场景模型推荐" icon="lightbulb" href="/api-capabilities/model-info">
  查看针对不同编程场景的模型推荐，包括代码生成、复杂推理、代码审查、快速响应等场景的最佳模型选择。
</Card>

### 2. 提示词优化

```text theme={null}
❌ 不好的提示：修复这个函数

✅ 好的提示：修复 calculateTotal 函数中的浮点数精度问题，
确保金额计算准确到小数点后两位
```

### 3. 渐进式开发

1. 先生成基础框架
2. 逐步添加功能
3. 最后优化性能
4. 添加错误处理

### 4. 安全意识

* 不在代码中包含敏感信息
* 审查 AI 生成的代码
* 验证第三方依赖
* 注意安全漏洞

## 集成工作流

### Git 集成

```bash theme={null}
# 自动生成 commit message
git add .
# Cline: 根据改动生成 commit message
```

### 测试驱动开发

1. 先写测试用例
2. Cline 生成实现代码
3. 运行测试验证
4. 迭代优化

### CI/CD 集成

生成配置文件：

```yaml theme={null}
# Cline 可以生成 GitHub Actions 配置
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
```

## Token 优化与成本控制

### 1. 监控 Token 使用

* **实时监控**：在 Cline 侧边栏查看估算成本
* **会话限制**：保持会话简短，避免上下文累积
* **定期重置**：长任务分多个会话完成

### 2. 智能模型切换

```text theme={null}
规划阶段 → DeepSeek-R1 或 o3（推理能力强，成本低）
实现阶段 → Claude-4-Sonnet 或 o4-mini（编程能力最强）
简单任务 → GPT-3.5-Turbo 或 Gemini-2.5-Flash（速度快）
长文本 → Gemini-2.5-Pro（2M 上下文）
```

### 3. 使用 .clinerules 配置

创建项目根目录下的 `.clinerules` 文件：

```text theme={null}
# 限制 Cline 操作范围
- 不允许修改 node_modules
- 不允许删除重要文件
- 限制单次修改文件数量
- 要求确认破坏性操作
```

### 4. 替代方案降低成本

#### GitHub Copilot Pro 集成

* 月费仅 \$10，无限使用
* 通过 VSCode LM API 使用
* 适合高频使用场景

#### 本地模型 (Ollama)

```bash theme={null}
# 安装 Ollama 并运行本地模型
ollama run deepseek-coder:6.7b
ollama run qwen2.5-coder:7b
ollama run codellama:13b
```

#### 使用国产模型降低成本

* `qwen-turbo`（阿里通义千问）
* `glm-4`（智谱清华系）
* `ernie-4.0`（百度文心一言）

### 5. 缓存优化

* 使用 Requesty Router 等服务
* 可节省超过 50% 的 API 成本
* 自动缓存重复请求

## 最佳实践进阶

### 1. Plan/Act 模式使用

* **Plan 模式**：用于设计和审查，只读不改
* **Act 模式**：直接实现，适合简单任务
* **模型记忆**：Cline 会记住每种模式的模型偏好

### 2. 上下文管理技巧

```typescript theme={null}
// 明确的上下文注释
// @context: React 18 + TypeScript 5
// @requirements: 支持 SSR，兼容 Next.js 14
// @constraints: 不使用外部状态管理库
// @performance: 首屏加载 < 3s
```

### 3. 任务管理系统

* **收藏重要对话**：使用星标功能
* **导出有价值内容**：保存为 Markdown
* **任务排序**：按成本、Token 使用量排序
* **批量清理**：定期清理低价值会话

### 4. 避免 Token 爆炸

```text theme={null}
❌ 错误做法：
- 在同一会话中处理多个无关任务
- 让 Cline 读取整个大型代码库
- 不断修改需求导致上下文混乱

✅ 正确做法：
- 每个功能开新会话
- 只包含相关文件
- 明确需求后再开始
- 完成后立即提交代码
```

### 5. 成本效益分析

| 场景      | 传统开发时间 | Cline 成本 | 时间节省   | ROI |
| ------- | ------ | -------- | ------ | --- |
| CRUD 模块 | 4 小时   | \$5-10   | 3.5 小时 | 极高  |
| 复杂重构    | 2 天    | \$20-50  | 1.5 天  | 高   |
| 架构设计    | 1 周    | \$50-100 | 5 天    | 高   |

### 6. 工作流优化

```bash theme={null}
# 1. 规划阶段（使用推理模型）
"使用 o3 或 DeepSeek-R1 分析需求并制定架构方案"

# 2. 实现阶段（使用编程专精模型）
"切换到 Claude-4-Sonnet 或 o4-mini 实现核心功能"

# 3. 测试优化（使用快速模型）
"使用 Gemini-2.5-Flash 或 GPT-3.5-Turbo 进行单元测试和优化"

# 4. 文档阶段（使用综合模型）
"使用 GPT-4.1 或 Qwen-Max 生成项目文档"

# 5. 代码审查（使用长上下文模型）
"使用 Gemini-2.5-Pro 进行全面的代码审查"
```

## 性能优化

### 1. 模型切换

根据任务选择模型：

* 开发阶段：轻量模型
* 复杂任务：高级模型
* 生产环境：平衡性能和成本

### 2. 缓存策略

* 启用响应缓存
* 缓存常用代码片段
* 定期清理缓存

### 3. 请求优化

* 批量处理相关请求
* 使用流式响应
* 设置合理超时

需要更多帮助？请查看 [详细集成文档](/scenarios/programming/cline)。
