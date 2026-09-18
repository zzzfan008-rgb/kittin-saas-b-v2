> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Responses API ネイティブガイド

> APIYI を通じて /v1/responses を呼び出します。状態管理、推論制御、組み込みツール、セマンティックなストリーミングイベントに対応しています。OpenAI が新規プロジェクトに推奨するエンドポイントです。

`/v1/responses` は OpenAI の現在の主力ネイティブ エンドポイントです。OpenAI の言葉を借りれば、「Chat Completions は引き続きサポートされていますが、**Responses はすべての新規プロジェクトに推奨されます**。」APIYI はこのエンドポイントを完全にサポートしています — base\_url を `https://api.apiyi.com/v1` に設定するだけです。

このページは OpenAI の公式ドキュメント（`developers.openai.com/api/docs`、2026年6月時点）に基づいています。すべての例は、コピーしてそのまま使えます。

## Responses を選ぶ理由

Chat Completions と比べて、OpenAI は 3 つの具体的な数値を挙げています。

* **より優れた推論**: 同じ推論モデルでも、Responses 経由では SWE-bench のスコアが約 3% 高くなります（推論状態がターンをまたいで保持されるため）
* **より安い入力**: キャッシュの利用率が Chat Completions より 40%〜80% 高く（OpenAI の内部テスト）、その分入力料金を直接削減できます
* **より多くのツール**: `web_search` や `code_interpreter` のような組み込みツールは Responses 専用です

Chat Completions が今でも適切な選択である場面: 既存のフレームワークに依存している場合（LangChain や多くのクライアントは既定で `/v1/chat/completions` を使います）、または Claude、Gemini、その他の非 OpenAI モデルも呼び出せる 1 つのコードベースが欲しい場合です。詳しくは [Compatible Mode](/ja/api-capabilities/openai/compatible) をご覧ください。

<Note>
  廃止されるのは **Assistants API**（2026年8月26日 (UTC) に終了予定）であり、Chat Completions ではありません。どちらのエンドポイントも長期的にサポートされ続け、新機能は単に Responses に先に追加されます。
</Note>

