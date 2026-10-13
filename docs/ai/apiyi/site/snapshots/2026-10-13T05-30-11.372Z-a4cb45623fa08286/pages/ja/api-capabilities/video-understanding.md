> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 動画理解 API

> Gemini、Seed (Doubao)、Qwen、Kimi などで動画を分析 — コンテンツ認識、シーン説明、アクション分析、タイムスタンプ参照に対応しています。19種類のモデルの検証済みサポートリスト、共通の video_url フォーマット、プロバイダー別の入力制限、動画に対応していないモデルの一覧を掲載しています。

APIYI 上の複数のモデルファミリーは動画を「視聴」できます。1つの prompt だけで、モデルはシーン、アクション、画面上のテキストを認識し、タイムスタンプによって重要な瞬間を参照できます。Gemini のほか、**Seed（Doubao）ファミリー全体、Qwen のビジョンおよび omni モデル、Kimi K3** のすべてが当社のテストに合格しました。このページでは、サポート対象リスト、汎用リクエストフォーマット、およびつまずきやすい制限事項について解説します。

<Note>
  **まず以下の3点をご確認ください**:

  1. **汎用フォーマットは `video_url` です**: `{"type": "video_url", "video_url": {"url": "data:video/mp4;base64,..."}}` は Seed、Qwen、Kimi、MiniMax、Gemini で動作します。このページの以前のバージョンに記載されていた古い `image_url` + `data:video/mp4` 形式は **Gemini でしか動作せず**、それ以外のモデルではすべて 400 エラーが返されます。
  2. **GPT、Grok、Claude、GLM、DeepSeek は動画入力を受け付けません。** GPT と GLM は**動画を警告なしに破棄して** 200 を返し、GPT はもっともらしい回答を捏造することさえあります。詳細は「動画に対応していないモデル」を参照してください。
  3. **Gemini は通常の公開動画 URL を受け付けません**: `Request contains an invalid argument` を返すか、動画が警告なしに破棄されて 200 を返し（`prompt_tokens` が数十程度にとどまる）、動画が見えないと答えたり、画面が真っ黒であると説明したりすることがあります。一方、Seed、Qwen、Kimi は公開 https URL を直接受け付けることができます。
</Note>

<CardGroup cols={2}>
  <Card title="ビジュアル API テスト" icon="flask-conical" href="https://icover.ai/video-understanding">
    iCover ビジュアルテストツールで動画をアップロードし、理解エンドポイントをテストします。
  </Card>
</CardGroup>

## AIエージェントに統合を任せる

<Note>
  Codex / Claude Code / Cursor を使用して開発している場合は、以下の prompt をコピーしてエージェントに渡してください。まずこのページのプレーンテキスト版を取得し（任意のドキュメント URL の末尾に `.md` を追加）、プロジェクト固有のスタックに合わせてコードを作成します。汎用的な `video_url` 形式、**Gemini の公開 URL 不可ルールおよび 20 MB の上限**、**動画が実際にモデルに届いたかを確認するための `prompt_tokens` のチェック**は、すでに要件に組み込まれています。
</Note>

