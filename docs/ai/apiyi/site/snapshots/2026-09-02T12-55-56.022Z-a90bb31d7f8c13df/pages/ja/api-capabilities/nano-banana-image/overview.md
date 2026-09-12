> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro 画像生成

> Nano Banana Pro (Gemini 3 Pro) 画像生成 API - 4K対応、テキスト描画の高度なサポート。カスタム解像度、10種類のアスペクト比、10秒の高速生成、公式価格から70-83%オフ。

<Note>
  **🔥 最新リリース**: Google が **Nano Banana 2**（`gemini-3.1-flash-image-preview`）を2026年2月26日にリリースしました — Pro級の品質を Flash級の速度で、従量課金で最安 \$0.025/枚！[Nano Banana 2 のドキュメントを見る](/ja/api-capabilities/nano-banana-2-image/overview)
</Note>

<Note>
  **🆕 2026年5月29日更新（`-preview` は廃止）**: Google は公式ドキュメントを更新し、安定版モデル名 **`gemini-3-pro-image`**（`-preview` なし）をリリースしました。APIYI はすでに対応しています。

  * **旧名も引き続き使えます**: `gemini-3-pro-image-preview` はこれまでどおり使え、**料金は変わらず**、コード変更も不要です。
  * **どちらの名前でも使えます**: 新しい `gemini-3-pro-image` 名でも、元の `-preview` 名でも使えます。

  補足: Google は、安定版がプレビュー版と比べて出力品質、安全フィルタリング、その他の挙動に違いがあるかどうかを明確にしていません。ぜひテストしてフィードバックをお寄せください。
</Note>

<Info>
  すべての image API は**同期式**です — ポーリングする task ID はなく、クライアントが切断されると、リクエストは課金されたままでも結果は失われます。このモデルには十分なタイムアウトを設定してください。[Image API の基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices) を参照してください。
</Info>

**Nano Banana Pro**（コードネーム）は Google の画像生成モデルシリーズで、現在は次の利用可能なバージョンがあります:

### 最新バージョン

* **Nano Banana 2**: `gemini-3.1-flash-image-preview`（🔥 2026年2月26日リリース）— [詳細を見る](/ja/api-capabilities/nano-banana-2-image/overview)
* **Nano Banana Pro**: `gemini-3-pro-image-preview`（2025年11月20日リリース）

### 以前のバージョン

* **公式リリース**: `gemini-2.5-flash-image`（安定版、10種類のアスペクト比に対応）
* **プレビュー版**: `gemini-2.5-flash-image-preview`（⚠️ 2025年10月30日に終了）

<Card>
  **主な強み**

  * 🔥 **Nano Banana Pro の新機能**:
    * 🎯 **4K高解像度対応**: 1K、2K、4Kの3解像度に対応し、最大4096×4096まで
    * 📝 **テキスト描画の王者**: 画像内の文字を鮮明かつ読みやすく表示し、ポスターや広告に最適です
    * ✨ **ローカル編集**: カメラアングル、フォーカス、カラーグレーディング、シーン照明の調整に対応します
    * 🧠 **スマート推論**: Gemini 3 Pro をベースにしており、複雑な prompt をよりよく理解します

  * 🚀 **共通の強み**:
    * ⚡ **生成速度**: Nano Banana Pro は約20秒、前バージョンは約10秒
    * 💰 **手頃な料金**: チャージ特典と組み合わせると、非常にコストパフォーマンスに優れています
    * 🔄 **完全互換**: Google 公式 Gemini API フォーマットと完全互換です
    * 🎨 **Google テクノロジー**: Google の最新かつ最強の画像生成/編集技術に基づいています
</Card>

## インタラクティブな API テスト

<CardGroup cols={2}>
  <Card title="テキストから画像 API" icon="wand-sparkles" href="/ja/api-capabilities/nano-banana-image/text-to-image">
    画像を生成するためのテキストプロンプトを入力すると、オンラインテスト用のインタラクティブな Playground が利用できます。
  </Card>

  <Card title="画像編集 API" icon="image" href="/ja/api-capabilities/nano-banana-image/image-edit">
    画像と編集指示をアップロードして編集済み画像を生成すると、オンラインテスト用のインタラクティブな Playground が利用できます。
  </Card>
