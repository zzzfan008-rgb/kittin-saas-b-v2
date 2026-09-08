> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan 動画生成（Alibaba Cloud Tongyi Wanxiang）

> Alibaba Cloud Tongyi Wanxiang Wan2.7 動画生成の完全ガイド: テキストから動画 / 画像から動画（音声駆動付き）/ 参照から動画 / 動画編集。統一された DashScope 非同期エンドポイント、720P / 1080P、2-15 秒の長さ。

## 概要

**Wan (Tongyi Wanxiang)** は Alibaba Cloud の動画生成モデルシリーズです。APIYI は **DashScope パススルー・チャネル** を通じて Alibaba Cloud Model Studio に直接接続するため、1つの APIYI キー（`sk-`で始まる）だけで、別途 Alibaba Cloud アカウントを用意することなく、すべての Wan 動画機能を利用できます。現在のフラッグシップは **Wan2.7** で、次の4つの主要ユースケースをカバーします。

| ユースケース         | モデル ID             | 入力                               | 出力                                     |
| -------------- | ------------------ | -------------------------------- | -------------------------------------- |
| **テキストから動画生成** | `wan2.7-t2v`       | テキスト prompt                      | 5-15 秒のショート動画                          |
| **画像から動画生成**   | `wan2.7-i2v`       | 最初のフレーム + prompt（任意のドライビングオーディオ） | 静止画像に命を吹き込み、音声を追加してリップシンク / ラップに対応     |
| **参照から動画生成**   | `wan2.7-r2v`       | 1-5 の参照画像/動画 + prompt            | 参照対象を保持した単一キャラクターまたは複数キャラクターの動画。音声参照付き |
| **動画編集**       | `wan2.7-videoedit` | 動画 + 1-5 の参照画像 + 編集指示            | 編集済み動画: 衣装の差し替え、背景の差し替えなど              |

<Note>
  **🎬 重要ポイント**: 4つの機能はすべて同じ非同期エンドポイントと同じリクエスト構造を共有します。**`model` フィールドを変更するだけでユースケースを切り替えられます。** 720P / 1080P 解像度と 2-15 秒の整数再生時間をネイティブにサポートし、`wan2.7-i2v` もリップシンク用のドライビングオーディオに対応します。ショート動画制作、Eコマース素材、デジタルヒューマンのナレーション、クリエイティブなマーケティングに最適です。
</Note>

<CardGroup cols={2}>
  <Card title="テキストから動画生成 API" icon="wand-sparkles" href="/ja/api-capabilities/wan/text-to-video">
    `wan2.7-t2v` は、純粋な prompt から動画を生成する、最もシンプルな入口です。
  </Card>

  <Card title="画像から動画生成 API" icon="image" href="/ja/api-capabilities/wan/image-to-video">
    `wan2.7-i2v` は、最初のフレームと、リップシンク / ラップ用の任意のドライビングオーディオを受け取ります。
  </Card>

  <Card title="参照から動画生成 API" icon="users" href="/ja/api-capabilities/wan/reference-to-video">
    `wan2.7-r2v` は、参照画像/動画から被写体の特徴を保持し、音声参照に対応します。
  </Card>

  <Card title="動画編集 API" icon="scissors" href="/ja/api-capabilities/wan/video-edit">
    `wan2.7-videoedit` は、参照画像を使って動画を編集します: 衣装の差し替え、背景の差し替えなど。
  </Card>

  <Card title="Visual API テスト" icon="flask-conical" href="https://icover.ai/wan-official">
    iCover のビジュアルテストツールでこのエンドポイントを直接デバッグできます — コードは不要です。
  </Card>

  <Card title="非同期タスクの照会 / ダウンロード" icon="list-checks" href="https://api.apiyi.com/task">
    APIYI コンソールで送信済みの動画タスクを表示し、動画リンクをダウンロードできます — API の外にある参照エントリです。
  </Card>
</CardGroup>

## AIエージェントに統合を任せる

<Note>
  Codex / Claude Code / Cursor を使っているなら、下のプロンプトをコピーしてエージェントに渡してください。まずこのページのプレーンテキスト版を取得し（任意の docs URL に `.md` を付ける）、その後はあなたのプロジェクトのスタックに合わせてコードを書きます。非同期ポーリング、**なぜ `/v1/videos` を使ってはいけないのか**、不足している `X-DashScope-Async` エラー、および整数 `duration` ルールは、すでに要件に組み込まれています。
</Note>

