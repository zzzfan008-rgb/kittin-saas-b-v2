> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# エンドポイントの選択：GPT-5.4以降をResponsesへ移行

> GPT-5.4以降では、/v1/chat/completionsでtoolsと推論の強度を同時に送信すると、400エラーで明確に拒否されることがあります。このページでは、その問題に遭遇したことを確認する方法、2つの解決策から選択する方法、コードで何を変更するのか（ツール呼び出しの完全な変更前・変更後の例を含む）、および移行を検証する方法について説明します。

<Note>
  **要約**: GPT-5.4以降のモデルでは、**`tools`と明示的な`reasoning_effort`を同時に**（`none`以外の任意の値）`/v1/chat/completions`に送信すると、上流で400エラーとして拒否される場合があります: `Function tools with reasoning_effort are not supported ...`。

  対処方法は2つあります。**ツールを含むリクエストを`/v1/responses`に移行する**（推論とツールの両方を維持できるため推奨）か、**`reasoning_effort="none"`を明示的に設定する**（エンドポイントを維持する代わりに、推論を使用しない）方法です。`tools`を含まないリクエストには影響ありません。
</Note>

## まず、これに該当していることを確認してください

現れ方は3通りあります。2つ目が最も誤解しやすいものです。

### 症状1: 明示的な400エラー

```text theme={null}
Function tools with reasoning_effort are not supported for gpt-5.6-sol in
/v1/chat/completions. To use function tools, use /v1/responses or set
reasoning_effort to 'none'.
```

レスポンスには`param: reasoning_effort`が含まれます。これは**OpenAIによる公式の制限**であり、APIYIゲートウェイの問題ではありません。同じリクエストをOpenAIに直接送信しても、まったく同じ動作になります。

### 症状2: 成功することもあれば、失敗することもある

1つのモデルが複数の上流ルートの背後に配置されている場合があり、**すべてのルートでこの制限が適用されるわけではありません**。2026-09-02に、デフォルトのグループ、同じキー、同じ時間帯で、組み合わせごとに6回呼び出して独自に測定した結果は次のとおりです。

| モデル             | `tools` + `reasoning_effort="medium"` |
| --------------- | ------------------------------------- |
| `gpt-5.6-luna`  | 6/6で400を返しました                         |
| `gpt-5.6-sol`   | 6/6で200を返し、ツールが正しく呼び出されました            |
| `gpt-5.6-terra` | 6/6で200を返し、ツールが正しく呼び出されました            |
| `gpt-5.4`       | 6/6で200を返し、ツールが正しく呼び出されました            |

同じ日のそれ以前に、ある顧客が`gpt-5.6-sol`でこの400を受け取っています。

<Warning>
  **「ついさっきは動いた」という事実は、安全である証拠にはなりません。** 同じモデルと同じコードでも、時間帯やグループが変わると400を返し始める可能性があります。Responses APIに移行するか、`reasoning_effort="none"`を明示的に設定してください。どちらも、すべてのルートで安定して動作します。
</Warning>

### 症状3: エラーはないが、ツールが呼び出されない

モデルがツールを呼び出すはずなのに、代わりに雑談を返している場合（`finish_reason`が`stop`で、`tool_calls`が空）、まずプロンプトを書き直し始めないでください。`reasoning_effort`を`none`に明示的に設定して、もう一度送信してください。これでツールが正しく呼び出されるなら、問題はプロンプトではなくパラメータの組み合わせにあります。

## 制限の対象範囲

|                                                                                | 影響                                      |
| ------------------------------------------------------------------------------ | --------------------------------------- |
| `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna` / `gpt-5.5` / `gpt-5.4` ファミリー | はい — ルートによって異なります。上記を参照してください           |
| `gpt-5.2` / `gpt-5.1` / `gpt-5` 以前                                             | 公式発表の対象外です                              |
| Claude、Gemini、Grok およびその他の OpenAI 以外のモデル                                       | 無関係で、影響を受けません                           |
| `tools` のないリクエスト                                                               | 影響を受けません。任意の `reasoning_effort` を送信できます |
| `/v1/responses` へのリクエスト                                                        | 影響を受けません。推論と tools は連携して動作します           |

