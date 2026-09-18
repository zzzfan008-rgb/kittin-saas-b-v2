> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 令牌管理 API

> 用程式建立、查詢、停用和刪除 API Key，支援批次發放並按額度、模型、有效期三重限制

## 介面概述

令牌管理介面讓你用程式完成 API Key 的全生命週期管理，不必逐個在控制台點選。

最常見的場景是**批次發放**：給團隊成員、給下游客戶、給不同專案各發一把 Key，
並分別限制**能花多少錢**、**能用哪些模型**、**用到什麼時候**。

<CardGroup cols={3}>
  <Card title="額度限制" icon="wallet">
    `remain_quota` 設定這把 Key 最多能消費多少
  </Card>

  <Card title="模型限制" icon="list-checks">
    `models` 設定白名單，呼叫名單外的模型直接被拒
  </Card>

  <Card title="有效期限制" icon="clock">
    `expired_time` 設定到期時間，到點自動失效
  </Card>
</CardGroup>

<Info>
  只需要建一兩把 Key 的話，直接用控制台更快，見 [如何建立 KEY](/zh-Hant/faq/token-management)。
  本介面面向需要自動化發放、定期輪換、或把 Key 管理接入自有系統的場景。
</Info>

## 如何獲取系統令牌

令牌管理介面用**系統令牌**認證，與 API Key 不是一回事。

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

<Warning>
  **系統令牌可以建立和刪除 API Key，請像保管賬號密碼一樣保管它。**

  系統令牌本身不能呼叫模型（拿去請求 `/v1/chat/completions` 會被拒絕），但它能創建出可以呼叫
  模型的 API Key。因此**洩漏系統令牌的後果比洩漏單把 API Key 嚴重得多** ——
  請存進金鑰管理工具而不是寫在程式碼裡，不要提交進程式碼倉庫，並定期輪換。
</Warning>

## 端點一覽

所有端點的認證方式相同：`Authorization` 請求頭填系統令牌裸值，**不加 `Bearer` 字首**。

| 方法       | 路徑                              | 用途                    |
| -------- | ------------------------------- | --------------------- |
| `GET`    | `/api/token/?p=0&page_size=100` | 列出本賬號所有令牌             |
| `GET`    | `/api/token/{id}`               | 查詢單個令牌                |
| `POST`   | `/api/token/`                   | **建立令牌**，響應直接返回明文 key |
| `PUT`    | `/api/token/`                   | 更新令牌（需傳完整物件）          |
| `PUT`    | `/api/token/?status_only=true`  | 只切換啟用/停用狀態            |
| `DELETE` | `/api/token/{id}`               | 刪除令牌                  |

基礎地址為 `https://api.apiyi.com`。

## 建立令牌

### 請求示例

```bash theme={null}
export APIYI_SYS_TOKEN='YOUR_SYSTEM_TOKEN'

curl --compressed -s -X POST 'https://api.apiyi.com/api/token/' \
  -H "Authorization: $APIYI_SYS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "team-alice",
    "remain_quota": 500000,
    "unlimited_quota": false,
    "group": "default",
    "models": "gpt-5.6,deepseek-chat",
    "expired_time": -1
  }'
```

### 請求欄位

| 欄位                | 型別      | 說明                         |
| ----------------- | ------- | -------------------------- |
| `name`            | String  | 令牌名稱，用於自己識別用途              |
| `remain_quota`    | Integer | 額度上限（額度數），500,000 = \$1.00 |
| `unlimited_quota` | Boolean | 是否不限額度；**預設為 `false`**     |
| `group`           | String  | 令牌繫結的分組識別符號，如 `default`    |
| `models`          | String  | **模型白名單**，逗號分隔；不傳表示不限      |
| `expired_time`    | Integer | 過期時間戳（Unix 秒），`-1` 表示永不過期  |

<Warning>
  **`unlimited_quota` 預設為 `false`，而 `remain_quota` 預設為 0** —— 兩者一起預設時會建出一把
  額度為 0、無法使用的令牌。要麼顯式給 `remain_quota` 賦值，要麼把 `unlimited_quota` 設為 `true`。
</Warning>

<Warning>
  **模型白名單請使用 `models` 欄位。**

  響應結構裡還存在 `model_limits`、`model_limits_enabled`、`allow_ips` 三個欄位，
  傳入它們不會報錯（介面仍返回 200），但**當前不會生效** —— 回讀時這些欄位仍為空。
  需要限制可用模型請使用 `models`，需要限制來源 IP 請在自己的服務側實現。
