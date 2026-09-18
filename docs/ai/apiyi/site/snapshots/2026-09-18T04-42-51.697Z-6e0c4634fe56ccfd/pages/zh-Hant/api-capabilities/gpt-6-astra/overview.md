> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-6 Astra 文本生成

> OpenAI GPT-6 Astra 旗艦模型：API易 Responses 與 Chat Completions 雙端點開通，輸入 $10、輸出 $50 每 1M tokens，Codex_Reverse 分組半價。含官轉與逆向三條線路 220 餘項實測、四檔推理資料與逐項差異歸屬。

GPT-6 Astra（`gpt-6-astra`）是 OpenAI 2026 年 9 月 3 日釋出的新一代旗艦，官方定位是電腦操作、軟體工程、科研與長程 Agent 任務，1,050,000 上下文、128,000 最大輸出、推理力度可調。API易 已開通 **Responses** 與 **Chat Completions** 雙端點，上線當天在官轉（OpenAI 直連、Azure）與 `Codex_Reverse` 三條線路各跑了一遍 74 項能力矩陣。

<Info>
  **API易 已接入 GPT-6 Astra**：模型名 `gpt-6-astra`。`default` / `svip` 官轉分組與官網逐項同價，由 OpenAI 直連與 Azure 兩條官方線路承載；`Codex_Reverse` 分組（Codex 逆向資源）按官網價 **0.5 折扣**計費。**函式呼叫與 Agent 工具鏈只在 Responses 端點上**，新專案請直接用 Responses。
</Info>

<Warning>
  **Chat Completions 端點不支援函式工具。** 帶 `tools` 的請求在官轉線路會被上游直接拒絕（400，提示改用 Responses），與是否傳 `reasoning_effort`、`tool_choice` 無關。這是模型側限制，不是平臺問題。存量 Chat 程式碼如果用到函式呼叫，遷移到 Astra 時必須同時遷到 Responses。
</Warning>

## 核心優勢

<CardGroup cols={2}>
  <Card title="為「把任務做完」而生" icon="monitor">
    Terminal-Bench 4.0 由 37.3% 提到 57.9%、ScreenSpot-Pro 由 76.9% 提到 92.7%、OSWorld 2.0 72.6%。提升最大的全是 Agent 類任務，官方稱複雜任務平均完成時間從約 75 分鐘壓到 40 分鐘。
  </Card>

  <Card title="1.05M 上下文實測可用" icon="file-text">
    30.8 萬字符（210,657 tokens）大海撈針 10.3 秒答對。官方稱同等任務 token 消耗比 GPT-5.6 Sol 低約 70%，單價高 2.5 倍，實際任務成本差距小於價差。
  </Card>

  <Card title="Responses 工具鏈完整" icon="bot">
    函式呼叫單次 / 並行 / 回傳 / 流式全通，web\_search 與 code\_interpreter 託管工具可用，加密推理塊可無狀態回放。JSON Schema 嚴格模式欄位集完全匹配。
  </Card>

  <Card title="三線路實測、差異逐項歸屬" icon="git-fork">
    同一矩陣在 OpenAI 直連、Azure、Codex\_Reverse 各跑一遍，模型能力三線一致；差異全在鏈路層，本頁按「上游限制 / 分組特有 / 線路特有」逐項標註。
  </Card>
</CardGroup>

## 模型資訊

| 引數               | 值                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| **模型名稱**         | `gpt-6-astra`                                                                                  |
| **釋出日期**         | 2026 年 9 月 3 日（OpenAI）；2026 年 9 月 5 日上架 API易                                                   |
| **輸入模態**         | 文本、影像（暫不支援音訊、影片）                                                                               |
| **輸出模態**         | 文本                                                                                             |
| **上下文視窗 / 最大輸出** | 1,050,000 / 128,000 tokens                                                                     |
| **知識截止**         | 2026 年 4 月 30 日                                                                                |
| **推理力度**         | `low` / `medium` / `high` / `xhigh`，預設 `medium`；`max` 會按 `xhigh` 回顯                            |
| **可用分組**         | `default`、`svip`（官轉）、`Codex_Reverse`（逆向，0.5 折扣）                                                |
| **端點**           | `POST /v1/responses`（主端點，函式呼叫在此）、`POST /v1/chat/completions`（相容平遷，無函式工具）                       |
| **流式輸出**         | ✅ 兩端點均支援，Chat 末塊帶 usage                                                                        |
| **網路安全等級**       | Preparedness Framework「Critical」，公開版拒絕漏洞挖掘類任務；OpenAI 直連線路回顯 `access_programs.cyber = standard` |

