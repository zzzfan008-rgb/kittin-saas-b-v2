> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-H3 동영상 생성

> MiniMax H3 (Hailuo 3.0) 동영상 생성 가이드: 텍스트, 첫/마지막 프레임, 참조 이미지/동영상/오디오 기반 동영상을 위한 단일 엔드포인트, 네이티브 스테레오 오디오, 768P, 4–15초, 초당 $0.03 과금.

## 개요

MiniMax H3 (Hailuo 3.0)은 MiniMax가 2026-07-31 (UTC+8)에 출시한 옴니모달 동영상 모델입니다. 단일 모델로 텍스트, 이미지, 동영상, 오디오를 입력받아 **스테레오 오디오 트랙이 포함된** 동영상을 출력합니다. APIYI는 오픈 가중치 자체 호스팅 배포를 통해 `MiniMax-H3`을 제공하며, 768P 해상도, 클립당 4–15초 길이로 초당 과금됩니다.

<Note>
  **주요 특징**: 하나의 엔드포인트로 텍스트 투 비디오, 첫 프레임 / 마지막 프레임 / 첫 프레임 및 마지막 프레임 동영상, 그리고 최대 9개의 이미지, 3개의 동영상, 3개의 오디오 클립을 활용한 혼합 참조 생성을 지원합니다. 모든 클립에 음악과 음향 효과가 함께 제공됩니다. **초당 \$0.03**(공식 MiniMax API 요금은 \$0.08)로 10초 클립의 비용은 \$0.30이며, 실패한 작업은 자동으로 환불됩니다.
</Note>

<CardGroup cols={2}>
  <Card title="동영상 생성 API 레퍼런스" icon="video" href="/ko/api-capabilities/minimax-h3/video-generation">
    작업을 생성하고 task\_id로 조회할 수 있으며, Python / cURL / Node.js 예제 및 실시간 Playground를 제공합니다.
  </Card>

  <Card title="충전 보너스" icon="gift" href="/ko/faq/recharge-promotions">
    충전 보너스를 통해 실질 가격을 더욱 낮출 수 있습니다.
  </Card>
</CardGroup>

## AI 에이전트를 통한 연동

<Note>
  Codex / Claude Code / Cursor를 사용하여 개발하는 경우 아래 prompt를 복사하여 입력하십시오. 에이전트가 먼저 이 페이지의 일반 텍스트 버전을 가져온 후(임의의 문서 URL 뒤에 `.md` 추가), 개발 스택에 맞는 코드를 작성합니다. 자주 발생하는 실수는 이미 명시되어 있습니다. 경로에 `/hailuo`가 필요하고, 결과는 `task` 내에 위치하며, `duration`는 4부터 15까지의 정수여야 합니다.
</Note>

