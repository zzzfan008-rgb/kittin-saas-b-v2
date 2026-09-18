> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.8 Flash テキスト生成

> APIYI上のGoogleのGemini 3.8 Flashマルチモーダルテキストモデル：両方のエンドポイントが利用可能で、100万tokensあたり入力$0.75／出力$3.75 — 3.6 Flashの半額です。ローンチ前のテスト結果150件と、3.6／3.7からの移行に関する注意事項を含みます。

Gemini 3.8 Flash (`gemini-3.8-flash`) は、Google が 2026 年 9 月 2 日にリリースしたマルチモーダルテキストモデルで、テキスト、画像、動画、音声の入力に対応しています。APIYI では **Gemini ネイティブ**と **OpenAI 互換**のエンドポイントを両方公開しており、リリース前に `gemini-3.7-flash` をリファレンスとして、**両プロトコルで 150 件のペアテストケース**を実施しました。

<Info>
  **Gemini 3.8 Flash は APIYI で利用可能です**：モデル名は `gemini-3.8-flash` で、`default` グループと `svip` グループで利用できます。**深い思考はデフォルトで有効**で、思考 token は出力として課金されるため、レイテンシーやコストを重視する処理では思考レベルを下げるか、無効にしてください（下記の「思考制御」を参照）。
</Info>

<Warning>
  **公式仕様はまだ公開されていません**：このページの時点では、Google の Gemini API モデル一覧にも DeepMind のモデルカードにも 3.8 Flash は掲載されておらず、リリースブログ記事も公開されていません。そのため、ここでは **コンテキストウィンドウ、最大出力、知識カットオフ、公式ベンチマークスコアをすべて「未公開」と記載**しています。これらについて、当社が中継したり推測したりすることはありません。「実測」と記載された内容はすべて APIYI 独自のテスト結果に基づいており、公式資料が公開され次第、反映します。
</Warning>

## 注目される理由

<CardGroup cols={2}>
  <Card title="3.6 Flashの半額" icon="dollar-sign">
    100万tokensあたり、入力 \$0.75／出力 \$3.75 — 3.6 Flash（\$1.50／\$7.50）の半額で、3.7 Flashと行単位で完全に同一のため、3.7からの移行コストはかかりません。
  </Card>

  <Card title="ローンチ前のテストケース150件" icon="clipboard-check">
    両方のプロトコルで3.7 Flashと同時に実行し、コア機能、推論、並列ツール呼び出し、画像・動画理解のすべてが一致しました。3.8固有のリグレッションもありません。
  </Card>

  <Card title="両方のエンドポイントに対応し、手間も不要" icon="git-fork">
    Geminiネイティブ形式（公式SDK、Google APIキー不要）とOpenAI互換形式（base\_urlを変更するだけ）の両方を利用できます。
  </Card>

  <Card title="移行コストはほぼゼロ" icon="arrow-right-arrow-left">
    3.7 Flashからの移行は、モデル名を1行変更するだけです。リクエスト形式、パラメータ、レスポンスフィールドは変更されず、フィールドセットに1つの差異があるのみで、型の変更はゼロと測定されています。
  </Card>
</CardGroup>

## モデル情報

| フィールド                  | 値                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| **モデル名**               | `gemini-3.8-flash`                                                                                  |
| **入力モダリティ**            | テキスト、画像、動画、音声（画像と動画で検証済み）                                                                           |
| **出力モダリティ**            | テキスト                                                                                                |
| **コンテキストウィンドウ / 最大出力** | Googleから公開されていません                                                                                   |
| **ナレッジカットオフ**          | Googleから公開されていません                                                                                   |
| **グループ**               | `default`、`svip`                                                                                    |
| **エンドポイント**            | `POST /v1beta/models/gemini-3.8-flash:generateContent`（ネイティブ）、`POST /v1/chat/completions`（OpenAI互換） |
| **ディープシンキング**          | デフォルトでオン；`thinkingLevel`には3つのレベル（低 / 中 / 高）があり、`thinkingBudget: 0`でオフになります                          |
| **ストリーミング**            | ✅ 両方のエンドポイントでオン                                                                                     |

## 測定済み機能マトリクス

2026年9月2日に APIYI で実施したテスト結果 — 150件のケースログと198回の呼び出し。時間帯の影響を排除するため、すべてのケースを `gemini-3.7-flash` に対して**同時実行**しました。

