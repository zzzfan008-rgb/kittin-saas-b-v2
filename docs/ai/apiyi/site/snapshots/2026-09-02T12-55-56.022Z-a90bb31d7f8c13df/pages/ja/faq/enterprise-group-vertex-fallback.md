> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Enterprise グループとは何ですか？ いつ使うべきですか？

> APIYI では、Enterprise グループは単一の共通グループではなく、モデルごとに異なります。gpt-image-2 では image2Enterprise (1.2x)、Nano Banana では NanoBananaEnterprise (1.4x) または NanoBananaReverse (0.8x) を使用します。この記事では、各モデルの Enterprise グループについて、違い、レート倍率、ユースケースをまとめます。

## 簡単な回答

**APIYI では、「Enterprise group」は単一の सार्व通用なグループではなく、各モデルごとに専用のエンタープライズ向けフォールバックチャネルが用意されています。** 通常はデフォルトグループより少し高価ですが、デフォルトグループが逼迫しているときでも画像生成を継続できるため、高い成功率が求められるワークロード向けのフォールバック विकल्पになります。

<Info>
  この記事では、公式ドキュメントまたはライブステータス記録から検証できる事実のみを掲載しています。SLA、同時実行数の上限、その他未公開のデータについては、カスタマーサポートにお問い合わせください。
</Info>

## エンタープライズグループはモデルごとに分かれています

汎用グループ `ClaudeCode`、`Sora2Official` などとは異なり、エンタープライズグループはモデルごとに命名されます:

| モデル                 | エンタープライズグループ名          | 倍率   | チャネルの性質                                                                                                        |
| ------------------- | ---------------------- | ---- | -------------------------------------------------------------------------------------------------------------- |
| gpt-image-2         | `image2Enterprise`     | 1.2x | **OpenAI upstream** のエンタープライズフォールバック（[ライブ更新 · 2026-05-13](/en/live/2026-05/gpt-image-2-default-saturated) を参照） |
| Nano Banana Pro / 2 | `NanoBananaEnterprise` | 1.4x | Google の高可用性フォールバック（[画像・動画モデル](/ja/api-capabilities/image-video-models) を参照）                                   |
| Nano Banana Pro / 2 | `NanoBananaReverse`    | 0.8x | **Vertex のリバースエンジニアリング** チャネル（[ライブ更新 · 2026-06](/en/live/2026-06/nanobanana-reverse) を参照）                      |

<Tip>
  **重要な補足**: エンタープライズグループは **Vertex フォールバックと同義ではありません**。`image2Enterprise` は OpenAI upstream のフォールバックであり、Google Vertex とは無関係です。`NanoBananaReverse` は実際に Vertex を経由するチャネル（リバースエンジニアリングによるもの）で、`NanoBananaEnterprise` はチャネル構成が明示的に文書化されていない高可用性フォールバックです。
</Tip>

## デフォルトグループが飽和しても、エンタープライズグループは機能していました

`gpt-image-2`の実例:

* **2026-05-13 14:29–14:31** の呼び出しログ: 9件の非ストリーミング呼び出しが**すべて`image2Enterprise`グループにルーティングされ**、1.2倍のレート倍率で初回バイト遅延は35-293秒でしたが、それでも画像生成に成功しました（[ライブアップデート・2026-05](/en/live/2026-05/gpt-image-2-default-saturated) を参照）。
* `gpt-image-2`のデフォルトグループが飽和していたとき、"some default-group requests had been routed via the fallback path into the enterprise group" — これは、エンタープライズグループがフォールバックとして機能するという設計意図を裏付けています（同じライブアップデート）。

`NanoBananaReverse`の設計意図（[ライブアップデート・2026-06](/en/live/2026-06/nanobanana-reverse) を参照）:

> ピーク時の公式直通 Nano Banana Pro / 2 への影響を緩和するため、デフォルトグループ価格の80%（0.8倍のレート倍率）で、リバースエンジニアリングした Vertex グループ `NanoBananaReverse` を追加しました。解像度にかかわらず呼び出しごとに課金します。

<Warning>
  **「エンタープライズグループ = 常に安定」という保証はありません。** 公式ドキュメントでは明記されています。`gpt-image-2` のエンタープライズグループ（OpenAI 公式 API）でも、2026-05-07 に "The server had an error while processing your request." エラーが発生しており、原因は OpenAI の上流障害でした（[ライブアップデート・2026-05](/en/live/2026-05/gpt-image-2-upstream-error) を参照）。エンタープライズグループはデフォルトグループの混雑を**緩和します**が、上流の安定性を永遠に保証するものではありません。
</Warning>

## エンタープライズグループに切り替えるには？

エンタープライズグループは **token レベル** で設定されます:

