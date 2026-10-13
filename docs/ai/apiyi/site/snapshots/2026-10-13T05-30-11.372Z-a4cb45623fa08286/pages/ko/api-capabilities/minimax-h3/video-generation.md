> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-H3 동영상 생성 API 레퍼런스

> MiniMax-H3 동영상 생성 API 레퍼런스 및 라이브 플레이그라운드: 텍스트, 첫 프레임/마지막 프레임, 참조 이미지/동영상/오디오 기반 동영상을 위한 단일 엔드포인트; 비동기 제출 및 task_id 조회; 768P, 4–15초, 초당 과금.

<Info>
  우측의 대화형 Playground에서 실시간으로 테스트할 수 있습니다. **Authorization**(형식: `Bearer sk-xxx`)에 API Key를 입력하고, `content`에 텍스트 항목 1개를 추가(필요에 따라 이미지, 동영상 또는 오디오 항목 추가)한 다음 `duration` 및 `ratio`를 선택하여 전송합니다. 응답은 `task_id`이며, 아래에 설명된 조회 엔드포인트로 동영상을 가져옵니다.
</Info>

<Tip>
  **단일 엔드포인트, 네 가지 모드**: 텍스트 전용 = 텍스트 기반 동영상; `first_frame` / `last_frame` 이미지 추가 = 키프레임 동영상; `reference_image` / `reference_video` / `reference_audio` 추가 = 참조 동영상. 모드는 `content[]`에서 유추되므로 엔드포인트를 전환할 필요가 없습니다. 전체 내용은 [MiniMax-H3 개요](/ko/api-capabilities/minimax-h3/overview)를 참조하십시오.
</Tip>

<Warning>
  **⚠️ 가장 흔한 4가지 실수**

  1. **경로는 `/hailuo`로 시작합니다**: `POST /hailuo/v2/video_generation`로 생성하고, `GET /hailuo/v2/query/video_generation/{task_id}`로 조회합니다. `/v2/...` 경로만 단독으로 호출하면 JSON이 아닌 웹 페이지가 반환됩니다
  2. **`duration` 값은 4부터 15 사이의 정수여야 합니다**: 문자열 `"5"` 또는 `5.5`와 같은 소수는 거부됩니다
  3. **`resolution` 값은 대문자 `768P`여야 합니다**: `768p` 및 `2K`는 모두 거부됩니다
  4. **텍스트 전용 및 오디오 전용 요청에는 `ratio: "adaptive"`를 사용할 수 없습니다**; 고정 비율을 선택하십시오. `adaptive`는 요청에 이미지나 동영상이 포함되어 있을 때만 작동합니다
</Warning>

## 코드 예제

### Python (requests · 제출 + 폴링 + 다운로드)

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

### Python (첫 프레임 동영상 · 요청 본문)

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

### Python (혼합 참조 · 요청 본문)

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

### Node.js (네이티브 fetch)

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

### 브라우저 JavaScript

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

## 이미 task\_id가 있으신가요? 단 한 번의 cURL 호출

```bash theme={null}
curl "https://api.apiyi.com/hailuo/v2/query/video_generation/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer sk-your-api-key"
```

`status`이(가) `succeeded`이면 `task.content.url`은(는) MP4 URL이며 직접 다운로드할 수 있습니다:

```bash theme={null}
curl -L -o output.mp4 "<value of task.content.url>"
```

## 파라미터 참조

