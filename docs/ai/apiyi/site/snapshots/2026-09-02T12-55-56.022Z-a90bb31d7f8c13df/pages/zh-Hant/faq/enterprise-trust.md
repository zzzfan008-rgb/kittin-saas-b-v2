> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API易 的企業服務值得信任嗎？模型保真嗎？

> 我們是純透明官轉代理，不路由、不降智、不偷換模型。本文從上線時長、流量資料、定價邏輯、資料安全等角度，給出可自行驗證的信任依據。

## 簡短回答

**值得，而且歡迎您自己驗證，而不只是聽我們口頭保證。**

API易 是**純透明官轉代理**：請求只走可溯源的官方通道（如 Claude 預設走 AWS Bedrock 官方接入），**不路由到便宜模型、不降智、不偷換、不留存您的資料**。我們不是低價平臺——低價的代價往往是您看不見的"摻水"。下面給出幾條**可客觀核驗**的信任依據，您也可以先用小額度實測，逐步建立信任。

<Info>
  **我們完全理解這個擔憂。**

  "中轉站會不會把我的請求偷偷路由到便宜模型？"——這是每一位認真選型的企業都會問的問題。比起承諾，我們更願意提供**可以驗證的依據**和**可以實測的方式**。
</Info>

## 我們為什麼不會"偷換便宜模型"

核心原因很簡單：**我們的商業模式不靠摻水賺錢。**

<Warning>
  **"摻水"是低價平臺才需要做的事**

  逆向破解、共享賬號、模型降智、把貴模型悄悄替換成便宜模型——這些手段都能把價格壓下來，但用的時候您完全不知道通道里摻了什麼：輸出品質時好時壞、隨時可能斷供，甚至您的對話資料被轉賣也察覺不到。

  **價格越低，往往越不透明。** 低價平臺幾乎一定有您看不見的代價。
</Warning>

<Info>
  **API易 走的是另一條路：純正官轉，寧可貴一點也要乾淨**

  以 Claude 為例：我們預設走 **AWS Bedrock 官方接入**，替補走 **Anthropic 官方 Key 直連**，兩條通道都是純官轉、可溯源、按量計費、不留存資料。綜合成本約官網價 **85 折**（含充值加贈後約為 79–86 折區間）。

  我們的省錢來自**高快取命中**（Claude 原生格式下的 Prompt Cache）和充值加贈，**不是來自降智或替換模型**。詳見 [Claude API 基礎說明](/zh-Hant/api-capabilities/claude)。
</Info>

## 5 個可參考的信任依據

<CardGroup cols={2}>
  <Card title="上線滿 2 年、月訪問約 14.5 萬" icon="chart-line">
    非新站點，已有一批長期複用的客戶。
  </Card>

  <Card title="持續用心運維的文件中心" icon="book-open">
    上百篇文件與 FAQ 持續更新，是認真做平臺的直接體現。
  </Card>

  <Card title="不走低價路線" icon="shield-check">
    純正官轉、約 85 折，寧可貴一點也要乾淨。
  </Card>

  <Card title="純透明代理、不存資料" icon="lock">
    只做安全轉發，不留存您的對話內容。
  </Card>
</CardGroup>

### 1. 上線時長與流量水平

API易 **上線已滿 2 年**，並非臨時搭建的新站點，背後是一批長期合作、持續複用的客戶。第三方流量監測顯示 `api.apiyi.com` **月訪問約 14.5 萬、域名註冊滿 2 年**：

<img src="https://mintcdn.com/apiyillc/dOkZIz7MGldG6ZGu/images/apiyi-traffic-similarweb.png?fit=max&auto=format&n=dOkZIz7MGldG6ZGu&q=85&s=81086e48816ad5859f399a3b78a03eb7" alt="第三方流量統計：api.apiyi.com 月訪問約 14.5 萬、域名註冊滿 2 年" style={{maxWidth: "560px"}} width="1016" height="1212" data-path="images/apiyi-traffic-similarweb.png" />

