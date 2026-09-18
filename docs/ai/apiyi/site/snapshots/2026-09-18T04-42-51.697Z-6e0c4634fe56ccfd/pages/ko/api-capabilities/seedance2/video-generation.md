> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 / 2.5 동영상 생성 API 레퍼런스

> 대화형 Playground를 포함한 Seedance 2.0 및 2.5 동영상 생성 API 레퍼런스입니다. 하나의 비동기 엔드포인트에서 텍스트-동영상, 첫+마지막/첫 프레임, 멀티모달 참조, 동영상 편집 및 확장을 지원하며, 전체 폴링 및 다운로드 코드를 제공합니다.

<Info>
  오른쪽의 플레이그라운드를 사용합니다. **Authorization**을 `Bearer sk-your-api-key`로 설정하고(Token에는 2.5 및 2.0 제품군에서 공유하는 `SeeDance2` 그룹이 필요합니다), `model` / `content`을 입력한 후 전송합니다. 성공적으로 제출하면 작업 `id`이 반환됩니다. 폴링 및 다운로드 흐름은 아래 코드 샘플에서 다룹니다.
</Info>

<Warning>
  **플레이그라운드에서 ‘응답을 받지 못함’ 오류가 표시되는 경우**: 이 엔드포인트는 비동기 작업 엔드포인트이므로 브라우저에서 전송을 클릭하면 해당 메시지가 표시될 수 있습니다. 브라우저의 교차 출처 안전성 검사가 응답을 차단한 것이며, **작업은 실제로 성공적으로 제출된 상태입니다**(아래 쿼리 엔드포인트 또는 콘솔 로그를 통해 확인할 수 있습니다). 또한 플레이그라운드는 작업 생성만 지원하며 동영상 폴링이나 다운로드는 지원하지 않습니다. 전체 생성 → 폴링 → 다운로드 흐름을 실행하려면 아래 **코드 샘플**(cURL / Python / Node.js)을 복사하여 실행합니다.
</Warning>

<Tip>
  이는 Seedance 2.0의 작업 생성 엔드포인트입니다. 텍스트-투-비디오, 첫 프레임+마지막 프레임/첫 프레임, 멀티모달 레퍼런스-투-비디오가 모두 이 엔드포인트를 공유하며, `content` 배열로 모드를 선택합니다. 모델 선택, 가격, 해상도/픽셀 표 및 자주 묻는 질문은 [Seedance 2.0 개요](/ko/api-capabilities/seedance2/overview)를 참조합니다.
</Tip>

<Warning>
  * 경로 접두사는 `/seedance/api/v3`입니다. **`/api` 세그먼트를 삭제하지 말고**, `/v1/videos`을 사용하지 않습니다.
  * Token에는 `SeeDance2` 그룹이 활성화되어 있어야 하며, 그렇지 않으면 ‘이 모델에 사용 가능한 채널이 없음’ 오류가 발생합니다. **2.5 및 2.0 제품군은 모두 `SeeDance2`을 사용하므로**, 하나의 Token으로 네 가지 모델 모두에 도달할 수 있습니다(`mini` / `fast`에는 할인된 `SD2Mini` / `SD2Fast`도 적용됩니다).
  * `generate_audio`의 기본값은 true입니다(출력에 사운드가 포함됩니다). 무음 동영상에는 `false`을 명시적으로 전달합니다.
  * Python requests에는 `"Accept-Encoding": "identity"` 헤더가 필요합니다. 이 헤더가 없으면 gzip 디코딩 오류, 잘린 비-JSON 본문(예: 선행 `{"`이 사라지고 `id":"cgt-xxx"}`만 수신됨) 또는 간헐적인 400 오류가 발생할 수 있습니다.
  * 성공 상태는 `succeeded`입니다(`completed`가 아님). 동영상 URL은 `content.video_url`에 있으며 **24시간 후 만료됩니다**.
</Warning>

## 코드 예제

