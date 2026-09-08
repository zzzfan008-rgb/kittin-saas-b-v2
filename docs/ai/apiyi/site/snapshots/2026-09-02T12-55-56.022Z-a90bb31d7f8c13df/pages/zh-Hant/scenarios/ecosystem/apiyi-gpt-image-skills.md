> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI GPT-Image 2 生圖 Skills

> 社群開源的雙 Skill 合集：在 Codex CLI、Cursor、Gemini CLI 等 AI 程式設計工具中一句話呼叫 gpt-image-2（官轉）與 gpt-image-2-all（官逆）生圖與改圖。

## 概述

`apiyi-gpt-image-2-gen` 與 `apiyi-gpt-image-2-all-gen` 是社群使用者 wuchubuzai2018 貢獻的兩個開源 AI Agent Skill，讓你在 **Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp** 等支援 Skills 的 AI 程式設計工具中，通過一句自然語言呼叫 API易 的兩款 OpenAI GPT 影像模型 —— **官轉 `gpt-image-2`**（精細可控、按 token 計費、支援 4K）與 **官逆 `gpt-image-2-all`**（對話式、按次計費、ChatGPT 一致體驗）。

<Info>
  **專案資訊**

  * 🔗 開源地址：`github.com/wuchubuzai2018/expert-skills-hub`
  * 📦 Skill 標識：`apiyi-gpt-image-2-gen`（官轉）、`apiyi-gpt-image-2-all-gen`（官逆）
  * 👤 作者：wuchubuzai2018（無處不在的技術）
  * ⭐ 該專案由社群使用者貢獻，與同作者的 [Nano Banana Pro 生圖 Skill](/zh-Hant/scenarios/ecosystem/nano-banana-skill) 屬於同一 Skills 合集倉庫
</Info>