</Warning>

### 響應示例

```json theme={null}
{
  "success": true,
  "message": "",
  "data": {
    "id": 119431,
    "user_id": 80778,
    "key": "K1RPzapuXLfBU4kDC5D9C0E70b1841AeAa542186B2F54b75",
    "status": 1,
    "name": "team-alice",
    "group": "default",
    "models": "gpt-5.6,deepseek-chat",
    "remain_quota": 500000,
    "unlimited_quota": false,
    "used_quota": 0,
    "expired_time": -1,
    "created_time": 1785599000
  }
}
```

<Warning>
  **響應裡的 `key` 是明文，且不含 `sk-` 字首。** 實際使用時需要自己拼上字首，
  即上例中真正的 API Key 是 `sk-K1RPzapu…`。

  請在建立時就妥善儲存並分發，不要把包含 `key` 的響應體留在日誌檔案裡。
</Warning>

## 批次建立

**服務端沒有批次建立介面** —— 在請求體裡傳 `count` 之類的引數不會生效，仍然只建立一把。
批次發放的做法是在客戶端迴圈呼叫建立介面。

<Warning>
  **單個使用者最多 1000 個令牌。** 這是賬號級別的總量上限，包含已停用但未刪除的令牌。
  達到上限後建立介面會失敗，需要先刪除不再使用的令牌騰出名額。

  批次發放前先用 `GET /api/token/?p=0&page_size=100` 翻頁統計當前數量，
  把「新建 Key → 切流量 → 停用舊 Key → 確認無呼叫後刪除」中的最後一步真正執行到位，
  不要只停用不刪除，否則輪換幾輪就會撞到上限。
