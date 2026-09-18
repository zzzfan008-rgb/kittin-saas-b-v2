> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 原生格式：流式与非流式响应

> Gemini 官方 generateContent / streamGenerateContent 的响应结构：candidates/parts、thoughtSignature、SSE 流式，附解析方法与字段说明。

通过 [Gemini 原生格式](/api-capabilities/gemini/native)（`/v1beta` generateContent）调用时，响应是 Google 的 `candidates / parts` 结构，与 OpenAI 兼容格式不同。本页讲清非流式（`generateContent`）与流式（`streamGenerateContent`）两种响应怎么解析。

<Info>
  请求侧（base\_url 为 `https://api.apiyi.com` 不带 `/v1`、`x-goog-api-key` 鉴权、`thinking_level` 思考控制）见 [Gemini 原生格式调用指南](/api-capabilities/gemini/native)。本页只讲**响应侧**。示例用轻量模型 `gemini-3.1-flash-lite`。
</Info>

## 非流式响应

端点 `…:generateContent`，**正文在 `candidates[0].content.parts[]`**：

```json theme={null}
{
  "candidates": [{
    "content": {
      "role": "model",
      "parts": [
        { "text": "1+1等于2。", "thoughtSignature": "EjQKMgEM…" }
      ]
    },
    "finishReason": "STOP",
    "index": 0
  }],
  "usageMetadata": {
    "promptTokenCount": 15,
    "candidatesTokenCount": 6,
    "totalTokenCount": 21
  },
  "modelVersion": "gemini-3.1-flash-lite",
  "responseId": "Il0taoSYJ5Cez7…"
}
```

取正文要**遍历 `parts`** 拼接每个 `text`：

<CodeGroup>
  ```python Python theme={null}
  import requests

  resp = requests.post(
      "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      headers={"Content-Type": "application/json", "x-goog-api-key": "YOUR_API_KEY"},
      json={"contents": [{"parts": [{"text": "1+1等于几？"}]}]},
      timeout=60,
  )
  data = resp.json()
  parts = data["candidates"][0]["content"]["parts"]
  text = "".join(p["text"] for p in parts if "text" in p)
  print(text)
  print(data["usageMetadata"])
  ```

  ```bash cURL theme={null}
  curl "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:generateContent" \
    -H "Content-Type: application/json" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -d '{"contents":[{"parts":[{"text":"1+1等于几？"}]}]}'
  ```
</CodeGroup>

<Note>
  `finishReason` 是**大写** `STOP`（不是 OpenAI 的小写 `stop`），其它取值如 `MAX_TOKENS`、`SAFETY`。一个 `part` 可能只含 `thoughtSignature` 而无 `text`，遍历时要用 `if "text" in p` 过滤，否则会 KeyError。
</Note>

## thoughtSignature（思维签名）

Gemini 3 系列会在 part 上附带 `thoughtSignature`（加密的推理状态）——**实测连轻量的 `gemini-3.1-flash-lite` 也会返回**。

* **单轮**：用不到，忽略即可。
* **多轮 / 函数调用**：要把上一轮响应里的 `thoughtSignature` **原样回传**到下一轮的 `contents` 中，模型才能延续推理链。**官方 `google-genai` SDK 自动处理**；手写 REST 时注意不要丢弃该字段。详见 [Gemini 函数调用](/api-capabilities/gemini/function-calling)。

<Tip>
  这正是原生格式与 [OpenAI 兼容模式](/api-capabilities/openai/reasoning-models) 的关键区别：兼容模式下推理模型无状态、不暴露签名；原生格式才有 `thoughtSignature` 且多轮需回传。
</Tip>

## 流式响应（SSE）

端点 `…:streamGenerateContent`，每行 `data: {...}`，每块的增量在 `candidates[0].content.parts[0].text`：

```text theme={null}
data: {"candidates":[{"content":{"parts":[{"text":"1"}]},"finishReason":"","index":0}],"usageMetadata":{...}}
data: {"candidates":[{"content":{"parts":[{"text":"+1等于2。"}]},"finishReason":"","index":0}],"usageMetadata":{...}}
data: {"candidates":[{"content":{"parts":[{"thoughtSignature":"EjQK…"}]},"finishReason":"STOP","index":0}],"usageMetadata":{...}}
```

<Warning>
  **经 API易 网关，流式统一返回 SSE 的 `data:` 行**（加不加 `?alt=sse` 都一样），**没有 `[DONE]` 终止符**——以 `finishReason == "STOP"` 的那一块为结束。最后一块通常**只含 `thoughtSignature` 而无 `text`**。
</Warning>

```python theme={null}
import json, requests

resp = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:streamGenerateContent?alt=sse",
    headers={"Content-Type": "application/json", "x-goog-api-key": "YOUR_API_KEY"},
    json={"contents": [{"parts": [{"text": "写一首短诗"}]}]},
    stream=True, timeout=120,
)

text, usage = "", None
for line in resp.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data: "):
        continue
    chunk = json.loads(line[6:])
    usage = chunk.get("usageMetadata", usage)        # 累计值，后到的覆盖
    for cand in chunk.get("candidates", []):
        for p in cand.get("content", {}).get("parts", []):
            if "text" in p:                          # 跳过只含 thoughtSignature 的块
                text += p["text"]
                print(p["text"], end="", flush=True)
print("\n", usage)
```

<Note>
  `usageMetadata` **每块都带，且是累计值**（`candidatesTokenCount` 随输出增长）——以**最后一块**为准即可，无需自己累加。
</Note>

## 与 OpenAI 兼容格式的关键差异

| 维度        | Gemini 原生（`/v1beta`）                    | OpenAI 兼容（`/v1/chat/completions`） |
| --------- | --------------------------------------- | --------------------------------- |
| base\_url | `https://api.apiyi.com`（不带 `/v1`）       | `https://api.apiyi.com/v1`        |
| 鉴权头       | `x-goog-api-key`                        | `Authorization: Bearer`           |
| 正文位置      | `candidates[0].content.parts[].text`    | `choices[0].message.content`      |
| 流式增量      | 各块 `parts[].text`                       | `choices[0].delta.content`        |
| 流式终止      | `finishReason == "STOP"`，**无 `[DONE]`** | `data: [DONE]`                    |
| 结束原因      | 大写 `STOP` / `MAX_TOKENS`                | 小写 `stop`                         |
| 思维签名      | ✅ `thoughtSignature`（多轮需回传）             | ❌ 不暴露                             |
| usage     | `usageMetadata`（流式每块累计）                 | `usage`（流式尾部一次性）                  |

## usage 与计费

```python theme={null}
u = data["usageMetadata"]
# promptTokenCount  输入 / candidatesTokenCount 输出 / thoughtsTokenCount 思考 / totalTokenCount 总量
```

* `thoughtsTokenCount`（思考 token）按**输出价**计费，可用 `thinking_level` 控档省钱。
* 缓存命中 `cachedContentTokenCount` 的折扣见 [Gemini 缓存计费](/api-capabilities/gemini/prompt-caching)。
* 各字段完整说明见 [Gemini 原生格式调用指南](/api-capabilities/gemini/native) 的「用量字段」一节。

## 相关链接

* 同组页面：[Gemini 原生格式调用指南](/api-capabilities/gemini/native) · [多模态与代码执行](/api-capabilities/gemini/multimodal) · [函数调用](/api-capabilities/gemini/function-calling)
* 兼容格式对照：[OpenAI 兼容模式响应数据处理](/api-capabilities/openai/response-handling)
* 获取 / 管理令牌：`https://api.apiyi.com/token`
