> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 공식 이미지-투-동영상 API

> VEO 3.1 공식 이미지-투-동영상 API 레퍼런스 및 인터랙티브 Playground — 정적인 비주얼을 애니메이션으로 전환하기 위해 단일 input_reference 이미지를 multipart로 업로드합니다.

<Info>
  오른쪽의 대화형 플레이그라운드는 실시간 디버깅을 지원합니다. **Authorization** 아래에 API 키를 입력하고(형식 `Bearer sk-xxx`), 참조 이미지를 업로드한 다음 prompt를 입력하고, 모델 / 초 / 해상도를 선택한 뒤 전송합니다. **`Default` 그룹은 작동합니다 — 별도의 그룹 전환이 필요하지 않습니다**.
</Info>

<Tip>
  **범위**: 이 페이지는 “참조 이미지로 동영상 생성”을 다룹니다 — 정적 콘텐츠를 애니메이션화하기 위한 시각적 기준점 / 시작 프레임으로 이미지 한 장을 업로드합니다. 참조 이미지가 필요하지 않다면 [텍스트-투-비디오 엔드포인트](/ko/api-capabilities/veo-3-1-official/text-to-video)를 사용하십시오(동일한 엔드포인트, JSON 본문).
</Tip>

<Warning>
  **⚠️ Image-to-video 제약 사항**

  * **Content-Type은 `multipart/form-data`여야 합니다** (JSON 아님)
  * **참조 이미지는 1장만 지원됩니다**; 필드명은 `input_reference`으로 고정됩니다. 여러 이미지를 제출하면 첫 번째만 유지됩니다
  * **원격 URL은 허용되지 않습니다** — 파일 업로드 또는 Base64여야 합니다
  * 허용 형식: `image/jpeg` / `image/png` / `image/webp`
  * **길이 필드는 `seconds`로 명명해야 하며(`duration` 아님), `"4"` / `"6"` / `"8"` 형식의 문자열이어야 합니다** `duration`로 지정하면 조용히 무시되고 기본 4초로 되돌아갑니다. 숫자를 전달하면 실패합니다
  * **1080p / 4k에서는 `seconds`가 `"8"`여야 합니다**

  Google 업스트림 Veo 3.1은 다중 참조 / 첫/마지막 프레임 / 동영상 확장을 지원합니다; **이 공식 채널은 아직 이를 노출하지 않습니다**. 첫/마지막 프레임이 필요하면 [VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview) `-fl` 시리즈를 사용하십시오.
</Warning>

## 코드 예제

### Python (OpenAI SDK · low-level client.post)

```python theme={null}
{/* OpenAI SDK has no videos.create method; /v1/videos is a custom path, use low-level client.post() */}
from openai import OpenAI
import time

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Step 1: multipart upload (low-level client.post handles multipart boundary)
with open("./lighthouse.png", "rb") as f:
    resp = client.post(
        "/videos",
        body=None,
        files={
            "input_reference": ("lighthouse.png", f, "image/png")
        },
        extra_body={
            "model": "veo-3.1-fast-generate-preview",
            "prompt": "Camera slowly rises from the base of the lighthouse to the top, dusk lighting, ocean ambience",
            "seconds": "8",  # must be string
            "size": "1280x720",
            "resolution": "720p",
            "aspectRatio": "16:9"
        },
        cast_to=dict
    )
task_id = resp.get("task_id") or resp["id"]
print(f"Task ID: {task_id}, status: {resp['status']}")

# Step 2: poll (up to 3 minutes)
deadline = time.time() + 180
while time.time() < deadline:
    s = client.get(f"/videos/{task_id}", cast_to=dict)
    print(f"Status: {s['status']}, progress: {s.get('progress', 0)}%")
    if s["status"] == "completed":
        break
    if s["status"] == "failed":
        raise RuntimeError(f"Generation failed: {s}")
    time.sleep(8)

# Step 3: download (with retry)
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

### Python (requests + multipart)

```python theme={null}
import requests
import time

