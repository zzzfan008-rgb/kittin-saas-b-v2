> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI 有 SLA 保障嗎？

> API易提供務實的 SLA 保障：大用量影像客戶的異常計費補償、我方問題導致損失的額度補發，企業客戶還可在合同中約定 SLA 內容與賠償上限。

## 簡短回答

**有，按需求提供。**

客觀地說，當前 AI 行業沒有任何廠商能承諾 99.99% 的 SLA（連 OpenAI、Claude 原廠也做不到）。API易 不做無法兌現的承諾，而是提供**能真正落地的保障**：對大用量影像客戶的異常計費補償、我方問題導致損失的額度補發，以及企業合同內可約定的 SLA 與賠償上限。

## 一個客觀前提

<Info>
  **為什麼不直接承諾 99.99%？**

  AI 發展日新月異，上游模型頻繁更新、限流、調整策略。**即便是 OpenAI、Claude 原廠，也無法做到 99.99% 的 SLA**，這是整個行業的客觀事實。

  與其給出無法兌現的數字，我們更願意提供**清晰、可執行**的保障機制，確保客戶在出現問題時不會白白損失。
</Info>

## 我們提供的 SLA 保障

<CardGroup cols={2}>
  <Card title="大用量影像客戶異常計費補償" icon="image">
    針對 **Nano Banana Pro / 2**、**GPT-Image-2** 大用量客戶（月消耗 \$10,000 以上），對明顯異常的計費（如超時卻計費）核對並補償。
  </Card>

  <Card title="我方問題額度補發" icon="rotate-ccw">
    明顯由我方原因（如後端伺服器異常）造成客戶損失的，我們**統一匯出日誌、補發額度**，讓使用者不白白損失。
  </Card>

  <Card title="企業合同約定 SLA" icon="file-pen">
    企業客戶可在合同中**約定 SLA 保障內容與賠償上限**，對雙方都是一份明確的保障。
  </Card>

  <Card title="即時狀態透明" icon="radio-tower">
    服務狀態與異常公告在「即時動態」公開發布，便於客戶隨時瞭解上游與平臺狀況。
  </Card>
</CardGroup>

### 1. 大用量影像客戶的異常計費補償

針對 **Nano Banana Pro / 2**、**GPT-Image-2** 等影像模型的大用量客戶（**月消耗 \$10,000（約 1 萬美金）以上**可參與），我們對**明顯異常的計費**提供補償保障。

**舉個例子**：影像請求**異常超時**（例如超過 300 秒）但系統仍按出圖**計費**了——這類明顯異常的計費，我們會核對日誌並予以補償，不讓大用量客戶白白買單。

<Note>
  **這只是一個示例場景，並非出圖時限承諾。**

  我們**無法承諾"300 秒內一定出圖、否則賠付"**——AI 影像生成受上游波動影響，無法對出圖速度做硬性承諾。這項保障針對的是**明顯異常計費造成的損失**，而不是保證生成速度。具體範圍請聯絡客服確認。
</Note>

### 2. 我方問題導致損失的額度補發

如果損失是**明顯由我方原因造成**的，我們會主動補償。典型場景：

* **後端伺服器異常**導致客戶額度損失
* **圖片模型異常超時**仍返回了資料並計費

**我們的承諾**：對於明顯的我方問題對客戶造成影響的情況，我們會**統一匯出日誌、核對受影響範圍，並補發額度**給受影響的客戶，確保使用者不會白白損失。

<Warning>
  **界定原則**：該補發針對的是**明顯可歸因於我方的問題**（如平臺後端異常）。上游官方的內容稽核攔截、上游限流等**非我方可控因素**，處理方式以對應說明為準（例如部分上游稽核攔截本身不計費）。
</Warning>

### 3. 企業合同內約定 SLA

對於企業客戶，可以在**合同中明確約定** SLA 的具體內容，包括：

* 保障範圍與可用性指標
* 故障響應與處理時效
* **賠償上限**等條款

這樣，SLA 保障與責任邊界在簽約時即清晰確定，**對客戶和 API易 雙方都是一份明確的保障**。

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼不能保證 99.99% 的 SLA？">
    AI 行業上游模型頻繁更新、限流和調整，**連 OpenAI、Claude 原廠都無法做到 99.99%**，這是客觀事實。我們不做無法兌現的承諾，而是用清晰可執行的補償機制來保障客戶利益。
  </Accordion>

  <Accordion title="大用量影像客戶的異常計費補償怎麼參與？">
    該保障面向 **Nano Banana Pro / 2、GPT-Image-2 等影像模型的大用量客戶**，**月消耗 \$10,000 以上**可參與，針對明顯異常的計費（例如請求超時卻仍按出圖計費）進行核對補償。**這不是"300 秒內必出圖否則賠付"的承諾**，而是對異常計費損失的補償。具體請聯絡客服開通與對接。
  </Accordion>

  <Accordion title="我方問題導致的損失怎麼補？">
    對於明顯由我方原因（如後端伺服器異常、圖片模型異常超時返回資料）造成的損失，我們會**統一匯出日誌、核對受影響範圍並補發額度**，讓使用者不白白損失。
  </Accordion>

  <Accordion title="企業可以在合同里約定 SLA 嗎？">
    可以。企業客戶可在合同中約定 **SLA 保障內容與賠償上限**，讓保障範圍和責任邊界在簽約時就清晰確定，對雙方都是保障。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="即時動態" icon="radio-tower" href="/live/index">
    服務狀態與異常公告
  </Card>

  <Card title="企業客戶如何充值？" icon="landmark" href="/zh-Hant/faq/enterprise-recharge">
    對公充值與合同簽訂
  </Card>

  <Card title="退款政策" icon="rotate-ccw" href="/zh-Hant/faq/refund-policy">
    原路退款規則與申請流程
  </Card>

  <Card title="企業客戶和個人使用者有什麼區別？" icon="building-2" href="/zh-Hant/faq/enterprise-vs-individual">
    企業賬號、多令牌與內部共享
  </Card>
</CardGroup>

## 聯絡我們

<Card title="企業微信客服" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  SLA 保障開通、合同條款約定、額度補發等需求，歡迎聯絡：

  * [聯絡企業微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * 郵箱：[hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