</CardGroup>

## AI エージェントに統合を任せる

<Note>
  Codex / Claude Code / Cursor で構築しているなら、下の prompt をコピーしてエージェントに渡してください。エージェントはまずこのページのプレーンテキスト版を取得し（任意の docs URL に `.md` を付けます）、その後はあなたのプロジェクト固有のスタックでコードを書きます。つまり、タイムアウト、防御的な `parts` パース、アップロード圧縮、解像度パラメータは、すでに要件に組み込まれています。
</Note>

<Prompt description="Codex、Claude Code、Cursor などのツールに貼り付けて使えるよう、コーディングエージェントに Nano Banana Pro のテキストから画像生成と画像編集の統合・トラブルシュートを任せてください。" icon="bot" actions={["copy"]}>
  このプロジェクトで Nano Banana Pro（`gemini-3-pro-image`）のテキストから画像生成と画像編集を統合・トラブルシュートしてください。

  コードに触る前に docs を読んでください。このページのプレーンテキスト版として [https://docs.apiyi.com/en/api-capabilities/nano-banana-image/overview.md](https://docs.apiyi.com/en/api-capabilities/nano-banana-image/overview.md) を取得してください。より細かなパラメータの詳細は、テキストから画像生成ページと画像編集ページにも同じように `.md` を付けてください。

  要件:

  1. タイムアウト: `POST https://api.apiyi.com/v1beta/models/gemini-3-pro-image:generateContent` で Gemini ネイティブ形式を呼び出してください。クライアントのタイムアウトは解像度ティアごとに設定します。1K と 2K は 300 秒、**4K は 600 秒**です。画像 API は同期型です。task ID はないため、クライアントが切断されると、リクエスト自体は課金されたままでも結果は失われます。リバースプロキシ、ゲートウェイ、サーバーレス実行の制限もすべて広げる必要があります。生成時間より短い層が1つでもあると、そこでリクエストは切断されます。Node では、undici に 3 つの独立したタイムアウト設定があり、SDK の `timeout` オプションではそれらをカバーできない点に注意してください。

  2. 応答のパース（**いちばん簡単に間違えやすい箇所です**）: 画像は base64 で、`inlineData.data` の中の `candidates[0].content.parts[]` にあります。ただし、`parts` は長さも順序も保証されない**異種配列**です。テキスト部分が先に来ると、画像は 0 番ではなく 1 番のインデックスになります。したがって、**`parts[0]` や `parts[1]` をハードコードしてはいけません**。0 と 1 を入れ替えても直りません。正しい方法は、`parts` を走査し、`inlineData` を持つすべてのエントリでフィルタし、**最後**のものを取ることです（複雑なタスクでは複数の中間ドラフトが返り、最後のものだけが最終版です）。応答から `mimeType` も読み取り、`image/png` と決め打ちしないでください。その後、画像をレンダリングし、ディスクへ保存するアクションを用意してください。

  3. アップロード前に圧縮: 編集では、参照画像を `inlineData` の中の base64 として渡します。先に圧縮してください。1.5MB を超えるファイルだけを処理し、アスペクト比を保ったまま長辺を 2048px に縮小し（小さい画像は決して拡大しない）、品質 0.9 で再エンコードし、元の形式は維持します。複数画像リクエストでは、合計サイズを 6MB 未満に保ってください。ハード上限は、画像1枚あたり 7MB、1 リクエストあたり最大 14 枚、アップロード全体で 100MB 未満です。そこに base64 エンコードが入ると全体が約 3 割増えるため、余裕を見て各画像は 5MB 未満に抑えるのが目安です。1 枚の画像の圧縮に失敗した場合は、元の画像にフォールバックしてそのまま続行してください。さらに、**1 つの part には `text` か `inlineData` のどちらか一方しか入れられず、両方は入れられません**。正しい構造は、テキストパート 1 つ + N 個の画像パートです。

  4. 解像度パラメータ: デフォルトに頼らず、`generationConfig.imageConfig.imageSize`（`1K` / `2K` / `4K`、既定値 `1K`）と `aspectRatio`（このページには 10 個の有効な比率が載っています）を明示的に送ってください。UI では両方をドロップダウンとして公開してください。ユーザーが 4K を選んだら、タイムアウトも 600 秒に引き上げてください。このモデルは `thinkingConfig` をサポートしませんし、`tools` を使った Google Search grounding もサポートしません。したがって、どちらも送信しないでください。

  5. エラーハンドリング: コンテンツモデレーションでリクエストがブロックされても HTTP ステータスは 200 のままですが、`candidates[0].content.parts` は空で返ってきます。まず `candidatesTokenCount` が 0 か確認し、そのうえで `finishReason` が `STOP` 以外か確認してください。`IMAGE_SAFETY` のようなブロックは**課金されません**。同一入力を 1〜2 回再試行すると成功することがよくあるため、その自動リトライを組み込んでください。

  6. 鍵は `APIYI_API_KEY` 環境変数から読み取り、`Authorization` ヘッダーに `Bearer` プレフィックス付きで送ってください。ハードコードも git へのコミットも絶対にしないでください。

  7. すべて終わったら、実際に 1 回のテキストから画像生成呼び出しと 1 回の画像編集呼び出しを実行し、その結果と、2 回の呼び出しにかかったコストを見せてください。
</Prompt>

<Accordion title="この prompt が防ぐこと">
  | Requirement             | それが防ぐ落とし穴                                                                                                                                         |
  | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `parts` インデックスを決め打ちしない  | 長さと順序が保証されないため、固定インデックスでは断続的に失敗します。0 と 1 を切り替えても直りません。 [Nano Banana 開発ガイド](/ja/api-capabilities/nano-banana-dev-guide) を参照してください                  |
  | 最後の画像パートを採用する           | 複雑な編集タスクでは複数の中間ドラフトが返り、最後のものだけが最終版です                                                                                                              |
  | 解像度ごとにタイムアウトを分ける        | 4K を 300 秒タイムアウトで呼ぶと誤ってタイムアウトします。さらに、**切断されたリクエストでも課金は発生します**。[Image API の基礎とベストプラクティス](/ja/api-capabilities/image-api-best-practices) を参照してください  |
  | アップロード前に圧縮する            | ハード上限は画像1枚あたり 7MB で、base64 によりそれが約 3 割増えるため、スマホ写真の生データはすぐに 500 を引き起こします。[画像圧縮と出力解像度](/ja/api-capabilities/image-compression-resolution) を参照してください |
  | `IMAGE_SAFETY` で自動再試行する | モデレーションブロックは画像なしで 200 を返し、課金されません。同一入力の再試行は通ることがよくあります。[Gemini 画像エラーハンドリング](/ja/api-capabilities/gemini-image-error-handling) を参照してください           |
</Accordion>

## APIYIのNano Banana Proが選ばれる理由

**Nano Banana Pro / 2 は、APIYIで利用量第1位のモデルです** — 安定性が高く、信頼できて、高速です。プロフェッショナルなチームと仕事をしたいなら、APIYIが最適です。

Googleのフラッグシップで、厳格なコンテンツ安全性制御を備え、APIYIが**信頼性**、**コスト**、**統合**の面で最適化しています：

<CardGroup cols={2}>
  <Card title="公式チャネル · Geminiと同じ" icon="shield-check">
    Googleのネイティブ Gemini API（`/v1beta/models/.../generateContent`）と OpenAI SDK パターンに100%互換です — リクエストボディ、レスポンスフィールド、エラーコードも同じです。コード変更なしで移行できます。
  </Card>

  <Card title="同時実行数制限なし" icon="infinity">
    Google AI StudioのRPM/RPD上限に縛られません。エンタープライズ規模のバッチ生成やピークトラフィックでも、クォータ中断なしで線形にスケールします。
  </Card>

  <Card title="Googleの定価の31-38%" icon="percent">
    1回あたり \$0.09/image（Google 4K の \$0.24 と比較）。[チャージボーナス](/ja/faq/recharge-promotions)と組み合わせると、定価の31.25%まで下がり、4Kでは最大68.75%お得です。
  </Card>

  <Card title="グローバルなゼロ障壁アクセス" icon="globe">
    **海外サーバーやプロキシは不要** — 本土のデータセンター、家庭用ネットワーク、または海外ノードから `api.apiyi.com` に直接接続できます。安定したレイテンシで、越境向けの再設計は不要です。
  </Card>

  <Card title="モデルラインナップ全体" icon="layers">
    同シリーズで [Nano Banana 2](/ja/api-capabilities/nano-banana-2-image/overview)（最高のコスパ + Flash並みの速度）、Nano Banana Pro（究極の品質）、そして従来の Nano Banana をカバーします — シーンに応じて使い分けできます。
  </Card>

  <Card title="プロフェッショナルなエンタープライズサポート" icon="handshake">
    当チームは本番環境での画像生成導入を専門としており、モデル選定、チューニング、統合に深い経験があります — PoCから本番までエンドツーエンドでサポートします。
  </Card>
</CardGroup>

## Calling Method

Google のネイティブな Gemini API 形式を使用します:

```
POST /v1beta/models/gemini-3-pro-image-preview:generateContent
```

<Tip>
  * ✅ 4K 高解像度（1K / 2K / 4K）をサポート
  * ✅ 10 種類のアスペクト比から選択可能
  * ✅ 業界最高クラスのテキストレンダリング
  * ✅ 高度なローカル編集
  * 📖 Google 公式 API 形式と完全互換です。`ai.google.dev/gemini-api/docs/image-generation` を参照してください
</Tip>

### Unsupported Features

<Warning>
  以下の Google 公式機能は APIYI 経由では**サポートされておらず**、別途課金が必要です:

  * **Grounding with Google Search**: `tools: [{"google_search": {}}]` 経由のリアルタイム検索情報
  * **thinkingConfig** (Thinking モード): Nano Banana 2 のみサポートされ、Nano Banana Pro ではサポートされません
  * **Image Search Grounding**: Nano Banana 2 専用機能

  その他のすべての画像生成および編集機能は完全にサポートされています。
</Warning>

## 価格比較

| モデル                         | 価格                           | 利点                  |
| --------------------------- | ---------------------------- | ------------------- |
| **Nano Banana Pro** (4K)    | \$0.09/image（ボーナス込みで約¥0.52）  | 🔥 4K対応、公式価格の約38%   |
| **Nano Banana Pro** (1K-2K) | \$0.09/image（ボーナス込みで約¥0.52）  | 🔥 高解像度出力、公式価格の約67% |
| **Nano Banana**             | \$0.025/image（ボーナス込みで約¥0.15） | ⭐ 高速生成、公式価格の52%     |
| gpt-image-1                 | 高め                           | -                   |
| flux-kontext-pro            | \$0.035/image                | 同等                  |

<Tip>
  **コストパフォーマンスのおすすめ**:

  * **Nano Banana Pro**: 4K対応、最も強力なテキストレンダリング、価格は公式の約38〜67%
  * **NanoBananaEnterprise**: 高可用性が必要な場合に、1.4倍のレート（\$0.126/image）でEnterprise HAチャネルを利用可能
  * **Nano Banana**: 高速生成（約10秒）、公式価格の52%、通常の高品質な画像生成に適しています
</Tip>

## グループ設定

APIYI では Nano Banana Pro に 2 つのグループが用意されています。ダッシュボード → **Token 設定** で切り替えます:

| グループ                   | レート  | 使いどき                                                                       |
| ---------------------- | ---- | -------------------------------------------------------------------------- |
| `Default`              | 1.0x | ベースレーン、1 回あたり \$0.09/画像; 推奨デフォルト                                           |
| `NanoBananaEnterprise` | 1.4x | フォールバックレーン、1 回あたり \$0.126/画像 — デフォルトが逼迫したりタイムアウトが急増したときは手動で切り替えます、キャパシティ優先 |

**なぜ 1.4x なのですか?** 1.4x でも価格は Google の定価の約 50% にとどまり、公式価格より大幅に安いです。これは高い同時実行数のワークロードや予期しない上流側のリスク制御イベントに備えたフォールバックレーンで、エンタープライズ顧客向けに高可用性を保証します。デフォルトグループが逼迫したら、Token を `NanoBananaEnterprise` に切り替えて急増をやり過ごします。

**推奨の課金モデル**: `Pay-as-you-go Priority` を選んでください — Nano Banana Pro の per-call 課金と Nano Banana 2 の token ベース課金の両方に対応し、**シリーズ全体で 1 つの Token** です。

<Frame caption="Token settings: Billing model = Pay-as-you-go Priority, primary group = Default, fallback group = NanoBananaEnterprise (1.4x)">
  <img src="https://mintcdn.com/apiyillc/EyWjOyg5fLaMGReJ/images/nano-banana-enterprise-token-setup-20260506.png?fit=max&auto=format&n=EyWjOyg5fLaMGReJ&q=85&s=cf85cd8ddaaa541ebbd970a52a98c68f" alt="Token 作成 UI: 課金モデル 'Pay-as-you-go Priority' は NB Pro の per-call 課金と NB2 の token ベース課金をカバーします。プライマリグループ Default + フォールバックグループ NanoBananaEnterprise (1.4x lane)" width="1270" height="1052" data-path="images/nano-banana-enterprise-token-setup-20260506.png" />
</Frame>

<Tip>
  **さらに進めると**: もし Token が他の画像モデル（例: GPT-image-2）もカバーしているなら、より安定した `Default` をプライマリグループにし、`NanoBananaEnterprise` をフォールバック枠に入れてください — プライマリ側で 429 が発生しても、Token を切り替えずに自動フェイルオーバーでエンタープライズグループへ移行します。
</Tip>

## 互換性の注意

以前に以下のモデルを使用していた場合は、モデル名をそのまま置き換えるだけでOKです。

### 最新バージョンにアップグレード

* 旧バージョンの任意のもの → `gemini-3-pro-image-preview` (🔥 推奨, Nano Banana Pro)
  * 4Kの高解像度出力に対応
  * 最も強力なテキストレンダリング機能
  * ローカル編集機能

### 安定版を使用

* `gpt-4o-image` → `gemini-2.5-flash-image`
* `sora_image` → `gemini-2.5-flash-image`
* 旧 Nano Banana → `gemini-2.5-flash-image`

シームレスに切り替えられるよう、他のパラメータは変更しないでください。

## 対応解像度とアスペクト比

### 出力解像度

Nano Banana Pro は 3 つの解像度ティアをサポートしています — 1K、2K、4K（512px ティアは Nano Banana 2 限定です）:

| 解像度 | 説明       | 推奨用途                 |
| --- | -------- | -------------------- |
| 1K  | デフォルト    | ソーシャルメディア、Web 表示     |
| 2K  | HD       | HD ディスプレイ、印刷物        |
| 4K  | Ultra HD | プロフェッショナルデザイン、商業ポスター |

### アスペクト比ごとの出力サイズ（ピクセル）

下の表は、1K / 2K / 4K の解像度ティア全体における、10 種類すべてのアスペクト比に対する Nano Banana Pro の実際の出力サイズを示しています（ソース: Google 公式ドキュメント）。リクエストでは、比率には `aspect_ratio` を、ティアには `image_size`（または `resolution`）を設定してください:

| アスペクト比   | 1K        | 2K        | 4K        |
| -------- | --------- | --------- | --------- |
| **1:1**  | 1024×1024 | 2048×2048 | 4096×4096 |
| **2:3**  | 848×1264  | 1696×2528 | 3392×5056 |
| **3:2**  | 1264×848  | 2528×1696 | 5056×3392 |
| **3:4**  | 896×1200  | 1792×2400 | 3584×4800 |
| **4:3**  | 1200×896  | 2400×1792 | 4800×3584 |
| **4:5**  | 928×1152  | 1856×2304 | 3712×4608 |
| **5:4**  | 1152×928  | 2304×1856 | 4608×3712 |
| **9:16** | 768×1376  | 1536×2752 | 3072×5504 |
| **16:9** | 1376×768  | 2752×1536 | 5504×3072 |
| **21:9** | 1584×672  | 3168×1344 | 6336×2688 |

<Info>
  `1:4`、`4:1`、`1:8`、`8:1` の超縦長/超横長比率、または 512px の低解像度ティアが必要な場合は、[Nano Banana 2](/ja/api-capabilities/nano-banana-2-image/overview) を使用してください（14 種類のアスペクト比 + 512px）。
</Info>

## よくある質問

<AccordionGroup>
  <Accordion title="Nano Banana 2 と Pro のどちらを選ぶべきですか？">
    **最もお得に使うなら** **Nano Banana 2** を選んでください（`gemini-3.1-flash-image-preview`）:

    * Pro級の品質 + Flash級の速度
    * 従量課金は最安 \$0.025/image
    * 14種類のアスペクト比（Pro より4種類多い）
    * 独自機能: thinking モード、Image Search Grounding

    **最高品質を求めるなら** **Nano Banana Pro** を選んでください（`gemini-3-pro-image-preview`）:

    * 最高の忠実度
    * \$0.09/request

    詳しくは [Nano Banana 2 ドキュメント](/ja/api-capabilities/nano-banana-2-image/overview) をご覧ください。
  </Accordion>

  <Accordion title="Pro版とレガシー版のどちらを選ぶべきですか？">
    **新規プロジェクトには Nano Banana Pro を推奨します**（`gemini-3-pro-image-preview`）

    ✅ **Pro版の利点**:

    * 4K 超高解像度（1K、2K、4K）に対応
    * 業界最先端のテキストレンダリング品質
    * 高度なローカル編集機能
    * 公式料金の約38〜67%のみ

    ⚡ **レガシー版**（`gemini-2.5-flash-image`）は次の用途に適しています:

    * コスト重視のシナリオ（約 \$0.025/image 対 \$0.09/image）
    * 高速生成が必要な場合（10秒対20秒）
    * 既存プロジェクトの移行
  </Accordion>

  <Accordion title="他の画像モデルから Nano Banana に切り替えるには？">
    モデル名を `gpt-4o-image` または `sora_image` から `gemini-3-pro-image-preview`（推奨の Pro）または `gemini-2.5-flash-image`（レガシー）に変更するだけで、他のパラメータはそのままです。
  </Accordion>

  <Accordion title="生成された画像の形式は何ですか？">
    モデルは base64 エンコードされた画像データを返し、通常は PNG または JPEG 形式です。コードが形式を自動検出し、対応するファイル形式で保存します。
  </Accordion>

  <Accordion title="画像編集機能はサポートしていますか？">
    はい、Nano Banana Pro は画像生成と編集の両方に対応しています。[Image Editing API Reference](/ja/api-capabilities/nano-banana-image/image-edit) をご覧ください。
  </Accordion>

  <Accordion title="connection reset by peer / write_response_body_failed (500) が発生するのはなぜですか？">
    完全なエラーは次のとおりです:

    ```text theme={null}
    [&{{write tcp ip:port->ip:port: write: connection reset by peer Unknown error shell_api_error  write_response_body_failed} 500 }]
    ```

    これは**通常、画像アップロードが大きすぎることが原因です。リクエスト本文が大きくなりすぎて、接続が切れてしまいます。** 次のベストプラクティスに従ってください:

    * **画像枚数を制限する**: 公式ルール内（1 prompt あたり最大14枚）に収め、参照画像を詰め込みすぎないでください。
    * **画像1枚あたりのサイズを制限する**: 各画像を5MB未満に抑えてください。公式の1枚あたり上限は7MBですが、base64 エンコードでサイズは約1/3増えるため、余裕を持たせてください。
    * **アップロード前にフロントエンドで圧縮する**: API に送る前に、フロントエンド（またはサーバー側リレー）で画像を圧縮してください。一般的には、長辺を制限し、JPEG/WebP に変換し、quality パラメータを調整します。
    * **URL 入力に切り替える**: Gemini のネイティブ形式では `fileData.fileUri` 経由で画像 URL を渡せるため、巨大な base64 のリクエスト本文を完全に回避できます。詳しくは [Nano Banana Dev Guide](/ja/api-capabilities/nano-banana-dev-guide) をご覧ください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [Nano Banana 2 画像生成](/ja/api-capabilities/nano-banana-2-image/overview)
* [Nano Banana 料金](/ja/api-capabilities/nano-banana-pricing)
* [その他の画像生成モデル](/en/api-capabilities/gpt-image-1)
* [API 利用マニュアル](/ja/api-manual)