<Prompt description="コーディングエージェントに動画理解（Gemini / Seed / Qwen / Kimi）の統合やトラブルシューティングを行わせます。Codex、Claude Code、Cursor および同様のツールにコピー＆ペーストしてください。" icon="bot" actions={["copy"]}>
  このプロジェクトにおける動画理解を統合 / トラブルシューティングしてください：動画をマルチモーダルモデルに送信し、要約、シーンの説明、アクション分析、またはタイムスタンプの参照を行います。

  コードに手を付ける前にドキュメントを参照してください：このページのプレーンテキスト版を取得するには [https://docs.apiyi.com/en/api-capabilities/video-understanding.md](https://docs.apiyi.com/en/api-capabilities/video-understanding.md) を取得してください。YouTube リンクについては、同じ `.md` サフィックスを付けた gemini/native ページも参照してください。

  要件：

  1. エンドポイントと形式：OpenAI 互換の `POST https://api.apiyi.com/v1/chat/completions` を使用し、テキストブロックの隣にある `messages[].content` 内に常に動画を `{"type": "video_url", "video_url": {"url": ...}}` として渡してください。**古い `image_url` + `data:video/mp4` 形式は使用しないでください**（Gemini のみが受け入れ、他のすべてのモデルは 400 を返します）。**また、Responses エンドポイントで `input_video` を使用しないでください**。これは同期呼び出しであり、ポーリングは不要です。

  2. モデルの選択：デフォルトは `gemini-3.8-flash` とします（動画 tokens が最も少なく、YouTube リンクに対応）。正確なタイムスタンプが必要な場合や、動画がすでに公開 URL に配置されている場合は `seed-2-0-pro-260328` を使用してください。大量の低コストな処理には `qwen3.8-flash` または `seed-2-0-mini-260428` を検討してください。**GPT、Grok、Claude、GLM、DeepSeek は動画をサポートしていません** — GPT と GLM は動画を暗黙的に破棄して 200 を返し、GPT は回答をでっち上げるため、これらを選択しないでください。どうしても必要な場合は、ローカルでフレームを抽出し、複数の画像として送信してください。`MiniMax-M3` はタイムスタンプを誤るため、タイムスタンプが重要な場合は避けてください。モデル名は設定可能にしてください。

  3. 動画の送信方法：**Gemini は Base64 データ URI のみを受け入れます**（`data:video/mp4;base64,...`）。**リクエストボディ全体は 20 MB 未満に収める必要があります**（Base64 化により約 3 分の 1 肥大化するため、未加工ファイルとしては約 14 MB を見込んでください）。**公開 URL は受け付けません**（動画が破棄され、モデルが見えないと返答するか、真っ暗な画面として説明される可能性があります）。**また、`files.upload` はサポートされていません**。YouTube リンクは Gemini のネイティブ形式（`google-genai` SDK、base\_url `https://api.apiyi.com`）経由でのみ動作します。プロジェクトですでにその SDK を使用している場合、Base64 動画も `Part.from_bytes` を使用してネイティブ形式経由で送信できます（OpenAI 互換形式に切り替える必要はありません）。Seed / Qwen / Kimi は公開 https URL を直接受け取ることができますが、プロバイダーがアクセス可能である必要があります（不明な場合は、まず Base64 での動作を確認してください）。サイズ超過の動画は ffmpeg で圧縮またはトリミングし、H.264 mp4 に変換してください。

  4. **動画が実際にモデルに届いたことを確認する**：すべてのレスポンスで `usage.prompt_tokens` を読み取ってください。10 秒間の 540p クリップの場合、tokens は Gemini で約 700、Seed / Qwen で約 5,000、Kimi で約 14,000 です（他の解像度では約 ±30% の変動が見込まれますが、桁数のみが重要です）。**数個〜数十 tokens しかない場合は、動画が破棄されています** — モデルの回答を使用せず、エラーを発生させてください。

  5. **モデルが質問に合わせて回答をでっち上げるのを防ぐ**：入力が不正な場合（誤ったファイル、真っ黒またはグレーの画面にデコードされた動画、統合中のプレースホルダー画像など）、prompt が内容の存在を前提としていると、Gemini は `prompt_tokens` が完全に正常に見えても、存在しない内容を作り出す傾向があります。入力を制御できないバッチパイプラインでは、まず「受信した内容を説明してください」という中立的な質問をして入力を確認してから、具体的な質問を行ってください。

  6. タイムスタンプ：prompt 内ではセグメントを `MM:SS` として参照し、出力では `MM:SS` を要求してください。Seed では、より密なサンプリング（tokens の増加）のために `video_url` 内に `"fps": 2` を追加できます（他のモデルはこのフィールドを無視します）。

  7. タイムアウトとコスト：動画の長さに比例してレイテンシが増加します（テストでは 10 秒のクリップで 4 〜 30 秒かかりました）。そのため、クライアントのタイムアウトは少なくとも 300 秒に設定してください。課金は token 単位であり、動画のコストは 1 秒あたり Gemini で約 70 tokens、Seed / Qwen で約 500 tokens、Kimi で約 1,400 tokens です。ここからコストを見積もり、長い動画は送信する前に必要なセグメントへトリミングしてください。

  8. キーは `APIYI_API_KEY` 環境変数から読み取ってください — 決してハードコードしたり、git にコミットしたりしないでください。

  9. 完了したら、実際に 1 度実行してください：約 10 秒の短いクリップを送信し、モデルの回答、`usage.prompt_tokens`、およびその呼び出しのコストを提示してください。
</Prompt>

<Accordion title="この prompt が防ぐトラブル">
  | 要件 | 回避できる落とし穴 |
  | - | - |
  | 常に `video_url` を使用する | 一般的な `image_url` + `data:video/mp4` 形式は Gemini でしか動作しません — モデルを切り替えると 400 エラーになります |
  | GPT / Grok / Claude / GLM を除外する | GPT と GLM は動画を暗黙的に破棄して 200 を返し、GPT はもっともらしい回答まで作成してしまいます |
  | Gemini：Base64 のみ、ボディは 20 MB 未満 | 公開 URL は暗黙的に破棄されるか（モデルが動画を見えないと答える、または真っ黒な画面として説明する）、`invalid argument` を返します。また、`files.upload` はサードパーティでは利用できません |
  | `usage.prompt_tokens` を読み取る | 破棄された動画はわずか数十 tokens として現れます — これがコード側で検知できる唯一のシグナルです |
  | まず中立的な質問をする | 不正な入力があると、Gemini は prompt に従い回答をでっち上げますが、token 数は正常に見えます |
  | 300 秒以上のタイムアウト | 長い動画、Kimi、推論モデルは数倍の時間がかかります。デフォルトのタイムアウトでは結果が届く前に切断されます |
</Accordion>

## 対応モデル

これらの結果は、2026-10-11 (UTC+8)に実施されたテストに基づいています。同一の10秒間のテストクリップ（2.5秒ごとに異なる数字と形状が表示されるもの）を各モデルに送信し、タイムスタンプ付きで数字を順番に列挙させました。動画を実際に見ずに生成された回答を排除するため、空白の画像をコントロール（対照群）として使用しました。

| プロバイダー | モデルID | 実測レイテンシー | 10秒クリップの入力tokens | 特徴 | 推奨用途 |
| - | - | :-: | :-: | - | - |
| Google | `gemini-3.8-flash` 🔥 | 4–9 s | \~700 | 最も少ない動画token数、3.5 Flashの半額の単価。YouTubeリンクに対応 | 日常的な動画分析、YouTubeコンテンツ |
| Google | `gemini-3.1-pro-preview` | — | — | Google最強の推論＋マルチモーダル | 複雑な長尺動画の詳細分析 |
| Google | `gemini-3.1-flash-lite` | — | — | 超低価格かつ低レイテンシー | 大規模・高同時実行数のワークロード |
| ByteDance | `seed-2-0-pro-260328` 🔥 | 8–10 s | \~5,000 | 最も正確なタイムスタンプ。`fps`でサンプリングを制御 | Gemini以外の筆頭候補、高精度なタイムスタンプ |
| ByteDance | `dola-seed-2-1-turbo-260628` | 16–28 s | \~5,000 | デフォルトでThinkingが有効 — より詳細だが低速 | 推論が必要な動画Q\&A |
| ByteDance | `seed-2-0-lite-260428` | \~14 s | \~5,000 | バランス型 | 一般的な分析 |
| ByteDance | `seed-2-0-mini-260428` | \~5 s | \~5,000 | 最も安価かつ最速のSeedモデル | 一括タギング、粗いフィルタリング |
| ByteDance | `seed-1-8-251228` | \~6 s | \~5,000 | 前世代の安定モデル | 既存のワークロード |
| Alibaba | `qwen3.8-flash` | 8–12 s | \~5,300 | 非常に低価格 | 大規模でコスト重視のタスク |
| Alibaba | `qwen3.8-max` | 14–16 s | \~5,300 | フラッグシップ推論 | 複雑な動画Q\&A |
| Alibaba | `qwen3-vl-plus` | \~4 s | \~5,200 | ビジョン特化モデル、高速 | 認識およびOCRタスク |
| Alibaba | `qwen3.5-omni-plus` | \~4 s | \~5,200 | オムニモーダル | 音声と映像の統合理解 |
| Moonshot | `kimi-k3` | 14–30 s | \~14,000 | 高精度だが、他モデルの約3倍の動画tokensを消費 | コストを重視しない詳細分析 |
| MiniMax | `MiniMax-M3` | \~5 s | \~3,700 | ⚠️ コンテンツの順序は正しく認識しますが、**タイムスタンプが誤っています**（3回のテストすべてで最初の2秒間に圧縮） | タイムスタンプ不要でコンテンツのみを扱う用途 |

以前の`gemini-3.7-flash`および`gemini-3.5-flash`に加え、安定版の定番である`gemini-2.5-pro`（2Mコンテキスト）と`gemini-2.5-flash`も引き続き利用可能です。3.8 Flashはテストにおいて、入力価格が半額でありながら3.5 Flashとまったく同じ動画tokens（10秒で約713）を消費しました。レイテンシーおよびtokenの数値は上記の10秒間・540pのテストクリップに適用されたものであり、より長い動画や高解像度の動画ではほぼ比例して増加します。実際のレイテンシーはエンドポイントやプロバイダー側のキューイングにも依存するため、同一のクリップでも2〜3倍変動することがあります。

<Note>モデルの価格は公式サイトに準拠しており、公式サイトの変更に伴って変動する場合があります。上記の表は参考用です。トップナビゲーションの**モデル価格**タブが正式な情報となります：[モデル価格](/en/models/index)。</Note>

### 動画非対応のモデル

| モデル | 動画送信時の動作 |
| - | - |
| OpenAI `gpt-6-sol` / `gpt-6-luna` / `gpt-5.6-terra` など | chatエンドポイントは**200を返しますが動画を破棄します**（`prompt_tokens`は数十程度のみ）。Responsesエンドポイントは明示的に`input_video`を拒否します |
| xAI `grok-4.7` / `grok-4.5` など | エラー: `unsupported message content type` |
| Anthropic Claude（全モデル） | 動画入力には対応していません |
| Zhipu `glm-5.3` | 200を返しますが動画を破棄します。モデルは動画を受信しなかったと回答します |
| `deepseek-v4-flash-vision-exp` | エラー: `unknown variant video_url`（画像のみ） |

<Warning>
  **GPTは動画が破棄された後に回答を捏造する可能性があります**：弊社のテストでは、`gpt-6-sol`は3回のテストすべてで動画内に存在しない数字の並びを創作し、ロンドンの街頭風景を「空気注入式の浮き具があるプール」と説明しました。これらのモデルを使用する必要がある場合は、以下の「フレームを画像として渡す」アプローチに切り替えてください。
</Warning>

## 動画入力方法

| 入力方法 | Gemini | Seed / Qwen / Kimi / MiniMax |
| - | :-: | :-: |
| **`video_url` + Base64** (`data:video/mp4;base64,...`) | ✅ | ✅ |
| **`video_url` + 公開https URL** | ❌ Googleは通常のURLを拒否します | ✅ プロバイダー側からURLにアクセスできる必要があります |
| **`image_url` + `data:video/mp4`** (レガシー形式) | ✅ | ❌ 400を返します |
| **YouTubeリンク** | ✅ Geminiネイティブ形式のみ | ❌ |
| **Files API** (`files.upload`) | ❌ 公式Googleエンドポイントのみ | ❌ |

<Warning>
  **Geminiの20 MB制限**: Base64を使用する場合、リクエストボディ全体（エンコードされた動画を含む）を20 MB未満に抑える必要があります。より大きな動画の場合は、① YouTubeリンクを使用する、② エンコード前にローカルで動画を20 MB未満に圧縮またはトリミングする、③ Seed / Qwenに切り替えて公開URLを直接渡す、のいずれかを行ってください。
</Warning>

<Tip>
  **プロバイダーがURLを取得できる必要があります**: 動画はモデルプロバイダーによってダウンロードされるため、プロバイダー側からアドレスにアクセスできる必要があります。弊社のテストでは、Volcengineオブジェクトストレージ上のURLはSeed、Qwen、Kimi、MiniMaxで動作しましたが、Google Cloud StorageのURLはSeedで403を返しました。不明な場合は、まずBase64での動作を確認してから、URLに切り替えてください。
</Tip>

## クイックスタート: 汎用フォーマット (`video_url`)

Seed、Qwen、Kimi、MiniMax、Gemini で利用できます。

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # replace with your APIYI key
    base_url="https://api.apiyi.com/v1"
)

