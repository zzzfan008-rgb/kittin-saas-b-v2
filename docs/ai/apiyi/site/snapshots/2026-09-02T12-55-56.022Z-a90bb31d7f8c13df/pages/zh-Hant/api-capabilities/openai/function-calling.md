> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Function Calling 函式呼叫指南

> tools 定義、strict 嚴格模式、並行呼叫、流式拼裝，以及 responses 與 chat/completions 兩個端點的格式差異。

Function Calling（函式呼叫，簡稱 FC）是構建 Agent 的基礎能力：**模型不執行函式，只輸出"想調哪個函式 + 什麼引數"**，執行在你自己的程式碼裡完成，把結果回傳後模型再給出最終回答。

本頁基於 OpenAI 官方文件整理（`developers.openai.com/api/docs/guides/function-calling`，2026年6月資料），兩個端點的示例均可直接複製執行。

## 完整呼叫迴圈

<Steps>
  <Step title="定義 tools">
    把函式名、用途描述、引數 JSON Schema 隨請求發給模型
  </Step>

  <Step title="模型返回函式呼叫">
    模型判斷需要呼叫時，返回函式名和 JSON 格式的引數
  </Step>

  <Step title="本地執行">
    你的程式碼解析引數、真正執行函式（查資料庫、調外部 API……）
  </Step>

  <Step title="回傳結果">
    把執行結果連同歷史一起再發一次請求，模型基於結果生成最終回答
  </Step>
</Steps>

## 兩個端點的關鍵格式差異

同一個功能，`/v1/chat/completions` 和 `/v1/responses` 的欄位格式**不一樣**，這是接入時最容易踩的坑：

|           | Chat Completions                                               | Responses                                                                  |
| --------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| tools 定義  | 巢狀：`{"type": "function", "function": {name, parameters, ...}}` | 扁平：`{"type": "function", "name": ..., "parameters": ...}`                  |
| 呼叫返回      | `message.tool_calls[]`（含 `id`）                                 | 頂層 output item：`{"type": "function_call", "call_id", "name", "arguments"}` |
| 結果回傳      | `{"role": "tool", "tool_call_id": ..., "content": ...}`        | `{"type": "function_call_output", "call_id": ..., "output": ...}`          |
| strict 模式 | 需顯式 `"strict": true`                                           | 服務端會盡量自動歸一化為 strict                                                        |

<Warning>
  兩套格式**不能混用**。把 Chat Completions 的巢狀 `function: {...}` 定義發給 `/v1/responses`（或反過來）是 SDK 報"引數無效"最常見的原因。
</Warning>

需要把現有的工具呼叫從 Chat Completions 整體搬到 Responses（比如撞上了 GPT-5.4+ 的 `tools` 與 `reasoning_effort` 互斥限制），見 [端點選型與遷移](/zh-Hant/api-capabilities/openai/responses-migration)，那裡有完整的前後程式碼對照。

## Chat Completions 完整示例

以查天氣為例，走完"定義 → 呼叫 → 執行 → 回傳"全迴圈：

