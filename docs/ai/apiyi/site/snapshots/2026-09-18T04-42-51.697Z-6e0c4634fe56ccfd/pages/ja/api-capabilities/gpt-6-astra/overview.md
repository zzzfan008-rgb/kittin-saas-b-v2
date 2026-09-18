> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-6 Astra テキスト生成

> APIYI の OpenAI GPT-6 Astra フラッグシップ：Responses と Chat Completions の両方が利用可能で、100万 tokens あたり入力 $10／出力 $50、Codex_Reverse グループでは半額です。公式リレーおよびリバース系統にまたがる220以上のチェック、4段階の推論データ、すべての差異に対する項目ごとの帰属情報を含みます。

GPT-6 Astra（`gpt-6-astra`）は、2026年9月3日にOpenAIがリリースした新世代のフラッグシップで、コンピュータ利用、ソフトウェアエンジニアリング、科学、長期的なエージェント作業向けに位置付けられています。1,050,000-tokenのコンテキストウィンドウ、128,000-tokenの最大出力、調整可能な推論強度を備えています。APIYIでは、**Responses** と **Chat Completions** の両エンドポイントを公開しており、リリース当日に3系統（OpenAI直結の公式リレー、Azure経由の公式リレー、`Codex_Reverse`）で同一の74項目マトリクスを実行しました。

<Info>
  **GPT-6 AstraはAPIYIで提供開始されています**：モデル名は`gpt-6-astra`です。`default` / `svip`の公式リレーグループはOpenAIと完全に同一の価格で、OpenAI直結とAzureという2つの公式系統により提供されます。`Codex_Reverse`グループ（Codexのリバースエンジニアリング済みリソース）は、**0.5倍の割引**で課金されます。**関数呼び出しとエージェントツールチェーンはResponsesでのみ利用可能**なため、新規プロジェクトはそちらで開始してください。
</Info>

<Warning>
  **Chat Completionsは関数toolsをサポートしていません。** `tools`を含むリクエストは、`reasoning_effort`または`tool_choice`にかかわらず、公式リレー系統ではアップストリームで拒否されます（400、Responsesへの移行を案内）。これはプラットフォームの問題ではなく、モデル側の制限です。関数呼び出しを使用する既存のChatコードは、Astraへ移行する際にResponsesへ移行する必要があります。
</Warning>

## 注目される理由

<CardGroup cols={2}>
  <Card title="タスクを完了するために構築" icon="monitor">
    Terminal-Bench 4.0 は 37.3% から 57.9% に、ScreenSpot-Pro は 76.9% から 92.7% に、OSWorld 2.0 は 72.6% に到達しました。最大の改善はいずれもエージェント型であり、OpenAI は複雑なタスクの平均完了時間が約 75 分から 40 分に短縮されたと報告しています。
  </Card>

  <Card title="105 万のコンテキスト、実測済み" icon="file-text">
    308K 文字（210,657 token）のニードルテストでは、10.3 秒で正しく回答しました。OpenAI は、タスクあたりの tokens が GPT-5.6 Sol より約 70% 少ないと報告しているため、実際のタスクあたりのコスト差は単価の 2.5 倍という差より小さくなります。
  </Card>

  <Card title="完全な Responses ツールチェーン" icon="bot">
    関数呼び出しは単一、並列、ラウンドトリップ、ストリーミングに対応し、ホスト型の `web_search` および `code_interpreter` ツールも動作します。暗号化された推論項目はステートレスに再実行できます。厳格な JSON Schema 出力はフィールドセットに完全に一致しました。
  </Card>

  <Card title="3 つのラインを測定し、すべての差異を特定" icon="git-fork">
    同じマトリクスを OpenAI 直接、Azure、Codex\_Reverse で実行しました。モデル能力は 3 者すべてで同一です。差異はすべてパイプラインにあり、このページではそれぞれをアップストリーム制限、グループ固有、またはライン固有として分類しています。
  </Card>
</CardGroup>

## モデル情報

