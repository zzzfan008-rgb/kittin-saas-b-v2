> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Prompt Caching 快取計費指南

> OpenAI 快取全自動、零標記、不收寫入費：命中部分按輸入價 1 折計費。怎麼寫出會命中的請求、怎麼看 cached_tokens。

用 gpt-5 系列跑 Agent、多輪對話、批次文件處理，Prompt Caching 能把命中部分的輸入賬單打到 **1 折** —— 而且**什麼程式碼都不用改**，快取是全自動的。

本頁基於 OpenAI 官方文件整理（`developers.openai.com/api/docs/guides/prompt-caching`，2026年6月資料），並按 API易 的接入方式給出可直接複製的示例。

## 一句話理解

只要請求的**開頭部分（字首）和最近一次請求完全相同且不短於 1024 tokens**，伺服器就自動跳過重複處理：命中部分按 **0.1×** 計費，延遲最多降 80%。

和 Claude 快取最大的兩個區別：

* **不用打標記**：沒有 `cache_control`，達到條件自動快取
* **沒有寫入費**：Claude 寫入要付 1.25× / 2×，OpenAI 寫入免費

## 為什麼要用 —— 看賬單倍率

以模型原始輸入 token 價為 **1×** 計：

| 型別       | 價格         | 說明         |
| -------- | ---------- | ---------- |
| 普通輸入     | **1×**     | 沒命中的部分，原價  |
| 快取寫入     | **0×（免費）** | 自動發生，不收錢   |
| **快取命中** | **0.1×**   | 命中部分便宜 90% |

**回本點：第 2 次請求就淨省。** 沒有寫入成本要攤，同一字首只要被複用一次，省下的就是純收益 —— 這比 Claude（先付 1.25× 寫入費、複用 2 次才回本）更無腦。

按 API易 在售價格換算（每 1M tokens）：

| 模型                  | 普通輸入   | 快取命中        |
| ------------------- | ------ | ----------- |
| `gpt-5.4`           | \$2.50 | **\$0.25**  |
| `gpt-5.4-mini`      | \$0.75 | **\$0.075** |
| `gpt-5.5`           | \$5.00 | **\$0.50**  |
| `gpt-5.1` / `gpt-5` | \$1.25 | **\$0.125** |

### 適合場景

* 同一份長系統提示詞 + 工具定義被反覆呼叫（Agent、客服機器人）
* 多輪對話（每加一輪，前面的歷史自動命中）
* 批次處理同一份文件（一份合同問 50 個問題）
* RAG 把穩定的文件塊放在 prompt 前部

### 不適合場景

* 每次請求從第一個字開始就不一樣
* 整個 prompt 不足 1024 tokens（到不了起緩閾值）

## 觸發命中的三個硬條件

缺一不可。

### 1. 字首不短於 1024 tokens

短於 1024 tokens 的請求**永遠不會被快取**（不報錯，靜默不生效）。超過 1024 之後，命中長度按 **128 token 增量**延伸：實際命中量是 1024、1152、1280……這樣的臺階值，所以 `cached_tokens` 通常略小於你的穩定字首總長，正常現象。

### 2. 字首逐位元組相同

快取按**字首匹配**：從請求第一個字元開始逐位元組比對，遇到第一處不同就停止。任何變化 —— 時間戳、使用者名稱、JSON 欄位順序 —— 都會讓後面的內容全部按原價計費。

**實踐含義：穩定的東西放前面，易變的東西放後面。**

```python theme={null}
# ❌ 錯：動態內容拼在 system 開頭，字首每次都變，永遠命中不了
messages = [
    {"role": "system", "content": f"當前時間 {datetime.now()}。你是一個助手。" + 長指令},
    {"role": "user", "content": 問題},
]

# ✅ 對：長指令和工具定義在前保持穩定，動態內容放 user 訊息裡
messages = [
    {"role": "system", "content": 長指令},          # 穩定，會命中
    {"role": "user", "content": f"當前時間 {datetime.now()}。{問題}"},  # 易變，放最後
]
```

### 3. 在保留期內再次請求

* 基礎保留：閒置 **5–10 分鐘**後逐出，最長不超過 1 小時
* **2026年5月29日起**，gpt-5.1 及之後模型（含 pro 變體）對非 ZDR 組織**預設啟用 24 小時擴充套件保留**（`prompt_cache_retention: "24h"`），價格不變 —— 也就是說當天內的複用基本都能命中

## 最小可執行示例

同一段長字首發兩次不同問題，第一次自動寫入，第二次命中：

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1"
)

# 必須足夠長：不少於 1024 tokens，大約 1500+ 中文字
LONG_SYSTEM = open("long_instructions_zh.txt").read()


def ask(question: str, label: str):
    r = client.chat.completions.create(
        model="gpt-5.4",
        messages=[
            {"role": "system", "content": LONG_SYSTEM},
            {"role": "user", "content": question},
        ],
    )
    cached = r.usage.prompt_tokens_details.cached_tokens
    print(f"[{label}] input={r.usage.prompt_tokens} cached={cached}")


