> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 公式テキストから動画への API

> VEO 3.1 の公式テキストから動画への API リファレンスとインタラクティブなプレイグラウンド — JSON リクエストボディ、3段階の非同期フロー、柔軟な 4 / 6 / 8 秒の長さ、リクエストごとの課金。

<Info>
  右側のインタラクティブな Playground はライブデバッグをサポートしています。**Authorization** に API Key を入力し（形式 `Bearer sk-xxx`）、prompt を入力して、model / seconds / metadata.resolution を選び、送信してください。**`Default` グループが使えます — 専用のグループ切り替えは不要です**。
</Info>

<Tip>
  **範囲**: このページは「テキストのみから動画を生成」を扱います — `input_reference` も `application/json` body もありません。参照画像から生成するには、[Image-to-Video エンドポイント](/ja/api-capabilities/veo-3-1-official/image-to-video) を使用してください（同じエンドポイント + `input_reference` アップロード）。
</Tip>

<Warning>
  **⚠️ よくある落とし穴 3 つ**

  1. **length フィールドの名前は `seconds` です（`duration` ではありません）かつ string である必要があります** `"4"` / `"6"` / `"8"`。これを `duration` と名付けると静かに無視されるため、length はデフォルトの 4 秒にフォールバックします（「8 秒を送ったのに 4 秒になった」罠です）；数値を渡すと `parse_request_failed: cannot unmarshal number into Go struct field ... duration of type string` で失敗します
  2. **`generateAudio` は渡さないでください** — 上流は `INVALID_ARGUMENT` を返します。音声の意図（ambient、dialogue、BGM）は prompt に埋め込んでください
  3. **1080p / 4k では、`seconds` は `"8"` にする必要があります** — `"4"` / `"6"` は上流側で拒否されます
</Warning>

<Warning>
  **3 ステップの非同期フロー — このページは Step 1（submit）のみを扱います**

  * **Step 1（このページ）**: `POST /v1/videos` → `task_id` + `status: "queued"` を返します
  * **Step 2**: `GET /v1/videos/{task_id}` を `status: "completed"` までポーリングします
  * **Step 3**: MP4 をダウンロードするために `GET /v1/videos/{task_id}/content` します

  POST submit 自体は 1 秒未満で完了し、生成完了まで**待機しません**。全体のフローは下の Python サンプルに示しています。
</Warning>

## コードサンプル

### Python (OpenAI SDK · ローレベル client.post)

```python theme={null}
{/* OpenAI SDK has no videos.create method; /v1/videos is a custom path, use low-level client.post() */}
from openai import OpenAI
import time

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Step 1: submit
resp = client.post(
    "/videos",
    body={
        "model": "veo-3.1-fast-generate-preview",
        "prompt": "A coastal lighthouse at dusk, slow push-in, waves lapping the rocks, distant seabirds, cinematic lighting, steady camera",
        "seconds": "8",  # string, not number
        "size": "1280x720",
        "metadata": {
            "resolution": "720p",
            "aspectRatio": "16:9",
            "seed": 20260521,
            "negativePrompt": "blurry, watermark, distorted, low quality"
        }
    },
    cast_to=dict
)
task_id = resp["task_id"]
print(f"Task ID: {task_id}, status: {resp['status']}")

# Step 2: poll (up to 3 minutes for 720p/1080p)
deadline = time.time() + 180
while time.time() < deadline:
    s = client.get(f"/videos/{task_id}", cast_to=dict)
    print(f"Status: {s['status']}, progress: {s.get('progress', 0)}%")
    if s["status"] == "completed":
        break
    if s["status"] == "failed":
        raise RuntimeError(f"Generation failed: {s}")
    time.sleep(8)

# Step 3: download (retry to handle CDN sync delay right after completed)
import urllib.request, urllib.error
time.sleep(4)
for i in range(5):
    try:
        req = urllib.request.Request(
            f"https://api.apiyi.com/v1/videos/{task_id}/content",
            headers={"Authorization": "Bearer sk-your-api-key"}
        )
        with urllib.request.urlopen(req, timeout=180) as r, open("output.mp4", "wb") as f:
            while chunk := r.read(1 << 16):
                f.write(chunk)
        break
    except urllib.error.HTTPError:
        if i == 4:
            raise
        time.sleep(4)
print("Saved: output.mp4")
```