| パラメータ             | 値                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| **モデル名**          | `gpt-6-astra`                                                                                                |
| **リリース**          | 2026年9月3日（OpenAI）；2026年9月5日にAPIYIで提供開始                                                                       |
| **入力モダリティ**       | テキスト、画像（リリース時点では音声または動画なし）                                                                                   |
| **出力モダリティ**       | テキスト                                                                                                         |
| **コンテキスト / 最大出力** | 1,050,000 / 128,000 tokens                                                                                   |
| **知識のカットオフ**      | 2026年4月30日                                                                                                   |
| **推論の強度**         | `low` / `medium` / `high` / `xhigh`、デフォルトは`medium`；`max`は`xhigh`としてエコーされます                                   |
| **グループ**          | `default`、`svip`（公式リレー）、`Codex_Reverse`（リバースエンジニアリング、0.5x）                                                   |
| **エンドポイント**       | `POST /v1/responses`（主要；ここで関数呼び出し可能）、`POST /v1/chat/completions`（互換用；関数toolsなし）                              |
| **ストリーミング**       | ✅ 両エンドポイントで利用可能；Chat の最終チャンクには使用量が含まれます                                                                      |
| **サイバー分類**        | Preparedness Framework「Critical」；公開リリースでは脆弱性発見タスクを拒否します；OpenAI直通回線は`access_programs.cyber = standard`をエコーします |

## 実測機能マトリクス

2026年9月5日、各系統74項目をチェック（公式系統ではコストを抑えるため、70K-tokenの長大コンテキストバリアントを使用）：

| 機能                                               | Responses                                                                       | Chat Completions                                     | 3系統間の比較                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 基本チャット（非ストリーミング / ストリーミング）                       | ✅ / ✅                                                                           | ✅ / ✅                                                | 同一。最小promptは入力tokens 7件が課金対象で、隠しインジェクションなし                                           |
| 推論強度 low / medium / high / xhigh                 | ✅ すべて正しい                                                                        | ✅                                                    | 同一。reasoning\_tokensは単調に増加                                                           |
| 推論強度 `max`                                       | ⚠️ 3系統すべてで`xhigh`としてエコー                                                         | ⚠️                                                   | 公式系統ではmaxのほうがxhighより多くの推論tokensを消費するため、正規化されたエコーでもレベルが適用されている可能性があります                |
| システムprompt                                       | ✅ `instructions` / `system`はいずれも動作                                              | ✅ 公式系統。⚠️ Codex\_Reverseは`system`を破棄し、`developer`は動作 | グループ固有                                                                               |
| **関数呼び出し**（単一 / ラウンドトリップ / 並列 / ストリーミング）         | ✅ / ✅ / ✅ 2呼び出し / ✅                                                             | ❌ 公式系統で400                                           | **アップストリームの制限**：Chatには関数toolsがありません                                                  |
| 構造化出力 `json_schema`（厳格）                          | ✅                                                                               | ✅                                                    | 同一。フィールドセットは完全に一致                                                                    |
| `json_object`                                    | ✅                                                                               | ✅                                                    | 同一                                                                                   |
| 画像入力（base64）                                     | ✅                                                                               | ✅                                                    | 同一。3つのカラーブロックをカウントして名前を付与                                                            |
| 画像入力（URL）                                        | ✅ ダウンロード可能なホスト                                                                  | ✅ 公式系統。⚠️ Codex\_Reverseは黙って破棄                       | リンクはサーバー側で取得可能である必要があります。Wikimediaなどのスクレイピング対策ホストは3系統すべてで失敗します                       |
| プロンプトキャッシュ                                       | ✅ 2回目の呼び出しで8.7Kプレフィックスがキャッシュヒット                                                 | ✅                                                    | 3系統すべてでヒットし、エンドポイント間で共有されます。API内の`cached_tokens`エコーは遅延する場合があります。コンソールのキャッシュ課金詳細が正確です |
| 長大コンテキスト                                         | ✅ 210K tokensを10.3秒、70Kを6.3秒                                                    | —                                                    | 同一                                                                                   |
| `web_search` / `web_search_preview`              | ✅ OpenAI直接、Codex\_Reverse                                                       | —                                                    | **Azure系統では一時的に無効化**（プラットフォーム通知：Bing課金をレビュー中）                                        |
| `code_interpreter`                               | ✅ 公式系統。❌ Codex\_Reverseは400                                                     | —                                                    | グループ固有                                                                               |
| `computer_use_preview`                           | ❌ 400 "gpt-6-astraではサポートされていません"                                                | —                                                    | アップストリームで未サポート                                                                       |
| 暗号化された推論（`include: reasoning.encrypted_content`） | ✅ 再実行で一貫性のある回答とともに200を返却                                                        | —                                                    | 同一                                                                                   |
| `previous_response_id`                           | ✅ 公式系統。⚠️ Codex\_Reverseは黙って無視                                                  | —                                                    | グループ固有。`GET /v1/responses/{id}`は3系統すべてで503を返却                                        |
| 出力上限                                             | ✅ 公式系統では`max_output_tokens` / `max_completion_tokens`が適用。⚠️ Codex\_Reverseでは未適用 | 同様                                                   | グループ固有。レガシーの`max_tokens`は公式系統で400を返却                                                 |
| `temperature`                                    | ❌ 公式系統で400。Codex\_Reverseでは受理されるものの無視                                           | 同様                                                   | アップストリームの制限。推論モデルでは一般的です                                                             |
| `text.verbosity` low / high                      | ✅ 約550文字 / 1350文字                                                               | —                                                    | 同一                                                                                   |
| `service_tier` flex / priority                   | ⚠️ 受理されるもののdefaultとしてエコー                                                        | —                                                    | 3系統すべてで標準ティア                                                                         |
| 8件の同時リクエスト                                       | ✅ 8/8                                                                           | —                                                    | 中央レイテンシ：OpenAI直接2.4秒、Azure 2.7秒、Codex\_Reverse 3.6秒                                  |

