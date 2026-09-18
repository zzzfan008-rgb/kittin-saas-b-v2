> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 / 2.5 動画生成 API リファレンス

> インタラクティブなプレイグラウンドを備えた Seedance 2.0 および 2.5 の動画生成 API リファレンス：テキストから動画、最初と最後／最初のフレーム、マルチモーダル参照、動画編集、動画拡張を1つの非同期エンドポイントで実行でき、完全なポーリングおよびダウンロードコードを提供します。

<Info>
  右側のプレイグラウンドを使用します。**Authorization** に `Bearer sk-your-api-key` を設定し（Token には `SeeDance2` グループが必要です。2.5 と 2.0 ファミリーで共有されています）、`model` ／ `content` を入力して送信します。送信に成功するとタスク `id` が返されます。ポーリングとダウンロードのフローについては、以下のコードサンプルで説明しています。
</Info>

<Warning>
  **プレイグラウンドで「レスポンスを受信できません」エラーが表示される場合について**：これは非同期タスクのエンドポイントです。ブラウザで送信をクリックすると、このメッセージが表示されることがあります。ブラウザのクロスオリジン安全チェックによってレスポンスがブロックされていますが、**タスクの送信自体は正常に完了しています**（以下のクエリエンドポイントまたはコンソールログで確認できます）。プレイグラウンドで実行できるのはタスクの作成のみで、動画のポーリングやダウンロードには対応していません。作成 → ポーリング → ダウンロードの一連のフローを実行するには、以下の**コードサンプル**（cURL ／ Python ／ Node.js）をコピーして実行してください。
</Warning>

<Tip>
  これは Seedance 2.0 のタスク作成エンドポイントです。テキストから動画、最初+最後／最初のフレーム、マルチモーダルな参照画像から動画への変換は、すべてこのエンドポイントを使用します。`content` 配列でモードを選択します。モデルの選択、料金、解像度／ピクセル表、よくある質問については、[Seedance 2.0 概要](/ja/api-capabilities/seedance2/overview)を参照してください。
</Tip>

<Warning>
  * パスのプレフィックスは `/seedance/api/v3` です。**`/api` セグメントを削除しないでください**。また、`/v1/videos` は使用しないでください
  * Token では `SeeDance2` グループを有効にする必要があります。有効にしないと「このモデルで利用可能なチャネルがありません」というエラーが発生します。**2.5 と 2.0 ファミリーはどちらも `SeeDance2` を使用するため**、1 つの Token で 4 つすべてのモデルにアクセスできます（`mini` ／ `fast` には、割引された `SD2Mini` ／ `SD2Fast` もあります）
  * `generate_audio` は **デフォルトで true** です（出力には音声が含まれます）。無音動画にするには `false` を明示的に渡してください
  * Python の requests では `"Accept-Encoding": "identity"` ヘッダーが必要です。これがないと、gzip のデコードエラー、JSON ではない不完全なレスポンスボディ（例：先頭の `{"` が失われ、`id":"cgt-xxx"}` だけが返される）、または断続的な 400 エラーが発生することがあります
  * 成功ステータスは `succeeded` です（`completed` ではありません）。動画 URL は `content.video_url` にあり、**24 時間で期限切れになります**
</Warning>

## コード例

