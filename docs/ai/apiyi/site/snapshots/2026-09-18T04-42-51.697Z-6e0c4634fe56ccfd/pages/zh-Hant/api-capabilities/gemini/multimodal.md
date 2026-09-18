> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 多模態輸入與程式碼執行

> 圖片、音訊、影片內聯傳入 Gemini：20MB 限制、media_resolution 控費、code_execution 沙箱執行 Python。

Gemini 原生格式支援直接傳入圖片、音訊、影片做理解分析，並內建 `code_execution` 工具在沙箱裡跑 Python。本頁示例預設使用 [原生呼叫](/zh-Hant/api-capabilities/gemini/native) 的客戶端配置。

<Warning>
  **API易 通道的兩個硬限制**：

  1. **不支援 Files API**（`client.files.upload()` 僅 Google 官方端點可用），媒體一律**內聯傳入**
  2. 內聯媒體**單檔案不超過 20MB**，超過請先壓縮或抽幀
</Warning>

## 圖片理解

圖片可以直接傳 PIL Image 物件，SDK 自動處理編碼：

```python theme={null}
from google import genai
from PIL import Image

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

img = Image.open("photo.jpg")

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        "請詳細描述這張圖片的內容，包括主要元素、顏色、構圖。",
        img
    ]
)
print(response.text)
```

也可以用 `types.Part.from_bytes` 顯式傳入：

```python theme={null}
from google.genai import types

with open("photo.jpg", "rb") as f:
    image_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
        "圖裡有什麼？"
    ]
)
```

## 音訊理解

```python theme={null}
from google.genai import types

with open("meeting.mp3", "rb") as f:
    audio_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=audio_bytes, mime_type="audio/mp3"),
        "請轉錄這段音訊，並總結主要話題。"
    ]
)
print(response.text)
```

## 影片理解

```python theme={null}
from google.genai import types

with open("demo.mp4", "rb") as f:
    video_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=video_bytes, mime_type="video/mp4"),
        "總結這個影片的主要內容和關鍵資訊。"
    ]
)
print(response.text)
```

影片按幀 + 音軌計 tokens，較長影片費用可觀 —— 更多影片場景實踐見 [影片理解](/zh-Hant/api-capabilities/video-understanding)。

## media\_resolution 控費

媒體輸入的 token 消耗和解析度掛鉤。對"看個大概"的任務（分類、是否包含某元素），降解析度能明顯省錢：

```python theme={null}
from google.genai import types

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=["這張圖片的主題是什麼？", img],
    config=types.GenerateContentConfig(
        media_resolution="MEDIA_RESOLUTION_LOW"  # LOW / MEDIUM / HIGH
    )
)
```

| 檔位       | 適用              |
| -------- | --------------- |
| `LOW`    | 分類、粗粒度識別，最省     |
| `MEDIUM` | 一般描述與理解（預設均衡選擇） |
| `HIGH`   | OCR、小字、細節密集型任務  |

## 支援的格式

| 型別 | 格式           | 傳入方式                          |
| -- | ------------ | ----------------------------- |
| 圖片 | JPG、PNG、WebP | PIL Image 或 `Part.from_bytes` |
| 音訊 | MP3、WAV      | `Part.from_bytes`             |
| 影片 | MP4、MOV      | `Part.from_bytes`             |

均為內聯傳入，單檔案不超過 20MB。

## 程式碼執行（code\_execution）

宣告 `code_execution` 工具後，模型會自己寫 Python、在沙箱裡執行、再基於結果回答 —— 適合計算、資料分析類任務：

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="""
有以下銷售資料：產品A 100件×50元、產品B 200件×30元、產品C 150件×40元。
請計算總銷售額和平均單價，並給出各產品銷售額佔比。
""",
    config={"tools": [{"code_execution": {}}]}
)

for part in response.candidates[0].content.parts:
    if getattr(part, "executable_code", None):
        print(f"[執行的程式碼]\n{part.executable_code.code}")
    if getattr(part, "code_execution_result", None):
        print(f"[執行結果]\n{part.code_execution_result.output}")
    if getattr(part, "text", None):
        print(f"[說明]\n{part.text}")
```

<Info>
  程式碼執行的限制：僅 Python；沙箱環境無法訪問網路和你的檔案系統；有執行時長上限。需要呼叫你自己的外部服務時，用 [FC函式呼叫](/zh-Hant/api-capabilities/gemini/function-calling)。
</Info>

## 相關連結

* 同組頁面：[原生呼叫](/zh-Hant/api-capabilities/gemini/native) · [快取計費](/zh-Hant/api-capabilities/gemini/prompt-caching) · [FC函式呼叫](/zh-Hant/api-capabilities/gemini/function-calling)
* 應用場景：[影片理解](/zh-Hant/api-capabilities/video-understanding) · [視覺理解](/zh-Hant/api-capabilities/vision-understanding)
* Google 官方文件：`ai.google.dev/gemini-api/docs/vision`
