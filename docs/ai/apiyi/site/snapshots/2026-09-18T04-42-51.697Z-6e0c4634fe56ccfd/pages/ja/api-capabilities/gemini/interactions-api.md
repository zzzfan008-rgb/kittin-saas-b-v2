> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Interactions API 対 generateContent

> Google Gemini の 2 つの API パラダイム — エンドポイント、リクエスト/レスポンス構造、状態管理、推論、使用フィールド — と APIYI ゲートウェイ互換性テスト結果の詳細な比較

2026年6月以降、Google は **Interactions API** を一般提供に移行し、新規プロジェクトではこちらの使用を推奨しています。一方、従来の **generateContent API** は現在レガシー扱いですが、引き続き完全にサポートされています。公式ドキュメント（Nano Banana 画像生成ページなど）では、現在この 2 つのパラダイムを切り替えられるようになっており、多くの開発者は「何が具体的に違うのか、APIYI 経由ではどちらを使うべきか」と疑問に思っています。このページでは、詳細な比較と検証済みの結論を紹介します。

<Info>
  **APIYI ゲートウェイの状況（2026年7月4日（UTC+8）にテスト）**: Interactions API は、ゲートウェイ経由では**まだサポートされていません**。`/v1beta2/interactions` と `/v1beta/interactions` の両方が 404 を返します。Gemini を APIYI 経由で呼び出す場合は、引き続き [generateContent のネイティブ形式](/ja/api-capabilities/gemini/native) を使用してください。このサイトの Gemini ドキュメントはすべてこれを基準にしています。ゲートウェイに Interactions API のサポートが追加され次第、このページを更新します。
</Info>

## 2つのパラダイムとは

**generateContent** は、従来のステートレスなインターフェースです。1回のリクエストで完全なコンテキストを送り、1回のレスポンスで完全な結果を返します。`POST /v1beta/models/{model}:generateContent` においてです。Google は「現在はレガシーと見なされていますが、引き続き完全にサポートされています」と述べています。

**Interactions API** は、Google の新しいインターフェースで、2026年6月から GA です。`POST /v1beta2/interactions` においてです。これは中核となる `Interaction` リソース（1回の完全な会話ターン、または 1つのタスク）を中心に設計されており、レスポンスは実行ステップの時系列の **タイムライン** です。モデルの思考、ツール呼び出しとその結果、最終出力のすべてが明示的なステップとして示されます。Google は、**中核のメインラインファミリーを超える新しいモデルと新しいエージェント型機能は、今後 Interactions API で提供される** と明言しています（出典: `ai.google.dev/gemini-api/docs/interactions-overview`）。

## 一目でわかるコアな違い

| 項目             | generateContent (従来版)                                                                  | Interactions API（新）                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| エンドポイント        | `POST /v1beta/models/{model}:generateContent`                                          | `POST /v1beta2/interactions`                                                                                                                    |
| 入力構造           | `contents[].parts[]`（ロールベースのマルチモーダルパーツ）                                                | `input`（文字列またはコンテンツブロック。モデル名は本文に含めます）                                                                                                           |
| 出力構造           | `candidates[0].content.parts[]`                                                        | `steps[]` のタイムライン: `user_input` / `thought` / `function_call` / `function_result` / `model_output`                                              |
| マルチターン         | クライアントが毎ターン **完全な履歴** を再送します                                                           | `previous_interaction_id` がサーバー側で継続されます（ステートレスモードも可能です）                                                                                         |
| 推論             | `thoughtsTokenCount` カウンター。画像モデルの途中の推論ドラフトは画像パーツに混ざって返ってきます                            | `steps`（`type: "thought"`）として明示的に返され、思考テキストと途中の画像も含まれます                                                                                         |
| ストリーミング        | 専用の `:streamGenerateContent` エンドポイント                                                   | 本文に `"stream": true` を指定する同じエンドポイントです                                                                                                           |
| バックグラウンド実行     | サポートされていません                                                                            | 長時間実行タスク向けの `"background": true` があります                                                                                                          |
| キャッシング         | 明示的キャッシング + 暗黙的キャッシング                                                                  | 明示的キャッシングはありません。`previous_interaction_id` により暗黙的キャッシュヒット率が大幅に向上します                                                                              |
| サーバー側データ保持     | リクエストは保存されません                                                                          | デフォルトで `store: true`: 有料ティアでは **55日間**、無料ティアでは1日間保存され、削除可能です。`store: false` でオプトアウトできます（ただし、background と previous\_interaction\_id とは互換性がありません） |
| 使用量フィールド       | `promptTokenCount` / `candidatesTokenCount` / `thoughtsTokenCount` / `totalTokenCount` | `total_thought_tokens` / `total_output_tokens` など（snake\_case）                                                                                  |
| エージェント呼び出し     | サポートされていません                                                                            | Deep Research や Antigravity などの公式エージェントを同じインターフェースで呼び出せます                                                                                       |
| まだ利用できないもの     | —（最も完全な機能セット）                                                                          | Batch API、明示的キャッシング、`video_metadata`、自動関数呼び出し（Python）、Gemini 3 のリモート MCP                                                                        |
| SDK のエントリーポイント | `client.models.generate_content`（google-genai）                                         | `client.interactions.create`（google-genai ≥ 2.3.0 / @google/genai ≥ 2.3.0）                                                                      |

