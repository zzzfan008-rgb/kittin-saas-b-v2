> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 동영상 생성 (알리바바 클라우드)

> 알리바바 클라우드 HappyHorse-1.1 동영상 생성 시리즈 완전 가이드: Text-to-Video / Image-to-Video / Reference-to-Video (최대 9개의 참조 이미지) / Video Edit, 통합 DashScope 비동기 엔드포인트, 고충실도 주체 보존.

## 개요

\*\*HappyHorse (快马)\*\*는 Alibaba의 동영상 생성 모델 시리즈로, **고충실도 동적 동영상 생성**에 중점을 둡니다. 텍스트 의미를 정밀하게 이해하고, 피사체를 안정적으로 유지하면서 부드럽고 자연스럽고 디테일이 풍부하며 고품질인 동영상을 출력합니다. APIYI는 **DashScope 통과 채널**을 통해 직접 연결되므로, 하나의 APIYI Key로 모든 HappyHorse 기능을 호출할 수 있습니다. 현재 플래그십 버전인 **HappyHorse-1.1**(Video Edit는 1.0입니다)은 네 가지 핵심 사용 사례를 포괄합니다:

| 사용 사례                  | 모델 ID                       | 입력                         | 출력                                    |
| ---------------------- | --------------------------- | -------------------------- | ------------------------------------- |
| **Text-to-Video**      | `happyhorse-1.1-t2v`        | 텍스트 prompt                 | 짧은 동영상                                |
| **Image-to-Video**     | `happyhorse-1.1-i2v`        | 첫 프레임 이미지 + prompt         | 정지 이미지를 생동감 있게 만듭니다(**오디오 기반 지원 없음**) |
| **Reference-to-Video** | `happyhorse-1.1-r2v`        | 최대 9개의 참조 이미지 + prompt     | 피사체와 장면을 고충실도로 보존한 동영상                |
| **Video Edit**         | `happyhorse-1.0-video-edit` | 동영상 + 최대 5개의 참조 이미지 + 지시사항 | 국소/전역 편집 동영상                          |

<Note>
  **🐎 핵심 포인트**: 네 가지 기능은 모두 동일한 비동기 엔드포인트와 동일한 요청 구조를 공유합니다. 즉, 사용 사례를 전환해도 `model` 필드만 변경하면 됩니다. HappyHorse는 “고충실도 동적 동영상”에 더 가깝고, Reference-to-Video는 **최대 9개의 참조 이미지**를 지원하며 Video Edit는 **최대 5개의 참조 이미지**를 지원해 피사체 일관성이 뛰어납니다. [Wan 시리즈](/ko/api-capabilities/wan/overview)와 동일한 엔드포인트를 사용하므로 직접 호환됩니다.
</Note>

<CardGroup cols={2}>
  <Card title="Text-to-Video API" icon="wand-sparkles" href="/ko/api-capabilities/happyhorse/text-to-video">
    `happyhorse-1.1-t2v`, 순수 텍스트 prompt에서 동영상을 생성합니다.
  </Card>

  <Card title="Image-to-Video API" icon="image" href="/ko/api-capabilities/happyhorse/image-to-video">
    `happyhorse-1.1-i2v`, 첫 프레임 이미지에서 동영상을 생성합니다(오디오 기반 아님).
  </Card>

  <Card title="Reference-to-Video API" icon="users" href="/ko/api-capabilities/happyhorse/reference-to-video">
    `happyhorse-1.1-r2v`, 피사체를 보존하기 위해 최대 9개의 참조 이미지를 사용합니다.
  </Card>

  <Card title="Video Edit API" icon="scissors" href="/ko/api-capabilities/happyhorse/video-edit">
    `happyhorse-1.0-video-edit`, 최대 5개의 참조 이미지를 사용해 동영상을 편집합니다.
  </Card>
</CardGroup>

## AI 에이전트가 통합을 수행하게 하십시오

<Note>
  Codex / Claude Code / Cursor로 빌드하는 경우 아래 프롬프트를 복사하여 에이전트에게 전달하십시오. 에이전트는 먼저 이 페이지의 일반 텍스트 버전을 가져오고(아무 docs URL 뒤에 `.md`를 붙이십시오), 그다음 프로젝트의 자체 스택에 맞춰 코드를 작성합니다 — 비동기 폴링, **왜 `/v1/videos`를 사용하면 안 되는지**, 누락된 `X-DashScope-Async` 오류와 정수 `duration` 규칙은 이미 요구사항에 반영되어 있습니다.
</Note>