| 파라미터 | 타입 | 필수 여부 | 기본값 | 설명 |
| - | - | - | - | - |
| `model` | string | 예 | — | 항상 `MiniMax-H3`이어야 하며 대소문자를 구분합니다 |
| `content` | array | 예 | — | 정확히 1개의 텍스트 항목 + 0–12개의 미디어 항목(최대 9개의 참조 이미지, 3개의 참조 동영상, 3개의 참조 오디오 클립) |
| `content[].text` | string | 예 | — | 1–7000자, 미디어는 `<Picture 1>` / `<Video 1>` / `<Audio 1>` 형태로 참조합니다 |
| `content[].role` | string | 조건부 | — | 이미지: `first_frame` / `last_frame` / `reference_image`, 동영상: `reference_video`, 오디오: `reference_audio`. 이미지가 1개뿐인 경우 선택 사항입니다(첫 번째 프레임으로 처리됨) |
| `resolution` | string | 예 | — | `768P`만 지원합니다 |
| `duration` | integer | 예 | — | 4–15초, 초 단위로 과금됩니다 |
| `ratio` | string | 예 | — | `21:9` / `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `adaptive` |

### 비율 및 출력 크기(측정값)

| `ratio` | 출력 크기 |
| - | - |
| `21:9` | 1536×672 |
| `16:9` | 1344×768 |
| `4:3` | 1024×768 |
| `1:1` | 768×768 |
| `3:4` | 768×1024 |
| `9:16` | 768×1344 |
| `adaptive` | 입력 이미지 비율을 따릅니다(정사각형 이미지는 768×768 생성) |

### 미디어 요구사항

| 유형 | 포맷 | 크기 | 길이 / 규격 |
| - | - | - | - |
| 이미지 | JPG / PNG / WebP / HEIC / HEIF (정적) | ≤ 30MB | 한 변당 256–5760 px, 가로세로 비율 0.4–2.5, 첫 프레임과 마지막 프레임 간의 비율 차이가 2% 이내여야 합니다 |
| 동영상 | MP4 / MOV (H.264 / H.265) | ≤ 50MB | 클립당 최소 2초, 15초를 초과하는 클립은 앞부분 15초로 잘립니다. 클립 전체 **총합** 최대 15초 |
| 오디오 | WAV / MP3 / M4A / AAC | ≤ 15MB | 클립당 최소 2초, 15초를 초과하는 클립은 앞부분 15초로 잘립니다 |

<Warning>
  모든 미디어는 **직접 다운로드할 수 있는 공개 HTTPS URL**이어야 합니다. Base64, data URI, `http://` 링크 및 사설 네트워크 주소는 지원되지 않습니다. 핫링크 방지 또는 로그인이 적용된 링크를 사용하면 미디어 다운로드를 시도할 때 작업이 실패합니다.
</Warning>

## 응답 형식

### 작업 생성

```json theme={null}
{"task_id": "task_Clo9iKPCM46sRwRsMFcmJG6pGNSL1ygx"}
```

### 작업 조회 (진행 중)

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

### 작업 조회 (성공)

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

### 작업 조회 (실패)

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
  **⚠️ 응답 유의 사항**

  * 조회 결과는 최상위 레벨이 아닌 **`task`** 객체로 감싸져 있습니다.
  * 성공 시 `id`, `status`, `progress` 및 `content.url`만 보장되며, `usage`, `model`, `ratio` 및 유사한 필드는 **항상 반환되는 것은 아니므로** 방어적으로 파싱하십시오.
  * 상태는 `queued` → `running` → `succeeded` / `failed` 순으로 진행되며, 피크 시간대에는 작업이 `running`에서 시작될 수 있습니다.
  * `progress`은(는) 0과 1 사이에서만 전환되므로 진행률 표시줄로 사용하기에는 적합하지 않습니다.
  * 동영상 URL은 `task.content.url`이며 인증 헤더가 **필요하지 않습니다**. `HEAD` 요청에는 403을 반환하지만 `GET`에서는 정상 작동하므로 `GET`을(를) 사용하여 확인하십시오.
  * URL을 받은 후 즉시 동영상을 다운로드하여 사용자 측에 저장하십시오.
</Warning>

<Info>
  **과금**: 작업이 접수되면 `duration × \$0.03`이(가) 사전 청구되며, 참조 미디어에 대한 추가 요금은 없습니다. 실패한 작업은 **자동으로 전액 환불**됩니다. 제출 시 4xx / 5xx를 반환하는 요청에는 과금되지 않으며, 조회나 다운로드는 무료입니다. 자세한 내용은 [개요 페이지의 요금 안내](/ko/api-capabilities/minimax-h3/overview#pricing)를 참고하십시오.
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