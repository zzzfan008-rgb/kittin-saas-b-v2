> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FLUX 画像生成・編集

> Black Forest Labs の FLUX モデルファミリー — サブ秒の FLUX.2 [klein] から 4MP のフラッグシップ [max] まで、テキストから画像生成、複数リファレンス編集、タイポグラフィ、正確な hex カラー制御をカバーします。OpenAI 互換のそのまま差し替え可能な実装です。

## 概要

**FLUX** は、ドイツに拠点を置く Black Forest Labs (BFL) の主力 画像生成 モデルファミリーです。最新の **FLUX.2** 世代は、サブ秒から 4MP の主力品質まで 5 段階をカバーし、前世代の画像編集向け **FLUX.1 Kontext** と合わせて、合計 7 つのアクティブなモデルがあります。従来の FLUX.1 \[pro] モデルも引き続き呼び出せます。APIYI のゲートウェイは、BFL の非同期ポーリング API を同期型の OpenAI 画像 API (`/v1/images/generations` と `/v1/images/edits`) にラップしているため、OpenAI SDK をわずか`base_url`の変更だけでそのまま使えます。

<Note>
  **🎨 主な特徴**: FLUX.2 \[max] は、リアルタイムのウェブ知識に対する **グラウンディング検索** を独自にサポートします。ネイティブ 4MP 出力 (2048×2048) + 最大 8 枚の複数参照画像 + 32K-token の prompt + 正確な HEX カラー制御 + 業界最高水準のタイポグラフィ。**本番環境で、主力品質、複数画像の一貫性、ブランドカラーの忠実な再現、プロフェッショナルなレイアウトに最適** です。
</Note>

<Info>
  すべての image API は **同期型** です。ポーリングする task ID はなく、クライアントが切断されると結果は失われますが、リクエストは引き続き課金されます。このモデルでは十分に長い timeout を設定してください。詳細は [画像 API の基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices) をご覧ください。
</Info>

<CardGroup cols={2}>
  <Card title="テキストから画像 API" icon="wand-sparkles" href="/ja/api-capabilities/flux/text-to-image">
    `/v1/images/generations`、5 つすべての FLUX.2 モデルで text prompt から画像を生成します。
  </Card>

  <Card title="画像編集 API" icon="image" href="/ja/api-capabilities/flux/image-edit">
    JSON `input_image` フィールド（`/generations` による最大 8 件の参照を使った融合）、さらに OpenAI 互換の multipart `/edits` 単一画像パスがあります。FLUX.2 + FLUX.1 Kontext で利用できます。
  </Card>

  <Card title="過去のバージョン" icon="rotate-ccw-clock" href="/ja/api-capabilities/flux/historical-versions">
    FLUX.1 \[pro] / \[pro] 1.1 / \[pro] 1.1 Ultra / \[dev] の仕様、移行メモ、料金。
  </Card>
</CardGroup>

## AIエージェントに統合を任せる

<Note>
  コーディングエージェントである Codex / Claude Code / Cursor を使うなら、以下のプロンプトをコピーしてエージェントに渡してください。最初にこのページのプレーンテキスト版を取得し（任意の docs URL に `.md` を追加します）、その後はプロジェクト固有のスタックでコードを書きます。タイムアウト、**即時のサーバー側コピーを強制する10分の URL 期限**、アップロード圧縮、そして 16 の倍数のサイズ制約は、いずれも要件に組み込み済みです。
</Note>

