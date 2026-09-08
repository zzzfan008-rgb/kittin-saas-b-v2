> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash テキスト生成

> Googleの Gemini 3.6 Flash マルチモーダルモデル: 1Mコンテキスト、4段階の推論ティア、完全なネイティブツールスイート。APIYI はネイティブ Gemini と OpenAI 互換エンドポイントの両方を公式価格で提供しています — 1M token あたり入力 $1.50 / 出力 $7.50。

Gemini 3.6 Flash (`gemini-3.6-flash`) は、2026年7月に更新された Google のマルチモーダルなテキストモデル（安定版リリース）で、text/image/video/audio/PDF の入力に対応し、1M のコンテキストウィンドウと 64K の出力を受け付けます。APIYI は **完全なデュアルエンドポイントのテストパス**（26+5 ケース）を完了しており、ネイティブの Gemini 形式と OpenAI 互換形式の両方がそのまま動作し、ネイティブツールの Search grounding、コード実行、URL コンテキストも正常に動作することを確認済みです。

<Info>
  **現在 APIYI で利用可能**: モデル名 `gemini-3.6-flash`、`default` / `svip` グループ内です。**Thinking はデフォルトで ON** です（thinking tokens は output として課金されます）— レイテンシーやコストに敏感なワークロードでは、thinking tier を下げてください（下記の「Thinking の制御」を参照）。軽量なワークロードには、より安価な兄弟モデル [Gemini 3.5 Flash-Lite](/ja/api-capabilities/gemini-3-5-flash-lite/overview) も検討してください。
</Info>

## ハイライト

<CardGroup cols={2}>
  <Card title="完全なネイティブツールスイート" icon="wrench">
    Google Search のグラウンディング、Maps のグラウンディング、URL コンテキスト、コード実行、および Computer Use（プレビュー）は、ネイティブエンドポイントで正常動作することを確認済みです。Google API Key は不要です。
  </Card>

  <Card title="完全なマルチモーダル理解" icon="eye">
    画像、PDF、音声入力の精度を確認済みです（動画は同じパイプラインを共有します）。1M のコンテキストウィンドウで、本一冊やコードベース全体を収められます。
  </Card>

  <Card title="4つの推論段階" icon="brain">
    thinkingLevel の minimal/low/medium/high は 0/403/487/837 thinking tokens で測定され、単調増加なので、タスクごとに推論予算を正確に見積もれます。
  </Card>

  <Card title="2つのエンドポイント、手間ゼロ" icon="git-fork">
    ネイティブな Gemini 形式（公式 SDK で base\_url を変更するだけ）と OpenAI 互換形式の両方が、公式価格で利用できます。
  </Card>
</CardGroup>

## モデル詳細

| Property        | Value                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------- |
| **モデル名**        | `gemini-3.6-flash`（安定版、リダイレクトのエイリアスなし）                                                              |
| **入力モダリティ**     | テキスト、画像、動画、音声、PDF                                                                                   |
| **コンテキストウィンドウ** | 1,048,576 input / 65,536 output                                                                     |
| **グループ**        | `default`, `svip`                                                                                   |
| **エンドポイント**     | `POST /v1beta/models/gemini-3.6-flash:generateContent`（ネイティブ）、`POST /v1/chat/completions`（OpenAI互換） |
| **推論**          | デフォルトでON。4つの`thinkingLevel`ティアがあり、`thinkingBudget: 0`で無効化します                                        |
| **ストリーミング**     | ✅ 両方のエンドポイント                                                                                        |

## 検証済み機能マトリクス

2026年7月22日のAPIYIテスト結果（公式の主張 vs. 実測の挙動）:

| 機能                                  | 公式                | Gemini ネイティブ                                                           | OpenAI互換                                                     |
| ----------------------------------- | ----------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| Chat (非stream / stream)             | ✅                 | ✅ / ✅                                                                  | ✅ / ✅                                                        |
| システム指示                              | ✅                 | ✅                                                                      | ✅                                                            |
| Thinking (階層 / オフ / 思考エコー)          | ✅                 | ✅ 4段階を計測済み、0–837 tokens、`includeThoughts` が動作します                       | ✅ `reasoning_effort` が動作し、usage では reasoning\_tokens が報告されます |
| 画像 / PDF / 音声の理解                    | ✅                 | ✅ すべて検証済み                                                              | ✅ 画像（data URL）で検証済み                                          |
| 関数呼び出し                              | ✅                 | ✅                                                                      | ✅                                                            |
| 構造化出力                               | ✅                 | ✅ responseSchema                                                       | ✅ json\_schema                                               |
| Google Search グラウンディング              | ✅                 | ✅ 完全な groundingMetadata                                                | — ネイティブのみ                                                    |
| Maps グラウンディング / URL コンテキスト          | ✅                 | ✅ / ✅                                                                  | — ネイティブのみ                                                    |
| コード実行                               | ✅                 | ⚠️ 実際に正しい結果で実行されることを検証済みですが、`executableCode` のフィールドはまだエコーバックされません（注参照） | — ネイティブのみ                                                    |
| Computer Use (プレビュー)                | ✅                 | ✅ action functionCall を返します                                            | — ネイティブのみ                                                    |
| 暗黙的キャッシュ                            | ✅                 | ⚠️ 確率的ヒット — ヒット率は保証されません                                               | 同じ                                                           |
| 明示的キャッシュ API / countTokens / ファイル検索 | ✅                 | ❌ まだプラットフォームで有効化されていません                                                | —                                                            |
| バッチ / Live API / 音声生成 / 画像生成        | ❌ またはゲートウェイでは N/A | —                                                                      | —                                                            |

