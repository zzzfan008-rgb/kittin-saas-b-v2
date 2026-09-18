> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro Coze 外掛

> 社群貢獻的 Coze 平臺 Python 外掛，封裝 Nano Banana Pro（Gemini 3 Pro Image）呼叫、錯誤識別與 OSS 上鍊路，讓 Coze 工作流即可完成文生圖、圖生圖與結果直傳。

## 概述

這是一個面向 [Coze 平臺](https://www.coze.cn) 的自定義 Python 外掛，把 API易 的 Nano Banana Pro 模型（`gemini-3-pro-image-preview`）封裝成 Coze 工作流可直接呼叫的節點。外掛內建完整的請求構造、錯誤碼識別、違規內容判定與阿里雲 OSS 上傳鏈路，**返回的是可直接展示的公網 URL**，省去你在 Coze 工作流裡再做一次結果轉發的工作。

<Info>
  **專案資訊**

  * 📦 形態：程式碼包形式分享（**未公開在 GitHub**）
  * 👤 作者：Shuaila1996
  * 🎯 適用平臺：Coze 國內版 / 海外版自定義外掛
  * 🔌 呼叫模型：`gemini-3-pro-image-preview`（API易）
  * 📝 完整程式碼已在下方"外掛完整原始碼"章節提供，可直接複製使用
</Info>

## 核心功能

<CardGroup cols={2}>
  <Card title="文生圖 / 圖生圖統一入口" icon="wand-sparkles">
    根據 `fileurls` 是否為空，自動切換文生圖與改圖模式，無需在 Coze 工作流裡寫兩套節點
  </Card>

  <Card title="多張參考圖改圖" icon="images">
    傳入圖片 URL 列表後自動下載並以 `inline_data` 方式注入請求，保留原圖細節
  </Card>

  <Card title="精細化錯誤識別" icon="shield-check">
    區分 `ZERO_CANDIDATES_TOKEN`、`FINISH_REASON`、`INLINE_DATA_EMPTY`、`TEXT_RESPONSE` 等多種失敗原因，便於工作流分支處理
  </Card>

  <Card title="違規內容自動歸類" icon="ban">
    遇到水印移除、換臉、色情、超出知識庫年限等任務時，返回明確的拒絕型別而非讓使用者自行猜測
  </Card>

  <Card title="OSS 直傳" icon="cloud-upload">
    生成的 base64 圖片直接上傳阿里雲 OSS，工作流拿到的是可直接外發或入庫的 URL
  </Card>

  <Card title="解析度超時自適應" icon="hourglass">
    1K / 2K / 4K 各自配置獨立超時（360s / 600s / 1200s），4K 高畫質場景也不會被中斷
  </Card>
</CardGroup>

## 支援的 API易 模型

| 模型名稱            | 模型標識                         | 用途      | API 文件                                      |
| --------------- | ---------------------------- | ------- | ------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview` | 文生圖、圖生圖 | [檢視文件](/api-capabilities/nano-banana-image) |

<Tip>
  外掛呼叫的是 API易 的 `https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent` 端點（Gemini 原生協議），與官方 Google AI Studio 完全一致，便於複用現成 prompt。
</Tip>

## 外掛架構

<img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/coze-plugin-config.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=7052279e4466fdab5319e94e6a2592fc" alt="Coze 外掛配置示意" width="2550" height="1244" data-path="images/community/coze-feishu/coze-plugin-config.png" />

外掛核心呼叫鏈：

```text theme={null}
Coze 工作流入參 (cleantext / fileurls / aspect_ratio / resolution / apikey)
        ↓
    handler() 入口
        ↓
generate_image()  — 構造 parts + 呼叫 API易 端點
        ↓
   解析候選項 / 兜底錯誤碼
        ↓
upload_base64_to_oss()  — 上傳阿里雲 OSS
        ↓
返回 { analysis, url, error }
```

## 輸入輸出引數

### 入參（`Input`）

| 引數             | 型別        | 必填 | 說明                               |
| -------------- | --------- | -- | -------------------------------- |
| `cleantext`    | string    | 是  | 使用者文字提示詞或編輯指令                    |
| `fileurls`     | string\[] | 否  | 參考圖 URL 列表，留空走文生圖                |
| `aspect_ratio` | string    | 是  | 寬高比，如 `1:1`、`16:9`、`9:16`        |
| `resolution`   | string    | 是  | 解析度，必須大寫：`1K` / `2K` / `4K`      |
| `apikey`       | string    | 是  | API易 金鑰（建議在 Coze 工作流上游分發，按使用者分配） |

### 出參（`Output`）

| 欄位         | 型別             | 說明                       |
| ---------- | -------------- | ------------------------ |
| `analysis` | string         | 狀態文案：`圖片生成成功` / `圖片生成失敗` |
| `url`      | string \| null | 成功時返回 OSS 公網連結           |
| `error`    | string \| null | 失敗時返回友好錯誤描述              |

## 部署步驟

<Steps>
  <Step title="第一步：準備 API易 與 OSS 憑證">
    * 在 [API易控制台](https://api.apiyi.com/token) 申請金鑰（以 `sk-` 開頭）
    * 在阿里雲開通 OSS Bucket，並建立一個 RAM 子賬號，授予該 Bucket 的 `oss:PutObject` 權限
    * 記錄 `AccessKey ID`、`AccessKey Secret`、`Bucket 名稱`、`Endpoint`（如 `oss-cn-beijing.aliyuncs.com`）
  </Step>

  <Step title="第二步：在 Coze 建立自定義外掛">
    1. 進入 Coze 工作臺 → 資源庫 → 建立自定義外掛
    2. 執行模式選擇「雲側外掛 - 在 Coze IDE 中建立」
    3. 工具執行環境選擇 **Python**
    4. 新增依賴包：`requests`、`oss2`
  </Step>

  <Step title="第三步：複製外掛程式碼">
    將下方"外掛完整原始碼"章節的 Python 程式碼完整貼上到 Coze IDE 中，並把程式碼頂部的阿里雲 OSS 配置改成你自己的：

    ```python theme={null}
    # 阿里雲 OSS 配置
    ACCESS_KEY_ID = "你的 AK"
    ACCESS_KEY_SECRET = "你的 SK"
    BUCKET_NAME = "你的 Bucket 名稱"
    ENDPOINT = "oss-cn-beijing.aliyuncs.com"
    ```
  </Step>

  <Step title="第四步：配置後設資料與入參出參">
    按下圖配置 Input / Output 欄位型別與必填項，與程式碼中的 `args.input` 欄位保持一致：

    <img src="https://mintcdn.com/apiyillc/0gOcC2pfH-K9WpaM/images/community/coze-feishu/coze-plugin-metadata.png?fit=max&auto=format&n=0gOcC2pfH-K9WpaM&q=85&s=991fd5bb9fba689f2629b122b274f088" alt="Coze 外掛後設資料配置" width="2478" height="1114" data-path="images/community/coze-feishu/coze-plugin-metadata.png" />
  </Step>

  <Step title="第五步：測試與釋出">
    * 在 Coze IDE 內填入測試引數（建議先用 1K + 簡單 prompt 驗證 OSS 鏈路）
    * 測試通過後點選「釋出」即可在工作流中拖拽使用
  </Step>
</Steps>

## 錯誤碼識別策略

外掛不只判斷 `success=True/False`，還會按以下順序識別失敗原因，便於在 Coze 工作流裡做差異化處理：

| 優先順序 | 錯誤型別                    | 觸發條件                                      | 推薦處理                                  |
| ---- | ----------------------- | ----------------------------------------- | ------------------------------------- |
| 1    | `ZERO_CANDIDATES_TOKEN` | `usageMetadata.candidatesTokenCount == 0` | 提示詞或圖片觸發稽核，建議改寫                       |
| 2    | `NO_CANDIDATES`         | `candidates` 為空                           | 系統出錯，重試                               |
| 3    | `FINISH_REASON`         | `finishReason` 非 `STOP`                   | 按 `PROHIBITED_CONTENT` / `SAFETY` 等對映 |
| 4    | `NO_PARTS`              | `content.parts` 為空                        | 重試                                    |
| 5    | `INLINE_DATA_EMPTY`     | 檢測到 `inlineData` 但 `data` 為空              | 重試或換 prompt                           |
| 6    | `TEXT_RESPONSE`         | 只返回了文本說明                                  | 自動歸類為水印/換臉/色情/年限超出                    |

## 外掛完整原始碼

下面是 `coze-nanobanana-pro.py` 的完整程式碼，可以直接複製到 Coze IDE。**只需修改頂部 4 行 OSS 配置**即可投入使用。

```python coze-nanobanana-pro.py theme={null}
from runtime import Args
from typings.nanobanana_apiyi.nanobanana_apiyi import Input, Output
import requests
import base64
import io
import oss2
import uuid
import re
from datetime import datetime



# 阿里雲 OSS 配置
ACCESS_KEY_ID = ""  #填入自己的阿里雲 Access Key ID
ACCESS_KEY_SECRET = "" #填入自己的阿里雲 Access Key Secret
BUCKET_NAME = "" #填入自己的阿里雲 OSS Bucket 名稱
ENDPOINT = "oss-cn-beijing.aliyuncs.com" #填入自己的阿里雲 OSS Endpoint，例如 "oss-cn-beijing.aliyuncs.com"

# 解析度超時時間
TIMEOUT = {
    "1K": 360,  # 快速預覽
    "2K": 600,  # 推薦使用
    "4K": 1200,  # 超高畫質
}

def upload_base64_to_oss(image_base64: str) -> str:
    """
    將 base64 圖片上傳到阿里雲 OSS 並返回連結
    支援帶 data:image/...;base64, 字首 和 純 base64 兩種情況
    """
    # 去掉 data:image/...;base64, 字首
    base64_str = re.sub(r"^data:image/[^;]+;base64,", "", image_base64)
    image_data = base64.b64decode(base64_str)
    image_io = io.BytesIO(image_data)

    auth = oss2.Auth(ACCESS_KEY_ID, ACCESS_KEY_SECRET)
    bucket = oss2.Bucket(auth, ENDPOINT, BUCKET_NAME)
    object_name = f"coze/generated_{uuid.uuid4().hex}.png"
    bucket.put_object(object_name, image_io)

    return f"https://{BUCKET_NAME}.{ENDPOINT}/{object_name}"

# ==============================
# 工具函式：根據 URL 猜測 MIME 型別
# ==============================

def guess_mime_from_url(url: str) -> str:
    url_lower = url.lower()
    if url_lower.endswith(".png"):
        return "image/png"
    if url_lower.endswith(".jpg") or url_lower.endswith(".jpeg"):
        return "image/jpeg"
    if url_lower.endswith(".webp"):
        return "image/webp"
    if url_lower.endswith(".gif"):
        return "image/gif"
    # 預設
    return "image/png"

# ==============================
# 核心：生成 / 編輯圖片
# ==============================

def generate_image(prompt: str, aspect_ratio: str, resolution: str, apikey:str,apiurl:str,image_urls=None):
    """
    生成 / 編輯圖片的核心函式

    - 如果 image_urls 為空：純文生圖
    - 如果 image_urls 不為空：把 URL 指向的圖片下載下來，按 inline_data 方式傳給 API，實現改圖
    """

    # 組裝 parts
    parts = []

    # 1. 如果有圖片 URL，則按 apiyi 改圖 demo 的方式構造 inline_data
    if image_urls:
        for url in image_urls:
            try:
                resp = requests.get(url, timeout=180)
                if resp.status_code != 200:
                    return {
                        "success": False,
                        "error": f"圖片上傳階段，獲取圖片失敗（{url}）HTTP {resp.status_code}"
                    }

                image_bytes = resp.content
                image_base64 = base64.b64encode(image_bytes).decode("utf-8")
                mime_type = guess_mime_from_url(url)

                parts.append({
                    "inline_data": {
                        "mime_type": mime_type,
                        "data": image_base64
                    }
                })
            except Exception as e:
                return {
                    "success": False,
                    "error": f"圖片上傳階段，獲取圖片失敗（{url}）: {e}"
                }

    # 2. 文字部分（編輯指令或文生圖提示詞）
    #    注意：這裡不再把圖片 URL 塞進 prompt 裡，僅用純文字描述
    if prompt:
        parts.append({"text": prompt})
    else:
        # 沒有文字時給一個預設提示（可按需要修改）
        parts.append({"text": "根據圖片進行合理的編輯生成。"})

    # 3. 構造請求 payload（和官方改圖 demo 一致的結構）
    payload = {
        "contents": [
            {
                "parts": parts
            }
        ],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {
                "aspectRatio": aspect_ratio,
                "image_size": resolution
            }
        }
    }

    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(apiurl, headers=headers, json=payload, timeout=TIMEOUT[resolution])

        # HTTP 非200
        if response.status_code != 200:
            return {"success": False, "error": f"HTTP {response.status_code}: {response.text}"}

        # JSON 解析
        try:
            data = response.json()
        except ValueError:
            return {"success": False, "error": "響應不是有效JSON", "response": (response.text or "")[:500]}

        # 1️⃣ 最高優先順序：candidatesTokenCount
        usage = data.get("usageMetadata") or {}
        if usage.get("candidatesTokenCount") == 0:
            return {
                "success": False,
                "errorType": "ZERO_CANDIDATES_TOKEN",
                "error": "❌ 內容稽核失敗\n您的請求在內容稽核階段被拒絕，請修改提示詞或圖片",
                "response": data
            }

        # 2️⃣ candidates 檢查
        candidates = data.get("candidates")
        if not isinstance(candidates, list) or len(candidates) == 0:
            return {
                "success": False,
                "errorType": "NO_CANDIDATES",
                "error": "系統出錯，請稍後重試",
                "response": data
            }

        candidate = candidates[0] if isinstance(candidates[0], dict) else None
        if candidate is None:
            return {
                "success": False,
                "errorType": "NO_CANDIDATES",
                "error": "系統出錯，請稍後重試（candidates[0]結構異常）",
                "response": data
            }

        # 3️⃣ finishReason
        finish_reason = candidate.get("finishReason")
        if isinstance(finish_reason, str) and finish_reason != "STOP":
            reason_map = {
                "PROHIBITED_CONTENT": "內容違反安全策略，已被拒絕處理",
                "SAFETY": "內容觸發了安全過濾器",
                "RECITATION": "內容可能涉及版權問題",
                "MAX_TOKENS": "內容長度超出限制",
            }
            return {
                "success": False,
                "errorType": "FINISH_REASON",
                "finishReason": finish_reason,
                "error": reason_map.get(finish_reason, f"請求被拒絕：{finish_reason}"),
                "response": data
            }

        # 4️⃣ content.parts
        content = candidate.get("content") or {}
        parts = content.get("parts")
        if not isinstance(parts, list) or len(parts) == 0:
            return {
                "success": False,
                "errorType": "NO_PARTS",
                "error": "生成失敗，請重試（content.parts為空）",
                "response": data
            }

        # 5️⃣ 提取圖片和文本（更精準：識別 inlineData 存在但 data 為空）
        images = []
        texts = []
        saw_inline_but_empty = False

        for i, part in enumerate(parts):
            if not isinstance(part, dict):
                continue

            # 收集 text（即使有 thoughtSignature，也照收）
            t = part.get("text")
            if isinstance(t, str) and t.strip() and not t.startswith("data:image/"):
                texts.append(t.strip())

            # 相容 inlineData / inline_data
            inline = None
            if isinstance(part.get("inlineData"), dict):
                inline = part["inlineData"]
            elif isinstance(part.get("inline_data"), dict):
                inline = part["inline_data"]

            if inline is not None:
                b64 = inline.get("data")
                if not isinstance(b64, str) or not b64.strip():
                    saw_inline_but_empty = True
                    continue
                images.append(b64.strip())

        # ✅ 更精準：inlineData 存在但全都沒 data
        if not images and saw_inline_but_empty:
            return {
                "success": False,
                "errorType": "INLINE_DATA_EMPTY",
                "error": "生成失敗：檢測到 inlineData 但圖片資料為空（inlineData.data為空）",
                "response": data
            }

        # 6️⃣ 有圖片：成功（保持你原來的返回結構）
        if images:
            return {"success": True, "image_data": images[0]}

        # 7️⃣ 無圖片：有文本 -> TEXT_RESPONSE
        if texts:
            text_content = "\n".join(texts)

            # —— 可選：不做函式，直接就地識別型別（想更簡單可刪掉這段 detectedType）——
            low = text_content.lower()
            detected = "general"
            if any(k in low for k in ["watermark", "remove watermark", "去水印", "移除水印", "刪除水印"]):
                detected = "拒絕處理水印任務"
            elif any(k in low for k in ["faceswap", "face swap", "換臉", "deepfake"]):
                detected = "拒絕處理換臉任務"
            elif any(k in low for k in ["sexually", "explicit", "porn", "nude", "nsfw", "色情", "不雅", "裸"]):
                detected = "拒絕色情任務"
            elif any(str(y) in low for y in range(2026, 2101)):
                detected = "拒絕超過知識庫範圍任務"

            return {
                "success": False,
                "errorType": "TEXT_RESPONSE",
                "error": detected,   # 你文件要求：直接展示 API text
                "response": data
            }

        # ✅ 更精準：parts 有結構但既無圖也無文本
        return {
            "success": False,
            "error": "生成失敗：parts存在但未找到圖片資料或文本說明",
            "response": data
        }

    except requests.exceptions.Timeout:
        return {"success": False, "error": f"圖片生成請求超時（超過 {TIMEOUT[resolution]} 秒）"}
    except Exception as e:
        return {"success": False, "error": f"圖片生成請求失敗: {str(e)}"}


