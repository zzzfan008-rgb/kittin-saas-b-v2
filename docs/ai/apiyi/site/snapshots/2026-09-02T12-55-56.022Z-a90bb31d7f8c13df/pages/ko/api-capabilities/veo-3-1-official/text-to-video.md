> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 공식 텍스트-투-비디오 API

> VEO 3.1 공식 텍스트-투-비디오 API 레퍼런스 및 인터랙티브 Playground — JSON 요청 본문, 3단계 비동기 흐름, 유연한 4 / 6 / 8초 길이, 요청당 과금.

<Info>
  오른쪽의 대화형 Playground는 실시간 디버깅을 지원합니다. **인증** 아래에 API Key를 입력하고(형식 `Bearer sk-xxx`), prompt를 입력한 다음 model / seconds / metadata.resolution을 선택하고 전송하십시오. **`Default` 그룹도 작동합니다 — 전용 그룹 전환은 필요하지 않습니다**.
</Info>

<Tip>
  **범위**: 이 페이지는 "텍스트만으로 동영상 생성"을 다룹니다 — `input_reference`, `application/json` body는 없습니다. 참조 이미지로 생성하려면 [Image-to-Video 엔드포인트](/ko/api-capabilities/veo-3-1-official/image-to-video)를 사용하십시오(동일한 엔드포인트 + `input_reference` 업로드).
</Tip>

<Warning>
  **⚠️ 가장 흔한 세 가지 함정**

  1. **length 필드의 이름은 `seconds`(`duration`가 아님)이며 문자열이어야 합니다** `"4"` / `"6"` / `"8"`. 이를 `duration`로 지정하면 조용히 무시되며 → 길이는 기본 4초로 되돌아갑니다(“8s를 보냈는데 4s를 받은” 함정); 숫자를 전달하면 `parse_request_failed: cannot unmarshal number into Go struct field ... duration of type string`로 실패합니다
  2. **`generateAudio`를 전달하지 마십시오** — 상위 시스템이 `INVALID_ARGUMENT`를 반환합니다. 오디오 의도(ambient, dialogue, BGM)는 대신 prompt에 표현하십시오
  3. **1080p / 4k에서는 `seconds`가 `"8"`여야 합니다** — `"4"` / `"6"`는 상위 시스템에서 거부됩니다
</Warning>

<Warning>
  **3단계 비동기 흐름 — 이 페이지는 Step 1(제출)만 다룹니다**

  * **Step 1 (이 페이지)**: `POST /v1/videos` → `task_id` + `status: "queued"`를 반환합니다
  * **Step 2**: `GET /v1/videos/{task_id}`를 `status: "completed"`이 될 때까지 폴링합니다
  * **Step 3**: MP4를 다운로드하는 `GET /v1/videos/{task_id}/content`

  POST 제출 자체는 1초 미만이며 생성이 완료될 때까지 **기다리지 않습니다**. 전체 흐름은 아래 Python 샘플에 나와 있습니다.
</Warning>

## 코드 예시

### Python (OpenAI SDK · 저수준 client.post)

```python theme={null}
{/* OpenAI SDK has no videos.create method; /v1/videos is a custom path, use low-level client.post() */}
from openai import OpenAI
import time

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Step 1: submit
resp = client.post(
    "/videos",
    body={
        "model": "veo-3.1-fast-generate-preview",
        "prompt": "A coastal lighthouse at dusk, slow push-in, waves lapping the rocks, distant seabirds, cinematic lighting, steady camera",
        "seconds": "8",  # string, not number
        "size": "1280x720",
        "metadata": {
            "resolution": "720p",
            "aspectRatio": "16:9",
            "seed": 20260521,
            "negativePrompt": "blurry, watermark, distorted, low quality"
        }
    },
    cast_to=dict
)
task_id = resp["task_id"]
print(f"Task ID: {task_id}, status: {resp['status']}")

# Step 2: poll (up to 3 minutes for 720p/1080p)
deadline = time.time() + 180
while time.time() < deadline:
    s = client.get(f"/videos/{task_id}", cast_to=dict)
    print(f"Status: {s['status']}, progress: {s.get('progress', 0)}%")
    if s["status"] == "completed":
        break
    if s["status"] == "failed":
        raise RuntimeError(f"Generation failed: {s}")
    time.sleep(8)

# Step 3: download (retry to handle CDN sync delay right after completed)
import urllib.request, urllib.error
time.sleep(4)
for i in range(5):
    try:
        req = urllib.request.Request(
            f"https://api.apiyi.com/v1/videos/{task_id}/content",
            headers={"Authorization": "Bearer sk-your-api-key"}
        )
        with urllib.request.urlopen(req, timeout=180) as r, open("output.mp4", "wb") as f:
            while chunk := r.read(1 << 16):
                f.write(chunk)
        break
    except urllib.error.HTTPError:
        if i == 4:
            raise
        time.sleep(4)
print("Saved: output.mp4")
```

