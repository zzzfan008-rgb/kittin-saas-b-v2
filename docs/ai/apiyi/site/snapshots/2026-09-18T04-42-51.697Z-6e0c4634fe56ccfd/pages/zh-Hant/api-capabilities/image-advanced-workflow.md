> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 出圖進階：工作流編排與去 AI 味

> 同一個模型，C 端出圖產品比裸調 API 好在哪：提示詞改寫層、參考圖錨定、併發取樣加視覺模型擇優、分步精修。附去 AI 味的可複製詞表、實測對比圖與成本賬。

[如何生成滿意的圖片](/zh-Hant/api-capabilities/image-generation-success-tips) 解決的是「這一次沒出好，怎麼救」。這一篇解決下一個問題：**怎麼讓每一次都穩定地出好**。

一個反覆被問到的現象：`freepik.com`、`higgsfield.ai` 這類 C 端出圖產品，用的是和你一樣的底層模型——同一批 Nano Banana、GPT-Image、FLUX——但出來的圖看著就是更「成品」。差距不在模型權重，**在模型外面那一層**。那一層是可以自己搭的，本文講怎麼搭。

## 一、C 端出圖產品在模型外面套了什麼

把這類產品拆開，模型之外大致是這八層。每一層都能在 API 上覆刻：

| 產品側做的事                                                 | 解決什麼問題                  | 在 API 上怎麼復刻                        |
| ------------------------------------------------------ | ----------------------- | ---------------------------------- |
| **提示詞改寫層**（Prompt Enhancer）                            | 使用者寫的是口語，模型要的是結構化描述     | 先調一次文本模型改寫，再進圖片模型（見第二節）            |
| **風格預設**（幾十個可點選的 preset，可儲存自己的）                        | 把審美固化，使用者不必懂攝影術語        | 預設 = 你程式碼裡的提示詞片段常量 + 固定的參考圖        |
| **身份錨定**（如 Higgsfield 的 `Soul ID`，用 20–80 張照片訓練一個持久身份） | 同一個人跨次生成不漂移             | 用參考圖逼近（見下方邊界說明）                    |
| **多次取樣 + 擇優**                                          | 使用者只看到最好那張，感知成功率接近 100% | 併發出 N 張 + 視覺模型打分自動挑（見第三節 Step 3/4） |
| **分步編輯**                                               | 一次下達複合指令必然掉鏈子           | 先定構圖，再局部改，最後加文字                    |
| **放大與後處理**（Freepik 2024 年收購 Magnific，提供 2×–16× 的創造性放大） | 把小圖補成可印刷尺寸              | API易 無此介面，改為直接出高解析度檔（見下方邊界說明）      |
| **負面詞與安全兜底**                                           | 避開模型的常見壞習慣、攔下會被稽核打回的請求  | 提示詞模板裡內建固定的負面描述 + 稽核失敗的降級路徑        |
| **素材庫與轉存**                                             | 使用者的圖不會過期丟失             | 拿到結果立刻轉存自己的物件儲存                    |

<Warning>
  **兩條必須先說清的平臺邊界**，別按競品的功能表照抄：

  1. **API易 沒有超分 / 摳圖 / 修臉介面**。要大圖就在生成時直接選高解析度檔（`gpt-image-2` 的 4K、Nano Banana Pro 的 4K），不要指望事後放大；要透明底用官轉 `gpt-image-2`，傳 `background: "transparent"` 直接出帶 alpha 通道的 PNG（`seedream-5-0` / `seedream-5-0-pro` 只能靠提示詞要求，不保證每次都有 alpha），見 [怎麼生成透明背景的圖片](/zh-Hant/faq/image-transparent-background)。
  2. **API易 不提供 LoRA / 身份訓練**。`Soul ID` 那種「訓練一次、永久鎖臉」的能力，用參考圖只能逼近：同一角色換場景、換光線時仍會漂移，越接近正臉、越接近原始光照條件，保持得越好。做需要嚴格一致的商業角色，要預留人工挑圖的環節。
</Warning>

## 二、第一層就能拉開差距：把口語變成結構化提示詞

這是投入產出比最高的一層，也是最容易被跳過的一層。

### 實測：同一個模型，同一個需求，兩種提示詞