<CodeGroup>
  ```bash cURL (텍스트-동영상) theme={null}
  curl -X POST "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "doubao-seedance-2-0-fast-260128",
      "content": [
        {"type": "text", "text": "Drone shot flying over an autumn valley, golden forests and a winding river, cinematic"}
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
      "generate_audio": false
    }'
  # Returns {"id":"cgt-2026xxxx-xxxxx"} — poll the query endpoint with this id
  ```

  ```python Python (전체 흐름: 생성 → 폴링 → 다운로드) theme={null}
  import time
  import requests

  BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
  HEADERS = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      # Required: the gateway's gzip header does not match the actual encoding.
      # Without this you may get gzip decode errors, a truncated non-JSON body
      # (e.g. id":"cgt-xxx"} with the leading {" lost), or intermittent 400s
      "Accept-Encoding": "identity",
  }

  # 1. Create the task
  body = {
      "model": "doubao-seedance-2-0-fast-260128",
      "content": [
          {"type": "text", "text": "Waves crashing on rocks at sunset, slow motion, serene mood"}
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
      # "generate_audio": False,  # defaults to True; uncomment for silent video
      # "seed": 12345,            # fix the seed for similar, reproducible results
  }
  task_id = requests.post(BASE, json=body, headers=HEADERS, timeout=60).json()["id"]
  print("task_id:", task_id)

  # 2. Poll until a terminal state (succeeded / failed / expired)
  while True:
      time.sleep(20)
      task = requests.get(f"{BASE}/{task_id}", headers=HEADERS, timeout=30).json()
      status = task.get("status")
      print("status:", status)
      if status in ("succeeded", "failed", "expired"):
          break

  # 3. Download the video (the URL expires in 24 h — copy it out immediately)
  if status == "succeeded":
      video_url = task["content"]["video_url"]   # note: under content, not top-level
      print("tokens:", task["usage"]["completion_tokens"])
      with requests.get(video_url, stream=True, timeout=300) as r:
          r.raise_for_status()
          with open(f"{task_id}.mp4", "wb") as f:
              for chunk in r.iter_content(chunk_size=1 << 20):
                  f.write(chunk)
      print(f"saved {task_id}.mp4")
  else:
      print("task did not succeed:", task.get("error"))
  ```

  ```python Python (첫+마지막 프레임 / 참조 모드) theme={null}
  # First + last frame: 2 images, roles required; mutually exclusive with reference mode
  body_first_last = {
      "model": "doubao-seedance-2-0-260128",
      "content": [
          {"type": "text", "text": "Smooth transition from the first frame to the last, slow camera move"},
          {"type": "image_url", "image_url": {"url": "https://example.com/first.jpg"},
           "role": "first_frame"},
          {"type": "image_url", "image_url": {"url": "https://example.com/last.jpg"},
           "role": "last_frame"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",   # match the first frame's ratio to avoid cropping
      "duration": 5,
  }

  # Multi-modal reference: 0-9 reference images + 0-3 reference videos + 0-3 reference audios
  # (at least 1 image or 1 video); can create / edit / extend videos
  body_reference = {
      "model": "doubao-seedance-2-0-260128",
      "content": [
          {"type": "text", "text": "Using the reference character and style, the character walks down a rainy street at night"},
          {"type": "image_url", "image_url": {"url": "https://example.com/character.png"},
           "role": "reference_image"},
          # {"type": "video_url", "video_url": {"url": "..."}, "role": "reference_video"},
          # {"type": "audio_url", "audio_url": {"url": "..."}, "role": "reference_audio"},
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
  }
  # Images also accept Base64 (data:image/png;base64,xxx) and platform asset IDs (asset://xxx)
  ```

  ```python Python (Seedance 2.5: 30초 클립 / 동영상 편집 / 동영상 확장) theme={null}
  # 2.5 shares the endpoint and request shape with 2.0 — only `model` changes.
  # The four bodies below are capabilities unique to 2.5.

  # 1. 30-second clip: 2.5 caps at 30 s (the 2.0 family caps at 15)
  body_30s = {
      "model": "doubao-seedance-2-5-260628",
      "content": [{"type": "text", "text": "Drone shot flying over an autumn valley, morning mist drifting through the trees, one continuous take"}],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 30,        # Do not omit: on 2.5 the default is -1 and the model picks its own length
  }

  # 2. Video editing: ratio must be adaptive, duration must be -1, source video 4-30 s
  body_edit = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          # The prompt needs an editing verb: add / remove / delete / change / replace
          {"type": "text", "text": "Add a few birds flying across @video1"},
          {"type": "video_url", "video_url": {"url": "https://example.com/source.mp4"},
           "role": "reference_video"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",                    # Required; a concrete ratio returns a synchronous 400
      "duration": -1,                         # Required; a concrete duration returns a synchronous 400
      "omni_reference_task_type": "edit",     # Declare it to validate at submission time
      "output_format": "mov",                 # Optional: mov is recommended for post (some players cannot open it)
  }

  # 3. Video extension: ratio must be adaptive
  body_extend = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          # The prompt needs an extension verb: extend / continue
          {"type": "text", "text": "Extend @video1 forward, camera keeps pushing in as the light fades"},
          {"type": "video_url", "video_url": {"url": "https://example.com/source.mp4"},
           "role": "reference_video"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",
      "omni_reference_task_type": "extend",
  }

  # 4. Audio-only reference: unique to 2.5; the 2.0 family requires an image or video alongside audio
  body_audio_only = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          {"type": "text", "text": "Abstract light and shadow pulsing to the rhythm of @audio1"},
          {"type": "audio_url", "audio_url": {"url": "https://example.com/track.mp3"},
           "role": "reference_audio"},
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
  }
  # Submission and polling are identical to the flow above.
  ```

  ```javascript Node.js (fetch) theme={null}
  const BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks";
  const HEADERS = {
    "Authorization": "Bearer sk-your-api-key",
    "Content-Type": "application/json",
  };

  // 1. Create the task
  const { id } = await fetch(BASE, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      model: "doubao-seedance-2-0-fast-260128",
      content: [{ type: "text", text: "A mountain lake reflecting the starry sky, time-lapse" }],
      resolution: "720p",
      ratio: "9:16",        // portrait costs the same as landscape
      duration: 5,
    }),
  }).then(r => r.json());
  console.log("task_id:", id);

  // 2. Poll until a terminal state
  let task;
  do {
    await new Promise(r => setTimeout(r, 20000));
    task = await fetch(`${BASE}/${id}`, { headers: HEADERS }).then(r => r.json());
    console.log("status:", task.status);
  } while (!["succeeded", "failed", "expired"].includes(task.status));

  // 3. The video link (expires in 24 h — re-host immediately)
  if (task.status === "succeeded") console.log(task.content.video_url);
  ```

  ```bash cURL (작업 폴링) theme={null}
  curl "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks/cgt-2026xxxx-xxxxx" \
    -H "Authorization: Bearer sk-your-api-key"
  ```
