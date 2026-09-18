> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 動画編集 API リファレンス

> Wan2.7-videoedit の動画編集 API リファレンスとライブプレイグラウンド: 入力動画 + 参照画像 + 自然言語の指示で、衣装の差し替えや背景の差し替えなどのローカル/グローバル編集を行えます。

<Info>
  右側の Playground では直接デバッグできます: `Bearer sk-your-api-key` を **Authorization** に入れ、`model` / `input.media` / `parameters` を入力して、リクエストを送信します。送信が成功すると `task_id` が返されます。ポーリングとダウンロードについては下記を参照してください。
</Info>

<Tip>
  このページは `wan2.7-videoedit`（動画編集）の作成エンドポイントです。動画 + 1〜5 枚の参照画像 + 自然言語の編集指示を与えて、衣装や背景の差し替えなどの動画要素を編集します。モデル名には**ハイフンがありません**（`videoedit`）。非同期フロー全体については、[Wan 概要](/ja/api-capabilities/wan/overview)を参照してください。
</Tip>

<Warning>
  * `input.media` には、編集対象の `video` と少なくとも 1 つの `reference_image`（参照アセット、≤5）の両方を含める必要があります。
  * モデル名は `wan2.7-videoedit`（**ハイフンなし**）で、HappyHorse の `happyhorse-1.0-video-edit`（ハイフンあり）とは異なるため、混同しないでください。
  * 作成リクエストは `/wan/api/v1/...` に `X-DashScope-Async: enable` を付けて送ります。`/v1/videos` は使用しないでください。
</Warning>

