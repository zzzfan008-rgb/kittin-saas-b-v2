> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Oxygen 동영상 생성 API 레퍼런스

> Oxygen(oxygen-1.0) 동영상 생성 API 레퍼런스 및 라이브 Playground: OpenAI Videos와 호환되며, POST /v1/videos로 제출하고 GET /v1/videos/{id}로 조회합니다. 엔벨로프를 통한 첫 프레임/마지막 프레임 및 참조 미디어를 지원하며, 초 단위로 과금됩니다.

<Info>
  우측의 대화형 Playground를 통해 실시간으로 호출을 테스트할 수 있습니다. **Authorization**(형식: `Bearer sk-xxx`)에 API 키를 입력하고 `prompt`, `seconds` 및 `size`를 채운 후 전송하십시오. 응답은 작업 `id`이며, 아래의 조회 엔드포인트를 통해 동영상을 가져옵니다.
</Info>

<Tip>
  **하나의 엔드포인트, 4가지 모드**: `prompt`만 사용 = 텍스트-동영상(text-to-video); `input_reference`에 이미지 1개 = 첫 프레임 동영상; `input_reference`에 JSON 엔벨로프 = 첫 프레임 및 마지막 프레임 또는 참조 미디어 동영상이며, 엔벨로프를 통해 320p 또는 1:1 비율을 선택할 수도 있습니다. 전체적인 내용은 [Oxygen 개요](/ko/api-capabilities/oxygen/overview)를 참고하십시오.
</Tip>

<Warning>
  **⚠️ 가장 흔히 발생하는 4가지 실수**

  1. **항상 `size`를 전달하십시오**: 지정하지 않으면 게이트웨이 기본값이 `720x1280`로 적용되어 세로 모드로 출력됩니다
  2. **고급 파라미터는 `input_reference` 엔벨로프에 넣으십시오**: 최상위 레벨에서는 `model`, `prompt`, `seconds`, `size` 및 `input_reference`만 적용되며, 여기에 배치된 `last_image`, `reference_images`, `resolution` 및 `aspect_ratio`는 오류 없이 **자동으로 무시됩니다**
  3. **`input_reference`은 반드시 문자열이어야 합니다**: 먼저 `json.dumps` / `JSON.stringify`로 엔벨로프를 직렬화하십시오. 객체나 배열을 전달하면 거부됩니다
  4. **길이는 최상위 `seconds`로만 설정하십시오** (4–15); 엔벨로프 내부에 `duration`을 전달하면 400이 반환됩니다
</Warning>

## 코드 예제

### Python (requests · 제출 + 폴링 + 다운로드)

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

### Python (첫 프레임 동영상 · 요청 본문)

```python theme={null}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The glass sphere rolls slowly across the table",
    "seconds": "4",
    "size": "1280x720",      # sets the resolution (480p); aspect ratio follows the first frame
    "input_reference": "https://your-cdn.example.com/first.png",  # a data:image/...;base64,... URI also works
}
```

### Python (첫 프레임 및 마지막 프레임 / 참조 미디어 · JSON 엔벨로프)

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

첫 프레임 및 마지막 프레임(`input_reference`의 값은 이스케이프된 JSON 문자열임에 유의하십시오):

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

### Node.js (네이티브 fetch)

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

## id가 있으신가요? cURL 한 번으로 결과 가져오기

```bash theme={null}
curl "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer $APIYI_API_KEY"
```

`status`가 `completed`일 때 `video_url`는 MP4 주소이며 직접 다운로드할 수 있습니다:

```bash theme={null}
curl -L -o output.mp4 "<value of video_url>"
```

## 파라미터 레퍼런스

### 최상위 필드 (다음 5개만 적용됩니다)

| 파라미터 | 타입 | 필수 여부 | 설명 |
| - | - | - | - |
| `model` | string | 필수 | 항상 `oxygen-1.0` |
| `prompt` | string | 필수 | 동영상 설명 |
| `seconds` | string / integer | 필수 | 4\~15 범위의 정수, 과금에 사용됨 |
| `size` | string | 강력 권장 | `1280x720` / `720x1280` (480p), `1792x1024` / `1024x1792` (768p), 생략 시 기본값은 `720x1280` |
| `input_reference` | string | 선택 | 이미지 URL 또는 데이터 URI = 첫 번째 프레임, `{`(으)로 시작하는 JSON 문자열 = 엔벨로프 (아래 참조) |

