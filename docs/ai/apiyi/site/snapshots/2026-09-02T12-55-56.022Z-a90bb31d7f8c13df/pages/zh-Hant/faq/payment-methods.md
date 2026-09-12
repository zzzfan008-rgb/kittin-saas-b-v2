> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI 支援哪些充值方式？

> API易 支援微信 / 支付寶 / USDT / Stripe（外幣信用卡）等線上自助充值，以及 PayPal / Wise / Mercury Bank / 對公轉賬等人工充值，覆蓋國內外個人與企業使用者，支援開具中文增值稅發票與美國 Invoice。

## 簡短回答

API易 目前共支援 **7 種主流充值方式**，分兩類：

* **🟢 線上自助充值**（站內一鍵到賬）：**微信、支付寶、USDT、Stripe（外幣信用卡）**
* **🛠️ 人工充值**（聯絡客服後臺到賬）：**PayPal、Wise、Mercury Bank、對公轉賬**

可開具 **中國公司增值稅發票** 或 **美國公司 Invoice**（法律實體涵蓋中國 + 美國雙主體），適配國內外財務流程。

## 支付方式總覽

| 支付方式             | 操作辦法                                                            | 充值方式                           | 適用人群        |
| ---------------- | --------------------------------------------------------------- | ------------------------------ | ----------- |
| **微信**           | 站內線上，僅支援**中國使用者**                                               | 線上自助                           | 國內個人        |
| **支付寶**          | 站內線上，支援**國際版支付寶**、海外賬號付款                                        | 線上自助                           | 國內 + 海外華人   |
| **USDT**         | 站內線上，加密貨幣，**全球使用者**均可支付；手續費約 **2 USDT/次**（如自備能量更省，大額轉賬同樣為一次性費用） | 線上自助                           | 全球，幣圈使用者    |
| **Stripe**       | 站內線上，**外幣信用卡**（即時到賬，3D Secure 風控）；**單筆最低 \$50**                 | 線上自助                           | 海外個人 / 企業   |
| **PayPal**       | 轉賬到指定賬戶地址，**手續費約 6%**，使用者自理                                     | 聯絡客服給 PayPal 賬號，人工充值           | 海外個人        |
| **Wise**         | 轉賬到指定賬戶地址，WISE 收款                                               | 聯絡客服給 Wise 賬號，人工充值             | 海外企業 / 跨境個人 |
| **Mercury Bank** | 轉賬到指定賬戶地址，**一般無手續費**，**自動開具 Invoice**                           | 聯絡客服給銀行付款連結（Payment Link），人工充值 | 海外企業首選      |

## 🟢 線上自助充值（即時到賬）

<CardGroup cols={2}>
  <Card title="微信支付" icon="wechat" iconType="brands">
    站內一鍵掃碼支付，**僅支援中國大陸使用者**。最常用、最快捷的國內充值方式。
  </Card>

  <Card title="支付寶" icon="alipay" iconType="brands">
    站內線上，**國際版支付寶 / 海外賬號**均可付款，國內外華人使用者友好。
  </Card>

  <Card title="USDT 加密貨幣" icon="bitcoin">
    站內線上，**全球可用、24/7 不限地區**。手續費約 **2 USDT/次**，大額轉賬同樣為單次費用，自備 TRON 能量可進一步壓縮成本。

    支援網路：**TRC20**（推薦）、**Solana** 等主流公鏈。
  </Card>

  <Card title="Stripe（外幣信用卡）" icon="credit-card">
    站內線上，支援**外幣信用卡**支付，**即時到賬**，自帶 3D Secure 風控。請使用**公司 / 個人 / 學校**名下的實名信用卡。

    ⚠️ **單筆最低 \$50**：充值金額未達 \$50 時，Stripe 通道不可選。

    📖 [門檻調整公告](/live/2026-07/stripe-minimum-topup-50) · [上線公告](/live/2026-05/stripe-payment-launch)
  </Card>
</CardGroup>

<Warning>
  **Stripe 安全提示**：Stripe 風控等級高，**不安全 / 非實名的信用卡會被直接拒絕**；**惡意支付**（盜卡、拒付、欺詐測試等）的賬號將被**封號處理**。請勿用他人卡片或測試卡嘗試。
