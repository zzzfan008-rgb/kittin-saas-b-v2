> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 为什么提示 API Key 无效？

> 解决 API Key 无效错误，了解 Base URL 和 API Key 的正确配置方法

## 常见错误现象

当您看到类似以下错误信息时：

```json theme={null}
{
  "error": {
    "message": "Incorrect API key provided: sk-QqHvK***...",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

这通常**不是**您的 API Key 本身有问题，而是**请求地址（Base URL）配置错误**导致的。

<Warning>
  **最常见的错误**：使用了 API易 的 Key，但请求地址仍然指向 OpenAI 官网 `https://api.openai.com`
</Warning>

## 什么是 Base URL？

**Base URL**（基础 URL / 请求地址）是 API 请求的目标服务器地址。不同的 API 服务提供商使用不同的 Base URL。

### Base URL 和 API Key 必须一一对应

| 服务提供商         | Base URL                 | API Key 格式      | 是否匹配     |
| ------------- | ------------------------ | --------------- | -------- |
| **API易**      | `https://api.apiyi.com`  | `sk-xxxx......` | ✅ 正确     |
| **OpenAI 官方** | `https://api.openai.com` | `sk-xxxx......` | ✅ 正确     |
| ❌ API易 Key    | `https://api.openai.com` | `sk-xxxx......` | ❌ **错误** |
| ❌ OpenAI Key  | `https://api.apiyi.com`  | `sk-xxxx......` | ❌ **错误** |

<Info>
  **关键原则**：使用哪家的 API Key，就必须将请求发送到对应服务商的 Base URL。
</Info>

## 正确的配置方法

### 方法一：修改 Base URL（推荐）

只需将请求地址从 OpenAI 官网替换为 API易，其他代码完全不变：

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-apiyi-key",  # API易后台获取的Key
      base_url="https://api.apiyi.com/v1"  # 改为API易地址
  )

  response = client.chat.completions.create(
      model="gpt-4o",
      messages=[{"role": "user", "content": "你好"}]
  )
  ```

  ```javascript JavaScript/Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'sk-your-apiyi-key',  // API易后台获取的Key
    baseURL: 'https://api.apiyi.com/v1'  // 改为API易地址
  });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: '你好' }]
  });
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer sk-your-apiyi-key" \
    -d '{
      "model": "gpt-4o",
      "messages": [{"role": "user", "content": "你好"}]
    }'
  ```
</CodeGroup>

### 方法二：使用环境变量

设置环境变量后，代码中无需显式指定 Base URL：

<CodeGroup>
  ```bash Linux/macOS theme={null}
  export OPENAI_API_KEY="sk-your-apiyi-key"
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```

  ```powershell Windows PowerShell theme={null}
  $env:OPENAI_API_KEY="sk-your-apiyi-key"
  $env:OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```

  ```cmd Windows CMD theme={null}
  set OPENAI_API_KEY=sk-your-apiyi-key
  set OPENAI_BASE_URL=https://api.apiyi.com/v1
  ```
</CodeGroup>

## API易支持的请求地址格式

根据您的代码情况，API易支持以下三种 Base URL 格式：

<Tabs>
  <Tab title="格式 1：带 /v1（推荐）">
    ```
    https://api.apiyi.com/v1
    ```

    **适用场景**：大多数代码库默认会在 Base URL 后自动添加具体路径

    **完整请求示例**：

    ```
    https://api.apiyi.com/v1/chat/completions
    https://api.apiyi.com/v1/api-capabilities/model-info
    ```
  </Tab>

  <Tab title="格式 2：带 /v1/（末尾有斜杠）">
    ```
    https://api.apiyi.com/v1/
    ```

    **适用场景**：某些框架要求 Base URL 以斜杠结尾

    **完整请求示例**：

    ```
    https://api.apiyi.com/v1/chat/completions
    https://api.apiyi.com/v1/api-capabilities/model-info
    ```
  </Tab>

  <Tab title="格式 3：完整路径">
    ```
    https://api.apiyi.com/v1/chat/completions
    ```

    **适用场景**：直接使用完整的 API 端点地址（如 cURL 请求）

    <Note>
      这种方式通常用于 cURL 或 HTTP 库的原始请求，不需要设置 Base URL
    </Note>
  </Tab>
</Tabs>

## 常见问题排查

<AccordionGroup>
  <Accordion title="我确认修改了 Base URL，但仍然报错">
    **可能原因**：

    1. **代码中有多处配置**：检查是否在配置文件、环境变量、代码初始化等多处都设置了 Base URL
    2. **使用了代理或中间件**：某些代理工具可能会重定向请求
    3. **缓存问题**：重启程序或清除缓存后重试
    4. **拼写错误**：确认 `apiyi` 拼写正确（不是 `apiyii` 或 `apiyl`）
  </Accordion>

  <Accordion title="如何确认 Key 是否有效？">
    在 API易 后台查看：

    1. 登录 API易 后台 `console.apiyi.com`
    2. 进入「令牌」页面
    3. 检查 Key 状态是否为「启用」
    4. 确认账户余额充足
  </Accordion>

  <Accordion title="使用第三方工具（如 ChatBox、OpenCat）如何配置？">
    大多数第三方工具都有「自定义 API」或「自建服务器」选项：

    * **API 地址 / Base URL**：`https://api.apiyi.com/v1`
    * **API Key**：从 API易 后台复制您的 Key
    * **模型名称**：参考 API易 文档中的模型列表

    <Tip>
      具体配置位置可能在「设置」→「API」或「服务器」等选项中
    </Tip>
  </Accordion>

  <Accordion title="代码示例在哪里可以找到？">
    API易 提供了多种语言的完整代码示例：

    1. **快速开始文档**：文档首页 → 代码示例
    2. **在线测试工具**：后台 → ApiFox 在线测试
    3. **GitHub 仓库**：`github.com/apiyi/docs` → knowledge-base 目录
  </Accordion>
</AccordionGroup>

## 错误示例 vs 正确示例

<CardGroup cols={2}>
  <Card title="❌ 错误配置" icon="x" color="#ef4444">
    ```python theme={null}
    client = OpenAI(
        api_key="sk-apiyi-key",
        base_url="https://api.openai.com/v1"
        # ❌ 使用了OpenAI官网地址
    )
    ```

    **结果**：OpenAI 服务器会拒绝 API易 的 Key
  </Card>

  <Card title="✅ 正确配置" icon="check" color="#10b981">
    ```python theme={null}
    client = OpenAI(
        api_key="sk-apiyi-key",
        base_url="https://api.apiyi.com/v1"
        # ✅ 使用API易地址
    )
    ```

    **结果**：请求成功发送到 API易 服务器
  </Card>
</CardGroup>

## 快速测试方法

使用 cURL 命令快速验证配置是否正确：

```bash theme={null}
curl https://api.apiyi.com/v1/api-capabilities/model-info \
  -H "Authorization: Bearer sk-your-apiyi-key"
```

**预期结果**：返回可用模型列表

```json theme={null}
{
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      ...
    }
  ]
}
```

如果返回错误，请检查：

1. API Key 是否正确复制（注意首尾空格）
2. 网络连接是否正常
3. 账户余额是否充足

## 相关文档

* [快速开始指南](/getting-started)
* [API 使用手册](/api-manual)
* [为什么还有余额跑不通？](/faq/balance-insufficient)
* [支持的模型列表](/api-capabilities/model-info)

<Tip>
  **记住核心原则**：哪家的 Key 配哪家的 URL，API易 的 Key 就用 `https://api.apiyi.com/v1`
</Tip>