<Tip>
  **兩個 Skill 如何選？**

  * **`apiyi-gpt-image-2-gen`（官轉，推薦）**：可控 `size / quality / output-format / compression`，支援 4K（3840×2160）、自定義尺寸、mask 語義編輯，按 token 計費——適合有明確畫質/尺寸要求的場景
  * **`apiyi-gpt-image-2-all-gen`（官逆）**：僅需 `prompt` + 可選 `response-format`，通過 Prompt 描述尺寸/比例，按次計費（\$0.03 / 次），與 ChatGPT 網頁版體驗一致——適合自然語言直出、文字還原、多輪改圖
  * 完整差異見 [官轉 vs 官逆對比文件](/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="一句話生圖" icon="wand-sparkles">
    在 AI 程式設計助手中直接用中文/英文自然語言描述，即刻生成或編輯圖片
  </Card>

  <Card title="雙模型覆蓋" icon="layers">
    官轉 `gpt-image-2` 與官逆 `gpt-image-2-all` 同時可用，按場景切換
  </Card>

  <Card title="4K + 自定義尺寸（官轉）" icon="image">
    官轉 Skill 支援 1024² / 1536×1024 / 2048² / **3840×2160** 等預設及自定義尺寸
  </Card>

  <Card title="畫質/格式可選（官轉）" icon="sliders-horizontal">
    `quality`（low / medium / high / auto）+ 輸出格式（png / jpeg / webp）+ 壓縮率 0-100
  </Card>

  <Card title="最多 5 張參考圖" icon="images">
    兩個 Skill 均支援最多 5 張參考圖疊加輸入，實現多圖融合與風格遷移
  </Card>

  <Card title="多平臺相容" icon="puzzle">
    Codex CLI / OpenCode / Gemini CLI / GitHub Copilot / Cursor / Amp 均可用
  </Card>

  <Card title="Node.js 與 Python 雙執行時" icon="terminal">
    指令碼同時提供 `generate_image.js` 與 `generate_image.py`
  </Card>

  <Card title="零侵入式配置" icon="key">
    環境變數 `APIYI_API_KEY` 一次設定，全域性可用；也支援 `-k` 命令列臨時覆蓋
  </Card>
</CardGroup>

## 支援的 API易 模型

| 模型名稱                | 模型標識              | 對應 Skill                    | 計費         | API 文件                                                     |
| ------------------- | ----------------- | --------------------------- | ---------- | ---------------------------------------------------------- |
| GPT-Image 2（官轉，推薦）  | `gpt-image-2`     | `apiyi-gpt-image-2-gen`     | 按 token 實計 | [檢視文件](/zh-Hant/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All（官逆） | `gpt-image-2-all` | `apiyi-gpt-image-2-all-gen` | \$0.03 / 次 | [檢視文件](/zh-Hant/api-capabilities/gpt-image-2-all/overview) |

## 快速上手：3 步開始生圖

<Steps>
  <Step title="第一步：獲取 API易 金鑰">
    1. 訪問 [API易控制台](https://api.apiyi.com) 註冊/登入
    2. 進入【令牌】欄目，生成新的 API 金鑰（以 `sk-` 開頭）
    3. 建議單獨建一個帶用量上限的專用金鑰

    <Info>
      新使用者註冊即可獲得免費測試額度，足夠體驗兩款 GPT 影像模型。
    </Info>
  </Step>

  <Step title="第二步：安裝 Skill（按需二選一或全裝）">
    **官轉 `gpt-image-2`（推薦）**：

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill apiyi-gpt-image-2-gen
    ```

    **官逆 `gpt-image-2-all`**：

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill apiyi-gpt-image-2-all-gen
    ```

    <Warning>
      需要 Node.js 環境；Python 指令碼可作為備選執行時。未裝 Node.js 可訪問 `nodejs.org` 下載。
    </Warning>
  </Step>

  <Step title="第三步：配置 API 金鑰">
    設定環境變數（推薦寫入 `~/.zshrc` / `~/.bashrc`）：

    ```bash theme={null}
    export APIYI_API_KEY="sk-你的API易金鑰"
    ```

    Windows PowerShell：

    ```powershell theme={null}
    $env:APIYI_API_KEY="sk-你的API易金鑰"
    ```
  </Step>
</Steps>

配置完成！在支援 Skills 的 AI 程式設計工具中即可通過自然語言觸發兩個 Skill。

## 命令引數詳解

### `apiyi-gpt-image-2-gen`（官轉）

| 引數                     | 縮寫   | 必填 | 說明                                                                                                      | 示例               |
| ---------------------- | ---- | -- | ------------------------------------------------------------------------------------------------------- | ---------------- |
| `--prompt`             | `-p` | 是  | 文生圖描述或編輯指令                                                                                              | `"橘貓在草地上玩耍"`     |
| `--filename`           | `-f` | 否  | 輸出路徑（省略自動生成帶時間戳的名字）                                                                                     | `"cat.png"`      |
| `--size`               | `-s` | 否  | 預設（`1024x1024` / `1536x1024` / `1024x1536` / `2048x2048` / `2048x1152` / `3840x2160` / `2160x3840`）或自定義 | `"2048x1152"`    |
| `--quality`            | `-q` | 否  | `low` / `medium` / `high` / `auto`                                                                      | `"high"`         |
| `--output-format`      | `-o` | 否  | `png`（預設）/ `jpeg` / `webp`                                                                              | `"webp"`         |
| `--output-compression` | `-c` | 否  | 0-100，僅對 jpeg / webp 生效                                                                                 | `80`             |
| `--input-image`        | `-i` | 否  | 參考圖路徑（最多 5 張）                                                                                           | `"portrait.png"` |
| `--api-key`            | `-k` | 否  | 臨時覆蓋環境變數金鑰                                                                                              | `"sk-xxx"`       |

**支援的寬高比**：`1:1`、`3:2`、`2:3`、`16:9`、`9:16`，以及 ≤ 3:1 的自定義比例。

**自定義尺寸約束**：單邊 ≤ 3840px，長寬均為 16 的倍數，總畫素 65.5 萬 – 829.4 萬。

**典型耗時**：120–150 秒 / 請求（4K 複雜場景會更久）。

### `apiyi-gpt-image-2-all-gen`（官逆）

| 引數                  | 縮寫   | 必填 | 說明                                    | 示例                 |
| ------------------- | ---- | -- | ------------------------------------- | ------------------ |
| `--prompt`          | `-p` | 是  | 對話式生圖或編輯指令（尺寸/比例通過 prompt 描述）         | `"橫版 16:9 賽博朋克城市"` |
| `--filename`        | `-f` | 否  | 輸出路徑（省略自動生成帶時間戳的 PNG）                 | `"city.png"`       |
| `--response-format` | `-r` | 否  | `url`（預設，R2 CDN 約 24h 有效）或 `b64_json` | `"b64_json"`       |
| `--input-image`     | `-i` | 否  | 參考圖路徑（最多 5 張）                         | `"ref.png"`        |
| `--api-key`         | `-k` | 否  | 臨時覆蓋環境變數金鑰                            | `"sk-xxx"`         |

<Info>
  官逆 Skill **不支援** `size` / `quality` / `aspect_ratio` 命令列引數 —— 這些都通過 prompt 文字描述（如 `"豎版 9:16 手機海報"`、`"1024x1024 方圖"`）。耗時 60–300 秒。
</Info>

## 使用示例

### 示例 1：官轉文生圖 + 精細控制

```bash theme={null}
node scripts/generate_image.js \
  -p "Cinematic product shot of a minimalist ceramic teacup, soft morning light, 35mm lens" \
  -f "teacup.png" \
  -s "3840x2160" \
  -q "high" \
  -o "png"
```

### 示例 2：官轉圖生圖（參考圖編輯）

```bash theme={null}
node scripts/generate_image.js \
  -p "把背景換成夕陽海灘，人物保持不變" \
  -i "portrait.png" \
  -f "portrait-beach.jpg" \
  -s "2048x1152" \
  -q "high" \
  -o "jpeg" \
  -c 85
```

### 示例 3：官轉多圖融合

```bash theme={null}
node scripts/generate_image.js \
  -p "把圖 1 的人物放進圖 2 的場景，光線參考圖 3" \
  -i person.png scene.png light.png \
  -f merged.png \
  -q high
```

### 示例 4：官逆對話式生圖（尺寸通過 prompt）

```bash theme={null}
node scripts/generate_image.js \
  -p "橫版 16:9 電影畫幅：一位穿漢服的少女站在櫻花樹下，水彩畫風格，柔和光線" \
  -f "sakura.png" \
  -r url
```

### 示例 5：在 AI 程式設計工具中呼叫

安裝後，直接對 AI 助手說（以 Cursor / Codex CLI 為例）：

* "用 apiyi-gpt-image-2-gen 生成一張 3840x2160、high 品質的賽博朋克城市桌布"
* "呼叫 apiyi-gpt-image-2-all-gen，把 photo.jpg 改成吉卜力動畫風格"
* "用官轉 Skill 生成一張 logo，1:1，high 品質，webp 格式"

AI 助手會自動識別 Skill 並拼好命令列引數。

## 常見問題

<AccordionGroup>
  <Accordion title="兩個 Skill 如何選？">
    * 需要**精確尺寸**（如 3840×2160）、**可控畫質**（low/medium/high）、**特定輸出格式**（webp / 壓縮）→ 選 **官轉 `apiyi-gpt-image-2-gen`**
    * 需要**與 ChatGPT 一致的對話式體驗**、**按次固定計費**（\$0.03 / 次）、**強文字還原**、**自然語言描述尺寸**即可 → 選 **官逆 `apiyi-gpt-image-2-all-gen`**
    * 完整差異參考 [官轉 vs 官逆對比文件](/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="安裝 npx skills 報錯？">
    1. 確認已安裝 Node.js（`node -v`）
    2. 網路通暢，能訪問 GitHub
    3. 若 `npx skills` 不可用，可手動克隆倉庫：

    ```bash theme={null}
    git clone https://github.com/wuchubuzai2018/expert-skills-hub.git
    ```

    然後將 `skills/apiyi-gpt-image-2-gen` 或 `skills/apiyi-gpt-image-2-all-gen` 目錄複製到你的 Skills 目錄。
  </Accordion>

  <Accordion title="報錯 API Key 無效？">
    1. 環境變數 `APIYI_API_KEY` 是否正確（以 `sk-` 開頭）
    2. 餘額是否充足，可參考 [為什麼還有餘額跑不通](/zh-Hant/faq/balance-insufficient)
    3. 臨時測試可用 `-k "sk-xxx"` 直接傳入
  </Accordion>

  <Accordion title="官轉 Skill 的自定義尺寸報錯？">
    自定義 `size` 需滿足：

    * 單邊不超過 3840px
    * 長寬均為 16 的整數倍
    * 總畫素在 65.5 萬 – 829.4 萬之間
      例如 `2048x3072` 合法，`3000x2000` 因 3000 非 16 倍數會被拒。
  </Accordion>

  <Accordion title="官逆 Skill 的 URL 返回多久失效？">
    官逆預設返回的 R2 CDN URL 約 **24 小時** 有效。生產場景建議傳 `-r b64_json` 取 Base64 自行落盤，或立即下載到本地。
  </Accordion>

  <Accordion title="支援哪些 AI 程式設計工具？">
    目前已適配：Codex CLI、OpenCode、Gemini CLI、GitHub Copilot、Cursor、Amp。任何支援 Skills 協議的工具都可以呼叫。
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="gpt-image-2（官轉）文件" icon="book" href="/zh-Hant/api-capabilities/gpt-image-2/overview">
    原生 2K/4K 生圖，按 token 計費
  </Card>

  <Card title="gpt-image-2-all（官逆）文件" icon="book" href="/zh-Hant/api-capabilities/gpt-image-2-all/overview">
    ChatGPT 一致體驗，\$0.03 / 次按次計費
  </Card>

  <Card title="官轉 vs 官逆 對比" icon="scale" href="/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    17 個維度一表看清差異
  </Card>

  <Card title="Nano Banana Pro 生圖 Skill（同作者）" icon="puzzle" href="/zh-Hant/scenarios/ecosystem/nano-banana-skill">
    同一 Skills 合集下的 Gemini 生圖 Skill
  </Card>

  <Card title="Luck GPT-Image 2 ComfyUI 節點" icon="workflow" href="/zh-Hant/scenarios/ecosystem/luckgpt2-comfyui">
    同模型的 ComfyUI 節點方案
  </Card>

  <Card title="API易控制台" icon="settings" href="https://www.apiyi.com">
    管理金鑰、用量與分組
  </Card>
</CardGroup>
