> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-image-2 공식 vs 리버스

> 공식 gpt-image-2와 리버스 엔지니어링된 형제 모델 gpt-image-2-all 및 gpt-image-2-vip를 비교합니다: 채널 성격, 과금, 엔드포인트, 업로드/출력 형식, 속도 vs 품질 포지셔닝, prompt 준수성을 살펴보고 적합한 것을 고르십시오.

## 요약

| 필요한 것이                                                                         | 선택                                            |
| ------------------------------------------------------------------------------ | --------------------------------------------- |
| **`quality` 노브 / 마스크 인페인팅 / 30개 프리셋을 넘어서는 임의의 커스텀 크기 / 엄격한 OpenAI-API 필드 일치성** | `gpt-image-2` (공식, token 기준 과금)               |
| **예측 가능한 고정 \$0.03/image + 빠른 출력(속도가 장점입니다)**                                  | `gpt-image-2-all` (리버스, ChatGPT 웹 라인, 약 90초)  |
| **예측 가능한 고정 \$0.03/image + 고정된 크기(4K 포함 30개 프리셋) + 때로는 더 높은 품질(급하지 않을 때)**     | `gpt-image-2-vip` (리버스, Codex 라인, 약 120–200초) |

세 모델 모두 **내부적으로 OpenAI의 gpt-image-2를 기반으로** 구축되었습니다. 차이는 채널 특성(공식 직결 vs 역공학), 과금 모델, 그리고 파라미터 세분성에 있습니다.

<Note>
  **두 리버스 형제(-all / -vip)**: 이 페이지의 "리버스" 열은 **둘 다** `gpt-image-2-all`과 `gpt-image-2-vip`를 포함합니다 — 둘은 동일한 호출 형식(`-vip`은 추가로 `size` 필드를 지원합니다)과 동일한 \$0.03/image 정액 가격을 공유합니다. 현재 차이는 **속도 대 품질 + 크기 고정**입니다:

  * `gpt-image-2-all`: ChatGPT 웹 라인, **약 90초** 생성 — **속도가 장점입니다**
  * `gpt-image-2-vip`: Codex 라인, **약 120–200초** 생성 — 더 느리지만 **때로는 더 높은 품질**을 제공하며, \*\*`size` 고정(4K 포함 30개 프리셋, 2026-07-22부터 복구됨)\*\*을 지원합니다
  * 둘 다: `quality` 없음, `n` 없음, 마스크 인페인팅 없음

  `quality` 티어, 마스크 인페인팅, 또는 30개 프리셋을 넘는 임의의 커스텀 크기가 필요하면 공식 `gpt-image-2`를 사용하십시오.
</Note>

<Tip>
  **현재 속도에 관하여**: `-all` / `-vip` 생성은 **OpenAI 상위 계층의 컴퓨팅 변동** 때문에 출시 초기보다 **느립니다** — 이는 APIYI만이 아니라 모든 리버스 채널 사용자에게 영향을 주며, 당사의 계정 풀과 운영은 정상입니다. 클라이언트 타임아웃을 300초 이상으로 설정하고 복잡한 prompt를 위해 더 많은 여유를 두십시오.
</Tip>

## 전체 비교 표