需求是「給咖啡出一張電商產品圖」。左邊是使用者會寫的原話，右邊是補齊要素之後的版本，都用 `gemini-3-pro-image`（Nano Banana Pro）、`2K`、`1:1`，各出一次：

<Frame caption="口語提示詞：「幫我出一張咖啡的產品圖，好看一點，要高階感」">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-prompt-before.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=a2e2025bf74baf40a7b63a424762cb62" alt="口語提示詞生成的咖啡圖：木桌、磨豆機、麻布袋等大量道具，畫面暖調，杯身被模型自行編造了一個品牌名" width="1280" height="1280" data-path="images/image-workflow-prompt-before.jpg" />
</Frame>

<Frame caption="結構化提示詞：主體、環境、光位、鏡頭、色調、瑕疵、構圖逐項寫死">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-prompt-after.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=cb00b095545e5dcad8cb2c113fefe47f" alt="結構化提示詞生成的咖啡圖：淺灰檯面上一隻啞光黑陶瓷杯，背景乾淨虛化，光影方向明確，畫面留白充足" width="1280" height="1280" data-path="images/image-workflow-prompt-after.jpg" />
</Frame>

左圖不難看，但**不可用**：模型替你做了一堆你沒授權的決定——加了磨豆機和麻布袋、把色調定成懷舊暖調，還在杯身上編了一個並不存在的品牌名（這種自動生成的文字在商用場景基本等於廢片）。右圖是能直接進商詳頁的圖：中性背景、光位可複述、留白夠放文案。

**「好看」和「可用」是兩件事**。口語提示詞只能約束前者。

### 六要素：改寫層要補齊的東西

改寫不是把提示詞寫長，是把缺失的決策補上。圖片提示詞的骨架就六項：

| 要素        | 缺了會怎樣           | 寫法示例                       |
| --------- | --------------- | -------------------------- |
| **主體**    | 模型自由發揮，加你不想要的道具 | 「一隻啞光黑色陶瓷手衝杯，盛八分滿黑咖啡」      |
| **環境**    | 背景隨機，同系列圖對不上    | 「淺灰色微水泥檯面，同色系牆面並虛化」        |
| **光線**    | 全域性均勻光，一眼假      | 「左上方 45 度柔光箱主光，右側白色反光板補光」  |
| **鏡頭與視角** | 透視和景深不可控        | 「85mm 微距，f/5.6，正面略俯視 15 度」 |
| **色調與介質** | 預設高飽和「渲染感」      | 「冷調中性白平衡，整體偏低飽和」           |
| **構圖**    | 主體永遠居中          | 「杯子位於畫面左三分之一，右側大面積留白」      |

<Tip>
  解析度**不是**第六要素。輸出解析度只由 `size` / `imageSize` 這類引數決定，在提示詞裡寫「4K」「8K」不會提高實際畫素——詳見 [圖片壓縮與輸出解析度說明](/zh-Hant/api-capabilities/image-compression-resolution)。
</Tip>

### 把改寫層寫成程式碼

用一個便宜快的文本模型做這件事就夠了，成本相對出圖可以忽略：

```python theme={null}
import os
import requests

BASE = "https://api.apiyi.com/v1"
API_KEY = os.environ["APIYI_API_KEY"]          # 絕不要把 Key 寫死在程式碼裡

REWRITE_SYSTEM = """你是圖片提示詞工程師。把使用者的口語需求改寫成一段結構化的中文出圖提示詞。

必須補齊六要素，缺什麼補什麼，不要詢問使用者：
1 主體：具體到材質、顏色、數量、狀態
2 環境：背景是什麼、虛實關係
3 光線：光源方向、軟硬、有沒有補光，必須是可指認的單一主光
4 鏡頭與視角：焦段、光圈、機位高度、俯仰角
5 色調與介質：白平衡傾向、飽和度、膠片或數碼質感
6 構圖：主體在畫面什麼位置，留白在哪

規則：
- 只輸出提示詞正文，不要解釋、不要分點、不要加標題
- 不要出現品牌名、商標、可識別的文字內容，除非使用者明確要求
- 不要使用 8K、超高畫質、傑作、完美 這類空泛的品質詞
- 使用者明確指定過的要素原樣保留，不要改寫"""


def rewrite(user_prompt: str) -> str:
    r = requests.post(
        f"{BASE}/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "model": "gemini-3.5-flash",
            "messages": [
                {"role": "system", "content": REWRITE_SYSTEM},
                {"role": "user", "content": user_prompt},
            ],
        },
        timeout=60,
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip()
```

