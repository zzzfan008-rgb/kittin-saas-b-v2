> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-H3 動画生成 API リファレンス

> MiniMax-H3 動画生成APIリファレンスおよびライブPlayground：テキスト、先頭/末尾フレーム、参照画像/動画/音声による動画に対応した単一エンドポイント。非同期送信とtask_idによる照会、768P、4〜15秒、秒単位での課金。

<Info>
  右側のインタラクティブなPlaygroundで、リアルタイムにテストを行えます。**Authorization**にAPI Keyを入力し（形式は`Bearer sk-xxx`）、`content`にテキスト項目を1つ追加して（必要に応じて画像、動画、音声項目も追加）、`duration`と`ratio`を選択して送信してください。レスポンスは`task_id`です。後述のクエリエンドポイントを使用して動画を取得してください。
</Info>

<Tip>
  **1つのエンドポイント、4つのモード**: テキストのみ = テキストから動画生成、`first_frame` / `last_frame` 画像を追加 = キーフレーム動画、`reference_image` / `reference_video` / `reference_audio` を追加 = 参照動画。モードは`content[]`から推測されるため、エンドポイントを切り替える必要はありません。全体像については[MiniMax-H3の概要](/ja/api-capabilities/minimax-h3/overview)をご覧ください。
</Tip>

<Warning>
  **⚠️ 最もよくある4つの間違い**

  1. **パスは`/hailuo`で始まります**: `POST /hailuo/v2/video_generation`で作成し、`GET /hailuo/v2/query/video_generation/{task_id}`でクエリします。単なる`/v2/...`パスはJSONではなくWebページを返します
  2. **`duration`は4から15の整数である必要があります**: 文字列`"5"`や`5.5`のような小数は拒否されます
  3. **`resolution`は大文字の`768P`である必要があります**: `768p`と`2K`はどちらも拒否されます
  4. **テキストのみおよび音声のみのリクエストでは`ratio: "adaptive"`を使用できません**。固定の比率を選択してください。`adaptive`はリクエストに画像または動画が含まれている場合にのみ機能します
</Warning>

## コード例

### Python (requests · 送信 + ポーリング + ダウンロード)

```python theme={null}
import time
import requests

API_KEY = "sk-your-api-key"
BASE = "https://api.apiyi.com/hailuo/v2"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

# Step 1: submit the task
payload = {
    "model": "MiniMax-H3",
    "content": [
        {"type": "text", "text": "A lighthouse by the sea at dusk, slow dolly in, waves crashing on the rocks, cinematic lighting"}
    ],
    "resolution": "768P",   # uppercase 768P only
    "duration": 5,          # integer 4–15, billed per second
    "ratio": "16:9",        # text-only requests need a fixed ratio
}
for attempt in range(3):
    # Submitting takes a few seconds; occasional 500s at peak are not billed, so back off and retry
    r = requests.post(f"{BASE}/video_generation", headers=HEADERS, json=payload, timeout=60)
    if r.status_code != 500:
        break
    time.sleep(5 * (attempt + 1))
r.raise_for_status()
task_id = r.json()["task_id"]
print("task_id:", task_id)

# Step 2: poll (usually 2–4 minutes; give up after 15)
deadline = time.time() + 900
while time.time() < deadline:
    task = requests.get(f"{BASE}/query/video_generation/{task_id}",
                        headers=HEADERS, timeout=30).json()["task"]
    print(task["status"])
    if task["status"] == "succeeded":
        video_url = task["content"]["url"]
        break
    if task["status"] == "failed":
        # Failed tasks are refunded automatically; the reason is in error
        raise RuntimeError(task["error"])
    time.sleep(10)
else:
    raise TimeoutError(task_id)

# Step 3: download (no auth header needed; use GET, not HEAD, to check the URL)
with requests.get(video_url, stream=True, timeout=300) as v, open("output.mp4", "wb") as f:
    v.raise_for_status()
    for chunk in v.iter_content(1 << 16):
        f.write(chunk)
print("Saved: output.mp4")
```

### Python (ファーストフレーム動画 · リクエストボディ)

```python theme={null}
payload = {
    "model": "MiniMax-H3",
    "content": [
        {"type": "text", "text": "The character slowly turns and smiles, a light breeze moves the hair, gentle push-in"},
        {"type": "image_url",
         "image_url": {"url": "https://your-cdn.example.com/first.png"},
         "role": "first_frame"},
    ],
    "resolution": "768P",
    "duration": 5,
    "ratio": "adaptive",   # follow the first frame's aspect ratio
}
```

