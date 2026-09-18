> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API 手册

> API易 接口使用手册。API易 是 OpenAI 兼容的 AI 网关，一套代码即可接入 400+ 主流大模型，本页帮你快速找到模型、在线调试与集成方式。

API易 是一个 **OpenAI 兼容的 AI 网关**：用一套标准接口、一个 API Key，即可调用 400+ 主流大模型。本页是导航入口——帮你快速找到**该用哪个模型**、**在线调试接口**，以及**如何集成**。

## 平台概览

### OpenAI 兼容模式

API易 采用 **OpenAI 兼容格式**，跑通一次后，切换模型只需**更换 `model` 字段**，其余代码完全不变：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

# 切换模型 = 只改 model 这一个字段，其它代码不动
response = client.chat.completions.create(
    model="gpt-5-chat-latest",   # 换成任意支持的模型名即可
    messages=[{"role": "user", "content": "你好！"}]
)
print(response.choices[0].message.content)
```

<Note>
  具体可用的模型名称、定价与推荐场景，请查看下方「选择模型」中的两个专页，不在本页罗列（避免信息过期）。
</Note>

### 功能支持范围

<CardGroup cols={2}>
  <Card title="支持的功能" icon="circle-check">
    * 对话补全（Chat Completions）
    * 图像 / 视频生成
    * 语音转录（Whisper）
    * 嵌入向量（Embeddings）
    * 函数调用（Function Calling）
    * 流式输出（SSE）
    * 标准 OpenAI 参数：`temperature`、`top_p`、`max_tokens` 等
    * Responses 端点
  </Card>

  <Card title="暂不支持的功能" icon="circle-x">
    * 微调接口（Fine-tuning）
    * Files 文件管理接口
    * 组织管理接口
    * 计费管理接口
  </Card>
</CardGroup>

## 选择模型

不确定用哪个模型？以下两个专页保持更新，含定价、能力对比与推荐场景：

<CardGroup cols={2}>
  <Card title="文本 / 多模态模型推荐" icon="sparkles" href="/api-capabilities/model-info">
    GPT、Claude、Gemini、Grok、DeepSeek、通义、Kimi、GLM 等文本与多模态模型的能力、定价与选型建议。
  </Card>

  <Card title="图片 / 视频生成模型" icon="image" href="/api-capabilities/image-video-models">
    Nano Banana、GPT-image、Seedream、Flux 等图像模型，以及 VEO、Sora、Wan 等视频生成模型的定价与用法。
  </Card>
</CardGroup>

## 基础信息

### API 端点

* **主要端点**：`https://api.apiyi.com/v1`
* **备用端点**：`https://vip.apiyi.com/v1`

### 认证方式

所有请求需在 Header 中携带 API Key：

```http theme={null}
Authorization: Bearer YOUR_API_KEY
```

### 请求格式

* **Content-Type**：`application/json`
* **编码**：UTF-8
* **方法**：大部分接口为 `POST`

## 快速开始

### 获取 API Key

