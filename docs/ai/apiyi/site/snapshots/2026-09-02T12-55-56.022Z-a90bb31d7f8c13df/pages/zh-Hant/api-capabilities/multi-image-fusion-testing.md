> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 多圖融合測試指南

> 客戶常問：參考圖數量是否和官方一致（最多14張）？本文給出兩套可自行復現的測試方法，並公開一次14圖融合的完整實測結果。

不少客戶會問：**"你們支援的參考圖數量和官方一致嗎？"** 谷歌官方 Gemini 影像模型的參考圖上限是**每次請求最多 14 張**，這也是目前業內能拿到的最高上限。答案是**支援**，但"支援"不該只是一句口頭承諾——本文給出一套你可以自己動手復現的測試方法，並附上一次真實的 14 圖融合實測結果。

## 為什麼值得自己測一遍

14 張參考圖是**極限場景**，實際業務裡未必天天用到，但一旦用到（比如把多個獨立設計的元素合成同一張海報/大片），你需要確認兩件事：

1. **呼叫本身能不能成功**：14 張圖疊在一起，請求體積會明顯變大，會不會因為體積過大被拒絕？
2. **融合結果是否合理**：這麼多張圖一起塞給模型，會不會丟圖、錯位、張冠李戴？

下面兩種方法，分別針對這兩個問題設計，且都不依賴主觀審美判斷——結果一眼就能看出對不對。

## 方法一：客觀標記法（推薦先做這個）

**思路**：不用複雜的業務場景，而是生成 N 張**彼此風格迥異、內容可數**的卡片（最簡單的是 1 到 14 的數字），再要求模型把它們拼貼/融合成一張圖。

* 每張卡片用完全不同的配色和材質風格（比如霓虹燈管、拉絲金屬、粉筆字、畫素風、木刻雕花……），保證融合結果裡**每個數字都能憑顏色和風格反查到對應的輸入圖**；
* 融合後人眼一眼核對：**1 到 14 是否全部出現、有沒有重複或缺失**，不需要判斷"好不好看"，只需要判斷"全不全、對不對"。

<Frame caption="14 張風格各異的數字卡片融合為一張海報：1–14 全部清晰可辨，顏色與材質與各自輸入圖一一對應">
  <img src="https://mintcdn.com/apiyillc/qV4tj_cm3Ry_IOag/images/multi-image-fusion-14-numbers-demo.jpg?fit=max&auto=format&n=qV4tj_cm3Ry_IOag&q=85&s=7d15943d875496202258495a5b0267d9" alt="14張創意數字卡片融合成一張3行5列網格海報，每個數字保留獨特配色和材質風格" width="1600" height="1600" data-path="images/multi-image-fusion-14-numbers-demo.jpg" />
</Frame>

這套方法的價值在於**排除干擾項**：如果連"數字對不對"這種最基礎的核驗都能通過，說明模型確實在認真處理每一張輸入圖，而不是隨便挑幾張應付了事。

## 方法二：真實場景拆解法

**思路**：把你實際要用的業務場景，拆解成 N 個獨立元素分別生成，再要求模型把它們融合回同一個場景。這更貼近真實使用方式——比如角色、服裝、道具、背景分開管理，再合成一張成片。

以一個時尚大片場景為例，拆解成 14 個獨立元素：模特人像、外套、載具、背景板、寵物/配飾若干、包袋、飾品、鞋履、行李箱等，每個元素單獨生成一張圖，風格基調保持統一（比如都用"淺灰影棚背景、寫實攝影"）。

<Frame caption="14個獨立生成的時尚元素（模特、服裝、轎車、寵物、包袋、飾品等）融合為同一張時尚大片，元素齊全、構圖協調">
  <img src="https://mintcdn.com/apiyillc/qV4tj_cm3Ry_IOag/images/multi-image-fusion-14-fashion-demo.jpg?fit=max&auto=format&n=qV4tj_cm3Ry_IOag&q=85&s=03cb3f755876ce41b2a49fed3c526dfe" alt="14個獨立時尚元素融合成一張完整的時尚大片場景，模特斜倚粉色轎車旁，鸚鵡、寵物犬、手提包等元素齊全" width="1194" height="1600" data-path="images/multi-image-fusion-14-fashion-demo.jpg" />
</Frame>

核驗重點：**14 個元素是否全部入鏡**、位置和比例是否協調、有沒有明顯的元素丟失或變形。真實場景的融合天然比"數字拼貼"更難（不同元素的光影、透視需要重新統一），所以這一步能更真實地反映複雜業務場景下的融合品質。

<Tip>
  兩種方法建議**都做**：方法一負責回答"模型有沒有認真處理全部輸入圖"，方法二負責回答"複雜真實場景下融合是否夠用"。只做方法二，一旦出問題很難判斷是"模型沒看到某張圖"還是"構圖效果不理想"這兩類完全不同的問題。
