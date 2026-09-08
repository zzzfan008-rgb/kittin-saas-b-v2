> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck GPT-Image 2 - ComfyUI 節點

> 社群貢獻的雙節點合集：一鍵在 ComfyUI 呼叫 gpt-image-2（官轉）與 gpt-image-2-all（官逆），覆蓋文生圖、參考圖編輯、mask 重繪、自定義解析度。

## 概述

`Comfyui-Luck-gpt2.0` 是社群使用者 luckdvr 貢獻的 ComfyUI 自定義節點合集，在 ComfyUI 中一鍵呼叫 API易 的兩款 GPT 影像模型 —— **官轉 `gpt-image-2`** 與 **官逆 `gpt-image-2-all`**。兩個節點分工明確：前者主打精細引數（解析度、畫質、mask、多參考圖），後者主打 ChatGPT 一致的對話式出圖體驗，配合超時重試，適合放進生產級工作流。

<Info>
  **專案資訊**

  * 🔗 開源地址：`github.com/luckdvr/Comfyui-Luck-gpt2.0`
  * 📜 許可證：Apache-2.0
  * 👤 作者：luckdvr
  * ⭐ 該專案由社群使用者貢獻，專為 API易 適配
</Info>

<Tip>
  **同一作者的兩套節點如何區分？**

  luckdvr 為 API易 貢獻了兩套 ComfyUI 節點：

  * **[Luck Nano Banana Pro](/zh-Hant/scenarios/ecosystem/lucknanobananapro-comfyui)**：呼叫 Gemini 系列（`gemini-3-pro-image-preview` / `gemini-3.1-flash-image-preview`），強調 14 張參考圖與工程化超時重試
  * **Luck GPT-Image 2（本頁）**：呼叫 OpenAI 系列（`gpt-image-2` / `gpt-image-2-all`），強調雙端點切換（chat\_completions / images\_api）與 mask 重繪
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="雙節點雙路線" icon="layers">
    `Comfyui-Luck gpt-image-2`（官轉）與 `Comfyui-Luck gpt-2.0 all`（官逆）各管一路，按場景自由選擇
  </Card>

  <Card title="最多 5 張參考圖" icon="images">
    官轉節點支援最多 5 張參考圖疊加輸入，滿足複雜融合與風格遷移
  </Card>

  <Card title="Mask 局部重繪" icon="eraser">
    支援可選 mask 輸入，精準圈定重繪區域，做精細化局部編輯
  </Card>

  <Card title="多檔解析度 + 自定義尺寸" icon="image">
    1K / 2K / 4K 預設 + 自定義尺寸（單邊最大 3840px，畫素數 65.5 萬–829.4 萬）
  </Card>

  <Card title="15 種寬高比" icon="ratio">
    AUTO、1:1、2:3、3:2、3:4、4:3、4:5、5:4、9:16、16:9、21:9、1:4、4:1、1:8、8:1
  </Card>

  <Card title="畫質與輸出格式可選" icon="sliders-horizontal">
    `quality`（auto / low / medium / high）+ 輸出格式（png / jpeg / webp）+ 壓縮率 0-100
  </Card>

  <Card title="雙端點切換（官逆節點）" icon="git-branch">
    `gpt-image-2-all` 節點支援 `chat_completions` / `images_api` 端點切換，相容不同調用習慣
  </Card>

  <Card title="超時重試內建" icon="refresh-cw">
    內建超時與重試引數，應對高峰期網路抖動
  </Card>
</CardGroup>

## 支援的 API易 模型