## reasoning の強度

Responses での同じ川渡りパズル。1 行あたりの reasoning\_tokens:

| `reasoning.effort`     | OpenAI 直接 | Azure | Codex\_Reverse | 結果 |
| ---------------------- | --------- | ----- | -------------- | -- |
| `low`                  | 12        | 28    | 22             | ✅  |
| `medium`（デフォルト）        | 33        | 43    | 62             | ✅  |
| `high`                 | 146       | 169   | 99             | ✅  |
| `xhigh`                | 246       | 320   | 199            | ✅  |
| `max`（`xhigh` がエコーされる） | 278       | 516   | 207            | ✅  |

<Warning>
  **`none` または `minimal` を送信しないでください。** `minimal` はすべての環境で拒否されます（公式系統では 400、Codex\_Reverse では `low` に書き換えられます）。`none` は 3 種類の異なる動作をします。OpenAI 直接では 400、Azure では受け入れられ、Codex\_Reverse では `medium` に書き換えられ、input\_tokens が 14 から 4394 に増加します（上流で約 4.2K tokens の隠し指示が注入されます）。使用可能なレベルは `low` / `medium` / `high` / `xhigh` です。
</Warning>

<Tip>
  reasoning tokens は出力 1M あたり \$50 のレートで課金されます。決定的なステップには `low` / `medium` を使用し、計画とデバッグには `xhigh` を確保してください。利用状況は Responses では `usage.output_tokens_details.reasoning_tokens`、Chat では `usage.completion_tokens_details.reasoning_tokens` から確認できます（公式系統では利用可能です）。
</Tip>

## 料金

### 公式リレーグループ（`default` / `svip`）

各リクエストの入力tokens数に応じて2つのティアがあり、入力が272Kを超えると、OpenAIと同様に**リクエスト全体**がティア2で課金されます。

| 入力tokens         | 入力      | 出力（推論を含む） | キャッシュ読み取り | キャッシュ書き込み（5分） |
| ---------------- | ------- | --------- | --------- | ------------- |
| 0 - 272K         | \$10.00 | \$50.00   | \$1.00    | \$12.50       |
| 272,001 - 1,050K | \$20.00 | \$75.00   | \$2.00    | \$25.00       |