| 機能                                        | Gemini ネイティブ                                   | OpenAI 互換                | 3.7 Flash との比較          |
| ----------------------------------------- | ---------------------------------------------- | ------------------------ | ----------------------- |
| 基本チャット（非ストリーミング / ストリーミング）                | ✅ / ✅                                          | ✅ / ✅                    | 同一                      |
| システム命令                                    | ✅                                              | ✅                        | 同一                      |
| マルチターン                                    | ✅                                              | ✅                        | 同一                      |
| 長いコンテキストの検索（14.5K文字のプレフィックス、128-token 上限） | ✅                                              | ✅                        | 同じ回答                    |
| 構造化出力                                     | ✅ responseSchema                               | ✅ json\_schema           | 返された JSON はバイト単位で同一     |
| 関数呼び出し（単一 / 引き渡し / 順次）                    | ✅                                              | ✅                        | 同一                      |
| **並列関数呼び出し**                              | ✅ 引数と ID が完全な状態で2回の呼び出しを実行し、2ラウンドにわたって維持       | ✅                        | 同一                      |
| 画像理解                                      | ✅ 2/2                                          | ✅ 2/2                    | IMAGE モダリティの token 数は同一 |
| 動画理解                                      | ✅ 2/2                                          | ✅ 2/2                    | VIDEO モダリティの token 数は同一 |
| コード実行（`codeExecution`）                    | ✅ 正解                                           | — ネイティブのみ                | 同一                      |
| URL コンテキスト（`urlContext`）                  | ✅ `urlContextMetadata` を返却。ページは実際に取得済み         | — ネイティブのみ                | 同一                      |
| 推論ティア（低 / 中 / 高）                          | ✅ 推論 token 数が単調に増加                             | ✅ `reasoning_effort` が有効 | 同一                      |
| `stopSequences` / `stop`                  | ✅ 厳密に適用                                        | ⚠️ 効果なし                  | 同一                      |
| `temperature=0` + `topK=1` + `seed`       | ✅ 2回の実行結果が一語一句同一                               | ⚠️ 2回の実行結果が異なる           | 同一                      |
| `safetySettings`                          | ✅ 受け付けられ、`safetyRatings` を返却                   | — ネイティブのみ                | 同一                      |
| Google 検索グラウンディング                         | ⚠️ リクエストは受け付けられるが、`groundingMetadata` なし（下記参照） | — ネイティブのみ                | 同一                      |
| 暗黙的キャッシュ                                  | ⚠️ 8回連続のラウンドでヒットを確認できず                         | 同一                       | 同一                      |
| 明示的な `cachedContents` / `:countTokens`    | ❌ プラットフォームでは有効化されていない                          | —                        | 同一                      |

<Warning>
  **検索グラウンディングは未確認です**：`tools: [{"googleSearch": {}}]` を渡すと、正しい回答とともに 200 が返されますが、レスポンスには **`groundingMetadata` がありません**。つまり、その回答はライブ検索ではなく、モデル自身の知識から生成されたことを意味します。同じ実行で `gemini-3.7-flash` も同一の挙動を示しており、これは**モデルの機能差ではなく、ルートレベルでの有効化**であることを示唆します。ライブ検索に依存する場合は、グラウンディングが有効であることを前提に設計するのではなく、まずトラフィックの一部で検証してください。
</Warning>

## 料金

| 項目              | APIYI価格               |
| --------------- | --------------------- |
| 入力              | \$0.75 / 100万 tokens  |
| 出力（thinkingを含む） | \$3.75 / 100万 tokens  |
| キャッシュ読み取り       | \$0.075 / 100万 tokens |

**`gemini-3.7-flash`と行単位で完全に同一**であるため、3.7から移行しても料金は変わりません。3.6 Flash（\$1.50 / \$7.50）と比較すると、**そのまま半額**です。

<Info>
  **料金について**: thinking tokensは出力として課金されます。これが、thinking tierを管理する最も直接的な理由です。Googleは3.8 Flashの公式料金を公開していません。参考として、現在3.7 Flashに適用されている\$0.75 / \$3.75は、Google独自の期間限定プロモーション料金であり、2026年12月31日まで有効とされています。APIYIの料金は提供元の料金と行単位で一致しており、割引はチャージボーナスによって適用されます。詳しくは[チャージプロモーション](/ja/faq/recharge-promotions)をご覧ください。
</Info>

## 思考制御

**深い思考はデフォルトで有効です**：「1+1」のようなプロンプトでも、最初に数百個の思考 token が消費されます。同じ質問をネイティブエンドポイントで実行し、3つのティア全体で測定した結果は次のとおりです。

| 設定                                      | 思考 token（測定値）                        | 適する用途                |
| --------------------------------------- | ------------------------------------ | -------------------- |
| `thinkingConfig: {"thinkingBudget": 0}` | 0（レスポンスに`thoughtsTokenCount`は含まれません） | 高頻度の短いプロンプト、コスト重視のパス |
| `thinkingLevel: "low"`                  | 84                                   | 日常的な推論               |
| `thinkingLevel: "medium"`               | 127                                  | 中程度に複雑な分析            |
| `thinkingLevel: "high"`                 | 263                                  | 複雑な計画、数学、コード分析       |

<Warning>
  **`minimal`ティアは廃止されました**（3.6 Flash にはありましたが、3.8 にはありません）：ネイティブエンドポイントは、`thinkingLevel: "minimal"`に対して 400 `Thinking level is unsupported: THINKING_LEVEL_MINIMAL`を返します。思考を完全に無効にするには`thinkingConfig: {"thinkingBudget": 0}`を使用してください。

  **OpenAI互換エンドポイントでは、より注意が必要です**：`reasoning_effort: "minimal"`では**エラーが発生しません** — 200 が返されますが、それでも測定上は76個の思考 token が消費され、出力として課金されました。このパラメータは暗黙的に無視され、思考は通常どおり実行されます。`minimal`を設定したまま3.6 Flashから引き継いだコードを使用しても、変更を促すエラーは表示されません。
