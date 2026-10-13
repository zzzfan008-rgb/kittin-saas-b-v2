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
task_id = resp.get("task_id") or resp["id"]
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
for i in range(8):
    try:
        req = urllib.request.Request(
            f"https://api.apiyi.com/v1/videos/{task_id}/content",
            headers={"Authorization": "Bearer sk-your-api-key"}
        )
        with urllib.request.urlopen(req, timeout=180) as r, open("output.mp4", "wb") as f:
            while chunk := r.read(1 << 16):
                f.write(chunk)
        break
    except urllib.error.HTTPError as e:
        # 400 = status just flipped to completed (window up to ~20 s): keep waiting; 502 etc.: one more try at most
        if i == 7 or (e.code != 400 and i >= 1):
            raise
        time.sleep(4)
print("Saved: output.mp4")
```

### Python (requests)

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
task_id = resp.get("task_id") or resp["id"]
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
for i in range(8):
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
    except requests.HTTPError as e:
        # 400 = status just flipped to completed (window up to ~20 s): keep waiting; 502 etc.: one more try at most
        if i == 7 or (e.response.status_code != 400 and i >= 1):
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
TASK_ID=$(echo "$RESP" | python3 -c 'import sys,json;print((lambda d: d.get("task_id") or d["id"])(json.load(sys.stdin)))')
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
curl -fsSL --retry 7 --retry-delay 4 --retry-all-errors \
  -H "Authorization: Bearer sk-your-api-key" \
  "https://api.apiyi.com/v1/videos/$TASK_ID/content" \
  -o output.mp4
ls -lh output.mp4
```

### Node.js (native fetch)

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
const submitData = await submitResp.json();
const task_id = submitData.task_id || submitData.id;
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

