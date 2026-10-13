> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan3.0 동영상 생성 (Alibaba Tongyi Wanxiang)

> Alibaba Tongyi Wanxiang Wan3.0 동영상 생성 완벽 가이드입니다. 하나의 모델 ID로 텍스트-동영상, 이미지-동영상, 레퍼런스-동영상 및 동영상 편집을 모두 지원하며, 최대 30초, 480P~1080P, 네이티브 오디오 트랙, Standard 및 Prime 티어별 요금을 제공합니다. 기본 공식 대비 98%, 충전 보너스 적용 시 최저 81.7%(480P 기준 초당 $0.0245)의 요금으로 이용하실 수 있습니다.

## 개요

**Wan3.0은 Tongyi Wanxiang의 올인원 동영상 모델입니다.** 4개의 모델 ID(`t2v` / `i2v` / `r2v` / `videoedit`) 사이를 전환해야 했던 Wan2.7과 달리, Wan3.0은 **단일 모델 ID로 모든 모드를 처리합니다** — 전송하는 미디어에 따라 동작 방식이 결정됩니다. 텍스트 투 비디오, 이미지 투 비디오, 레퍼런스 투 비디오 및 동영상 편집이 모두 하나의 요청 본문을 공유합니다.

기능은 동일하며 속도와 가격이 다른 두 가지 변형이 제공됩니다:

| 모델 ID | 포지션 | 상대적 속도 | 720P 기준 APIYI 가격 | **20% 충전 보너스 적용 시 최저** |
| - | - | - | - | - |
| `wan3.0-video` | 표준 | 기준 속도 | \$0.0588/초 | **\$0.049/초** (≈ ¥0.34/초) |
| `wan3.0-video-prime` | **Prime (더 빠름)** | 더 빠른 생성 | \$0.126/초 | **\$0.105/초** (≈ ¥0.74/초) |

<Info>
  두 변형 모두 **완전히 동일한 파라미터, 엔드포인트 및 미디어 규칙**을 공유하며, 속도와 단가만 다릅니다. 먼저 `wan3.0-video`을(를) 기반으로 개발한 후, 지연 시간에 민감한 프로덕션 트래픽을 `wan3.0-video-prime`(으)로 전환하십시오.
</Info>

## AI 에이전트로 연동 구현하기

<Note>
  Codex / Claude Code / Cursor 기반으로 개발 중이라면 아래 프롬프트를 복사하여 에이전트에 전달하십시오. 에이전트는 먼저 이 페이지의 일반 텍스트 버전을 가져온 후(모든 문서 URL 끝에 `.md` 추가), 프로젝트의 자체 기술 스택에 맞춰 코드를 작성합니다. **`/v1/videos`를 사용하면 안 되는 이유**, `X-DashScope-Async` 누락 오류, `SUCCEEDED`가 아닌 `completed` 최종 상태, 참조 동영상의 재생 시간(초)도 과금된다는 점 등이 요구사항에 이미 모두 반영되어 있습니다.
</Note>