</Warning>

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import json
    import os

    import requests

    BASE = "https://api.apiyi.com"
    HEADERS = {"Authorization": os.environ["APIYI_SYS_TOKEN"],
               "Content-Type": "application/json"}
    QUOTA_PER_USD = 500_000


    def create_token(name, quota_usd=None, group="default", models=None, days=0):
        """建立一把令牌。quota_usd 為 None 表示不限額度，days 為 0 表示永不過期。"""
        import time
        body = {
            "name": name,
            "group": group,
            "unlimited_quota": quota_usd is None,
            "remain_quota": 0 if quota_usd is None else int(quota_usd * QUOTA_PER_USD),
            "expired_time": -1 if not days else int(time.time()) + days * 86400,
        }
        if models:
            body["models"] = models

        resp = requests.post(f"{BASE}/api/token/", headers=HEADERS, json=body, timeout=30)
        resp.raise_for_status()
        data = resp.json()["data"]
        return {"id": data["id"], "name": data["name"], "key": "sk-" + data["key"]}


    if __name__ == "__main__":
        names = ["team-alice", "team-bob", "team-carol"]
        created = [
            create_token(n, quota_usd=1, group="default", models="gpt-5.6", days=30)
            for n in names
        ]
        for row in created:
            print(f"{row['name']:16s} id={row['id']} {row['key']}")

        # 明文 key 只在建立時返回，注意妥善儲存與分發
        with open("keys.json", "w") as f:
            json.dump(created, f, ensure_ascii=False, indent=1)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    const BASE = "https://api.apiyi.com";
    const HEADERS = {
      Authorization: process.env.APIYI_SYS_TOKEN,
      "Content-Type": "application/json",
    };
    const QUOTA_PER_USD = 500_000;

    async function createToken(name, { quotaUsd = null, group = "default",
                                       models = null, days = 0 } = {}) {
      const body = {
        name,
        group,
        unlimited_quota: quotaUsd === null,
        remain_quota: quotaUsd === null ? 0 : Math.round(quotaUsd * QUOTA_PER_USD),
        expired_time: days ? Math.floor(Date.now() / 1000) + days * 86400 : -1,
      };
      if (models) body.models = models;

      const resp = await fetch(`${BASE}/api/token/`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const { data } = await resp.json();
      return { id: data.id, name: data.name, key: `sk-${data.key}` };
    }

    const names = ["team-alice", "team-bob", "team-carol"];
    for (const name of names) {
      const row = await createToken(name, { quotaUsd: 1, models: "gpt-5.6", days: 30 });
      console.log(row.name, row.id, row.key);
    }
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    export APIYI_SYS_TOKEN='YOUR_SYSTEM_TOKEN'

    for NAME in team-alice team-bob team-carol; do
      curl --compressed -s -X POST 'https://api.apiyi.com/api/token/' \
        -H "Authorization: $APIYI_SYS_TOKEN" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$NAME\",\"remain_quota\":500000,\"unlimited_quota\":false,\"group\":\"default\",\"expired_time\":-1}" \
        | jq -r '"\(.data.name)\tsk-\(.data.key)"'
    done
    ```
  </Tab>
</Tabs>

## 三重限制怎麼用

### 額度限制

`remain_quota` 是這把令牌能消費的額度上限，換算關係與[餘額查詢](/zh-Hant/api-capabilities/balance-query) 一致：

<Card title="換算規則" icon="calculator">
  500,000 額度 = \$1.00 美金 (USD)
</Card>

例如給下游客戶發一把最多消費 \$10 的 Key，就設 `remain_quota: 5000000` 且
`unlimited_quota: false`。用量可以從令牌的 `used_quota` 欄位讀取。

### 模型限制

`models` 是逗號分隔的白名單。設定後，用這把 Key 呼叫名單外的模型會被直接拒絕：

```json theme={null}
{
  "error": {
    "message": "該令牌無權使用模型：deepseek-chat"
  }
}
```

返回 HTTP 403，**不產生扣費**。不傳 `models` 表示不限制。

### 有效期限制

`expired_time` 是 Unix 秒時間戳，`-1` 表示永不過期。例如發一把 30 天后失效的 Key：

```python theme={null}
import time
expired_time = int(time.time()) + 30 * 86400
```

## 查詢令牌

```bash theme={null}
curl --compressed -s 'https://api.apiyi.com/api/token/?p=0&page_size=100' \
  -H "Authorization: $APIYI_SYS_TOKEN" | jq '.data[] | {id, name, status, remain_quota, used_quota, models}'
```

關鍵欄位：

| 欄位                            | 說明                  |
| ----------------------------- | ------------------- |
| `id`                          | 令牌 ID，更新與刪除時用       |
| `key`                         | Key 明文（不含 `sk-` 字首） |
| `status`                      | `1` = 啟用，`2` = 停用   |
| `remain_quota` / `used_quota` | 剩餘 / 已用額度           |
| `unlimited_quota`             | 是否不限額度              |
| `models`                      | 模型白名單，空表示不限         |
| `expired_time`                | 過期時間戳，`-1` 表示永不過期   |

## 更新令牌

<Warning>
  **更新介面需要傳完整物件，不是增量更新（patch）。**

  正確做法是：先 `GET` 拿到令牌的完整物件 → 修改需要變更的欄位 → 把**整個物件** `PUT` 回去。
  只傳要改的那幾個欄位會把其餘欄位清空。
</Warning>

```python theme={null}
import os
import requests

BASE = "https://api.apiyi.com"
HEADERS = {"Authorization": os.environ["APIYI_SYS_TOKEN"],
           "Content-Type": "application/json"}

# 1. 取回完整物件
token = requests.get(f"{BASE}/api/token/119431", headers=HEADERS, timeout=30).json()["data"]

# 2. 只改需要變的欄位，其餘原樣保留
token["remain_quota"] = 2_500_000     # 提到 $5
token["models"] = "gpt-5.6,gemini-3-pro"

# 3. 整個物件 PUT 回去
resp = requests.put(f"{BASE}/api/token/", headers=HEADERS, json=token, timeout=30)
print(resp.json()["success"])
```

## 停用與刪除

### 停用（保留記錄）

停用後該 Key 立即失效，再用它呼叫模型會返回 401，但令牌記錄和歷史用量仍然保留。

```python theme={null}
token = requests.get(f"{BASE}/api/token/119431", headers=HEADERS, timeout=30).json()["data"]
token["status"] = 2      # 1 = 啟用，2 = 停用

requests.put(f"{BASE}/api/token/", headers=HEADERS,
             params={"status_only": "true"}, json=token, timeout=30)
```

### 刪除（不可恢復）

```bash theme={null}
curl --compressed -s -X DELETE 'https://api.apiyi.com/api/token/119431' \
  -H "Authorization: $APIYI_SYS_TOKEN"
```

批次刪除同樣在客戶端迴圈即可：

```python theme={null}
for token_id in [119431, 119432, 119433]:
    requests.delete(f"{BASE}/api/token/{token_id}", headers=HEADERS, timeout=30)
```

<Info>
  刪除是不可恢復操作。如果只是想臨時停用，用上面的停用方式，歷史用量記錄會保留下來便於對賬。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="建立時返回的 key 怎麼直接不能用？">
    響應裡的 `key` 不含 `sk-` 字首，實際使用時需要自己拼上，即 `sk-` + `key` 的值。
  </Accordion>

  <Accordion title="為什麼我建出來的令牌一呼叫就提示額度不足？">
    最可能的原因是建立時既沒傳 `remain_quota`，也沒把 `unlimited_quota` 設為 `true` ——
    兩者的預設組合會建出一把額度為 0 的令牌。重新建立時顯式指定其中之一即可。
  </Accordion>

  <Accordion title="傳了 model_limits 或 allow_ips 為什麼沒有效果？">
    這兩個欄位（以及 `model_limits_enabled`）當前不生效，傳入不會報錯但也不會落庫。
    限制可用模型請使用 `models` 欄位；限制來源 IP 目前需要在你自己的服務側實現。
  </Accordion>

  <Accordion title="能一次建立多把令牌嗎？">
    服務端沒有批次建立介面，在請求體裡傳 `count` 之類的引數不會生效。
    批次發放請在客戶端迴圈呼叫建立介面，參考上面「批次建立」一節的示例。
  </Accordion>

  <Accordion title="一個賬號最多能有多少把令牌？">
    單個使用者最多 1000 個令牌，已停用但未刪除的也計入這個總量。達到上限後建立介面會失敗，
    需要先刪除不再使用的令牌。輪換 Key 時記得走到「刪除」這一步，只停用不刪除會佔著名額。
  </Accordion>

  <Accordion title="更新令牌後其他欄位被清空了？">
    更新介面需要傳完整物件。先 `GET` 拿到完整物件，改完再整個 `PUT` 回去，
    不要只傳要改的那幾個欄位。
  </Accordion>

  <Accordion title="停用和刪除有什麼區別？">
    停用（`status: 2`）後 Key 立即失效，但令牌記錄與歷史用量保留，可以隨時改回 `1` 恢復。
    刪除是不可恢復的，記錄一併移除。臨時停用建議用停用。
  </Accordion>

  <Accordion title="怎麼知道每把 Key 各自花了多少錢？">
    令牌物件的 `used_quota` 欄位就是這把 Key 的累計消費（÷ 500,000 = 美元）。
    需要按時間段拆分或看每次呼叫的明細，去控制台日誌頁按令牌名篩選，
    見[如何檢視我的呼叫記錄](/zh-Hant/faq/call-logs)。
  </Accordion>
</AccordionGroup>

## 注意事項

<Warning>
  **系統令牌不是 API Key，兩者不能互換**

  * **API Key**（`sk-` 開頭）用於 `/v1/*` 推理端點
  * **系統令牌**（一串不帶字首的字元）用於 `/api/*` 管理端點

  用錯會分別得到 401 與 `Invalid token` 錯誤。
</Warning>

<Warning>
  **妥善保管明文 Key**

  建立介面的響應體、以及令牌列表介面的返回，都包含 Key 明文。請注意：

  * 不要把包含 `key` 的原始響應寫進日誌檔案或提交進程式碼倉庫
  * 分發給團隊成員時使用安全渠道，不要通過聊天群直接傳送
  * 這段明文不帶 `sk-` 字首，**常見的金鑰掃描工具可能掃不出來**，不要依賴自動化檢查兜底
</Warning>

<Info>
  **操作建議**

  * 批次建立時建議在迴圈里加適度間隔，避免瞬時併發過高
  * 給每把 Key 起有意義的 `name`（如 `team-alice`、`prod-webhook`），便於後續在日誌裡按 `token_name` 歸因
  * 定期輪換：新建 Key → 切流量 → 停用舊 Key 觀察一段時間 → 確認無呼叫後再刪除
</Info>

<Card title="相關文件" icon="link">
  * [如何檢視我的呼叫記錄](/zh-Hant/faq/call-logs) —— 在控制台查每把 Key 的呼叫明細與扣費
  * [餘額查詢 API](/zh-Hant/api-capabilities/balance-query) —— 查賬號剩餘額度
  * [如何建立 KEY](/zh-Hant/faq/token-management) —— 控制台手動建立
  * [令牌與分組](/zh-Hant/faq/token-and-groups) —— 分組的作用與選擇
</Card>