注意 system prompt 裡那條「不要使用 8K、超高畫質、傑作、完美 這類空泛的品質詞」——原因見第四節。

## 三、一條可落地的五步流水線

改寫層之外，把剩下四層串起來就是一條完整流水線：

<Steps>
  <Step title="改寫：口語 → 結構化提示詞">
    見第二節。這一步還順便承擔「把使用者輸入裡的敏感內容中和掉」的職責，能顯著降低後面被稽核攔下的比例。
  </Step>

  <Step title="錨定：參考圖 + 風格常量">
    風格靠兩樣東西固定：**一段每次都拼進去的風格常量**（你的 preset），和**一組固定的參考圖**。

    各系列的參考圖上限差別很大，設計流水線前先確認：

    | 模型系列                    | 參考圖上限        | 備註                                                                 |
    | ----------------------- | ------------ | ------------------------------------------------------------------ |
    | Nano Banana 全系          | **14 張**（實測） | 見 [多圖融合測試指南](/zh-Hant/api-capabilities/multi-image-fusion-testing) |
    | `gpt-image-2` 系列        | **16 張**     | 重複傳 `image[]`                                                      |
    | Seedream                | **10 張**     | 輸入 + 輸出總數不超過 15                                                    |
    | FLUX.2 pro / max / flex | **8 張**      | `input_image_2` … `input_image_8`；klein 4 張，Kontext 僅 1 張          |
    | Grok Imagine            | **1–4 張**    | 傳第 5 張直接 400                                                       |

    兩個必須遵守的約定：**提示詞裡的「圖1 / 圖2」嚴格按陣列順序對應**，要顯式寫出來指代誰；**Grok 的參考圖只在 `/v1/images/edits` 生效**，傳給 `/v1/images/generations` 會被靜默丟棄並照常計費。
  </Step>

  <Step title="取樣：併發出 N 張，不要指望 n 引數">
    C 端產品「一發就中」的觀感，本質是它替你抽了好幾次卡。

    但**服務端的 `n` 引數在多數圖片模型上不生效**（Seedream 明確靜默忽略）。要多張就在客戶端併發發多次請求——站內 skills 頁給出的做法是一次最多 5 併發。併發數按渠道調，有的渠道併發 2 就開始 429，加指數退避。
  </Step>

  <Step title="擇優：用視覺模型當評委">
    有了 N 張就要自動挑，否則等於把選擇成本轉嫁給使用者。

    做法是把候選圖回傳給一個視覺模型打分，走標準的 `/v1/chat/completions` 圖片輸入即可，可選模型見 [視覺理解](/zh-Hant/api-capabilities/vision-understanding)。評分維度建議固定成五項、要求返回 JSON：指令符合度、結構與解剖、文字正確性、質感真實度、構圖。

    <Warning>
      不要用 `/v1/rerank` 做這件事。`bge-reranker-v2-m3` 是**純文本**重排模型，不接受圖片輸入。圖片打分只能用視覺理解模型。
    </Warning>
  </Step>

  <Step title="精修與落地">
    定稿之後再做局部調整，比一次性下達複合指令成功率高得多：

    * **畫素級可控的局部重繪**：只有**官轉 `gpt-image-2`** 支援蒙版，見 [蒙版局部重繪指南](/zh-Hant/api-capabilities/gpt-image-2/mask-editing)；
    * **多輪對話式累積編輯**：Nano Banana 系列的**原生 Gemini 端點**支援（把上一輪的圖以 `role: "model"` 回填），逆向線路不支援；
    * **立刻轉存**：所有平臺返回的 URL 都是臨時連結（FLUX 約 10 分鐘且無 CORS，Seedream 與 R2 約 24 小時），拿到就下載進自己的物件儲存。
  </Step>
</Steps>

### 串起來的最小實現