## 實測能力矩陣

2026 年 9 月 5 日，三條線路各跑 74 項（官轉線路的長上下文用 7 萬 token 縮量版控成本）：

| 能力                                            | Responses                                                                   | Chat Completions                                  | 三線結論                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| 基礎對話（非流式 / 流式）                                | ✅ / ✅                                                                       | ✅ / ✅                                             | 一致；最小提示 input\_tokens = 7，無隱藏注入                             |
| 推理檔位 low / medium / high / xhigh              | ✅ 四檔全部答對                                                                    | ✅                                                 | 一致，reasoning\_tokens 單調遞增                                   |
| 推理檔位 `max`                                    | ⚠️ 三線都回顯 `xhigh`                                                            | ⚠️                                                | 官轉線路 max 的推理 token 高於 xhigh，可能已生效只是回顯歸一化                    |
| 系統提示                                          | ✅ `instructions` / `system` 均生效                                             | ✅ 官轉；⚠️ Codex\_Reverse 丟棄 `system`，`developer` 正常 | 分組特有                                                        |
| **函式呼叫**（單次 / 回傳 / 並行 / 流式）                   | ✅ / ✅ / ✅ 2 個 / ✅                                                           | ❌ 官轉線路 400                                        | **上游限制**：Chat 端點不支援函式工具                                     |
| 結構化輸出 `json_schema`（strict）                   | ✅                                                                           | ✅                                                 | 一致，欄位集完全匹配                                                  |
| `json_object`                                 | ✅                                                                           | ✅                                                 | 一致                                                          |
| 圖片輸入（base64）                                  | ✅                                                                           | ✅                                                 | 一致，三色塊數量、顏色全對                                               |
| 圖片輸入（URL）                                     | ✅ 可下載主機                                                                     | ✅ 官轉；⚠️ Codex\_Reverse 靜默丟棄                       | 連結須能被服務端下載，Wikimedia 這類反爬站點三線都失敗                            |
| 提示快取                                          | ✅ 8.7K 字首二發命中                                                               | ✅                                                 | 三線均命中，跨端點共享。API 回顯的 `cached_tokens` 偶有滯後，實際命中以控制台「快取計費詳情」為準 |
| 長上下文                                          | ✅ 210K tokens 10.3 s；70K tokens 6.3 s                                       | —                                                 | 一致                                                          |
| `web_search` / `web_search_preview`           | ✅ OpenAI 直連、Codex\_Reverse                                                  | —                                                 | **Azure 線路臨時停用**（平臺通知：Bing 計費排查中）                           |
| `code_interpreter`                            | ✅ 官轉；❌ Codex\_Reverse 400                                                   | —                                                 | 分組特有                                                        |
| `computer_use_preview`                        | ❌ 400「not supported with gpt-6-astra」                                       | —                                                 | 上游不支援                                                       |
| 加密推理塊（`include: reasoning.encrypted_content`） | ✅ 回放 200，答案連貫                                                               | —                                                 | 一致                                                          |
| `previous_response_id`                        | ✅ 官轉；⚠️ Codex\_Reverse 靜默失效                                                 | —                                                 | 分組特有；`GET /v1/responses/{id}` 三線均 503                       |
| 輸出上限                                          | ✅ 官轉 `max_output_tokens` / `max_completion_tokens` 生效；⚠️ Codex\_Reverse 不生效 | 同左                                                | 分組特有；舊引數 `max_tokens` 官轉 400                                |
| `temperature`                                 | ❌ 官轉 400；Codex\_Reverse 接受但不生效                                              | 同左                                                | 上游限制，推理模型常態                                                 |
| `text.verbosity` low / high                   | ✅ 約 550 vs 1350 字元                                                          | —                                                 | 一致                                                          |
| `service_tier` flex / priority                | ⚠️ 接受但回顯 default                                                            | —                                                 | 三線均按標準檔計                                                    |
| 8 併發                                          | ✅ 8/8                                                                       | —                                                 | 中位延遲 OpenAI 直連 2.4 s、Azure 2.7 s、Codex\_Reverse 3.6 s       |

## 推理檔位

同一道過河題，Responses 端點，三條線路的 reasoning\_tokens：

