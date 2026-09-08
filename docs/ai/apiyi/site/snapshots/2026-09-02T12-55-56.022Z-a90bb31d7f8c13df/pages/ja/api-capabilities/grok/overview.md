> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok モデルシリーズガイド

> APIYI における xAI Grok 4.x シリーズ (grok-4.6 / grok-4.5 / grok-4.3 / grok-4.20 / grok-build-0.1) は、OpenAI 互換 + Responses API のデュアルエンドポイントを備え、web search / X search / code execution / MCP のサーバーサイド tools が動作確認済みです。掲載価格は xAI 公式と一致しており、GrokOfficial グループは 0.8x のレート倍率で提供されています。

Grok は xAI の主力モデルファミリーです。現在の世代（Grok 4.x）は、主力の汎用、長コンテキスト標準、推論/非推論バリアント、コード特化、マルチエージェント協調という 5 つの製品ラインにまたがっており、すべて APIYI で利用できます。**xAI の公式 API 自体が OpenAI 互換です**（Chat Completions + Responses API、独自の専用プロトコルはありません）ので、APIYI 経由で OpenAI SDK を使って Grok を呼び出せば、ウェブ検索、X search、コード実行、Remote MCP を含む完全な機能セットを利用できます。

このドキュメント群は、2026年7月13日 (UTC+8) に APIYI ゲートウェイで実施した完全な実地テスト（リクエスト/レスポンスログ 56 件）に基づいており、ここで述べるすべての機能境界は検証済みです。

<Note>
  **🚀 ハイライト**: `grok-4.6` は xAI の最新旗艦モデルで、2026年8月7日にリリースされました。grok-4.5 の 1.5T パラメータ V9 基盤を再利用し、向上分はすべてポストトレーニングによるもので、**定価は grok-4.5 と同一**です。grok-4.3 と grok-4.20 シリーズは **1M-token のコンテキストウィンドウ**を提供し、Responses API のツール **web\_search / x\_search / code\_interpreter / MCP はすべて APIYI で動作確認済み**です。また、X search は Grok 固有の機能であり、ネイティブな Responses 対応により Grok は [OpenAI Codex にそのまま接続できます](/ja/scenarios/programming/codex-cli)。シリーズ全体は **`GrokOfficial` グループで 0.8 倍のレート倍率（20% オフ）** で利用できます — 下の「グループと割引」をご覧ください。
</Note>

## モデル一覧

<CardGroup cols={3}>
  <Card title="grok-4.6" icon="trophy">
    **最新のフラッグシップ · コード & エージェント**

    2026/8/7にリリース、500Kコンテキストです。grok-4.5と同じ基盤・同価格で、長時間実行タスクにおける自己検証がより強化されています。
  </Card>

  <Card title="grok-4.5" icon="medal">
    **前世代のフラッグシップ · 同価格**

    500Kコンテキストで、grok-4.6と同価格で掲載されています — 既存のワークロードはそのまま使い続けられます。
  </Card>

  <Card title="grok-4.3" icon="scale">
    **標準の主力モデル**

    フラッグシップ価格の約60%で1Mコンテキストを提供 — 日常的なチャットと中程度の推論に最適な、バランスの取れた選択です。
  </Card>

  <Card title="grok-4.20 バリアント" icon="split">
    **推論 / 非推論**

    `-reasoning` と `-non-reasoning` は同じ価格と1Mコンテキストを共有します。思考の連鎖を使うかどうかで選んでください。
  </Card>

  <Card title="grok-build-0.1" icon="code">
    **コード特化**

    256Kコンテキストでシリーズ最安価格 — 高頻度のコード補完や軽めのコーディングタスクに最適です。
  </Card>

  <Card title="grok-4.20-multi-agent-beta-0309" icon="users">
    **マルチエージェント協調**

    複数のエージェントが複雑なリサーチタスクを並列で処理します。特別な課金プロファイル — [マルチエージェントモデル](/ja/api-capabilities/grok/multi-agent) をご覧ください。
  </Card>

  <Card title="その他の機能ページ" icon="book-open">
    チャット/推論/ビジョン: [チャット & 推論](/ja/api-capabilities/grok/chat); ライブ検索: [ウェブ & X 検索](/ja/api-capabilities/grok/web-search)。
  </Card>
</CardGroup>

## 料金

