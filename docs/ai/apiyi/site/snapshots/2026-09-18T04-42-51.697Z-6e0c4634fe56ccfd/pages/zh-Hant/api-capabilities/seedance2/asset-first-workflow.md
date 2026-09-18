> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 素材優先：更快更穩的帶圖帶影片生成

> 帶圖或帶影片呼叫 Seedance 時，建立任務介面可能幾十秒才返回 task ID，甚至客戶端讀超時。先把素材入庫拿 asset:// 素材 ID 再引用，請求體從數 MB 降到幾十位元組，提交即刻返回，合規校驗也提前到入庫階段。含耗時拆解、超時後的判斷方法與遷移步驟。

<Note>
  **一句話結論**：純文生影片不受影響，秒回任務 ID；**一旦帶圖或帶影片，就先把素材入庫拿 `asset://` 素材 ID，再在生成請求裡引用它**。請求體從數 MB 降到幾十位元組，建立任務介面立刻返回，素材的合規校驗也提前到入庫那一步完成。

  這一頁講的是**提交階段**的提速與穩定性。素材庫各介面的逐個說明見 [素材庫](/zh-Hant/api-capabilities/seedance2/asset-library)，端到端可執行程式碼見 [素材引用實戰](/zh-Hant/api-capabilities/seedance2/asset-reference)。
</Note>

## 先分清：提交慢，還是生成慢

Seedance 是**非同步任務式**介面，一次出片分成兩段，兩段的耗時來源完全不同：

| 階段                                             | 你拿到的                      | 正常耗時                       | 慢下來的原因                                                 |
| ---------------------------------------------- | ------------------------- | -------------------------- | ------------------------------------------------------ |
| **① 提交**：`POST .../generations/tasks`          | 任務 ID `{"id": "cgt-..."}` | 純文生影片**秒級**；帶素材時隨素材體積增長    | 素材要先從你的機器上行到 API易，再由我們轉發到火山引擎並完成解碼校驗——這一整段走完，才會返回任務 ID |
| **② 生成**：輪詢 `GET .../tasks/{id}` 到 `succeeded` | 成片 `content.video_url`    | 通常 **2–5 分鐘**（1080p、長時長更久） | 原廠算力排隊，屬於正常速度                                          |

**兩段是分開的**。「提交花了 60 秒」和「生成花了 5 分鐘」是兩個獨立問題，先看清是哪一段慢再動手——控制台日誌裡那一列是**首位元組耗時**，對應的正是第 ① 段，不是整單出片時間（詳見 [控制台用時與客戶端等待時間為什麼對不上](/zh-Hant/faq/log-duration-vs-client-wait)）。

<Warning>
  **典型誤判**：把帶圖請求的讀超時設成 60 秒，超時後判定「服務不可用」並立刻重發。實際是素材還在上行途中——重發只會讓同一批素材再傳一遍，把上行頻寬搶得更緊，還可能重複建立任務、重複計費。
</Warning>

## 提交階段的三種素材傳法

同一張圖，三種傳法在提交階段的表現差別很大：

| 傳法                       | 請求體體積                         | 拿到任務 ID 的耗時              | 主要風險                          |
| ------------------------ | ----------------------------- | ------------------------ | ----------------------------- |
| **Base64 / Data URL 內聯** | 與素材同量級，編碼後還要再漲約三分之一，常在數 MB 以上 | 隨體積與**你的上行頻寬**線性增長，多張圖疊加 | 客戶端讀超時；每次重試都要把整份素材重傳一遍        |
| **公網 URL**               | 很小，但上游要現場下載素材                 | 取決於**圖源的下行速度**與素材體積      | 圖源慢 / 限速 / 需鑑權 / 跨境時會顯著拖長甚至失敗 |
| **`asset://` 素材 ID**     | 幾十位元組                         | 與純文生影片同一量級               | 需要提前完成一次入庫                    |

前兩種傳法的耗時都不由模型決定，也不在推理側：**它們由鏈路兩端的頻寬和素材體積決定，所以既慢又不穩定**——同一份程式碼，今天 8 秒、明天 90 秒都可能發生。`asset://` 把這段耗時**一次性前置**到入庫階段，之後每次生成都只傳一個短字串。

## 為什麼素材優先不只是更快