トリガーとなるのは、**非`none` の effort レベルを明示的に送信すること**です。テストでは、`low`、`medium`、`high`、`xhigh` の4つすべてでトリガーが発生しました。

<Note>
  **`reasoning_effort` を省略してもトリガーは発生しません。** 400 を確実に再現する `gpt-5.6-luna` ルートでは、4つすべての effort レベルで 400 が返されました。一方、パラメーターを省略した場合は、`tool_calls` が6回中6回、正常に返されました。そのため、緊急時の最小限の修正には2つの方法があります。`none` を明示的に設定するか、パラメーターを完全に削除してください。
</Note>

## どちらの移行先を選ぶべきか

|         | `/v1/responses` に移行                  | `reasoning_effort="none"` を設定     |
| ------- | ------------------------------------ | --------------------------------- |
| 推論を維持   | はい、あらゆる推論強度で完全に維持します                 | いいえ — 推論がオフになり、モデルは計画のステップを失います   |
| 変更の規模   | リクエストとレスポンスの形式がどちらも変わります。以下を参照してください | 追加するパラメータは1つ、変更は1行です              |
| 安定性     | すべてのルートで一貫しています                      | すべてのルートで一貫しています                   |
| 適している用途 | エージェント、複数ステップのツールオーケストレーション、長期的な解決策  | 本番環境での緊急対応、単純なツールロジック、まだ変更できないコード |

複雑なツール駆動タスクでは、推論をオフにするとモデルの性能が明らかに低下します。どのツールをどの順番で呼び出すかを考えるステップを失うためです。`none` は最終的な移行先ではなく、一時的な回避策として扱ってください。

## エラーを回避することだけが目的ではありません

制限に一度も遭遇しなかったとしても、新規プロジェクトでは OpenAI が Responses を推奨しています。公式には、同じ推論モデルでも Responses 経由のほうが SWE-bench のスコアが高く、キャッシュの利用効率は Chat Completions より大幅に優れており、ウェブ検索やコードインタープリターなどの組み込みツールはここでしか利用できません。数値と詳細については、[ネイティブ呼び出し](/ja/api-capabilities/openai/native)をご覧ください。

キャッシュに関するポイントは、請求額に反映される点です。**マルチターンエージェントはキャッシュヒットの恩恵を最も受けます**。そして、マルチターンエージェントは、まさに上記の制限に遭遇する可能性が最も高いワークロードです。キャッシュの課金方法とヒット率の読み方については、[プロンプトキャッシュ](/ja/api-capabilities/openai/prompt-caching)をご覧ください。

## どのグループに該当しますか

| 統合方法                                  | 対応方法                                                                                                                                                                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **コードを記述する**（OpenAI SDK または raw HTTP） | エンドポイントを変更します — 次のセクションを参照してください                                                                                                                                                                                                   |
| **フレームワークを使用する**（LangChain など）        | フレームワークにレスポンス切り替え機能があるか確認してください。LangChain には `ChatOpenAI(..., use_responses_api=True)` があります。切り替え機能がないフレームワークでは、`reasoning_effort="none"` または別のモデルを使用することになります                                                                     |
| **クライアントまたは IDE プラグインを使用する**          | クライアント側で変更できることはありません。レスポンスに対応したクライアントが必要です。完全な対応一覧は、[ネイティブ呼び出し](/ja/api-capabilities/openai/native) の「現在のクライアント対応状況」にあります。特定のツールについては、[Trae](/ja/scenarios/programming/trae) と [Cline](/ja/scenarios/programming/cline) を参照してください |

## コードで変更される点

完全なフィールドマッピングは[ネイティブ呼び出し](/ja/api-capabilities/openai/native)に記載されています。ここでは、このページのテーマであるツール呼び出しに関係する、重要な4つの違いだけを示します。

