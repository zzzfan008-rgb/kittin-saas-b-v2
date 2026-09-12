> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 100 元人民幣可以兌換多少算力？

> API易僅提供模型服務與對應定價，人民幣與算力的兌換比例由客戶系統自行決定。

## 簡短回答

API易無法直接給出“100 元人民幣可以兌換多少算力”的標準答案。

`算力`通常是客戶在自己平臺中定義的計量單位，其與人民幣的兌換比例、扣減規則和消耗方式均由客戶自行設計。API易作為模型服務提供商，不瞭解也不會干預客戶系統內部的算力規則。

## 為什麼 API易無法確定兌換比例？

API易提供的是模型呼叫服務以及對應的模型價格，本身並不提供：

* 人民幣與算力的換算規則
* 客戶後臺的算力扣減邏輯
* 使用者充值的最終計費單位

因此，是否將 1 元設定為 10 算力、100 算力或其他比例，都由客戶的平臺規則和業務策略決定。

## 如何自行設定算力消耗規則？

如果你計劃在自己的後臺中為使用者配置算力消耗，可以參考以下要點：

* **參考模型價格**：根據 API易的模型定價估算每次呼叫的成本
* **設定兌換比例**：自行決定 1 元對應多少算力
* **設計扣減規則**：按模型、呼叫方式、輸入輸出 Token 等維度配置消耗
* **結合運營策略**：根據你的服務定位和利潤空間進行動態調整

<Info>
  API易只提供模型呼叫本身的價格資訊，不提供客戶的算力換算建議。請基於你自己的產品定位、運營成本和定價策略進行配置。
</Info>

## 模型價格說明

API易的模型價格大致分為以下幾類：

* **圖片模型**：部分模型提供特價
* **文本模型**：價格通常與模型官網保持一致
* **充值優惠**：更多折扣請關注平臺當前的充值活動

具體價格以登入 API易 平臺後展示的為準。

## 相關問題

<CardGroup cols={2}>
  <Card title="模型倍率說明" icon="calculator" href="/zh-Hant/faq/model-multiplier">
    瞭解不同模型的計費倍率與 Token 換算方式。
  </Card>

  <Card title="充值方式" icon="dollar-sign" href="/zh-Hant/faq/payment-methods">
    檢視 API易 支援的充值方式與到賬時效。
  </Card>

  <Card title="充值優惠" icon="gift" href="/zh-Hant/faq/recharge-promotions">
    瞭解當前可用的充值活動與折扣規則。
  </Card>

  <Card title="餘額不足怎麼辦？" icon="credit-card" href="/zh-Hant/faq/balance-insufficient">
    處理呼叫過程中餘額不足的提示與建議。
  </Card>
</CardGroup>
