> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 日誌的時區設定和資料匯出要注意什麼？

> 賬戶時區請保持預設的 UTC+0，控制台彈出的時區切換建議選「暫時忽略」。所有匯出檔案（匯出、彙總賬單）固定按 UTC+0 輸出，而日誌明細列表和「呼叫資料一覽」統計圖跟隨賬戶所選時區顯示——兩者口徑不一致就會出現 8 小時的對賬偏差。

## 簡短回答

<CardGroup cols={3}>
  <Card title="賬戶時區保持 UTC+0" icon="globe">
    預設的 `London (UTC+0/+1)` 就是正確設定，**不要改**。日誌庫本身按 UTC 記錄，UTC+0 與資料來源一致
  </Card>

  <Card title="彈窗選「暫時忽略」" icon="bell-off">
    控制台檢測到裝置時區不同會彈「本地設定建議」，**點左邊的「暫時忽略」**，不要點「切換到 Asia/Shanghai」
  </Card>

  <Card title="匯出檔案一律 UTC+0" icon="download">
    **匯出**和**彙總賬單**兩個按鈕產出的檔案都固定按 UTC+0，不受賬戶時區影響；頁面上看到的時間則跟隨賬戶時區
  </Card>
</CardGroup>

<Warning>
  **已經切換過時區的使用者，改回 `London (UTC+0/+1)` 即可。** 切換時區隻影響頁面展示，**不會改動、也不會丟失任何已產生的呼叫資料**，也不會改變匯出檔案的內容——匯出始終按 UTC+0。改回來之後，頁面顯示與匯出檔案的口徑重新一致。
</Warning>

<Info>
  **一句話記住**：**匯出來的**（匯出檔案、彙總賬單、[日誌查詢 API](/zh-Hant/api-capabilities/log-query) 的 `created_at`）都是 **UTC+0**；**在頁面上看的**（明細列表、統計圖）跟隨**賬戶所選時區**。
</Info>

## 賬戶時區在哪裡看

在控制台的**使用者資訊**一欄可以看到當前賬戶時區，正常應顯示為 `London (UTC+0/+1)`，也就是 UTC+0。

<Frame caption="控制台「使用者資訊」一欄的時區設定，正常為 London (UTC+0/+1)">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-user-info-timezone.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=94b725d2393ee1ff84eda7b4c1360743" alt="控制台使用者資訊欄，時區一項顯示 London (UTC+0/+1)" width="892" height="332" data-path="images/console-user-info-timezone.png" />
</Frame>

## 彈出「本地設定建議」時請選「暫時忽略」

當賬戶時區（UTC）與你當前裝置的時區（例如 `Asia/Shanghai`）不一致時，控制台會彈出一個「本地設定建議」視窗，並給出「切換到 Asia/Shanghai」的按鈕。

<Frame caption="控制台彈出的「本地設定建議」視窗，請點左側的「暫時忽略」">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-timezone-local-settings-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=974f0da20864d287c8e2cb82e75f45b6" alt="本地設定建議彈窗：賬戶時區 UTC、當前裝置時區 Asia/Shanghai，底部有暫時忽略與切換到 Asia/Shanghai 兩個按鈕" width="1054" height="546" data-path="images/console-timezone-local-settings-dialog.png" />
</Frame>

<Warning>
  **請點「暫時忽略」，不要點「切換到 Asia/Shanghai」。** 切換後，日誌頁頂部的\*\*「呼叫資料一覽」統計圖\*\*展示會錯位——時間分桶與圖表區間對不上，看起來像資料缺失或整體平移。
</Warning>

受影響的就是日誌頁頂部這一欄：

<Frame caption="日誌頁頂部的「呼叫資料一覽」，賬戶時區被切換後此處統計圖會錯位">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-call-data-overview.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=246553c9d4025e4bf5aaae4598f39866" alt="控制台日誌頁頂部的呼叫資料一覽入口，被紅框標出" width="1002" height="374" data-path="images/console-log-call-data-overview.png" />
</Frame>

日誌明細列表裡的時間同樣跟隨賬戶時區顯示。**但匯出檔案始終是 UTC+0，不跟隨這個設定**——所以把賬戶時區保持在 UTC+0，明細、統計圖、匯出檔案三者口徑才一致，換算時統一加一個固定時差即可。

## 兩種匯出方式怎麼選

日誌頁右上角有**匯出**和**彙總賬單**兩個按鈕。

