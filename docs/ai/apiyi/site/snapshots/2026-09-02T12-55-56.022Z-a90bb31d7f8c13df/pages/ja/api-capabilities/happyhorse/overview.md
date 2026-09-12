> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 動画生成 (Alibaba Cloud)

> Alibaba Cloud の HappyHorse-1.1 動画生成シリーズの完全ガイドです。Text-to-Video / Image-to-Video / Reference-to-Video（最大 9 枚の参照画像）/ Video Edit に対応し、統一された DashScope 非同期エンドポイントと高忠実度の被写体保持を提供します。

## 概要

**HappyHorse (快马)** は Alibaba の動画生成モデルシリーズで、**高忠実度の動的動画生成**に特化しています。テキストの意味を正確に理解し、被写体を安定して保ちながら、滑らかで自然、ディテール豊かで高品質な動画を出力します。APIYI は **DashScope パススルー チャネル** を通じて直接接続するため、1つの APIYI Key で HappyHorse のすべての機能を呼び出せます。現在のフラッグシップ版である **HappyHorse-1.1**（Video Edit は 1.0 のまま）では、次の4つの主要なユースケースをカバーします:

| ユースケース       | モデル ID                      | 入力                  | 出力                     |
| ------------ | --------------------------- | ------------------- | ---------------------- |
| **テキストから動画** | `happyhorse-1.1-t2v`        | テキスト prompt         | 短い動画                   |
| **画像から動画**   | `happyhorse-1.1-i2v`        | 先頭フレーム画像 + prompt   | 静止画に命を吹き込みます（音声駆動は非対応） |
| **参照画像から動画** | `happyhorse-1.1-r2v`        | 最大9枚の参照画像 + prompt  | 被写体とシーンを高忠実度で保持した動画    |
| **動画編集**     | `happyhorse-1.0-video-edit` | 動画 + 最大5枚の参照画像 + 指示 | ローカル／グローバルに編集された動画     |

<Note>
  **🐎 重要ポイント**: 4つの機能はすべて同じ非同期エンドポイントと同じリクエスト構造を共有しており、**ユースケースを切り替えると変わるのは `model` フィールドだけです**。HappyHorse は「高忠実度の動的動画」志向で、Reference-to-Video は **最大9枚の参照画像**、Video Edit は **最大5枚の参照画像** をサポートし、強い被写体一貫性を備えています。[Wan series](/ja/api-capabilities/wan/overview) と同じエンドポイントを共有しており、そのまま置き換えられます。
</Note>

<CardGroup cols={2}>
  <Card title="テキストから動画 API" icon="wand-sparkles" href="/ja/api-capabilities/happyhorse/text-to-video">
    `happyhorse-1.1-t2v`、純粋なテキスト prompt から動画を生成します。
  </Card>

  <Card title="画像から動画 API" icon="image" href="/ja/api-capabilities/happyhorse/image-to-video">
    `happyhorse-1.1-i2v`、先頭フレーム画像から動画を生成します（音声駆動は非対応です）。
  </Card>

  <Card title="参照画像から動画 API" icon="users" href="/ja/api-capabilities/happyhorse/reference-to-video">
    `happyhorse-1.1-r2v`、被写体を保持するために最大9枚の参照画像を使います。
  </Card>

  <Card title="動画編集 API" icon="scissors" href="/ja/api-capabilities/happyhorse/video-edit">
    `happyhorse-1.0-video-edit`、最大5枚の参照画像で動画を編集します。
  </Card>
</CardGroup>

## AI エージェントに統合を任せる

<Note>
  Codex / Claude Code / Cursor で構築する場合は、下のプロンプトをコピーしてエージェントに渡してください。まずこのページのプレーンテキスト版を取得し（任意の docs URL の末尾に `.md` を付けます）、その後プロジェクト固有のスタックでコードを書きます。— 非同期ポーリング、**なぜ `/v1/videos` を使ってはいけないのか**、`X-DashScope-Async` 欠落エラー、そして整数 `duration` のルールは、すでに要件に組み込まれています。
