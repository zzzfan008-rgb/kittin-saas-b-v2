> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MAI-Image 2.6 画像生成・編集

> Microsoft MAI-Image 2.6（MAI-Image-2.6 / MAI-Image-2.6-Flash）の完全ガイド：テキストからの画像生成および参照画像による編集（合成用に1〜5枚の画像）、最大1536×1536エリアまでのカスタム幅/高さ指定、強力な中国語テキストレンダリング、サイズに関わらず1画像あたり一律$0.12 / $0.06の価格設定。

## 概要

**MAI-Image 2.6** は、Microsoft AIの自社開発による画像生成モデルであり、2026年9月4日にリリースされ、Microsoft Foundryでパブリックプレビューとして利用可能です。リリース時点で、**Arenaにおいてテキスト画像生成と画像編集の両部門で第2位**、**Artificial Analysisにおいて画像編集部門で第1位**を獲得しました（Microsoftの発表による、2026年9月4日時点）。

APIYI では、Microsoftの公式チャネルを通じて2つのバリアントを提供しています。どちらも同じエンドポイントとパラメータを共有しています:

* **`MAI-Image-2.6`**: 品質と精度を追求して調整されたフラッグシップモデル
* **`MAI-Image-2.6-Flash`**: 高速バリアント。MicrosoftによるとGPT-Image-2-Mediumより2.8倍高速に生成でき、高スループットな本番環境のワークロードに適しています

<Note>
  **主な特徴**: **優れた中国語テキストレンダリング**（看板、対聯、手書き文字が文字単位で正確に出力されます）、**忠実度の高い編集**（指示された部分のみが変更され、残りはピクセル単位で同一のまま維持されます）、`width` + `height` による自由なキャンバス設定（最大1536×1536の面積まで対応）、そして**サイズに関わらない画像1枚あたりの定額課金**。1024×1024の画像生成にかかる時間は、Flash で約17秒、2.6 で約30秒です。
</Note>

<Warning>
  **📌 開始前に知っておくべき3つのポイント**

  1. **サポートされているエンドポイントは2つのみです**: `/v1/images/generations`（テキスト画像生成、JSON）および `/v1/images/edits`（編集、`multipart/form-data`）。**`/v1/chat/completions` および `/v1/responses` はサポートされておらず**、404を返します。
  2. **`response_format`、`seed`、`negative_prompt` は送信しないでください**。3つともすべて即座に400を返します。レスポンスは常に `data[0].b64_json`（PNG）です。
  3. **サイズは `size` ではなく `width` + `height` で設定してください**。テキスト画像生成エンドポイントでは `size` は暗黙的に無視され、常に1024×1024が返されます。
</Warning>

<Info>
  すべての画像APIは**同期式**です。非同期タスクIDはありません。クライアントが切断された場合、結果は失われますがリクエストは課金されます。このモデルには長めのタイムアウト時間を設定してください。[画像APIの基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices)をご覧ください。
</Info>

<CardGroup cols={2}>
  <Card title="テキスト画像生成API" icon="wand-sparkles" href="/ja/api-capabilities/mai-image/text-to-image">
    インタラクティブなプレイグラウンドで、テキスト prompt から画像を生成します。
  </Card>

  <Card title="画像編集API" icon="image" href="/ja/api-capabilities/mai-image/image-edit">
    1〜5枚の参照画像と指示をアップロードし、複数画像を合成します。プレイグラウンド付き。
  </Card>
</CardGroup>

## AI エージェントに統合を任せる

<Note>
  Codex / Claude Code / Cursor で開発している場合は、以下の prompt をそこにコピーしてください。エージェントはまずこのページのプレーンテキスト版を取得し（任意のドキュメント URL の末尾に `.md` を追加）、ご利用のスタック用のコードを作成します。タイムアウト、**400を返す3つのパラメータ**、`size` ではなく `width`/`height` の使用、ファイルアップロード限定の編集など、よくある落とし穴が明記されています。
