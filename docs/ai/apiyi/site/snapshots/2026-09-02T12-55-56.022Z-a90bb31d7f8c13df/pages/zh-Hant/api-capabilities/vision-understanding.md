> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 影像理解（識圖）API

> 使用 AI 模型進行智慧影像分析和理解，支援物件識別、場景描述、文字提取等功能

API易 提供強大的影像理解能力，支援使用多種先進的 AI 模型對影像進行深度分析和理解。通過統一的 OpenAI API 格式，您可以輕鬆實現影像識別、場景描述、OCR 文字識別等功能。

<Note>
  **🔍 智慧視覺分析**\
  支援物件識別、場景理解、文字提取、情感分析等多種視覺任務，讓 AI 真正"看懂"圖片。
</Note>

## 🌟 核心特性

* **🎯 多模型支援**：Gemini 3 系列、GPT-5 系列、Claude 4 系列等頂級多模態模型
* **📸 靈活輸入**：支援 URL 連結和 Base64 編碼圖片
* **🌏 中文最佳化**：完美支援中文場景理解和文字識別
* **⚡ 快速響應**：高效能推理，秒級返回結果
* **💰 成本可控**：多種模型選擇，滿足不同預算需求

## 📋 支援的視覺模型

以下為當前主流的多模態模型推薦，模型 ID 可能隨版本更新，請以控制台為準。

| 模型名稱                         | 模型 ID                    | 特點             | 推薦場景      |
| ---------------------------- | ------------------------ | -------------- | --------- |
| **Gemini 3.1 Pro Preview** ⭐ | `gemini-3.1-pro-preview` | 最強多模態推理，細節豐富   | 複雜影像/場景分析 |
| **Gemini 3.5 Flash** 🔥      | `gemini-3.5-flash`       | 速度快、價格低，價效比之王  | 即時識圖、批次處理 |
| **GPT-5.5** ⭐                | `gpt-5.5`                | 綜合視覺理解強，穩定可靠   | 通用影像理解    |
| **Claude Opus 4.7**          | `claude-opus-4-7`        | 理解深入，描述精準      | 專業圖文分析    |
| **Claude Sonnet 4.6**        | `claude-sonnet-4-6`      | 效能媲美 Opus，價效比高 | 高性價比識圖    |
| **GPT-4o**                   | `gpt-4o`                 | 經典多模態，成熟穩定     | 通用場景      |
| **Gemini 2.5 Flash**         | `gemini-2.5-flash`       | 超快超便宜，正式版      | 大批次簡單識圖   |

<Info>
  **絕大多數對話模型現已支援多模態識圖**：上表僅為常用推薦，並非全部。GPT-5 系列、Gemini 3 系列、Claude 4 系列、Grok 4、Kimi 等主流模型均已支援影像輸入。

  * ⚠️ 但**同一廠商不同代際並不一致**——`deepseek-v4-pro`、`deepseek-v4-flash`、`glm-5.2` 等仍是純文本模型，傳圖片會報 `Model do not support image input`。判斷某個模型吃不吃圖，以模型詳情頁的「輸入模態」為準，詳見 [文本+出圖能不能一個介面](/zh-Hant/faq/text-and-image-in-one-api)
  * 📚 完整模型清單與特點對比：[當下熱門模型（保持更新）](/zh-Hant/api-capabilities/model-info)
  * 🔗 即時模型列表與價格：[API易控制台定價頁面](https://www.apiyi.com/account/pricing)（以控制台顯示是否支援視覺為準）
</Info>

## 🚀 快速開始

### 1. 基礎示例 - 圖片 URL

```python theme={null}
import requests

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gpt-5.5",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "請詳細描述這張圖片的內容"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/image.jpg"
                    }
                }
            ]
        }
    ]
}

response = requests.post(url, headers=headers, json=payload)
result = response.json()
print(result['choices'][0]['message']['content'])
```

### 2. 本地圖片示例 - Base64 編碼

```python theme={null}
import base64
import requests

def image_to_base64(image_path):
    """將本地圖片轉換為 base64 編碼"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# 讀取本地圖片
base64_image = image_to_base64("path/to/your/image.jpg")

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gemini-3.1-pro-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "分析這張圖片中的所有文字內容"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json()['choices'][0]['message']['content'])
```

### 3. 高階示例 - 多圖對比分析

```python theme={null}
import requests

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gemini-3.1-pro-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "請對比這兩張圖片的差異："},
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/image1.jpg"}
                },
                {
                    "type": "image_url", 
                    "image_url": {"url": "https://example.com/image2.jpg"}
                }
            ]
        }
    ],
    "max_tokens": 1000
}

response = requests.post(url, headers=headers, json=payload)
print(response.json()['choices'][0]['message']['content'])
```

### 4. cURL 示例（命令列）

**圖片 URL 方式**：

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3.1-pro-preview",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "請詳細描述這張圖片的內容" },
          { "type": "image_url", "image_url": { "url": "https://example.com/image.jpg" } }
        ]
      }
    ]
  }'
