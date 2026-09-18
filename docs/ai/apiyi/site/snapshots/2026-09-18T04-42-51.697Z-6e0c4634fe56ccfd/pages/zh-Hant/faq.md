> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 常見問題總覽

> API易 常見問題總索引：新手接入、模型呼叫、令牌與日誌、充值計費、企業服務、賬號登入，全部 FAQ 支援按主題與按症狀兩種方式檢索。

這裡彙總了 API易 全部常見問題。第一次來的話，先看**新手三步**和**高頻問題**；已經在用、遇到具體報錯的，直接跳到**按症狀排查**；想系統翻一遍的，往下看**按主題瀏覽**。

## 🚀 新手三步

<CardGroup cols={3}>
  <Card title="第一步：註冊賬號" icon="mail" href="/zh-Hant/faq/email-registration">
    支援 Gmail、Outlook、Foxmail 及全球高校郵箱，也可用 GitHub 一鍵登入
  </Card>

  <Card title="第二步：建立 KEY" icon="key" href="/zh-Hant/faq/token-management">
    在控制台令牌頁拿到預設令牌，或新建一個專用 KEY 並選好分組
  </Card>

  <Card title="第三步：填 Base URL" icon="link" href="/zh-Hant/faq/base-url-config">
    OpenAI 格式填 `/v1`，Claude 填根域名，Gemini 填 `/v1beta`
  </Card>
</CardGroup>

## 🔥 高頻問題

<CardGroup cols={2}>
  <Card title="如何建立 KEY？" icon="key" href="/zh-Hant/faq/token-management">
    獲取預設令牌與新建 KEY 的完整步驟
  </Card>

  <Card title="Base URL 怎麼填？" icon="link" href="/zh-Hant/faq/base-url-config">
    `/v1`、根域名、`/v1beta` 三種填法分別對應哪類模型
  </Card>

  <Card title="如何選擇合適的 AI 模型？" icon="compass" href="/zh-Hant/faq/model-selection-guide">
    按場景、成本、速度三個維度做模型選型
  </Card>

  <Card title="為什麼提示 API Key 無效？" icon="triangle-alert" href="/zh-Hant/faq/invalid-api-key">
    九成是 Base URL 與 KEY 不配套，先按這篇自查
  </Card>

  <Card title="為什麼還有餘額跑不通？" icon="credit-card" href="/zh-Hant/faq/balance-insufficient">
    預扣費機制與 max\_tokens 設定過大導致的餘額判定
  </Card>

  <Card title="系統裡模型的【倍率】是什麼？" icon="calculator" href="/zh-Hant/faq/model-multiplier">
    倍率是人民幣計價單位，乘固定匯率才是美元等效價
  </Card>

  <Card title="網站有什麼充值活動嗎？" icon="gift" href="/zh-Hant/faq/recharge-promotions">
    首充加贈、階梯加贈與企業客戶政策
  </Card>

  <Card title="為什麼官方網頁版和 API 返回結果不同？" icon="layers" href="/zh-Hant/faq/webapp-vs-api-difference">
    同一個模型，官網聊得聰明、API 卻像變笨的原因
  </Card>
</CardGroup>

***

## 🔧 按症狀排查

遇到具體問題時，先在這張表裡對號入座。同一個現象可能跨多個主題，這裡按你實際看到的表現重新串了一遍。

