> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini Function Calling 函式呼叫指南

> function_declarations 定義、AUTO/ANY/NONE 呼叫模式、function_response 回傳，以及 Gemini 3 思維簽名的回傳要求。

Gemini 原生格式完整支援 Function Calling：模型輸出"想調哪個函式 + 引數"，你本地執行後把結果回傳，模型給出最終回答。整體迴圈與 [OpenAI 的 FC](/zh-Hant/api-capabilities/openai/function-calling) 一致，但**欄位格式完全不同**，不能混用。

本頁基於 Google 官方文件整理（`ai.google.dev/gemini-api/docs/function-calling`，2026年6月資料）。

## 與 OpenAI 格式的差異速查

|        | Gemini 原生                                                          | OpenAI                                                     |
| ------ | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| 工具定義   | `tools: [{"function_declarations": [...]}]`                        | `tools: [{"type": "function", ...}]`                       |
| 呼叫返回   | part 裡的 `function_call`（`name` + `args` 物件）                        | `tool_calls` / `function_call` item（`arguments` 是 JSON 字串） |
| 結果回傳   | `Part(function_response=...)`                                      | `role:"tool"` 訊息 / `function_call_output` item             |
| 呼叫策略   | `tool_config.function_calling_config.mode`：`AUTO` / `ANY` / `NONE` | `tool_choice`：`auto` / `required` / `none`                 |
| 多輪推理狀態 | **Gemini 3 需回傳思維簽名**                                               | 無此要求                                                       |

注意一個易錯點：Gemini 的 `function_call.args` 是**結構化物件**，不是 JSON 字串，不需要 `json.loads`。

## 完整呼叫迴圈

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

# 1. 定義工具
tools = [{
    "function_declarations": [{
        "name": "get_weather",
        "description": "獲取指定城市的當前天氣",
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

# 2. 第一次請求：模型決定調函式
contents = [types.Content(role="user", parts=[types.Part(text="北京現在多少度？")])]

r1 = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=contents,
    config={"tools": tools}
)

call = r1.candidates[0].content.parts[0].function_call
print(f"模型想呼叫: {call.name}, 引數: {dict(call.args)}")

# 3. 本地執行（這裡用假資料代替真實查詢）
weather = {"city": call.args["city"], "temp": 26, "condition": "晴"}

# 4. 回傳結果：把模型的回覆（含 function_call 及思維簽名）和函式結果一起加進歷史
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
  **Gemini 3 系列的思維簽名（thought signature）必須回傳**：模型返回的 `function_call` part 裡帶有加密的 `thought_signature`，第二次請求時要把**整個模型回覆 Content 原樣加進歷史**（如上例第 4 步），簽名缺失會導致推理鏈斷裂甚至請求報錯。用官方 `google-genai` SDK 按上面的寫法即可自動帶上；手寫 REST 請求時不要剝掉該欄位。
</Warning>

## 呼叫模式（mode）

```python theme={null}
config = {
    "tools": tools,
    "tool_config": {"function_calling_config": {"mode": "AUTO"}}
}
```

| 模式           | 行為                                          |
| ------------ | ------------------------------------------- |
| `AUTO`（預設推薦） | 模型自行決定調不調                                   |
| `ANY`        | 強制必須呼叫某個函式；可配 `allowed_function_names` 限定範圍 |
| `NONE`       | 禁止呼叫，只生成文本                                  |

```python theme={null}
# 強制只能調 get_weather
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

## 並行與多步呼叫

* **並行呼叫**：一輪裡模型可能返回多個 `function_call` part（如同時查兩個城市），逐個執行後把全部 `function_response` 一起回傳
* **多步呼叫**：模型可以"調函式 → 看結果 → 再調下一個"鏈式推進，迴圈處理直到響應裡不再有 `function_call`。給迴圈設最大輪數，避免失控燒錢

```python theme={null}
# 通用 Agent 迴圈骨架
MAX_ROUNDS = 5
for _ in range(MAX_ROUNDS):
    response = client.models.generate_content(
        model="gemini-3.5-flash", contents=contents, config={"tools": tools}
    )
    parts = response.candidates[0].content.parts
    calls = [p.function_call for p in parts if getattr(p, "function_call", None)]
    if not calls:
        print(response.text)  # 沒有函式呼叫了，輸出最終回答
        break

    contents.append(response.candidates[0].content)  # 含思維簽名，原樣入歷史
    result_parts = [
        types.Part(function_response=types.FunctionResponse(
            name=c.name, response=execute(c.name, dict(c.args))
        ))
        for c in calls
    ]
    contents.append(types.Content(role="user", parts=result_parts))
```

## 最佳實踐

* **description 寫給模型看**：說清"什麼時候該調我"，引數能用 `enum` 收窄就別用自由字串
* **工具定義保持穩定**：參與快取字首匹配，頻繁變動會破壞 [快取命中](/zh-Hant/api-capabilities/gemini/prompt-caching)
* **需要確定性 JSON 輸出而非呼叫外部工具時**，考慮用 `response_schema` 結構化輸出代替 FC（見 [原生呼叫](/zh-Hant/api-capabilities/gemini/native) 參數列）
* 沙箱計算類任務可以直接用 [code\_execution](/zh-Hant/api-capabilities/gemini/multimodal) 工具，不必自己實現計算函式

## 常見踩坑

| 現象                         | 處理                                                          |
| -------------------------- | ----------------------------------------------------------- |
| 第二輪報錯 / 回答前後矛盾             | 模型回覆（含思維簽名）沒有原樣加進歷史 —— 整個 `candidates[0].content` 都要 append |
| 對 `args` 做 `json.loads` 報錯 | Gemini 的 `args` 是物件不是字串，直接 `dict(call.args)`                |
| 模型不調函式                     | description 不夠明確；或改用 `mode: "ANY"` 強制                       |
| 用 OpenAI 格式的 tools 定義報錯    | 兩套格式不能混用，按上文 `function_declarations` 格式改寫                   |

## 相關連結

* 同組頁面：[原生呼叫](/zh-Hant/api-capabilities/gemini/native) · [多模態與程式碼執行](/zh-Hant/api-capabilities/gemini/multimodal) · [快取計費](/zh-Hant/api-capabilities/gemini/prompt-caching)
* OpenAI 側對照：[OpenAI FC函式呼叫](/zh-Hant/api-capabilities/openai/function-calling)
* Google 官方文件：`ai.google.dev/gemini-api/docs/function-calling`