<CodeGroup>
  ```bash cURL (テキストから動画) theme={null}
  curl -X POST "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "doubao-seedance-2-0-fast-260128",
      "content": [
        {"type": "text", "text": "Drone shot flying over an autumn valley, golden forests and a winding river, cinematic"}
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
      "generate_audio": false
    }'
  # Returns {"id":"cgt-2026xxxx-xxxxx"} — poll the query endpoint with this id
  ```

  ```python Python（完全なフロー：作成 → ポーリング → ダウンロード） theme={null}
  import time
  import requests

  BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
  HEADERS = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      # Required: the gateway's gzip header does not match the actual encoding.
      # Without this you may get gzip decode errors, a truncated non-JSON body
      # (e.g. id":"cgt-xxx"} with the leading {" lost), or intermittent 400s
      "Accept-Encoding": "identity",
  }

  # 1. Create the task
  body = {
      "model": "doubao-seedance-2-0-fast-260128",
      "content": [
          {"type": "text", "text": "Waves crashing on rocks at sunset, slow motion, serene mood"}
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
      # "generate_audio": False,  # defaults to True; uncomment for silent video
      # "seed": 12345,            # fix the seed for similar, reproducible results
  }
  task_id = requests.post(BASE, json=body, headers=HEADERS, timeout=60).json()["id"]
  print("task_id:", task_id)

  # 2. Poll until a terminal state (succeeded / failed / expired)
  while True:
      time.sleep(20)
      task = requests.get(f"{BASE}/{task_id}", headers=HEADERS, timeout=30).json()
      status = task.get("status")
      print("status:", status)
      if status in ("succeeded", "failed", "expired"):
          break

  # 3. Download the video (the URL expires in 24 h — copy it out immediately)
  if status == "succeeded":
      video_url = task["content"]["video_url"]   # note: under content, not top-level
      print("tokens:", task["usage"]["completion_tokens"])
      with requests.get(video_url, stream=True, timeout=300) as r:
          r.raise_for_status()
          with open(f"{task_id}.mp4", "wb") as f:
              for chunk in r.iter_content(chunk_size=1 << 20):
                  f.write(chunk)
      print(f"saved {task_id}.mp4")
  else:
      print("task did not succeed:", task.get("error"))
  ```

  ```python Python（最初+最後のフレーム / 参照モード） theme={null}
  # First + last frame: 2 images, roles required; mutually exclusive with reference mode
  body_first_last = {
      "model": "doubao-seedance-2-0-260128",
      "content": [
          {"type": "text", "text": "Smooth transition from the first frame to the last, slow camera move"},
          {"type": "image_url", "image_url": {"url": "https://example.com/first.jpg"},
           "role": "first_frame"},
          {"type": "image_url", "image_url": {"url": "https://example.com/last.jpg"},
           "role": "last_frame"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",   # match the first frame's ratio to avoid cropping
      "duration": 5,
  }

  # Multi-modal reference: 0-9 reference images + 0-3 reference videos + 0-3 reference audios
  # (at least 1 image or 1 video); can create / edit / extend videos
  body_reference = {
      "model": "doubao-seedance-2-0-260128",
      "content": [
          {"type": "text", "text": "Using the reference character and style, the character walks down a rainy street at night"},
          {"type": "image_url", "image_url": {"url": "https://example.com/character.png"},
           "role": "reference_image"},
          # {"type": "video_url", "video_url": {"url": "..."}, "role": "reference_video"},
          # {"type": "audio_url", "audio_url": {"url": "..."}, "role": "reference_audio"},
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
  }
  # Images also accept Base64 (data:image/png;base64,xxx) and platform asset IDs (asset://xxx)
  ```

  ```python Python（Seedance 2.5：30秒クリップ / 動画編集 / 動画拡張） theme={null}
  # 2.5 shares the endpoint and request shape with 2.0 — only `model` changes.
  # The four bodies below are capabilities unique to 2.5.

  # 1. 30-second clip: 2.5 caps at 30 s (the 2.0 family caps at 15)
  body_30s = {
      "model": "doubao-seedance-2-5-260628",
      "content": [{"type": "text", "text": "Drone shot flying over an autumn valley, morning mist drifting through the trees, one continuous take"}],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 30,        # Do not omit: on 2.5 the default is -1 and the model picks its own length
  }

  # 2. Video editing: ratio must be adaptive, duration must be -1, source video 4-30 s
  body_edit = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          # The prompt needs an editing verb: add / remove / delete / change / replace
          {"type": "text", "text": "Add a few birds flying across @video1"},
          {"type": "video_url", "video_url": {"url": "https://example.com/source.mp4"},
           "role": "reference_video"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",                    # Required; a concrete ratio returns a synchronous 400
      "duration": -1,                         # Required; a concrete duration returns a synchronous 400
      "omni_reference_task_type": "edit",     # Declare it to validate at submission time
      "output_format": "mov",                 # Optional: mov is recommended for post (some players cannot open it)
  }

  # 3. Video extension: ratio must be adaptive
  body_extend = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          # The prompt needs an extension verb: extend / continue
          {"type": "text", "text": "Extend @video1 forward, camera keeps pushing in as the light fades"},
          {"type": "video_url", "video_url": {"url": "https://example.com/source.mp4"},
           "role": "reference_video"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",
      "omni_reference_task_type": "extend",
  }

  # 4. Audio-only reference: unique to 2.5; the 2.0 family requires an image or video alongside audio
  body_audio_only = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          {"type": "text", "text": "Abstract light and shadow pulsing to the rhythm of @audio1"},
          {"type": "audio_url", "audio_url": {"url": "https://example.com/track.mp3"},
           "role": "reference_audio"},
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
  }
  # Submission and polling are identical to the flow above.
  ```

  ```javascript Node.js（fetch） theme={null}
  const BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks";
  const HEADERS = {
    "Authorization": "Bearer sk-your-api-key",
    "Content-Type": "application/json",
  };

  // 1. Create the task
  const { id } = await fetch(BASE, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      model: "doubao-seedance-2-0-fast-260128",
      content: [{ type: "text", text: "A mountain lake reflecting the starry sky, time-lapse" }],
      resolution: "720p",
      ratio: "9:16",        // portrait costs the same as landscape
      duration: 5,
    }),
  }).then(r => r.json());
  console.log("task_id:", id);

  // 2. Poll until a terminal state
  let task;
  do {
    await new Promise(r => setTimeout(r, 20000));
    task = await fetch(`${BASE}/${id}`, { headers: HEADERS }).then(r => r.json());
    console.log("status:", task.status);
  } while (!["succeeded", "failed", "expired"].includes(task.status));

  // 3. The video link (expires in 24 h — re-host immediately)
  if (task.status === "succeeded") console.log(task.content.video_url);
  ```

  ```bash cURL（タスクをポーリング） theme={null}
  curl "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks/cgt-2026xxxx-xxxxx" \
    -H "Authorization: Bearer sk-your-api-key"
  ```