// Step 3: download (retry 400 every 4 s, up to about 30 s)
await new Promise(r => setTimeout(r, 4000));
let buffer;
for (let i = 0; i < 8; i++) {
    try {
        const resp = await fetch(`${BASE_URL}/videos/${task_id}/content`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        if (!resp.ok) throw Object.assign(new Error(`HTTP ${resp.status}`), { status: resp.status });
        buffer = Buffer.from(await resp.arrayBuffer());
        break;
    } catch (e) {
        if (i === 7 || (e.status !== 400 && i >= 1)) throw e;  // 400: keep waiting; 502 etc.: one more try at most
        await new Promise(r => setTimeout(r, 4000));
    }
}
fs.writeFileSync('output.mp4', buffer);
console.log('Saved: output.mp4');
```

### Browser JavaScript

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
const submitData = await submitResp.json();
const task_id = submitData.task_id || submitData.id;
console.log('Task ID:', task_id);

{/* After polling completes, route the /content endpoint through your backend proxy for download */}
```

## 이미 task\_id가 있으신가요? 바로 복사하여 사용하는 cURL 명령어 2개

이미 `task_id`를 보유하고 계신 경우(작업 제출 시 반환되었거나 콘솔 로그에서 확인 가능), 아래의 두 자리표시자만 변경하여 실행하시면 됩니다:

* `sk-your-api-key` → 사용자의 APIYI 키
* `task_xxxxxxxxxxxxxxxx` → 사용자의 task ID

### 1. 작업 상태 확인

```bash theme={null}
curl "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer sk-your-api-key"
```

JSON 응답에 `status: "completed"`가 표시되면 다운로드할 수 있으며, `in_progress`가 표시되면 몇 초간 대기한 후 다시 확인하십시오.

### 2. 동영상 다운로드 (output.mp4로 저장)

```bash theme={null}
curl -fL --retry 7 --retry-delay 4 --retry-all-errors \
  "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx/content" \
  -H "Authorization: Bearer sk-your-api-key" \
  -o output.mp4
```

<Tip>
  `/content` 엔드포인트에는 `Authorization` 헤더가 필요합니다. 브라우저 주소창에서 URL을 직접 열면 401이 반환됩니다. `-f --retry 7 --retry-delay 4 --retry-all-errors`는 `status`가 `completed`(으)로 변경된 직후(최대 약 20초)에 발생하는 400을 처리합니다. `-f`이 없으면 curl은 400을 성공으로 간주하고 오류 JSON을 `output.mp4`에 기록하며, `--retry-all-errors`이 없으면 `--retry`는 400을 전혀 재시도하지 않습니다(curl 7.71+ 필요).
</Tip>

## 매개변수 참조

| 매개변수 | 유형 | 필수 | 기본값 | 설명 |
| - | - | - | - | - |
| `model` | string | 예 | — | `veo-3.1-fast-generate-preview` (\$0.3/요청) 또는 `veo-3.1-generate-preview` (\$1.2/요청) |
| `prompt` | string | 예 | — | 비디오 설명; 장면, 동작, 카메라, 조명, **오디오 의도**를 설명합니다(`generateAudio`를 전달하지 마십시오) |
| `seconds` | **string** | 아니요 | `"8"` | 비디오 길이, **문자열 열거형**: `"4"` / `"6"` / `"8"`. **필드는 `seconds`이며, `duration`가 아닙니다**(이를 `duration`로 지정하면 조용히 무시되고 4초로 되돌아갑니다). **1080p/4k는 `"8"`여야 합니다** |
| `size` | string | 아니요 | `1280x720` | 출력 픽셀, 예: `1280x720` / `1920x1080` / `3840x2160`; `metadata.resolution`보다 우선순위가 낮습니다 |
| `metadata.resolution` | string | 아니요 | `720p` | `720p` / `1080p` / `4k`; `size`보다 우선순위가 높습니다 |
| `metadata.aspectRatio` | string | 아니요 | `16:9` | `16:9`(가로) 또는 `9:16`(세로) |
| `metadata.seed` | int | 아니요 | — | 랜덤 시드. 고정 시드는 출력 스타일을 일정하게 만듭니다(하지만 **바이트 단위로 재현할 수는 없습니다**) |
| `metadata.negativePrompt` | string | 아니요 | — | 네거티브 prompt; `"blurry, watermark, distorted, low quality"`을 권장합니다 |

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

### 1단계 - 제출 직후

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

### 2단계 - 폴링 응답 (진행 중)

```json theme={null}
{
  "id": "task_xxxxxxxxxxxxxxxx",
  "object": "video",
  "model": "veo-3.1-fast-generate-preview",
  "status": "in_progress",
  "progress": 50,
  "created_at": 1775025000
}
```

### 2단계 - 폴링 응답 (완료됨)

```json theme={null}
{
  "id": "task_xxxxxxxxxxxxxxxx",
  "object": "video",
  "model": "veo-3.1-fast-generate-preview",
  "status": "completed",
  "progress": 100,
  "created_at": 1775025000,
  "completed_at": 1775025090,
  "expires_at": 1775111490,
  "video_url": "https://…/task_xxxxxxxxxxxxxxxx_0.mp4"
}
```

<Warning>
  **⚠️ 응답 필드 주의사항**

  * **태스크 ID는 `id`에서 가져오십시오**: 제출 응답에는 `task_id`(동일한 값)도 포함될 수 있지만, 폴링 응답에는 `id`만 포함됩니다. 안전한 패턴은 `resp.get("task_id") or resp["id"]`입니다(위의 샘플 코드에 이미 적용되어 있습니다).
  * **다운로드는 `/content`를 기준으로 삼으십시오**: `GET /v1/videos/{task_id}/content`는 MP4 바이너리 스트림을 반환하며(인증 헤더 필요), 모든 태스크에서 정상 작동합니다. 완료된 응답에는 `video_url`(인증이 필요 없는 직접 링크)와 `expires_at`(약 24시간 후 만료)가 포함될 **수도 있습니다**. 그러나 이는 **모든 태스크에서 보장되는 것은 아니며**, 임시 미리보기에만 적합합니다. 프론트엔드에서 `/content`에 직접 접근할 수 없으므로, **서버 측에서 다운로드한 후 자체 OSS / CDN에 다시 호스팅하십시오**.
  * `progress` 값은 정밀하지 않으며 **몇 가지 고정된 단계 사이를 건너뛰기만 하므로**, 백분율 진행률 표시에 사용하지 마십시오.
  * `status: "failed"`에는 일반적으로 `error.message`에 사유(콘텐츠 검토, 매개변수 오류 또는 생성된 파일을 가져올 수 없음 등)가 함께 전달됩니다. **실패한 태스크는 과금되지 않으며 차감된 금액은 자동으로 환불됩니다**. prompt를 조정한 후 다시 시도하십시오.
  * `status` 상태가 `completed`(으)로 전환된 직후 **`/content`에서 일시적으로 400 오류가 반환될 수 있습니다**. 4초 후 다시 시도하십시오(위의 모든 코드 샘플에 이미 반영되어 있습니다).
</Warning>

<Info>
  이 엔드포인트는 비동기 태스크 진입점입니다. **과금은 태스크가 `completed` 상태에 도달할 때 모델 이름에 따라 요청당 부과됩니다**(fast \$0.3 / standard \$1.2, [요금 안내](/ko/api-capabilities/veo-3-1-official/overview#pricing) 참조). POST 제출, 폴링 및 다운로드 자체는 **과금되지 않으며**, 실패한 태스크 역시 **과금되지 않습니다**.
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

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.