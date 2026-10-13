> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Oxygen 動画生成 API リファレンス

> Oxygen (oxygen-1.0) 動画生成 API リファレンスとライブ Playground：OpenAI Videos 互換、POST /v1/videos で送信し、GET /v1/videos/{id} で照会、エンベロープ経由での先頭/末尾フレームおよび参照メディア指定に対応、秒単位で課金。

<Info>
  右側のインタラクティブなPlaygroundで、呼び出しを直接テストできます。**Authorization**にAPIキーを入力し（フォーマット：`Bearer sk-xxx`）、`prompt`、`seconds`、`size`を入力して送信してください。レスポンスはタスク`id`です。以下のクエリエンドポイントから動画を取得してください。
</Info>

<Tip>
  **1つのエンドポイント、4つのモード**：`prompt`のみ = テキストから動画生成、`input_reference`に画像1枚 = 先頭フレーム動画生成、`input_reference`にJSONエンベロープ = 先頭・最終フレームまたは参照メディア動画生成。また、エンベロープでは320pや1:1を選択することも可能です。全体像については[Oxygen Overview](/ja/api-capabilities/oxygen/overview)をご覧ください。
</Tip>

<Warning>
  **⚠️ 最もよくある4つの間違い**

  1. **必ず`size`を渡す**：指定しない場合、ゲートウェイはデフォルトで`720x1280`となり、縦向きの出力になります
  2. **高度なパラメータは`input_reference`エンベロープ内に配置する**：トップレベルで有効なのは`model`、`prompt`、`seconds`、`size`、`input_reference`のみです。トップレベルに配置された`last_image`、`reference_images`、`resolution`、`aspect_ratio`は、エラーが出ることなく**サイレントに破棄されます**
  3. **`input_reference`は文字列である必要があります**：事前に`json.dumps` / `JSON.stringify`でエンベロープをシリアライズしてください。オブジェクトや配列を渡すと拒否されます
  4. **長さの設定はトップレベルの`seconds`でのみ行う**（4–15）：エンベロープ内に`duration`を指定すると400が返されます
</Warning>

## コード例

### Python (requests · 送信 + ポーリング + ダウンロード)

```python theme={null}
import os
import time
import requests

API_KEY = os.environ["APIYI_API_KEY"]
BASE = "https://api.apiyi.com/v1/videos"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

# Step 1: submit the task
payload = {
    "model": "oxygen-1.0",
    "prompt": "A paper boat drifting on a calm pond, soft morning light",
    "seconds": "4",          # 4–15, billed per second
    "size": "1280x720",      # always pass it: 1280x720 = 480p landscape
}
r = requests.post(BASE, headers=HEADERS, json=payload, timeout=60)
r.raise_for_status()
video_id = r.json()["id"]
print("id:", video_id)

# Step 2: poll (usually 1–3 minutes, wait up to 15 minutes)
deadline = time.time() + 900
while time.time() < deadline:
    job = requests.get(f"{BASE}/{video_id}", headers=HEADERS, timeout=30).json()
    print(job["status"], job.get("progress"))
    if job["status"] == "completed":
        video_url = job["video_url"]
        break
    if job["status"] == "failed":
        # Failed tasks are refunded automatically; error has the reason
        raise RuntimeError(job.get("error"))
    time.sleep(5)
else:
    raise TimeoutError(video_id)

# Step 3: download video_url directly (no auth header; valid ~24 hours, store it promptly)
with requests.get(video_url, stream=True, timeout=300) as v, open("output.mp4", "wb") as f:
    v.raise_for_status()
    for chunk in v.iter_content(1 << 16):
        f.write(chunk)
print("Saved: output.mp4")
```

### Python (先頭フレーム動画 · リクエストボディ)

```python theme={null}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The glass sphere rolls slowly across the table",
    "seconds": "4",
    "size": "1280x720",      # sets the resolution (480p); aspect ratio follows the first frame
    "input_reference": "https://your-cdn.example.com/first.png",  # a data:image/...;base64,... URI also works
}
```

