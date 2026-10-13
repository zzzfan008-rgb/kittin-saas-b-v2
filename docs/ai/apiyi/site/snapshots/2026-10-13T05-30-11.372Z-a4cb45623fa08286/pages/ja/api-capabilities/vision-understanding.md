> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ビジョン理解（画像認識）API

> Gemini、GPT、Claude、Seed (Doubao)、Qwen、Kimiなどを利用した画像認識 — OCR、カウント、シーン描写、複数画像の比較に対応。検証済みの24モデル一覧、画像あたりのtokens、4つのリクエスト形式（OpenAI互換 / Responses / Anthropic / Geminiネイティブ）の各対応モデル、画像サイズ超過や画像URLなどのよくあるエラーを網羅しています。

APIYIのほとんどの主流チャットモデルは画像を「見る」ことができます。テキスト抽出（OCR）、オブジェクトのカウント、シーンの説明、複数の画像の比較などが可能です。このページでは、2026-10-11 (UTC+8) のテストに基づくサポートリスト、画像1枚あたりの消費token数、4つのリクエスト形式がそれぞれどのモデルに対応しているか、および最も一般的なエラーについて説明します。

<Note>
  **最初にこの3点をご確認ください**:

  1. **汎用的な形式はOpenAI互換の`image_url`です**: テストした22種類のビジョンモデルすべてで`{"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}`が動作しました。Responses形式およびAnthropic形式は**一部のモデルにしか対応していません** — 「各形式がサポートするモデル」をご覧ください。
  2. **`deepseek-v4-pro`や`glm-5.3`などのテキスト専用モデルは画像を受け付けません**: リクエストは200を返しますが、画像は破棄され、モデルは画像が見えないとだけ応答します。画像がモデルに届いたかどうかを確認するには、レスポンス内の`usage.prompt_tokens`をご確認ください。
  3. **base64を推奨します**: 公開URLを使用する場合、プロバイダーが画像をダウンロードする必要があるため、ホストが遅い場合や直リンク防止が設定されている場合、または`Content-Length`ヘッダーがない場合（Qwenではこの場合に400が返されます）に失敗します。
</Note>

<CardGroup cols={2}>
  <Card title="画像認識 · APIYI オンラインツール" icon="scan-eye" href="https://imagen.apiyi.com/#understand">
    コードを書きたくないですか？ブラウザ上で画像をアップロードし（複数画像の分析に対応）、一般認識、商品タイトル、5つの特徴説明（五点記述）、属性分析、OCR用の組み込みテンプレートを利用して、モデルを切り替えながら結果を比較できます。APIYIキーを貼り付けるだけです。
  </Card>

  <Card title="動画理解 API" icon="video" href="/ja/api-capabilities/video-understanding">
    動画を分析する必要がありますか？動画のサポートリストと形式をご覧ください。
  </Card>
</CardGroup>

## AIエージェントに統合を任せる

<Note>
  Codex / Claude Code / Cursor を使って開発している場合は、以下の prompt をコピーしてエージェントに渡してください。まずこのページのプレーンテキスト版を取得し（任意のドキュメント URL の末尾に `.md` を追加）、次にプロジェクト独自の技術スタックでコードを記述します。汎用的な `image_url` 形式、**大きな画像を事前にダウンスケールすること**、そして**画像が実際にモデルに届いたか確認するために `prompt_tokens` をチェックすること**がすでに要件に組み込まれています。
</Note>

