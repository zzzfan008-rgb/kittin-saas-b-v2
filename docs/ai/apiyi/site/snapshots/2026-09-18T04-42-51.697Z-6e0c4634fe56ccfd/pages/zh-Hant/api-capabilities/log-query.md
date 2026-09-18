> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 日誌查詢 API

> 用程式拉取呼叫日誌，獲取每次請求的模型、實際扣費、耗時與錯誤碼，實現自動對賬與故障自查

## 介面概述

日誌查詢介面返回你賬號下**每一次 API 呼叫**的明細記錄，包括呼叫的模型、實際扣費、耗時、
是否流式、以及失敗時的錯誤碼。

它和[餘額查詢 API](/zh-Hant/api-capabilities/balance-query) 是互補的：餘額查詢告訴你「現在還剩多少錢」，
日誌查詢告訴你「錢花在哪了」。

三類典型用途：

<CardGroup cols={3}>
  <Card title="自動對賬" icon="calculator">
    按時間段、按模型統計實際消費，與自己的業務賬單核對
  </Card>

  <Card title="故障自查" icon="bug">
    查失敗請求的錯誤碼，定位是引數問題還是上游問題
  </Card>

  <Card title="報障提工單" icon="life-buoy">
    拿到 `request_id` 給客服，能精確定位到那一次呼叫
  </Card>
</CardGroup>

<Info>
  控制台也能看日誌（「日誌」頁面）。本介面是同一份資料的程式化入口，適合需要自動化對賬、
  定時匯出、或接入自己監控系統的場景。手動檢視請直接用控制台，見 [如何檢視我的呼叫記錄](/zh-Hant/faq/call-logs)。
</Info>

<Warning>
  **推薦用法：每天同步一次，把日誌落到你自己的庫裡。**

  這個介面是為「定時增量匯出」設計的，不適合當成即時查詢介面反覆呼叫：

  * **每天跑一次**，只拉「上次同步之後」的新記錄，寫進你自己的資料庫或 CSV
  * **一次多取一些**：`pageSize` 最大 5000，別用預設的 10 —— 詳見下方引數說明裡的常見陷阱
  * **不要**用它做全量回溯（例如一次性拉三個月），也不要在頁面上做即時翻頁
  * **不要併發**呼叫，序列一頁一頁拉，頁與頁之間留 1 秒左右間隔
  * 時間窗跨度**建議不超過 1 天**；呼叫量大的賬號按小時切

  原因見下方「效能須知」一節：時間窗越老、翻頁越深，單次請求的開銷漲得很快，
  超過服務端上限會直接返回錯誤，**重試同樣的引數也不會變快**。
  本頁的 Python 示例已經按這個模式寫好，可以直接拿去當每日定時任務用。
</Warning>

## 如何獲取系統令牌

日誌介面用**系統令牌**認證，與 API Key 不是一回事（詳見文末注意事項）。

<Steps>
  <Step title="訪問控制台">
    訪問 `api.apiyi.com/account/profile` 個人中心頁面
  </Step>

  <Step title="找到系統令牌">
    在頁面最下方找到「賬號選項 - 系統令牌」部分
  </Step>

  <Step title="生成 AccessToken">
    輸入當前的賬戶密碼後，會得到一個 AccessToken，該金鑰可用於後續介面的查詢資料
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/PXVoab-l7wSQlQVE/images/apiyi-system-accesstoken.png?fit=max&auto=format&n=PXVoab-l7wSQlQVE&q=85&s=eb4f48476a795dfa5bfd7cb053081bdc" alt="獲取系統令牌" width="1020" height="460" data-path="images/apiyi-system-accesstoken.png" />

## 介面資訊

| 專案        | 說明                                                    |
| --------- | ----------------------------------------------------- |
| **介面URL** | `https://api.apiyi.com/api/log/self`                  |
| **請求方法**  | `GET`                                                 |
| **認證方式**  | Authorization Header（直接填 token 字串，**不加 `Bearer` 字首**） |
| **響應格式**  | JSON（gzip 壓縮）                                         |
| **資料範圍**  | 僅本賬號自己的日誌                                             |

## 請求說明

### 請求 Headers

