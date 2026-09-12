> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream 画像生成・編集

> ByteDance BytePlus ModelArk Seedream画像生成モデルの完全ガイド — 利用可能な3つのバージョン（5.0 / 4.5 / 4.0）、4K出力、複数画像の融合、バッチシーケンス生成、参照画像編集を、単一のエンドポイントで利用できます。

## 概要

**Seedream** は ByteDance BytePlus ModelArk のフラッグシップ画像生成モデルシリーズで、**統合生成・編集アーキテクチャ** を備えています。テキストから画像生成、単一画像編集、複数画像融合、バッチシーケンス生成のすべてが 1 つの `/v1/images/generations` エンドポイントで実行され、違いはパラメータだけです。APIYI は BytePlus と戦略的提携を結び、稼働中の全バージョンを初日から統合しています。

<Note>
  **🎨 ハイライト**: 統一課金で利用できる 3 つの稼働中バージョン (5.0 / 4.5 / 4.0) + 4K 出力 + 融合用の参照画像を最大 10 枚 + バッチ（入力 + 出力 ≤ 15）+ トップクラスのテキスト描画。**Eコマースのメインビジュアル、広告ポスター、商品撮影、コンテンツ制作に最適** — 高画質と読みやすいテキストの両方が重要なあらゆる場面に向いています。
</Note>

<Info>
  すべての画像 API は**同期式**です。ポーリングする task ID はなく、クライアントが切断されると結果は失われますが、リクエストは課金されます。このモデルでは十分に長めのタイムアウトを設定してください。詳細は [Image API Essentials & Best Practices](/ja/api-capabilities/image-api-best-practices) をご覧ください。
</Info>

<Note>
  **これはどの Seedream ですか？** APIYI は Seedream を BytePlus の公式海外（国際版）リソース上で提供しています。これは中国本土向けの Doubao / Volcengine 版ではありません。国際版には国内版より比較的緩やかなコンテンツモデレーションポリシーが適用されるため、より自由に制作できます。これはこのプラットフォームの大きな利点ですが、**モデレーションがないという意味ではありません**。BytePlus は組み込みのコンテンツ安全チェックを引き続き実施しており、ポリシーに違反する prompt や参照画像は 400/403 で拒否されます（拒否分は課金されません）。コンプライアンスを守ってご利用ください。
</Note>

<CardGroup cols={2}>
  <Card title="テキストから画像生成 API" icon="wand-sparkles" href="/ja/api-capabilities/seedream-image/text-to-image">
    `POST /v1/images/generations`. prompt から 1K / 2K / 3K / 4K、または正確なピクセルサイズで画像を生成します。
  </Card>

  <Card title="画像編集 API" icon="image" href="/ja/api-capabilities/seedream-image/image-edit">
    同じエンドポイントに `image` パラメータを追加します。単一画像編集、複数画像融合、およびバッチシーケンス（最大 15 画像）に対応します。
  </Card>

  <Card title="過去のバージョン" icon="rotate-ccw-clock" href="/ja/api-capabilities/seedream-image/historical-versions">
    5.0 / 4.5 / 4.0 の仕様比較、料金の違い、移行ガイド。
  </Card>
</CardGroup>

## AI エージェントに統合を任せる

<Note>
  Codex / Claude Code / Cursor で構築している場合は、下の prompt をコピーしてエージェントに渡してください。まずこのページのプレーンテキスト版を取得し（任意の docs URL に `.md` を付けます）、その後はプロジェクト固有のスタックでコードを書きます。つまり、timeout、URL 結果の即時再ホスト、multipart ではなく URL 配列による編集、そして `seedream-5-0-pro` が拒否する parameters は、すでに要件に織り込み済みです。
</Note>