with open("demo.mp4", "rb") as f:
    video_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="seed-2-0-pro-260328",       # or qwen3.8-flash / kimi-k3 / gemini-3.8-flash, etc.
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this video in detail and give timestamps for the key moments"},
            {
                "type": "video_url",
                "video_url": {"url": f"data:video/mp4;base64,{video_b64}"},
                # or pass a public URL directly (not on Gemini): {"url": "https://your-bucket.example.com/demo.mp4"}
            },
        ],
    }],
)

print(response.choices[0].message.content)
```

同等の curl 呼び出し（`<BASE64_VIDEO>` を動画の base64 文字列に置き換えるか、`url` 全体を公開アドレスに置き換えてください）:

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seed-2-0-pro-260328",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "Summarize this video"},
        {"type": "video_url",
         "video_url": {"url": "data:video/mp4;base64,<BASE64_VIDEO>"}}
      ]
    }]
  }'
```

<Tip>
  **Seed ではサンプリングレートの調整が可能です**: `"fps": 2` を `video_url` 内に追加することで、速い動きをより詳細に確認できます（テストでは、10秒のクリップで入力 tokens が約4,900から約6,200に増加しました）。Qwen と Kimi はこのフィールドを無視します。
</Tip>

## Gemini固有のフォーマット

### Base64インライン（レガシーな`image_url`形式）

