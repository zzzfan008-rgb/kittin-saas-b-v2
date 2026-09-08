> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Max 文本生成

> 阿里通義千問旗艦 Qwen3.8-Max：2.4T 引數稀疏 MoE、1M 上下文、131K 輸出，原生圖片與影片輸入。API易掛牌 $1.65/$4.95 每 1M tokens，比官網低 17.5%。含 586 次實測得出的能力矩陣與避坑指南。

Qwen3.8-Max（`qwen3.8-max`）是阿里通義千問 2026 年 8 月 3 日釋出的新一代旗艦，稀疏 MoE 架構、2.4 萬億總引數，支援 **1M 上下文**、131K 最大輸出，原生接受文本、圖片、影片三種輸入。API易在釋出當天上架，並完成了 **586 次實測呼叫**——本頁的能力矩陣、引數行為與計費提醒全部來自實測，不是轉述官方文件。

<Info>
  **API易已接入 Qwen3.8-Max**：模型名 `qwen3.8-max`。**預設開啟深度思考**（預設 `xhigh` 檔，思考 tokens 計入輸出計費），日常對話建議顯式設 `reasoning_effort="none"`，實測輸出可從約 158 tokens 降到 5 tokens。上一代見 [Qwen3.6 系列（歷史版本）](/zh-Hant/api-capabilities/qwen-3-6/overview)。
</Info>

## 核心優勢

<CardGroup cols={2}>
  <Card title="比官網便宜 17.5％" icon="tag">
    輸入 \$1.65、輸出 \$4.95 每 1M tokens，阿里雲官網為 \$2/\$6。可疊加[充值活動](/zh-Hant/faq/recharge-promotions)繼續下探。
  </Card>

  <Card title="1M 上下文實測可用" icon="scroll">
    8K / 32K / 128K 三檔正文，中部與尾部各埋一枚標識，兩個端點 **6/6 全部精確召回**。128K 單次約 80 秒。
  </Card>

  <Card title="一個模型三種模態" icon="eye">
    文本、圖片、影片輸入全部實測通過，無需在「長文模型」和「視覺模型」之間切換。
  </Card>

  <Card title="Agent 能力大幅提升" icon="wrench">
    FrontierSWE 由上代 40.7 升至 **73.5**，DeepSWE 21.6 → 56.6。工具呼叫鏈路完整，兩輪 round-trip 實測通過。
  </Card>
</CardGroup>

## 端點支援

| 端點                     | 狀態         | 說明                                                                           |
| ---------------------- | ---------- | ---------------------------------------------------------------------------- |
| `/v1/chat/completions` | ✅ 完整可用     | **推薦主用**。工具呼叫、結構化輸出、多模態、流式全部實測通過                                             |
| `/v1/messages`         | ⚠️ 程式碼整合可用 | 回傳歷史訊息前需剝掉 `thinking` 塊，否則第二輪 400。Claude Code 等現成客戶端暫不可用，見下方「Anthropic 端點用法」 |
| `/v1/responses`        | ❌ 暫不支援     | 30 次測試全部失敗，已反饋渠道方                                                            |

## 模型定價

每 1M tokens，折扣前掛牌價：

| 專案      | API易          | 阿里雲官網  | 差價      |
| ------- | ------------- | ------ | ------- |
| 輸入      | **\$1.65**    | \$2.00 | 低 17.5％ |
| 輸出（含思考） | **\$4.95**    | \$6.00 | 低 17.5％ |
| 快取讀     | **\$0.20625** | \$0.25 | 低 17.5％ |
| 快取寫     | **\$2.0625**  | —      | —       |

可疊加[充值活動](/zh-Hant/faq/recharge-promotions)，實際成本更低。

## 技術規格

| 專案     | 引數                                     |
| ------ | -------------------------------------- |
| 模型名    | `qwen3.8-max`                          |
| 架構     | 稀疏 MoE，2.4 萬億總引數                       |
| 上下文視窗  | 1M tokens（非思考模式輸入上限 991K，思考模式 983K）    |
| 最大輸出   | 131,072 tokens（越界報錯明確給出 `[1, 131072]`） |
| 最大思考預算 | 262K tokens                            |
| 思考模式   | 預設開啟，預設檔位 `xhigh`                      |
| 輸入模態   | 文本、圖片、影片                               |
| 輸出速率   | 約 19–22 tokens/s（實測）                   |
| 首字延遲   | 流式 TTFT 約 1.85 秒（實測 P50）               |