<Warning>
  **コード実行の注記**: テストでは、コードが実際に上流で実行されていることを確認しています（記憶されにくい sha256 タスクで正しいダイジェストが返りました）が、`executableCode` / `codeExecutionResult` の部分は現在レスポンスにエコーバックされません。代わりに、コードとその結果はテキスト本文に表示されます。この 2 つのフィールドを個別にレンダリングするアプリは注意してください。
</Warning>

## 価格

| 項目                      | APIYI の価格（公式と同じ）                   |
| ----------------------- | ---------------------------------- |
| 入力                      | \$1.50 / 1M tokens                 |
| 出力（thinking を含む）        | \$7.50 / 1M tokens                 |
| Google Search grounding | \$14 / 1K queries（tool call ごとに課金） |

<Info>
  **価格に関する注意**: thinking tokens は出力として課金されます。これが thinking ティアを管理する主な理由です。APIYI は公式の価格と一致しており、割引はチャージ特典によるものです: \$100 で +10%、最大 +20%（約17%オフ）です。[チャージ特典](/ja/faq/recharge-promotions) をご覧ください。
</Info>

## 推論の制御

**推論はデフォルトで ON です**: たとえ「1+1」でも、最初に約200の推論 tokens が生成されます。測定結果は次のとおりです:

| Config                                            | 推論 tokens（実測） | 向いている用途                 |
| ------------------------------------------------- | ------------- | ----------------------- |
| `thinkingLevel: "minimal"` or `thinkingBudget: 0` | 0             | 高頻度の短いQ\&A、コスト重視のワークロード |
| `thinkingLevel: "low"`                            | 403           | 定常的な推論                  |
| `thinkingLevel: "medium"`                         | 487           | 中程度の複雑さの分析              |
| `thinkingLevel: "high"`                           | 837+          | 複雑な計画、数学、コード解析          |

<Tip>
  思考部分を返すには `thinkingConfig: {"includeThoughts": true}` を渡してください（`thought: true` としてマークされます）。消費量は `usageMetadata.thoughtsTokenCount` に表示されます。OpenAI 互換エンドポイントでは `reasoning_effort`（low/medium/high）を使い、`usage.completion_tokens_details.reasoning_tokens` を確認してください。
</Tip>

## クイックスタート

### ネイティブ Gemini 形式（推奨 — 完全なツールサポート）

<CodeGroup>
  ```bash cURL (basic chat) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.6-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "Introduce yourself in one sentence"}]}],
      "generationConfig": {"thinkingConfig": {"thinkingLevel": "minimal"}}
    }'
  ```

  ```python Python (google-genai SDK + Search grounding) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.6-flash",
      contents="What was the most important AI release in July 2026?",
      config=types.GenerateContentConfig(
          tools=[types.Tool(google_search=types.GoogleSearch())]
      )
  )
  print(response.text)
  ```

  ```python Python (multimodal: PDF understanding) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.6-flash",
      contents=[
          types.Part.from_bytes(data=open("report.pdf", "rb").read(),
                                mime_type="application/pdf"),
          "Summarize the key findings of this document"
      ]
  )
  print(response.text)
  ```
</CodeGroup>

### OpenAI-compatible format (drop-in for existing code)

<CodeGroup>
  ```python Python (OpenAI SDK) theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="gemini-3.6-flash",
      messages=[{"role": "user", "content": "Analyze the time complexity of this code"}],
      reasoning_effort="high",
      max_tokens=4000
  )
  print(response.choices[0].message.content)
  ```

  ```javascript Node.js (streaming) theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const stream = await client.chat.completions.create({
    model: 'gemini-3.6-flash',
    messages: [{ role: 'user', content: 'Write a short poem about summer' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## FAQ

<AccordionGroup>
  <Accordion title="ネイティブエンドポイントには Google API Key が必要ですか？">
    いいえ。APIYI token（`sk-`キー）を`x-goog-api-key`ヘッダーに入れてください。公式の google-genai SDK では、`base_url` を `https://api.apiyi.com` に設定するだけです。
  </Accordion>

  <Accordion title="Search grounding / code execution は OpenAI 互換エンドポイントで動作しますか？">
    いいえ。google\_search、url\_context、codeExecution、Maps grounding、Computer Use はネイティブ形式のみです。OpenAI 互換エンドポイントが対応するのは、標準セットである chat、streaming、関数呼び出し、JSON Schema、vision です。
  </Accordion>

  <Accordion title="暗黙的キャッシュでどれくらい節約できますか？">
    長いプレフィックスを繰り返すと 2 回目のリクエストでヒットする場合があります（測定値: 15.9K-token のプレフィックスのうち 8,176）。ただしヒットは確率的なので、これを前提にコストモデルを組まないでください。明示的なキャッシュ API（cachedContents）は、まだプラットフォームで有効化されていません。
  </Accordion>

  <Accordion title="Gemini 3.6 Flash か 3.5 Flash-Lite か？">
    ツール、深い推論、より強い推論には 3.6 Flash を選んでください。高頻度で、レイテンシーとコストに敏感なワークロードには、[3.5 Flash-Lite](/ja/api-capabilities/gemini-3-5-flash-lite/overview)（入力 \$0.30 / 出力 \$2.50、デフォルトでは推論なし、約 2 倍高速）を選んでください。
  </Accordion>
</AccordionGroup>

## 関連

* [ネイティブ generateContent プレイグラウンド](/ja/api-capabilities/gemini-3-6-flash/generate-content)
* [Chat Completions プレイグラウンド](/ja/api-capabilities/gemini-3-6-flash/chat-completions)
* [Gemini 3.5 Flash-Lite 概要](/ja/api-capabilities/gemini-3-5-flash-lite/overview)
* [Gemini ネイティブ呼び出しガイド](/ja/api-capabilities/gemini/native)