```python theme={null}
import base64
import json
import os
from concurrent.futures import ThreadPoolExecutor

import requests

BASE = "https://api.apiyi.com"
API_KEY = os.environ["APIYI_API_KEY"]
HEAD = {"Authorization": f"Bearer {API_KEY}"}

STYLE_CONST = "冷調中性白平衡，整體偏低飽和，畫面乾淨留白充足。"   # 你的 preset


def draw(prompt: str, size: str = "2K", aspect: str = "1:1") -> bytes:
    """出一張圖（Nano Banana Pro 原生 Gemini 端點）"""
    url = f"{BASE}/v1beta/models/gemini-3-pro-image:generateContent"
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": aspect, "imageSize": size},
        },
    }
    r = requests.post(url, headers=HEAD, json=body, timeout=600)   # 4K 按 600s 留餘量
    r.raise_for_status()
    parts = r.json()["candidates"][0]["content"]["parts"]
    part = next((p for p in parts if p.get("inlineData")), None)
    if part is None:                                   # HTTP 200 但沒圖 = 多半被稽核攔了
        raise RuntimeError("未返回圖片：" + json.dumps(parts, ensure_ascii=False)[:300])
    return base64.b64decode(part["inlineData"]["data"])


def score(image: bytes, prompt: str) -> dict:
    """用視覺模型給候選圖打分，返回 {總分, 各維度分, 一句話講問題}"""
    data_url = "data:image/png;base64," + base64.b64encode(image).decode()
    rubric = (
        "給這張圖打分，嚴格返回 JSON："
        '{"instruction":0-10,"anatomy":0-10,"text":0-10,"texture":0-10,'
        '"composition":0-10,"total":0-50,"issue":"一句話"}。'
        "instruction=是否滿足下面這條需求；anatomy=手指、肢體、物體結構有無錯誤；"
        "text=畫面內文字是否正確（沒有文字給 10）；texture=質感是否像真實拍攝而非渲染；"
        "composition=構圖是否可用。需求如下：\n" + prompt
    )
    r = requests.post(
        f"{BASE}/v1/chat/completions",
        headers=HEAD,
        json={
            "model": "gemini-3.5-flash",
            "messages": [{"role": "user", "content": [
                {"type": "text", "text": rubric},
                {"type": "image_url", "image_url": {"url": data_url}},
            ]}],
            "response_format": {"type": "json_object"},
        },
        timeout=120,
    )
    r.raise_for_status()
    return json.loads(r.json()["choices"][0]["message"]["content"])


def best_of(user_input: str, n: int = 4) -> bytes:
    prompt = rewrite(user_input) + "\n" + STYLE_CONST        # Step 1 + Step 2
    with ThreadPoolExecutor(max_workers=n) as pool:          # Step 3：客戶端併發，不用 n 引數
        results = list(pool.map(lambda _: _safe(draw, prompt), range(n)))

    cands = [img for ok, img in results if ok]
    if not cands:
        raise RuntimeError("全部失敗，檢查稽核攔截或降級到別的模型")

    with ThreadPoolExecutor(max_workers=len(cands)) as pool:  # Step 4：併發打分
        scores = list(pool.map(lambda im: score(im, prompt), cands))

    ranked = sorted(zip(cands, scores), key=lambda x: x[1]["total"], reverse=True)
    return ranked[0][0]                                      # Step 5 的精修與轉存按業務接上


def _safe(fn, *args):
    try:
        return True, fn(*args)
    except Exception as e:                # 單張失敗不拖垮整批
        return False, str(e)
```

## 四、去 AI 味：讓圖看起來不像 AI 生成

「AI 味」不是玄學，是**一組可以逐條消掉的具體特徵**。

### 實測對比

同一個模型（`gemini-3-pro-image`）、同一個題材，兩種寫法各出兩張，各取第一張：

<Frame caption="裸提示詞：「一位年輕女性的半身寫實人像，在咖啡館窗邊，微笑看向鏡頭，8K，超高畫質，超精細，皮膚細膩，唯美，完美光線，傑作」">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-texture-before.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=0623ee0bf7aa07fab43cd347d9aa4a7d" alt="裸提示詞生成的人像：人物正對鏡頭且居中，全畫面光線均勻沒有明確方向，背景元素齊整，整體是通用相簿照片的觀感" width="1280" height="956" data-path="images/image-workflow-texture-before.jpg" />
</Frame>