掲載価格は xAI の公式料金と一致します（2026-07-13 に APIYI の料金 API と 1項目ずつ照合済みで、`grok-4.6` は 2026-08-13 に再検証済みです）。APIYI の割引は、**`GrokOfficial` グループの 0.8x** に加えて [チャージキャンペーン](/ja/faq/recharge-promotions) によるもので、両方が重複適用されます。

下の表は **0 – 200K コンテキスト階層** です（Grok シリーズ全体はコンテキスト長に応じた階層課金で、より高い階層は下で扱います）:

| モデルID                             | コンテキスト | 入力                 | 出力                 | 位置づけ                             |
| --------------------------------- | ------ | ------------------ | ------------------ | -------------------------------- |
| `grok-4.6`                        | 500K   | \$2.00 / 1M tokens | \$6.00 / 1M tokens | **最新フラッグシップ**: コード / エージェント / 汎用 |
| `grok-4.5`                        | 500K   | \$2.00 / 1M tokens | \$6.00 / 1M tokens | 旧フラッグシップ、4.6 と同価格                |
| `grok-4.3`                        | 1M     | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 標準的な主力モデル                        |
| `grok-4.20-0309-reasoning`        | 1M     | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 推論版                              |
| `grok-4.20-0309-non-reasoning`    | 1M     | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 非推論（高速・低コスト）                     |
| `grok-4.20-multi-agent-beta-0309` | 1M     | \$1.25 / 1M tokens | \$2.50 / 1M tokens | マルチエージェント（課金増幅あり！）               |
| `grok-build-0.1`                  | 256K   | \$1.00 / 1M tokens | \$2.00 / 1M tokens | コード重視                            |

### 階層課金とキャッシュ料金

Grok シリーズ全体は、**1回のリクエストのコンテキスト長** に基づいて 2 階層で課金され、境界は 200K tokens（200Ki = 204,800）です。それを超えると、入力と出力の料金は 2 倍になります:

| モデル                             | 階層          | 入力     | 出力      | キャッシュ読み取り |
| ------------------------------- | ----------- | ------ | ------- | --------- |
| `grok-4.6`                      | 0 – 200K    | \$2.00 | \$6.00  | \$0.50    |
| `grok-4.6`                      | 200K – 512K | \$4.00 | \$12.00 | \$1.00    |
| `grok-4.5`                      | 0 – 200K    | \$2.00 | \$6.00  | \$0.30    |
| `grok-4.5`                      | 200K – 512K | \$4.00 | \$12.00 | \$0.60    |
| `grok-4.3` / `grok-4.20` series | 0 – 200K    | \$1.25 | \$2.50  | \$0.20    |
| `grok-4.3` / `grok-4.20` series | 200K – 1M   | \$2.50 | \$5.00  | \$0.40    |
| `grok-build-0.1`                | 0 – 200K    | \$1.00 | \$2.00  | \$0.20    |
| `grok-build-0.1`                | 200K – 256K | \$2.00 | \$4.00  | \$0.40    |

金額はすべて 1M tokens あたりです。**`grok-4.6` と `grok-4.5` の唯一の価格差はキャッシュ読み取り料金です**（\$0.50 と \$0.30）— 入力と出力は同一です。

`grok-4.6` の両階層は、入力、出力、キャッシュ読み取りについて APIYI コンソールで項目ごとに検証済みです。ほかのモデルの第2階層キャッシュ読み取り料金は、xAI の「第2階層は 2 倍になる」という慣例に基づいています。そのため、[モデル情報ページ](/ja/api-capabilities/model-info) のライブ表示を正として扱ってください。

<Info>
  * 別名 `grok-code-fast` / `grok-code-fast-1` も呼び出し可能です（接続確認済み）。料金は [モデル情報ページ](/ja/api-capabilities/model-info) をご覧ください。
  * キャッシュされた入力 tokens は、上の表のキャッシュ読み取り料金で課金されます。Grok のプレフィックスキャッシングは **自動で、設定は不要です**。両方のエンドポイント、かつ ストリーミング / 非ストリーミング の両方で確認済みです。詳しくは [Grok キャッシュ課金ガイド](/ja/api-capabilities/grok/prompt-caching) をご覧ください。
  * 長いコンテキストの作業では階層の境界に注意してください。1つの 210K-token リクエストは、境界を超えた 10K 分だけでなく全体が第2階層で課金されます。リクエストを分割すれば、この跳ね上がりを回避できます。
</Info>

## グループと割引

| グループ           | 倍率       | 備考                                    |
| -------------- | -------- | ------------------------------------- |
| `Default`      | 1.0x     | デフォルトグループ。xAI公式と一致するリスト価格             |
| `GrokOfficial` | **0.8x** | xAI直結リレーライン — **デフォルトグループの価格から20%オフ** |

