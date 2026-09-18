> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan 동영상 생성 (Alibaba Cloud Tongyi Wanxiang)

> Alibaba Cloud Tongyi Wanxiang Wan2.7 동영상 생성 완전 가이드: text-to-video / image-to-video (오디오 드라이브 포함) / reference-to-video / 동영상 편집. 통합 DashScope 비동기 엔드포인트, 720P / 1080P, 2-15초 지속 시간.

## 개요

\*\*Wan (Tongyi Wanxiang)\*\*은 Alibaba Cloud의 동영상 생성 모델 시리즈입니다. APIYI는 **DashScope 패스스루 채널**을 통해 Alibaba Cloud Model Studio에 직접 연결되므로, `sk-`로 시작하는 단일 APIYI Key만 있으면 별도의 Alibaba Cloud 계정 없이도 모든 Wan 동영상 기능을 사용할 수 있습니다. 현재 주력 모델은 **Wan2.7**이며, 다음 네 가지 핵심 사용 사례를 지원합니다:

| 사용 사례          | 모델 ID              | 입력                           | 출력                                           |
| -------------- | ------------------ | ---------------------------- | -------------------------------------------- |
| **텍스트-투-비디오**  | `wan2.7-t2v`       | 텍스트 prompt                   | 5-15초짜리 짧은 동영상                               |
| **이미지-투-비디오**  | `wan2.7-i2v`       | 첫 프레임 + prompt(선택적 구동 오디오)   | 정적인 이미지를 생동감 있게 구현하며, 오디오를 추가해 립싱크 / 랩을 지원   |
| **레퍼런스-투-비디오** | `wan2.7-r2v`       | 1-5개의 레퍼런스 이미지/비디오 + prompt  | 레퍼런스 대상의 특징을 유지한 단일 또는 다중 인물 동영상, 음성 레퍼런스 포함 |
| **비디오 편집**     | `wan2.7-videoedit` | 동영상 + 1-5개의 레퍼런스 이미지 + 편집 지시 | 편집된 동영상: 의상 교체, 배경 교체 등                      |

<Note>
  **🎬 핵심 강조**: 네 가지 기능은 모두 동일한 비동기 엔드포인트와 동일한 요청 구조를 사용합니다. **`model` 필드만 바꾸어 사용 사례를 전환할 수 있습니다.** 720P / 1080P 해상도와 2-15초 정수 길이를 기본 지원하며, `wan2.7-i2v`은 립싱크를 위한 구동 오디오도 지원합니다. 숏폼 동영상 제작, 이커머스 소재, 디지털 휴먼 내레이션, 크리에이티브 마케팅에 적합합니다.
</Note>

<CardGroup cols={2}>
  <Card title="텍스트-투-비디오 API" icon="wand-sparkles" href="/ko/api-capabilities/wan/text-to-video">
    `wan2.7-t2v` 순수한 텍스트 prompt만으로 동영상을 생성하며, 가장 간단한 진입점입니다.
  </Card>

  <Card title="이미지-투-비디오 API" icon="image" href="/ko/api-capabilities/wan/image-to-video">
    `wan2.7-i2v` 첫 프레임 + 선택적 구동 오디오를 사용해 립싱크 / 랩을 지원합니다.
  </Card>

  <Card title="레퍼런스-투-비디오 API" icon="users" href="/ko/api-capabilities/wan/reference-to-video">
    `wan2.7-r2v` 레퍼런스 이미지/비디오의 피사체 특징을 유지하며, 음성 레퍼런스를 지원합니다.
  </Card>

  <Card title="비디오 편집 API" icon="scissors" href="/ko/api-capabilities/wan/video-edit">
    `wan2.7-videoedit` 레퍼런스 이미지로 동영상을 편집합니다: 의상 교체, 배경 교체 등.
  </Card>

  <Card title="시각 API 테스트" icon="flask-conical" href="https://icover.ai/wan-official">
    iCover 시각 테스트 도구에서 이 엔드포인트를 직접 디버깅할 수 있습니다 — 코드가 필요하지 않습니다.
  </Card>

  <Card title="비동기 작업 조회 / 다운로드" icon="list-checks" href="https://api.apiyi.com/task">
    제출한 동영상 작업을 확인하고 APIYI 콘솔에서 동영상 링크를 다운로드할 수 있습니다 — API 외부의 조회 항목입니다.
  </Card>
</CardGroup>

## AI 에이전트에게 통합을 맡기십시오

<Note>
  Codex / Claude Code / Cursor로 빌드한다면 아래 프롬프트를 복사해 에이전트에게 전달하십시오. 에이전트는 먼저 이 페이지의 일반 텍스트 버전을 가져옵니다(아무 docs URL 뒤에 `.md`를 덧붙이십시오). 그런 다음 프로젝트의 자체 스택으로 코드를 작성합니다 — 비동기 폴링, **왜 `/v1/videos`를 사용하면 안 되는지**, 누락된 `X-DashScope-Async` 오류와 정수 `duration` 규칙은 이미 요구사항에 반영되어 있습니다.
</Note>

