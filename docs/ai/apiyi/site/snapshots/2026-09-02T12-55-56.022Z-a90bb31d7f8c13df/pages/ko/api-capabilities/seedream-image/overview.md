> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream 이미지 생성 및 편집

> 바이트댄스 BytePlus ModelArk Seedream 이미지 생성 모델에 대한 완전한 가이드입니다 — 활성 버전 3개(5.0 / 4.5 / 4.0), 4K 출력, 다중 이미지 융합, 배치 시퀀스 생성, 참조 이미지 편집을 단일 엔드포인트에서 제공합니다.

## 개요

**Seedream**은 ByteDance BytePlus ModelArk의 대표 이미지 생성 모델 시리즈로, **생성-편집 통합 아키텍처**를 갖추고 있습니다: 텍스트-투-이미지, 단일 이미지 편집, 다중 이미지 융합, 배치 시퀀스 생성이 모두 하나의 `/v1/images/generations` 엔드포인트로 처리되며, 차이는 파라미터뿐입니다. APIYI는 BytePlus와 전략적 파트너십을 맺고 있으며 모든 활성 버전을 출시 첫날부터 통합합니다.

<Note>
  **🎨 주요 특징**: 세 가지 활성 버전(5.0 / 4.5 / 4.0), 통합 과금, 4K 출력, 융합용 참조 이미지 최대 10장, 배치(입력 + 출력 ≤ 15), 뛰어난 텍스트 렌더링을 지원합니다. **전자상거래 히어로 이미지, 광고 포스터, 제품 사진, 콘텐츠 제작에 이상적입니다** — 고품질과 읽기 쉬운 텍스트가 중요한 모든 곳에 적합합니다.
</Note>

