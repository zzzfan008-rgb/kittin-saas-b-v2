> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Annotator - ComfyUI 節點

> 社群貢獻的影像標註節點：在圖上直接畫點、框、多邊形標出要改的區域，配合 Nano Banana 節點大幅降低改圖的提示詞門檻。

## 概述

`comfyui-image-annotator` 是社群使用者 luckdvr 貢獻的**互動式影像標註 ComfyUI 節點**。它的核心價值是——**降低提示詞門檻**。你不用再費勁描述"把圖片左上角那個紅色按鈕換成藍色"，只要在圖上**圈出來、點一下、畫個框**，讓模型清楚看到"我要改這裡"即可。最適合搭配在 Nano Banana Pro 節點**前面**，組成"圖片 → 標註 → API"的三段式工作流。

<Info>
  **專案資訊**

  * 🔗 開源地址：`github.com/luckdvr/comfyui-image-annotator`
  * 📜 許可證：MIT
  * 👤 作者：luckdvr
  * ⭐ 社群貢獻，與 [Luck Nano Banana Pro](/zh-Hant/scenarios/ecosystem/lucknanobananapro-comfyui) 同作者
</Info>

<Tip>
  **推薦工作流：圖片 → 標註節點 → API 節點**

  ```
  LoadImage  ─►  ImageAnnotator  ─►  Luck Nano Banana Pro  ─►  SaveImage
                 （在圖上圈出要改的區域）     （看著標註按指令改圖）
  ```

  適合人群：**不擅長寫英文提示詞、不知道怎麼精確描述"改哪裡"的使用者**。把"描述區域"的工作交給滑鼠，把"怎麼改"的工作交給一句簡單的 prompt。
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="三種標註方式" icon="pen-tool">
    **點（⦿）**：單擊放置 · **矩形（▢）**：拖拽畫框 · **多邊形（⬡）**：多點連線自動閉合
  </Card>

  <Card title="即時渲染預覽" icon="eye">
    標註即時渲染到畫布，所見即所得，不用反覆跑圖看效果
  </Card>

  <Card title="縮放 / 平移 / 選擇" icon="move">
    內建畫布操作，處理大圖也能精準定位局部
  </Card>

  <Card title="50 步撤銷" icon="undo">
    最多 50 步撤銷歷史，盡情嘗試不怕誤操作
  </Card>

  <Card title="雙輸出" icon="square-split-horizontal">
    同時輸出**標註後的圖片**（供模型參考）+ **JSON 標註資料**（便於後續節點解析）
  </Card>

  <Card title="樣式可定製" icon="palette">
    描邊顏色、寬度、填充透明度、點大小均可配置
  </Card>
</CardGroup>

## 支援的 API易 模型

該節點本身**不呼叫 API**，只負責對影像做標註。標註後的圖片可餵給任何支援影像輸入的 API易 模型，最佳搭檔：

| 模型名稱                | 模型標識                         | 用途             | API 文件                                                       |
| ------------------- | ---------------------------- | -------------- | ------------------------------------------------------------ |
| Nano Banana Pro     | `gemini-3-pro-image-preview` | 根據標註區域局部改圖/融合  | [檢視文件](/zh-Hant/api-capabilities/nano-banana-image/overview) |
| Gemini / Qwen-VL 系列 | 多種                           | 影像理解、基於標註的視覺問答 | [檢視文件](/zh-Hant/api-capabilities/gemini/native)              |

## 節點說明

### 輸入

| 引數名     | 型別    | 必填 | 說明     |
| ------- | ----- | -- | ------ |
| `image` | IMAGE | 是  | 要標註的原圖 |

### 輸出

| 輸出端                | 型別     | 說明                                |
| ------------------ | ------ | --------------------------------- |
| `annotated_image`  | IMAGE  | 已渲染標註標記的圖片（可直接餵給下游 API 節點）        |
| `annotations_json` | STRING | 描述標註位置/型別的 JSON 字串（供需要結構化輸入的節點使用） |

## 安裝配置