| 模型名稱                | 模型標識              | 對應節點                       | 用途                         | API 文件                                                     |
| ------------------- | ----------------- | -------------------------- | -------------------------- | ---------------------------------------------------------- |
| GPT-Image 2（官轉）     | `gpt-image-2`     | `Comfyui-Luck gpt-image-2` | 原生 2K/4K 文生圖、參考圖編輯、mask 重繪 | [檢視文件](/zh-Hant/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All（官逆） | `gpt-image-2-all` | `Comfyui-Luck gpt-2.0 all` | ChatGPT 一致的對話式出圖，按次計費      | [檢視文件](/zh-Hant/api-capabilities/gpt-image-2-all/overview) |

<Info>
  兩款模型的完整差異詳解見 [gpt-image-2（官轉）vs gpt-image-2-all（官逆）對比文件](/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all)。
</Info>

## 節點引數

### `Comfyui-Luck gpt-image-2`（官轉）

| 引數名                   | 型別     | 必填 | 預設值    | 說明                                  |
| --------------------- | ------ | -- | ------ | ----------------------------------- |
| `api_key`             | string | 是  | -      | API易 令牌，建議單獨建立帶用量上限的專用 Key          |
| `prompt`              | string | 是  | -      | 生成或編輯的文本指令                          |
| `image_1` … `image_5` | IMAGE  | 否  | -      | 參考圖輸入，最多 5 張                        |
| `mask`                | MASK   | 否  | -      | 可選 mask，用於局部重繪（白色區域為編輯區）            |
| `size`                | enum   | 否  | `2K`   | 輸出解析度（1K / 2K / 4K / custom）        |
| `custom_size`         | string | 否  | -      | `size` 選 `custom` 時生效，如 `2048x3072` |
| `aspect_ratio`        | enum   | 否  | `AUTO` | 15 種寬高比之一                           |
| `quality`             | enum   | 否  | `auto` | auto / low / medium / high          |
| `output_format`       | enum   | 否  | `png`  | png / jpeg / webp                   |
| `output_compression`  | int    | 否  | 80     | 0-100（僅對 jpeg / webp 生效）            |

### `Comfyui-Luck gpt-2.0 all`（官逆）

| 引數名               | 型別     | 必填 | 預設值                | 說明                                |
| ----------------- | ------ | -- | ------------------ | --------------------------------- |
| `api_key`         | string | 是  | -                  | API易 令牌                           |
| `prompt`          | string | 是  | -                  | 對話式生圖指令                           |
| `endpoint`        | enum   | 否  | `chat_completions` | `chat_completions` / `images_api` |
| `response_format` | enum   | 否  | -                  | `b64_json` / `url` 等              |
| `timeout_seconds` | int    | 否  | -                  | 單次請求超時                            |
| `retry_times`     | int    | 否  | -                  | 失敗重試次數                            |

## 安裝配置

<Steps>
  <Step title="第一步：克隆到 custom_nodes">
    進入 ComfyUI 安裝目錄：

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-Luck-gpt2.0.git
    ```
  </Step>

  <Step title="第二步：安裝依賴">
    ```bash theme={null}
    cd Comfyui-Luck-gpt2.0
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="第三步：重啟 ComfyUI">
    在節點搜尋欄輸入 `Luck gpt-image-2` 或 `Luck gpt-2.0 all` 即可找到兩個節點。
  </Step>

  <Step title="第四步：配置 API易 金鑰">
    * 訪問 [API易控制台](https://www.apiyi.com) →【令牌】新建金鑰（建議配用量上限）
    * 貼上到節點的 `api_key` 引數
    * 節點預設指向 `api.apiyi.com`；不穩定時可切換備用域名 `vip.apiyi.com` / `b.apiyi.com`
  </Step>

  <Step title="第五步：匯入示例工作流">
    倉庫內提供 `example_workflow.json`，可直接在 ComfyUI 中匯入作為工作流起點。
  </Step>
</Steps>

## 使用示例

### 示例 1：官轉 4K 高品質文生圖

```
節點: Comfyui-Luck gpt-image-2
prompt: "Cinematic portrait of a samurai in a misty bamboo forest, volumetric light, 85mm lens, photorealistic"
size: 4K
aspect_ratio: 2:3
quality: high
output_format: png
```

### 示例 2：mask 局部重繪（官轉）

```
節點: Comfyui-Luck gpt-image-2
image_1: 原始照片
mask: 要替換的區域（白色為編輯區）
prompt: "replace the sky with dramatic sunset clouds, keep everything else intact"
size: 2K
quality: high
```

### 示例 3：官逆對話式出圖

```
節點: Comfyui-Luck gpt-2.0 all
endpoint: chat_completions
prompt: "一位穿漢服的少女站在櫻花樹下，水彩畫風格，柔和光線"
response_format: b64_json
timeout_seconds: 180
retry_times: 3
```

## 常見問題

<AccordionGroup>
  <Accordion title="兩個節點如何選？">
    * **`gpt-image-2`（官轉）**：引數可控、原生支援 mask、按 token 計費、解析度 / 畫質精細可調 —— 適合有明確尺寸要求或需要局部重繪的工作流
    * **`gpt-image-2-all`（官逆）**：按次計費（\$0.03 / 次），對話式自然語言出圖、與 ChatGPT 網頁版能力一致 —— 適合多輪改圖、文字還原要求高的場景
    * 完整差異看 [官轉 vs 官逆 對比文件](/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="節點找不到？">
    1. 確認目錄 `ComfyUI/custom_nodes/Comfyui-Luck-gpt2.0` 存在
    2. `pip install -r requirements.txt` 無報錯
    3. 完全重啟 ComfyUI（只重新整理前端不夠）
  </Accordion>

  <Accordion title="4K 或自定義解析度經常超時？">
    * 調大官逆節點的 `timeout_seconds` 引數
    * 伺服器網路慢可參考 [下載 CDN 圖片/影片很慢怎麼辦](/zh-Hant/faq/cdn-download-slow)
    * 預設域名不穩時可切換到備用 `vip.apiyi.com` / `b.apiyi.com`
  </Accordion>

  <Accordion title="官逆節點返回的 b64_json 帶字首？">
    官逆 `gpt-image-2-all` 的 `b64_json` 欄位會帶 `data:image/png;base64,` 字首，而官轉 `gpt-image-2` 不帶。詳細說明見 [官轉 vs 官逆 對比文件](/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all)。
  </Accordion>

  <Accordion title="呼叫返回 401 / 403？">
    1. 檢查 `api_key` 是否正確，是否被分組限制誤攔
    2. 所選模型是否在令牌的白名單內
    3. 餘額問題參考 [為什麼還有餘額跑不通](/zh-Hant/faq/balance-insufficient)
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="gpt-image-2（官轉）文件" icon="book" href="/zh-Hant/api-capabilities/gpt-image-2/overview">
    原生 2K/4K 高畫質生圖，按 token 計費
  </Card>

  <Card title="gpt-image-2-all（官逆）文件" icon="book" href="/zh-Hant/api-capabilities/gpt-image-2-all/overview">
    ChatGPT 一致體驗，\$0.03 / 次按次計費
  </Card>

  <Card title="官轉 vs 官逆 對比" icon="scale" href="/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    17 個維度一表看清兩款模型的差異
  </Card>

  <Card title="ComfyUI 節點合集" icon="workflow" href="/zh-Hant/scenarios">
    檢視更多 API易 適配的 ComfyUI 節點
  </Card>

  <Card title="Luck Nano Banana Pro（同作者）" icon="puzzle" href="/zh-Hant/scenarios/ecosystem/lucknanobananapro-comfyui">
    luckdvr 的 Gemini 系列 ComfyUI 節點
  </Card>

  <Card title="APIYI GPT-Image 2 Skills（同模型）" icon="puzzle" href="/zh-Hant/scenarios/ecosystem/apiyi-gpt-image-skills">
    兩款 GPT 影像模型的 AI Agent Skill 封裝版本
  </Card>

  <Card title="API易控制台" icon="settings" href="https://www.apiyi.com">
    管理金鑰、用量與分組
  </Card>
</CardGroup>