| 你遇到的現象                         | 可能原因                            | 去看                                                                                                          |
| ------------------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 提示 API Key 無效 / 401            | Base URL 與 KEY 不配套，或 KEY 填錯     | [API Key 無效](/zh-Hant/faq/invalid-api-key) · [Base URL 怎麼填](/zh-Hant/faq/base-url-config)                   |
| 報錯看不懂、不知道從哪查起                  | 先按錯誤型別對號入座                      | [模型呼叫報錯怎麼排查](/zh-Hant/faq/model-error-troubleshooting)                                                      |
| 有餘額卻跑不通                        | 預扣費機制，或 max\_tokens 設得過大        | [餘額跑不通](/zh-Hant/faq/balance-insufficient) · [預扣費機制](/zh-Hant/faq/pre-deduction-quota)                      |
| 請求超時 / 中途斷連                    | 客戶端 timeout 太短，推理型模型耗時長         | [如何避免介面超時](/zh-Hant/faq/timeout-configuration)                                                              |
| 日誌顯示成功並扣費，客戶端卻沒收到              | 日誌的用時只記到閘道處理結束，差值在下行或收尾         | [日誌顯示已完成卻收不到響應](/zh-Hant/faq/log-duration-vs-client-wait)                                                   |
| 網站 / 介面返回 502                  | 服務容器短暫自動重啟，約 1 分鐘恢復             | [502 怎麼辦](/zh-Hant/faq/website-502-error)                                                                   |
| 指令碼間歇報 502，正文為空、日誌裡查不到         | 本機代理軟體（Clash / v2rayN）自己生成的 502 | [代理造成的空 502](/zh-Hant/faq/proxy-empty-502)                                                                  |
| Python 報 SSLEOFError，curl 卻正常  | OpenSSL 3.5+ 的後量子握手包被中間裝置掐斷     | [SSLEOFError 排查](/zh-Hant/faq/openssl-pq-handshake-eof)                                                     |
| 429 併發報錯                       | 觸達併發配額上限                        | [API 可以開多少併發](/zh-Hant/faq/api-concurrency)                                                                 |
| 輸出被截斷、寫到一半停                    | max\_tokens 未設或設得太小             | [max\_tokens 是什麼](/zh-Hant/faq/max-tokens)                                                                  |
| 某個模型調不了                        | 賬號權限未解鎖，或令牌模型白名單限制              | [為什麼有些模型用不了](/zh-Hant/faq/model-availability) · [令牌可用模型](/zh-Hant/faq/token-model-whitelist)                |
| 出圖失敗 / 返回空結果                   | 觸發谷歌內容安全機制                      | [Nano Banana 出圖失敗](/zh-Hant/faq/nano-banana-image-failure)                                                  |
| Gemini 出圖返回 NO\_IMAGE          | 成因與內容風控攔截不同，需單獨排查               | [為什麼返回 NO\_IMAGE](/zh-Hant/faq/gemini-no-image)                                                             |
| 生成圖與參考圖差很多                     | 參考圖需用 base64 格式上傳               | [出圖與參考圖不符](/zh-Hant/faq/image-result-differs-from-reference)                                                |
| 上傳圖片報 does not match MIME type | 圖片 URL 末尾帶了 CDN 處理引數            | [MIME 型別不匹配](/zh-Hant/faq/image-mime-type-mismatch-with-query)                                              |
| 白底圖出現黑點 / 髒塊                   | AI Studio 通道純白背景的已知表現           | [白底圖髒塊](/zh-Hant/faq/white-background-image-artifacts)                                                      |
| 想用任務 ID 查出圖結果                  | 圖片生成均為同步呼叫                      | [圖片生成有非同步介面嗎](/zh-Hant/faq/image-async-api)                                                                 |
| 出圖賬單比預期高很多                     | 解析度、品質、寬高比與張數直接放大輸出 token       | [GPT Image 輸出 token 為什麼高](/zh-Hant/faq/gpt-image-output-token-calculation)                                  |
| Seedance 傳人臉參考圖被攔截             | 真人臉須先入庫拿 `asset://`，並完成真人認證     | [人臉素材為什麼被攔截](/zh-Hant/faq/seedance2-face-asset-whitelist)                                                   |
| 模型自稱別家模型 / 說不出版本號              | 模型自我認知本就不可靠                     | [Claude 自稱 Qwen](/zh-Hant/faq/claude-identity-confusion) · [模型不知道自己版本](/zh-Hant/faq/model-version-identity) |
| 官網聰明、API 變笨                    | 官網帶系統提示詞與工具鏈，API 是裸模型           | [網頁版與 API 的差異](/zh-Hant/faq/webapp-vs-api-difference)                                                       |
| KEY 有陌生呼叫                      | KEY 可能已洩露，需定位去向並停用              | [排查莫名的 KEY 呼叫](/zh-Hant/faq/troubleshoot-key-usage) · [安全管理 API Key](/zh-Hant/faq/key-security-management)  |
| 賬單對不上 / 看不懂扣了多少                | 按量與按次計費口徑不同                     | [看懂日誌計費金額](/zh-Hant/faq/log-billing-explained) · [模型倍率](/zh-Hant/faq/model-multiplier)                      |
| 圖片影片下載很慢                       | 海外 CDN 在特定伺服器上的鏈路問題             | [CDN 下載慢](/zh-Hant/faq/cdn-download-slow)                                                                   |
| 需不需要掛代理                        | 國內可直連，無需代理                      | [是否需要代理網路](/zh-Hant/faq/network-proxy)                                                                      |
| GitHub 登入提示「該賬戶已繫結」            | 該 GitHub 賬戶已綁到別的郵箱              | [GitHub 繫結報錯](/zh-Hant/faq/github-bindng-bindng-error)                                                      |
| 忘記密碼登不進去                       | 郵箱重置或聯絡客服找回                     | [忘記密碼怎麼辦](/zh-Hant/faq/forgot-password)                                                                     |

