> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 價格說明

> 瞭解 API易 和 AI大模型的定價邏輯和優勢，享受比官方更優惠的價格。使用者提供透明、優惠的定價方案，讓您以更低的成本享受頂級 AI 模型服務。

## API易 定價原則

### 1. 模型價格對齊

* **海外大模型**：價格等同於各自官網標準（包括 OpenAI、Claude、Gemini、Grok等）。
* **國內大模型**：價格均低於官網價格（包括 DeepSeek、Qwen、Doubao、Kimi等）
* **稀有模型**：個別新出的海外大模型（比如以前的 gpt-5.2-pro），或申請門檻特別高的模型會有一些上調。但充值贈送的折扣下來和官網相近。

<CardGroup cols={2}>
  <Card title="價格透明、八折起" icon="tags">
    絕大部分模型價格與官方保持一致，消耗視角完全透明，只為用的放心\~
  </Card>

  <Card title="模型齊全、上新快" icon="bell-dot">
    每當各家廠商釋出新模型，API易 總是及時上新。快就是優勢！
  </Card>
</CardGroup>

## 充值優勢

### 2. 固定匯率

<CardGroup cols={2}>
  <Card title="固定匯率" icon="dollar-sign">
    **1:7** 固定匯率

    不隨即時匯率波動，方便計費；可與充值活動疊加享受額外優惠
  </Card>

  <Card title="最低門檻" icon="coins">
    **5 美元**起充

    僅需 35 元人民幣即可開始使用
  </Card>
</CardGroup>

### 3. 充值贈送

<Note>
  **充值越多，優惠越大**

  首充加贈 + 階梯加贈（10%-20%），綜合折扣可達官方**八折**
</Note>

<Card title="檢視完整充值優惠政策" icon="gift" href="/zh-Hant/faq/recharge-promotions">
  瞭解詳細的首充加贈、階梯加贈比例、企業客戶服務等資訊
</Card>

## API易 比官網的更多優勢

更關鍵，相比官方單一賬號，API易 提供更全面的服務：

<CardGroup cols={2}>
  <Card title="無限制使用" icon="infinity">
    * 不限速率
    * 不封號風險
    * 按量計費
  </Card>

  <Card title="模型齊全" icon="layers">
    * 400+ 熱門模型
    * 一鍵切換
    * 持續更新
  </Card>

  <Card title="接入簡單" icon="plug">
    * 統一 API 介面
    * 相容 OpenAI 格式
    * 零遷移成本
  </Card>

  <Card title="企業級服務" icon="shield-check">
    * 專業技術支援
    * 穩定可靠
    * 資料安全保障
  </Card>
</CardGroup>

## 科普：計費基礎知識

### 什麼是『按量計費』？

按量計費（Pay-as-you-go）意味著您只需為實際使用的服務付費，無需預付月費或年費。

<CardGroup cols={2}>
  <Card title="靈活使用" icon="chart-line">
    * 用多少付多少
    * 無最低消費要求
    * 隨時開始或停止
  </Card>

  <Card title="成本可控" icon="gauge">
    * 即時檢視消耗
    * 設定額度預警
    * 精確到每次呼叫
  </Card>
</CardGroup>

### 計費模式優先順序

APIYI 支援兩種計費模式，當同一模型同時支援兩種模式時：

<Warning>
  **按次計費優先於按量計費**

  如果一個模型同時支援按次和按量計費，系統預設使用按次計費。
</Warning>

#### 令牌（API Key）設定影響

您的計費方式也受令牌配置影響：

<CardGroup cols={2}>
  <Card title="僅允許按量計費" icon="sliders-horizontal">
    如果令牌設定為"僅按量計費"，即使模型支援按次計費，也會使用按量計費
  </Card>

  <Card title="預設設定" icon="circle-check">
    令牌預設支援所有計費模式，系統自動選擇（按次優先）
  </Card>
</CardGroup>

### 『按次計費』場景

以下型別的模型通常採用按次計費：

<Tabs>
  <Tab title="圖片生成">
    **適用模型**：

    * sora\_image 系列（逆向模型）
    * flux-kontext-pro（官方模型）
    * DALL-E 系列
    * Midjourney 相關模型

    **計費單位**：每張圖片
  </Tab>

  <Tab title="影片生成">
    **適用模型**：

    * 影片生成類 API
    * 動畫製作模型

    **計費單位**：每個影片/每秒
  </Tab>

  <Tab title="特殊模型">
    **識別方式**：

    * 模型名稱包含 `-all` 字尾的逆向模型
    * 特定功能型模型

    **計費單位**：每次呼叫
  </Tab>
</Tabs>

