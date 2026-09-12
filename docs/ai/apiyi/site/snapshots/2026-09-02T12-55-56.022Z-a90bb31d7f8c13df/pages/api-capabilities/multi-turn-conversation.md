> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 多轮对话实现指南

> 在 API易 实现多轮对话：OpenAI 兼容模式（多模型通用）、OpenAI/Gemini/Anthropic 原生格式的历史维护方式、对比与常见问题。

大模型本身**没有记忆**——它不会记得你上一句说了什么。所谓"多轮对话"，本质是**每次请求都把完整的对话历史一起发给模型**。本指南讲清在 API易 平台上，四种调用格式各自怎么维护历史、有哪些坑。

<Info>
  本文示例端点统一为 `https://api.apiyi.com`，密钥用你的 [API易 令牌](https://api.apiyi.com/token)。涉及模型：`gpt-5.4-mini`、`deepseek-v4-pro`、`gemini-3.5-flash`、`claude-sonnet-4-6`。
</Info>

## 核心原理：自己维护历史

记住一句话就够了：**模型无状态，对话历史由你（客户端）维护，每轮把全部历史重新发一遍。**

```text theme={null}
第1轮：发 [用户问1]                          → 得 [回复1]
第2轮：发 [用户问1, 回复1, 用户问2]           → 得 [回复2]
第3轮：发 [用户问1, 回复1, 用户问2, 回复2, 用户问3] → 得 [回复3]
```

每多一轮，就把上一轮的"用户提问"和"模型回复"**追加**到历史数组末尾，再整体发出。四种格式的差异只是**历史数组叫什么名字、角色怎么写**而已。

<Warning>
  **在 API易 平台，请一律采用"自己维护历史"的方式。** 不要依赖任何服务端会话状态（如 OpenAI Responses 的 `previous_response_id`）——经网关转发后该机制不保证生效，详见下文 OpenAI 原生一节。
</Warning>

## OpenAI 兼容模式（多模型通用）

最通用的方式，端点 `/v1/chat/completions`。历史放在 `messages` 数组里，每条带 `role`（`system` / `user` / `assistant`）。**换个 `model` 名就能用同一套代码调不同模型**（gpt、deepseek、claude、gemini…）。

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  messages = [{"role": "system", "content": "你是一个友好的助手。"}]

  def chat(user_input, model="gpt-5.4-mini"):
      messages.append({"role": "user", "content": user_input})
      resp = client.chat.completions.create(model=model, messages=messages)
      reply = resp.choices[0].message.content
      messages.append({"role": "assistant", "content": reply})  # 追加回复进历史
      return reply

  print(chat("我叫小明，今年28岁，请记住。"))
  print(chat("我今年多少岁？再加5岁是多少？"))  # 模型记得 → 28，33
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({ apiKey: 'YOUR_API_KEY', baseURL: 'https://api.apiyi.com/v1' });
  const messages = [{ role: 'system', content: '你是一个友好的助手。' }];

  async function chat(userInput, model = 'gpt-5.4-mini') {
    messages.push({ role: 'user', content: userInput });
    const resp = await client.chat.completions.create({ model, messages });
    const reply = resp.choices[0].message.content;
    messages.push({ role: 'assistant', content: reply });   // 追加回复进历史
    return reply;
  }

  console.log(await chat('我叫小明，今年28岁，请记住。'));
  console.log(await chat('我今年多少岁？'));
  ```

  ```bash cURL theme={null}
  {/* 第2轮：把第1轮的问与答都带上 */}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "deepseek-v4-pro",
      "messages": [
        {"role": "user", "content": "我叫小明，今年28岁，请记住。"},
        {"role": "assistant", "content": "好的，我记住了：你叫小明，今年28岁。"},
        {"role": "user", "content": "我今年多少岁？"}
      ]
    }'
  ```
</CodeGroup>

<Tip>
  **一套代码多模型**：把上面的 `model` 换成 `deepseek-v4-pro`、`claude-sonnet-4-6`、`gemini-3.5-flash` 等任意模型，多轮逻辑完全不变。模型清单见 [模型与价格总览](/api-capabilities/model-info)。
</Tip>

### 推理模型的历史处理

像 `deepseek-v4-pro` 这样的推理模型，响应里会多一个 `reasoning_content`（思考过程）字段。

<Warning>
  **历史里只放 `content`，不要回传 `reasoning_content`。** 思考过程只是本轮的中间产物，回传它既浪费 token，也不符合上游规范（DeepSeek 官方直连甚至会因此报 400）。正确做法是追加历史时只取 `content`：

  ```python theme={null}
  messages.append({"role": "assistant", "content": resp.choices[0].message.content})
  # 不要把 resp.choices[0].message.reasoning_content 放进去
  ```
</Warning>

推理模型在响应解析上的更多细节，见 [推理模型输出](/api-capabilities/openai/reasoning-models)。

## OpenAI 原生格式（Responses API）

端点 `/v1/responses`。多轮时**把完整历史作为 `input` 数组**传入（每条带 `role` / `content`），用法与兼容模式同理：

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

resp = client.responses.create(
    model="gpt-5.4-mini",
    input=[
        {"role": "user", "content": "记住暗号：紫色大象。"},
        {"role": "assistant", "content": "记住了，暗号是紫色大象。"},
        {"role": "user", "content": "暗号是什么？"},
    ],
)
print(resp.output_text)   # 暗号是：紫色大象。
```

