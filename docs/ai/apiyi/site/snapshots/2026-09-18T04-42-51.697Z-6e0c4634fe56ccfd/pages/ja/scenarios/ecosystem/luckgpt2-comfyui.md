> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck GPT-Image 2 - ComfyUI ノード

> コミュニティ提供のComfyUIノードパックです。公式の gpt-image-2 / gpt-image-2.5-flare / gpt-image-2.5-sunburst に対応する3つの画像ノード、リバース gpt-image-2-all / gpt-image-2-vip に対応するノード、および3つのプロンプト制御ノードを提供します。2026-09-10以降、6段階の品質レベル、16枚の参照画像、マスクによるインペイント、カスタム解像度を備えた GPT-Image 2.5 に対応しています。

## 概要

`Comfyui-Luck-gpt2.0` は、コミュニティユーザーのluckdvrが提供するComfyUI用カスタムノードパックです。APIYIのGPT画像モデルをComfyUI内から直接呼び出します。このパックには現在、**3つの画像ノード**と**3つのプロンプト制御ノード**が含まれています。

* **`Comfyui-Luck gpt-image-2`**（公式）：モデルドロップダウンから`gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`を選択でき、実際の`size` / `quality`を送信します。マスクインペインティングと最大16枚の参照画像に対応しています
* **`Comfyui-Luck gpt-2.0 all`**（リバース）：`gpt-image-2-all`を呼び出します。呼び出しごとの課金で、高速な対話型編集に対応しています
* **`Comfyui-Luck gpt-image-2-vip`**（リバース）：`gpt-image-2-vip`を呼び出します。呼び出しごとの課金で、Adobeルートを使用します
* **プロンプト制御ノード**：`GPT-Image-2 文生图提示词控制器`（テキストから画像へのプロンプトコントローラー） / `图生图提示词控制器`（画像から画像へのプロンプトコントローラー） / `文本停留编辑器`（テキスト一時停止エディター）。マルチモーダルモデルを使用して、入力した概要を構造化された画像プロンプトに変換し、手動編集のためにワークフローを一時停止できます

<Info>
  **2026-09-10更新：GPT-Image 2.5に対応しました。** 公式ノードに`gpt-image-2.5-flare`（速度優先）と`gpt-image-2.5-sunburst`（品質と編集精度を優先）が追加され、`quality`は6段階に拡張されました（新しい`xhigh` / `max`）。ノード名、ID、ウィジェットの順序、デフォルトモデル`gpt-image-2`は変更されないため、**既存のワークフローでモデルや品質が自動的に切り替わることはありません**。プラグインの更新後、`model (模型)`ドロップダウンでモデルを選択してください。詳しくは、以下の「ノードでGPT-Image 2.5を使用する」をご覧ください。
</Info>

<Info>
  **プロジェクト情報**

  * 🔗 ソース：`github.com/luckdvr/Comfyui-Luck-gpt2.0`
  * 📜 ライセンス：Apache-2.0
  * 👤 作成者：luckdvr
  * ⭐ APIYI向けに構築されたコミュニティ提供パックです。APIの動作変更やノードエラーは、まずリポジトリのIssueに報告してください
</Info>

<Tip>
  **作者の別のノードパックとの違いは？**

  luckdvrは、APIYI向けに2つのComfyUIノードパックを提供しています。

  * **[Luck Nano Banana Pro](/ja/scenarios/ecosystem/lucknanobananapro-comfyui)**：Gemini系列（`gemini-3-pro-image-preview` / `gemini-3.1-flash-image-preview`）を呼び出し、14枚の参照画像と、エンジニアリング品質のリトライ／タイムアウトを重視します
  * **Luck GPT-Image 2（このページ）**：OpenAI系列（`gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2-all` / `gpt-image-2-vip`）を呼び出し、実際の`size` / `quality`制御、マスクインペインティング、プロンプトコントローラーを重視します
</Tip>

## コア機能