<Prompt description="HappyHorse 텍스트-투-비디오, 이미지-투-비디오, 레퍼런스-투-비디오 및 비디오 편집을 통합하거나 문제를 해결할 코딩 에이전트를 사용하십시오. Codex, Claude Code, Cursor 및 유사한 도구에 복사하여 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 HappyHorse 동영상 생성(텍스트-투-비디오, 이미지-투-비디오, 레퍼런스-투-비디오, 비디오 편집)을 통합하거나 문제를 해결하십시오.

  코드를 건드리기 전에 문서를 읽으십시오: 이 페이지의 일반 텍스트 버전을 가져오려면 [https://docs.apiyi.com/en/api-capabilities/happyhorse/overview.md](https://docs.apiyi.com/en/api-capabilities/happyhorse/overview.md) 를 가져오십시오. 네 가지 기능 각각에는 자체 페이지(텍스트-투-비디오, 이미지-투-비디오, 레퍼런스-투-비디오, video-edit)가 있으며 — 모두 같은 `.md` 접미사를 사용합니다.

  요구사항:

  1. 엔드포인트와 비동기 헤더(**가장 먼저 막히기 쉬운 두 가지**): 제출은 `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`로 보내야 하며 **헤더 `X-DashScope-Async: enable`를 반드시 포함해야 합니다**. **절대 `/v1/videos`를 사용하지 마십시오** — 그 경로는 `media` 필드를 누락시키고 업스트림은 그다음 `[InvalidParameter] Field required: input.media`을 보고합니다. 폴링은 **다른 접두사**를 사용합니다: `GET /v1/tasks/{task_id}`, 그리고 `Authorization` 헤더가 필요합니다.

  2. 폴링과 상태: 작업 ID는 제출 응답의 \*\*`output.task_id`\*\*에 있습니다. 5초에서 10초마다 폴링하고 **절대로 3초보다 빠르게 하지 마십시오**. 그렇지 않으면 요청 제한에 걸립니다. 클라이언트에는 전체 20분 상한을 두십시오 — 720P 5초 클립은 보통 약 105\~115초가 걸리고, 1080P 또는 더 긴 동영상은 훨씬 더 오래 걸립니다. 폴링 응답에서 상태는 `submitted`, `in_progress`, `completed` 또는 `failed`이며, **성공은 `completed`입니다**. `progress` 값이 오랫동안 30퍼센트에 멈춰 있어도 정상입니다 — 업스트림이 거칠게 보고하기 때문입니다 — 따라서 멈춤으로 간주하지 마십시오. 작업 ID는 **24시간** 동안 유효합니다.

  3. 동영상 가져오기: 주소는 폴링 응답의 \*\*`result_url`\*\*에 있으며, 24시간 후 만료되는 OSS 서명 링크입니다. **서버 측에서 즉시 다운로드하여 자체 오브젝트 스토리지 또는 CDN에 다시 호스팅하십시오**. 장기 주소로 보관하지 마십시오. 다운로드할 때는 `Authorization` 헤더를 **보내지 마십시오** — 그렇게 하면 대신 403이 반환됩니다.

  4. 본문 형식과 타입: 본문은 DashScope의 중첩된 형식인 `{ model, input: { prompt, media[] }, parameters: { ... } }`이며, 평면 객체가 아닙니다. 두 가지 타입 함정이 있습니다. **`duration`는 반드시 정수 `5`여야 하며, 문자열 `"5"`가 되어서는 안 됩니다**, 그리고 **`resolution`는 대문자 `720P` 또는 `1080P`여야 합니다** — 이 모델에는 **480P 등급이 없습니다**.

  5. 모델 이름과 매개변수: 네 가지 모델은 `happyhorse-1.1-t2v`, `happyhorse-1.1-i2v`, `happyhorse-1.1-r2v` 및 `happyhorse-1.0-video-edit`입니다 — 편집 모델은 \*\*하이픈이 있는 `video-edit`\*\*이며, Wan의 `videoedit`와는 반대이므로 혼동하지 마십시오. `duration`는 2에서 15 사이의 정수이며 기본값은 5입니다. `resolution`의 기본값은 `720P`입니다. `prompt_extend`의 기본값은 `true`이며 켜 둔 상태로 두는 것이 가장 좋습니다. 주의할 두 가지가 있습니다. **HappyHorse 이미지-투-비디오에는 `driving_audio`를 지원하지 않습니다**(이는 Wan 전용 기능입니다). 따라서 보내도 아무 효과가 없습니다. 그리고 **비디오 편집은 소스 비디오에서 출력 길이를 가져오며 `duration`는 영향을 주지 않습니다**. 따라서 보통은 그냥 생략하면 됩니다.

  6. 미디어 입력: 이것들은 `input.media[]`에 있으며, 각 항목은 `{"type": ..., "url": ...}` 형태입니다. 여기서 `url`는 **공개적으로 GET 가능한 https 링크**여야 합니다(JPEG, PNG 또는 WEBP). 로컬 파일은 먼저 자체 오브젝트 스토리지에 업로드하십시오. 기능별 타입과 개수: 이미지-투-비디오는 정확히 1개의 `first_frame`가 필요합니다. 레퍼런스-투-비디오는 1~~9개의 `reference_image` 항목이 필요합니다. 비디오 편집은 1개의 `video`와 1~~5개의 `reference_image` 항목이 필요합니다. `media`를 생략하면 업스트림이 이미지-투-비디오 모델에는 이미지가 필요하다고 불평합니다.

  7. 과금과 멱등성: **과금은 초당이며 해상도별로 차등 적용됩니다**. 1080P가 720P보다 눈에 띄게 더 비쌉니다. 비디오 편집은 실제 출력 초수로 과금되며(소스 비디오를 따르며, `duration`를 따르지 않습니다). `failed`로 끝나는 작업은 **과금되지 않지만**, **같은 작업을 다시 제출하면 다시 과금됩니다** — 무작정 자동 재시도하지 말고 자체 멱등성을 구현하십시오. 오류는 두 단계로 나뉩니다. 제출 시 거부(`type`가 있는 HTTP 4xx/5xx, 예: `task_error` 또는 `parse_request_failed`)는 요청 본문이 잘못되었다는 뜻이므로 재시도하지 말고 수정하십시오. 실행 중 실패는 대괄호 접두사가 붙은 `failed` 작업의 `error.message`로 나타나며, 여기서 `[InvalidImageUrl]`는 일시적으로 접근할 수 없는 미디어 링크일 수 있으므로 재시도해 볼 가치가 있습니다. 반면 `[InvalidParameter]` 또는 민감한 단어 거부는 **재시도하면 안 됩니다**. 5xx 및 네트워크 오류에는 지수 백오프를 사용하십시오.

  8. 토큰 요구사항: 이 모델에는 `Wan&HappyHorse` 그룹을 포함하고 과금 모드가 **종량제 또는 PAYG-priority**인 token이 필요합니다 — **per-call token으로는 이 모델에 라우팅할 수 없습니다**.

  9. 키는 `APIYI_API_KEY` 환경 변수에서 읽으십시오. 절대 하드코딩하지 말고, 절대 git에 커밋하지 마십시오.

  10. 완료되면 실제로 텍스트-투-비디오 호출 1회와 이미지-투-비디오 호출 1회를 실행한 다음, 동영상과 그 두 호출의 비용을 보여 주십시오. 전체 흐름은 몇 분이 걸리므로, 제약된 실행 환경에서 실행한다면 명령 타임아웃을 600초보다 크게 올리거나 백그라운드에서 실행하십시오.
</Prompt>

<Accordion title="이 프롬프트가 막아 주는 문제">
  | 요구사항                            | 방지하는 함정                                                                                    |
  | ------------------------------- | ------------------------------------------------------------------------------------------ |
  | `/v1/videos`를 사용하지 마십시오         | 그 경로는 `media`를 조용히 누락시키고, 누락된 `input.media`에 대한 업스트림의 불만은 실제로는 잘못된 엔드포인트인데도 매개변수 버그처럼 보입니다 |
  | `X-DashScope-Async` 헤더          | 이것이 없으면 호출이 동기식으로 처리되어 즉시 거부됩니다                                                            |
  | 제출과 폴링의 접두사는 다릅니다               | 제출은 `/wan/api/v1/...` 아래에 있고 폴링은 `/v1/tasks/{task_id}`에 있습니다                               |
  | 모델 이름은 `video-edit`이며 하이픈이 있습니다 | Wan의 대응 항목은 하이픈 없는 `wan2.7-videoedit`입니다 — 두 계열을 함께 통합할 때 가장 쉽게 틀리는 부분입니다                  |
  | i2v에는 `driving_audio`가 없습니다     | 그 기능은 Wan 전용이므로 Wan 코드를 복사하면 아무 효과도 없는 필드를 보내게 됩니다                                         |
  | 재제출하면 다시 과금됩니다                  | 실패는 무료이지만, 무작정 재시도하면 실제 비용이 듭니다 — 자체 멱등성이 필요합니다                                            |
  | `Authorization` 없이 다운로드하십시오     | OSS 서명 링크에 인증 정보를 보내면 403이 반환되고, 링크는 24시간 후 만료됩니다                                          |
</Accordion>

## HappyHorse에 APIYI를 선택해야 하는 이유

<CardGroup cols={2}>
  <Card title="모든 기능을 위한 하나의 키" icon="key">
    Alibaba Cloud 가입도, 리전 설정도 필요하지 않습니다. 하나의 APIYI 키로 HappyHorse의 네 가지 기능과 [Wan 시리즈](/ko/api-capabilities/wan/overview)를 모두 호출할 수 있습니다.
  </Card>

  <Card title="직접 접속, VPN 불필요" icon="globe">
    `api.apiyi.com`에 직접 연결할 수 있으며, 국내 데이터센터와 가정용 브로드밴드에서 이용 가능합니다.
  </Card>

  <Card title="실패 시 과금 없음" icon="circle-check">
    `failed` 상태에 진입한 작업(접근할 수 없는 미디어 URL, 민감한 prompt 등)은 **과금되지 않으므로**, 안심하고 다시 시도하실 수 있습니다.
  </Card>

  <Card title="DashScope 프로토콜 패스스루" icon="plug">
    Wan 시리즈와 동일한 엔드포인트와 스키마를 사용합니다. 기존 Wan 코드는 `model` 이름만 바꾸면 HappyHorse를 호출할 수 있습니다.
  </Card>
</CardGroup>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="4-in-1 비동기 엔드포인트" icon="list-check">
    t2v / i2v / r2v / video-edit가 `POST /wan/api/v1/...video-synthesis`를 공유합니다; 제출 후에는 `task_id`를 반환하며, 그다음 폴링하여 다운로드합니다.
  </Card>

  <Card title="고충실도 피사체 보존" icon="target">
    모델은 “고충실도 동적 비디오” 스타일에 더 가깝게 작동하여, 움직임 전반에서 사람과 객체를 더 안정적으로 유지합니다.
  </Card>

  <Card title="최대 9개의 참조 이미지" icon="images">
    `happyhorse-1.1-r2v`는 공식적으로 최대 9개의 `reference_image` 항목을 지원하여, 다중 참조 시나리오에서 피사체 일관성을 더 높입니다.
  </Card>

  <Card title="다양한 해상도와 지속 시간" icon="expand">
    720P / 1080P 해상도, 2–15초의 정수 지속 시간, 그리고 짧은 prompt의 품질을 높이는 `prompt_extend` 스마트 재작성입니다.
  </Card>
</CardGroup>

## 지원 모델

| 모델 ID                       | 기능       | 필수 미디어 입력                           | 비고                            |
| --------------------------- | -------- | ----------------------------------- | ----------------------------- |
| `happyhorse-1.1-t2v`        | 텍스트-동영상  | 없음                                  | 순수 텍스트 생성                     |
| `happyhorse-1.1-i2v`        | 이미지-동영상  | `first_frame`                       | **지원하지 않습니다** `driving_audio` |
| `happyhorse-1.1-r2v`        | 레퍼런스-동영상 | `reference_image` (최대 9개)           | 다중 레퍼런스 주제 보존                 |
| `happyhorse-1.0-video-edit` | 동영상 편집   | `video` + `reference_image` (최대 5개) | 모델 이름에 **하이픈이 있습니다**          |

## ⚠️ 엔드포인트 선택 (가장 중요)

APIYI는 두 경로를 동시에 마운트하며, **DashScope 패스스루 엔드포인트만 모든 HappyHorse 기능에 대해 완전히 사용할 수 있습니다**:

| 경로                                                           | 프로토콜 스타일            | i2v / r2v 사용 가능 여부 | 결론                  |
| ------------------------------------------------------------ | ------------------- | ------------------ | ------------------- |
| `/v1/videos`                                                 | OpenAI 플랫 스타일       | ❌ 미디어 필드가 삭제됩니다    | **사용하지 마십시오**       |
| `/wan/api/v1/services/aigc/video-generation/video-synthesis` | DashScope 네이티브 패스스루 | ✅ 완전히 사용할 수 있습니다   | **항상 이 경로를 사용하십시오** |

<Warning>
  HappyHorse와 Wan은 동일한 패스스루 엔드포인트를 공유합니다. `/v1/videos`를 통해 동영상 작업을 제출하는 문서/예시가 보이면, **무시하십시오**. 모든 생성 요청은 `/wan/api/v1/...video-synthesis`를 통해 이루어지고, 모든 조회는 `/v1/tasks/{task_id}`를 통해 이루어집니다.
</Warning>

## 비동기 호출 흐름

전체 흐름은 비동기 방식이며, 세 단계로 진행됩니다: **작업 생성 → 상태 폴링 → 동영상 다운로드**.

<Steps>
  <Step title="작업 생성">
    `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`, 요청 헤더 `X-DashScope-Async: enable`와 함께 사용합니다. 즉시 `task_id`을 반환합니다.
  </Step>

  <Step title="상태 폴링">
    `GET /v1/tasks/{task_id}`(`Authorization`와 함께), 5\~10초마다(**3초 미만으로는 하지 않음**) 조회하며, `status`이 `completed`가 될 때까지 반복합니다.
  </Step>

  <Step title="동영상 다운로드">
    응답의 `result_url`에서 mp4를 직접 GET하며, `Authorization` 헤더는 사용하지 않습니다(서명된 OSS 직접 링크이므로 Auth를 포함하면 403이 발생합니다).
  </Step>
</Steps>

### 작업 상태 참고

| 상태            | 의미           | 다음 단계                                                                                  |
| ------------- | ------------ | -------------------------------------------------------------------------------------- |
| `submitted`   | 제출됨, 대기열에 있음 | 계속 폴링합니다                                                                               |
| `in_progress` | 생성 중         | 계속 폴링합니다(진행률이 30%에서 멈춘 것처럼 보이는 경우가 잦습니다 — 이는 업스트림의 상태 보고 단위가 거칠기 때문이며, 작업이 멈춘 것이 아닙니다) |
| `completed`   | 성공           | `result_url`에서 다운로드합니다                                                                 |
| `failed`      | 실패           | `error.message` / `fail_reason`를 확인합니다                                                 |

### 전체 Python 클라이언트

```python theme={null}
import json, time, urllib.request

BASE = "https://api.apiyi.com"
KEY  = "sk-your-api-key"   # Your APIYI Key

def post(path, body):
    h = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
         "X-DashScope-Async": "enable"}
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers=h, method="POST")
    return json.loads(urllib.request.urlopen(req).read())

def get(path):
    req = urllib.request.Request(BASE + path, headers={"Authorization": f"Bearer {KEY}"})
    return json.loads(urllib.request.urlopen(req).read())

# 1. Create task (switching use cases only changes model and media)
r = post("/wan/api/v1/services/aigc/video-generation/video-synthesis", {
    "model": "happyhorse-1.1-t2v",
    "input": {"prompt": "A cat running across a meadow, bright sunshine, camera following"},
    "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True, "watermark": True}
})
task_id = r["output"]["task_id"]
print("task_id:", task_id)

# 2. Poll (every 5-10 seconds)
while True:
    info = get(f"/v1/tasks/{task_id}")
    status = info["status"]
    print("status:", status, "progress:", info.get("progress"))
    if status == "completed":
        url = info["result_url"]
        break
    if status == "failed":
        raise RuntimeError(info.get("error") or info.get("fail_reason"))
    time.sleep(10)

# 3. Download (do NOT include Authorization! result_url is a signed OSS direct link)
urllib.request.urlretrieve(url, "out.mp4")
print("saved out.mp4")
```

## 주요 매개변수 설명

제출할 때 본문은 DashScope 중첩 구조를 사용합니다: `{ model, input: { prompt, media[] }, parameters: {...} }`.

### `media[]` 유형

| `type`            | 용도                                    | 적용 가능한 모델       |
| ----------------- | ------------------------------------- | --------------- |
| `first_frame`     | 첫 프레임 이미지(≤1)                         | i2v, r2v        |
| `reference_image` | 참조 이미지(r2v는 최대 9장, video-edit는 최대 5장) | r2v, video-edit |
| `video`           | 입력 동영상                                | video-edit      |

<Warning>
  HappyHorse의 i2v는 **`driving_audio`을 지원하지 않습니다**(audio-driven은 [Wan2.7-i2v](/ko/api-capabilities/wan/image-to-video)에만 있는 기능입니다). 립싱크 / 랩에는 Wan2.7을 사용하십시오.
</Warning>

### `parameters` 필드

| 필드              | 유형     | 값                | 비고                                |
| --------------- | ------ | ---------------- | --------------------------------- |
| `resolution`    | string | `720P` / `1080P` | 대문자 사용, 명시적으로 지정하는 것을 권장합니다       |
| `duration`      | int    | 2–15             | 초(정수)이며, 보통 5 / 10입니다             |
| `prompt_extend` | bool   | `true` / `false` | 스마트 프롬프트 재작성, **매우 권장됩니다 `true`** |
| `watermark`     | bool   | `true` / `false` | 오른쪽 아래 모서리의 “AI Generated” 워터마크   |
| `seed`          | int    | 0–2147483647     | 값을 고정하면 재현성이 향상됩니다                |

<Tip>
  `duration`는 문자열 `5`이 아니라 **정수** `"5"`여야 합니다. **대문자**로 `resolution`를 쓰는 `720P`이 더 안정적입니다.
</Tip>

## HappyHorse와 Wan 중 선택하는 방법

HappyHorse와 [Wan](/ko/api-capabilities/wan/overview)은 모두 동일한 엔드포인트와 스키마를 공유하는 Alibaba 동영상 모델입니다(`model` 이름만 바꾸면 서로 대체 가능하지만), 강조하는 점은 서로 다릅니다:

| 항목                    | HappyHorse-1.1                | Wan2.7                                 |
| --------------------- | ----------------------------- | -------------------------------------- |
| 오디오 기반 립싱크 (i2v)      | ❌ 지원되지 않습니다. i2v는 첫 프레임 전용입니다 | ✅ `wan2.7-i2v`는 `driving_audio`를 지원합니다 |
| Reference-to-Video 제한 | 참조 이미지 최대 9장                  | 참조 이미지 + 참조 동영상 합계 ≤5                  |
| Video Edit 참조 이미지     | ≤5                            | ≤5                                     |
| 스타일 중점                | 고충실도 동적 동영상, 안정적인 피사체         | 다중 피사체 상호작용, 음색 참조                     |

<Tip>
  **피사체 일관성을 유지하기 위해 여러 참조 이미지가 필요합니다** → `happyhorse-1.1-r2v`를 선택하십시오(최대 9장).
  **립싱크 / 랩 / 디지털 휴먼 보이스오버가 필요합니다** → [Wan2.7-i2v](/ko/api-capabilities/wan/image-to-video)를 선택하십시오(오디오 기반을 지원하는 유일한 모델입니다).
</Tip>

## 모범 사례

<Steps>
  <Step title="먼저 720P / 5초로 반복합니다">
    개발 단계에서는 저해상도의 짧은 동영상을 사용해 prompt와 참조 이미지를 빠르게 검증한 다음, 최종 확정 후 해상도와 길이를 높입니다.
  </Step>

  <Step title="prompt_extend를 항상 활성화합니다">
    `prompt_extend: true`는 짧은 prompt의 품질을 눈에 띄게 향상합니다.
  </Step>

  <Step title="5-10초마다 폴링합니다">
    3초 미만으로 줄이지 마십시오(요청 제한이 걸립니다). 각 HappyHorse 기능은 720P / 5초 기준으로 일반적으로 105–115초가 걸립니다.
  </Step>

  <Step title="안전장치로 20분의 클라이언트 타임아웃을 설정합니다">
    1080P 또는 긴 동영상은 훨씬 느립니다; 폴링 루프에 20분의 대체 타임아웃을 설정합니다.
  </Step>

  <Step title="result_url을 받으면 즉시 다운로드합니다">
    `result_url` 기본적으로 **24시간 후 만료되며**, 서명된 OSS 직접 링크이므로 다운로드할 때 Authorization 헤더를 **포함하지 마십시오**.
  </Step>
</Steps>

## 오류 코드와 재시도

| 출처                                | 특징                                                                                                                      | 처리                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **생성 단계(APIYI에서 거부됨)**            | HTTP 4xx/5xx, with `type` of `task_error` / `parse_request_failed` / `build_request_failed`                             | 본문을 수정한 뒤 다시 시도합니다(필드 타입 오류, 미디어 누락, 잘못된 엔드포인트)           |
| **실행 단계(상위 Alibaba Cloud에서 거부됨)** | Task `status=failed`, with `error.message` prefixed by a bracketed code like `[InvalidParameter]` / `[InvalidImageUrl]` | 대괄호로 된 힌트를 확인합니다. 일반적으로 접근할 수 없는 미디어 URL 또는 민감한 prompt입니다 |

<Info>
  **권장 클라이언트 동작**: HTTP 5xx / 네트워크 오류에는 지수 백오프 재시도를 사용합니다. HTTP 4xx는 재시도하지 말고 즉시 표출합니다. `failed` task with `[InvalidImageUrl]` is retryable, while `[InvalidParameter]` / 민감어 실패는 재시도할 수 없습니다.
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="HappyHorse와 Wan은 통합 방식에 차이가 있습니까?">
    **아니요.** 둘은 동일한 DashScope passthrough 엔드포인트, 동일한 요청 구조, 동일한 미디어 유형 이름 집합, 동일한 query 엔드포인트를 사용합니다. **전환하면 `model` 필드만 변경됩니다** (예: `wan2.7-t2v` → `happyhorse-1.1-t2v`); 본문 나머지는 동일하게 유지됩니다.
  </Accordion>

  <Accordion title="HappyHorse의 i2v는 왜 립싱크를 할 수 없습니까?">
    `happyhorse-1.1-i2v`는 `driving_audio`(오디오 기반) 필드를 지원하지 않으며, i2v는 `first_frame`만 허용합니다. 립싱크 / 랩 / 디지털 휴먼 보이스오버에는 [Wan2.7-i2v](/ko/api-capabilities/wan/image-to-video)를 사용하십시오.
  </Accordion>

  <Accordion title="happyhorse-1.1-r2v는 정말 기준 이미지를 9장까지 받을 수 있습니까?">
    예. 공식적으로 최대 9개의 `reference_image` 항목을 지원하며, `media` 배열에 넣으면 됩니다. 참조 이미지가 많을수록 대상 / 의상 / 장면의 일관성이 더 강해집니다.
  </Accordion>

  <Accordion title="/v1/videos를 통해 제출할 수 없는 이유는 무엇입니까?">
    `/v1/videos`는 i2v / r2v의 `media` 필드를 완전히 지원하지 않아 업스트림에서 `[InvalidParameter] Field required: input.media`를 반환하게 됩니다. **모든 생성 요청은 `/wan/api/v1/services/aigc/video-generation/video-synthesis`를 통해 처리되며**, 조회는 `/v1/tasks/{task_id}`를 통해 처리됩니다.
  </Accordion>

  <Accordion title="result_url을 다운로드할 때 403이 반환되면 어떻게 합니까?">
    `Authorization` 헤더를 제거하십시오. `result_url`는 이미 서명된 OSS 직접 링크이므로, 여기에 APIYI Key를 추가하면 OSS에서 거부합니다. `result_url`는 기본적으로 24시간 후 만료되므로 즉시 다운로드하십시오.
  </Accordion>

  <Accordion title="실패한 작업도 과금됩니까?">
    `status=failed`는 과금되지 않습니다. 하지만 같은 작업을 다시 제출하면 다시 과금되므로 멱등성을 처리하십시오.
  </Accordion>
</AccordionGroup>

## 그룹 설정

HappyHorse와 [Wan](/ko/api-capabilities/wan/overview) 시리즈는 **하나의 `Wan&HappyHorse` 그룹을 공유합니다** — 하나의 Token으로 두 시리즈를 모두 호출할 수 있습니다. 동영상 모델은 **초당** 과금되므로, Token이 성공적으로 라우팅되려면 두 가지 조건을 충족해야 합니다:

1. **과금 모델**: **Pay-as-you-go Priority** 또는 **Pay-as-you-go**를 선택합니다 — 동영상은 초당 과금되므로 **Pay-per-request Tokens는 라우팅할 수 없습니다**
2. **그룹**: `Wan&HappyHorse`를 포함하는 그룹을 선택합니다

<Frame caption="Create Token: set billing model to Pay-as-you-go Priority and group to Wan&HappyHorse (0.14x) to call every Wan2.7 and HappyHorse video model (the screenshot shows the group's former name Wan, since renamed to Wan&HappyHorse)">
  <img src="https://mintcdn.com/apiyillc/5-SttsT0c5VQwgVz/images/wan-token-group-setup-20260523.png?fit=max&auto=format&n=5-SttsT0c5VQwgVz&q=85&s=f46887cb88777eb34d70837983f1fc49" alt="Token 생성 대화상자: 과금 모델이 Pay-as-you-go Priority로 설정되어 있고, 그룹 드롭다운에 Wan&HappyHorse(요율 배수 0.14x)가 표시되며, 하나의 Token으로 Wan2.7과 HappyHorse를 모두 사용할 수 있습니다" width="1286" height="988" data-path="images/wan-token-group-setup-20260523.png" />
</Frame>

## 가격

### 기본 가격 = Alibaba 공식 가격의 98％입니다(이해하기 쉽습니다)

**HappyHorse 모델 가격은 APIYI 시스템에 내장되어 있습니다** — 수동 설정이 필요 없으며, 그룹 할인은 자동으로 적용됩니다. 콘솔에서 `Wan&HappyHorse` 그룹은 **0.14x** 요율을 표시하며, 이는 내장된 **RMB** 가격 단위로 표시됩니다. APIYI는 **USD**를 고정 1:7 환율로 과금하므로, 실효 환산은:

```
0.14 (RMB pricing unit) × 7 (fixed exchange rate) = 0.98
```

즉, \*\*기본 가격 = Alibaba 공식 가격의 98%\*\*입니다 — Alibaba에서 직접 구매하는 것보다 저렴하며, 별도의 해외 연동을 직접 구축할 필요가 없습니다.

> 환산: **USD 초당 가격 = 공식 RMB 가격 × 0.14** (즉, `× 0.98 ÷ 7`).

### 가격 세부사항(기본 가격, 초당 과금)

HappyHorse-1.1 text-to-video / image-to-video / reference-to-video는 동일한 가격이며, 두 단계인 `720P` / `1080P`입니다(480P는 지원되지 않습니다):

| 해상도     | 공식 가격  | 기본 /초     | 5초     | 10초    | 12초    |
| ------- | ------ | --------- | ------ | ------ | ------ |
| `720P`  | ¥0.9/s | \$0.126/s | \$0.63 | \$1.26 | \$1.51 |
| `1080P` | ¥1.6/s | \$0.224/s | \$1.12 | \$2.24 | \$2.69 |

<Info>
  * `happyhorse-1.0-video-edit` 출력 길이는 원본 동영상을 따르며, `duration`이 아니라 실제 출력 초 단위로 과금됩니다.
  * 표시된 가격은 \*\*기본(공식의 98%)\*\*이며, 최대 충전 보너스를 적용하면 실효 가격은 대략 표 값 **÷ 1.2**입니다(예: 1080P 5초 \$1.12 → 약 \$0.93).
</Info>

### 더 낮은 실효 가격을 위한 충전 보너스 누적

[top-up bonus program](/ko/faq/recharge-promotions)에 가입하면 적립된 잔액을 최대 약 1.2배까지 늘릴 수 있어 실효 가격을 더 낮출 수 있습니다:

```
0.98 ÷ 1.2 ≈ 0.816
```

따라서 대량 고객은 \*\*공식 가격의 약 81%\*\*까지 낮출 수 있습니다(0.98 ÷ 1.2 ≈ 0.816).

| 등급                        | 실효 가격(Alibaba 공식 대비) | 공식                   |
| ------------------------- | -------------------- | -------------------- |
| 기본                        | **98%**              | rate 0.14x × 고정 환율 7 |
| 충전 보너스 적용 시(대량 고객용 최고 등급) | **\~81.6%**          | 0.98 ÷ 1.2           |

<Info>
  * 과금 기준 = \*\*해상도 등급 × 지속 시간(초)\*\*이며, 실패한 작업은 과금되지 않습니다.
  * 1:7은 **고정 정산 환율**입니다(우대 환율이 아닙니다); 모든 USD 충전에 동일하게 적용됩니다.
  * 최고 보너스 등급과 적용 가능한 채널은 [충전 보너스](/ko/faq/recharge-promotions)를 참고하십시오. 최신 요율은 [콘솔](https://api.apiyi.com/token)이 기준입니다.
</Info>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Text-to-Video 플레이그라운드" icon="wand-sparkles" href="/ko/api-capabilities/happyhorse/text-to-video">
    `happyhorse-1.1-t2v` 온라인 디버깅
  </Card>

  <Card title="Image-to-Video 플레이그라운드" icon="image" href="/ko/api-capabilities/happyhorse/image-to-video">
    `happyhorse-1.1-i2v` 첫 프레임 생성
  </Card>

  <Card title="Reference-to-Video 플레이그라운드" icon="users" href="/ko/api-capabilities/happyhorse/reference-to-video">
    `happyhorse-1.1-r2v` 참조 이미지 최대 9장
  </Card>

  <Card title="Video Edit 플레이그라운드" icon="scissors" href="/ko/api-capabilities/happyhorse/video-edit">
    `happyhorse-1.0-video-edit` 의상 교체 / 배경 교체
  </Card>

  <Card title="Wan 시리즈" icon="video" href="/ko/api-capabilities/wan/overview">
    또한 Alibaba의 모델 선택 비교도 포함됩니다.
  </Card>
</CardGroup>

<Info>
  HappyHorse 시리즈는 APIYI DashScope 패스스루 채널을 통해 제공됩니다. 질문이나 제안이 있으시면 [APIYI 콘솔](https://api.apiyi.com)에 티켓을 제출해 주십시오.
</Info>
