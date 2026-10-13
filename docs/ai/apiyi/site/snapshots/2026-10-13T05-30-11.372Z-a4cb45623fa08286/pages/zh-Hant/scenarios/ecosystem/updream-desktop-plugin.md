> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Updream 桌面端接入 API易

> 通過 hellojint/updream-openai-compatible-plugin 外掛，把 Updream 桌面端 v0.2.0 的圖片生成任務轉發到 APIYI 的 OpenAI 相容影像介面，適合需要在本地執行任務、本地持有憑據的場景。

## 概述

`hellojint/updream-openai-compatible-plugin`（GitHub） 是一款面向 **Updream 桌面端 v0.2.0** 的開源圖片生成外掛，以 **通用 OpenAI 相容圖片** 協議工作。安裝後可以把桌面端的圖片生成請求轉發到滿足 OpenAI Images 介面規範的第三方 API 上游，**APIYI 在 API 路徑上即滿足此條件**。

<Info>
  **專案資訊**

  * 開源地址：`github.com/hellojint/updream-openai-compatible-plugin`
  * 許可證：MIT
  * 作者：hellojint
  * 外掛包名：`updream-openai-compatible-v1.updplugin`
  * 基於：Updream 官方外掛開發指南里的 OpenAI image-provider 示例
</Info>

<Tip>
  **兩種接入方式**

  如果你不需要"本地執行任務 / 本地持有憑據"這類場景，**優先使用 Updream 網頁端**：
  [Updream 接入 API易（網頁端）](/zh-Hant/scenarios/agent/updream)。網頁端通過 **"外部模型直連器" Skill + OpenAI 相容** 協議接入 APIYI，**無需安裝任何外掛**，是大多數使用者的推薦路徑。

  本文件介紹的桌面端 + 外掛路徑適合需要在本地持有 API Key、批次執行圖片生成任務、或在 Web 端遇到 OpenAI Images 協議限制時的場景。
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="通用 OpenAI 相容協議" icon="workflow">
    適用任何暴露 `/v1/images/generations`、鑑權使用 `Bearer` 的上游，APIYI 滿足此條件
  </Card>

  <Card title="桌面端本地執行" icon="monitor">
    任務在 Updream 桌面端 v0.2.0 本地執行，結果回到 Web 端畫布
  </Card>

  <Card title="API-Key 本地儲存" icon="key">
    Key 由 Updream 在系統金鑰鏈儲存，執行時讀取；外掛本身不含任何憑據
  </Card>

  <Card title="多 Provider 共存" icon="layers">
    桌面端可同時配置多個 Provider（如 openai、apiyi-相容），按需切換
  </Card>

  <Card title="尺寸自動對映" icon="ratio">
    桌面端清晰度 + 比例自動對映成上游 `size` 引數；也支援 `extra.size` 硬寫覆蓋
  </Card>

  <Card title="多種返回格式" icon="image">
    相容 `data[].url` / `data[].b64_json` / 頂層 `url` 等多種返回結構，MIME 自動嗅探
  </Card>
</CardGroup>

## 支援的 APIYI 模型示例

下表給出在 **Endpoint ID** 欄位可填的常見影像模型 ID，僅作示例：

| 模型名稱 | 模型標識 | 用途 |
| - | - | - |
| GPT Image（示例） | `gpt-image-1` | 高品質影像生成 |
| GPT Image v2（示例） | `gpt-image-2` | 最新一代（具體可用性以 APIYI 當前模型文件為準） |
| Nano Banana（示例） | `nano-banana` | Google 系影像模型 |
| Gemini Flash Image（作者截圖示例） | `gemini-3.1-flash-image` | 快速生成、成本更低 |

> 實際可用模型請以 [APIYI 模型推薦](/zh-Hant/api-capabilities/model-info) 為準，本表僅展示外掛能寫入的欄位格式。

## 外掛配置引數

外掛載入到桌面端後，在「新增 API-Key」表單裡有以下欄位：

