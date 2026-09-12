> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-image-2 官轉 vs 官逆 對比

> gpt-image-2（官方正式版）與官逆姐妹模型 gpt-image-2-all / gpt-image-2-vip 對比：性質、計費、端點、上傳/輸出格式、速度與畫質定位、指令遵循等差異，幫你選對模型。

## 一句話結論

| 你需要                                                                 | 選這個                                      |
| ------------------------------------------------------------------- | ---------------------------------------- |
| **`quality` 畫質引數 / mask 局部重繪 / 任意自定義尺寸（不限 30 檔） / OpenAI 官方完全對齊欄位** | `gpt-image-2`（官轉，按量計費）                   |
| **可預測的統一價（\$0.03/張）+ 出圖快（快就是優勢）**                                   | `gpt-image-2-all`（官逆，ChatGPT 網頁線，\~90s）  |
| **可預測的統一價 + 鎖尺寸（30 檔含 4K）+ 畫質有時更高（不趕時間）**                           | `gpt-image-2-vip`（官逆，Codex 線，\~120–200s） |

三個模型**底層都是 OpenAI gpt-image-2**，差別在通道性質（官方直連 vs 逆向）、計費方式、引數粒度。

<Note>
  **官逆兩兄弟（-all / -vip）**：本頁"官逆"列同時覆蓋 **`gpt-image-2-all`** 與 **`gpt-image-2-vip`**——兩者**呼叫方式一致**（`-vip` 額外支援 `size` 欄位）、同價 \$0.03/張，現在的差異是 **速度 vs 畫質 + 是否鎖尺寸**：

  * `gpt-image-2-all`：ChatGPT 網頁線，**約 90 秒** 出圖——**快就是優勢**
  * `gpt-image-2-vip`：Codex 線，**約 120–200 秒** 出圖，速度慢一些，但**畫質有時更高**，且**支援 `size` 鎖尺寸（30 檔含 4K，2026-07-22 起已恢復）**
  * 共同點：均不支援 `quality`、不支援 `n`、不支援 mask 局部重繪

  需要 `quality` 畫質檔位、mask 局部重繪或 30 檔以外的任意自定義尺寸時，走官轉 `gpt-image-2`。
</Note>

<Tip>
  **關於速度**：當前 `-all` / `-vip` 出圖速度**比剛上線時慢一些**，這是 **OpenAI 官方算力波動** 導致的全鏈路放緩——APIYI 的號池和運維側並無問題，所有逆向通道使用者都會感受到。建議把超時設定在 300 秒以上，複雜場景預留更多。
</Tip>

## 完整對比表

