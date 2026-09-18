> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 長文輸出實戰建議

> 漫劇指令碼、文學創作、萬字長文等長輸出場景怎麼穩定拿到結果：用流式、read timeout 按事件間隔設、max_tokens 給足、查 stop_reason。附 Claude 原生呼叫示例。

<Info>
  **一句話結論**：讓大模型一次產出上萬字（分集大綱、長篇小說、長翻譯、大段程式碼）時，**用流式、不要用非流式**；客戶端 read timeout 按「兩次資料事件之間的間隔」設（幾十秒即可，建議 90\~120 秒），不要按「整段生成的總時長」設；`max_tokens` 給足；拿到響應後先看 `stop_reason` 再用正文。做到這四點，長文場景就不會「拿不到結果」。
</Info>

本頁面向所有大模型通用（OpenAI、Claude、Gemini、Grok 等），程式碼示例以 Claude 原生 `/v1/messages` 為主，OpenAI 相容格式的差異單獨標註。

## 三個先知道的事實

1. **出萬字長文，真實生成 10\~20 分鐘是常態**。模型要逐 token 產出上萬字，疊加推理/思考階段，端到端耗時本就很長。這不是閘道慢，是生成本身慢。

2. **非流式要「整段攢齊」才回寫**。非流式（`stream` 不傳或為 `false`）下，服務端必須等模型把整段生成完，再一次性把響應體回傳給你。這幾分鐘裡你的客戶端 read timeout 一直在和它賽跑，生成越久越容易在拿到結果前先斷開——斷開時異常資訊經常是空的（`httpx.ReadError` 的 `str(e)` 為空），看不出病因。

3. **斷連仍然計費，盲目重試是重複計費**。只要服務端已經產出，哪怕最後沒送達你，這次呼叫也照常計費。已經收到部分正文再斷開的情況，重試等於讓模型再跑一遍、再付一次錢。

## 用流式，不要用非流式

流式（`stream: true`）下，首位元組幾秒內就到，之後每隔幾十秒必有一個數據事件。你的 read timeout 只需覆蓋「兩次事件之間的間隔」，而不是覆蓋長達十幾分鐘的整段生成——這是流式能穩定拿到長文結果的根本原因。

兩種協議的**結束訊號不同**，別混用：

| 協議                               | 結束訊號                                   | 正文取法                                                                |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| Claude 原生 `/v1/messages`         | `event: message_stop`（**沒有 `[DONE]`**） | `content_block_delta` 裡 `delta.type == "text_delta"` 的 `delta.text` |
| OpenAI 相容 `/v1/chat/completions` | `data: [DONE]`                         | `choices[0].delta.content`                                          |

Claude 原生開啟自適應思考時，會**先**出一個 `type: "thinking"` 的思考塊（增量是 `thinking_delta`），再出 `text` 正文塊。渲染時把 `thinking_delta` 和 `text_delta` 分流即可，思考增量不拼進正文。

Claude 原生 `/v1/messages` 流式最小可用示例（純 httpx，逐行解析 SSE）：

```python theme={null}
import json
import httpx

def generate_long_text(prompt, api_key, model="claude-opus-5", max_tokens=64000):
    url = "https://api.apiyi.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "accept": "text/event-stream",
    }
    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "stream": True,                        # ← 關鍵：長輸出必須流式
        "thinking": {"type": "adaptive"},      # 自適應思考，模型自行決定思考深度
        "messages": [{"role": "user", "content": prompt}],
    }
    # 三段式超時：read 只覆蓋事件間隔，不覆蓋整段生成
    timeout = httpx.Timeout(connect=30, write=120, read=120, pool=30)

    text, stop_reason = [], None
    with httpx.Client(timeout=timeout) as c:
        with c.stream("POST", url, json=payload, headers=headers) as r:
            if r.status_code != 200:
                raise RuntimeError(f"HTTP {r.status_code}: {r.read()[:400]}")
            event, data = None, []
            for line in r.iter_lines():
                if line == "":                 # 事件以空行分隔
                    if data:
                        d = json.loads("\n".join(data))
                        t = d.get("type") or event
                        if t == "content_block_delta" and d.get("delta", {}).get("type") == "text_delta":
                            text.append(d["delta"]["text"])
                        elif t == "message_delta":
                            stop_reason = d.get("delta", {}).get("stop_reason") or stop_reason
                    event, data = None, []
                    continue
                if line.startswith("event:"):
                    event = line[6:].strip()
                elif line.startswith("data:"):
                    data.append(line[5:].strip())
    # Claude 流以 message_stop 結束，沒有 [DONE]
    if stop_reason == "max_tokens":
        raise RuntimeError(f"被 max_tokens 截斷，已產出 {len(''.join(text))} 字，調大 max_tokens 後重試")
    return "".join(text).strip()
```

