> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 テキストから動画への API リファレンス

> Wan2.7-t2v テキストから動画 API リファレンスとライブプレイグラウンド: 純粋な prompt から DashScope の非同期パススルー endpoint を通じて 2-15 秒の動画を生成します。

<Info>
  右側のプレイグラウンドでは直接デバッグできます。`Bearer sk-your-api-key` を **Authorization** に入れ、`model` / `input` / `parameters` を入力して、リクエストを送信してください。送信に成功すると `task_id` が返されます。ポーリングとダウンロードについては下記を参照してください。
</Info>

<Tip>
  このページは `wan2.7-t2v`（テキストから動画生成）の作成エンドポイントです。必要なのはテキスト prompt だけで、メディアは不要です。画像を動かしたり被写体の特徴を保持したりしたい場合は、代わりに [画像から動画へ](/ja/api-capabilities/wan/image-to-video) / [参照画像から動画へ](/ja/api-capabilities/wan/reference-to-video) を使用してください。非同期フローの全体、ステータステーブル、Python クライアントについては、[Wan の概要](/ja/api-capabilities/wan/overview) を参照してください。
</Tip>

<Warning>
  * 作成リクエストは `/wan/api/v1/services/aigc/video-generation/video-synthesis` に、ヘッダー `X-DashScope-Async: enable` を付けて送信してください。**`/v1/videos` は使用しないでください。**
  * `duration` は **整数** である必要があります（`5`、`"5"` ではありません）。`resolution` は **大文字**（`720P`）で記述してください。
</Warning>

## コード例

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan2.7-t2v",
      "input": {
        "prompt": "A lighthouse on the seashore at dusk, the camera slowly pushing in, waves gently lapping the rocks, seabirds calling, cinematic lighting, steady camera work"
      },
      "parameters": {
        "resolution": "720P",
        "duration": 5,
        "prompt_extend": true,
        "watermark": true
      }
    }'
  ```

  ```python Python（requests） theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",   # required when creating a task
  }
  body = {
      "model": "wan2.7-t2v",
      "input": {"prompt": "A lighthouse on the seashore at dusk, the camera slowly pushing in, waves gently lapping the rocks, seabirds calling"},
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True, "watermark": True},
  }

  resp = requests.post(url, json=body, headers=headers, timeout=30)
  task_id = resp.json()["output"]["task_id"]
  print("task_id:", task_id)   # then poll /v1/tasks/{task_id}
  ```

  ```python Python（依存関係なし） theme={null}
  import json, urllib.request

  BASE, KEY = "https://api.apiyi.com", "sk-your-api-key"
  body = {
      "model": "wan2.7-t2v",
      "input": {"prompt": "A lighthouse on the seashore at dusk, the camera slowly pushing in, waves gently lapping the rocks"},
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
  }
  req = urllib.request.Request(
      BASE + "/wan/api/v1/services/aigc/video-generation/video-synthesis",
      data=json.dumps(body).encode(),
      headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
               "X-DashScope-Async": "enable"},
      method="POST",
  )
  print(json.loads(urllib.request.urlopen(req).read())["output"]["task_id"])
  ```
</CodeGroup>

## パラメータのクイックリファレンス

| パラメータ                      | 型      | 必須 | デフォルト   | 備考                                       |
| -------------------------- | ------ | -- | ------- | ---------------------------------------- |
| `model`                    | string | ✓  | —       | 固定の`wan2.7-t2v`                          |
| `input.prompt`             | string | ✓  | —       | テキスト prompt。シーン、カメラの動き、ライティング、スタイルを記述します |
| `input.negative_prompt`    | string |    | —       | ネガティブ prompt、≤500文字                      |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P`（大文字）                    |
| `parameters.ratio`         | string |    | `16:9`  | `16:9` / `9:16` / `1:1` / `4:3` / `3:4`  |
| `parameters.duration`      | int    |    | `5`     | 2-15秒の整数                                 |
| `parameters.prompt_extend` | bool   |    | `true`  | スマートな書き換え。オンを推奨します                       |
| `parameters.watermark`     | bool   |    | `false` | 右下隅に「AI generated」の透かしを表示します             |
| `parameters.seed`          | int    |    | ランダム    | 0-2147483647、再現性のために固定します                |

## レスポンス形式

作成が成功すると、`task_id` が返されます（**動画そのものではありません**）:

```json theme={null}
{
  "output": { "task_id": "c2e7570c-0af2-4eba-919f-3af3d1164a38", "task_status": "PENDING" },
  "request_id": "a23b81b0-0c05-9972-a6c9-ee757400afdb"
}
```

## ステータス確認とダウンロード

`task_id` を取得したら、mp4 をダウンロードするために、次の 3 つの手順でステータスをポーリングしてください。

* **ポーリング** `GET /v1/tasks/{task_id}`（`Authorization` 付きで; クエリには `X-DashScope-Async` ヘッダーは不要です）を、5-10 秒ごと（3 秒未満は不可）に、`status` が `completed` になるまで実行します。
* **ステータス値**: `submitted`（queued）/ `in_progress`（generating; `progress` が 30% 付近で止まっているのは正常です）/ `completed`（success）/ `failed`（`error` を確認）。
* **ダウンロード**: 応答から `result_url` を直接 GET し、**`Authorization` ヘッダーなしで**（OSS 署名付きの直接リンクです — Auth を送ると 403 が返ります）；`result_url` は既定で **24 時間** で失効するため、すぐに保存してください。

