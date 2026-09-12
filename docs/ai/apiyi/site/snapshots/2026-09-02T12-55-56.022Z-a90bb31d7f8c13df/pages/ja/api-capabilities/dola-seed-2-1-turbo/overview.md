> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo テキスト生成

> ByteDance Seed 2.1 Turbo は、本番運用向けのテキストモデルです。256K コンテキスト、制御可能な深い推論、2層キャッシュを備えています。APIYI は Chat Completions と Responses の両方のエンドポイントを、1M tokens あたり入力 $0.50 / 出力 $2.50 で提供します。

Seed 2.1 Turbo (`dola-seed-2-1-turbo-260628`) は、2026年6月23日にByteDanceのSeedチームがリリースした本番運用向けのテキストモデルです（BytePlusの製品名: Dola-Seed-2.1-turbo）。高リクエスト量の低コスト・低レイテンシーなエンタープライズワークロードを対象としており、ファミリー全体で256Kのコンテキストウィンドウを備えています。APIYIは**両方のエンドポイントを完全に検証済み**です（15/15のテストケースが通過）— Chat Completions と Responses のどちらもすぐに呼び出せます。

<Info>
  **Seed 2.1 Turbo は APIYI で利用可能です**: モデル名は`dola-seed-2-1-turbo-260628`で、`default` / `svip` グループで利用できます。ほとんどのモデルと異なる点が1つあります — **深い思考がデフォルトで ON です**。レイテンシーやコストに敏感な呼び出しでは、`thinking: {"type": "disabled"}` を明示的に渡してください（下の「深い思考の制御」を参照）。
</Info>

## 主な強み

<CardGroup cols={2}>
  <Card title="本番環境向けの価格設定" icon="circle-dollar-sign">
    \$0.50 入力 / \$2.50 出力、1M tokens あたり — 同世代の Seed 2.1 Pro の半額で、高頻度呼び出し向けに作られています。
  </Card>

  <Card title="ネイティブ対応の2つのエンドポイント" icon="git-fork">
    Chat Completions と Responses の両方をネイティブにサポートしています: イベントストリーム、推論アイテム、マルチターンの previous\_response\_id がすべて Responses 側で動作します。
  </Card>

  <Card title="制御可能な深い思考" icon="brain">
    思考スイッチに加え、reasoning\_effort の段階（low と high では計測上の reasoning tokens が 4 倍異なります）により、タスクごとに思考量を配分できます。
  </Card>

  <Card title="2層キャッシング" icon="database-zap">
    暗黙的キャッシングは2回目のリクエストから自動的にキャッシュヒットし、Responses での連鎖呼び出しにおける明示的キャッシングは前回のコンテキスト全体にキャッシュヒットして、レイテンシをおよそ半減します。
  </Card>
</CardGroup>

## モデル情報

| Parameter                       | Value                                                |
| ------------------------------- | ---------------------------------------------------- |
| **モデル名**                        | `dola-seed-2-1-turbo-260628`                         |
| **リリース日**                       | 2026年6月23日（ByteDance Seedチーム）                        |
| **コンテキストウィンドウ**                 | 256K（ファミリー基準）                                        |
| **利用可能なグループ**                   | `default`, `svip`                                    |
| **エンドポイント**                     | `POST /v1/chat/completions`, `POST /v1/responses`    |
| **Deep thinking**               | デフォルトでON; `thinking.type`で切り替え、`reasoning_effort`で階層 |
| **Streaming**                   | ✅ 両方のエンドポイント                                         |
| **Function calling / tool use** | ✅ 両方のエンドポイント                                         |

## 検証済み機能マトリクス

APIYI の 2026 年 7 月 21 日時点の実測結果（公式の主張 vs 実際の動作）:

| 機能                                  | 公式の主張           | Chat Completions              | Responses                       |
| ----------------------------------- | --------------- | ----------------------------- | ------------------------------- |
| 基本チャット（非 stream / stream）           | ✅               | ✅ / ✅                         | ✅ / ✅（完全なイベントストリーム）             |
| 構造化出力（json\_schema, strict）         | ✅               | ✅                             | ✅（`text.format`）                |
| 推論スイッチ `thinking.type`              | ✅               | ✅ 切り替えが機能                     | デフォルトで reasoning items          |
| 推論ティア `reasoning_effort`            | ✅               | ✅ low/high を実測 226/960 tokens | ✅ low/high を実測 371/1317 tokens  |
| 関数呼び出し（2ターンループ）                     | ✅               | ✅                             | ✅                               |
| 暗黙的キャッシュ                            | ✅               | ✅ 2 回目のリクエストでキャッシュヒット         | ✅ 2 回目のリクエストでキャッシュヒット           |
| 明示的キャッシュ                            | ✅（Responses のみ） | —                             | ✅ `previous_response_id` の連結が必要 |
| マルチターン `previous_response_id`       | —               | —                             | ✅                               |
| MCP                                 | ✅（Responses のみ） | —                             | 公式にはサポートされていますが、まだこちらでは検証していません |
| Web 検索 / ナレッジベース / ファインチューニング / バッチ | ❌               | —                             | —                               |

