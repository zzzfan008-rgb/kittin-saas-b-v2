> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI 兼容模式：响应数据处理

> /v1/chat/completions 流式与非流式响应的统一解析方法：共性优先，附健壮解析参考实现，覆盖各模型不影响接入的少数差异。

调用 [兼容模式](/api-capabilities/openai/compatible) 时，无论你用的是 OpenAI、Claude、Gemini、Grok、Qwen、GLM 还是其它模型，响应都遵循同一套 OpenAI schema。**绝大多数解析逻辑是通用的**——只要按本页的统一写法处理，换模型不用改代码。

本页帮你把「响应数据处理」一次做对：先讲共性，再用一张表列出**少数需要兼容、但不影响接入**的差异点。

<Info>
  请求侧（base\_url、鉴权、换模型）见 [兼容模式调用](/api-capabilities/openai/compatible)。本页只讲**响应侧**：拿到响应后怎么解析。
</Info>

## 两种模式，同一端点

同一个 `/v1/chat/completions`，只由 `stream` 参数决定返回形态：

|      | `stream: false`（默认）          | `stream: true`                  |
| ---- | ---------------------------- | ------------------------------- |
| 返回形态 | 单个 JSON 对象                   | SSE 数据流（多行 `data:`）             |
| 顶层类型 | `chat.completion`            | `chat.completion.chunk`         |
| 取正文  | `choices[0].message.content` | 累加各块 `choices[0].delta.content` |
| 适用场景 | 后端任务、批处理、需完整结果               | 聊天 UI、需要逐字上屏                    |

## 非流式响应

结构稳定，取 `choices[0].message.content` 即可：

```json theme={null}
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "model": "gpt-4.1-mini",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "1+1等于2。" },
      "finish_reason": "stop"
    }
  ],
  "usage": { "prompt_tokens": 31, "completion_tokens": 8, "total_tokens": 39 }
}
```

<CodeGroup>
  ```python Python theme={null}
  resp = client.chat.completions.create(
      model="gpt-4.1-mini",
      messages=[{"role": "user", "content": "1+1等于几？"}]
  )
  print(resp.choices[0].message.content)
  print(resp.usage.total_tokens)
  ```

  ```javascript Node.js theme={null}
  const resp = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: '1+1等于几？' }]
  });
  console.log(resp.choices[0].message.content);
  console.log(resp.usage.total_tokens);
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{"model":"gpt-4.1-mini","messages":[{"role":"user","content":"1+1等于几？"}]}'
  ```
</CodeGroup>

<Tip>
  非流式下七家主流模型高度一致，`choices[0].message.content` 可无差别取值。部分模型（如 OpenAI 系）`message` 里还会带 `annotations`、`refusal` 等字段，按需读取，不用则忽略即可。
</Tip>

## 流式响应（SSE）

流式以 Server-Sent Events 逐块推送，每行形如 `data: {...}`，以 `data: [DONE]` 收尾：

```text theme={null}
data: {"choices":[{"delta":{"content":"1"},"index":0}], ...}
data: {"choices":[{"delta":{"content":"+1"},"index":0}], ...}
data: {"choices":[{"delta":{},"finish_reason":"stop","index":0}], ...}
data: [DONE]
```

用官方 SDK 时迭代即可，核心是**累加 `delta.content`**：

<CodeGroup>
  ```python Python theme={null}
  stream = client.chat.completions.create(
      model="gpt-4.1-mini",
      messages=[{"role": "user", "content": "写一首短诗"}],
      stream=True
  )

  for chunk in stream:
      if chunk.choices and chunk.choices[0].delta.content:
          print(chunk.choices[0].delta.content, end="", flush=True)
  ```

  ```javascript Node.js theme={null}
  const stream = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: '写一首短诗' }],
    stream: true
  });

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) process.stdout.write(delta);
  }
  ```
</CodeGroup>

## 接入要点：少数差异，统一处理

不同模型的流式细节略有出入，但**只要遵守下面几条，就能用同一套代码兼容全部模型**。

<Warning>
  **结束块的 `choices` 可能是空数组。** 携带 `usage` 的最后一块，部分模型是 `"choices":[]`（如 gpt-4.1-mini、grok、qwen、glm），直接取 `choices[0]` 会越界报错。**解析每块前先判 `choices` 是否非空。**
</Warning>

