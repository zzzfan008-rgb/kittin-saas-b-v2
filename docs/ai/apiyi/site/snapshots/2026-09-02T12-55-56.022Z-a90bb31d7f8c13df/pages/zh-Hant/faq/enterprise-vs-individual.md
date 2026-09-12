> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 企業客戶和個人使用者有什麼區別？

> API易企業客戶與個人使用者在賬號屬性上沒有區別，本文說明企業常用的多令牌管理、服務群對接、內部共享與議價政策。

## 簡短回答

**在賬號屬性上，企業客戶和個人使用者沒有任何區別——註冊後即是使用者，使用同一套後臺和介面。**

區別只在於"使用方式"：企業通常會通過多令牌區分部門、對接企業微信服務群、在內部共享賬號等方式來更好地協作。價格對所有使用者公開透明，沒有單獨議價。

## 賬號屬性：完全一致

API易不區分"企業版"和"個人版"。無論是個人開發者還是企業團隊，註冊後獲得的都是同一種賬號，享有相同的：

* 400+ 模型訪問權限
* 統一的 `https://api.apiyi.com` 介面
* 相同的控制台、令牌管理與日誌功能
* 相同的公開價格

<Info>
  企業無需單獨開通"企業賬號"，直接註冊即可。下面介紹的是企業在實際使用中的常見做法。
</Info>

## 企業常用的使用方式

<CardGroup cols={2}>
  <Card title="多令牌區分部門 / 員工" icon="key">
    通過建立多個令牌（KEY），把不同部門或員工的用量隔離開，便於分別統計消耗、控制額度和管理權限。
  </Card>

  <Card title="企業微信服務群" icon="message-circle">
    可聯絡 API易 售後及運營，建立專屬的企業微信服務群，協助介面對接和日常答疑。
  </Card>

  <Card title="內部共享賬號" icon="users">
    報銷或付款人不同的場景，可在企業內部共享賬號密碼，由統一的賬號集中管理充值與用量。
  </Card>

  <Card title="消耗日誌查詢" icon="file-text">
    不登入後臺也能查詢某個 KEY 的消耗日誌，方便財務或非技術同事核對用量。
  </Card>
</CardGroup>

### 1. 通過多令牌區分部門或員工

企業可以在控制台建立多個令牌（KEY），把它們分配給不同的部門或員工使用。這樣做的好處：

* **用量隔離**：每個令牌的消耗獨立統計，便於內部核算
* **額度控制**：可為單個令牌設定餘額上限和有效期
* **權限管理**：某個令牌洩露或離職時，單獨停用即可，不影響其他業務

詳細的令牌建立方法見 [如何建立 KEY？](/zh-Hant/faq/token-management)。

### 2. 對接企業微信服務群

企業客戶可以聯絡 API易 售後及運營團隊，建立專屬的**企業微信服務群**，由我們協助企業完成介面對接、解決日常使用問題。

<Tip>
  基礎問題（如令牌建立、計費規則、模型選擇、常見報錯）建議**優先查閱本文件**，能更快得到答案；文件未覆蓋或企業級的對接問題，再通過服務群溝通，效率更高。
</Tip>

### 3. 內部共享賬號與消耗查詢

企業常遇到"使用人、報銷人、付款人不是同一個人"的情況。API易的處理方式很簡單：

* **共享賬號密碼**：可在企業內部共享同一個賬號，由統一的賬號集中充值、管理令牌
* **免登入查詢消耗**：如果不方便登入後臺，也可以通過查詢頁面核對某個 KEY（令牌）的消耗日誌

<Card title="令牌消耗查詢頁面" icon="search" href="https://api.apiyi.com/query">
  無需登入即可查詢：[https://api.apiyi.com/query](https://api.apiyi.com/query)

  輸入令牌（KEY）即可檢視其消耗日誌，方便財務或非技術同事核對用量。
</Card>

## 企業客戶有單獨議價嗎？

**沒有。我們的價格公開透明，對所有使用者一視同仁。**

API易唯一的優惠形式是**充值加贈活動**，我們推薦企業客戶參與，長期使用更划算。

<Info>
  **關於我們**：API易是已穩定運營兩年的站點，正規團隊交付，長期可靠服務。價格統一公開，省去了反覆議價的溝通成本——這本身也是對企業客戶的一種確定性保障。
</Info>

充值加贈活動詳情見 [充值優惠活動](/zh-Hant/faq/recharge-promotions)。

## 相關文件

<CardGroup cols={2}>
  <Card title="如何建立 KEY？" icon="key" href="/zh-Hant/faq/token-management">
    多令牌管理的完整說明
  </Card>

  <Card title="如何檢視呼叫日誌？" icon="file-text" href="/zh-Hant/faq/call-logs">
    用量與消耗的查詢方式
  </Card>

  <Card title="充值優惠活動" icon="gift" href="/zh-Hant/faq/recharge-promotions">
    充值加贈活動詳情
  </Card>

  <Card title="支援哪些充值方式？" icon="credit-card" href="/zh-Hant/faq/payment-methods">
    對公轉賬等付款方式
  </Card>
</CardGroup>

## 聯絡我們

<Card title="企業微信客服" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  企業對接、服務群申請等需求，歡迎聯絡：

  * [聯絡企業微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * 郵箱：[hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