<Frame caption="加了光位、鏡頭、介質、瑕疵四組控制詞之後的同題材出圖">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-texture-after.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=83efd55ea2ba552a67c04aa2e0f99936" alt="控制詞生成的人像：單一側向窗光，半邊臉落進陰影，可見毛孔與面部絨毛、頰上小痣與碎髮，膠片色調，人物偏畫面右側" width="1280" height="956" data-path="images/image-workflow-texture-after.jpg" />
</Frame>

左圖並不差——底模已經足夠強，裸提示詞也能出「好看的圖」。但它帶著一整套典型特徵：**人物死死居中、光線均勻到找不出光源在哪、每樣東西都恰到好處**。而且這不是偶然：那一輪出的兩張，構圖和布光模式幾乎一樣。

右圖換了一套寫法之後：光有明確方向、半邊臉敢丟進陰影、皮膚上有油光和毛孔、頰上有痣、碎髮沒梳齊、人物偏在畫面右側。它看起來像**某個人在某個具體時刻被拍到了**，而不是「一張咖啡館女性微笑素材」。

<Info>
  這裡也說明了流水線真正的價值：它不是把醜圖變好看，而是**把「碰運氣的好看」變成「你指定的、可複述、可復現的好看」**。左圖換個需求方來看未必更差，但你說不出它為什麼長這樣，也無法要求下一張跟它保持一致。
</Info>

### 症狀 → 對策 → 反面寫法

| AI 味的症狀     | 對策（寫進提示詞）                                  | 反面寫法（別這麼寫）           |
| ----------- | ------------------------------------------ | -------------------- |
| 主體永遠居中、構圖對稱 | 指定位置：「人物偏畫面右側，左側留白」                        | 「完美構圖」「黃金分割」         |
| 皮膚塑膠感、零毛孔   | 「自然膚質，可見毛孔與面部絨毛，鼻翼一點油光，不做磨皮」               | 「皮膚細膩」「精緻」「唯美」       |
| 光線均勻、找不到光源  | 指定唯一主光的方向與軟硬：「左側窗光是唯一光源，右半邊臉落進陰影」          | 「完美光線」「柔和打光」         |
| 景深假、虛化像貼上去的 | 給焦段和光圈：「85mm，f/2.8，焦點在近側眼睛」                | 「背景虛化」「電影感」          |
| 顏色過飽和、發光    | 給介質和白平衡：「Kodak Portra 400 質感，高光偏暖陰影偏青，低飽和」 | 「色彩鮮豔」「HDR」          |
| 一切都是新的、無磨損  | 主動加瑕疵：「毛衣起球，桌面有水漬和麵包屑」                     | 「乾淨整潔」「高階質感」         |
| 整體像海報、像渲染圖  | 指定拍攝情境：「抓拍」「從鄰桌高度平視」                       | 「8K」「超高畫質」「傑作」「大師作品」 |

<Warning>
  **`8K`、`超高畫質`、`超精細`、`傑作`、`完美` 這類空泛品質詞是負資產**。它們既不提高解析度（解析度只由引數決定），又會把模型推向過銳、過飽和的渲染風格——正好是「AI 味」的核心來源。上面左圖的提示詞裡塞滿了這些詞，結果就是那個樣子。要品質就寫具體的光、鏡頭和介質。
</Warning>

### 四組可直接複製的控制詞塊

按需拼進提示詞，一般四組各取一到兩句就夠：

<CardGroup cols={2}>
  <Card title="光線" icon="sun">
    左側窗光是畫面裡唯一的光源 / 午後三點的側後方硬光 / 逆光，髮絲出現輪廓光 / 桌面檯燈作為畫面內實用光源 / 陰天的散射光，沒有明顯投影
  </Card>

  <Card title="鏡頭" icon="aperture">
    35mm f/2.0 平視抓拍 / 85mm f/2.8，焦點在近側眼睛 / 24mm 低機位，邊緣有輕微畸變 / 長焦壓縮空間，背景層次被壓平 / 畫面四角有輕微暗角
  </Card>

  <Card title="介質" icon="film">
    Kodak Portra 400 膠片質感，細膩顆粒 / 高光偏暖、陰影偏青 / 寶麗來即時成像，反差低、邊緣發虛 / 早期 CCD 數碼相機的噪點與偏色 / 整體低飽和，不做銳化
  </Card>

  <Card title="瑕疵" icon="scan-line">
    自然膚質，可見毛孔與面部絨毛 / 額前幾縷碎髮沒有梳齊 / 毛衣起球，袖口有磨損 / 桌面有水漬、指紋和麵包屑 / 構圖不居中，邊緣被裁掉一部分
  </Card>
