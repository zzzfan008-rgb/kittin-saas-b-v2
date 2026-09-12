> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何設定餘額告警提醒？

> API易支援郵件、企業微信/釘釘/飛書群機器人、餘額提醒 API 等多種告警方式，避免餘額不足影響業務。

## 簡短回答

API易支援**三種餘額告警方式**：郵件通知（預設開啟）、企業微信/釘釘/飛書等群機器人推送、以及自定義的餘額提醒 API 接入。進入後臺 **通知設定** 頁面即可配置告警閾值和通知方式。

<Card title="前往通知設定" icon="settings" href="https://api.apiyi.com/account/notificationSettings">
  後臺路徑：**賬戶 → 通知設定**

  在此頁面可配置告警閾值、啟用/關閉各類通知渠道。
</Card>

## 告警方式詳解

<CardGroup cols={3}>
  <Card title="郵件通知" icon="mail">
    **預設開啟**

    餘額低於閾值時，系統自動傳送告警郵件到賬戶註冊郵箱，無需額外配置。
  </Card>

  <Card title="群機器人" icon="bot">
    支援 **企業微信 / 釘釘 / 飛書** 等常用辦公群的 Webhook 機器人，即時推送到團隊群。
  </Card>

  <Card title="餘額提醒 API" icon="code">
    支援接入自定義的**餘額提醒 API**，便於對接自有監控系統或業務告警平臺。
  </Card>
</CardGroup>

## 配置步驟

<Steps>
  <Step title="登入 API易後臺">
    訪問 [api.apiyi.com](https://api.apiyi.com) 並登入你的賬戶。
  </Step>

  <Step title="進入通知設定">
    在左側選單進入 **賬戶 → 通知設定**，或直接開啟 [通知設定頁面](https://api.apiyi.com/account/notificationSettings)。
  </Step>

  <Step title="設定餘額預警閾值">
    配置餘額低於多少時觸發告警（例如餘額少於 10 元時提醒），建議根據日均消耗合理設定，至少保留 3-7 天的使用量。
  </Step>

  <Step title="啟用告警通知渠道">
    按需啟用郵件、群機器人 Webhook 或餘額提醒 API，並填寫對應的通知地址 / Webhook URL。
  </Step>

  <Step title="測試告警是否生效">
    配置完成後，可通過測試按鈕或臨時調低閾值的方式驗證告警是否正常觸達。
  </Step>
</Steps>

## 告警渠道推薦

<Tip>
  **團隊使用者建議同時啟用多渠道告警**

  * **個人開發者**：郵件通知即可
  * **小團隊**：郵件 + 企業微信/釘釘/飛書群機器人
  * **企業使用者**：郵件 + 群機器人 + 餘額提醒 API（接入自有監控系統）
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼沒有收到告警郵件？">
    請檢查：

    1. 賬戶註冊郵箱是否正確、能否正常收信
    2. 告警郵件是否被誤判為垃圾郵件（檢視垃圾箱）
    3. 在通知設定中確認**郵件通知**是否已開啟
    4. 餘額是否真的低於設定的告警閾值
  </Accordion>

  <Accordion title="群機器人如何獲取 Webhook 地址？">
    * **企業微信**：群聊 → 群機器人 → 新增機器人 → 獲取 Webhook URL
    * **釘釘**：群設定 → 智慧群助手 → 新增機器人 → 自定義機器人 → 複製 Webhook
    * **飛書**：群設定 → 群機器人 → 新增機器人 → 自定義機器人 → 複製 Webhook 地址

    將獲取到的 Webhook URL 填入通知設定對應的輸入框即可。
  </Accordion>

  <Accordion title="餘額提醒 API 如何使用？">
    餘額提醒 API 允許你配置一個自定義的 HTTP 回撥地址，當餘額低於閾值時，系統會向該地址傳送 POST 請求，便於你接入自有監控平臺（如 Grafana、Prometheus、內部告警系統等）。

    具體接入方式請參考文件中心的 API 說明，或聯絡客服獲取接入指引。
  </Accordion>

  <Accordion title="告警觸發後多久會再次提醒？">
    系統預設有防打擾機制，避免短時間內重複推送相同告警。建議設定告警閾值後，及時完成充值，避免餘額進一步降低導致業務中斷。
  </Accordion>

  <Accordion title="可以設定多個告警閾值嗎？">
    目前通知設定中可配置餘額預警閾值，當餘額低於該值時觸發告警。如需更復雜的多級告警策略，可結合餘額提醒 API 在自有系統中實現。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="為什麼還有餘額跑不通？" icon="credit-card" href="/zh-Hant/faq/balance-insufficient">
    瞭解請求預扣機制，避免餘額充足卻呼叫失敗
  </Card>

  <Card title="充值方式" icon="dollar-sign" href="/zh-Hant/faq/payment-methods">
    檢視 API易 支援的充值渠道與操作指南
  </Card>

  <Card title="充值優惠" icon="gift" href="/zh-Hant/faq/recharge-promotions">
    瞭解最新的充值加贈活動，節省成本
  </Card>

  <Card title="呼叫日誌" icon="file-text" href="/zh-Hant/faq/call-logs">
    檢視消費明細，分析餘額消耗情況
  </Card>
</CardGroup>

<Info>
  **溫馨提醒**

  餘額告警只是輔助手段，建議同時定期關注賬戶餘額與消費情況，尤其在業務高峰期或新接入模型時及時充值，避免因餘額不足影響線上服務。
</Info>
