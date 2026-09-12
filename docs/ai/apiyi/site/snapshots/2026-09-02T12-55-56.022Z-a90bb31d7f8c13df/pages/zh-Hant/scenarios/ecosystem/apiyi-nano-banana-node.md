> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI Nano Banana ComfyUI 節點（輕量示例版）

> 社群夥伴貢獻的輕量級 ComfyUI 節點示例，開箱即用地在工作流中呼叫 Nano Banana Pro / 2，適合快速上手與二次拓展。

## 概述

`api_yi_nano_banana_node` 是社群好夥伴 JerrIsTheBesta 貢獻的**輕量級 ComfyUI 節點示例**，聚焦於"開箱即用 + 易於拓展"。只需在 `custom_nodes` 目錄放入節點並重啟 ComfyUI，即可在工作流中直接呼叫 API易 的 Nano Banana Pro / Nano Banana 2 影像生成能力，非常適合作為學習與二次開發的起點。

<Info>
  **專案資訊**

  * 🔗 開源地址：`github.com/JerrIsTheBesta/api_yi_nano_banana_node`
  * 📜 許可證：MIT
  * 👤 作者：JerrIsTheBesta
  * ⭐ 該專案由社群好夥伴貢獻，定位為**示例 + 可自行拓展**
</Info>

<Tip>
  **適合誰使用**

  該節點專注最核心的文生圖與多圖編輯能力，程式碼簡潔、易讀。如需更復雜的能力（對話式編輯、14 圖融合等），推薦參考 [Nano Banana ComfyUI 節點（完整版）](/zh-Hant/scenarios/ecosystem/nano-banana-comfyui)，或基於本示例自行拓展。
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="兩個核心節點" icon="workflow">
    `APIYI Text to Image` 文生圖 + `APIYI Multi Image Edit` 多圖編輯，覆蓋最常用兩種場景
  </Card>

  <Card title="雙模型切換" icon="layers">
    內建選擇 `gemini-3-pro-image-preview`（Nano Banana Pro）與 `gemini-3.1-flash-image-preview`
  </Card>

  <Card title="高解析度支援" icon="image">
    支援 **2K / 4K** 輸出，並根據解析度自動調整超時時間
  </Card>

  <Card title="豐富寬高比" icon="ratio">
    內建 1:1、16:9、9:16、4:3、3:4、3:2、2:3、21:9、5:4、4:5 等 10 種比例
  </Card>

  <Card title="多圖編輯輸入" icon="images">
    `Multi Image Edit` 支援最多 **5 張參考圖** 融合/編輯，適合合成、風格遷移
  </Card>

  <Card title="輕量易拓展" icon="code">
    Python 純實現、依賴極少（requests / Pillow / numpy），程式碼結構清晰，便於二次開發
  </Card>
</CardGroup>

## 支援的 API易 模型

| 模型名稱                 | 模型標識                             | 用途         | API 文件                                                       |
| -------------------- | -------------------------------- | ---------- | ------------------------------------------------------------ |
| Nano Banana Pro      | `gemini-3-pro-image-preview`     | 高品質影像生成與編輯 | [檢視文件](/zh-Hant/api-capabilities/nano-banana-image/overview) |
| Nano Banana 2（Flash） | `gemini-3.1-flash-image-preview` | 快速生成，成本更低  | [檢視文件](/zh-Hant/api-capabilities/gemini/native)              |

## 節點說明

### APIYI Text to Image（文生圖）

純文本提示詞生成圖片，**不需要輸入影像**。輸出：生成的圖片 + 檔名標識。

### APIYI Multi Image Edit（多圖編輯）

支援**最多 5 張輸入圖**進行融合、編輯或合成。輸出：結果圖、檔名、實際使用的圖片數量。

### 節點引數

| 引數名            | 型別     | 必填 | 預設值                          | 說明                         |
| -------------- | ------ | -- | ---------------------------- | -------------------------- |
| `api_key`      | string | 是  | -                            | API易 令牌，建議單獨建立帶用量上限的專用 Key |
| `prompt`       | string | 是  | -                            | 文本提示詞                      |
| `model`        | enum   | 是  | `gemini-3-pro-image-preview` | 模型選擇（Pro / Flash）          |
| `resolution`   | enum   | 否  | `2K`                         | 輸出解析度（2K / 4K，4K 自動延長超時）   |
| `aspect_ratio` | enum   | 否  | `1:1`                        | 寬高比（10 種可選）                |
| `images`       | IMAGE  | 否  | -                            | 多圖編輯節點的參考圖輸入（最多 5 張）       |

## 安裝配置