<CardGroup cols={2}>
  <Card title="提交耗時與素材體積脫鉤" icon="gauge">
    請求體只剩提示詞和一個素材 ID，建立任務介面的耗時回到純文生影片的量級，客戶端超時按 30–60 秒設定就夠。
  </Card>

  <Card title="重試代價極低" icon="rotate-ccw">
    換提示詞、換比例、換時長重跑時，重發的只是幾十位元組，而不是重傳幾 MB 的素材。
  </Card>

  <Card title="合規校驗前置" icon="shield-check">
    素材在**入庫**時就完成校驗並輪詢到 `Active`，不合規當場暴露，不必等生成任務跑到一半才 `failed`。
  </Card>

  <Card title="素材可反覆引用" icon="repeat">
    入庫一次即可長期複用，同一角色跨鏡頭、跨集引用同一個素材 ID，人物一致性也更好。
  </Card>
</CardGroup>

還有一條是**硬性要求**而不是最佳化：含寫實人臉的素材**不能**直接作參考圖（防深偽攔截），必須先入庫拿 `asset://` 再引用，詳見 [素材庫](/zh-Hant/api-capabilities/seedance2/asset-library)。

## 怎麼改：三步

<Steps>
  <Step title="把素材入庫，拿到素材 ID">
    網頁零程式碼上傳或走 API 批次入庫都行，兩條路資料互通，見 [素材庫](/zh-Hant/api-capabilities/seedance2/asset-library)。入庫後輪詢到狀態 `Active` 即可使用，單張圖片約 13 秒。

    素材庫隨 Seedance 介面**免費使用、不另收年費**。
  </Step>

  <Step title="生成請求裡把內聯資料換成 asset://">
    `content` 結構、`role`、其餘引數全都不用動，只把 `image_url.url` 的值從 Data URL 換成 `asset://<Id>`。提示詞裡用「圖片1」「圖片2」按傳入順序指代素材，**不要在提示詞裡直接寫素材 ID**。
  </Step>

  <Step title="把素材 ID 存進你自己的庫">
    素材 ID 可長期複用，入庫一次就別再重複上傳同一張圖。建議在業務表裡記下「本地素材 → 素材 ID」的對映，後續出片直接取用。
  </Step>
</Steps>

改動前後只差一個欄位的值：

```json 改前：整張圖內聯在請求體裡，請求體數 MB 起 theme={null}
{
  "model": "doubao-seedance-2-0-260128",
  "content": [
    { "type": "text", "text": "圖片1中的人物正面微笑，鏡頭緩慢推近" },
    { "type": "image_url",
      "image_url": { "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg……（數百萬字元）" },
      "role": "reference_image" }
  ],
  "ratio": "adaptive", "duration": 5, "resolution": "720p"
}
```

```json 改後：請求體幾百位元組，提交即刻返回任務 ID theme={null}
{
  "model": "doubao-seedance-2-0-260128",
  "content": [
    { "type": "text", "text": "圖片1中的人物正面微笑，鏡頭緩慢推近" },
    { "type": "image_url",
      "image_url": { "url": "asset://asset-2026090200000000-abcde" },
      "role": "reference_image" }
  ],
  "ratio": "adaptive", "duration": 5, "resolution": "720p"
}
```

完整可執行指令碼（上傳 → 入庫 → 引用出片 → 下載）見 [素材引用實戰](/zh-Hant/api-capabilities/seedance2/asset-reference)。

## 首尾幀場景怎麼辦

首尾幀（`role: "first_frame"` / `"last_frame"`）與多模態參考（`role: "reference_image"`）是**兩種互斥的輸入模式**，語義不同，別混著改：

* **確實需要精確的起止畫面**（比如要與上一段影片嚴絲合縫銜接）：保持首尾幀模式，把內聯的 Data URL 換成**公網 URL**——請求體立刻從數 MB 降到幾百位元組，剩下的下載耗時移到上游側。圖片放在直連快、無鑑權、頻寬足的物件儲存上。
* **本質訴求是「人物 / 場景保持一致」**，起止畫面不必逐畫素對齊：改用**多模態參考生影片** + `asset://` 素材 ID，這是最穩的一條路，也是本頁推薦的做法。

<Tip>
  想連續拼長影片的話不必自己截尾幀：生成時傳 `return_last_frame: true`，可以拿到無水印的尾幀 png，直接作為下一段任務的首幀。
</Tip>

## 參考影片與音訊

參考影片（`role: "reference_video"`）體積比圖片大一個量級，**內聯 Base64 是最容易觸發提交超時的用法**，務必避免：

