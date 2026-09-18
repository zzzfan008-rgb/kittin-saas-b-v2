> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 蒙版局部重繪指南

> gpt-image-2 蒙版（mask）局部重繪完整指南 — Alpha 通道原理、蒙版製作與校驗、Python/cURL/Node.js 示例、常見報錯排查

<Info>
  本頁是 `gpt-image-2` 通過 `POST /v1/images/edits` 上傳**原圖 + 蒙版（mask）+ 提示詞**實現局部重繪的實操指南。介面引數與線上除錯請見 [圖片編輯 API 參考](/zh-Hant/api-capabilities/gpt-image-2/image-edit)。
</Info>

## 核心原理：Alpha 通道決定編輯區域

一次局部編輯請求由三部分組成：

```text theme={null}
原始圖片 image
+ 蒙版圖片 mask
+ 編輯指令 prompt
= 編輯後的完整圖片
```

蒙版通過 PNG 的 **Alpha 透明通道**標記修改區域：

| 蒙版區域  | Alpha 值 | 作用               |
| ----- | ------: | ---------------- |
| 完全透明  |       0 | 允許模型編輯           |
| 完全不透明 |     255 | 儘量保留原圖           |
| 半透明   |   1～254 | 過渡區域，不建議作為精確規則依賴 |

<Warning>
  **最容易搞反的一點**：決定編輯區域的是 **Alpha 通道**，不是肉眼看到的黑色或白色。

  ```text theme={null}
  透明區域   = 要修改的區域
  不透明區域 = 儘量不要修改的區域
  ```

  一張"看起來黑白分明"的 PNG，如果沒有 Alpha 通道，直接上傳會報 `invalid_image_file`。
</Warning>

### 一個直觀例子

假設原圖尺寸是 1024×1024：

```text theme={null}
┌──────────────────────┐
│      不透明區域       │
│   儘量保持原圖不變     │
│                      │
│       ┌──────┐       │
│       │透明區│       │
│       │換成花│       │
│       └──────┘       │
└──────────────────────┘
```

配合提示詞：

```text theme={null}
把透明區域中的水杯替換成一束白色鬱金香，
其他區域保持不變，保持原有光線、視角和攝影風格。
```

## Mask 不是硬裁剪

GPT Image 的蒙版**不是** Photoshop 那種絕對畫素級的硬限制。官方說明其本質仍是**基於提示詞的引導式編輯**：模型會參考蒙版，但不保證嚴格按每一個畫素邊界執行。

因此可能出現：

* 蒙版外的陰影略微變化
* 物體邊緣向外擴充套件
* 光照和反射發生聯動
* 背景細節被輕微重繪
* 蒙版邊界附近出現過渡

這對自然融合是好事，但不適合要求絕對畫素不變的場景（解決方案見下文「嚴格保持蒙版外不變」）。

### 提高局部編輯穩定性

提示詞不要只寫「換成紅色衣服」，建議寫成：

```text theme={null}
僅修改蒙版透明區域，將人物上衣替換成純紅色圓領棉質短袖。
保持人物臉部、頭髮、身體姿勢、手臂、背景、構圖、相機視角、
光照方向和圖片尺寸不變。新衣服需要自然貼合人物身體，並保持
原圖的真實攝影質感。
```

實務建議：

1. 蒙版比目標物體邊緣稍微擴大一些
2. 不要只遮住物體中心，要覆蓋物體邊緣、陰影和反射
3. 明確寫出哪些內容必須保持不變
4. 編輯區域過小時，適當擴大蒙版
5. 要求絕對不變時，最後自行做一次畫素合成（見下文）

## 要不要用 Mask？與純提示詞編輯的取捨

一個常見疑問：**現在的 AI 不是已經"指哪打哪"了嗎，為什麼還要費勁做蒙版？**

確實，`gpt-image-2` 不傳 mask、只靠一句"把左邊桌上的杯子換成花"，多數時候就能改對地方——指令遵循能力已經很強，日常隨手改圖完全夠用。但 mask 解決的是**提示詞說不清、或者說清了也不保險**的問題：