## 料金

| 項目 | APIYI価格            |
| -- | ------------------ |
| 入力 | \$0.50 / 1M tokens |
| 出力 | \$2.50 / 1M tokens |

<Info>
  **課金メモ**: 推論コンテンツは通常の出力 tokens として課金されます。だからこそ、タスクごとに推論の深さを見積もっておくべきです。チャージボーナスにより実質コストはさらに下がるため、[チャージプロモーション](/ja/faq/recharge-promotions) をご覧ください。
</Info>

## 深い推論の制御

**このモデルで最も重要な点です**: 深い推論はデフォルトでオンになっているため、1行の質問でもまず数百 tokens の推論が生成されます。テストでは、1文の自己紹介で 444 output tokens（そのうち 409 は推論）を消費し、非ストリーミングでは 7〜19 秒かかりました。

<Warning>
  レイテンシーやコストに敏感なワークロード（サポートボット、高頻度の短い Q\&A、バッチジョブ）では、`"thinking": {"type": "disabled"}` を明示的に渡してください。実測結果: 推論 tokens が 0 になり、応答が大幅に速くなります。
</Warning>

### 実測した3つの思考レベル

| 設定                               | 推論 tokens（実測）             | 適しています                 |
| -------------------------------- | ------------------------- | ---------------------- |
| `thinking: {"type": "disabled"}` | 0                         | 高頻度の短い Q\&A、コスト重視の呼び出し |
| `reasoning_effort: "low"`        | Chat 226 / Responses 371  | 日常的な推論タスク              |
| `reasoning_effort: "high"`       | Chat 960 / Responses 1317 | 複雑な計画立案、数学、コード解析       |

<Tip>
  **`max_output_tokens` に余裕を持たせてください**: 推論は出力バジェットを消費します。Responses では、バジェットが小さいと推論だけで完全に消費され、呼び出しは空のテキストのまま `status: "incomplete"`（`reason: length`）を返します。出力がないように見えますが、これはバジェットの問題です。まずは 1500 から始め、高ティアでは 4000+ を使ってください。
</Tip>

## キャッシュでコストを削減する

モデルはメカニズムの異なる 2 つのキャッシュ層をサポートしています — 混同しないでください。

### 暗黙的キャッシュ（自動、両エンドポイント）

パラメータは不要です。長いプレフィックス（たとえば固定の system prompt）が繰り返されると、2回目のリクエストから自動的にヒットします。計測では、約2,600 tokens の system prompt で、2回目と3回目のリクエストは 2,360 `cached_tokens` と報告されました。ヒットは `usage.prompt_tokens_details.cached_tokens`（Chat）または `usage.input_tokens_details.cached_tokens`（Responses）で確認できます。

### 明示的キャッシュ（Responses のみ、チェーンが必要）

明示的キャッシュを使う正しい方法は `caching: {"type": "enabled"}` **と `previous_response_id` を組み合わせたチェーン** です。2ターン目で前回の response id を引き継ぐと、前のコンテキスト全体がキャッシュにヒットします（計測では、7,873 tokens が完全にキャッシュされ、レイテンシは 8s から 4s に短縮されました）。

<Warning>
  **チェーンなしで有効化すると両方で損をします**: `caching.enabled` を設定していても `previous_response_id` がなければ、同じプレフィックスを繰り返すだけでは毎回 `cached_tokens` が 0 になり、暗黙的なプレフィックスキャッシュも適用されなくなります。キャッシュ パラメータは省略して暗黙的キャッシュに任せるか、有効化したうえで厳密にチェーンしてください。
</Warning>

## コード例

### チャット補完

