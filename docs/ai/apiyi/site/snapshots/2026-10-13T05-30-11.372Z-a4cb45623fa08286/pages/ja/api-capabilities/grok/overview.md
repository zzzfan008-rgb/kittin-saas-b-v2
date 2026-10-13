> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok モデルシリーズガイド

> APIYI における xAI Grok 4.x シリーズ (grok-4.7 / grok-4.6 / grok-4.5 / grok-4.3 / grok-4.20 / grok-build-0.1)：OpenAI 互換 + Responses API デュアルエンドポイントに対応し、Web 検索 / X 検索 / コード実行 / MCP サーバーサイド tools の動作を確認済みです。料金は xAI 公式と同等で、デフォルトグループは公式リレー回線です。

Grok は xAI のフラグシップモデルファミリーです。現世代（Grok 4.x）は、フラグシップ汎用、ロングコンテキスト標準、推論／非推論バリアント、コード特化、マルチエージェント協働の5つの製品ラインにまたがり、すべて APIYI で利用可能です。**xAI の公式 API はそれ自体が OpenAI 互換**（Chat Completions + Responses API）であり、独自のプロトコルを別途持たないため、OpenAI SDK を使用して APIYI 経由で Grok を呼び出すことで、公式サーバーサイド tools（Web 検索、X 検索、コード実行、Remote MCP）を含む全機能セットを利用できます。

このドキュメントグループは、2026年7月13日 (UTC+8) に APIYI ゲートウェイに対して行われた実機検証（56件のリクエスト／レスポンスログ）に基づいており、ここに記載されているすべての機能境界が検証済みです。

<Note>
  **🚀 ハイライト**: `grok-4.7` は、2026年9月21日にリリースされた SpaceXAI (xAI) の最新フラグシップです。新たに 2.1T パラメータのベースモデルへ移行し、コーディングエージェントにおいて最大の向上が見られ、その**価格は grok-4.6 と同一**です。grok-4.3 および grok-4.20 シリーズは **1M token のコンテキストウィンドウ**を提供します。Responses API tools の **web\_search / x\_search / code\_interpreter / MCP はすべて APIYI 上で動作検証済み**であり、X 検索は Grok 独自の機能です。ネイティブな responses サポートにより、Grok は[OpenAI Codex に直接接続可能](/ja/scenarios/programming/codex-cli)でもあります。Grok シリーズ全体がデフォルトグループの xAI 公式リレー回線で稼働し、価格は xAI と同一です。詳細は下記の「グループと割引」を参照してください。
</Note>

## モデルラインナップ

<CardGroup cols={3}>
  <Card title="grok-4.7" icon="trophy">
    **最新フラグシップ · コード＆エージェント**

    2026/9/21リリース、500Kコンテキスト。grok-4.6と同価格の新しい2.1Tパラメータベースモデルであり、長大なコーディングタスクにおいて明確な向上が見られます。
  </Card>

  <Card title="grok-4.6" icon="award">
    **前世代フラグシップ · 同価格**

    2026/8/7リリース、500Kコンテキスト。grok-4.5と同じ基盤を持ち、長時間実行タスクにおける自己検証能力が強化されています。
  </Card>

  <Card title="grok-4.5" icon="medal">
    **前世代フラグシップ · 同価格**

    500Kコンテキストで、入力および出力価格はgrok-4.6と同額です — 既存のワークロードをそのまま維持できます。
  </Card>

  <Card title="grok-4.3" icon="scale">
    **スタンダードな主力モデル**

    フラグシップ価格の約60%で1Mコンテキストを提供 — 日常的なチャットや中級レベルの推論において、バランスの取れた選択肢です。
  </Card>

  <Card title="grok-4.20バリアント" icon="split">
    **推論 / 非推論**

    `-reasoning`と`-non-reasoning`は同価格で1Mコンテキストを備えています。思考の連鎖（chain-of-thought）が必要かどうかに応じて選択してください。
  </Card>

  <Card title="grok-build-0.1" icon="code">
    **コード特化**

    256Kコンテキストでシリーズ最安値 — 高頻度のコード補完や軽めのコーディングタスクに最適です。
  </Card>

  <Card title="grok-4.20-multi-agent-beta-0309" icon="users">
    **マルチエージェント協調**

    複雑なリサーチタスクにおいて複数のエージェントが並行して動作します。特別な課金プロファイルが適用されます — 詳細は[マルチエージェントモデル](/ja/api-capabilities/grok/multi-agent)をご覧ください。
  </Card>

  <Card title="その他の機能ページ" icon="book-open">
    チャット/推論/ビジョン: [チャット＆推論](/ja/api-capabilities/grok/chat)、ライブ検索: [Web＆X検索](/ja/api-capabilities/grok/web-search)。
  </Card>