</CodeGroup>

## 매개변수 참조

| 매개변수                       | 유형  | 필수 | 기본값                         | 참고                                                                                                                                                                                                                                                       |
| -------------------------- | --- | -- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`                    | 문자열 | ✓  | —                           | `doubao-seedance-2-5-260628` (**2.5, 권장** — 1080p, 최대 30초) / `doubao-seedance-2-0-260128` (표준, 1080p) / `doubao-seedance-2-0-fast-260128` (빠름, 최대 720p) / `doubao-seedance-2-0-mini-260615` (미니/라이트, 최대 720p, 표준 가격의 약 절반). 일반 ID이며 `ep-` 접두사는 사용하지 않습니다 |
| `content`                  | 배열  | ✓  | —                           | 입력 배열 — 아래의 “생성 모드”를 참조하십시오                                                                                                                                                                                                                              |
| `resolution`               | 문자열 |    | `720p`                      | `480p` / `720p` / `1080p` (2.5 및 표준에서만 1080p 지원; 빠름 및 미니는 720p로 제한됨). **`4k`를 지원하는 모델은 없습니다**                                                                                                                                                            |
| `ratio`                    | 문자열 |    | `adaptive`                  | `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `21:9` / `adaptive`; 한 등급 내에서는 모든 비율의 비용이 동일합니다                                                                                                                                                                |
| `duration`                 | 정수  |    | 2.5에서는 `-1`, 2.0 제품군에서는 `5` | 2.5에서는 **4\~30초**, 2.0 제품군에서는 4\~15초의 정수 초입니다. `-1`을 사용하면 모델이 선택합니다(실제 출력에 따라 과금됨). **2.5의 기본값은 `-1`입니다** — 생략하면 모델이 길이를 선택하므로 지불 금액이 달라집니다                                                                                                              |
| `generate_audio`           | 불리언 |    | `true`                      | 동기화된 오디오(음성/SFX/음악, 모노)                                                                                                                                                                                                                                  |
| `watermark`                | 불리언 |    | `false`                     | AI 생성 워터마크를 추가합니다                                                                                                                                                                                                                                        |
| `seed`                     | 정수  |    | `-1`                        | \[-1, 2^32-1]; 동일한 시드는 유사하지만 동일하지는 않은 결과를 생성합니다                                                                                                                                                                                                          |
| `return_last_frame`        | 불리언 |    | `false`                     | 클립 연결에 사용할 워터마크 없는 마지막 프레임 PNG를 반환합니다                                                                                                                                                                                                                    |
| `execution_expires_after`  | 정수  |    | `172800`                    | 작업 만료 임계값(초), 범위 \[3600, 259200]                                                                                                                                                                                                                         |
| `output_format`            | 문자열 |    | `mp4`                       | **2.5 전용**: `mp4` (범용) 또는 `mov` (QuickTime, H.264 + yuv444p + PCM — 후반 작업에 더 높은 색상 충실도 제공; 일부 플레이어에서는 열 수 없음)                                                                                                                                            |
| `omni_reference_task_type` | 문자열 |    | `auto`                      | **2.5 전용**: `auto` / `edit` (동영상 편집) / `extend` (동영상 확장). 이를 명시하면 제약 조건 검사가 **제출 시점으로** 이동하므로, 몇 분 후 실패하는 작업 대신 즉시 400 오류를 받습니다                                                                                                                          |