</Note>

<Prompt description="コーディングエージェントに MAI-Image 2.6 のテキストからの画像生成および画像編集の統合やデバッグを行わせます。Codex、Claude Code、Cursor などにコピー＆ペーストしてください。" icon="bot" actions={["copy"]}>
  このプロジェクトに Microsoft MAI-Image 2.6 のテキストからの画像生成および画像編集を統合（またはデバッグ）してください。

  コードを書く前にドキュメントを読んでください：このページのプレーンテキスト版を取得するには [https://docs.apiyi.com/en/api-capabilities/mai-image/overview.md](https://docs.apiyi.com/en/api-capabilities/mai-image/overview.md) を fetch してください。詳細なパラメータについては、同様にテキストからの画像生成および画像編集ページの末尾に `.md` を追加してください。

  要件：

  1. モデル名：フラッグシップは `MAI-Image-2.6`、高速版は `MAI-Image-2.6-Flash` です。**モデル名は大文字と小文字を区別します**。すべて小文字の名前を指定すると 503 が返され、サービス停止のように見えますが、単に名前が間違っているだけです。

  2. エンドポイント：`/v1/images/generations`（JSON）および `/v1/images/edits`（`multipart/form-data`）のみを使用してください。**`/v1/chat/completions` や `/v1/responses` は呼び出さないでください**。404 が返されます。

  3. タイムアウト：クライアントのタイムアウトは Flash では 120 秒、2.6 では 180 秒に設定してください。1024×1024 の画像の実測値は約 17 秒 / 30 秒ですが、ピーク時や大きなサイズではさらに時間がかかります。画像 API はタスク ID のない同期処理です。クライアントが切断された場合、結果は失われますがリクエストには課金されます。リバースプロキシ、ゲートウェイ、サーバーレスの実行上限時間も引き上げてください。

  4. 禁止パラメータ：**`response_format`、`seed`、`negative_prompt` は絶対に送信しないでください**。それぞれ 400 `Invalid parameters` を返します。gpt-image / DALL·E から移行したコードでは `response_format="b64_json"` が明示的に設定されていることが多いため、削除してください。`quality`、`output_format`、`background`、`style` は警告なしに無視されるため、これらも削除してください。

  5. レスポンス処理：レスポンスは常に `data[0].b64_json` であり、`data:` プレフィックスのないプレーンな base64 で、PNG にデコードされます（1024×1024 で約 1.5〜1.7 MB）。`url` モードはありません。`usage` にはプレースホルダーの値が入っており、照合には使用できません。コンソールの請求が正式なものです。

  6. サイズ：`width` + `height`（整数、常にペアで指定）を使用してください。各辺は 768 以上である必要があり、幅 × 高さは 2,359,296（1536×1536 の面積）を超えてはなりません。16 の倍数でない値は、16 の倍数に切り捨てられます。どちらも送信しない場合、デフォルトは 1024×1024 です。**テキストからの画像生成エンドポイントでは、`size` は警告なしに無視されます。**

  7. 生成枚数：テキストからの画像生成は常に 1 枚の画像を返し、`n` は効果がありません。複数枚必要な場合は並列リクエストを送信してください。編集エンドポイントでは `n` が機能し、画像ごとに課金されます。

  8. 編集：参照画像は multipart の**ファイルとしてアップロード**する必要があり、フィールド名は `image` です。**URL および base64 JSON 入力はサポートされていません**（400）。**複数画像の融合（Multi-image fusion）は 1〜5 枚の参照画像を受け付けます**：複数枚ある場合は、`image[]` フィールドを繰り返します（OpenAI SDK の場合はリスト `image=[f1, f2]` を渡します）。画像はアップロード順に image 1、image 2、… と番号付けされます。prompt 内ではこれらを「image N」として参照してください。5 枚を超えると 400 が返されます。**`image` + `image2` のような連番のフィールド名は使用しないでください**：2 枚目の画像が破棄されます（200 が返されますが、最初の画像のみが使用されます）。参照画像の枚数によって価格は変わりません。JPEG / PNG / WebP のみ受け付けられます。マスクはサポートされていません。アップロード前に圧縮してください：1.5 MB を超えるファイルのみを対象とし、長辺を 2048 px 以下に縮小し、品質 0.9 で再エンコードし、圧縮に失敗した場合は元のファイルにフォールバックします。

  9. エラー：コンテンツモデレーションは 400 `content_safety_violation` を返します（実在の著名人、グロテスク表現、有名な IP キャラクター、ヌードはブロックされます）。prompt を変更してください。再試行しても無意味です。範囲外のサイズの場合は、メッセージに正確な制約事項が含まれた 400 `unsupported_request_value` が返されます。

  10. キーは環境変数 `APIYI_API_KEY` から読み込み、base\_url は [https://api.apiyi.com/v1](https://api.apiyi.com/v1) を使用してください。決してハードコードしたり、git にコミットしたりしないでください。

  11. 完了したら、実際にテキストからの画像生成呼び出しと編集呼び出しを 1 回ずつ実行し、両方の呼び出しの結果とコストを表示してください。
</Prompt>

<Accordion title="この prompt で回避できる問題">
  | 要件 | 回避できる落とし穴 |
  | - | - |
  | `response_format` の削除 | 移行されたコードで最も一般的な明示的パラメータ。送信すると 400 が返され、バッチ全体が失敗します |
  | `size` ではなく `width` / `height` | `size` はテキストからの画像生成では警告なしに無視されます。1536×1024 を要求したつもりでも、1024×1024 の正方形が生成されます |
  | 編集時はファイルアップロードのみ | OpenAI 方式で画像 URL または base64 JSON を渡すと 400 が返されます |
  | 複数画像の場合は `image[]` を繰り返し、`image2` は絶対に使用しない | `image` + `image2` は 200 を返しますが 2 枚目の画像が破棄され、欠落しているコンテンツは見落としがちです |
  | chat / responses は使用不可 | チャットクライアントはすべてのモデル名に対してチャットリクエストを送信しますが、ここでは 404 が返されます |
  | モデルごとに余裕を持ったタイムアウト設定 | 切断されたリクエストも課金されます。[画像 API の基本とベストプラクティス](/ja/api-capabilities/image-api-best-practices) を参照してください |
</Accordion>

## APIYIでMAI-Image 2.6を利用する理由

<CardGroup cols={2}>
  <Card title="Microsoft公式チャネル" icon="shield-check">
    Microsoft公式チャネルを通じて提供されます。モデルはMicrosoft Foundryの同名モデルと同一です。標準の`/v1/images/generations`および`/v1/images/edits`エンドポイントに対応しており、レスポンスの形式はOpenAI Images APIと同様です。
  </Card>

  <Card title="画像単位の料金体系" icon="receipt">
    プロバイダーはtoken単位で課金するため、大きな画像ほどコストが高くなります。一方、APIYIでは**サイズに関係なく画像1枚あたりの定額料金**を採用しています。768×768でも1536×1536でも同じ料金であり、参照画像が1枚でも5枚でも編集料金は変わらないため、画像単位で予算を管理できます。
  </Card>

  <Card title="どこからでもアクセス可能" icon="globe">
    \*\*Azureアカウントや海外サーバーは不要です。\*\*データセンター、自宅ネットワーク、海外ノードから直接`api.apiyi.com`にアクセスでき、1つのキーですべてのモデルを利用できます。
  </Card>

  <Card title="充実したモデルラインナップ" icon="layers">
    さまざまなユースケースに合わせて、[GPT-Image-2](/ja/api-capabilities/gpt-image-2/overview)、[Nano Banana 2](/ja/api-capabilities/nano-banana-2-image/overview)、[Seedream](/ja/api-capabilities/seedream-image/overview)、[FLUX](/ja/api-capabilities/flux/overview)と組み合わせてご利用いただけます。
  </Card>
</CardGroup>

## 主な機能

<CardGroup cols={2}>
  <Card title="中国語テキストのレンダリング" icon="languages">
    中国語の店舗看板、対聯、黒板の手書き文字などが正確な文字で出力されます。ポスター、商品画像、グッズの制作に適しています。
  </Card>

  <Card title="高精度な編集" icon="wand">
    「ティーポットをコバルトブルーにする」といった指示でもティーポットのみが変更され、寸法ラベルやその他のオブジェクトはピクセル単位で同一のまま維持されます。
  </Card>

  <Card title="カスタムキャンバス" icon="maximize">
    任意の`width` + `height`の組み合わせに対応し、長辺は最大3072（例：3072×768のバナー）、総面積の上限は1536×1536です。
  </Card>

  <Card title="2つの速度ティア" icon="zap">
    1024×1024の場合、Flashで約17秒、2.6で約30秒かかります。10件の同時実行数でもレイテンシは安定して維持されます。
  </Card>
</CardGroup>

### サンプル結果

**中国語テキストのレンダリング**（`MAI-Image-2.6-Flash`、APIYIへの来訪者を歓迎する中国語の看板を指定したprompt）：看板、提灯、対聯、黒板のすべてにおいて判読可能な中国語が表示されています。

<Frame>
  <img src="https://mintcdn.com/apiyillc/_zXMTnA1u6gpoDyM/images/mai-image-zh-text-render.jpg?fit=max&auto=format&n=_zXMTnA1u6gpoDyM&q=85&s=7b83a1cb725f1391524c334b7399ea61" alt="MAI-Image-2.6-Flashの中国語テキストレンダリング：中国語の歓迎看板がある伝統的な茶屋" width="768" height="780" data-path="images/mai-image-zh-text-render.jpg" />
</Frame>

**参照画像編集**（`MAI-Image-2.6-Flash`、指示：「ティーポットを濃いコバルトブルーの釉薬に変更し、その他はすべて同じに保つ」）：左が元画像、右が結果です。ティーポットの色のみが変更され、寸法ラベルやその他のオブジェクトは変更されていません。

<Frame>
  <img src="https://mintcdn.com/apiyillc/_zXMTnA1u6gpoDyM/images/mai-image-edit-teaset.jpg?fit=max&auto=format&n=_zXMTnA1u6gpoDyM&q=85&s=c86dc86c5aadf0173e19102433c01f49" alt="MAI-Image-2.6-Flashの編集例：ティーポットの色がクリーム色からコバルトブルーに変更され、その他はすべて未変更" width="1048" height="532" data-path="images/mai-image-edit-teaset.jpg" />
</Frame>

## 料金

| モデル | 位置付け | APIYI 価格 | 課金 |
| - | - | - | - |
| **`MAI-Image-2.6`** | フラグシップ、品質重視 | **\$0.12 / 画像** | 1画像あたり、サイズ不問 |
| **`MAI-Image-2.6-Flash`** | 高速、スループット重視 | **\$0.06 / 画像** | 1画像あたり、サイズ不問 |

<Note>モデルの価格は変更される場合があります。上記の表は参考用であり、上部ナビゲーションの**モデル価格**タブが正式な情報となります：[モデル価格](/en/models/index)。</Note>

<Info>
  **課金に関する注意事項**

  * **サイズに関わらず1画像あたり**: 768×768と1536×1536は同額であり、promptの長さは価格に影響しません。
  * **画像編集はText-to-Imageと同額**: 出力画像数に応じて課金され、**参照画像が1枚でも5枚でも同額**です。編集エンドポイントでの`n=2`は2画像分として課金されます。
  * **400エラーで失敗したリクエスト**（モデレーションまたは無効なパラメータ）では画像は生成されません。
  * **レスポンス内の`usage`フィールドと照合しないでください**: `prompt_tokens`は常に1000 × 画像数のプレースホルダーです。コンソールの課金情報が正式な情報となります。
  * [チャージボーナスキャンペーン](/ja/faq/recharge-promotions)と併用可能です。
</Info>

## グループと Tokens

このシリーズは\*\*`Default` グループ\*\*に属しています。新規作成されたすべての token で呼び出すことができ、申請は不要です。

<Info>
  **token 課金モード**: このシリーズでは `Pay-as-you-go Priority` と `Per-request` の両方をご利用いただけます。プラットフォーム上の token 課金モデルでも同じ token を利用できるよう、`Pay-as-you-go Priority` を推奨します。

  **レート**: 単一キーは **50 RPM** 未満に抑えてください。大規模なバッチワークロードの場合は、事前にサポートまでお問い合わせください。
</Info>

## 技術仕様

| 項目 | 仕様 |
| - | - |
| モデルID | `MAI-Image-2.6`、`MAI-Image-2.6-Flash`（**大文字・小文字を区別**） |
| エンドポイント | `/v1/images/generations`（JSON）、`/v1/images/edits`（multipart） |
| サイズパラメータ | `width` + `height`、整数、常にペアで指定 |
| サイズ範囲 | 各辺 ≥ 768、幅 × 高さ ≤ 2,359,296（= 1536×1536）、16の倍数に切り捨て |
| デフォルトサイズ | 1024×1024 |
| 出力フォーマット | PNG（RGB）、`b64_json` のみ、1024×1024で約1.5〜1.7 MB |
| リクエストあたりの画像数 | Text-to-imageは常に1枚、編集エンドポイントでは `n` が有効 |
| 参照画像 | 編集エンドポイントでのファイルアップロード、**1〜5枚**（複数指定時は `image[]` を繰り返す）、JPEG / PNG / WebP。枚数による価格の変動なし |
| マスクインペインティング | ❌ 非対応 |
| `seed` / `negative_prompt` | ❌ 400エラーを返却 |
| ストリーミング | ❌ 非対応 |
| レイテンシ（1024×1024） | Flash P50 約17秒、2.6 P50 約30秒 |
| 推奨クライアントタイムアウト | Flash ≥ 120秒、2.6 ≥ 180秒 |

## エンドポイント

| 機能 | メソッド | パス | Content-Type |
| - | - | - | - |
| テキストから画像生成 | `POST` | `/v1/images/generations` | `application/json` |
| 画像編集 | `POST` | `/v1/images/edits` | **`multipart/form-data`** |

<Warning>
  **❌ チャットエンドポイントはサポートされていません**

  このシリーズでは、`/v1/chat/completions` および `/v1/responses` は **404 `Requested path is not found`** を返します。Cherry Studio や LobeChat などのチャットクライアントはリスト内のすべてのモデルにチャットリクエストを送信するため、**これらのクライアントでは MAI-Image を選択しないでください**。Images API をサポートするツールを使用するか、独自のコードから呼び出してください。
</Warning>

<Warning>
  **✅ 編集エンドポイントはマルチパートファイルアップロードのみを受け付けます**

  JSON（URL、data URI、または生の base64 形式の `image` を含む）を `/v1/images/edits` に送信すると、400 が返されます：

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  `-F "image=@photo.jpg"` を使用してローカルファイルを直接アップロードしてください。**画像ホスティングは不要です。** 完全な例については [画像編集 API](/ja/api-capabilities/mai-image/image-edit) を参照してください。
</Warning>

<Tip>
  プライマリドメインは `https://api.apiyi.com`、バックアップドメインは `https://b.apiyi.com` です。
</Tip>

## 主要パラメータ

### `width` および `height`（出力サイズ）

| ルール | 詳細 |
| - | - |
| 常にペアで指定 | 片方のみ送信した場合は400が返されます |
| 最小値 | 各辺は最低768。767を指定すると400が返されます `'width' must be at least 768 pixels` |
| 面積の上限 | 幅 × 高さ ≤ 2,359,296。1600×1600を指定すると400が返されます `exceeds the maximum of 2359296` |
| 端数処理 | 16の倍数でない値は切り捨てられます: 1000×1000 → 992×992、1024×1023 → 1024×1008 |
| アスペクト比 | 制限なし。3072×768（4:1のバナー）も指定可能です |

**一般的なキャンバスサイズ**（すべて面積上限内）:

| 用途 | `width` × `height` |
| - | - |
| 正方形 | 1024×1024 / 1536×1536 |
| 横長 3:2 | 1536×1024 |
| 縦長 2:3 | 1024×1536 |
| 横長 16:9 | 1792×1008 |
| 縦長 9:16 | 1008×1792 |
| バナー 4:1 | 3072×768 |

<Warning>
  **`size` は2つのエンドポイントで挙動が異なります**: テキストから画像生成では**暗黙的に無視され**（常に1024×1024）、編集エンドポイントでは有効になります。混乱を避けるため、**両方のエンドポイントで `width` + `height` を使用してください**。
</Warning>

### `n`（画像枚数）

* **テキストから画像生成**: `n` は効果がありません。2、4、または10を指定して送信しても1枚の画像のみが返されます（課金も1枚分）。さらに必要な場合は並列リクエストを送信してください。
* **編集**: `n` は機能します。`n=2` は2枚の画像を返し、2枚分として課金されます。

## ベストプラクティス

<Steps>
  <Step title="ユースケースに応じてバリアントを選択する">
    バッチ生成やレイテンシを重視する処理 → `MAI-Image-2.6-Flash`。ヒーローポスター、複雑な構図、または高い品質基準が求められる場合 → `MAI-Image-2.6`。パラメータは同一であるため、切り替えはモデル名を変更するだけです。
  </Step>

  <Step title="描画したいテキストを引用符で囲む">
    画像内に表示させたいテキストは引用符で囲み、どこに配置するかを指定します（例: 「Grand Opening」と書かれた看板）。モデルは引用符内のテキストを極めて忠実に再現します。
  </Step>

  <Step title="編集時は「その他はすべてそのまま変更しない」と指定する">
    元の画像を可能な限り維持するために、「Make the teapot cobalt blue, keep everything else exactly the same（ティーポットをコバルトブルーにし、その他はすべて完全に元のままにしてください）」のように指示を記述します。
  </Step>

  <Step title="キャンバスを変更すると画像が再構成される">
    元の画像と異なるアスペクト比の `width` / `height` を渡すと、モデルはクロップ（切り抜き）やパディングを行うのではなく、**シーンを再レイアウト**します。部分的な編集の場合はサイズ指定を省略すると、出力は16の倍数にスナップされた元の比率に従います（例: 1344×756の入力 → 1360×768の出力）。
  </Step>

  <Step title="複数の画像が必要な場合は並行リクエストを送信する">
    テキストからの画像生成（Text-to-image）では1回の呼び出しにつき1枚の画像が返されるため、4枚の画像が必要な場合は4つの並行リクエストを送信してください。テストでは、同時実行数が10件の場合でも単一リクエストと同等のレイテンシでした。
  </Step>
</Steps>

## エラーコードとリトライ

| HTTP | code / message | 意味 | 対処法 |
| - | - | - | - |
| `400` | `unsupported_request_value` | サイズが範囲外、型が不正、または `width`/`height` が同時に送信されていません | メッセージ内の制約に従って修正してください。リトライはしないでください |
| `400` | `invalid_request`: `Invalid parameters: xxx` | `response_format` / `seed` / `negative_prompt` が送信されました | フィールドを削除してください |
| `400` | `invalid_request`: `Prompt must be …` | `prompt` が空か存在しません | prompt を追加してください |
| `400` | `invalid_request_error`: `at most 5 reference images are accepted for <model>` | 編集エンドポイントで参照画像が5枚を超えています | 5枚以下で送信してください |
| `400` | `invalid_request_error`: `reference image xxx is image/gif; only JPEG, PNG and WebP are accepted` | サポートされていない参照画像の形式です | アップロード前に JPEG / PNG / WebP に変換してください |
| `400` | `invalid_request_error`: `<model> does not support mask edits` | 編集エンドポイントに `mask` が指定されています | マスクを削除し、対象領域を prompt 内で説明してください |
| `400` | `content_safety_violation` | コンテンツモデレーションによりブロックされました | prompt を変更してください。リトライしても解決しません |
| `400` | `request Content-Type isn't multipart/form-data` | 編集エンドポイントに JSON が送信されました | multipart ファイルアップロードに切り替えてください |
| `404` | `Requested path is not found` | chat / responses に送信されました | Images API を使用してください |
| `500` | `image is required` | 編集リクエストに画像ファイルフィールドがないか、`image1` + `image2` のような連番のフィールド名が指定されています | 画像が1枚の場合は `image` を使用し、複数枚の場合は `image[]` を繰り返してください |
| `503` | `no available channels` | モデル名の大文字・小文字が不正です（例: すべて小文字） | `MAI-Image-2.6` / `MAI-Image-2.6-Flash` を使用してください |

<Info>
  **クライアント側のアドバイス**: 上記の 4xx / 500 エラーは確定的であるため、リトライしても意味がありません。代わりにアラート通知を行ってください。リトライを行う価値があるのはネットワークタイムアウトと `429` のみであり、指数バックオフを用いて最大3回まで試行してください。**クライアント側のタイムアウトによって中断されたリクエストも課金対象となる**点に留意し、まずはタイムアウト値を長めに設定してください。
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="response_format を送信すると 400 が返されるのはなぜですか？">
    このシリーズは `b64_json` のみを返し、**`response_format` パラメーターは受け付けません**。`"b64_json"` を指定しても 400 `Invalid parameters: response_format` が返されます。

    gpt-image や DALL·E から移行したコードでは明示的に設定されていることがよくあります。これを削除してください。画像は引き続き `data[0].b64_json` に含まれます。`seed` や `negative_prompt` についても同様です。
  </Accordion>

  <Accordion title="size: 1536x1024 を渡したのに、結果が正方形のままなのはなぜですか？">
    テキストからの画像生成エンドポイントは **`size` を読み取りません**。サイレントに無視され、デフォルトの 1024×1024 でレンダリングされます。代わりに `"width": 1536, "height": 1024` を使用してください。

    画像編集エンドポイントでは `size` が機能しますが、一貫性を保つため両方で `width` + `height` を使用してください。
  </Accordion>

  <Accordion title="画像の URL を使用して編集できますか？">
    **いいえ、できません。** 編集エンドポイントは `multipart/form-data` ファイルのアップロードのみを受け付けます。URL、データ URI、または base64 文字列を `image` として渡すと 400 が返されます。

    URL しかない場合は、まずサーバー側でダウンロードしてからアップロードしてください。

    ```python theme={null}
    import requests
    img = requests.get("https://example.com/photo.jpg", timeout=30).content
    files = {"image": ("photo.jpg", img, "image/jpeg")}
    ```
  </Accordion>

  <Accordion title="画像合成のために複数の参照画像を送信できますか？">
    **はい、1〜5 枚の画像を送信できます**（2026-10-07 以降）。単一の画像と同じ価格です。

    * **方法**: `image[]` フィールドを繰り返します（`curl -F "image[]=@a.jpg" -F "image[]=@b.jpg"`）。OpenAI SDK を使用する場合は、リスト `client.images.edit(image=[f1, f2])` を渡します
    * **画像の参照方法**: アップロード順に image 1、image 2、… と番号が付けられます（例：「image 2 のキツネを image 1 のシーンに配置し、image 1 の他の部分はすべてそのまま維持してください」）
    * **`image` + `image2` は使用しないでください**: 200 が返されますが、2 枚目の画像は破棄され、1 枚目のみが使用されます
    * **5 枚を超える画像**を送信すると 400 `at most 5 reference images are accepted for <model>` が返されます

    完全な例については、[画像編集 API](/ja/api-capabilities/mai-image/image-edit) をご覧ください。
  </Accordion>

  <Accordion title="マスクインペインティングはサポートされていますか？">
    **いいえ、サポートされていません。** `mask` フィールドを送信すると 400 `<model> does not support mask edits` が返されます。部分的な変更を行うには、prompt 内でその領域を指定してください（例：「ティーポットのみを青色にし、それ以外はすべて完全にそのまま維持してください」）。テストでは、モデルはこうした制約に忠実に従います。
  </Accordion>

  <Accordion title="Cherry Studio / LobeChat で使用できますか？">
    **推奨されません。** これらのチャットクライアントは `/v1/chat/completions` を使用するため、このシリーズでは 404 が返されます。OpenAI Images API をサポートしているツールを使用するか、このドキュメント内のコードサンプルを使用して直接呼び出してください。
  </Accordion>

  <Accordion title="1 回のリクエストで何枚の画像を生成できますか？">
    テキストからの画像生成は**常に 1 枚を返します**。どのような `n` を送信しても、取得および課金されるのは 1 枚の画像のみです。複数枚必要な場合は、並行してリクエストを送信してください。

    編集エンドポイントでは `n` が機能します。`n=2` は 2 枚の画像を返し、2 枚分として課金されます。
  </Accordion>

  <Accordion title="usage 内の token 数で課金内容を照合できますか？">
    **いいえ、照合できません。** `usage.prompt_tokens` は常に 1000 × 画像数、`output_tokens` は常に 0 となり、これらはプレースホルダーです。このシリーズは画像ごとに課金され、APIYI コンソールの請求が正式なものとなります。
  </Accordion>

  <Accordion title="モデレーションはどの程度厳格ですか？ブロックされるとどのようになりますか？">
    このシリーズは Microsoft の公式コンテンツセーフティポリシーを採用しており、**かなり厳格**です。実在の有名人、流血・残虐表現、有名な IP キャラクター（ディズニーなど）、ヌードはブロックされます。

    ブロックされると、メッセージ内に具体的な理由が記載された `400 content_safety_violation` が返されます。prompt レベルのブロックは通常 5〜8 秒以内に返されます。生成後に適用されるブロックもあり、その場合は通常の画像生成とほぼ同じ時間がかかります。同じ prompt を再試行しても解決しないため、表現を変更してください。
  </Accordion>

  <Accordion title="ストリーミングはサポートされていますか？">
    **いいえ、サポートされていません。** 通常の同期リクエストとして呼び出し、完全なレスポンスをお待ちください。
  </Accordion>

  <Accordion title="503 no available channels が発生しますか？">
    最も一般的な原因は、**モデル名の大文字・小文字の誤り**です。名前は正確に `MAI-Image-2.6` または `MAI-Image-2.6-Flash` である必要があり、`mai-image-2.6-flash` では 503 が返されます。
  </Accordion>
</AccordionGroup>

## 関連ドキュメント

* [MAI-Image 2.6 Text-to-Image API](/ja/api-capabilities/mai-image/text-to-image) - Playground付きAPIリファレンス
* [MAI-Image 2.6 Image Editing API](/ja/api-capabilities/mai-image/image-edit) - 参照画像編集
* [画像APIの要点とベストプラクティス](/ja/api-capabilities/image-api-best-practices) - タイムアウト、切断、圧縮
* [チャージボーナスキャンペーン](/ja/faq/recharge-promotions)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.