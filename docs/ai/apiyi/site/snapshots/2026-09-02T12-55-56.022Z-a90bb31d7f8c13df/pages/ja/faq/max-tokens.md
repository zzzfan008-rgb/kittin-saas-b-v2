> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# max_tokens とは？ 未設定の場合はどうなりますか？

> max_tokens パラメータ、OpenAI のパラメータ命名の変遷、未設定時のデフォルト動作、主要モデルの最大出力 token 制限について学びます。

## クイック回答

`max_tokens` は、モデルが1回の応答で生成できる最大 token 数を制御します。**APIYI は max\_tokens に対して追加の制限を設けません** — このパラメータは上流モデルに直接渡されます。ご自身で設定できます。設定しない場合は、モデルのデフォルト値が適用されます。

<Info>
  **APIYI の方針**: 私たちは max\_tokens の制限を設けません。完全に制御できます。未設定の場合は、各モデルのデフォルトの出力動作が使用されます。
</Info>

## max\_tokens の役割

`max_tokens`（最大出力 token 数）は、LLM API を呼び出す際によく使われるパラメータの1つです。モデルには次のように伝えます。**応答で生成する token はこの数までにする**。

* **低く設定しすぎる**: モデルの応答が途中で切れる場合があります（`finish_reason: "length"` を返します）
* **高く設定しすぎる**: モデルはその数の token を必ず生成するわけではありませんが、コストが高くなる可能性があります（出力 token ごとに課金するモデルがあります）
* **未設定**: モデルのデフォルト値が使われます（プロバイダによって異なります — 下の表を参照してください）

<Tip>
  **Token ≠ 文字**。英語では、おおよそ 1語 ≈ 1〜1.5 token です。中国語では、おおよそ 1文字 ≈ 1〜2 token です。4,096 token は約 3,000 英単語に相当します。
</Tip>

## OpenAI のパラメータ命名の変遷

OpenAI は、API や時期によって異なるパラメータ名を使っており、混乱の原因になることがあります。

| API 種別               | パラメータ名                  | 適用モデル                        | 導入時期              |
| -------------------- | ----------------------- | ---------------------------- | ----------------- |
| Chat Completions API | `max_tokens`            | GPT-3.5, GPT-4, GPT-4o など    | 元のバージョン           |
| Chat Completions API | `max_completion_tokens` | o1, o3, o4-mini 推論モデル        | 2024年9月（o1 のリリース） |
| Responses API        | `max_output_tokens`     | GPT-4o, GPT-5.4, o3, すべてのモデル | 2025年             |

### なぜ名称が変わったのか？

OpenAI が 2024年9月に o1 推論モデルをリリースした際、「隠れた推論 token」が導入されました。これは、モデルが内部で大量の推論 token を生成しますが、**レスポンスには表示されません**。

元の `max_tokens` は「生成された token 数」と「受け取る token 数」の両方を意味していましたが、推論モデルではこの 2 つはもはや同じではありません。そこで OpenAI は、**「レスポンスで受け取る token の上限」** を明示するために `max_completion_tokens` を導入しました。

その後、Responses API では、より直感的な名前である `max_output_tokens` に統一されました。

<Warning>
  **重要**: Chat Completions API で OpenAI の oシリーズ推論モデル（例: o3, o4-mini）を使う場合は、`max_completion_tokens` を使用する必要があります。`max_tokens` を使うとエラーになります。
</Warning>

## max\_tokens を設定しないとどうなりますか？

プロバイダによって動作が異なります。

| プロバイダ                | 未設定時のデフォルト動作                    | 備考                                          |
| -------------------- | ------------------------------- | ------------------------------------------- |
| **OpenAI**           | 制限なし（コンテキストウィンドウを使い切るまで出力します）   | モデルが自然に出力長を決めます                             |
| **Anthropic Claude** | ❌ **必須パラメータ — 未設定の場合はエラーになります** | Claude API では明示的な `max_tokens` が必要です        |
| **Google Gemini**    | デフォルトは 8,192 tokens です          | モデルがより多くをサポートしていても、返されるのは 8,192 tokens までです |
| **DeepSeek (チャット)**  | デフォルトは 4,000 tokens です          | 手動で 8,000 まで増やせます                           |
| **DeepSeek (推論)**    | デフォルトは 32,000 tokens です         | チェーン・オブ・ソート出力を含み、最大 64,000 です               |

<Warning>
  **特記事項**: Anthropic Claude API の `max_tokens` は **必須パラメータ** です。これを含めない場合、API はエラーを返します。Claude モデルを使用するときは、必ず設定してください。
