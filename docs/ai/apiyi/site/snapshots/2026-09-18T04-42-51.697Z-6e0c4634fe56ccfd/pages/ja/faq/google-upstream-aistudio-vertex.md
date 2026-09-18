> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Google モデルは AI Studio 上で動作しますか、それとも Vertex ですか？

> APIYI 上の Nano Banana をはじめとする Google の画像モデルは、既定では公式 AI Studio 上で動作します。Vertex は、AIStudio の障害時に引き継ぐ別個のコンピュートプールとして機能します。この 2 つは冗長チャネルとして動作します。この記事では、検証可能な事実と切り替え経路を一覧します。

## 簡単な回答

**Nano Banana とその他の Google モデルは、デフォルトでは「公式 AI Studio」で動作します。Vertex は、AIStudio に問題がある場合に引き継ぐ別のコンピュートプールとして動作します。2 つのチャネルは冗長構成であり、どちらか一方を選ぶものではありません。**

<Info>
  この記事では、公式ドキュメントまたはライブのステータス記録から検証できる事実のみを掲載しています。スケジューリングロジック、上流のコンピュートプールのキャパシティ、または当社ドキュメントで扱っていない内容の詳細が必要な場合は、サポートまでお問い合わせください。
</Info>

## デフォルトグループ = 公式 AI Studio

Nano Banana が 2025 年 11 月にリリースされて以来、APIYI は `gemini-3-pro-image`（Nano Banana Pro）、`gemini-3.1-flash-image`（Nano Banana 2）、および lite シリーズを**公式 AI Studio 経由のみに限定して**振り分けています。リバースエンジニアリング経由のチャネルは一切使っていません（[Live Update · 2026-07](/en/live/2026-07/nano-banana-pro-2-official-aistudio) を参照）。

<Tip>
  **なぜ「公式 AI Studio」を強調するのか**: Nano Banana の価格が Google の公式レートよりはるかに低いからといって、リバースエンジニアリングを意味するわけではありません。価格面の優位性は、Google の認証を迂回することではなく、集約スケジューリングと為替レートに由来します。
</Tip>

デフォルトグループでは、特別な設定なしでほとんどの場合に直接呼び出せます。

## Vertex はどこにありますか？ 有効化するには？

Vertex（Google Cloud のエンタープライズ向けチャネル）は **別個の計算プール** として動作し、APIYI では独立したグループとして提供されています。token を作成または編集するときに選択してください。ダッシュボードに表示される正確なグループ名が正です。

<Note>
  **出力ファイルサイズについて**: Vertex の 4K 出力は AI Studio より大きく、**Vertex ≈ 1 枚あたり 20 MB、AI Studio ≈ 10 MB** です。ダウンロード、保存、CDN 帯域幅の容量計画は、20 MB を上限として見積もってください（[Live Update · 2026-05-28](/en/live/2026-05/gemini-image-vertex-supply) を参照）。
</Note>

## AIStudio と Vertex は冗長チャネルです

ドキュメントでは明確に、**APIYI は Nano Banana シリーズ向けに AIStudio + Vertex の二重チャネル冗長化を提供しています** — 片方の公式チャネルが失敗すると、もう一方が引き継いでサービス可用性を維持します ([Nano Banana 開発ガイド](/ja/api-capabilities/nano-banana-dev-guide))。

実際に切り替えが発生したケース:

* **2026-06-19 のインシデント**: Google の `AIStudio` コンピュート障害により、公式の 2K/4K 出力がぼやけ、1K は通常どおり動作しました。**一時的に Vertex チャネルへ切り替えて** 2K/4K を復旧しました（[ライブ更新 · 2026-06](/en/live/2026-06/nano-banana-2k-4k-via-vertex) を参照）。
* **2026-05-28 のインシデント**: Gemini の画像プレビュー モデル 2つは、供給を確保するために **Vertex の高価格チャネル** に切り替わり、その後安定供給に戻りました（[ライブ更新 · 2026-05](/en/live/2026-05/gemini-image-vertex-supply) を参照）。

<Warning>
  **「Vertex は影響を受けない」と決めつけないでください。** AIStudio が失敗したときに Vertex が引き継ぐからといって、Vertex 自体が絶対に失敗しないという意味ではありません — APIYI は「SLA 100% — Vertex は影響を受けない」という約束を公開していません。問題が発生したときは、常に `aistudio.google.com/status` と [ライブ更新](/en/live) を参照してください。
</Warning>

## 上流がダウンしているかどうかを確認する方法

