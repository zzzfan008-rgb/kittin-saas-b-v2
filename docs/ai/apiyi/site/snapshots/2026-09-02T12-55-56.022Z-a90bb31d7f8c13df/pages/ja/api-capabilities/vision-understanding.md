> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Vision Understanding（画像認識）API

> AIモデルを使って高度な画像分析と理解を行い、物体認識、シーン説明、テキスト抽出などをサポートします

APIYI は強力な画像理解機能を提供し、さまざまな高度な AI モデルを使用して画像の詳細な分析と理解をサポートします。統一された OpenAI API 形式を通じて、画像認識、シーン説明、OCR 文字認識、その他の機能を簡単に実装できます。

<Note>
  **🔍 インテリジェントなビジュアル分析**
  オブジェクト認識、シーン理解、テキスト抽出、感情分析など、さまざまなビジュアルタスクをサポートし、AI が画像を真に「理解」できるようにします。
</Note>

## 🌟 コア機能

* **🎯 マルチモデル対応**: Gemini 3、GPT-5、Claude 4 シリーズなどのトップクラスのマルチモーダルモデルに対応
* **📸 柔軟な入力**: URL リンクと Base64 エンコードされた画像をサポート
* **🌏 中国語最適化**: 中国語のシーン理解とテキスト認識に完全対応
* **⚡ 高速応答**: 秒単位で結果を返す高性能推論
* **💰 コスト管理**: さまざまな予算要件に対応できる複数のモデル विकल्प

## 📋 対応 Vision モデル

以下は現在の主要なマルチモーダル推奨モデルです。モデル ID は新しいリリースで変更される場合があります — 常にコンソールを優先してください。

| モデル名                         | モデル ID                   | 特徴                      | 推奨シナリオ         |
| ---------------------------- | ------------------------ | ----------------------- | -------------- |
| **Gemini 3.1 Pro Preview** ⭐ | `gemini-3.1-pro-preview` | 最も強力なマルチモーダル推論、豊富なディテール | 複雑な画像/シーン解析    |
| **Gemini 3.5 Flash** 🔥      | `gemini-3.5-flash`       | 高速かつ低コストで、コストパフォーマンスが最良 | リアルタイム認識、バッチ処理 |
| **GPT-5.5** ⭐                | `gpt-5.5`                | 総合的な Vision 理解が強く、安定    | 一般的な画像理解       |
| **Claude Opus 4.7**          | `claude-opus-4-7`        | 深い理解、正確な説明              | 専門的な画像+テキスト解析  |
| **Claude Sonnet 4.6**        | `claude-sonnet-4-6`      | Opus に匹敵し、高コストパフォーマンス   | コスト効率の高い認識     |
| **GPT-4o**                   | `gpt-4o`                 | 定番のマルチモーダルで、成熟して安定      | 一般的なシナリオ       |
| **Gemini 2.5 Flash**         | `gemini-2.5-flash`       | 超高速かつ低価格、GA リリース        | 大規模バッチのシンプルな認識 |