Geminiは上記の`video_url`形式と下記の`image_url`形式の両方を受け付けるため、既存のコードはそのまま動作します。**新規コードでは、モデルを自由に変更できるよう`video_url`を使用してください**。

```python theme={null}
response = client.chat.completions.create(
    model="gemini-3.8-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this video in detail"},
            {
                "type": "image_url",
                "image_url": {"url": f"data:video/mp4;base64,{video_b64}"},
                "mime_type": "video/mp4",
            },
        ],
    }],
)
```

### Base64インライン（Geminiネイティブフォーマット）

プロジェクトですでにGoogle公式の`google-genai` SDKを使用している場合、OpenAI互換フォーマットに切り替える必要はありません。`base_url`を`https://api.apiyi.com`に向け、動画を`Part.from_bytes`でインライン化します。上記と同様に、リクエストボディ全体を20 MB未満に抑える必要があります。

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",            # Replace with your APIYI key
    http_options={"base_url": "https://api.apiyi.com"}
)

with open("demo.mp4", "rb") as f:
    video_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part.from_bytes(data=video_bytes, mime_type="video/mp4"),
        types.Part(text="Describe this video in detail and mark the timestamps of key moments"),
    ]),
)

print(response.text)
print(response.usage_metadata.prompt_tokens_details)  # includes a VIDEO entry when the video reached the model
```

RESTでの同等操作：Base64文字列は長いため、コマンドライン引数に直接貼り付けず、まずJSONファイルに書き出してから`-d @req.json`で送信してください。

```bash theme={null}
# Build the request body (macOS / Linux)
printf '{"contents":[{"parts":[{"inline_data":{"mime_type":"video/mp4","data":"%s"}},{"text":"Summarize this video"}]}]}' \
  "$(base64 < demo.mp4 | tr -d '\n')" > req.json

