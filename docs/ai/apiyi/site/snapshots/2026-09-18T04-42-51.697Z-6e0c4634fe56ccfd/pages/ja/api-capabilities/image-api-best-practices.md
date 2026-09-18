> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 画像APIの必須事項とベストプラクティス

> APIYIのすべての画像APIは同期型です: 非同期タスクIDはなく、接続が切断されると結果は失われますが、リクエストは課金されたままです。モデル別のタイムアウト推奨値に加え、base64/URL出力の参照表も含みます。

<Info>
  **1行での答え**: APIYI のすべての画像モデルは **同期式** です。リクエストを送信し、接続を開いたままにすると、生成された画像が同じレスポンスで返ってきます。非同期タスクIDもポーリング用エンドポイントもありません。クライアントが早く切断した場合、その結果は失われますが、リクエストは引き続き課金されます。**十分に長いタイムアウトを設定することが、画像 API 開発の最重要ルールです。**
</Info>

## 始める前に知っておくべき3つの事実

<CardGroup cols={3}>
  <Card title="すべて同期処理です" icon="arrow-right-left">
    1回の HTTP リクエストは完了するまでブロックされ、公式の上流 API の形に一致します。つまり、送信してからポーリングするモードはありません。上流が非同期のプロバイダー（たとえば FLUX）であっても、ゲートウェイによって同期呼び出しにラップされるため、ポーリングループを書く必要はありません。
  </Card>

  <Card title="タスク ID はありません" icon="search-x">
    task\_id を検索するエンドポイントはなく、request\_id を使って後から画像を復元することもできません。APIYI はリクエストを透過的にプロキシし、生成結果を保存しないため、接続が切れた時点で結果は復元できません。
  </Card>

  <Card title="切断されても課金されます" icon="unplug">
    クライアントがタイムアウトして切断されても、サーバーと上流は生成を最後まで完了し、リクエストは**通常どおり課金**されます。タイムアウトが短すぎると、受け取れない画像に対して料金を支払うことになります。
  </Card>
</CardGroup>

## モデルシリーズ クイックリファレンス

各画像モデルシリーズの推奨タイムアウト、出力形式、URLサポート：

| モデルシリーズ                                                                                 | エンドポイント                                     | 推奨タイムアウト                                                                       | 出力形式                                                                                      | URL出力と有効期間                                                                |
| --------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [GPT-Image-2.5 / 2（公式：flare / sunburst / 2）](/ja/api-capabilities/gpt-image-2/overview) | `/v1/images/generations`、`/v1/images/edits` | **360秒**（gpt-image-2 high + 2K/4Kは実測で3～5分、2.5はより高速ですが、`xhigh` / `max` 用の余裕を確保） | Raw b64\_json（**`data:`プレフィックスなし**）                                                       | ❌ 非対応（`response_format` は400を返します。`image2_OSS` グループは現時点で公式チャネルをカバーしていません） |
| [GPT-Image-2-All（リバース）](/ja/api-capabilities/gpt-image-2-all/overview)                  | 上記と同じ                                       | **300秒**                                                                       | デフォルト `b64_json`（**`data:`プレフィックスなし**、2026-07に検証済み）；明示的な `response_format: "url"` で切り替え可能 | ✅ 明示的な `url`：R2 CDN、約24時間；URLに依存する場合は `image2_OSS` グループを使用                |
| [GPT-Image-2-VIP](/ja/api-capabilities/gpt-image-2-vip/overview)                        | 上記と同じ                                       | **300秒**                                                                       | Allと同じ（デフォルト `b64_json`、プレフィックスなし、2026-07に検証済み）                                           | ✅ Allと同じ（明示的な `url` または `image2_OSS` グループ）                                |
| [Nano Banana Pro](/ja/api-capabilities/nano-banana-image/overview)                      | ネイティブ Gemini `:generateContent`             | 1K/2K は **300秒**、4Kは **600秒**、複数画像は5分以上                                        | `inlineData.data` 内のRaw base64                                                            | `NB_OSS` ベータグループ（下記参照）                                                    |
| [Nano Banana 2](/ja/api-capabilities/nano-banana-2-image/overview)                      | 上記と同じ                                       | **360秒**                                                                       | 上記と同じ                                                                                     | `NB_OSS` のカバレッジ：サポートにお問い合わせください                                           |
| [Nano Banana Lite](/ja/api-capabilities/nano-banana-lite-image/overview)                | 上記と同じ                                       | **300秒**（通常は約4秒、ピーク時の混雑に備えた余裕を確保）                                              | 上記と同じ                                                                                     | `NB_OSS` のカバレッジ：サポートにお問い合わせください                                           |
| [FLUX](/ja/api-capabilities/flux/overview)                                              | `/v1/images/generations`                    | **60～120秒**、flexモデルは180秒                                                       | `data[0].url` のみ（**URLはアップストリームのデフォルト**）                                                  | ⚠️ 有効期間は約**10分間**のみ、CORSなし — 直ちにサーバー側で再ホストしてください                          |
| [Seedream](/ja/api-capabilities/seedream-image/overview)                                | `/v1/images/generations`（統合された生成／編集エンドポイント） | **60秒**（4K + hdは約30～60秒）                                                       | デフォルト `url`（**URLはアップストリームのデフォルト**）；オプションで `b64_json`（Raw base64、プレフィックスなし）               | ✅ BytePlus TOS、約24時間                                                      |

