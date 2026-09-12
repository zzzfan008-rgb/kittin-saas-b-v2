> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Kimi K2.5 文本生成

> Moonshot AI 原生多模態旗艦模型，256K 上下文，支援 Thinking 深度思考模式。API易阿里雲官轉通道穩定可靠，分組價 0.88 倍，疊加充值加贈可享官網 8 折以內。

Kimi K2.5 是 Moonshot AI 於 2026 年 1 月 27 日釋出的原生多模態旗艦模型，主打視覺程式設計（Visual Coding）與自主 Agent Swarm 編排能力，提供 256K 超長上下文。API易通過**阿里雲官轉**通道接入，穩定可靠；分組價採用 0.88 倍率（官網 88 折），再疊加充值加贈（充值 \$100 送 \$10 起），**實際成本可低於官網 8 折**。

<Info>
  **API易已接入 Kimi K2.5**：阿里雲官轉通道，OpenAI 相容格式直接呼叫，模型名 `kimi-k2.5`。與 Kimi 官網不同的是——**Thinking（思考）模式需要顯式傳入 `enable_thinking: true` 引數才會啟用**，預設為 Instant 模式。
</Info>

## 核心優勢

<CardGroup cols={2}>
  <Card title="256K 超長上下文" icon="scroll">
    無需額外加價即可享受 256K 上下文，整個大型程式碼庫或長文件一次塞進去。
  </Card>

  <Card title="Thinking 深度思考" icon="brain">
    通過 `enable_thinking: true` 開啟推理鏈路，適合複雜規劃、根因分析與 Agent 任務。
  </Card>

  <Card title="原生多模態 + 視覺程式設計" icon="eye">
    原生理解影像與程式碼，擅長把 UI 截圖、設計稿、圖表轉化為可執行的程式碼。
  </Card>

  <Card title="穩定阿里雲官轉" icon="server">
    經阿里雲官方轉發通道接入，企業級 SLA，高併發下穩定不斷供。
  </Card>
</CardGroup>

## 模型資訊

| 引數              | 值                                        |
| --------------- | ---------------------------------------- |
| **模型名稱**        | `kimi-k2.5`                              |
| **上下文視窗**       | 256,000 tokens                           |
| **執行模式**        | Instant / Thinking / Agent / Agent Swarm |
| **Thinking 開關** | 請求體 `enable_thinking: true`（預設 `false`）  |
| **輸入格式**        | 文本 + 影像（原生多模態）                           |
| **輸出格式**        | 文本                                       |
| **流式輸出**        | ✅ 支援                                     |
| **函式呼叫 / 工具使用** | ✅ 支援                                     |
| **通道**          | 阿里雲官轉（穩定可靠）                              |

<Warning>
  Kimi 官網內建的 `$web_search` 工具目前與 Thinking 模式不相容，官方建議：如需使用 web\_search，先關閉 `enable_thinking`。這一限制與 Moonshot 官方一致。
</Warning>

## 定價

| 專案       | 官網價格               | API易分組價（0.88 倍率）    | 疊加充值加贈（約）            |
| -------- | ------------------ | ------------------- | -------------------- |
| 輸入       | \$0.60 / 1M tokens | \$0.528 / 1M tokens | 約 \$0.48 / 1M tokens |
| 輸出       | \$2.50 / 1M tokens | \$2.20 / 1M tokens  | 約 \$2.00 / 1M tokens |
| 快取命中（輸入） | \$0.10 / 1M tokens | \$0.088 / 1M tokens | —                    |

<Info>
  **價格說明**：API易採用 **0.88 倍率**（官網 88 折）作為分組基礎價；疊加首充/大額充值加贈後（如充值 \$100 送 \$10 起），實際使用成本可**低於官網 8 折**。更多加贈政策詳見 [充值優惠](/zh-Hant/faq/recharge-promotions)。
</Info>

## 如何開啟 Thinking 模式

在 API易 上使用 Kimi K2.5，與 Kimi 官網最大的區別是——**預設是 Instant 模式**，需要通過請求體的 `enable_thinking` 引數顯式啟用深度思考：

| 場景                     | `enable_thinking` | 說明                              |
| ---------------------- | ----------------- | ------------------------------- |
| 日常對話 / 快速響應            | `false`（預設）       | Instant 模式，響應最快                 |
| 複雜推理 / 程式碼規劃 / 根因分析    | `true`            | Thinking 模式，輸出推理鏈路              |
| Agent 任務 + web\_search | `false`           | 官方限制：web\_search 與 thinking 不相容 |

### cURL 示例（開啟 Thinking）

```bash theme={null}
curl --location 'https://api.apiyi.com/v1/chat/completions' \
  --header "Authorization: Bearer sk-xxxx" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "kimi-k2.5",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "1+1等於多少？"
      }
    ],
    "enable_thinking": true
  }'
```

## 呼叫方式

### 端點地址

```
https://api.apiyi.com/v1/chat/completions
```