<Steps>
  <Step title="第一步：克隆到 custom_nodes">
    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/comfyui-image-annotator.git
    ```
  </Step>

  <Step title="第二步：重啟 ComfyUI">
    無額外依賴（使用 ComfyUI 自帶環境即可），重啟後在節點搜尋欄輸入 `ImageAnnotator` 即可找到。
  </Step>

  <Step title="第三步：搭建三段式工作流">
    把節點依次連起來：

    ```
    LoadImage → ImageAnnotator → Luck Nano Banana Pro → SaveImage
    ```

    在 `ImageAnnotator` 的畫布上圈出要改動的位置，然後在下游 API 節點寫一句簡單的 prompt（如 "replace the marked area with a red sports car"），執行即可。
  </Step>
</Steps>

## 使用示例

### 示例 1：局部換物（小白友好）

<Steps>
  <Step title="載入原圖">
    `LoadImage` 載入一張客廳照片
  </Step>

  <Step title="標註目標區域">
    `ImageAnnotator`：用矩形框住沙發旁的空位
  </Step>

  <Step title="寫一句簡單 prompt">
    `Luck Nano Banana Pro`：prompt = "Put a green indoor plant in the marked area"
  </Step>

  <Step title="執行輸出">
    模型會在你框出的位置放一盆綠植，不動其他區域
  </Step>
</Steps>

### 示例 2：多區域精準標註

用**多邊形**標註人物衣服 + **點**標註帽子位置 + **矩形**標註背景區域，然後用 prompt：

```
Change the clothing in polygon 1 to a black suit, add a hat at point 1,
replace the background in rectangle 1 with a sunset beach
```

模型會分別對三個區域做不同的修改。

### 示例 3：視覺問答 / 理解

配合 Gemini / Qwen-VL：讓模型解釋"被框出來的物體是什麼、在圖裡起什麼作用"，標註提供精確的視覺錨點。

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼推薦給「不會寫提示詞」的使用者？">
    傳統改圖需要你用文字精確描述"改哪裡、怎麼改"。對非英語使用者、不熟 AI prompt 的小白非常不友好。

    有了這個節點，**位置資訊由滑鼠標註直接給出**，prompt 只需描述"改成什麼"即可。原本需要 3-5 句話的精確描述，現在一句簡單英文就能搞定。
  </Accordion>

  <Accordion title="標註後的圖片會影響生成品質嗎？">
    會，而且是**往好的方向影響**。大部分多模態模型（Nano Banana、Gemini、Qwen-VL）都能理解圖上的標註符號，把它們識別為"使用者指示的目標區域"，從而更精準地按指令編輯。

    若擔心標註樣式干擾最終輸出，可在節點內調低描邊寬度、使用半透明填充。
  </Accordion>

  <Accordion title="節點裝完找不到？">
    1. 確認目錄是 `ComfyUI/custom_nodes/comfyui-image-annotator`
    2. 完全重啟 ComfyUI（重新整理前端不夠）
    3. 檢查 ComfyUI 控制台有無報錯
  </Accordion>

  <Accordion title="可以只輸出 JSON 不渲染標註嗎？">
    可以。把下游節點只接 `annotations_json` 埠即可。適合需要把座標傳給自定義指令碼做後處理的場景。
  </Accordion>

  <Accordion title="和 Luck Nano Banana Pro 搭配的最佳實踐？">
    推薦流水線：`LoadImage → ImageAnnotator → Luck Nano Banana Pro`

    * `Luck Nano Banana Pro` 的 `image_01` 接 `ImageAnnotator` 的 `annotated_image` 輸出
    * prompt 中用自然語言描述"對標註區域做什麼"
    * 首次效果不理想時，用 `Luck Nano Banana Pro` 的 `retry_times` 或 seed 模式多跑幾次
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="Luck Nano Banana Pro 節點" icon="workflow" href="/zh-Hant/scenarios/ecosystem/lucknanobananapro-comfyui">
    同作者的 API 呼叫節點，與本節點完美搭配
  </Card>

  <Card title="Nano Banana Pro API" icon="book" href="/zh-Hant/api-capabilities/nano-banana-image/overview">
    瞭解 Nano Banana Pro 的完整能力
  </Card>

  <Card title="ComfyUI 節點合集" icon="layers" href="/zh-Hant/scenarios">
    檢視所有 Nano Banana ComfyUI 節點
  </Card>

  <Card title="API易控制台" icon="settings" href="https://www.apiyi.com">
    管理金鑰、用量與分組
  </Card>
</CardGroup>