<CardGroup cols={2}>
  <Card title="3ノード、3つのルート" icon="layers">
    公式`gpt-image-2`、リバース`gpt-2.0 all`、リバース`gpt-image-2-vip`がそれぞれ1つのルートをカバーします。予算と用途に応じて選択できます
  </Card>

  <Card title="GPT-Image 2.5のツインモデル" icon="sparkles">
    公式ノードを`gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`に切り替えられます。バージョン固定用に、`-2026-09-08`の日付付きスナップショットも掲載しています
  </Card>

  <Card title="6段階の品質ティア" icon="sliders-horizontal">
    `quality`はauto / low / medium / high / xhigh / maxに対応します。`xhigh` / `max`は2つの2.5モデルのみで使用できます
  </Card>

  <Card title="最大16枚の参照画像" icon="images">
    公式ノードは`image_01` … `image_16`を受け付けます。2つのリバースノードは最大14枚に対応し、複数画像の融合やスタイル転送に利用できます
  </Card>

  <Card title="マスクインペインティング" icon="eraser">
    公式ノードのオプション`mask`入力は編集領域を正確に指定します（透明部分は再描画され、不透明部分は保持されます）
  </Card>

  <Card title="実解像度＋カスタムサイズ" icon="image">
    auto / 1K / 2K / 4Kのプリセットに加え、カスタムサイズにも対応します（各辺最大3840px、総ピクセル数655,360～8,294,400）
  </Card>

  <Card title="プロンプトコントローラー" icon="wand-sparkles">
    デフォルトの`gemini-3.5-flash`は、テキストの概要または最大5枚の参照画像を構造化された画像プロンプトに変換します。手動編集のために任意で一時停止することもできます
  </Card>

  <Card title="組み込みのタイムアウトとリトライ" icon="refresh-cw">
    公式ノードのタイムアウトはデフォルトで600秒です。`408` / `429` / `5xx`は`retry_times`に従ってリトライするため、ピーク時間帯の遅延にも対応できます
  </Card>
</CardGroup>

## サポート対象の APIYI モデル