API_KEY = "sk-your-api-key"
BASE_URL = "https://api.apiyi.com/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

# Step 1: multipart upload of reference image + form fields
with open("./lighthouse.png", "rb") as f:
    resp = requests.post(
        f"{BASE_URL}/videos",
        headers=HEADERS,  # do not set Content-Type manually; requests handles multipart boundary
        data={
            "model": "veo-3.1-fast-generate-preview",
            "prompt": "Camera slowly rises from the base of the lighthouse to the top, dusk lighting, waves lapping the rocks",
            "seconds": "8",  # string, not number
            "size": "1280x720",
            "resolution": "720p",
            "aspectRatio": "16:9",
            "seed": "20260521"
        },
        files={
            "input_reference": ("lighthouse.png", f, "image/png")
        },
        timeout=60  # multipart upload of large images may be slow
    ).json()
task_id = resp.get("task_id") or resp["id"]
print(f"Task ID: {task_id}")

# Step 2: poll
deadline = time.time() + 180
while time.time() < deadline:
    s = requests.get(f"{BASE_URL}/videos/{task_id}", headers=HEADERS).json()
    print(f"Status: {s['status']}, progress: {s.get('progress', 0)}%")
    if s["status"] == "completed":
        break
    if s["status"] == "failed":
        raise RuntimeError(s)
    time.sleep(8)

# Step 3: download (retry the 400 right after completed)
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

### cURL (multipart upload)

```bash theme={null}
{/* Just want to check/download with an existing task_id? See the "Already have a task_id?" section below */}
{/* Step 1: multipart upload (input_reference uses @ to reference a local file) */}
RESP=$(curl -sS -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=veo-3.1-fast-generate-preview" \
  -F "prompt=Camera slowly rises from the base of the lighthouse to the top, dusk lighting" \
  -F "seconds=8" \
  -F "size=1280x720" \
  -F "resolution=720p" \
  -F "aspectRatio=16:9" \
  -F "input_reference=@./lighthouse.png;type=image/png")
TASK_ID=$(echo "$RESP" | python3 -c 'import sys,json;print((lambda d: d.get("task_id") or d["id"])(json.load(sys.stdin)))')
echo "task_id=$TASK_ID"

{/* Step 2: poll */}
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

### Node.js (native fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';
import { FormData, File } from 'undici';

const API_KEY = 'sk-your-api-key';
const BASE_URL = 'https://api.apiyi.com/v1';

// Step 1: multipart upload
const buffer = fs.readFileSync('./lighthouse.png');
const form = new FormData();
form.append('model', 'veo-3.1-fast-generate-preview');
form.append('prompt', 'Camera slowly rises from the base of the lighthouse to the top, dusk lighting');
form.append('seconds', '8');  // string
form.append('size', '1280x720');
form.append('resolution', '720p');
form.append('aspectRatio', '16:9');
form.append('input_reference', new File([buffer], 'lighthouse.png', { type: 'image/png' }));

const submitResp = await fetch(`${BASE_URL}/videos`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}` },  // do not set Content-Type manually
    body: form
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