### Python（requests）

```python theme={null}
import requests
import time

API_KEY = "sk-your-api-key"
BASE_URL = "https://api.apiyi.com/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

# Step 1: submit (JSON body)
resp = requests.post(
    f"{BASE_URL}/videos",
    headers={**HEADERS, "Content-Type": "application/json"},
    json={
        "model": "veo-3.1-fast-generate-preview",
        "prompt": "A coastal lighthouse at dusk, slow push-in, steady camera, ocean ambience and distant seabirds",
        "seconds": "8",  # must be a string
        "size": "1280x720",
        "metadata": {
            "resolution": "720p",
            "aspectRatio": "16:9"
        }
    },
    timeout=30  # POST is just an enqueue; 30 sec is enough
).json()
task_id = resp["task_id"]
print(f"Task ID: {task_id}, status: {resp['status']}")

# Step 2: poll (3 min for 720p/1080p, 10 min for 4K)
deadline = time.time() + 180
while time.time() < deadline:
    s = requests.get(f"{BASE_URL}/videos/{task_id}", headers=HEADERS).json()
    print(f"Status: {s['status']}, progress: {s.get('progress', 0)}%")
    if s["status"] == "completed":
        break
    if s["status"] == "failed":
        raise RuntimeError(f"Generation failed: {s}")
    time.sleep(8)

# Step 3: download with retry
time.sleep(4)
for i in range(5):
    try:
        with requests.get(
            f"{BASE_URL}/videos/{task_id}/content",
            headers=HEADERS, stream=True, timeout=180
        ) as r:
            r.raise_for_status()
            with open("output.mp4", "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        break
    except requests.HTTPError:
        if i == 4:
            raise
        time.sleep(4)
print("Saved: output.mp4")
```

### cURL

```bash theme={null}
{/* Just want to check/download with an existing task_id? See the "Already have a task_id?" section below */}
{/* Step 1: submit (the length field is seconds, the string "8", not number 8, and not duration) */}
RESP=$(curl -sS -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "veo-3.1-fast-generate-preview",
    "prompt": "A coastal lighthouse at dusk, slow push-in, ocean ambience, cinematic lighting",
    "seconds": "8",
    "size": "1280x720",
    "metadata": {"resolution": "720p", "aspectRatio": "16:9"}
  }')
TASK_ID=$(echo "$RESP" | python3 -c 'import sys,json;print(json.load(sys.stdin)["task_id"])')
echo "task_id=$TASK_ID"

{/* Step 2: poll every 8 sec */}
while :; do
  S=$(curl -sS -H "Authorization: Bearer sk-your-api-key" "https://api.apiyi.com/v1/videos/$TASK_ID")
  ST=$(echo "$S" | python3 -c 'import sys,json;print(json.load(sys.stdin)["status"])')
  echo "status=$ST"
  [ "$ST" = "completed" ] && break
  [ "$ST" = "failed" ] && { echo "$S"; exit 1; }
  sleep 8
done

{/* Step 3: download (--retry covers occasional 400 right after status=completed) */}
sleep 4
curl -sSL --retry 3 --retry-delay 4 \
  -H "Authorization: Bearer sk-your-api-key" \
  "https://api.apiyi.com/v1/videos/$TASK_ID/content" \
  -o output.mp4
ls -lh output.mp4
```

### Node.js（ネイティブ fetch）

```javascript theme={null}
import fs from 'node:fs';

const API_KEY = 'sk-your-api-key';
const BASE_URL = 'https://api.apiyi.com/v1';

// Step 1: submit
const submitResp = await fetch(`${BASE_URL}/videos`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'A golden retriever running on a sandy beach, slow motion, golden hour, cinematic quality',
        seconds: '8',  // must be string
        size: '1280x720',
        metadata: { resolution: '720p', aspectRatio: '16:9' }
    })
});
const { task_id } = await submitResp.json();
console.log(`Task ID: ${task_id}`);

// Step 2: poll
let status = 'queued';
while (status !== 'completed' && status !== 'failed') {
    await new Promise(r => setTimeout(r, 8000));
    const s = await (await fetch(`${BASE_URL}/videos/${task_id}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
    })).json();
    status = s.status;
    console.log(`Status: ${status}, progress: ${s.progress ?? 0}%`);
}