| モデル                        | モデル ID                                           | ノード                            | 用途                                       | API ドキュメント                                          |
| -------------------------- | ------------------------------------------------ | ------------------------------ | ---------------------------------------- | --------------------------------------------------- |
| GPT-Image 2.5 Flare（公式）    | `gpt-image-2.5-flare`（スナップショット `-2026-09-08`）    | `Comfyui-Luck gpt-image-2`     | 速度優先のテキストから画像への変換、6段階の品質レベル、16枚の参照画像＋マスク | [表示](/ja/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2.5 Sunburst（公式） | `gpt-image-2.5-sunburst`（スナップショット `-2026-09-08`） | `Comfyui-Luck gpt-image-2`     | 品質と編集精度を優先。編集と複数画像の融合に最適                 | [表示](/ja/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2（公式）            | `gpt-image-2`                                    | `Comfyui-Luck gpt-image-2`     | 旧世代、4段階の品質レベル、ノードのデフォルト                  | [表示](/ja/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All（リバース）      | `gpt-image-2-all`                                | `Comfyui-Luck gpt-2.0 all`     | ChatGPT のウェブルート、呼び出しごとの課金、約30～60秒        | [表示](/ja/api-capabilities/gpt-image-2-all/overview) |
| GPT-Image 2 VIP（リバース）      | `gpt-image-2-vip`                                | `Comfyui-Luck gpt-image-2-vip` | Adobe ルート、呼び出しごとの課金、約90～150秒             | [表示](/ja/api-capabilities/gpt-image-2-vip/overview) |

<Info>
  3つの公式モデルは**同じ価格とパラメータ**を共有し、token 単位で課金されます。2つのリバースモデルはいずれも**画像1枚あたり \$0.03**で課金されます。公式モデルとリバースモデルの詳しい比較については、[gpt-image-2.5 / 2 の公式モデルとリバースモデルの比較](/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all)をご覧ください。
</Info>

## ノードで GPT-Image 2.5 を使用する

プラグインを更新し、ComfyUI を完全に再起動してから、`Comfyui-Luck gpt-image-2` の `model (模型)` ドロップダウンを切り替えます。それ以外のウィジェットはすべて同じままです。2.5 の両モデルは、テキストから画像、画像編集、16 枚の参照画像、マスクをサポートしています。ノードは、`mode` と参照画像が接続されているかどうかに基づいて、生成または編集のエンドポイントを選択します。

| モデル                                       | `quality` の値                                         | 位置付け                          |
| ----------------------------------------- | ---------------------------------------------------- | ----------------------------- |
| `gpt-image-2`                             | `auto` / `low` / `medium` / `high`                   | 以前の世代、ノードのデフォルト               |
| `gpt-image-2.5-flare`（日付付きスナップショットを含む）    | `auto` / `low` / `medium` / `high` / `xhigh` / `max` | 速度を優先。テキストから画像へのデフォルト選択       |
| `gpt-image-2.5-sunburst`（日付付きスナップショットを含む） | `auto` / `low` / `medium` / `high` / `xhigh` / `max` | 品質と編集精度を優先。編集および複数画像の融合に適した選択 |

<Warning>
  **`gpt-image-2` から 2.5 に移行する際、`quality` を変更せずに引き継がないでください。** APIYI が 2026-09-09 に同一サイズで出力 token を測定した結果、2.5 の `high` は旧 `medium` に対応し、2.5 の `max` のみが旧 `high` に対応します。これは token 予算の対応関係であり、ピクセル単位で同等の品質を保証するものではありません。2.5 で旧 `high` の予算に合わせるには `max` を選択してください。同じ予算では、2.5 の `high` / `xhigh` により、より安価な中間ティアを 2 つ利用できます。
</Warning>

ワークフローを構築する前に知っておくべき、ノードレベルの動作：

* **サイレントなダウングレードなし**：旧 `gpt-image-2` で `xhigh` / `max` を選択した場合、または無効なモデル / 品質を指定した場合、ノードは送信前にエラーを発生させます。ティアが自動的に置き換えられることはありません
* **`auto` は慎重に使用**：`auto` は動的な推論ティアであるため、同じ prompt でもコストとレイテンシーがティア間で変動します。支出を管理するには、ティアを明示的に選択してください
* **本番環境では日付付きスナップショットを固定**：ドロップダウンの `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08` はモデルのバージョンを固定するため、上流でエイリアスが変更されてもモデルが変わることはありません
* **600 秒のタイムアウトを維持**：2.5 の `xhigh` / `max`、2K / 4K、または複雑な編集では、デフォルト値を維持するか、値を引き上げてください。クライアントがタイムアウトした後も同期リクエストに課金される場合があり、自動リトライによってコストが増える可能性があります。リトライを望まない場合は、`retry_times` を `1` に設定してください

## ノードパラメータ

### `Comfyui-Luck gpt-image-2` (公式)

パネル上のウィジェットラベルには、`api_key (API密钥)` のように中国語の接尾辞が付いています。以下の表には英語のフィールド名のみを記載しています。

| パラメーター                  | 型      | 必須  | デフォルト              | 説明                                                                                                                                        |
| ----------------------- | ------ | --- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `api_key`               | string | はい  | -                  | APIYI token。使用量の上限を設定した専用キーを推奨します                                                                                                         |
| `prompt`                | string | はい  | -                  | 生成または編集の指示                                                                                                                                |
| `mode`                  | enum   | はい  | `AUTO`             | `AUTO` / `text2img` / `img2img`。`AUTO` は参照画像が接続されているかどうかに基づいて決定します                                                                        |
| `model`                 | enum   | はい  | `gpt-image-2`      | `gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08` |
| `api_base`              | enum   | はい  | `api.apiyi.com/v1` | API ドメイン。インストール手順 4 を参照してください                                                                                                             |
| `image_size`            | enum   | はい  | `2K`               | `auto (不传size)` / `1K` / `2K` / `4K` / `custom (自定义)`                                                                                     |
| `aspect_ratio`          | enum   | はい  | `16:9`             | 20 個のオプション: AUTO、1:4、4:1、1:8、8:1、1:1、1:2、2:1、1:3、3:1、2:3、3:2、3:4、4:3、4:5、5:4、9:16、16:9、9:21、21:9                                          |
| `custom_size`           | string | いいえ | `1600x1200`        | `image_size` が `custom` の場合にのみ使用します。形式は `WxH` です                                                                                          |
| `quality`               | enum   | はい  | `auto`             | `auto` / `low` / `medium` / `high` / `xhigh` / `max`。最後の 2 つは 2.5 専用です                                                                    |
| `output_format`         | enum   | はい  | `png`              | `png` / `jpeg` / `webp`                                                                                                                   |
| `output_compression`    | int    | はい  | 85                 | 0–100。jpeg / webp にのみ適用されます                                                                                                               |
| `seed`                  | int    | はい  | 0                  | ComfyUI ローカル制御（再実行を強制します）。**API には送信されません**                                                                                               |
| `timeout_seconds`       | int    | はい  | 600                | 読み取りタイムアウト。範囲は 60–1800 です。接続タイムアウトは 30 秒に固定されています                                                                                         |
| `retry_times`           | int    | はい  | 3                  | 範囲は 1–10 です。`408` / `429` / `5xx` は自動的に再試行されます                                                                                            |
| `image_01` … `image_16` | IMAGE  | いいえ | -                  | 参照画像。最大 16 枚                                                                                                                              |
| `mask`                  | MASK   | いいえ | -                  | インペインティング用マスク。`image_01` と併用する必要があります。ComfyUI のマスク値が 1 の領域が再描画されます                                                                        |

`custom_size` には 4 つの制約があります。いずれの辺も 3840px を超えないこと、幅と高さがともに 16 の倍数であること、長辺 / 短辺が最大 3:1 であること、総ピクセル数が 655,360～8,294,400 の範囲内であることです。`1:4` / `4:1` / `1:8` / `8:1` の比率は公式の 3:1 制限を超えるため、ノードはそれらを最も近い使用可能な境界サイズに自動調整します。`4K + 1:1` では、後者が総ピクセル数の上限を超えるため、`3840x3840` ではなく `2880x2880` を使用します。

<Note>
  ノードは `background` / `moderation` / `response_format` / `input_fidelity` を送信しません。これらはすべて API のデフォルト値にフォールバックします。透明な背景などのオプションについては、API を直接呼び出してください。詳しくは [透明な背景に関する FAQ](/ja/faq/image-transparent-background) を参照してください。
</Note>

### `Comfyui-Luck gpt-2.0 all`（逆引き）

| パラメーター                  | 型      | 必須  | デフォルト              | 説明                                                                                                   |
| ----------------------- | ------ | --- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `api_key`               | string | はい  | -                  | APIYI token                                                                                          |
| `prompt`                | string | はい  | -                  | 会話形式の生成／編集指示                                                                                         |
| `mode`                  | enum   | はい  | `AUTO`             | `AUTO`／`text2img`／`img2img`                                                                          |
| `model`                 | enum   | はい  | `gpt-image-2-all`  | 単一の固定オプション                                                                                           |
| `api_base`              | enum   | はい  | `api.apiyi.com/v1` | APIドメイン                                                                                              |
| `endpoint`              | enum   | はい  | `images_api`       | `images_api`（`/v1/images/generations`または`/v1/images/edits`）／`chat_completions`（会話形式またはオンラインURLの参照画像） |
| `aspect_ratio`          | enum   | はい  | `AUTO`             | 22個のオプション（公式ノードに`2:5`／`5:2`を追加）。**テキストとしてプロンプトの先頭に付加されるだけ**で、厳密なサイズ制御ではありません                         |
| `response_format`       | enum   | はい  | `url`              | `url`／`b64_json`。`images_api`エンドポイントでのみ送信されます                                                        |
| `seed`                  | int    | はい  | 0                  | ローカル制御専用で、送信されることはありません                                                                              |
| `timeout_seconds`       | int    | はい  | 300                | 範囲は30～1200です                                                                                         |
| `retry_times`           | int    | はい  | 3                  | 範囲は1～10です                                                                                            |
| `image_01` … `image_14` | IMAGE  | いいえ | -                  | 参照画像、最大14枚                                                                                           |

`gpt-image-2-all`は`size`／`quality`／`n`／`aspect_ratio` APIフィールドを受け付けず、ノードから送信されることもありません。2K／4Kは、ピクセル数の保証なしでプロンプトに記述することしかできません。`url`の出力は通常、約1日間有効な一時的なCDNリンクであるため、長期的に使用する必要がある場合は再ホスティングしてください。

### `Comfyui-Luck gpt-image-2-vip`（リバース）

`gpt-2.0 all`と同じウィジェットに、2つのサイズ制御を追加したものです。

| パラメーター         | 型    | 必須 | デフォルト             | 説明                                                                                                                                                                          |
| -------------- | ---- | -- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`        | enum | はい | `gpt-image-2-vip` | 固定された単一のオプション                                                                                                                                                               |
| `image_size`   | enum | はい | `2K Recommended`  | `1K Fast` / `2K Recommended` / `4K Detail`；**現在は古いワークフロー用に保持されているUIヒントであり、ノードは`size`を送信しません**                                                                               |
| `aspect_ratio` | enum | はい | `16:9`            | 10個のオプション：1:1、2:3、3:2、3:4、4:3、4:5、5:4、9:16、16:9、21:9；プロンプトプレフィックスのフォールバックとしてのみ使用                                                                                            |
| その他            | -    | -  | -                 | `api_key` / `prompt` / `mode` / `api_base` / `endpoint` / `response_format` / `seed` / `timeout_seconds`（300） / `retry_times`（3） / `image_01` … `image_14`。`gpt-2.0 all`と同じ |

<Note>
  このノードは、`size`が無効化されたというAPIYIの2026-06-23付けの告知に基づいて作成されたため、デフォルトでは`size`を送信しません。APIYI側では、`gpt-image-2-vip`に対する`size`が2026-07-22に復元されました（一般的な30種類のサイズについては、[gpt-image-2-vipドキュメント](/ja/api-capabilities/gpt-image-2-vip/overview)を参照してください）が、プラグインはまだ対応できていません。現在ComfyUI内で実際の出力サイズを固定するには、公式ノード`Comfyui-Luck gpt-image-2`を使用してください。リバース`b64_json`には`data:image/png;base64,`プレフィックスが含まれており、ノードが自動的にデコードします。
</Note>

### prompt 制御ノード

| ノード                     | デフォルトモデル           | 用途                                                                                                          |
| ----------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| `GPT-Image-2 文生图提示词控制器` | `gemini-3.5-flash` | テキストの概要を、GPT-Image 系列に適した構造化された画像 prompt に変換します                                                             |
| `图生图提示词控制器`             | `gemini-3.5-flash` | 最大5枚の参照画像（`reference_image_01` 必須、`02`～`05` 任意）と任意の `subject_image` を読み込み、スタイル、構図、レイアウトの制約を含む prompt を作成します |
| `文本停留编辑器`               | -                  | ここでワークフローを一時停止します。テキストを編集してから、ノード上の `Continue` をクリックして再開します                                                 |

* どちらのコントローラーも APIYI `POST /v1/chat/completions` を呼び出します。モデルのドロップダウンでは `gemini-3.5-flash` / `gpt-5.5` / `gpt-4o` / `gpt-4.1-mini` / `gemini-2.5-flash` / `gemini-2.5-pro` を選択できます
* 画像間コントローラーは画像理解と prompt の強化のみを行います。実際の複数画像参照や融合を行う場合は、同じ画像を下流の画像ノードにも接続してください
* 一時停止エディターの `edited_text` は、画像ノードの `prompt` 用の単一文字列です。`edited_texts` はバッチテキストワークフロー用に予約されたリスト出力です。一時停止後は、**ノード上の `Continue` をクリックしてください**。メインの「実行」ボタンを再度押さないでください。押すと ComfyUI がキューに再追加し、上流の prompt 強化を再実行します

## インストール

<Steps>
  <Step title="ステップ1：custom_nodesにクローンする">
    ComfyUIのインストール先で、次を実行します：

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-Luck-gpt2.0.git
    ```

    既存ユーザーはそのフォルダーで`git pull`すると、2.5をサポートできます。
  </Step>

  <Step title="ステップ2：依存関係をインストールする">
    ```bash theme={null}
    cd Comfyui-Luck-gpt2.0
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="ステップ3：ComfyUIを完全に再起動する">
    ノードパレットで`Comfyui-Luck`を検索すると、3つの画像ノードと3つのプロンプトノードが見つかります。フロントエンドの更新だけでは不十分です。プラグインを更新した後はプロセスを再起動してください。
  </Step>

  <Step title="ステップ4：APIYIキーとドメインを設定する">
    * [APIYIコンソール](https://www.apiyi.com) → トークンにアクセスし、キーを作成します（使用量の上限を設定することを推奨します）
    * ノードの`api_key`フィールドに貼り付けます
    * `api_base`を1つ選択します：`https://api.apiyi.com/v1`（プライマリ） / `https://b.apiyi.com/v1`（中国本土のバックアップ） / `https://vip.apiyi.com/v1`（海外からの直接接続）。ノードは`/v1`の有無にかかわらずベースURLを受け付けます
  </Step>

  <Step title="ステップ5：サンプルワークフローをインポートする">
    リポジトリには2つのサンプルが含まれています：

    * `example_workflow.json`：各画像ノードにつき1つのサンプル（公式のものでは`size=2048x1152` + `quality=high` + `jpeg`を使用）と、選択方法を説明する中国語のNoteノード
    * `example_workflow_gpt_image_2_5.json`：単独で動作する2.5のサンプルです。Flareのテキストから画像への変換 → Sunburstによる編集 → プレビューという流れで、デフォルトでは`1K + 1:1`、`quality=high`、600秒のタイムアウト、および`retry_times=1`が設定されています

    サンプル内のAPIキーは空欄です。実行するには自分のキーを入力してください。自分のワークフローを共有する前に、キーを消去してください。
  </Step>
</Steps>

## 使用例

### 例1：2.5 Flare 4K 高品質なテキスト画像生成

```
Node: Comfyui-Luck gpt-image-2
model: gpt-image-2.5-flare
prompt: "Cinematic portrait of a samurai in a misty bamboo forest, volumetric light, 85mm lens, photorealistic"
image_size: 4K
aspect_ratio: 2:3
quality: max
output_format: png
```

`max` は、旧 `gpt-image-2` `high` と同じ token 予算を持つ 2.5 ティアです。より高速かつ低コストで利用したい場合は、まず `high` または `xhigh` をお試しください。

### 例2：2.5 Sunburst マスクインペインティング

```
Node: Comfyui-Luck gpt-image-2
model: gpt-image-2.5-sunburst
mode: img2img
image_01: original photo
mask: the area to replace
prompt: "replace the sky with dramatic sunset clouds, keep everything else intact"
image_size: 2K
quality: high
```

### 例3：Flare のテキスト画像生成 → Sunburst 編集チェーン

リポジトリ内の `example_workflow_gpt_image_2_5.json` に一致します。

```
[Comfyui-Luck gpt-image-2 · gpt-image-2.5-flare]
  prompt: "product shot of a matte black ceramic mug on a walnut table, soft window light"
  image_size: 1K · aspect_ratio: 1:1 · quality: high
  image ─────────────────────────────┐
                                      ▼
[Comfyui-Luck gpt-image-2 · gpt-image-2.5-sunburst]
  mode: img2img · image_01: ← output of the node above
  prompt: "add a thin gold rim to the mug, keep lighting and background unchanged"
  quality: high
  image ──▶ PreviewImage
```

### 例4：逆向き会話画像

```
Node: Comfyui-Luck gpt-2.0 all
endpoint: images_api
aspect_ratio: 9:16
prompt: "A girl in hanfu standing under a cherry blossom tree, watercolor style, soft lighting"
response_format: url
timeout_seconds: 300
retry_times: 3
```

### 例5：プロンプトコントローラー → 一時停止して編集 → 生成

```
5 reference images
  ├─ into 图生图提示词控制器 reference_image_01 ~ reference_image_05
  └─ also into Comfyui-Luck gpt-image-2 image_01 ~ image_05

图生图提示词控制器 optimized_prompt
  └─ into 文本停留编辑器 text_list

文本停留编辑器 edited_text
  └─ into Comfyui-Luck gpt-image-2 prompt (model: gpt-image-2.5-sunburst)
```

最終的な `PreviewImage` / `SaveImage` で実行をキューに追加します。フローが一時停止エディターで停止したら、テキストを編集し、ノード上の `Continue` をクリックします。固定する必要がある対象が1枚の画像に含まれている場合は、その画像をコントローラーの `subject_image` にも接続し、画像ノードの `image_01` に配置します。

## FAQ

<AccordionGroup>
  <Accordion title="3つの画像ノードのうち、どれを選べばよいですか？">
    * **`Comfyui-Luck gpt-image-2`（公式）**: 実際の `size` / `quality`、ネイティブマスク、最大16個の参照、token単位の課金に対応しています。正確なサイズ、ローカル編集、または6段階の2.5品質ティアが必要な場合に選択してください。テキストから画像への生成にはデフォルトで `gpt-image-2.5-flare`、編集には `gpt-image-2.5-sunburst` を選択します
    * **`Comfyui-Luck gpt-2.0 all`（リバース）**: 呼び出し単位の課金（画像1枚あたり \$0.03）、所要時間は約30～60秒、ChatGPTウェブルートです。厳密なサイズ制御が不要で、反復編集や強力なテキスト描画が必要な場合に選択してください
    * **`Comfyui-Luck gpt-image-2-vip`（リバース）**: 呼び出し単位の課金（画像1枚あたり \$0.03）、所要時間は約90～150秒、Adobeルートです。手元に置いておく2つ目のリバースルートです。現在、プラグインは `size` を送信しません
    * 完全な比較：[公式とリバースの比較](/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="プラグインを更新すると、既存のワークフローは2.5に切り替わりますか？">
    いいえ。ノード名、ID、ウィジェットの順序、デフォルトモデル `gpt-image-2` は変更されないため、古いワークフローは元の品質のまま `gpt-image-2` 実行されます。2.5を使用するには、`model (模型)` ドロップダウンを手動で切り替え、上の表を使って `quality` を再度選択してください。
  </Accordion>

  <Accordion title="同じhighに切り替えた後、なぜ安くなり、ぼやけるのですか？">
    2.5では品質ティアが再編成されました。2026-09-09にAPIYIが同じサイズで測定した結果、2.5 `high` の出力token数は `gpt-image-2` `high` の約4分の1で、従来の `medium` に相当します。2.5で従来の `high` の予算にするには `max` を選択してください。一方、同じ予算では、2.5により安価な中間ティアとして `high` / `xhigh` の2つが追加されています。本番環境に移行する前に、各ティアで独自のpromptを1回ずつ実行し、`usage.output_tokens` を比較してください。
  </Accordion>

  <Accordion title="プラグインはgpt-image-2.5-all / gpt-image-2.5-vipをサポートしていますか？">
    現在、2つのリバースノードに表示されるのは `gpt-image-2-all` と `gpt-image-2-vip` のみです。`gpt-image-2-all` の背後にあるChatGPTウェブアプリはImages 2.5にアップグレードされているため、そのモデルはすでに2.5画像を生成し、`gpt-image-2.5-all` と同じ動作および料金になります。[gpt-image-2.5-allのドキュメント](/ja/api-capabilities/gpt-image-2-all/overview)を参照してください。`gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` はまだノードのドロップダウンに含まれていません。必要な場合はAPIを直接呼び出してください。
  </Accordion>

  <Accordion title="インストール後にノードが見つからない場合は？">
    1. フォルダーが `ComfyUI/custom_nodes/Comfyui-Luck-gpt2.0` にあることを確認します
    2. `pip install -r requirements.txt` がエラーなしで完了していることを確認します
    3. ComfyUIを完全に再起動します（フロントエンドの更新だけでは不十分です）
  </Accordion>

  <Accordion title="4K、xhigh / max、またはカスタムサイズで頻繁にタイムアウトする場合は？">
    * 公式ノードの読み取りタイムアウトのデフォルト値は600秒です。2.5 `xhigh` / `max` および2K / 4Kでは、この値を維持するか延長してください。`408 Timeout` は通常、ノードパラメーターの誤りではなく、プロバイダー側の生成タスクがタイムアウトしたことを意味します
    * クライアントがタイムアウトした後も同期リクエストには課金される場合があり、自動リトライによって費用が追加される可能性があります。リトライを無効にするには、`retry_times` を `1` に設定してください
    * サーバーのネットワークが遅い場合は、[CDN画像/動画のダウンロードが遅い](/ja/faq/cdn-download-slow)を参照してください
    * デフォルトドメインが不安定な場合は、`api_base` を `b.apiyi.com/v1` / `vip.apiyi.com/v1` に切り替えてください
  </Accordion>

  <Accordion title="古いワークフローを読み込むと、Value 3がminの30より小さいと報告される場合は？">
    古いワークフローのウィジェット順序がノードと一致しなくなったため、`retry_times=3` が `timeout_seconds=3` として読み取られています。リポジトリから現在の `example_workflow.json` を使用するか、ノードを削除して再追加してください。
  </Accordion>

  <Accordion title="一時停止エディターを接続した後、gpt-image-2でValue not in listと表示される場合は？">
    `prompt` を入力ソケットに変換すると、古いワークフローではpromptプレースホルダーが1つ不足するため、それ以降のウィジェットが1つずつずれます（たとえば `mode` が `gpt-image-2` として読み取られ、`api_base` が `2K` として読み取られます）。現在のノードは検証に合格し、実行時にずれた値を復元します。パネルにまだずれた状態で表示される場合は、現在のワークフローを再読み込みするか、`Comfyui-Luck gpt-image-2` を再追加してください。
  </Accordion>

  <Accordion title="リバースノードから返されるb64_jsonにプレフィックスが付いている場合は？">
    リバースの `gpt-image-2-all` / `gpt-image-2-vip` は `data:image/png;base64,` プレフィックス付きの `b64_json` を返しますが、公式の `gpt-image-2` 行には付きません。3つのノードはいずれも両方の形式を自動的にデコードするため、出力をそのまま `PreviewImage` に接続してください。詳細は[公式とリバースの比較](/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all)を参照してください。
  </Accordion>

  <Accordion title="呼び出しが401 / 403を返す場合は？">
    1. `api_key` の有効性と、グループによる制限の有無を確認します
    2. 選択したモデルがtokenで許可リストに登録されていることを確認します
    3. 残高の問題については、[残高は十分なはずなのに呼び出しに失敗する](/ja/faq/balance-insufficient)を参照してください
  </Accordion>
</AccordionGroup>

## 関連リソース

<CardGroup cols={2}>
  <Card title="gpt-image-2.5 / 2（公式）ドキュメント" icon="book" href="/ja/api-capabilities/gpt-image-2/overview">
    flare / sunburst / gpt-image-2 の価格とパラメータを共有、ネイティブ2K/4K、token単位の課金
  </Card>

  <Card title="GPT-image-2.5のローンチ解説" icon="newspaper" href="/en/news/gpt-image-2-5-launch">
    Flareはより高速、Sunburstはより高精度です。6段階の品質ティアと移行に関するアドバイス
  </Card>

  <Card title="gpt-image-2-all（リバース）ドキュメント" icon="book" href="/ja/api-capabilities/gpt-image-2-all/overview">
    ChatGPTのWebルート、画像1枚あたり\$0.03
  </Card>

  <Card title="gpt-image-2-vip（リバース）ドキュメント" icon="book" href="/ja/api-capabilities/gpt-image-2-vip/overview">
    Adobeルート、画像1枚あたり\$0.03、30種類のサイズに対応
  </Card>

  <Card title="公式とリバースの比較" icon="scale" href="/ja/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    公式とリバースの違いをまとめた1つの表
  </Card>

  <Card title="ComfyUIノードコレクション" icon="workflow" href="/ja/scenarios">
    APIYI対応のComfyUIノードをさらに探す
  </Card>

  <Card title="Luck Nano Banana Pro（同じ著者）" icon="puzzle" href="/ja/scenarios/ecosystem/lucknanobananapro-comfyui">
    luckdvrによるGemini系ComfyUIノード
  </Card>

  <Card title="APIYI GPT-Image 2スキル（同じモデル）" icon="puzzle" href="/ja/scenarios/ecosystem/apiyi-gpt-image-skills">
    GPT画像モデル向けAI Agent Skill版
  </Card>

  <Card title="APIYIコンソール" icon="settings" href="https://www.apiyi.com">
    キー、使用状況、グループを管理
  </Card>
</CardGroup>