| 항목                 | **gpt-image-2-all / -vip** (역공학 기반, 비용 효율적)                                                                                                                                                                   | **gpt-image-2** (공식)                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **모델 이름**          | `gpt-image-2-all` (최고 속도) / `gpt-image-2-vip` (품질 우선, 사이즈 고정)                                                                                                                                                 | `gpt-image-2`                                                            |
| **채널 성격**          | `-all`: 역공학한 ChatGPT 웹 라인<br />`-vip`: 역공학한 Codex 라인                                                                                                                                                          | 공식 직접 연동 (OpenAI Images API)                                             |
| **과금**             | **호출당**: 고정 \$0.03/회 (두 모델 모두 동일 가격)                                                                                                                                                                          | **token 기준 과금**: 공식과 동일하며, APIYI 충전 보너스 적용 후 약 **정가의 85%**               |
| **일반적인 이미지당 비용**   | \$0.03 (크기 / 품질 / 모델과 무관)                                                                                                                                                                                     | 실측 **\$0.03 – \$0.2** (prompt 길이, 크기, 품질과 연동됨)                           |
| **token 그룹**       | 기본                                                                                                                                                                                                            | 기본                                                                       |
| **token 유형**       | **호출당** 또는 **토큰 우선순위** 모두 사용 가능                                                                                                                                                                               | **토큰 우선순위 전용** (이 모델은 token 기준 과금이며, 호출당 tokens는 거부됩니다)                  |
| **권장 엔드포인트**       | **`/v1/images/generations` + `/v1/images/edits`** (더 안정적이고 상위 공급도 더 많으며, 공식과 코드도 동일합니다 — 리스크 제어 변동기에는 `model` 이름만 바꿔 전환하면 됩니다)                                                                                | `/v1/images/generations` + `/v1/images/edits`                            |
| **업로드 형식**         | multipart file (edits 엔드포인트)                                                                                                                                                                                  | multipart file (edit 엔드포인트)                                              |
| **출력 형식**          | `b64_json` (기본값, **접두사 없는 raw base64**, 2026-07 확인; 이전 버전에는 접두사가 포함되어 있었습니다) 또는 `url` (R2 CDN)                                                                                                                | `b64_json` (**접두사 없는 raw base64**)                                       |
| **참조 이미지 수**       | 여러 장                                                                                                                                                                                                          | **최대 16장** (`image[]`)                                                   |
| **마스크 인페인팅**       | ❌ 지원하지 않음                                                                                                                                                                                                     | ✅ 지원됨 (alpha 채널 필요)                                                      |
| **prompt 준수도**     | 좋음                                                                                                                                                                                                            | **매우 우수함**                                                               |
| **생성 속도**          | `-all`: \~**90초** (속도가 장점입니다)<br />`-vip`: \~**120–200초** (더 느리지만, 때로는 품질이 더 높습니다)<br />📌 현재는 출시 초기보다 느립니다 — OpenAI 상위 연산 자원 문제이며, APIYI 측 문제는 아닙니다                                                          | \~**100-120초**, 복잡한 작업 + 4K는 3-5분까지 걸릴 수 있습니다                            |
| **품질 경향**          | `-all`: 좋음<br />`-vip`: **때때로 더 높음** (Codex 라인, 세부 표현이 더 나은 경우가 있음)                                                                                                                                           | 안정적이며, `quality=high`가 이를 최대로 끌어올립니다                                     |
| **`size` 파라미터**    | `-all`: ❌ 지원하지 않음(prompt에 설명하십시오)<br />`-vip`: ✅ **복원됨** (2026-07-22 이후), 30개 사전 설정 크기(4K 포함); 이미지 엔드포인트에서만 지원되며 chat 엔드포인트에서는 지원되지 않습니다                                                                      | ✅ 유효한 사용자 지정 크기 모두                                                       |
| **4K 지원**          | `-all`: ❌<br />`-vip`: ✅ 4K 디테일 티어(예: `3840x2160` / `2880x2880`), 추가 요금 없음                                                                                                                                    | ✅ `3840×2160` 포함                                                         |
| **일반 출력 크기**       | `-all`: 16:9 → 1672×941, 9:16 → 941×1672, 1:1 → 1254×1254 (적응형)<br />`-vip`: 30개 사전 설정(10개 비율 × 1K/2K/4K), [전체 30개 크기 표](/ko/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table) 참조 | 8개 사전 설정 + 유효한 사용자 지정 크기 모두                                              |
| **`quality` 파라미터** | ❌ 두 역공학 모델 모두 이를 거부합니다(전달하지 마십시오)                                                                                                                                                                             | ✅ `low` / `medium` / `high` / `auto`                                     |
| **`n` 파라미터**       | ❌ 두 역공학 모델 모두 이를 거부합니다(호출당 이미지 1장)                                                                                                                                                                            | ✅ 지원됨                                                                    |
| **투명 배경**          | ⚠️ `background` 파라미터 없음 — prompt만으로 지정하며, 때때로 신뢰성이 떨어집니다                                                                                                                                                      | ✅ 파라미터로 제어되며 안정적입니다 — `background: "transparent"`를 `png` / `webp`와 함께 사용 |
| **중국어 prompt**     | ✅ 네이티브                                                                                                                                                                                                        | ✅ 네이티브                                                                   |
| **텍스트 렌더링**        | 고정밀                                                                                                                                                                                                           | 고정밀 (`high` 티어에서 가장 강함)                                                  |
| **API 문서**         | [GPT-Image-2-All 개요](/ko/api-capabilities/gpt-image-2-all/overview) / [GPT-Image-2-VIP 개요](/ko/api-capabilities/gpt-image-2-vip/overview)                                                                     | [GPT-Image-2 개요](/ko/api-capabilities/gpt-image-2/overview)              |