curl "https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @req.json
```

<Tip>
  **ネイティブフォーマットを使用すると、動画がモデルに届いたかどうかを簡単に確認できます**：レスポンス内の`usageMetadata.promptTokensDetails`によって入力がモダリティごとに分割されます。当社の10秒のテスト動画では`VIDEO`が660、これに加えていくつかの`TEXT` tokensが返され、OpenAI互換フォーマットと同じ合計値になりました。`VIDEO`のエントリがない場合、動画は受信されていません。
</Tip>

### YouTubeリンク（Geminiネイティブフォーマット）

YouTubeリンクはダウンロードが不要で、20 MBの制限も受けませんが、**Geminiネイティブフォーマット経由（`google-genai` SDK、エンドポイント`https://api.apiyi.com`）でのみ動作します**。

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part(file_data=types.FileData(
            file_uri="https://www.youtube.com/watch?v=VIDEO_ID"
        )),
        types.Part(text="Summarize the main content and key information in this video"),
    ]),
)

print(response.text)
```

<Info>
  ネイティブフォーマットのその他の機能（ストリーミング、思考バジェット、関数呼び出しなど）については、[Geminiネイティブフォーマット](/ja/api-capabilities/gemini/native)を参照してください。
</Info>

## 動画をサポートしていないモデル：フレームを画像として扱う

GPTやGrokなどの画像専用モデルでは、ローカルで一定の間隔でフレームを抽出し、複数の画像として送信します。テストでは、`gpt-6-sol`、`gpt-6-luna`、`gpt-5.6-terra`、`grok-4.7`、`grok-4.5`のすべてが4つのフレームから内容と順序を正しく説明できました。トレードオフとして、**音声およびフレーム間の動きが失われる**ため、タイミングはプロンプト内でご自身で指定する必要があります。

```python theme={null}
import base64, subprocess, glob

