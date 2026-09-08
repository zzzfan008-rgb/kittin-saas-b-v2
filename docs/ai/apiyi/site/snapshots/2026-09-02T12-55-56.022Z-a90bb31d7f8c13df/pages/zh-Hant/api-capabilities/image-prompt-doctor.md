> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 出圖提示詞診斷技能

> 把出圖前的提示詞審閱封裝成開箱即用的 Agent Skill，丟進 Codex、OpenClaw、hermes-agent、Claude Code 等任意編碼 Agent：按六要素體檢、揪出拉低品質的空泛詞、輸出可直接使用的最佳化提示詞，也能拿實際出圖反向複診。預設用 gpt-5.6-luna。

<Note>
  本頁提供一個**開箱即用的 Agent 技能（Skill）**：出圖**之前**先把提示詞過一遍體檢，補齊缺失要素、刪掉會拉低品質的空泛詞，再拿最佳化後的版本去出圖。整套東西就兩個檔案，**零第三方依賴**。
</Note>

出圖不滿意，八成問題出在提示詞，而不是模型或通道。這個技能把 [出圖進階篇](/zh-Hant/api-capabilities/image-advanced-workflow) 裡講的「改寫層」做成了可以丟進任意編碼 Agent 的技能。

## 這個技能能做什麼

<CardGroup cols={2}>
  <Card title="出圖前診斷" icon="clipboard-check">
    按主體 / 環境 / 光線 / 鏡頭 / 色調 / 構圖六要素逐項判定，給 0-100 分，列出風險項，輸出一條可直接複製使用的最佳化提示詞。
  </Card>

  <Card title="出圖後複診" icon="image-off">
    把實際出圖連同原提示詞一起傳進去，模型看圖對照，指出**提示詞裡哪一句沒有被執行**、模型自作主張加了什麼，再針對性重寫。
  </Card>

  <Card title="按目標模型給建議" icon="git-compare">
    指定 `-t` 之後會追加該系列特有的提醒：參考圖上限、蒙版支援情況、解析度引數叫什麼名字。
  </Card>

  <Card title="按題材切換檢查重點" icon="layers">
    人像查膚質與光位，產品圖查背景與文字禁令，插畫則自動降低寫實系檢查的權重。
  </Card>
</CardGroup>

## 實測：一條口語提示詞的完整診斷

輸入是使用者會隨手寫的原話，外加它實際出的圖：

```bash theme={null}
python3 scripts/prompt_doctor.py "幫我出一張咖啡的產品圖，好看一點，要高階感" \
  -i result.jpg -t nano-banana -s product
```

<Frame caption="實際出圖：這是用上面那條口語提示詞出的圖">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-prompt-before.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=a2e2025bf74baf40a7b63a424762cb62" alt="口語提示詞生成的咖啡圖：木桌、磨豆機、麻布袋等大量道具，杯身被模型編造了品牌名" width="1280" height="1280" data-path="images/image-workflow-prompt-before.jpg" />
</Frame>

診斷輸出（節選真實執行結果）：

```text theme={null}
【診斷】18/100 —— 主體可辨，但缺少產品攝影約束，畫面被模型擴充套件成生活方式場景

六要素：主體⚠️  環境❌  光線❌  鏡頭❌  色調⚠️  構圖❌

風險項：
  · 提示詞中的"咖啡的產品圖"沒有具體說明產品形態、材質、顏色和數量，模型自行生成了帶拉花的咖啡杯。
  · 提示詞沒有指定中性、可控的背景，模型自行加入了窗戶、木桌、咖啡磨豆機、咖啡豆、布袋和書本，
    導致畫面更像生活方式攝影而非電商產品圖。
  · 提示詞沒有寫主光方向、光線軟硬或補光，成片採用了左側窗光和較重的暖色陰影，光線不可控。
  · "好看一點"和"高階感"屬於抽象品質描述，沒有轉化為具體的色溫、飽和度和攝影介質。
  · 提示詞沒有宣告禁止文字，模型自行生成了咖啡杯上的"AURA COFFEE ROASTERS"、磨豆機標牌
    以及右下角書本上的"AURA"字樣，商用時存在錯誤品牌和亂碼風險。

【最佳化後的提示詞】

製作一張電商產品攝影風格的咖啡產品圖：畫面主體是一隻單獨的啞光暖白色陶瓷咖啡杯……
（完整正文略）

【引數建議】size=2K  aspect=1:1；電商方圖適合1:1；若需要橫版廣告，可改用4:3並保留右側文案留白。
```

