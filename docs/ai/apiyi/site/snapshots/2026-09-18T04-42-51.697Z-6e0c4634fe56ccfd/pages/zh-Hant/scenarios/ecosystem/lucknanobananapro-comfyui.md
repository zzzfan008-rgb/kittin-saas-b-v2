> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck Nano Banana Pro - ComfyUI 節點

> 社群貢獻的高階 ComfyUI 節點：支援最多 14 張參考圖、1K/2K/4K 輸出、15 種寬高比、超時重試與即時進度，適合重度影像創作工作流。

## 概述

`Comfyui-LuckNanoBananaPro` 是社群使用者 luckdvr 貢獻的 ComfyUI 自定義節點，通過 API易 呼叫 Gemini 3 Pro Image Preview / Flash 進行**文生圖與多圖編輯**。相比基礎版節點，它的最大亮點是**工程化**：內建超時重試、即時進度指示、ComfyUI 原生 seed 管理，以及最多 14 張圖片堆疊輸入，適合對穩定性和批次控制有要求的生產工作流。

<Info>
  **專案資訊**

  * 🔗 開源地址：`github.com/luckdvr/Comfyui-LuckNanoBananaPro`
  * 📜 許可證：MIT / Apache-2.0 雙許可
  * 👤 作者：luckdvr
  * ⭐ 該專案由社群使用者貢獻，專為 API易 適配
</Info>

<Tip>
  **如何在三款 ComfyUI 節點中選擇？**

  API易 社群目前有 3 款 Nano Banana ComfyUI 節點，可按需選擇：

  * **[Nano Banana ComfyUI 節點](/zh-Hant/scenarios/ecosystem/nano-banana-comfyui)**：功能全面（對話式編輯、多輪記憶），適合互動創作
  * **[APIYI Nano Banana Node（輕量版）](/zh-Hant/scenarios/ecosystem/apiyi-nano-banana-node)**：程式碼極簡，適合學習和二次開發
  * **Luck Nano Banana Pro（本頁）**：工程化引數齊全（超時、重試、14 圖輸入），適合穩定生產
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="14 張圖同時輸入" icon="images">
    `image_01` \~ `image_14` 引數位可堆疊最多 14 張參考圖，覆蓋 Nano Banana Pro 的理論輸入上限
  </Card>

  <Card title="多檔解析度" icon="image">
    支援 **1K / 2K / 4K** 三檔輸出，搭配自適應超時，兼顧速度與畫質
  </Card>

  <Card title="15 種寬高比" icon="ratio">
    預置豐富的寬高比選項，覆蓋豎屏、橫屏、方圖、電影寬幅等常見需求
  </Card>

  <Card title="雙模型切換" icon="layers">
    `gemini-3-pro-image-preview`（Pro）與 `gemini-3.1-flash-image-preview`（Flash）自由切換
  </Card>

  <Card title="超時與重試" icon="refresh-cw">
    `timeout_seconds`（10-600s）+ `retry_times`（1-20 次）可配置，高峰期也穩
  </Card>

  <Card title="即時進度指示" icon="gauge">
    節點內建狀態、百分比、計時顯示，長任務不再黑盒
  </Card>

  <Card title="原生 Seed 管理" icon="dices">
    支援 ComfyUI 標準的 fixed / random / increment / decrement 四種 seed 模式
  </Card>

  <Card title="MIT / Apache-2.0 雙許可" icon="shield">
    寬鬆許可，商用與二次開發都無憂
  </Card>
</CardGroup>

## 支援的 API易 模型

| 模型名稱                 | 模型標識                             | 用途           | API 文件                                                       |
| -------------------- | -------------------------------- | ------------ | ------------------------------------------------------------ |
| Nano Banana Pro      | `gemini-3-pro-image-preview`     | 高品質影像生成與多圖編輯 | [檢視文件](/zh-Hant/api-capabilities/nano-banana-image/overview) |
| Nano Banana 2（Flash） | `gemini-3.1-flash-image-preview` | 快速生成，成本更低    | [檢視文件](/zh-Hant/api-capabilities/gemini/native)              |

## 節點引數

| 引數名                     | 型別     | 必填 | 預設值                          | 說明                          |
| ----------------------- | ------ | -- | ---------------------------- | --------------------------- |
| `api_key`               | string | 是  | -                            | API易 令牌，建議單獨建立帶用量上限的專用 Key  |
| `prompt`                | string | 是  | -                            | 生成或編輯的文本指令                  |
| `model`                 | enum   | 是  | `gemini-3-pro-image-preview` | 模型選擇（Pro / Flash）           |
| `image_size`            | enum   | 否  | `2K`                         | 輸出解析度（1K / 2K / 4K）         |
| `aspect_ratio`          | enum   | 否  | `1:1`                        | 15 種寬高比之一                   |
| `timeout_seconds`       | int    | 否  | 120                          | 單次請求超時（10-600 秒）            |
| `retry_times`           | int    | 否  | 3                            | 失敗重試次數（1-20 次）              |
| `seed`                  | int    | 否  | 0                            | 隨機種子（配合 ComfyUI 標準 seed 模式） |
| `image_01` … `image_14` | IMAGE  | 否  | -                            | 可選參考圖輸入，最多 14 張             |