| `reasoning.effort` | OpenAI 直連 | Azure | Codex\_Reverse | 結果 |
| ------------------ | --------- | ----- | -------------- | -- |
| `low`              | 12        | 28    | 22             | ✅  |
| `medium`（預設）       | 33        | 43    | 62             | ✅  |
| `high`             | 146       | 169   | 99             | ✅  |
| `xhigh`            | 246       | 320   | 199            | ✅  |
| `max`（回顯 `xhigh`）  | 278       | 516   | 207            | ✅  |

<Warning>
  **不要傳 `none` 或 `minimal`**。`minimal` 三線都不被接受（官轉 400，Codex\_Reverse 改成 `low`）；`none` 三線三樣：OpenAI 直連 400、Azure 接受、Codex\_Reverse 改成 `medium` 並讓 input\_tokens 從 14 漲到 4394（上游注入約 4.2K token 隱藏指令）。對外可用的就是 `low` / `medium` / `high` / `xhigh` 四檔。
</Warning>

<Tip>
  推理 tokens 按輸出價 \$50 / 1M 計費。確定性強的步驟用 `low` / `medium`，規劃與除錯環節再上 `xhigh`。消耗看 `usage.output_tokens_details.reasoning_tokens`（Responses）或 `usage.completion_tokens_details.reasoning_tokens`（Chat，官轉線路有此欄位）。
</Tip>

## 定價

### 官轉分組（`default` / `svip`）

按單次請求的輸入 tokens 分兩檔，超過 272K 後**整單**按第二檔計，與官網一致：

| 輸入 tokens        | 輸入      | 輸出（含推理） | 快取讀取   | 快取建立（5 分鐘） |
| ---------------- | ------- | ------- | ------ | ---------- |
| 0 - 272K         | \$10.00 | \$50.00 | \$1.00 | \$12.50    |
| 272,001 - 1,050K | \$20.00 | \$75.00 | \$2.00 | \$25.00    |

### Codex\_Reverse 分組

按官網價 0.5 折扣計費：第一檔輸入 \$5.00 / 輸出 \$25.00 / 快取讀取 \$0.50 / 快取建立 \$6.25。

<Info>
  API易 的模型價格與原廠逐項對齊，折扣通過分組與充值加贈體現，詳見 [充值優惠](/zh-Hant/faq/recharge-promotions)。分組差異見 [Codex、ClaudeCode 和 Default 分組有什麼區別](/zh-Hant/faq/codex-claudecode-default-groups)。即時價格以 [模型價格頁](/zh-Hant/models/index) 為準。
</Info>

## 分組怎麼選

| 分組                 | 價格     | 適合                                                      | 注意                          |
| ------------------ | ------ | ------------------------------------------------------- | --------------------------- |
| `default` / `svip` | 官網同價   | 生產環境、穩定性要求高、需要輸出上限保護與 `previous_response_id`            | 由 OpenAI 直連與 Azure 兩條官方線路承載 |
| `Codex_Reverse`    | 0.5 折扣 | Codex CLI 程式設計、Cherry Studio 等客戶端聊天、OpenClaw 等 Agent 場景 | 有 5 項分組特有差異，見下方             |

## 呼叫示例

### Responses 端點（推薦）

