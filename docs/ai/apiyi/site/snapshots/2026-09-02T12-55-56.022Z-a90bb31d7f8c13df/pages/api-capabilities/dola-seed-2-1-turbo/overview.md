> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo 文本生成

> 字节 Seed 2.1 Turbo 高频生产型文本模型：256K 上下文、深度思考可控、双层缓存。API易同时开通 Chat Completions 与 Responses 双端点，输入 $0.50、输出 $2.50 每 1M tokens。

Seed 2.1 Turbo（`dola-seed-2-1-turbo-260628`）是字节跳动 Seed 团队于 2026 年 6 月 23 日发布的高频生产型文本模型（BytePlus 产品名 Dola-Seed-2.1-turbo），主打低成本、低延迟的企业级高并发场景，家族标称 256K 上下文。API易已完成**双端点全量实测**（15/15 用例通过），Chat Completions 与 Responses 均可直接调用。

<Info>
  **API易已接入 Seed 2.1 Turbo**：模型名 `dola-seed-2-1-turbo-260628`，`default` / `svip` 分组可用。与多数模型不同的是——**该模型默认开启深度思考**，对延迟和成本敏感的场景请显式传 `thinking: {"type": "disabled"}` 关闭（详见下方「深度思考控制」）。
</Info>

## 核心优势

<CardGroup cols={2}>
  <Card title="生产级性价比" icon="circle-dollar-sign">
    输入 \$0.50、输出 \$2.50 每 1M tokens，是同代 Seed 2.1 Pro 的一半价格，适合高频调用。
  </Card>

  <Card title="双端点原生支持" icon="git-fork">
    Chat Completions 与 Responses 均为原生适配：Responses 端事件流、reasoning item、多轮 previous\_response\_id 全部可用。
  </Card>

  <Card title="深度思考可控" icon="brain">
    thinking 开关 + reasoning\_effort 分档（low/high 实测思考量差 4 倍），按任务精确控制思考成本。
  </Card>

  <Card title="双层缓存降本" icon="database-zap">
    隐式缓存自动命中（第 2 次请求即生效）；Responses 端显式缓存链式调用可整轮命中、延迟约减半。
  </Card>
</CardGroup>

## 模型信息

| 参数              | 值                                                |
| --------------- | ------------------------------------------------ |
| **模型名称**        | `dola-seed-2-1-turbo-260628`                     |
| **发布时间**        | 2026 年 6 月 23 日（字节 Seed 团队）                      |
| **上下文窗口**       | 256K（家族标称）                                       |
| **可用分组**        | `default`、`svip`                                 |
| **端点**          | `POST /v1/chat/completions`、`POST /v1/responses` |
| **深度思考**        | 默认开启；`thinking.type` 可关，`reasoning_effort` 可分档   |
| **流式输出**        | ✅ 两端点均支持                                         |
| **函数调用 / 工具使用** | ✅ 两端点均支持                                         |

## 实测能力矩阵

以下为 API易 2026 年 7 月 21 日的实测结果（官方能力声明 vs 实际表现）：

| 能力                          | 官方声明           | Chat Completions             | Responses                     |
| --------------------------- | -------------- | ---------------------------- | ----------------------------- |
| 基础对话（非流式/流式）                | ✅              | ✅ / ✅                        | ✅ / ✅（事件流完整）                  |
| 结构化输出（json\_schema, strict） | ✅              | ✅                            | ✅（`text.format`）              |
| 深度思考开关 `thinking.type`      | ✅              | ✅ 开关有效                       | 默认输出 reasoning item           |
| 思考分档 `reasoning_effort`     | ✅              | ✅ low/high 实测 226/960 tokens | ✅ low/high 实测 371/1317 tokens |
| Function Call（两轮闭环）         | ✅              | ✅                            | ✅                             |
| 隐式缓存                        | ✅              | ✅ 第 2 次命中                    | ✅ 第 2 次命中                     |
| 显式缓存                        | ✅（仅 Responses） | —                            | ✅ 需 `previous_response_id` 链式 |
| 多轮 `previous_response_id`   | —              | —                            | ✅                             |
| MCP                         | ✅（仅 Responses） | —                            | 官方支持，本站未实测                    |
| 联网搜索 / 知识库 / 精调 / 批量推理      | ❌              | —                            | —                             |

## 定价

