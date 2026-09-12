> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 為方便排查問題，可以在後臺看到詳細日誌嗎？

> 瞭解管理員如何協助排查問題時開啟詳細日誌記錄功能

## 預設隱私保護策略

出於隱私安全考慮，API易預設**不儲存**客戶的輸入和輸出內容，只做透明代理的轉發。

這意味著：

* ✅ 您的資料隱私得到最大程度保護
* ✅ 減少資料儲存成本
* ✅ 符合資料安全最佳實踐
* ❌ 管理員後臺無法檢視具體的對話內容

## 批次呼叫場景的問題

很多客戶在跑批處理時會遇到這樣的困擾：

<Warning>
  **典型問題場景**

  "後臺能把使用者的輸入放進去嗎？不然跑批的時候根本區分不出來哪次呼叫對應哪個任務啊！"

  批次處理時，如果沒有詳細的輸入輸出記錄，確實很難追蹤具體是哪個任務出了問題。
</Warning>

## 管理員協助排查功能

如果您遇到問題需要技術支援協助排查，我們可以**臨時開啟**詳細日誌記錄功能，由管理員協助定位問題。

<Info>
  **重要說明**

  * 這個功能僅在**管理員後臺**開啟，客戶無法自主控制
  * 詳細日誌內容**僅管理員可見**，不會透出給客戶
  * 這是一個配合協助問題排查的功能，非常規使用
</Info>

### 如何請求開啟

<Steps>
  <Step title="聯絡客服說明問題">
    通過客服渠道（Telegram、郵件等）詳細描述遇到的問題，說明需要協助排查
  </Step>

  <Step title="管理員評估">
    技術支援人員評估是否需要開啟詳細日誌來定位問題
  </Step>

  <Step title="臨時開啟">
    管理員在後臺為您的賬號臨時開啟日誌詳情記錄功能
  </Step>

  <Step title="協助排查">
    管理員通過檢視詳細日誌協助定位和解決問題
  </Step>

  <Step title="關閉功能">
    問題解決後，管理員會及時關閉詳細日誌記錄功能
  </Step>
</Steps>

### 管理員後臺介面

這是管理員後臺的日誌詳情控制介面（客戶無法訪問）：

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/yl72wP6yNQxQvIte/images/user-logs-control.png?fit=max&auto=format&n=yl72wP6yNQxQvIte&q=85&s=77b33464164d5bb3ea193e19f82cd402" alt="管理員後臺日誌詳情控制" width="1572" height="740" data-path="images/user-logs-control.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/yl72wP6yNQxQvIte/images/user-logs-control.png?fit=max&auto=format&n=yl72wP6yNQxQvIte&q=85&s=77b33464164d5bb3ea193e19f82cd402" alt="管理員後臺日誌詳情控制" width="1572" height="740" data-path="images/user-logs-control.png" />

## 詳細日誌包含的內容

管理員開啟詳細日誌記錄後，系統會額外記錄：

<CardGroup cols={2}>
  <Card title="輸入內容" icon="log-in">
    * 使用者的完整提示詞
    * 系統訊息
    * 上下文對話歷史
    * 函式呼叫引數
  </Card>

  <Card title="輸出內容" icon="log-out">
    * AI 模型的完整回覆
    * 函式呼叫結果
    * 流式輸出的完整內容
    * 返回的後設資料
  </Card>
</CardGroup>

<Warning>
  **隱私提醒**

  這些詳細日誌**僅管理員可見**，用於協助您排查技術問題。我們承諾：

  * 僅在必要時開啟此功能
  * 僅用於技術支援目的
  * 問題解決後及時關閉
  * 嚴格保護您的資料隱私
</Warning>

## 適用場景

### 推薦請求開啟的場景

以下情況可以聯絡客服請求管理員協助排查：

* 🔍 **介面報錯**：頻繁出現錯誤但無法定位原因
* 📊 **批次任務異常**：跑批時部分任務失敗，需要追蹤具體哪些請求有問題
* 🧪 **輸出品質問題**：模型輸出異常，需要分析具體的輸入輸出內容
* 📈 **效能問題**：呼叫延遲異常，需要詳細日誌分析瓶頸
* 🐛 **疑似 Bug**：懷疑係統存在問題，需要提供詳細資訊給技術團隊

### 何時無需開啟

以下場景通常不需要開啟詳細日誌：

* ✅ **正常使用**：API 呼叫正常，無異常情況
* ✅ **常規問題**：通過基礎日誌（Token 統計、錯誤型別）已能定位
* ✅ **隱私敏感**：處理極其敏感的資料，不希望任何人檢視

## 資料安全說明

<Info>
  **重要提示**

  即使臨時開啟詳細日誌記錄，我們也會：

  * ✅ 採用加密儲存保護您的資料
  * ✅ 嚴格限制日誌訪問權限（僅授權管理員）
  * ✅ 問題解決後立即關閉功能
  * ✅ 定期自動清理過期日誌資料
  * ✅ 遵守相關資料保護法規
  * ✅ 詳細日誌不會透出給任何第三方
</Info>

## 常見問題

### 我可以自己在後臺開啟這個功能嗎？

不可以。這個功能僅在管理員後臺開啟，客戶無法自主操作。如需協助排查問題，請聯絡客服。

### 開啟後我能看到詳細日誌嗎？

不能。詳細日誌內容僅管理員可見，用於技術支援目的。客戶只能看到基礎的呼叫記錄（Token 統計、錯誤型別等）。

### 開啟詳細日誌會影響效能嗎？

影響極小，主要是增加少量日誌寫入時間（通常 \< 10ms），不會影響正常使用。

### 日誌儲存多久？

詳細日誌預設儲存 7-30 天，問題解決後管理員會及時關閉記錄功能。

### 管理員會看到我所有的請求內容嗎？

僅在開啟詳細日誌期間的請求會被記錄。管理員僅在協助您排查問題時檢視相關日誌，嚴格遵守保密協議。

### 可以只記錄特定時間段的呼叫嗎？

可以。您可以與客服約定具體的開啟時間段，例如只在復現問題的時候臨時開啟。

## 聯絡我們

如遇到技術問題需要管理員協助排查，請通過以下方式聯絡我們：

<CardGroup cols={3}>
  <Card title="郵件支援" icon="mail">
    [feedback@apiyi.com](mailto:feedback@apiyi.com)

    詳細描述問題和復現步驟
  </Card>

  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    快速響應，即時溝通
  </Card>

  <Card title="Telegram" icon="send">
    @apiyi001

    即時訊息，高效解決
  </Card>
</CardGroup>

<Tip>
  **提高排查效率的建議**

  聯絡客服時，請儘量提供以下資訊：

  * 問題發生的時間段
  * 受影響的 API 呼叫次數
  * 錯誤資訊或異常現象描述
  * 是否可復現及復現步驟

  這些資訊能幫助管理員更快定位和解決問題。
</Tip>
