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

## エンタープライズグループはモデルごとに異なります

汎用グループ`ClaudeCode`、`Sora2Official`などとは異なり、エンタープライズグループはモデルごとに名前が付けられています。

| モデル                                                        | エンタープライズグループ名          | 倍率   | チャネルの性質                                                                                              |
| ---------------------------------------------------------- | ---------------------- | ---- | ---------------------------------------------------------------------------------------------------- |
| gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 | `image2Enterprise`     | 1.2x | **OpenAI上流**エンタープライズフォールバック（[ライブ更新 · 2026-05-13](/en/live/2026-05/gpt-image-2-default-saturated)を参照） |
| Nano Banana Pro / 2                                        | `NanoBananaEnterprise` | 1.4x | Google高可用性フォールバック（[画像・動画モデル](/ja/api-capabilities/image-video-models)を参照）                            |
| Nano Banana Pro / 2                                        | `NanoBananaReverse`    | 0.8x | **リバースエンジニアリングによるVertex**チャネル（[ライブ更新 · 2026-06](/en/live/2026-06/nanobanana-reverse)を参照）             |

<Tip>
  **重要な補足**: エンタープライズグループは、**Vertexフォールバックと同義ではありません**。`image2Enterprise`はOpenAI上流のフォールバックであり、Google Vertexとは無関係です。`NanoBananaReverse`は実際にVertexを経由するチャネル（リバースエンジニアリングによるもの）です。`NanoBananaEnterprise`は高可用性フォールバックであり、そのチャネル構成は明示的に文書化されていません。
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
  <Accordion title="エンタープライズはVertexと同じですか？">
    **必ずしも同じではありません** — どのモデルのエンタープライズグループかによって異なります。

    * `image2Enterprise`（gpt-image-2固有） — **Vertexではありません**。OpenAIの上流エンタープライズフォールバックです
    * `NanoBananaEnterprise`（Nano Banana固有） — Vertexを使用しているかどうかは、ドキュメントに明記されていません
    * `NanoBananaReverse`（Nano Banana Pro / 2） — **リバースエンジニアリングされたVertexを確実に使用します**

    「エンタープライズグループ」と「Vertexフォールバック」を同一視しないでください。
  </Accordion>

  <Accordion title="エンタープライズグループがあるモデルはどれですか？">
    利用可能なドキュメントおよび最新の更新によると、次のとおりです。

    * gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2: `image2Enterprise`（1.2x）
    * Nano Banana Pro / 2: `NanoBananaEnterprise`（1.4x）、`NanoBananaReverse`（0.8x）
    * Nano Banana OSS（URL出力）: `NB-OSS`（1x。ただしベータ版のため、グループを表示できるようにするにはカスタマーサポートへの連絡が必要です。[Nano Banana OSSグループ](/ja/api-capabilities/nano-banana-oss-group)を参照してください）

    利用可能なグループの正確な内容は、**ダッシュボードに表示される内容に従います** — プラットフォームは時間の経過とともにグループを追加または名称変更する場合があります。
  </Accordion>

  <Accordion title="エンタープライズグループに切り替えるのはどのような場合ですか？">
    記録されたインシデントから、典型的なケースを示します。

    * デフォルトグループが継続的に飽和状態になる、キューに入る、またはタイムアウトする場合（例: 2026-05頃のgpt-image-2）
    * ビジネスで成功率が重視され、デフォルトグループの失敗による影響を避けたい場合
    * Nano Banana Pro / 2の利用体験がピーク時間帯に悪い場合 — `NanoBananaReverse`（呼び出しごと、0.8x、より低コスト）の利用を検討してください

    反対に、**デフォルトグループに十分なリソースがある場合は、エンタープライズグループへの切り替えを検討する必要はありません**。2026-05-23にgpt-image-2のデフォルトグループが補充された後は、「直接呼び出せばよく、image2Enterpriseに明示的に切り替える必要はありませんでした」（[ライブ更新 · 2026-05](/en/live/2026-05/gpt-image-2-default-restocked-0523-2142)を参照）。
  </Accordion>

  <Accordion title="エンタープライズグループは常にデフォルトグループより高額ですか？">
    必ずしもそうではありません。記録されたデータの倍率は、どちらの方向にもなり得ます。

    * `image2Enterprise`: 1.2x（デフォルトより約20%高い）
    * `NanoBananaEnterprise`: 1.4x（デフォルトより約40%高い）
    * `NanoBananaReverse`: **0.8x**（デフォルトより**約20%低い**）

    つまり、「エンタープライズ」は「高額」を意味しません — 倍率は特定のモデルとグループによって異なります。
  </Accordion>

  <Accordion title="デフォルト + エンタープライズをフォールバックとして設定できますか？">
    はい。1つのtokenにつき、**1つのデフォルトグループ + 最大2つのフォールバックグループ**をサポートします（[tokenとグループ](/ja/faq/token-and-groups)を参照）。プライマリグループが混雑すると、呼び出しは自動的にバックアップチャネルへ切り替わります。これは「高い成功率」が求められるワークロードに推奨されるパターンです。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Tokenとグループ" icon="key" href="/ja/faq/token-and-groups">
    Tokenのロール、作成・編集、デフォルトグループとフォールバックグループのルール。
  </Card>

  <Card title="Nano Banana開発者ガイド" icon="book-open" href="/ja/api-capabilities/nano-banana-dev-guide">
    AIStudio + Vertexのデュアルチャネル冗長化を含む、Nano Bananaの完全なドキュメント。
  </Card>

  <Card title="ライブアップデートアーカイブ" icon="radio" href="/en/live/archive">
    毎日のプラットフォームステータス、チャネル切り替え、インシデント復旧のタイムライン。
  </Card>

  <Card title="Nano Banana料金概要" icon="tag" href="/ja/api-capabilities/nano-banana-pricing">
    Nano Banana Pro / 2 / 2 Lite / 初代の料金比較。
  </Card>
</CardGroup>

<Tip>
  **さらに情報が必要ですか？** この記事で扱っていない情報（エンタープライズグループのSLA、同時実行数の制限、新モデルのエンタープライズグループへの展開計画）については、WeComカスタマーサービスまたはメール（[hi@apiyi.com](mailto:hi@apiyi.com)）でお問い合わせください。
</Tip>
