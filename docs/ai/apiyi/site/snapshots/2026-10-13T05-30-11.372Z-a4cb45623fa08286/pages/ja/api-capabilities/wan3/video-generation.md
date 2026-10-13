> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan3.0 動画生成 APIリファレンス

> Wan3.0動画生成APIリファレンスとライブPlayground：1つのモデルIDでテキストから動画、画像から動画、リファレンスから動画、動画編集をカバー。最大30秒、480P〜1080Pに対応したDashScope非同期パススルーエンドポイントです。

<Info>
  右側の Playground を使用して直接テストできます。**Authorization** に `Bearer sk-your-api-key` を設定し、`model` / `input` / `parameters` を入力して送信します。送信に成功すると `task_id` が返されます。ポーリングとダウンロードについては以下で説明します。
</Info>

<Tip>
  Wan3.0 は**1つのモデル ID ですべてのモードに対応**しており、メディアとして何を送信するかによって動作が決まります。完全な非同期ワークフロー、ステータステーブル、課金ルール、Python クライアントについては、[Wan3.0 概要](/ja/api-capabilities/wan3/overview)をご覧ください。
</Tip>

<Warning>
  * 作成リクエストは `/wan/api/v1/services/aigc/video-generation/video-synthesis` に `X-DashScope-Async: enable` ヘッダーを付けて送信する必要があります。**`/v1/videos` は使用しないでください**（メディアフィールドが破棄され、課金が不正確になります）。
  * `duration` は**整数**（`5` であり、`"5"` ではありません）でなければなりません。`resolution` は**大文字**（`720P`）で記述してください。
  * 終了状態は `completed` / `failed` であり、`SUCCEEDED` ではありません。
</Warning>

## 4つのモード、1つのフィールド

| モード | `media` に指定する内容 |
| - | - |
| テキストから動画生成 | `media` を省略 |
| 画像から動画生成 | `[{ "type": "first_frame", "url": "..." }]` |
| 先頭/最終フレームからの動画生成 | `first_frame` + `last_frame` |
| リファレンスからの動画生成 | `reference_image` / `reference_video` / `reference_audio`（混在可能） |

<Warning>
  `first_frame` / `last_frame` は `reference_*` / `file` / `link` と混在**できません**。
</Warning>

## コードサンプル

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan3.0-video",
      "input": {
        "prompt": "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks, cinematic lighting"
      },
      "parameters": {
        "resolution": "720P",
        "ratio": "16:9",
        "duration": 5,
        "prompt_extend": true
      }
    }'
  ```

  ```python Python (requests) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",   # required when creating a task
  }
  body = {
      "model": "wan3.0-video",
      "input": {"prompt": "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks"},
      "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 5, "prompt_extend": True},
  }

  resp = requests.post(url, json=body, headers=headers, timeout=30)
  task_id = resp.json()["output"]["task_id"]
  print("task_id:", task_id)
  ```

  ```javascript Node.js theme={null}
  const res = await fetch(
    "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer sk-your-api-key",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model: "wan3.0-video",
        input: { prompt: "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks" },
        parameters: { resolution: "720P", ratio: "16:9", duration: 5, prompt_extend: true },
      }),
    }
  );
  const data = await res.json();
  console.log("task_id:", data.output.task_id);
  ```
</CodeGroup>

### 画像から動画（最初のフレーム）

```json theme={null}
{
  "model": "wan3.0-video",
  "input": {
    "prompt": "The cat turns toward the camera and blinks",
    "media": [{ "type": "first_frame", "url": "https://example.com/cat.jpg" }]
  },
  "parameters": { "resolution": "720P", "duration": 5 }
}
```

### 参照から動画（参照画像 + 参照動画）

```json theme={null}
{
  "model": "wan3.0-video-prime",
  "input": {
    "prompt": "Replace the person in video 1 with the person in image 1, keep everything else",
    "media": [
      { "type": "reference_image", "url": "https://example.com/person.jpg" },
      { "type": "reference_video", "url": "https://example.com/source.mp4" }
    ]
  },
  "parameters": { "resolution": "720P", "ratio": "9:16", "duration": 5 }
}
```

<Warning>
  **参照動画の再生時間も課金対象となります。** 上記の例では、10秒の参照と5秒の出力で**15秒分**が課金されます。入力 + 出力の合計は最大30秒に制限されています。詳細は[課金ルール](/ja/api-capabilities/wan3/overview#%EF%B8%8F-billing-rules-different-from-other-video-models)をご確認ください。
</Warning>

## ポーリングとダウンロード

```bash theme={null}
# Poll every 5-10 seconds (never below 3)
curl "https://api.apiyi.com/v1/tasks/$TASK_ID" \
  -H "Authorization: Bearer sk-your-api-key"

