> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck GPT-Image 2 - ComfyUI 節點

> 社群貢獻的 ComfyUI 節點包：三個出圖節點覆蓋官轉 gpt-image-2 / gpt-image-2.5-flare / gpt-image-2.5-sunburst 與官逆 gpt-image-2-all / gpt-image-2-vip，外加三個提示詞控制節點。2026-09-10 起支援 GPT-Image 2.5 六檔畫質、16 張參考圖、mask 局部重繪與自定義解析度。

## 概述

`Comfyui-Luck-gpt2.0` 是社群使用者 luckdvr 貢獻的 ComfyUI 自定義節點包，在 ComfyUI 中一鍵呼叫 API易 的 GPT 影像模型。當前包含 **三個出圖節點** 與 **三個提示詞控制節點**：

* **`Comfyui-Luck gpt-image-2`**（官轉）：模型下拉可選 `gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`，真正傳 `size` / `quality`，支援 mask 局部重繪與最多 16 張參考圖
* **`Comfyui-Luck gpt-2.0 all`**（官逆）：呼叫 `gpt-image-2-all`，按次計費、出圖快、對話式改圖
* **`Comfyui-Luck gpt-image-2-vip`**（官逆）：呼叫 `gpt-image-2-vip`，按次計費，Adobe 線路
* **提示詞控制節點**：`GPT-Image-2 文生圖提示詞控制器` / `圖生圖提示詞控制器` / `文本停留編輯器`，用多模態模型把需求整理成結構化出圖提示詞，並支援在工作流中途暫停手改

<Info>
  **2026-09-10 更新：支援 GPT-Image 2.5**。官轉節點新增 `gpt-image-2.5-flare`（速度優先）與 `gpt-image-2.5-sunburst`（畫質與編輯精度優先），`quality` 擴到六檔（新增 `xhigh` / `max`）。節點名稱、ID、控制元件順序與預設模型 `gpt-image-2` 都沒變，**已有工作流不會自動切換模型或畫質**，更新外掛後在 `model (模型)` 下拉里手動選即可。詳見下方「GPT-Image 2.5 在節點裡怎麼用」。
</Info>

<Info>
  **專案資訊**

  * 🔗 開源地址：`github.com/luckdvr/Comfyui-Luck-gpt2.0`
  * 📜 許可證：Apache-2.0
  * 👤 作者：luckdvr
  * ⭐ 該專案由社群使用者貢獻，專為 API易 適配；介面行為變化或節點報錯請優先到倉庫 Issues 反饋
</Info>

<Tip>
  **同一作者的兩套節點如何區分？**

  luckdvr 為 API易 貢獻了兩套 ComfyUI 節點：

  * **[Luck Nano Banana Pro](/zh-Hant/scenarios/ecosystem/lucknanobananapro-comfyui)**：呼叫 Gemini 系列（`gemini-3-pro-image-preview` / `gemini-3.1-flash-image-preview`），強調 14 張參考圖與工程化超時重試
  * **Luck GPT-Image 2（本頁）**：呼叫 OpenAI 系列（`gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2-all` / `gpt-image-2-vip`），強調真實 `size` / `quality` 控制、mask 重繪與提示詞控制器
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="三節點三路線" icon="layers">
    官轉 `gpt-image-2`、官逆 `gpt-2.0 all`、官逆 `gpt-image-2-vip` 各管一路，按預算與需求自由選擇
  </Card>

  <Card title="GPT-Image 2.5 雙子模型" icon="sparkles">
    官轉節點下拉切換 `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`，另提供 `-2026-09-08` 日期快照用於鎖定版本
  </Card>

  <Card title="六檔畫質" icon="sliders-horizontal">
    `quality` 可選 auto / low / medium / high / xhigh / max，其中 `xhigh` / `max` 僅 2.5 兩款接受
  </Card>

  <Card title="最多 16 張參考圖" icon="images">
    官轉節點 `image_01` … `image_16`；官逆兩節點最多 14 張，滿足多圖融合與風格遷移
  </Card>

  <Card title="Mask 局部重繪" icon="eraser">
    官轉節點支援可選 `mask` 輸入，精準圈定重繪區域（透明區域重繪、不透明區域保留）
  </Card>

  <Card title="真實解析度 + 自定義尺寸" icon="image">
    auto / 1K / 2K / 4K 預設 + 自定義尺寸（單邊最大 3840px，畫素數 65.5 萬–829.4 萬）
  </Card>

  <Card title="提示詞控制器" icon="wand-sparkles">
    預設用 `gemini-3.5-flash` 把文字需求或最多 5 張參考圖整理成結構化出圖提示詞，可在中途暫停手改
  </Card>

  <Card title="超時重試內建" icon="refresh-cw">
    官轉節點預設 600 秒超時；`408` / `429` / `5xx` 按 `retry_times` 自動重試，應對高峰期抖動
  </Card>
