> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Imagine 2 画像生成・編集

> APIYI 上の Grok Imagine 2、xAI の最新世代画像モデル（grok-imagine-image / grok-imagine-image-quality）の完全ガイド — 5つのアスペクト比、1K/2Kのティア、1回の呼び出しで最大10枚、真の参照画像編集、解像度にかかわらず画像1枚あたり一律 $0.02 / $0.045 — 2K時の定価の約64%です。

## 概要

**Grok Imagine 2** は xAI の**最新の第2世代**画像モデルであり、パラメータ制御と編集の両面で初回リリースから大きく進化しています。アスペクト比と解像度が実際に反映され、2Kティアが利用でき、1回の呼び出しで最大10枚の画像を返し、参照編集では元画像が忠実に保持されます。

APIYI では 2 つのバリアント、`grok-imagine-image`（標準）と `grok-imagine-image-quality`（高品質）を提供しています。両者は同じエンドポイントとパラメータを共有しており、違いは出力品質と価格だけです。

<Note>
  **特徴**: 解像度を**無視する**1リクエストあたりの定額料金（xAI は 2K の品質ティアを \$0.07 としていますが、当社ではどちらでも \$0.045 で、約\*\*定価の64%\*\*です）、実際に反映される 5 種類のアスペクト比 × 2 種類の解像度ティア、1回の呼び出しで最大10枚の画像、そして画風・構図・配色・被写体の同一性を保持する高忠実度の参照編集。1K画像は約9秒かかります。
</Note>

<Info>
  **モデルIDには `2` が含まれていません。** 製品名は Grok Imagine 2 ですが、呼び出すモデル名は **`grok-imagine-image`** と **`grok-imagine-image-quality`** です。存在しないモデルなので **`grok-imagine-2-image`** と書かないでください。503 が返ります。
</Info>