<Prompt description="코딩 에이전트가 Wan2.7 텍스트-투-비디오, 이미지-투-비디오, 레퍼런스-투-비디오 및 동영상 편집을 통합하거나 문제를 해결하게 하십시오. Codex, Claude Code, Cursor 및 유사 도구에 복사해 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 Wan2.7 동영상 생성(텍스트-투-비디오, 이미지-투-비디오, 레퍼런스-투-비디오, 동영상 편집)을 통합하거나 문제를 해결하십시오.

  코드를 건드리기 전에 문서를 읽으십시오: 이 페이지의 일반 텍스트 버전을 가져오려면 [https://docs.apiyi.com/en/api-capabilities/wan/overview.md](https://docs.apiyi.com/en/api-capabilities/wan/overview.md) 를 조회하십시오. 네 가지 기능 각각에는 별도 페이지가 있습니다(텍스트-투-비디오, 이미지-투-비디오, 레퍼런스-투-비디오, 동영상 편집) — 모두 같은 `.md` 접미사를 사용합니다.

  요구사항:

  1. 엔드포인트와 비동기 헤더(**즉시 막힐 가능성이 가장 높은 두 가지**): 제출은 `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`로 보내야 하며 **반드시 `X-DashScope-Async: enable` 헤더를 포함해야** 합니다. 그렇지 않으면 업스트림이 `current user api does not support synchronous calls`를 응답합니다. **절대 `/v1/videos`를 사용하지 마십시오** — 그 경로는 `media` 필드를 누락시키고, 업스트림은 그 결과 `[InvalidParameter] Field required: input.media`를 보고합니다. 폴링에는 **다른 접두사**인 `GET /v1/tasks/{task_id}`를 사용합니다(폴링할 때는 비동기 헤더가 필요하지 않습니다).

  2. 폴링 및 상태: 제출 응답의 \*\*`output.task_id`\*\*에 작업 ID가 있습니다. 5\~10초마다 폴링하고 **절대 3초보다 빠르게 폴링하지 마십시오**, 그렇지 않으면 요청 제한에 걸립니다. 클라이언트에는 전체 20분 상한을 두십시오. 상태는 `submitted`, `in_progress`, `completed` 및 `failed`이며, **성공은 `completed`입니다**. `progress` 값이 오랫동안 30퍼센트에 멈춰 있는 것은 정상입니다 — 업스트림은 0, 10, 30, 100만 보고하므로 이를 멈춤으로 처리하지 마십시오. 작업 ID 자체는 **24시간** 동안만 조회할 수 있으며, 이후에는 `UNKNOWN`를 받습니다.

  3. 동영상 가져오기: 주소는 최상위 \*\*`result_url`\*\*이며, 24시간 후 만료되는 Aliyun OSS 서명 링크입니다. **서버 측에서 즉시 다운로드해 자체 오브젝트 스토리지나 CDN에 재호스팅하십시오**. 장기 주소로 그대로 보관해서는 안 됩니다. 다운로드할 때 **`Authorization` 헤더를 보내지 마십시오** — 그렇게 하면 `SignatureDoesNotMatch`와 함께 403이 반환됩니다.

  4. 본문 형태와 타입: 본문은 DashScope의 중첩 형식인 `{ model, input: { prompt, media[] }, parameters: { ... } }`이며, 평면 객체가 아닙니다. 두 가지 타입 함정이 있습니다: **`duration`는 문자열 `"5"`가 아니라 정수 `5`여야 합니다**(그렇지 않으면 `cannot unmarshal string into Go struct field ... of type int`가 발생합니다), 그리고 **`resolution`는 대문자 `720P` 또는 `1080P`여야 합니다** — 이 모델에는 **480P 티어가 없습니다**.

  5. 핵심 매개변수: `duration`는 2\~15 사이의 정수이며, 기본값은 5입니다(그리고 **레퍼런스 동영상이 있을 때는 10을 초과하면 안 됩니다**). `ratio`는 `16:9`, `9:16`, `1:1`, `4:3` 또는 `3:4` 중 하나이며, 기본값은 `16:9`입니다. 하지만 **첫 프레임 이미지가 제공되면 `ratio`는 자동으로 무시됩니다**. `prompt_extend`의 기본값은 `true`이며, 켜두는 것을 강력히 권장합니다. **`wan2.7-r2v`는 기본적으로 `resolution`가 `1080P`이며 `720P`가 아니라는 점에 유의하십시오** — 그리고 과금이 해상도별 티어로 나뉘므로, 이를 암시적으로 두면 더 비싼 티어가 조용히 선택되므로 항상 명시적으로 설정하십시오. `wan2.7-videoedit`의 경우 출력 길이는 원본 동영상을 따르고 `duration`는 효과가 없습니다(또한 모델 이름에는 **`videoedit`에 하이픈이 없다는 점**에 유의하십시오 — `video-edit`라고 쓰지 마십시오).

  6. 미디어 입력: 이것들은 `input.media[]`에 있으며, 각 항목은 `{"type": ..., "url": ...}` 형태입니다. 문서화된 계약에 따르면 `url`는 **공개적으로 GET 가능한 https 링크**여야 합니다. 기능별 유형과 개수는 다음과 같습니다: `first_frame`는 최대 1개(i2v와 r2v); r2v에서는 `reference_image`와 `reference_video`를 **합쳐도 최대 5개**; `driving_audio`는 **i2v에서만 지원**됩니다; 그리고 동영상 편집에는 1개의 `video`와 1\~5개의 `reference_image` 항목이 필요합니다. reference-to-video 프롬프트에서는 `media` 배열 순서를 따라 이미지 1, 이미지 2, 비디오 1, 비디오 2처럼 위치 기준으로 입력을 참조하고, 이미지와 비디오는 각각 따로 셉니다.

  7. 과금 및 멱등성: **과금은 초당이며 해상도별 티어가 적용됩니다**. 특히 1080P는 720P보다 훨씬 더 비쌉니다. `failed`으로 끝나는 작업은 **과금되지 않지만**, **같은 작업을 다시 제출하면 다시 과금됩니다** — 무작정 자동 재시도하지 말고 멱등성을 위해 비즈니스 ID와 `task_id`의 매핑을 유지하십시오. 오류는 두 단계로 발생합니다: 제출 단계에서 거절(HTTP 4xx/5xx와 함께 `type`, 예: `task_error` 또는 `parse_request_failed`)되면 요청 본문이 잘못된 것이므로 재시도하지 말고 수정하십시오. 실행 중 실패는 `failed` 작업으로 나타나며, 그 `error.message`에는 대괄호 접두사가 붙어 있습니다. 이때 `[InvalidImageUrl]`는 일시적으로 접근할 수 없는 미디어 링크일 수 있으므로 재시도할 가치가 있지만, `[InvalidParameter]` 또는 민감어 거절은 **절대 재시도하면 안 됩니다**. 5xx 및 네트워크 오류에는 지수 백오프(1초, 4초, 16초)를 사용하십시오.

  8. token 요구사항: 이 모델에는 `Wan&HappyHorse` 그룹을 포함하고 과금 방식이 **사용량 기반 또는 PAYG 우선**인 token이 필요합니다 — **호출당 token은 이 모델로 라우팅할 수 없으며** 사용 가능한 채널이 없다는 오류가 발생합니다.

  9. 키는 `APIYI_API_KEY` 환경 변수에서 읽으십시오. 하드코딩하지 마십시오. git에 커밋하지 마십시오.

  10. 완료되면 실제로 텍스트-투-비디오 호출 1회와 이미지-투-비디오 호출 1회를 실행한 뒤, 해당 동영상과 두 호출의 비용을 보여주십시오. 전체 흐름에 몇 분이 걸릴 수 있으므로, 제한된 실행 환경에서 실행한다면 명령 타임아웃을 600초보다 크게 늘리거나 백그라운드에서 실행하십시오.
</Prompt>

<Accordion title="이 프롬프트가 막아주는 문제">
  | 요구사항                       | 방지하는 함정                                                                               |
  | -------------------------- | ------------------------------------------------------------------------------------- |
  | `/v1/videos`를 절대 사용하지 않음   | 그 경로는 `media`를 조용히 누락시키며, 업스트림의 `input.media` 누락 경고는 실제로는 잘못된 엔드포인트인데도 매개변수 버그처럼 보입니다 |
  | `X-DashScope-Async` 헤더     | 이것이 없으면 호출이 동기식으로 처리되어 즉시 거절됩니다                                                       |
  | 제출과 폴링의 접두사가 다름            | 제출은 `/wan/api/v1/...` 아래에서 이뤄지고 폴링은 `/v1/tasks/{task_id}`에서 이뤄집니다                     |
  | `duration`는 문자열이 아니라 정수입니다 | `"5"`는 역직렬화에 실패하고, `resolution` 역시 대문자여야 합니다                                          |
  | `r2v`의 기본값은 1080P입니다       | 이를 암시적으로 두면 더 비싼 티어가 조용히 선택되어 초당 비용이 두 배가 됩니다                                         |
  | 다시 제출하면 다시 과금됩니다           | 실패는 무료지만 무작정 재시도하면 실제 비용이 발생하므로 — 자체 멱등성이 필요합니다                                       |
  | `Authorization` 없이 다운로드    | OSS 서명 링크에 인증을 보내면 대신 403이 반환됩니다                                                      |
</Accordion>

## Wan을 APIYI에서 사용하는 이유

<CardGroup cols={2}>
  <Card title="모든 기능을 위한 하나의 Key" icon="key">
    Alibaba Cloud 가입도, 리전 설정도, 환경 변수도 필요 없습니다. 하나의 APIYI Key로 네 가지 Wan2.7 기능과 [HappyHorse 시리즈](/ko/api-capabilities/happyhorse/overview)를 모두 호출할 수 있습니다.
  </Card>

  <Card title="직접 접속, VPN 불필요" icon="globe">
    `api.apiyi.com`에 바로 연결할 수 있으며, 중국 본토 데이터 센터와 가정용 네트워크 모두에서 접속 가능하고, Alibaba Cloud 리전 엔드포인트를 구성할 필요가 없습니다.
  </Card>

  <Card title="실패 시 과금 없음" icon="circle-check">
    `failed`로 끝나는 작업(접근할 수 없는 미디어 URL, 민감한 prompt, 상위 용량 부족 등)은 **과금되지 않으므로**, 자유롭게 재시도할 수 있습니다.
  </Card>

  <Card title="DashScope 프로토콜 패스스루" icon="plug">
    요청 본문은 Alibaba Cloud의 기본 DashScope 프로토콜과 1:1로 매핑되므로 공식 문서를 따라 마이그레이션할 수 있으며, 응답은 손쉬운 폴링을 위해 정규화됩니다.
  </Card>
</CardGroup>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="4-in-1 비동기 엔드포인트" icon="list-check">
    t2v / i2v / r2v / video-edit가 `POST /wan/api/v1/...video-synthesis`을 공유합니다. 제출하면 `task_id`를 받고, 폴링한 뒤 다운로드합니다. 간편한 일괄 관리가 가능합니다.
  </Card>

  <Card title="오디오 기반 립싱크" icon="volume-2">
    `wan2.7-i2v`는 `driving_audio`을 지원하여 정적인 인물 사진이 오디오의 입 모양과 리듬에 맞게 동기화됩니다. 랩 / 내레이션 / 디지털 휴먼에 적합합니다.
  </Card>

  <Card title="다중 대상 참조" icon="users">
    `wan2.7-r2v`는 참조 이미지 + 참조 동영상(총 5개까지)을 혼합하며, prompt에서 “image 1 / video 1”로 참조하고 음성 참조도 지원합니다.
  </Card>

  <Card title="다양한 해상도와 길이" icon="expand">
    720P / 1080P 해상도, 2-15초 정수 길이를 지원합니다. `prompt_extend` 스마트 재작성은 짧은 prompt의 품질을 더욱 향상합니다.
  </Card>
</CardGroup>

## 지원되는 모델

| 모델 ID              | 기능      | 필수 미디어 입력                                     | 비고                             |
| ------------------ | ------- | --------------------------------------------- | ------------------------------ |
| `wan2.7-t2v`       | 텍스트-동영상 | 없음                                            | 순수 텍스트 생성                      |
| `wan2.7-i2v`       | 이미지-동영상 | `first_frame` (+ 선택적 `driving_audio`)         | 오디오 드라이브를 지원하는 유일한 기능          |
| `wan2.7-r2v`       | 참조-동영상  | `reference_image` / `reference_video` (최대 5개) | `reference_voice` 음성 참조를 지원합니다 |
| `wan2.7-videoedit` | 동영상 편집  | `video` + `reference_image` (1-5)             | 편집 모델 이름에는 **하이픈이 없습니다**       |

<Warning>
  `wan2.7-videoedit`는 이미지를 사용하여 동영상을 편집하는 용도입니다. 별도의 `wan2.7-image-pro`는 **이미지** 모델이며(`/v1/images/generations`를 사용함) 이 동영상 엔드포인트의 범위 밖이므로 서로 혼동하지 마십시오. 레거시 Wan2.6 시리즈는 [기록 버전](/ko/api-capabilities/wan/historical-versions)을 참조하십시오.
</Warning>

## ⚠️ 엔드포인트 선택(가장 중요)

APIYI는 두 경로를 제공하지만, **DashScope 패스스루 엔드포인트만 Wan의 모든 기능을 완전히 지원합니다**:

| Path                                                         | 프로토콜 스타일            | i2v / r2v 사용 가능 여부 | 판정                |
| ------------------------------------------------------------ | ------------------- | ------------------ | ----------------- |
| `/v1/videos`                                                 | OpenAI 평면형 스타일      | ❌ 미디어 필드는 제거됩니다    | **사용하지 마십시오**     |
| `/wan/api/v1/services/aigc/video-generation/video-synthesis` | DashScope 네이티브 패스스루 | ✅ 완전 지원            | **항상 이것을 사용하십시오** |

<Warning>
  어떤 문서나 예시에서 Wan 동영상 작업을 `/v1/videos`를 통해 제출하라고 하더라도, **무시하십시오**. 그 경로의 i2v / r2v `media` 필드에 대한 적응은 불완전하며 상위 오류 `[InvalidParameter] Field required: input.media`를 유발합니다. 모든 Wan 동영상 생성 요청은 `/wan/api/v1/...video-synthesis`로 전송됩니다.
</Warning>

## 비동기 호출 흐름

전체 흐름은 세 가지 비동기 단계입니다: **작업 생성 → 상태 폴링 → 동영상 다운로드**.

<Steps>
  <Step title="작업을 생성합니다">
    `POST /wan/api/v1/services/aigc/video-generation/video-synthesis` 헤더 `X-DashScope-Async: enable`를 사용합니다. 즉시 `task_id`를 반환합니다.
  </Step>

  <Step title="상태를 폴링합니다">
    `GET /v1/tasks/{task_id}` (`Authorization` 포함), 5\~10초마다 한 번씩(**절대 3초 미만으로는 하지 마십시오**), `status`이 `completed`가 될 때까지 반복합니다.
  </Step>

  <Step title="동영상을 다운로드합니다">
    응답의 `result_url`에서 mp4를 직접 GET합니다. **`Authorization` 헤더를 보내지 마십시오**(OSS 서명된 직접 링크이므로 Auth를 추가하면 403이 발생합니다).
  </Step>
</Steps>

### 작업 상태 참조

`status`의 최상위 `GET /v1/tasks/{task_id}` 필드(APIYI에서 이미 정규화됨):

| 상태            | 의미        | 다음 단계                                                          |
| ------------- | --------- | -------------------------------------------------------------- |
| `submitted`   | 제출됨, 대기 중 | 계속 폴링                                                          |
| `in_progress` | 생성 중      | 계속 폴링(진행률이 자주 30%에서 멈춘 것처럼 보입니다. 이는 상류의 거친 보고 방식일 뿐, 멈춤이 아닙니다) |
| `completed`   | 성공        | `result_url`에서 다운로드                                            |
| `failed`      | 실패        | `error.message` / `fail_reason`을 확인                            |

### 전체 Python 클라이언트

```python theme={null}
import json, time, urllib.request

BASE = "https://api.apiyi.com"
KEY  = "sk-your-api-key"   # your APIYI Key

def post(path, body):
    h = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
         "X-DashScope-Async": "enable"}
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers=h, method="POST")
    return json.loads(urllib.request.urlopen(req).read())

def get(path):
    req = urllib.request.Request(BASE + path, headers={"Authorization": f"Bearer {KEY}"})
    return json.loads(urllib.request.urlopen(req).read())

# 1. Create the task (switch use cases by changing only model and media)
r = post("/wan/api/v1/services/aigc/video-generation/video-synthesis", {
    "model": "wan2.7-t2v",
    "input": {"prompt": "A lighthouse on the seashore at dusk, the camera slowly pushing in, waves gently lapping the rocks, seabirds calling"},
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

# 3. Download (do not send Authorization! result_url is an OSS signed direct link)
urllib.request.urlretrieve(url, "out.mp4")
print("saved out.mp4")
```

## 핵심 매개변수 설명

제출 시 본문은 DashScope의 중첩 구조를 사용합니다: `{ model, input: { prompt, media[] }, parameters: {...} }`.

### `input` 필드

| 필드                | 유형     | 필수 여부             | 비고                                                             |
| ----------------- | ------ | ----------------- | -------------------------------------------------------------- |
| `prompt`          | string | ✓                 | 자연어 설명; wan2.7-r2v는 미디어를 참조하기 위한 "image 1 / video 1" 마커를 지원합니다 |
| `negative_prompt` | string |                   | 네거티브 prompt, ≤500자                                             |
| `media`           | array  | i2v/r2v/edit에서 필요 | 미디어 자산 배열, 아래 참조                                               |

### `media[]` 유형

| `type`            | 목적                                  | 적용 가능한 모델      |
| ----------------- | ----------------------------------- | -------------- |
| `first_frame`     | 첫 프레임 이미지 (≤1)                      | i2v, r2v       |
| `reference_image` | 참조 이미지 (주체/장면 유지)                   | r2v, videoedit |
| `reference_video` | 참조 동영상 (주체/음성 참조)                   | r2v            |
| `driving_audio`   | 구동 오디오 (립싱크)                        | **i2v only**   |
| `video`           | 입력 동영상                              | videoedit      |
| `reference_voice` | 음성 참조 (reference\_image/video에 첨부됨) | r2v            |

각 미디어 객체에는 최소 `type` + `url`가 필요합니다. `url`는 GET으로 직접 가져올 수 있는 공개 https 링크여야 합니다(로컬 파일은 먼저 OSS / CDN에 업로드하십시오).

### `parameters` 필드

| 필드              | 유형     | 값                                       | 비고                                                    |
| --------------- | ------ | --------------------------------------- | ----------------------------------------------------- |
| `resolution`    | string | `720P` / `1080P`                        | 대문자로 지정하는 것이 좋습니다                                     |
| `ratio`         | string | `16:9` / `9:16` / `1:1` / `4:3` / `3:4` | 화면 비율; 첫 프레임이 제공되면 자동으로 무시됩니다                         |
| `duration`      | int    | 2-15                                    | 초(정수)이며, 일반적으로 5 / 10을 사용합니다. 참조 동영상이 포함되면 10으로 제한됩니다 |
| `prompt_extend` | bool   | `true` / `false`                        | 스마트 prompt 재작성, **`true`을 강력히 권장합니다**                 |
| `watermark`     | bool   | `true` / `false`                        | 오른쪽 아래 모서리의 “AI 생성됨” 워터마크                             |
| `seed`          | int    | 0-2147483647                            | 이를 고정하면 재현성이 향상됩니다                                    |

<Tip>
  `duration`은 **정수** `5`여야 하며, 문자열 `"5"`이 아니어야 합니다. 그렇지 않으면 `cannot unmarshal string into Go struct field ... of type int`가 발생합니다. `resolution`를 **대문자**로 쓰는 것(`720P`)이 더 안정적입니다.
</Tip>

## Wan과 HappyHorse 선택하기

Wan과 [HappyHorse](/ko/api-capabilities/happyhorse/overview)는 모두 Alibaba 동영상 모델이며 같은 endpoint와 schema를 공유합니다(`model` 이름만 바꾸면 교체할 수 있습니다). 다만 강점은 다릅니다:

| 항목              | Wan2.7                                | HappyHorse-1.1                           |
| --------------- | ------------------------------------- | ---------------------------------------- |
| 오디오 구동 립싱크(i2v) | ✅ `wan2.7-i2v` `driving_audio`를 지원합니다 | ❌ 지원하지 않으며, i2v는 첫 프레임만 사용합니다            |
| 참조-동영상 이미지 상한   | 참조 이미지 + 참조 동영상, 총 최대 5개              | 최대 9개의 참조 이미지                            |
| 동영상 편집 참조 이미지   | ≤5                                    | ≤5                                       |
| 대상 일관성 스타일      | 다중 대상 상호작용, 음성 참조                     | “동적인 영상의 충실한 재현”에 더 가깝고, 대상이 안정적으로 유지됩니다 |

<Tip>
  **립싱크 / 랩 / 디지털 휴먼 나레이션이 필요합니다** → `wan2.7-i2v`을 선택합니다(오디오 구동을 지원하는 유일한 모델입니다).
  **대상을 일관되게 유지하기 위해 많은 참조 이미지가 필요합니다** → [HappyHorse r2v (최대 9개 이미지)](/ko/api-capabilities/happyhorse/reference-to-video)를 고려합니다.
</Tip>

## 모범 사례

<Steps>
  <Step title="먼저 720P / 5초에서 반복합니다">
    개발 중에는 저해상도 짧은 클립으로 prompt와 카메라 방향을 빠르게 검증한 뒤, 최종 확정 후에는 720P / 1080P와 더 긴 길이로 확장하여 비용과 대기 시간을 줄입니다.
  </Step>

  <Step title="항상 prompt_extend을 활성화합니다">
    `prompt_extend: true`짧은 prompt의 품질을 분명히 향상시키며, 생성 시간은 몇 초만 추가로 듭니다.
  </Step>

  <Step title="5-10초마다 폴링합니다">
    3초보다 짧으면 안 됩니다(요청 제한이 걸립니다). 또한 긴 작업을 무기한으로 차단하지 마십시오. 720P / 5초는 일반적으로 70-140초가 걸리며, 1080P / 더 긴 클립은 5분을 넘길 수 있습니다.
  </Step>

  <Step title="최후 안전장치로 20분 클라이언트 타임아웃을 설정합니다">
    1080P 또는 10초를 넘는 클립은 눈에 띄게 더 느립니다. 폴링 루프에 20분의 최후 안전장치 타임아웃을 두십시오.
  </Step>

  <Step title="result_url을 받는 즉시 다운로드합니다">
    `result_url` 기본적으로 **24시간 후 만료**되며 OSS 서명된 직접 링크이므로, 다운로드할 때는 **Authorization 헤더를 보내지 마십시오**. 프로덕션에서는 항상 자체 OSS / CDN에 다시 저장하십시오.
  </Step>

  <Step title="제출을 멱등하게 만듭니다">
    실패한 작업은 과금되지 않지만, 같은 작업을 다시 제출하면 다시 과금됩니다. 앱 레이어에서 "business ID → task\_id" 매핑을 유지하여 우발적인 과금을 방지하십시오.
  </Step>
</Steps>

## 오류 코드 및 재시도

오류는 두 단계에서 발생하며 서로 다르게 처리됩니다:

| 출처                            | 시그니처                                                                                                       | 처리 방식                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **생성 단계(APIYI에서 거부됨)**        | HTTP 4xx/5xx, `type`는 `task_error` / `parse_request_failed` / `build_request_failed`입니다                    | 본문을 수정한 뒤 다시 시도하십시오(대개 잘못된 필드 유형, 누락된 미디어, 또는 잘못된 엔드포인트 때문입니다) |
| **실행 단계(상위 알리바바 클라우드에서 거부됨)** | 작업이 `status=failed`로 끝나고, 대괄호 안에 `[InvalidParameter]` / `[InvalidImageUrl]` 등으로 접두된 `error.message`가 표시됩니다 | 대괄호 안의 힌트를 읽으십시오. 대개 접근할 수 없는 미디어 URL 또는 민감한 프롬프트입니다           |

<Info>
  **권장 클라이언트 동작**: HTTP 5xx / 네트워크 오류에 대해 지수 백오프 재시도(1초 / 4초 / 16초)를 사용하십시오. HTTP 4xx는 재시도 없이 즉시 노출하십시오. `[InvalidImageUrl]`가 있는 `failed` 작업은 다시 시도할 수 있으며(일시적인 네트워크 문제일 수 있음), `[InvalidParameter]` / 민감한 단어는 재시도하면 안 됩니다.
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="왜 Wan 작업을 제출하는 데 /v1/videos를 사용할 수 없습니까?">
    `/v1/videos`는 Wan의 i2v / r2v를 불완전하게 지원하는 OpenAI 플랫 스타일 엔드포인트입니다. `media` 같은 미디어 필드는 누락되고, 상위 Alibaba Cloud는 `[InvalidParameter] Field required: input.media`를 반환합니다. **모든 Wan 동영상 생성 요청은 `/wan/api/v1/services/aigc/video-generation/video-synthesis`로 가며**, 조회는 항상 `/v1/tasks/{task_id}`로 갑니다.
  </Accordion>

  <Accordion title="X-DashScope-Async: enable 헤더는 무엇을 하나요? 필수입니까?">
    엔드포인트에 “이것은 비동기 작업이므로, task\_id를 즉시 반환하고 차단하지 마십시오.”라고 알려줍니다. **모든 생성 요청에 필수입니다**. 생략하면 `current user api does not support synchronous calls`가 반환됩니다. 조회 호출(GET)에는 이 헤더가 필요하지 않습니다.
  </Accordion>

  <Accordion title="왜 /wan/api/v1/tasks/{id} 대신 /v1/tasks/{id}에서 조회하나요?">
    APIYI는 모든 동영상 작업 조회를 `/v1/tasks/{task_id}`로 표준화합니다. 작업을 생성할 때 어떤 경로를 사용했든 이 하나의 엔드포인트로 조회하며, 응답의 최상위 `status` / `progress` / `result_url` / `error` 필드는 일관됩니다.
  </Accordion>

  <Accordion title="result_url 다운로드가 403 / SignatureDoesNotMatch를 반환합니다. 이제 어떻게 하나요?">
    `Authorization` 헤더를 제거하십시오. `result_url`는 이미 Alibaba Cloud OSS의 사전 서명된 직접 링크이므로, APIYI Key를 추가하면 OSS가 이를 거부합니다.

    ```bash theme={null}
    curl -L -o out.mp4 "$RESULT_URL"          # ✅ correct
    curl -L -H "Authorization: Bearer $KEY" -o out.mp4 "$RESULT_URL"   # ❌ wrong
    ```
  </Accordion>

  <Accordion title="result_url이 만료되면 어떻게 하나요?">
    링크는 기본적으로 **24시간** 동안 유효합니다. 만료 후에는 `/v1/tasks/{task_id}`를 다시 GET하면 보통 새 `result_url`를 받지만, task\_id 자체의 조회 유효 기간도 24시간입니다(그 이후에는 `UNKNOWN`를 반환합니다). 장기 보관이 필요하면 가능한 한 빨리 자체 저장소로 다운로드하십시오.
  </Accordion>

  <Accordion title="진행률이 30%에서 멈췄는데, 중단된 건가요?">
    아닙니다. 상위 Alibaba Cloud가 보고하는 진행률은 거칠게 구분됩니다(0% / 10% / 30% / 100% 구간만 있음). **`status`가 여전히 `in_progress`인 한 기다리십시오**. 보통 30%에서 100%로 바로 뛰어오릅니다.
  </Accordion>

  <Accordion title="한 Key로 동시에 몇 개의 작업을 실행할 수 있나요?">
    실제로는 요청 제한에 걸리지 않고 한 번에 4~~8개 작업을 제출할 수 있습니다. 운영 환경에서는 동시에 활성화된 작업을 ≤10으로 유지하십시오. 그 이상은 대기열로 들어갑니다. 조회 API의 기본 RPS는 꽤 높지만, 5~~10초 폴링 간격을 여전히 권장합니다.
  </Accordion>

  <Accordion title="실패한 작업도 과금되나요?">
    `status=failed`는 과금되지 않습니다. 다만 같은 작업을 다시 제출하면 다시 과금되므로 멱등하게 만드십시오. 테스트 중에는 `prompt_extend`을 끄고 720P / 5초 / 짧은 prompt를 사용해 단가를 낮출 수 있습니다.
  </Accordion>

  <Accordion title="wan2.6도 아직 사용할 수 있나요?">
    네. Wan2.6 시리즈(`wan2.6-r2v-flash` 포함)는 여전히 호출 가능 목록에 있으며, Wan2.7과 동일한 프로토콜을 사용합니다. `model` 이름만 바꾸면 됩니다. [이전 버전](/ko/api-capabilities/wan/historical-versions)을 참조하십시오.
  </Accordion>
</AccordionGroup>

## 그룹 설정

Wan 및 [HappyHorse](/ko/api-capabilities/happyhorse/overview) 시리즈는 **하나의 `Wan&HappyHorse` 그룹을 공유합니다** — 하나의 토큰으로 두 시리즈를 모두 호출할 수 있습니다. 동영상 모델은 **초당** 과금되므로, 토큰이 정상적으로 라우팅되려면 두 가지 조건을 충족해야 합니다:

1. **과금 모델**: **종량제 Priority** 또는 **종량제**를 선택합니다 — 동영상은 초당 과금되므로, **요청당 과금 토큰은 라우팅할 수 없습니다**
2. **그룹**: `Wan&HappyHorse`를 포함하는 그룹을 선택합니다

<Frame caption="Create Token: set billing model to Pay-as-you-go Priority and group to Wan&HappyHorse (0.14x) to call every Wan2.7 and HappyHorse video model (the screenshot shows the group's former name Wan, since renamed to Wan&HappyHorse)">
  <img src="https://mintcdn.com/apiyillc/5-SttsT0c5VQwgVz/images/wan-token-group-setup-20260523.png?fit=max&auto=format&n=5-SttsT0c5VQwgVz&q=85&s=f46887cb88777eb34d70837983f1fc49" alt="토큰 생성 대화상자: 과금 모델이 종량제 Priority로 설정되어 있고, 그룹 드롭다운에 Wan&HappyHorse(요율 0.14배)가 표시되며, 하나의 토큰으로 Wan2.7과 HappyHorse를 모두 사용할 수 있음" width="1286" height="988" data-path="images/wan-token-group-setup-20260523.png" />
</Frame>

## 가격

### 기본 가격 = Alibaba 공식 가격의 98％(이해하기 쉬움)

콘솔에서 `Wan&HappyHorse` 그룹은 **0.14x**의 요율을 표시하며, 이는 내장 **RMB** 가격 단위를 사용합니다. APIYI는 **USD**로 1:7의 고정 환율을 적용해 과금하므로, 실제 환산은 다음과 같습니다:

```
0.14 (RMB pricing unit) × 7 (fixed exchange rate) = 0.98
```

즉, \*\*기본 가격 = Alibaba 공식 가격의 98%\*\*입니다. Alibaba에서 직접 구매하는 것보다 저렴하며, 직접 구축해야 할 해외 연동도 없습니다.

> 환산: **초당 USD 가격 = 공식 RMB 가격 × 0.14**(즉, `× 0.98 ÷ 7`). 예를 들어, 1080P의 공식 가격이 ¥1.0/s이면 → \$0.14/s이며, 콘솔에 표시된 `0.14x`와 정확히 같습니다.

### 가격 상세(기본 가격, 초당 과금)

Wan2.7 텍스트-동영상 / 이미지-동영상 / 참조-동영상은 동일한 가격이며, 두 단계는 `720P` / `1080P`입니다(480P는 지원하지 않습니다):

| 해상도     | 공식 가격  | 기본 가격 /초  | 5초     | 10초    | 12초    |
| ------- | ------ | --------- | ------ | ------ | ------ |
| `720P`  | ¥0.6/s | \$0.084/s | \$0.42 | \$0.84 | \$1.01 |
| `1080P` | ¥1.0/s | \$0.14/s  | \$0.70 | \$1.40 | \$1.68 |

<Info>
  * `wan2.7-r2v`은 기본값이 `1080P`이며, 참조 미디어에 동영상이 포함된 경우 길이는 최대 10초로 제한됩니다.
  * `wan2.7-videoedit`(동영상 편집) 출력 길이는 원본 동영상을 따르며, `duration`가 아니라 실제 출력 초 단위로 과금됩니다.
  * 표시된 가격은 \*\*기본(공식 가격의 98%)\*\*이며, 최대 충전 보너스를 적용하면 실제 가격은 대략 표의 값 **÷ 1.2**입니다(예: 1080P 5초 \$0.70 → 약 \$0.58).
</Info>

### 더 낮은 실효 가격을 위한 누적 충전 보너스

[충전 보너스 프로그램](/ko/faq/recharge-promotions)에 가입하면 충전된 잔액이 최대 \~1.2x까지 늘어나 실효 가격을 더 낮출 수 있습니다:

```
0.98 ÷ 1.2 ≈ 0.816
```

따라서 대량 이용자는 \*\*공식 가격의 \~81.6%\*\*까지 낮출 수 있습니다.

| 등급                         | 실효 가격(Alibaba 공식 가격 대비) | 공식                 |
| -------------------------- | ----------------------- | ------------------ |
| 기본                         | **98%**                 | 요율 0.14x × 고정 환율 7 |
| 충전 보너스 적용 시(대량 이용자용 최대 등급) | **\~81.6%**             | 0.98 ÷ 1.2         |

<Info>
  * 과금 기준 = \*\*해상도 등급 × 길이(초)\*\*이며, 실패한 작업은 과금되지 않습니다.
  * 1:7은 **고정 정산 환율**이며(우대 환율이 아닙니다), 모든 USD 충전에 동일하게 적용됩니다.
  * 최고 보너스 등급과 적용 가능한 채널은 [충전 보너스](/ko/faq/recharge-promotions)를 참조하십시오. 최신 요율은 [콘솔](https://api.apiyi.com/token)이 기준입니다.
</Info>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Text-to-Video Playground" icon="wand-sparkles" href="/ko/api-capabilities/wan/text-to-video">
    `wan2.7-t2v` 실시간 디버깅 + 코드 샘플
  </Card>

  <Card title="Image-to-Video Playground" icon="image" href="/ko/api-capabilities/wan/image-to-video">
    `wan2.7-i2v` 첫 프레임 + 구동 오디오
  </Card>

  <Card title="Reference-to-Video Playground" icon="users" href="/ko/api-capabilities/wan/reference-to-video">
    `wan2.7-r2v` 다중 피사체 참조 + 음성
  </Card>

  <Card title="Video Edit Playground" icon="scissors" href="/ko/api-capabilities/wan/video-edit">
    `wan2.7-videoedit` 의상 / 배경 교체
  </Card>

  <Card title="이전 버전 (Wan2.6)" icon="rotate-ccw-clock" href="/ko/api-capabilities/wan/historical-versions">
    Wan2.6 시리즈 및 마이그레이션 노트
  </Card>

  <Card title="HappyHorse 시리즈" icon="monitor-play" href="/ko/api-capabilities/happyhorse/overview">
    또한 알리바바 기반이며, 나란히 선택하는 가이드입니다
  </Card>
</CardGroup>

<Info>
  알리바바 클라우드 공식 문서(참고): `help.aliyun.com/zh/model-studio/text-to-video-api-reference`. 질문이나 제안이 있으시면 [APIYI 콘솔](https://api.apiyi.com)에서 티켓을 열어 주시기 바랍니다.
</Info>