### 基礎呼叫（Instant 模式）

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "kimi-k2.5",
      "messages": [
        {"role": "user", "content": "用一句話介紹你自己"}
      ]
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="kimi-k2.5",
      messages=[
          {"role": "user", "content": "用一句話介紹你自己"}
      ]
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.chat.completions.create({
    model: 'kimi-k2.5',
    messages: [
      { role: 'user', content: '用一句話介紹你自己' }
    ]
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

### 進階呼叫（Thinking 模式）

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="kimi-k2.5",
      messages=[
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "分析這段程式碼的時間複雜度並給出最佳化建議"}
      ],
      extra_body={
          "enable_thinking": True
      }
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.chat.completions.create({
    model: 'kimi-k2.5',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: '分析這段程式碼的時間複雜度並給出最佳化建議' }
    ],
    // @ts-ignore - 自定義欄位
    enable_thinking: true
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

### 流式輸出

```python theme={null}
response = client.chat.completions.create(
    model="kimi-k2.5",
    messages=[{"role": "user", "content": "寫一首關於春天的短詩"}],
    stream=True,
    extra_body={"enable_thinking": True}
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

## 請求引數

| 引數名               | 型別      | 必填 | 說明                          |
| ----------------- | ------- | -- | --------------------------- |
| `model`           | string  | 是  | 固定為 `kimi-k2.5`             |
| `messages`        | array   | 是  | 對話訊息陣列                      |
| `enable_thinking` | boolean | 否  | 是否開啟 Thinking 模式，預設 `false` |
| `stream`          | boolean | 否  | 是否流式輸出                      |
| `temperature`     | number  | 否  | 取樣溫度，0\~2 之間                |
| `max_tokens`      | integer | 否  | 最大輸出 tokens                 |
| `tools`           | array   | 否  | 函式呼叫 / 工具列表                 |

## 響應格式

```json theme={null}
{
  "id": "chatcmpl-xxxxxxxx",
  "object": "chat.completion",
  "created": 1706300000,
  "model": "kimi-k2.5",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "1+1 等於 2。"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 12,
    "total_tokens": 36
  }
}
```

## 最佳實踐

1. **按任務切換模式**：日常對話、短文本生成用預設 Instant 模式；複雜推理、程式碼審查、Agent 規劃任務加上 `enable_thinking: true`。
2. **善用 256K 上下文**：整個中型程式碼倉庫、產品文件、長會議紀要都可以一次塞進去，不額外加價。
3. **多模態視覺程式設計**：上傳 UI 截圖 / 設計稿，一次呼叫完成「讀圖 → 規劃 → 出程式碼」。
4. **成本進一步最佳化**：充值 \$100 起享受加贈，疊加 0.88 分組價，實際成本可低於官網 8 折。
5. **注意 web\_search 限制**：如需使用官方 `$web_search` 內建工具，請關閉 `enable_thinking`。

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼我的請求沒有進入 Thinking 模式？">
    預設不會開啟。請檢查請求體是否包含 `"enable_thinking": true`；使用 OpenAI Python SDK 時需放在 `extra_body` 中，Node.js SDK 可直接作為頂層欄位傳入。
  </Accordion>

  <Accordion title="API易的 Kimi K2.5 和 Kimi 官網是同一個模型嗎？">
    是同一個模型。API易通過阿里雲官轉通道接入 Moonshot 官方 Kimi K2.5，模型能力完全一致。區別僅在於：Thinking 模式預設關閉，需通過 `enable_thinking` 引數顯式啟用。
  </Accordion>

  <Accordion title="0.88 分組價如何生效？">
    在 API易控制台建立令牌時，將令牌分組設定為支援 Kimi K2.5 的分組即可按 0.88 倍率計費。搭配充值加贈後，整體成本可進一步下降。詳見 [充值優惠](/zh-Hant/faq/recharge-promotions)。
  </Accordion>

  <Accordion title="是否支援函式呼叫 / Tool Use？">
    支援。可通過標準 OpenAI 格式的 `tools` 欄位傳入函式定義。注意官方 `$web_search` 內建工具與 Thinking 模式互斥，請分別使用。
  </Accordion>

  <Accordion title="Thinking 模式會額外計費嗎？">
    Thinking 模式生成的推理內容按輸出 tokens 正常計費。複雜任務可能會顯著增加輸出 tokens 數量，建議按需啟用。
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="API 基礎手冊" icon="book" href="/zh-Hant/api-manual">
    檢視完整的 API 使用指南
  </Card>

  <Card title="充值優惠" icon="gift" href="/zh-Hant/faq/recharge-promotions">
    瞭解加贈活動，把價格做得更低
  </Card>

  <Card title="模型資訊" icon="list" href="/zh-Hant/api-capabilities/model-info">
    檢視所有可用模型及分組
  </Card>

  <Card title="使用場景" icon="layers" href="/zh-Hant/scenarios">
    檢視各種客戶端接入教程
  </Card>
</CardGroup>