<Prompt description="コーディングエージェントに視覚理解（画像認識 / OCR）の統合またはトラブルシューティングを行わせます。Codex、Claude Code、Cursorなどのツールにコピー＆ペーストしてください。" icon="bot" actions={["copy"]}>
  このプロジェクトで視覚理解の統合 / トラブルシューティングを行ってください。OCR、カウント、シーンの説明、または複数画像の比較を行うため、マルチモーダルモデルに画像を送信します。

  コードに触れる前にドキュメントを読んでください。このページのプレーンテキスト版を取得するには [https://docs.apiyi.com/en/api-capabilities/vision-understanding.md](https://docs.apiyi.com/en/api-capabilities/vision-understanding.md) を取得してください。

  要件：

  1. エンドポイントと形式：デフォルトでは OpenAI 互換の `POST https://api.apiyi.com/v1/chat/completions` を使用し、テキストブロックの隣の `messages[].content` 内に各画像を `{"type": "image_url", "image_url": {"url": ...}}` として渡します。複数の画像がある場合は、複数の `image_url` ブロックを追加します（順序は画像1、画像2となります）。すべてのビジョンモデルがこの形式を受け入れます。プロジェクトで既に Responses または Anthropic SDK を使用している場合のみ形式を切り替え、事前にこのページの「各形式がサポートしているモデル」を確認してください。**Responses エンドポイントは Gemini / Claude / Seed にアクセスできず、Anthropic エンドポイントは Seed / DeepSeek にアクセスできず、Grok は Anthropic エンドポイントで画像を警告なく破棄します**。

  2. モデルの選択：デフォルトは `gemini-3.8-flash`（すべてのテストに合格、低価格）とします。最も信頼性の高い OCR と理解には `claude-sonnet-5-5` または `gpt-6-sol` を使用します。大量で低コストのタスクには `claude-haiku-5-5`、`qwen3.8-flash`、または `gemini-3.5-flash-lite` を使用します。`deepseek-v4-pro` や `glm-5.3` などのテキスト専用モデルは画像を受け入れないため、選択しないでください。`gpt-6-luna` は OCR で文字が抜け落ち、`gemini-3.1-flash-lite` はオブジェクトのカウントを誤るため、精度が重要な場合は避けてください。モデル名は設定可能にしてください。

  3. 画像の送信方法：**Base64 データ URI を推奨します**（`data:image/png;base64,...`）。プレフィックス内のフォーマットは拡張子からではなく、ファイルの実際の内容（ヘッダーバイト）から判定してください。パブリック URL も機能しますが、プロバイダーがダウンロードします。ホストはパブリックにアクセス可能で高速である必要があり、**レスポンスには `Content-Length` ヘッダーが含まれている必要があります**（そうでない場合、Qwen モデルは `Missing Content-Length of multimodal url` を返します）。URL と Base64 は相互排他的です。`data:...;base64,` の後にリンクを配置しないでください。

  4. **送信前に大きな画像をダウンスケールする**：長辺を約 2048 px にリサイズし、JPEG（品質 85〜90）に変換します。これを怠ると実質的なコストが発生します。GPT は画像タイル単位で課金され、テストでは 1 枚の 9000×6000 の画像に対して 63,658 入力 tokens が課金されました。Claude は Base64 エンコード後に 10 MB を超える画像をすべて拒絶します（ステータス 429 — レート制限として扱ってリトライしないでください）。Seed は総ピクセル数を 3600 万ピクセルに制限しています。Kimi は 1 枚の画像が 16,384 tokens を超えると 400 を返します。

  5. **画像が実際にモデルに届いたことを確認する**：すべてのレスポンスで `usage.prompt_tokens` を読み取ります。1200×760 の画像は、ほとんどのプロバイダーで約 900〜1,300 tokens を消費します。**わずか数十 tokens しかない場合、画像は破棄されています** — 画像を受け取らなかったモデルはもっともらしい内容を捏造することがあるため、回答を使用せずにエラーを発生させてください。

  6. パラメータ：チャットエンドポイントでは、`max_tokens` と `temperature` が GPT / Claude / Gemini で正常に機能します。`detail: "low"` は `gpt-5.4-mini` と Seed のみに適用され（tokens は半分以下に減りますが、小さなテキストの読み取り精度が低下します）、他のモデルはこれを無視します。構造化された結果を得るには、prompt で JSON を要求し、安全にパースしてください。

  7. タイムアウトとコスト：テストでは 1 枚の画像で 2〜12 秒かかり、大きな画像ではさらに時間がかかります（10 MB の画像で 30〜70 秒）。そのため、クライアントのタイムアウトは少なくとも 120 秒に設定してください。課金は token 単位です。1 枚の画像の入力コストは約 \$0.0001（Claude Haiku 5.5 / Qwen3.8 Flash）から約 \$0.005（Claude Opus 5.5）の範囲です。

  8. キーは `APIYI_API_KEY` 環境変数から読み取ります — 決してハードコードしたり git にコミットしたりしないでください。

  9. 完了したら、実際に 1 度実行してください：テキストを含む画像を 1 枚送信し、モデルの回答、`usage.prompt_tokens`、およびその呼び出しのコストを表示してください。
</Prompt>

<Accordion title="この prompt が防ぐトラブル">
  | 要件 | 回避できる落とし穴 |
  | - | - |
  | チャット `image_url` をデフォルトにする | Responses および Anthropic エンドポイントは一部のモデルにしか対応していません — モデルを切り替えると 400 エラーが発生するか、警告なく画像が破棄されます |
  | Base64 を推奨し、ヘッダーバイトからフォーマットを検出する | URL はプロバイダーによるダウンロードに依存し、Qwen では `Content-Length` ヘッダーも必要となります |
  | 大きな画像をダウンスケールする | GPT は 1 枚の大きな画像に対して 60,000 以上の tokens を課金します。Claude、Seed、Kimi は即座に拒絶します |
  | Claude のサイズエラーは 429 | レート制限としてリトライしないでください — ダウンスケールが解決策です |
  | `usage.prompt_tokens` を読み取る | テキスト専用モデルは画像を破棄しても 200 を返します。token 数はコードで検出できる唯一のシグナルです |
  | テキスト専用モデルを除外する | `deepseek-v4-pro` と `glm-5.3` は、画像が見えないと返答するだけです |
</Accordion>

## 対応モデル

これらの結果は、2026-10-11 (UTC+8) に実施されたテストに基づいています。すべてのモデルは、同一の1200×760の中英混合注文書画像（表を含む）を一字一句正確に文字起こしし、図形の数を数え、2枚の画像の違いを見つけ、公開画像URLを読み取るテストを受けました。画像を見ずに生成された回答を排除するため、対照実験として空白の画像が使用されました。

| プロバイダー | モデルID | 実測レイテンシ | 画像あたりの入力tokens | テスト結果 | 推奨用途 |
| - | - | :-: | :-: | - | - |
| Google | `gemini-3.8-flash` 🔥 | 5–8 s | \~1,090 | すべて合格、低価格。Geminiのネイティブ形式に対応 | デフォルトの選択肢、日常的な画像認識 |
| Google | `gemini-3.1-pro-preview` | 9–12 s | \~1,090 | すべて合格 | 複雑な図表、推論を伴う認識 |
| Google | `gemini-3.5-flash-lite` | 2–5 s | \~1,090 | すべて合格、最速クラス | 大量処理、低レイテンシ業務 |
| OpenAI | `gpt-6-sol` 🔥 | 5–6 s | \~1,100 | すべて合格 | 汎用認識、Responsesプロジェクト |
| OpenAI | `gpt-5.6-terra` | 5 s | \~1,100 | すべて合格 | 汎用認識 |
| OpenAI | `gpt-6-luna` | \~4 s | \~1,100 | ⚠️ 低価格ですがOCRで文字落ちあり（5回のテストすべてで注文番号と電話番号を誤読） | 大まかな説明向け、OCRには非推奨 |
| Anthropic | `claude-sonnet-5-5` 🔥 | 3–4 s | \~1,210 | すべて合格 | 高精度が求められるOCRおよび理解 |
| Anthropic | `claude-opus-5-5` | 5–9 s | \~1,210 | すべて合格 | 専門的な画像・テキスト分析 |
| Anthropic | `claude-haiku-5-5` | 3–8 s | \~1,210 | すべて合格、非常に低い単価 | 大量認識およびタグ付け |
| xAI | `grok-4.7` | 4–6 s | \~950 | すべて合格 | 汎用認識 |
| ByteDance | `seed-2-0-pro-260328` | 9–11 s | \~1,260 | すべて合格。`detail: low` に対応（\~600 tokens） | 中国語モデルの中での最有力候補 |
| ByteDance | `seed-2-0-mini-260428` | 5–10 s | \~1,260 | すべて合格 | 低コストな大量処理業務 |
| ByteDance | `dola-seed-2-1-turbo-260628` | \~10 s | \~1,260 | すべて合格。thinkingがデフォルトで有効 | 推論を伴う認識 |
| Alibaba | `qwen3.8-max` | 7–9 s | \~880 | すべて合格（URLには `Content-Length` が必要） | 複雑な認識 |
| Alibaba | `qwen3.8-flash` | 4–11 s | \~910 | すべて合格（同様の注意点あり）、非常に低い単価 | コスト重視の大規模業務 |
| Alibaba | `qwen3-vl-plus` | 6–9 s | \~910 | すべて合格（同様の注意点あり） | 専用ビジョンモデル |
| Moonshot | `kimi-k3` | 6–8 s | \~1,220 | すべて合格 | 深層分析 |
| MiniMax | `MiniMax-M3` | 4–7 s | \~1,200 | すべて合格。`<think>` の推論がコンテンツに混入するため除去が必要 | 汎用認識 |
| DeepSeek | `deepseek-v4-flash-vision-exp` | 3–5 s | \~570 | すべて合格、画像tokens数が最少 | 低コスト認識 |

`gemini-3.1-flash-lite` および `gpt-5.4-mini` も画像を読み取ることができ、OCRは完全に正確でしたが、**オブジェクトのカウント数を誤る**傾向があり（それぞれ3回中0回、3回中1回のみ正解）、カウントタスクへの使用は避けてください。`qwen-vl-ocr` は専用のOCRモデルで、**表のみを出力し、表外のテキストはすべてスキップします**。また、複数画像の処理リクエストでは最初の1枚のみを読み取るため、純粋な表や身分証明書などのシナリオでのみご使用ください。

<Note>モデルの価格は公式サイトに準拠しており、随時改定される場合があります。上記の表は参考情報です。最新かつ正確な情報は、トップナビゲーションの**モデル価格**タブをご確認ください：[モデル価格](/en/models/index)。</Note>

### 画像に対応していないモデル

| モデル | 画像送信時の挙動 |
| - | - |
| `deepseek-v4-pro` | 200を返しますが画像を無視します（`prompt_tokens` は5しか増加しません）。モデルは画像が見えないと回答します |
| Zhipu `glm-5.3` | chatエンドポイントは200を返しますが画像を無視します。Responsesエンドポイントは明示的に `only supports text modality` を返します |

その他のモデルについては、モデル詳細ページの「入力モダリティ」行をご確認ください。[1つのAPIでテキストと画像を処理](/ja/faq/text-and-image-in-one-api) も参照してください。

## 各フォーマットがサポートするモデル

| フォーマット | 動作確認済み | 動作不可 |
| - | - | - |
| **OpenAI互換チャット** (`/v1/chat/completions` + `image_url`) | 上記の表のすべてのモデル | — |
| **OpenAI Responses** (`/v1/responses` + `input_image`) | GPT、Grok、Qwen3.8、Kimi、MiniMax、DeepSeek Vision | Gemini、Claude、Seed、Qwen3-VLは400を返します |
| **Anthropic Messages** (`/v1/messages` + `image`、base64) | Claude、Gemini、GPT、Qwen、Kimi、MiniMax | Seedは401、DeepSeekは400を返します。**Grokは画像をサイレントに破棄します** |
| **Anthropic Messages** (`image`、urlソース) | Claudeのみ | **Geminiは画像をサイレントに破棄します**。GPTおよびQwenは400を返します |
| **Geminiネイティブ** (`generateContent` + `inline_data`) | Gemini（3.8 Flashおよび3.1 Proでテスト済み） | — |

<Tip>
  **新規プロジェクトにはOpenAI互換チャットフォーマットの使用をおすすめします** — モデルの切り替えはモデル名を変更するだけです。ResponsesはすでにOpenAI Responses SDKを使用しているプロジェクトに適しており、AnthropicフォーマットはClaudeエコシステム（Claude Code、Anthropic SDK）に、Geminiネイティブはすでに`google-genai` SDKを使用しているプロジェクトに適しています。
</Tip>

## クイックスタート：共通フォーマット (`image_url`)

### ローカル画像（Base64、推奨）

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    base_url="https://api.apiyi.com/v1"
)

