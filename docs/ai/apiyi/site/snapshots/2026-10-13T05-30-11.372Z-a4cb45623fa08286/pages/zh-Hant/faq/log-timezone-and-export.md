> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 日誌的時區設定和資料匯出要注意什麼？

> 賬戶時區請直接選你所在的時區（中國使用者選 Asia/Shanghai），控制台彈出時區切換建議時可以放心切換。日誌明細、「呼叫資料一覽」統計圖、「匯出」和「彙總賬單」四處都跟隨賬戶時區，口徑一致；只有日誌查詢 API 返回的是 Unix 時間戳。

## 簡短回答

<CardGroup cols={3}>
  <Card title="賬戶時區選你所在地" icon="globe">
    中國使用者選 `Asia/Shanghai`（UTC+8），其它地區選本地時區。選對之後，看到的時間就是你的本地時間
  </Card>

  <Card title="彈窗可以直接切換" icon="bell">
    控制台檢測到裝置時區不同會彈「本地設定建議」，**點「切換到 Asia/Shanghai」即可**
  </Card>

  <Card title="四處口徑一致" icon="check">
    明細列表、統計圖、**匯出**、**彙總賬單**都按賬戶時區輸出，彼此之間不需要再換算
  </Card>
</CardGroup>

<Info>
  **2026/9/20 00:55 (UTC+8) 已修復統計圖錯位問題。** 此前賬戶時區不是 UTC 時，日誌頁頂部「呼叫資料一覽」統計圖會出現日期錯位（例如北京時間下午就出現了次日的柱子），所以我們曾建議保持 UTC+0、在彈窗裡選「暫時忽略」。該問題已修復，**舊建議作廢**，現在請直接選擇你所在的時區。
</Info>

### 歷史資料偏差說明

在此之前，資料庫預設時區是 UTC+8，與使用者選擇的上海時區（UTC+8）疊加產生了偏移，導致統計圖資料偏差。現已調整資料庫預設時區為 UTC+0，統計圖 = 使用者所選時區，不再偏移。

受影響的是 **2026/9/20 00:55 (UTC+8) 之前**的按日 / 按小時分組的統計圖和彙總賬單：這些分組可能有 8 小時的日期偏移，總金額不受影響。逐筆明細不受影響。如需按日精確對賬，建議重新匯出一次。

如果你需要對賬歷史資料，也可以通過[日誌查詢 API](/zh-Hant/api-capabilities/log-query) 拉取逐筆記錄自行彙總，比依賴修復前的彙總檔案更可靠。

<Tip>
  **一句話記住**：**控制台裡看到的和匯出的**（明細列表、統計圖、匯出檔案、彙總賬單）都跟隨**賬戶所選時區**；**程式拉取的**（[日誌查詢 API](/zh-Hant/api-capabilities/log-query) 的 `created_at`）是 **Unix 秒級時間戳**，與時區無關。
</Tip>

## 賬戶時區在哪裡看、怎麼改

在控制台的**使用者資訊**一欄可以檢視和修改當前賬戶時區。新註冊賬戶預設是 `UTC`，中國使用者建議改成 `Asia/Shanghai`。

<Frame caption="控制台「使用者資訊」一欄的時區設定，可直接下拉修改">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-user-info-timezone.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=94b725d2393ee1ff84eda7b4c1360743" alt="控制台使用者資訊欄中的時區設定項" width="892" height="332" data-path="images/console-user-info-timezone.png" />
</Frame>

切換時區**只改變時間的顯示與分組方式**，不會改動、也不會丟失任何已產生的呼叫記錄和扣費資料，可以隨時改、隨時改回。

## 彈出「本地設定建議」時可以直接切換

當賬戶時區（例如 `UTC`）與你當前裝置的時區（例如 `Asia/Shanghai`）不一致時，控制台會彈出一個「本地設定建議」視窗。**直接點「切換到 Asia/Shanghai」即可**，切換後日志明細和統計圖都按北京時間顯示。

