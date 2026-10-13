> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2.1 生圖/編輯

> 谷歌 Nano Banana 2.1（gemini-nano-banana-2.1）正式版：Nano Banana 2 的升級版，畫質、文字渲染、多輪一致性提升。按次 $0.045/次（4K 同價），按量輸入 $0.66、輸出 $13.2 每百萬 tokens。

## 概述

**Nano Banana 2.1** 是谷歌於 2026 年 10 月 6 日釋出的影像生成模型，模型 ID 為 **`gemini-nano-banana-2.1`**，釋出即為正式版（GA）。它是 [Nano Banana 2](/zh-Hant/api-capabilities/nano-banana-2-image/overview)（`gemini-3.1-flash-image`）的升級版，保持 Flash 級速度，同時提升了畫質、圖中文字渲染和多輪編輯的一致性，並修復了上一代的平鋪偽影。谷歌官方推薦新專案直接使用 2.1。

<Note>
  **🆕 2026 年 10 月 6 日釋出**：API易 已同步上線，支援**按次**（\$0.045/次，1K / 2K / 4K 同價，2026-10-13 起由 \$0.05 降價）和**按量**（輸入 \$0.66、輸出 \$13.2 每百萬 tokens）兩種計費。Nano Banana 2 繼續可用、價格不變，谷歌也尚未公佈它的下線日期。
</Note>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