***

## 📚 按主題瀏覽

### 🧭 網站功能介紹（4 篇）

| 問題                                                                                  | 一句話答案                        |
| ----------------------------------------------------------------------------------- | ---------------------------- |
| [令牌與分組](/zh-Hant/faq/token-and-groups)                                              | KEY 怎麼建、分組怎麼選                |
| [什麼是分組？使用者分組與令牌分組解析](/zh-Hant/faq/groups-explained)                                 | 實際生效的始終是令牌上選的分組              |
| [Codex、ClaudeCode 和 Default 分組有什麼區別？](/zh-Hant/faq/codex-claudecode-default-groups) | 來源與協議各不相同，生產環境優先用 Default 官轉 |
| [為什麼 API易 沒有一鍵對接功能？](/zh-Hant/faq/one-click-integration)                            | 模型接入方式不統一，改用右上角 AI 助手        |

### 🔑 令牌與日誌（11 篇）

| 問題                                                           | 一句話答案                              |
| ------------------------------------------------------------ | ---------------------------------- |
| [如何建立 KEY？](/zh-Hant/faq/token-management)                   | 控制台令牌頁獲取預設令牌或新建                    |
| [令牌需要設定可用模型嗎？](/zh-Hant/faq/token-model-whitelist)           | 可選，多專案隔離時建議設                       |
| [如何安全地管理 API Key？](/zh-Hant/faq/key-security-management)     | IP 白名單、模型白名單與日常使用習慣                |
| [令牌的按量優先/按次計費有什麼區別？](/zh-Hant/faq/token-billing-modes)       | 五種計費模式各自的適用場景                      |
| [如何檢視我的呼叫記錄？](/zh-Hant/faq/call-logs)                        | 控制台日誌頁查呼叫與計費明細                     |
| [Request ID 在哪裡檢視？](/zh-Hant/faq/request-id-troubleshooting) | 按介面型別找響應頭或響應體，別把任務 ID 當 Request ID |
| [怎麼看懂日誌裡的計費金額？](/zh-Hant/faq/log-billing-explained)          | 按量與按次口徑不同，可用 usage 自算              |
| [呼叫日誌儲存多久？多久清理一次？](/zh-Hant/faq/log-retention-policy)        | 當月加此前兩個自然月，每月 5 日清理                |
| [日誌的時區設定和資料匯出要注意什麼？](/zh-Hant/faq/log-timezone-and-export)   | 賬戶時區保持 UTC+0，匯出檔案固定按 UTC+0         |
| [為方便排查問題，可以在後臺看到詳細日誌嗎？](/zh-Hant/faq/user-logs-control)      | 管理員可臨時開啟詳細日誌                       |
| [如何排查莫名的 KEY 呼叫？](/zh-Hant/faq/troubleshoot-key-usage)       | 按日誌裡的真實 IP 定位並及時停用                 |

### 🏢 企業服務（9 篇）

| 問題                                                                           | 一句話答案                |
| ---------------------------------------------------------------------------- | -------------------- |
| [什麼是企業分組（Enterprise）？什麼時候該用？](/zh-Hant/faq/enterprise-group-vertex-fallback) | 模型專屬分組，供給更穩但倍率略高     |
| [圖片生成有快速線或企業線嗎？](/zh-Hant/faq/image-generation-fast-enterprise-route)        | 沒有加速線，耗時主要來自模型推理本身   |
| [API易 的企業服務值得信任嗎？模型保真嗎？](/zh-Hant/faq/enterprise-trust)                      | 純透明官轉，不路由、不降智、不換模型   |
| [企業客戶和個人使用者有什麼區別？](/zh-Hant/faq/enterprise-vs-individual)                    | 賬號屬性相同，差別在協作與議價政策    |
| [企業客戶如何充值？](/zh-Hant/faq/enterprise-recharge)                                | 推薦對公轉賬，可籤框架合同、開增值稅發票 |
| [高校客戶如何無憂報銷？](/zh-Hant/faq/university-reimbursement)                         | 提供發票、採購清單、蓋章等報銷材料    |
| [APIYI 有 SLA 保障嗎？](/zh-Hant/faq/sla-guarantee)                               | 有，含異常計費補償與額度補發       |
| [智慧體小程式需要做演算法備案嗎？](/zh-Hant/faq/agent-miniapp-algorithm-filing)              | 通常需要，本文說明一般流程        |
| [國內產品呼叫海外模型，合規備案怎麼辦？](/zh-Hant/faq/overseas-model-compliance)                | 資質分層、備案現狀與內容安全要點     |

