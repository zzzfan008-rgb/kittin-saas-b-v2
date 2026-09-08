> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Kimi K2.5 文本生成

> Moonshot AI 原生多模态旗舰模型，256K 上下文，支持 Thinking 深度思考模式。API易阿里云官转通道稳定可靠，分组价 0.88 倍，叠加充值加赠可享官网 8 折以内。

Kimi K2.5 是 Moonshot AI 于 2026 年 1 月 27 日发布的原生多模态旗舰模型，主打视觉编程（Visual Coding）与自主 Agent Swarm 编排能力，提供 256K 超长上下文。API易通过**阿里云官转**通道接入，稳定可靠；分组价采用 0.88 倍率（官网 88 折），再叠加充值加赠（充值 \$100 送 \$10 起），**实际成本可低于官网 8 折**。

<Info>
  **API易已接入 Kimi K2.5**：阿里云官转通道，OpenAI 兼容格式直接调用，模型名 `kimi-k2.5`。与 Kimi 官网不同的是——**Thinking（思考）模式需要显式传入 `enable_thinking: true` 参数才会启用**，默认为 Instant 模式。
</Info>

## 核心优势

<CardGroup cols={2}>
  <Card title="256K 超长上下文" icon="scroll">
    无需额外加价即可享受 256K 上下文，整个大型代码库或长文档一次塞进去。
  </Card>

  <Card title="Thinking 深度思考" icon="brain">
    通过 `enable_thinking: true` 开启推理链路，适合复杂规划、根因分析与 Agent 任务。
  </Card>

  <Card title="原生多模态 + 视觉编程" icon="eye">
    原生理解图像与代码，擅长把 UI 截图、设计稿、图表转化为可运行的代码。
  </Card>

  <Card title="稳定阿里云官转" icon="server">
    经阿里云官方转发通道接入，企业级 SLA，高并发下稳定不断供。
  </Card>
</CardGroup>

## 模型信息

| 参数              | 值                                        |
| --------------- | ---------------------------------------- |
| **模型名称**        | `kimi-k2.5`                              |
| **上下文窗口**       | 256,000 tokens                           |
| **运行模式**        | Instant / Thinking / Agent / Agent Swarm |
| **Thinking 开关** | 请求体 `enable_thinking: true`（默认 `false`）  |
| **输入格式**        | 文本 + 图像（原生多模态）                           |
| **输出格式**        | 文本                                       |
| **流式输出**        | ✅ 支持                                     |
| **函数调用 / 工具使用** | ✅ 支持                                     |
| **通道**          | 阿里云官转（稳定可靠）                              |

<Warning>
  Kimi 官网内置的 `$web_search` 工具目前与 Thinking 模式不兼容，官方建议：如需使用 web\_search，先关闭 `enable_thinking`。这一限制与 Moonshot 官方一致。
</Warning>

## 定价

| 项目       | 官网价格               | API易分组价（0.88 倍率）    | 叠加充值加赠（约）            |
| -------- | ------------------ | ------------------- | -------------------- |
| 输入       | \$0.60 / 1M tokens | \$0.528 / 1M tokens | 约 \$0.48 / 1M tokens |
| 输出       | \$2.50 / 1M tokens | \$2.20 / 1M tokens  | 约 \$2.00 / 1M tokens |
| 缓存命中（输入） | \$0.10 / 1M tokens | \$0.088 / 1M tokens | —                    |

<Info>
  **价格说明**：API易采用 **0.88 倍率**（官网 88 折）作为分组基础价；叠加首充/大额充值加赠后（如充值 \$100 送 \$10 起），实际使用成本可**低于官网 8 折**。更多加赠政策详见 [充值优惠](/faq/recharge-promotions)。
</Info>

## 如何开启 Thinking 模式

在 API易 上使用 Kimi K2.5，与 Kimi 官网最大的区别是——**默认是 Instant 模式**，需要通过请求体的 `enable_thinking` 参数显式启用深度思考：

| 场景                     | `enable_thinking` | 说明                              |
| ---------------------- | ----------------- | ------------------------------- |
| 日常对话 / 快速响应            | `false`（默认）       | Instant 模式，响应最快                 |
| 复杂推理 / 代码规划 / 根因分析     | `true`            | Thinking 模式，输出推理链路              |
| Agent 任务 + web\_search | `false`           | 官方限制：web\_search 与 thinking 不兼容 |

### cURL 示例（开启 Thinking）

```bash theme={null}
curl --location 'https://api.apiyi.com/v1/chat/completions' \
  --header "Authorization: Bearer sk-xxxx" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "kimi-k2.5",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "1+1等于多少？"
      }
    ],
    "enable_thinking": true
  }'
```

## 调用方式

### 端点地址

```
https://api.apiyi.com/v1/chat/completions
```

