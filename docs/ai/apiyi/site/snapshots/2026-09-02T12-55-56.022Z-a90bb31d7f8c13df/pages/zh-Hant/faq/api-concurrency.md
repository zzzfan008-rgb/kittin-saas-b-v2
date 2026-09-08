> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API 可以開多少併發？

> 瞭解不同型別模型的併發限制規則，以及如何申請更高併發配額

## 簡短回答

**併發限制因模型型別而異**，文本模型併發最高，圖片模型有適度控制。

<Info>
  **重要說明**

  併發限制是針對**單一模型**，而不是整個賬號。例如，Nano Banana Pro 模型有 30 個併發，不影響其他模型的併發使用。
</Info>

## 不同模型型別的併發限制

<CardGroup cols={3}>
  <Card title="文本類模型" icon="file-text">
    **預設：50 次/秒**

    * ✅ 高併發支援
    * ✅ 適合批次處理
    * 🔓 可申請更高額度
  </Card>

  <Card title="影片非同步模型" icon="video">
    **預設：高併發**

    * ✅ 非同步處理機制
    * ✅ 支援大規模呼叫
    * 📊 適合批次影片生成
  </Card>

  <Card title="圖片類模型" icon="image">
    **預設：30 次/秒**

    * ⚠️ 有併發控制
    * 📦 Base64 大數據傳輸
    * 🔓 可申請調整
  </Card>
</CardGroup>

## 為什麼圖片模型有併發控制？

<Warning>
  **技術原因**

  圖片生成 API 使用 **Base64 編碼**傳輸影像資料，單次請求資料體積較大（通常 500KB-5MB）。為保證服務穩定性和響應速度，需要適度控制併發。

  **示例**：Nano Banana Pro 模型預設 30 個併發，已滿足大多數使用場景。
</Warning>

## 併發計算方式

### 按單一模型計算

併發限制是針對**每個具體模型**，而非整個賬號：

| 場景     | 併發計算方式                          |
| ------ | ------------------------------- |
| 呼叫同一模型 | 受該模型併發限制（如 Nano Banana Pro 30次） |
| 呼叫不同模型 | 各模型獨立計算，互不影響                    |
| 多個令牌   | 每個令牌獨立計算併發                      |

<Tip>
  **實際示例**

  假設您同時使用：

  * Nano Banana Pro（圖片）：30 個併發
  * GPT-4o mini（文本）：50 個併發
  * FLUX.1 Pro（圖片）：30 個併發

  **總計可用併發**：110+ 次（各模型獨立）
</Tip>

## 如何申請更高併發？

### 個人使用者

<Steps>
  <Step title="評估實際需求">
    確定您需要的併發量級和使用場景
  </Step>

  <Step title="聯絡客服申請">
    通過[企業微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)說明需求
  </Step>

  <Step title="技術評估">
    我們會根據您的使用場景和歷史資料評估
  </Step>

  <Step title="調整配額">
    稽核通過後，為您的令牌調整併發限制
  </Step>
</Steps>

### 企業客戶

<Info>
  **專線保障服務**

  企業客戶可申請專線保障，享受：

  * 🚀 **更高併發配額**：根據業務需求定製
  * 🔒 **獨立資源池**：不受公共流量影響
  * ⚡ **優先排程**：保證響應速度
  * 📞 **專屬技術支援**：一對一服務

  聯絡我們瞭解企業服務方案。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼文本模型併發比圖片模型高？">
    文本模型的請求和響應資料量較小（通常幾 KB），而圖片模型傳輸 Base64 編碼的影像資料（通常 500KB-5MB），為保證整體服務品質需要控制併發。
  </Accordion>

  <Accordion title="如何知道當前併發配額？">
    可以通過以下方式檢視：

    * 後臺控制台檢視令牌配置
    * API 響應頭中的 Rate Limit 資訊
    * 聯絡客服查詢具體配額
  </Accordion>

  <Accordion title="超出併發限制會怎樣？">
    超出併發限制時，API 會返回 `429 Too Many Requests` 錯誤。建議：

    * 實現請求佇列管理
    * 新增重試機制（指數退避）
    * 申請更高併發配額
  </Accordion>

  <Accordion title="不同令牌的併發是否共享？">
    不共享。每個令牌有獨立的併發配額，互不影響。如需更高總併發，可以建立多個令牌分散請求。
  </Accordion>

  <Accordion title="調整併發配額需要額外費用嗎？">
    一般情況下，合理的併發調整**不收取額外費用**。但極高併發或專線服務可能涉及企業定製方案，具體請諮詢客服。
  </Accordion>
</AccordionGroup>

## 併發最佳化建議

<CardGroup cols={2}>
  <Card title="使用請求佇列" icon="list">
    實現本地佇列管理，控制同時傳送的請求數量，避免超限
  </Card>

  <Card title="錯誤重試機制" icon="refresh-cw">
    遇到 429 錯誤時，使用指數退避策略重試
  </Card>

  <Card title="多令牌分散" icon="key">
    建立多個令牌，將請求分散到不同令牌，提升總併發
  </Card>

  <Card title="非同步處理優先" icon="clock">
    對於非即時場景，優先使用非同步 API（如影片生成）
  </Card>
</CardGroup>

## 聯絡我們

如需申請更高併發配額或諮詢企業專線服務：

<CardGroup cols={3}>
  <Card title="郵件支援" icon="mail">
    [feedback@apiyi.com](mailto:feedback@apiyi.com)

    詳細描述您的併發需求
  </Card>

  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    快速響應，即時溝通
  </Card>

  <Card title="Telegram" icon="send">
    @apiyi001

    即時訊息，高效解答
  </Card>
</CardGroup>

<Tip>
  **申請時請提供**：

  * 📊 **使用場景**：具體應用（如電商批量出圖、內容稽核等）
  * 📈 **預期併發**：需要的併發量級
  * 🕐 **高峰時段**：主要使用時間段
  * 📜 **歷史資料**：當前呼叫量和頻率

  這些資訊有助於我們為您提供最合適的併發配額方案。
</Tip>