| 維度                   | **gpt-image-2-all / -vip**（官逆，高性價比）                                                                                                                                                | **gpt-image-2**（官轉，正式版）                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **模型名**              | `gpt-image-2-all`（出圖最快） / `gpt-image-2-vip`（畫質優先、可鎖尺寸）                                                                                                                             | `gpt-image-2`                                                                 |
| **通道性質**             | `-all`：逆向 ChatGPT 官網線路<br />`-vip`：逆向 Codex 線路                                                                                                                                     | 官方直連（OpenAI Images API）                                                       |
| **計費方式**             | **按次計費**：固定 \$0.03/次（兩模同價）                                                                                                                                                         | **按量計費**：按 token 實計，官網同價；本站充值加贈後約 **8.5 折**                                   |
| **典型成本/張**           | \$0.03（不區分尺寸 / 畫質 / 模型）                                                                                                                                                            | 實測 **\$0.03 – \$0.2**（與提示詞長度、size、quality 正相關）                                |
| **令牌分組**             | 預設分組（Default）                                                                                                                                                                      | 預設分組（Default）                                                                 |
| **令牌型別**             | **按次計費** 或 **按量優先** 均可                                                                                                                                                             | **僅支援按量優先**（本模型按 token 計費，按次計費令牌不可用）                                          |
| **推薦端點**             | **`/v1/images/generations` + `/v1/images/edits`**（更穩定、上游供給更足，且同套程式碼相容官轉，風控異常時換 `model` 名即可切換）                                                                                      | `/v1/images/generations` + `/v1/images/edits`                                 |
| **上傳圖片格式**           | multipart file（edits 端點）                                                                                                                                                           | multipart file（編輯介面）                                                          |
| **輸出圖片格式**           | `b64_json`（預設，**純 base64 無字首**，2026-07 實測；歷史版本曾帶字首）或 `url`（R2 CDN）                                                                                                                 | `b64_json`（**純 base64，無字首**）                                                  |
| **上傳圖片數（編輯）**        | 多張                                                                                                                                                                                 | **最多 16 張**（`image[]`）                                                        |
| **mask 局部重繪**        | ❌ 不支援                                                                                                                                                                              | ✅ 支援（要求帶 alpha 通道）                                                            |
| **指令遵循**             | 好                                                                                                                                                                                  | **優秀**                                                                        |
| **生成速度**             | `-all`：約 **90 秒**（快就是優勢）<br />`-vip`：約 **120–200 秒**（慢一些，但畫質有時更高）<br />📌 當前比剛上線時慢——OpenAI 官方算力波動所致，非 APIYI 側問題                                                                    | 約 **100-120 秒**，複雜場景 + 4K 可達 3-5 分鐘                                           |
| **畫質傾向**             | `-all`：好<br />`-vip`：**有時更高**（Codex 線，細節表現偶有優勢）                                                                                                                                    | 穩定，且可用 `quality=high` 拉滿                                                      |
| **`size` 引數**        | `-all`：❌ 不接受（寫進 prompt）<br />`-vip`：✅ **已恢復**（2026-07-22 起），支援 30 檔常見尺寸（含 4K）；僅 images 端點生效，chat 端點不支援                                                                             | ✅ 任意合法尺寸                                                                      |
| **`size = auto` 行為** | `-all`：— 不接受 `size` 欄位<br />`-vip`：不顯式傳 `size` 時自適應出圖，要鎖尺寸請顯式傳 30 檔之一                                                                                                              | ✅ 預設值，OpenAI 官方語義"按 prompt 智慧選"；**社群實測偏向 1:1 方形（1024×1024）**，要其它比例請顯式傳 `size` |
| **支援 4K**            | `-all`：❌<br />`-vip`：✅ 4K Detail 檔（如 `3840x2160` / `2880x2880`），不加價                                                                                                                | ✅ 含 `3840×2160`                                                               |
| **常見輸出尺寸**           | `-all`：16:9 → 1672×941、9:16 → 941×1672、1:1 → 1254×1254（自適應）<br />`-vip`：30 檔（10 比例 × 1K/2K/4K），見 [30 檔完整對照表](/zh-Hant/api-capabilities/gpt-image-2-vip/overview#支援的-size30-檔完整對照表) | 8 個預設 + 任意合法自定義尺寸                                                             |
| **畫質引數 `quality`**   | ❌ 兩模均不支援（不要傳）                                                                                                                                                                      | ✅ `low` / `medium` / `high` / `auto`                                          |
| **`n` 引數**           | ❌ 兩模均不支援（單次僅返回 1 張）                                                                                                                                                                | ✅ 支援                                                                          |
| **透明背景**             | ⚠️ 無 `background` 引數，只能在提示詞裡要求，偶現不穩定                                                                                                                                               | ✅ 引數控制穩定 —— `background: "transparent"` + `png` / `webp`                      |
| **中文提示詞**            | ✅ 原生                                                                                                                                                                               | ✅ 原生                                                                          |
| **文字渲染**             | 高還原度                                                                                                                                                                               | 高還原度（`high` 檔位最強）                                                             |
| **API 文件**           | [GPT-Image-2-All 概覽](/zh-Hant/api-capabilities/gpt-image-2-all/overview) / [GPT-Image-2-VIP 概覽](/zh-Hant/api-capabilities/gpt-image-2-vip/overview)                                | [GPT-Image-2 概覽](/zh-Hant/api-capabilities/gpt-image-2/overview)              |

<Info>
  🔑 **如何建立或管理令牌**：[https://api.apiyi.com/token](https://api.apiyi.com/token)\
  在控制台建立令牌時可以選擇分組（`Default` 預設即可）和令牌型別（**按次計費** / **按量優先**）。**呼叫 `gpt-image-2`（官轉）必須使用「按量優先」型別的令牌**，否則會因計費方式不匹配被拒。
</Info>

## 選型場景

### 選 `gpt-image-2-all`（官逆）的場景

<CardGroup cols={2}>
  <Card title="💰 成本可預測" icon="dollar-sign">
    單價穩定 \$0.03/張，無尺寸 / 畫質階梯，**適合大批次生產、成本必須封頂的場景**（資訊圖、營銷物料、電商素材批次）。
  </Card>

  <Card title="⚡ 出圖速度較快" icon="bolt">
    約 90 秒出圖，**比 `-vip` 和官轉都略快**，前端即時互動體驗更好。
  </Card>

  <Card title="🔁 一套程式碼隨時互切" icon="repeat">
    Images API 標準格式，與 `-vip` 和官轉 `gpt-image-2` **同套程式碼**——改個 `model` 名即可互切或兜底。
  </Card>

  <Card title="🌏 中文 + 營銷文字" icon="type">
    中文提示詞原生友好、招牌 / 海報 / 資訊圖文字還原度高，**適合面向中文使用者的內容生產**。
  </Card>
</CardGroup>

### 選 `gpt-image-2-vip`（官逆，畫質優先）的場景

<CardGroup cols={2}>
  <Card title="🎨 畫質有時更高" icon="wand-sparkles">
    Codex 線路的細節表現**偶有優於 `-all`**，適合不趕時間、想在官逆同價裡多要一點畫質的精品圖場景。
  </Card>

  <Card title="⏱️ 用時間換品質" icon="hourglass">
    約 **120–200 秒** 出圖，比 `-all` 慢——接受更長等待、追求出圖上限時選它。
  </Card>

  <Card title="🖼️ 鎖尺寸 / 4K" icon="expand">
    `size` 引數**已恢復**（2026-07-22 起）：支援 30 檔常見尺寸（10 比例 × 1K/2K/4K），電商主圖、海報模板、4K 桌布可嚴格輸出，統一 \$0.03/張、4K 不加價。
  </Card>

  <Card title="🔁 與 -all 共用程式碼" icon="copy">
    呼叫結構與 `-all` 一致（僅多一個 `size` 欄位）——一套程式碼兩個模型來回切，隨時按速度 / 畫質偏好換 `model` 名。
  </Card>
</CardGroup>

<Note>
  `-vip` 的 `size` 僅在 `/v1/images/generations` 與 `/v1/images/edits` 端點生效，**`/v1/chat/completions` 對話端點不支援 `size`**。需要 30 檔以外的任意自定義尺寸、`quality` 畫質檔位或 mask 局部重繪時走官轉 `gpt-image-2`。該引數可用性隨上游變動，最新狀態以 [即時動態](/live) 為準。
</Note>

### 選 `gpt-image-2`（官轉）的場景

<CardGroup cols={2}>
  <Card title="🎚️ 需要畫質檔位" icon="sliders-horizontal">
    `quality` 支援 low/medium/high/auto。**草稿用 low 省成本，終稿 high 出印刷級效果**——這是官轉獨有，官逆兩模都不支援。
  </Card>

  <Card title="🎯 mask 局部重繪" icon="paintbrush">
    支援 alpha 通道蒙版，**精準修改圖片局部區域而保留其餘部分**——官逆兩模都不支援。
  </Card>

  <Card title="🖼️ 任意自定義尺寸" icon="expand">
    `size` 引數接受**任意合法尺寸**（含 4K），不限預設檔位。`-vip` 只支援 30 檔常見尺寸，**30 檔以外的自定義尺寸走官轉**。
  </Card>

  <Card title="🔌 與 OpenAI 官方一致" icon="plug">
    走官方 Images API，欄位與行為完全與官方一致。**已有基於 OpenAI 官方 SDK 的程式碼 / 系統**可零改動遷移，長期更穩。
  </Card>
</CardGroup>

## 關鍵差異詳解

### 1. `b64_json` 格式差異（遷移坑！）

2026-07 實測兩個模型都返回**純 base64（無 `data:` 字首）**，但 `gpt-image-2-all` 歷史版本曾直接帶字首——跨模型 / 跨版本複用程式碼時，統一做字首檢測最穩：

```python theme={null}
# 通用寫法：先檢測字首再處理，gpt-image-2 與 gpt-image-2-all 均適用
b64 = resp["data"][0]["b64_json"]
if b64.startswith("data:"):          # 相容曾出現過的帶字首響應
    b64 = b64.split(",", 1)[1]
with open("out.png", "wb") as f:
    f.write(base64.b64decode(b64))   # ✅ 寫檔案
img_tag = f'<img src="data:image/png;base64,{b64}">'  # ✅ 瀏覽器渲染
```

<Warning>
  從一個切到另一個時，**`b64_json` 處理程式碼必須改**，否則會拿到損壞的 data URL 或 decode 失敗。
</Warning>

### 2. 解析度控制方式

**gpt-image-2-all**（寫在 prompt 裡）：

```
"橫版 16:9 電影畫幅，黃昏時的海邊老燈塔"   → 輸出約 1672×941
"豎版 9:16 手機桌布，賽博朋克城市雨夜"      → 輸出約 941×1672
"1024×1024 方形 LOGO，極簡貓咪線條"          → 輸出約 1254×1254
```

**gpt-image-2-vip**（`size` 已恢復，2026-07-22 起）：

支援 **30 檔常見尺寸**（10 比例 × 1K/2K/4K），請求體直接傳 `size: "寬x高"`（須為 30 檔之一，完整清單見 [30 檔對照表](/zh-Hant/api-capabilities/gpt-image-2-vip/overview#支援的-size30-檔完整對照表)）：

```python theme={null}
client.images.generate(
    model="gpt-image-2-vip",
    prompt="...",
    size="3840x2160"    # ✅ 30 檔之一，僅 images 端點生效（chat 端點不支援）
)
```

**gpt-image-2**（`size` 引數嚴格控制 + `quality` 檔位）：

```python theme={null}
client.images.generate(
    model="gpt-image-2",
    prompt="...",
    size="2048x1152",   # ✅ 精確按此輸出
    quality="high"      # 僅官轉支援
)
```

### 3. 上傳 / 輸出格式差異

| 操作        | gpt-image-2-all                                                                           | gpt-image-2                       |
| --------- | ----------------------------------------------------------------------------------------- | --------------------------------- |
| **上傳參考圖** | multipart `image` 檔案欄位（edits 端點）                                                          | multipart `image[]` 檔案欄位          |
| **下載生成圖** | 預設 `b64_json`（純 base64，2026-07 實測），顯式傳 `response_format: "url"` 得 R2 CDN 連結（**24 小時有效期**） | `b64_json`（**純 base64**，需 decode） |
| **多圖融合**  | edits 端點 `image` 欄位重複傳入多張                                                                 | `image[]` 陣列重複傳入，**最多 16 張**      |

### 4. 價格示例（粗算）

| 場景               | gpt-image-2-all / -vip                       | gpt-image-2                 |
| ---------------- | -------------------------------------------- | --------------------------- |
| 1024×1024 草圖     | \$0.03                                       | \~\$0.006（low）              |
| 1024×1024 中等畫質   | \$0.03                                       | \~\$0.053（medium）           |
| 1024×1024 高畫質    | \$0.03                                       | \~\$0.211（high）             |
| 2048×1152 高畫質    | \$0.03                                       | \~\$0.20+（按 token 實計）       |
| 3840×2160 4K 高畫質 | \$0.03（`-vip` 4K Detail 檔，不加價；`-all` 不支援 4K） | 按 token 實計，**顯著高於 1K**      |
| 編輯 / 多圖融合        | \$0.03                                       | 輸入 token 顯著上升，單次成本可達 \$0.1+ |

<Info>
  **結論**：批次、低畫質場景用官逆不一定省（草圖 1K low 在官轉上反而更便宜）；**中-高畫質區段**是官逆 \$0.03 的甜點區。**需要 `quality` 檔位 / mask 局部重繪 / 鎖尺寸、4K / OpenAI 官方完全對齊欄位** 時選官轉（按量計費）。
</Info>

## 客戶端呼叫建議

| 設定項         | gpt-image-2-all / -vip                                        | gpt-image-2                  |
| ----------- | ------------------------------------------------------------- | ---------------------------- |
| **超時（保守值）** | `-all`：**300 秒**（典型 \~90s）<br />`-vip`：**300 秒**（典型 120–200s） | **360 秒**（4K 高畫質實測可達 3-5 分鐘） |
| **重試策略**    | 5xx 與超時指數退避 2 次                                               | 同左                           |
| **併發**      | 單次僅返回 1 張，多張請併發                                               | 單次 1 張，需要多張請併發               |
| **請求 ID**   | `request-id` 響應頭                                              | `x-request-id` 響應頭           |

<Tip>
  **三個模型通用：圖生圖 / 多圖融合時，單張輸入圖先壓到 1.5MB 以內**（JPEG 品質 80-90 / 解析度適當下調）。偶發的 `shell_api_error` / `Unknown error` 大多就是圖片體積過大觸發的，壓一下請求成功率和出圖速度都會明顯改善。**輸出解析度與輸入圖體積無關**——畫質看輸出端配置（官轉看 `size` + `quality`；`-vip` 看 `size` 檔位；`-all` 看 prompt 畫幅描述），不看輸入端體積。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="輸入圖要壓縮嗎？提示詞裡寫 4K / 8K 有用嗎？">
    **強烈建議壓**。三個模型上傳給介面的圖都先壓到 **1.5MB 以內**（JPEG 品質 80-90 / 解析度適當下調）：偶發的 `shell_api_error` / `Unknown error` 大多就是圖片體積過大觸發的，壓一下請求成功率和出圖速度都會明顯改善。

    **別擔心壓輸入會損畫質**——輸出解析度與輸入圖體積無關，三個模型的"輸出端"控制方式不同：

    * `gpt-image-2-all`：用 prompt 的畫幅描述控制（參見 [-all 概覽頁的「經過驗證的『提示詞 → 實際解析度』對照表」](/zh-Hant/api-capabilities/gpt-image-2-all/overview)），prompt 光寫 `4K` / `8K` 不算數
    * `gpt-image-2-vip`：用 `size` 欄位控制（30 檔常見尺寸，含 4K；已於 2026-07-22 恢復），prompt 光寫 `4K` / `8K` 同樣不算數
    * `gpt-image-2`：用 `size` + `quality` 欄位控制（任意合法尺寸）

    總結：壓輸入只會提速，不會損畫質——畫質看輸出端配置，不看輸入端體積。
  </Accordion>

  <Accordion title="同一個 API Key 三個模型都能用嗎？">
    可以。三者都走預設分組（Default），同一個 API Key 同時呼叫即可，無需額外配置。注意：呼叫 `gpt-image-2`（官轉）需要「按量優先」型別的令牌；`-all` / `-vip` 兩種令牌型別都能用。
  </Accordion>

  <Accordion title="官逆推薦用哪些端點？">
    **統一使用 OpenAI Images API**（`/v1/images/generations` 文生圖 + `/v1/images/edits` 圖片編輯），理由有二：

    1. **更穩定**：上游對 Images API 通道的資源供給更充足，呼叫成功率更高
    2. **相容官轉，便於切換**：與官轉 `gpt-image-2` 呼叫方式、引數格式完全相容——官逆通道遇到風控異常時，**只需更換 `model` 名即可切到官轉**，業務程式碼零改動

    另有對話式端點（`/v1/chat/completions`，**不主推**），僅適合多輪迭代改圖、直接傳線上圖片 URL 的場景；注意出圖意圖不夠明確時可能返回純文字而不是圖片（可在提示詞開頭加「生成圖片：」字首強化）。詳細引數見 [-all 對話式呼叫說明](/api-capabilities/gpt-image-2-all/chat-completions) / [-vip 對話式呼叫說明](/api-capabilities/gpt-image-2-vip/chat-completions)。
  </Accordion>

  <Accordion title="官逆裡 -all 和 -vip 怎麼挑？">
    兩者都是逆向通道、同價 \$0.03/張、**呼叫方式一致**（`-vip` 額外支援 `size` 欄位鎖尺寸），差異是**速度 vs 畫質 + 是否鎖尺寸**：

    * **出圖速度**：`-all` 約 90 秒——**快就是優勢**；`-vip` 約 120–200 秒。當前比剛上線時慢，源自 OpenAI 官方算力波動
    * **畫質**：`-vip`（Codex 線）細節表現**有時更高**，適合不趕時間的精品圖
    * **鎖尺寸**：`-vip` 支援 30 檔 `size`（含 4K）；`-all` 不接受 `size`，畫幅寫進 prompt

    決策：追求出圖速度 → `-all`；畫質優先或要鎖尺寸 / 4K → `-vip`；要 30 檔以外的自定義尺寸、`quality` 檔位或 mask → 官轉 `gpt-image-2`。詳見 [GPT-Image-2-VIP 概覽](/zh-Hant/api-capabilities/gpt-image-2-vip/overview)。
  </Accordion>

  <Accordion title="要鎖尺寸 / 4K，現在怎麼辦？">
    首選 `gpt-image-2-vip`：`size` 引數已於 2026-07-22 恢復，支援 **30 檔常見尺寸（10 比例 × 1K/2K/4K）**，統一 \$0.03/張、4K 不加價。注意 `size` 僅在 images 端點生效，且須為 30 檔之一。

    需要 **30 檔以外的任意合法尺寸**、**`quality` 檔位**（low/medium/high/auto）、**mask 局部重繪**（alpha 通道蒙版）或 **OpenAI 官方完全對齊欄位**（已有官方 SDK 程式碼零改動遷移）時，走官轉 `gpt-image-2`（按量計費、按 token 實計）。
  </Accordion>

  <Accordion title="想從 1.5 遷移，應該選哪個？">
    * **沿用官方 SDK / 要求與 OpenAI 官方一致，或要 30 檔以外的任意自定義尺寸**：選 `gpt-image-2`（官轉），需要刪掉 `input_fidelity`，其它欄位不動（`background: transparent` 照常可用）
    * **想順便降低成本，追求出圖速度**：選 `gpt-image-2-all`（官逆，\~90s）
    * **想順便降低成本，畫質優先或要鎖尺寸 / 4K**：選 `gpt-image-2-vip`（官逆，\~120–200s，30 檔 `size` 含 4K）
  </Accordion>

  <Accordion title="可以同時部署多個做兜底嗎？">
    可以。常見做法：**主用 `-all` 或 `-vip`**（成本可預測，按速度 / 畫質偏好選），**兜底用 `gpt-image-2`**（需要 `quality` 檔位 / mask / 30 檔以外自定義尺寸時切過去）。官轉和官逆兩類模型響應欄位不同，業務層做一次格式歸一即可。
  </Accordion>

  <Accordion title="圖片下載連結（R2 CDN）很慢怎麼辦？">
    詳見 [下載 CDN 圖片/影片很慢怎麼辦？](/zh-Hant/faq/cdn-download-slow)
  </Accordion>
</AccordionGroup>

## 相關文件

* [GPT-Image-2 概覽](/zh-Hant/api-capabilities/gpt-image-2/overview) - 官轉完整接入文件
* [GPT-Image-2-All 概覽](/zh-Hant/api-capabilities/gpt-image-2-all/overview) - 官逆 ChatGPT 網頁線（出圖最快）完整接入文件
* [GPT-Image-2-VIP 概覽](/zh-Hant/api-capabilities/gpt-image-2-vip/overview) - 官逆 Codex 線（畫質有時更高、支援 `size` 鎖尺寸）完整接入文件
* [深度解讀：gpt-image-2 上線](/news/gpt-image-2-launch) - 官轉上線說明
* [深度解讀：gpt-image-2-all 上線](/news/gpt-image-2-all-launch) - 官逆上線說明
* [社群貢獻：Luck GPT-Image 2 ComfyUI 節點](/zh-Hant/scenarios/ecosystem/luckgpt2-comfyui) - 多模型合一的 ComfyUI 節點包
* [社群貢獻：APIYI GPT-Image 2 Skills](/zh-Hant/scenarios/ecosystem/apiyi-gpt-image-skills) - 多模型合一的 AI Agent Skill 包
* [充值優惠活動](/zh-Hant/faq/recharge-promotions) - 充值加贈政策