if (status === 'failed') throw new Error('Generation failed');

// Step 3: download (retry up to 3 times, 4-second gaps)
await new Promise(r => setTimeout(r, 4000));
let buffer;
for (let i = 0; i < 4; i++) {
    try {
        const resp = await fetch(`${BASE_URL}/videos/${task_id}/content`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        buffer = Buffer.from(await resp.arrayBuffer());
        break;
    } catch (e) {
        if (i === 3) throw e;
        await new Promise(r => setTimeout(r, 4000));
    }
}
fs.writeFileSync('output.mp4', buffer);
console.log('Saved: output.mp4');
```

### ブラウザー JavaScript

```javascript theme={null}
{/* Demo only; route through a backend proxy in production to avoid Key leakage; large video downloads are also unsuitable for direct browser handling */}
const submitResp = await fetch('https://api.apiyi.com/v1/videos', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'Watercolor northern lights over snowy mountains, gentle motion',
        seconds: '4',
        size: '720x1280',
        metadata: { resolution: '720p', aspectRatio: '9:16' }
    })
});
const { task_id } = await submitResp.json();
console.log('Task ID:', task_id);

{/* After polling completes, route the /content endpoint through your backend proxy for download */}
```

## task\_id をすでにお持ちですか？ コピペするだけの cURL コマンド 2 つ

すでに `task_id` をお持ちの場合（タスク送信時に返されたもの、またはコンソールログに表示されたもの）、下の 2 つのプレースホルダーを置き換えるだけで実行できます:

* `sk-your-api-key` → あなたの APIYI キー
* `task_xxxxxxxxxxxxxxxx` → あなたの task ID

### 1. タスクのステータスを確認

```bash theme={null}
curl "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer sk-your-api-key"
```

JSON 応答が `status: "completed"` を示したらダウンロードできます。`in_progress` を示した場合は、数秒待ってからもう一度確認してください。

### 2. 動画をダウンロードする（output.mp4 として保存されます）

```bash theme={null}
curl -L --retry 3 --retry-delay 4 \
  "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx/content" \
  -H "Authorization: Bearer sk-your-api-key" \
  -o output.mp4
```

<Tip>
  `/content` エンドポイントには `Authorization` ヘッダーが必要です。URL をブラウザのアドレスバーに直接開くと 401 が返ります。`--retry 3` は、`status` が `completed` に切り替わった直後にまれに発生する 400 をカバーしています（CDN の同期遅延）。
</Tip>

## パラメータ参照

| Param                     | Type       | Required | Default    | 説明                                                                                                                                                                 |
| ------------------------- | ---------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`                   | string     | はい       | —          | `veo-3.1-fast-generate-preview` (\$0.3/req) または `veo-3.1-generate-preview` (\$1.2/req)                                                                             |
| `prompt`                  | string     | はい       | —          | 動画の説明。シーン、アクション、カメラ、ライティング、**audio intent** を記述してください（`generateAudio` は渡さないでください）                                                                                  |
| `seconds`                 | **string** | いいえ      | `"8"`      | 動画の長さ、**string enum**: `"4"` / `"6"` / `"8"`。**このフィールドは `seconds` であり、`duration` ではありません**（`duration` と名付けても黙って無視され、4秒にフォールバックします）。**1080p/4k は `"8"` である必要があります** |
| `size`                    | string     | いいえ      | `1280x720` | 出力ピクセル。例: `1280x720` / `1920x1080` / `3840x2160`。`metadata.resolution` より優先度は低いです                                                                                  |
| `metadata.resolution`     | string     | いいえ      | `720p`     | `720p` / `1080p` / `4k`。`size` より優先度は高いです                                                                                                                          |
| `metadata.aspectRatio`    | string     | いいえ      | `16:9`     | `16:9`（横向き）または `9:16`（縦向き）                                                                                                                                         |
| `metadata.seed`           | int        | いいえ      | —          | ランダムシード。固定シードにすると、出力のスタイルがまとまります（ただし **バイト単位では再現できません**）                                                                                                           |
| `metadata.negativePrompt` | string     | いいえ      | —          | ネガティブ prompt。`"blurry, watermark, distorted, low quality"` を推奨します                                                                                                  |