</Warning>

## 🛠️ 人工充值（聯絡客服後臺入賬）

<CardGroup cols={2}>
  <Card title="PayPal" icon="paypal" iconType="brands">
    轉賬到客服提供的 PayPal 賬號。**手續費約 6%，由使用者自理**（即轉賬金額需含手續費）。適合海外個人小額充值。
  </Card>

  <Card title="Wise（原 TransferWise）" icon="globe">
    轉賬到客服提供的 Wise 收款賬戶。匯率透明、跨境到賬快，適合**跨境工作者與海外企業**。
  </Card>

  <Card title="Mercury Bank（推薦海外企業）" icon="landmark">
    轉賬到客服提供的銀行賬戶（含 Payment Link）。**一般無手續費**，**到賬後自動開具 Invoice**，海外企業財務最友好。
  </Card>

  <Card title="對公轉賬（銀行電匯）" icon="building">
    適合**中國公司客戶**或**通過中國貿易伙伴付款的海外企業**（詳見下方跨境方案）。
  </Card>
</CardGroup>

<Tip>
  **人工充值流程**：1️⃣ 聯絡客服獲取收款賬戶 → 2️⃣ 完成轉賬 → 3️⃣ 提供轉賬憑證 / Hash / Payment Link 截圖 → 4️⃣ 客服核對後充值到賬。
</Tip>

## 🌏 跨境貿易 / 海外客戶付款方案

對於**俄羅斯、中亞、東南亞**等需要走中國貿易伙伴付款的海外客戶，我們提供完整的合規付款鏈路：

<Steps>
  <Step title="與中國公司簽訂合同">
    海外客戶與 API易 的**中國法律實體**簽訂採購 / 服務合同，明確金額、幣種、付款方式。
  </Step>

  <Step title="對公付款（銀行轉賬）">
    通過對公賬戶\*\*銀行轉賬（電匯 / SWIFT / RUB 跨境結算）\*\*支付服務費至我方對公賬戶。
  </Step>

  <Step title="人工充值到 APIYI 賬戶">
    我方財務收到費用後，**人工充值到客戶的 APIYI 後臺賬戶**，餘額即可用於 API 呼叫。
  </Step>

  <Step title="開具發票 / Invoice">
    可開具**中國增值稅發票**（中國法律實體）或**美國 Invoice**（美國法律實體），適配客戶當地財務報銷需求。
  </Step>
</Steps>

<Info>
  **法律實體說明**：API易 的運營主體涵蓋 **中國公司 + 美國公司** 兩個法律實體，可根據客戶所在地與財務需求靈活開票。具體抬頭、稅號請聯絡客服獲取。
</Info>

## 🧾 發票 / Invoice 開具

| 開票型別                | 適用法律實體 | 適用場景              |
| ------------------- | ------ | ----------------- |
| **中國增值稅普通 / 專用發票**  | 中國公司   | 國內企業財務報銷          |
| **美國 Invoice（PDF）** | 美國公司   | 海外企業 / 跨境貿易 / 走外匯 |

<Tip>
  **開票提醒**：發票需求請在**付款時或付款前**告知客服（提供抬頭 / 稅號 / 郵箱），方便我們一次開具完整；後補開票可能涉及跨賬期處理。
</Tip>

## 充值優惠與贈送

不同充值通道與金額可疊加**首充加贈 / 充值贈送活動**，最高可達近 8 折效果。

📖 詳見：[充值優惠政策](/zh-Hant/faq/recharge-promotions)

## 常見問題

