> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片 API 呼叫須知與最佳實踐

> API易 圖片 API 全部為同步呼叫：沒有非同步任務 ID，斷開連線結果丟失但仍會計費。提供各模型 timeout 推薦值、base64 與 URL 輸出對照表。

<Info>
  **一句話結論**：API易 所有圖片模型均為**同步呼叫**——發出請求後保持連線等待，生成結果直接在響應裡返回。沒有非同步任務 ID、沒有輪詢介面；客戶端提前斷開，這次的結果就拿不回來了，但請求仍會計費。因此，**留足 timeout 是圖片 API 開發的第一原則**。
</Info>

## 三個必須先知道的事實

<CardGroup cols={3}>
  <Card title="全部同步呼叫" icon="arrow-right-left">
    一次 HTTP 請求全程阻塞等待，與官方介面形態一致，沒有「提交任務 → 輪詢結果」模式。部分上游本身是非同步的（如 FLUX），也已被閘道封裝成同步，無需自己寫輪詢。
  </Card>

  <Card title="沒有任務 ID" icon="search-x">
    不存在 task\_id 查詢介面，也無法憑 request\_id 事後找回圖片。API易 原廠透傳、不儲存生成結果，斷開連線後結果不可恢復。
  </Card>

  <Card title="斷連仍計費" icon="unplug">
    客戶端超時主動斷開後，服務端與上游的生成仍會跑完，該次請求**照常計費**。timeout 設得太小 = 花了錢卻拿不到圖。
  </Card>
</CardGroup>

## 模型系列速查表

各圖片模型系列的推薦 timeout、輸出格式與 URL 支援一覽：

| 模型系列                                                                          | 端點                                          | 推薦 timeout                               | 輸出格式                                                                       | URL 輸出與有效期                                              |
| ----------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| [GPT-Image-2（官轉）](/zh-Hant/api-capabilities/gpt-image-2/overview)             | `/v1/images/generations`、`/v1/images/edits` | **360 秒**（high + 2K/4K 實測 3-5 分鐘）        | 純 b64\_json（**無 `data:` 字首**）                                              | ❌ 不支援（傳 `response_format` 直接 400；`image2_OSS` 分組暫不支援官轉） |
| [GPT-Image-2-All（官逆）](/zh-Hant/api-capabilities/gpt-image-2-all/overview)     | 同上                                          | **300 秒**                                | 預設 `b64_json`（**無 `data:` 字首**，2026-07 實測）；顯式 `response_format: "url"` 可切換 | ✅ 顯式 `url`：R2 CDN 約 24 小時；強依賴 URL 用 `image2_OSS` 分組     |
| [GPT-Image-2-VIP](/zh-Hant/api-capabilities/gpt-image-2-vip/overview)         | 同上                                          | **300 秒**                                | 同 All（預設 `b64_json` 無字首，2026-07 實測）                                        | ✅ 同 All（顯式 `url` 或 `image2_OSS` 分組）                     |
| [Nano Banana Pro](/zh-Hant/api-capabilities/nano-banana-image/overview)       | Gemini 原生 `:generateContent`                | 1K/2K **300 秒**、4K **600 秒**、多圖參考 5 分鐘以上 | `inlineData.data` 純 base64                                                 | `NB_OSS` 內測分組（見下文）                                      |
| [Nano Banana 2](/zh-Hant/api-capabilities/nano-banana-2-image/overview)       | 同上                                          | **360 秒**                                | 同上                                                                         | `NB_OSS` 覆蓋範圍請諮詢客服                                      |
| [Nano Banana Lite](/zh-Hant/api-capabilities/nano-banana-lite-image/overview) | 同上                                          | **300 秒**（常規約 4 秒出圖，為高峰擁塞留餘量）            | 同上                                                                         | `NB_OSS` 覆蓋範圍請諮詢客服                                      |
| [FLUX](/zh-Hant/api-capabilities/flux/overview)                               | `/v1/images/generations`                    | **60-120 秒**，flex 系列建議 180 秒             | 僅 `data[0].url`（**原廠預設即 URL**）                                             | ⚠️ 僅約 **10 分鐘**有效、無 CORS，必須服務端立即轉存                      |
| [Seedream](/zh-Hant/api-capabilities/seedream-image/overview)                 | `/v1/images/generations`（生成/編輯統一端點）         | **60 秒**（4K + hd 約 30-60 秒）              | 預設 `url`（**原廠預設即 URL**）；可選 `b64_json`（純 base64 無字首）                        | ✅ BytePlus TOS，約 24 小時                                  |

<Tip>
  `response_format` 引數的**適用面很窄**：僅 GPT-Image-2-All / VIP 和 Seedream 支援；官轉 GPT-Image-2 傳了會直接返回 400 `unknown_parameter`。支援該引數的模型建議**始終顯式傳值**，不要依賴預設行為——歷史上預設值隨分組和負載變化過。
