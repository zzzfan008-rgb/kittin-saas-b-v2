> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro 生圖 Skill

> 社群開源的 AI Agent Skill，支援在 Codex CLI、OpenCode、Gemini CLI、Cursor 等主流 AI 程式設計工具中通過自然語言生成和編輯圖片，基於 API易 呼叫 Nano Banana Pro 模型。

## 概述

nano-banana-pro-image-gen 是一個社群貢獻的開源 AI Agent Skill，讓你在 **Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp** 等主流 AI 程式設計工具中，通過一句自然語言就能生成和編輯圖片。底層呼叫 API易 的 Nano Banana Pro 模型，無需複雜配置，安裝即用。

<Info>
  **專案資訊**

  * 🔗 開源地址：`github.com/wuchubuzai2018/expert-skills-hub`
  * 🌐 Skill 主頁：`skills.sh/wuchubuzai2018/expert-skills-hub/nano-banana-pro-image-gen`
  * 👤 作者：wuchubuzai2018（無處不在的技術）
  * ⭐ 該專案由社群使用者貢獻
</Info>

## 為什麼用這個 Skill

<CardGroup cols={2}>
  <Card title="一句話生圖" icon="wand-sparkles">
    在 AI 程式設計助手中直接用自然語言描述，即刻生成高品質圖片，無需離開編輯器
  </Card>

  <Card title="圖片編輯" icon="square-pen">
    支援傳入已有圖片進行編輯，最多 14 張參考圖，實現風格遷移和內容修改
  </Card>

  <Card title="多平臺相容" icon="puzzle">
    已適配 Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp 等工具
  </Card>

  <Card title="靈活輸出" icon="sliders-horizontal">
    10 種寬高比 + 3 檔解析度（1K/2K/4K），覆蓋從快速預覽到高畫質海報的各種場景
  </Card>
</CardGroup>

## 支援的 API易 模型

| 模型名稱            | 模型標識                         | 用途      | API文件                                       |
| --------------- | ---------------------------- | ------- | ------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | 文生圖、圖生圖 | [檢視文件](/api-capabilities/nano-banana-image) |

<Tip>
  該 Skill 使用 Nano Banana Pro 模型。如果你還需要 Nano Banana 2 的更快速度和更低成本，可以檢視 [Nano Banana ComfyUI 節點](/zh-Hant/scenarios/ecosystem/nano-banana-comfyui)，它同時支援兩個模型。
</Tip>

## 快速上手：3 步開始生圖

