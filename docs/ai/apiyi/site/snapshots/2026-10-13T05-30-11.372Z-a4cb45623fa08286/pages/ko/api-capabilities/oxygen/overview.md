> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Oxygen 동영상 생성

> AZ8 Oxygen (oxygen-1.0) 동영상 생성 가이드: 텍스트, 첫 프레임, 첫 프레임 및 마지막 프레임, 참조 이미지/동영상/오디오 기반 동영상을 지원하는 OpenAI Videos 호환 API, 320p–768p, 4–15초, 초당 $0.02 과금.

## 개요

Oxygen은 싱가포르 기반 AI 동영상 제작 플랫폼 AZ8(구 Videoinu)에서 제공하는 동영상 생성 모델입니다. APIYI는 이를 `oxygen-1.0`로 제공하며, **OpenAI 동영상** 호환 API(제출 시 `POST /v1/videos`, 조회 시 `GET /v1/videos/{id}`)를 통해 320p / 480p / 768p 해상도의 4–15초 클립을 지원하고, **해상도에 관계없이 초당 \$0.02로 과금됩니다**.

<Note>
  **주요 특징**: 단일 모델로 텍스트 기반 동영상, 첫 프레임 기반 동영상, 시작 및 마지막 프레임 기반 동영상 및 최대 9장의 이미지, 3개의 동영상, 3개의 오디오 클립을 활용한 참조 생성을 모두 지원합니다. 출력 결과에는 오디오 트랙이 포함됩니다. **초당 \$0.02**: 5초 클립은 \$0.10, 15초 클립은 \$0.30이며, 실패한 작업은 자동으로 환불됩니다. 대규모 저비용 동영상 생성을 위해 설계되었습니다.
</Note>

<CardGroup cols={2}>
  <Card title="동영상 생성 API 레퍼런스" icon="video" href="/ko/api-capabilities/oxygen/video-generation">
    Python / cURL / Node.js 예제 및 라이브 플레이그라운드와 함께 제출, 폴링, 다운로드 방법을 제공합니다
  </Card>

  <Card title="충전 보너스" icon="gift" href="/ko/faq/recharge-promotions">
    충전 보너스를 통해 실질 가격을 더욱 낮출 수 있습니다
  </Card>
</CardGroup>

## AI 에이전트에게 연동 맡기기

<Note>
  Codex / Claude Code / Cursor로 개발하는 경우 아래 prompt를 복사하여 입력하십시오. 에이전트가 먼저 이 페이지의 플레인 텍스트 버전을 가져온 후(모든 문서 URL 끝에 `.md` 추가), 사용 중인 기술 스택에 맞는 코드를 작성합니다. 흔히 발생하는 실수는 이미 정리되어 있습니다. 항상 `size`를 전달하고, 고급 매개변수는 `input_reference` JSON 엔벨로프에 넣으며, 길이는 `seconds`로만 설정해야 합니다.
</Note>