| 欄位 | 必填 | 說明 |
| - | - | - |
| **配置名稱** | 是 | 自定義名稱，例如 `apiyi-相容`，用於在 Provider 列表裡區分 |
| **協議型別** | 是 | 選擇 **通用 OpenAI 相容圖片** |
| **生成型別** | 是 | 選擇 `image` |
| **API-Key** | 是 | APIYI 平臺 Key，由 Updream 在系統金鑰鏈中儲存，執行時讀取 |
| **API 地址** | 是 | 上游 Base URL，APIYI 填 `https://api.apiyi.com/v1` |
| **模型** | 是 | 預設 `（跟 Endpoint ID 保持一致）`，也可顯式選某項 |
| **Endpoint ID** | 否 | 填寫則 **覆蓋** 模型欄位作為最終 `model` 值；通常填模型 ID 字串 |
| **使用代理** | 否 | 通過全域性代理訪問 Provider；按需勾選 |

<Warning>
  API Key 屬於敏感憑證。**不要把真實金鑰寫進任何截圖、文件、Issue、README、聊天中**。建議在 [APIYI 控制台](https://www.apiyi.com) 為桌面端專門建立帶用量上限的 Key，任務完成後及時撤銷或刪除。
</Warning>

## 安裝與配置（按圖步驟）

### 第 0 步：桌面端整體認識

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-task-overview.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=b2431a85db7a53efd727fad1b51cf896" alt="Updream 桌面端任務總覽（v0.2.0）" width="1200" height="811" data-path="images/updream-desktop-task-overview.png" />

桌面端 v0.2.0 預設佈局：左側「本地執行」任務列表、頂部「同步 / 新增 Key / 匯入外掛 / 外掛管理」、右下角版本號 `v0.2.0`。

### 第一步：匯入外掛

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-import-plugin.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=8f63d49aa37892c70145edcf2bb03300" alt="桌面端頂部「匯入外掛」入口" width="1194" height="70" data-path="images/updream-desktop-import-plugin.png" />

點選頂部「**匯入外掛**」按鈕。在彈出的檔案選擇對話方塊中，選中下載好的 `updream-openai-compatible-v1.updplugin`，**按提示確認安裝**。外掛作者建議先稽核 `plugin.py` 後再確認安裝。

### 第二步：確認外掛安裝成功

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-plugin-installed.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=d0a9cd5d819da625a4cb95a13fb1309e" alt="外掛安裝後狀態" width="609" height="169" data-path="images/updream-desktop-plugin-installed.png" />

在「外掛管理」頁可以看到已安裝的 **通用 OpenAI 相容圖片**（`universal-openai-compatible-image · v1.0.0 · image`）。此時已具備桌面端呼叫任意 OpenAI Images 相容上游的能力。

### 第三步：新增 Key

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-add-key.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=720b99501217ca1651ba3676211c0b94" alt="桌面端「新增 Key」入口" width="1193" height="144" data-path="images/updream-desktop-add-key.png" />

點選頂部「**新增 Key**」按鈕，進入配置表單。

### 第四步：配置 APIYI

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-config-apiyi.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=3c52f8755f39c1d6330ec97772e4484a" alt="APIYI 配置示例" width="514" height="668" data-path="images/updream-desktop-config-apiyi.png" />

按圖中示例填入：

| 欄位 | 示例值 |
| - | - |
| 配置名稱 | `apiyi-相容` |
| 協議型別 | 通用 OpenAI 相容圖片 |
| 生成型別 | `image` |
| API-Key | 你的 APIYI 平臺 Key（執行時讀取，不入程式碼） |
| API 地址 | `https://api.apiyi.com/v1` |
| 模型 | 預設（跟 Endpoint ID 保持一致） |
| Endpoint ID | `gemini-3.1-flash-image`（來自 APIYI 模型文件） |

填寫後點擊「**測試連線**」「**測試生成**」驗證顯示 **連線成功！API 可用**，再儲存。

### 第五步：確認 Provider 已啟用

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-desktop-provider-list.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=1357b08d7da971ce18923f71e62e1d80" alt="Provider 列表" width="807" height="407" data-path="images/updream-desktop-provider-list.png" />

「配置」頁的 Provider 列表裡會出現新加的 `apiyi-相容`，供應商標識為 `plugin:universal-openai-compatible-image`，狀態 **啟用**。可在多條 Provider 之間按需切換 / 停用。

<Tip>
  桌面端配置完成後，請重新進入 Updream **Web 端**，在畫布節點的圖片生成 Provider 下拉里選擇 `apiyi-相容`，即可從 Web 端發起任務、由桌面端執行。
</Tip>

## 使用：Web → 桌面端 → Web 閉環

完成上面 5 步之後，從 Updream **Web 端**發起一次圖片生成，桌面端會按 `apiyi-相容` 這個 Provider 的配置，把請求轉發到 `https://api.apiyi.com/v1/images/generations`，結果回到 Web 端畫布節點。

<img src="https://mintcdn.com/apiyillc/qGgX6ULIrTylbfdH/images/updream-web-recv-from-desktop.png?fit=max&auto=format&n=qGgX6ULIrTylbfdH&q=85&s=383de779592d3d3a270db2ca330bd158" alt="Web 端接收來自桌面端的生成結果" width="891" height="611" data-path="images/updream-web-recv-from-desktop.png" />

圖中畫布下方面板：`圖片生成` + `apiyi-相容`（箭頭位置）+ `16:9 / 2K / ×1` 等輸出引數。這是一張從 Updream Web 端發起、由桌面端執行、最終回到 Web 端畫布的可視結果。

## 常見問題

<AccordionGroup>
  <Accordion title="桌面端看不到「匯入外掛」按鈕？">
    請確認桌面端版本 **≥ v0.2.0**。早期版本可能沒有外掛載入能力，需要先升級 Updream 桌面端。
  </Accordion>

  <Accordion title="匯入外掛後，配置表單裡沒有「通用 OpenAI 相容圖片」選項？">
    1. 確認 `.updplugin` 包根目錄直接包含 `plugin.py`，與 `manifest.entry` 一致
    2. 重啟桌面端
    3. 在「外掛管理」頁確認外掛狀態不是「已停用」
  </Accordion>

  <Accordion title="測試連線成功但生成失敗？">
    1. 檢查 **Endpoint ID** 是否拼寫正確，且在 APIYI 當前模型列表裡
    2. 檢查賬戶餘額是否充足（參考 [為什麼還有餘額跑不通](/zh-Hant/faq/balance-insufficient)）
    3. 在桌面端「本地執行」頁檢視具體錯誤碼
  </Accordion>

  <Accordion title="為什麼桌面端能呼叫，Web 端用同一個 Provider 不行？">
    Web 端不走本外掛。請使用 Web 端的「外部模型直連器」Skill + OpenAI 相容協議配置，或參考 [Updream 接入 API易（網頁端）](/zh-Hant/scenarios/agent/updream)。
  </Accordion>

  <Accordion title="外掛包如何重新打包？">
    修改 `manifest.json.version` 後重新打包：

    ```bash theme={null}
    zip -r updream-openai-compatible-v1.updplugin plugin.py manifest.json README.md
    ```

    注意 ZIP 根目錄必須直接包含 `plugin.py`。
  </Accordion>

  <Accordion title="API Key 是否會進入外掛程式碼或日誌？">
    不會。本外掛 **不含任何憑據**，Key 由 Updream 在系統金鑰鏈儲存，執行時通過 `cfg.get('api_key')` 讀取；不要把真實 Key 寫進 `plugin.py`、README、Issue 或聊天中。
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="Updream 接入 API易（網頁端，推薦）" icon="globe" href="/zh-Hant/scenarios/agent/updream">
    網頁端通過「外部模型直連器」Skill 接入 APIYI，無需安裝外掛
  </Card>

  <Card title="hellojint/updream-openai-compatible-plugin" icon="github">
    本文件對應外掛的開源倉庫（MIT 許可）：`github.com/hellojint/updream-openai-compatible-plugin`
  </Card>

  <Card title="APIYI 模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
    檢視 APIYI 當前支援的影像模型與定價
  </Card>

  <Card title="APIYI API 金鑰管理" icon="key" href="/zh-Hant/faq/token-management">
    獲取和管理 API Key 的最佳實踐
  </Card>

  <Card title="APIYI 控制台" icon="settings" href="https://www.apiyi.com">
    建立專用 Key、檢視用量、設定餘額上限
  </Card>

  <Card title="APIYI 接入與呼叫說明" icon="book" href="/zh-Hant/getting-started">
    檢視 API 接入與 OpenAI 相容協議說明
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.