</CardGroup>

## 料金

料金はxAIの公式価格に準拠しており（2026-07-13にAPIYI料金APIと項目ごとに照合済み。`grok-4.6`は2026-08-13、`grok-4.7`は2026-09-24に再確認済み）、[チャージキャンペーン](/ja/faq/recharge-promotions)も併用可能です。

以下の表は**0 – 200K コンテキスト層**の料金です（Grokシリーズ全体がコンテキスト長に応じた段階課金を採用しており、上位層については後述します）：

| モデルID | コンテキスト | 入力 | 出力 | 位置付け |
| - | - | - | - | - |
| `grok-4.7` | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | **最新フラグシップ**：コード / エージェント / 汎用 |
| `grok-4.6` | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | 前世代フラグシップ、4.7と同価格 |
| `grok-4.5` | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | 前世代フラグシップ、4.6と同価格 |
| `grok-4.3` | 1M | \$1.25 / 1M tokens | \$2.50 / 1M tokens | スタンダード（主力モデル） |
| `grok-4.20-0309-reasoning` | 1M | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 推論特化版 |
| `grok-4.20-0309-non-reasoning` | 1M | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 非推論版（高速・低コスト） |
| `grok-4.20-multi-agent-beta-0309` | 1M | \$1.25 / 1M tokens | \$2.50 / 1M tokens | マルチエージェント（課金増幅に注意！） |
| `grok-build-0.1` | 256K | \$1.00 / 1M tokens | \$2.00 / 1M tokens | コード特化 |

### 段階課金とキャッシュ料金

Grokシリーズ全体では、**単一リクエストのコンテキスト長**に基づいて2段階で課金され、その境界は200K tokens（200Ki = 204,800）です。この境界を超えると、入力および出力料金が2倍になります：

| モデル | ティア | 入力 | 出力 | キャッシュ読み取り |
| - | - | - | - | - |
| `grok-4.7` | 0 – 200K | \$2.00 | \$6.00 | \$0.50 |
| `grok-4.7` | 200K – 500K | \$4.00 | \$12.00 | \$1.00 |
| `grok-4.6` | 0 – 200K | \$2.00 | \$6.00 | \$0.50 |
| `grok-4.6` | 200K – 512K | \$4.00 | \$12.00 | \$1.00 |
| `grok-4.5` | 0 – 200K | \$2.00 | \$6.00 | \$0.30 |
| `grok-4.5` | 200K – 512K | \$4.00 | \$12.00 | \$0.60 |
| `grok-4.3` / `grok-4.20` シリーズ | 0 – 200K | \$1.25 | \$2.50 | \$0.20 |
| `grok-4.3` / `grok-4.20` シリーズ | 200K – 1M | \$2.50 | \$5.00 | \$0.40 |
| `grok-build-0.1` | 0 – 200K | \$1.00 | \$2.00 | \$0.20 |
| `grok-build-0.1` | 200K – 256K | \$2.00 | \$4.00 | \$0.40 |

すべての数値は1M tokensあたりの価格です。`grok-4.7`と`grok-4.6`は4つの課金項目すべてで同一です。**`grok-4.6`と`grok-4.5`の唯一の価格差はキャッシュ読み取り料金**（\$0.50 対 \$0.30）であり、入力と出力は同一です。

`grok-4.7`および`grok-4.6`の両ティアについて、入力、出力、キャッシュ読み取りの項目ごとに照合済みです（`grok-4.7`のティア境界は200,000 tokens）。その他のモデルの第2ティアのキャッシュ読み取り料金は、xAIの「第2ティアは2倍」という慣例から算出されているため、[モデル情報ページ](/ja/api-capabilities/model-info)の最新料金を正確な情報として参照してください。