</Warning>

<Tip>
  推論を確認するには`thinkingConfig: {"includeThoughts": true}`を渡します。するとレスポンスに、`thought: true`のフラグが付いた思考パーツが含まれ、使用量は`usageMetadata.thoughtsTokenCount`に示されます。OpenAI互換エンドポイントでは、`reasoning_effort`（low / medium / high）を使用し、`usage.completion_tokens_details.reasoning_tokens`を読み取ってください。
</Tip>

## 例

### Gemini ネイティブ形式（推奨、より幅広い tools 対応）

<CodeGroup>
  ```bash cURL（基本チャット、思考オフ） theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "Introduce yourself in one sentence"}]}],
      "generationConfig": {"thinkingConfig": {"thinkingBudget": 0}}
    }'
  ```

  ```python Python（google-genai SDK） theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.8-flash",
      contents="Analyze the time complexity of this code and suggest optimizations",
      config=types.GenerateContentConfig(
          thinking_config=types.ThinkingConfig(thinking_level="high")
      )
  )
  print(response.text)
  ```

  ```python Python（URL コンテキスト、動作確認済み） theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.8-flash",
      contents="Summarize what https://ai.google.dev/gemini-api/docs covers",
      config=types.GenerateContentConfig(
          tools=[types.Tool(url_context=types.UrlContext())]
      )
  )
  print(response.text)
  ```
</CodeGroup>

### OpenAI 互換形式（既存コードの変更なし）

<CodeGroup>
  ```python Python（OpenAI SDK） theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="gemini-3.8-flash",
      messages=[{"role": "user", "content": "Analyze the time complexity of this code"}],
      reasoning_effort="high",
      max_tokens=4000
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
    model: 'gemini-3.8-flash',
    messages: [{ role: 'user', content: 'Write a short poem about autumn' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## 移行ガイド

<AccordionGroup>
  <Accordion title="gemini-3.7-flashからの移行">
    **モデル名を変更するだけで、それ以外の変更は不要です。** リクエスト形式、パラメータ、レスポンスフィールドはテスト上変更なく、そのまま利用できます。レスポンスフィールドのセットは1つのグループで異なりますが、型の変更はないため、クライアント側での適応は不要です。料金も同一なので、既存の予算をそのまま引き継げます。
  </Accordion>

  <Accordion title="gemini-3.6-flashからの移行">
    料金は**半額**です（入力 \$1.50 → \$0.75、出力 \$7.50 → \$3.75）。ただし、変更が必要な点が1つあります。**`thinkingLevel: "minimal"` はサポートされなくなり**、ネイティブエンドポイントでは400が返されるため、`thinkingConfig: {"thinkingBudget": 0}` に切り替えてください。OpenAI互換エンドポイントでは、`reasoning_effort: "minimal"` はエラーになりませんが、推論分の課金は継続されたまま黙って無視されるため、こちらも修正してください。
  </Accordion>

  <Accordion title="コンテキストの上限はどのくらいですか？">
    Googleからは公表されておらず、3.7の数値から推測することもしません。14.5K文字のプレフィックスを含む長文コンテキスト検索タスクは、テストに合格しました。**長文コンテキストを多用する場合は、まずトラフィックの一部で段階的に導入し**、上限を確認してから切り替えてください。公式仕様が公開され次第、このページを更新します。
  </Accordion>

  <Accordion title="ネイティブエンドポイントにはGoogle APIキーが必要ですか？">
    いいえ。`sk-` で始まるAPIYIキーを`x-goog-api-key`ヘッダーに直接設定してください。公式のgoogle-genai SDKを使用する場合は、`base_url`を`https://api.apiyi.com`に指定するだけです。
  </Accordion>

  <Accordion title="ネイティブのみで利用できる機能はどれですか？">
    コード実行、URLコンテキスト、`safetySettings`、および`stopSequences`と`seed`の厳密な処理は、Geminiネイティブエンドポイントでのみ利用できます。OpenAI互換エンドポイントでは一般的な機能（チャット / ストリーミング / ファンクションコーリング / JSON Schema / ビジョン）を利用できますが、テストでは`stop`と`seed`はそこで効果がないことが確認されています。
  </Accordion>
</AccordionGroup>

## 関連

* [Gemini 3.8 Flash のリリースノート（完全なテストデータ）](/en/news/gemini-3-8-flash-launch)
* [Gemini 3.6 Flash の概要](/ja/api-capabilities/gemini-3-6-flash/overview)
* [Gemini 3.5 Flash-Lite の概要](/ja/api-capabilities/gemini-3-5-flash-lite/overview)
* [Gemini ネイティブ呼び出しガイド](/ja/api-capabilities/gemini/native)