`GrokOfficial`は**デフォルトグループと同一のモデル挙動と呼び出し構文**です。これは純粋にプロモーションとして存在しており、Grokシリーズの利用をさらに促進するためのものです。Token を作成するときにこれを選ぶか、既存のGrok Tokenに追加してください。**コードの変更は不要**です。Codexでは、このグループでも`grok-4.6`およびシリーズの残りのモデルを引き続き利用できます。

この割引は[チャージ特典](/ja/faq/recharge-promotions)（10%～20%）と併用されます。第1段階で`grok-4.6`を適用すると：

| 基準                   | 入力 / 1M tokens | 出力 / 1M tokens |
| -------------------- | -------------- | -------------- |
| xAI公式 = APIYIのリスト価格  | \$2.00         | \$6.00         |
| `GrokOfficial`（0.8x） | \$1.60         | \$4.80         |
| 0.8x + 10% チャージボーナス  | \$1.45         | \$4.36         |
| 0.8x + 20% チャージボーナス  | **\$1.33**     | **\$4.00**     |

## 検証済み機能マトリクス

2026-07-13（UTC+8）に、APIYI ゲートウェイに対してテスト済み（✅ は動作確認済み、◐ は未テストですが同一アーキテクチャ上では同一挙動が想定されます、— は未対象ですが同一アーキテクチャ上では同一挙動が想定されます）:

| 機能                         |  grok-4.6  |  grok-4.5  |  grok-4.3  |  4.20-推論 | 4.20-非推論 | grok-build-0.1 | マルチエージェント |
| -------------------------- | :--------: | :--------: | :--------: | :------: | :------: | :------------: | :-------: |
| 基本チャット                     |      ✅     |      ✅     |      ✅     |     ✅    |     ✅    |        ✅       |     ✅     |
| ストリーミング（使用量付き）             |      ✅     |      ✅     |      ✅     |     ✅    |     ✅    |        ✅       |     ✅     |
| 思考の連鎖 `reasoning_content`  | ◐ デフォルトで有効 | ✅ デフォルトで有効 | ✅ デフォルトで有効 |     ✅    |  ❌ 設計上無効 |   ✅ デフォルトで有効   |    内部のみ   |
| `reasoning_effort` パラメータ   |      ◐     |      ✅     |      —     | ❌ 明示的に拒否 |     —    |        —       |     —     |
| 構造化出力 (json\_schema)       |      ◐     |      ✅     |      ✅     |     ✅    |     —    |        ✅       |     ✅     |
| 関数呼び出し / ツール利用             |      ◐     |      ✅     |      ✅     |     —    |     —    |        ✅       |     —     |
| ビジョン入力（画像理解）               |      ◐     |      ✅     |      ✅     |     —    |     ✅    |        —       |     —     |
| プロンプトキャッシュ（自動）             |      ✅     |      ✅     |      ✅     |     ✅    |     ✅    |        ✅       |     ✅     |
| Responses API + サーバーサイドツール |      ◐     |      ✅     |      —     |     —    |     —    |        —       |     —     |

<Note>
  **なぜ `grok-4.6` 列にまだ ◐ マークが付いているのか**: この 56 リクエストのテスト実行は 2026-07-13 のもので、4.6 が存在する前です。2026-08-19 に、4.6 で **基本チャット、ストリーミング（使用量付き）、およびプロンプトキャッシュ** を再テストしました。`/v1/chat/completions` と `/v1/responses` の両方で、ストリーミングと非ストリーミングの両方を対象に、課金を行ごとに照合したうえで実施したため、これらの行は現在、検証済み結果を示しています。残りの ◐ マークは同一アーキテクチャであるという前提を引き継いでいます。4.6 は 4.5 と同じ 1.5T パラメータの V9 基盤、API プロトコル、およびエンドポイントを共有しており、xAI はパラメータレベルでの破壊的変更を発表していません。本番投入する前に、ご自身のユースケースで小さなサンプルを実行してください。
</Note>

## エンドポイント

| エンドポイント                | メソッド   | 用途                                                            |
| ---------------------- | ------ | ------------------------------------------------------------- |
| `/v1/chat/completions` | `POST` | チャット / 推論 / 関数呼び出し / 構造化出力 / ビジョン（すべてのモデルで共通; `model` で選択）    |
| `/v1/responses`        | `POST` | Responses API: Web 検索、X 検索、コード実行、Remote MCP およびその他のサーバーサイドツール |