官方基準：GPQA Diamond 92.6、PaperBench 93.0、OmniDocBench 1.5 92.1、Terminal-Bench 2.1 86.6、OSWorld-Verified 86.1、IFBench 82.8、FrontierSWE 73.5、SWE-bench Pro 67.7。

## 思考控制（最重要的一節）

Qwen3.8-Max **預設就在思考**，檔位為 `xhigh`。思考 tokens 計入輸出計費，且佔比常達 90％ 以上。

### `reasoning_effort` 七個值，四個真實檔位

引數接受 7 個值，但實測只對應 **4 個真實檔位**：

| 傳入值                      | 實際檔位      | 實測思考量            |
| ------------------------ | --------- | ---------------- |
| `none`                   | 關閉思考      | 0 tokens         |
| `minimal` / `low`        | 低檔        | 約 100 tokens     |
| `medium`                 | 中檔        | 約 150 tokens     |
| `high` / `xhigh` / `max` | 預設檔（三者等價） | 約 150–175 tokens |

傳 `max` 不會比 `xhigh` 想得更多。傳其他值會返回 400 並列出合法值。

### 關閉思考的寫法

```python theme={null}
response = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "你好"}],
    reasoning_effort="none",
    max_tokens=500,
)
```

`extra_body` 裡的 `enable_thinking: false` 與 `chat_template_kwargs: {"enable_thinking": false}` 同樣生效，效果等價。

<Warning>
  **`max_tokens` 不約束思考 tokens。** 實測設 `max_tokens=1`，仍被計 **1054** 個輸出 token，其中 1045 個是思考。

  `max_tokens` 只截斷可見回答。**想控制成本請用 `reasoning_effort`，不要指望 `max_tokens`。**
</Warning>

### `thinking_budget` 不生效

傳 128 / 512 / 4096 任何數值，實測行為都等同於 `low` 檔，數值不起作用。**請改用 `reasoning_effort`。**

## 呼叫示例

### Python（OpenAI SDK 相容）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

# 日常對話：關思考，快且省
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "用一句話解釋什麼是負載均衡"}],
    reasoning_effort="none",
    max_tokens=500,
)
print(resp.choices[0].message.content)

# 複雜推理：保持預設思考檔位
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "證明：任意 5 個整數中必存在 3 個數之和被 3 整除"}],
    max_tokens=4000,
)
print(resp.choices[0].message.reasoning_content)  # 思考過程
print(resp.choices[0].message.content)            # 最終答案
```

### 圖片輸入

```python theme={null}
import base64

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": [
        {"type": "text", "text": "這張圖上寫的是什麼數字？"},
        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
    ]}],
    max_tokens=500,
)
```

遠端圖片 URL 在本端點同樣可用，直接把 `url` 填成 `https://...` 即可。

### 影片輸入

```python theme={null}
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": [
        {"type": "text", "text": "這段影片裡有什麼？"},
        {"type": "video_url", "video_url": {"url": f"data:video/mp4;base64,{b64_video}"}},
    ]}],
    max_tokens=1000,
)
```

<Tip>
  影片理解單次耗時實測 **144–285 秒**，請把客戶端超時設到 300 秒以上，並優先用流式或非同步任務佇列承接。
</Tip>

另有幀序列寫法 `{"type": "video", "video": [幀1, 幀2, ...]}`，要求 **4–8000 幀**，少於 4 幀會返回 400。

### cURL

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer sk-your-apiyi-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.8-max",
    "messages": [{"role": "user", "content": "你好"}],
    "reasoning_effort": "none"
  }'
