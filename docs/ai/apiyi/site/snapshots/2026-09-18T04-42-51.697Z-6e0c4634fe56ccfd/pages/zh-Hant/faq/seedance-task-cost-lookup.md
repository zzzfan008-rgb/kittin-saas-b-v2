> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何按 task_id 查一條 Seedance 影片的真實消費？

> 一條影片在日誌裡有兩條扣費記錄、任務詳情裡又有一個 quota，三者是什麼關係；程式化對賬時怎樣憑 task_id 拿到這條影片的最終花費。

## 簡短回答

**用任務介面按 `task_id` 查，返回的 `quota` 就是這條影片的總消費。** 日誌裡的兩條記錄（預扣 + 結算）相加等於它，「非同步任務」頁詳情裡的 `quota` 也是它。

```bash theme={null}
curl --compressed -s "https://api.apiyi.com/api/task/self?p=1&page_size=1&task_id=<你的 task_id>" \
  -H "Authorization: $APIYI_SYS_TOKEN" | jq '.data.items[0] | {task_id, status, quota, submit_time, finish_time}'
```

`quota ÷ 500,000 = 美元`。認證用**系統令牌**（不是 `sk-` 開頭的 API Key），獲取方式見[日誌查詢 API](/zh-Hant/api-capabilities/log-query)。

不要試圖用日誌查詢 API 逐單配對：兩條日誌記錄裡都沒有 `task_id`，結算那條連 `request_id` 都是空的。

## 三個數字是什麼關係

Seedance 影片按「提交時預扣、完成後多退少補」計費，所以一條影片會在日誌裡留下兩條記錄，而任務介面 / 任務詳情頁只有一個 `quota`：

| 位置                  | 數值        | 含義                                                                                |
| ------------------- | --------- | --------------------------------------------------------------------------------- |
| 日誌第一條（預扣）           | 例 224,999 | 提交時按請求引數預估先扣。`completion_tokens` 為 0，`request_id` 有值                              |
| 日誌第二條（結算）           | 例 702,613 | 完成後按實際 tokens 算出總額，**只記差額**（補釦為正、退回為負）。`completion_tokens` = 實際用量，`request_id` 為空 |
| 任務介面 / 任務詳情 `quota` | 例 927,612 | **兩條之和 = 最終總消費** = 實際 tokens × 模型倍率 × 分組倍率                                        |

結算也可能是退回：一條 fast 480p 4 秒文生影片預扣 144,000，實際 40,594 tokens × 18.5 × 0.18 = 135,179，結算行記 −8,821（退回 \$0.02），任務介面 `quota` = 135,179。

上面第一組數字來自一條真實的 2.0 圖生影片（含參考影片）：368,100 tokens × 14（含影片輸入檔倍率）× 0.18（分組倍率）= 927,612，即 \$1.86。結算行 `other` 裡的 `final_quota` 就是 927,612，`original_quota` 是 224,999，`adjustment_quota` 是 702,613，三者在一條記錄裡都能看到。

## 按 status 判斷真實消費

| `status`                    | `quota` 的含義      | 這條影片的真實消費                                                   |
| --------------------------- | ---------------- | ----------------------------------------------------------- |
| `completed`                 | 最終結算總額           | = `quota`                                                   |
| `submitted` / `in_progress` | 只是提交時的預扣額        | 等完成後再取                                                      |
| `failed`                    | **仍顯示預扣額，不會被清零** | **0**。預扣已全額退回，日誌裡對應一條 `type=11` 的負數記錄，`content` 裡帶 task\_id |

注意兩套詞表不同：影片查詢介面 `/seedance/api/v3/.../tasks/{id}` 的成功狀態是 `succeeded`，任務介面 `/api/task/self` 的成功狀態是 `completed`，別把輪詢程式碼裡的判斷條件直接搬過來。

<Warning>
  對失敗任務直接拿 `quota` 求和會把預扣額算成消費。程式化對賬要按 `status` 過濾；用日誌 API 對賬則要**同時拉 `type=2` 和 `type=11`**，後者是退款行，`quota` 為負數。
</Warning>

## 引數寫法（與日誌 API 相反）

任務介面的分頁引數是**下劃線 `page_size`**、頁碼 **`p` 從 1 開始**；日誌 API 是駝峰 `pageSize`、`p` 從 0 開始。寫錯不報錯，只會退回預設分頁。

已驗證可用的過濾引數：