# ==============================
# Coze Node 入口
# ==============================

def handler(args: Args[Input]) -> Output:
    """
    Coze / NanobananaPro 節點入口

    - args.input.cleantext: 使用者文字提示詞
    - args.input.fileurls:  使用者上傳圖片的 URL 列表（用於改圖）
    - args.input.aspect_ratio: 寬高比，如 "1:1" / "9:16"
    - args.input.resolution: 解析度，如 "1K" / "2K" / "4K"
    """
    API_URL = "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent"
    API_KEY = args.input.apikey
    cleanttext = args.input.cleantext or ""
    fileurls = args.input.fileurls or []
    aspectratio = args.input.aspect_ratio
    resolution = args.input.resolution
    # - 圖片通過 image_urls 傳入 generate_image，走 inline_data 改圖邏輯
    prompt = cleanttext.strip()

    # 呼叫 Gemini 3 Pro 生成 / 編輯圖片
    # 如果 fileurls 不為空，會按"改圖"模式呼叫

    result = generate_image(prompt, aspectratio, resolution, API_KEY,API_URL,image_urls=fileurls if fileurls else None)

    if result["success"]:
        image_base64 = result["image_data"]
        oss_url = upload_base64_to_oss(image_base64)
        return {"analysis": "圖片生成成功", "url": oss_url, "error": None}
    else:
        return {"analysis": "圖片生成失敗", "url": None, "error": result["error"]}