1. 访问 [API易控制台](https://api.apiyi.com/token) 并登录
2. 在令牌管理页面点击「新增」创建 API Key
3. 复制生成的 Key 用于接口调用

### 获取多语言代码示例

控制台已内置各语言的可运行代码示例，会随最新 API 版本实时更新，**建议优先使用**：

1. 进入 [令牌管理页面](https://api.apiyi.com/token)
2. 在目标 API Key 所在行，点击「操作」列的 🔧 小扳手图标
3. 选择「请求示例」，即可查看 cURL、Python、Node.js、Java、C#、Go、PHP、Ruby 等语言的完整示例

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="API易令牌管理界面 - 请求示例" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

## 在线调试（Playground）

「API 参考」栏目提供**在线 Playground**：填入 API Key 即可直接发送请求、实时查看响应，无需写代码。

<CardGroup cols={3}>
  <Card title="对话补全 Chat" icon="messages-square" href="/api-reference/chat/chat-completions">
    `POST /v1/chat/completions`，对话与多模态主力接口。
  </Card>

  <Card title="模型列表 Models" icon="list" href="/api-reference/models/list-models">
    `GET /v1/models`，查询当前可用模型。
  </Card>

  <Card title="向量嵌入 Embeddings" icon="braces" href="/api-reference/embeddings/create-embeddings">
    `POST /v1/embeddings`，文本向量化。
  </Card>
</CardGroup>

<Note>
  图像、视频生成接口的 Playground 位于各自模型页（见上方「选择模型」中的图片 / 视频模型专页）。
</Note>

## 最小调用示例

最常用的对话补全接口，复制即可运行；更多参数与语言请用上方 Playground 或控制台「请求示例」：

<Tabs>
  <Tab title="Python (SDK)">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1"
    )

    response = client.chat.completions.create(
        model="gpt-5-chat-latest",
        messages=[
            {"role": "system", "content": "你是一个有用的AI助手。"},
            {"role": "user", "content": "你好！请介绍一下自己。"}
        ],
        temperature=0.7,
        max_tokens=1000
    )

    print(response.choices[0].message.content)
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    curl -X POST "https://api.apiyi.com/v1/chat/completions" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5-chat-latest",
        "messages": [
          {"role": "system", "content": "你是一个有用的AI助手。"},
          {"role": "user", "content": "你好！请介绍一下自己。"}
        ],
        "temperature": 0.7,
        "max_tokens": 1000
      }'
    ```
  </Tab>
</Tabs>

## 流式响应

在请求中设置 `stream: true`，响应将以 Server-Sent Events（SSE）逐块返回，适合打字机式输出：

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5-chat-latest",
    messages=[{"role": "user", "content": "讲个短笑话"}],
    stream=True
)

for chunk in stream:
    content = chunk.choices[0].delta.content or ""
    print(content, end="", flush=True)
```

SSE 数据以 `data: ` 开头，最后一行为 `data: [DONE]` 表示结束。

## 错误处理

接口遵循 OpenAI 错误格式：

```json theme={null}
{
  "error": {
    "message": "Invalid API key provided",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

常见错误码：

| 错误码                     | HTTP 状态码 | 说明       |
| ----------------------- | -------- | -------- |
| invalid\_api\_key       | 401      | API 密钥无效 |
| insufficient\_quota     | 429      | 额度不足     |
| model\_not\_found       | 404      | 模型不存在    |
| invalid\_request\_error | 400      | 请求参数错误   |
| rate\_limit\_exceeded   | 429      | 请求频率过高   |
| server\_error           | 500      | 服务器内部错误  |

<Tip>
  建议实现指数退避重试：遇到 429 / 500 时间隔翻倍重试，可显著提升稳定性。API Key 请用环境变量存储，不要硬编码进代码。
</Tip>

上表只给出错误码的含义，**具体原因写在响应体的 `error.message` 里**——而这段原文只在接口响应中返回一次，后台日志不会保留。请务必在客户端把它完整打印并落盘：

<Card title="接口错误信息留存指南" icon="clipboard-list" href="/api-manual/error-reporting">
  为什么必须自己打印原始错误、各语言的正确捕获写法、必须留存的 7 个字段，以及可直接复制的报障模板
</Card>

## 速率限制

| 限制类型        | 默认值     | 说明        |
| ----------- | ------- | --------- |
| RPM（每分钟请求数） | 3000    | 每个 API 密钥 |
| TPM（每分钟令牌数） | 1000000 | 每个 API 密钥 |
| 并发请求数       | 100     | 同时处理的请求   |

超出限制会返回 `429`，请合理控制请求频率。

## 需要帮助？

<CardGroup cols={2}>
  <Card title="选择模型" icon="sparkles" href="/api-capabilities/model-info">
    文本 / 多模态模型推荐与定价。
  </Card>

  <Card title="在线调试" icon="play" href="/api-reference/chat/chat-completions">
    打开 API 参考 Playground 直接发请求。
  </Card>
</CardGroup>

* 访问官网：[api.apiyi.com](https://api.apiyi.com)
* 技术支持邮箱：`support@apiyi.com`