<Note>
  Interactions API のサーバー側ステートでよくある落とし穴は、`previous_interaction_id` が **会話履歴しか引き継がない** ことです。`tools`、`system_instruction`、`generation_config`（`thinking_level`、`temperature` などを含む）はインタラクション単位です。毎ターン再送しないと、気付かないうちに適用されなくなります。
</Note>

## リクエストとレスポンスの構造（単一のテキストターン）

generateContent の例は APIYI ゲートウェイに直接送信し、Interactions API の例は Google のエンドポイントに直接送信します（現時点では APIYI ではサポートされていません）:

<CodeGroup>
  ```bash generateContent（APIYIで動作） theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{
        "parts": [{ "text": "Tell me a joke." }]
      }]
    }'
  ```

  ```bash Interactions API（Googleに直接） theme={null}
  curl -X POST "https://generativelanguage.googleapis.com/v1beta2/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.5-flash",
      "input": "Tell me a joke."
    }'
  ```
</CodeGroup>

同じリクエストに対して、2つのレスポンス形式がどのように異なるか:

<CodeGroup>
  ```json generateContent のレスポンス theme={null}
  {
    "candidates": [
      {
        "content": {
          "parts": [{ "text": "Why did the chicken cross the road? ..." }],
          "role": "model"
        },
        "finishReason": "STOP",
        "index": 0
      }
    ],
    "usageMetadata": {
      "promptTokenCount": 4,
      "candidatesTokenCount": 12,
      "totalTokenCount": 16
    }
  }
  ```

  ```json Interactions API のレスポンス theme={null}
  {
    "id": "int_123",
    "status": "completed",
    "steps": [
      {
        "type": "user_input",
        "status": "done",
        "content": [{ "type": "text", "text": "Tell me a joke." }]
      },
      {
        "type": "model_output",
        "status": "done",
        "content": [{ "type": "text", "text": "Why did the chicken cross the road?" }]
      }
    ]
  }
  ```
</CodeGroup>

## マルチターン会話の比較

ここが、2つのパラダイムの違いを最も強く感じるところです。generateContent では毎ターン **全履歴** を再送する必要がありますが、Interactions API では前のターンの `id` だけで済みます:

<CodeGroup>
  ```bash generateContent（全履歴を再送） theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [
        { "role": "user",  "parts": [{ "text": "Hi, my name is Phil." }] },
        { "role": "model", "parts": [{ "text": "Hello Phil! How can I help?" }] },
        { "role": "user",  "parts": [{ "text": "What is my name?" }] }
      ]
    }'
  ```

  ```bash Interactions API（サーバー側で継続） theme={null}
  curl -X POST "https://generativelanguage.googleapis.com/v1beta2/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.5-flash",
      "previous_interaction_id": "int_123",
      "input": "What is my name?"
    }'
  ```
</CodeGroup>

履歴をつなぐコードを省けるだけでなく、サーバー側での継続により、暗黙的キャッシュが会話プレフィックスにヒットしやすくなります。Google によると、これによりマルチターンのシナリオで token コストが下がります。トレードオフとして、データはデフォルトで Google 側に保存されます（有料プランでは 55 日間）。データコンプライアンス要件がある企業は、`store` のセマンティクスを評価すべきです。

## 画像モデルの違い

