> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 出圖返回 blockReason: OTHER 怎麼辦？

> Gemini 圖片模型幾秒內返回 promptFeedback.blockReason 且沒有 candidates 時，如何定位被攔截的參考圖，以及人工與程式碼兩類場景下的參考圖預處理建議。

## 簡短回答

如果 Gemini 圖片介面返回 HTTP 200，但響應裡**沒有 `candidates`**，只有 `promptFeedback.blockReason`（最常見的是 `OTHER`），說明請求在**開始生成之前**就被原廠的輸入檢查攔下了。

* 這類攔截通常幾秒內就返回，比正常出圖快得多
* `OTHER` 不會告訴你具體原因，`safetyRatings` 往往也是空的
* 它**不一定和提示詞寫法有關**，很多時候是某一張參考圖觸發的
* gemini-3-pro-image（Nano Banana Pro）的輸入檢查比 gemini-3.1-flash-image 更嚴格，同一個請求可能 Pro 被攔、flash 能出

處理思路是：**先找到是哪一張圖，再對參考圖做統一的預處理**。

## 怎麼識別

典型響應如下：

```json theme={null}
{
  "promptFeedback": {
    "blockReason": "OTHER",
    "safetyRatings": []
  },
  "usageMetadata": {
    "promptTokenCount": 1919,
    "candidatesTokenCount": 0
  },
  "modelVersion": "gemini-3-pro-image",
  "responseId": "..."
}
```

| 特徵 | blockReason 攔截 | NO\_IMAGE |
| - | - | - |
| 失敗訊號所在欄位 | `promptFeedback.blockReason` | `candidates[0].finishReason` |
| `candidates` | 沒有 | 有，但 `parts` 為 `null` |
| 返回速度 | 幾秒內 | 與正常出圖相近 |
| 常見原因 | 輸入內容（多為參考圖）被攔截 | 提示詞意圖不明確 |
| 處理方向 | 定位並預處理參考圖 | 改提示詞，見 [NO\_IMAGE 排查](/zh-Hant/faq/gemini-no-image) |

## 一個實測案例

2026-09 (UTC+8) 我們複測了一個服裝目錄出圖請求：1 段提示詞 + 6 張參考圖（姿勢、人物、場景、穿搭、鞋襪拼圖、帽子），2:3、2K、`responseModalities: ["IMAGE"]`。

* gemini-3-pro-image 連續 3 次返回 `blockReason: OTHER`；同一請求用 gemini-3.1-flash-image 能正常出圖
* 用對半拆分的方法逐步縮小範圍，最終定位到**唯一的觸發源是那張人物參考圖**（一張 AI 生成的人物四宮格設定圖，包含正面、背面、側面和麵部特寫）
* 這張圖配任何提示詞都會被攔，包括與任務無關的「把背景換成淺灰色」
* 事前最被懷疑的「帶水印的真人姿勢參考圖」和「帶商標的帽子圖」，單獨測試都能通過

最關鍵的發現是：

| 人物參考圖的處理方式 | 結果 |
| - | - |
| 原圖 | 攔截 13/13 |
| 畫素完全相同，只換檔案格式（如另存為 PNG） | 攔截 2/2 |
| 重新匯出為 JPEG（品質 95，肉眼看不出差別） | 通過 6/6 |
| 用重新匯出的圖替換後，傳送完整的 6 圖請求 | 出圖 2/2，人物、姿勢、穿搭都正確 |

也就是說，這類檢查對某些圖片的原始畫素非常敏感，重新匯出一次就能正常通過。原廠不公開 `OTHER` 的具體判斷依據，我們無法進一步歸因。

<Info>
  這個案例說明：一次請求放多張參考圖、把多個步驟合併成一次生成，本身都沒有問題。遇到 `OTHER` 時，不要急著改提示詞或拆分流程，先確認是哪一張圖。
</Info>

## 如何定位是哪一張圖

<Steps>
  <Step title="第一步：確認可以復現">
    原樣重發 2\~3 次。`blockReason` 攔截通常是穩定復現的；如果時好時壞，更可能是 [NO\_IMAGE](/zh-Hant/faq/gemini-no-image) 那類問題。
  </Step>

  <Step title="第二步：先排除提示詞">
    保留全部圖片，把提示詞換成一句與任務無關的簡單指令（例如「把背景換成淺灰色」）。如果仍被攔截，問題在圖片上。
  </Step>

  <Step title="第三步：對半拆分圖片">
    把參考圖分成兩半分別傳送，只在仍被攔截的那一半里繼續拆分，直到定位到單張圖。6 張圖最多拆 3 輪。
  </Step>

  <Step title="第四步：處理那張圖">
    按下文「處理建議」重新匯出該圖後，再發送完整請求驗證。
  </Step>
</Steps>

<Tip>
  定位時出一次圖就可以判定這一組「能通過」，不必重複；連續 2 次被攔截即可判定「會被攔截」。這樣整個定位過程通常只需要十幾次呼叫。
</Tip>

## 處理建議

### 場景一：人工操作（在畫布或工具裡手動出圖）

1. **參考圖先重新匯出一次再上傳**：用任意修圖工具（系統自帶的預覽、Photoshop 等）匯出為 JPEG，品質 90\~95，長邊不超過 2048px。
2. **大圖先縮小**：長邊 3000\~4000px 的原圖縮到 2048px 以內，不影響出圖效果，上傳也更快。
3. **幾秒就失敗時先懷疑參考圖**：優先把最近新加入的那張圖重新匯出後再試；仍不行就按上面的方法逐張排查。
4. **人物參考圖優先用全身圖**：在上面的案例中，人物四宮格拆開後，單獨的正面全身圖可以通過。如果某張人物設定圖反覆被攔截，可以先只用其中的全身圖。
5. **臨時替代**：某張圖確實無法通過 Pro 時，可以先用 gemini-3.1-flash-image 完成這一步。

