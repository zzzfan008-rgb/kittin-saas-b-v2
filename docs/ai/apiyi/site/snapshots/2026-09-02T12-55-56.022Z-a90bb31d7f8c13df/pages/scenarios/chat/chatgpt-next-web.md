> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ChatGPT Next Web

> 一键部署的网页版 ChatGPT 集成指南

ChatGPT Next Web 是一款精心设计的 ChatGPT 网页客户端，支持一键部署和多种 AI 模型。

## 快速部署

### Vercel 一键部署

1. 点击 [一键部署](https://vercel.com/new/clone?repository-url=https://github.com/Yidadaa/ChatGPT-Next-Web)
2. 设置环境变量：
   * `OPENAI_API_KEY`：您的 API易 密钥
   * `BASE_URL`：`https://api.apiyi.com`
3. 完成部署

### Docker 部署

```bash theme={null}
docker run -d \
  --name chatgpt-next-web \
  -p 3000:3000 \
  -e OPENAI_API_KEY="您的API易密钥" \
  -e BASE_URL="https://api.apiyi.com" \
  yidadaa/chatgpt-next-web
```

## 配置说明

### 基础配置

在设置页面配置：

* **API Key**：输入 API易 密钥
* **接口地址**：`https://api.apiyi.com`

### 非 OpenAI 模型

对于 Claude、Gemini 等模型：

1. 在"自定义模型"中添加
2. 格式：`+模型名称@OpenAI`
3. 示例：`+claude-3-opus-20240229@OpenAI`

## 核心功能

### 预设提示词

内置丰富的提示词模板

### 面具功能

创建预设的 AI 角色

### 对话导出

支持 Markdown、图片、PDF 格式

### 访问控制

设置密码保护您的应用

## 环境变量

```bash theme={null}
# API 配置
OPENAI_API_KEY=您的API易密钥
BASE_URL=https://api.apiyi.com

# 访问控制
CODE=您的访问密码

# 模型配置
DEFAULT_MODEL=gpt-3.5-turbo
CUSTOM_MODELS=+claude-3-opus-20240229@OpenAI
```

## 使用技巧

### 模型选择策略

<Card title="查看当下热门模型推荐" icon="star" href="/api-capabilities/model-info">
  获取最新的模型推荐、性能对比和场景化使用建议。涵盖文本创作、编程开发、图像生成、视频生成等全场景。
</Card>

### 提示词优化

```markdown theme={null}
# 角色设定
你是一位经验丰富的[具体角色]

# 任务说明
请帮我[具体任务]

# 输出要求
- 要求1
- 要求2
```

## 常见问题

### 模型不显示

确保使用 v2.13.0+ 版本

### 连接失败

检查 API 地址：`https://api.apiyi.com`

### 回复中断

检查账户余额和网络连接

## 更新维护

### Vercel 更新

在 GitHub 中 Sync fork，Vercel 自动重新部署

### Docker 更新

```bash theme={null}
docker pull yidadaa/chatgpt-next-web
docker stop chatgpt-next-web
docker rm chatgpt-next-web
# 重新运行容器
```