with open("demo.png", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="gemini-3.8-flash",          # or claude-sonnet-5-5 / gpt-6-sol / qwen3.8-flash, etc.
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Transcribe all text in the image word for word, and output tables as Markdown tables"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_b64}"}},
        ],
    }],
)

print(response.choices[0].message.content)
print(response.usage.prompt_tokens)    # ~900-1,300 for a 1200x760 image; a few dozen means the image never arrived
```

### 公開画像URL

```python theme={null}
response = client.chat.completions.create(
    model="gemini-3.8-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this image in detail"},
            {"type": "image_url", "image_url": {"url": "https://your-bucket.example.com/demo.png"}},
        ],
    }],
)
```

### 複数の画像を比較する

画像ごとに `image_url` ブロックを順番に1つずつ追加し、prompt 内で「画像1」「画像2」のように参照します：

```python theme={null}
response = client.chat.completions.create(
    model="claude-sonnet-5-5",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Below are image 1 and image 2. What is different between them?"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image1_b64}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image2_b64}"}},
        ],
    }],
)
```

### curl

```bash theme={null}
# 1. Build the request body: the Base64 string is long, so write it to a file instead of a command-line argument (macOS / Linux)
printf '{"model":"gemini-3.8-flash","messages":[{"role":"user","content":[{"type":"text","text":"Describe this image"},{"type":"image_url","image_url":{"url":"data:image/png;base64,%s"}}]}]}' \
  "$(base64 < demo.png | tr -d '\n')" > req.json