<Tip>
  `response_format` の対応範囲は**限定的**です。受け付けるのは GPT-Image-2-All / VIP と Seedream のみで、公式 GPT-Image-2 チャネルでは渡すと400 `unknown_parameter` を返します。対応している場合は、デフォルトに依存せず、**必ず明示的に渡してください**。デフォルトはこれまで、グループや負荷状況によって変動してきました。
</Tip>

## 課金と価格を左右する要因

新規ユーザーから最もよくある課金の質問は、「参照画像は1枚ごとの定額ですか、それとも大きい画像ほど多くの token を消費しますか？」です。まずは3つの直感から始めましょう:

<CardGroup cols={3}>
  <Card title="出力がコストを支配する" icon="trending-up">
    gpt-image-2 を例にすると、テキスト入力は \$5/M、画像入力は \$8/M、**出力は \$30/M** です。価格を左右する最大の要因は常に**出力サイズと品質**（品質 × サイズ）であり、参照画像の枚数はその次です。
  </Card>

  <Card title="入力画像は定額ではない" icon="scaling">
    GPT 系の入力画像は、**寸法/アスペクト比**によって token に換算されます（大きいほど増え、下限と上限の両方があります）。さらに**枚数は厳密に線形で加算**されます。Gemini 系はその逆で、出力画像は解像度ティアごとに固定の token 量がかかります。
  </Card>

  <Card title="返却された usage を信頼する" icon="receipt">
    入力と出力の token はどちらもレスポンスに含まれます。GPT 系は`usage.input_tokens_details.image_tokens`、Gemini 系は`usageMetadata.promptTokensDetails`です。これらを突き合わせて課金を行ってください。画像枚数だけで見積もってはいけません。
  </Card>
</CardGroup>

### token の計上: 2つのモデルファミリー

| ファミリー                                    | 入力画像 token                                                                                           | 出力画像 token                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **GPT family** (gpt-image-2 など)          | 寸法で動的に決まります: 1024² 以下の正方形画像はすべて 1024 token、2048² 以上は 1521 で上限になります（2026-07 に検証済み）。**N 枚 = N × 1 枚分** | `size` × `quality`で決まり、1024² では低い場合は 196 token、高い場合は数千 token になります |
| **Gemini family** (すべての Nano Banana モデル) | `promptTokensDetails` の IMAGE モダリティでカウントされます                                                         | **解像度ティアごとに固定**: 1K/2K では 1 画像あたり 1120、4K では 2000。アスペクト比には依存しません   |

### 複数の入力画像に対するコストの直感

* 参照画像1枚あたりはおよそ **800-1600 image tokens ≈ \$0.008-0.012**（gpt-image-2、実測。寸法/アスペクト比で変動します）；
* 枚数は線形に加算されます: **16 枚 ≈ \$0.13** で、これは 1 つの`high` 出力（≈\$0.21）と同じ桁です。複数画像の融合では、入力コストももはや無視できません；
* **token はファイルサイズではなくピクセル寸法で決まります**: 圧縮はアップロードの安定性には役立ちますが、token は節約できません。token を減らすには画像枚数を減らしてください（過大な画像には上限があるため、請求額が暴騰することもありません）。