<Steps>
  <Step title="第一步：獲取 API易 金鑰">
    1. 訪問 [API易控制台](https://api.apiyi.com) 註冊/登入
    2. 進入【令牌】欄目，生成新的 API 金鑰
    3. 複製金鑰（以 `sk-` 開頭）

    <Info>
      新使用者註冊即可獲得免費測試額度，足夠體驗 Nano Banana 影像生成功能。
    </Info>
  </Step>

  <Step title="第二步：安裝 Skill">
    在終端中執行以下命令安裝：

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill nano-banana-pro-image-gen
    ```

    <Warning>
      需要 Node.js 環境。如未安裝 Node.js，請先訪問 `nodejs.org` 下載安裝。Python 可作為備選執行環境。
    </Warning>
  </Step>

  <Step title="第三步：配置 API 金鑰">
    設定環境變數：

    ```bash theme={null}
    export APIYI_API_KEY="sk-你的API易金鑰"
    ```

    Windows PowerShell 使用者：

    ```powershell theme={null}
    $env:APIYI_API_KEY="sk-你的API易金鑰"
    ```

    <Tip>
      建議將環境變數寫入 `~/.zshrc` 或 `~/.bashrc`，避免每次重新設定。
    </Tip>
  </Step>
</Steps>

配置完成！現在你可以在支援 Skills 的 AI 程式設計工具中直接使用圖片生成功能。

## 實戰教程

### 用法一：命令列文字生圖

最直接的用法——在終端中輸入描述，生成圖片。

<CodeGroup>
  ```bash Node.js（推薦） theme={null}
  node scripts/generate_image.js \
    -p "一隻宇航員貓咪漂浮在太空中，背景是地球，數字藝術風格" \
    -f "astronaut-cat.png" \
    -a 16:9 \
    -r 2K
  ```

  ```bash Python theme={null}
  python scripts/generate_image.py \
    -p "一隻宇航員貓咪漂浮在太空中，背景是地球，數字藝術風格" \
    -f "astronaut-cat.png" \
    -a 16:9 \
    -r 2K
  ```
</CodeGroup>

### 用法二：編輯已有圖片

傳入一張或多張參考圖片，用自然語言描述修改效果。

```bash theme={null}
node scripts/generate_image.js \
  -p "把這張照片轉換為吉卜力動畫風格，保持人物構圖不變" \
  -i "photo.jpg" \
  -f "ghibli-style.png" \
  -r 2K
```

支援多張參考圖（最多 14 張），圖片會自動轉為 Base64 編碼傳送：

```bash theme={null}
node scripts/generate_image.js \
  -p "將這些元素融合成一張海報" \
  -i "bg.jpg" -i "logo.png" -i "text.png" \
  -f "poster.png" \
  -a 3:4 \
  -r 4K
```

### 用法三：在 AI 程式設計助手中使用

安裝 Skill 後，在支援的 AI 程式設計工具中可以直接用自然語言指令：

* **Codex CLI / OpenCode**："幫我生成一張 16:9 的賽博朋克城市桌布，4K 解析度"
* **Cursor**："生成一張產品 logo，簡約風格，1:1 比例"
* **Gemini CLI**："編輯 input.jpg，將背景改為夕陽海灘"

AI 助手會自動呼叫 Skill 完成圖片生成。

## 命令引數詳解

| 引數               | 縮寫   | 必填 | 說明                      | 示例             |
| ---------------- | ---- | -- | ----------------------- | -------------- |
| `--prompt`       | `-p` | 是  | 圖片描述或編輯指令               | `"一隻貓咪"`       |
| `--filename`     | `-f` | 否  | 輸出檔案路徑（省略則自動生成）         | `"output.png"` |
| `--aspect-ratio` | `-a` | 否  | 寬高比                     | `16:9`         |
| `--resolution`   | `-r` | 否  | 解析度（必須大寫）               | `1K`、`2K`、`4K` |
| `--input-image`  | `-i` | 否  | 輸入圖片路徑（可多次指定，最多14張）     | `"photo.jpg"`  |
| `--key`          | `-k` | 否  | 內聯 API Key（不推薦，建議用環境變數） | `"sk-xxx"`     |

### 支援的寬高比

`1:1`、`16:9`、`9:16`、`4:3`、`3:4`、`3:2`、`2:3`、`5:4`、`4:5`、`21:9`

### 解析度與耗時參考

| 解析度    | 大致耗時   | 適合場景      |
| ------ | ------ | --------- |
| 1K     | 約 30 秒 | 快速預覽、測試效果 |
| 2K（預設） | 1-4 分鐘 | 日常使用、社交媒體 |
| 4K     | 較慢     | 高畫質海報、印刷品 |

## 常見問題

<AccordionGroup>
  <Accordion title="安裝時報錯怎麼辦？">
    請檢查：

    1. 是否已安裝 Node.js（執行 `node -v` 確認）
    2. 網路連線是否正常
    3. 如果 npx 命令不可用，可以手動克隆倉庫：

    ```bash theme={null}
    git clone https://github.com/wuchubuzai2018/expert-skills-hub.git
    ```

    然後將 `skills/nano-banana-pro-image-gen` 目錄複製到你的 Skills 目錄中。
  </Accordion>

  <Accordion title="生成圖片時報錯 API Key 無效？">
    請確認：

    1. 環境變數 `APIYI_API_KEY` 已正確設定（以 `sk-` 開頭）
    2. API易 賬戶餘額充足
    3. 也可以使用 `-k` 引數直接傳入金鑰測試
  </Accordion>

  <Accordion title="解析度引數不生效？">
    解析度引數必須使用**大寫**：`1K`、`2K`、`4K`。小寫 `1k`、`2k` 會導致引數無法識別。
  </Accordion>

  <Accordion title="圖片生成很慢怎麼辦？">
    * 4K 解析度本身需要較長處理時間（可能超過 5 分鐘）
    * 建議先用 1K 解析度除錯提示詞和構圖
    * 確認滿意後再用 2K 或 4K 生成最終版本
  </Accordion>

  <Accordion title="如何獲取 API易 金鑰？">
    訪問 [API易控制台](https://api.apiyi.com/token)，註冊賬號後在【令牌】欄目生成新的金鑰。新使用者有免費測試額度。
  </Accordion>

  <Accordion title="支援哪些 AI 程式設計工具？">
    目前已適配：Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp。任何支援 Skills 協議的工具都可以使用。
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="Nano Banana Pro 文件" icon="banana" href="/api-capabilities/nano-banana-image">
    檢視 Nano Banana Pro 完整 API 文件和定價
  </Card>

  <Card title="APIYI GPT-Image 2 Skills（同作者）" icon="puzzle" href="/zh-Hant/scenarios/ecosystem/apiyi-gpt-image-skills">
    wuchubuzai2018 同一 Skills 合集下的 `gpt-image-2` / `gpt-image-2-all` 雙 Skill
  </Card>

  <Card title="Nano Banana ComfyUI 節點" icon="workflow" href="/zh-Hant/scenarios/ecosystem/nano-banana-comfyui">
    在 ComfyUI 中使用 Nano Banana 生圖
  </Card>

  <Card title="生圖失敗排查" icon="circle-question-mark" href="/zh-Hant/faq/nano-banana-image-failure">
    Nano Banana 生圖常見問題排查指南
  </Card>

  <Card title="API易-令牌管理" icon="settings" href="https://api.apiyi.com/token">
    管理 API 金鑰、檢視用量和餘額
  </Card>
</CardGroup>