|           | Chat Completions                                 | Responses                                                      |
| --------- | ------------------------------------------------ | -------------------------------------------------------------- |
| 推論の強度     | トップレベルの `reasoning_effort="medium"`              | ネストされた `reasoning={"effort": "medium"}`                        |
| ツール定義     | ネスト形式: `{"type": "function", "function": {...}}` | フラット形式: `{"type": "function", "name": ..., "parameters": ...}` |
| 呼び出しの返却形式 | `message.tool_calls[]`、`id`で識別                   | `output`内の `function_call`アイテム、`call_id`で識別                    |
| 結果の返送形式   | `{"role": "tool", "tool_call_id": ...}`          | `{"type": "function_call_output", "call_id": ...}`             |

<Warning>
  2つのツール形式を**混在させることはできません**。Chat Completions形式のネストされた `function: {...}`定義を `/v1/responses`に送信する（またはその逆）ことが、SDKから「無効なパラメーター」エラーが返される最も一般的な原因です。[関数呼び出し](/ja/api-capabilities/openai/function-calling)で詳しく説明しています。
</Warning>

同じ天気ツールのループを、変更前と変更後で比較します。

<CodeGroup>
  ```python 変更前: Chat Completions theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_APIYI_KEY", base_url="https://api.apiyi.com/v1")

  tools = [{
      "type": "function",
      "function": {
          "name": "get_weather",
          "description": "Look up the weather for a city",
          "parameters": {
              "type": "object",
              "properties": {"city": {"type": "string"}},
              "required": ["city"],
          },
      },
  }]

  messages = [{"role": "user", "content": "What is the weather in Beijing today?"}]

  resp = client.chat.completions.create(
      model="gpt-5.6-luna", messages=messages, tools=tools,
      reasoning_effort="medium",              # sent alongside tools; may be rejected
  )

  call = resp.choices[0].message.tool_calls[0]
  messages.append(resp.choices[0].message)    # the assistant turn, verbatim
  messages.append({
      "role": "tool",
      "tool_call_id": call.id,
      "content": '{"temp": 26, "sky": "clear"}',
  })

  final = client.chat.completions.create(
      model="gpt-5.6-luna", messages=messages, tools=tools,
      reasoning_effort="medium",
  )
  print(final.choices[0].message.content)
  ```

  ```python 変更後: Responses theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_APIYI_KEY", base_url="https://api.apiyi.com/v1")

  tools = [{                                  # flat, with no "function" wrapper
      "type": "function",
      "name": "get_weather",
      "description": "Look up the weather for a city",
      "parameters": {
          "type": "object",
          "properties": {"city": {"type": "string"}},
          "required": ["city"],
          "additionalProperties": False,
      },
  }]

  history = [{"role": "user", "content": "What is the weather in Beijing today?"}]

  resp = client.responses.create(
      model="gpt-5.6-luna", input=history, tools=tools,
      reasoning={"effort": "medium"},         # nested, and unrestricted here
  )

  call = next(i for i in resp.output if i.type == "function_call")
  history += resp.output                      # append the whole output verbatim
  history.append({
      "type": "function_call_output",
      "call_id": call.call_id,                # note: call_id, not id
      "output": '{"temp": 26, "sky": "clear"}',
  })

  final = client.responses.create(
      model="gpt-5.6-luna", input=history, tools=tools,
      reasoning={"effort": "medium"},
  )
  print(final.output_text)
  ```
</CodeGroup>

どちらのスニペットもAPIYIのデフォルトグループに対して実行されています。1つ目は400エラーを確実に再現し、2つ目は呼び出し、返却、最終回答までの一連のループを完全に完了します。

<Tip>
  `history += resp.output`を省略しないでください。`function_call`に加えて、出力には `reasoning`アイテムが含まれる場合があります。これをそのまま送り返すことで、モデルは以前の思考の流れを継続できます。これこそが、複数ステップのツールタスクでResponsesの性能が向上する理由です。
</Tip>