### Python (混合リファレンス · リクエストボディ)

```python theme={null}
payload = {
    "model": "MiniMax-H3",
    "content": [
        # Numbered by order within each media type: first image = <Picture 1>, first video = <Video 1>
        {"type": "text", "text": "<Picture 1> dances with the moves from <Video 1>, in time with <Audio 1>"},
        {"type": "image_url", "image_url": {"url": "https://your-cdn.example.com/character.png"},
         "role": "reference_image"},
        {"type": "video_url", "video_url": {"url": "https://your-cdn.example.com/motion.mp4"},
         "role": "reference_video"},
        {"type": "audio_url", "audio_url": {"url": "https://your-cdn.example.com/music.mp3"},
         "role": "reference_audio"},
    ],
    "resolution": "768P",
    "duration": 10,
    "ratio": "adaptive",
}
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/hailuo/v2/video_generation" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  --max-time 60 \
  -d '{
    "model": "MiniMax-H3",
    "content": [
      {"type": "text", "text": "A lighthouse by the sea at dusk, slow dolly in, waves crashing on the rocks, cinematic lighting"}
    ],
    "resolution": "768P",
    "duration": 5,
    "ratio": "16:9"
  }'
```

### Node.js (ネイティブ fetch)

```javascript theme={null}
const API_KEY = 'sk-your-api-key';
const BASE = 'https://api.apiyi.com/hailuo/v2';
const headers = { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };

const submit = await fetch(`${BASE}/video_generation`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    model: 'MiniMax-H3',
    content: [{ type: 'text', text: 'Aurora drifting over snowy mountains, time-lapse look' }],
    resolution: '768P',
    duration: 8,
    ratio: '21:9',
  }),
});
if (!submit.ok) throw new Error(`submit ${submit.status}: ${await submit.text()}`);
const { task_id } = await submit.json();

let task;
for (;;) {
  await new Promise(r => setTimeout(r, 10000));
  task = (await (await fetch(`${BASE}/query/video_generation/${task_id}`, { headers })).json()).task;
  if (task.status === 'succeeded' || task.status === 'failed') break;
}
if (task.status === 'failed') throw new Error(JSON.stringify(task.error));
console.log('video:', task.content.url);
```

### ブラウザ JavaScript

```javascript theme={null}
{/* Demo only. In production, call through your backend so the key is not exposed */}
const resp = await fetch('https://api.apiyi.com/hailuo/v2/video_generation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-your-api-key' },
  body: JSON.stringify({
    model: 'MiniMax-H3',
    content: [{ type: 'text', text: 'A watercolor paper boat drifting down a calm river' }],
    resolution: '768P',
    duration: 4,
    ratio: '9:16',
  }),
});
const { task_id } = await resp.json();
console.log('task_id:', task_id);
{/* Let the backend poll; once you have content.url, play it in a video tag */}
```

## すでに task\_id をお持ちですか？ 1 回の cURL 呼び出し

```bash theme={null}
curl "https://api.apiyi.com/hailuo/v2/query/video_generation/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer sk-your-api-key"
```

`status` が `succeeded` の場合、`task.content.url` は MP4 URL となり、直接ダウンロードできます：

```bash theme={null}
curl -L -o output.mp4 "<value of task.content.url>"
```

## パラメータリファレンス