# Extract one frame every 2 seconds (requires ffmpeg installed locally)
subprocess.run(["ffmpeg", "-i", "demo.mp4", "-vf", "fps=0.5", "frame-%02d.jpg"], check=True)

frames = []
for path in sorted(glob.glob("frame-*.jpg")):
    b64 = base64.b64encode(open(path, "rb").read()).decode()
    frames.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}})

response = client.chat.completions.create(
    model="gpt-6-sol",
    messages=[{
        "role": "user",
        "content": [{"type": "text", "text": "These are frames taken every 2 seconds from one video, in time order. Describe the video."}] + frames,
    }],
)
```

## 高度なヒント

### タイムスタンプの参照

`MM:SS` を使用して prompt 内でセグメントを直接参照します。これは純粋なプロンプティング技術であり、動画をサポートするすべてのモデルで動作します：

```text theme={null}
Describe what happens between 00:30 and 01:15, and tell me what text appears at 02:40.
```

正確なタイムスタンプが重要な場合は、Seed または Qwen を優先してください。弊社のテストでは、MiniMax-M3 のタイムスタンプは信頼性に欠けていました。

### 回答が信頼できなくなる2つのケース

**① 動画がモデルに届いていない場合**：レスポンス内の `usage.prompt_tokens` を確認してください。10秒のクリップは、Seed / Qwen では約5,000 tokens、Gemini では約700 tokens です。**わずか数十 tokens しかない場合、動画はドロップされています**（これは GPT や GLM、および公開 URL を指定された場合の Gemini で発生します）。そのため回答は信頼できません。モデルは必ずしも「何も見えない」と言うわけではありません。公開 URL が指定された場合、Gemini は欠落した動画を「完全に真っ黒な画面」と描写し、GPT は存在しない内容をでっち上げます。

**② 入力が誤っており、prompt が内容を前提としている場合**：たとえば、誤ったファイルが送信された、動画のデコード結果が黒またはグレーの画面になった、統合時にプレースホルダー画像が使用された場合などです。この場合、`prompt_tokens` は完全に正常に見えるため、token 数では検知できません。

<Warning>
  \*\*Gemini モデルは、ケース②において質問に同調し、回答をでっち上げる傾向があります。\*\*弊社のテストでは、動画を空白の画像に置き換えて検証しました：

  * 中立的に質問した場合（「受け取った内容を説明してください」）、Gemini 3.8 Flash / 3.5 Flash / 3.1 Pro / 3.1 Flash Lite は全12回の実行すべてで空白の画像であると正しく回答しました — **画像理解自体には問題ありません**。
  * しかし、質問が内容を前提としたものになると（「動画に表示されている数字を順番に挙げてください」や、「数字はありますか？なければ『ない』と答えてください」など）、3.5 Flash / 3.1 Pro / 3.1 Flash Lite は18回中12回で存在しない数字をでっち上げました。
  * より新しい `gemini-3.8-flash` は明らかに改善されていますが、完全に解決されたわけではありません。同様の誘導的な質問に対して、7回中2回で依然として回答をでっち上げました。
  * 同じ質問をしたところ、Seed、Qwen、Kimi はすべて、数字は見えない／存在しないと正しく回答しました。

  実際の動画の認識には影響ありません。入力を直接制御できないバッチパイプラインでは、**まず中立的な質問をしてモデルに見えている内容を説明させ、入力が正しいことを確認した上で具体的な質問をするか**、または Seed / Qwen を使用してください。
</Warning>

### 一般的なタスク向けの prompt アイデア

コードを変更することなく、prompt を変更するだけで、同一の動画からまったく異なる分析を引き出すことができます：

* **コンテンツ要約**：トピック、主要なシーン、要点を3〜5文で要約します
* **レッスン分析**：主要な概念、チャプター構成、重要なタイムスタンプを抽出します
* **監視映像レビュー**：異常な行動、出現する人物／物体、およびそれらが出現した時刻をフラグ付けします
* **マーケティングレビュー**：製品のセールスポイントの見せ方、テンポ、オーディエンスへの適合度を評価します
* **動作分析**：動作のステップ、姿勢のポイント、改善点を分解・分析します

## 技術的な注意事項

* **Gemini**: デフォルトで**毎秒1フレーム**をサンプリングし、音声トラックも処理します。Gemini 3.xはデフォルトで低解像度としてフレームをカウントし、弊社のテストでは**毎秒約70 tokens**でした。
* **Seed / Qwen**: 弊社のテスト（540p動画）では**毎秒約500 tokens**でした。Seedのサンプリングは`fps`で調整可能です。
* **Kimi K3**: 弊社のテストでは**毎秒約1,400 tokens**であったため、長時間の動画では大幅にコストが高くなります。
* **サポート形式**: mp4、mov、webmなどの一般的な形式に対応しています。H.264のmp4に変換すると最も高い互換性が得られます。

## よくある質問

<AccordionGroup>
  <Accordion title="GPT、Grok、Claudeは動画を理解できますか？">
    いいえ。ClaudeとGrokはエラーを直接返します。GPTのチャットエンドポイントは\*\*動画を暗黙的に無視（ドロップ）\*\*して200を返し続けるため、モデルが回答を捏造する可能性があります。これらのモデルが必要な場合は、まずフレームを抽出して画像として送信してください。「動画非対応モデル：フレームを画像として送信」を参照してください。
  </Accordion>

  <Accordion title="動画理解に対応している中国製モデルはどれですか？">
    弊社のテストに合格したもの：Seedファミリー全体（`seed-2-0-pro-260328`、`dola-seed-2-1-turbo-260628`、`seed-2-0-lite-260428`、`seed-2-0-mini-260428`、`seed-1-8-251228`）、Qwenの`qwen3.8-max`、`qwen3.8-flash`、`qwen3-vl-plus`、`qwen3.5-omni-plus`、および`kimi-k3`です。`MiniMax-M3`はコンテンツを認識しますが、タイムスタンプを誤認します。`glm-5.3`と`deepseek-v4-flash-vision-exp`は動画に対応していません。
  </Accordion>

  <Accordion title="モデルを切り替えると、同じコードで400が返されるのはなぜですか？">
    レガシーな`image_url` + `data:video/mp4`の形式を使用している可能性が最も高く、これはGeminiのみが受け付けます。`{"type": "video_url", "video_url": {"url": ...}}`に切り替えることで、各プロバイダー間で動作するようになります。
  </Accordion>

  <Accordion title="Geminiが動画に含まれていない内容を説明したのはなぜですか？">
    まず、入力自体に問題がないか確認してください（黒画面、空白フレーム、誤ったファイルなどではないか）。弊社のテストでは、入力が誤っており、質問が動画の内容を前提としている場合、Geminiは質問に合わせた回答を捏造する傾向がありました。トラブルシューティングを行うには、「受信した内容を説明してください」のような中立的なpromptに切り替え、動画が正しく説明されているか確認してください。詳細は「回答が信頼できない2つのケース」を参照してください。
  </Accordion>

  <Accordion title="公開動画のURLで「Request contains an invalid argument / fetch failed」が返されます">
    Geminiは**任意の公開URLを受け付けません**（例：`https://example.com/video.mp4`）。これはAPIYIによるブロックではありません。Geminiでは、インラインのbase64（20 MB未満）またはYouTubeリンクを代わりに使用してください。あるいは、公開URLを直接取得できるSeed / Qwenに切り替えてください。`/v1/chat/completions`では必ずしもエラーになるわけではなく、モデルが黒画面しか見えないと主張して200を返す場合があります。その場合、`prompt_tokens`はわずか数十個となり、結果は使用できません。
  </Accordion>

  <Accordion title="なぜGeminiはリクエストを20 MBに制限しているのですか？以前は動作していました。">
    インラインのbase64を使用する場合、Geminiは常にリクエストボディ全体を20 MBに制限しています（Googleの公式制限に準拠）。「以前は動作していた」ものが公開URLであった場合、それは本来サポートされている方法ではありませんでした。一部のケースでたまたまエラーにならなかっただけであり、現在は明示的に拒否されます。
  </Accordion>

  <Accordion title="大きな動画に対してfiles.uploadを使用できますか？">
    いいえ。Geminiの公式Files API（`client.files.upload()`）は**サードパーティのエンドポイントではサポートされていません**（Google独自のエンドポイントでのみサポートされています）。大きな動画の場合は、YouTubeリンクを使用するか、base64用に20 MB未満に圧縮するか、公開URLを使用してSeed / Qwenに切り替えてください。
  </Accordion>

  <Accordion title="20 MBを超える動画はどうすればよいですか？">
    3つの選択肢があります：① YouTubeにアップロードしてリンクを渡す（Geminiネイティブ形式）、② ffmpegなどのツールを使用してキーセグメントを20 MB未満に圧縮またはトリミングし、base64としてエンコードする、③ 一般公開アクセス可能なオブジェクトストレージで動画をホストし、そのURLをSeed / Qwenに渡す。
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="モデル料金" icon="list" href="/en/models/index">
    全モデルと最新の料金情報
  </Card>

  <Card title="Gemini ネイティブフォーマット" icon="sparkles" href="/ja/api-capabilities/gemini/native">
    YouTubeリンク、ストリーミング、thinking budget、その他のネイティブ機能
  </Card>

  <Card title="画像理解API" icon="image" href="/ja/api-capabilities/vision-understanding">
    画像コンテンツ認識とマルチモーダル分析
  </Card>

  <Card title="Qwen3.8-Max" icon="brain" href="/ja/api-capabilities/qwen-3-8/overview">
    ネイティブな画像および動画入力に対応したQwenフラグシップモデル
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.