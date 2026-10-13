> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream 이미지 생성 및 편집

> ByteDance BytePlus ModelArk Seedream 이미지 생성 모델에 대한 완벽 가이드입니다 — 단일 연동으로 5.0 Flash / 5.0 Pro / 5.0 / 4.5 / 4.0 지원, 약 15–20초 만에 요청당 $0.018로 제공되는 5.0 Flash, 4K 출력, 다중 이미지 융합, 배치 시퀀스 생성, 참조 이미지 편집을 모두 단일 엔드포인트에서 제공합니다.

## 개요

**Seedream**은 ByteDance BytePlus ModelArk의 플래그십 이미지 생성 모델 시리즈로, **통합 생성-편집 아키텍처**를 갖추고 있습니다. 텍스트-이미지 생성, 단일 이미지 편집, 다중 이미지 합성, 배치 시퀀스 생성이 모두 하나의 `/v1/images/generations` 엔드포인트를 통해 실행되며 파라미터만 다릅니다. APIYI는 BytePlus와 전략적 파트너십을 맺고 모든 활성 버전을 출시 당일부터 통합하여 제공합니다.

<Note>
  **🎨 주요 특징**: 새로운 **5.0 Flash**는 **요청당 \$0.018**의 비용으로 약 15\~20초 만에 결과를 반환하며, 대규모 에셋 제작을 위한 강력한 레이아웃과 텍스트 렌더링 성능을 갖추고 있습니다. 전체 시리즈는 단일 연동 방식 + 4K 출력 + 합성을 위한 최대 10장의 참조 이미지 지원 + 배치(입력 + 출력 ≤ 15) + 업계 최고 수준의 텍스트 렌더링 기능을 공유합니다. **이커머스 히어로 이미지, 광고 포스터, 제품 사진, 콘텐츠 제작에 이상적입니다** — 고품질과 가독성 높은 텍스트가 필요한 모든 작업에 적합합니다.
</Note>