| 项目 | API易价格             |
| -- | ------------------ |
| 输入 | \$0.50 / 1M tokens |
| 输出 | \$2.50 / 1M tokens |

<Info>
  **价格说明**：思考（reasoning）内容按输出 tokens 正常计费——这也是为什么建议按需控制思考深度。叠加充值加赠后实际成本更低，详见 [充值优惠](/faq/recharge-promotions)。
</Info>

## 深度思考控制

**这是使用本模型最重要的一件事**：默认开启深度思考，即使一句话的简单问题也会先输出数百 tokens 的思考内容。实测一句话自我介绍消耗 444 输出 tokens（其中思考 409），非流式总耗时 7–19 秒。

<Warning>
  对延迟或成本敏感的场景（客服、高频短问答、批量处理），请显式传 `"thinking": {"type": "disabled"}`。实测关闭后 reasoning tokens 归零，响应显著加快。
</Warning>

### 三种思考档位实测

| 配置                               | reasoning tokens（实测）      | 适用场景         |
| -------------------------------- | ------------------------- | ------------ |
| `thinking: {"type": "disabled"}` | 0                         | 高频短问答、成本敏感场景 |
| `reasoning_effort: "low"`        | Chat 226 / Responses 371  | 常规推理任务       |
| `reasoning_effort: "high"`       | Chat 960 / Responses 1317 | 复杂规划、数学、代码分析 |

<Tip>
  **`max_output_tokens` 要给足**：思考内容计入输出配额。Responses 端配额太小时会被思考吃满，返回 `status: "incomplete"`（`reason: length`）且**正文为空**——看起来像没输出，其实是配额问题。建议 1500 起步，开 high 档给 4000+。
</Tip>

## 缓存降本

模型支持两层缓存，机制不同，注意区分：

### 隐式缓存（自动，两端点均有）

无需任何参数，相同长前缀（如固定的 system prompt）第 2 次请求即自动命中。实测约 2,600 tokens 的 system prompt，第 2/3 次请求 `cached_tokens` 达 2,360。命中量可在响应 `usage.prompt_tokens_details.cached_tokens`（Chat）或 `usage.input_tokens_details.cached_tokens`（Responses）中查看。

### 显式缓存（仅 Responses，需链式调用）

显式缓存的正确姿势是 `caching: {"type": "enabled"}` **配合 `previous_response_id` 链式调用**：第 2 轮携带上一轮响应 id 时，上一轮全部上下文整体命中（实测 7,873 tokens 全量命中，耗时从 8 秒降到 4 秒）。

<Warning>
  **只开 enabled 不链式会两头落空**：实测开启 `caching.enabled` 后，如果不走 `previous_response_id`、只是重复相同前缀，`cached_tokens` 恒为 0——连隐式缓存的前缀命中也没有了。要么不传 caching 参数吃隐式缓存，要么开 enabled 并严格链式调用。
</Warning>

## 调用示例

### Chat Completions