### Python (先頭・末尾フレーム / 参照メディア · JSON エンベロープ)

```python theme={null}
import json

# First and last frame: the envelope is a JSON string, json.dumps it into input_reference
envelope = {
    "images": ["https://your-cdn.example.com/first.png"],   # first frame (max 1)
    "last_image": "https://your-cdn.example.com/last.png",  # last frame
}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
    "seconds": "5",
    "size": "1280x720",
    "input_reference": json.dumps(envelope),
}

# Reference media + portrait + 320p (reference media cannot be mixed with first/last frames)
envelope = {
    "reference_images": ["https://your-cdn.example.com/character.png"],   # up to 9
    "reference_videos": ["https://your-cdn.example.com/motion.mp4"],      # up to 3, https only
    "aspect_ratio": "9:16",
    "resolution": "320p",    # resolution in the envelope wins over size
}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The character from the reference image dances following the reference video",
    "seconds": "8",
    "size": "720x1280",
    "input_reference": json.dumps(envelope),
}
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  --max-time 60 \
  -d '{
    "model": "oxygen-1.0",
    "prompt": "A lighthouse at dusk, waves crashing on the rocks",
    "seconds": "4",
    "size": "1792x1024"
  }'
```

先頭・末尾フレーム（`input_reference` の値はエスケープされた JSON 文字列である点にご注意ください）:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "oxygen-1.0",
    "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
    "seconds": "5",
    "size": "1280x720",
    "input_reference": "{\"images\":[\"https://your-cdn.example.com/first.png\"],\"last_image\":\"https://your-cdn.example.com/last.png\"}"
  }'
```

### Node.js (ネイティブ fetch)

```javascript theme={null}
const API_KEY = process.env.APIYI_API_KEY;
const BASE = 'https://api.apiyi.com/v1/videos';
const headers = { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };

const submit = await fetch(BASE, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    model: 'oxygen-1.0',
    prompt: 'Aurora drifting over snowy mountains, time-lapse feel',
    seconds: '8',
    size: '1280x720',
    // Advanced parameters: JSON.stringify the envelope into a string first
    input_reference: JSON.stringify({ resolution: '320p' }),
  }),
});
if (!submit.ok) throw new Error(`submit ${submit.status}: ${await submit.text()}`);
const { id } = await submit.json();