<Warning>
  **📌 まずこちらをお読みください**: **参照画像は編集エンドポイント `/v1/images/edits` でのみ機能し、テキストから画像生成では使えません。**

  `image` / `image_url` / `images` を `/v1/images/generations` に渡すと、**200 としてごく普通の画像**が返りますが、参照画像は**何の通知もなく破棄され**、そのまま課金されます — いかなるエラーも発生しません。下の [Endpoints](#endpoints) をご覧ください。
</Warning>

<Info>
  すべての画像APIは**同期型**です。非同期タスクIDはないため、クライアントが切断されると結果は失われますが、リクエストは依然として課金されます。十分に余裕のあるタイムアウトを設定してください — [Image API Best Practices](/ja/api-capabilities/image-api-best-practices) をご覧ください。
</Info>

<CardGroup cols={2}>
  <Card title="テキストから画像生成API" icon="wand-sparkles" href="/ja/api-capabilities/grok-imagine-image/text-to-image">
    テキストの prompt から画像を生成します。ライブテスト用のインタラクティブな Playground 付きです。
  </Card>

  <Card title="画像編集API" icon="image" href="/ja/api-capabilities/grok-imagine-image/image-edit">
    参照画像と指示をアップロードし、1〜4枚の画像融合と Playground を利用できます。
  </Card>
</CardGroup>

## AI エージェントに統合を任せる

<Note>
  Codex / Claude Code / Cursor で構築する場合は、以下のプロンプトをコピーしてエージェントに渡してください。まずこのページのプレーンテキスト版を取得し（任意の docs URL の末尾に `.md` を付ける）、その後はあなたのプロジェクト独自のスタックでコードを書きます — タイムアウト、URL 結果の即時再ホスト、**参照画像を黙って破棄しながら課金だけはするエンドポイント**、そして `size` が何もしないという事実は、すでに要件に織り込み済みです。
</Note>

<Prompt description="Grok Imagine 2 のテキストから画像生成と画像編集を、コーディングエージェントに実装またはトラブルシュートさせてください。Codex、Claude Code、Cursor などのツールにコピーして貼り付けてください。" icon="bot" actions={["copy"]}>
  このプロジェクトで Grok Imagine 2 のテキストから画像生成と画像編集を実装またはトラブルシュートしてください。

  コードを触る前にドキュメントを読んでください: このページのプレーンテキスト版として [https://docs.apiyi.com/en/api-capabilities/grok-imagine-image/overview.md](https://docs.apiyi.com/en/api-capabilities/grok-imagine-image/overview.md) を取得してください。より細かなパラメータの詳細については、同じ方法で text-to-image と image-edit のページの末尾に `.md` を付けてください。

  要件:

  1. モデル名: 標準ティアは `grok-imagine-image`、高精細ティアは `grok-imagine-image-quality` です。**モデル ID には数字の 2 が含まれない**ことに注意してください — `grok-imagine-2-image` と書くと、そんなモデルは存在しないため 503 が返ります。

  2. タイムアウト: クライアントのタイムアウトを 360 秒に引き上げてください。計測されたレイテンシは 1K で約 9 秒、2K で約 15 秒ですが、60 秒のタイムアウトでは誤った失敗が大量に発生し、それらのリクエストも課金されます。画像 API は同期処理です — task ID はなく、クライアントが切断されると結果は失われます。リバースプロキシ、ゲートウェイ、serverless の実行制限もすべて引き上げが必要です。

  3. エンドポイントの選び方（**このモデルで最も間違えやすい点**）: text-to-image は `/v1/images/generations` に JSON で送信し、**参照画像を含むリクエストはすべて `/v1/images/edits` に `multipart/form-data` として送信する必要があります**。どちらの方向にも落とし穴があります。参照画像を `/v1/images/generations` に渡すと 200 を返し、参照を黙って破棄して無関係なテキストのみの画像を生成し、それでも課金されます。逆に、`/v1/images/edits` に JSON を送ると常に 400 を返します。ファイルフィールド名は `image` または `image[]` でなければなりません。`images` または `image_file` だと 415 を返します。edit エンドポイントは 1 〜 4 枚の参照画像を受け付け、5 枚送ると 400 になります。

  4. レスポンスの扱い: デフォルトは `url` で、代わりに `response_format` を `b64_json` に設定してプレーンな base64 を返すこともできます（`data:` プレフィックスなし）。`data[]` の各エントリはどちらか一方しか持ちません。URL を使う場合は、ダウンロードしてすぐに自分のオブジェクトストレージに再ホストしてください。このモデルは **`revised_prompt` を返さない**こと、`created` は常に 0 であること、そして `usage` はプレースホルダーであること（`prompt_tokens` は常に n の 1000 倍です）にも注意してください — **コスト計算には使わないでください**。代わりにコンソールの課金記録に頼ってください。

  5. サイズパラメータ: `aspect_ratio`（`1:1` / `16:9` / `9:16` / `4:3` / `3:4`、デフォルト `1:1`）を `resolution`（`1k` / `2k`、**小文字**、デフォルト `1k`）と組み合わせて使います。**`size` は送らないでください** — 黙って無視されるため、1536 x 1024 を指定したつもりでも実際には 1024 x 1024 の正方形が返ってきます。`quality` と `style` も同じように黙って無視されます。より高い精度が必要な場合は、パラメータを送るのではなく `-quality` のモデル名に切り替えてください。`aspect_ratio` または `resolution` の列挙外の値は黙ってデフォルトにフォールバックし、`resolution` を `4k` に設定すると特に 503 を返します — これは障害ではなくパラメータエラーです。もう 1 つ: **edit エンドポイントでは `resolution` も `aspect_ratio` も効果がありません**。出力フレームは常に 1 枚目の参照画像の寸法に従います。

  6. アップロード前に圧縮する: 各参照画像を先に圧縮してください — 1.5MB を超えるファイルだけを処理し、アスペクト比を保ったまま長辺を 2048px に縮小し（小さい画像は決して拡大しない）、品質 0.9 で再エンコードし、元の形式を維持します。複数画像リクエストでは合計サイズを 6MB 未満に保ってください。1 枚の画像の圧縮に失敗した場合は元の画像にフォールバックして続行し、圧縮失敗のせいでリクエスト全体を中断しないでください。

  7. エラーハンドリング: `400 invalid_request` は不正なパラメータとモデレーションによるブロックの両方を含み、レスポンスボディでは区別されないため、両方の観点から調査してください。`n` は 1 〜 10 の範囲です。0 は 1 として扱われ、11 以上は 400 を返します。`seed` は受け付けられますが効果がないため、結果は再現できません。このモデルは `mask` をサポートしていません。

  8. キーは `APIYI_API_KEY` 環境変数から読み取り、ベース URL として [https://api.apiyi.com/v1](https://api.apiyi.com/v1) を使ってください。ハードコードせず、git にコミットしないでください。

  9. 終わったら、実際に text-to-image の呼び出しを 1 回と image-edit の呼び出しを 1 回実行し、その結果と 2 回分の費用を見せてください。
</Prompt>

<Accordion title="このプロンプトが防ぐもの">
  | 要件                      | 防ぐ落とし穴                                                                                                                                                       |
  | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | 参照画像は edit エンドポイントのみに送る | `/v1/images/generations` に送ると 200 を返し、参照を黙って破棄したうえで課金もされます — エラーが一切出ないため、ここで最も高くつく落とし穴です                                                                     |
  | `size` は絶対に送らない         | 黙って無視されるため、サイズを設定したつもりでも 1024 x 1024 の正方形が返ってきます                                                                                                             |
  | 数字の 2 を含まないモデル ID       | `grok-imagine-2-image` は 503 を返し、障害のように見えますが、単に名前が間違っているだけです                                                                                                 |
  | 高精細版はパラメータではなくモデル       | このモデルには `quality` パラメータはなく、送っても黙って無視されます                                                                                                                     |
  | `usage` からコストを照合しない     | `prompt_tokens` が n の 1000 倍で固定されたプレースホルダーです。コンソールの課金記録を使ってください                                                                                              |
  | タイムアウトは 360 秒のままにする     | 約 15 秒のレイテンシだと、つい短いタイムアウトにしたくなりますが、それだとピーク時に発火します — しかも切断されたリクエストでも課金されます。[Image API の基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices) を参照してください |
</Accordion>

## Grok Imagine 2 を APIYI で使う理由

<CardGroup cols={2}>
  <Card title="OpenAI互換フォーマット" icon="shield-check">
    標準の `/v1/images/generations` および `/v1/images/edits` エンドポイント。リクエストボディとレスポンスフィールドは OpenAI Images API と一致するため、公式の OpenAI SDK をそのまま利用でき、移行の手間はゼロです。
  </Card>

  <Card title="同時実行数の上限なし" icon="infinity">
    RPM/RPD の厳しい上限はありません。**100 RPM でも余裕をもって計測済み**で、チャネル容量も十分なため、バッチワークロードは線形にスケールします。クォータの申請や、自己設定のスロットリングは不要です。
  </Card>

  <Card title="一律料金で、コストが予測しやすい" icon="percent">
    画像ごとの固定価格で、**解像度に依存しません**: xAI では品質ティアが 1K で \$0.05、2K で \$0.07 ですが、当社は一律 \$0.045 です。**2K では定価の約 64%** になります。必要な画像枚数に合わせて予算を組め、[チャージ特典](/ja/faq/recharge-promotions) を重ねてさらに下げられます。
  </Card>

  <Card title="グローバルにアクセス可能、障壁なし" icon="globe">
    **海外サーバーやプロキシは不要です。** 中国本土のデータセンター、家庭用ブロードバンド、海外ノードからもすべて `api.apiyi.com` に直接接続できます。
  </Card>

  <Card title="完全なモデルエコシステム" icon="layers">
    ほかにも利用可能です: [Nano Banana 2](/ja/api-capabilities/nano-banana-2-image/overview), [GPT-Image-2](/ja/api-capabilities/gpt-image-2/overview), [Seedream](/ja/api-capabilities/seedream-image/overview), [FLUX](/ja/api-capabilities/flux/overview), さらに [Grok のテキストモデル](/ja/api-capabilities/grok/overview)。
  </Card>

  <Card title="プロフェッショナルサポート" icon="handshake">
    当チームは画像生成ワークロードに深く精通しており、エンタープライズのお客様を PoC から本番展開まで支援できます。
  </Card>
</CardGroup>

## 主な機能

<CardGroup cols={2}>
  <Card title="2つの解像度階層" icon="expand">
    `1k`は約1メガピクセル、`2k`は4.2〜4.5メガピクセル（16:9で2816x1584）— **価格は同じなので、2Kのほうがお得です**
  </Card>

  <Card title="5つのアスペクト比" icon="maximize">
    `1:1` / `16:9` / `9:16` / `4:3` / `3:4`、測定されたピクセル寸法が完全に一致します
  </Card>

  <Card title="1回の呼び出しで最大10件" icon="images">
    `n`は1〜10を受け付け、1回のリクエストで複数の画像を返します — 一括選択に最適です
  </Card>

  <Card title="高速生成" icon="zap">
    1Kでは約9秒、2Kでは15〜17秒で、負荷下でもレイテンシーは安定しています — 100 RPMでも余裕で動作します
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="真のリファレンス編集" icon="wand">
    変更されるのは指定した部分だけです — 画風、構図、配色、被写体の同一性はそのまま維持されます
  </Card>

  <Card title="複数画像の融合" icon="layers-2">
    編集エンドポイントは1〜4件の参照を受け付けます — テストでは各参照が被写体を1つ追加し、最初の参照で出力寸法が決まります
  </Card>

  <Card title="2つのレスポンス形式" icon="braces">
    `url`の直接リンクまたは`b64_json`の生 base64 に対応しており、どちらのエンドポイントでも利用できます
  </Card>

  <Card title="OpenAI SDK 対応" icon="plug">
    `client.images.generate()`と`client.images.edit()`はそのまま動作します — 手動で HTTP を組み立てる必要はありません
  </Card>
</CardGroup>

## 価格

| モデル                              | 解像度         | APIYI 価格            | xAI 定価 | 割引          |
| -------------------------------- | ----------- | ------------------- | ------ | ----------- |
| **`grok-imagine-image`**         | `1k` / `2k` | **\$0.02 / image**  | \$0.02 | 定価と同じ       |
| **`grok-imagine-image-quality`** | `1k`        | **\$0.045 / image** | \$0.05 | **定価の90%**  |
| **`grok-imagine-image-quality`** | `2k`        | **\$0.045 / image** | \$0.07 | **定価の約64%** |

<Info>
  **課金に関する注意事項**

  * **こちらでは解像度を無視しますが、xAI は無視しません。** xAI では品質ティアを 1K で \$0.05、2K で \$0.07 としていますが、APIYI は一律 **\$0.045** です — そのため、**解像度が高いほど節約額が大きくなり**、2K では定価の約 **64%** になります。
  * **1 image あたり**: `n=4` は、prompt の長さにかかわらず 4枚分として課金されます。
  * **編集料金は text-to-image と同じです** — `/v1/images/edits` に追加料金はありません。
  * **`usage` ブロックは照合には使用できません**: `prompt_tokens` は常に `1000 x n` であり、プレースホルダーです。代わりにコンソールの課金記録を使用してください。
</Info>

### チャージボーナスを適用した実効コスト

これらの割引は **[段階的チャージボーナス](/ja/faq/recharge-promotions) と併用できます**（累計ではなく、各チャージごとに計算されます）。品質ティアを 2K とすると：

| チャージ階層                | クレジット倍率 | 画像 1 枚あたりの実質価格 | xAI の \$0.07 と比べて |
| --------------------- | ------- | -------------- | ----------------- |
| プロモーションなし（定価）         | 1.0x    | \$0.045        | **定価の64%**        |
| \$100 の単回チャージ（+10%）   | 1.1x    | ≈ \$0.041      | **定価の約58%**       |
| \$1,000 の単回チャージ（+15%） | 1.15x   | ≈ \$0.039      | **定価の約56%**       |
| \$3,000 の単回チャージ（+20%） | 1.2x    | **\$0.0375**   | **定価の約54%**       |

<Tip>
  **一般的なケース（\$100 の階層）では、2K 画像は xAI の定価の約 58% となり、最大ボーナスでは約 54% まで下がります。** 標準の `grok-imagine-image` も同様に適用されます — 定価の \$0.02 は、20% ボーナス時に 1 image あたり約 \$0.0167 になります。
</Tip>

## グループ設定

Grok Imagine 2 は **`Default` グループ (1.0x レート)** で動作し、上記の料金表と一致しています。**グループの切り替えは不要です。**

**推奨 Token 課金モデル**: `Pay-as-you-go Priority`。このファミリーはリクエストごとに課金され、Pay-as-you-go Priority と Pay-per-request のどちらも正しくルーティングされます — Pay-as-you-go Priority を選ぶと、1つの Token でプラットフォーム内の他の token 課金モデルもカバーできます。

<Tip>
  すでに Token が他の画像モデルをカバーしている場合は、`Default` をプライマリ グループとしてそのまま維持してください。このファミリーには専用のグループや追加設定は不要です。
</Tip>

## 技術仕様

| 項目                   | 仕様                                                        |
| -------------------- | --------------------------------------------------------- |
| モデルID                | `grok-imagine-image`, `grok-imagine-image-quality`        |
| アスペクト比               | 5: `1:1` / `16:9` / `9:16` / `4:3` / `3:4`                |
| 解像度レベル               | `1k` (\~0.9-1.05 MP), `2k` (\~4.2-4.5 MP)                 |
| 出力形式                 | **1K の JPEG (\~220-300 KB)、2K の PNG (\~5-6 MB)**          |
| 1回の呼び出しあたりの画像数       | `n` 1-10                                                  |
| 参照画像                 | 編集エンドポイントでは **1-4** 枚（`image[]` を繰り返し使用可能；5枚目は 400 を返します） |
| マスクインペインティング         | ❌ 未対応                                                     |
| 再現可能な `seed`         | ❌ 未対応                                                     |
| `revised_prompt` エコー | ❌ 返却されません                                                 |
| レイテンシー               | 1K で約 9 秒、2K で約 15-17 秒                                   |
| 同時実行数 / レート          | 上限なし；**100 RPM でも余裕で計測済み**                                |
| 推奨クライアントタイムアウト       | 360 秒以上                                                   |

## エンドポイント

| 機能         | メソッド   | パス                       | コンテンツタイプ                  |
| ---------- | ------ | ------------------------ | ------------------------- |
| テキストから画像生成 | `POST` | `/v1/images/generations` | `application/json`        |
| 画像編集       | `POST` | `/v1/images/edits`       | **`multipart/form-data`** |
| チャット形式生成   | `POST` | `/v1/chat/completions`   | `application/json`        |

<Warning>
  **✅ 編集用エンドポイントには `multipart/form-data` ファイルアップロードが必要です**

  `/v1/images/edits` に JSON を送信すると、**必ず 400 が返ります**:

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **特に上流ベンダーのドキュメントから統合している場合は重要です** — そのドキュメントでは、公開画像 URL を含む JSON ボディが説明されていますが、APIYI ゲートウェイ経由では**動作しません**。**代わりにこのページに従ってください**: `-F "image=@photo.jpg"` でファイルをアップロードします。完全な例は [画像編集 API](/ja/api-capabilities/grok-imagine-image/image-edit) をご覧ください。

  ファイルフィールド名は `image` または `image[]` である必要があります。`images` / `image_file` は 415 を返します。
</Warning>

<Warning>
  **⚠️ 参照画像をテキストから画像生成エンドポイントに送信しないでください**

  `/v1/images/generations` が `image` / `image_url` / `images` を受け取っても、**エラーは発生しません**。200 を返し、参照画像を完全に無視して、プロンプトだけから新しい画像を生成します — **しかも通常どおり課金されます**。

  エラー信号がないため、通常は出力が入力とまったく関係ないことに誰かが気づいて初めて表面化します。**参照画像を使うワークフローでは必ず `/v1/images/edits` を使用してください。**
</Warning>

<Tip>
  主要ドメインは `https://api.apiyi.com`、バックアップは `https://vip.apiyi.com` です。チャット形式生成（`/v1/chat/completions`）は動作しますが、**推奨される方法ではありません** — 下のよくある質問をご覧ください。
</Tip>

## GPT-Image-2 からの移行

すでに [GPT-Image-2](/ja/api-capabilities/gpt-image-2/overview) を統合している場合、**エンドポイントと呼び出し規約は同一です**（`/v1/images/generations` + `/v1/images/edits`、OpenAI SDK 互換）— ただし、**パラメータ体系が異なる**ため、モデル名を差し替えるだけでは動きません。変更が必要な点は次のとおりです。

### パラメータ対応表

| 項目             | GPT-Image-2                                           | **Grok Imagine 2**                 | 移行時の対応                                  |
| -------------- | ----------------------------------------------------- | ---------------------------------- | --------------------------------------- |
| 出力サイズ          | `size`（`1536x1024` のような明示的なピクセル値）                     | `aspect_ratio` + `resolution`      | **必ず書き換える必要があります**; `size` でもエラーにはなりません |
| 品質ティア          | `quality`（`low`/`medium`/`high`/`auto`）               | そのようなパラメータはありません — **モデル名を使います**   | `quality` を削除し、`-quality` バリアントに切り替えます  |
| 出力形式           | `output_format`（png/jpeg/webp） + `output_compression` | そのようなパラメータはありません — **形式は解像度に従います** | 両方とも削除します。1K は常に JPEG、2K は常に PNG です     |
| 背景             | `background`（`opaque`/`auto`）                         | そのようなパラメータはありません                   | 削除してください                                |
| モデレーションレベル     | `moderation`（`auto`/`low`）                            | そのようなパラメータはありません                   | 削除してください                                |
| 高忠実度           | `input_fidelity` は送信してはいけません                          | そのようなパラメータはありません                   | 削除してください                                |
| 1回の呼び出しあたりの画像数 | `n` **は 1 のみ対応**                                      | `n` **は 1-10 に対応**                 | ✅ クライアント側のファンアウトループを削除できます              |
| 参照画像（編集）       | 最大 16 枚                                               | **最大 4 枚**                         | ⚠️ 4 枚を超える参照を送るフローは見直してください             |
| マスクインペインティング   | ✅ 対応                                                  | ❌ **非対応**                          | ⚠️ マスク依存のフローは移行できません                    |
| 課金             | token ごと（高品質時は約 \$0.21/画像）                            | **リクエストごとの固定料金**, \$0.02 / \$0.045 | 予算モデルは使用量ベースから画像単位へ変わります                |

### もっとも起こりやすい 3 つのミス

<Warning>
  **1. デフォルトのレスポンス形式は逆になっています — 最も見落とされやすい変更です**

  GPT-Image-2 は **`b64_json` のみを返します**（`url` はありません）が、Grok Imagine 2 は **デフォルトで `url` を返します**。パーサーが `resp.data[0].b64_json` を読むようになっている場合、移行後は `None` / `undefined` になります。

  2 つの対処法のどちらかを選んでください:

  * **既存コードをそのまま使う** → `"response_format": "b64_json"` を明示的に渡す
  * **直接リンクに切り替える** → `data[0].url` を読み取り、ダウンロードする

  また、GPT-Image-2 の `usage` には **実際の token 数** が入りますが、Grok Imagine 2 の `usage` は **プレースホルダー** です（常に `1000 x n`）。`usage` に基づいて作られた課金レポート用スクリプトは、移行後に誤った数値を出します。
</Warning>

<Warning>
  **2. `size` はエラーではなく静かに失敗します**

  GPT-Image-2 は厳格に検証し、入力が不正な場合は通常 400 を返します。**Grok Imagine 2 は寛容**で、`size`、`quality`、`style` のような OpenAI 形式のフィールドは **静かに無視され**、無効な `aspect_ratio` / `resolution` の値は **静かにデフォルトにフォールバック** します。

  そのため、`model` だけを変更して `size: "1536x1024"` の削除を忘れると、リクエストは **1024x1024 の正方形画像を返して 200 になります** — しかも、そのパラメータが無視されたことを知らせるものはありません。

  移行後は、**最初の呼び出しで出力のピクセル寸法を確認し**、`aspect_ratio` / `resolution` が実際に反映されたことを確かめてください。
</Warning>

<Warning>
  **3. 参照画像はもはや text-to-image エンドポイントに送れません**

  この落とし穴はこのモデル特有です。参照画像を `/v1/images/generations` に送ると、**200 を返し、参照は静かに破棄され、それでも課金されます**。参照画像を使う呼び出しはすべて `/v1/images/edits` と `multipart/form-data` を使用する必要があります — 上の [エンドポイント](#endpoints) を参照してください。
</Warning>

### 変更前と変更後

```python theme={null}
# Before: GPT-Image-2
resp = client.images.generate(
    model="gpt-image-2",
    prompt="Cyberpunk city on a rainy night",
    size="1536x1024",           # <- remove
    quality="high",             # <- remove
    output_format="jpeg"        # <- remove
)
img = base64.b64decode(resp.data[0].b64_json)

# After: Grok Imagine 2
resp = client.images.generate(
    model="grok-imagine-image",           # use grok-imagine-image-quality for higher fidelity
    prompt="Cyberpunk city on a rainy night",
    n=1,
    extra_body={
        "aspect_ratio": "16:9",           # <- replaces size
        "resolution": "1k",               # <- replaces the sizing role of quality
        "response_format": "b64_json"     # <- set explicitly to keep the parser unchanged
    }
)
img = base64.b64decode(resp.data[0].b64_json)
```

<Tip>
  **どちらを使うべきですか？** マスクインペインティング、ピクセル単位で正確なカスタムサイズ、または最大 16 件の参照にまたがる融合が必要なら、[GPT-Image-2](/ja/api-capabilities/gpt-image-2/overview) のままにしてください。**予測しやすい課金**（画像ごとの固定料金、2K の追加料金なし）、**1 回の呼び出しで複数画像**（`n`、最大 10 枚）、または**編集時の高いソース忠実度**を重視するなら、Grok Imagine 2 を選んでください。両者は共存します — 同じ Token で両方を呼び出せます。
</Tip>

## 主要パラメータ

### `aspect_ratio` と `resolution`（出力サイズ）

この2つを組み合わせて、実際の出力ピクセル数が決まります。測定値はリクエストと完全に一致します。

| `aspect_ratio` | `resolution: 1k` | `resolution: 2k` |
| -------------- | ---------------- | ---------------- |
| `1:1`          | 1024x1024        | 2048x2048        |
| `16:9`         | 1280x720         | 2816x1584        |
| `9:16`         | 720x1280         | 1584x2816        |
| `4:3`          | 1152x864         | 2368x1776        |
| `3:4`          | 864x1152         | 1776x2368        |

<Warning>
  **この2つのパラメータは text-to-image にのみ適用されます。** `/v1/images/edits` ではエラーなく受け付けられますが、**効果はありません**。編集後の出力は常に**最初の参照画像のサイズ**に一致します（1280x720 を入力すると 1280x720 を出力し、fusion set の順序を逆にすると、新しい先頭画像に従うように出力が切り替わります）。出力サイズを変更するには、アップロード前に参照画像を切り抜くかリサイズしてください。
</Warning>

<Info>
  **検証は緩く、 টাইポしてもエラーは発生しません。** `aspect_ratio` の enum 外の値（例：`5:7`、`21:9`）や `resolution` の enum 外の値（例：`1K`、`1024x1024`）は**黙ってデフォルトにフォールバック**し、そのまま画像を返します。無効な `response_format` も同様に `url` にフォールバックします。したがって、出力が期待どおりでない場合は、**まずパラメータ名の綴りを確認してください。**

  ただし例外があり、それが `resolution: "4k"` で、`503 model_service_unavailable` を返します。これは**ティアがサポートされていない**という意味であり、チャネルが停止しているわけではありません。`1k` / `2k` に戻してください。
</Info>

### `n`（1回あたりの画像数）

**1-10** を受け付けます。返される `data` 配列の長さは `n` と等しく、各画像は課金されます。`0` は黙って `1` として扱われ、`11` 以上は 400 を返します。

## ベストプラクティス

<Steps>
  <Step title="事前に決めてください: 生成か編集か？">
    参照画像なし → `/v1/images/generations`。参照画像が1枚でもある場合、1ピクセルの微調整でも → `/v1/images/edits`。間違ったエンドポイントを選んでもエラーは出ず、予期しない画像が返るだけです。
  </Step>

  <Step title="クライアントのタイムアウトを360秒に設定してください">
    画像APIは同期処理です。2K は15〜17秒かかり、ピーク時やコールドスタート時にはさらに長くなることがあります。60秒のタイムアウトでは、まだ課金対象のリクエストに対して不要な失敗が発生します。
  </Step>

  <Step title="構図は prompt ではなく aspect_ratio で制御してください">
    このパラメータは本当に効くため、`aspect_ratio: "16:9"` は prompt で「横長の構図」を頼むよりもはるかに信頼できます。
  </Step>

  <Step title="帯域幅で解像度ティアを選んでください">
    2K は1画像あたり5〜6 MB のロスレス PNG、1K は220〜300 KB の JPEG です。およそ20倍の差があります。モバイルや一括転送には1K を推奨します。両方のティアの料金は同じなので、選択基準は純粋に画質と帯域幅です。
  </Step>

  <Step title="編集時は「他はすべて変更しないでください」と伝えてください">
    「マフラーを赤に変えて、他はすべてまったく同じにしてください」のような指示は非常にうまく機能します——モデルはこの制約にかなり忠実に従い、画像の残りを保持します。
  </Step>

  <Step title="融合するときは画像を明示的に参照してください">
    「image 1 / image 2 / image 3」が意味するのは、`image[]` アップロード順です。モデルに推測させるよりも、「image 1 の主体を image 2 のシーンに入れてください」と書くほうがはるかに確実です。
  </Step>

  <Step title="再現性を seed に頼らないでください">
    この系統は`seed`をサポートしていないため、同じ prompt でも呼び出しごとに結果が異なります。再生成できると期待するのではなく、残したい画像を保存してください。
  </Step>

  <Step title="バッチ処理はそのまま並列実行してください">
    同時実行数の制限はありません — **100 RPM でも十分余裕があります**。チャネル容量も十分です。直列キューを組んだり、追加クォータを申請したりする必要はありません。
  </Step>
</Steps>

## エラーコードと再試行

| HTTP  | code                        | 意味                                          | 推奨対応                                               |
| ----- | --------------------------- | ------------------------------------------- | -------------------------------------------------- |
| `400` | `invalid_image_request`     | 編集エンドポイントが JSON を受け取り、マルチパートではなかった          | `multipart/form-data` アップロードに切り替えてください。再試行しないでください |
| `400` | `invalid_request`           | 無効なパラメータ **または** モデレーションにより prompt がブロックされた | どちらも同じコードです — まずパラメータを確認し、その後 prompt を修正してください     |
| `415` | —                           | 編集エンドポイントでサポートされていないファイルフィールド名              | フィールド名を `image` または `image[]` に変更してください            |
| `429` | —                           | レート制限超過または残高不足                              | 指数バックオフを行い、アカウントの残高を確認してください                       |
| `503` | `model_service_unavailable` | サポートされていないパラメータ階層（例: `resolution: 4k`）      | **障害ではありません** — `1k` / `2k` に戻し、再試行しないでください        |
| `503` | —                           | 現在のグループで利用可能なチャネルがありません                     | token のグループ設定を確認してください。上のグループ設定を参照してください           |

<Info>
  **クライアント向けガイダンス**: `400` と `415` は決定的です — 再試行しても無意味なので、代わりに通知してください。再試行する価値があるのは `429` とネットワーク層のタイムアウトのみで、指数バックオフを用い、試行回数は最大 3 回です。

  `400 invalid_request` は「無効なパラメータ」と「コンテンツがブロックされた」の両方をカバーし、**レスポンス本文では両者を区別できません**。実用的なヒューリスティックとしてはレイテンシが挙げられます。モデレーションによるブロックは約 5〜6 秒で返り、正常な生成（約 9 秒）より速いです。これは、ブロックが生成開始前に発生するためです。
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="なぜ、ベンダーのドキュメントでは JSON と書かれているのに /v1/images/edits に JSON を送ると 400 になるのですか?">
    それは、**APIYI ゲートウェイの編集エンドポイントが `multipart/form-data` のみを受け付ける**ためです。一方、上流のベンダーのドキュメントでは、公開画像 URL を含む JSON ボディが説明されています。両者は異なるため、このサイトのドキュメントに従ってください。

    正しい形式はファイルアップロードです:

    ```bash theme={null}
    curl -X POST "https://api.apiyi.com/v1/images/edits" \
      -H "Authorization: Bearer sk-your-api-key" \
      -F "model=grok-imagine-image" \
      -F "prompt=Change the scarf to red, keep everything else the same" \
      -F "image=@photo.jpg"
    ```

    利点は、**画像ホスティングが不要**なことです。ローカルファイルを直接アップロードできるため、公開 URL を用意するよりも簡単です。完全な例は [Image Editing API](/ja/api-capabilities/grok-imagine-image/image-edit) にあります。
  </Accordion>

  <Accordion title="参照画像を text-to-image に送ったのに 200 が返り、結果が関係ないのはなぜですか?">
    それは想定どおりの挙動で、このモデルで最も**よくある落とし穴**です: `/v1/images/generations` は `image` / `image_url` / `images` を**黙って無視**し、prompt だけから生成し、**通常どおり課金**します。

    エラーが返らないため、「編集が壊れている」と結論づけやすいです。**参照画像を使うワークフローでは必ず `/v1/images/edits` を使用してください。**
  </Accordion>

  <Accordion title="なぜ resolution / aspect_ratio は編集エンドポイントに効かないのですか?">
    編集後の出力サイズは**入力した参照画像に従います**: 1280x720 を入れれば 1280x720 が出力され、1024x1024 を入れれば 1024x1024 が出力されます。ここで `resolution` や `aspect_ratio` を渡してもエラーにはならず、何も起こりません。

    出力サイズを変えたい場合は、アップロード前に参照画像をトリミングまたはリサイズしてください。
  </Accordion>

  <Accordion title="レスポンスに revised_prompt がないのはなぜですか?">
    この系統では `revised_prompt` は返されず、`respect_moderation` や `model` のようなフィールドもありません。各 `data[]` エントリに含まれるのは、`response_format` に応じて **`url` か `b64_json` のどちらか一方** だけで、両方同時には返りません。

    レスポンスを解析する際に、これらのフィールドが存在すると仮定しないでください。
  </Accordion>

  <Accordion title="usage の token 数で billing を突き合わせできますか?">
    **いいえ。** `usage.prompt_tokens` は、実際の prompt 長にかかわらず常に `1000 x n` です。これはプレースホルダーです。

    この系統は画像ごとの一律料金で **リクエスト単位** に課金されます。実際の課金額は APIYI コンソールの課金記録を確認してください。
  </Accordion>

  <Accordion title="なぜ 1K は JPEG で、2K は PNG なのですか? サイズがかなり違います">
    それは上流の挙動です: `resolution: 1k` は JPEG（約 220〜300 KB）を返し、`resolution: 2k` はロスレス PNG（約 5〜6 MB）を返します。おおよそ 20 倍の差があります。

    URL の拡張子、HTTP `Content-Type`、実際のバイト列は互いに整合しているので、`Content-Type` で安全に分岐できます。

    帯域に敏感なシナリオ（モバイル、大量転送）では `1k` を優先してください。どちらのティアも料金は同じなので、判断基準は純粋に画質です。逆に画質を重視する場合は、`2k` に追加料金はなく、定価に対してより大きな割引になります。
  </Accordion>

  <Accordion title="resolution: 4k で 503 が返ります — チャネルが落ちていますか?">
    **いいえ。** `4k` はこの系統でサポートされているティアではなく、ゲートウェイは `503 model_service_unavailable` を返します。コードは障害のように見えますが、実際はパラメータの問題なので、**再試行しても解決しません** — `1k` か `2k` に戻してください。

    サポートされているのは `1k` と `2k` のみです。
  </Accordion>

  <Accordion title="なぜ無効なパラメータでエラーではなく間違った画像が返るのですか?">
    この系統のバリデーションは緩めです。無効な `aspect_ratio`（例: `5:7`）、`resolution`（例: `1K`、`1024x1024`）、および `response_format`（例: `base64`）はすべて**黙ってデフォルト値にフォールバック**し、400 ではなく画像を返します。

    そのため、出力が期待と違う場合は、**まずパラメータの綴りを確認してください** — 特に、`resolution` の値は小文字の `1k` / `2k` です。
  </Accordion>

  <Accordion title="1 回の呼び出しで何枚の画像を生成できますか?">
    `n` は **1-10** を受け付け、返される `data` 配列の長さは `n` に等しくなります。各画像は**課金対象**です。

    `0` は黙って `1` として扱われ、`11` 以上は `400 invalid_request` を返します。
  </Accordion>

  <Accordion title="seed ベースの再現性はサポートされていますか?">
    **いいえ。** `seed` を渡してもエラーにはなりませんが、効果はありません — 同じ prompt と同じ `seed` でも、呼び出しごとに異なる画像が返ります。

    再生成しようとするより、再利用したい画像は保存しておいてください。
  </Accordion>

  <Accordion title="公式の OpenAI SDK で呼び出せますか?">
    はい。どちらのエンドポイントも OpenAI Images API と互換です。`base_url` を `https://api.apiyi.com/v1` に向けるだけです:

    ```python theme={null}
    from openai import OpenAI
    client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

    resp = client.images.generate(
        model="grok-imagine-image",
        prompt="a red wooden boat on an alpine lake at dawn",
        extra_body={"aspect_ratio": "16:9", "resolution": "1k"}
    )
    ```

    `aspect_ratio` と `resolution` は標準の OpenAI SDK フィールドではないため、`extra_body` 経由で渡してください。
  </Accordion>

  <Accordion title="同時実行数の制限はありますか? バッチ生成はスロットリングされますか?">
    **同時実行数の制限はありません。** **100 RPM でも余裕をもって計測済み**で、429 もキュー拒否もなく、チャネル容量にも十分な余裕があります。直列キューを組んだり、追加クォータを申請したりせずに同時に呼び出してください。

    実際に重要なのは **`timeout`** です。画像 API は同期型なので、通常どおり処理中のリクエストを途中で切らないよう、クライアントのタイムアウトを **360 秒** に設定してください — それでも課金されます。
  </Accordion>

  <Accordion title="コンテンツモデレーションはどのように動作し、ブロックをどう検知しますか?">
    この系統にはコンテンツモデレーションが適用されます。ブロックされたリクエストは、**パラメータエラーとまったく同じエラーコードとメッセージ**で `400 invalid_request` を返すため、レスポンス本文だけでは区別できません。

    実用的なヒューリスティックは**レイテンシ**です。モデレーションによるブロックは約 5〜6 秒で返り（ブロックが生成より先に起きます）、成功した画像は約 9 秒かかります。モデレーションの結果にはある程度のランダム性もあるため、境界上のコンテンツでは再試行しても同じ挙動にならないことがあります。**1 回の試行だけで結論を出さないでください。**

    パラメータが正しいことを確認しても 400 が続く場合、prompt がモデレーションを引き起こした可能性が高いです。表現を見直してください。
  </Accordion>

  <Accordion title="/v1/chat/completions ിലൂടെ画像を生成できますか?">
    はい、ただし**推奨される方法ではありません**。このエンドポイントは標準的なチャット構造を返し、その `content` は markdown の画像リンクです:

    ```text theme={null}
    ![image](https://apac.ossforai.com/...)
    ```

    これは Chatbox や LobeChat のような会話型クライアントに適しています。プログラムから統合する場合は、**Images API を使用してください**（`/v1/images/generations` と `/v1/images/edits`） — より豊富なパラメータ、より安定したレスポンス形状、そしてこのドキュメントとの整合性があります。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [Grok Imagine 2 Text-to-Image API](/ja/api-capabilities/grok-imagine-image/text-to-image) - Playground 付きのエンドポイントリファレンス
* [Grok Imagine 2 Image Editing API](/ja/api-capabilities/grok-imagine-image/image-edit) - 編集と複数画像融合のリファレンス
* [Grok Model Guide](/ja/api-capabilities/grok/overview) - xAI テキストモデル
* [Image API Best Practices](/ja/api-capabilities/image-api-best-practices) - タイムアウト、切断、圧縮
* [API Manual](/ja/api-manual)
* [Recharge Promotions](/ja/faq/recharge-promotions)