詳細な計測表: [gpt-image-2 — 複数の入力画像が価格に与える影響](/ja/api-capabilities/gpt-image-2/overview#how-multiple-input-images-affect-the-price-verified-july-2026); Gemini family の token 計上: [usageMetadata ガイド](/ja/api-capabilities/nano-banana-usage-metadata) と [Nano Banana 価格](/ja/api-capabilities/nano-banana-pricing)。

## タイムアウト設定

### デフォルトのタイムアウトが問題を引き起こす理由

ほとんどの HTTP クライアントはデフォルトで 30～60 秒のタイムアウトを設定しています（`requests` 自体には制限がありませんが、約 30 秒の制限を追加するフレームワークでラップされることがよくあります）。一方、画像生成は本質的に時間のかかるリクエストです。

* `high` 品質かつ 2K/4K 解像度の GPT-Image-2 は、エンドツーエンドで **3～5 分**かかります。
* Nano Banana シリーズの 4K 画像は約 50 秒から始まり、ピーク時にはさらに長くなります。
* 複数画像の融合および画像編集リクエストは、一般にテキストから画像への生成よりも遅くなります。

デフォルト設定では、サーバーが正常に生成を続けている間にクライアントが接続を切断します。その結果、実際には**自分で切断した成功リクエスト**である「タイムアウト」が大量に発生し、それらはすべて課金されます。

### モデル別タイムアウト階層

```python theme={null}
# Set client timeouts (seconds) per model, not one global value
IMAGE_TIMEOUTS = {
    "gpt-image-2": 360,                      # high + 2K/4K measured at 3-5 min
    "gpt-image-2.5-flare": 360,              # 2.5 shares price and parameters; reuse the timeout
    "gpt-image-2.5-sunburst": 360,
    "gpt-image-2-all": 300,
    "gpt-image-2-vip": 300,
    "gemini-3-pro-image": 600,               # Nano Banana Pro, 600s covers 4K
    "gemini-3.1-flash-image-preview": 360,   # Nano Banana 2
    "gemini-3.1-flash-lite-image": 300,      # Nano Banana Lite
    "flux": 120,                             # 180 recommended for flex models
    "seedream": 60,                          # 4K + hd around 30-60s
}

import requests

def generate_image(model: str, payload: dict, api_key: str) -> dict:
    resp = requests.post(
        "https://api.apiyi.com/v1/images/generations",
        headers={"Authorization": f"Bearer {api_key}"},
        json={"model": model, **payload},
        timeout=IMAGE_TIMEOUTS.get(model, 300),  # 300s fallback for unknown models
    )
    resp.raise_for_status()
    return resp.json()
```

### リトライ戦略

すべての失敗にリトライが必要なわけではありません。各ケースがどのように課金されるかを基準にしてください。

| 失敗                       | 課金されるか？                  | 推奨事項                                        |
| ------------------------ | ------------------------ | ------------------------------------------- |
| 429 / 503（レート制限、上流の過負荷）  | 課金されない                   | 指数バックオフ（例: 5 秒、15 秒、45 秒）でリトライする            |
| クライアントのタイムアウト / 早期切断     | **課金される**                | まずタイムアウトを延長する。リトライが必要な場合は、試行回数を慎重に制限する      |
| 400 / 403（パラメータまたは権限エラー） | 課金されない                   | 再送前にリクエストを修正する。無作為なリトライは無意味です               |
| コンテンツモデレーションによるブロック      | **モデルによって異なる**（以下の注記を参照） | prompt を修正する。そのまま再送しても、再びブロックされる可能性が非常に高いです |

<Info>
  **モデレーションによるブロック時の課金はモデルによって異なります**: token 課金モデル（公式 GPT-Image-2 など）は、モデレーションが発動した場合、通常は 400 エラーを返します。そのため**課金されません**。「HTTP 200 だが生成失敗」という Google 側のブロックが発生するのは、**画像単位課金の Nano Banana Pro**のみであり、この呼び出しは**課金されます**。APIYI は、ユーザーに責任のないこれらの失敗を、画像単位の集計に基づいてクレジットを返金する[生成失敗クレジット返金プラン](/ja/api-capabilities/nano-banana-pro-guarantee)で補償します。
</Info>

## base64 出力の扱い

### プレフィックスの違い

base64 ペイロードはシリーズ間で**一様ではありません**。これは新しい統合で最もよくある落とし穴です。

| モデルシリーズ                   | base64 フィールド                                    | `data:image/...;base64,` プレフィックスを含むか?                   |
| ------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| GPT-Image-2 (公式)          | `data[0].b64_json`                              | プレフィックスなし（生の base64）                                    |
| GPT-Image-2-All / VIP     | `data[0].b64_json`                              | プレフィックスなし（2026-07 に検証済み；**以前のバージョンではプレフィックスが含まれていました**） |
| Nano Banana series        | `candidates[0].content.parts[].inlineData.data` | プレフィックスなし（生の base64）                                    |
| Seedream (`b64_json` モード) | `data[0].b64_json`                              | プレフィックスなし（生の base64）                                    |

プレフィックスの挙動はチャネルバージョンごとに変わっているため、**必ず `startsWith("data:")` を先に確認してください**。存在する場合は、デコード前にプレフィックスを削除するか、値をそのまま `img src` として直接使い、生の値はそのままデコードしてください。これにより、プレフィックス二重付与のバグと、プレフィックス付きペイロードでのデコード失敗の両方を回避できます。

### ファイルにデコードする

```python theme={null}
import base64

b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):          # defensive strip: some channel versions included a data: prefix
    b64 = b64.split(",", 1)[1]
with open("output.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

```javascript theme={null}
let b64 = response.data[0].b64_json;
if (b64.startsWith("data:")) {
  b64 = b64.slice(b64.indexOf(",") + 1);
}
require("fs").writeFileSync("output.png", Buffer.from(b64, "base64"));
```

### Playground のレンダリング制限

base64 のレスポンスは数メガバイトになることが多く、ブラウザの Playground では `unable to complete request` と表示されることがあります。これは**リクエストが失敗したことを意味しません**。リクエストは成功して課金されており、ブラウザがその長さの文字列を描画できないだけです。コードで結果を確認するか、`url` を返すモデル/パラメータに切り替えてください。

## 入力画像の前処理

Image-edit / reference-image エンドポイント（gpt-image-2 の `/v1/images/edits` など）は **png / jpg / webp** のみを受け付けます。ユーザーに自分の写真をアップロードさせるプロダクトでは、特に厄介な落とし穴があります。**スマートフォンのカメラからそのまま取り込んだ写真は、標準的な JPEG ではないことが多い** のです。

### よくある症状: 400 invalid\_image\_file

```json theme={null}
{
  "error": {
    "message": "Invalid image file or mode for image 1, please check your image file. ...",
    "code": "invalid_image_file"
  }
}
```

通常の原因は **MPO 形式**（Multi-Picture Object、複数フレームの JPEG コンテナ）です。Huawei Mateシリーズや同様のスマートフォンからそのまま出力された `.jpg` ファイルには HDR ゲインマップのサブフレームが埋め込まれており、実際には MPO です。厄介なのは、ファイルが同じ `FFD8` ヘッダーで始まることです。**拡張子、HTTP Content-Type、そして `file` コマンドはいずれも JPEG と報告します** が、フレームを認識するパースでしか真相は分かりません。

```python theme={null}
from PIL import Image
Image.open("photo.jpg").format   # "MPO" means you're hit; standard images return "JPEG"/"PNG"
```

2026年7月に確認済み（gpt-image-2 の edits エンドポイント）: MPO 画像は常に拒否されますが、同じ画像を標準的な JPEG/PNG に再エンコードすると **元のフル解像度（3072×4096）のまま** 成功します。問題はサイズではなく、形式です。この 400 は入力検証段階で素早く返され、**課金されません**。

### 推奨: サーバー側で一律に再エンコードする

写真を1枚ずつデバッグするより、アップロードパイプラインに再エンコードの工程を1つ追加してください。HEIC、CMYK、その他の非標準入力もまとめて吸収できます。

```python theme={null}
from PIL import Image
import io

def normalize_image(raw: bytes) -> bytes:
    """Any source image → standard JPEG that passes image-edit format validation"""
    im = Image.open(io.BytesIO(raw))
    im.load()                      # multi-frame formats (MPO etc.): keep the first frame only
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")     # normalize CMYK / P and other modes to RGB
    out = io.BytesIO()
    im.save(out, format="JPEG", quality=92)
    return out.getvalue()
```

再エンコード時には、データ量も削減してください（長辺は最大 4096、JPEG 品質は 80-92）。各画像は 1.5MB 未満に保つと、アップロード成功率と生成速度の両方が向上し、出力品質は入力ファイルサイズに依存しません。[gpt-image-2 の画像編集: 参照画像の形式要件と前処理](/ja/api-capabilities/gpt-image-2/image-edit#reference-image-format-requirements-and-preprocessing) を参照してください。

## 入力画像フォーマットの前処理

画像編集 / 参照画像エンドポイント（gpt-image-2 の`/v1/images/edits`など）は、入力として **png / jpg / webp** しか受け付けません。ユーザーが撮影した写真を扱う製品には、特に見落としやすい落とし穴があります。**スマホのカメラからそのまま出力された写真は、標準的な JPEG ではないことが多い** のです。

### 典型的な症状: 400 invalid\_image\_file

```json theme={null}
{
  "error": {
    "message": "Invalid image file or mode for image 1, please check your image file. ...",
    "code": "invalid_image_file"
  }
}
```

一般的な原因は **MPO フォーマット**（Multi-Picture Object、マルチフレーム JPEG コンテナ）です。`.jpg` Huawei Mate シリーズのスマートフォンからそのまま取り出したファイルは、HDR ゲインマップのサブフレームを埋め込んでおり、実際には MPO です。これらのファイルが厄介なのは、ヘッダーが同じ `FFD8` であることです。**拡張子、HTTP Content-Type、そして `file` コマンドのいずれも JPEG と報告する** ため、フレームを認識する解析だけが見分けられます。

```python theme={null}
from PIL import Image
Image.open("photo.jpg").format   # "MPO" means you're affected; standard files return "JPEG"/"PNG"
```

2026年7月確認済み（gpt-image-2 edit endpoint）: MPO ファイルは常に拒否されます。同じ画像を標準 JPEG/PNG として再エンコードすると成功し、**元の解像度のまま（3072×4096）** でも問題ありません。問題はサイズではなく、フォーマットです。この 400 は入力検証段階で素早く返され、**課金されません**。

### 推奨: サーバー側で一律に再エンコードする

画像を1枚ずつデバッグするより、アップロードパイプラインに再エンコード工程を1つ追加してください。HEIC、CMYK、その他の非標準入力にも対応できます。

```python theme={null}
from PIL import Image
import io

def normalize_image(raw: bytes) -> bytes:
    """Any input image → standard JPEG that passes image-edit endpoint validation"""
    im = Image.open(io.BytesIO(raw))
    im.load()                      # multi-frame formats (MPO etc.): keep only the first frame
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")     # normalize CMYK / P etc. to RGB
    out = io.BytesIO()
    im.save(out, format="JPEG", quality=92)
    return out.getvalue()
```

再エンコードの際に圧縮も行い（長辺は 4096px 以下、JPEG 品質は 80-92）、各画像を 1.5MB 以内に収めてください。アップロード成功率と生成速度の両方が向上し、出力品質は入力ファイルサイズとは無関係です。[gpt-image-2 画像編集 — 参照画像フォーマット要件と前処理](/ja/api-capabilities/gpt-image-2/image-edit#reference-image-format-requirements-and-preprocessing) を参照してください。

## 代わりにURL出力を取得する

信頼性の高い順に、次の3つの方法があります。

1. **URL が上流のデフォルトである** — FLUX（有効期限は約10分、CORSヘッダーなし。すぐにダウンロードしてサーバー側で再ホストしてください）と Seedream（BytePlus 利用規約、約24時間）は、設定不要でネイティブに URL を返します。
2. **OSS グループ（決定論的な URL 出力 — 本番環境に推奨）**:
   * `image2_OSS` グループ: **GPT-Image-2-All / VIP** をカバーします（1x レート倍率、追加料金なし）。base64 フォールバックなしで安定した URL 出力を得るには、token をこのグループに切り替えてください。**公式の GPT-Image-2 チャネルはまだ対象外です。**
   * `NB_OSS` ベータグループ: Nano Banana シリーズをカバーし、画像 URL は `text` フィールドで返されます — [NB-OSS グループガイド](/ja/api-capabilities/nano-banana-oss-group) をご覧ください。
3. **明示的な `response_format: "url"`** — GPT-Image-2-All / VIP（R2 CDN、約24時間）と Seedream のみが受け付けます。適用範囲は**狭く**、公式の GPT-Image-2 チャネルはこれを渡すと 400 を返します。これはデフォルトグループに対するリクエスト単位の切り替えであり、URL に依存するビジネスでは代わりに OSS グループを使うべきです。

**GPT-Image-2（公式）には、現時点で URL 出力の経路がまったくありません** — base64 のみです。

<Warning>
  これらのプラットフォームが返す image URL はすべて**一時リンク**です（10分から24時間）。長期保存が必要なもの — 商品画像、ユーザー作成物、履歴 — は、生成後すぐに**自社のオブジェクトストレージ / CDN に再ホスト**し、独自の URL をデータベースに保存してください。
</Warning>

## タイムアウトと切断のトラブルシューティング

すでに SDK のタイムアウトを引き上げているのに、まだ「timeouts」が頻繁に発生する場合は、次のチェックリストに沿って確認してください。

<Steps>
  <Step title="実効的なクライアント側タイムアウトを確認する">
    フレームワークは、HTTP クライアントを別のタイムアウト層（タスクキューのワーカー制限、サーバーレスの実行上限など）で包んでいることがよくあります。モデルの生成時間より短い層が 1 つでもあると、リクエストはそこで終了します。
  </Step>

  <Step title="中継経路を確認する: nginx / ロードバランサー / CDN">
    自己ホストのリバースプロキシ（`proxy_read_timeout`）、クラウドのロードバランサーのアイドルタイムアウト、CDN のオリジンタイムアウトは、**通常は 60 秒が既定**であり、クライアントより先に接続を切断してしまいます。長時間リクエストの経路上にある各ホップの設定を広げる必要があります。
  </Step>

  <Step title="アイドル接続が回収されないように keep-alive を有効にする">
    長時間にわたってバイトが流れない接続は、NAT デバイスやファイアウォールによって静かに切断されることがあります。TCP または HTTP の keep-alive により、その可能性を大幅に下げられます。
  </Step>

  <Step title="request ID とコンソールログを使って課金を確認する">
    `x-request-id` レスポンスヘッダーを記録し、APIYI コンソールの呼び出しログで照合してください。その呼び出しが表示されていれば、サーバー側では生成が完了し、リクエストの課金も行われています。接続は経路のこちら側で切断されています。
  </Step>
</Steps>

## タスク形式の非同期管理をご希望ですか？

プラットフォームは async API を提供していませんが、同期エンドポイントの上に独自の非同期シェルを構築できます:

<CardGroup cols={3}>
  <Card title="非同期APIがない理由" icon="circle-question-mark" href="/ja/faq/image-async-api">
    よくある質問: 非同期の画像 API はありますか？ task ID で結果を照会できますか？
  </Card>

  <Card title="独自の非同期キューを構築する" icon="list-checks" href="/ja/api-capabilities/image-async-queue">
    エンジニアリングガイド: 同期呼び出しを、独自の task\_id、永続化、再試行を備えたタスクキューでラップします
  </Card>

  <Card title="NB-OSS URL 出力グループ" icon="cloud-upload" href="/ja/api-capabilities/nano-banana-oss-group">
    Nano Banana の出力を URL に切り替えて、base64 の転送オーバーヘッドを削減します
  </Card>
</CardGroup>