| Header名稱        | 必填 | 說明                       |
| --------------- | -- | ------------------------ |
| `Authorization` | 是  | 系統令牌，格式：直接填寫 token 字串    |
| `Accept`        | 否  | 建議設定為 `application/json` |

### 查詢引數

| 引數                | 型別      | 必填     | 說明                                           |
| ----------------- | ------- | ------ | -------------------------------------------- |
| `p`               | Integer | 否      | 頁碼，**從 0 開始**（不是 1）。偏移量 = `p` × `pageSize`   |
| `pageSize`        | Integer | 否      | 每頁條數，預設 10，**最大 5000**。⚠️ **注意是駝峰**，見下方提示    |
| `type`            | Integer | 否      | 日誌型別，對賬請傳 `2`，取值見下表                          |
| `model_name`      | String  | 否      | 按模型名精確過濾，如 `gpt-5.6`                         |
| `token_name`      | String  | 否      | 按令牌名過濾                                       |
| `request_id`      | String  | 否      | 按請求 ID 精確查單條，命中時只返回那一條                       |
| `start_timestamp` | Integer | **必傳** | 起始時間，Unix 秒。見下方說明                            |
| `end_timestamp`   | Integer | **必傳** | 結束時間，Unix 秒。與 `start_timestamp` 的跨度建議不超過 1 天 |
| `group`           | String  | 否      | 按分組過濾                                        |

<Warning>
  **時間窗請當成必填引數。**

  介面本身**不強制**這兩個引數 —— 不傳也能調通。但不傳意味著讓服務端在你賬號的**全部歷史**裡
  從最新往回找，**歷史呼叫量大的賬號會直接撞上服務端上限、返回錯誤而不是慢一點**。

  這是本頁最容易踩、後果也最直接的一個坑。我們把它標成「必傳」不是因為服務端會拒絕，
  而是因為**不傳的失敗方式很難自己看出來**：它不報「引數缺失」，只報超時。
</Warning>

<Warning>
  **`pageSize` 是本介面唯一使用駝峰命名的引數，寫成 `page_size` 會被靜默忽略。**

  其餘引數（`model_name`、`token_name`、`start_timestamp`、`request_id` …）都是下劃線命名，
  只有這一個不是。寫錯不會報錯，服務端會**當作沒傳、回落到預設的每頁 10 條** ——
  很容易被誤認為「上限就是 10」或者「我這段時間只有 10 次呼叫」。

  ```
  ?pageSize=1000    ✅ 返回 1000 條
  ?page_size=1000   ❌ 靜默返回 10 條
  ```

  超過 5000 會明確報錯（`每頁條數不能超過 5000`），不會靜默截斷。
</Warning>

<Info>
  **把 `pageSize` 調大是這個介面最有效的一個最佳化。** 按每頁 10 條拉，
  一個每天 50 萬次呼叫的賬號需要請求 5 萬次；按每頁 5000 條只要 **100 次**。
  請求數少兩個數量級，翻頁深度也隨之降下來 —— 參見下方「效能須知」。

  實測每頁 5000 條的響應約 700 KB（gzip 後）、2.5 秒左右。
  如果你的網路或記憶體吃緊，`1000` 是個穩妥的折中值。
</Info>

### 效能須知

單次請求的開銷**不是固定的**，取決於三個因素。按這三條來用，這個介面很快；
反著用，會直接撞上服務端 60 秒的單條查詢上限並返回錯誤。

| 因素                        | 便宜          | 昂貴            |
| ------------------------- | ----------- | ------------- |
| **時間窗的位置**                | 最近幾天        | 幾十天以前         |
| **時間窗的跨度**                | 1 小時 \~ 1 天 | 一個月，或者乾脆不傳時間窗 |
| **偏移量（`p` × `pageSize`）** | 前幾萬條        | 幾十萬條以上        |

四條實用規則：

1. **一定要傳 `start_timestamp` 和 `end_timestamp`。** 不傳時間窗是最貴的用法。
2. **`pageSize` 調大。** 這是最省事的一條：每頁 10 條改成每頁 1000\~5000 條，
   請求數直接降兩個數量級，偏移量也跟著降。