<Frame caption="日誌頁右上角的「匯出」與「彙總賬單」兩個按鈕">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-export-buttons.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=d8f2d7b0359ddcf6aebdd66399bfcffe" alt="日誌頁工具欄，左側為匯出按鈕，右側為彙總賬單按鈕" width="650" height="212" data-path="images/console-log-export-buttons.png" />
</Frame>

|      | 匯出            | 彙總賬單         |
| ---- | ------------- | ------------ |
| 時區口徑 | **固定 UTC+0**  | **固定 UTC+0** |
| 資料粒度 | 逐筆呼叫記錄（可選欄位）  | 按日期彙總的賬單     |
| 資料量  | 支援大批次，可後臺非同步跑 | 小，直接下載       |
| 適用場景 | 對賬、審計、自建分析    | 快速看某段時間的總花費  |

兩個按鈕的**時區口徑相同，都是 UTC+0**，與賬戶時區設定無關；差別只在資料粒度和資料量。選哪個只看你要逐筆記錄還是要按天的總額。

### 頁面上的時間和匯出檔案對不上，是預期行為

這是對賬時最容易踩的坑：**頁面按賬戶所選時區顯示，匯出檔案按 UTC+0**。

如果賬戶時區被改成了 UTC+8，一筆發生在北京時間 **2026-08-14 00:30 (UTC+8)** 的呼叫：

* 在**頁面明細列表**裡顯示為 `2026-08-14 00:30`，屬於 8 月 14 日
* 在**匯出檔案**裡是 `2026-08-13 16:30`（UTC+0），落在 8 月 13 日

於是「凌晨 0–8 點 (UTC+8) 的呼叫不在當天彙總」——看起來像資料丟了，實際只是兩邊差了 8 小時。

<Tip>
  **把賬戶時區改回 `London (UTC+0/+1)`，兩邊口徑就一致了**，這是最省事的做法。
  如果因為其它原因必須保留本地時區，那就以匯出檔案為準，在自己的表格或腳本里統一換算（見下）。
</Tip>

### 匯出 → 後臺非同步匯出（更推薦）

需要逐筆消費日誌時，用**匯出**按鈕，並在彈窗裡選擇**後臺非同步匯出**。

<Frame caption="「選擇匯出方式」彈窗：匯出欄位可選，匯出方式建議選「後臺非同步匯出」">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-async-export-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=09865097dc2f80581a82e2d7feb06f3c" alt="選擇匯出方式彈窗，包含匯出欄位、當前頁面匯出與後臺非同步匯出、Excel 與 CSV 格式、最大匯出記錄數等選項" width="974" height="1312" data-path="images/console-log-async-export-dialog.png" />
</Frame>

要點：

* **時區固定 UTC+0**，不受賬戶時區設定影響。因為匯出的就是資料庫日誌本身，需要自己換算成本地時間（UTC+8 使用者加 8 小時）
* **匯出欄位可選**：使用時間、請求 ID、令牌名稱、模型名稱等，按對賬需要勾選
* **匯出方式**：資料量大時選**後臺非同步匯出**，任務在後臺跑、不阻塞頁面操作，官方建議**超過 1 萬條記錄時使用**
* **匯出格式**：Excel（`.xlsx`，超大數據自動拆分並打包 zip）或 CSV（`.csv`，適合小資料量）
* **最大匯出記錄數**：填 `0` 表示不限制（服務端自動拆分多個 Excel 並打包 zip），上限 5000 萬條
* **進度檢視**：任務建立後在「任務管理」頁面檢視匯出進度與狀態，完成後直接下載

完整的匯出操作步驟和歸檔建議見[呼叫日誌儲存多久？多久清理一次？](/zh-Hant/faq/log-retention-policy)。

## 對賬實務

<Steps>
  <Step title="統一換算成北京時間">
    * **可讀時間**：匯出檔案裡的時間**加 8 小時**就是北京時間。`2026-08-14 00:30:00 UTC+0` → `2026-08-14 08:30:00 (UTC+8)`
    * **Unix 秒**（[日誌查詢 API](/zh-Hant/api-capabilities/log-query) 的 `created_at`）：數值上**加 28800**（8 × 3600）
  </Step>

  <Step title="要嚴格按「自然日」分桶時，先換算再分桶">
    在 Excel 或自家腳本里把所有時間統一加 8 小時，**再**按 `YYYY-MM-DD` 分桶。
    **不要直接拿匯出表裡的日期列做對賬**——這是頁面與匯出檔案對不上的最常見原因。
  </Step>

  <Step title="報障時同時給出 UTC+0 和 UTC+8 兩個時間">
    客服按 UTC+0 檢索日誌，給北京時間便於你的業務同事理解。兩個時間都寫，省去一次來回。
  </Step>
