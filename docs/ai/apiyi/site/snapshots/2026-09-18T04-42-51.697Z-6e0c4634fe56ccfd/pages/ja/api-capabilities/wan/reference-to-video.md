> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7-r2v 参照ベース動画生成 API リファレンス

> Wan2.7-r2v の参照ベース動画生成 API リファレンスとライブプレイグラウンド: 参照画像/動画から被写体の特徴を維持し、複数被写体のインタラクション、音声参照、分割画面のストーリーボードに対応します。

<Info>
  右側の Playground では、直接デバッグできます。`Bearer sk-your-api-key` を **Authorization** に設定し、`model` / `input.media` / `parameters` を入力して、リクエストを送信してください。送信が成功すると、`task_id` が返ります。ポーリングとダウンロードについては下記をご覧ください。
</Info>

<Tip>
  このページは `wan2.7-r2v`（reference-to-video）の作成エンドポイントです。参照画像/動画を与えると、モデルがそれらの被写体（人物/動物/物体）とシーンの特徴を保持し、単一キャラクターの演技や複数キャラクターのインタラクションを生成します。さらに多くの参照画像（最大 9 枚）が必要な場合は、[HappyHorse r2v](/ja/api-capabilities/happyhorse/reference-to-video) を検討してください。非同期フロー全体については、[Wan Overview](/ja/api-capabilities/wan/overview) をご覧ください。
</Tip>

<Warning>
  * **Reference-asset citation convention**: プロンプト内では、`reference_image` を指すときに "image 1 / image 2" を、`reference_video` を指すときに "video 1 / video 2" を使い、`media` 配列と同じ順序にしてください（画像と動画は別々に数えます）。画像/動画が 1 つだけの場合は、単に "the reference image" / "the reference video" と書けます。
  * **Count limits**: `reference_image` + `reference_video` の合計 ≤5; `first_frame` は最大 1 つです。
  * Creation requests are sent to `/wan/api/v1/...` with `X-DashScope-Async: enable`; `/v1/videos` は使用しないでください。
</Warning>