<Prompt description="코딩 에이전트를 통해 Oxygen(oxygen-1.0) 동영상 생성을 연동하거나 디버깅합니다. Codex, Claude Code, Cursor 등에 복사하여 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 Oxygen(oxygen-1.0) 동영상 생성(텍스트-동영상 / 첫 프레임 / 첫 프레임 및 마지막 프레임 / 참조 미디어) 기능을 연동하거나 디버깅하십시오.

  코드를 작성하기 전에 문서를 읽으십시오. 이 페이지의 플레인 텍스트 버전인 [https://docs.apiyi.com/en/api-capabilities/oxygen/overview.md](https://docs.apiyi.com/en/api-capabilities/oxygen/overview.md) 를 가져오고, 매개변수 및 코드 샘플은 [https://docs.apiyi.com/en/api-capabilities/oxygen/video-generation.md](https://docs.apiyi.com/en/api-capabilities/oxygen/video-generation.md) 에서 확인하십시오.

  요구 사항:

  1. 엔드포인트: OpenAI Videos 형식입니다. `POST https://api.apiyi.com/v1/videos`(JSON)로 제출하고, `GET https://api.apiyi.com/v1/videos/{id}`로 조회합니다. 제출 시 즉시 `{"id": ..., "status": "queued"}`가 반환되며, 폴링을 통해 동영상을 확인합니다.

  2. 폴링 및 상태: 전체 타임아웃 15분 기준으로 5초마다 조회합니다. 상태는 `queued` / `in_progress` / `completed` / `failed`이며, \*\*성공 상태는 `completed`\*\*입니다.

  3. 파일 다운로드: 성공 시 응답에서 \*\*`video_url`\*\*를 직접 다운로드합니다(인증 헤더 불필요). **`/v1/videos/{id}/content`에 의존하지 마십시오**: 완료 직후에는 여전히 400을 반환할 수 있습니다. 링크는 `expires_at`(약 24시간)에 만료되므로 즉시 자체 스토리지로 복사하십시오.

  4. 길이: 최상위 수준의 `seconds`는 필수이며 4에서 15 사이의 정수(문자열 `"5"`도 가능)여야 하고, **과금은 이를 기준으로 청구됩니다**.

  5. 해상도 및 방향: **항상 `size`를 명시적으로 전달하십시오**. 전달하지 않으면 게이트웨이가 `720x1280`를 채워 세로형 동영상이 반환됩니다. `1280x720` / `720x1280` = 480p, `1792x1024` / `1024x1792` = 768p입니다.

  6. 첫 프레임만 사용하는 이미지-동영상: `input_reference`를 공개 https 이미지 URL 또는 data URI로 설정하십시오. 출력물은 첫 프레임의 가로세로 비율을 따릅니다.

  7. 고급 매개변수(첫 프레임 및 마지막 프레임, 참조 미디어, 320p, 1:1): **반드시 `input_reference` 내의 JSON 문자열(`{`로 시작)에 포함되어야 합니다**(예: `"input_reference": "{\"images\":[\"https://...first.png\"],\"last_image\":\"https://...last.png\"}"`). 허용되는 키: `images`, `last_image`, `reference_images`(최대 9개), `reference_videos`(최대 3개), `reference_audios`(최대 3개), `resolution`(`320p` / `480p` / `768p`), `aspect_ratio`(`16:9` / `9:16` / `1:1`), `prompt`. **최상위 수준에 배치할 경우 오류 없이 자동으로 삭제됩니다**. 엔벨로프 내부에는 `duration`를 사용할 수 없으며(400), 첫 프레임/마지막 프레임은 참조 미디어와 함께 사용할 수 없습니다.

  8. 과금 및 재시도: 모든 해상도에서 초당 \$0.02입니다. 제출 시 청구되고 작업이 `failed` 상태로 종료되면 전액 환불되며, 제출 시 400이 반환되면 요금이 청구되지 않습니다. 가끔 발생하는 `upstream_error` 오류는 몇 분 후 다시 제출하십시오. 400 오류의 경우 재시도하지 말고 매개변수를 수정해야 합니다.

  9. Token: **Pay-as-you-go Priority** 과금 방식의 `default` 또는 `svip` 그룹입니다. `APIYI_API_KEY` 환경 변수에서 키를 읽어오며, 절대로 하드코딩하거나 git에 커밋하지 마십시오.

  10. 변경 후 `size: "1280x720"`를 사용하여 4초 분량의 텍스트-동영상을 실제로 한 번 실행하고, `video_url`와 호출 비용(\$0.08이어야 함)을 보여주십시오. 전체 흐름에는 1\~3분이 소요됩니다. 샌드박스 환경에서는 명령어 타임아웃을 600초 이상으로 설정하거나 백그라운드에서 실행하십시오.
</Prompt>

<Accordion title="이 prompt를 통해 방지할 수 있는 실수">
  | 요구 사항 | 방지하는 실수 |
  | - | - |
  | 항상 `size` 전달 | 전달하지 않으면 게이트웨이가 기본적으로 세로 크기로 설정되어 가로 요청도 세로로 반환됨 |
  | `input_reference` 엔벨로프에 고급 매개변수 포함 | 최상위 수준의 `last_image`, `reference_images` 또는 `resolution`는 오류 없이 자동으로 삭제됨: 마지막 프레임 무시, 참조 무시, 해상도 오류 발생 |
  | `seconds`로만 길이 설정 | 엔벨로프 내부의 `duration`는 거부됨. 과금과 클립 길이 모두 `seconds`를 따름 |
  | `video_url` 다운로드 | 상태가 `completed`로 바뀌는 즉시 `/content`를 호출하면 400이 반환되어 실패한 것처럼 보일 수 있음 |
  | 즉시 파일 복사 | 링크가 약 24시간 후에 만료됨 |
</Accordion>

## 왜 APIYI의 Oxygen을 선택해야 합니까?

<CardGroup cols={2}>
  <Card title="대량 요금제" icon="receipt">
    해상도에 관계없이 초당 \$0.02, 4초 기준 \$0.08로 대량 생성 및 A/B 테스트 초안 제작에 적합합니다
  </Card>

  <Card title="자동 환불" icon="shield-check">
    실패한 작업은 전액 환불되며 거부된 제출 건은 비용이 청구되지 않으므로, 실제로 완성된 동영상에 대해서만 비용을 지불하시면 됩니다
  </Card>

  <Card title="OpenAI Videos 호환" icon="plug">
    `/v1/videos`와(과) 동일한 제출 및 조회 방식을 지원하여 기존 Sora 스타일의 코드를 거의 수정하지 않고 사용할 수 있습니다
  </Card>

  <Card title="충전 보너스 중복 적용" icon="gift">
    [충전 보너스](/ko/faq/recharge-promotions)와 결합하여 실질적인 비용을 더욱 낮출 수 있습니다
  </Card>

  <Card title="전체 동영상 모델 라인업" icon="clapperboard">
    동일한 키로 [Seedance 2.0 / 2.5](/ko/api-capabilities/seedance2/overview), [MiniMax-H3](/ko/api-capabilities/minimax-h3/overview), [Wan2.7](/ko/api-capabilities/wan/overview) 등도 호출할 수 있습니다
  </Card>

  <Card title="글로벌 접속" icon="globe">
    해외 계정 없이 하나의 API 키로 `api.apiyi.com`에 직접 연결할 수 있습니다
  </Card>
</CardGroup>

## 주요 기능

<CardGroup cols={2}>
  <Card title="4가지 생성 모드" icon="layers">
    텍스트, 첫 프레임, 첫/마지막 프레임, 참조 이미지/동영상/오디오를 모두 하나의 엔드포인트에서 지원합니다
  </Card>

  <Card title="3가지 해상도" icon="monitor">
    320p / 480p / 768p를 동일한 가격으로 제공하며, 필요에 따라 속도와 디테일을 조율할 수 있습니다
  </Card>

  <Card title="4~15초 사이의 정수 단위 길이" icon="timer">
    요청한 초 단위로 과금되므로 짧은 영상일수록 비용이 저렴합니다
  </Card>

  <Card title="내장 오디오" icon="music">
    출력 MP4에 오디오 트랙이 포함되어 별도의 더빙이 필요하지 않습니다
  </Card>
</CardGroup>

## 요금 안내

| 항목 | 가격 |
| - | - |
| 출력 동영상 (320p / 480p / 768p 동일 가격) | **\$0.02 / 초** |
| 첫 프레임, 마지막 프레임, 참조 이미지 / 동영상 / 오디오 | 추가 비용 없음 |
| 예시: 4초 클립 | \$0.08 |
| 예시: 15초 클립 | \$0.30 |

<Note>가격은 변동될 수 있으며 위 표는 참고용일 뿐입니다. 상단 내비게이션의 **모델 요금** 탭이 기준이 됩니다: [모델 요금](/en/models/index).</Note>

<Info>
  **과금 안내**:

  * 요청된 `seconds` 기준으로 과금되며, 작업이 수락될 때 청구됩니다. 실제 클립 길이는 약간 더 길 수 있으나(4초 요청 시 약 4.5초) 추가 비용은 발생하지 않습니다.
  * 해상도, 화면 비율 및 참조 미디어는 가격에 영향을 미치지 않습니다.
  * 실패한 작업(제공업체 오류, 시간 초과 등)은 **자동으로 전액 환불됩니다**.
  * 400을 반환하는 제출에는 비용이 청구되지 않으며, 조회 및 다운로드는 무료입니다.
</Info>

## 그룹 설정

`oxygen-1.0`은(는) **`default` 그룹에서 작동하며**, `svip` 그룹에서도 작동합니다. token의 과금 모드를 **종량제 우선**으로 설정하십시오. 호출 시 “no available channel in the current group”이 반환된다면, 해당 token의 그룹에 이 모델이 포함되어 있지 않거나 `model` 이름에 오타가 있는 것입니다.

| 항목 | 요구사항 |
| - | - |
| 그룹 | `default` 또는 `svip` |
| 과금 모드 | 종량제 우선 |
| 모델 이름 | `oxygen-1.0` (`-1.0` 접미사 필수) |

## 기술 사양

| 항목 | 사양 |
| - | - |
| 모델 ID | `oxygen-1.0` |
| 길이 | 정수 4–15초 (최상위 `seconds`) |
| 해상도 | 320p / 480p (기본값) / 768p |
| 화면비 | 가로 16:9, 세로 9:16, 정사각형 1:1, 이미지 투 비디오는 첫 프레임을 따릅니다 |
| 출력 크기 (측정값) | 320p: 576×320; 480p: 864×480 / 480×864 / 480×480; 768p: 1344×768 / 768×1344 / 768×768 |
| 오디오 | 출력에 오디오 트랙이 포함됩니다 |
| 이미지 입력 | 공개 https URL 또는 이미지 데이터 URI |
| 참조 미디어 | 이미지 최대 9개, 동영상 최대 3개, 오디오 최대 3개 (동영상 및 오디오는 https URL만 지원) |
| 출력 | 조회 응답 내 `video_url`를 통한 MP4 제공, 약 24시간 동안 유효합니다 |
| 생성 시간 | 보통 1–3분 소요되며, 대기열이 혼잡할 경우 5분 이상 소요됩니다 |

## API 엔드포인트

| 용도 | 메서드 | 경로 |
| - | - | - |
| 작업 생성 | `POST` | `/v1/videos` |
| 작업 조회 | `GET` | `/v1/videos/{id}` |
| 다운로드 (선택 사항) | `GET` | `/v1/videos/{id}/content` |

<Tip>
  기본 도메인은 `https://api.apiyi.com`, 백업 도메인은 `https://b.apiyi.com`이며 경로는 동일합니다. 다운로드 시에는 조회 응답의 `video_url`을 직접 사용하십시오.
</Tip>

## 생성 모드

최상위 필드에서는 `model`, `prompt`, `seconds`, `size` 및 `input_reference`의 다섯 가지만 적용됩니다. 첫 프레임 및 마지막 프레임, 참조 미디어, 320p 및 1:1은 **`input_reference` JSON 엔벨로프에 들어가는 고급 파라미터**(`{`로 시작하는 JSON 문자열)입니다:

| 모드 | 작성 방법 | 해상도 / 화면비 |
| - | - | - |
| 텍스트 투 비디오 | `input_reference` 생략 | `size`로 설정 |
| 첫 프레임 동영상 | `input_reference` = 이미지 URL 또는 data URI | 해상도는 `size` 기준, 화면비는 첫 프레임을 따름 |
| 첫 프레임 및 마지막 프레임 동영상 | 엔벨로프 `{"images":["first"],"last_image":"last"}` | 위와 동일 |
| 참조 미디어 동영상 | 엔벨로프 `{"reference_images":[...],"reference_videos":[...],"reference_audios":[...]}` | `size`로 설정, `aspect_ratio`는 엔벨로프에 포함 가능 |
| 320p 또는 1:1 | 엔벨로프 `{"resolution":"320p","aspect_ratio":"1:1"}` (위의 모든 모드와 조합 가능) | 엔벨로프 설정이 `size`보다 우선 적용됨 |

`size`가 해상도에 매핑되는 방식:

| `size` | 해상도 | 화면 방향 |
| - | - | - |
| `1280x720` | 480p | 가로 16:9 |
| `720x1280` | 480p | 세로 9:16 |
| `1792x1024` | 768p | 가로 16:9 |
| `1024x1792` | 768p | 세로 9:16 |

엔벨로프 예시 (첫 프레임 및 마지막 프레임):

```json theme={null}
{
  "model": "oxygen-1.0",
  "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
  "seconds": "5",
  "size": "1280x720",
  "input_reference": "{\"images\":[\"https://your-cdn.example.com/first.png\"],\"last_image\":\"https://your-cdn.example.com/last.png\"}"
}
```

<Warning>
  * `last_image`, `reference_images`, `resolution`, `aspect_ratio` 및 유사한 필드는 **최상위 레벨에 배치할 경우 별도의 알림 없이 무시됩니다**. 오류 없이 정상 과금되지만 마지막 프레임과 참조 미디어는 무시되며 해상도는 `size`를 따릅니다. 항상 `input_reference` 엔벨로프 안에 넣어야 합니다
  * **`duration`는 엔벨로프 내에서 허용되지 않습니다**. 최상위 레벨의 `seconds`를 사용하십시오. 유효하지 않은 JSON이거나 키의 철자가 틀린 경우 과금 없이 400(`param: input_reference`) 오류를 반환합니다
  * 첫 프레임/마지막 프레임은 참조 미디어와 **함께 사용할 수 없습니다**
  * `input_reference`는 반드시 **문자열**이어야 합니다. 먼저 엔벨로프를 직렬화하십시오(Python의 경우 `json.dumps`, JS의 경우 `JSON.stringify`). 객체나 배열을 직접 전달하면 거부됩니다
</Warning>

## 모범 사례

<Steps>
  <Step title="먼저 4초로 테스트하십시오">
    초 단위로 과금되므로, 10\~15초 분량의 최종본을 렌더링하기 전에 4초 길이로 구도와 스타일을 먼저 확인하십시오.
  </Step>

  <Step title="항상 size를 설정하십시오">
    가로 방향은 `1280x720`, 세로 방향은 `720x1280`이며, 더 상세한 디테일을 원하시면 `1792x1024` / `1024x1792` (768p)를 사용하십시오.
  </Step>

  <Step title="첫 프레임과 마지막 프레임의 가로세로 비율을 비슷하게 맞추십시오">
    출력 결과는 첫 프레임의 비율을 따르므로, 마지막 프레임의 비율 차이가 크면 화면 전환 시 잘림 현상이 발생합니다.
  </Step>

  <Step title="안정적인 퍼블릭 스토리지에 미디어를 호스팅하십시오">
    핫링크 방지나 서명 만료로 인해 다운로드가 실패하지 않도록 자체 OSS / CDN 직접 링크를 사용하십시오.
  </Step>

  <Step title="15분 타임아웃으로 5초마다 폴링하십시오">
    대부분의 클립은 1\~3분 내에 완료되지만 피크 시간대에는 더 오래 걸릴 수 있습니다.
  </Step>

  <Step title="video_url을 즉시 자체 스토리지로 복사하십시오">
    해당 링크는 약 24시간 후에 만료되므로, 직접 다운로드하여 자체 스토리지에서 서비스하십시오.
  </Step>
</Steps>

## 오류 코드 및 재시도

| 단계 | 증상 | 원인 | 해결 방법 |
| - | - | - | - |
| 제출 | 400, `invalid_params`, `param: input.duration` | `seconds`가 4–15 범위를 벗어남 | 길이를 변경하십시오. 과금되지 않습니다 |
| 제출 | 400, `invalid_params`, `param: input_reference` | 유효하지 않은 envelope JSON, 알 수 없는 키 또는 envelope 내 `duration` | 메시지에 따라 envelope을 수정하십시오. 과금되지 않습니다 |
| 제출 | 400, `cannot unmarshal array ... input_reference` | `input_reference`이(가) 문자열 대신 배열 또는 객체로 전송됨 | `json.dumps` / `JSON.stringify`을(를) 사용하여 직렬화하십시오 |
| 제출 | 500, 참조 파일 다운로드 실패 | `input_reference`의 이미지 URL에 접근할 수 없음 | 공개적으로 접근 가능한 https URL을 사용하십시오 |
| 제출 | 503, 사용 가능한 채널 없음 | token 그룹에 해당 모델이 포함되어 있지 않거나 모델 이름 철자가 잘못됨 | 그룹 및 `oxygen-1.0`을 확인하십시오 |
| 실행 | `failed`, `upstream_error` | 간헐적인 제공업체 측 오류 | 몇 분 후 다시 제출하십시오 (이미 환불됨) |
| 실행 | `failed`, `upstream_timeout` | 업스트림 대기열에서 너무 오래 대기하여 시간 제한 도달 | 나중에 다시 제출하십시오 (이미 환불됨) |

<Info>
  오류 세부 정보는 응답의 `message` 필드 내에 있는 JSON 문자열(예: `{"message":"{\"error\":{\"code\":\"invalid_params\",...}}","type":"task_error"}`)이므로 한 번 더 파싱하십시오.
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="가로형 동영상이 왜 세로형으로 생성되었나요?">
    `size`이(가) 전달되지 않았습니다. 전달하지 않으면 게이트웨이 기본값인 `720x1280`(세로형)가 적용됩니다. 가로형 동영상의 경우 `1280x720` 또는 `1792x1024`을(를) 명시적으로 전달하십시오.
  </Accordion>

  <Accordion title="last_image / reference_images가 왜 적용되지 않나요?">
    해당 필드가 요청의 최상위 레벨에 배치되었기 때문입니다. 최상위 레벨에서는 `model`, `prompt`, `seconds`, `size` 및 `input_reference`만 유효하며, 그 외의 항목은 별도의 오류 없이 무시됩니다. `input_reference` JSON 엔벨로프에 넣어 전달하십시오. 자세한 내용은 위의 “생성 모드”를 참고하십시오.
  </Accordion>

  <Accordion title="320p는 어떻게 설정하나요? resolution을 전달해도 아무런 변화가 없습니다.">
    최상위 레벨의 `resolution`은(는) 무시됩니다. 엔벨로프 내에 넣어 전달하십시오: `"input_reference": "{\"resolution\":\"320p\"}"`. 세 가지 해상도 모두 비용은 동일합니다.
  </Accordion>

  <Accordion title="해상도마다 비용이 다른가요?">
    아닙니다. 모두 초당 \$0.02입니다. 320p는 파일 크기가 작고 렌더링 속도가 빠르며, 768p는 화질이 더 선명합니다.
  </Accordion>

  <Accordion title="상태는 completed인데 /content에서 400을 반환하는 이유는 무엇인가요?">
    상태가 `completed`(으)로 변경된 직후에는 `/v1/videos/{id}/content` 처리에 몇 초가 더 필요할 수 있습니다. 대신 조회 응답의 `video_url`을(를) 사용하십시오.
  </Accordion>

  <Accordion title="동영상 링크의 유효 기간은 얼마인가요?">
    약 24시간입니다(조회 응답의 `expires_at` 참조). 신속하게 다운로드하여 보관하십시오.
  </Accordion>

  <Accordion title="실패한 작업에 대해서도 요금이 부과되나요?">
    아닙니다. `failed`(으)로 종료된 작업은 자동으로 전액 환불되며, 400을 반환하는 제출 건에는 과금되지 않습니다.
  </Accordion>

  <Accordion title="간혹 발생하는 upstream_error는 어떻게 해야 하나요?">
    제공업체 측에서 일시적으로 발생한 오류이며 이미 전액 환불 처리되었습니다. 몇 분 후 다시 제출하면 대부분 정상 처리됩니다.
  </Accordion>

  <Accordion title="동영상 클립이 지정한 초보다 약간 더 긴 이유는 무엇인가요?">
    출력 동영상은 지정된 시간보다 약간 길게 생성됩니다(4초 설정 시 약 4.5초, 5초 설정 시 약 5.2초). 과금은 요청된 `seconds`을(를) 기준으로 적용되므로 추가 요금은 부과되지 않습니다.
  </Accordion>

  <Accordion title="첫 번째 프레임에 Base64를 사용할 수 있나요?">
    네, 가능합니다. 엔벨로프 내의 `input_reference` 및 `images` 모두 이미지 데이터 URI(예: `data:image/jpeg;base64,...`)를 지원합니다. 참조 동영상 및 오디오는 https URL만 지원합니다.
  </Accordion>

  <Accordion title="이미지 기반 동영상 생성(image-to-video) 시 화면 비율을 설정할 수 있나요?">
    아닙니다. 이미지 기반 동영상 생성은 첫 번째 프레임의 화면 비율을 따르며 `aspect_ratio`은(는) 무시됩니다. 해상도는 엔벨로프 내의 `size` 또는 `resolution`을(를) 통해 선택할 수 있습니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [Oxygen 동영상 생성 API 레퍼런스](/ko/api-capabilities/oxygen/video-generation)
* [MiniMax-H3 동영상 생성](/ko/api-capabilities/minimax-h3/overview)
* [Seedance 2.0 / 2.5 동영상 생성](/ko/api-capabilities/seedance2/overview)
* [Wan2.7 동영상 생성](/ko/api-capabilities/wan/overview)
* [충전 보너스](/ko/faq/recharge-promotions)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.