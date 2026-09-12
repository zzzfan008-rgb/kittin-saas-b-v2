> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo 文本生成

> 位元組 Seed 2.1 Turbo 高頻生產型文本模型：256K 上下文、深度思考可控、雙層快取。API易同時開通 Chat Completions 與 Responses 雙端點，輸入 $0.50、輸出 $2.50 每 1M tokens。

Seed 2.1 Turbo（`dola-seed-2-1-turbo-260628`）是字節跳動 Seed 團隊於 2026 年 6 月 23 日釋出的高頻生產型文本模型（BytePlus 產品名 Dola-Seed-2.1-turbo），主打低成本、低延遲的企業級高併發場景，家族標稱 256K 上下文。API易已完成**雙端點全量實測**（15/15 用例通過），Chat Completions 與 Responses 均可直接呼叫。

<Info>
  **API易已接入 Seed 2.1 Turbo**：模型名 `dola-seed-2-1-turbo-260628`，`default` / `svip` 分組可用。與多數模型不同的是——**該模型預設開啟深度思考**，對延遲和成本敏感的場景請顯式傳 `thinking: {"type": "disabled"}` 關閉（詳見下方「深度思考控制」）。
</Info>

## 核心優勢

<CardGroup cols={2}>
  <Card title="生產級價效比" icon="circle-dollar-sign">
    輸入 \$0.50、輸出 \$2.50 每 1M tokens，是同代 Seed 2.1 Pro 的一半價格，適合高頻呼叫。
  </Card>

  <Card title="雙端點原生支援" icon="git-fork">
    Chat Completions 與 Responses 均為原生適配：Responses 端事件流、reasoning item、多輪 previous\_response\_id 全部可用。
  </Card>

  <Card title="深度思考可控" icon="brain">
    thinking 開關 + reasoning\_effort 分檔（low/high 實測思考量差 4 倍），按任務精確控制思考成本。
  </Card>

  <Card title="雙層快取降本" icon="database-zap">
    隱式快取自動命中（第 2 次請求即生效）；Responses 端顯式快取鏈式呼叫可整輪命中、延遲約減半。
  </Card>
</CardGroup>

## 模型資訊

| 引數              | 值                                                |
| --------------- | ------------------------------------------------ |
| **模型名稱**        | `dola-seed-2-1-turbo-260628`                     |
| **釋出時間**        | 2026 年 6 月 23 日（位元組 Seed 團隊）                     |
| **上下文視窗**       | 256K（家族標稱）                                       |
| **可用分組**        | `default`、`svip`                                 |
| **端點**          | `POST /v1/chat/completions`、`POST /v1/responses` |
| **深度思考**        | 預設開啟；`thinking.type` 可關，`reasoning_effort` 可分檔   |
| **流式輸出**        | ✅ 兩端點均支援                                         |
| **函式呼叫 / 工具使用** | ✅ 兩端點均支援                                         |

## 實測能力矩陣

以下為 API易 2026 年 7 月 21 日的實測結果（官方能力宣告 vs 實際表現）：

| 能力                          | 官方宣告           | Chat Completions             | Responses                     |
| --------------------------- | -------------- | ---------------------------- | ----------------------------- |
| 基礎對話（非流式/流式）                | ✅              | ✅ / ✅                        | ✅ / ✅（事件流完整）                  |
| 結構化輸出（json\_schema, strict） | ✅              | ✅                            | ✅（`text.format`）              |
| 深度思考開關 `thinking.type`      | ✅              | ✅ 開關有效                       | 預設輸出 reasoning item           |
| 思考分檔 `reasoning_effort`     | ✅              | ✅ low/high 實測 226/960 tokens | ✅ low/high 實測 371/1317 tokens |
| Function Call（兩輪閉環）         | ✅              | ✅                            | ✅                             |
| 隱式快取                        | ✅              | ✅ 第 2 次命中                    | ✅ 第 2 次命中                     |
| 顯式快取                        | ✅（僅 Responses） | —                            | ✅ 需 `previous_response_id` 鏈式 |
| 多輪 `previous_response_id`   | —              | —                            | ✅                             |
| MCP                         | ✅（僅 Responses） | —                            | 官方支援，本站未實測                    |
| 聯網搜尋 / 知識庫 / 精調 / 批次推理      | ❌              | —                            | —                             |

## 定價

| 專案 | API易價格             |
| -- | ------------------ |
| 輸入 | \$0.50 / 1M tokens |
| 輸出 | \$2.50 / 1M tokens |