<Steps>
  <Step title="第一步：放入 custom_nodes 目錄">
    進入 ComfyUI 安裝目錄，克隆或下載本倉庫到 `custom_nodes`：

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/JerrIsTheBesta/api_yi_nano_banana_node.git
    ```
  </Step>

  <Step title="第二步：安裝 Python 依賴">
    節點依賴極少，通常 ComfyUI 已自帶 torch。其他依賴如有缺失可手動安裝：

    ```bash theme={null}
    pip install requests pillow numpy
    ```
  </Step>

  <Step title="第三步：重啟 ComfyUI">
    重啟後在節點搜尋欄輸入 `APIYI` 即可看到兩個新節點：

    * `APIYI Text to Image`
    * `APIYI Multi Image Edit`
  </Step>

  <Step title="第四步：配置 API易 金鑰">
    * 訪問 [API易控制台](https://www.apiyi.com) 的【令牌】欄目，**新建一個專用金鑰並設定用量上限**（安全最佳實踐）
    * 將金鑰複製貼上到節點的 `api_key` 引數
    * API 端點無需手動配置，節點已內建 `https://api.apiyi.com` 路徑
  </Step>

  <Step title="第五步：搭建簡單工作流">
    * **文生圖**：`APIYI Text to Image` → `Preview Image`
    * **多圖編輯**：多個 `Load Image` → `APIYI Multi Image Edit` → `Preview Image`
  </Step>
</Steps>

## 使用示例

### 示例 1：文生圖

```
節點：APIYI Text to Image
prompt: "A cute corgi astronaut floating in a neon-lit space station, cinematic lighting"
model: gemini-3-pro-image-preview
resolution: 2K
aspect_ratio: 16:9
```

### 示例 2：多圖融合

```
節點：APIYI Multi Image Edit
images: [人物照片, 服裝參考圖, 背景參考圖]
prompt: "Replace the outfit with the reference clothing, and set the scene in the reference background"
resolution: 4K
aspect_ratio: 1:1
```

## 拓展建議

該專案定位為**示例與起點**，歡迎 Fork 後按需拓展：

<CardGroup cols={2}>
  <Card title="對話式編輯" icon="messages-square">
    在節點中維護 session 上下文，支援多輪迭代最佳化圖片
  </Card>

  <Card title="更多參考圖" icon="images">
    參考 Nano Banana Pro 能力，將參考圖上限擴充套件到 14 張
  </Card>

  <Card title="Seed 控制" icon="dices">
    新增 seed 引數以支援可復現的生成
  </Card>

  <Card title="批次輸出" icon="layers">
    支援一次生成多張並輸出為 batch，配合 ComfyUI 的後續節點鏈
  </Card>
</CardGroup>

## 常見問題

<AccordionGroup>
  <Accordion title="節點安裝後在搜尋欄找不到？">
    1. 確認倉庫放在 `ComfyUI/custom_nodes/` 目錄下
    2. 完全重啟 ComfyUI（不是僅重新整理前端）
    3. 檢視 ComfyUI 控制台輸出，確認沒有 Python 依賴報錯
  </Accordion>

  <Accordion title="呼叫失敗，提示 401 / 403？">
    請檢查：

    1. `api_key` 是否填寫正確，且未被錯誤分組限制
    2. 所選模型是否在當前令牌的模型白名單內
    3. 賬戶餘額是否充足，參考 [為什麼還有餘額跑不通](/zh-Hant/faq/balance-insufficient)
  </Accordion>

  <Accordion title="4K 解析度經常超時？">
    節點已對 4K 自動延長超時，但若仍超時：

    1. 檢查伺服器到 API 的網路品質（參考 [下載 CDN 圖片/影片很慢怎麼辦](/zh-Hant/faq/cdn-download-slow)）
    2. 在高峰期可暫時回退到 2K 或使用 Flash 模型
  </Accordion>

  <Accordion title="是否安全地暴露了 API Key？">
    作者明確建議：**不要使用主 Key**，而是在 API易 控制台單獨建立一個帶用量上限的專用 Key 給該節點使用，避免洩漏帶來額外損失。
  </Accordion>

  <Accordion title="和已有的 ComfyUI-Nano-Banana-apiyi 節點有什麼區別？">
    * 本節點：**輕量示例**，僅 2 個節點，程式碼簡潔、依賴極少，適合上手和二次開發
    * [完整版節點](/zh-Hant/scenarios/ecosystem/nano-banana-comfyui)：功能更全（對話式編輯、14 圖融合等），適合生產工作流
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="Nano Banana Pro API 文件" icon="book" href="/zh-Hant/api-capabilities/nano-banana-image/overview">
    檢視 Nano Banana Pro 的完整 API 能力
  </Card>

  <Card title="ComfyUI 完整版節點" icon="workflow" href="/zh-Hant/scenarios/ecosystem/nano-banana-comfyui">
    功能更完整的 Nano Banana ComfyUI 節點集合
  </Card>

  <Card title="使用場景總覽" icon="rocket" href="/zh-Hant/scenarios">
    檢視更多 API易 使用場景
  </Card>

  <Card title="API易控制台" icon="settings" href="https://www.apiyi.com">
    管理 API 金鑰和檢視用量
  </Card>
</CardGroup>