## コード例

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan2.7-r2v",
      "input": {
        "prompt": "A girl wearing this gown walks slowly through a garden bathed in sunset, the breeze gently lifting her skirt, cinematic lighting",
        "media": [
          {"type": "reference_image", "url": "https://your-cdn.com/dress.png"}
        ]
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": true, "watermark": true}
    }'
  ```

  ```python Python (単一画像参照) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
  }
  body = {
      "model": "wan2.7-r2v",
      "input": {
          "prompt": "The reference image: a girl walking slowly through a garden bathed in sunset, cinematic lighting",
          "media": [{"type": "reference_image", "url": "https://your-cdn.com/girl.png"}],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (複数被写体 + 音声) theme={null}
  import requests

  # Multi-subject: image 1 = girl (with voice), video 1 = boy (with voice), image 2/3 = props/background
  body = {
      "model": "wan2.7-r2v",
      "input": {
          "prompt": "Video 1 holds image 2, walks past image 1, and says: the sunshine is lovely today.",
          "media": [
              {"type": "reference_image", "url": "https://your-cdn.com/girl.jpg",
               "reference_voice": "https://your-cdn.com/girl-voice.mp3"},
              {"type": "reference_video", "url": "https://your-cdn.com/boy.mp4",
               "reference_voice": "https://your-cdn.com/boy-voice.mp3"},
              {"type": "reference_image", "url": "https://your-cdn.com/object.png"},
          ],
      },
      "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 10, "prompt_extend": False, "watermark": True},
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

| パラメータ                      | 型      | 必須 | デフォルト   | 注記                                                             |
| -------------------------- | ------ | -- | ------- | -------------------------------------------------------------- |
| `model`                    | string | ✓  | —       | 固定の`wan2.7-r2v`                                                |
| `input.prompt`             | string | ✓  | —       | ≤5000文字。「image 1/video 1」を使ってアセットを参照します                        |
| `input.media`              | array  | ✓  | —       | 下のメディア表を参照してください                                               |
| `parameters.resolution`    | string |    | `1080P` | `720P` / `1080P`                                               |
| `parameters.ratio`         | string |    | `16:9`  | `16:9` / `9:16` / `1:1` / `4:3` / `3:4`（最初のフレームが渡された場合は無視されます） |
| `parameters.duration`      | int    |    | `5`     | 参照動画がある場合は2-10、ない場合は2-15                                       |
| `parameters.prompt_extend` | bool   |    | `true`  | スマートな書き換え                                                      |
| `parameters.watermark`     | bool   |    | `false` | 「AI生成」ウォーターマーク                                                 |

### `media[]` の値

| `type`            | 件数 / 上限    | 注記                                                                         |
| ----------------- | ---------- | -------------------------------------------------------------------------- |
| `reference_image` | 動画と合わせて ≤5 | 参照画像。被写体（人物/動物/物体）またはシーンを提供します。音声を設定するために`reference_voice`を添付できます          |
| `reference_video` | 画像と合わせて ≤5 | 参照動画。被写体と音声の参照を提供します。空シーンの映像は渡さないでください                                     |
| `first_frame`     | ≤1         | 任意の最初のフレーム。開始フレームを共同で制御します                                                 |
| `reference_voice` | 添付フィールド    | その被写体の音声を設定するために、`reference_image`/`reference_video` に添付します（wav/mp3、1-10秒） |

## レスポンス形式

```json theme={null}
{
  "output": { "task_id": "acda59b4-3b10-4789-a5e5-edadae48adcb", "task_status": "PENDING" },
  "request_id": "..."
}
```

## 状態を確認してダウンロード

`task_id` を取得したら、次の 3 つの手順でステータスをポーリングし、mp4 をダウンロードします:

* **ポーリング** `GET /v1/tasks/{task_id}`（`Authorization` を使用し、クエリには `X-DashScope-Async` ヘッダーは**不要**）、10 秒ごと（3 秒未満は不可）に、`status` が `completed` になるまで実行します。Reference-to-video は通常 1〜5 分かかるため、フォールバックとしてクライアントのタイムアウトを 20 分に設定してください。
* **ステータス値**: `submitted`（queued）/ `in_progress`（generating; `progress` が 30% 付近で止まっているのは正常です）/ `completed`（success）/ `failed`（`error` を確認）。
* **ダウンロード**: レスポンスから `result_url` を直接 GET し、**`Authorization` ヘッダーは付けないでください**（OSS の署名付き直リンクです — Auth を送ると 403 になります）；`result_url` はデフォルトで **24 時間** で期限切れになるため、すぐに保存してください。

<CodeGroup>
  ```bash 状態を確認 theme={null}
  curl "https://api.apiyi.com/v1/tasks/acda59b4-3b10-4789-a5e5-edadae48adcb" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json 完了したレスポンス theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "acda59b4-3b10-4789-a5e5-edadae48adcb"
  }
  ```

  ```bash 動画をダウンロード theme={null}
  # result_url is an OSS signed direct link — do NOT send the Authorization header (it returns 403)
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash 1 コマンド: 確認 + ダウンロード theme={null}
  TASK_ID="acda59b4-3b10-4789-a5e5-edadae48adcb"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # no Authorization
  ```
</CodeGroup>

<Warning>
  上記は「task\_id をすでに持っている」場合の簡易な確認/ダウンロード手順です。タイムアウトのフォールバックを含む完全なポーリングループと Python クライアントについては、[Wan 概要 · 非同期呼び出しフロー](/ja/api-capabilities/wan/overview#async-call-flow) を参照してください。
</Warning>


## OpenAPI

````yaml api-reference/wan-reference-to-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 Reference-to-Video API
  description: >
    Alibaba Cloud Tongyi Wanxiang Wan2.7 reference-to-video (`wan2.7-r2v`) —
    preserve subject features from reference images/videos, with multi-subject
    interaction, voice reference, and split-screen storyboards. DashScope async
    passthrough endpoint.


    - Creation requests must include the header `X-DashScope-Async: enable`

    - In the prompt, use "image 1 / video 1" to refer to reference assets, in
    the same order as the media array

    - `reference_image` + `reference_video` total <=5; `first_frame` <=1

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
        Reference-to-video: create a video task that preserves subject features
        from reference images/videos
      description: >
        Submit a `wan2.7-r2v` reference-to-video task (async); returns a
        `task_id`.


        - Required: `model`, `input.prompt`, `input.media` (at least 1
        reference_image / reference_video), header `X-DashScope-Async: enable`

        - Optional: `reference_voice` (voice reference), `parameters` (including
        ratio)

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`

        - 720P / 5 seconds typically takes 120-140 seconds; multi-subject tasks
        may take 1-5 minutes
      operationId: createWan27ReferenceToVideo
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
              $ref: '#/components/schemas/WanReferenceToVideoRequest'
            example:
              model: wan2.7-r2v
              input:
                prompt: >-
                  A girl wearing this gown walks slowly through a garden bathed
                  in sunset, the breeze gently lifting her skirt, cinematic
                  lighting
                media:
                  - type: reference_image
                    url: https://your-cdn.com/dress.png
              parameters:
                resolution: 720P
                ratio: '16:9'
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
          description: Invalid parameter or more than 5 reference assets
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
    WanReferenceToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: >-
            Model ID; for reference-to-video use wan2.7-r2v (legacy versions
            wan2.6-r2v / wan2.6-r2v-flash)
          enum:
            - wan2.7-r2v
            - wan2.6-r2v
            - wan2.6-r2v-flash
          default: wan2.7-r2v
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: >-
                Text prompt, <=5000 characters; use 'image 1/video 1' to refer
                to reference assets
              example: >-
                The reference image: a girl walking slowly through a garden
                bathed in sunset, cinematic lighting
            negative_prompt:
              type: string
              description: Negative prompt, <=500 characters
            media:
              type: array
              description: >-
                Media asset array; reference_image + reference_video total <=5,
                first_frame <=1
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: >-
                      Media type: reference_image (reference image) /
                      reference_video (reference video) / first_frame (optional
                      first frame)
                    enum:
                      - reference_image
                      - reference_video
                      - first_frame
                  url:
                    type: string
                    description: Public https link fetchable directly with GET
                    example: https://your-cdn.com/dress.png
                  reference_voice:
                    type: string
                    description: >-
                      Optional: voice reference audio URL (wav/mp3, 1-10s) to
                      set this subject's voice
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
              example: acda59b4-3b10-4789-a5e5-edadae48adcb
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
          description: >-
            Resolution tier (uppercase); wan2.7-r2v supports 720P / 1080P,
            default 1080P
          enum:
            - 720P
            - 1080P
          default: 1080P
        ratio:
          type: string
          description: Aspect ratio; ignored automatically when a first_frame is supplied
          enum:
            - '16:9'
            - '9:16'
            - '1:1'
            - '4:3'
            - '3:4'
          default: '16:9'
        duration:
          type: integer
          description: >-
            Video duration (seconds), integer; range 2-10 with a reference
            video, 2-15 without
          minimum: 2
          maximum: 15
          default: 5
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