### 基础调用（Instant 模式）

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "kimi-k2.5",
      "messages": [
        {"role": "user", "content": "用一句话介绍你自己"}
      ]
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="kimi-k2.5",
      messages=[
          {"role": "user", "content": "用一句话介绍你自己"}
      ]
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.chat.completions.create({
    model: 'kimi-k2.5',
    messages: [
      { role: 'user', content: '用一句话介绍你自己' }
    ]
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

### 进阶调用（Thinking 模式）

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="kimi-k2.5",
      messages=[
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "分析这段代码的时间复杂度并给出优化建议"}
      ],
      extra_body={
          "enable_thinking": True
      }
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.chat.completions.create({
    model: 'kimi-k2.5',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: '分析这段代码的时间复杂度并给出优化建议' }
    ],
    // @ts-ignore - 自定义字段
    enable_thinking: true
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

### 流式输出

```python theme={null}
response = client.chat.completions.create(
    model="kimi-k2.5",
    messages=[{"role": "user", "content": "写一首关于春天的短诗"}],
    stream=True,
    extra_body={"enable_thinking": True}
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

## 请求参数

| 参数名               | 类型      | 必填 | 说明                          |
| ----------------- | ------- | -- | --------------------------- |
| `model`           | string  | 是  | 固定为 `kimi-k2.5`             |
| `messages`        | array   | 是  | 对话消息数组                      |
| `enable_thinking` | boolean | 否  | 是否开启 Thinking 模式，默认 `false` |
| `stream`          | boolean | 否  | 是否流式输出                      |
| `temperature`     | number  | 否  | 采样温度，0\~2 之间                |
| `max_tokens`      | integer | 否  | 最大输出 tokens                 |
| `tools`           | array   | 否  | 函数调用 / 工具列表                 |

## 响应格式

```json theme={null}
{
  "id": "chatcmpl-xxxxxxxx",
  "object": "chat.completion",
  "created": 1706300000,
  "model": "kimi-k2.5",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "1+1 等于 2。"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 12,
    "total_tokens": 36
  }
}
```

## 最佳实践

1. **按任务切换模式**：日常对话、短文本生成用默认 Instant 模式；复杂推理、代码审查、Agent 规划任务加上 `enable_thinking: true`。
2. **善用 256K 上下文**：整个中型代码仓库、产品文档、长会议纪要都可以一次塞进去，不额外加价。
3. **多模态视觉编程**：上传 UI 截图 / 设计稿，一次调用完成「读图 → 规划 → 出代码」。
4. **成本进一步优化**：充值 \$100 起享受加赠，叠加 0.88 分组价，实际成本可低于官网 8 折。
5. **注意 web\_search 限制**：如需使用官方 `$web_search` 内置工具，请关闭 `enable_thinking`。

## 常见问题

<AccordionGroup>
  <Accordion title="为什么我的请求没有进入 Thinking 模式？">
    默认不会开启。请检查请求体是否包含 `"enable_thinking": true`；使用 OpenAI Python SDK 时需放在 `extra_body` 中，Node.js SDK 可直接作为顶层字段传入。
  </Accordion>

  <Accordion title="API易的 Kimi K2.5 和 Kimi 官网是同一个模型吗？">
    是同一个模型。API易通过阿里云官转通道接入 Moonshot 官方 Kimi K2.5，模型能力完全一致。区别仅在于：Thinking 模式默认关闭，需通过 `enable_thinking` 参数显式启用。
  </Accordion>

  <Accordion title="0.88 分组价如何生效？">
    在 API易控制台创建令牌时，将令牌分组设置为支持 Kimi K2.5 的分组即可按 0.88 倍率计费。搭配充值加赠后，整体成本可进一步下降。详见 [充值优惠](/faq/recharge-promotions)。
  </Accordion>

  <Accordion title="是否支持函数调用 / Tool Use？">
    支持。可通过标准 OpenAI 格式的 `tools` 字段传入函数定义。注意官方 `$web_search` 内置工具与 Thinking 模式互斥，请分别使用。
  </Accordion>

  <Accordion title="Thinking 模式会额外计费吗？">
    Thinking 模式生成的推理内容按输出 tokens 正常计费。复杂任务可能会显著增加输出 tokens 数量，建议按需启用。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="API 基础手册" icon="book" href="/api-manual">
    查看完整的 API 使用指南
  </Card>

  <Card title="充值优惠" icon="gift" href="/faq/recharge-promotions">
    了解加赠活动，把价格做得更低
  </Card>

  <Card title="模型信息" icon="list" href="/api-capabilities/model-info">
    查看所有可用模型及分组
  </Card>

  <Card title="使用场景" icon="layers" href="/scenarios">
    查看各种客户端接入教程
  </Card>
</CardGroup>