```

## 工具呼叫

Chat Completions 端點的工具呼叫**完整可用**：單工具、並行多工具、兩輪 round-trip、20 個工具中選 1、流式增量拼接、`parallel_tool_calls: false` 全部實測通過。

<Warning>
  **強制工具呼叫需同時關閉思考。** `tool_choice` 設為 `"required"` 或指定具體函式時，必須同時設 `reasoning_effort="none"`，否則返回 400（`tool_choice does not support being set to required or object in thinking mode`）或靜默不呼叫。

  `tool_choice` 用 `"auto"` / `"none"` 不受此限制。同理，`n > 1` 也需要關閉思考。
</Warning>

```python theme={null}
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "查一下北京天氣"}],
    tools=tools,
    tool_choice={"type": "function", "function": {"name": "get_weather"}},
    reasoning_effort="none",   # 必須
)
```

## 結構化輸出

`response_format` 的 `json_schema` 實測**嚴格守約**：巢狀物件、列舉、陣列、`additionalProperties: false` 全部生效，無多餘欄位、無 Markdown 程式碼塊包裹。

<Tip>
  **結構化場景請顯式關思考。** 同一個 schema 實測對比：

  | 配置                                        | 輸出 tokens | 其中思考  | 耗時    |
  | ----------------------------------------- | --------- | ----- | ----- |
  | `json_schema` + 預設思考                      | 4,066     | 3,971 | 100 秒 |
  | `json_schema` + `reasoning_effort="none"` | 154       | 0     | 4.7 秒 |

  兩者守約程度完全一致，成本和延遲差一個數量級。
</Tip>

## 上下文快取

* **命中門檻約 1024 tokens**：818 tokens 的字首不命中，1070 tokens 起命中
* **真實多輪對話吃得到快取**：逐輪追加訊息的場景每輪都命中
* **長文收益顯著**：128K 上下文實測快取命中 98.6％，32K 命中 99.3％

<Warning>
  **不要拿介面回顯的快取欄位判斷有沒有命中。** 實測部分線路的 `cache_read_input_tokens` 恆為 0，部分線路的響應裡乾脆沒有快取欄位——但同一批請求在控制台賬單裡能看到實實在在的快取讀取。

  **以控制台的「快取計費詳情」為準**，那裡會分別列出快取建立（1.25x）與快取讀取（0.125x）的 token 數和金額。
</Warning>

<Tip>
  **快取計費口徑不是按端點固定的，會隨線路變。** 實測同一條線路、同一形態的請求，在不同日期分別被判為兩種口徑：

  | 口徑           | 結算方式                                |
  | ------------ | ----------------------------------- |
  | OpenAI 快取    | 包含在 prompt tokens 中，命中部分按 0.125x    |
  | Anthropic 快取 | 獨立於基礎 token 單獨結算，建立 1.25x、讀取 0.125x |

  控制台日誌裡點開單條請求，「快取計費詳情」會標明本次用的是哪一種，並列出完整算式。**要判斷某次呼叫到底怎麼計費的，只能看那裡。**
</Tip>

<Tip>
  Anthropic 端點上**不加 `cache_control` 也可能命中隱式快取**。是否手動標記 `cache_control` 請以控制台實際扣費為準做一次對比，不要預設加上就一定更省。
</Tip>

## Anthropic 端點用法

`/v1/messages` 可用於程式碼整合，但**回傳歷史訊息前需要剝掉 `thinking` 塊**，否則返回 400（`if content is list. item must be dict and key[type] should in dict`）。

```python theme={null}
def strip_thinking(blocks):
    return [b for b in blocks if b.get("type") != "thinking"]

