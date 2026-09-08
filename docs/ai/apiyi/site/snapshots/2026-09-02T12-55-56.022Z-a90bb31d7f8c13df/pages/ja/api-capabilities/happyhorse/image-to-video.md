> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 画像から動画への API リファレンス

> HappyHorse-1.1-i2v 画像から動画への API リファレンスとオンラインデバッグ: 1枚目のフレーム画像から動画を生成します（音声駆動には対応していません）。DashScope の非同期パススルー エンドポイントです。

<Info>
  右側の Playground で直接デバッグできます。**Authorization** に `Bearer sk-your-api-key` を入力し、`model` / `input.media` / `parameters` を設定してから、リクエストを送信してください。送信が成功すると `task_id` が返却されます。ポーリングとダウンロードについては下記を参照してください。
</Info>

<Tip>
  このページでは、`happyhorse-1.1-i2v` の作成エンドポイント（Image-to-Video）を扱います。最初のフレーム画像 + prompt を与えて、シーンに命を吹き込んでください。完全な非同期フローについては、[HappyHorse Overview](/ja/api-capabilities/happyhorse/overview) を参照してください。
</Tip>

<Warning>
  * **HappyHorse の i2v は `driving_audio`**（音声駆動）をサポートしていません。受け付けるのは `first_frame` のみです。リップシンク / ラップには、[Wan2.7-i2v](/ja/api-capabilities/wan/image-to-video) を使用してください。
  * `input.media` は必須です。そうでない場合、上流側は `Image-to-video model ... must provide an image` を返します。メディア `url` は、GET で直接取得できる公開 https リンクである必要があります。
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
      "model": "happyhorse-1.1-i2v",
      "input": {
        "prompt": "A cat running across a meadow, bright sunshine, camera following",
        "media": [
          {"type": "first_frame", "url": "https://your-cdn.com/cat.png"}
        ]
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": true, "watermark": true}
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
      "model": "happyhorse-1.1-i2v",
      "input": {
          "prompt": "A cat running across a meadow, bright sunshine, camera following",
          "media": [{"type": "first_frame", "url": "https://your-cdn.com/cat.png"}],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True, "watermark": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```
</CodeGroup>

## パラメータとメディアのクイックリファレンス

| Parameter                  | Type   | Required | Default | 備考                       |
| -------------------------- | ------ | -------- | ------- | ------------------------ |
| `model`                    | string | ✓        | —       | `happyhorse-1.1-i2v` に固定 |
| `input.prompt`             | string | ✓        | —       | テキスト prompt              |
| `input.media`              | array  | ✓        | —       | 下のメディア表を参照してください         |
| `parameters.resolution`    | string |          | `720P`  | `720P` / `1080P`         |
| `parameters.duration`      | int    |          | `5`     | 2〜15秒の整数                 |
| `parameters.prompt_extend` | bool   |          | `true`  | スマートな書き換え。オン推奨           |
| `parameters.watermark`     | bool   |          | `false` | 「AI Generated」ウォーターマーク   |

### `media[]` の値

| `type`        | Required | Count | 備考                                                     |
| ------------- | -------- | ----- | ------------------------------------------------------ |
| `first_frame` | ✓        | 1     | 1枚目のフレーム画像。動画はこの画像から始まります（HappyHorse i2v はこれのみ対応しています） |

## Response Format

```json theme={null}
{
  "output": { "task_id": "...", "task_status": "PENDING" },
  "request_id": "..."
}
```

<Warning>
  After submission, **poll `GET /v1/tasks/{task_id}`** until `completed`, then download the mp4 from `result_url` (**without the `Authorization` header**, expires in 24 hours). See the full polling loop in [HappyHorse Overview · Async Call Flow](/ja/api-capabilities/happyhorse/overview#async-call-flow).
</Warning>


## OpenAPI

````yaml api-reference/happyhorse-image-to-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: HappyHorse Image-to-Video API
  description: >
    Alibaba Cloud HappyHorse-1.0 Image-to-Video (`happyhorse-1.1-i2v`) —
    generate video from a first-frame image. DashScope async passthrough
    endpoint.


    - The create request must include the request header `X-DashScope-Async:
    enable`

    - **HappyHorse's i2v does not support driving_audio (audio-driven)**; it
    only accepts first_frame. For lip-sync, use wan2.7-i2v

    - Async task-style endpoint: returns a `task_id`, poll `GET
    /v1/tasks/{task_id}`, then download from `result_url` (without the
    Authorization header, expires in 24 hours)

    - **Do not use `/v1/videos`**


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    header


    **Get an API Key**: visit the APIYI Console `api.apiyi.com/token` to create
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
      summary: 'Image-to-Video: create a video generation task from a first-frame image'
      description: >
        Submit a `happyhorse-1.1-i2v` Image-to-Video task (async), returning a
        `task_id`.


        - Required: `model`, `input.prompt`, `input.media` (1 first_frame),
        request header `X-DashScope-Async: enable`

        - **Does not support** driving_audio

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`
      operationId: createHappyHorseImageToVideo
      parameters:
        - name: X-DashScope-Async
          in: header
          required: true
          description: Async processing switch, must be set to enable
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
              $ref: '#/components/schemas/HappyHorseImageToVideoRequest'
            example:
              model: happyhorse-1.1-i2v
              input:
                prompt: >-
                  A cat running across a meadow, bright sunshine, camera
                  following
                media:
                  - type: first_frame
                    url: https://your-cdn.com/cat.png
              parameters:
                resolution: 720P
                duration: 5
                prompt_extend: true
                watermark: true
      responses:
        '200':
          description: Task submitted, returns task_id and PENDING status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HappyHorseVideoTask'
        '400':
          description: >-
            Invalid parameter (wrong duration type, invalid resolution value,
            etc.)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Blocked by content moderation or group has no permission
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: >-
            Missing media or upstream error, recommended to check the body and
            retry
      security:
        - bearerAuth: []
components:
  schemas:
    HappyHorseImageToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to happyhorse-1.1-i2v for Image-to-Video
          enum:
            - happyhorse-1.1-i2v
          default: happyhorse-1.1-i2v
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: Text prompt
              example: A cat running across a meadow, bright sunshine, camera following
            media:
              type: array
              description: >-
                Media asset array; must contain 1 first_frame (HappyHorse i2v
                does not support driving_audio)
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: 'Media type: first_frame (first-frame image, <=1)'
                    enum:
                      - first_frame
                  url:
                    type: string
                    description: >-
                      A public https image link fetchable directly via GET
                      (JPEG/PNG/WEBP)
                    example: https://your-cdn.com/cat.png
        parameters:
          $ref: '#/components/schemas/HappyHorseParameters'
    HappyHorseVideoTask:
      type: object
      properties:
        output:
          type: object
          properties:
            task_id:
              type: string
              description: >-
                Task ID, used for polling GET /v1/tasks/{task_id}, valid for 24
                hours
              example: hh-...
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
    HappyHorseParameters:
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
          description: Video duration (seconds), integer, value 2-15
          minimum: 2
          maximum: 15
          default: 5
        prompt_extend:
          type: boolean
          description: Whether to enable smart prompt rewriting, strongly recommended true
          default: true
        watermark:
          type: boolean
          description: Whether to add the AI Generated watermark in the bottom-right corner
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
      description: The API Key obtained from the APIYI Console

````