</Tip>

## 請求格式：14 張圖怎麼塞進一次請求

Gemini 原生格式下，多圖融合的規則很簡單：**一個 `text` part（融合指令）+ N 個 `inlineData` part（每張參考圖一個）**，每個 part 只能是 `text` 或 `inlineData` 其中一種，不能混在一起。

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

def to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

# 最多可放 14 張參考圖
image_paths = ["01.png", "02.png", "03.png", "..."]  # 最多14張
parts = [{"text": "請把這些圖片的元素合理融合成一張場景圖，保持風格統一、構圖協調"}]
for path in image_paths:
    parts.append({"inlineData": {"mimeType": "image/png", "data": to_b64(path)}})

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "1:1", "imageSize": "2K"}
        }
    },
    timeout=600  # 圖片數量多、請求體大，建議放寬超時
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("fused.png", "wb") as f:
    f.write(base64.b64decode(img_data))
```

更完整的多圖編輯格式說明（`parts` 結構、常見報錯）見 [圖片編輯 API 參考](/zh-Hant/api-capabilities/nano-banana-image/image-edit) 和 [Nano Banana 系列開發指南](/zh-Hant/api-capabilities/nano-banana-dev-guide)。

## 客戶最關心的問題：圖片這麼多，請求會不會太大被拒絕

14 張原圖不壓縮直接傳，請求體積確實會明顯變大。我們實測過一組真實資料（14 張 2K 解析度的圖片，未做任何壓縮）：

| 專案                 | 實測數值                  |
| ------------------ | --------------------- |
| 單張原圖體積             | 約 1.7MB – 4.0MB       |
| 14 張合計（Base64 編碼後） | **約 42–43MB**         |
| 請求結果               | **全部成功**，未出現因體積被拒絕的情況 |

<Info>
  API易對單次請求的圖片總量上限是 **100MB**（同步呼叫，避免記憶體佔用過大）；單張圖片則遵循谷歌官方規則，不超過 **7MB**。本次 14 張 2K 圖合計 42–43MB，在兩條規則的安全範圍內，因此順利呼叫成功。
</Info>

**結論**：即便不壓縮，14 張 2K 參考圖通常也不會撞到體積上限。但**壓縮仍然是推薦做法**——不是因為不壓會被拒絕，而是壓縮後**耗時明顯更短**（實測同樣的融合任務，壓縮後請求耗時約為原圖直傳的 1/2 到 1/3，因為省去了大體積資料的網路傳輸和服務端解碼時間）。具體壓縮引數建議（長邊畫素、JPEG 品質、多圖合計體積目標）見 [圖片壓縮與輸出解析度說明](/zh-Hant/api-capabilities/image-compression-resolution)。

## 遇到"沒出圖"，先看是不是安全攔截

多圖融合任務偶爾會命中 `finishReason: IMAGE_SAFETY`（HTTP 狀態碼仍是 200，但 `content.parts` 為空）。實測發現，**同樣的輸入原樣重試 1-2 次，很可能就成功了**——這類攔截存在一定隨機性，不代表輸入內容真的有問題。

<Tip>
  安全攔截的圖片**不計費**，建議在業務程式碼裡對 `IMAGE_SAFETY` 做自動重試，而不是直接判定為失敗。更多錯誤型別（安全攔截、內容稽核、超時等）的識別和處理方式，見 [Gemini 生圖 API 錯誤處理指南](/zh-Hant/api-capabilities/gemini-image-error-handling)。
</Tip>

## 速查總結

* 谷歌官方上限**每次請求最多 14 張參考圖**，API易已驗證完全支援，實測呼叫成功、融合合理。
* 自測時建議**兩種方法都做**：數字卡片法驗證"全不全"，真實場景拆解法驗證"合不合理"。
* 14 張 2K 原圖合計約 40MB 級別，**在 API易 100MB / 谷歌單圖 7MB 的限制範圍內不會被拒絕**，但壓縮上傳耗時更短，仍是推薦做法。
* 多圖請求的 `parts` 結構：**1 個 text + N 個 inlineData**，二者不能混在同一個 part 裡。
* 遇到 `IMAGE_SAFETY` 空圖返回，先重試 1-2 次，往往就能成功，且不計費。

## 相關文件

* [Nano Banana 系列開發指南](/zh-Hant/api-capabilities/nano-banana-dev-guide)
* [圖片壓縮與輸出解析度說明](/zh-Hant/api-capabilities/image-compression-resolution)
* [Gemini 生圖 API 錯誤處理指南](/zh-Hant/api-capabilities/gemini-image-error-handling)
* [如何生成滿意的圖片](/zh-Hant/api-capabilities/image-generation-success-tips)