<Tip>
  如果你用官方 anthropic SDK，把 `base_url` 指到 `https://api.apiyi.com`，再用 `client.messages.stream(...).get_final_message()` 即可一步到位——SDK 自帶了 SSE 解析、超時處理、`stop_reason` 判定。上面的 httpx 版本是給不想引 SDK 的場景。
</Tip>

## read timeout 按事件間隔設，不是按總時長

很多人把 read timeout 設成一個能兜住整段生成的巨大值（比如 1800 秒），結果照樣超時——因為非流式下這個值要和整段生成競速，稍有波動就斷。正確做法是流式 + 按事件間隔設 read timeout。

實測參考（`claude-opus-5` 出約 2 萬字分集大綱，輸入約 1.5 萬字符）：

| 指標         | 實測值                         |
| ---------- | --------------------------- |
| 首位元組到達     | 3 \~ 130 秒                  |
| 思考階段最大靜默間隔 | 約 42 秒（且期間有 keepalive ping） |
| 端到端總耗時     | 9 \~ 12 分鐘                  |

所以 read timeout 設 **90 \~ 120 秒**足以覆蓋最大事件間隔並留餘量，不必設成十幾分鍾。三段式超時把三個階段拆開，各自設值：

```python theme={null}
# connect：建連；write：上行發請求體；read：兩次讀之間的上限
timeout = httpx.Timeout(connect=30, write=120, read=120, pool=30)
```

## max\_tokens 給足，並檢查 stop\_reason

長輸出容易撞到 `max_tokens` 上限被截斷。尤其是 Claude 這類**開了思考的模型，思考本身也佔 `max_tokens` 預算**，一份長文很容易把預算吃滿。

* **`max_tokens` 建議 64000 起步**（開高 effort / 深度思考時更要給足；`claude-opus-5` 輸出上限 128K）。
* **拿到響應先看 `stop_reason`**：
  * `end_turn`——正常結束，正文完整，這才算成功。
  * `max_tokens`——被截斷，正文可能不完整甚至為空。這是**被截斷**不是「空結果」，把 `max_tokens` 調大後重試即可。
  * `refusal`——被安全策略拒絕，單獨處理。

只用 `str(e)` 或「正文為空」來判斷成敗會誤導——空正文的真實原因往往是 `max_tokens` 截斷。

## 重試策略

長文場景的重試要剋制，別讓「失敗重試」變成「重複計費 + 重複長跑」：

* **只對「拿到響應頭之前的失敗」和 `5xx` / `429` 重試**（退避、最多 2 次）。這類是建連/瞬時問題，重試有意義。
* **已經收到部分正文再斷流的，不要盲目重試**。服務端已經產出並計費，重試是讓它再跑一遍、再付一次錢。
* 記錄響應頭裡的 request id，方便對賬和排查。

## 場景速查

| 場景            | 典型輸出量     | max\_tokens 建議    | read timeout 建議 |
| ------------- | --------- | ----------------- | --------------- |
| 漫劇 / 短劇分集大綱   | 1 \~ 3 萬字 | 64000             | 90 \~ 120 秒     |
| 文學創作（長篇小說/章節） | 1 \~ 5 萬字 | 64000 \~ 128000   | 90 \~ 120 秒     |
| 長篇翻譯          | 隨原文長度     | 按原文 token 估算 ×1.5 | 90 \~ 120 秒     |
| 大段程式碼生成       | 數千行       | 32000 \~ 64000    | 90 \~ 120 秒     |

全部走流式；節點用 `api.apiyi.com`（中國大陸推薦）或 `vip.apiyi.com`（海外推薦），**不要用 `api-cf.apiyi.com`**（CDN 節點約 100 秒就 `524`，扛不住長請求）。

## 相關連結

<CardGroup cols={2}>
  <Card title="如何避免介面超時" icon="clock" href="/zh-Hant/faq/timeout-configuration">
    分場景的 timeout 推薦值
  </Card>

  <Card title="流式 vs 非流式" icon="git-compare" href="/zh-Hant/faq/streaming-vs-non-streaming">
    兩種模式的差異與選型
  </Card>

  <Card title="Claude 思考與 effort" icon="brain" href="/zh-Hant/api-capabilities/claude-effort-thinking">
    自適應思考、effort 檔位、max\_tokens 與截斷
  </Card>

  <Card title="Claude 響應處理" icon="code" href="/zh-Hant/api-capabilities/claude-response-handling">
    原生響應結構、SSE 事件、stop\_reason
  </Card>
</CardGroup>