messages.append({"role": "assistant", "content": strip_thinking(resp["content"])})
```

實測這樣處理後，3 輪跨輪記憶、工具呼叫兩輪 round-trip、工具結果進入後續記憶全部正常。

### 2026-08-08 追加複測：多輪工具呼叫本身沒問題

一輪 300 次呼叫的專項複測，結論是**多輪 `tool_use` / `tool_result` 鏈路本身是好的**，卡點只在 `thinking` 塊：

* **`tool_result` 沒有任何額外格式限制**：`content` 為字串或 block 陣列、`is_error` 真假、空結果、50KB 大結果、亂序回傳、只回傳部分、偽造 `tool_use_id`——15 種形態全部通過。控制字元、emoji、20 萬字符單行也都能過。
* **`thinking` 塊的 `signature` 取什麼值都救不了**：空串、`null`、整個 key 缺失、偽造值，四種全部返回同一個 400。**只能刪掉整個塊。**
* **剝掉 `thinking` 後壓力測試通過**：24K token 系統提示詞 + 8 個工具的自主 agent 迴圈，12 輪 × 2 組，上下文漲到 28.7K，**24/24 全部成功**。
* **SSE 事件完整**：`message_start` / `content_block_start` / `content_block_delta` / `content_block_stop` / `message_delta` / `message_stop` 齊全，另有 `ping`；`text_delta` / `thinking_delta` / `signature_delta` / `input_json_delta` 都正常。
* **沒有速率或併發限制**：同一請求順序重複 40 次全部成功，併發 1 / 4 / 8 / 16 / 32 各檔全部成功，未出現 429。

<Warning>
  **Claude Code 等現成客戶端暫不可用。** 這類客戶端預設原樣回顯歷史 content blocks，無法改變其行為，所以**第一輪能正常返回 `tool_use`，工具執行完回傳 `tool_result` 後第二輪就會 400**——這是該端點上最常見的故障表現。

  較新版本的 Claude Code 還會發送 `thinking: {"type": "adaptive"}`，部分線路只接受 `enabled` / `disabled` / `auto`，會在**第一輪**就返回 400。

  請改用 `/v1/chat/completions`。
</Warning>

### 想在 Claude Code 裡用怎麼辦

這類「特定客戶端裡跑不起來」的問題，**未必是我們這邊的適配問題，也可能是模型側本來就不支援**。建議先去阿里雲百鍊官方平臺用同樣的用法驗證一次（控制台：`bailian.console.aliyun.com`）：

* 如果官方平臺同樣不支援，那就是模型側的限制，我們這邊也繞不過去；
* 如果官方平臺可以、我們這邊不行，請把請求體發給我們，我們跟渠道方對齊。

如果你的目標就是**在 Claude Code 這類客戶端裡幹活**，直接用本站的 **Claude 系列**或 **OpenAI 系列**更省事——預設分組就是官轉，不需要任何額外適配。

### 其他差異與實測注意

* `response_format` 被靜默忽略（結構化輸出請改用工具強制）
* `tool_choice` 只接受 OpenAI 格式；**強制工具呼叫（`required` 或指定函式）在思考模式下兩個端點都不支援**
* 圖片只支援 base64，遠端 URL 返回 400
* `reasoning_effort` 不生效，關思考請用 `thinking: {"type": "disabled"}`
* `stop_sequences` **截斷本身生效**，但 `stop_reason` 會誤報成 `end_turn`、`stop_sequence` 欄位返回 `null`，不要依賴它判斷停止原因
* 流式 usage 因線路而異：部分線路 `message_start` 裡的 `input_tokens` 不可信，部分線路流式最終 `output_tokens` 恆為 0。**需要精確核算時請以非流式返回的 usage 或賬單為準**
* 輸入長度上限實測 983,616 tokens，超出返回 `Range of input length should be [1, 983616]`

<Tip>
  **超時請設寬一些。** 實測首個 SSE 位元組要 6–17 秒才到，期間連線完全靜默；請求體越大越慢，256KB 約 44 秒、1MB 約 160 秒。跑在 Docker、跳板機或公司閘道後面時，中間任何一層的空閒超時都會表現成「長時間無響應後異常退出」。建議客戶端超時設到 300 秒以上。
</Tip>

## 引數相容性

| 引數                                                 | 狀態 | 說明                                                         |
| -------------------------------------------------- | -- | ---------------------------------------------------------- |
| `temperature`                                      | ✅  | 有效範圍 `[0.0, 2.0)`，傳 2 即報 400                               |
| `top_p`                                            | ✅  | 有效範圍 `(0.0, 1.0]`                                          |
| `top_k` / `presence_penalty` / `frequency_penalty` | ✅  |                                                            |
| `stop` / `stop_sequences`                          | ⚠️ | 截斷生效，但 Anthropic 端點的 `stop_reason` 會誤報成 `end_turn`         |
| `logprobs` / `top_logprobs`                        | ✅  |                                                            |
| `stream` + `stream_options`                        | ⚠️ | 長流式完整終止無尾部扣留；但流式 usage 因線路而異，精確核算請用非流式或賬單                  |
| `partial: true`                                    | ✅  | 字首續寫，續寫時不思考                                                |
| `n > 1`                                            | ⚠️ | 需同時設 `reasoning_effort="none"`                             |
| `seed`                                             | ❌  | 同 seed 兩次輸出不同，不保證確定性                                       |
| `prefix: true`                                     | ❌  | 無效，請用 `partial: true`                                      |
| `thinking_budget`                                  | ❌  | 數值不生效                                                      |
| 內建聯網搜尋                                             | ❌  | `enable_search` 與 `tools: [{"type": "web_search"}]` 均被靜默丟棄 |

## 最佳實踐

<CardGroup cols={2}>
  <Card title="日常對話與高頻呼叫" icon="zap">
    顯式設 `reasoning_effort="none"`。實測耗時從約 5 秒降到 2 秒、輸出 tokens 降到 1/30。
  </Card>

  <Card title="長文件與程式碼庫分析" icon="scroll">
    128K 召回實測精確，長文快取命中率高。把大文件放在訊息前部，追問放在尾部。
  </Card>

  <Card title="資料抽取" icon="braces">
    用 `json_schema` 約束結構，同時關思考。守約程度不受影響。
  </Card>

  <Card title="Agent 與工具編排" icon="wrench">
    走 `/v1/chat/completions`。需要強制呼叫時記得關思考。
  </Card>
</CardGroup>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼我設了 max_tokens 還是被扣了很多 token？">
    `max_tokens` 只約束可見回答，不約束思考部分。實測 `max_tokens=1` 仍被計 1054 個輸出 token。控制成本請用 `reasoning_effort="none"`。
  </Accordion>

  <Accordion title="為什麼 tool_choice 指定了函式卻報 400？">
    思考模式下不支援 `tool_choice` 強制呼叫。請同時傳 `reasoning_effort="none"`。
  </Accordion>

  <Accordion title="為什麼 /v1/responses 調不通？">
    該端點對本模型暫未接入，30 次測試全部失敗（錯誤碼在 404 與 400 之間跳變）。已反饋渠道方，接通後會在[即時動態](/live)公告。請改用 `/v1/chat/completions`。
  </Accordion>

  <Accordion title="Claude Code 能用這個模型嗎？">
    暫時不能。`/v1/messages` 端點拒絕含 `thinking` 塊的歷史訊息，而 Claude Code 預設原樣回顯，所以第一輪能出 `tool_use`、回傳 `tool_result` 後第二輪就 400。自己寫程式碼呼叫時剝掉該塊即可正常使用。

    需要在 Claude Code 裡幹活的話，建議直接用本站的 Claude 系列或 OpenAI 系列，預設分組就是官轉，不需要額外適配。也可以先去阿里雲百鍊官方平臺（`bailian.console.aliyun.com`）驗證同樣的用法是否支援——如果官方平臺同樣不支援，那是模型側的限制。
  </Accordion>

  <Accordion title="為什麼第一輪好好的，回傳工具結果後就卡住/報錯？">
    這是 `/v1/messages` 端點上最典型的表現。原因是回傳的歷史 assistant 訊息裡帶了 `thinking` 塊，該端點不接受，返回 400。`signature` 改成空串、`null` 或刪掉這個欄位都沒用，**必須刪掉整個 `thinking` 塊**。

    實測剝掉之後，24K 上下文的 12 輪工具迴圈可以穩定跑完。多輪 `tool_use` / `tool_result` 鏈路本身沒有問題。
  </Accordion>

  <Accordion title="usage 裡為什麼有時沒有 reasoning_tokens / 快取欄位？">
    該模型背後有多條上游線路，各線路回顯的 usage 欄位不一致：有的不回 `reasoning_tokens` 與 `cached_tokens`，有的 `cache_read_input_tokens` 恆為 0，有的流式最終 `output_tokens` 恆為 0。已反饋渠道方統一口徑。

    **介面回顯不代表實際計費。** 需要精確核算時，請以控制台日誌裡單條請求的計費詳情為準，那裡會列出基礎費用與快取費用的完整計算過程。
  </Accordion>

  <Accordion title="影片呼叫為什麼很慢？">
    影片理解單次實測 144–285 秒，屬於模型本身的處理耗時。請把超時設到 300 秒以上，並考慮用非同步佇列承接。
  </Accordion>
</AccordionGroup>

## 相關文件

* [Qwen3.8-Max 線上除錯](/zh-Hant/api-capabilities/qwen-3-8/chat-completions) — Playground 直接發請求
* [Qwen3.6 系列（歷史版本）](/zh-Hant/api-capabilities/qwen-3-6/overview) — 上一代五款模型
* [Qwen3.8-Max 上線說明](/news/qwen-3-8-max-launch) — 基準資料與完整解讀
* [模型價格](/models) — 全站模型單價、快取價格與可用端點
* [充值優惠活動](/zh-Hant/faq/recharge-promotions) — 疊加折扣

<Info>
  本頁實測資料來自 2026-08-03 的 586 次呼叫（12:50–14:35 UTC+8），以及 2026-08-08 針對 Anthropic 端點多輪工具呼叫的 300 次專項複測（22:10–2026-08-09 00:40 UTC+8）。

  介面返回的 usage 欄位在不同上游線路間口徑不一致，**計費請以控制台日誌的計費詳情為準**。模型與閘道行為可能隨渠道調整而變化，以實際呼叫為準。
</Info>
