> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 為什麼還有餘額跑不通？

> API易餘額不足問題排查指南，瞭解請求預扣機制和Token超長的解決方案

## 請求預扣機制

API易採用**請求預扣**機制，在傳送請求時會預先扣除預估費用。如果當前餘額不足以支援這個請求，即使賬戶中還有一些餘額，也會導致請求失敗。

<Warning>
  **預扣機制說明**

  系統會根據輸入內容的複雜度預估本次請求的最大可能費用，如果預估費用超過當前餘額，請求將無法執行。
</Warning>

## 常見原因分析

### 1. 輸入內容Token超長

**圖片內容**

* 上傳了複雜的圖片（高解析度、多圖片）
* 頁面多的PDF檔案或複雜文件
* 圖表、截圖等視覺內容較多

**文本內容**

* 在第三方軟體中開啟了聯網搜尋外掛
* 傳入了整個程式碼庫（多目錄多檔案）
* 長篇文件或大量程式碼

### 2. 超過模型上下文限制

這些超長內容可能導致：

* **超過當前模型的整個上下文**（輸入+輸出總和）
* **超過您當前API易的餘額**
* **請求預扣金額過高**

<Info>
  **上下文計算**

  模型的上下文限制 = 輸入Token + 輸出Token的總和

  例如：如果模型支援128K上下文，而您的輸入已經用了100K Token，那麼輸出最多隻能有28K Token。
</Info>

## 解決方案

### 1. 檢查輸入內容

**最佳化輸入**

* 壓縮或減小圖片尺寸
* 分批處理大檔案
* 關閉不必要的聯網搜尋功能
* 只傳入相關的程式碼檔案，而非整個專案

**內容分片**

* 將長文件拆分為多個部分
* 分批上傳多張圖片
* 逐個處理程式碼檔案

### 2. 檢查賬戶餘額

**餘額檢視**

* 登入控制台檢視當前餘額
* 確認餘額是否足夠支付預估費用
* 考慮充值以獲得更充足的餘額

### 3. 選擇合適的模型

**推薦測試模型**

* `gpt-4o-mini` - 價格便宜，適合測試
* `gpt-3.5-turbo` - 成本較低的選擇
* `claude-3-haiku` - 快速且經濟的模型

<Tip>
  **成本最佳化建議**

  先用便宜的模型測試您的輸入內容是否合理，確認沒有問題後再切換到更高階的模型。
</Tip>

### 4. 分析Token使用

**Token計算工具**

* 使用線上Token計算器預估內容長度
* 檢視API返回的Token使用統計
* 對比不同內容的Token消耗

## 技術支援

如果按照上述方法仍然無法解決問題，可以聯絡技術客服獲得幫助：

<Card title="企業微信客服" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

  請提供以下資訊以便快速診斷：

  * 賬戶餘額截圖
  * 輸入內容的大致描述
  * 使用的模型名稱
  * 錯誤資訊截圖
</Card>

## 預防措施

### 1. 內容預處理

* 在傳送前評估內容複雜度
* 使用壓縮工具最佳化檔案大小
* 提取關鍵資訊而非全量內容

### 2. 餘額管理

* 保持充足的賬戶餘額
* 設定餘額預警提醒
* 定期檢視消費記錄

### 3. 模型選擇

* 根據任務複雜度選擇合適模型
* 簡單任務使用經濟型模型
* 複雜任務再考慮高階模型

## 常見錯誤資訊

* `Insufficient balance for this request` - 餘額不足
* `Input too long` - 輸入內容過長
* `Context length exceeded` - 超過上下文限制
* `Request timeout` - 請求超時（通常因內容過長）
