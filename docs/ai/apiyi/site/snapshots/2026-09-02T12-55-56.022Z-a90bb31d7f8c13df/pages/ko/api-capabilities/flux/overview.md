> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FLUX 이미지 생성 및 편집

> Black Forest Labs FLUX 모델 패밀리 — 서브초 FLUX.2 [klein]부터 4MP 플래그십 [max]까지, 텍스트-투-이미지, 다중 레퍼런스 편집, 타이포그래피, 정확한 hex 색상 제어를 지원합니다. OpenAI 호환 드롭인입니다.

## 개요

**FLUX**는 독일에 기반을 둔 Black Forest Labs (BFL)의 주력 이미지 생성 모델군입니다. 최신 **FLUX.2** 세대는 1초 미만부터 4MP 플래그십 품질까지 5개 티어를 아우르며, 이미지 편집용 이전 세대 **FLUX.1 Kontext**와 함께 총 7개의 활성 모델을 제공합니다. 레거시 FLUX.1 \[pro] 모델도 계속 호출할 수 있습니다. APIYI 게이트웨이는 BFL의 비동기 폴링 API를 동기식 OpenAI 이미지 API(`/v1/images/generations` 및 `/v1/images/edits`)로 래핑하므로, OpenAI SDK를 `base_url` 변경만으로 그대로 적용할 수 있습니다.

<Note>
  **🎨 주요 특징**: FLUX.2 \[max]는 실시간 웹 지식을 위한 **그라운딩 검색**을 독보적으로 지원합니다. 네이티브 4MP 출력(2048×2048) + 최대 8개의 다중 참조 이미지 + 32K-token prompt + 정밀한 hex 색상 제어 + 최고 수준의 타이포그래피를 제공합니다. **프로덕션에서 플래그십 품질, 다중 이미지 일관성, 브랜드 색상 충실도, 전문적인 레이아웃에 이상적입니다**.
</Note>