<Prompt description="Codex、Claude Code、Cursor などのツールにコピー＆ペーストして使える、コードエージェントに Seedream のテキストから画像生成と画像編集を統合またはトラブルシュートさせます。" icon="bot" actions={["copy"]}>
  このプロジェクトで Seedream のテキストから画像生成と画像編集を統合／トラブルシュートしてください。

  コードに触る前に docs を読んでください。このページのプレーンテキスト版は [https://docs.apiyi.com/en/api-capabilities/seedream-image/overview.md](https://docs.apiyi.com/en/api-capabilities/seedream-image/overview.md) を取得します。より細かな parameters の詳細については、同じように text-to-image と image-edit のページに `.md` を付けてください。

  要件:

  1. Timeout: client の timeout は model ごとに段階化してください — 4.x series は 60 秒から始め、`seedream-5-0` は 120 秒に引き上げ、さらに **`seedream-5-0-pro` は 240 秒に引き上げます。これは画像 1 枚あたり約 2 分かかります**。image APIs は同期式なので task ID はありません。したがって client が切断されると、request は billing 対象のまま結果を失います。Reverse proxy、gateway、serverless 実行制限もすべて広げる必要があります。

  2. Response の扱い: デフォルトは `url` です。これは BytePlus TOS の一時的な署名付きリンクで、約 24 時間で期限切れになります。代わりに `response_format` を `b64_json` に設定すると、プレーンな base64 を返せます（`data:` プレフィックスはありません）。URL を採用する場合は、**ただちにダウンロードして自分の object storage に再ホストしてください**。上流のリンクを長期的なアドレスとして database に保存してはいけません。base64 を採用する場合は、レンダリングしてディスク保存アクションを提供してください。デフォルトに頼らず、`response_format` を明示的に送ってください。

  3. 参照画像のアップロード（**他の image models との最大の違い**）: Seedream は統合された生成・編集アーキテクチャを使うため、**`/v1/images/edits` endpoint はありません**。生成も編集も `/v1/images/generations` に対して `application/json` として送ります。参照画像は `image` フィールドに入れます。これは **URL 配列** であり、multipart の file upload でも、繰り返しの `image[]` フィールドでもありません。配列要素には、image URL または `data:image/jpeg;base64,...` 形式の data URL を指定でき、両方を混在させることもできます。参照画像は最大 10 枚まで許可され、**入力画像と出力画像を合わせて 15 枚を超えてはいけません**。`mask` フィールドはありません。大きなローカルファイルは、まず自分の object storage に upload してから URL を渡してください。data URL を使う場合は先に圧縮します。1.5MB を超えるファイルだけを処理し、縦横比を保ったまま長辺を 2048px に縮小し（小さい画像は絶対に upscale しない）、quality 0.9 で再エンコードし、multi-image request では合計サイズを 6MB 未満にしてください。1 枚の画像が圧縮に失敗したら、元の画像にフォールバックして処理を続行してください。

  4. Parameter の赤線: この model には **`quality` parameter はありません**。忠実度は model version と `size` で決まります。`size` は tier（`1K` / `2K` / `3K` / `4K`、デフォルト `2K`）または正確な pixels のどちらかを受け付けます。なお、`seedream-5-0-pro` は 2048×2048 で約 419 万 pixels までで、**3K や 4K の tier はありません**。`n` は **黙って無視されます**（それでも画像は 1 枚生成され、1 枚分課金されます）ので、複数出力には `sequential_image_generation` を使ってください。`seed` は 4.x や 5.x では効果がありません。商用利用では **必ず `watermark` を false にして送信してください**。デフォルトは version によって異なるためです。`output_format` は 5.0 と 5.0-pro でのみ png をサポートし、4.5 と 4.0 は jpeg のみを出力し、alpha channel はありません。

  5. `seedream-5-0-pro` に対する 2 つの厳しい赤線: **`sequential_image_generation` は絶対に送らないでください。`"disabled"` を含むどんな値でも 400 が返ります**。そして **`stream` も送らないでください**（これも 400 です）。5.0 や 4.x からコードを移植する場合は、この 2 つのフィールドを完全に削除してください。

  6. key は `APIYI_API_KEY` environment variable から読み取り、base URL には [https://api.apiyi.com/v1](https://api.apiyi.com/v1) を使ってください。ハードコードも git への commit もしてはいけません。OpenAI SDK 経由で呼び出す場合、`image`、`sequential_image_generation`、`watermark`、`output_format` parameters は、転送されるように `extra_body` の中に入れる必要があります。

  7. 終了したら、実際に text-to-image call を 1 回と image-edit call を 1 回実行し、その結果と、それら 2 つの call の費用を見せてください。
</Prompt>

<Accordion title="この prompt で避けられること">
  | 要件                        | 防げる落とし穴                                                                                                                                                                                          |
  | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | 編集は multipart を使わない       | Seedream には `/v1/images/edits` がないため、参照画像は JSON の URL 配列であり、OpenAI 風の multipart アプローチは完全に失敗します                                                                                                   |
  | サーバー側で即座に再ホストする           | 上流リンクは約 24 時間で期限切れになるため、長期保存すると 404 がじわじわ増えます                                                                                                                                                    |
  | model ごとに timeout を段階化する  | `seedream-5-0-pro` は約 2 分かかるため、60 秒 timeout は常に発火します — しかも **切断された request も billing 対象のままです**。 [Image API Essentials & Best Practices](/ja/api-capabilities/image-api-best-practices) を参照してください |
  | `5-0-pro` 上の 2 つの禁止フィールド  | `sequential_image_generation` は `"disabled"` に設定しても 400 を返すため、別 version から移植するときの最も簡単な落とし穴です                                                                                                     |
  | `n` に頼らない                 | これは黙って無視され、それでも画像は 1 枚返ります。代わりに `sequential_image_generation` を使ってください                                                                                                                           |
  | `watermark` を false にして送る | デフォルトは version ごとに異なるため、商用出力にウォーターマークが付いて返ってくる可能性があります                                                                                                                                           |
</Accordion>

## APIYIのSeedreamが選ばれる理由

BytePlus ModelArk 公式チャネルのドロップイン代替として、本番利用向けに **安定性**、**コスト**、**統合性** の3軸で最適化されています:

<CardGroup cols={2}>
  <Card title="戦略的パートナーシップ · 安定したリソース" icon="shield-check">
    BytePlus ModelArk への公式な直接接続です。リクエストとレスポンスの挙動は上流と同一で、**プロトコルの回避はなく**、本番環境でも安心して利用できます。
  </Card>

  <Card title="無制限の同時実行数 · エンタープライズ対応" icon="infinity">
    バッチ生成、複数画像の融合、シーケンス生成をリニアにスケールできます。Tier型のアカウント制限はありません。**デフォルトは 500 RPM** で、より高いクォータが必要な場合は営業までお問い合わせください。
  </Card>

  <Card title="同価格 + チャージで最大20%オフ" icon="percent">
    標準の単価は BytePlus 公式価格と一致します。[チャージ特典](/ja/faq/recharge-promotions) と組み合わせることで、実質価格は定価の **最安80%** まで下がります。
  </Card>

  <Card title="グローバルなゼロフリクションアクセス" icon="globe">
    **海外サーバーやプロキシは不要です**。中国本土のデータセンター、住宅ネットワーク、海外ノードから `api.apiyi.com` に直接接続できます。BytePlus `ap-southeast-1` / `eu-west-1` リージョン向けのルーティング設定も不要です。
  </Card>

  <Card title="OpenAI互換 · コード変更不要" icon="plug">
    `/v1/images/generations` は OpenAI と同一です。OpenAI SDK の `base_url` を APIYI に向ければ、そのまま API を呼び出せます。拡張パラメータ（`image` / `sequential_image_generation` など）は `extra_body` で渡してください。OpenAI の `n` パラメータは上流ではサポートされていない点にご注意ください（無視されるだけで、画像は1枚のままです）。複数画像出力には `sequential_image_generation` を使用してください。
  </Card>

  <Card title="プロフェッショナルサポート · エンタープライズコンシェルジュ" icon="handshake">
    複数画像の融合、テキスト描画、バッチ素材制作など、画像生成ユースケースに深く精通しています。PoC から本番展開まで、エンドツーエンドでサポートします。
  </Card>
</CardGroup>

## 主な機能

<CardGroup cols={2}>
  <Card title="4K高忠実度出力" icon="expand">
    4.0 / 4.5 は、豊かなディテール層を備えたネイティブ 4K (4096×4096) をサポートします — ポスターや印刷に最適です。5.0-lite は最大 3K ですが、全体としてより洗練された体験を提供します。
  </Card>

  <Card title="生成・編集の統合" icon="wand-sparkles">
    テキストから画像、単一画像編集、マルチ画像融合、バッチシーケンスは、すべて**1つのエンドポイントと1つのパラメータセット**を共有します。モードは`image`と`sequential_image_generation`で切り替えます。
  </Card>

  <Card title="マルチ画像融合 · 最大10件の参照" icon="layers">
    `image`は URL 配列を受け取ります。プロンプト内で「image 1 / image 2」と指定すると、順序を明示できます。被写体の一貫性を保った融合には`sequential_image_generation: "disabled"`を組み合わせます。
  </Card>

  <Card title="テキスト描画のブレークスルー" icon="type">
    4.5 リリースでは、小さい文字の可読性が大幅に向上しました。ポスター、広告コピー、商品テキストは鮮明で正確です — クラス最高水準です。
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="バッチシーケンス（最大15件）" icon="images">
    `sequential_image_generation: "auto"`と`max_images`で一貫したシリーズを出力します — ストーリーボード、ブランドビジュアル、製品シリーズに最適です。
  </Card>

  <Card title="画像1枚あたり約15秒 · バランスの取れた速度" icon="bolt">
    通常の単画像レイテンシは約15秒です。4K + hd では最大1分かかる場合があります。**500 RPM** がデフォルトで、必要に応じてスケール可能です。
  </Card>

  <Card title="柔軟なサイズ · 任意のアスペクト比" icon="ruler">
    解像度プリセット（`1K`/`2K`/`3K`/`4K`）またはピクセル指定。総ピクセル数 ∈ \[1280×720, 4096×4096]、アスペクト比 ∈ \[1/16, 16]。
  </Card>

  <Card title="そのまま使える OpenAI SDK" icon="plug">
    `base_url=https://api.apiyi.com/v1`を設定し、公式 OpenAI SDK から呼び出します。拡張パラメータは`extra_body`で渡します。移行時のコード変更は不要です。
  </Card>
</CardGroup>

## 価格

画像ごとの課金で、**BytePlus公式と同価格**です。チャージ特典により、実質単価はさらに下がります。

| モデル                       | APIYI価格              | 定価（RMB換算の目安）    | ステータス                                           |
| ------------------------- | -------------------- | --------------- | ----------------------------------------------- |
| `seedream-5-0-pro-260628` | \$0.12 / リクエスト（画像1枚） | ≈ ¥0.84 / リクエスト | 🆕 Proティア（画像1枚あたり約2分；日常作業には 5.0-lite を使用してください） |
| `seedream-5-0-260128`     | \$0.035 / 画像         | ≈ ¥0.245 / 画像   | ✅ 推奨（最新版）                                       |
| `seedream-4-5-251128`     | \$0.04 / 画像          | ≈ ¥0.28 / 画像    | ✅ 推奨                                            |
| `seedream-4-0-250828`     | \$0.03 / 画像          | ≈ ¥0.21 / 画像    | 🟡 維持中（引き続き呼び出し可能）                              |

<Info>
  **課金に関する注意**:

  * 生成された画像ごとに課金され、promptの長さや融合モードにかかわらず同じです
  * `seedream-5-0-pro` は**1リクエストあたり固定 \$0.12**で課金されます（1リクエストにつき画像1枚、バッチシーケンスは非対応）。公式には、このモデルは2つの出力ピクセル価格帯（≤2.36M px と >2.36M px でそれぞれ異なる価格）に加え、先頭以外の参照画像に対して画像ごとの料金がかかりますが、APIYIではこれを一律のリクエスト単価に簡略化しています。**ティアはなく、入力画像料金も含まれます**。このモデルには**公式割引が一切ありません**。APIYI は供給保証ベースで価格を設定しており、チャージ特典と税コストを考慮すると実質的に利益はありません。価格変更がある場合は事前に告知します
  * `sequential_image_generation: "auto"`モードでは、実際の出力数に応じて課金されます（例: `max_images: 4` の出力が4件なら、4件分課金）
  * 失敗したリクエスト（4xx / モデレーションによりブロックされたもの）は**課金されません**
  * 無料トライアル: 初回オンボーディング時に200枚の画像が無料（BytePlus提供）
  * チャージ特典の詳細: [チャージプロモーション](/ja/faq/recharge-promotions) を参照
</Info>

## 技術仕様

| 項目                   | seedream-5-0-pro                                           | seedream-5-0                      | seedream-4-5          | seedream-4-0          |
| -------------------- | ---------------------------------------------------------- | --------------------------------- | --------------------- | --------------------- |
| **Model ID**         | `seedream-5-0-pro-260628`                                  | `seedream-5-0-260128`             | `seedream-4-5-251128` | `seedream-4-0-250828` |
| **Model ID alias**   | —                                                          | `seedream-5-0-lite-260128`        | —                     | —                     |
| **リリース日**            | 2026-06-28 (UTC+8)                                         | 2026-01-28 (UTC+8)                | 2025-11-28 (UTC+8)    | 2025-08-28 (UTC+8)    |
| **解像度の階層**           | 1K / 2K + 正確な WxH（合計 ≤ 4.19M px; 16:9 では長辺が 2720 まで、約2.7K） | 2K / 3K                           | 2K / 4K               | 1K / 2K / 4K          |
| **出力形式**             | `png` / `jpeg`                                             | `png` / `jpeg`                    | `jpeg`                | `jpeg`                |
| **プロンプト最適化**         | standard / fast                                            | standard                          | standard              | standard / fast       |
| **テキストから画像生成**       | ✅                                                          | ✅                                 | ✅                     | ✅                     |
| **単一画像編集**           | ✅                                                          | ✅                                 | ✅                     | ✅                     |
| **複数画像融合**           | ✅ (最大10)                                                   | ✅                                 | ✅ (最大10)              | ✅                     |
| **バッチシーケンス**         | ❌（渡すと400）                                                  | ✅                                 | ✅                     | ✅                     |
| **ストリーミング出力**        | ❌（渡すと400）                                                  | ✅                                 | ✅                     | ✅                     |
| **1分あたり最大画像数 (RPM)** | 500                                                        | 500                               | 500                   | 500                   |
| **単一リクエストの入力 + 出力**  | input ≤ 10, output 1                                       | ≤ 15                              | ≤ 15                  | ≤ 15                  |
| **典型レイテンシ**          | 約2分                                                        | 約30秒                              | 10-20秒                | 10-15秒                |
| **応答フィールド**          | same                                                       | `data[].url` or `data[].b64_json` | same                  | same                  |

## 生成時間の比較

バージョンごとの単一リクエスト遅延の実測値です（2026-07、UTC+8で測定。リクエストから完全な応答までのウォールクロック時間であり、通常のリクエストごとのばらつきがあります）:

| シナリオ                  | seedream-4-0 | seedream-4-5 | seedream-5-0 | seedream-5-0-pro              |
| --------------------- | ------------ | ------------ | ------------ | ----------------------------- |
| テキストから画像（1K/2K）       | 7-11s        | 8-13s        | 29-34s       | **110-130s**                  |
| テキストから画像（最上位）         | \~15s (4K)   | \~18s (4K)   | \~37s (3K)   | \~134s (WxH 2720×1530, 最大サイズ) |
| 編集 / マルチ画像融合          | \~11s        | 17-21s       | 38-40s       | **115-132s**                  |
| バッチシーケンス（2画像、編集 + 自動） | —            | \~36s        | —            | —（サポートされていません）                |
| **推奨クライアントタイムアウト**    | ≥ 60s        | ≥ 60s        | ≥ 120s       | **≥ 240s**                    |

<Warning>
  **`seedream-5-0-pro` は画像1枚あたり約2分かかります**（110-132s は全実行で測定され、例外はありません）。これは深い推論を行う画像モデルとしては想定どおりの挙動であり、不具合ではありません。pro を採用する前に、プロダクトがこのレイテンシを受け入れられるか確認してください。画面の前でユーザーを待たせる対話型フローには不向きです。その場合は 5.0-lite（約30s）を使ってください。pro は、画像品質と指示への忠実さが最も重要なオフラインのバッチ制作に適しています。
</Warning>

## API エンドポイント

| エンドポイント                       | 用途                                                                                       | Content-Type       |
| ----------------------------- | ---------------------------------------------------------------------------------------- | ------------------ |
| `POST /v1/images/generations` | テキストから画像への生成 / 単一画像編集 / 複数画像融合 / バッチシーケンス — すべてのモードで1つのエンドポイントを共有し、リクエストボディのパラメータで切り替えます | `application/json` |

<Tip>
  **ドメインの選択**: `api.apiyi.com` が主要なエンドポイントです。`vip.apiyi.com` と他のゲートウェイドメインも利用でき、動作は同一です。**`ark.ap-southeast.bytepluses.com` / `ark.eu-west.bytepluses.com` のような BytePlus のネイティブドメインを使う必要はありません** — APIYI がすべてを OpenAI 互換のパスに正規化します。
</Tip>

## 詳細な主要パラメータ

### `size`（出力サイズ）

2つの値の系統があります — どちらか1つを選んでください:

**プリセットティア**（モデルがアスペクト比を決定します）:

| ティア  | おおよそのピクセル数         | 対応            |
| ---- | ------------------ | ------------- |
| `1K` | \~1024×1024        | 4.0 / 5.0-pro |
| `2K` | \~2048×2048（デフォルト） | 全バージョン        |
| `3K` | \~3072×3072        | 5.0のみ         |
| `4K` | \~4096×4096        | 4.5 / 4.0     |

**正確なピクセル数**（カスタム）:

* 総ピクセル数 ∈ \[1280×720, 4096×4096]
* アスペクト比 ∈ \[1/16, 16]
* デフォルト: `2048x2048`

**有効な例**: `1920x1080`（FullHD）、`3840x2160`（横向き4K）、`1080x1920`（スマホ縦向き）、`2560x1440`（横向き2K）
**無効な例**: `5000x5000`（上限超過）、`100x1600`（アスペクト比が1/16未満）

<Warning>
  総ピクセル数が4096×4096を超えるサイズは400を返します。極端なアスペクト比（1/16または16に近いもの）は不自然に引き伸ばされる場合があるため、プリセットまたは一般的な16:9 / 9:16 / 1:1を推奨します。

  **5.0系モデルは4.xとは異なる正確なピクセル範囲を使用します**（下限が高く、上限が低いです）。範囲外のサイズは、エラーメッセージに有効範囲を含めて400を返します。実測の参考値: 5.0-lite の下限はおおむね2560×1440です。**5.0-pro は総ピクセル数の上限が4.19M（最大2048×2048; 16:9では長辺が2720×1530 ≈ 2.7Kに達し、動作確認済み）で、3K/4Kのプリセットはありません**。
</Warning>

### `image` と `sequential_image_generation`（モード切り替え）

`/v1/images/generations` エンドポイントは、テキストから画像生成と編集/融合の両方をカバーします。2つのパラメータを組み合わせてモードを選択します:

| モード           | `image`                 | `sequential_image_generation`                               | 備考                                                  |
| ------------- | ----------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| 純粋なテキストから画像生成 | 省略                      | 省略または `"disabled"`                                          | 1つの出力                                               |
| 単一画像編集        | `["url1"]`              | `"disabled"`                                                | 1つの参照画像を元に編集                                        |
| 複数画像融合        | `["url1", "url2", ...]` | `"disabled"`                                                | 参照は最大10件。呼び分けは「image 1 / image 2」                   |
| バッチシーケンス      | 任意                      | `"auto"` + `sequential_image_generation_options.max_images` | 一貫性のあるN個の出力、**N ≤ max\_images** かつ **入力 + 出力 ≤ 15** |

<Warning>
  **`seedream-5-0-pro` は `sequential_image_generation` パラメータを受け付けません** — いかなる値（`"disabled"` を含む）を渡しても400が返ります。Proモデルで編集 / 融合を行う場合は、`image` のみを指定し、パラメータ自体は完全に省略してください。`stream` にも同じことが当てはまります。
</Warning>

完全なコード例は、[テキストから画像生成](/ja/api-capabilities/seedream-image/text-to-image) と [画像編集](/ja/api-capabilities/seedream-image/image-edit) をご覧ください。

## ベストプラクティス

<Steps>
  <Step title="適切なバージョンを選ぶ">
    * **総合的に最も優れた体験** → `seedream-5-0-260128` (最も多機能ですが、3K上限)
    * **4K + 強力なテキスト描画** → `seedream-4-5-251128` (4K + テキストのブレイクスルー)
    * **4K + 最安価格** → `seedream-4-0-250828` (4Kで最も安価)
    * **最高画質 / 複雑な指示（業務用途）** → `seedream-5-0-pro-260628` (\$0.12/request、画像1枚あたり約2分、1K/2Kのみ — 日常利用にはおすすめしません)
  </Step>

  <Step title="プリセットサイズを優先する">
    `1K`/`2K`/`3K`/`4K` は、安定した速度と品質が得られるよう BytePlus によって調整されています。実際のアスペクト比要件がある場合にのみ、正確なピクセル値を使用してください。対応ティアはバージョンごとに異なる点に注意してください。
  </Step>

  <Step title="画像を明示的に参照する">
    複数の `image` URL がある場合は、モデルに推測させるのではなく、明示的な参照を含めて prompt を書いてください — 「画像1の人物を画像2のシーンに、画像3のカラーパレットを使って配置する」。
  </Step>

  <Step title="バッチシーケンスのコストを管理する">
    `sequential_image_generation: "auto"` + `max_images: 4` は出力が4件になります — 課金は × 4 です。まず `max_images: 1` で検証してから、規模を拡大してください。
  </Step>

  <Step title="用途に応じて出力形式を選ぶ">
    5.0 / 5.0-pro は `png` と `jpeg` に対応し、4.5 / 4.0 は `jpeg` のみです。透過背景やロスレスなディテールが必要な場合は 5.0 シリーズ + png を使い、サイズ重視のシナリオでは jpeg を使ってください。
  </Step>

  <Step title="クライアントのタイムアウトを 60 秒以上に設定する">
    単一画像は約15秒ですが、バッチシーケンス（4画像）または 4K + hd では30〜60秒かかる場合があります。**まずはクライアントのタイムアウトを60秒に設定**し、UI で進捗フィードバックを表示してください。**`seedream-5-0-pro` は画像1枚あたり約2分かかるため、タイムアウトは240秒以上にしてください**。
  </Step>

  <Step title="必要な場合はウォーターマークを無効化する">
    BytePlus のウォーターマークを削除するには、`watermark: false` を設定します（既定値はバージョンによって異なるため、明示的に設定してください）。商用アセットでは必須です。
  </Step>
</Steps>

## エラーコードと再試行

| ステータス   | 意味                                             | 推奨対応                                                            |
| ------- | ---------------------------------------------- | --------------------------------------------------------------- |
| `400`   | 無効なパラメータ（サイズが範囲外、`image` array > 10、未対応の tier） | 使用中のバージョンでサポートされている tier を確認してください                              |
| `401`   | 無効な token                                      | Bearer Token を確認してください                                          |
| `403`   | コンテンツモデレーションによりブロックされました                       | prompt を調整するか、参照画像を差し替えてください                                    |
| `429`   | rate limit（デフォルト 500 RPM）または残高不足               | 指数バックオフを適用してください。より高い RPM が必要な場合は営業にお問い合わせください                  |
| `5xx`   | ゲートウェイ / upstream エラー                          | 1〜2回再試行してください                                                   |
| Timeout | 長い応答時間のリクエスト                                   | クライアントタイムアウトは ≥ **60s**（バッチシーケンスまたは 4K + hd では 60s に達する場合があります） |

<Info>
  **クライアント向けの推奨事項**:

  * **60秒**のリクエストタイムアウトから始めてください（バッチシーケンスまたは 4K + hd では 1分かかる場合があります）
  * 5xx とタイムアウトには **指数バックオフ** を適用してください（推奨再試行回数は 2回です）
  * サポートチケット用に `x-request-id` レスポンスヘッダーを記録してください
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="5.0 Pro / 5.0 / 4.5 / 4.0 — どれを選ぶべきですか？">
    | 用途                      | 推奨                                                                   |
    | ----------------------- | -------------------------------------------------------------------- |
    | 最新機能 + 総合的に最良           | `seedream-5-0-260128`                                                |
    | 4K + 強力なテキスト描画（ポスター、広告） | `seedream-4-5-251128`                                                |
    | 4K + 最もお得               | `seedream-4-0-250828`                                                |
    | 長時間安定したバッチ制作            | `seedream-4-0-250828`（実績あり、最安、prompt モードが高速）                         |
    | 最高の画像品質 / 複雑な指示（プロ向け作業） | `seedream-5-0-pro-260628`（\$0.12/リクエスト、画像1枚あたり約2分 — 必要な場合のみ利用してください） |

    [履歴バージョン](/ja/api-capabilities/seedream-image/historical-versions)で完全な比較をご覧ください。
  </Accordion>

  <Accordion title="画像編集でも generations エンドポイントを使うのはなぜですか？">
    Seedream は統合された生成・編集アーキテクチャを採用しており、**専用の `/v1/images/edits` エンドポイントはありません**。OpenAI の gpt-image-2（`/v1/images/edits` への multipart アップロード）とは異なり、Seedream は `application/json` を使い、画像の **URL を配列** として `image` フィールドに渡します。

    利点は、プロトコルの一貫性、パラメーターの再利用、モード切り替えの容易さです。詳しくは[画像編集](/ja/api-capabilities/seedream-image/image-edit)をご覧ください。
  </Accordion>

  <Accordion title="image フィールドは base64 を受け付けますか？">
    **はい**（テストで確認済み）です。data URI を使います: `data:image/<format>;base64,<base64 string>` で、`<format>` は小文字にします（例: `data:image/jpeg;base64,...`）。URL と base64 のエントリは同じ配列に混在できます。ローカルの大きな画像では、画像ホストにアップロードして URL を渡すほうが、リクエストボディを小さく保てるため依然として推奨です。
  </Accordion>

  <Accordion title="マルチ画像融合の上限は？ バッチシーケンスの上限は？">
    * **マルチ画像融合**（`image` 配列）：4.5 / 5.0-pro は明示的に最大10まで対応しています。5.0 / 4.0 もマルチ画像に対応していますが、明示的な上限は文書化されていません。
    * **バッチシーケンス**（`max_images`）：グローバルルール **input references + output ≤ 15** によって制限されます。融合とシーケンスを組み合わせる場合は、合計で数えます。**5.0-pro はバッチシーケンスをサポートしていません**（`sequential_image_generation` を渡すと 400 が返ります）。
  </Accordion>

  <Accordion title="b64_json に data:image プレフィックスは必要ですか？">
    `response_format` によります:

    * `response_format: "url"`（デフォルト）→ `data[0].url` は一時的な署名付き URL です。`<img src=...>` でそのままレンダリングできます
    * `response_format: "b64_json"` → `data[0].b64_json` は**プレーンな base64 文字列**です（`data:image/...;base64,` プレフィックスなし）。デコードしてディスクに書き込むか、ブラウザでレンダリングする場合はプレフィックスを手動で付けてください。
  </Accordion>

  <Accordion title="ストリーミング出力はサポートされていますか？">
    5.0 / 4.5 / 4.0 では `stream: true` 経由でサポートされています。ストリーミングは長い prompt と高解像度画像で特に有用で、フロントエンドは部分結果を段階的にレンダリングできます。**`seedream-5-0-pro` はストリーミングをサポートしていません** — `stream` を渡すと 400 が返ります。
  </Accordion>

  <Accordion title="レート制限は？">
    **デフォルトは1分あたり500 images**（Max Images per Minute）です。バージョン間で共通です。より高いクォータについては営業にお問い合わせください。
  </Accordion>

  <Accordion title="失敗したリクエストは課金されますか？">
    **いいえ**。BytePlus には組み込みのモデレーションがあります。モデレーション拒否とパラメーターエラーは `400` / `403` を返し、**課金されません**。そのほかの非課金エラーは `401`（無効な token）、`429`（レート制限）です。**正常に生成された場合（有効なレスポンスを伴う `200`）のみ課金されます**。
  </Accordion>

  <Accordion title="公式 OpenAI SDK は使えますか？">
    はい、コード変更なしで使えます。`base_url` を `https://api.apiyi.com/v1` に向け、拡張パラメーター（`image` / `sequential_image_generation` / `watermark` など）は `extra_body` 経由で渡します:

    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(api_key="sk-your-key", base_url="https://api.apiyi.com/v1")
    resp = client.images.generate(
        model="seedream-5-0-260128",
        prompt="...",
        size="2K",
        extra_body={
            "image": ["https://.../ref.png"],
            "sequential_image_generation": "disabled",
            "watermark": False,
        }
    )
    ```
  </Accordion>

  <Accordion title="生成された画像の権利は誰にありますか？">
    生成された画像は商用・非商用の両方で使用できます。詳細は BytePlus の利用規約をご覧ください。
  </Accordion>

  <Accordion title="透明背景はサポートされていますか？">
    `seedream-5-0` / `seedream-5-0-pro` は `png` 出力をサポートしており、プロンプトで「transparent background, alpha channel」と指定すると透明背景を生成できます。`seedream-4-5` / `4-0` は `jpeg` のみを出力し、**透明には対応していません** — 背景除去は後処理でご自身で行ってください。
  </Accordion>

  <Accordion title="進行中の生成をキャンセルできますか？">
    **いいえ**。`/v1/images/generations` は同期です。送信後、リクエストは完了まで実行されます。クライアントが切断されても、サーバーは処理を完了し、課金も行われます。クライアントのタイムアウトを設定し、切断すればコストを節約できると考えないでください。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [Text-to-Image Playground](/ja/api-capabilities/seedream-image/text-to-image) — `POST /v1/images/generations`、5言語のコードサンプル付き
* [Image Editing Playground](/ja/api-capabilities/seedream-image/image-edit) — `image` + `sequential_image_generation` パターン
* [Historical Versions](/ja/api-capabilities/seedream-image/historical-versions) — 5.0 / 4.5 / 4.0 の比較と移行
* [API Manual](/ja/api-manual) — 一般的な呼び出しガイド
* [Image Generation Sandbox](https://imagen.apiyi.com/) — オンラインで試す
* BytePlus 公式ドキュメント: `docs.byteplus.com/en/docs/ModelArk/1824121` — Seedream 4.0-5.0 チュートリアル

<Info>
  Seedream は、APIYI と BytePlus ModelArk の戦略的パートナーシップを通じて提供されています。3つのバージョンは、1つの統合、課金、認証パスを共有しています — 必要に応じて選択してください。ご質問やフィードバックがある場合は、コンソールからチケットを起票してください。
</Info>
