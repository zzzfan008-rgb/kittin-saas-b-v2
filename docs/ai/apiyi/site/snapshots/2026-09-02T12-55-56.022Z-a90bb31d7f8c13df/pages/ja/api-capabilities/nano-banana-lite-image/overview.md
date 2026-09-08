> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Lite 画像生成/編集

> Google の最速・最も効率的な画像モデル Nano Banana 2 Lite (gemini-3.1-flash-lite-image) - 画像1枚あたり約 4 秒、Nano Banana 2 より約 2.7 倍高速で、1Kキャンバス + 14 のアスペクト比に特化しています。APIYI の token ベースの実運用平均は約 $0.018/回で（Google のレートの 40%）、1回あたり $0.025 です。

## 概要

**Nano Banana 2 Lite**（このセクションでは **Nano Banana Lite** と短縮表記）は、2026年6月30日にリリースされた Google の画像モデルで、モデル ID は`gemini-3.1-flash-lite-image`です。これは Nano Banana 2（`gemini-3.1-flash-image`）の**軽量で低コストなバージョン**で、**速度とコスト**に重点を置いています。1枚あたり約4秒で、Nano Banana 2 より約**2.7倍高速**であり、Nano Banana シリーズの中で**最速かつ最安**のティアです。

<Note>
  **🍌 2026年6月30日リリース**: Nano Banana 2 Lite が提供開始されました！ 1枚あたり約4秒、Nano Banana 2 より約2.7倍高速で、1K キャンバス + 14 のアスペクト比に対応し、SynthID の不可視ウォーターマークを内蔵しています。APIYI は即座に公開しました — 実運用では token ベースの**平均は約\$0.018/呼び出し**（Google の料金の40%）、1回あたり \$0.025 — 高同時実行数、低コスト、迅速な反復のために設計されています。
</Note>

<Warning>
  **暫定価格**: このモデルは公開されたばかりで、現在の価格は暫定です。最終価格は後で調整される可能性があります。変更がある場合はお知らせします — プラットフォーム上のライブ価格を参照してください。
</Warning>

<Info>
  すべての画像 API は**同期型**です — ポーリングする task ID はなく、クライアントが切断されると、リクエストは課金されたまま結果は失われます。このモデルでは十分に長いタイムアウトを設定してください。[画像 API の基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices) を参照してください。
</Info>

<CardGroup cols={2}>
  <Card title="テキストから画像への API" icon="wand-sparkles" href="/ja/api-capabilities/nano-banana-lite-image/text-to-image">
    テキスト prompt から画像を生成します。オンラインでテストできるインタラクティブなプレイグラウンドが含まれます。
  </Card>

  <Card title="画像編集 API" icon="image" href="/ja/api-capabilities/nano-banana-lite-image/image-edit">
    画像をアップロードし、編集指示を与えて新しい画像を生成します。インタラクティブなプレイグラウンドが含まれます。
  </Card>
</CardGroup>

## AI エージェントに統合を任せる

<Note>
  Codex / Claude Code / Cursor で開発する場合は、以下のプロンプトをコピーしてエージェントに渡してください。エージェントはまずこのページのプレーンテキスト版を取得し（任意の docs URL に `.md` を付けます）、その後、あなたのプロジェクト固有のスタックでコードを書きます。タイムアウト、防御的な `parts` パース、アップロード前の圧縮、そして Lite が 1K のみであることは、すでに要件に組み込まれています。
</Note>