<Info>
  🔑 **API tokens 생성/관리**: [https://api.apiyi.com/token](https://api.apiyi.com/token)\
  콘솔에서 token을 생성할 때는 그룹(`Default`도 괜찮습니다)과 token 유형(**호출당** / **토큰 우선순위**)을 선택하십시오. **`gpt-image-2`(공식) 호출에는 토큰 우선순위 token이 필요합니다** — 호출당 tokens는 과금 모드 불일치로 거부됩니다.
</Info>

## 각 항목을 선택할 때

### `gpt-image-2-all` (리버스)를 선택할 때

<CardGroup cols={2}>
  <Card title="💰 예측 가능한 비용" icon="dollar-sign">
    크기/품질 티어가 없는 이미지당 \$0.03의 안정적인 요금입니다. **비용 상한이 엄격한 배치 제작**(인포그래픽, 마케팅 자산, 이커머스 썸네일)에 이상적입니다.
  </Card>

  <Card title="⚡ 더 빠른 출력" icon="bolt">
    생성 시간 약 \~90초로 — `-vip`와 공식 버전보다 **약간 더 빠릅니다**. **실시간 UX가 더 좋습니다.**
  </Card>

  <Card title="🔁 하나의 코드베이스, 언제든 전환 가능" icon="repeat">
    표준 Images API 형식 — `-vip` 및 공식 릴레이 `gpt-image-2`와 **동일한 코드**이며; `model` 이름만 바꾸면 전환하거나 폴백할 수 있습니다.
  </Card>

  <Card title="🌏 중국어 + 마케팅 텍스트" icon="type">
    중국어 prompt를 기본 지원하며, 간판 / 포스터 / 인포그래픽에 대한 텍스트 렌더링이 뛰어납니다 — **중국어 대상 콘텐츠 제작에 매우 적합합니다**.
  </Card>
</CardGroup>

### `gpt-image-2-vip` (리버스, 품질 우선)를 선택할 때

<CardGroup cols={2}>
  <Card title="🎨 때때로 더 높은 품질" icon="wand-sparkles">
    Codex 라인의 디테일 렌더링은 **때때로 `-all`보다 더 좋습니다** — 서두르지 않고 같은 리버스 채널 정액 가격에서 조금 더 높은 품질을 원하는 쇼케이스 이미지에 적합합니다.
  </Card>

  <Card title="⏱️ 시간을 품질과 맞바꿀 때" icon="hourglass">
    생성 시간은 약 **120–200초**로, `-all`보다 느립니다 — 더 높은 상한을 위해 더 긴 대기 시간을 감수할 수 있을 때 선택하십시오.
  </Card>

  <Card title="🖼️ 고정 크기 / 4K" icon="expand">
    `size` 파라미터가 **복원되었습니다**(2026-07-22 기준): 30개의 사전 설정 크기(10개 비율 × 1K/2K/4K). 이커머스 히어로 샷, 포스터 템플릿, 4K 배경화면을 정확한 크기로 출력할 수 있습니다 — 정액 이미지당 \$0.03, 4K 추가 요금 없음.
  </Card>

  <Card title="🔁 -all과 코드 공유" icon="copy">
    `-all`와 동일한 요청 구조이며(`size` 필드가 하나 추가될 뿐), 속도 / 품질 선호도에 따라 `model` 이름만 바꾸면 **하나의 코드베이스로 두 모델을 전환**할 수 있습니다.
  </Card>
</CardGroup>

<Note>
  `-vip`의 `size`는 `/v1/images/generations` 및 `/v1/images/edits` 엔드포인트에서만 작동합니다 — **`/v1/chat/completions` chat 엔드포인트는 `size`를 지원하지 않습니다**. 30개 사전 설정을 넘어서는 임의의 사용자 지정 크기, `quality` 티어, 또는 마스크 인페인팅이 필요하면 공식 `gpt-image-2`를 사용하십시오. 이 파라미터의 제공 여부는 업스트림 변경 사항을 따릅니다 — 최신 상태는 [실시간 업데이트](/en/live)를 참조하십시오.
</Note>

### `gpt-image-2` (공식)를 선택할 때

<CardGroup cols={2}>
  <Card title="🎚️ 품질 티어" icon="sliders-horizontal">
    `quality`는 low/medium/high/auto를 지원합니다. **초안에는 `low`를 사용해 비용을 절감하고; 인쇄용 최종본에는 `high`를 사용하십시오** — 공식 전용이며, 두 리버스 모델은 이를 거부합니다.
  </Card>

  <Card title="🎯 마스크 인페인팅" icon="paintbrush">
    알파 채널 마스크를 지원합니다 — **나머지는 보존하면서 특정 영역을 정밀하게 수정할 수 있습니다**. 두 리버스 모델은 이를 지원하지 않습니다.
  </Card>

  <Card title="🖼️ 임의의 사용자 지정 크기" icon="expand">
    `size`는 사전 설정에 제한되지 않고 4K를 포함한 **유효한 해상도라면 무엇이든** 지원합니다. `-vip`는 30개 사전 설정 크기만 지원하므로 — 그 30개를 넘는 것은 모두 공식으로 가야 합니다.
  </Card>

  <Card title="🔌 OpenAI 공식과 동일" icon="plug">
    공식 Images API를 거치며 — 필드와 동작이 OpenAI 공식과 동일합니다. **기존 OpenAI-SDK 기반 코드 / 시스템은 변경 없이 마이그레이션되며** 장기적으로 안정적으로 유지됩니다.
  </Card>
</CardGroup>

## 자세한 차이점

### 1. b64\_json 형식의 함정(마이그레이션 함정!)

2026년 7월에 검증한 바에 따르면, 두 모델 모두 이제 \*\*원시 base64(`data:` 접두사 없음)\*\*를 반환합니다 — 하지만 `gpt-image-2-all`은 예전에는 접두사를 포함했으므로, 가장 안전한 공용 코드는 먼저 이를 확인합니다:

```python theme={null}
# Universal pattern: detect the prefix before processing — works for both models
b64 = resp["data"][0]["b64_json"]
if b64.startswith("data:"):          # handles historical prefixed responses
    b64 = b64.split(",", 1)[1]
with open("out.png", "wb") as f:
    f.write(base64.b64decode(b64))   # ✅ write file
img_tag = f'<img src="data:image/png;base64,{b64}">'  # ✅ browser render
```

<Warning>
  둘 사이를 전환할 때는 **`b64_json` 처리 코드를 바꿔야 합니다**, 그렇지 않으면 손상된 데이터 URL이 생기거나 디코딩 실패가 발생합니다.
</Warning>

### 2. 해상도 제어

**gpt-image-2-all** (프롬프트에):

```
"Landscape 16:9 cinematic, old lighthouse at sunset"   → ~1672×941
"Portrait 9:16 phone wallpaper, cyberpunk city"        → ~941×1672
"1024×1024 square logo, minimalist cat line art"        → ~1254×1254
```

**gpt-image-2-vip** (`size`가 복원됨, 2026-07-22부터):

30개의 사전 설정 크기(10개 비율 × 1K/2K/4K)를 지원합니다 — `size: "WIDTHxHEIGHT"`를 직접 전달합니다(30개 사전 설정 중 하나여야 하며, 전체 목록은 [30개 크기 표](/ko/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table)에 있습니다):

```python theme={null}
client.images.generate(
    model="gpt-image-2-vip",
    prompt="...",
    size="3840x2160"    # ✅ one of the 30 presets; images endpoints only (not chat)
)
```

**gpt-image-2** (`size` 파라미터 엄격성 + `quality` 등급):

```python theme={null}
client.images.generate(
    model="gpt-image-2",
    prompt="...",
    size="2048x1152",   # ✅ output exactly this
    quality="high"      # official-only
)
```

### 3. 업로드 / 출력 형식 차이

| 작업            | gpt-image-2-all                                                                                       | gpt-image-2                       |
| ------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------- |
| **참조 업로드**    | 멀티파트 `image` 파일 필드(편집 엔드포인트)                                                                          | 멀티파트 `image[]` 파일 필드              |
| **출력 다운로드**   | 기본 `b64_json`(원시 base64, 2026-07 검증 완료); 명시적인 `response_format: "url"`는 R2 CDN 링크를 반환합니다(**24시간 유효**) | `b64_json`(**원시 base64**, 디코딩 필요) |
| **다중 이미지 융합** | 편집 엔드포인트에서 `image` 필드를 반복합니다                                                                          | `image[]` 배열, **최대 16개**          |

### 4. 대략적인 비용

| 시나리오             | gpt-image-2-all / -vip                                | gpt-image-2                                  |
| ---------------- | ----------------------------------------------------- | -------------------------------------------- |
| 1024×1024 초안     | \$0.03                                                | \~\$0.006(낮음)                                |
| 1024×1024 중간 품질  | \$0.03                                                | \~\$0.053(중간)                                |
| 1024×1024 고품질    | \$0.03                                                | \~\$0.211(높음)                                |
| 2048×1152 고품질    | \$0.03                                                | \~\$0.20+(token 기준 과금)                       |
| 3840×2160 4K 고품질 | \$0.03(`-vip` 4K Detail 티어, 추가 요금 없음; `-all`는 4K가 없음) | token 기준 과금, **1K보다 훨씬 높음**                  |
| 편집 / 다중 이미지 융합   | \$0.03                                                | 입력 token이 급격히 증가하며, 단일 호출이 \$0.1+까지 갈 수 있습니다 |

<Info>
  **핵심 정리**: 배치 / 저품질 워크로드의 경우, 역방향 채널이 항상 더 저렴한 것은 아닙니다(1K 저품질은 실제로 공식 티어에서 더 저렴합니다). **중간\~고품질 범위**가 역방향 채널의 \$0.03 최적 구간입니다. **`quality` 티어 / 마스크 인페인팅 / 고정 크기, 4K / 엄격한 OpenAI-API 필드 일치성**이 필요할 때는 공식(token 기준 과금)을 선택합니다.
</Info>

## 클라이언트 설정

| 설정             | gpt-image-2-all / -vip                                                | gpt-image-2                             |
| -------------- | --------------------------------------------------------------------- | --------------------------------------- |
| **제한 시간(보수적)** | `-all`: **300s** (일반적으로 \~90s)<br />`-vip`: **300s** (일반적으로 120–200s) | **360s** (4K 고화질은 실제로 3\~5분이 걸릴 수 있습니다) |
| **재시도 전략**     | 5xx / 타임아웃에 대해 지수 백오프, 최대 2회 재시도                                      | 동일합니다                                   |
| **동시 실행 수**    | 호출당 이미지 1장 — 여러 장이 필요하면 병렬 요청을 보내십시오                                  | 호출당 이미지 1장 — 여러 장이 필요하면 병렬 요청을 보내십시오    |
| **요청 ID**      | `request-id` 응답 헤더                                                    | `x-request-id` 응답 헤더                    |

<Tip>
  **세 모델 모두 공통: 이미지 편집 / 다중 이미지 융합의 경우 각 입력 이미지를 1.5MB 미만으로 압축해야 합니다** (JPEG 품질 80-90 / 해상도 축소). 간헐적인 `shell_api_error` / `Unknown error` 응답은 대부분 입력이 너무 큰 경우에 발생하며 — 압축하면 성공률과 지연 시간이 눈에 띄게 개선됩니다. **출력 해상도는 입력 크기와 무관합니다** — 품질은 입력 파일 크기가 아니라 출력 측에서 설정됩니다(공식의 경우 `size` + `quality`, `-vip`의 `size` 티어, `-all`의 prompt 문구).
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="입력 이미지를 압축해야 합니까? prompt에 4K / 8K를 쓰면 도움이 됩니까?">
    **네, 강력히 권장합니다.** 세 모델 모두 입력 이미지마다 **1.5MB 미만**으로 압축하십시오(JPEG 품질 80-90 / 해상도 축소): 산발적인 `shell_api_error` / `Unknown error` 응답은 대개 용량이 큰 입력에서 발생하며, 압축하면 성공률과 지연 시간이 눈에 띄게 개선됩니다.

    **압축이 품질을 떨어뜨릴까 걱정하지 마십시오** — 출력 해상도는 입력 크기와 무관합니다. '출력 측' 제어 방식은 세 모델마다 다릅니다:

    * `gpt-image-2-all`: prompt 구성 문구로 제어됩니다([-all 개요 페이지](/ko/api-capabilities/gpt-image-2-all/overview)의 검증된 문구 표를 참조하십시오) — prompt의 `4K` / `8K`는 계산되지 않습니다
    * `gpt-image-2-vip`: `size` 필드로 제어됩니다(4K를 포함한 30개 사전 설정 크기, 2026-07-22에 복구됨) — prompt의 `4K` / `8K` 역시 계산되지 않습니다
    * `gpt-image-2`: `size` + `quality`로 제어됩니다(유효한 모든 사이즈)

    결론: 입력을 줄이는 것은 속도만 높일 뿐입니다 — 품질은 입력 파일 크기가 아니라 출력 측 구성으로 결정됩니다.
  </Accordion>

  <Accordion title="동일한 API 키로 세 모델을 모두 호출할 수 있습니까?">
    예. 세 모델 모두 기본 채널에서 동작합니다 — 동일한 API 키로 추가 설정 없이 호출할 수 있습니다. 참고: `gpt-image-2`(공식)을 호출하려면 "Token-priority" token이 필요합니다. `-all` / `-vip`는 두 token 유형을 모두 허용합니다.
  </Accordion>

  <Accordion title="역방향 채널에서는 어떤 엔드포인트를 사용해야 합니까?">
    **OpenAI 이미지 API를 사용하십시오**(텍스트-이미지용 `/v1/images/generations` + 편집용 `/v1/images/edits`), 이유는 두 가지입니다:

    1. **더 안정적입니다**: Images API 채널의 업스트림 자원 공급이 더 풍부하여 호출 성공률이 더 높습니다
    2. **공식 릴레이와 호환되어 전환이 쉽습니다**: 호출 방식과 파라미터 형식이 공식 릴레이 `gpt-image-2`와 완전히 호환됩니다 — 역방향 채널에서 위험 제어 변동이 발생하면 **`model` 이름만 바꿔 공식 릴레이로 전환**하면 코드 변경이 전혀 필요 없습니다

    chat 기반 엔드포인트(`/v1/chat/completions`, **더 이상 권장하지 않습니다**)도 있으며, 다회차 반복 편집이나 온라인 이미지 URL을 직접 전달할 때만 유용합니다. 이미지 의도가 모호하면 일반 텍스트를 반환할 수 있으므로(“Generate an image:” 같은 고정 접두사를 앞에 붙여 강화하십시오). 전체 파라미터는 [-all chat-based API 참고](/en/api-capabilities/gpt-image-2-all/chat-completions) / [-vip chat-based API 참고](/en/api-capabilities/gpt-image-2-vip/chat-completions)를 보십시오.
  </Accordion>

  <Accordion title="역방향 채널에서 -all과 -vip 중 무엇을 선택해야 합니까?">
    둘 다 동일한 정액 요금(\$0.03/image)의 리버스 엔지니어링된 채널이며, 호출 형식도 같습니다(`-vip`은 추가로 `size` 고정을 지원합니다). 차이는 **속도 vs 품질 + 사이즈 고정**입니다:

    * **생성 시간**: `-all` 약 90초 — **속도가 장점입니다**; `-vip` 약 120–200초입니다. 현재는 OpenAI 업스트림 컴퓨트 변동으로 인해 출시 초기보다 느립니다
    * **품질**: `-vip`(Codex 라인) 세부 묘사가 **때때로 더 높습니다** — 서두르지 않는 쇼케이스용 이미지에 적합합니다
    * **사이즈 고정**: `-vip`은 30개의 사전 설정 `size` 값을 지원합니다(4K 포함); `-all`은 `size`를 거부합니다 — 구성이 prompt에 들어갑니다

    결정: 빠른 출력을 원하면 → `-all`; 품질 우선이거나 고정 사이즈 / 4K가 필요하면 → `-vip`; 30개 사전 설정을 넘는 사용자 지정 사이즈, `quality` 티어, 또는 마스크가 필요하면 → 공식 `gpt-image-2`. 자세한 내용은 [GPT-Image-2-VIP 개요](/ko/api-capabilities/gpt-image-2-vip/overview)를 보십시오.
  </Accordion>

  <Accordion title="고정 사이즈 / 4K가 필요합니다 — 이제 어떻게 해야 합니까?">
    `gpt-image-2-vip`부터 시작하십시오: `size` 파라미터는 2026-07-22에 복구되었으며, 4K 추가 요금 없이 정액 \$0.03/image로 \*\*30개 사전 설정 크기(10개 비율 × 1K/2K/4K)\*\*를 지원합니다. `size`은 이미지 엔드포인트에서만 동작하며 30개 사전 설정 중 하나여야 합니다.

    30개 사전 설정을 넘는 **모든 유효한 사이즈**, **`quality` 티어**(low/medium/high/auto), **마스크 인페인팅**(알파 채널 마스크), 또는 **엄격한 OpenAI API 필드 일치성**(기존 OpenAI SDK 코드에 대한 무변경 마이그레이션)이 필요할 때는 공식(`gpt-image-2`, token 기준 과금)으로 가십시오.
  </Accordion>

  <Accordion title="1.5에서 마이그레이션 중입니다 — 무엇을 선택해야 합니까?">
    * **OpenAI SDK를 계속 사용해야 하거나 OpenAI 공식과 일치해야 하거나 30개 사전 설정을 넘는 사용자 지정 사이즈가 필요함**: `gpt-image-2`(공식)을 선택하십시오. `input_fidelity`는 제거하고 나머지는 그대로 두면 됩니다(`background: transparent`는 계속 작동합니다).
    * **비용을 줄이고 빠른 출력을 원함**: `gpt-image-2-all`(역방향, 약 90초)을 선택하십시오.
    * **비용을 줄이고 품질 우선이거나 고정 사이즈 / 4K가 필요함**: `gpt-image-2-vip`(역방향, 약 120–200초, 4K를 포함한 30개 사전 설정 크기)을 선택하십시오.
  </Accordion>

  <Accordion title="페일오버용으로 여러 모델을 배포할 수 있습니까?">
    예. 일반적인 패턴은 **주력 `-all` 또는 `-vip`**(예측 가능한 비용 — 속도/품질 선호도에 따라 선택), **대체 `gpt-image-2`**(`quality` 티어, 마스크, 또는 30개 사전 설정을 넘는 사용자 지정 사이즈가 필요할 때 전환)입니다. 역방향과 공식의 응답 형식은 다르므로 비즈니스 계층에서 정규화하십시오.
  </Accordion>

  <Accordion title="R2 CDN 이미지 링크가 느립니다 — 어떻게 해야 합니까?">
    [느린 CDN 다운로드 — 어떻게 해야 하는가](/ko/faq/cdn-download-slow)를 보십시오
  </Accordion>
</AccordionGroup>

## 관련 문서

* [GPT-Image-2 개요](/ko/api-capabilities/gpt-image-2/overview) - 전체 공식 통합 문서
* [GPT-Image-2-All 개요](/ko/api-capabilities/gpt-image-2-all/overview) - 역방향 ChatGPT-web 라인(가장 빠른 출력) 전체 통합 문서
* [GPT-Image-2-VIP 개요](/ko/api-capabilities/gpt-image-2-vip/overview) - 역방향 Codex 라인(때때로 더 높은 품질, `size` 잠금) 전체 통합 문서
* [심층 분석: gpt-image-2 출시](/en/news/gpt-image-2-launch) - 공식 버전 출시
* [심층 분석: gpt-image-2-all 출시](/en/news/gpt-image-2-all-launch) - 역공학 버전 출시
* [커뮤니티: Luck GPT-Image 2 ComfyUI 노드](/ko/scenarios/ecosystem/luckgpt2-comfyui) - 멀티모델 ComfyUI 노드 팩
* [커뮤니티: APIYI GPT-Image 2 스킬](/ko/scenarios/ecosystem/apiyi-gpt-image-skills) - 멀티모델 AI 에이전트 스킬 팩
* [입금 프로모션](/ko/faq/recharge-promotions) - 충전 보너스 정책