</CardGroup>

### 三個場景的完整示例

<AccordionGroup>
  <Accordion title="人像：要像抓拍，不像證件照">
    半身人像抓拍：一位二十多歲的女性在咖啡館窗邊，側身看向窗外，嘴角有一點沒收住的笑。窗光是畫面裡唯一的光源，來自左側，右半邊臉落進陰影，鼻樑下有一小塊硬邊陰影。85mm 鏡頭，f/2.8，平視，焦點落在近側眼睛。柯達 Portra 400 膠片質感，可見細膩顆粒，高光偏暖、陰影偏青，整體低飽和。自然膚質：可見毛孔與面部絨毛，鼻翼有一點油光，左頰有一顆小痣，眉毛有幾根雜亂散毛，額前幾縷碎髮沒有梳齊。不做磨皮，不做美顏，不做銳化。構圖偏右，左側留白。
  </Accordion>

  <Accordion title="產品圖：要能直接上商詳頁">
    電商主圖：一隻啞光黑色陶瓷手衝咖啡杯，杯中盛八分滿的黑咖啡，表面有一圈細密油脂。放在淺灰色微水泥檯面上，背景是同色系牆面並虛化。主光為左上方 45 度柔光箱，右側用白色反光板補光，杯身右緣留一條細窄的高光；檯面上落一道柔和的杯體投影，向右後方延伸。85mm 微距鏡頭，f/5.6，正面略俯視 15 度，全杯清晰。冷調中性白平衡，整體偏低飽和。陶瓷表面有細微的手工釉面不均和一處極小的窯變斑點，杯沿有一道極淺的使用痕跡。畫面留白充足，杯子位於畫面左三分之一處。不要出現任何品牌名或文字。
  </Accordion>

  <Accordion title="環境場景：要有具體時間和天氣">
    傍晚六點的老城區窄街，剛下過雨，地面積水倒映著兩側店鋪的燈箱。唯一的主光是街口一盞偏暖的路燈，其餘靠店鋪燈光補，天空還剩一點冷調餘暉，形成暖冷對比。28mm 鏡頭，f/4，機位在人的視線高度，略微仰拍。整體低飽和，暗部保留噪點，不做提亮。牆面有水漬、舊海報的撕痕和空調外機，電線在畫面上方橫過。畫面中沒有人正對鏡頭，行人都是背影和運動模糊。
  </Accordion>
</AccordionGroup>

## 五、幾個會打亂流水線設計的事實

設計之前先知道這些，能省掉一輪返工：

| 事實                                                                                                            | 對流水線的影響                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **seed 在這條產品線上基本不可用**：Nano Banana 全系與 GPT-Image 全系不暴露 seed，Seedream 4.x / 5.x 的 seed 實測不生效，Grok Imagine 明確不支援 | 別把「復現」建立在 seed 上。**唯一可靠的復現是把成功那次的完整請求體存檔**（提示詞、參考圖、全部引數），下次原樣重放                                                                           |
| **服務端 `n` 引數在多數圖片模型上不生效**                                                                                     | 多候選必須客戶端併發，併發數要按渠道壓測，配指數退避                                                                                                                |
| **圖片 API 全部同步，沒有任務 ID，斷連仍計費**                                                                                 | 流水線必須自建任務佇列，見 [自實現非同步佇列](/zh-Hant/api-capabilities/image-async-queue) 與 [圖片 API 呼叫須知](/zh-Hant/api-capabilities/image-api-best-practices) |
| **沒有超分 / 摳圖 / 修臉介面**                                                                                          | 尺寸在生成時一次到位；透明底走 `gpt-image-2` 的 `background: "transparent"` 引數（不是摳圖介面，是生成時直接出透明底）                                                         |
| **HTTP 200 但沒圖，通常是內容稽核攔截**                                                                                    | 擇優邏輯要能區分「沒出圖」和「出了但不好」，前者見 [Gemini 生圖錯誤處理](/zh-Hant/api-capabilities/gemini-image-error-handling)                                          |
| **返回的圖片 URL 都是臨時連結**                                                                                          | 拿到結果立刻轉存，別把上游 URL 直接落庫                                                                                                                    |
| **GPT-Image 系列提示詞上限 32,000 字元**（原廠上限，按字元計）                                                                    | 品牌手冊、包裝規格這類資料不要直接塞圖片模型，先經文本模型提煉成 1K～3K 字元的結構化提示詞，見 [長提示詞篇](/zh-Hant/api-capabilities/image-long-prompt)                                   |

