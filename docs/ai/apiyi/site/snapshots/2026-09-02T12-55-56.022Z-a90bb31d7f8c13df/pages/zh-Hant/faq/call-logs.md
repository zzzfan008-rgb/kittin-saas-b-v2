> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何檢視我的呼叫記錄？

> API易呼叫日誌檢視指南，瞭解如何檢視API呼叫記錄和計費詳情

## 訪問呼叫日誌

進入頂部導航的"日誌"頁面：[https://api.apiyi.com/log](https://api.apiyi.com/log)

在日誌欄目中，您可以檢視：

* **每一次呼叫的成功記錄**
* **API 呼叫的報錯日誌**
* **詳細的計費說明**

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/log-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=ce6f1444d3f138ff5cd6927843595a61" alt="呼叫日誌管理" width="1242" height="1128" data-path="images/log-manage.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/log-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=ce6f1444d3f138ff5cd6927843595a61" alt="呼叫日誌管理" width="1242" height="1128" data-path="images/log-manage.png" />

## 日誌記錄內容

### 成功呼叫記錄

每次成功的 API 請求都會記錄以下資訊：

* **請求時間**：精確到秒的呼叫時間戳
* **使用模型**：本次呼叫使用的AI模型
* **Token 計數**：輸入和輸出的 Token 數量統計
* **計費金額**：本次呼叫的具體費用
* **呼叫狀態**：請求的執行狀態

### 報錯日誌

失敗的 API 呼叫會記錄：

* **錯誤型別**：具體的錯誤分類
* **錯誤資訊**：詳細的錯誤描述
* **發生時間**：錯誤發生的時間戳
* **相關引數**：導致錯誤的請求引數資訊

## 隱私和資料政策

<Info>
  **資料隱私保護**

  出於隱私保護和資料儲存成本考慮，我們的日誌系統：

  * **不記錄詳細的輸入和輸出內容**
  * **只保留基礎的 Token 計數資訊**
  * **僅儲存計費所需的必要日誌資料**
  * **確保使用者資料隱私安全**
</Info>

## 日誌檢視技巧

### 篩選功能

* **按時間範圍篩選**：可以檢視特定時間段的呼叫記錄
* **按模型篩選**：可以檢視特定AI模型的使用情況
* **按狀態篩選**：區分成功和失敗的呼叫記錄

### 計費分析

* **單次呼叫成本**：每次API呼叫的具體費用
* **Token 使用效率**：輸入輸出Token的比例分析
* **模型成本對比**：不同模型的使用成本統計

## 常見問題

### 為什麼看不到具體的對話內容？

為了保護使用者隱私和降低儲存成本，我們只記錄計費相關的基礎資訊，不儲存具體的輸入輸出內容。

### 日誌儲存多長時間？

保留**當月加此前兩個自然月**，每月 5 日清理更早的整月資料。完整規則與匯出建議見[日誌保留與清理政策](/zh-Hant/faq/log-retention-policy)。

### 如何匯出呼叫記錄？

在日誌頁面按需篩選後使用**非同步匯出**，匯出任務在後臺執行，完成後下載檔案即可自行歸檔，適合對賬和審計留存。

注意「匯出」與「彙總賬單」兩個按鈕的時區口徑不同，賬戶時區也建議保持預設的 UTC+0，詳見[日誌的時區設定和資料匯出要注意什麼？](/zh-Hant/faq/log-timezone-and-export)。