<Warning>
  Seedance 2.5와 2.0 제품군은 모두 `frames` 또는 `camera_fixed`를 지원하지 않습니다 — 해당 매개변수는 Seedance 1.x의 매개변수이므로 무시되거나 거부됩니다.

  **2.5에만 적용되는 작업 유형 제약 조건**(위반 시 과금되지 않고 제출 시 `InvalidParameter.TaskTypeConstraint`이 반환됨):

  | 작업 유형                 | `ratio`             | `duration`                         |
  | --------------------- | ------------------- | ---------------------------------- |
  | 텍스트-동영상 / 참조-동영상      | 제한 없음               | 제한 없음                              |
  | 첫 프레임 / 첫 프레임+마지막 프레임 | **`adaptive`이어야 함** | 제한 없음                              |
  | 동영상 편집                | **`adaptive`이어야 함** | **`-1`이어야 하며**, 소스 동영상은 4\~30초여야 함 |
  | 동영상 확장                | **`adaptive`이어야 함** | 제한 없음                              |
</Warning>

### 생성 모드(콘텐츠 조합)

| 모드                  | 콘텐츠 항목                                                                                                                                    | 역할 값                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 텍스트-동영상             | 1 `text`                                                                                                                                  | —                                                          |
| 첫 프레임 + 마지막 프레임     | 선택적 텍스트 + 2 `image_url`                                                                                                                   | 필수: `first_frame` / `last_frame`                           |
| 첫 프레임               | 선택적 텍스트 + 1 `image_url`                                                                                                                   | `first_frame` 또는 생략                                        |
| 멀티모달 참조-동영상         | 텍스트 + 참조 에셋(2.5: 최대 30 `image_url` + 10 `video_url` + 10 `audio_url`; 2.0 제품군: 이미지 0~~9개 + 동영상 0~~3개 + 오디오 0\~3개, 이미지 1개 이상 또는 동영상 1개 이상) | `reference_image` / `reference_video` / `reference_audio`  |
| 동영상 편집 (**2.5 전용**) | 편집 동사가 포함된 텍스트 + 최소 1개의 `video_url`                                                                                                       | `reference_video`, `omni_reference_task_type: "edit"` 포함   |
| 동영상 확장 (**2.5 전용**) | 확장 동사가 포함된 텍스트 + 최소 1개의 `video_url`                                                                                                       | `reference_video`, `omni_reference_task_type: "extend"` 포함 |