### 파이썬 (requests)

```python theme={null}
import requests
import time

API_KEY = "sk-your-api-key"
BASE_URL = "https://api.apiyi.com/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

# Step 1: submit (JSON body)
resp = requests.post(
    f"{BASE_URL}/videos",
    headers={**HEADERS, "Content-Type": "application/json"},
    json={
        "model": "veo-3.1-fast-generate-preview",
        "prompt": "A coastal lighthouse at dusk, slow push-in, steady camera, ocean ambience and distant seabirds",
        "seconds": "8",  # must be a string
        "size": "1280x720",
        "metadata": {
            "resolution": "720p",
            "aspectRatio": "16:9"
        }
    },
    timeout=30  # POST is just an enqueue; 30 sec is enough
).json()
task_id = resp["task_id"]
print(f"Task ID: {task_id}, status: {resp['status']}")

# Step 2: poll (3 min for 720p/1080p, 10 min for 4K)
deadline = time.time() + 180
while time.time() < deadline:
    s = requests.get(f"{BASE_URL}/videos/{task_id}", headers=HEADERS).json()
    print(f"Status: {s['status']}, progress: {s.get('progress', 0)}%")
    if s["status"] == "completed":
        break
    if s["status"] == "failed":
        raise RuntimeError(f"Generation failed: {s}")
    time.sleep(8)

# Step 3: download with retry
time.sleep(4)
for i in range(5):
    try:
        with requests.get(
            f"{BASE_URL}/videos/{task_id}/content",
            headers=HEADERS, stream=True, timeout=180
        ) as r:
            r.raise_for_status()
            with open("output.mp4", "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        break
    except requests.HTTPError:
        if i == 4:
            raise
        time.sleep(4)
print("Saved: output.mp4")
```

### cURL

```bash theme={null}
{/* Just want to check/download with an existing task_id? See the "Already have a task_id?" section below */}
{/* Step 1: submit (the length field is seconds, the string "8", not number 8, and not duration) */}
RESP=$(curl -sS -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "veo-3.1-fast-generate-preview",
    "prompt": "A coastal lighthouse at dusk, slow push-in, ocean ambience, cinematic lighting",
    "seconds": "8",
    "size": "1280x720",
    "metadata": {"resolution": "720p", "aspectRatio": "16:9"}
  }')
TASK_ID=$(echo "$RESP" | python3 -c 'import sys,json;print(json.load(sys.stdin)["task_id"])')
echo "task_id=$TASK_ID"

{/* Step 2: poll every 8 sec */}
while :; do
  S=$(curl -sS -H "Authorization: Bearer sk-your-api-key" "https://api.apiyi.com/v1/videos/$TASK_ID")
  ST=$(echo "$S" | python3 -c 'import sys,json;print(json.load(sys.stdin)["status"])')
  echo "status=$ST"
  [ "$ST" = "completed" ] && break
  [ "$ST" = "failed" ] && { echo "$S"; exit 1; }
  sleep 8
done

{/* Step 3: download (--retry covers occasional 400 right after status=completed) */}
sleep 4
curl -sSL --retry 3 --retry-delay 4 \
  -H "Authorization: Bearer sk-your-api-key" \
  "https://api.apiyi.com/v1/videos/$TASK_ID/content" \
  -o output.mp4
ls -lh output.mp4
```

### Node.js (기본 fetch)