## クイックスタート

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "input": "Introduce yourself in one sentence",
      "instructions": "You are a concise assistant"
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.responses.create(
      model="gpt-5.4",
      input="Introduce yourself in one sentence",
      instructions="You are a concise assistant"
  )

  print(response.output_text)  # SDK helper that concatenates all text output
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await openai.responses.create({
    model: 'gpt-5.4',
    input: 'Introduce yourself in one sentence',
    instructions: 'You are a concise assistant'
  });

  console.log(response.output_text);
  ```
</CodeGroup>

<Tip>
  `response.output_text` を手書きの `output[0].content[0].text` より優先してください — 推論モデルでは、`output` 内の最初の項目は、しばしば `reasoning` 項目ではなく `message` 項目です。そのため、ハードコードされたインデックス指定はうまく動きません。
</Tip>

## リクエストパラメータ

| Parameter              | Type           | Default  | 説明                                                                             |
| ---------------------- | -------------- | -------- | ------------------------------------------------------------------------------ |
| `model`                | string         | required | 例: `gpt-5.4`, `gpt-5.5`                                                        |
| `input`                | string / array | required | ユーザー入力；マルチモーダルなコンテンツ配列をサポートします                                                 |
| `instructions`         | string         | null     | システム指示（system prompt 相当）                                                       |
| `max_output_tokens`    | int            | null     | 出力上限（推論 tokens を含む）                                                            |
| `reasoning`            | object         | medium   | `{"effort": "none/low/medium/high/xhigh"}`                                     |
| `text`                 | object         | —        | `format`（出力形式）、`verbosity`（低/中/高）                                              |
| `tools`                | array          | \[]      | 関数 + 組み込みツール                                                                   |
| `tool_choice`          | string         | "auto"   | `auto` / `required` / `none` / 特定のツール                                          |
| `parallel_tool_calls`  | boolean        | true     | 並列ツール呼び出しを許可する                                                                 |
| `store`                | boolean        | true     | レスポンスをサーバー側に保持する — ⚠️ **APIYI では利用できません**、下記のマルチターンを参照してください                   |
| `previous_response_id` | string         | null     | 前のレスポンスに連結する — ⚠️ **APIYI では効果がありません**；履歴を `input` 配列に渡してください                  |
| `conversation`         | string         | null     | 永続的な会話オブジェクト — ⚠️ **APIYI ではサポートされていません**（`/v1/conversations` は 404 を返します）     |
| `background`           | boolean        | false    | 非同期のバックグラウンド実行（長時間タスク / Pro モデル）                                               |
| `stream`               | boolean        | false    | ストリーミング（セマンティックイベント）                                                           |
| `prompt_cache_key`     | string         | null     | キャッシュルーティングキー — [キャッシュ課金](/ja/api-capabilities/openai/prompt-caching)を参照してください |
| `metadata`             | object         | {}       | カスタムメタデータ                                                                      |

<Warning>
  gpt-5 シリーズの推論モデルは **`temperature` / `top_p` をサポートしません** — 渡すとエラーになります。代わりに `reasoning.effort` と `text.verbosity` を使用してください。
</Warning>

## 応答構造

`output` はアイテムの配列です。一般的な 3 種類は、`reasoning`（推論サマリー）、`message`（テキスト返信）、`function_call`（関数呼び出しリクエスト）です。短縮した例:

```json theme={null}
{
  "id": "resp_abc123",
  "object": "response",
  "status": "completed",
  "model": "gpt-5.4-2026-03-05",
  "output": [
    { "type": "reasoning", "summary": [] },
    {
      "type": "message",
      "role": "assistant",
      "content": [{ "type": "output_text", "text": "Hi! I'm an AI assistant." }]
    }
  ],
  "usage": {
    "input_tokens": 24,
    "input_tokens_details": { "cached_tokens": 0 },
    "output_tokens": 58,
    "output_tokens_details": { "reasoning_tokens": 40 },
    "total_tokens": 82
  }
}
```

注目すべき `usage` フィールドは 2 つあります:

* `input_tokens_details.cached_tokens`: キャッシュにヒットした入力（課金は 0.1×）
* `output_tokens_details.reasoning_tokens`: 推論の消費量（出力レートで課金されます。`reasoning.effort` で調整します）

## マルチターン: 履歴を自分で管理する

APIYI 経由で Responses API を呼び出す場合、**完全な履歴を `input` 配列として渡してください**（各エントリに `role` / `content` を含めます）。Chat Completions と同じ方法です:

```python theme={null}
resp = client.responses.create(
    model="gpt-5.4",
    input=[
        {"role": "user", "content": "My name is Alice. Please remember it."},
        {"role": "assistant", "content": "Got it, your name is Alice."},
        {"role": "user", "content": "What's my name?"},
    ],
)
print(resp.output_text)  # Answers "Alice"
```

<Warning>
  **APIYI ではサーバー側の状態は利用できません — 依存しないでください。** ゲートウェイ経由で検証済み（複数モデル、リトライ遅延あり）:

  * `previous_response_id`: エラーなく受け付けられます（200 を返します）が、次のターンは前のターンを**記憶しません**（`input_tokens` は現在のターンのみを反映し、履歴は読み込まれません）;
  * `GET /v1/responses/{id}`: 400 を返します — 保存済みの応答は**取得できません**;
  * `conversation` オブジェクト（`/v1/conversations`）: 404 を返します — **サポートされていません**。

  そのため、APIYI では `store` / `previous_response_id` / `conversation` は**使用しないでください**。代わりに、上記の「`input` 配列で履歴を自前管理する」アプローチを常に使ってください。完全なクロスフォーマットガイド: [マルチターン会話ガイド](/ja/api-capabilities/multi-turn-conversation).
</Warning>

<Warning>
  **マルチターンでは入力課金は減りません**: 毎ターン、履歴全体を再送し、すべて input token として課金されます。長い会話では、キャッシュ割引でコストを抑えられます（履歴のプレフィックスは自動的に 0.1× のキャッシュレートにキャッシュヒットします）— [キャッシュ課金](/ja/api-capabilities/openai/prompt-caching) を参照してください。
</Warning>

## 推論と出力の制御

### reasoning.effort の選び方

| レベル           | いつ使うか                           |
| ------------- | ------------------------------- |
| `none`        | シンプルな Q\&A と形式変換 — 高速かつ低コスト     |
| `low`         | 日常的なチャット、要約                     |
| `medium` (既定) | 日々の開発におけるバランスの良い選択              |
| `high`        | 複雑なコード、段階的な推論                   |
| `xhigh`       | 最難関の問題。`gpt-5.5` / `gpt-5.4` 付き |

```python theme={null}
response = client.responses.create(
    model="gpt-5.5",
    input="Prove that the square root of 2 is irrational",
    reasoning={"effort": "xhigh"}
)
```

### text.verbosity

`low` / `medium` (既定) / `high` は回答の長さを制御します。Responses のみ:

```python theme={null}
response = client.responses.create(
    model="gpt-5.4",
    input="Explain closures",
    text={"verbosity": "low"}  # short version
)
```

## ストリーミング

Responses は、Chat Completions の一般的な `choices[0].delta` チャンクではなく、**セマンティックイベント** をストリームします。主なイベント:

| イベント                                     | 意味                                      |
| ---------------------------------------- | --------------------------------------- |
| `response.created`                       | Responses の開始                           |
| `response.output_item.added`             | 新しい出力アイテム（message / function\_call / …） |
| `response.output_text.delta`             | テキストの増分                                 |
| `response.function_call_arguments.delta` | Function 引数の増分                          |
| `response.completed`                     | 完了（最終的な usage を含む）                      |
| `error`                                  | 失敗                                      |

```python theme={null}
stream = client.responses.create(
    model="gpt-5.4",
    input="Write a short poem about autumn",
    stream=True
)