세 가지 이미지 모드는 **서로 배타적입니다**. 이미지는 공개 URL, Base64(`data:image/png;base64,...`) 및 에셋 ID(`asset://...`)를 사용할 수 있습니다. 실제 사람 얼굴이 포함된 입력은 거부됩니다. 엔드투엔드 에셋 참조 코드(수집 → `asset://` → 생성 → 다운로드)는 [에셋 참조 가이드](/ko/api-capabilities/seedance2/asset-reference)를 참조하십시오.

**대용량 미디어를 인라인으로 삽입하면 작업 생성이 느려집니다.** Base64 페이로드를 업로드하거나 대용량 이미지 URL을 가져오는 데 걸리는 시간이 모두 제출 단계에 포함되므로, create-task 호출이 약 1초에서 수십 초까지 길어지거나 클라이언트 읽기 시간 초과가 발생할 수 있습니다. 요청에 이미지나 동영상이 포함된 경우 먼저 미디어를 수집하고 `asset://` 에셋 ID로 참조하십시오. [에셋 우선 워크플로](/ko/api-capabilities/seedance2/asset-first-workflow)를 참조하십시오.

**참조 한도는 생성 방식에 따라 다릅니다**: 2.5는 이미지 30개 + 동영상 10개 + 오디오 클립 10개를 허용하며, **오디오만 단독 참조로 사용할 수도 있습니다**. 2.0 제품군은 이미지 9개 + 동영상 3개 + 오디오 클립 3개를 허용하며, 오디오는 이미지 또는 동영상이 최소 1개 이상 포함된 상태로 전송해야 합니다.

**편집 및 확장은 prompt의 의도로 트리거됩니다** — `omni_reference_task_type`는 유효성 검사 시점만 앞당깁니다. prompt에서는 에셋을 전달한 순서에 따라 위치로 참조하십시오(`@video1`, `@image1`). 편집에는 add / remove / change / replace와 같은 동사가 필요하고, 확장에는 extend / continue가 필요합니다. 모델이 prompt에서 추론한 작업 유형이 선언한 작업 유형과 충돌하면 작업은 비동기적으로 `InvalidParameter.TaskTypeMismatch`와 함께 실패합니다.

## 응답 형식

생성 시 동영상이 아닌 작업 ID만 반환됩니다:

```json theme={null}
{ "id": "cgt-20260606160057-6bbjd" }
```

`id`를 받으면 `GET /seedance/api/v3/contents/generations/tasks/{id}`을 폴링하여 작업 상태를 확인합니다.

### 권장 폴링 주기

| 항목      | 권장 사항                          | 이유                                                                    |
| ------- | ------------------------------ | --------------------------------------------------------------------- |
| 첫 번째 확인 | 제출 후 **20–30초**                | 이보다 빠르면 `queued`가 반환되는 것이 보장되므로 낭비되는 요청입니다                            |
| 폴링 간격   | **10–20초**마다                   | 생성에는 수 분이 걸리는 작업이므로 1초 미만의 폴링은 이점이 없으며 요청 제한에 걸릴 수 있습니다               |
| 타임아웃    | 종료 상태 없이 **10분**이 지나면 비정상으로 처리 | 피크 시간대의 대기열에서는 15분으로 완화하거나 `execution_expires_after`를 최후의 안전장치로 사용합니다 |

