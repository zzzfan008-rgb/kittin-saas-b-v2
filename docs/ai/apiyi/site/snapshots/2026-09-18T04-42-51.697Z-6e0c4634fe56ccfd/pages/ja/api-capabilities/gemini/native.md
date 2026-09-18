> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini ネイティブ形式ガイド

> APIYI 経由で公式の Gemini generateContent 形式を呼び出します: google-genai SDK のセットアップ、ストリーミング、thinking_level の制御、thought signatures。

APIYI は **公式の Gemini ネイティブ形式**（`/v1beta` generateContent エンドポイント）を完全にサポートしています。base\_url を `https://api.apiyi.com` に向ければ、既存の Gemini コードや公式 SDK がそのままシームレスに移行でき、形式変換は不要です。

このページは公式 Google ドキュメント（`ai.google.dev/gemini-api/docs`、2026 年 6 月時点）に基づいています。すべての例はそのままコピペで使えます。

## ネイティブ形式を使う理由

OpenAI互換形式でも Gemini は呼び出せますが、以下は**ネイティブ専用**です:

* **完全な推論制御**: `thinking_level` (Gemini 3 series) / `thinking_budget` (2.5 series)、思考サマリー、思考シグネチャ
* **ネイティブのマルチモーダル Parts**: インライン画像 / 音声 / 動画、`media_resolution` のコスト制御付き — [マルチモーダルとコード実行](/ja/api-capabilities/gemini/multimodal) を参照してください
* **コード実行ツール**: `code_execution` が Python をサンドボックスで実行します
* **詳細な使用量フィールド**: `thoughts_token_count`、`cached_content_token_count` など

プレーンテキストのチャットや、複数ベンダーにまたがる単一のコードベースには、代わりに [OpenAI互換モード](/ja/api-capabilities/openai/compatible) を使用してください。

## クイックスタート

Google の公式統合 SDK `google-genai` を使用してください（旧版の `google-generative-ai` は 2025年11月30日 (UTC) に提供終了しました）:

```bash theme={null}
pip install google-genai
```

<CodeGroup>
  ```python Python theme={null}
  from google import genai

  client = genai.Client(
      api_key="YOUR_API_KEY",  # your APIYI key
      http_options={"base_url": "https://api.apiyi.com"}
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash",
      contents="Introduce yourself in one sentence"
  )
  print(response.text)
  ```

  ```javascript Node.js theme={null}
  import { GoogleGenAI } from '@google/genai';

  const ai = new GoogleGenAI({
    apiKey: 'YOUR_API_KEY',
    httpOptions: { baseUrl: 'https://api.apiyi.com' }
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: 'Introduce yourself in one sentence'
  });
  console.log(response.text);
  ```

  ```bash cURL theme={null}
  curl "https://api.apiyi.com/v1beta/models/gemini-3.5-flash:generateContent" \
    -H "Content-Type: application/json" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -d '{
      "contents": [{
        "parts": [{"text": "Introduce yourself in one sentence"}]
      }]
    }'
  ```
</CodeGroup>

<Warning>
  base\_url は `https://api.apiyi.com`（`/v1` は含めません）— OpenAI互換形式の `https://api.apiyi.com/v1` とは異なります。**APIYI key** を使用してください。Google AI Studio のキーではありません。
</Warning>

## ストリーミング

```python theme={null}
stream = client.models.generate_content_stream(
    model="gemini-3.5-flash",
    contents="Write a short essay on quantum computing"
)

for chunk in stream:
    print(chunk.text, end="", flush=True)
```

## 推論制御

Gemini モデルは既定で推論を行い、**2 つの世代では異なるパラメータを使用するため、混在させるとエラーになります**:

| モデル系列                | パラメータ             | 値                                               |
| -------------------- | ----------------- | ----------------------------------------------- |
| Gemini 3 / 3.1 / 3.5 | `thinking_level`  | `minimal` (Flash ファミリーのみ) / `low` / `high` (既定) |
| Gemini 2.5           | `thinking_budget` | token 上限（例: 0–8192）; 未設定時はモデルが自動制御します           |

<Warning>
  Gemini 3 シリーズ モデルに `thinking_level` と `thinking_budget` の両方を渡すと **エラーになります** — どちらか一方を選んでください（3 シリーズでは `thinking_level` を使用します）。
</Warning>

```python theme={null}
from google.genai import types

# Gemini 3 series: level-based control
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="Prove that the square root of 2 is irrational",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="high")
    )
)

# Gemini 2.5 series: token-budget control
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Simple question, be quick",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0)  # thinking off
    )
)
```

レベルの選び方: `minimal` は低レイテンシの簡単なタスク（分類、抽出）に、`low` は通常のチャットに、`high` は複雑な推論とコードに適しています。Thinking tokens は **出力レート** で課金されるため、レベルが高いほどコストも増えます。

### 推論サマリーと推論シグネチャ

* **推論サマリー**: `include_thoughts=True` は推論の要約を返します（`part.thought` が `True` になっている部分）
* **推論シグネチャ**: Gemini 3 で導入された暗号化された推論状態です。マルチターン会話（特に関数呼び出し）では、レスポンスからの `thought_signature` を変更せずに返してください。そうするとモデルは推論チェーンを継続できます。**公式 SDK はこれを自動で処理します**; 手書きの REST 呼び出しではこのフィールドを削除しないでください — [関数呼び出し](/ja/api-capabilities/gemini/function-calling) を参照してください

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="Analyze the time complexity of: def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="high", include_thoughts=True)
    )
)