</CardGroup>

## 支援的 API易 模型

| 模型名稱                       | 模型標識                                       | 對應節點                           | 用途                          | API 文件                                                     |
| -------------------------- | ------------------------------------------ | ------------------------------ | --------------------------- | ---------------------------------------------------------- |
| GPT-Image 2.5 Flare（官轉）    | `gpt-image-2.5-flare`（快照 `-2026-09-08`）    | `Comfyui-Luck gpt-image-2`     | 速度優先的文生圖，六檔畫質，16 參考圖 + mask | [檢視文件](/zh-Hant/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2.5 Sunburst（官轉） | `gpt-image-2.5-sunburst`（快照 `-2026-09-08`） | `Comfyui-Luck gpt-image-2`     | 畫質與編輯精度優先，改圖、多圖融合首選         | [檢視文件](/zh-Hant/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2（官轉）            | `gpt-image-2`                              | `Comfyui-Luck gpt-image-2`     | 上一代官轉，四檔畫質，節點預設值            | [檢視文件](/zh-Hant/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All（官逆）        | `gpt-image-2-all`                          | `Comfyui-Luck gpt-2.0 all`     | ChatGPT 網頁線，按次計費，約 30–60 秒  | [檢視文件](/zh-Hant/api-capabilities/gpt-image-2-all/overview) |
| GPT-Image 2 VIP（官逆）        | `gpt-image-2-vip`                          | `Comfyui-Luck gpt-image-2-vip` | Adobe 線路，按次計費，約 90–150 秒    | [檢視文件](/zh-Hant/api-capabilities/gpt-image-2-vip/overview) |

<Info>
  三款官轉模型**同價同參數**，按 token 計費；兩款官逆均為 **\$0.03 / 張** 按次計費。官轉與官逆的完整差異見 [gpt-image-2.5 / 2 官轉 vs 官逆 對比文件](/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all)。
</Info>

## GPT-Image 2.5 在節點裡怎麼用

更新外掛並完全重啟 ComfyUI 後，在 `Comfyui-Luck gpt-image-2` 節點的 `model (模型)` 下拉框切換即可，其餘控制元件不變。兩款 2.5 都支援文生圖、圖片編輯、16 張參考圖和 mask；節點按 `mode` 與是否接入參考圖自動選擇文生圖或圖片編輯介面。

| 模型                              | `quality` 可選值                                        | 定位                    |
| ------------------------------- | ---------------------------------------------------- | --------------------- |
| `gpt-image-2`                   | `auto` / `low` / `medium` / `high`                   | 上一代，節點預設值             |
| `gpt-image-2.5-flare`（含日期快照）    | `auto` / `low` / `medium` / `high` / `xhigh` / `max` | 速度優先，文生圖預設選它          |
| `gpt-image-2.5-sunburst`（含日期快照） | `auto` / `low` / `medium` / `high` / `xhigh` / `max` | 畫質與編輯精度優先，改圖 / 多圖融合選它 |

<Warning>
  **從 `gpt-image-2` 切到 2.5 時不要原樣照搬 `quality`。** 按 API易 2026-09-09 同尺寸實測的輸出 token 量，2.5 的 `high` 對應舊版 `medium`，2.5 的 `max` 才對應舊版 `high`——這是 token 預算的對應關係，不是逐畫素畫質相同的保證。想要與舊 `high` 同等預算的畫質，2.5 要選 `max`；同預算下 2.5 的 `high` / `xhigh` 則多了兩個更便宜的中間檔。
</Warning>

幾條節點層面的行為，寫工作流前先知道：

* **不會靜默降檔**：舊模型 `gpt-image-2` 選了 `xhigh` / `max`，或傳入無效模型 / 畫質，節點會在傳送請求前直接報錯，不會替你換檔跑
* **`auto` 建議少用**：`auto` 是動態推理檔，同一條提示詞的費用與耗時會在檔位間漂移；要控成本就顯式選檔
* **生產鎖日期快照**：下拉里的 `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08` 用於固定模型版本，別名指向變化時不會被動跟著變
* **超時保留 600 秒**：2.5 的 `xhigh` / `max`、2K / 4K 或複雜編輯建議保留預設值，必要時調高。同步請求在客戶端超時後仍可能計費，自動重試可能產生額外費用；不希望自動重試就把 `retry_times` 設為 `1`

## 節點引數

### `Comfyui-Luck gpt-image-2`（官轉）

節點面板上的控制元件名帶中文標籤，如 `api_key (API金鑰)`，下表只列英文欄位名。

| 引數名                     | 型別     | 必填 | 預設值                | 說明                                                                                                                                        |
| ----------------------- | ------ | -- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `api_key`               | string | 是  | -                  | API易 令牌，建議單獨建立帶用量上限的專用 Key                                                                                                                |
| `prompt`                | string | 是  | -                  | 生成或編輯的文本指令                                                                                                                                |
| `mode`                  | enum   | 是  | `AUTO`             | `AUTO` / `text2img` / `img2img`；`AUTO` 按有無參考圖自動判斷                                                                                         |
| `model`                 | enum   | 是  | `gpt-image-2`      | `gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08` |
| `api_base`              | enum   | 是  | `api.apiyi.com/v1` | 介面域名，見「安裝配置」第四步                                                                                                                           |
| `image_size`            | enum   | 是  | `2K`               | `auto (不傳size)` / `1K` / `2K` / `4K` / `custom (自定義)`                                                                                     |
| `aspect_ratio`          | enum   | 是  | `16:9`             | 20 種：AUTO、1:4、4:1、1:8、8:1、1:1、1:2、2:1、1:3、3:1、2:3、3:2、3:4、4:3、4:5、5:4、9:16、16:9、9:21、21:9                                                 |
| `custom_size`           | string | 否  | `1600x1200`        | 僅 `image_size` 選 `custom` 時生效，格式 `寬x高`                                                                                                    |
| `quality`               | enum   | 是  | `auto`             | `auto` / `low` / `medium` / `high` / `xhigh` / `max`；後兩檔僅 2.5                                                                             |
| `output_format`         | enum   | 是  | `png`              | `png` / `jpeg` / `webp`                                                                                                                   |
| `output_compression`    | int    | 是  | 85                 | 0–100，僅對 jpeg / webp 生效                                                                                                                   |
| `seed`                  | int    | 是  | 0                  | 僅 ComfyUI 本地控制（觸發重跑），**不會發給 API**                                                                                                         |
| `timeout_seconds`       | int    | 是  | 600                | 讀取超時，範圍 60–1800；連線超時固定 30 秒                                                                                                               |
| `retry_times`           | int    | 是  | 3                  | 範圍 1–10；`408` / `429` / `5xx` 自動重試                                                                                                        |
| `image_01` … `image_16` | IMAGE  | 否  | -                  | 參考圖輸入，最多 16 張                                                                                                                             |
| `mask`                  | MASK   | 否  | -                  | 局部重繪蒙版，必須與 `image_01` 一起用；ComfyUI 裡 mask 值為 1 的區域即重繪區                                                                                     |

`custom_size` 的四條約束：單邊不超過 3840px、寬高都是 16 的倍數、長邊 / 短邊不超過 3:1、總畫素在 655,360 到 8,294,400 之間。`1:4` / `4:1` / `1:8` / `8:1` 這幾個比例超出官方 3:1 限制，節點會自動收斂到最接近的合法邊界尺寸；`4K + 1:1` 用的是 `2880x2880` 而非 `3840x3840`，因為後者超總畫素上限。

<Note>
  節點不傳送 `background` / `moderation` / `response_format` / `input_fidelity` 這幾個欄位，全部走 API 預設值。需要透明背景等能力時請直接呼叫 API，見 [透明背景 FAQ](/zh-Hant/faq/image-transparent-background)。
</Note>

### `Comfyui-Luck gpt-2.0 all`（官逆）

| 引數名                     | 型別     | 必填 | 預設值                | 說明                                                                                              |
| ----------------------- | ------ | -- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `api_key`               | string | 是  | -                  | API易 令牌                                                                                         |
| `prompt`                | string | 是  | -                  | 對話式生圖 / 改圖指令                                                                                    |
| `mode`                  | enum   | 是  | `AUTO`             | `AUTO` / `text2img` / `img2img`                                                                 |
| `model`                 | enum   | 是  | `gpt-image-2-all`  | 固定一項                                                                                            |
| `api_base`              | enum   | 是  | `api.apiyi.com/v1` | 介面域名                                                                                            |
| `endpoint`              | enum   | 是  | `images_api`       | `images_api`（`/v1/images/generations` 或 `/v1/images/edits`）/ `chat_completions`（對話式或線上 URL 參考圖） |
| `aspect_ratio`          | enum   | 是  | `AUTO`             | 22 種（比官轉多 `2:5` / `5:2`）。**只作為 prompt 字首寫進提示詞**，不是硬尺寸控制                                         |
| `response_format`       | enum   | 是  | `url`              | `url` / `b64_json`，僅 `images_api` 端點發送                                                          |
| `seed`                  | int    | 是  | 0                  | 僅本地控制，不發給 API                                                                                   |
| `timeout_seconds`       | int    | 是  | 300                | 範圍 30–1200                                                                                      |
| `retry_times`           | int    | 是  | 3                  | 範圍 1–10                                                                                         |
| `image_01` … `image_14` | IMAGE  | 否  | -                  | 參考圖，最多 14 張                                                                                     |

`gpt-image-2-all` 不接受 `size` / `quality` / `n` / `aspect_ratio` 這些 API 欄位，節點不會發送它們；2K / 4K 只能作為 prompt 描述，無法保證輸出畫素。`url` 輸出通常是臨時 CDN 連結，約 1 天有效，需要長期儲存請儘快轉存。

### `Comfyui-Luck gpt-image-2-vip`（官逆）

控制元件與 `gpt-2.0 all` 基本一致，多兩個尺寸控制元件：

| 引數名            | 型別   | 必填 | 預設值               | 說明                                                                                                                                                                       |
| -------------- | ---- | -- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`        | enum | 是  | `gpt-image-2-vip` | 固定一項                                                                                                                                                                     |
| `image_size`   | enum | 是  | `2K Recommended`  | `1K Fast` / `2K Recommended` / `4K Detail`，**當前只作介面提示與舊工作流相容，節點不傳送 `size`**                                                                                              |
| `aspect_ratio` | enum | 是  | `16:9`            | 10 種：1:1、2:3、3:2、3:4、4:3、4:5、5:4、9:16、16:9、21:9，只作 prompt 字首兜底                                                                                                           |
| 其餘             | -    | -  | -                 | `api_key` / `prompt` / `mode` / `api_base` / `endpoint` / `response_format` / `seed` / `timeout_seconds`（300）/ `retry_times`（3）/ `image_01` … `image_14`，同 `gpt-2.0 all` |

<Note>
  作者按 API易 2026-06-23 的「`size` 失效」公告實現了這個節點，所以預設不傳送 `size`。API易 側 `gpt-image-2-vip` 的 `size` 已於 2026-07-22 恢復（30 檔常見尺寸，見 [gpt-image-2-vip 文件](/zh-Hant/api-capabilities/gpt-image-2-vip/overview)），外掛尚未跟進。當前要在 ComfyUI 裡真實鎖定尺寸，請用官轉節點 `Comfyui-Luck gpt-image-2`。官逆 `b64_json` 帶 `data:image/png;base64,` 字首，節點會自動相容解碼。
</Note>

### 提示詞控制節點

| 節點                      | 預設模型               | 作用                                                                                         |
| ----------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `GPT-Image-2 文生圖提示詞控制器` | `gemini-3.5-flash` | 把文字需求整理成更適合 GPT-Image 系列的結構化生圖提示詞                                                          |
| `圖生圖提示詞控制器`             | `gemini-3.5-flash` | 讀取最多 5 張參考圖（`reference_image_01` 必填，`02`–`05` 可選）和可選 `subject_image` 主體圖，生成帶風格、構圖、版式約束的提示詞 |
| `文本停留編輯器`               | -                  | 工作流執行到此暫停，手動編輯文本後點節點上的 `Continue` 繼續                                                       |

* 兩個控制器走 API易 `POST /v1/chat/completions`，模型下拉可選 `gemini-3.5-flash` / `gpt-5.5` / `gpt-4o` / `gpt-4.1-mini` / `gemini-2.5-flash` / `gemini-2.5-pro`
* `圖生圖提示詞控制器` 只做影像理解與提示詞增強；要真正多圖參考 / 融合，同一批圖還要接到後面的出圖節點
* `文本停留編輯器` 的 `edited_text` 是單條字串，接普通出圖節點的 `prompt`；`edited_texts` 是列表輸出，留給批次文本工作流。暫停後**點節點上的 `Continue`**，不要再點主執行按鈕，否則 ComfyUI 會重新排隊並重跑上游的提示詞增強

## 安裝配置

<Steps>
  <Step title="第一步：克隆到 custom_nodes">
    進入 ComfyUI 安裝目錄：

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-Luck-gpt2.0.git
    ```

    已安裝過的使用者在該目錄 `git pull` 即可拿到 2.5 支援。
  </Step>

  <Step title="第二步：安裝依賴">
    ```bash theme={null}
    cd Comfyui-Luck-gpt2.0
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="第三步：完全重啟 ComfyUI">
    在節點搜尋欄輸入 `Comfyui-Luck` 即可看到三個出圖節點與三個提示詞節點。只重新整理前端不夠，更新外掛後必須重啟程序。
  </Step>

  <Step title="第四步：配置 API易 金鑰與域名">
    * 訪問 [API易控制台](https://www.apiyi.com) →【令牌】新建金鑰（建議配用量上限）
    * 貼上到節點的 `api_key` 引數
    * `api_base` 三選一：`https://api.apiyi.com/v1`（主域名）/ `https://b.apiyi.com/v1`（國內備用）/ `https://vip.apiyi.com/v1`（海外直連）。節點底層相容帶或不帶 `/v1` 的寫法
  </Step>

  <Step title="第五步：匯入示例工作流">
    倉庫內有兩份示例：

    * `example_workflow.json`：三個出圖節點各一個示例（官轉示例用 `size=2048x1152` + `quality=high` + `jpeg`），附中文 Note 說明怎麼選
    * `example_workflow_gpt_image_2_5.json`：獨立的 2.5 示例，Flare 文生圖 → Sunburst 編輯 → 預覽，預設 `1K + 1:1`、`quality=high`、超時 600 秒、`retry_times=1`

    示例裡的 API Key 為空，填上即可執行；分享自己的工作流前記得清空 Key。
  </Step>
</Steps>

## 使用示例

### 示例 1：2.5 Flare 4K 高畫質文生圖

```
節點: Comfyui-Luck gpt-image-2
model: gpt-image-2.5-flare
prompt: "Cinematic portrait of a samurai in a misty bamboo forest, volumetric light, 85mm lens, photorealistic"
image_size: 4K
aspect_ratio: 2:3
quality: max
output_format: png
```

`max` 是 2.5 裡與舊版 `gpt-image-2` `high` 同等 token 預算的檔位；想更快更省可先用 `high` 或 `xhigh` 試。

### 示例 2：2.5 Sunburst mask 局部重繪

```
節點: Comfyui-Luck gpt-image-2
model: gpt-image-2.5-sunburst
mode: img2img
image_01: 原始照片
mask: 要替換的區域
prompt: "replace the sky with dramatic sunset clouds, keep everything else intact"
image_size: 2K
quality: high
```

### 示例 3：Flare 文生圖 → Sunburst 編輯串聯

對應倉庫裡的 `example_workflow_gpt_image_2_5.json`：

```
[Comfyui-Luck gpt-image-2 · gpt-image-2.5-flare]
  prompt: "product shot of a matte black ceramic mug on a walnut table, soft window light"
  image_size: 1K · aspect_ratio: 1:1 · quality: high
  image ─────────────────────────────┐
                                      ▼
[Comfyui-Luck gpt-image-2 · gpt-image-2.5-sunburst]
  mode: img2img · image_01: ← 上一節點輸出
  prompt: "add a thin gold rim to the mug, keep lighting and background unchanged"
  quality: high
  image ──▶ PreviewImage
```

### 示例 4：官逆對話式出圖

```
節點: Comfyui-Luck gpt-2.0 all
endpoint: images_api
aspect_ratio: 9:16
prompt: "一位穿漢服的少女站在櫻花樹下，水彩畫風格，柔和光線"
response_format: url
timeout_seconds: 300
retry_times: 3
```

### 示例 5：提示詞控制器 → 暫停手改 → 出圖

```
5 張參考圖
  ├─ 接到 圖生圖提示詞控制器 reference_image_01 ~ reference_image_05
  └─ 同時接到 Comfyui-Luck gpt-image-2 image_01 ~ image_05

圖生圖提示詞控制器 optimized_prompt
  └─ 接到 文本停留編輯器 text_list

文本停留編輯器 edited_text
  └─ 接到 Comfyui-Luck gpt-image-2 prompt（model 選 gpt-image-2.5-sunburst）
```

對最終的 `PreviewImage` / `SaveImage` 發起佇列執行，流程停在 `文本停留編輯器` 時改好文本，點節點上的 `Continue` 繼續。若其中一張是必須鎖定的主體圖，額外接到控制器的 `subject_image`，並放到出圖節點的 `image_01`。

## 常見問題

<AccordionGroup>
  <Accordion title="三個出圖節點如何選？">
    * **`Comfyui-Luck gpt-image-2`（官轉）**：真實 `size` / `quality`、原生 mask、最多 16 張參考圖、按 token 計費——有明確尺寸要求、要局部重繪或要 2.5 六檔畫質的工作流選它；文生圖預設 `gpt-image-2.5-flare`，改圖選 `gpt-image-2.5-sunburst`
    * **`Comfyui-Luck gpt-2.0 all`（官逆）**：按次計費（\$0.03 / 張）、約 30–60 秒、ChatGPT 網頁線——多輪改圖、文字還原要求高、不需要硬控尺寸的場景
    * **`Comfyui-Luck gpt-image-2-vip`（官逆）**：按次計費（\$0.03 / 張）、約 90–150 秒、Adobe 線路——作為官逆的第二條線路備用；外掛當前不發 `size`
    * 完整差異看 [官轉 vs 官逆 對比文件](/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="更新外掛後，已有工作流會自動切到 2.5 嗎？">
    不會。節點名稱、ID、控制元件順序和預設模型 `gpt-image-2` 都保持不變，舊工作流載入後仍跑 `gpt-image-2` 與原來的畫質。要用 2.5 請在 `model (模型)` 下拉里手動切換，並按上方對照表重新選 `quality`。
  </Accordion>

  <Accordion title="切到 2.5 後同樣選 high，為什麼更便宜、也更糊了？">
    2.5 重新劃分了畫質檔位：按 API易 2026-09-09 同尺寸實測，2.5 的 `high` 輸出 token 只有 `gpt-image-2` `high` 的約四分之一，對應舊版 `medium`；要拿到與舊 `high` 同等預算的畫質，2.5 要選 `max`。反過來，同預算下 2.5 多了 `high` / `xhigh` 兩個更便宜的中間檔。上生產前用自己的提示詞各跑一輪，比對 `usage.output_tokens` 再定檔。
  </Accordion>

  <Accordion title="外掛支援 gpt-image-2.5-all / gpt-image-2.5-vip 嗎？">
    官逆兩個節點的模型下拉當前只有 `gpt-image-2-all` 與 `gpt-image-2-vip`。其中 `gpt-image-2-all` 的來源 ChatGPT 網頁版已整體升級到 Images 2.5，所以它現在出的就是 2.5 的圖，與 `gpt-image-2.5-all` 同價同行為，見 [gpt-image-2.5-all 文件](/zh-Hant/api-capabilities/gpt-image-2-all/overview)。`gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` 暫未進節點下拉，需要的話直接呼叫 API。
  </Accordion>

  <Accordion title="節點找不到？">
    1. 確認目錄 `ComfyUI/custom_nodes/Comfyui-Luck-gpt2.0` 存在
    2. `pip install -r requirements.txt` 無報錯
    3. 完全重啟 ComfyUI（只重新整理前端不夠）
  </Accordion>

  <Accordion title="4K、xhigh / max 或自定義解析度經常超時？">
    * 官轉節點預設 600 秒讀取超時，2.5 的 `xhigh` / `max` 與 2K / 4K 建議保留或調高；`408 Timeout` 通常是原廠生成任務超時，不是節點引數填錯
    * 同步請求在客戶端超時後仍可能計費，自動重試可能產生額外費用；不想自動重試把 `retry_times` 設為 `1`
    * 伺服器網路慢可參考 [下載 CDN 圖片/影片很慢怎麼辦](/zh-Hant/faq/cdn-download-slow)
    * 預設域名不穩時切換 `api_base` 到 `b.apiyi.com/v1` / `vip.apiyi.com/v1`
  </Accordion>

  <Accordion title="載入舊工作流報 Value 3 smaller than min of 30？">
    舊工作流的 widget 順序與當前節點不匹配，`retry_times=3` 被錯讀成了 `timeout_seconds=3`。使用當前倉庫的 `example_workflow.json`，或刪掉節點重新新增即可。
  </Accordion>

  <Accordion title="接入文本停留編輯器後，gpt-image-2 節點報 Value not in list？">
    把 `prompt` 轉成輸入口後，舊工作流少了一個 prompt 佔位，後面的控制元件整體前移（例如 `mode` 被讀成 `gpt-image-2`、`api_base` 被讀成 `2K`）。當前版本節點會在校驗階段放行並在執行時自動恢復錯位引數；若介面上仍顯示錯位，過載當前工作流或重新新增 `Comfyui-Luck gpt-image-2` 節點即可。
  </Accordion>

  <Accordion title="官逆節點返回的 b64_json 帶字首？">
    官逆 `gpt-image-2-all` / `gpt-image-2-vip` 的 `b64_json` 欄位會帶 `data:image/png;base64,` 字首，官轉 `gpt-image-2` 系列不帶。三個節點都會自動相容解碼，直接接 `PreviewImage` 即可。詳細說明見 [官轉 vs 官逆 對比文件](/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all)。
  </Accordion>

  <Accordion title="呼叫返回 401 / 403？">
    1. 檢查 `api_key` 是否正確，是否被分組限制誤攔
    2. 所選模型是否在令牌的白名單內
    3. 餘額問題參考 [為什麼還有餘額跑不通](/zh-Hant/faq/balance-insufficient)
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="gpt-image-2.5 / 2（官轉）文件" icon="book" href="/zh-Hant/api-capabilities/gpt-image-2/overview">
    flare / sunburst / gpt-image-2 三款同價同參數，原生 2K/4K，按 token 計費
  </Card>

  <Card title="GPT-image-2.5 上線解讀" icon="newspaper" href="/news/gpt-image-2-5-launch">
    Flare 更快、Sunburst 更準，六檔畫質與遷移建議
  </Card>

  <Card title="gpt-image-2-all（官逆）文件" icon="book" href="/zh-Hant/api-capabilities/gpt-image-2-all/overview">
    ChatGPT 網頁線，\$0.03 / 張按次計費
  </Card>

  <Card title="gpt-image-2-vip（官逆）文件" icon="book" href="/zh-Hant/api-capabilities/gpt-image-2-vip/overview">
    Adobe 線路，\$0.03 / 張，支援 30 檔 size
  </Card>

  <Card title="官轉 vs 官逆 對比" icon="scale" href="/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    一表看清官轉與官逆的差異
  </Card>

  <Card title="ComfyUI 節點合集" icon="workflow" href="/zh-Hant/scenarios">
    檢視更多 API易 適配的 ComfyUI 節點
  </Card>

  <Card title="Luck Nano Banana Pro（同作者）" icon="puzzle" href="/zh-Hant/scenarios/ecosystem/lucknanobananapro-comfyui">
    luckdvr 的 Gemini 系列 ComfyUI 節點
  </Card>

  <Card title="APIYI GPT-Image 2 Skills（同模型）" icon="puzzle" href="/zh-Hant/scenarios/ecosystem/apiyi-gpt-image-skills">
    GPT 影像模型的 AI Agent Skill 封裝版本
  </Card>

  <Card title="API易控制台" icon="settings" href="https://www.apiyi.com">
    管理金鑰、用量與分組
  </Card>
</CardGroup>