대기열 시간을 포함한 종단 간 측정 지연 시간입니다. 2.0 계열의 720p에서는 5초 클립에 약 **90–140초**, 15초에는 **170초**가 걸립니다. 2.5에서는 720p/5초에 약 **150초**, 720p/30초에 **330초**, 1080p/5초에 **150초**가 걸립니다. 해상도가 높고 길이가 길수록 느려지며, 피크 시간대의 대기열로 인해 시간이 더 늘어납니다. 아래 코드 샘플에서는 고정된 20초 간격을 사용합니다. 충분히 적절하며 요청 횟수도 예측할 수 있습니다.

성공한 작업의 응답은 다음과 같습니다(테스트에서 사용한 실제 샘플).

```json theme={null}
{
  "id": "cgt-20260606160057-6bbjd",
  "model": "doubao-seedance-2-0-fast-260128",
  "status": "succeeded",
  "content": {
    "video_url": "https://ark-acg-cn-beijing.tos-cn-beijing.volces.com/....mp4?X-Tos-Expires=86400&..."
  },
  "usage": { "completion_tokens": 108900, "total_tokens": 108900 },
  "created_at": 1780732857,
  "updated_at": 1780732991,
  "seed": 97151,
  "resolution": "720p",
  "ratio": "16:9",
  "duration": 5,
  "framespersecond": 24,
  "generate_audio": true,
  "draft": false
}
```

<Warning>
  * 동영상 URL은 최상위 수준이 아닌 \*\*`content.video_url`\*\*에 있으며, **24시간 후 만료**되는 서명된 링크이므로 즉시 다운로드합니다
  * 상태 머신: `queued → running → succeeded / failed / expired`; 성공 상태는 \*\*`succeeded`\*\*입니다
  * 일반 GET으로 링크를 다운로드합니다. 서명된 URL에 **`Authorization` 헤더를 전송하지 마십시오**
</Warning>

<Info>
  `usage.completion_tokens`은 과금되는 token 수이며 `tokens ≈ duration × width × height × 24 / 1024`을 따릅니다(테스트에서 오차 범위 0.1% 이내). `duration: -1` 또는 `ratio: adaptive`를 사용하면 실제 길이와 비율이 응답의 `duration` / `ratio` 필드에 보고됩니다.
</Info>


## OpenAPI