# 2. Send it
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @req.json
```

<Tip>
  **Base64が推奨される理由**：画像URLを使用する場合、プロバイダーがリアルタイムで画像をダウンロードするため、ホストの応答が遅い場合や直リンク防止機能が有効な場合、アクセス制限がある場合に失敗します。また、Qwen モデルではホストが `Content-Length` ヘッダーを送信する必要があります（一部のCDNはこれを含めずにチャンク転送を使用するため、弊社のテストでは `Missing Content-Length of multimodal url` が返されました）。Base64 を使用すれば、外部からのダウンロードを行わずにリクエストボディへ直接画像を含めることができます。Base64 は元のサイズの約1.33倍になるため、エンコード前に大きな画像を縮小してください — 「まず大きな画像を縮小する」を参照してください。
</Tip>

## その他のフォーマット

### OpenAI Responses (`input_image`)

すでに OpenAI Responses SDK を利用しているプロジェクト向けです。**GPT、Grok、Qwen3.8、Kimi、MiniMax、DeepSeek Vision のみに対応しています** — Gemini / Claude / Seed は 400 を返します。

```python theme={null}
response = client.responses.create(
    model="gpt-6-sol",
    input=[{
        "role": "user",
        "content": [
            {"type": "input_text", "text": "Transcribe all text in the image word for word"},
            {"type": "input_image", "image_url": f"data:image/png;base64,{image_b64}"},
        ],
    }],
)