<Info>
  모든 이미지 API는 **동기식**입니다 — 폴링할 task ID가 없으며, 클라이언트가 연결을 끊으면 요청은 여전히 과금되지만 결과는 유실됩니다. 이 모델에는 충분히 긴 타임아웃을 설정하십시오. 자세한 내용은 [Image API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

<Note>
  **이 Seedream은 무엇입니까?** APIYI는 Seedream을 **공식 해외 BytePlus(국제) 리소스**에서 제공합니다 — 중국 본토 Doubao / Volcengine 버전이 아닙니다. 국제 버전은 국내 버전보다 비교적 완화된 콘텐츠 모더레이션 정책을 적용하므로 더 많은 창작 자유를 누릴 수 있습니다 — 이는 이 플랫폼의 실질적인 장점이지만, **검열이 없다는 뜻은 아닙니다**: BytePlus는 여전히 내장된 콘텐츠 안전 검사를 수행하며, 위반하는 prompt나 참조 이미지는 400/403으로 거부됩니다(거부된 요청은 과금되지 않습니다). 규정을 준수하여 사용하십시오.
</Note>

<CardGroup cols={2}>
  <Card title="텍스트-투-이미지 API" icon="wand-sparkles" href="/ko/api-capabilities/seedream-image/text-to-image">
    `POST /v1/images/generations`. prompt로부터 1K / 2K / 3K / 4K 또는 정확한 픽셀 크기의 이미지를 생성합니다.
  </Card>

  <Card title="이미지 편집 API" icon="image" href="/ko/api-capabilities/seedream-image/image-edit">
    `image` 파라미터를 사용하는 동일한 엔드포인트입니다. 단일 이미지 편집, 다중 이미지 융합, 배치 시퀀스(최대 15장)를 지원합니다.
  </Card>

  <Card title="이전 버전" icon="rotate-ccw-clock" href="/ko/api-capabilities/seedream-image/historical-versions">
    5.0 / 4.5 / 4.0 사양 비교, 요금 차이, 마이그레이션 가이드입니다.
  </Card>
</CardGroup>

## AI 에이전트에게 통합 작업을 맡기기

<Note>
  Codex / Claude Code / Cursor로 빌드한다면 아래 프롬프트를 복사하여 에이전트에게 전달하십시오. 먼저 이 페이지의 일반 텍스트 버전을 가져오고(모든 docs URL 뒤에 `.md`를 덧붙이십시오), 그다음 프로젝트 고유의 스택으로 코드를 작성합니다 — 타임아웃, 재호스팅된 URL 결과를 즉시 처리하는 방식, multipart 대신 URL 배열을 통한 편집, 그리고 파라미터 `seedream-5-0-pro`가 거부하는 값들은 이미 요구사항에 반영되어 있습니다.
</Note>

<Prompt description="Seedream 텍스트-이미지 및 이미지 편집을 통합하거나 문제를 해결할 코딩 에이전트를 사용하십시오. Codex, Claude Code, Cursor 및 유사 도구에 복사하여 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 Seedream 텍스트-이미지 및 이미지 편집을 통합하거나 문제를 해결하십시오.

  코드를 건드리기 전에 문서를 읽으십시오: 이 페이지의 일반 텍스트 버전을 가져오려면 [https://docs.apiyi.com/en/api-capabilities/seedream-image/overview.md](https://docs.apiyi.com/en/api-capabilities/seedream-image/overview.md) 를 가져오십시오. 더 세부적인 파라미터는 text-to-image와 image-edit 페이지에도 같은 방식으로 `.md`를 덧붙이십시오.

  요구사항:

  1. 타임아웃: 클라이언트 타임아웃을 모델별로 단계화하십시오 — 4.x 시리즈는 60초부터 시작하고, `seedream-5-0`는 120초로 올리며, **`seedream-5-0-pro`는 240초로 올리십시오. 이 모델은 이미지당 약 2분이 걸립니다**. 이미지 API는 동기식이므로 task ID가 없고, 클라이언트 연결이 끊기면 요청이 진행 중이어도 결과는 사라집니다. 동시에 요청은 과금됩니다. 리버스 프록시, 게이트웨이, 서버리스 실행 제한도 모두 더 크게 잡아야 합니다.

  2. 응답 처리: 기본값은 `url`입니다 — 약 24시간 후 만료되는 BytePlus TOS 임시 서명 링크입니다 — 대신 `response_format`를 `b64_json`로 설정하면 일반 base64를 받을 수 있습니다(`data:` 접두사 없음). URL을 받으면 **즉시 다운로드하여 자체 object storage에 재호스팅하십시오**; 업스트림 링크를 장기 주소로 데이터베이스에 저장하지 마십시오. base64를 받으면 렌더링하고 디스크에 저장하는 동작을 제공하십시오. 기본값에 의존하지 말고 `response_format`를 명시적으로 보내십시오.

  3. 참조 이미지 업로드(**다른 이미지 모델과의 가장 큰 차이점**): Seedream은 통합 생성-편집 아키텍처를 사용하므로 **`/v1/images/edits` 엔드포인트가 없습니다** — 생성과 편집 모두 `/v1/images/generations`를 `application/json`로 호출합니다. 참조 이미지는 `image` 필드에 넣으며, 이는 **URL 배열**입니다 — multipart 파일 업로드도 아니고, 반복되는 `image[]` 필드도 아닙니다. 배열 항목은 이미지 URL 또는 `data:image/jpeg;base64,...` 형식의 data URL일 수 있으며, 둘을 섞어 사용할 수 있습니다. 참조 이미지는 최대 10장까지 허용되며, **입력 이미지와 출력 이미지를 합쳐 15장을 넘을 수 없습니다**. `mask` 필드는 없습니다. 큰 로컬 파일은 먼저 자체 object storage에 업로드한 뒤 URL을 전달하십시오. data URL을 사용하는 경우 먼저 압축하십시오 — 1.5MB를 넘는 파일만 처리하고, 긴 변을 종횡비를 유지한 채 2048px로 줄이며(작은 이미지를 절대 확대하지 마십시오), 품질 0.9로 다시 인코딩하고, 다중 이미지 요청에서는 전체 크기를 6MB 미만으로 유지하십시오. 이미지 하나의 압축에 실패하면 원본으로 되돌려 계속 진행하십시오.

  4. 파라미터 금지선: 이 모델에는 **`quality` 파라미터가 없습니다** — 충실도는 모델 버전과 `size`에서 결정됩니다. `size`는 티어(`1K` / `2K` / `3K` / `4K`, 기본 `2K`) 또는 정확한 픽셀 값을 허용합니다. `seedream-5-0-pro`는 2048×2048에서 약 419만 픽셀까지이며 **3K나 4K 티어가 없습니다**. `n`는 **조용히 무시됩니다**(이미지는 여전히 1장 나오고 1장에 대한 요금이 부과됩니다), 따라서 여러 출력을 원하면 `sequential_image_generation`를 사용하십시오. `seed`는 4.x나 5.x에서 효과가 없습니다. 상업적 사용 시에는 **항상 `watermark`를 false로 보내십시오**, 기본값이 버전마다 다르기 때문입니다. `output_format`는 5.0과 5.0-pro에서만 png를 지원하며, 4.5와 4.0은 jpeg만 출력하고 alpha channel은 없습니다.

  5. `seedream-5-0-pro`에 대한 두 가지 절대 금지 사항: **`sequential_image_generation`를 아예 보내지 마십시오 — `"disabled"`를 포함한 어떤 값도 400을 반환합니다** — 그리고 **`stream`도 보내지 마십시오**(이것도 400입니다). 5.0이나 4.x에서 코드를 옮기는 경우 두 필드를 모두 완전히 제거하십시오.

  6. 키는 `APIYI_API_KEY` 환경 변수에서 읽고, base URL은 [https://api.apiyi.com/v1](https://api.apiyi.com/v1) 를 사용하십시오. 절대 하드코딩하지 말고, 절대 git에 커밋하지 마십시오. OpenAI SDK를 통해 호출할 때는 `image`, `sequential_image_generation`, `watermark` 및 `output_format` 파라미터를 전달되도록 `extra_body` 안에 넣어야 합니다.

  7. 작업이 끝나면 실제로 텍스트-이미지 호출 1회와 이미지 편집 호출 1회를 실행한 뒤, 결과와 두 호출의 비용을 보여주십시오.
</Prompt>

<Accordion title="이 프롬프트가 방지하는 문제">
  | 요구사항                        | 방지하는 함정                                                                                                                                                            |
  | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | 편집은 multipart를 사용하지 않음      | Seedream에는 `/v1/images/edits`가 없으며, 참조 이미지는 JSON URL 배열이므로 OpenAI식 multipart 방식은 아예 실패합니다                                                                          |
  | 서버 측에서 즉시 재호스팅              | 업스트림 링크는 약 24시간 후 만료되므로, 장기 저장하면 404가 서서히 쌓입니다                                                                                                                     |
  | 모델별로 타임아웃 단계화               | `seedream-5-0-pro`는 약 2분이 걸리므로 60초 타임아웃은 계속 발동합니다 — 그리고 **연결이 끊긴 요청도 여전히 과금됩니다**. [Image API 핵심 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참고하십시오 |
  | `5-0-pro`의 금지된 두 필드         | `sequential_image_generation`는 `"disabled"`로 설정해도 400을 반환합니다 — 다른 버전에서 포팅할 때 가장 쉬운 함정입니다                                                                           |
  | `n`에 의존하지 않음                | 이는 조용히 무시되며 여전히 이미지 1장을 반환합니다. 대신 `sequential_image_generation`를 사용하십시오                                                                                            |
  | `watermark`를 false로 설정하여 전송 | 기본값이 버전마다 다르므로 상업용 출력에 워터마크가 다시 나타날 수 있습니다                                                                                                                         |
</Accordion>

## APIYI의 Seedream을 선택해야 하는 이유

BytePlus ModelArk 공식 릴레이를 대체할 수 있는 드롭인 대체재로, **안정성**, **비용**, **통합**의 세 축에서 프로덕션 사용에 맞게 최적화되어 있습니다:

<CardGroup cols={2}>
  <Card title="전략적 파트너십 · 안정적인 자원" icon="shield-check">
    BytePlus ModelArk에 대한 공식 직접 연결입니다. 요청 및 응답 동작은 상위와 동일하며 — **프로토콜 우회가 없고**, 프로덕션에 안전합니다.
  </Card>

  <Card title="무제한 동시 실행 수 · 엔터프라이즈 대응" icon="infinity">
    배치 생성, 다중 이미지 융합, 시퀀스 생성에 대해 선형 확장이 가능하며 — Tier식 계정 제한이 없습니다. **기본 500 RPM**이며, 더 높은 쿼터는 영업팀에 문의하십시오.
  </Card>

  <Card title="동일한 가격 + 충전으로 최대 20% 할인" icon="percent">
    기본 단가는 BytePlus 공식 요금과 동일합니다. [충전 보너스](/ko/faq/recharge-promotions)와 함께 사용하면 실질 가격은 \*\*최저 정가의 80%\*\*까지 내려갑니다.
  </Card>

  <Card title="전 세계 무마찰 접근" icon="globe">
    **해외 서버나 프록시가 필요 없습니다**. 중국 본토 데이터 센터, 가정용 네트워크, 해외 노드에서 `api.apiyi.com`에 직접 연결됩니다. BytePlus `ap-southeast-1` / `eu-west-1` 리전에 대한 라우팅을 따로 설정할 필요가 없습니다.
  </Card>

  <Card title="OpenAI 호환 · 코드 변경 불필요" icon="plug">
    `/v1/images/generations` 경로는 OpenAI와 동일합니다. OpenAI SDK의 `base_url`를 APIYI로 지정하고 API를 그대로 호출하면 됩니다. 확장 파라미터(`image` / `sequential_image_generation` 등)는 `extra_body`를 통해 전달하십시오. OpenAI의 `n` 매개변수는 상위에서 지원되지 않습니다(조용히 무시되며 — 여전히 이미지 1장을 받습니다). 여러 이미지 출력을 하려면 `sequential_image_generation`를 사용하십시오.
  </Card>

  <Card title="전문 지원 · 엔터프라이즈 컨시어지" icon="handshake">
    다중 이미지 융합, 텍스트 렌더링, 배치 에셋 제작 등 이미지 생성 활용 사례에 대한 깊은 전문성을 제공합니다. PoC부터 프로덕션 롤아웃까지 전 과정 지원합니다.
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

## 가격

이미지당 과금이며, **BytePlus 공식과 동일한 가격**입니다. 충전 보너스로 실효 단가가 더 낮아집니다.

| 모델                        | APIYI 가격             | 정가(RMB 추정치)    | 상태                                             |
| ------------------------- | -------------------- | -------------- | ---------------------------------------------- |
| `seedream-5-0-pro-260628` | \$0.12 / 요청 (이미지 1장) | ≈ ¥0.84 / 요청   | 🆕 Pro 등급(이미지당 약 2분; 일상 작업에는 5.0-lite를 사용하십시오) |
| `seedream-5-0-260128`     | \$0.035 / 이미지        | ≈ ¥0.245 / 이미지 | ✅ 권장(최신)                                       |
| `seedream-4-5-251128`     | \$0.04 / 이미지         | ≈ ¥0.28 / 이미지  | ✅ 권장                                           |
| `seedream-4-0-250828`     | \$0.03 / 이미지         | ≈ ¥0.21 / 이미지  | 🟡 유지 관리 중(여전히 호출 가능)                          |

<Info>
  **과금 참고 사항**:

  * prompt 길이나 fusion mode와 관계없이 생성된 이미지 1장당 과금됩니다
  * `seedream-5-0-pro`는 **요청당 고정 \$0.12**로 과금됩니다(요청당 이미지 1장; 배치 시퀀스는 지원하지 않습니다). 공식적으로 이 모델은 두 개의 출력 픽셀 요금 구간(≤2.36M px에는 하나의 가격, >2.36M px에는 다른 가격)과 첫 번째 이후의 참고 이미지마다 이미지당 요금을 사용하지만, APIYI는 이를 요청당 고정 가격으로 단순화합니다 — **구간이 없고, 입력 이미지 요금이 포함됩니다**. 이 모델에는 **어떠한 공식 할인도 전혀 없으며**, APIYI는 이를 공급 보장 기준으로 가격 책정합니다 — 충전 보너스와 세금 비용을 반영하면 사실상 마진이 없으며 — 가격 변경 시에는 사전에 공지합니다
  * `sequential_image_generation: "auto"` mode에서는 실제 출력 개수 기준으로 과금됩니다(예: `max_images: 4` 출력 4개 → 4개 과금)
  * 실패한 요청(4xx / 모더레이션에 의해 차단됨)은 **과금되지 않습니다**
  * 무료 체험: 최초 온보딩 시 200장의 무료 이미지(BytePlus 제공)
  * 충전 보너스 세부 사항은 [충전 프로모션](/ko/faq/recharge-promotions)을 참고하십시오
</Info>

## 기술 사양

| Dimension             | seedream-5-0-pro                                                              | seedream-5-0                      | seedream-4-5          | seedream-4-0          |
| --------------------- | ----------------------------------------------------------------------------- | --------------------------------- | --------------------- | --------------------- |
| **모델 ID**             | `seedream-5-0-pro-260628`                                                     | `seedream-5-0-260128`             | `seedream-4-5-251128` | `seedream-4-0-250828` |
| **모델 ID 별칭**          | —                                                                             | `seedream-5-0-lite-260128`        | —                     | —                     |
| **출시일**               | 2026-06-28 (UTC+8)                                                            | 2026-01-28 (UTC+8)                | 2025-11-28 (UTC+8)    | 2025-08-28 (UTC+8)    |
| **해상도 단계**            | 1K / 2K + 정확한 WxH (총 픽셀 수 ≤ 4.19M; 16:9에서는 가장 긴 변의 길이가 2720에 도달하며, 약 2.7K입니다) | 2K / 3K                           | 2K / 4K               | 1K / 2K / 4K          |
| **출력 형식**             | `png` / `jpeg`                                                                | `png` / `jpeg`                    | `jpeg`                | `jpeg`                |
| **프롬프트 최적화**          | 표준 / 빠름                                                                       | 표준                                | 표준                    | 표준 / 빠름               |
| **텍스트-투-이미지**         | ✅                                                                             | ✅                                 | ✅                     | ✅                     |
| **단일 이미지 편집**         | ✅                                                                             | ✅                                 | ✅                     | ✅                     |
| **다중 이미지 융합**         | ✅ (최대 10장)                                                                    | ✅                                 | ✅ (최대 10장)            | ✅                     |
| **배치 시퀀스**            | ❌ (전달 시 400)                                                                  | ✅                                 | ✅                     | ✅                     |
| **스트리밍 출력**           | ❌ (전달 시 400)                                                                  | ✅                                 | ✅                     | ✅                     |
| **분당 최대 이미지 수 (RPM)** | 500                                                                           | 500                               | 500                   | 500                   |
| **단일 요청 입력 + 출력**     | 입력 ≤ 10, 출력 1                                                                 | ≤ 15                              | ≤ 15                  | ≤ 15                  |
| **일반적인 지연 시간**        | 약 2분                                                                          | 약 30초                             | 10-20초                | 10-15초                |
| **응답 필드**             | 동일                                                                            | `data[].url` 또는 `data[].b64_json` | 동일                    | 동일                    |

## 생성 시간 비교

버전별 단일 요청 지연 시간 측정값입니다(2026-07에 측정, UTC+8; 요청부터 전체 응답까지의 실제 경과 시간 — 요청별 정상적인 변동이 예상됩니다):

| 시나리오                     | seedream-4-0 | seedream-4-5 | seedream-5-0 | seedream-5-0-pro              |
| ------------------------ | ------------ | ------------ | ------------ | ----------------------------- |
| 텍스트-투-이미지 (1K/2K)        | 7-11s        | 8-13s        | 29-34s       | **110-130s**                  |
| 텍스트-투-이미지 (최상위 티어)       | \~15s (4K)   | \~18s (4K)   | \~37s (3K)   | \~134s (WxH 2720×1530, 최대 크기) |
| 편집 / 다중 이미지 융합           | \~11s        | 17-21s       | 38-40s       | **115-132s**                  |
| 배치 시퀀스 (이미지 2장, 편집 + 자동) | —            | \~36s        | —            | — (지원되지 않음)                   |
| **권장 클라이언트 타임아웃**        | ≥ 60s        | ≥ 60s        | ≥ 120s       | **≥ 240s**                    |

<Warning>
  **`seedream-5-0-pro`는 이미지당 약 2분이 일관되게 걸립니다** (모든 실행에서 110-132s로 측정되었으며, 예외는 없습니다). 이는 결함이 아니라 깊은 추론 이미지 모델의 예상되는 동작입니다. pro를 도입하기 전에 제품이 이 지연을 감당할 수 있는지 확인하십시오. 대화형 흐름(화면에서 사용자가 기다리는 방식)에는 적합하지 않으며, 대신 5.0-lite(\~30s)를 사용하십시오. pro는 이미지 품질과 지시 준수가 가장 중요한 오프라인 배치 제작에 적합합니다.
</Warning>

## API 엔드포인트

| 엔드포인트                         | 용도                                                                                               | Content-Type       |
| ----------------------------- | ------------------------------------------------------------------------------------------------ | ------------------ |
| `POST /v1/images/generations` | 텍스트를 이미지로 변환 / 단일 이미지 편집 / 다중 이미지 융합 / 배치 시퀀스 — 모든 모드는 **하나의 엔드포인트**를 공유하며, 요청 본문 매개변수에 따라 전환됩니다 | `application/json` |

<Tip>
  **도메인 선택**: 주요 엔드포인트는 `api.apiyi.com`입니다. `vip.apiyi.com` 및 다른 게이트웨이 도메인도 사용할 수 있으며, 동작은 동일합니다. **BytePlus 기본 도메인을 사용할 필요는 없습니다**. 예: `ark.ap-southeast.bytepluses.com` / `ark.eu-west.bytepluses.com` — APIYI는 모든 것을 OpenAI 호환 경로로 표준화합니다.
</Tip>

## 주요 파라미터 상세

### `size` (출력 크기)

두 가지 값 계열이 있습니다 — 하나를 선택하십시오:

**프리셋 등급** (모델이 종횡비를 결정합니다):

| 등급   | 대략적 픽셀 수          | 지원 버전         |
| ---- | ----------------- | ------------- |
| `1K` | \~1024×1024       | 4.0 / 5.0-pro |
| `2K` | \~2048×2048 (기본값) | 모든 버전         |
| `3K` | \~3072×3072       | 5.0만          |
| `4K` | \~4096×4096       | 4.5 / 4.0     |

**정확한 픽셀 수** (사용자 지정):

* 총 픽셀 수 ∈ \[1280×720, 4096×4096]
* 종횡비 ∈ \[1/16, 16]
* 기본값: `2048x2048`

**유효한 예시**: `1920x1080` (FullHD), `3840x2160` (가로 4K), `1080x1920` (휴대폰 세로), `2560x1440` (가로 2K)
**유효하지 않은 예시**: `5000x5000` (상한 초과), `100x1600` (종횡비가 1/16 미만)

<Warning>
  총 픽셀이 4096×4096을 초과하는 크기는 400을 반환합니다. 극단적인 종횡비(1/16 또는 16에 가까운 경우)는 부자연스럽게 늘어날 수 있으므로, 프리셋이나 일반적인 16:9 / 9:16 / 1:1을 사용하는 것이 좋습니다.

  **5.0 시리즈 모델은 4.x와 다른 정확한 픽셀 범위를 사용합니다**(하한이 더 높고 상한이 더 낮습니다). 범위를 벗어난 크기는 오류 메시지에 유효 범위와 함께 400을 반환합니다. 측정 기준으로 5.0-lite의 하한은 대략 2560×1440입니다; **5.0-pro는 총 픽셀 4.19M에서 상한이 걸리며(최대 2048×2048; 16:9에서는 긴 변이 2720×1530 ≈ 2.7K에 도달하며 동작이 확인되었습니다) — 3K/4K 프리셋은 없습니다**.
</Warning>

### `image` 및 `sequential_image_generation` (모드 전환)

`/v1/images/generations` 엔드포인트는 텍스트-이미지와 편집/융합을 모두 지원합니다. 두 파라미터를 함께 사용해 모드를 선택합니다:

| 모드         | `image`                 | `sequential_image_generation`                               | 참고                                                |
| ---------- | ----------------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| 순수 텍스트-이미지 | 생략                      | 생략 또는 `"disabled"`                                          | 출력 1개                                             |
| 단일 이미지 편집  | `["url1"]`              | `"disabled"`                                                | 참조 이미지 1개를 바탕으로 편집                                |
| 다중 이미지 융합  | `["url1", "url2", ...]` | `"disabled"`                                                | 참조 이미지 최대 10개; "image 1 / image 2"로 지칭합니다         |
| 배치 시퀀스     | 선택 사항                   | `"auto"` + `sequential_image_generation_options.max_images` | 일관된 출력 N개, **N ≤ max\_images** 및 **입력 + 출력 ≤ 15** |

<Warning>
  **`seedream-5-0-pro`은 `sequential_image_generation` 파라미터를 허용하지 않습니다** — 아무 값(`"disabled"` 포함)을 전달해도 400이 반환됩니다. pro 모델로 편집/융합을 사용할 때는 `image`만 전달하고 해당 파라미터를 완전히 생략해야 하며, `stream`에도 동일하게 적용됩니다.
</Warning>

전체 코드 예시는 [텍스트-이미지](/ko/api-capabilities/seedream-image/text-to-image) 및 [이미지 편집](/ko/api-capabilities/seedream-image/image-edit)을 참조하십시오.

## 모범 사례

<Steps>
  <Step title="적절한 버전을 선택하십시오">
    * **최고의 전반적 경험** → `seedream-5-0-260128` (가장 많은 기능을 제공하지만 3K 제한)
    * **4K + 강력한 텍스트 렌더링** → `seedream-4-5-251128` (4K + 텍스트 돌파)
    * **4K + 최저 가격** → `seedream-4-0-250828` (가장 저렴한 4K)
    * **최고 수준의 이미지 품질 / 복잡한 지시사항(전문 작업)** → `seedream-5-0-pro-260628` (\$0.12/요청, 이미지당 약 2분, 1K/2K만 지원 — 일상적인 사용에는 권장하지 않습니다)
  </Step>

  <Step title="사전 설정된 크기를 우선 사용하십시오">
    `1K`/`2K`/`3K`/`4K`는 안정적인 속도와 품질을 위해 BytePlus가 조정한 값입니다. 실제 종횡비 요구사항이 있을 때만 정확한 픽셀을 사용하십시오. 지원되는 티어는 버전별로 다르다는 점에 유의하십시오.
  </Step>

  <Step title="이미지를 명시적으로 참조하십시오">
    여러 `image` URL이 있는 경우, 모델이 추측하게 두지 말고 “이미지 1의 인물을 이미지 2의 장면에 넣고, 이미지 3의 색상 팔레트를 사용하십시오”처럼 명시적인 참조를 포함해 prompt를 작성하십시오.
  </Step>

  <Step title="배치 시퀀스 비용을 제어하십시오">
    `sequential_image_generation: "auto"` + `max_images: 4` 출력은 4개입니다 — 요금은 × 4입니다. 먼저 `max_images: 1`으로 검증한 다음 확장하십시오.
  </Step>

  <Step title="사용 사례에 따라 출력 형식을 선택하십시오">
    5.0 / 5.0-pro는 `png` 및 `jpeg`를 지원하고, 4.5 / 4.0은 `jpeg`만 지원합니다. 투명 배경이나 무손실 디테일이 필요할 때는 5.0 시리즈 + png를 사용하고, 크기에 민감한 시나리오에서는 jpeg를 사용하십시오.
  </Step>

  <Step title="클라이언트 타임아웃을 60초 이상으로 설정하십시오">
    단일 이미지는 약 15초이지만, 배치 시퀀스(4개 이미지) 또는 4K + hd는 30\~60초가 걸릴 수 있습니다. \*\*60초 클라이언트 타임아웃부터 시작하시고 UI에 진행 상태 피드백을 표시하십시오. **`seedream-5-0-pro`는 이미지당 약 2분이 걸리므로 240초 이상의 타임아웃을 사용하십시오**.
  </Step>

  <Step title="필요할 때 워터마크를 비활성화하십시오">
    `watermark: false`을 설정하여 BytePlus 워터마크를 제거하십시오(기본값은 버전별로 다르므로 명시적으로 설정하십시오). 상업용 에셋에는 필수입니다.
  </Step>
</Steps>

## 오류 코드 및 재시도

| 상태      | 의미                                                     | 권장 조치                                                  |
| ------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `400`   | 유효하지 않은 매개변수(크기 범위 초과, `image` array > 10, 지원되지 않는 티어) | 사용 중인 버전의 지원되는 티어에 대해 검증하십시오                           |
| `401`   | 유효하지 않은 token                                          | Bearer Token을 확인하십시오                                   |
| `403`   | 콘텐츠 모더레이션으로 차단됨                                        | prompt를 조정하거나 참조 이미지를 교체하십시오                           |
| `429`   | 요청 제한(기본 500 RPM) 또는 잔액 부족                             | 지수 백오프를 적용하십시오. 더 높은 RPM은 영업팀에 문의하십시오                  |
| `5xx`   | 게이트웨이 / 업스트림 오류                                        | 1-2회 재시도하십시오                                           |
| Timeout | 롱테일 요청                                                 | 클라이언트 타임아웃 ≥ **60s**(배치 시퀀스 또는 4K + hd는 60s에 도달할 수 있음) |

<Info>
  **클라이언트 권장 사항**:

  * **60초** 요청 타임아웃으로 시작하십시오(배치 시퀀스 또는 4K + hd는 1분이 걸릴 수 있음)
  * 5xx 및 타임아웃에는 **지수 백오프**를 적용하십시오(권장 재시도 2회)
  * 지원 티켓용으로 `x-request-id` 응답 헤더를 기록하십시오
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="5.0 Pro / 5.0 / 4.5 / 4.0 — 무엇을 선택해야 합니까?">
    | 필요                         | 추천                                                                    |
    | -------------------------- | --------------------------------------------------------------------- |
    | 최신 기능 + 전반적으로 가장 우수함       | `seedream-5-0-260128`                                                 |
    | 4K + 강력한 텍스트 렌더링(포스터, 광고)  | `seedream-4-5-251128`                                                 |
    | 4K + 최저 가격                 | `seedream-4-0-250828`                                                 |
    | 장시간 안정적인 배치 생산             | `seedream-4-0-250828` (검증됨, 가장 저렴함, 빠른 prompt 모드)                     |
    | 최상급 이미지 품질 / 복잡한 지시(전문 작업) | `seedream-5-0-pro-260628` (\$0.12/request, 이미지당 약 2분 — 필요할 때만 선택하십시오) |

    자세한 비교는 [Historical Versions](/ko/api-capabilities/seedream-image/historical-versions)를 보십시오.
  </Accordion>

  <Accordion title="이미지 편집도 generations 엔드포인트를 사용하는 이유는 무엇입니까?">
    Seedream은 통합 생성-편집 아키텍처를 사용하며, **별도의 `/v1/images/edits` 엔드포인트가 없습니다**. OpenAI의 gpt-image-2와 달리(`/v1/images/edits`로 multipart 업로드), Seedream은 `application/json`를 사용하며 이미지 **URL을 배열로** `image` 필드에 전달합니다.

    장점: 프로토콜 일관성, 매개변수 재사용, 쉬운 모드 전환. 자세한 내용은 [Image Editing](/ko/api-capabilities/seedream-image/image-edit)을 보십시오.
  </Accordion>

  <Accordion title="image 필드는 base64를 허용합니까?">
    **예**(테스트로 검증됨). 소문자 `<format>`가 포함된 data URI인 `data:image/<format>;base64,<base64 string>`를 사용하십시오. 예: `data:image/jpeg;base64,...`. URL과 base64 항목은 같은 배열에서 혼합할 수 있습니다. 큰 로컬 이미지는 요청 본문을 작게 유지하기 위해 이미지 호스팅에 업로드한 뒤 URL을 전달하는 편이 여전히 더 좋습니다.
  </Accordion>

  <Accordion title="다중 이미지 융합 제한? 배치 시퀀스 제한?">
    * **다중 이미지 융합**(`image` 배열): 4.5 / 5.0-pro는 명시적으로 최대 10개를 지원합니다. 5.0 / 4.0도 다중 이미지를 지원하지만, 명시적인 상한은 문서화되어 있지 않습니다.
    * **배치 시퀀스**(`max_images`): 전역 규칙 **입력 참조 + 출력 ≤ 15**로 제한됩니다. 융합과 시퀀스를 함께 사용할 때는 총합을 계산해야 합니다. 참고로 **5.0-pro는 배치 시퀀스를 지원하지 않습니다**(`sequential_image_generation`를 전달하면 400이 반환됩니다).
  </Accordion>

  <Accordion title="b64_json에 data:image 접두사가 필요합니까?">
    `response_format`에 따라 다릅니다:

    * `response_format: "url"`(기본값) → `data[0].url`는 임시 서명된 URL이므로 `<img src=...>`로 바로 렌더링하십시오
    * `response_format: "b64_json"` → `data[0].b64_json`는 **일반 base64 문자열**입니다(`data:image/...;base64,` 접두사 없음). 디코딩하여 디스크에 기록하거나, 브라우저 렌더링을 위해 접두사를 수동으로 앞에 붙이십시오.
  </Accordion>

  <Accordion title="streaming 출력이 지원됩니까?">
    `stream: true`를 통해 5.0 / 4.5 / 4.0에서 지원됩니다. streaming은 긴 prompt와 고해상도 이미지에서 특히 유용하며, 프런트엔드가 부분 결과를 점진적으로 렌더링할 수 있습니다. **`seedream-5-0-pro`는 streaming을 지원하지 않습니다** — `stream`를 전달하면 400이 반환됩니다.
  </Accordion>

  <Accordion title="요청 제한은?">
    **기본값은 분당 이미지 500개**(분당 최대 이미지 수)이며, 버전 전반에서 동일하게 적용됩니다. 더 높은 쿼터는 영업팀에 문의하십시오.
  </Accordion>

  <Accordion title="실패한 요청에도 과금됩니까?">
    **아니요**. BytePlus에는 내장된 모더레이션이 있습니다. 모더레이션 거부와 매개변수 오류는 `400` / `403`를 반환하며 **과금되지 않습니다**. 그 밖의 과금되지 않는 오류: `401`(유효하지 않은 token), `429`(요청 제한). **유효한 응답이 있는 성공한 generation(`200`)만 과금됩니다**.
  </Accordion>

  <Accordion title="공식 OpenAI SDK를 사용할 수 있습니까?">
    예, 코드 변경 없이 가능합니다. `base_url`를 `https://api.apiyi.com/v1`로 지정하고, 확장 매개변수(`image` / `sequential_image_generation` / `watermark` 등)를 `extra_body`를 통해 전달하십시오:

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
    생성된 이미지는 상업적 및 비상업적으로 사용할 수 있습니다. 자세한 내용은 BytePlus 이용 약관을 보십시오.
  </Accordion>

  <Accordion title="투명 배경을 지원합니까?">
    `seedream-5-0` / `seedream-5-0-pro`는 `png` 출력을 지원하며, "투명 배경, alpha 채널"이라고 프롬프트하면 투명 배경을 생성할 수 있습니다. `seedream-4-5` / `4-0`는 `jpeg` 출력만 제공하며 **투명성을 지원하지 않습니다** — 배경 제거는 후처리로 직접 수행하십시오.
  </Accordion>

  <Accordion title="진행 중인 생성을 취소할 수 있습니까?">
    **아니요**. `/v1/images/generations`는 동기식입니다. 일단 제출되면 요청은 완료될 때까지 실행됩니다. 클라이언트가 연결을 끊어도 서버는 처리를 완료하고 과금합니다. 클라이언트 타임아웃을 설정하고 연결 해제가 비용을 절감한다고 가정하지 마십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [Text-to-Image Playground](/ko/api-capabilities/seedream-image/text-to-image) — 다섯 개의 언어 코드 샘플이 있는 `POST /v1/images/generations`
* [Image Editing Playground](/ko/api-capabilities/seedream-image/image-edit) — `image` + `sequential_image_generation` 패턴
* [Historical Versions](/ko/api-capabilities/seedream-image/historical-versions) — 5.0 / 4.5 / 4.0 비교 및 마이그레이션
* [API Manual](/ko/api-manual) — 일반적인 호출 가이드
* [Image Generation Sandbox](https://imagen.apiyi.com/) — 온라인에서 체험해 보십시오
* BytePlus 공식 문서: `docs.byteplus.com/en/docs/ModelArk/1824121` — Seedream 4.0-5.0 튜토리얼

<Info>
  Seedream은 APIYI와 BytePlus ModelArk의 전략적 파트너십을 통해 제공됩니다. 세 가지 버전은 하나의 통합, 과금, 인증 경로를 공유하므로 필요에 따라 선택하십시오. 질문이나 피드백이 있으면 콘솔에서 티켓을 제출하십시오.
</Info>
