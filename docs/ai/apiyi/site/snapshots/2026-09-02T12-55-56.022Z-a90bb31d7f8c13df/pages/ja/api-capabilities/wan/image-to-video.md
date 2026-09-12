> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 画像から動画 API リファレンス

> Wan2.7-i2v 画像から動画の API リファレンスとライブプレイグラウンド: 1枚目のフレームから動画を生成し、lip-sync / rap 向けの driving_audio をサポートします。

<Info>
  右側のプレイグラウンドでは直接デバッグできます。**Authorization** に `Bearer sk-your-api-key` を入れ、`model` / `input.media` / `parameters` を入力して、リクエストを送信してください。正常に送信されると `task_id` が返ります。ポーリングとダウンロードについては以下をご覧ください。
</Info>

<Tip>
  このページは `wan2.7-i2v`（画像から動画への変換）の作成エンドポイントです。最初のフレーム + prompt を指定して画像に命を吹き込み、必要に応じて `driving_audio` を渡すと、ポートレートが音声の口の動きとリズムに追従します。完全な非同期フローについては、[Wan の概要](/ja/api-capabilities/wan/overview) をご覧ください。
</Tip>

<Warning>
  * **オーディオドライブは `wan2.7-i2v` 専用です**: [HappyHorse i2v](/ja/api-capabilities/happyhorse/image-to-video) は `driving_audio` をサポートしていないため、リップシンク / ラップには `wan2.7-i2v` を使う必要があります。
  * `input.media` が必須です。そうでない場合、上流は `image-to-video model ... must provide an image` を返します。各メディア `url` は、GET で直接取得できる公開 https リンクでなければなりません。
  * 作成リクエストは `/wan/api/v1/...` に `X-DashScope-Async: enable` で送信します。`/v1/videos` は使用しないでください。
</Warning>