```javascript theme={null}
import fs from 'node:fs';

const API_KEY = 'sk-your-api-key';
const BASE_URL = 'https://api.apiyi.com/v1';

// Step 1: submit
const submitResp = await fetch(`${BASE_URL}/videos`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'A golden retriever running on a sandy beach, slow motion, golden hour, cinematic quality',
        seconds: '8',  // must be string
        size: '1280x720',
        metadata: { resolution: '720p', aspectRatio: '16:9' }
    })
});
const { task_id } = await submitResp.json();
console.log(`Task ID: ${task_id}`);

// Step 2: poll
let status = 'queued';
while (status !== 'completed' && status !== 'failed') {
    await new Promise(r => setTimeout(r, 8000));
    const s = await (await fetch(`${BASE_URL}/videos/${task_id}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
    })).json();
    status = s.status;
    console.log(`Status: ${status}, progress: ${s.progress ?? 0}%`);
}

if (status === 'failed') throw new Error('Generation failed');

// Step 3: download (retry up to 3 times, 4-second gaps)
await new Promise(r => setTimeout(r, 4000));
let buffer;
for (let i = 0; i < 4; i++) {
    try {
        const resp = await fetch(`${BASE_URL}/videos/${task_id}/content`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        buffer = Buffer.from(await resp.arrayBuffer());
        break;
    } catch (e) {
        if (i === 3) throw e;
        await new Promise(r => setTimeout(r, 4000));
    }
}
fs.writeFileSync('output.mp4', buffer);
console.log('Saved: output.mp4');
```

### 브라우저 JavaScript

```javascript theme={null}
{/* Demo only; route through a backend proxy in production to avoid Key leakage; large video downloads are also unsuitable for direct browser handling */}
const submitResp = await fetch('https://api.apiyi.com/v1/videos', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'Watercolor northern lights over snowy mountains, gentle motion',
        seconds: '4',
        size: '720x1280',
        metadata: { resolution: '720p', aspectRatio: '9:16' }
    })
});
const { task_id } = await submitResp.json();
console.log('Task ID:', task_id);

{/* After polling completes, route the /content endpoint through your backend proxy for download */}
```

## 이미 task\_id가 있으십니까? 복붙 가능한 cURL 명령 2개

이미 `task_id`가 있다면(작업을 제출할 때 반환되었거나 콘솔 로그에서 볼 수 있습니다), 아래의 두 플레이스홀더만 바꿔서 실행합니다:

* `sk-your-api-key` → APIYI 키
* `task_xxxxxxxxxxxxxxxx` → 작업 ID

### 1. 작업 상태 확인

```bash theme={null}
curl "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer sk-your-api-key"
```

JSON 응답에 `status: "completed"`가 표시되면 다운로드할 수 있습니다. `in_progress`가 표시되면 몇 초 기다렸다가 다시 확인합니다.

### 2. 동영상 다운로드(output.mp4로 저장됨)

```bash theme={null}
curl -L --retry 3 --retry-delay 4 \
  "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx/content" \
  -H "Authorization: Bearer sk-your-api-key" \
  -o output.mp4
```

<Tip>
  `/content` 엔드포인트에는 `Authorization` 헤더가 필요합니다 — URL을 브라우저 주소 표시줄에 직접 열면 401이 반환됩니다. `--retry 3`는 `status`가 `completed`로 바뀐 직후 가끔 발생하는 400을 처리합니다(CDN 동기화 지연).
</Tip>

## 매개변수 참조

| 매개변수                      | 유형         | 필수  | 기본값        | 설명                                                                                                                                                    |
| ------------------------- | ---------- | --- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`                   | string     | 예   | —          | `veo-3.1-fast-generate-preview` (\$0.3/요청) 또는 `veo-3.1-generate-preview` (\$1.2/요청)                                                                   |
| `prompt`                  | string     | 예   | —          | 비디오 설명; 장면, 동작, 카메라, 조명, **오디오 의도**를 설명합니다(`generateAudio`를 전달하지 마십시오)                                                                                |
| `seconds`                 | **string** | 아니요 | `"8"`      | 비디오 길이, **문자열 열거형**: `"4"` / `"6"` / `"8"`. **필드는 `seconds`이며, `duration`가 아닙니다**(이를 `duration`로 지정하면 조용히 무시되고 4초로 되돌아갑니다). **1080p/4k는 `"8"`여야 합니다** |
| `size`                    | string     | 아니요 | `1280x720` | 출력 픽셀, 예: `1280x720` / `1920x1080` / `3840x2160`; `metadata.resolution`보다 우선순위가 낮습니다                                                                  |
| `metadata.resolution`     | string     | 아니요 | `720p`     | `720p` / `1080p` / `4k`; `size`보다 우선순위가 높습니다                                                                                                          |
| `metadata.aspectRatio`    | string     | 아니요 | `16:9`     | `16:9`(가로) 또는 `9:16`(세로)                                                                                                                              |
| `metadata.seed`           | int        | 아니요 | —          | 랜덤 시드. 고정 시드는 출력 스타일을 일정하게 만듭니다(하지만 **바이트 단위로 재현할 수는 없습니다**)                                                                                          |
| `metadata.negativePrompt` | string     | 아니요 | —          | 네거티브 prompt; `"blurry, watermark, distorted, low quality"`을 권장합니다                                                                                     |