<Info>
  檢視完整的模型價格表：[APIYI 價格列表](https://api.apiyi.com/account/pricing)
</Info>

### 什麼是 Tokens？

Token 是 AI 模型處理文本的基本單位。理解 Token 有助於您估算和控制成本。

<Info>
  **Token 計算參考**

  * 中文：1 個漢字 ≈ 1-2 個 tokens
  * 英文：1 個單詞 ≈ 1-2 個 tokens
  * 1000 tokens ≈ 750 個英文單詞 ≈ 500 個漢字
</Info>

#### Token 計算示例

```
輸入文本："你好，請幫我寫一個Python函式"
Token 數：約 12-15 個 tokens

輸出文本："def hello_world():\n    print('Hello, World!')"
Token 數：約 15-20 個 tokens

總消耗：輸入 + 輸出 ≈ 30-35 個 tokens
```

### 提示詞與補全

在每次 API 呼叫中，費用由兩部分組成：

<Steps>
  <Step title="提示詞（Prompt）- 輸入 Tokens">
    您傳送給模型的所有內容，包括：

    * 系統提示
    * 使用者問題
    * 上下文資訊
    * 歷史對話（如有）
  </Step>

  <Step title="補全（Completion）- 輸出 Tokens">
    模型生成的回覆內容，包括：

    * 文本回答
    * 程式碼生成
    * 結構化資料
  </Step>
</Steps>

<Warning>
  不同模型的輸入和輸出價格可能不同。通常輸出 tokens 的價格高於輸入 tokens。
</Warning>

## 如何選擇合適的模型？

### 模型選擇策略

<Tabs>
  <Tab title="成本優先">
    **適合場景**：大批次處理、簡單任務、測試開發

    **推薦模型**：

    * gemini-2.5-flash （又快又好）
    * gpt-4.1（可是官方替代 gpt-4.5 的模型）
    * deepseek-v3（國產之光、價效比高）

    **預估成本**：\$0.1-1/百萬 tokens
  </Tab>

  <Tab title="效能優先">
    **適合場景**：複雜推理、專業內容、高品質輸出

    **推薦模型**：

    * gemini-2.5-pro（綜合多模態很強）
    * claude-sonnet-4-20250514-thinking（長文本處理）
    * o3（OpenAI 主力的推理模型，多模態能力）
    * deepseek-r1-0528 (R1最佳化版本)

    **預估成本**：\$3-15/百萬 tokens
  </Tab>

  <Tab title="均衡選擇">
    **適合場景**：日常使用、中等複雜度任務

    **推薦模型**：

    * gpt-4.1（價效比均衡）
    * claude-3-5-haiku-20241022（快速響應）
    * qwen-max（中文最佳化）

    **預估成本**：\$0.5-3/百萬 tokens
  </Tab>
</Tabs>

更多請關注左側「當下熱門模型」頁面。

### 成本預估方法

<Steps>
  <Step title="小樣本測試">
    使用少量樣本（5-10個）進行測試呼叫
  </Step>

  <Step title="檢視消耗日誌">
    在 APIYI 控制台檢視每次呼叫的詳細 token 消耗
  </Step>

  <Step title="計算平均值">
    統計平均每次呼叫的 token 數量
  </Step>

  <Step title="預估總成本">
    平均 tokens × 預計呼叫次數 × 模型單價
  </Step>
</Steps>

<Card title="實踐建議" icon="lightbulb">
  1. 先用便宜的模型測試，驗證可行性
  2. 通過 APIYI 後臺日誌分析實際消耗
  3. 根據任務複雜度選擇合適模型
  4. 最佳化提示詞減少不必要的 token 消耗
</Card>

## 即時價格查詢

<CardGroup cols={2}>
  <Card title="模型價格表" icon="table" href="https://api.apiyi.com/account/pricing">
    檢視所有模型的即時價格

    * 按量計費價格
    * 按次計費價格
    * 優惠幅度對比
  </Card>

  <Card title="費用計算器(開發中)" icon="calculator" href="https://api.apiyi.com">
    快速估算使用成本

    * 輸入預估用量
    * 選擇使用模型
    * 自動計算費用
  </Card>
</CardGroup>

## 常見問題

<AccordionGroup>
  <Accordion title="如何檢視即時價格？">
    登入 [APIYI 控制台](https://api.apiyi.com)，在模型列表頁面可以檢視所有模型的即時價格。
  </Accordion>

  <Accordion title="充值後多久到賬？">
    充值即時到賬，支付成功後立即可以使用。
  </Accordion>

  <Accordion title="是否支援發票？">
    支援開具正規發票，請在控制台提交開票申請。
  </Accordion>

  <Accordion title="有批次採購優惠嗎？">
    企業大額充值可享受更多優惠，請聯絡客服諮詢。
  </Accordion>
</AccordionGroup>

## 開發票說明

### 開票流程

客戶線上充值或對公轉賬成功後，以實付金額開票（所有價格均含稅），需要客戶提供詳細的開票資訊：企業或高校抬頭、稅號等。

<Steps>
  <Step title="提交開票資訊">
    網站後臺頂部導航-開票，自助提交開票表單

    [提交開票申請 →](https://xinqikeji.feishu.cn/share/base/form/shrcns8TS3alZTN2Av1JfkOvmqh)
  </Step>

  <Step title="發票型別">
    * 可開增值稅普通發票（專票需求另外溝通稅點）
    * 開票類目：**資訊科技服務費**或**資料採集費**
    * 可配合開具：採購清單並加蓋公章
  </Step>

  <Step title="交付時間">
    1個工作日左右，通過微信或郵箱傳送電子發票
  </Step>
</Steps>

<Info>
  我們有不少的高校與企業客戶，會配合貴方的各種合理的報銷要求。
</Info>

***

<Card title="立即開始" icon="rocket" href="https://api.apiyi.com">
  註冊賬號，充值即享優惠，體驗 400+ AI 模型
</Card>