3. **視窗切小、而不是把偏移量翻深。** 真正貴的不是「第幾頁」而是「跳過了多少條」——
   這個開銷是超線性增長的。與其在一個大窗口裡一路翻下去，
   不如切成 24 個一小時的小視窗，每個視窗的偏移量都從 0 開始。
4. **拉歷史資料一次拉完就落庫，之後只做增量。** 老資料的查詢成本比新資料高得多，
   反覆回查同一段歷史是純浪費。

<Info>
  如果某個視窗用 `pageSize=1000` 還翻了幾十頁才結束，說明這段時間你的呼叫量很大 ——
  **把視窗對半切開分別拉**，比繼續往深處翻頁快得多。下方 Python 示例裡的
  `MAX_PAGES` 就是幹這件事的。
</Info>

#### 60 秒是硬上限，超了返回的是錯誤

服務端對單次查詢有 **60 秒**的執行上限。超過這個時間，你拿到的**不是一個慢響應，
而是一個錯誤** —— 已經花掉的時間不會給你任何資料。

以下三種用法**很可能**觸發它，請直接避開，不要靠重試去碰運氣：

| 用法                     | 為什麼               |
| ---------------------- | ----------------- |
| **不傳時間窗**              | 服務端要在你的全部歷史裡回溯    |
| **時間窗落在一個月以前**，且賬號呼叫量大 | 越老的資料檢索成本越高       |
| **偏移量翻到幾十萬條以上**        | 跳過的記錄數越多越慢，且是超線性的 |

**重試同樣的引數不會變快**，只會再等 60 秒。正確的反應是**把時間窗縮小**、
或者把 `pageSize` 調大以減少翻頁 —— 換句話說，讓服務端每次要處理的資料量變小。

### 日誌型別 type

| 取值   | 含義      | 說明                                                       |
| ---- | ------- | -------------------------------------------------------- |
| `1`  | 充值      | 記錄充值前後餘額，`quota` 為 0                                     |
| `2`  | **消費**  | **對賬只需要這一類**，`quota` 是實際扣費                               |
| `3`  | 管理      | 賬號資訊變更等操作記錄，`quota` 為 0                                  |
| `4`  | 系統      | 系統贈送額度等，`quota` 為 0                                      |
| `11` | 非同步任務退款 | 影片等非同步任務失敗時全額退回預扣額，`quota` 為**負數**，`content` 裡帶 task\_id |

<Warning>
  **統計花費時務必帶上 `type=2`。** 不傳 `type` 會把充值、系統贈送記錄一起返回，
  這些記錄的 `quota` 雖然是 0，但 `model_name` 與 `token_name` 也是空的，
  直接遍歷求和或按模型分組會得到錯誤結果。

  用到影片類非同步模型（Seedance 等）的賬號，請**再拉一遍 `type=11`**：任務失敗時預扣額以負數退款行退回，只算 `type=2` 會把失敗單的預扣額當成消費。
</Warning>

## 響應說明

### 成功響應示例

```json theme={null}
{
  "success": true,
  "message": "",
  "data": [
    {
      "request_id": "2026080114481936471351696e93ae3FTV8WKfk",
      "created_at": 1785595715,
      "type": 2,
      "content": "模型固定價格 0.015，分組倍率 1",
      "username": "your-account",
      "token_name": "生產環境-主力",
      "token_group": "default",
      "model_name": "gpt-5.6",
      "quota": 7500,
      "prompt_tokens": 1000,
      "completion_tokens": 0,
      "duration_for_view": 16,
      "is_stream": false,
      "error_code": "",
      "other": "{\"billing_type\":\"by_count\",\"request_path\":\"/v1/images/generations\",\"group_ratio\":1,\"model_ratio\":1,\"usage\":{}}"
    }
  ]
}
```

### 關鍵響應欄位

