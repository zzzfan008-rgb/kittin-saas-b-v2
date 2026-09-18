> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana ComfyUI 節點

> 社群開源的 ComfyUI 自定義節點，支援通過 API易 呼叫 Nano Banana Pro 和 Nano Banana 2 影像生成模型，提供文生圖、圖生圖、多輪對話等豐富功能。

## 概述

ComfyUI-Nano-Banana-apiyi 是社群使用者貢獻的 ComfyUI 自定義節點集合，專為 API易 使用者打造。它讓你在 ComfyUI 工作流中直接呼叫谷歌最強影像生成模型 Nano Banana Pro 和 Nano Banana 2，**無需配置谷歌雲賬號**，只需 API易 金鑰即可開始創作。

<Info>
  **專案資訊**

  * 🔗 開源地址：`github.com/pdmaker/ComfyUI-Nano-Banana-apiyi`
  * 📜 許可證：MIT
  * 👤 作者：社群貢獻（原作者倉庫已刪除，現使用備份倉庫）
  * ⭐ 該專案由社群使用者貢獻，專為 API易 適配
</Info>

## 為什麼選擇這個節點

<CardGroup cols={2}>
  <Card title="零門檻接入" icon="key">
    無需谷歌雲賬號，使用 API易 金鑰即可呼叫 Nano Banana Pro 和 Nano Banana 2 模型
  </Card>

  <Card title="多模態生圖" icon="images">
    支援文生圖、圖生圖、多圖融合（最多 14 張參考圖），滿足各類創作需求
  </Card>

  <Card title="多輪對話編輯" icon="messages-square">
    獨創對話式影像生成，支援上下文記憶，逐步迭代最佳化圖片效果
  </Card>

  <Card title="超高解析度" icon="expand">
    支援 512px、1K、2K、4K 輸出，14 種寬高比，覆蓋海報、桌布、社交媒體等各種場景
  </Card>
</CardGroup>

## 支援的 API易 模型