拿這條最佳化後的提示詞原樣重出一次，同一個模型（`gemini-3-pro-image`）：

<Frame caption="按診斷給出的最佳化提示詞重出：乾淨可用的電商主圖">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-prompt-doctor-e2e.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=5ea65d564076d1ce6ed768ff0c7a0e60" alt="最佳化提示詞重出的咖啡圖：中性淺灰背景上一隻暖白陶瓷拿鐵杯，光線方向明確，投影落向右後方，畫面無任何文字，四周留白充足" width="1280" height="1280" data-path="images/image-prompt-doctor-e2e.jpg" />
</Frame>

道具全部清掉、背景變成可控的中性灰、投影方向明確、沒有任何編造的品牌名，留白也夠放文案了。**模型沒變，變的只是提示詞。**

## 什麼時候該跑診斷

不是每次出圖都要審一遍。按需求本身的具體程度決定：

| 你的需求長什麼樣                 | 該怎麼做                       |
| ------------------------ | -------------------------- |
| 口語化、只有主體（「來張咖啡的產品圖，好看點」） | **先診斷再出圖**，收益最大            |
| 出了圖但和預期差很遠               | **複診模式**（`-i` 傳實際出圖），看圖找原因 |
| 已經寫清了光位、焦段、構圖            | 不必多此一舉，直接出圖                |
| 要批量出同一系列的圖               | 先診斷定稿一條，之後複用，不必每張都審        |

<Info>
  這個技能只改提示詞，**不負責出圖**。出圖交給 [Nano Banana Pro 技能](/zh-Hant/api-capabilities/nano-banana-image/skills) 或 [GPT-Image-2 系列技能](/zh-Hant/api-capabilities/gpt-image-2/skills)，兩者串起來就是完整的「先審後出」流程。
</Info>

## 能用在哪些 Agent

<Info>
  一個 Skill 本質上就是**一個資料夾**：一份寫給 Agent 看的說明（`SKILL.md`）+ 一個幹活的指令碼。所以**凡是能讀取本地檔案、執行命令列的編碼 Agent 都能用上**——比如 **Codex、OpenClaw、hermes-agent、Claude Code** 等。

  唯一要求：跑 Agent 的那臺機器裝了 **Python 3** 並且**能聯網**（指令碼要直連 `api.apiyi.com`）。本技能**只用 Python 標準庫，不需要 pip 裝任何包**。
</Info>

## 三步裝好

### ① 建目錄、貼檔案

新建一個技能資料夾，放入下面兩個檔案（完整內容見後兩節）：

```
image-prompt-doctor/
├── SKILL.md
├── scripts/
│   └── prompt_doctor.py
└── .env          # 第②步建立，放你的 Key
```

不需要 `pip install` 任何東西。

### ② 同目錄寫 Key

在 `image-prompt-doctor/.env` 裡寫上你的 **API易 API Key**（在 `api.apiyi.com` 控制台建立）：

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

指令碼會自動從這個 `.env` 讀取 Key，**無需任何額外配置或環境變數**。

<Warning>
  `.env` 裡是你的金鑰。如果這個技能要隨專案倉庫共享，**務必把 `.env` 加進 `.gitignore`，不要提交到 git**。
</Warning>

### ③ 交給 Agent