print(response.output_text)
```

### Anthropic Messages (`image`)

Claude エコシステム（Anthropic SDK、Claude Code など）向けで、エンドポイントは `https://api.apiyi.com` です。base64 ソースは Claude、Gemini、GPT、Qwen、Kimi、MiniMax に対応していますが、**url ソースは Claude でのみ動作します**（Gemini は通知なしで画像を破棄します）。

```python theme={null}
import anthropic, base64

client = anthropic.Anthropic(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    base_url="https://api.apiyi.com"
)

with open("demo.png", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

message = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_b64}},
            {"type": "text", "text": "Transcribe all text in the image word for word"},
        ],
    }],
)

print(message.content[0].text)
# Claude can also take a public URL: {"type": "image", "source": {"type": "url", "url": "https://..."}}
```

### Gemini ネイティブフォーマット (`inline_data`)

プロジェクトですでに Google 公式の `google-genai` SDK を使用している場合は、`base_url` を `https://api.apiyi.com` に指定するだけです：

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    http_options={"base_url": "https://api.apiyi.com"}
)

with open("demo.png", "rb") as f:
    image_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
        types.Part(text="Transcribe all text in the image word for word"),
    ]),
)

print(response.text)
print(response.usage_metadata.prompt_tokens_details)  # includes an IMAGE entry when the image reached the model
```

REST 形式の場合：ヘッダー `x-goog-api-key: YOUR_API_KEY` を指定した `POST https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent` を使用し、画像は `contents[].parts[]` 内に `{"inline_data": {"mime_type": "image/png", "data": "<BASE64>"}}` として配置します。ネイティブ形式の詳細な使い方については、[Gemini ネイティブフォーマット](/ja/api-capabilities/gemini/native) を参照してください。

## まず大きな画像を縮小する

プロバイダーによって大きな画像の処理方法は大きく異なります。約10 MBの9000×6000 JPEG画像1枚のテスト結果は以下のとおりです：

| モデル | 結果 |
| - | - |
| `gemini-3.8-flash` | 正常に認識、自動縮小、約1,100 tokens |
| `grok-4.7` / `qwen3.8-flash` / `MiniMax-M3` | 正常に認識、約2,600–3,700 tokens、24–67秒 |
| `gpt-6-sol` | 正常に認識されましたが、**画像1枚で63,658入力tokensが課金されました**（約\$0.13） |
| `claude-sonnet-5-5` | 拒絶：`image exceeds 10 MB maximum`（**ステータス 429**、レート制限ではありません） |
| `kimi-k3` | 拒絶：画像1枚が16,384 tokensを超過 |
| `seed-2-0-pro-260328` | 拒絶：総ピクセル数が3,600万を超過 |

<Warning>
  **アップロード前に長辺を約2048 pxにリサイズしてください**：同じ画像を2048×1365に縮小したところ、表にある8つのモデルすべてが画像1枚あたり約700–3,700 tokensで完全に正しくOCR処理を通過し、`gpt-6-sol`は63,658から3,320に減少しました。Claudeが429を返した場合は、まずエラー本文を確認してください。`image exceeds`は画像が大きすぎることを意味しており、再試行しても解決しません。
</Warning>

```python theme={null}
import base64, io
from PIL import Image