for event in stream:
    if event.type == "response.output_text.delta":
        print(event.delta, end="", flush=True)
    elif event.type == "response.completed":
        print("\n\nUsage:", event.response.usage)
```

## 組み込みツール

組み込みツールはResponses専用の機能です。`tools`で宣言すると、OpenAIがサーバー側で実行します。

| ツール         | タイプ                | 説明                                                                                                                                      |
| ----------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Web検索       | `web_search`       | モデルが自律的にWebを検索します                                                                                                                       |
| ファイル検索      | `file_search`      | アップロードされたベクトルストアにクエリを実行します                                                                                                              |
| コードインタープリター | `code_interpreter` | サンドボックス内でPythonを実行します                                                                                                                   |
| コンピューター操作   | `computer_use`     | 仮想デスクトップを操作します                                                                                                                          |
| リモートMCP     | `mcp`              | リモートMCPサーバーに接続します                                                                                                                       |
| 画像生成        | `image_generation` | インライン画像生成。**APIYIでは推奨されません**（呼び出しごとの固定料金で、安定性は保証されません）。代わりに[Images API](/ja/api-capabilities/gpt-image-2/text-to-image)を使用してください。従量課金です |
| ツール検索       | `tool_search`      | 大規模なツールセットを対象とした動的検索（gpt-5.4以降）                                                                                                         |

最小限の`web_search`の例：

```python theme={null}
response = client.responses.create(
    model="gpt-5.4",
    input="What are today's major AI news stories?",
    tools=[{"type": "web_search"}]
)
print(response.output_text)
```

<Info>
  組み込みツールはOpenAI側で実行されます。APIYIチャネルでのツールごとのパススルー対応については、テストで確認する必要があります。カスタム関数呼び出しは完全にサポートされています。[関数呼び出し](/ja/api-capabilities/openai/function-calling)を参照してください。
</Info>

## Proモデルとバックグラウンドモード

`gpt-5.4-pro`と`gpt-5.5-pro`は、プロフェッショナルなワークロード向けの深い推論モデルです（100万 tokensあたり \$30 / \$180、**svipグループのみ**）で、実際には\*\*`/v1/responses`経由でのみ利用可能\*\*です。1回のリクエストに数分かかることがあるため、`background: true`と組み合わせて使ってください:

```python theme={null}
# Submit a background task
response = client.responses.create(
    model="gpt-5.4-pro",
    input="Do a deep review of this architecture proposal: ...",
    background=True
)

# Poll for the result
import time
while response.status in ("queued", "in_progress"):
    time.sleep(10)
    response = client.responses.retrieve(response.id)