| 場景                         | 純提示詞            | 提示詞 + Mask       |
| -------------------------- | --------------- | ---------------- |
| 畫面只有一個目標物                  | ✅ 夠用，mask 屬於多餘  | 不必要              |
| 多個相似物體只改其一（三個人只換中間那位的衣服）   | ⚠️ 容易誤傷同類目標     | ✅ 空間指定，零歧義       |
| 邊界要求嚴格（商品圖 / UI 截圖 / 證件版式） | ❌ 整圖重生成，蒙版外也會漂移 | ✅ 配合畫素合成可做到嚴格不變  |
| 批次流水線（同一版式反覆替換某區域）         | ⚠️ 每次結果不穩定      | ✅ 蒙版可程式化生成，結果可復現 |
| 精確形狀 / 位置控制（把物體挪到指定座標）     | ❌ 語言難以描述畫素級位置   | ✅ 蒙版就是畫素級座標      |

學術研究也支援這個分工：mask-free（純文字驅動）的編輯方法難以精確控制空間位置和形狀——比如 prompt-to-prompt 類方法無法在畫面中**空間移動**一個物體，編輯區域覆蓋不準時還會"該改的沒改、不該改的改了"；而 mask-based 方法以犧牲一點便利為代價，換來明確的空間控制精度。

<Tip>
  **一句話結論**：mask 不是被淘汰的舊技術，而是從"必需品"變成了"精度控制工具"。聊天式隨手改圖 → 直接用提示詞；生產環境要求可復現、可控、邊界嚴格 → 用 mask。另外別忘了：`gpt-image-2` 純提示詞編輯本質是**整圖重生成**，未指定區域同樣可能變化——這正是 mask + 畫素合成存在的意義。
</Tip>

## 檔案要求速查

| 專案     | 要求                              |
| ------ | ------------------------------- |
| 原圖格式   | PNG / JPG / WebP，單張小於 50MB      |
| 輸入圖數量  | 最多 16 張（`image[]` 重複傳入）         |
| 蒙版格式   | **PNG，必須帶 Alpha 通道**            |
| 蒙版尺寸   | 與**第一張**原圖寬高**完全一致**（差 1 畫素也不行） |
| 蒙版大小   | 小於 **4MB**                      |
| 蒙版作用範圍 | 僅作用於 `image[0]`（第一張圖）           |

多圖編輯時的角色分配：

```text theme={null}
image[0]  = 主要編輯畫布
image[1…] = 參考圖
mask      = 只作用於 image[0]
```

