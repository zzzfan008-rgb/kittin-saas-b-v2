> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini マルチモーダル入力とコード実行

> 画像、音声、動画を Gemini にインラインで渡します。20MB の上限、media_resolution によるコスト制御、そして code_execution によるサンドボックス化された Python を利用できます。

Gemini のネイティブ形式では、画像、音声、動画を理解と分析のために直接受け付け、サンドボックス内で Python を実行する組み込みの `code_execution` ツールも備えています。以下の例では、[ネイティブ呼び出し](/ja/api-capabilities/gemini/native) のクライアント設定を前提としています。

<Warning>
  **APIYI チャンネルの 2 つの厳しい制限**:

  1. **Files API はサポートされていません** (`client.files.upload()` は Google の公式エンドポイントでのみ動作します) — メディアは **インライン** で渡す必要があります
  2. インライン メディアは **1 ファイルあたり 20MB** までです。大きい場合は、先に圧縮するかフレームを抽出してください
</Warning>

## 画像理解

PIL Image を直接渡します — SDK がエンコードを処理します:

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
        "Describe this image in detail: key elements, colors, composition.",
        img
    ]
)
print(response.text)
```

または、`types.Part.from_bytes` を使ってバイト列を明示的に渡します:

```python theme={null}
from google.genai import types

with open("photo.jpg", "rb") as f:
    image_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
        "What's in this image?"
    ]
)
```

## オーディオ理解

```python theme={null}
from google.genai import types

with open("meeting.mp3", "rb") as f:
    audio_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=audio_bytes, mime_type="audio/mp3"),
        "Transcribe this audio and summarize the main topics."
    ]
)
print(response.text)
```

## 動画理解

```python theme={null}
from google.genai import types

with open("demo.mp4", "rb") as f:
    video_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=video_bytes, mime_type="video/mp4"),
        "Summarize the main content and key information of this video."
    ]
)
print(response.text)
```

動画はフレームごとに音声トラックとあわせてトークン化されます — 長い動画ほどコストが高くなります。その他の動画ワークフロー: [Video Understanding](/ja/api-capabilities/video-understanding).

## media\_resolution によるコスト制御

メディアの token 消費量は解像度に応じて増減します。「粗い見た目」で十分なタスク（分類、存在確認）では、低解像度にすると実際のコストを節約できます。

```python theme={null}
from google.genai import types

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=["What's the theme of this image?", img],
    config=types.GenerateContentConfig(
        media_resolution="MEDIA_RESOLUTION_LOW"  # LOW / MEDIUM / HIGH
    )
)
```

| レベル      | 用途                       |
| -------- | ------------------------ |
| `LOW`    | 分類、粗い認識 — 最も安価           |
| `MEDIUM` | 一般的な説明と理解（バランスの取れたデフォルト） |
| `HIGH`   | OCR、小さな文字、細部の多いタスク       |

## 対応形式

| Type   | Formats        | 渡し方                             |
| ------ | -------------- | ------------------------------- |
| Images | JPG, PNG, WebP | PIL Image または `Part.from_bytes` |
| Audio  | MP3, WAV       | `Part.from_bytes`               |
| Video  | MP4, MOV       | `Part.from_bytes`               |

すべてインラインで、1ファイルあたり最大 20MB です。

## コード実行

`code_execution` ツールを宣言すると、モデルが Python を書き、サンドボックスで実行し、その結果に基づいて回答します。計算やデータ分析に最適です:

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="""
Sales data: Product A 100 units × \$50, Product B 200 × \$30, Product C 150 × \$40.
Compute total revenue, average unit price, and each product's revenue share.
""",
    config={"tools": [{"code_execution": {}}]}
)

for part in response.candidates[0].content.parts:
    if getattr(part, "executable_code", None):
        print(f"[Code executed]\n{part.executable_code.code}")
    if getattr(part, "code_execution_result", None):
        print(f"[Result]\n{part.code_execution_result.output}")
    if getattr(part, "text", None):
        print(f"[Explanation]\n{part.text}")
```

<Info>
  コード実行の制限: Python のみ。サンドボックスにはネットワークアクセスもファイルシステムアクセスもなく、実行時間には上限があります。独自の外部サービスを呼び出すには、[Function Calling](/ja/api-capabilities/gemini/function-calling) を使用してください。
</Info>

## 関連リンク

* このグループ: [Native Calls](/ja/api-capabilities/gemini/native) · [Cache 課金](/ja/api-capabilities/gemini/prompt-caching) · [Function Calling](/ja/api-capabilities/gemini/function-calling)
* ユースケース: [動画理解](/ja/api-capabilities/video-understanding) · [画像理解](/ja/api-capabilities/vision-understanding)
* Google 公式ドキュメント: `ai.google.dev/gemini-api/docs/vision`