### 💰 充值與安全（17 篇）

| 問題                                                              | 一句話答案                           |
| --------------------------------------------------------------- | ------------------------------- |
| [價格和官網一樣，為什麼選擇 API易？](/zh-Hant/faq/official-pricing-advantages) | 同價但有充值加贈，可疊加分組折扣                |
| [為什麼 API易 能比官網價格低？](/zh-Hant/faq/why-cheaper-than-official)     | 規模化採購與廠商渠道分發，不是降智               |
| [系統裡模型的【倍率】是什麼？](/zh-Hant/faq/model-multiplier)                 | 人民幣計價單位，乘固定匯率得美元等效價             |
| [100 元人民幣可以兌換多少算力？](/zh-Hant/faq/rmb-to-computing-power)        | 充值按固定匯率 1 美元 = 7 元，算力兌換比例由你的系統定 |
| [API易支援快取計費嗎？](/zh-Hant/faq/cache-billing)                      | 主流通道均支援，命中率因廠商而異                |
| [API 呼叫的預扣費機制是什麼？](/zh-Hant/faq/pre-deduction-quota)            | 請求前按預估扣，結束後按實際結算                |
| [為什麼還有餘額跑不通？](/zh-Hant/faq/balance-insufficient)                | 預扣費判定或 max\_tokens 設得過大         |
| [如何設定餘額告警提醒？](/zh-Hant/faq/balance-alerts)                      | 郵件、群機器人、餘額提醒 API 三選一            |
| [API易的餘額會過期嗎？有效期多久？](/zh-Hant/faq/balance-validity-period)      | 365 天有效期，再次充值會重置全部餘額            |
| [APIYI 支援哪些充值方式？](/zh-Hant/faq/payment-methods)                 | 微信、支付寶、USDT、Stripe、PayPal 等     |
| [開票金額不足 100 美元怎麼辦？](/zh-Hant/faq/invoice-minimum-amount)        | 建議多筆小額累計滿 100 美元后合併開票           |
| [發票抬頭填錯了怎麼辦？可以重新開具嗎？](/zh-Hant/faq/invoice-reissue)             | 提交原發票與正確資料，紅衝後重開                |
| [網站有什麼充值活動嗎？](/zh-Hant/faq/recharge-promotions)                 | 首充加贈、階梯加贈與發票服務                  |
| [如何申請代理合作？可以邀請好友返佣嗎？](/zh-Hant/faq/referral-program)            | 預設有邀請返佣，無需單獨申請                  |
| [API易 的退款政策是怎樣的？](/zh-Hant/faq/refund-policy)                   | 退款條件、流程、手續費與發票說明                |
| [內容安全如何合規性？](/zh-Hant/faq/content-safety)                       | 內容稽核機制與違規處理措施                   |
| [API易如何保障資料安全？](/zh-Hant/faq/data-security)                     | 加密傳輸、最小化儲存、訪問控制                 |

### ⚙️ 模型與呼叫（31 篇）

**選型與通用行為**

| 問題                                                                                 | 一句話答案                |
| ---------------------------------------------------------------------------------- | -------------------- |
| [如何選擇合適的 AI 模型？](/zh-Hant/faq/model-selection-guide)                               | 按場景、成本、速度三維度選型       |
| [為什麼有些模型我用不了？](/zh-Hant/faq/model-availability)                                    | 部分模型需解鎖權限後才可呼叫       |
| [有沒有既能輸出文本、又能生成圖片的對話式 API？](/zh-Hant/faq/text-and-image-in-one-api)                | 能看圖和能出圖是兩回事，出圖有四條路   |
| [Google 系模型走的是 AI Studio 還是 Vertex？](/zh-Hant/faq/google-upstream-aistudio-vertex) | 預設分組走官轉 AI Studio 線路 |
| [模型名稱字尾 -c 是什麼意思？](/zh-Hant/faq/model-name-suffix-c)                               | 標識不同通道，計費有差別         |
| [為什麼官方網頁版和 API 返回結果不同？](/zh-Hant/faq/webapp-vs-api-difference)                     | 官網帶系統提示詞，API 是裸模型    |
| [API 有類似 ChatGPT 的記憶能力嗎？](/zh-Hant/faq/api-memory)                                 | 沒有，記憶是客戶端讀寫的本地檔案     |
| [為什麼大模型不知道自己的版本號？](/zh-Hant/faq/model-version-identity)                            | 模型自我認知不可靠，不能當依據      |
| [為什麼 Claude 會自稱 Qwen 或 DeepSeek？](/zh-Hant/faq/claude-identity-confusion)          | 身份幻覺，不代表模型被換         |

