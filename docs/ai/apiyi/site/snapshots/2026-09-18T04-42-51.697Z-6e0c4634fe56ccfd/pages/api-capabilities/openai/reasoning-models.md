> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI 兼容模式：推理模型输出

> /v1/chat/completions 下推理模型的输出特点：思考型（reasoning_content）、思考签名、结构化输出，附各模型实测支持度。

推理模型（reasoning models）在回答前会先「思考」。通过 [兼容模式](/api-capabilities/openai/compatible) 调用时，它们的输出比普通模型多了一些细节。本页讲清三件事：**思考内容怎么拿、多轮怎么传、结构化输出怎么稳**。

<Info>
  本页聚焦 `/v1/chat/completions` 兼容模式。Claude 原生格式的思考块（`/v1/messages` 的 `thinking`）见 [Claude Effort 思考指南](/api-capabilities/claude-effort-thinking)；Gemini 原生的 `thinking_level` 与 `thought_signature` 见 [Gemini 原生调用](/api-capabilities/gemini/native)。
</Info>

## 推理模型输出总览

兼容模式下，推理模型在「是否输出思考文本」上分三类：

| 类型       | 代表模型                                                | 思考内容                             | 取正文方式                                 |
| -------- | --------------------------------------------------- | -------------------------------- | ------------------------------------- |
| 不输出思考    | gpt-4.1-mini、gemini-3.1-flash-lite、claude-haiku-4-5 | 无                                | 与普通模型一致                               |
| 输出思考文本   | grok-4.3、qwen3.6-plus、glm-5.1                       | `reasoning_content` 字段           | 正文在 `content`，思考在 `reasoning_content` |
| 仅计 token | gpt-5.4-mini                                        | 不返回文本，仅 `usage.reasoning_tokens` | 与普通模型一致                               |

<Tip>
  无论哪一类，**正文永远在 `content`**。只要你只读 `content`，所有推理模型都能像普通模型一样接入；想额外展示思考过程，再去读 `reasoning_content`。
</Tip>

## 思考型：reasoning\_content

会输出思考文本的模型，把思考链放在与 `content` 平行的 `reasoning_content` 字段。

**非流式**——`message` 同时含两者：

```json theme={null}
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "1+1等于2。",
      "reasoning_content": "用户在问 1+1 ……（一段思考过程）"
    },
    "finish_reason": "stop"
  }]
}
```

```python theme={null}
msg = resp.choices[0].message
print("正文：", msg.content)
# 思考过程（仅部分模型有，SDK 里可能在 model_extra 中）
print("思考：", getattr(msg, "reasoning_content", None))
```

**流式**——先推送一连串 `delta.reasoning_content`，思考完才开始推送 `delta.content`。务必把两者**分流渲染**（思考折叠、正文上屏），否则界面会先刷一大段思考：

```python theme={null}
for chunk in stream:
    if not chunk.choices:
        continue
    delta = chunk.choices[0].delta
    reasoning = getattr(delta, "reasoning_content", None)
    if reasoning:
        render_thinking(reasoning)   # 折叠区/灰字
    if delta.content:
        render_answer(delta.content) # 正文区
```

<Warning>
  **流式里 reasoning 与 content 的「互斥」写法三家不同**，解析时三种都要容忍：

  * **grok-4.3**：思考阶段只有 `reasoning_content` 键，正文阶段只有 `content` 键（另一个键直接不出现）。
  * **qwen3.6-plus**：两个键都在，非当前的为 `null`。
  * **glm-5.1**：思考阶段 `content` 为 `""`（空串）+ `reasoning_content` 有值。

  统一做法：用「真值判断」取值（`if reasoning:` / `if content:`），自动跳过缺失、`null`、`""` 三种空态。
</Warning>

<Note>
  推理 token 可能远超正文。实测一个「1+1」级问题，grok-4.3 的 `reasoning_tokens` 可达数百，而正文只有几个 token。思考链按输出 token 计费，**对延迟和成本敏感的场景请评估是否需要开启 / 展示思考**。
</Note>

## 思考签名与多轮对话