### `input_reference` 엔벨로프 키

| 키 | 타입 | 설명 |
| - | - | - |
| `images` | string\[] | 첫 번째 프레임, 최대 1개 (https 또는 이미지 데이터 URI) |
| `last_image` | string | 마지막 프레임 (https 또는 이미지 데이터 URI) |
| `reference_images` | string\[] | 참조 이미지, 최대 9개 |
| `reference_videos` | string\[] | 참조 동영상, 최대 3개, https만 지원 |
| `reference_audios` | string\[] | 참조 오디오, 최대 3개, https만 지원 |
| `resolution` | string | `320p` / `480p` / `768p`, `size`보다 우선 적용 |
| `aspect_ratio` | string | `16:9` / `9:16` / `1:1`, `size`보다 우선 적용되며 이미지 투 비디오(image-to-video)에서는 무시됨 |
| `prompt` | string | 존재하는 경우 최상위 `prompt`보다 우선 적용됨 |

<Warning>
  엔벨로프에는 **`duration`을 포함할 수 없으며**(최상위 `seconds` 사용) 표에 없는 키도 포함할 수 없습니다. 또한 첫 번째/마지막 프레임(`images` / `last_image`)은 `reference_*`과 함께 사용할 수 없습니다. 이를 위반하면 과금 없이 400(`param: input_reference`) 오류가 반환됩니다.
</Warning>

### 해상도 및 출력 크기 (실측값)

| 해상도 | 가로 16:9 | 세로 9:16 | 정사각형 1:1 |
| - | - | - | - |
| 320p | 576×320 | (측정되지 않음) | (측정되지 않음) |
| 480p | 864×480 | 480×864 | 480×480 |
| 768p | 1344×768 | 768×1344 | 768×768 |

이미지 투 비디오(Image-to-video)는 첫 번째 프레임의 가로세로 비율을 따릅니다. 예를 들어 정사각형 첫 번째 프레임의 경우 480p에서 480×480 크기로 생성됩니다.

## 응답 형식

### 작업 생성

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

### 작업 조회 (성공)

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

### 작업 조회 (실패)

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

### 제출 오류 (400)

```json theme={null}
{
  "message": "{\"error\":{\"code\":\"invalid_params\",\"message\":\"input_reference: duration is not used here; set the length with the top-level seconds field\",\"param\":\"input_reference\"}}",
  "type": "task_error",
  "code": "fail_to_fetch_task"
}
```

<Warning>
  **⚠️ 응답 참고 사항**

  * 상태는 `queued` → `in_progress` → `completed` / `failed` 순으로 변경됩니다.
  * 동영상은 \*\*`video_url`\*\*에 위치하며 인증 헤더 없이 다운로드할 수 있습니다. `expires_at`(약 24시간)에 만료되므로 신속히 저장하시기 바랍니다.
  * `completed` 직후에는 `/v1/videos/{id}/content`에 몇 초 정도 더 소요될 수 있으며(처음에는 400을 반환함), `video_url` 사용을 권장합니다.
  * `usage.unit_price_usd`은 해상도별 참고 가격입니다. **실제 과금은 청구 내역을 따르며**, 초당 일괄 \$0.02입니다.
  * 제출 오류의 경우 세부 정보는 `message` 내부의 JSON 문자열 형태로 제공되므로 다시 파싱해야 합니다.
</Warning>

<Info>
  **과금**: `seconds × \$0.02`은 작업이 접수될 때 청구됩니다. 해상도 및 참조 미디어에 따라 가격이 변경되지 않으며, 실패한 작업은 **자동으로 전액 환불**됩니다. 400을 반환하는 제출 건에는 요금이 부과되지 않으며, 조회 및 다운로드는 무료입니다. 자세한 내용은 [개요의 요금 안내](/ko/api-capabilities/oxygen/overview#pricing)를 참고하시기 바랍니다.
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