<Info>
  * エイリアス `grok-code-fast` / `grok-code-fast-1` も呼び出し可能です（接続確認済み）。料金については[モデル情報ページ](/ja/api-capabilities/model-info)をご確認ください。
  * キャッシュされた入力 tokens は、上表のキャッシュ読み取り料金で課金されます。Grokのプレフィックスキャッシュは**自動適用され、設定は不要**です。両エンドポイントおよびストリーミング／非ストリーミングの双方で検証済みです。詳細は[Grokキャッシュ課金ガイド](/ja/api-capabilities/grok/prompt-caching)をご確認ください。
  * 長いコンテキストを扱う作業ではティアの境界にご注意ください。単一の210K-tokenのリクエストは、超過分の10Kだけでなく、全体が第2ティアで課金されます。リクエストを分割することでこの料金跳ね上がりを回避できます。
</Info>

## グループと割引

| グループ | 倍率 | 備考 |
| - | - | - |
| `default` | 1.0x | デフォルトグループ。xAI 公式リレー回線であり、価格は xAI と同一です |
| `CodexResponses` | 1.0x | Codex およびその他の Responses クライアント向け。デフォルトグループと同じモデルおよび価格です |

Grok シリーズはデフォルトグループで xAI 公式リレー回線を使用しているため、個別の公式リレーグループは提供されなくなりました。以前の `GrokOfficial` グループは一覧に表示されなくなりましたが、こちらも 1 倍で動作しており、すでに使用している Tokens に変更は不要です。

さらにコストを抑えるには、1 回あたりのチャージ金額に応じて段階的に適用される[チャージボーナス](/ja/faq/recharge-promotions)を併用してください。

## 検証済みの機能マトリックス

2026-07-13 (UTC+8) に APIYI ゲートウェイに対してテストを実施（✅ 動作検証済み、◐ 未テスト・同一アーキテクチャ上で同等と予想、— 対象外・同一アーキテクチャ上で同等と予想）：

| 機能 | grok-4.6 | grok-4.5 | grok-4.3 | 4.20-reasoning | 4.20-non-reasoning | grok-build-0.1 | multi-agent |
| - | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| 基本チャット | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ストリーミング（使用量を含む） | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 思考の連鎖（Chain-of-thought） `reasoning_content` | ◐ デフォルトで有効 | ✅ デフォルトで有効 | ✅ デフォルトで有効 | ✅ | ❌ 仕様により無効 | ✅ デフォルトで有効 | 内部限定 |
| `reasoning_effort` パラメータ | ◐ | ✅ | — | ❌ 明示的に拒否 | — | — | — |
| 構造化出力（json\_schema） | ◐ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| ファンクションコーリング（Function calling）/ ツール利用（Tool Use） | ◐ | ✅ | ✅ | — | — | ✅ | — |
| Vision 入力（画像理解） | ◐ | ✅ | ✅ | — | ✅ | — | — |
| プロンプトキャッシュ（自動） | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Responses API + サーバー側 tools | ◐ | ✅ | — | — | — | — | — |

<Note>
  **`grok-4.6` 列に依然として ◐ マークが付いている理由**: この56件のリクエストによるテスト実行は、4.6が存在する前の2026-07-13のものです。2026-08-19に、4.6において**基本チャット、ストリーミング（使用量を含む）、およびプロンプトキャッシュ**を再テストしました — `/v1/chat/completions`と`/v1/responses`の両方にわたり、ストリーミングと非ストリーミングの両方で、課金を1行ずつ照合しました — そのため、これらの行は現在検証済みの結果を報告しています。残りの ◐ マークは、同一アーキテクチャに基づく予測を引き継いでいます。4.6は4.5と1.5TパラメータのV9基盤、APIプロトコル、エンドポイントを共有しており、xAIは破壊的なパラメータレベルの変更を発表していません。本番環境に導入する前に、ご自身のユースケースで少量のサンプルを実行してください。

  `grok-4.7`（2026-09-21リリース）は、まだこのマトリックスに含まれていません。新しい2.1Tベースモデルに移行しているため、上記の同一基盤に基づく推測は適用されません。採用する前に、ご自身のユースケースで少量のサンプルを実行してください。
</Note>

## エンドポイント