| 差异点                 | 表现                                                             | 统一处理方式                            |
| ------------------- | -------------------------------------------------------------- | --------------------------------- |
| 结束块 choices         | 可能为 `[]` 空数组，也可能非空                                             | 取 delta 前先判 `choices` 非空          |
| `finish_reason` 中间值 | 多数为 `null`，claude 为 `""`（空串）                                   | 判结束统一用 `finish_reason === "stop"` |
| `usage` 出现位置        | 空 choices 块 / 非空 choices 块 / 与 `stop` 同块                       | 三处都尝试读取，读到即记录                     |
| 分块粒度                | 逐 token（gpt 系）或整句（gemini/claude）                               | 不影响——累加即可，无需关心颗粒                  |
| 首个角色声明块             | 有的先发一个空 content 块声明 `role`                                     | content 为空时跳过，不要当正文               |
| 厂商私有字段              | `obfuscation`、`system_fingerprint`、`first_token_return_time` 等 | 一律忽略，不要硬依赖                        |

## 健壮解析参考实现

不依赖 SDK、直接处理原始 SSE 时，按下面的写法可覆盖上述全部差异：

<CodeGroup>
  ```python Python theme={null}
  import json, requests

  def stream_chat(model, messages, api_key):
      resp = requests.post(
          "https://api.apiyi.com/v1/chat/completions",
          headers={"Authorization": f"Bearer {api_key}",
                   "Content-Type": "application/json"},
          json={"model": model, "messages": messages, "stream": True},
          stream=True, timeout=300,
      )
      text, usage = "", None
      for line in resp.iter_lines(decode_unicode=True):
          if not line or not line.startswith("data: "):
              continue
          data = line[6:]
          if data == "[DONE]":
              break
          chunk = json.loads(data)
          if chunk.get("usage"):          # usage 可能出现在任意块
              usage = chunk["usage"]
          choices = chunk.get("choices")
          if not choices:                 # 结束块可能是空数组，先判空
              continue
          delta = choices[0].get("delta", {})
          piece = delta.get("content")
          if piece:                       # 跳过 role 声明等空 content 块
              text += piece
              print(piece, end="", flush=True)
          if choices[0].get("finish_reason") == "stop":
              pass                        # 仅作结束标记，不要 break（usage 常在其后）
      return text, usage
  ```

  ```javascript Node.js theme={null}
  async function streamChat(model, messages, apiKey) {
    const resp = await fetch("https://api.apiyi.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "", text = "", usage = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();             // 保留可能不完整的最后一行

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return { text, usage };
        const chunk = JSON.parse(data);
        if (chunk.usage) usage = chunk.usage;        // usage 可能出现在任意块
        const choices = chunk.choices;
        if (!choices || choices.length === 0) continue;  // 结束块可能为空数组
        const piece = choices[0].delta?.content;
        if (piece) { text += piece; process.stdout.write(piece); }
      }
    }
    return { text, usage };
  }
  ```
</CodeGroup>

<Note>
  推理模型（grok、qwen、glm 等）流式时会先推送 `delta.reasoning_content`（思考链），再推送 `delta.content`（正文）。上面的解析只取了 `content`，因此思考链被自动跳过。需要展示思考过程时的处理见 [推理模型输出](/api-capabilities/openai/reasoning-models)。
</Note>

## usage 与计费

* `usage` 在非流式响应里随结果一起返回；流式则在尾部某一块里返回（位置见上表，建议「读到即覆盖」）。
* 各家字段细分不同：OpenAI 系有 `completion_tokens_details`，Gemini/Claude 额外带 `input_tokens`/`output_tokens`，推理模型带 `reasoning_tokens`。统一以 `prompt_tokens` / `completion_tokens` / `total_tokens` 三个标准字段为准。

<Warning>
  **流式 usage 的 `total_tokens` 不要全信。** 实测个别模型（如 gpt-5.4-mini）流式尾块出现 `total ≠ prompt + completion` 的异常帧，同模型非流式则正常。**计费请以账单为准**，不要用流式那一帧的 total 做结算。
</Warning>

## 相关链接

* 同组页面：[兼容模式调用](/api-capabilities/openai/compatible) · [推理模型输出](/api-capabilities/openai/reasoning-models) · [原生调用](/api-capabilities/openai/native)
* 模型与价格：[模型与价格总览](/api-capabilities/model-info)
* 获取 / 管理令牌：`https://api.apiyi.com/token`