<CodeGroup>
  ```python Python theme={null}
  import json
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  tools = [{
      "type": "function",
      "function": {
          "name": "get_weather",
          "description": "獲取指定城市的當前天氣",
          "parameters": {
              "type": "object",
              "properties": {
                  "city": {"type": "string", "description": "城市名，如：北京"}
              },
              "required": ["city"],
              "additionalProperties": False
          },
          "strict": True
      }
  }]

  messages = [{"role": "user", "content": "北京天氣怎麼樣？"}]

  # 第 1 次請求：模型決定調函式
  r1 = client.chat.completions.create(
      model="gpt-5.4", messages=messages, tools=tools
  )
  tool_call = r1.choices[0].message.tool_calls[0]
  args = json.loads(tool_call.function.arguments)

  # 本地執行（這裡用假資料代替真實查詢）
  weather = {"city": args["city"], "temp": "26°C", "condition": "晴"}

  # 第 2 次請求：回傳結果，模型生成最終回答
  messages.append(r1.choices[0].message)
  messages.append({
      "role": "tool",
      "tool_call_id": tool_call.id,
      "content": json.dumps(weather, ensure_ascii=False)
  })

  r2 = client.chat.completions.create(
      model="gpt-5.4", messages=messages, tools=tools
  )
  print(r2.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const tools = [{
    type: 'function',
    function: {
      name: 'get_weather',
      description: '獲取指定城市的當前天氣',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: '城市名，如：北京' }
        },
        required: ['city'],
        additionalProperties: false
      },
      strict: true
    }
  }];

  const messages = [{ role: 'user', content: '北京天氣怎麼樣？' }];

  const r1 = await openai.chat.completions.create({
    model: 'gpt-5.4', messages, tools
  });
  const toolCall = r1.choices[0].message.tool_calls[0];
  const args = JSON.parse(toolCall.function.arguments);

  const weather = { city: args.city, temp: '26°C', condition: '晴' };

  messages.push(r1.choices[0].message);
  messages.push({
    role: 'tool',
    tool_call_id: toolCall.id,
    content: JSON.stringify(weather)
  });

  const r2 = await openai.chat.completions.create({
    model: 'gpt-5.4', messages, tools
  });
  console.log(r2.choices[0].message.content);
  ```

  ```bash cURL（第 1 次請求） theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "messages": [{"role": "user", "content": "北京天氣怎麼樣？"}],
      "tools": [{
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "獲取指定城市的當前天氣",
          "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
            "additionalProperties": false
          },
          "strict": true
        }
      }]
    }'
  ```
</CodeGroup>

## Responses 完整示例

注意三處不同：tools 定義是**扁平**的、呼叫以頂層 `function_call` item 返回、回傳用 `function_call_output`。配合 `previous_response_id`，第 2 次請求不必重發全部歷史：

```python theme={null}
import json
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

tools = [{
    "type": "function",          # 扁平定義，沒有巢狀的 function 欄位
    "name": "get_weather",
    "description": "獲取指定城市的當前天氣",
    "parameters": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "城市名，如：北京"}
        },
        "required": ["city"],
        "additionalProperties": False
    }
}]

# 第 1 次請求
r1 = client.responses.create(
    model="gpt-5.4",
    input="北京天氣怎麼樣？",
    tools=tools
)

# 從 output 數組裡找 function_call item
call = next(item for item in r1.output if item.type == "function_call")
args = json.loads(call.arguments)

weather = {"city": args["city"], "temp": "26°C", "condition": "晴"}

# 第 2 次請求：用 previous_response_id 接上文，只回傳函式結果
r2 = client.responses.create(
    model="gpt-5.4",
    previous_response_id=r1.id,
    input=[{
        "type": "function_call_output",
        "call_id": call.call_id,
        "output": json.dumps(weather, ensure_ascii=False)
    }],
    tools=tools
)
print(r2.output_text)
```

## strict 嚴格模式（結構化輸出）

`strict: true` 讓模型輸出的引數**嚴格符合你的 JSON Schema**，杜絕幻覺欄位和缺欄位。三個要求：

1. Schema 裡必須有 `"additionalProperties": false`
2. 所有欄位都要出現在 `required` 裡（可選語義用 `"type": ["string", "null"]` 表達）
3. 只能用受支援的 JSON Schema 子集（基本型別、enum、陣列、巢狀物件等）

```json theme={null}
// ✅ 合法的 strict schema
{
  "type": "object",
  "properties": {
    "city": {"type": "string"},
    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
    "date": {"type": ["string", "null"], "description": "可選，預設今天"}
  },
  "required": ["city", "unit", "date"],
  "additionalProperties": false
}
```

```json theme={null}
// ❌ 不合法：缺 additionalProperties，date 不在 required 裡
{
  "type": "object",
  "properties": {
    "city": {"type": "string"},
    "date": {"type": "string"}
  },
  "required": ["city"]
}
```

<Warning>
  **strict 模式與並行函式呼叫不相容**：需要嚴格 schema 保證時，請同時設定 `parallel_tool_calls: false`。
</Warning>

## parallel\_tool\_calls 與 tool\_choice

### 並行呼叫

`parallel_tool_calls` 預設開啟，模型可以在一輪裡同時請求多個函式（如同時查北京和上海的天氣）。逐個執行後**全部回傳**再發起下一次請求，每個結果都要帶對應的 `call_id`（responses）或 `tool_call_id`（chat）配對。