let job;
for (;;) {
  await new Promise(r => setTimeout(r, 5000));
  job = await (await fetch(`${BASE}/${id}`, { headers })).json();
  if (job.status === 'completed' || job.status === 'failed') break;
}
if (job.status === 'failed') throw new Error(JSON.stringify(job.error));
console.log('video:', job.video_url);
```

## id をお持ちですか？ cURL 1 つで結果を取得

```bash theme={null}
curl "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer $APIYI_API_KEY"
```

`status` が `completed` の場合、`video_url` は MP4 アドレスとなり、直接ダウンロードできます：

```bash theme={null}
curl -L -o output.mp4 "<value of video_url>"
```

## パラメーターリファレンス

### トップレベルフィールド（有効なのはこの5つのみ）

| パラメーター | 型 | 必須 | 説明 |
| - | - | - | - |
| `model` | string | 必須 | 常に`oxygen-1.0` |
| `prompt` | string | 必須 | 動画の説明 |
| `seconds` | string / integer | 必須 | 4–15の整数。課金に使用されます |
| `size` | string | 強く推奨 | `1280x720` / `720x1280` (480p)、`1792x1024` / `1024x1792` (768p)。省略した場合はデフォルトで`720x1280` |
| `input_reference` | string | 任意 | 画像URLまたはdata URI = 最初のフレーム。`{`で始まるJSON文字列 = エンベロープ（下記参照） |

### `input_reference` エンベロープキー

| キー | 型 | 説明 |
| - | - | - |
| `images` | string\[] | 最初のフレーム、最大1つ（httpsまたは画像data URI） |
| `last_image` | string | 最後のフレーム（httpsまたは画像data URI） |
| `reference_images` | string\[] | 参照画像、最大9つ |
| `reference_videos` | string\[] | 参照動画、最大3つ、httpsのみ |
| `reference_audios` | string\[] | 参照音声、最大3つ、httpsのみ |
| `resolution` | string | `320p` / `480p` / `768p`、`size`より優先 |
| `aspect_ratio` | string | `16:9` / `9:16` / `1:1`、`size`より優先。image-to-videoでは無視されます |
| `prompt` | string | 存在する場合、トップレベルの`prompt`を上書き |

<Warning>
  エンベロープには\*\*`duration`を含めることはできず\*\*（トップレベルの`seconds`を使用してください）、表にないキーも含めることはできません。また、最初/最後のフレーム（`images` / `last_image`）を`reference_*`と組み合わせることはできません。これらに該当する場合は400（`param: input_reference`）が返され、課金は発生しません。
</Warning>

### 解像度と出力サイズ（実測値）

| 解像度 | 横向き 16:9 | 縦向き 9:16 | 正方形 1:1 |
| - | - | - | - |
| 320p | 576×320 | （未測定） | （未測定） |
| 480p | 864×480 | 480×864 | 480×480 |
| 768p | 1344×768 | 768×1344 | 768×768 |

image-to-videoは最初のフレームのアスペクト比に従います。例えば、正方形の最初のフレームの場合、480pでは480×480になります。

## レスポンス形式

### タスクの作成

```json theme={null}
{
  "id": "task_PSOFP1GQLtN6kGLXv9DpHMkMGBka70Ga",
  "object": "video",
  "model": "oxygen-1.0",
  "status": "queued",
  "progress": 0,
  "seconds": "4",
  "size": "1280x720",
  "created_at": 1790853159
}
```

### タスクの照会（成功）

```json theme={null}
{
  "id": "task_R0Sb8B4YqmNxVSkQZSphUZ8GwEebRMRu",
  "object": "video",
  "model": "oxygen-1.0",
  "status": "completed",
  "progress": 100,
  "seconds": "5",
  "created_at": 1790902499,
  "completed_at": 1790902566,
  "expires_at": 1790988966,
  "usage": {
    "billing_unit": "second",
    "billed_seconds": 5,
    "resolution": "480p",
    "unit_price_usd": 0.02
  },
  "video_url": "https://your-video-host.example.com/task_R0Sb8B4Y..._0.mp4"
}
```

### タスクの照会（失敗）

```json theme={null}
{
  "id": "task_xqNrojcHWebOegX70EZzqpM3EhdXMnOo",
  "object": "video",
  "model": "oxygen-1.0",
  "status": "failed",
  "progress": 100,
  "error": {
    "code": "upstream_timeout",
    "message": "upstream did not finish the video within the deadline"
  }
}
```

### 送信エラー（400）

```json theme={null}
{
  "message": "{\"error\":{\"code\":\"invalid_params\",\"message\":\"input_reference: duration is not used here; set the length with the top-level seconds field\",\"param\":\"input_reference\"}}",
  "type": "task_error",
  "code": "fail_to_fetch_task"
}
```

<Warning>
  **⚠️ レスポンスに関する注意事項**

  * ステータスは `queued` → `in_progress` → `completed` / `failed` と遷移します
  * 動画は **`video_url`** にあり、認証ヘッダーなしでダウンロード可能です。`expires_at`（約24時間）で有効期限が切れるため、速やかに保存してください
  * `completed` の直後は、`/v1/videos/{id}/content` にさらに数秒かかる場合があり（最初は400を返します）、`video_url` の利用を推奨します
  * `usage.unit_price_usd` は解像度ごとの参考価格です。**実際の課金はお客様の請求に従い**、一律1秒あたり \$0.02 となります
  * 送信エラーの場合、詳細は `message` 内の JSON 文字列となっているため、再度パースする必要があります
</Warning>

<Info>
  **課金**: `seconds × \$0.02` はタスクが受け付けられた時点で課金されます。解像度や参照メディアによって価格が変わることはなく、失敗したタスクは**自動的に全額返金**されます。400を返す送信には課金されず、照会やダウンロードは無料です。[概要の料金](/ja/api-capabilities/oxygen/overview#pricing)をご覧ください。
</Info>


## OpenAPI

````yaml api-reference/oxygen-video-openapi-en.yaml POST /videos
openapi: 3.1.0
info:
  title: Oxygen Video Generation API
  description: >
    AZ8 Oxygen video generation model with an OpenAI Videos-compatible API. One
    endpoint covers text-to-video, first-frame / first-and-last-frame video, and
    reference image / video / audio video.


    - Model ID: `oxygen-1.0`

    - Length: top-level `seconds`, integer 4–15; resolution 320p / 480p / 768p

    - Billed at \$0.02 per second regardless of resolution; failed tasks are
    refunded automatically

    - **Only five top-level fields take effect: `model` / `prompt` / `seconds` /
    `size` / `input_reference`**; first/last frames, reference media, 320p, and
    1:1 go into the `input_reference` JSON envelope

    - **Asynchronous endpoint**: submitting returns a task `id`; poll `GET
    /v1/videos/{id}` for the result


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API key**: create a token in the [APIYI
    console](https://api.apiyi.com/token)
  version: 1.0.0
servers:
  - url: https://api.apiyi.com/v1
    description: Primary endpoint
security:
  - bearerAuth: []
paths:
  /videos:
    post:
      tags:
        - Video Generation
      summary: Create an Oxygen video generation task
      description: >
        Submits an asynchronous video generation task. Success only means the
        task was accepted; the response is a video object with `status: queued`.


        Modes:

        - No `input_reference` → text-to-video

        - `input_reference` = image URL or data URI → first-frame video (aspect
        ratio follows the first frame)

        - `input_reference` = JSON string starting with `{` → envelope: first
        and last frame (`images` + `last_image`), reference media
        (`reference_images` / `reference_videos` / `reference_audios`),
        `resolution` (including 320p), `aspect_ratio`


        Rules:

        - **Always pass `size`**; it defaults to `720x1280` (portrait) when
        omitted

        - `last_image`, `reference_images`, `resolution`, and `aspect_ratio` are
        silently dropped at the top level and must go in the envelope

        - `duration` is not allowed in the envelope; first/last frames cannot be
        mixed with reference media

        - Usually done in 1–3 minutes; query with `GET /v1/videos/{id}`
      operationId: createOxygenVideo
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OxygenCreateRequest'
            examples:
              TextToVideo:
                summary: Text-to-video
                value:
                  model: oxygen-1.0
                  prompt: A paper boat drifting on a calm pond, soft morning light
                  seconds: '4'
                  size: 1280x720
              FirstFrame:
                summary: First-frame video
                value:
                  model: oxygen-1.0
                  prompt: The glass sphere rolls slowly across the table
                  seconds: '4'
                  size: 1280x720
                  input_reference: https://your-cdn.example.com/first.png
              FirstAndLastFrame:
                summary: First-and-last-frame video
                value:
                  model: oxygen-1.0
                  prompt: >-
                    The glass sphere slowly dissolves into a deep blue abstract
                    wave
                  seconds: '5'
                  size: 1280x720
                  input_reference: >-
                    {"images":["https://your-cdn.example.com/first.png"],"last_image":"https://your-cdn.example.com/last.png"}
              ReferenceImage:
                summary: Reference image video
                value:
                  model: oxygen-1.0
                  prompt: >-
                    The object from the reference image slowly rotates on a
                    wooden table
                  seconds: '4'
                  size: 720x1280
                  input_reference: >-
                    {"reference_images":["https://your-cdn.example.com/object.png"],"aspect_ratio":"9:16"}
              Select320p:
                summary: Select 320p
                value:
                  model: oxygen-1.0
                  prompt: A paper boat drifting on a calm pond
                  seconds: '4'
                  size: 1280x720
                  input_reference: '{"resolution":"320p"}'
      responses:
        '200':
          description: Task accepted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OxygenVideo'
              example:
                id: task_PSOFP1GQLtN6kGLXv9DpHMkMGBka70Ga
                object: video
                model: oxygen-1.0
                status: queued
                progress: 0
                seconds: '4'
                size: 1280x720
                created_at: 1790853159
        '400':
          description: >-
            Validation failed (seconds outside 4–15, invalid envelope JSON /
            unknown key / duration in the envelope, first/last frames mixed with
            reference media, input_reference not a string, etc.); not charged.
            The detail is a JSON string in the `message` field
        '401':
          description: Unauthorized - invalid API key
        '500':
          description: Reference image download failed, etc.; not charged
        '503':
          description: >-
            No available channel in the token's group (usually a misspelled
            model name or a group that does not include this model)
      security:
        - bearerAuth: []
components:
  schemas:
    OxygenCreateRequest:
      type: object
      required:
        - model
        - prompt
        - seconds
      properties:
        model:
          type: string
          description: Always `oxygen-1.0`
          enum:
            - oxygen-1.0
          default: oxygen-1.0
        prompt:
          type: string
          description: Video description
          example: A paper boat drifting on a calm pond, soft morning light
        seconds:
          type: string
          description: >-
            Output length in seconds, integer 4–15, as a string or number. Used
            for billing; the clip usually runs slightly longer
          enum:
            - '4'
            - '5'
            - '6'
            - '7'
            - '8'
            - '9'
            - '10'
            - '11'
            - '12'
            - '13'
            - '14'
            - '15'
          default: '4'
        size:
          type: string
          description: >
            Sets the resolution and orientation. **Pass it every time**; it
            defaults to `720x1280` (portrait) when omitted.

            `1280x720` = 480p landscape, `720x1280` = 480p portrait, `1792x1024`
            = 768p landscape, `1024x1792` = 768p portrait.

            For 320p or 1:1, use `resolution` / `aspect_ratio` in the
            `input_reference` envelope.
          enum:
            - 1280x720
            - 720x1280
            - 1792x1024
            - 1024x1792
          default: 1280x720
        input_reference:
          type: string
          description: >
            Two forms:

            - **Image URL or data URI** → first-frame video; aspect ratio
            follows the first frame

            - **JSON string starting with `{`** (envelope) → allowed keys:
            `images` (first frame, max 1), `last_image` (last frame),
            `reference_images` (up to 9), `reference_videos` (up to 3, https
            only), `reference_audios` (up to 3, https only), `resolution`
            (`320p` / `480p` / `768p`, wins over size), `aspect_ratio` (`16:9` /
            `9:16` / `1:1`, ignored for image-to-video), `prompt`


            Must be a string, so serialize the envelope first. No `duration` and
            no unknown keys in the envelope; first/last frames cannot be mixed
            with reference media.
          example: https://your-cdn.example.com/first.png
    OxygenVideo:
      type: object
      properties:
        id:
          type: string
          description: Task id, used with `GET /v1/videos/{id}`
        object:
          type: string
          enum:
            - video
        model:
          type: string
        status:
          type: string
          enum:
            - queued
            - in_progress
            - completed
            - failed
        progress:
          type: integer
          description: 0–100
        seconds:
          type: string
        size:
          type: string
        created_at:
          type: integer
        completed_at:
          type: integer
        expires_at:
          type: integer
          description: >-
            When video_url expires (Unix seconds), about 24 hours after
            completion
        video_url:
          type: string
          description: >-
            Output MP4 URL, downloadable without an auth header; store it
            promptly
        usage:
          type: object
          description: >-
            Reference billing info; actual billing is a flat \$0.02 per second,
            see your bill
          properties:
            billing_unit:
              type: string
            billed_seconds:
              type: integer
            resolution:
              type: string
            unit_price_usd:
              type: number
        error:
          type: object
          properties:
            code:
              type: string
              description: For example `upstream_error`, `upstream_timeout`
            message:
              type: string
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API key from the APIYI console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.