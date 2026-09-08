> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Prompt Caching 快取計費指南

> Grok 快取全自動、無寫入費：命中部分按輸入價 0.25x 計費。128 token 塊粒度、怎麼寫出會命中的請求、怎麼看 cached_tokens、長對話為什麼該走 responses 鏈式。

用 Grok 跑 Agent、長系統提示詞、多輪對話時，Prompt Caching 能把**命中部分**的輸入賬單打到 **0.25×**（省 75%），而且**什麼程式碼都不用改**——快取是全自動的。

先把預期說在前面：xAI 官方明確快取條目可能因負載、重啟、路由變化被驅逐，**不保證 100% 命中**。把緩存摺扣當作「有則更好」的額外優惠，**做成本測算時按無快取價格打底**。

本頁基於 xAI 官方文件（`docs.x.ai/developers/advanced-api-usage/prompt-caching`）整理，並以 **2026-08-19 在 API易 閘道上對 `grok-4.6` 的實測**為準（124 次呼叫，逐條與後臺賬單核對）。

## 一句話理解

只要請求的**開頭部分（字首）與近期某次請求逐字相同**，上游就自動跳過重複處理：命中部分按 **0.25×** 計費，不需要任何引數、不需要打標記。

和另外兩家的差別：

* **對比 Claude**：不用打 `cache_control` 標記，達到條件自動生效
* **對比 OpenAI**：同樣全自動、同樣沒有寫入費，但 Grok 沒有 `prompt_cache_key` 這類由你控制路由的手段

## 為什麼要用 —— 看賬單倍率

以模型原始輸入 token 價為 **1×** 計：

| 型別       | 價格         | 說明         |
| -------- | ---------- | ---------- |
| 普通輸入     | **1×**     | 沒命中的部分，原價  |
| 快取寫入     | **0×（免費）** | 自動發生，不收錢   |
| **快取命中** | **0.25×**  | 命中部分便宜 75% |

**回本點：第 2 次請求就淨省。** 沒有寫入成本要攤，同一字首只要被複用一次，省下的就是純收益。

按 `grok-4.6` 的掛牌價換算（每 1M tokens，兩個上下文件位）：

| 檔位          | 普通輸入   | 快取命中       |
| ----------- | ------ | ---------- |
| 0 – 200K    | \$2.00 | **\$0.50** |
| 200K – 512K | \$4.00 | **\$1.00** |

其餘 Grok 型號的分檔與快取讀取價見 [Grok 概覽的階梯計費表](/zh-Hant/api-capabilities/grok/overview)。

### 適合場景

* 同一份長系統提示詞 + 工具定義被反覆呼叫（Agent、客服機器人）
* 批次處理同一份文件（一份合同問 50 個問題）
* RAG 把穩定的文件塊放在 prompt 前部
* 多輪對話（注意：Grok 上 chat 與 responses 兩種接法的效果差別很大，見下文）

### 不適合場景

* 每次請求從第一個字開始就不一樣
* 整個 prompt 在**千 token 量級以下**——實測這種請求反覆呼叫也形不成可複用的快取

## 兩個端點、流式與非流式都已核對

`/v1/chat/completions` 與 `/v1/responses`，各自的流式與非流式，**四種組合我們於 2026-08-19 逐條核對過後臺賬單**，命中部分均按快取價單列計費：

|                        | 非流式 | 流式  |
| ---------------------- | --- | --- |
| `/v1/chat/completions` | 已核對 | 已核對 |
| `/v1/responses`        | 已核對 | 已核對 |

<Info>
  **程式碼無需為中轉層做任何適配。** 快取相關行為原樣轉發上游，`cached_tokens` 原樣回吐，後臺賬單把命中部分單列為「快取讀取」計費項。
</Info>

## 觸發條件

| 條件   | 要求                                 |
| ---- | ---------------------------------- |
| 觸發方式 | **全自動**，無引數、無標記                    |
| 匹配起點 | 從 `messages` 陣列**開頭**逐字比對          |
| 只能追加 | 修改 / 刪除 / 重排歷史訊息會讓快取作廢；**尾部追加不影響** |
| 塊粒度  | **128 token**（見下）                  |
| 長度   | 官方未公佈最小門檻；實測千 token 量級以下形不成可複用快取   |
| 時間窗  | 官方明確隨時可能驅逐，**間隔越短越穩**              |

### 命中量按 128 token 取整

```text theme={null}
命中量 = ⌊匹配上的字首長度 ÷ 128⌋ × 128
```

兩輪實測都吻合：8802 token 的字首命中 8704（= 68 × 128），更早一輪 2735 token 的字首命中 2688（= 21 × 128）。**所以 `cached_tokens` 通常略小於你的穩定字首總長，是正常現象。**

### 只能追加：改歷史即失效

同一段字首貼著連發，只改動其中一次：

| 操作            | `cached_tokens` |
| ------------- | --------------- |
| 不改動           | 8704            |
| **把字首首字元改掉**  | 128（等於沒命中）      |
| **在字首末尾追加一行** | 8704（不受影響）      |
| 再發一次原字首       | 8704            |

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