<CodeGroup>
  ```python Python（基礎 + 推理檔位） theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.responses.create(
      model="gpt-6-astra",
      reasoning={"effort": "high"},   # low / medium / high / xhigh
      instructions="你是一名資深後端工程師，回答簡潔。",
      input="把這個倉庫從 Python 3.9 遷移到 3.13，列出需要修改的檔案與原因",
      max_output_tokens=4000,
  )
  print(response.output_text)
  print(response.usage.output_tokens_details.reasoning_tokens)
  ```

  ```python Python（函式呼叫 + 網頁搜尋） theme={null}
  from openai import OpenAI
  import json

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")
  tools = [
      {"type": "web_search"},
      {"type": "function", "name": "get_weather", "description": "查詢城市當前天氣",
       "parameters": {"type": "object", "properties": {"city": {"type": "string"}},
                      "required": ["city"], "additionalProperties": False}, "strict": True},
  ]
  r = client.responses.create(model="gpt-6-astra", tools=tools, reasoning={"effort": "low"},
                              input="分別查一下北京和上海現在的天氣。")
  for item in r.output:
      if item.type == "function_call":
          print(item.name, json.loads(item.arguments))
  ```

  ```python Python（無狀態多輪：加密推理塊回放） theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")
  history = [{"role": "user", "content": "把 17 和 23 相乘，只回答數字。"}]

  r1 = client.responses.create(
      model="gpt-6-astra", input=history, store=False,
      reasoning={"effort": "medium"}, include=["reasoning.encrypted_content"],
  )
  # 把上一輪的完整 output（含加密推理塊）原樣帶回，三條線路均可用，不依賴服務端儲存
  history += [item.model_dump(exclude_none=True) for item in r1.output]
  history.append({"role": "user", "content": "再把結果加 1，只回答數字。"})

  r2 = client.responses.create(
      model="gpt-6-astra", input=history, store=False,
      reasoning={"effort": "medium"}, include=["reasoning.encrypted_content"],
  )
  print(r2.output_text)   # 392
  ```

  ```bash cURL（圖片輸入，base64） theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-6-astra",
      "reasoning": {"effort": "low"},
      "input": [{"role": "user", "content": [
        {"type": "input_text", "text": "圖裡有幾個彩色方塊？"},
        {"type": "input_image", "image_url": "data:image/png;base64,iVBORw0KGgo..."}
      ]}]
    }'
  ```
</CodeGroup>