// Step 3: download (with retry)
await new Promise(r => setTimeout(r, 4000));
let videoBuffer;
for (let i = 0; i < 8; i++) {
    try {
        const resp = await fetch(`${BASE_URL}/videos/${task_id}/content`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        if (!resp.ok) throw Object.assign(new Error(`HTTP ${resp.status}`), { status: resp.status });
        videoBuffer = Buffer.from(await resp.arrayBuffer());
        break;
    } catch (e) {
        if (i === 7 || (e.status !== 400 && i >= 1)) throw e;  // 400: keep waiting; 502 etc.: one more try at most
        await new Promise(r => setTimeout(r, 4000));
    }
}
fs.writeFileSync('output.mp4', videoBuffer);
console.log('Saved: output.mp4');
```

### Browser JavaScript (file input upload)

```javascript theme={null}
{/* Demo only; route through a backend proxy in production to avoid Key leakage */}
const fileInput = document.querySelector('input[type=file]');
const file = fileInput.files[0];

const form = new FormData();
form.append('model', 'veo-3.1-fast-generate-preview');
form.append('prompt', 'Animate this scene with a gentle camera push-in and natural ambient sound');
form.append('seconds', '4');
form.append('size', '720x1280');
form.append('resolution', '720p');
form.append('aspectRatio', '9:16');
form.append('input_reference', file);

const submitResp = await fetch('https://api.apiyi.com/v1/videos', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const submitData = await submitResp.json();
const task_id = submitData.task_id || submitData.id;
console.log('Task ID:', task_id);

{/* After polling completes, route the /content endpoint through your backend proxy */}
```

## 이미 task\_id가 있으신가요? 바로 복사해 사용하는 cURL 명령어 2개

이미 `task_id`가 있는 경우(작업 제출 시 반환되었거나 콘솔 로그에서 확인 가능), 아래의 두 자리표시자만 변경하여 실행하십시오:

* `sk-your-api-key` → 사용자의 APIYI 키
* `task_xxxxxxxxxxxxxxxx` → 사용자의 작업 ID

### 1. 작업 상태 확인

```bash theme={null}
curl "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer sk-your-api-key"
```

JSON 응답에 `status: "completed"`가 표시되면 다운로드할 수 있습니다. `in_progress`가 표시되면 몇 초 기다린 후 다시 확인하십시오.

### 2. 동영상 다운로드 (output.mp4로 저장)

```bash theme={null}
curl -fL --retry 7 --retry-delay 4 --retry-all-errors \
  "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx/content" \
  -H "Authorization: Bearer sk-your-api-key" \
  -o output.mp4
```

<Tip>
  `/content` 엔드포인트에는 `Authorization` 헤더가 필요합니다. 브라우저 주소창에서 URL을 직접 열면 401이 반환됩니다. `-f --retry 7 --retry-delay 4 --retry-all-errors`는 `status`가 `completed`(으)로 전환된 직후 발생하는 400 오류를 처리합니다(최대 약 20초). `-f`이 없으면 curl은 400을 성공으로 간주하여 오류 JSON을 `output.mp4`에 기록합니다. `--retry-all-errors`이 없으면 `--retry`는 400 오류를 전혀 재시도하지 않습니다(curl 7.71 이상 필요).
</Tip>

## 매개변수 참조

| 매개변수 | 형식 | 필수 | 기본값 | 설명 |
| - | - | - | - | - |
| `input_reference` | file | Yes | — | 참조 이미지 파일입니다. **필드명은 고정이며, 이미지는 1장만 허용됩니다**, `image/jpeg` / `image/png` / `image/webp`를 지원합니다. **원격 URL은 허용되지 않습니다** |
| `model` | string | Yes | — | `veo-3.1-fast-generate-preview` (\$0.3/req) 또는 `veo-3.1-generate-preview` (\$1.2/req) |
| `prompt` | string | Yes | — | 장면이 어떻게 애니메이션될지 설명합니다: 카메라 움직임, 객체 동작, 조명, 스타일. **`generateAudio`를 전달하지 마십시오**, 오디오 의도는 prompt에 넣으십시오 |
| `seconds` | **string** | No | `"8"` | `"4"` / `"6"` / `"8"`. **필드는 `seconds`이며, `duration`가 아닙니다** (`duration`로 지정하면 조용히 무시되며 4초로 대체됩니다). **1080p/4k는 `"8"`로 설정해야 합니다** |
| `size` | string | No | `1280x720` | 출력 픽셀 |
| `resolution` | string | No | `720p` | `720p` / `1080p` / `4k` |
| `aspectRatio` | string | No | `16:9` | `16:9` (가로) / `9:16` (세로) |
| `seed` | int | No | — | 랜덤 시드(multipart 폼 필드이며, 문자열로 인코딩된 숫자도 괜찮습니다) |

<Tip>
  **JSON 모드와의 필드명 차이**:

  * JSON 모드에서는 `metadata.*` 아래에 중첩됩니다(예: `metadata.resolution`)
  * **Multipart 모드**에서는 폼 필드로 평면화됩니다(`resolution` / `aspectRatio` / `seed`를 직접 사용)
  * 위의 코드 샘플은 이미 multipart 규칙을 사용합니다
</Tip>

<Warning>
  **흔한 실수**:

  * `input_reference`를 JSON 본문 안의 Base64 문자열로 보내는 경우 — multipart 파일 필드를 사용해야 합니다
  * 필드명을 `image` / `reference` / `input_image`로 지정하는 경우 — 반드시 `input_reference`여야 합니다
  * 이미지를 2장 보내는 경우 — 서버는 첫 번째만 유지하고 두 번째는 조용히 버립니다
  * 원격 URL(`https://cdn.../img.png`)을 보내는 경우 — 허용되지 않으며, 파일 또는 Base64를 사용해야 합니다
</Warning>

## 응답 형식

응답 구조는 [텍스트-동영상](/ko/api-capabilities/veo-3-1-official/text-to-video#response-format)과 동일합니다: 1단계는 `task_id` + `status: "queued"`을 반환하고, 2단계 폴링은 `status` + 대략적인 `progress`을 반환하며, 3단계는 `/content`에서 MP4 바이너리를 다운로드합니다.

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

<Warning>
  **⚠️ 응답 필드 주의사항**

  * 작업 ID는 `id`에서 가져옵니다(제출 응답에는 동일한 값을 가진 `task_id`이 포함될 수도 있지만, 폴링 응답에는 `id`만 포함됩니다)
  * 기준 소스(source of truth)로 `GET /v1/videos/{task_id}/content`에서 다운로드하십시오. 완료 응답에는 약 24시간 동안 유효한 `video_url`이 포함될 **수도 있으나**, 모든 작업에서 보장되는 것은 아닙니다
  * `progress`은 선형적으로 증가하지 않고 몇 가지 고정된 단계 사이에서만 건너뜁니다
  * `/content`은 `status`이(가) `completed`(으)로 전환된 직후 가끔 400을 반환합니다. 4초 후 다시 시도하십시오
  * **이미지-동영상 작업은 일반적으로 동급의 텍스트-동영상 작업보다 10–30% 더 오래 걸립니다**(추가 이미지 인코딩 단계 포함)
</Warning>

<Info>
  이 엔드포인트는 비동기 작업 진입점입니다. **과금은 작업이 `completed`에 도달할 때 모델 이름별로 요청당 청구됩니다**(`input_reference` 제공 여부와 무관하며, fast \$0.3 / standard \$1.2). POST 제출, 폴링 및 다운로드 자체는 **과금되지 않으며**, 실패한 작업 역시 **과금되지 않습니다**.
</Info>


## OpenAPI

````yaml api-reference/veo-3-1-official-image-to-video-openapi-en.yaml POST /v1/videos
openapi: 3.1.0
info:
  title: VEO 3.1 Official Image-to-Video API
  description: >
    Google Veo 3.1 image-to-video endpoint (Official Relay channel,
    multipart/form-data upload of `input_reference`).


    - **Only 1 reference image supported**; field name is fixed as
    `input_reference`; multi-image submissions keep only the first

    - Accepted formats: `image/jpeg` / `image/png` / `image/webp`

    - **Remote URLs not accepted** — must be file upload or Base64

    - The duration field is named `seconds` (not `duration`); it must be a
    string `"4"` / `"6"` / `"8"`; 1080p/4k must be `"8"`

    - Same per-request price as text-to-video (per model name); image upload
    does not add cost

    - **Async task endpoint**: this endpoint only submits the task; combine with
    `GET /v1/videos/{task_id}` to poll and `GET /v1/videos/{task_id}/content` to
    download

    - **Multipart mode flattens fields**: fields nested under `metadata.*` in
    JSON mode (e.g. `metadata.resolution`) become top-level form fields in
    multipart mode (`resolution`, `aspectRatio`, `seed`)

    - Google upstream has multi-reference / first-last-frame / video extension
    capabilities; **this Official channel does not yet expose them** — use the
    [VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview) `-fl` series for
    first/last frame


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
      summary: 'Image-to-video: submit a generation task from a reference image'
      description: >
        Submit a Veo 3.1 image-to-video task. The client must use
        multipart/form-data with 1 reference image file + text fields.


        - Required: `model`, `prompt`, `input_reference`

        - Optional: `seconds` (default `"8"`, the duration field — not
        `duration`), `size` / `resolution` / `aspectRatio` / `seed`

        - Response structure, polling, and download flow are identical to
        text-to-video

        - Typical render time is 10–30% longer than equivalent text-to-video
        (extra image encoding step)
      operationId: generateVeo31OfficialImageToVideo
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/Veo31ImageToVideoRequest'
            example:
              model: veo-3.1-fast-generate-preview
              prompt: >-
                Camera slowly rises from the base of the lighthouse to the top,
                dusk lighting, waves lapping the rocks
              seconds: '8'
              size: 1280x720
              resolution: 720p
              aspectRatio: '16:9'
      responses:
        '200':
          description: Task submitted; returns task_id and queued status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Veo31VideoTask'
        '400':
          description: >-
            Invalid parameter (seconds as number; field misnamed as duration;
            non-8-sec at 1080p/4k; unsupported image format; etc.)
        '401':
          description: Unauthorized - invalid API Key
        '413':
          description: Uploaded image too large
        '429':
          description: Rate limit or insufficient balance
        '500':
          description: Upstream gateway error; retry 1–2 times (failed tasks not billed)
      security:
        - bearerAuth: []
components:
  schemas:
    Veo31ImageToVideoRequest:
      type: object
      required:
        - model
        - prompt
        - input_reference
      properties:
        model:
          type: string
          description: |
            Model ID (per-request billing):
            - `veo-3.1-fast-generate-preview` — \$0.3/request
            - `veo-3.1-generate-preview` — \$1.2/request
          enum:
            - veo-3.1-fast-generate-preview
            - veo-3.1-generate-preview
          default: veo-3.1-fast-generate-preview
        prompt:
          type: string
          description: >
            Video generation prompt. **Focus on how the scene should animate**:
            camera motion, object action, lighting, audio atmosphere. **Do not
            pass `generateAudio`** — audio intent goes in the prompt.
          example: >-
            Camera slowly rises from the base of the lighthouse to the top, dusk
            lighting, waves lapping the rocks
        input_reference:
          type: string
          format: binary
          description: >
            Reference image file. **Field name is fixed as `input_reference`,
            only 1 image supported**.


            Accepted formats: `image/jpeg` / `image/png` / `image/webp`.
            **Remote URLs not accepted** — must be a file upload or Base64.
        seconds:
          type: string
          description: >
            Video length. **The field name is `seconds` (not `duration`)**, a
            **string enum**: `"4"` / `"6"` / `"8"`. Sending `duration` is
            silently ignored and falls back to the default 4 sec. **Must be
            `"8"` at 1080p / 4k**.
          enum:
            - '4'
            - '6'
            - '8'
          default: '8'
        size:
          type: string
          description: Output pixel dimensions; lower precedence than `resolution`
          enum:
            - 1280x720
            - 720x1280
            - 1920x1080
            - 1080x1920
            - 3840x2160
            - 2160x3840
          default: 1280x720
        resolution:
          type: string
          description: >-
            Resolution tier (multipart mode flattens this as a top-level form
            field; higher precedence than `size`)
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
          type: string
          description: >-
            Random seed (multipart form field; string-encoded number is fine).
            Fixed seed clusters outputs in style but does not byte-reproduce.
          example: '20260521'
        negativePrompt:
          type: string
          description: >-
            Negative prompt; recommended `"blurry, watermark, distorted, low
            quality"`
          example: blurry, watermark, distorted, low quality
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
            100**)
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
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        API Key from APIYI console (Default group + Pay-per-request or
        Pay-as-you-go Priority Token; pure Pay-as-you-go not supported)

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.