<Info>
  **價格說明**：思考（reasoning）內容按輸出 tokens 正常計費——這也是為什麼建議按需控制思考深度。疊加充值加贈後實際成本更低，詳見 [充值優惠](/zh-Hant/faq/recharge-promotions)。
</Info>

## 深度思考控制

**這是使用本模型最重要的一件事**：預設開啟深度思考，即使一句話的簡單問題也會先輸出數百 tokens 的思考內容。實測一句話自我介紹消耗 444 輸出 tokens（其中思考 409），非流式總耗時 7–19 秒。

<Warning>
  對延遲或成本敏感的場景（客服、高頻短問答、批次處理），請顯式傳 `"thinking": {"type": "disabled"}`。實測關閉後 reasoning tokens 歸零，響應顯著加快。
</Warning>

### 三種思考檔位實測

| 配置                               | reasoning tokens（實測）      | 適用場景          |
| -------------------------------- | ------------------------- | ------------- |
| `thinking: {"type": "disabled"}` | 0                         | 高頻短問答、成本敏感場景  |
| `reasoning_effort: "low"`        | Chat 226 / Responses 371  | 常規推理任務        |
| `reasoning_effort: "high"`       | Chat 960 / Responses 1317 | 複雜規劃、數學、程式碼分析 |

<Tip>
  **`max_output_tokens` 要給足**：思考內容計入輸出配額。Responses 端配額太小時會被思考吃滿，返回 `status: "incomplete"`（`reason: length`）且**正文為空**——看起來像沒輸出，其實是配額問題。建議 1500 起步，開 high 檔給 4000+。
</Tip>

## 快取降本

模型支援兩層快取，機制不同，注意區分：

### 隱式快取（自動，兩端點均有）

無需任何引數，相同長字首（如固定的 system prompt）第 2 次請求即自動命中。實測約 2,600 tokens 的 system prompt，第 2/3 次請求 `cached_tokens` 達 2,360。命中量可在響應 `usage.prompt_tokens_details.cached_tokens`（Chat）或 `usage.input_tokens_details.cached_tokens`（Responses）中檢視。

### 顯式快取（僅 Responses，需鏈式呼叫）

顯式快取的正確姿勢是 `caching: {"type": "enabled"}` **配合 `previous_response_id` 鏈式呼叫**：第 2 輪攜帶上一輪響應 id 時，上一輪全部上下文整體命中（實測 7,873 tokens 全量命中，耗時從 8 秒降到 4 秒）。

<Warning>
  **只開 enabled 不鏈式會兩頭落空**：實測開啟 `caching.enabled` 後，如果不走 `previous_response_id`、只是重複相同字首，`cached_tokens` 恆為 0——連隱式快取的字首命中也沒有了。要麼不傳 caching 引數吃隱式快取，要麼開 enabled 並嚴格鏈式呼叫。
</Warning>

## 呼叫示例

### Chat Completions