<Prompt description="코딩 에이전트에게 MiniMax-H3 동영상 생성 연동 또는 디버깅을 맡기십시오. Codex, Claude Code, Cursor 및 유사한 도구에 복사하여 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 MiniMax-H3 동영상 생성(텍스트-비디오 / 첫 프레임 및 마지막 프레임 비디오 / 참조 비디오)을 연동하거나 디버깅하십시오.

  코드를 작성하기 전에 문서를 읽으십시오. 이 페이지의 일반 텍스트 버전은 [https://docs.apiyi.com/en/api-capabilities/minimax-h3/overview.md](https://docs.apiyi.com/en/api-capabilities/minimax-h3/overview.md) 에서 가져오고, 매개변수 및 코드 샘플은 [https://docs.apiyi.com/en/api-capabilities/minimax-h3/video-generation.md](https://docs.apiyi.com/en/api-capabilities/minimax-h3/video-generation.md) 에 있습니다.

  요구 사항:

  1. 엔드포인트: `POST https://api.apiyi.com/hailuo/v2/video_generation`로 제출하고, `GET https://api.apiyi.com/hailuo/v2/query/video_generation/{task_id}`으로 조회합니다. **경로는 반드시 `/hailuo`로 시작해야 합니다.** 그렇지 않으면 JSON 대신 웹 페이지를 반환받게 됩니다.

  2. 폴링 및 상태: 제출 시에는 `{"task_id": ...}`만 반환됩니다. 10초마다 폴링하십시오. 전체 타임아웃은 작업 유형에 따라 설정합니다. 참조 비디오가 없으면 30분, 있으면 2시간입니다. 조회 결과는 **`task`** 객체로 감싸져 있으며, 상태는 `queued` / `running` / `succeeded` / `failed`이고, **성공 상태는 `succeeded`입니다.** `progress`는 0 또는 1의 값만 가지므로 이를 기반으로 진행률 표시줄을 구현하지 마십시오.

  3. 동영상 저장: URL은 \*\*`task.content.url`\*\*이며 인증 헤더가 필요하지 않습니다. 서버 측에서 직접 다운로드하여 저장하십시오. URL은 GET으로 확인해야 하며, HEAD 요청에는 403을 반환합니다.

  4. 요청 본문 및 타입: 5개 필드 `{ model, content[], resolution, duration, ratio }`가 모두 필수입니다. `model`는 항상 `MiniMax-H3`(대소문자 구분)입니다. **`duration`는 정수**여야 하며, `"5"`와 같은 문자열이나 소수는 거부됩니다. **`resolution`는 대문자 `768P`여야 하며**, `768p`와 `2K`는 모두 거부됩니다.

  5. 매개변수 제한: `duration`는 4\~15초, `ratio`는 `21:9` `16:9` `4:3` `1:1` `3:4` `9:16` `adaptive` 중 하나여야 합니다. **텍스트 전용 및 오디오 전용 요청에는 `adaptive`를 사용할 수 없습니다.** `content`에는 최대 7,000자의 텍스트 항목이 정확히 하나만 포함되어야 합니다. 문서에 없는 필드(예: `seed` 또는 `prompt`)는 추가하지 마십시오. 거부 처리됩니다.

  6. 미디어 입력: 이미지는 `{"type":"image_url","image_url":{"url":...},"role":...}`에 입력하고, 동영상은 `video_url` + `reference_video`, 오디오는 `audio_url` + `reference_audio`를 사용합니다. 모든 URL은 **공개 https 링크**여야 하며, base64, data URI, 사설 IP 주소는 지원되지 않습니다. 첫 프레임/마지막 프레임(`first_frame` / `last_frame`)은 참조 미디어와 함께 사용할 수 **없으며**, 이미지가 2개 이상인 경우 각각 `role`가 필요합니다. 제한 사항: 참조 이미지 최대 9개, 참조 동영상 최대 3개(총 15초 이하), 참조 오디오 클립 최대 3개입니다. prompt 내에서는 각 미디어 유형별 순서에 따라 번호를 매겨 `<Picture 1>` `<Video 1>` `<Audio 1>`와 같이 참조하십시오.

  7. 과금 및 멱등성: 초당 0.03달러로 과금되며 참조 이미지, 동영상 또는 오디오에 대한 추가 요금은 없습니다. `failed` 작업은 자동으로 환불되며 제출 오류는 과금되지 않습니다. **`Idempotency-Key` 헤더는 현재 적용되지 않으므로 다시 제출할 때마다 새로 과금됩니다.** 비즈니스 ID와 task\_id 간의 매핑을 자체적으로 유지하고, 제출 시 발생하는 HTTP 500 오류 및 네트워크 오류에 대해서만 백오프(5초 / 10초 / 20초)를 적용하여 재시도하십시오. 400 오류의 경우 재시도하지 말고 매개변수를 수정하십시오.

  8. token: `default` 그룹 또는 `svip` 그룹을 사용할 수 있습니다. 과금 모델을 **Pay-as-you-go Priority**로 설정하십시오. “no available channel” 오류는 token의 그룹이 잘못되었거나 모델 이름의 철자가 틀렸음을 의미합니다.

  9. 키는 `APIYI_API_KEY` 환경 변수에서 읽어오십시오. 코드에 직접 하드코딩하거나 git에 커밋하지 마십시오.

  10. 완료되면 실제 5초 길이의 텍스트-비디오 요청을 한 번 실행하고, 동영상 URL 및 호출 비용을 알려주십시오. 전체 프로세스는 2\~4분 정도 소요됩니다. 샌드박스 환경에서 실행하는 경우 명령어 타임아웃을 600초 이상으로 설정하거나 백그라운드에서 실행하십시오.
</Prompt>

<Accordion title="이 prompt로 방지할 수 있는 실수">
  | 요구 사항 | 방지하는 오류 |
  | - | - |
  | 경로가 `/hailuo`로 시작함 | `/v2/...`만 사용할 경우 웹 페이지가 반환되어 JSON 파싱에 실패하고 서비스가 다운된 것처럼 보입니다 |
  | 결과가 `task` 내에 위치함 | 최상위 레벨에서 `status`를 찾으면 일치하지 않아 타임아웃될 때까지 계속 폴링하게 됩니다 |
  | `duration`는 4\~15 사이의 정수임 | 문자열이나 소수는 거부되며, 오류 메시지에 오해의 소지가 있게 JSON이 유효하지 않다고 표시됩니다 |
  | 텍스트 전용에는 `adaptive` 불가 | 텍스트-비디오에는 고정된 가로세로 비율이 필요합니다 |
  | 멱등성 키가 적용되지 않음 | `Idempotency-Key`로 인해 재시도가 안전하다고 생각하기 쉽지만, 재시도할 때마다 새로 과금됩니다 |
  | GET으로 URL 확인 | 동영상 URL이 HEAD 요청에 403을 반환하여 유효하지 않은 링크처럼 보입니다 |
</Accordion>

## 왜 APIYI의 MiniMax-H3를 선택해야 할까요?

<CardGroup cols={2}>
  <Card title="모든 기능 완벽 지원" icon="layers">
    텍스트, 첫 프레임/마지막 프레임, 이미지·동영상·오디오 혼합 참조 생성을 모두 지원하며, 공식 모델과 동일한 참조 제한(이미지 9장 + 동영상 3개 + 오디오 클립 3개)이 적용됩니다
  </Card>

  <Card title="초 단위 과금, 실패 시 전액 환불" icon="receipt">
    초당 \$0.03이며, 성공한 동영상에 대해서만 과금됩니다. 실패한 작업은 전액 환불되며 제출 오류는 무료입니다
  </Card>

  <Card title="충전 보너스 중복 적용" icon="gift">
    [충전 보너스](/ko/faq/recharge-promotions)와 함께 이용하시면 실질 비용을 더욱 낮출 수 있습니다
  </Card>

  <Card title="제약 없는 글로벌 접속" icon="globe">
    해외 계정 없이 하나의 API Key로 `api.apiyi.com`에 바로 연결할 수 있습니다
  </Card>

  <Card title="풍부한 동영상 모델 라인업" icon="clapperboard">
    동일한 키로 [Seedance 2.0 / 2.5](/ko/api-capabilities/seedance2/overview), [Wan2.7](/ko/api-capabilities/wan/overview), [VEO 3.1](/ko/api-capabilities/veo-3-1-official/overview) 등 다양한 모델도 이용하실 수 있습니다
  </Card>

  <Card title="전문 기술 지원" icon="headset">
    연동 관련 문의는 기술 지원팀에 연락해 주시기 바라며, 엔터프라이즈 고객에게는 전담 온보딩 지원을 제공합니다
  </Card>
</CardGroup>

## 주요 기능

<CardGroup cols={2}>
  <Card title="네이티브 스테레오 오디오" icon="music">
    모든 클립에는 별도의 더빙 작업 없이 prompt 및 참조 오디오를 기반으로 한 음악과 효과음이 포함됩니다
  </Card>

  <Card title="7가지 화면비" icon="ratio">
    `21:9`부터 `9:16`까지의 6가지 고정 화면비 및 참조 이미지를 따르는 `adaptive`를 지원합니다
  </Card>

  <Card title="4초부터 15초까지의 모든 정수 단위 길이" icon="timer">
    요청된 실제 초 단위로 과금되므로 짧은 클립일수록 비용이 적게 듭니다
  </Card>

  <Card title="긴 prompt" icon="text">
    prompt당 최대 7000자까지 지원하여 샷별(shot-by-shot) 상세 묘사에도 충분합니다
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="첫 프레임/마지막 프레임 제어" icon="image">
    첫 프레임만 지정하거나, 마지막 프레임만 지정하거나, 둘 다 지정하여 클립의 시작과 끝을 설정할 수 있습니다
  </Card>

  <Card title="다중 참조 이미지" icon="images">
    최대 9장의 참조 이미지를 지원하며, prompt 내에서 `<Picture 1>` 등으로 인물과 사물을 태그할 수 있습니다
  </Card>

  <Card title="동영상 모션 전이" icon="film">
    카메라 움직임과 모션 리듬을 복제할 수 있는 최대 3개의 참조 동영상을 지원합니다
  </Card>

  <Card title="오디오 기반 동영상" icon="audio-lines">
    최대 3개의 참조 오디오 클립을 지원하며, 화면이 음악이나 음성을 따릅니다
  </Card>
</CardGroup>

## 요금 안내

본 채널은 MiniMax의 오픈 H3 가중치를 자체 배포하여 구동합니다. 이는 **공식 MiniMax API의 릴레이가 아니므로**, 자체적인 요금이 적용됩니다:

| 항목 | APIYI (자체 호스팅, 768P) | 공식 MiniMax API (768P) |
| - | - | - |
| 출력 동영상 | **\$0.03 / 초** | \$0.08 / 초 |
| 참조 이미지 | 무료 (최대 9장) | 최초 5장 무료, 이후 이미지당 \$0.04 |
| 참조 동영상 | 무료 | 입력 1초당 \$0.08 |
| 참조 오디오 | 무료 | 무료 |
| 예시: 10초 텍스트-동영상 생성 | **\$0.30** | \$0.80 |

<Note>본 채널은 오픈 가중치를 자체 배포하여 운영되며, 공식 MiniMax API와는 독립적으로 가격이 책정되므로 가격이 변동될 수 있습니다. 위 표는 참고용일 뿐이며, 상단 탐색 메뉴의 **모델 요금 안내** 탭이 기준이 됩니다: [모델 요금 안내](/en/models/index). 공식 가격 출처: `platform.minimax.io/docs/guides/pricing-paygo`(2026-09-29 기준).</Note>

<Info>
  **과금 세부사항**:

  * 요청된 `duration`(초 단위)를 기준으로 과금되며, 작업 접수 시 사전 청구됩니다
  * **참조 미디어 추가 요금 없음**: 참조 이미지(최대 9장), 동영상 및 오디오는 가격에 영향을 미치지 않으며, 오직 재생 시간에 대해서만 과금됩니다
  * 실패한 작업(미디어 다운로드 실패, 지원되지 않는 형식, 실행 실패 등)은 **자동으로 전액 환불됩니다**
  * 제출 시 4xx / 5xx를 반환하는 요청은 과금되지 않으며, 조회 및 다운로드는 무료입니다
  * 더 저렴한 실질 비용을 원하시면 [충전 보너스](/ko/faq/recharge-promotions)를 확인하시기 바랍니다
</Info>

## 그룹 설정

MiniMax-H3는 **`default` 그룹에서 작동하며**, `svip` 그룹에서도 작동하므로 전용 그룹이 필요하지 않습니다. Token의 과금 모델을 **종량제 우선**으로 설정하는 것을 권장합니다. 호출 시 “no available channels for the current group” 오류가 반환된다면 Token의 그룹에 해당 모델이 포함되어 있지 않거나 `model` 값의 철자가 잘못되었을 수 있습니다(대소문자를 구분합니다).

| 항목 | 요구사항 |
| - | - |
| 그룹 | `default` 또는 `svip` |
| 과금 모델 | 종량제 우선 (권장) |
| 모델명 | `MiniMax-H3`, 대소문자 구분 |

## 기술 사양

| 항목 | 사양 |
| - | - |
| 모델 ID | `MiniMax-H3` |
| 해상도 | `768P`만 지원 |
| 재생 시간 | 정수 4–15초 (완성된 영상은 일반적으로 0.1–0.5초 더 깁니다) |
| 화면비 | `21:9` 1536×672 / `16:9` 1344×768 / `4:3` 1024×768 / `1:1` 768×768 / `3:4` 768×1024 / `9:16` 768×1344 / `adaptive` |
| 오디오 | 스테레오 트랙 항상 포함, 별도 스위치 없음 |
| prompt | 텍스트 항목 1개, 1–7000자 |
| 참조 미디어 | 이미지 ≤ 9개, 동영상 ≤ 3개 (총 ≤ 15초), 오디오 ≤ 3개, 전체 미디어 항목 ≤ 12개 |
| 미디어 입력 | 공개 HTTPS URL만 지원 |
| 출력 | `task.content.url`을 통한 MP4 |
| 생성 시간 | 5초 기준 약 3분, 15초 기준 약 13분 소요, 참조 동영상이 포함되면 훨씬 더 오래 걸립니다. 아래 “예상 생성 시간”을 참조하십시오 |

<Warning>
  공식 MiniMax H3 모델은 2K를 지원하지만, 이 채널에서는 **768P만 제공**하며 `2K`는 거부됩니다.
</Warning>

## 예상 생성 시간

MiniMax-H3의 생성 시간은 주로 **출력 재생 시간**과 **참조 동영상 포함 여부**라는 두 가지 요소에 따라 달라집니다. 아래 표는 2026-09-29부터 2026-10-10 (UTC+8)까지 400개 이상의 성공적인 작업을 기반으로 한 현재 채널의 현황을 나타냅니다:

| 출력 재생 시간 | 참조 동영상 없음 (텍스트 / 이미지를 동영상으로 변환) | 참조 동영상 있음 |
| - | - | - |
| 4–6초 | 약 3분, 대부분 5분 이내 | 약 15분 (12–25분) |
| 7–10초 | 약 6분, 대부분 11분 이내 | 샘플 수 적음, 30분 이상 소요 예상 |
| 11–15초 | 약 13분, 대부분 20분 이내 | 약 85분 (50–90분) |

* **소요 시간은 재생 시간보다 빠르게 증가합니다**: 15초 분량의 영상은 5초 분량보다 3배가 아닌 약 5배 더 오래 걸립니다.
* **참조 동영상이 포함된 경우 가장 오래 걸립니다**: 모델이 참조 동영상을 프레임별로 파싱하고 새로운 프레임과 함께 연산하므로 작업 부하가 크게 증가합니다.
* **이 표를 바탕으로 클라이언트 타임아웃을 설정하십시오**: 진행 중인 작업이 실패로 오인되지 않도록 참조 동영상이 없는 작업은 30분, 참조 동영상이 있는 작업은 2시간으로 설정하십시오.

<Note>
  이는 현재 채널의 실측 수치입니다. 시간에 민감한 작업의 경우 4–6초 분량의 클립부터 시작하거나 참조 동영상 대신 참조 이미지를 사용하십시오. **더 빠르고 높은 품질의 MiniMax 그룹이 곧 제공될 예정입니다.** 해당 소식은 이 페이지와 [변경 로그](/en/changelog)를 통해 안내해 드리겠습니다.
</Note>

## API 엔드포인트

| 목적 | 메서드 | 경로 | Content-Type |
| - | - | - | - |
| 작업 생성 | `POST` | `/hailuo/v2/video_generation` | `application/json` |
| 작업 조회 | `GET` | `/hailuo/v2/query/video_generation/{task_id}` | — |

<Tip>
  주 호스트는 `https://api.apiyi.com`, 백업 호스트는 `https://b.apiyi.com`이며 경로는 동일합니다. 경로는 **`/hailuo`로 시작하며**, `/v1`이 아니라는 점에 유의하십시오.
</Tip>

## 생성 모드

생성 모드는 `content[]`의 미디어로부터 추론됩니다:

| 모드 | `content[]` | `ratio` |
| - | - | - |
| 텍스트 투 비디오 | 텍스트 항목 1개만 가능 | 고정 비율 필수 |
| 첫 프레임 동영상 | 텍스트 + `first_frame` 이미지 1장 | 고정 또는 `adaptive` |
| 마지막 프레임 동영상 | 텍스트 + `last_frame` 이미지 1장 | 고정 또는 `adaptive` |
| 첫 프레임 및 마지막 프레임 동영상 | 텍스트 + `first_frame` + `last_frame` | 고정 또는 `adaptive` |
| 레퍼런스 동영상 | 텍스트 + `reference_image` / `reference_video` / `reference_audio`의 모든 조합 | 고정 또는 `adaptive`; **오디오만 있는 경우 고정 비율 필수** |

### prompt 내 미디어 참조

각 미디어 유형은 `content[]`의 순서에 따라 번호가 지정됩니다. 첫 번째 및 두 번째 레퍼런스 이미지는 `<Picture 1>` 및 `<Picture 2>`이고, 첫 번째 레퍼런스 동영상은 `<Video 1>`이며, 첫 번째 레퍼런스 오디오 클립은 `<Audio 1>`입니다. 예를 들면 다음과 같습니다:

```text theme={null}
<Picture 1> dances with the moves from <Video 1>, in time with <Audio 1>
```

<Warning>
  * 첫 프레임/마지막 프레임은 어떤 레퍼런스 미디어와도 결합할 수 **없습니다**
  * 단일 이미지의 경우 `role`을 생략할 수 있습니다(첫 프레임으로 처리됨). **이미지가 2장 이상인 경우 각각에 `role`을 설정해야 합니다**
  * 레퍼런스 동영상의 **합산 길이**는 15초를 초과할 수 없으며, 그렇지 않으면 작업이 실패합니다(환불 처리됨). 15초를 초과하는 단일 클립은 앞부분 15초로 잘립니다
</Warning>

## 모범 사례

<Steps>
  <Step title="먼저 4~5초 길이로 테스트하십시오">
    초 단위로 과금되므로, 10\~15초 렌더링을 진행하기 전에 짧은 클립으로 구도와 스타일을 확인하십시오.
  </Step>

  <Step title="텍스트-동영상 생성 시 고정 비율을 사용하십시오">
    가로 화면은 `16:9`, 세로 화면은 `9:16`, 와이드스크린은 `21:9`를 사용하며, 첫 프레임이 있는 경우 `adaptive`를 통해 이미지 비율을 유지합니다.
  </Step>

  <Step title="안정적인 공개 스토리지에 미디어를 호스팅하십시오">
    핫링크 방지나 만료된 서명으로 인해 미디어 다운로드가 중단되지 않도록 자체 오브젝트 스토리지 또는 CDN의 직접 링크를 사용하십시오.
  </Step>

  <Step title="카메라 움직임과 음향을 설명하십시오">
    피사체, 동작, 카메라 움직임, 조명뿐만 아니라 원하는 음악과 음향 효과를 포함하십시오. 모델이 이를 함께 생성합니다.
  </Step>

  <Step title="10초마다 폴링하십시오">
    5초 클립은 대개 약 3분이 소요됩니다. 클라이언트 전체 타임아웃은 참조 동영상이 없는 경우 30분, 참조 동영상이 있는 경우 2시간으로 설정하십시오 (“예상 생성 시간” 참조).
  </Step>

  <Step title="멱등성을 직접 처리하십시오">
    비즈니스 ID와 task\_id의 매핑을 유지하십시오. 제출 요청이 타임아웃되면 다시 제출하기 전에 기존 작업이 있는지 먼저 확인하십시오.
  </Step>

  <Step title="동영상을 즉시 저장하십시오">
    GET 방식으로 `task.content.url`을(를) 다운로드하여 자체 스토리지에서 제공하십시오.
  </Step>
</Steps>

## 오류 코드 및 재시도

| 단계 | 표시되는 내용 | 원인 | 해결 방법 |
| - | - | - | - |
| 제출 | 400, `type: invalid_request`, 중국어 메시지 | 유효하지 않은 파라미터(duration, ratio, counts, roles 등) | 파라미터를 수정하십시오. 재시도하지 마십시오 |
| 제출 | 400, `bad_request_error` | 업스트림에서 거부됨(예: `resolution must be 768P`, 지원되지 않는 필드) | 파라미터를 수정하십시오 |
| 제출 | 500, `Unknown Error` | 일부 잘못된 파라미터(다중 텍스트 항목, `http://` 링크, 알 수 없는 필드 등) 또는 일시적인 과부하 | 먼저 본문을 생성 모드와 대조하여 확인하십시오. 유효한 경우 백오프를 적용하여 재시도하십시오 |
| 제출 | 503, 사용 가능한 채널 없음 | Token의 그룹에 해당 모델이 포함되어 있지 않거나 `model`의 철자가 잘못되었습니다 | Token의 그룹과 모델 이름을 확인하십시오 |
| 실행 | `status: failed`, `input_download_failed` | 미디어 URL을 다운로드할 수 없습니다(예: 404) | 공개적으로 접근 가능한 링크로 변경한 후 다시 제출하십시오 |
| 실행 | `status: failed`, `input_format_unsupported` | 잘못된 미디어 형식(예: 이미지 슬롯에 오디오 입력) | 미디어 타입과 형식을 확인하십시오 |
| 실행 | `status: failed`, `task_execution_failed` | 생성 실패 | 나중에 다시 제출하십시오(실패한 작업은 환불되었습니다) |

<Info>
  **클라이언트 팁**: 제출 타임아웃을 60초로 설정하십시오(피크 시간대에는 제출에만 10초 이상 소요될 수 있습니다). HTTP 500 오류 및 네트워크 오류에 대해서만 백오프를 적용하여 재시도하십시오. 실행 단계의 모든 실패는 자동으로 환불되며, 다시 제출하면 새로 과금됩니다.
</Info>

## 자주 묻는 질문 (FAQ)

<AccordionGroup>
  <Accordion title="JSON 대신 웹 페이지가 반환되는 이유는 무엇인가요?">
    경로에 `/hailuo` 접두사가 누락되었습니다. 올바른 경로는 `/hailuo/v2/video_generation` 및 `/hailuo/v2/query/video_generation/{task_id}`입니다.
  </Accordion>

  <Accordion title="2K 또는 1080P가 지원되나요?">
    이 채널은 `768P`만 지원합니다. 공식 MiniMax 모델은 2K를 지원하지만, 이 채널에서는 제공하지 않습니다.
  </Accordion>

  <Accordion title="1~3초로 설정할 수 있나요?">
    아니요. `duration`은(는) 4부터 15까지의 정수입니다.
  </Accordion>

  <Accordion title="동영상에 소리가 포함되어 있나요? 끌 수 있나요?">
    모든 클립에는 스테레오 오디오 트랙이 포함되어 있으며, 이를 비활성화하는 매개변수는 없습니다. 오디오가 필요하지 않다면 후처리 과정에서 트랙을 제거하십시오.
  </Accordion>

  <Accordion title="Idempotency-Key 헤더가 중복 과금을 방지하나요?">
    현재는 방지하지 않습니다. 동일한 `Idempotency-Key`(으)로 다시 제출하더라도 새 작업이 생성되어 별도로 과금됩니다. 제출된 작업은 자체 애플리케이션에서 직접 추적하십시오.
  </Accordion>

  <Accordion title="실패한 작업도 과금되나요?">
    아니요. 작업이 `failed` 상태에 도달하면 자동으로 전액 환불되며, 제출 시 거부된 요청 역시 과금되지 않습니다.
  </Accordion>

  <Accordion title="Base64 또는 로컬 파일을 전송할 수 있나요?">
    아니요. 모든 미디어는 공개 HTTPS URL이어야 합니다. 먼저 자체 오브젝트 스토리지에 업로드한 후 해당 링크를 전달하십시오.
  </Accordion>

  <Accordion title="adaptive는 어떤 크기로 생성되나요?">
    입력 이미지의 종횡비를 따릅니다. 예를 들어 정사각형 이미지는 768×768, 16:9 이미지는 1344×768입니다. 텍스트 전용 및 오디오 전용 요청에서는 `adaptive`을(를) 사용할 수 없습니다.
  </Accordion>

  <Accordion title="참조 동영상이 15초를 초과하면 오류가 발생하나요?">
    15초를 초과하는 단일 클립은 처음 15초로 자동 트리밍되지만, 여러 참조 동영상의 총합이 15초를 초과하면 작업이 실패합니다(그리고 환불됩니다).
  </Accordion>

  <Accordion title="생성하는 데 시간이 얼마나 걸리나요?">
    5초 클립은 약 3분, 15초 클립은 약 13분이 소요됩니다. 참조 동영상이 있는 작업은 훨씬 더 오래 걸려 15초 기준 약 85분이 소요됩니다. 전체 표는 위의 "예상 생성 시간"을 참조하십시오.
  </Accordion>

  <Accordion title="동영상 URL은 얼마 동안 유효한가요?">
    빠르게 만료되는 사례는 확인되지 않았으나 장기적인 가용성이 보장되지 않으므로, 동영상을 즉시 다운로드하여 저장하십시오. URL 확인 시에는 GET을 사용하십시오. HEAD 요청은 403을 반환합니다.
  </Accordion>

  <Accordion title="제출 시 때때로 500 Unknown Error가 반환되면 어떻게 해야 하나요?">
    먼저 요청 본문이 규칙(정확히 하나의 텍스트 항목, 추가 필드 없음, https 미디어 링크)을 준수하는지 확인하십시오. 규칙을 준수했다면 대개 일시적인 과부하 문제이므로 몇 초 후 다시 시도하십시오. 제출에 실패한 요청은 과금되지 않습니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [MiniMax-H3 동영상 생성 API 레퍼런스](/ko/api-capabilities/minimax-h3/video-generation)
* [Seedance 2.0 / 2.5 동영상 생성](/ko/api-capabilities/seedance2/overview)
* [Wan2.7 동영상 생성](/ko/api-capabilities/wan/overview)
* [VEO 3.1 동영상 생성](/ko/api-capabilities/veo-3-1-official/overview)
* [충전 보너스](/ko/faq/recharge-promotions)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.