<Note>
  資料來自第三方流量監測工具，僅供參考。一個跑路或玩"摻水"套路的平臺，很難維持兩年穩定的訪問量和持續的客戶複用。
</Note>

### 2. 文件中心的專業度

您正在閱讀的這套文件中心，本身就是平臺是否"用心運維"的直接證據：上百篇 API 手冊、模型說明、FAQ 持續更新，價格口徑、計費規則、通道說明都擺在明處。**一個打算賺快錢的平臺，不會花精力把這些講清楚。**

### 3. 價格上，我們不是低價平臺

一句話理解我們的定價：**約 85 折用純官轉的 AWS Claude，品質可靠，靠高快取命中省錢。**

我們並不是賣得貴，而是把價格守在"穩定可靠"與"價格合理"之間那條線上——**不碰來路不明的便宜貨**。如果一個平臺的價格低到離譜，請務必警惕：那部分差價，很可能就是用您看不見的方式補回來的。

詳見 [Claude API 基礎說明](/zh-Hant/api-capabilities/claude)。

### 4. 資料安全：純透明代理，不留存資料

API易 是**純透明代理**：我們的職責是安全、高效地把請求轉發給上游官方通道，**不留存您的對話內容**。這一點既是隱私保障，也從根本上決定了我們沒有動機去"動"您的請求。

詳見 [API易如何保障資料安全？](/zh-Hant/faq/data-security)。

### 5. 信任是逐步建立的

我們不要求您一上來就大額投入。**信任應該建立在驗證之上**：

<Tip>
  **建議的合作節奏**

  1. 先充 **\$10 小額度**，跑通您真實的業務場景；
  2. 對比官方輸出、檢視呼叫日誌，確認品質與計費符合預期；
  3. 確認無誤後，再逐步加量、長期合作。

  這樣您的每一步投入都建立在已驗證的結果之上，風險可控。
</Tip>

## 如何自行驗證"模型是否保真"

與其只聽保證，您完全可以**自己動手核驗**：

<Steps>
  <Step title="小額度實測對比">
    用 **\$10 小額度**跑真實任務，把輸出與官方渠道做橫向對比，看品質是否一致、穩定。
  </Step>

  <Step title="檢視呼叫日誌">
    在控制台檢視每次呼叫的模型、tokens 消耗與計費明細，做到賬目透明、可追溯。詳見 [如何檢視呼叫日誌？](/zh-Hant/faq/call-logs)。
  </Step>

  <Step title="驗證快取與計費">
    Claude 使用 **Anthropic 原生格式**（`/v1/messages`）時可觸發快取計費，長上下文/重複 system prompt 場景賬單會明顯降低——這是官轉通道才有的特性。詳見 [Claude API 基礎說明](/zh-Hant/api-capabilities/claude)。
  </Step>
</Steps>

<Note>
  如果您是月消耗較大的企業客戶，也可以聯絡我們約定 SLA 保障與額度補償條款，把責任邊界寫進合同。詳見 [APIYI 有 SLA 保障嗎？](/zh-Hant/faq/sla-guarantee)。
</Note>

## 相關文件

<CardGroup cols={2}>
  <Card title="API易如何保障資料安全？" icon="lock" href="/zh-Hant/faq/data-security">
    純透明代理、最小化儲存與訪問控制
  </Card>

  <Card title="Claude API 基礎說明" icon="sparkles" href="/zh-Hant/api-capabilities/claude">
    純官轉 AWS Claude、約 85 折與快取計費
  </Card>

  <Card title="APIYI 有 SLA 保障嗎？" icon="shield-check" href="/zh-Hant/faq/sla-guarantee">
    異常計費補償與企業合同約定
  </Card>

  <Card title="企業客戶和個人使用者有什麼區別？" icon="building-2" href="/zh-Hant/faq/enterprise-vs-individual">
    企業賬號、多令牌與內部共享
  </Card>
</CardGroup>

## 聯絡我們

<Card title="企業微信客服" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  企業選型評估、小額測試對接、SLA 與合同條款等需求，歡迎聯絡：

  * [聯絡企業微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * 郵箱：[hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