def image_to_data_uri(path, max_side=2048):
    """Resize the long side to max_side and convert to JPEG, so the declared type always matches the content"""
    img = Image.open(path)
    img.thumbnail((max_side, max_side))
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=90)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
```

## よくあるエラー

### 画像URLのダウンロードタイムアウト

画像URLを渡した際に以下のエラーが発生した場合：

```json theme={null}
{
  "error": {
    "message": "Timeout while downloading ip:port",
    "type": "invalid_request_error",
    "code": "invalid_image_url"
  }
}
```

これは**プロバイダーがその画像URLのダウンロード中にタイムアウトしたこと**を意味しており、モデル、キー、残高とは関係ありません。典型的な原因としては、ホストの応答が遅い、または一部の地域からのアクセスに適していない、画像サイズが大きすぎる、直リンク防止機能やログイン認証が設定されたURLであることなどが挙げられます。

**解決策**: base64に切り替える（推奨：ダウンロードの手順が完全に不要になります）、または高速でパブリックにアクセス可能なURLを使用する、あるいは画像を圧縮して再試行してください。

### マルチモーダルURLのContent-Lengthの欠落（Qwen）

Qwenモデルでは、画像ホストが`Content-Length`レスポンスヘッダーを送信する必要があります。一部のCDN（Cloudflareなど）はチャンク転送で画像を配信し、このヘッダーが含まれないため、このエラーが発生します。同じ画像をオブジェクトストレージから配信するか、代わりにbase64として送信してください。

### invalid base64 data（base64フィールドにURLが配置されている）

以下のような400エラーが発生した場合（重要なフレーズは`invalid base64 data`です。文言はモデルによって多少異なります）：

```json theme={null}
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "...source.base64: invalid base64 data"
  }
}
```

これは通常、**data URIのbase64データ部分に画像URLが貼り付けられていること**を意味します：

```json theme={null}
// ❌ Wrong: what follows base64, is a link, not Base64-encoded data
"image_url": {
  "url": "data:image/jpeg;base64,https://example.com/generations/temp-xxx.jpg"
}
```

`data:image/...;base64,`プレフィックスに続く内容は、**画像ファイル自体のbase64エンコーディング**である必要があります。URL形式とbase64形式は排他的であり、混在させることはできません：

```json theme={null}
// ✅ The image is a web URL → pass the link directly, with no prefix
"image_url": {
  "url": "https://example.com/generations/temp-xxx.jpg"
}