最も信頼できる情報源は、Google の公式 AI Studio ステータスページです:

> **`aistudio.google.com/status`**

ステータスページでは、Gemini モデルファミリーの公式インシデント通知が公開されます。たとえば:

* **2026-06-19 15:54**: 検知済みとしてマークされました。原文: 「Gemini API と AI Studio で 2k または 4k 解像度を使用した際に、Nano Banana 2 と Nano Banana Pro モデルで問題が発生しています。調査中です。」(参照: [ライブ更新 · 2026-06-19](/en/live/2026-06/aistudio-status-nano-banana))

<Tip>
  **実践的な使い方**: お客様から「Banana が遅い / 画像に問題がある」と報告されたら、まず `aistudio.google.com/status` を確認してください。Detected の通知があれば、たいてい 1 分以内に上流側の問題かどうかを切り分けられます。
</Tip>

## よくある質問

<AccordionGroup>
  <Accordion title="デフォルトのプールは AI Studio のみを使いますか？ それとも Vertex と AI Studio の両方を含みますか？">
    デフォルトグループ（デフォルト）**は公式の AI Studio チャネルで動作します** — これは Nano Banana やその他の Google の画像モデルに対するデフォルトルートです。Vertex は独立したオプショングループで、**デフォルトグループには含まれません** — Vertex を使うには Vertex 関連のグループに切り替える必要があります。
  </Accordion>

  <Accordion title="Vertex はどのグループにありますか？ Vertex はどう使いますか？">
    Vertex は APIYI ダッシュボードで**独立したオプショングループ**として提供されています（正確な名称はダッシュボードの表記が基準です）。token を作成または編集するときは、「グループを選択」で Vertex 関連のグループを選んでください — 呼び出しシグネチャは同じままで、**コード変更は不要です**。
  </Accordion>

  <Accordion title="Nano Banana が遅いとき、Vertex の影響は少ないですか？ AI Studio が最も影響を受けますか？">
    **記録された事象に基づくと、AI Studio では 2026-06-19 に 2K/4K の計算処理の問題が実際に発生しました** — Vertex が引き継いで復旧しました。ただし、「Vertex の影響は少ない」は、現時点では**これらの記録済み AIStudio の計算処理障害についてのみ確認されています** — APIYI は Vertex の SLA データを公開しておらず、「Vertex は決して影響を受けない」という約束もしていません。

    ビジネス上、成功率に敏感な場合は、**Nano Banana token 用のフォールバックグループ**を設定することをおすすめします（[Token とグループ](/ja/faq/token-and-groups) を参照） 。これにより、メイングループが混雑したときに自動的にバックアップチャネルへ切り替わります。
  </Accordion>

  <Accordion title="自分の呼び出しが実際にどのチャネルを使ったか、どうやって判別できますか？">
    特定のチャネルは**レスポンスに直接は表示されません**。間接的に推測できます。

    1. token に設定されているグループに応じて、呼び出しはそのグループのデフォルトチャネルを使います
    2. 返ってきた画像サイズを確認してください — **AI Studio 4K ≈ 10 MB、Vertex 4K ≈ 20 MB** で、差ははっきり分かります
    3. 上流側で障害が発生しているときは、[ライブ更新](/en/live) を確認して、プラットフォームがどのチャネルに切り替えたかを見てください
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="Nano Banana 開発者ガイド" icon="book-open" href="/ja/api-capabilities/nano-banana-dev-guide">
    AIStudio + Vertex のデュアルチャネル冗長化メカニズムを含む、Nano Banana の完全な使用ガイドです。
  </Card>

  <Card title="Nano Banana 料金概要" icon="tag" href="/ja/api-capabilities/nano-banana-pricing">
    Nano Banana Pro / 2 / 2 Lite / 初代の完全な料金比較です。
  </Card>

  <Card title="ライブ更新アーカイブ" icon="radio" href="/en/live/archive">
    プラットフォームの毎日のステータス、チャネル切り替え、インシデント復旧のタイムラインです。
  </Card>

  <Card title="token とグループ" icon="key" href="/ja/faq/token-and-groups">
    デフォルトグループとフォールバックグループの token グループおよびルールです。
  </Card>
</CardGroup>

<Tip>
  **さらに必要ですか？** この記事で扱っていない情報（Vertex / AIStudio のスケジューリング詳細、上流コンピュートプールの容量、SLA）については、WeCom カスタマーサービスまたはメール（[hi@apiyi.com](mailto:hi@apiyi.com)）でお問い合わせください。
</Tip>