```

## 在 Coze 工作流中使用

外掛釋出後，在 Coze 工作流編輯器裡拖入外掛節點，按以下方式連線：

```text theme={null}
開始節點 (使用者輸入提示詞 + 圖片)
    ↓
圖片提示詞分離 (程式碼節點)
    ↓
人員 apikey 分離 (字典查詢，按使用者分發 API易 金鑰)
    ↓
nanobanana_apiyi 外掛節點 (本外掛)
    ↓
成功 / 失敗分支
    ↓
結束節點 (輸出 url 或 error)
```

<Tip>
  推薦配合 [飛書多維表格 AI 生圖方案](/zh-Hant/scenarios/ecosystem/feishu-bitable-image-shortcut) 使用，整套方案讓運營/設計同學**在飛書表格裡填提示詞就能批量出圖**，無需開啟任何程式碼。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼不直接返回 base64，而要多走一步 OSS？">
    Coze 工作流後續節點（特別是飛書欄位捷徑）大多需要 **可訪問的 URL** 才能轉換為圖片附件。直接返回 base64 會讓資料在工作流裡反覆傳輸，不僅效能差，飛書側還無法直接渲染。OSS 連結還方便長期歸檔與對外分享。
  </Accordion>

  <Accordion title="OSS 配置可以用環境變數嗎？">
    Coze 自定義外掛目前不支援系統環境變數。推薦做法：把 OSS 憑證寫在程式碼頂部常量，並通過 Coze 的「外掛加密配置」功能保護。如果你的工作流面向多租戶，建議把 OSS 路徑字首也按租戶分目錄寫入。
  </Accordion>

  <Accordion title="apikey 為什麼要從入參傳入而不是寫死？">
    便於按使用者分發不同金鑰。在 Coze 工作流中可以前置一個「人員 apikey 分離」字典節點，按呼叫人姓名匹配對應的 API易 金鑰，方便用量核算與權限控制。
  </Accordion>

  <Accordion title="4K 解析度經常超時？">
    Nano Banana Pro 的 4K 出圖本身需要較長時間（通常 5-15 分鐘）。外掛已為 4K 配置了 1200 秒超時，如果還是超時，建議：

    1. 降級到 2K 除錯 prompt
    2. 檢查 API易 控制台是否有限流
    3. 減少同時呼叫併發數
  </Accordion>

  <Accordion title="錯誤返回 `TEXT_RESPONSE` 怎麼處理？">
    這通常意味著模型拒絕了任務（違規、超出知識庫等），外掛會自動判別型別：水印移除、換臉、色情、年份超出 2025 等。按 `error` 欄位文案展示給使用者即可，**不要重試**——重試結果一致。
  </Accordion>

  <Accordion title="完整原始碼在哪裡？可以直接複製嗎？">
    可以。本文件"外掛完整原始碼"章節提供了 `coze-nanobanana-pro.py` 的完整程式碼（作者 Shuaila1996 貢獻），**只需修改頂部 4 行 OSS 配置**就能直接貼上到 Coze IDE 投入使用，無需額外索取。

    如果你還需要：

    * 飛書欄位捷徑程式碼 → 見 [飛書多維表格 AI 生圖方案](/zh-Hant/scenarios/ecosystem/feishu-bitable-image-shortcut) 中的"飛書欄位捷徑完整原始碼"章節
    * 阿里雲函式計算程式碼 → 同上文件中的"阿里雲函式計算完整原始碼"章節
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="飛書多維表格 AI 生圖方案" icon="table" href="/zh-Hant/scenarios/ecosystem/feishu-bitable-image-shortcut">
    本外掛的最佳搭檔：把整條 Coze 工作流接入飛書多維表格，運營同學填表即可批量出圖
  </Card>

  <Card title="Nano Banana Pro 文件" icon="banana" href="/api-capabilities/nano-banana-image">
    檢視 Nano Banana Pro 完整 API 文件、定價與生圖樣例
  </Card>

  <Card title="生圖失敗排查" icon="circle-question-mark" href="/zh-Hant/faq/nano-banana-image-failure">
    Nano Banana 生圖常見問題排查指南，匹配本外掛的錯誤碼體系
  </Card>

  <Card title="API易控制台" icon="settings" href="https://api.apiyi.com/token">
    管理 API 金鑰、檢視用量與餘額
  </Card>
</CardGroup>
