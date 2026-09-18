> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API易 支援哪些郵箱註冊？

> API易 支援 Gmail、Outlook、Hotmail、Foxmail 及全球高校郵箱（.edu / .edu.cn 等）註冊，暫不支援 QQ、126、163 郵箱字尾。

## 簡短回答

API易 **支援全球化郵箱和高校郵箱**註冊，**暫不支援 QQ、126、163** 等部分國內郵箱字尾。如果你使用的是不支援的郵箱，請換用下方推薦的郵箱字尾完成註冊。

## ✅ 支援的郵箱型別

<CardGroup cols={2}>
  <Card title="全球化郵箱" icon="globe">
    * **Gmail**（`@gmail.com`）
    * **Outlook**（`@outlook.com`）
    * **Hotmail**（`@hotmail.com`）
    * **Foxmail**（`@foxmail.com`）
    * 其他主流國際郵箱
  </Card>

  <Card title="高校郵箱" icon="graduation-cap">
    * **國內高校**：`@xxx.edu.cn`
    * **海外高校**：`@xxx.edu`、`@xxx.ac.uk` 等
    * 在校師生可用學校官方郵箱註冊
  </Card>
</CardGroup>

## ❌ 暫不支援的郵箱

| 郵箱字尾       | 服務商       | 狀態     |
| ---------- | --------- | ------ |
| `@qq.com`  | 騰訊 QQ 郵箱  | ❌ 暫不支援 |
| `@126.com` | 網易 126 郵箱 | ❌ 暫不支援 |
| `@163.com` | 網易 163 郵箱 | ❌ 暫不支援 |

<Info>
  **特殊原因，敬請諒解**：上述郵箱字尾存在較高比例的接收異常和驗證投遞問題，會影響註冊驗證碼、賬戶通知等關鍵郵件的送達，因此暫未開放註冊。
</Info>

## ⚠️ 郵箱字首含特殊符號無法註冊

<Warning>
  **若郵箱字首含有「點 `.`」等特殊符號，系統會將其識別為臨時郵箱，無法收到驗證碼（即無法完成註冊）。**

  例如：`john.doe@gmail.com` 這類字首中含有 `.` 的寫法，會被風控系統判定為一次性/臨時郵箱地址。

  **解決方法**：請使用字首**不含點號、連字元等特殊符號**的純字元郵箱（如 `johndoe@gmail.com`）重新註冊。Gmail 等主流郵箱服務通常會將含點和不含點的寫法視為同一郵箱，可直接收信，不影響實際使用。
</Warning>

## 推薦做法

<Tip>
  * 如果暫無可用郵箱，**推薦註冊一個 Gmail 或 Outlook** 郵箱用於 API易 賬號，免費且全球可用。
  * 如果你是**在校師生**，使用學校官方郵箱（`.edu` / `.edu.cn`）註冊不僅可正常使用，還可享受 **教育使用者**相關權益。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼不支援 QQ / 163 / 126 郵箱？">
    這部分郵箱對國際域名發件人有較嚴格的過濾策略，**註冊驗證碼、賬戶通知、對賬郵件等關鍵郵件的送達率較低**，容易讓使用者誤以為系統異常。為保障所有使用者的可用性，暫時未開放這些字尾，敬請諒解。
  </Accordion>

  <Accordion title="我已用 QQ 郵箱註冊了賬號怎麼辦？">
    歷史使用者的賬號不受影響，可繼續正常使用。如需更換郵箱或遇到接收不到郵件的問題，請通過客服微信聯絡我們協助處理。
  </Accordion>

  <Accordion title="企業自有域名郵箱（如 @公司域名.com）可以註冊嗎？">
    **預設情況下，大部分企業自有域名郵箱並未開通註冊**。如需使用企業郵箱註冊，請通過客服微信聯絡我們，提供具體郵箱字尾，**人工評估後加入白名單**即可正常註冊。
  </Accordion>

  <Accordion title="高校郵箱註冊有什麼額外權益嗎？">
    使用 `.edu` / `.edu.cn` 高校郵箱註冊，可享受 **教育使用者首充加贈** 等優惠，詳見 [充值優惠政策](/zh-Hant/faq/recharge-promotions)。
  </Accordion>

  <Accordion title="註冊時收不到驗證碼怎麼辦？">
    1. 檢查郵箱的**垃圾郵件**和**廣告郵件**資料夾
    2. 確認填寫的郵箱字尾在**支援列表**中
    3. **檢查郵箱字首是否包含點號 `.` 等特殊符號**（如 `john.doe@gmail.com`），含點號的寫法會被識別為臨時郵箱，請改用無點號的純字元字首
    4. 若仍未收到，可在註冊頁點選**重新發送**，或換用其他支援的郵箱重試
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="忘記密碼怎麼辦？" icon="key" href="/zh-Hant/faq/forgot-password">
    密碼找回與重置流程說明
  </Card>

  <Card title="GitHub 繫結異常" icon="github" href="/zh-Hant/faq/github-bindng-bindng-error">
    通過 GitHub 第三方登入繫結問題排查
  </Card>
</CardGroup>