```

**本地圖片 Base64 方式**（先把圖片編碼成 Base64 再拼進請求體）：

```bash theme={null}
# 1. 將本地圖片轉為 base64（macOS / Linux）
BASE64_IMAGE=$(base64 -i path/to/your/image.jpg | tr -d '\n')

# 2. 通過 data URI 傳入圖片內容
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "分析這張圖片中的所有文字內容" },
          { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,'"$BASE64_IMAGE"'" } }
        ]
      }
    ]
  }'
```

<Tip>
  **推薦優先使用 Base64 方式上傳圖片**：圖片 URL 方式需要伺服器先即時下載該圖片，若圖床響應慢或有訪問限制，就會下載失敗；Base64 把圖片資料直接放進請求體，不依賴任何外部下載，穩定性更高。兩種方式官方均支援，Base64 體積約為原圖的 1.33 倍，大圖建議先適度壓縮再編碼。
</Tip>

### 5. 常見錯誤：圖片 URL 下載超時

使用圖片 URL 方式時，如果收到如下錯誤：

```json theme={null}
{
  "error": {
    "message": "Timeout while downloading ip:port",
    "type": "invalid_request_error",
    "code": "invalid_image_url"
  }
}
```

這表示**伺服器在拉取該圖片 URL 時下載超時**，與模型、金鑰、額度均無關。常見原因：

1. 圖床 / 源站響應慢，或對部分地區網路訪問不友好
2. 圖片體積過大，下載耗時超出限制
3. URL 設有防盜鏈、需要登入或非公開直鏈

**解決方法**：

* ✅ **改用 Base64（data URI）方式上傳**（推薦，見上方示例 2）——圖片資料隨請求體直接提交，徹底繞開下載環節，最穩定
* 更換為響應更快、可公開訪問的圖片直鏈
* 壓縮圖片後重試

### 6. 常見錯誤：invalid base64 data（URL 誤放進 Base64 欄位）

如果收到如下 400 錯誤（以 Claude 系模型為例，其它模型系列文案略有差異，關鍵特徵是 `invalid base64 data`）：

```json theme={null}
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "...source.base64: invalid base64 data"
  },
  "request_id": "req_011CczN..."
}
```

通常是**把圖片 URL 拼進了 data URI 的 Base64 資料位**：

```json theme={null}
// ❌ 錯誤寫法：base64, 後面跟的是圖片連結，不是 Base64 編碼
"image_url": {
  "url": "data:image/jpeg;base64,https://example.com/generations/temp-xxx.jpg"
}
```

`data:image/...;base64,` 字首後面必須是**圖片檔案本身的 Base64 編碼字串**，而不是圖片連結。URL 方式和 Base64 方式是兩種互斥的傳參形式，不能混拼。常見誘因：程式碼裡統一走了 data URI 拼接邏輯，遇到 URL 圖片也直接拼了進去。

**正確寫法對照**：

```json theme={null}
// ✅ 圖片是網路 URL → 直接傳連結，不加任何字首
"image_url": {
  "url": "https://example.com/generations/temp-xxx.jpg"
}