## 移行時に多くの人が遭遇する落とし穴

<AccordionGroup>
  <Accordion title="output は choices ではありません — その中をインデックスで参照しないでください">
    `output` は **項目の配列**であり、`reasoning`、`message`、`function_call` のエントリを一度に保持できますが、順序や個数は保証されません。テキストには `resp.output_text` を使用し、ツール呼び出しには `type == "function_call"` をフィルタリングしながら反復処理してください。インデックスをハードコードしないでください。
  </Accordion>

  <Accordion title="パラメータの名称変更: max_tokens、response_format、temperature">
    `max_tokens`（または `max_completion_tokens`）は `max_output_tokens` になり、`response_format` は `text.format` になります。システムプロンプトは `messages` からトップレベルの `instructions` に移動できます。これとは別に、gpt-5 の推論モデルは、どちらのエンドポイントでも **`temperature` または `top_p` をサポートしていません** — これらを削除し、代わりに `reasoning.effort` でモデルを制御してください。
  </Accordion>

  <Accordion title="すべての使用量フィールドの名称が変更されます">
    `usage.prompt_tokens` は `usage.input_tokens` に、`completion_tokens` は `output_tokens` になり、キャッシュヒットは `usage.input_tokens_details.cached_tokens` に格納されます。使用量の集計も同時に更新してください。更新しないと、ゼロがサイレントに記録されます。
  </Accordion>

  <Accordion title="マルチターン: 履歴を自分で管理すれば常に機能しますが、チェーンの動作はグループによって異なります">
    最も安全な方法は、**`input` 配列を自分で管理し**、各ターンの `output` をそのまま追加することです。これはすべてのグループとすべてのモデルで有効であり、上記の例でもこの方法を使用しています。

    `previous_response_id` によるチェーンは、2026-09-02 のデフォルトグループでは機能しました — `gpt-5.6-sol`、`terra`、`luna`、`gpt-5.4` はいずれも前のターンを再呼び出しし、`store` はデフォルトで `true` になり、`store: false` を送信してからチェーンすると、前のレスポンスが見つからないことが正しく報告されます。`GET /v1/responses/{id}` による履歴の取得は、引き続き利用できません。**依存する前に、自分のグループで検証してください。** 背景情報: [マルチターン会話](/ja/api-capabilities/multi-turn-conversation)。
  </Accordion>

  <Accordion title="ストリーミングは差分の連結ではなく、意味を持つイベントストリームです">
    Chat Completions は一連の `delta` 増分をストリーミングし、Responses は `response.output_text.delta` や `response.function_call_arguments.delta` などの型付きイベントをストリーミングします。ストリーミングパーサーはそのまま再利用するのではなく、書き換える必要があります。[ネイティブ呼び出し](/ja/api-capabilities/openai/native)を参照してください。
  </Accordion>
</AccordionGroup>

## 移行の検証

HTTP 200 だけで判断しないでください。次の 4 つを確認してください。

<Steps>
  <Step title="出力に本当に function_call が含まれていることを確認する">
    `[i.type for i in resp.output]` を出力してください。`function_call` が表示され、高い effort レベルではその前に `reasoning` が表示されるはずです。`message` だけの場合、ツールは一度も呼び出されていません。
  </Step>

  <Step title="使用量フィールドに引き続き値が入っていることを確認する">
    `usage.input_tokens` と `output_tokens` がゼロ以外であり、`output_tokens_details.reasoning_tokens` が effort レベルに応じて変化することを確認してください。
  </Step>

  <Step title="キャッシュヒットが現れ始めることを確認する">
    複数のターンを実行し、`usage.input_tokens_details.cached_tokens` がゼロを超えて増加することを確認してください。これは、互換性モードに対して Responses が持つ最も直接的な課金上のメリットです。
  </Step>

  <Step title="以前 400 になっていたリクエストを再実行する">
    同じ `tools` と `reasoning_effort` の組み合わせが、これで安定して通るはずです。将来のモデル交換時に問題が直ちに明らかになるよう、回帰テストケースとして残してください。
  </Step>