<Warning>
  **不要依赖 `previous_response_id` / `conversation` / `store` 等服务端状态。** 经 API易 网关实测：传 `previous_response_id` 不报错（返回 200），但下一轮**并不会记得**上一轮内容，`GET /v1/responses/{id}` 也不可用。因此在 API易 平台，Responses API 也请按上面的**自管理历史**（`input` 数组）方式使用。
</Warning>

## Gemini 原生格式

端点 `/v1beta/models/{model}:generateContent`。历史放在 `contents` 数组里，注意 **role 取值是 `user` / `model`**（不是 `assistant`），每条的内容在 `parts` 里。

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(api_key="YOUR_API_KEY",
                      http_options={"base_url": "https://api.apiyi.com"})

contents = [
    {"role": "user", "parts": [{"text": "记住暗号：紫色大象。"}]},
    {"role": "model", "parts": [{"text": "好的，我记住了：紫色大象。"}]},
    {"role": "user", "parts": [{"text": "暗号是什么？"}]},
]
resp = client.models.generate_content(model="gemini-3.5-flash", contents=contents)
print(resp.text)   # 暗号是：紫色大象。
```

<Tip>
  **更省事的写法**：官方 `google-genai` SDK 的 `client.chats.create(...)` 会自动维护 `contents` 历史，你只管 `send_message`，无需手动拼接。
</Tip>

<Note>
  Gemini 3 系列响应的 part 上会带 `thoughtSignature`（思维签名）。**普通文本多轮只回传 `text` 即可记住上下文**（更省 token）；只有在**函数调用**等需要严格推理连续性的场景才需把 `thoughtSignature` 原样回传——官方 SDK 会自动处理。详见 [Gemini 原生调用](/api-capabilities/gemini/native) 与 [函数调用](/api-capabilities/gemini/function-calling)。
</Note>

## Anthropic 原生格式

端点 `/v1/messages`。历史放在 `messages` 数组里，role 取值 `user` / `assistant`，`content` 用字符串简写即可。注意 **`max_tokens` 必填**。

```python theme={null}
import requests

def chat(messages):
    r = requests.post(
        "https://api.apiyi.com/v1/messages",
        headers={
            "content-type": "application/json",
            "anthropic-version": "2023-06-01",
            "x-api-key": "YOUR_API_KEY",
        },
        json={"model": "claude-sonnet-4-6", "max_tokens": 200, "messages": messages},
        timeout=60,
    )
    return "".join(b["text"] for b in r.json()["content"] if b["type"] == "text")

messages = [{"role": "user", "content": "记住暗号：紫色大象。"}]
reply = chat(messages)
messages.append({"role": "assistant", "content": reply})       # 追加回复
messages.append({"role": "user", "content": "暗号是什么？"})
print(chat(messages))   # 暗号是：紫色大象。
```

<Tip>
  也可以用官方 `anthropic` SDK，把 base\_url 指向 `https://api.apiyi.com` 即可。响应是 `content` 块数组，解析细节见 [Claude 流式与非流式响应](/api-capabilities/claude-response-handling)。