<Prompt description="FLUX のテキストから画像生成と画像編集の統合またはトラブルシュートを、コーディングエージェントに行わせてください。Codex、Claude Code、Cursor などのツールにコピーして貼り付けます。" icon="bot" actions={["copy"]}>
  このプロジェクトで FLUX のテキストから画像生成と画像編集を統合／トラブルシュートしてください。

  コードに触る前にドキュメントを読んでください。このページのプレーンテキスト版を取得するには、[https://docs.apiyi.com/en/api-capabilities/flux/overview.md](https://docs.apiyi.com/en/api-capabilities/flux/overview.md) を fetch してください。より細かなパラメータの詳細については、同じ方法で text-to-image と image-edit のページに `.md` を追加します。

  要件:

  1. タイムアウト: クライアントのタイムアウトを 120 秒に設定してください。`flux-2-flex` を使っている場合は 180 秒にしてください。これらの image API は同期型です。task ID はありません。そのため、クライアントが切断されると、リクエストが課金されたまま結果は失われます。リバースプロキシ、ゲートウェイ、サーバーレス実行の制限もすべて広げる必要があります。生成時間より短い層が 1 つでもあると、その時点でリクエストは打ち切られます。

  2. レスポンスの扱い（**このモデルで最も重要な項目**）: FLUX は **URL のみを返し、base64 は返しません**。結果は `data[0].url` にあります。`b64_json` を探さず、`response_format` を送信しないでください。その署名付きリンクの有効期限は **約10分 בלבד** で、**CORS は有効ではありません**。ブラウザから直接取得するとクロスオリジンのルールでブロックされます（リンクを img タグ `src` に入れる表示自体は問題ありません）。したがって正しい方法は、**URL をサーバー側で直ちにダウンロードして、自分のオブジェクトストレージに再ホストすること**です。そのうえで、自分の恒久的なリンクをフロントエンドに渡してください。上流のリンクをデータベースに長期保存用のアドレスとして保管してはいけません。また、このモデルは **`usage` フィールドを返しません**。したがって、レスポンスで token 数を期待しないでください。

  3. 参照画像のアップロード: マルチ画像融合は `/v1/images/generations` 経由で、JSON フィールド `input_image`、`input_image_2`、そして `input_image_8` までを使います。各値は画像 URL でも、`data:image/...;base64,...` 形式の data URL でも構いません。`/v1/images/edits` エンドポイント（multipart）は **単一の画像しか受け付けず、ファイルフィールド名は必ず `image` でなければなりません**。それ以外は `image is required` が返ります。参照画像の上限はモデルごとに異なります。FLUX.2 pro / max / flex は最大 8 枚、klein は最大 4 枚、FLUX.1 Kontext は 1 枚のみです。アップロード前に圧縮してください。1.5MB を超えるファイルだけを処理し、縦横比を維持したまま長辺を 2048px に縮小し（小さい画像は絶対に拡大しない）、品質 0.9 で再エンコードして元の形式を保持します。各画像は 20MB と 20 メガピクセル未満にしてください。1 枚の画像の圧縮に失敗した場合は、元画像にフォールバックして処理を続けてください。

  4. サイズパラメータ: `size`（例えば `1024x1024`）を使うか、2 つの整数 `width` と `height` を使ってください。どちらの形式も同等なので、どちらか 1 つを選びます。**両方の寸法は 16 の倍数である必要があり**、少なくとも 64×64、最大でもおおむね 4 メガピクセルです（2 メガピクセル以下が推奨です）。`1000x1000` は 16 の倍数ではないため無効で、`3840x2160` は 4 メガピクセルを超えるため無効です。UI でユーザーが寸法を入力できる場合は、送信前にこの 2 つのルールを両方検証してください。編集では、`aspect_ratio` が形状を制御し、これを省略すると出力は 1 枚目の入力画像に従います。このモデルには **`quality` パラメータがありません**。`flux-2-flex` だけが `steps`（デフォルト 50）と `guidance`（デフォルト 4.5）を品質調整用のノブとして公開します。コストの制御はモデル選択で行ってください。klein が最安、max が最も高価、編集は生成と同じ料金で、追加の参照画像で追加コストは発生しません。

  5. その他の注意: OpenAI SDK 経由で呼び出す場合、FLUX 固有のパラメータは必ず `extra_body` の中に入れて、初めて転送されます。`prompt_upsampling` はデフォルトでオフで、プロンプトを書き換えるため、ブランド用途ではオフのままにしてください。`webhook_url` は転送されないので、これに依存しないでください。

  6. キーは `APIYI_API_KEY` 環境変数から読み取り、ベース URL として [https://api.apiyi.com/v1](https://api.apiyi.com/v1) を使用してください。絶対にハードコードせず、git にコミットしないでください。

  7. 作業が終わったら、実際に text-to-image を 1 回、image-edit を 1 回実行し、その結果と 2 回の呼び出しにかかった費用を見せてください。
</Prompt>

<Accordion title="このプロンプトで回避できること">
  | 要件                         | 防ぐ問題                                                                                                     |
  | -------------------------- | -------------------------------------------------------------------------------------------------------- |
  | サーバー側で即座に再ホストする            | 上流リンクは約10分で失効するため、長期保存用のアドレスとして保管すると 404 が広範囲に発生します                                                      |
  | ブラウザから `fetch` しない         | 上流で CORS が有効ではないため、フロントエンドの fetch はブロックされます。表示できるのは img タグ `src` だけです                                    |
  | `b64_json` を探さない           | このモデルは URL のみを返すため、base64 の解析結果は空になります                                                                   |
  | 寸法は 16 の倍数でなければならない        | 一見普通に見える `1000x1000` でも即座に拒否され、`3840x2160` はピクセル上限を超えます                                                  |
  | アップロード前に圧縮する               | 上限は 1 画像あたり 20MB と 20 メガピクセルです。[画像圧縮と出力解像度](/ja/api-capabilities/image-compression-resolution) を参照してください |
  | ファイルフィールド名が `image` の編集を使う | それ以外の名前だと `image is required` が返ります。マルチ画像融合ではそもそもそのエンドポイントを使うべきではありません                                   |
</Accordion>

## APIYI の FLUX が選ばれる理由は？

BFL 公式チャネルのそのまま差し替え可能な代替で、本番運用向けに **安定性**、**コスト**、**統合体験** を最適化しています:

<CardGroup cols={2}>
  <Card title="OpenAI互換ラッパー · ゼロコード移行" icon="shield-check">
    BFL のネイティブ版は非同期ポーリングを使いますが、APIYI はこれを同期型の **OpenAI Images API** としてラップします。OpenAI SDK の `base_url` をここに向けるだけで、自前の `polling_url` ループを書く必要はありません。
  </Card>

  <Card title="同時実行数の上限なし · 24件超のアクティブタスクに対応" icon="infinity">
    BFL は各アカウントを **24件のアクティブタスク**（`flux-kontext-max`では6件のみ）に制限しています。APIYI はゲートウェイでリクエストをプールするため、エンタープライズユーザーはアカウントごとの上限に縛られず、線形にスケールできます。
  </Card>

  <Card title="同価格、または最大17%オフ" icon="percent">
    FLUX.2 \[pro/max/flex] は 1MP で公式価格と同等、klein 4B/9B は約28%安価、FLUX.1 \[pro] 1.1 Ultra は17%節約、さらに [チャージ特典](/ja/faq/recharge-promotions) を積み重ねると **最大15%の追加割引** が得られます。
  </Card>

  <Card title="グローバルで摩擦のないアクセス" icon="globe">
    **海外サーバーやプロキシは不要です**。中国本土のデータセンター、住宅ネットワーク、グローバルノードからも、`api.apiyi.com` に安定したレイテンシで直接アクセスできます。
  </Card>

  <Card title="充実したモデルエコシステム" icon="layers">
    同じゲートウェイで [gpt-image-2](/ja/api-capabilities/gpt-image-2/overview)、[Seedream](/ja/api-capabilities/seedream-image/overview)、[Nano Banana](/ja/api-capabilities/nano-banana-image/overview) などと組み合わせ、シナリオごとに使い分けられます。
  </Card>

  <Card title="プロフェッショナルサービス · エンタープライズサポート" icon="handshake">
    当チームは画像生成の導入に深い経験があり、PoC から本番まで、モデル選定、チューニング、統合サポートを提供します。
  </Card>
</CardGroup>

## 主な特徴

<CardGroup cols={2}>
  <Card title="フルスピード・スペクトラム" icon="bolt">
    klein 4B/9B はコンシューマー向けGPUで **1秒未満**、pro は **\< 10s**、max は **\< 15s**、flex は精度を高めるためにさらに遅くなります。リアルタイムからフラッグシップまでを1つのファミリーでカバーします。
  </Card>

  <Card title="ネイティブ4MP出力" icon="expand">
    最大 2048×2048（約4MP）まで対応し、FLUX.1 の 1.6MP 上限より 2.5倍大きくなっています。アスペクト比は自由で、サイズは16の倍数である必要があり、最小は 64×64 です。
  </Card>

  <Card title="マルチリファレンス・フュージョン" icon="layers">
    JSON フィールド `input_image` \~ `input_image_8` で複数の参照（URL または base64データURL）を扱えます。FLUX.2 \[pro/max/flex] は最大 **8** 件、\[klein] は最大4件までです。prompt では「画像 1 / 画像 2」のように参照できます。
  </Card>

  <Card title="グラウンディング検索" icon="globe">
    FLUX.2 \[max] 専用です。prompt からリアルタイムのウェブ検索を実行し、「昨日の試合スコア」「現在の天気」「歴史的な出来事の再現」などをレンダリングできます。
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="正確な16進カラー制御" icon="palette">
    `#02eb3c` や `#ff0088` のような16進カラーコードを prompt に直接書けます。モデルが正確な色を出力するため、ブランド重視の用途でも後処理は不要です。
  </Card>

  <Card title="32K-token長文prompt" icon="type">
    最大 **32K tokens** まで対応し、構造化された JSON の説明（subject / background / lighting / style）も含められます。本番運用の自動化に最適です。
  </Card>

  <Card title="タイポグラフィ最適化" icon="type">
    FLUX.2 \[flex] はタイポグラフィ向けに特化して設計されています。ポスター見出し、UIモックアップ、インフォグラフィック — 小さな文字の忠実度で業界をリードします。max / pro も良好に動作します。
  </Card>

  <Card title="OpenAI SDKドロップイン" icon="plug">
    `base_url` を `https://api.apiyi.com/v1` に設定し、`client.images.generate(model="flux-2-pro", ...)` を直接呼び出すだけです — コード変更は不要です。
  </Card>
</CardGroup>

## 価格

画像ごとの価格設定です。**APIYI Price** 列をご覧ください。BFL の公式価格は **MP (megapixel)** 単位で、1MP 以内は基本価格、追加の MP ごとに加算されます。APIYI の画像ごとの定額制は、より予測しやすいです。

### FLUX.2 Series（最新世代）

| Model ID          | APIYI価格  | 公式           | 速度     | 最適用途                             |
| ----------------- | -------- | ------------ | ------ | -------------------------------- |
| `flux-2-max`      | \$0.0700 | \$0.07/MP から | \< 15s | フラッグシップ品質 + grounding search     |
| `flux-2-pro`      | \$0.0300 | \$0.03/MP から | \< 10s | 大規模な本番運用、最も高いコストパフォーマンス          |
| `flux-2-flex`     | \$0.0600 | \$0.06/MP    | 遅め     | タイポグラフィ調整済み、steps/guidance を調整可能 |
| `flux-2-klein-9b` | \$0.0100 | \$0.015 から   | 1秒未満   | 品質と速度のバランス重視                     |
| `flux-2-klein-4b` | \$0.0100 | \$0.014 から   | 1秒未満   | 最速、コンシューマー向けGPUに適合               |

### FLUX.1 Kontext Series（画像編集特化）

| Model ID           | APIYI価格  | 公式     | 節約    | 最適用途               |
| ------------------ | -------- | ------ | ----- | ------------------ |
| `flux-kontext-max` | \$0.0700 | \$0.08 | 12.5% | 最高の編集品質、細かなタイポグラフィ |
| `flux-kontext-pro` | \$0.0350 | \$0.04 | 12.5% | 編集のコスパ重視、5〜6秒で生成   |

### FLUX.1 \[pro] 旧版（履歴上のものですが、今でも呼び出し可能）

| Model ID             | APIYI価格  | 公式     | 節約    |
| -------------------- | -------- | ------ | ----- |
| `flux-pro-1.1-ultra` | \$0.0500 | \$0.06 | 17%   |
| `flux-pro-1.1`       | \$0.0350 | \$0.04 | 12.5% |
| `flux-pro`           | \$0.0400 | \$0.04 | 同じ    |
| `flux-dev`           | \$0.0200 | —      | —     |

詳細な仕様と移行ガイドは [Historical Versions page](/ja/api-capabilities/flux/historical-versions) をご覧ください。

<Info>
  **価格に関する注記**:

  * APIYI は画像ごとの定額制を採用しており、出力 MP にかかわらず料金は同じです
  * 公式価格は MP 段階制です。最初の MP に基本価格があり、追加の MP ごとに加算されます
  * 編集リクエストの料金は text-to-image と同じです（OpenAI gpt-image-2 では編集が Vision tokens で課金されるのとは異なります）
  * klein 4B / klein 9B の open weights は、セルフホスティング用に Hugging Face で利用できます（Apache 2.0 / FLUX NCL）
  * 失敗したリクエスト（4xx / moderation blocks）は課金されません
</Info>

## 技術仕様

| 項目                     | 値                                                                         |
| ---------------------- | ------------------------------------------------------------------------- |
| **推奨の主**               | `flux-2-pro` / `flux-2-pro-preview`（一般向け） + `flux-kontext-max`（タイポグラフィ編集） |
| **速度**                 | サブ秒（klein） / \< 10s（pro） / \< 15s（max） / 遅め（flex）                         |
| **出力解像度**              | 最大 4MP（2048×2048）、任意のアスペクト比、サイズは 16 の倍数である必要があります                         |
| **入力解像度**              | 最小 64×64、最大 4MP（編集エンドポイントのみ）                                              |
| **参照画像**               | 8（FLUX.2 \[pro/max/flex]）/ 4（FLUX.2 \[klein]）/ 1（FLUX.1 Kontext）          |
| **Prompt の長さ**         | 最大 32K tokens                                                             |
| **出力フォーマット**           | `jpeg`（既定）/ `png`                                                         |
| **モデレーション**            | `safety_tolerance` 0–6（0 = 最も厳格、6 = 最も寛容、既定 2）                            |
| **グラウンディング検索**         | `flux-2-max` のみ                                                           |
| **レスポンスフィールド**         | `data[0].url`（**10分間有効**、すぐにダウンロードしてください）                                 |
| **リクエストごとの画像数**        | 1（`n=1`）                                                                  |
| **prompt\_upsampling** | FLUX.2 \[pro/max/flex] でサポート、\[klein] では非対応                               |

## API エンドポイント

| エンドポイント                       | 用途                                                                                         | Content-Type          |
| ----------------------------- | ------------------------------------------------------------------------------------------ | --------------------- |
| `POST /v1/images/generations` | テキストから画像生成 + 画像編集 / マルチリファレンス融合（JSON `input_image` 〜 `input_image_8`、**推奨**、すべての FLUX モデル） | `application/json`    |
| `POST /v1/images/edits`       | OpenAI 互換の単一画像編集（`client.images.edit()` のドロップイン置き換え; Kontextシリーズで検証済み）                     | `multipart/form-data` |

マルチリファレンス融合には、`/generations`（JSON `input_image_N`）を使用します。`/edits` エンドポイントは単一の `image` ファイルのみを受け付けます。既存の OpenAI SDK の編集コードを移行する場合に最適です。

<Tip>
  **ドメインオプション**: `api.apiyi.com` が主要ドメインです。`b.apiyi.com` / `vip.apiyi.com` のような代替ゲートウェイドメインも同様に動作します。
</Tip>

## サイズ（幅 / 高さ）の詳細

### よく使われる寸法

| サイズ         | アスペクト比   | ピクセル    | 最適用途                  |
| ----------- | -------- | ------- | --------------------- |
| `1024x1024` | 正方形 1:1  | \~1MP   | 一般用途、SNS アバター         |
| `1024x1536` | 縦長 2:3   | \~1.6MP | ポスター、ポートレート           |
| `1536x1024` | 横長 3:2   | \~1.6MP | 風景、デスクトップ             |
| `1440x2048` | 縦長 \~3:4 | \~2.9MP | 映画風の縦長構図              |
| `1920x1080` | 横長 16:9  | \~2MP   | 動画サムネイル               |
| `2048x2048` | 正方形 1:1  | 4MP     | フラッグシップ印刷（FLUX.2 の上限） |

### カスタムサイズの制約

FLUX.2 は任意の寸法を受け付けますが、以下の**すべて**を満たす必要があります。

1. **width / height は 16 の倍数であること**
2. **最小 64×64**
3. **最大 \~4MP**（例: 2048×2048 / 1920×2048 / 2048×1920）
4. **推奨合計は 2MP 以下**で、速度とコストのバランスを取ること

**有効な例**: `1280x720`, `1920x1080`, `2048x1024`, `1456x1920`
**無効な例**: `1000x1000`（16 の倍数ではない）, `3840x2160`（4MP を超える）, `32x32`（64×64 未満）

<Warning>
  **API: width/height と OpenAI 互換 size の違い**: BFL はネイティブでは整数の`width` / `height`を使用します。APIYI では OpenAI 形式の`size: "1024x1024"`文字列も受け付けます。両者は同等です — どちらを選んでも構いません。
</Warning>

## ベストプラクティス

<Steps>
  <Step title="シナリオに応じてモデルを選ぶ">
    フラッグシップ最終版 + リアルタイムの知識が必要 → `flux-2-max`. 本番のバッチ処理 → `flux-2-pro`. タイポグラフィのポスター / インフォグラフィック → `flux-2-flex`. 高スループットのリアルタイム → `flux-2-klein-9b`. 画像編集 → `flux-kontext-max` または `flux-kontext-pro`.
  </Step>

  <Step title="速度とコストの最適点は ≤ 2MP">
    速度とコストの最適点は 1MP–2MP です。4MP は本当に必要な場合（印刷、4K 画面）にのみ使ってください。klein は高解像度では、1回あたりのコストが目に見えて増えます。
  </Step>

  <Step title="プロンプト内のインデックスで参照画像を指定する">
    `input_image` / `input_image_2` / `input_image_3` の番号は、プロンプト内の「image 1 / image 2 / image 3」のインデックスと完全に一致します。「image 1 の人物を、image 2 のシーンに、image 3 のカラーパレットで」と指定すると、モデルに推測させるよりはるかに信頼性が高くなります。
  </Step>

  <Step title="結果の URL はすぐにダウンロードする">
    `data[0].url` は **10 分間のみ有効** で、`delivery-eu.bfl.ai` / `delivery-us.bfl.ai` にホストされており、CORS は無効です。本番ではサーバー側でダウンロードして自社 CDN に保存してください。
  </Step>

  <Step title="タイポグラフィは flex か max に固定する">
    看板テキスト、ポスター、UI スクリーンショットには、`flux-2-flex`（タイポグラフィ特化）または `flux-2-max`（総合品質が最も高い）を優先してください。他のモデルでは小さなテキストがまだぼやけることがあります。
  </Step>

  <Step title="グラウンディング検索には max を使う">
    リアルタイムの知識（「今日の天気」「昨夜の試合」）は `flux-2-max` でのみサポートされています。ほかのモデルは学習データに依存し、最新情報を取得できません。
  </Step>

  <Step title="クライアントのタイムアウトは 60–120s">
    APIYI はポーリングを内部で処理し、pro / max は \< 15s で返りますが、キューイングとネットワークジッターを考慮してクライアントのタイムアウトは 60–120s に設定してください。flex は最大 180s まで可能です。
  </Step>

  <Step title="再現性のために seed を固定する">
    同じ `seed` + 同じ他のパラメータ = 一貫した結果になり、A/B テストやクライアントレビューに役立ちます。klein は `prompt_upsampling` をサポートしていません。pro/max/flex ではデフォルトでオフです。必要に応じて有効にしてください。
  </Step>
</Steps>

## エラーコードと再試行

| ステータス   | 意味                                                                   | 推奨対応                                            |
| ------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| `400`   | 無効なパラメータ（width/height が 16 の倍数でない、4MP を超える、prompt が 32K tokens を超える） | サイズ制約を確認してください。特に 16 の倍数ルールに注意してください            |
| `401`   | 無効な token                                                            | Bearer token を確認してください                          |
| `403`   | モデレーションブロック                                                          | prompt を調整するか、`safety_tolerance` を上げてください（最大 6） |
| `429`   | レート制限 / 残高不足 / アクティブなタスク数超過                                          | 指数バックオフで再試行                                     |
| `5xx`   | ゲートウェイ / バックエンドエラー                                                   | 1～2 回再試行                                        |
| Timeout | ロングテール                                                               | クライアントタイムアウト ≥ **60s**（最大 180s まで柔軟に対応）         |

<Info>
  **推奨クライアント設定**:

  * リクエストタイムアウト **60–120s**（最大 180s まで柔軟に対応）
  * 5xx と 429 には指数バックオフで再試行（推奨 2 回）
  * `data[0].url` を受信したら、**非同期で直ちにダウンロード** してください — ユーザーのクリックを待たないでください
  * サポート用に `x-request-id` レスポンスヘッダーをログに記録してください
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="なぜ URL フィールドは 10 分で期限切れになるのですか？">
    BFL は、10 分有効の署名付き URL を使って `delivery-eu.bfl.ai` / `delivery-us.bfl.ai` に結果をホストし、**CORS は無効**です。本番サービスでは、サーバー側で自前の OSS / CDN にダウンロードする必要があります。元の URL をブラウザに渡さないでください。また、後からユーザーがアクセスできると期待しないでください。

    APIYI も同じ URL メカニズムを継承しており、動作は公式チャネルと同じです。
  </Accordion>

  <Accordion title="公式 API は非同期ポーリングを使いますが、APIYI はどうやって同期化しているのですか？">
    APIYI ゲートウェイがポーリングを代行します。標準の OpenAI Images API リクエストを送ると、ゲートウェイが内部で BFL に POST し、`polling_url` を `Ready` までポーリングし、その後、最終的な `result.sample` URL を `data[0].url` としてラップして返します。クライアント側から見ると、1 回のリクエスト・レスポンスであり、OpenAI / GPT-Image / Nano Banana と同じです。
  </Accordion>

  <Accordion title="何枚の参照画像を送れますか？ プロンプトはどう書けばよいですか？">
    * **FLUX.2 \[pro/max/flex]**: 最大 **8**
    * **FLUX.2 \[klein]**: 最大 **4**
    * **FLUX.1 Kontext \[pro/max]**: 単一参照のみ（複数画像が必要な場合はクライアント側で結合）

    プロンプトでは、インデックス（「image 1 / image 2 / image 3」）で参照してください。たとえば、「image 1 の人物を image 2 のシーンに配置し、image 3 のカラーパレットを適用する」です。自然言語での参照も使えます。モデルは入力画像をよく理解します。
  </Accordion>

  <Accordion title="prompt_upsampling は何をしますか？ 有効にすべきですか？">
    `prompt_upsampling=true` は、モデルに prompt を自動展開・洗練させます（短い prompt ほど特に有用です）。ただし、**元の意図が変わります**。ブランド用途ではオフにし、自由な探索ではオンにしてください。

    **制限**: FLUX.2 \[klein] は対応していません（渡しても黙って無視されます）。
  </Accordion>

  <Accordion title="grounding search はどう使いますか？">
    対応しているのは `flux-2-max` だけです。**特別なパラメータは不要**です。プロンプトにリアルタイムの知識が必要な場合、生成前にモデルが自動的にウェブ検索します。例:

    > "2025 年 12 月 15 日に NYC を襲った吹雪のニュース写真を生成してください"

    「昨日の試合結果」「現在の天気」「歴史的事件の再現」「最新トレンド」に最適です。時事性のないプロンプトでは検索は発動せず、通常の生成として課金されます。
  </Accordion>

  <Accordion title="hex カラーを最も効果的に使うにはどうすればよいですか？">
    プロンプト内に、明示的に「color」または「hex」のマーカーを付けて hex コードを直接書きます:

    ```
    A vase on a table, the color of the vase is gradient from #02eb3c to #edfa3c, the flowers have color #ff0088
    ```

    複数色のブランド用途では、次のようにも書けます:

    ```
    Luxury eyeshadow palette with 6 pans: top row #B76E79, #E8D5B7, #8B4789; bottom row #CD7F32, #F8F6F0, #800020
    ```

    業界最高水準の精度で、後処理の色補正は不要です。
  </Accordion>

  <Accordion title="structured JSON prompt とは何ですか？">
    FLUX.2 は JSON 形式の prompt をサポートしています:

    ```json theme={null}
    {
      "subject": "Mona Lisa painting by Leonardo da Vinci",
      "background": "museum gallery wall, ornate gold frame",
      "lighting": "soft gallery lighting",
      "style": "digital art, high contrast",
      "camera_angle": "eye level view",
      "composition": "centered, portrait orientation"
    }
    ```

    JSON 文字列を `prompt` フィールドに渡してください。本番自動化やテンプレート化したバッチ生成に最適です。
  </Accordion>

  <Accordion title="画像編集にはどの endpoint を使えばよいですか？">
    選択肢は 2 つあります:

    * **Option A（推奨）**: JSON + `input_image`（約 `input_image_8`）を `/v1/images/generations` に送信します。すべての FLUX モデルで動作し、複数参照の融合をサポートします
    * **Option B**: `multipart/form-data` を `/v1/images/edits` に送信します。ファイルのフィールド名は `image`（単一画像）である必要があり、OpenAI SDK の `client.images.edit()` と直接互換です。Kontext シリーズで検証済みです

    パラメータと例については [Image Editing API](/ja/api-capabilities/flux/image-edit) を参照してください。

    **注意**: FLUX.1 Kontext はネイティブでは単一参照のみ対応です。FLUX.2 は最大 8 参照に対応します（Option A 経由）。
  </Accordion>

  <Accordion title="OpenAI 公式 SDK を直接使えますか？">
    はい、コード変更は不要です。`base_url` を `https://api.apiyi.com/v1` に設定してください:

    ```python theme={null}
    from openai import OpenAI
    client = OpenAI(api_key="sk-your-key", base_url="https://api.apiyi.com/v1")
    resp = client.images.generate(
        model="flux-2-pro",
        prompt="...",
        size="1024x1024"
    )
    ```

    Node.js の `openai` パッケージでも同じです。すべての FLUX モデルは、`data[0].url` を持つ OpenAI Images API のレスポンス形状に従います。
  </Accordion>

  <Accordion title="実行中のタスクをキャンセルできますか？">
    **対応していません**。クライアントが切断されても、サーバーは生成を完了し、通常どおり課金されます。クライアント側でタイムアウトを設定し、「切断 = 無料」とは考えないでください。
  </Accordion>

  <Accordion title="rate limit と concurrency 上限はどのくらいですか？">
    BFL は各アカウントを **24 件のアクティブタスク** に制限しており、`flux-kontext-max` は別途 **6** に制限されています。

    APIYI はゲートウェイでプールしているため、エンタープライズの concurrency はアカウントごとの上限に縛られません。明示的な SLA / RPM のコミットが必要な場合は、専用クォータについて弊社チームにお問い合わせください。
  </Accordion>

  <Accordion title="webhook コールバックは動作しますか？">
    BFL はネイティブで `webhook_url` + `webhook_secret` をサポートしていますが、APIYI の OpenAI 互換ラッパーは同期的に待機し、**webhook フィールドはそのまま通しません**。ポーリングは不要で、リクエスト・レスポンスは一度きりです。ビジネス上どうしても webhooks が必要な場合は、ネイティブな非同期チャネルを有効化するのでご連絡ください。
  </Accordion>

  <Accordion title="失敗したリクエストは課金されますか？">
    **いいえ**。`400`（パラメータエラー）、`403`（モデレーションによるブロック）、`429`（rate limited）はすべてエラーを返し、課金されません。**実際に生成に入ったリクエスト（200 + `data[0].url`）のみが課金対象です**。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [テキストから画像への Playground](/ja/api-capabilities/flux/text-to-image) — `/v1/images/generations` 対話型デバッガ
* [画像編集 Playground](/ja/api-capabilities/flux/image-edit) — マルチリファレンス融合 + 編集
* [履歴バージョンと移行](/ja/api-capabilities/flux/historical-versions) — FLUX.1 \[pro] / \[pro] 1.1 / Ultra / \[dev]
* [API マニュアル](/ja/api-manual) — 一般的な利用仕様
* [GPT-Image-2 概要](/ja/api-capabilities/gpt-image-2/overview) — OpenAIの旗艦モデルで、4Kに対応
* [Seedream 概要](/ja/api-capabilities/seedream-image/overview) — BytePlus提携チャネル

<Info>
  FLUXはBFLのファーストパーティモデルファミリーであり、16進カラー精度、タイポグラフィの忠実性、長いpromptの理解で業界をリードしています。OpenAIエコシステムとの互換性を優先する場合は、[GPT-Image-2](/ja/api-capabilities/gpt-image-2/overview)を参照してください。中国語シナリオでは、[Seedream](/ja/api-capabilities/seedream-image/overview)を参照してください。
</Info>