<CardGroup cols={2}>
  <Card title="文生圖 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/gemini-nano-banana-2.1/text-to-image">
    輸入文本提示詞生成圖片，帶互動式 Playground 線上除錯。
  </Card>

  <Card title="圖片編輯 API" icon="image" href="/zh-Hant/api-capabilities/gemini-nano-banana-2.1/image-edit">
    上傳圖片 + 編輯指令生成新圖片，帶互動式 Playground 線上除錯。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——超時、`parts` 防禦式解析、上傳壓縮、解析度引數這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 Nano Banana 2.1 的文生圖與圖片編輯。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 Nano Banana 2.1（`gemini-nano-banana-2.1`）的「文生圖 + 圖片編輯」。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/gemini-nano-banana-2.1/overview.md](https://docs.apiyi.com/api-capabilities/gemini-nano-banana-2.1/overview.md) 拿到本頁純文本版；需要更細的引數說明時，text-to-image 和 image-edit 兩頁同樣在地址後加 `.md` 即可。

  接入要求：

  1. 超時：走 Gemini 原生格式 `POST https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent`，客戶端 timeout 提到 360 秒兜底。圖片介面是同步呼叫，沒有任務 ID，客戶端一斷連結果就丟了、但這次請求照樣計費。反向代理、閘道、Serverless 執行上限這些中間層也要一起放寬，任何一層小於生成時間都會掐斷請求。如果你用 Node，注意 undici 有三個獨立的超時設定，SDK 的 `timeout` 並不覆蓋它們。

  2. 返回解析（**最容易寫錯的一條**）：圖片是 base64，在 `candidates[0].content.parts[]` 裡的 `inlineData.data`。但 `parts` 是**異構陣列，段數和順序都不保證**——前面可能掛一個文本段，圖片就落到下標 1 而不是 0。所以**絕對不要寫死 `parts[0]` 或 `parts[1]`**。正確寫法：遍歷 `parts`、篩出所有含 `inlineData` 的段，取**最後一張**（複雜任務會返回多張中間稿，最後一張才是終稿）。`mimeType` 也從響應裡讀，不要寫死成 `image/png`。拿到後渲染展示並提供「儲存到本地」。

  3. 上傳壓縮：編輯時把參考圖 base64 塞進 `inlineData`。上傳前先壓縮——超過 1.5MB 才處理，長邊等比縮到 2048px 以內（不放大小圖），以品質 0.9 重編碼、保持原格式；多圖時合計控制在 6MB 以內。base64 編碼後體積還會再膨脹約三分之一，所以單圖儘量壓到 5MB 以內留足餘量。某張圖壓縮失敗就回退用原圖繼續，不要因為壓縮失敗中斷整個請求。另外注意：**同一個 part 裡只能放 `text` 或 `inlineData` 其中一個**，不能兩個欄位並存，正確結構是 1 個文本段 + N 個圖片段。

  4. 解析度引數：**必須顯式傳** `generationConfig.imageConfig.imageSize`（`1K` / `2K` / `4K`，預設 `1K`；**本模型不支援 `512`，傳了會直接報 400**）和 `aspectRatio`（本頁列了 14 個合法比例）。不傳 `aspectRatio` 時模型會按內容自己選比例，結果不可控。按量計費時**解析度直接決定單價**。前臺介面把解析度和比例都做成下拉。

  5. 錯誤處理：內容稽核攔截時 HTTP 仍然是 200，但 `candidates[0].content.parts` 為空。判斷順序是先看 `candidatesTokenCount` 是否為 0，再看 `finishReason` 是否非 `STOP`。`IMAGE_SAFETY` 這類攔截**不計費**，原樣重試 1-2 次往往就成功了，建議在程式碼裡對它做自動重試。

  6. Key 從環境變數 `APIYI_API_KEY` 讀，用 `Authorization` 頭加 `Bearer` 字首傳，不要硬編碼進程式碼、也不要提交進 git。

  7. 改完真跑一次文生圖 + 一次圖片編輯，把出圖結果和這兩次呼叫的花費貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求 | 擋掉的坑 |
  | - | - |
  | 不寫死 `parts` 下標 | `parts` 段數和順序都不保證，寫死下標一定會間歇性失敗。詳見 [Nano Banana 開發指南](/zh-Hant/api-capabilities/nano-banana-dev-guide) |
  | 取最後一張圖片段 | 複雜編輯任務會返回多張中間稿，最後一張才是終稿 |
  | 不傳 `512` | 2.1 去掉了 512 檔，沿用 Nano Banana 2 的程式碼會直接 400 |
  | 顯式傳 `imageSize` 和 `aspectRatio` | 按量計費下解析度決定單價；不傳比例時模型自己選，同一提示詞可能出橫圖也可能出豎圖 |
  | 上傳前壓縮 | base64 後體積還會再膨脹約三分之一。壓縮標準見 [圖片壓縮與輸出解析度說明](/zh-Hant/api-capabilities/image-compression-resolution) |
  | 對 `IMAGE_SAFETY` 自動重試 | 稽核攔截返回 200 但沒有圖，且不計費，原樣重試往往就過了。詳見 [Gemini 出圖錯誤處理](/zh-Hant/api-capabilities/gemini-image-error-handling) |
</Accordion>

## 核心特性

<CardGroup cols={2}>
  <Card title="畫質升級" icon="sparkles">
    視覺品質較 Nano Banana 2 提升，並修復了上一代的平鋪偽影
  </Card>

  <Card title="文字渲染更準" icon="type">
    圖中文字更清晰、錯字更少，適合海報、營銷物料、資訊圖
  </Card>

  <Card title="多輪編輯更穩" icon="message-circle">
    對話式多輪編輯時角色和畫面一致性更好，逐步精調不易跑偏
  </Card>

  <Card title="三檔思考" icon="brain">
    支援 minimal / medium / high 三檔，預設 medium，比上一代多了中間檔
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="4K 超清輸出" icon="expand">
    1K / 2K / 4K 三檔解析度，按次計費 4K 與 1K 同價
  </Card>

  <Card title="14 種寬高比" icon="maximize">
    含 1:4、4:1、1:8、8:1 超長/超寬比例，官方稱寬幅格式在高解析度下效果更好
  </Card>

  <Card title="多參考圖融合" icon="users">
    最多 10 張物體參考圖 + 4 張角色參考圖 + 3 張風格參考圖
  </Card>

  <Card title="Google 搜尋接地" icon="search">
    可掛 `googleSearch` 工具，畫天氣卡、行情圖等需要即時資訊的圖片
  </Card>
</CardGroup>

## 與 Nano Banana 2 的區別

| 對比項 | **Nano Banana 2.1** | Nano Banana 2 |
| - | - | - |
| 模型 ID | `gemini-nano-banana-2.1` | `gemini-3.1-flash-image` |
| 狀態 | 正式版，谷歌推薦新專案使用 | 正式版，繼續可用 |
| 畫質 / 文字渲染 / 多輪一致性 | 更好 | 好 |
| 解析度 | 1K / 2K / 4K | 512 / 1K / 2K / 4K |
| 4K 單張輸出 tokens | 3780 | 2520 |
| 思考檔位 | minimal / medium / high，預設 medium | minimal / high，預設 minimal |
| 官方價：輸入 | \$1.50 / M | \$0.50 / M |
| 官方價：圖片輸出 | \$30 / M | \$60 / M |
| 官方價：4K 每張 | \$0.113 | \$0.151 |
| **API易 按次** | **\$0.045 / 次** | \$0.055 / 次 |
| **API易 按量** | 輸入 \$0.66 / 輸出 \$13.2 每 M | 輸入 \$0.18 / 輸出 \$21.6 每 M |

<Tip>
  **怎麼選**：

  * **新專案** → 直接用 Nano Banana 2.1，畫質更好，按次也更便宜
  * **已在用 Nano Banana 2** → 改一個模型名即可切換；但如果程式碼裡用了 `512` 檔，要先改成 `1K`
  * **需要 512px 縮圖** → 繼續用 Nano Banana 2，或用 [Nano Banana 2 Lite](/zh-Hant/api-capabilities/nano-banana-lite-image/overview)
  * **追求畫質上限** → [Nano Banana Pro](/zh-Hant/api-capabilities/nano-banana-image/overview)（\$0.09/次）
</Tip>

## 模型定價

<Info>
  **計費模式選擇**：Nano Banana 2.1 支援兩種計費方式，通過建立令牌時的「Billing model」設定選擇：

  * 選擇 **Pay-as-you-go**（按量計費）或 **Pay-as-you-go Priority**（按量優先）→ 按量計費
  * 選擇 **Pay-per-request**（按次計費）或 **Pay-per-request Priority**（按次優先）→ 按次計費
  * ⚠️ **請勿選擇 Hybrid billing（混合計費）**
</Info>

### 按次計費

| 模型 | API易定價 | 谷歌官方 4K 定價 | 相對官方 |
| - | - | - | - |
| **Nano Banana 2.1** `gemini-nano-banana-2.1` | **\$0.045/次**（1K / 2K / 4K 同價） | \$0.113/張 | **約 40%** |

<Tip>
  **2026-10-13 起降價 10%：\$0.05 → \$0.045/次**（1K / 2K / 4K 同價）。

  * **為什麼降**：按量計費下 1K / 2K 單張本來就只要 \$0.02–\$0.04，按次 \$0.05 顯得偏貴，所以把按次價也降下來。出 4K 的話，按次比按量（\$0.06 以上）便宜近三成。
  * **按量價不變**：輸入 \$0.66、輸出 \$13.2 每百萬 tokens。
  * **還能更低**：疊加充值活動加贈 10%–20%，按次實際約 \$0.038–\$0.041/次。
</Tip>

### 按量計費

| 計費專案 | Google 官方 | API易 | 相對官方 |
| - | - | - | - |
| 輸入 | \$1.50/M tokens | \$0.66/M tokens | **44%** |
| 輸出（圖片、文本、思考統一計價） | 圖片 \$30/M，文本與思考 \$7.50/M | \$13.2/M tokens | 圖片部分 **44%** |

<Note>模型價格與官網對齊，且可能隨官網調整；上表僅供參考，具體以頂部導航「模型價格」欄目為準：[模型價格](/zh-Hant/models/index)。</Note>

### 按量計費：線上真實扣費預覽

Nano Banana 2.1 **預設就會先思考再出圖**（預設檔 medium），每張圖除了圖片 tokens，還會產生約 400–1300 個思考和其它輸出 tokens，它們與圖片一起按 \$13.2/M 計費。所以按量計費的單張費用**不是定值，有高有低**。下表摘自 2026-10-07 線上按量計費的真實請求，金額為控制台實際扣費（解析度按輸出 tokens 推斷）：

| 場景 | 輸入 tokens | 輸出 tokens | 實際扣費 |
| - | - | - | - |
| 1K 文生圖 | 36 | 1,970 | \$0.0260 |
| 1K 單圖編輯 | 1,137 | 2,015 | \$0.0273 |
| 1K 單圖編輯（思考較多） | 1,132 | 2,409 | \$0.0325 |
| 2K 文生圖 | 13 | 2,623 | \$0.0346 |
| 2K 單圖編輯 | 1,188 | 2,957 | \$0.0398 |
| 2K 14 張參考圖融合 | 15,735 | 2,827 | \$0.0581 |
| 4K 文生圖 | 13 | 4,703 | \$0.0621 |
| 4K 複雜提示詞 | 72 | 4,933 | \$0.0652 |

當天 60 次按量請求的分佈：

| 解析度 | 請求數 | 最低 | 中位 | 最高 | 對比按次 |
| - | - | - | - | - | - |
| 1K | 31 | \$0.021 | \$0.029 | \$0.033 | \$0.045 |
| 2K | 19 | \$0.033 | \$0.036 | \$0.058 | \$0.045 |
| 4K | 10 | \$0.061 | \$0.063 | \$0.067 | \$0.045 |

<Tip>
  **怎麼選計費方式**：

  * **出 1K / 2K → 選按量**，單張通常 \$0.02–\$0.04，比按次 \$0.045 更低
  * **出 4K → 選按次**，固定 \$0.045/次，按量要 \$0.06 以上
  * **一次塞很多參考圖**（如 10 張以上）時，輸入 tokens 會讓按量費用接近甚至超過 \$0.045，這類請求也建議走按次

  結合 [充值加贈活動](/zh-Hant/faq/recharge-promotions)，實際成本更低。
</Tip>

<Info>
  **為什麼不能只按圖片 tokens 估成本**：`usageMetadata` 裡的 `thoughtsTokenCount`（思考 tokens）不包含在 `candidatesTokenCount` 裡，但會計入 API易 日誌的輸出 tokens 一起計費。按 1120 / 1680 / 3780 估算會低估 20%–40%。對賬請以控制台日誌的扣費為準。
</Info>

## 影響計費的引數

| 引數 | 對單次賬單的影響 | 說明 |
| - | - | - |
| `imageConfig.imageSize` | 1K 約 \$0.026 → 4K 約 \$0.062（按量） | 最大的槓桿；按次計費不受影響 |
| `thinkingConfig.thinkingLevel` | `high` 比預設多約 30% 思考 tokens，4K 單張約 +6% | 影響很小，按需開 |
| `tools: [{"googleSearch": {}}]` | 每次檢索另收 \$0.014，實測每次出圖檢索 2 次 | 開了之後單次成本會明顯上升 |

### thinkingLevel：預設 medium，high 只貴一點

| 設定 | 思考 tokens（中位） | 4K 單張費用（按量） |
| - | - | - |
| 不傳（預設 medium） | 約 690 | 約 \$0.062 |
| `high` | 約 940 | 約 \$0.066 |

與 Nano Banana 2 不同（它預設 minimal、開 `high` 要貴 54%），2.1 預設就已經在思考，`high` 只是多想一點。對畫面內文字排版、資料圖表比例有硬要求時可以放心開。

### Google 搜尋接地：按檢索次數另收費

需要即時資訊才能畫對的場景（天氣卡、行情圖、近期活動海報），可以掛 `googleSearch` 工具：

```json theme={null}
{
  "contents": [{ "parts": [{ "text": "畫一張東京今天天氣的卡片海報" }] }],
  "tools": [{ "googleSearch": {} }]
}
```

實測 3/3 觸發接地，每次請求模型自主發起 2 次檢索，每次檢索收 \$0.014（即 \$14 / 1000 次）。**檢索次數由模型決定，無法預先控制**，做成本預估時按每次請求 2–3 次檢索算。

<Warning>
  **按次計費下檢索費照樣另收**：\$0.045/次只覆蓋出圖本身，掛了 `googleSearch` 後檢索費按次數疊加在上面。
</Warning>

## 分組介紹

Nano Banana 2.1 在 API易 提供兩個分組，可在後臺「令牌設定」中切換：

| 分組 | 倍率 | 適用場景 |
| - | - | - |
| `Default` 預設分組 | 1.0x | 基礎通道，與定價表一致；預設推薦 |
| `NB-Enterprise` 企業分組 | 1.4x | 兜底通道，預設分組緊張或超時高發時切換，穩定優先 |

**令牌「計費模式」推薦**：選 `按量優先`（Pay-as-you-go Priority）——同時相容 Nano Banana 2 / 2.1 的按量計費和 Nano Banana Pro 的按次計費，**一把令牌跑全系列**。主分組放 `Default`、兜底分組掛上 `NB-Enterprise`，主分組 429 時會自動回退繼續出圖。

## 支援的解析度與寬高比

### 輸出解析度

| 解析度 | 說明 | 推薦場景 |
| - | - | - |
| 1K | 預設 | 社交媒體、網頁展示 |
| 2K | 高畫質 | 高畫質顯示、列印材料 |
| 4K | 超高畫質 | 專業設計、商業海報 |

<Warning>
  **不支援 `512`**：傳 `"imageSize": "512"` 會直接返回 400 `Image size 512 is not supported for this model`（不計費）。從 Nano Banana 2 遷移時注意改掉。
</Warning>

### 支援的寬高比（14 種）

`1:1`、`1:4`、`4:1`、`1:8`、`8:1`、`2:3`、`3:2`、`3:4`、`4:3`、`4:5`、`5:4`、`9:16`、`16:9`、`21:9`

**不傳 `aspectRatio` 時，模型會按內容自己選比例**：實測風景類提示詞多出 16:9，海報類多出 2:3 或 3:4。需要固定比例請顯式傳。

### 實測輸出尺寸（畫素）

| 寬高比 | 1K | 2K | 4K |
| - | - | - | - |
| **16:9** | 1376×768 | 2752×1536 | 5504×3072 |
| **2:3** | 848×1264 | — | 3392×5056 |
| **3:4** | 896×1200 | — | — |
| **8:1** | 2928×352 | — | — |

<Info>
  以上為 2026-10-07 實測值，「—」為尚未實測。注意 8:1 在 1K 下是 2928×352，與 Nano Banana 2 的 3072×384 不同，**不要照搬 Nano Banana 2 的尺寸表**做前端預留。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="Nano Banana 2.1 和 Nano Banana 2 是同一個模型嗎？">
    不是。2.1 是獨立的新模型 ID `gemini-nano-banana-2.1`，畫質、文字渲染和多輪一致性更好，計費結構也不同（輸入更貴、圖片輸出更便宜、4K 單張 tokens 更多）。兩個模型在 API易 同時可用，互不影響。
  </Accordion>

  <Accordion title="從 Nano Banana 2 切換過來要改什麼？">
    1. 模型名從 `gemini-3.1-flash-image`（或 `-preview`）改為 `gemini-nano-banana-2.1`
    2. 如果用了 `"imageSize": "512"`，改成 `1K`
    3. 如果你按 tokens 估算成本，重新按上方「每張實際多少錢」的表核一遍

    請求格式、返回結構、多圖編輯和多輪編輯的寫法都不用改。
  </Accordion>

  <Accordion title="Nano Banana 2 會下線嗎？">
    截至 2026 年 10 月 7 日，谷歌沒有公佈 `gemini-3.1-flash-image` 的下線日期，只是把 2.1 列為推薦替代。API易 上的 Nano Banana 2 繼續可用、價格不變。如有變化我們會提前通知。
  </Accordion>

  <Accordion title="為什麼我的賬單比按圖片 tokens 算出來的高？">
    因為 2.1 預設就會思考，每張圖多出約 400–1300 個思考和其它輸出 tokens，與圖片一起按輸出價計費。這部分在返回的 `thoughtsTokenCount` 裡能看到。如果你出 4K 為主，改用按次計費（\$0.045/次）更划算。
  </Accordion>

  <Accordion title="有併發限制嗎？">
    **API 不限制併發**，可以放心自行併發呼叫，請求之間不排隊、不互相阻塞。真正要注意的是 `timeout`：4K 或高峰時單次耗時可能較長（實測 4K 多在 30–50 秒，個別超過 2 分鐘），**建議客戶端超時設到 360 秒**。偶發 429 時，把令牌兜底分組掛上 `NB-Enterprise` 即可。
  </Accordion>

  <Accordion title="輸出圖片有水印嗎？">
    所有輸出圖片都帶有 SynthID 隱形數字水印（Google 的 AI 生成內容標識技術），肉眼不可見，不影響使用。
  </Accordion>
</AccordionGroup>

## 相關文件

* [Nano Banana 2 生圖/編輯](/zh-Hant/api-capabilities/nano-banana-2-image/overview) - 上一代，支援 512px
* [Nano Banana Pro 生圖/編輯](/zh-Hant/api-capabilities/nano-banana-image/overview) - 畫質上限
* [Nano Banana 系列開發指南](/zh-Hant/api-capabilities/nano-banana-dev-guide) - 尺寸控制、輸入圖片要求、URL 傳圖
* [Nano Banana 系列價格](/zh-Hant/api-capabilities/nano-banana-pricing)
* [Gemini 出圖錯誤處理](/zh-Hant/api-capabilities/gemini-image-error-handling)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.