<Info>
  모든 이미지 API는 **동기식**입니다 — 폴링할 task ID가 없으며, 클라이언트가 연결을 끊으면 요청이 아직 과금되는 동안 결과는 손실됩니다. 이 모델에는 넉넉한 timeout을 설정하십시오. [Image API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

<CardGroup cols={2}>
  <Card title="텍스트-이미지 API" icon="wand-sparkles" href="/ko/api-capabilities/flux/text-to-image">
    `/v1/images/generations`, 5개 모든 FLUX.2 모델에서 text prompt로 이미지를 생성합니다.
  </Card>

  <Card title="이미지 편집 API" icon="image" href="/ko/api-capabilities/flux/image-edit">
    JSON `input_image` 필드(퓨전을 위한 최대 8개 참조, `/generations`를 통해), 그리고 OpenAI 호환 멀티파트 `/edits` 단일 이미지 경로가 있습니다. FLUX.2 + FLUX.1 Kontext에서 작동합니다.
  </Card>

  <Card title="과거 버전" icon="rotate-ccw-clock" href="/ko/api-capabilities/flux/historical-versions">
    FLUX.1 \[pro] / \[pro] 1.1 / \[pro] 1.1 Ultra / \[dev]의 사양, 마이그레이션 노트, 요금 정보입니다.
  </Card>
</CardGroup>

## AI 에이전트에게 통합을 맡기십시오

<Note>
  Codex / Claude Code / Cursor로 빌드하는 경우 아래 프롬프트를 복사해 에이전트에게 넘기십시오. 이 에이전트는 먼저 이 페이지의 일반 텍스트 버전을 가져오며(모든 docs URL 뒤에 `.md`를 붙이십시오), 그다음 여러분 프로젝트의 고유한 스택으로 코드를 작성합니다. 타임아웃, **즉시 서버 측 복사를 강제하는 10분짜리 URL 만료**, 업로드 압축, 그리고 16의 배수 차원 규칙은 이미 요구사항에 반영되어 있습니다.
</Note>

<Prompt description="코딩 에이전트로 FLUX 텍스트-이미지 및 이미지 편집을 통합하거나 문제를 해결하십시오. Codex, Claude Code, Cursor 및 유사한 도구에 복사해 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 FLUX 텍스트-이미지 및 이미지 편집을 통합하거나 문제를 해결하십시오.

  코드를 건드리기 전에 문서를 읽으십시오: 이 페이지의 일반 텍스트 버전을 가져오려면 [https://docs.apiyi.com/en/api-capabilities/flux/overview.md](https://docs.apiyi.com/en/api-capabilities/flux/overview.md) 를 불러오십시오. 더 세부적인 매개변수 정보가 필요하면, 텍스트-이미지 및 이미지 편집 페이지에도 같은 방식으로 `.md`를 붙이십시오.

  요구사항:

  1. 타임아웃: 클라이언트 타임아웃을 120초로 설정하십시오. `flux-2-flex`를 사용하는 경우에는 180초로 설정하십시오. 이미지 API는 동기식입니다. 즉, 작업 ID가 없으므로 클라이언트 연결이 끊기면 요청이 아직 과금 중이더라도 결과는 사라집니다. 역방향 프록시, 게이트웨이, 서버리스 실행 제한도 모두 늘려야 합니다. 생성 시간보다 짧은 모든 계층은 요청을 중간에서 끊습니다.

  2. 응답 처리(**이 모델에서 가장 중요한 항목입니다**): FLUX는 **URL만 반환하고 base64는 절대 반환하지 않으며** — 결과는 `data[0].url`에 있습니다. `b64_json`를 찾지 말고 `response_format`를 보내지 마십시오. 그 서명된 링크는 **약 10분 동안만 유효**하며, **CORS가 활성화되어 있지 않습니다**: 브라우저에서 직접 가져오면 교차 출처 규칙에 의해 차단됩니다(링크를 이미지 태그 `src`에 넣으면 표시는 정상적으로 됩니다). 따라서 올바른 접근 방식은 **URL을 서버 측에서 즉시 다운로드해 여러분의 오브젝트 스토리지에 다시 호스팅한 다음**, 프론트엔드에는 여러분의 영구 링크를 넘기는 것입니다. 업스트림 링크를 데이터베이스에 장기 주소로 저장하지 마십시오. 또한 이 모델은 **`usage` 필드를 반환하지 않으므로**, 응답에서 token 수를 기대하지 마십시오.

  3. 참조 이미지 업로드: 다중 이미지 융합은 `/v1/images/generations`를 통해 이루어지며 JSON 필드 `input_image`, `input_image_2`, 그리고 `input_image_8`까지 사용합니다. 각 값은 이미지 URL이거나 `data:image/...;base64,...` 형식의 data URL일 수 있습니다. `/v1/images/edits` 엔드포인트(multipart)는 이미지 1장만 받으며, 파일 필드 이름은 반드시 `image`여야 합니다 — 그 외의 것은 모두 `image is required`를 반환합니다. 참조 이미지 한도는 모델마다 다릅니다: FLUX.2 pro / max / flex는 최대 8장, klein은 최대 4장, FLUX.1 Kontext는 1장만 허용됩니다. 업로드 전에 압축하십시오 — 1.5MB를 넘는 파일만 처리하고, 종횡비를 유지한 채 긴 변을 2048px로 줄이며(작은 이미지는 절대 업스케일하지 마십시오), 품질 0.9로 다시 인코딩하고 원본 형식을 유지하십시오. 단일 이미지는 20MB와 20메가픽셀 이하로 유지하십시오. 한 이미지의 압축에 실패하면 원본으로 되돌려 계속 진행하십시오.

  4. 크기 매개변수: `size`를 사용하거나(예: `1024x1024`) 두 개의 정수 `width`와 `height`를 사용하십시오 — 두 형식은 동일하므로 하나만 고르시면 됩니다. **두 차원 모두 16의 배수여야 하며**, 최소 64x64, 최대는 대략 4메가픽셀입니다(2메가픽셀 이하가 권장됩니다). `1000x1000`은 16의 배수가 아니므로 불법이며, `3840x2160`는 4메가픽셀을 초과하므로 불법입니다. UI에서 사용자가 차원을 직접 입력하게 한다면 전송 전에 두 규칙을 모두 검증하십시오. 편집의 경우 `aspect_ratio`가 형태를 제어하며, 이를 생략하면 출력은 첫 번째 입력 이미지를 따릅니다. 이 모델에는 **`quality` 매개변수가 없으며**; `flux-2-flex`만이 `steps`(기본값 50)과 `guidance`(기본값 4.5)을 품질 조절값으로 노출합니다. 비용 제어는 모델 선택으로 하십시오: klein이 가장 저렴하고 max가 가장 비싸며, 편집 비용은 생성과 동일하고, 추가 참조 이미지는 비용을 더하지 않습니다.

  5. 기타 참고사항: OpenAI SDK를 통해 호출할 때 FLUX 전용 매개변수는 모두 `extra_body` 안에 넣어야만 전달됩니다. `prompt_upsampling`는 기본적으로 꺼져 있으며 prompt를 다시 작성하므로 브랜드 작업에서는 꺼두십시오. `webhook_url`는 전달되지 않으므로 이에 의존하지 마십시오.

  6. 키는 `APIYI_API_KEY` 환경 변수에서 읽고 base URL은 [https://api.apiyi.com/v1](https://api.apiyi.com/v1) 를 사용하십시오. 절대로 하드코딩하지 말고, git에 커밋하지 마십시오.

  7. 작업을 끝내면 실제로 텍스트-이미지 호출 1회와 이미지 편집 호출 1회를 실행한 다음, 결과와 그 두 호출의 비용을 보여주십시오.
</Prompt>

<Accordion title="이 프롬프트가 막아 주는 문제">
  | 요구사항                  | 방지하는 함정                                                                                                |
  | --------------------- | ------------------------------------------------------------------------------------------------------ |
  | 서버 측에서 즉시 다시 호스팅      | 업스트림 링크는 약 10분 후 사라지므로, 장기 주소로 저장하면 광범위한 404 오류가 발생합니다                                                 |
  | 브라우저에서 `fetch`하지 않음   | 업스트림에서 CORS가 활성화되어 있지 않아 프론트엔드 fetch가 차단됩니다. 이미지 태그 `src`만 렌더링됩니다                                      |
  | `b64_json`를 찾지 않음     | 이 모델은 URL만 반환하므로 base64 파싱은 빈 값을 만듭니다                                                                  |
  | 차원은 16의 배수여야 함        | 겉보기엔 완전히 정상인 `1000x1000`도 즉시 거부되며, `3840x2160`은 픽셀 상한을 초과합니다                                           |
  | 업로드 전에 압축             | 상한은 이미지당 20MB와 20메가픽셀입니다. [이미지 압축 및 출력 해상도](/ko/api-capabilities/image-compression-resolution)를 참조하십시오 |
  | 파일 필드 이름을 `image`로 지정 | 다른 이름은 `image is required`를 반환합니다 — 그리고 다중 이미지 융합은 애초에 그 엔드포인트를 사용해서는 안 됩니다                            |
</Accordion>

## APIYI의 FLUX를 사용하는 이유는?

BFL 공식 채널의 드롭인 대체재로, 프로덕션에서 **안정성**, **비용**, **통합 경험** 측면에 최적화되어 있습니다:

<CardGroup cols={2}>
  <Card title="OpenAI 호환 래퍼 · 코드 없는 마이그레이션" icon="shield-check">
    BFL 기본 방식은 비동기 폴링을 사용하지만, APIYI는 이를 동기식 **OpenAI Images API**로 래핑합니다. OpenAI SDK의 `base_url`를 여기에 연결하면 됩니다 — 직접 `polling_url` 루프를 작성할 필요가 없습니다.
  </Card>

  <Card title="동시 실행 수 제한 없음 · 활성 작업 24개 초과" icon="infinity">
    BFL은 각 계정을 **활성 작업 24개**로 제한합니다(`flux-kontext-max`은 6개뿐입니다). APIYI는 요청을 게이트웨이에서 풀링하므로, 기업 사용자는 계정별 상한 없이 선형적으로 확장할 수 있습니다.
  </Card>

  <Card title="동일한 가격 또는 최대 17% 할인" icon="percent">
    FLUX.2 \[pro/max/flex]는 1MP에서 공식 가격과 동일하며, klein 4B/9B는 약 28% 저렴하고, FLUX.1 \[pro] 1.1 Ultra는 17% 절감되며, [충전 보너스](/ko/faq/recharge-promotions)를 함께 적용하면 **최대 15% 추가 할인**을 받을 수 있습니다.
  </Card>

  <Card title="전 세계 무마찰 접근" icon="globe">
    **해외 서버나 프록시가 필요하지 않습니다**. 중국 본토 데이터 센터, 주거용 네트워크, 글로벌 노드 모두 안정적인 지연 시간으로 `api.apiyi.com`에 직접 접근할 수 있습니다.
  </Card>

  <Card title="완전한 모델 생태계" icon="layers">
    같은 게이트웨이에서 [gpt-image-2](/ko/api-capabilities/gpt-image-2/overview), [Seedream](/ko/api-capabilities/seedream-image/overview), [Nano Banana](/ko/api-capabilities/nano-banana-image/overview) 및 기타 모델과 함께 사용할 수 있으며 — 시나리오별로 조합할 수 있습니다.
  </Card>

  <Card title="전문 서비스 · 엔터프라이즈 지원" icon="handshake">
    저희 팀은 이미지 생성 배포에 대한 깊은 경험을 보유하고 있습니다 — 모델 선택, 튜닝, PoC부터 프로덕션까지의 통합 지원을 제공합니다.
  </Card>
</CardGroup>

## 주요 기능

<CardGroup cols={2}>
  <Card title="전 속도 스펙트럼" icon="bolt">
    klein 4B/9B **1초 미만**은 소비자용 GPU에서, pro **\< 10s**, max **\< 15s**로, flex는 더 높은 정밀도를 위해 더 느립니다. 실시간부터 플래그십까지 하나의 패밀리입니다.
  </Card>

  <Card title="네이티브 4MP 출력" icon="expand">
    최대 2048×2048(\~4MP)까지 지원하여 FLUX.1의 1.6MP 한도보다 2.5배 큽니다. 모든 종횡비를 지원하며(치수는 16의 배수여야 합니다), 최소 64×64입니다.
  </Card>

  <Card title="다중 참조 퓨전" icon="layers">
    JSON 필드 `input_image` \~ `input_image_8`에는 여러 참조(URL 또는 base64 data URL)가 포함됩니다: FLUX.2 \[pro/max/flex]는 최대 **8개**, \[klein]은 최대 4개까지 지원합니다. prompt에서는 “image 1 / image 2”처럼 참조합니다.
  </Card>

  <Card title="그라운딩 검색" icon="globe">
    FLUX.2 \[max] 전용입니다: prompt가 실시간 웹 검색을 트리거하여 “어제 경기 점수”, “실시간 날씨”, “역사적 사건 재현” 등을 렌더링할 수 있습니다.
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="정확한 Hex 색상 제어" icon="palette">
    prompt에 `#02eb3c` / `#ff0088`와 같은 hex 코드를 직접 입력합니다. 모델이 정확한 색상을 렌더링하므로 브랜드에 민감한 작업에서 후처리가 필요 없습니다.
  </Card>

  <Card title="32K-Token 장문 prompt" icon="type">
    구조화된 JSON 설명(주제 / 배경 / 조명 / 스타일)을 포함해 최대 **32K tokens**를 지원합니다. 프로덕션 자동화에 이상적입니다.
  </Card>

  <Card title="타이포그래피 최적화" icon="type">
    FLUX.2 \[flex]는 타이포그래피에 맞춰 특별히 설계되었습니다. 포스터 헤더, UI 목업, 인포그래픽 — 작은 텍스트 충실도는 업계를 선도합니다. max / pro도 잘 작동합니다.
  </Card>

  <Card title="OpenAI SDK 바로 적용" icon="plug">
    `base_url`를 `https://api.apiyi.com/v1`로 설정하고 `client.images.generate(model="flux-2-pro", ...)`를 바로 호출하면 됩니다 — 코드 변경 없이.
  </Card>
</CardGroup>

## 가격

이미지당 가격 — **APIYI 가격** 열을 참조하십시오. BFL의 공식 가격은 **MP(메가픽셀)** 기준이며, 1MP 이내에는 기본 요금이 있고 추가 MP마다 증분 비용이 붙습니다. APIYI의 이미지당 고정 요금은 더 예측 가능합니다.

### FLUX.2 시리즈 (최신 세대)

| 모델 ID             | APIYI 가격 | 공식          | 속도     | 적합 용도                             |
| ----------------- | -------- | ----------- | ------ | --------------------------------- |
| `flux-2-max`      | \$0.0700 | \$0.07/MP부터 | \< 15s | 플래그십 품질 + grounding 검색            |
| `flux-2-pro`      | \$0.0300 | \$0.03/MP부터 | \< 10s | 대규모 프로덕션, 최고 가성비                  |
| `flux-2-flex`     | \$0.0600 | \$0.06/MP   | 더 느림   | 타이포그래피에 최적화, steps/guidance 조절 가능 |
| `flux-2-klein-9b` | \$0.0100 | \$0.015부터   | 1초 미만  | 균형 잡힌 품질과 속도                      |
| `flux-2-klein-4b` | \$0.0100 | \$0.014부터   | 1초 미만  | 가장 빠르며 소비자용 GPU에 적합               |

### FLUX.1 Kontext 시리즈 (이미지 편집 전문)

| 모델 ID              | APIYI 가격 | 공식     | 절감    | 적합 용도                 |
| ------------------ | -------- | ------ | ----- | --------------------- |
| `flux-kontext-max` | \$0.0700 | \$0.08 | 12.5% | 최고의 편집 품질, 정교한 타이포그래피 |
| `flux-kontext-pro` | \$0.0350 | \$0.04 | 12.5% | 편집용 가성비 선택, 5–6초 생성   |

### FLUX.1 \[pro] 레거시 (역사적 버전, 여전히 호출 가능)

| 모델 ID                | APIYI 가격 | 공식     | 절감    |
| -------------------- | -------- | ------ | ----- |
| `flux-pro-1.1-ultra` | \$0.0500 | \$0.06 | 17%   |
| `flux-pro-1.1`       | \$0.0350 | \$0.04 | 12.5% |
| `flux-pro`           | \$0.0400 | \$0.04 | 동일    |
| `flux-dev`           | \$0.0200 | —      | —     |

상세 사양과 마이그레이션 안내는 [과거 버전 페이지](/ko/api-capabilities/flux/historical-versions)를 참조하십시오.

<Info>
  **가격 참고사항**:

  * APIYI는 이미지당 고정 요금을 사용합니다 — 출력 MP와 관계없이 비용이 동일합니다
  * 공식 가격은 MP 구간별입니다: 첫 MP에는 기본 요금이 적용되고 추가 MP마다 증분 비용이 붙습니다
  * 편집 요청은 텍스트-투-이미지와 동일한 비용입니다(OpenAI gpt-image-2에서는 편집이 Vision tokens으로 과금되는 것과 다릅니다)
  * klein 4B / klein 9B 오픈 웨이트는 Hugging Face에서 셀프 호스팅용으로 제공됩니다(Apache 2.0 / FLUX NCL)
  * 실패한 요청(4xx / moderation 차단)은 과금되지 않습니다
</Info>

## 기술 사양

| Dimension              | Value                                                                     |
| ---------------------- | ------------------------------------------------------------------------- |
| **권장 기본**              | `flux-2-pro` / `flux-2-pro-preview` (범용) + `flux-kontext-max` (타이포그래피 편집) |
| **속도**                 | 1초 미만 (klein) / \< 10초 (pro) / \< 15초 (max) / 더 느림 (flex)                 |
| **출력 해상도**             | 최대 4MP (2048×2048), 임의의 가로세로비, 크기는 16의 배수여야 함                             |
| **입력 해상도**             | 최소 64×64, 최대 4MP (편집 엔드포인트 전용)                                            |
| **참조 이미지**             | 8 (FLUX.2 \[pro/max/flex]) / 4 (FLUX.2 \[klein]) / 1 (FLUX.1 Kontext)     |
| **prompt 길이**          | 최대 32K tokens                                                             |
| **출력 형식**              | `jpeg` (기본) / `png`                                                       |
| **모더레이션**              | `safety_tolerance` 0–6 (0 = 가장 엄격함, 6 = 가장 관대함, 기본 2)                     |
| **그라운딩 검색**            | `flux-2-max`만                                                             |
| **응답 필드**              | `data[0].url` (**10분간 유효**, 즉시 다운로드)                                      |
| **요청당 이미지 수**          | 1 (`n=1`)                                                                 |
| **prompt\_upsampling** | FLUX.2 \[pro/max/flex]에서 지원되며 \[klein]에서는 지원되지 않음                         |

## API 엔드포인트

| Endpoint                      | 용도                                                                                      | Content-Type          |
| ----------------------------- | --------------------------------------------------------------------------------------- | --------------------- |
| `POST /v1/images/generations` | 텍스트-이미지 + 이미지 편집 / 다중 참조 융합 (JSON `input_image` \~ `input_image_8`, **권장**, 모든 FLUX 모델) | `application/json`    |
| `POST /v1/images/edits`       | OpenAI 호환 단일 이미지 편집 (`client.images.edit()` 드롭인; Kontext 시리즈에서 검증됨)                     | `multipart/form-data` |

다중 참조 융합에는 `/generations`(JSON `input_image_N`)을 사용합니다. `/edits` 엔드포인트는 단일 `image` 파일만 허용하며, 기존 OpenAI SDK 편집 코드를 마이그레이션할 때 가장 적합합니다.

<Tip>
  **도메인 옵션**: `api.apiyi.com`이 주 도메인입니다. `b.apiyi.com` / `vip.apiyi.com` 같은 대체 게이트웨이 도메인도 동일하게 동작합니다.
</Tip>

## 크기(너비 / 높이) 상세

### 일반적인 치수

| 크기          | 종횡비       | 픽셀      | 용도                   |
| ----------- | --------- | ------- | -------------------- |
| `1024x1024` | 정사각형 1:1  | \~1MP   | 범용, 소셜 아바타           |
| `1024x1536` | 세로형 2:3   | \~1.6MP | 포스터, 인물 사진           |
| `1536x1024` | 가로형 3:2   | \~1.6MP | 풍경, 데스크톱             |
| `1440x2048` | 세로형 \~3:4 | \~2.9MP | 시네마틱 세로              |
| `1920x1080` | 가로형 16:9  | \~2MP   | 동영상 썸네일              |
| `2048x2048` | 정사각형 1:1  | 4MP     | 플래그십 인쇄물 (FLUX.2 한도) |

### 사용자 지정 크기 제약

FLUX.2는 다음 조건을 모두 만족하는 한 임의의 치수를 허용합니다:

1. **너비 / 높이는 16의 배수여야 합니다**
2. **최소 64×64**
3. **최대 \~4MP** (예: 2048×2048 / 1920×2048 / 2048×1920)
4. **속도와 비용의 균형을 위해 총합은 2MP 이하를 권장합니다**

**유효한 예시**: `1280x720`, `1920x1080`, `2048x1024`, `1456x1920`
**유효하지 않은 예시**: `1000x1000` (16의 배수가 아님), `3840x2160` (4MP 초과), `32x32` (64×64 미만)

<Warning>
  **API: width/height vs OpenAI-compatible size**: BFL은 기본적으로 정수 `width` / `height`를 사용합니다. APIYI도 OpenAI 스타일의 `size: "1024x1024"` 문자열을 허용합니다. 둘은 동일하므로 아무거나 선택하면 됩니다.
</Warning>

## 모범 사례

<Steps>
  <Step title="시나리오별로 모델 선택">
    플래그십 최종 + 실시간 지식 필요 → `flux-2-max`. 프로덕션 배치 → `flux-2-pro`. 타이포그래피 포스터 / 인포그래픽 → `flux-2-flex`. 고처리량 실시간 → `flux-2-klein-9b`. 이미지 편집 → `flux-kontext-max` 또는 `flux-kontext-pro`.
  </Step>

  <Step title="기본은 ≤ 2MP">
    속도와 비용의 최적 구간은 1MP–2MP입니다. 4MP는 정말 필요할 때만 사용합니다(인쇄, 4K 화면). 고해상도에서 klein은 호출당 비용을 눈에 띄게 높입니다.
  </Step>

  <Step title="prompt에서 인덱스로 참조 이미지 지정">
    `input_image` / `input_image_2` / `input_image_3`의 번호는 prompt의 "image 1 / image 2 / image 3" 인덱스와 정확히 일치합니다. "image 1의 인물, image 2의 장면, image 3의 색상 팔레트"라고 말하는 편이 모델이 추측하게 두는 것보다 훨씬 더 신뢰할 수 있습니다.
  </Step>

  <Step title="결과 URL을 즉시 다운로드">
    `data[0].url`은 **10분 동안만 유효합니다**, `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`에 호스팅되며 CORS가 비활성화되어 있습니다. 프로덕션에서는 서버 측에서 다운로드하여 자체 CDN에 저장해야 합니다.
  </Step>

  <Step title="타이포그래피는 flex 또는 max로 고정">
    간판 텍스트, 포스터, UI 스크린샷에는 `flux-2-flex`(타이포그래피 특화) 또는 `flux-2-max`(전체 품질 최고)을 우선 사용합니다. 다른 모델은 작은 텍스트가 여전히 흐려질 수 있습니다.
  </Step>

  <Step title="그라운딩 검색에는 max 사용">
    실시간 지식("오늘의 날씨", "어젯밤 경기")은 `flux-2-max`에서만 지원됩니다. 다른 모델은 학습 데이터에 의존하므로 실시간 정보를 가져올 수 없습니다.
  </Step>

  <Step title="클라이언트 타임아웃 60–120s">
    APIYI는 폴링을 내부적으로 처리하며 pro / max는 \< 15초 내에 반환되지만, 큐잉과 네트워크 지터를 고려해 클라이언트 타임아웃은 60–120초로 설정합니다. flex는 최대 180초까지 가능합니다.
  </Step>

  <Step title="재현성을 위해 seed 고정">
    동일한 `seed` + 동일한 다른 파라미터 = 일관된 결과로, A/B 테스트와 클라이언트 검토에 유용합니다. klein은 `prompt_upsampling`를 지원하지 않으며, pro/max/flex는 기본적으로 꺼져 있으므로 필요할 때 사용 설정합니다.
  </Step>
</Steps>

## 오류 코드 및 재시도

| 상태      | 의미                                                                | 권장 조치                                         |
| ------- | ----------------------------------------------------------------- | --------------------------------------------- |
| `400`   | 잘못된 매개변수(width/height가 16의 배수가 아님, 4MP 초과, prompt가 32K tokens 초과) | 크기 제약을 기준으로 검증하십시오. 특히 16의 배수 규칙을 확인하십시오      |
| `401`   | 잘못된 token                                                         | Bearer token을 확인하십시오                          |
| `403`   | 모더레이션 차단                                                          | prompt를 조정하거나 `safety_tolerance`를 높이십시오(최대 6) |
| `429`   | 요청 제한됨 / credit 부족 / 활성 작업 초과                                     | 지수 백오프 재시도                                    |
| `5xx`   | 게이트웨이 / 백엔드 오류                                                    | 1\~2회 재시도                                     |
| Timeout | 롱테일                                                               | 클라이언트 타임아웃 ≥ **60s**(최대 180s까지 유연하게)          |

<Info>
  **권장 클라이언트 설정**:

  * 요청 타임아웃 **60–120s**(최대 180s까지 유연하게)
  * 5xx 및 429에 대한 지수 백오프(재시도 2회 권장)
  * `data[0].url`를 받으면 **즉시 비동기로 다운로드**하십시오 — 사용자의 클릭을 기다리지 마십시오
  * 지원을 위해 `x-request-id` 응답 헤더를 기록하십시오
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="URL 필드가 왜 10분 후에 만료됩니까?">
    BFL은 결과를 `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`에 10분 동안 유효한 서명된 URL로 호스팅하며, **CORS는 비활성화되어 있습니다**. 프로덕션 서비스는 서버 측에서 자체 OSS / CDN으로 다운로드해야 합니다. 원본 URL을 브라우저에 전달하지 말고, 사용자가 나중에 접근할 수 있다고 기대해서도 안 됩니다.

    APIYI는 동일한 URL 메커니즘을 그대로 상속합니다. 동작은 공식 채널과 동일합니다.
  </Accordion>

  <Accordion title="공식 API는 비동기 폴링을 사용하는데, APIYI는 어떻게 동기식으로 만듭니까?">
    APIYI 게이트웨이가 폴링을 대신 처리합니다. 표준 OpenAI Images API 요청을 보내면, 게이트웨이가 내부적으로 BFL에 POST한 뒤 `polling_url`를 `Ready`까지 폴링하고, 최종 `result.sample` URL을 `data[0].url`로 감싸서 반환합니다. 클라이언트 입장에서는 단일 요청-응답이며, OpenAI / GPT-Image / Nano Banana와 동일합니다.
  </Accordion>

  <Accordion title="참조 이미지는 몇 장까지 보낼 수 있습니까? prompt는 어떻게 작성해야 합니까?">
    * **FLUX.2 \[pro/max/flex]**: 최대 **8장**
    * **FLUX.2 \[klein]**: 최대 **4장**
    * **FLUX.1 Kontext \[pro/max]**: 단일 참조만 지원함(다중 이미지는 클라이언트 측 스티칭 필요)

    prompt에서 인덱스("image 1 / image 2 / image 3")로 참조하면 됩니다. 예: "image 1의 사람을 image 2의 장면에 배치하고, image 3의 색상 팔레트를 적용하세요". 자연어 참조도 동작하며, 모델은 입력 이미지를 잘 이해합니다.
  </Accordion>

  <Accordion title="prompt_upsampling은 무엇을 합니까? 활성화해야 합니까?">
    `prompt_upsampling=true`는 prompt를 자동으로 확장하고 다듬어 줍니다(특히 짧은 prompt에 유용합니다). 하지만 **원래 의도를 변경합니다**. 브랜드 작업에는 끄고, 자유로운 탐색에는 켜 두십시오.

    **제한 사항**: FLUX.2 \[klein]은 이를 지원하지 않습니다(전달해도 조용히 무시됩니다).
  </Accordion>

  <Accordion title="grounding search는 어떻게 사용합니까?">
    `flux-2-max`만 이를 지원합니다. **별도의 파라미터는 필요하지 않습니다**. prompt에 실시간 정보가 필요하면, 모델이 생성 전에 자동으로 웹을 검색합니다. 예:

    > "2025년 12월 15일 NYC를 강타한 눈보라에 대한 뉴스 사진을 생성하세요"

    "어제 경기 스코어", "실시간 날씨", "역사적 사건 재현", "최신 트렌드"에 적합합니다. 시간 민감한 내용이 없는 prompt는 검색을 트리거하지 않으며, 일반 생성으로 과금됩니다.
  </Accordion>

  <Accordion title="hex 색상을 가장 효과적으로 사용하는 방법은 무엇입니까?">
    명시적인 "color" 또는 "hex" 마커와 함께 hex 코드를 prompt에 직접 작성하십시오:

    ```
    A vase on a table, the color of the vase is gradient from #02eb3c to #edfa3c, the flowers have color #ff0088
    ```

    또는 여러 색상을 쓰는 브랜드 작업의 경우:

    ```
    Luxury eyeshadow palette with 6 pans: top row #B76E79, #E8D5B7, #8B4789; bottom row #CD7F32, #F8F6F0, #800020
    ```

    업계 최고 수준의 정밀도를 제공합니다. 사후 색상 보정이 필요하지 않습니다.
  </Accordion>

  <Accordion title="구조화된 JSON prompting이란 무엇입니까?">
    FLUX.2는 JSON 형식의 prompts를 지원합니다:

    ```json theme={null}
    {
      "subject": "Mona Lisa painting by Leonardo da Vinci",
      "background": "museum gallery wall, ornate gold frame",
      "lighting": "soft gallery lighting",
      "style": "digital art, high contrast",
      "camera_angle": "eye level view",
      "composition": "centered, portrait orientation"
    }
    ```

    JSON 문자열을 `prompt` 필드로 전달하십시오. 프로덕션 자동화와 템플릿 기반 배치 생성에 이상적입니다.
  </Accordion>

  <Accordion title="이미지 편집에는 어떤 endpoint를 사용해야 합니까?">
    두 가지 옵션이 있습니다:

    * **옵션 A(권장)**: JSON + `input_image`(\~ `input_image_8`)를 `/v1/images/generations`에 전달 — 모든 FLUX 모델에서 동작하며 다중 참조 융합을 지원합니다
    * **옵션 B**: `multipart/form-data`를 `/v1/images/edits`에 전달 — 파일 필드 이름은 `image`이어야 하며(단일 이미지), OpenAI SDK의 `client.images.edit()`와 직접 호환되고, Kontext 시리즈에서 검증되었습니다

    매개변수와 예시는 [이미지 편집 API](/ko/api-capabilities/flux/image-edit)를 참조하십시오.

    **참고**: FLUX.1 Kontext는 기본적으로 단일 참조만 지원하며, FLUX.2는 최대 8개 참조를 지원합니다(옵션 A 사용 시).
  </Accordion>

  <Accordion title="OpenAI 공식 SDK를 직접 사용할 수 있습니까?">
    네, 코드 변경이 전혀 필요 없습니다. `base_url`를 `https://api.apiyi.com/v1`로 설정하십시오:

    ```python theme={null}
    from openai import OpenAI
    client = OpenAI(api_key="sk-your-key", base_url="https://api.apiyi.com/v1")
    resp = client.images.generate(
        model="flux-2-pro",
        prompt="...",
        size="1024x1024"
    )
    ```

    Node.js `openai` 패키지도 동일합니다. 모든 FLUX 모델은 `data[0].url`를 포함한 OpenAI Images API 응답 형식을 따릅니다.
  </Accordion>

  <Accordion title="실행 중인 작업을 취소할 수 있습니까?">
    **지원하지 않습니다**. 클라이언트가 연결을 끊어도 서버는 생성 작업을 계속 완료하며, 정상적으로 과금됩니다. 클라이언트 측 타임아웃을 설정하고 "연결 끊김 = 과금 없음"에 의존하지 마십시오.
  </Accordion>

  <Accordion title="요청 제한과 동시 실행 수 상한은 어떻게 됩니까?">
    BFL은 각 계정에 대해 **활성 작업 24개**로 제한하며, `flux-kontext-max`는 별도로 **6개**로 제한됩니다.

    APIYI는 게이트웨이에서 풀링하므로, 엔터프라이즈 동시 실행 수는 계정별 상한에 묶이지 않습니다. 명시적인 SLA / RPM 약정이 필요하면, 전용 쿼터를 위해 저희 팀에 문의하십시오.
  </Accordion>

  <Accordion title="webhook 콜백이 동작합니까?">
    BFL은 기본적으로 `webhook_url` + `webhook_secret`를 지원하지만, APIYI의 OpenAI 호환 래퍼는 동기적으로 대기하며 **webhook 필드를 그대로 전달하지 않습니다**. 폴링은 필요하지 않으며, 요청-응답은 한 번에 끝납니다. 비즈니스상 정말로 webhooks가 필요하다면, 네이티브 비동기 채널을 활성화할 수 있도록 문의하십시오.
  </Accordion>

  <Accordion title="실패한 요청도 과금됩니까?">
    **아니요**. `400`(파라미터 오류), `403`(moderation 차단), `429`(요청 제한됨)은 모두 오류를 반환하며 과금되지 않습니다. **실제로 생성 단계에 진입한 요청(200 + `data[0].url`)만 과금됩니다**.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [Text-to-Image Playground](/ko/api-capabilities/flux/text-to-image) — `/v1/images/generations` 대화형 디버거
* [Image Editing Playground](/ko/api-capabilities/flux/image-edit) — 다중 참조 융합 + 편집
* [Historical Versions & Migration](/ko/api-capabilities/flux/historical-versions) — FLUX.1 \[pro] / \[pro] 1.1 / Ultra / \[dev]
* [API Manual](/ko/api-manual) — 일반 사용 사양
* [GPT-Image-2 Overview](/ko/api-capabilities/gpt-image-2/overview) — OpenAI 플래그십, 4K 지원
* [Seedream Overview](/ko/api-capabilities/seedream-image/overview) — BytePlus 파트너십 채널

<Info>
  FLUX는 BFL의 퍼스트파티 모델 패밀리로, 색상 코드 정밀도, 타이포그래피 충실도, 긴 prompt 이해에서 업계를 선도합니다. OpenAI 생태계 호환성을 우선한다면 [GPT-Image-2](/ko/api-capabilities/gpt-image-2/overview)를 보십시오. 중국어 시나리오라면 [Seedream](/ko/api-capabilities/seedream-image/overview)을 보십시오.
</Info>