// ✅ The image is a local file / binary → Base64-encode it, then build the data URI
"image_url": {
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

<Tip>
  **セルフチェック**: 送信前に画像ソースを確認してください。文字列が`http`で始まる場合はURL形式を使用し、そうでない場合はbase64エンコードしてdata URIを構築します。有効なbase64には`://`や`?`などの文字は絶対に含まれないため、`base64,`の後にこれらがある場合は、ほぼ確実にリンクが貼り付けられています。
</Tip>

### 宣言された画像タイプが実際のフォーマットと一致しない（メディアタイプの不一致）

以下のような400エラーが発生した場合（重要なフレーズは`The image was specified using the image/png media type, but the image appears to be a image/jpeg image`です）：

```json theme={null}
{
  "status_code": 400,
  "error": {
    "message": "InvokeModel: operation error Bedrock Runtime: InvokeModel, https response error StatusCode: 400, ... ValidationException: ...source.base64: The image was specified using the image/png media type, but the image appears to be a image/jpeg image"
  }
}
```

これは、data URIが画像をPNGとして**宣言**している（`data:image/png;base64,...`）ものの、プロバイダーがそれをデコードしてファイルヘッダーを確認したところ**実際の内容がJPEGである**ことが判明したため、リクエストが拒否されたことを意味します。よくある原因としては、変更されたファイル拡張子からフォーマットを推測したことや、コード内に`image/png`をハードコードしたことなどが挙げられます。

<Info>
  これがチェックされるかどうかは、モデルが使用するアップストリームのチャネルによって異なります。2026-10-11 (UTC+8) のテストでは、PNGとして宣言されたJPEGの送信は22種類のビジョンモデルすべてで動作しましたが、Bedrockチャネル経由で提供されるClaudeモデルでは上記のエラーが返されました。「宣言されたタイプは実際の内容と一致していなければならない」というルールに基づいてコードを記述すれば、どのチャネルでも安全です。
</Info>

**解決策**: data URIを構築する前にファイルヘッダーから実際のフォーマットを検出するか、「大きな画像をあらかじめ縮小する」の見出し下にある関数のように、PILを使ってすべてをJPEGに変換してください：

```python theme={null}
import base64

def image_to_data_uri(image_path):
    """Detect the real format from the file header so the media type always matches the content"""
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

<Tip>
  `file xxx.png`（macOS / Linuxのコマンドライン）を使用するとファイルの実際のフォーマットが瞬時に表示され、Pythonでは`Image.open(path).format`で同様の確認が可能です。
</Tip>

## 上級者向けのヒント

### 画像が実際にモデルに届いたか確認する

レスポンス内の `usage.prompt_tokens` を確認してください。1200×760 の画像は、ほとんどのプロバイダーで約 900〜1,300 tokens（DeepSeek Vision では約 570 tokens）を消費します。**テキストのみのリクエストと比べてカウントがほとんど増えない、あるいはまったく増えない場合、画像は破棄されています**。これはテキスト専用モデル（`deepseek-v4-pro`、`glm-5.3`）、Anthropic エンドポイント経由の Grok、および Anthropic の URL ソース経由の Gemini で発生します。

<Warning>
  **画像を受信しなかったモデルは回答を捏造する可能性があります。** テストにおいて、画像を添付せずに「画像内のすべてのテキストを書き起こしてください」と指示したところ、`gemini-3.8-flash` は 6 回の実行中 1 回で存在しないテーブル全体を捏造しましたが、他のすべてのモデルは画像が見えないと回答しました。そのため、バッチパイプラインでは回答のみを信用せず、まず `prompt_tokens` で配信を確認してください。
</Warning>

### `detail` パラメーター

`image_url` 内の `detail: "low"` は、一部のモデルでのみ有効です。具体的には `gpt-5.4-mini`（1,147 → 233 tokens、ただし小さなテキストで誤読が発生し始めます）や Seed（1,340 → 602 tokens、OCR の正確性は完全に維持）などです。GPT-6 / 5.6、Gemini、Claude、Qwen はこれを無視します。tokens を節約するためのより移植性の高い方法は、自身で画像をダウンスケールすることです。

### パラメーター

チャットエンドポイントでは、`max_tokens` と `temperature` は GPT（GPT-6 を含む）、Claude、Gemini で正常に動作します（テストではこれらすべてで `temperature=0.3` が成功しました）。MiniMax-M3 はその `<think>...</think>` 推論を content 内に含めるため、自身で除去してください。

### 一般的なタスク向けの prompt アイデア

コードを変更することなく、prompt を変更するだけで同じ画像からまったく異なるタスクを実行できます。

* **OCR**: 「画像内のすべてのテキストを一語一句書き起こし、テーブルは Markdown テーブルとして出力してください」
* **カウント / 構造化出力**: 「各オブジェクトの個数を数え、JSON のみを出力してください: `{"object": count}`」
* **製品分析**: 「製品の種類とブランドを特定し、その主なセールスポイントとターゲット層をリストアップしてください」
* **複数画像の比較**: 「以下は画像 1 と画像 2 です。すべての相違点をリストアップしてください」
* **グラフの読み取り**: 「軸、データの傾向、最大値および最小値を読み取ってください」

<Warning>
  医療画像、身元証明書、または安全性に関わるあらゆる結果は参考情報にすぎません。重要な判断は人間がレビューするようにし、機密性の高い個人情報を含む画像はアップロードしないでください。
</Warning>

## よくある質問

<AccordionGroup>
  <Accordion title="画像を読み取れるモデルはどれですか？">
    このページでテストされた22種類のビジョンモデルすべてです：Gemini、GPT、Claude、Grok、Seed、Qwen、Kimi、MiniMax、DeepSeek Vision。`deepseek-v4-pro`や`glm-5.3`などのテキスト専用モデルは対応していません。その他のモデルについては、モデル詳細ページの「入力モダリティ（Input modalities）」の行をご確認ください。
  </Accordion>

  <Accordion title="画像を送信したのに、モデルが画像を認識できないと応答します">
    まずレスポンス内の`usage.prompt_tokens`を確認してください。数十 tokens であれば、画像がモデルに届いていません。主な原因：① テキスト専用モデルを選択している、② Anthropic エンドポイント経由で Grok を呼び出している、または Anthropic の url ソース経由で Gemini を呼び出している（どちらも画像がサイレントに破棄されます）、③ プロバイダーが公開 URL をダウンロードできなかった。base64 を使用した chat `image_url` に切り替えることで、これらの問題のほぼすべてが解決します。
  </Accordion>

  <Accordion title="モデルを切り替えると、同じコードで400エラーが返されます">
    おそらく Responses または Anthropic フォーマットを使用しており、これらは一部のモデルのみをサポートしています（「各フォーマットがサポートするモデル」を参照）。OpenAI 互換の chat `image_url` フォーマットに切り替えれば、プロバイダー間で問題なく動作します。
  </Accordion>

  <Accordion title="Claude が 429 を返しました — レート制限にかかっていますか？">
    まずエラー本文を確認してください。`image exceeds 10 MB maximum` と記載されている場合、画像が大きすぎます（base64 エンコード後のサイズで計測されます）。リトライしても解決しないため、長辺を約2048 pxにリサイズして再度送信してください。
  </Accordion>

  <Accordion title="1枚の画像で数万 tokens も消費したのはなぜですか？">
    GPT モデルは画像タイル単位で課金されるため、元の画像サイズが大きいほど多くの tokens を消費します。テストでは、1枚の9000×6000の画像に対して `gpt-6-sol` で 63,658 入力 tokens が課金されました。長辺を約2048 pxにリサイズしたところ、同じ画像が `gpt-6-sol` で 3,320 tokens に、各プロバイダー全体でも概ね700〜3,700 tokens まで削減されました。
  </Accordion>

  <Accordion title="どの画像フォーマットがサポートされていますか？">
    JPEG、PNG、GIF、WebP などの主要なフォーマットはすべて動作します。テストでは、スマートフォンのカメラによる MPO ファイル（拡張子は .jpg のまま）も認識されました。最も安全な方法は、送信前に PIL を使用してすべて JPEG に変換することです。
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="モデル料金" icon="list" href="/en/models/index">
    すべてのモデルと最新の料金情報
  </Card>

  <Card title="動画理解 API" icon="video" href="/ja/api-capabilities/video-understanding">
    動画コンテンツ認識、シーン説明、タイムスタンプ
  </Card>

  <Card title="Gemini ネイティブフォーマット" icon="sparkles" href="/ja/api-capabilities/gemini/native">
    ネイティブフォーマットでのストリーミング、推論バジェットなど
  </Card>

  <Card title="1つの API でテキストと画像" icon="circle-help" href="/ja/faq/text-and-image-in-one-api">
    モデルがサポートする入力モダリティの確認方法
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.