<Warning>
  `generateAudio` フィールドは渡さないでください！Veo 3.1 は標準で音声対応しており、このパラメータを渡すと `INVALID_ARGUMENT` が返されます。音声を制御するには、**意図を prompt に書き込んでください**: `"waves, distant seabirds, low wind sounds"`。
</Warning>

<Tip>
  パラメータの優先順位:

  * 長さ: `metadata.durationSeconds > seconds > 8`（`seconds` を送信してください。`duration` は認識されません）
  * 解像度: `metadata.resolution > size > 720p`
  * アスペクト比: 明示的な `metadata.aspectRatio` > サイズから推定されたもの > `16:9`
</Tip>

## レスポンス形式

### ステップ 1 - 送信直後

```json theme={null}
{
  "id": "task_xxxxxxxxxxxxxxxx",
  "task_id": "task_xxxxxxxxxxxxxxxx",
  "object": "video",
  "model": "veo-3.1-fast-generate-preview",
  "status": "queued",
  "progress": 0,
  "created_at": 1775025000
}
```

### ステップ 2 - ポーリング応答（進行中）

```json theme={null}
{
  "id": "task_xxxxxxxxxxxxxxxx",
  "task_id": "task_xxxxxxxxxxxxxxxx",
  "object": "video",
  "model": "veo-3.1-fast-generate-preview",
  "status": "in_progress",
  "progress": 50,
  "created_at": 1775025000
}
```

### ステップ 2 - ポーリング応答（完了）

```json theme={null}
{
  "id": "task_xxxxxxxxxxxxxxxx",
  "task_id": "task_xxxxxxxxxxxxxxxx",
  "object": "video",
  "model": "veo-3.1-fast-generate-preview",
  "status": "completed",
  "progress": 100,
  "created_at": 1775025000,
  "completed_at": 1775025090
}
```

<Warning>
  **⚠️ レスポンスフィールドの注意点**

  * **`id` と `task_id` はどちらも同じ値で返されます**; 下流では `task_id` に標準化してください（既存の Reverse チャンネルと互換性があります）
  * **CDN / 公開 URL は返されません** — レスポンスに `video_url` / `data.url` はありません; 動画は **`GET /v1/videos/{task_id}/content` 経由の MP4 バイナリストリーム** としてのみ取得できます（認証ヘッダーが必要です）。フロントエンドからこのエンドポイントを直接叩くことはできません — **サーバー側でダウンロードし、自前の OSS / CDN に再ホストしてください**
  * `progress` は粗い粒度です — **0 / 50 / 100 の間でのみジャンプ** するため、進捗バーには使用しないでください
  * `status: "failed"` には詳細な `error` フィールドが含まれない場合があります; 通常はコンテンツレビューまたはパラメータエラーです。再試行するか、プロンプトを調整してください
  * **`/content` は、`status` が `completed` に切り替わった直後に 400 を返すことがあります**; 4 秒後に再試行してください（上記のすべてのコードサンプルにはこれが組み込まれています）
</Warning>