</CodeGroup>

## パラメータリファレンス

| パラメータ                      | 型    | 必須 | デフォルト                   | 備考                                                                                                                                                                                                                                              |
| -------------------------- | ---- | -- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`                    | 文字列  | ✓  | —                       | `doubao-seedance-2-5-260628` (**2.5、推奨** — 1080p、最大30秒) / `doubao-seedance-2-0-260128` (標準、1080p) / `doubao-seedance-2-0-fast-260128` (高速、最大720p) / `doubao-seedance-2-0-mini-260615` (mini/lite、最大720p、標準価格の約半額)。プレーンIDで指定し、`ep-`プレフィックスは付けません |
| `content`                  | 配列   | ✓  | —                       | 入力配列 — 下記の「生成モード」を参照してください                                                                                                                                                                                                                      |
| `resolution`               | 文字列  |    | `720p`                  | `480p` / `720p` / `1080p` (2.5および標準のみ1080p、fastとminiは720pが上限)。**`4k`をサポートするモデルはありません**                                                                                                                                                          |
| `ratio`                    | 文字列  |    | `adaptive`              | `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `21:9` / `adaptive`。各ティア内のすべてのアスペクト比で料金は同じです                                                                                                                                                          |
| `duration`                 | 整数   |    | 2.5では`-1`、2.0ファミリーでは`5` | 2.5では整数秒で**4～30**、2.0ファミリーでは4～15。`-1`ではモデルが選択します (実際の出力に基づいて課金)。**2.5のデフォルトは`-1`です** — 省略するとモデルが長さを選択するため、支払額が変わります                                                                                                                             |
| `generate_audio`           | ブール値 |    | `true`                  | 同期音声 (音声/SFX/音楽、モノラル)                                                                                                                                                                                                                           |
| `watermark`                | ブール値 |    | `false`                 | AI生成ウォーターマークを追加します                                                                                                                                                                                                                              |
| `seed`                     | 整数   |    | `-1`                    | \[-1, 2^32-1]。同じシードでは、同一ではないものの類似した結果になります                                                                                                                                                                                                      |
| `return_last_frame`        | ブール値 |    | `false`                 | クリップ連結用に、ウォーターマークのない最終フレームのpngを返します                                                                                                                                                                                                             |
| `execution_expires_after`  | 整数   |    | `172800`                | タスクの有効期限しきい値 (秒)、範囲 \[3600, 259200]                                                                                                                                                                                                             |
| `output_format`            | 文字列  |    | `mp4`                   | **2.5のみ**: `mp4` (汎用) または `mov` (QuickTime、H.264 + yuv444p + PCM — ポストプロダクションでより高い色再現性を実現しますが、一部のプレーヤーでは開けません)                                                                                                                                  |
| `omni_reference_task_type` | 文字列  |    | `auto`                  | **2.5のみ**: `auto` / `edit` (動画編集) / `extend` (動画拡張)。明示的に指定すると制約チェックが**送信時**に行われるため、数分後に失敗するタスクではなく、即座に400が返されます                                                                                                                                 |