for part in response.candidates[0].content.parts:
    if getattr(part, "thought", False):
        print(f"[Thought summary] {part.text}")
    else:
        print(f"[Final answer] {part.text}")
```

## 共通設定パラメータ

`config`（`GenerateContentConfig`）経由で渡します:

| パラメータ                | 説明                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `system_instruction` | システムプロンプト                                                                                |
| `temperature`        | 0–2。**Google は Gemini 3 series ではデフォルトの 1.0 を維持することを推奨しています** — これを下げると推論品質が低下する可能性があります |
| `max_output_tokens`  | 出力上限（thinking tokens を含みます）                                                              |
| `thinking_config`    | 推論の制御。上記を参照してください                                                                        |
| `response_mime_type` | JSON 出力を強制するには `application/json` を設定します                                                 |
| `response_schema`    | 構造化 JSON 出力のためのスキーマ制約                                                                    |
| `tools`              | 関数宣言 / `code_execution` およびその他のツール                                                       |
| `media_resolution`   | マルチモーダル入力のコスト制御。詳細は [Multimodal ページ](/ja/api-capabilities/gemini/multimodal) を参照してください   |

## 使用項目 (usage\_metadata)

```python theme={null}
usage = response.usage_metadata
print(f"Input: {usage.prompt_token_count}")
print(f"Output: {usage.candidates_token_count}")
print(f"Thinking: {usage.thoughts_token_count}")
print(f"Cache hits: {usage.cached_content_token_count}")
```

| 項目                           | 説明             | 課金                                                                    |
| ---------------------------- | -------------- | --------------------------------------------------------------------- |
| `prompt_token_count`         | 入力 tokens      | 入力レート                                                                 |
| `candidates_token_count`     | 出力 tokens      | 出力レート                                                                 |
| `thoughts_token_count`       | 推論 tokens      | **出力レート** — 節約するためにレベルを調整してください                                       |
| `cached_content_token_count` | キャッシュ済み tokens | 公式割引。 [キャッシュ課金](/ja/api-capabilities/gemini/prompt-caching) を参照してください |
| `total_token_count`          | 合計             | —                                                                     |

## 対応モデルと価格

| Model                    | Input (per 1M tokens) | Output (per 1M tokens) | Notes                                          |
| ------------------------ | --------------------- | ---------------------- | ---------------------------------------------- |
| `gemini-3.5-flash`       | \$1.50                | \$9.00                 | 現行の主力モデル — いくつかのベンチマークで 3.1 Pro を上回り、1M コンテキスト |
| `gemini-3.1-pro-preview` | \$1.80                | \$10.80                | Pro のフラッグシップ                                   |
| `gemini-3-pro-preview`   | \$1.80                | \$10.80                | 前世代の Pro                                       |
| `gemini-3-flash-preview` | \$0.44                | \$2.64                 | 軽量で高速                                          |
| `gemini-3.1-flash-lite`  | \$0.25                | \$1.50                 | 超低価格                                           |
| `gemini-2.5-pro`         | \$1.25                | \$10.00                | 2.5 シリーズの Pro                                  |
| `gemini-2.5-flash`       | \$0.30                | \$2.40                 | 2.5 シリーズの主力モデル                                 |
| `gemini-2.5-flash-lite`  | \$0.10                | \$0.40                 | 最安                                             |

<Tip>
  一部のモデルには `-thinking` / `-nothinking` のエイリアス版（例: `gemini-3-flash-preview-nothinking`）があり、推論のオン/オフを固定します。リクエストパラメータを変更できないクライアントで便利です。完全な一覧: [モデルと価格](/ja/api-capabilities/model-info)。
</Tip>

## ネイティブ版とOpenAI互換

| 機能             | Geminiネイティブ                          | OpenAI互換                   |
| -------------- | ------------------------------------ | -------------------------- |
| base\_url      | `https://api.apiyi.com`              | `https://api.apiyi.com/v1` |
| SDK            | `google-genai`                       | `openai`                   |
| 推論制御           | `thinking_level` / `thinking_budget` | `reasoning_effort`         |
| 思考サマリー / シグネチャ | ✅                                    | ❌                          |
| コード実行ツール       | ✅                                    | ❌                          |
| メディア入力         | ネイティブのインライン Parts (PIL / bytes)      | Base64 image\_url          |
| キャッシュヒット欄      | `cached_content_token_count`         | `cached_tokens`            |

## 注記

* **Files API はサポートされていません**（`client.files.upload()`）; メディアはインラインで渡す必要があり、**各ファイルは 20MB 未満にしてください** — [マルチモーダルとコード実行](/ja/api-capabilities/gemini/multimodal)
* キャッシュ割引とヒット率の想定: [キャッシュ課金](/ja/api-capabilities/gemini/prompt-caching)

## 関連リンク

* このグループ: [マルチモーダル & コード実行](/ja/api-capabilities/gemini/multimodal) · [キャッシュ課金](/ja/api-capabilities/gemini/prompt-caching) · [Function Calling](/ja/api-capabilities/gemini/function-calling)
* トークンの取得 / 管理: `https://api.apiyi.com/token`
* Google 公式ドキュメント: `ai.google.dev/gemini-api/docs`