| 欄位名                                   | 型別      | 說明                               |
| ------------------------------------- | ------- | -------------------------------- |
| `quota`                               | Integer | **本次實際扣費**（額度），÷ 500,000 = 美元    |
| `content`                             | String  | 人類可讀的計價說明，如「模型固定價格 0.015，分組倍率 1」 |
| `model_name`                          | String  | 實際計費的模型名                         |
| `token_name`                          | String  | 哪一把令牌發起的                         |
| `token_group`                         | String  | 令牌所屬分組（注意是分組標識，見常見問題）            |
| `prompt_tokens` / `completion_tokens` | Integer | 輸入 / 輸出 token 數                  |
| `duration_for_view`                   | Integer | 本次呼叫耗時（秒）                        |
| `is_stream`                           | Boolean | 是否為流式呼叫                          |
| `error_code`                          | String  | 失敗原因碼，成功時為空字串                    |
| `created_at`                          | Integer | 呼叫時間，Unix 秒                      |
| `request_id`                          | String  | **請求 ID，報障提工單時提供這個**             |
| `other`                               | String  | 計費與請求的補充資訊，**是 JSON 字串，需要二次解析**  |

<Info>
  `other` 欄位存的是一段 JSON **字串**而不是巢狀物件，取用前需要再解析一次
  （Python 用 `json.loads()`，JavaScript 用 `JSON.parse()`）。裡面包含
  `billing_type`（計費方式）、`request_path`（實際呼叫的端點）、`group_ratio`（分組倍率）、
  `model_ratio`（模型倍率）、`usage`（用量明細）等。

  影片類非同步任務的結算記錄裡另有 `final_quota`（該任務最終總額）、`original_quota`（提交時的預扣額）、
  `adjustment_quota`（本條記錄的差額）、`actual_tokens`（實際用量），見下方常見問題。
</Info>

### 額度換算

<Card title="換算規則" icon="calculator">
  500,000 額度 = \$1.00 美金 (USD)
</Card>

**計算公式：** 美金金額 = `quota` ÷ 500,000

**示例：**

* `quota: 7500` → \$0.015 USD
* `quota: 22500` → \$0.045 USD
* `quota: 18` → \$0.000036 USD

這與[餘額查詢 API](/zh-Hant/api-capabilities/balance-query) 是同一套換算口徑，可以直接對齊。

## 錯誤響應

### HTTP 401 - 認證失敗

```json theme={null}
{
  "success": false,
  "message": "You are not authorized to perform this operation. The access token is invalid."
}
```

**原因：** 系統令牌無效、已過期，或誤把 API Key（`sk-` 開頭）當成系統令牌使用。

**解決方法：** 回控制台重新生成系統令牌，確認 `Authorization` 裡填的是**不帶 `Bearer` 字首**的裸值。

## 程式碼示例

### cURL 示例（單頁，快速驗證）

```bash theme={null}
export APIYI_SYS_TOKEN='YOUR_SYSTEM_TOKEN'

# 只看最近 1 小時。start/end 一定要帶上，不帶時間窗的查詢很可能超時
END=$(date +%s)
START=$((END - 3600))

curl --compressed -s "https://api.apiyi.com/api/log/self?p=0&pageSize=1000&type=2&start_timestamp=$START&end_timestamp=$END" \
  -H "Authorization: $APIYI_SYS_TOKEN" \
  -H 'Accept: application/json' | jq '.data[] | {created_at, model_name, quota, request_id}'
```

<Warning>
  **必須新增 `--compressed` 選項**，因為 API 返回的是 gzip 壓縮內容，否則會得到亂碼。
</Warning>

<Info>
  這條命令用來驗證令牌配好了沒有。真正的對賬請用下面的每日同步指令碼。
</Info>

### Python 示例：每日增量同步（可直接當定時任務用）

下面這段是**推薦的標準用法**：每天跑一次，只拉上次同步之後的新記錄，寫進本地 SQLite。
重複執行是安全的（按 `request_id` 去重），中斷之後重跑會從斷點繼續。