### Codex で直接利用する

Grok は `/v1/responses` をネイティブにサポートしているため、ネイティブな responses プロトコル上で **OpenAI Codex**（デスクトップアプリ / IDE 拡張 / CLI）で動作する、数少ない OpenAI 以外のモデルの 1 つです。`model = "grok-4.6"` と `wire_api = "responses"` を `config.toml` で設定すれば 5 分で接続でき、Codex のエージェント機能（ツール呼び出し、reasoning items など）もすべてネイティブプロトコル上で利用できます。対照的に、APIYI 上の Claude / Gemini は OpenAI 互換のチャットモード（`wire_api = "chat"` フォールバック）でのみ動作し、Codex / エージェントのシナリオではプロトコルの非互換が生じます。詳しいセットアップ手順: [Codex 統合ガイド](/ja/scenarios/programming/codex-cli)。

<Warning>
  **以下は APIYI ではサポートされません**（検証済み — これらの落とし穴を避けてください）:

  * **レガシー Completions（`/v1/completions`）**: 上流側で拒否されます — Grok 4.x 系列全体は推論アーキテクチャであり、公式レベルでは生テキスト補完をサポートしていません
  * **レガシーなライブ検索パラメータ `search_parameters`**: xAI によって削除されています（410 で確認済み）。ライブ検索はすべて Responses API の tools を経由します — [Web & X 検索](/ja/api-capabilities/grok/web-search) を参照してください
  * **Batch API / Files**: ゲートウェイ経由ではルーティングされません; キープールモードには適用されません
  * **Deferred Completions（`deferred: true`）**: そのパラメータは**静かに無視されます** — リクエストは同期的に実行され、通常どおり課金されます。これに依存しないでください
  * **Collections Search（RAG / file\_search）**: xAI コンソールで事前に構築されたコレクションが必要です; キープールモードには適用されません
  * **コンテキスト圧縮（`/v1/responses/compact`）**、**優先処理（`service_tier: "priority"` — テストではデフォルトにフォールバックします）**、**WebSocket モード**、**mTLS 認証**: すべて非対応です
</Warning>