<Prompt description="コーディングエージェントに Nano Banana Lite のテキストから画像生成と画像編集の統合・トラブルシューティングを任せてください。Codex、Claude Code、Cursor などのツールにコピーして貼り付けてください。" icon="bot" actions={["copy"]}>
  このプロジェクトで Nano Banana Lite（`gemini-3.1-flash-lite-image`）のテキストから画像生成と画像編集を統合 / トラブルシューティングしてください。

  コードに手を付ける前にドキュメントを読んでください: このページのプレーンテキスト版を取得するため、[https://docs.apiyi.com/en/api-capabilities/nano-banana-lite-image/overview.md](https://docs.apiyi.com/en/api-capabilities/nano-banana-lite-image/overview.md) を読み込んでください。より詳細なパラメータについては、テキストから画像生成ページと画像編集ページにも同じように `.md` を付けてください。

  要件:

  1. タイムアウト: `POST https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent` で Gemini ネイティブ形式を呼び出し、クライアントのタイムアウトを 300 秒に設定してください。このモデルは通常 4 秒ほどで画像を返しますが、300 秒はピーク時の混雑に備えた余裕です。なので **速いからといってタイムアウトを数十秒に縮めないでください**。画像 API は同期型です — task ID はないため、クライアントが切断されるとリクエストはまだ課金対象のままでも結果は失われます。リバースプロキシ、ゲートウェイ、サーバーレスの実行制限もすべて広げる必要があります。

  2. レスポンスのパース（**最もミスしやすい点**）: 画像は base64 で、`inlineData.data` は `candidates[0].content.parts[]` 内にあります。ですが `parts` は、長さと順序が保証されない **異種配列** です — テキストパートが先に来ると、画像は 0 ではなく 1 番目のインデックスになります。なので **`parts[0]` や `parts[1]` をハードコードしないでください**。その 2 つを切り替えても解決しません。正しい方法は、`parts` を反復し、`inlineData` を持つすべてのエントリをフィルタリングして、**最後** の 1 つを取ることです。`mimeType` もレスポンスから読み取り、`image/png` と決めつけないでください。その後、画像を表示し、ディスクに保存するアクションを用意してください。

  3. アップロード前に圧縮してください: 編集では、参照画像を `inlineData` の中に base64 として渡します（`image/png` と `image/jpeg` がサポートされています）。まず圧縮してください — 1.5MB を超えるファイルだけを処理し、アスペクト比を維持したまま長辺を 2048px まで縮小し（小さい画像は絶対に拡大しない）、品質 0.9 で再エンコードし、元の形式を保持します。複数画像リクエストでは合計サイズを 6MB 未満に保ってください。Base64 エンコードすると全体はおよそ 3 分の 1 膨らむので、生のスマホ写真は送らないでください。1 枚の画像の圧縮に失敗した場合は、元の画像にフォールバックして続行してください。また、**1 つのパートには `text` または `inlineData` のどちらか一方だけを含めることができ、両方は入りません** — 正しい構造は、1 つのテキストパートと N 個の画像パートです。

  4. 解像度パラメータ: Lite では、`generationConfig.imageConfig.imageSize` は **`1K` のみ** を受け付けます — `2K` や `4K` を送るとエラーになります。Nano Banana 2 からコードを移植している場合は、それらの値を必ず削除してください。`aspectRatio` は、このページに記載された 14 個の比率をサポートしています。デフォルトに頼らず、明示的に送ってください。UI に必要なのはアスペクト比のドロップダウンだけで、解像度のドロップダウンは不要です。

  5. エラーハンドリング: コンテンツモデレーションがリクエストをブロックしても HTTP ステータスは 200 のままですが、`candidates[0].content.parts` は空で返ってきます。まず `candidatesTokenCount` が 0 かを確認し、それから `finishReason` が `STOP` 以外かを確認してください。`IMAGE_SAFETY` などのブロックは **課金されず**、同一入力を 1 回か 2 回再試行すると通ることがよくあるので、自動リトライを組み込んでください。

  6. キーは `APIYI_API_KEY` 環境変数から読み取り、`Authorization` ヘッダーに `Bearer` プレフィックス付きで送信してください。決してハードコードせず、git にコミットしないでください。

  7. 完了したら、実際にテキストから画像生成の呼び出しを 1 回と画像編集の呼び出しを 1 回実行し、その結果と、その 2 回の呼び出しにかかった費用を見せてください。
</Prompt>

<Accordion title="このプロンプトで避けられること">
  | 要件                        | 防げる落とし穴                                                                                                                                                            |
  | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `imageSize` を `1K` のみに設定  | Lite は 1 つのティアしかないため、Nano Banana 2 から移植して `2K` / `4K` を残すとエラーになります                                                                                                 |
  | `parts` のインデックスをハードコードしない | 長さと順序は保証されないため、固定インデックスでは断続的に失敗します。詳細は [Nano Banana 開発者ガイド](/ja/api-capabilities/nano-banana-dev-guide) を参照してください                                                  |
  | タイムアウトを 300 秒のままにする       | 典型的なレイテンシーが 4 秒だと、つい短いタイムアウトにしたくなりますが、それだとピーク時の混雑で誤発火し、**切断されたリクエストもまだ課金対象です**。詳細は [画像 API の基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices) を参照してください |
  | アップロード前に圧縮する              | Base64 エンコードはペイロードを約 3 分の 1 膨らませるため、生のスマホ写真はすべてのリクエストを遅くします。詳細は [画像圧縮と出力解像度](/ja/api-capabilities/image-compression-resolution) を参照してください                          |
  | `IMAGE_SAFETY` で自動リトライする  | モデレーションブロックは画像なしで 200 を返し、課金されません。まったく同じ入力を再試行すると通ることがよくあります。詳細は [Gemini 画像エラーハンドリング](/ja/api-capabilities/gemini-image-error-handling) を参照してください                  |
</Accordion>

## APIYI の Nano Banana Lite が選ばれる理由?

**APIYI における利用量第1位のモデルは Nano Banana Pro / 2 です** — 安定、信頼性、速度に優れています。Lite プランは「速い」「安い」を新たなレベルへ引き上げ、高スループットのシナリオに最適です。APIYI は **信頼性**、**コスト**、**統合** の各面で体験を徹底的に最適化しています:

<CardGroup cols={2}>
  <Card title="公式チャネル · Gemini と同等" icon="shield-check">
    Google のネイティブ Gemini API (`/v1beta/models/.../generateContent`) と OpenAI SDK パターンと 100% 互換で、リクエストボディ、レスポンスフィールド、エラーコードも同じです。コード変更なしで移行できます。
  </Card>

  <Card title="同時実行数の制限なし" icon="infinity">
    Google AI Studio の RPM/RPD 上限に縛られません。エンタープライズ規模のバッチ生成やピークトラフィックでも、クォータによる中断なしに線形に拡張できます。
  </Card>

  <Card title="tokenベースで約\$0.018/回" icon="percent">
    **tokenベースの実運用平均は約\$0.018/回です**（Google のレートの 40%: 入力 \$0.10 / 出力 \$12 per 1M tokens）、1回あたり \$0.025/image より安くなります（Google は約 \$0.034）。[チャージボーナス](/ja/faq/recharge-promotions)と組み合わせれば、さらに低コストです。
  </Card>

  <Card title="グローバルなゼロ障壁アクセス" icon="globe">
    **海外サーバーやプロキシは不要** — 中国本土のデータセンター、家庭用ネットワーク、または海外ノードから `api.apiyi.com` に直接接続できます。安定したレイテンシで、越境構成の再設計も不要です。
  </Card>

  <Card title="モデルラインナップ" icon="layers">
    同シリーズには [Nano Banana Pro](/ja/api-capabilities/nano-banana-image/overview)（最高品質）、[Nano Banana 2](/ja/api-capabilities/nano-banana-2-image/overview)（品質 + 速度）、そして Nano Banana 2 Lite（最速、最安）が含まれており、シーンに応じて使い分けられます。
  </Card>

  <Card title="プロフェッショナルなエンタープライズサポート" icon="handshake">
    当チームは本番の画像生成デプロイに特化しており、モデル選定、チューニング、統合に深い経験があります。PoC から本番までエンドツーエンドでサポートします。
  </Card>
</CardGroup>

## 主な機能

<CardGroup cols={2}>
  <Card title="約4秒/画像" icon="gauge">
    約4秒/画像で、Nano Banana 2より約2.7倍高速 — 高い同時実行数と迅速な反復に最適です
  </Card>

  <Card title="低コスト" icon="hand-coins">
    tokenベースでは実運用の平均が約\$0.018/回（Googleのレートの40%）で、1回あたり\$0.025より安価です — コストに敏感な画像ごとのワークロードに最適です
  </Card>

  <Card title="14種類のアスペクト比" icon="maximize">
    `1:1`、`4:1`、`1:4`、`16:9`、`9:16`を含む14種類の比率をカバーします — さまざまなレイアウトに適しています
  </Card>

  <Card title="SynthIDウォーターマーク" icon="shield-check">
    出力にはSynthIDの不可視デジタルウォーターマークが含まれます — 肉眼では見えず、利用に影響しません
  </Card>
</CardGroup>

## バージョン比較

| 機能       | **Nano Banana 2 Lite**        | Nano Banana 2            | Nano Banana Pro      |
| -------- | ----------------------------- | ------------------------ | -------------------- |
| モデルID    | `gemini-3.1-flash-lite-image` | `gemini-3.1-flash-image` | `gemini-3-pro-image` |
| 位置づけ     | 最速 / 最安                       | 品質 + 速度                  | 最高品質                 |
| 品質       | ⭐⭐⭐⭐ 優秀                       | ⭐⭐⭐⭐⭐ Pro レベル            | ⭐⭐⭐⭐⭐ 最高             |
| 速度       | 🚀 約4秒                        | ⚡ 高速                     | 🐢 遅い                |
| 最大解像度    | 1K                            | 4K                       | 4K                   |
| アスペクト比   | 14                            | 14                       | 10                   |
| APIYI 価格 | **\$0.025/画像**                | \$0.055/画像               | \$0.09/画像            |

<Tip>
  **選択ガイド**:

  * ⚡ **最もお得 / 高速なバッチ生成** → Nano Banana 2 Lite（1画像あたり約4秒、\$0.025/回）
  * 🔥 **2K/4K HD またはより高い品質が必要** → Nano Banana 2（Pro レベルの品質 + Flash レベルの速度）
  * 🎨 **最高品質** → Nano Banana Pro（最高の忠実度）
</Tip>

## 料金

<Info>
  **課金モードの選択**: Nano Banana 2 Lite は 2 つの課金モードに対応しており、API token を作成する際の「Billing model」設定で選択します:

  * **Pay-as-you-go** または **Pay-as-you-go Priority** を選択 → token ベース課金
  * **Pay-per-request** または **Pay-per-request Priority** を選択 → 呼び出しごとの課金
  * ⚠️ **Hybrid billing は選択しないでください**
</Info>

### tokenベース課金（推奨 · Google の料金の 40％）

| 課金項目 | Google 公式        | APIYI                | 割引      |
| ---- | ---------------- | -------------------- | ------- |
| 入力   | \$0.25/M tokens  | **\$0.10/M tokens**  | **40%** |
| 出力   | \$30.00/M tokens | **\$12.00/M tokens** | **40%** |

<Info>
  **予測しやすい実運用上の単価**: token ベース（token ごと）課金では、1K image は **実際には平均で約 \$0.018/call** です（一般的な範囲は約 \$0.016〜\$0.019 で、出力 token によって変動します）。固定の呼び出しごとの \$0.025/image より安く、単価が安定していて予測しやすいです。
</Info>

### 呼び出しごとの課金

| モデル                                                  | APIYI 料金          | Google 公式       | 注記                                     |
| ---------------------------------------------------- | ----------------- | --------------- | -------------------------------------- |
| **Nano Banana 2 Lite** `gemini-3.1-flash-lite-image` | **\$0.025/image** | \~\$0.034/image | 固定料金です。後で引き下げられる可能性はありますが、現時点では変更ありません |

<Tip>
  **💰 どの課金モードがおすすめですか？ `Pay-as-you-go Priority` をおすすめします。** token ベース（token ごと）課金は実際には約 \$0.018/call で、予測しやすい単価のまま呼び出しごとの \$0.025 より安くなります。また、token の課金モデルを `Pay-as-you-go Priority` に設定しておけば、**1つの token で Nano Banana Pro / 2 の呼び出しごとの課金もカバーできます**。1つの token でシリーズ全体を利用できます。呼び出しごとの \$0.025/image は固定料金で、**後で引き下げられる可能性はありますが、現時点では変更ありません**。プラットフォーム上の最新価格をご確認ください。チャージ特典を組み合わせると、実際のコストはさらに下がります。
</Tip>

<Warning>
  このモデルは公開されたばかりで、現在の価格は暫定です。最終価格は後で調整される可能性があります（呼び出しごとの \$0.025/image は後で引き下げられる可能性があります）。変更があればお知らせします。プラットフォーム上の最新価格をご確認ください。
</Warning>

## グループ設定

Nano Banana 2 Lite は APIYI のデフォルトチャネルで動作します。専用グループは不要です:

| グループ      | レート  | 使用する場面                      |
| --------- | ---- | --------------------------- |
| `Default` | 1.0x | ベースレーン。価格表と一致します。推奨のデフォルトです |

**推奨の課金モデル: デフォルトでは `Pay-as-you-go Priority` を選択してください。** 理由は3つあります: ① token-based（per-token）課金は実運用では約 \$0.018/回で、per-call の \$0.025 より安いです。② 単価が安定していて予測しやすいです。③ 1 token **で Lite / Nano Banana 2 の token-based 課金と Nano Banana Pro の per-call 課金の両方をカバーできます** — 1 token でシリーズ全体を実行できます。

## 対応解像度とアスペクト比

### 出力解像度

| 解像度 | 説明              | 推奨用途                        |
| --- | --------------- | --------------------------- |
| 1K  | 唯一のティア（2K/4Kなし） | SNS画像、サムネイル、ドラフトプレビュー、Web表示 |

<Info>
  Nano Banana 2 Lite は **1Kキャンバス** に特化しており、2K/4K はサポートしていません。より高い解像度や高い品質が必要な場合は、[Nano Banana 2](/ja/api-capabilities/nano-banana-2-image/overview)（最大4K）または [Nano Banana Pro](/ja/api-capabilities/nano-banana-image/overview) に切り替えてください。
</Info>

### 対応アスペクト比（合計14種類）

`1:1`, `1:4`, `4:1`, `1:8`, `8:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`

### アスペクト比ごとの出力サイズ（1K、ピクセル）

リクエストでは、比率として `aspectRatio` を設定し、`imageSize` を `1K` に保ってください:

| アスペクト比   | 1K出力      |
| -------- | --------- |
| **1:1**  | 1024×1024 |
| **1:4**  | 512×2048  |
| **1:8**  | 384×3072  |
| **2:3**  | 848×1264  |
| **3:2**  | 1264×848  |
| **3:4**  | 896×1200  |
| **4:1**  | 2048×512  |
| **4:3**  | 1200×896  |
| **4:5**  | 928×1152  |
| **5:4**  | 1152×928  |
| **8:1**  | 3072×384  |
| **9:16** | 768×1376  |
| **16:9** | 1376×768  |
| **21:9** | 1584×672  |

## よくある質問

<AccordionGroup>
  <Accordion title="Nano Banana 2 Lite と Nano Banana 2 の違いは何ですか？">
    どちらも Google の Gemini 3.1 Flash シリーズをベースにしており、**Lite** は**軽量で経済的なバージョン**です。

    * ✅ **速度**: Lite は約 4 秒で生成され、Nano Banana 2 より約 2.7 倍高速です
    * ✅ **価格**: Lite の token ベースの実測平均は約 \$0.018/回（Google の料金の 40%）で、1 回あたり \$0.025 です — 大量利用に向いています
    * ⚠️ **解像度**: Lite は 1K のみ対応で、Nano Banana 2 は最大 4K まで対応します
    * ⚠️ **品質上限**: 最高品質を求めるなら、Nano Banana 2 / Pro のほうが優れています

    Nano Banana 2 からの移行はモデル名を変更するだけです（Lite は 1K のみである点に注意してください）：`gemini-3.1-flash-image` を `gemini-3.1-flash-lite-image` に置き換えます。
  </Accordion>

  <Accordion title="Lite と Nano Banana 2 のどちらを選ぶべきですか？">
    * **コストパフォーマンス重視 / 高速なバッチ生成 / 1K で十分** → **Lite** を選択（約 4 秒、\$0.025/回）
    * **2K/4K の HD が必要、またはより高い品質が必要** → **Nano Banana 2** を選択（最大 4K、Pro レベルの品質）

    両者でコードは同じで、モデル名だけが異なります。そのため、いつでも切り替えて試せます。
  </Accordion>

  <Accordion title="画像の生成にはどのくらい時間がかかりますか？">
    Nano Banana 2 Lite は速度重視で設計されており、**1K 解像度で約 4 秒**です。それでも、まれな遅延やピーク時の混雑に備えて、クライアントのタイムアウトは長め（例: 300 秒）に設定してください。
  </Accordion>

  <Accordion title="同時実行数に制限はありますか？">
    **API に同時実行数の制限はなく、直列処理もしません。** ご自身で並行リクエストを安全に送信できます — リクエスト同士がキューに入ったり、互いにブロックしたりしません。Google AI Studio とは異なり、APIYI チャネルには厳格な RPM/RPD 制限がないため、企業向けのバッチ生成やピークトラフィックでも線形にスケールします。

    本当に重要なのは `timeout` です — Lite は高速ですが、ピーク時の混雑では 1 リクエストでも遅くなることがあるため、クライアントのタイムアウトを 300 秒に設定してください。
  </Accordion>

  <Accordion title="入力画像としてサポートされる形式は何ですか？">
    画像編集では、base64 エンコード経由で `image/png` と `image/jpeg` に対応しています。[画像編集 API リファレンス](/ja/api-capabilities/nano-banana-lite-image/image-edit) をご覧ください。
  </Accordion>

  <Accordion title="出力画像に透かしは入りますか？">
    すべての出力画像には、SynthID の目に見えないデジタル透かし（Google の AI 生成コンテンツ識別技術）が含まれます。肉眼では見えず、利用にも影響しません。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [Nano Banana 2 画像生成](/ja/api-capabilities/nano-banana-2-image/overview) - 品質 + 速度ティア、最大 4K
* [Nano Banana Pro 画像生成](/ja/api-capabilities/nano-banana-image/overview) - 究極品質のフラッグシップ
* [画像生成比較テスト](https://imagen.apiyi.com/)
* [API 利用マニュアル](/ja/api-manual)

<Info>
  Nano Banana 2 Lite がリリースされました。機能と料金は調整される場合があります。最新情報はドキュメントの更新をご確認ください。
</Info>