</Tip>

## 四种格式对比

| 维度      | OpenAI 兼容              | OpenAI 原生(Responses) | Gemini 原生                   | Anthropic 原生   |
| ------- | ---------------------- | -------------------- | --------------------------- | -------------- |
| 端点      | `/v1/chat/completions` | `/v1/responses`      | `/v1beta/…:generateContent` | `/v1/messages` |
| 历史字段    | `messages`             | `input`              | `contents`                  | `messages`     |
| role 取值 | system/user/assistant  | user/assistant       | **user/model**              | user/assistant |
| 内容写法    | `content` 字符串          | `content` 字符串        | `parts: [{text}]`           | `content` 字符串  |
| 历史维护方   | 自己拼                    | 自己拼                  | 自己拼                         | 自己拼            |
| 服务端会话状态 | 无                      | ⚠️ 不可用               | 无                           | 无              |
| 多模型通用   | ✅ 换 model 名即可          | 仅 OpenAI 系           | 仅 Gemini                    | 仅 Claude       |

<Tip>
  **选型建议**：要用同一套代码调多家模型 → 首选 **OpenAI 兼容模式**；要用某家原生独有能力（Gemini 思维签名 / 代码执行、Claude 思考块与缓存、OpenAI 内置工具）→ 用对应**原生格式**。
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="对话越长，费用越高吗？">
    是。每轮都要把完整历史重新发送，所以**输入 token 随轮数增长**，费用也随之上升。省钱主要靠**上下文缓存**：相同的历史前缀会自动命中缓存价（远低于原价）。各家缓存见 [OpenAI 缓存](/api-capabilities/openai/prompt-caching)、[Claude 缓存](/api-capabilities/claude-prompt-caching)、[Gemini 缓存](/api-capabilities/gemini/prompt-caching)。
  </Accordion>

  <Accordion title="历史要保留多少轮？超出上下文怎么办？">
    没有硬性要求，但历史越长越贵、也可能超出模型上下文窗口。常见策略：① **滑动窗口**——只保留最近 N 轮；② **摘要压缩**——把早期对话总结成一段话放进 system；③ 始终保留 system 指令 + 最近若干轮。按业务对"记忆深度"的需要权衡。
  </Accordion>

  <Accordion title="system / 系统指令放在哪里？">
    OpenAI 兼容与 Anthropic：放在 `messages` 最前面（兼容模式用 `role:"system"`；Anthropic 用顶层 `system` 字段或首条消息）。Gemini：用 `config.system_instruction`。系统指令**只需设置一次**，不必每轮重复追加。
  </Accordion>

  <Accordion title="推理模型的思考过程（reasoning_content）要回传吗？">
    **不要。** 思考过程是本轮中间产物，历史里只回传最终 `content`（Gemini 只回传 `text`）。回传思考既费 token，部分上游还会报错。函数调用场景下 Gemini 的 `thoughtSignature` 是例外——官方 SDK 会自动处理。
  </Accordion>

  <Accordion title="能不能让服务端帮我记住对话，不用每次发历史？">
    在 API易 平台**不建议依赖服务端会话状态**。OpenAI Responses 的 `previous_response_id` 经网关转发后不保证生效（实测不记忆）。请统一采用客户端自维护历史的方式，行为最稳定、跨模型一致。
  </Accordion>
</AccordionGroup>

## 相关链接

* 调用基础：[OpenAI 兼容模式调用](/api-capabilities/openai/compatible) · [OpenAI 原生调用](/api-capabilities/openai/native) · [Gemini 原生调用](/api-capabilities/gemini/native) · [Claude API 基础](/api-capabilities/claude)
* 响应解析：[OpenAI 响应数据处理](/api-capabilities/openai/response-handling) · [推理模型输出](/api-capabilities/openai/reasoning-models) · [Claude 流式与非流式响应](/api-capabilities/claude-response-handling) · [Gemini 流式与非流式响应](/api-capabilities/gemini/response-handling)
* 模型与价格：[模型与价格总览](/api-capabilities/model-info)
* 获取 / 管理令牌：`https://api.apiyi.com/token`
