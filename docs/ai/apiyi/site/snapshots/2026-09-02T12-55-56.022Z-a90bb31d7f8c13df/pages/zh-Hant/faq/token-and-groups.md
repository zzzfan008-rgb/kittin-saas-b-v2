> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 令牌與分組

> 瞭解 API易 令牌（API KEY）的作用、建立與編輯方法，以及分組的概念、預設分組與兜底分組的設定規則

## 令牌（API KEY）是什麼

令牌就是您呼叫 API易 時使用的 **API KEY**，格式以 `sk-` 開頭。它是您身份和權限的憑證，主要作用包括：

<CardGroup cols={2}>
  <Card title="身份認證" icon="shield">
    每次 API 呼叫都需要攜帶令牌，用於驗證您的身份和賬戶。
  </Card>

  <Card title="額度與權限控制" icon="sliders-horizontal">
    可為單個令牌設定專屬額度、過期時間、可用模型和分組。
  </Card>

  <Card title="呼叫統計" icon="chart-line">
    每個令牌的消耗、剩餘額度、呼叫日誌都可獨立檢視。
  </Card>

  <Card title="靈活分配" icon="users">
    可為不同專案、團隊成員建立獨立令牌，便於管理和隔離。
  </Card>
</CardGroup>

<Info>
  註冊後系統會自動生成一個**預設令牌**，開箱即用。您也可以按需建立多個新令牌。
</Info>

## 如何建立令牌

