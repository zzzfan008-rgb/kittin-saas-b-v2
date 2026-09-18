> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 價格和官網一樣，為什麼選擇 API易？

> 文本模型與官方同價，但充值加贈最高 20%（相當於約 83 折），可疊加分組折扣，再加上官方直連、快取計費、免海外賬號等優勢，綜合成本和體驗優於直連官方

## 簡短回答

文本（含多模態）模型的**單價確實與官網一致**，但實際成本更低：充值加贈最高 20%（相當於約 83 折，即 17% off），還可疊加部分模型分組的 95 折（5% off）優惠，疊加後綜合成本可低至官網的 79 折左右。此外，官方直連轉發、快取計費支援、一個 Key 呼叫全部模型、免海外賬號和信用卡等，都是直連官方無法同時獲得的優勢。

## 優惠從哪裡來

<Card title="💰 同價 ≠ 同成本" icon="calculator">
  API易 不在單價上做文章——文本模型按官網原價計費，保證計費透明、不摻水。真正的優惠來自**充值加贈**和**分組折扣**，兩者可以疊加。
</Card>

### 1. 充值階梯加贈（最高 20％）

單次充值 \$100 起即可享受 10%-20% 的階梯加贈：

| 單次充值金額                 | 加贈比例    | 等效折扣                |
| ---------------------- | ------- | ------------------- |
| \$100 ≤ X \< \$500     | 10%     | 約 91 折（9% off）      |
| \$500 ≤ X \< \$1,000   | 12%     | 約 89 折（11% off）     |
| \$1,000 ≤ X \< \$3,000 | 15%     | 約 87 折（13% off）     |
| X ≥ \$3,000            | **20%** | **約 83 折（17% off）** |

以 20% 加贈為例：充值 \$3,000 到賬 \$3,600，相當於按官網價格的 1/1.2 ≈ 83.3% 付費，即約 17% 的折扣。

<Card title="檢視充值加贈詳情" icon="gift" href="/zh-Hant/faq/recharge-promotions">
  首充加贈、階梯加贈比例、發放時間等完整說明
</Card>

### 2. 分組折扣（可疊加）

部分模型分組另有折扣，例如某些專屬分組享 **95 折（5% off）**，與充值加贈**可以疊加**：

* 充值加贈 20% → 實際成本約為官網的 83.3%
* 再疊加分組 95 折 → 83.3% × 0.95 ≈ **官網的 79 折左右**

<Card title="瞭解分組與倍率" icon="layers" href="/zh-Hant/faq/groups-explained">
  什麼是模型分組？不同分組的價格如何計算？
</Card>

## 文本模型如何計費

文本模型按 token 用量計費，公式如下：

```text theme={null}
單次請求費用 = 輸入 tokens × 輸入單價 + 輸出 tokens × 輸出單價
```

各模型的輸入/輸出單價與官網一致，詳見[模型價格總覽](/zh-Hant/pricing)。

<Note>
  **影像和影片模型**按次計費（而非按 token），具體價格請在網站後臺的「模型價格」頁面查詢。充值加贈同樣適用於這些模型。
</Note>

## 除了價格，還有哪些優勢

<CardGroup cols={2}>
  <Card title="官方直連轉發" icon="zap">
    請求直連官方渠道，模型能力、響應品質與官網一致，不降智、不摻水
  </Card>

  <Card title="快取計費支援" icon="database">
    OpenAI、Claude、Gemini 三大廠商的快取計費均支援，快取命中後輸入費用大幅下降（命中率因廠商和使用方式而異）
  </Card>

  <Card title="一個 Key 全模型" icon="key">
    一個 API Key 即可呼叫 OpenAI、Claude、Gemini 等全部主流模型，無需分別註冊和維護多個官方賬號
  </Card>

  <Card title="免海外賬號和信用卡" icon="credit-card">
    支援支付寶、微信等本地支付方式，人民幣按固定匯率 1:7 充值，無需海外信用卡
  </Card>

  <Card title="降低封號風險" icon="shield">
    無需自行維護官方賬號，不必擔心因支付方式、網路環境等原因被官方風控封號
  </Card>

  <Card title="開箱即用" icon="rocket">
    相容 OpenAI 介面格式，主流 SDK 和工具替換 Base URL 即可使用，配套中文文件和客服支援
  </Card>
</CardGroup>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼不直接把單價定得比官網低？">
    單價與官網一致是**官方直連、計費透明**的保證——低於官方成本的單價往往意味著中轉降質或逆向通道。API易 選擇把優惠放在充值加贈上：比例公開、對所有客戶一視同仁，實際成本依然低於直連官方。
  </Accordion>

  <Accordion title="加贈額度和充值本金有區別嗎？">
    使用上沒有區別：加贈額度與本金一樣**全站通用**，適用於文本、影像、影片等所有模型，有效期規則也與本金一致（自充值之日起 365 天，再次充值重置）。唯一區別是加贈部分不支援退款。詳見 [額度有效期說明](/zh-Hant/faq/recharge-promotions)。
  </Accordion>

  <Accordion title="影像、影片模型怎麼計費？">
    影像和影片模型**按次計費**（每次生成收取固定費用），而非按 token 計費。具體價格請登入網站後臺，在「模型價格」頁面查詢。充值加贈同樣可以攤薄這部分成本。
  </Accordion>

  <Accordion title="充值加贈和分組折扣怎麼疊加計算？">
    兩者獨立生效、可以疊加：

    * **充值加贈 20%**：充 \$3,000 到賬 \$3,600，等效約 83 折
    * **分組 95 折**：該分組下的呼叫按 95% 計費
    * **疊加後**：83.3% × 0.95 ≈ 79%，即綜合約為官網價格的 79 折
  </Accordion>
</AccordionGroup>

## 相關文件

* [網站有什麼充值活動嗎？](/zh-Hant/faq/recharge-promotions)
* [模型倍率是什麼意思？](/zh-Hant/faq/model-multiplier)
* [快取計費說明](/zh-Hant/faq/cache-billing)
* [模型分組說明](/zh-Hant/faq/groups-explained)
* [如何充值餘額](/zh-Hant/faq/payment-methods)

<Tip>
  **省錢建議**：單次充值 \$3,000 以上可拿到 20% 加贈（約 83 折），再選擇帶折扣的模型分組，綜合成本最低。充值額度有效期為 365 天（再次充值重置全部餘額有效期），請結合一年內的預計用量選擇檔位，詳見 [額度有效期說明](/zh-Hant/faq/recharge-promotions)。
</Tip>