print(response.output_text)
```

<Warning>
  Proモデルは高価で遅いです — その代わりは「より信頼できる回答を待つ数分」です。日常的な開発では`gpt-5.4` / `gpt-5.5`を使ってください。明確な深い推論の必要がない限り、Proを選ばないでください。
</Warning>

## 対応モデルと料金

| モデル                 | 入力（100万 tokenあたり） | 出力（100万 tokenあたり） | 備考                                                                            |
| ------------------- | ----------------- | ----------------- | ----------------------------------------------------------------------------- |
| `gpt-5.6-sol`       | \$4.00            | \$20.00           | 最新のフラッグシップ、100万コンテキスト、`gpt-5.6`エイリアスが指します；9月3日に値下げ、少なくとも2026/11/21までプロモーション料金 |
| `gpt-5.6-terra`     | \$2.50            | \$15.00           | 5.6シリーズのバランスに優れた主力モデル                                                         |
| `gpt-5.6-luna`      | \$1.00            | \$6.00            | 軽量な5.6バリアント                                                                   |
| `gpt-5.4`           | \$2.50            | \$15.00           | 旧主力モデル、100万コンテキスト                                                             |
| `gpt-5.4-mini`      | \$0.75            | \$4.50            | 軽量で、優れたコストパフォーマンス                                                             |
| `gpt-5.5`           | \$5.00            | \$30.00           | 旧フラッグシップ、複雑な推論向け                                                              |
| `gpt-5.2`           | \$1.75            | \$14.00           | 旧主力モデル                                                                        |
| `gpt-5.1` / `gpt-5` | \$1.25            | \$10.00           | 予算に優しいモデル                                                                     |
| `gpt-5.4-pro`       | \$30.00           | \$180.00          | svip限定、レスポンスのみ、プロフェッショナル用途                                                    |
| `gpt-5.5-pro`       | \$30.00           | \$180.00          | svip限定、レスポンスのみ、プロフェッショナル用途                                                    |

固定日付バージョン（例：`gpt-5.4-2026-03-05`）も同じ料金で利用できます。全リスト：[モデルと料金](/ja/api-capabilities/model-info)。

## Chat Completionsからのマッピング

<Warning>
  **GPT-5.4（`gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna`を含む）以降、明示的な推論 effort と組み合わせたツール呼び出しは `/v1/chat/completions` で拒否される可能性があります**: `tools` を含むリクエストで、**明示的に**非`none`の `reasoning_effort` を送信すると、400 — `Function tools with reasoning_effort are not supported for ... in /v1/chat/completions` で失敗します。これは OpenAI の公式な制限です。このページで扱う `/v1/responses` エンドポイントにはこの制限はありません。これらのモデルでツール呼び出しを行う場合は Responses を使用してください。

  これが発生するかどうかは、リクエストがどの上流ルートに到達するかに**依存します**。そのため、同じモデルでも今は200を返し、後で400を返すことがあります。「前回は動作した」ことを、安全である証拠と決してみなさないでください。測定結果、2つの対処方法のトレードオフ、完全な移行手順については、[エンドポイントと移行](/ja/api-capabilities/openai/responses-migration)を参照してください。
</Warning>

`/v1/chat/completions`から移行する場合のフィールドマッピング:

| Chat Completions                       | Responses                                       | 注記                       |
| -------------------------------------- | ----------------------------------------------- | ------------------------ |
| `messages` 配列                          | `input`                                         | 単純なケースではプレーン文字列を使用できます   |
| system メッセージ                           | `instructions`                                  | 独立したパラメータ                |
| `max_tokens` / `max_completion_tokens` | `max_output_tokens`                             | —                        |
| `response_format`                      | `text.format`                                   | —                        |
| トップレベルの `reasoning_effort`             | `reasoning.effort`                              | Responses ではネストされたオブジェクト |
| `choices[0].message.content`           | `output_text`                                   | 結果の読み取り                  |
| ステートレス、手動の履歴                           | 手動の履歴も同様（`input` 配列）⚠️ APIYI ではサーバー側の状態は利用できません | —                        |
| `usage.prompt_tokens`                  | `usage.input_tokens`                            | フィールド名が異なります             |

<CodeGroup>
  ```python Chat Completions（旧） theme={null}
  response = client.chat.completions.create(
      model="gpt-5.4",
      messages=[
          {"role": "system", "content": "You are a concise assistant"},
          {"role": "user", "content": "Hello"}
      ]
  )
  content = response.choices[0].message.content
  ```

  ```python Responses（新） theme={null}
  response = client.responses.create(
      model="gpt-5.4",
      input="Hello",
      instructions="You are a concise assistant"
  )
  content = response.output_text
  ```
</CodeGroup>

## クライアントのサポート状況

なぜほとんどの VS Code 系 IDE やプラグイン（Cline、Trae など）は `/v1/chat/completions` しかサポートせず、このページで扱っている Responses エンドポイントはサポートしないのでしょうか？

* **chat/completions は事実上の業界標準です**: サードパーティ製ゲートウェイ、ローカル推論ランタイム（Ollama / vLLM / LM Studio）、そして OpenAI 以外のベンダーもすべてこれを実装しているため、1つのハンドラーで何百ものプロバイダーをカバーできます。一方で、`/v1/responses` は依然として実質的に OpenAI 専用の方言です
* **Responses は URL を差し替えるだけではありません**: 意味論的なイベントストリーミング（delta の連結ではありません）、item ベースの出力、推論状態の受け渡しはすべて chat/completions とは根本的に異なるため、クライアントはエージェントループ全体を書き換える必要があります
* **鶏と卵の問題です**: クライアントが実装しないのは、ほとんどのカスタムエンドポイント（ゲートウェイ）が Responses を提供していないからであり、ゲートウェイ側も同じ理由で急いで対応しません。APIYI はすでに `/v1/responses`（このページ）をホストしているため、ゲートウェイ側の障害はありません

2026年7月時点の主要クライアントのサポート状況:

| クライアント                                           | Responses 対応  | 備考                                                                                                                                                                                 |
| ------------------------------------------------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Codex CLI](/ja/scenarios/programming/codex-cli) | ✅ ネイティブ       | OpenAI によって開発されており、エージェントループ全体が Responses 上で動作します。chat/completions 対応は 2026年初頭に削除されました                                                                                             |
| [opencode](/ja/scenarios/programming/opencode)   | ✅             | OpenAI プロバイダーは既定で Responses を使用します                                                                                                                                                 |
| [Roo Code](/ja/scenarios/programming/roo-code)   | ✅（gpt-5.4 まで） | 「OpenAI」プロバイダーは Responses を使用し、カスタム Base URL を受け付けます（「OpenAI Compatible」プロバイダーはまだ chat/completions です）。提供終了済みで、プリセットモデルは `gpt-5.4` までです。Trae や他の VS Code 系 IDE のプラグインとしてインストールできます |
| Continue                                         | ✅             | gpt-5 / o-series では既定で Responses を使用します。Cursor に買収され、スタンドアロン製品は縮小中です                                                                                                               |
| [Cline](/ja/scenarios/programming/cline)         | ❌             | OpenAI Compatible の経路が chat/completions にハードコードされています。コミュニティの機能要望はまだ反映されていません                                                                                                      |
| [Trae](/ja/scenarios/programming/trae)           | ❌             | カスタムモデルは chat/completions と messages エンドポイントのみを提供します                                                                                                                               |

GPT-5.4 以降の「推論＋ツール呼び出し」ワークロードでは、Codex CLI / opencode が第一候補です。Base URL を `https://api.apiyi.com/v1` に向けてください。`gpt-5.4` で足りて、VS Code 系 IDE（Trae を含む）のまま使いたい場合は、Roo Code プラグインをインストールして、その OpenAI プロバイダーを選んでください。