// ✅ 圖片是本地檔案/二進位制 → 先 Base64 編碼，再拼 data URI（見上方示例 2）
"image_url": {
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

<Tip>
  **自檢建議**：傳送前判斷一下圖片來源——字串以 `http` 開頭就走 URL 方式，否則才做 Base64 編碼並拼 data URI。另外，合法的 Base64 字串不會包含 `://`、`?` 等字元，若在 `base64,` 之後看到這些字元，基本可以斷定是把連結拼進去了。
</Tip>

### 7. 常見錯誤：宣告的圖片格式與實際格式不符（media type mismatch）

如果收到如下 400 錯誤（關鍵特徵是 `The image was specified using the image/png media type, but the image appears to be a image/jpeg image`）：

```json theme={null}
{
  "status_code": 400,
  "error": {
    "message": "InvokeModel: operation error Bedrock Runtime: InvokeModel, https response error StatusCode: 400, RequestID: e87a35ed-..., ValidationException: ...source.base64: The image was specified using the image/png media type, but the image appears to be a image/jpeg image"
  }
}
```

**報錯解讀**：這條錯誤來自上游模型服務的入參校驗（示例中的 `Bedrock Runtime: InvokeModel, ValidationException` 表示請求已到達 Claude 系模型的上游通道，在引數校驗階段被拒絕）。它的意思非常直白：

* 你在 data URI 裡**宣告**圖片是 PNG（`data:image/png;base64,...`）
* 但上游解碼 Base64 後檢查檔案頭（magic bytes），發現**實際內容是 JPEG**
* 宣告與實際不一致 → 400 拒絕。Base64 編碼本身沒有問題，問題出在字首裡的 media type 寫錯了

**常見誘因**：

1. **按副檔名推斷 MIME 型別，但副檔名是假的**——檔名叫 `xxx.png`，實際是別人改過後綴的 JPEG（下載工具、聊天軟體、截圖工具都可能幹這事）
2. **程式碼裡寫死了 `image/png`**（或寫死 `image/jpeg`），不管傳什麼圖都用同一個字首
3. 圖片經過某些處理管道後格式變了，但檔名沒變

**解決方法**：不要相信副檔名，按檔案真實內容（檔案頭）判斷 MIME 型別再拼 data URI：

```python theme={null}
import base64

def image_to_data_uri(image_path):
    """按檔案頭識別真實格式，杜絕 media type 與內容不一致"""
    with open(image_path, "rb") as f:
        data = f.read()

    if data[:8] == b"\x89PNG\r\n\x1a\n":
        mime = "image/png"
    elif data[:3] == b"\xff\xd8\xff":
        mime = "image/jpeg"
    elif data[:6] in (b"GIF87a", b"GIF89a"):
        mime = "image/gif"
    elif data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        mime = "image/webp"
    else:
        raise ValueError(f"無法識別的圖片格式: {image_path}")

    return f"data:{mime};base64,{base64.b64encode(data).decode('utf-8')}"
```

也可以用 PIL 重新編碼，一步到位地保證宣告與內容一致（還能順帶壓縮、剝離異常幀）：

```python theme={null}
import base64, io
from PIL import Image

def image_to_data_uri(image_path):
    img = Image.open(image_path)
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=90)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"
```

<Tip>
  **自檢建議**：`file xxx.png`（macOS / Linux 命令列）一秒看出檔案真實格式；Python 裡 `Image.open(path).format` 也能拿到。不同模型系列對 media type 的校驗嚴格程度不同——有的寬鬆放行，Claude 系（尤其經 Bedrock 通道）校驗最嚴。按"宣告必須與內容一致"來寫程式碼，在所有模型上都不會踩坑。
</Tip>

<Warning>
  **GPT-5 系列引數差異**：若把示例中的模型換成 `gpt-5.5` / `gpt-5.4` 等 GPT-5 系列，請注意：

  1. 用 `max_completion_tokens` 替代 `max_tokens`
  2. `temperature` 只支援 `1`（預設即可，不要傳其它值）
  3. 不要傳 `top_p` 引數

  Gemini、Claude 系列則無此限制，可正常使用 `max_tokens`、`temperature` 等引數。
</Warning>

## 🎯 常見應用場景

### 1. 商品識別與分析

```python theme={null}
prompt = """
請分析這張商品圖片，包括：
1. 商品型別和品牌
2. 主要特徵和賣點
3. 適合的目標使用者
4. 建議的營銷文案
"""
```

### 2. 文件 OCR 識別

```python theme={null}
prompt = """
請提取圖片中的所有文字內容，並按照原始格式整理輸出。
如果有表格，請用 Markdown 表格格式呈現。
"""
```

### 3. 醫學影像輔助分析

```python theme={null}
prompt = """
這是一張醫學影像圖片，請：
1. 描述影像的基本資訊（如成像型別、部位等）
2. 標註可見的解剖結構
3. 注意：僅供參考，不作為診斷依據
"""
```

### 4. 安全監控場景分析

```python theme={null}
prompt = """
分析監控畫面，識別：
1. 場景中的人數和位置
2. 是否有異常行為
3. 環境安全隱患
4. 時間戳資訊（如果可見）
"""
```

## 💡 最佳實踐

### 圖片預處理建議

1. **格式支援**：JPEG、PNG、GIF、WebP 等主流格式
2. **大小限制**：建議單張圖片不超過 20MB
3. **解析度**：高解析度圖片會獲得更好的識別效果
4. **壓縮最佳化**：適度壓縮以提高傳輸速度

### 提示詞最佳化

```python theme={null}
# ❌ 不推薦：模糊的提示
prompt = "看看這是什麼"

# ✅ 推薦：具體明確的提示
prompt = """
請從以下幾個方面分析這張圖片：
1. 主要物件：識別圖片中的主要物體或人物
2. 場景環境：描述拍攝地點和環境特徵
3. 色彩構圖：分析配色方案和構圖特點
4. 情感氛圍：圖片傳達的情緒或氛圍
5. 可能用途：這張圖片適合用於什麼場景
"""
```

### 錯誤處理

```python theme={null}
import requests
from requests.exceptions import RequestException

def analyze_image_with_retry(image_url, prompt, max_retries=3):
    """帶重試機制的影像分析函式"""
    for attempt in range(max_retries):
        try:
            response = requests.post(
                "https://api.apiyi.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-5.5",
                    "messages": [{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }]
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                print(f"速率限制，等待後重試... (嘗試 {attempt + 1}/{max_retries})")
                time.sleep(2 ** attempt)  # 指數退避
            else:
                print(f"錯誤: {response.status_code} - {response.text}")
                
        except RequestException as e:
            print(f"請求異常: {e}")
            
    return None
```

## 🔧 高階功能

### 1. 流式輸出

對於長篇分析，可以使用流式輸出獲得更好的使用者體驗：

```python theme={null}
payload = {
    "model": "gpt-5.5",
    "messages": [...],
    "stream": True
}

response = requests.post(url, headers=headers, json=payload, stream=True)
for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))
```

### 2. 多輪對話

保持上下文進行深入分析：

```python theme={null}
messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "這是什麼動物？"},
            {"type": "image_url", "image_url": {"url": "animal.jpg"}}
        ]
    },
    {
        "role": "assistant",
        "content": "這是一隻金毛尋回犬。"
    },
    {
        "role": "user",
        "content": [{"type": "text", "text": "它看起來多大了？健康狀況如何？"}]
    }
]
```

### 3. 結合函式呼叫

```python theme={null}
tools = [
    {
        "type": "function",
        "function": {
            "name": "save_image_analysis",
            "description": "儲存影像分析結果到資料庫",
            "parameters": {
                "type": "object",
                "properties": {
                    "objects": {"type": "array", "items": {"type": "string"}},
                    "scene": {"type": "string"},
                    "text_content": {"type": "string"}
                }
            }
        }
    }
]

payload = {
    "model": "gpt-5.5",
    "messages": messages,
    "tools": tools,
    "tool_choice": "auto"
}
```

## 📊 效能對比

| 模型                     | 響應速度  | 識別準確度 | 中文支援  | 價格   |
| ---------------------- | ----- | ----- | ----- | ---- |
| Gemini 3.1 Pro Preview | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | \$\$ |
| Gemini 3.5 Flash       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐  | \$   |
| GPT-5.5                | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | \$\$ |
| Claude Sonnet 4.6      | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐  | \$\$ |
| Gemini 2.5 Flash       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐  | ⭐⭐⭐⭐  | \$   |

## 🚨 注意事項

1. **隱私保護**：不要上傳包含敏感資訊的圖片
2. **合規使用**：遵守相關法律法規，不用於非法用途
3. **結果驗證**：AI 分析結果僅供參考，重要決策需人工複核
4. **成本控制**：合理選擇模型，避免不必要的開銷

## 🔗 相關資源

* [完整程式碼示例](https://github.com/apiyi-api/ai-api-code-samples/tree/main/Vision-API-OpenAI)
* [API 定價說明](https://api.apiyi.com/account/pricing)

<Note>
  💡 **小貼士**：建議先使用 Gemini 3.5 Flash 或 Gemini 2.5 Flash 等高性價比模型進行測試，確認效果後再切換到 Gemini 3.1 Pro、GPT-5.5 等高階模型進行生產部署。更多可用模型請檢視 [當下熱門模型](/zh-Hant/api-capabilities/model-info) 或 [控制台模型列表](https://www.apiyi.com/account/pricing)。
</Note>