## クイックスタート

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "grok-4.6",
      "messages": [
        {"role": "user", "content": "Introduce yourself in one sentence"}
      ]
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-api-key",
      base_url="https://api.apiyi.com/v1"
  )

  resp = client.chat.completions.create(
      model="grok-4.6",
      messages=[{"role": "user", "content": "Introduce yourself in one sentence"}]
  )
  print(resp.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'sk-your-api-key',
    baseURL: 'https://api.apiyi.com/v1',
  });

  const resp = await client.chat.completions.create({
    model: 'grok-4.6',
    messages: [{ role: 'user', content: 'Introduce yourself in one sentence' }],
  });
  console.log(resp.choices[0].message.content);
  ```
</CodeGroup>

<Tip>
  **どのモデルを選ぶか**: デフォルトは`grok-4.3`（1M のコンテキスト、バランスの取れた価格）です。コーディングエージェントや複雑なタスクには`grok-4.6`にアップグレードしてください（最新のフラッグシップで、`grok-4.5`と同一価格のため、既存の 4.5 のワークロードはモデル名を変更するだけで済みます）；高速で低コストの応答には`grok-4.20-0309-non-reasoning`を使用してください（思考過程なし、最安の出力です）；高頻度のコード補完には`grok-build-0.1`を使ってください；そして、マルチエージェントモデルは複雑なリサーチタスクにのみ使ってください（課金の増幅に注意してください）。最も実効レートを低くするには、Token を`GrokOfficial`グループ（0.8x）に移し、チャージボーナスを上乗せしてください。
</Tip>

## 課金に関する注意: 推論 token

`grok-4.6` / `grok-4.5` / `grok-4.3` / `grok-build-0.1` はデフォルトで内部推論します: 応答には `reasoning_content` が含まれ、推論 token は出力課金の対象になります。テストでは、短い回答で可視 token はわずか 30 でしたが、586 の出力 token（そのうち 556 は推論）として課金されました。コスト重視の短い Q\&A では、`grok-4.20-0309-non-reasoning` に切り替えてください。詳細は [チャット & 推論](/ja/api-capabilities/grok/chat) をご覧ください。

## よくある質問

<AccordionGroup>
  <Accordion title="Grok には独自のネイティブ API 形式がありますか？">
    個別の独自プロトコルはありません。xAI の公式 REST API は OpenAI 互換です: `/v1/chat/completions`（chat）と `/v1/responses`（Responses API とサーバー側ツール）。OpenAI SDK の接続先を `https://api.apiyi.com/v1` にすると、全機能セットが使えます — 「互換モードのダウングレード」はありません。
  </Accordion>

  <Accordion title="Web 検索を有効にするにはどうすればよいですか？">
    Responses API を使ってください: `tools: [{"type": "web_search"}]`（または `x_search`）。Chat Completions 上の旧式の `search_parameters` フィールドは xAI により削除済みです（410 を確認済み）— 使用しないでください。[Web と X の検索](/ja/api-capabilities/grok/web-search) を参照してください。
  </Accordion>

  <Accordion title="モデルが Grok 4 と名乗りますが、私のリクエストは間違ったモデルに当たっていますか？">
    これは正常です。すべての Grok 4.x モデルは単に「Grok 4」と自己識別し（マルチエージェントモデルは自分を Oppie と呼びます）、4.6 / 4.5 / 4.3 のような正確なバージョン番号は返しません。モデルの自己紹介ではなく、リクエストとレスポンスの `model` フィールドで識別情報を確認してください。
  </Accordion>

  <Accordion title="キャッシュに設定は必要ですか？">
    いいえ。Grok のプレフィックスキャッシュは自動です。キャッシュヒットは `usage.prompt_tokens_details.cached_tokens` で確認できます（`/v1/responses` では `usage.input_tokens_details.cached_tokens` を読んでください）。ヒットは 128 tokens 単位で切り捨てられます。2 回の検証でも一致しており、8802-token のプレフィックスは 8704、2735-token のプレフィックスは 2688 でした。xAI は、キャッシュエントリは追い出される可能性があり、ヒットは保証されないと述べているため、**キャッシュ未使用時の価格で見積もってください**。詳細は [Grok cache 課金ガイド](/ja/api-capabilities/grok/prompt-caching) を参照してください。
  </Accordion>

  <Accordion title="コンテキストウィンドウを超えるとどうなりますか？">
    400 エラーです。上限はモデルごとに異なり、grok-4.6 と grok-4.5 は 500K、grok-4.3 と 4.20 系列は 1M、grok-build-0.1 は 256K です。長いコンテンツには、要約する、チャンクに分割する、または RAG 検索を使ってください。
  </Accordion>

  <Accordion title="失敗したリクエストは課金されますか？">
    4xx のクライアントエラー（不正なパラメータ / 認証失敗）は課金されません。token を正常に返したリクエストは、実際の使用量に基づいて課金されます。なお、`deferred: true` は何も通知されず無視されます — 実際には同期的に実行され、通常どおり課金されます。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="チャット & 推論" icon="message-square" href="/ja/api-capabilities/grok/chat">
    ストリーミング、思考の連鎖、構造化出力、関数呼び出し、ビジョン、キャッシング
  </Card>

  <Card title="キャッシュ課金" icon="database" href="/ja/api-capabilities/grok/prompt-caching">
    ヒット時75%オフ、128-tokenブロック粒度、そして長い会話に適したエンドポイント
  </Card>

  <Card title="ウェブ & X 検索" icon="globe" href="/ja/api-capabilities/grok/web-search">
    Responses API の web\_search / x\_search ツールをハンズオンで紹介
  </Card>

  <Card title="コード実行 & MCP" icon="terminal" href="/ja/api-capabilities/grok/code-execution-mcp">
    サーバーサイドの Python サンドボックスとリモート MCP の統合
  </Card>

  <Card title="マルチエージェントモデル" icon="users" href="/ja/api-capabilities/grok/multi-agent">
    マルチエージェントモデルの機能と課金プロファイル
  </Card>

  <Card title="Codex で Grok を使う" icon="code" href="/ja/scenarios/programming/codex-cli">
    ネイティブな responses プロトコルで、5分で Codex に接続
  </Card>

  <Card title="Grok 4.6 ローンチ詳細解説" icon="newspaper" href="/en/news/grok-4-6-launch">
    xAI の最新フラッグシップのベンチマーク、料金、移行メモ
  </Card>

  <Card title="Grok 4.5 ローンチ詳細解説" icon="newspaper" href="/en/news/grok-4-5-launch">
    前のフラッグシップを詳しく解説
  </Card>

  <Card title="モデル情報" icon="database" href="/ja/api-capabilities/model-info">
    利用可能なすべてのモデルとグループ
  </Card>
</CardGroup>