<Warning>
  **`generateAudio` 필드를 전달하지 마십시오**! Veo 3.1은 기본적으로 오디오를 지원합니다. 이 매개변수를 전달하면 `INVALID_ARGUMENT`이 반환됩니다. 오디오를 제어하려면, **의도를 prompt에 작성하십시오**: `"waves, distant seabirds, low wind sounds"`.
</Warning>

<Tip>
  매개변수 우선순위:

  * 길이: `metadata.durationSeconds > seconds > 8`(`seconds`를 전송하십시오; `duration`은 인식되지 않습니다)
  * 해상도: `metadata.resolution > size > 720p`
  * 화면 비율: 명시적 `metadata.aspectRatio` > 크기에서 추론 > `16:9`
</Tip>

## 응답 형식

### 단계 1 - 제출 직후

```json theme={null}
{
  "id": "task_xxxxxxxxxxxxxxxx",
  "task_id": "task_xxxxxxxxxxxxxxxx",
  "object": "video",
  "model": "veo-3.1-fast-generate-preview",
  "status": "queued",
  "progress": 0,
  "created_at": 1775025000
}
```

### 단계 2 - 폴링 응답(진행 중)

```json theme={null}
{
  "id": "task_xxxxxxxxxxxxxxxx",
  "task_id": "task_xxxxxxxxxxxxxxxx",
  "object": "video",
  "model": "veo-3.1-fast-generate-preview",
  "status": "in_progress",
  "progress": 50,
  "created_at": 1775025000
}
```

### 단계 2 - 폴링 응답(완료됨)

```json theme={null}
{
  "id": "task_xxxxxxxxxxxxxxxx",
  "task_id": "task_xxxxxxxxxxxxxxxx",
  "object": "video",
  "model": "veo-3.1-fast-generate-preview",
  "status": "completed",
  "progress": 100,
  "created_at": 1775025000,
  "completed_at": 1775025090
}
```

<Warning>
  **⚠️ 응답 필드 주의사항**

  * **`id`과 `task_id`는 모두 같은 값으로 반환됩니다**; 하위 시스템은 `task_id`을 기준으로 표준화해야 합니다(기존 Reverse 채널과 호환됨)
  * **CDN / 공개 URL은 반환되지 않습니다** — 응답에 `video_url` / `data.url`가 없으며, 동영상은 오직 **`GET /v1/videos/{task_id}/content`를 통한 MP4 바이너리 스트림**으로만 가져올 수 있습니다(인증 헤더 필요). 프런트엔드는 이 엔드포인트를 직접 호출할 수 없으므로 — **서버 측에서 다운로드한 뒤 자체 OSS / CDN에 다시 호스팅하십시오**
  * `progress`는 거친 단위입니다 — **0 / 50 / 100 사이에서만 점프**하므로 퍼센트 바에는 사용하지 마십시오
  * `status: "failed"`에는 자세한 `error` 필드가 포함되지 않을 수 있습니다. 보통 콘텐츠 검토 또는 매개변수 오류입니다. 그냥 다시 시도하거나 prompt를 조정하십시오
  * **`/content`은 `status`이 `completed`로 바뀐 직후 가끔 400을 반환합니다**; 4초 후 다시 시도하십시오(위의 모든 코드 샘플에는 이 동작이 반영되어 있습니다)
</Warning>