<Info>
  모든 이미지 API는 **동기식**으로 작동합니다 — 폴링할 작업 ID가 없으며, 클라이언트 연결이 끊어지면 결과가 유실되더라도 해당 요청에 대한 과금은 그대로 발생합니다. 이 모델에는 타임아웃을 넉넉하게 설정하십시오. 자세한 내용은 [이미지 API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

<Note>
  **이 모델은 어떤 Seedream인가요?** APIYI는 중국 본토 Doubao / Volcengine 버전이 아닌 **공식 해외 BytePlus(글로벌) 리소스**를 통해 Seedream을 제공합니다. 글로벌 버전은 중국 내수용 버전에 비해 상대적으로 유연한 콘텐츠 검열 정책을 적용하여 더 높은 창작의 자유도를 제공하며, 이는 본 플랫폼의 확실한 강점입니다. 하지만 **검열이 전혀 없다는 의미는 아닙니다**. BytePlus는 여전히 자체 콘텐츠 안전 검사를 실행하므로, 정책을 위반한 prompt나 참조 이미지는 400/403 오류와 함께 거부됩니다(거부된 요청에는 과금되지 않습니다). 규정을 준수하여 사용하여 주십시오.
</Note>

<CardGroup cols={2}>
  <Card title="텍스트-이미지 API" icon="wand-sparkles" href="/ko/api-capabilities/seedream-image/text-to-image">
    `POST /v1/images/generations`. prompt를 기반으로 1K / 2K / 3K / 4K 또는 정확한 픽셀 크기의 이미지를 생성합니다.
  </Card>

  <Card title="이미지 편집 API" icon="image" href="/ko/api-capabilities/seedream-image/image-edit">
    `image` 파라미터를 사용하는 동일한 엔드포인트입니다. 단일 이미지 편집, 다중 이미지 합성 및 배치 시퀀스(최대 15장 이미지) 생성을 지원합니다.
  </Card>

  <Card title="이전 버전" icon="rotate-ccw-clock" href="/ko/api-capabilities/seedream-image/historical-versions">
    5.0 Flash / 5.0 Pro / 5.0 / 4.5 / 4.0 스펙 비교, 가격 차이 및 마이그레이션 가이드를 제공합니다.
  </Card>
</CardGroup>

## AI 에이전트에게 연동 맡기기

<Note>
  Codex / Claude Code / Cursor 환경에서 개발 중이라면 아래 prompt를 복사하여 에이전트에게 전달하십시오. 에이전트는 먼저 이 페이지의 일반 텍스트 버전을 가져온 다음(모든 문서 URL 끝에 `.md` 추가), 프로젝트 자체 스택에 맞춰 코드를 작성합니다. 타임아웃 설정, URL 결과의 즉각적인 재호스팅, multipart 대신 URL 배열을 통한 편집, 그리고 `seedream-5-0-pro`에서 거부하는 파라미터 처리 등이 이미 요구사항에 반영되어 있습니다.
</Note>

<Prompt description="코딩 에이전트가 Seedream 텍스트 기반 이미지 생성 및 이미지 편집을 연동하거나 문제를 해결하도록 하십시오. Codex, Claude Code, Cursor 및 유사한 도구에 복사하여 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 Seedream 텍스트 기반 이미지 생성 및 이미지 편집을 연동/문제 해결하십시오.

  코드를 수정하기 전에 문서를 먼저 읽으십시오. 이 페이지의 일반 텍스트 버전을 확인하려면 [https://docs.apiyi.com/en/api-capabilities/seedream-image/overview.md](https://docs.apiyi.com/en/api-capabilities/seedream-image/overview.md) 를 가져오십시오(fetch). 더 자세한 파라미터 세부 정보를 확인하려면 텍스트 기반 이미지 생성 및 이미지 편집 페이지에도 동일한 방식으로 `.md`을 추가하십시오.

  요구사항:

  1. 타임아웃: 모델별로 클라이언트 타임아웃을 계층화하십시오. 4.x 시리즈 및 `seedream-5-0-flash`은 60초부터 시작하고(참조 이미지가 10장인 경우 flash는 약 30초 소요), `seedream-5-0`의 경우 120초로 늘리며, **이미지당 약 2분이 소요되는 `seedream-5-0-pro`의 경우 240초로 늘리십시오**. 이미지 API는 동기식으로 동작합니다. 작업 ID가 없으므로 클라이언트 연결이 끊어지면 요청에 대해 과금이 발생하더라도 결과를 잃게 됩니다. 역방향 프록시, 게이트웨이 및 서버리스 실행 제한 시간도 모두 넉넉하게 늘려야 합니다.

  2. 응답 처리: 기본값은 `url`(약 24시간 후 만료되는 BytePlus TOS 임시 서명 링크)이며, 대신 `response_format`을 `b64_json`으로 설정하여 전달하면 순수 base64(`data:` 접두사 없음)로 받을 수 있습니다. URL을 사용하는 경우 **즉시 다운로드하여 자체 오브젝트 스토리지에 재호스팅하십시오**. 데이터베이스에 업스트림 링크를 영구 주소로 저장해서는 안 됩니다. base64를 사용하는 경우 이를 렌더링하고 디스크 저장 작업을 제공하십시오. 기본값에 의존하지 말고 `response_format`을 명시적으로 전송하십시오.

  3. 참조 이미지 업로드(**다른 이미지 모델과의 가장 큰 차이점**): Seedream은 통합 생성 및 편집 아키텍처를 사용하므로 **`/v1/images/edits` 엔드포인트가 없습니다** — 생성과 편집 모두 `application/json` 형식으로 `/v1/images/generations`을 호출합니다. 참조 이미지는 `image` 필드에 들어가며, 이는 multipart 파일 업로드나 반복되는 `image[]` 필드가 아닌 **URL 배열**입니다. 배열 항목은 이미지 URL이거나 `data:image/jpeg;base64,...` 형태의 data URL일 수 있으며, 두 방식을 혼용할 수 있습니다. 최대 10장의 참조 이미지가 허용되며, **입력 이미지와 출력 이미지를 합쳐서 15장을 초과할 수 없습니다**. `mask` 필드는 없습니다. 용량이 큰 로컬 파일의 경우 먼저 자체 오브젝트 스토리지에 업로드한 후 URL을 전달하십시오. data URL을 사용하는 경우 먼저 압축하십시오. 1.5MB를 초과하는 파일만 처리하고, 가로세로 비율을 유지하면서 긴 쪽을 2048px로 축소하며(작은 이미지는 절대 확대하지 마십시오), 품질 0.9로 재인코딩하고, 다중 이미지 요청 시 전체 합산 크기를 6MB 미만으로 유지하십시오. 한 이미지의 압축에 실패하더라도 원본으로 폴백하여 계속 진행하십시오.

  4. 파라미터 주의사항: 이 모델에는 **`quality` 파라미터가 없습니다** — 해상도 및 완성도는 모델 버전과 `size`에 의해 결정됩니다. `size`은 단계별 옵션(`1K` / `2K` / `3K` / `4K`, 기본값 `2K`) 또는 정확한 픽셀 값을 받습니다. `seedream-5-0-pro`은 2048x2048에서 약 419만 픽셀로 제한되며, `seedream-5-0-flash`은 약 462만 픽셀의 정확한 픽셀 상한과 함께 `1K` / `1.5K` / `2K`만 제공합니다. **두 모델 모두 3K나 4K 티어를 지원하지 않습니다**. `n`은 **오류 없이 무시되며**(여전히 1장의 이미지만 반환되고 1장 분량만 과금됨), 여러 장의 결과물이 필요한 경우 `sequential_image_generation`을 사용하십시오. `seed`은 4.x 또는 5.x에서 아무런 효과가 없습니다. 상업적 용도로 사용하는 경우 **항상 `watermark`을 false로 설정하여 전송하십시오**. 버전별로 기본값이 다르기 때문입니다(`seedream-5-0-flash`은 해당 필드가 생략되면 “AI generated” 워터마크를 추가함). `output_format`은 5.0 시리즈에서만 png를 지원하며, 4.5 및 4.0은 알파 채널 없이 jpeg만 출력합니다. `seedream-5-0-flash`을 직접 생성할 때는 알파 채널이 없는 png가 반환됩니다. 투명 애셋이 필요한 경우 `layer_decomposition: true`을 사용하십시오(출력 이미지당 과금되며 대개 12장 이상).

  5. `seedream-5-0-pro` 및 `seedream-5-0-flash`에 대한 두 가지 절대 금지 사항: **`sequential_image_generation`을 절대 전송하지 마십시오. `"disabled"`을 포함한 어떤 값이든 400 에러를 반환합니다** — 그리고 **`stream`도 전송하지 마십시오**(마찬가지로 400 반환). 5.0 또는 4.x에서 코드를 이전하는 경우 두 필드를 완전히 제거하십시오.

  6. `APIYI_API_KEY` 환경 변수에서 키를 읽어오고 [https://api.apiyi.com/v1](https://api.apiyi.com/v1) 을 기본 URL로 사용하십시오. 절대 하드코딩하거나 git에 커밋하지 마십시오. OpenAI SDK를 통해 호출할 때는 `image`, `sequential_image_generation`, `watermark`, `output_format` 파라미터가 `extra_body` 내부에 포함되어 전달되어야 합니다.

  7. 완료되면 실제로 텍스트 기반 이미지 생성 호출 1회와 이미지 편집 호출 1회를 실행한 후, 결과와 해당 두 호출에 발생한 비용을 보여주십시오.
</Prompt>

<Accordion title="이 prompt를 통해 방지할 수 있는 문제들">
  | 요구사항 | 방지하는 문제점 |
  | - | - |
  | 편집 시 multipart 미사용 | Seedream에는 `/v1/images/edits`이 없습니다. 참조 이미지는 JSON URL 배열이므로 OpenAI 스타일의 multipart 방식은 완전히 실패합니다 |
  | 서버 측에서 즉시 재호스팅 | 업스트림 링크는 약 24시간 후에 만료되므로, 이를 장기 저장하면 점진적으로 404 오류가 발생합니다 |
  | 모델별 타임아웃 계층화 | `seedream-5-0-pro`은 약 2분이 소요되므로 60초 타임아웃이 지속적으로 발생합니다. 또한 **연결이 끊어진 요청도 여전히 과금됩니다**. [이미지 API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오 |
  | `5-0-pro` / `5-0-flash`의 두 가지 금지 필드 | `sequential_image_generation`은 `"disabled"`으로 설정하더라도 400을 반환합니다 — 다른 버전에서 코드를 이전할 때 가장 빠지기 쉬운 함정입니다 |
  | `n`에 의존하지 않음 | 오류 없이 무시되며 여전히 1장의 이미지만 생성됩니다. 대신 `sequential_image_generation`을 사용하십시오 |
  | `watermark`을 false로 설정하여 전송 | 버전마다 기본값이 다르므로 상업용 출력물에 워터마크가 찍혀 반환될 수 있습니다 |
</Accordion>

## APIYI의 Seedream을 선택해야 하는 이유

BytePlus ModelArk 공식 채널을 즉각 대체할 수 있으며, **안정성**, **비용**, **통합**이라는 세 가지 핵심 축을 바탕으로 프로덕션 환경에 최적화되어 있습니다:

<CardGroup cols={2}>
  <Card title="전략적 파트너십 · 안정적인 리소스" icon="shield-check">
    BytePlus ModelArk 공식 인증 직접 연결을 제공합니다. 요청 및 응답 동작이 업스트림과 완전히 동일하며, **프로토콜 우회 없이** 프로덕션 환경에서도 안전하게 사용할 수 있습니다.
  </Card>

  <Card title="동시 실행 수 무제한 · 엔터프라이즈 환경 지원" icon="infinity">
    배치 생성, 다중 이미지 합성, 시퀀스 생성을 위한 선형 확장을 지원하며 Tier 방식의 계정 제한이 없습니다. **기본 500 RPM**을 제공하며, 더 높은 쿼터가 필요하시면 영업팀에 문의해 주시기 바랍니다.
  </Card>

  <Card title="동일한 가격 + 충전을 통한 최대 20% 할인" icon="percent">
    기본 단가는 BytePlus 공식 가격과 동일합니다. [충전 보너스](/ko/faq/recharge-promotions) 혜택을 결합하면 실질 가격은 정가의 **최저 80% 수준까지** 낮아집니다(5.0 Flash의 경우 공식 요율 대비 약 9%\~17% 저렴).
  </Card>

  <Card title="전 세계 어디서나 제약 없는 액세스" icon="globe">
    **해외 서버나 프록시가 필요하지 않습니다**. 중국 본토 데이터 센터, 주거용 네트워크, 해외 노드에서 `api.apiyi.com`에 직접 연결할 수 있습니다. BytePlus `ap-southeast-1` / `eu-west-1` 리전을 위한 라우팅을 별도로 설정할 필요가 없습니다.
  </Card>

  <Card title="OpenAI 호환 · 코드 변경 제로" icon="plug">
    경로 `/v1/images/generations`은 OpenAI와 동일합니다. OpenAI SDK의 `base_url`을 APIYI로 지정하고 기존 API를 그대로 호출하십시오. 확장 매개변수(`image` / `sequential_image_generation` 등)는 `extra_body`를 통해 전달할 수 있습니다. 단, OpenAI의 `n` 매개변수는 업스트림에서 지원되지 않으며(오류 없이 무시되어 이미지 1장만 반환됨), 다중 이미지를 출력하려면 `sequential_image_generation`를 사용하십시오.
  </Card>

  <Card title="전문 기술 지원 · 엔터프라이즈 컨시어지" icon="handshake">
    다중 이미지 합성, 텍스트 렌더링, 대량 에셋 생성 등 이미지 생성 활용 사례에 대한 깊이 있는 전문 지식을 보유하고 있습니다. PoC부터 프로덕션 배포까지 전 과정을 지원합니다.
  </Card>
</CardGroup>

## 주요 기능

<CardGroup cols={2}>
  <Card title="4K 고충실도 출력" icon="expand">
    4.0 / 4.5는 풍부한 디테일 레이어를 갖춘 네이티브 4K (4096×4096)를 지원합니다 — 포스터와 인쇄에 이상적입니다. 5.0-lite는 최대 3K까지 지원하지만 전반적으로 더 세련된 경험을 제공합니다.
  </Card>

  <Card title="생성-편집 통합" icon="wand-sparkles">
    Text-to-image, 단일 이미지 편집, 다중 이미지 융합, 배치 시퀀스가 모두 **하나의 엔드포인트와 하나의 파라미터 세트**를 공유합니다. `image`와 `sequential_image_generation`를 통해 모드를 전환합니다.
  </Card>

  <Card title="다중 이미지 융합 · 최대 10개 참조" icon="layers">
    `image`은 URL 배열을 받습니다. 명시적인 순서를 위해 prompt에서 「이미지 1 / 이미지 2」를 참조하십시오. `sequential_image_generation: "disabled"`와 함께 사용하면 주제 일관성이 유지되는 융합을 구현합니다.
  </Card>

  <Card title="텍스트 렌더링의 돌파구" icon="type">
    4.5 릴리스는 작은 글자 가독성을 크게 개선했습니다. 포스터, 광고 문구, 제품 텍스트가 선명하고 정확하며 — 동급 최고입니다.
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="배치 시퀀스(최대 15개)" icon="images">
    `sequential_image_generation: "auto"`와 `max_images`를 함께 사용하면 일관된 시리즈를 생성합니다 — 스토리보드, 브랜드 비주얼, 제품 시리즈에 적합합니다.
  </Card>

  <Card title="이미지당 약 15초 · 균형 잡힌 속도" icon="bolt">
    단일 이미지의 일반적인 지연 시간은 약 15초이며, 4K + hd는 최대 1분까지 걸릴 수 있습니다. **500 RPM** 기본 제공, 요청 시 확장 가능합니다.
  </Card>

  <Card title="유연한 크기 · 임의의 종횡비" icon="ruler">
    해상도 프리셋 (`1K`/`2K`/`3K`/`4K`) 또는 정확한 픽셀 지정. 총 픽셀 ∈ \[1280×720, 4096×4096], 종횡비 ∈ \[1/16, 16].
  </Card>

  <Card title="즉시 사용 가능한 OpenAI SDK" icon="plug">
    `base_url=https://api.apiyi.com/v1`을 설정하고 공식 OpenAI SDK로 호출합니다. 확장 파라미터는 `extra_body`를 통해 전달됩니다. 마이그레이션 시 코드 변경이 전혀 필요 없습니다.
  </Card>
</CardGroup>

## 요금 안내

이미지당 과금 방식이며, **BytePlus 공식과 동일한 가격**입니다. 충전 보너스를 적용하면 실질 단가가 더욱 낮아집니다.

| 모델 | APIYI 가격 | 정가 (RMB 추정치) | 상태 |
| - | - | - | - |
| `seedream-5-0-flash-260915` | \$0.018 / 요청 (이미지 1장) | ≈ ¥0.126 / 요청 | 🆕 최신 · fast 티어 (이미지당 약 15\~20초, 시리즈 중 가장 저렴) |
| `seedream-5-0-pro-260628` | \$0.12 / 요청 (이미지 1장) | ≈ ¥0.84 / 요청 | Pro 티어 (이미지당 약 2분 소요, 일상 작업에는 5.0-lite 권장) |
| `seedream-5-0-260128` | \$0.035 / 이미지 | ≈ ¥0.245 / 이미지 | ✅ 추천 |
| `seedream-4-5-251128` | \$0.04 / 이미지 | ≈ ¥0.28 / 이미지 | ✅ 추천 |
| `seedream-4-0-250828` | \$0.03 / 이미지 | ≈ ¥0.21 / 이미지 | 🟡 유지 관리 중 (호출 가능) |

<Info>
  **과금 안내**:

  * prompt 길이나 합성 모드와 관계없이 생성된 이미지당 과금됩니다
  * `seedream-5-0-flash`은 BytePlus 공식 가격과 동일하게 **요청당 \$0.018 고정 과금**되며, **참조 이미지는 무료**입니다 (자체 테스트 결과 참조 이미지 1장, 3장, 10장 모두 각각 \$0.018 과금됨)
  * `seedream-5-0-pro`은 **요청당 \$0.12 고정 과금**됩니다 (요청당 이미지 1장, 배치 시퀀스 미지원). 공식적으로 해당 모델은 두 단계의 출력 픽셀 가격 티어(2.36M px 이하 및 2.36M px 초과 요금)와 첫 번째 이후의 참조 이미지에 대한 장당 수수료를 적용하지만, APIYI는 이를 요청당 단일 요금으로 단순화했습니다 — **티어 구분 없음, 입력 이미지 요금 포함**. 이 모델에는 **어떠한 공식 할인도 적용되지 않으며**, APIYI는 공급 보장 기준으로 가격을 책정하여 충전 보너스와 세금 비용을 감안하면 실질적으로 마진이 없습니다. 가격 변동이 있을 경우 사전에 안내해 드립니다
  * `sequential_image_generation: "auto"` 모드에서는 실제 출력 수량에 따라 과금됩니다 (예: `max_images: 4` 출력 결과가 4장인 경우 → 4장 과금)
  * 실패한 요청(4xx / moderation 차단)은 **과금되지 않습니다**
  * 무료 체험: 최초 온보딩 시 무료 이미지 200장 제공 (BytePlus 제공)
  * 충전 보너스 상세 정보: [충전 프로모션](/ko/faq/recharge-promotions) 참조
</Info>

## 기술 사양

| 구분 | seedream-5-0-flash | seedream-5-0-pro | seedream-5-0 | seedream-4-5 | seedream-4-0 |
| - | - | - | - | - | - |
| **모델 ID** | `seedream-5-0-flash-260915` | `seedream-5-0-pro-260628` | `seedream-5-0-260128` | `seedream-4-5-251128` | `seedream-4-0-250828` |
| **모델 ID 별칭** | — | — | `seedream-5-0-lite-260128` | — | — |
| **출시일** | 2026-09-15 (UTC+8) | 2026-06-28 (UTC+8) | 2026-01-28 (UTC+8) | 2025-11-28 (UTC+8) | 2025-08-28 (UTC+8) |
| **해상도 등급** | 1K / 1.5K / 2K + 정확한 WxH (총 0.92M–4.62M px, 종횡비 ≤ 16:1) | 1K / 2K + 정확한 WxH (총 px ≤ 4.19M; 16:9 비율 기준 가장 긴 변 최대 2720, 약 2.7K) | 2K / 3K | 2K / 4K | 1K / 2K / 4K |
| **출력 형식** | `png` / `jpeg` (레이어 분리를 통한 투명 레이어) | `png` / `jpeg` | `png` / `jpeg` | `jpeg` | `jpeg` |
| **prompt 최적화** | 표준 | 표준 / 고속 | 표준 | 표준 | 표준 / 고속 |
| **텍스트-이미지 생성** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **단일 이미지 편집** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **다중 이미지 합성** | ✅ (최대 10장) | ✅ (최대 10장) | ✅ | ✅ (최대 10장) | ✅ |
| **배치 시퀀스** | ❌ (전달 시 400 반환) | ❌ (전달 시 400 반환) | ✅ | ✅ | ✅ |
| **스트리밍 출력** | ❌ (전달 시 400 반환) | ❌ (전달 시 400 반환) | ✅ | ✅ | ✅ |
| **분당 최대 이미지 수 (RPM)** | 500 | 500 | 500 | 500 | 500 |
| **단일 요청 입력 + 출력** | 입력 ≤ 10, 출력 1 | 입력 ≤ 10, 출력 1 | ≤ 15 | ≤ 15 | ≤ 15 |
| **일반적인 지연 시간** | 15\~20초 | 약 2분 | 약 30초 | 10\~20초 | 10\~15초 |
| **응답 필드** | 동일 | 동일 | `data[].url` 또는 `data[].b64_json` | 동일 | 동일 |

## 생성 시간 비교

버전별 단일 요청 측정 지연 시간(2026-07 측정, 5.0 Flash는 2026-09-24 측정, UTC+8; 요청부터 전체 응답까지의 실제 소요 시간 — 요청별 일반적인 편차가 발생할 수 있습니다):

| 시나리오 | seedream-4-0 | seedream-4-5 | seedream-5-0 | seedream-5-0-pro | seedream-5-0-flash |
| - | - | - | - | - | - |
| 텍스트 투 이미지 (1K/2K) | 7-11s | 8-13s | 29-34s | **110-130s** | 14-20s |
| 텍스트 투 이미지 (최고 등급) | \~15s (4K) | \~18s (4K) | \~37s (3K) | \~134s (WxH 2720×1530, 최대 크기) | \~19s (WxH 2688×1712, 최대 크기) |
| 편집 / 다중 이미지 합성 | \~11s | 17-21s | 38-40s | **115-132s** | ~~16s (이미지 1~~3장) / \~28s (이미지 10장) |
| 배치 시퀀스 (이미지 2장, 편집 + 자동) | — | \~36s | — | — (지원되지 않음) | — (지원되지 않음) |
| **권장 클라이언트 타임아웃** | ≥ 60s | ≥ 60s | ≥ 120s | **≥ 240s** | ≥ 60s |

<Warning>
  **`seedream-5-0-pro`는 이미지당 일관되게 약 2분이 소요됩니다** (예외 없이 모든 실행에서 110\~132초로 측정됨). 이는 심층 추론 이미지 모델의 정상적인 동작 특성이며 결함이 아닙니다. pro를 도입하기 전에 제품이 이러한 지연 시간을 감당할 수 있는지 확인하십시오. 인터랙티브 플로우(사용자가 화면에서 대기하는 방식)에는 적합하지 않으므로 대신 5.0-lite (\~30s)를 사용하십시오. pro는 이미지 품질과 지시사항 준수가 가장 중요한 오프라인 배치 제작에 적합합니다.
</Warning>

## API 엔드포인트

| 엔드포인트 | 용도 | Content-Type |
| - | - | - |
| `POST /v1/images/generations` | 텍스트 투 이미지 / 단일 이미지 편집 / 다중 이미지 합성 / 배치 시퀀스 — 모든 모드가 **하나의 엔드포인트**를 공유하며, 요청 본문 파라미터를 통해 전환됩니다 | `application/json` |

<Tip>
  **도메인 선택**: `api.apiyi.com`가 기본 엔드포인트입니다. `b.apiyi.com` 및 기타 게이트웨이 도메인도 동일하게 동작하며 사용할 수 있습니다. `ark.ap-southeast.bytepluses.com` / `ark.eu-west.bytepluses.com`과 같은 **BytePlus 네이티브 도메인을 사용할 필요가 없습니다** — APIYI가 모든 것을 OpenAI 호환 경로로 정규화합니다.
</Tip>

## 주요 파라미터 상세

### `size` (출력 크기)

두 가지 값 유형 중 하나를 선택하십시오:

**프리셋 티어** (모델이 종횡비를 결정):

| 티어 | 대략적인 픽셀 수 | 지원 모델 |
| - | - | - |
| `1K` | \~1024×1024 | 4.0 / 5.0-pro / 5.0-flash |
| `1.5K` | \~1536×1536 | 5.0-flash 전용 |
| `2K` | \~2048×2048 (기본값) | 모든 버전 |
| `3K` | \~3072×3072 | 5.0 전용 |
| `4K` | \~4096×4096 | 4.5 / 4.0 |

**정확한 픽셀** (사용자 지정):

* 총 픽셀 수 ∈ \[1280×720, 4096×4096]
* 종횡비 ∈ \[1/16, 16]
* 기본값: `2048x2048`

**유효한 예시**: `1920x1080` (FullHD), `3840x2160` (가로형 4K), `1080x1920` (스마트폰 세로형), `2560x1440` (가로형 2K)
**유효하지 않은 예시**: `5000x5000` (상한 초과), `100x1600` (종횡비 1/16 미만)

<Warning>
  총 픽셀 수가 4096×4096을 초과하는 크기는 400 오류를 반환합니다. 극단적인 종횡비(1/16 또는 16에 가까운 비율)는 부자연스럽게 늘어날 수 있으므로 프리셋이나 일반적인 16:9 / 9:16 / 1:1 비율을 사용하는 것을 권장합니다.

  **5.0 시리즈 모델은 4.x와 다른 정확한 픽셀 범위를 사용합니다**(하한은 더 높고, 상한은 더 낮음). 범위를 벗어난 크기는 오류 메시지에 유효 범위를 포함하여 400 오류를 반환합니다. 실측 참고: 5.0-lite의 하한은 약 2560×1440입니다. **5.0-pro의 총 픽셀 수 상한은 4.19M(최대 2048×2048, 16:9 비율 시 가장 긴 변이 2720×1530 ≈ 2.7K에 달하며 정상 작동 확인됨)이며, 3K/4K 프리셋은 없습니다**. **5.0-flash는 최대 16:1의 가로세로 비율과 함께 총 921,600~~4,624,220픽셀(약 0.92M~~4.62M)을 지원하며, 마찬가지로 3K/4K 프리셋은 없습니다**. 프리셋 사용 시 모델이 콘텐츠에 따라 종횡비를 결정하므로, 고정된 비율이 필요한 경우에는 정확한 픽셀을 전달하십시오.
</Warning>

### `image` 및 `sequential_image_generation` (모드 전환)

`/v1/images/generations` 엔드포인트는 텍스트 투 이미지 및 편집/합성을 모두 지원합니다. 두 파라미터를 조합하여 모드를 선택합니다:

| 모드 | `image` | `sequential_image_generation` | 비고 |
| - | - | - | - |
| 순수 텍스트 투 이미지 | 생략 | 생략 또는 `"disabled"` | 출력 1개 |
| 단일 이미지 편집 | `["url1"]` | `"disabled"` | 참조 이미지 1장을 기반으로 편집 |
| 다중 이미지 합성 | `["url1", "url2", ...]` | `"disabled"` | 최대 10장의 참조 이미지, “이미지 1 / 이미지 2”로 참조 |
| 배치 시퀀스 | 선택 사항 | `"auto"` + `sequential_image_generation_options.max_images` | 일관된 N개 출력, **N ≤ max\_images** 및 **입력 + 출력 ≤ 15** |

<Warning>
  **`seedream-5-0-pro` 및 `seedream-5-0-flash`은 `sequential_image_generation` 파라미터를 허용하지 않습니다** — 임의의 값(`"disabled"` 포함)을 전달하면 400 오류가 반환됩니다. 이 두 모델에서 편집/합성을 수행할 때는 `image`만 전달하고 해당 파라미터는 완전히 생략하십시오. 이는 `stream`에도 동일하게 적용됩니다.
</Warning>

전체 코드 예시는 [텍스트 투 이미지](/ko/api-capabilities/seedream-image/text-to-image) 및 [이미지 편집](/ko/api-capabilities/seedream-image/image-edit)을 참고하십시오.

## 모범 사례

<Steps>
  <Step title="적절한 버전 선택">
    * **대량 작업 / 포스터 레이아웃 / 속도 및 비용** → `seedream-5-0-flash-260915` (\$0.018/요청, 약 15–20초, 최대 약 2K)
    * **최상의 종합 경험** → `seedream-5-0-260128` (가장 많은 기능 제공, 단 3K 제한)
    * **4K + 강력한 텍스트 렌더링** → `seedream-4-5-251128` (4K + 텍스트 혁신)
    * **4K + 최적의 가격** → `seedream-4-0-250828` (가장 경제적인 4K)
    * **최고의 이미지 품질 / 복잡한 지시문 (전문가 작업)** → `seedream-5-0-pro-260628` (\$0.12/요청, 이미지당 약 2분, 1K/2K 전용 — 일상적인 용도로는 권장하지 않음)
  </Step>

  <Step title="사전 설정 크기 우선 사용">
    `1K`/`2K`/`3K`/`4K`은 안정적인 속도와 품질을 위해 BytePlus에서 최적화했습니다. 실제 종횡비 요구 사항이 있는 경우에만 정확한 픽셀을 사용하십시오. 지원되는 계층의 버전별 차이에 유의하십시오.
  </Step>

  <Step title="이미지를 명시적으로 참조">
    여러 개의 `image` URL을 사용할 때는 모델이 추측하도록 두지 말고, “이미지 1의 인물을 이미지 3의 색상 팔레트를 사용하여 이미지 2의 장면에 배치해 줘”와 같이 명시적인 참조를 포함하여 prompt를 작성하십시오.
  </Step>

  <Step title="배치 시퀀스 비용 제어">
    `sequential_image_generation: "auto"` + `max_images: 4`는 4개를 출력하며 4배로 과금됩니다. 먼저 `max_images: 1`(으)로 검증한 후 확장하십시오.
  </Step>

  <Step title="사용 사례별 출력 형식 선택">
    5.0 시리즈는 `png` 및 `jpeg`을 지원하며, 4.5 / 4.0은 `jpeg`만 지원합니다. 무손실 디테일이 필요한 경우 png를 사용하십시오(5.0-flash png는 직접 생성 시 알파 채널이 없으므로 투명도가 필요한 경우 레이어 분리를 사용하십시오). 용량에 민감한 시나리오에는 jpeg를 사용하십시오.
  </Step>

  <Step title="클라이언트 타임아웃 ≥ 60초 설정">
    단일 이미지는 약 15초가 소요되지만, 배치 시퀀스(4개 이미지) 또는 4K + hd는 30\~60초가 소요될 수 있습니다. **클라이언트 타임아웃을 60초로 시작**하고 UI에 진행 상황 피드백을 표시하십시오. **`seedream-5-0-pro`은(는) 이미지당 약 2분이 소요되므로 240초 이상의 타임아웃을 사용하십시오**.
  </Step>

  <Step title="필요 시 워터마크 비활성화">
    BytePlus 워터마크를 제거하려면 `watermark: false`을(를) 설정하십시오(기본값은 버전마다 다르므로 명시적으로 설정하십시오). 상업용 에셋에 필수적입니다.
  </Step>
</Steps>

## 오류 코드 및 재시도

| 상태 | 의미 | 권장 조치 |
| - | - | - |
| `400` | 유효하지 않은 매개변수(크기 범위 초과, `image` array > 10, 지원되지 않는 티어) | 사용 중인 버전의 지원되는 티어에 대해 검증하십시오 |
| `401` | 유효하지 않은 token | Bearer Token을 확인하십시오 |
| `403` | 콘텐츠 모더레이션으로 차단됨 | prompt를 조정하거나 참조 이미지를 교체하십시오 |
| `429` | 요청 제한(기본 500 RPM) 또는 잔액 부족 | 지수 백오프를 적용하십시오. 더 높은 RPM은 영업팀에 문의하십시오 |
| `5xx` | 게이트웨이 / 업스트림 오류 | 1-2회 재시도하십시오 |
| Timeout | 롱테일 요청 | 클라이언트 타임아웃 ≥ **60s**(배치 시퀀스 또는 4K + hd는 60s에 도달할 수 있음) |

<Info>
  **클라이언트 권장 사항**:

  * **60초** 요청 타임아웃으로 시작하십시오(배치 시퀀스 또는 4K + hd는 1분이 걸릴 수 있음)
  * 5xx 및 타임아웃에는 **지수 백오프**를 적용하십시오(권장 재시도 2회)
  * 지원 티켓용으로 `x-request-id` 응답 헤더를 기록하십시오
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="5.0 Flash / 5.0 Pro / 5.0 / 4.5 / 4.0 — 어떤 모델을 선택해야 합니까?">
    | 필요 사항 | 권장 모델 |
    | - | - |
    | 대량 작업 / 포스터 레이아웃 / 속도 및 비용 | `seedream-5-0-flash-260915` (\$0.018/요청, 약 15–20초) |
    | 최신 기능 + 종합적으로 최우수 | `seedream-5-0-260128` |
    | 4K + 강력한 텍스트 렌더링 (포스터, 광고) | `seedream-4-5-251128` |
    | 4K + 최적의 가격 | `seedream-4-0-250828` |
    | 장기간 안정적인 대량 제작 | `seedream-4-0-250828` (검증됨, 최저가, 빠른 prompt 모드) |
    | 최고 화질 / 복잡한 지시문 (전문 작업용) | `seedream-5-0-pro-260628` (\$0.12/요청, 이미지당 약 2분 — 꼭 필요한 경우가 아니라면 건너뛰십시오) |

    전체 비교는 [이전 버전](/ko/api-capabilities/seedream-image/historical-versions)을 참고하십시오.
  </Accordion>

  <Accordion title="이미지 편집에도 왜 generations 엔드포인트를 사용합니까?">
    Seedream은 통합 생성-편집 아키텍처를 사용하므로 **별도의 `/v1/images/edits` 엔드포인트가 없습니다**. OpenAI의 gpt-image-2(`/v1/images/edits`로의 multipart 업로드)와 달리, Seedream은 `application/json`를 사용하며 `image` 필드에 이미지 **URL을 배열로** 전달합니다.

    장점: 프로토콜 일관성, 매개변수 재사용, 손쉬운 모드 전환. 자세한 내용은 [이미지 편집](/ko/api-capabilities/seedream-image/image-edit)을 참고하십시오.
  </Accordion>

  <Accordion title="image 필드에 base64를 사용할 수 있습니까?">
    **사용할 수 있습니다**(테스트를 통해 검증됨). data URI를 사용하십시오: `<format>`는 소문자로 표기된 `data:image/<format>;base64,<base64 string>`여야 합니다(예: `data:image/jpeg;base64,...`). 동일한 배열 내에서 URL과 base64 항목을 함께 사용할 수 있습니다. **가능한 한 항상 공개 URL을 사용하는 것이 좋습니다**: URL은 APIYI 게이트웨이를 거치지 않고 BytePlus가 싱가포르에서 직접 다운로드하지만, base64 본문은 국경 간 네트워크를 통해 전체를 먼저 업로드해야 합니다. 해당 회선이 느릴 경우 20MB를 초과하는 본문은 제공업체의 600초 요청 본문 타임아웃에 도달할 수 있으며, 게이트웨이가 base64를 대신 URL로 변환해 주지 않습니다. 이미지 편집 페이지 상단의 경고 문구를 참고하십시오.
  </Accordion>

  <Accordion title="다중 이미지 합성 제한은 어떻게 됩니까? 배치 시퀀스 제한은 어떻게 됩니까?">
    * **다중 이미지 합성**(`image` 배열): 4.5 / 5.0-pro / 5.0-flash는 명시적으로 최대 10개까지 지원합니다(테스트 결과 5.0-flash에서 11번째는 400을 반환합니다). 5.0 / 4.0 역시 다중 이미지를 지원하지만 명시적인 상한선은 문서화되어 있지 않습니다.
    * **배치 시퀀스**(`max_images`): **입력 참조 + 출력 ≤ 15**라는 전역 규칙에 의해 제한됩니다. 합성과 시퀀스를 함께 사용할 경우 총합을 계산해야 합니다. **5.0-pro 및 5.0-flash는 배치 시퀀스를 지원하지 않는다**는 점에 유의하십시오(`sequential_image_generation` 전달 시 400 반환).
  </Accordion>

  <Accordion title="b64_json에 data:image 접두사가 필요합니까?">
    `response_format`에 따라 다릅니다:

    * `response_format: "url"`(기본값) → `data[0].url`는 임시 서명된 URL이며, `<img src=...>`로 직접 렌더링할 수 있습니다.
    * `response_format: "b64_json"` → `data[0].b64_json`는 **순수 base64 문자열**입니다(`data:image/...;base64,` 접두사 없음). 디코딩하여 디스크에 저장하거나, 브라우저 렌더링을 위해 접두사를 직접 수동으로 추가하십시오.
  </Accordion>

  <Accordion title="스트리밍 출력이 지원됩니까?">
    `stream: true`를 통해 5.0 / 4.5 / 4.0에서 지원됩니다. 스트리밍은 긴 prompt 및 고해상도 이미지에 특히 유용하며, 프론트엔드에서 부분 결과를 점진적으로 렌더링할 수 있습니다. **`seedream-5-0-pro` 및 `seedream-5-0-flash`는 스트리밍을 지원하지 않습니다** — `stream` 전달 시 400을 반환합니다.
  </Accordion>

  <Accordion title="요청 제한이 어떻게 됩니까?">
    모든 버전에 걸쳐 **기본 분당 500개 이미지**(분당 최대 이미지 수)로 통일되어 있습니다. 더 높은 쿼터가 필요하시면 영업팀에 문의하십시오.
  </Accordion>

  <Accordion title="실패한 요청도 과금됩니까?">
    **아닙니다**. BytePlus에는 검토(moderation) 기능이 내장되어 있습니다. 검토 거부 및 매개변수 오류는 `400` / `403`를 반환하며 **과금되지 않습니다**. 과금되지 않는 기타 오류: `401`(유효하지 않은 token), `429`(요청 제한 초과). **성공한 생성(유효한 응답을 수신한 `200`)에 대해서만 과금됩니다**.
  </Accordion>

  <Accordion title="공식 OpenAI SDK를 사용할 수 있습니까?">
    예, 코드 변경 없이 사용할 수 있습니다. `base_url`가 `https://api.apiyi.com/v1`를 가리키도록 설정하고 `extra_body`를 통해 확장 매개변수(`image` / `sequential_image_generation` / `watermark` 등)를 전달하십시오:

    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(api_key="sk-your-key", base_url="https://api.apiyi.com/v1")
    resp = client.images.generate(
        model="seedream-5-0-260128",
        prompt="...",
        size="2K",
        extra_body={
            "image": ["https://.../ref.png"],
            "sequential_image_generation": "disabled",
            "watermark": False,
        }
    )
    ```
  </Accordion>

  <Accordion title="생성된 이미지의 소유권은 누구에게 있습니까?">
    생성된 이미지는 상업적 및 비상업적 용도로 모두 사용할 수 있습니다. 자세한 내용은 BytePlus 서비스 약관을 참고하십시오.
  </Accordion>

  <Accordion title="투명 배경이 지원됩니까?">
    `seedream-5-0` / `seedream-5-0-pro`는 `png` 출력을 지원하며, prompt로 요청할 경우(“transparent background, alpha channel”) 투명 배경을 생성할 수 있습니다. `seedream-5-0-flash`는 투명 배경을 요청하더라도 알파 채널을 반환하지 않습니다. 배경 베이스와 여러 개의 투명 레이어를 얻으려면 `layer_decomposition: true`를 사용하십시오(출력 이미지당 과금됨). 자세한 내용은 [이미지 편집](/ko/api-capabilities/seedream-image/image-edit)을 참고하십시오. `seedream-4-5` / `4-0`는 `jpeg`만 출력하며 **투명도를 지원하지 않습니다** — 후처리를 통해 배경을 직접 제거하십시오.
  </Accordion>

  <Accordion title="진행 중인 생성을 취소할 수 있습니까?">
    **불가능합니다**. `/v1/images/generations`는 동기식입니다. 요청이 제출되면 완료될 때까지 실행됩니다. 클라이언트와의 연결이 끊어지더라도 서버는 작업을 계속 완료하며 과금합니다. 클라이언트 타임아웃을 설정하시고, 연결을 끊는다고 해서 비용이 절감되는 것은 아님에 유의하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [텍스트-이미지 플레이그라운드](/ko/api-capabilities/seedream-image/text-to-image) — 5개 언어 코드 샘플이 포함된 `POST /v1/images/generations`
* [이미지 편집 플레이그라운드](/ko/api-capabilities/seedream-image/image-edit) — `image` + `sequential_image_generation` 패턴
* [이전 버전 목록](/ko/api-capabilities/seedream-image/historical-versions) — 5.0 Flash / 5.0 Pro / 5.0 / 4.5 / 4.0 비교 및 마이그레이션
* [API 매뉴얼](/ko/api-manual) — 일반 호출 가이드
* [이미지 생성 샌드박스](https://imagen.apiyi.com/) — 온라인에서 직접 체험하기
* BytePlus 공식 문서: `docs.byteplus.com/en/docs/ModelArk/1824121` — Seedream 4.0-5.0 튜토리얼

<Info>
  Seedream은 APIYI와 BytePlus ModelArk의 전략적 파트너십을 통해 제공됩니다. 모든 버전은 단일 연동 및 인증 경로를 공유하므로 필요에 따라 선택하여 사용할 수 있습니다. 문의 사항이나 피드백이 있으신 경우 콘솔에서 티켓을 접수해 주시기 바랍니다.
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.