「思考签名」（thought signature）是 **Gemini 原生格式**的概念：原生多模态 / 函数调用里，模型会返回加密的 `thought_signature`，多轮时需原样回传以保持推理连续性（详见 [Gemini 原生调用](/api-capabilities/gemini/native) 与 [Gemini 函数调用](/api-capabilities/gemini/function-calling)）。

**在 `/v1/chat/completions` 兼容模式下，推理模型是无状态的：**

* 多轮对话只需把上一轮 assistant 的 **`content`** 放进 messages 历史即可；
* **无需回传 `reasoning_content`**，响应里也**不出现任何 signature 字段**；
* 实测 gemini-3.1-flash-lite、grok-4.3 在仅回传 `content` 的情况下，多轮上下文记忆均正常。

```python theme={null}
messages = [
    {"role": "user", "content": "记住数字 42。"},
    {"role": "assistant", "content": "好的，我记住了 42。"},  # 只回传 content
    {"role": "user", "content": "刚才那个数字乘以2是多少？"}
]
# grok-4.3 / gemini-3.1-flash-lite 均正确回答 84
```

<Tip>
  需要跨轮保留 Gemini 的思考签名、或用 Claude 的原生思考块做多轮，请改用对应的**原生格式**端点，而非兼容模式。
</Tip>

## 结构化输出

通过 `response_format` 让模型只吐 JSON。两种类型：

```python theme={null}
# 1) json_schema：严格按 schema 约束字段（OpenAI 标准）
response_format = {
    "type": "json_schema",
    "json_schema": {
        "name": "city_info",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "population": {"type": "integer"},
                "is_capital": {"type": "boolean"}
            },
            "required": ["city", "population", "is_capital"],
            "additionalProperties": False
        }
    }
}

# 2) json_object：只保证是合法 JSON，不约束字段
response_format = {"type": "json_object"}
```

### 各模型实测支持度

`json_schema` 各家支持参差，**这是结构化输出最大的坑**：

| 模型                    | `json_schema`                     | `json_object` | content 可否直接 parse |
| --------------------- | --------------------------------- | ------------- | ------------------ |
| gpt-4.1-mini          | ✅ 严格遵守                            | ✅             | ✅ 纯 JSON           |
| gemini-3.1-flash-lite | ✅                                 | ✅             | ✅                  |
| grok-4.3              | ✅（另带思考链）                          | ✅             | ✅ content 为纯 JSON  |
| gpt-5.4-mini          | ⚠️ JSON 对，但前面带 `<think>…</think>` | —             | ❌ 需先剥离 think 块     |
| qwen3.6-plus          | ⚠️ 报 400：messages 须含 "json" 字样    | ✅             | ✅                  |
| claude-haiku-4-5      | ❌ 忽略 schema，返回 Markdown           | —             | ❌                  |
| glm-5.1               | ❌ 忽略 schema，返回自然语言                | ✅             | json\_object 下 ✅   |

### 跨模型稳定拿 JSON 的建议

<Warning>
  不要假设 `json_schema` 在所有模型上都生效。要跨模型稳定，推荐组合拳：

  1. 优先用 `json_object`，兼容性比 `json_schema` 好；
  2. prompt 里**明确写「只返回 JSON」并出现 "json" 字样**（qwen 强制要求，其它模型也更稳）；
  3. 解析前做**容错**：剥离 ` ```json ` 代码块围栏、剥离 `<think>…</think>` 前缀，再 `json.loads`，失败则降级处理。
</Warning>

````python theme={null}
import json, re

def parse_json_loose(content: str):
    # 去掉 <think>…</think> 前缀（gpt-5.4-mini）
    content = re.sub(r"<think>.*?</think>", "", content, flags=re.S).strip()
    # 去掉 ```json 代码块围栏
    content = re.sub(r"^```(json)?|```$", "", content, flags=re.M).strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return None   # 降级：记录原文 / 重试 / 换模型
````

## 相关链接

* 同组页面：[响应数据处理](/api-capabilities/openai/response-handling) · [兼容模式调用](/api-capabilities/openai/compatible) · [函数调用](/api-capabilities/openai/function-calling)
* 原生格式思考：[Claude Effort 思考指南](/api-capabilities/claude-effort-thinking) · [Gemini 原生调用](/api-capabilities/gemini/native)
* 模型与价格：[模型与价格总览](/api-capabilities/model-info)
