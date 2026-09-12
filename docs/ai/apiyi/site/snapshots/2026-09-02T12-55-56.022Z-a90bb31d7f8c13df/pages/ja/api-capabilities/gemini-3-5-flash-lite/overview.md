> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite テキスト生成

> Google の Gemini 3.5 Flash-Lite 低予算のマルチモーダルモデル: 1M コンテキストウィンドウ、デフォルトでは推論なし、非常に高速です。APIYI はネイティブな Gemini と OpenAI 互換エンドポイントを公式料金で提供します — 入力 $0.30 / 出力 $2.50 per 1M tokens.

Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`) は、2026年7月に更新された Google の軽量マルチモーダルモデル（安定版リリース）で、高頻度・低遅延・低コストのワークロード向けに設計されています。text/image/video/audio/PDF 入力を受け付け、1M のコンテキストウィンドウと 64K の出力に対応します。APIYI は **完全なデュアルエンドポイントのテストパス** を完了しました（25+5 ケース）。ネイティブの Gemini 形式と OpenAI 互換形式の両方がそのまま動作し、ネイティブツール — 検索グラウンディング、URL コンテキスト — も動作確認済みです。

<Info>
  **現在 APIYI で利用可能です**: モデル名 `gemini-3.5-flash-lite`、`default` / `svip` グループで提供されています。3.6 Flash とは異なり — **デフォルトでは推論出力なし**、簡単なリクエストは当社のテストでは約 2 秒で返ってきます。深い推論を明示的に有効にするには `thinkingLevel: "high"` を渡してください。
</Info>

## 主な特長

<CardGroup cols={2}>
  <Card title="最高水準のコストパフォーマンス" icon="circle-dollar-sign">
    \$0.30 の入力 / 1M tokens あたり \$2.50 の出力（audio input も同レート） — 3.6 Flash の 5分の1 から 3分の1。高頻度処理とバッチワークロード向けに設計されています。
  </Card>

  <Card title="推論なし、最小レイテンシ" icon="zap">
    デフォルトでは thinking tokens はありません。シンプルなリクエストは約2秒で計測されます（3.6 Flash では約4.5秒）。サポートボット、分類、抽出にそのまま使えます。
  </Card>

  <Card title="完全なマルチモーダル理解" icon="eye">
    画像、PDF、audio で正確性が検証済みで、video も同じパイプラインを共有します。フラッグシップ版と同じ 1M コンテキストを備えています。
  </Card>

  <Card title="ネイティブツールを利用可能" icon="wrench">
    Google 検索の grounding、Maps grounding、URL context、code execution がネイティブエンドポイントで動作確認済みです。Google API Key は不要です。
  </Card>
</CardGroup>

## モデル詳細

| Property        | Value                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| **モデル名**        | `gemini-3.5-flash-lite` (安定版、リダイレクトエイリアスなし)                                                                 |
| **入力モダリティ**     | テキスト、画像、動画、音声、PDF                                                                                           |
| **コンテキストウィンドウ** | 1,048,576 入力 / 65,536 出力                                                                                    |
| **グループ**        | `default`, `svip`                                                                                           |
| **エンドポイント**     | `POST /v1beta/models/gemini-3.5-flash-lite:generateContent` (ネイティブ), `POST /v1/chat/completions` (OpenAI互換) |
| **推論**          | **デフォルトではOFF**; `thinkingLevel: "high"`で有効にしてください                                                           |
| **ストリーミング**     | ✅ 両方のエンドポイント                                                                                                |

## 検証済み機能マトリクス

APIYI の 2026年7月22日のテスト結果（公式の主張 vs. 実測の挙動）:

| 機能                                 | 公式                | Gemini ネイティブ                                                              | OpenAI互換                                                   |
| ---------------------------------- | ----------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| チャット（非ストリーム / ストリーム）               | ✅                 | ✅ / ✅                                                                     | ✅ / ✅                                                      |
| システム指示                             | ✅                 | ✅                                                                         | ✅                                                          |
| 推論                                 | ✅                 | ✅ `thinkingLevel: "high"` がトリガーします（約1000 tokens）、`includeThoughts` は動作します | ⚠️ `reasoning_effort` は受け付けられますが、reasoning\_tokens は返されません |
| 画像 / PDF / 音声の理解                   | ✅                 | ✅ すべて確認済み                                                                 | ✅ 画像（data URL）を確認済み                                        |
| 関数呼び出し                             | ✅                 | ✅                                                                         | ✅                                                          |
| 構造化出力                              | ✅                 | ✅ responseSchema                                                          | ✅ json\_schema                                             |
| Google Search グラウンディング             | ✅                 | ✅ 完全な groundingMetadata                                                   | — ネイティブのみ                                                  |
| Maps グラウンディング / URL コンテキスト         | ✅                 | ✅ / ✅                                                                     | — ネイティブのみ                                                  |
| コード実行                              | ✅                 | ⚠️ 実際に正しく実行されることは確認済みですが、`executableCode` フィールドは返されません                    | — ネイティブのみ                                                  |
| Computer Use                       | ❌ 公式には未対応         | —                                                                         | —                                                          |
| 暗黙キャッシュ                            | ✅                 | ⚠️ テストではヒットは確認されませんでした — これを前提にコストモデルを組まないでください                           | 同様                                                         |
| 明示キャッシュ API / countTokens / ファイル検索 | 一部対応              | ❌ まだプラットフォームで有効化されていません                                                   | —                                                          |
| Batch / Live API / 音声生成 / 画像生成     | ❌ またはゲートウェイでは N/A | —                                                                         | —                                                          |

## 料金

| 項目                      | APIYI の価格（公式と同一）                |
| ----------------------- | ------------------------------- |
| 入力（テキスト/画像/動画/音声）       | \$0.30 / 1M tokens              |
| 出力（thinking を含む）        | \$2.50 / 1M tokens              |
| Google Search grounding | \$14 / 1K queries（ツール呼び出しごとに課金） |

<Info>
  **料金に関する注記**: APIYI は公式の料金と同一です。割引はチャージ特典によるもので、\$100 で +10%、最大 +20%（約17%オフ）になります。[チャージ特典](/ja/faq/recharge-promotions)をご覧ください。
</Info>

## 思考の制御

**3.6 Flash とは逆に、このモデルはデフォルトでは思考しません**。そのため高速で低コストです。測定結果:

| 設定                                     | 思考トークン（測定値） | 備考                                      |
| -------------------------------------- | ----------- | --------------------------------------- |
| Default / `minimal` / `low` / `medium` | 0           | これらのいずれのティアでも、単純な prompt では思考はトリガーされません |
| `thinkingLevel: "high"`                | \~1000      | 深い思考を確実にトリガーします                         |

<Tip>
  実用ルール: **思考が必要なら、すぐに `high` を使ってください** — 中間ティアでは単純な prompt ではそれがトリガーされません。思考内容を確認するには `includeThoughts: true` と組み合わせます。ワークロードで常に深い reasoning が必要な場合は、[Gemini 3.6 Flash](/ja/api-capabilities/gemini-3-6-flash/overview) のほうが適しています。
</Tip>

## クイックスタート

### Gemini のネイティブ形式（推奨 — フルの tools サポート）

<CodeGroup>
  ```bash cURL (基本チャット、デフォルトでは推論なし) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.5-flash-lite:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "Translate to French: The weather is nice today"}]}]
    }'
  ```

  ```python Python（google-genai SDK、オンデマンド推論） theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash-lite",
      contents="Pipe A fills a pool in 8 hours, pipe B in 12. How long with both open?",
      config=types.GenerateContentConfig(
          thinking_config=types.ThinkingConfig(thinking_level="high")
      )
  )
  print(response.text)
  ```

  ```python Python（画像理解） theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash-lite",
      contents=[
          types.Part.from_bytes(data=open("photo.png", "rb").read(),
                                mime_type="image/png"),
          "Describe this image"
      ]
  )
  print(response.text)
  ```
</CodeGroup>

### OpenAI 互換形式（既存コードにそのまま差し替え可能）

<CodeGroup>
  ```python Python（OpenAI SDK） theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="gemini-3.5-flash-lite",
      messages=[{"role": "user", "content":
                 "Classify this review as positive/negative/neutral: fast shipping, mediocre packaging"}]
  )
  print(response.choices[0].message.content)
  ```

  ```javascript Node.js（ストリーミング） theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const stream = await client.chat.completions.create({
    model: 'gemini-3.5-flash-lite',
    messages: [{ role: 'user', content: 'Summarize how RAG works in three sentences' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## よくある質問

<AccordionGroup>
  <Accordion title="Flash-Lite と 3.6 Flash のどちらを選ぶべきですか？">
    スループット重視のワークロード、つまり高頻度の Q\&A、分類、抽出、翻訳、サポートボットには Flash-Lite を選んでください（約2倍高速で、コストは5分の1まで下がります）。深い推論、複雑な計画、またはコンピュータ使用には [3.6 Flash](/ja/api-capabilities/gemini-3-6-flash/overview) を選んでください。
  </Accordion>

  <Accordion title="ネイティブなエンドポイントに Google API Key は必要ですか？">
    いいえ。APIYI の token（`sk-` キー）を `x-goog-api-key` ヘッダーに設定してください。公式の google-genai SDK では、`base_url` を `https://api.apiyi.com` に設定するだけです。
  </Accordion>

  <Accordion title="推論の消費量はどのように監視しますか？">
    ネイティブなエンドポイントでは、`usageMetadata.thoughtsTokenCount` を参照してください。なお、OpenAI 互換エンドポイントはこのモデルの `reasoning_tokens` を報告しません。正確な観測にはネイティブなエンドポイントを使用してください。
  </Accordion>

  <Accordion title="暗黙的キャッシュはヒットしますか？">
    15.9K-token の共有プレフィックスを持つ 3 回の連続リクエストで、ヒットは 0 件でした（同じ条件では 3.6 Flash は 1 回ヒットしました）。キャッシュヒットに基づいてコストモデルを作成しないでください。明示的な cache API は、まだプラットフォームで有効になっていません。
  </Accordion>
</AccordionGroup>

## 関連

* [ネイティブ generateContent プレイグラウンド](/ja/api-capabilities/gemini-3-5-flash-lite/generate-content)
* [Chat Completions プレイグラウンド](/ja/api-capabilities/gemini-3-5-flash-lite/chat-completions)
* [Gemini 3.6 Flash の概要](/ja/api-capabilities/gemini-3-6-flash/overview)
* [Gemini ネイティブ呼び出しガイド](/ja/api-capabilities/gemini/native)