<Frame caption="控制台彈出的「本地設定建議」視窗，可以直接點「切換到 Asia/Shanghai」">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-timezone-local-settings-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=974f0da20864d287c8e2cb82e75f45b6" alt="本地設定建議彈窗：賬戶時區 UTC、當前裝置時區 Asia/Shanghai，底部有暫時忽略與切換到 Asia/Shanghai 兩個按鈕" width="1054" height="546" data-path="images/console-timezone-local-settings-dialog.png" />
</Frame>

如果你的業務或財務固定按 UTC 對賬，也可以點「暫時忽略」保持 UTC——兩種選擇現在都能正常顯示，按自己的對賬習慣選即可。

日誌頁頂部的「呼叫資料一覽」統計圖按賬戶時區的自然日分桶：

<Frame caption="日誌頁頂部的「呼叫資料一覽」，按賬戶時區的自然日統計">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-call-data-overview.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=246553c9d4025e4bf5aaae4598f39866" alt="控制台日誌頁頂部的呼叫資料一覽入口，被紅框標出" width="1002" height="374" data-path="images/console-log-call-data-overview.png" />
</Frame>

## 兩種匯出方式怎麼選

日誌頁右上角有**匯出**和**彙總賬單**兩個按鈕。

<Frame caption="日誌頁右上角的「匯出」與「彙總賬單」兩個按鈕">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-export-buttons.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=d8f2d7b0359ddcf6aebdd66399bfcffe" alt="日誌頁工具欄，左側為匯出按鈕，右側為彙總賬單按鈕" width="650" height="212" data-path="images/console-log-export-buttons.png" />
</Frame>

| | 匯出 | 彙總賬單 |
| - | - | - |
| 時區口徑 | **跟隨賬戶時區** | **跟隨賬戶時區** |
| 資料粒度 | 逐筆呼叫記錄（可選欄位） | 按小時 / 天 / 月彙總的賬單 |
| 資料量 | 支援大批次，可後臺非同步跑 | 小，直接下載 |
| 適用場景 | 對賬、審計、自建分析 | 快速看某段時間的總花費、稅務備查 |

兩個按鈕的時區口徑相同，差別只在資料粒度和資料量。選哪個只看你要逐筆記錄還是要彙總金額。

例如賬戶時區為 `Asia/Shanghai` 時，一筆發生在北京時間 **2026-09-20 01:08 (UTC+8)** 的呼叫：

* 在**頁面明細列表**裡顯示為 `2026-09-20 01:08`
* 在**匯出檔案**裡同樣是 `2026/9/20 1:08`
* 在**彙總賬單**（按天）裡歸入 `2026-09-20`，統計圖裡也落在 9 月 20 日

<Tip>
  **請求 ID 前 14 位是 UTC 時間**。例如 `20260919170811…` 表示 `2026-09-19 17:08:11` UTC，也就是北京時間 `2026-09-20 01:08:11 (UTC+8)`。需要和客服核對某一筆呼叫時，直接提供請求 ID 最準確。
</Tip>

### 匯出 → 後臺非同步匯出（更推薦）

需要逐筆消費日誌時，用**匯出**按鈕，並在彈窗裡選擇**後臺非同步匯出**。

<Frame caption="「選擇匯出方式」彈窗：匯出欄位可選，匯出方式建議選「後臺非同步匯出」">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-async-export-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=09865097dc2f80581a82e2d7feb06f3c" alt="選擇匯出方式彈窗，包含匯出欄位、當前頁面匯出與後臺非同步匯出、Excel 與 CSV 格式、最大匯出記錄數等選項" width="974" height="1312" data-path="images/console-log-async-export-dialog.png" />
</Frame>

要點：

* **時間按賬戶時區輸出**，與頁面明細列表一致
* **匯出欄位可選**：使用時間、請求 ID、令牌名稱、模型名稱等，按對賬需要勾選
* **匯出方式**：資料量大時選**後臺非同步匯出**，任務在後臺跑、不阻塞頁面操作，官方建議**超過 1 萬條記錄時使用**
* **匯出格式**：Excel（`.xlsx`，超大數據自動拆分並打包 zip）或 CSV（`.csv`，適合小資料量）
* **最大匯出記錄數**：填 `0` 表示不限制（服務端自動拆分多個 Excel 並打包 zip），上限 5000 萬條
* **進度檢視**：任務建立後在「任務管理」頁面檢視匯出進度與狀態，完成後直接下載