</Warning>

## 最大出力 token 数の参照

以下は、よく使われるモデルの最大出力 token 制限です。**最新の値は必ず公式ドキュメントで確認してください**。モデルは頻繁に更新されるためです。

| モデル               | モデル ID               | 最大出力 token 数 | コンテキストウィンドウ |
| ----------------- | -------------------- | ------------ | ----------- |
| GPT-5.4           | `gpt-5.4-2026-03-05` | 128,000      | 1,047,576   |
| GPT-4o            | `gpt-4o`             | 16,384       | 128,000     |
| o3                | `o3`                 | 100,000      | 200,000     |
| Claude Opus 4.6   | `claude-opus-4-6`    | 128,000      | 1,000,000   |
| Claude Sonnet 4.6 | `claude-sonnet-4-6`  | 64,000       | 1,000,000   |
| Gemini 3.1 Pro    | `gemini-3.1-pro`     | 65,536       | 2,000,000   |
| DeepSeek V3       | `deepseek-chat`      | 8,000        | 64,000      |
| DeepSeek R1       | `deepseek-reasoner`  | 64,000       | 64,000      |

<Info>
  **公式ドキュメント**（最新の値について）:

  * OpenAI: `platform.openai.com/docs/models`
  * Anthropic Claude: `docs.anthropic.com/en/docs/about-claude/models`
  * Google Gemini: `ai.google.dev/gemini-api/docs/models`
  * DeepSeek: `api-docs.deepseek.com/api/create-chat-completion`
</Info>

## 推奨事項

<Tip>
  **ベストプラクティス**: すべての API 呼び出しで **`max_tokens` を明示的に設定する** ことを推奨します。理由は次のとおりです:

  * 異なるモデル/プロバイダーでは既定値が異なるため、予期しない切り捨てが発生することがあります
  * 出力長を制御し、不要な token 消費を防ぎます
  * Claude API では必須です — 一貫した習慣にするとエラーを減らせます
  * 典型的な設定: 一般的なチャット `2048-4096`, 長文生成 `8192-16384`, コード生成 `4096-8192`
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="APIYI は max_tokens に何らかの上限を設けていますか？">
    **いいえ**。APIYI は `max_tokens` パラメータを追加の制限なしでそのまま上流モデルに渡します。設定した内容がそのまま上流モデルに渡されます。制限はモデル自身の最大出力token上限のみです。
  </Accordion>

  <Accordion title="max_tokens をモデルの最大値より高く設定したらどうなりますか？">
    エラーは発生しません。モデルは自分自身の最大値まで生成するだけです。たとえば、GPT-4o の最大出力は 16,384 tokens です。`max_tokens: 100000` を設定しても、出力は最大でも 16,384 tokens になります。
  </Accordion>

  <Accordion title="max_tokens と max_completion_tokens の違いは何ですか？">
    どちらも出力tokens を制限するという同じ目的を持っています。違いは名称です。

    * `max_tokens`: OpenAI の元のパラメータ名で、GPT シリーズの非推論モデルで使われます
    * `max_completion_tokens`: 2024 年 9 月以降、OpenAI の o-series 推論モデルで使われます
    * `max_output_tokens`: OpenAI の Responses API における統一されたパラメータ名です

    APIYI 経由で呼び出す場合は、使用しているモデルと API 形式に応じて適切なパラメータ名を使ってください。
  </Accordion>

  <Accordion title="出力が途中で切れました（finish_reason が 'length'）— どうすれば解決できますか？">
    これは、モデルの出力が `max_tokens` の上限に達したことを意味します。解決策は次のとおりです。

    1. `max_tokens` の値を増やす
    2. より簡潔な応答が得られるよう prompt を最適化する
    3. 正しいパラメータ名を使っているか確認する（o-series モデルでは `max_completion_tokens` が必要です）
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="適切な AI モデルの選び方は？" icon="compass" href="/ja/faq/model-selection-guide">
    用途に最適なモデルを選択します
  </Card>

  <Card title="API 同時実行数の制限" icon="gauge" href="/ja/faq/api-concurrency">
    各モデルの同時実行数制限について学びます
  </Card>

  <Card title="Base URL 設定ガイド" icon="settings" href="/ja/faq/base-url-config">
    さまざまなツールで APIYI の Base URL を設定する方法
  </Card>

  <Card title="APIYI トークン管理" icon="key" href="https://api.apiyi.com/token">
    APIキーを管理し、使用状況と残高を確認します
  </Card>
</CardGroup>