| パラメータ | タイプ | 必須 | デフォルト | 説明 |
| - | - | - | - | - |
| `model` | string | はい | — | 常に`MiniMax-H3`（大文字と小文字を区別） |
| `content` | array | はい | — | 正確に1つのテキストアイテム + 0〜12個のメディアアイテム（最大9枚の参照画像、3本の参照動画、3本の参照音声クリップ） |
| `content[].text` | string | はい | — | 1〜7000文字。メディアは`<Picture 1>` / `<Video 1>` / `<Audio 1>`として参照します |
| `content[].role` | string | 条件付き | — | 画像：`first_frame` / `last_frame` / `reference_image`、動画：`reference_video`、音声：`reference_audio`。画像が1枚のみの場合は任意（最初のフレームとして扱われます） |
| `resolution` | string | はい | — | `768P`のみ |
| `duration` | integer | はい | — | 4〜15秒、秒単位で課金 |
| `ratio` | string | はい | — | `21:9` / `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `adaptive` |

### アスペクト比と出力サイズ（実測値）

| `ratio` | 出力サイズ |
| - | - |
| `21:9` | 1536×672 |
| `16:9` | 1344×768 |
| `4:3` | 1024×768 |
| `1:1` | 768×768 |
| `3:4` | 768×1024 |
| `9:16` | 768×1344 |
| `adaptive` | 入力画像のアスペクト比に従います（正方形の画像の場合は768×768になります） |

### メディア要件

| タイプ | 形式 | サイズ | 長さ / 寸法 |
| - | - | - | - |
| 画像 | JPG / PNG / WebP / HEIC / HEIF（静止画） | ≤ 30MB | 1辺あたり256〜5760 px、アスペクト比0.4〜2.5。最初と最後のフレームのアスペクト比の差が2%以内 |
| 動画 | MP4 / MOV (H.264 / H.265) | ≤ 50MB | 1クリップあたり2秒以上。15秒を超えるクリップは最初の15秒にトリミングされます。クリップの**合計**は最大15秒 |
| 音声 | WAV / MP3 / M4A / AAC | ≤ 15MB | 1クリップあたり2秒以上。15秒を超えるクリップは最初の15秒にトリミングされます |

<Warning>
  すべてのメディアは、**直接ダウンロード可能な公開HTTPS URL**である必要があります。Base64、データURI、`http://`リンク、およびプライベートネットワークのアドレスはサポートされていません。直リンク防止（ホットリンク保護）やログインが必要なリンクの場合、メディアのダウンロード試行時にタスクが失敗します。
</Warning>

## レスポンス形式

### タスクの作成

```json theme={null}
{"task_id": "task_Clo9iKPCM46sRwRsMFcmJG6pGNSL1ygx"}
```

### タスクのクエリ（進行中）

```json theme={null}
{
  "task": {
    "id": "task_Clo9iKPCM46sRwRsMFcmJG6pGNSL1ygx",
    "status": "running",
    "progress": 0,
    "content": null,
    "error": null
  }
}
```

### タスクのクエリ（成功）

```json theme={null}
{
  "task": {
    "id": "task_R3SNqSywqnYPTAbqg1Z4iXEItPoln59I",
    "status": "succeeded",
    "progress": 1,
    "model": "MiniMax-H3",
    "modality": "video",
    "task_type": "generation",
    "ratio": "21:9",
    "resolution": "768P",
    "duration": 5,
    "usage": {
      "input_image_count": 0,
      "input_seconds": 0,
      "output_seconds": 5,
      "total_seconds": 5
    },
    "content": {
      "url": "https://your-video-host.example.com/outputs/4a441cc0....mp4"
    },
    "created_at": 1790641245,
    "updated_at": 1790641411
  }
}
```

### タスクのクエリ（失敗）

```json theme={null}
{
  "task": {
    "id": "task_w6ASrlpw5rfIVeeMSMnC5sHryP2Xv4th",
    "status": "failed",
    "error": {"code": "input_download_failed", "message": "media server returned 404"}
  }
}
```

<Warning>
  **⚠️ レスポンスに関する注意点**

  * クエリ結果はトップレベルではなく、**`task`** オブジェクト内にラップされています
  * 成功時に保証されるのは `id`、`status`、`progress`、`content.url` のみです。`usage`、`model`、`ratio` などのフィールドは**常に返されるとは限らない**ため、防御的にパースしてください
  * ステータスは `queued` → `running` → `succeeded` / `failed` と遷移します。ピーク時にはタスクが `running` から開始される場合があります
  * `progress` は 0 と 1 の間でのみ切り替わるため、プログレスバーとしては利用できません
  * 動画の URL は `task.content.url` であり、認証ヘッダーは**不要**です。`HEAD` リクエストに対しては 403 を返しますが、`GET` では動作するため、確認には `GET` を使用してください
  * URL を取得したら、速やかにお客様側で動画をダウンロードして保存してください
</Warning>