</Tip>

## 計費與價格影響

新手最常問的計費問題：「參考圖是每張定量，還是圖片越大消耗 token 越多？」先建立三個直覺：

<CardGroup cols={3}>
  <Card title="成本大頭是輸出" icon="trending-up">
    以 gpt-image-2 為例：文本輸入 \$5/M、圖片輸入 \$8/M、**輸出 \$30/M**。影響價格最大的永遠是**輸出的尺寸和畫質**（quality × size），其次才是參考圖張數。
  </Card>

  <Card title="輸入圖不是每張定量" icon="scaling">
    GPT 系輸入圖按**尺寸/寬高比對映**成 tokens（越大越多，但有下限也有封頂），**張數嚴格線性累加**。Gemini 系則相反——輸出圖按解析度檔固定 token/張。
  </Card>

  <Card title="以介面返回的 usage 為準" icon="receipt">
    輸入/輸出 token 都在響應裡：GPT 系看 `usage.input_tokens_details.image_tokens`，Gemini 系看 `usageMetadata.promptTokensDetails`。對賬、核價都以此為準，不要按張數估。
  </Card>
</CardGroup>

### 兩大體系的 token 口徑對照

| 體系                           | 輸入圖 tokens                                                            | 輸出圖 tokens                                               |
| ---------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| **GPT 系**（gpt-image-2 等）     | 按尺寸動態換算：≤1024² 方圖統一 1024，2048² 以上封頂 1521（2026-07 實測）；**N 張 = N × 單張** | 由 `size` × `quality` 決定：1024² 從 low 196 到 high 數千 tokens |
| **Gemini 系**（Nano Banana 全系） | 計入 `promptTokensDetails` 的 IMAGE 模態                                   | **按解析度檔固定**：1K/2K 每張 1120、4K 每張 2000，與寬高比無關              |

### 多圖輸入的費用直覺

* 單張參考圖約 **800-1600 image tokens ≈ \$0.008-0.012**（gpt-image-2 實測，含尺寸/寬高比浮動）；
* 張數線性累加：**16 張 ≈ \$0.13**，與一張 `high` 輸出（≈\$0.21）同量級——多圖融合場景輸入成本不可忽略；
* **token 由畫素尺寸決定、與檔案體積無關**：壓縮體積是為上傳穩定，不省 token；省 token 靠減少張數（超大圖有封頂，不必擔心費用爆炸）。