Gemini 3 の画像モデル（`gemini-3-pro-image` など）はデフォルトで推論し、2つのパラダイムでは「途中の推論ドラフト」の扱いがまったく異なります。

* **generateContent（APIYI の現在のゲートウェイ形式）**: 途中の推論ドラフトは `candidates[0].content.parts` 内の**通常の画像パーツ**として返されます（`thoughtSignature` 付き、`thought` フラグなし）。テストでは、1つのレスポンスに 2〜10 枚の画像が含まれることがあり、それぞれが出力側で 1120/2000 tokens として課金されます。必ず各パーツを順に処理し、**最後のものを最終版として扱ってください**。完全な計測方法と照合ルールは、[Usage Fields & Output Explained](/ja/api-capabilities/nano-banana-usage-metadata) をご覧ください。
* **Interactions API**: 推論は `type: "thought"` ステップ（思考テキストと途中画像）として明示され、最終画像は `model_output` ステップに入ります。SDK では `.output_image` / `.output_text` の便利なプロパティも提供されます。テキストと画像が交互に出力されるケース（例: イラスト付きストーリー）では、引き続き手動でステップを反復処理する必要があります。

## APIYI ゲートウェイ互換性テスト

`api.apiyi.com` に対して、2026年7月4日 (UTC+8) にテストキーで検証しました:

| テスト                                                | リクエスト                         | 結果                                           |
| -------------------------------------------------- | ----------------------------- | -------------------------------------------- |
| `POST /v1beta2/interactions` + Bearer 認証           | 最小限の `gemini-2.5-flash` リクエスト | ❌ 404 (無効な URL)                              |
| `POST /v1beta/interactions` + Bearer 認証            | 同じ                            | ❌ 404 (無効な URL)                              |
| `POST /v1beta2/interactions` + `x-goog-api-key` 認証 | 同じ                            | ❌ 404 (無効な URL)                              |
| `POST /v1beta/models/{model}:generateContent`      | テキスト/画像モデル                    | ✅ 動作します (このサイトの Gemini ドキュメントはすべてこれに基づいています) |

\*\*結論: APIYI ゲートウェイはまだ Interactions API を転送しません。\*\*そのため、サーバー側での継続、エージェント呼び出し、バックグラウンド実行といった Interactions 専用機能は、現時点ではゲートウェイ経由で利用できません。

## 推奨事項

1. **APIYI 経由では、引き続き generateContent を使用します。** これは最も完全な機能セットを備えており（Batch、明示的キャッシュ、video\_metadata は実際には generateContent 専用です）、Google も完全サポートを約束しています。短期的な非推奨リスクはありません。
2. **generateContent でのマルチターン**: 履歴はクライアント側で組み立てます。 [Gemini ネイティブ形式](/ja/api-capabilities/gemini/native) と [マルチターン会話](/ja/api-capabilities/multi-turn-conversation) を参照してください。
3. **Google を直接呼び出し、Interactions API への移行を検討している場合**、次の 4 点に注意してください: `tools` / `system_instruction` / `generation_config` は毎ターン再送する必要があります。`store` は既定でオンで、有料ティアでは 55 日間保持されます。Batch API と明示的キャッシュはまだ利用できません。google-genai / @google/genai を 2.3.0 以降にアップグレードしてください。
4. **Interactions API を注視する価値が出るのは次のような場合です**: 公式エージェント（Deep Research、Antigravity）、`background: true` の長時間実行タスクが必要な場合、またはマルチターンの token コストを抑えるためにサーバー側の状態を使いたい場合です。APIYI がサポートを追加し次第、このページを更新します。

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Gemini ネイティブフォーマット" icon="sparkles" href="/ja/api-capabilities/gemini/native">
    APIYI 経由で generateContent のネイティブフォーマットを完全に解説します
  </Card>

  <Card title="Gemini レスポンスの処理" icon="braces" href="/ja/api-capabilities/gemini/response-handling">
    candidates、parts、finishReason を正しく解析します
  </Card>

  <Card title="Usage フィールドと出力の解説" icon="receipt-text" href="/ja/api-capabilities/nano-banana-usage-metadata">
    Imageモデルの usageMetadata の意味と、計測された thinking-draft の挙動
  </Card>

  <Card title="マルチターン会話" icon="messages-square" href="/ja/api-capabilities/multi-turn-conversation">
    ステートレスなインターフェースでマルチターンチャットを実装します
  </Card>
</CardGroup>