| 模型名稱            | 模型標識                             | 特點                  | API文件                                         |
| --------------- | -------------------------------- | ------------------- | --------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview`     | 旗艦畫質，功能全面           | [檢視文件](/api-capabilities/nano-banana-image)   |
| Nano Banana 2   | `gemini-3.1-flash-image-preview` | Pro 級畫質 + Flash 級速度 | [檢視文件](/api-capabilities/nano-banana-2-image) |

<Tip>
  **模型怎麼選？** 追求極致畫質選 Nano Banana Pro；追求價效比和速度選 Nano Banana 2（低至 \$0.025/張）。兩個模型都可以在同一個 ComfyUI 工作流中使用。
</Tip>

## 四大核心節點

本外掛提供 4 個功能節點，覆蓋不同的使用場景：

| 節點名稱                              | 對應模型  | 核心能力                      | 適合場景   |
| --------------------------------- | ----- | ------------------------- | ------ |
| **Nano Banana AIO**               | Pro   | 文生圖 + 圖生圖（1-6張參考圖）+ 搜尋增強  | 高品質創作  |
| **Nano Banana Multi-Turn Chat**   | Pro   | 多輪對話式影像編輯                 | 迭代最佳化  |
| **Nano Banana 2 AIO**             | Flash | 文生圖 + 圖生圖（最多14張參考圖）+ 影像搜尋 | 快速批次生圖 |
| **Nano Banana 2 Multi-Turn Chat** | Flash | 多輪對話式編輯 + 極端寬高比           | 快速迭代   |

## 從零開始：安裝與配置

<Steps>
  <Step title="第一步：確認環境">
    請確保你的電腦已安裝以下軟體：

    * **ComfyUI**（最新版本）— 如未安裝，參考：`github.com/comfyanonymous/ComfyUI`
    * **Python 3.12+**
    * **Git**

    <Warning>
      Python 版本必須 3.12 或更高，低版本可能導致依賴安裝失敗。
    </Warning>
  </Step>

  <Step title="第二步：下載節點程式碼">
    開啟終端，進入 ComfyUI 的自定義節點目錄，克隆倉庫：

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/pdmaker/ComfyUI-Nano-Banana-apiyi.git
    ```
  </Step>

  <Step title="第三步：安裝依賴">
    進入外掛目錄，安裝所需依賴：

    ```bash theme={null}
    cd ComfyUI-Nano-Banana-apiyi
    pip3 install -r requirements.txt
    ```

    如果要使用 Nano Banana 2 節點，還需額外安裝：

    ```bash theme={null}
    pip3 install google-genai --upgrade
    ```
  </Step>

  <Step title="第四步：獲取 API易 金鑰">
    1. 訪問 [API易控制台](https://api.apiyi.com) 註冊/登入
    2. 進入【令牌】欄目
    3. 點選生成新的 API 金鑰
    4. 複製金鑰（以 `sk-` 開頭）備用

    <Info>
      新使用者註冊即可獲得免費測試額度，足夠體驗 Nano Banana 影像生成功能。
    </Info>
  </Step>

  <Step title="第五步：配置環境變數">
    在外掛目錄中，複製模板檔案並填入金鑰：

    ```bash theme={null}
    cp .env.api.template .env
    ```

    編輯 `.env` 檔案，填入你的 API易 金鑰和 Base URL：

    ```bash theme={null}
    GOOGLE_API_KEY=sk-你的API易金鑰
    CUSTOM_BASE_URL=https://api.apiyi.com
    ```

    <Tip>
      **關鍵配置**：`CUSTOM_BASE_URL` 必須設為 `https://api.apiyi.com`，這樣所有請求會通過 API易 轉發，無需谷歌雲賬號。程式碼會自動拼接正確的 API 版本路徑。
    </Tip>
  </Step>

  <Step title="第六步：重啟 ComfyUI 並驗證">
    重啟 ComfyUI 後，在節點列表中搜索 `Nano Banana`，你應該能看到 4 個新節點：

    * Nano Banana AIO
    * Nano Banana Multi-Turn Chat
    * Nano Banana 2 AIO
    * Nano Banana 2 Multi-Turn Chat

    如果能看到這些節點，說明安裝成功！
  </Step>
</Steps>

## 實戰教程：從文字到圖片

### 場景一：文字生成圖片（最基礎）

這是最簡單的用法——輸入一段文字描述，生成一張圖片。

<Steps>
  <Step title="新增節點">
    在 ComfyUI 畫布上右鍵，搜尋並新增 **Nano Banana AIO** 節點（或 Nano Banana 2 AIO）。
  </Step>

  <Step title="填寫提示詞">
    在 `prompt` 輸入框中填寫你想要的圖片描述，例如：

    ```
    一隻橘貓坐在窗臺上，窗外是東京夜景，賽博朋克風格，霓虹燈光，高細節，電影質感
    ```
  </Step>

  <Step title="設定引數">
    * **image\_count**：生成圖片數量（1-10張）
    * **aspect\_ratio**：選擇寬高比，如 `16:9`（橫屏桌布）或 `9:16`（手機桌布）
    * **image\_size**：選擇解析度，推薦 `2K` 或 `4K`
    * **temperature**：創意程度，0.0 最保守，2.0 最天馬行空
  </Step>

  <Step title="執行工作流">
    點選 ComfyUI 的 **Queue Prompt** 按鈕，等待幾秒即可看到生成的圖片。
  </Step>
</Steps>

### 場景二：圖片編輯與融合

使用參考圖片來引導生成，適合風格遷移、元素融合等高階用法。

1. 將 **Nano Banana AIO** 節點的 `image_1` 到 `image_6` 輸入端連線你的參考圖片
2. 在 `prompt` 中描述你想要的效果，例如："將這張照片轉換為水彩畫風格"
3. 模型會結合參考圖片和文字描述生成新圖片

<Tip>
  **Nano Banana 2 AIO 獨家能力**：支援最多 14 張參考圖（10 張物體 + 4 張角色一致性參考），適合需要保持角色外觀一致的連續創作場景。
</Tip>

### 場景三：多輪對話式編輯

這是 Nano Banana 節點最獨特的功能——像聊天一樣逐步最佳化圖片。

1. 新增 **Nano Banana Multi-Turn Chat** 節點
2. 第一輪：輸入初始描述，生成基礎圖片
3. 第二輪：輸入修改指令，如"把背景換成海邊"
4. 第三輪：繼續最佳化，如"增加夕陽光效"
5. 每一輪都會基於之前的對話記憶進行修改

需要重新開始時，開啟 `reset_chat` 選項清除對話歷史。

## 節點引數詳解

### Nano Banana AIO / Nano Banana 2 AIO

| 引數名                       | 型別      | 必填 | 說明                       |
| ------------------------- | ------- | -- | ------------------------ |
| `prompt`                  | string  | 是  | 圖片描述文本                   |
| `image_count`             | integer | 否  | 生成圖片數量（1-10），預設 1        |
| `aspect_ratio`            | enum    | 否  | 寬高比（11種 / NB2 支援14種）     |
| `image_size`              | enum    | 否  | 解析度：512px（僅NB2）、1K、2K、4K |
| `temperature`             | float   | 否  | 創意溫度 0.0-2.0             |
| `use_search`              | boolean | 否  | 啟用 Google 搜尋增強           |
| `image_1` \~ `image_6/14` | image   | 否  | 參考圖片輸入                   |

### 支援的寬高比

| 標準寬高比（兩個節點共享）       | Nano Banana 2 獨有 |
| ------------------- | ---------------- |
| 1:1、2:3、3:2、3:4、4:3 | 1:4（超長豎圖）        |
| 4:5、5:4、9:16、16:9   | 4:1（超寬橫圖）        |
| 21:9、Auto（AI自動選擇）   | 1:8、8:1（極端比例）    |

## 常見問題

<AccordionGroup>
  <Accordion title="安裝後在 ComfyUI 中找不到節點怎麼辦？">
    請逐項檢查：

    1. 外掛資料夾是否在 `ComfyUI/custom_nodes/` 目錄下
    2. 是否執行了 `pip3 install -r requirements.txt`
    3. 使用 Nano Banana 2 節點需額外執行 `pip install google-genai --upgrade`
    4. 是否**重啟**了 ComfyUI（不是重新整理網頁，是重啟後端服務）
  </Accordion>

  <Accordion title="生成圖片時報錯 API Key 無效？">
    請確認：

    1. `.env` 檔案中的 `GOOGLE_API_KEY` 填寫的是 API易 金鑰（以 `sk-` 開頭）
    2. `CUSTOM_BASE_URL` 設定為 `https://api.apiyi.com`
    3. API易 賬戶餘額充足（登入控制台檢視）
  </Accordion>

  <Accordion title="生成速度慢或超時？">
    * 4K 解析度生成時間較長，建議先用 1K 除錯效果
    * 多圖生成（image\_count 大於 1）會增加耗時
    * 如果頻繁超時，可嘗試降低解析度或減少生成數量
  </Accordion>

  <Accordion title="Nano Banana Pro 和 Nano Banana 2 該選哪個？">
    * **Nano Banana Pro**（`gemini-3-pro-image-preview`）：畫質更精細，適合高品質創作
    * **Nano Banana 2**（`gemini-3.1-flash-image-preview`）：速度更快、成本更低（\$0.025/張起），支援更多參考圖和極端寬高比
    * 日常創作推薦 Nano Banana 2，追求極致品質選 Pro
  </Accordion>

  <Accordion title="如何獲取 API易 金鑰？">
    訪問 [API易控制台](https://api.apiyi.com/token)，註冊賬號後在【令牌】欄目生成新的金鑰。新使用者有免費測試額度。
  </Accordion>

  <Accordion title="圖片生成失敗，提示內容安全限制？">
    Nano Banana 模型內建內容安全檢查，部分描述可能觸發限制。建議：

    1. 調整提示詞，避免敏感內容
    2. 檢視 [Nano Banana 生圖失敗排查](/zh-Hant/faq/nano-banana-image-failure) 獲取更多幫助
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="Nano Banana Pro 文件" icon="banana" href="/api-capabilities/nano-banana-image">
    檢視 Nano Banana Pro 完整 API 文件和定價
  </Card>

  <Card title="Nano Banana 2 文件" icon="banana" href="/api-capabilities/nano-banana-2-image">
    檢視 Nano Banana 2 完整 API 文件和定價
  </Card>

  <Card title="生圖失敗排查" icon="circle-question-mark" href="/zh-Hant/faq/nano-banana-image-failure">
    Nano Banana 生圖常見問題排查指南
  </Card>

  <Card title="API易-令牌管理" icon="settings" href="https://api.apiyi.com/token">
    管理 API 金鑰、檢視用量和餘額
  </Card>
</CardGroup>
