> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何登出賬戶？

> 在 API易 個人中心可一鍵登出賬戶，登出後所有使用者資料、呼叫日誌、充值記錄將永久丟失，請審慎操作。

## 簡短回答

登入 API易 後臺，進入 **個人中心** 頁面 `api.apiyi.com/account/profile`，在頁面底部「賬戶選項」區域點選 **登出** 按鈕，按提示完成二次確認即可。

<Warning>
  **登出不可恢復**：賬戶一旦登出，所有的**使用者資料、呼叫日誌、充值記錄、餘額**都將永久丟失，無法恢復。意外登出由使用者自行承擔，平臺不負責資料恢復。請在操作前務必確認。
</Warning>

## 操作入口

登出入口位於 **個人中心 → 賬戶選項** 區域，與「修改密碼」「系統令牌」「訪問令牌」並列：

<img src="https://mintcdn.com/apiyillc/Az0T-cmcmXqc4ycr/images/account-deletion-button.png?fit=max&auto=format&n=Az0T-cmcmXqc4ycr&q=85&s=36f570e399cf0f60267c39c9a70f3a25" alt="賬戶登出按鈕位置" width="1140" height="258" data-path="images/account-deletion-button.png" />

## 操作步驟

<Steps>
  <Step title="進入個人中心">
    登入 API易 後臺後，訪問個人中心頁面：

    ```
    https://api.apiyi.com/account/profile
    ```
  </Step>

  <Step title="找到「賬戶選項」區域">
    滾動到頁面**底部**，找到「賬戶選項」分組。
  </Step>

  <Step title="點選「登出」按鈕">
    點選紅色的 **登出** 按鈕（帶垃圾桶圖示）。
  </Step>

  <Step title="完成二次確認">
    系統會彈出二次確認提示，請仔細閱讀後再確認。**確認後立即生效，無法撤銷。**
  </Step>
</Steps>

## 登出前請務必確認

<CardGroup cols={2}>
  <Card title="賬戶餘額" icon="wallet" color="#ef4444">
    餘額將一併清零，且**不支援退款**。如有餘額，建議提前消耗或申請退款。
  </Card>

  <Card title="呼叫日誌" icon="file-text" color="#ef4444">
    所有歷史呼叫記錄將被刪除，無法用於後續對賬或審計。
  </Card>

  <Card title="充值記錄" icon="receipt" color="#ef4444">
    歷史充值發票、訂單記錄將一併丟失，請提前匯出或開票。
  </Card>

  <Card title="API Key" icon="key" color="#ef4444">
    所有系統令牌、訪問令牌將立即失效，正在執行的業務會立刻中斷。
  </Card>
</CardGroup>

<Tip>
  **建議**：登出前先檢查是否有未開發票的充值訂單、未匯出的呼叫日誌，以及正在呼叫 API 的線上業務。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="登出後還能用同一個郵箱重新註冊嗎？">
    一般情況下注銷後釋放郵箱，可重新註冊新賬戶，但**新賬戶與原賬戶無任何關聯**：原賬戶的餘額、日誌、充值記錄、優惠資格不會遷移。如有特殊需求，請通過客服微信諮詢。
  </Accordion>

  <Accordion title="賬戶有餘額，登出後能退款嗎？">
    登出前如需退款，請先按 [退款政策](/zh-Hant/faq/refund-policy) 申請並完成退款，再進行登出操作。**一旦登出，餘額無法找回，也不再受理退款。**
  </Accordion>

  <Accordion title="點錯了「登出」按鈕，能撤銷嗎？">
    系統設定了二次確認，僅點選「登出」按鈕**不會立即登出**。但一旦完成二次確認，操作即刻生效且**無法撤銷**。請在二次確認彈窗中仔細閱讀後再點選確認。
  </Accordion>

  <Accordion title="不想用了，但又怕將來要用，有別的辦法嗎？">
    如果只是**暫時不用**，無需登出賬戶：

    * 可以在「系統令牌」中**停用或刪除 API Key**，避免被誤用
    * 餘額會保留在賬戶中，下次登入可繼續使用
    * 這樣既保留了歷史記錄和資料，也避免了未來重新註冊的麻煩
  </Accordion>

  <Accordion title="忘記密碼，無法登入後臺，如何登出？">
    請先按 [忘記密碼怎麼辦？](/zh-Hant/faq/forgot-password) 找回賬戶，登入後再進行登出操作。如無法找回，請通過客服微信聯絡我們協助處理。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="退款政策" icon="rotate-ccw" href="/zh-Hant/faq/refund-policy">
    登出前先了解餘額退款規則
  </Card>

  <Card title="忘記密碼怎麼辦？" icon="key" href="/zh-Hant/faq/forgot-password">
    密碼找回與重置流程
  </Card>

  <Card title="資料安全說明" icon="shield" href="/zh-Hant/faq/data-security">
    瞭解 API易 的資料安全與隱私政策
  </Card>

  <Card title="呼叫日誌查詢" icon="file-text" href="/zh-Hant/faq/call-logs">
    登出前可先匯出歷史呼叫記錄
  </Card>
</CardGroup>