完整的匯出操作步驟和歸檔建議見[呼叫日誌儲存多久？多久清理一次？](/zh-Hant/faq/log-retention-policy)。

## 對賬實務

<Steps>
  <Step title="先確認對賬雙方的時區一致">
    匯出檔案的日期按**匯出人賬戶的時區**分組。團隊裡多人對賬、或和財務系統對賬時，先確認各方用的是同一個時區（例如都用 `Asia/Shanghai`），否則凌晨時段的呼叫會被分到不同的日期。
  </Step>

  <Step title="程式拉取的時間戳自行換算">
    [日誌查詢 API](/zh-Hant/api-capabilities/log-query) 的 `created_at` 是 Unix 秒級時間戳，按你需要的時區轉換即可。例如轉北京時間：數值加 **28800**（8 × 3600）後按 UTC 格式化，或直接用程式語言的時區庫轉換。
  </Step>

  <Step title="報障時附上請求 ID 和時區">
    請求 ID 本身帶 UTC 時間，最不容易出錯；報時間點時請同時註明時區，如 `01:08 (UTC+8)`。
  </Step>
</Steps>

<Tip>
  對賬、審計這類需要按「業務日」切分的場景，也可以用[日誌查詢 API](/zh-Hant/api-capabilities/log-query) 自己跑指令碼，比依賴匯出檔案更可控。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="之前文件讓我保持 UTC+0、選「暫時忽略」，現在還需要嗎？">
    不需要了。那條建議是因為賬戶時區不是 UTC 時統計圖會日期錯位，該問題已於 2026/9/20 00:55 (UTC+8) 修復。現在請直接選擇你所在的時區。
  </Accordion>

  <Accordion title="我之前按建議保持了 UTC，要改成北京時間嗎？">
    建議改成 `Asia/Shanghai`，這樣控制台裡所有時間都是北京時間，不用再手動加 8 小時。如果你的對賬流程已經固定按 UTC 進行，也可以繼續保持 UTC，兩者現在都能正確顯示。
  </Accordion>

  <Accordion title="切換時區會丟資料嗎？">
    不會。時區隻影響時間的顯示和按日期分組的方式，不會改動任何已產生的呼叫記錄和扣費資料，可以隨時改、隨時改回。
  </Accordion>

  <Accordion title="修復前匯出的舊檔案還準嗎？">
    逐筆明細（「匯出」按鈕）的每一筆記錄、金額都是準確的，時間按當時的賬戶時區顯示。**2026/9/20 00:55 (UTC+8) 之前**匯出的「彙總賬單」及統計圖的**按日 / 按小時分組**可能有 8 小時的日期偏移，總金額不受影響；如需按日精確對賬，建議重新匯出一次。
  </Accordion>

  <Accordion title="為什麼頁面上的時間和同事匯出的檔案對不上？">
    很可能你們兩人的賬戶時區不同。匯出檔案按匯出人的賬戶時區輸出，請先在「使用者資訊」裡確認雙方時區一致。
  </Accordion>

  <Accordion title="日誌查詢 API 能不能傳「時區」引數？">
    不能。介面只收發 Unix 秒級時間戳（天然為 UTC），不接收時區引數，客戶端按需自行轉換。
  </Accordion>

  <Accordion title="匯出的檔案裡有我的輸入輸出內容嗎？">
    沒有。匯出的欄位與後臺日誌展示一致——時間、請求 ID、令牌名稱、模型、token 數、金額、狀態等，不含任何 prompt 或模型輸出內容。詳見[呼叫日誌儲存多久？多久清理一次？](/zh-Hant/faq/log-retention-policy)。
  </Accordion>

  <Accordion title="能不能用程式拉取日誌，不走頁面匯出？">
    可以，見[日誌查詢 API](/zh-Hant/api-capabilities/log-query)。該介面的 `start_timestamp` / `end_timestamp` / `created_at` 都是 **Unix 秒級時間戳**，與控制台的時區設定無關，適合自動對賬場景。
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
* [即時動態：控制台時區顯示問題已修復，可放心切換本地時區](/live/2026-09/console-timezone-fixed)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.