## コード例

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan2.7-i2v",
      "input": {
        "prompt": "A spray-painted boy comes to life off the wall and performs an English rap, at night under a railway bridge, cinematic lighting",
        "media": [
          {"type": "first_frame",   "url": "https://your-cdn.com/rap.png"},
          {"type": "driving_audio", "url": "https://your-cdn.com/rap.mp3"}
        ]
      },
      "parameters": {"resolution": "720P", "duration": 10, "prompt_extend": true, "watermark": true}
    }'
  ```

  ```python Python (requests) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
  }
  body = {
      "model": "wan2.7-i2v",
      "input": {
          "prompt": "A spray-painted boy comes to life off the wall and performs an English rap, at night under a railway bridge",
          "media": [
              {"type": "first_frame",   "url": "https://your-cdn.com/rap.png"},
              {"type": "driving_audio", "url": "https://your-cdn.com/rap.mp3"},  # optional, for lip-sync
          ],
      },
      "parameters": {"resolution": "720P", "duration": 10, "prompt_extend": True, "watermark": True},
  }

  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (no audio) theme={null}
  import requests

  # Without lip-sync, pass only first_frame
  body = {
      "model": "wan2.7-i2v",
      "input": {
          "prompt": "A cat running across a meadow, bright sunshine, the camera following",
          "media": [{"type": "first_frame", "url": "https://your-cdn.com/cat.png"}],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
  }
  resp = requests.post(
      "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis",
      json=body,
      headers={"Authorization": "Bearer sk-your-api-key", "Content-Type": "application/json",
               "X-DashScope-Async": "enable"},
      timeout=30,
  )
  print(resp.json()["output"]["task_id"])
  ```
</CodeGroup>

## パラメータとメディアのクイックリファレンス

| パラメータ                      | 型      | 必須 | デフォルト   | 備考               |
| -------------------------- | ------ | -- | ------- | ---------------- |
| `model`                    | string | ✓  | —       | 固定の `wan2.7-i2v` |
| `input.prompt`             | string | ✓  | —       | テキストプロンプト        |
| `input.media`              | array  | ✓  | —       | 下のメディア表を参照してください |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P` |
| `parameters.duration`      | int    |    | `5`     | 2〜15秒の整数         |
| `parameters.prompt_extend` | bool   |    | `true`  | スマートな書き換え。オン推奨   |
| `parameters.watermark`     | bool   |    | `false` | 「AI生成」ウォーターマーク   |

### `media[]` の値

| `type`          | 必須 | 数 | 備考                                          |
| --------------- | -- | - | ------------------------------------------- |
| `first_frame`   | ✓  | 1 | 最初のフレーム。動画はこの画像から始まります                      |
| `driving_audio` |    | 1 | 駆動音声（wav/mp3）。ポートレートが音声の口の動きとリズムに追従するようにします |

## レスポンス形式

```json theme={null}
{
  "output": { "task_id": "f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4", "task_status": "PENDING" },
  "request_id": "..."
}
```

## ステータス確認とダウンロード

`task_id` を取得したら、mp4 をポーリングしてダウンロードするには、次の 3 つの手順に従ってください。

* **ポーリング** `GET /v1/tasks/{task_id}`（`Authorization` を使用し、クエリには `X-DashScope-Async` ヘッダーは**不要**です）を 5〜10 秒ごとに（3 秒未満は不可）実行し、`status` が `completed` になるまで待ちます。
* **ステータス値**: `submitted`（キュー中）/ `in_progress`（生成中; `progress` が 30% で止まっていることが多いのは正常です）/ `completed`（成功）/ `failed`（`error` を確認）。
* **ダウンロード**: レスポンスから `result_url` を直接 GET し、`Authorization` ヘッダーは**付けない**でください（これは OSS の署名付きダイレクトリンクです。Auth を送ると 403 が返ります）。`result_url` の有効期限はデフォルトで **24 時間** なので、すぐに保存してください。

<CodeGroup>
  ```bash ステータス確認 theme={null}
  curl "https://api.apiyi.com/v1/tasks/f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json 完了レスポンス theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4"
  }
  ```

  ```bash 動画をダウンロード theme={null}
  # result_url is an OSS signed direct link — do NOT send the Authorization header (it returns 403)
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash 1 コマンド: 確認 + ダウンロード theme={null}
  TASK_ID="f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # no Authorization
  ```
</CodeGroup>

<Warning>
  上記は「すでに task\_id を持っている」場合の簡易な確認/ダウンロード手順です。タイムアウト時のフォールバックを含む完全なポーリングループと Python クライアントについては、[Wan の概要 · 非同期呼び出しフロー](/ja/api-capabilities/wan/overview#async-call-flow) を参照してください。
</Warning>


## OpenAPI

````yaml api-reference/wan-image-to-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 Image-to-Video API
  description: >
    Alibaba Cloud Tongyi Wanxiang Wan2.7 image-to-video (`wan2.7-i2v`) —
    generate video from a first frame, with `driving_audio` support for lip-sync
    / rap. DashScope async passthrough endpoint.


    - Creation requests must include the header `X-DashScope-Async: enable`

    - **Audio drive is exclusive to wan2.7-i2v**; HappyHorse i2v does not
    support it

    - Async task endpoint: returns a `task_id`; poll `GET /v1/tasks/{task_id}`,
    then download from `result_url` (no Authorization header, expires in 24
    hours)

    - **Do not use `/v1/videos`** (media fields are dropped)


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    header


    **Get an API Key**: visit the APIYI console `api.apiyi.com/token` to create
    a Token
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /wan/api/v1/services/aigc/video-generation/video-synthesis:
    post:
      tags:
        - Video Generation
      summary: >-
        Image-to-video: create a video generation task from a first frame (+
        optional driving audio)
      description: >
        Submit a `wan2.7-i2v` image-to-video task (async); returns a `task_id`.


        - Required: `model`, `input.prompt`, `input.media` (at least 1
        `first_frame`), header `X-DashScope-Async: enable`

        - Optional: `driving_audio` (makes the portrait follow the audio's mouth
        movements and rhythm), `parameters`

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`

        - 720P / following audio typically takes 70-90 seconds
      operationId: createWan27ImageToVideo
      parameters:
        - name: X-DashScope-Async
          in: header
          required: true
          description: Async processing switch; must be set to enable
          schema:
            type: string
            enum:
              - enable
            default: enable
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/WanImageToVideoRequest'
            example:
              model: wan2.7-i2v
              input:
                prompt: >-
                  A spray-painted boy comes to life off the wall and performs an
                  English rap, at night under a railway bridge, cinematic
                  lighting
                media:
                  - type: first_frame
                    url: https://your-cdn.com/rap.png
                  - type: driving_audio
                    url: https://your-cdn.com/rap.mp3
              parameters:
                resolution: 720P
                duration: 10
                prompt_extend: true
                watermark: true
      responses:
        '200':
          description: Task submitted; returns task_id and PENDING status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WanVideoTask'
        '400':
          description: >-
            Invalid parameter (wrong duration type, wrong resolution value,
            etc.)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Blocked by content moderation, or no permission for the group
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: Missing media or upstream error; check the body and retry
      security:
        - bearerAuth: []
components:
  schemas:
    WanImageToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: >-
            Model ID; for image-to-video, fixed wan2.7-i2v (legacy version
            wan2.6-i2v)
          enum:
            - wan2.7-i2v
            - wan2.6-i2v
          default: wan2.7-i2v
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: Text prompt
              example: >-
                A spray-painted boy comes to life off the wall and performs an
                English rap
            negative_prompt:
              type: string
              description: Negative prompt, <=500 characters
            media:
              type: array
              description: >-
                Media asset array; must contain 1 first_frame and may contain 1
                optional driving_audio
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: >-
                      Media type: first_frame (first frame image, <=1) /
                      driving_audio (driving audio for lip-sync)
                    enum:
                      - first_frame
                      - driving_audio
                  url:
                    type: string
                    description: >-
                      Public https link fetchable directly with GET (image
                      JPEG/PNG/WEBP; audio wav/mp3)
                    example: https://your-cdn.com/rap.png
        parameters:
          $ref: '#/components/schemas/WanParameters'
    WanVideoTask:
      type: object
      properties:
        output:
          type: object
          properties:
            task_id:
              type: string
              description: >-
                Task ID, used to poll GET /v1/tasks/{task_id}, valid for 24
                hours
              example: f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4
            task_status:
              type: string
              enum:
                - PENDING
                - RUNNING
                - SUCCEEDED
                - FAILED
              example: PENDING
        request_id:
          type: string
          description: Unique request identifier
          example: ...
    WanParameters:
      type: object
      properties:
        resolution:
          type: string
          description: Resolution tier (uppercase)
          enum:
            - 720P
            - 1080P
          default: 720P
        duration:
          type: integer
          description: Video duration (seconds), integer, range 2-15
          minimum: 2
          maximum: 15
          default: 5
        prompt_extend:
          type: boolean
          description: Whether to enable smart prompt rewriting, strongly recommend true
          default: true
        watermark:
          type: boolean
          description: Whether to add an AI generated watermark in the bottom-right corner
          default: false
        seed:
          type: integer
          description: Random seed, 0-2147483647
          minimum: 0
          maximum: 2147483647
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: The API Key obtained from the APIYI console

````