### Codex\_Reverse グループ

公式価格の0.5倍です。ティア1は入力 \$5.00／出力 \$25.00／キャッシュ読み取り \$0.50／キャッシュ書き込み \$6.25 です。

<Info>
  APIYIはプロバイダーの価格に項目ごとに対応しています。割引はグループとチャージボーナスを通じて適用されます。詳細は[プロモーション](/ja/faq/recharge-promotions)を参照してください。グループ間の違いについては、[Codex、ClaudeCode、Default グループの違い](/ja/faq/codex-claudecode-default-groups)で説明しています。最新の価格は[モデル料金ページ](/en/models/index)で確認できます。
</Info>

## グループの選択

| グループ               | 価格   | 適した用途                                                            | 注記                        |
| ------------------ | ---- | ---------------------------------------------------------------- | ------------------------- |
| `default` / `svip` | 公式価格 | 本番環境、安定性が重要な作業、出力上限または`previous_response_id`が必要な用途               | OpenAI直接回線およびAzure公式回線で提供 |
| `Codex_Reverse`    | 0.5倍 | Codex CLIコーディング、Cherry Studioなどのクライアントでのチャット、OpenClawなどのエージェント構成 | 以下に記載する、グループ固有の5つの相違点     |

## 例

### Responses エンドポイント（推奨）

<CodeGroup>
  ```python Python（基本 + 推論の労力） theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.responses.create(
      model="gpt-6-astra",
      reasoning={"effort": "high"},   # low / medium / high / xhigh
      instructions="You are a senior backend engineer. Be concise.",
      input="Migrate this repo from Python 3.9 to 3.13 and list every file that needs changes, with reasons",
      max_output_tokens=4000,
  )
  print(response.output_text)
  print(response.usage.output_tokens_details.reasoning_tokens)
  ```

  ```python Python（関数呼び出し + Web 検索） theme={null}
  from openai import OpenAI
  import json

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")
  tools = [
      {"type": "web_search"},
      {"type": "function", "name": "get_weather", "description": "Current weather for a city",
       "parameters": {"type": "object", "properties": {"city": {"type": "string"}},
                      "required": ["city"], "additionalProperties": False}, "strict": True},
  ]
  r = client.responses.create(model="gpt-6-astra", tools=tools, reasoning={"effort": "low"},
                              input="Check the current weather in Beijing and Shanghai.")
  for item in r.output:
      if item.type == "function_call":
          print(item.name, json.loads(item.arguments))
  ```

  ```python Python（暗号化された推論によるステートレスなマルチターン） theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")
  history = [{"role": "user", "content": "Multiply 17 by 23. Answer with the number only."}]

  r1 = client.responses.create(
      model="gpt-6-astra", input=history, store=False,
      reasoning={"effort": "medium"}, include=["reasoning.encrypted_content"],
  )
  # Replay the previous turn's full output (including the encrypted reasoning item); works on all three lines, no server-side storage needed
  history += [item.model_dump(exclude_none=True) for item in r1.output]
  history.append({"role": "user", "content": "Now add 1 to the result. Number only."})

  r2 = client.responses.create(
      model="gpt-6-astra", input=history, store=False,
      reasoning={"effort": "medium"}, include=["reasoning.encrypted_content"],
  )
  print(r2.output_text)   # 392
  ```

  ```bash cURL（画像入力、base64） theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-6-astra",
      "reasoning": {"effort": "low"},
      "input": [{"role": "user", "content": [
        {"type": "input_text", "text": "How many colored blocks are in this image?"},
        {"type": "input_image", "image_url": "data:image/png;base64,iVBORw0KGgo..."}
      ]}]
    }'
  ```
</CodeGroup>