<Warning>
  Seedance 2.5も2.0ファミリーも`frames`または`camera_fixed`をサポートしていません — これらはSeedance 1.xのパラメータであり、無視または拒否されます。

  **2.5固有のタスクタイプ制約** (違反すると課金されず、送信時に`InvalidParameter.TaskTypeConstraint`が返されます):

  | タスクタイプ               | `ratio`                  | `duration`                             |
  | -------------------- | ------------------------ | -------------------------------------- |
  | テキストから動画 / 参照から動画    | 制限なし                     | 制限なし                                   |
  | 最初のフレーム / 最初+最後のフレーム | **`adaptive`である必要があります** | 制限なし                                   |
  | 動画編集                 | **`adaptive`である必要があります** | **`-1`である必要があり**、ソース動画は4～30秒でなければなりません |
  | 動画拡張                 | **`adaptive`である必要があります** | 制限なし                                   |
</Warning>

### 生成モード (コンテンツの組み合わせ)

| モード              | コンテンツ項目                                                                                                                       | roleの値                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| テキストから動画         | 1 `text`                                                                                                                      | —                                                         |
| 最初 + 最後のフレーム     | 任意のテキスト + 2 `image_url`                                                                                                       | 必須: `first_frame` / `last_frame`                          |
| 最初のフレーム          | 任意のテキスト + 1 `image_url`                                                                                                       | `first_frame`または省略                                        |
| マルチモーダル参照から動画    | テキスト + 参照アセット (2.5: 最大30 `image_url` + 10 `video_url` + 10 `audio_url`。2.0ファミリー: 画像0～9個 + 動画0～3本 + 音声0～3個、画像1個以上または動画1本以上が必須) | `reference_image` / `reference_video` / `reference_audio` |
| 動画編集 (**2.5のみ**) | 編集動詞を含むテキスト + 1 `video_url`以上                                                                                                 | `reference_video`、`omni_reference_task_type: "edit"`付き    |
| 動画拡張 (**2.5のみ**) | 拡張動詞を含むテキスト + 1 `video_url`以上                                                                                                 | `reference_video`、`omni_reference_task_type: "extend"`付き  |

3つの画像モードは**相互排他的**です。画像には公開URL、Base64 (`data:image/png;base64,...`)、アセットID (`asset://...`)を使用できます。実在する人間の顔を含む入力は拒否されます。アセット参照のエンドツーエンドコード (取り込み → `asset://` → 生成 → ダウンロード) については、[アセット参照ガイド](/ja/api-capabilities/seedance2/asset-reference)を参照してください。

**大きなメディアをインライン化するとタスク作成が遅くなります。** Base64ペイロードのアップロードや大きな画像URLの取得にかかる時間はすべて送信フェーズに含まれるため、create-task呼び出しが約1秒から数十秒に延びたり、クライアントの読み取りタイムアウトに達したりする可能性があります。リクエストに画像または動画を含める場合は、先にメディアを取り込み、`asset://`アセットIDとして参照してください。[アセット先行ワークフロー](/ja/api-capabilities/seedance2/asset-first-workflow)を参照してください。

**参照上限は生成方式によって異なります**: 2.5では画像30個 + 動画10本 + 音声クリップ10個を使用でき、**音声のみを参照として指定することもできます**。2.0ファミリーでは画像9個 + 動画3本 + 音声クリップ3個を使用でき、音声は少なくとも1個の画像または1本の動画と一緒に送信する必要があります。