### 場景二：程式碼（工程化自動處理）

**1. 所有參考圖傳送前統一預處理**，不必針對某一張圖單獨處理：轉為 sRGB → 按 EXIF 方向擺正 → 長邊限制在 2048px → 重新編碼為 JPEG（品質 90\~95）→ 去掉後設資料。

這樣做首先能顯著減小請求體積、加快上傳（上面的案例原始請求體約 4.6MB）；同時也能減少這類 `OTHER` 攔截。Node.js 示例：

```javascript theme={null}
import sharp from "sharp";

async function normalizeReference(buffer) {
  return sharp(buffer, { failOn: "none" })
    .rotate()                       // 按 EXIF 方向擺正
    .toColorspace("srgb")
    .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();                    // 預設不保留後設資料
}

// parts.push({ inlineData: { mimeType: "image/jpeg", data: (await normalizeReference(buf)).toString("base64") } });
```

Python 可以用 Pillow 實現同樣的流程：

```python theme={null}
from io import BytesIO
from PIL import Image, ImageOps

def normalize_reference(raw: bytes) -> bytes:
    im = ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert("RGB")
    im.thumbnail((2048, 2048))
    out = BytesIO()
    im.save(out, "JPEG", quality=92)
    return out.getvalue()
```

**2. 按失敗型別分別處理**：

| 返回情況 | 含義 | 建議處理 |
| - | - | - |
| `promptFeedback.blockReason` 為 `OTHER`，幾秒內返回 | 輸入被原廠檢查攔截，原因未公開 | 換一組編碼引數（如品質 88、長邊再縮小 1%）自動重發 1 次；仍失敗則改用 flash，或提示使用者更換參考圖 |
| `blockReason` 為 `SAFETY` / `PROHIBITED_CONTENT`，或 `finishReason` 為 `IMAGE_SAFETY` 等 | 明確的內容安全攔截 | **不要重試**，直接提示使用者修改素材或描述 |
| `finishReason` 為 `NO_IMAGE`，輸出 token 為 0 | 提示詞出圖意圖不明確 | 在提示詞末尾追加「只輸出最終圖片，不要輸出文字」後重發，見 [NO\_IMAGE 排查](/zh-Hant/faq/gemini-no-image) |

<Warning>
  自動重試只適用於原因不明的 `OTHER`。對於明確的安全類原因，重新編碼圖片並不能、也不應該用來改變結果，請直接提示使用者調整內容。
</Warning>

**3. 記錄排查資訊**：每次失敗都記下 `responseId`，以及每張參考圖的雜湊值和尺寸。出現問題時能快速找到是哪張圖，也方便聯絡我們時提供。

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼 flash 能出圖，Pro 卻被攔截？">
    兩個模型的輸入檢查策略不同，Pro 更嚴格。同一張參考圖在 flash 上通過、在 Pro 上被攔截是正常現象，並不代表請求本身有問題。
  </Accordion>

  <Accordion title="參考圖是 AI 生成的，也會被攔截嗎？">
    會有這種情況。上面案例裡被攔截的就是一張用自己拍的照片重新生成的人物設定圖。是否被攔截與圖片來源沒有簡單對應關係，按本頁的方法定位並預處理即可。
  </Accordion>

  <Accordion title="一次放 6 張參考圖會不會太多？">
    在上面的案例中，6 張圖本身不是問題：替換掉那一張人物圖後，完整的 6 圖請求可以正常出圖。
  </Accordion>

  <Accordion title="被攔截的請求會扣費嗎？">
    請以 API易 控制台的呼叫日誌為準，確認該請求是否產生消費記錄。
  </Accordion>
</AccordionGroup>

## 仍然無法解決？聯絡我們

請提供以下資訊，方便我們協助排查：

* 模型名稱和令牌分組；
* 完整響應（至少包含 `promptFeedback` 和 `responseId`）與 `request ID`；
* 問題發生時間（請註明時區）；
* 已經定位到的參考圖（如方便提供）。

<Warning>
  請勿傳送完整 API Key。提交截圖或日誌前，請將金鑰內容打碼。
</Warning>

<CardGroup cols={2}>
  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增，或點選本卡片直接聯絡客服。
  </Card>

  <Card title="郵件諮詢" icon="mail">
    **客服郵箱**：[support@apiyi.com](mailto:support@apiyi.com)

    郵件標題建議包含「blockReason + 模型名稱」。
  </Card>
</CardGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="為什麼 Gemini 圖片介面返回 NO_IMAGE？" icon="image-off" href="/zh-Hant/faq/gemini-no-image">
    提示詞意圖不明確導致的未出圖與修復方法
  </Card>

  <Card title="Nano Banana 系列出圖失敗" icon="image-off" href="/zh-Hant/faq/nano-banana-image-failure">
    內容安全、去水印、知名 IP 和未成年人等常見原因
  </Card>

  <Card title="Gemini 生圖 API 錯誤處理指南" icon="triangle-alert" href="/zh-Hant/api-capabilities/gemini-image-error-handling">
    完整的響應判斷順序與 C 端友好提示方案
  </Card>

  <Card title="怎麼看懂日誌裡的計費金額？" icon="file-text" href="/zh-Hant/faq/log-billing-explained">
    通過呼叫日誌確認請求是否成功和是否產生消費
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.