| 引數                                  | 說明                                        |
| ----------------------------------- | ----------------------------------------- |
| `task_id`                           | 精確查一條任務                                   |
| `model_name`                        | 按模型過濾，如 `doubao-seedance-2-0-fast-260128` |
| `start_timestamp` / `end_timestamp` | Unix 秒，按提交時間過濾                            |
| `p` / `page_size`                   | 分頁，`p` 從 1 開始                             |

批次對賬時按時間窗拉取即可，每條都帶 `task_id`、`status`、`quota`、`submit_time`、`finish_time`、`model_name`：

```python theme={null}
import os, time, requests

BASE = "https://api.apiyi.com"
HEADERS = {"Authorization": os.environ["APIYI_SYS_TOKEN"], "Accept": "application/json"}

def video_cost(task_id: str):
    """返回 (status, 美元消費)。失敗任務消費為 0，進行中返回 None。"""
    r = requests.get(f"{BASE}/api/task/self", headers=HEADERS, timeout=60,
                     params={"p": 1, "page_size": 1, "task_id": task_id})
    r.raise_for_status()
    items = r.json()["data"]["items"]
    if not items:
        return None, None
    task = items[0]
    status = task["status"]
    if status == "completed":
        return status, task["quota"] / 500_000
    if status == "failed":
        return status, 0.0
    return status, None          # submitted / in_progress：quota 只是預扣，先別記賬

def list_tasks(start: int, end: int, page_size: int = 100):
    """按提交時間窗分頁拉取，p 從 1 開始，翻到空頁為止。"""
    p = 1
    while True:
        r = requests.get(f"{BASE}/api/task/self", headers=HEADERS, timeout=60,
                         params={"p": p, "page_size": page_size,
                                 "start_timestamp": start, "end_timestamp": end})
        r.raise_for_status()
        items = r.json()["data"]["items"]
        if not items:
            return
        yield from items
        p += 1
        time.sleep(1)
```

## 如果一定要在日誌里人工核對

結算行有三個欄位能對上任務介面：

* 「時間」（`created_at`）等於任務的 `finish_time`，相差不超過 1 秒
* `completion_tokens` 等於任務的 `usage.completion_tokens`
* `other.final_quota` 等於任務的 `quota`

預扣行的 `request_id` 等於提交響應頭裡的 **`X-Shellapi-Request-Id`**，可以用它反查（`/api/log/self?request_id=…`）。注意響應頭裡另有一個 `X-Request-Id`，那是原廠的請求 ID，在 API易 日誌裡搜不到。但**同一秒批次提交多條任務時預扣行會撞在一起**，而且結算行沒有 `request_id`，所以日誌只適合人工核對個別任務，程式化對賬請走任務介面。

## 常見問題

<AccordionGroup>
  <Accordion title="任務詳情頁的 quota 和日誌兩條相加不一樣？">
    先看任務狀態。`submitted` / `in_progress` 時 `quota` 只是預扣，還沒有第二條日誌；`failed` 時 `quota` 仍是預扣額，而日誌裡多了一條負數退款行，兩條相加為 0。`completed` 狀態下兩者一定相等，若不等請把 `task_id` 發給客服核查。
  </Accordion>

  <Accordion title="結算那條日誌為什麼沒有令牌、沒有 request_id？">
    結算是任務完成時由系統補記的，不經過閘道請求鏈路，所以不帶令牌、分組和 `request_id`，控制台上還會標成「流式」。這是正常現象，不代表異常。
  </Accordion>

  <Accordion title="通用影片端點提交的任務，日誌裡有 task_id 嗎？">
    走 `/v1/videos` 等通用端點時，預扣行的 `content` 裡會帶 `任務ID: cgt-…`，但結算行仍然沒有。而且這些端點目前對 Seedance 的解析度引數透傳不完整，請一律走文件路徑 `/seedance/api/v3/contents/generations/tasks`，見[影片生成 API](/zh-Hant/api-capabilities/seedance2/video-generation)。
  </Accordion>

  <Accordion title="系統令牌能看到別人的任務嗎？">
    `/api/task/self` 只返回本賬號的任務。系統令牌等價於賬號憑證，請像保管密碼一樣保管，不要寫進程式碼倉庫。
  </Accordion>
</AccordionGroup>

## 相關文件

* [Seedance 2.0 / 2.5 計費如何看日誌](/zh-Hant/api-capabilities/seedance2/overview)
* [日誌查詢 API](/zh-Hant/api-capabilities/log-query)
* [Seedance 影片任務提交後可以取消嗎？](/zh-Hant/faq/seedance-video-task-cancel)
* [API 呼叫的預扣費機制是什麼？](/zh-Hant/faq/pre-deduction-quota)