### Chat Completions エンドポイント（既存コードの移行、関数 tools なし）

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gpt-6-astra",
      reasoning_effort="high",
      max_completion_tokens=4000,      # not the legacy max_tokens (400)
      messages=[
          # system works on the official lines; Codex_Reverse drops it, and developer works everywhere
          {"role": "developer", "content": "You are a senior backend engineer. Be concise."},
          {"role": "user", "content": "Explain Python 3.13's free-threaded mode"},
      ],
  )
  print(response.choices[0].message.content)
  ```

  ```javascript Node.js（ストリーミング） theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({ apiKey: 'YOUR_API_KEY', baseURL: 'https://api.apiyi.com/v1' });

  const stream = await client.chat.completions.create({
    model: 'gpt-6-astra',
    reasoning_effort: 'low',
    messages: [{ role: 'user', content: 'Describe the Great Wall in three sentences' }],
    stream: true,
    stream_options: { include_usage: true },
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## 差異の帰属

同じマトリクスを3つの系統で実行すると、すべての差異は3つの区分のいずれかに分類されます。

### アップストリームの制限（3系統すべてで同一）

<AccordionGroup>
  <Accordion title="Chat Completions には関数 tools がない">
    `tools` を含むすべての Chat リクエストは、両方の公式系統で400を返し、Responses を使用するよう案内するアップストリームの文言が返されます。`reasoning_effort` を省略しても、`tool_choice: required` を追加しても変化はありません。`Codex_Reverse` グループが通過するのは、そのパイプラインが内部で Responses に変換するためだけなので、これを機能対応の証拠として扱わないでください。関数呼び出しには Responses を使用してください。
  </Accordion>

  <Accordion title="reasoning.effort の max は xhigh としてエコーされる">
    `max` に対する3/3のリクエストで、3系統すべてにおいて `xhigh` がエコーされました。公式系統では、max は xhigh より明らかに多くの推論 tokens を使用します（OpenAI 直接接続では278対379、Azureでは342対516対320）が、レベルは正規化されたエコーとともに適用されている可能性があります。Codex\_Reverse では違いはありません。4段階のレベルを提供します。
  </Accordion>

  <Accordion title="Chat パラメータ: max_tokens と temperature は400を返す">
    公式系統はレガシーの `max_tokens` を400で拒否し、`max_completion_tokens` を使用するよう求めます。`temperature` は、推論モデルでは通常どおり、未対応として400を返します。Codex\_Reverse は両方を受け入れますが無視します。既存コードを移行する際は両方を削除してください。
  </Accordion>

  <Accordion title="computer_use_preview は利用不可">
    3系統すべてで400「Tool 'computer\_use\_preview' is not supported with gpt-6-astra」が返されます。ローンチ資料にあるコンピュータ利用機能は、現時点ではこの tool タイプを通じて API に公開されていません。
  </Accordion>
</AccordionGroup>

### Codex\_Reverse グループのみ（5項目）

<AccordionGroup>
  <Accordion title="1. Chat は system メッセージを完全に破棄する">
    指示形式および情報形式の system メッセージはいずれも0/3でしたが、同じ内容を `developer` メッセージとして送ると3/3でした。両方の公式系統では `system` が3/3で通過します。**Chat では developer を使用してください**。これは3系統すべてで機能します。
  </Accordion>

  <Accordion title="2. 3つの出力上限パラメータはいずれも強制されない">
    `max_output_tokens: 20`、`max_tokens: 20`、または `max_completion_tokens: 20` を指定しても、出力は403 tokens であり、Responses は `max_output_tokens: null` をエコーしました。公式系統では `incomplete` / `length` により20で正しく切り詰められます。コスト管理のために上限が重要な場合は、公式リレーのグループを使用してください。
  </Accordion>

  <Accordion title="3. previous_response_id は暗黙的に無視される">
    `store: true` は依然として `false` をエコーし、2ターン目は最初のターンを記憶せずに200を返します。両方の公式系統では正しく記憶されます。このグループでは履歴をクライアント側で保持し、ステートレスな再実行のために `include: ["reasoning.encrypted_content"]` と組み合わせてください（3系統すべてで検証済み）。`GET /v1/responses/{id}` はどこでも503を返します。
  </Accordion>

  <Accordion title="4. Chat は画像 URL を暗黙的に破棄する">
    Chat で http(s) 画像リンクを使用すると、prompt\_tokens は15となり、モデルは画像を認識していないと回答しました。同じリンクは両方の公式系統で機能します。base64 は3系統すべての両方のエンドポイントで機能します。**このグループの Chat では画像を base64 として送信してください。**
  </Accordion>

  <Accordion title="5. effort none は約4.2K tokens の隠し指示を注入する">
    `none` は `medium` に書き換えられ、input\_tokens は14から4394に増加します（4224はキャッシュレートで `usage.attribution.request_fields.instructions` に帰属）。`minimal` は `low` に書き換えられます。このグループにはホスト型の `code_interpreter` tool もありません（400）。
  </Accordion>
</AccordionGroup>

### Azure 系統のみ（1項目）

<AccordionGroup>
  <Accordion title="web_search は一時的に無効化されている">
    Azure 系統で `web_search` / `web_search_preview` を含むリクエストは400を返し、Azure Bing の課金がレビュー中のため web\_search は一時的に無効化されており、ほかの tools は影響を受けないというゲートウェイ通知が返されます。OpenAI 直接接続系統と Codex\_Reverse グループは通常どおり機能します。復旧時にこのページを更新します。
  </Accordion>
</AccordionGroup>

## 移行ガイド

<AccordionGroup>
  <Accordion title="gpt-5.6-sol からの移行">
    Responses では、`model` フィールドのみを変更します。Chat では、`tools` を使用するものはすべて Responses に移行し、`max_tokens` と `temperature` を削除する必要があります。価格は Sol の現在のプロモーションレートの 2.5 倍（\$4 / \$20 → \$10 / \$50）であるため、まずエージェント、自動化、複雑なエンジニアリングタスクで直接比較を実施してください。日常的なチャット、分類、抽出は Terra / Luna のままにしてください。
  </Accordion>

  <Accordion title="Chat Completions から Responses への移行">
    `messages` → `input`、`reasoning_effort` → `reasoning: {"effort": ...}`、`response_format` → `text: {"format": ...}`、`system` → `instructions`、`max_completion_tokens` → `max_output_tokens`。ツール定義は `{"type": "function", "function": {...}}` から `{"type": "function", "name": ..., "parameters": ...}` にフラット化されます。完全なマッピングについては、[Responses 移行ガイド](/ja/api-capabilities/openai/responses-migration)を参照してください。
  </Accordion>

  <Accordion title="長大なコンテキストのコストを制御する">
    入力が 272K tokens を超えると、リクエスト全体が第2ティアで課金されます（入力は2倍、出力は1.5倍）。リポジトリ全体を一度に必要とする場合を除き、日常的なコンテキストは 272K 未満に抑え、安定したプレフィックスを先頭に配置してキャッシュにヒットさせてください（キャッシュされた読み取りは標準入力価格の10分の1です）。
  </Accordion>

  <Accordion title="セキュリティタスクは拒否されますか？">
    Astra は、OpenAI がその準備フレームワークにおいて Critical サイバーセキュリティレベルに位置付けた最初のモデルです。公開リリースでは、脆弱性の発見やエクスプロイトコードの作成などの攻撃的なタスクは拒否されます。防御的な作業には影響しません。3つすべてのラインで、SQLインジェクションに対するエンジニアリングプラクティスを求めるリクエストには、パラメータ化クエリ、最小権限などを網羅した完全な回答が返されました。
  </Accordion>
</AccordionGroup>

## 関連項目

* [GPT-6 Astra リリース記事（ベンチマークとモデル選択）](/en/news/gpt-6-astra-launch)
* [gpt-6-astra が半額の Codex\_Reverse グループに参加](/en/live/2026-09/codex-reverse-gpt-6-astra)
* [OpenAI 推論モデルガイド](/ja/api-capabilities/openai/reasoning-models)
* [OpenAI プロンプトキャッシュ](/ja/api-capabilities/openai/prompt-caching)
* [OpenAI 関数呼び出し](/ja/api-capabilities/openai/function-calling)