ask("請概括要點", "第1次")    # 期望 cached=0
ask("請給3個關鍵詞", "第2次")  # 期望 cached≈字首長度
```

期望看到的輸出：

```text theme={null}
[第1次] input=2330 cached=0
[第2次] input=2335 cached=2304
```

第 2 次 `cached` 接近系統提示詞長度（按 128 取整），這部分只按 1 折計費。

<Info>
  `/v1/responses` 端點同樣自動生效，欄位為 `usage.input_tokens_details.cached_tokens`。官方內部測試顯示 Responses 端點的快取利用率比 Chat Completions 還要高 40%–80%，多輪 Agent 場景建議優先走 [原生呼叫](/zh-Hant/api-capabilities/openai/native)。
</Info>

## 怎麼判斷命中沒命中 —— 看 usage 欄位

| 端點                     | 命中欄位                                        |
| ---------------------- | ------------------------------------------- |
| `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens` |
| `/v1/responses`        | `usage.input_tokens_details.cached_tokens`  |

**`cached_tokens > 0` 就在省錢**：這部分按 0.1× 計，剩餘的 `prompt_tokens - cached_tokens` 按原價計。

## 提高命中率的進階手段

### prompt\_cache\_key 固定路由

快取命中要求請求落到同一臺快取機器上。預設按字首雜湊路由已經夠用，但當**多個使用者共享相似字首**或併發較高時，顯式傳 `prompt_cache_key` 可以明顯提高命中率：

```python theme={null}
r = client.chat.completions.create(
    model="gpt-5.4",
    messages=messages,
    prompt_cache_key="user-12345"  # 按使用者/會話固定路由
)
```

<Warning>
  同一個"字首 + prompt\_cache\_key"組合的請求超過約 **15 次/分鐘** 時會溢位分流到其他機器，命中率反而下降。高併發場景應按使用者或會話**拆分多個 key**，不要全域性共用一個。
</Warning>

### 穩定字首工程化

* 工具定義的順序、JSON 序列化方式保持固定（別讓序列化庫隨機排序欄位）
* 圖片輸入也參與字首比對，複用圖片時保持 URL / base64 和 `detail` 引數一致
* 要按場景啟用不同工具時，用 `allowed_tools` 限定子集，而不是改動 `tools` 列表本身 —— 前者不破壞快取字首

### 多輪對話天然命中

追加式的 messages 陣列天然滿足字首穩定：每一輪的歷史就是上一輪的完整字首，自動命中，無需任何處理。

## 最常見的踩坑

| 現象                           | 原因                                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| `cached_tokens` 恆為 0         | 總長不足 1024 tokens / 字首開頭有動態內容（時間戳、UUID、隨機 ID）                                                       |
| 時有時無                         | 高併發沒拆 `prompt_cache_key`，請求被分流 / 閒置超過保留期                                                           |
| 命中數比預期少一截                    | 128 token 增量截斷，屬正常 / 動態內容混進了字首中段                                                                   |
| 換模型後不命中                      | 快取按模型隔離，`gpt-5.4` 和 `gpt-5.4-mini` 互不共享                                                            |
| 調 Claude 模型沒有 cached\_tokens | OpenAI 相容格式調 Claude 拿不到 Claude 快取，走 [Claude 原生呼叫](/zh-Hant/api-capabilities/claude-prompt-caching) |

## 與 Claude 快取的差異速查

|       | OpenAI（gpt-5 系列）      | Claude                    |
| ----- | --------------------- | ------------------------- |
| 觸發方式  | **全自動**，零程式碼          | 手動打 `cache_control` 標記    |
| 寫入費   | **免費**                | 1.25×（5 分鐘）/ 2×（1 小時）     |
| 命中價   | 0.1×                  | 0.1×                      |
| 最小閾值  | 1024 tokens           | 按模型 1024–4096 tokens      |
| 保留時長  | 5 分鐘起，gpt-5.1+ 預設 24h | 5 分鐘 / 1 小時（滑動續期）         |
| 看哪個欄位 | `cached_tokens`       | `cache_read_input_tokens` |

Claude 側的完整玩法見 [Claude 快取計費指南](/zh-Hant/api-capabilities/claude-prompt-caching)。

## API易 關於快取的說明

<Info>
  **API易 的 OpenAI 通道支援快取命中。** 請求原樣轉發上游，響應裡的 `cached_tokens` 原樣回吐，後臺賬單將命中部分按官方 0.1× 倍率單列"快取讀取"計費項 —— 程式碼無需為中轉層做任何適配。
</Info>

如何自檢：

1. 構造一個不少於 1024 tokens 的穩定字首，連續發 2 次請求
2. 第 2 次響應應看到 `cached_tokens > 0`
3. 後臺呼叫日誌中對應請求的輸入費用明顯低於第 1 次

## 要點回顧

<CardGroup cols={2}>
  <Card title="1. 全自動" icon="wand-sparkles">
    不用打標記、沒有寫入費，達到條件自動快取，第 2 次複用就是純省錢。
  </Card>

  <Card title="2. 夠長度" icon="ruler">
    字首不少於 1024 tokens 才會起快取，命中按 128 token 臺階計。
  </Card>

  <Card title="3. 穩字首" icon="lock">
    穩定內容在前、易變內容在後；時間戳和隨機 ID 別放開頭。
  </Card>

  <Card title="4. 看 usage" icon="search">
    `cached_tokens > 0` 才說明真的命中了，這部分按 1 折計費。
  </Card>
</CardGroup>

## 相關連結

* 同組頁面：[原生呼叫](/zh-Hant/api-capabilities/openai/native) · [相容模式呼叫](/zh-Hant/api-capabilities/openai/compatible) · [FC函式呼叫](/zh-Hant/api-capabilities/openai/function-calling)
* Claude 側快取：[Claude 快取計費指南](/zh-Hant/api-capabilities/claude-prompt-caching)
* 獲取 / 管理令牌：`https://api.apiyi.com/token`
* OpenAI 官方文件：`developers.openai.com/api/docs/guides/prompt-caching`