</Note>

<Prompt description="HappyHorse のテキスト→動画、画像→動画、参照→動画、動画編集を、コーディングエージェントに統合またはトラブルシュートさせましょう。Codex、Claude Code、Cursor などのツールにコピーして貼り付けてください。" icon="bot" actions={["copy"]}>
  このプロジェクトで HappyHorse の動画生成（テキスト→動画、画像→動画、参照→動画、動画編集）を統合／トラブルシュートしてください。

  コードに手を付ける前にドキュメントを読んでください: このページのプレーンテキスト版を取得するために [https://docs.apiyi.com/en/api-capabilities/happyhorse/overview.md](https://docs.apiyi.com/en/api-capabilities/happyhorse/overview.md) を取得してください。4つの機能それぞれに専用ページがあります（テキスト→動画、画像→動画、参照→動画、video-edit）— 末尾の `.md` サフィックスは同じです。

  要件:

  1. エンドポイントと非同期ヘッダー（**すぐに詰まりやすい2点**）: 送信先は `POST /wan/api/v1/services/aigc/video-generation/video-synthesis` でなければならず、**ヘッダー `X-DashScope-Async: enable` を必ず付ける必要があります**。**`/v1/videos` は絶対に使わないでください** — そのルートは `media` フィールドを落とし、上流はその結果として `[InvalidParameter] Field required: input.media` を返します。ポーリングでは **別のプレフィックス** を使います: `GET /v1/tasks/{task_id}`。その場合は `Authorization` ヘッダーが必要です。

  2. ポーリングとステータス: タスク ID は送信レスポンスの **`output.task_id`** にあります。5〜10秒ごとにポーリングし、**3秒より速くしないでください**。速すぎると rate limit されます。クライアントには全体で20分の上限を設けてください — 720P の5秒クリップは通常 105〜115秒ほどかかり、1080P やそれより長い動画は明らかにもっと時間がかかります。ポーリングレスポンスのステータスは `submitted`、`in_progress`、`completed`、または `failed` で、**成功は `completed`** です。`progress` の値が30パーセントのまま長時間止まっていても正常です — 上流の報告は粗いです — なのでハングとみなさないでください。タスク ID は **24時間** 有効です。

  3. 動画の取得: アドレスはポーリングレスポンス内の **`result_url`** で、24時間で **失効する** OSS 署名付きリンクです。**サーバー側でただちにダウンロードし、自分のオブジェクトストレージまたは CDN に再ホストしてください**。長期的なアドレスとして保持してはいけません。ダウンロード時に `Authorization` ヘッダーを **送らないでください**。送ると代わりに 403 が返ります。

  4. ボディの形状と型: ボディは DashScope のネストされた形式で、`{ model, input: { prompt, media[] }, parameters: { ... } }` です。フラットなオブジェクトではありません。2つの型の落とし穴があります: **`duration` は整数の `5` でなければならず、文字列の `"5"` ではありません**。また **`resolution` は大文字の `720P` または `1080P` でなければなりません** — このモデルには **480P ティアはありません**。

  5. モデル名とパラメーター: 4つのモデルは `happyhorse-1.1-t2v`、`happyhorse-1.1-i2v`、`happyhorse-1.1-r2v`、`happyhorse-1.0-video-edit` です。編集モデルは **`video-edit` にハイフンが付く** ことに注意してください。Wan の `videoedit` とは逆なので、混同しないでください。`duration` は 2〜15 の整数で、デフォルトは 5 です。`resolution` のデフォルトは `720P` です。`prompt_extend` のデフォルトは `true` で、オンのままにしておくのが最善です。注意点が2つあります: **HappyHorse の image-to-video は `driving_audio` をサポートしていません**（それは Wan 専用の機能です）ので、送っても何も起こりません。また **video editing は出力長を元動画から取得し、`duration` は効果がありません**。そのため通常は省略するだけで十分です。

  6. メディア入力: これらは `input.media[]` にあり、各エントリの形は `{"type": ..., "url": ...}` です。ここで `url` は **公開 GET 可能な https リンク** でなければなりません（JPEG、PNG、または WEBP）— ローカルファイルはまず自分のオブジェクトストレージにアップロードしてください。機能ごとの型と数は次のとおりです: image-to-video にはちょうど 1 件の `first_frame` が必要です。reference-to-video には 1〜9 件の `reference_image` エントリが必要です。video editing には 1 件の `video` と 1〜5 件の `reference_image` エントリが必要です。`media` を省略すると、アップストリームは image-to-video モデルには画像が必要だとエラーを返します。

  7. 課金と冪等性: **課金は解像度別の段階制で秒単位です**。1080P は 720P よりかなり高くなります。動画編集の課金は実際の出力秒数に基づきます（元動画に従い、`duration` ではありません）。`failed` で終了したタスクは **課金されません** が、**同じタスクを再送信すると再び課金されます** — むやみに自動再試行するのではなく、冪等性を組み込んでください。エラーは2段階で発生します: 送信時の拒否（`type` を伴う HTTP 4xx/5xx、たとえば `task_error` や `parse_request_failed`）はリクエストボディが間違っていることを意味するので、再試行ではなく修正してください。実行中の失敗は、`failed` のタスクとして現れ、その `error.message` には角括弧付きのプレフィックスが付きます。ここで `[InvalidImageUrl]` は一時的に到達できないメディアリンクであるだけかもしれず、再試行する価値があります。一方で `[InvalidParameter]` やセンシティブワードによる拒否は **再試行してはいけません**。5xx とネットワークエラーには指数バックオフを使用してください。

  8. token の要件: このモデルには `Wan&HappyHorse` グループを含む token が必要で、課金モードは **pay-as-you-go または PAYG-priority** でなければなりません — **呼び出しごとの token ではそこにルーティングできません**。

  9. キーは `APIYI_API_KEY` 環境変数から読み取ってください。ハードコードも git へのコミットも絶対にしないでください。

  10. 完了したら、実際に text-to-video を1回と image-to-video を1回呼び出し、その動画と2回分の費用を見せてください。全体の流れには数分かかるので、制約のある実行環境で実行する場合は、コマンドのタイムアウトを 600 秒より長くするか、バックグラウンドで実行してください。
</Prompt>

<Accordion title="このプロンプトで防げること">
  | 要件                          | 防げる落とし穴                                                                                     |
  | --------------------------- | ------------------------------------------------------------------------------------------- |
  | `/v1/videos` を使わない          | そのルートは `media` を静かに落とし、`input.media` 不足についてのアップストリームのエラーが、実際にはエンドポイント違いなのにパラメーターのバグのように見えます |
  | `X-DashScope-Async` ヘッダー    | これがないと呼び出しは同期として扱われ、即座に拒否されます                                                               |
  | 送信とポーリングのプレフィックスが異なる        | 送信は `/wan/api/v1/...`、ポーリングは `/v1/tasks/{task_id}` です                                       |
  | モデル名はハイフン付きの `video-edit`   | Wan の対応名はハイフンなしの `wan2.7-videoedit` で、両方のファミリーを統合するときに最も間違えやすい点です                           |
  | i2v には `driving_audio` がない  | その機能は Wan 専用なので、Wan のコードをコピーしても何の効果もないフィールドを送るだけです                                          |
  | 再送信すると再び課金される               | 失敗は無料ですが、盲目的な再試行は実費がかかります — 独自の冪等性が必要です                                                     |
  | `Authorization` なしでダウンロードする | OSS 署名付きリンクに認証情報を送ると 403 が返り、リンクは 24時間で失効します                                                |
</Accordion>

## HappyHorse に APIYI を選ぶ理由

<CardGroup cols={2}>
  <Card title="すべての機能に1つのキー" icon="key">
    Alibaba Cloud のサインアップも、リージョン設定も不要です。1つの APIYI Key で、4つの HappyHorse 機能すべてと [Wanシリーズ](/ja/api-capabilities/wan/overview) を呼び出せます。
  </Card>

  <Card title="直接アクセス、VPN 不要" icon="globe">
    `api.apiyi.com` に直接接続でき、国内データセンターや家庭用ブロードバンドから利用できます。
  </Card>

  <Card title="失敗時は課金なし" icon="circle-check">
    `failed` 状態に入ったタスク（到達できないメディアURL、機微な prompt など）は**課金されません**ので、安心して再試行できます。
  </Card>

  <Card title="DashScope プロトコルのパススルー" icon="plug">
    Wanシリーズと同じエンドポイントとスキーマを共有しているため、既存の Wan のコードは `model` 名を変えるだけで HappyHorse を呼び出せます。
  </Card>
</CardGroup>

## 主な機能

<CardGroup cols={2}>
  <Card title="4-in-1 非同期エンドポイント" icon="list-check">
    t2v / i2v / r2v / video-edit は `POST /wan/api/v1/...video-synthesis` を共有し、送信後に `task_id` が返されるため、その後ポーリングしてダウンロードします。
  </Card>

  <Card title="高忠実度の被写体保持" icon="target">
    このモデルは「高忠実度のダイナミックビデオ」スタイル寄りで、動きの全体を通して人物/オブジェクトをより安定して保ちます。
  </Card>

  <Card title="参照画像は最大 9 枚" icon="images">
    `happyhorse-1.1-r2v` は公式に最大 9 `reference_image` エントリをサポートしており、複数参照シナリオで被写体の一貫性がより強くなります。
  </Card>

  <Card title="複数の解像度と尺" icon="expand">
    720P / 1080P の解像度、2〜15 秒の整数の長さ、そして短い prompt の品質を向上させる `prompt_extend` スマート書き換え。
  </Card>
</CardGroup>

## サポートされているモデル

| Model ID                    | 機能       | 必要なメディア入力                         | 備考                             |
| --------------------------- | -------- | --------------------------------- | ------------------------------ |
| `happyhorse-1.1-t2v`        | テキストから動画 | なし                                | 純テキスト生成                        |
| `happyhorse-1.1-i2v`        | 画像から動画   | `first_frame`                     | **サポートしていません** `driving_audio` |
| `happyhorse-1.1-r2v`        | 参照から動画   | `reference_image`（最大9件）           | 複数参照での被写体保持                    |
| `happyhorse-1.0-video-edit` | 動画編集     | `video` + `reference_image`（最大5件） | モデル名にはハイフンがあります                |

## ⚠️ エンドポイントの選択（最重要）

APIYI は 2 つのパスを同時にマウントしますが、**HappyHorse のすべての機能を完全に使えるのは DashScope のパススルーエンドポイントだけです**：

| パス                                                           | プロトコル形式              | i2v / r2v の利用可否    | 結論                 |
| ------------------------------------------------------------ | -------------------- | ------------------ | ------------------ |
| `/v1/videos`                                                 | OpenAI フラット形式        | ❌ メディアフィールドは削除されます | **使用しないでください**     |
| `/wan/api/v1/services/aigc/video-generation/video-synthesis` | DashScope ネイティブパススルー | ✅ 完全に利用可能          | **必ずこちらを使用してください** |

<Warning>
  HappyHorse と Wan は同じパススルーエンドポイントを共有しています。ドキュメントやサンプルで、`/v1/videos` 経由で動画タスクを送信している例を見つけたら、**無視してください**。すべての作成リクエストは `/wan/api/v1/...video-synthesis` を経由し、すべてのクエリは `/v1/tasks/{task_id}` を経由します。
</Warning>

## 非同期コールフロー

全体のフローは非同期で、3 段階です: **タスクを作成 → ステータスをポーリング → 動画をダウンロード**.

<Steps>
  <Step title="タスクを作成">
    `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`、リクエストヘッダー `X-DashScope-Async: enable` を指定します。すぐに `task_id` を返します。
  </Step>

  <Step title="ステータスをポーリング">
    `GET /v1/tasks/{task_id}`（`Authorization` 付きで）、5〜10 秒ごとに問い合わせます（**3 秒未満にしないでください**）、`status` が `completed` になるまで続けます。
  </Step>

  <Step title="動画をダウンロード">
    レスポンス内の `result_url` から mp4 を直接 GET します。**`Authorization` ヘッダーなしで** 実行してください（署名付き OSS 直リンクなので、Auth を含めると 403 になります）。
  </Step>
</Steps>

### タスクステータスの参照

| ステータス         | 意味         | 次の手順                                                                       |
| ------------- | ---------- | -------------------------------------------------------------------------- |
| `submitted`   | 送信済み、キュー待ち | ポーリングを継続                                                                   |
| `in_progress` | 生成中        | ポーリングを継続（進捗が 30% で止まることがよくありますが、それは上流側の大まかな報告粒度によるもので、タスクが停止しているわけではありません） |
| `completed`   | 成功         | `result_url` からダウンロード                                                      |
| `failed`      | 失敗         | `error.message` / `fail_reason` を確認                                        |

### 完全な Python クライアント

```python theme={null}
import json, time, urllib.request

BASE = "https://api.apiyi.com"
KEY  = "sk-your-api-key"   # Your APIYI Key

def post(path, body):
    h = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
         "X-DashScope-Async": "enable"}
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers=h, method="POST")
    return json.loads(urllib.request.urlopen(req).read())

def get(path):
    req = urllib.request.Request(BASE + path, headers={"Authorization": f"Bearer {KEY}"})
    return json.loads(urllib.request.urlopen(req).read())

# 1. Create task (switching use cases only changes model and media)
r = post("/wan/api/v1/services/aigc/video-generation/video-synthesis", {
    "model": "happyhorse-1.1-t2v",
    "input": {"prompt": "A cat running across a meadow, bright sunshine, camera following"},
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

# 3. Download (do NOT include Authorization! result_url is a signed OSS direct link)
urllib.request.urlretrieve(url, "out.mp4")
print("saved out.mp4")
```

## 主要パラメータの解説

送信時、本文は DashScope のネスト構造を使用します: `{ model, input: { prompt, media[] }, parameters: {...} }`.

### `media[]`の種類

| `type`            | 用途                                     | 適用モデル           |
| ----------------- | -------------------------------------- | --------------- |
| `first_frame`     | 先頭フレーム画像（≤1）                           | i2v, r2v        |
| `reference_image` | 参照画像（r2v では最大 9 枚、video-edit では最大 5 枚） | r2v, video-edit |
| `video`           | 入力動画                                   | video-edit      |

<Warning>
  HappyHorse の i2v は `driving_audio` をサポートしていません（audio-driven は [Wan2.7-i2v](/ja/api-capabilities/wan/image-to-video) 専用の機能です）。リップシンク / ラップには Wan2.7 をご利用ください。
</Warning>

### `parameters`の項目

| フィールド           | 型   | 値                | 備考                                    |
| --------------- | --- | ---------------- | ------------------------------------- |
| `resolution`    | 文字列 | `720P` / `1080P` | 大文字での明示的な指定を推奨                        |
| `duration`      | 整数  | 2–15             | 秒（整数）、通常は 5 / 10                      |
| `prompt_extend` | 真偽値 | `true` / `false` | スマートな prompt の書き換え、**強く推奨します `true`** |
| `watermark`     | 真偽値 | `true` / `false` | 右下の「AI Generated」ウォーターマーク             |
| `seed`          | 整数  | 0–2147483647     | 固定すると再現性が向上します                        |

<Tip>
  `duration` は **整数** `5` で、文字列の `"5"` ではありません。`resolution` を **大文字** `720P` で書くほうがより確実です。
</Tip>

## HappyHorse と Wan の選び方

HappyHorse と [Wan](/ja/api-capabilities/wan/overview) はどちらも Alibaba の動画モデルで、同じエンドポイントとスキーマを共有しています（`model`名を変えるだけで相互に置き換え可能です）が、重視するポイントが異なります:

| 項目                     | HappyHorse-1.1       | Wan2.7                                    |
| ---------------------- | -------------------- | ----------------------------------------- |
| 音声駆動のリップシンク (i2v)      | ❌ 非対応、i2v は最初のフレームのみ | ✅ `wan2.7-i2v` は `driving_audio` をサポートします |
| Reference-to-Video の上限 | 参照画像は最大 9 枚          | 参照画像 + 参照動画の合計は 5 以下                      |
| Video Edit の参照画像       | ≤5                   | ≤5                                        |
| スタイルの重視点               | 高忠実度の動的な動画、被写体の安定性   | 複数被写体の相互作用、声質の参照                          |

<Tip>
  **被写体の一貫性を保つために複数の参照画像が必要な場合** → `happyhorse-1.1-r2v` を選びます（最大 9 枚）。
  **リップシンク / ラップ / デジタルヒューマンのボイスオーバーが必要な場合** → [Wan2.7-i2v](/ja/api-capabilities/wan/image-to-video) を選びます（音声駆動に対応している唯一のものです）。
</Tip>

## ベストプラクティス

<Steps>
  <Step title="まずは 720P / 5秒 で試します">
    開発中は、低解像度の短い動画で prompt と参照画像をすばやく検証し、確定後に解像度と再生時間を引き上げます。
  </Step>

  <Step title="prompt_extend を常に有効にします">
    `prompt_extend: true` は短い prompt の品質を大きく向上させます。
  </Step>

  <Step title="5-10秒ごとにポーリングします">
    3秒未満にしないでください（レート制限がかかります）。720P / 5秒 の HappyHorse の各機能は、通常 105–115秒 かかります。
  </Step>

  <Step title="保険として 20分 のクライアントタイムアウトを設定します">
    1080P や長い動画はかなり遅くなります。ポーリングループに 20分 のフォールバックタイムアウトを設定してください。
  </Step>

  <Step title="result_url を取得したらすぐにダウンロードします">
    `result_url` **24時間で期限切れ** が既定であり、署名付きの OSS 直接リンクです — ダウンロード時に Authorization ヘッダーを **含めないでください**。
  </Step>
</Steps>

## エラーコードと再試行

| ソース                                | 特徴                                                                                                  | 対処                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **作成段階（APIYI に拒否される）**             | HTTP 4xx/5xx、`type` が `task_error` / `parse_request_failed` / `build_request_failed`                | 本文を修正して再試行します（フィールド型の誤り、メディアの欠落、endpoint の誤り）        |
| **実行段階（上流の Alibaba Cloud に拒否される）** | タスク `status=failed`、`error.message` の先頭に `[InvalidParameter]` / `[InvalidImageUrl]` のような角括弧付きコードが付く | 角括弧内のヒントを確認します。通常は到達できないメディア URL か、センシティブな prompt です |

<Info>
  **推奨されるクライアントの動作**: HTTP 5xx / ネットワークエラーには指数バックオフで再試行し、HTTP 4xx は再試行せず即座に表示します。`failed` タスクで `[InvalidImageUrl]` がある場合は再試行可能ですが、`[InvalidParameter]` / センシティブワードの失敗は再試行できません。
</Info>

## よくある質問

<AccordionGroup>
  <Accordion title="HappyHorse と Wan の統合方法に違いはありますか？">
    **いいえ。** どちらも同じ DashScope パススルー エンドポイント、同じリクエスト構造、同じメディアタイプ名のセット、同じクエリエンドポイントを共有しています。**切り替えは `model` フィールドだけが変わります**（例: `wan2.7-t2v` → `happyhorse-1.1-t2v`）；本文のほかの部分はそのまま同一です。
  </Accordion>

  <Accordion title="HappyHorse の i2v がなぜリップシンクできないのですか？">
    `happyhorse-1.1-i2v` は `driving_audio`（音声駆動）フィールドをサポートしておらず、i2v は `first_frame` のみ受け付けます。リップシンク / rap / デジタルヒューマンのボイスオーバーには、[Wan2.7-i2v](/ja/api-capabilities/wan/image-to-video) を使用してください。
  </Accordion>

  <Accordion title="happyhorse-1.1-r2v は本当に 9 枚の参照画像を受け付けられますか？">
    はい。公式には最大 9 `reference_image` エントリをサポートしており、`media` 配列に入れるだけです。参照画像が多いほど、被写体 / 衣装 / シーンの一貫性が高まります。
  </Accordion>

  <Accordion title="なぜ /v1/videos から送信できないのですか？">
    `/v1/videos` では i2v / r2v の `media` フィールドのサポートが不完全なため、上流側で `[InvalidParameter] Field required: input.media` が返されます。**作成リクエストはすべて `/wan/api/v1/services/aigc/video-generation/video-synthesis` を通り、照会は `/v1/tasks/{task_id}` を通ります。**
  </Accordion>

  <Accordion title="result_url をダウンロードすると 403 が返る場合は？">
    `Authorization` ヘッダーを削除してください。`result_url` はすでに署名済みの OSS 直接リンクであり、APIYI Key を追加すると OSS 側で拒否されます。`result_url` の有効期限はデフォルトで 24 時間なので、速やかにダウンロードしてください。
  </Accordion>

  <Accordion title="失敗したタスクは課金されますか？">
    `status=failed` は課金されません。ただし、同じタスクを再送信すると再度課金されるため、冪等性を考慮してください。
  </Accordion>
</AccordionGroup>

## グループ設定

HappyHorse と [Wan](/ja/api-capabilities/wan/overview) シリーズは **1つの `Wan&HappyHorse` グループ** を共有します — 1つのトークンで両方のシリーズを呼び出せます。動画モデルは **秒単位** で課金されるため、ルーティングを成功させるにはトークンが次の 2 つの条件を満たす必要があります:

1. **課金モデル**: **Pay-as-you-go Priority** または **Pay-as-you-go** を選択します — 動画は秒単位で課金されるため、**Pay-per-request のトークンではルーティングできません**
2. **グループ**: `Wan&HappyHorse` を含むグループを選択します

<Frame caption="Create Token: set billing model to Pay-as-you-go Priority and group to Wan&HappyHorse (0.14x) to call every Wan2.7 and HappyHorse video model (the screenshot shows the group's former name Wan, since renamed to Wan&HappyHorse)">
  <img src="https://mintcdn.com/apiyillc/5-SttsT0c5VQwgVz/images/wan-token-group-setup-20260523.png?fit=max&auto=format&n=5-SttsT0c5VQwgVz&q=85&s=f46887cb88777eb34d70837983f1fc49" alt="Token 作成ダイアログ: 課金モデルが Pay-as-you-go Priority に設定され、グループのドロップダウンに Wan&HappyHorse（レート倍率 0.14x）が表示され、1つのトークンを Wan2.7 と HappyHorse の両方で使用できます" width="1286" height="988" data-path="images/wan-token-group-setup-20260523.png" />
</Frame>

## 価格

### 標準価格 = アリババ公式価格の98％（単純で分かりやすい）

**HappyHorse のモデル価格は APIYI システムに組み込まれています** — 手動設定は不要で、グループ割引は自動で適用されます。コンソールでは `Wan&HappyHorse` グループが **0.14x** のレートで表示され、これは組み込みの **RMB** 価格単位で算出されています。APIYI は **USD を 1:7 の固定為替レート** で課金するため、実質的な換算は次のとおりです:

```
0.14 (RMB pricing unit) × 7 (fixed exchange rate) = 0.98
```

言い換えると、**標準価格 = アリババ公式価格の98%** です。アリババから直接購入するより安く、海外接続を自前で構築する必要もありません。

> 換算: **USD の1秒あたり価格 = 公式 RMB 価格 × 0.14**（つまり `× 0.98 ÷ 7`）。

### 価格詳細（標準価格、秒単位課金）

HappyHorse-1.1 の text-to-video / image-to-video / reference-to-video は同一価格で、2段階の料金設定です — `720P` / `1080P`（480P はサポートされていません）:

| 解像度     | 公式価格   | 当方の標準 /s  | 5 s    | 10 s   | 12 s   |
| ------- | ------ | --------- | ------ | ------ | ------ |
| `720P`  | ¥0.9/s | \$0.126/s | \$0.63 | \$1.26 | \$1.51 |
| `1080P` | ¥1.6/s | \$0.224/s | \$1.12 | \$2.24 | \$2.69 |

<Info>
  * `happyhorse-1.0-video-edit` の出力時間は元動画に従い、`duration` ではなく実際の出力秒数で課金されます。
  * 表示価格は **標準（公式の98%）** です。最大チャージ特典を適用すると、実質価格は表の値の **÷ 1.2** 程度になります（例: 1080P 5 s \$1.12 → 約 \$0.93）。
</Info>

### さらに低い実質価格を実現する段階的チャージ特典

[チャージ特典プログラム](/ja/faq/recharge-promotions) に参加すると、付与残高を最大で約 1.2 倍まで増やせるため、実質価格をさらに下げられます:

```
0.98 ÷ 1.2 ≈ 0.816
```

そのため、大口のお客様は **公式価格の約81%** まで下げられます（0.98 ÷ 1.2 ≈ 0.816）。

| 階層                    | 実効価格（アリババ公式比） | 計算式                   |
| --------------------- | ------------- | --------------------- |
| 標準                    | **98%**       | レート 0.14x × 固定為替レート 7 |
| チャージ特典あり（大口顧客向けの最大階層） | **約81.6%**    | 0.98 ÷ 1.2            |

<Info>
  * 課金の単位 = **解像度の段階 × 継続時間（秒）**。失敗したタスクは課金されません。
  * 1:7 は **固定の精算為替レート** であり、優遇レートではありません。すべての USD チャージに一律で適用されます。
  * 最高の特典階層と対象チャネルについては、[チャージ特典](/ja/faq/recharge-promotions) をご覧ください。最新レートは [コンソール](https://api.apiyi.com/token) が正確です。
</Info>

## 関連ドキュメント

<CardGroup cols={2}>
  <Card title="テキストから動画への Playground" icon="wand-sparkles" href="/ja/api-capabilities/happyhorse/text-to-video">
    `happyhorse-1.1-t2v` オンラインデバッグ
  </Card>

  <Card title="画像から動画への Playground" icon="image" href="/ja/api-capabilities/happyhorse/image-to-video">
    `happyhorse-1.1-i2v` 最初のフレーム生成
  </Card>

  <Card title="参照から動画への Playground" icon="users" href="/ja/api-capabilities/happyhorse/reference-to-video">
    `happyhorse-1.1-r2v` 最大 9 枚の参照画像
  </Card>

  <Card title="動画編集 Playground" icon="scissors" href="/ja/api-capabilities/happyhorse/video-edit">
    `happyhorse-1.0-video-edit` 衣装差し替え / 背景差し替え
  </Card>

  <Card title="Wan シリーズ" icon="video" href="/ja/api-capabilities/wan/overview">
    また、Alibaba のモデル選択比較も
  </Card>
</CardGroup>

<Info>
  HappyHorse シリーズは、APIYI DashScope パススルー チャネル経由で提供されます。ご質問やご提案がある場合は、[APIYI コンソール](https://api.apiyi.com) でチケットを送信してください。
</Info>