完整實測資料表見 [gpt-image-2 多圖輸入的價格影響](/zh-Hant/api-capabilities/gpt-image-2/overview#多圖輸入的價格影響2026-07-實測)；Gemini 系 token 口徑詳見 [usageMetadata 解讀](/zh-Hant/api-capabilities/nano-banana-usage-metadata) 與 [Nano Banana 價格說明](/zh-Hant/api-capabilities/nano-banana-pricing)。

## timeout 配置建議

### 為什麼預設 timeout 會誤傷

主流 HTTP 客戶端的預設超時普遍在 30-60 秒（`requests` 甚至預設不限時但常被框架包一層 30 秒），而圖片生成是真正的「長請求」：

* GPT-Image-2 在 `high` 畫質 + 2K/4K 解析度下，實測整體耗時 **3-5 分鐘**；
* Nano Banana 系列 4K 出圖約 50 秒起步，高峰期更久；
* 多圖融合、圖片編輯類請求普遍比文生圖更慢。

按預設值配置，請求會在服務端還在正常生成時被客戶端掐斷——表現為大量「超時失敗」，實際上是**自己斷開了本來會成功的請求**，而且這些請求照常計費。

### 按模型分檔設定

```python theme={null}
# 按模型設定客戶端超時（秒），而不是全域性一個值
IMAGE_TIMEOUTS = {
    "gpt-image-2": 360,                      # high + 2K/4K 實測 3-5 分鐘
    "gpt-image-2-all": 300,
    "gpt-image-2-vip": 300,
    "gemini-3-pro-image": 600,               # Nano Banana Pro，4K 按 600s 兜底
    "gemini-3.1-flash-image-preview": 360,   # Nano Banana 2
    "gemini-3.1-flash-lite-image": 300,      # Nano Banana Lite
    "flux": 120,                             # flex 系列建議 180
    "seedream": 60,                          # 4K + hd 約 30-60 秒
}

import requests

def generate_image(model: str, payload: dict, api_key: str) -> dict:
    resp = requests.post(
        "https://api.apiyi.com/v1/images/generations",
        headers={"Authorization": f"Bearer {api_key}"},
        json={"model": model, **payload},
        timeout=IMAGE_TIMEOUTS.get(model, 300),  # 未知模型給 300s 兜底
    )
    resp.raise_for_status()
    return resp.json()
```

### 重試策略

不是所有失敗都值得重試，先分清計費口徑：

| 失敗情況               | 是否計費           | 建議做法                      |
| ------------------ | -------------- | ------------------------- |
| 429 / 503（限流、上游過載） | 不計費            | 指數退避後重試（如 5s、15s、45s）     |
| 客戶端超時主動斷開          | **仍計費**        | 優先加大 timeout；確需重試時謹慎控制次數  |
| 400 / 403（引數、權限錯誤） | 不計費            | 修正請求再發，盲目重試無意義            |
| 內容稽核攔截             | **分情況**（見下方說明） | 修改 prompt 後再試，原樣重發大機率再次被攔 |

<Info>
  **內容稽核攔截的計費分情況**：按 token 計費的模型（gpt-image-2 官轉等）觸發稽核通常直接返回 400 錯誤，**不計費**；**僅按次計費的 Nano Banana Pro** 會遇到「HTTP 200 但出圖失敗」的谷歌側攔截，該次**會計費**——API易 對此類非主觀失敗提供 [出圖失敗包補計劃](/zh-Hant/api-capabilities/nano-banana-pro-guarantee)，按條數核算後補發額度。
</Info>

## base64 資料處理要點

### 字首差異對照

不同系列返回的 base64 欄位格式**並不統一**，這是新接入時最常見的坑：

| 模型系列                    | base64 所在欄位                                     | 是否含 `data:image/...;base64,` 字首 |
| ----------------------- | ----------------------------------------------- | ------------------------------- |
| GPT-Image-2（官轉）         | `data[0].b64_json`                              | 無字首（純 base64）                   |
| GPT-Image-2-All / VIP   | `data[0].b64_json`                              | 無字首（2026-07 實測；**歷史版本曾含字首**）    |
| Nano Banana 系列          | `candidates[0].content.parts[].inlineData.data` | 無字首（純 base64）                   |
| Seedream（`b64_json` 模式） | `data[0].b64_json`                              | 無字首（純 base64）                   |

字首行為隨渠道版本變化過，寫程式碼時**務必先做 `startsWith("data:")` 檢測**：有字首的剝掉字首再解碼（或直接用作 `img src`），無字首的直接解碼，避免「雙重拼接」或「帶字首解碼」產出損壞的圖片。

### 解碼寫檔案

```python theme={null}
import base64

b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):          # 防禦性剝字首，相容曾出現過的 data: 字首響應
    b64 = b64.split(",", 1)[1]
with open("output.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

```javascript theme={null}
let b64 = response.data[0].b64_json;
if (b64.startsWith("data:")) {
  b64 = b64.slice(b64.indexOf(",") + 1);
}
require("fs").writeFileSync("output.png", Buffer.from(b64, "base64"));
```

### Playground 渲染限制

base64 模式的響應往往有數 MB，瀏覽器 Playground 可能彈出 `請求時發生錯誤: unable to complete request`——這**不代表請求失敗**，實際請求已成功並已計費，只是瀏覽器無法渲染這麼長的字串。驗證效果請用程式碼呼叫，或改用支援 `url` 輸出的模型/引數。

## 輸入圖片格式預處理

圖片編輯 / 參考圖類介面（如 gpt-image-2 的 `/v1/images/edits`）對輸入圖片只接受 **png / jpg / webp** 三種標準格式。「使用者上傳實拍圖」類業務最容易踩一個隱蔽的坑：**手機原拍照片經常不是標準 JPEG**。

### 典型症狀：400 invalid\_image\_file

```json theme={null}
{
  "error": {
    "message": "Invalid image file or mode for image 1, please check your image file. ...",
    "code": "invalid_image_file"
  }
}
```

根因通常是 **MPO 格式**（Multi-Picture Object，多幀 JPEG 容器）：華為 Mate 系列等機型直出的 `.jpg` 內嵌 HDR 增益圖副幀，實為 MPO。這類檔案的隱蔽性在於——檔案頭同為 `FFD8`，**副檔名、HTTP Content-Type、`file` 命令全都顯示 JPEG**，只有按幀解析才能識別：

```python theme={null}
from PIL import Image
Image.open("photo.jpg").format   # 返回 "MPO" 即中招；標準圖返回 "JPEG"/"PNG"
```

2026-07 實測（gpt-image-2 編輯介面）：MPO 圖必被拒；同一張圖重編碼為標準 JPEG/PNG 後**保持原解析度（3072×4096）上傳即成功**——問題在格式，不在尺寸。此類 400 在入口校驗階段快速返回，**不計費**。

### 建議：服務端統一重編碼

與其逐張排查，不如在上傳鏈路統一做一次重編碼，順帶相容 HEIC、CMYK 等其它非標準輸入：

```python theme={null}
from PIL import Image
import io

def normalize_image(raw: bytes) -> bytes:
    """任意來源圖片 → 標準 JPEG，通過各圖片編輯介面的格式校驗"""
    im = Image.open(io.BytesIO(raw))
    im.load()                      # 多幀格式（MPO 等）只取第一幀
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")     # CMYK / P 等模式統一轉 RGB
    out = io.BytesIO()
    im.save(out, format="JPEG", quality=92)
    return out.getvalue()
```

重編碼時順手把體積也壓下來（長邊 ≤ 4096、JPEG 品質 80-92），單張控制在 1.5MB 以內，上傳成功率和出圖速度都會更好——輸出畫質與輸入圖體積無關。詳見 [gpt-image-2 圖片編輯「參考圖格式要求與預處理」](/zh-Hant/api-capabilities/gpt-image-2/image-edit#參考圖格式要求與預處理)。

## 需要 URL 輸出怎麼辦

一共三條路徑，按可靠程度排序：

1. **原廠預設就是 URL**：FLUX（僅約 10 分鐘有效且無 CORS 頭，必須服務端立即下載轉存）和 Seedream（BytePlus TOS，約 24 小時）的原廠輸出格式本身就是 URL，無需任何配置。
2. **OSS 分組（確定性 URL 輸出，推薦生產使用）**：
   * `image2_OSS` 分組：適用於 **GPT-Image-2-All / VIP**（1x 倍率、不加價），令牌分組切換後穩定輸出 URL、不降級為 base64；**官轉 GPT-Image-2 暫不支援**。
   * `NB_OSS` 內測分組：適用於 Nano Banana 系列，圖片 URL 出現在 `text` 欄位中，詳見 [NB-OSS 分組說明](/zh-Hant/api-capabilities/nano-banana-oss-group)。
3. **顯式傳 `response_format: "url"`**：僅 GPT-Image-2-All / VIP（R2 CDN，約 24 小時）和 Seedream 支援，**適用面窄**——官轉 GPT-Image-2 傳了直接 400。預設分組下這是逐請求切換，強依賴 URL 的業務建議直接用 OSS 分組。

**GPT-Image-2（官轉）目前沒有任何 URL 輸出途徑**，僅 base64。

<Warning>
  所有平臺返回的圖片 URL 都是**臨時連結**（10 分鐘到 24 小時不等），過期後 404。任何需要長期儲存的場景（商品圖、使用者作品、歷史記錄），都必須在拿到結果後**立即轉存到自己的物件儲存 / CDN**，再把自己的 URL 落庫。
</Warning>

## 超時與斷連排查

如果你已經把 SDK timeout 調大了卻仍然頻繁「超時」，按這個順序排查：

<Steps>
  <Step title="確認客戶端 SDK 的真實 timeout">
    有些框架會在 HTTP 客戶端外再包一層超時（如任務佇列的 worker 超時、Serverless 函式的執行上限），任何一層小於模型生成時間都會掐斷請求。
  </Step>

  <Step title="排查中間層：nginx / 負載均衡 / CDN">
    自建反向代理的 `proxy_read_timeout`、雲負載均衡的空閒連線超時、CDN 的回源超時**預設值普遍是 60 秒**，會先於你的客戶端斷開連線。長請求鏈路上的每一跳都要放寬。
  </Step>

  <Step title="啟用 keep-alive，避免連線被中間裝置回收">
    長時間無位元組傳輸的連線可能被 NAT / 防火牆靜默回收，開啟 TCP keep-alive 或 HTTP keep-alive 可顯著降低機率。
  </Step>

  <Step title="用請求 ID 與後臺日誌確認是否已計費">
    記錄響應頭中的 `x-request-id`，再到 API易 後臺的呼叫日誌中核對：如果日誌裡能查到這次呼叫，說明服務端已完成生成並計費，問題出在你這一側的連線被提前斷開。
  </Step>
</Steps>

## 想做非同步任務管理？

平臺不提供非同步介面，但你完全可以在同步介面之上自建非同步外殼：

<CardGroup cols={3}>
  <Card title="為什麼沒有非同步介面" icon="circle-question-mark" href="/zh-Hant/faq/image-async-api">
    FAQ：圖片生成有非同步介面嗎？支援任務 ID 查詢結果嗎？
  </Card>

  <Card title="自實現非同步佇列" icon="list-checks" href="/zh-Hant/api-capabilities/image-async-queue">
    工程實踐：把同步呼叫包進任務佇列，自己生成 task\_id、落庫、重試
  </Card>

  <Card title="NB-OSS URL 輸出分組" icon="cloud-upload" href="/zh-Hant/api-capabilities/nano-banana-oss-group">
    Nano Banana 系列改為 URL 輸出，減輕 base64 傳輸壓力
  </Card>
</CardGroup>
