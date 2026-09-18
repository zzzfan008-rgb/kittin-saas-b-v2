> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini Function Calling 函数调用指南

> function_declarations 定义、AUTO/ANY/NONE 调用模式、function_response 回传，以及 Gemini 3 思维签名的回传要求。

Gemini 原生格式完整支持 Function Calling：模型输出"想调哪个函数 + 参数"，你本地执行后把结果回传，模型给出最终回答。整体循环与 [OpenAI 的 FC](/api-capabilities/openai/function-calling) 一致，但**字段格式完全不同**，不能混用。

本页基于 Google 官方文档整理（`ai.google.dev/gemini-api/docs/function-calling`，2026年6月数据）。

## 与 OpenAI 格式的差异速查

|        | Gemini 原生                                                          | OpenAI                                                      |
| ------ | ------------------------------------------------------------------ | ----------------------------------------------------------- |
| 工具定义   | `tools: [{"function_declarations": [...]}]`                        | `tools: [{"type": "function", ...}]`                        |
| 调用返回   | part 里的 `function_call`（`name` + `args` 对象）                        | `tool_calls` / `function_call` item（`arguments` 是 JSON 字符串） |
| 结果回传   | `Part(function_response=...)`                                      | `role:"tool"` 消息 / `function_call_output` item              |
| 调用策略   | `tool_config.function_calling_config.mode`：`AUTO` / `ANY` / `NONE` | `tool_choice`：`auto` / `required` / `none`                  |
| 多轮推理状态 | **Gemini 3 需回传思维签名**                                               | 无此要求                                                        |

注意一个易错点：Gemini 的 `function_call.args` 是**结构化对象**，不是 JSON 字符串，不需要 `json.loads`。

## 完整调用循环

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

# 1. 定义工具
tools = [{
    "function_declarations": [{
        "name": "get_weather",
        "description": "获取指定城市的当前天气",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "城市名，如：北京"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
            },
            "required": ["city"]
        }
    }]
}]

# 2. 第一次请求：模型决定调函数
contents = [types.Content(role="user", parts=[types.Part(text="北京现在多少度？")])]

r1 = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=contents,
    config={"tools": tools}
)

call = r1.candidates[0].content.parts[0].function_call
print(f"模型想调用: {call.name}, 参数: {dict(call.args)}")

# 3. 本地执行（这里用假数据代替真实查询）
weather = {"city": call.args["city"], "temp": 26, "condition": "晴"}

# 4. 回传结果：把模型的回复（含 function_call 及思维签名）和函数结果一起加进历史
contents.append(r1.candidates[0].content)
contents.append(types.Content(
    role="user",
    parts=[types.Part(
        function_response=types.FunctionResponse(name=call.name, response=weather)
    )]
))

r2 = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=contents,
    config={"tools": tools}
)
print(r2.text)
```

<Warning>
  **Gemini 3 系列的思维签名（thought signature）必须回传**：模型返回的 `function_call` part 里带有加密的 `thought_signature`，第二次请求时要把**整个模型回复 Content 原样加进历史**（如上例第 4 步），签名缺失会导致推理链断裂甚至请求报错。用官方 `google-genai` SDK 按上面的写法即可自动带上；手写 REST 请求时不要剥掉该字段。
</Warning>

## 调用模式（mode）

```python theme={null}
config = {
    "tools": tools,
    "tool_config": {"function_calling_config": {"mode": "AUTO"}}
}
```

| 模式           | 行为                                          |
| ------------ | ------------------------------------------- |
| `AUTO`（默认推荐） | 模型自行决定调不调                                   |
| `ANY`        | 强制必须调用某个函数；可配 `allowed_function_names` 限定范围 |
| `NONE`       | 禁止调用，只生成文本                                  |

```python theme={null}
# 强制只能调 get_weather
config = {
    "tools": tools,
    "tool_config": {
        "function_calling_config": {
            "mode": "ANY",
            "allowed_function_names": ["get_weather"]
        }
    }
}
```

## 并行与多步调用

* **并行调用**：一轮里模型可能返回多个 `function_call` part（如同时查两个城市），逐个执行后把全部 `function_response` 一起回传
* **多步调用**：模型可以"调函数 → 看结果 → 再调下一个"链式推进，循环处理直到响应里不再有 `function_call`。给循环设最大轮数，避免失控烧钱

```python theme={null}
# 通用 Agent 循环骨架
MAX_ROUNDS = 5
for _ in range(MAX_ROUNDS):
    response = client.models.generate_content(
        model="gemini-3.5-flash", contents=contents, config={"tools": tools}
    )
    parts = response.candidates[0].content.parts
    calls = [p.function_call for p in parts if getattr(p, "function_call", None)]
    if not calls:
        print(response.text)  # 没有函数调用了，输出最终回答
        break

    contents.append(response.candidates[0].content)  # 含思维签名，原样入历史
    result_parts = [
        types.Part(function_response=types.FunctionResponse(
            name=c.name, response=execute(c.name, dict(c.args))
        ))
        for c in calls
    ]
    contents.append(types.Content(role="user", parts=result_parts))
```

## 最佳实践

* **description 写给模型看**：说清"什么时候该调我"，参数能用 `enum` 收窄就别用自由字符串
* **工具定义保持稳定**：参与缓存前缀匹配，频繁变动会破坏 [缓存命中](/api-capabilities/gemini/prompt-caching)
* **需要确定性 JSON 输出而非调用外部工具时**，考虑用 `response_schema` 结构化输出代替 FC（见 [原生调用](/api-capabilities/gemini/native) 参数表）
* 沙箱计算类任务可以直接用 [code\_execution](/api-capabilities/gemini/multimodal) 工具，不必自己实现计算函数

## 常见踩坑

| 现象                         | 处理                                                          |
| -------------------------- | ----------------------------------------------------------- |
| 第二轮报错 / 回答前后矛盾             | 模型回复（含思维签名）没有原样加进历史 —— 整个 `candidates[0].content` 都要 append |
| 对 `args` 做 `json.loads` 报错 | Gemini 的 `args` 是对象不是字符串，直接 `dict(call.args)`               |
| 模型不调函数                     | description 不够明确；或改用 `mode: "ANY"` 强制                       |
| 用 OpenAI 格式的 tools 定义报错    | 两套格式不能混用，按上文 `function_declarations` 格式改写                   |

## 相关链接

* 同组页面：[原生调用](/api-capabilities/gemini/native) · [多模态与代码执行](/api-capabilities/gemini/multimodal) · [缓存计费](/api-capabilities/gemini/prompt-caching)
* OpenAI 侧对照：[OpenAI FC函数调用](/api-capabilities/openai/function-calling)
* Google 官方文档：`ai.google.dev/gemini-api/docs/function-calling`