<Tip>
  「尺寸完全一致」聽起來麻煩，實際不需要手動對齊——蒙版都是**從原圖上派生**出來的（在原圖副本上擦除 / 塗抹 / 分割），同尺寸自動滿足，詳見下文 [蒙版從哪來](#蒙版從哪來五種常見製作方式)。
</Tip>

## Python 呼叫示例

```python theme={null}
import base64
from pathlib import Path
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

with open("input.png", "rb") as image_file, \
     open("mask.png", "rb") as mask_file:

    result = client.images.edit(
        model="gpt-image-2.5-sunburst",
        image=image_file,
        mask=mask_file,
        prompt=(
            "僅修改蒙版透明區域。"
            "把桌面上的白色水杯替換成一束白色鬱金香，"
            "保持桌面、背景、相機視角、構圖和光線不變。"
            "花束需要自然放置在原水杯的位置，併產生符合原圖光線的陰影。"
        ),
        size="1536x1024",
        quality="high",
        output_format="png",
        n=1,
    )

image_bytes = base64.b64decode(result.data[0].b64_json)
Path("edited.png").write_bytes(image_bytes)
print("圖片已儲存：edited.png")
```

<Warning>
  **不要傳 `input_fidelity="high"`** —— 三款模型對輸入圖預設始終高保真處理，API 不允許調整該引數，傳了會 400 報錯（2.5 實測 2026-09-09 同樣 400），直接省略即可。
</Warning>

## cURL 呼叫示例

圖片編輯介面必須使用 `multipart/form-data`，不能把原圖和蒙版作為普通 JSON 欄位提交：

```bash theme={null}
curl -s \
  -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-sunburst" \
  -F "image[]=@input.png;type=image/png" \
  -F "mask=@mask.png;type=image/png" \
  -F "prompt=僅修改蒙版透明區域，把桌上的水杯替換成一束白色鬱金香，其他區域保持不變，保持原有構圖、光線和真實攝影風格。" \
  -F "size=1536x1024" \
  -F "quality=high" \
  -F "output_format=png" \
  | jq -r '.data[0].b64_json' \
  | base64 --decode > edited.png
```

即便只有一張圖片，也建議按官方示例使用 `image[]` 欄位名。

<Warning>
  使用 `-F` 時**不要手動設定** `-H "Content-Type: multipart/form-data"`。curl 需要自動生成 `boundary`，手動設定會丟失 boundary，導致伺服器無法識別檔案。
</Warning>

## Node.js 呼叫示例

```javascript theme={null}
import fs from "fs";
import OpenAI, { toFile } from "openai";

const client = new OpenAI({
  apiKey: "sk-your-api-key",
  baseURL: "https://api.apiyi.com/v1",
});

const image = await toFile(
  fs.createReadStream("input.png"),
  "input.png",
  { type: "image/png" }
);

const mask = await toFile(
  fs.createReadStream("mask.png"),
  "mask.png",
  { type: "image/png" }
);

const result = await client.images.edit({
  model: "gpt-image-2.5-sunburst",
  image,
  mask,
  prompt:
    "僅修改蒙版透明區域。把桌面上的白色水杯替換成一束白色鬱金香，" +
    "保持背景、構圖、鏡頭視角和光線不變。",
  size: "1536x1024",
  quality: "high",
  output_format: "png",
});

const imageBuffer = Buffer.from(result.data[0].b64_json, "base64");
fs.writeFileSync("edited.png", imageBuffer);
console.log("圖片已儲存：edited.png");
```

## 蒙版從哪來？五種常見製作方式

很多人覺得做蒙版麻煩——"還得跟原圖一模一樣的尺寸"。其實有一個關鍵認知：**蒙版幾乎從不'另畫一張'，而是從原圖上派生出來的**。無論用程式碼、修圖軟體還是網頁畫布，流程都是「開啟原圖 → 在原圖上標記區域 → 匯出」，尺寸一致是**自動滿足**的，不需要手動對齊。

| 方式               | 適合場景             | 上手成本          |
| ---------------- | ---------------- | ------------- |
| ① 程式碼生成（PIL 畫區域） | 固定版式批次處理、座標已知    | 低（幾行程式碼）      |
| ② 修圖軟體手動擦除       | 一次性精修、形狀複雜       | 低（會用選區即可）     |
| ③ 網頁塗抹畫布         | 自建產品給使用者"刷一下"就改  | 中（前端 Canvas）  |
| ④ AI 自動分割（SAM 系） | 點一下 / 一句話就出精確蒙版  | 中（需部署或呼叫分割服務） |
| ⑤ 黑白蒙版轉 Alpha    | 承接其它工具輸出的黑白 mask | 低（幾行程式碼）      |

### 方法一：程式直接生成透明蒙版

把矩形區域設為透明（允許編輯）：

```python theme={null}
from PIL import Image, ImageDraw

original = Image.open("input.png").convert("RGBA")

# 預設整張蒙版完全不透明：儘量保留
mask = Image.new("RGBA", original.size, (255, 255, 255, 255))

draw = ImageDraw.Draw(mask)

# 把指定區域設為完全透明：允許編輯
# 座標格式：(左, 上, 右, 下)
draw.rectangle((300, 250, 750, 800), fill=(0, 0, 0, 0))

mask.save("mask.png")
print("蒙版尺寸：", mask.size)
```

* `(255, 255, 255, 255)` = 不透明，保留區
* `(0, 0, 0, 0)` = 透明，編輯區

### 方法二：修圖軟體手動擦除

任何支援透明 PNG 的修圖軟體（Photoshop、GIMP、Krita、Photopea 等）都能做蒙版，本質就一步：**把要編輯的區域"擦"成透明**。以 Photoshop 為例：

1. 開啟**原圖副本**（直接在原圖上操作，尺寸天然一致）
2. 如果圖層是「背景」，先雙擊解鎖為普通圖層（背景圖層不支援透明）
3. 用套索 / 快速選擇 / 物件選擇工具框選要修改的區域
4. 按 Delete 刪除選區內容 → 露出透明棋盤格
5. 「匯出為 PNG」（勾選透明度），得到的就是合格的 Alpha 蒙版

GIMP 同理：`圖層 → 透明 → 新增 Alpha 通道`，選區後 Delete，匯出 PNG。

<Tip>
  形狀完全不限於矩形——套索沿著物體輪廓走、快速選擇一鍵選中主體，擦出來的透明區就是任意不規則形狀。建議選區比物體輪廓**稍微外擴幾個畫素**（Photoshop：`選擇 → 修改 → 擴充套件`），把陰影和邊緣一併覆蓋。
</Tip>

### 方法三：網頁塗抹畫布

各類 AI 修圖產品裡"用筆刷塗一下要改的地方"的互動，就是在瀏覽器裡動態生成 Alpha 蒙版，核心只有一個 Canvas API 屬性。實現原理見下文 [塗抹式修圖的實現原理](#蒙版形狀與塗抹式修圖的實現原理)。

### 方法四：AI 自動分割一鍵出蒙版

手動塗抹也嫌麻煩？可以讓分割模型代勞。Meta 開源的 **SAM（Segment Anything Model）** 系列是目前的主流方案：

* **點選出蒙版**：在物體上點一下，模型輸出該物體的畫素級精確輪廓（連頭髮絲邊緣都能貼合）
* **文字出蒙版**：2025 年 11 月開源的 **SAM 3** 支援概念級文字提示，如「所有黃色計程車」「穿紅色球衣的球員」，一次返回所有匹配例項的蒙版（模型與程式碼見 `github.com/facebookresearch`，介紹見 `ai.meta.com`）
* **摳主體 / 摳背景**：`rembg` 這類開源工具一行命令分離主體與背景，背景區域直接可以當"只改背景"的蒙版用

拿到分割結果（通常是黑白點陣圖）後，用下面「方法五」轉成 Alpha 蒙版即可。Stable Diffusion 社群的 **Inpaint Anything** 外掛、ComfyUI 的 Mask Editor 就是「SAM 分割 + 筆刷微調 → 蒙版 → 局部重繪」這套流水線的成熟實現，思路可以直接借鑑。

### 方法五：把黑白蒙版轉換成 Alpha 蒙版

如果你已有一張「黑色 = 編輯，白色 = 保留」的黑白蒙版：

```python theme={null}
from PIL import Image

bw_mask = Image.open("mask_bw.png").convert("L")

rgba_mask = Image.new("RGBA", bw_mask.size, (255, 255, 255, 255))

# 黑色值 0   → Alpha 0   → 透明   → 編輯
# 白色值 255 → Alpha 255 → 不透明 → 保留
rgba_mask.putalpha(bw_mask)

rgba_mask.save("mask.png")
```

### 上傳前先校驗蒙版

很多 `invalid_image_file` 都是因為副檔名是 `.png`，實際卻只有 RGB 沒有 Alpha。上傳前跑一遍：

```python theme={null}
from PIL import Image

image = Image.open("input.png")
mask = Image.open("mask.png")

print("蒙版格式：", mask.format)
print("蒙版模式：", mask.mode)
print("蒙版尺寸：", mask.size)

assert mask.format == "PNG", "蒙版必須是 PNG"
assert mask.mode in ("RGBA", "LA"), "蒙版必須包含 Alpha 通道"
assert image.size == mask.size, "原圖和蒙版尺寸必須完全一致"

alpha = mask.getchannel("A")
assert alpha.getextrema()[0] == 0, "蒙版中沒有完全透明的編輯區域"

print("蒙版檢查通過")
```

## 蒙版形狀與塗抹式修圖的實現原理

### 蒙版可以是任意不規則形狀

蒙版本質是一張**逐畫素的點陣圖**，不是幾何圖形——每個畫素獨立記錄一個 Alpha 值。所以：

* 矩形、圓形只是最簡單的示例
* 沿人物輪廓的剪影、頭髮絲邊緣、隨手塗鴉的一團、不連通的多塊區域，全部合法
* 實踐中**大多數蒙版都是不規則的**：跟著目標物體的輪廓走，再略微外擴

<Tip>
  唯一的"形狀建議"與規則無關，與效果有關：透明區要**完整覆蓋物體本體 + 邊緣 + 陰影 + 反射**，寧可多圈一點，讓模型有空間做自然融合。
</Tip>

### 塗抹式修圖是怎麼實現的

各類修圖 App 裡"筆刷塗哪改哪"的互動，前端實現出奇地簡單：**兩層畫布疊加，筆刷把上層"擦"成透明**。

```text theme={null}
底層 <img>       顯示原圖（僅供使用者參考，不參與匯出）
上層 <canvas>    與原圖等寬高，初始整張填充為不透明
                 筆刷經過處 → 畫素變透明
匯出 canvas      → 就是一張合格的 Alpha 蒙版 PNG
```

核心只有一行——把 Canvas 合成模式設為 `destination-out`（新筆跡從已有畫素中"挖掉"內容）：

```javascript theme={null}
const canvas = document.getElementById("mask-canvas");
const ctx = canvas.getContext("2d");

// 1. 畫布尺寸 = 原圖原始畫素尺寸（不是 CSS 顯示尺寸），同尺寸自動滿足
canvas.width = image.naturalWidth;
canvas.height = image.naturalHeight;

// 2. 初始整張不透明 = 全部保留
ctx.fillStyle = "rgba(255, 255, 255, 1)";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 3. 關鍵一行：筆刷改為"擦除"模式，畫過的地方變透明
ctx.globalCompositeOperation = "destination-out";
ctx.lineWidth = 40;          // 筆刷粗細
ctx.lineCap = "round";
ctx.strokeStyle = "rgba(0, 0, 0, 1)";

// 4. 監聽滑鼠 / 觸控事件畫線（注意把顯示座標換算回原始畫素座標）
canvas.addEventListener("pointermove", (event) => {
  if (!drawing) return;
  const scaleX = canvas.width / canvas.clientWidth;
  const scaleY = canvas.height / canvas.clientHeight;
  ctx.lineTo(event.offsetX * scaleX, event.offsetY * scaleY);
  ctx.stroke();
});

// 5. 匯出：直接得到帶 Alpha 通道的 PNG 蒙版
canvas.toBlob((blob) => {
  const formData = new FormData();
  formData.append("mask", blob, "mask.png");
  // 連同原圖、prompt 一起 POST /v1/images/edits
}, "image/png");
```

幾個工程細節：

1. **座標換算**：畫布在頁面上通常被 CSS 縮小顯示，筆跡座標要按 `原始寬 / 顯示寬` 的比例換算回去，否則蒙版錯位
2. **撤銷**：每筆開始前 `ctx.getImageData()` 存快照，撤銷時 `putImageData()` 恢復
3. **蒙版膨脹（dilate）**：使用者塗抹往往只蓋住物體中心，提交前程式性外擴幾個畫素（專業工具裡的「Expand Mask」按鈕就是這個），Python 端可用 `PIL.ImageFilter.MaxFilter` 或 OpenCV `cv2.dilate` 實現
4. **半透明預覽**：給使用者看的塗抹高亮（如紅色半透明）畫在**另一個預覽層**上，匯出的蒙版層保持純粹的"不透明 / 透明"二值

### 進階：點選 / 文字自動出蒙版

塗抹式再往前一步，就是把"人手塗"換成"模型算"：

```text theme={null}
使用者點一下物體          → SAM 輸出該物體的畫素級輪廓蒙版
使用者輸入「左邊的杯子」   → SAM 3 按文字概念找出所有匹配例項
程式自動 dilate + 羽化  → 提交 /v1/images/edits
```

這正是 Inpaint Anything、ComfyUI Mask Editor 等工具的做法：**分割模型負責"準"，筆刷負責"改"**——先一鍵生成精確蒙版，再用筆刷做加減微調（Add / Trim mask by sketch）。自建產品時，把 SAM 部署為後端服務、前端保留塗抹畫布做兜底微調，是當前體驗最好的組合。

## 多參考圖 + 蒙版

典型場景：換裝（第一張是人物原圖，後面是款式 / 材質參考圖，蒙版標記衣服區域）：

```python theme={null}
import base64
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

with open("person.png", "rb") as person, \
     open("clothes_reference.png", "rb") as clothes, \
     open("fabric_reference.png", "rb") as fabric, \
     open("mask.png", "rb") as mask:

    result = client.images.edit(
        model="gpt-image-2.5-sunburst",
        image=[person, clothes, fabric],
        mask=mask,
        prompt=(
            "第一張圖片是需要編輯的主體。"
            "僅修改第一張圖片蒙版透明區域中的衣服。"
            "使用第二張圖片的服裝款式和第三張圖片的面料質感，"
            "保持第一張圖片的人臉、髮型、姿勢、身體比例、背景和光線不變。"
        ),
        quality="high",
        size="1024x1536",
        output_format="png",
    )

with open("result.png", "wb") as output:
    output.write(base64.b64decode(result.data[0].b64_json))
```

<Tip>
  多圖時必須在 prompt 中**清楚描述每張圖的用途**（第一張是主體、第二張是款式參考、第三張是材質參考），否則模型可能混淆圖片角色。
</Tip>

## 嚴格保持蒙版外不變（畫素級後處理）

由於模型可能輕微修改蒙版外內容，對畫素精度要求高的場景（商品圖、證件版式、固定 UI 截圖），可以在生成後把蒙版外區域強制替換回原圖：

```python theme={null}
from PIL import Image, ImageFilter

original = Image.open("input.png").convert("RGBA")
edited = Image.open("edited.png").convert("RGBA")
mask = Image.open("mask.png").convert("RGBA")

if edited.size != original.size:
    edited = edited.resize(original.size, Image.Resampling.LANCZOS)

# 原蒙版 Alpha：0 = 編輯區，255 = 保留區
alpha = mask.getchannel("A")

# 反轉後：255 = 使用編輯結果，0 = 使用原圖
edit_area = alpha.point(lambda value: 255 - value)

# 輕微羽化，避免邊緣太硬
edit_area = edit_area.filter(ImageFilter.GaussianBlur(radius=3))

final = Image.composite(edited, original, edit_area)
final.save("final.png")
```

最終效果：蒙版內部採用 AI 編輯結果，蒙版外部恢復成原始圖片，邊界輕微羽化融合。

## 常見錯誤排查

<AccordionGroup>
  <Accordion title="invalid_image_file / Invalid image file or mode">
    常見原因：

    * 蒙版不是有效 PNG，或檔案內容損壞
    * 副檔名是 PNG，實際編碼不是 PNG
    * 圖片模式異常（CMYK、調色盤模式、缺 Alpha）
    * 上傳時 MIME 型別錯誤
    * 檔案流在請求前已被讀取完畢或關閉

    統一轉碼可解決大多數問題：

    ```python theme={null}
    from PIL import Image

    Image.open("input_source.jpg").convert("RGBA").save("input.png")
    Image.open("mask_source.png").convert("RGBA").save("mask.png")
    ```
  </Accordion>

  <Accordion title="原圖和蒙版尺寸不一致">
    哪怕只差 1 畫素也會報錯。修正：

    ```python theme={null}
    from PIL import Image

    image = Image.open("input.png")
    mask = Image.open("mask.png").convert("RGBA")

    mask = mask.resize(image.size, Image.Resampling.NEAREST)
    mask.save("mask_fixed.png")
    ```
  </Accordion>

  <Accordion title="黑白蒙版沒有 Alpha 通道">
    `RGB` / `L` / `P` 模式都不行，必須是 `RGBA`。用上文「方法二」把黑白蒙版轉換成 Alpha 蒙版。
  </Accordion>

  <Accordion title="蒙版透明和輸出透明是兩回事">
    這是兩個不同的透明，容易混：

    ```text theme={null}
    蒙版透明：標記「這塊允許模型改」，由 mask 檔案的 alpha 通道表達
    輸出透明：成圖本身帶 alpha 通道，由 background 引數控制
    ```

    兩者**可以同時用**：一邊傳帶 alpha 的 `mask` 標記編輯區，一邊傳 `background: "transparent"` 讓成圖輸出透明底，實測不衝突。

    輸出透明要求 `output_format` 是 `png` 或 `webp`，配 `jpeg` 會 400（jpeg 沒有 alpha 通道）。完整說明見 [怎麼生成透明背景的圖片](/zh-Hant/faq/image-transparent-background)。
  </Accordion>

  <Accordion title="response_format=url 拿不到圖">
    GPT Image 系列固定返回 Base64 資料，`response_format` 只適用於舊的 DALL·E 2 行為。正確讀取方式：

    ```python theme={null}
    result.data[0].b64_json
    ```
  </Accordion>

  <Accordion title="Content-Type isn't multipart/form-data">
    通常是手動設定了 `Content-Type` 頭導致 boundary 丟失，或中間層把 multipart 請求解析成 JSON 後再轉發。讓 HTTP 客戶端自動生成 multipart 頭即可。
  </Accordion>
</AccordionGroup>

## 尺寸引數

`gpt-image-2` 支援靈活尺寸，需同時滿足：

```text theme={null}
寬和高都必須是 16 的倍數
最長邊不超過 3840px
長寬比不超過 3:1
總畫素不低於 655,360
總畫素不超過 8,294,400
```

常用尺寸：`1024x1024`、`1536x1024`、`1024x1536`、`2048x2048`、`2048x1152`、`3840x2160`、`2160x3840`、`auto`。方形圖片通常生成更快。

## 生產環境請求模板

```python theme={null}
result = client.images.edit(
    model="gpt-image-2.5-sunburst",
    image=open("input.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="""
僅編輯蒙版透明區域。

編輯任務：
把透明區域內的白色馬克杯替換成一束白色鬱金香。

必須保持：
- 原有構圖不變
- 相機位置和鏡頭透視不變
- 桌面及背景不變
- 光線方向和色溫不變
- 蒙版外人物和物品不變
- 輸出保持真實攝影風格

融合要求：
花束需要自然位於原馬克杯所在位置，產生符合現場光線的陰影、
反射和接觸關係，不要增加其他物體。
""",
    size="1536x1024",
    quality="high",
    output_format="png",
)
```

## 相關頁面

<CardGroup cols={2}>
  <Card title="圖片編輯 API 參考" icon="image" href="/zh-Hant/api-capabilities/gpt-image-2/image-edit">
    完整引數說明與線上除錯 Playground
  </Card>

  <Card title="GPT-Image-2 概覽" icon="sparkles" href="/zh-Hant/api-capabilities/gpt-image-2/overview">
    模型能力、定價與版本說明
  </Card>
</CardGroup>

<Info>
  官方參考資料（請複製到瀏覽器訪問）：

  * 模型說明：`developers.openai.com/api/docs/models/gpt-image-2.5-sunburst`、`developers.openai.com/api/docs/models/gpt-image-2`
  * 影像編輯 API Reference：`developers.openai.com/api/reference/python/resources/images/methods/edit/`
  * 影像生成指南：`developers.openai.com/api/docs/guides/image-generation`
</Info>