</Steps>

## 移行しない場合

これは二者択一ではありません。以下の場合は、互換モードを使い続けてもまったく問題ありません。

* **tool calling を使用していない** — この制限は適用されず、任意の `reasoning_effort` を送信できます
* **1つのコードパスで複数のベンダーを呼び出している** — Claude と Gemini はここでは `/v1/chat/completions` のみを提供しており、OpenAI のためだけに分岐しても割に合わない可能性があります
* **フレームワークまたはクライアントによってエンドポイントが固定されている** — 対応するまで `reasoning_effort="none"` で現状を維持してください
* **`gpt-5.2` 以前を利用している** — 影響を受ける範囲外です

互換モードの完全な機能境界については、[互換モード](/ja/api-capabilities/openai/compatible)をご覧ください。

## FAQ

<AccordionGroup>
  <Accordion title="reasoning_effort=none にすると、具体的に何が失われますか？">
    モデルは明示的な推論を停止し、直接回答するようになります。明確なツール選択が必要な単一ステップのタスクではほとんど変化しませんが、モデルが呼び出し順序を考え出す必要がある複数ステップのオーケストレーションでは、目に見えて性能が低下します。これは目的地ではなく、橋渡しの手段です。
  </Accordion>

  <Accordion title="ツールを含むリクエストに対してのみ、エンドポイントを切り替えることはできますか？">
    はい。これは一般的な段階的移行方法です。通常のチャットは `/v1/chat/completions` に残し、ツールを含む処理だけを `/v1/responses` に移します。どちらのエンドポイントも同じキーと同じベース URL を使用し、料金も同一です。
  </Accordion>

  <Accordion title="エンドポイントを切り替えると料金は変わりますか？">
    いいえ。特定のモデルの入力料金と出力料金はどちらのエンドポイントでも同じで、課金モデルも同じです。[モデルと料金](/ja/api-capabilities/model-info) を参照してください。唯一の違いはキャッシュヒット率で、通常は Responses のほうが高いため、請求額は下がる傾向があります。
  </Accordion>

  <Accordion title="Claude と Gemini は影響を受けますか？">
    いいえ。これは OpenAI 独自の GPT-5.4+ モデルに対する OpenAI の制限です。`/v1/messages` 経由または互換モードの Claude と、ネイティブモードまたは互換モードの Gemini は、どちらもツール呼び出しと thinking を同時に使用できます。
  </Accordion>

  <Accordion title="Pro モデルが Responses 専用なのはなぜですか？">
    実際には、`gpt-5.4-pro` と `gpt-5.5-pro` は `/v1/responses` 経由でのみ利用でき、SVIP グループが必要です。これらは長時間実行されるよう設計されており、互換モードでは扱えないバックグラウンドモードとの組み合わせを前提としています。[ネイティブ呼び出し](/ja/api-capabilities/openai/native) を参照してください。
  </Accordion>

  <Accordion title="Chat Completions は廃止されるのですか？">
    いいえ。OpenAI が終了を予定しているエンドポイントは **Assistants API** であり、Chat Completions ではありません。両方のエンドポイントは長期的にサポートされますが、新機能はまず Responses に追加されます。
  </Accordion>
</AccordionGroup>

## 関連ページ

<CardGroup cols={3}>
  <Card title="ネイティブ呼び出し" icon="zap" href="/ja/api-capabilities/openai/native">
    Responsesエンドポイントの全容：パラメータ、レスポンス形式、組み込みツール、クライアント対応表
  </Card>

  <Card title="互換モード" icon="plug" href="/ja/api-capabilities/openai/compatible">
    Chat Completionsの仕組み、機能の境界、言語ごとのSDKセットアップ
  </Card>

  <Card title="関数呼び出し" icon="wrench" href="/ja/api-capabilities/openai/function-calling">
    両方のエンドポイントに対応した、ツール呼び出しの完全な例とストリーミングの組み立て
  </Card>
</CardGroup>