<Info>
  **現在、ほとんどの chat モデルがマルチモーダルな画像入力をサポートしています**: 上の表は一般的な推奨例を示しているだけで、全件ではありません。GPT-5、Gemini 3、Claude 4 シリーズ、Grok 4、Kimi を含む主流モデルはすべて画像入力を受け付けます。

  * ⚠️ ただし、**同じベンダーでも世代によって機能は異なります** — `deepseek-v4-pro`、`deepseek-v4-flash`、`glm-5.2` はまだテキストのみで、画像を渡すと `Model do not support image input` が返されます。特定のモデルを確認するには、詳細ページの「入力モダリティ」行を使用してください。詳しくは [1つの API でテキストと画像](/ja/faq/text-and-image-in-one-api) を参照してください
  * 📚 モデル一覧と機能比較の全体版: [人気モデル（継続更新）](/ja/api-capabilities/model-info)
  * 🔗 リアルタイムのモデル一覧と料金: [APIYI コンソール料金ページ](https://www.apiyi.com/account/pricing) （画像対応はコンソールで確認してください）
</Info>

## 🚀 クイックスタート

### 1. 基本例 - 画像URL

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
                    "text": "Please describe this image in detail"
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

### 2. ローカル画像の例 - Base64エンコード

```python theme={null}
import base64
import requests

def image_to_base64(image_path):
    """Convert local image to base64 encoding"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Read local image
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
                    "text": "Analyze all text content in this image"
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

### 3. 上級例 - 複数画像比較

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
                {"type": "text", "text": "Please compare the differences between these two images:"},
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

### 4. cURL の例（コマンドライン）

**画像URL方式**:

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
          { "type": "text", "text": "Please describe this image in detail" },
          { "type": "image_url", "image_url": { "url": "https://example.com/image.jpg" } }
        ]
      }
    ]
  }'
```

**ローカル画像の Base64 方式**（画像を Base64 にエンコードしてから、リクエストボディに埋め込みます）:

```bash theme={null}
# 1. Convert local image to base64 (macOS / Linux)
BASE64_IMAGE=$(base64 -i path/to/your/image.jpg | tr -d '\n')

# 2. Pass the image content via a data URI
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "Analyze all text content in this image" },
          { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,'"$BASE64_IMAGE"'" } }
        ]
      }
    ]
  }'
```

<Tip>
  **信頼性のために Base64 アップロードを推奨します**: 画像URL方式では、サーバーがまず画像をリアルタイムでダウンロードする必要があります。画像ホストの応答が遅い場合やアクセス制限がある場合、ダウンロードに失敗します。Base64 は画像データをリクエストボディに直接埋め込むため、外部ダウンロードに依存せず、より安定しています。どちらの方法も公式にサポートされています。Base64 は元の画像サイズの約 1.33 倍になるため、エンコード前に大きな画像を圧縮することを検討してください。
</Tip>

### 5. よくあるエラー: 画像 URL ダウンロードのタイムアウト

画像 URL 方式を使用すると、次のようなエラーが発生することがあります:

```json theme={null}
{
  "error": {
    "message": "Timeout while downloading ip:port",
    "type": "invalid_request_error",
    "code": "invalid_image_url"
  }
}
```

これは、**サーバーが URL から画像をダウンロードしている途中でタイムアウトした**ことを意味します。モデル、API キー、またはクォータとは関係ありません。主な原因は次のとおりです。

1. 画像ホスト / オリジンサーバーの応答が遅い、または特定のネットワーク地域に対して相性が悪い
2. 画像が大きすぎて、ダウンロードが制限時間を超えてしまう
3. URL にホットリンク保護がある、ログインが必要、または公開された直接リンクではない

**解決策**:

* ✅ **Base64（data URI）アップロードに切り替える**（推奨、上の例 2 を参照）- 画像データをリクエスト本文に直接送信するため、ダウンロード処理を完全に回避でき、最も安定した方法です
* より高速で、公開アクセス可能な画像の直接リンクを使用する
* 画像を圧縮して再試行する

### 6. よくあるエラー: invalid base64 data（Base64 フィールドに URL を誤って入れている）

次のような 400 エラーを受け取った場合（ここでは Claudeシリーズ の文言を示しています。ほかのモデル系列では少し表現が異なりますが、重要な特徴は `invalid base64 data` です）:

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

これは通常、**画像 URL を data URI の Base64 データ欄に貼り付けてしまっている**ことを意味します:

```json theme={null}
// ❌ Wrong: what follows base64, is an image link, not Base64-encoded data
"image_url": {
  "url": "data:image/jpeg;base64,https://example.com/generations/temp-xxx.jpg"
}
```

`data:image/...;base64,` プレフィックスの後ろに続く内容は、画像リンクではなく、**その画像ファイル自体を Base64 エンコードした内容**でなければなりません。URL 方式と Base64 方式は、画像を渡すための相互に排他的な 2 つの方法であり、混在させることはできません。よくある原因は、クライアントコードが常に data URI の連結経路を通るため、リモートの画像 URL まで連結してしまうことです。

**正しい使い方を並べて比較すると**:

```json theme={null}
// ✅ Image is a remote URL → pass the link directly, no prefix at all
"image_url": {
  "url": "https://example.com/generations/temp-xxx.jpg"
}

// ✅ Image is a local file / binary → Base64-encode it first, then build the data URI (see Example 2 above)
"image_url": {
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

<Tip>
  **セルフチェック**: 送信前に画像ソースで判断してください。文字列が `http` で始まるなら URL 方式を使い、それ以外の場合のみ Base64 エンコードして data URI を構築します。また、有効な Base64 文字列には `://` や `?` のような文字は含まれません。`base64,` の後ろにそれらが見える場合は、リンクがほぼ確実に連結されています。
</Tip>

### 7. 宣言されたメディアタイプが実際の画像形式と一致しないときのよくあるエラー

次のような 400 エラーを受け取った場合（重要なシグネチャは `The image was specified using the image/png media type, but the image appears to be a image/jpeg image` です）:

```json theme={null}
{
  "status_code": 400,
  "error": {
    "message": "InvokeModel: operation error Bedrock Runtime: InvokeModel, https response error StatusCode: 400, RequestID: e87a35ed-..., ValidationException: ...source.base64: The image was specified using the image/png media type, but the image appears to be a image/jpeg image"
  }
}
```

**意味**: このエラーは上流のモデルサービスの入力検証から発生しています（例の `Bedrock Runtime: InvokeModel, ValidationException` は、リクエストが Claude 系の上流チャネルに到達し、パラメータ検証の段階で拒否されたことを示しています）。メッセージはかなり文字どおりの意味です:

* data URI が画像を PNG として **宣言している**（`data:image/png;base64,...`）
* しかし Base64 をデコードした後、上流はファイルヘッダー（マジックバイト）を確認し、**実際の内容は JPEG** だと判断した
* 宣言と内容が不一致 → 400。Base64 エンコード自体は問題ありません。間違っているのはプレフィックス内のメディアタイプです

**よくある原因**:

1. **ファイル拡張子から MIME タイプを推測したが、その拡張子が嘘だった** — ファイル名は `xxx.png` でも、実際は拡張子だけを付け替えた JPEG です（ダウンロードツール、チャットアプリ、スクリーンショットツールはどれもこれを行います）
2. クライアントコードで **`image/png`（または `image/jpeg`）をハードコード** しており、すべての画像に形式に関係なく同じプレフィックスを付けている
3. 画像が処理パイプラインを通る間に形式が変わったのに、ファイル名はそのままだった

**修正方法**: 拡張子を信用せず、data URI を組み立てる前にファイルのマジックバイトから本当の MIME タイプを判定してください:

```python theme={null}
import base64

def image_to_data_uri(image_path):
    """Detect the real format from magic bytes so the media type always matches the content"""
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
        raise ValueError(f"Unrecognized image format: {image_path}")

    return f"data:{mime};base64,{base64.b64encode(data).decode('utf-8')}"
```

あるいは、PIL で再エンコードしてください。これなら 1 回で宣言と内容の一致を保証でき、途中で圧縮したり、変なフレームを除去したりすることもできます:

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
  **自己確認**: `file xxx.png`（macOS / Linux のコマンドライン）なら、1 秒でファイルの本当の形式を確認できます。Python では、`Image.open(path).format` でも同じことができます。モデルシリーズごとにメディアタイプの検証の厳しさは異なり、緩く通すものもあれば、Claude シリーズ（特に Bedrock チャネル経由）が最も厳格です。宣言が常に内容と一致するようにコードを書いておけば、どのモデルでも安全です。
</Tip>

<Warning>
  **GPT-5 シリーズのパラメータ差分**: 例を `gpt-5.5` / `gpt-5.4` のような GPT-5 シリーズモデルに切り替える場合は、次の点に注意してください:

  1. `max_tokens` の代わりに `max_completion_tokens` を使います
  2. `temperature` は `1` のみをサポートします（デフォルトのままにして、他の値は渡さないでください）
  3. `top_p` パラメータは渡さないでください

  Gemini と Claude シリーズにはそのような制限はなく、`max_tokens`、`temperature` などでも通常どおり動作します。
</Warning>

## 🎯 よくあるユースケース

### 1. 製品認識と分析

```python theme={null}
prompt = """
Please analyze this product image, including:
1. Product type and brand
2. Main features and selling points
3. Suitable target audience
4. Suggested marketing copy
"""
```

### 2. 文書OCR認識

```python theme={null}
prompt = """
Please extract all text content from the image and organize it in the original format.
If there are tables, please present them in Markdown table format.
"""
```

### 3. 医療画像支援

```python theme={null}
prompt = """
This is a medical imaging picture, please:
1. Describe basic image information (such as imaging type, body part, etc.)
2. Label visible anatomical structures
3. Note: For reference only, not for diagnostic purposes
"""
```

### 4. セキュリティ監視分析

```python theme={null}
prompt = """
Analyze the surveillance footage to identify:
1. Number of people and their positions in the scene
2. Any abnormal behavior
3. Environmental safety hazards
4. Timestamp information (if visible)
"""
```

## 💡 ベストプラクティス

### 画像前処理の推奨事項

1. **形式のサポート**: JPEG、PNG、GIF、WebP などの一般的な形式
2. **サイズ上限**: 1枚あたり20MB未満を推奨
3. **解像度**: 高解像度の画像ほど認識精度が向上します
4. **圧縮**: 転送速度を改善するために適度に圧縮します

### プロンプト最適化

```python theme={null}
# ❌ Not Recommended: Vague prompt
prompt = "What is this"

# ✅ Recommended: Specific and clear prompt
prompt = """
Please analyze this image from the following aspects:
1. Main Objects: Identify main objects or people in the image
2. Scene Environment: Describe the shooting location and environmental features
3. Color Composition: Analyze color scheme and composition characteristics
4. Emotional Atmosphere: Emotions or atmosphere conveyed by the image
5. Possible Uses: What scenarios this image is suitable for
"""
```

### エラーハンドリング

```python theme={null}
import requests
from requests.exceptions import RequestException

def analyze_image_with_retry(image_url, prompt, max_retries=3):
    """Image analysis function with retry mechanism"""
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
                print(f"Rate limited, waiting to retry... (attempt {attempt + 1}/{max_retries})")
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                print(f"Error: {response.status_code} - {response.text}")

        except RequestException as e:
            print(f"Request exception: {e}")

    return None
```

## 🔧 高度な機能

### 1. ストリーミング出力

長時間かかる分析では、ストリーミング出力のほうがユーザー体験が向上します:

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

### 2. マルチターン会話

詳細な分析でもコンテキストを維持します:

```python theme={null}
messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "What animal is this?"},
            {"type": "image_url", "image_url": {"url": "animal.jpg"}}
        ]
    },
    {
        "role": "assistant",
        "content": "This is a Golden Retriever."
    },
    {
        "role": "user",
        "content": [{"type": "text", "text": "How old does it look? How is its health condition?"}]
    }
]
```

### 3. Function Calling と組み合わせる

```python theme={null}
tools = [
    {
        "type": "function",
        "function": {
            "name": "save_image_analysis",
            "description": "Save image analysis results to database",
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

## 📊 パフォーマンス比較

| モデル                  | 応答速度  | 認識精度  | 中国語対応 | 価格   |
| -------------------- | ----- | ----- | ----- | ---- |
| Gemini 3.1 Pro プレビュー | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | \$\$ |
| Gemini 3.5 Flash     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐  | \$   |
| GPT-5.5              | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | \$\$ |
| Claude Sonnet 4.6    | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐  | \$\$ |
| Gemini 2.5 Flash     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐  | ⭐⭐⭐⭐  | \$   |

## 🚨 重要な注意事項

1. **プライバシー保護**: 機密情報を含む画像はアップロードしないでください
2. **コンプライアンスに準拠した利用**: 関連法規を遵守し、違法な目的には使用しないでください
3. **結果の検証**: AI の分析結果は参考情報にすぎません。重要な判断には手動での確認が必要です
4. **コスト管理**: 不要な費用を避けるため、モデルは適切に選択してください

## 🔗 関連リソース

* [完全なコード例](https://github.com/apiyi-api/ai-api-code-samples/tree/main/Vision-API-OpenAI)
* [API 料金情報](https://api.apiyi.com/account/pricing)

<Note>
  💡 **ヒント**: まずは Gemini 3.5 Flash や Gemini 2.5 Flash のようなコスト効率の高いモデルでテストし、その後、品質を確認できたら本番環境では Gemini 3.1 Pro や GPT-5.5 のような高度なモデルに切り替えてください。利用可能なモデルの詳細は、[人気モデル](/ja/api-capabilities/model-info)または[コンソールのモデル一覧](https://www.apiyi.com/account/pricing)をご覧ください。
</Note>
