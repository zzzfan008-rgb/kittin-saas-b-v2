> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 素材庫（人物一致性影片）

> 通過 icover.ai 素材庫開放 API（API易旗下），上傳圖片入庫拿到 asset:// 素材 ID，再經 API易 閘道生成人物一致性影片。支援網頁零程式碼操作與 REST API 批次接入，隨 Seedance 2.0 介面免費使用、不另收年費。

<Info>
  **icover.ai** 是 API易（apiyi）旗下的子產品，一個用於測試 AI 影片生成的線上工具。本素材庫及配套 API，是幫助開發者與客戶落地「人物一致性影片」業務的服務。
</Info>

<Note>
  **素材庫在 API易 免費使用，不另收年費。** 官方側這項能力對非框架簽約客戶需十萬元量級的年費單獨採購（官網也提供購買入口）；我們重視長期使用者，已把它包含在 [Seedance 2.0](/zh-Hant/api-capabilities/seedance2/overview) 的介面價格裡。面向正常呼叫 SD2 介面的客戶，正常業務量內不額外計費。
</Note>

## 為什麼需要素材庫

Seedance 2.0 生成「人物一致性」影片時，**不能直接上傳含人臉的參考圖**（防深偽攔截），必須先把圖片入庫成「可信素材」，拿到一個 `asset://xxx` 形式的素材 ID，再在影片生成請求裡引用它。

本服務替你完成入庫：你只需要**上傳圖片 → 拿到素材 ID → 生成影片**。有兩種用法，資料完全互通：

| 用法         | 適合誰           | 需要什麼        |
| ---------- | ------------- | ----------- |
| **網頁操作**   | 所有人，零程式碼      | 註冊登入即可      |
| **API 呼叫** | 需要程式化批次接入的開發者 | 一個「素材庫 KEY」 |