```python theme={null}
"""APIYI 呼叫日誌每日增量同步。建議每天跑一次，例如 crontab: 30 2 * * *"""
import json
import os
import sqlite3
import time

import requests

BASE = "https://api.apiyi.com"
TOKEN = os.environ["APIYI_SYS_TOKEN"]
QUOTA_PER_USD = 500_000

DB_PATH = "apiyi_logs.db"
WINDOW = 3600      # 單個時間窗的跨度（秒）。1 小時對絕大多數賬號都夠用
PAGE_SIZE = 1000   # 每頁條數，服務端最大 5000。⚠️ 引數名是駝峰 pageSize
MAX_PAGES = 50     # 單窗最多翻多少頁；超過就把視窗對半切，避免偏移量太深
SLEEP = 1.0        # 每頁之間的間隔，序列呼叫不要併發
FIRST_RUN_DAYS = 7 # 首次執行往回補多少天

HEADERS = {"Authorization": TOKEN, "Accept": "application/json"}


def open_db():
    con = sqlite3.connect(DB_PATH)
    con.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            request_id  TEXT PRIMARY KEY,
            created_at  INTEGER,
            model_name  TEXT,
            token_name  TEXT,
            quota       INTEGER,
            error_code  TEXT,
            raw         TEXT
        )""")
    con.execute("CREATE INDEX IF NOT EXISTS idx_created ON logs(created_at)")
    con.commit()
    return con


def get_page(start, end, page):
    resp = requests.get(
        f"{BASE}/api/log/self",
        headers=HEADERS,
        params={
            "p": page,
            "pageSize": PAGE_SIZE,  # 駝峰！寫成 page_size 會被忽略、每頁只給 10 條
            "type": 2,              # 2 = 消費，對賬只看這一類
            "start_timestamp": start,
            "end_timestamp": end,
        },
        timeout=60,                 # 服務端單條查詢上限也是 60 秒
    )
    resp.raise_for_status()
    return resp.json().get("data") or []


def fetch_window(start, end):
    """拉取 [start, end] 這一段。翻頁過深時自動把視窗對半切。"""
    rows, seen, page = [], set(), 0
    while page < MAX_PAGES:
        data = get_page(start, end, page)
        if not data:
            return rows                      # 翻到空陣列即這一窗結束
        fresh = [r for r in data if r.get("request_id") not in seen]
        if not fresh:
            return rows                      # 整頁都是重複，防禦性退出
        seen.update(r["request_id"] for r in fresh)
        rows.extend(fresh)
        page += 1
        time.sleep(SLEEP)

    if end - start <= 1:
        return rows
    mid = (start + end) // 2                 # 這段時間呼叫量太大，切成兩半分別拉
    return fetch_window(start, mid) + fetch_window(mid + 1, end)


def sync():
    con = open_db()
    row = con.execute("SELECT MAX(created_at) FROM logs").fetchone()
    cursor = (row[0] + 1) if row and row[0] else int(time.time()) - FIRST_RUN_DAYS * 86400
    now = int(time.time())

    total = 0
    while cursor < now:
        end = min(cursor + WINDOW, now)
        rows = fetch_window(cursor, end)
        con.executemany(
            "INSERT OR IGNORE INTO logs VALUES (?,?,?,?,?,?,?)",
            [(r.get("request_id"), r.get("created_at"), r.get("model_name"),
              r.get("token_name"), r.get("quota"), r.get("error_code"),
              json.dumps(r, ensure_ascii=False)) for r in rows])
        con.commit()
        total += len(rows)
        cursor = end + 1
    print(f"本次同步 {total} 條，已落庫到 {DB_PATH}")
    return con


def report(con, days=1):
    since = int(time.time()) - days * 86400
    print(f"{'模型':32s} {'次數':>6s} {'花費(USD)':>12s}")
    rows = con.execute(
        "SELECT model_name, COUNT(*), SUM(quota) FROM logs "
        "WHERE created_at >= ? GROUP BY model_name ORDER BY SUM(quota) DESC",
        (since,)).fetchall()
    for model, cnt, quota in rows:
        print(f"{model or '(無)':32s} {cnt:6d} {(quota or 0) / QUOTA_PER_USD:12.4f}")
    total = sum((q or 0) for _, _, q in rows)
    print(f"\n合計 ${total / QUOTA_PER_USD:.4f} USD")


if __name__ == "__main__":
    report(sync(), days=1)
```

**輸出示例：**

```
本次同步 570 條，已落庫到 apiyi_logs.db
模型                                 次數      花費(USD)
gpt-5.6                              128       2.3850
gemini-3-pro-image                    30       1.3500
deepseek-chat                        412       0.0148

合計 $3.7348 USD
```

<Info>
  落庫之後，按模型、按天、按令牌的各種統計都在你自己的庫裡做，**不需要再回頭查介面**。
  這既快得多，也避免了「日誌保留期到了、想查的資料已經不在」的問題。