## 最小可執行示例

同一段長字首發兩次不同問題，第一次自動寫入，第二次命中：

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1"
)

# 字首要足夠長：千 token 量級以下基本吃不到快取
LONG_SYSTEM = open("long_instructions_zh.txt").read()


def ask(question: str, label: str):
    r = client.chat.completions.create(
        model="grok-4.6",
        messages=[
            {"role": "system", "content": LONG_SYSTEM},
            {"role": "user", "content": question},
        ],
    )
    cached = r.usage.prompt_tokens_details.cached_tokens
    print(f"[{label}] input={r.usage.prompt_tokens} cached={cached}")


ask("請概括要點", "第1次")    # 冷啟動，cached 為 0 或極小值
ask("請給3個關鍵詞", "第2次")  # 期望 cached 接近字首長度
```

期望看到的輸出：

```text theme={null}
[第1次] input=8804 cached=128
[第2次] input=8804 cached=8704
```

第 2 次的 `cached` 接近系統提示詞長度（按 128 取整），這部分按 0.25× 計費。

<Info>
  `/v1/responses` 端點同樣自動生效，欄位換成 `usage.input_tokens_details.cached_tokens`，機制完全一致。**長對話在這個端點上還有額外優勢**，見下文「長對話優先走 responses 鏈式」。
</Info>

## 怎麼判斷命中 —— 看 usage 欄位

| 端點                     | 命中欄位                                        |
| ---------------------- | ------------------------------------------- |
| `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens` |
| `/v1/responses`        | `usage.input_tokens_details.cached_tokens`  |

### 判讀口徑：小值不算命中

不要只看「大於 0」。**拿 `cached_tokens` 和你的穩定字首長度做比**：

| `cached_tokens`         | 判讀           |
| ----------------------- | ------------ |
| `0`                     | 未命中          |
| 相對字首長度只佔零頭（幾十、一兩百這樣的小值） | **同樣按未命中看待** |
| 上千，且接近字首長度按 128 取整後的值   | 真命中          |

實測冷啟動的首次呼叫也可能回顯一個一兩百的小值，別被它騙到 —— 那不代表你的字首被快取了。

### 對賬：控制台的快取計費詳情

後臺單條呼叫日誌裡會**單列快取讀取的 token 數與對應的折扣倍率**，可以直接和響應裡的 `cached_tokens` 對上。需要精確核算某一次呼叫到底怎麼計費時，以那裡為準。

自檢三步：

1. 構造一個千 token 以上的穩定字首，連續發 2 次請求
2. 第 2 次響應應看到 `cached_tokens` 明顯上千
3. 後臺 [呼叫日誌](/zh-Hant/faq/call-logs) 裡對應請求出現「快取讀取」計費項，輸入費用明顯低於第 1 次

## 提高命中率

### 穩定字首工程化

* 長指令、few-shot 示例、工具定義放最前面；使用者輸入、時間戳放最後
* 工具定義的順序與 JSON 序列化方式保持固定（別讓序列化庫隨機排序欄位）
* 圖片輸入也參與字首比對，複用圖片時保持 base64 / URL 與引數一致
* 同一字首**集中連續複用**，不要拉開間隔

方法論與 OpenAI 一致，展開解釋見 [OpenAI 快取計費指南](/zh-Hant/api-capabilities/openai/prompt-caching)。

### 長對話優先走 responses 鏈式

這是 Grok 上一個容易被忽略的差別：

| 接法                                       | 實測表現                                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| `/v1/chat/completions` 追加式多輪             | 連追 5 輪、prompt 從 8.8K 漲到 10K，`cached_tokens` **始終停在最初那段靜態字首的量級** —— 每輪新增的問答沒有被複用起來 |
| `/v1/responses` + `previous_response_id` | 命中量**隨輪次增長**（實測第 2 輪 8704 → 第 3 輪 9344）                                           |

所以長對話、Agent 多步驟這類場景，優先用 Responses API 的鏈式接法：

```python theme={null}
r1 = client.responses.create(
    model="grok-4.6",
    input=[{"role": "system", "content": LONG_SYSTEM},
           {"role": "user", "content": "第一個問題"}],
    store=True,
)