# Download: result_url is a signed OSS link - do not send Authorization
curl -o out.mp4 "$RESULT_URL"
```

| ステータス | 意味 | 次のステップ |
| - | - | - |
| `submitted` | キュー待機中 | ポーリングを継続 |
| `in_progress` | 生成中 | ポーリングを継続 |
| `completed` | 完了 | `result_url` からダウンロード |
| `failed` | 失敗 | `error.message` を確認。**課金されません** |

## 料金一覧

デフォルトのレートは\*\*Alibaba公式価格の98%\*\*です。最大の[チャージボーナス](/ja/faq/recharge-promotions)を適用すると、\*\*約81.7%\*\*まで下がります。

| モデル | 解像度 | デフォルト | 10%ボーナス適用時 | **20%ボーナス適用時** | 20%ボーナス時のCNY価格 |
| - | - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.0294/秒 | \$0.0267/秒 | **\$0.0245/秒** | ¥0.1715/秒 |
| `wan3.0-video` | 720P | \$0.0588/秒 | \$0.0535/秒 | **\$0.049/秒** | ¥0.343/秒 |
| `wan3.0-video` | 1080P | \$0.1176/秒 | \$0.1069/秒 | **\$0.098/秒** | ¥0.686/秒 |
| `wan3.0-video-prime` | 480P | \$0.063/秒 | \$0.0573/秒 | **\$0.0525/秒** | ¥0.3675/秒 |
| `wan3.0-video-prime` | 720P | \$0.126/秒 | \$0.1145/秒 | **\$0.105/秒** | ¥0.735/秒 |
| `wan3.0-video-prime` | 1080P | \$0.252/秒 | \$0.2291/秒 | **\$0.21/秒** | ¥1.47/秒 |

<Note>価格はプロバイダーの公式レートに準拠しており、それに伴い変動する場合があります。上記の表は参考用であり、上部ナビゲーションの**モデル価格**タブが正式な情報となります: [モデル価格](/en/models/index)。</Note>

<Card title="全パラメータ、課金ルール、ベストプラクティス" icon="book-open" href="/ja/api-capabilities/wan3/overview">
  Wan3.0の概要
</Card>


## OpenAPI

````yaml api-reference/wan3-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan3.0 Video Generation API
  description: >
    Alibaba Tongyi Wanxiang Wan3.0 video generation — one model ID covers
    text-to-video, image-to-video, reference-to-video and video editing.
    DashScope async passthrough endpoint.


    - Create requests must carry the `X-DashScope-Async: enable` header

    - Async task endpoint: this call only submits the job and returns a
    `task_id`. Poll `GET /v1/tasks/{task_id}`, then download the mp4 from
    `result_url`

    - Terminal states are `completed` / `failed`, **not** DashScope's native
    `SUCCEEDED`

    - `result_url` is a signed Alibaba OSS link — **do not send the
    Authorization header** when downloading. Valid for 24 hours

    - **Do not use `/v1/videos`** to submit Wan video jobs (media fields are
    dropped and billing is inaccurate)


    **Billing**: per second. Billed seconds = input reference video duration +
    output video duration; the unit price follows the output resolution.
    Reference images / audio / files are free. Input + output is capped at 30
    seconds. Failed tasks are fully refunded.


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API Key**: create one in the APIYI console at `api.apiyi.com/token`
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
security:
  - bearerAuth: []
paths:
  /wan/api/v1/services/aigc/video-generation/video-synthesis:
    post:
      tags:
        - Video Generation
      summary: 'Video generation: create a Wan3.0 video task'
      description: >
        Submits an asynchronous Wan3.0 video job and returns a `task_id` with
        `task_status: "PENDING"`.


        - Required: `model`, `input.prompt`, and the `X-DashScope-Async: enable`
        header

        - The mode is decided by `input.media[]`: omit it for text-to-video;
        `first_frame` for image-to-video; `reference_image` / `reference_video`
        for reference-to-video

        - `first_frame` / `last_frame` cannot be mixed with `reference_*` /
        `file` / `link`

        - **The response contains no video file** — poll `GET
        /v1/tasks/{task_id}` until `status: "completed"`, then download from
        `result_url`

        - Typical latency for a 5-second clip: ~100 sec at 480P, ~120 sec at
        720P, ~170 sec at 1080P
      operationId: createWan30Video
      parameters:
        - name: X-DashScope-Async
          in: header
          required: true
          description: >-
            Async switch. Must be set to enable, otherwise the upstream returns:
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
              $ref: '#/components/schemas/Wan30VideoRequest'
            example:
              model: wan3.0-video
              input:
                prompt: >-
                  A lighthouse by the sea at dusk, slow dolly-in, waves on the
                  rocks, seagulls, cinematic lighting
              parameters:
                resolution: 720P
                ratio: '16:9'
                duration: 5
                prompt_extend: true
      responses:
        '200':
          description: Task created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Wan30VideoResponse'
              example:
                output:
                  task_id: 9db29626-79fc-40d1-b9c2-c6b0caf8ac15
                  task_status: PENDING
                request_id: e616d8c9-1147-9ecd-b2b5-abbbe89a4642
        '400':
          description: Invalid request parameters
        '401':
          description: 'Authentication failed: invalid API key'
        '403':
          description: >-
            Forbidden: the key group does not include Wan&HappyHorse, or the key
            is on per-call billing
      security:
        - bearerAuth: []
components:
  schemas:
    Wan30VideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          enum:
            - wan3.0-video
            - wan3.0-video-prime
          default: wan3.0-video
          description: >-
            Model ID. wan3.0-video is the standard variant; wan3.0-video-prime
            is the faster Prime variant at a higher unit price
        input:
          $ref: '#/components/schemas/Wan30Input'
        parameters:
          $ref: '#/components/schemas/Wan30Parameters'
    Wan30VideoResponse:
      type: object
      properties:
        output:
          type: object
          properties:
            task_id:
              type: string
              description: Task ID, used for polling GET /v1/tasks/{task_id}
            task_status:
              type: string
              description: Always PENDING at submit time
        request_id:
          type: string
          description: Upstream request ID
    Wan30Input:
      type: object
      required:
        - prompt
      properties:
        prompt:
          type: string
          description: >-
            Natural-language description. With multiple assets, refer to them as
            image 1 / video 1 in the prompt
          example: A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks
        negative_prompt:
          type: string
          description: Negative prompt
        media:
          type: array
          description: >-
            Media asset array. Omit for text-to-video. first_frame / last_frame
            cannot be mixed with reference_* / file / link
          items:
            $ref: '#/components/schemas/Wan30Media'
    Wan30Parameters:
      type: object
      properties:
        resolution:
          type: string
          enum:
            - 480P
            - 720P
            - 1080P
          default: 1080P
          description: >-
            Output resolution (uppercase). Determines the unit price — set it
            explicitly
        ratio:
          type: string
          enum:
            - '16:9'
            - '9:16'
            - '1:1'
            - '4:3'
            - '3:4'
            - adaptive
          description: Aspect ratio. Ignored when a first frame is supplied
        duration:
          type: integer
          description: >-
            Output length in whole seconds. Defaults to 5. Input reference video
            duration + output duration must not exceed 30 seconds
          example: 5
        prompt_extend:
          type: boolean
          default: true
          description: Prompt rewriting. Keep it true
        audio:
          type: boolean
          default: true
          description: Whether to output an audio track. Enabled by default
        watermark:
          type: boolean
          default: false
          description: AI generated watermark in the lower-right corner
        seed:
          type: integer
          minimum: 0
          maximum: 2147483647
          description: Random seed. Fixing it improves reproducibility
    Wan30Media:
      type: object
      required:
        - type
        - url
      properties:
        type:
          type: string
          enum:
            - first_frame
            - last_frame
            - reference_image
            - reference_video
            - reference_audio
            - file
            - link
          description: >-
            Asset type. reference_video duration counts toward billed seconds;
            all other assets are free
        url:
          type: string
          format: uri
          description: >-
            A publicly reachable https link that must stay available until the
            task completes
          example: https://example.com/first-frame.jpg
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 'APIYI API key, format: Bearer sk-your-api-key'

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.