<Info>
  このエンドポイントは非同期タスクの入口です。**課金はタスクが `completed` に到達した時点で発生し、モデル名ごとにリクエスト単位で課金されます**（fast \$0.3 / standard \$1.2、[料金](/ja/api-capabilities/veo-3-1-official/overview#pricing) を参照してください）。POST 送信、ポーリング、ダウンロード自体は **課金されません**; 失敗したタスクも **課金されません**。
</Info>


## OpenAPI

````yaml api-reference/veo-3-1-official-text-to-video-openapi-en.yaml POST /v1/videos
openapi: 3.1.0
info:
  title: VEO 3.1 Official Text-to-Video API
  description: >
    Google Veo 3.1 video generation series (Official Relay channel) —
    Text-to-Video endpoint (no `input_reference`, `application/json` body).


    - Two active models: `veo-3.1-fast-generate-preview` (\$0.3/req) and
    `veo-3.1-generate-preview` (\$1.2/req)

    - Duration supports `"4"` / `"6"` / `"8"` seconds (**string enum, numeric
    value will be rejected**)

    - The duration field is named `seconds` (not `duration`); **at 1080p / 4k
    resolution, `seconds` must be `"8"`**

    - Native synchronized audio output (ambient, dialogue, score) — **do not
    pass `generateAudio`**, upstream will reject with `INVALID_ARGUMENT`; encode
    audio intent in `prompt`

    - **Async task endpoint**: this endpoint only submits the task; combine with
    `GET /v1/videos/{task_id}` to poll and `GET /v1/videos/{task_id}/content` to
    download

    - Video retention not officially documented; download immediately on
    completion

    - For image-based generation, use the [Image-to-Video
    endpoint](/en/api-capabilities/veo-3-1-official/image-to-video) (same
    endpoint + multipart `input_reference`)


    **Authentication**: include `Authorization: Bearer YOUR_API_KEY` in the
    request header


    **API Key configuration**: **`Default` group works — no dedicated group
    switch needed**; the Token must use **Pay-per-request** or **Pay-as-you-go
    Priority** billing mode (pure **Pay-as-you-go is not supported**)


    **Get an API Key**: visit the [APIYI console](https://api.apiyi.com/token)
    to create a Token
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1/videos:
    post:
      tags:
        - Video Generation
      summary: 'Text-to-video: submit a generation task from text prompt'
      description: >
        Submit a Veo 3.1 video generation task (async); returns `task_id` and
        `status: "queued"`.


        - Required: `model`, `prompt`

        - Optional: `seconds` (default `"8"`, the duration field — not
        `duration`), `size` (default `"1280x720"`), `metadata.*`

        - **Response does not include the video file** — poll `GET
        /v1/videos/{task_id}` until `status: "completed"`, then call `GET
        /v1/videos/{task_id}/content` to download MP4

        - Typical render time: 720p 60–90 sec, 1080p 80–120 sec, 4K 5–6 min

        - For image-based generation, use the [Image-to-Video
        endpoint](/en/api-capabilities/veo-3-1-official/image-to-video)
      operationId: generateVeo31OfficialTextToVideo
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Veo31TextToVideoRequest'
            example:
              model: veo-3.1-fast-generate-preview
              prompt: >-
                A coastal lighthouse at dusk, slow push-in, waves lapping the
                rocks, distant seabirds, cinematic lighting, steady camera
              seconds: '8'
              size: 1280x720
              metadata:
                resolution: 720p
                aspectRatio: '16:9'
                seed: 20260521
                negativePrompt: blurry, watermark, distorted, low quality
      responses:
        '200':
          description: Task submitted; returns task_id and queued status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Veo31VideoTask'
        '400':
          description: >-
            Invalid parameter (seconds as number; seconds not in 4/6/8; field
            misnamed as duration; non-8-sec at 1080p/4k; prompt missing; etc.)
        '401':
          description: Unauthorized - invalid API Key
        '429':
          description: Rate limit or insufficient balance
        '500':
          description: Upstream gateway error; retry 1–2 times (failed tasks not billed)
      security:
        - bearerAuth: []
components:
  schemas:
    Veo31TextToVideoRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: >
            Model ID (per-request billing, duration / resolution do not affect
            price):

            - `veo-3.1-fast-generate-preview` — \$0.3/request, top pick for
            iteration / batch generation

            - `veo-3.1-generate-preview` — \$1.2/request, for final delivery /
            4K scenarios
          enum:
            - veo-3.1-fast-generate-preview
            - veo-3.1-generate-preview
          default: veo-3.1-fast-generate-preview
        prompt:
          type: string
          description: >
            Video generation prompt; describe in detail: scene + subject +
            action + camera + lighting + style.


            **Audio intent also goes in the prompt** (e.g. "waves, distant
            seabirds, low wind sounds"). **Do not pass `generateAudio`** —
            upstream rejects with `INVALID_ARGUMENT`.
          example: >-
            A coastal lighthouse at dusk, slow push-in, waves lapping the rocks,
            distant seabirds, cinematic lighting, steady camera
        seconds:
          type: string
          description: >
            Video length. **The field name is `seconds` (not `duration`)**, a
            **string enum** (not number):

            - `"4"` — 4 sec, 720p only

            - `"6"` — 6 sec, 720p only

            - `"8"` — 8 sec (default), **required at 1080p / 4k**


            Sending `duration` instead is silently ignored → length falls back
            to the default 4 sec (720p returns no error but only outputs 4 sec;
            1080p/4k errors with `... but got 4`). Passing a number (`8`)
            returns `parse_request_failed: cannot unmarshal number into Go
            struct field ... duration of type string`.
          enum:
            - '4'
            - '6'
            - '8'
          default: '8'
        size:
          type: string
          description: >
            Output pixel dimensions; lower precedence than
            `metadata.resolution`:

            - `1280x720` / `720x1280` — 720p (default)

            - `1920x1080` / `1080x1920` — 1080p (seconds must be `"8"`)

            - `3840x2160` / `2160x3840` — 4k (seconds must be `"8"`, 4–6× slower
            render)
          enum:
            - 1280x720
            - 720x1280
            - 1920x1080
            - 1080x1920
            - 3840x2160
            - 2160x3840
          default: 1280x720
        metadata:
          $ref: '#/components/schemas/Veo31TextToVideoMetadata'
    Veo31VideoTask:
      type: object
      properties:
        id:
          type: string
          description: >-
            Task ID (matches `task_id`; downstream should standardize on
            `task_id`)
          example: task_xxxxxxxxxxxxxxxx
        task_id:
          type: string
          description: Task ID for subsequent polling and download
          example: task_xxxxxxxxxxxxxxxx
        object:
          type: string
          description: Object type, fixed to `video`
          example: video
        model:
          type: string
          description: Model ID used for this task
          example: veo-3.1-fast-generate-preview
        status:
          type: string
          description: |
            Task status:
            - `queued` — submitted, awaiting processing
            - `in_progress` — generating
            - `completed` — done, downloadable (`/v1/videos/{task_id}/content`)
            - `failed` — failed (**not billed**), retry possible
          enum:
            - queued
            - in_progress
            - completed
            - failed
          example: queued
        progress:
          type: integer
          description: >-
            Generation progress (coarse-grained, **jumps only between 0 / 50 /
            100**, do not use for percentage bars)
          example: 0
        created_at:
          type: integer
          description: Task creation Unix timestamp (seconds)
          example: 1775025000
        completed_at:
          type: integer
          description: >-
            Task completion Unix timestamp (seconds); only present for completed
            status
          example: 1775025090
    Veo31TextToVideoMetadata:
      type: object
      description: >
        Wrapper for fine-grained generation parameters. **Higher precedence than
        the top-level `size` etc.**:

        - Duration resolution order: `metadata.durationSeconds > seconds > 8`
        (send `seconds`; `duration` is not recognized)

        - Resolution resolution order: `metadata.resolution > size > 720p`
      properties:
        resolution:
          type: string
          description: Resolution tier (higher precedence than `size`)
          enum:
            - 720p
            - 1080p
            - 4k
          default: 720p
        aspectRatio:
          type: string
          description: 'Aspect ratio: `16:9` landscape (default) or `9:16` portrait'
          enum:
            - '16:9'
            - '9:16'
          default: '16:9'
        seed:
          type: integer
          description: >
            Random seed. Fixed seed clusters outputs in style (intra-group file
            size spread ~6%, inter-group ~36%), **but does not byte-reproduce**.
          example: 20260521
        negativePrompt:
          type: string
          description: >-
            Negative prompt; recommended `"blurry, watermark, distorted, low
            quality"`
          example: blurry, watermark, distorted, low quality
        durationSeconds:
          type: integer
          description: >-
            Equivalent to top-level `seconds` with highest precedence (generally
            prefer `seconds` for consistency)
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        API Key from APIYI console (Default group + Pay-per-request or
        Pay-as-you-go Priority Token; pure Pay-as-you-go not supported)

````