</Info>

### Node.js 示例（單個時間窗）

同樣的思路：按小時切視窗、序列翻頁、翻太深就把視窗切小。

```javascript theme={null}
const BASE = "https://api.apiyi.com";
const TOKEN = process.env.APIYI_SYS_TOKEN;
const QUOTA_PER_USD = 500_000;
const PAGE_SIZE = 1000;      // 服務端最大 5000
const MAX_PAGES = 50;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getPage(start, end, page) {
  const qs = new URLSearchParams({
    p: String(page),
    pageSize: String(PAGE_SIZE), // 駝峰！寫成 page_size 會被忽略、每頁只給 10 條
    type: "2",                  // 2 = 消費
    start_timestamp: String(start),
    end_timestamp: String(end),
  });
  const resp = await fetch(`${BASE}/api/log/self?${qs}`, {
    headers: { Authorization: TOKEN, Accept: "application/json" },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const { data } = await resp.json();
  return data || [];
}

// 拉取 [start, end]，翻頁過深時把視窗對半切
async function fetchWindow(start, end) {
  const rows = [];
  const seen = new Set();
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const data = await getPage(start, end, page);
    if (data.length === 0) return rows;
    const fresh = data.filter((r) => !seen.has(r.request_id));
    if (fresh.length === 0) return rows;
    fresh.forEach((r) => seen.add(r.request_id));
    rows.push(...fresh);
    await sleep(1000);          // 序列，不要併發
  }
  if (end - start <= 1) return rows;
  const mid = Math.floor((start + end) / 2);
  return [...(await fetchWindow(start, mid)), ...(await fetchWindow(mid + 1, end))];
}

const end = Math.floor(Date.now() / 1000);
const logs = await fetchWindow(end - 3600, end);   // 最近 1 小時
const total = logs.reduce((sum, r) => sum + (r.quota || 0), 0);
console.log(`${logs.length} 次呼叫，合計 $${(total / QUOTA_PER_USD).toFixed(4)} USD`);
```

<Info>
  `fetch` 會自動處理 gzip 解壓，Node.js 側無需額外配置（Python 的 requests 同理）。
  只有 curl 需要顯式加 `--compressed`。
</Info>

## 典型場景

### 場景一：每日對賬（推薦做法）

把上面的 Python 指令碼掛成每天一次的定時任務，日誌落到本地庫；
統計花費、按模型分組、按令牌拆分這些事，全部在**你自己的庫裡**用 SQL 做。

這樣做有三個好處：查詢是本地的所以很快；不受日誌保留期影響；
也不會因為反覆回查歷史資料而拖慢介面。

如果只想同步某個模型的記錄，在請求引數里加 `model_name` 即可。

### 場景二：找出失敗的呼叫

落庫之後直接查本地表：

```sql theme={null}
SELECT created_at, model_name, error_code, request_id
FROM logs
WHERE error_code != '' AND created_at >= strftime('%s', 'now', '-1 day')
ORDER BY created_at DESC;
```

<Info>
  被閘道拒絕的請求（引數錯誤等）`quota` 為 0，**不產生扣費**。日誌裡能看到 `error_code`，
  方便你區分「呼叫失敗了」和「呼叫成功但結果不滿意」。
</Info>

### 場景三：報障時提供 request\_id

在日誌裡定位到出問題的那次呼叫，把 `request_id` 提供給客服，可以精確查到該次請求的
完整鏈路。這比描述「大概幾點呼叫 xx 模型失敗了」高效得多。

## 常見問題