````yaml api-reference/seedance2-video-openapi-en.yaml POST /seedance/api/v3/contents/generations/tasks
openapi: 3.1.0
info:
  title: Seedance 2.0 Video Generation API
  description: >
    ByteDance Seedance 2.0 video generation (official Volcengine Mainland China
    resource).


    Capabilities:

    - Text-to-video / image-to-video (first+last frame, first frame) /
    multi-modal reference-to-video (0-9 reference images + 0-3 reference videos
    + 0-3 reference audios, at least 1 image or 1 video)

    - Resolutions 480p / 720p / 1080p (fast model caps at 720p), 6 aspect ratios
    plus adaptive; all ratios in the same tier share the same pixel area and
    price

    - Duration 4-15 s (or -1 for model-chosen length), fixed 24 fps,
    synchronized audio ON by default (generate_audio defaults to true)

    - Async task flow: create returns a task id, poll GET
    /seedance/api/v3/contents/generations/tasks/{id} until succeeded, then
    download from content.video_url (expires in ~24 hours)


    Authentication: Bearer Token (Pay-as-you-go Priority billing model; the
    Token needs the matching group: SeeDance25 for 2.5, SeeDance2 for the 2.0
    family).

    Get your key from the APIYI console → Token management.
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /seedance/api/v3/contents/generations/tasks:
    post:
      tags:
        - Video Generation
      summary: Create a Seedance 2.0 video generation task
      description: >
        Async endpoint: returns a task `id` immediately — **not the video
        itself**.


        - Required: `model` + `content` (text only, text+images,
        text+images+video+audio, etc.)

        - The three image modes are mutually exclusive: first+last frame (2
        images, role required) / first frame (1 image) / multi-modal
        reference-to-video (0-9 images + 0-3 videos + 0-3 audios, at least 1
        image or 1 video, image role = reference_image)

        - Inputs containing real human faces are rejected; audio must be sent
        together with at least one image or video

        - `frames` / `camera_fixed` are NOT supported (Seedance 1.x only)

        - Billing is pre-charged on submit and settled on completion; rejected
        requests are not billed


        After creation, poll `GET
        /seedance/api/v3/contents/generations/tasks/{id}`.

        Status flow: `queued → running → succeeded / failed / expired`.

        On success, download the mp4 from `content.video_url` (expires in ~24
        hours).

        See the "Seedance 2.0 Overview" doc for details.
      operationId: createSeedance2VideoTaskEn
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Seedance2CreateTaskRequest'
            example:
              model: doubao-seedance-2-5-260628
              content:
                - type: text
                  text: >-
                    Drone shot flying over an autumn valley, golden forests and
                    a winding river, cinematic
              resolution: 720p
              ratio: '16:9'
              duration: 5
              generate_audio: false
      responses:
        '200':
          description: Task created. Returns the task ID for polling
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Seedance2TaskCreated'
              example:
                id: cgt-20260606160057-6bbjd
        '400':
          description: >-
            InvalidParameter — e.g. 1080p with the fast model, duration outside
            4-15, or an unsupported ratio. The error message names the offending
            parameter; not billed
        '401':
          description: Unauthorized - invalid API key
        '403':
          description: Content moderation rejection (real human faces, policy violations)
        '429':
          description: Rate limited or insufficient quota
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    Seedance2CreateTaskRequest:
      type: object
      required:
        - model
        - content
      properties:
        model:
          type: string
          description: >-
            Model ID (plain ID, no ep- prefix). 2.5 supports 1080p, 4-30 s, and
            up to 30 images + 10 videos + 10 audio clips as references; 2.0
            standard supports 1080p; fast and mini cap at 720p, with mini at
            about half the standard price. No model supports 4k
          enum:
            - doubao-seedance-2-5-260628
            - doubao-seedance-2-0-260128
            - doubao-seedance-2-0-fast-260128
            - doubao-seedance-2-0-mini-260615
          example: doubao-seedance-2-5-260628
        content:
          type: array
          description: >-
            Input array. Text-to-video: a single text item. Image-to-video: add
            image_url items (role: first_frame / last_frame). Multi-modal
            reference-to-video: image_url items (role: reference_image) plus
            optional video_url / audio_url. Reference limits: 2.5 allows 30
            images + 10 videos + 10 audio clips and audio may stand alone; the
            2.0 family allows 9 images + 3 videos + 3 audio clips and needs at
            least 1 image or 1 video. The three image modes are mutually
            exclusive
          items:
            type: object
            properties:
              type:
                type: string
                description: Content type
                enum:
                  - text
                  - image_url
                  - video_url
                  - audio_url
                example: text
              text:
                type: string
                description: >-
                  Prompt (required when type=text). Up to ~1000 English words;
                  put spoken lines in double quotes to improve generated
                  voice-over
                example: Waves crashing on rocks at sunset, slow motion, serene mood
              image_url:
                type: object
                description: >-
                  Image object (required when type=image_url). Accepts public
                  URL, Base64 (data:image/png;base64,...), or asset ID
                  (asset://...). Formats jpeg/png/webp/bmp/tiff/gif/heic/heif;
                  aspect ratio (0.4, 2.5); sides (300, 6000) px; under 30 MB
                  each. Real human faces are not allowed
                properties:
                  url:
                    type: string
                    description: Image URL / Base64 / asset:// ID
                    example: https://example.com/first.jpg
              video_url:
                type: object
                description: >-
                  Reference video object (required when type=video_url);
                  multi-modal reference mode only
                properties:
                  url:
                    type: string
                    description: Video URL
              audio_url:
                type: object
                description: >-
                  Reference audio object (required when type=audio_url).
                  wav/mp3, 2-15 s per clip, up to 3 clips and 15 s total; must
                  accompany at least one image or video
                properties:
                  url:
                    type: string
                    description: Audio URL
              role:
                type: string
                description: >-
                  Media role. Required for first+last frame
                  (first_frame/last_frame); optional for a single first frame;
                  reference media use reference_*
                enum:
                  - first_frame
                  - last_frame
                  - reference_image
                  - reference_video
                  - reference_audio
        resolution:
          type: string
          description: >-
            Resolution tier (defines pixel area — every ratio in a tier costs
            the same). 1080p is available on 2.5 and 2.0 standard only; fast and
            mini cap at 720p. No model supports 4k
          enum:
            - 480p
            - 720p
            - 1080p
          default: 720p
        ratio:
          type: string
          description: >-
            Aspect ratio. adaptive auto-fits the input (recommended for
            image-to-video to avoid cropping); the actual ratio is returned in
            the task's ratio field
          enum:
            - '16:9'
            - '4:3'
            - '1:1'
            - '3:4'
            - '9:16'
            - '21:9'
            - adaptive
          default: adaptive
        duration:
          type: integer
          description: >-
            Video length in whole seconds: 4-30 on 2.5, 4-15 on the 2.0 family;
            or -1 to let the model choose (billed by actual output). Cost scales
            linearly with duration. Note the default is -1 on 2.5 and 5 on the
            2.0 family
          default: 5
          example: 5
        generate_audio:
          type: boolean
          description: >-
            Generate synchronized audio (voice, SFX, background music; mono).
            Note it DEFAULTS TO TRUE — pass false explicitly for silent video
          default: true
        watermark:
          type: boolean
          description: Add an AI-generated watermark in the bottom-right corner
          default: false
        seed:
          type: integer
          description: >-
            Random seed, [-1, 2^32-1]. The same seed produces similar (not
            identical) results; -1 means random
          default: -1
        return_last_frame:
          type: boolean
          description: >-
            Return the last frame as a watermark-free png (same dimensions as
            the video) — chain it as the first frame of the next task to produce
            continuous multi-clip videos
          default: false
        execution_expires_after:
          type: integer
          description: >-
            Task expiry threshold in seconds; tasks exceeding it are marked
            expired. Range [3600, 259200]
          default: 172800
        output_format:
          type: string
          description: >-
            Output container, supported on doubao-seedance-2-5-260628 only. mov
            is a QuickTime container (H.264 + yuv444p + PCM) with better colour
            fidelity for post-production, but some players cannot open it
          enum:
            - mp4
            - mov
          default: mp4
        omni_reference_task_type:
          type: string
          description: >-
            Task type for omni-reference generation, supported on
            doubao-seedance-2-5-260628 only. Declaring edit or extend validates
            constraints up front: video editing requires ratio=adaptive and
            duration=-1, video extension requires ratio=adaptive; violations
            return InvalidParameter.TaskTypeConstraint at submission
          enum:
            - auto
            - edit
            - extend
          default: auto
    Seedance2TaskCreated:
      type: object
      description: >-
        Creation response. Poll GET
        /seedance/api/v3/contents/generations/tasks/{id}; on success the video
        URL is at content.video_url (expires in ~24 h) and billed tokens at
        usage.completion_tokens
      properties:
        id:
          type: string
          description: Video generation task ID (kept for 7 days)
          example: cgt-20260606160057-6bbjd
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        API key from the APIYI console (SeeDance25 group for 2.5, SeeDance2
        group for the 2.0 family)

````