<Tip>
  **互通說明**：同一個賬號，網頁上傳的素材和 API 上傳的素材在同一個素材庫裡——API 建的素材會出現在網頁的「素材列表 / 存檔」和影片生成器的參考圖選擇器中，網頁建的素材也能通過 API 列出。

  **素材庫跟著 icover.ai 賬號走，不跟 KEY 走**：同一賬號下建立的所有素材庫 KEY 等價，訪問的是同一套素材庫——KEY 只是呼叫憑證，不承擔隔離。素材按賬號隔離，你永遠只能看到 / 操作自己的素材。隔離與多部門共享的具體方案見下方[常見問題](#常見問題)。
</Tip>

<Warning>
  **兩把鑰匙，不要混用**：

  * **素材庫 KEY**（icover.ai 建立，`sk-...`）：只用於本頁的素材庫介面（上傳 / 入庫 / 查詢 / 刪除）。
  * **APIYI Seedance 影片令牌**（api.apiyi.com 建立，`sk-...`，須勾選 `SeeDance2` 分組，2.5 與 2.0 系通用）：只用於影片生成介面。
</Warning>

## 方式一：網頁操作（推薦新手）

<Steps>
  <Step title="註冊登入">
    開啟 [icover.ai 素材庫頁面](https://icover.ai/zh/seedance-official/asset-library)，註冊 / 登入。
  </Step>

  <Step title="上傳入庫">
    在「虛擬人像入庫」Tab：選擇圖片（可多選）→ 點「上傳併入庫」。

    * 素材組可以不選，系統自動使用你的「預設素材組」；想按人物分組管理就先新建一個組
    * 圖片要求：jpeg / png / webp / bmp / tiff / gif / heic；寬高比 0.4–2.5；邊長 300–6000px；單張少於 30MB
  </Step>

  <Step title="複製素材 ID">
    等待十幾秒，狀態變「可用」後，複製 `asset://xxx` 素材 ID。
  </Step>

  <Step title="生成影片">
    到 [icover.ai 影片生成器](https://icover.ai/zh/seedance-official) 生成影片：參考圖選「多模態」模式，型別選「素材」，選中你的素材，提示詞裡用「圖片1」指代人物。
  </Step>
</Steps>

**真人素材（網頁版）**：「真人認證」Tab 三步走——① 點「生成真人認證連結」，讓藝人手機掃碼 / 開啟連結，登入其火山賬號完成活體認證；② 點「查詢認證結果」，得到該藝人專屬的真人素材組；③ 選中該組，上傳素材（圖片 / 影片 / 音訊），通過人臉一致性校驗後拿到 `asset://` ID。同一藝人換妝造複用同一組，無需重複認證。

<Frame caption="素材庫網頁端：「虛擬人像入庫」Tab 手動上傳入庫，「素材列表 / 存檔」Tab 查詢素材、複製 asset:// ID，「真人認證」Tab 完成真人素材認證與上傳">
  <img src="https://mintcdn.com/apiyillc/KMuJVpzJvYYPxQax/images/seedance2-asset-library-web-ui.jpg?fit=max&auto=format&n=KMuJVpzJvYYPxQax&q=85&s=1a1b0294e87aeba902589f59f22ca330" alt="SeeDance 2.0 素材庫網頁操作介面：素材列表頁展示素材卡片，含可用狀態標籤、asset:// 素材 ID 複製按鈕與刪除按鈕" width="1600" height="1013" data-path="images/seedance2-asset-library-web-ui.jpg" />
</Frame>

<Tip>
  **人物一致性小技巧**：同一人物的「全身正面圖 + 人臉正面無表情特寫」放進同一個素材組，效果最好。
</Tip>

## 方式二：API 呼叫（開發者）

### 第 0 步：建立素材庫 KEY

登入 icover.ai 後到「設定 → 素材庫 KEY」（`icover.ai/zh/settings/apikeys`）建立一個 KEY，格式 `sk-...`。

<Frame caption="設定 → 素材庫 KEY：點「建立素材庫 KEY」，複製生成的 sk-... 金鑰（注意與左側「API易 Token」區分）">
  <img src="https://mintcdn.com/apiyillc/KMuJVpzJvYYPxQax/images/seedance2-asset-library-key-create.png?fit=max&auto=format&n=KMuJVpzJvYYPxQax&q=85&s=b7aef248abd888990cc0890de84d93cc" alt="icover.ai 設定頁面的素材庫 KEY 管理介面，包含建立素材庫 KEY 按鈕和已建立金鑰列表" width="1600" height="679" data-path="images/seedance2-asset-library-key-create.png" />
</Frame>

之後所有素材庫請求帶上請求頭：

```
Authorization: Bearer sk-你的素材庫KEY
```

### 第 1 步：上傳檔案，拿公網 URL

素材檔案（圖片；真人素材還支援影片 / 音訊）需要先變成一個公網可訪問的 URL。兩種途徑任選：

**A. 已有公網 URL**（你自己的 CDN / 圖床）→ 跳過，直接到第 2 步。

**B. 傳到我們的儲存**（兩步：申請直傳地址 → PUT 檔案）：

```bash theme={null}
# 1. 申請直傳地址
curl -X POST https://icover.ai/api/storage/presign \
  -H "Authorization: Bearer sk-你的素材庫KEY" \
  -H "Content-Type: application/json" \
  -d '{"ext":"jpg","contentType":"image/jpeg"}'
# → { "code":0, "data": { "uploadUrl":"...", "publicUrl":"https://cdn.icover.ai/..." } }

# 2. 把檔案 PUT 到 uploadUrl（注意 Content-Type 要和申請時一致）
curl -X PUT "剛才返回的uploadUrl" \
  -H "Content-Type: image/jpeg" \
  --data-binary @portrait.jpg
# 成功後，publicUrl 就是你的檔案公網地址
# 影片/音訊同理：ext/contentType 換成 mp4/video/mp4、mp3/audio/mpeg 等
```

### 第 2 步：素材入庫

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/assets \
  -H "Authorization: Bearer sk-你的素材庫KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://cdn.icover.ai/uploads/seedance/xxx.jpg",
    "label": "藝人A-正面"
  }'
# → 火山原始響應: { ..., "Result": { "Id": "asset-20260702xxxx-xxxxx" } }
```

* `groupId` 可不傳：自動使用 / 建立你的「預設素材組」。想分組：先 `POST /api/asset-library/groups {"name":"藝人A"}` 拿組 ID，再在這裡帶上 `"groupId":"group-xxx"`
* `label` 可選，便於在網頁端識別

### 第 3 步：輪詢到「可用」

入庫是非同步的（單圖約 13 秒，無 SLA），拿到 Id 後輪詢：

```bash theme={null}
curl https://icover.ai/api/asset-library/assets/asset-20260702xxxx-xxxxx \
  -H "Authorization: Bearer sk-你的素材庫KEY"
# → Result.Status == "Active" 即可用；"Failed" 需重傳
```

建議每 3 秒查一次，90 秒未 `Active` 視為超時排查。

### 第 4 步：用素材 ID 生成影片（經 APIYI）

素材 ID 寫成 `asset://<Id>`，用**你自己的 APIYI Seedance 影片令牌**（不是素材庫 KEY）調 APIYI：

```bash theme={null}
curl -X POST https://api.apiyi.com/seedance/api/v3/contents/generations/tasks \
  -H "Authorization: Bearer sk-你的APIYI令牌" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seedance-2-0-260128",
    "content": [
      {"type":"text","text":"圖片1中的人物正面微笑，鏡頭緩慢推近，自然光"},
      {"type":"image_url","image_url":{"url":"asset://asset-20260702xxxx-xxxxx"},"role":"reference_image"}
    ],
    "ratio":"16:9","duration":5,"resolution":"720p"
  }'
# 返回 task id，輪詢 GET .../tasks/{id} 直到 status=succeeded，取 content.video_url
```

<Warning>
  提示詞裡用「圖片1」指代素材，**不要寫 asset ID 原文**。
</Warning>

模型選型、定價、解析度表見 [Seedance 2.0 概覽](/zh-Hant/api-capabilities/seedance2/overview)，影片生成介面詳細引數見 [影片生成 API](/zh-Hant/api-capabilities/seedance2/video-generation)。完整可執行的端到端指令碼（上傳 → 入庫 → 出片 → 下載）見 [素材引用實戰](/zh-Hant/api-capabilities/seedance2/asset-reference)。

### 完整介面一覽

| 介面                                             | 方法                    | 說明                                                                                                                                                                                  |
| ---------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/storage/presign`                         | POST                  | 申請檔案直傳地址 `{ext?, contentType?}`                                                                                                                                                     |
| `/api/asset-library/groups`                    | POST / GET            | 建素材組 `{name, description?}` / 列自己的組（含真人組）                                                                                                                                           |
| `/api/asset-library/assets`                    | POST / GET            | 入庫 `{groupId?, imageUrl, label?, assetType?}`（assetType 可選 `Image` / `Video` / `Audio`，預設 Image）/ 列素材（`?groupId=`、`?pageNumber=`、`?pageSize=` 均可選，預設第 1 頁、每頁 100 條，pageSize 上限 100） |
| `/api/asset-library/assets/{id}`               | GET / DELETE / PATCH  | 查狀態 / 刪除 / 改標籤 `{label}`                                                                                                                                                            |
| `/api/asset-library/real-person/sessions`      | POST / GET            | 發起真人認證 `{name?}` → 返回 H5 認證連結與查詢憑證 / 列自己的認證會話                                                                                                                                       |
| `/api/asset-library/real-person/sessions/{id}` | POST / PATCH / DELETE | 查詢認證結果（成功返回真人素材組 GroupId）/ 改名 `{name}` / 刪除記錄                                                                                                                                       |
| `/api/asset-library/records`                   | GET                   | 你的素材 + 真人認證歸檔（網頁端資料來源）                                                                                                                                                              |

**響應約定**：

* **單條介面**（建組 / 入庫 / 查狀態 / 刪除）成功與失敗均為**火山引擎原始 JSON 原文透傳**。
* **列表介面**（`groups` / `assets` 的 GET）是我們合併、並過濾到你本人之後的結果，**不是逐位元組原文**：火山原有欄位一個不動，另附加少量以 `_` 開頭的自有元資訊欄位（如 `_library`）。**解析時請忽略未知的 `_` 字首欄位**，後續新增這類欄位不視為破壞性變更。
* 我們自身的錯誤為純文本、以 `[client] ` 字首標識（400/401/403/404/502）。
* `records`、`real-person/sessions` 的 GET/PATCH/DELETE、資產 `PATCH` 為 `{code, message, data}` JSON（code 0 = 成功）。

## 真人人臉素材（全自動 API）

真人肖像必須由被拍攝者（藝人）本人完成一次**活體認證**，從根源鎖定肖像權歸屬。整條鏈路已全部 API 化，網頁端「真人認證」Tab 是同一流程的介面版：

### 第 1 步：發起認證，拿 H5 連結

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/real-person/sessions \
  -H "Authorization: Bearer sk-你的素材庫KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"藝人A"}'
# → 火山原文: { "Result": { "BytedToken":"2026...", "H5Link":"https://ark.volcengine.com/..." } }
```

* `H5Link` 發給藝人，**手機開啟**（或轉成二維碼掃碼），登入其個人火山賬號後完成活體認證。受光線 / 角度影響可能不通過，重試即可
* `BytedToken` 是查詢憑證，我們已隨會話儲存；`GET /api/asset-library/real-person/sessions` 可隨時列出你的會話（含 id / status / h5Link）

### 第 2 步：藝人完成認證後，查詢結果

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/real-person/sessions/{會話id} \
  -H "Authorization: Bearer sk-你的素材庫KEY"
# 認證完成 → { "Result": { "GroupId": "group-xxxx" } }  ← 該藝人專屬真人素材組
# 尚未完成 → 404 NotFound.<token>（火山原文；屬正常現象，完成認證後再查）
```

拿到 `GroupId` 後，會話狀態變 `authorized`，真人素材組已自動歸檔到你的賬號（網頁端「素材組」裡也能看到）。**注意**：藝人未完成認證時查詢同樣返回 `NotFound`，與憑證失效無法區分；連結長期未用可能失效，重新發起一次會話即可。

### 第 3 步：向真人組提交素材

與虛擬人像同一個入庫介面，帶上真人組的 `groupId`；支援圖片 / 影片 / 音訊：

```bash theme={null}
curl -X POST https://icover.ai/api/asset-library/assets \
  -H "Authorization: Bearer sk-你的素材庫KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "group-xxxx",
    "imageUrl": "https://cdn.icover.ai/uploads/seedance/xxx.jpg",
    "label": "藝人A-正面全身",
    "assetType": "Image"
  }'
```

之後同樣輪詢到 `Active`，用 `asset://<Id>` 生成影片（第 4 步不變）。

**真人素材規則與格式**：

* 一個真人組只能錄**同一個人**；同一藝人換妝造複用同一組，無需重複認證
* 每次上傳都做**人臉一致性校驗**（影片隔秒抽幀全部通過才入庫），側臉 / 多人 / 模糊會導致失敗，建議清晰正面素材
* 圖片少於 30MB；影片 mp4 / mov、2–15 秒、≤50MB、寬高比 0.4–2.5；音訊 mp3 / wav、2–15 秒、≤15MB

## 注意事項

<Warning>
  **asset:// ID 請當作秘密保管**：素材已在本服務層做隔離（防列出、防刪除），但火山側無法按 ID 鑑權，ID 洩露後同通道的其他呼叫方可以在生成請求裡引用它。素材歸屬與隔離模型詳見下方[常見問題](#常見問題)。
</Warning>

* **圖片 URL 有效期**：查詢 / 列表返回的素材圖片預覽 URL 是約 12 小時有效的臨時地址，不要長期快取；素材 ID 永久有效
* **限流**（火山賬號級）：查狀態 100 QPS，入庫等其他操作約 10 QPS，請控制併發並做失敗重試
* **網頁端狀態同步**：API 入庫後若從未查詢過狀態，網頁「存檔」裡可能顯示「處理中」，到列表頁點「拉取列表」即同步為真實狀態

火山官方參考文件（複製到瀏覽器開啟）：私域素材庫指南 `volcengine.com/docs/82379/2333565`、錄入真人形象素材 `volcengine.com/docs/82379/2315856`。

## 常見問題

<AccordionGroup>
  <Accordion title="和直接傳參考圖相比，素材庫有什麼不同？">
    直接傳參考圖不能包含寫實人臉（防深偽攔截會拒絕）。素材庫把人像入庫成可信素材後，`asset://` ID 可以在任意多個生成任務裡反覆引用，同一角色跨集、跨鏡頭保持臉部和服裝一致——適合漫劇、短劇、IP 角色等系列內容。真人也可以出鏡：先走上文的「真人認證」流程即可。
  </Accordion>

  <Accordion title="素材庫要額外付費嗎？和自己去官方開通有什麼區別？">
    在 API易 **免費**，隨 Seedance 2.0 介面使用即可，不另收年費、不需要單獨簽約。

    官方側的私域素材庫對**非框架簽約客戶是單獨收費**的，需要十萬元量級的年費採購（官網也提供購買入口）——也就是說，自己去開通的話，除了模型呼叫費還要多一筆年費，且通常伴隨企業資質與商務流程。走 API易 則只需一把 Seedance 影片令牌，素材庫能力開箱即用。

    我們重視長期使用者，這項成本已包含在介面價格裡；面向正常呼叫 SD2 介面的客戶，正常業務量內不額外計費。
  </Accordion>

  <Accordion title="素材庫是跟賬號走還是跟 KEY 走？素材隔離是怎麼實現的？">
    一句話概括：**icover.ai 隔離素材，API易 統一呼叫——生成側只認素材 ID，持有即可引用。**

    跟**賬號**走。底層架構是：icover.ai 所有使用者背後是 API易 統一的火山引擎大賬號，素材庫歸屬這個大賬號；icover.ai 在服務層做了一層**按賬號的隔離**——每個賬號只能列出 / 查詢 / 刪除自己的素材，看不到其他人的素材 ID。

    KEY 不承擔隔離：同一賬號下的多個素材庫 KEY 等價，訪問的是同一套素材庫。如果你有素材隔離需求（比如多客戶、多業務線的資料要分開），**為每一方註冊獨立的 icover.ai 賬號**、各自建立 KEY——在同一賬號下新建 KEY 是無法實現隔離的。

    安全邊界要注意：這層隔離覆蓋的是"列出 / 查詢 / 刪除"，但火山側無法按 ID 鑑權——`asset://` ID 一旦洩露，同通道的其他呼叫方就可以在生成請求裡引用它，務必把素材 ID 當作秘密保管。
  </Accordion>

  <Accordion title="素材會儲存在你們（API易 / icover.ai）自己的伺服器上嗎？">
    分兩種情況，取決於你怎麼把檔案給我們：

    * **你自己提供公網 URL**（你的 CDN / 圖床）：原檔案**不經過我們**，我們只把這個地址轉給火山。
    * **走 `/api/storage/presign` 上傳**：檔案會先存進我們的物件儲存（`cdn.icover.ai`）拿到公網地址，再把地址轉給火山。**這份原檔案會保留在我們的儲存上。**

    兩種方式素材本體最終都進入火山側處理，處理完成後返回一個 `asset://` ID。**我們自己的資料庫只儲存這個 ID 與你賬號的歸屬關係**（用於上一條的「按賬號隔離」），不記錄素材內容本身。

    真人素材還有額外的強約束：必須由被拍攝者本人完成**活體掃臉認證**（登入本人火山賬號做人臉識別），從源頭鎖定肖像權歸屬，無法由他人代為認證，具體流程見上文「真人人臉素材」。
  </Accordion>

  <Accordion title="公司內多個部門 / 團隊，怎麼共享或隔離素材庫？">
    **共享一套素材庫（推薦，最簡單）**：一個賬號 + 一個 KEY 即可。素材 ID 由你們自己的系統統一管理，把 `asset://` ID 分發給各部門——ID 持有即可在影片生成請求裡引用（生成影片用的是各部門自己的 APIYI Seedance 影片令牌，與素材庫 KEY 無關）。也可以在同一賬號下建多個 KEY 分發給不同部門（便於憑證輪換 / 回收），這些 KEY 訪問的仍是同一套素材庫。

    **部門間素材隔離**：為每個部門註冊獨立的 icover.ai 賬號、各自建立 KEY。注意隔離的是"列出 / 查詢 / 刪除"——素材 ID 洩露後仍可被引用，跨部門也不要隨意擴散 ID。
  </Accordion>

  <Accordion title="是滿血版的 SeeDance 2.0 嗎？">
    是。APIYI 的 Seedance 通道就是官方完整能力的 `doubao-seedance-2-5-260628` 與 `doubao-seedance-2-0-260128`，模型引數、解析度、時長與官方一致，無任何裁剪。模型詳情與定價見 [Seedance 2.0 / 2.5 概覽](/zh-Hant/api-capabilities/seedance2/overview)。
  </Accordion>

  <Accordion title="用 AI 生成的寫實人像算「真人」嗎？上傳就代表授權嗎？">
    不算真人。現實中不存在對應人物的 AI 生成寫實人像（比如用 Nano Banana 等模型生成的人物）屬於**虛擬人**，直接走「虛擬人像入庫」即可，沒有授權環節。只有**真實存在的人**的照片才是「真人人臉」——這類圖片上傳不等於授權，虛擬人像入庫通道也不接受，必須被拍攝者本人完成活體認證（見上文「真人人臉素材」）。

    三類人物素材的區別：

    | 素材型別           | 例子                 | 怎麼用                                         |
    | -------------- | ------------------ | ------------------------------------------- |
    | 動漫 / 風格化角色     | 二次元、卡通、3D 卡通角色     | 不含寫實人臉，一般不觸發攔截：直接用公網 URL / Base64 作參考圖，無需入庫 |
    | 虛擬人（AI 生成寫實人像） | 模型生成、現實中無此人（見下圖示例） | 走本頁「虛擬人像入庫」，拿 `asset://` ID 引用              |
    | 真人人臉           | 藝人、模特、使用者本人的照片     | 走「真人認證」全自動 API 流程，本人活體認證後即可使用               |

    <Frame caption="虛擬人畫素材示例：AI 生成的寫實人像，現實中不存在對應真人。人臉正面特寫 + 全身正面 / 側面 / 背面放進同一素材組，人物一致性最好">
      <img src="https://mintcdn.com/apiyillc/KMuJVpzJvYYPxQax/images/seedance2-virtual-avatar-example.jpg?fit=max&auto=format&n=KMuJVpzJvYYPxQax&q=85&s=64f656c3a49a8c678bf439d2d9b66552" alt="虛擬人畫素材示例：同一 AI 生成古裝女性角色的人臉特寫與全身正面、側面、背面檢視" width="1600" height="900" data-path="images/seedance2-virtual-avatar-example.jpg" />
    </Frame>
  </Accordion>

  <Accordion title="像真人的數字人（虛擬人），需要稽核嗎？">
    不需要。虛擬人像入庫是全自動的，沒有人工稽核、沒有授權環節：上傳後系統自動預處理，約 13 秒狀態變「可用」，拿到 `asset://` ID 即可直接用於影片生成。只有**真人人臉**素材需要被拍攝者本人完成活體認證（見上文「真人人臉素材」）。
  </Accordion>

  <Accordion title="在其他渠道商已入庫 / 已認證的素材，能遷移過來嗎？">
    不能直接複用。火山的素材庫和真人認證都**跟隨底層賬號**：在其他渠道商入庫拿到的 `asset://` ID 屬於對方的火山賬號，在 APIYI 通道引用會報 `asset not found`，需要在本服務重新入庫。

    * **虛擬人畫素材**：可以程式化批次遷移——寫一個指令碼把原素材圖片按本頁 API 重新上傳入庫，拿到新的 `asset://` ID 後，把你係統裡的舊 ID 更新為新 ID 即可。建議在自己系統裡維護一層「素材 ID 對映」，業務側只存自己的內部 ID，日後切換渠道只需更新對映，不用動業務資料。
    * **真人認證素材**：真人認證同樣跟隨賬號，**無法遷移，必須重新認證**——需要被拍攝者本人重新完成活體認證（見上文「真人人臉素材」）。
    * **C 端產品建議**：存量素材多的 C 端產品，虛擬素材由後臺程式靜默遷移，使用者無感知；涉及真人認證的部分，可以借「系統升級 / 新版本上線」的時機引導使用者重新完成認證，體驗上更自然。
  </Accordion>
</AccordionGroup>

## 聯絡我們

接入過程中遇到任何問題（入庫失敗、真人認證、批次接入、正式令牌申請等），歡迎隨時與我們交流：聯絡方式見 [api.apiyi.com](https://api.apiyi.com) 網站首頁。