<AccordionGroup>
  <Accordion title="請求很慢，或者直接超時報錯，怎麼辦？">
    先檢查這三件事，絕大多數慢查詢都出在這裡：

    1. **有沒有傳 `start_timestamp` / `end_timestamp`？** 不傳時間窗是最貴的用法，
       服務端會在你的全部歷史裡回溯。
    2. **時間窗是不是太老或太寬？** 查一個月前的資料比查昨天貴得多；
       跨度也建議壓到 1 天以內，量大的賬號按小時切。
    3. **`p` 是不是已經翻到幾千頁？** 翻頁開銷是超線性增長的。
       正確的做法是**把時間窗切小、讓每個視窗只翻幾十頁**，而不是在一個大窗口裡往深處翻。

    **重試同樣的引數不會變快。** 遇到超時請按上面三條調整引數，
    而不是原樣重試 —— 原樣重試只會再等一次。
  </Accordion>

  <Accordion title="為什麼我只拿到 10 條記錄？">
    **十有八九是引數名寫成了下劃線的 `page_size`。**

    正確的寫法是駝峰 `pageSize`。這是本介面唯一一個駝峰引數，其餘（`model_name`、
    `token_name`、`start_timestamp` 等）都是下劃線，很容易順手寫錯。
    寫錯不會報錯，服務端會當作沒傳、回落到預設的每頁 10 條。

    ```
    ?pageSize=1000    ✅ 1000 條
    ?page_size=1000   ❌ 10 條
    ```

    最大 5000，超過會明確報錯。資料量大時仍然需要翻頁（`p=0`、`p=1` …），
    翻到返回空陣列為止 —— 上面的 Python 與 Node.js 示例已經封裝好這個邏輯。
  </Accordion>

  <Accordion title="能不能按 request_id 直接查某一次呼叫？">
    可以，傳 `request_id` 即可，命中時只返回那一條：

    ```bash theme={null}
    curl --compressed -s "https://api.apiyi.com/api/log/self?request_id=YOUR_REQUEST_ID" \
      -H "Authorization: $APIYI_SYS_TOKEN"
    ```

    排查某一次具體呼叫時，這比按時間段拉一堆記錄再篩要快得多。
  </Accordion>

  <Accordion title="響應裡有些欄位是空的，是不是出問題了？">
    不是。部分欄位屬於平臺內部資訊，普通賬號視角下為空或 0，屬正常現象，
    不影響對賬與排障需要的欄位（`quota`、`model_name`、`error_code`、`request_id` 等都是完整的）。
  </Accordion>

  <Accordion title="token_group 的值和控制台顯示的分組名不一樣？">
    介面返回的是分組的**識別符號**，控制台顯示的是分組的**展示名**，兩者可能不同。
    例如介面返回 `default`，控制台顯示「Default」。

    完整的對應關係可以從公開介面 `https://api.apiyi.com/api/pricing` 的 `usable_group`
    欄位獲取，它是一個「識別符號 → 展示名」的對映表。如果你要讓自己的報表和控制台顯示一致，
    需要自己做一次對映。
  </Accordion>

  <Accordion title="quota 和 usage 裡的 token 數對不上怎麼辦？">
    以 `quota` 為準。`quota` 是本次呼叫**實際扣除的額度**，是唯一可用於對賬的欄位。
    響應體裡的 token 數在部分按次計費的模型（如出圖、影片類）上可能是佔位值，
    不參與計價 —— 這類模型的計價方式在 `other.billing_type` 裡會標為 `by_count`。
  </Accordion>

  <Accordion title="日誌能查多久以前的？">
    **請按「只有最近 30 天可查」來設計你的同步邏輯。**

    實際可查詢的範圍通常比 30 天更長，但我們**不對保留期做承諾** ——
    它會隨日誌清理策略調整，而且不會單獨通知。把 30 天當成規劃下限，
    你的對賬流程就不會因為清理策略變化而斷掉。

    另外，**越老的時間窗查詢成本越高**，即使資料還在，查起來也慢得多。

    所以正確的用法是**每天同步一次、把資料落到你自己的庫裡**，歷史統計在本地做。
    需要長期留存的賬單資料，請務必自行歸檔，不要依賴這個介面回查。
  </Accordion>

  <Accordion title="curl 返回亂碼或 jq 報錯怎麼辦？">
    **原因：** API 返回的是 gzip 壓縮內容（`Content-Encoding: gzip`），curl 沒有自動解壓。

    **解決方案：** 新增 `--compressed` 選項：

    ```bash theme={null}
    curl --compressed 'https://api.apiyi.com/api/log/self?p=0' \
      -H "Authorization: $APIYI_SYS_TOKEN" | jq
    ```

    Python 的 requests 與 Node.js 的 fetch 會自動解壓，無需額外配置。
  </Accordion>

  <Accordion title="影片任務一條變兩條日誌，怎麼對到 task_id、怎麼知道一條影片花了多少？">
    Seedance 等非同步影片任務按「提交時預扣、完成後多退少補」計費，所以一條影片在日誌裡是兩條記錄：
    預扣行（`completion_tokens` 為 0、有 `request_id`）和結算行（`completion_tokens` 是實際用量、
    **`request_id` 為空**、`quota` 只記差額）。**兩條記錄裡都沒有 `task_id`**，本介面沒法按任務逐單配對。

    要查一條影片的真實消費，請用任務介面按 `task_id` 查，返回的 `quota` 就是兩條之和：

    ```bash theme={null}
    curl --compressed -s "https://api.apiyi.com/api/task/self?p=1&page_size=1&task_id=YOUR_TASK_ID" \
      -H "Authorization: $APIYI_SYS_TOKEN"
    ```

    注意它的分頁引數是下劃線 `page_size`、`p` 從 1 開始，與本介面相反。
    失敗的任務 `quota` 仍顯示預扣額，真實消費為 0（日誌裡有 `type=11` 的負數退款行）。
    完整說明見 [如何按 task\_id 查一條 Seedance 影片的真實消費](/zh-Hant/faq/seedance-task-cost-lookup)。
  </Accordion>

  <Accordion title="查詢日誌會消耗額度嗎？">
    不會。日誌查詢介面不消耗任何配額。
  </Accordion>