### Chat Completions 端點（存量程式碼平遷，無函式工具）

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gpt-6-astra",
      reasoning_effort="high",
      max_completion_tokens=4000,      # 不要用舊引數 max_tokens（400）
      messages=[
          # 官轉線路 system 正常；Codex_Reverse 分組會丟棄 system，用 developer 兩邊都通
          {"role": "developer", "content": "你是一名資深後端工程師，回答簡潔。"},
          {"role": "user", "content": "解釋一下 Python 3.13 的自由執行緒模式"},
      ],
  )
  print(response.choices[0].message.content)
  ```

  ```javascript Node.js（流式） theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({ apiKey: 'YOUR_API_KEY', baseURL: 'https://api.apiyi.com/v1' });

  const stream = await client.chat.completions.create({
    model: 'gpt-6-astra',
    reasoning_effort: 'low',
    messages: [{ role: 'user', content: '用三句話介紹長城' }],
    stream: true,
    stream_options: { include_usage: true },
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## 差異歸屬

三條線路跑同一矩陣後，差異可以清楚地分成三類。

### 上游限制（三線一致）

<AccordionGroup>
  <Accordion title="Chat Completions 不支援函式工具">
    官轉兩線帶 `tools` 的 Chat 請求一律 400，上游原文要求改用 Responses；不帶 `reasoning_effort`、加 `tool_choice: required` 都一樣。`Codex_Reverse` 分組能過是因為鏈路內部轉成了 Responses，不要把它當能力依據。需要函式呼叫請直接用 Responses。
  </Accordion>

  <Accordion title="reasoning.effort: max 回顯為 xhigh">
    三條線路 3/3 次請求 `max` 都回顯 `xhigh`。官轉線路 max 的推理 token 明顯高於 xhigh（OpenAI 直連 278 至 379 對 246，Azure 342 至 516 對 320），可能是檔位已生效只是回顯被歸一化；Codex\_Reverse 上兩者無差別。對外只承諾四檔。
  </Accordion>

  <Accordion title="Chat 端點引數：max_tokens 與 temperature 會 400">
    官轉線路對舊引數 `max_tokens` 返回 400 並要求改用 `max_completion_tokens`；`temperature` 返回 400 unsupported（推理模型常態）。Codex\_Reverse 分組接受這兩個引數但不生效。存量程式碼遷移時把這兩處一併清掉。
  </Accordion>

  <Accordion title="computer_use_preview 工具不可用">
    三條線路都返回 400「Tool 'computer\_use\_preview' is not supported with gpt-6-astra」。官方釋出材料中的電腦操作能力目前不通過這個工具型別對 API 開放。
  </Accordion>
</AccordionGroup>

### Codex\_Reverse 分組特有（5 項）

<AccordionGroup>
  <Accordion title="1. Chat 端點的 system 訊息被整段丟棄">
    指令型與資訊型 system 各 0/3 命中，同樣內容改成 `developer` 角色 3/3 命中；官轉兩線 `system` 3/3 正常。**Chat 呼叫統一用 developer**，三條線路都通。
  </Accordion>

  <Accordion title="2. 三種輸出上限引數都不生效">
    `max_output_tokens: 20`、`max_tokens: 20`、`max_completion_tokens: 20` 下輸出均為 403 tokens，Responses 回顯 `max_output_tokens: null`。官轉兩線 20 → `incomplete` / `length` 正常截斷。依賴上限控費的場景請用官轉分組。
  </Accordion>

  <Accordion title="3. previous_response_id 靜默失效">
    `store: true` 仍回顯 `false`，第二輪返回 200 但不記得上一輪；官轉兩線正常回憶。多輪在該分組請客戶端自帶歷史，配合 `include: ["reasoning.encrypted_content"]` 無狀態回放（三線均已驗證）。`GET /v1/responses/{id}` 三線都是 503。
  </Accordion>

  <Accordion title="4. Chat 端點的圖片 URL 靜默丟棄">
    Chat 傳 http(s) 圖片連結時 prompt\_tokens 只有 15，模型回答「沒有看到圖片」；官轉兩線同一連結正常識圖。base64 三線兩端點都正常。**該分組 Chat 傳圖請用 base64。**
  </Accordion>

  <Accordion title="5. effort none 注入約 4.2K token 隱藏指令">
    `none` 被改成 `medium`，input\_tokens 從 14 漲到 4394（4224 落在 `usage.attribution.request_fields.instructions`，按快取價計）；`minimal` 被改成 `low`。另外該分組不支援 `code_interpreter` 託管工具（400）。
  </Accordion>
</AccordionGroup>

### Azure 線路特有（1 項）

<AccordionGroup>
  <Accordion title="web_search 臨時停用">
    Azure 線路上帶 `web_search` / `web_search_preview` 的請求返回 400，閘道提示「web\_search 已臨時停用（Azure Bing 計費排查中），其他工具呼叫不受影響」。OpenAI 直連線路與 Codex\_Reverse 分組正常。恢復後本頁會更新。
  </Accordion>
</AccordionGroup>

## 遷移指南

<AccordionGroup>
  <Accordion title="從 gpt-5.6-sol 遷移">
    Responses 端點只改 `model` 欄位。Chat 端點若用到 `tools`，必須遷到 Responses；同時清掉 `max_tokens` 與 `temperature`。價格是 Sol 現行優惠價的 2.5 倍（\$4 / \$20 → \$10 / \$50），先在 Agent、自動化、複雜工程任務上做一輪對照，日常對話與分類抽取類負載留在 Terra / Luna。
  </Accordion>

  <Accordion title="從 Chat Completions 遷到 Responses">
    `messages` → `input`，`reasoning_effort` → `reasoning: {"effort": ...}`，`response_format` → `text: {"format": ...}`，`system` → `instructions`，`max_completion_tokens` → `max_output_tokens`。工具定義從 `{"type": "function", "function": {...}}` 扁平化為 `{"type": "function", "name": ..., "parameters": ...}`。完整對照見 [Responses 遷移指南](/zh-Hant/api-capabilities/openai/responses-migration)。
  </Accordion>

  <Accordion title="長上下文怎麼控成本">
    輸入超過 272K tokens 時整單按第二檔計（輸入翻倍、輸出 1.5 倍）。除非確實需要一次裝下整個倉庫，日常把上下文壓在 272K 以內；穩定字首放在訊息開頭以命中快取（快取讀取是標準輸入價的十分之一）。
  </Accordion>

  <Accordion title="網路安全類任務會被拒嗎">
    Astra 是首個被劃入 Preparedness Framework 網路安全「Critical」級的模型，公開版拒絕漏洞挖掘、漏洞利用程式碼編寫等進攻性任務。防禦性用途不受影響：三條線路上「Web 應用防 SQL 注入的工程做法」都正常給出引數化查詢、最小權限等完整答案。
  </Accordion>
</AccordionGroup>

## 相關文件

* [GPT-6 Astra 上線說明（基準資料與選型建議）](/news/gpt-6-astra-launch)
* [Codex\_Reverse 半價分組上線 gpt-6-astra](/live/2026-09/codex-reverse-gpt-6-astra)
* [OpenAI 推理模型使用指南](/zh-Hant/api-capabilities/openai/reasoning-models)
* [OpenAI 提示快取](/zh-Hant/api-capabilities/openai/prompt-caching)
* [OpenAI 函式呼叫](/zh-Hant/api-capabilities/openai/function-calling)