### tool\_choice 控制策略

| 取值                                            | 行為            |
| --------------------------------------------- | ------------- |
| `"auto"`（預設）                                  | 模型自行決定調不調、調哪個 |
| `"required"`                                  | 必須呼叫至少一個函式    |
| `{"type": "function", "name": "get_weather"}` | 強制呼叫指定函式      |
| `"none"`                                      | 禁止呼叫，只生成文本    |

### allowed\_tools 限定子集

工具很多但本輪只想開放一部分時，用 `tool_choice` 的 `allowed_tools` 形式限定可呼叫子集 —— 它**不改變 tools 列表本身**，因此不破壞 [快取](/zh-Hant/api-capabilities/openai/prompt-caching) 的穩定字首：

```python theme={null}
tool_choice={
    "type": "allowed_tools",
    "mode": "auto",
    "tools": [{"type": "function", "name": "get_weather"}]
}
```

## 流式中的函式呼叫

### Chat Completions：按 index 拼接

函式引數在流式裡是分片下發的，按 `index` 累加 `arguments` 字串，流結束後再 `json.loads`：

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5.4", messages=messages, tools=tools, stream=True
)

calls = {}  # index -> {name, arguments}
for chunk in stream:
    delta = chunk.choices[0].delta if chunk.choices else None
    if delta and delta.tool_calls:
        for tc in delta.tool_calls:
            entry = calls.setdefault(tc.index, {"name": "", "arguments": ""})
            if tc.function.name:
                entry["name"] = tc.function.name
            if tc.function.arguments:
                entry["arguments"] += tc.function.arguments

print(calls)  # 流結束後每個 entry 的 arguments 才是完整 JSON
```

### Responses：監聽語義事件

`response.function_call_arguments.delta` 事件攜帶引數增量，`response.function_call_arguments.done` 給出完整引數，無需自己按 index 拼。

## 最佳實踐與踩坑

寫好工具定義：

* **函式名和 description 是寫給模型看的**：說清楚"什麼時候該調我"，比如 `"獲取即時天氣，僅當用戶明確詢問天氣時呼叫"`
* **引數用 enum 收窄**：能列舉就別用自由字串，幻覺引數會少一大半
* **工具定義放 prompt 前部且保持穩定**：tools 會參與快取字首比對，定義穩定 = 輸入費打 1 折（見 [快取計費](/zh-Hant/api-capabilities/openai/prompt-caching)）
* **Agent 迴圈設最大輪數**：避免模型在"調函式 → 回傳 → 又調函式"裡打轉燒錢

常見踩坑：

| 現象                    | 處理                                                   |
| --------------------- | ---------------------------------------------------- |
| `arguments` 不是合法 JSON | 上 `strict: true`，從根上解決                               |
| 模型調了不存在的函式名           | 用 `tool_choice` 收緊；檢查 description 是否誤導               |
| 並行呼叫後報 `call_id` 不匹配  | 每個結果必須和對應呼叫的 `call_id` / `tool_call_id` 一一配對，缺一個都會報錯 |
| 兩個端點格式混用報引數錯誤         | 對照上文差異表，確認 tools 定義巢狀/扁平與端點匹配                        |

## 模型支援與選型

gpt-5 全系支援函式呼叫，按場景選：

| 場景              | 推薦模型                                 | 理由        |
| --------------- | ------------------------------------ | --------- |
| 日常 Agent / 工具呼叫 | `gpt-5.4`（\$2.50 / \$15.00 每 1M）     | 能力與成本均衡   |
| 高頻輕量工具路由        | `gpt-5.4-mini`（\$0.75 / \$4.50 每 1M） | 便宜，簡單分發夠用 |
| 複雜多步推理 Agent    | `gpt-5.5`（\$5.00 / \$30.00 每 1M）     | 長鏈路規劃更穩   |

## 相關連結

* 同組頁面：[原生呼叫](/zh-Hant/api-capabilities/openai/native) · [相容模式呼叫](/zh-Hant/api-capabilities/openai/compatible) · [快取計費](/zh-Hant/api-capabilities/openai/prompt-caching)
* 獲取 / 管理令牌：`https://api.apiyi.com/token`
* OpenAI 官方文件：`developers.openai.com/api/docs/guides/function-calling`