**編集と拡張はpromptの意図によってトリガーされます** — `omni_reference_task_type`は検証を前倒しするだけです。prompt内では、渡した順序に従って位置でアセットを参照してください (`@video1`、`@image1`)。編集にはadd / remove / change / replaceのような動詞が必要で、拡張にはextend / continueが必要です。モデルがpromptから推測したタスクタイプが、宣言した内容と矛盾する場合、タスクは非同期で`InvalidParameter.TaskTypeMismatch`により失敗します。

## レスポンス形式

作成時に返されるのはタスク ID のみです（**動画ではありません**）。

```json theme={null}
{ "id": "cgt-20260606160057-6bbjd" }
```

`id` を取得したら、タスクのステータスを確認するために `GET /seedance/api/v3/contents/generations/tasks/{id}` をポーリングします。

### 推奨ポーリング間隔

| 項目      | 推奨値                                | 理由                                                                 |
| ------- | ---------------------------------- | ------------------------------------------------------------------ |
| 初回確認    | 送信後 **20～30 秒**                    | これより早いと、`queued` が返されることが保証されており、リクエストが無駄になります                     |
| ポーリング間隔 | **10～20 秒**ごと                      | 生成には数分かかるジョブです。1 秒未満の間隔でポーリングしてもメリットはなく、レート制限に達する可能性があります          |
| タイムアウト  | 終端状態にならないまま **10 分**経過した場合は異常として扱う | キューが混雑するピーク時は 15 分まで緩和するか、`execution_expires_after` を最後の保険として使用します |

キュー待ち時間を含むエンドツーエンドの実測レイテンシーです。720p の 2.0 ファミリーでは、5 秒のクリップで約 **90～140 秒**、15 秒で **170 秒**です。2.5 では、720p/5 秒で約 **150 秒**、720p/30 秒で **330 秒**、1080p/5 秒で **150 秒**です。解像度が高いほど、また動画の長さが長いほど時間がかかり、ピーク時間帯のキュー待ちによってさらに長くなります。以下のコードサンプルでは固定の 20 秒間隔を使用しています。これは十分な間隔であり、リクエスト数も予測しやすくなります。

成功したタスクは次のようになります（テストで使用した実際のサンプルです）。

```json theme={null}
{
  "id": "cgt-20260606160057-6bbjd",
  "model": "doubao-seedance-2-0-fast-260128",
  "status": "succeeded",
  "content": {
    "video_url": "https://ark-acg-cn-beijing.tos-cn-beijing.volces.com/....mp4?X-Tos-Expires=86400&..."
  },
  "usage": { "completion_tokens": 108900, "total_tokens": 108900 },
  "created_at": 1780732857,
  "updated_at": 1780732991,
  "seed": 97151,
  "resolution": "720p",
  "ratio": "16:9",
  "duration": 5,
  "framespersecond": 24,
  "generate_audio": true,
  "draft": false
}
```

<Warning>
  * 動画 URL はトップレベルではなく **`content.video_url`** にあります。これは **24 時間で期限切れになる**署名付きリンクなので、すぐにダウンロードしてください
  * ステートマシン：`queued → running → succeeded / failed / expired`。成功状態は **`succeeded`** です
  * リンクのダウンロードには通常の GET を使用してください。署名付き URL に **`Authorization` ヘッダーを送信しないでください**
</Warning>

<Info>
  `usage.completion_tokens` は課金対象の token 数であり、`tokens ≈ duration × width × height × 24 / 1024` に従います（テストでは誤差 0.1% 以内でした）。`duration: -1` または `ratio: adaptive` を使用した場合、実際の長さと比率はレスポンスの `duration` / `ratio` フィールドで報告されます。
</Info>


## OpenAPI