<Info>
  **課金**: タスクが受け入れられると `duration × \$0.03` が事前課金され、参照メディアに対する追加料金は発生しません。失敗したタスクは**自動的に全額返金**されます。送信時に 4xx / 5xx を返したリクエストは課金されず、クエリやダウンロードは無料です。詳細は[概要ページの料金](/ja/api-capabilities/minimax-h3/overview#pricing)をご覧ください。
</Info>


## OpenAPI

````yaml api-reference/minimax-h3-video-openapi-en.yaml POST /hailuo/v2/video_generation
openapi: 3.1.0
info:
  title: MiniMax-H3 Video Generation API
  description: >
    MiniMax H3 (Hailuo 3.0) video generation — one endpoint covers
    text-to-video, first/last-frame video, and video from reference images,
    videos, and audio.


    - Model ID: `MiniMax-H3` (case-sensitive)

    - Resolution `768P` only; duration is an integer from 4 to 15 seconds;
    ratios `21:9` / `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `adaptive`

    - The output MP4 always includes a stereo audio track (music and sound
    effects follow the prompt; there is no switch to turn it off)

    - Billed per second at \$0.03/s with no extra charge for reference media;
    failed tasks are refunded automatically

    - **Async task endpoint**: this call only submits the task and returns a
    `task_id`; poll `GET /hailuo/v2/query/video_generation/{task_id}` for the
    result


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API Key**: create a token in the [APIYI
    console](https://api.apiyi.com/token)
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
security:
  - bearerAuth: []
paths:
  /hailuo/v2/video_generation:
    post:
      tags:
        - Video Generation
      summary: Create a MiniMax-H3 video generation task
      description: >
        Submits an async video generation task. Success only means the task was
        accepted; the response is `{"task_id": "task_..."}`.


        The generation mode is inferred from `content[]`:

        - Text only → text-to-video (`ratio` must be a fixed ratio, not
        `adaptive`)

        - Text + `first_frame` / `last_frame` image → keyframe video

        - Text + `reference_image` / `reference_video` / `reference_audio` →
        reference video; refer to the media in the prompt as `<Picture 1>`,
        `<Video 1>`, `<Audio 1>`


        Rules:

        - `content[]` must contain exactly one text item plus 0–12 media items
        (at most 9 reference images, 3 reference videos, 3 reference audio
        clips)

        - All media must be public HTTPS URLs; Base64, data URIs, and private
        addresses are not supported

        - First/last frames cannot be mixed with `reference_*` media; with more
        than one image, set `role` explicitly

        - Generation typically takes 2–4 minutes; then query `GET
        /hailuo/v2/query/video_generation/{task_id}`
      operationId: createMiniMaxH3VideoGeneration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/H3CreateRequest'
            examples:
              TextToVideo:
                value:
                  model: MiniMax-H3
                  content:
                    - type: text
                      text: >-
                        A lighthouse by the sea at dusk, slow dolly in, waves
                        crashing on the rocks, cinematic lighting
                  resolution: 768P
                  duration: 5
                  ratio: '16:9'
              FirstFrame:
                value:
                  model: MiniMax-H3
                  content:
                    - type: text
                      text: >-
                        The character slowly turns and smiles, a light breeze
                        moves the hair, gentle push-in
                    - type: image_url
                      image_url:
                        url: https://your-cdn.example.com/first.png
                      role: first_frame
                  resolution: 768P
                  duration: 5
                  ratio: adaptive
              ReferenceImages:
                value:
                  model: MiniMax-H3
                  content:
                    - type: text
                      text: >-
                        <Picture 1> and <Picture 2> walk side by side down a
                        rainy street
                    - type: image_url
                      image_url:
                        url: https://your-cdn.example.com/person-a.png
                      role: reference_image
                    - type: image_url
                      image_url:
                        url: https://your-cdn.example.com/person-b.png
                      role: reference_image
                  resolution: 768P
                  duration: 8
                  ratio: adaptive
              ReferenceAudio:
                value:
                  model: MiniMax-H3
                  content:
                    - type: text
                      text: A cinematic dance performance synchronized to <Audio 1>
                    - type: audio_url
                      audio_url:
                        url: https://your-cdn.example.com/music.mp3
                      role: reference_audio
                  resolution: 768P
                  duration: 10
                  ratio: '16:9'
      responses:
        '200':
          description: Task accepted; returns task_id
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/H3CreateResponse'
              example:
                task_id: task_Clo9iKPCM46sRwRsMFcmJG6pGNSL1ygx
        '400':
          description: >-
            Validation failed (duration outside 4–15, invalid ratio, text over
            7000 characters, too many media items, mixed roles, etc.). Not
            billed
        '401':
          description: Unauthorized - invalid API Key
        '500':
          description: >-
            Upstream error (includes some invalid parameters and transient
            overload). Not billed; check the parameters, then retry with backoff
        '503':
          description: >-
            No available channel for the token's group (usually a misspelled
            model name, or the token's group does not include this model)
      security:
        - bearerAuth: []
components:
  schemas:
    H3CreateRequest:
      type: object
      required:
        - model
        - content
        - resolution
        - duration
        - ratio
      properties:
        model:
          type: string
          description: Always `MiniMax-H3` (case-sensitive)
          enum:
            - MiniMax-H3
          default: MiniMax-H3
        content:
          type: array
          description: >
            Exactly one text item plus 0–12 media items. Media item types:

            - `image_url`: role `first_frame` / `last_frame` /
            `reference_image`; up to 9 reference images. A single image without
            `role` is treated as the first frame

            - `video_url`: role `reference_video`; up to 3 clips, MP4/MOV, 50MB
            max, at least 2 seconds each, 15 seconds total at most

            - `audio_url`: role `reference_audio`; up to 3 clips,
            WAV/MP3/M4A/AAC, 15MB max, at least 2 seconds each
          minItems: 1
          maxItems: 13
          items:
            oneOf:
              - $ref: '#/components/schemas/H3TextItem'
              - $ref: '#/components/schemas/H3ImageItem'
              - $ref: '#/components/schemas/H3VideoItem'
              - $ref: '#/components/schemas/H3AudioItem'
        resolution:
          type: string
          description: >-
            Resolution. This channel supports `768P` only (uppercase; `768p` and
            `2K` are rejected)
          enum:
            - 768P
          default: 768P
        duration:
          type: integer
          description: >-
            Output length in seconds, an integer from 4 to 15. Billed per
            second; the finished clip is usually 0.1–0.5 s longer than requested
          minimum: 4
          maximum: 15
          default: 5
        ratio:
          type: string
          description: >
            Aspect ratio and output size: `21:9`=1536×672, `16:9`=1344×768,
            `4:3`=1024×768, `1:1`=768×768, `3:4`=768×1024, `9:16`=768×1344.

            `adaptive` follows the input image's ratio and only works for
            requests with images or videos; text-only and audio-only requests
            need a fixed ratio.
          enum:
            - '16:9'
            - '9:16'
            - '21:9'
            - '4:3'
            - '1:1'
            - '3:4'
            - adaptive
          default: '16:9'
    H3CreateResponse:
      type: object
      properties:
        task_id:
          type: string
          description: Task ID for `GET /hailuo/v2/query/video_generation/{task_id}`
          example: task_Clo9iKPCM46sRwRsMFcmJG6pGNSL1ygx
    H3TextItem:
      type: object
      required:
        - type
        - text
      properties:
        type:
          type: string
          enum:
            - text
        text:
          type: string
          maxLength: 7000
          description: >-
            Video description, 1–7000 characters. Refer to media as `<Picture
            1>` / `<Video 1>` / `<Audio 1>` (numbered by order within each media
            type)
          example: >-
            A lighthouse by the sea at dusk, slow dolly in, waves crashing on
            the rocks, cinematic lighting
    H3ImageItem:
      type: object
      required:
        - type
        - image_url
      properties:
        type:
          type: string
          enum:
            - image_url
        image_url:
          type: object
          required:
            - url
          properties:
            url:
              type: string
              description: >-
                Public HTTPS image URL. JPG/PNG/WebP/HEIC/HEIF, 30MB max,
                256–5760 px per side, aspect ratio 0.4–2.5
              example: https://your-cdn.example.com/first.png
        role:
          type: string
          enum:
            - first_frame
            - last_frame
            - reference_image
          description: >-
            First frame / last frame / reference image. First/last frames cannot
            be mixed with reference media
    H3VideoItem:
      type: object
      required:
        - type
        - video_url
        - role
      properties:
        type:
          type: string
          enum:
            - video_url
        video_url:
          type: object
          required:
            - url
          properties:
            url:
              type: string
              description: >-
                Public HTTPS video URL. MP4/MOV (H.264/H.265), 50MB max; clips
                longer than 15 s are trimmed to the first 15 s
              example: https://your-cdn.example.com/motion.mp4
        role:
          type: string
          enum:
            - reference_video
    H3AudioItem:
      type: object
      required:
        - type
        - audio_url
        - role
      properties:
        type:
          type: string
          enum:
            - audio_url
        audio_url:
          type: object
          required:
            - url
          properties:
            url:
              type: string
              description: >-
                Public HTTPS audio URL. WAV/MP3/M4A/AAC, 15MB max; clips longer
                than 15 s are trimmed to the first 15 s
              example: https://your-cdn.example.com/music.mp3
        role:
          type: string
          enum:
            - reference_audio
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.