**接入與引數**

| 問題                                                                       | 一句話答案                              |
| ------------------------------------------------------------------------ | ---------------------------------- |
| [Base URL 怎麼填？/v1、根域名、/v1beta 有什麼區別？](/zh-Hant/faq/base-url-config)      | 按 OpenAI / Claude / Gemini 三種格式分別填 |
| [流式和非流式呼叫有什麼區別？](/zh-Hant/faq/streaming-vs-non-streaming)                | 由請求體的 `stream` 決定，內容與計費口徑一致        |
| [max\_tokens 是什麼？不設定會怎樣？](/zh-Hant/faq/max-tokens)                       | 控制最大輸出長度，不設有預設值                    |
| [API 可以開多少併發？](/zh-Hant/faq/api-concurrency)                             | 分模型型別限制，可申請提額                      |
| [如何避免介面超時？](/zh-Hant/faq/timeout-configuration)                          | 放寬客戶端 timeout，推理模型尤其慢              |
| [模型呼叫報錯怎麼排查？](/zh-Hant/faq/model-error-troubleshooting)                  | 引數、鑑權、429、5xx、超時逐項對號入座             |
| [日誌顯示呼叫已完成並扣費，客戶端卻收不到響應，怎麼排查？](/zh-Hant/faq/log-duration-vs-client-wait) | 兩個時鐘量的不是同一段，先把差值測出來                |

**出圖相關**

| 問題                                                                                                     | 一句話答案                                                     |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| [Nano Banana 系列出圖失敗，常見原因有哪些？](/zh-Hant/faq/nano-banana-image-failure)                                  | 多數是觸發谷歌內容安全機制                                             |
| [為什麼 Gemini 圖片介面返回 NO\_IMAGE？](/zh-Hant/faq/gemini-no-image)                                           | 成因與風控攔截不同，需單獨排查                                           |
| [白底圖出現黑點 / 髒塊 / 模糊色塊怎麼辦？](/zh-Hant/faq/white-background-image-artifacts)                               | 提示詞改用淺色背景可規避                                              |
| [banana pro 改圖後畫面偏紅怎麼辦？](/zh-Hant/faq/banana-pro-edit-red-cast)                                        | 切換 Vertex 通道，或改用 `gpt-image-2`                            |
| [Nano Banana Pro 服裝換裝時印花變形如何最佳化？](/zh-Hant/faq/nano-banana-pro-print-distortion)                       | 提示詞、參考圖權重與跨通道兜底                                           |
| [接入模型後生成的圖片和參考圖相差很大怎麼辦？](/zh-Hant/faq/image-result-differs-from-reference)                             | 參考圖必須用 base64 格式上傳                                        |
| [怎麼生成透明背景的圖片（PNG 摳圖）？](/zh-Hant/faq/image-transparent-background)                                      | `gpt-image-2` 傳 `background: "transparent"` 直接出帶 alpha 的圖 |
| [上傳圖片報 image content does not match MIME type 怎麼解決？](/zh-Hant/faq/image-mime-type-mismatch-with-query) | 去掉圖片 URL 末尾的 CDN 處理引數                                     |
| [GPT Image 輸出 token 為什麼這麼高？](/zh-Hant/faq/gpt-image-output-token-calculation)                          | 解析度、品質、寬高比與張數直接放大輸出 token                                 |
| [用 Codex 接 GPT-Image 出圖，報金鑰認證失敗怎麼辦？](/zh-Hant/faq/gpt-image-incorrect-api-key-openai)                  | 報錯來自 OpenAI，請求根本沒到 API易                                   |
| [圖片生成有非同步介面嗎？支援任務 ID 查詢結果嗎？](/zh-Hant/faq/image-async-api)                                             | 均為同步呼叫，無任務 ID 查詢                                          |

**影片相關**