<Steps>
  <Step title="進入令牌頁面">
    開啟頂部導航的「令牌」頁面：[https://api.apiyi.com/token](https://api.apiyi.com/token)
  </Step>

  <Step title="點選「新增」">
    在頁面右上角點選「新增」按鈕，開啟建立令牌彈窗。
  </Step>

  <Step title="填寫令牌資訊">
    設定令牌名稱、額度（可開啟無限額度）、有效期（可設永不過期）、計費模式和分組（詳見下文）。
  </Step>

  <Step title="儲存並複製 KEY">
    儲存後，點選令牌右側的複製圖示，即可複製完整的 `sk-` 開頭的 KEY。
  </Step>
</Steps>

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="新增令牌" width="1284" height="1158" data-path="images/key-add-new.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/key-add-new.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=1242d2ab7ec569566ac5667dc41ed32c" alt="新增令牌" width="1284" height="1158" data-path="images/key-add-new.png" />

<Tip>
  建立新令牌時**不需要設定可用模型**。採用白名單機制：不設定則該令牌可使用全站 400+ 模型；設定後則只能使用指定模型。詳見 [令牌模型白名單](/zh-Hant/faq/token-model-whitelist)。
</Tip>

## 編輯令牌與檢視程式碼示例

點選令牌最右側「操作」列的**管理選單（扳手圖示）**，即可展開全部操作：

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="令牌管理選單與請求示例" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="令牌管理選單與請求示例" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

| 操作              | 說明                                             |
| --------------- | ---------------------------------------------- |
| **停用令牌**        | 臨時停用該令牌，呼叫將被拒絕                                 |
| **編輯令牌**        | 修改名稱、額度、有效期、計費模式、分組等                           |
| **請求示例**        | **檢視程式碼示例**，提供該令牌的多語言呼叫程式碼（curl、Python 等），複製即用 |
| **令牌日誌**        | 檢視該令牌的呼叫記錄                                     |
| **分享令牌 / 一鍵對接** | 快速分享或對接到第三方工具                                  |

<Note>
  「請求示例」即**程式碼示例**入口。點選後會帶上當前令牌生成可直接執行的呼叫程式碼，無需手動拼接 KEY 和介面地址，適合快速測試和接入。
</Note>

## 一個令牌多人共用，會限速嗎

經常有客戶問：**"我一個令牌給多個人用，會被限速嗎？"**

答案是：**令牌本身沒有限速**。限速跟隨的是**賬戶**的限速，與令牌數量、使用人數無關——一個令牌給 10 個人用，和 10 個令牌各給 1 個人用，限速效果完全相同。

<CardGroup cols={2}>
  <Card title="RPM（每分鐘請求數）" icon="gauge">
    一般來說，單個賬戶的限速在 **100 RPM** 以內都沒有問題，足以覆蓋絕大多數團隊和應用場景。
  </Card>

  <Card title="TPM（每分鐘 Token 數）" icon="infinity">
    **TPM 不考核**，無需擔心單次請求上下文過長或併發 Token 量過大觸發限制。
  </Card>
</CardGroup>

<Tip>
  多人共用令牌不影響速率，但從**管理角度**仍建議為不同成員或專案建立獨立令牌：便於分別設定額度、獨立檢視呼叫日誌和消耗統計。
</Tip>

## 什麼是分組

**分組是令牌可選擇的"資源通道"。** 不同分組對應不同的上游資源、可用模型範圍和計費倍率，**開放給使用者自行選擇**。

簡單理解：同一個模型可能由多條上游通道提供，分組就是讓您選擇走哪條通道。**不同的模型可能需要用到不同的分組**，選對分組才能正常呼叫並享受對應的折扣。

<Info>
  絕大多數情況下使用\*\*預設分組（Default）\*\*即可，它模型齊全，覆蓋文本模型、NanoBanana 系列、Veo 3.1 等絕大部分模型。
</Info>

## 預設分組與兜底分組

同一個令牌最多可設定 **3 個分組**：**1 個預設分組 + 2 個兜底分組**。

<CardGroup cols={2}>
  <Card title="預設分組（主分組）" icon="circle-check">
    令牌優先使用的分組，通用絕大部分模型。每個令牌必須有 1 個預設分組。
  </Card>

  <Card title="兜底分組（備用）" icon="life-buoy">
    當預設分組無法滿足請求時自動切換的備用通道，最多可設定 2 個，提高呼叫成功率。
  </Card>
</CardGroup>

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/UCijFWltmtlBUyvg/images/nano-banana-token-fallback-setup.png?fit=max&auto=format&n=UCijFWltmtlBUyvg&q=85&s=60e569c034776ae83d9866fcfac343c0" alt="選擇分組與兜底分組設定" width="1276" height="1176" data-path="images/nano-banana-token-fallback-setup.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/UCijFWltmtlBUyvg/images/nano-banana-token-fallback-setup.png?fit=max&auto=format&n=UCijFWltmtlBUyvg&q=85&s=60e569c034776ae83d9866fcfac343c0" alt="選擇分組與兜底分組設定" width="1276" height="1176" data-path="images/nano-banana-token-fallback-setup.png" />

在建立或編輯令牌的彈窗中：

* **選擇分組**：設定預設（主）分組，預設為 `Default`
* **兜底分組**：可新增 1\~2 個備用分組，當主分組不可用時自動兜底

<Tip>
  **分組會影響令牌的計費倍率和可用模型**，請根據實際使用的模型來選擇。不確定時保持預設 `Default` 即可。
</Tip>

## 不同模型對應不同分組

預設分組通用絕大部分模型，但部分模型（尤其是**影片模型**）需要切換到專屬分組才能呼叫：

| 模型 / 場景                           | 需要選擇的分組             |
| --------------------------------- | ------------------- |
| 文本、多模態、NanoBanana、Veo 3.1 等絕大部分模型 | **Default**（預設分組）   |
| Sora 2 官轉影片                       | **Sora2Official**   |
| 阿里 Wan & HappyHorse 影片系列          | **Wan\&HappyHorse** |

<Warning>
  呼叫 Sora 2 官轉、Wan\&HappyHorse 等專屬分組模型時，若令牌沒有對應分組，會出現模型不可用的情況。建議將常用專屬分組設為兜底分組，或為這類模型單獨建立令牌。
</Warning>

## 分組一覽

下圖為系統提供的分組及說明（以控制台實際顯示為準）：

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/token-groups-overview-20260527.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5a8d30f9f468b01afda6aeb52ae98912" alt="API易 令牌分組一覽" width="1200" height="844" data-path="images/token-groups-overview-20260527.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/token-groups-overview-20260527.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5a8d30f9f468b01afda6aeb52ae98912" alt="API易 令牌分組一覽" width="1200" height="844" data-path="images/token-groups-overview-20260527.png" />

<Note>
  表格中的「組倍率」為人民幣計價的相對值，**並非直接的美元折扣比例**，無需深究。您只需選擇與所用模型匹配的分組即可；想了解倍率與價格的換算，請參考 [系統裡模型的【倍率】是什麼？](/zh-Hant/faq/model-multiplier)。
</Note>

## 相關文件

<CardGroup cols={2}>
  <Card title="令牌計費模式" icon="calculator" href="/zh-Hant/faq/token-billing-modes">
    瞭解按量優先、按次優先等計費模式的區別。
  </Card>

  <Card title="令牌模型白名單" icon="list" href="/zh-Hant/faq/token-model-whitelist">
    如何限制單個令牌可用的模型範圍。
  </Card>

  <Card title="模型倍率說明" icon="percent" href="/zh-Hant/faq/model-multiplier">
    理解倍率含義與價格計算規則。
  </Card>

  <Card title="呼叫日誌查詢" icon="file-text" href="/zh-Hant/faq/call-logs">
    檢視每個令牌的呼叫記錄與消耗明細。
  </Card>
</CardGroup>