## トラブルシューティング

| 症状                                                                | 原因と対処                                                                                                                                                                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model_not_supported` エラー                                         | モデルが responses エンドポイントをサポートしていません — gpt-5 シリーズを使用してください                                                                                                                                                       |
| マルチターンでコンテキストを忘れる                                                 | 最も安全な方法は、`input` 配列に完全な履歴を渡すことです。`previous_response_id` によるチェーンは 2026-09-02 のテストでは機能しましたが、`GET /v1/responses/{id}` はまだ利用できません — 依存する前に、ご自身のグループで確認してください                                                      |
| `output_text` が空                                                  | 出力はすべて `function_call` 項目です（モデルがツールの実行を要求しています） — `output` を反復処理してください                                                                                                                                        |
| `temperature` を渡すとエラー                                             | gpt-5 推論モデルではサポートされていません — 削除して、`reasoning.effort` を使用してください                                                                                                                                                  |
| `Function tools with reasoning_effort are not supported ...`（400） | `/v1/chat/completions` に関する GPT-5.4 以降の公式制限です（ツールと明示的な非-`none` reasoning\_effort は相互排他的です） — このページの `/v1/responses` エンドポイントに切り替えてください。移行手順は[エンドポイントと移行](/ja/api-capabilities/openai/responses-migration)にあります |

## 関連リンク

* このグループ: [互換モード](/ja/api-capabilities/openai/compatible) · [エンドポイントと移行](/ja/api-capabilities/openai/responses-migration) · [キャッシュ課金](/ja/api-capabilities/openai/prompt-caching) · [ファンクションコーリング](/ja/api-capabilities/openai/function-calling)
* token の取得 / 管理: `https://api.apiyi.com/token`
* OpenAI 移行ガイド: `developers.openai.com/api/docs/guides/migrate-to-responses`