r2 = client.responses.create(
    model="grok-4.6",
    previous_response_id=r1.id,          # 只傳新增的一句，歷史由上游接續
    input=[{"role": "user", "content": "追問"}],
    store=True,
)
print(r2.usage.input_tokens_details.cached_tokens)
```

端點差異詳見 [Grok 概覽的端點一覽](/zh-Hant/api-capabilities/grok/overview)。

### 關於 `x-grok-conv-id`

xAI 官方最佳實踐建議每次請求帶上 `x-grok-conv-id` 請求頭（UUID 或會話 ID）以提高命中率。我們在 API易 上做了對稱 A/B（帶與不帶各若干組獨立字首、各若干次複用），**兩組的命中表現沒有可觀測的差異**。帶上它無害，但不要把命中率的指望押在這個請求頭上。

## 命中率與預期管理

<Warning>
  **快取命中不保證。** xAI 官方文件寫明快取條目可能因記憶體壓力、服務重啟、請求被路由到另一臺伺服器而失效。

  實測在**穩定字首 + 連續複用**的場景下多數請求能命中，但確實存在抖動，且抖動來自上游側、無法由呼叫方控制。**做成本測算請一律按無快取價格打底，把命中當作額外優惠。**
</Warning>

還有一點值得提前說清楚：**快取的價值在成本，不在速度**。實測命中與未命中的首字延遲差距只有百毫秒量級 —— 別指望靠快取把長上下文請求變快。

## 最常見的踩坑

| 現象                          | 原因                                              |
| --------------------------- | ----------------------------------------------- |
| `cached_tokens` 恆為 0 或恆是極小值 | prompt 太短（千 token 量級以下）/ 字首開頭有時間戳、UUID、隨機 ID    |
| 時有時無                        | 上游驅逐，屬正常現象；縮短複用間隔、批次任務連續發                       |
| 命中數比字首短一截                   | 128 token 取整，正常                                 |
| 多輪對話 `cached_tokens` 不漲     | chat/completions 只複用最初那段靜態字首，長對話改走 responses 鏈式 |
| 改了歷史訊息就不命中了                 | 快取只能追加，改 / 刪 / 重排歷史即作廢                          |
| 換模型後不命中                     | 快取按**模型隔離**，`grok-4.6` 與 `grok-4.5` 互不共享        |

## 與其它通道的差異速查

|       | Grok                  | OpenAI          | Gemini                    | Claude                    |
| ----- | --------------------- | --------------- | ------------------------- | ------------------------- |
| 觸發方式  | **全自動**               | **全自動**         | 隱式自動                      | 手動打 `cache_control`       |
| 寫入費   | **免費**                | **免費**          | 免費                        | 1.25× / 2×                |
| 命中價   | 0.25×                 | 0.1×            | 官方口徑最高省 90%               | 0.1×                      |
| 最小閾值  | 官方未公佈，實測千 token 以下不起緩 | 1024 tokens     | 4096（3 系）/ 2048（2.5 系）    | 1024–4096                 |
| 塊粒度   | 128 token             | 128 token       | —                         | —                         |
| 命中穩定性 | ✅ 命中確定，但上游不保證         | ✅ 穩定            | ⚠️ 不保證，體感一般               | ✅ 穩定                      |
| 命中欄位  | `cached_tokens`       | `cached_tokens` | `cachedContentTokenCount` | `cache_read_input_tokens` |

全平臺快取支援總覽見 [快取計費 FAQ](/zh-Hant/faq/cache-billing)。

<Info>
  **本頁資料基於 `grok-4.6`（2026-08-19 實測）。** xAI 官方稱全部 Grok 語言模型都支援字首快取，其餘型號我們未逐一實打；塊粒度、短 prompt 行為等細節以你自己用例上的實測為準。

  若你發現同一字首下的賬單與上面的口徑明顯不符，請帶上響應頭裡的 request-id 聯絡客服。
</Info>

## 要點回顧

<CardGroup cols={2}>
  <Card title="1. 全自動" icon="wand-sparkles">
    不用打標記、沒有寫入費，達到條件自動快取，第 2 次複用就是純省錢。
  </Card>

  <Card title="2. 只能追加" icon="layers">
    從 messages 開頭逐字匹配，改歷史即作廢；命中量按 128 token 臺階取整。
  </Card>

  <Card title="3. 長對話走鏈式" icon="link">
    chat 多輪只複用最初的靜態字首；responses + previous\_response\_id 的命中量隨輪次增長。
  </Card>

  <Card title="4. 別押命中率" icon="scale">
    官方不保證命中，成本測算按無快取價打底，命中當作額外優惠。
  </Card>
</CardGroup>

## 相關連結

* 同組頁面：[Grok 概覽](/zh-Hant/api-capabilities/grok/overview) · [對話與推理](/zh-Hant/api-capabilities/grok/chat) · [聯網搜尋與 X 搜尋](/zh-Hant/api-capabilities/grok/web-search) · [程式碼執行與 MCP](/zh-Hant/api-capabilities/grok/code-execution-mcp)
* 其它通道快取：[OpenAI 快取計費](/zh-Hant/api-capabilities/openai/prompt-caching) · [Gemini 快取計費](/zh-Hant/api-capabilities/gemini/prompt-caching) · [Claude 快取計費](/zh-Hant/api-capabilities/claude-prompt-caching)
* 全平臺總覽：[快取計費 FAQ](/zh-Hant/faq/cache-billing)
* 獲取 / 管理令牌：`https://api.apiyi.com/token`
* xAI 官方文件：`docs.x.ai/developers/advanced-api-usage/prompt-caching`