* **支援技能自動發現的 Agent**（如 Claude Code）：把整個 `image-prompt-doctor/` 目錄放進它的技能目錄——個人級 `~/.claude/skills/`，或專案級 `.claude/skills/`（隨倉庫共享）。
* **其他 Agent**：按它各自的技能/外掛約定放置；或者最簡單——**直接讓 Agent「讀一下這個資料夾裡的 SKILL.md，並照著執行」** 即可。

裝好後就能用了，跳到 [怎麼用](#怎麼用) 看示例。

## SKILL.md

新建 `image-prompt-doctor/SKILL.md`，完整內容如下（`description` 寫清「做什麼 + 何時用」，Agent 會據此自動觸發）：

````markdown theme={null}
---
name: image-prompt-doctor
description: Diagnose and optimize an image-generation prompt before generating, or review a disappointing result against the prompt that produced it. Use this whenever the user is about to generate an image from a casual or vague prompt, asks why an image came out wrong, or asks to improve/rewrite an image prompt.
allowed-tools: Bash(python3 *)
---

# 出圖提示詞診斷

在真正出圖**之前**先審一遍提示詞，補齊缺失要素、刪掉會拉低品質的空泛詞，再拿最佳化後的版本去出圖。
也可以在出圖**之後**把實際結果回傳，讓模型對照提示詞指出哪一條沒被執行。

API 呼叫是單次原子呼叫，提示詞原樣進模型，沒有網頁版那種自動改寫兜底——所以提示詞品質直接決定成功率。

## 什麼時候用

- 使用者給的出圖需求是口語化的（「來張咖啡的產品圖，好看點」），**先診斷再出圖**；
- 使用者抱怨出圖不對、和預期差很遠，**用複診模式看圖找原因**；
- 使用者直接要求「幫我最佳化這個提示詞」。

需求本身已經寫得很具體（光位、焦段、構圖都有）時不必多此一舉，直接出圖。

## 兩種執行方式

### 方式一：調指令碼（預設，用 gpt-5.6-luna）

```bash
# 出圖前診斷
python3 ${CLAUDE_SKILL_DIR}/scripts/prompt_doctor.py "幫我出一張咖啡的產品圖，好一點" -t nano-banana -s product

# 出圖後複診：把實際出圖一起傳進去
python3 ${CLAUDE_SKILL_DIR}/scripts/prompt_doctor.py "把紅框裡的杯子改成黑色，其他不變" -i result.png

# 給程式消費的 JSON
python3 ${CLAUDE_SKILL_DIR}/scripts/prompt_doctor.py "國風山水插畫" -s illustration --json
```

引數：

- 第 1 個位置引數：待診斷的提示詞（必填）。
- `-i / --image`：實際出圖的路徑，可重複，最多 4 張；**傳了就進入複診模式**。
- `-t / --target`：目標圖片模型，`nano-banana` / `gpt-image` / `seedream` / `flux` / `grok`，會追加該系列特有的提醒（參考圖上限、蒙版支援、引數名等）。不確定就不傳。
- `-s / --scene`：題材，`portrait` / `product` / `scene` / `illustration`，預設 `auto`。插畫類會自動降低寫實系檢查的權重。
- `--model`：診斷用的文本模型，預設 `gpt-5.6-luna`（便宜、支援影像輸入）。也可用 `APIYI_TEXT_MODEL` 環境變數覆蓋。
- `--json`：輸出原始 JSON。

Key：指令碼自動讀技能目錄下 `.env` 裡的 `APIYI_API_KEY`，也支援同名環境變數。
報「未找到 Key」時提示使用者在 `.env` 寫一行 `APIYI_API_KEY=sk-xxx`。

### 方式二：你自己來（沒有 Key，或不想額外花錢時）

診斷量表本身沒有秘密，你可以直接按下面這套標準自己審，不調任何 API。
輸出格式與指令碼保持一致，使用者看到的東西一樣。

## 診斷量表

**六要素**，逐項判 ✅ 寫清楚了 / ⚠️ 提到但含糊 / ❌ 完全沒寫：

| 要素 | 判定標準 |
|---|---|
| 主體 | 材質、顏色、數量、狀態是否具體 |
| 環境 | 背景是什麼、虛實關係 |
| 光線 | 光源方向、軟硬、有無補光——**必須存在一個可指認的主光** |
| 鏡頭 | 焦段、光圈、機位高度、俯仰角 |
| 色調 | 白平衡傾向、飽和度、膠片或數碼質感 |
| 構圖 | 主體在畫面什麼位置、留白在哪 |

**必須報出的風險項**：

- **空泛品質詞**（8K / 超高畫質 / 超精細 / 傑作 / 大師作品 / 完美）：不提高解析度，反而把畫面推向過銳過飽和的渲染感，是「AI 味」的主要來源。建議刪除，換成具體的光、鏡頭、介質。
- **在提示詞裡寫解析度**：無效。解析度只由 `size` / `imageSize` 之類的引數決定。
- **一句話塞多個編輯動作**：單次成功率顯著下降，建議拆成多輪，一次只改一類東西。
- **用「這個」「紅框裡的東西」指代**：編輯類任務最常見的失敗原因，要點名具體物體。
- **沒有宣告畫面內文字**：模型會自行編造品牌名和文案，商用等於廢片。要麼寫清出現什麼字，要麼明確禁止出現文字。
- **真人、名人、受版權保護的角色、未成年人、暴力或成人內容**：會被上游稽核攔截，要提前改寫。

**最佳化原則**：補齊缺失要素，不要堆形容詞把提示詞寫長；使用者已明確指定的要素原樣保留；
要寫實質感就加具體光位、焦段光圈、介質和主動新增的瑕疵（毛孔、碎髮、磨損、水漬），
不要用「真實感」「高階感」這類抽象詞；不要輸出獨立的負面提示詞欄位，把「不要什麼」直接寫進正文。

## 輸出與後續動作

把診斷結果如實轉述給使用者——分數、缺了哪些要素、風險項、最佳化後的提示詞、改了什麼、引數建議。

然後**徵求使用者確認再出圖**：最佳化版可能改變了原意（比如把「咖啡」定成了「拿鐵」），
讓使用者看一眼再決定。使用者認可後，用最佳化後的提示詞調出圖技能（如 `nano-banana-pro`），
並按「引數建議」裡的 `size` / `aspect` 傳參。

使用者明確說「不用問了直接出」時，就用最佳化版直接出圖，把診斷摘要和圖一起給他。

## 邊界

- 這個技能只改提示詞，**不出圖**，也不做稽核預判之外的合規判斷。
- 最佳化後的提示詞仍然可能一次不中——生成模型單次取樣本身有波動，失敗就重試或換模型。
- 解析度、寬高比、參考圖這些只能靠引數解決的東西，診斷只會提醒，不會寫進提示詞正文。
````

## scripts/prompt\_doctor.py

新建 `image-prompt-doctor/scripts/prompt_doctor.py`，完整內容如下（純 Python 標準庫，無需安裝依賴）：

````python theme={null}
#!/usr/bin/env python3
"""出圖提示詞診斷：審閱提示詞、指出缺失要素、給出最佳化版本。

通過 API易 呼叫文本模型（預設 gpt-5.6-luna）。純標準庫，零依賴。
支援兩種模式：
  1) 出圖前診斷 —— 只給提示詞
  2) 出圖後複診 —— 同時給提示詞和實際出圖（模型看圖反推哪條要素沒落實）
"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request

DEFAULT_MODEL = "gpt-5.6-luna"
BASE_URL = "https://api.apiyi.com/v1/chat/completions"
MAX_IMAGES = 4

# 各目標模型的額外提醒，只在 --target 指定時追加
TARGET_NOTES = {
    "nano-banana": "目標模型是 Nano Banana（Gemini 系）：自然語言長句友好，可以寫成連貫段落而非關鍵詞堆砌；"
                   "參考圖最多 14 張；解析度走 imageSize 引數（1K/2K/4K），寬高比走 aspectRatio。",
    "gpt-image": "目標模型是 GPT-Image 系：指令遵循強、畫面內文字渲染準確，可以放心指定要出現的文字內容；"
                 "參考圖最多 16 張；只有官轉 gpt-image-2 支援蒙版局部重繪和 background=transparent 透明背景；"
                 "解析度走 size 引數。",
    "seedream": "目標模型是 Seedream：中文語境理解好；參考圖最多 10 張（輸入+輸出不超過 15）；"
                "5.0 與 5.0-pro 可以在提示詞裡要求輸出透明背景的 PNG。",
    "flux": "目標模型是 FLUX：偏好結構清晰的描述；FLUX.2 pro/max/flex 參考圖最多 8 張，Kontext 只有 1 張。",
    "grok": "目標模型是 Grok Imagine：參考圖只有走 /v1/images/edits 才生效，"
            "傳給 /v1/images/generations 會被靜默丟棄且照常計費；參考圖最多 4 張。",
}

SCENE_NOTES = {
    "portrait": "這是人像。重點檢查：是否指定了唯一主光的方向與軟硬、焦段與光圈、是否要求了自然膚質"
                "（毛孔、絨毛、油光）、是否停用了磨皮美顏、主體是否被挪出畫面正中。",
    "product": "這是產品圖/電商圖。重點檢查：背景是否被指定為中性可控、光位與補光是否寫清、"
               "投影方向、是否明確禁止出現品牌名和文字（否則模型會自行編造）、是否留出放文案的空白。",
    "scene": "這是環境場景。重點檢查：具體時間與天氣、唯一主光來源、機位高度與焦段、"
             "是否加入了磨損與雜物等真實痕跡、畫面裡的人是否被要求不正對鏡頭。",
    "illustration": "這是插畫/非寫實。去 AI 味的那套寫實手法要降權，改為檢查：畫風是否被具體指認"
                    "（媒材、筆觸、年代、參考流派）、配色方案、線條與上色方式、構圖與留白。",
}

SYSTEM = """你是出圖提示詞診斷專家，服務於通過 API 直接呼叫圖片模型的開發者和設計師。
API 呼叫是單次原子呼叫，提示詞原樣進模型，沒有任何網頁版那樣的自動改寫兜底，所以提示詞品質直接決定成功率。

## 診斷量表

先按「六要素」逐項判定 ok（寫清楚了）/ weak（提到但含糊）/ missing（完全沒寫）：

1 subject 主體：材質、顏色、數量、狀態是否具體
2 environment 環境：背景是什麼、虛實關係
3 light 光線：光源方向、軟硬、有無補光——必須存在一個可指認的主光
4 lens 鏡頭與視角：焦段、光圈、機位高度、俯仰角
5 tone 色調與介質：白平衡傾向、飽和度、膠片或數碼質感
6 composition 構圖：主體在畫面什麼位置、留白在哪

## 必須報出的風險項

- 出現 8K / 超高畫質 / 超精細 / 傑作 / 大師作品 / 完美 這類空泛品質詞：它們不提高解析度，
  反而把畫面推向過銳過飽和的渲染感，是「AI 味」的主要來源，必須建議刪除並換成具體的光、鏡頭、介質描述。
- 在提示詞裡寫解析度（4K/8K/高畫質）：無效。解析度只由 size / imageSize 之類的引數決定。
- 一句話裡塞了多個互不相關的編輯動作：單次成功率會顯著下降，建議拆成多輪。
- 用「這個」「紅框裡的東西」等指代而不點名具體物體：編輯類任務最常見的失敗原因。
- 沒有宣告畫面內文字：模型可能自行編造品牌名或文案，商用場景等於廢片。要麼寫清要出現什麼字，要麼明確禁止出現文字。
- 涉及真人、名人、受版權保護的角色、未成年人、暴力或成人內容：會被上游稽核攔截，需要提示改寫。

## 最佳化原則

- 補齊缺失要素，不要靠堆砌形容詞把提示詞寫長。
- 使用者已經明確指定過的要素原樣保留，不要擅自改寫。
- 要寫實質感就加具體的光位、焦段光圈、膠片或數碼介質、以及主動新增的瑕疵（毛孔、碎髮、磨損、水漬），
  不要用「真實感」「高階感」這類抽象詞。
- 不要輸出負面提示詞語法（多數圖片模型不支援獨立的 negative prompt 欄位），把「不要什麼」直接寫進正文。
- optimized_prompt 與 changes 必須與使用者原提示詞使用同一種語言，中文提示詞就全中文，不要中英混寫。

## 輸出

嚴格輸出以下 JSON，不要加程式碼圍欄，不要額外解釋：

{
  "score": 0-100 的整數，表示這條提示詞單次出圖的可用程度,
  "verdict": "一句話總評，不超過 40 字",
  "elements": {"subject":"ok|weak|missing","environment":"...","light":"...","lens":"...","tone":"...","composition":"..."},
  "risks": ["每條一句話，說明問題和後果；沒有風險則給空陣列"],
  "optimized_prompt": "最佳化後的完整提示詞正文，可直接複製使用",
  "changes": ["逐條說明改了什麼、為什麼"],
  "suggested_params": {"size":"1K|2K|4K","aspect":"如 1:1 / 16:9","note":"引數上的建議，沒有則空字串"}
}"""

REVIEW_EXTRA = """

## 本次是出圖後複診

使用者已經用下面這條提示詞出了圖，實際結果附在後面。請對照提示詞逐條核對：
哪些要求落實了、哪些沒落實、模型自作主張加了什麼。
risks 裡要明確寫出「提示詞的哪一句沒有被執行」，optimized_prompt 要針對這些偏差重寫，
而不是泛泛地補要素。"""


def load_api_key():
    """優先讀環境變數；否則在指令碼所在目錄及其父目錄找 .env。"""
    key = os.environ.get("APIYI_API_KEY")
    if key:
        return key
    here = os.path.dirname(os.path.abspath(__file__))
    for d in (here, os.path.dirname(here)):
        env_path = os.path.join(d, ".env")
        if os.path.exists(env_path):
            with open(env_path, encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("APIYI_API_KEY") and "=" in line:
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def image_data_url(path):
    mime = "image/png" if path.lower().endswith(".png") else "image/jpeg"
    with open(path, "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode()


def build_messages(prompt, images, target, scene):
    system = SYSTEM
    if images:
        system += REVIEW_EXTRA
    extras = [TARGET_NOTES[target]] if target else []
    if scene and scene != "auto":
        extras.append(SCENE_NOTES[scene])
    if extras:
        system += "\n\n## 本次的額外約束\n\n" + "\n".join("- " + e for e in extras)

    content = [{"type": "text", "text": "待診斷的提示詞：\n\n" + prompt}]
    for path in images:
        content.append({"type": "image_url", "image_url": {"url": image_data_url(path)}})
    return [{"role": "system", "content": system},
            {"role": "user", "content": content}]


def diagnose(api_key, model, messages):
    payload = json.dumps({
        "model": model,
        "messages": messages,
        "response_format": {"type": "json_object"},
    }).encode()
    req = urllib.request.Request(
        BASE_URL, data=payload, method="POST",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            resp = json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"請求失敗 HTTP {e.code}：{e.read().decode(errors='replace')[:500]}")

    text = resp["choices"][0]["message"]["content"].strip()
    if text.startswith("```"):                      # 防禦：個別模型仍會套程式碼圍欄
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise RuntimeError("模型未返回合法 JSON，原始輸出：\n" + text[:800])


MARK = {"ok": "✅", "weak": "⚠️", "missing": "❌"}
LABEL = {"subject": "主體", "environment": "環境", "light": "光線",
         "lens": "鏡頭", "tone": "色調", "composition": "構圖"}


def render(r):
    out = [f"【診斷】{r.get('score', '?')}/100 —— {r.get('verdict', '')}", ""]
    els = r.get("elements", {})
    out.append("六要素：" + "  ".join(
        f"{LABEL.get(k, k)}{MARK.get(v, '?')}" for k, v in els.items()))

    risks = r.get("risks") or []
    if risks:
        out += ["", "風險項："] + [f"  · {x}" for x in risks]
    else:
        out += ["", "風險項：無"]

    out += ["", "【最佳化後的提示詞】", "", r.get("optimized_prompt", "")]

    changes = r.get("changes") or []
    if changes:
        out += ["", "【改了什麼】"] + [f"  - {x}" for x in changes]

    p = r.get("suggested_params") or {}
    bits = []
    if p.get("size"):
        bits.append(f"size={p['size']}")
    if p.get("aspect"):
        bits.append(f"aspect={p['aspect']}")
    line = "  ".join(bits)
    if p.get("note"):
        line = (line + "；" if line else "") + p["note"]
    if line:
        out += ["", "【引數建議】" + line]
    return "\n".join(out)


def main():
    parser = argparse.ArgumentParser(description="出圖提示詞診斷與最佳化")
    parser.add_argument("prompt", help="待診斷的提示詞")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help=f"實際出圖的路徑，可重複（最多 {MAX_IMAGES} 張）；傳入即進入出圖後複診模式")
    parser.add_argument("-t", "--target", choices=sorted(TARGET_NOTES),
                        help="目標圖片模型，用於追加該系列特有的提醒")
    parser.add_argument("-s", "--scene", choices=["auto"] + sorted(SCENE_NOTES), default="auto",
                        help="題材，預設 auto（不追加題材專項檢查）")
    parser.add_argument("--model", default=os.environ.get("APIYI_TEXT_MODEL", DEFAULT_MODEL),
                        help=f"診斷用的文本模型，預設 {DEFAULT_MODEL}")
    parser.add_argument("--json", action="store_true", help="輸出原始 JSON，便於程式消費")
    args = parser.parse_args()

    api_key = load_api_key()
    if not api_key:
        sys.exit("未找到 API Key：請在技能目錄的 .env 寫一行 APIYI_API_KEY=sk-xxx，或設定同名環境變數")

    if len(args.image) > MAX_IMAGES:
        sys.exit(f"最多 {MAX_IMAGES} 張出圖，收到 {len(args.image)} 張")
    for path in args.image:
        if not os.path.exists(path):
            sys.exit(f"圖片不存在：{path}")

    messages = build_messages(args.prompt, args.image, args.target, args.scene)
    try:
        result = diagnose(api_key, args.model, messages)
    except RuntimeError as e:
        sys.exit(str(e))

    print(json.dumps(result, ensure_ascii=False, indent=2) if args.json else render(result))


if __name__ == "__main__":
    main()
````

## 怎麼換診斷模型

預設用 `gpt-5.6-luna`——便宜（輸入 \$0.2 / 輸出 \$1.2 每百萬 tokens）、支援影像輸入，複診模式要看圖，正好夠用。想換成別的模型有兩種方式：

```bash theme={null}
# 單次覆蓋
... prompt_doctor.py "提示詞" --model gemini-3.5-flash

# 改預設值：在 image-prompt-doctor/.env 里加一行
APIYI_TEXT_MODEL=gemini-3.5-flash
```

<Warning>
  換模型時注意兩點：**複診模式必須選支援影像輸入的模型**（純文本模型傳圖會報錯），可選清單見 [視覺理解](/zh-Hant/api-capabilities/vision-understanding)；另外指令碼用了 `response_format: {"type": "json_object"}`，不支援該引數的模型可能返回帶程式碼圍欄的文本（指令碼已做剝離兜底，但仍以支援 JSON 模式的模型為準）。
</Warning>

## 為什麼一句話就會自動診斷

很多人好奇：我又沒敲命令，怎麼說句「幫我畫張圖」它就先去審提示詞了？

原理是這樣：Agent 啟動時會**先讀取每個技能 `SKILL.md` 裡的 `description`**（一段很短的後設資料，說明「這個技能做什麼、什麼時候該用」）。當你說出的需求**匹配上**這段描述的場景（比如「畫一張……」「這圖為什麼不對」「最佳化下提示詞」），Agent 就**自動決定呼叫這個技能**，去讀完整的 `SKILL.md` 並執行指令碼——整個過程你不用記任何命令。

SKILL.md 裡還寫明瞭「需求已經很具體時不必多此一舉」，所以它不會對每條提示詞都動手。想要**百分百可控**時，用下面的**顯性呼叫**。

## 怎麼用

### 自然語言（隱式觸發）

裝好後直接對 Agent 說話即可：

| 你說                        | 技能行為                       |
| ------------------------- | -------------------------- |
| "幫我畫張咖啡的產品圖，好看一點"         | 需求口語化 → 先診斷，報結果，確認後再出圖     |
| "這張圖為什麼不對？"（附上圖）          | 走複診模式 `-i`，看圖指出哪句沒被執行      |
| "最佳化一下這個提示詞"              | 只診斷不出圖                     |
| "用 gpt-image-2 出圖，幫我先審下詞" | 帶 `-t gpt-image`，追加該系列特有提醒 |
| "不用診斷，直接出圖"               | 跳過本技能，直接調出圖技能              |

### 顯性呼叫（更可控）

* **支援斜槓命令的 Agent**（如 Claude Code）：

  ```text theme={null}
  /image-prompt-doctor 一位女性在咖啡館窗邊微笑 -s portrait
  ```

* **任意 Agent / 直接命令它跑指令碼**（最通用）：

  ```text theme={null}
  執行 python3 image-prompt-doctor/scripts/prompt_doctor.py "一位女性在咖啡館窗邊微笑" -s portrait
  ```

## 診斷結果在哪裡

* 這個技能**不產出檔案**，結果直接列印到終端，Agent 會把它轉述給你——分數、六要素標記、風險項、最佳化後的提示詞、改了什麼、引數建議。

* 需要把結果接進自己的程式時加 `--json`，輸出是一個結構化物件（`score` / `elements` / `risks` / `optimized_prompt` / `changes` / `suggested_params`），重定向落盤即可：

  ```bash theme={null}
  python3 image-prompt-doctor/scripts/prompt_doctor.py "提示詞" --json > diagnosis.json
  ```

* **最佳化後的提示詞需要你確認再用**：改寫可能順帶改變原意（比如把「咖啡」定成了「拿鐵」），SKILL.md 裡已經要求 Agent 先問一句再出圖。

* 複診模式傳的圖**不會被修改或覆蓋**，只作為只讀輸入。

## 成本

一次診斷的開銷是幾千 tokens 級別，按 `gpt-5.6-luna` 的標價折算不到一分錢，而一次 `high` 畫質的出圖是它的幾十倍以上。**先診斷再出圖，省下的重試費用遠超診斷本身。**

複診模式要傳圖，圖片按輸入 token 計費，成本略高但仍遠低於一次出圖。

## 相關文件

* [出圖進階：工作流編排與去 AI 味](/zh-Hant/api-capabilities/image-advanced-workflow)（這個技能在整條流水線裡的位置）
* [如何生成滿意的圖片](/zh-Hant/api-capabilities/image-generation-success-tips)（單次呼叫失敗怎麼救）
* [Nano Banana Pro Agent 技能](/zh-Hant/api-capabilities/nano-banana-image/skills)（配套出圖技能，診斷完直接接上）
* [GPT-Image-2 系列 Agent 技能](/zh-Hant/api-capabilities/gpt-image-2/skills)（同上，GPT 線）
* [GPT-5.6 Luna](/zh-Hant/models/gpt-5-6-luna)（診斷預設使用的模型：規格、定價與端點支援）