<AccordionGroup>
  <Accordion title="Stripe 支付報錯 / 信用卡被拒怎麼辦？">
    Stripe 風控較嚴，可能的原因：

    * **充值金額未達 \$50**（Stripe 通道僅在單筆 \$50 及以上時可選）
    * **使用了人民幣信用卡**（Stripe 不接受 CNY 卡）
    * **未實名 / 非本人 / 非企業 / 非學校**名下的信用卡
    * **3D Secure 驗證未通過**
    * 卡片或賬號被風控標記

    建議改用其他通道（支付寶國際 / Wise / Mercury Bank），或更換合規的實名外幣信用卡。**請勿用他人卡或測試卡反覆嘗試，避免觸發賬號風控。**
  </Accordion>

  <Accordion title="對公轉賬多久到賬？">
    工作日通常**當日內**人工充值到賬（依銀行清算時間，部分跨境電匯可能 T+1 \~ T+3）。請在轉賬後**主動將憑證發給客服**，加快入賬。
  </Accordion>

  <Accordion title="USDT 充值要選哪個網路？">
    推薦 **TRC20**（TRON 網路），手續費低、到賬快；也支援 **Solana** 等主流公鏈。**請務必通過客服 / 站內介面獲取最新收款地址**，不要相信任何第三方來源。
  </Accordion>

  <Accordion title="可以開具中文增值稅專用發票嗎？">
    可以。中國法律實體支援**增值稅普通發票**和**增值稅專用發票**，請在付款時把**公司抬頭、稅號、開戶行、地址電話**等資訊一併告知客服。
  </Accordion>

  <Accordion title="俄羅斯 / 中亞客戶沒有信用卡也沒有支付寶怎麼辦？">
    走 **對公轉賬方案**：與我方**中國法律實體簽訂合同**，通過本地貿易公司或銀行 SWIFT 電匯人民幣 / 美元 / 盧布到我方對公賬戶，到賬後我們**人工充值到您的 APIYI 後臺賬戶**並開具中國增值稅發票或美國 Invoice。具體流程聯絡客服。
  </Accordion>

  <Accordion title="是否支援其他加密貨幣？BTC / ETH？">
    目前預設支援的穩定幣是 **USDT**（TRC20 / Solana）。如需 USDC、BTC、ETH 等其他幣種，請聯絡客服評估。
  </Accordion>

  <Accordion title="有最低 / 最高充值限額嗎？">
    **最低充值金額**：

    * **Stripe**：單筆 **\$50** 起（受 Stripe 手續費與結算結構影響，2026/7/28 起調整，未達該金額時通道不可選）
    * **其他支付方式**：單筆 **\$5** 起，不受影響

    **最高**：各通道無統一硬性限額，但部分通道（如 PayPal、Stripe）單筆有上游風控閾值；**大額（建議 ≥ 10000 元 / \$1500）** 建議先聯絡客服走對公或 Mercury Bank 通道，省手續費、便於開票。
  </Accordion>
</AccordionGroup>

## 聯絡客服 / 獲取收款賬戶

<CardGroup cols={2}>
  <Card title="企業微信客服（推薦）" icon="phone" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增或點選進入企業微信對話，**獲取所有人工充值通道賬戶**。
  </Card>

  <Card title="官方郵箱" icon="mail" href="mailto:hi@apiyi.com">
    **[hi@apiyi.com](mailto:hi@apiyi.com)**

    適合正式商務溝通、發票開具、大額對公付款合同洽談、企業合作。
  </Card>
</CardGroup>

<Warning>
  **資金安全提醒**：所有對公賬戶、USDT 地址、PayPal / Wise / Mercury Bank 收款賬戶**僅通過官方客服渠道獲取**，請勿相信任何第三方提供的"客服"或地址，避免資金損失。
</Warning>

## 相關文件

<CardGroup cols={2}>
  <Card title="充值優惠政策" icon="gift" href="/zh-Hant/faq/recharge-promotions">
    首充加贈、階梯返利、教育使用者優惠
  </Card>

  <Card title="為什麼餘額跑不通？" icon="circle-question-mark" href="/zh-Hant/faq/balance-insufficient">
    餘額異常排查 / 計費模式說明
  </Card>

  <Card title="邀請返佣 5% 政策" icon="users" href="/zh-Hant/faq/referral-program">
    持續 5% 額度返利與劃轉流程
  </Card>

  <Card title="退款政策" icon="rotate-ccw" href="/zh-Hant/faq/refund-policy">
    餘額退款規則與申請流程
  </Card>
</CardGroup>