<Prompt description="코딩 에이전트에 Wan3.0 텍스트-동영상, 이미지-동영상, 참조-동영상 및 동영상 편집 기능을 연동하거나 문제를 해결하도록 지시하십시오. Codex, Claude Code, Cursor 및 유사한 도구에 복사하여 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에 Wan3.0 동영상 생성(텍스트-동영상, 이미지-동영상, 참조-동영상, 동영상 편집) 기능을 연동 / 트러블슈팅하십시오.

  코드를 수정하기 전에 먼저 문서를 읽으십시오: 이 페이지의 일반 텍스트 버전은 [https://docs.apiyi.com/en/api-capabilities/wan3/overview.md](https://docs.apiyi.com/en/api-capabilities/wan3/overview.md) 에서 확인하고, API 레퍼런스 페이지는 [https://docs.apiyi.com/en/api-capabilities/wan3/video-generation.md](https://docs.apiyi.com/en/api-capabilities/wan3/video-generation.md) 입니다.

  요구사항:

  1. 엔드포인트 및 비동기 헤더(**작업이 즉시 차단될 가능성이 가장 높은 두 가지**): 제출 요청은 반드시 `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`(으)로 전송해야 하며, **`X-DashScope-Async: enable` 헤더를 반드시 포함해야 합니다**. **절대 `/v1/videos`를 사용하지 마십시오** — 해당 라우트는 `media` 필드를 누락시키고, 해상도 및 재생 시간 매개변수를 무시하며, 과금이 더 높게 잘못 청구됩니다. 폴링에는 **다른 접두사**를 사용합니다: `GET /v1/tasks/{task_id}` (폴링 시에는 비동기 헤더가 필요하지 않습니다).

  2. 폴링 및 상태: 태스크 ID는 제출 응답의 **`output.task_id`** 위치에 있습니다. 5\~10초 간격으로 폴링하되 **절대 3초보다 빠르게 요청하지 마십시오**. 클라이언트 측 전체 타임아웃 상한은 20분으로 설정하십시오(5초 분량 클립 기준 480P는 약 100초, 720P는 120초, 1080P는 170초 소요). 상태값은 `submitted`, `in_progress`, `completed`, `failed`이며, **성공 상태는 DashScope의 네이티브 `SUCCEEDED`가 아닌 `completed`입니다** — 네이티브 enum을 확인할 경우 영원히 폴링을 지속하게 됩니다. `progress` 값이 오랫동안 30%에 멈춰 있는 것은 정상이며, 멈춘 것이 아닙니다. **매개변수 및 미디어 오류 역시 먼저 HTTP 200을 반환한 후 비동기적으로 실패하므로**, 제출 HTTP 상태 코드만으로는 성공 여부를 알 수 없습니다.

  3. 동영상 가져오기: 주소는 최상위 레벨의 \*\*`result_url`\*\*에 있으며, **24시간 후 만료되는** Aliyun OSS 서명 링크입니다. **즉시 서버 측으로 다운로드하여 자체 오브젝트 스토리지나 CDN에 다시 호스팅하십시오**. 이 링크를 장기 보관용 주소로 유지하지 마십시오. 다운로드 시에는 `Authorization` 헤더를 전송하지 **마십시오** — 포함할 경우 403 오류가 반환됩니다.

  4. Body 구조 및 타입: 요청 본문은 평면 객체가 아닌 DashScope의 중첩 형태인 `{ model, input: { prompt, media[] }, parameters: { ... } }`입니다. **`duration`는 문자열 `"5"`이 아닌 정수 `5`이어야 하며**, **`resolution`는 대문자 `480P`, `720P` 또는 `1080P`여야 합니다**.

  5. 모델 및 모드: Wan3.0은 **단일 모델 ID**를 갖습니다. 텍스트-동영상, 이미지-동영상, 참조-동영상 및 동영상 편집은 오직 `input.media[]` 내 각 항목의 `type`에 의해서만 구분됩니다. **Wan2.7의 4가지 모델 ID(`t2v`, `i2v`, `r2v`, `videoedit`)를 복사해 사용하지 마십시오** — 여전히 작동은 하지만 Wan3.0이 아닌 이전 세대 모델을 호출하게 됩니다. `wan3.0-video` (Standard)와 `wan3.0-video-prime` (Prime, 더 빠름)은 완전히 동일한 매개변수를 받으며 속도와 단가만 다르므로, 모델은 설정값으로 분리하십시오. 각 `media` 항목은 `{"type": ..., "url": ...}` 형태를 갖습니다: `media`이 없으면 텍스트-동영상, `first_frame`(선택적으로 `last_frame` 포함)은 이미지-동영상, `reference_image`, `reference_video`, `reference_audio`은 참조-동영상, `file` 및 `link`은 문서나 웹페이지를 동영상으로 변환하는 모드입니다. **`first_frame` / `last_frame`는 `reference_*`, `file` 또는 `link`와 함께 혼용할 수 없습니다** — 업스트림에서 혼용 요청을 거부합니다. 각 `url`는 **태스크가 완료될 때까지 접근 가능한 상태를 유지해야 하는** 공개 GET 호출 가능 https 링크여야 합니다. 여러 입력이 있는 경우, `media` 순서에 따라 프롬프트 내에서 이미지 1, 동영상 1 등으로 참조하십시오.

  6. 주요 매개변수: **항상 `resolution`를 명시적으로 설정하십시오** — 단가를 결정하며, 480P는 1080P의 4분의 1 비용입니다. `duration`을 생략하면 5초로 설정됩니다. **참조 동영상 길이와 출력 `duration`의 합은 총 30초를 초과할 수 없습니다**. 이를 초과할 경우에도 제출 시에는 200이 반환되고 태스크가 `failed` 처리됩니다. `ratio`는 `16:9`, `9:16`, `1:1`, `4:3`, `3:4` 또는 `adaptive`을 지원하며, **첫 프레임 이미지가 제공되면 자동으로 무시됩니다**. `prompt_extend`의 기본값은 `true`이며 켜두는 것이 권장됩니다. `audio`의 기본값은 `true`이므로 출력 동영상에는 기본 오디오 트랙이 포함됩니다.

  7. 과금 및 멱등성: **과금은 초 단위이며 출력 해상도 기준으로 책정되고, 과금 시간(초) = 참조 동영상 길이 + 출력 길이입니다** — 10초 참조 동영상과 2초 출력이면 12초가 과금됩니다. 참조 이미지, 오디오 및 파일은 무료입니다. 비용을 절감하려면 참조 동영상을 먼저 트리밍하십시오. `duration`을 줄여도 입력 동영상의 초 단위 시간은 제외되지 않습니다. **참조 동영상이 포함된 태스크는 제출 시 최대 30초 상한으로 선차감**된 후, 완료 시 차액이 자동으로 환불됩니다(청구 내역에 별도의 음수 항목 표시). 따라서 잔액 여유분을 유지하십시오. `failed`된 태스크는 **전액 환불**되지만, **동일한 태스크를 다시 제출하면 중복 과금됩니다** — 무작정 자동 재시도하지 말고 멱등성을 위해 비즈니스 ID와 `task_id` 간의 매핑을 유지하십시오. 검열 실패 후에는 프롬프트를 수정하고, 미디어 오류 발생 시에는 URL 접근 가능 여부를 확인하십시오. 5xx 및 네트워크 오류에는 지수 백오프(1초, 4초, 16초)를 적용하십시오.

  8. 토큰 요구사항: 이 모델을 사용하려면 **종량제 또는 종량제 우선** 과금 모드가 적용된 `Wan&HappyHorse` 그룹의 토큰이 필요합니다 — **호출당(per-call) 토큰은 이 모델로 라우팅할 수 없으며** 사용 가능한 채널이 없다는 오류가 발생합니다.

  9. 키는 `APIYI_API_KEY` 환경 변수에서 읽어오십시오. 절대 하드코딩하거나 git에 커밋하지 마십시오.

  10. 구현을 완료한 후 실제로 480P 텍스트-동영상 호출 1회와 이미지-동영상 호출 1회를 실행하고, 생성된 동영상과 두 호출에 소요된 비용을 보여주십시오. 전체 흐름에 수분이 소요되므로, 제한된 실행 환경에서 구동하는 경우 명령 타임아웃을 600초 이상으로 늘리거나 백그라운드에서 실행하십시오.
</Prompt>

<Accordion title="이 프롬프트로 방지할 수 있는 문제들">
  | 요구사항 | 방지할 수 있는 함정 |
  | - | - |
  | 절대 `/v1/videos`를 사용하지 마십시오 | 해당 경로는 `media`를 누락시키고, 해상도 및 재생 시간을 무시하며 과도하게 청구됩니다 — 실제로는 잘못된 엔드포인트 문제임에도 매개변수 버그처럼 보입니다 |
  | `X-DashScope-Async` 헤더 | 누락 시 동기 호출로 처리되어 즉시 거부됩니다 |
  | 성공 상태는 `completed`입니다 | DashScope의 네이티브 `SUCCEEDED`를 확인할 경우 폴링 루프가 종료되지 않습니다 |
  | 단일 모델 ID만 사용 | Wan2.7의 4가지 모델 ID를 복사해도 작동은 하지만, 제한 사항과 가격이 다른 이전 세대 모델이 조용히 호출됩니다 |
  | 첫 프레임과 참조 미디어는 상호 배타적입니다 | `first_frame`와 `reference_*`를 함께 사용하는 것은 거부되며, 비동기적으로 `failed` 태스크로 실패합니다 |
  | 참조 동영상 초 단위 재생 시간 과금 | `duration`을 줄여도 입력 초 단위 시간은 제외되지 않으며, 참조 동영상 태스크는 최대 30초 상한으로 선차감됩니다 |
  | 다운로드 시 `Authorization` 제외 | OSS 서명 링크에 인증 헤더를 보내면 403 오류가 반환됩니다 |
</Accordion>

## Wan2.7 대비 변경 사항

| 구분 | Wan2.7 | **Wan3.0** |
| - | - | - |
| 모델 ID | 4개 (t2v / i2v / r2v / videoedit) | **1개** (미디어에 따라 모드 결정) |
| 최대 길이 | 15초 (참조 동영상 사용 시 10초) | **30초** (입력 + 출력 합산) |
| 해상도 | 720P / 1080P | **480P** / 720P / 1080P |
| 오디오 | 립싱크를 위해 `driving_audio` 필요 | **기본적으로 네이티브 오디오 트랙 제공** |
| 720P 가격 | \$0.084/초 | **\$0.0588/초** (약 30% 저렴) |
| 1080P 가격 | \$0.14/초 | **\$0.1176/초** (약 16% 저렴) |

Wan2.7은 계속해서 완전하게 이용하실 수 있습니다 — [Wan2.7 동영상 생성](/ko/api-capabilities/wan/overview)을 참고하십시오.

## 주요 기능

<CardGroup cols={2}>
  <Card title="4가지 모드, 하나의 모델" icon="list-check">
    텍스트 투 비디오, 이미지 투 비디오(첫 프레임/마지막 프레임), 레퍼런스 투 비디오(이미지, 동영상, 오디오) 및 동영상 편집은 하나의 모델 ID와 하나의 엔드포인트를 공유하며, `type`을(를) `input.media[]`에서 지정하여 구분됩니다.
  </Card>

  <Card title="최대 30초" icon="clock">
    요청당 최대 30초(입력 레퍼런스 동영상 + 출력 합산)를 지원하며, 이는 Wan2.7의 15초 대비 2배로 전체 보이스오버 구간이나 숏폼 드라마의 한 샷을 담아내기에 충분합니다.
  </Card>

  <Card title="네이티브 오디오" icon="volume-2">
    출력 결과물에 기본적으로 `soun` 트랙이 포함되어 제공되므로 별도의 드라이빙 오디오가 필요하지 않습니다. 특정한 음색을 원하는 경우에는 `reference_audio`을(를) 사용하십시오.
  </Card>

  <Card title="3가지 해상도 티어" icon="expand">
    새로운 480P 티어는 1080P의 4분의 1 비용으로 제공되므로, 초안을 저렴하게 생성한 후 최종 렌더링을 위해 업스케일할 수 있습니다.
  </Card>
</CardGroup>

## 그룹 설정

Wan3.0은 **`Wan&HappyHorse` 그룹**을 Wan2.7 및 [HappyHorse](/ko/api-capabilities/happyhorse/overview)와 공유하며, 키 하나로 모두 호출할 수 있습니다. 동영상은 **초당** 과금되므로 성공적으로 라우팅하려면 키가 다음 두 가지 조건을 충족해야 합니다:

1. **과금 모드**: "종량제 우선" 또는 "종량제" 선택 — 초당 과금 동영상은 **호출당 과금 키로 라우팅할 수 없습니다**
2. **그룹**: `Wan&HappyHorse` 포함

<Frame caption="Create a key: set billing mode to pay-as-you-go priority and select the Wan&HappyHorse group (0.14x) to call every Wan3.0 / Wan2.7 / HappyHorse video model (the screenshot shows the old group name Wan)">
  <img src="https://mintcdn.com/apiyillc/5-SttsT0c5VQwgVz/images/wan-token-group-setup-20260523.png?fit=max&auto=format&n=5-SttsT0c5VQwgVz&q=85&s=f46887cb88777eb34d70837983f1fc49" alt="Token 생성 화면: 과금 모드를 종량제 우선으로 설정, 그룹 드롭다운을 Wan&HappyHorse (0.14x)로 설정" width="1286" height="988" data-path="images/wan-token-group-setup-20260523.png" />
</Frame>

## 가격 정책

<Info>
  **기본적으로 알리바바 공식 가격의 98%가 적용되며, 최대 충전 보너스 적용 시 최저 81.7%까지 낮아집니다.**
  `wan3.0-video` 기준 480P는 초당 **\$0.0245**(≈ 초당 ¥0.17), 720P는 초당 **\$0.049**(≈ 초당 ¥0.34)에 이용할 수 있습니다.
</Info>

### 요율 산정 방식: 기본 0.98배, 보너스 적용 시 최저 0.817배

콘솔에는 `Wan&HappyHorse` 그룹이 **0.14배** 요율 배수로 표시되며 통화는 **CNY** 기준입니다. APIYI는 **1:7 고정 환율의 USD**로 정산합니다:

```
0.14 (CNY-denominated unit) × 7 (fixed rate) = 0.98
```

따라서 **APIYI의 초당 가격(USD) = 알리바바 공식 초당 CNY 가격 × 0.14**이며, 이는 공식 요율의 98%에 해당합니다.

### 표 1: APIYI 상세 가격 정책 (초당 과금)

| 모델 | 해상도 | 기본 | 10% 보너스 적용 시 | **20% 보너스 적용 시** | 20% 보너스 적용 시 CNY 가격 |
| - | - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.0294/초 | \$0.0267/초 | **\$0.0245/초** | ¥0.1715/초 |
| `wan3.0-video` | 720P | \$0.0588/초 | \$0.0535/초 | **\$0.049/초** | ¥0.343/초 |
| `wan3.0-video` | 1080P | \$0.1176/초 | \$0.1069/초 | **\$0.098/초** | ¥0.686/초 |
| `wan3.0-video-prime` | 480P | \$0.063/초 | \$0.0573/초 | **\$0.0525/초** | ¥0.3675/초 |
| `wan3.0-video-prime` | 720P | \$0.126/초 | \$0.1145/초 | **\$0.105/초** | ¥0.735/초 |
| `wan3.0-video-prime` | 1080P | \$0.252/초 | \$0.2291/초 | **\$0.21/초** | ¥1.47/초 |

| 등급 | 알리바바 공식 가격 대비 비율 | 계산식 |
| - | - | - |
| 기본 | **98%** | 0.14배 요율 배수 × 고정 환율 7 |
| 10% 충전 보너스 (일반) | **\~89.1%** | 0.98 ÷ 1.1 |
| 20% 충전 보너스 (대규모 계정) | **\~81.7%** | 0.98 ÷ 1.2 |

“10% / 20% 보너스 적용 시”는 [충전 보너스](/ko/faq/recharge-promotions)로 적립 잔액이 늘어난 후의 **실질 단가**이며, 매 호출 시 차감되는 금액은 여전히 기본 가격입니다.

### 표 2: 알리바바 공식 가격 대비 구간별 비교

| 모델 | 해상도 | 공식 정가 | 공식 현재가 | APIYI 기본가 (CNY) | 공식 대비 | **20% 보너스 적용 시** |
| - | - | - | - | - | - | - |
| `wan3.0-video` | 480P | ¥0.30/초 | **¥0.21/초** | ¥0.2058/초 | 98% | **¥0.1715/초 · 81.7%** |
| `wan3.0-video` | 720P | ¥0.60/초 | **¥0.42/초** | ¥0.4116/초 | 98% | **¥0.343/초 · 81.7%** |
| `wan3.0-video` | 1080P | ¥1.20/초 | **¥0.84/초** | ¥0.8232/초 | 98% | **¥0.686/초 · 81.7%** |
| `wan3.0-video-prime` | 480P | ¥0.45/초 | ¥0.45/초 | ¥0.441/초 | 98% | **¥0.3675/초 · 81.7%** |
| `wan3.0-video-prime` | 720P | ¥0.90/초 | ¥0.90/초 | ¥0.882/초 | 98% | **¥0.735/초 · 81.7%** |
| `wan3.0-video-prime` | 1080P | ¥1.80/초 | ¥1.80/초 | ¥1.764/초 | 98% | **¥1.47/초 · 81.7%** |

<Info>
  `wan3.0-video`에는 현재 공식적으로 **기간 한정 30% 할인**이 적용 중이며(모든 사용자에게 기본 적용), APIYI 가격 또한 이 할인율을 따릅니다. `wan3.0-video-prime`에는 할인이 적용되지 않습니다. 프로모션이 종료되면 APIYI 가격도 조정됩니다.
</Info>

### 표 3: 주요 생성 시간별 총비용

| 모델 | 해상도 | 5초 | 10초 | 30초 (최대) |
| - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.147 | \$0.294 | \$0.882 |
| `wan3.0-video` | 720P | \$0.294 | \$0.588 | \$1.764 |
| `wan3.0-video` | 1080P | \$0.588 | \$1.176 | \$3.528 |
| `wan3.0-video-prime` | 480P | \$0.315 | \$0.63 | \$1.89 |
| `wan3.0-video-prime` | 720P | \$0.63 | \$1.26 | \$3.78 |
| `wan3.0-video-prime` | 1080P | \$1.26 | \$2.52 | \$7.56 |

### 충전 보너스 중복 혜택

[충전 보너스](/ko/faq/recharge-promotions)를 이용하면 적립 잔액이 최대 약 1.2배로 증가하여 실질 요율이 더욱 낮아집니다:

```
0.98 ÷ 1.2 ≈ 0.816
```

| 등급 | 실질 가격 (알리바바 공식 대비) | 계산식 |
| - | - | - |
| 기본 | **98%** | 0.14배 요율 배수 × 고정 환율 7 |
| 10% 충전 보너스 (일반) | **\~89.1%** | 0.98 ÷ 1.1 |
| 20% 충전 보너스 (대규모 계정, 최고 등급) | **\~81.7%** | 0.98 ÷ 1.2 |

1:7은 프로모션 요율이 아닌 **고정 정산 환율**이며, 모든 USD 충전에 적용됩니다.

<Note>가격은 제공업체의 공식 요율에 맞춰 책정되며 변동 시 함께 조정될 수 있습니다. 위 표는 참고용이며, 상단 내비게이션의 **모델 가격 정책** 탭의 내용이 우선합니다: [모델 가격 정책](/en/models/index).</Note>

## ⚠️ 과금 규칙 (다른 동영상 모델과 상이)

<Warning>
  **과금 시간(초) = 입력 참조 동영상 길이 + 출력 동영상 길이.** Alibaba 공식 안내에 따름: “입력 동영상과 출력 동영상 모두 길이에 따라 과금되며, 단가는 출력 해상도에 의해 결정됩니다.”
</Warning>

| 규칙 | 세부 사항 |
| - | - |
| 참조 **동영상** 시간(초) 과금 | 10초 길이의 `reference_video` 및 2초 출력의 경우 **12초**가 과금됩니다 |
| 참조 **이미지 / 오디오 / 파일**은 무료 | 동영상 자료만 과금 대상 시간에 포함됩니다 |
| 단가는 **출력** 해상도를 따름 | 720P 입력에 1080P 출력인 경우 전체 시간에 대해 1080P 요율이 적용됩니다 |
| 합산 30초 한도 | 입력과 출력을 합산하여 30초를 초과하면 업스트림에서 거부됩니다 |
| `duration` 미전달 시 | 기본값인 5초 출력으로 처리되며, 5초로 과금됩니다 |
| 실패한 작업 | **전액 환불**되며, 지원 티켓을 제출할 필요가 없습니다 |

<Tip>
  비용을 절감하려면 **참조 동영상을 트리밍**하십시오. `duration`을 줄여도 입력 시간(초)은 줄어들지 않습니다. 예: 10초 참조 동영상에 2초 출력을 생성하면 12초가 과금되지만, 참조 동영상을 3초로 트리밍하면 5초만 과금됩니다.
</Tip>

### 사전 승인 및 정산

* **참조 동영상이 없는 경우**: 요청된 `duration` 요금이 선청구되며 이것이 최종 금액이 됩니다. 별도의 정산 내역은 발생하지 않습니다.
* **참조 동영상이 있는 경우**: 제출 시점에 게이트웨이는 입력 동영상의 길이를 알 수 없으므로 **30초 상한선**을 기준으로 사전 승인한 후, 실제 과금된 시간(초)에 따라 재계산하여 차액을 환불합니다(청구서에 별도의 마이너스 내역으로 표시).

<Info>
  상한선 기준 동결로 인해 일시적으로 더 큰 금액이 묶이게 됩니다: 480P는 \$0.147, 720P는 \$0.294, 1080P는 \$0.588(`wan3.0-video`, 30초). 충분한 잔액을 유지해 주시기 바랍니다. 환불은 작업 완료 후 수초 이내에 이루어집니다.
</Info>

## ⚠️ 엔드포인트 선택 (가장 중요)

APIYI는 두 가지 경로를 제공하지만, **DashScope 패스스루 엔드포인트만 Wan3.0을 완벽하게 지원합니다**:

| 경로 | 프로토콜 스타일 | 지원 여부 | 평가 |
| - | - | - | - |
| `/v1/videos` | OpenAI 플랫 스타일 | ❌ 미디어 필드 누락 **및 과금 부정확** | **사용 금지** |
| `/wan/api/v1/services/aigc/video-generation/video-synthesis` | 네이티브 DashScope 패스스루 | ✅ 완벽 지원 | **항상 이것을 사용하십시오** |

<Warning>
  Wan 동영상 작업을 `/v1/videos`(으)로 제출하는 문서나 예제는 무시하십시오. 해당 경로는 `media` 필드를 누락하고, **해상도 및 재생 시간 매개변수를 무시하며 초과 과금됩니다**. 모든 Wan3.0 요청은 `/wan/api/v1/...video-synthesis`(으)로 전송하십시오.
</Warning>

## 비동기 워크플로

<Steps>
  <Step title="작업 생성">
    `X-DashScope-Async: enable` 헤더와 함께 `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`를 호출합니다. 즉시 `task_id`을 반환합니다.
  </Step>

  <Step title="상태 폴링">
    `status`가 `completed`가 될 때까지 5\~10초 간격으로(**3초 미만 금지**) `GET /v1/tasks/{task_id}`(`Authorization` 포함)를 호출합니다.
  </Step>

  <Step title="동영상 다운로드">
    응답에서 `result_url`를 직접 GET합니다 — **`Authorization` 헤더 없이 요청하십시오**(서명된 OSS 링크이므로 인증 정보를 전송하면 403이 반환됩니다). 24시간 동안 유효합니다.
  </Step>
</Steps>

### 작업 상태

| 상태 | 의미 | 다음 단계 |
| - | - | - |
| `submitted` | 대기 중 | 폴링 계속 진행 |
| `in_progress` | 생성 중 | 폴링 계속 진행(진행률이 30%에 머무는 경우가 많음 — 업스트림의 대략적인 보고일 뿐 멈춘 것이 아닙니다) |
| `completed` | 완료 | `result_url`에서 다운로드 |
| `failed` | 실패 | `error.message` / `fail_reason` 확인; **과금되지 않음** |

<Warning>
  최종 상태 값은 DashScope 네이티브의 `SUCCEEDED` / `FAILED`가 아닌 \*\*`completed` / `failed`\*\*입니다. 네이티브 enum을 기준으로 작성된 코드는 무한히 폴링하게 됩니다.
</Warning>

<Tip>
  **유효하지 않은 매개변수 또한 동기식 400이 아니라 먼저 HTTP 200을 반환한 후 비동기식으로 실패합니다** — 접근할 수 없는 미디어 URL이나 입력+출력 총합이 30초를 초과하는 문제 등은 최종 상태까지 폴링해야만 나타납니다. 제출 시 반환되는 상태 코드만 신뢰해서는 안 됩니다.
</Tip>

### 전체 Python 클라이언트

```python theme={null}
import json, time, urllib.request

BASE = "https://api.apiyi.com"
KEY  = "sk-your-api-key"   # your APIYI key

def post(path, body):
    h = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
         "X-DashScope-Async": "enable"}
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers=h, method="POST")
    return json.loads(urllib.request.urlopen(req).read())

def get(path):
    req = urllib.request.Request(BASE + path, headers={"Authorization": f"Bearer {KEY}"})
    return json.loads(urllib.request.urlopen(req).read())

# 1. Create the task (switch modes by changing input.media only — model ID stays the same)
r = post("/wan/api/v1/services/aigc/video-generation/video-synthesis", {
    "model": "wan3.0-video",
    "input": {"prompt": "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks, seagulls"},
    "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 5, "prompt_extend": True}
})
task_id = r["output"]["task_id"]
print("task_id:", task_id)

# 2. Poll every 5–10 seconds
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

# 3. Download (no Authorization header! result_url is a signed OSS link)
urllib.request.urlretrieve(url, "out.mp4")
print("saved out.mp4")
```

## 매개변수 참조

요청 본문은 중첩된 DashScope 구조를 사용합니다: `{ model, input: { prompt, media[] }, parameters: {...} }`.

### `input` 필드

| 필드 | 타입 | 필수 여부 | 설명 |
| - | - | - | - |
| `prompt` | string | ✓ | 자연어 설명입니다. 여러 에셋이 있는 경우 prompt에서 “image 1 / video 1”과 같이 지칭하십시오 |
| `negative_prompt` | string | | 부정 prompt |
| `media` | array | 텍스트-동영상 생성이 아닌 경우 필수 | 미디어 에셋 배열, 아래 내용 참조 |

### `media[]` 타입 및 선택되는 모드

| `type` | 모드 | 참고 사항 |
| - | - | - |
| `media` 없음 | **텍스트-동영상 생성** | prompt만 사용 |
| `first_frame` | **이미지-동영상 생성** | 이 이미지를 첫 프레임으로 사용 |
| `last_frame` | 첫 프레임/마지막 프레임 동영상 | `first_frame`와(과) 짝을 이룸 |
| `reference_image` | **참조-동영상 생성** | 피사체 / 의상 / 장면 일관성 유지 |
| `reference_video` | 참조-동영상 생성 / 편집 | **이 동영상의 재생 시간은 과금 대상입니다** |
| `reference_audio` | 음성 / 리듬 참조 | 과금되지 않음 |
| `file` / `link` | 문서 또는 웹페이지 기반 동영상 생성 | 과금되지 않음 |

<Warning>
  **`first_frame` / `last_frame`은(는) `reference_*` / `file` / `link`와(과) 함께 혼용할 수 없습니다** — 두 에셋 제품군은 상호 배타적이며, 혼용 시 업스트림에서 거부됩니다.
</Warning>

모든 미디어 객체에는 최소한 `type` 및 `url`이 필요합니다. `url`은 공개적으로 접근 가능한 https 링크여야 합니다(로컬 파일을 먼저 OSS / CDN에 업로드하고, **작업이 완료될 때까지 접근 가능한 상태를 유지하십시오**).

### `parameters` 필드

| 필드 | 타입 | 값 | 설명 |
| - | - | - | - |
| `resolution` | string | `480P` / `720P` / `1080P` | 대문자. **명시적으로 설정하십시오** — 단가를 결정합니다 |
| `ratio` | string | `16:9` / `9:16` / `1:1` / `4:3` / `3:4` / `adaptive` | 화면비; 첫 프레임이 제공되면 무시됩니다 |
| `duration` | int | 정수(초) | 출력 길이; 기본값은 5입니다. **입력 + 출력의 합계가 ≤ 30이어야 합니다** |
| `prompt_extend` | bool | `true` / `false` | prompt 재작성, 기본값은 `true` — **켜짐 상태를 유지하십시오** |
| `audio` | bool | `true` / `false` | 오디오 트랙 출력 여부, 기본값은 `true` |
| `watermark` | bool | `true` / `false` | 우측 하단의 “AI generated” 워터마크 |
| `seed` | int | 0–2147483647 | 값을 고정하면 재현성이 향상됩니다 |

<Tip>
  `duration`은(는) 반드시 **정수**여야 하며(`5`, `"5"` 아님), `resolution`은(는) **대문자**(`720P`)로 지정하는 것이 더 안정적입니다.
</Tip>

## 선택 가이드: Wan3.0 / Wan2.7 / HappyHorse

| 시나리오 | 권장 선택 |
| - | - |
| 30초 클립, 저렴한 480P 티어 또는 네이티브 오디오가 필요한 경우 | **Wan3.0** |
| 오디오 기반 립싱크(`driving_audio`)가 필요한 경우 | [Wan2.7 `i2v`](/ko/api-capabilities/wan/overview) |
| 지연 시간에 민감한 프로덕션 트래픽 | **`wan3.0-video-prime`** |
| 유사한 기능에 더 낮은 단가를 원하는 경우 | [HappyHorse](/ko/api-capabilities/happyhorse/overview) |

## 모범 사례

<AccordionGroup>
  <Accordion title="480P에서 반복 테스트하고, 최종본은 1080P로 렌더링하십시오" icon="wallet">
    480P 비용은 1080P의 4분의 1 수준입니다. 적은 비용으로 prompt와 카메라 움직임을 먼저 확정하십시오. 5초 분량의 1080P 렌더링 1회 비용으로 4개의 초안을 제작할 수 있습니다.
  </Accordion>

  <Accordion title="업로드 전에 참조 동영상을 자르십시오" icon="scissors">
    입력 동영상의 재생 시간(초)에 따라 과금됩니다. 클립에서 3초만 필요하다면 30초 분량의 원본을 업로드하지 마십시오. 이는 Wan3.0에서 가장 빠지기 쉬운 비용 함정입니다.
  </Accordion>

  <Accordion title="단순한 그림이 아닌 움직임을 묘사하십시오" icon="pen-line">
    동영상 모델은 “누가 무엇을 하고, 카메라가 어떻게 움직이는지”에 반응합니다. “창가에서 기지개를 켜는 치즈 고양이, 서서히 돌리 인”이 “귀여운 치즈 고양이, 햇빛, 고화질”보다 훨씬 더 나은 결과를 생성합니다.
  </Accordion>

  <Accordion title="3초보다 빠른 간격으로 폴링하지 마십시오" icon="timer">
    5초 클립 기준 실측 소요 시간: 480P에서 약 100초, 720P에서 약 120초, 1080P에서 약 170초입니다. 5\~10초 간격으로 폴링해도 충분합니다.
  </Accordion>

  <Accordion title="실패 시 동일한 prompt로 자동 재시도하지 마십시오" icon="repeat">
    실패한 작업은 전액 환불되지만, 다시 제출하면 **다시 과금**됩니다. 검열 실패 시에는 prompt를 수정하고, 에셋 관련 오류인 경우 먼저 URL 접근 가능 여부를 확인하십시오.
  </Accordion>
</AccordionGroup>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="과금된 시간(초)이 출력 동영상보다 긴 이유는 무엇인가요?">
    과금 시간(초) = **입력 참조 동영상 길이 + 출력 길이**입니다. 10초 참조 동영상과 2초 출력의 경우 12초가 과금됩니다. 참조 이미지, 오디오 및 파일은 무료입니다.
  </Accordion>

  <Accordion title="제출 시 큰 금액이 청구된 후 환불된 이유는 무엇인가요?">
    참조 동영상이 포함된 작업은 30초 한도로 사전 승인된 후, 실제 과금된 시간(초)을 기준으로 정산하여 차액을 환불합니다. 청구서에서 마이너스 조정 항목을 확인할 수 있습니다.
  </Accordion>

  <Accordion title="작업 상태가 in_progress로 유지되고 진행률이 30%에서 멈춰 있나요?">
    이는 업스트림의 대략적인 보고일 뿐, 작업이 중단된 것이 아닙니다. 1080P 또는 긴 클립은 3\~5분이 걸릴 수 있습니다. 계속 폴링을 수행하십시오.
  </Accordion>

  <Accordion title="다운로드 시 result_url이 403을 반환하나요?">
    `Authorization` 헤더를 전송하지 **마십시오**. 서명된 OSS 링크입니다. 링크는 24시간 후 만료되므로 신속하게 재호스팅하십시오.
  </Accordion>

  <Accordion title="제출 시 200이 반환되었지만 작업이 실패했나요?">
    매개변수 및 에셋 오류는 동기식 400이 아닌 비동기식으로 실패 처리됩니다. 일반적인 원인: 접근할 수 없는 미디어 URL(만료된 서명 링크 포함), 입력 + 출력이 30초를 초과함, 콘텐츠 검열. 실패한 작업은 전액 환불됩니다.
  </Accordion>

  <Accordion title="Getting &#x22;no available channel for this model&#x22;?">
    키의 **과금 모드**가 종량제인지(호출당 과금 키는 동영상 모델을 라우팅할 수 없음), 해당 **그룹**에 `Wan&HappyHorse`이 포함되어 있는지 확인하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="동영상 생성 API 레퍼런스" icon="code" href="/ko/api-capabilities/wan3/video-generation">
    라이브 Playground 및 cURL / Python / Node 샘플
  </Card>

  <Card title="Wan2.7 동영상 생성" icon="video" href="/ko/api-capabilities/wan/overview">
    오디오 기반 립싱크를 지원하는 이전 4개 모델 세대
  </Card>

  <Card title="HappyHorse 동영상 생성" icon="horse" href="/ko/api-capabilities/happyhorse/overview">
    동일한 그룹의 다른 동영상 시리즈
  </Card>

  <Card title="모델 요금" icon="dollar-sign" href="/en/models/index">
    사이트 전체의 공식 요금표
  </Card>
</CardGroup>

공식 참고 자료: `help.aliyun.com/zh/model-studio/wan3-video-generation-guide`, `help.aliyun.com/zh/model-studio/wan3-video-generation-api-reference`


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.