<CodeGroup>
  ```bash cURL（关闭思考，快速响应） theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "dola-seed-2-1-turbo-260628",
      "messages": [
        {"role": "user", "content": "用一句话介绍你自己"}
      ],
      "max_tokens": 500,
      "thinking": {"type": "disabled"}
    }'
  ```

  ```python Python（分档思考） theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="dola-seed-2-1-turbo-260628",
      messages=[
          {"role": "user", "content": "分析这段代码的时间复杂度并给出优化建议"}
      ],
      max_tokens=3000,
      reasoning_effort="high",  # low / medium / high
  )

  msg = response.choices[0].message
  print(msg.content)
  # 思考内容在 msg.reasoning_content（OpenAI SDK 下用 model_extra 访问）
  ```

  ```javascript Node.js（流式） theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const stream = await client.chat.completions.create({
    model: 'dola-seed-2-1-turbo-260628',
    messages: [{ role: 'user', content: '写一首关于夏天的短诗' }],
    max_tokens: 1500,
    stream: true,
    stream_options: { include_usage: true }
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

### Responses（原生多轮 + 显式缓存）

<CodeGroup>
  ```bash cURL（基础调用） theme={null}
  curl -X POST "https://api.apiyi.com/v1/responses" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "dola-seed-2-1-turbo-260628",
      "input": "用一句话介绍你自己",
      "max_output_tokens": 1500
    }'
  ```

  ```python Python（链式调用吃显式缓存） theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  # 第 1 轮：开启显式缓存
  r1 = client.responses.create(
      model="dola-seed-2-1-turbo-260628",
      input=[
          {"role": "system", "content": "这里放很长的固定背景资料……"},
          {"role": "user", "content": "第一个问题"},
      ],
      max_output_tokens=1500,
      extra_body={"caching": {"type": "enabled"}, "store": True},
  )
  print(r1.output_text)

  # 第 2 轮：携带上一轮 id，整轮上下文命中缓存（实测延迟约减半）
  r2 = client.responses.create(
      model="dola-seed-2-1-turbo-260628",
      input="第二个问题",
      previous_response_id=r1.id,
      max_output_tokens=1500,
      extra_body={"caching": {"type": "enabled"}},
  )
  print(r2.output_text)
  print(r2.usage.input_tokens_details.cached_tokens)  # 缓存命中量
  ```
</CodeGroup>

## 最佳实践

1. **默认关思考，按需开启**：把 `thinking: {"type": "disabled"}` 作为基线配置，只在复杂推理任务上换成 `reasoning_effort` 分档，避免为简单问题支付思考成本。
2. **`max_output_tokens` 给足余量**：开思考时建议 3000+，high 档 4000+，防止正文被思考挤掉。
3. **固定 system prompt 放最前**：隐式缓存按前缀匹配，把不变的内容放消息最前面，第 2 次请求起自动省钱。
4. **多轮对话用 Responses 链式**：`previous_response_id` 免去重发历史消息，叠加显式缓存后长上下文多轮的成本与延迟都显著下降。
5. **错误处理留意 503**：模型名拼写错误或分组无权限时返回 503（无可用渠道），不是 OpenAI 惯例的 404，重试逻辑请勿按 404 判断。

## 常见问题

<AccordionGroup>
  <Accordion title="为什么简单问题响应也很慢、tokens 消耗很高？">
    因为模型**默认开启深度思考**。一句话问题也会先生成数百 tokens 的思考内容（实测约 400），既慢又费钱。在请求体加 `"thinking": {"type": "disabled"}` 即可关闭，实测关闭后思考 tokens 归零。
  </Accordion>

  <Accordion title="Responses 返回 incomplete、正文是空的，怎么回事？">
    `max_output_tokens` 太小，配额被思考内容吃满了（`incomplete_details.reason` 为 `length`）。把配额提到 1500 以上，或关闭/调低思考档位。
  </Accordion>

  <Accordion title="Chat Completions 和 Responses 怎么选？">
    单轮或自管历史的场景用 Chat Completions（生态兼容最广）；多轮对话、需要显式缓存、或要用 MCP 工具的场景用 Responses——显式缓存和 MCP 仅 Responses 端支持。
  </Accordion>

  <Accordion title="开了显式缓存为什么 cached_tokens 一直是 0？">
    显式缓存必须**链式调用**：第 2 轮起携带上一轮的 `previous_response_id` 才会命中。只开 `caching.enabled` 而每次独立发请求不会命中——而且此时连隐式前缀缓存也不生效。若不想改造成链式，直接去掉 caching 参数用隐式缓存即可。
  </Accordion>

  <Accordion title="支持 MCP 吗？">
    官方能力图声明 Responses API 支持 MCP 工具。API易本轮实测未覆盖 MCP 场景（需外部 MCP server），如有需求建议小流量验证后再上生产。
  </Accordion>

  <Accordion title="请求报 503 是服务挂了吗？">
    先检查模型名拼写。该模型对不存在的模型名返回 503「无可用渠道」而非 404，模型名正确但仍 503 时再考虑分组权限（本模型需 `default` 或 `svip` 分组）或联系客服。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="Chat 在线调试" icon="terminal" href="/api-capabilities/dola-seed-2-1-turbo/chat-completions">
    在 Playground 中直接调试 Chat Completions 端点
  </Card>

  <Card title="Responses 在线调试" icon="messages-square" href="/api-capabilities/dola-seed-2-1-turbo/responses">
    在 Playground 中直接调试 Responses 端点
  </Card>

  <Card title="模型信息" icon="list" href="/api-capabilities/model-info">
    查看所有可用模型及分组
  </Card>

  <Card title="API 基础手册" icon="book" href="/api-manual">
    查看完整的 API 使用指南
  </Card>
</CardGroup>