* **優先用公網 URL**，放在直連快、無鑑權、頻寬足的物件儲存上；
* 真人素材組支援影片 / 音訊入庫（影片 mp4 / mov、2–15 秒、少於 50MB；音訊 mp3 / wav、2–15 秒、少於 15MB），走 [素材庫](/zh-Hant/api-capabilities/seedance2/asset-library) 的真人認證流程；
* 順帶一提，帶參考影片的任務會命中**更低的一檔單價**：輸入含影片 \$7.56 / 百萬 tokens，不含影片 \$12.60，見 [概覽的模型定價](/zh-Hant/api-capabilities/seedance2/overview)。

## 已經超時了怎麼辦

建立任務的 POST 請求超時時，**客戶端無法判斷服務端是否已經建立任務**——連響應頭都沒收到，也就拿不到任務 ID 去查詢。按下面的順序處理：

<Steps>
  <Step title="先查有沒有產生記錄，別急著重發">
    到 API易 控制台的日誌 / 賬單裡按那個時刻查：**有對應記錄就說明任務已經建立並計費**，任務 ID 也在記錄裡，直接拿去輪詢即可；查不到記錄才說明請求沒走到底。盲目重發會重複建立、重複計費。
  </Step>

  <Step title="把讀超時和素材傳法一起調">
    只調大讀超時是治標。改成 `asset://` 之後，建立請求的超時按 **30–60 秒**設定就足夠（非同步介面本身很快，耗時在任務側）。仍需內聯大素材時，把連線超時與讀超時**分開設定**，讀超時按素材體積和你的上行頻寬估算。
  </Step>

  <Step title="降併發再排查">
    同時發多個帶大素材的建立請求，會互相搶佔同一條上行頻寬，表現成「幾個請求全都卡在超時值上整點超時」。先降到單發驗證通過，再逐步加併發。
  </Step>

  <Step title="核對 Base URL">
    不同 Base URL 的網路路徑不同，大體積上行的表現可能有差異。可以在你的伺服器上對幾個可用節點各測一次提交耗時，選最快的那個。節點清單與選擇方法見 [Base URL 怎麼配](/zh-Hant/faq/base-url-config)。
  </Step>
</Steps>

超時排查的通用方法（客戶端 timeout 該設多少、逐層排查順序）見 [如何避免介面超時](/zh-Hant/faq/timeout-configuration)。

## 常見問題

<AccordionGroup>
  <Accordion title="純文生影片也要先走素材庫嗎？">
    不需要。沒有素材輸入時請求體就是一段提示詞，建立任務介面秒回任務 ID，本頁講的問題完全不存在。
  </Accordion>

  <Accordion title="入庫那一步本身要多久？會不會只是把耗時挪了個位置？">
    單張圖片約 13 秒完成預處理並輪詢到 `Active`，全自動、無人工稽核。

    關鍵在於**這一步只做一次**：同一份素材後續可以無限次引用，而內聯上傳是**每次生成都要重來一遍**。出片量越大，差距越明顯。
  </Accordion>

  <Accordion title="素材 ID 會過期嗎？">
    不會。素材 ID 入庫後可長期複用，不像成片連結那樣有有效期。素材按 icover.ai 賬號隔離，你只能看到和使用自己的素材。
  </Accordion>

  <Accordion title="用素材庫要額外收費嗎？">
    不需要。素材庫隨 Seedance 介面**免費使用、不另收年費**。官方側的私域素材庫對非框架簽約客戶是十萬元量級的年費單獨採購。
  </Accordion>

  <Accordion title="生成好的影片連結能存多久？">
    `content.video_url` 是**24 小時有效**的簽名直鏈，任務成功後請立即轉存到自己的儲存，不要把它當作長期地址對外分發。
  </Accordion>

  <Accordion title="素材庫 KEY 和 Seedance 令牌是同一把嗎？">
    不是，兩把鑰匙不要混用：**素材庫 KEY** 在 icover.ai 建立，只用於上傳 / 入庫 / 查詢素材；**APIYI Seedance 影片令牌** 在 api.apiyi.com 建立、須勾選 `SeeDance2` 分組，只用於影片生成介面。
  </Accordion>
</AccordionGroup>

## 相關頁面

<CardGroup cols={3}>
  <Card title="素材庫" icon="images" href="/zh-Hant/api-capabilities/seedance2/asset-library">
    素材庫全部介面、網頁零程式碼操作與真人認證
  </Card>

  <Card title="素材引用實戰" icon="clapperboard" href="/zh-Hant/api-capabilities/seedance2/asset-reference">
    上傳入庫到出片下載的端到端可執行指令碼
  </Card>

  <Card title="Seedance 2.0 / 2.5 概覽" icon="sparkles" href="/zh-Hant/api-capabilities/seedance2/overview">
    模型選型、定價、解析度畫素表與常見問題
  </Card>
</CardGroup>