````yaml api-reference/seedance2-video-openapi-en.yaml POST /seedance/api/v3/contents/generations/tasks
openapi: 3.1.0
info:
  title: Seedance 2.0 Video Generation API
  description: >
    ByteDance Seedance 2.0 video generation (official Volcengine Mainland China
    resource).


    Capabilities:

    - Text-to-video / image-to-video (first+last frame, first frame) /
    multi-modal reference-to-video (0-9 reference images + 0-3 reference videos
    + 0-3 reference audios, at least 1 image or 1 video)

    - Resolutions 480p / 720p / 1080p (fast model caps at 720p), 6 aspect ratios
    plus adaptive; all ratios in the same tier share the same pixel area and
    price

    - Duration 4-15 s (or -1 for model-chosen length), fixed 24 fps,
    synchronized audio ON by default (generate_audio defaults to true)

    - Async task flow: create returns a task id, poll GET
    /seedance/api/v3/contents/generations/tasks/{id} until succeeded, then
    download from content.video_url (expires in ~24 hours)


    Authentication: Bearer Token (Pay-as-you-go Priority billing model; the
    Token needs the matching group: SeeDance25 for 2.5, SeeDance2 for the 2.0
    family).

    Get your key from the APIYI console → Token management.
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /seedance/api/v3/contents/generations/tasks:
    post:
      tags:
        - Video Generation
      summary: Create a Seedance 2.0 video generation task
      description: >
        Async endpoint: returns a task `id` immediately — **not the video
        itself**.


        - Required: `model` + `content` (text only, text+images,
        text+images+video+audio, etc.)

        - The three image modes are mutually exclusive: first+last frame (2
        images, role required) / first frame (1 image) / multi-modal
        reference-to-video (0-9 images + 0-3 videos + 0-3 audios, at least 1
        image or 1 video, image role = reference_image)

        - Inputs containing real human faces are rejected; audio must be sent
        together with at least one image or video

        - `frames` / `camera_fixed` are NOT supported (Seedance 1.x only)

        - Billing is pre-charged on submit and settled on completion; rejected
        requests are not billed


        After creation, poll `GET
        /seedance/api/v3/contents/generations/tasks/{id}`.

        Status flow: `queued → running → succeeded / failed / expired`.

        On success, download the mp4 from `content.video_url` (expires in ~24
        hours).

        See the "Seedance 2.0 Overview" doc for details.
      operationId: createSeedance2VideoTaskEn
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Seedance2CreateTaskRequest'
            example:
              model: doubao-seedance-2-5-260628
              content:
                - type: text
                  text: >-
                    Drone shot flying over an autumn valley, golden forests and
                    a winding river, cinematic
              resolution: 720p
              ratio: '16:9'
              duration: 5
              generate_audio: false
      responses:
        '200':
          description: Task created. Returns the task ID for polling
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Seedance2TaskCreated'
              example:
                id: cgt-20260606160057-6bbjd
        '400':
          description: >-
            InvalidParameter — e.g. 1080p with the fast model, duration outside
            4-15, or an unsupported ratio. The error message names the offending
            parameter; not billed
        '401':
          description: Unauthorized - invalid API key
        '403':
          description: Content moderation rejection (real human faces, policy violations)
        '429':
          description: Rate limited or insufficient quota
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    Seedance2CreateTaskRequest:
      type: object
      required:
        - model
        - content
      properties:
        model:
          type: string
          description: >-
            Model ID (plain ID, no ep- prefix). 2.5 supports 1080p, 4-30 s, and
            up to 30 images + 10 videos + 10 audio clips as references; 2.0
            standard supports 1080p; fast and mini cap at 720p, with mini at
            about half the standard price. No model supports 4k
          enum:
            - doubao-seedance-2-5-260628
            - doubao-seedance-2-0-260128
            - doubao-seedance-2-0-fast-260128
            - doubao-seedance-2-0-mini-260615
          example: doubao-seedance-2-5-260628
        content:
          type: array
          description: >-
            Input array. Text-to-video: a single text item. Image-to-video: add
            image_url items (role: first_frame / last_frame). Multi-modal
            reference-to-video: image_url items (role: reference_image) plus
            optional video_url / audio_url. Reference limits: 2.5 allows 30
            images + 10 videos + 10 audio clips and audio may stand alone; the
            2.0 family allows 9 images + 3 videos + 3 audio clips and needs at
            least 1 image or 1 video. The three image modes are mutually
            exclusive
          items:
            type: object
            properties:
              type:
                type: string
                description: Content type
                enum:
                  - text
                  - image_url
                  - video_url
                  - audio_url
                example: text
              text:
                type: string
                description: >-
                  Prompt (required when type=text). Up to ~1000 English words;
                  put spoken lines in double quotes to improve generated
                  voice-over
                example: Waves crashing on rocks at sunset, slow motion, serene mood
              image_url:
                type: object
                description: >-
                  Image object (required when type=image_url). Accepts public
                  URL, Base64 (data:image/png;base64,...), or asset ID
                  (asset://...). Formats jpeg/png/webp/bmp/tiff/gif/heic/heif;
                  aspect ratio (0.4, 2.5); sides (300, 6000) px; under 30 MB
                  each. Real human faces are not allowed
                properties:
                  url:
                    type: string
                    description: Image URL / Base64 / asset:// ID
                    example: https://example.com/first.jpg
              video_url:
                type: object
                description: >-
                  Reference video object (required when type=video_url);
                  multi-modal reference mode only
                properties:
                  url:
                    type: string
                    description: Video URL
              audio_url:
                type: object
                description: >-
                  Reference audio object (required when type=audio_url).
                  wav/mp3, 2-15 s per clip, up to 3 clips and 15 s total; must
                  accompany at least one image or video
                properties:
                  url:
                    type: string
                    description: Audio URL
              role:
                type: string
                description: >-
                  Media role. Required for first+last frame
                  (first_frame/last_frame); optional for a single first frame;
                  reference media use reference_*
                enum:
                  - first_frame
                  - last_frame
                  - reference_image
                  - reference_video
                  - reference_audio
        resolution:
          type: string
          description: >-
            Resolution tier (defines pixel area — every ratio in a tier costs
            the same). 1080p is available on 2.5 and 2.0 standard only; fast and
            mini cap at 720p. No model supports 4k
          enum:
            - 480p
            - 720p
            - 1080p
          default: 720p
        ratio:
          type: string
          description: >-
            Aspect ratio. adaptive auto-fits the input (recommended for
            image-to-video to avoid cropping); the actual ratio is returned in
            the task's ratio field
          enum:
            - '16:9'
            - '4:3'
            - '1:1'
            - '3:4'
            - '9:16'
            - '21:9'
            - adaptive
          default: adaptive
        duration:
          type: integer
          description: >-
            Video length in whole seconds: 4-30 on 2.5, 4-15 on the 2.0 family;
            or -1 to let the model choose (billed by actual output). Cost scales
            linearly with duration. Note the default is -1 on 2.5 and 5 on the
            2.0 family
          default: 5
          example: 5
        generate_audio:
          type: boolean
          description: >-
            Generate synchronized audio (voice, SFX, background music; mono).
            Note it DEFAULTS TO TRUE — pass false explicitly for silent video
          default: true
        watermark:
          type: boolean
          description: Add an AI-generated watermark in the bottom-right corner
          default: false
        seed:
          type: integer
          description: >-
            Random seed, [-1, 2^32-1]. The same seed produces similar (not
            identical) results; -1 means random
          default: -1
        return_last_frame:
          type: boolean
          description: >-
            Return the last frame as a watermark-free png (same dimensions as
            the video) — chain it as the first frame of the next task to produce
            continuous multi-clip videos
          default: false
        execution_expires_after:
          type: integer
          description: >-
            Task expiry threshold in seconds; tasks exceeding it are marked
            expired. Range [3600, 259200]
          default: 172800
        output_format:
          type: string
          description: >-
            Output container, supported on doubao-seedance-2-5-260628 only. mov
            is a QuickTime container (H.264 + yuv444p + PCM) with better colour
            fidelity for post-production, but some players cannot open it
          enum:
            - mp4
            - mov
          default: mp4
        omni_reference_task_type:
          type: string
          description: >-
            Task type for omni-reference generation, supported on
            doubao-seedance-2-5-260628 only. Declaring edit or extend validates
            constraints up front: video editing requires ratio=adaptive and
            duration=-1, video extension requires ratio=adaptive; violations
            return InvalidParameter.TaskTypeConstraint at submission
          enum:
            - auto
            - edit
            - extend
          default: auto
    Seedance2TaskCreated:
      type: object
      description: >-
        Creation response. Poll GET
        /seedance/api/v3/contents/generations/tasks/{id}; on success the video
        URL is at content.video_url (expires in ~24 h) and billed tokens at
        usage.completion_tokens
      properties:
        id:
          type: string
          description: Video generation task ID (kept for 7 days)
          example: cgt-20260606160057-6bbjd
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        API key from the APIYI console (SeeDance25 group for 2.5, SeeDance2
        group for the 2.0 family)

````