## 六、成本賬：什麼時候值得上流水線

流水線是拿錢換成功率。出圖成本的大頭永遠是**輸出**（`gpt-image-2` 輸出 \$30 / 百萬 tokens），改寫和打分用的文本 / 視覺模型相對可以忽略。所以成本基本等於「你出了幾張候選」。

按場景分三檔用，不要一刀切：

| 檔位      | 組成                       | 相對成本 | 適用                |
| ------- | ------------------------ | ---- | ----------------- |
| **草稿檔** | Lite 模型單張直出              | 1×   | 內部預覽、批次佔位圖、使用者隨手試 |
| **標準檔** | 改寫 + 2 張候選 + 打分挑 1 張     | 約 2× | C 端產品的預設路徑        |
| **精品檔** | 改寫 + 4 張候選 + 打分 + 一次局部精修 | 約 5× | 商詳主圖、投放素材、要對外交付的圖 |

判斷標準很簡單：**這張圖會不會被外部的人看到**。會，就值得上標準檔以上；只是內部看一眼，草稿檔足夠。中間還可以加一道閘門——打分低於閾值才追加候選，大部分請求兩張就收斂了。

## 速查總結

* 差距不在模型權重，**在模型外面那八層**：改寫、預設、錨定、取樣、擇優、分步編輯、後處理、轉存。
* **改寫層價效比最高**：補齊主體 / 環境 / 光線 / 鏡頭 / 色調 / 構圖六要素，「好看」才會變成「可用」。
* **多候選 + 視覺模型打分**是 C 端產品高成功率觀感的真正來源；`n` 引數不生效，要客戶端併發；`/v1/rerank` 不能給圖片打分。
* **去 AI 味靠加具體，不靠加形容詞**：指定唯一光源、給焦段光圈、指定介質與顆粒、主動加瑕疵、把主體挪出畫面中心。
* **`8K` / `傑作` / `完美光線` 這類詞是負資產**，既不提解析度又把畫面推向渲染感。
* **別指望 seed 復現**，存完整請求體才是復現；圖片 API 全同步、斷連仍計費，流水線必須配佇列。
* API易 沒有超分 / 摳圖 / 身份訓練介面，涉及這幾層要在方案裡提前繞開。

## 相關文件

<CardGroup cols={2}>
  <Card title="如何生成滿意的圖片" icon="target" href="/zh-Hant/api-capabilities/image-generation-success-tips">
    單次呼叫失敗怎麼救：改提示詞、重試、換模型、用測試工具定位
  </Card>

  <Card title="圖片 API 呼叫須知與最佳實踐" icon="book-check" href="/zh-Hant/api-capabilities/image-api-best-practices">
    同步呼叫、timeout 分檔、計費口徑、base64 處理、輸入圖預處理
  </Card>

  <Card title="蒙版局部重繪指南" icon="scissors" href="/zh-Hant/api-capabilities/gpt-image-2/mask-editing">
    畫素級可控的局部修改，官轉 gpt-image-2 專屬
  </Card>

  <Card title="多圖融合測試指南" icon="images" href="/zh-Hant/api-capabilities/multi-image-fusion-testing">
    參考圖上限實測方法與 14 圖融合結果
  </Card>

  <Card title="視覺理解" icon="eye" href="/zh-Hant/api-capabilities/vision-understanding">
    可用於給候選圖打分的視覺模型清單與呼叫方式
  </Card>

  <Card title="自實現非同步佇列" icon="list-checks" href="/zh-Hant/api-capabilities/image-async-queue">
    把同步出圖包進任務佇列，支撐多候選流水線
  </Card>
</CardGroup>