<CodeGroup>
  ```bash ステータスを確認 theme={null}
  curl "https://api.apiyi.com/v1/tasks/c2e7570c-0af2-4eba-919f-3af3d1164a38" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json 完了レスポンス theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "c2e7570c-0af2-4eba-919f-3af3d1164a38"
  }
  ```

  ```bash 動画をダウンロード theme={null}
  # result_url is an OSS signed direct link — do NOT send the Authorization header (it returns 403)
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash 1つのコマンド: 確認 + ダウンロード theme={null}
  TASK_ID="c2e7570c-0af2-4eba-919f-3af3d1164a38"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # no Authorization
  ```
</CodeGroup>

<Warning>
  上記は、「task\_id をすでに持っている」場合の簡易な確認/ダウンロード手順です。タイムアウトのフォールバックを含む完全なポーリングループと Python クライアントについては、[Wan 概要 · 非同期呼び出しフロー](/ja/api-capabilities/wan/overview#async-call-flow) を参照してください。
</Warning>


## OpenAPI

````yaml api-reference/wan-text-to-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 Text-to-Video API
  description: >
    Alibaba Cloud Tongyi Wanxiang Wan2.7 text-to-video (`wan2.7-t2v`) — generate
    video from a pure text prompt via the DashScope async passthrough endpoint.


    - Creation requests must include the header `X-DashScope-Async: enable`

    - Async task endpoint: this endpoint only submits the task and returns a
    `task_id`; poll `GET /v1/tasks/{task_id}`, then download the mp4 from the
    response's `result_url`

    - `result_url` is an Alibaba Cloud OSS signed direct link; **do not send the
    Authorization header** when downloading, and it is valid for 24 hours

    - **Do not use `/v1/videos`** to submit Wan video tasks (media fields are
    dropped)


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
      summary: 'Text-to-video: create a video generation task from a text prompt'
      description: >
        Submit a `wan2.7-t2v` text-to-video task (async); returns a `task_id`
        and `task_status: "PENDING"`.


        - Required: `model`, `input.prompt`, header `X-DashScope-Async: enable`

        - Optional: `parameters` (resolution / ratio / duration / prompt_extend
        / watermark / seed)

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `status: "completed"`, then download from
        `result_url`

        - 720P / 5 seconds typically takes 100-120 seconds
      operationId: createWan27TextToVideo
      parameters:
        - name: X-DashScope-Async
          in: header
          required: true
          description: >-
            Async processing switch; must be set to enable, otherwise it returns
            current user api does not support synchronous calls
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
              $ref: '#/components/schemas/WanTextToVideoRequest'
            example:
              model: wan2.7-t2v
              input:
                prompt: >-
                  A lighthouse on the seashore at dusk, the camera slowly
                  pushing in, waves gently lapping the rocks, seabirds calling,
                  cinematic lighting, steady camera work
              parameters:
                resolution: 720P
                duration: 5
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
            Invalid parameter (duration passed as a string, wrong resolution
            value, missing prompt, etc.)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Blocked by content moderation, or no permission for the group
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: Upstream gateway error; retry 1-2 times
      security:
        - bearerAuth: []
components:
  schemas:
    WanTextToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: >-
            Model ID; for text-to-video, fixed wan2.7-t2v (legacy version
            wan2.6-t2v)
          enum:
            - wan2.7-t2v
            - wan2.6-t2v
          default: wan2.7-t2v
        input:
          type: object
          required:
            - prompt
          properties:
            prompt:
              type: string
              description: Text prompt; describe scene, camera motion, lighting, and style
              example: >-
                A lighthouse on the seashore at dusk, the camera slowly pushing
                in, waves gently lapping the rocks, seabirds calling
            negative_prompt:
              type: string
              description: >-
                Negative prompt, content you do not want to appear, <=500
                characters
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
              example: c2e7570c-0af2-4eba-919f-3af3d1164a38
            task_status:
              type: string
              description: Initial task status
              enum:
                - PENDING
                - RUNNING
                - SUCCEEDED
                - FAILED
              example: PENDING
        request_id:
          type: string
          description: >-
            Unique request identifier; provide it to support when
            troubleshooting
          example: a23b81b0-0c05-9972-a6c9-ee757400afdb
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
        ratio:
          type: string
          description: Aspect ratio; ignored automatically when a first frame is supplied
          enum:
            - '16:9'
            - '9:16'
            - '1:1'
            - '4:3'
            - '3:4'
          default: '16:9'
        duration:
          type: integer
          description: Video duration (seconds), integer, range 2-15
          minimum: 2
          maximum: 15
          default: 5
        prompt_extend:
          type: boolean
          description: >-
            Whether to enable smart prompt rewriting; clearly improves short
            prompts, strongly recommend true
          default: true
        watermark:
          type: boolean
          description: Whether to add an AI generated watermark in the bottom-right corner
          default: false
        seed:
          type: integer
          description: Random seed, 0-2147483647; fixing it improves reproducibility
          minimum: 0
          maximum: 2147483647
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: The API Key obtained from the APIYI console

````