## コード例

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan2.7-videoedit",
      "input": {
        "prompt": "Replace the girl's outfit in the video with the outfit in the image",
        "media": [
          {"type": "video",           "url": "https://your-cdn.com/source.mp4"},
          {"type": "reference_image", "url": "https://your-cdn.com/new-clothes.png"}
        ]
      },
      "parameters": {"resolution": "720P", "prompt_extend": true, "watermark": true}
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
      "model": "wan2.7-videoedit",
      "input": {
          "prompt": "Replace the girl's outfit in the video with the outfit in the image",
          "media": [
              {"type": "video",           "url": "https://your-cdn.com/source.mp4"},
              {"type": "reference_image", "url": "https://your-cdn.com/new-clothes.png"},
          ],
      },
      "parameters": {"resolution": "720P", "prompt_extend": True, "watermark": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (multiple reference images) theme={null}
  import requests

  # Up to 5 reference_image for finer local/global edits
  body = {
      "model": "wan2.7-videoedit",
      "input": {
          "prompt": "Replace the background in the video with the seaside in image 1, and change the character's outfit to image 2",
          "media": [
              {"type": "video",           "url": "https://your-cdn.com/source.mp4"},
              {"type": "reference_image", "url": "https://your-cdn.com/beach.png"},
              {"type": "reference_image", "url": "https://your-cdn.com/outfit.png"},
          ],
      },
      "parameters": {"resolution": "720P", "prompt_extend": True},
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

| パラメータ                      | 種類     | 必須 | デフォルト   | 備考                    |
| -------------------------- | ------ | -- | ------- | --------------------- |
| `model`                    | string | ✓  | —       | 固定の`wan2.7-videoedit` |
| `input.prompt`             | string | ✓  | —       | 自然言語の編集指示             |
| `input.media`              | array  | ✓  | —       | 下のメディア表を参照            |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P`      |
| `parameters.prompt_extend` | bool   |    | `true`  | スマートな書き換え             |
| `parameters.watermark`     | bool   |    | `false` | 「AI generated」透かし     |

### `media[]` の値

| `type`            | 必須 | 件数  | 備考                    |
| ----------------- | -- | --- | --------------------- |
| `video`           | ✓  | 1   | 編集対象の元動画              |
| `reference_image` | ✓  | 1-5 | 参照アセット（新しい服装、新しい背景など） |

<Info>
  動画編集の出力尺は入力動画に従い、`duration`パラメータではなく、そのためこの機能では通常`duration`を渡しません。
</Info>

## 応答形式

```json theme={null}
{
  "output": { "task_id": "3b216861-6a5f-441d-a438-602ab2c0d103", "task_status": "PENDING" },
  "request_id": "..."
}
```

## ステータス確認とダウンロード

`task_id` を入手したら、ステータスをポーリングして mp4 をダウンロードするには、次の 3 ステップに従います:

* **ポーリング** `GET /v1/tasks/{task_id}`（`Authorization` 付き。クエリには `X-DashScope-Async` ヘッダーは**不要**です）を、5〜10 秒ごと（3 秒未満は不可）に実行し、`status` が `completed` になるまで続けます。
* **ステータス値**: `submitted`（queued）/ `in_progress`（generating; `progress` が 30% で止まっていることが多いのは正常です）/ `completed`（success）/ `failed`（`error` を確認）。
* **ダウンロード**: レスポンスから `result_url` を直接 GET します。**`Authorization` ヘッダーなしで**（これは OSS の署名付き直接リンクです — Auth を送ると 403 が返ります）。`result_url` は既定で **24 時間** で期限切れになるため、すぐに保存してください。

<CodeGroup>
  ```bash ステータス確認 theme={null}
  curl "https://api.apiyi.com/v1/tasks/3b216861-6a5f-441d-a438-602ab2c0d103" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json 完了レスポンス theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "3b216861-6a5f-441d-a438-602ab2c0d103"
  }
  ```

  ```bash 動画をダウンロード theme={null}
  # result_url is an OSS signed direct link — do NOT send the Authorization header (it returns 403)
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash 1 コマンド: チェック + ダウンロード theme={null}
  TASK_ID="3b216861-6a5f-441d-a438-602ab2c0d103"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # no Authorization
  ```
</CodeGroup>

<Warning>
  上記は、「すでに task\_id がある」場合のチェック/ダウンロード用のクイックパスです。タイムアウトのフォールバックを含む完全なポーリングループと Python クライアントについては、[Wan の概要 · 非同期呼び出しフロー](/ja/api-capabilities/wan/overview#async-call-flow) を参照してください。
</Warning>


## OpenAPI

````yaml api-reference/wan-video-edit-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 Video Edit API
  description: >
    Alibaba Cloud Tongyi Wanxiang Wan2.7 video edit (`wan2.7-videoedit`, model
    name has no hyphen) — input video + reference images + natural-language
    instruction for local/global edits like outfit swap and background swap.
    DashScope async passthrough endpoint.


    - Creation requests must include the header `X-DashScope-Async: enable`

    - `input.media` must contain 1 `video` + 1-5 `reference_image`

    - The output duration follows the input video; usually `duration` is not
    passed

    - Async task endpoint: returns a `task_id`; poll `GET /v1/tasks/{task_id}`,
    then download from `result_url` (no Authorization header, expires in 24
    hours)

    - **Do not use `/v1/videos`**


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
        Video edit: create an edit task from a video + reference images +
        instruction
      description: >
        Submit a `wan2.7-videoedit` video edit task (async); returns a
        `task_id`.


        - Required: `model`, `input.prompt` (edit instruction), `input.media` (1
        video + 1-5 reference_image), header `X-DashScope-Async: enable`

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`

        - Time depends on the input video length; measured at about 100 seconds
      operationId: createWan27VideoEdit
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
              $ref: '#/components/schemas/WanVideoEditRequest'
            example:
              model: wan2.7-videoedit
              input:
                prompt: >-
                  Replace the girl's outfit in the video with the outfit in the
                  image
                media:
                  - type: video
                    url: https://your-cdn.com/source.mp4
                  - type: reference_image
                    url: https://your-cdn.com/new-clothes.png
              parameters:
                resolution: 720P
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
          description: Invalid parameter or more than 5 reference images
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Blocked by content moderation, or no permission for the group
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: Missing video / reference_image or upstream error
      security:
        - bearerAuth: []
components:
  schemas:
    WanVideoEditRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed wan2.7-videoedit (no hyphen)
          enum:
            - wan2.7-videoedit
          default: wan2.7-videoedit
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: Natural-language edit instruction
              example: >-
                Replace the girl's outfit in the video with the outfit in the
                image
            media:
              type: array
              description: Media asset array; must contain 1 video + 1-5 reference_image
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: >-
                      Media type: video (the source video being edited) /
                      reference_image (reference asset)
                    enum:
                      - video
                      - reference_image
                  url:
                    type: string
                    description: Public https link fetchable directly with GET
                    example: https://your-cdn.com/source.mp4
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
              example: 3b216861-6a5f-441d-a438-602ab2c0d103
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
        prompt_extend:
          type: boolean
          description: Whether to enable smart prompt rewriting
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