<CodeGroup>
  ```bash cURL（關閉思考，快速響應） theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "dola-seed-2-1-turbo-260628",
      "messages": [
        {"role": "user", "content": "用一句話介紹你自己"}
      ],
      "max_tokens": 500,
      "thinking": {"type": "disabled"}
    }'
  ```

  ```python Python（分檔思考） theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="dola-seed-2-1-turbo-260628",
      messages=[
          {"role": "user", "content": "分析這段程式碼的時間複雜度並給出最佳化建議"}
      ],
      max_tokens=3000,
      reasoning_effort="high",  # low / medium / high
  )

  msg = response.choices[0].message
  print(msg.content)
  # 思考內容在 msg.reasoning_content（OpenAI SDK 下用 model_extra 訪問）
  ```

  ```javascript Node.js（流式） theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const stream = await client.chat.completions.create({
    model: 'dola-seed-2-1-turbo-260628',
    messages: [{ role: 'user', content: '寫一首關於夏天的短詩' }],
    max_tokens: 1500,
    stream: true,
    stream_options: { include_usage: true }
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

### Responses（原生多輪 + 顯式快取）

<CodeGroup>
  ```bash cURL（基礎呼叫） theme={null}
  curl -X POST "https://api.apiyi.com/v1/responses" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "dola-seed-2-1-turbo-260628",
      "input": "用一句話介紹你自己",
      "max_output_tokens": 1500
    }'
  ```

  ```python Python（鏈式呼叫吃顯式快取） theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  # 第 1 輪：開啟顯式快取
  r1 = client.responses.create(
      model="dola-seed-2-1-turbo-260628",
      input=[
          {"role": "system", "content": "這裡放很長的固定背景資料……"},
          {"role": "user", "content": "第一個問題"},
      ],
      max_output_tokens=1500,
      extra_body={"caching": {"type": "enabled"}, "store": True},
  )
  print(r1.output_text)

  # 第 2 輪：攜帶上一輪 id，整輪上下文命中快取（實測延遲約減半）
  r2 = client.responses.create(
      model="dola-seed-2-1-turbo-260628",
      input="第二個問題",
      previous_response_id=r1.id,
      max_output_tokens=1500,
      extra_body={"caching": {"type": "enabled"}},
  )
  print(r2.output_text)
  print(r2.usage.input_tokens_details.cached_tokens)  # 快取命中量
  ```
</CodeGroup>

## 最佳實踐

1. **預設關思考，按需開啟**：把 `thinking: {"type": "disabled"}` 作為基線配置，只在複雜推理任務上換成 `reasoning_effort` 分檔，避免為簡單問題支付思考成本。
2. **`max_output_tokens` 給足餘量**：開思考時建議 3000+，high 檔 4000+，防止正文被思考擠掉。
3. **固定 system prompt 放最前**：隱式快取按字首匹配，把不變的內容放訊息最前面，第 2 次請求起自動省錢。
4. **多輪對話用 Responses 鏈式**：`previous_response_id` 免去重發歷史訊息，疊加顯式快取後長上下文多輪的成本與延遲都顯著下降。
5. **錯誤處理留意 503**：模型名拼寫錯誤或分組無權限時返回 503（無可用渠道），不是 OpenAI 慣例的 404，重試邏輯請勿按 404 判斷。

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼簡單問題響應也很慢、tokens 消耗很高？">
    因為模型**預設開啟深度思考**。一句話問題也會先生成數百 tokens 的思考內容（實測約 400），既慢又費錢。在請求體加 `"thinking": {"type": "disabled"}` 即可關閉，實測關閉後思考 tokens 歸零。
  </Accordion>

  <Accordion title="Responses 返回 incomplete、正文是空的，怎麼回事？">
    `max_output_tokens` 太小，配額被思考內容吃滿了（`incomplete_details.reason` 為 `length`）。把配額提到 1500 以上，或關閉/調低思考檔位。
  </Accordion>

  <Accordion title="Chat Completions 和 Responses 怎麼選？">
    單輪或自管歷史的場景用 Chat Completions（生態相容最廣）；多輪對話、需要顯式快取、或要用 MCP 工具的場景用 Responses——顯式快取和 MCP 僅 Responses 端支援。
  </Accordion>

  <Accordion title="開了顯式快取為什麼 cached_tokens 一直是 0？">
    顯式快取必須**鏈式呼叫**：第 2 輪起攜帶上一輪的 `previous_response_id` 才會命中。只開 `caching.enabled` 而每次獨立發請求不會命中——而且此時連隱式字首快取也不生效。若不想改造成鏈式，直接去掉 caching 引數用隱式快取即可。
  </Accordion>

  <Accordion title="支援 MCP 嗎？">
    官方能力圖宣告 Responses API 支援 MCP 工具。API易本輪實測未覆蓋 MCP 場景（需外部 MCP server），如有需求建議小流量驗證後再上生產。
  </Accordion>

  <Accordion title="請求報 503 是服務掛了嗎？">
    先檢查模型名拼寫。該模型對不存在的模型名返回 503「無可用渠道」而非 404，模型名正確但仍 503 時再考慮分組權限（本模型需 `default` 或 `svip` 分組）或聯絡客服。
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="Chat 線上除錯" icon="terminal" href="/zh-Hant/api-capabilities/dola-seed-2-1-turbo/chat-completions">
    在 Playground 中直接除錯 Chat Completions 端點
  </Card>

  <Card title="Responses 線上除錯" icon="messages-square" href="/zh-Hant/api-capabilities/dola-seed-2-1-turbo/responses">
    在 Playground 中直接除錯 Responses 端點
  </Card>

  <Card title="模型資訊" icon="list" href="/zh-Hant/api-capabilities/model-info">
    檢視所有可用模型及分組
  </Card>

  <Card title="API 基礎手冊" icon="book" href="/zh-Hant/api-manual">
    檢視完整的 API 使用指南
  </Card>
</CardGroup>