## 安裝配置

<Steps>
  <Step title="第一步：克隆到 custom_nodes">
    進入 ComfyUI 安裝目錄：

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-LuckNanoBananaPro.git
    ```
  </Step>

  <Step title="第二步：安裝依賴">
    ```bash theme={null}
    cd Comfyui-LuckNanoBananaPro
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="第三步：重啟 ComfyUI">
    重啟後在節點搜尋欄輸入 `Luck Nano Banana Pro` 即可找到節點。
  </Step>

  <Step title="第四步：配置 API易 金鑰">
    * 訪問 [API易控制台](https://www.apiyi.com) →【令牌】，**新建一個帶用量上限的專用金鑰**（安全最佳實踐）
    * 貼上到節點 `api_key` 引數即可
    * 節點內部已指向 `api.apiyi.com`，無需額外配置
  </Step>

  <Step title="第五步：搭建工作流">
    * **文生圖**：直接填 `prompt`，不連線任何參考圖
    * **多圖編輯**：將多個 `Load Image` 連到 `image_01`, `image_02`…，搭配 `prompt` 描述編輯指令
  </Step>
</Steps>

## 使用示例

### 示例 1：高穩定性文生圖

```
prompt: "Cinematic product shot of a minimalist ceramic teacup on a wooden tray, soft morning light, 35mm lens, shallow depth of field"
model: gemini-3-pro-image-preview
image_size: 4K
aspect_ratio: 3:2
timeout_seconds: 300
retry_times: 5
```

### 示例 2：多圖融合

```
image_01: 人物照片
image_02: 服裝參考
image_03: 場景參考
image_04: 光線參考
prompt: "Photorealistic portrait: subject from image_01 wearing outfit from image_02, in the setting of image_03, with lighting style of image_04"
image_size: 2K
aspect_ratio: 4:5
```

### 示例 3：Seed 批次探索

通過 ComfyUI 原生 seed 管理，在 `increment` 模式下批次跑多個種子，快速對比同一 prompt 的變化。

## 常見問題

<AccordionGroup>
  <Accordion title="節點找不到？">
    1. 確認倉庫在 `ComfyUI/custom_nodes/Comfyui-LuckNanoBananaPro`
    2. 依賴安裝無報錯（尤其是 requests / Pillow / numpy）
    3. 完全重啟 ComfyUI（重新整理前端不夠）
  </Accordion>

  <Accordion title="4K 經常超時？">
    該節點已支援可調 `timeout_seconds`：

    * 4K 場景建議 `timeout_seconds=300` 起步
    * 搭配 `retry_times=5` 自動重試，應對網路抖動
    * 若仍頻繁超時，參考 [下載 CDN 圖片/影片很慢怎麼辦](/zh-Hant/faq/cdn-download-slow) 最佳化伺服器網路
  </Accordion>

  <Accordion title="14 張參考圖都會被使用嗎？">
    節點允許連線最多 14 張，但**實際是否參與生成**取決於 prompt 的描述。建議在 prompt 中明確引用 `image_01` / `image_02`…，或用自然語言描述每張圖的作用，模型會按你的指令選擇性使用。
  </Accordion>

  <Accordion title="呼叫返回 401 / 403？">
    1. `api_key` 是否正確、未被分組限制誤攔
    2. 所選模型是否在令牌的白名單內
    3. 餘額是否充足，參考 [為什麼還有餘額跑不通](/zh-Hant/faq/balance-insufficient)
  </Accordion>

  <Accordion title="和其他兩款 Nano Banana ComfyUI 節點有什麼區別？">
    * [nano-banana-comfyui（功能完整版）](/zh-Hant/scenarios/ecosystem/nano-banana-comfyui)：強調**對話式編輯**與多輪記憶
    * [apiyi-nano-banana-node（輕量示例）](/zh-Hant/scenarios/ecosystem/apiyi-nano-banana-node)：程式碼最簡，適合學習/拓展
    * **Luck Nano Banana Pro（本頁）**：引數工程化（超時 / 重試 / 14 圖），適合批次與穩定生產
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="Nano Banana Pro API 文件" icon="book" href="/zh-Hant/api-capabilities/nano-banana-image/overview">
    模型完整能力與 API 引數說明
  </Card>

  <Card title="Luck GPT-Image 2（同作者）" icon="puzzle" href="/zh-Hant/scenarios/ecosystem/luckgpt2-comfyui">
    luckdvr 的 OpenAI 系列 ComfyUI 節點：`gpt-image-2` + `gpt-image-2-all`
  </Card>

  <Card title="ComfyUI 節點合集" icon="workflow" href="/zh-Hant/scenarios">
    檢視更多 Nano Banana ComfyUI 節點
  </Card>

  <Card title="FAQ：CDN 下載慢" icon="gauge" href="/zh-Hant/faq/cdn-download-slow">
    4K 圖片下載慢？看這裡
  </Card>

  <Card title="API易控制台" icon="settings" href="https://www.apiyi.com">
    管理金鑰、用量與分組
  </Card>
</CardGroup>