<Info>
  이 엔드포인트는 비동기 작업 진입점입니다. **과금은 작업이 `completed`에 도달할 때 발생하며, 모델명 기준 요청당 과금됩니다**(fast \$0.3 / standard \$1.2, [가격](/ko/api-capabilities/veo-3-1-official/overview#pricing) 참조). POST 제출, 폴링, 다운로드 자체는 **과금되지 않으며**; 실패한 작업도 **과금되지 않습니다**.
</Info>


## OpenAPI

````yaml api-reference/veo-3-1-official-text-to-video-openapi-en.yaml POST /v1/videos
openapi: 3.1.0
info:
  title: VEO 3.1 Official Text-to-Video API
  description: >
    Google Veo 3.1 video generation series (Official Relay channel) —
    Text-to-Video endpoint (no `input_reference`, `application/json` body).


    - Two active models: `veo-3.1-fast-generate-preview` (\$0.3/req) and
    `veo-3.1-generate-preview` (\$1.2/req)

    - Duration supports `"4"` / `"6"` / `"8"` seconds (**string enum, numeric
    value will be rejected**)

    - The duration field is named `seconds` (not `duration`); **at 1080p / 4k
    resolution, `seconds` must be `"8"`**

    - Native synchronized audio output (ambient, dialogue, score) — **do not
    pass `generateAudio`**, upstream will reject with `INVALID_ARGUMENT`; encode
    audio intent in `prompt`

    - **Async task endpoint**: this endpoint only submits the task; combine with
    `GET /v1/videos/{task_id}` to poll and `GET /v1/videos/{task_id}/content` to
    download

    - Video retention not officially documented; download immediately on
    completion

    - For image-based generation, use the [Image-to-Video
    endpoint](/en/api-capabilities/veo-3-1-official/image-to-video) (same
    endpoint + multipart `input_reference`)


    **Authentication**: include `Authorization: Bearer YOUR_API_KEY` in the
    request header


    **API Key configuration**: **`Default` group works — no dedicated group
    switch needed**; the Token must use **Pay-per-request** or **Pay-as-you-go
    Priority** billing mode (pure **Pay-as-you-go is not supported**)


    **Get an API Key**: visit the [APIYI console](https://api.apiyi.com/token)
    to create a Token
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1/videos:
    post:
      tags:
        - Video Generation
      summary: 'Text-to-video: submit a generation task from text prompt'
      description: >
        Submit a Veo 3.1 video generation task (async); returns `task_id` and
        `status: "queued"`.


        - Required: `model`, `prompt`

        - Optional: `seconds` (default `"8"`, the duration field — not
        `duration`), `size` (default `"1280x720"`), `metadata.*`

        - **Response does not include the video file** — poll `GET
        /v1/videos/{task_id}` until `status: "completed"`, then call `GET
        /v1/videos/{task_id}/content` to download MP4

        - Typical render time: 720p 60–90 sec, 1080p 80–120 sec, 4K 5–6 min

        - For image-based generation, use the [Image-to-Video
        endpoint](/en/api-capabilities/veo-3-1-official/image-to-video)
      operationId: generateVeo31OfficialTextToVideo
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Veo31TextToVideoRequest'
            example:
              model: veo-3.1-fast-generate-preview
              prompt: >-
                A coastal lighthouse at dusk, slow push-in, waves lapping the
                rocks, distant seabirds, cinematic lighting, steady camera
              seconds: '8'
              size: 1280x720
              metadata:
                resolution: 720p
                aspectRatio: '16:9'
                seed: 20260521
                negativePrompt: blurry, watermark, distorted, low quality
      responses:
        '200':
          description: Task submitted; returns task_id and queued status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Veo31VideoTask'
        '400':
          description: >-
            Invalid parameter (seconds as number; seconds not in 4/6/8; field
            misnamed as duration; non-8-sec at 1080p/4k; prompt missing; etc.)
        '401':
          description: Unauthorized - invalid API Key
        '429':
          description: Rate limit or insufficient balance
        '500':
          description: Upstream gateway error; retry 1–2 times (failed tasks not billed)
      security:
        - bearerAuth: []
components:
  schemas:
    Veo31TextToVideoRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: >
            Model ID (per-request billing, duration / resolution do not affect
            price):

            - `veo-3.1-fast-generate-preview` — \$0.3/request, top pick for
            iteration / batch generation

            - `veo-3.1-generate-preview` — \$1.2/request, for final delivery /
            4K scenarios
          enum:
            - veo-3.1-fast-generate-preview
            - veo-3.1-generate-preview
          default: veo-3.1-fast-generate-preview
        prompt:
          type: string
          description: >
            Video generation prompt; describe in detail: scene + subject +
            action + camera + lighting + style.


            **Audio intent also goes in the prompt** (e.g. "waves, distant
            seabirds, low wind sounds"). **Do not pass `generateAudio`** —
            upstream rejects with `INVALID_ARGUMENT`.
          example: >-
            A coastal lighthouse at dusk, slow push-in, waves lapping the rocks,
            distant seabirds, cinematic lighting, steady camera
        seconds:
          type: string
          description: >
            Video length. **The field name is `seconds` (not `duration`)**, a
            **string enum** (not number):

            - `"4"` — 4 sec, 720p only

            - `"6"` — 6 sec, 720p only

            - `"8"` — 8 sec (default), **required at 1080p / 4k**


            Sending `duration` instead is silently ignored → length falls back
            to the default 4 sec (720p returns no error but only outputs 4 sec;
            1080p/4k errors with `... but got 4`). Passing a number (`8`)
            returns `parse_request_failed: cannot unmarshal number into Go
            struct field ... duration of type string`.
          enum:
            - '4'
            - '6'
            - '8'
          default: '8'
        size:
          type: string
          description: >
            Output pixel dimensions; lower precedence than
            `metadata.resolution`:

            - `1280x720` / `720x1280` — 720p (default)

            - `1920x1080` / `1080x1920` — 1080p (seconds must be `"8"`)

            - `3840x2160` / `2160x3840` — 4k (seconds must be `"8"`, 4–6× slower
            render)
          enum:
            - 1280x720
            - 720x1280
            - 1920x1080
            - 1080x1920
            - 3840x2160
            - 2160x3840
          default: 1280x720
        metadata:
          $ref: '#/components/schemas/Veo31TextToVideoMetadata'
    Veo31VideoTask:
      type: object
      properties:
        id:
          type: string
          description: >-
            Task ID (matches `task_id`; downstream should standardize on
            `task_id`)
          example: task_xxxxxxxxxxxxxxxx
        task_id:
          type: string
          description: Task ID for subsequent polling and download
          example: task_xxxxxxxxxxxxxxxx
        object:
          type: string
          description: Object type, fixed to `video`
          example: video
        model:
          type: string
          description: Model ID used for this task
          example: veo-3.1-fast-generate-preview
        status:
          type: string
          description: |
            Task status:
            - `queued` — submitted, awaiting processing
            - `in_progress` — generating
            - `completed` — done, downloadable (`/v1/videos/{task_id}/content`)
            - `failed` — failed (**not billed**), retry possible
          enum:
            - queued
            - in_progress
            - completed
            - failed
          example: queued
        progress:
          type: integer
          description: >-
            Generation progress (coarse-grained, **jumps only between 0 / 50 /
            100**, do not use for percentage bars)
          example: 0
        created_at:
          type: integer
          description: Task creation Unix timestamp (seconds)
          example: 1775025000
        completed_at:
          type: integer
          description: >-
            Task completion Unix timestamp (seconds); only present for completed
            status
          example: 1775025090
    Veo31TextToVideoMetadata:
      type: object
      description: >
        Wrapper for fine-grained generation parameters. **Higher precedence than
        the top-level `size` etc.**:

        - Duration resolution order: `metadata.durationSeconds > seconds > 8`
        (send `seconds`; `duration` is not recognized)

        - Resolution resolution order: `metadata.resolution > size > 720p`
      properties:
        resolution:
          type: string
          description: Resolution tier (higher precedence than `size`)
          enum:
            - 720p
            - 1080p
            - 4k
          default: 720p
        aspectRatio:
          type: string
          description: 'Aspect ratio: `16:9` landscape (default) or `9:16` portrait'
          enum:
            - '16:9'
            - '9:16'
          default: '16:9'
        seed:
          type: integer
          description: >
            Random seed. Fixed seed clusters outputs in style (intra-group file
            size spread ~6%, inter-group ~36%), **but does not byte-reproduce**.
          example: 20260521
        negativePrompt:
          type: string
          description: >-
            Negative prompt; recommended `"blurry, watermark, distorted, low
            quality"`
          example: blurry, watermark, distorted, low quality
        durationSeconds:
          type: integer
          description: >-
            Equivalent to top-level `seconds` with highest precedence (generally
            prefer `seconds` for consistency)
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        API Key from APIYI console (Default group + Pay-per-request or
        Pay-as-you-go Priority Token; pure Pay-as-you-go not supported)

````