</Steps>

<Tip>
  對賬、審計這類需要按「業務日」切分的場景，建議優先用[日誌查詢 API](/zh-Hant/api-capabilities/log-query) 自己跑指令碼，
  比依賴匯出 CSV 更可控——腳本里加 28800 秒比改 Excel 公式靠譜。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼預設是 UTC+0，而不是我所在的時區？">
    因為後臺的呼叫日誌本身就是按 UTC 記錄的資料庫日誌。賬戶時區保持 UTC+0，頁面展示、統計圖和匯出檔案三者口徑一致，換算時統一加一個固定時差即可；改成本地時區後，各處的換算規則不再一致，反而更容易看錯。
  </Accordion>

  <Accordion title="我已經切換過時區，資料會丟嗎？">
    不會。時區隻影響頁面展示，不會改動任何已產生的呼叫記錄和扣費資料，也不影響匯出檔案的內容。把賬戶時區改回 `London (UTC+0/+1)`，頁面顯示與匯出檔案的口徑即重新一致。
  </Accordion>

  <Accordion title="UTC+8 使用者怎麼換算匯出檔案裡的時間？">
    在匯出檔案的時間上**加 8 小時**就是北京時間。例如匯出檔案裡的 `2026-08-09 08:00` 對應北京時間 **2026/8/9 16:00 (UTC+8)**。跨天對賬時留意這個 8 小時的位移。
  </Accordion>

  <Accordion title="為什麼頁面明細和匯出檔案的時間不一樣？">
    因為兩者時區口徑不同：頁面明細列表跟隨**賬戶所選時區**，匯出檔案固定 **UTC+0**。如果賬戶時區是 UTC+8，凌晨 0–8 點 (UTC+8) 的呼叫在頁面上屬於「今天」，在匯出檔案裡落在「昨天」。這是預期行為，不是資料錯誤。把賬戶時區改回 UTC+0 即可消除這個差異。
  </Accordion>

  <Accordion title="能不能讓匯出直接按 UTC+8 輸出？">
    不能。匯出固定按 UTC+0，因為匯出的就是資料庫日誌本身。如果你的業務時區不是 UTC+8，也同樣需要自行換算。
  </Accordion>

  <Accordion title="日誌查詢 API 能不能傳「時區」引數？">
    不能。介面只收發 Unix 秒級時間戳（天然為 UTC），不接收時區引數，客戶端按需自行轉換。
  </Accordion>

  <Accordion title="匯出的檔案裡有我的輸入輸出內容嗎？">
    沒有。匯出的欄位與後臺日誌展示一致——時間、請求 ID、令牌名稱、模型、token 數、金額、狀態等，不含任何 prompt 或模型輸出內容。詳見[呼叫日誌儲存多久？多久清理一次？](/zh-Hant/faq/log-retention-policy)。
  </Accordion>

  <Accordion title="能不能用程式拉取日誌，不走頁面匯出？">
    可以，見[日誌查詢 API](/zh-Hant/api-capabilities/log-query)。該介面的 `start_timestamp` / `end_timestamp` / `created_at` 都是 **Unix 秒級時間戳**，與控制台的時區設定無關，程式側自行按需轉換即可，適合自動對賬場景。
  </Accordion>

  <Accordion title="匯出任務一直沒完成怎麼辦？">
    先在「任務管理」頁面確認任務狀態。資料量特別大時（例如幾百萬條）後臺拆分和打包需要時間，建議縮小時間範圍或設定合理的**最大匯出記錄數**，分批匯出。
  </Accordion>
</AccordionGroup>

## 相關文件

* [如何檢視我的呼叫記錄？](/zh-Hant/faq/call-logs)
* [怎麼看懂日誌裡的計費金額？](/zh-Hant/faq/log-billing-explained)
* [呼叫日誌儲存多久？多久清理一次？](/zh-Hant/faq/log-retention-policy)
* [日誌查詢 API](/zh-Hant/api-capabilities/log-query)
* [即時動態：控制台彈出時區切換建議時，請選擇「暫時忽略」](/live/2026-08/timezone-switch-prompt-ignore)