</AccordionGroup>

## 注意事項

<Warning>
  **系統令牌不是 API Key，兩者不能互換**

  * **API Key**（`sk-` 開頭）用於 `/v1/*` 推理端點，拿去調 `/api/log/self` 會返回 401
  * **系統令牌**（一串不帶字首的字元）用於 `/api/*` 管理端點，拿去調 `/v1/chat/completions` 會返回 `Invalid token`

  系統令牌的權限範圍覆蓋整個賬號，請**像保管賬號密碼一樣保管它**：存進金鑰管理工具而不是程式碼，
  不要提交進程式碼倉庫，定期輪換。
</Warning>

<Warning>
  **日誌響應裡含有你自己的 API Key 明文**

  日誌記錄會返回發起該次呼叫的令牌資訊。**不要把日誌的原始響應直接貼到公開場合、
  截圖發群、或轉交給第三方**，匯出前先剔除敏感欄位。

  特別提醒：這段明文不帶 `sk-` 字首，**常見的金鑰掃描工具可能掃不出來**，
  不要依賴自動化檢查兜底。
</Warning>

<Info>
  **建議的呼叫節奏**

  * **每天同步一次**即可，不需要更頻繁；同步的是「上次之後的增量」
  * **`pageSize` 用 1000\~5000**，不要用預設的 10 —— 這一條比其它幾條加起來都管用
  * **序列呼叫**，頁與頁之間間隔 1 秒左右，**不要併發**
  * 客戶端超時設成 60 秒（服務端單條查詢的上限也是 60 秒）
  * 每個時間窗的跨度不超過 1 天；呼叫量大的賬號按小時切
  * 遇到超時**先縮小時間窗再重試**，原樣重試不會變快

  這些不是硬性配額，而是能讓你自己拿到結果最快的用法。
  按這個節奏用，一個普通賬號同步一天的日誌通常在一分鐘內跑完；
  即使是每天幾十萬次呼叫的重度賬號，一天也只需要一百次左右的請求。

  <Warning>
    **我們保留未來對本介面引入呼叫頻率限制的權利。**

    目前沒有對它設定頻率限制，但請**不要按「永遠不限」來設計你的定時任務**。
    按上面這個節奏（每天一次、序列、`pageSize` 調大）用，即使將來加了限流也不會影響到你。
  </Warning>
</Info>

<Card title="相關文件" icon="link">
  * [餘額查詢 API](/zh-Hant/api-capabilities/balance-query) —— 查賬號剩餘額度
  * [令牌管理 API](/zh-Hant/api-capabilities/token-management) —— 程式化建立與管理 API Key
  * [如何檢視我的呼叫記錄](/zh-Hant/faq/call-logs) —— 控制台手動檢視
  * [日誌與賬單怎麼看](/zh-Hant/faq/log-billing-explained) —— 計費欄位解讀
</Card>