| 問題                                                                             | 一句話答案                          |
| ------------------------------------------------------------------------------ | ------------------------------ |
| [Seedance 影片任務提交後可以取消嗎？](/zh-Hant/faq/seedance-video-task-cancel)              | 介面沒有取消能力，重點是別重複提交              |
| [如何按 task\_id 查一條 Seedance 影片的真實消費？](/zh-Hant/faq/seedance-task-cost-lookup)   | 兩條扣費記錄與任務 quota 的對賬口徑          |
| [Seedance 2.0 呼叫時人臉參考圖會自動上傳素材庫嗎？](/zh-Hant/faq/seedance2-asset-face-reference) | 不會，必須先入庫拿 `asset://` 素材 ID 再引用 |
| [Seedance 2.0 / 2.5 人臉素材為什麼被攔截？](/zh-Hant/faq/seedance2-face-asset-whitelist)  | 真人臉需素材入庫並完成真人認證                |

### 🌐 網路與連線（7 篇）

| 問題                                                                      | 一句話答案                              |
| ----------------------------------------------------------------------- | ---------------------------------- |
| [使用 API 介面需要代理網路嗎？](/zh-Hant/faq/network-proxy)                         | 國內可直連，不需要代理或 VPN                   |
| [Python 報 SSLEOFError、curl 卻正常？](/zh-Hant/faq/openssl-pq-handshake-eof) | OpenSSL 3.5+ 的後量子握手包被中間裝置掐斷        |
| [API易的伺服器在哪裡？應該選擇什麼伺服器？](/zh-Hant/faq/server-location)                  | 節點分佈、延遲測試與選購建議                     |
| [下載 CDN 圖片/影片很慢怎麼辦？](/zh-Hant/faq/cdn-download-slow)                    | 排查海外 CDN 在特定伺服器上的鏈路                |
| [圖片 API 延遲如何最佳化？](/zh-Hant/faq/image-api-network-latency-optimization)  | 連線複用、HTTP/1.1 與超時設定                |
| [網站或介面返回 502 怎麼辦？](/zh-Hant/faq/website-502-error)                      | 容器自動重啟的短暫現象，約 1 分鐘恢復，不計費，30 秒後重試即可 |
| [指令碼報 502 但呼叫日誌裡查不到？](/zh-Hant/faq/proxy-empty-502)                     | 本機代理自造的空 502，指令碼繞開系統代理即可           |

### 👤 賬號與登入（6 篇）

| 問題                                                                 | 一句話答案                       |
| ------------------------------------------------------------------ | --------------------------- |
| [API易 支援哪些郵箱註冊？](/zh-Hant/faq/email-registration)                  | Gmail、Outlook、Foxmail 及高校郵箱 |
| [如何使用 Passkey 登入？](/zh-Hant/faq/passkey-login)                     | 個人中心繫結後可用指紋或面容登入            |
| [GitHub 登入提示「該賬戶已繫結」怎麼辦？](/zh-Hant/faq/github-bindng-bindng-error) | 該 GitHub 賬戶已綁到其他郵箱          |
| [忘記密碼了怎麼辦？](/zh-Hant/faq/forgot-password)                          | 郵箱重置或聯絡客服協助找回               |
| [為什麼提示 API Key 無效？](/zh-Hant/faq/invalid-api-key)                  | Base URL 與 KEY 不配套是最常見原因    |
| [如何登出賬戶？](/zh-Hant/faq/account-deletion)                           | 個人中心一鍵登出，資料不可恢復             |

***

## 💬 沒找到答案？

<CardGroup cols={2}>
  <Card title="使用場景" icon="layout-grid" href="/zh-Hant/scenarios">
    Cherry Studio、Claude Code、Cursor 等具體工具的接入指南
  </Card>

  <Card title="模型價格" icon="circle-dollar-sign" href="/models">
    全部模型的即時定價總表與詳情頁
  </Card>

  <Card title="即時動態" icon="radio-tower" href="/live/index">
    模型狀態、供給變化、故障播報的每日更新
  </Card>

  <Card title="更新公告" icon="megaphone" href="/changelog">
    新模型上線、價格調整、功能更新的公告彙總
  </Card>
</CardGroup>

還是沒解決？歡迎直接聯絡我們：

* 📧 **郵件諮詢**：[support@apiyi.com](mailto:support@apiyi.com)
* 🌐 **訪問控制台**：[api.apiyi.com](https://api.apiyi.com)
* 💰 **檢視價格**：[價格頁面](https://api.apiyi.com/account/pricing)

<Note>
  沒找到的問題歡迎反饋給客服，我們會評估後補進 FAQ。新使用者註冊即可獲得測試額度，可以先跑通再決定是否充值。
</Note>