| エンドポイント | メソッド | 用途 |
| - | - | - |
| `/v1/chat/completions` | `POST` | チャット / 推論 / 関数呼び出し / 構造化出力 / ビジョン（すべてのモデルで共通; `model` で選択） |
| `/v1/responses` | `POST` | Responses API: Web 検索、X 検索、コード実行、Remote MCP およびその他のサーバーサイドツール |

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
  **モデルの選び方**: 基本は`grok-4.3`（1Mコンテキスト、バランスの取れた価格）をお使いください。コーディングエージェントや複雑なタスクには`grok-4.7`へのアップグレードを推奨します（最新のフラグシップで、価格は`grok-4.6`と同一ですが、タスクあたりの出力 tokens が多くなるため、まずは実際のタスクでコストを比較してください）。高速かつ低コストな回答には`grok-4.20-0309-non-reasoning`（chain-of-thought なし、最も安価な出力）、高頻度のコード補完には`grok-build-0.1`を使用し、複雑なリサーチタスクでのみマルチエージェントモデルをご検討ください（課金の増幅にご注意ください）。さらにコストを抑えるには、チャージボーナスをご活用ください。
</Tip>

## 課金に関する注意事項：推論 tokens

`grok-4.7` / `grok-4.6` / `grok-4.5` / `grok-4.3` / `grok-build-0.1` は**デフォルトで内部推論を行います**。レスポンスには `reasoning_content` が含まれ、推論 tokens は出力課金の対象としてカウントされます。テストでは、短い回答における可視 tokens はわずか 30 でしたが、586 出力 tokens（そのうち 556 tokens が推論）として課金されました。コストを重視する短い Q\&A では、`grok-4.20-0309-non-reasoning` に切り替えてください。詳細は [チャットと推論](/ja/api-capabilities/grok/chat) をご確認ください。

## よくある質問

<AccordionGroup>
  <Accordion title="Grokには独自のネイティブAPIフォーマットがありますか？">
    独自の専用プロトコルはありません。xAIの公式REST APIはOpenAI互換です：`/v1/chat/completions`（チャット）に加え、`/v1/responses`（Responses APIおよびサーバーサイドtools）があります。OpenAI SDKの接続先を`https://api.apiyi.com/v1`に指定するだけで、全機能を利用できます。「互換モードによるダウングレード」はありません。
  </Accordion>

  <Accordion title="Web検索を有効にするにはどうすればよいですか？">
    Responses APIを使用してください：`tools: [{"type": "web_search"}]`（または`x_search`）。Chat Completionsの従来の`search_parameters`フィールドはxAIによって削除されました（410確認済み）— 使用しないでください。詳細は[Web & X検索](/ja/api-capabilities/grok/web-search)を参照してください。
  </Accordion>

  <Accordion title="モデルが自身をGrok 4と名乗りますが、リクエストが誤ったモデルに送られているのでしょうか？">
    これは正常な動作です。すべてのGrok 4.xモデルは単に「Grok 4」と名乗り（マルチエージェントモデルは自身をOppieと呼びます）、4.6 / 4.5 / 4.3のような正確なバージョン番号を返すことはありません。モデルの自己紹介ではなく、リクエストおよびレスポンス内の`model`フィールドでモデルを確認してください。
  </Accordion>

  <Accordion title="キャッシュには設定が必要ですか？">
    いいえ。Grokのプレフィックスキャッシュは自動で行われます。キャッシュヒットの確認は`usage.prompt_tokens_details.cached_tokens`（`/v1/responses`上では`usage.input_tokens_details.cached_tokens`を参照）で行えます。キャッシュヒット数は128 tokens単位で切り捨てられます。これは2回のテストラウンドの両方で一致しています：8802 tokenのプレフィックスでは8704がヒットし、2735 tokenのプレフィックスでは2688がヒットしました。xAIはキャッシュエントリが破棄される可能性があり、キャッシュヒットは保証されないと明記しているため、**キャッシュ適用外の価格で予算を見積もってください**。詳細は[Grokキャッシュ課金ガイド](/ja/api-capabilities/grok/prompt-caching)を参照してください。
  </Accordion>

  <Accordion title="コンテキストウィンドウを超過した場合はどうなりますか？">
    400エラーが発生します。制限はモデルごとに異なります：grok-4.7、grok-4.6、grok-4.5は500K、grok-4.3および4.20シリーズは1M、grok-build-0.1は256Kです。より長いコンテンツの場合は、要約、チャンク分割、またはRAG検索を利用してください。
  </Accordion>

  <Accordion title="失敗したリクエストにも課金されますか？">
    4xxクライアントエラー（不正なパラメータ／認証エラー）には課金されません。tokensを正常に返したリクエストは、実際の使用量に応じて課金されます。なお、`deferred: true`は警告なしに無視される点に注意してください — リクエストは実際には同期的に実行され、通常通り課金されます。
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


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.