<CodeGroup>
  ```bash cURL（推論オフ、高速応答） theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "dola-seed-2-1-turbo-260628",
      "messages": [
        {"role": "user", "content": "Introduce yourself in one sentence"}
      ],
      "max_tokens": 500,
      "thinking": {"type": "disabled"}
    }'
  ```

  ```python Python（段階的推論） theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="dola-seed-2-1-turbo-260628",
      messages=[
          {"role": "user", "content": "Analyze the time complexity of this code and suggest optimizations"}
      ],
      max_tokens=3000,
      reasoning_effort="high",  # low / medium / high
  )

  msg = response.choices[0].message
  print(msg.content)
  # Reasoning text is in msg.reasoning_content (via model_extra with the OpenAI SDK)
  ```

  ```javascript Node.js（ストリーミング） theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const stream = await client.chat.completions.create({
    model: 'dola-seed-2-1-turbo-260628',
    messages: [{ role: 'user', content: 'Write a short poem about summer' }],
    max_tokens: 1500,
    stream: true,
    stream_options: { include_usage: true }
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

### レスポンス（ネイティブなマルチターン + 明示的キャッシング）

<CodeGroup>
  ```bash cURL（基本呼び出し） theme={null}
  curl -X POST "https://api.apiyi.com/v1/responses" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "dola-seed-2-1-turbo-260628",
      "input": "Introduce yourself in one sentence",
      "max_output_tokens": 1500
    }'
  ```

  ```python Python（明示的キャッシング付きの連続呼び出し） theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  # Turn 1: enable explicit caching
  r1 = client.responses.create(
      model="dola-seed-2-1-turbo-260628",
      input=[
          {"role": "system", "content": "A long, fixed background document goes here..."},
          {"role": "user", "content": "First question"},
      ],
      max_output_tokens=1500,
      extra_body={"caching": {"type": "enabled"}, "store": True},
  )
  print(r1.output_text)

  # Turn 2: carry the previous id - the whole prior context hits the cache (~2x faster measured)
  r2 = client.responses.create(
      model="dola-seed-2-1-turbo-260628",
      input="Second question",
      previous_response_id=r1.id,
      max_output_tokens=1500,
      extra_body={"caching": {"type": "enabled"}},
  )
  print(r2.output_text)
  print(r2.usage.input_tokens_details.cached_tokens)  # cache hits
  ```
</CodeGroup>

## ベストプラクティス

1. **推論オフを基本、オンは例外にする**: `thinking: {"type": "disabled"}` をデフォルト設定にして、本当に複雑なタスクのときだけ `reasoning_effort` の階層に切り替えてください。簡単な質問で推論コストを払う必要はありません。
2. **`max_output_tokens` に余裕を持たせる**: 推論オンなら 3000+、高い階層なら 4000+ を確保し、推論が実際の回答を圧迫しないようにします。
3. **固定のシステムプロンプトを先頭に置く**: 暗黙的なキャッシュはプレフィックスで一致します。変わらない部分を前に置いておけば、2回目のリクエストから自動的にコストを節約できます。
4. **複数ターンでは Responses のチェーンを使う**: `previous_response_id` なら履歴の再送信を避けられ、明示的なキャッシュと組み合わせることで、長いコンテキストの会話でコストとレイテンシの両方を削減できます。
5. **エラー処理では 503 を扱う**: モデル名の টাইポやグループ権限の不足があると、OpenAI で一般的な 404 ではなく 503（利用可能なチャネルなし）が返ります。再試行ロジックを 404 に結び付けないでください。

## FAQ

<AccordionGroup>
  <Accordion title="なぜ、単純な質問は遅くて token を多く消費するのですか？">
    理由は、**深い推論がデフォルトで有効**だからです。たとえ1行の質問でも、最初に数百の推論 token（測定値は約400）を生成します。遅く、コストも高くなります。リクエストボディに `"thinking": {"type": "disabled"}` を追加してください。測定される推論 token は 0 になります。
  </Accordion>

  <Accordion title="Responses が空のテキストで不完全な結果を返すのはなぜですか？">
    `max_output_tokens` が小さすぎて、推論が予算のすべてを使い切りました（`incomplete_details.reason` は `length` です）。予算を 1500 以上に増やすか、推論ティアを無効化するか下げてください。
  </Accordion>

  <Accordion title="Chat Completions と Responses - どちらを使えばよいですか？">
    単発のやり取りや、自前で履歴を管理する場合は Chat Completions を使ってください（エコシステム互換性が最も広いです）。複数ターンの会話、明示的キャッシュ、または MCP tools には Responses を使ってください。明示的キャッシュと MCP は Responses 専用です。
  </Accordion>

  <Accordion title="明示的キャッシュを有効にしているのに cached_tokens が 0 のままなのはなぜですか？">
    明示的キャッシュには **チェーン** が必要です。2回目のターン以降は、前のターンの `previous_response_id` を必ず渡してください。`caching.enabled` を使った独立した繰り返しリクエストでは、キャッシュヒットしません。さらに、暗黙のプレフィックスキャッシュも適用されなくなります。チェーンがアプリに合わない場合は、単に caching パラメータを外して暗黙のキャッシュに頼ってください。
  </Accordion>

  <Accordion title="MCP はサポートされていますか？">
    公式の機能一覧では、Responses API に MCP サポートが記載されています。APIYI のテストラウンドでは MCP は未確認でした（外部の MCP サーバーが必要です）— 本番利用前に低トラフィックで検証してください。
  </Accordion>

  <Accordion title="503 が返ってきました - サービスは停止していますか？">
    まずモデル名のスペルを確認してください。このモデルは、未知のモデル名に対して 404 ではなく 503（「利用可能なチャネルがありません」）を返します。名前が正しく、それでも 503 が続く場合は、グループ権限（このモデルには `default` または `svip` が必要です）を確認するか、サポートにお問い合わせください。
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="Chat Playground" icon="terminal" href="/ja/api-capabilities/dola-seed-2-1-turbo/chat-completions">
    Chat Completions エンドポイントをインタラクティブにデバッグ
  </Card>

  <Card title="Responses Playground" icon="messages-square" href="/ja/api-capabilities/dola-seed-2-1-turbo/responses">
    Responses エンドポイントをインタラクティブにデバッグ
  </Card>

  <Card title="Model Info" icon="list" href="/ja/api-capabilities/model-info">
    利用可能なすべてのモデルとグループを確認
  </Card>

  <Card title="API Manual" icon="book" href="/ja/api-manual">
    API 利用ガイドの完全版
  </Card>
</CardGroup>