1. [https://api.apiyi.com/token](https://api.apiyi.com/token) を開く
2. 対象の token を見つける → 操作列の「管理（レンチアイコン）」をクリック → 「トークンを編集」
3. 「グループを選択」の下で、対応するエンタープライズグループ（例: `image2Enterprise`, `NanoBananaEnterprise`, `NanoBananaReverse`）を選択する
4. 保存する

コード変更は不要です。詳細な手順は [Live Update · 2026-04 · image2-enterprise](/en/live/2026-04/image2-enterprise-stable) にあります（gpt-image-2 の例で、他のモデルでもパスは同じです）。

<Tip>
  **NanoBananaReverse の対象範囲**: `gemini-3-pro-image`（Nano Banana Pro）と `gemini-3.1-flash-image`（Nano Banana 2）のみをサポートし、**呼び出しごとの課金のみ**です。Nano Banana Pro の token が従量課金の場合、このグループは適用されません。
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="Enterprise は Vertex と同じですか？">
    **必ずしもそうではありません** — どのモデルの enterprise グループかによります:

    * `image2Enterprise` (gpt-image-2 固有) — **Vertex ではありません**。OpenAI 上流の enterprise フォールバックです
    * `NanoBananaEnterprise` (Nano Banana 固有) — ドキュメントでは Vertex を使用しているかどうかは明示されていません
    * `NanoBananaReverse` (Nano Banana Pro / 2) — **明確にリバースエンジニアリングされた Vertex を使用します**

    「enterprise グループ」を「Vertex フォールバック」と同一視しないでください。
  </Accordion>

  <Accordion title="どのモデルに enterprise グループがありますか？">
    利用可能なドキュメント / ライブ更新によると:

    * gpt-image-2: `image2Enterprise` (1.2x)
    * Nano Banana Pro / 2: `NanoBananaEnterprise` (1.4x), `NanoBananaReverse` (0.8x)
    * Nano Banana OSS (URL 出力): `NB-OSS` (1x、ただしベータです。グループの表示を有効にするにはカスタマーサポートへの連絡が必要です。詳細は [Nano Banana OSS Group](/ja/api-capabilities/nano-banana-oss-group) を参照してください)

    利用できる正確なグループは **ダッシュボードに表示されている内容に従います** — プラットフォームは時間の経過とともにグループを追加したり、名前を変更したりする場合があります。
  </Accordion>

  <Accordion title="どのような場合に enterprise グループへ切り替えるべきですか？">
    記録された障害からの典型的なシナリオ:

    * デフォルトグループが継続的に逼迫 / キュー滞留 / タイムアウトしている場合（例: 2026-05 頃の gpt-image-2）
    * 業務が成功率に敏感で、デフォルトグループの失敗に引きずられたくない場合
    * Nano Banana Pro / 2 のピーク時の体験が悪い場合 — `NanoBananaReverse` を検討してください（1回ごと、0.8x、より安価）

    逆に、**デフォルトグループに十分なリソースがあるなら、enterprise グループへ切り替える必要はありません**: 2026-05-23 に gpt-image-2 のデフォルトグループが補充された後は、"直接呼び出してください — わざわざ image2Enterprise に切り替える必要はありません" とされました（[ライブ更新・2026-05](/en/live/2026-05/gpt-image-2-default-restocked-0523-2142) を参照）。
  </Accordion>

  <Accordion title="enterprise グループは常にデフォルトグループより高価ですか？">
    必ずしもそうではありません。記録データの倍率は両方向にあります:

    * `image2Enterprise`: 1.2x (≈ デフォルトより 20% 高い)
    * `NanoBananaEnterprise`: 1.4x (≈ デフォルトより 40% 高い)
    * `NanoBananaReverse`: **0.8x** (≈ デフォルトより **20% 安い**)

    したがって、「enterprise」だからといって「高価」とは限りません — 倍率は特定のモデルとグループによって異なります。
  </Accordion>

  <Accordion title="Default + Enterprise をフォールバックとして設定できますか？">
    はい。1 つの token は **1 つのデフォルトグループ + 最大 2 つのフォールバックグループ** をサポートします（[Tokens and Groups](/ja/faq/token-and-groups) を参照してください）。主要グループが混雑した場合、呼び出しは自動的にバックアップチャネルへ切り替わります。これは「高成功率」ワークロードに推奨されるパターンです。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Tokens とグループ" icon="key" href="/ja/faq/token-and-groups">
    Token の役割、作成・編集、デフォルトグループとフォールバックグループのルール。
  </Card>

  <Card title="Nano Banana 開発者ガイド" icon="book-open" href="/ja/api-capabilities/nano-banana-dev-guide">
    AIStudio + Vertex のデュアルチャネル冗長構成を含む、Nano Banana の完全なドキュメント。
  </Card>

  <Card title="ライブ更新アーカイブ" icon="radio" href="/en/live/archive">
    毎日のプラットフォーム稼働状況、チャネル切り替え、インシデント復旧タイムライン。
  </Card>

  <Card title="Nano Banana 料金概要" icon="tag" href="/ja/api-capabilities/nano-banana-pricing">
    Nano Banana Pro / 2 / 2 Lite / 初代の価格比較。
  </Card>
</CardGroup>

<Tip>
  **もっと必要ですか？** この記事で扱っていない情報 — エンタープライズグループの SLA、同時実行数の上限、新しいモデルのエンタープライズグループ展開計画 — については、WeCom カスタマーサービスまたは [hi@apiyi.com](mailto:hi@apiyi.com) までメールでお問い合わせください。
</Tip>
