> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT Image 2 Coze 外掛

> 社群貢獻的 Coze 平臺 Python 外掛，通過 API易 封裝 GPT Image 2 呼叫、錯誤識別與 OSS 上傳鏈路，讓 Coze 工作流即可完成文生圖、圖生圖與結果直傳。

## 概述

這是一個面向 Coze 平臺（`coze.cn`） 的自定義 Python 外掛，通過 **API易** 代理平臺把 OpenAI 的 GPT Image 2 模型（`gpt-image-2`）封裝成 Coze 工作流可直接呼叫的節點。外掛內建完整的請求構造、錯誤碼識別、內容安全過濾判定與阿里雲 OSS 上傳鏈路，**返回的是可直接展示的公網 URL**，省去你在 Coze 工作流裡再做一次結果轉發的工作。

<Info>
  **專案資訊**

  * 📦 形態：程式碼包形式分享（**未公開在 GitHub**）
  * 👤 作者：社群貢獻
  * 🎯 適用平臺：Coze 國內版 / 海外版自定義外掛
  * 🔌 呼叫模型：`gpt-image-2`（API易，2026 年 4 月 21 日釋出）
  * 🌐 代理平臺：[API易](https://api.apiyi.com) — 國內直連，無需科學上網
  * 📝 完整程式碼已在下方"外掛完整原始碼"章節提供，可直接複製使用
</Info>

## 關於 API易 代理平臺

[API易](https://api.apiyi.com) 是 GPT Image 2 的國內代理平臺，提供三條線路共用一套 API Key：

| 域名              | 說明     |
| --------------- | ------ |
| `api.apiyi.com` | 預設線路   |
| `vip.apiyi.com` | VIP 線路 |
| `b.apiyi.com`   | 備用線路   |

API易 提供三種 GPT Image 2 模型接入方式：

| 模型標識              | 渠道             | 計費         | 出圖速度    | 特點                                |
| ----------------- | -------------- | ---------- | ------- | --------------------------------- |
| `gpt-image-2`     | 官轉（官方轉發）       | 按 token 計費 | \~120s  | 完全相容 OpenAI 官方，支援 quality/size/4K |
| `gpt-image-2-all` | 官逆（逆向 ChatGPT） | \$0.03/張   | 30-60s  | 中文友好，通過 Chat 介面呼叫，圖片 URL 直出       |
| `gpt-image-2-vip` | 官逆（Adobe 線）    | \$0.03/張   | 90-150s | 30 檔 size 鎖定，含 4K                 |

> 本外掛預設使用 **`gpt-image-2`（官轉版）**，與 OpenAI 官方 API 完全相容，支援完整的引數控制。如果需要更快速的出圖體驗，可切換到 `gpt-image-2-all` 模式（見後文）。

<Tip>
  在 [API易 控制台](https://api.apiyi.com/token) 申請 API Key（以 `sk-` 開頭），建議設定每日額度限制（如 ¥20-50）以控制成本。
</Tip>

## 核心功能

<CardGroup cols={2}>
  <Card title="文生圖 / 圖生圖統一入口" icon="wand-sparkles">
    根據 fileurls 是否為空，自動切換文生圖（/v1/images/generations）與改圖（/v1/images/edits）模式，無需在 Coze 工作流裡寫兩套節點
  </Card>

  <Card title="國內直連，無需科學上網" icon="bolt">
    全部請求走 API易 代理（api.apiyi.com），國內網路環境直連，延遲低、穩定可靠
  </Card>

  <Card title="多張參考圖改圖" icon="images">
    傳入圖片 URL 列表後自動下載並以 multipart/form-data 檔案上傳方式注入請求，最多支援 16 張參考圖（單張 ≤ 50MB），保留原圖細節
  </Card>

  <Card title="精細化錯誤識別" icon="shield-check">
    區分 MODERATION\_BLOCKED、INVALID\_API\_KEY、RATE\_LIMIT、SERVER\_ERROR、TIMEOUT、NO\_DATA 等多種失敗原因，便於工作流分支處理
  </Card>

  <Card title="內容安全兩階段判定" icon="ban">
    區分輸入階段 moderation\_blocked（400）與輸出階段 content\_filter（200），觸發時返回明確的拒絕文案，避免無效重試
  </Card>

  <Card title="OSS 直傳" icon="cloud-upload">
    生成的 base64 圖片直接上傳阿里雲 OSS，工作流拿到的是可直接外發或入庫的 URL
  </Card>

  <Card title="多引數精細控制" icon="sliders-horizontal">
    支援 quality（low/medium/high/auto）、moderation（auto/low）、output\_format（png/jpeg/webp）等引數，按需調控出圖策略
  </Card>
</CardGroup>

## 支援的模型

| 模型名稱                | 模型標識              | 用途                         | API 文件                                                     |
| ------------------- | ----------------- | -------------------------- | ---------------------------------------------------------- |
| GPT Image 2（官轉）     | `gpt-image-2`     | 文生圖、圖生圖（編輯），完全相容 OpenAI 官方 | [檢視文件](/zh-Hant/api-capabilities/gpt-image-2/overview)     |
| GPT Image 2-All（官逆） | `gpt-image-2-all` | 文生圖、圖生圖，Chat 介面，中文友好       | [檢視文件](/api-capabilities/gpt-image-2-all/chat-completions) |
| GPT Image 2-VIP（官逆） | `gpt-image-2-vip` | 鎖尺寸出圖，支援 30 檔尺寸含 4K        | [檢視文件](/zh-Hant/api-capabilities/gpt-image-2-vip/overview) |

<Tip>
  外掛預設使用 `gpt-image-2`（官轉版），端點為 `https://api.apiyi.com/v1/images/generations`（文生圖）與 `https://api.apiyi.com/v1/images/edits`（圖生圖），需要有效的 API易 API Key（以 `sk-` 開頭）。如需切換線路，可將程式碼中的 `API_BASE` 改為 `https://vip.apiyi.com/v1` 或 `https://b.apiyi.com/v1`。
</Tip>

## GPT Image 2 關鍵特性

| 特性                  | 說明                                                    |
| ------------------- | ----------------------------------------------------- |
| **釋出日**             | 2026 年 4 月 21 日                                       |
| **最大解析度**           | 3840×2160（4K），總畫素 ≤ 8,294,400                         |
| **寬高比**             | 1:1 / 16:9 / 9:16 / 4:3 / 3:2 / 3:1 / 1:3             |
| **品質等級**            | low / medium / high / auto（預設）                        |
| **輸出格式**            | png（預設）/ jpeg / webp                                  |
| **輸出壓縮**            | 0-100（僅 jpeg / webp 生效）                               |
| **背景模式**            | auto / opaque / transparent（模型已支援透明背景，**本外掛暫未開放該入參**） |
| **稽核強度**            | auto（預設）/ low                                         |
| **文字渲染**            | 準確率 > 99%                                             |
| **生成數量**            | 1 張（`n` 僅支援 1）                                        |
| **響應格式**            | b64\_json（純 base64，無 data:image 字首）                   |
| **input\_fidelity** | 已鎖定為 high，**不可傳入**（傳了會 400 報錯）                        |

## API 端點

| 端點                                            | 方法   | Content-Type          | 用途                                      |
| --------------------------------------------- | ---- | --------------------- | --------------------------------------- |
| `https://api.apiyi.com/v1/images/generations` | POST | `application/json`    | 文生圖（純文字 prompt 出圖）                      |
| `https://api.apiyi.com/v1/images/edits`       | POST | `multipart/form-data` | 圖生圖（`-F "image[]=@file"` 上傳參考圖，最多 16 張） |

> 如需切換線路：`https://vip.apiyi.com/v1/...` 或 `https://b.apiyi.com/v1/...`。所有線路功能相同。

## 外掛架構

<img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-architecture.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=50eb8b0eafa03c71cb5a6863af7b872a" alt="GPT Image 2 Coze 外掛架構圖" width="1840" height="2100" data-path="images/coze-gptimage2-architecture.png" />

外掛核心呼叫鏈：

```text theme={null}
Coze 工作流入參 (cleantext / fileurls / aspect_ratio / resolution / quality / apikey)
        ↓
    handler() 入口
        ↓
    判斷是否有參考圖 (fileurls)
        ↓            ↓
   文生圖分支     圖生圖分支
    ↓            ↓
 POST api.apiyi.com/v1/images/generations   POST api.apiyi.com/v1/images/edits
   (application/json)                         (multipart/form-data)
    ↓            ↓
   解析響應 / 兜底錯誤碼
        ↓
upload_base64_to_oss()  — 上傳阿里雲 OSS
        ↓
返回 { analysis, url, error }
```

## 解析度與尺寸參考

外掛根據 `aspect_ratio` 和 `resolution` 自動選擇尺寸（基於 API易 官方預設）：

| 寬高比  | 1K（尺寸 / 畫素）      | 2K（尺寸 / 畫素）      | 4K（尺寸 / 畫素）      |
| ---- | ---------------- | ---------------- | ---------------- |
| 1:1  | 1024×1024 ≈ 1.0M | 2048×2048 ≈ 4.2M | 3840×2160 ≈ 8.3M |
| 16:9 | 1536×1024 ≈ 1.6M | 2048×1152 ≈ 2.4M | 3840×2160 ≈ 8.3M |
| 9:16 | 1024×1536 ≈ 1.6M | 1152×2048 ≈ 2.4M | 2160×3840 ≈ 8.3M |
| 4:3  | 1024×768 ≈ 0.8M  | 2048×1536 ≈ 3.1M | 3264×2448 ≈ 8.0M |
| 3:2  | 1536×1024 ≈ 1.6M | 2048×1360 ≈ 2.8M | 3456×2304 ≈ 8.0M |
| 3:1  | 1536×512 ≈ 0.8M  | 3072×1024 ≈ 3.1M | 3840×1280 ≈ 4.9M |
| 1:3  | 512×1536 ≈ 0.8M  | 1024×3072 ≈ 3.1M | 1280×3840 ≈ 4.9M |

> **約束規則**：所有尺寸邊長可被 16 整除、寬高比 ≤ 3:1、總畫素 ≤ 8,294,400。
>
> **注意**：1:1 在 4K 下輸出為 3840×2160（橫版 16:9），不是正方形——這是 API 限制，此時實際寬高比為 16:9。超過 `2560×1440` 的輸出仍屬實驗性，生產環境推薦優先使用預設尺寸。

## 輸入輸出引數

### 入參（`Input`）

| 引數              | 型別        | 必填 | 預設     | 說明                                                                   |
| --------------- | --------- | -- | ------ | -------------------------------------------------------------------- |
| `cleantext`     | string    | 是  | —      | 使用者文字提示詞或編輯指令（最長 32,000 字元）                                          |
| `fileurls`      | string\[] | 否  | —      | 參考圖 URL 列表，留空走文生圖                                                    |
| `aspect_ratio`  | string    | 是  | —      | 寬高比，如 `1:1`、`16:9`、`9:16`                                            |
| `resolution`    | string    | 是  | —      | 解析度，必須大寫：`1K` / `2K` / `4K`                                          |
| `quality`       | string    | 否  | `auto` | 品質等級：`low` / `medium` / `high` / `auto`                              |
| `moderation`    | string    | 否  | `auto` | 稽核強度：`auto` / `low`（低強度稽核）                                           |
| `output_format` | string    | 否  | `png`  | 輸出格式：`png` / `jpeg` / `webp`                                         |
| `apikey`        | string    | 是  | —      | API易 API Key（以 `sk-` 開頭，在 [API易控制台](https://api.apiyi.com/token) 申請） |

### 出參（`Output`）

| 欄位         | 型別             | 說明                       |
| ---------- | -------------- | ------------------------ |
| `analysis` | string         | 狀態文案：`圖片生成成功` / `圖片生成失敗` |
| `url`      | string \| null | 成功時返回 OSS 公網連結           |
| `error`    | string \| null | 失敗時返回友好錯誤描述              |

## 部署步驟

<Steps>
  <Step title="第一步：準備 API易 API Key 與 OSS 憑證">
    * 在 [API易 控制台](https://api.apiyi.com/token) 申請 API Key（以 `sk-` 開頭），建議設定每日額度限制（如 ¥20-50）
    * 在阿里雲開通 OSS Bucket，並建立一個 RAM 子賬號，授予該 Bucket 的 `oss:PutObject` 權限
    * 記錄 `AccessKey ID`、`AccessKey Secret`、`Bucket 名稱`、`Endpoint`（如 `oss-cn-beijing.aliyuncs.com`）
  </Step>

  <Step title="第二步：在 Coze 外掛市場中搜索並安裝外掛">
    1. 進入 Coze 工作臺 → 外掛 → 外掛市場
    2. 在搜尋框中搜索「GPT Image 2」或「API易」找到此外掛
    3. 點選外掛卡片檢視詳情，確認無誤後點擊「新增」安裝到當前工作空間

           <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-plugin-market.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=58d8111524c893c61aae7c52f4fb68db" alt="Coze 外掛市場搜尋" width="1450" height="738" data-path="images/coze-gptimage2-plugin-market.png" />
  </Step>

  <Step title="第三步：複製外掛程式碼">
    將下方"外掛完整原始碼"章節的 Python 程式碼完整貼上到 Coze IDE 中，並把程式碼頂部的阿里雲 OSS 配置改成你自己的：

    ```python theme={null}
    # API易 線路配置（可選）
    API_BASE = "https://api.apiyi.com/v1"
    # 也可切換為: "https://vip.apiyi.com/v1" 或 "https://b.apiyi.com/v1"

    # 阿里雲 OSS 配置
    ACCESS_KEY_ID = "你的 AK"
    ACCESS_KEY_SECRET = "你的 SK"
    BUCKET_NAME = "你的 Bucket 名稱"
    ENDPOINT = "oss-cn-beijing.aliyuncs.com"
    ```
  </Step>

  <Step title="第四步：配置後設資料與入參出參">
    按下圖配置 Input / Output 欄位型別與必填項，與程式碼中的 `args.input` 欄位保持一致：

    輸入引數配置：

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-basic-info.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=f06e617314b795c936cb5605a28746d0" alt="Coze 外掛基本資訊" width="1611" height="458" data-path="images/coze-gptimage2-basic-info.png" />

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-input-params.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=410d34cca5c9aa191df0add21a51a848" alt="Coze 外掛輸入引數配置" width="1617" height="505" data-path="images/coze-gptimage2-input-params.png" />

    輸出引數配置：

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-output-params-1.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=c590fca7d3196326aebddb3a7dbdefda" alt="Coze 外掛輸出引數配置（上）" width="1606" height="695" data-path="images/coze-gptimage2-output-params-1.png" />

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-output-params-2.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=5546f08b19320ba2f6332555eef8f3c2" alt="Coze 外掛輸出引數配置（下）" width="1577" height="373" data-path="images/coze-gptimage2-output-params-2.png" />
  </Step>

  <Step title="第五步：測試與釋出">
    * 在 Coze IDE 內填入測試引數（建議先用 `quality=low` + `resolution=1K` + 簡單 prompt 驗證 API易 鏈路）
    * 測試通過後點選「釋出」即可在工作流中拖拽使用
  </Step>
</Steps>

## 錯誤碼識別策略

外掛不只判斷 `success=True/False`，還會按以下順序識別失敗原因，便於在 Coze 工作流裡做差異化處理：

| 優先順序 | 錯誤型別                    | 觸發條件                     | 推薦處理                              |
| ---- | ----------------------- | ------------------------ | --------------------------------- |
| 1    | `MODERATION_BLOCKED`    | HTTP 400 / 403，內容安全攔截    | 提示詞或圖片觸發稽核，改寫後重試，**不要用原輸入重試**     |
| 2    | `INVALID_API_KEY`       | HTTP 401                 | 檢查 API易 API Key 是否正確或已過期          |
| 3    | `RATE_LIMIT`            | HTTP 429                 | 請求頻率超限，可嘗試切換線路或降低併發               |
| 4    | `SERVER_ERROR`          | HTTP 500 / 502 / 503     | API易 / OpenAI 服務端故障，退避重試 2-3 次    |
| 5    | `BAD_REQUEST`           | HTTP 400（非 moderation 類） | 檢查引數：尺寸是否合規、是否誤傳了 input\_fidelity |
| 6    | `TIMEOUT`               | 請求超過 quality 對應超時        | 降低 quality 或 resolution 重試        |
| 7    | `NO_DATA`               | 響應中 `data` 為空            | 重試                                |
| 8    | `NO_IMAGE_DATA`         | `b64_json` 欄位為空          | 重試                                |
| 9    | `IMAGE_DOWNLOAD_FAILED` | 參考圖 URL 無法下載             | 檢查 URL 可訪問性                       |
| 10   | `EDIT_FAILED`           | 圖生圖端點返回非 200             | 檢查參考圖格式、數量（≤16張）、單張大小（≤50MB）      |

### 兩階段內容過濾

GPT Image 2 採用**兩階段內容安全過濾**，與 Nano Banana Pro 不同：

```text theme={null}
使用者請求
    ↓
【階段 1: 輸入過濾 Input Filter】
    ├── 被攔 → HTTP 400 / 403（moderation_blocked）
    │          ↑ 改寫 prompt 可解（免費，不計費）
    ├── 通過 ↓
【模型推理生成圖片】（此時已計費）
    ↓
【階段 2: 輸出過濾 Output Filter】
    ├── 被攔 → HTTP 200 但 b64_json 為空（content_filter，已計費）
    ├── 通過 ↓
返回圖片 (HTTP 200)
```

| 維度      | moderation\_blocked | content\_filter |
| ------- | ------------------- | --------------- |
| 觸發階段    | 輸入階段                | 輸出階段            |
| HTTP 狀態 | 400                 | 200             |
| 是否計費    | 否                   | **是**（推理已完成）    |
| 修復方向    | 改寫 prompt 用詞        | 重新設計整個場景        |

### 常見 moderation\_blocked 觸發場景

| # | 場景             | 說明                 |
| - | -------------- | ------------------ |
| 1 | 真實人物肖像 / 名人姓名  | 馬斯克、Taylor Swift 等 |
| 2 | 在世藝術家姓名        | 宮崎駿 = 攔，梵高 = 不攔    |
| 3 | 版權角色 / IP      | 蜘蛛俠、皮卡丘、米老鼠等       |
| 4 | 暴力 / 血腥 / 武器細節 | 自動攔截               |
| 5 | 性暗示 / 暴露服裝     | 比基尼、緊身、性感等描述詞      |
| 6 | 兒童寫實影像         | 近零容忍               |
| 7 | 仇恨符號 / 極端政治    | 自動攔截               |

### API易 特有錯誤

| 錯誤                      | 原因                    | 解決                            |
| ----------------------- | --------------------- | ----------------------------- |
| 401 + `invalid_api_key` | Key 缺少 `sk-` 字首或已過期   | 完整複製 API易 控制台中的 Key           |
| 404 Not Found           | base\_url 漏掉 `/v1` 字尾 | 確保 `https://api.apiyi.com/v1` |
| 429 + 頻繁觸發              | 觸發 API易 限流            | 切換線路重試                        |
| 連線超時                    | DNS / 網路波動            | 嘗試其他線路重試                      |

## 各解析度/品質預計耗時

| 解析度            | 品質     | 預計耗時      | 外掛超時  |
| -------------- | ------ | --------- | ----- |
| 1K (1024×1024) | low    | 3-8 秒     | 180 秒 |
| 1K (1024×1024) | medium | 20-40 秒   | 360 秒 |
| 1K (1024×1024) | high   | 145-280 秒 | 900 秒 |
| 2K (2048×2048) | medium | 80-120 秒  | 360 秒 |
| 2K (2048×2048) | high   | 200-250 秒 | 900 秒 |
| 4K (3840×2160) | medium | 150-200 秒 | 360 秒 |
| 4K (3840×2160) | high   | 300-600 秒 | 900 秒 |

> 建議：日常使用 `resolution=1K + quality=medium`（20-40 秒出圖），最終交付用 `resolution=4K + quality=high`。
>
> `quality=auto`（不傳或傳 auto）時，外掛超時統一按 360 秒處理，API 自行決定實際品質等級。

## 外掛完整原始碼

下面是 `coze-gptimage2.py` 的完整程式碼，可以直接複製到 Coze IDE。**只需修改頂部 OSS 配置**即可投入使用。

```python coze-gptimage2.py theme={null}
from runtime import Args
from typings.gptimage2.gptimage2 import Input, Output
import requests
import base64
import io
import oss2
import uuid
import re


# ╔══════════════════════════════════════════════════════════╗
# ║           API易 線路配置（按需切換）                      ║
# ╚══════════════════════════════════════════════════════════╝
API_BASE = "https://api.apiyi.com/v1"
# 也可切換為: "https://vip.apiyi.com/v1" 或 "https://b.apiyi.com/v1"

# ╔══════════════════════════════════════════════════════════╗
# ║              阿里雲 OSS 配置（請修改為你的值）            ║
# ╚══════════════════════════════════════════════════════════╝
ACCESS_KEY_ID = ""          # 填入你的阿里雲 Access Key ID
ACCESS_KEY_SECRET = ""      # 填入你的阿里雲 Access Key Secret
BUCKET_NAME = ""            # 填入你的阿里雲 OSS Bucket 名稱
ENDPOINT = "oss-cn-beijing.aliyuncs.com"  # 填入你的 OSS Endpoint

# ╔══════════════════════════════════════════════════════════╗
# ║       品質超時配置（GPT Image 2 基於 quality 分級）       ║
# ╚══════════════════════════════════════════════════════════╝
TIMEOUT = {
    "low": 180,     # 低品質快速出圖（3-8 秒實際耗時）
    "medium": 360,  # 中等品質（20-40 秒實際耗時，推薦）
    "high": 900,    # 高品質精細渲染（145-280 秒實際耗時）
}

# ╔══════════════════════════════════════════════════════════╗
# ║     解析度 → 尺寸對映表（寬高比 × 解析度 → W×H）          ║
# ╚══════════════════════════════════════════════════════════╝
RESOLUTION_SIZES = {
    "1:1":  {"1K": "1024x1024", "2K": "2048x2048", "4K": "3840x2160"},
    "16:9": {"1K": "1536x1024", "2K": "2048x1152", "4K": "3840x2160"},
    "9:16": {"1K": "1024x1536", "2K": "1152x2048", "4K": "2160x3840"},
    "4:3":  {"1K": "1024x768",  "2K": "2048x1536", "4K": "3264x2448"},
    "3:2":  {"1K": "1536x1024", "2K": "2048x1360", "4K": "3456x2304"},
    "3:1":  {"1K": "1536x512",  "2K": "3072x1024", "4K": "3840x1280"},
    "1:3":  {"1K": "512x1536",  "2K": "1024x3072", "4K": "1280x3840"},
}


# ==============================
# OSS 上傳工具
# ==============================

def upload_base64_to_oss(image_base64: str) -> str:
    """
    將 base64 圖片上傳到阿里雲 OSS 並返回公網 URL
    支援帶 data:image/...;base64, 字首和純 base64 兩種情況
    """
    base64_str = re.sub(r"^data:image/[^;]+;base64,", "", image_base64)
    image_data = base64.b64decode(base64_str)
    image_io = io.BytesIO(image_data)

    auth = oss2.Auth(ACCESS_KEY_ID, ACCESS_KEY_SECRET)
    bucket = oss2.Bucket(auth, ENDPOINT, BUCKET_NAME)
    object_name = f"coze/gptimage2_{uuid.uuid4().hex}.png"
    bucket.put_object(object_name, image_io)

    return f"https://{BUCKET_NAME}.{ENDPOINT}/{object_name}"


# ==============================
# 工具函式
# ==============================

def get_size(aspect_ratio: str, resolution: str) -> str:
    """根據寬高比和解析度獲取推薦尺寸"""
    ratio_map = RESOLUTION_SIZES.get(aspect_ratio, RESOLUTION_SIZES["1:1"])
    return ratio_map.get(resolution, ratio_map.get("1K", "1024x1024"))


def guess_mime_from_url(url: str) -> str:
    """根據 URL 字尾猜測 MIME 型別"""
    url_lower = url.lower()
    if url_lower.endswith(".png"):
        return "image/png"
    if url_lower.endswith(".jpg") or url_lower.endswith(".jpeg"):
        return "image/jpeg"
    if url_lower.endswith(".webp"):
        return "image/webp"
    if url_lower.endswith(".gif"):
        return "image/gif"
    return "image/png"


# ==============================
# 核心：GPT Image 2 生圖 / 編輯
# ==============================

def generate_image(prompt: str, aspect_ratio: str, resolution: str,
                   quality: str, apikey: str, output_format: str = "png",
                   moderation: str = "auto", image_urls=None):
    """
    GPT Image 2 文生圖 / 圖生圖核心函式

    - image_urls 為空：純文生圖 → API易 /v1/images/generations（JSON）
    - image_urls 不為空：參考圖編輯 → API易 /v1/images/edits（multipart/form-data）
    """

    size = get_size(aspect_ratio, resolution)
    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    # ── 分支 1：有參考圖 → 圖生圖（編輯） ──
    if image_urls:
        return _generate_edit(prompt, size, quality, apikey,
                              output_format, moderation, image_urls, headers)

    # ── 分支 2：無參考圖 → 文生圖（/v1/images/generations，JSON）──
    payload = {
        "model": "gpt-image-2",
        "prompt": prompt,
        "size": size,
    }
    if quality and quality != "auto":
        payload["quality"] = quality
    if output_format and output_format != "png":
        payload["output_format"] = output_format
    if moderation and moderation != "auto":
        payload["moderation"] = moderation

    timeout_seconds = TIMEOUT.get(quality, 360)
    api_url = f"{API_BASE}/images/generations"

    try:
        response = requests.post(
            api_url,
            headers=headers,
            json=payload,
            timeout=timeout_seconds
        )

        # ── HTTP 錯誤分發 ──
        if response.status_code in (400, 403):
            try:
                err_body = response.json()
                err = err_body.get("error", {})
                err_msg = err.get("message", "")
            except Exception:
                err_msg = response.text

            if "moderation" in err_msg.lower() or response.status_code == 403:
                return {
                    "success": False,
                    "errorType": "MODERATION_BLOCKED",
                    "error": "❌ 內容安全稽核不通過\n"
                             "您的提示詞觸發了內容安全策略，"
                             "請修改提示詞後重試（不要用原提示詞重試）",
                }
            return {
                "success": False,
                "errorType": "BAD_REQUEST",
                "error": f"❌ 請求引數錯誤: {err_msg[:500]}\n"
                         "常見原因：誤傳了 input_fidelity，或 background:transparent 配了 output_format:jpeg",
            }

        if response.status_code == 401:
            return {
                "success": False,
                "errorType": "INVALID_API_KEY",
                "error": "❌ API Key 無效\n請檢查您的 API易 API 金鑰是否正確，"
                        "或是否已過期。可在 https://api.apiyi.com/token 檢視",
            }

        if response.status_code == 429:
            return {
                "success": False,
                "errorType": "RATE_LIMIT",
                "error": "❌ 請求頻率超限\nAPI 呼叫過於頻繁，"
                        "可嘗試切換線路或降低併發",
            }

        if response.status_code in (500, 502, 503):
            return {
                "success": False,
                "errorType": "SERVER_ERROR",
                "error": f"❌ 服務端故障（HTTP {response.status_code}），"
                        "請稍後重試或嘗試切換線路",
            }

        if response.status_code != 200:
            return {
                "success": False,
                "errorType": "HTTP_ERROR",
                "error": f"HTTP {response.status_code}: "
                        f"{(response.text or '')[:500]}",
            }

        # ── JSON 解析 ──
        try:
            data = response.json()
        except ValueError:
            return {
                "success": False,
                "errorType": "INVALID_JSON",
                "error": "響應不是有效 JSON",
            }

        images = data.get("data", [])
        if not isinstance(images, list) or len(images) == 0:
            return {
                "success": False,
                "errorType": "NO_DATA",
                "error": "生成失敗：未返回圖片資料（可能觸發了 output filter）",
                "response": data,
            }

        # ── 提取 b64_json（API易 返回純 base64，無 data:image 字首）──
        image_b64 = images[0].get("b64_json", "")
        if not image_b64:
            return {
                "success": False,
                "errorType": "NO_IMAGE_DATA",
                "error": "生成失敗：b64_json 為空（可能被 content_filter 過濾）",
                "response": data,
            }

        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "errorType": "TIMEOUT",
            "error": f"圖片生成請求超時"
                     f"（超過 {timeout_seconds} 秒，"
                     f"當前 quality={quality}）\n"
                     f"建議降低 quality 或 resolution 重試",
        }
    except Exception as e:
        return {
            "success": False,
            "errorType": "EXCEPTION",
            "error": f"圖片生成請求失敗: {str(e)}",
        }


def _generate_edit(prompt: str, size: str, quality: str,
                   apikey: str, output_format: str, moderation: str,
                   image_urls: list, headers: dict):
    """
    GPT Image 2 圖生圖（編輯）子函式
    呼叫 API易 /v1/images/edits 端點（multipart/form-data 方式上傳參考圖）

    注意：API易 的 /v1/images/edits 要求 Content-Type: multipart/form-data，
    通過 -F "image[]=@file" 方式傳圖，不支援 JSON base64 data URI。
    參考圖數量最多 16 張，單張 ≤ 50MB（建議壓到 1.5MB 以內）。
    """

    # ── 下載參考圖到記憶體 ──
    image_files = []
    for i, url in enumerate(image_urls):
        try:
            resp = requests.get(url, timeout=180)
            if resp.status_code != 200:
                return {
                    "success": False,
                    "errorType": "IMAGE_DOWNLOAD_FAILED",
                    "error": f"圖片獲取失敗（{url}）HTTP {resp.status_code}",
                }
            mime = guess_mime_from_url(url)
            ext = mime.split("/")[-1]  # png / jpeg / webp
            if ext == "jpeg":
                ext = "jpg"
            image_files.append(
                ("image[]", (f"image{i}.{ext}", io.BytesIO(resp.content), mime))
            )
        except Exception as e:
            return {
                "success": False,
                "errorType": "IMAGE_DOWNLOAD_FAILED",
                "error": f"圖片獲取失敗（{url}）: {e}",
            }

    # ── 構造 multipart/form-data 請求（-F 方式）──
    form_data = {
        "model": "gpt-image-2",
        "prompt": prompt,
    }
    if size:
        form_data["size"] = size
    if quality and quality != "auto":
        form_data["quality"] = quality
    if output_format and output_format != "png":
        form_data["output_format"] = output_format
    if moderation and moderation != "auto":
        form_data["moderation"] = moderation

    # multipart/form-data 不傳 Content-Type（讓 requests 自動生成 boundary）
    auth_headers = {
        "Authorization": headers["Authorization"],
    }

    timeout_seconds = TIMEOUT.get(quality, 360)
    api_url = f"{API_BASE}/images/edits"

    try:
        response = requests.post(
            api_url,
            headers=auth_headers,
            data=form_data,
            files=image_files,
            timeout=timeout_seconds
        )

        # ── 錯誤處理 ──
        if response.status_code in (400, 403):
            try:
                err = response.json().get("error", {})
                err_msg = err.get("message", "")
            except Exception:
                err_msg = response.text[:500]
            if "moderation" in err_msg.lower() or response.status_code == 403:
                return {
                    "success": False,
                    "errorType": "MODERATION_BLOCKED",
                    "error": "❌ 內容安全稽核不通過",
                }
            return {
                "success": False,
                "errorType": "EDIT_FAILED",
                "error": f"圖片編輯請求引數錯誤: {err_msg[:500]}\n"
                         "常見原因：誤傳了 input_fidelity、"
                         "超過 16 張參考圖或單張超過 50MB",
            }

        if response.status_code == 401:
            return {
                "success": False,
                "errorType": "INVALID_API_KEY",
                "error": "❌ API Key 無效",
            }

        if response.status_code == 429:
            return {
                "success": False,
                "errorType": "RATE_LIMIT",
                "error": "❌ 請求頻率超限，可嘗試切換線路重試",
            }

        if response.status_code in (500, 502, 503):
            return {
                "success": False,
                "errorType": "SERVER_ERROR",
                "error": f"❌ 服務端故障（HTTP {response.status_code}）",
            }

        if response.status_code != 200:
            try:
                err = response.json().get("error", {}).get("message", "")
            except Exception:
                err = response.text[:500]
            return {
                "success": False,
                "errorType": "EDIT_FAILED",
                "error": f"圖片編輯失敗（HTTP {response.status_code}）: {err}",
            }

        # ── 提取圖片（b64_json 是純 base64，無字首）──
        data = response.json()
        images = data.get("data", [])
        if not images:
            return {
                "success": False,
                "errorType": "NO_DATA",
                "error": "編輯結果為空",
            }

        image_b64 = images[0].get("b64_json", "")
        if not image_b64:
            return {
                "success": False,
                "errorType": "NO_IMAGE_DATA",
                "error": "編輯結果圖片資料為空",
            }

        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "errorType": "TIMEOUT",
            "error": f"圖片編輯請求超時（超過 {timeout_seconds} 秒）",
        }
    except Exception as e:
        return {
            "success": False,
            "errorType": "EXCEPTION",
            "error": f"圖片編輯請求失敗: {str(e)}",
        }


# ==============================
# Coze Node 入口
# ==============================

def handler(args: Args[Input]) -> Output:
    """
    Coze / GPT Image 2（API易 代理）節點入口

    - args.input.cleantext:    使用者文字提示詞
    - args.input.fileurls:     參考圖 URL 列表（用於圖生圖）
    - args.input.aspect_ratio: 寬高比，如 "1:1" / "16:9" / "9:16"
    - args.input.resolution:   解析度，如 "1K" / "2K" / "4K"
    - args.input.quality:      品質等級，如 "low" / "medium" / "high"（預設 auto）
    - args.input.moderation:   稽核強度，如 "auto" / "low"（預設 auto）
    - args.input.output_format: 輸出格式，如 "png" / "jpeg" / "webp"（預設 png）
    - args.input.apikey:       API易 API Key（sk-開頭）
    """
    API_KEY = args.input.apikey
    cleantext = args.input.cleantext or ""
    fileurls = args.input.fileurls or []
    aspect_ratio = args.input.aspect_ratio or "1:1"
    resolution = args.input.resolution or "1K"
    quality = getattr(args.input, 'quality', None) or "auto"
    output_format = getattr(args.input, 'output_format', None) or "png"
    moderation = getattr(args.input, 'moderation', None) or "auto"

    prompt = cleantext.strip()
    if not prompt:
        prompt = "根據參考圖片進行合理的編輯與最佳化。"

    # 呼叫 GPT Image 2 生圖 / 編輯
    result = generate_image(
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        resolution=resolution,
        quality=quality,
        apikey=API_KEY,
        output_format=output_format,
        moderation=moderation,
        image_urls=fileurls if fileurls else None
    )

    if result["success"]:
        image_base64 = result["image_data"]
        oss_url = upload_base64_to_oss(image_base64)
        return {
            "analysis": "圖片生成成功",
            "url": oss_url,
            "error": None,
        }
    else:
        return {
            "analysis": "圖片生成失敗",
            "url": None,
            "error": result.get("error", "未知錯誤"),
        }
```

## 可選：gpt-image-2-all 快速模式

如果你需要**更快的出圖速度（30-60s）且不關心尺寸引數控制**，可以將外掛切換為 API易 的 `gpt-image-2-all`（官逆版），通過 Chat Completions 端點呼叫。該模式價格為 \$0.03/張，圖片 URL 直出無需解析 base64。

核心改動（替換 `generate_image` 函式即可）：

```python theme={null}
def generate_image_chat(prompt: str, apikey: str, image_urls=None):
    """
    gpt-image-2-all 快速模式（通過 API易 Chat Completions 端點）
    價格 $0.03/張，出圖 30-60s，尺寸由 prompt 描述驅動
    """
    api_url = f"{API_BASE}/chat/completions"
    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    # 構造訊息
    if image_urls:
        # 圖生圖：多模態 message
        content = [{"type": "text", "text": prompt}]
        for url in image_urls:
            content.append({
                "type": "image_url",
                "image_url": {"url": url}
            })
    else:
        # 文生圖：純文本 message
        content = prompt

    payload = {
        "model": "gpt-image-2-all",
        "messages": [{"role": "user", "content": content}],
    }

    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=300)
        if response.status_code != 200:
            err = response.json().get("error", {}).get("message", response.text)
            return {"success": False, "errorType": "API_ERROR", "error": str(err)[:500]}

        data = response.json()
        content_text = data["choices"][0]["message"]["content"]

        # 從 Markdown ![image](url) 中提取圖片 URL
        match = re.search(r'!\[[^\]]*\]\((.*?)\)', content_text)
        if not match:
            return {"success": False, "errorType": "NO_URL", "error": "未從響應中提取到圖片 URL"}

        image_url = match.group(1)

        # 如果是 base64 data URL，直接使用
        if image_url.startswith("data:image/"):
            return {"success": True, "image_data": image_url.split(",", 1)[1]}

        # 如果是 HTTP URL，下載圖片 → 轉 base64
        img_resp = requests.get(image_url, timeout=60)
        if img_resp.status_code != 200:
            return {"success": False, "errorType": "DOWNLOAD_FAILED", "error": f"下載圖片失敗: HTTP {img_resp.status_code}"}

        image_b64 = base64.b64encode(img_resp.content).decode("utf-8")
        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {"success": False, "errorType": "TIMEOUT", "error": "請求超時"}
    except Exception as e:
        return {"success": False, "errorType": "EXCEPTION", "error": str(e)}
```

> 切換方法：將 `handler()` 中的 `generate_image(...)` 替換為 `generate_image_chat(...)`，入參只需 `prompt`、`apikey`、`fileurls`（可選）。

## 在 Coze 工作流中使用

外掛釋出後，在 Coze 工作流編輯器裡拖入外掛節點，按以下方式連線：

```text theme={null}
開始節點 (使用者輸入提示詞 + 圖片)
    ↓
圖片提示詞分離 (程式碼節點，將使用者訊息拆分為 cleantext 和 fileurls)
    ↓
人員 apikey 分發 (字典查詢，按使用者匹配對應的 API易 API Key)
    ↓
gptimage2 外掛節點 (本外掛)
    ↓
成功 / 失敗分支
    ↓
結束節點 (輸出 url 或 error)
```

<Tip>
  推薦配合 [飛書多維表格 AI 生圖方案](/zh-Hant/scenarios/ecosystem/feishu-bitable-image-shortcut) 使用，整套方案讓運營/設計同學**在飛書表格裡填提示詞就能批量出圖**，無需開啟任何程式碼。只需將方案中的 Nano Banana Pro 外掛替換為本外掛即可。
</Tip>

## 與 Nano Banana Pro 的差異對比

| 維度    | Nano Banana Pro（API易）                         | GPT Image 2（API易）                           |
| ----- | --------------------------------------------- | ------------------------------------------- |
| 模型    | `gemini-3-pro-image-preview`                  | `gpt-image-2`                               |
| 代理平臺  | API易（同一平臺，同一 Key）                             | API易（同一平臺，同一 Key）                           |
| 文生圖介面 | Gemini `generateContent`（JSON）                | `/v1/images/generations`（JSON）              |
| 圖生圖介面 | 同一端點 + inline\_data（JSON）                     | `/v1/images/edits`（**multipart/form-data**） |
| 解析度體系 | 1K / 2K / 4K（固定）                              | 靈活解析度（最大 3840×2160）                         |
| 超時策略  | 按解析度（360s / 600s / 1200s）                     | 按品質（180s / 360s / 900s）                     |
| 內容過濾  | 單階段（ZERO\_CANDIDATES\_TOKEN + TEXT\_RESPONSE） | 兩階段（HTTP 400/403 + content\_filter）         |
| 參考圖數量 | 不限（inline\_data）                              | 最多 16 張                                     |
| 透明背景  | ✅ 支援                                          | ✅ 模型支援（本外掛未開放入參）                            |
| 文字渲染  | 良好                                            | 優秀（>99%）                                    |
| 輸出壓縮  | 不支援                                           | ✅ 支援 jpeg/webp 壓縮                           |
| 稽核控制  | 不支援                                           | ✅ moderation 引數（auto/low）                   |

## 常見問題

<AccordionGroup>
  <Accordion title="完整原始碼在哪裡？可以直接複製嗎？">
    可以。本文件「外掛完整原始碼」章節提供了 `coze-gptimage2.py` 的完整程式碼，**只需修改頂部 OSS 配置和 API\_BASE** 就能直接貼上到 Coze IDE 投入使用，無需額外索取。

    如果你還需要：

    * 飛書欄位捷徑程式碼 → 見 [飛書多維表格 AI 生圖方案](/zh-Hant/scenarios/ecosystem/feishu-bitable-image-shortcut) 中的「飛書欄位捷徑完整原始碼」章節
    * Nano Banana Pro 外掛 → 見 [Nano Banana Pro Coze 外掛](/zh-Hant/scenarios/ecosystem/coze-nanobanana-plugin)
  </Accordion>

  <Accordion title="apikey 為什麼要從入參傳入而不是寫死？">
    便於按使用者分發不同 API易 API Key。在 Coze 工作流中可以前置一個「人員 apikey 分發」字典節點，按呼叫人姓名匹配對應的 API Key，方便用量核算與權限控制。
  </Accordion>

  <Accordion title="API易 API Key 和 OpenAI 官方 Key 有什麼區別？">
    API易 是國內代理平臺，API Key 格式同樣以 `sk-` 開頭，但：

    * 國內直連，無需科學上網
    * 在 [API易控制台](https://api.apiyi.com/token) 申請和管理
    * 支援 daily/monthly 額度限制，方便成本控制
    * 一個 Key 同時支援 Nano Banana Pro 和 GPT Image 2
  </Accordion>

  <Accordion title="三條線路有什麼區別？">
    三條線路功能完全相同，任意一條均可使用，共用同一套 API Key：

    | 域名              | 說明     |
    | --------------- | ------ |
    | `api.apiyi.com` | 預設線路   |
    | `vip.apiyi.com` | VIP 線路 |
    | `b.apiyi.com`   | 備用線路   |

    在程式碼中修改 `API_BASE` 變數即可切換。
  </Accordion>

  <Accordion title="為什麼不直接返回 base64，而要多走一步 OSS？">
    Coze 工作流後續節點（特別是飛書欄位捷徑）大多需要 **可訪問的 URL** 才能轉換為圖片附件。直接返回 base64 會讓資料在工作流裡反覆傳輸，不僅效能差，飛書側還無法直接渲染。OSS 連結還方便長期歸檔與對外分享。
  </Accordion>

  <Accordion title="錯誤返回 MODERATION_BLOCKED 怎麼處理？">
    這表示輸入的 prompt 或參考圖觸發了內容安全過濾。這個錯誤**不需要重試**——重試結果一致。建議：

    1. 改寫 prompt 用詞
    2. 避免真實人物姓名、版權角色名稱、在世藝術家姓名
    3. 避免性暗示、暴力、血腥等敏感描述
  </Accordion>

  <Accordion title="返回 NO_IMAGE_DATA 或 NO_DATA 怎麼排查？">
    這通常意味著模型完成了推理（已計費），但輸出被內容安全過濾器攔截（`content_filter`）。建議：

    1. 重新設計整個視覺場景而非微調措辭
    2. 換一個完全不同的 prompt 方向
    3. 降低 quality 有時可繞過更嚴格的輸出過濾
  </Accordion>

  <Accordion title="high 品質經常超時？">
    GPT Image 2 的 high 品質在 1K 下就需要 145-280 秒，4K 可能超過 600 秒。外掛已為 high 品質配置了 900 秒超時。如果仍然超時，建議：

    1. 先用 `quality=medium` 除錯 prompt
    2. 在 API易 控制台檢查是否有限流
    3. 可嘗試切換線路重試
    4. 減少同時呼叫併發數
    5. 考慮使用 `gpt-image-2-all` 模式（30-60s 出圖）
  </Accordion>

  <Accordion title="支援透明背景嗎？">
    **模型支援，但本外掛目前沒有開放這個入參。** `gpt-image-2` 自 2026-08-21 起支援 `background: "transparent"`，直接調 API 就能拿到帶 alpha 通道的透明底圖，見 [怎麼生成透明背景的圖片](/zh-Hant/faq/image-transparent-background)。

    在外掛裡要透明背景，目前有兩條路：一是自行修改外掛原始碼，在請求體里加上 `"background": "transparent"`（同時確保 `output_format` 是 `png` 或 `webp`）；二是改用 [Nano Banana Pro 外掛](/zh-Hant/scenarios/ecosystem/coze-nanobanana-plugin)。
  </Accordion>

  <Accordion title="支援 thinking 推理深度引數嗎？">
    **不支援。** API易 官轉版 gpt-image-2 的引數列表與 OpenAI 官方不完全一致，`thinking` 引數不在 API易 支援的引數中。如需精細控制出圖品質，請使用 `quality` 引數（low / medium / high / auto）替代。

    其他不支援的引數還包括：

    * `response_format` — 響應固定返回 `b64_json`
    * `n` — 固定為 1
    * `background: "transparent"` — **模型已支援**，但本外掛未開放該入參，需自行改原始碼傳入
    * `input_fidelity` — 已鎖定為 high，**傳了會 400 報錯**
  </Accordion>

  <Accordion title="GPT Image 2 和 Nano Banana Pro 應該選哪個？">
    兩個外掛都使用 **同一個 API易 平臺**，一個 API Key 通用。選擇建議：

    | 場景                | 推薦                                        |
    | ----------------- | ----------------------------------------- |
    | 文字渲染要求高（海報、封面、UI） | GPT Image 2（文字準確率 > 99%）                  |
    | 需要 4K 超高畫質        | GPT Image 2（最大 3840×2160）                 |
    | 需要多張參考圖編輯         | GPT Image 2（最多 16 張）                      |
    | 需要輸出壓縮（減小檔案體積）    | GPT Image 2（支援 jpeg / webp 壓縮）            |
    | 需要透明背景            | 兩者皆可（GPT Image 2 需自行改外掛原始碼傳 `background`） |
    | 預算敏感              | GPT Image 2-All（\$0.03/張）                 |
    | 需要中文友好 prompt     | GPT Image 2-All（官逆版）                      |
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="飛書多維表格 AI 生圖方案" icon="table" href="/zh-Hant/scenarios/ecosystem/feishu-bitable-image-shortcut">
    本外掛的最佳搭檔：把整條 Coze 工作流接入飛書多維表格，運營同學填表即可批量出圖
  </Card>

  <Card title="Nano Banana Pro Coze 外掛" icon="banana" href="/zh-Hant/scenarios/ecosystem/coze-nanobanana-plugin">
    另一套 Coze 生圖方案，基於 Gemini 3 Pro Image，與 GPT Image 2 共用同一個 API易 Key
  </Card>

  <Card title="API易 GPT Image 2 文件" icon="book" href="/zh-Hant/api-capabilities/gpt-image-2/overview">
    API易 官轉版 GPT Image 2 完整文件、引數說明與程式碼示例
  </Card>

  <Card title="API易 GPT Image 2-All 文件" icon="code" href="/api-capabilities/gpt-image-2-all/chat-completions">
    API易 官逆版 Chat Completions 端點文件（\$0.03/張，30-60s 出圖）
  </Card>

  <Card title="API易 控制台" icon="settings" href="https://api.apiyi.com/token">
    管理 API 金鑰、檢視用量與餘額、設定額度限制
  </Card>

  <Card title="GPT Image 2 常見錯誤修復" icon="circle-question-mark" href="https://help.apiyi.com/fix-gpt-image-2-moderation-blocked-400-error.html">
    moderation\_blocked 400 錯誤診斷與規避策略
  </Card>
</CardGroup>