<Prompt description="Codex、Claude Code、Cursor などのツールに貼り付けて、Wan2.7 の text-to-video、image-to-video、reference-to-video、video editing を統合またはトラブルシュートできるコーディングエージェントを使ってください。" icon="bot" actions={["copy"]}>
  このプロジェクトで Wan2.7 の video generation（text-to-video、image-to-video、reference-to-video、video editing）を統合／トラブルシュートしてください。

  コードに触る前に docs を読んでください。このページのプレーンテキスト版は [https://docs.apiyi.com/en/api-capabilities/wan/overview.md](https://docs.apiyi.com/en/api-capabilities/wan/overview.md) を取得してください。4 つの機能それぞれに個別ページ（text-to-video、image-to-video、reference-to-video、video-edit）があり、`.md` のサフィックスは同じです。

  要件:

  1. エンドポイントと非同期ヘッダー（**最初に詰まりやすい 2 点**）：送信先は `POST /wan/api/v1/services/aigc/video-generation/video-synthesis` でなければならず、**ヘッダー `X-DashScope-Async: enable` を必ず付与**しないと、上流は `current user api does not support synchronous calls` を返します。**`/v1/videos` は絶対に使わないでください** — そのルートでは `media` フィールドが落ち、上流はその後 `[InvalidParameter] Field required: input.media` を返します。ポーリングは **別のプレフィックス** を使います: `GET /v1/tasks/{task_id}`（ポーリング時に非同期ヘッダーは不要です）。

  2. ポーリングとステータス: タスク ID は送信レスポンス内の **`output.task_id`** にあります。5〜10 秒ごとにポーリングし、**3 秒未満では絶対に送らないでください**。さもないと rate limited になります。クライアント側には全体で 20 分の上限を設けてください。ステータスは `submitted`、`in_progress`、`completed`、`failed` で、**成功は `completed`** です。`progress` の値が長時間 30 パーセントで止まっていても正常です — 上流は 0、10、30、100 しか返しません — なのでハングとみなさないでください。タスク ID 自体を照会できるのは **24 時間** だけで、その後は `UNKNOWN` になります。

  3. 動画の取得: アドレスはトップレベルの **`result_url`** で、24 時間で失効する Alibaba Cloud OSS の署名付きリンクです。**サーバー側で即座にダウンロードし、自前のオブジェクトストレージまたは CDN に再ホストしてください**。長期保存用のアドレスとして保持してはいけません。ダウンロード時に `Authorization` ヘッダーを送らないでください — 送ると 403 と `SignatureDoesNotMatch` が返ります。

  4. ボディの形状と型: ボディは DashScope のネストされた形式で、`{ model, input: { prompt, media[] }, parameters: { ... } }` です。フラットなオブジェクトではありません。2 つの型の落とし穴があります。**`duration` は整数 `5` でなければならず、文字列 `"5"` ではありません**（そうしないと `cannot unmarshal string into Go struct field ... of type int` になります）。また、**`resolution` は大文字の `720P` または `1080P` でなければなりません** — このモデルには **480P の階層はありません**。

  5. 主要パラメータ: `duration` は 2 〜 15 の整数で、デフォルトは 5 です（**参照動画がある場合は 10 を超えてはいけません**）。`ratio` は `16:9`、`9:16`、`1:1`、`4:3`、`3:4` のいずれかで、デフォルトは `16:9` です。ただし、**最初のフレーム画像が指定されると `ratio` は自動的に無視されます**。`prompt_extend` のデフォルトは `true` で、オンにすることを強く推奨します。**`wan2.7-r2v` のデフォルトは `resolution` で `1080P` であり、`720P` ではありません** — さらに課金は解像度別の階層制なので、これを暗黙のままにすると、気付かないうちに高い階層を選んでしまいます。必ず明示的に設定してください。`wan2.7-videoedit` では出力長はソース動画に従い、`duration` は影響しません（また、モデル名には **`videoedit` にハイフンがありません** — `video-edit` と書かないでください）。

  6. メディア入力: これらは `input.media[]` にあり、各エントリは `{"type": ..., "url": ...}` という形です。文書化された契約どおり、`url` は **公開 GET 可能な https リンク** でなければなりません。機能ごとの型と数は次のとおりです。`first_frame` は最大 1 件（i2v と r2v）；`reference_image` と `reference_video` は r2v で **合計最大 5 件**；`driving_audio` は **i2v のみでサポート**；そして video editing では 1 件の `video` と 1 〜 5 件の `reference_image` エントリが必要です。reference-to-video のプロンプトでは、`media` 配列の順序に従って、画像 1、画像 2、動画 1、動画 2 のように位置で入力を参照し、画像と動画は別々に数えてください。

  7. 課金と冪等性: **課金は 1 秒単位で、解像度別の階層制です**。1080P は 720P よりかなり高くなります。`failed` で終了したタスクは **課金されません** が、**同じタスクを再送すると再度課金されます** — やみくもに自動リトライするのではなく、冪等性のために自社の business ID と `task_id` の対応を保持してください。エラーは 2 段階で発生します。送信時の拒否（HTTP 4xx/5xx と、`task_error` や `parse_request_failed` のような `type` を伴う）はリクエストボディが間違っていることを意味するので、リトライではなく修正してください。実行中の失敗は、`error.message` に角括弧付きプレフィックスが付く `failed` タスクとして現れます。`[InvalidImageUrl]` は一時的に到達不能なメディアリンクであるだけかもしれず、リトライの価値がありますが、`[InvalidParameter]` やセンシティブワードによる拒否は **リトライしてはいけません**。5xx とネットワークエラーには指数バックオフ（1s、4s、16s）を使ってください。

  8. token 要件: このモデルには `Wan&HappyHorse` グループを持ち、**pay-as-you-go または PAYG-priority** の課金モードを持つ token が必要です。**per-call token ではこのモデルにルーティングできず**、利用可能なチャネルがないというエラーになります。

  9. 鍵は `APIYI_API_KEY` 環境変数から読み取ってください。ハードコードしてはいけませんし、git にコミットしてもいけません。

  10. 完了したら、実際に text-to-video を 1 回、image-to-video を 1 回実行し、その動画と 2 つの呼び出しにかかった費用を見せてください。全体のフローには数分かかるので、制約のある実行環境で実行する場合はコマンドのタイムアウトを 600 秒以上に上げるか、バックグラウンドで実行してください。
</Prompt>

<Accordion title="このプロンプトが防いでくれること">
  | Requirement                 | 防げる落とし穴                                                                                         |
  | --------------------------- | ----------------------------------------------------------------------------------------------- |
  | `/v1/videos` は使わない          | そのルートでは `media` が静かに落ち、`input.media` が不足しているという上流の文句が、実際には誤ったエンドポイントであるにもかかわらずパラメータ不備のように見えてしまう |
  | `X-DashScope-Async` ヘッダー    | これがないと呼び出しは同期として扱われ、即座に拒否される                                                                    |
  | 送信とポーリングのプレフィックスは異なる        | 送信は `/wan/api/v1/...` で、ポーリングは `/v1/tasks/{task_id}` で行われる                                      |
  | `duration` は文字列ではなく整数       | `"5"` はデシリアライズに失敗し、`resolution` も大文字でなければならない                                                   |
  | `r2v` のデフォルトは 1080P         | これを暗黙のままにすると、より高い料金階層が静かに選ばれ、1 秒あたりのコストが 2 倍になる                                                 |
  | 再送すると再度課金される                | 失敗自体は無料ですが、無条件の再試行は実際の費用がかかります — 独自の冪等性が必要です                                                    |
  | `Authorization` なしでダウンロードする | 署名付き OSS リンクに認証を送ると、代わりに 403 が返ります                                                              |
</Accordion>

## APIYI で Wan を使う理由

<CardGroup cols={2}>
  <Card title="すべての機能に対応する1つの Key" icon="key">
    Alibaba Cloud への登録も、リージョン設定も、環境変数も不要です。1つの APIYI Key で、Wan2.7 の4つすべての機能と [HappyHorse シリーズ](/ja/api-capabilities/happyhorse/overview) を利用できます。
  </Card>

  <Card title="VPN 不要の直接アクセス" icon="globe">
    `api.apiyi.com` に直接接続でき、中国本土のデータセンターからも家庭用ネットワークからも利用可能です。Alibaba Cloud のリージョナルエンドポイントを設定する必要はありません。
  </Card>

  <Card title="失敗時は課金なし" icon="circle-check">
    `failed` で終了するタスク（到達不能なメディア URL、センシティブな prompt、上流側の容量不足など）は **課金されません**。そのため、自由に再試行できます。
  </Card>

  <Card title="DashScope プロトコルのパススルー" icon="plug">
    リクエストボディは Alibaba Cloud のネイティブな DashScope プロトコルに 1 対 1 でマッピングされるため、公式ドキュメントに従って移行できます。レスポンスは、ポーリングしやすいように正規化されています。
  </Card>
</CardGroup>

## 主な機能

<CardGroup cols={2}>
  <Card title="4-in-1非同期エンドポイント" icon="list-check">
    t2v / i2v / r2v / video-edit は `POST /wan/api/v1/...video-synthesis` を共有します。送信して `task_id` を取得し、ポーリングしてダウンロードできます。バッチ管理も簡単です。
  </Card>

  <Card title="音声駆動のリップシンク" icon="volume-2">
    `wan2.7-i2v` は `driving_audio` をサポートし、静止ポートレートを音声の口の動きとリズムに合わせます。ラップ / ナレーション / デジタルヒューマンに最適です。
  </Card>

  <Card title="複数被写体のリファレンス" icon="users">
    `wan2.7-r2v` はリファレンス画像 + リファレンス動画（合計5件まで）を組み合わせ、prompt 内では「image 1 / video 1」として参照できます。音声リファレンスにも対応しています。
  </Card>

  <Card title="複数の解像度と長さ" icon="expand">
    720P / 1080P の解像度、2-15秒の整数指定の長さ。`prompt_extend`スマートリライトで、短い prompt の品質をさらに向上させます。
  </Card>
</CardGroup>

## 対応モデル

| モデル ID             | 機能       | 必須メディア入力                                       | 注記                              |
| ------------------ | -------- | ---------------------------------------------- | ------------------------------- |
| `wan2.7-t2v`       | テキストから動画 | なし                                             | 純粋なテキスト生成                       |
| `wan2.7-i2v`       | 画像から動画   | `first_frame` (+ オプションの `driving_audio`)       | 音声ドライブをサポートする唯一の機能です            |
| `wan2.7-r2v`       | 参照から動画   | `reference_image` / `reference_video` (最大 5 件) | `reference_voice` の音声参照をサポートします |
| `wan2.7-videoedit` | 動画編集     | `video` + `reference_image` (1-5)              | 編集モデル名には **ハイフンがありません**         |

<Warning>
  `wan2.7-videoedit` は、画像を使って動画を編集するためのものです。別の `wan2.7-image-pro` は **画像** モデル（`/v1/images/generations` を使用します）であり、この動画エンドポイントの対象外ですので、混同しないでください。従来の Wan2.6 シリーズについては、[過去のバージョン](/ja/api-capabilities/wan/historical-versions) をご覧ください。
</Warning>

## ⚠️ エンドポイントの選択（最重要）

APIYI は 2 つのパスをマウントしますが、**Wan のすべての機能を完全にサポートするのは DashScope パススルーエンドポイントのみです**。

| Path                                                         | プロトコル形式              | i2v / r2v の利用可否    | 判定                 |
| ------------------------------------------------------------ | -------------------- | ------------------ | ------------------ |
| `/v1/videos`                                                 | OpenAI のフラット形式       | ❌ メディアフィールドは破棄されます | **使用しないでください**     |
| `/wan/api/v1/services/aigc/video-generation/video-synthesis` | DashScope ネイティブパススルー | ✅ 完全にサポート          | **必ずこちらを使用してください** |

<Warning>
  もしどのドキュメントやサンプルが Wan の動画タスクを `/v1/videos` 経由で送信するよう案内していても、**無視してください**。そのパスの i2v / r2v `media` フィールドへの対応は不完全で、上流のエラー `[InvalidParameter] Field required: input.media` を引き起こします。Wan の動画作成リクエストはすべて `/wan/api/v1/...video-synthesis` に送信されます。
</Warning>

## 非同期呼び出しフロー

全体のフローは 3 つの非同期ステップです: **タスクを作成 → ステータスをポーリング → 動画をダウンロード**。

<Steps>
  <Step title="タスクを作成">
    `POST /wan/api/v1/services/aigc/video-generation/video-synthesis` ヘッダー `X-DashScope-Async: enable` を付けてください。すると `task_id` が即座に返されます。
  </Step>

  <Step title="ステータスをポーリング">
    `GET /v1/tasks/{task_id}`（`Authorization` 付き）で、5-10 秒ごとに 1 回（**3 秒未満には絶対にしないでください**）、`status` が `completed` になるまで続けます。
  </Step>

  <Step title="動画をダウンロード">
    レスポンスの `result_url` から mp4 を直接 GET します。**`Authorization` ヘッダーは送信しないでください**（これは OSS 署名付きの直接リンクであり、Auth を追加すると 403 になります）。
  </Step>
</Steps>

### タスクステータスの参照

`status` フィールドの `GET /v1/tasks/{task_id}` レスポンスのトップレベル（APIYI によりすでに正規化済み）:

| ステータス         | 意味         | 次のステップ                                               |
| ------------- | ---------- | ---------------------------------------------------- |
| `submitted`   | 送信済み、キュー待ち | ポーリングを続ける                                            |
| `in_progress` | 生成中        | ポーリングを続ける（進捗は 30% で止まりがちですが、それは上流の粗い報告であり、停止ではありません） |
| `completed`   | 成功         | `result_url` からダウンロード                                |
| `failed`      | 失敗         | `error.message` / `fail_reason` を確認                  |

### 完全版 Python クライアント

```python theme={null}
import json, time, urllib.request

BASE = "https://api.apiyi.com"
KEY  = "sk-your-api-key"   # your APIYI Key

def post(path, body):
    h = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
         "X-DashScope-Async": "enable"}
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers=h, method="POST")
    return json.loads(urllib.request.urlopen(req).read())

def get(path):
    req = urllib.request.Request(BASE + path, headers={"Authorization": f"Bearer {KEY}"})
    return json.loads(urllib.request.urlopen(req).read())

# 1. Create the task (switch use cases by changing only model and media)
r = post("/wan/api/v1/services/aigc/video-generation/video-synthesis", {
    "model": "wan2.7-t2v",
    "input": {"prompt": "A lighthouse on the seashore at dusk, the camera slowly pushing in, waves gently lapping the rocks, seabirds calling"},
    "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True, "watermark": True}
})
task_id = r["output"]["task_id"]
print("task_id:", task_id)

# 2. Poll (every 5-10 seconds)
while True:
    info = get(f"/v1/tasks/{task_id}")
    status = info["status"]
    print("status:", status, "progress:", info.get("progress"))
    if status == "completed":
        url = info["result_url"]
        break
    if status == "failed":
        raise RuntimeError(info.get("error") or info.get("fail_reason"))
    time.sleep(10)

# 3. Download (do not send Authorization! result_url is an OSS signed direct link)
urllib.request.urlretrieve(url, "out.mp4")
print("saved out.mp4")
```

## 主要パラメータの説明

送信時、リクエストボディは DashScope のネスト構造を使用します: `{ model, input: { prompt, media[] }, parameters: {...} }`.

### `input` のフィールド

| 項目                | 型      | 必須                | 備考                                                                     |
| ----------------- | ------ | ----------------- | ---------------------------------------------------------------------- |
| `prompt`          | string | ✓                 | 自然言語による説明; wan2.7-r2v はメディアを参照するための "image 1 / video 1" マーカーをサポートしています |
| `negative_prompt` | string |                   | ネガティブプロンプト、500文字以下                                                     |
| `media`           | array  | i2v/r2v/edit では必須 | メディアアセット配列。詳細は下記参照                                                     |

### `media[]` の種類

| `type`            | 用途                               | 適用モデル          |
| ----------------- | -------------------------------- | -------------- |
| `first_frame`     | 最初のフレーム画像（1枚以下）                  | i2v, r2v       |
| `reference_image` | 参照画像（被写体/シーンを保持）                 | r2v, videoedit |
| `reference_video` | 参照動画（被写体/音声の参照）                  | r2v            |
| `driving_audio`   | 駆動音声（リップシンク）                     | **i2v のみ**     |
| `video`           | 入力動画                             | videoedit      |
| `reference_voice` | 音声参照（reference\_image/video に添付） | r2v            |

各メディアオブジェクトには少なくとも `type` + `url` が必要です。`url` は、GET で直接取得できる公開 https リンクである必要があります（ローカルファイルは先に OSS / CDN にアップロードしてください）。

### `parameters` のフィールド

| 項目              | 型      | 値                                       | 備考                                          |
| --------------- | ------ | --------------------------------------- | ------------------------------------------- |
| `resolution`    | string | `720P` / `1080P`                        | 大文字。明示的に指定することを推奨します                        |
| `ratio`         | string | `16:9` / `9:16` / `1:1` / `4:3` / `3:4` | アスペクト比。最初のフレームが指定されている場合は自動的に無視されます         |
| `duration`      | int    | 2-15                                    | 秒数（整数）。通常は 5 / 10 で、参照動画が含まれる場合は 10 に制限されます |
| `prompt_extend` | bool   | `true` / `false`                        | スマートな prompt の書き換え、**`true` を強く推奨します**      |
| `watermark`     | bool   | `true` / `false`                        | 右下隅に「AI generated」ウォーターマーク                  |
| `seed`          | int    | 0-2147483647                            | これを固定すると再現性が向上します                           |

<Tip>
  `duration` は **整数** `5` でなければならず、文字列の `"5"` ではありません。そうしないと `cannot unmarshal string into Go struct field ... of type int` になります。`resolution` を **大文字** で書く（`720P`）ほうがより確実です。
</Tip>

## Wan と HappyHorse の選び方

Wan と [HappyHorse](/ja/api-capabilities/happyhorse/overview) はどちらも Alibaba の動画モデルで、同じエンドポイントとスキーマを共有しています（モデル名の `model` を変えるだけで切り替え可能です）。ただし、強みは異なります。

| 項目                       | Wan2.7                                    | HappyHorse-1.1                |
| ------------------------ | ----------------------------------------- | ----------------------------- |
| 音声駆動のリップシンク (i2v)        | ✅ `wan2.7-i2v` は `driving_audio` に対応しています | ❌ 非対応、i2v は先頭フレームのみを使用します     |
| reference-to-video の画像上限 | 参照画像 + 参照動画で合計 5 枚まで                      | 参照画像は最大 9 枚                   |
| 動画編集用の参照画像               | ≤5                                        | ≤5                            |
| 被写体一貫性のスタイル              | 複数被写体の相互作用、音声参照                           | 「動的な映像を忠実に再現する」方向で、被写体の安定性を重視 |

<Tip>
  **リップシンク / ラップ / デジタルヒューマンのナレーションが必要** → `wan2.7-i2v` を選んでください（音声駆動に対応している唯一のモデルです）。
  **被写体の一貫性を保つために多くの参照画像が必要** → [HappyHorse r2v（最大 9 画像）](/ja/api-capabilities/happyhorse/reference-to-video) を検討してください。
</Tip>

## ベストプラクティス

<Steps>
  <Step title="まずは 720P / 5 秒から試す">
    開発中は、低解像度の短いクリップで prompt とカメラ指示をすばやく検証し、確定後に 720P / 1080P やより長い再生時間へ段階的に引き上げて、コストと待ち時間を抑えます。
  </Step>

  <Step title="prompt_extend を常に有効にする">
    `prompt_extend: true` は、短い prompt の品質を明確に向上させますが、追加の生成時間は数秒だけです。
  </Step>

  <Step title="5〜10 秒ごとにポーリングする">
    3 秒未満にはしないでください（レート制限がかかります）。また、長時間タスクで無期限にブロックしないでください。720P / 5 秒は通常 70〜140 秒かかり、1080P / より長いクリップでは 5 分を超えることがあります。
  </Step>

  <Step title="保険として 20 分のクライアントタイムアウトを設定する">
    1080P や 10 秒を超えるクリップはかなり遅くなります。ポーリングループには 20 分の保険タイムアウトを設定してください。
  </Step>

  <Step title="result_url を受け取ったらすぐにダウンロードする">
    `result_url` はデフォルトで **24 時間で期限切れ** になり、OSS の署名付き直リンクです。そのため、ダウンロード時に **Authorization ヘッダーを送らないでください**。本番では、必ず自前の OSS / CDN に再保存してください。
  </Step>

  <Step title="送信を冪等にする">
    失敗したタスクは課金されませんが、同じタスクを再送すると再度課金されます。誤課金を防ぐため、アプリ層で「業務 ID → task\_id」の対応表を管理してください。
  </Step>
</Steps>

## エラーコードと再試行

エラーは 2 つの段階から発生し、扱いが異なります。

| ソース                                | シグネチャ                                                                                                  | 対応                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| **作成段階（APIYI に拒否される）**             | HTTP 4xx/5xx、`type` は `task_error` / `parse_request_failed` / `build_request_failed`                   | ボディを修正して再試行してください（通常はフィールド型の誤り、メディアの欠落、またはエンドポイントの誤りです） |
| **実行段階（上流の Alibaba Cloud に拒否される）** | タスクが `status=failed` で終了し、`error.message` が `[InvalidParameter]` / `[InvalidImageUrl]` などで角括弧付きで前置されます | 角括弧内のヒントを確認してください。通常は到達できないメディア URL か、センシティブな prompt です |

<Info>
  **推奨されるクライアントの挙動**: HTTP 5xx / ネットワークエラーでは指数バックオフで再試行してください（1s / 4s / 16s）。HTTP 4xx は再試行せず即座に表面化してください。`failed` タスクで `[InvalidImageUrl]` がある場合は再試行できます（ネットワークの一時的な問題の可能性があります）が、`[InvalidParameter]` / センシティブワードは再試行しないでください。
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="なぜ /v1/videos を使って Wan のタスクを送信できないのですか？">
    `/v1/videos` は OpenAI のフラットスタイルのエンドポイントで、Wan の i2v / r2v への対応が不完全です。`media` のようなメディアフィールドは削除され、上流の Alibaba Cloud は `[InvalidParameter] Field required: input.media` を返します。**Wan の動画作成リクエストはすべて `/wan/api/v1/services/aigc/video-generation/video-synthesis` に送られます**、クエリは常に `/v1/tasks/{task_id}` に送られます。
  </Accordion>

  <Accordion title="X-DashScope-Async: enable ヘッダーは何をしますか？必須ですか？">
    エンドポイントに「これは非同期タスクです。task\_id をすぐ返し、ブロックしないでください」と伝えます。**作成リクエストでは必須です**。省略すると `current user api does not support synchronous calls` が返されます。クエリ呼び出し（GET）ではこのヘッダーは不要です。
  </Accordion>

  <Accordion title="なぜ /wan/api/v1/tasks/{id} ではなく /v1/tasks/{id} でクエリするのですか？">
    APIYI はすべての動画タスクのクエリを `/v1/tasks/{task_id}` に正規化します。どのパスでタスクを作成しても、この 1 つのエンドポイント経由でクエリし、レスポンスのトップレベルの `status` / `progress` / `result_url` / `error` フィールドは一貫しています。
  </Accordion>

  <Accordion title="result_url のダウンロードで 403 / SignatureDoesNotMatch が返る場合はどうすればよいですか？">
    `Authorization` ヘッダーを外してください。`result_url` はすでに Alibaba Cloud OSS の事前署名済み直接リンクです。ここに APIYI Key を追加すると OSS が拒否します。

    ```bash theme={null}
    curl -L -o out.mp4 "$RESULT_URL"          # ✅ correct
    curl -L -H "Authorization: Bearer $KEY" -o out.mp4 "$RESULT_URL"   # ❌ wrong
    ```
  </Accordion>

  <Accordion title="result_url の有効期限が切れたらどうなりますか？">
    リンクの有効期間はデフォルトで **24 時間** です。期限切れ後に `/v1/tasks/{task_id}` を再度 GET すると、通常は新しい `result_url` が取得できますが、task\_id 自体のクエリ有効期間も 24 時間です（その後は `UNKNOWN` が返ります）。長期保存する場合は、できるだけ早くご自身のストレージにダウンロードしてください。
  </Accordion>

  <Accordion title="progress が 30% で止まっているのですが、ハングしていますか？">
    いいえ。上流の Alibaba Cloud が報告する進捗は粗い粒度です（0% / 10% / 30% / 100% の区分のみ）。**`status` がまだ `in_progress` である限り、待ち続けてください**。通常は 30% から 100% に一気に進みます。
  </Accordion>

  <Accordion title="1つの Key で同時にいくつのタスクを実行できますか？">
    実際には 4〜8 件を一度に送信してもレート制限にかかりません。本番では、同時にアクティブなタスクは ≤10 にしてください。それ以上はキューに入ります。クエリ API のデフォルト RPS はかなり高めですが、5〜10 秒のポーリング間隔を推奨します。
  </Accordion>

  <Accordion title="失敗したタスクは課金されますか？">
    `status=failed` は課金されません。ただし、同じタスクを再送信すると再度課金されるため、冪等にしてください。テスト時は `prompt_extend` をオフにして、720P / 5 秒 / 短い prompt を使うと単価を下げられます。
  </Accordion>

  <Accordion title="wan2.6 はまだ利用できますか？">
    はい。Wan2.6 シリーズ（`wan2.6-r2v-flash` を含む）も引き続き呼び出し可能リストにあり、Wan2.7 と同じプロトコルです。変更するのは `model` 名だけです。[過去のバージョン](/ja/api-capabilities/wan/historical-versions) をご覧ください。
  </Accordion>
</AccordionGroup>

## グループ設定

Wan と [HappyHorse](/ja/api-capabilities/happyhorse/overview) シリーズは、単一の`Wan&HappyHorse`グループを共有します — 1つの Token で両方のシリーズを呼び出せます。動画モデルは1秒単位で課金されるため、Token が正常にルーティングされるには2つの条件を満たす必要があります:

1. **課金モデル**: **Pay-as-you-go Priority** または **Pay-as-you-go** を選択してください — 動画は1秒単位で課金されるため、**Pay-per-request Token はルーティングできません**
2. **グループ**: `Wan&HappyHorse`を含むグループを選択してください

<Frame caption="Create Token: set billing model to Pay-as-you-go Priority and group to Wan&HappyHorse (0.14x) to call every Wan2.7 and HappyHorse video model (the screenshot shows the group's former name Wan, since renamed to Wan&HappyHorse)">
  <img src="https://mintcdn.com/apiyillc/5-SttsT0c5VQwgVz/images/wan-token-group-setup-20260523.png?fit=max&auto=format&n=5-SttsT0c5VQwgVz&q=85&s=f46887cb88777eb34d70837983f1fc49" alt="Token作成ダイアログ: 課金モデルを Pay-as-you-go Priority に設定し、グループのドロップダウンに Wan&HappyHorse（レート 0.14x）を表示、1つの Token で Wan2.7 と HappyHorse の両方に使用可能" width="1286" height="988" data-path="images/wan-token-group-setup-20260523.png" />
</Frame>

## 価格

### デフォルト価格 = アリババの公式価格の98％（理解しやすい）

コンソールでは `Wan&HappyHorse` グループに **0.14x** のレートが表示されますが、これは内蔵の **RMB** 価格単位で表されています。APIYI は **USD を1:7の固定為替レート** で請求するため、実際の換算は次のとおりです:

```
0.14 (RMB pricing unit) × 7 (fixed exchange rate) = 0.98
```

言い換えると、**デフォルト価格 = アリババ公式価格の98%** です。アリババから直接購入するより安く、海外回線を自前で用意する必要もありません。

> 換算: **1秒あたりのUSD価格 = 公式RMB価格 × 0.14**（つまり `× 0.98 ÷ 7`）。たとえば、1080P の公式価格が ¥1.0/秒 の場合、\$0.14/秒 となり、コンソールに表示される `0.14x` とまったく同じです。

### 価格の詳細（デフォルト価格、秒単位課金）

Wan2.7 のテキストから動画生成 / 画像から動画生成 / 参照から動画生成 は同一価格で、2つの階層 — `720P` / `1080P`（480P はサポートされません）:

| 解像度     | 公式価格   | 当社のデフォルト /秒 | 5 秒    | 10 秒   | 12 秒   |
| ------- | ------ | ----------- | ------ | ------ | ------ |
| `720P`  | ¥0.6/秒 | \$0.084/秒   | \$0.42 | \$0.84 | \$1.01 |
| `1080P` | ¥1.0/秒 | \$0.14/秒    | \$0.70 | \$1.40 | \$1.68 |

<Info>
  * `wan2.7-r2v` のデフォルトは `1080P` で、参照メディアに動画が含まれる場合、継続時間は最大10秒に制限されます。
  * `wan2.7-videoedit`（動画編集）の出力継続時間は元動画に従い、`duration` ではなく実際の出力秒数で課金されます。
  * 表示価格は\*\*デフォルト（公式の98%）\*\*です。最大チャージボーナスを適用すると、実質価格はおおむね表の値の **÷ 1.2** になります（例: 1080P 5 秒 \$0.70 → 約 \$0.58）。
</Info>

### さらに低い実質価格を実現するチャージボーナスの積み上げ

[チャージボーナスプログラム](/ja/faq/recharge-promotions) に参加すると、付与残高は最大で約1.2倍まで増え、実質価格をさらに引き下げられます:

```
0.98 ÷ 1.2 ≈ 0.816
```

そのため、大口利用者は**公式価格の約81.6%** まで到達できます。

| 階層                        | 実質価格（Alibaba公式比） | 計算式                   |
| ------------------------- | ---------------- | --------------------- |
| デフォルト                     | **98%**          | レート 0.14x × 固定為替レート 7 |
| チャージボーナス適用時（大口利用者向けの最大階層） | **\~81.6%**      | 0.98 ÷ 1.2            |

<Info>
  * 課金単位 = **解像度階層 × 継続時間（秒）**。失敗したタスクは課金されません。
  * 1:7 は**固定精算レート**（優遇レートではありません）で、すべてのUSDチャージに一律で適用されます。
  * 最高ボーナス階層と対象チャネルについては、[チャージボーナス](/ja/faq/recharge-promotions)をご覧ください。最新レートは [コンソール](https://api.apiyi.com/token) が正です。
</Info>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="テキストから動画へのプレイグラウンド" icon="wand-sparkles" href="/ja/api-capabilities/wan/text-to-video">
    `wan2.7-t2v` ライブデバッグ + コードサンプル
  </Card>

  <Card title="画像から動画へのプレイグラウンド" icon="image" href="/ja/api-capabilities/wan/image-to-video">
    `wan2.7-i2v` 初期フレーム + 音声駆動
  </Card>

  <Card title="参照から動画へのプレイグラウンド" icon="users" href="/ja/api-capabilities/wan/reference-to-video">
    `wan2.7-r2v` 複数主体の参照 + 音声
  </Card>

  <Card title="動画編集プレイグラウンド" icon="scissors" href="/ja/api-capabilities/wan/video-edit">
    `wan2.7-videoedit` 服装 / 背景の差し替え
  </Card>

  <Card title="過去バージョン（Wan2.6）" icon="rotate-ccw-clock" href="/ja/api-capabilities/wan/historical-versions">
    Wan2.6 シリーズと移行ノート
  </Card>

  <Card title="HappyHorse シリーズ" icon="monitor-play" href="/ja/api-capabilities/happyhorse/overview">
    こちらも Alibaba ベースで、並列比較用の選定ガイド
  </Card>
</CardGroup>

<Info>
  Alibaba Cloud 公式ドキュメント（参考）: `help.aliyun.com/zh/model-studio/text-to-video-api-reference`。ご質問やご提案がある場合は、[APIYI コンソール](https://api.apiyi.com)でチケットを開いてください。
</Info>
