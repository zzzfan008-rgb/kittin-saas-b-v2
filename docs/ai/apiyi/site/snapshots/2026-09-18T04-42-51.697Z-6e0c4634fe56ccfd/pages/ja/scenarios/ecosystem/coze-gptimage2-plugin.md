> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT Image 2 Coze プラグイン

> Coze プラットフォーム向けのコミュニティ提供 Python プラグインで、GPT Image 2 の呼び出し、エラー分類、APIYI を介した OSS アップロードパイプラインをラップしており、Coze のワークフローでテキストから画像、画像から画像、結果の直接配信を実行できます。

## 概要

これは Coze プラットフォーム（`coze.cn`）向けのカスタム Python プラグインで、OpenAI の GPT Image 2 モデル（`gpt-image-2`）を **APIYI** ゲートウェイ経由で、Coze ワークフローから直接呼び出せるノードにラップしています。このプラグインには、完全なリクエスト構築、エラーコード分類、コンテンツ安全フィルタリング検知、Alibaba Cloud OSS アップロードパイプラインが含まれています。**表示用にすぐ使える公開アクセス可能な URL を返すため**、Coze ワークフローで別途結果転送ステップを構築する必要がありません。

<Info>
  **プロジェクト情報**

  * 📦 配布形態: コードパッケージとして共有（**GitHub では公開していません**）
  * 👤 作者: コミュニティ提供
  * 🎯 対象プラットフォーム: Coze（中国 / グローバル）カスタムプラグイン
  * 🔌 呼び出すモデル: `gpt-image-2`（APIYI、2026年4月21日リリース）
  * 🌐 ゲートウェイ: [APIYI](https://api.apiyi.com) — 中国本土から直接アクセス可能、VPN 不要
  * 📝 完全なソースコードは下記の「完全なプラグインソースコード」セクションにあり、コピーしてそのまま使用できます
</Info>

## APIYI ゲートウェイについて

[APIYI](https://api.apiyi.com) は、GPT 画像 2 用のゲートウェイです。中国本土から直接接続でき、1 つの API キーで利用できる 3 つのルートを提供しています。

| ドメイン            | 説明        |
| --------------- | --------- |
| `api.apiyi.com` | デフォルトルート  |
| `vip.apiyi.com` | VIP ルート   |
| `b.apiyi.com`   | バックアップルート |

APIYI では、GPT 画像 2 にアクセスする 3 つの方法を提供しています。

| モデル ID            | チャネル           | 課金             | 生成速度     | 特徴                                            |
| ----------------- | -------------- | -------------- | -------- | --------------------------------------------- |
| `gpt-image-2`     | 公式リレー          | token 単位の課金    | 約 120 秒  | 公式 OpenAI API と完全互換で、品質・サイズ・4K に対応            |
| `gpt-image-2-all` | リバース（ChatGPT）  | 1 画像あたり \$0.03 | 30～60 秒  | 中国語環境に適しており、チャットエンドポイント経由で呼び出すと画像 URL を直接返します |
| `gpt-image-2-vip` | リバース（Adobe 系統） | 1 画像あたり \$0.03 | 90～150 秒 | 4K を含む、固定サイズプリセット 30 種                        |

> このプラグインでは、デフォルトで **`gpt-image-2`（公式リレー）** を使用します。公式 OpenAI API と完全互換で、すべてのパラメータを制御できます。より高速な生成が必要な場合は、`gpt-image-2-all` モードに切り替えてください（以下を参照）。

<Tip>
  [APIYI コンソール](https://api.apiyi.com/token)で、`sk-` から始まる API キーをリクエストします。コストを抑えるため、1 日あたりのクォータ上限（例：¥20～50）を設定することをおすすめします。
</Tip>

## 主な機能

<CardGroup cols={2}>
  <Card title="統合テキストから画像／画像から画像へのエントリ" icon="wand-sparkles">
    fileurls が空かどうかに応じて、テキストから画像（/v1/images/generations）モードと編集（/v1/images/edits）モードを自動的に切り替えます。Coze ワークフローで 2 つの別々のノードを作成する必要はありません
  </Card>

  <Card title="中国本土から直接アクセス可能、VPN不要" icon="bolt">
    すべてのリクエストは APIYI ゲートウェイ（api.apiyi.com）を経由します。中国のネットワークから直接到達でき、低レイテンシーで安定性も高いです
  </Card>

  <Card title="複数参照画像の編集" icon="images">
    画像URLのリストを渡すと、プラグインがそれらをダウンロードして multipart/form-data のファイルアップロードとしてリクエストに注入します。最大 16 枚の参照画像（各 ≤ 50MB）に対応し、元の画像のディテールを保持します
  </Card>

  <Card title="きめ細かなエラー分類" icon="shield-check">
    MODERATION\_BLOCKED、INVALID\_API\_KEY、RATE\_LIMIT、SERVER\_ERROR、TIMEOUT、NO\_DATA などの失敗原因を区別できるため、ワークフローの分岐が簡単になります
  </Card>

  <Card title="2段階のコンテンツ安全性検出" icon="ban">
    入力段階の moderation\_blocked（400）と出力段階の content\_filter（200）を区別し、検出時には明確な拒否メッセージを返すため、無駄な再試行を避けられます
  </Card>

  <Card title="OSS への直接アップロード" icon="cloud-upload">
    生成された base64 画像を Alibaba Cloud OSS にそのままアップロードします。ワークフロー側では、外部共有または保存にすぐ使える URL を受け取れます
  </Card>

  <Card title="細かなパラメータ制御" icon="sliders-horizontal">
    quality（low/medium/high/auto）、moderation（auto/low）、output\_format（png/jpeg/webp）などのパラメータをサポートしており、必要に応じて生成戦略を調整できます
  </Card>
</CardGroup>

## 対応モデル

| モデル                   | モデル ID            | 用途                                        | API ドキュメント                                                         |
| --------------------- | ----------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| GPT Image 2（公式リレー）    | `gpt-image-2`     | テキストから画像、画像から画像（編集）、公式 OpenAI API と完全互換   | [ドキュメントを見る](/ja/api-capabilities/gpt-image-2/overview)             |
| GPT Image 2-All（リバース） | `gpt-image-2-all` | Chat エンドポイント経由のテキストから画像、画像から画像、中国語に対応しやすい | [ドキュメントを見る](/en/api-capabilities/gpt-image-2-all/chat-completions) |
| GPT Image 2-VIP（リバース） | `gpt-image-2-vip` | 4K を含む 30 種類のサイズプリセットによる固定サイズ生成           | [ドキュメントを見る](/ja/api-capabilities/gpt-image-2-vip/overview)         |

<Tip>
  このプラグインはデフォルトで`gpt-image-2`（公式リレー）を使用し、`https://api.apiyi.com/v1/images/generations`（テキストから画像）と`https://api.apiyi.com/v1/images/edits`（画像から画像）のエンドポイントを備えており、`sk-`で始まる有効な APIYI API Key が必要です。ルートを切り替えるには、コード内の`API_BASE`を`https://vip.apiyi.com/v1`または`https://b.apiyi.com/v1`に変更してください。
</Tip>

## GPT 画像 2 の主な仕様

| 機能                  | 説明                                                                            |
| ------------------- | ----------------------------------------------------------------------------- |
| **リリース日**           | 2026年4月21日                                                                    |
| **最大解像度**           | 3840×2160（4K）、総ピクセル数 ≤ 8,294,400                                              |
| **アスペクト比**          | 1:1 / 16:9 / 9:16 / 4:3 / 3:2 / 3:1 / 1:3                                     |
| **品質レベル**           | low / medium / high / auto（デフォルト）                                             |
| **出力形式**            | png（デフォルト） / jpeg / webp                                                      |
| **出力圧縮**            | 0-100（jpeg / webp のみ）                                                         |
| **背景モード**           | auto / opaque / transparent（モデルは透明度をサポートしますが、**このプラグインではまだそのパラメータを公開していません**） |
| **モデレーションレベル**      | auto（デフォルト） / low                                                             |
| **テキスト描画**          | 正確性 > 99%                                                                     |
| **リクエストごとの画像数**     | 1（`n` のみ 1 をサポート）                                                             |
| **レスポンス形式**         | b64\_json（生の base64、data:image プレフィックスなし）                                     |
| **input\_fidelity** | high に固定されており、**渡してはいけません**（渡すと 400 エラーになります）                                 |

## API エンドポイント

| エンドポイント                                       | メソッド | Content-Type          | 目的                                                   |
| --------------------------------------------- | ---- | --------------------- | ---------------------------------------------------- |
| `https://api.apiyi.com/v1/images/generations` | POST | `application/json`    | テキストから画像を生成（テキスト prompt から生成）                        |
| `https://api.apiyi.com/v1/images/edits`       | POST | `multipart/form-data` | 画像から画像へ（`-F "image[]=@file"` 経由で参照画像をアップロード、最大 16 枚） |

> ルートを切り替えるには: `https://vip.apiyi.com/v1/...` または `https://b.apiyi.com/v1/...`。すべてのルートは機能的に同一です。

## プラグインアーキテクチャ

<img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-architecture.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=50eb8b0eafa03c71cb5a6863af7b872a" alt="GPT Image 2 Coze のプラグインアーキテクチャ図" width="1840" height="2100" data-path="images/coze-gptimage2-architecture.png" />

プラグインのコア呼び出しチェーンは次のとおりです:

```text theme={null}
Coze workflow inputs (cleantext / fileurls / aspect_ratio / resolution / quality / apikey)
        ↓
    handler() entry point
        ↓
    Check whether reference images exist (fileurls)
        ↓            ↓
  Text-to-image   Image-to-image
    ↓            ↓
 POST api.apiyi.com/v1/images/generations   POST api.apiyi.com/v1/images/edits
   (application/json)                         (multipart/form-data)
    ↓            ↓
   Parse response / classify error codes
        ↓
upload_base64_to_oss()  — upload to Alibaba Cloud OSS
        ↓
Return { analysis, url, error }
```

## 解像度とサイズのリファレンス

プラグインは APIYI の公式プリセットに基づき、`aspect_ratio` と `resolution` からサイズを自動選択します。

| アスペクト比 | 1K（サイズ / ピクセル）   | 2K（サイズ / ピクセル）   | 4K（サイズ / ピクセル）   |
| ------ | ---------------- | ---------------- | ---------------- |
| 1:1    | 1024×1024 ≈ 1.0M | 2048×2048 ≈ 4.2M | 3840×2160 ≈ 8.3M |
| 16:9   | 1536×1024 ≈ 1.6M | 2048×1152 ≈ 2.4M | 3840×2160 ≈ 8.3M |
| 9:16   | 1024×1536 ≈ 1.6M | 1152×2048 ≈ 2.4M | 2160×3840 ≈ 8.3M |
| 4:3    | 1024×768 ≈ 0.8M  | 2048×1536 ≈ 3.1M | 3264×2448 ≈ 8.0M |
| 3:2    | 1536×1024 ≈ 1.6M | 2048×1360 ≈ 2.8M | 3456×2304 ≈ 8.0M |
| 3:1    | 1536×512 ≈ 0.8M  | 3072×1024 ≈ 3.1M | 3840×1280 ≈ 4.9M |
| 1:3    | 512×1536 ≈ 0.8M  | 1024×3072 ≈ 3.1M | 1280×3840 ≈ 4.9M |

> **制約**: すべての寸法は 16 で割り切れる必要があり、アスペクト比は 3:1 以下、総ピクセル数は 8,294,400 以下です。
>
> **注**: 4K の 1:1 は 3840×2160（横向きの 16:9）を出力し、正方形ではありません。これは API の制約であり、実効アスペクト比は 16:9 になります。`2560×1440` を超える出力は引き続き実験的です。本番環境では、プリセットサイズを優先してください。

## 入力および出力パラメータ

### 入力 (`Input`)

| パラメータ           | 型         | 必須  | デフォルト  | 説明                                                                              |
| --------------- | --------- | --- | ------ | ------------------------------------------------------------------------------- |
| `cleantext`     | string    | はい  | —      | ユーザーテキストプロンプトまたは編集指示（最大 32,000 文字）                                              |
| `fileurls`      | string\[] | いいえ | —      | 参照画像 URL の一覧。テキストから画像生成の場合は空欄のままにしてください                                         |
| `aspect_ratio`  | string    | はい  | —      | アスペクト比。例: `1:1`, `16:9`, `9:16`                                                 |
| `resolution`    | string    | はい  | —      | 解像度。大文字で指定する必要があります: `1K` / `2K` / `4K`                                         |
| `quality`       | string    | いいえ | `auto` | 品質レベル: `low` / `medium` / `high` / `auto`                                       |
| `moderation`    | string    | いいえ | `auto` | モデレーションレベル: `auto` / `low`（緩和されたモデレーション）                                        |
| `output_format` | string    | いいえ | `png`  | 出力形式: `png` / `jpeg` / `webp`                                                   |
| `apikey`        | string    | はい  | —      | APIYI API Key（`sk-` で始まります。[APIYI コンソール](https://api.apiyi.com/token)で申請してください） |

### 出力 (`Output`)

| フィールド      | 型              | 説明                                    |
| ---------- | -------------- | ------------------------------------- |
| `analysis` | string         | ステータステキスト: `图片生成成功`（成功）/ `图片生成失败`（失敗） |
| `url`      | string \| null | 成功時は公開 OSS URL                        |
| `error`    | string \| null | 失敗時はわかりやすいエラー説明                       |

## デプロイ手順

<Steps>
  <Step title="ステップ 1: APIYIのAPIキーとOSS認証情報を準備する">
    * [APIYIコンソール](https://api.apiyi.com/token)でAPIキー（`sk-`で始まるもの）を申請します。日次クォータ上限を設定することをおすすめします（例: ¥20-50）
    * Alibaba CloudでOSSバケットを作成し、そのバケットに対する`oss:PutObject`権限を持つRAMサブアカウントを作成します
    * `AccessKey ID`、`AccessKey Secret`、`Bucket name`、および`Endpoint`を記録します（例: `oss-cn-beijing.aliyuncs.com`）
  </Step>

  <Step title="ステップ 2: Cozeのプラグインマーケットプレイスでプラグインを検索してインストールする">
    1. Cozeワークスペース → Plugins → プラグインマーケットプレイス に移動します
    2. 'GPT Image 2' または 'APIYI' を検索して、このプラグインを見つけます
    3. プラグインカードを開いて詳細を確認し、その後 '追加' をクリックしてワークスペースにインストールします

           <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-plugin-market.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=58d8111524c893c61aae7c52f4fb68db" alt="Coze plugin marketplace search" width="1450" height="738" data-path="images/coze-gptimage2-plugin-market.png" />
  </Step>

  <Step title="ステップ 3: プラグインコードをコピーする">
    下の「プラグインの完全ソースコード」セクションから完全なPythonコードをCoze IDEに貼り付け、冒頭のAlibaba Cloud OSS設定をご自身のものに置き換えてください:

    ```python theme={null}
    # API易 线路配置（可选）
    API_BASE = "https://api.apiyi.com/v1"
    # 也可切换为: "https://vip.apiyi.com/v1" 或 "https://b.apiyi.com/v1"

    # 阿里云 OSS 配置
    ACCESS_KEY_ID = "你的 AK"
    ACCESS_KEY_SECRET = "你的 SK"
    BUCKET_NAME = "你的 Bucket 名称"
    ENDPOINT = "oss-cn-beijing.aliyuncs.com"
    ```
  </Step>

  <Step title="ステップ 4: メタデータと入出力パラメータを設定する">
    下に示すようにInput / Outputフィールドの型と必須フラグを設定し、コード内の`args.input`フィールドに合わせてください:

    入力パラメータの設定:

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-basic-info.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=f06e617314b795c936cb5605a28746d0" alt="Coze plugin basic info" width="1611" height="458" data-path="images/coze-gptimage2-basic-info.png" />

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-input-params.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=410d34cca5c9aa191df0add21a51a848" alt="Coze plugin input parameter configuration" width="1617" height="505" data-path="images/coze-gptimage2-input-params.png" />

    出力パラメータの設定:

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-output-params-1.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=c590fca7d3196326aebddb3a7dbdefda" alt="Coze plugin output parameter configuration (part 1)" width="1606" height="695" data-path="images/coze-gptimage2-output-params-1.png" />

    <img src="https://mintcdn.com/apiyillc/Cz-Ecvg_GeeWkw5g/images/coze-gptimage2-output-params-2.png?fit=max&auto=format&n=Cz-Ecvg_GeeWkw5g&q=85&s=5546f08b19320ba2f6332555eef8f3c2" alt="Coze plugin output parameter configuration (part 2)" width="1577" height="373" data-path="images/coze-gptimage2-output-params-2.png" />
  </Step>

  <Step title="ステップ 5: テストして公開する">
    * Coze IDEでテスト用パラメータを入力します（`quality=low` + `resolution=1K` + APIYIパイプラインを検証するための簡単な prompt から始めます）
    * テストが通ったら、'公開' をクリックし、プラグインを任意のワークフローにドラッグします
  </Step>
</Steps>

## エラー分類戦略

このプラグインは単に `success=True/False` を報告するだけではなく、次の優先順位で失敗原因を分類するため、Coze ワークフローでそれに応じて分岐できます。

| 優先度 | エラー種別                   | 発生条件                       | 推奨対応                                                                 |
| --- | ----------------------- | -------------------------- | -------------------------------------------------------------------- |
| 1   | `MODERATION_BLOCKED`    | HTTP 400 / 403、コンテンツ安全ブロック | prompt または画像がモデレーションを引き起こしました。書き直して再試行してください — **元の入力では再試行しないでください** |
| 2   | `INVALID_API_KEY`       | HTTP 401                   | APIYI API Key が正しいか、または期限切れになっていないか確認してください                          |
| 3   | `RATE_LIMIT`            | HTTP 429                   | リクエストレートが上限を超えています。ルートを切り替えるか、同時実行数を下げてみてください                        |
| 4   | `SERVER_ERROR`          | HTTP 500 / 502 / 503       | APIYI / OpenAI 側のサーバー障害です。少し間を置いて2〜3回再試行してください                       |
| 5   | `BAD_REQUEST`           | HTTP 400（モデレーション以外）        | パラメータを確認してください。size の妥当性、または input\_fidelity が誤って渡されていないかを確認します      |
| 6   | `TIMEOUT`               | 品質ベースのタイムアウトを超過しました        | 品質または解像度を下げて再試行してください                                                |
| 7   | `NO_DATA`               | レスポンス内の `data` が空です        | 再試行してください                                                            |
| 8   | `NO_IMAGE_DATA`         | `b64_json` フィールドが空です       | 再試行してください                                                            |
| 9   | `IMAGE_DOWNLOAD_FAILED` | 参照画像の URL をダウンロードできませんでした  | URL の到達性を確認してください                                                    |
| 10  | `EDIT_FAILED`           | 編集エンドポイントが non-200 を返しました  | 参照画像の形式、枚数（≤16）、および画像ごとのサイズ（≤50MB）を確認してください                          |

### 2段階コンテンツフィルタリング

GPT Image 2 は、Nano Banana Pro とは異なり、**2段階のコンテンツ安全フィルタリング**を使用します:

```text theme={null}
User request
    ↓
[Stage 1: Input Filter]
    ├── Blocked → HTTP 400 / 403 (moderation_blocked)
    │          ↑ Rewriting the prompt fixes it (free, not billed)
    ├── Passed ↓
[Model inference generates the image] (billed at this point)
    ↓
[Stage 2: Output Filter]
    ├── Blocked → HTTP 200 but empty b64_json (content_filter, already billed)
    ├── Passed ↓
Image returned (HTTP 200)
```

| 次元         | moderation\_blocked | content\_filter       |
| ---------- | ------------------- | --------------------- |
| トリガー段階     | 入力段階                | 出力段階                  |
| HTTP ステータス | 400                 | 200                   |
| 課金対象       | いいえ                 | **はい**（推論はすでに完了しています） |
| 修正方法       | prompt の文言を書き換える    | シーン全体を再設計する           |

### 一般的な moderation\_blocked のトリガー

| # | シナリオ                  | 注記                                  |
| - | --------------------- | ----------------------------------- |
| 1 | 実在人物のポートレート / セレブリティ名 | Elon Musk、Taylor Swift など           |
| 2 | 存命のアーティスト名            | Hayao Miyazaki = ブロック、Van Gogh = 許可 |
| 3 | 著作権で保護されたキャラクター / IP  | Spider-Man、Pikachu、Mickey Mouse など  |
| 4 | 暴力 / 流血表現 / 武器の詳細     | 自動的にブロックされます                        |
| 5 | 性的なほのめかし / 露出の多い服装    | bikini、tight-fitting、sexy などの記述     |
| 6 | 子どもの写実的な画像            | ほぼゼロの許容度                            |
| 7 | ヘイトシンボル / 政治的過激主義     | 自動的にブロックされます                        |

### APIYI 固有のエラー

| エラー                     | 原因                               | 修正方法                                      |
| ----------------------- | -------------------------------- | ----------------------------------------- |
| 401 + `invalid_api_key` | Key に `sk-` プレフィックスがない、または期限切れです | APIYI コンソールから完全な Key をコピーしてください           |
| 404 Not Found           | base\_url に `/v1` サフィックスがありません   | `https://api.apiyi.com/v1` であることを確認してください |
| 429 + 頻繁なトリガー           | APIYI の rate limit に達しました        | ルートを切り替えて再試行してください                        |
| 接続タイムアウト                | DNS / ネットワークの変動                  | 別のルートを試して再試行してください                        |

## 解像度/品質別の想定レイテンシ

| 解像度            | 品質 | 想定レイテンシ   | プラグインのタイムアウト |
| -------------- | -- | --------- | ------------ |
| 1K (1024×1024) | 低  | 3-8 秒     | 180 秒        |
| 1K (1024×1024) | 中  | 20-40 秒   | 360 秒        |
| 1K (1024×1024) | 高  | 145-280 秒 | 900 秒        |
| 2K (2048×2048) | 中  | 80-120 秒  | 360 秒        |
| 2K (2048×2048) | 高  | 200-250 秒 | 900 秒        |
| 4K (3840×2160) | 中  | 150-200 秒 | 360 秒        |
| 4K (3840×2160) | 高  | 300-600 秒 | 900 秒        |

> 推奨: 日常作業には `resolution=1K + quality=medium`（画像あたり 20-40 秒）を使用し、最終納品物には `resolution=4K + quality=high` を使用してください。
>
> `quality=auto`（省略するか auto に設定）では、プラグインは一律 360 秒のタイムアウトを適用し、実際の品質レベルは API が決定します。

## プラグインの完全なソースコード

以下は`coze-gptimage2.py`の完全なコードで、そのまま Coze IDE に貼り付けられます。使用前に変更が必要なのは、上部の OSS 設定だけです。

<Note>
  プラグインのソースは、寄稿された内容をそのまま保持しています。コメントとユーザー向けのエラーストリングは中国語で記述されており、ワークフローに合わせて自由にローカライズできます。
</Note>

```python coze-gptimage2.py theme={null}
from runtime import Args
from typings.gptimage2.gptimage2 import Input, Output
import requests
import base64
import io
import oss2
import uuid
import re


# ╔══════════════════════════════════════════════════════════╗
# ║           API易 线路配置（按需切换）                      ║
# ╚══════════════════════════════════════════════════════════╝
API_BASE = "https://api.apiyi.com/v1"
# 也可切换为: "https://vip.apiyi.com/v1" 或 "https://b.apiyi.com/v1"

# ╔══════════════════════════════════════════════════════════╗
# ║              阿里云 OSS 配置（请修改为你的值）            ║
# ╚══════════════════════════════════════════════════════════╝
ACCESS_KEY_ID = ""          # 填入你的阿里云 Access Key ID
ACCESS_KEY_SECRET = ""      # 填入你的阿里云 Access Key Secret
BUCKET_NAME = ""            # 填入你的阿里云 OSS Bucket 名称
ENDPOINT = "oss-cn-beijing.aliyuncs.com"  # 填入你的 OSS Endpoint

# ╔══════════════════════════════════════════════════════════╗
# ║       质量超时配置（GPT Image 2 基于 quality 分级）       ║
# ╚══════════════════════════════════════════════════════════╝
TIMEOUT = {
    "low": 180,     # 低质量快速出图（3-8 秒实际耗时）
    "medium": 360,  # 中等质量（20-40 秒实际耗时，推荐）
    "high": 900,    # 高质量精细渲染（145-280 秒实际耗时）
}

# ╔══════════════════════════════════════════════════════════╗
# ║     分辨率 → 尺寸映射表（宽高比 × 分辨率 → W×H）          ║
# ╚══════════════════════════════════════════════════════════╝
RESOLUTION_SIZES = {
    "1:1":  {"1K": "1024x1024", "2K": "2048x2048", "4K": "3840x2160"},
    "16:9": {"1K": "1536x1024", "2K": "2048x1152", "4K": "3840x2160"},
    "9:16": {"1K": "1024x1536", "2K": "1152x2048", "4K": "2160x3840"},
    "4:3":  {"1K": "1024x768",  "2K": "2048x1536", "4K": "3264x2448"},
    "3:2":  {"1K": "1536x1024", "2K": "2048x1360", "4K": "3456x2304"},
    "3:1":  {"1K": "1536x512",  "2K": "3072x1024", "4K": "3840x1280"},
    "1:3":  {"1K": "512x1536",  "2K": "1024x3072", "4K": "1280x3840"},
}


# ==============================
# OSS 上传工具
# ==============================

def upload_base64_to_oss(image_base64: str) -> str:
    """
    将 base64 图片上传到阿里云 OSS 并返回公网 URL
    支持带 data:image/...;base64, 前缀和纯 base64 两种情况
    """
    base64_str = re.sub(r"^data:image/[^;]+;base64,", "", image_base64)
    image_data = base64.b64decode(base64_str)
    image_io = io.BytesIO(image_data)

    auth = oss2.Auth(ACCESS_KEY_ID, ACCESS_KEY_SECRET)
    bucket = oss2.Bucket(auth, ENDPOINT, BUCKET_NAME)
    object_name = f"coze/gptimage2_{uuid.uuid4().hex}.png"
    bucket.put_object(object_name, image_io)

    return f"https://{BUCKET_NAME}.{ENDPOINT}/{object_name}"


# ==============================
# 工具函数
# ==============================

def get_size(aspect_ratio: str, resolution: str) -> str:
    """根据宽高比和分辨率获取推荐尺寸"""
    ratio_map = RESOLUTION_SIZES.get(aspect_ratio, RESOLUTION_SIZES["1:1"])
    return ratio_map.get(resolution, ratio_map.get("1K", "1024x1024"))


def guess_mime_from_url(url: str) -> str:
    """根据 URL 后缀猜测 MIME 类型"""
    url_lower = url.lower()
    if url_lower.endswith(".png"):
        return "image/png"
    if url_lower.endswith(".jpg") or url_lower.endswith(".jpeg"):
        return "image/jpeg"
    if url_lower.endswith(".webp"):
        return "image/webp"
    if url_lower.endswith(".gif"):
        return "image/gif"
    return "image/png"


# ==============================
# 核心：GPT Image 2 生图 / 编辑
# ==============================

def generate_image(prompt: str, aspect_ratio: str, resolution: str,
                   quality: str, apikey: str, output_format: str = "png",
                   moderation: str = "auto", image_urls=None):
    """
    GPT Image 2 文生图 / 图生图核心函数

    - image_urls 为空：纯文生图 → API易 /v1/images/generations（JSON）
    - image_urls 不为空：参考图编辑 → API易 /v1/images/edits（multipart/form-data）
    """

    size = get_size(aspect_ratio, resolution)
    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    # ── 分支 1：有参考图 → 图生图（编辑） ──
    if image_urls:
        return _generate_edit(prompt, size, quality, apikey,
                              output_format, moderation, image_urls, headers)

    # ── 分支 2：无参考图 → 文生图（/v1/images/generations，JSON）──
    payload = {
        "model": "gpt-image-2",
        "prompt": prompt,
        "size": size,
    }
    if quality and quality != "auto":
        payload["quality"] = quality
    if output_format and output_format != "png":
        payload["output_format"] = output_format
    if moderation and moderation != "auto":
        payload["moderation"] = moderation

    timeout_seconds = TIMEOUT.get(quality, 360)
    api_url = f"{API_BASE}/images/generations"

    try:
        response = requests.post(
            api_url,
            headers=headers,
            json=payload,
            timeout=timeout_seconds
        )

        # ── HTTP 错误分发 ──
        if response.status_code in (400, 403):
            try:
                err_body = response.json()
                err = err_body.get("error", {})
                err_msg = err.get("message", "")
            except Exception:
                err_msg = response.text

            if "moderation" in err_msg.lower() or response.status_code == 403:
                return {
                    "success": False,
                    "errorType": "MODERATION_BLOCKED",
                    "error": "❌ 内容安全审核不通过\n"
                             "您的提示词触发了内容安全策略，"
                             "请修改提示词后重试（不要用原提示词重试）",
                }
            return {
                "success": False,
                "errorType": "BAD_REQUEST",
                "error": f"❌ 请求参数错误: {err_msg[:500]}\n"
                         "常见原因：误传了 input_fidelity，或 background:transparent 配了 output_format:jpeg",
            }

        if response.status_code == 401:
            return {
                "success": False,
                "errorType": "INVALID_API_KEY",
                "error": "❌ API Key 无效\n请检查您的 API易 API 密钥是否正确，"
                        "或是否已过期。可在 https://api.apiyi.com/token 查看",
            }

        if response.status_code == 429:
            return {
                "success": False,
                "errorType": "RATE_LIMIT",
                "error": "❌ 请求频率超限\nAPI 调用过于频繁，"
                        "可尝试切换线路或降低并发",
            }

        if response.status_code in (500, 502, 503):
            return {
                "success": False,
                "errorType": "SERVER_ERROR",
                "error": f"❌ 服务端故障（HTTP {response.status_code}），"
                        "请稍后重试或尝试切换线路",
            }

        if response.status_code != 200:
            return {
                "success": False,
                "errorType": "HTTP_ERROR",
                "error": f"HTTP {response.status_code}: "
                        f"{(response.text or '')[:500]}",
            }

        # ── JSON 解析 ──
        try:
            data = response.json()
        except ValueError:
            return {
                "success": False,
                "errorType": "INVALID_JSON",
                "error": "响应不是有效 JSON",
            }

        images = data.get("data", [])
        if not isinstance(images, list) or len(images) == 0:
            return {
                "success": False,
                "errorType": "NO_DATA",
                "error": "生成失败：未返回图片数据（可能触发了 output filter）",
                "response": data,
            }

        # ── 提取 b64_json（API易 返回纯 base64，无 data:image 前缀）──
        image_b64 = images[0].get("b64_json", "")
        if not image_b64:
            return {
                "success": False,
                "errorType": "NO_IMAGE_DATA",
                "error": "生成失败：b64_json 为空（可能被 content_filter 过滤）",
                "response": data,
            }

        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "errorType": "TIMEOUT",
            "error": f"图片生成请求超时"
                     f"（超过 {timeout_seconds} 秒，"
                     f"当前 quality={quality}）\n"
                     f"建议降低 quality 或 resolution 重试",
        }
    except Exception as e:
        return {
            "success": False,
            "errorType": "EXCEPTION",
            "error": f"图片生成请求失败: {str(e)}",
        }


def _generate_edit(prompt: str, size: str, quality: str,
                   apikey: str, output_format: str, moderation: str,
                   image_urls: list, headers: dict):
    """
    GPT Image 2 图生图（编辑）子函数
    调用 API易 /v1/images/edits 端点（multipart/form-data 方式上传参考图）

    注意：API易 的 /v1/images/edits 要求 Content-Type: multipart/form-data，
    通过 -F "image[]=@file" 方式传图，不支持 JSON base64 data URI。
    参考图数量最多 16 张，单张 ≤ 50MB（建议压到 1.5MB 以内）。
    """

    # ── 下载参考图到内存 ──
    image_files = []
    for i, url in enumerate(image_urls):
        try:
            resp = requests.get(url, timeout=180)
            if resp.status_code != 200:
                return {
                    "success": False,
                    "errorType": "IMAGE_DOWNLOAD_FAILED",
                    "error": f"图片获取失败（{url}）HTTP {resp.status_code}",
                }
            mime = guess_mime_from_url(url)
            ext = mime.split("/")[-1]  # png / jpeg / webp
            if ext == "jpeg":
                ext = "jpg"
            image_files.append(
                ("image[]", (f"image{i}.{ext}", io.BytesIO(resp.content), mime))
            )
        except Exception as e:
            return {
                "success": False,
                "errorType": "IMAGE_DOWNLOAD_FAILED",
                "error": f"图片获取失败（{url}）: {e}",
            }

    # ── 构造 multipart/form-data 请求（-F 方式）──
    form_data = {
        "model": "gpt-image-2",
        "prompt": prompt,
    }
    if size:
        form_data["size"] = size
    if quality and quality != "auto":
        form_data["quality"] = quality
    if output_format and output_format != "png":
        form_data["output_format"] = output_format
    if moderation and moderation != "auto":
        form_data["moderation"] = moderation

    # multipart/form-data 不传 Content-Type（让 requests 自动生成 boundary）
    auth_headers = {
        "Authorization": headers["Authorization"],
    }

    timeout_seconds = TIMEOUT.get(quality, 360)
    api_url = f"{API_BASE}/images/edits"

    try:
        response = requests.post(
            api_url,
            headers=auth_headers,
            data=form_data,
            files=image_files,
            timeout=timeout_seconds
        )

        # ── 错误处理 ──
        if response.status_code in (400, 403):
            try:
                err = response.json().get("error", {})
                err_msg = err.get("message", "")
            except Exception:
                err_msg = response.text[:500]
            if "moderation" in err_msg.lower() or response.status_code == 403:
                return {
                    "success": False,
                    "errorType": "MODERATION_BLOCKED",
                    "error": "❌ 内容安全审核不通过",
                }
            return {
                "success": False,
                "errorType": "EDIT_FAILED",
                "error": f"图片编辑请求参数错误: {err_msg[:500]}\n"
                         "常见原因：误传了 input_fidelity、"
                         "超过 16 张参考图或单张超过 50MB",
            }

        if response.status_code == 401:
            return {
                "success": False,
                "errorType": "INVALID_API_KEY",
                "error": "❌ API Key 无效",
            }

        if response.status_code == 429:
            return {
                "success": False,
                "errorType": "RATE_LIMIT",
                "error": "❌ 请求频率超限，可尝试切换线路重试",
            }

        if response.status_code in (500, 502, 503):
            return {
                "success": False,
                "errorType": "SERVER_ERROR",
                "error": f"❌ 服务端故障（HTTP {response.status_code}）",
            }

        if response.status_code != 200:
            try:
                err = response.json().get("error", {}).get("message", "")
            except Exception:
                err = response.text[:500]
            return {
                "success": False,
                "errorType": "EDIT_FAILED",
                "error": f"图片编辑失败（HTTP {response.status_code}）: {err}",
            }

        # ── 提取图片（b64_json 是纯 base64，无前缀）──
        data = response.json()
        images = data.get("data", [])
        if not images:
            return {
                "success": False,
                "errorType": "NO_DATA",
                "error": "编辑结果为空",
            }

        image_b64 = images[0].get("b64_json", "")
        if not image_b64:
            return {
                "success": False,
                "errorType": "NO_IMAGE_DATA",
                "error": "编辑结果图片数据为空",
            }

        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "errorType": "TIMEOUT",
            "error": f"图片编辑请求超时（超过 {timeout_seconds} 秒）",
        }
    except Exception as e:
        return {
            "success": False,
            "errorType": "EXCEPTION",
            "error": f"图片编辑请求失败: {str(e)}",
        }


# ==============================
# Coze Node 入口
# ==============================

def handler(args: Args[Input]) -> Output:
    """
    Coze / GPT Image 2（API易 代理）节点入口

    - args.input.cleantext:    用户文字提示词
    - args.input.fileurls:     参考图 URL 列表（用于图生图）
    - args.input.aspect_ratio: 宽高比，如 "1:1" / "16:9" / "9:16"
    - args.input.resolution:   分辨率，如 "1K" / "2K" / "4K"
    - args.input.quality:      质量等级，如 "low" / "medium" / "high"（默认 auto）
    - args.input.moderation:   审核强度，如 "auto" / "low"（默认 auto）
    - args.input.output_format: 输出格式，如 "png" / "jpeg" / "webp"（默认 png）
    - args.input.apikey:       API易 API Key（sk-开头）
    """
    API_KEY = args.input.apikey
    cleantext = args.input.cleantext or ""
    fileurls = args.input.fileurls or []
    aspect_ratio = args.input.aspect_ratio or "1:1"
    resolution = args.input.resolution or "1K"
    quality = getattr(args.input, 'quality', None) or "auto"
    output_format = getattr(args.input, 'output_format', None) or "png"
    moderation = getattr(args.input, 'moderation', None) or "auto"

    prompt = cleantext.strip()
    if not prompt:
        prompt = "根据参考图片进行合理的编辑与优化。"

    # 调用 GPT Image 2 生图 / 编辑
    result = generate_image(
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        resolution=resolution,
        quality=quality,
        apikey=API_KEY,
        output_format=output_format,
        moderation=moderation,
        image_urls=fileurls if fileurls else None
    )

    if result["success"]:
        image_base64 = result["image_data"]
        oss_url = upload_base64_to_oss(image_base64)
        return {
            "analysis": "图片生成成功",
            "url": oss_url,
            "error": None,
        }
    else:
        return {
            "analysis": "图片生成失败",
            "url": None,
            "error": result.get("error", "未知错误"),
        }
```

## 任意: gpt-image-2-all 高速モード

\*\*より高速な生成（30〜60秒）\*\*が必要で、サイズパラメータの制御を気にしない場合は、プラグインを APIYI の `gpt-image-2-all`（逆版）に切り替え、Chat Completions エンドポイント経由で呼び出せます。このモードは画像1枚あたり \$0.03 で、画像 URL を直接返すため、base64 のパースは不要です。

コアとなる変更点は、`generate_image` 関数を置き換えるだけです。

```python theme={null}
def generate_image_chat(prompt: str, apikey: str, image_urls=None):
    """
    gpt-image-2-all 快速模式（通过 API易 Chat Completions 端点）
    价格 $0.03/张，出图 30-60s，尺寸由 prompt 描述驱动
    """
    api_url = f"{API_BASE}/chat/completions"
    headers = {
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json"
    }

    # 构造消息
    if image_urls:
        # 图生图：多模态 message
        content = [{"type": "text", "text": prompt}]
        for url in image_urls:
            content.append({
                "type": "image_url",
                "image_url": {"url": url}
            })
    else:
        # 文生图：纯文本 message
        content = prompt

    payload = {
        "model": "gpt-image-2-all",
        "messages": [{"role": "user", "content": content}],
    }

    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=300)
        if response.status_code != 200:
            err = response.json().get("error", {}).get("message", response.text)
            return {"success": False, "errorType": "API_ERROR", "error": str(err)[:500]}

        data = response.json()
        content_text = data["choices"][0]["message"]["content"]

        # 从 Markdown ![image](url) 中提取图片 URL
        match = re.search(r'!\[[^\]]*\]\((.*?)\)', content_text)
        if not match:
            return {"success": False, "errorType": "NO_URL", "error": "未从响应中提取到图片 URL"}

        image_url = match.group(1)

        # 如果是 base64 data URL，直接使用
        if image_url.startswith("data:image/"):
            return {"success": True, "image_data": image_url.split(",", 1)[1]}

        # 如果是 HTTP URL，下载图片 → 转 base64
        img_resp = requests.get(image_url, timeout=60)
        if img_resp.status_code != 200:
            return {"success": False, "errorType": "DOWNLOAD_FAILED", "error": f"下载图片失败: HTTP {img_resp.status_code}"}

        image_b64 = base64.b64encode(img_resp.content).decode("utf-8")
        return {"success": True, "image_data": image_b64}

    except requests.exceptions.Timeout:
        return {"success": False, "errorType": "TIMEOUT", "error": "请求超时"}
    except Exception as e:
        return {"success": False, "errorType": "EXCEPTION", "error": str(e)}
```

> 切り替え方法: `handler()` の `generate_image(...)` を `generate_image_chat(...)` に置き換えます。必要な入力は `prompt`、`apikey`、および任意で `fileurls` だけです。

## Coze ワークフローでの使い方

プラグインを公開したら、プラグインノードを Coze のワークフローエディタにドラッグして、次のように接続します:

```text theme={null}
Start node (user enters prompt + images)
    ↓
Prompt/image splitter (code node that splits the user message into cleantext and fileurls)
    ↓
Per-user apikey dispatch (dictionary lookup that maps each user to their APIYI API Key)
    ↓
gptimage2 plugin node (this plugin)
    ↓
Success / failure branches
    ↓
End node (outputs url or error)
```

<Tip>
  これを [Feishu Base AI 画像生成ソリューション](/ja/scenarios/ecosystem/feishu-bitable-image-shortcut) と組み合わせることをおすすめします。組み合わせることで、運用/デザインチームのメンバーは **Feishu の表にプロンプトを入力するだけで画像を一括生成でき**、コードを開く必要はありません。あとは、そのソリューション内の Nano Banana Pro プラグインをこのプラグインに置き換えるだけです。
</Tip>

## Nano Banana Pro との比較

| Dimension        | Nano Banana Pro (APIYI)                       | GPT Image 2 (APIYI)                          |
| ---------------- | --------------------------------------------- | -------------------------------------------- |
| モデル              | `gemini-3-pro-image-preview`                  | `gpt-image-2`                                |
| ゲートウェイ           | APIYI（同一プラットフォーム、同一キー）                        | APIYI（同一プラットフォーム、同一キー）                       |
| テキストから画像のエンドポイント | Gemini `generateContent` (JSON)               | `/v1/images/generations` (JSON)              |
| 画像から画像のエンドポイント   | 同一エンドポイント + inline\_data (JSON)               | `/v1/images/edits` (**multipart/form-data**) |
| 解像度スキーム          | 1K / 2K / 4K（固定）                              | 柔軟な解像度（最大 3840×2160）                         |
| タイムアウト戦略         | 解像度に応じて（360s / 600s / 1200s）                  | 品質に応じて（180s / 360s / 900s）                   |
| コンテンツフィルタリング     | 単段階（ZERO\_CANDIDATES\_TOKEN + TEXT\_RESPONSE） | 二段階（HTTP 400/403 + content\_filter）          |
| 参照画像数            | 無制限（inline\_data）                             | 最大 16                                        |
| 透過背景             | ✅ 対応                                          | ✅ モデルは対応しています（プラグインではそのパラメータを公開していません）       |
| テキスト描画           | 良好                                            | 非常に優秀（99%以上）                                 |
| 出力圧縮             | 未対応                                           | ✅ jpeg/webp 圧縮                               |
| モデレーション制御        | 未対応                                           | ✅ moderation パラメータ（auto/low）                 |

## よくある質問

<AccordionGroup>
  <Accordion title="完全なソースコードはどこにありますか？そのままコピーできますか？">
    はい。このページの「フルプラグインソースコード」セクションには、完全な `coze-gptimage2.py` が含まれています。**冒頭の OSS 設定と API\_BASE を変更するだけで**、そのまま Coze IDE に貼り付けてください — ほかに依頼するものはありません。

    ほかにも必要な場合は：

    * Feishu のフィールドショートカットコード → [Feishu Base AI画像生成ソリューション](/ja/scenarios/ecosystem/feishu-bitable-image-shortcut) の「Feishu フィールドショートカット完全ソースコード」セクションを参照してください
    * Nano Banana Pro プラグイン → [Nano Banana Pro Coze プラグイン](/ja/scenarios/ecosystem/coze-nanobanana-plugin) を参照してください
  </Accordion>

  <Accordion title="apikey はなぜ入力として渡して、ハードコードしないのですか？">
    そうすることで、各ユーザーに異なる APIYI の APIキー を割り当てられます。Coze のワークフローでは、先頭に「ユーザーごとの apikey 振り分け」辞書ノードを置き、呼び出し元の名前をそれぞれの APIキー に対応付けてください — 利用状況の集計とアクセス制御に便利です。
  </Accordion>

  <Accordion title="APIYI の APIキー は公式 OpenAI APIキー とどう違いますか？">
    APIYI は中国本土から直接接続できるゲートウェイです。APIキー の先頭も `sk-` ですが、次の点が異なります：

    * 中国本土から直接アクセスでき、VPN は不要です
    * [APIYI コンソール](https://api.apiyi.com/token) で申請・管理します
    * 日次/月次のクォータ制限をサポートしており、コスト管理が容易です
    * 1つの APIキー で Nano Banana Pro と GPT Image 2 の両方に対応します
  </Accordion>

  <Accordion title="3つのルートの違いは何ですか？">
    3つのルートは機能的に同一です — 同じ APIキー でどれでも使用できます：

    | ドメイン            | 説明        |
    | --------------- | --------- |
    | `api.apiyi.com` | デフォルトルート  |
    | `vip.apiyi.com` | VIPルート    |
    | `b.apiyi.com`   | バックアップルート |

    切り替えるには、コード内の `API_BASE` 変数を変更するだけです。
  </Accordion>

  <Accordion title="なぜ base64 を直接返さず、OSS を経由するのですか？">
    下流の Coze ワークフローノード（特に Feishu のフィールドショートカット）は、結果を画像添付ファイルに変換するために、たいてい **アクセス可能な URL** を必要とします。base64 を直接返すと、データがワークフロー内を往復することになり、パフォーマンスが悪く、Feishu 側でも直接レンダリングできません。OSS リンクは長期保存や外部共有にも便利です。
  </Accordion>

  <Accordion title="MODERATION_BLOCKED エラーはどう対処すればよいですか？">
    これは、入力 prompt または参照画像がコンテンツ安全性フィルターをトリガーしたことを意味します。このエラーは**再試行不要**です — 再試行しても同じ結果になります。対処案：

    1. prompt の文言を書き換える
    2. 実在の人物名、著作権のあるキャラクター名、存命のアーティスト名を避ける
    3. 性的ほのめかし、暴力、流血描写、その他のセンシティブな説明を避ける
  </Accordion>

  <Accordion title="NO_IMAGE_DATA または NO_DATA はどうトラブルシュートすればよいですか？">
    これは通常、モデルの推論は完了している（すでに課金済み）が、出力がコンテンツ安全性フィルター（`content_filter`）でブロックされたことを意味します。対処案：

    1. 文言を微調整するのではなく、ビジュアルシーン全体を再設計する
    2. まったく別の prompt 方向を試す
    3. 品質を下げると、より厳しい出力フィルターを通過できる場合があります
  </Accordion>

  <Accordion title="高品質だとタイムアウトが続きますか？">
    GPT Image 2 の高品質では、1K でも 145〜280 秒かかり、4K では 600 秒を超える場合があります。このプラグインでは高品質向けにすでに 900 秒のタイムアウトを設定しています。それでもタイムアウトする場合は：

    1. まず `quality=medium` で prompt をデバッグする
    2. APIYI コンソールでレート制限を確認する
    3. ルートを切り替えて再試行する
    4. 同時実行数を減らす
    5. `gpt-image-2-all` モード（1画像あたり30〜60秒）を検討する
  </Accordion>

  <Accordion title="透過背景はサポートされていますか？">
    **モデルはサポートしていますが、このプラグインではまだパラメータを公開していません。** 2026-08-21 以降、`gpt-image-2` は `background: "transparent"` を受け付け、API を直接呼び出すと本物のアルファチャネル画像が返ります — [透過背景の画像をどう生成しますか](/ja/faq/image-transparent-background) をご覧ください。

    プラグイン内で透過を実現するには 2 つの方法があります。プラグインのソースを編集して、リクエストボディに `"background": "transparent"` を追加する（その際、`output_format` が `png` または `webp` であることを確認する）、または [Nano Banana Pro プラグイン](/ja/scenarios/ecosystem/coze-nanobanana-plugin) に切り替えてください。
  </Accordion>

  <Accordion title="thinking の reasoning-depth パラメータはサポートされていますか？">
    **いいえ。** APIYI の公式リレー gpt-image-2 のパラメータ一覧は OpenAI のものと完全には一致しておらず、`thinking` は APIYI がサポートするパラメータに含まれていません。出力品質を細かく制御するには、代わりに `quality` パラメータ（low / medium / high / auto）を使用してください。

    その他の未対応パラメータは次のとおりです：

    * `response_format` — レスポンスは常に `b64_json` を返します
    * `n` — 1 に固定されています
    * `background: "transparent"` — **モデルはサポートしています**が、このプラグインではパラメータを公開していません。ソースを編集して渡してください
    * `input_fidelity` — high に固定されています。**渡すと 400 エラーになります**
  </Accordion>

  <Accordion title="GPT Image 2 と Nano Banana Pro のどちらを選べばよいですか？">
    どちらのプラグインも**同じ APIYI プラットフォーム**を使用しており、1つの APIキー で両方に使えます。推奨は次のとおりです：

    | シナリオ                     | 推奨                                                 |
    | ------------------------ | -------------------------------------------------- |
    | 文字描画の要求が高い場合（ポスター、表紙、UI） | GPT Image 2（文字精度 > 99%）                            |
    | 4K の超高解像度                | GPT Image 2（最大 3840×2160）                          |
    | 複数の参照画像を使った編集            | GPT Image 2（最大 16 枚）                               |
    | 出力圧縮（ファイルサイズを小さくする）      | GPT Image 2（jpeg / webp 圧縮）                        |
    | 透過背景                     | どちらでも可（GPT Image 2 では `background` を通すためにソース編集が必要） |
    | 予算重視                     | GPT Image 2-All (\$0.03/画像)                        |
    | 中国語向けの prompt            | GPT Image 2-All（逆版）                                |
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="Feishu Base AI画像生成ソリューション" icon="table" href="/ja/scenarios/ecosystem/feishu-bitable-image-shortcut">
    このプラグインに最適な相棒です: Coze のワークフロー全体を Feishu Base に接続し、運用チームのメンバーが表に入力するだけで画像を一括生成できます
  </Card>

  <Card title="Nano Banana Pro Coze プラグイン" icon="banana" href="/ja/scenarios/ecosystem/coze-nanobanana-plugin">
    もう一つの Coze 画像生成ソリューションで、Gemini 3 Pro Image をベースにしており、GPT Image 2 と同じ APIYI Key を共有します
  </Card>

  <Card title="APIYI GPT Image 2 ドキュメント" icon="book" href="/ja/api-capabilities/gpt-image-2/overview">
    APIYI の公式リレー GPT Image 2 の完全なドキュメント、パラメータリファレンス、コード例
  </Card>

  <Card title="APIYI GPT Image 2-All ドキュメント" icon="code" href="/en/api-capabilities/gpt-image-2-all/chat-completions">
    APIYI の逆向き版 Chat Completions エンドポイントのドキュメント (\$0.03/画像、1画像あたり30〜60秒)
  </Card>

  <Card title="APIYI コンソール" icon="settings" href="https://api.apiyi.com/token">
    API キーを管理し、使用状況と残高を確認し、クォータ制限を設定します
  </Card>

  <Card title="GPT Image 2 の一般的なエラー修正" icon="circle-question-mark" href="https://help.apiyi.com/fix-gpt-image-2-moderation-blocked-400-error.html">
    moderation\_blocked 400 エラーの診断と軽減策
  </Card>
</CardGroup>
